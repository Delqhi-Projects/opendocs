import asyncio, nodriver as uc, sys
_CLICK = """(function(){
    var links = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    var bdayLink = links.find(l => (l.innerText || '').toLowerCase().includes('geburtsdatum'));
    if(bdayLink) { bdayLink.click(); return true; }
    return false;
})()"""
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'about-you' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    
    if await t.evaluate(_CLICK):
        print("M25 OK: 'Geburtsdatum verwenden' Link geklickt.")
    else:
        print("M25 INFO: Link nicht da, war vermutlich schon aktiv.")
        
    await asyncio.sleep(0.5)
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
