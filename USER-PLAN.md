# USER-PLAN.md - OpenDocs User Task Checklist

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Production-Ready  

---

## Overview

This document provides a comprehensive checklist for users to get started with OpenDocs and utilize all features effectively.

---

## 🚀 Phase 1: Getting Started

### Installation Tasks

- [ ] **Clone Repository**
  ```bash
  git clone https://github.com/your-org/opendocs.git
  cd opendocs
  ```

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```

- [ ] **Configure Environment**
  ```bash
  cp .env.example .env
  # Edit .env with your settings
  ```

- [ ] **Set NVIDIA API Key** (Required for AI features)
  ```bash
  NVIDIA_API_KEY=nvapi-xxx
  ```

- [ ] **Start Development Server**
  ```bash
  node server.js
  ```

- [ ] **Start Frontend**
  ```bash
  npm run dev
  ```

- [ ] **Verify Installation**
  - Open http://localhost:5173
  - Check API health: http://localhost:3000/api/health

---

## 📁 Phase 2: Basic Setup

### Create Your Workspace

- [ ] **Create First Page**
  - Click `+` in sidebar
  - Enter title: "Welcome"
  - Press Enter

- [ ] **Create Folder Structure**
  - Right-click in sidebar
  - Select "New Folder"
  - Create folders:
    - 📂 Documentation
    - 📂 Projects
    - 📂 Tasks
    - 📂 Ideas

- [ ] **Set Page Icons**
  - Click page settings (⋮)
  - Select icon
  - Choose emoji or upload custom

- [ ] **Add Page Covers**
  - Click page settings
  - Upload cover image
  - Or use default patterns

---

## ⌨️ Phase 3: Learn Shortcuts

### Global Shortcuts

- [ ] **Command Palette** - Press `Ctrl+K`
  - Try searching for a page
  - Try creating a new page via command

- [ ] **AI Panel** - Press `Ctrl+G`
  - Open AI panel
  - Try summarizing a block

- [ ] **AI Chat** - Press `Ctrl+J`
  - Open AI chat
  - Ask a question

- [ ] **Toggle Sidebar** - Press `Ctrl+B`
  - Hide sidebar
  - Show sidebar

- [ ] **Undo/Redo** - `Ctrl+Z` / `Ctrl+Shift+Z`
  - Make a change
  - Undo the change
  - Redo the change

### Editor Shortcuts

- [ ] **Block Menu** - Type `/`
  - Open block menu
  - Select different block types

- [ ] **Headings** - Type `#`, `##`, or `###` + Space
  - Create Heading 1
  - Create Heading 2
  - Create Heading 3

- [ ] **Lists** - Type `-` + Space
  - Create bullet list
  - Create numbered list with `1.` + Space

- [ ] **Checkbox** - Type `[]`
  - Create unchecked checkbox
  - Click to check

---

## 📝 Phase 4: Content Creation

### Text Blocks

- [ ] **Create Heading Blocks**
  - Add Heading 1 for main titles
  - Add Heading 2 for sections
  - Add Heading 3 for subsections

- [ ] **Create Paragraph Blocks**
  - Add regular text content
  - Format with markdown

- [ ] **Create Callout Blocks**
  - Type `/callout`
  - Choose tone (info, success, warning, error, tip)
  - Add content

- [ ] **Create Quote Blocks**
  - Type `/quote`
  - Add quote text
  - Add optional caption

### Code Blocks

- [ ] **Create Code Block**
  - Type `/code`
  - Select language
  - Paste code

- [ ] **Create Mermaid Diagram**
  - Type `/mermaid`
  - Write Mermaid syntax
  - View rendered diagram

### Media Blocks

- [ ] **Add Image**
  - Type `/image`
  - Enter image URL
  - Add alt text and caption

- [ ] **Add Video**
  - Type `/video`
  - Enter video URL
  - Add caption

- [ ] **Add Link**
  - Type `/link`
  - Enter URL
  - View preview

---

## 🗄️ Phase 5: Database Blocks

### Basic Database

- [ ] **Create Database Block**
  - Type `/database`
  - Name your database
  - Add columns

- [ ] **Add Columns**
  - Text column for names
  - Number column for values
  - Select column for status
  - Date column for dates
  - Checkbox column for completion

- [ ] **Add Rows**
  - Click in cells to add data
  - Fill in all columns

- [ ] **Edit Data**
  - Click cell to edit
  - Use keyboard to navigate

### Database Views

- [ ] **Table View**
  - Default view
  - Sort by column
  - Resize columns

- [ ] **Kanban View**
  - Switch to Kanban
  - Group by status column
  - Drag cards between columns

- [ ] **Graph View**
  - Switch to Graph
  - Drag nodes to position
  - Connect related items

- [ ] **Calendar View**
  - Switch to Calendar
  - View items by date
  - Click to add items

- [ ] **Timeline View**
  - Switch to Timeline
  - View items on timeline
  - Adjust date ranges

- [ ] **Gallery View**
  - Switch to Gallery
  - View items as cards
  - Display images

### Remote Database (Optional)

- [ ] **Configure Supabase**
  - Set SUPABASE_DB_URL in .env
  - Restart server

- [ ] **Enable Remote Sync**
  - Open database settings
  - Toggle "Remote Sync"
  - Enter connection details

- [ ] **Verify Sync**
  - Add data in OpenDocs
  - Check Supabase dashboard
  - Verify data appears

---

## 🤖 Phase 6: AI Features

### AI Prompt Block

- [ ] **Create AI Prompt Block**
  - Type `/ai`
  - Enter prompt
  - Click "Generate"

- [ ] **Example Prompts to Try**
  ```
  "Create a meeting agenda template for weekly standup"
  "Write a product description for a mobile app"
  "Generate a FAQ section for customer support"
  "Create a project roadmap with milestones"
  ```

- [ ] **Review and Edit Results**
  - Read generated content
  - Edit as needed
  - Regenerate if unsatisfied

### AI Chat

- [ ] **Open AI Chat** - `Ctrl+J`
  - Ask questions about your content
  - Request changes to pages
  - Get help with features

- [ ] **Example Commands**
  ```
  "Create a new page called 'Roadmap'"
  "Summarize this page in 3 bullet points"
  "Add a checklist to the current block"
  "Find all pages with the word 'project'"
  ```

### AI Panel

- [ ] **Open AI Panel** - `Ctrl+G`
  - Select a block
  - Open AI panel
  - Choose action

- [ ] **Available Actions**
  - Summarize
  - Expand
  - Simplify
  - Translate
  - Fix Grammar

---

## ⚡ Phase 7: Automation

### Create Automation

- [ ] **Create Automation Block**
  - Type `/automation`
  - Name your automation

- [ ] **Add Trigger**
  - Drag trigger node
  - Configure:
    - Webhook (for external events)
    - Schedule (for timed events)
    - DB Row Changed (for database changes)
    - Manual (for button clicks)

- [ ] **Add Logic**
  - Drag logic node
  - Configure:
    - If/Else (conditional branching)
    - Switch (multi-path branching)
    - Wait (delay execution)

- [ ] **Add Action**
  - Drag action node
  - Configure:
    - Send Email
    - Send Webhook
    - Update DB Row
    - Call n8n
    - OpenClaw Message

- [ ] **Connect Nodes**
  - Drag from trigger output
  - Connect to logic input
  - Connect to action input

- [ ] **Enable Automation**
  - Click "Enable"
  - Test with manual trigger

### Example Automations

- [ ] **Task Completion Notification**
  ```
  Trigger: DB Row Changed (status = 'done')
  Logic: If priority = 'high'
  Action: Send Email to team
  ```

- [ ] **Daily Summary**
  ```
  Trigger: Schedule (9:00 AM daily)
  Logic: None
  Action: Send Webhook to Slack
  ```

- [ ] **WhatsApp Alert**
  ```
  Trigger: DB Row Changed (status = 'urgent')
  Logic: If assignee exists
  Action: OpenClaw Message (WhatsApp)
  ```

---

## 📊 Phase 8: Advanced Features

### n8n Integration (Optional)

- [ ] **Configure n8n**
  - Set N8N_BASE_URL in .env
  - Set N8N_API_KEY
  - Restart server

- [ ] **Create n8n Block**
  - Type `/n8n`
  - Configure node
  - Connect to other blocks

- [ ] **Execute Workflow**
  - Click "Execute"
  - View results

### OpenClaw Integration (Optional)

- [ ] **Configure OpenClaw**
  - Set OPENCLAW_BASE_URL in .env
  - Set OPENCLAW_TOKEN
  - Restart server

- [ ] **Test Integration**
  - Open AI Chat
  - Send test message

- [ ] **Use in Automation**
  - Add OpenClaw action node
  - Configure platform and recipient
  - Test message sending

### Excalidraw Whiteboard

- [ ] **Create Draw Block**
  - Type `/draw`
  - Open Excalidraw canvas

- [ ] **Draw Shapes**
  - Rectangle, ellipse, arrow
  - Lines and freehand

- [ ] **Add Text**
  - Click and type
  - Format text

- [ ] **Save Canvas**
  - Auto-saves on change
  - Export as PNG/SVG

---

## 🔒 Phase 9: Security & Locks

### Hard Locks

- [ ] **Lock Critical Block**
  - Click block settings
  - Toggle "Lock"
  - Confirm lock

- [ ] **Verify Lock**
  - Try to edit locked block
  - Should show lock indicator

- [ ] **Unlock Block**
  - Click block settings
  - Toggle "Lock" off
  - Confirm unlock

### Access Control (Optional)

- [ ] **Set API_AUTH_TOKEN**
  - Generate secure token
  - Add to .env
  - Restart server

- [ ] **Use Token in Requests**
  - Add `X-OpenDocs-Token` header
  - Include token value

---

## 📱 Phase 10: Mobile & Responsive

### Test Responsive Design

- [ ] **Test Mobile View**
  - Open DevTools (F12)
  - Toggle device toolbar
  - Select mobile device

- [ ] **Check Sidebar Collapse**
  - On mobile, sidebar should auto-collapse
  - Tap hamburger menu to open

- [ ] **Test Touch Interactions**
  - Drag and drop
  - Tap to select
  - Long press for context menu

---

## ✅ Completion Checklist

### Basic Proficiency

- [ ] Created pages and folders
- [ ] Used at least 5 different block types
- [ ] Created a database with multiple views
- [ ] Used AI features (prompt, chat, panel)
- [ ] Memorized keyboard shortcuts
- [ ] Created a simple automation

### Advanced Proficiency

- [ ] Configured remote database sync
- [ ] Integrated n8n workflows
- [ ] Set up OpenClaw messaging
- [ ] Created complex multi-step automations
- [ ] Used Excalidraw for diagrams
- [ ] Configured security settings

---

## 📚 Additional Resources

| Resource | Location |
|----------|----------|
| Architecture Documentation | `ARCHITECTURE.md` |
| API Reference | `API-ENDPOINTS.md` |
| Database Guide | `SUPABASE.md` |
| Integration Guide | `OPENCLAW.md` |
| Full User Guide | `ONBOARDING.md` |
| Development Tasks | `AGENTS-PLAN.md` |

---

## 🆘 Getting Help

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to server | Check if server is running: `node server.js` |
| AI not working | Verify NVIDIA_API_KEY is set |
| Database not syncing | Check SUPABASE_DB_URL configuration |
| Keyboard shortcuts not working | Check if focus is on input field |

### Support Channels

- **Documentation:** Check `ONBOARDING.md`
- **GitHub Issues:** Report bugs and request features
- **Community:** Join discussions on GitHub

---

**Document Statistics:**
- Total Lines: 350+
- Phases: 10
- Checkboxes: 80+
- Tables: 5

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
