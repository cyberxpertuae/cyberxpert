"""Input/guard backend interface. Windows is the product; X11 exists for automated tests."""

from __future__ import annotations

import threading
from abc import ABC, abstractmethod


class Stopped(Exception):
    """Raised inside a long action (typing, waiting) when Emergency Stop is pressed."""


class InputBackend(ABC):
    """Physical-pixel coordinates in the virtual desktop. All methods must be fast."""

    @abstractmethod
    def move(self, x: int, y: int) -> None: ...

    @abstractmethod
    def click(self, button: str, count: int, modifiers: list[str]) -> None:
        """Click at the current cursor position. button: left|right|middle."""

    @abstractmethod
    def button(self, down: bool) -> None:
        """Press or release the left button."""

    @abstractmethod
    def scroll(self, direction: str, amount: int, modifiers: list[str]) -> None: ...

    @abstractmethod
    def type_text(self, text: str, stop: threading.Event) -> None: ...

    @abstractmethod
    def key(self, combo: str, repeat: int) -> None: ...

    @abstractmethod
    def key_hold(self, combo: str, down: bool) -> None: ...

    @abstractmethod
    def cursor(self) -> tuple[int, int]: ...


class WindowGuard(ABC):
    """Tells which application owns a point / the keyboard focus (process name, lower case)."""

    @abstractmethod
    def app_at(self, x: int, y: int) -> str | None: ...

    @abstractmethod
    def focused_app(self) -> str | None: ...
