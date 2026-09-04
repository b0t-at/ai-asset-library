<p><img src="brand/logo/b0t-wordmark.svg#gh-light-mode-only" alt="b0t" height="40"><img src="brand/logo/b0t-wordmark-dark.svg#gh-dark-mode-only" alt="b0t" height="40"></p>

# ai-asset-library — the b0t-at design foundation

Tokens, CSS, a Tailwind theme, brand assets and written guidelines that make every b0t-at frontend look and behave like the same well-made instrument. Other repositories (and the agents working in them) consume this; nothing here is specific to one product.

**Precise. Warm. Unhurried.** Warm paper and ink neutrals, one petrol accent, IBM Plex, hairline structure, quiet motion. Details and reasoning in [`docs/principles.md`](docs/principles.md).

## Use it in a project

> The repository is currently **private**, so the jsDelivr CDN URLs will 404 until it is made public. Meanwhile vendor the bundle (`gh api -H "Accept: application/vnd.github.raw" repos/b0t-at/ai-asset-library/contents/css/b0t.css > static/b0t.css`) or install via npm from GitHub — see [`docs/for-agents.md`](docs/for-agents.md).

Plain HTML / server-rendered:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/css/b0t.css">
```

Node / Tailwind v4:

```sh
npm i github:b0t-at/ai-asset-library @fontsource-variable/ibm-plex-sans @fontsource/ibm-plex-mono
```

```css
@import "tailwindcss";
@import "@b0t-at/design/css/tokens.css";
@import "@b0t-at/design/css/base.css";
@import "@b0t-at/design/tailwind/theme.css";
```

Full instructions, rules and the pre-PR checklist: **[`docs/for-agents.md`](docs/for-agents.md)**. Paste [`templates/copilot-instructions.snippet.md`](templates/copilot-instructions.snippet.md) into your repo so agents follow the system.

## What is in here

| Path | Contents |
| --- | --- |
| [`tokens/`](tokens) | Source of truth. DTCG-style JSON; colors authored in OKLCH on a shared lightness ramp. |
| [`css/`](css) | `tokens.css` (variables, light + dark), `base.css` (reset/type/focus), `components.css` (`b0t-*` components), `utilities.css`, `b0t.css` (everything, one file). |
| [`tailwind/theme.css`](tailwind/theme.css) | Tailwind v4 `@theme` mapping utilities to the runtime variables. Replaces the default palette. |
| [`dist/`](dist) | Resolved tokens as JSON and ESM for charts, scripts, emails. |
| [`brand/`](brand) | Wordmark, mark, app icon, favicon, OG template, webmanifest, generated PNGs and [usage rules](brand/README.md). |
| [`docs/`](docs) | [Principles](docs/principles.md) · [Color](docs/color.md) · [Typography](docs/typography.md) · [Layout](docs/layout.md) · [Components](docs/components.md) · [Motion](docs/motion.md) · [Accessibility](docs/accessibility.md) · [Content](docs/content.md) · [Icons & imagery](docs/iconography-imagery.md) · [For agents](docs/for-agents.md) · [Recipes](docs/recipes.md) |
| [`examples/showcase.html`](examples/showcase.html) | Every component, both themes. Open it in a browser or `npm run preview`. |
| [`templates/`](templates) | `starter.html` page skeleton, Copilot instructions snippet. |

## Working on the system

```sh
npm run build     # regenerate css/tokens.css, css/b0t.css, tailwind/theme.css, dist/*, brand/png/* — fails on WCAG contrast violations
npm run check     # CI: build is deterministic and committed output is current
npm run preview   # http://localhost:4173/examples/showcase.html
```

No dependencies; Node 20+. Edit `tokens/*.json`, never the generated files. See [`AGENTS.md`](AGENTS.md) for the maintainer workflow and rules.

## Versioning

Semantic versions as git tags. Pin the CDN URL (`@v0.1.0`) or the npm dependency (`github:b0t-at/ai-asset-library#v0.1.0`) in production. Changes that consumers can see are listed in [`CHANGELOG.md`](CHANGELOG.md).