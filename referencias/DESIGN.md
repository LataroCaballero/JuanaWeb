# Design System Strategy: Urban Nomad Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Street-Poster."** 

This system moves away from the polite, sanitized interfaces of typical coffee applications. It is built to feel like a high-end wheat-pasted poster in a metropolitan alleyway—bold, unapologetic, and layered. We achieve this through "Organic Brutalism": a marriage of rigid, chunky geometric typography and high-contrast color shifts, broken up by "lo-fi" gritty textures and experimental layouts. 

By utilizing intentional asymmetry and overlapping elements (e.g., the smiley logo breaking the bounds of a container), we move beyond the "template" look. This design system treats the screen not as a grid, but as a canvas for a modern nomad’s narrative.

---

## 2. Colors
Our palette is anchored by a high-voltage Electric Blue, supported by deep obsidian blacks and crisp architectural whites.

- **Primary (`#b6c4ff` / `#0055ff`):** The "Electric Blue." Use the `primary_container` (#0055ff) for maximum impact. It is our signature signal.
- **Surface Hierarchy:** We utilize `surface` (#131313) as our base. To create depth, we nest `surface_container_low` and `surface_container_high` to define content zones.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through background color shifts. A `surface_container_low` card sitting on a `surface` background provides all the separation needed.
- **The "Glass & Gradient" Rule:** To add "soul" to the brutalist aesthetic, use Glassmorphism for floating navigation or cart overlays. Use a backdrop-blur (20px+) with a semi-transparent `surface_variant`. 
- **Signature Textures:** Apply a subtle grain overlay or a gradient transition from `primary` to `primary_container` on hero sections to mimic the ink-density of a physical print.

---

## 3. Typography
Typography is the primary engine of this brand's voice.

- **Display & Headlines (Space Grotesk):** These should be massive and "tight." Use `display-lg` (3.5rem) for hero statements. Kerning should be slightly tightened (-2% to -4%) to increase the "chunky" feel.
- **Title & Body (Work Sans):** Work Sans provides a functional, utilitarian contrast to the expressive headlines. Use `body-lg` (1rem) for descriptions to ensure readability against gritty background textures.
- **Experimental Accents:** High-contrast sizing is encouraged. A `label-sm` (0.6875rem) in all-caps can sit directly next to a `display-lg` headline to create a "technical manual" or "nomad passport" vibe.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface_container_highest` (#353534) element on top of a `surface` (#131313) background to create a hard, physical lift.
- **Ambient Shadows:** If a floating element (like a mobile FAB) requires a shadow, it must be an "Ambient Glow." Use a large blur (30px+) at 8% opacity, using the `primary_container` color as the shadow tint rather than black.
- **The "Ghost Border" Fallback:** For accessibility in input fields, use a "Ghost Border": the `outline_variant` token at 15% opacity. Never use 100% opaque borders.
- **Zero Roundedness:** All elements use a `0px` radius. The system is sharp, architectural, and uncompromising.

---

## 5. Components

### Buttons
- **Primary:** `primary_container` background with `on_primary_container` text. Rectangular, no radius. Bold all-caps `title-sm`.
- **Secondary:** Transparent background with a `Ghost Border` (`outline_variant` at 20%). 
- **Interaction:** On hover, buttons should "invert" instantly (no slow transitions) to mimic the flashing of a digital billboard.

### Cards & Lists
- **Layout:** Forbid divider lines. Use `spacing-8` (2.75rem) of vertical white space to separate list items. 
- **The Smiley Integration:** The smiley face logo with arrow eyes should be used as a "stamp" of quality, often positioned in the bottom-right corner of cards, partially overlapping the edge.

### Input Fields
- **Styling:** Underline-only or solid `surface_container_high` blocks. Label text should use `label-md` in Electric Blue to guide the user. 
- **Error State:** Use `error` (#ffb4ab) text with a `primary_container` background for high-contrast visibility.

### Signature Component: "The Feed Tile"
A square component using lo-fi, high-grain photography. Headlines should overlay the image using a `surface_dim` glassmorphism treatment at the bottom of the tile.

---

## 6. Do’s and Don’ts

### Do:
- **Do** lean into asymmetry. It’s okay if a headline feels "too big" for its container.
- **Do** use the Electric Blue as a highlight for tactical information (prices, tags, active states).
- **Do** mix professional photography with lo-fi, grainy, "behind-the-scenes" shots of the coffee process.
- **Do** use the `0.7rem` (`spacing-2`) unit for tight, technical metadata layouts.

### Don’t:
- **Don’t** use rounded corners. Even a 2px radius breaks the brutalist "nomad" aesthetic.
- **Don’t** use generic grey shadows. They muddy the high-contrast "urban poster" look.
- **Don’t** center-align everything. Modern editorial layouts thrive on left-aligned "anchors" and unexpected right-aligned accents.
- **Don’t** use thin font weights. The brand lives in the Bold and Medium weights of the scale.