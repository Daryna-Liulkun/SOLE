# Mobile Adaptation

## Overview

This project is implemented mobile-first and uses CSS media queries and small JavaScript helpers to adapt layout and interactions for phones, tablets and desktop screens. The site includes a viewport meta tag and Google/ local fonts for consistent typography across devices.

## What this repository actually implements

- Viewport: `index.html` includes `<meta name="viewport" content="width=device-width, initial-scale=1.0">` so pages scale correctly on mobile devices.
- Fonts: `Urbanist` is loaded from Google Fonts and a local `Glendale` face is bundled in `css/style.css` via `@font-face`.
- Breakpoints: the site uses three main breakpoints in `css/style.css`:
	- `@media (max-width: 1024px)` — tablet / small laptop adjustments (container padding, 6-column grid, hero layout changes).
	- `@media (max-width: 768px)` — primary mobile layout (off-canvas nav, 1-column grid, mobile-specific refinements and larger touch targets).
	- `@media (max-width: 480px)` — very small phones (further padding and typing size tweaks).
- Navigation: a burger button (`#burgerMenuBtn`) toggles the main nav (`#mainNav`) into an off-canvas mobile menu. Dropdowns inside the nav become accordion-style menus on mobile (JS toggles `.active` and sets `max-height` for smooth transitions).
- Images: the codebase does not currently use `srcset`/`<picture>` elements. Instead, `js/main.js` applies `loading="lazy"` to images within `.catalogue-container` at runtime. Most image assets are stored under `assets/` and are PNG/JPG files.
- Product configurator: `js/product-page.js` implements a Three.js-based configurator. It uses `OrbitControls` with `enableZoom = false` (pinch/scroll zoom disabled) and programmatic viewport controls (zoom in/out buttons) to keep interaction consistent across devices.
- Touch behavior: product/gallery cards and product catalog items use a click-first overlay pattern on narrow viewports (<=768px): the first tap opens an overlay, the second tap follows the link. This is implemented in `js/main.js`.
- Hero animations: animated hero slides live in `assets/hero_animation/` and are cycled by JS every ~2000ms. CSS transitions are used for smooth visibility and transforms.

## Recommended actionable updates (priority)

- Add responsive `srcset`/`<picture>` variants for hero and catalogue images to reduce bandwidth on mobile (no `srcset` currently present).
- Consider emitting `loading="lazy"` server-side or adding it in HTML for all large images (JS currently adds it only for `.catalogue-container img`).
- Generate and serve WebP/AVIF fallbacks for large photos; keep JPG/PNG fallbacks for broad compatibility.
- Reconsider `OrbitControls.enableZoom = false` if you want pinch-to-zoom inside the configurator on touch devices (current behavior disables pinch zoom).
- Add ARIA attributes to the burger button (`aria-expanded`) and to dropdown toggles for improved accessibility (JS toggles only classes currently).

## Files to review or update

- [`css/style.css`](css/style.css) — confirmed breakpoints at `1024px`, `768px`, `480px` and many mobile refinements (off-canvas nav, grid -> 1 column, hero and catalogue adjustments).
- [`js/main.js`](js/main.js) — nav toggle, dropdown accordions, click-to-show overlay for cards, hero slide rotation, lazy-loading helper.
- [`js/product-page.js`](js/product-page.js) — Three.js configurator details (OrbitControls, raycasting, viewport menu buttons).
- `index.html` — contains the `viewport` meta tag and the markup IDs/classes relied on by JS (e.g. `burgerMenuBtn`, `mainNav`).

## Testing and validation

1. Serve the project locally and test with device emulation or a real device:

```bash
python3 -m http.server 8000
# open http://localhost:8000 in a browser
```

2. Use browser devtools device emulation and test these widths where the code applies different behaviors: 1024px, 768px, and 480px.
3. Verify these interactive flows on a real phone:
	- Burger menu open/close and dropdown accordions
	- Gallery/product card tap behavior (first tap opens overlay, second navigates)
	- Three.js configurator interactions and viewport buttons (zoom in/out toggle the 3D camera)
4. Run Lighthouse (Performance + Accessibility) and focus on image payload and mobile interaction issues.

## Notes & small findings

- There is no use of `srcset`/`<picture>` in the repository — adding responsive images will yield the largest bandwidth wins for mobile.
- `js/main.js` sets `loading="lazy"` for `.catalogue-container img` at runtime; if you prefer behavior without JS, add the attribute directly in HTML templates.
- Hero slides are hardware-accelerated via transforms and opacity changes; the images themselves are currently PNG/JPG in `assets/hero_animation`.

---

If you want, I can (pick one):

- add `srcset`/`<picture>` examples for the hero and a sample catalogue item, or
- update `css/style.css` to include a concise mobile-first media query summary at the top, or
- create a small checklist and run a Lighthouse audit locally and report the top 5 improvements.

Tell me which option you prefer and I will proceed.
