---
phase: 04-motion-image-pipeline
plan: 01
subsystem: ui
tags: [gsap, scroll-animations, scrolltrigger, motion, accessibility]

# Dependency graph
requires:
  - phase: 03-content-sections
    provides: HistoriaSection with id="historia" and UbicacionesSection with id="ubicaciones"
provides:
  - GSAP ScrollTrigger scroll-reveal for #historia and #ubicaciones with fade+slide (opacity 0->1, y 60->0)
  - gsap.matchMedia() reduced-motion branch that sets instant visible state on prefers-reduced-motion: reduce
  - scroll-animations.ts script wired into index.astro via Astro <script> tag
affects: [04-motion-image-pipeline]

# Tech tracking
tech-stack:
  added: [gsap@3.14.2]
  patterns:
    - gsap.matchMedia() for conditional animation gating by prefers-reduced-motion
    - ScrollTrigger with once:true for single-fire reveal (no repeat)
    - Script import in page-level index.astro (not individual section components) for clean single import location

key-files:
  created:
    - src/scripts/scroll-animations.ts
  modified:
    - src/pages/index.astro
    - package.json
    - package-lock.json

key-decisions:
  - "gsap.matchMedia() used (not window.matchMedia check) — GSAP-native approach handles media query changes reactively"
  - "once: true on both ScrollTrigger configs — single-fire reveal, not repeating animation"
  - "y: 60 with duration 0.9 and power2.out easing — cinematic but not slow per research recommendation"
  - "Targets ONLY section wrappers #historia and #ubicaciones, NOT inner card elements — avoids conflict with CSS grayscale hover on ubicaciones cards"
  - "Script placed in index.astro after FooterSection, outside BaseLayout — single import location, Astro defers by default"

patterns-established:
  - "Pattern: GSAP scripts go in src/scripts/ alongside hero-canvas.ts, imported via Astro <script> tags in page files"
  - "Pattern: All motion respects prefers-reduced-motion via gsap.matchMedia() — established for future motion work"

requirements-completed: [MOTN-01, MOTN-02]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 04 Plan 01: GSAP ScrollTrigger Scroll-Reveal for Historia and Ubicaciones Summary

**GSAP 3.14.2 scroll-reveal with gsap.matchMedia() reduced-motion support for #historia and #ubicaciones sections — fade+slide on scroll, instant-visible under prefers-reduced-motion: reduce**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-26T00:28:24Z
- **Completed:** 2026-03-26T00:28:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Installed gsap@3.14.2 as project dependency
- Created src/scripts/scroll-animations.ts with ScrollTrigger reveals for #historia and #ubicaciones (fade opacity 0->1 + y 60->0, duration 0.9s, power2.out, once:true)
- Wrapped all animations in gsap.matchMedia() with prefers-reduced-motion: reduce branch using gsap.set() for instant visibility
- Wired script into src/pages/index.astro via Astro <script> tag; build confirmed bundled (114.92 kB chunk)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install GSAP and create scroll-animations.ts** - `b8b7917` (feat)
2. **Task 2: Wire scroll-animations into index.astro and verify build** - `3eaec35` (feat)

**Plan metadata:** _(docs commit hash — see below after final commit)_

## Files Created/Modified
- `src/scripts/scroll-animations.ts` - GSAP ScrollTrigger scroll-reveal animations for #historia and #ubicaciones with gsap.matchMedia() reduced-motion support
- `src/pages/index.astro` - Added <script> import for scroll-animations.ts after FooterSection
- `package.json` - Added gsap@3.14.2 dependency
- `package-lock.json` - Updated lockfile

## Decisions Made
- gsap.matchMedia() wraps all animations (not a window.matchMedia check) — GSAP-native approach, reactive to media query changes
- once: true on both ScrollTrigger configs — single-fire reveal per MOTN-01 spec
- Targeting section wrappers directly (not inner elements) avoids conflict with existing CSS grayscale hover transitions on ubicaciones cards

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build succeeded on first attempt with no errors.

## Known Stubs

None — scroll-animations.ts wires directly to existing DOM IDs (`#historia`, `#ubicaciones`) which are present in Phase 03-built components.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- MOTN-01 (Historia scroll reveal) and MOTN-02 (Ubicaciones scroll reveal) complete
- GSAP is installed and available for any additional motion work in Phase 04
- Reduced-motion pattern established for all future animation additions
- Phase 04 Plan 02 can proceed (image pipeline / Astro Image component)

---
*Phase: 04-motion-image-pipeline*
*Completed: 2026-03-26*

## Self-Check: PASSED

- FOUND: src/scripts/scroll-animations.ts
- FOUND: src/pages/index.astro
- FOUND: .planning/phases/04-motion-image-pipeline/04-01-SUMMARY.md
- FOUND commit: b8b7917 (Task 1)
- FOUND commit: 3eaec35 (Task 2)
