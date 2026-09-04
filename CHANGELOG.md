# Changelog

All notable changes to the b0t-at design foundation. Versions are git tags (`vX.Y.Z`); CDN consumers pin to them.

## 0.1.0 — 2026-09-04

Initial foundation.

- Tokens: OKLCH primitive scales (ink, petrol, moss, amber, rust, plum), semantic roles for light and dark, typography, spacing, radius, shadow, motion, layout.
- Build: `scripts/build-tokens.mjs` generates `css/tokens.css`, `css/b0t.css`, `tailwind/theme.css`, `dist/tokens.{json,mjs}` with a WCAG contrast gate.
- CSS: `base.css` (reset, type, focus), `components.css` (button, field, input, select, textarea, checkbox, switch, card, stat, badge, alert, table, tabs, topbar, nav, sidenav, breadcrumb, kbd, menu, dialog, toast, progress, spinner, skeleton, avatar, empty state, page header, footer), `utilities.css` (container, stack, cluster, grid, prose, text helpers, visually-hidden, skip link).
- Brand: wordmark (light/dark/mono), dotted-zero mark, app icon, theme-aware favicon, OG template, usage rules.
- Docs: principles, color, typography, layout, components, motion, accessibility, content, iconography & imagery, for-agents, framework recipes.
- Templates: `starter.html`, Copilot instructions snippet for consuming repos.
- Examples: `showcase.html` kitchen sink.
