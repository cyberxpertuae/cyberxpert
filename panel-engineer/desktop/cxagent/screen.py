"""Screenshots of the WORK screen only (never the dashboard screen), downsized for the agent.

The agent sees a downsized image (long edge <= target). Its coordinates are in that
image's pixel space; ``Screen.to_physical`` maps them back to real desktop pixels.
"""

from __future__ import annotations

import base64
import io
import threading
from dataclasses import dataclass

import mss
from PIL import Image

JPEG_QUALITY = 85
_MSS = getattr(mss, "MSS", None) or mss.mss  # mss >= 10 renamed the class


@dataclass
class Monitor:
    left: int
    top: int
    width: int
    height: int


def list_monitors() -> list[Monitor]:
    with _MSS() as s:
        return [Monitor(m["left"], m["top"], m["width"], m["height"]) for m in s.monitors[1:]]


class Screen:
    def __init__(self, monitor_index: int = 0, target_long_edge: int = 1366):
        mons = list_monitors()
        if not mons:
            raise RuntimeError("No monitor found")
        self.mon = mons[min(monitor_index, len(mons) - 1)]
        long_edge = max(self.mon.width, self.mon.height)
        self.scale = min(1.0, target_long_edge / long_edge)
        self.width = max(1, round(self.mon.width * self.scale))
        self.height = max(1, round(self.mon.height * self.scale))
        self._tls = threading.local()  # mss handles must stay in the thread that made them

    # -- coordinates ----------------------------------------------------------
    def in_bounds(self, x: float, y: float) -> bool:
        return 0 <= x < self.width and 0 <= y < self.height

    def to_physical(self, x: float, y: float) -> tuple[int, int]:
        if not self.in_bounds(x, y):
            raise ValueError(f"Coordinate ({x}, {y}) is outside the work screen "
                             f"{self.width}x{self.height}")
        return (self.mon.left + min(int(x / self.scale), self.mon.width - 1),
                self.mon.top + min(int(y / self.scale), self.mon.height - 1))

    # -- capture ----------------------------------------------------------------
    def _grab(self) -> Image.Image:
        sct = getattr(self._tls, "sct", None)
        if sct is None:
            sct = self._tls.sct = _MSS()
        raw = sct.grab({"left": self.mon.left, "top": self.mon.top,
                              "width": self.mon.width, "height": self.mon.height})
        return Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")

    @staticmethod
    def _encode(img: Image.Image) -> str:
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=JPEG_QUALITY, optimize=False)
        return base64.b64encode(buf.getvalue()).decode()

    def screenshot_b64(self) -> str:
        img = self._grab()
        if img.size != (self.width, self.height):
            img = img.resize((self.width, self.height), Image.LANCZOS)
        return self._encode(img)

    def zoom_b64(self, region: list[float]) -> str:
        """Crop a region (agent pixel space) at full physical resolution, fit to screenshot size."""
        x0, y0, x1, y1 = region
        if not (x1 > x0 and y1 > y0) or not self.in_bounds(x0, y0) or not self.in_bounds(x1 - 1, y1 - 1):
            raise ValueError("Zoom region must be inside the work screen with x1>x0 and y1>y0")
        img = self._grab().crop((int(x0 / self.scale), int(y0 / self.scale),
                                 int(x1 / self.scale), int(y1 / self.scale)))
        # Fit the crop into the normal screenshot size (up or down), keeping the aspect ratio.
        f = min(self.width / img.width, self.height / img.height)
        if f != 1:
            img = img.resize((max(1, int(img.width * f)), max(1, int(img.height * f))), Image.LANCZOS)
        return self._encode(img)
