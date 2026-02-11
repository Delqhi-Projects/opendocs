# OpenDocs

> **Besser als Notion + Linear + Plane.**
> Das Open Source Betriebssystem für Dokumentation, relationale Datenbanken und visuelle Workflows. Gebaut mit Best Practices Februar 2026.

---

## ⚡ Kern-Features (100% Implementiert)
- **AI Prompt Block:** Erstellen Sie komplexe Dokumentations-Strukturen per natürlicher Sprache. Die KI generiert echte Tabellen, Guides und Diagramme direkt im Dokument.
- **Echte Datenbanken:** Datenbank-Blöcke erzeugen automatisch echte Tabellen in Ihrem Supabase/Postgres Backend mit **6 interaktiven Ansichten** (Tabelle, Kanban, Flow, Kalender, Timeline, Galerie).
- **Per-Block AI Agent:** Jeder Block verfügt über einen eigenen KI-Kontext für gezielte Transformationen (Refactor, Summarize, Translate).
- **Visuelle n8n Orchestrierung:** Verbinden und überwachen Sie Automations-Knoten visuell direkt in Ihrem Dokument.
- **Object-Based Whiteboard:** Verschieben Sie Datenbank-Einträge auf einem Graphen; Positionen werden sofort in SQL persistiert.
- **Hard Locks (R2):** Schützen Sie kritische Bereiche vor KI- oder Benutzer-Änderungen.

## 🛠 Setup & Launch
1. **Repository klonen**
2. **Environment konfigurieren** (`.env.example` -> `.env`)
3. **Abhängigkeiten installieren:** `npm install`
4. **Server starten (AI Proxy + DB Sync):** `node server.js`
5. **Frontend starten:** `npm run dev`

## 📘 Dokumentation (Master Plans)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technisches Herzstück & Schichtenmodell.
- [AGENTS-PLAN.md](./AGENTS-PLAN.md) - Chronologisches Task-System & Session-Log.
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Vollständige Dependency-Liste.
- [API-ENDPOINTS.md](./API-ENDPOINTS.md) - REST API Referenz (n8n, Agent, DB).
- [SUPABASE.md](./SUPABASE.md) - Visueller-Relationaler Daten-Guide.
- [ONBOARDING.md](./ONBOARDING.md) - Einstiegshilfe für Admins & User.

## 🏗 Architektur
OpenDocs nutzt eine **Client-First Architektur** mit einem Express 5 Proxy für KI-Anfragen und direkte Postgres-Provisionierung. Jede Datenbank-Tabelle im Dokument ist eine echte SQL-Tabelle in Ihrer Infrastruktur.

---
© 2026 OpenDocs Project. Ready for Enterprise.
