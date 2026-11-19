"""Single-screen fallback: a small always-on-top corner panel (status + Emergency Stop) while
the agent works; the full dashboard comes back when approval or a reply is needed."""

from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import QHBoxLayout, QPushButton, QVBoxLayout, QWidget

from . import theme
from .i18n import is_rtl, tr
from .widgets import StatusPill, StopButton, glow


class CompactPanel(QWidget):
    stop_clicked = Signal()
    expand_clicked = Signal()

    def __init__(self):
        super().__init__(None, Qt.Tool | Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        self.setAttribute(Qt.WA_ShowWithoutActivating)
        self.setLayoutDirection(Qt.RightToLeft if is_rtl() else Qt.LeftToRight)
        self.setStyleSheet(f"background: {theme.PANEL_SOLID}; border-radius: 14px;")
        self.setFixedSize(360, 104)
        col = QVBoxLayout(self)
        col.setContentsMargins(12, 10, 12, 10)
        row = QHBoxLayout()
        self.status = StatusPill()
        exp = QPushButton("⤢")
        exp.setObjectName("Icon")
        exp.setToolTip(tr("expand"))
        exp.clicked.connect(self.expand_clicked.emit)
        row.addWidget(self.status, 1)
        row.addWidget(exp)
        col.addLayout(row)
        stop = StopButton()
        stop.clicked.connect(self.stop_clicked.emit)
        col.addWidget(stop)
        glow(self, theme.CYAN, 30, 90)

    def set_state(self, s: str) -> None:
        self.status.set_state(s)

    def show_on(self, screen) -> None:
        g = screen.availableGeometry()
        x = g.left() + 16 if is_rtl() else g.right() - self.width() - 16
        self.move(x, g.bottom() - self.height() - 16)
        self.show()
