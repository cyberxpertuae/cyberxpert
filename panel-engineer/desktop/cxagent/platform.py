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
