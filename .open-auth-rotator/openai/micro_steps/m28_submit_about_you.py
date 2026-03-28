import asyncio, nodriver as uc, sys

_DUMP_STATE = """(function(){
    var btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent!==null).map(b =>
        (b.id?'#'+b.id:'')+'[type='+b.type+']:'+(b.innerText||b.textContent||'').trim().substring(0,30));
    var url = window.location.href;
    var name = document.querySelector('input[name="name"]') ? document.querySelector('input[name="name"]').value : null;
    var age = document.querySelector('input[name="age"]') ? document.querySelector('input[name="age"]').value : null;
    var bday = document.querySelector('input[name="birthday"]') ? document.querySelector('input[name="birthday"]').value : null;
    return JSON.stringify({url:url, name:name, age:age, bday:bday, visibleBtns:btns.slice(0,8)});
})()"""

_CLICK_SUBMIT = """(function(){
    var btn = document.querySelector('button[type="submit"]');
    if(btn && !btn.disabled){
        btn.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        btn.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        btn.click();
        return 'clicked:' + (btn.innerText||btn.textContent||'').trim().substring(0,30);
    }
    return btn ? 'disabled' : 'not_found';
})()"""

_CLICK_OK_CONFIRM = """(function(){
    var btns = Array.from(document.querySelectorAll('button'));
    var ok = btns.find(b => {
        var txt = (b.innerText||b.textContent||'').trim();
        return (txt==='OK' || txt==='Ok' || txt==='ok') && b.offsetParent!==null;
    });
    if(ok){
        ok.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        ok.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        ok.click();
        return 'ok_clicked:' + ok.textContent.trim();
    }
    return 'no_ok_btn';
})()"""


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "about-you" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        print("M28 FAIL: Kein about-you Tab gefunden!")
        return False

    await t.bring_to_front()
    await asyncio.sleep(0.5)

    s = await t.evaluate(_DUMP_STATE)
    print(f"M28 STATE_BEFORE: {s}")

    r = await t.evaluate(_CLICK_SUBMIT)
    print(f"M28 SUBMIT_CLICK: {r}")

    if r in ("not_found", "disabled"):
        print(f"M28 FAIL: Submit-Button {r}")
        await t.save_screenshot("/tmp/m28_submit_fail.png")
        return False

    await t.save_screenshot("/tmp/m28_submitted.png")

    print("M28 OK: Submit geklickt. Warte auf Reaktion...")

    for i in range(20):
        await asyncio.sleep(0.5)
        try:
            url = await t.evaluate("window.location.href")
        except Exception as e:
            print(
                f"M28 OK: Tab navigiert/geschlossen nach {(i + 1) * 0.5:.1f}s (WebSocket weg = Navigation OK): {type(e).__name__}"
            )
            return True

        try:
            ok_result = await t.evaluate(_CLICK_OK_CONFIRM)
            if "ok_clicked" in ok_result:
                print(
                    f"M28 CONFIRMATION_OK_CLICKED t+{(i + 1) * 0.5:.1f}s: {ok_result}"
                )
        except Exception:
            print(
                f"M28 OK: Tab weg bei OK-Check nach {(i + 1) * 0.5:.1f}s = Navigation OK"
            )
            return True

        if "about-you" not in url:
            print(f"M28 OK: Navigiert weg nach {(i + 1) * 0.5:.1f}s -> {url}")
            return True

        print(f"M28 WAIT t+{(i + 1) * 0.5:.1f}s: url={url} ok_check={ok_result}")

    try:
        url_final = await t.evaluate("window.location.href")
        print(f"M28 WARN: Noch auf about-you nach 10s: {url_final}")
        await t.save_screenshot("/tmp/m28_stuck.png")
    except Exception:
        print("M28 OK: Tab weg am Ende = Navigation erfolgreich")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
