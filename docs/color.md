# Color

## How it is built

Colors are authored in **OKLCH** on a shared lightness ramp, so every scale (ink, petrol, moss, amber, rust, plum) has the same perceived lightness at the same step. The build converts them to sRGB hex with gamut mapping. Source: `tokens/color.primitives.json`.

Product UI never touches primitives. It uses **semantic roles** (`tokens/color.semantic.{light,dark}.json`) which are exposed as CSS variables `--b0t-color-*` and as Tailwind utilities (`bg-surface`, `text-fg-muted`, …).

## The palette

| Scale | Hue | Role |
| --- | --- | --- |
| **ink** | warm neutral (h 80) | backgrounds, text, borders. Paper `#f7f7f6` and near-black `#110f0d` — never pure white or pure black as page backgrounds. |
| **petrol** | teal-blue (h 205) | the single brand accent. `#00646d` light, `#4cb8c4` dark. |
| **moss** | green (h 150) | success only |
| **amber** | yellow-orange (h 75) | warning only |
| **rust** | red (h 28) | danger only |
| **plum** | violet (h 320) | data visualization only |

## Semantic roles

### Backgrounds

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | ink 50 | ink 1000 | page |
| `bg-subtle` | ink 100 | ink 950 | sidebars, table heads, secondary panels |
| `bg-inset` | ink 100 | ink 1000 | code blocks, wells, disabled fields |
| `surface` | ink 0 | ink 950 | cards, inputs, popovers, dialogs |
| `surface-hover` | ink 100 | ink 900 | hovered rows / menu items |
| `bg-overlay` | ink 1000 / 48 % | ink 1000 / 70 % | dialog scrim |

In light mode the page is warm paper and surfaces are white — the page is *darker* than the cards. In dark mode the page is the darkest thing and surfaces step up. Both directions read as "the card is closer to me".

### Text

| Token | Min contrast on `bg` | Use |
| --- | --- | --- |
| `fg` | 7 : 1 | headings, body |
| `fg-muted` | 4.5 : 1 | descriptions, meta, labels |
| `fg-subtle` | 3 : 1 | placeholders, decorative icons — **never** essential text |
| `fg-disabled` | — | disabled controls |
| `fg-on-accent` / `-success` / `-warning` / `-danger` | 4.5 : 1 on the fill | text on solid fills |

### Accent and state

Each of `accent`, `success`, `warning`, `danger` comes as a family:

- `<x>` — solid fill (primary button, progress fill, status dot)
- `<x>-fg` — colored text/icon on `bg`/`surface`
- `<x>-subtle` — tinted background (badge, callout, selected row)
- `<x>-subtle-fg` — text on that tint
- `<x>-border` — border around a tint

Plus `accent-hover`, `accent-active`, `danger-hover`, `link`, `link-hover`, `focus-ring`, `selection`.

### Dark mode rule for fills

In dark mode solid fills are **light with dark text** (`accent` = petrol 400, `fg-on-accent` = ink 1000). Saturated dark fills with white text glow and vibrate on dark backgrounds; light fills stay calm and pass contrast easily.

## Rules

1. **Use roles, not scales.** `var(--b0t-color-accent)` — never `var(--b0t-color-petrol-700)` in product code.
2. **One accent per view.** One primary button. Links and the current nav item may also be petrol. Nothing else.
3. **State colors mean state.** Green = succeeded, amber = needs attention, red = failed/destructive. Never use them for categories or decoration.
4. **Never color alone.** Pair status colors with an icon, a label or a dot + text so color-blind users get the same information.
5. **No gradients** in UI. The only exception is a data visualization that encodes a continuous value.
6. **No transparency tricks** for text. Muted text is `fg-muted`, not `fg` at 60 % opacity.
7. **Both themes always.** Every screen must be checked in light and dark. The build fails if a semantic role exists in one theme and not the other.

## Contrast gate

`npm run build` prints a WCAG contrast table for the critical pairs and **fails** if any pair drops below its minimum (7 : 1 for body text, 4.5 : 1 for muted/UI text and text on fills, 3 : 1 for borders and large elements). Do not lower minimums; adjust the token.

## Data visualization

Use `chart-1` … `chart-6` in order (petrol, amber, plum, moss, rust, ink). For sequential data use one hue's scale (e.g. petrol 200 → 800). Never encode meaning in red/green alone; add labels.

## Theming in code

```html
<html data-theme="dark">   <!-- force dark -->
<html data-theme="light">  <!-- force light -->
<html>                     <!-- follow the OS -->
```

Add `<meta name="color-scheme" content="light dark">` and `<meta name="theme-color" content="#f7f7f6" media="(prefers-color-scheme: light)">` / `"#110f0d"` for dark. Persist an explicit choice in `localStorage` and apply it before first paint to avoid flashes.
