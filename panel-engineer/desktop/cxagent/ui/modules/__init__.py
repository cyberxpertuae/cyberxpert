"""Dashboard modules. Each module declares where it sits and which roles see it, so new
features are added as new modules without rebuilding the dashboard. The server can switch
modules off (features.disabled_modules)."""

from __future__ import annotations

from PySide6.QtWidgets import QWidget


class Module(QWidget):
    MODULE_ID = ""
    ROLES = frozenset({"owner", "engineer"})
    AREA = "center"  # left | center | right | owner_tab
