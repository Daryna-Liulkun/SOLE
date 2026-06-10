# Project Architecture

## Purpose
This project is a static furniture brand website built around a modular configurator experience.
It combines product landing pages, catalogue navigation, configurator pages with real-time 3D preview, and supporting marketing sections.

## Folder structure

- `about.html`, `contacts.html`, `gallery.html`, `catalogue.html`, `wishlist.html`, `vacancies.html` — main marketing and catalogue pages.
- `closet.html`, `dresser.html`, `sideboards.html`, `tables.html`, `pet-houses.html` — individual product category pages.
- `closet-configurator.html`, `dresser-configurator.html`, `sideboards-configurator.html`, `tables-configurator.html`, `pet-houses-configurator.html`, `product-page.html` — product configurator entry pages.
- `css/style.css` — global styling and responsive layout.
- `js/main.js` — shared site-wide UI interaction scripts.
- `js/product-page.js` — dedicated configurator and 3D product logic.
- `assets/` — static image assets, layout illustrations, fonts, and reference materials.
- `docs/` — architecture and documentation files.

## High-level architecture

### Static HTML site
The site is delivered as a collection of static HTML pages.
Each page includes shared styling and scripts from the `css` and `js` folders.
Config pages use the same layout pattern and the same configurator script to ensure cross-product consistency.

### Shared page layout
Most pages share these common page elements:
- `header` with logo and navigation links
- page-specific hero or content sections
- footer links and contact details
- `js/main.js` loaded at the bottom for global behavior

### Configurator pages
Configurator pages are built as separate HTML entry points, but they reuse a single JavaScript implementation:
- `js/product-page.js` provides the full interactive configurator application.
- each config page imports external libraries from CDN: Tailwind CSS, Three.js core, OrbitControls, CSS2DRenderer, GSAP, and Phosphor icons.
- UI state lives in a single `config` object and is rendered via DOM bindings + Three.js updates.

## CSS architecture

### Global styling
`css/style.css` contains the global design system for the site.
The existing architecture includes:
- design tokens for colors, backgrounds, shadows, and typography
- spacing and layout conventions for containers, cards, sections, and forms
- atomic element rules for buttons, links, form fields, headings, and text blocks
- site-wide responsive rules for mobile and desktop layouts

### Component-level patterns
The stylesheet defines reusable visual components such as:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-cta`
- `.service-card`, `.story-card`, `.intro-image-wrapper`
- `.nav`, `.dropdown-menu`, `.footer-nav`
- `.field`, `.select-wrapper`, `.textarea-wrapper`

### Tailwind usage
Configurator HTML pages load Tailwind via CDN to accelerate layout styling in the page templates.
This is combined with the global site CSS rather than a separate Tailwind build.

### Vacancy detail page CSS
The vacancy open pages such as `vacancy-master-carver.html`, `vacancy-apprentice-carpenter.html`, and `vacancy-furniture-designer.html` use page-specific inline CSS in addition to the shared global stylesheet.

Key structure and behavior:
- `.vacancy-detail-container` defines a 12-column grid layout with a main content column and a sticky sidebar.
- `.vacancy-content` spans 7 columns and contains the role title, metadata chips, role descriptions, responsibilities, and requirements.
- `.vacancy-sidebar` spans 5 columns and uses `position: sticky` to keep the application card visible while the user scrolls.
- `.back-link` provides a navigation return path to `vacancies.html` with a subtle hover animation.
- `.detail-section` and `.detail-section li` standardize section spacing, heading style, paragraph text, and custom bullet list appearance.
- `.apply-card` and `.apply-form` style the job application CTA with a dark background, card shadow, input fields, and a custom framed submit button.

Responsive behavior:
- at `max-width: 1024px`, the layout collapses to a single column and the sidebar becomes static.
- at `max-width: 768px`, padding is reduced further and headline font sizes scale down for smaller screens.

This page-specific CSS is intentionally localized to the vacancy detail pages to preserve the global stylesheet for shared site patterns.

## JavaScript architecture

### `js/main.js` — global UI layer
`js/main.js` implements shared page interactions across marketing and product pages.
Main responsibilities:
- smooth scrolling for anchor links
- contact form overlay open/close behavior
- like button toggle states
- textarea character counters
- intro parallax effects
- service carousel behavior and modal popups
- hero animation cycles
- button toggle state styling

Because `main.js` is included on nearly every page, it acts as the site-wide interaction kernel.

### `js/product-page.js` — configurator engine
This file contains the core product configurator logic, including:
- Three.js scene setup and renderer initialization
- camera, lighting, ground plane, and orbit controls
- model groups: `wardrobeGroup`, `doorsGroup`, `shelvesGroup`, `utilitiesGroup`
- 3D hover/click raycasting for interaction
- dynamic UI panel generation (`renderFunctionPanel()`)
- form control bindings for sliders, buttons, swatches, and selectors
- update pipeline via `updateWardrobe()` on every config change
- specification section rendering and PDF/download actions

### Config state model
The configurator uses a central state object named `config`:
- `selectedColumnIndex`
- `columnsData` array describing each module
- width, height, depth, layout, doorType, doorDirection, cableOpenings
- `boardThickness`, `materialType`, `materialValue`, `materialColor`
- `showDimensions`, `moduleH`, `cableMode`

This state model makes it easy to keep the sidebar controls, 3D preview, and specification details in sync.

### Rendering flow
The configurator flow is event-driven:
1. page load triggers `init()`
2. `init()` sets up Three.js, UI controls, indicators, and event listeners
3. user interactions update `config`
4. changes call `updateWardrobe()` and `renderFunctionPanel()` as needed
5. the 3D model and DOM indicators refresh

### Third-party dependencies
Configurator pages rely on CDN-hosted libraries:
- `three.min.js` for WebGL rendering
- `OrbitControls.js` for camera interactions
- `CSS2DRenderer.js` for HTML labels in the 3D scene
- `gsap.min.js` for smooth animations
- `@phosphor-icons/web` for iconography
- `https://cdn.tailwindcss.com` for layout utilities

## Content and asset architecture

### HTML pages
The project contains two page categories:
- marketing/catalogue pages that describe products and link to configurators
- configurator pages that provide the interactive product build experience

### Assets
- `assets/about/`, `assets/gallery_photos/`, `assets/hero_animation/` used for marketing content
- `assets/Configurator/` contains UI reference imagery and component assets for the configurator
- font assets are stored under `assets/fonts/`

## Documentation architecture

### `docs/` folder
- `ARCHITECTURE.md` — high-level project architecture
- `Configurator page.md` — detailed configurator page documentation
- `JavaScript.md` — currently placeholder / optional JS-specific notes
- `README.md` — currently empty placeholder

## Maintenance guidance

### When updating configurator pages
- keep the shared configurator HTML structure consistent across `*-configurator.html`
- do not duplicate logic between pages; any behavior changes should generally occur in `js/product-page.js`
- maintain data attributes and ID selectors used by `product-page.js`
- preserve the script load order: global UI script (`js/main.js`) and then configurator logic (`js/product-page.js`)

### When updating CSS
- keep design tokens centralized in `css/style.css`
- avoid duplicate color/shadow definitions
- extend atomic utility classes rather than adding page-specific one-off rules where possible

### Recommended refactors
- Extract repeated configurator controls into reusable DOM template builders
- Move configurator state and renderer helpers into smaller modules if the project ever transitions to a build system
- Add explicit ARIA support and keyboard interaction for configurator controls
- Consider a shared configuration data file for product variants instead of hardcoding defaults in HTML

## Current system status
The project is a static site with no build pipeline.
Most complexity lives in the `js/product-page.js` configurator runtime and the `css/style.css` visual system.
Future architecture work should focus on isolating configurator state, improving code reuse, and separating shared UI behavior from page-specific rendering.
