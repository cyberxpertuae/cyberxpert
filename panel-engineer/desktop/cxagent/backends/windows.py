"""Windows input + window guard via user32 (ctypes). No third-party automation library.

* SendInput with KEYEVENTF_UNICODE types any text, Arabic included, regardless of the
  active keyboard layout.
* The process is made per-monitor DPI aware so screenshot pixels == cursor pixels.
"""

from __future__ import annotations

import ctypes
import os
import threading
from ctypes import wintypes

from .base import InputBackend, Stopped, WindowGuard

user32 = ctypes.WinDLL("user32", use_last_error=True)
kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)


def make_dpi_aware() -> None:
    try:  # Windows 10+: per-monitor v2
        user32.SetProcessDpiAwarenessContext(ctypes.c_void_p(-4))
    except Exception:
        try:
            ctypes.WinDLL("shcore").SetProcessDpiAwareness(2)
        except Exception:
            user32.SetProcessDPIAware()


# ---- SendInput structures -------------------------------------------------
ULONG_PTR = ctypes.c_size_t
INPUT_MOUSE, INPUT_KEYBOARD = 0, 1
KEYEVENTF_KEYUP, KEYEVENTF_UNICODE, KEYEVENTF_EXTENDEDKEY = 0x0002, 0x0004, 0x0001
MOUSEEVENTF = {
    ("left", True): 0x0002, ("left", False): 0x0004,
    ("right", True): 0x0008, ("right", False): 0x0010,
    ("middle", True): 0x0020, ("middle", False): 0x0040,
}
MOUSEEVENTF_WHEEL, MOUSEEVENTF_HWHEEL, WHEEL_DELTA = 0x0800, 0x01000, 120


class MOUSEINPUT(ctypes.Structure):
    _fields_ = [("dx", wintypes.LONG), ("dy", wintypes.LONG), ("mouseData", wintypes.DWORD),
                ("dwFlags", wintypes.DWORD), ("time", wintypes.DWORD), ("dwExtraInfo", ULONG_PTR)]


class KEYBDINPUT(ctypes.Structure):
    _fields_ = [("wVk", wintypes.WORD), ("wScan", wintypes.WORD), ("dwFlags", wintypes.DWORD),
                ("time", wintypes.DWORD), ("dwExtraInfo", ULONG_PTR)]


class HARDWAREINPUT(ctypes.Structure):
    _fields_ = [("uMsg", wintypes.DWORD), ("wParamL", wintypes.WORD), ("wParamH", wintypes.WORD)]


class _U(ctypes.Union):
    _fields_ = [("mi", MOUSEINPUT), ("ki", KEYBDINPUT), ("hi", HARDWAREINPUT)]


class INPUT(ctypes.Structure):
    _anonymous_ = ("u",)
    _fields_ = [("type", wintypes.DWORD), ("u", _U)]


def _send(*inputs: INPUT) -> None:
    arr = (INPUT * len(inputs))(*inputs)
    if user32.SendInput(len(inputs), arr, ctypes.sizeof(INPUT)) != len(inputs):
        raise OSError("SendInput was blocked (is a higher-privilege window focused?)")


def _mouse(flags: int, data: int = 0) -> INPUT:
    i = INPUT(type=INPUT_MOUSE)
    i.mi = MOUSEINPUT(0, 0, data & 0xFFFFFFFF, flags, 0, 0)
    return i


def _vk(vk: int, up: bool) -> INPUT:
    from .keys import EXTENDED

    i = INPUT(type=INPUT_KEYBOARD)
    flags = (KEYEVENTF_KEYUP if up else 0) | (KEYEVENTF_EXTENDEDKEY if vk in EXTENDED else 0)
    i.ki = KEYBDINPUT(vk, 0, flags, 0, 0)
    return i


def _uni(code_unit: int, up: bool) -> INPUT:
    i = INPUT(type=INPUT_KEYBOARD)
    i.ki = KEYBDINPUT(0, code_unit, KEYEVENTF_UNICODE | (KEYEVENTF_KEYUP if up else 0), 0, 0)
    return i


class WindowsInput(InputBackend):
    def move(self, x: int, y: int) -> None:
        if not user32.SetCursorPos(int(x), int(y)):
            raise OSError("SetCursorPos failed")

    def _mods(self, modifiers: list[str], up: bool) -> list[INPUT]:
        from .keys import vk_for

        vks = [vk_for(m) for m in modifiers]
        return [_vk(v, up) for v in (reversed(vks) if up else vks)]

    def click(self, button: str, count: int, modifiers: list[str]) -> None:
        seq = self._mods(modifiers, False)
        for _ in range(count):
            seq += [_mouse(MOUSEEVENTF[(button, True)]), _mouse(MOUSEEVENTF[(button, False)])]
        seq += self._mods(modifiers, True)
        _send(*seq)

    def button(self, down: bool) -> None:
        _send(_mouse(MOUSEEVENTF[("left", down)]))

    def scroll(self, direction: str, amount: int, modifiers: list[str]) -> None:
        if direction in ("up", "down"):
            ev = _mouse(MOUSEEVENTF_WHEEL, WHEEL_DELTA * amount * (1 if direction == "up" else -1))
        else:
            ev = _mouse(MOUSEEVENTF_HWHEEL, WHEEL_DELTA * amount * (1 if direction == "right" else -1))
        _send(*self._mods(modifiers, False), ev, *self._mods(modifiers, True))

    def type_text(self, text: str, stop: threading.Event) -> None:
        from .keys import vk_for

        chunk: list[INPUT] = []

        def flush() -> None:
            if chunk:
                _send(*chunk)
                chunk.clear()
            if stop.is_set():
                raise Stopped()

        for ch in text.replace("\r\n", "\n"):
            if ch == "\n":
                chunk += [_vk(vk_for("Return"), False), _vk(vk_for("Return"), True)]
            elif ch == "\t":
                chunk += [_vk(vk_for("Tab"), False), _vk(vk_for("Tab"), True)]
            else:
                data = ch.encode("utf-16-le")
                for k in range(0, len(data), 2):  # surrogate pairs for chars > U+FFFF
                    cu = int.from_bytes(data[k:k + 2], "little")
                    chunk += [_uni(cu, False), _uni(cu, True)]
            if len(chunk) >= 64:  # check Emergency Stop every ~32 characters
                flush()
        flush()

    def key(self, combo: str, repeat: int) -> None:
        from .keys import parse_combo

        vks = parse_combo(combo)
        seq: list[INPUT] = []
        for _ in range(repeat):
            seq += [_vk(v, False) for v in vks] + [_vk(v, True) for v in reversed(vks)]
        _send(*seq)

    def key_hold(self, combo: str, down: bool) -> None:
        from .keys import parse_combo

        vks = parse_combo(combo)
        _send(*[_vk(v, not down) for v in (vks if down else reversed(vks))])

    def cursor(self) -> tuple[int, int]:
        pt = wintypes.POINT()
        user32.GetCursorPos(ctypes.byref(pt))
        return pt.x, pt.y


# ---- window guard -----------------------------------------------------------
GA_ROOT = 2
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
user32.WindowFromPoint.argtypes = [wintypes.POINT]
user32.WindowFromPoint.restype = wintypes.HWND
user32.GetAncestor.restype = wintypes.HWND
user32.GetForegroundWindow.restype = wintypes.HWND


def _process_name(hwnd) -> str | None:
    if not hwnd:
        return None
    pid = wintypes.DWORD()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    h = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid.value)
    if not h:
        return None
    try:
        buf = ctypes.create_unicode_buffer(1024)
        size = wintypes.DWORD(len(buf))
        if not kernel32.QueryFullProcessImageNameW(h, 0, buf, ctypes.byref(size)):
            return None
        return os.path.basename(buf.value).lower()
    finally:
        kernel32.CloseHandle(h)


class WindowsGuard(WindowGuard):
    def app_at(self, x: int, y: int) -> str | None:
        hwnd = user32.WindowFromPoint(wintypes.POINT(int(x), int(y)))
        return _process_name(user32.GetAncestor(hwnd, GA_ROOT) if hwnd else None)

    def focused_app(self) -> str | None:
        return _process_name(user32.GetForegroundWindow())
