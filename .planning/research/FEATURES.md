# Feature Landscape

**Domain:** Coffee truck / mobile café — brand-forward landing page
**Project:** Juana House, San Juan, Argentina
**Researched:** 2026-03-25
**Overall confidence:** HIGH (based on direct analysis of reference HTML, design system docs, ecosystem research, and verified UX patterns)

---

## Context Summary

Juana House is not a seated café. It is a mobile coffee truck with two fixed docking stations
(Iron Man — San Juan; Cara Sur — Barreal). There is no ordering system, no reservations, no
delivery. The page has one job: make the visitor FEEL the brand within 3 seconds, then give them
the practical information they need to find the truck.

This distinction matters because:

- Location + schedule info is operationally critical for a food truck (vs. a café where address
  is sufficient)
- The "story" is inseparable from the mobility: Tribu Nomade, COFFEE ON YOUR WAY, siempre en casa
- Social media (Instagram @juana.onyourday, 18.8K followers) is the brand's primary living
  content channel — it should be acknowledged, not fully replicated
- No conversion goal except "come find us" — every CTA points outward (Instagram, Google Maps)

---

## Table Stakes — v1 Must-Haves

Features the target audience (San Juan locals, travelers through Barreal) will expect. Missing
any of these = the page feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero with brand identity | First impression is the only impression for awareness sites | MEDIUM | Logo 3D animado is the central differentiator; must load in <2.5s — separate LCP from 3D load |
| Slogan prominent above fold | "COFFEE ON YOUR WAY" / "TRIBU NOMADE" must be in first viewport | LOW | Already in reference HTML as h1 at 10-12vw; do not reduce size on mobile |
| Menu section with prices | 74% of diners decide to visit after checking menu online; food trucks especially need price visibility | LOW | Reference HTML has brutalist menu layout: item name + description + price in ARS |
| Two locations with address | Food truck visitors NEED a street address to navigate; missing this = lost customers | LOW | Iron Man (Del Bono 383 Sur, San Juan) + Cara Sur (Barreal) |
| Operating hours per location | Customers arriving at wrong time = negative brand experience | LOW | Currently absent from reference HTML — critical gap to fill in v1 |
| Instagram link (footer + hero area) | 74% of diners discover food trucks through social media; the brand lives on Instagram | LOW | @juana.onyourday with 18.8K followers — follower count functions as social proof |
| Mobile-first responsive layout | 89% of dining decisions made on mobile | MEDIUM | Already established in reference HTML with Tailwind responsive classes |
| Grain overlay + Electric Blue identity tokens | Brand must be unmistakably Juana from first render | LOW | Already implemented in reference HTML — must be preserved in build |
| Navigation bar | Users need orientation even on a single-page scroll site | LOW | Reference HTML has sticky nav; glassmorphism treatment appropriate |
| Footer with copyright + social links | Trust / completeness signal | LOW | Already in reference HTML |

---

## Differentiators — v1 Must-Haves (Brand Storytelling)

These separate Juana House from a generic café listing. They exist to serve the "feel the brand"
goal. All of these are required in v1 because brand storytelling IS the primary objective.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3D animated logo (smiley / arrow-eyes) | The logo IS the brand stamp; 3D treats it as an art object not a favicon | HIGH | Three.js island in Astro; lazy-load on viewport entry via client:visible; critical for <2.5s LCP — hero text must render before Three.js loads |
| Marquee ticker (brand phrases) | Communicates brand voice without requiring reading; editorial motion signature | LOW | "JUANA HOUSE / JUANATRUCK / NOMAD SOUL / URBAN EDITORIAL" — reference HTML has CSS marquee; upgrade to GSAP velocity scrub in v2 |
| Nuestra Historia / Tribu Nomade section | Emotional anchor — the "why we exist" story; food truck context makes this richer than a café's generic About section | LOW | Full-bleed image + editorial layout — already in reference HTML |
| Location cards: grayscale-to-color hover | Photographic reveal that rewards engagement; the truck "coming alive" metaphor fits the nomad story | LOW | Already in reference HTML as CSS transition; preserve in Astro component |
| Section transitions via background color shift (No-Line rule) | Enforces the "Digital Street-Poster" aesthetic; no dividers means the page reads as continuous canvas | LOW | Design system rule — must be enforced in Astro layout, not just the reference HTML |
| Typography at extreme scale (10vw+ headlines) | Typeface AS identity — Space Grotesk Black at 10-12vw signals confidence and editorial sensibility immediately | LOW | Already established; must not be "corrected" toward conventional sizing on responsive breakpoints |
| Menu with editorial formatting (not a table) | Food truck menus at brutalist scale communicate premium positioning even for a mobile format | LOW | Name / descriptor / price as three-tier typographic hierarchy |

---

## Differentiators — v2 Nice-to-Haves

These add depth but are not required for the brand-storytelling mission of v1.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Static curated photo grid (4-6 images) | Extends brand visual universe without Instagram API dependency; shows real product/truck | LOW | Use 4-6 hand-selected WebP images; NOT a live Instagram feed (see Anti-Features) |
| Scrollytelling section ("The Coffee, On The Road") | Narrative experience: scroll-pinned panel with GSAP-driven text reveals that tells the sourcing / brewing story | HIGH | High complexity; reserve for v2 when content is ready |
| Interactive location map (embedded Google Maps) | Reduces friction for navigation from website; map preview increases visit intent | LOW | Use placeholder image + lazy inject pattern — load iframe only on user interaction to avoid LCP penalty |
| Weekly schedule display | Food trucks have variable schedules; a "where are we this week" section keeps the page fresh | MEDIUM | Requires hardcoded update process in v1; consider static JSON data file |
| Social proof: follower count badge | "18.8K on Instagram" is social proof without requiring UGC infrastructure | LOW | Display as typographic badge near Instagram CTA, not a widget |
| Juana Cakes / pastry section | Menu extension for non-coffee offering — appears in reference HTML CTA buttons | LOW | Defer until real product photography exists |
| Scroll-triggered section reveals | Headlines entering on scroll adds editorial gravitas | MEDIUM | GSAP from: opacity 0, y 60 staggered per section; must respect prefers-reduced-motion |
| GSAP ScrollTrigger marquee velocity | Marquee speed ties to scroll speed — makes brand feel alive and responsive | LOW | GSAP ScrollTrigger; approximately 1 day implementation; strong brand payoff |

---

## Anti-Features — Explicitly Do Not Build

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Live Instagram API embed | Adds third-party JS weight, API rate limits, OAuth complexity, and performance penalty (blocks LCP); Instagram's embed API has historically been unstable | Use 4-6 curated static WebP images extracted from Instagram posts; link to @juana.onyourday |
| Online ordering system | Not the business model; adds complexity that dilutes the brand experience | "Come find us" CTA pointing to location + hours |
| Contact form | Low-signal for a food truck; Instagram DMs ARE the communication channel for this demographic | Link directly to Instagram profile |
| Rounded corners anywhere except logo circle | Breaks Organic Brutalism design system; zero-radius is a brand rule | Enforce 0px borderRadius via Tailwind config |
| 1px divider lines between sections | "No-Line rule" — breaks the street-poster canvas effect | Background color shifts only (surface to surface-container-low to background) |
| Light mode | Juana's identity is obsidian dark base; a light mode would dilute the Electric Blue contrast signature | Dark-only; hardcode class="dark" on html element |
| Slow CSS transitions (200ms+) | Design system specifies instant "billboard flash" hover behavior | Use transition-none on buttons and nav links per the design system spec |
| Newsletter signup | No email infrastructure, no value proposition for this use case | Instagram follow CTA serves the same "stay connected" intent |
| Reviews / star ratings widget | Adds third-party JS, creates maintenance burden, may surface negative content | The 18.8K Instagram followers IS the social proof — reference it as a number |
| Multiple language toggle | The Spanish/English mix is intentional brand voice — it is the identity | Maintain bilingual copy as single voice, not a UI toggle |
| HTML marquee element | Deprecated; screen readers announce it as a navigation region; accessibility failure | CSS animation (translate X loop) or GSAP; must support prefers-reduced-motion and pause on keyboard focus |
| Google Maps iframe loaded at page load | Standard iframe embed makes multiple HTTP requests outside your control; adds 1-2s to load time on mobile | Placeholder image → inject iframe on mouseover/click interaction; or defer with IntersectionObserver |
| Full-page scroll hijack / custom scroll | Overrides native scroll behavior; extremely problematic on mobile, hurts accessibility, penalizes Core Web Vitals | Scroll-triggered animations via GSAP ScrollTrigger that enhance native scroll without replacing it |
| Video background autoplay in hero | High bandwidth cost especially on mobile LTE; iOS restricts autoplay; hurts LCP significantly | Three.js 3D object is the motion element — no video background needed |
| Skeleton loaders for 3D hero | Trains users to expect delay; sets wrong expectation | Hero text (h1 + CTA) must be visible before 3D loads; 3D is enhancement not requirement for above-fold content |

---

## Expected UX Behaviors — Domain Standards

### 3D Hero Logo

Expected behavior pattern (HIGH confidence — verified across award-winning food/brand sites):

- The 3D element should NOT block the LCP text. The headline and CTA buttons render from static HTML; Three.js loads as an island after first paint.
- Idle animation: slow orbital rotation (Y-axis, 0.2–0.5 rpm) or gentle breathing scale. Animation timing sweet spot is 150–400ms for responsiveness; idle loops should be slower.
- On viewport enter: a brief "landing" or "materializing" animation signals interactivity. Scale from 0.8 to 1.0 over 600ms with a slight bounce easing works for this type of logo.
- Mouse parallax: subtle displacement (±10px) tied to cursor position makes the object feel physically present. GSAP ticker or pointer event delta.
- No loading spinner or placeholder visible behind the 3D canvas. The canvas background must be transparent (alpha: true in Three.js renderer) so the dark page surface shows through.

### Animated Marquee

Expected behavior pattern (MEDIUM confidence — CSS Tricks / GSAP docs verified):

- Direction: left-to-right (traditional) or right-to-left depending on brand feel. Juana's reference HTML uses right-to-left, which reads as editorial / modern.
- Speed: approximately 40–80px/s is comfortable for reading. Too fast = decorative only. For brand phrases this is intentional — it should be slightly too fast to fully read, creating texture.
- Loop: seamless. Content is duplicated 2-3x in the DOM so no gap appears at loop point.
- Pause behavior: must pause on `prefers-reduced-motion: reduce`. Should also pause on keyboard focus for accessibility. Do NOT use HTML `<marquee>` — it is deprecated and inaccessible.
- On scroll velocity (v2): GSAP ScrollTrigger scrub makes speed proportional to scroll velocity. This is a brand payoff interaction, not a structural requirement.

### Menu Section

Expected behavior pattern (HIGH confidence — standard food service UX):

- Hierarchy: Category header → item name → short descriptor → price. Three-tier, not a table.
- Mobile: single-column list. No accordion needed for a small menu (under 20 items).
- Hover state: minimal. Border flash or background tint on row hover is sufficient. No slide-out panels or expanded descriptions (adds complexity without value for a truck).
- Prices in ARS: display with "$" prefix and period separators (e.g., "$1.500"). No USD conversion.
- No "add to cart" affordance. Menu is informational only.

### Location Section

Expected behavior pattern (HIGH confidence — food truck domain standard):

- Two cards, one per location. Each card: location name (as brand headline), address, operating hours, and a "Cómo llegar" link that opens Google Maps app on mobile.
- Grayscale-to-color hover: the photograph reveals in color on hover/focus, symbolizing the truck arriving. This is the key micro-interaction for this section.
- Static map image (not embedded iframe) for v1. A screenshot of the Google Maps pin, linked to the map URL, is a valid zero-cost performance approach.
- "Ver dónde estamos hoy" CTA: links to Instagram Stories or profile. This is the bridge between the static page and real-time truck position.

---

## Food Truck Specifics — What a Mobile Café Needs That a Seated Café Does Not

These requirements are unique to the mobile format and are frequently missing from generic café
website templates.

| Requirement | Why Critical for a Food Truck | Implementation Note |
|-------------|-------------------------------|---------------------|
| "Docking station" framing (not "our location") | The truck moves; named outposts communicate the nomad narrative while providing navigation data | Use "CURRENT DOCK" / "MOUNTAIN POST" labels (already in reference HTML) |
| Hours per location | The two locations may have different schedules; Barreal may be seasonal | Show day+hour pairs per location card; hardcoded in v1 |
| "How to find us today" call to action | Customers need real-time info the static site cannot provide | A single prominent link: "Ver dónde estamos hoy" pointing to Instagram Stories |
| Location names as brand assets | "Iron Man" and "Cara Sur" are more than addresses — they are part of the nomad narrative | Treat location names as typographic headlines, not metadata labels |
| No reservation affordance | Food trucks are walk-up only; any implied booking UI creates false expectation | Remove any "reservar" or "agendar" language from the design |

---

## Feature Dependencies

```
Hero text (h1 + CTA)    → Static HTML            → must be LCP anchor, renders before 3D
3D Logo island          → Three.js + Astro        → lazy-loads via client:visible, NOT blocking
Marquee (v1)            → CSS animation only      → no JS dependency
Marquee velocity (v2)   → GSAP ScrollTrigger      → builds on v1 CSS marquee
Menu section            → Real product list        → content dependency (prices in ARS)
Locations               → Address + hours          → content dependency (Del Bono 383 Sur confirmed)
Grain overlay           → SVG feTurbulence / CSS  → pointer-events: none required
Photo grid (v2)         → Hand-selected WebP       → photography dependency
Scroll reveals (v2)     → GSAP ScrollTrigger       → must check prefers-reduced-motion
Interactive map (v2)    → placeholder + lazy inject → avoid iframe at page load
```

### Dependency Notes

- **3D Logo requires hero text to be independent:** The smiley logo is a visual enhancement, not the page's LCP resource. If Three.js takes 800ms to hydrate, the headline and CTA are already visible and the user is not blocked.
- **Marquee v2 enhances v1:** CSS animation version is standalone. GSAP ScrollTrigger velocity enhancement can be swapped in without restructuring the component.
- **Grain overlay requires pointer-events: none:** Without this, the z-indexed overlay intercepts all click and hover events on the entire page.

---

## Micro-Interactions That Matter Most

Ranked by brand impact vs. implementation cost for this specific project.

| Interaction | Why It Matters for Juana | Priority | Implementation |
|-------------|--------------------------|----------|----------------|
| Location card: grayscale to color on hover | "The truck comes alive" metaphor; rewards exploration | v1 | CSS grayscale(1) to grayscale(0), already in reference HTML |
| Hero logo: 3D idle rotation | The logo is the character — it should breathe | v1 | Three.js idle animation on the smiley; lazy-loaded island |
| Menu item: border color flash on hover | Instant Electric Blue flash on item hover | v1 | Remove transition-colors from reference HTML; make instant per design system |
| Nav: glassmorphism activates on scroll | Separates floating nav from hero content visually as user scrolls | v1 | backdrop-blur activates after scrollY > 80px via IntersectionObserver |
| Marquee: velocity change tied to scroll speed | Makes the brand tag feel alive and responsive to user | v2 | GSAP ScrollTrigger velocity scrubbing; approximately 1 day implementation |
| Scroll reveal: section entry | Headlines entering on scroll adds editorial gravitas | v2 | GSAP from opacity 0, y 60, staggered per section |
| Split text scramble on headline entry | Typographic drama for the "TRIBU NOMADE" headline | v2 | GSAP SplitText; HIGH complexity — defer |

Accessibility requirement: All GSAP animations must check `prefers-reduced-motion: reduce` via
`gsap.matchMedia()`. The marquee must pause on keyboard focus. This is required for inclusive
design and is now standard GSAP practice documented in official GSAP accessibility resources.

---

## Instagram Integration: The Correct Approach for v1

Recommendation: Static curated grid over live embed.

The live Instagram API embed approach carries: third-party JS payload (15-50KB+), API rate
limits, OAuth token management, and a history of Instagram breaking embed implementations.
For a performance-first static Astro site targeting LCP < 2.5s, this is unacceptable overhead.

The correct approach for v1:

1. Select 4-6 representative Instagram images manually.
2. Convert to WebP, compress to under 80KB each.
3. Render as a static grid in an Astro component.
4. Add a prominent "Follow us / @juana.onyourday" CTA that links to the profile.
5. Display "18.8K seguidores" as a social proof badge next to the CTA.

This delivers 90% of the value (brand atmosphere, visual richness) with zero runtime cost
and no API dependency. The grid is updated during content maintenance cycles.

For v2: Evaluate server-side pre-rendered feed fetching Instagram Basic Display API at Astro
build time — updated photos without any client-side JS overhead.

---

## MVP Recommendation (v1 Scope)

Build in this order based on storytelling impact and content dependencies:

1. **Hero** — Hero text (h1 + CTA) as static HTML LCP anchor; Logo 3D island loaded after first paint
2. **Marquee** — Brand phrases, Electric Blue background, CSS animation (GSAP upgrade in v2)
3. **Nuestra Historia / Tribu Nomade** — Full editorial section with image + story text
4. **Menu** — Brutalist list: name / descriptor / price; real ARS prices
5. **Locations** — Two cards, grayscale-to-color hover, docking station names, address, hours
6. **Social / Footer** — Instagram CTA with follower count badge, social links, copyright

Defer to v2:
- Static photo grid (requires photography selection)
- Scroll-triggered text reveals (GSAP SplitText)
- Weekly schedule display (requires content pipeline decision)
- Interactive Google Maps embed (requires placeholder + lazy inject)
- Scrollytelling narrative section
- GSAP marquee scroll velocity

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero text (h1 + CTA static) | HIGH | LOW | P1 |
| 3D Logo island | HIGH | HIGH | P1 |
| Marquee (CSS) | MEDIUM | LOW | P1 |
| Nuestra Historia section | HIGH | LOW | P1 |
| Menu section (content) | HIGH | LOW | P1 |
| Location cards + hours | HIGH | LOW | P1 |
| Grain overlay | MEDIUM | LOW | P1 |
| Responsive mobile layout | HIGH | MEDIUM | P1 |
| Nav glassmorphism on scroll | MEDIUM | LOW | P1 |
| Social / footer | MEDIUM | LOW | P1 |
| Static photo grid | MEDIUM | LOW | P2 |
| GSAP scroll reveals | MEDIUM | MEDIUM | P2 |
| GSAP marquee velocity | MEDIUM | LOW | P2 |
| Interactive map embed | LOW | LOW | P2 |
| Scrollytelling section | MEDIUM | HIGH | P3 |
| Weekly schedule display | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (v1)
- P2: Should have, add after v1 validation
- P3: Nice to have, future consideration (v2+)

---

## What the Reference HTML Gets Right — Preserve These

The existing `referencias/juanaV1.html` already resolves several feature decisions correctly:

- Headline at 10-12vw using Space Grotesk Black: preserve exactly
- transition-none on all interactive elements: correct per design system
- Background color shifts for section boundaries (no dividers): correct
- border-l-8 border-primary-container accent on the hero quote block: strong brand signal
- "CURRENT DOCK" / "MOUNTAIN POST" labels on location cards: food-truck-specific language — keep
- Marquee on Electric Blue background between sections: correct usage of brand interrupt
- Grain overlay as fixed z-[100] layer: preserves the "printed poster" texture throughout
- Smiley logo as a brand stamp element: signature component integration

## What the Reference HTML Is Missing — Add in v1

- **Operating hours** per location (critical gap — hours are not present anywhere in the HTML)
- **Real street address** for Iron Man (Del Bono 383 Sur, San Juan J5400)
- **Instagram CTA** visible above the fold or in the hero area (only in footer currently)
- **"Ver donde estamos hoy"** link to current Instagram Story for real-time truck location
- **pointer-events: none** on grain overlay (must be verified — overlay cannot block clicks)

---

## Sources

- [Hero Section Design Best Practices 2026 — perfectafternoon.com](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Hero Section Examples and Best Practices — LogRocket](https://blog.logrocket.com/ux-design/hero-section-examples-best-practices/)
- [100 Three.js Performance Tips 2026 — utsubo.com](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [Building Interactive 3D Hero Animation — matsimon.dev](https://www.matsimon.dev/blog/building-an-interactive-3d-hero-animation)
- [Building Efficient Three.js Scenes — Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Marquee UX Design for First Impressions — Prateeksha](https://prateeksha.com/blog/hero-marquee-design-web-best-practices-for-impactful-first-impressions)
- [Trends to Avoid: Marquee Animation — Kinetic Iris](https://kineticiris.com/trends-to-avoid-marquee-animation/)
- [Making Web Animations Accessible — BOIA](https://www.boia.org/blog/making-your-web-animations-accessible-5-tips)
- [Top Café Website Designs That Convert — DesignRush](https://www.designrush.com/best-designs/websites/trends/cafe-website-design)
- [Google Maps Static vs Embed Performance — corewebvitals.io](https://www.corewebvitals.io/pagespeed/google-maps-100-percent-pagespeed)
- [Grainy Gradients — CSS-Tricks](https://css-tricks.com/grainy-gradients/)
- [How Neo-Brutalism Took Over Digital Design in 2025 — Clover Technology](https://www.clovertechnology.co/insights/how-neo-brutalism-took-over-digital-design-in-2025)
- [Intro to Astro: Clever Lazy Loading — InfoWorld](https://www.infoworld.com/article/2336409/intro-to-astro-clever-lazy-loading-for-javascript.html)
- [GSAP Accessible Animation — Official GSAP Docs](https://gsap.com/resources/a11y/)
- Direct analysis: referencias/juanaV1.html (Juana House reference implementation)
- Direct analysis: .planning/PROJECT.md (project constraints and design system spec)

---
*Feature research for: Juana House landing page — coffee truck / mobile café brand*
*Researched: 2026-03-25*
