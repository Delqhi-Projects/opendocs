import asyncio, nodriver as uc, sys, random
import nodriver.cdp.input_ as input_cdp
N = [("Tim", "Becker"), ("Jan", "Hoffmann"), ("Felix", "Wagner"), ("Lukas", "Schulz")]
async def run():
    f, l = random.choice(N)
    name = f"{f} {l}"
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'about-you' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    
    await t.evaluate("document.querySelector('input[name=\"name\"]').focus();")
    await asyncio.sleep(0.2)
    # Clear
    await t.send(input_cdp.dispatch_key_event(type_="keyDown", key="a", windows_virtual_key_code=65, modifiers=2))
    await t.send(input_cdp.dispatch_key_event(type_="keyUp", key="a", windows_virtual_key_code=65, modifiers=2))
    await t.send(input_cdp.dispatch_key_event(type_="keyDown", key="Backspace", windows_virtual_key_code=8))
    await t.send(input_cdp.dispatch_key_event(type_="keyUp", key="Backspace", windows_virtual_key_code=8))
    await asyncio.sleep(0.2)
    
    for char in name:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.05)
        
    print(f"M24 OK: Name '{name}' getippt.")
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
