---
plan: 03-04
phase: 03-content-sections
status: complete
completed: 2026-03-26
---

## Summary

Closed two Phase 03 verification gaps: UBIC-03 CTA copy mismatch and UBIC-01 requirements alignment.

## Tasks Completed

| # | Task | Status |
|---|------|--------|
| 1 | Fix CTA copy in UbicacionesSection.astro (UBIC-03) | ✓ |
| 2 | Align UBIC-01 acceptance criteria to D-09 decision | ✓ |

## Key Changes

### key-files.created
- `src/components/UbicacionesSection.astro` — Both location card CTAs now read "Ver dónde estamos hoy" (was "Ver horarios en @juana.onyourday"). Instagram href unchanged.
- `.planning/REQUIREMENTS.md` — UBIC-01 criteria updated to reflect Instagram-redirect delivery model per D-09 design decision.

## Verification

- `grep -c "Ver dónde estamos hoy" src/components/UbicacionesSection.astro` → 2 ✓
- `grep -c "Ver horarios en @juana.onyourday" src/components/UbicacionesSection.astro` → 0 ✓
- `grep "UBIC-01" .planning/REQUIREMENTS.md` → contains "CTA a Instagram para horarios actualizados" and "per D-09" ✓
- `npm run build` → exit 0 ✓

## Self-Check: PASSED

All acceptance criteria met. Phase 03 gap closure complete.
