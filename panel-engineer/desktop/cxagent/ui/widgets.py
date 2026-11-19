"""Reusable cyber widgets: grid background, glass panels, glow, pulsing status pill, Stop button."""

from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Property, QEasingCurve, QPropertyAnimation, QRectF, Qt
from PySide6.QtGui import QColor, QLinearGradient, QPainter, QPen, QPixmap, QRadialGradient
from PySide6.QtWidgets import (
    QFrame,
    QGraphicsDropShadowEffect,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from . import theme
from .i18n import tr

ASSETS = Path(__file__).resolve().parent / "assets"


def glow(widget: QWidget, color: str = theme.CYAN, radius: int = 26, alpha: int = 110) -> QGraphicsDropShadowEffect:
    eff = QGraphicsDropShadowEffect(widget)
    c = QColor(color)
    c.setAlpha(alpha)
    eff.setColor(c)
    eff.setBlurRadius(radius)
    eff.setOffset(0, 0)
    widget.setGraphicsEffect(eff)
    return eff


def logo_pixmap(height: int) -> QPixmap:
    pm = QPixmap(str(ASSETS / "logo_light.png"))
    return pm.scaledToHeight(height, Qt.SmoothTransformation)


class GridBackground(QWidget):
    """Near-black navy with a subtle grid and a soft cyan haze at the top."""

    def paintEvent(self, _e) -> None:  # noqa: N802
        p = QPainter(self)
        r = self.rect()
        g = QLinearGradient(0, 0, 0, r.height())
        g.setColorAt(0, QColor(theme.BG2))
        g.setColorAt(1, QColor(theme.BG))
        p.fillRect(r, g)
        haze = QRadialGradient(r.width() * 0.5, -r.height() * 0.15, r.width() * 0.7)
        haze.setColorAt(0, QColor(0, 229, 255, 34))
        haze.setColorAt(1, QColor(0, 229, 255, 0))
        p.fillRect(r, haze)
        pen = QPen(QColor(0, 229, 255, 14))
        pen.setWidth(1)
        p.setPen(pen)
        step = 32
        for x in range(0, r.width(), step):
            p.drawLine(x, 0, x, r.height())
        for y in range(0, r.height(), step):
            p.drawLine(0, y, r.width(), y)


class Glass(QFrame):
    """Glass-like panel with a title row."""

    def __init__(self, title: str = "", parent: QWidget | None = None):
        super().__init__(parent)
        self.setObjectName("Glass")
        self.lay = QVBoxLayout(self)
        self.lay.setContentsMargins(14, 12, 14, 14)
        self.lay.setSpacing(10)
        self.header = QHBoxLayout()
        self.title = QLabel(title)
        self.title.setObjectName("PanelTitle")
        self.header.addWidget(self.title)
        self.header.addStretch(1)
        if title:
            self.lay.addLayout(self.header)


class StatusPill(QWidget):
    """Status indicator. Pulses (breathing glow) while the agent works."""

    COLORS = {"Working": theme.CYAN, "Paused": theme.AMBER, "Approval needed": theme.AMBER,
              "Waiting for you": theme.AMBER, "Task complete": theme.OK, "Stopped": theme.RED,
              "Connection lost, work paused.": theme.RED, "Step limit reached": theme.AMBER, "Idle": theme.MUTED}

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self._pulse = 0.0
        self._state = "Idle"
        self.setMinimumHeight(34)
        self.label = QLabel(tr("Idle"), self)
        self.label.setStyleSheet("font-weight: 700;")
        lay = QHBoxLayout(self)
        lay.setContentsMargins(30, 4, 16, 4)
        lay.addWidget(self.label)
        self.anim = QPropertyAnimation(self, b"pulse", self)
        self.anim.setDuration(1400)
        self.anim.setStartValue(0.0)
        self.anim.setKeyValueAt(0.5, 1.0)
        self.anim.setEndValue(0.0)
        self.anim.setEasingCurve(QEasingCurve.InOutSine)
        self.anim.setLoopCount(-1)

    def get_pulse(self) -> float:
        return self._pulse

    def set_pulse(self, v: float) -> None:
        self._pulse = v
        self.update()

    pulse = Property(float, get_pulse, set_pulse)

    def set_state(self, state: str) -> None:
        self._state = state
        self.label.setText(tr(state))
        if state == "Working":
            self.anim.start()
        else:
            self.anim.stop()
            self._pulse = 0.0
        self.update()

    def state(self) -> str:
        return self._state

    def paintEvent(self, _e) -> None:  # noqa: N802
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing)
        c = QColor(self.COLORS.get(self._state, theme.CYAN))
        r = QRectF(self.rect()).adjusted(1, 1, -1, -1)
        bg = QColor(c)
        bg.setAlpha(int(22 + 40 * self._pulse))
        p.setBrush(bg)
        border = QColor(c)
        border.setAlpha(int(120 + 135 * self._pulse))
        p.setPen(QPen(border, 1.4))
        p.drawRoundedRect(r, r.height() / 2, r.height() / 2)
        # status dot (on the leading side)
        d = 10 + 4 * self._pulse
        x = 14 if self.layoutDirection() == Qt.LeftToRight else self.width() - 14
        halo = QColor(c)
        halo.setAlpha(int(70 * self._pulse))
        p.setPen(Qt.NoPen)
        p.setBrush(halo)
        p.drawEllipse(QRectF(x - d, self.height() / 2 - d, 2 * d, 2 * d))
        p.setBrush(c)
        p.drawEllipse(QRectF(x - 5, self.height() / 2 - 5, 10, 10))
        lay = self.layout()
        if self.layoutDirection() == Qt.LeftToRight:
            lay.setContentsMargins(30, 4, 16, 4)
        else:
            lay.setContentsMargins(16, 4, 30, 4)


class StopButton(QPushButton):
    """Solid red Emergency Stop. Always visible, always enabled."""

    def __init__(self, parent: QWidget | None = None):
        super().__init__("⏹  " + tr("emergency_stop"), parent)
        self.setObjectName("Stop")
        self.setCursor(Qt.PointingHandCursor)
        self.setToolTip("Ctrl+Shift+Q")
        self.setMinimumHeight(40)
        glow(self, theme.RED, 28, 150)


def neon(btn: QPushButton, primary: bool = False) -> QPushButton:
    btn.setCursor(Qt.PointingHandCursor)
    if primary:
        btn.setObjectName("Primary")
        glow(btn, theme.CYAN, 22, 120)
    return btn
