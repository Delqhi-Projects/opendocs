import asyncio, nodriver as uc, sys, os

_CLICK_ALL = """(function(){
    var btns = Array.from(document.querySelectorAll('button'));
    var clicked = false;
    for(var b of btns) {
        var text = (b.innerText || b.textContent || '').trim().toLowerCase();
        // Suche gezielt nach "yes" oder nutze den Klassennamen, falls Text uebersetzt wurde
        if(text === 'yes' || b.classList.contains('btn-danger')) {
            b.click();
            clicked = true;
        }
    }
    return clicked;
})()"""

async def run():
    if not os.path.exists('/tmp/m08_popup_seen.txt'): return True
    with open('/tmp/m08_popup_seen.txt','r') as f:
        if f.read().strip() != '1': return True
            
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    
    for attempt in range(5):
        await asyncio.sleep(0.5)
        if await t.evaluate(_CLICK_ALL):
            print("M09 OK: 'Yes' (oder btn-danger) Button(s) gefunden und geklickt.")
            await asyncio.sleep(1)
            return True
            
    print("M09 FAIL: Keine 'Yes' / '.btn-danger' Buttons gefunden.")
    return False

if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
