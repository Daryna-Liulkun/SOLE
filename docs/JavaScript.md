# JavaScript Architecture and Reference

This document describes the primary JavaScript files used across the site, their responsibilities, data models, and key functions. It focuses on `js/main.js` (global UI behaviors) and `js/product-page.js` (configurator engine).

---

## Files overview

- `js/main.js` — site-wide UI interactions for marketing pages and shared behaviors (scrolling, modals, carousels, basic accessibility helpers).
- `js/product-page.js` — the configurator runtime: Three.js scene setup, DOM bindings for sidebar controls, and the update/render pipeline.

If you add more JS in the future, keep file responsibilities narrow: `main.js` for global UI, `product-page.js` for product/configurator logic.

---

## js/main.js — responsibilities

- Smooth scrolling for anchor links
- Contact form overlay handling and reset behavior
- Toggle/like button behavior for gallery cards
- Textarea character counters
- Hero animation and slide rotation
- Services carousel and modal logic
- Parallax effect on intro frames
- Misc UI toggles and simple interactive helpers

Key implementation notes
- Script runs on DOMContentLoaded and queries the document for page-specific selectors (safe to include site-wide).
- Many behaviors are guarded by feature presence checks (e.g., `if (serviceSlides.length > 0)`) so the file is safe to include on any page.

Known functions and blocks (high level)
- Smooth scroll: attaches click handlers to `a[href^="#"]` and calls `element.scrollIntoView({ behavior: 'smooth' })`.
- Contact overlay: shows `#contactOverlay`, adds `.active` class and resets the form on submit.
- Like button: toggles icon classes (Phosphor icons) and visual state on `.like-btn` clicks; uses `aria-label` in markup but could be improved with `aria-pressed` and keyboard support.
- Textarea counter: looks for `.textarea-wrapper` and updates `.textarea-counter` on input.
- Parallax: listens to `scroll` and updates transform on `.intro-image-wrapper` elements.
- Services carousel: positions `.service-slide` elements using calculated offsets and binds prev/next, with a modal implementation for detail view.
- Hero: cycles `.hero-animated-slide` elements using `setInterval` and a random-next selection function.

Maintenance recommendations for `js/main.js`
- Add ARIA state (`aria-pressed`) and keyboard handlers for `.like-btn` (improves accessibility).
- Throttle or debounce scroll handlers (parallax) to reduce main-thread work on mobile.
- Consider lazy-loading large images in `.catalogue-container` (add `loading="lazy"`).
- Split large file into smaller modules when introducing a build step.

---

## js/product-page.js — responsibilities

This file implements the interactive product configurator used by pages like `closet-configurator.html`, `tables-configurator.html` and `product-page.html`.

Primary responsibilities
- Three.js scene initialization (camera, lights, renderer, label renderer)
- Orbit controls and raycasting to support click interactions in the 3D viewport
- Central configuration state object `config` holding columns, materials and functional options
- DOM bindings for sidebar controls and dynamic function panel rendering
- Building and updating the 3D model via `updateWardrobe()` (geometry, materials, doors, shelves, utilities)
- Specification export / download and order modal triggers

Important global variables and state
- `config` — main app state, includes `selectedColumnIndex`, `columnsData`, `boardThickness`, `materialType`, `materialValue`, `materialColor`, `showDimensions`, `moduleH`, `cableMode`.
- `materialColors` — map of material keys to hex color values used for simple material swapping.
- Three.js groups: `wardrobeGroup`, `doorsGroup`, `shelvesGroup`, `utilitiesGroup` — used to organize the scene and simplify raycasting.

Initialization flow
1. `init()` reads DOM mount points (`#threejs-mount`, `#viewer-card`) and sets up scene, camera, renderer, label renderer, controls, lighting, and a ground plane.
2. Helper initialization: `createHumanReference()`, `updateWardrobe()`, `setupViewportMenu()`, `setupSidebarControls()`, `renderFunctionPanel()`, `initAccordions()`, `setupRaycasting()` and `animate()`.

Key functions
- `setupRaycasting()` — converts click coordinates into a Three.js ray and handles interactions with utility buttons in the scene (e.g., cable port toggles) and column selection.
- `renderFunctionPanel()` — populates `#function-panel-root` dynamically based on `config.columnsData` and binds its internal controls (width/height sliders, depth buttons, interior layout, door selectors, cable mode buttons).
- `updateWardrobe()` — central re-render routine that rebuilds or updates 3D geometry based on `config` changes (dimensions, layouts, doors, openings, materials).
- `bindSlider()` and indicator helpers — keep UI indicators (floating selectors) visually aligned with active buttons.

Event flow
- UI controls update `config` and call `updateWardrobe()` (and sometimes `renderFunctionPanel()`), which in turn modifies the 3D scene and DOM indicators.
- Clicks inside the 3D viewport fire raycasts; if a column is clicked, `config.selectedColumnIndex` is updated and the function panel is re-rendered.

Selectors and DOM expectations
- `#threejs-mount` — where the WebGL canvas is mounted.
- `#viewer-card` — container used to calculate mount size and relative control placement.
- `#config-sidebar` and `#function-panel-root` — where the form controls and dynamic function panel appear.
- Buttons and controls use `data-` attributes (e.g., `data-value`, `data-index`, `data-layout`) that `product-page.js` expects when binding events.

Maintenance notes for `js/product-page.js`
- Keep DOM IDs and `data-*` attributes consistent; the script is tightly coupled to the page markup.
- Consider splitting into smaller modules: `scene-setup.js`, `ui-bindings.js`, `wardrobe-model.js` to improve testability.
- Add unit tests around state transforms (e.g., functions that compute module positions or generate geometry parameters) if moving to a build/test pipeline.
- Add explicit guard clauses if DOM nodes are missing (for embedding the configurator into different templates).
- When changing material keys or palette, update `materialColors` and ensure data-value attributes match.

---

## Quick reference: Common IDs and classes

- `#threejs-mount`, `#viewer-card` — 3D viewport
- `#config-sidebar` — main controls column
- `.product-card-link`, `.product-card`, `.gallery-like` — catalogue grid and wishlist
- `#function-panel-root` — dynamic function panel for column-level controls
- `#download-pdf`, `#wishlist-modal`, `#order-modal` — CTAs and modals referenced by scripts

---

## Next steps (recommended)

- Add small inline comments at the top of `js/main.js` and `js/product-page.js` explaining file purpose and main entry functions.
- Add a simple test harness for `product-page` state transformations.
- If desired, I can start splitting `product-page` into smaller modules and add a minimal build setup.

EOFDesign Tokens (Кольори)
Назва токена	HEX/RGB значення	Де використовується
--color-accent	#DD5C00	основний CTA фон, .btn-primary, .nav-arrow, .field--required маркер, .service-card-btn, .contact-form ховер
--color-bg	#FFFFFF	фон сторінки, .btn-primary:hover, модальне повідомлення текст, CTA банер фон
--color-dark	#331D0F	основний текст, шапка .header, фон .hero, текст в .hero, кордони фокусу інпутів, сервісний номер
--color-white	#FFFFFF	текст на темному фоні, фон карток, кнопки, .story-card-front, .service-slide
--color-gray	#888888	вторинний текст, .textarea-counter, псевдо-стрілка select, дрібні підписи
--color-light-gray	#F5F5F5	оголошено як токен, але не використовується в index.html / поточному наборі стилів
surface-dark	#331D0F	фон .hero, .header, .contact-overlay, тіні, hover-ефект CTA
surface-light	#FFFFFF	загальний бекграунд, hover .hero-btn, .contact-form .btn-primary:hover
surface-muted	#FFFFFF	hover .btn-secondary
surface-neutral	#a9a9a9	фон-замінник зображень, .intro-image-wrapper, .material-img-wrapper
surface-soft	#eee	фон задньої сторони картки відгуку, бордери, .story-card-back
text-black	#000000	текст у секції галереї (.gallery-heading h1, .gallery-heading p)
surface-muted-2	#d8d8d8	фон .gallery-flow-card
shadow-strong	rgba(0,0,0,0.35)	тінь .header, .service-slide
shadow-light	rgba(0,0,0,0.03)	картки .story-card-front, .story-card-back
backdrop	rgba(0,0,0,0.4)	затемнення модального фону
text-white-60	rgba(255,255,255,0.6)	дрібні підписи у контактній секції
text-white-90	rgba(255,255,255,0.9)	контактна детальна інформація


Design Tokens (Відступи)
Основні відступи
padding: 0 104px — контейнер .container по горизонталі.
padding: 0 50px — внутрішній відступ шапки .header.
padding-top: 176px — верхній простір для .hero з урахуванням фіксованої шапки.
margin-bottom: 74px — вертикальний розрив між секціями, .hero, .intro, .stories, .contact-section, .services.
padding: 40px — внутрішній відступ для карток .contact-wrapper, .service-slide, .service-card-front/back.
gap: 16px — базова сітка grid-12, відступи між формами, матеріалами.
gap: 30px — відступи в .nav, заголовок до кнопки у .hero-title, .intro-text.
gap: 40px — відступ між секціями каруселі, заголовок .services-header.
padding: 15px — поля форми input, select, textarea.
padding-bottom: 36px — внутрішній простір для textarea, .textarea-wrapper.
margin-bottom: 24px — заголовки, тексти у секціях, .story-text.
margin-bottom: 28px — блоки контактів .contact-info, .contact-desc.


Основні шрифти
--fs-h1: 30px — глобальний заголовок h1.
--fs-h2: 25px — глобальний заголовок h2.
--fs-h3: 20px — глобальний заголовок h3.
--fs-body: 16px — базовий текст, посилання, кнопки.
--fs-small: 14px — дрібний текст, поля форми, метки.


Додаткові розміри:
45px — великі заголовки .hero-title, .intro-text h2, .section-title.
150px — декоративний номер .service-number.
18px — підзаголовки, допоміжний текст .hero-subtitle, .gallery-heading p.
24px — заголовок h3 у .service-content.
13px — текст у .material-card.


Атоми
Заголовки
h1, h2, h3 — базові HTML-атоми заголовків.
.hero-title — великий головний заголовок, font-family: Glendale.
.hero-subtitle — допоміжний опис у герої.
.section-title — універсальний заголовок секцій.
.services-header .section-title — заголовок для блоку сервісів.
.contact-info .section-title — заголовок форми контакту.


Кнопки
.btn — базовий атом кнопки: width: 192px, height: 48px, border-radius: 24px, font-size: 16px.
.btn-primary — основний CTA, темно-терракотовий фон + білий текст.
.btn-secondary — вторинний кнопку стилю з фоном var(--color-bg).
.btn-cta — ще один варіант CTA з світлим фоном.
.btn-text — текстова кнопка для модальних дій.
.service-card-btn — кнопка у картці сервісу: pill-shaped, width: 124px, height: 36px.
.nav-arrow — навігаційні кнопки каруселі.


Посилання
a — базова стилізація без підкреслення.
.nav a — меню навігації у шапці.
.wishlist-btn — іконкове посилання з font-size: 32px.
.footer-nav a — посилання у футері.
.social-links a — іконкові посилання соцмереж.


Поля форми
input, select, textarea — базовий атом форми з padding: 15px, border-radius: 4px, border: 1px solid #ccc.
.field — обгортка поля форми.
.field--required — позначка обов’язкових полів через псевдо-елемент ::after.
.select-wrapper — обгортка для кастомної стрілки select.
.textarea-wrapper — обгортка textarea + лічильник.
.textarea-counter — індикатор залишку символів.

Текстові блоки
p — основний параграф.
.contact-desc — опис у контактному блоці.
.story-text — текст відгуку.
.author-info strong, .author-info span — атоми тексту автора.
