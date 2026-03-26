# Phase 3: Content Sections - Research

**Researched:** 2026-03-25
**Domain:** Astro static components, Tailwind v4, CSS-only animation, JS scroll listener
**Confidence:** HIGH

## Summary

Phase 3 builds five static Astro components — Nav, HistoriaSection, UbicacionesSection, MarqueeSection, FooterSection — and wires them into `src/pages/index.astro`. The design contract is fully specified in `03-UI-SPEC.md`. All styling uses existing Tailwind v4 `@theme` tokens already in `src/styles/global.css`. No new dependencies are required.

The two interactive behaviors are intentionally lightweight: (1) Nav glassmorphism uses a four-line scroll listener in a `<script>` tag inside `Nav.astro` that toggles a class at `scrollY > 80`; (2) the marquee uses a `@keyframes` CSS animation with a `@media (prefers-reduced-motion: reduce)` pause rule — zero JavaScript.

The critical integration point is `src/pages/index.astro`: Nav must be placed as a `position: fixed` element before `<main>`, and the four content sections must be appended inside `<main>` after `<HeroCanvas>`. The existing `BaseLayout.astro` `<slot />` is the entry point and requires no modification.

**Primary recommendation:** Implement all five components as pure Astro `.astro` files (no framework islands, no client directives) using existing CSS tokens. The only JavaScript in this phase is the Nav scroll listener — a `<script>` tag, not a client island.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Section order after HeroCanvas: HistoriaSection (bg: surface-low) → UbicacionesSection (bg: surface) → MarqueeSection (bg: electric) → FooterSection (bg: surface). Section IDs `id="historia"` and `id="ubicaciones"` required.
- **D-02:** Historia copy is Spanish — "TRIBU NOMADE, SIEMPRE EN CASA", urban nomad brand voice. Not English placeholder.
- **D-03:** Historia layout: 12-column editorial grid, image left (7 cols), copy right (5 cols). "TRIBU NOMADE" label floats over image top-left. "SIEMPRE EN CASA." stamp overlays image bottom-right.
- **D-04:** Historia image is a placeholder `<div>` with `bg-surface-high` — no external image requests in Phase 3.
- **D-05:** Nav links: "JUANA HOUSE" logotype left + NUESTRA HISTORIA (`#historia`) + UBICACIONES (`#ubicaciones`) center + `@juana.onyourday ↗` right (Instagram, new tab).
- **D-06:** Glassmorphism activates at `scrollY > 80px`. Before: transparent. After: `backdrop-blur-[var(--nav-blur)]` + `bg-[var(--nav-bg)]`. CSS vars already defined.
- **D-07:** Nav is `position: fixed`, `z-index: 50`, full-width. Grain overlay is `z-index: 9999` with `pointer-events: none` — no conflict.
- **D-08:** Ubicaciones: two location cards in `grid-cols-2`, edge-to-edge (no max-width). Iron Man address: Del Bono 383 Sur, San Juan, Argentina J5400. Cara Sur: Barreal, San Juan, Argentina.
- **D-09:** No hardcoded hours. Both cards show "Ver horarios en @juana.onyourday" as CTA link.
- **D-10:** Grayscale-to-color hover is CSS-only: `filter: grayscale(1)` → `grayscale(0)` via `group-hover`, `transition-all duration-700`. No GSAP.
- **D-11:** Label chips: Iron Man = "CURRENT DOCK", Cara Sur = "MOUNTAIN POST".
- **D-12:** Marquee CSS-only `@keyframes marquee`. Phrases: `JUANA HOUSE / JUANATRUCK® / NOMAD SOUL / COFFEE ON YOUR WAY` repeated twice.
- **D-13:** `prefers-reduced-motion: reduce` → `animation-play-state: paused` via CSS media query. No JS.
- **D-14:** Marquee text `text-white/20` on `bg-electric`.
- **D-15:** Footer: "JUANA HOUSE" logotype + copyright + Instagram link + tagline chip.
- **D-16:** Footer background `bg-surface`. No border-top — section break from Electric Blue marquee is sufficient.

### Claude's Discretion

- Mobile responsive breakpoints for Historia grid (likely stacks to 1 col on mobile)
- Exact padding/spacing values for sections (follow reference proportions)
- Nav CTA button inclusion (reference has "Contactar" — skip per minimalist approach, confirmed in UI-SPEC)
- Marquee animation duration (reference uses 20s linear infinite — use this default)

### Deferred Ideas (OUT OF SCOPE)

- Menu section — deferred to v2 (MENU-01, MENU-02, MENU-03)
- Real hours for Iron Man and Cara Sur — fallback CTA confirmed
- Real photography — Phase 4 via Astro `<Image />` WebP pipeline (PERF-01)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Floating nav activates glassmorphism (backdrop-blur) at scroll > 80px | D-06: scroll listener adds `.scrolled` class; CSS vars `--nav-blur` and `--nav-bg` already in global.css |
| HIST-01 | User reads Juana House history (quiénes son, narrativa nómade) in editorial section | D-02/D-03: Spanish copy, 12-col editorial grid, Historia body copy defined in UI-SPEC Copywriting Contract |
| HIST-02 | Full-bleed editorial layout with truck image + Tribu Nomade copy | D-03/D-04: `grid-cols-12` with 7-col placeholder image div and 5-col copy block |
| MARQ-01 | Animated marquee with brand phrases on Electric Blue background | D-12/D-14: CSS `@keyframes marquee`, `bg-electric`, `text-white/20`, 20s linear infinite |
| MARQ-02 | Marquee pauses when `prefers-reduced-motion: reduce` | D-13: CSS media query sets `animation-play-state: paused` — no JS |
| UBIC-01 | Two locations visible (Iron Man + Cara Sur) with brand name, full address, hours CTA | D-08/D-09: two cards, correct addresses from REQUIREMENTS.md, Instagram CTA |
| UBIC-02 | Location cards have grayscale-to-color hover transition | D-10: CSS `group-hover:grayscale-0 transition-all duration-700` on placeholder div |
| UBIC-03 | CTA "Ver dónde estamos hoy" links to Instagram for real-time location | D-09: "Ver horarios en @juana.onyourday" CTA links to `https://instagram.com/juana.onyourday` |
| FOOT-01 | Footer shows @juana.onyourday link, copyright, and brand tagline | D-15/D-16: FooterSection.astro with IG link, copyright, "URBAN NOMAD EDITORIAL" tagline chip |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | ^5.0.0 (installed) | Component authoring, static build | Already in project — all components are `.astro` files |
| Tailwind v4 | ^4.0.0 (installed) | Utility classes using `@theme` tokens | Already in project via `@tailwindcss/vite` — tokens defined in global.css |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | — | Phase 3 adds no new dependencies | All features (marquee, glassmorphism, grayscale hover) use CSS already in the build |

**No new npm installs are needed for Phase 3.** All dependencies are already installed.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `@keyframes` marquee | GSAP marquee plugin | GSAP is Phase 4 — CSS-only satisfies MARQ-01/02 without added JS weight |
| JS scroll listener (`<script>`) | Astro `client:load` island | Inline `<script>` in `.astro` is simpler, no framework hydration cost for a 4-line listener |
| CSS `grayscale` filter | Overlay opacity shift | CSS filter is native, GPU-accelerated, works on placeholder divs now and real images in Phase 4 without change |

---

## Architecture Patterns

### Component File Structure

```
src/
├── components/
│   ├── HeroCanvas.astro          # existing — Phase 2
│   ├── Nav.astro                 # NEW — Phase 3
│   ├── HistoriaSection.astro     # NEW — Phase 3
│   ├── UbicacionesSection.astro  # NEW — Phase 3
│   ├── MarqueeSection.astro      # NEW — Phase 3
│   └── FooterSection.astro       # NEW — Phase 3
├── layouts/
│   └── BaseLayout.astro          # existing — no modification needed
├── pages/
│   └── index.astro               # existing — import and place new components
└── styles/
    └── global.css                # existing — marquee @keyframes added here or in MarqueeSection
```

### Pattern 1: Nav Glassmorphism Scroll Listener

**What:** A minimal inline `<script>` in `Nav.astro` that toggles a `.scrolled` class on the `<header>` element when `window.scrollY > 80`. CSS handles all visual transitions via `[.scrolled]` selector using the pre-defined CSS vars.

**When to use:** Any fixed nav requiring scroll-triggered state without a framework island.

**Example:**
```astro
<!-- Nav.astro -->
<header id="main-nav" class="fixed top-0 left-0 right-0 z-50 transition-none">
  <nav class="flex justify-between items-center px-6 py-4 max-w-[1920px] mx-auto">
    <!-- content -->
  </nav>
</header>

<style>
  #main-nav { background: transparent; }
  #main-nav.scrolled {
    backdrop-filter: blur(var(--nav-blur));
    background: var(--nav-bg);
  }
</style>

<script>
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
</script>
```

Note: `transition-none` on nav matches DESIGN.md "no slow transitions" rule. The glassmorphism appears instantly at the 80px threshold.

### Pattern 2: CSS-Only Marquee with Reduced Motion

**What:** A `<div>` containing all phrases (repeated twice to create seamless loop) animated with `@keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`. The 50% translateX works because the content is doubled — when it reaches -50%, it snaps back to 0% seamlessly.

**When to use:** Any horizontally scrolling text band requiring no JS.

**Example:**
```astro
<!-- MarqueeSection.astro -->
<section class="bg-electric py-12 overflow-hidden whitespace-nowrap">
  <div class="marquee-track flex font-display font-bold text-8xl text-white/20 uppercase tracking-tighter select-none">
    <span class="mx-8">JUANA HOUSE</span>
    <span class="mx-8">JUANATRUCK®</span>
    <span class="mx-8">NOMAD SOUL</span>
    <span class="mx-8">COFFEE ON YOUR WAY</span>
    <!-- Repeated set for seamless loop -->
    <span class="mx-8">JUANA HOUSE</span>
    <span class="mx-8">JUANATRUCK®</span>
    <span class="mx-8">NOMAD SOUL</span>
    <span class="mx-8">COFFEE ON YOUR WAY</span>
  </div>
</section>

<style>
  .marquee-track {
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-track { animation-play-state: paused; }
  }
</style>
```

### Pattern 3: Location Card Grayscale Hover

**What:** Tailwind `group` on the card container, `grayscale group-hover:grayscale-0 transition-all duration-700` on the image placeholder. The Electric Blue overlay (`bg-electric/20 mix-blend-multiply`) clears on hover via `group-hover:bg-transparent`.

**When to use:** Any card requiring CSS-only image reveal effect.

**Example:**
```astro
<div class="relative h-[600px] group overflow-hidden">
  <!-- Phase 3: placeholder div; Phase 4: replace with <Image /> -->
  <div class="bg-surface-high w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"></div>
  <div class="absolute inset-0 bg-electric/20 mix-blend-multiply group-hover:bg-transparent transition-all duration-700"></div>
  <div class="absolute bottom-0 left-0 p-12">
    <!-- card content -->
  </div>
</div>
```

### Pattern 4: index.astro Integration

**What:** Nav goes before `<main>` (fixed positioning means it lives outside flow). Section components go inside `<main>` after `<HeroCanvas>`. The `<main>` wrapper is already present in index.astro.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import HeroCanvas from '../components/HeroCanvas.astro';
import HistoriaSection from '../components/HistoriaSection.astro';
import UbicacionesSection from '../components/UbicacionesSection.astro';
import MarqueeSection from '../components/MarqueeSection.astro';
import FooterSection from '../components/FooterSection.astro';
---

<BaseLayout>
  <Nav />
  <main>
    <HeroCanvas />
    <HistoriaSection />
    <UbicacionesSection />
    <MarqueeSection />
  </main>
  <FooterSection />
</BaseLayout>
```

Note: FooterSection is placed outside `<main>` (semantically appropriate for `<footer>`). The component itself renders as `<footer>` element internally.

### Anti-Patterns to Avoid

- **Placing Nav inside `<main>`:** Nav is `position: fixed` and semantically a site header — it belongs before `<main>` in the slot output.
- **Using `@theme` for `--nav-blur` and `--nav-bg`:** These are already declared in `:root` in global.css (not in `@theme`) because they are component tokens that do not need Tailwind utility generation. Reference them as `var(--nav-blur)` in inline styles or scoped `<style>` blocks.
- **Using arbitrary Tailwind values for colors:** Always use the token names (`bg-electric`, `text-on-surface`, `bg-surface-low`) not hex literals. Token names are already in `@theme`.
- **External image requests in Phase 3:** The reference HTML (`juanaV1.html`) uses `lh3.googleusercontent.com` URLs. Phase 3 uses `<div>` placeholders only — PERF-02 blocks external CDN requests.
- **`font-black` (weight 900):** Space Grotesk only ships 700 in the installed `@fontsource` package. Use `font-bold` (700) not `font-black`. The reference HTML uses `font-black` with a CDN that includes all weights — the project uses `font-bold`.
- **Transition on nav glassmorphism:** The DESIGN.md "no slow transitions" rule means the glassmorphism should appear instantly (`transition-none` on the nav or no transition on the backdrop-filter property). Do not add `transition-all duration-300` to the nav.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-based class toggle | Custom debounced scroll manager | Inline `<script>` with `{ passive: true }` listener | Passive listener is already optimal for scroll events; debounce is unnecessary for a class toggle |
| Continuous text scroll | JS-based marquee with requestAnimationFrame | CSS `@keyframes` + `translateX(-50%)` | Native CSS animation is GPU-accelerated, handles tab visibility pausing automatically, and respects `prefers-reduced-motion` via a single media query |
| Grayscale to color reveal | Canvas or WebGL filter | CSS `filter: grayscale()` on `group-hover` | CSS filters are GPU-composited, work on `<div>` placeholders and `<img>` equally, and integrate with Tailwind's `grayscale` utility out of the box |
| Color overlay clear on hover | JS mouseover/mouseleave | Tailwind `group-hover:bg-transparent` | No JS, no event listeners, handles touch via `:hover` on supporting mobile browsers |

**Key insight:** Phase 3's interactivity budget is intentionally minimal. The single JS touchpoint (Nav scroll listener) is 4 lines. Every other interaction is CSS. This keeps the static build clean and gives Phase 4 (GSAP) a clear separation boundary.

---

## Common Pitfalls

### Pitfall 1: `font-black` / `font-weight: 900` on Space Grotesk

**What goes wrong:** `font-black` renders incorrectly (falls back to system font weight) because `@fontsource/space-grotesk` in this project only imports the `700` weight file.

**Why it happens:** The reference HTML (`juanaV1.html`) loads Space Grotesk from Google Fonts CDN with all weights (300-900). The project uses self-hosted `@fontsource/space-grotesk/700.css` which only includes weight 700.

**How to avoid:** Always use `font-bold` (700) for Space Grotesk headings. The `font-display` Tailwind font family maps to Space Grotesk. Confirmed in UI-SPEC Typography Notes: "Space Grotesk max available weight is 700 — do NOT use 900."

**Warning signs:** Text rendering looks slightly lighter than expected, or Chrome DevTools shows a font synthesis warning.

### Pitfall 2: Tailwind `@theme` token names vs. reference HTML class names

**What goes wrong:** The reference HTML uses `primary-container`, `surface-container-low`, `on-surface-variant` as color names. The project's `@theme` uses `electric`, `surface-low`, `on-surface`. These are different class names.

**Why it happens:** The reference was built with a different Tailwind config (full Material Design palette). The project intentionally simplified to 6 brand tokens.

**How to avoid:** Always reference the token table in `03-UI-SPEC.md` Color section or check `src/styles/global.css @theme`. The mapping is: `primary-container` → `electric`, `surface-container-low` → `surface-low`, `on-surface-variant` → `on-surface/70`.

**Warning signs:** Build succeeds but colors look wrong, or Tailwind generates classes for unmapped tokens (appears as undefined color = transparent).

### Pitfall 3: Nav z-index conflict with grain overlay

**What goes wrong:** Nav appears behind the grain overlay and becomes unclickable.

**Why it happens:** The grain overlay in `body::after` uses `z-index: 9999`, which is higher than `z-50` (50) used on the nav.

**How to avoid:** The grain overlay already has `pointer-events: none` (confirmed in global.css line 50), so clicks pass through it regardless of z-index. Nav at `z-50` is visually below the grain but interactive. This is intentional — the grain sits over everything as a texture effect.

**Warning signs:** Nav links appear to be non-functional (test with DevTools pointer-events inspector, not visual z-index).

### Pitfall 4: Marquee loop gap (content not doubled)

**What goes wrong:** A visible gap or snap appears when the marquee animation resets.

**Why it happens:** `translateX(-50%)` only works seamlessly if the content is exactly doubled. A single set of phrases reaching 50% of the track width then snapping back creates a jump.

**How to avoid:** The phrase set must appear exactly twice in the DOM. Do not use CSS `repeat()` or pseudo-elements — they do not reliably fill the `translateX` math. Confirmed pattern: 8 `<span>` elements (4 phrases × 2 copies) matching the reference `juanaV1.html` structure.

**Warning signs:** The marquee jerks or shows blank space when looping.

### Pitfall 5: `<footer>` semantic placement vs. BaseLayout `<slot />`

**What goes wrong:** FooterSection renders inside `<main>` because all slot content goes inside a `<main>` wrapper in index.astro.

**Why it happens:** The current `index.astro` wraps the slot content in `<main>`. FooterSection should be a `<footer>` element semantically outside `<main>`.

**How to avoid:** In `index.astro`, place `<FooterSection />` after the closing `</main>` tag but still inside the BaseLayout slot. The `<footer>` element is rendered by FooterSection internally. The BaseLayout `<slot />` accepts all child content — it does not restrict to `<main>` only.

### Pitfall 6: Historia image column overlapping floating label

**What goes wrong:** The "TRIBU NOMADE" label at `absolute -top-12 -left-12` gets clipped by `overflow-hidden` on the image column.

**Why it happens:** `overflow-hidden` on a parent clips `absolute` children that extend beyond its bounds.

**How to avoid:** The `overflow-hidden` in the reference is on the `<section>` (wraps the whole grid), not on the image column `<div>`. The floating label position (`-top-12 -left-12`) intentionally bleeds outside the column into the section padding area. Do NOT put `overflow-hidden` on `md:col-span-7` div — only on the outer `<section>` if needed, and only if the label bleed is acceptable.

---

## Code Examples

Verified patterns from `juanaV1.html` reference and `src/styles/global.css`:

### Nav Scroll Class Toggle
```astro
<script>
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
</script>
```
Source: CONTEXT.md D-06, confirmed against `--nav-blur: 20px` / `--nav-bg: rgba(19,19,19,0.85)` in global.css

### CSS Vars for Glassmorphism (already in global.css)
```css
:root {
  --nav-blur: 20px;
  --nav-bg: rgba(19, 19, 19, 0.85);
}
```
Source: `src/styles/global.css` lines 35-38

### Tailwind Token Usage (correct for this project)
```html
<!-- Correct -->
<section class="bg-surface-low py-32">
<div class="text-electric font-display font-bold">
<span class="text-on-surface/70 text-base">

<!-- Wrong (reference HTML names — different config) -->
<section class="bg-surface-container-low py-32">
<div class="text-primary-container font-headline font-black">
```
Source: `src/styles/global.css @theme` block

### Marquee `@keyframes` (from juanaV1.html, adapted)
```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 20s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation-play-state: paused; }
}
```
Source: `referencias/juanaV1.html` lines 245-252 + CONTEXT.md D-13

### Location Card Structure (from juanaV1.html, adapted)
```html
<div class="relative h-[600px] group overflow-hidden">
  <div class="bg-surface-high w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"></div>
  <div class="absolute inset-0 bg-electric/20 mix-blend-multiply group-hover:bg-transparent transition-all duration-700"></div>
  <div class="absolute bottom-0 left-0 p-12">
    <span class="bg-black text-white px-4 py-1 text-[11px] font-display font-bold tracking-widest uppercase mb-4 block w-fit">CURRENT DOCK</span>
    <h4 class="font-display font-bold text-[60px] text-white uppercase leading-none tracking-tighter">IRON MAN / SAN JUAN</h4>
    <p class="text-white/80 font-bold mt-4 uppercase tracking-[0.2em] text-[11px]">DEL BONO 383 SUR, SAN JUAN, ARGENTINA J5400</p>
    <a href="https://instagram.com/juana.onyourday" target="_blank" rel="noopener noreferrer"
       class="text-white/60 font-body text-[11px] uppercase tracking-widest mt-2 block">Ver horarios en @juana.onyourday</a>
  </div>
</div>
```
Source: `referencias/juanaV1.html` lines 211-230, adapted to project token names and D-08/D-09 decisions

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@astrojs/tailwind` integration | `@tailwindcss/vite` plugin | Tailwind v4 / Astro 5 era | `@astrojs/tailwind` silently installs Tailwind v3; must use `@tailwindcss/vite` directly |
| Google Fonts CDN for Space Grotesk | `@fontsource/space-grotesk/700.css` self-hosted | Phase 1 decision | Only weight 700 is available — `font-black` is not valid |
| `client:visible` Astro directive for scroll effects | Inline `<script>` tag in `.astro` | Phase 2 discovery | `client:visible` only works on framework components, not `.astro` files |
| `src/assets/` for public files | `public/assets/` for CSS-referenced files | Phase 1 decision | Vite hashes `src/assets/` files; CSS `url()` strings must reference `public/` paths |

**Deprecated/outdated in this project:**
- `font-black` class: Not available — Space Grotesk 700 only. Use `font-bold`.
- `font-headline` Tailwind utility: Not defined in this project's `@theme`. Use `font-display` (maps to Space Grotesk) or `font-body` (maps to Work Sans).
- `bg-primary-container`: Reference HTML name. Use `bg-electric` in this project.
- `bg-surface-container-low`: Reference HTML name. Use `bg-surface-low` in this project.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely code/config changes. All required tools (Node.js, Astro dev server, npm) are already confirmed operational from Phase 2. No external services, databases, or CLIs are introduced.

---

## Open Questions

1. **Nav placement: before or inside BaseLayout's `<slot />`**
   - What we know: BaseLayout has a single `<slot />` inside `<body>`. Nav must be `position: fixed`.
   - What's unclear: Whether Nav should be extracted into BaseLayout directly (making it available on all pages) or kept in index.astro (single page scope for v1).
   - Recommendation: Place Nav in `index.astro` for now (Phase 3 scope is landing page only). If multi-page navigation is needed in v2, move Nav into BaseLayout.

2. **`<footer>` tag vs. `<FooterSection>` rendering inside `<main>`**
   - What we know: index.astro currently wraps everything in `<main>`. FooterSection should render as `<footer>` outside `<main>` semantically.
   - What's unclear: Whether the planner treats this as a concern (HTML semantics) or an acceptable v1 simplification.
   - Recommendation: Have FooterSection render `<footer>` element internally and place `<FooterSection />` after `</main>` in index.astro. This matches the reference HTML structure exactly.

---

## Sources

### Primary (HIGH confidence)
- `referencias/juanaV1.html` — Full visual reference; marquee CSS, location card structure, footer structure extracted directly
- `src/styles/global.css` — Confirmed CSS vars (`--nav-blur`, `--nav-bg`), `@theme` token names, grain overlay z-index
- `src/layouts/BaseLayout.astro` — Confirmed `<slot />` placement, `<body>` classes
- `src/pages/index.astro` — Confirmed current structure (BaseLayout + HeroCanvas only)
- `.planning/phases/03-content-sections/03-CONTEXT.md` — All 16 decisions D-01 through D-16
- `.planning/phases/03-content-sections/03-UI-SPEC.md` — Full component specs, typography, spacing, color, copy

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` Accumulated Context — Confirmed `@tailwindcss/vite` decision, `font-weight: 700` only for Space Grotesk, `public/assets/` pattern
- `package.json` — Confirmed installed versions: Astro ^5.0.0, Tailwind ^4.0.0, no new dependencies needed

### Tertiary (LOW confidence)
- None — all claims verified against project source files or official reference HTML.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against installed package.json; no new dependencies
- Architecture: HIGH — component file locations and integration points confirmed from existing src/ structure
- Pitfalls: HIGH — each pitfall cross-referenced against global.css, UI-SPEC, and juanaV1.html reference

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack — Astro 5 + Tailwind v4 stable releases)
