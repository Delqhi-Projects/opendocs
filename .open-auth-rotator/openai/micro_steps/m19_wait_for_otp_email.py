import asyncio, nodriver as uc, sys

_CLICK = """(function(){
    var elements = Array.from(document.querySelectorAll('a, div, span, h3, h4, td'));
    var target = elements.find(el => {
        var t = (el.innerText || el.textContent || '').toLowerCase();
        return t.includes('dein code') || t.includes('your code') || t.includes('chatgpt') || t.includes('openai') || t.includes('verification') || t.includes('verify');
    });
    if(target && target.offsetParent !== null) {
        var link = target.closest('a') || target;
        if (link && typeof link.click === 'function') {
            link.click();
            return true;
        }
    }
    return false;
})()"""

async def run():
    try:
        b = await uc.start(host="127.0.0.1", port=9334)
    except Exception as e:
        print(f"M19 Startfehler: {e}")
        return False
        
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t:
        print("M19: Temp-Mail Tab nicht gefunden!")
        return False
    
    await t.bring_to_front()
    
    # 90 Sekunden Timeout statt 40 (180 Iterationen x 0.5s)
    for i in range(180):
        try:
            found = await t.evaluate(_CLICK)
            if found:
                print(f"M19 OK: OTP Email nach {i * 0.5}s geklickt.")
                await asyncio.sleep(2)
                return True
        except Exception:
            pass # Ignore evaluate errors while loading
        await asyncio.sleep(0.5)
        
    print("M19 FAIL: Timeout auf OTP.")
    return False

if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
