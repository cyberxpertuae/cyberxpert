"""Executor unit tests with fake input/guard backends (no display needed)."""

from __future__ import annotations

import threading

import pytest

from cxagent.backends.base import InputBackend, WindowGuard
from cxagent.backends.keys import parse_combo, vk_for
from cxagent.executor import Executor, Permissions


class FakeScreen:
    width, height, scale = 1366, 768, 0.5

    class mon:  # noqa: N801
        left, top, width, height = 1920, 0, 2732, 1536

    def in_bounds(self, x, y):
        return 0 <= x < self.width and 0 <= y < self.height

    def to_physical(self, x, y):
        if not self.in_bounds(x, y):
            raise ValueError("outside the work screen")
        return int(self.mon.left + x / self.scale), int(self.mon.top + y / self.scale)

    def screenshot_b64(self):
        return "IMG"


class FakeInput(InputBackend):
    def __init__(self):
        self.log = []
        self.pos = (2000, 100)

    def move(self, x, y):
        self.pos = (x, y)
        self.log.append(("move", x, y))

    def click(self, button, count, modifiers):
        self.log.append(("click", button, count, tuple(modifiers)))

    def button(self, down):
        self.log.append(("button", down))

    def scroll(self, direction, amount, modifiers):
        self.log.append(("scroll", direction, amount))

    def type_text(self, text, stop):
        self.log.append(("type", text))

    def key(self, combo, repeat):
        self.log.append(("key", combo, repeat))

    def key_hold(self, combo, down):
        self.log.append(("hold", combo, down))

    def cursor(self):
        return self.pos


class FakeGuard(WindowGuard):
    def __init__(self, at="skycad.exe", focus="skycad.exe"):
        self.at, self.focus = at, focus

    def app_at(self, x, y):
        return self.at

    def focused_app(self):
        return self.focus


class FakeUI:
    def __init__(self, allow=True):
        self.allow, self.asked = allow, []

    def request_permission(self, kind, target, reason):
        self.asked.append((kind, target))
        return self.allow

    def ask(self, q):
        return "42"


def ex(guard=None, ui=None, stop=None):
    inp = FakeInput()
    e = Executor(FakeScreen(), inp, guard or FakeGuard(), Permissions({"skycad.exe"}, {"cxagent.exe"}),
                 ui or FakeUI(), stop or threading.Event())
    return e, inp


def A(i, name, **inp):
    return {"id": i, "name": name, "input": inp}


def test_coordinates_scaled_to_work_monitor():
    e, inp = ex()
    r = e.run_batch([A("1", "double_click", coordinate=[100, 50], text="ctrl")])
    assert r[0]["ok"] and ("move", 2120, 100) in inp.log and ("click", "left", 2, ("ctrl",)) in inp.log


def test_blocked_app_stops_batch():
    e, inp = ex(FakeGuard(at="chrome.exe"))
    r = e.run_batch([A("1", "left_click", coordinate=[10, 10]), A("2", "type", text="x")])
    assert not r[0]["ok"] and "not an approved application" in r[0]["error"]
    assert r[1] == {"id": "2", "ok": False, "not_executed": True}
    assert inp.log == []  # nothing was clicked or typed


def test_dashboard_never_operated():
    e, _ = ex(FakeGuard(focus="cxagent.exe"))
    r = e.run_batch([A("1", "key", text="Return")])
    assert "dashboard" in r[0]["error"]


def test_outside_work_screen_rejected():
    e, inp = ex()
    r = e.run_batch([A("1", "left_click", coordinate=[5000, 10])])
    assert not r[0]["ok"] and "outside" in r[0]["error"] and inp.log == []


def test_permission_grant_scoped_to_named_app():
    ui = FakeUI(allow=True)
    e, _ = ex(FakeGuard(at="chrome.exe"), ui)
    r = e.run_batch([A("1", "request_permission", kind="open_app", target="Google Chrome (chrome.exe)", reason="docs")])
    assert r[0]["output"] == "ALLOWED" and "chrome.exe" in e.perms.granted_apps
    assert e.run_batch([A("2", "left_click", coordinate=[1, 1])])[0]["ok"]
    denied = ex(FakeGuard(at="outlook.exe"), FakeUI(allow=False))[0]
    assert denied.run_batch([A("3", "request_permission", kind="email", target="outlook.exe",
                                reason="x")])[0]["output"] == "DENIED"


def test_stop_flag_prevents_everything():
    stop = threading.Event()
    stop.set()
    e, inp = ex(stop=stop)
    r = e.run_batch([A("1", "left_click", coordinate=[1, 1])])
    assert r[0]["not_executed"] and inp.log == []


def test_keys():
    assert parse_combo("ctrl+shift+s") == [0x11, 0x10, ord("S")]
    assert parse_combo("Return") == [0x0D] and vk_for("Page_Down") == 0x22 and vk_for("F5") == 0x74
    assert parse_combo("ctrl++") == [0x11, 0xBB]
    with pytest.raises(ValueError):
        vk_for("NoSuchKey")
