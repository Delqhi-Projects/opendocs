import asyncio, nodriver as uc, sys

_CO = """(function(){
    var b = document.querySelectorAll('button, input[type="submit"], [role="button"]');
    var target = Array.from(b).find(x => {
        var t = (x.innerText || x.textContent || '').toLowerCase().trim();
        return t.includes('accept') || t.includes('agree') || t.includes('continue') || t.includes('weiter');
    });
    if(target) { target.click(); return true; }
    return false;
})()"""


async def run():
    await asyncio.sleep(2)  # Let M28 submit navigate
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "openai" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        print("M29 WARN: Kein OpenAI Tab, ueberspringe.")
        return True
    for attempt in range(10):
        url = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "platform.openai.com" in url or "chatgpt.com" in url or "/log-in" in url:
            print("M29 OK: Consent uebersprungen oder erfolgreich.")
            return True
        if await t.evaluate(_CO):
            print("M29 OK: Consent Button geklickt.")
            await asyncio.sleep(2)
            return True
        await asyncio.sleep(1)
    print("M29 FAIL: Consent Timeout.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
