"""Dialogs: Allow/Deny, project editor, settings, built-in PDF/image viewer."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from PySide6.QtCore import QSettings, Qt
from PySide6.QtGui import QImage, QPixmap
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDialog,
    QFileDialog,
    QFormLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMenu,
    QPushButton,
    QScrollArea,
    QSlider,
    QVBoxLayout,
    QWidget,
)

from ..platform import running_apps
from ..screen import list_monitors
from . import theme
from .i18n import is_rtl, tr
from .widgets import glow, neon


class CxDialog(QDialog):
    def __init__(self, parent: QWidget | None, title: str):
        super().__init__(parent)
        self.setObjectName("CxDialog")
        self.setWindowTitle(title)
        self.setLayoutDirection(Qt.RightToLeft if is_rtl() else Qt.LeftToRight)
        self.lay = QVBoxLayout(self)
        self.lay.setContentsMargins(22, 20, 22, 20)
        self.lay.setSpacing(14)


class ApprovalDialog(CxDialog):
    """Allow/Deny (or Approve/Reject for stage changes). Shown every single time; there is
    deliberately no "always allow" option. Closing the dialog counts as Deny."""

    def __init__(self, parent: QWidget | None, info: dict[str, Any]):
        stage = info.get("kind") == "stage_change"
        super().__init__(parent, tr("stage_title" if stage else "perm_title"))
        self.setModal(True)
        self.setWindowFlag(Qt.WindowStaysOnTopHint, True)
        self.setMinimumWidth(460)
        self.allowed = False
        head = QLabel(("⚠  " if not stage else "➜  ") + tr("kind_" + str(info.get("kind", "other"))))
        head.setStyleSheet(f"font-size: 14pt; font-weight: 800; color: {theme.AMBER if not stage else theme.CYAN};")
        self.lay.addWidget(head)
        target = QLabel(str(info.get("target", "")))
        target.setObjectName("Mono")
        target.setWordWrap(True)
        target.setTextInteractionFlags(Qt.TextSelectableByMouse)
        target.setStyleSheet(f"background: rgba(5,10,20,.85); border: 1px solid {theme.BORDER}; border-radius: 10px; padding: 10px;")
        target.setLayoutDirection(Qt.LeftToRight)  # paths / exe names stay LTR
        self.lay.addWidget(target)
        if info.get("reason"):
            r = QLabel(f"{tr('reason')}: {info['reason']}")
            r.setWordWrap(True)
            r.setObjectName("Muted")
            self.lay.addWidget(r)
        row = QHBoxLayout()
        self.deny_btn = QPushButton(tr("reject" if stage else "deny"))
        self.deny_btn.setObjectName("Danger")
        self.allow_btn = neon(QPushButton(tr("approve" if stage else "allow")), primary=True)
        for b in (self.deny_btn, self.allow_btn):
            b.setMinimumHeight(40)
            b.setCursor(Qt.PointingHandCursor)
        row.addWidget(self.deny_btn)
        row.addWidget(self.allow_btn)
        self.lay.addLayout(row)
        self.deny_btn.clicked.connect(self.reject)
        self.allow_btn.clicked.connect(self._allow)
        self.deny_btn.setDefault(True)  # Enter never allows by accident
        glow(self, theme.AMBER, 40, 90)

    def _allow(self) -> None:
        self.allowed = True
        self.accept()

    def remote(self, allowed: bool) -> None:
        """Answered from WhatsApp: close with that answer."""
        self.allowed = allowed
        self.setWindowTitle(tr("answered_whatsapp"))
        (self.accept if allowed else self.reject)()


class ProjectDialog(CxDialog):
    def __init__(self, parent: QWidget | None, project: dict[str, Any] | None = None):
        super().__init__(parent, tr("project"))
        self.setMinimumWidth(560)
        p = project or {}
        form = QFormLayout()
        form.setSpacing(10)
        self.name = QLineEdit(p.get("name", ""))
        self.folder = QLineEdit(p.get("folder", ""))
        self.folder.setLayoutDirection(Qt.LeftToRight)
        browse = QPushButton(tr("browse"))
        browse.clicked.connect(self._browse)
        frow = QHBoxLayout()
        frow.addWidget(self.folder, 1)
        frow.addWidget(browse)
        form.addRow(tr("project_name"), self.name)
        form.addRow(tr("project_folder"), frow)
        self.lay.addLayout(form)
        self.lay.addWidget(QLabel(tr("approved_apps")))
        self.apps = QListWidget()
        self.apps.setMaximumHeight(160)
        self.apps.setLayoutDirection(Qt.LeftToRight)
        for a in p.get("apps", []):
            self.apps.addItem(a)
        self.lay.addWidget(self.apps)
        arow = QHBoxLayout()
        add = QPushButton(tr("add_running"))
        add.clicked.connect(self._add_running)
        rm = QPushButton(tr("remove"))
        rm.clicked.connect(lambda: [self.apps.takeItem(self.apps.row(i)) for i in self.apps.selectedItems()])
        arow.addWidget(add)
        arow.addWidget(rm)
        arow.addStretch(1)
        self.lay.addLayout(arow)
        brow = QHBoxLayout()
        brow.addStretch(1)
        cancel = QPushButton(tr("cancel"))
        cancel.clicked.connect(self.reject)
        save = neon(QPushButton(tr("save")), primary=True)
        save.clicked.connect(self._save)
        brow.addWidget(cancel)
        brow.addWidget(save)
        self.lay.addLayout(brow)

    def _browse(self) -> None:
        d = QFileDialog.getExistingDirectory(self, tr("project_folder"), self.folder.text())
        if d:
            self.folder.setText(d)

    def _add_running(self) -> None:
        menu = QMenu(self)
        for name, title in running_apps():
            act = menu.addAction(f"{name}  —  {title[:50]}")
            act.setData(name)
        chosen = menu.exec(self.cursor().pos())
        if chosen and not self.apps.findItems(chosen.data(), Qt.MatchExactly):
            self.apps.addItem(chosen.data())

    def _save(self) -> None:
        if self.name.text().strip():
            self.accept()

    def value(self) -> dict[str, Any]:
        return {"name": self.name.text().strip(), "folder": self.folder.text().strip(),
                "apps": [self.apps.item(i).text() for i in range(self.apps.count())]}


class SettingsDialog(CxDialog):
    def __init__(self, parent: QWidget | None, settings: QSettings):
        super().__init__(parent, tr("settings"))
        self.s = settings
        self.setMinimumWidth(460)
        form = QFormLayout()
        form.setSpacing(12)
        self.lang = QComboBox()
        self.lang.addItem("العربية", "ar")
        self.lang.addItem("English", "en")
        self.lang.setCurrentIndex(0 if settings.value("language", "ar") == "ar" else 1)
        self.screen = QComboBox()
        for i, m in enumerate(list_monitors()):
            self.screen.addItem(tr("screen_n", n=i + 1, w=m.width, h=m.height), i)
        self.screen.setCurrentIndex(min(int(settings.value("work_monitor", 0)), max(0, self.screen.count() - 1)))
        self.voice = QCheckBox()
        self.voice.setChecked(settings.value("voice_replies", "false") == "true")
        self.speed = QSlider(Qt.Horizontal)
        self.speed.setRange(-5, 5)
        self.speed.setValue(int(settings.value("voice_speed", 0)))
        form.addRow(tr("language"), self.lang)
        form.addRow(tr("work_screen"), self.screen)
        form.addRow(tr("voice_replies"), self.voice)
        form.addRow(tr("voice_speed"), self.speed)
        self.lay.addLayout(form)
        note = QLabel(tr("restart_note"))
        note.setObjectName("Muted")
        self.lay.addWidget(note)
        row = QHBoxLayout()
        row.addStretch(1)
        cancel = QPushButton(tr("cancel"))
        cancel.clicked.connect(self.reject)
        save = neon(QPushButton(tr("save")), primary=True)
        save.clicked.connect(self._save)
        row.addWidget(cancel)
        row.addWidget(save)
        self.lay.addLayout(row)

    def _save(self) -> None:
        self.s.setValue("language", self.lang.currentData())
        self.s.setValue("work_monitor", self.screen.currentData() or 0)
        self.s.setValue("voice_replies", "true" if self.voice.isChecked() else "false")
        self.s.setValue("voice_speed", self.speed.value())
        self.accept()


class ViewerDialog(CxDialog):
    """Built-in viewer for PDFs and images (drawings exported to PDF)."""

    def __init__(self, parent: QWidget | None, path: str):
        super().__init__(parent, Path(path).name)
        self.resize(980, 760)
        area = QScrollArea()
        area.setWidgetResizable(True)
        body = QWidget()
        col = QVBoxLayout(body)
        col.setAlignment(Qt.AlignHCenter)
        for img in self._pages(path):
            lbl = QLabel()
            lbl.setPixmap(QPixmap.fromImage(img).scaledToWidth(min(img.width(), 900), Qt.SmoothTransformation))
            lbl.setStyleSheet(f"border: 1px solid {theme.BORDER}; background: white;")
            col.addWidget(lbl)
        area.setWidget(body)
        self.lay.addWidget(area)

    @staticmethod
    def _pages(path: str, max_pages: int = 30) -> list[QImage]:
        if path.lower().endswith(".pdf"):
            import pypdfium2 as pdfium

            doc = pdfium.PdfDocument(path)
            out = []
            for i in range(min(len(doc), max_pages)):
                pil = doc[i].render(scale=1.6).to_pil().convert("RGB")
                out.append(QImage(pil.tobytes(), pil.width, pil.height, pil.width * 3, QImage.Format_RGB888).copy())
            return out
        img = QImage(path)
        return [img] if not img.isNull() else []

    @staticmethod
    def can_view(path: str) -> bool:
        return Path(path).suffix.lower() in {".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".gif"}


def list_item(text: str, data: Any = None) -> QListWidgetItem:
    it = QListWidgetItem(text)
    it.setData(Qt.UserRole, data)
    return it
