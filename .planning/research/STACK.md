# Technology Stack

**Project:** Juana House — Coffee Shop Landing Page
**Researched:** 2026-03-25
**Confidence:** HIGH (core decisions verified via official docs + npm + WebSearch)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 5.x (latest ~5.17+) | Static site generator, island orchestration | Zero-JS by default. Islands architecture is the exact model for a static page with one interactive 3D component. Vercel static deploy with zero config. See note below on v6. |
| `@astrojs/vercel` | latest | Vercel adapter for analytics + image optimization | Optional but enables Vercel Image Optimization API and Web Analytics without SSR. `output: 'static'` keeps site fully prerendered. |

**Astro 5 vs 6 decision — use Astro 5.x:**

Astro 6.0 stable released on March 10, 2026. It requires Node 22+ (drops Node 18 and 20). Its headline features are a redesigned dev server using Vite's Environment API (mainly relevant for Cloudflare Workers deployments), a Fonts API, and a CSP API. None of these features are needed for a pure Vercel-static landing page. Astro 5.x (currently 5.17+) is stable, production-proven, and fully supported on Vercel with Node 18/20/22. Use 5.x for this project. Upgrade to 6 after it has 3-6 months of ecosystem adoption — migration is estimated at 1-2 hours when needed.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4.x | Utility-first CSS, design token system | v4 uses the `@tailwindcss/vite` plugin — not the deprecated `@astrojs/tailwind` integration. Native Vite plugin means faster HMR and smaller output. Matches the reference HTML (juanaV1.html) token system exactly. |
| `@tailwindcss/vite` | v4.x | Vite plugin for Tailwind v4 | Correct install path for Astro + Tailwind v4. Added directly to `astro.config.ts` as a Vite plugin. No `tailwind.config.js` needed — tokens go into CSS via `@theme` directive. |

**Important:** The reference HTML (juanaV1.html) uses Tailwind CDN with an inline config object (`tailwind.config = {...}`). In the Astro build you replace that with `@theme {}` tokens in `global.css`. The token values are already defined in the reference — transcribe them.

**Tailwind v4 setup:**
```bash
npm install tailwindcss @tailwindcss/vite
```
In `astro.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  vite: { plugins: [tailwindcss()] }
});
```
In `src/styles/global.css`:
```css
@import "tailwindcss";
@theme {
  --color-electric-blue: #0055ff;
  --color-electric-blue-light: #b6c4ff;
  --color-surface: #131313;
  --color-on-surface: #e5e2e1;
  --font-family-headline: 'Space Grotesk', sans-serif;
  --font-family-body: 'Work Sans', sans-serif;
  --radius-DEFAULT: 0px;
  --radius-lg: 0px;
  /* full token set from juanaV1.html reference */
}
```

---

### 3D: The Hero Logo

**Decision: Vanilla Three.js in an Astro island (`client:visible`)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `three` | 0.183.x (r183) | WebGL 3D rendering, SVGLoader, ExtrudeGeometry | Direct, no React dependency. SVGLoader parses the smiley SVG path; ExtrudeGeometry adds Z-depth. Ships as a self-contained island loaded only when visible. |
| `@types/three` | matching | TypeScript types | DX only. Zero runtime cost. |

**Why not React Three Fiber (R3F):**
R3F is a React reconciler on top of Three.js. It adds approximately 40KB of React runtime for a use case where no other part of the site uses React. Vanilla Three.js delivers identical rendering capability with direct control, a smaller bundle, and no framework-bridging complexity inside an Astro island.

**Why not Spline:**
The `@splinetool/runtime` package is 6.82 MB uncompressed. Even a simple scene shows 17+ second CPU times on desktop benchmarks. It loads at parse time unless manually deferred with dynamic imports — a workaround that defeats the purpose of using it. For a site with an LCP < 2.5s hard requirement, Spline is a non-starter.

**SVG extrusion workflow:**
1. Export the smiley logo as an SVG.
2. In the Three.js island, use `SVGLoader` (`three/addons/loaders/SVGLoader.js`) to parse paths.
3. Call `SVGLoader.createShapes(path)` on each path to get `THREE.Shape` objects.
4. Pass shapes to `ExtrudeGeometry` with `{ depth: 20, bevelEnabled: true, bevelSize: 2 }`.
5. Animate rotation with `requestAnimationFrame`.

**LCP protection — critical:**
The 3D logo is a brand identity element but it must NOT be the LCP element. The LCP element is the text headline (static HTML). Strategy:
- Wrap the Three.js island in `client:visible` so Three.js does not block the critical path.
- Render a flat SVG placeholder (the smiley as `background-image`) that displays instantly.
- The 3D canvas fades in over the placeholder once initialized.
- Never use `client:load` for 3D — this puts Three.js in the initial JS bundle.

```astro
<!-- Hero.astro -->
<div class="logo-placeholder" style="background-image: url('/smiley.svg')">
  <LogoIsland client:visible />
</div>
```

**Tree-shaking Three.js:**
Import only what you use. The full `three` package is ~600KB uncompressed; named imports with Vite's Rollup tree-shaking brings the 3D island to ~150-250KB depending on geometry complexity.

```ts
// Do this:
import { WebGLRenderer, Scene, PerspectiveCamera, ExtrudeGeometry, MeshStandardMaterial } from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// Not this:
import * as THREE from 'three';
```

---

### Scroll Animations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GSAP + ScrollTrigger | 3.x (3.12+) | Scroll-linked animations, marquee, entrance effects | GSAP became fully free for all projects (including commercial) after Webflow's acquisition of GreenSock in 2024. Industry standard for scroll animations. Zero hydration cost in Astro — runs in `<script>` tags that operate on already-rendered static HTML. |

**Why not CSS Scroll-Driven Animations:**
CSS scroll timelines (`animation-timeline: scroll()`) are limited in expressiveness and debugging experience. For the Organic Brutalism / editorial aesthetic of Juana House — marquee velocity, staggered reveals, text snapping to scroll position — GSAP ScrollTrigger is more appropriate. Simple cases can use CSS; complex synchronized motion needs GSAP.

**Usage pattern in Astro — no island directive needed:**
```astro
---
// Section.astro
---
<section class="section-reveal">...</section>

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.section-reveal', { opacity: 0, y: 40, scrollTrigger: '.section-reveal' });
</script>
```

---

### Fonts

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fontsource/space-grotesk` | latest | Self-host Space Grotesk | Import Bold (700) and Black (900) subsets only. Eliminates Google Fonts external DNS round-trip. |
| `@fontsource/work-sans` | latest | Self-host Work Sans | Import Regular (400) and Medium (500) only. Same rationale. |

**Why not Google Fonts CDN:**
The reference HTML uses Google Fonts for convenience in prototyping. In production, an external font request adds a DNS lookup + TLS handshake before the browser can even begin downloading font bytes. Self-hosting with Fontsource eliminates this and improves LCP. Use `font-display: swap` to avoid FOIT.

**Load only the weights you use:**
```ts
// In main layout
import '@fontsource/space-grotesk/700.css'; // Bold
import '@fontsource/space-grotesk/900.css'; // Black
import '@fontsource/work-sans/400.css';     // Regular
import '@fontsource/work-sans/500.css';     // Medium
```

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | (Astro peer dep) | Image optimization | Astro uses Sharp for `<Image>` component. All content images → WebP, lazy loaded. Install separately: `npm install sharp`. |

**Material Symbols (icons in reference HTML):** The reference uses Google Material Symbols CDN. For production, evaluate whether any icons are actually needed. If yes, load the SVG icons inline or use a specific icon library — do not load the full Material Symbols webfont for a handful of icons. If icons are minimal, inline SVG is better.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework version | Astro 5.x | Astro 6 | Astro 6 (released March 10, 2026) requires Node 22+. Its new features (Fonts API, CSP, workerd dev server) are irrelevant for Vercel-static. 5.x is stable, proven, and sufficient. |
| 3D rendering | Vanilla Three.js | React Three Fiber | R3F requires React runtime (~40KB). No other React in the project. DX benefit does not justify the payload. |
| 3D rendering | Vanilla Three.js | Spline | 6.82MB runtime, 17s+ CPU time on desktop benchmarks. Disqualified on Core Web Vitals alone. |
| Scroll animation | GSAP ScrollTrigger | CSS scroll timelines | Less expressive for complex editorial motion. GSAP is now fully free. |
| Scroll animation | GSAP ScrollTrigger | Framer Motion | React dependency. Not applicable in Astro without a React island. |
| Styling | Tailwind v4 | Tailwind v3 | v4 is the current release. v3 is in maintenance mode. v4 Vite plugin is the correct approach with Astro 5.x. |
| Framework | Astro 5.x | Next.js | Next.js is SSR/React-first. A static marketing page with one 3D island is the exact use case Astro was designed for. Zero JS by default vs Next.js baseline of ~70KB React. |
| Fonts | @fontsource (self-hosted) | Google Fonts CDN | External request adds DNS lookup latency. Self-hosting with `font-display: swap` is better for LCP. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@astrojs/tailwind` integration | Deprecated for Tailwind v4. Only relevant for v3. Guides referencing it are outdated. | `@tailwindcss/vite` plugin in `astro.config.ts` |
| `client:load` for the 3D island | Forces Three.js into the initial JS bundle, blocking first paint and degrading LCP. | `client:visible` — loads only when the canvas enters the viewport |
| `import * as THREE from 'three'` | Imports the entire Three.js library (~600KB). Vite cannot tree-shake star imports. | Named imports: `import { WebGLRenderer, Scene, ... } from 'three'` |
| Google Fonts CDN in production | External DNS round-trip increases LCP. The reference HTML uses it for prototyping convenience only. | `@fontsource/space-grotesk` + `@fontsource/work-sans` (npm, self-hosted) |
| Material Symbols webfont (full) | Loading a complete icon font for 2-3 icons is wasteful. | Inline SVG for the specific icons needed |
| React (any integration) | Adds ~40KB React runtime to a project that has no React components. Three.js and GSAP are both vanilla. | Astro components + vanilla TS scripts |
| Spline | 6.82MB runtime. See notes above. | Vanilla Three.js |
| CMS (Contentful, Sanity, etc.) | v1 content is static and defined. No runtime queries needed. Unnecessary complexity. | Hardcoded Astro components / MDX files if needed |

---

## Installation

```bash
# 1. Scaffold
npm create astro@latest juana-web -- --template minimal

# 2. Styling
npm install tailwindcss @tailwindcss/vite

# 3. 3D
npm install three
npm install -D @types/three

# 4. Animations
npm install gsap

# 5. Fonts (self-hosted)
npm install @fontsource/space-grotesk @fontsource/work-sans

# 6. Image optimization
npm install sharp

# 7. Vercel adapter (optional — for analytics + image CDN)
npm install @astrojs/vercel
```

**`astro.config.ts` skeleton:**
```ts
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),          // remove if Vercel features (analytics/image CDN) not needed
  vite: {
    plugins: [tailwindcss()],
  },
});
```

---

## Performance Budgets

| Metric | Target | How Stack Achieves It |
|--------|--------|-----------------------|
| LCP | < 2.5s | Static HTML + self-hosted fonts + text as LCP element (not image or 3D canvas) |
| TBT | < 200ms | Three.js loads after `client:visible`, not at parse time |
| CLS | 0 | Logo placeholder SVG holds layout space before 3D canvas mounts |
| JS (initial) | < 50KB | No React. GSAP ~30KB. Three.js deferred. |
| JS (3D island) | ~150-250KB | Named Three.js imports, tree-shaken by Vite/Rollup |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Astro 5.x | Tailwind v4 via `@tailwindcss/vite` | Requires Astro 5.2+ for full v4 support. 5.17+ recommended. |
| Astro 5.x | `@astrojs/vercel` latest | Static adapter works with `output: 'static'`. No SSR needed. |
| Three.js r183 | Vite 5.x (bundled in Astro 5) | r183 includes fixes for Vite dynamic import warnings. ESM imports work directly. |
| GSAP 3.x | Astro 5.x | GSAP runs in plain `<script>` tags. No island directive. No compatibility issues. |
| @fontsource/* | Astro 5.x | Standard npm package. Import CSS files in layout component. |

---

## Sources

- Astro 6 stable release notes (March 10, 2026): https://astro.build/blog/astro-6/
- Astro Islands architecture: https://docs.astro.build/en/concepts/islands/
- Astro + Tailwind v4 official guide: https://tailwindcss.com/docs/installation/framework-guides/astro
- Astro 5.2 Tailwind v4 support announcement: https://astro.build/blog/astro-520/
- Three.js r183 release (February 20, 2025): https://github.com/mrdoob/three.js/releases/tag/r183
- Three.js npm: https://www.npmjs.com/package/three
- Spline performance issue (reference): https://dev.to/tolumen/optimizing-web-performance-how-lazy-loading-spline-assets-took-our-build-from-30-to-90-in-4ne2 — LOW confidence (single source, no official benchmark)
- GSAP fully free after Webflow acquisition: https://dev.to/ismail_kitmane/one-year-of-gsap-being-completely-free-what-changed-in-the-web--3i1n — MEDIUM confidence
- GSAP + Astro real-world (February 2026 Codrops): https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/
- Astro Vercel static deploy: https://docs.astro.build/en/guides/deploy/vercel/
- Fontsource Space Grotesk: https://fontsource.org/fonts/space-grotesk/install
- @astrojs/tailwind deprecation for v4: https://docs.astro.build/en/guides/integrations-guide/tailwind/

---
*Stack research for: Juana House landing page (Astro + Three.js + Tailwind v4 + Vercel)*
*Researched: 2026-03-25*
