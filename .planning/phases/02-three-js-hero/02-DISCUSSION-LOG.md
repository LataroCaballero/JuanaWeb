# Phase 2: Three.js Hero - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-03-25
**Phase:** 02-three-js-hero
**Mode:** discuss
**Areas discussed:** Logo geometry source, Material & apariencia 3D, Animación idle, Hero layout composition, Hero background

## Areas Discussed

### Logo Geometry Source

| Question | User Answer |
|----------|-------------|
| ¿Cómo resolvemos el blocker del logo SVG? | SVG file limpio (Recomendado) |

Decision: Crear `src/assets/smiley-logo.svg` con `<path>` limpios, cargado con `THREE.SVGLoader` y extruido con `THREE.ExtrudeGeometry`.

### Material & Apariencia 3D

| Question | User Answer |
|----------|-------------|
| ¿Cómo se ve el logo extruído en 3D? | Electric Blue metálico (shiny) |

Decision: `MeshStandardMaterial` con `color: #0055ff`, `metalness: 0.7`, `roughness: 0.2`. Chrome azul premium.

### Animación Idle

| Question | User Answer |
|----------|-------------|
| ¿Qué hace el logo cuando el visitor llega al hero? | Float + wobble (Recomendado) |

Decision: Flotación vertical suave (sine wave Y) + rotación lenta en eje Y. Sin animación de entrada. Pausa bajo `prefers-reduced-motion`.

### Hero Layout Composition

| Question | User Answer / Notes |
|----------|---------------------|
| ¿Cómo se compone el hero visualmente? | (Custom answer via notes) |

User response: "quiero que en desktop este el h1 a la izquierda y el logo a la derecha un poquito superpuesto y en mobile primero el h1 y debajo el logo un poco supuerpuesto"

Decision:
- Desktop: grid 2 columnas. H1 izq, canvas der, con negative margin para que el logo invada el espacio del h1 levemente.
- Mobile: stack vertical. H1 arriba, canvas abajo, con margin-top negativo para que el logo suba sobre el headline.

### Hero Background

| Question | User Answer |
|----------|-------------|
| ¿Fondo oscuro puro o tratamiento adicional? | Fondo oscuro puro + grain overlay (Recomendado) |

Decision: `#131313` puro con el grain overlay de Phase 1. Sin foto placeholder. Fotos reales en Phase 4.

## Corrections Made

No corrections — todas las decisiones fueron confirmadas en la primera iteración.

## Blockers Surfaced

- Logo SVG no existía. Resuelto en discusión: se crea como paso 1 del plan (D-01, D-02).
