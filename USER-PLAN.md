# OpenDocs — USER-PLAN.md

**Projekt:** OpenDocs  
**Letzte Aktualisierung:** 2026-02-12  
**Version:** 1.0.0  
**Status:** Vollständiger Benutzer-Guide

---

## 📋 Inhaltsverzeichnis

1. [Einführung](#1-einführung)
2. [Schnellstart](#2-schnellstart)
3. [Oberfläche kennenlernen](#3-oberfläche-kennenlernen)
4. [Dokumente erstellen](#4-dokumente-erstellen)
5. [Blöcke verwenden](#5-blöcke-verwenden)
6. [Datenbank-Blöcke](#6-datenbank-blöcke)
7. [Automations-Blöcke](#7-automations-blöcke)
8. [KI-Integration](#8-ki-integration)
9. [Keyboard Shortcuts](#9-keyboard-shortcuts)
10. [Design & Themes](#10-design--themes)
11. [Sicherheit & Locks](#11-sicherheit--locks)
12. [Mobile Nutzung](#12-mobile-nutzung)
13. [Fehlerbehebung](#13-fehlerbehebung)
14. [FAQ](#14-faq)
15. [Best Practices](#15-best-practices)

---

## 1. Einführung

### 1.1 Was ist OpenDocs?

OpenDocs ist ein Open-Source-Betriebssystem für Dokumentation, relationale Datenbanken und visuelle Workflows. Es kombiniert die Einfachheit von Notion mit der Leistungsfähigkeit professioneller Datenbank-Tools und der Automation-Fähigkeiten von n8n.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPENDOCS ÖKOSYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│   │  Dokumente      │    │   Datenbanken   │    │  Automationen   │    │
│   │                 │    │                 │    │                 │    │
│   │  • Notizen      │    │  • Relational  │    │  • Visuelle    │    │
│   │  • Wiki         │    │  • 6 Ansichten │    │    Workflows    │    │
│   │  • Knowledge    │    │  • Echtzeit    │    │  • n8n         │    │
│   │    Base         │    │    Sync        │    │    Integration  │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│            │                     │                     │                │
│            └─────────────────────┼─────────────────────┘                │
│                                  │                                       │
│                          ┌──────┴──────┐                              │
│                          │  KI-Engine   │                              │
│                          │              │                              │
│                          │ • Per-Block  │                              │
│                          │   AI Agents  │                              │
│                          │ • Context    │                              │
│                          │   Awareness  │                              │
│                          └──────────────┘                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Kern-Features

| Feature | Beschreibung | Status |
|---------|-------------|--------|
| **AI Prompt Block** | Natürliche Sprache für Dokumentation | ✅ Fertig |
| **Datenbank-Blöcke** | 6 interaktive Ansichten | ✅ Fertig |
| **Per-Block AI** | KI-Kontext pro Block | ✅ Fertig |
| **Visuelle Automation** | n8n-ähnliche Workflows | ✅ Fertig |
| **Object-Based Whiteboard** | DB-Einträge auf Graphen | ✅ Fertig |
| **Hard Locks** | Kritische Bereiche schützen | ✅ Fertig |
| **Responsive Design** | Mobile-ready | ✅ Fertig |
| **Dark Mode** | System-Integration | ✅ Fertig |
| **Keyboard Shortcuts** | Volle Tastatur-Steuerung | ✅ Fertig |
| **Undo/Redo** | 50 Einträge History | ✅ Fertig |

### 1.3 Zielgruppe

- **Entwickler:** Die Dokumentation und Code-Basen verwalten möchten
- **Product Teams:** Die Projekte mit relationalen Datenbanken organisieren
- **Knowledge Manager:** Die Wikis und Knowledge Bases erstellen
- **Automations-Enthusiasten:** Die visuelle Workflows bauen möchten

---

## 2. Schnellstart

### 2.1 Systemanforderungen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SYSTEMANFORDERUNGEN                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ Node.js 20+ (empfohlen: 22 LTS)                                    │
│  ✅ npm 10+ oder yarn 4+                                                │
│  ✅ PostgreSQL 14+ (lokal oder Docker)                                 │
│  ✅ 4GB RAM minimum (8GB empfohlen)                                    │
│  ✅ 1GB freier Festplattenspeicher                                     │
│  ✅ Moderner Browser (Chrome 120+, Firefox 121+, Safari 17+)            │
│                                                                          │
│  Optional:                                                              │
│  ◐ Supabase (Cloud-Sync)                                               │
│  ◐ n8n (Advanced Workflows)                                             │
│  ◐ OpenClaw (Social Integrations)                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Installation

**Schritt 1: Repository klonen**

```bash
git clone https://github.com/your-org/opendocs.git
cd opendocs
```

**Schritt 2: Abhängigkeiten installieren**

```bash
npm install
```

**Schritt 3: Environment konfigurieren**

```bash
# Server Environment
cp .env.example .env

# Frontend Environment
cp .env.example .env.local
```

**Schritt 4: Environment Variables setzen**

```bash
# .env (Server)
NODE_ENV=development
PORT=3000
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
API_AUTH_TOKEN=your-secure-token-here
NVIDIA_API_KEY=your-nvidia-api-key (optional)

# .env.local (Frontend)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 2.3 Starten der Plattform

**Terminal 1: Backend + Proxy**

```bash
node server.js
```

**Terminal 2: Frontend**

```bash
npm run dev
```

**Terminal 3: Supabase (optional)**

```bash
supabase start
```

### 2.4 Verifizierung

Nach dem Start öffnen Sie `http://localhost:5173` und verifizieren Sie:

1. ✅ Seite lädt ohne Fehler
2. ✅ Dark/Light Mode funktioniert
3. ✅ Sidebar sichtbar und interaktiv
4. ✅ Console keine JavaScript-Fehler

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VERIFIZIERUNG-CHECKLISTE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [ ] Frontend lädt unter http://localhost:5173                          │
│  [ ] Keine roten Fehler in der Browser-Konsole                          │
│  [ ] Sidebar mit Dokumenten sichtbar                                    │
│  [ ] "+ Neues Dokument" Button klickbar                                │
│  [ ] Theme-Toggle funktioniert                                          │
│  [ ] Keyboard-Shortcuts (Ctrl+K) öffnen Palette                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Oberfläche kennenlernen

### 3.1 Hauptkomponenten

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OPENDOCS UI - ÜBERSICHT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📚 SIDEBAR (1)                                                       │ │
│  │                                                                       │ │
│  │  📁 Alle Dokumente                                                   │ │
│  │  ├─ 📄 Getting Started                                               │ │
│  │  ├─ 📄 Projekte                                                     │ │
│  │  │  ├─ 📄 Alpha                                                     │ │
│  │  │  └─ 📄 Beta                                                      │ │
│  │  └─ 📄 Archive                                                       │ │
│  │                                                                       │ │
│  │  ┌─ 🔒 Locks                                                         │ │
│  │  └─ ⚙️ Settings                                                      │ │
│  │                                                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🔝 HEADER (3)                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐    │ │
│  │  │ 🔍 [ Suchen...                  ]  [🌙/☀️]  [🔔]  [👤 User]     │    │ │
│  │  └────────────────────────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📦 BLOCKS CONTAINER (4)                                               │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────┐     │ │
│  │  │  📝 Paragraph Block                                         │     │ │
│  │  │                                                            │     │ │
│  │  │  Dies ist ein einfacher Textblock. Tippe hier, um zu      │     │ │
│  │  │  beginnen. Verwende / für das Block-Menü.                 │     │ │
│  │  └─────────────────────────────────────────────────────────────┘     │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🎯 AI PANEL (5) [Ctrl+G]                                            │ │
│  │                                                                        │ │
│  │  "Wie kann ich dir helfen?"                                          │ │
│  │  ┌────────────────────────────────────────┐                           │ │
│  │  │ 💡 Tipp: "Erstelle einen Projekt-      │                           │ │
│  │  │      Plan mit Meilensteinen"           │                           │ │
│  │  └────────────────────────────────────────┘                           │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar (1)

Die Sidebar bietet schnellen Zugriff auf alle Dokumente und Funktionen.

**Funktionen:**

| Element | Aktion | Shortcut |
|---------|--------|----------|
| **Alle Dokumente** | Liste aller Dokumente | - |
| **Favoriten** | Häufig genutzte Dokumente | ⭐ |
| **Kürzlich** | Zuletzt bearbeitete | 🕐 |
| **Gesperrt** | Geschützte Dokumente | 🔒 |
| **Papierkorb** | Gelöschte Dokumente | 🗑️ |

### 3.3 Header (3)

Der Header enthält globale Steuerungen und Status-Informationen.

**Elemente:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Suche     │ [🌙/☀️]  │  [🔔]  │  [👤]  │  [Ctrl+K]      │
│               │ Theme    │ Notify │ Profile│ Command         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Main Content Area (2)

Der Hauptbereich zeigt das aktive Dokument mit allen Blöcken an.

### 3.5 AI Panel (5)

Das KI-Panel ermöglicht natürliche Spracheingaben für die Dokumentenerstellung.

**Zugriff:**

- **Button:** Klicken Sie auf das 🤖 Symbol
- **Shortcut:** `Ctrl+G` (Mac) / `Strg+G` (Windows)

---

## 4. Dokumente erstellen

### 4.1 Neues Dokument

**Methode 1: Sidebar**

1. Klicken Sie auf das **+** Symbol neben "Alle Dokumente"
2. Geben Sie einen Dokumentnamen ein
3. Drücken Sie `Enter` zur Bestätigung

**Methode 2: Command Palette**

1. Drücken Sie `Ctrl+K`
2. Tippen Sie "Neues Dokument"
3. Wählen Sie "Neues Dokument erstellen"
4. Geben Sie einen Namen ein

**Methode 3: Tastatur**

1. Drücken Sie `Ctrl+N`
2. Dokument wird sofort erstellt

### 4.2 Dokument strukturieren

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOKUMENT-STRUKTUR-BEISPIEL                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📄 Mein Projekt-Dokument                                              │
│  │                                                                        │
│  ├── 📝 # Projekt-Titel                                                 │
│  │                                                                        │
│  ├── 📋 ## Übersicht                                                   │
│  │   └── Beschreibung des Projekts                                       │
│  │                                                                        │
│  ├── 📊 ## Meilensteine                                                │
│  │   └── [Datenbank-Block: Meilensteine]                               │
│  │                                                                        │
│  ├── 🤖 ## KI-Assistent                                                │
│  │   └── [AI-Prompt-Block: Hilf mir bei der Planung]                   │
│  │                                                                        │
│  └── ⚙️ ## Technische Details                                          │
│      └── [Code-Block: Konfiguration]                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Dokumente organisieren

**Ordner erstellen:**

1. Sidebar: Rechtsklick auf "Alle Dokumente"
2. Wählen Sie "Neuer Ordner"
3. Geben Sie einen Namen ein

**Dokumente verschieben:**

1. Klicken und halten Sie das Dokument
2. Ziehen Sie es in den Zielordner

---

## 5. Blöcke verwenden

### 5.1 Block-Grundlagen

Blöcke sind die fundamentalen Bausteine in OpenDocs. Jeder Block repräsentiert einen bestimmten Inhaltstyp.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLOCK-TYPEN                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📝 Inhalts-Blöcke                                                      │
│  ├── 📄 Paragraph - Normaler Text                                        │
│  ├── 📑 Heading (H1-H6) - Überschriften                                │
│  ├── 📋 List - Aufzählungen                                             │
│  ├── ✅ Checklist - Aufgaben-Liste                                      │
│  ├── ❝ Quote - Zitate                                                  │
│  ├── 🔖 Divider - Trennlinie                                            │
│  └── 💬 Callout - Hervorgehobene Hinweise                              │
│                                                                          │
│  📦 Medien-Blöcke                                                       │
│  ├── 🖼️ Image - Bilder                                                   │
│  ├── 🎬 Video - Videos                                                   │
│  ├── 📁 File - Dateien                                                  │
│  └── 🎵 Audio - Audio-Dateien                                           │
│                                                                          │
│  💻 Code-Blöcke                                                         │
│  ├── 💻 Code - Syntax-Highlighting                                       │
│  └── 📖 Bookmark - Web-Links                                            │
│                                                                          │
│  🗃️ Daten-Blöcke                                                        │
│  ├── 📊 Database - Relationale Daten                                     │
│  └── 📈 Spreadsheet - Tabellenkalkulation                              │
│                                                                          │
│  🤖 KI-Blöcke                                                           │
│  ├── 🤖 AI Prompt - KI-Generierung                                      │
│  └── 🧠 Per-Block AI - Kontext-Aware KI                               │
│                                                                          │
│  ⚡ Automations-Blöcke                                                   │
│  ├── ⚡ Automation - Visuelle Workflows                                  │
│  └── 🔗 Webhook - Externe Trigger                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Blöcke hinzufügen

**Methode 1: Slash-Command**

1. Klicken Sie an die gewünschte Position
2. Tippen Sie `/`
3. Wählen Sie den Block-Typ aus dem Menü

**Methode 2: Command Palette**

1. `Ctrl+K` drücken
2. "Block hinzufügen" eingeben
3. Gewünschten Block-Typ auswählen

### 5.3 Blöcke bearbeiten

**Text bearbeiten:**

1. Klicken Sie in den Block-Text
2. Ändern Sie den Text direkt

**Block-Eigenschaften:**

1. Klicken Sie auf das **⋮** (Drei-Punkte) Menü
2. Wählen Sie "Eigenschaften"
3. Passen Sie Farbe, Icon, etc. an

---

## 6. Datenbank-Blöcke

### 6.1 Datenbank erstellen

**Schritt 1: Block hinzufügen**

1. Tippen Sie `/db`
2. Wählen Sie "Database"

**Schritt 2: Spalten definieren**

```
Database: Meine Aufgaben
│
├── ID (Auto)       ← Automatisch generiert
├── Name (Text)     ← Aufgabenname
├── Status (Select) ← Todo, In Progress, Done
├── Priorität (Select) ← High, Medium, Low
├── Fällig (Date)  ← Fälligkeitsdatum
└── assignee (User) ← Zugewiesene Person
```

### 6.2 Ansichten wechseln

OpenDocs bietet 6 verschiedene Ansichten für dieselben Daten:

| Ansicht | Beschreibung |
|---------|-------------|
| **Table View** | Klassische Tabellen-Darstellung |
| **Kanban View** | Spalten nach Status/Kategorie |
| **Calendar View** | Monat/Woche/Tag-Ansichten |
| **Gallery View** | Karten mit Vorschaubildern |
| **Timeline View** | Gantt-Diagramm-ähnlich |
| **Flow View** | Knoten und Verbindungen |

### 6.3 Relationen erstellen

Datenbanken können miteinander verknüpft werden:

```
Beispiel: Projekte ↔ Aufgaben
│
├── Projekte-Tabelle
│   └── Aufgaben (Relation zu Aufgaben-Tabelle)
│
└── Aufgaben-Tabelle
    └── Projekt (Relation zu Projekte-Tabelle)
```

### 6.4 Formeln und Berechnungen

Nutzen Sie Formeln für automatische Berechnungen:

```
Formel-Beispiele:
│
├── SUM(Aufgaben.Fertig) → Fortschritt in %
├── CONCAT(User.Vorname, " ", User.Nachname) → Voller Name
├── IF(Status="Done", 1, 0) → Binärer Status
├── WORKDAYS(Start, Heute) → Arbeitstage
└── ROUND(AVG(Priorität), 2) → Durchschnittswert
```

---

## 7. Automations-Blöcke

### 7.1 Automation erstellen

**Schritt 1: Block hinzufügen**

1. Tippen Sie `/auto`
2. Wählen Sie "Automation"

**Schritt 2: Workflow gestalten**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATION-BEISPIEL                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚡ Workflow: Aufgaben-Erinnerung                                      │
│  │                                                                        │
│  ┌─────────┐                                                           │
│  │  🟢     │ Trigger: Manuell / Zeitplan                               │
│  │ Trigger │                                                           │
│  └────┬────┘                                                           │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────┐                                                           │
│  │  🔀     │ Condition: Status = "Overdue"                            │
│  │   IF    │                                                           │
│  └────┬────┘                                                           │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────┐                                                           │
│  │  📧     │ Action: Sende E-Mail                                      │
│  │  END    │                                                           │
│  └─────────┘                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Trigger-Typen

| Trigger | Beschreibung | Beispiel |
|---------|-------------|----------|
| **Manuell** | Benutzer startet | Button klicken |
| **Zeitplan** | Wiederholend | Jeden Montag 9:00 |
| **Webhook** | Externer HTTP-Aufruf | GitHub Webhook |
| **Ereignis** | Bei Datenänderung | Neue Zeile hinzugefügt |

### 7.3 Action-Typen

| Action | Beschreibung |
|--------|-------------|
| **Sende E-Mail** | E-Mail via SMTP |
| **Sende WhatsApp** | Nachricht via API |
| **Sende Chat** | Interne OpenDocs-Benachrichtigung |
| **Webhook** | Externe HTTP-Anfrage |
| **Datenbank-Update** | Datensatz ändern |
| **Bedingt** | If/Else-Verzweigung |

---

## 8. KI-Integration

### 8.1 AI Prompt Block

Der AI Prompt Block generiert Inhalte basierend auf natürlicher Sprache.

**Erstellen:**

1. Tippen Sie `/ai`
2. Wählen Sie "AI Prompt"

**Konfiguration:**

```
AI Prompt Block
│
├── Prompt: "Erstelle einen Projektplan für Q1"
│
├── Model: [NVIDIA / OpenAI / Anthropic]
│
├── Temperature: [0.0 - 1.0]
│   ├── 0.0 → Deterministisch
│   ├── 0.7 → Ausgewogen
│   └── 1.0 → Kreativ
│
└── Max Tokens: [100 - 4096]
```

### 8.2 Per-Block AI

Jeder Block kann KI-Funktionen nutzen:

```
Block AI Actions
│
├── ✨ AI Transformieren
│   ├── "Mache formeller"
│   ├── "Mache kürzer"
│   └── "Übersetze nach [Sprache]"
│
├── 📝 AI Zusammenfassen
│   └── "Gib mir die Kernaussagen"
│
└── 🔍 AI Erklären
    └── "Erkläre diesen Text"
```

### 8.3 Unterstützte Modelle

| Modell | Stärken | Kontext |
|--------|---------|---------|
| **NVIDIA (lokal)** | Schnell, privat | 128K |
| **GPT-4** | Universell | 128K |
| **Claude 3** | Analyse, Kreativität | 200K |
| **Gemini Pro** | Multimodal | 1M |

---

## 9. Keyboard Shortcuts

### 9.1 Globale Shortcuts

| Shortcut | Aktion | Windows | Mac |
|----------|--------|---------|-----|
| `Ctrl+K` | Command Palette | ✅ | ✅ |
| `Ctrl+G` | AI Panel | ✅ | ✅ |
| `Ctrl+J` | Chat | ✅ | ✅ |
| `Ctrl+B` | Sidebar | ✅ | ✅ |
| `Ctrl+N` | Neues Dokument | ✅ | ✅ |
| `Ctrl+Z` | Rückgängig | ✅ | ✅ |
| `Ctrl+Shift+Z` | Wiederholen | ✅ | ✅ |
| `Escape` | Schließen/Abbrechen | ✅ | ✅ |

### 9.2 Block-Shortcuts

| Shortcut | Aktion | Anwendung |
|----------|--------|-----------|
| `/p` | Paragraph | Normaler Text |
| `/h1` | Heading 1 | Hauptüberschrift |
| `/h2` | Heading 2 | Unterüberschrift |
| `/db` | Database | Datenbank |
| `/ai` | AI Prompt | KI-Generierung |
| `/auto` | Automation | Workflow |

### 9.3 Text-Formatierung

| Shortcut | Format |
|----------|--------|
| `Ctrl+B` | **Fett** |
| `Ctrl+I` | *Kursiv* |
| `Ctrl+U` | Unterstrichen |
| `Ctrl+`` | Inline Code |

---

## 10. Design & Themes

### 10.1 Dark/Light Mode

**Automatische Erkennung:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THEME-KONFIGURATION                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🌙 System-Dark                                                         │
│  ├── Erkennt Betriebssystem-Theme                                        │
│  └── Automatische Anpassung                                             │
│                                                                          │
│  ☀️ System-Light                                                        │
│  ├── Helle Farben                                                       │
│  └── Bessere Lesbarkeit bei Sonnenlicht                                 │
│                                                                          │
│  🔒 Manuelle Auswahl                                                    │
│  └── Unabhängig vom System                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Farbsystem

```
Farben (Light Mode)
│
├── Primary: #0066CC (Blau)
├── Secondary: #6B7280 (Grau)
├── Success: #10B981 (Grün)
├── Warning: #F59E0B (Orange)
├── Danger: #EF4444 (Rot)
├── Background: #FFFFFF
├── Surface: #F9FAFB
├── Border: #E5E7EB
└── Text: #111827 (Primary), #6B7280 (Secondary)

Farben (Dark Mode)
│
├── Primary: #60A5FA (Hellblau)
├── Secondary: #9CA3AF (Hellgrau)
├── Success: #34D399 (Hellgrün)
├── Warning: #FBBF24 (Hellorange)
├── Danger: #F87171 (Hellrot)
├── Background: #111827
├── Surface: #1F2937
├── Border: #374151
└── Text: #F9FAFB (Primary), #9CA3AF (Secondary)
```

### 10.3 Responsive Design

```
Breakpoints
│
├── xs: 0-639px (Mobile)
│   └── Mobile Overlay, keine Sidebar
│
├── sm: 640-767px (Großes Mobile)
│   └── Optimierte Touch-Targets
│
├── md: 768-1023px (Tablet)
│   └── Sidebar einklappbar
│
├── lg: 1024-1279px (Laptop)
│   └── Volle Sidebar
│
├── xl: 1280-1535px (Desktop)
│   └── Voller Funktionsumfang
│
└── 2xl: 1536px+ (Großer Bildschirm)
    └── Multi-Window Support
```

---

## 11. Sicherheit & Locks

### 11.1 Hard Locks

Hard Locks schützen kritische Bereiche vor versehentlichen Änderungen.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LOCK-TYPEN                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔓 Soft Lock                                                           │
│  ├── Kann von Owner aufgehoben werden                                    │
│  └── Zeigt Sperr-Icon                                                   │
│                                                                          │
│  🔒 Hard Lock                                                           │
│  ├── Nur von Owner aufhebbar                                             │
│  └── Alle Änderungen blockiert                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Locks erstellen

**Methode 1: Sidebar**

1. Rechtsklick auf Dokument
2. Wählen Sie "Sperren"
3. Wählen Sie Lock-Typ

**Methode 2: Im Dokument**

1. Klicken Sie auf das **🔓/🔒** Symbol
2. Wählen Sie "Dokument sperren"

---

## 12. Mobile Nutzung

### 12.1 Responsive Layout

```
Mobile Optimierungen
│
├── Sidebar
│   ├── Standard: Sichtbar
│   ├── Mobile: Overlay (von links)
│   └── Toggle: Hamburger-Menü ☰
│
├── Navigation
│   └── Zurück-Button ↑
│
├── Blöcke
│   └── Volle Breite auf Mobile
│
└── Interaktionen
    └── Touch-Targets: Mindestens 44px
```

### 12.2 Touch-Gesten

```
Unterstützte Gesten
│
├── Tippen → Block auswählen, bearbeiten
├── Lang drücken → Context-Menu öffnen
├── Wischen → Sidebar öffnen/schließen
└── Ziehen → Blöcke umsortieren
```

---

## 13. Fehlerbehebung

### 13.1 Häufige Probleme

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROBLEM-LÖSUNGEN                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⚠️ Problem: Seite lädt nicht                                           │
│  Ursache: Server nicht gestartet                                        │
│  Lösung: `node server.js` starten                                      │
│                                                                          │
│  ⚠️ Problem: Keine Verbindung zur Datenbank                            │
│  Ursache: Supabase/PostgreSQL nicht gestartet                           │
│  Lösung: `supabase start`                                              │
│                                                                          │
│  ⚠️ Problem: KI funktioniert nicht                                      │
│  Ursache: API-Key fehlt oder ungültig                                   │
│  Lösung: NVIDIA_API_KEY in .env prüfen                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Logs prüfen

**Server-Logs:**

```bash
# Live-Logs verfolgen
tail -f logs/server.log

# Nach Fehlern filtern
grep "ERROR" logs/server.log
```

---

## 14. FAQ

### 14.1 Allgemeine Fragen

```
F: Ist OpenDocs kostenlos?
A: Ja, OpenDocs ist komplett Open Source und kostenlos.

F: Kann ich OpenDocs offline nutzen?
A: Ja, mit lokalem Supabase.

F: Sind meine Daten sicher?
A: Ja, alle Daten werden lokal gespeichert.

F: Wie viele Dokumente kann ich erstellen?
A: Unbegrenzt.
```

### 14.2 Technische Fragen

```
F: Welche Browser werden unterstützt?
A: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+

F: Kann ich meine Daten exportieren?
A: Ja, als Markdown, JSON, CSV oder HTML.
```

---

## 15. Best Practices

### 15.1 Dokumenten-Struktur

```
Empfohlene Struktur
│
├── 📁 Projekte
│   ├── 📄 Projekt-Template
│   └── 📁 [Projektname]
│       ├── 📄 Übersicht
│       ├── 📄 Meilensteine
│       └── 📄 Archive
│
├── 📁 Knowledge Base
│   ├── 📁 Technisch
│   └── 📁 Admin
│
└── 📁 Team
```

### 15.2 Sicherheits-Checkliste

```
Sicherheits-Checkliste
│
├── [ ] Keine Passwörter in Dokumenten
├── [ ] Vertrauliche Dokumente sperren (Hard Lock)
├── [ ] API-Keys in .env, nie im Code
├── [ ] Regelmäßige Backups erstellen
└── [ ] Updates zeitnah installieren
```

---

## 📞 Support & Hilfe

### Dokumentation

- **Benutzer-Guide:** docs/USER-GUIDE.md
- **Architektur:** ARCHITECTURE.md
- **API-Referenz:** API-ENDPOINTS.md
- **Entwickler:** docs/DEVELOPER-GUIDE.md

### Community

- **GitHub:** https://github.com/opendocs/opendocs
- **Discord:** https://discord.gg/opendocs

---

**© 2026 OpenDocs Project - Tier 1 Production Edition**

*Letzte Aktualisierung: 2026-02-12*
