"""X11 backend via xdotool. Used only for automated end-to-end tests on Linux (Xvfb)."""

from __future__ import annotations

import subprocess
import threading
from pathlib import Path

from .base import InputBackend, Stopped, WindowGuard


def _xdo(*args: str) -> str:
    return subprocess.run(["xdotool", *args], check=True, capture_output=True, text=True).stdout


_BTN = {"left": "1", "middle": "2", "right": "3"}
_SCROLL = {"up": "4", "down": "5", "left": "6", "right": "7"}


class X11Input(InputBackend):
    def move(self, x: int, y: int) -> None:
        _xdo("mousemove", "--sync", str(int(x)), str(int(y)))

    def _mods(self, modifiers: list[str], down: bool) -> None:
        for m in modifiers if down else reversed(modifiers):
            _xdo("keydown" if down else "keyup", m)

    def click(self, button: str, count: int, modifiers: list[str]) -> None:
        self._mods(modifiers, True)
        try:
            _xdo("click", "--repeat", str(count), "--delay", "40", _BTN[button])
        finally:
            self._mods(modifiers, False)

    def button(self, down: bool) -> None:
        _xdo("mousedown" if down else "mouseup", "1")

    def scroll(self, direction: str, amount: int, modifiers: list[str]) -> None:
        self._mods(modifiers, True)
        try:
            _xdo("click", "--repeat", str(amount), _SCROLL[direction])
        finally:
            self._mods(modifiers, False)

    def type_text(self, text: str, stop: threading.Event) -> None:
        for i in range(0, len(text), 32):  # check Emergency Stop every 32 characters
            if stop.is_set():
                raise Stopped()
            _xdo("type", "--delay", "2", "--", text[i:i + 32])

    def key(self, combo: str, repeat: int) -> None:
        _xdo("key", "--repeat", str(repeat), "--delay", "10", combo)

    def key_hold(self, combo: str, down: bool) -> None:
        _xdo("keydown" if down else "keyup", combo)

    def cursor(self) -> tuple[int, int]:
        out = dict(line.split("=", 1) for line in _xdo("getmouselocation", "--shell").split())
        return int(out["X"]), int(out["Y"])


def _comm(window: str) -> str | None:
    try:
        pid = _xdo("getwindowpid", window).strip()
        return Path(f"/proc/{pid}/comm").read_text().strip().lower()
    except (subprocess.CalledProcessError, OSError):
        return None


class X11Guard(WindowGuard):
    def app_at(self, x: int, y: int) -> str | None:
        # Without a window manager X reports no window under the pointer, so pick the
        # smallest visible top-level window (that has an owning process) containing the point.
        best: tuple[int, str] | None = None
        for w in _xdo("search", "--onlyvisible", "--name", "").split():
            try:
                g = dict(line.split("=", 1) for line in _xdo("getwindowgeometry", "--shell", w).split())
            except subprocess.CalledProcessError:
                continue
            gx, gy, gw, gh = (int(g[k]) for k in ("X", "Y", "WIDTH", "HEIGHT"))
            if gx <= x < gx + gw and gy <= y < gy + gh and _comm(w) is not None:
                if best is None or gw * gh < best[0]:
                    best = (gw * gh, w)
        return _comm(best[1]) if best else None

    def focused_app(self) -> str | None:
        try:
            return _comm(_xdo("getwindowfocus", "-f").strip())
        except subprocess.CalledProcessError:
            return None
