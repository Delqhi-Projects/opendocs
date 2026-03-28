import asyncio, nodriver as uc
import sys

_FIND_REG = """(function(){
    var links = Array.from(document.querySelectorAll('a, button'));
    var reg = links.find(l => {
        var t = (l.innerText||'').toLowerCase().trim();
        return t.includes('registrieren') || t.includes('sign up')
            || t === 'register' || t === 'create account'
            || t === 'konto erstellen' || t === 'erstelle ein konto';
    });
    if(reg) {
        reg.setAttribute('id', 'mcp_reg_btn');
        return true;
    }
    return false;
})()"""

# Check if we're already ON the create-account page (no click needed)
_IS_CREATE_PAGE = """(function(){
    return location.href.includes('create-account');
})()"""


def _find_openai_tab(b):
    """Find OpenAI auth/login tab by URL, never blindly use tabs[0]."""
    for tab in b.tabs:
        url = getattr(tab, "url", getattr(tab.target, "url", ""))
        if "auth.openai" in url or "chatgpt.com/auth" in url:
            return tab
    return None


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)

    t = _find_openai_tab(b)
    if not t:
        print("M03 FAIL: Kein OpenAI Tab gefunden!")
        return False

    await t.bring_to_front()
    await asyncio.sleep(0.3)

    # If we're already on create-account page, skip clicking
    if await t.evaluate(_IS_CREATE_PAGE):
        print("M03 OK: Bereits auf create-account Seite.")
        return True

    # Try to find the register link/button with retries
    found = False
    for attempt in range(6):
        found = await t.evaluate(_FIND_REG)
        if found:
            break
        await asyncio.sleep(0.5)

    if not found:
        # Last resort: try direct navigation
        print("M03 WARN: Register-Button nicht gefunden, navigiere direkt...")
        await t.get("https://auth.openai.com/create-account")
        await asyncio.sleep(1.5)
        url = getattr(t, "url", getattr(t.target, "url", ""))
        if "create-account" in url:
            print("M03 OK: Direkte Navigation zu create-account erfolgreich.")
            return True
        print("M03 FAIL: Auch direkte Navigation fehlgeschlagen!")
        return False

    print("M03 OK: 'Registrieren' gefunden, klicke...")

    # 1. Versuch: DOM Klick
    await t.evaluate("document.getElementById('mcp_reg_btn').click();")
    await asyncio.sleep(0.5)

    # 2. Versuch (Fallback): CDP Klick falls URL sich nicht aendert
    url = getattr(t, "url", getattr(t.target, "url", ""))
    if "create-account" not in url:
        try:
            el = await t.find("#mcp_reg_btn")
            if el:
                await el.click()
        except Exception:
            pass

    return True


if __name__ == "__main__":
    if asyncio.run(run()):
        sys.exit(0)
    sys.exit(1)
