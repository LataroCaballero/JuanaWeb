---
phase: 01-foundation-design-system
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - astro.config.mjs
  - src/styles/global.css
  - package.json
  - tsconfig.json
autonomous: true
requirements: [SETUP-01, SETUP-04]

must_haves:
  truths:
    - "npm run dev starts the Astro dev server without errors"
    - "npm run build completes with exit code 0"
    - "bg-electric class produces background-color rgb(0, 85, 255) in computed styles"
    - "font-display class produces font-family containing Space Grotesk"
    - "rounded-lg computes to border-radius 0px"
  artifacts:
    - path: "astro.config.mjs"
      provides: "Astro 5 config with @tailwindcss/vite plugin and output static"
      contains: "@tailwindcss/vite"
    - path: "src/styles/global.css"
      provides: "Complete @theme tokens, @fontsource imports, dark mode variant, grain overlay CSS, component tokens"
      contains: "--color-electric"
    - path: "package.json"
      provides: "All dependencies: astro, tailwindcss, @tailwindcss/vite, @fontsource/space-grotesk, @fontsource/work-sans, sharp"
  key_links:
    - from: "astro.config.mjs"
      to: "@tailwindcss/vite"
      via: "vite.plugins array"
      pattern: "plugins.*tailwindcss"
    - from: "src/styles/global.css"
      to: "tailwindcss"
      via: "@import directive"
      pattern: "@import.*tailwindcss"
---

<objective>
Scaffold the Astro 5 project from scratch with Tailwind v4 integrated via @tailwindcss/vite, install all Phase 1 dependencies, and create the complete design token system in global.css.

Purpose: Establish the technical foundation so that all brand tokens (colors, fonts, radii, component vars) are available as Tailwind utilities from day one. Later phases only consume tokens -- they never add to @theme.

Output: Working Astro 5 project with `npm run build` passing and all Tailwind v4 tokens generating correct utilities.
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
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Astro 5 project and install all dependencies</name>
  <files>package.json, astro.config.mjs, tsconfig.json, src/styles/global.css, src/pages/index.astro</files>
  <read_first>
    .planning/phases/01-foundation-design-system/01-RESEARCH.md
    .planning/phases/01-foundation-design-system/01-CONTEXT.md
  </read_first>
  <action>
1. Create the Astro 5 project using the minimal template. Run:
   ```
   npm create astro@latest -- . --template minimal --no-install --no-git
   ```
   (Use current directory. The `--no-install` flag lets us add deps first. `--no-git` because git is already initialized.)

   If Astro scaffolding fails because the directory is not empty, create the minimal structure manually:
   - `package.json` with `"astro": "^5.0.0"` dependency, scripts `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`
   - `tsconfig.json` with `{ "extends": "astro/tsconfigs/strict" }`
   - `src/pages/index.astro` with a placeholder `<html>` page

2. Install all dependencies in one command:
   ```
   npm install astro tailwindcss @tailwindcss/vite @fontsource/space-grotesk @fontsource/work-sans
   npm install --save-dev sharp
   ```

3. Create folder structure per D-02:
   ```
   mkdir -p src/styles src/layouts src/assets src/components scripts public/assets
   ```

4. Write `astro.config.mjs` with this exact content (per D-01, SETUP-01, RESEARCH.md):
   ```javascript
   import { defineConfig } from 'astro/config';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     output: 'static',
     vite: {
       plugins: [tailwindcss()],
     },
   });
   ```

5. Write `src/styles/global.css` with the complete token system. This is the single source of truth for all design tokens (per D-05, D-06, D-07). The file must contain, in this exact order:

   a. @fontsource imports BEFORE tailwindcss (per RESEARCH.md Pitfall 6):
      ```css
      @import '@fontsource/space-grotesk/700.css';
      @import '@fontsource/work-sans/500.css';
      ```
      NOTE: Space Grotesk weight 900 does NOT exist -- max is 700 (per RESEARCH.md Pitfall 1). Only import 700.

   b. Tailwind import:
      ```css
      @import "tailwindcss";
      ```

   c. Dark mode custom variant (per SETUP-03, RESEARCH.md Pattern 2):
      ```css
      @custom-variant dark (&:where(.dark, .dark *));
      ```

   d. Complete @theme block with ALL tokens (per D-06, SETUP-04, UI-SPEC.md):
      ```css
      @theme {
        --color-electric: #0055ff;
        --color-electric-light: #b6c4ff;
        --color-surface: #131313;
        --color-on-surface: #e5e2e1;
        --color-surface-low: #1a1a1a;
        --color-surface-high: #353534;
        --color-error: #ffb4ab;

        --font-display: 'Space Grotesk', system-ui, sans-serif;
        --font-body: 'Work Sans', system-ui, sans-serif;

        --radius-sm: 0px;
        --radius-md: 0px;
        --radius-lg: 0px;
        --radius-xl: 0px;
        --radius-2xl: 0px;
        --radius-3xl: 0px;
      }
      ```

   e. Component-level tokens in `:root {}` (NOT inside @theme -- per RESEARCH.md Open Question 1, UI-SPEC.md):
      ```css
      :root {
        --nav-blur: 20px;
        --nav-bg: rgba(19, 19, 19, 0.85);
        --glow-blur: 30px;
        --glow-opacity: 0.08;
      }
      ```

   f. Grain overlay CSS on body::after (per D-04, RESEARCH.md Pattern 5, UI-SPEC.md):
      ```css
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

6. Ensure `src/pages/index.astro` exists as a minimal placeholder (will be replaced by Task 2 of Plan 02):
   ```astro
   <html lang="es">
     <head><meta charset="UTF-8" /><title>JUANA HOUSE</title></head>
     <body><h1>Setup</h1></body>
   </html>
   ```
  </action>
  <verify>
    <automated>cd /Users/laucaballero/Desktop/Lautaro/AndesCode/JuanaWeb && npm run build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"astro"` in dependencies
    - `package.json` contains `"tailwindcss"` in dependencies
    - `package.json` contains `"@tailwindcss/vite"` in dependencies
    - `package.json` contains `"@fontsource/space-grotesk"` in dependencies
    - `package.json` contains `"@fontsource/work-sans"` in dependencies
    - `package.json` contains `"sharp"` in devDependencies
    - `astro.config.mjs` contains `import tailwindcss from '@tailwindcss/vite'`
    - `astro.config.mjs` contains `output: 'static'`
    - `astro.config.mjs` contains `plugins: [tailwindcss()]`
    - `src/styles/global.css` contains `@import '@fontsource/space-grotesk/700.css'`
    - `src/styles/global.css` contains `@import '@fontsource/work-sans/500.css'`
    - `src/styles/global.css` contains `@import "tailwindcss"`
    - `src/styles/global.css` contains `@custom-variant dark (&:where(.dark, .dark *))`
    - `src/styles/global.css` contains `--color-electric: #0055ff`
    - `src/styles/global.css` contains `--color-electric-light: #b6c4ff`
    - `src/styles/global.css` contains `--color-surface: #131313`
    - `src/styles/global.css` contains `--color-on-surface: #e5e2e1`
    - `src/styles/global.css` contains `--color-surface-low: #1a1a1a`
    - `src/styles/global.css` contains `--color-surface-high: #353534`
    - `src/styles/global.css` contains `--color-error: #ffb4ab`
    - `src/styles/global.css` contains `--font-display: 'Space Grotesk'`
    - `src/styles/global.css` contains `--font-body: 'Work Sans'`
    - `src/styles/global.css` contains `--radius-sm: 0px`
    - `src/styles/global.css` contains `--radius-3xl: 0px`
    - `src/styles/global.css` contains `--nav-blur: 20px`
    - `src/styles/global.css` contains `--glow-blur: 30px`
    - `src/styles/global.css` contains `body::after`
    - `src/styles/global.css` contains `url('/assets/grain.webp')`
    - `src/styles/global.css` contains `opacity: 0.05`
    - `src/styles/global.css` does NOT contain `@fontsource/space-grotesk/900.css`
    - No file named `tailwind.config.js` or `tailwind.config.ts` exists in project root
    - `npm run build` exits with code 0
    - Directories exist: `src/styles/`, `src/layouts/`, `src/assets/`, `src/components/`, `scripts/`, `public/assets/`
  </acceptance_criteria>
  <done>Astro 5 project scaffolded with all dependencies installed, astro.config.mjs configured with @tailwindcss/vite and output static, global.css contains the complete @theme token system (6 colors + error, 2 font families, 6 radius overrides all 0px), component-level CSS vars in :root, grain overlay CSS, @fontsource imports, and dark mode custom variant. npm run build completes without errors.</done>
</task>

</tasks>

<verification>
- `npm run build` exits with code 0
- `src/styles/global.css` contains all 7 color tokens, 2 font families, 6 radius overrides, 4 component tokens, grain overlay, dark variant
- `astro.config.mjs` uses `@tailwindcss/vite` (not `@astrojs/tailwind`)
- No `tailwind.config.js` file exists
- No `@fontsource/space-grotesk/900.css` import exists
</verification>

<success_criteria>
- The Astro 5 project builds successfully with `npm run build`
- All design tokens from D-06 are declared in global.css @theme block
- Component tokens are in :root (not @theme)
- @fontsource fonts are imported (700 for Space Grotesk, 500 for Work Sans)
- Grain overlay CSS rule exists targeting body::after
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-design-system/01-P01-SUMMARY.md`
</output>
