# Juana House — Landing Page

## What This Is

Landing page para Juana House, una cafetería móvil de San Juan, Argentina con identidad "Urban Nomad Editorial". El sitio tiene un objetivo de marca: que quien entre conozca quiénes son, sienta su carácter, y sepa dónde encontrarlos. No es un e-commerce ni un sistema de pedidos — es una vitrina de identidad.

## Core Value

El visitante debe sentir la marca en los primeros 3 segundos — el logo 3D animado, el Electric Blue, la tipografía brutal. Todo lo demás viene después.

## Requirements

### Validated

- [x] Design system estricto: Electric Blue #0055ff, Organic Brutalism, Space Grotesk, Work Sans, 0px radius, sin bordes de línea — *Validated in Phase 01: foundation-design-system*
- [x] Grain overlay y texturas propias del sistema visual — *Validated in Phase 01: foundation-design-system*
- [x] Sección "Nuestra historia" / Tribu Nomade — editorial layout con copy de la narrativa nómade — *Validated in Phase 03: content-sections*
- [x] Sección Ubicaciones — Iron Man (San Juan) + Cara Sur (Barreal) con CTA a Instagram (per D-09) — *Validated in Phase 03: content-sections*
- [x] Marquee animado con brand phrases, pausa con prefers-reduced-motion — *Validated in Phase 03: content-sections*
- [x] Nav flotante con glassmorphism al scroll — *Validated in Phase 03: content-sections*
- [x] Footer con Instagram, copyright y tagline — *Validated in Phase 03: content-sections*

### Active

- [ ] Hero con logo 3D animado (smiley con ojos-flecha, identidad de marca central)
- [ ] Sección Menú — vistazo de productos con precios
- [ ] Motion: scroll reveals en Historia y Ubicaciones (GSAP ScrollTrigger)
- [ ] Performance-first: carga ultra rápida en Vercel
- [ ] Soporte óptimo para animaciones y 3D (arquitectura de islands / lazy loading)
- [ ] Responsive: mobile-first

### Out of Scope

- Sistema de pedidos online — no es el objetivo de v1
- Auth / login de usuarios — no aplica para landing
- CMS / panel de administración — contenido estático en v1
- Multi-idioma — el sitio mezcla español/inglés como parte de la identidad de marca

## Context

- La marca tiene identidad muy definida: "TRIBU NOMADE, SIEMPRE EN CASA". Slogan oficial: "COFFEE ON YOUR WAY".
- Logo icónico: smiley circular con ojos en forma de flecha. Aparece como "stamp" en cards y como hero 3D.
- Paleta: Electric Blue (#0055ff / #b6c4ff), surface base (#131313), whites (#e5e2e1).
- Tipografía: Space Grotesk (display, headlines, labels) + Work Sans (body). Pesos Bold/Black solamente.
- Regla de 0px radius — absolutamente ningún borde redondeado excepto el smiley circular del logo.
- Regla "No-Line": la separación de secciones es por cambio de color de fondo, nunca por bordes 1px.
- Glassmorphism solo para nav flotante y overlays (backdrop-blur 20px+).
- Existe un HTML de referencia generado por Google Stitch (referencias/juanaV1.html) que implementa el sistema correctamente con Tailwind CDN — es el punto de partida visual.
- Hay fotos de Instagram que muestran la vibra real: posters editoriales azules, foto de remera con logo, tipografía ALL DAY EVERY DAY en terracota.
- Ubicaciones reales: Del Bono 383 Sur, San Juan, Argentina J5400.
- Instagram: @juana.onyourday (18.8K seguidores).

## Constraints

- **Framework**: Astro — máxima performance estática + islands para el componente 3D. Desplegable en Vercel sin config especial.
- **3D**: Three.js o React Three Fiber (R3F) dentro de un island de Astro — se carga solo cuando entra en viewport.
- **Styling**: Tailwind CSS v4 — mantiene consistencia con el HTML de referencia, genera el menor CSS posible.
- **Deploy**: Vercel, static output.
- **No SSR**: sitio completamente estático — no hay backend, no hay base de datos.
- **Performance**: Core Web Vitals en verde. LCP < 2.5s. Las imágenes deben ser WebP con lazy loading.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro como framework | Islands architecture ideal para aislar el 3D y mantener todo lo demás como HTML estático — mejor performance que Next.js para este caso | — Pending |
| Three.js para el logo 3D | El logo es SVG/2D — extruirlo en 3D con Three.js es directo. R3F agrega overhead de React que no se necesita en el resto del sitio | — Pending |
| Tailwind CSS v4 | Ya usado en el HTML de referencia, sistema de tokens bien definido, output mínimo de CSS | — Pending |
| Contenido estático hardcodeado | v1 no necesita CMS — facilita performance y simplifica el deploy | — Pending |

## Current Milestone: v1.0 Landing Page Completa

**Goal:** Lanzar el sitio completo de Juana House — identidad de marca total, contenido real, performance-first en Astro + Vercel.

**Target features:**
- Hero con logo 3D animado (smiley con ojos-flecha)
- Sección "Nuestra historia" / Tribu Nomade
- Sección Menú con productos y precios
- Sección Ubicaciones (Iron Man + Cara Sur) con horarios
- Design system estricto (Electric Blue, Organic Brutalism, 0px radius, grain overlay)
- Marquee animado con identidad de marca
- Responsive mobile-first + Performance (Astro + Vercel)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 — Phase 03 complete: Nav, Historia, Marquee, Ubicaciones, Footer built as Astro components, wired into index.astro*
