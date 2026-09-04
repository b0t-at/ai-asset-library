# For agents (and humans in a hurry)

You are building or changing a frontend in a `b0t-at` repository. This page is the contract. Read it once, then follow the checklist at the bottom for every UI change.

## 1. Get the tokens in

Pick one. Never copy hex codes into your project.

> **Repository visibility.** `ai-asset-library` is currently a **private** repository. The jsDelivr CDN URLs below only work once it is public; until then use the vendored bundle or the npm/git install (both work with your existing GitHub credentials). Check with `curl -sI https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/css/b0t.css` — 200 means the CDN is live.

**A. Plain HTML / server-rendered (Flask, FastAPI, Go templates, static sites) — vendored bundle**

Copy the single-file bundle and the favicon into your static folder (needs `gh` authenticated to the org):

```sh
gh api -H "Accept: application/vnd.github.raw" repos/b0t-at/ai-asset-library/contents/css/b0t.css > static/b0t.css
gh api -H "Accept: application/vnd.github.raw" repos/b0t-at/ai-asset-library/contents/brand/favicon.svg > static/favicon.svg
```

The first line of `b0t.css` carries the version (`/* b0t.css v0.1.1 … */`) so you can see what you vendored. Re-run to update. Then:

```html
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/500.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/600.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-mono@latest/index.css">
<link rel="stylesheet" href="/static/b0t.css">
```

Then use the `b0t-*` classes from [`components.md`](components.md). Copy [`templates/starter.html`](../templates/starter.html) as the page skeleton (it references the CDN; swap the two `b0t-at/ai-asset-library` URLs for your vendored paths while the repo is private).

**B. Plain HTML — CDN** (once the repo is public)

```html
<link rel="icon" href="https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/brand/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/css/b0t.css">
```

Pin `@main` to a tag (`@v0.1.1`) for production.

**C. Node project (Vite, SvelteKit, Next, Nuxt, Astro, Solid)**

```sh
npm i github:b0t-at/ai-asset-library @fontsource-variable/ibm-plex-sans @fontsource/ibm-plex-mono
```

Pin with `github:b0t-at/ai-asset-library#v0.1.1`. CI needs a token with read access to the org (e.g. `GH_TOKEN` + `git config --global url."https://x-access-token:${GH_TOKEN}@github.com/".insteadOf "https://github.com/"`) as long as the repo is private.

```css
/* app.css */
@import "@fontsource-variable/ibm-plex-sans";
@import "@fontsource/ibm-plex-mono";
@import "@b0t-at/design/css/tokens.css";
@import "@b0t-at/design/css/base.css";
/* optional, for plain-HTML style components: */
/* @import "@b0t-at/design/css/components.css"; */
```

**D. With Tailwind v4** (preferred for framework projects — this is what most b0t repos use):

```css
@import "tailwindcss";
@import "@fontsource-variable/ibm-plex-sans";
@import "@fontsource/ibm-plex-mono";
@import "@b0t-at/design/css/tokens.css";
@import "@b0t-at/design/css/base.css";
@import "@b0t-at/design/tailwind/theme.css";
```

The theme **replaces** Tailwind's palette, fonts, radii, shadows, text sizes, breakpoints and containers. `bg-blue-500` no longer exists; `bg-accent`, `text-fg-muted`, `border-border`, `bg-surface`, `rounded-md`, `shadow-md`, `font-mono`, `text-sm … text-5xl` (with b0t line-heights), `leading-snug`, `tracking-tight`, `max-w-lg` (1024px) … `max-w-2xl` (1280px), `max-w-prose` (65ch), `ease-standard` do. `transition-*` utilities default to 120ms / standard easing. If a class you want is missing, add a semantic token here — do not reach for arbitrary values like `bg-[#00646d]`.

`base.css` and `components.css` live in the cascade layers `base` and `components`, the same names Tailwind uses, so Tailwind utilities always win over them. Your own unlayered CSS wins over everything.

**DaisyUI**: do not add it to new projects. Existing projects keep it until migrated; when touching a DaisyUI project, map its theme variables to b0t tokens (`--color-primary: var(--b0t-color-accent)` etc.) rather than introducing a third palette.

**JS access to tokens** (charts, canvas, emails):

```js
import { tokens, cssVar } from "@b0t-at/design/dist/tokens.mjs";
tokens["color.accent"].light // "#00646d"
cssVar("color.accent")       // "var(--b0t-color-accent)"
```

## 2. The rules that matter most

1. **Semantic tokens only.** `var(--b0t-color-accent)` / `bg-accent`. Never hex, never primitive scales (`petrol-700`), never Tailwind defaults.
2. **One primary action per view.** Everything else is secondary or ghost.
3. **Borders, not shadows.** Cards have a 1px `border`. Shadows only on menus, popovers, dialogs, toasts.
4. **Radius**: controls 6px, cards 8px, dialogs 12px. Nothing else.
5. **Type**: Plex Sans 400/500/600, Plex Mono for identifiers. Headings semibold, sentence case, never colored. Body 16px, UI 14px, floor 12px.
6. **Both themes.** Test light and dark. Never hard-code `#fff` or `#000`.
7. **Icons**: Lucide, 16px in controls, stroke 1.75, `aria-hidden` when decorative. No emoji.
8. **Motion**: 120/200/320ms, ease-out, opacity/transform only. Nothing bounces. Respect reduced motion.
9. **Copy**: sentence case, verbs on buttons, no exclamation marks, no marketing words, say how to fix errors. See [`content.md`](content.md).
10. **Accessibility**: labels on inputs, `aria-label` on icon buttons, visible focus, keyboard works, status not by color alone. See [`accessibility.md`](accessibility.md).

## 3. What a b0t page looks like

- Sticky 56px topbar: wordmark left (24px, `brand/logo/b0t-wordmark*.svg` or inline), nav, utilities right, theme toggle.
- Left-aligned page header: optional eyebrow, h1, one-line description, primary action right.
- Content in `container-lg` (1024) or `container-xl` (1152) for tables/dashboards.
- Cards on the page background, tables in a bordered wrapper, forms in a single column ≤ 640px.
- One-line muted footer.

See it rendered: [`examples/showcase.html`](../examples/showcase.html) (open the file in a browser).

## 4. Things you must not do

- Introduce another font, icon set, color palette or component library
- Use gradients, glassmorphism, glow, big shadows, 16px+ radii on controls
- Use purple/indigo/violet for anything but chart series 3
- Center-align app page headers or body text
- Put emoji in UI, headings or generated commit messages
- Write "Supercharge", "seamless", "powerful", "effortless", "AI-powered"
- Remove focus outlines
- Ship a screen you have only seen in one theme

## 5. Checklist before you open a PR

```
[ ] tokens imported (CDN or package), no hex/primitives in project CSS or classes
[ ] fonts: Plex Sans + Plex Mono loaded, weights 400/500/600 only
[ ] one primary button per view; destructive actions are red and last
[ ] hairline borders; shadows only on floating layers
[ ] radii 6/8/12; spacing on the 4px scale
[ ] every input labelled; icon buttons have aria-label; focus visible
[ ] status uses icon/text + color, never color alone
[ ] copy: sentence case, verbs on buttons, errors say how to fix
[ ] checked in light AND dark, at 360px AND 1280px, with keyboard only
[ ] favicon = brand/favicon.svg; <title> is specific; color-scheme meta present
```

## 6. When the system doesn't cover your case

Build it from the tokens following [`components.md` → Building your own component](components.md#building-your-own-component). If the pattern will recur in other repos, open a PR against this repository adding it to `css/components.css`, `docs/components.md` and `examples/showcase.html`. Do not fork the design locally.
