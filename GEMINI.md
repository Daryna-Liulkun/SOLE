# Project Mandates: Mobile Adaptation

- **Strict Isolation:** No changes to desktop styles are permitted.
- **Mobile Breakpoint:** All mobile adaptation must be scoped within `@media (max-width: 430px)`.
- **CSS Structure:** Desktop styles (default) must come first, followed by the mobile media query block for overrides. Do not modify the original desktop CSS rules directly; override them within the media query.
