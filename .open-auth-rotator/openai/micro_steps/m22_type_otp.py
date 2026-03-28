import asyncio, nodriver as uc, sys
import nodriver.cdp.input_ as input_cdp
async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab for tab in b.tabs
            if any(x in getattr(tab, "url", getattr(tab.target, "url", "")) for x in ["auth.openai", "email-verification", "chatgpt.com/auth", "create-account"])
        ),
        None,
    )
    if not t: return False
    with open("/tmp/current_otp.txt", "r") as f: otp = f.read().strip()
    
    await t.evaluate("document.querySelector('input').focus();")
    await asyncio.sleep(0.5) 
    
    for char in otp:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.1) 
        
    print(f"M22 OK: OTP {otp} getippt.")
    
    # NEU: Klick auf "Weiter" unter dem OTP-Feld!
    clicked = await t.evaluate("""(function(){
        var btn = document.querySelector('button[type="submit"]');
        if(btn && !btn.disabled) { btn.click(); return true; }
        return false;
    })()""")
    
    if clicked:
        print("M22 OK: OTP 'Weiter' geklickt.")
    else:
        print("M22 WARN: Kein aktiver 'Weiter' Button nach OTP (vielleicht Auto-Submit?).")
        
    return True
if __name__ == "__main__": sys.exit(0 if asyncio.run(run()) else 1)
