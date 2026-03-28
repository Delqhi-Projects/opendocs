import asyncio, nodriver as uc, sys, random
import nodriver.cdp.input_ as input_cdp
def _bday():
    return f"{random.randint(1, 28):02d}{random.randint(1, 12):02d}{random.randint(1980, 2000)}"

async def _type(t, text):
    for char in text:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.04)

async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'about-you' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    
    await t.evaluate("document.querySelector('div[data-type=\"day\"]').focus();")
    await asyncio.sleep(0.2)
    
    # 8 pure Ziffern, ohne ArrowRight! React Aria springt ganz von alleine nach vorne!
    bday_digits = _bday()
    await _type(t, bday_digits)
    
    print(f"M26 OK: Geburtsdatum {bday_digits} in Aria Maske gefeuert (Auto-Advance).")
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
