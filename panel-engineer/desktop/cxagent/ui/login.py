"""Glowing login screen."""

from __future__ import annotations

from PySide6.QtCore import QSettings, Qt, Signal
from PySide6.QtWidgets import QHBoxLayout, QLabel, QLineEdit, QPushButton, QVBoxLayout, QWidget

from ..api import AccessDenied, Api, ApiError, ConnectionLost
from ..platform import device_id
from . import theme
from .i18n import is_rtl, set_language, tr
from .widgets import GridBackground, glow, logo_pixmap, neon


class LoginWindow(GridBackground):
    logged_in = Signal(object, dict)   # api, me
    language_changed = Signal()

    def __init__(self, server_url: str, settings: QSettings, message: str = ""):
        super().__init__()
        self.server_url, self.settings = server_url, settings
        self.setWindowTitle("Cyber Xpert")
        self.setLayoutDirection(Qt.RightToLeft if is_rtl() else Qt.LeftToRight)
        self.resize(1100, 720)
        outer = QVBoxLayout(self)
        top = QHBoxLayout()
        top.addStretch(1)
        lang = QPushButton("English" if is_rtl() else "العربية")
        lang.clicked.connect(self._toggle_lang)
        top.addWidget(lang)
        outer.addLayout(top)
        outer.addStretch(1)

        card = QWidget()
        card.setObjectName("LoginCard")
        card.setFixedWidth(430)
        card.setStyleSheet(f"#LoginCard {{ background: rgba(13,22,38,.86); border: 1px solid {theme.CYAN_DIM}; border-radius: 18px; }}")
        glow(card, theme.CYAN, 60, 120)
        col = QVBoxLayout(card)
        col.setContentsMargins(34, 34, 34, 30)
        col.setSpacing(14)
        logo = QLabel()
        logo.setPixmap(logo_pixmap(34))
        logo.setAlignment(Qt.AlignCenter)
        glow(logo, theme.CYAN, 30, 160)
        title = QLabel(tr("app_title"))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet(f"color: {theme.CYAN}; font-size: 13pt; font-weight: 700;")  # no letter-spacing: breaks Arabic
        self.user = QLineEdit(str(settings.value("username", "")))
        self.user.setPlaceholderText(tr("username"))
        self.user.setLayoutDirection(Qt.LeftToRight)
        self.pw = QLineEdit()
        self.pw.setPlaceholderText(tr("password"))
        self.pw.setEchoMode(QLineEdit.Password)
        self.pw.setLayoutDirection(Qt.LeftToRight)
        self.pw.returnPressed.connect(self._login)
        self.btn = neon(QPushButton(tr("login")), primary=True)
        self.btn.setMinimumHeight(44)
        self.btn.clicked.connect(self._login)
        self.err = QLabel(message)
        self.err.setWordWrap(True)
        self.err.setAlignment(Qt.AlignCenter)
        self.err.setStyleSheet(f"color: {theme.RED};")
        note = QLabel("🔒 " + tr("secure_note"))
        note.setObjectName("Muted")
        note.setAlignment(Qt.AlignCenter)
        for w in (logo, title, self.user, self.pw, self.btn, self.err, note):
            col.addWidget(w)
        mid = QHBoxLayout()
        mid.addStretch(1)
        mid.addWidget(card)
        mid.addStretch(1)
        outer.addLayout(mid)
        outer.addStretch(2)
        (self.pw if self.user.text() else self.user).setFocus()

    def _toggle_lang(self) -> None:
        new = "en" if is_rtl() else "ar"
        self.settings.setValue("language", new)
        set_language(new)
        self.language_changed.emit()

    def _login(self) -> None:
        self.btn.setEnabled(False)
        self.err.setText("")
        api = Api(self.server_url)
        try:
            api.login(self.user.text().strip(), self.pw.text(), device_id())
            me = api.me()
        except (AccessDenied, ApiError) as e:
            self.err.setText(f"{tr('login_failed')}: {e}")
            self.btn.setEnabled(True)
            return
        except ConnectionLost:
            self.err.setText(tr("Connection lost, work paused."))
            self.btn.setEnabled(True)
            return
        self.settings.setValue("username", self.user.text().strip())
        self.logged_in.emit(api, me)
