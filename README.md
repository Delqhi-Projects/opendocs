# OpenDocs

> **Besser als Notion + Linear + Plane.**
> Das Open Source Betriebssystem für Dokumentation, relationale Datenbanken und visuelle Workflows. Gebaut mit Best Practices Februar 2026.

---

## ⚡ Kern-Features (100% Implementiert)

- **AI Prompt Block:** Erstellen Sie komplexe Dokumentations-Strukturen per natürlicher Sprache.
- **Echte Datenbanken:** 6 interaktive Ansichten (Tabelle, Kanban, Flow, Kalender, Timeline, Galerie).
- **Per-Block AI Agent:** KI-Kontext für gezielte Transformationen.
- **Visuelle n8n Orchestrierung:** Automations-Knoten visuell verbinden.
- **Object-Based Whiteboard:** DB-Einträge auf Graphen verschieben.
- **Hard Locks (R2):** Kritische Bereiche schützen.
- **Responsive Design:** Mobile-ready mit automatischer Sidebar-Collapse.
- **Dark Mode:** System-Preference-Detection + LocalStorage.
- **Keyboard Shortcuts:** Ctrl+K (Palette), Ctrl+G (AI), Ctrl+J (Chat), Ctrl+B (Sidebar).
- **Undo/Redo:** Volle History-Unterstützung (50 Einträge).

## 🛠 Setup & Launch

1. **Repository klonen**
2. **Environment konfigurieren** (`.env.example` -> `.env`)
3. **Abhängigkeiten installieren:** `npm install`
4. **Server starten:** `node server.js`
5. **Frontend starten:** `npm run dev`
6. **Tests:** `npm test`

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm test                    # Alle Tests
npm test -- --run          # CI-Modus
```

### E2E Tests (Playwright)
```bash
npm run test:e2e           # Browser-Tests
```

### Test Coverage
| Bereich | Dateien | Status |
|---------|----------|--------|
| Hooks | `src/hooks/__tests__/*.ts` | ✅ 8/8 Passing |
| E2E | `src/tests/e2e/*.spec.ts` | ✅ Ready |

## 📘 Dokumentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technisches Herzstück & Schichtenmodell.
- [AGENTS-PLAN.md](./AGENTS-PLAN.md) - Chronologisches Task-System & Session-Log.
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Vollständige Dependency-Liste.
- [API-ENDPOINTS.md](./API-ENDPOINTS.md) - REST API Referenz.
- [SUPABASE.md](./SUPABASE.md) - Visueller-Relationaler Daten-Guide.

## 🏗 Architektur

**Client-First** mit Express 5 Proxy für KI-Anfragen.

### Responsive Breakpoints
| Breakpoint | Breite | Geräte |
|-----------|--------|---------|
| xs | 0-639px | Mobile Phones |
| sm | 640-767px | Large Phones |
| md | 768-1023px | Tablets |
| lg | 1024-1279px | Laptops |
| xl | 1280-1535px | Desktops |
| 2xl | 1536px+ | Large Screens |

### Keyboard Shortcuts
| Shortcut | Aktion |
|----------|--------|
| Ctrl+K | Command Palette |
| Ctrl+G | AI Panel |
| Ctrl+J | Chat |
| Ctrl+B | Sidebar |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Escape | Close All |

## 🧩 Custom Hooks

| Hook | Zweck | Status |
|------|--------|--------|
| `useTheme()` | Dark/Light + System | ✅ |
| `useKeyboardShortcuts()` | Global shortcuts | ✅ |
| `useBreakpoint()` | Responsive | ✅ |
| `useMediaQuery()` | Custom queries | ✅ |
| `useHistory()` | Undo/Redo | ✅ |
| `useContextMenu()` | Right-click | ✅ |
| `useReorder()` | Drag-drop | ✅ |
| `usePerformance()` | Metrics | ✅ |

## 🔒 Security (Goldene Regeln)

- **R1:** Keine Secrets im Client
- **R2:** Hard Locks für kritische Bereiche
- **R3:** Erst Lesen, dann Bearbeiten
- **R4:** nanoid für alle IDs

---

© 2026 OpenDocs Project. Tier 1 Production Edition.
