# PLAN 05: BLOCK EDITOR V2 ✏️

**Priority:** MEDIUM  
**Status:** PLANNED  
**Created:** 2026-02-17  
**Dependencies:** PLAN 01 (Recovery)

---

## 🎯 ZIEL

Notion-ähnlicher Block Editor mit:

- Slash Commands (/)
- Drag & Drop Block Reordering
- Inline Editing
- Multiple Block Types
- Block Handle (drag, delete, duplicate)

---

## 📋 TASKS

### Task 5.1: SLASH COMMANDS

**Features:**

1. Tip "/" öffnet Command Menu
2. Search/Filter Commands
3. Icon + Description
4. Keyboard Navigation
5. Categories (Text, Media, Advanced)

**Block Types:**

- Text: Paragraph, H1, H2, H3, Bullet, Numbered
- Media: Image, Video, Embed, File
- Code: Code Block, Mermaid
- Advanced: Callout, Quote, Divider, Toggle

### Task 5.2: DRAG & DROP

- Block Handle (⋮⋮)
- Visual Drop Indicator
- Smooth Animation
- Multi-Block Drag

### Task 5.3: INLINE EDITING

- Bold, Italic, Underline
- Strikethrough, Code, Highlight
- Links (Strg+K)
- Text Color / Background

### Task 5.4: BLOCK TYPES (15+)

- ParagraphBlock.tsx
- HeadingBlock.tsx
- ListBlock.tsx
- CodeBlock.tsx
- ImageBlock.tsx
- VideoBlock.tsx
- QuoteBlock.tsx
- CalloutBlock.tsx
- DividerBlock.tsx
- ToggleBlock.tsx

### Task 5.5: BLOCK HANDLE

- Hover zeigt Handle
- Menu: Delete, Duplicate, Move
- Multi-Select (Shift+Click)

---

## 🎯 SUCCESS CRITERIA

✅ Slash Menu bei "/"  
✅ 15+ Block Types  
✅ Drag & Drop smooth  
✅ Inline Editing complete  
✅ Block Handle mit Menu

**ETA:** 5-6 Tage
