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
    def reply(self) -> str: ...                     # engineer's next chat message ("" = end)


@dataclass
class TaskSpec:
    task: str
    project: str = ""
    project_folder: str = ""
    allowed_apps: list[str] = field(default_factory=list)
    language: str = "en"


class Runner:
    def __init__(self, api: Api, executor: Executor, ui: RunnerUI, stop: threading.Event):
        self.api, self.ex, self.ui, self.stop_event = api, executor, ui, stop
        self.session_id: int | None = None

    # Called from the Stop button / hotkey thread. Never blocks on the agent.
    def emergency_stop(self) -> None:
        self.stop_event.set()
        sid = self.session_id
        if sid is not None:
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
        try:
            self.ui.status("Working")
            resp = self.api.start({
                "task": spec.task, "project": spec.project, "project_folder": spec.project_folder,
                "allowed_apps": spec.allowed_apps, "language": spec.language,
                "screen": {"width": scr.width, "height": scr.height},
                "screenshot_b64": scr.screenshot_b64(), "screenshot_mime": "image/jpeg",
            })
            self.session_id = resp["session_id"]
            while True:
                self._show(resp)
                if self.stop_event.is_set():
                    return self._stopped()
                st = resp["status"]
                if st == "act":
                    results = self.ex.run_batch(resp["actions"])
                    if self.stop_event.is_set():
                        return self._stopped()
                    resp = self.api.step(self.session_id, results)
                elif st in ("waiting_engineer", "done"):
                    self.ui.status("Waiting for you" if st == "waiting_engineer" else "Task complete")
                    text = self.ui.reply()
                    if not text:
                        return st
                    self.ui.status("Working")
                    resp = self.api.message(self.session_id, text)
                else:  # stopped | limit | error
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

    def _stopped(self) -> str:
        self.ui.status("Stopped")
        return "stopped"

    def _show(self, resp: dict[str, Any]) -> None:
        for line in resp.get("progress", []):
            self.ui.log(line)
        if resp.get("message"):
            self.ui.say(resp["message"])
        for a in resp.get("actions", []):
            self.ui.log(describe(a))


def describe(a: dict[str, Any]) -> str:
    """Plain-words live-log line for an action."""
    n, i = a["name"], a.get("input") or {}
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
