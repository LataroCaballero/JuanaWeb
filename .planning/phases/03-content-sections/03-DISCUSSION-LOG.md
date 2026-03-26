# Phase 3: Content Sections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-25
**Phase:** 03-content-sections
**Mode:** discuss
**Areas discussed:** Section page flow, Historia copy, Horarios blocker, Nav items & behavior

## Gray Areas Presented

| Area | Question |
|------|----------|
| Section page flow | Order of sections after HeroCanvas |
| Historia copy | What text and language for Tribu Nomade section |
| Horarios blocker | How to handle unconfirmed location hours |
| Nav items & behavior | What links the floating nav contains |

## Decisions Made

### Section page flow
- **Decision:** Hero → Historia (surface-low) → Ubicaciones (surface) → Marquee (electric, pre-footer) → Footer (surface)
- **Rationale:** Marquee as identity stamp just before footer, not as mid-page divider

### Historia copy
- **Decision:** Spanish-language Tribu Nomade narrative (user input via Other)
- **Notes:** Real brand-voice copy in Spanish, not English placeholder from reference HTML

### Horarios blocker
- **Decision:** Fallback CTA — "Ver horarios en @juana.onyourday" on both location cards
- **Rationale:** Hours not yet confirmed with client. Instagram CTA is honest about the truck's dynamic schedule and avoids stale hardcoded data.

### Nav items & behavior
- **Decision:** Anchor-scroll nav — JUANA HOUSE logo + NUESTRA HISTORIA (#historia) + UBICACIONES (#ubicaciones) + [@juana.onyourday ↗] external
- **Rationale:** Single-page UX matching v1 scope, no Menu link since that's v2

## Corrections from Prior Reference

- Reference HTML has wrong Iron Man address (Av. Libertador 1250). REQUIREMENTS.md has correct address: Del Bono 383 Sur, San Juan.
- Reference uses English copy throughout. Phase 3 will use Spanish for Historia section.
