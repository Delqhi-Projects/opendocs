import asyncio, nodriver as uc, sys


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    for _ in range(90):
        for tab in b.tabs:
            curr = getattr(tab, "url", getattr(tab.target, "url", "")) or ""
            if "localhost:1455" in curr:
                print(
                    "M30n OK: Callback auf localhost:1455 erreicht! Token gespeichert."
                )
                return True
        await asyncio.sleep(0.5)
    print("M30n FAIL: Callback nicht erreicht nach 45s.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
