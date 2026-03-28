import asyncio, nodriver as uc, sys
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if any(x in getattr(tab, 'url', getattr(tab.target, 'url', '')) for x in ['create-account', 'auth.openai', 'login', 'auth'])), None)
    if not t: return False
    
    for ms in [1, 3, 5]:
        await asyncio.sleep(ms)
        html = await t.evaluate("document.body.innerText")
        if 'Passwort' in html or 'Password' in html or 'password' in html.lower():
            print(f"M15 OK: Password Seite sichtbar nach {ms}s.")
            return True
        print(f"M15 WARN: Warte auf Password Seite...")
        
    print("M15 FAIL: Timeout.")
    return False
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
