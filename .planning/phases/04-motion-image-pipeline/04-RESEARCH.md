# Phase 4: Motion & Image Pipeline - Research

**Researched:** 2026-03-26
**Domain:** GSAP ScrollTrigger animations + Astro Image component WebP pipeline
**Confidence:** HIGH

---

## Summary

Phase 4 operates as a pure enhancement layer over existing DOM structure from Phase 3. No new sections are built — only two behaviors are added: (1) scroll-reveal animations on HistoriaSection and UbicacionesSection via GSAP ScrollTrigger, and (2) replacement of placeholder `<div>` elements with real local WebP images via Astro's `<Image />` component.

The critical constraint is that **no real photography exists yet** — the current codebase has placeholder `<div class="bg-surface-high ...">` elements where images should go, and the reference HTML (juanaV1.html) uses `lh3.googleusercontent.com` Google AI-generated images that cannot be reused in production. PERF-02 (zero external image requests) is only achievable once real photos are provided by the client. The plan must handle this as a hard dependency by defining placeholder image handling that still produces WebP output, or by structuring the image task to be ready to drop in photos.

GSAP 3.14.2 is the current stable version. ScrollTrigger is a bundled plugin in the `gsap` package — no separate install. In Astro static sites with no view transitions, GSAP works cleanly inside `<script>` tags using standard ES module imports. `gsap.matchMedia()` is the correct GSAP-native mechanism for prefers-reduced-motion — it automatically reverts all animations created inside a reduced-motion branch, which is cleaner than checking the media query manually.

Astro's `<Image />` component outputs WebP by default (confirmed in official docs). It requires local images to be in `src/assets/` for automatic optimization. `sharp` is already installed as a devDependency, which is the required image processing service for Astro's optimizer. This phase needs to create `src/assets/` with placeholder or real images before `<Image />` can be used.

**Primary recommendation:** Install `gsap@3.14.2`, write a single `scroll-animations.ts` script using `gsap.matchMedia()` with two branches (no-preference = animated, reduce = instant), and replace the two image placeholder divs with `<Image />` components pointing to files in `src/assets/images/`. If real photos are not available, use brand-colored placeholder WebP files generated with sharp to satisfy PERF-01 without blocking the build.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOTN-01 | Historia and Ubicaciones sections have scroll reveals via GSAP ScrollTrigger on viewport entry | GSAP 3.14.2 + ScrollTrigger plugin — confirmed pattern: import gsap + ScrollTrigger, register plugin, use `gsap.from()` with scrollTrigger config on section elements |
| MOTN-02 | All GSAP animations pause under `prefers-reduced-motion: reduce` via `gsap.matchMedia()` | `gsap.matchMedia().add()` with two branches (no-preference + reduce) — confirmed in official GSAP docs; cleanup is automatic |
| PERF-01 | All content images are WebP with lazy loading using Astro `<Image />` from `src/assets/` | Astro Image component outputs WebP by default; sharp is already installed as devDependency; images must be in src/assets/ for optimization |
| PERF-02 | Zero requests to lh3.googleusercontent.com or Google Fonts CDN in production | Current code has placeholder divs (no external requests); the reference HTML had google image URLs; fonts are already self-hosted from Phase 1; replacing divs with local Image components satisfies this requirement |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | 3.14.2 | Animation engine + ScrollTrigger plugin | Industry standard for professional web animation; ScrollTrigger is bundled in the package, no separate install; tree-shake-safe with registerPlugin |
| astro:assets Image | built-in (Astro 5.18.1) | Optimized image component with WebP output | Built into Astro — outputs WebP by default, auto-infers dimensions from local files, prevents CLS, adds lazy loading |
| sharp | 0.34.5 (already installed) | Image processing service for Astro optimizer | Required peer for Astro image optimization in static builds; already in devDependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gsap/ScrollTrigger | bundled in gsap | Viewport-based scroll animation triggers | Included in gsap package — no separate install; register with `gsap.registerPlugin(ScrollTrigger)` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gsap.matchMedia() | Manual window.matchMedia() check | gsap.matchMedia() auto-reverts animations on cleanup; manual check is more fragile and doesn't integrate with GSAP's internal state management |
| Astro Image (WebP default) | explicit format="webp" prop | Not needed — WebP is default output; use format prop only to force a different format |
| src/assets/ for images | public/assets/ for images | public/ images are not processed by Astro optimizer — no WebP conversion, no lazy loading, no dimension inference; use src/assets/ for all images that need optimization |

**Installation:**
```bash
npm install gsap@3.14.2
```

Note: sharp is already installed. No additional packages required for Astro Image.

**Version verification:** `npm view gsap version` confirmed 3.14.2 on 2026-03-26.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── assets/
│   └── images/           # Local WebP source images (jpg/png/webp — Astro converts)
│       ├── historia-truck.jpg     # Juana truck photo for HistoriaSection
│       ├── ubicacion-iron-man.jpg # Iron Man / San Juan location photo
│       └── ubicacion-cara-sur.jpg # Cara Sur / Barreal location photo
├── components/
│   ├── HistoriaSection.astro      # Replace placeholder div with <Image />
│   └── UbicacionesSection.astro   # Replace placeholder divs with <Image />
└── scripts/
    └── scroll-animations.ts       # GSAP ScrollTrigger initialization
```

### Pattern 1: GSAP ScrollTrigger in Astro Static Script

**What:** Import gsap and ScrollTrigger inside an Astro `<script>` tag using ES module syntax. Astro bundles this via Vite — works identically to any other script import.
**When to use:** Any .astro component that needs client-side GSAP animation.

```typescript
// src/scripts/scroll-animations.ts
// Source: https://gsap.com/docs/v3/Installation/ + https://astro-tips.dev/tips/how-to-add-gsap/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add(
  {
    noPreference: '(prefers-reduced-motion: no-preference)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { reduceMotion } = context.conditions as { reduceMotion: boolean; noPreference: boolean };

    if (reduceMotion) {
      // Instantly visible — no animation
      gsap.set('#historia, #ubicaciones', { opacity: 1, y: 0 });
    } else {
      // Historia section reveal
      gsap.from('#historia', {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#historia',
          start: 'top 85%',
        },
      });

      // Ubicaciones section reveal
      gsap.from('#ubicaciones', {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#ubicaciones',
          start: 'top 85%',
        },
      });
    }
  }
);
```

### Pattern 2: Astro Image Component for WebP Output

**What:** Replace placeholder `<div class="bg-surface-high ...">` elements with `<Image />` from `astro:assets`. Local images in `src/assets/images/` are automatically converted to WebP, dimension-inferred, and lazy-loaded.
**When to use:** Any content image that was previously a placeholder div.

```astro
---
// Source: https://docs.astro.build/en/reference/modules/astro-assets/
import { Image } from 'astro:assets';
import historiaTruck from '../assets/images/historia-truck.jpg';
---

<!-- Replace the placeholder div in HistoriaSection.astro -->
<Image
  src={historiaTruck}
  alt="The Juana Truck parked in San Juan — TRIBU NOMADE"
  class="w-full aspect-video object-cover"
  loading="lazy"
/>
```

For Ubicaciones cards, the `<Image />` must also carry the existing Tailwind grayscale classes:

```astro
<Image
  src={ironManPhoto}
  alt="Iron Man location — Del Bono 383 Sur, San Juan"
  class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
  loading="lazy"
/>
```

### Pattern 3: Script Loading in index.astro

**What:** Import the scroll-animations script in index.astro (or directly in the relevant components) using `<script>`. Astro deduplicates and bundles scripts automatically.

```astro
<!-- index.astro — at bottom of component or in BaseLayout -->
<script>
  import '../scripts/scroll-animations.ts';
</script>
```

Alternatively, import from the component that owns the animation:

```astro
<!-- HistoriaSection.astro -->
<script>
  import '../scripts/scroll-animations.ts';
</script>
```

NOTE: If imported from multiple components, Astro deduplicates — the script runs once. Prefer a single import location (index.astro) for clarity.

### Pattern 4: Placeholder Image for Missing Photography

**What:** When real photos are not available, generate a solid-color WebP placeholder in `src/assets/images/` using sharp, so the Astro Image pipeline works and the build succeeds without external URLs.
**When to use:** Only if real photography is not provided before Phase 4 executes.

```javascript
// scripts/gen-placeholders.js — run once with `node scripts/gen-placeholders.js`
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('src/assets/images', { recursive: true });

const images = [
  { name: 'historia-truck.jpg', width: 1200, height: 675, color: [53, 53, 52] },
  { name: 'ubicacion-iron-man.jpg', width: 800, height: 600, color: [53, 53, 52] },
  { name: 'ubicacion-cara-sur.jpg', width: 800, height: 600, color: [53, 53, 52] },
];

for (const img of images) {
  await sharp({
    create: {
      width: img.width,
      height: img.height,
      channels: 3,
      background: { r: img.color[0], g: img.color[1], b: img.color[2] },
    },
  })
    .jpeg()
    .toFile(`src/assets/images/${img.name}`);
  console.log(`Created: src/assets/images/${img.name}`);
}
```

### Anti-Patterns to Avoid

- **Importing GSAP outside of `<script>` in .astro files:** The component script (frontmatter) runs server-side. GSAP requires the DOM — always import inside `<script>` tags.
- **Putting images in `public/assets/` for content images:** Files in `public/` bypass Astro's image optimizer — no WebP conversion, no lazy loading. Only use `public/` for assets referenced by CSS strings (like `grain.webp`) or assets that must not be content-hashed.
- **Using `<img>` tags directly instead of `<Image />`:** Won't get WebP conversion, won't get automatic width/height, will cause CLS.
- **Not registering ScrollTrigger plugin:** Build tools tree-shake unregistered plugins — `gsap.registerPlugin(ScrollTrigger)` is mandatory before any ScrollTrigger usage.
- **Calling `gsap.from()` outside matchMedia:** Animations created outside `gsap.matchMedia()` don't auto-revert, making MOTN-02 partial — always wrap in matchMedia branches.
- **Animating section elements that already have CSS transitions:** HistoriaSection has `overflow-hidden` on the outer section; Ubicaciones cards have `transition-all duration-700` on the grayscale images. The GSAP reveal animates the section containers, not the inner elements — no conflict expected, but verify during execution.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-based viewport detection | Custom IntersectionObserver + CSS class toggle | GSAP ScrollTrigger | ScrollTrigger handles timing, refresh on resize, pinning offsets, kill/cleanup — custom IO misses all of these |
| prefers-reduced-motion check | `window.matchMedia('(prefers-reduced-motion)').addEventListener(...)` | `gsap.matchMedia()` | gsap.matchMedia() integrates cleanup with animation lifecycle; manual listeners require manual cleanup and don't auto-revert tweens |
| Image format conversion at runtime | Client-side Canvas API toBlob('image/webp') | Astro `<Image />` build-time conversion | Build-time conversion is free performance — no JS shipped to client, no runtime overhead |
| Image lazy loading | Intersection Observer + src swap | `loading="lazy"` prop on `<Image />` | Native browser lazy loading is better supported and requires zero JS |
| Image dimension management | Hard-coded width/height props | Import-based auto-inference from src/assets/ | Astro reads image dimensions at build time — no risk of CLS from wrong values |

**Key insight:** ScrollTrigger and Astro Image are both purpose-built for exactly what this phase needs. Neither has meaningful alternatives at their quality level for this use case.

---

## Common Pitfalls

### Pitfall 1: Tree-Shaking Drops ScrollTrigger
**What goes wrong:** Build succeeds, but ScrollTrigger animations do nothing in production. No errors in console.
**Why it happens:** Vite/Rollup tree-shakes `ScrollTrigger` if it detects the export is never called, which happens when `gsap.registerPlugin()` is not called before the first ScrollTrigger usage.
**How to avoid:** Always call `gsap.registerPlugin(ScrollTrigger)` immediately after importing ScrollTrigger, before any tween creation.
**Warning signs:** Animations work in dev (`npm run dev`) but silently fail after `npm run build` + `npm run preview`.

### Pitfall 2: Images in public/ Instead of src/
**What goes wrong:** Images load, but DevTools Network shows them as `jpeg` or `png` type, not `webp`. PERF-01 fails verification.
**Why it happens:** Files in `public/` are copied verbatim to the output — no processing by Astro's image optimizer. Only files imported from `src/assets/` go through the optimizer.
**How to avoid:** All content images must be in `src/assets/images/` and imported in the component frontmatter. The grain.webp and smiley-logo.svg stay in `public/assets/` (CSS url() references cannot use src/ imports).
**Warning signs:** Network panel shows original format instead of webp; no `/_astro/` prefix in the image URL.

### Pitfall 3: GSAP Script Running Before DOM Is Ready
**What goes wrong:** `gsap.from('#historia', ...)` fires but the element doesn't exist yet — ScrollTrigger registers against nothing. Animations never play.
**Why it happens:** In some Astro script loading configurations, inline scripts can run before the full DOM is parsed.
**How to avoid:** Wrap initialization in `document.addEventListener('DOMContentLoaded', () => { ... })`, OR rely on Astro's script hoisting (scripts in .astro files are deferred by default). Verify element IDs exist before using them as ScrollTrigger triggers.
**Warning signs:** No animation on first load; animation works after hard refresh or after scrolling once.

### Pitfall 4: Grayscale CSS Conflict with GSAP Opacity Animation
**What goes wrong:** Ubicaciones cards flicker or show incorrect grayscale state during scroll reveal animation.
**Why it happens:** GSAP animates `opacity` and `y` on the `#ubicaciones` section container, while Tailwind manages `grayscale`/`grayscale-0` via CSS transitions on inner `<Image />` elements. These are on different DOM levels and should not conflict, but if GSAP targets the card elements directly (not just the section), CSS transitions may fight GSAP's inline styles.
**How to avoid:** GSAP should target only the section container (`#historia`, `#ubicaciones`) — not the inner card divs or image elements. The existing grayscale hover behavior is CSS-only and must remain untouched.
**Warning signs:** Hover color reveal stops working after page load; images appear with partial grayscale during scroll.

### Pitfall 5: Missing Photography Blocks Build
**What goes wrong:** `<Image src={import('../assets/images/historia-truck.jpg')} />` throws a build error because the file doesn't exist.
**Why it happens:** Astro's image optimizer requires the source file to exist at build time for local imports.
**How to avoid:** Either use the placeholder generation script to create valid placeholder JPEGs in `src/assets/images/` before running any Image component, or keep placeholder divs until real photos arrive and do a two-step: (a) GSAP animations task, (b) image replacement task that blocks on client photo delivery.
**Warning signs:** `build` errors mentioning missing module path or image file not found.

---

## Code Examples

### Complete scroll-animations.ts with matchMedia

```typescript
// src/scripts/scroll-animations.ts
// Source: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ + https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add(
  {
    noPreference: '(prefers-reduced-motion: no-preference)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { reduceMotion } = context.conditions as {
      reduceMotion: boolean;
      noPreference: boolean;
    };

    if (reduceMotion) {
      // Instant state — no motion
      gsap.set('#historia', { opacity: 1, y: 0 });
      gsap.set('#ubicaciones', { opacity: 1, y: 0 });
      return;
    }

    // Historia scroll reveal
    gsap.from('#historia', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#historia',
        start: 'top 85%',
        once: true,
      },
    });

    // Ubicaciones scroll reveal
    gsap.from('#ubicaciones', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#ubicaciones',
        start: 'top 85%',
        once: true,
      },
    });
  }
);
```

### HistoriaSection.astro with Image component

```astro
---
// Source: https://docs.astro.build/en/reference/modules/astro-assets/
import { Image } from 'astro:assets';
import historiaTruck from '../assets/images/historia-truck.jpg';
---
<section id="historia" class="bg-surface-low py-32 overflow-hidden">
  <div class="grid grid-cols-1 md:grid-cols-12 items-center">
    <div class="md:col-span-7 relative">
      <!-- Replace placeholder div with Image component -->
      <Image
        src={historiaTruck}
        alt="The Juana Truck — TRIBU NOMADE, SIEMPRE EN CASA"
        class="w-full aspect-video object-cover"
        loading="lazy"
      />
      <!-- ...floating labels remain unchanged... -->
    </div>
    <!-- ...copy column remains unchanged... -->
  </div>
</section>

<script>
  import '../scripts/scroll-animations.ts';
</script>
```

### UbicacionesSection.astro image replacement pattern

```astro
---
import { Image } from 'astro:assets';
import ironManPhoto from '../assets/images/ubicacion-iron-man.jpg';
import caraSurPhoto from '../assets/images/ubicacion-cara-sur.jpg';
---
<!-- Replace placeholder div — keep all existing grayscale classes -->
<Image
  src={ironManPhoto}
  alt="Iron Man — Del Bono 383 Sur, San Juan"
  class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
  loading="lazy"
/>
```

Note: The `<Image />` must be `position: absolute` with `inset-0` to fill the parent `h-[600px]` card — the parent card div already has `relative overflow-hidden`. The original placeholder div was `w-full h-full` filling the card; the Image component must mirror this with absolute positioning since it's inside a fixed-height container.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual IntersectionObserver for scroll animations | GSAP ScrollTrigger | GSAP 3.x (stable) | ScrollTrigger handles refresh, resizing, kill/cleanup automatically |
| `window.matchMedia` listener for prefers-reduced-motion | `gsap.matchMedia()` | GSAP 3.9.0 | Automatic revert of all animations in scope when condition changes |
| `<img>` tags with manual width/height | `<Image />` from astro:assets | Astro 3.0 | Build-time WebP conversion, CLS prevention, native lazy loading |
| lh3.googleusercontent.com placeholders (reference HTML) | Local src/assets/ images via `<Image />` | Phase 4 | Zero external image requests, WebP output, offline builds |

**Deprecated/outdated:**
- `@astrojs/image` (old Astro image integration): Replaced by `astro:assets` built-in module in Astro 3.0. Do not install this package.
- GSAP Club plugins via CDN: Use npm install for all GSAP in this project — consistent with the rest of the build pipeline.

---

## Open Questions

1. **Real photography availability**
   - What we know: All current image slots use `<div class="bg-surface-high">` placeholders. The STATE.md blocker explicitly states "fotografía real necesaria antes de Phase 4." The references folder contains PNG screenshots of social/design context but no production-ready photography.
   - What's unclear: Whether the client has provided or will provide real photos before Phase 4 executes.
   - Recommendation: Plan as two tasks — Task 1 = GSAP animations (no dependency on photos), Task 2 = Image pipeline (requires placeholder JPEGs at minimum to unblock build; real photos swap in later). This way MOTN-01/02 can be verified independently of PERF-01/02.

2. **Ubicaciones Image layout mode — absolute vs. natural flow**
   - What we know: Current card markup is `<div class="relative h-[600px] group overflow-hidden">` with a `w-full h-full` placeholder div inside.
   - What's unclear: Astro's `<Image />` renders as an `<img>` tag with auto width/height inferred from the source file. Inside a fixed-height card, this needs `position: absolute; inset: 0; object-fit: cover` or a wrapper `<div>` to fill the container correctly without changing the card's height behavior.
   - Recommendation: Use the absolute positioning pattern documented in Code Examples above. Verify visually during execution.

3. **GSAP animation integration with existing Three.js**
   - What we know: Three.js hero uses its own IntersectionObserver (`hero-canvas.ts`). GSAP ScrollTrigger operates independently on different DOM elements.
   - What's unclear: Whether there are scroll performance conflicts between GSAP's scroll listener and the Three.js animation loop at the seam between the hero and the first scroll section.
   - Recommendation: LOW risk — GSAP ScrollTrigger and Three.js rAF loops operate independently. Monitor for jank at the hero/historia boundary during visual checkpoint.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | ✓ | v18.20.8 | — |
| sharp | Astro image optimizer | ✓ | 0.34.5 (in node_modules) | — |
| gsap | MOTN-01, MOTN-02 | ✗ (not yet installed) | — | Must install: `npm install gsap@3.14.2` |
| Real photography (JPEG/PNG) | PERF-01, PERF-02 | ✗ | — | sharp-generated placeholder JPEGs in src/assets/images/ |

**Missing dependencies with no fallback:**
- gsap package must be installed before any GSAP work begins.

**Missing dependencies with fallback:**
- Real photography: plan must generate placeholder images via sharp to unblock Astro build while awaiting client-provided photos.

---

## Project Constraints (from CLAUDE.md)

No CLAUDE.md found in this project. Constraints are derived from accumulated decisions in STATE.md:

- **Astro 5 + Tailwind v4**: Framework is locked. GSAP must be integrated as a plain npm package imported in `<script>` tags, not as a React component or Astro integration.
- **Static output (`output: "static"`)**: No server-side image optimization at request time — all image processing must happen at build time. `<Image />` in static mode works correctly (processes at build).
- **`public/assets/` for CSS-referenced assets**: `grain.webp` and `smiley-logo.svg` stay in `public/assets/`. Content images go in `src/assets/images/`.
- **No slow transitions on interactive elements (DESIGN.md)**: The GSAP scroll reveal applies to section entry (single-fire, `once: true`) — not to hover/click interactions. This does not conflict with the "no slow transitions" rule which targets state-change interactions.
- **Existing grayscale hover on Ubicaciones cards is CSS-only**: Must not be replaced or overridden by GSAP. GSAP targets the `#ubicaciones` section wrapper only.
- **`IntersectionObserver` used for Three.js init**: GSAP ScrollTrigger is additive — does not interfere with the existing IO in `hero-canvas.ts`.
- **No external font requests**: Already satisfied from Phase 1. PERF-02 fonts requirement is a verify-only task.

---

## Validation Architecture

> nyquist_validation is false in .planning/config.json — this section is skipped.

---

## Sources

### Primary (HIGH confidence)
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — ScrollTrigger registration, tween syntax, start/end positions
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ — matchMedia API, prefers-reduced-motion pattern, auto-revert behavior
- https://docs.astro.build/en/reference/modules/astro-assets/ — Image component props, WebP default output, format prop, loading prop
- https://docs.astro.build/en/guides/images/ — src/assets/ requirement, static build behavior, local vs remote images
- `npm view gsap version` — confirmed 3.14.2 as latest stable on 2026-03-26
- Astro 5.18.1 node_modules/astro/package.json — confirmed installed version

### Secondary (MEDIUM confidence)
- https://astro-tips.dev/tips/how-to-add-gsap/ — confirmed `import { gsap } from 'gsap'` pattern works inside Astro `<script>` tags
- STATE.md accumulated decisions — confirmed src/assets/ vs public/assets/ split rule, confirmed placeholder div locations in HistoriaSection and UbicacionesSection

### Tertiary (LOW confidence)
- None — all critical claims verified against official sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GSAP 3.14.2 version confirmed via npm registry; Astro Image WebP default confirmed in official reference docs; sharp already installed
- Architecture: HIGH — patterns derived directly from official GSAP and Astro documentation; component structure confirmed by reading actual source files
- Pitfalls: HIGH — tree-shaking pitfall confirmed in GSAP official docs; src/ vs public/ split confirmed in Astro image guide; DOM timing pitfall is a known Astro pattern

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (Astro and GSAP are both stable; WebP default behavior unlikely to change)
