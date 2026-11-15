import sys, os, json, time
sys.path.insert(0, os.path.dirname(__file__))
from routes import R
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8081'
out = sys.argv[1]; langs = sys.argv[2].split(',') if len(sys.argv) > 2 else ['en','ar']
only = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else None
report = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for lang in langs:
        os.makedirs(f'{out}/{lang}', exist_ok=True)
        for sid, path, mode in R:
            if only and sid not in only: continue
            ctx = b.new_context(viewport={'width': 360, 'height': 800}, device_scale_factor=2, locale='en-US')
            demo = '' if mode == 'none' else mode
            ctx.add_init_script(f"localStorage.setItem('empire.lang','{lang}'); window.__EMPIRE_DEMO = {json.dumps(demo) if demo else 'undefined'};")
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:300]))
            pg.on('console', lambda m: errs.append('console: ' + m.text[:300]) if m.type == 'error' else None)
            try:
                pg.goto(BASE + path, wait_until='networkidle', timeout=30000)
            except Exception as e:
                errs.append('goto: ' + str(e)[:200])
            pg.wait_for_timeout(1300 if sid != 'A01_splash' else 600)
            txt = pg.inner_text('body')[:4000]
            if 'Unmatched Route' in txt or 'This screen doesn' in txt: errs.append('UNMATCHED ROUTE')
            pg.screenshot(path=f'{out}/{lang}/{sid}.png')
            report.append({'id': sid, 'lang': lang, 'errors': [e for e in errs if 'Download the React DevTools' not in e], 'url': pg.url})
            ctx.close()
    b.close()
json.dump(report, open(f'{out}/report.json', 'w'), indent=1, ensure_ascii=False)
bad = [r for r in report if r['errors']]
print('screens', len(report), 'with errors', len(bad))
for r in bad[:40]: print(r['lang'], r['id'], r['errors'][:3])
