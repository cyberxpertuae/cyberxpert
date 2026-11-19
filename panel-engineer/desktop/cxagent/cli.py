"""Stage-1 console front-end (the dark dashboard replaces it in Stage 2).

    python -m cxagent --server https://agent.example.com --user yousef \
        --apps notepad.exe --project "Notepad test" "Open Notepad's text area and type ..."

Emergency Stop: Ctrl+Shift+Q (global, Windows) or Ctrl+C in this console.
"""

from __future__ import annotations

import argparse
import getpass
import os
import sys
import threading

from .api import Api
from .executor import Executor, Permissions
from .platform import backends, device_id, own_process_names, start_stop_hotkey
from .runner import Runner, TaskSpec
from .screen import Screen


class ConsoleUI:
    def __init__(self, auto: dict[str, str] | None = None):
        self.auto = auto or {}  # test hooks: {"permission": "allow|deny", "answer": "...", "reply": ""}

    def status(self, text: str) -> None:
        print(f"[status] {text}", flush=True)

    def log(self, line: str) -> None:
        print(f"  · {line}", flush=True)

    def say(self, text: str) -> None:
        print(f"\nAgent: {text}\n", flush=True)

    def request_permission(self, kind: str, target: str, reason: str) -> bool:
        print(f"\n[PERMISSION] {kind}: {target}\n  Reason: {reason}", flush=True)
        if "permission" in self.auto:
            ans = self.auto["permission"]
            print(f"  -> {ans} (auto)")
        else:
            ans = input("  Allow or Deny? [a/d]: ").strip().lower()
        return ans.startswith("a")

    def ask(self, question: str) -> str:
        print(f"\n[QUESTION] {question}", flush=True)
        return self.auto["answer"] if "answer" in self.auto else input("  Your answer: ")

    def reply(self) -> str:
        if "reply" in self.auto:
            return self.auto["reply"]
        return input("Your reply (Enter to finish): ").strip()


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="cxagent")
    p.add_argument("--server", default=os.environ.get("CX_SERVER", "http://127.0.0.1:8000"))
    p.add_argument("--user", default=os.environ.get("CX_USER", ""))
    p.add_argument("--project", default="")
    p.add_argument("--folder", default="")
    p.add_argument("--apps", default="notepad.exe", help="comma-separated approved process names")
    p.add_argument("--monitor", type=int, default=0, help="work screen index (0 = first)")
    p.add_argument("--lang", choices=["en", "ar"], default="en")
    p.add_argument("--auto-permission", choices=["allow", "deny"], help="testing only")
    p.add_argument("--auto-answer", help="testing only")
    p.add_argument("--no-reply", action="store_true", help="finish after the first result")
    p.add_argument("task")
    a = p.parse_args(argv)

    auto: dict[str, str] = {}
    if a.auto_permission:
        auto["permission"] = a.auto_permission
    if a.auto_answer is not None:
        auto["answer"] = a.auto_answer
    if a.no_reply:
        auto["reply"] = ""
    ui = ConsoleUI(auto)

    api = Api(a.server)
    password = os.environ.get("CX_PASSWORD") or getpass.getpass("Password: ")
    api.login(a.user or input("Username: "), password, device_id())

    apps = [x.strip().lower() for x in a.apps.split(",") if x.strip()]
    stop = threading.Event()
    inp, guard = backends()
    screen = Screen(a.monitor)
    ex = Executor(screen, inp, guard, Permissions(set(apps), own_process_names()), ui, stop)
    runner = Runner(api, ex, ui, stop)
    start_stop_hotkey(runner.emergency_stop)
    try:
        result = runner.run(TaskSpec(a.task, a.project, a.folder, apps, a.lang))
    except KeyboardInterrupt:
        runner.emergency_stop()
        result = "stopped"
    print(f"[result] {result}")
    return 0 if result in ("done", "waiting_engineer") else 1


if __name__ == "__main__":
    sys.exit(main())
