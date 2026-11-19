"""HTTPS client for the owner's server. Holds no secrets except the engineer's short-lived token."""

from __future__ import annotations

from typing import Any

import httpx


class ConnectionLost(Exception):
    """Network or server unreachable: the agent must stop at once."""


class AccessDenied(Exception):
    """Account disabled, token expired, or wrong device: the app must stop and log out."""


class ApiError(Exception):
    pass


class Api:
    def __init__(self, base_url: str, verify: bool | str = True, timeout_s: float = 150.0):
        # Certificate pinning is added in Stage 4 (packaging) via a pinned CA bundle in `verify`.
        self.http = httpx.Client(base_url=base_url.rstrip("/"), verify=verify,
                                 timeout=httpx.Timeout(timeout_s, connect=10.0))
        self.token: str | None = None

    def _call(self, method: str, path: str, json: Any = None, timeout: float | None = None) -> Any:
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        try:
            kw: dict[str, Any] = {"json": json, "headers": headers}
            if timeout is not None:
                kw["timeout"] = timeout
            r = self.http.request(method, path, **kw)
        except httpx.TransportError as e:
            raise ConnectionLost(str(e)) from e
        if r.status_code in (401, 403):
            raise AccessDenied(r.json().get("detail", "Access denied") if r.content else "Access denied")
        if r.status_code >= 500:
            raise ConnectionLost(f"Server error {r.status_code}")
        if r.status_code >= 400:
            raise ApiError(r.json().get("detail", r.text) if r.content else str(r.status_code))
        return r.json()

    def login(self, username: str, password: str, device_id: str) -> dict[str, Any]:
        data = self._call("POST", "/api/v1/auth/login",
                          {"username": username, "password": password, "device_id": device_id})
        self.token = data["access_token"]
        return data

    def start(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._call("POST", "/api/v1/sessions", payload)

    def step(self, session_id: int, results: list[dict[str, Any]]) -> dict[str, Any]:
        return self._call("POST", f"/api/v1/sessions/{session_id}/step", {"results": results})

    def message(self, session_id: int, text: str, attachments: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        return self._call("POST", f"/api/v1/sessions/{session_id}/message",
                          {"text": text, "attachments": attachments or []})

    # -- dashboard ------------------------------------------------------------------
    def me(self) -> dict[str, Any]:
        return self._call("GET", "/api/v1/me")

    def projects(self) -> list[dict[str, Any]]:
        return self._call("GET", "/api/v1/projects")

    def save_project(self, data: dict[str, Any], project_id: int | None = None) -> dict[str, Any]:
        if project_id is None:
            return self._call("POST", "/api/v1/projects", data)
        return self._call("PUT", f"/api/v1/projects/{project_id}", data)

    def chat(self, project_id: int) -> list[dict[str, Any]]:
        return self._call("GET", f"/api/v1/projects/{project_id}/chat")

    def open_approval(self, session_id: int, kind: str, target: str, reason: str) -> int:
        return self._call("POST", f"/api/v1/sessions/{session_id}/approvals",
                          {"kind": kind, "target": target, "reason": reason})["id"]

    def decide(self, approval_id: int, allowed: bool) -> None:
        self._call("POST", f"/api/v1/approvals/{approval_id}/decide", {"allowed": allowed}, timeout=5.0)

    def control(self, session_id: int | None) -> dict[str, Any]:
        q = f"?session_id={session_id}" if session_id is not None else ""
        return self._call("GET", f"/api/v1/control{q}", timeout=3.0)

    def whatsapp_link(self) -> dict[str, str]:
        return self._call("POST", "/api/v1/whatsapp/link")

    # -- owner only (the server refuses these for engineer accounts) -------------------
    def admin(self, method: str, path: str, json: Any = None) -> Any:
        return self._call(method, f"/api/v1/admin/{path}", json)

    def finish(self, session_id: int) -> None:
        self._call("POST", f"/api/v1/sessions/{session_id}/finish", timeout=5.0)

    def retry(self, session_id: int) -> dict[str, Any]:
        return self._call("POST", f"/api/v1/sessions/{session_id}/retry")

    def stop(self, session_id: int) -> None:
        self._call("POST", f"/api/v1/sessions/{session_id}/stop", timeout=3.0)
