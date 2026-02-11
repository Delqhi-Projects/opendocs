# OpenDocs — ONBOARDING.md

## Welcome to the Future of Documentation

OpenDocs (Feb 2026 Edition) is not just a document editor. It is a **Unified Orchestration Engine** for teams that value speed, relational data, and AI-powered automation.

---

## 🏗 Admin & Developer Onboarding

### The Three Pillars of OpenDocs
1. **Relational Data (Supabase):** Every Database block in a document provisions a real, deterministic Postgres table. Use this for structured tasks, roadmaps, and member lists.
2. **Visual Intelligence (Excalidraw/ReactFlow):** Documentation is visual. Use "Draw" blocks for free-form ideas and "Database Flow" views to map relational data onto a canvas.
3. **Autonomous Agency (NVIDIA Kimi):** The AI Agent (`Cmd+J`) can control the application. Ask it to "Build a structure for a project management doc" and watch it execute.

### Integration Stack
- **OpenClaw Bridge:** Connects to WhatsApp/Meta. All credentials live server-side for security.
- **n8n Nodes:** Insert real n8n modules as document blocks. Connect them visually to build backend automations without leaving your knowledge base.

---

## 🚀 User Quick-Start Guide

### ⌨️ Key Commands
- `/` : Open the **Slash Menu** to insert 20+ different block types.
- `Cmd+K` : Open the **Command Palette** for rapid app navigation and actions.
- `Cmd+J` : Open the **AI Agent Chat** (Global context).
- `Cmd+G` : Open the **AI Generator** to ingest URLs or topics.
- `Sidebar Search` : Use the search bar in the sidebar to filter through pages instantly.

### 📊 Relational Databases
1. Insert a "Database" block.
2. Switch between **Table**, **Kanban**, **Workflow**, and **Roadmap** views using the toggle in the block header.
3. Your data stays in sync regardless of the view.

### 🤖 Per-Block AI
- Look for the **Bot Icon** on any block toolbar.
- Each block has its own dedicated AI mini-chat.
- Ask the AI to "Refactor this code," "Summarize this table," or "Add a connection to this n8n node."

---

## 🔒 Security & Data Safety (Rule R2)
- **Hard Locks:** Click the 🔓 icon on any block to protect it.
- Locked blocks **cannot be deleted or modified** by you or the AI until unlocked.
- This ensures your "Single Source of Truth" remains untampered.

---

OpenDocs is designed for local-first reliability. Ensure your local containers are configured in `.env` to unlock the full power of real-time sync and provisioning.
