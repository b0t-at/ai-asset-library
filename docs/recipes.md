# Framework recipes

Concrete wiring for the stacks used across b0t-at. All recipes assume the tokens are installed as described in [`for-agents.md`](for-agents.md).

## Theme toggle (any stack)

Apply the stored theme before first paint to avoid a flash, then toggle `data-theme`.

```html
<script>
  (function () {
    var t = localStorage.getItem("b0t-theme");
    if (t) document.documentElement.dataset.theme = t;
  })();
</script>
```

```js
export function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem("b0t-theme", root.dataset.theme);
}
```

## SvelteKit + Tailwind v4

`src/app.css`

```css
@import "tailwindcss";
@import "@fontsource-variable/ibm-plex-sans";
@import "@fontsource/ibm-plex-mono";
@import "@b0t-at/design/css/tokens.css";
@import "@b0t-at/design/css/base.css";
@import "@b0t-at/design/tailwind/theme.css";
```

`src/lib/components/Button.svelte`

```svelte
<script lang="ts">
  let { variant = "secondary", size = "md", ...rest } = $props();
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium leading-none whitespace-nowrap border transition-colors duration-[120ms] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-accent text-fg-on-accent border-transparent hover:bg-accent-hover",
    secondary: "bg-surface text-fg border-border-strong hover:bg-surface-hover",
    ghost: "bg-transparent text-fg-muted border-transparent hover:bg-surface-hover hover:text-fg",
    danger: "bg-danger text-fg-on-danger border-transparent hover:bg-danger-hover",
  };
  const sizes = { sm: "h-7 px-2 text-xs", md: "h-9 px-3 text-sm", lg: "h-11 px-5 text-base" };
</script>

<button class="{base} {variants[variant]} {sizes[size]}" {...rest}>
  <slot />
</button>
```

`src/app.html` — add `<meta name="color-scheme" content="light dark">` and the theme bootstrap script in `<head>`.

## React (Vite / Next) + Tailwind v4

Same CSS as above. Component pattern with `clsx`:

```tsx
const card = "rounded-lg border border-border bg-surface p-5";
const input = "h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring/25 aria-invalid:border-danger";
```

For Next.js put the theme bootstrap in `app/layout.tsx` as an inline `<script dangerouslySetInnerHTML>` in `<head>` with `suppressHydrationWarning` on `<html>`.

## Vue / Nuxt

Same CSS. In Nuxt, `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  css: ["~/assets/app.css"],
  app: {
    head: {
      meta: [{ name: "color-scheme", content: "light dark" }],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
});
```

Copy `brand/favicon.svg` to `public/favicon.svg`.

## Solid

Identical to React for CSS; use `classList` or template literals for variants.

## Plain HTML / Python (Flask, FastAPI + Jinja), Go templates

Use the CDN bundle and `b0t-*` classes. Base template:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>{% block title %}{% endblock %} · {{ app_name }}</title>
  <link rel="icon" href="https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/index.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/500.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-sans@latest/600.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/css/ibm-plex-mono@latest/index.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/b0t-at/ai-asset-library@main/css/b0t.css">
  <script>var t=localStorage.getItem("b0t-theme");if(t)document.documentElement.dataset.theme=t;</script>
</head>
<body>
  {% include "_topbar.html" %}
  <main id="main" class="b0t-container">{% block content %}{% endblock %}</main>
  {% include "_footer.html" %}
</body>
</html>
```

See [`templates/starter.html`](../templates/starter.html) for a complete static page.

## Streamlit / Gradio / other opinionated UIs

Inject a `<style>` block with `css/tokens.css` contents and override the framework's theme variables to point at `--b0t-*`. Don't fight the framework's layout; match colors, fonts and radii.

## Mermaid diagrams (README, docs)

```
%%{init: {"theme": "base", "themeVariables": {
  "primaryColor": "#d3f4f8", "primaryTextColor": "#222120", "primaryBorderColor": "#00646d",
  "lineColor": "#595855", "secondaryColor": "#ededeb", "tertiaryColor": "#f7f7f6",
  "fontFamily": "IBM Plex Sans, system-ui, sans-serif", "fontSize": "14px"
}}}%%
```

## Charts (Chart.js, ECharts, D3, Recharts)

```js
import { tokens } from "@b0t-at/design/dist/tokens.mjs";
const theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const series = [1, 2, 3, 4, 5, 6].map((i) => tokens[`color.chart-${i}`][theme]);
const grid = tokens["color.border"][theme];
const text = tokens["color.fg-muted"][theme];
```

Gridlines `border`, axis text `fg-muted` 12px Plex Sans, no chart title inside the canvas (use the card title), legends as text not squares where possible.

## Emails

Inline the resolved light-theme hex values from `dist/tokens.json` (email clients ignore CSS variables). Plex won't load; the stack falls back to system sans — acceptable.
