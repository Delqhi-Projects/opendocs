import asyncio, nodriver as uc, sys
_EXTRACT = """(function(){
    var txt = document.body.innerText;
    var m = txt.match(/\\b([0-9]{6})\\b/);
    return m ? m[1] : null;
})()"""
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next((tab for tab in b.tabs if 'temp-mail.org' in getattr(tab, 'url', getattr(tab.target, 'url', ''))), None)
    if not t: return False
    
    for ms in [1, 3, 5]:
        await asyncio.sleep(ms)
        otp = await t.evaluate(_EXTRACT)
        if otp and len(otp) == 6:
            with open("/tmp/current_otp.txt", "w") as f: f.write(otp)
            print(f"M20 OK: OTP = {otp}")
            return True
            
    print("M20 FAIL: OTP nicht im Text gefunden.")
    return False
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
