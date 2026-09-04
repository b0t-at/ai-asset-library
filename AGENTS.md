# AGENTS.md — b0t-at design foundation

This repository is the **single source of truth for how every b0t-at frontend looks and behaves**. Agents working in *other* b0t-at repositories consume it; agents working *here* maintain it.

## If you are working in another b0t-at repo

Read [`docs/for-agents.md`](docs/for-agents.md). It tells you how to pull in the tokens (CDN or `npm i github:b0t-at/ai-asset-library`), the ten rules that matter, and the pre-PR checklist. Everything else in `docs/` is detail you consult when a question comes up.

Short version: semantic tokens only · Plex Sans/Mono · one petrol primary action · hairline borders, no shadows on cards · radii 6/8/12 · Lucide icons, no emoji · both themes · sentence case · WCAG AA.

Copy [`templates/copilot-instructions.snippet.md`](templates/copilot-instructions.snippet.md) into that repo's `.github/copilot-instructions.md` so future agents there follow the system.

## If you are working in this repo

### Layout

```
tokens/      source of truth (W3C DTCG-style JSON, colors in OKLCH)
scripts/     build-tokens.mjs — zero-dependency generator + contrast gate
css/         tokens.css (generated) · base.css · components.css · utilities.css · b0t.css (generated bundle)
tailwind/    theme.css (generated Tailwind v4 @theme)
dist/        tokens.json / tokens.mjs (generated, resolved hex)
brand/       logo SVGs, favicon, OG template, brand rules
docs/        the guidelines
examples/    showcase.html — kitchen sink, must render every component
templates/   starter.html, copilot-instructions snippet for other repos
```

### Workflow

1. Change a token → edit `tokens/*.json` (never the generated files).
2. `npm run build` — regenerates `css/tokens.css`, `css/b0t.css`, `tailwind/theme.css`, `dist/*` and prints the contrast table. **The build fails if any WCAG pair drops below its minimum.** Fix the token, don't lower the bar.
3. Change a component → edit `css/components.css`, document it in `docs/components.md`, add it to `examples/showcase.html`.
4. Open `examples/showcase.html` in a browser (or run `npm run preview`) and check **light and dark**.
5. `npm run check` must pass (build is deterministic and committed output is current). CI runs the same.
6. Bump `version` in `package.json` and add a `CHANGELOG.md` entry for anything consumers can see. Tag releases `vX.Y.Z` so CDN users can pin.

### Rules for maintainers

- Adding a semantic color role requires it in **both** `color.semantic.light.json` and `color.semantic.dark.json` and, if text-bearing, a row in `contrastPairs` in the build script.
- No new primitive hues without a written reason in `docs/color.md`. The palette is intentionally small.
- No new fonts. No second icon set. No component that only one repo needs.
- Generated files carry a "generated" banner; never hand-edit them.
- Keep the build dependency-free (Node ≥ 20 built-ins only).
- Docs are in English, sentence case, no emoji, no marketing language — the same voice rules as product UI ([`docs/content.md`](docs/content.md)).
- Do not add a license file or change ownership metadata without the org owner's instruction.
