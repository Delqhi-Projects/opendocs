import asyncio, nodriver as uc, sys


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "create-account" in getattr(tab, "url", getattr(tab.target, "url", ""))
            or "email-verification"
            in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        return False

    print("M17b: Warte auf erfolgreiches Submit (Wechsel zu /email-verification)...")
    for i in range(30):  # Max 15 Sekunden
        url = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "email-verification" in url:
            print("M17b OK: OpenAI hat das Passwort akzeptiert und die Mail gesendet!")
            return True

        try:
            html = await t.evaluate("document.body.innerHTML")
            if not isinstance(html, str):
                # nodriver returned ExceptionDetails or None — page may be navigating
                await asyncio.sleep(0.5)
                continue
        except Exception:
            await asyncio.sleep(0.5)
            continue

        if (
            "arkose" in html.lower()
            or "puzzle" in html.lower()
            or "prove you are human" in html.lower()
        ):
            print("M17b FAIL: CAPTCHA / PUZZLE aufgetaucht! OpenAI blockiert.")
            return False

        if "Das sieht nicht richtig aus" in html or "invalid" in html:
            print("M17b FAIL: Validierungsfehler beim Passwort!")
            return False

        await asyncio.sleep(0.5)

    print(
        "M17b FAIL: Timeout. Seite haengt fest (weder Captcha noch Verification-Screen)."
    )
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
