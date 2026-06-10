# Design System Tokens

## Colors
| Token | Value | Usage | Drift/Hardcodes |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#331D0F` | Main dark theme color (Brown) | Found in `.footer`, `.cta-section`, `.about-join` |
| `--color-accent` | `#DD5C00` | CTA buttons, icons, highlights | Used as `var(--color-accent)` but also hardcoded in some shadows |
| `--color-bg` | `#FFFFFF` | Global background | Found as `#FFFFFF`, `#white` |
| `--color-gray` | `#888888` | Secondary text, captions | Found as `#888`, `#888888` |
| `--color-light-gray`| `#F5F5F5` | Background for cards/inputs | Drift: `#eee`, `#ccc`, `#F5F5F5`, `#D9D9D9` |

## Spacing
| Token | Value | Usage | Hardcodes |
| :--- | :--- | :--- | :--- |
| `--section-padding` | `74px` | Vertical padding for sections | `74px` used in `.intro`, `.stories`, `.contact-section`, `.services`, `.cta-section` |
| `--container-padding`| `0 50px` | Horizontal padding for containers | `0 104px` in header, `0 50px` in footer |
| `--space-xl` | `40px` | Large internal padding | Found in `.contact-form`, `.service-card` |
| `--space-lg` | `30px` | Medium gaps/padding | Found in `.nav`, `.story-card` |
| `--space-md` | `20px` | Small gaps | Found in `.header-placeholder-icon` |
| `--space-sm` | `15px` | Element gaps | Found in `.story-author`, `.contact-form` |

## Typography
| Token | Value | Usage | Hardcodes |
| :--- | :--- | :--- | :--- |
| `--font-size-xl` | `45px` | Section Titles (H2 style) | Found in `.intro h2`, `.stories h2`, `.contact-overlay-content h3` |
| `--font-size-lg` | `24px` | Card Titles, CTA text | Found in `.service-content h3`, `.material-card h3` |
| `--font-size-md` | `16px` | Nav links, buttons | Found in `.nav-link`, `.btn` |
| `--font-size-sm` | `14px` | Body text, form labels | Found in `.story-text`, `.form-group label` |

## Radius
| Token | Value | Usage | Hardcodes |
| :--- | :--- | :--- | :--- |
| `--radius-lg` | `10px` | Main containers, section overlays | Found in `.contact-section`, `.cta-section` |
| `--radius-md` | `8px` | Cards, buttons | Found in `.story-card`, `.nav-button` |
| `--radius-sm` | `4px` | Inputs | Found in `.form-input` |
