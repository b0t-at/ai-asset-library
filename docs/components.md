# Components

Reference behaviour for the components in `css/components.css`. Framework projects (Svelte, React, Vue, Solid) rebuild these with the same tokens and the same rules; the class names are a convention, not a requirement. The live rendering is in `examples/showcase.html`.

## Button `.b0t-btn`

| Variant | When |
| --- | --- |
| `--primary` | the one main action of the view (petrol fill) |
| *(default)* | secondary actions (surface, 1px `border-strong`) |
| `--ghost` | tertiary, toolbar, icon-only, "Cancel" |
| `--danger` | destructive confirmations only — never as the first button a user sees |

Sizes `--sm` 28px · default 36px · `--lg` 44px. `--icon` makes it square; give it `aria-label`. `--block` for full width on mobile only.

Rules: one primary per view · verb-first labels ("Create manifest", not "Submit") · loading state replaces the icon with `.b0t-spinner` and keeps the label · disabled = 50 % opacity, never hide the button.

## Form field `.b0t-field`

`label` → control → `.b0t-hint` or `.b0t-error`. Labels above inputs, always visible (no placeholder-as-label). Required fields get `data-required` on the label (renders `*`). Errors set `aria-invalid="true"` on the control and `aria-describedby` to the error id; the message says how to fix it, not just that it's wrong.

Inputs: 36px tall, `surface` background, 1px `border-strong`, 6px radius, 14px text. Focus = 2px petrol border + 3px 25 % ring. Monospace inputs (`--mono`) for identifiers, versions, paths.

Checkbox/radio use native controls with `accent-color`. Switch `.b0t-switch` for immediate-effect settings; checkbox for things submitted with a form.

## Card `.b0t-card`

`surface` + 1px `border` + 8px radius + 20px padding. No shadow. `--interactive` (whole card is a link) gets `border-strong` + `surface-hover` on hover. `--flush` for cards containing tables or media. Header = title + optional description + optional badge/action right. Footer = actions right-aligned above a hairline.

Do not nest cards. Do not put a card on `surface` (it would be white on white) — cards sit on `bg` or `bg-subtle`.

## Badge `.b0t-badge`

12px, medium weight, 4px radius. Default is neutral (`bg-subtle`); `--accent` for versions/labels, `--success/--warning/--danger` for state. `--dot` adds a status dot. Badges are nouns ("Merged", "v1.4.0"), never actions.

## Alert `.b0t-alert`

Tinted callout with icon + title + body. `role="status"` for info/success/warning, `role="alert"` only for errors that need immediate attention. Inline, near the thing it refers to; page-level alerts go directly under the page header. Do not stack more than one.

## Table `.b0t-table`

Wrapped in `.b0t-table-wrap` (border, radius, horizontal scroll). Headers 12px muted on `bg-subtle`. Rows 36px, hover `surface-hover`. Numbers right-aligned with `.is-numeric`. Identifiers in mono. Row actions as ghost `--sm` buttons in the last column. `--dense` for log-like data.

Prefer a table over a grid of cards whenever items have the same fields.

## Tabs `.b0t-tabs`

Underline tabs, 2px petrol indicator, muted labels. `role="tablist"` / `role="tab"` with `aria-selected`, or links with `aria-current`. Counts go in a neutral badge after the label.

## Navigation

- `.b0t-topbar` sticky, blurred `bg`, hairline bottom. Brand left (wordmark, 24px high), `.b0t-nav` links, utilities right.
- `.b0t-sidenav` vertical list; current item = `accent-subtle` background + `accent-fg` text. 16px Lucide icons.
- `.b0t-breadcrumb` for depth ≥ 2. Slash separators.

## Menu `.b0t-menu`

Works with the Popover API (`popover` attribute + `popovertarget`). 8px radius, `md` shadow, 4px inner padding, items 36px. Destructive item last, after a separator, in `danger-fg`.

## Dialog `.b0t-dialog`

Native `<dialog>`, `showModal()`. 12px radius, `lg` shadow, scrim `bg-overlay`. Body 24px padding; footer on `bg-subtle` with actions right (cancel ghost, confirm primary or danger). Title asks the question the buttons answer: "Close 3 pull requests?" → "Close pull requests". Max width 512px. Enters with 320ms fade+rise.

## Toast `.b0t-toast`

Bottom-right region, 384px, `md` shadow. One sentence, optional action, auto-dismiss ≥ 6s for info, persistent for errors. Never use toasts for validation errors — those go next to the field.

## Progress, spinner, skeleton

`.b0t-progress` 6px track, petrol fill, `--value` in %. `.b0t-spinner` 16px, currentColor, for inline waiting. `.b0t-skeleton` for content placeholders — match the shape of the final content, max 1.4s pulse.

## Empty state `.b0t-empty`

Dashed border, icon, title, one sentence, one action. Says what will appear here and how to make it appear.

## Stat `.b0t-stat`

Label (14px muted) above a 24px semibold tabular value. Colored values only for state (`b0t-text-danger` for failures).

## Page header `.b0t-page-header`

Eyebrow (optional) → h1 → description (muted, ≤ 60ch) with actions aligned to the bottom right. 32px top / 24px bottom padding.

## Footer `.b0t-footer`

Hairline top, 14px muted, one row: "© b0t-at · b0t.at" left, source link right.

---

## Building your own component

1. Start from an existing one; reuse its tokens and heights (28/36/44).
2. Use `surface`/`border`/`fg-*` roles — never primitives, never hex.
3. Every interactive element: visible `:focus-visible`, `:hover`, `:disabled`, and a reduced-motion-safe transition ≤ 200ms.
4. Keyboard first: if it can be clicked it can be tabbed to and activated with Enter/Space.
5. Check it in light **and** dark before you ship.
