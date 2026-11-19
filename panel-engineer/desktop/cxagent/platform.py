"""Platform glue: device id, backends, and the global Emergency Stop hotkey."""

from __future__ import annotations

import hashlib
import sys
import threading
from pathlib import Path
from typing import Callable

from .backends.base import InputBackend, WindowGuard

IS_WINDOWS = sys.platform == "win32"


def device_id() -> str:
    """Stable, non-reversible id of this computer (used for device binding)."""
    raw = ""
    if IS_WINDOWS:
        import winreg

        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography",
                            0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY) as k:
            raw = winreg.QueryValueEx(k, "MachineGuid")[0]
    else:
        for p in ("/etc/machine-id", "/var/lib/dbus/machine-id"):
            if Path(p).is_file():
                raw = Path(p).read_text().strip()
                break
    if not raw:
        raise RuntimeError("Cannot determine device id")
    return hashlib.sha256(f"cyberxpert-panel-engineer:{raw}".encode()).hexdigest()


def backends() -> tuple[InputBackend, WindowGuard]:
    if IS_WINDOWS:
        from .backends.windows import WindowsGuard, WindowsInput, make_dpi_aware

        make_dpi_aware()
        return WindowsInput(), WindowsGuard()
    from .backends.x11 import X11Guard, X11Input

    return X11Input(), X11Guard()


def own_process_names() -> set[str]:
    """The dashboard's own executable: the agent may never click it."""
    return {Path(sys.executable).name.lower()} if getattr(sys, "frozen", False) else set()


def start_stop_hotkey(on_stop: Callable[[], None]) -> None:
    """Global Ctrl+Shift+Q -> Emergency Stop (Windows). Works even when the app is not focused."""
    if not IS_WINDOWS:
        return
    import ctypes
    from ctypes import wintypes

    def loop() -> None:
        user32 = ctypes.WinDLL("user32", use_last_error=True)
        MOD_CONTROL, MOD_SHIFT, MOD_NOREPEAT, WM_HOTKEY = 0x2, 0x4, 0x4000, 0x0312
        if not user32.RegisterHotKey(None, 1, MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT, ord("Q")):
            return
        msg = wintypes.MSG()
        while user32.GetMessageW(ctypes.byref(msg), None, 0, 0) != 0:
            if msg.message == WM_HOTKEY:
                on_stop()

    threading.Thread(target=loop, name="stop-hotkey", daemon=True).start()


def running_apps() -> list[tuple[str, str]]:
    """(process name, window title) of visible windows, to pick approved apps without
    guessing executable names."""
    out: dict[str, str] = {}
    if IS_WINDOWS:
        import ctypes
        from ctypes import wintypes

        from .backends.windows import _process_name

        user32 = ctypes.WinDLL("user32", use_last_error=True)
        proc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

        def cb(hwnd, _):
            if user32.IsWindowVisible(hwnd) and user32.GetWindowTextLengthW(hwnd) > 0:
                buf = ctypes.create_unicode_buffer(256)
                user32.GetWindowTextW(hwnd, buf, 256)
                name = _process_name(hwnd)
                if name:
                    out.setdefault(name, buf.value)
            return True

        user32.EnumWindows(proc(cb), 0)
    else:
        import subprocess

        try:
            ids = subprocess.run(["xdotool", "search", "--onlyvisible", "--name", ""],
                                 capture_output=True, text=True, timeout=5).stdout.split()
        except (OSError, subprocess.SubprocessError):
            ids = []
        from .backends.x11 import _comm

        for w in ids:
            name = _comm(w)
            if name:
                title = subprocess.run(["xdotool", "getwindowname", w], capture_output=True, text=True).stdout.strip()
                out.setdefault(name, title)
    own = own_process_names()
    return sorted((k, v) for k, v in out.items() if k not in own)


def voice_typing() -> bool:
    """Open Windows voice typing (Win+H) in the focused text box. Supports Arabic on Windows 11."""
    if not IS_WINDOWS:
        return False
    from .backends.windows import WindowsInput

    WindowsInput().key("super+h", 1)
    return True
