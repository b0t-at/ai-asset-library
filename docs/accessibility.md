# Accessibility

Target: **WCAG 2.2 AA** for every b0t interface, enforced where possible by the build, otherwise by this checklist.

## Enforced by tokens

- Body text ≥ 7 : 1, UI/muted text ≥ 4.5 : 1, borders/focus ≥ 3 : 1 — checked on every `npm run build`.
- Focus ring: 2px `focus-ring` with 2px offset on every focusable element (`css/base.css`). Never `outline: none` without a replacement of equal visibility.
- Minimum text size 12px; body 16px.
- Motion collapses under `prefers-reduced-motion`.
- `color-scheme` is set so native controls and scrollbars match the theme.

## Checklist for every screen

### Structure
- [ ] One `<h1>`, headings in order, no skipped levels for styling reasons
- [ ] Landmarks: `<header>`, `<nav aria-label>`, `<main id="main">`, `<footer>`; skip link (`.b0t-skip-link`) as first focusable element
- [ ] `<html lang="en">` or `"de"` — correct for the page content
- [ ] Page `<title>` is specific: "Open pull requests · winget-pkgs-updates"

### Controls
- [ ] Every input has a visible `<label for>`; placeholder is not the label
- [ ] Icon-only buttons have `aria-label`; decorative SVGs have `aria-hidden="true"`
- [ ] Buttons are `<button>`, links are `<a href>`. No `div onclick`
- [ ] Touch targets ≥ 24 × 24px (WCAG 2.2) — our 28px small button is the floor; prefer 36px
- [ ] Custom controls (tabs, menus, switches) carry the right `role` and `aria-*` state and work with arrow keys where the pattern requires

### Feedback
- [ ] Errors: `aria-invalid`, `aria-describedby` → message that says how to fix it; focus moves to the first invalid field on submit
- [ ] Live updates (toasts, "saved", counters) use `role="status"`; only real emergencies use `role="alert"`
- [ ] Status is never color-only: dot + text, icon + text
- [ ] Loading states announce: `aria-busy="true"` on the region, spinner has `aria-label` or accompanying text

### Content
- [ ] Images have `alt` that says what matters, or `alt=""` if decorative
- [ ] Link text makes sense alone ("View log for run #4127", not "click here")
- [ ] Tables have `<th scope>`; complex data tables have `<caption>`
- [ ] Time is absolute or has a `<time datetime>`; "2 min ago" gets a `title` with the full timestamp

### Keyboard
- [ ] Tab order follows visual order
- [ ] Dialogs trap focus (native `<dialog>` does), return focus on close, close on Esc
- [ ] Menus close on Esc and on outside click; the Popover API gives this for free
- [ ] Nothing requires hover to be discovered; tooltips also show on focus

### Themes & zoom
- [ ] Works in light and dark
- [ ] Works at 200 % zoom and at 360px width without horizontal scrolling of text
- [ ] Works with `forced-colors: active` (Windows High Contrast): borders remain, focus remains — test once

## Testing

- Keyboard-only pass through every flow.
- Automated: axe (browser extension or `@axe-core/playwright`) — zero violations.
- Screen reader sanity check (NVDA on Windows, VoiceOver on macOS) for new patterns.
- Contrast is verified by the token build; do not override token colors in component code.
