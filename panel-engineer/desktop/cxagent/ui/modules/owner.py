"""Owner-only module: live monitoring, sessions, permission log, accounts, model & limits.

Only created for owner accounts. Even if this code were enabled for an engineer account,
every call would be refused by the server (role checked server-side).
"""

from __future__ import annotations

import threading
from typing import Any, Callable

from PySide6.QtCore import QObject, Qt, QTimer, Signal
from PySide6.QtWidgets import (
    QComboBox,
    QFormLayout,
    QGridLayout,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QPlainTextEdit,
    QPushButton,
    QSpinBox,
    QSplitter,
    QTableWidget,
    QTableWidgetItem,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from ...api import Api
from .. import theme
from ..i18n import tr
from ..widgets import Glass, neon
from . import Module


class _Fetcher(QObject):
    """Runs API calls off the UI thread and delivers results back on it."""

    done = Signal(object, object)

    def __init__(self):
        super().__init__()
        self.done.connect(lambda cb, data: cb(data))

    def run(self, fn: Callable[[], Any], cb: Callable[[Any], None]) -> None:
        def work() -> None:
            try:
                data = fn()
            except Exception as e:  # noqa: BLE001
                data = e
            self.done.emit(cb, data)

        threading.Thread(target=work, daemon=True).start()


def _table(headers: list[str]) -> QTableWidget:
    t = QTableWidget(0, len(headers))
    t.setHorizontalHeaderLabels(headers)
    t.verticalHeader().setVisible(False)
    t.setEditTriggers(QTableWidget.NoEditTriggers)
    t.setSelectionBehavior(QTableWidget.SelectRows)
    t.setAlternatingRowColors(True)
    t.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeToContents)
    t.horizontalHeader().setStretchLastSection(True)
    return t


def _fill(t: QTableWidget, rows: list[list[Any]], data: list[Any] | None = None) -> None:
    t.setRowCount(len(rows))
    for r, row in enumerate(rows):
        for c, v in enumerate(row):
            it = QTableWidgetItem("" if v is None else str(v))
            if data is not None and c == 0:
                it.setData(Qt.UserRole, data[r])
            t.setItem(r, c, it)
    t.resizeColumnsToContents()


class _Card(QWidget):
    def __init__(self, title: str):
        super().__init__()
        lay = QVBoxLayout(self)
        lay.setContentsMargins(16, 12, 16, 12)
        self.setStyleSheet(f"background: rgba(0,229,255,0.05); border: 1px solid {theme.BORDER}; border-radius: 12px;")
        t = QLabel(title)
        t.setObjectName("Muted")
        t.setStyleSheet("border: none; background: transparent;")
        self.value = QLabel("—")
        self.value.setStyleSheet(f"border: none; background: transparent; font-family: {theme.MONO_FONT}; "
                                 f"font-size: 18pt; color: {theme.CYAN}; font-weight: 700;")
        lay.addWidget(t)
        lay.addWidget(self.value)


class OwnerModule(Module):
    MODULE_ID, AREA, ROLES = "owner_admin", "owner_tab", frozenset({"owner"})

    def __init__(self, api: Api):
        super().__init__()
        self.api = api
        self.f = _Fetcher()
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        g = Glass(tr("monitoring"))
        lay.addWidget(g)
        self.tabs = QTabWidget()
        g.lay.addWidget(self.tabs)

        # Live -------------------------------------------------------------
        live = QWidget()
        lv = QVBoxLayout(live)
        cards = QGridLayout()
        self.c_today, self.c_month = _Card(tr("spend_today")), _Card(tr("spend_month"))
        self.c_running, self.c_model = _Card(tr("running")), _Card(tr("model"))
        for i, c in enumerate((self.c_today, self.c_month, self.c_running, self.c_model)):
            cards.addWidget(c, 0, i)
        lv.addLayout(cards)
        self.t_live = _table(["#", "user", "project", "status", "steps", "now doing", "agent says"])
        lv.addWidget(self.t_live)
        self.tabs.addTab(live, tr("live"))

        # Sessions ---------------------------------------------------------
        ses = QSplitter(Qt.Vertical)
        self.t_sessions = _table(["#", "user", "project", "task", "status", "steps", "started", "ended"])
        self.t_sessions.itemSelectionChanged.connect(self._load_detail)
        self.detail = QPlainTextEdit()
        self.detail.setReadOnly(True)
        self.detail.setStyleSheet("font-size: 9.5pt;")  # UI font: keeps Arabic letters joined
        ses.addWidget(self.t_sessions)
        ses.addWidget(self.detail)
        self.tabs.addTab(ses, tr("sessions"))

        # Permissions ----------------------------------------------------------
        self.t_perm = _table(["#", "user", "session", "kind", "target", "reason", "answer", "via", "at"])
        self.tabs.addTab(self.t_perm, tr("permissions_log"))

        # Accounts -------------------------------------------------------------
        acc = QWidget()
        av = QVBoxLayout(acc)
        self.t_users = _table(["#", "username", "name", "role", "active", "device", "online", "today $", "whatsapp"])
        av.addWidget(self.t_users)
        row = QHBoxLayout()
        en, dis = QPushButton(tr("enable")), QPushButton(tr("disable"))
        dis.setObjectName("Danger")
        en.clicked.connect(lambda: self._set_active(True))
        dis.clicked.connect(lambda: self._set_active(False))
        row.addWidget(en)
        row.addWidget(dis)
        row.addStretch(1)
        av.addLayout(row)
        self.tabs.addTab(acc, tr("accounts"))

        # Model & limits -------------------------------------------------------
        ml = QWidget()
        form = QFormLayout(ml)
        self.model = QComboBox()
        self.effort = QComboBox()
        self.steps = QSpinBox()
        self.steps.setRange(1, 500)
        form.addRow(tr("model"), self.model)
        form.addRow(tr("effort"), self.effort)
        form.addRow(tr("max_steps"), self.steps)
        save = neon(QPushButton(tr("save")), primary=True)
        save.clicked.connect(self._save_settings)
        self.saved = QLabel("")
        form.addRow(save, self.saved)
        self.tabs.addTab(ml, tr("model_limits"))

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.refresh)
        self.timer.start(2000)
        self.tabs.currentChanged.connect(lambda _: self.refresh())
        self._settings_loaded = False
        self.refresh()

    # -- data ------------------------------------------------------------------
    def refresh(self) -> None:
        if not self.isVisible() and self._settings_loaded:
            return
        self.f.run(lambda: self.api.admin("GET", "status"), self._on_status)
        tab = self.tabs.currentIndex()
        if tab in (0, 1):
            self.f.run(lambda: self.api.admin("GET", "sessions"), self._on_sessions)
        elif tab == 2:
            self.f.run(lambda: self.api.admin("GET", "approvals"), self._on_perm)
        elif tab == 3:
            self.f.run(lambda: self.api.admin("GET", "users"), self._on_users)

    def _on_status(self, st: Any) -> None:
        if isinstance(st, Exception):
            return
        self.c_today.value.setText(f"${st['today']['usd']:.2f}")
        self.c_month.value.setText(f"${st['month']['usd']:.2f}")
        self.c_running.value.setText(str(st["running_sessions"]))
        self.c_model.value.setText(st["model"].replace("claude-", ""))
        if not self._settings_loaded:
            self.model.addItems(st["models"])
            self.effort.addItems(st["efforts"])
            self.model.setCurrentText(st["model"])
            self.effort.setCurrentText(st["effort"])
            self.steps.setValue(st["max_steps_per_task"])
            self._settings_loaded = True

    def _on_sessions(self, rows: Any) -> None:
        if isinstance(rows, Exception):
            return
        live = [r for r in rows if r["status"] in ("running", "waiting_engineer")]
        _fill(self.t_live, [[r["id"], r["user"], r["project"], r["status"], r["steps"],
                             ", ".join(r["last_actions"]), r["last_message"]] for r in live])
        sel = self.t_sessions.currentRow()
        _fill(self.t_sessions, [[r["id"], r["user"], r["project"], r["task"], r["status"], r["steps"],
                                 r["started"][:19].replace("T", " "), (r["ended"] or "")[:19].replace("T", " ")]
                                for r in rows], [r["id"] for r in rows])
        if 0 <= sel < self.t_sessions.rowCount():
            self.t_sessions.blockSignals(True)
            self.t_sessions.selectRow(sel)
            self.t_sessions.blockSignals(False)

    def _load_detail(self) -> None:
        it = self.t_sessions.item(self.t_sessions.currentRow(), 0)
        if not it:
            return
        sid = it.data(Qt.UserRole)
        self.f.run(lambda: self.api.admin("GET", f"sessions/{sid}"), self._on_detail)

    def _on_detail(self, d: Any) -> None:
        if isinstance(d, Exception):
            self.detail.setPlainText(str(d))
            return
        lines = [f"Session {d['id']} — {d['status']} — {d['project']}", f"Task: {d['task']}", ""]
        for c in d["chat"]:
            lines.append(f"[{c['at'][11:19]}] {c['role']}: {c['text']}")
        lines.append("")
        for s in d["steps"]:
            acts = ", ".join(a["name"] for a in s["actions"])
            t = s["tokens"]
            lines.append(f"step {s['n']:>3}  {s['latency_ms']:>6} ms  in {t['in']}/cache {t['cache_read']}/out {t['out']}  {acts}")
        self.detail.setPlainText("\n".join(lines))

    def _on_perm(self, rows: Any) -> None:
        if isinstance(rows, Exception):
            return
        _fill(self.t_perm, [[r["id"], r["user"], r["session_id"], r["kind"], r["target"], r["reason"],
                             r["status"], r["source"], r["at"][:19].replace("T", " ")] for r in rows])

    def _on_users(self, rows: Any) -> None:
        if isinstance(rows, Exception):
            return
        _fill(self.t_users, [[u["id"], u["username"], u["display_name"], u["role"], "✔" if u["active"] else "✖",
                              "bound" if u["device_bound"] else "-", tr("online") if u["online"] else tr("offline"),
                              f"{u['today']['usd']:.2f}", u["whatsapp"]] for u in rows], [u["id"] for u in rows])

    def _set_active(self, active: bool) -> None:
        it = self.t_users.item(self.t_users.currentRow(), 0)
        if not it:
            return
        uid = it.data(Qt.UserRole)
        self.f.run(lambda: self.api.admin("POST", f"users/{uid}/active", {"active": active}),
                   lambda _: self.refresh())

    def _save_settings(self) -> None:
        values = {"model": self.model.currentText(), "effort": self.effort.currentText(),
                  "max_steps_per_task": str(self.steps.value())}
        self.f.run(lambda: self.api.admin("PUT", "settings", {"values": values}),
                   lambda r: self.saved.setText(tr("saved") if not isinstance(r, Exception) else str(r)))
