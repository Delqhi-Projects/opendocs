import asyncio, nodriver as uc
import sys


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t_temp = await b.get("https://temp-mail.org/en/", new_tab=True)
    await asyncio.sleep(2)
    print("M05 OK: Temp-Mail im neuen Tab geoeffnet.")
    return True


if __name__ == "__main__":
    if asyncio.run(run()):
        sys.exit(0)
    sys.exit(1)
