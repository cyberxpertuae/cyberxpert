"""Connects the agent Runner (worker thread) to the Qt dashboard (UI thread).

* The Runner and Executor run in a worker thread, so the dashboard never freezes.
* When the agent needs the engineer (Allow/Deny, a question, a reply), the worker emits a
  signal and waits; the dashboard answers through `answer()`. Emergency Stop releases every wait.
* A 1-second heartbeat to the server delivers remote Stop (owner / WhatsApp), WhatsApp
  approval answers, and account disable; a lost connection stops the agent at once.
"""

from __future__ import annotations

import itertools
import threading
from typing import Any

from PySide6.QtCore import QObject, Signal

from ..api import AccessDenied, Api, ApiError, ConnectionLost
from ..backends.base import InputBackend, WindowGuard
from ..executor import Executor, Permissions
from ..runner import Runner, TaskSpec
from ..screen import Screen

HEARTBEAT_S = 1.0


class _Pending:
    def __init__(self, default: Any):
        self.event = threading.Event()
        self.value = default
        self.default = default


class AgentController(QObject):
    status = Signal(str)
    log = Signal(str)
    say = Signal(str)
    steps = Signal(int, int)
    permission = Signal(int, dict)        # req_id, {kind, target, reason}
    question = Signal(int, str)           # req_id, question
    awaiting_reply = Signal(int)          # req_id
    retry_prompt = Signal(int, str)       # req_id, message
    remote_answer = Signal(int, bool)     # req_id answered from WhatsApp
    finished = Signal(str)
    access_denied = Signal(str)

    def __init__(self, api: Api, inp: InputBackend, guard: WindowGuard, own_apps: set[str], lang: str = "en"):
        super().__init__()
        self.lang = lang
        self.api = api
        self.hb_api = Api(str(api.http.base_url), timeout_s=5.0)  # separate client for the heartbeat
        self.inp, self.guard, self.own_apps = inp, guard, own_apps
        self.stop_event = threading.Event()
        self.runner: Runner | None = None
        self.thread: threading.Thread | None = None
        self._ids = itertools.count(1)
        self._pending: dict[int, _Pending] = {}
        self._approval_req: dict[int, int] = {}   # server approval id -> req_id
        self._lock = threading.Lock()

    # ------------------------------------------------------------- UI thread API
    def running(self) -> bool:
        return bool(self.thread and self.thread.is_alive())

    def start(self, spec: TaskSpec, monitor_index: int) -> None:
        if self.running():
            return
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._work, args=(spec, monitor_index), daemon=True)
        self.thread.start()

    def emergency_stop(self) -> None:
        self.stop_event.set()
        if self.runner:
            self.runner.emergency_stop()
            self.runner.resume()
        with self._lock:
            for p in self._pending.values():
                p.event.set()  # release every wait with its default (deny / empty)

    def pause(self) -> None:
        if self.runner:
            self.runner.pause()

    def resume(self) -> None:
        if self.runner:
            self.runner.resume()

    def answer(self, req_id: int, value: Any) -> None:
        with self._lock:
            p = self._pending.get(req_id)
        if p:
            p.value = value
            p.event.set()

    def session_id(self) -> int | None:
        return self.runner.session_id if self.runner else None

    # ------------------------------------------------------------- worker thread
    def _wait(self, emit, default: Any) -> tuple[int, Any]:
        req_id = next(self._ids)
        p = _Pending(default)
        with self._lock:
            self._pending[req_id] = p
        emit(req_id)
        while not p.event.wait(0.1):
            if self.stop_event.is_set():
                break
        with self._lock:
            self._pending.pop(req_id, None)
        return req_id, (p.value if not self.stop_event.is_set() else p.default)

    def _work(self, spec: TaskSpec, monitor_index: int) -> None:
        result = "error"
        hb = None
        try:
            screen = Screen(monitor_index)
            ui = _WorkerUI(self)
            perms = Permissions({a.lower() for a in spec.allowed_apps}, set(self.own_apps))
            ex = Executor(screen, self.inp, self.guard, perms, ui, self.stop_event)
            self.runner = Runner(self.api, ex, ui, self.stop_event, self.lang)
            hb = threading.Thread(target=self._heartbeat, daemon=True)
            hb.start()
            result = self.runner.run(spec)
        except ApiError as e:
            self.say.emit(str(e))
            self.status.emit("Stopped")
        except Exception as e:  # noqa: BLE001 - never crash the dashboard
            self.say.emit(f"Error: {e}")
            self.status.emit("Stopped")
        finally:
            self.stop_event.set()  # ends the heartbeat
            self.finished.emit(result)

    def _heartbeat(self) -> None:
        self.hb_api.token = self.api.token
        while not self.stop_event.wait(HEARTBEAT_S):
            sid = self.session_id()
            try:
                ctl = self.hb_api.control(sid)
            except AccessDenied as e:
                self.emergency_stop()
                self.access_denied.emit(str(e))
                return
            except ConnectionLost:
                self.emergency_stop()
                self.status.emit("Connection lost, work paused.")
                return
            except ApiError:
                continue
            if ctl.get("stop"):
                self.emergency_stop()
                self.status.emit("Stopped")
                return
            for aid, allowed in (ctl.get("decisions") or {}).items():
                req = self._approval_req.pop(int(aid), None)
                if req is not None:
                    self.answer(req, ("whatsapp", bool(allowed)))
                    self.remote_answer.emit(req, bool(allowed))


class _WorkerUI:
    """The Runner/Executor UI protocol, implemented by talking to the dashboard."""

    def __init__(self, c: AgentController):
        self.c = c

    def status(self, text: str) -> None:
        self.c.status.emit(text)

    def log(self, line: str) -> None:
        self.c.log.emit(line)

    def say(self, text: str) -> None:
        self.c.say.emit(text)

    def steps(self, step: int, max_steps: int) -> None:
        self.c.steps.emit(step, max_steps)

    def request_permission(self, kind: str, target: str, reason: str) -> bool:
        c = self.c
        sid = c.session_id()
        aid = None
        try:  # logged on the server, and answerable from WhatsApp
            aid = c.api.open_approval(sid, kind, target, reason) if sid else None
        except (ApiError, ConnectionLost, AccessDenied):
            aid = None
        holder: dict[str, int] = {}

        def emit(req_id: int) -> None:
            holder["req"] = req_id
            if aid is not None:
                c._approval_req[aid] = req_id
            c.status.emit("Approval needed")
            c.permission.emit(req_id, {"kind": kind, "target": target, "reason": reason})

        _, value = c._wait(emit, ("dashboard", False))  # default: Deny
        source, allowed = value if isinstance(value, tuple) else ("dashboard", bool(value))
        if aid is not None:
            c._approval_req.pop(aid, None)
            if source == "dashboard":
                try:
                    c.api.decide(aid, allowed)
                except Exception:  # noqa: BLE001 - logging must not block the work
                    pass
        c.status.emit("Working")
        return bool(allowed)

    def ask(self, question: str) -> str:
        self.c.status.emit("Waiting for you")
        _, value = self.c._wait(lambda r: self.c.question.emit(r, question), "")
        self.c.status.emit("Working")
        return value

    def reply(self):
        _, value = self.c._wait(lambda r: self.c.awaiting_reply.emit(r), "")
        return value

    def confirm_retry(self, message: str) -> bool:
        _, value = self.c._wait(lambda r: self.c.retry_prompt.emit(r, message), False)
        return bool(value)
