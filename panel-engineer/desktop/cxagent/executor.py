"""Executes the actions the server returns — and nothing else.

Privacy guard: before any mouse action the app under the target point is checked, and
before any keyboard action the focused app is checked. Only apps the engineer approved
for this session (plus apps he allowed through an Allow/Deny prompt in this task) may be
touched. A blocked action is not executed; the agent is told why and must ask.

Batches run in order and stop at the first failure (later actions are reported as not
executed). Emergency Stop is checked before every action and inside long actions.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Any, Protocol

from .backends.base import InputBackend, Stopped, WindowGuard
from .screen import Screen

MOUSE_AT_POINT = {"left_click", "right_click", "middle_click", "double_click", "triple_click",
                  "left_click_drag", "mouse_move", "scroll"}
KEYBOARD = {"type", "key", "hold_key"}
INPUT_ACTIONS = MOUSE_AT_POINT | KEYBOARD | {"left_mouse_down", "left_mouse_up"}
CLICK_COUNT = {"left_click": 1, "right_click": 1, "middle_click": 1, "double_click": 2, "triple_click": 3}
BUTTON = {"left_click": "left", "right_click": "right", "middle_click": "middle",
          "double_click": "left", "triple_click": "left"}
# Let the UI repaint before a screenshot that follows input in the same batch
# (a correctness guard, not an artificial delay: it only applies right before a capture).
SETTLE_BEFORE_CAPTURE_S = 0.25


class UI(Protocol):
    def request_permission(self, kind: str, target: str, reason: str) -> bool: ...
    def ask(self, question: str) -> str: ...


class Blocked(Exception):
    pass


@dataclass
class Permissions:
    approved_apps: set[str]
    own_apps: set[str] = field(default_factory=set)       # the dashboard itself: never clicked by the agent
    granted_apps: set[str] = field(default_factory=set)   # allowed via Allow/Deny during this task

    def check(self, app: str | None, what: str) -> None:
        if app is None:
            raise Blocked(f"Blocked: no approved application under the {what}.")
        if app in self.own_apps:
            raise Blocked("Blocked: the agent may not operate the Cyber Xpert dashboard.")
        if app not in self.approved_apps and app not in self.granted_apps:
            raise Blocked(f"Blocked: '{app}' is not an approved application for this session. "
                          "Use request_permission (kind open_app) if it is needed.")


def _mods(text: Any) -> list[str]:
    return [m for m in str(text).split("+") if m] if text else []


class Executor:
    def __init__(self, screen: Screen, inp: InputBackend, guard: WindowGuard,
                 perms: Permissions, ui: UI, stop: threading.Event):
        self.screen, self.inp, self.guard = screen, inp, guard
        self.perms, self.ui, self.stop = perms, ui, stop

    # -- batch --------------------------------------------------------------------
    def run_batch(self, actions: list[dict[str, Any]]) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        failed = False
        did_input = False
        for a in actions:
            if failed or self.stop.is_set():
                results.append({"id": a["id"], "ok": False, "not_executed": True})
                failed = True
                continue
            try:
                if a["name"] in ("screenshot", "zoom") and did_input:
                    time.sleep(SETTLE_BEFORE_CAPTURE_S)
                res = self.run_one(a["name"], a.get("input") or {})
                did_input = did_input or a["name"] in INPUT_ACTIONS
                results.append({"id": a["id"], "ok": True, **res})
            except Stopped:
                results.append({"id": a["id"], "ok": False, "error": "Stopped by Engineer Yousef."})
                failed = True
            except Exception as e:  # noqa: BLE001 - every failure is reported to the agent
                results.append({"id": a["id"], "ok": False, "error": str(e)[:500]})
                failed = True
        return results

    # -- single action ------------------------------------------------------------
    def _point(self, inp: dict[str, Any], key: str = "coordinate") -> tuple[int, int] | None:
        c = inp.get(key)
        if c is None:
            return None
        if not (isinstance(c, (list, tuple)) and len(c) == 2):
            raise ValueError(f"{key} must be [x, y]")
        return self.screen.to_physical(float(c[0]), float(c[1]))

    def _guard_point(self, xy: tuple[int, int] | None) -> None:
        if xy is None:
            xy = self.inp.cursor()
        self.perms.check(self.guard.app_at(*xy), "mouse")

    def _guard_keyboard(self) -> None:
        self.perms.check(self.guard.focused_app(), "keyboard focus")

    def _sleep(self, seconds: float) -> None:
        if self.stop.wait(min(max(float(seconds), 0.0), 300.0)):
            raise Stopped()

    def run_one(self, name: str, inp: dict[str, Any]) -> dict[str, Any]:
        s = self.screen
        if name == "screenshot":
            return {"image_b64": s.screenshot_b64(), "image_mime": "image/jpeg"}
        if name == "zoom":
            return {"image_b64": s.zoom_b64(inp["region"]), "image_mime": "image/jpeg"}
        if name == "cursor_position":
            x, y = self.inp.cursor()
            ax, ay = (x - s.mon.left) * s.scale, (y - s.mon.top) * s.scale
            return {"output": f"[{round(ax)}, {round(ay)}]"}
        if name == "wait":
            self._sleep(inp.get("duration", 1))
            return {"output": "OK"}

        if name in CLICK_COUNT:
            xy = self._point(inp)
            self._guard_point(xy)
            if xy:
                self.inp.move(*xy)
            self.inp.click(BUTTON[name], CLICK_COUNT[name], _mods(inp.get("text")))
        elif name == "mouse_move":
            xy = self._point(inp)
            if xy is None:
                raise ValueError("coordinate is required")
            self._guard_point(xy)
            self.inp.move(*xy)
        elif name == "left_click_drag":
            start, end = self._point(inp, "start_coordinate"), self._point(inp)
            if start is None or end is None:
                raise ValueError("start_coordinate and coordinate are required")
            self._guard_point(start)
            self._guard_point(end)
            self.inp.move(*start)
            mods = _mods(inp.get("text"))
            for m in mods:
                self.inp.key_hold(m, True)
            try:
                self.inp.button(True)
                self.inp.move(*end)
                self.inp.button(False)
            finally:
                for m in reversed(mods):
                    self.inp.key_hold(m, False)
        elif name in ("left_mouse_down", "left_mouse_up"):
            self._guard_point(None)
            self.inp.button(name == "left_mouse_down")
        elif name == "scroll":
            xy = self._point(inp)
            self._guard_point(xy)
            if xy:
                self.inp.move(*xy)
            amount = max(1, min(int(inp.get("scroll_amount", 3)), 50))
            direction = inp.get("scroll_direction", "down")
            if direction not in ("up", "down", "left", "right"):
                raise ValueError("scroll_direction must be up, down, left or right")
            self.inp.scroll(direction, amount, _mods(inp.get("text")))
        elif name == "type":
            self._guard_keyboard()
            self.inp.type_text(str(inp.get("text", "")), self.stop)
        elif name == "key":
            self._guard_keyboard()
            self.inp.key(str(inp["text"]), max(1, min(int(inp.get("repeat", 1)), 100)))
        elif name == "hold_key":
            self._guard_keyboard()
            combo = str(inp["text"])
            self.inp.key_hold(combo, True)
            try:
                self._sleep(inp.get("duration", 1))
            finally:
                self.inp.key_hold(combo, False)
        # --- dashboard actions ----------------------------------------------------
        elif name == "request_permission":
            allowed = self.ui.request_permission(str(inp.get("kind", "other")),
                                                 str(inp.get("target", "")), str(inp.get("reason", "")))
            if allowed and inp.get("kind") == "open_app":
                self.perms.granted_apps.add(_app_name(str(inp.get("target", ""))))
            return {"output": "ALLOWED" if allowed else "DENIED"}
        elif name == "ask_engineer":
            return {"output": self.ui.ask(str(inp.get("question", ""))) or "(no answer)"}
        else:
            raise ValueError(f"Unsupported action: {name}")
        return {"output": "OK"}


def _app_name(target: str) -> str:
    """'Google Chrome (chrome.exe)' / 'C:\\...\\chrome.exe' / 'chrome' -> 'chrome.exe'-style key."""
    t = target.strip().lower()
    if "(" in t and t.endswith(")"):
        t = t[t.rindex("(") + 1:-1]
    t = t.replace("\\", "/").rsplit("/", 1)[-1]
    return t
