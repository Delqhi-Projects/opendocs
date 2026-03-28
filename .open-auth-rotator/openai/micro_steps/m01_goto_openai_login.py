import asyncio, nodriver as uc
import sys


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    if not b.tabs:
        await b.connection.send(uc.cdp.target.create_target('about:blank', new_window=True))
        await asyncio.sleep(1)
        b = await uc.start(host="127.0.0.1", port=9334)

    # Verwende den ersten Tab, anstatt staendig neue aufzumachen
    t = b.tabs[0] if b.tabs else None
    if not t:
        t = await b.get("about:blank", new_tab=True)

    await t.get("https://chatgpt.com/auth/login_with")
    print("M01: Seite https://chatgpt.com/auth/login_with im Haupt-Tab aufgerufen.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
