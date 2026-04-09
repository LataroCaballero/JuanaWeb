---
phase: 04-motion-image-pipeline
plan: 02
subsystem: ui
tags: [images, webp, astro-assets, image-optimization, performance]

# Dependency graph
requires:
  - phase: 03-content-sections
    provides: HistoriaSection with placeholder div, UbicacionesSection with placeholder divs
  - plan: 04-01
    provides: GSAP scroll animations wired into index.astro
provides:
  - src/assets/images/historia-truck.jpg as JPEG source for Astro image optimizer
  - src/assets/images/ubicacion-iron-man.jpg as JPEG source for Astro image optimizer
  - src/assets/images/ubicacion-cara-sur.jpg as JPEG source for Astro image optimizer
  - HistoriaSection.astro using Astro Image component (astro:assets) replacing placeholder div
  - UbicacionesSection.astro using two Astro Image components replacing placeholder divs
  - WebP output in dist/_astro/ from Astro image optimizer
  - Zero external image requests (PERF-02 satisfied)
affects: [PERF-01, PERF-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Astro Image component (astro:assets) for automatic WebP conversion and optimization
    - sharp (devDependency) for generating placeholder JPEG source images
    - Image with absolute inset-0 inside relative h-[600px] container for full-bleed card images
    - loading="lazy" on all content images per PERF-01 requirement

key-files:
  created:
    - scripts/gen-placeholders.mjs
    - src/assets/images/historia-truck.jpg
    - src/assets/images/ubicacion-iron-man.jpg
    - src/assets/images/ubicacion-cara-sur.jpg
  modified:
    - src/components/HistoriaSection.astro
    - src/components/UbicacionesSection.astro

key-decisions:
  - "Placeholder JPEGs generated via sharp at design token color rgb(53,53,52) matching --color-surface-high so placeholders blend visually until real photography is added"
  - "ubicacion images use absolute inset-0 w-full h-full object-cover to fill fixed-height h-[600px] card containers"
  - "grayscale group-hover:grayscale-0 transition-all duration-700 preserved on Astro Image class — CSS hover effect works identically with <img> as with placeholder div"
  - "Astro image optimizer deduplicates identical-content images by content hash — iron-man and cara-sur resolve to same WebP since both are solid-color placeholders; this is expected and correct behavior"

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 04 Plan 02: Astro Image Component Pipeline — WebP Optimization Summary

**Three placeholder JPEGs generated via sharp and wired into HistoriaSection and UbicacionesSection as Astro Image components — Astro optimizer outputs WebP, zero external image requests, grayscale hover preserved**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-26T00:30:00Z
- **Completed:** 2026-03-26T00:31:00Z
- **Tasks:** 1 auto + 1 checkpoint (auto-approved)
- **Files modified:** 6

## Accomplishments

- Created `scripts/gen-placeholders.mjs` using sharp to generate solid-color JPEG placeholders at design-token color `rgb(53, 53, 52)` (matching `--color-surface-high: #353534`)
- Generated `src/assets/images/historia-truck.jpg` (1200x675), `ubicacion-iron-man.jpg` (800x600), `ubicacion-cara-sur.jpg` (800x600)
- Updated `HistoriaSection.astro`: frontmatter now imports `{ Image } from 'astro:assets'` and `historiaTruck` from assets; placeholder div replaced with `<Image>` with `loading="lazy"`
- Updated `UbicacionesSection.astro`: frontmatter imports `ironManPhoto` and `caraSurPhoto`; both placeholder divs replaced with `<Image>` using `absolute inset-0 w-full h-full object-cover` plus preserved grayscale hover classes
- Build verified: Astro optimizer produced WebP files in `dist/_astro/`; `grep lh3.googleusercontent dist/` returns no matches (PERF-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate placeholder images and replace components with Astro Image** - `4fb34bb` (feat)
2. **Task 2: Visual verification checkpoint** - ⚡ Auto-approved (no code change)

## Files Created/Modified

- `scripts/gen-placeholders.mjs` — Sharp script to generate placeholder JPEG images for Astro optimizer pipeline
- `src/assets/images/historia-truck.jpg` — 1200x675 JPEG, source for Historia section image
- `src/assets/images/ubicacion-iron-man.jpg` — 800x600 JPEG, source for Iron Man card
- `src/assets/images/ubicacion-cara-sur.jpg` — 800x600 JPEG, source for Cara Sur card
- `src/components/HistoriaSection.astro` — Replaced placeholder div with `<Image src={historiaTruck} loading="lazy">`
- `src/components/UbicacionesSection.astro` — Replaced both placeholder divs with `<Image>` components, grayscale hover preserved

## Decisions Made

- Placeholder JPEGs at design token color rgb(53,53,52) to match `--color-surface-high` — visually seamless until real photos are provided
- `absolute inset-0` positioning on ubicaciones images to fill `h-[600px]` parent cards
- Grayscale hover classes applied directly to Astro `<Image>` component's `class` prop — renders as standard `<img>` so CSS hover transitions work identically

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Astro's image optimizer deduplicates identical-content images by content hash. Since `ubicacion-iron-man.jpg` and `ubicacion-cara-sur.jpg` are both solid `rgb(53,53,52)` at 800x600, they resolve to the same WebP hash. Build log shows 2 WebP files generated (1 shared for both ubicacion images + 1 for historia). Both cards correctly reference `/_astro/` paths — zero external requests. This is expected behavior; when real photography is added, the two images will have distinct content hashes and generate separate WebP files.

## Known Stubs

The three images are placeholder JPEGs (solid color matching design token surface). Real photography is required before launch. These stubs intentionally preserve the visual layout and Astro image pipeline while acknowledging that real images are a content dependency. The plan objective (PERF-01, PERF-02) is fully achieved — WebP output from local sources, zero external requests.

## User Setup Required

None — sharp is a devDependency already in package.json.

## Next Phase Readiness

- PERF-01 (all content images as WebP via Astro Image) — complete
- PERF-02 (zero external image/font requests) — complete
- Phase 04 complete: GSAP scroll-reveals (Plan 01) + Astro Image pipeline (Plan 02)
- Ready for Phase 05 once real photography is provided

---
*Phase: 04-motion-image-pipeline*
*Completed: 2026-03-26*

## Self-Check: PASSED

- FOUND: src/assets/images/historia-truck.jpg
- FOUND: src/assets/images/ubicacion-iron-man.jpg
- FOUND: src/assets/images/ubicacion-cara-sur.jpg
- FOUND: scripts/gen-placeholders.mjs
- FOUND: src/components/HistoriaSection.astro (Image component, no placeholder div)
- FOUND: src/components/UbicacionesSection.astro (Image components, no placeholder divs)
- FOUND: .planning/phases/04-motion-image-pipeline/04-02-SUMMARY.md
- FOUND commit: 4fb34bb (Task 1: feat)
- FOUND commit: daf18ed (docs: metadata)
