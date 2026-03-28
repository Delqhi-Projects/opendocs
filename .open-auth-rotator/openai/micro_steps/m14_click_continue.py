import asyncio, nodriver as uc, sys

# FIXED 2026-03-27: OpenAI signup page has multiple button[type="submit"] (Google, Apple, Microsoft, Weiter).
# Old code clicked the first submit button = Google SSO, not the email Continue button.
# New code finds the "Weiter"/"Continue" button by text content.
_CLICK_CONTINUE = """(function(){
    // Strategy 1: find by exact text "Weiter" or "Continue" (localized)
    var buttons = Array.from(document.querySelectorAll('button'));
    var btn = buttons.find(function(b){
        var t = b.innerText.trim().toLowerCase();
        return t === 'weiter' || t === 'continue' || t === 'fortfahren' || t === 'next';
    });
    if(btn){ btn.click(); return 'CLICKED_TEXT:' + btn.innerText.trim(); }

    // Strategy 2: last button[type="submit"] (email continue is last after SSO buttons)
    var submits = document.querySelectorAll('button[type="submit"]');
    if(submits.length > 0){
        var last = submits[submits.length - 1];
        last.click();
        return 'CLICKED_LAST_SUBMIT:' + last.innerText.trim();
    }

    // Strategy 3: any button that is NOT a social login
    var fallback = buttons.find(function(b){
        var t = b.innerText.trim().toLowerCase();
        return !t.includes('google') && !t.includes('apple') && !t.includes('microsoft') && !t.includes('smartphone') && t.length > 0;
    });
    if(fallback){ fallback.click(); return 'CLICKED_FALLBACK:' + fallback.innerText.trim(); }

    return 'NO_BUTTON';
})()"""


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
        print("M14 FAIL: Kein create-account Tab gefunden!")
        return False

    print("M14: Kurze Gedenksekunde (Anti-Bot)...")
    await asyncio.sleep(1.0)

    result = await t.evaluate(_CLICK_CONTINUE)
    print(f"M14: Button result: {result}")

    if result == "NO_BUTTON":
        body = await t.evaluate("document.body.innerText.slice(0, 300)")
        url = getattr(t, "url", getattr(t.target, "url", ""))
        print(f"M14 FAIL: NO_BUTTON auf URL={url}")
        print(f"M14 FAIL: Page body: {body}")
        return False

    url_after = getattr(t, "url", getattr(t.target, "url", ""))
    print(f"M14 OK: Weiter geklickt — {result} — URL nach Klick: {url_after}")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
