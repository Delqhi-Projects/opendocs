import asyncio, nodriver as uc, sys, random, string
import nodriver.cdp.input_ as input_cdp


def _pwd():
    return "".join(random.choices(string.ascii_letters + string.digits, k=10)) + "!2aA"


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab for tab in b.tabs
            if any(x in getattr(tab, "url", getattr(tab.target, "url", "")) for x in ["create-account", "auth.openai", "chatgpt.com/auth"])
        ),
        None,
    )
    if not t:
        return False
    pwd = _pwd()
    with open("/tmp/current_password.txt", "w") as f:
        f.write(pwd)
    await t.evaluate("""(function(){
        var inp = document.querySelector('input[type="password"]');
        if(inp) { inp.value = ''; inp.focus(); }
    })()""")
    await asyncio.sleep(0.2)
    for char in pwd:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.04)
    print("M16 OK: Password getippt + gespeichert.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
