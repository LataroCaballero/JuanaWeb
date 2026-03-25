# Phase 1: Foundation & Design System - Research

**Researched:** 2026-03-25
**Domain:** Astro 5 + Tailwind CSS v4 + @fontsource + sharp (grain generation)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scaffold**
- D-01: Blank minimal template — `npm create astro@latest` with "A minimal, empty starter". No example files, no pre-installed components.
- D-02: Folder structure from day one: `src/styles/`, `src/layouts/`, `src/assets/`, `src/components/`. Assets and styles do not mix.

**Grain Overlay Asset**
- D-03: Generate the WebP tile programmatically with a Node.js script during scaffold. The script creates a noise pattern of ~2KB (e.g., 200×200px, low-opacity monochrome noise) saved to `src/assets/grain.webp`. No placeholder debt, no external asset dependency.
- D-04: Grain applied as `background-image` CSS on a `::after` pseudo-element in `body` with `position: fixed`, `pointer-events: none`, `mix-blend-mode: overlay`, `opacity: 0.04–0.06`. Tile repeats (`background-repeat: repeat`).

**Tailwind v4 Token Scope**
- D-05: Complete `@theme` from Phase 1 — brand tokens + component-level tokens. Later-phase components only consume utilities without adding to `@theme`.
- D-06: Tokens to include:
  - **Colors:** `--color-electric: #0055ff`, `--color-electric-light: #b6c4ff`, `--color-surface: #131313`, `--color-on-surface: #e5e2e1`, `--color-surface-low: #1a1a1a`, `--color-surface-high: #353534`
  - **Typography:** `--font-display: 'Space Grotesk'`, `--font-body: 'Work Sans'`
  - **Radius:** `--radius: 0px` (absolute rule — zero radius on any element)
  - **Component-level:** `--nav-blur: 20px`, `--nav-bg: rgba(19,19,19,0.85)`, `--glow-blur: 30px`, `--glow-opacity: 0.08`
  - **Custom spacing:** Only if Tailwind defaults don't cover design guide needs (confirm in planning)
- D-07: Single file `src/styles/global.css` with all `@theme` plus `@import "tailwindcss"`. Do not split into multiple CSS files for Phase 1.

**BaseLayout**
- D-08: `BaseLayout.astro` includes SEO/OG baseline with props: `title`, `description`, `ogImage` (with defaults). Placeholder values; real content in Phase 3.
- D-09: Layout structure: `<html class="dark" lang="es">`, `<head>` with charset, viewport, font preloads (`<link rel="preload" as="font">`), OG meta tags, `<body>` with grain overlay (via CSS class on body or pseudo-element).
- D-10: Font preloads point to @fontsource files in `node_modules` — Astro copies them to `/fonts/` in the build via `public/fonts/` or Vite asset handling (confirm in planning which applies better for Astro 5).

**Fonts**
- D-11: @fontsource packages: `@fontsource/space-grotesk` (weights: 700, 900) + `@fontsource/work-sans` (weight: 500). Imported in `global.css` with `@import '@fontsource/...'`.
- D-12: PERF-02 must be verified: DevTools Network in production shows no requests to `fonts.googleapis.com`. Build must serve fonts from `/assets/` or `/fonts/`.

### Claude's Discretion
- Exact Tailwind class names for tokens (e.g., `text-electric` vs `text-primary` — Claude chooses the name consistent with the design guide)
- Exact opacity value for grain overlay (between 0.04 and 0.06)
- Specific configuration of the `@tailwindcss/vite` plugin in `astro.config.mjs`
- Whether @fontsource requires import by subset or by weight (depends on installed version)

### Deferred Ideas (OUT OF SCOPE)
None — the discussion stayed within Phase 1 scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SETUP-01 | Project runs with Astro 5 + Tailwind v4 (`@tailwindcss/vite`), `output: "static"`, and complete `@theme` tokens from the visual system | Astro 5.18.1 + @tailwindcss/vite 4.2.2 confirmed; `@theme` syntax verified via official docs |
| SETUP-02 | Fonts Space Grotesk (700/900) and Work Sans (500) are self-hosted via `@fontsource` with preloads in `<head>` (no Google Fonts CDN) | @fontsource packages verified; critical: Space Grotesk max weight is 700 (no 900) — see Pitfalls |
| SETUP-03 | `BaseLayout.astro` renders `<html class="dark" lang="es">` with `@custom-variant dark` declared and grain overlay using WebP tile (not SVG feTurbulence) | `@custom-variant dark (&:where(.dark, .dark *))` syntax verified; sharp noise generation confirmed viable |
| SETUP-04 | Full palette (Electric Blue `#0055ff`, Surface `#131313`, On-Surface `#e5e2e1`), 0px radius system, and both font families available as Tailwind utilities | `@theme` `--color-*` and `--radius-*` namespaces verified; utility generation pattern documented |

</phase_requirements>

---

## Summary

Phase 1 establishes a greenfield Astro 5 project with Tailwind CSS v4, self-hosted fonts, and a programmatically generated grain texture. All three core technical areas — Astro/Tailwind integration, @fontsource font self-hosting, and WebP grain generation — have verified, non-speculative implementation paths.

The most significant finding is a **constraint in the locked decisions**: Space Grotesk does not offer weight 900. The font's weight range tops out at 700. Decision D-06 lists "weights: 700, 900" for Space Grotesk, but weight 900 does not exist in the `@fontsource/space-grotesk` package (confirmed via fontsource.org and npm registry). The planner must address this: use weight 700 as the heaviest display weight, or switch to the variable font package (`@fontsource-variable/space-grotesk`) which still only covers 300–700.

The second significant finding is around font preloads (D-10): the cleanest Vite-compatible pattern for self-hosted @fontsource preloads is to import the `.woff2` file with Vite's `?url` suffix in the Astro layout frontmatter, then use the resulting hashed URL in a `<link rel="preload">` tag. This produces a content-hashed file in `/_astro/` that Astro/Vite handles automatically — no manual `public/fonts/` copy is needed.

**Primary recommendation:** Use sharp's built-in Gaussian noise generator (`create: { noise: { type: 'gaussian' } }`) for grain WebP generation, the `@theme` directive for all design tokens, and the Vite `?url` import pattern for font preloads.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 5.18.1 | SSG framework | Locked decision; latest 5.x on npm registry |
| tailwindcss | 4.2.2 | Utility CSS framework | Locked decision; v4 is CSS-first, no config file needed |
| @tailwindcss/vite | 4.2.2 | Vite plugin for Tailwind v4 | Required for Tailwind v4 in any Vite-based project; matches tailwindcss version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/space-grotesk | 5.2.10 | Self-hosted Space Grotesk font files | Phase 1 font self-hosting |
| @fontsource/work-sans | 5.2.8 | Self-hosted Work Sans font files | Phase 1 font self-hosting |
| sharp | 0.34.5 | Node.js image processing; generate grain WebP | Script to generate `src/assets/grain.webp` once during scaffold |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @fontsource static packages | @fontsource-variable/* (variable fonts) | Variable fonts are one file for all weights but size is larger (~50KB vs ~20KB per weight); static is correct for 2 specific weights |
| @fontsource static packages | Astro experimental fonts API | Astro's fonts API (5.7+) auto-optimizes but is still experimental; direct @fontsource import is stable and explicit |
| sharp for grain | node-canvas + pure JS noise | sharp is a hard dependency of Astro (already in node_modules); canvas requires native binaries and is heavier |
| @tailwindcss/vite | @astrojs/tailwind | @astrojs/tailwind installs Tailwind v3 silently — **explicitly prohibited** by project decisions |

**Installation:**
```bash
npm create astro@latest -- --template minimal
npm install tailwindcss @tailwindcss/vite
npm install @fontsource/space-grotesk @fontsource/work-sans
# sharp is likely already present as an Astro transitive dep; install explicitly to be safe:
npm install --save-dev sharp
```

**Version verification (confirmed 2026-03-25):**
- astro@5 latest: 5.18.1
- tailwindcss: 4.2.2
- @tailwindcss/vite: 4.2.2
- @fontsource/space-grotesk: 5.2.10
- @fontsource/work-sans: 5.2.8
- sharp: 0.34.5

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── styles/
│   └── global.css        # Single file: @import "tailwindcss" + full @theme
├── layouts/
│   └── BaseLayout.astro  # Root layout: dark html, font preloads, grain body
├── assets/
│   └── grain.webp        # Generated by scripts/gen-grain.mjs at scaffold time
├── components/           # Empty in Phase 1; used from Phase 2+
└── pages/
    └── index.astro       # Smoke-test page importing BaseLayout

scripts/
└── gen-grain.mjs         # Node.js script; run once: node scripts/gen-grain.mjs

astro.config.mjs          # Vite plugin registration; output: "static"
```

### Pattern 1: Tailwind v4 @theme Token Declaration

**What:** All design tokens declared inside `@theme {}` in `global.css`. The `@theme` block generates both CSS custom properties on `:root` and corresponding Tailwind utility classes simultaneously.

**When to use:** All project-wide design decisions — colors, typography, radii, component tokens.

**Example:**
```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/theme */

@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Brand colors */
  --color-electric:       #0055ff;
  --color-electric-light: #b6c4ff;
  --color-surface:        #131313;
  --color-on-surface:     #e5e2e1;
  --color-surface-low:    #1a1a1a;
  --color-surface-high:   #353534;

  /* Typography */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Work Sans', system-ui, sans-serif;

  /* Zero Roundedness — absolute rule */
  --radius-none: 0px;
  --radius-sm:   0px;
  --radius-md:   0px;
  --radius-DEFAULT: 0px;
  --radius-lg:   0px;
  --radius-xl:   0px;
  --radius-2xl:  0px;
  --radius-3xl:  0px;

  /* Component-level tokens (not utility-generating — use as CSS vars) */
  --nav-blur:      20px;
  --nav-bg:        rgba(19, 19, 19, 0.85);
  --glow-blur:     30px;
  --glow-opacity:  0.08;
}
```

Generated utilities from `--color-electric: #0055ff`:
- `bg-electric`, `text-electric`, `border-electric`, `fill-electric`

Generated utilities from `--font-display`:
- `font-display`

Generated utilities from `--radius-*: 0px`:
- `rounded`, `rounded-sm`, `rounded-lg`, etc. → all produce `border-radius: 0px`

### Pattern 2: @custom-variant dark (Class-Based Dark Mode)

**What:** Override Tailwind v4's default media-query dark mode with a class-based selector.

**When to use:** When dark mode is always-on (fixed `class="dark"` on `<html>`), or when dark mode is toggled by JavaScript adding/removing a class.

**Example:**
```css
/* Source: https://tailwindcss.com/docs/dark-mode */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Then in HTML:
```html
<html class="dark" lang="es">
```

The `:where()` wrapper ensures low specificity so component-level overrides still work.

### Pattern 3: @fontsource Import + Vite ?url Preload

**What:** Import @fontsource font CSS in global.css (registers @font-face). Import the woff2 URL in the Astro layout frontmatter using Vite's `?url` import to get the hashed production URL for a preload `<link>` tag.

**When to use:** Any self-hosted font where you want both @font-face declaration AND a `<link rel="preload">` with the correct hashed URL.

**Example:**
```astro
---
/* src/layouts/BaseLayout.astro */
/* Source: https://fontsource.org/docs/getting-started/preload */

// Font woff2 file URL imports — Vite resolves these to hashed /_astro/ paths in build
import spaceGroteskWoff2 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url';
import workSansWoff2 from '@fontsource/work-sans/files/work-sans-latin-500-normal.woff2?url';

const { title = 'JUANA HOUSE', description = '...', ogImage = '/og.jpg' } = Astro.props;
---
<html class="dark" lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Font preloads must come before stylesheet -->
    <link rel="preload" as="font" type="font/woff2"
      href={spaceGroteskWoff2} crossorigin="anonymous" />
    <link rel="preload" as="font" type="font/woff2"
      href={workSansWoff2} crossorigin="anonymous" />
    <!-- OG / SEO -->
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:image" content={ogImage} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

And in `global.css`:
```css
/* Weight-specific imports — only pulls the needed font files */
@import '@fontsource/space-grotesk/700.css';
/* NOTE: weight 900 does NOT exist — 700 is the maximum for Space Grotesk */
@import '@fontsource/work-sans/500.css';
```

### Pattern 4: Grain WebP Generation Script

**What:** One-shot Node.js script using `sharp`'s built-in Gaussian noise generator to create a tileable monochrome noise texture saved as WebP.

**When to use:** Run once during scaffold; output committed to `src/assets/grain.webp`.

**Example:**
```javascript
// scripts/gen-grain.mjs
// Source: https://sharp.pixelplumbing.com/api-constructor (noise option)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '../src/assets/grain.webp');

await sharp({
  create: {
    width: 200,
    height: 200,
    channels: 1,          // Greyscale — minimizes file size
    noise: {
      type: 'gaussian',
      mean: 128,
      sigma: 30,           // Controls noise intensity; 30 = subtle grain
    },
  },
})
  .webp({ quality: 50, lossless: false })  // ~2KB output target
  .toFile(OUTPUT);

console.log('grain.webp generated at', OUTPUT);
```

The resulting tile is served via CSS `background-image: url('/assets/grain.webp')` on a `::after` fixed pseudo-element at `opacity: 0.05` (within D-04's 0.04–0.06 range).

### Pattern 5: Grain Overlay via CSS Pseudo-Element

**What:** Apply grain texture as a fixed overlay using `body::after` to avoid DOM node overhead.

**Example:**
```css
/* In global.css or inline <style> in BaseLayout */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url('/assets/grain.webp');
  background-repeat: repeat;
  background-size: 200px 200px;
  mix-blend-mode: overlay;
  opacity: 0.05;
}
```

Note: In Astro, `src/assets/` images are processed by Vite and output to `/_astro/[hash].webp`. For a CSS background-image reference that survives the build, the grain.webp must be placed in `public/assets/` (served at `/assets/grain.webp` verbatim) OR referenced via Vite's `?url` import. The `public/` approach is simpler for a CSS file reference.

### Anti-Patterns to Avoid

- **Using `@astrojs/tailwind`:** Silently installs Tailwind v3 — prohibited. Use `@tailwindcss/vite` only.
- **Using CDN for fonts:** The reference HTML (`juanaV1.html`) uses Google Fonts CDN — this must NOT be copied into the Astro project. All fonts must be self-hosted via @fontsource.
- **SVG feTurbulence for grain:** Prohibited by D-03 and SETUP-03. CPU-expensive, causes jank on scroll. Use WebP tile.
- **`@import 'tailwindcss/tailwind.css'`:** Old Tailwind v3 import path. In v4, use `@import "tailwindcss"` (bare).
- **Dividing global.css into multiple files in Phase 1:** D-07 specifies a single file. Don't split.
- **Adding `tailwind.config.js`:** Tailwind v4 is fully CSS-configured. No config file needed or expected.
- **Using `public/` for @fontsource files:** @fontsource ships CSS that registers @font-face paths into `node_modules`. Use `@import '@fontsource/...'` in CSS, not manual file copies.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode selector scoping | Custom PostCSS plugin or wrapping selectors | `@custom-variant dark (&:where(.dark, .dark *))` | Tailwind v4 built-in; covers inherited selector scoping automatically |
| Font self-hosting | Download + manually copy woff2 to public/ | `@fontsource/*` npm packages | Fontsource maintains subsets, formats, @font-face declarations, and version-pins |
| Noise texture generation | Manual pixel math, node-canvas, external tool | `sharp` with `create: { noise }` option | sharp is already in the dependency tree (Astro uses it); built-in Gaussian noise; WebP output in one call |
| CSS custom properties for tokens | Separate `:root { --color-electric: ... }` block | `@theme` in Tailwind v4 | `@theme` generates BOTH CSS vars AND utility classes in one declaration |
| Tailwind config file | `tailwind.config.js` / `tailwind.config.ts` | `@theme {}` in `global.css` | Tailwind v4 eliminates the config file; CSS-first configuration is the standard |

**Key insight:** Tailwind v4's `@theme` replaces the entire JavaScript config file. Writing a `tailwind.config.js` alongside `@tailwindcss/vite` is not just unnecessary — it may conflict with v4's CSS-only token resolution.

---

## Common Pitfalls

### Pitfall 1: Space Grotesk Weight 900 Does Not Exist

**What goes wrong:** `@import '@fontsource/space-grotesk/900.css'` fails silently or throws a module not found error. The decision D-06 specifies "weights: 700, 900" but Space Grotesk's maximum weight is **700**.

**Why it happens:** The font designer (Florian Karsten Typefaces) only released Space Grotesk up to Bold (700). Weight 900 was never cut for this typeface.

**How to avoid:** Use `@import '@fontsource/space-grotesk/700.css'` only. Treat 700 as the "bold display" weight for all headline use cases. Update D-06 during planning to remove the 900 reference.

**Warning signs:** Build error `Cannot find module '@fontsource/space-grotesk/900.css'`; or silently falling back to system font.

### Pitfall 2: grain.webp in src/assets/ is Not Accessible as a CSS background-image String

**What goes wrong:** `background-image: url('/assets/grain.webp')` in global.css returns 404 in production because Vite processes `src/assets/` and outputs files to `/_astro/[hash].webp` with a hash filename.

**Why it happens:** Astro/Vite hashes static assets from `src/assets/` for cache-busting. String references in CSS files that point to absolute paths like `/assets/grain.webp` do not get rewritten.

**How to avoid:** Either:
- (A) **Preferred:** Place `grain.webp` in `public/assets/grain.webp`. Files in `public/` are copied verbatim to the build root and accessible at `/assets/grain.webp` with no hashing.
- (B) Import the grain image in BaseLayout.astro with `?url` and inject it as an inline style or CSS variable.

The generation script (D-03) says "saved to `src/assets/grain.webp`" — the planner should resolve this to `public/assets/grain.webp` or add a Vite-aware import step.

### Pitfall 3: @astrojs/tailwind vs @tailwindcss/vite

**What goes wrong:** Developer installs `@astrojs/tailwind` (the official Astro integration) and it pulls in Tailwind v3, silently overriding the v4 intent. Class names, config syntax, and `@theme` do not work.

**Why it happens:** `@astrojs/tailwind` has a peer dependency on Tailwind v3, not v4. It predates Tailwind v4.

**How to avoid:** Never run `npx astro add tailwind`. Manually install `@tailwindcss/vite` and add it to `vite.plugins` in `astro.config.mjs`.

**Warning signs:** `tailwind.config.js` appears in project root; `@theme` has no effect; `npx tailwindcss --version` returns `3.x.x`.

### Pitfall 4: Tailwind v4 Radius Token Namespace

**What goes wrong:** `@theme { --radius: 0px }` alone does not override all rounded-* utilities. The v4 theme uses **`--radius-{size}`** namespace (e.g., `--radius-sm`, `--radius-lg`), not a single `--radius` shorthand.

**Why it happens:** In v4, each `rounded-{size}` utility maps to a separate `--radius-{size}` variable. There is no single `--radius` that cascades.

**How to avoid:** Override all radius sizes explicitly in `@theme`:
```css
@theme {
  --radius-sm:  0px;
  --radius-md:  0px;
  --radius-lg:  0px;
  --radius-xl:  0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
}
```
Also verify with DevTools that `rounded-lg` computes to `0px`.

### Pitfall 5: Font Preload crossorigin Attribute

**What goes wrong:** Font preload link without `crossorigin="anonymous"` attribute is treated as a cross-origin resource fetch and the preload is wasted (browser fetches the font twice).

**Why it happens:** Fonts are always fetched with CORS mode regardless of origin. Preload links must declare the same CORS mode.

**How to avoid:** Always include `crossorigin="anonymous"` on `<link rel="preload" as="font">` tags.

### Pitfall 6: @import Order in global.css

**What goes wrong:** Placing `@import '@fontsource/...'` after `@import "tailwindcss"` may cause style ordering issues where Tailwind's base reset overrides font declarations.

**Why it happens:** CSS cascade is order-dependent. Tailwind's base layer includes font-family resets.

**How to avoid:** Put `@import '@fontsource/...'` statements **before** `@import "tailwindcss"`, then declare `@theme` after.

---

## Code Examples

### Complete global.css
```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/theme, https://tailwindcss.com/docs/dark-mode */

/* Font @font-face declarations — BEFORE tailwindcss import */
@import '@fontsource/space-grotesk/700.css';
/* NOTE: Space Grotesk max weight is 700 — 900 does not exist */
@import '@fontsource/work-sans/500.css';

@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Brand palette */
  --color-electric:       #0055ff;
  --color-electric-light: #b6c4ff;
  --color-surface:        #131313;
  --color-on-surface:     #e5e2e1;
  --color-surface-low:    #1a1a1a;
  --color-surface-high:   #353534;

  /* Font families */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Work Sans', system-ui, sans-serif;

  /* Zero Roundedness — override all radius scales */
  --radius-sm:  0px;
  --radius-md:  0px;
  --radius-lg:  0px;
  --radius-xl:  0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
}

/* Component tokens — not generating utilities; referenced as CSS vars */
:root {
  --nav-blur:     20px;
  --nav-bg:       rgba(19, 19, 19, 0.85);
  --glow-blur:    30px;
  --glow-opacity: 0.08;
}

/* Grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url('/assets/grain.webp');
  background-repeat: repeat;
  background-size: 200px 200px;
  mix-blend-mode: overlay;
  opacity: 0.05;
}
```

### astro.config.mjs
```javascript
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### BaseLayout.astro
```astro
---
// Source: https://fontsource.org/docs/getting-started/preload
import '../styles/global.css';

// Vite ?url import gives the hashed production URL for preloads
import spaceGroteskW700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url';
import workSansW500 from '@fontsource/work-sans/files/work-sans-latin-500-normal.woff2?url';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const {
  title = 'JUANA HOUSE | URBAN NOMAD EDITORIAL',
  description = 'Specialty coffee. Urban Nomad. San Juan, Argentina.',
  ogImage = '/og-default.jpg',
} = Astro.props;
---
<html class="dark" lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Font preloads — must precede stylesheet for maximum benefit -->
    <link rel="preload" as="font" type="font/woff2"
      href={spaceGroteskW700} crossorigin="anonymous" />
    <link rel="preload" as="font" type="font/woff2"
      href={workSansW500} crossorigin="anonymous" />
    <!-- SEO / OG baseline -->
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:type" content="website" />
  </head>
  <body class="bg-surface text-on-surface font-body">
    <slot />
  </body>
</html>
```

### scripts/gen-grain.mjs
```javascript
// Source: https://sharp.pixelplumbing.com/api-constructor
// Run: node scripts/gen-grain.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../public/assets');
const OUTPUT = join(OUTPUT_DIR, 'grain.webp');

mkdirSync(OUTPUT_DIR, { recursive: true });

await sharp({
  create: {
    width: 200,
    height: 200,
    channels: 1,
    noise: {
      type: 'gaussian',
      mean: 128,
      sigma: 30,
    },
  },
})
  .webp({ quality: 50 })
  .toFile(OUTPUT);

console.log(`grain.webp written to ${OUTPUT}`);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js with `theme.extend` | `@theme {}` in CSS | Tailwind v4 (Jan 2025) | No JS config file; tokens live in CSS |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Tailwind v4 / Astro 5.2 | The official integration installs v3; manual Vite plugin is the v4 path |
| `darkMode: 'class'` in tailwind.config.js | `@custom-variant dark (&:where(.dark, .dark *))` in CSS | Tailwind v4 | CSS-only variant declaration; no JS config |
| `@import 'tailwindcss/base'` + `components` + `utilities` | `@import "tailwindcss"` | Tailwind v4 | Single import replaces three-part import |
| Manual `public/fonts/` with @font-face in CSS | `@fontsource` npm packages | ~2021, mainstream 2023 | Version-managed, tree-shaken, no manual file management |

**Deprecated/outdated patterns from reference HTML (juanaV1.html):**
- Google Fonts CDN link: must be replaced with @fontsource
- SVG feTurbulence grain: must be replaced with WebP tile (prohibited by SETUP-03)
- Tailwind CDN script: must be replaced with `@tailwindcss/vite` + npm install
- Inline `tailwind.config` in `<script>`: replaced by `@theme` in CSS

---

## Open Questions

1. **Component-level tokens placement**
   - What we know: D-06 includes `--nav-blur`, `--nav-bg`, `--glow-blur`, `--glow-opacity` in the `@theme` block
   - What's unclear: These are not Tailwind utility namespaces (no `--color-*`, `--font-*` prefix). If placed inside `@theme`, Tailwind may ignore them or generate nonsensical utilities. They should be in `:root {}` not `@theme {}`.
   - Recommendation: Put component-level tokens in `:root {}` (generates CSS vars, no utilities). Only place tokens that map to Tailwind namespaces (`--color-*`, `--font-*`, `--radius-*`, etc.) inside `@theme {}`.

2. **grain.webp asset location: src/assets/ vs public/assets/**
   - What we know: D-03 says "saved to `src/assets/grain.webp`". Pitfall 2 identifies that CSS string references to `src/assets/` files break in build.
   - What's unclear: Whether a Vite config to expose the file at `/assets/grain.webp` is preferable, or simply using `public/`.
   - Recommendation: Planner should resolve this as `public/assets/grain.webp` — no Vite config needed, works reliably with CSS string references.

3. **Space Grotesk weight 900 gap**
   - What we know: Space Grotesk max weight is 700. D-06 requested weight 900.
   - What's unclear: Does the design intent require a heavier-than-700 weight, or was 900 an assumption?
   - Recommendation: Planner should use 700 as the heaviest weight. The reference HTML uses `font-black` (900) via Tailwind but that's a CSS `font-weight` value — @fontsource will serve the 700 file as the closest match when `font-weight: 900` is specified in CSS (font-weight matching algorithm). So requesting 900 in CSS still works; only the import (`@import '/900.css'`) fails. The plan should import 700 but the CSS `font-weight` calls can still use 700/800/900 (browser will use 700 as the closest available).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | Yes | v18.20.8 | — |
| npm | All | Yes | 10.8.2 | — |
| sharp | gen-grain.mjs script | Likely (Astro transitive dep) | 0.34.5 (latest on npm) | Install explicitly with `npm install --save-dev sharp` |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None — Node 18 meets Astro 5's minimum (Node 18.17.1+).

**Note on sharp:** sharp may already be present as an Astro transitive dependency (`@astrojs/image` or internal Astro image processing). The plan should include `npm install --save-dev sharp` as an explicit step to avoid relying on transitive availability.

---

## Sources

### Primary (HIGH confidence)
- https://tailwindcss.com/docs/theme — `@theme` syntax, token namespaces, utility generation
- https://tailwindcss.com/docs/dark-mode — `@custom-variant dark` syntax verified
- https://tailwindcss.com/docs/border-radius — `--radius-*` namespace structure in v4
- https://tailwindcss.com/docs/installation/framework-guides/astro — Official Astro + Tailwind v4 setup
- https://fontsource.org/fonts/space-grotesk — Weight range confirmed (300–700 only, no 900)
- https://fontsource.org/fonts/work-sans/install — Weight 500 confirmed available
- https://fontsource.org/docs/getting-started/preload — Preload link syntax + `?url` Vite import pattern
- https://sharp.pixelplumbing.com/api-constructor — `create: { noise: { type: 'gaussian' } }` capability confirmed

### Secondary (MEDIUM confidence)
- https://docs.astro.build/en/guides/fonts/ — Astro 5 font handling, `_astro/fonts` output directory, experimental fonts API
- npm registry: astro@5 latest (5.18.1), @tailwindcss/vite (4.2.2), @fontsource packages versions confirmed 2026-03-25

### Tertiary (LOW confidence)
- https://brazy.one/blog/how-to-manage-and-preload-local-fonts-with-tailwind-in-astro/ — Font preload pattern (v3 context; principles apply but syntax differs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed via npm registry on 2026-03-25
- Architecture patterns: HIGH — `@theme`, `@custom-variant`, `@fontsource` import syntax all verified against official docs
- Pitfalls: HIGH — Space Grotesk weight 900 confirmed absent via fontsource.org; `src/assets/` vs `public/` distinction verified via Astro docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack; Astro 5.x and Tailwind v4.x are both in active minor release cycles — re-verify versions before implementation if delayed)
