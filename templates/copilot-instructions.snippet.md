<!--
  Paste this into .github/copilot-instructions.md (or AGENTS.md) of any b0t-at repository
  that has a frontend. Keep it short; link to the design repo for detail.
-->

## Design system

This project follows the **b0t-at design foundation**: https://github.com/b0t-at/ai-asset-library — read `docs/for-agents.md` there before touching any UI.

Non-negotiables:

- Use the shared tokens (`--b0t-*` CSS variables via the `b0t.css` CDN bundle, or the Tailwind v4 theme from `@b0t-at/design`). No hex codes, no Tailwind default palette, no primitive scales in project code.
- Fonts: IBM Plex Sans (400/500/600) for UI, IBM Plex Mono for identifiers and code. No other fonts.
- Icons: Lucide, 16px in controls, stroke 1.75. No emoji in UI.
- One petrol primary action per view. Success/warning/danger colors only for state.
- Hairline borders for structure; shadows only on menus, popovers, dialogs, toasts.
- Radius 6px controls, 8px cards, 12px dialogs. Spacing on the 4px scale.
- Sentence case everywhere; verbs on buttons; errors say how to fix; no exclamation marks; no marketing words.
- Light and dark themes both work (`data-theme` + `prefers-color-scheme`). Never hard-code `#fff`/`#000`.
- WCAG 2.2 AA: labelled inputs, `aria-label` on icon buttons, visible focus, keyboard operable, status never by color alone.
- Motion 120–320ms ease-out on opacity/transform only; honor `prefers-reduced-motion`.
- Favicon is `brand/favicon.svg` from the design repo (PNG fallbacks and a `site.webmanifest` template are in `brand/png/` and `brand/`); `<meta name="color-scheme" content="light dark">` is present.

Before opening a PR with UI changes, run through the checklist in `docs/for-agents.md` §5 and check the screen in both themes at 360px and 1280px.
