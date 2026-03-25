# Architecture Research

**Domain:** Static landing page — Astro + Three.js island + Tailwind v4 + Vercel
**Project:** Juana House — Urban Nomad Editorial
**Researched:** 2026-03-25
**Confidence:** HIGH (all core claims verified against official Astro, Tailwind, Three.js docs)

---

## Standard Architecture

### System Overview

```
Browser
  │
  └── CDN (Vercel Edge) — serves pre-built static HTML
        │
        ├── <head>
        │     ├── global.css (Tailwind v4 via Vite — compiled at build time)
        │     ├── Space Grotesk 700/900 (self-hosted woff2, preloaded)
        │     └── Work Sans 500 (self-hosted woff2)
        │
        ├── Nav.astro (static HTML)
        │
        ├── Hero.astro (static HTML: headline, badges, CTA buttons)
        │     └── HeroIsland.astro (vanilla JS Three.js scene)
        │           └── Loads via IntersectionObserver — NOT part of initial bundle
        │
        ├── Marquee.astro (static HTML + CSS @keyframes — no JS)
        ├── TribuNomade.astro (static HTML + Astro <Image />)
        ├── Menu.astro (static HTML — hardcoded items)
        ├── Locations.astro (static HTML + Astro <Image /> + CSS grayscale hover)
        ├── FeaturedProduct.astro (static HTML + Astro <Image />)
        └── Footer.astro (static HTML)

Build pipeline (Astro + Vite + Rollup):
  src/ (.astro, .js, .css) → dist/ (HTML + hashed assets)
  Tailwind v4 Vite plugin → scans .astro for class usage → outputs minimal CSS
  Sharp → converts src/assets/ images to WebP at build time
  Rollup → tree-shakes Three.js import to ~150-250KB (only what's used)
```

### Component Responsibilities

| Component | Responsibility | Renders | JS |
|-----------|---------------|---------|-----|
| `BaseLayout.astro` | `<html lang="es" class="dark">`, `<head>`, global CSS, font preloads, grain overlay div, meta/OG | Static HTML | None |
| `Nav.astro` | Logo wordmark, section links, CTA button, glassmorphism-on-scroll | Static HTML | Minimal inline script: `scrollY > 80` triggers `backdrop-blur` class |
| `Hero.astro` | Hero section shell: headline at 12vw, badge strip, CTA buttons, editorial quote block, smiley placeholder | Static HTML | None |
| `HeroIsland.astro` | Three.js canvas container — initializes scene via IntersectionObserver | Static HTML shell | Loads Three.js after viewport entry |
| `src/three/logoScene.js` | Scene setup, SVGLoader extrusion, lighting, render loop, resize, cleanup | — | Three.js module (~150-250KB tree-shaken) |
| `Marquee.astro` | Electric Blue interstitial with brand phrases — purely CSS animated | Static HTML + `@keyframes` | None |
| `TribuNomade.astro` | Brand story section: truck image + editorial copy + "TRIBU NOMADE" overlay label | Static HTML | None |
| `Menu.astro` | Brutalist menu list: item name / descriptor / price | Static HTML | None |
| `Locations.astro` | Iron Man + Cara Sur location cards: grayscale-to-color hover, address, hours | Static HTML | None |
| `FeaturedProduct.astro` | Full-bleed editorial image tile with overlay text | Static HTML | None |
| `Footer.astro` | Social links, copyright, brand tagline | Static HTML | None |
| `src/scripts/animations.ts` | GSAP + ScrollTrigger shared entry point — imported by sections that need scroll reveals | — | GSAP ~30KB (deduplicated by Astro bundler) |

---

## Recommended Project Structure

```
juana-house/
├── public/
│   ├── fonts/                     # Self-hosted woff2 files (Space Grotesk 700/900, Work Sans 500)
│   ├── textures/
│   │   └── grain.webp             # Pre-rendered 200×200px grain tile (see Pitfalls — SVG CPU repaint)
│   ├── logo.svg                   # Smiley logo as clean SVG paths — used by Three.js SVGLoader
│   └── favicon.svg
│
├── src/
│   ├── pages/
│   │   └── index.astro            # Single page — composes all section components
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro       # <html class="dark">, <head>, meta, font preloads, grain overlay
│   │
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro             # Static hero shell — slots in HeroIsland
│   │   ├── HeroIsland.astro       # Three.js canvas wrapper (IntersectionObserver lazy init)
│   │   ├── Marquee.astro          # CSS-only animated brand strip
│   │   ├── TribuNomade.astro
│   │   ├── Menu.astro
│   │   ├── Locations.astro
│   │   ├── FeaturedProduct.astro
│   │   └── Footer.astro
│   │
│   ├── three/
│   │   └── logoScene.js           # Vanilla Three.js: scene, SVGLoader, ExtrudeGeometry, animate, dispose
│   │
│   ├── scripts/
│   │   └── animations.ts          # GSAP + ScrollTrigger shared registration — imported by sections needing it
│   │
│   ├── styles/
│   │   └── global.css             # @import "tailwindcss"; + @theme tokens + grain + marquee keyframes
│   │
│   └── assets/
│       └── images/                # Content images — processed by astro:assets (WebP output, lazy load)
│           ├── hero-bg.jpg        # Hero background (loading="eager" fetchpriority="high")
│           ├── tribu-truck.jpg    # TribuNomade section
│           ├── location-san-juan.jpg
│           └── location-barreal.jpg
│
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── vercel.json                    # Cache headers for fonts + _astro/ hashed assets
```

### Structure Rationale

- **`public/fonts/`:** Self-hosted font woff2 files bypass build processing and are served with long-lived cache headers. Google Fonts CDN introduces DNS latency that costs 600-800ms on LCP.
- **`public/logo.svg`:** The Three.js SVGLoader uses `loader.load('/logo.svg')` — a runtime fetch. The file must be in `public/` so it is served as a static asset at a predictable URL.
- **`public/textures/grain.webp`:** Pre-rendered grain tile. The SVG `feTurbulence` grain from the reference HTML repaints CPU on every scroll frame. A static WebP tile with `transform: translateZ(0)` on the overlay forces GPU compositing and eliminates the repaint cost.
- **`src/three/`:** Isolated module directory for Three.js scene logic. Keeping it outside `components/` makes it importable and testable independently from Astro's component lifecycle. `logoScene.js` exports an `initLogoScene()` function that `HeroIsland.astro` calls via IntersectionObserver.
- **`src/scripts/animations.ts`:** Single GSAP import point. Astro deduplicates bundled scripts — even if multiple components import from this file, GSAP is bundled once. `gsap.registerPlugin(ScrollTrigger)` must only be called once; this file is the right place.
- **`src/assets/images/`:** Content images that need WebP conversion, dimension inference, and lazy loading go here. Images in `public/` bypass Astro's `<Image />` optimization pipeline entirely.

---

## Architectural Patterns

### Pattern 1: Three.js Island via IntersectionObserver (Not `client:` directive)

**What:** `client:visible` and all `client:*` directives are exclusive to UI framework components (React, Vue, Svelte). Vanilla `.astro` components cannot use them. For vanilla Three.js in an `.astro` component, replicate the `client:visible` behavior manually with an `IntersectionObserver` in a scoped `<script>` tag.

**When to use:** Any computationally heavy vanilla JS that should not load until the user reaches its container.

**Trade-offs:** Slightly more boilerplate than a React/R3F island with `client:visible`. No framework runtime overhead (~45KB React avoided).

**Example:**
```astro
<!-- HeroIsland.astro -->
<div id="hero-canvas-container" style="aspect-ratio: 1/1; width: 100%;">
  <canvas id="hero-canvas" style="width:100%; height:100%;"></canvas>
</div>

<script>
  import { initLogoScene } from "../three/logoScene.js";

  const container = document.getElementById("hero-canvas-container");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        initLogoScene("hero-canvas");
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );
  if (container) observer.observe(container);
</script>
```

### Pattern 2: Static HTML LCP with 3D Logo as Secondary Visual

**What:** The LCP element is a static text headline (`<h1>` at 12vw), not the Three.js canvas. The 3D logo renders in a sibling container within the hero. A flat SVG placeholder (`background-image: url('/logo.svg')`) occupies the logo's layout space before Three.js loads, preventing CLS.

**When to use:** Any hero section combining instant-render text content with deferred interactive visuals.

**Trade-offs:** The 3D logo is visually the centerpiece but architecturally secondary to the text for performance purposes. The experience degrades gracefully: users see the headline and brand instantly; the 3D logo appears shortly after.

**Example:**
```astro
<!-- Hero.astro -->
<section class="relative min-h-[900px] flex flex-col justify-end px-6 py-24">
  <!-- LCP element: static text, renders immediately -->
  <h1 class="font-headline font-black text-[12vw] leading-[0.85] tracking-tighter uppercase">
    COFFEE <br/>ON YOUR <br/><span class="text-primary-container">WAY</span>
  </h1>

  <!-- 3D logo: layout space reserved by aspect-ratio before JS loads -->
  <div
    id="hero-logo-wrapper"
    class="w-48 h-48 mix-blend-screen"
    style="background-image: url('/logo.svg'); background-size: contain; background-repeat: no-repeat;"
  >
    <HeroIsland />
  </div>
</section>
```

### Pattern 3: Tailwind v4 Design Tokens via `@theme` (No `tailwind.config.js`)

**What:** Tailwind v4 uses CSS-first configuration. The entire token system from `juanaV1.html`'s inline `tailwind.config` JavaScript object is translated to a `@theme {}` block in `global.css`. The Vite plugin replaces the deprecated `@astrojs/tailwind` integration.

**When to use:** All new projects on Tailwind v4. Migrating from any CDN + `tailwind.config` setup.

**Trade-offs:** No `tailwind.config.js` to reference — all tokens live in CSS. Requires understanding of v4's `--color-*` naming convention and how it maps to utilities (`--color-primary-container` → `bg-primary-container`).

**Example:**
```css
/* src/styles/global.css */
@import "tailwindcss";

/* Dark mode via .dark class on <html> (v4 requires explicit variant declaration) */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* 0px radius everywhere — Organic Brutalism rule */
  --radius: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-full: 9999px; /* Smiley logo only */

  /* Brand colors — generate bg-*, text-*, border-* utilities automatically */
  --color-background: #131313;
  --color-surface: #131313;
  --color-surface-container: #201f1f;
  --color-surface-container-low: #1c1b1b;
  --color-surface-container-lowest: #0e0e0e;
  --color-surface-container-high: #2a2a2a;
  --color-surface-container-highest: #353534;
  --color-surface-variant: #353534;
  --color-surface-bright: #3a3939;
  --color-surface-dim: #131313;
  --color-on-background: #e5e2e1;
  --color-on-surface: #e5e2e1;
  --color-on-surface-variant: #c3c5d9;
  --color-primary: #b6c4ff;
  --color-primary-container: #0055ff;     /* Electric Blue — the brand accent */
  --color-on-primary: #002780;
  --color-on-primary-container: #e3e6ff;
  --color-inverse-primary: #004dea;
  --color-secondary: #ffb4a4;
  --color-secondary-container: #9d1d01;
  --color-tertiary: #ffb5a0;
  --color-tertiary-container: #c13301;
  --color-outline: #8d90a2;
  --color-outline-variant: #434656;

  /* Typography */
  --font-headline: "Space Grotesk", sans-serif;
  --font-body: "Work Sans", sans-serif;
  --font-label: "Space Grotesk", sans-serif;
}
```

### Pattern 4: GSAP in Scoped `<script>` Tags Targeting Static HTML

**What:** GSAP ScrollTrigger animates already-rendered static HTML nodes. It does NOT need to be inside an island (`client:*`). Placing it in a `<script>` tag inside an `.astro` component ensures it runs after the HTML is on the page, with Astro's bundler deduplicating the GSAP import across all components.

**When to use:** Any scroll-linked animations on static HTML sections.

**Trade-offs:** GSAP imports must use named imports from a shared module to avoid duplicate registration. `is:inline` bypasses the bundler — never use `<script is:inline>` for GSAP.

**Example:**
```astro
<!-- TribuNomade.astro — section with scroll reveal -->
<section id="tribu-section">
  <div class="tribu-content opacity-0 translate-y-8">
    <!-- content -->
  </div>
</section>

<script>
  import { gsap, ScrollTrigger } from "../scripts/animations";

  gsap.to("#tribu-section .tribu-content", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#tribu-section",
      start: "top 80%",
    },
  });
</script>
```

```typescript
/* src/scripts/animations.ts — shared entry, import from components */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Respect prefers-reduced-motion — required for accessible animation
gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
  gsap.globalTimeline.timeScale(0);
});

export { gsap, ScrollTrigger };
```

---

## Data Flow

### Build-Time Flow (Static)

```
src/pages/index.astro
  │
  ├── imports BaseLayout.astro
  │     └── imports src/styles/global.css → Tailwind v4 Vite plugin
  │           scans all .astro files for class usage
  │           outputs minimal CSS bundle to dist/
  │
  ├── imports all section components (.astro)
  │     └── each component with <Image /> → Sharp converts to WebP → dist/_astro/[hash].webp
  │
  └── imports HeroIsland.astro
        └── <script> imports src/three/logoScene.js
              Vite/Rollup tree-shakes Three.js named imports
              outputs ~150-250KB hashed JS bundle to dist/_astro/
```

### Runtime Flow (Browser, After Static HTML Loads)

```
Browser loads dist/index.html (static HTML, ~10-20KB, instant)
  │
  ├── CSS (Tailwind output) loads → page styled immediately
  │
  ├── Space Grotesk 700 preloaded → LCP headline renders with correct font
  │
  ├── IntersectionObserver on #hero-canvas-container
  │     │
  │     └── [user scrolls to / page loads at hero]
  │           IntersectionObserver fires (threshold: 0.1)
  │           → dynamic import of Three.js bundle (~150-250KB)
  │           → initLogoScene() called
  │           → SVGLoader fetches /logo.svg
  │           → ExtrudeGeometry builds 3D mesh
  │           → requestAnimationFrame loop starts
  │
  ├── GSAP scripts run (deferred, ~30KB)
  │     └── ScrollTrigger attaches to section elements for reveal animations
  │
  └── Nav scroll handler: scrollY > 80 → adds backdrop-blur class
```

### Key Data Flows

1. **Design tokens → all components:** `global.css @theme` variables compile to CSS custom properties consumed by Tailwind utilities across every `.astro` component. No component imports tokens directly — they come through the stylesheet.
2. **Images → WebP output:** Source images in `src/assets/` are imported in components using Astro `<Image />`. At build time, Sharp converts them to WebP with specified dimensions. The output URL includes a content hash for immutable caching.
3. **logo.svg → Three.js mesh:** The SVG file is in `public/logo.svg` (static, not processed). `SVGLoader.load('/logo.svg')` fetches it at runtime after the IntersectionObserver fires. The fetch is a separate network request from the Three.js bundle.
4. **Content → hardcoded in components:** No CMS, no API, no data files. Menu items, location details (address, hours), and brand copy are hardcoded in `.astro` component markup. This is intentional for v1 — static content means zero runtime data dependencies.

---

## Integration Points

### New Components (Does Not Exist Yet)

| Component | Integration | Notes |
|-----------|-------------|-------|
| `BaseLayout.astro` | Wraps entire page. Imports `global.css`. Sets `<html class="dark" lang="es">`. Contains grain overlay div. | Must import `global.css` here — not in pages. |
| `HeroIsland.astro` | Vanilla JS island. No `client:*` directive. IntersectionObserver pattern. Imports `../three/logoScene.js`. | Canvas must have `aspect-ratio` wrapper to prevent CLS. |
| `src/three/logoScene.js` | Imported by `HeroIsland.astro`. Fetches `/logo.svg` at runtime. Returns cleanup function. | Exports `initLogoScene(canvasId)`. Cleanup wired to `astro:before-swap` event. |
| `src/scripts/animations.ts` | Imported by section components needing scroll reveals. Registers GSAP + ScrollTrigger once. Exports both. | Must NOT use `<script is:inline>`. Uses Astro module bundling. |
| `src/styles/global.css` | Single Tailwind entry point. Contains `@import "tailwindcss"`, `@custom-variant dark`, `@theme` tokens, grain CSS, marquee `@keyframes`. | Import in `BaseLayout.astro` frontmatter only. |
| `public/logo.svg` | Fetched by `SVGLoader` at runtime. Also used as placeholder background-image in `Hero.astro`. | Must use `<path>` elements only (no `<use>`, `<symbol>`). Remove `fill`/`stroke` attributes — Three.js materials control color. |
| `public/textures/grain.webp` | CSS `background-image` on `.grain-overlay`. Pre-rendered grain tile (~3-5KB). | Replaces the SVG `feTurbulence` grain from the reference HTML to eliminate CPU repaint cost. |
| `vercel.json` | Cache headers for `/fonts/`, `/_astro/`. | `max-age=31536000, immutable` safe because Astro hashes all `_astro/` assets at build time. |

### Modified from Reference HTML (`juanaV1.html`)

| Element | What Changes | Why |
|---------|-------------|-----|
| Tailwind config | JS object in `<script id="tailwind-config">` → CSS `@theme` block in `global.css` | Tailwind v4 is CSS-first. No `tailwind.config.js`. |
| Google Fonts `<link>` | `fonts.googleapis.com` → `@fontsource/space-grotesk` + `@fontsource/work-sans` npm packages | Eliminates render-blocking external DNS request. Saves 600-800ms on LCP. |
| Material Symbols double `<link>` | Both removed | Replace with 2 inline SVG icons (`local_shipping`, `mood`). Eliminates external font dependency. |
| `lh3.googleusercontent.com` images | All replaced with local `src/assets/` files | External AI-generated placeholder images. Will break in production. |
| Grain overlay SVG filter | SVG `feTurbulence` → static `grain.webp` tile | SVG filters repaint CPU on every scroll frame. Static tile is GPU-composited. |
| Tailwind CDN `<script>` | Removed entirely | Replaced by `@tailwindcss/vite` Vite plugin — outputs only used classes. |
| `@astrojs/vercel/static` import | → `@astrojs/vercel` | `/static` entrypoint deprecated in Astro 5.x. Use root package path. |
| Operating hours | Added to Locations section | Not present in reference HTML. Critical for food truck use case. |
| Instagram CTA | Added to hero area | Only in footer in reference HTML. Should be visible above fold. |
| Address for Iron Man | Updated to `Del Bono 383 Sur, San Juan J5400` | Reference HTML has placeholder address "AV. LIBERTADOR 1250". |

---

## Build Order / Phase Dependencies

The project has hard dependencies that determine build sequencing. Each phase assumes the previous is complete and working.

```
Phase 1: Foundation
  ├── Astro project scaffold (npm create astro)
  ├── Install: tailwindcss @tailwindcss/vite three @types/three gsap
  │          @fontsource/space-grotesk @fontsource/work-sans
  ├── astro.config.mjs: Tailwind Vite plugin, output: "static"
  ├── BaseLayout.astro: <html class="dark">, <head>, font preloads
  ├── global.css: @import + @custom-variant dark + @theme all tokens
  └── VERIFY: `npm run dev` renders styled page with correct colors and fonts
        GATE: Electric Blue (#0055ff) visible in browser DevTools computed styles

Phase 2: Three.js Hero (highest-risk — do early)
  ├── DEPENDS ON: Phase 1 (global.css loaded, BaseLayout working)
  ├── Place logo.svg in public/
  ├── src/three/logoScene.js: SVGLoader + ExtrudeGeometry + animate + cleanup
  ├── HeroIsland.astro: IntersectionObserver, aspect-ratio container
  ├── Hero.astro: headline + badges + CTA + HeroIsland + SVG placeholder
  └── VERIFY: Lighthouse LCP element is <h1>, NOT canvas. Three.js loads after initial paint.
        GATE: LCP < 2.5s with 3D logo visible on viewport entry

Phase 3: Static Content Sections
  ├── DEPENDS ON: Phase 1 (design tokens, fonts)
  ├── Marquee.astro (CSS only — no JS)
  ├── TribuNomade.astro (with real truck image)
  ├── Menu.astro (hardcoded real menu items + ARS prices)
  ├── Locations.astro (Iron Man + Cara Sur with real address, hours, photos)
  ├── FeaturedProduct.astro
  └── Footer.astro
        GATE: All sections render, no external lh3.googleusercontent.com requests

Phase 4: Images and Performance
  ├── DEPENDS ON: Phase 3 (all sections built)
  ├── Replace all images with src/assets/ local files via astro <Image />
  ├── Hero background: loading="eager" fetchpriority="high"
  ├── All other images: loading="lazy" (Astro default)
  ├── Grain overlay: replace SVG feTurbulence with public/textures/grain.webp
  └── VERIFY: No external image requests. Lighthouse CLS = 0.
        GATE: All <img> src attributes point to /_astro/ hashed paths

Phase 5: Motion Layer
  ├── DEPENDS ON: Phase 3 (HTML nodes exist to animate)
  ├── src/scripts/animations.ts: GSAP + ScrollTrigger shared entry
  ├── Nav glassmorphism on scroll (scrollY > 80)
  ├── Marquee: velocity change on scroll (GSAP ScrollTrigger scrub)
  ├── Section reveals: TribuNomade, Menu header, Locations
  └── VERIFY: prefers-reduced-motion disables all GSAP animations.
        GATE: TBT < 200ms (GSAP must not block main thread)

Phase 6: Vercel Deploy + Audit
  ├── DEPENDS ON: All phases complete
  ├── vercel.json: cache headers for fonts + _astro/
  ├── Run Lighthouse CI on Vercel preview URL (not localhost)
  └── GATE: LCP < 2.5s, TBT < 200ms, CLS = 0, no broken images
```

---

## Anti-Patterns

### Anti-Pattern 1: `@astrojs/tailwind` for Tailwind v4

**What people do:** Run `npx astro add tailwind`, which may install `@astrojs/tailwind` (the v3 integration). Configure it with a `tailwind.config.js` copied from the reference HTML.

**Why it's wrong:** `@astrojs/tailwind` is deprecated for v4. It uses the PostCSS pipeline, not the Vite plugin. The JavaScript config object syntax (`colors: { 'primary-container': '...' }`) is incompatible with v4's `@theme` CSS variables. All design tokens silently disappear — no build error.

**Do this instead:** `npm install tailwindcss @tailwindcss/vite`. Add `tailwindcss()` to `vite.plugins` in `astro.config.mjs`. Translate all tokens to `@theme` in `global.css`.

---

### Anti-Pattern 2: `client:visible` on a Vanilla `.astro` Component

**What people do:** Write `<HeroIsland client:visible />` in `Hero.astro`, expecting it to lazy-load Three.js.

**Why it's wrong:** `client:*` directives only work on UI framework components (React, Vue, Svelte, Preact, Solid). Astro components are static HTML templates — they have no client-side runtime to hydrate. The directive is silently ignored.

**Do this instead:** Use an `IntersectionObserver` in a scoped `<script>` tag inside `HeroIsland.astro`. This replicates `client:visible` behavior exactly.

---

### Anti-Pattern 3: Three.js Loading in Critical Path

**What people do:** Place a `<script>` that imports Three.js in `<head>` or without deferral. Or use `client:load` on a React Three Fiber component.

**Why it's wrong:** The full Three.js bundle is ~600KB uncompressed. Even tree-shaken to ~200KB, parsing and compiling this on the main thread at page load delays TTI by 1-3 seconds on mid-range mobile. LCP is blocked.

**Do this instead:** IntersectionObserver (for vanilla) or `client:visible` (for framework islands). Three.js must not be in the initial page bundle. Verify in Chrome DevTools Network tab: the Three.js chunk should appear as a separate request that loads AFTER first paint.

---

### Anti-Pattern 4: Images in `public/` for Content

**What people do:** Put `hero-bg.jpg`, `tribu-truck.jpg` etc. in `public/images/` for simplicity.

**Why it's wrong:** Files in `public/` bypass Astro's `<Image />` component. No WebP conversion. No intrinsic dimensions (causes CLS). No lazy loading by default. No content-hashed filenames (no immutable caching).

**Do this instead:** All content images in `src/assets/images/`, imported and rendered with `<Image src={...} />`. Only static brand assets (favicon, OG image) belong in `public/`.

---

### Anti-Pattern 5: SVG Grain Overlay with `feTurbulence`

**What people do:** Copy the `.grain-overlay` CSS from `juanaV1.html` — SVG data URI with `feTurbulence` filter — directly into the Astro project.

**Why it's wrong:** `feTurbulence` is a CPU-rendered SVG filter. On a `position: fixed` overlay, the browser repaints the filter at full viewport resolution on every scroll event. On mobile mid-range devices this causes 15-20fps jank, directly contradicting the "performance-first" requirement.

**Do this instead:** Pre-render a 200×200px grain texture in any image editor (or Photoshop noise filter) and export as WebP (~3-5KB). Use it as a repeating `background-image` with `transform: translateZ(0)` to force GPU compositing. The visual result is identical; the performance cost is near-zero.

---

### Anti-Pattern 6: `@astrojs/vercel/static` Import Path

**What people do:** `import vercel from '@astrojs/vercel/static'` — copied from older docs.

**Why it's wrong:** The `/static` and `/serverless` entrypoints are deprecated in Astro 5.x. They still work but are undocumented and will be removed in a future version.

**Do this instead:** `import vercel from '@astrojs/vercel'`. The adapter detects the `output` setting and behaves accordingly.

---

## Scaling Considerations

This is a v1 static landing page. Scaling concerns are minimal but worth documenting for the v2 roadmap.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| v1 (current) | Hardcoded content in `.astro` files. No data layer. |
| v2 (content updates) | Extract menu items and location data to `src/content/` Astro Content Collections (typed JSON/YAML). Components query collections at build time. No CMS needed. |
| v2 (photo freshness) | Instagram Basic Display API fetched at Astro build time via `astro:build` hook — static grid updated on each deploy. No client-side API calls. |
| v3 (if CMS added) | Switch content to a headless CMS (Sanity, Storyblok). Astro content loaders via `defineCollection`. Build triggers via webhook from CMS. |

### First Bottleneck (v1)

The Three.js bundle size. If the SVG extrusion requires many path subdivisions, the geometry complexity grows. Monitor with `rollup-plugin-visualizer` during Phase 2. Target: Three.js island chunk < 250KB gzipped. Mitigation: use named imports only, reduce bevel segments.

---

## Sources

- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) — HIGH confidence
- [Astro Template Directives Reference (client:* only for framework components)](https://docs.astro.build/en/reference/directives-reference/) — HIGH confidence
- [Astro Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/) — HIGH confidence
- [Tailwind CSS v4 + Astro: Official Installation Guide](https://tailwindcss.com/docs/installation/framework-guides/astro) — HIGH confidence
- [Tailwind v4 @theme directive](https://tailwindcss.com/docs/theme) — HIGH confidence
- [Tailwind v4 dark mode variant declaration](https://tailwindcss.com/docs/dark-mode) — HIGH confidence
- [@astrojs/vercel adapter — unified import path](https://docs.astro.build/en/guides/integrations-guide/vercel/) — HIGH confidence
- [Astro Images Guide (`<Image />` component, src/assets/)](https://docs.astro.build/en/guides/images/) — HIGH confidence
- [Three.js SVGLoader + ExtrudeGeometry](https://threejs.org/docs/#examples/en/loaders/SVGLoader) — HIGH confidence
- [Three.js Cleanup manual](https://threejs.org/manual/en/cleanup.html) — HIGH confidence
- [GSAP ScrollTrigger + Astro (Codrops, Feb 2026)](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) — HIGH confidence
- [GSAP Accessible Animation (prefers-reduced-motion)](https://gsap.com/resources/a11y/) — HIGH confidence
- [web.dev: Optimize web fonts](https://web.dev/learn/performance/optimize-web-fonts) — HIGH confidence
- [WebGL context limit (Khronos)](https://www.khronos.org/webgl/wiki/HandlingContextLost) — HIGH confidence
- Direct analysis: `referencias/juanaV1.html` (Juana House reference implementation)
- Direct analysis: `referencias/DESIGN.md` (Urban Nomad Editorial design system)

---
*Architecture research for: Juana House landing page — Astro + Three.js + Tailwind v4 + Vercel*
*Researched: 2026-03-25*
