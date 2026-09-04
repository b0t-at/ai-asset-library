# Copilot instructions — ai-asset-library

This repo is the b0t-at design foundation. Read `AGENTS.md` first; it explains the layout and the maintenance workflow.

Key constraints:

- Edit token sources in `tokens/*.json`, then run `npm run build`. Never edit `css/tokens.css`, `css/b0t.css`, `tailwind/theme.css` or `dist/*` by hand.
- The build has a WCAG contrast gate. If it fails, change the token, not the threshold.
- New semantic colors go into both light and dark files.
- New components: `css/components.css` + `docs/components.md` + `examples/showcase.html`, verified in both themes.
- Keep `scripts/build-tokens.mjs` dependency-free.
- Voice: English, sentence case, no emoji, no marketing adjectives (see `docs/content.md`).
- Don't introduce other fonts, icon sets, palettes or UI libraries.
- `npm run check` must pass before a PR.
