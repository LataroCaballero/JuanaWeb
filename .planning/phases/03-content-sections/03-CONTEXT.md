# Phase 3: Content Sections - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full page — floating nav, Historia editorial section, Ubicaciones con location cards, CSS marquee, and footer — all wired into index.astro as static Astro components with real brand content. Motion/GSAP scroll reveals are Phase 4. Images are Phase 4 (WebP pipeline). This phase delivers navigable HTML with real copy, real addresses, and working CSS-only interactions.

</domain>

<decisions>
## Implementation Decisions

### Section Page Flow
- **D-01:** After HeroCanvas, sections render in this order:
  1. `<HistoriaSection>` — bg: surface-low (#1a1a1a)
  2. `<UbicacionesSection>` — bg: surface (#131313)
  3. `<MarqueeSection>` — bg: electric (#0055ff), acts as pre-footer identity stamp
  4. `<FooterSection>` — bg: surface (#131313)
- Section IDs required for anchor-scroll nav: `id="historia"` and `id="ubicaciones"`
- No Menu section in Phase 3 — deferred to v2 (MENU-01/02/03 in REQUIREMENTS.md)

### Historia Section
- **D-02:** Copy language is **Spanish** — Tribu Nomade narrative consistent with brand voice ("TRIBU NOMADE, SIEMPRE EN CASA", "COFFEE ON YOUR WAY", urban nomad, mobile coffee truck identity). Not English placeholder copy from reference.
- **D-03:** Layout follows reference: 12-column editorial grid, image left (7 cols), copy right (5 cols). "TRIBU NOMADE" label floats over image top-left. "SIEMPRE EN CASA." stamp overlays image bottom-right.
- **D-04:** Image is a placeholder `<img>` for Phase 3 (real photography delivered in Phase 4 via Astro `<Image />`). Use `data-src` or `src=""` with a bg-surface-high colored box as fallback — no external image requests.

### Nav Flotante
- **D-05:** Nav links: brand logotype "JUANA HOUSE" left + anchor links **NUESTRA HISTORIA** (`#historia`) and **UBICACIONES** (`#ubicaciones`) center + external link **@juana.onyourday** (Instagram, opens in new tab) right.
- **D-06:** Glassmorphism activates at scroll > 80px via JS scroll listener. Before scroll: transparent bg. After scroll: `backdrop-blur-[var(--nav-blur)]` + `bg-[var(--nav-bg)]`. CSS vars already defined: `--nav-blur: 20px`, `--nav-bg: rgba(19,19,19,0.85)`.
- **D-07:** Nav is `position: fixed`, `z-index: 50`, full-width, above grain overlay which is `z-index: 9999` but `pointer-events: none` — no conflict.

### Ubicaciones
- **D-08:** Two location cards in a 2-column CSS grid (full-width, no max-width constraint — edge-to-edge as per reference).
  - **Iron Man:** Del Bono 383 Sur, San Juan, Argentina J5400 (from REQUIREMENTS.md — NOT Av. Libertador 1250 from reference HTML)
  - **Cara Sur:** Barreal, San Juan, Argentina
- **D-09:** No hardcoded hours. Both cards show "Ver horarios actualizados en @juana.onyourday" as a CTA link to Instagram. This resolves the confirmed content blocker (horarios not yet confirmed with client).
- **D-10:** Grayscale-to-color hover is **CSS-only** `filter: grayscale(1)` → `filter: grayscale(0)` with `transition-all duration-700` — no GSAP (that's Phase 4).
- **D-11:** Cards include UBIC-02 label chips: Iron Man = "CURRENT DOCK", Cara Sur = "MOUNTAIN POST" (matching reference visual).

### Marquee
- **D-12:** CSS-only `@keyframes marquee` animation (no GSAP). Brand phrases: `JUANA HOUSE / JUANATRUCK® / NOMAD SOUL / COFFEE ON YOUR WAY` repeated to fill track.
- **D-13:** `prefers-reduced-motion: reduce` → `animation-play-state: paused` via CSS media query (no JS needed). Satisfies MARQ-02.
- **D-14:** Text color `text-white/20` on `bg-electric` per reference (white with 20% opacity over Electric Blue creates the muted poster effect).

### Footer
- **D-15:** Footer content: "JUANA HOUSE" brand logotype + `©2024 JUANA HOUSE. URBAN NOMAD EDITORIAL.` copyright + Instagram link `@juana.onyourday` (opens in new tab) + tagline chip. Satisfies FOOT-01.
- **D-16:** Footer background is `bg-surface` (#131313) — same as body. Section break from Marquee (Electric Blue) is sufficient via the No-Line rule.

### Claude's Discretion
- Mobile responsive breakpoints for Historia grid (likely stacks to 1 col on mobile)
- Exact padding/spacing values for sections (follow reference proportions)
- Nav CTA button inclusion (reference has a "Contactar" button — include or skip at planner's discretion)
- Marquee animation duration (reference uses 20s linear infinite — reasonable default)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & success criteria
- `.planning/REQUIREMENTS.md` — NAV-01, HIST-01, HIST-02, MARQ-01, MARQ-02, UBIC-01, UBIC-02, UBIC-03, FOOT-01 (acceptance criteria)
- `.planning/ROADMAP.md` §Phase 3 — Success criteria (5 conditions, including scroll threshold and prefers-reduced-motion)

### Visual reference
- `referencias/juanaV1.html` — Full visual reference for all Phase 3 sections. Nav, Historia/Tribu Nomade, Ubicaciones, Marquee, and Footer are all implemented here. Use as layout/style guide — NOT for copy (use Spanish) and NOT for addresses (use REQUIREMENTS.md values)

### Design system
- `referencias/DESIGN.md` — No-Line Rule, Glassmorphism spec, Zero Roundedness, Tonal Layering. Governs all Phase 3 component styling decisions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/BaseLayout.astro` — Wraps all pages. `<slot />` in body. Font preloads, dark class, SEO meta. Phase 3 adds `<Nav>` as a sibling to `<slot />` OR inside `BaseLayout` — planner to decide placement
- `src/styles/global.css` — CSS vars `--nav-blur: 20px` and `--nav-bg: rgba(19,19,19,0.85)` already defined. `@theme` tokens: `electric`, `surface`, `on-surface`, `surface-low`. Use these utilities throughout.
- `src/components/HeroCanvas.astro` — Already in index.astro. Phase 3 appends new section components after it.

### Established Patterns
- Components live in `src/components/` — new Phase 3 components: `Nav.astro`, `HistoriaSection.astro`, `UbicacionesSection.astro`, `MarqueeSection.astro`, `FooterSection.astro`
- All assets in `public/assets/` (not `src/assets/`) for CSS string references (grain.webp pattern)
- Static hardcoded content — no props API needed for sections

### Integration Points
- `src/pages/index.astro` — Add section IDs and import new components. Nav likely goes before `<HeroCanvas>` (fixed positioning), sections after.
- Section IDs needed: `id="historia"` on HistoriaSection, `id="ubicaciones"` on UbicacionesSection
- Nav scroll handler: small `<script>` tag in Nav.astro that adds/removes a class at `scrollY > 80`

</code_context>

<specifics>
## Specific Ideas

- Historia copy: **Spanish-language** Tribu Nomade narrative. Brand voice: "TRIBU NOMADE, SIEMPRE EN CASA". Tone: editorial, urban nomad, we-move-where-the-city-breathes. Planner should write real copy (not filler Lorem).
- Horarios: Both location cards use CTA "Ver horarios en @juana.onyourday" — no hardcoded hours until client confirms.
- Iron Man address: **Del Bono 383 Sur, San Juan, Argentina J5400** (per REQUIREMENTS.md — reference HTML has wrong address).
- Cara Sur address: **Barreal, San Juan, Argentina** (per REQUIREMENTS.md).
- Nav external IG link text: `@juana.onyourday ↗` opens `https://instagram.com/juana.onyourday` in new tab.

</specifics>

<deferred>
## Deferred Ideas

- Menu section — deferred to v2 (MENU-01, MENU-02, MENU-03 in REQUIREMENTS.md)
- Real hours for Iron Man and Cara Sur — content blocker, confirmed with fallback CTA. Update when client provides hours.
- Real photography — Phase 4 will replace placeholder images with Astro `<Image />` WebP pipeline (PERF-01)

</deferred>

---

*Phase: 03-content-sections*
*Context gathered: 2026-03-25*
