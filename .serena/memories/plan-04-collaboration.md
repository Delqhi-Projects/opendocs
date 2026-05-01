# PLAN 04: COLLABORATION FEATURES V2 💬

**Priority:** HIGH  
**Status:** PLANNED (NEXT TO IMPLEMENT)  
**Created:** 2026-02-17  
**Dependencies:** PLAN 01 (Recovery)

---

## 🎯 ZIEL

Enterprise-grade Collaboration Features für OpenDocs:

- Real-time Comments (bereits angelegt, muss fertig werden)
- Live Cursors / Presence
- Live Selection Sync
- Comment Threads mit Replies
- @Mentions mit Notifications

---

## 📋 TASKS

### Task 4.1: COMMENTS SYSTEM (Finish Existing)

**Current Status:** Comments system wurde angelegt (git log: "feat: add Comments system for document blocks")

**Actions:**

1. Review existierende Implementation
2. Comment Threads (nested replies)
3. Edit/Delete Comments
4. Resolve/Unresolve Comments
5. Comment Anchors (an Blocks gebunden)

**Files to Check:**

- [ ] `src/components/Comments/` (existiert?)
- [ ] `src/hooks/useComments.ts`
- [ ] `src/api/comments.ts`

**To Create:**

- [ ] CommentThread.tsx
- [ ] CommentReply.tsx
- [ ] CommentMenu.tsx (edit, delete, resolve)
- [ ] CommentAnchor.tsx (visual marker)

### Task 4.2: REAL-TIME PRESENCE

**Features:**

1. Live Cursors (andere User sehen deinen Cursor)
2. User List (wer ist online)
3. Activity Indicators (wer editiert gerade)
4. Color Coding (jeder User hat eigene Farbe)

**Implementation:**

```typescript
// Presence Data Structure
interface Presence {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: { line: number; ch: number };
  selection?: { from: number; to: number };
  lastActive: number;
}
```

**Files:**

- [ ] `src/hooks/usePresence.ts`
- [ ] `src/components/Presence/UserList.tsx`
- [ ] `src/components/Presence/LiveCursor.tsx`
- [ ] `src/store/presence-store.ts`

### Task 4.3: SELECTION SYNC

**Features:**

1. Sync selections across clients
2. Show other users' selections (colored highlights)
3. Conflict Detection (wenn 2 User am selben Block)
4. Optimistic Updates

**Files:**

- [ ] `src/hooks/useSelectionSync.ts`
- [ ] `src/components/Editor/RemoteSelection.tsx`

### Task 4.4: @MENTIONS

**Features:**

1. @ typing öffnet User Picker
2. User Search/Filter
3. Mention Badge im Comment
4. Notification bei @Mention
5. Click to jump to mention

**Files:**

- [ ] `src/components/Mentions/MentionInput.tsx`
- [ ] `src/components/Mentions/UserPicker.tsx`
- [ ] `src/components/Mentions/MentionBadge.tsx`

### Task 4.5: NOTIFICATIONS

**Features:**

1. In-App Notifications (Toasts)
2. Notification Center (Bell Icon)
3. Mark as Read/Unread
4. Notification Preferences

**Types:**

- [ ] @Mention notifications
- [ ] Comment reply notifications
- [ ] Document share notifications
- [ ] Collaboration invite notifications

**Files:**

- [ ] `src/components/Notifications/NotificationCenter.tsx`
- [ ] `src/hooks/useNotifications.ts`
- [ ] `src/store/notification-store.ts`

---

## 📊 METRICS

| Metric             | Current | Target | Status         |
| ------------------ | ------- | ------ | -------------- |
| Comments System    | 50%     | 100%   | 🔄 In Progress |
| Real-time Presence | 0%      | 100%   | 📈 Planned     |
| Selection Sync     | 0%      | 100%   | 📈 Planned     |
| @Mentions          | 0%      | 100%   | 📈 Planned     |
| Notifications      | 0%      | 100%   | 📈 Planned     |

---

## 🎯 SUCCESS CRITERIA

✅ Comments System vollständig (Threads, Edit, Delete, Resolve)  
✅ Live Cursors sichtbar für alle User  
✅ User List zeigt online Users  
✅ Selection Sync funktioniert  
✅ @Mentions mit User Picker  
✅ Notifications für alle Events

---

**Dependencies:** PLAN 01 (Recovery) muss abgeschlossen sein  
**ETA:** 4-5 Tage  
**Blocker:** Keine

**NEXT:** Dies ist das NÄCHSTE was implementiert wird nach PLAN 01!
