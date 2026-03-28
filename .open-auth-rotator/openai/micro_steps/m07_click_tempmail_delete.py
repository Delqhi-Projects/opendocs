import asyncio, nodriver as uc, sys

_CLICK = """(function(){
    var btns = Array.from(document.querySelectorAll('button, a'));
    var deleteBtn = btns.find(b => (b.innerText||b.textContent||'').toLowerCase().includes('delete') && b.offsetParent !== null);
    if(deleteBtn) { deleteBtn.click(); return true; }
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

    for attempt in range(10):
        if await t.evaluate(_CLICK):
            print(f"M07 OK: Klick auf Delete (nach {attempt * 0.5}s).")
            await asyncio.sleep(0.5)
            return True
        await asyncio.sleep(0.5)

    print("M07 FAIL: Delete Button nicht gefunden nach 5s.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
