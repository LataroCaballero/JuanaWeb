---
phase: 02-three-js-hero
plan: 01
subsystem: hero
tags: [three-js, webgl, svg-extrusion, animation, performance, cls-prevention]
dependency_graph:
  requires: [01-foundation-design-system]
  provides: [hero-section, three-js-canvas, smiley-logo-3d]
  affects: [src/pages/index.astro]
tech_stack:
  added: [three@0.183.2, three/addons/loaders/SVGLoader]
  patterns:
    - IntersectionObserver lazy-init for Three.js (fire-once, threshold 0.1)
    - SVGLoader.createShapes() + ExtrudeGeometry for 2D-to-3D path extrusion
    - group.scale.y *= -1 to fix SVG Y-axis inversion
    - Box3.setFromObject + getCenter for auto-centering SVG geometry
    - forceContextLoss before renderer.dispose for GPU cleanup
    - matchMedia prefers-reduced-motion guard before RAF loop
key_files:
  created:
    - public/assets/smiley-logo.svg
    - src/components/HeroCanvas.astro
    - src/scripts/hero-canvas.ts
  modified:
    - package.json (three@0.183.2 added)
    - src/pages/index.astro (smoke test replaced with HeroCanvas)
decisions:
  - SVG placed in public/assets/ (not src/assets/) consistent with grain.webp pattern — no Vite import needed, avoids asset pipeline interference
  - Three separate path elements (circle + 2 eyes) extruded individually and layered in Z (eye meshes at z=1) — simpler than compound paths with fill-rule
  - Auto-fit scale 3.0/maxDim after Box3 sizing — fits logo at camera.position.z=5, FOV 45 without hardcoding pixel values
  - Chunk size warning (552KB) expected and acceptable — Three.js is dynamically imported via IntersectionObserver, does NOT block LCP
metrics:
  duration: 3 minutes
  completed: 2026-03-26
  tasks_completed: 3
  files_changed: 5
---

# Phase 02 Plan 01: Three.js Hero Section Summary

Three.js 3D smiley logo hero with SVG extrusion, metallic material, idle float animation, IntersectionObserver lazy init, CLS-safe canvas, and GPU cleanup.

## What Was Built

The complete Three.js hero section for the Juana House landing page:

- **SVG logo asset** (`public/assets/smiley-logo.svg`): Clean path-only SVG (circle + 2 arrow-eye chevrons) compatible with SVGLoader. No `<use>`, `<symbol>`, or `<defs>` elements.
- **HeroCanvas.astro** (`src/components/HeroCanvas.astro`): Static HTML section with `<h1>COFFEE ON YOUR WAY</h1>` as LCP element, CLS-safe canvas wrapper (`aspect-ratio: 1/1`), desktop grid (7fr/5fr with -48px overlap) and mobile flex layout (-24px overlap). IntersectionObserver gates the Three.js dynamic import.
- **hero-canvas.ts** (`src/scripts/hero-canvas.ts`): Full Three.js initialization — SVGLoader async load, ExtrudeGeometry with depth 10, MeshStandardMaterial (Electric Blue metalness 0.7/roughness 0.2), float animation (sin 0.8 rad/s, 0.05 amplitude), rotation (0.003 rad/frame), prefers-reduced-motion guard, GPU teardown bound to `pagehide`.
- **index.astro** (`src/pages/index.astro`): Replaced Phase 1 smoke test with HeroCanvas import.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install Three.js and create SVG logo | 8ab41ff | package.json, package-lock.json, public/assets/smiley-logo.svg |
| 2 | Create HeroCanvas.astro | 0a99d76 | src/components/HeroCanvas.astro |
| 3 | Create hero-canvas.ts and wire index.astro | 82cb4a0 | src/scripts/hero-canvas.ts, src/pages/index.astro |

## Requirements Met

| Requirement | Status | Evidence |
|-------------|--------|----------|
| HERO-01: IntersectionObserver lazy init | Done | HeroCanvas.astro script block; Three.js NOT imported at top level |
| HERO-02: Static H1 as LCP element | Done | `<h1>COFFEE ON YOUR WAY</h1>` in static HTML, no JS dependency |
| HERO-03: CLS-safe canvas via aspect-ratio | Done | `#hero-canvas-wrapper { aspect-ratio: 1 / 1 }` in component CSS |
| HERO-04: GPU cleanup with forceContextLoss | Done | teardown() calls forceContextLoss before renderer.dispose, bound to pagehide |

## Deviations from Plan

None — plan executed exactly as written.

The chunk size warning (552KB for hero-canvas bundle) is expected behavior — Three.js is large and is lazy-loaded dynamically via IntersectionObserver. It does not block LCP. This is the correct architecture per HERO-01.

## Known Stubs

None — all paths are wired. The SVG loads from `/assets/smiley-logo.svg` (real file), Three.js renders to a real WebGL canvas, the animation loop runs with real requestAnimationFrame.

## Self-Check: PASSED

All created files exist on disk. All 3 task commits verified in git log:
- 8ab41ff: Three.js install + SVG logo
- 0a99d76: HeroCanvas.astro
- 82cb4a0: hero-canvas.ts + index.astro
