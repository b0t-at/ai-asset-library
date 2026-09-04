# Motion

Motion in b0t products is a whisper: it confirms that something changed and where it went. If a user notices the animation itself, it is too much.

## Tokens

| Duration | Value | Use |
| --- | --- | --- |
| `fast` | 120ms | hover/focus color, toggles, checkbox, tab indicator |
| `base` | 200ms | menus, popovers, tooltips, expand/collapse, toasts |
| `slow` | 320ms | dialogs, drawers, route transitions |
| `deliberate` | 500ms | progress completing, success check. Rare. |

| Easing | Curve | Use |
| --- | --- | --- |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | default; quick start, soft stop |
| `enter` | `cubic-bezier(0, 0, 0.2, 1)` | element appears |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | element leaves — use ~60 % of the enter duration |
| `linear` | `linear` | spinners, indeterminate progress |

## Patterns

- **Appear**: opacity 0→1 + translate 8px→0 (or scale 0.98→1 for popovers anchored to a trigger). Never slide from off-screen unless it is a drawer.
- **Disappear**: opacity only, `exit` easing, `fast`.
- **Hover**: color/border only. No scale, no lift, no shadow growth on buttons or cards.
- **Press**: `translateY(0.5px)` is the maximum.
- **Reorder / layout change**: animate `transform`/`opacity`, never `width`/`height`/`margin`. For height use `grid-template-rows: 0fr → 1fr` or the View Transitions API.
- **Skeletons**: opacity pulse, 1.4s, `standard` easing. No shimmer gradients.
- **Page transitions**: `slow` crossfade at most. Prefer none.

## Never

- Bounce, spring overshoot, elastic easing
- Parallax, scroll-jacking, scroll-triggered reveals of content
- Animated gradients, glowing borders, pulsing CTAs
- Auto-playing carousels
- Animation longer than 500ms for anything the user is waiting on
- Animating `box-shadow`, `filter`, `backdrop-filter`

## Reduced motion

`css/base.css` collapses all transitions and animations under `prefers-reduced-motion: reduce`. When you write custom motion, gate it:

```css
@media (prefers-reduced-motion: no-preference) {
  .thing { transition: translate var(--b0t-motion-duration-base) var(--b0t-motion-easing-standard); }
}
```

Loading indicators may still animate under reduced motion (they convey information) but should use opacity, not rotation, where possible.
