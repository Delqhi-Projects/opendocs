import asyncio, nodriver as uc, sys

_CLICK = """(function(){
    var btn = Array.from(document.querySelectorAll('button, a')).find(b => {
        var t = (b.innerText||b.textContent||'').toLowerCase();
        return t.includes('generate new');
    });
    if(btn && btn.offsetParent !== null) { btn.click(); return true; }
    return false;
})()"""


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "temp-mail.org" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        return False

    if await t.evaluate(_CLICK):
        print("M10 OK: DOM Click auf Generate New.")
        await asyncio.sleep(0.5)
        return True

    print(
        "M10 SKIP: Generate New nicht gefunden (Delete hat bereits neue Mail erzeugt)."
    )
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
