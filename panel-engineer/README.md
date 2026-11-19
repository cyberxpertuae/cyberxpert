# Cyber Xpert – Panel Engineer

An AI agent that operates engineering software (SkyCAD Electrical, DIADesigner, DIAScreen,
COMMGR) on Engineer Yousef's Windows laptop by screen control.

| Part | Where it runs | Holds |
|---|---|---|
| `server/` | Owner's VPS (Hetzner / DigitalOcean), behind HTTPS | Hidden prompt, knowledge files, Anthropic API key, accounts, logs |
| `desktop/` | Engineer's laptop | Nothing secret: only "eyes and hands" (screenshots, mouse, keyboard) |

```
laptop                                   server                              Claude API
task + screenshot  ───────────────────▶  hidden prompt + history  ─────────▶  computer toolset
execute actions    ◀───────────────────  actions only (no prompt)  ◀────────  tool_use blocks
results+screenshot ───────────────────▶  ...repeat until task_complete / Stop / step limit
```

## Status: Stage 1 (server + agent loop + basic client)

Built:
* Server (FastAPI): login with device binding, agent loop on the `computer_toolset_20260801`
  toolset with Claude Opus 5.5, adaptive thinking, effort setting, server-side refusal fallback,
  prompt caching (tools + system + conversation), per-task step limit, owner settings in DB
  (model / effort / step limit, no laptop update needed), audit log per model call with token and
  cache usage, leak filter on every outgoing message, generic error messages.
* Dashboard tools for the agent: `request_permission` (Allow/Deny every time), `ask_engineer`,
  `task_complete`.
* Desktop client (console front-end; the dark dashboard is Stage 2): screenshots of the chosen work
  screen only, native Windows input via `SendInput` (types Arabic too), per-action privacy guard
  (only approved apps can be clicked or typed into), Emergency Stop (Ctrl+Shift+Q global hotkey,
  checked before every action and inside typing), immediate stop on connection loss or account
  disable.

## Run the tests

```bash
pip install -r server/requirements.txt -r desktop/requirements.txt pytest
(cd server && python -m pytest tests -q)          # server, real SDK over a mock transport
(cd desktop && python -m pytest tests -q)         # executor / guard / keys
# Full end-to-end on a virtual X display with a real text editor (Linux; needs xdotool,
# mousepad, x11-apps). The Claude API is replaced by tools/fake_claude.py.
xvfb-run -s "-screen 0 1920x1080x24" python -m pytest tools/test_e2e_x11.py -v
```

## Stage 1 live test on Windows with Notepad (needs the real API key)

On the server (or any machine for a first try):

```bash
cd server
cp .env.example .env            # set ANTHROPIC_API_KEY, CX_SECRET_KEY, CX_DATABASE_URL, CX_PROMPT_DIR
mkdir -p /srv/cyberxpert/prompts && cp -r prompts.example/* /srv/cyberxpert/prompts/
python -m scripts.create_user add yousef "Engineer Yousef"
uvicorn app.main:app --host 127.0.0.1 --port 8000   # put Caddy/nginx with HTTPS in front
```

On the Windows test PC (Python 3.11+):

```powershell
cd desktop
pip install -r requirements.txt
notepad                          # open Notepad on the work screen first
python -m cxagent --server https://YOUR-SERVER --user yousef --apps notepad.exe `
  --project "Notepad trial" "Type a three-line test note in Notepad and save it as test.txt in Documents"
```

Press Ctrl+Shift+Q at any time to stop. "Save As" to a new file is fine; overwriting an existing
file must trigger an Allow/Deny prompt.
