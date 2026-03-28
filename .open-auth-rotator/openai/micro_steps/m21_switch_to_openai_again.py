import asyncio, nodriver as uc, sys
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    # Check for email-verification OR about-you page
    t = next((tab for tab in b.tabs if 'email-verification' in getattr(tab, 'url', getattr(tab.target, 'url', '')) or 'create-account' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    await t.bring_to_front()
    print("M21 OK: OpenAI Tab aktiv.")
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
