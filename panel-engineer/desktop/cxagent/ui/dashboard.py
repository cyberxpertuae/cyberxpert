"""Main window. One app, two roles: the login decides which dashboard is built.

engineer: top bar + projects | chat | live log + output files
owner:    the same workspace + a Monitoring tab (accounts, sessions, permissions, model & limits)
"""

from __future__ import annotations

import threading
from typing import Any

from PySide6.QtCore import QSettings, Qt, QTimer, QUrl, Signal
from PySide6.QtGui import QDesktopServices, QGuiApplication, QKeySequence, QShortcut
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QProgressBar,
    QPushButton,
    QSplitter,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from ..api import AccessDenied, Api, ApiError, ConnectionLost
from ..platform import backends, own_process_names, start_stop_hotkey, voice_typing
from ..runner import TaskSpec
from ..screen import list_monitors
from . import theme
from .bridge import AgentController
from .compact import CompactPanel
from .dialogs import ApprovalDialog, ProjectDialog, SettingsDialog
from .i18n import is_rtl, language, tr
from .modules.owner import OwnerModule
from .modules.workspace import ChatModule, LiveLogModule, OutputsModule, ProjectsModule
from .widgets import GridBackground, StatusPill, StopButton, logo_pixmap


class MainWindow(QMainWindow):
    logged_out = Signal(str)

    def __init__(self, api: Api, me: dict[str, Any], settings: QSettings):
        super().__init__()
        self.api, self.me, self.settings = api, me, settings
        self.role = me["role"]
        self.project: dict[str, Any] | None = None
        self.paused = False
        self.reply_req: int | None = None
        self.ask_req: int | None = None
        self.dialogs: dict[int, ApprovalDialog] = {}
        self.setWindowTitle(f"Cyber Xpert — {tr('app_title')}")
        self.setLayoutDirection(Qt.RightToLeft if is_rtl() else Qt.LeftToRight)
        self.resize(1440, 900)

        inp, guard = backends()
        self.ctl = AgentController(api, inp, guard, own_process_names(), language())
        self._wire_controller()
        start_stop_hotkey(self.ctl.emergency_stop)  # global Ctrl+Shift+Q

        root = GridBackground()
        self.setCentralWidget(root)
        outer = QVBoxLayout(root)
        outer.setContentsMargins(16, 12, 16, 16)
        outer.setSpacing(12)
        outer.addLayout(self._top_bar())

        disabled = set(me.get("features", {}).get("disabled_modules", []))
        self.projects = ProjectsModule()
        self.chat = ChatModule()
        self.livelog = LiveLogModule()
        self.outputs = OutputsModule()
        split = QSplitter(Qt.Horizontal)
        split.addWidget(self.projects)
        split.addWidget(self.chat)
        right = QSplitter(Qt.Vertical)
        right.addWidget(self.livelog)
        if "outputs" not in disabled:
            right.addWidget(self.outputs)
        split.addWidget(right)
        split.setSizes([260, 760, 420])
        self.projects.setVisible("projects" not in disabled)

        if self.role == "owner":  # owner tools exist only in the owner's dashboard
            tabs = QTabWidget()
            tabs.addTab(split, tr("workspace"))
            self.owner = OwnerModule(api)
            tabs.addTab(self.owner, tr("monitoring"))
            outer.addWidget(tabs, 1)
        else:
            outer.addWidget(split, 1)

        self.compact = CompactPanel()
        self.compact.stop_clicked.connect(self.emergency_stop)
        self.compact.expand_clicked.connect(self._expand)

        self.projects.selected.connect(self._open_project)
        self.projects.new_requested.connect(lambda: self._edit_project(None))
        self.projects.edit_requested.connect(self._edit_project)
        self.chat.submitted.connect(self._submit)
        self.chat.pause_clicked.connect(self._toggle_pause)
        self.chat.stop_clicked.connect(self.emergency_stop)
        self.chat.new_task_clicked.connect(self._end_conversation)
        self.chat.voice_clicked.connect(voice_typing)
        QShortcut(QKeySequence("Ctrl+Shift+Q"), self, activated=self.emergency_stop)

        self.tts = self._make_tts()
        self._load_projects()

    # ------------------------------------------------------------------ layout
    def _top_bar(self) -> QHBoxLayout:
        bar = QHBoxLayout()
        bar.setSpacing(12)
        logo = QLabel()
        logo.setPixmap(logo_pixmap(22))
        title = QLabel(tr("app_title"))
        title.setStyleSheet(f"color: {theme.CYAN}; font-weight: 700; font-size: 12pt;")
        self.project_chip = QLabel("")
        self.project_chip.setStyleSheet(f"color: {theme.TEXT}; border: 1px solid {theme.BORDER}; border-radius: 12px; padding: 4px 12px;")
        self.status = StatusPill()
        self.steps_bar = QProgressBar()
        self.steps_bar.setFixedWidth(110)
        self.steps_bar.setRange(0, 1)
        self.steps_bar.setValue(0)
        steps_word = QLabel(tr("steps"))
        steps_word.setObjectName("Muted")
        self.steps_label = QLabel("0/–")  # numbers in the technical font, words in the UI font
        self.steps_label.setLayoutDirection(Qt.LeftToRight)
        self.steps_label.setStyleSheet(f"font-family: {theme.MONO_FONT}; color: {theme.CYAN};")
        wa = QPushButton("🟢  " + tr("whatsapp"))
        wa.setObjectName("WhatsApp")
        wa.setCursor(Qt.PointingHandCursor)
        wa.clicked.connect(self._whatsapp)
        gear = QPushButton("⚙")
        gear.setObjectName("Icon")
        gear.setToolTip(tr("settings"))
        gear.clicked.connect(self._settings)
        out = QPushButton(tr("logout"))
        out.clicked.connect(lambda: self.logged_out.emit(""))
        self.stop_btn = StopButton()
        self.stop_btn.clicked.connect(self.emergency_stop)
        for w in (logo, title, self.project_chip):
            bar.addWidget(w)
        bar.addStretch(1)
        self.project_chip.hide()
        for w in (self.status, self.steps_bar, steps_word, self.steps_label, wa, gear, out, self.stop_btn):
            bar.addWidget(w)
        return bar

    # ------------------------------------------------------------------ projects
    def _load_projects(self, select_id: int | None = None) -> None:
        try:
            self.projects.set_projects(self.api.projects(), select_id)
        except (ApiError, ConnectionLost, AccessDenied) as e:
            self.chat.add("agent", str(e), highlight=True)

    def _open_project(self, p: dict[str, Any]) -> None:
        if self.ctl.running():
            return  # stay on the running project
        self.project = p
        self.project_chip.setText(f"📁 {p['name']}  ·  {tr('stage')}: {p['stage']}")
        self.project_chip.show()
        self.outputs.set_folder(p.get("folder", ""))
        self.chat.clear()
        try:
            for c in self.api.chat(p["id"]):
                self.chat.add(c["role"], c["text"], c.get("attachments"))
        except (ApiError, ConnectionLost, AccessDenied):
            pass

    def _edit_project(self, p: dict[str, Any] | None) -> None:
        d = ProjectDialog(self, p)
        if d.exec():
            try:
                saved = self.api.save_project(d.value(), p["id"] if p else None)
                self._load_projects(saved["id"])
            except (ApiError, ConnectionLost, AccessDenied) as e:
                QMessageBox.warning(self, tr("project"), str(e))

    # ------------------------------------------------------------------ agent control
    def _submit(self, text: str, files: list[dict[str, Any]]) -> None:
        if self.ask_req is not None:  # answering the agent's question
            self.chat.add("engineer", text)
            req, self.ask_req = self.ask_req, None
            self.chat.set_mode("running")
            self.ctl.answer(req, text)
            return
        if self.reply_req is not None:  # follow-up in the same conversation
            self.chat.add("engineer", text, [f["name"] for f in files])
            req, self.reply_req = self.reply_req, None
            self.chat.set_mode("running")
            self._compact_if_single_screen()
            self.ctl.answer(req, (text, files))
            return
        if not self.project:
            self.chat.add("agent", tr("no_project"), highlight=True)
            return
        self.chat.add("engineer", text, [f["name"] for f in files])
        spec = TaskSpec(task=text, project=self.project["name"], project_folder=self.project.get("folder", ""),
                        allowed_apps=list(self.project.get("apps", [])), language=language(),
                        project_id=self.project["id"], attachments=files)
        self.chat.set_mode("running")
        self.outputs.watch(True)
        self._compact_if_single_screen()
        self.ctl.start(spec, int(self.settings.value("work_monitor", 0)))

    def emergency_stop(self) -> None:
        self.ctl.emergency_stop()
        self.reply_req = self.ask_req = None
        for d in list(self.dialogs.values()):
            d.reject()
        self.status.set_state("Stopped")
        self.compact.set_state("Stopped")

    def _toggle_pause(self) -> None:
        self.paused = not self.paused
        (self.ctl.pause if self.paused else self.ctl.resume)()
        self.chat.set_mode("running", paused=self.paused)

    def _end_conversation(self) -> None:
        if self.reply_req is not None:
            req, self.reply_req = self.reply_req, None
            self.ctl.answer(req, "")

    def _wire_controller(self) -> None:
        c = self.ctl
        c.status.connect(self._on_status)
        c.log.connect(lambda line: self.livelog.add(line))
        c.say.connect(self._on_say)
        c.steps.connect(self._on_steps)
        c.permission.connect(self._on_permission)
        c.question.connect(self._on_question)
        c.awaiting_reply.connect(self._on_awaiting_reply)
        c.retry_prompt.connect(self._on_retry)
        c.remote_answer.connect(self._on_remote_answer)
        c.finished.connect(self._on_finished)
        c.access_denied.connect(self._on_access_denied)

    def _on_status(self, s: str) -> None:
        self.status.set_state(s)
        self.compact.set_state(s)

    def _on_say(self, text: str) -> None:
        self.chat.add("agent", text)
        if self.tts and self.settings.value("voice_replies", "false") == "true":
            self.tts.setRate(int(self.settings.value("voice_speed", 0)) / 10)
            self.tts.say(text)

    def _on_steps(self, step: int, max_steps: int) -> None:
        self.steps_bar.setRange(0, max(1, max_steps))
        self.steps_bar.setValue(min(step, max_steps))
        self.steps_label.setText(f"{step}/{max_steps}")

    def _on_permission(self, req: int, info: dict[str, Any]) -> None:
        self._expand()
        d = ApprovalDialog(self, info)
        self.dialogs[req] = d
        d.finished.connect(lambda _r, req=req, d=d: self._permission_done(req, d))
        d.open()

    def _permission_done(self, req: int, d: ApprovalDialog) -> None:
        self.dialogs.pop(req, None)
        self.livelog.add(f"{'ALLOWED' if d.allowed else 'DENIED'} — {d.windowTitle()}")
        self.ctl.answer(req, ("dashboard", d.allowed))
        self._compact_if_single_screen()

    def _on_remote_answer(self, req: int, allowed: bool) -> None:
        d = self.dialogs.pop(req, None)
        if d:
            d.finished.disconnect()
            d.remote(allowed)

    def _on_question(self, req: int, question: str) -> None:
        self._expand()
        self.ask_req = req
        self.chat.add("question", question, highlight=True)
        self.chat.set_mode("reply")
        self.chat.input.setFocus()

    def _on_awaiting_reply(self, req: int) -> None:
        self._expand()
        self.reply_req = req
        self.chat.set_mode("reply")

    def _on_retry(self, req: int, message: str) -> None:
        ok = QMessageBox.question(self, tr("continue"), f"{message}\n\n{tr('retry_q')}") == QMessageBox.Yes
        self.ctl.answer(req, ok)

    def _on_finished(self, result: str) -> None:
        self._expand()
        self.paused = False
        self.reply_req = self.ask_req = None
        self.chat.set_mode("idle")
        self.outputs.watch(False)
        if self.status.state() == "Working":
            self.status.set_state("Idle")
        self._load_projects(self.project["id"] if self.project else None)

    def _on_access_denied(self, msg: str) -> None:
        self.logged_out.emit(msg)

    # ------------------------------------------------------------------ single screen
    def _same_screen_as_work(self) -> bool:
        mons = list_monitors()
        if len(mons) <= 1:
            return True
        m = mons[min(int(self.settings.value("work_monitor", 0)), len(mons) - 1)]
        center = self.frameGeometry().center()
        scr = QGuiApplication.screenAt(center)
        if scr is None:
            return False
        g = scr.geometry()
        dpr = scr.devicePixelRatio()
        return abs(g.x() * dpr - m.left) < 4 and abs(g.y() * dpr - m.top) < 4

    def _compact_if_single_screen(self) -> None:
        if self.ctl.running() or self.chat.mode == "running":
            if self._same_screen_as_work():
                self.compact.show_on(self.screen())
                self.hide()

    def _expand(self) -> None:
        if self.compact.isVisible():
            self.compact.hide()
            self.show()
            self.raise_()
            self.activateWindow()

    # ------------------------------------------------------------------ misc
    def _whatsapp(self) -> None:
        number = self.me.get("features", {}).get("whatsapp_system_number")
        if not number:
            QMessageBox.information(self, tr("whatsapp"), tr("wa_not_ready"))
            return
        if self.me.get("features", {}).get("whatsapp_linked"):
            QDesktopServices.openUrl(QUrl(f"https://wa.me/{number}"))
            return
        try:
            link = self.api.whatsapp_link()
        except (ApiError, ConnectionLost, AccessDenied) as e:
            QMessageBox.warning(self, tr("whatsapp"), str(e))
            return
        QMessageBox.information(self, tr("whatsapp"), tr("wa_link_info"))
        QDesktopServices.openUrl(QUrl(f"https://wa.me/{link['number']}?text={QUrl.toPercentEncoding(link['text']).data().decode()}"))

    def _settings(self) -> None:
        SettingsDialog(self, self.settings).exec()

    def _make_tts(self):
        try:
            from PySide6.QtCore import QLocale
            from PySide6.QtTextToSpeech import QTextToSpeech

            t = QTextToSpeech(self)
            t.setLocale(QLocale(QLocale.Arabic if language() == "ar" else QLocale.English))
            return t
        except Exception:  # noqa: BLE001 - voice is optional
            return None

    def closeEvent(self, e) -> None:  # noqa: N802
        self.ctl.emergency_stop()
        self.compact.close()
        super().closeEvent(e)
