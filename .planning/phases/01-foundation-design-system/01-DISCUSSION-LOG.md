# Phase 1: Foundation & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-25
**Phase:** 01-foundation-design-system
**Mode:** discuss
**Areas discussed:** Grain tile source, Token scope, BaseLayout scope, Scaffold template

## Areas Discussed

### Grain tile source
**Question:** No grain WebP asset exists yet. How should the scaffold phase handle it?
**Options presented:**
- Generate it programmatically (script creates noise-pattern WebP ~2KB during scaffold)
- CSS-only placeholder now, real asset in Phase 4
- User provides a grain file

**Decision:** Generate it programmatically
**Rationale:** No external dependency, no placeholder debt.

---

### Token scope
**Question:** How complete should the Tailwind v4 @theme be after Phase 1?
**Options presented:**
- Brand tokens only (colors, typography, spacing)
- Full system upfront (brand + component-level tokens)

**Decision:** Full system upfront
**Rationale:** Component tokens available from Phase 1 so fases 2–4 only consume utilities without adding to @theme.

---

### BaseLayout scope
**Question:** What goes into BaseLayout.astro in Phase 1?
**Options presented:**
- Visual shell only (dark mode + grain + font preloads)
- Include SEO/OG baseline with placeholder values

**Decision:** Include SEO/OG baseline
**Rationale:** Add title/description/og:image/twitter:card slots now with defaults; fill real content in Phase 3.

---

### Scaffold template
**Question:** Which Astro starter template?
**Options presented:**
- Blank (minimal) — npm create astro minimal
- Minimal + example page
- Strict blank (no files at all)

**Decision:** Blank (minimal)
**Rationale:** Zero opinionated files, clean slate for project file structure.

## Corrections Made

No corrections — all decisions were direct selections.
