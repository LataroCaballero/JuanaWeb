# Roadmap: Juana House — Landing Page

## Overview

La landing de Juana House se construye en cinco fases con dependencias duras entre ellas. La foundation de Tailwind v4 debe existir antes de cualquier pixel. El hero 3D se valida antes de construir las secciones para no descubrir problemas de LCP al final. Las secciones de contenido se arman sobre HTML estático puro una vez que el canvas Three.js está estable. Motion e imágenes son un enhancement layer que apunta a DOM nodes que ya existen. El deploy y el audit de Lighthouse cierran el ciclo — solo tiene sentido medirlos en la URL de Vercel, no en localhost.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Design System** - Scaffold Astro + Tailwind v4 con tokens completos, fonts self-hosted, BaseLayout con dark mode y grain overlay
- [ ] **Phase 2: Three.js Hero** - Logo smiley 3D animado con IntersectionObserver, LCP anchor en h1 estático, CLS prevention
- [ ] **Phase 3: Content Sections** - Nav flotante, marquee CSS, historia editorial, ubicaciones con horarios, footer
- [ ] **Phase 4: Motion & Image Pipeline** - GSAP ScrollTrigger sobre HTML existente, todas las imágenes a WebP via Astro Image
- [ ] **Phase 5: Deploy & Audit** - Static deploy en Vercel, Lighthouse Mobile en URL real

## Phase Details

### Phase 1: Foundation & Design System
**Goal**: El scaffold del proyecto funciona con todos los tokens visuales de la marca disponibles como Tailwind utilities
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04
**Success Criteria** (what must be TRUE):
  1. `npm run build` completa sin errores y `npm run dev` levanta el servidor
  2. Electric Blue `#0055ff` es visible en los computed styles de DevTools (confirma que Tailwind v4 tokens funcionan, no v3)
  3. Las fuentes Space Grotesk y Work Sans cargan desde `/fonts/` local — DevTools Network no muestra requests a fonts.googleapis.com
  4. El grain overlay aparece como textura visual sobre el fondo oscuro sin causar jank en scroll (tile WebP, no feTurbulence)
**Plans:** 2 plans
Plans:
- [ ] 01-P01-scaffold-tokens.PLAN.md — Scaffold Astro 5 + Tailwind v4 with complete @theme token system
- [ ] 01-P02-layout-fonts-grain.PLAN.md — Grain generation, BaseLayout with font preloads, smoke-test page
**UI hint**: yes

### Phase 2: Three.js Hero
**Goal**: El visitante ve el logo smiley en 3D animado y el headline de marca en los primeros 3 segundos sin bloquear el LCP
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04
**Success Criteria** (what must be TRUE):
  1. El logo smiley rota en 3D al entrar en el viewport — el canvas se inicializa solo cuando el hero es visible (IntersectionObserver, no client:visible)
  2. Lighthouse Mobile identifica el `<h1>` "COFFEE ON YOUR WAY" como LCP element — no el canvas Three.js
  3. No hay layout shift al cargar el hero — el espacio del canvas está reservado con aspect-ratio antes de que corra cualquier JS
  4. Abrir y cerrar la página múltiples veces no produce memory leaks de GPU (dispose + forceContextLoss implementados)
**Plans**: TBD
**UI hint**: yes

### Phase 3: Content Sections
**Goal**: El sitio completo es navegable con todo el contenido de marca real — historia, ubicaciones con horarios, marquee, footer
**Depends on**: Phase 2
**Requirements**: NAV-01, HIST-01, HIST-02, MARQ-01, MARQ-02, UBIC-01, UBIC-02, UBIC-03, FOOT-01
**Success Criteria** (what must be TRUE):
  1. La nav flotante activa el efecto glassmorphism (backdrop-blur visible) al hacer scroll más de 80px
  2. El marquee se mueve continuamente con las brand phrases sobre fondo Electric Blue — y se detiene cuando el sistema operativo tiene prefers-reduced-motion activo
  3. El visitante puede leer las dos ubicaciones (Iron Man y Cara Sur) con nombre de marca, dirección completa y horarios de operación por día
  4. Las location cards cambian de escala de grises a color al hacer hover sobre ellas
  5. El footer muestra el link a @juana.onyourday, el copyright y el tagline de marca
**Plans**: TBD
**UI hint**: yes

### Phase 4: Motion & Image Pipeline
**Goal**: Todas las animaciones de scroll están activas y todas las imágenes son WebP locales — cero requests externos
**Depends on**: Phase 3
**Requirements**: MOTN-01, MOTN-02, PERF-01, PERF-02
**Success Criteria** (what must be TRUE):
  1. Las secciones Historia y Ubicaciones aparecen con un reveal animado al entrar en el viewport (GSAP ScrollTrigger)
  2. Todas las animaciones GSAP se detienen cuando el sistema operativo tiene prefers-reduced-motion activo
  3. DevTools Network en producción no muestra ningún request a lh3.googleusercontent.com ni a fonts.googleapis.com
  4. Todas las imágenes de contenido cargan como WebP — visible en la columna Type del panel Network
**Plans**: TBD
**UI hint**: yes

### Phase 5: Deploy & Audit
**Goal**: El sitio está en vivo en Vercel y los Core Web Vitals están en verde en la URL de producción
**Depends on**: Phase 4
**Requirements**: PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. La URL de Vercel carga el sitio completo como output estático — sin SSR, sin serverless functions activas
  2. Lighthouse Mobile en la URL de Vercel reporta LCP < 2.5s, TBT < 200ms, CLS = 0
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 0/2 | Planning complete | - |
| 2. Three.js Hero | 0/? | Not started | - |
| 3. Content Sections | 0/? | Not started | - |
| 4. Motion & Image Pipeline | 0/? | Not started | - |
| 5. Deploy & Audit | 0/? | Not started | - |
