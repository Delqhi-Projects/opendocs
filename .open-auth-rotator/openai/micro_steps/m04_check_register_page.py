import asyncio, nodriver as uc, sys


def _find_openai_tab(b):
    for tab in b.tabs:
        url = getattr(tab, "url", getattr(tab.target, "url", ""))
        if "auth.openai" in url or "chatgpt.com/auth" in url:
            return tab
    return None


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = _find_openai_tab(b)
    if not t:
        if b.tabs:
            t = b.tabs[0]
        else:
            print("M04 FAIL: Keine Tabs offen!")
            return False

    for i in range(15):
        url = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "create-account" in url:
            print(f"M04 OK: Create Account geladen nach {i * 0.5}s.")
            return True
        try:
            body = await t.evaluate("document.body.innerText")
            if body and "email-adresse" in body.lower():
                print(f"M04 OK: Create Account geladen nach {i * 0.5}s.")
                return True
        except Exception:
            pass
        await asyncio.sleep(0.5)
    print("M04 FAIL: Registrierungsseite nicht geladen!")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
