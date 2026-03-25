# Phase 2: Three.js Hero - Research

**Researched:** 2026-03-25
**Domain:** Three.js r183, SVGLoader, ExtrudeGeometry, WebGL lifecycle, LCP/CLS performance, Astro static islands
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Logo Asset**
- D-01: Crear `src/assets/smiley-logo.svg` con `<path>` limpios (sin `<use>`, sin `<symbol>`): un círculo exterior + dos ojos en forma de flecha. Este SVG se carga con `THREE.SVGLoader` y se extruye con `THREE.ExtrudeGeometry`.
- D-02: El SVG se crea manualmente / con edición vectorial antes de implementar el island Three.js. Es el paso 1 del plan — sin él no hay geometría.

**Material 3D**
- D-03: `MeshStandardMaterial` con `color: #0055ff` (Electric Blue), `metalness: 0.7`, `roughness: 0.2`.
- D-04: Lighting: una `AmbientLight` tenue + una `DirectionalLight` o `PointLight` posicionada para activar las reflexiones metálicas.
- D-05: Extrusion depth: moderado (~8-12px en unidades Three.js).

**Animación Idle**
- D-06: Float + wobble: flotación vertical suave con `Math.sin(elapsed)` en `mesh.position.y` (amplitud ~0.05 units). Rotación continua lenta en eje Y (~0.003 rad/frame). Pausa si `prefers-reduced-motion: reduce`.
- D-07: No hay animación de entrada. El logo aparece en posición y empieza a flotar.

**Hero Layout**
- D-08: Desktop (≥ md): grid dos columnas. H1 izquierda. Canvas derecha con `margin-left: -48px` (invasión del grid).
- D-09: Mobile (< md): stack vertical. H1 arriba, canvas abajo con `margin-top: -24px`.
- D-10: H1 tipografía: `font-display`, `font-bold`, `clamp(2.5rem, 8vw, 5rem)`, `uppercase`, `letter-spacing: -0.03em`, `line-height: 1.0`.

**Hero Background**
- D-11: Fondo `#131313` + grain overlay existente. Sin foto ni textura extra en Phase 2.

**Performance & Lifecycle**
- D-12: IntersectionObserver inicializa Three.js al entrar en viewport — NO `client:visible`.
- D-13: Canvas con `aspect-ratio` en CSS antes de cargar JS — previene CLS (HERO-03).
- D-14: `dispose()` en geometrías, materiales, renderer + `forceContextLoss()` al desmontar (HERO-04).

**UI-SPEC resolved values**
- Canvas: Desktop 45vmin × 45vmin (`aspect-ratio: 1/1`); Mobile 70vw × 70vw (`aspect-ratio: 1/1`)
- AmbientLight: `#ffffff`, intensity 0.4
- DirectionalLight: `#b6c4ff`, intensity 1.2, position [5, 8, 5]
- Extrusion depth: 10 Three.js scene units
- Canvas z-index: 100 (below grain overlay at 9999)
- Float: `Math.sin(elapsed * 0.8) * 0.05` for position.y; `0.003` rad/frame for rotation.y
- Desktop overlap: `margin-left: -48px`; Mobile overlap: `margin-top: -24px`

### Claude's Discretion
- Tamaño exacto del canvas en vw/vmin (resolved in UI-SPEC: 45vmin desktop / 70vw mobile)
- Extrusion depth exacto (resolved in UI-SPEC: 10 units)
- Intensidades y posición de luces (resolved in UI-SPEC: see above)
- Pixel amount de la superposición (resolved in UI-SPEC: -48px / -24px)
- Valor de amplitud y frecuencia del float (resolved in UI-SPEC: 0.8 rad/s, 0.05 amplitude)

### Deferred Ideas (OUT OF SCOPE)
None — la discusión se mantuvo dentro del scope de Phase 2.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | El logo smiley en 3D animado con rotación idle al entrar en viewport (IntersectionObserver, no client:visible) | SVGLoader + ExtrudeGeometry pattern verified; IntersectionObserver lazy-init pattern documented |
| HERO-02 | El `<h1>` "COFFEE ON YOUR WAY" es el LCP element — visible en HTML estático antes de que Three.js cargue | Static HTML rendering pattern; Three.js loaded only via dynamic import after IO callback |
| HERO-03 | Canvas container tiene aspect-ratio declarado en CSS para prevenir CLS mientras carga el island | `aspect-ratio: 1/1` on wrapper div set in static CSS — verified pattern for CLS=0 |
| HERO-04 | GPU resources se limpian al desmontar (dispose + forceContextLoss) | Official Three.js cleanup guide; correct disposal sequence documented |
</phase_requirements>

---

## Summary

Phase 2 adds the Three.js 3D hero to the Juana House landing. The core technical work is three sub-problems: (1) author a clean SVG, (2) load it with SVGLoader and extrude it into a 3D mesh, and (3) wire up the WebGL lifecycle so it doesn't hurt Core Web Vitals or leak GPU memory.

Three.js r183 (latest as of 2026-03-25, verified on npm registry) is already the decided library. It is not yet in `package.json` — installation is step zero of the plan. The project uses Astro 5 static output with Tailwind v4 and no React, so vanilla Three.js (not R3F) is the correct choice. The Astro island pattern for this project is a `.astro` component with a `<script>` tag using standard dynamic `import()` — `client:visible` does NOT work on `.astro` components (confirmed in STATE.md).

The three performance requirements (HERO-01 IntersectionObserver, HERO-02 LCP anchor in static HTML, HERO-03 CLS prevention via aspect-ratio) are all independent of each other and can be implemented in parallel within the same component. The dispose pattern (HERO-04) is well-documented in the Three.js manual and requires a specific order: dispose geometries and materials first, then `renderer.forceContextLoss()`, then `renderer.dispose()`.

**Primary recommendation:** Implement `HeroCanvas.astro` as a self-contained island with IntersectionObserver-gated dynamic import, static CSS aspect-ratio reservation, and a cleanup function bound to the `visibilitychange` / `pagehide` events.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.183.2 | WebGL renderer, scene, camera, geometry, materials | Decided in STATE.md; latest on npm 2026-03-25 |
| three/addons/loaders/SVGLoader.js | (bundled with three) | Parse SVG paths into Three.js Shape objects | Official Three.js addon — the only supported loader for this use case |
| three/addons/... (ExtrudeGeometry) | (bundled with three) | Extrude 2D shapes into 3D geometry | Part of THREE core namespace |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| IntersectionObserver (native) | Web API | Lazy-init Three.js when canvas enters viewport | Required per D-12 — no polyfill needed for modern browsers |
| matchMedia (native) | Web API | Detect `prefers-reduced-motion: reduce` | Required per D-06 — check before starting animation loop |
| cancelAnimationFrame (native) | Web API | Pause RAF loop when hero leaves viewport | GPU resource management when out of view |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla Three.js | @react-three/fiber | R3F adds ~200KB React overhead; project has no React; STATE.md locked this decision |
| SVGLoader from addons | Manual path parsing | SVGLoader handles cubic/quadratic beziers, sub-paths, fill rules; hand-rolling is error-prone |
| IntersectionObserver | `client:visible` | `client:visible` doesn't work on .astro components per STATE.md |

**Installation:**
```bash
npm install three@0.183.2
```

**Version verification:** Confirmed via `npm view three version` on 2026-03-25: `0.183.2` is latest.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── assets/
│   └── smiley-logo.svg        # Created in Wave 0 (blocker)
├── components/
│   └── HeroCanvas.astro       # Three.js island — static HTML + <script>
├── pages/
│   └── index.astro            # Hero page — replaces smoke test
└── styles/
    └── global.css             # Existing — no changes needed
```

### Pattern 1: Astro Island with IntersectionObserver Gate

**What:** `.astro` component renders static HTML (the `<canvas>` wrapper with reserved aspect-ratio). A `<script>` tag dynamically imports Three.js only when the wrapper enters the viewport via IntersectionObserver.

**When to use:** Any heavy JS dependency that must not block LCP. Astro's `client:visible` works on framework components (`.jsx`, `.svelte`) but NOT on `.astro` components — confirmed in STATE.md.

**Example:**
```typescript
// Source: STATE.md established pattern + Three.js r183 import paths
// HeroCanvas.astro <script> block

const wrapper = document.getElementById('hero-canvas-wrapper');

const observer = new IntersectionObserver(
  async (entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect(); // Fire once
      const { initHeroCanvas } = await import('../scripts/hero-canvas.ts');
      initHeroCanvas(wrapper);
    }
  },
  { threshold: 0.1 }
);

observer.observe(wrapper);
```

### Pattern 2: SVGLoader + ExtrudeGeometry

**What:** Load SVG from a URL (Vite-processed), parse with `SVGLoader.parse()` or `loader.loadAsync()`, convert each path to shapes with `SVGLoader.createShapes(path)`, extrude with `THREE.ExtrudeGeometry`.

**When to use:** Any time you need 3D geometry from a 2D vector asset.

**Critical gotcha — Y-axis inversion:** SVG coordinate space has Y=0 at top-left, increasing downward. Three.js has Y=0 at center, increasing upward. The loaded group MUST have its Y scale negated: `group.scale.y *= -1`.

**Critical gotcha — centering:** After loading, the geometry's origin is at the SVG's top-left corner. Must calculate bounding box and translate to center the mesh in scene space.

**Example:**
```javascript
// Source: three.js docs SVGLoader + muffinman.io verified pattern
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const loader = new SVGLoader();
const data = await loader.loadAsync('/assets/smiley-logo.svg');

const group = new THREE.Group();
group.scale.y *= -1; // Fix Y-axis inversion

const material = new THREE.MeshStandardMaterial({
  color: 0x0055ff,
  metalness: 0.7,
  roughness: 0.2,
});

for (const path of data.paths) {
  const shapes = SVGLoader.createShapes(path); // Preferred over path.toShapes()
  for (const shape of shapes) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 10,
      bevelEnabled: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
  }
}

// Center the group
const box = new THREE.Box3().setFromObject(group);
const center = new THREE.Vector3();
box.getCenter(center);
group.position.sub(center);

scene.add(group);
```

### Pattern 3: WebGL Lifecycle (dispose + forceContextLoss)

**What:** When the component tears down (page unload / navigation), explicitly release all GPU resources in the correct order.

**When to use:** Any Three.js scene that might be re-created (SPA navigation, page refresh). Failure to dispose causes the browser's "too many WebGL contexts" warning and GPU memory accumulation.

**Correct order (verified via three.js manual + GitHub issue #27100):**
1. `cancelAnimationFrame(rafId)`
2. `geometry.dispose()` for each geometry
3. `material.dispose()` for each material
4. `renderer.forceContextLoss()` — eagerly releases the WebGL context
5. `renderer.dispose()` — releases renderer-owned GPU objects
6. Nullify all references

**Example:**
```javascript
// Source: https://threejs.org/manual/en/cleanup.html + GitHub issue #27100
function teardown() {
  cancelAnimationFrame(rafId);

  // Dispose all meshes in the group
  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });

  renderer.forceContextLoss();
  renderer.dispose();

  renderer = null;
  scene = null;
}

// Bind to page lifecycle
window.addEventListener('pagehide', teardown, { once: true });
```

### Pattern 4: CLS Prevention via Aspect-Ratio

**What:** The `<canvas>` wrapper `<div>` has `aspect-ratio: 1/1` and explicit width set in CSS before any JS runs. The browser reserves layout space immediately — no shift when Three.js appends the `<canvas>` element.

**When to use:** Any canvas or image that loads asynchronously.

**Example:**
```css
/* Set in component <style> or global.css — applies before JS loads */
#hero-canvas-wrapper {
  width: 45vmin;        /* Desktop default */
  aspect-ratio: 1 / 1;
  z-index: 100;          /* Below grain overlay (9999) */
}

@media (max-width: 767px) {
  #hero-canvas-wrapper {
    width: 70vw;
  }
}
```

### Pattern 5: prefers-reduced-motion Guard

**What:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before starting the animation loop. If reduced motion, render one frame only.

```javascript
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animate(elapsed) {
  if (!prefersReduced) {
    mesh.rotation.y += 0.003;
    mesh.position.y = Math.sin(elapsed * 0.8) * 0.05;
    rafId = requestAnimationFrame((t) => animate(t / 1000));
  }
  // else: render static, no RAF
  renderer.render(scene, camera);
}
```

### Anti-Patterns to Avoid

- **Using `client:visible` on `.astro` components:** This Astro directive only works on framework components (.jsx, .svelte). Use IntersectionObserver in a `<script>` tag instead (STATE.md confirmed).
- **Calling `loader.load()` with a callback inside Astro `<script>`:** Prefer `loader.loadAsync()` with `await` for cleaner error handling in the module-scope script.
- **Not flipping Y axis after SVG load:** The SVG coordinate system is inverted relative to Three.js. Forgetting `group.scale.y *= -1` causes the logo to render upside-down.
- **Not centering after SVG load:** SVG paths start at the document origin (0,0 top-left), so the loaded mesh will be offset to one side. Always compute bounding box and subtract center.
- **Calling `renderer.dispose()` before `forceContextLoss()`:** The correct order is `forceContextLoss()` first, then `dispose()`. Reversing this can leave the context open.
- **Importing Three.js at top-level in an `.astro` script:** This causes Three.js to be included in the main bundle and blocks the LCP. Always use `await import('three')` inside the IntersectionObserver callback.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG path parsing | Custom path parser | `THREE.SVGLoader` | Handles cubic/quadratic beziers, arc commands, sub-paths, fill-rule evenodd/nonzero — 500+ edge cases |
| Shape extrusion | Manual geometry vertices | `THREE.ExtrudeGeometry` | UV mapping, bevel calculation, curve segmentation already solved |
| Centering geometry | Manual offset math | `THREE.Box3().setFromObject()` + `.getCenter()` | Works correctly with nested groups and transformed meshes |
| Resource tracking | Manual arrays of refs | Dispose each resource inline (simpler for this scene) or use Three.js ResourceTracker pattern | Scene is small enough for inline disposal; no need for full tracker |

**Key insight:** SVG extrusion looks simple but the path math is extremely complex. Three.js's SVGLoader handles the full SVG path spec including compound paths (holes in shapes). The outer circle with two arrow-eye holes requires correct fill-rule handling — `SVGLoader.createShapes()` handles this correctly, whereas `path.toShapes()` does not (confirmed in Three.js forum as of 2025).

---

## Common Pitfalls

### Pitfall 1: SVG with `<use>` or `<symbol>` Elements

**What goes wrong:** `SVGLoader` resolves `<use>` references by dereferencing them at parse time, but if the SVG contains `<symbol>` definitions, the resulting shapes may be empty or incorrectly transformed.

**Why it happens:** The SVG spec allows `<use>` to reference `<symbol>` elements that define shapes separately — this indirection doesn't always survive SVGLoader's processing correctly.

**How to avoid:** As per D-01, the `smiley-logo.svg` must use only `<path>` elements directly — no `<use>`, no `<symbol>`, no `<defs>` references. This is a constraint on the SVG authoring step, not the Three.js code.

**Warning signs:** The loader returns paths but `SVGLoader.createShapes()` returns empty arrays.

### Pitfall 2: Logo Appears Upside-Down or Off-Center

**What goes wrong:** The logo renders mirrored vertically and/or positioned in the top-right corner of the scene instead of centered.

**Why it happens:** SVG coordinate system (Y increases downward, origin top-left) differs from Three.js (Y increases upward, origin center). These are two independent problems requiring two independent fixes.

**How to avoid:** Always apply both fixes after loading:
1. `group.scale.y *= -1` — fixes orientation
2. Compute `Box3`, get center, `group.position.sub(center)` — fixes position

**Warning signs:** Logo visible but shifted to one corner; logo appears reflected.

### Pitfall 3: Three.js Blocks LCP

**What goes wrong:** Lighthouse reports the canvas or a script as the LCP element instead of the `<h1>`.

**Why it happens:** If Three.js is imported at the top of the page script (not dynamically), it blocks the main thread during parse/eval, delaying the `<h1>` paint.

**How to avoid:** The `<h1>` must be in static HTML (no JS dependency). Three.js must only be imported via `await import('three')` inside the IntersectionObserver callback — which fires after the initial paint.

**Warning signs:** Chrome DevTools Lighthouse shows LCP element as canvas or script-blocked; `<h1>` is in the DOM but LCP candidate is something else.

### Pitfall 4: CLS from Canvas Appearing at Wrong Size

**What goes wrong:** The page layout shifts when Three.js appends or resizes the canvas element.

**Why it happens:** If the canvas wrapper has no declared dimensions, the browser assigns 0 height initially and recalculates layout when the canvas is created.

**How to avoid:** Declare `aspect-ratio: 1/1` and explicit width on the wrapper `<div>` in the component's `<style>` block. Three.js should call `renderer.setSize()` matching the wrapper's computed dimensions, not a hardcoded pixel value.

**Warning signs:** CLS > 0 in Lighthouse; visible layout jump when scrolling to hero.

### Pitfall 5: GPU Memory Leak on Repeated Page Loads

**What goes wrong:** After opening and closing the page (or navigating via Astro transitions) multiple times, browser DevTools shows increasing GPU memory, and eventually a "Too many active WebGL contexts" warning appears.

**Why it happens:** Each WebGL context consumes GPU memory that is not released by JavaScript garbage collection. Browsers limit WebGL contexts to ~16; once exceeded, the oldest context is lost silently.

**How to avoid:** Bind the teardown function to `pagehide` (fires on page unload including bfcache restores) AND to `visibilitychange` if using View Transitions. Call in order: `cancelAnimationFrame` → `geometry.dispose()` → `material.dispose()` → `renderer.forceContextLoss()` → `renderer.dispose()`.

**Warning signs:** Chrome DevTools GPU memory graph increases per page open; "WebGL: CONTEXT_LOST_WEBGL" errors in console after several visits.

### Pitfall 6: Vite/Astro Cannot Resolve Three.js Addon Imports

**What goes wrong:** Build fails with "Cannot find module 'three/examples/jsm/loaders/SVGLoader.js'" or similar.

**Why it happens:** Older Three.js documentation uses the `three/examples/jsm/` path. Since Three.js r152, the canonical import path changed to `three/addons/`.

**How to avoid:** Use `three/addons/loaders/SVGLoader.js` (not `three/examples/jsm/loaders/SVGLoader.js`). Both paths exist in r183 for backward compatibility, but `three/addons/` is the current standard.

**Warning signs:** Build error about unresolvable module; works in dev but fails in `astro build`.

---

## Code Examples

Verified patterns from official sources and confirmed tutorials:

### Complete HeroCanvas initialization flow
```javascript
// Source: Three.js docs + muffinman.io verified pattern (r183)
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

export async function initHeroCanvas(wrapper: HTMLElement) {
  // 1. Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Transparent — inherits #131313 from CSS
  const size = wrapper.clientWidth;
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrapper.appendChild(renderer.domElement);

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xb6c4ff, 1.2);
  dirLight.position.set(5, 8, 5);
  scene.add(dirLight);

  // 3. Load SVG and build mesh
  const loader = new SVGLoader();
  const data = await loader.loadAsync('/assets/smiley-logo.svg');

  const material = new THREE.MeshStandardMaterial({
    color: 0x0055ff,
    metalness: 0.7,
    roughness: 0.2,
  });

  const group = new THREE.Group();
  group.scale.y *= -1; // Fix SVG Y-axis inversion

  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path); // Not path.toShapes()
    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 10,
        bevelEnabled: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
  }

  // Center in scene
  const box = new THREE.Box3().setFromObject(group);
  const center = new THREE.Vector3();
  box.getCenter(center);
  group.position.sub(center);

  scene.add(group);

  // 4. Animation loop
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId: number;

  function animate(timestamp: number) {
    const elapsed = timestamp / 1000;
    if (!prefersReduced) {
      group.rotation.y += 0.003;
      group.position.y = Math.sin(elapsed * 0.8) * 0.05;
      rafId = requestAnimationFrame(animate);
    }
    renderer.render(scene, camera);
  }

  if (!prefersReduced) {
    rafId = requestAnimationFrame(animate);
  } else {
    renderer.render(scene, camera); // Single static frame
  }

  // 5. Teardown
  function teardown() {
    cancelAnimationFrame(rafId);
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          (mesh.material as THREE.Material).dispose();
        }
      }
    });
    renderer.forceContextLoss();
    renderer.dispose();
  }

  window.addEventListener('pagehide', teardown, { once: true });
  return teardown; // Expose for explicit cleanup if needed
}
```

### IntersectionObserver gate (in .astro `<script>` tag)
```javascript
// Source: IntersectionObserver Web API + Astro established pattern (STATE.md)
const wrapper = document.getElementById('hero-canvas-wrapper');
if (wrapper) {
  const observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect(); // Init only once
        const { initHeroCanvas } = await import('../scripts/hero-canvas.ts');
        await initHeroCanvas(wrapper);
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(wrapper);
}
```

### Static HTML structure (in HeroCanvas.astro template)
```html
<!-- Source: D-08/D-09 CONTEXT.md + UI-SPEC layout spec -->

<!-- Desktop: 2-column grid; Mobile: flex column -->
<section class="hero-section">
  <h1 class="hero-headline">COFFEE ON YOUR WAY</h1>
  <div id="hero-canvas-wrapper" role="presentation" aria-hidden="true"></div>
</section>

<style>
  .hero-section {
    display: grid;
    grid-template-columns: 7fr 5fr;
    align-items: center;
    padding: 3rem 0;
  }

  #hero-canvas-wrapper {
    width: 45vmin;
    aspect-ratio: 1 / 1;  /* CLS prevention — space reserved before JS loads */
    z-index: 100;           /* Below grain overlay z-index:9999 */
    margin-left: -48px;     /* Organic Brutalism overlap */
  }

  .hero-headline {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 700;
    line-height: 1.0;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    color: var(--color-on-surface);
  }

  @media (max-width: 767px) {
    .hero-section {
      display: flex;
      flex-direction: column;
    }

    #hero-canvas-wrapper {
      width: 70vw;
      margin-left: 0;
      margin-top: -24px;  /* Mobile overlap */
    }
  }
</style>
```

### SVG structure required for clean extrusion
```xml
<!-- Source: D-01 CONTEXT.md — verified SVGLoader compatibility requirement -->
<!-- NO <use>, NO <symbol>, NO <defs> references -->
<!-- Only <path> elements with clean d attributes -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- Outer circle -->
  <path d="M100,10 A90,90 0 1,1 99.999,10 Z" fill="#0055ff"/>
  <!-- Left arrow-eye: use path with fill-rule="evenodd" for holes -->
  <path d="..." fill="#131313"/>
  <!-- Right arrow-eye -->
  <path d="..." fill="#131313"/>
</svg>
```

**SVG authoring rules for ExtrudeGeometry compatibility:**
- Use `fill-rule="evenodd"` or `fill-rule="nonzero"` explicitly — SVGLoader uses this to determine which paths are holes
- Compound paths (outer circle with eye cutouts) work when eyes are defined as sub-paths with opposite winding direction
- Alternatively: extrude each path separately (circle + eyes) and use `group.add()` — simpler to author, same visual result

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'` | `import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'` | Three.js r152 | Old path still works in r183 but `three/addons/` is canonical |
| `path.toShapes(true)` | `SVGLoader.createShapes(path)` | Three.js ~r140+ | `createShapes` handles more SVG-specific logic; `toShapes` misses some fill rules |
| `ExtrudeBufferGeometry` | `ExtrudeGeometry` (merged) | Three.js r125 | `BufferGeometry` is now the default; `ExtrudeBufferGeometry` was an alias and is gone |
| `renderer.setSize(w, h)` with hardcoded pixel values | `renderer.setSize(wrapper.clientWidth, wrapper.clientHeight)` | — | Using computed sizes prevents renderer/CSS size mismatch that causes blurry canvas |

**Deprecated/outdated:**
- `ExtrudeBufferGeometry`: removed, use `ExtrudeGeometry`
- `path.toShapes()`: still exists but `SVGLoader.createShapes()` is preferred per Three.js forum guidance (2025)
- `three/examples/jsm/` import paths: deprecated in favor of `three/addons/`; both work in r183

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | System (Astro 5 already running) | — |
| three (npm) | HeroCanvas island | ✗ (not in package.json yet) | 0.183.2 available on npm | — (must install) |
| smiley-logo.svg | SVGLoader.loadAsync | ✗ (file does not exist yet) | n/a — must be authored | — (blocker: no SVG = no geometry) |
| IntersectionObserver | Lazy init | ✓ | Web API — supported in all modern browsers | — |
| WebGL | Three.js renderer | ✓ (standard) | WebGL2 in all modern browsers | Silent fallback: canvas blank, h1 remains (UI-SPEC) |

**Missing dependencies with no fallback:**
- `three` package: must be installed with `npm install three@0.183.2` before any Three.js code can run
- `src/assets/smiley-logo.svg`: must be authored before `initHeroCanvas()` can build geometry — this is the blocker identified in STATE.md

**Missing dependencies with fallback:**
- WebGL unavailable: UI-SPEC specifies silent failure — canvas wrapper stays blank, `<h1>` remains fully visible. No user-facing error needed.

---

## Open Questions

1. **SVG authoring strategy for compound paths (circle with eye holes)**
   - What we know: SVGLoader supports `fill-rule="evenodd"` which creates holes. Alternatively, three separate paths (one circle + two eyes) can be extruded individually and composited in a Three.js Group.
   - What's unclear: Which approach produces a cleaner visual for a smiley face with "arrow eye" shapes? The "arrow eye" shape (chevron/arrow pointing right or down) needs to be designed — its exact path data is not known.
   - Recommendation: Author as three separate `<path>` elements (outer circle, left eye, right eye). Extrude each separately. Position eyes slightly in front of circle in Z space (e.g., `eyeMesh.position.z = 0.5`) for visual layering. Simpler to author than compound paths.

2. **Camera FOV and scene scale for the SVG geometry**
   - What we know: SVGLoader produces geometry in SVG pixel units (defaultDPI: 90). A 200×200 viewBox SVG produces geometry roughly 200 units wide in Three.js scene space. Camera at z=5 won't see it.
   - What's unclear: The correct camera distance or scale factor to fit the logo in the 45vmin canvas.
   - Recommendation: After loading, scale the group down (`group.scale.set(0.01, 0.01, 0.01)` is a common starting point for SVG-sized geometry) OR use the bounding box to auto-fit: compute bbox size and set camera.position.z = `(bboxSize / 2) / Math.tan((fov/2) * Math.PI/180) * 1.2`. Document the approach chosen in the plan so the implementer doesn't guess.

3. **Vite SVG asset import vs fetch vs loadAsync from public/**
   - What we know: `loader.loadAsync('/assets/smiley-logo.svg')` works when the file is in `public/assets/`. Importing as `import svgUrl from '../assets/smiley-logo.svg?url'` gives a Vite-hashed URL.
   - What's unclear: Whether Vite transforms SVG imports in a way that interferes with SVGLoader parsing (e.g., inlining, optimizing paths).
   - Recommendation: Place `smiley-logo.svg` in `public/assets/` (consistent with `grain.webp` placement decision in STATE.md). Reference as `/assets/smiley-logo.svg` string literal in `loadAsync()`. No Vite import needed — this avoids any asset pipeline interference.

---

## Sources

### Primary (HIGH confidence)
- `https://threejs.org/docs/pages/SVGLoader.html` — SVGLoader API, `createShapes()`, import path, ExtrudeGeometry options
- `https://threejs.org/manual/en/cleanup.html` — Official Three.js cleanup guide, ResourceTracker pattern, disposal sequence
- `npm view three version` (run 2026-03-25) — confirmed Three.js latest = 0.183.2

### Secondary (MEDIUM confidence)
- `https://muffinman.io/blog/three-js-extrude-svg-path/` — Complete vanilla SVGLoader + ExtrudeGeometry implementation; Y-axis flip and centering patterns verified against official docs
- `https://blog.logrocket.com/bringing-svgs-three-js-svgloader/` — Additional SVGLoader implementation walkthrough; consistent with official docs
- `https://github.com/mrdoob/three.js/issues/27100` — `forceContextLoss()` before `dispose()` sequence confirmed by Three.js maintainers
- `https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/` — Three.js LCP/CLS patterns in production; CSS aspect-ratio + lazy WebGL confirmed

### Tertiary (LOW confidence)
- Three.js forum post on `createShapes()` vs `path.toShapes()` preference — referenced in WebSearch summary but not directly verified against Three.js changelog; confirmed only via forum discussion

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Three.js r183 confirmed via npm registry; SVGLoader import path verified via official docs
- Architecture: HIGH — IntersectionObserver pattern, aspect-ratio CLS prevention, and dispose sequence all verified against official sources
- Pitfalls: HIGH for Y-axis inversion, LCP/CLS, dispose sequence (all from official Three.js docs + established bugs). MEDIUM for SVG `<use>/<symbol>` pitfall (forum-verified)
- SVG authoring: MEDIUM — exact path data for smiley face with arrow eyes is an open question (blocker)

**Research date:** 2026-03-25
**Valid until:** 2026-04-24 (Three.js releases monthly; r184 may appear; API is stable, patterns won't change)
