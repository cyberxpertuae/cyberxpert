"""Turn files the engineer attaches into the server's attachment format.

These are the ONLY files that ever leave the laptop, and only because he chose them.
Excel and CSV are converted to text here, so the server never receives the workbook itself.
"""

from __future__ import annotations

import base64
import csv
import io
from pathlib import Path
from typing import Any

from PIL import Image

SUPPORTED = {".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".xlsx", ".xlsm", ".csv", ".txt"}
MAX_FILE_MB = 15
MAX_IMAGE_EDGE = 1568


def build(path: str | Path) -> dict[str, Any]:
    p = Path(path)
    ext = p.suffix.lower()
    if ext not in SUPPORTED:
        raise ValueError(f"Unsupported file type: {p.name} (PDF, images, Excel, CSV, TXT). "
                         "For drawings, export a PDF first.")
    if p.stat().st_size > MAX_FILE_MB * 1_000_000:
        raise ValueError(f"{p.name} is larger than {MAX_FILE_MB} MB")
    if ext == ".pdf":
        return {"name": p.name, "mime": "application/pdf", "data_b64": base64.b64encode(p.read_bytes()).decode()}
    if ext in (".png", ".jpg", ".jpeg", ".bmp"):
        img = Image.open(p)
        img = img.convert("RGB")
        img.thumbnail((MAX_IMAGE_EDGE, MAX_IMAGE_EDGE))
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=88)
        return {"name": p.name, "mime": "image/jpeg", "data_b64": base64.b64encode(buf.getvalue()).decode()}
    if ext in (".xlsx", ".xlsm"):
        return {"name": p.name, "mime": "text/plain", "text": _excel_text(p)}
    return {"name": p.name, "mime": "text/plain", "text": p.read_text(encoding="utf-8", errors="replace")}


def _excel_text(p: Path) -> str:
    from openpyxl import load_workbook  # values only: formulas are read as their cached results

    wb = load_workbook(p, read_only=True, data_only=True)
    out = io.StringIO()
    for ws in wb.worksheets:
        out.write(f"## Sheet: {ws.title}\n")
        w = csv.writer(out)
        for row in ws.iter_rows(values_only=True):
            if any(v is not None for v in row):
                w.writerow(["" if v is None else v for v in row])
        out.write("\n")
    return out.getvalue()
