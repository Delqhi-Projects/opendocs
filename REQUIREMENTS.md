# OpenDocs — REQUIREMENTS.md

## Production Dependencies (February 2026 Standard)

OpenDocs is built for high-performance, local-first environments with a hardened server proxy model.

### 🏗 Core UI & State
- `react@19.2.3`: Latest stable React with enhanced concurrent rendering.
- `react-dom@19.2.3`: DOM renderer for React.
- `zustand@5.0.11`: High-performance state management with LocalStorage persistence.
- `nanoid@5.1.6`: Robust ID generation (replaces browser-restricted `crypto.randomUUID`).
- `lucide-react@0.563.0`: Standardized icon system for 2026 UX.
- `clsx@2.1.1` & `tailwind-merge@3.4.0`: Utilities for atomic CSS orchestration.

### 📊 Advanced Data Visualization
- `@xyflow/react@12.10.0`: Powering the **Workflow Graph / Flow** database views.
- `@excalidraw/excalidraw@0.18.0`: Professional vector whiteboarding for "Draw" blocks.
- `mermaid@11.12.2`: Markdown-driven diagram rendering.

### 🤖 Intelligence & Content
- `react-markdown@10.1.0` & `remark-gfm@4.0.1`: Full GFM markdown support in document blocks.
- `openai@latest`: (via server proxy) Driver for NVIDIA/Kimi agent planning.

### ☁️ Infrastructure & Connectivity
- `@supabase/supabase-js@2.95.3`: Frontend sync, auth, and presence.
- `express@5.2.1`: Modern, low-latency API proxy and DB provisioning server.
- `pg@8.18.0`: Direct Postgres driver for server-side Supabase provisioning.
- `node-html-parser@7.0.2`: Fast, reliable scraper for website analysis.

### 🛠 Development Suite
- `vite@7.2.4`: Next-gen frontend tooling.
- `tailwindcss@4.1.17`: JIT styling engine.
- `typescript@5.9.3`: Strict type-safety across the stack.

---
© 2026 OpenDocs Project.
