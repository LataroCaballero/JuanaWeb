# Project Research Summary

**Project:** Juana House — Landing Page
**Domain:** Brand-forward static landing page — mobile café / food truck
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

Juana House es una landing page performance-first construida sobre Astro 5 + Three.js + Tailwind CSS v4 + Vercel static. El stack está bien documentado y los riesgos son bajos en todos los componentes excepto el workflow de extrusión SVG del logo en Three.js (que debe prototipars en Fase 1 antes de construir todo lo demás a su alrededor). El HTML de referencia (`juanaV1.html`) es una base de diseño sólida pero tiene varios gaps de producción críticos: todas las imágenes son placeholders externos AI-generados, los horarios de operación están completamente ausentes de la sección de ubicaciones, y el grain overlay usa un SVG filter que repinta CPU en cada scroll.

La arquitectura es limpia: HTML estático puro con un único island JS (el logo 3D hero vía IntersectionObserver + vanilla Three.js), marquee CSS-only, y GSAP ScrollTrigger en `<script>` tags planos para motion. Sin React, sin SSR, sin CMS. El LCP element DEBE ser el `<h1>` headline estático — nunca el canvas de Three.js.

La fase más crítica es el scaffold de Astro y la setup de Tailwind v4, porque varios errores comunes (adaptador incorrecto, falta de `@custom-variant dark`, grain overlay SVG) producen output incorrecto SIN error de build. Hacer bien la Fase 1 crea una base estable; hacerla mal causa retrabajos en todo el proyecto.

## Key Findings

### Recommended Stack

**Core technologies:**
- **Astro 5.17+** (no 6 — requiere Node 22+ y no agrega valor para Vercel static): Islands architecture, static output, deploy en Vercel sin config
- **Tailwind v4 + `@tailwindcss/vite`**: CSS-first via `@theme {}` block, sin `tailwind.config.js`. NUNCA usar `@astrojs/tailwind` (instala v3 silenciosamente)
- **Three.js r183** (vanilla, no R3F): SVGLoader → ExtrudeGeometry para el logo 3D smiley, ~150-250KB tree-shaken con named imports
- **GSAP 3.12+**: Totalmente free (post-adquisición Webflow). Scroll animations en `<script>` tags planos — sin island directive
- **@fontsource/space-grotesk + @fontsource/work-sans**: Self-hosted, solo los pesos usados (700/900 + 500)
- **sharp**: Peer dep de Astro para conversión WebP en build time

**⚠️ IMPORTANTE — `client:*` directives no aplican a componentes `.astro` vanilla:**
La directiva `client:visible` solo funciona para componentes de UI frameworks (React, Vue, Svelte). Para vanilla Three.js en un `.astro` component, usar `IntersectionObserver` en un `<script>` tag scoped.

### Expected Features

**Must have (table stakes):**
- Hero con brand identity + slogan prominent above fold (`COFFEE ON YOUR WAY`)
- Sección menú con precios ARS reales (dependencia de contenido crítica)
- Dos location cards con dirección completa + **horarios de operación** (gap crítico en reference HTML)
- Instagram link visible above fold (no solo en footer)
- Mobile-first responsive layout
- Grain overlay + Electric Blue design tokens
- Nav con glassmorphism en scroll

**Should have (diferenciadores — todos v1):**
- Logo 3D animado via Three.js island (IntersectionObserver lazy-load)
- Marquee CSS con brand phrases en fondo Electric Blue
- Sección "Nuestra Historia" / Tribu Nomade editorial
- Location cards grayscale-to-color hover
- CTA "Ver dónde estamos hoy" → Instagram Stories
- Tipografía a escala extrema (10-12vw headlines, sin compromiso en mobile)

**Defer (v2+):**
- Grid de fotos curadas (requiere selección de fotografía real)
- GSAP ScrollTrigger marquee velocity scrub
- Google Maps embed interactivo (placeholder + lazy inject)
- Section reveals con scroll (GSAP)
- Scrollytelling section

### Architecture Approach

Sitio completamente estático en Astro: una página, múltiples componentes `.astro` que renderizan HTML estático. El único componente JS-pesado es `HeroIsland.astro` — una escena vanilla Three.js que se inicializa vía `IntersectionObserver` (no `client:*` directive). GSAP corre en `<script>` tags scoped que apuntan a nodos HTML estáticos, deduplicados por el bundler de Astro.

**Estructura de componentes:**
1. `BaseLayout.astro` — `<html class="dark" lang="es">`, font preloads, grain overlay (WebP tile), CSS global
2. `HeroIsland.astro` + `src/three/logoScene.js` — canvas Three.js con IntersectionObserver lazy init
3. Componentes de sección: `Nav`, `Hero`, `Marquee`, `TribuNomade`, `Menu`, `Locations`, `Footer` — todo HTML estático
4. `src/scripts/animations.ts` — GSAP + ScrollTrigger shared entry point (registrado una sola vez)
5. `src/styles/global.css` — `@import "tailwindcss"` + `@custom-variant dark` + `@theme` tokens + grain keyframes

### Critical Pitfalls

1. **Three.js bloqueando el LCP** — Usar IntersectionObserver (no `client:visible` que se ignora en `.astro`). El `<h1>` estático debe ser el LCP element. Canvas wrapper con `aspect-ratio: 1/1` antes de que corra JS previene CLS.
2. **Adaptador Tailwind incorrecto** — `@astrojs/tailwind` instala v3 silenciosamente; todos los tokens desaparecen sin error. Usar `@tailwindcss/vite` como Vite plugin.
3. **Falta `@custom-variant dark`** — Sin esta declaración en `global.css`, todas las clases `dark:` se ignoran silenciosamente. Requerido porque el diseño es dark-only con `class="dark"` hardcodeado en `<html>`.
4. **Imágenes placeholder externas en producción** — CADA imagen en `juanaV1.html` es un placeholder `lh3.googleusercontent.com` que romperá en producción. Bloquear deploy hasta reemplazarlas todas.
5. **SVG `feTurbulence` grain overlay** — Repinta CPU en cada scroll frame; causa 15-20fps jank en Android. Reemplazar con tile WebP pre-renderizado + `transform: translateZ(0)`.
6. **WebGL memory leak** — Three.js no libera GPU resources automáticamente. Implementar `dispose()` + `forceContextLoss()` wired a `astro:before-swap` desde el inicio.

## Implications for Roadmap

### Phase 1: Foundation & Design System
**Rationale:** Todos los componentes dependen de los tokens. El setup de Tailwind v4 tiene múltiples modos de fallo silencioso que corrompen todo lo construido encima. Debe verificarse antes de cualquier feature work.
**Delivers:** Scaffold Astro, Tailwind v4 con `@theme` tokens completos, fonts self-hosted con preloads, `BaseLayout.astro` con dark mode + grain overlay WebP, `astro.config.mjs` correcto.
**Gate:** Electric Blue `#0055ff` visible en DevTools computed styles. `npm run build` exitoso.
**Avoids:** Pitfalls de Tailwind v3, fonts Google CDN, dark mode misconfiguration, grain CPU repaint.

### Phase 2: Three.js Hero
**Rationale:** Componente de mayor riesgo. Validar LCP < 2.5s con 3D activo antes de construir 6 secciones más encima del mismo layout.
**Delivers:** `HeroIsland.astro` + `src/three/logoScene.js` — smiley SVG extruido a 3D, rotación idle, IntersectionObserver lazy init, SVG placeholder CLS prevention. `Hero.astro` con `<h1>` estático como LCP anchor.
**Gate:** Lighthouse LCP element es `<h1>`, no canvas. LCP < 2.5s.
**Avoids:** Pitfalls de Three.js LCP, WebGL memory leak, canvas CLS.
**⚠️ Flag:** El logo SVG aún no existe — necesita `<path>` elements limpios (no `<use>`, `<symbol>`). Prototipar primero.

### Phase 3: Content Sections
**Rationale:** Markup puro, rápido de construir una vez que los tokens existen. Las dependencias de contenido (horarios, precios) deben resolverse aquí.
**Delivers:** `Nav.astro`, `Marquee.astro` (CSS-only), `TribuNomade.astro`, `Menu.astro` (precios ARS reales), `Locations.astro` (dirección real + horarios + grayscale hover), `Footer.astro`.
**Critical content gaps:** Horarios de operación por ubicación, items de menú reales con precios ARS.
**Gate:** Todas las secciones renderizan. Horarios presentes. Sin requests de imágenes externas.

### Phase 4: Image Pipeline & Performance
**Rationale:** Bloquear deploy de producción hasta reemplazar todas las imágenes placeholder. El pipeline de Astro `<Image />` maneja conversión WebP y lazy loading.
**Delivers:** Todas las imágenes de contenido en `src/assets/images/`, procesadas a WebP. Hero background con `loading="eager" fetchpriority="high"`. Resto lazy.
**Gate:** Cero requests `lh3.googleusercontent.com`. CLS = 0 en Lighthouse.

### Phase 5: Motion Layer
**Rationale:** GSAP apunta a HTML que ya debe existir. Motion es enhancement, no estructura.
**Delivers:** `src/scripts/animations.ts` (GSAP + ScrollTrigger), nav glassmorphism en scroll, marquee CSS (con `prefers-reduced-motion` pause), section reveals opcionales.
**Gate:** TBT < 200ms. Todas las animaciones GSAP pausan bajo `prefers-reduced-motion: reduce`.

### Phase 6: Deploy & Audit
**Rationale:** Lighthouse CI debe correr en Vercel preview URL, no localhost.
**Delivers:** `vercel.json` con cache headers, Vercel static deploy verificado, Lighthouse Mobile audit passing.
**Gate:** LCP < 2.5s, TBT < 200ms, CLS = 0, sin imágenes rotas.

### Phase Ordering Rationale

- **Foundation primero:** Tokens de Tailwind v4 son hard dependency para todo el trabajo visual.
- **Three.js segundo:** Mayor riesgo, mayor reward. Probar LCP < 2.5s con 3D activo libera confianza para el resto del build.
- **Secciones de contenido antes que imágenes:** Construir estructura primero, rellenar fotografía real en un pass dedicado.
- **Motion al final:** GSAP apunta a DOM nodes que ya deben existir y estar estables.
- **Deploy gate al final:** Lighthouse en localhost es engañoso (sin latencia CDN real).

### Research Flags

Fases que necesitan atención especial:
- **Phase 2 (Three.js):** SVGLoader → ExtrudeGeometry para el smiley logo es el item técnico de mayor incertidumbre. Los path holes (ojos negativos) requieren winding order correcto.
- **Phase 3 (Content):** Dependencias de contenido son blockers — horarios y precios ARS deben confirmarse con el cliente.

Fases con patrones estándar:
- **Phase 1:** Completamente documentado, sin sorpresas.
- **Phase 4:** Pipeline estándar de `<Image />` en Astro.
- **Phase 5:** GSAP + Astro bien documentado.
- **Phase 6:** Astro + Vercel static es zero-config.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versiones verificadas contra docs oficiales y npm |
| Features | HIGH | Análisis directo del HTML de referencia + domain standards food trucks |
| Architecture | HIGH | Todos los patrones verificados contra docs oficiales de Astro, Tailwind, Three.js |
| Pitfalls (críticos) | HIGH | De docs oficiales y GitHub issues confirmados |
| Pitfalls (performance) | MEDIUM | Benchmarks de comunidad, no oficiales |

**Overall confidence:** HIGH

### Gaps to Address

- **Logo SVG file:** No existe aún. Phase 2 bloqueada hasta tener SVG limpio con `<path>` elements.
- **Fotografía real:** Todas las imágenes son placeholders AI-generados. Sourcing necesario antes de Phase 4.
- **Horarios de operación:** No están en el HTML de referencia. Confirmar con el cliente (Iron Man + Cara Sur, potencialmente estacional).
- **Precios del menú:** HTML de referencia tiene items placeholder. Precios ARS reales necesarios para Phase 3.
- **Space Grotesk variable font Black weight:** Verificar que `@fontsource-variable/space-grotesk` cubre peso 900 antes de Phase 1.

## Sources

### Primary (HIGH confidence)
- Astro 5 docs oficiales — islands, directives, scripts, image optimization, Vercel deploy
- Tailwind CSS v4 docs oficiales — `@tailwindcss/vite`, `@theme`, dark mode variant, upgrade guide
- Three.js r183 docs oficiales — SVGLoader, ExtrudeGeometry, cleanup manual
- GSAP docs oficiales — accessibility, ScrollTrigger
- web.dev — font optimization, LCP, CLS
- GitHub issues oficiales — Astro #8849 (`client:visible` zero-height), Tailwind #18237

### Secondary (MEDIUM confidence)
- Codrops Feb 2026 — GSAP + Three.js + Astro real-world
- Community benchmarks — Three.js performance tips, grain overlay patterns

### Tertiary (LOW confidence)
- Números de performance de Spline (artículo único, sin benchmark oficial)
- Licencia GSAP free post-adquisición (fuentes de comunidad)

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
