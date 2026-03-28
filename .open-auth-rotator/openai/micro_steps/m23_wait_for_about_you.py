import asyncio, nodriver as uc, sys
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    for i in range(60): # Max 30 Sekunden
        t = next((tab for tab in b.tabs if 'about-you' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
        if t:
            print(f"M23 OK: about-you nach {i * 0.5}s da.")
            await t.bring_to_front()
            return True
        await asyncio.sleep(0.5)
    print("M23 FAIL: Nicht auf about-you angekommen.")
    return False
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
