import asyncio, nodriver as uc, sys, json
_GET = """(function(){
    var el = document.getElementById('mail');
    if(el && el.value && el.value.includes('@')) return el.value;
    return null;
})()"""
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    for ms in [1, 3, 5]:
        await asyncio.sleep(ms)
        val = await t.evaluate(_GET)
        if val:
            with open("/tmp/current_email.txt", "w") as f: f.write(val)
            print(f"M11 OK: Email erhalten: {val}")
            return True
    print("M11 FAIL: Email nicht geladen.")
    return False
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
