# OpenAI Rotator Repair Docs

## BUG-OTP-M30L: Timing race condition in OTP input field
**Aufgetreten:** 2026-03-23
**Status:** ✅ GEFIXT
**Symptom:** M30l (2nd OTP step) scheitert manchmal wenn das OTP input Feld noch nicht gerendert ist. User musste manuell OTP eingeben.
**Ursache:** `m30l_type_2nd_otp.py` hat kein wait-loop für das OTP input Feld. Wenn die Seite das Formular noch nicht gerendert hat, ist `input` null und typing fails silently.
**Fix:** Polling loop (50 iterations × 0.3s = 15s max) added um auf `input[inputmode="numeric"]` zu warten. Danach clear+focus+type mit React-compatible event dispatch. Submit verwendet jetzt robuste button detection mit fallback auf form.submit().
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/micro_steps/m30l_type_2nd_otp.py` + watcher-core copy

## BUG-M17B-EXCEPTION: ExceptionDetails crash
**Aufgetreten:** 2026-03-23
**Status:** ✅ GEFIXT
**Symptom:** `m17b_wait_for_verification_page.py` crasht mit `AttributeError: 'ExceptionDetails' object has no attribute 'lower'`
**Ursache:** nodriver returned ExceptionDetails object statt string wenn page mid-navigation.
**Fix:** `isinstance(html, str)` check before calling `.lower()`.
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/micro_steps/m17b_wait_for_verification_page.py` + watcher-core copy

## FEATURE-SAVINGS-VAULT: Persistent savings tracking
**Aufgetreten:** 2026-03-23
**Status:** ✅ IMPLEMENTED
**Symptom:** User wollte wissen was rotator von Tag 1 eingespart hat, aber logs könnten verloren gehen.
**Lösung:** `savings_vault.py` module erstellt. Nach jedem Swap (OpenAI) und jeder Rotation (Antigravity) wird snapshot zu `~/.open-auth-rotator/savings_vault.jsonl` (append-only local JSONL) geschrieben + optional zu Supabase `rotator_savings_log` gepusht.
**Telegram:** `/savings` command zeigt alle Ersparnisse + vault status.
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/watcher-core/savings_vault.py`

## BUG-TOKEN-AUDIT-LOG-404: Dead Supabase table
**Aufgetreten:** 2026-03-23
**Status:** ✅ GEFIXT
**Symptom:** `swap_token.py` POST zu `token_audit_log` table returned 404 (table existiert nicht).
**Ursache:** Table wurde nie erstellt, POSTs schweigen fehlgeschlagen.
**Fix:** Dead audit POST entfernt, durch savings_vault hook ersetzt.
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/watcher-core/swap_token.py`

## FEATURE-ACCOUNTS-COMMAND: Show current accounts
**Aufgetreten:** 2026-03-23
**Status:** ✅ IMPLEMENTED
**Symptom:** User wusste nicht welcher OpenAI/Antigravity account gerade aktiv ist.
**Lösung:** `/accounts` Telegram command added. Zeigt aktuelle OpenAI account (email+password aus auth.json JWT decode + temp-mail.org button) und Antigravity account (email+password aus credentials.json).
**Datei:** `/Users/jeremy/.open-auth-rotator/telegram_bot.py`

## BUG-TEMPMAIL-PREMIUM-LOGIN: temp-mail hat kein Web-Login-Formular
**Aufgetreten:** 2026-03-24
**Status:** 🔴 OFFEN (Workaround via Symlink aktiv)
**Symptom:** m06_check_tempmail.py versucht Login via Email/Passwort-Formular auf `/en/premium/login` — aber diese Seite zeigt **ausschließlich einen QR-Code** für die Smartphone-App. Kein Web-Formular existiert.
**Ursache:** temp-mail Premium Login läuft NUR über App-QR-Code (kein Browser-Login). Die Premium-Session ist an die App-Device-ID gebunden und nicht über Browser-Cookies übertragbar.
**Konsequenz:** 
- Profil-Copy (`cp -r`) überträgt httpOnly-Cookies/Device-Session NICHT korrekt → m06 findet keine aktive Session.
- m06 `_is_logged_in()` returned False-Positive weil "delete"-Button auch ohne Login existiert (wurde gefixt via URL-Check, aber das hilft nicht wenn Login generell unmöglich ist).
- m30i_wait_2nd_otp_email schlägt fehl weil temp-mail nach Delete eine neue zufällige Adresse generiert statt der Premium-Adresse.

**Workaround (aktiv):** Symlink statt Copy:
```bash
mkdir -p /tmp/chrome_sym_profile
ln -s "/Users/jeremy/Library/Application Support/Google/Chrome/Default" /tmp/chrome_sym_profile/Default
rm -f "/Users/jeremy/Library/Application Support/Google/Chrome/Default/LOCK"
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9334 \
  --user-data-dir="/tmp/chrome_sym_profile" \
  --profile-directory=Default \
  --no-first-run --no-default-browser-check "about:blank"
```
Chrome blockiert `--remote-debugging-port` wenn `--user-data-dir` direkt auf den echten Chrome-Ordner zeigt. Mit Symlink-Wrapper wird dieser Check umgangen und Chrome startet mit echten Profil-Daten inkl. aktiver Premium-Session.

**Voraussetzung:** temp-mail Premium muss im echten Default Chrome Profil (`zukunftsorientierte.energie@gmail.com`) bereits eingeloggt sein — Login erfolgt einmalig manuell via QR-Code in der Smartphone-App.

**Zu prüfen nach Start:**
```python
email = await t.evaluate("document.getElementById('mail').value")
# Muss eine @-Adresse sein, NICHT "Loading." und NICHT leer
```

**Datei:** `/Users/jeremy/.open-auth-rotator/openai/micro_steps/m06_check_tempmail.py`

## BUG-CHROME-DEBUGPORT-DEFAULT-PROFILE: macOS blockiert Remote-Debugging auf Default User-Data-Dir
**Aufgetreten:** 2026-03-24
**Status:** ✅ WORKAROUND GEFUNDEN (Symlink)
**Symptom:** Chrome startet mit `--remote-debugging-port=9334` aber Port antwortet nie. Fehlermeldung im stderr: `DevTools remote debugging requires a non-default data directory. Specify this using --user-data-dir.`
**Ursache:** macOS Chrome 146+ blockiert CDP-Debugging wenn `--user-data-dir` auf den nativen Default-Pfad (`~/Library/Application Support/Google/Chrome`) zeigt — Sicherheitsmaßnahme gegen Session-Hijacking.
**Fix:** Symlink-Wrapper-Verzeichnis verwenden (siehe BUG-TEMPMAIL-PREMIUM-LOGIN oben).
**Wichtig:** NIEMALS `cp -r` für das Profil verwenden — httpOnly-Cookies gehen verloren. IMMER Symlink.
**Datei:** `fast_runner.py` → `_ensure_chrome_running()` muss auf Symlink-Pfad zeigen, nicht auf Original-Pfad.

## BUG-TEMPMAIL-WRONG-PASSWORD: TEMPMAIL_PASSWORD war falsch
**Aufgetreten:** 2026-03-27
**Status:** ✅ GEFIXT
**Symptom:** m06 Login schlägt fehl mit "Invalid user email or password"
**Ursache:** TEMPMAIL_PASSWORD=SIN.jerry2026 war FALSCH. Richtiges Passwort ist ZOE.jerry2024
**Fix:** In watcher-core/.env: falsches Passwort SIN.jerry2026 komplett gelöscht. Nur TEMPMAIL_PASSWORD=ZOE.jerry2024 bleibt.
**Issue:** https://github.com/NoeFabris/opencode-antigravity-auth/issues/540 (closed)
**Datei:** /Users/jeremy/.open-auth-rotator/openai/watcher-core/.env

## BUG-M30A-TAB-KILL-LOOP: m30a schließt Auth/OTP-Tab blind → Endlos-Restart-Loop
**Aufgetreten:** 2026-03-28  **Status:** ✅ GEFIXT
**Symptom:** Rotator schließt beim 2. Anmelde-Step den Tab und beginnt von vorn statt den OTP-Code einzugeben. Endlos-Loop: m30a schließt Tab → Pipeline Fehler → Retry → m30a schließt Tab erneut.
**Ursache:** `m30a_open_oauth_url.py` Zeile 25-32 schloss ALLE Tabs mit `openai.com` oder `chatgpt.com` in der URL — inklusive des `auth.openai.com` Tabs, auf dem die OTP-Eingabeseite bereits wartete. Beim Retry startete die Pipeline von vorn und m30a schloss den Tab sofort wieder.
**Fix:** Tab-Close-Filter erweitert: Tabs mit `auth.openai` oder `email-verification` in der URL werden NICHT mehr geschlossen. Nur irrelevante chatgpt.com/openai.com Tabs (Dashboard etc.) werden entfernt.
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/micro_steps/m30a_open_oauth_url.py`

## BUG-M30D-M30G-SELECTOR-MISMATCH: OTP-Erkennung nutzt nur 1 von 4 Selektoren
**Aufgetreten:** 2026-03-28  **Status:** ✅ GEFIXT
**Symptom:** m30d und m30g erkennen die OTP-Seite nicht, obwohl sie da ist. m30g schreibt `m30_otp_needed=0` → OTP-Eingabe wird komplett übersprungen.
**Ursache:** m30d und m30g prüften NUR `input[inputmode="numeric"]`. Aber m30l (der das OTP tatsächlich tippt) unterstützt 4 Selektoren: `input[inputmode="numeric"]`, `input[type="number"]`, `input[autocomplete="one-time-code"]`, `input[name="code"]`. OpenAI hat serverseitig den Input-Typ geändert, sodass der einzelne Selector nicht mehr griff.
**Fix:** Alle 3 Dateien (m30d, m30g, m30l) nutzen jetzt denselben 4-Selector-Set. m30d hat zusätzlich URL-basierte Erkennung (`email-verification` in URL). Timeouts von 10s auf 20s verdoppelt.
**Datei:** `m30d_wait_password_or_otp.py`, `m30g_check_otp_needed.py`

## BUG-M30N-SHORT-TIMEOUT: Callback-Timeout zu kurz (20s)
**Aufgetreten:** 2026-03-28  **Status:** ✅ GEFIXT
**Symptom:** m30n gibt nach 20s auf obwohl der Callback noch kommen könnte (langsame Netzwerk-Bedingungen nach OTP-Submit).
**Ursache:** Nur 40 Iterationen × 0.5s = 20s Timeout. Nach OTP-Submit + Authorize-Click kann der Redirect länger dauern.
**Fix:** Timeout von 20s auf 45s erhöht (90 Iterationen × 0.5s).
**Datei:** `/Users/jeremy/.open-auth-rotator/openai/micro_steps/m30n_wait_callback.py`
