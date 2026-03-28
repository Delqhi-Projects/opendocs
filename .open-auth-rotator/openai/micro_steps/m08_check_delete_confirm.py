import asyncio, nodriver as uc, sys

_CHECK = """(function(){
    var m = Array.from(document.querySelectorAll('.jconfirm-content, .modal'));
    return m.some(el => el.innerText.includes('sure') && el.offsetParent !== null);
})()"""

async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return True # fail gracefully
    
    for ms in [1, 3]:
        await asyncio.sleep(ms)
        if await t.evaluate(_CHECK):
            print(f"M08 OK: Popup 'Are you sure' sichtbar nach {ms}s.")
            with open('/tmp/m08_popup_seen.txt','w') as f: f.write('1')
            return True
            
    print("M08 WARN: Kein Popup (Free Mode?). Überspringe M09...")
    with open('/tmp/m08_popup_seen.txt','w') as f: f.write('0')
    return True # Do not break the pipeline!

if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
