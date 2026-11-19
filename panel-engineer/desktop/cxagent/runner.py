"""Client-side loop: send screen + results, execute returned actions, repeat.

UI-independent: the Stage-1 console and the Stage-2 dashboard both drive this class.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from typing import Any, Protocol

from .api import AccessDenied, Api, ConnectionLost
from .executor import UI, Executor


class RunnerUI(UI, Protocol):
    def status(self, text: str) -> None: ...        # status bar ("Working", "Connection lost, ...")
    def log(self, line: str) -> None: ...           # live log
    def say(self, text: str) -> None: ...           # agent message in the chat area
    def confirm_retry(self, message: str) -> bool: ...  # "Continue" after a temporary error
    def reply(self) -> str | tuple[str, list[dict[str, Any]]]: ...  # next chat message ("" = end)


@dataclass
class TaskSpec:
    task: str
    project: str = ""
    project_folder: str = ""
    allowed_apps: list[str] = field(default_factory=list)
    language: str = "en"
    project_id: int | None = None
    attachments: list[dict[str, Any]] = field(default_factory=list)


class Runner:
    def __init__(self, api: Api, executor: Executor, ui: RunnerUI, stop: threading.Event, lang: str = "en"):
        self.api, self.ex, self.ui, self.stop_event = api, executor, ui, stop
        self.lang = lang
        self.session_id: int | None = None
        self.active = False  # True only while a task is being worked on
        # Pause: the current batch finishes, then nothing is sent (no API use) until resume().
        self.resume_event = threading.Event()
        self.resume_event.set()

    def pause(self) -> None:
        self.resume_event.clear()

    def resume(self) -> None:
        self.resume_event.set()

    def _wait_if_paused(self) -> None:
        if not self.resume_event.is_set():
            self.ui.status("Paused")
            while not self.resume_event.wait(0.1):
                if self.stop_event.is_set():
                    return
            self.ui.status("Working")

    # Called from the Stop button / hotkey thread. Never blocks on the agent.
    def emergency_stop(self) -> None:
        self.stop_event.set()
        sid = self.session_id
        if sid is not None and self.active:  # a finished task is never marked "stopped"
            threading.Thread(target=self._notify_stop, args=(sid,), daemon=True).start()

    def _notify_stop(self, sid: int) -> None:
        try:
            self.api.stop(sid)
        except Exception:  # noqa: BLE001 - local stop already happened
            pass

    def run(self, spec: TaskSpec) -> str:
        """Returns the final status: done | stopped | limit | error | connection_lost | denied."""
        self.stop_event.clear()
        scr = self.ex.screen
        self.active = True
        try:
            return self._run(spec, scr)
        finally:
            self.active = False

    def _run(self, spec: TaskSpec, scr) -> str:
        try:
            self.ui.status("Working")
            resp = self.api.start({
                "task": spec.task, "project": spec.project, "project_folder": spec.project_folder,
                "allowed_apps": spec.allowed_apps, "language": spec.language,
                "screen": {"width": scr.width, "height": scr.height},
                "screenshot_b64": scr.screenshot_b64(), "screenshot_mime": "image/jpeg",
                "project_id": spec.project_id, "attachments": spec.attachments,
            })
            self.session_id = resp["session_id"]
            while True:
                self._show(resp)
                if self.stop_event.is_set():
                    return self._stopped()
                st = resp["status"]
                if st == "act":
                    results = self.ex.run_batch(resp["actions"])
                    self._wait_if_paused()
                    if self.stop_event.is_set():
                        return self._stopped()
                    resp = self.api.step(self.session_id, results)
                elif st in ("waiting_engineer", "done"):
                    self.ui.status("Waiting for you" if st == "waiting_engineer" else "Task complete")
                    got = self.ui.reply()
                    text, atts = got if isinstance(got, tuple) else (got, [])
                    if not text or self.stop_event.is_set():
                        if not self.stop_event.is_set():
                            self._finish()
                        return st
                    self.ui.status("Working")
                    resp = self.api.message(self.session_id, text, atts)
                elif st == "error":
                    self.ui.status("Paused")
                    if not self.ui.confirm_retry(resp.get("message") or ""):
                        return st
                    resp = self.api.retry(self.session_id)
                else:  # stopped | limit
                    self.ui.status({"stopped": "Stopped", "limit": "Step limit reached"}.get(st, "Paused"))
                    return st
        except ConnectionLost:
            # No more clicks or typing. The server keeps the last successful step.
            self.stop_event.set()
            self.ui.status("Connection lost, work paused.")
            return "connection_lost"
        except AccessDenied as e:
            self.stop_event.set()
            self.ui.status(f"Access stopped: {e}")
            return "denied"

    def _finish(self) -> None:
        try:  # the engineer ended the conversation: the session is complete
            self.api.finish(self.session_id)
        except Exception:  # noqa: BLE001
            pass

    def _stopped(self) -> str:
        self.ui.status("Stopped")
        return "stopped"

    def _show(self, resp: dict[str, Any]) -> None:
        steps = getattr(self.ui, "steps", None)
        if steps:
            steps(resp.get("step", 0), resp.get("max_steps", 0))
        for line in resp.get("progress", []):
            self.ui.log(line)
        if resp.get("message"):
            self.ui.say(resp["message"])
        for a in resp.get("actions", []):
            self.ui.log(describe(a, self.lang))


_AR = {"type": "كتابة", "key": "ضغط", "screenshot": "ينظر إلى الشاشة", "zoom": "ينظر عن قرب",
       "left_click": "نقرة", "double_click": "نقرة مزدوجة", "triple_click": "نقرة ثلاثية",
       "right_click": "نقرة يمين", "middle_click": "نقرة وسطى", "scroll": "تمرير",
       "left_click_drag": "سحب", "mouse_move": "تحريك الماوس", "wait": "انتظار",
       "request_permission": "طلب إذن", "ask_engineer": "سؤال للمهندس", "hold_key": "ضغط مطوّل",
       "cursor_position": "موقع المؤشر", "left_mouse_down": "ضغط الزر", "left_mouse_up": "إفلات الزر"}


def describe(a: dict[str, Any], lang: str = "en") -> str:
    """Plain-words live-log line for an action (Arabic or English; technical values stay as-is)."""
    n, i = a["name"], a.get("input") or {}
    if lang == "ar":
        base = _AR.get(n, n)

        def ltr(v: object) -> str:  # technical values (keys, coordinates, typed text) stay left-to-right
            return f"\u2066{v}\u2069"

        if n == "type":
            t = str(i.get("text", ""))
            return f'{base} {ltr(chr(34) + t[:40] + ("…" if len(t) > 40 else "") + chr(34))}'
        if n == "key":
            return f"{base} {ltr(i.get('text'))}"
        if i.get("coordinate"):
            return f"{base} {ltr(i['coordinate'])}"
        return base
    if n == "type":
        t = str(i.get("text", ""))
        return f'Typing "{t[:40]}{"…" if len(t) > 40 else ""}"'
    if n == "key":
        return f"Pressing {i.get('text')}" + (f" ×{i['repeat']}" if i.get("repeat", 1) > 1 else "")
    if n in ("screenshot", "zoom"):
        return "Looking at the screen" if n == "screenshot" else "Looking closer"
    if n.endswith("click"):
        return n.replace("_", " ").capitalize() + (f" at {i['coordinate']}" if i.get("coordinate") else "")
    return n.replace("_", " ").capitalize()
