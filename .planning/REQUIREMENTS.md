# Requirements: Juana House — Landing Page

**Defined:** 2026-03-25
**Core Value:** El visitante debe sentir la marca en los primeros 3 segundos — el logo 3D animado, el Electric Blue, la tipografía brutal.

## v1 Requirements

Requirements para el primer lanzamiento. Cada uno mapea a fases del roadmap.

### Setup & Design System (SETUP)

- [x] **SETUP-01**: El proyecto levanta con Astro 5 + Tailwind v4 (`@tailwindcss/vite`), `output: "static"`, y tokens `@theme` completos del sistema visual
- [x] **SETUP-02**: Fonts Space Grotesk (700/900) y Work Sans (500) son self-hosted vía `@fontsource` con preloads en `<head>` (sin Google Fonts CDN)
- [x] **SETUP-03**: `BaseLayout.astro` renderiza `<html class="dark" lang="es">` con `@custom-variant dark` declarado y grain overlay usando WebP tile (no SVG feTurbulence)
- [x] **SETUP-04**: La paleta completa (Electric Blue `#0055ff`, Surface `#131313`, On-Surface `#e5e2e1`), el sistema de 0px radius, y las dos familias tipográficas están disponibles como Tailwind utilities

### Hero 3D (HERO)

- [x] **HERO-01**: El usuario ve el logo smiley en 3D animado con rotación idle al entrar en el viewport del hero (Three.js island cargado vía IntersectionObserver — no client:visible)
- [x] **HERO-02**: El `<h1>` con "COFFEE ON YOUR WAY" es el LCP element — visible en HTML estático antes de que Three.js cargue
- [x] **HERO-03**: El container del canvas Three.js tiene dimensiones reservadas (aspect-ratio) para prevenir CLS mientras carga el island
- [x] **HERO-04**: Los GPU resources de Three.js (geometría, materiales, renderer) se limpian correctamente al desmontar (dispose + forceContextLoss)

### Navegación (NAV)

- [ ] **NAV-01**: El usuario ve una nav flotante que activa glassmorphism (backdrop-blur) al hacer scroll más de 80px

### Historia (HIST)

- [ ] **HIST-01**: El usuario puede leer la historia y filosofía de Juana House (quiénes son, por qué existen, la narrativa nómade) en una sección editorial
- [ ] **HIST-02**: La sección usa layout editorial de full-bleed con imagen del truck + copy de la Tribu Nomade

### Marquee (MARQ)

- [x] **MARQ-01**: El usuario ve un marquee animado con brand phrases ("JUANA HOUSE / JUANATRUCK / NOMAD SOUL / COFFEE ON YOUR WAY") sobre fondo Electric Blue
- [x] **MARQ-02**: El marquee pausa cuando el usuario tiene `prefers-reduced-motion: reduce` activo

### Ubicaciones (UBIC)

- [x] **UBIC-01**: El usuario puede ver las dos ubicaciones (Iron Man — Del Bono 383 Sur, San Juan; Cara Sur — Barreal) con nombre de marca, dirección completa y horarios de operación por día
- [x] **UBIC-02**: Las location cards tienen transición grayscale-to-color on hover que revela la foto del lugar
- [x] **UBIC-03**: El usuario tiene un CTA "Ver dónde estamos hoy" que linkea al Instagram del truck para info de ubicación en tiempo real

### Motion (MOTN)

- [ ] **MOTN-01**: Las secciones principales (Historia, Ubicaciones) tienen scroll reveals vía GSAP ScrollTrigger al entrar en viewport
- [ ] **MOTN-02**: Todas las animaciones GSAP pausan bajo `prefers-reduced-motion: reduce` (vía `gsap.matchMedia()`)

### Performance & Deploy (PERF)

- [ ] **PERF-01**: Todas las imágenes de contenido son WebP con lazy loading usando Astro `<Image />` desde `src/assets/`
- [ ] **PERF-02**: Cero requests a `lh3.googleusercontent.com` o Google Fonts CDN en producción
- [ ] **PERF-03**: Lighthouse Mobile en URL de Vercel: LCP < 2.5s, TBT < 200ms, CLS = 0
- [ ] **PERF-04**: El site está desplegado en Vercel como `output: "static"` (sin SSR, sin serverless functions)

### Footer (FOOT)

- [ ] **FOOT-01**: El usuario puede encontrar el link a Instagram (@juana.onyourday), copyright, y el tagline de marca desde el footer

## v2 Requirements

Diferidos al próximo milestone. Tracked pero fuera del roadmap actual.

### Menú

- **MENU-01**: El usuario puede ver el menú completo con nombres de productos, descriptores y precios en ARS
- **MENU-02**: El layout del menú usa jerarquía tipográfica brutalista (nombre / descriptor / precio)
- **MENU-03**: Hover sobre items del menú produce un flash de Electric Blue border (sin transition, instantáneo)

### Contenido Extendido

- **CONT-01**: El usuario puede ver un grid de 4-6 fotos curadas de Instagram en WebP (sin Instagram API)
- **CONT-02**: La sección de ubicaciones tiene un mapa estático (WebP screenshot de Google Maps) linkeado a Maps app

### Motion Avanzado

- **MOTN-03**: La velocidad del marquee es proporcional a la velocidad de scroll (GSAP ScrollTrigger velocity scrub)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sistema de pedidos online | No es el objetivo — la landing es vitrina de identidad, no e-commerce |
| Auth / login | No aplica para una landing page estática |
| CMS / panel de admin | Contenido estático en v1; considerar Astro Content Collections en v2 |
| Multi-idioma / toggle | El mix español/inglés es parte de la identidad de marca — no es un bug |
| Live Instagram API embed | Agrega JS de terceros (~50KB+), rate limits, dependencia de API históricamente inestable |
| Video background autoplay | Alto costo en bandwidth mobile; iOS restringe autoplay; perjudica LCP |
| Reviews / star ratings | Agrega dependencia de terceros; los 18.8K seguidores de Instagram son el social proof |
| Google Maps iframe a page load | Standard iframe agrega 1-2s de penalización en mobile; diferido a v2 con lazy inject |
| Scrollytelling section (scroll-hijack) | Alta complejidad; override de scroll nativo perjudica mobile y a11y — v2 consideración |

## Traceability

Qué fases cubren qué requirements. Confirmado durante creación del roadmap v1.0.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Complete |
| SETUP-02 | Phase 1 | Complete |
| SETUP-03 | Phase 1 | Complete |
| SETUP-04 | Phase 1 | Complete |
| HERO-01 | Phase 2 | Complete |
| HERO-02 | Phase 2 | Complete |
| HERO-03 | Phase 2 | Complete |
| HERO-04 | Phase 2 | Complete |
| NAV-01 | Phase 3 | Pending |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| MARQ-01 | Phase 3 | Complete |
| MARQ-02 | Phase 3 | Complete |
| UBIC-01 | Phase 3 | Complete |
| UBIC-02 | Phase 3 | Complete |
| UBIC-03 | Phase 3 | Complete |
| MOTN-01 | Phase 4 | Pending |
| MOTN-02 | Phase 4 | Pending |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 4 | Pending |
| PERF-03 | Phase 5 | Pending |
| PERF-04 | Phase 5 | Pending |
| FOOT-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap v1.0 creation*
