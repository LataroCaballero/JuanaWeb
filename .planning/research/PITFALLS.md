# Pitfalls Research

**Domain:** Performance-critical brand landing page — Astro + Three.js + Tailwind v4 + Vercel static deploy
**Researched:** 2026-03-25
**Confidence:** HIGH (official docs verified for all critical pitfalls, MEDIUM for implementation patterns)

---

## Critical Pitfalls

Mistakes that cause rewrites, failed Lighthouse audits, broken deployments, or broken brand identity.

---

### Pitfall 1: Three.js Blocking LCP and the Hero Being the Worst LCP Element

**What goes wrong:**
The Three.js canvas renders in the document's critical path. The browser waits for the entire Three.js bundle (~600KB min, ~1.2MB unminified) to download, parse, and execute before the first frame can paint. On mobile 3G, the hero canvas is blank for 4–6 seconds. Worse: if the `<canvas>` is the largest element above the fold, Chrome designates it as the LCP element — and a WebGL canvas is always LCP = 0 until Three.js finishes rendering, which means LCP is measured against the time JS fully completes, not when the user sees anything.

**Why it happens:**
Putting Three.js in a component without a hydration directive, or using `<script src="three.min.js">` inline, puts it in the critical render path. Many tutorials show this as the simple approach.

**How to avoid:**
1. The Three.js island MUST use `client:only="vanilla"` (not `client:visible`) for a hero section. The reason: `client:visible` waits for the element to enter the viewport, which for a hero section fires immediately — but it still defers the JS load to after the initial paint, which is exactly what you want. However, if the canvas container has zero height, `client:visible` fires on mount (see Pitfall 12). Use `client:only` for guaranteed post-paint loading.
2. Place a real, static LCP candidate above the fold: the `<h1>` headline or a static logo `<img>`. This gives Chrome a non-JS element to measure LCP against.
3. Give the canvas wrapper a static `aspect-ratio` before JS runs so layout space is reserved:
   ```astro
   <div style="aspect-ratio: 1 / 1; background: #131313;" id="hero-canvas-wrap">
     <ThreeHero client:only="vanilla" />
   </div>
   ```
4. Cap `devicePixelRatio` to 2. On iPhone 15 Pro (3× DPR), uncapped Three.js renders 9× the pixels of a 1× display:
   ```js
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
   ```

**Warning signs:**
Run Lighthouse. If the LCP element shown is `<canvas>`, this pitfall is active. In Chrome DevTools Performance tab, Three.js parse/compile should appear only after "First Meaningful Paint."

**Phase to address:** Phase 1 (Astro project setup) — establish island architecture and placeholder strategy before building any Three.js component.

---

### Pitfall 2: Tailwind v4 Setup With the Wrong Adapter

**What goes wrong:**
The reference HTML (`juanaV1.html`) uses Tailwind CDN with an inline JavaScript config. When migrating to Astro, installing `@astrojs/tailwind` pulls in Tailwind v3, not v4. The CDN config syntax (JavaScript object with `theme.extend`) is completely ignored in v4's CSS-first approach. All custom design tokens — Electric Blue `#0055ff`, `#131313` background, `0px` border-radius, Space Grotesk, Work Sans — are silently absent. The page renders with Tailwind defaults. No build error is thrown.

**Why it happens:**
`@astrojs/tailwind` is the historically documented integration and still appears in many tutorials. It is deprecated for Tailwind v4. As of Astro 5.2, the correct approach is the `@tailwindcss/vite` Vite plugin.

**How to avoid:**
1. Install explicitly (never rely on `astro add tailwind` resolving the right version):
   ```bash
   npm install -D tailwindcss @tailwindcss/vite
   ```
2. Register the Vite plugin in `astro.config.mjs`:
   ```js
   import tailwindcss from "@tailwindcss/vite";
   export default defineConfig({
     vite: { plugins: [tailwindcss()] },
   });
   ```
3. Create `src/styles/global.css` and translate ALL tokens from the CDN config into `@theme`:
   ```css
   @import "tailwindcss";

   @theme {
     --color-primary: #0055ff;
     --color-primary-light: #b6c4ff;
     --color-surface: #131313;
     --color-on-surface: #e5e2e1;
     --font-display: "Space Grotesk", sans-serif;
     --font-body: "Work Sans", sans-serif;
     --radius: 0px;
     --radius-sm: 0px;
     --radius-md: 0px;
     --radius-lg: 0px;
     --radius-xl: 0px;
     --radius-full: 9999px; /* smiley only */
   }
   ```
4. Do NOT keep a `tailwind.config.js`. In v4, it is ignored unless you explicitly add `@config "./tailwind.config.js"` to your CSS — which defeats the point of migrating.
5. Import `global.css` **once** in the root layout `Layout.astro`, not in individual pages.

**v3→v4 class rename traps specific to this project:**
| v3 class | v4 class |
|---|---|
| `shadow` | `shadow-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (3px default) | `ring-3` |
| `flex-shrink-0` | `shrink-0` |
| `bg-[--var]` | `bg-(--var)` |
| `!flex` | `flex!` |

**Warning signs:**
In DevTools, check the computed `--color-primary` CSS variable. If it reads blank, the `@theme` block is missing or the Vite plugin is not registered.

**Phase to address:** Phase 1 (project setup) — must be done before any styling work begins.

---

### Pitfall 3: Google Fonts Render-Blocking the Hero Text

**What goes wrong:**
The reference HTML loads Space Grotesk and Work Sans from `fonts.googleapis.com` with a plain `<link rel="stylesheet">`. This is a synchronous, render-blocking request to an external domain. The browser must: (1) resolve DNS for `fonts.googleapis.com`, (2) fetch the CSS redirect, (3) resolve DNS for `fonts.gstatic.com`, (4) fetch the actual `.woff2` files — before any text renders. On a cold connection with no DNS cache, this costs 800ms–1.5s of blocked rendering. Since Chrome 86 partitioned the HTTP cache, the Google Fonts CDN is never warm from another site's visit.

**Why it happens:**
Copy-pasting the embed snippet from Google Fonts. It is convenient for prototyping but wrong for performance.

**How to avoid:**
Self-host using `@fontsource`. Only import the weights actually used (Bold 700 and Black 900 for Space Grotesk; Medium 500 for Work Sans body):
```bash
npm install @fontsource-variable/space-grotesk @fontsource/work-sans
```
```js
// In Layout.astro frontmatter or global.css
import "@fontsource-variable/space-grotesk";  // variable font = all weights in one file
import "@fontsource/work-sans/500.css";
```

Preload the headline font (Space Grotesk) in `<head>` to eliminate FOUT on the hero text:
```html
<link rel="preload" href="/fonts/space-grotesk-variable.woff2"
  as="font" type="font/woff2" crossorigin />
```
Note: `crossorigin` attribute is **required** for self-hosted font preloads. Without it, the browser downloads the font twice.

Add `font-display: swap` to guarantee text is visible during load (the fontsource packages include this by default).

**Warning signs:**
Lighthouse "Eliminate render-blocking resources" audit. WebPageTest waterfall — any `fonts.googleapis.com` row appearing before First Contentful Paint.

**Phase to address:** Phase 1 (project setup / base layout) — fix before any component references typography.

---

### Pitfall 4: Production Site Using External AIDA Placeholder Images

**What goes wrong:**
Every image in `juanaV1.html` uses `lh3.googleusercontent.com/aida-public/...` URLs — AI-generated placeholders from Google Stitch. These URLs are not authorized for production use, will rate-limit or break, and trigger CSP warnings on Vercel. The entire visual identity of the landing page — espresso machine hero, coffee truck, location photos, the smiley logo — disappears.

**Why it happens:**
Google Stitch generates prototype images as part of its workflow. They look real but are placeholders.

**How to avoid:**
1. Block any production build until all `lh3.googleusercontent.com` URLs are replaced with local assets. Add a pre-build check or a simple grep in the dev checklist.
2. Store all images in `src/assets/` (not `public/`) — Astro only applies optimization (WebP conversion, sizing) to images imported from `src/`:
   ```
   src/assets/
     hero-bg.jpg
     truck-tribu.jpg
     location-san-juan.jpg
     location-barreal.jpg
     logo-smiley.svg
   ```
3. Use Astro's `<Image>` component for automatic WebP, lazy loading, and intrinsic size declarations:
   ```astro
   <Image src={heroBg} alt="..." width={1920} height={1080}
     format="webp" loading="eager" fetchpriority="high" />
   ```
   Use `loading="eager"` + `fetchpriority="high"` for the hero background (LCP candidate). Default `loading="lazy"` for everything below the fold.
4. Never apply `loading="lazy"` to the LCP image. Lighthouse explicitly flags this.

**Warning signs:**
Any `lh3.googleusercontent.com` network request in DevTools during a production build preview.

**Phase to address:** Phase 2 (content + sections) — must be resolved before any section that uses images is considered "done."

---

## Moderate Pitfalls

---

### Pitfall 5: Grain Overlay Causing CPU Repaint on Every Scroll

**What goes wrong:**
The grain overlay in the reference HTML uses an inline SVG `feTurbulence` filter as `background-image` on a `position: fixed` element. SVG filters (`feTurbulence`, `feGaussianBlur`) are CPU-rendered and do not composite to the GPU automatically. On scroll, the browser must repaint the full-viewport `fixed` element on every frame because the filter output depends on the element's position. On mid-range Android devices (Snapdragon 6xx) this causes 15–20fps scroll jank. The paint cost is identical regardless of the overlay's low opacity (`0.05`).

**Why it happens:**
SVG filter-based grain is the simplest CSS-only implementation and renders beautifully in DevTools preview. The performance penalty only appears on real hardware under scroll load.

**How to avoid:**
Replace the SVG filter with a pre-rendered static WebP grain tile:
```css
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("/textures/grain.webp");
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.05;
  /* Force GPU compositing layer — zero CPU repaint on scroll */
  transform: translateZ(0);
}
```
A 200×200 WebP grain tile is ~3–5KB. Generate it once with any design tool or the `grained.js` library, export as WebP.

If retaining the SVG filter approach, force a GPU layer with `will-change: transform` and `transform: translateZ(0)` — this moves the element to its own compositor layer so scroll repaints don't affect it.

**Warning signs:**
Chrome DevTools → Rendering panel → "Paint flashing." If the grain overlay flashes green on scroll, the repaint is active. Check DevTools Layers panel to confirm the overlay is on an isolated compositing layer.

**Phase to address:** Phase 1 (design system setup) — establish the grain overlay implementation before applying it to all sections.

---

### Pitfall 6: Three.js WebGL Memory Leak on Navigation or Remount

**What goes wrong:**
Three.js holds GPU memory (geometries, materials, textures, render targets) until `dispose()` is explicitly called. The browser's JavaScript garbage collector does not release GPU resources. If Astro View Transitions are enabled and the user navigates away and back, the Three.js island mounts a new `WebGLRenderer` without cleaning up the previous one. Browsers have a hard limit of 8–16 simultaneous WebGL contexts (iOS Safari: 8). Exhausting this limit produces a blank canvas and a `THREE.WebGLRenderer: Context Lost` console error that cannot be recovered without a page reload.

**Why it happens:**
Three.js resource disposal is not documented prominently. GPU memory appears to "release" during development because hot module reload restarts the page. In production navigation it does not.

**How to avoid:**
Wire cleanup to Astro's View Transitions lifecycle event:
```js
// Inside the Three.js island <script>
let renderer, animFrameId, scene;

function initScene(container) {
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  scene = new THREE.Scene();
  // ... build scene ...
}

function cleanup() {
  cancelAnimationFrame(animFrameId);
  scene.traverse((obj) => {
    obj.geometry?.dispose();
    if (Array.isArray(obj.material)) {
      obj.material.forEach((m) => m.dispose());
    } else {
      obj.material?.dispose();
    }
  });
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}

document.addEventListener("astro:before-swap", cleanup, { once: true });
```

If View Transitions are not used, still call `cleanup()` when the page unloads:
```js
window.addEventListener("pagehide", cleanup, { once: true });
```

**Warning signs:**
Open Chrome Task Manager (Shift+Esc). GPU Memory column climbing across page navigations confirms the leak. `renderer.info.memory.geometries` growing across revisits also confirms it.

**Phase to address:** Phase 2 (Three.js hero build) — implement cleanup pattern alongside initial scene setup, not as a follow-up task.

---

### Pitfall 7: Dark Mode Variant Misconfiguration in Tailwind v4

**What goes wrong:**
The reference HTML relies on `<html class="dark">` for the dark design. In Tailwind v3, `darkMode: "class"` in `tailwind.config.js` activates class-based dark mode. In Tailwind v4, there is no `tailwind.config.js` equivalent for this setting. If you migrate without declaring the dark variant in CSS, all `dark:` prefixed classes are either ignored or fall back to the `@media (prefers-color-scheme: dark)` behavior. This means the Electric Blue color scheme fails for users whose OS is in light mode — which is the majority of users.

**Why it happens:**
The v4 upgrade tool does not auto-migrate `darkMode: "class"`. The v4 docs describe the new variant syntax but it is easy to miss when focused on token migration.

**How to avoid:**
Add the custom variant declaration to `global.css` before any `dark:` classes are used:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme { /* tokens */ }
```
Set `class="dark"` statically in the root `<html>` tag since the design is dark-only and should never flip based on OS preference:
```astro
<html lang="es" class="dark">
```

**Warning signs:**
Temporarily remove `class="dark"` from `<html>`. If the page still looks correct (dark surface, Electric Blue), `dark:` classes are being ignored.

**Phase to address:** Phase 1 (project setup) — declare the variant before any component uses `dark:` classes.

---

### Pitfall 8: Vercel Adapter Installing SSR Mode for a Static Site

**What goes wrong:**
Installing `@astrojs/vercel` with default settings enables SSR mode. For a fully static landing page, this deploys serverless functions (one per route or one per page) to Vercel's edge network instead of static HTML files. On the free tier, Vercel limits deployments to 12 serverless functions. A site with many pages hits this limit and fails to deploy with `FUNCTION_PAYLOAD_TOO_LARGE`. Even when it deploys, pages have cold-start latency instead of instant CDN delivery.

**Why it happens:**
Developers install `@astrojs/vercel` for Vercel Image Optimization or Analytics, not realizing the default `output` mode flips to `server`.

**How to avoid:**
For a fully static site, **no adapter is needed**. Vercel auto-detects Astro and serves `dist/` as static files:
```js
// astro.config.mjs — static site, no adapter
export default defineConfig({
  output: "static", // default, can be omitted
});
```
Only add `@astrojs/vercel` if you specifically need Vercel Image Optimization. If you do, explicitly set static mode:
```js
import vercel from "@astrojs/vercel";
export default defineConfig({
  output: "static",
  adapter: vercel({ imageService: true }),
});
```

**Warning signs:**
Vercel dashboard shows "Functions" in the deployment summary for what should be a static site. `dist/` folder contains a `.vercel/output/functions/` subdirectory after build.

**Phase to address:** Phase 1 (project setup) — verify output mode before first deploy.

---

### Pitfall 9: Canvas Producing Layout Shift (CLS) From Missing Intrinsic Dimensions

**What goes wrong:**
The Three.js `<canvas>` element has no width/height until JavaScript runs `renderer.setSize()`. The browser sees a 0×0 element, then it jumps to full size when the island hydrates. If hydration occurs 1–3 seconds after paint (expected with `client:only`), this produces a late CLS event. Google's CLS score weights late shifts more heavily than early ones.

**Why it happens:**
WebGL canvases require JavaScript to compute their target dimensions from the container. There is no declarative way to give a canvas intrinsic dimensions in pure HTML.

**How to avoid:**
Wrap the canvas in a container with a fixed `aspect-ratio` that reserves layout space before JS runs:
```astro
<div
  class="relative w-full bg-surface"
  style="aspect-ratio: 1 / 1;"
  id="logo-3d-container"
>
  <ThreeHero client:only="vanilla" />
</div>
```
Inside the Three.js component, size the renderer from the container rather than `window`:
```js
const el = document.getElementById("logo-3d-container");
renderer.setSize(el.clientWidth, el.clientHeight);
```
For responsive resizing, use `ResizeObserver` instead of the `window` resize event — it fires when the container changes size, not just the window:
```js
new ResizeObserver(() => {
  const { clientWidth, clientHeight } = el;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}).observe(el);
```

**Warning signs:**
Chrome DevTools → Performance → CLS events. Any CLS event triggered after 1s is suspect. Check if the source element is the canvas.

**Phase to address:** Phase 2 (Three.js hero) — implement alongside the canvas mount, not as a later fix.

---

### Pitfall 10: Mobile Viewport Height Breaking the Hero (100vh Bug)

**What goes wrong:**
Using `height: 100vh` on the hero section on mobile browsers gives the wrong height. Safari and Chrome on mobile calculate `100vh` as the viewport height including the browser's address bar. When the bar hides on scroll, content either clips or overflows. This is particularly visible on the Three.js hero which is meant to be a precise full-viewport moment.

**Why it happens:**
The `vh` unit was specified before mobile browsers with retractable UI chrome existed. It does not update when the browser toolbar hides.

**How to avoid:**
Use the `dvh` (dynamic viewport height) unit with a `vh` fallback:
```css
.hero {
  height: 100vh;       /* fallback for browsers without dvh support */
  height: 100dvh;      /* correct on Chrome 108+, Safari 15.4+ */
}
```
For the Three.js canvas specifically, size from the container element using `clientHeight` (see Pitfall 9) rather than from `window.innerHeight`, which has the same address-bar problem as `100vh`.

**Warning signs:**
Test on a real iOS device (not simulator). If the hero is cropped or shows empty space at the bottom when the address bar is visible, this pitfall is active.

**Phase to address:** Phase 2 (Three.js hero) and Phase 3 (layout/responsive).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|---|---|---|---|
| Google Fonts CDN instead of self-hosting | Faster setup | Render-blocking on every cold visit, CLS risk, GDPR dependency | Never in production |
| `tailwind.config.js` alongside v4 | Familiar syntax | File is silently ignored unless `@config` is added; token drift | Never |
| Hardcoded hex colors in JSX/Astro instead of CSS variables | Faster to write | Design system breaks when palette changes; misses dark mode | Only for one-off prototypes |
| `will-change: transform` on marquee | Perceived optimization | Giant GPU layer texture for the full scroll width | Never apply without measuring |
| No `dispose()` on Three.js resources | Less boilerplate | WebGL context exhaustion, blank scene on iOS after navigation | Never |
| `client:load` instead of `client:only` for Three.js | Component renders instantly | Three.js bundle blocks initial JS parse | Never for a heavy 3D component |
| SVG `feTurbulence` grain without GPU layer | Simple CSS | CPU repaint on every scroll event, mobile jank | Never in production; use WebP tile |
| `loading="lazy"` on hero image | Default Astro behavior | LCP penalized, Lighthouse flags it | Never on LCP image |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|---|---|---|
| Three.js in Astro island | Using `client:visible` when container has zero height — fires immediately | Use `client:only`, give wrapper a fixed `aspect-ratio` |
| Three.js + Tailwind | Three.js canvas overflowing its container because Tailwind resets `max-width` | Set `width: 100%; height: 100%; display: block` on `<canvas>` |
| Tailwind v4 + Astro | Installing `@astrojs/tailwind` (v3 integration) | Use `@tailwindcss/vite` Vite plugin only |
| Tailwind v4 + dark mode | No `@custom-variant dark` declaration | Add `@custom-variant dark (&:where(.dark, .dark *))` in global CSS |
| Tailwind v4 + dynamic classes | Building class names with string concatenation (`"bg-" + color`) | Always use full class names; add dynamic values to a safelist |
| Fontsource + Astro | Importing font CSS in component scope — styles get scoped and fonts fail | Import font CSS in root layout or in `global.css` |
| Astro Image + hero | Default `loading="lazy"` on first visible image | Explicitly set `loading="eager"` and `fetchpriority="high"` |
| Vercel + Astro static | Installing `@astrojs/vercel` assuming it's needed for static deploy | No adapter needed for `output: "static"` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|---|---|---|---|
| Three.js uncapped `devicePixelRatio` | 20–30fps on 3× DPR mobile, high GPU temperature | `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` | Immediately on iPhone 13+ (3× DPR) |
| Grain overlay SVG filter with no GPU layer | Scroll jank, green paint flashes in DevTools | WebP tile + `transform: translateZ(0)` | Any mobile device under scroll load |
| Marquee with `will-change: transform` on full scroll width | GPU texture allocation failure, blank element on low-memory devices | Remove `will-change`; `translateX` composites automatically | Devices with <2GB GPU memory |
| Three.js per-frame object creation | GC spikes, stuttering at 1–2s intervals | Reuse geometries, materials, vectors; never `new THREE.Vector3()` inside render loop | Consistently on all devices |
| Astro `<Image>` on SVG files | Build error — Astro's image optimizer rejects SVGs | Use `<img src={logoSvg} />` for SVGs, not `<Image>` | At build time |
| External font in CSS `@font-face` without `crossorigin` preload | Font downloads twice (preload + fetch) | Always add `crossorigin` to font `<link rel="preload">` | Every page load |
| Unoptimized JPEG images from Instagram | Large file sizes (3–8MB), failed Lighthouse image audit | Convert to WebP at ≤1920px, ≤200KB for hero | Always in production |

---

## Security Mistakes

This is a static marketing site with no auth, no user input, and no backend. Domain-specific security concerns are minimal. The relevant risks:

| Mistake | Risk | Prevention |
|---|---|---|
| Embedding third-party JS (analytics, chat widgets) from CDN | XSS via CDN supply chain compromise | Use Vercel Analytics (first-party) only; avoid third-party CDN scripts |
| Contact links using `mailto:` with the raw email visible in source | Email harvesting by spam bots | Use a contact form service (e.g., Formspree) or obfuscate with CSS; acceptable for a small brand |
| Committing real location hours/prices in static files | Not a security risk — intentional | None needed; data is public by design |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---|---|---|
| 0px border-radius applied to all interactive elements including buttons | Buttons look clickable but feel unusually harsh; mobile tap targets feel aggressive | Maintain 0px radius as a brand rule but ensure 44px minimum touch target height on all interactive elements |
| ALL CAPS text for body paragraphs (Organic Brutalism over-application) | Severely reduces reading speed; fails WCAG readability for long-form content | Reserve ALL CAPS for labels, headlines, and marquee only; use sentence case for narrative sections (Tribu Nomade, story) |
| Electric Blue `#0055ff` on `#131313` background with small text | Contrast ratio 4.2:1 — passes AA for large text but fails for body text | Use `#e5e2e1` on-surface for body text; reserve Electric Blue for large display text and accents only |
| Three.js hero with no reduced-motion fallback | Users with vestibular disorders experience nausea from spinning/moving 3D | Add `@media (prefers-reduced-motion: reduce)` to pause all Three.js animation; show a static logo image as fallback |
| Marquee with no `prefers-reduced-motion` pause | Same vestibular issue; also WCAG 2.1 failure | `@media (prefers-reduced-motion: reduce) { .marquee { animation-play-state: paused; } }` |

---

## "Looks Done But Isn't" Checklist

- [ ] **Three.js hero:** Works in Chrome desktop — verify it renders on Safari iOS 16+ and Firefox Android before shipping
- [ ] **Grain overlay:** Looks correct in DevTools — test scroll performance on a real Android mid-range device (not simulator)
- [ ] **Marquee:** Plays smoothly in DevTools — test on 60hz vs 120hz displays for speed consistency
- [ ] **Design tokens:** All CSS variables appear correct in DevTools computed styles — check that `@fontsource` font files are actually included in the build bundle
- [ ] **Images:** Hero looks correct locally — verify none of `lh3.googleusercontent.com` URLs remain in any component
- [ ] **Dark mode:** Page renders correctly — temporarily remove `class="dark"` from `<html>` to verify `dark:` utilities are not doing the heavy lifting silently
- [ ] **Mobile hero height:** Full-height hero looks correct in browser DevTools responsive mode — test on real iOS Safari with retractable address bar
- [ ] **Vercel deploy:** Site loads locally — check Vercel deployment type (Static vs Serverless) in dashboard after first deploy
- [ ] **LCP:** Site loads quickly locally — run Lighthouse Mobile audit on the deployed URL, not localhost
- [ ] **Font loading:** Fonts display immediately locally (hot cache) — test in an incognito window or with "Disable cache" in DevTools

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---|---|---|
| Wrong Tailwind version (v3 installed instead of v4) | MEDIUM | Uninstall `@astrojs/tailwind`, install `@tailwindcss/vite`, rewrite all config from `tailwind.config.js` to `@theme` block in CSS |
| Three.js blocking LCP discovered late | LOW | Wrap existing component in `client:only` island, add aspect-ratio placeholder — 1–2 hours |
| Google Fonts render-blocking discovered late | LOW | Install `@fontsource`, remove `<link>` tags, add preload — 1 hour |
| External AIDA images used in production | HIGH (requires real assets) | Block deployment, source real photography from Instagram / brand files, replace all URLs |
| Grain overlay causing mobile jank | LOW | Replace SVG filter with WebP tile — 30 minutes |
| WebGL memory leak discovered after View Transitions added | LOW | Add `cleanup()` function + `astro:before-swap` listener — 1 hour |
| Canvas CLS discovered after sections built | MEDIUM | Add `aspect-ratio` wrappers to all Three.js containers, test CLS across all breakpoints |
| Dark mode variant missing | MEDIUM | Add `@custom-variant dark` to global CSS, then audit every component for unintended `dark:` class behavior |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---|---|---|
| Three.js blocking LCP | Phase 1: Astro setup | Lighthouse Mobile LCP < 2.5s on deployed URL |
| Wrong Tailwind adapter | Phase 1: Astro setup | `@theme` tokens visible in DevTools CSS computed panel |
| Google Fonts render-blocking | Phase 1: Astro setup / base layout | No `fonts.googleapis.com` in network waterfall |
| External AIDA placeholder images | Phase 2: Content sections | Zero `lh3.googleusercontent.com` requests in DevTools |
| Grain overlay CPU repaint | Phase 1: Design system | No paint flashing on grain element during scroll (DevTools Rendering) |
| WebGL memory leak | Phase 2: Three.js hero | GPU memory stable across 5 navigations in Chrome Task Manager |
| Dark mode variant misconfiguration | Phase 1: Astro setup | Remove `dark` class from `<html>`, verify page breaks correctly |
| Vercel SSR vs static | Phase 1: Astro setup | Vercel dashboard shows "Static" deployment type, no Functions listed |
| Canvas CLS | Phase 2: Three.js hero | CLS < 0.1 on Lighthouse, no canvas-source CLS events in Performance tab |
| Mobile 100vh hero break | Phase 2: Three.js hero / Phase 3: Responsive | Test on real iOS device with address bar visible |
| Marquee GPU layer explosion | Phase 3: Marquee section | No oversized layer in DevTools Layers panel |
| reduced-motion accessibility | Phase 3: Animations | Verify Three.js and marquee pause under `prefers-reduced-motion: reduce` |

---

## Sources

- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) — HIGH confidence (official)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — HIGH confidence (official)
- [Install Tailwind CSS with Astro — Tailwind official](https://tailwindcss.com/docs/installation/framework-guides/astro) — HIGH confidence (official)
- [Astro Deploy to Vercel](https://docs.astro.build/en/guides/deploy/vercel/) — HIGH confidence (official)
- [web.dev: Optimize web fonts](https://web.dev/learn/performance/optimize-web-fonts) — HIGH confidence (official Google)
- [web.dev: Preload web fonts](https://web.dev/articles/codelab-preload-web-fonts) — HIGH confidence (official Google)
- [Three.js How to dispose of objects](https://threejs.org/manual/en/cleanup.html) — HIGH confidence (official Three.js)
- [Three.js 100 tips — utsubo.com 2026](https://www.utsubo.com/blog/threejs-best-practices-100-tips) — MEDIUM confidence
- [Building Efficient Three.js Scenes — Codrops 2025](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) — MEDIUM confidence
- [Tailwind v4 CSS variables issue — GitHub #18237](https://github.com/tailwindlabs/tailwindcss/issues/18237) — HIGH confidence (official repo)
- [Debugging Tailwind CSS v4 — Medium 2025](https://medium.com/@sureshdotariya/debugging-tailwind-css-4-in-2025-common-mistakes-and-how-to-fix-them-b022e6cb0a63) — MEDIUM confidence
- [Dynamic viewport units dvh — Medium](https://medium.com/@alekswebnet/fix-mobile-100vh-bug-in-one-line-of-css-dynamic-viewport-units-in-action-102231e2ed56) — MEDIUM confidence
- [Grainy gradients — CSS-Tricks](https://css-tricks.com/grainy-gradients/) — MEDIUM confidence
- [Infinite Marquee — Frontend Masters Blog](https://frontendmasters.com/blog/infinite-marquee-animation-using-modern-css/) — MEDIUM confidence
- [Fontaine for Astro CLS reduction](https://eatmon.co/blog/using-fontaine-with-astro) — MEDIUM confidence
- [WebGL context limit — Khronos](https://www.khronos.org/webgl/wiki/HandlingContextLost) — HIGH confidence (official Khronos)
- [Astro client:visible zero-height issue — GitHub #8849](https://github.com/withastro/astro/issues/8849) — HIGH confidence (official repo)

---
*Pitfalls research for: Juana House landing page — Astro + Three.js + Tailwind v4 + Vercel*
*Researched: 2026-03-25*
