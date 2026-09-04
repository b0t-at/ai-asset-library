# Layout & spacing

## Spacing

4px unit. Tokens `--b0t-space-{1,2,3,4,5,6,8,10,12,16,20,24,32}` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px. Tailwind `p-4` etc. map onto the same unit.

| Relationship | Space |
| --- | --- |
| Icon ↔ label inside a control | 8 |
| Label ↔ input | 4 |
| Between form fields | 20 |
| Inside a card | 20 |
| Between cards in a grid | 16 |
| Between sections on a page | 40–64 |
| Page header top padding | 32 |

**Rule of proximity:** things that belong together sit closer than things that don't. Related items 8–12px, groups 24–32px, sections 48px+.

## Containers

| Token | Width | Use |
| --- | --- | --- |
| `container-sm` | 640px | login, single-purpose tools, wizards |
| `container-md` | 768px | settings, docs, forms |
| `container-lg` | 1024px | default app content |
| `container-xl` | 1152px | dashboards, tables |
| `container-2xl` | 1280px | data-dense views. Hard ceiling; never wider. |
| `container-prose` | 65ch | paragraphs |

Horizontal page padding is `--b0t-layout-gutter` = `clamp(1rem, 4vw, 2rem)`.

## Breakpoints

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 (rem-based). Design mobile-first; most b0t tools are used on desktop, but every view must work at 360px wide.

Prefer intrinsic layouts over breakpoints: `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))` (`.b0t-grid`), `flex-wrap` (`.b0t-cluster`), `clamp()` for type and gutters.

## Page anatomy

```
┌ topbar (56px, sticky, hairline bottom) ──────────────────────┐
│ wordmark · nav                               actions · theme │
├──────────────────────────────────────────────────────────────┤
│ [sidenav 224px]  page header (eyebrow, h1, description, cta) │
│                  ─────────────────────────────────────────── │
│                  content in container-lg/xl                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ footer (hairline top, muted)                                 │
└──────────────────────────────────────────────────────────────┘
```

- **Topbar**: 56px tall, `bg` at 92 % with blur, 1px `border` bottom. Wordmark left, primary nav next to it, utilities right.
- **Sidenav** (app shells only): 224px, `bg-subtle`, 1px `border` right, items 36px tall with 16px icons.
- **Page header**: eyebrow (optional) → h1 → one-line description → primary action on the right. Left-aligned. Never centered on app pages.
- **Content**: cards and tables in a grid or a single column. Do not nest cards inside cards.
- **Footer**: small, muted, one line. Copyright, link to b0t.at, link to source.

## Elevation & z-index

| Layer | z | Shadow |
| --- | --- | --- |
| page, cards | auto | none (border) |
| dropdown, menu, popover | 100 | `md` |
| sticky topbar | 200 | none (border) |
| overlay scrim | 300 | — |
| dialog, drawer, command palette | 400 | `lg` |
| toast | 500 | `md` |

## Radius

Controls 6px (`md`), cards & popovers 8px (`lg`), dialogs 12px (`xl`), avatars/pills `full`. Nested radii shrink: a button inside an 8px card is still 6px; an image inside an 8px card is 4px if it touches the edge.

## Rules

1. Use the scale. If you find yourself typing `13px` or `0.35rem`, pick the nearest token.
2. Align to a single left edge per region. Ragged left edges are the most common layout bug.
3. Actions go right, navigation goes left, destructive actions go last (and far from the primary).
4. Max one sidebar. Tabs for switching views within a page, sidenav for switching pages.
5. Empty space is a feature. When in doubt, add 8px rather than a border.
