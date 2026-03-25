# Phase 2: Three.js Hero - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Logo smiley en 3D animado + headline de marca visibles en los primeros 3 segundos sin bloquear LCP ni producir CLS. El canvas Three.js se inicializa solo cuando entra en viewport (IntersectionObserver). No incluye nav, marquee ni otras secciones — solo el hero.

</domain>

<decisions>
## Implementation Decisions

### Logo Asset

- **D-01:** Crear `src/assets/smiley-logo.svg` con `<path>` limpios (sin `<use>`, sin `<symbol>`): un círculo exterior + dos ojos en forma de flecha. Este SVG se carga con `THREE.SVGLoader` y se extruye con `THREE.ExtrudeGeometry`.
- **D-02:** El SVG se crea manualmente / con edición vectorial antes de implementar el island Three.js. Es el paso 1 del plan — sin él no hay geometría.

### Material 3D

- **D-03:** `MeshStandardMaterial` con `color: #0055ff` (Electric Blue), `metalness: 0.7`, `roughness: 0.2`. Efecto metálico shiny — chrome azul. Coherente con la paleta pero con carácter premium.
- **D-04:** Lighting: una `AmbientLight` tenue + una `DirectionalLight` o `PointLight` posicionada para activar las reflexiones metálicas. Claude decide intensidades y posiciones.
- **D-05:** Extrusion depth: moderado (~8-12px en unidades Three.js). Lo suficiente para percibir el 3D, sin que el logo se vea "pesado".

### Animación Idle

- **D-06:** Float + wobble: flotación vertical suave con `Math.sin(elapsed)` aplicado a `mesh.position.y` (amplitud ~0.05 units, frecuencia lenta). Rotación continua lenta en eje Y (~0.003 rad/frame). Se activa al entrar en viewport, se pausa si `prefers-reduced-motion: reduce`.
- **D-07:** No hay animación de entrada (no fly-in, no scale-up). El logo aparece en posición y empieza a flotar suavemente. La aparición del canvas es suficiente "entrada".

### Hero Layout

- **D-08:** Desktop (≥ md): grid de dos columnas. H1 "COFFEE ON YOUR WAY" ocupa la columna izquierda. Canvas 3D ocupa la columna derecha. El canvas tiene `margin-left: -Xpx` (valor a definir en planning, ~40-60px) para que el logo invada levemente el espacio del h1 — Organic Brutalism, romper el grid.
- **D-09:** Mobile (< md): stack vertical. H1 arriba, canvas 3D debajo. El canvas tiene `margin-top: -Yrem` para que el logo suba levemente sobre el headline — misma idea de superposición pero en eje vertical.
- **D-10:** H1 tipografía: `font-display` (Space Grotesk), `font-bold`, tamaño responsive (`text-[8vw] md:text-[6vw] lg:text-[5rem]`), `uppercase`, `tracking-tight`. Es el LCP element — renderizado en HTML estático, sin JS.

### Hero Background

- **D-11:** Fondo surface puro `#131313` + grain overlay ya implementado en `body::after`. Sin foto, sin textura extra. El logo Electric Blue metálico contrasta fuerte. Las fotos reales llegan en Phase 4.

### Performance & Lifecycle

- **D-12:** IntersectionObserver inicializa el renderer Three.js al entrar en viewport — NO `client:visible` de Astro (no funciona en `.astro` components).
- **D-13:** Canvas con `aspect-ratio` declarado en CSS antes de que cargue el JS — previene CLS (HERO-03).
- **D-14:** `dispose()` en geometrías, materiales, y renderer + `forceContextLoss()` en desmontaje (HERO-04).

### Claude's Discretion

- Tamaño exacto del canvas en vw/vmin
- Extrusion depth exacto (dentro del rango D-05)
- Intensidades y posición de luces
- Pixel amount de la superposición (D-08, D-09)
- Valor de amplitud y frecuencia del float (dentro del estilo D-06)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design System
- `referencias/DESIGN.md` — Sistema visual completo: Electric Blue, Zero Roundedness, Organic Brutalism, materiales
- `referencias/juanaV1.html` — Hero section de referencia (layout editorial, tipografía, composición). Ver sección "Hero Section" para el contexto visual.

### Requirements
- `.planning/REQUIREMENTS.md` §Hero 3D — HERO-01 a HERO-04 (criterios exactos de aceptación para esta fase)
- `.planning/ROADMAP.md` §Phase 2 — Success criteria definitivos: LCP en h1, no CLS, dispose correcto

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/global.css` — Todos los tokens disponibles: `--color-electric: #0055ff`, `--color-surface: #131313`, `--color-on-surface: #e5e2e1`, `--font-display`. El island Three.js consume estas variables CSS o sus valores directamente.
- `src/layouts/BaseLayout.astro` — Layout raíz ya configurado con `class="dark"`, font preloads, y grain overlay. El hero page usa este layout.
- `public/assets/grain.webp` — Grain overlay ya implementado via `body::after` en global.css (z-index: 9999, pointer-events: none). El canvas Three.js debe tener z-index < 9999 para que el grain lo cubra también.

### Established Patterns
- Astro island para interactividad JS: el componente Three.js será un `.astro` con `<script>` inline o un `.ts` importado, con IntersectionObserver para lazy-init.
- NO `client:visible` — no funciona en `.astro` components. Patrón establecido en STATE.md.
- Tailwind v4 con `@tailwindcss/vite` — utilities disponibles en el HTML del hero.

### Integration Points
- `src/pages/index.astro` — Actualmente tiene el smoke test de Phase 1. Phase 2 lo reemplaza con el hero real.
- `src/components/` — El island Three.js vivirá aquí como `HeroCanvas.astro` o similar.
- `astro.config.mjs` — Ya configurado con Tailwind v4; no requiere cambios para Three.js vanilla.

</code_context>

<specifics>
## Specific Ideas

- Layout desktop: h1 izquierda + canvas derecha con superposición negativa (logo invade el espacio del h1). Referencia: Organic Brutalism — "elementos que rompen los bounds del container".
- Layout mobile: h1 arriba + canvas debajo con margin-top negativo (logo sube sobre el texto).
- El logo no tiene animación de entrada — aparece y empieza a flotar directamente. Sutil, no llamativo.
- La superposición es "un poquito" — no agresiva. Suficiente para romper el grid sin hacer ilegible el h1.

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de Phase 2.

</deferred>

---

*Phase: 02-three-js-hero*
*Context gathered: 2026-03-25*
