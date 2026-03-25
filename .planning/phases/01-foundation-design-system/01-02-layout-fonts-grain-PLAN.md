---
phase: 01-foundation-design-system
plan: 02
type: execute
wave: 2
depends_on: [01-P01]
files_modified:
  - scripts/gen-grain.mjs
  - public/assets/grain.webp
  - src/layouts/BaseLayout.astro
  - src/pages/index.astro
autonomous: false
requirements: [SETUP-02, SETUP-03]
must_haves:
  truths:
    - "BaseLayout renders html tag with class dark and lang es"
    - "Font preload link tags appear in head before any stylesheet"
    - "Space Grotesk and Work Sans load from local assets, not fonts.googleapis.com"
    - "Grain overlay appears as subtle texture over dark background"
    - "Electric Blue is visible in computed styles on the smoke-test page"
    - "npm run build completes without errors"
  artifacts:
    - path: "scripts/gen-grain.mjs"
      provides: "Node.js script generating grain.webp via sharp Gaussian noise"
      contains: "sharp"
    - path: "public/assets/grain.webp"
      provides: "200x200px greyscale Gaussian noise WebP tile"
    - path: "src/layouts/BaseLayout.astro"
      provides: "Root layout with dark html, font preloads, SEO baseline, global.css import"
      contains: "dark"
    - path: "src/pages/index.astro"
      provides: "Smoke-test page demonstrating all tokens work"
      contains: "bg-electric"
  key_links:
    - from: "src/layouts/BaseLayout.astro"
      to: "src/styles/global.css"
      via: "import statement in frontmatter"
      pattern: "import.*styles/global.css"
    - from: "src/layouts/BaseLayout.astro"
      to: "@fontsource woff2 files"
      via: "Vite ?url import for preload href"
      pattern: "woff2"
    - from: "src/pages/index.astro"
      to: "src/layouts/BaseLayout.astro"
      via: "import and wrapping slot"
      pattern: "import.*BaseLayout"
    - from: "src/styles/global.css"
      to: "public/assets/grain.webp"
      via: "CSS background-image url"
      pattern: "url.*grain.webp"
---

<objective>
Create the grain generation script, BaseLayout with font preloads and SEO baseline, and a smoke-test index page that proves all tokens, fonts, and the grain overlay are working correctly.

Purpose: Complete the Phase 1 foundation so all visual tokens are verifiable in the browser. The smoke-test page is the proof that Tailwind v4 tokens, self-hosted fonts, and the grain overlay all function correctly.

Output: BaseLayout.astro as the root layout for all future pages, grain.webp asset, and a working smoke-test page.
</objective>

<execution_context>
@/Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb/.claude/get-shit-done/workflows/execute-plan.md
@/Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-design-system/01-CONTEXT.md
@.planning/phases/01-foundation-design-system/01-RESEARCH.md
@.planning/phases/01-foundation-design-system/01-UI-SPEC.md
@referencias/DESIGN.md

<interfaces>
<!-- From Plan 01 -- executor needs these to build on top of the scaffold -->

From src/styles/global.css (created by Plan 01):
- @import '@fontsource/space-grotesk/700.css'
- @import '@fontsource/work-sans/500.css'
- @import "tailwindcss"
- @custom-variant dark (&:where(.dark, .dark *))
- @theme { --color-electric: #0055ff; --font-display: 'Space Grotesk'; --font-body: 'Work Sans'; ... }
- body::after { background-image: url('/assets/grain.webp'); ... }

From astro.config.mjs (created by Plan 01):
- output: 'static'
- vite: { plugins: [tailwindcss()] }

Available Tailwind utilities from @theme:
- bg-electric, text-electric, border-electric (from --color-electric)
- bg-surface, text-surface (from --color-surface)
- bg-on-surface, text-on-surface (from --color-on-surface)
- bg-surface-low, bg-surface-high (from --color-surface-low, --color-surface-high)
- font-display, font-body (from --font-display, --font-body)
- rounded-* all resolve to 0px
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create grain generation script and generate grain.webp</name>
  <files>scripts/gen-grain.mjs, public/assets/grain.webp</files>
  <read_first>
    .planning/phases/01-foundation-design-system/01-RESEARCH.md
  </read_first>
  <action>
1. Write `scripts/gen-grain.mjs` with this exact content (per D-03, RESEARCH.md Pattern 4):

```javascript
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

console.log('grain.webp written to', OUTPUT);
```

2. Run the script to generate the grain tile:
```
node scripts/gen-grain.mjs
```

3. Verify the output file exists at `public/assets/grain.webp` and is approximately 1-4KB in size.

IMPORTANT: The grain.webp MUST be in `public/assets/` (NOT `src/assets/`). The CSS reference `url('/assets/grain.webp')` in global.css requires the file to be served verbatim from `public/`. Files in `src/assets/` get Vite-hashed and the CSS string reference would 404 in production (per RESEARCH.md Pitfall 2).
  </action>
  <verify>
    <automated>test -f /Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb/public/assets/grain.webp && echo "grain.webp exists" && wc -c < /Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb/public/assets/grain.webp</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/gen-grain.mjs` contains `import sharp from 'sharp'`
    - `scripts/gen-grain.mjs` contains `noise: { type: 'gaussian'`
    - `scripts/gen-grain.mjs` contains `channels: 1`
    - `scripts/gen-grain.mjs` contains `width: 200`
    - `scripts/gen-grain.mjs` contains `public/assets`
    - `scripts/gen-grain.mjs` contains `.webp({ quality: 50 })`
    - `public/assets/grain.webp` file exists
    - `public/assets/grain.webp` file size is between 500 bytes and 10000 bytes
  </acceptance_criteria>
  <done>grain.webp tile (200x200px, greyscale, Gaussian noise) exists at public/assets/grain.webp and is approximately 1-4KB. The generation script is committed at scripts/gen-grain.mjs for reproducibility.</done>
</task>

<task type="auto">
  <name>Task 2: Create BaseLayout.astro with font preloads and SEO baseline, plus smoke-test index page</name>
  <files>src/layouts/BaseLayout.astro, src/pages/index.astro</files>
  <read_first>
    src/styles/global.css
    .planning/phases/01-foundation-design-system/01-RESEARCH.md
    .planning/phases/01-foundation-design-system/01-UI-SPEC.md
  </read_first>
  <action>
1. Write `src/layouts/BaseLayout.astro` with this structure (per D-08, D-09, D-10, RESEARCH.md Pattern 3).

The Astro frontmatter section (between the `---` delimiters) must contain:

```
import '../styles/global.css';

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
```

The HTML template must contain:

```html
<html class="dark" lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preload" as="font" type="font/woff2"
      href={spaceGroteskW700} crossorigin="anonymous" />
    <link rel="preload" as="font" type="font/woff2"
      href={workSansW500} crossorigin="anonymous" />
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

Key details:
- `class="dark"` on html tag (per D-09, SETUP-03) enables dark variant
- `lang="es"` on html tag (per D-09)
- Font preload links come BEFORE any stylesheet rendering in head (per RESEARCH.md Pitfall 5)
- `crossorigin="anonymous"` is REQUIRED on font preloads (per RESEARCH.md Pitfall 5)
- Vite `?url` import resolves to hashed `/_astro/` paths in production (per RESEARCH.md Pattern 3)
- `body` has `bg-surface text-on-surface font-body` as base classes
- Props interface with defaults for title, description, ogImage (per D-08)

2. Write `src/pages/index.astro` as a smoke-test page that verifies all Phase 1 tokens.

The Astro frontmatter must import BaseLayout:
```
import BaseLayout from '../layouts/BaseLayout.astro';
```

The HTML template must contain:

```html
<BaseLayout>
  <main class="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
    <h1 class="font-display text-5xl font-bold tracking-tight text-on-surface uppercase">
      JUANA HOUSE
    </h1>
    <div class="bg-electric px-8 py-4 text-white font-display font-bold uppercase tracking-wide">
      Electric Blue Token Test
    </div>
    <p class="font-body text-on-surface text-base">
      Work Sans 500 body text renders here.
    </p>
    <div class="flex gap-4">
      <div class="bg-surface-low px-6 py-4 text-on-surface">surface-low</div>
      <div class="bg-surface-high px-6 py-4 text-on-surface">surface-high</div>
      <div class="bg-electric-light px-6 py-4 text-surface">electric-light</div>
    </div>
    <div class="rounded-lg bg-surface-high px-6 py-4 text-on-surface">
      rounded-lg = 0px (zero roundedness)
    </div>
  </main>
</BaseLayout>
```

This smoke-test page verifies:
- `bg-electric` renders #0055ff (Phase 1 success criterion 2)
- `font-display` renders Space Grotesk
- `font-body` renders Work Sans
- `text-on-surface` renders #e5e2e1
- `bg-surface` renders #131313 (via BaseLayout body class)
- `bg-surface-low`, `bg-surface-high`, `bg-electric-light` all render correct colors
- `rounded-lg` renders 0px radius
- Grain overlay is visible as subtle texture over the dark background (via body::after from global.css)

3. Run `npm run build` to confirm everything compiles.
  </action>
  <verify>
    <automated>cd /Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb && npm run build 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - `src/layouts/BaseLayout.astro` contains `class="dark" lang="es"`
    - `src/layouts/BaseLayout.astro` contains `import '../styles/global.css'`
    - `src/layouts/BaseLayout.astro` contains `@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url`
    - `src/layouts/BaseLayout.astro` contains `@fontsource/work-sans/files/work-sans-latin-500-normal.woff2?url`
    - `src/layouts/BaseLayout.astro` contains `rel="preload" as="font" type="font/woff2"`
    - `src/layouts/BaseLayout.astro` contains `crossorigin="anonymous"` (on both preload links)
    - `src/layouts/BaseLayout.astro` contains `interface Props`
    - `src/layouts/BaseLayout.astro` contains `JUANA HOUSE | URBAN NOMAD EDITORIAL`
    - `src/layouts/BaseLayout.astro` contains `og:title`
    - `src/layouts/BaseLayout.astro` contains `og:image`
    - `src/layouts/BaseLayout.astro` contains `bg-surface text-on-surface font-body` on body tag
    - `src/pages/index.astro` contains `import BaseLayout from`
    - `src/pages/index.astro` contains `bg-electric`
    - `src/pages/index.astro` contains `font-display`
    - `src/pages/index.astro` contains `font-body`
    - `src/pages/index.astro` contains `bg-surface-low`
    - `src/pages/index.astro` contains `bg-surface-high`
    - `src/pages/index.astro` contains `rounded-lg`
    - `npm run build` exits with code 0
    - Build output directory `dist/` contains an `index.html` file
    - `dist/index.html` does NOT contain `fonts.googleapis.com`
  </acceptance_criteria>
  <done>BaseLayout.astro renders with html class="dark" lang="es", font preloads for Space Grotesk 700 and Work Sans 500 via Vite ?url imports, OG/SEO meta tags with defaults. Smoke-test index.astro uses BaseLayout and displays all token classes (bg-electric, font-display, font-body, surface colors, rounded-lg). npm run build completes successfully. No requests to fonts.googleapis.com in build output.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Visual verification of tokens, fonts, and grain overlay</name>
  <files>src/pages/index.astro</files>
  <action>Present the smoke-test page for human visual verification. The executor should run `npm run dev` and provide the URL http://localhost:4321 for the user to inspect.</action>
  <what-built>
    Complete Phase 1 foundation: Astro 5 + Tailwind v4 scaffold with all brand tokens, self-hosted fonts, BaseLayout, grain overlay, and smoke-test page.
  </what-built>
  <how-to-verify>
    1. Run `npm run dev` and open http://localhost:4321 in Chrome
    2. Verify "JUANA HOUSE" heading renders in Space Grotesk font (chunky geometric sans-serif, NOT a system font)
    3. Verify "Work Sans 500 body text renders here." renders in Work Sans (clean, slightly rounded sans-serif)
    4. Verify the "Electric Blue Token Test" box has a bright blue background (#0055ff). Open DevTools Elements tab, click the box, check Computed Styles: `background-color` should show `rgb(0, 85, 255)`
    5. Verify the page background is dark (#131313) -- nearly black
    6. Verify the "rounded-lg = 0px" box has sharp corners (no border-radius)
    7. Verify grain overlay: look closely at the dark background -- a very subtle noise texture should be visible. It should NOT cause jank when scrolling.
    8. Open DevTools Network tab, reload the page, filter by "font" type. Verify:
       - Font files load from `/_astro/` or localhost paths (NOT from `fonts.googleapis.com`)
       - Zero requests to `fonts.googleapis.com`
    9. Verify surface-low (#1a1a1a), surface-high (#353534), and electric-light (#b6c4ff) boxes show distinct colors from each other and from the page background
  </how-to-verify>
  <verify>User confirms visual rendering matches expected output</verify>
  <done>User has approved that all tokens, fonts, grain overlay, and zero-radius render correctly in the browser.</done>
  <resume-signal>Type "approved" or describe any visual issues</resume-signal>
</task>

</tasks>

<verification>
Phase 1 complete when ALL of these are true:
1. `npm run build` exits with code 0
2. Electric Blue `#0055ff` is visible in computed styles (DevTools confirms `rgb(0, 85, 255)`)
3. Fonts load from local `/_astro/` paths -- zero requests to `fonts.googleapis.com` in Network tab
4. Grain overlay renders as subtle noise texture over `#131313` background without scroll jank
5. All radius utilities compute to `0px`
6. BaseLayout has `<html class="dark" lang="es">`
</verification>

<success_criteria>
- Smoke-test page at localhost:4321 shows all token classes rendering correctly
- Space Grotesk and Work Sans are self-hosted (Network tab confirms no Google Fonts requests)
- Electric Blue #0055ff is verifiable in DevTools computed styles
- Grain overlay is visible as texture, not causing performance issues
- All rounded-* utilities produce 0px border-radius
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-P02-SUMMARY.md`
</output>
