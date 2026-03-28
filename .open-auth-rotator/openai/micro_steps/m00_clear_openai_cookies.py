import asyncio, nodriver as uc, sys, os

_FLAGS = [
    "/tmp/m30_skip_login.txt",
    "/tmp/m30_login_mode.txt",
    "/tmp/m30_otp_needed.txt",
    "/tmp/current_otp2.txt",
    "/tmp/current_email.txt",
    "/tmp/current_otp.txt",
    "/tmp/current_password.txt",
    "/tmp/oauth_url.txt",
    "/tmp/m08_popup_seen.txt",
]


_STALE_DOMAINS = [
    "openai.com",
    "chatgpt.com",
    "temp-mail.org",
    "auth0.com",
    "localhost:1455",
]


async def run():
    for f in _FLAGS:
        if os.path.exists(f):
            os.remove(f)
    b = await uc.start(host="127.0.0.1", port=9334)

    tabs_to_close = []
    has_blank = False
    for tab in b.tabs:
        url = getattr(tab, "url", getattr(tab.target, "url", ""))
        if any(d in url for d in _STALE_DOMAINS):
            tabs_to_close.append(tab)
        elif "about:blank" in url or "chrome://" in url:
            has_blank = True

    if tabs_to_close and not has_blank:
        await b.connection.send(uc.cdp.target.create_target("about:blank"))
        await asyncio.sleep(0.3)

    for tab in tabs_to_close:
        try:
            target_id = tab.target.target_id
            await b.connection.send(uc.cdp.target.close_target(target_id))
            await asyncio.sleep(0.2)
        except Exception:
            pass

    if tabs_to_close:
        print(f"M00: {len(tabs_to_close)} alte Tabs geschlossen.")

    try:
        cookies = await b.connection.send(uc.cdp.network.get_cookies())
        for c in cookies:
            if "openai.com" in c.domain or "chatgpt.com" in c.domain:
                await b.connection.send(
                    uc.cdp.network.delete_cookies(
                        name=c.name, domain=c.domain, path=c.path
                    )
                )
    except Exception as e:
        print(f"M00 WARN: Konnte Cookies nicht loeschen: {e}")
    print(
        "M00 OK: Alte Tabs + OpenAI Cookies + Flags geloescht (Temp-Mail Cookies intakt!)."
    )
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
