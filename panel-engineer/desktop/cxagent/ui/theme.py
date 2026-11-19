"""Cyber dark theme: near-black navy, subtle grid, neon cyan accent, solid red Stop."""

from __future__ import annotations

import sys

BG = "#05080f"
BG2 = "#0a1220"
PANEL = "rgba(13, 22, 38, 0.78)"
PANEL_SOLID = "#0d1626"
BORDER = "#123047"
CYAN = "#00e5ff"
CYAN_DIM = "#0aa6c2"
TEXT = "#d7e6f5"
MUTED = "#7f93a8"
RED = "#ff2d46"
RED_DARK = "#c4122a"
GREEN = "#25d366"
AMBER = "#ffb020"
OK = "#2ee6a6"

if sys.platform == "win32":
    UI_FONT = "Segoe UI Variable Text, Segoe UI, Tahoma"
    MONO_FONT = "Cascadia Mono, Consolas"
else:
    UI_FONT = "Noto Sans, Noto Sans Arabic, DejaVu Sans"
    MONO_FONT = "JetBrains Mono, DejaVu Sans Mono"

QSS = f"""
* {{ font-family: {UI_FONT}; font-size: 10.5pt; color: {TEXT}; }}
QMainWindow, QDialog#CxDialog {{ background: {BG}; }}
QToolTip {{ background: {PANEL_SOLID}; color: {TEXT}; border: 1px solid {CYAN_DIM}; padding: 4px; }}

QFrame#Glass {{ background: {PANEL}; border: 1px solid {BORDER}; border-radius: 14px; }}
QLabel#PanelTitle {{ color: {CYAN}; font-size: 9.5pt; font-weight: 700; }}
QLabel#Muted {{ color: {MUTED}; }}
QLabel#Mono, QPlainTextEdit#Mono {{ font-family: {MONO_FONT}; }}

QLineEdit, QPlainTextEdit, QTextEdit, QComboBox, QSpinBox {{
    background: rgba(5, 10, 20, 0.85); border: 1px solid {BORDER}; border-radius: 10px;
    padding: 7px 10px; selection-background-color: {CYAN_DIM}; selection-color: {BG};
}}
QLineEdit:focus, QPlainTextEdit:focus, QTextEdit:focus, QComboBox:focus {{ border: 1px solid {CYAN}; }}
QComboBox QAbstractItemView {{ background: {PANEL_SOLID}; border: 1px solid {BORDER}; }}

QPushButton {{
    background: rgba(0, 229, 255, 0.08); border: 1px solid {CYAN_DIM}; border-radius: 10px;
    padding: 8px 16px; color: {TEXT}; font-weight: 600;
}}
QPushButton:hover {{ background: rgba(0, 229, 255, 0.18); border-color: {CYAN}; }}
QPushButton:pressed {{ background: rgba(0, 229, 255, 0.30); }}
QPushButton:disabled {{ color: {MUTED}; border-color: {BORDER}; background: transparent; }}
QPushButton#Primary {{ background: {CYAN}; color: {BG}; border: none; }}
QPushButton#Primary:hover {{ background: #5ff0ff; }}
QPushButton#Primary:disabled {{ background: {BORDER}; color: {MUTED}; }}
QPushButton#Danger {{ background: transparent; color: {RED}; border: 1px solid {RED}; }}
QPushButton#Danger:hover {{ background: rgba(255, 45, 70, 0.15); }}
QPushButton#Stop {{
    background: {RED}; color: white; border: 2px solid #ff6b7d; border-radius: 12px;
    padding: 8px 22px; font-size: 11pt; font-weight: 800; letter-spacing: 1px;
}}
QPushButton#Stop:hover {{ background: #ff4a60; }}
QPushButton#Stop:pressed {{ background: {RED_DARK}; }}
QPushButton#WhatsApp {{ background: {GREEN}; color: #062e16; border: none; }}
QPushButton#WhatsApp:hover {{ background: #4be384; }}
QPushButton#Icon {{ padding: 6px 10px; min-width: 34px; }}

QListWidget, QTreeWidget, QTableWidget {{
    background: transparent; border: none; outline: none; alternate-background-color: rgba(255,255,255,0.02);
}}
QListWidget::item, QTreeWidget::item {{ padding: 8px 8px; border-radius: 8px; }}
QListWidget::item:selected, QTreeWidget::item:selected, QTableWidget::item:selected {{
    background: rgba(0, 229, 255, 0.14); color: {TEXT}; border: 1px solid {CYAN_DIM};
}}
QListWidget::item:hover, QTreeWidget::item:hover {{ background: rgba(0, 229, 255, 0.06); }}
QHeaderView {{ background: transparent; border: none; }}
QTableCornerButton::section {{ background: transparent; border: none; }}
QTableView {{ selection-background-color: rgba(0, 229, 255, 0.18); selection-color: {TEXT}; }}
QHeaderView::section {{ background: transparent; color: {MUTED}; border: none; border-bottom: 1px solid {BORDER};
    padding: 6px; font-weight: 600; }}
QTableWidget {{ gridline-color: {BORDER}; }}

QTabWidget::pane {{ border: none; }}
QTabBar::tab {{ background: transparent; color: {MUTED}; padding: 9px 18px; border-bottom: 2px solid transparent;
    font-weight: 600; }}
QTabBar::tab:selected {{ color: {CYAN}; border-bottom: 2px solid {CYAN}; }}
QTabBar::tab:hover {{ color: {TEXT}; }}

QScrollBar:vertical {{ background: transparent; width: 8px; margin: 2px; }}
QScrollBar::handle:vertical {{ background: {BORDER}; border-radius: 4px; min-height: 30px; }}
QScrollBar::handle:vertical:hover {{ background: {CYAN_DIM}; }}
QScrollBar::add-line, QScrollBar::sub-line {{ height: 0; width: 0; }}
QScrollBar:horizontal {{ background: transparent; height: 8px; margin: 2px; }}
QScrollBar::handle:horizontal {{ background: {BORDER}; border-radius: 4px; min-width: 30px; }}
QSplitter::handle {{ background: transparent; width: 8px; }}
QCheckBox::indicator {{ width: 16px; height: 16px; border: 1px solid {CYAN_DIM}; border-radius: 4px; }}
QCheckBox::indicator:checked {{ background: {CYAN}; }}
QProgressBar {{ background: rgba(5,10,20,0.85); border: 1px solid {BORDER}; border-radius: 5px; height: 8px;
    text-align: center; font-size: 1px; color: transparent; }}
QProgressBar::chunk {{ background: {CYAN}; border-radius: 4px; }}
"""
