import asyncio, nodriver as uc, sys
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
        print("M12 FAIL: OpenAI Register Tab nicht gefunden.")
        return False
    await t.bring_to_front()
    print("M12 OK: Auf OpenAI Tab gewechselt.")
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
