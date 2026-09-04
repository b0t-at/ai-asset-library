# Iconography & imagery

## Icons

**Lucide** (`lucide`, `lucide-react`, `lucide-svelte`, `lucide-vue-next`, `@lucide/…`, or inline SVG). ISC licensed, consistent 24px grid, stroke-based — it matches the monoline logo.

| Context | Size | Stroke |
| --- | --- | --- |
| inside buttons, inputs, badges | 16px | 1.75 |
| nav items, table actions | 16–20px | 1.75 |
| alerts, empty states | 20–32px | 1.5 |

Rules:
- Set `stroke-width="1.75"` (Lucide default is 2 — slightly heavy next to Plex).
- Icons inherit `currentColor`. Never fill them with a brand color unless they *are* the status indicator.
- Decorative icons get `aria-hidden="true"`; meaningful ones get an `aria-label` or accompanying text.
- One icon set per project. Do not mix Lucide with Heroicons/Font Awesome/Material.
- No emoji as icons.
- Do not put every nav item behind an icon just because there is a slot; if half the items have no obvious icon, drop all icons.

## Logo usage

See [`brand/README.md`](../brand/README.md). Summary: wordmark in the topbar at 24px height; mark alone for favicon, app icon and avatars; never recolor beyond the provided variants; clear space = height of the "0".

## Imagery

b0t tools rarely need imagery. When they do:

- **Screenshots** of the actual product, in the actual theme, on a `bg-subtle` background with a 1px `border` and 8px radius. Optionally a simple window frame. No perspective tilt, no device mockups, no glow.
- **Diagrams**: monoline, 1.5px strokes, `fg-muted` lines, `accent` for the one thing that matters, Plex Mono labels. Excalidraw's "architect" style or Mermaid with the b0t theme is fine.
- **Photos** (rare, marketing only): real, unretouched, natural light. No stock "team high-five", no abstract 3D renders, no generated art.

## Never

- Isometric or 3D illustrations, "tech" abstract blobs, glowing grids
- Robot mascots or the legacy AI-generated avatar in product UI
- Gradient meshes, aurora backgrounds, noise textures as decoration
- Icon "feature grids" (icon + title + two lines × 3) on landing pages
- Stock photography
- Generated imagery presented as a photograph

## Social preview (Open Graph)

Use `brand/og-template.svg` (1200 × 630): ink background, wordmark, repo path, title, one-line description. Export to PNG at 1200 × 630; set `<meta property="og:image">` and `twitter:card="summary_large_image"`.
