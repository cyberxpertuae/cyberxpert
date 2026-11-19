"""Key names used by the model (X11 keysym style: "Return", "ctrl+s", "Page_Down") -> Windows VK."""

from __future__ import annotations

_NAMED = {
    "return": 0x0D, "enter": 0x0D, "kp_enter": 0x0D, "tab": 0x09, "escape": 0x1B, "esc": 0x1B,
    "backspace": 0x08, "back_space": 0x08, "delete": 0x2E, "del": 0x2E, "insert": 0x2D,
    "space": 0x20, "home": 0x24, "end": 0x23, "page_up": 0x21, "prior": 0x21, "pageup": 0x21,
    "page_down": 0x22, "next": 0x22, "pagedown": 0x22, "left": 0x25, "up": 0x26, "right": 0x27,
    "down": 0x28, "ctrl": 0x11, "control": 0x11, "control_l": 0x11, "control_r": 0x11,
    "shift": 0x10, "shift_l": 0x10, "shift_r": 0x10, "alt": 0x12, "alt_l": 0x12, "alt_r": 0x12,
    "super": 0x5B, "super_l": 0x5B, "win": 0x5B, "meta": 0x5B, "cmd": 0x5B, "menu": 0x5D,
    "caps_lock": 0x14, "num_lock": 0x90, "print": 0x2C, "pause": 0x13, "scroll_lock": 0x91,
    "minus": 0xBD, "plus": 0xBB, "equal": 0xBB, "comma": 0xBC, "period": 0xBE, "slash": 0xBF,
    "semicolon": 0xBA, "apostrophe": 0xDE, "bracketleft": 0xDB, "bracketright": 0xDD,
    "backslash": 0xDC, "grave": 0xC0,
    "kp_add": 0x6B, "kp_subtract": 0x6D, "kp_multiply": 0x6A, "kp_divide": 0x6F,
}
_PUNCT = {"-": 0xBD, "=": 0xBB, ",": 0xBC, ".": 0xBE, "/": 0xBF, ";": 0xBA, "'": 0xDE,
          "[": 0xDB, "]": 0xDD, "\\": 0xDC, "`": 0xC0, "+": 0xBB}
for _i in range(1, 25):
    _NAMED[f"f{_i}"] = 0x6F + _i
for _i in range(10):
    _NAMED[f"kp_{_i}"] = 0x60 + _i

# Keys that need KEYEVENTF_EXTENDEDKEY.
EXTENDED = {0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x2D, 0x2E, 0x5B, 0x5D, 0x6F, 0x90}


def vk_for(name: str) -> int:
    n = name.strip()
    low = n.lower()
    if low in _NAMED:
        return _NAMED[low]
    if len(n) == 1:
        if n.isalnum() and n.isascii():
            return ord(n.upper())
        if n in _PUNCT:
            return _PUNCT[n]
    raise ValueError(f"Unknown key: {name!r}")


def parse_combo(combo: str) -> list[int]:
    # "ctrl+shift+s"; a lone "+" or a trailing "++" means the plus key.
    parts = combo.split("+")
    if combo.endswith("++"):
        parts = parts[:-2] + ["+"]
    elif combo == "+":
        parts = ["+"]
    return [vk_for(p) for p in parts if p != ""]
