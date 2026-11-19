"""Engineer workspace modules: projects, chat, live log, output files."""

from __future__ import annotations

import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any

from PySide6.QtCore import QDateTime, QEvent, QFileInfo, Qt, QTimer, QUrl, Signal
from PySide6.QtGui import QDesktopServices, QKeyEvent
from PySide6.QtWidgets import (
    QFileDialog,
    QFrame,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QPlainTextEdit,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)

from ... import attachments as att
from .. import theme
from ..dialogs import ViewerDialog, list_item
from ..i18n import is_rtl, tr
from ..widgets import Glass, neon
from . import Module


# ----------------------------------------------------------------------------- projects
class ProjectsModule(Module):
    MODULE_ID, AREA = "projects", "left"
    selected = Signal(dict)
    new_requested = Signal()
    edit_requested = Signal(dict)

    def __init__(self):
        super().__init__()
        self.projects: list[dict[str, Any]] = []
        g = Glass(tr("projects"))
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(g)
        self.list = QListWidget()
        self.list.itemSelectionChanged.connect(self._sel)
        g.lay.addWidget(self.list, 1)
        new = neon(QPushButton(tr("new_project")))
        new.clicked.connect(self.new_requested.emit)
        self.edit = QPushButton(tr("edit"))
        self.edit.clicked.connect(lambda: self.current() and self.edit_requested.emit(self.current()))
        row = QHBoxLayout()
        row.addWidget(new, 1)
        row.addWidget(self.edit)
        g.lay.addLayout(row)

    def set_projects(self, projects: list[dict[str, Any]], select_id: int | None = None) -> None:
        self.projects = projects
        self.list.blockSignals(True)
        self.list.clear()
        for p in projects:
            self.list.addItem(list_item(f"{p['name']}\n{tr('stage')}: {p['stage']}", p))
        self.list.blockSignals(False)
        idx = next((i for i, p in enumerate(projects) if p["id"] == select_id), 0 if projects else -1)
        if idx >= 0:
            self.list.setCurrentRow(idx)

    def current(self) -> dict[str, Any] | None:
        it = self.list.currentItem()
        return it.data(Qt.UserRole) if it else None

    def _sel(self) -> None:
        p = self.current()
        if p:
            self.selected.emit(p)


# ----------------------------------------------------------------------------- chat
class _Input(QPlainTextEdit):
    send = Signal()

    def keyPressEvent(self, e: QKeyEvent) -> None:  # noqa: N802
        if e.key() in (Qt.Key_Return, Qt.Key_Enter) and not e.modifiers() & Qt.ShiftModifier:
            self.send.emit()
            return
        super().keyPressEvent(e)


class ChatModule(Module):
    """Agent chat: text, voice (Windows voice typing) and attached files."""

    MODULE_ID, AREA = "chat", "center"
    submitted = Signal(str, list)   # text, attachments
    pause_clicked = Signal()
    stop_clicked = Signal()
    new_task_clicked = Signal()
    voice_clicked = Signal()

    def __init__(self):
        super().__init__()
        g = Glass(tr("chat"))
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(g)
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        self.body = QWidget()
        self.body.setStyleSheet("background: transparent;")
        self.col = QVBoxLayout(self.body)
        self.col.setSpacing(10)
        self.col.addStretch(1)
        self.scroll.setWidget(self.body)
        self.scroll.viewport().setStyleSheet("background: transparent;")
        g.lay.addWidget(self.scroll, 1)

        self.chips = QHBoxLayout()
        g.lay.addLayout(self.chips)
        self.files: list[dict[str, Any]] = []

        row = QHBoxLayout()
        self.attach = QPushButton("📎")
        self.attach.setObjectName("Icon")
        self.attach.setToolTip(tr("attach"))
        self.attach.clicked.connect(self._attach)
        self.mic = QPushButton("🎤")
        self.mic.setObjectName("Icon")
        self.mic.setToolTip(tr("voice"))
        self.mic.clicked.connect(self._voice)
        self.input = _Input()
        self.input.setPlaceholderText(tr("type_task"))
        self.input.setFixedHeight(64)
        self.input.send.connect(self._submit)
        self.send_btn = neon(QPushButton(tr("start")), primary=True)
        self.send_btn.setMinimumHeight(44)
        self.send_btn.clicked.connect(self._submit)
        for w in (self.attach, self.mic):
            w.setMinimumHeight(44)
        row.addWidget(self.attach)
        row.addWidget(self.mic)
        row.addWidget(self.input, 1)
        row.addWidget(self.send_btn)
        g.lay.addLayout(row)

        ctl = QHBoxLayout()
        self.pause_btn = QPushButton("⏸  " + tr("pause"))
        self.pause_btn.clicked.connect(self.pause_clicked.emit)
        self.stop_btn = QPushButton("⏹  " + tr("stop"))
        self.stop_btn.setObjectName("Danger")
        self.stop_btn.clicked.connect(self.stop_clicked.emit)
        self.new_btn = QPushButton("＋  " + tr("new_task"))
        self.new_btn.clicked.connect(self.new_task_clicked.emit)
        for b in (self.pause_btn, self.stop_btn, self.new_btn):
            b.setCursor(Qt.PointingHandCursor)
            ctl.addWidget(b)
        ctl.addStretch(1)
        g.lay.addLayout(ctl)
        self.set_mode("idle")

    # -- state ---------------------------------------------------------------------
    def set_mode(self, mode: str, paused: bool = False) -> None:
        """idle | running | reply (agent waits for the engineer)."""
        self.mode = mode
        self.send_btn.setText(tr("start") if mode == "idle" else tr("send"))
        self.send_btn.setEnabled(mode in ("idle", "reply"))
        self.pause_btn.setEnabled(mode == "running")
        self.pause_btn.setText(("▶  " + tr("continue")) if paused else ("⏸  " + tr("pause")))
        self.stop_btn.setEnabled(mode != "idle")
        self.new_btn.setEnabled(mode == "reply")

    # -- bubbles -------------------------------------------------------------------
    def clear(self) -> None:
        while self.col.count() > 1:
            w = self.col.takeAt(0).widget()
            if w:
                w.deleteLater()

    def add(self, role: str, text: str, files: list[str] | None = None, highlight: bool = False) -> None:
        bubble = QLabel()
        bubble.setWordWrap(True)
        bubble.setTextInteractionFlags(Qt.TextSelectableByMouse)
        bubble.setTextFormat(Qt.PlainText)
        who = {"engineer": tr("you"), "agent": tr("agent"), "question": tr("question")}.get(role, "")
        body = text + (f"\n📎 {', '.join(files)}" if files else "")
        bubble.setText(f"{who}\n{body}" if who else body)
        mine = role == "engineer"
        color = theme.AMBER if highlight else (theme.CYAN_DIM if mine else theme.BORDER)
        bg = "rgba(0,229,255,0.10)" if mine else "rgba(255,255,255,0.03)"
        bubble.setStyleSheet(f"background: {bg}; border: 1px solid {color}; border-radius: 12px; padding: 10px 12px;")
        bubble.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Minimum)
        bubble.setMaximumWidth(720)
        wrap = QHBoxLayout()
        holder = QWidget()
        holder.setLayout(wrap)
        wrap.setContentsMargins(0, 0, 0, 0)
        if mine:
            wrap.addStretch(1)
            wrap.addWidget(bubble)
        else:
            wrap.addWidget(bubble)
            wrap.addStretch(1)
        self.col.insertWidget(self.col.count() - 1, holder)
        QTimer.singleShot(30, lambda: self.scroll.verticalScrollBar().setValue(self.scroll.verticalScrollBar().maximum()))

    # -- input ---------------------------------------------------------------------
    def _attach(self) -> None:
        paths, _ = QFileDialog.getOpenFileNames(self, tr("attach"), "",
                                                "Files (*.pdf *.png *.jpg *.jpeg *.bmp *.xlsx *.xlsm *.csv *.txt)")
        for p in paths:
            self.add_file(p)

    def add_file(self, path: str) -> None:
        try:
            a = att.build(path)
        except (ValueError, OSError) as e:
            self.add("agent", str(e), highlight=True)
            return
        self.files.append(a)
        chip = QPushButton(f"📄 {a['name']}  ✕")
        chip.setStyleSheet("padding: 3px 10px; font-weight: 500;")
        chip.clicked.connect(lambda _=False, c=chip, x=a: (self.files.remove(x), c.deleteLater()))
        self.chips.addWidget(chip)

    def _voice(self) -> None:
        self.input.setFocus()
        self.voice_clicked.emit()

    def _submit(self) -> None:
        text = self.input.toPlainText().strip()
        if not text or not self.send_btn.isEnabled():
            return
        files = self.files
        self.files = []
        while self.chips.count():
            w = self.chips.takeAt(0).widget()
            if w:
                w.deleteLater()
        self.input.clear()
        self.submitted.emit(text, files)


# ----------------------------------------------------------------------------- live log
class LiveLogModule(Module):
    MODULE_ID, AREA = "live_log", "right"

    def __init__(self):
        super().__init__()
        g = Glass(tr("live_log"))
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(g)
        self.text = QPlainTextEdit()
        self.text.setReadOnly(True)
        self.text.setObjectName("Mono")
        self.text.setMaximumBlockCount(2000)
        # Arabic needs the UI font (a monospace font breaks the joined letters) and RTL lines.
        font = theme.UI_FONT if is_rtl() else theme.MONO_FONT
        self.text.setStyleSheet(f"font-family: {font}; font-size: 9.5pt; background: rgba(3,6,12,.7);")
        g.lay.addWidget(self.text)

    def add(self, line: str) -> None:
        # Unicode marks keep the time and the text in order inside a right-to-left line.
        mark = "\u200f" if is_rtl() else ""
        self.text.appendPlainText(f"{mark}{datetime.now():%H:%M:%S}  {mark}{line}")


# ----------------------------------------------------------------------------- outputs
class OutputsModule(Module):
    """Files in the project folder, newest first. New/changed files since the task started are
    marked. Double-click: built-in viewer for PDF/images, otherwise the file's own app."""

    MODULE_ID, AREA = "outputs", "right"

    def __init__(self):
        super().__init__()
        g = Glass(tr("outputs"))
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(g)
        ref = QPushButton("⟳")
        ref.setObjectName("Icon")
        ref.setToolTip(tr("refresh"))
        ref.clicked.connect(self.refresh)
        g.header.addWidget(ref)
        self.list = QListWidget()
        self.list.setLayoutDirection(Qt.LeftToRight)  # file names stay LTR
        self.list.itemDoubleClicked.connect(self._open)
        g.lay.addWidget(self.list)
        self.folder = ""
        self.since = 0.0
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.refresh)

    def set_folder(self, folder: str) -> None:
        self.folder = folder
        self.refresh()

    def watch(self, on: bool) -> None:
        if on:
            self.since = time.time()
            self.timer.start(3000)
        else:
            self.timer.stop()
            self.refresh()

    def refresh(self) -> None:
        self.list.clear()
        if not self.folder or not os.path.isdir(self.folder):
            self.list.addItem(tr("no_folder"))
            return
        files: list[tuple[float, Path]] = []
        for root, dirs, names in os.walk(self.folder):
            dirs[:] = [d for d in dirs if not d.startswith(".")]
            for n in names:
                p = Path(root, n)
                try:
                    files.append((p.stat().st_mtime, p))
                except OSError:
                    pass
            if len(files) > 2000:
                break
        for mtime, p in sorted(files, reverse=True)[:200]:
            mark = "● " if self.since and mtime >= self.since else "   "
            rel = os.path.relpath(p, self.folder)
            self.list.addItem(list_item(f"{mark}{rel}    {datetime.fromtimestamp(mtime):%d/%m %H:%M}", str(p)))

    def _open(self, item) -> None:
        path = item.data(Qt.UserRole)
        if not path:
            return
        if ViewerDialog.can_view(path):
            ViewerDialog(self, path).exec()
        else:
            QDesktopServices.openUrl(QUrl.fromLocalFile(path))
