import sys, json, os
from playwright.sync_api import sync_playwright
BASE='http://localhost:8081'; out=sys.argv[1]
S=[ # id, path, demo, actions
 ("ST01_skeleton_loading","/shop","member",[]),
 ("ST02_filter_sheet","/shop","member",[("click","shop-filter")]),
 ("ST03_logout_dialog","/profile","member",[("click","pf-logout")]),
 ("ST04_guest_gate","/home","guest",[("click","home-notif")]),
 ("ST05_cancel_booking_dialog","/bookings/BK-3298","member",[("click","bk-cancel")]),
 ("ST06_empty_cart","/shop/cart","member",[("click","cart-rm-0")]),
 ("ST07_empty_search","/search","member",[("fill","search-input","zzzz")]),
 ("ST08_form_errors","/auth/register","none",[("click","reg-submit")]),
 ("ST09_redeem_dialog","/rewards/rw-energy","member",[("click","rw-redeem")]),
 ("ST10_checkin_denied","/staff/checkin","member",[("fill","ci-id","EMP-20566"),("click","ci-go")]),
 ("ST11_checkin_ok","/staff/checkin","member",[("fill","ci-id","EMP-20418"),("click","ci-go")]),
 ("ST12_exercise_picker","/training/create","member",[("click","cw-add")]),
]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    for lang in ['en','ar']:
        os.makedirs(f'{out}/{lang}',exist_ok=True)
        for sid,path,demo,acts in S:
            ctx=b.new_context(viewport={'width':360,'height':800},device_scale_factor=2)
            ctx.add_init_script(f"localStorage.setItem('empire.lang','{lang}'); window.__EMPIRE_DEMO={json.dumps(demo) if demo!='none' else 'undefined'};")
            pg=ctx.new_page(); errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e)[:200]))
            pg.goto(BASE+path)
            if sid.startswith('ST01'):
                pg.wait_for_timeout(250)
            else:
                pg.wait_for_timeout(1300)
                for a in acts:
                    if a[0]=='click': pg.locator(f'[data-testid="{a[1]}"]').first.click()
                    else: pg.locator(f'[data-testid="{a[1]}"]').first.fill(a[2])
                    pg.wait_for_timeout(1400)
            pg.screenshot(path=f'{out}/{lang}/{sid}.png'); ctx.close()
            if errs: print(lang,sid,errs)
    b.close()
print('done')
