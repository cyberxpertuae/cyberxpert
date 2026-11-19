"""Entry point of the dashboard:  python -m cxagent.ui   (the installer's desktop icon)."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from PySide6.QtCore import QSettings, Qt
from PySide6.QtGui import QFont, QIcon
from PySide6.QtWidgets import QApplication

from . import theme
from .dashboard import MainWindow
from .i18n import set_language
from .login import LoginWindow
from .widgets import ASSETS


def server_url() -> str:
    """Bundled server.json (written by the installer build) or CX_SERVER for development."""
    if os.environ.get("CX_SERVER"):
        return os.environ["CX_SERVER"]
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[2]))
    cfg = base / "server.json"
    if cfg.is_file():
        return json.loads(cfg.read_text())["url"]
    return "http://127.0.0.1:8000"


class App:
    def __init__(self) -> None:
        if sys.platform == "win32":
            from ..backends.windows import make_dpi_aware

            make_dpi_aware()  # before Qt creates windows: screenshot pixels == click pixels
        self.qt = QApplication.instance() or QApplication(sys.argv)
        self.qt.setApplicationName("Cyber Xpert Panel Engineer")
        self.qt.setStyleSheet(theme.QSS)
        self.qt.setWindowIcon(QIcon(str(ASSETS / "logo_light.png")))
        self.settings = QSettings("CyberXpert", "PanelEngineer")
        self.login_win: LoginWindow | None = None
        self.main_win: MainWindow | None = None

    def show_login(self, message: str = "") -> None:
        set_language(str(self.settings.value("language", "ar")))
        self.qt.setLayoutDirection(Qt.RightToLeft if self.settings.value("language", "ar") == "ar" else Qt.LeftToRight)
        if self.main_win:
            self.main_win.close()
            self.main_win.deleteLater()
            self.main_win = None
        if self.login_win:
            self.login_win.close()
        self.login_win = LoginWindow(server_url(), self.settings, message)
        self.login_win.logged_in.connect(self.show_main)
        self.login_win.language_changed.connect(lambda: self.show_login())
        self.login_win.show()

    def show_main(self, api, me) -> None:
        self.main_win = MainWindow(api, me, self.settings)
        self.main_win.logged_out.connect(self.show_login)
        self.main_win.showMaximized()
        if self.login_win:
            self.login_win.close()
            self.login_win = None

    def run(self) -> int:
        self.show_login()
        return self.qt.exec()


def main() -> int:
    return App().run()


if __name__ == "__main__":
    sys.exit(main())
