# Typography

## Typefaces

| Role | Family | Why |
| --- | --- | --- |
| UI & body | **IBM Plex Sans** (variable if available) | Engineered, neutral but not anonymous, excellent at 13–16px, full Latin/German coverage, OFL licensed. |
| Code, data, identifiers | **IBM Plex Mono** | Same family, so mixed lines (`Microsoft.PowerToys` in a sentence) look intentional. |

No display font. Headlines are Plex Sans semibold with tight tracking. This restraint is part of the identity.

### Loading

Self-host via Fontsource (preferred for apps) or use the Fontsource CDN (fine for static pages):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/500.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/600.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-mono@latest/index.css">
```

```sh
npm i @fontsource-variable/ibm-plex-sans @fontsource/ibm-plex-mono
```

```js
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono";
```

Only load weights 400, 500, 600 (and mono 400). Use `font-display: swap` (Fontsource default). The token stack falls back to `system-ui`, which is acceptable — never block rendering on fonts.

## Scale

| Token | Size | Use |
| --- | --- | --- |
| `xs` | 12px | badges, table meta, eyebrow labels. **Floor.** |
| `sm` | 14px | dense UI: buttons, inputs, table cells, secondary text |
| `md` | 16px | body default |
| `lg` | 18px | lead paragraph, h4 |
| `xl` | 20px | h3 |
| `2xl` | 24px | h2 |
| `3xl` | 28–36px fluid | h1 |
| `4xl` | 34–48px fluid | page hero (`.b0t-display`) |
| `5xl` | 40–60px fluid | marketing only |

Ratio is ~1.2 at the small end and widens toward the top, so headings are clearly separated while UI text stays dense.

## Weights

- **400 regular** — body, inputs, table cells
- **500 medium** — buttons, labels, nav items, badges
- **600 semibold** — all headings, emphasized values, `<strong>`
- **700 bold** — not used in UI. Reserved for the rare marketing headline.

## Line height & tracking

| Context | Leading | Tracking |
| --- | --- | --- |
| Display / h1 | 1.15 | −0.02em |
| h2 | 1.3 | −0.02em |
| h3–h6, buttons, labels | 1.3 | 0 |
| UI body | 1.5 | 0 |
| Long-form prose | 1.65 | 0 |
| Eyebrow (uppercase xs) | 1.5 | +0.06em |

## Rules

1. **Measure.** Body text lives in ≤ 65ch (`--b0t-layout-container-prose`). Wider is fine for tables and dashboards, not for paragraphs.
2. **Numbers align.** Use `font-variant-numeric: tabular-nums` (`.b0t-tabular`) in tables, stats, timers and anywhere numbers stack.
3. **Identifiers are mono.** Package IDs, versions, hashes, paths, commands → `<code>` or `.b0t-mono`. Not italics, not quotes.
4. **Sentence case** for headings, buttons, labels, menu items. Title Case is not used. UPPERCASE only for the eyebrow label.
5. **No text under 12px.** No text in `fg-subtle` that the user needs to read.
6. **Headings are semibold, never colored.** Emphasis in a heading comes from a muted secondary line, not from a petrol word.
7. **Use `text-wrap: balance`** on headings and `pretty` on paragraphs (the base stylesheet does this).
8. **German and English** both appear in b0t projects. Leave room: German labels are ~30 % longer. Never fix widths on buttons.
