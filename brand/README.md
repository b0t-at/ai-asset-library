# Brand assets

## The mark

`b0t` set in three monoline glyphs. The **dotted zero** is the mark — a lens, an eye, a terminal zero. It stands alone as favicon, app icon and avatar.

| File | Use |
| --- | --- |
| `logo/b0t-wordmark.svg` | on light backgrounds (ink letters, petrol zero) |
| `logo/b0t-wordmark-dark.svg` | on dark backgrounds (paper letters, light petrol zero) |
| `logo/b0t-wordmark-mono.svg` | single color via `currentColor` — print, embossing, disabled states |
| `logo/b0t-mark.svg` | the zero alone, petrol |
| `logo/b0t-mark-mono.svg` | the zero alone, `currentColor` |
| `logo/b0t-app-icon.svg` | 512 × 512, petrol tile with paper zero — PWA icon, GitHub org avatar, Docker Hub |
| `favicon.svg` | theme-aware (light: petrol, dark: light petrol). Use as `<link rel="icon" type="image/svg+xml">` |
| `og-template.svg` | 1200 × 630 social preview template |

Inline SVG in a topbar (adapts to theme automatically):

```html
<svg viewBox="0 0 170 74" height="24" fill="none" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" aria-label="b0t" role="img">
  <g stroke="currentColor"><path d="M17 10V64"/><circle cx="37" cy="44" r="20"/></g>
  <g stroke="var(--b0t-color-accent)"><circle cx="96" cy="44" r="20"/><circle cx="96" cy="44" r="7" fill="var(--b0t-color-accent)" stroke="none"/></g>
  <g stroke="currentColor"><path d="M139 12V52q0 12 12 12"/><path d="M127 24h26"/></g>
</svg>
```

## Sizing

| Context | Height |
| --- | --- |
| topbar wordmark | 24px |
| footer wordmark | 20px |
| README header wordmark | 40px |
| mark as avatar | 32–40px |
| favicon | 16/32px (SVG scales) |

Minimum wordmark height 16px. Below that use the mark alone.

## Clear space

Keep at least the height of the zero's ring (≈ 0.6 × wordmark height) free on all sides. Nothing touches the logo.

## Color

- Light backgrounds: ink `#222120` + petrol `#00646d`
- Dark backgrounds: paper `#f7f7f6` + petrol-light `#4cb8c4`
- Single color: any one of `fg`, `fg-on-accent`, or the accent — via the mono files
- App icon: petrol `#00646d` tile, paper glyph, 22 % corner radius

## Don't

- Recolor the letters or the zero to another hue
- Add gradients, shadows, outlines, glow
- Stretch, rotate, italicize, or set it in a font
- Place it on busy imagery or on a colored background other than petrol
- Use the legacy AI-generated avatar or the `assets` repo's traced bitmap in new work
- Write it as "B0T", "b0T", "Bot" or "b-zero-t" in text — it's `b0t`, lowercase, digit zero

## Exporting PNGs

Any SVG renderer works. With Inkscape:

```sh
inkscape brand/logo/b0t-app-icon.svg -w 512 -o icon-512.png
inkscape brand/logo/b0t-app-icon.svg -w 192 -o icon-192.png
inkscape brand/favicon.svg -w 32 -o favicon-32.png
```

Or in Node: `npx sharp-cli -i brand/logo/b0t-app-icon.svg -o icon-512.png resize 512`.
