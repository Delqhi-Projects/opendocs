## BUG-001: plan-to-roadmap drops the final phase before Risks
**Aufgetreten:** 2026-03-21  **Status:** ✅ GEFIXT
**Symptom:** A plan with three phases converts into only two epics/sub-issue groups.
**Ursache:** The parser leaves the current phase when it reaches a new `##` section, but it only flushes text and does not push the phase object into the phases array.
**Fix:** Persist the active phase object before switching from a phase section to the next `##` section, then re-run the converter against the example plan.
**Datei:** `scripts/plan-to-roadmap.mjs`

## BUG-002: issue-architect hardcodes master tracker to phase:3
**Aufgetreten:** 2026-03-21  **Status:** ✅ GEFIXT
**Symptom:** The generated master tracker uses label `phase:3` even when the roadmap is for a different phase.
**Ursache:** The master tracker builder uses a hardcoded label string instead of deriving the phase label from the roadmap data.
**Fix:** Derive the master tracker phase label from roadmap labels or epic labels instead of using a hardcoded string, then re-run the dry-run validation.
**Datei:** `scripts/issue-architect.mjs`
