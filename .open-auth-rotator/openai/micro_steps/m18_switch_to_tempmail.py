import asyncio, nodriver as uc, sys
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    await t.bring_to_front()
    print("M18 OK: Zurueck zu Temp-Mail.")
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
