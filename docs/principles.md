# Principles

Five rules that decide every visual question in a b0t project. When two rules conflict, the earlier one wins.

## 1. Clarity over decoration

Every pixel earns its place by helping someone understand or act. If removing an element does not reduce understanding, remove it. No gradients as decoration, no glass, no blobs, no floating abstract shapes, no gradient text.

## 2. Structure through hairlines, not shadows

Layout is communicated with 1px borders (`--b0t-color-border`) and background steps (`bg` → `bg-subtle` → `surface`). Shadows are reserved for things that actually float: menus, popovers, dialogs, dragged items. A card on a page has a border, not a shadow.

## 3. One accent, used sparingly

Petrol is the only brand color in product UI. It marks the primary action, the current selection, focus, and links — and nothing else. If a screen has more than one primary button visible, something is wrong. Success, warning and danger colors are reserved for state, never for emphasis or branding.

## 4. Type carries hierarchy

Hierarchy comes from size, weight and color of text — not from boxes, icons or color fills. Two weights (400, 600) and the type scale are enough for almost everything. Headings are semibold and tight; body text is regular and roomy.

## 5. Quiet motion, honest states

Motion is 120–320 ms, eases out, and only signals a state change. Nothing bounces. Loading, empty, error and success states are designed with the same care as the happy path, using plain language.

---

## What "not AI-made" means in practice

The tell-tale signs we avoid — because they are noise, not because they are trendy:

| Avoid | Do instead |
| --- | --- |
| Purple/indigo → blue gradients, gradient text | Flat petrol on warm paper / ink |
| Frosted-glass cards, glowing borders | Hairline borders on a solid surface |
| Everything rounded 16–24px | 6px controls, 8px cards, 12px dialogs |
| Big drop shadows on every card | Borders; shadows only for floating layers |
| Inter/Poppins/Montserrat everywhere | IBM Plex Sans + IBM Plex Mono |
| Emoji as section icons, emoji in headings | Lucide icons at 1.75px stroke, or nothing |
| Three-column "feature grid" with icon-title-blurb | Real content: screenshots, tables, code |
| Hero with centered headline + two buttons + mockup | Left-aligned, specific headline; show the product |
| Vague copy ("Supercharge your workflow") | Say what it does: "Keeps winget packages up to date" |
| Isometric 3D illustrations, robot mascots | Monoline diagrams, actual UI, photographs |
| Rainbow status colors and badges everywhere | Neutral badges by default; color only for state |

## Personality in three words

**Precise. Warm. Unhurried.**

Precise like a good terminal. Warm because the neutrals are paper and ink, not blue-gray. Unhurried because nothing flashes, jumps or begs for attention.
