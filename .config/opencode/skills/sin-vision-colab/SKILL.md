---
name: sin-vision-colab
description: "Screen recording + AI vision analysis via direct Gemini REST API. No browser, no Colab MCP, no CDP. Pure REST with 3-model fallback chain for unlimited vision calls."
license: Apache-2.0
compatibility: opencode
metadata:
  audience: all-agents
  workflow: screen-vision-analysis
  trigger: screen-record, screenshot, vision-analyze, look-screen
  version: v4.1-gemini-rest-fallback
---

# A2A-SIN-Vision-Colab Skill (v4.1 SOTA 2026)

Screen recording + AI vision analysis via **direct Gemini REST API** with a **3-model fallback chain**.

## 🔴 WHAT DOES NOT WORK (April 2026)

- ❌ **Browser automation (nodriver, AppleScript) for Colab** — Chrome 146+ blocks DevToolsActivePort
- ❌ **Colab MCP Server** — requires open browser tab, not headless
- ❌ **CDP on default Chrome profile** — blocked since Chrome 146
- ❌ **Leaked Gemini API keys** — old keys are revoked immediately by Google

## 🟢 ARCHITECTURE (V4.1 - Direct Gemini REST API)

```
[Agent] → look-screen CLI → [Gemini REST API] → Vision Analysis
              ↓                    ↑
        screencapture -x      base64 inline_data
              ↓                    ↑
        /tmp/screen.png      3-model fallback chain
```

## 🔑 KEY FEATURES

- ✅ **KEIN Browser!** — Pure REST, no browser at all
- ✅ **KEIN Colab MCP!** — Direct Gemini API, no notebook needed
- ✅ **KEIN CDP!** — No Chrome DevTools Protocol
- ✅ **3-Model Fallback Chain** — Practically unlimited free-tier calls
- ✅ **API Key:** `AIzaSyCnRoGEoQJBAVssEu6BP1ojSBzIwV5r8_o`
- ✅ **Auto-Rotation** — Switches model on 403/429 errors

## 📋 FALLBACK CHAIN (Free Tier Limits — BEACHTEN!)

| Priority | Model | Free Tier RPM | Free Tier TPM | Free Tier PD | Purpose |
|----------|-------|---------------|---------------|--------------|---------|
| 1 | `gemini-3-flash-preview` | 5 | 250K | 20 | Primary vision |
| 2 | `gemini-3-pro-preview` | Unbegrenzt | 65K | Unbegrenzt | High-quality vision |
| 3 | `gemini-3.1-flash-lite-preview` | 15 | 250K | 500 | Lightweight backup |

**⚠️ WICHTIG: Free Tier Limits beachten!**
- `gemini-3-flash-preview`: Nur 5 RPM / 20 PD — bei Live-Monitoring `--interval` auf mindestens 12s setzen!
- `gemini-3.1-flash-lite-preview`: 15 RPM / 500 PD — besser für häufige Aufrufe
- `gemini-3-pro-preview`: Unbegrenzt — bestes Modell, aber langsamere Antwortzeiten
- **Empfehlung für Live-Monitoring:** `--interval 15` oder höher um 429 zu vermeiden

## 📋 COMPUTER USE PREVIEW

Gemini 3 Pro unterstützt **Computer Use Preview** — ideal für automatisierte Screen-Interaktionen:

```bash
look-screen --screenshot /tmp/screen.png --describe --prompt "What UI element should I click next? Provide exact coordinates."
```

**Achtung:** Wenn ein Modell kein Bild unterstützt, erscheint: `ERROR: Cannot read "Download.png" (this model does not support image input).`
In diesem Fall wechselt look-screen automatisch zum nächsten Modell in der Fallback-Kette.

## 📋 WANN NUTZEN

| Trigger | Aktion |
|---------|--------|
| "nimm bildschirm auf" | `look-screen --record` |
| "analysiere bildschirm" | `look-screen --screenshot /tmp/screen.png --describe` |
| "was siehst du?" | `look-screen --once --screenshot /tmp/screen.png` |
| "überwache bildschirm" | `look-screen --interval 15` |
| "stop aufnahme" | `look-screen --stop` |

## 🚀 SETUP

### 1. look-screen CLI ist bereits installiert

```bash
# Symlink: ~/.local/bin/look-screen → ~/.open-auth-rotator/tools/look_screen.py
look-screen --version
# Output: look-screen v4.1.0 (Gemini REST API + Fallback Chain)
```

### 2. API Key konfigurieren (optional)

Der API Key ist hardcoded im Script. Überschreiben via Environment Variable:

```bash
export GEMINI_VISION_API_KEY="your-key-here"
```

### 3. Verifizieren

```bash
look-screen --status
# Expected:
# [look-screen] Vision Architecture: v4.1-gemini-rest-fallback
# [look-screen] API Keys: 3 configured (auto-rotate on 403/429)
# [look-screen] Models (3): gemini-3-flash-preview, gemini-3-pro-preview, gemini-3.1-flash-lite-preview
# [look-screen] Browser Automation: NONE (Pure REST)
# [look-screen] Status: Active
```

## 🔧 LOOK-SCREEN CLI

```bash
# Status prüfen
look-screen --status

# Screenshot analysieren
look-screen --screenshot /tmp/screen.png --describe

# Mit custom Prompt
look-screen --screenshot /tmp/screen.png --describe --prompt "Ist ein Fehler sichtbar?"

# Kontinuierliche Überwachung (ACHTUNG: Interval >= 15s wegen Free Tier Limits!)
look-screen --interval 15

# Screenshot + Analyse in einem Befehl
screencapture -x /tmp/screen.png && look-screen --screenshot /tmp/screen.png --describe
```

## 🔄 AGENT WORKFLOW

```python
import subprocess

# 1. Screenshot machen
subprocess.run(["screencapture", "-x", "/tmp/screen.png"])

# 2. Analyse anfordern
result = subprocess.run(
    ["look-screen", "--screenshot", "/tmp/screen.png", "--describe"],
    capture_output=True, text=True
)
analysis = result.stdout
```

## ⚠️ ARCHITECTURAL RULE: NO BROWSER FOR VISION

**NIEMALS** versuchen, Vision-Analyse über Browser, Colab MCP oder CDP zu machen.
Immer `look-screen` CLI nutzen — das ruft direkt die Gemini REST API auf.

## 🔗 RESSOURCEN

- [Gemini Vision API Docs](https://ai.google.dev/gemini-api/docs/vision)
- [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Computer Use Preview](https://ai.google.dev/gemini-api/docs/computer-use)
