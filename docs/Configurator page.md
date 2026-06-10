# Configurator Page Documentation

## Overview
The Configurator page is a product customization experience built around a 3D furniture preview and a rich sidebar control panel.
It is used for multiple product variants: `closet-configurator.html`, `dresser-configurator.html`, `sideboards-configurator.html`, `tables-configurator.html`, and `pet-houses-configurator.html`.

The main goal is to let users adjust physical dimensions, interior layout, finish options, and functional details while seeing the model update in real time.

## Primary page structure

### 1. Header and navigation
- Standard site header and navigation are shared with other pages.
- The page title uses `.product-title` and identifies the active configurator.

### 2. Main configurator layout
The page is split into two primary areas:
- `#viewer-card`: left viewport card for the 3D preview.
- `#config-sidebar`: right sidebar for configuration options.

#### 2.1 Viewer panel
- `#threejs-mount`: mount point for the Three.js renderer.
- Viewport overlays provide quick controls and context:
  - background swatches
  - zoom buttons (`#zoom-in`, `#zoom-out`)
  - toggle dimensions (`#toggle-dims`)
  - toggle doors (`#toggle-doors`)
  - scroll to specification (`#scroll-to-spec`)

#### 2.2 Sidebar controls
The sidebar contains several control groups:
- Title and current price display
- Width and height sliders
- Depth selector buttons
- Column count controls (minus/plus)
- Material palette toggles
- Painted and wood swatch grids
- Dynamic function panel content inserted by `product-page.js`
- Action buttons: Order and Add to Wishlist

### 3. Specification section
- `#specification-section`: dark-themed summary area below the main configurator.
- Includes a sticky title and CTA buttons:
  - Download PDF (`#download-pdf`)
  - Request a Quote & Order
- Contains accordion-style specification blocks that are populated dynamically.

### 4. Modals
- Wishlist modal: `#wishlist-modal`
- Order modal: opened via inline `onclick` call targeting `order-modal`

## Data model and config state
In `js/product-page.js`, the central state object is `config`:
- `selectedColumnIndex`: current selected column in the interior panel.
- `columnsData`: array of column configuration objects.
  - `width`, `height`, `depth` as meters.
  - `layout`: interior layout type (`hanging`, `shelves`, etc.).
  - `doorType`: `doors` or `open`.
  - `doorDirection`: door orientation (`left`, `right`, `double`).
  - `cableOpenings`: array for cable port state.
- `boardThickness`: thickness of panels.
- `materialType`: `painted` or `wood`.
- `materialValue`: selected material key.
- `materialColor`: actual color hex for rendering.
- `showDimensions`: boolean to display dimension labels.
- `moduleH`: base module height step.
- `cableMode`: `none`, `add`, or `remove`.

Material palette definitions are in `materialColors`.

## Behavior and interaction flow

### 1. Initialization
`init()` in `product-page.js` sets up:
- Three.js scene, camera, renderer, label renderer
- orbit controls
- lights (hemisphere, directional, point)
- ground plane
- scene groups: `wardrobeGroup`, `doorsGroup`, `shelvesGroup`, `utilitiesGroup`

### 2. Responding to UI changes
Controls update the `config` object and call rendering helpers:
- sliders update width/height values
- depth buttons update the selected depth value
- column controls update the number of modules
- material buttons switch between paint and wood palettes
- color swatches update `materialValue` and `materialColor`
- interior layout buttons update the selected column layout
- door type/direction buttons update enclosure options
- cable mode buttons update cable port state

Each input event triggers an update path that includes:
- UI state updates (active class toggles, indicator repositioning)
- `updateWardrobe()` or similar rendering updates
- `renderFunctionPanel()` for selected column settings

### 3. Dynamic UI helpers
The script uses indicator elements to animate selected tabs and buttons.
Examples:
- `updateInteriorIndicator()` for the interior layout row
- `updateDoorTypeIndicator()` for door type toggles
- `updateCableIndicator()` for cable mode buttons

### 4. 3D rendering and model updates
`product-page.js` builds and rebuilds the wardrobe model using Three.js geometry.
The model is updated when configuration changes, including:
- dimension changes
- material color changes
- door open/close state
- interior layout changes
- cable port mode

## Shared page files
- `js/product-page.js` — shared configuration logic and rendering code
- `css/style.css` — page styling and responsive layout
- `assets/` — images used for interior layout buttons and UI backgrounds

## Specific page variants
Each configurator page is a separate HTML entry point, but the core page structure is identical and only the title/product label changes.
This makes the configurator reusable across product lines while keeping the same interaction model.

## Maintenance notes
- Use the same `#viewer-card`, `#config-sidebar`, and `#specification-section` structure for any new product configurator.
- Keep `config.columnsData` consistent: each column object should have width, height, depth, layout, doorType, doorDirection, cableOpenings.
- When changing control markup, update the corresponding JS selector logic in `product-page.js`.
- Keep palette button data attributes aligned with `materialColors`.
- The specification download and quote flow are primary conversion paths, so preserve the button IDs and modal anchors.

## Recommended improvements
- Add explicit ARIA labels and keyboard support for range sliders and button groups.
- Refactor repeated UI indicator logic into reusable helper functions.
- Add a product-specific configuration mapping file if multiple product types require variant-specific default settings.
- Consider extracting the shared configurator layout into a template for easier maintenance.

