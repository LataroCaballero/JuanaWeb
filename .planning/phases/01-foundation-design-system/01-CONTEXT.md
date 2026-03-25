# Phase 1: Foundation & Design System - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold del proyecto Astro 5 + Tailwind v4 con todos los tokens visuales de la marca disponibles como utilities, fuentes self-hosted, y BaseLayout con dark mode y grain overlay. No incluye componentes ni contenido — solo la fundación técnica y visual sobre la que se construye el resto.

</domain>

<decisions>
## Implementation Decisions

### Scaffold
- **D-01:** Blank minimal template — `npm create astro@latest` con la opción "A minimal, empty starter". Sin archivos de ejemplo, sin componentes preinstalados.
- **D-02:** Estructura de carpetas desde el inicio: `src/styles/`, `src/layouts/`, `src/assets/`, `src/components/`. No mezclar assets con estilos.

### Grain Overlay Asset
- **D-03:** Generar el tile WebP programáticamente con un script Node.js durante el scaffold. El script crea un noise pattern de ~2KB (ej. 200×200px, low-opacity monochrome noise) y lo guarda en `src/assets/grain.webp`. Sin placeholder debt, sin dependencia de asset externo.
- **D-04:** El grain se aplica como `background-image` CSS sobre un pseudo-elemento `::after` en `body` con `position: fixed`, `pointer-events: none`, `mix-blend-mode: overlay`, `opacity: 0.04–0.06`. El tile se repite (background-repeat: repeat).

### Tailwind v4 Token Scope
- **D-05:** `@theme` completo desde Phase 1 — brand tokens + component-level tokens. Los componentes de fases posteriores solo consumen utilities sin agregar más al `@theme`.
- **D-06:** Tokens a incluir:
  - **Colors:** `--color-electric: #0055ff`, `--color-electric-light: #b6c4ff`, `--color-surface: #131313`, `--color-on-surface: #e5e2e1`, `--color-surface-low: #1a1a1a`, `--color-surface-high: #353534`
  - **Typography:** `--font-display: 'Space Grotesk'`, `--font-body: 'Work Sans'`
  - **Radius:** `--radius: 0px` (regla absoluta — ni 1px de radio en ningún elemento)
  - **Component-level:** `--nav-blur: 20px`, `--nav-bg: rgba(19,19,19,0.85)`, `--glow-blur: 30px`, `--glow-opacity: 0.08`
  - **Spacing custom:** Solo si el sistema de Tailwind default no cubre alguna necesidad de la guía (confirmar en planning)
- **D-07:** Archivo único `src/styles/global.css` con todo el `@theme` más el `@import "tailwindcss"`. No dividir en múltiples archivos CSS para Phase 1 — si crece puede refactorizarse en Phase 3.

### BaseLayout
- **D-08:** `BaseLayout.astro` incluye SEO/OG baseline con props: `title`, `description`, `ogImage` (con defaults). Placeholder values para title/description; slots reales en Phase 3 cuando el contenido exista.
- **D-09:** Estructura del layout: `<html class="dark" lang="es">`, `<head>` con charset, viewport, font preloads (`<link rel="preload" as="font">`), OG meta tags, `<body>` con grain overlay (vía CSS class en body o pseudo-elemento).
- **D-10:** Font preloads apuntan a los archivos de @fontsource en `node_modules` — Astro los copia a `/fonts/` en el build mediante `public/fonts/` o vite asset handling (confirmar en planning cuál aplica mejor para Astro 5).

### Fonts
- **D-11:** @fontsource packages: `@fontsource/space-grotesk` (weights: 700, 900) + `@fontsource/work-sans` (weight: 500). Importados en `global.css` con `@import '@fontsource/...'`.
- **D-12:** PERF-02 debe verificarse: DevTools Network en producción no muestra requests a `fonts.googleapis.com`. El build de Astro debe servir las fuentes desde `/assets/` o `/fonts/`.

### Claude's Discretion
- Nombre exacto de clases Tailwind para los tokens (ej. `text-electric` vs `text-primary` — Claude elige el nombre consistente con la guía)
- Valor exacto de opacity del grain overlay (entre 0.04 y 0.06 — Claude ajusta visualmente)
- Configuración específica del plugin `@tailwindcss/vite` en `astro.config.mjs`
- Si @fontsource requiere import por subset o por weight (depende de la versión instalada)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design System
- `referencias/DESIGN.md` — Sistema visual completo: colores, tipografía, elevation, componentes, reglas No-Line y Zero Roundedness
- `referencias/juanaV1.html` — HTML de referencia con Tailwind CDN implementando el sistema visual. Usar como guía visual, NO copiar el approach de CDN.

### Requirements
- `.planning/REQUIREMENTS.md` §Setup & Design System — SETUP-01 a SETUP-04 (criterios exactos de aceptación)
- `.planning/ROADMAP.md` §Phase 1 — Success criteria definitivos para la fase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `referencias/juanaV1.html` — Implementación de referencia con Tailwind CDN. Contiene los class names usados en el HTML de referencia que informan el naming de utilities en `@theme`.
- `referencias/DESIGN.md` — Token values exactos para el `@theme` (colores, sizing, componentes).

### Established Patterns
- No hay código fuente existente — proyecto se crea desde cero en esta fase.
- El HTML de referencia usa Tailwind CDN config inline: patrón visual a replicar en `@theme` de v4.

### Integration Points
- `astro.config.mjs` — Punto de entrada para el plugin `@tailwindcss/vite`
- `src/styles/global.css` — Único archivo de tokens, importado en BaseLayout
- `BaseLayout.astro` — Layout raíz que todas las páginas extenderán en fases siguientes

</code_context>

<specifics>
## Specific Ideas

- El grain overlay debe ser un WebP tile generado programáticamente — se especificó explícitamente "no SVG feTurbulence" en SETUP-03.
- El `@theme` debe ser completo desde Phase 1 para que los componentes de fases 2–4 no necesiten tocar estilos globales — "full system upfront".
- BaseLayout incluye OG/SEO baseline con defaults ahora, valores reales en Phase 3.
- Astro 5 (no 6) — hay breaking changes en v6 que aún no se han evaluado.
- Tailwind v4 via `@tailwindcss/vite` — NO usar `@astrojs/tailwind` (instala v3 silenciosamente).

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de Phase 1.

</deferred>

---

*Phase: 01-foundation-design-system*
*Context gathered: 2026-03-25*
