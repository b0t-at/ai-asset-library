#!/usr/bin/env node
// Builds all generated artifacts from the token sources in tokens/.
//
//   node scripts/build-tokens.mjs          build
//   node scripts/build-tokens.mjs --check  build to memory and fail if committed output is stale
//
// Outputs:
//   css/tokens.css        CSS custom properties (light + dark)
//   css/b0t.css           single-file bundle: tokens + base + components + utilities
//   tailwind/theme.css    Tailwind v4 @theme block mapping to the runtime variables
//   dist/tokens.json      flat, resolved tokens (hex) for tooling
//   dist/tokens.mjs       same as ESM
//
// Zero dependencies on purpose.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PREFIX = "b0t";
const check = process.argv.includes("--check");
const VERSION = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

// ---------------------------------------------------------------------------
// Color math: OKLCH -> sRGB hex with chroma-reducing gamut mapping.
// ---------------------------------------------------------------------------

function oklchToLinearSrgb(L, C, h) {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

function gammaEncode(v) {
  v = Math.min(1, Math.max(0, v));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

function oklchToHex(L, C, h) {
  let rgb = oklchToLinearSrgb(L, C, h);
  if (!inGamut(rgb)) {
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      rgb = oklchToLinearSrgb(L, mid, h);
      inGamut(rgb) ? (lo = mid) : (hi = mid);
    }
    rgb = oklchToLinearSrgb(L, lo, h);
  }
  return (
    "#" +
    rgb
      .map((v) => Math.round(gammaEncode(v) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function parseOklch(str) {
  const m = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/.exec(str);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return { L: +m[1], C: +m[2], h: +m[3], alpha };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Alpha-composite `fg` (hex with alpha byte) over `bg` for contrast estimates.
function flatten(fgHex8, bgHex6) {
  if (fgHex8.length !== 9) return fgHex8;
  const a = parseInt(fgHex8.slice(7, 9), 16) / 255;
  const fg = hexToRgb(fgHex8), bg = hexToRgb(bgHex6);
  return (
    "#" +
    fg
      .map((c, i) => Math.round(c * a + bg[i] * (1 - a)).toString(16).padStart(2, "0"))
      .join("")
  );
}

// ---------------------------------------------------------------------------
// Token loading + resolution
// ---------------------------------------------------------------------------

const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const primitives = readJson("tokens/color.primitives.json");
const light = readJson("tokens/color.semantic.light.json");
const dark = readJson("tokens/color.semantic.dark.json");
const typography = readJson("tokens/typography.json");
const space = readJson("tokens/space.json");
const radius = readJson("tokens/radius.json");
const shadow = readJson("tokens/shadow.json");
const motion = readJson("tokens/motion.json");
const layout = readJson("tokens/layout.json");

// Flatten {a:{b:{$value}}} into Map("a.b" -> token)
function flattenTokens(obj, path = [], out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    if (v && typeof v === "object" && "$value" in v) out.set([...path, k].join("."), v);
    else if (v && typeof v === "object") flattenTokens(v, [...path, k], out);
  }
  return out;
}

const primitiveMap = flattenTokens(primitives);

// Resolve a color value: "{color.petrol.500}" refs, optional "/ alpha" suffix, oklch(), or hex.
function resolveColor(value, map = primitiveMap) {
  let v = value.trim();
  let alpha = 1;
  const alphaMatch = /^(\{[^}]+\})\s*\/\s*([\d.]+%?)$/.exec(v);
  if (alphaMatch) {
    v = alphaMatch[1];
    alpha = alphaMatch[2].endsWith("%") ? parseFloat(alphaMatch[2]) / 100 : parseFloat(alphaMatch[2]);
  }
  if (v.startsWith("{")) {
    const ref = v.slice(1, -1);
    const t = map.get(ref);
    if (!t) throw new Error(`Unresolved token reference ${value}`);
    v = resolveColor(t.$value, map);
  }
  const ok = parseOklch(v);
  if (ok) {
    v = oklchToHex(ok.L, ok.C, ok.h);
    alpha *= ok.alpha;
  }
  if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v)) throw new Error(`Cannot resolve color ${value}`);
  if (alpha < 1) {
    v = v.slice(0, 7) + Math.round(alpha * 255).toString(16).padStart(2, "0");
  }
  return v.toLowerCase();
}

// Generic (non-color) resolver: refs to any loaded file.
const allNonColor = new Map([
  ...flattenTokens(typography, ["font"]),
  ...flattenTokens(space, ["space"]),
  ...flattenTokens(radius, ["radius"]),
  ...flattenTokens(shadow, ["shadow"]),
  ...flattenTokens(motion, ["motion"]),
  ...flattenTokens(layout, ["layout"]),
]);

function resolveValue(value) {
  if (typeof value !== "string") return String(value);
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const t = allNonColor.get(ref);
    if (t) return resolveValue(t.$value);
    if (primitiveMap.has(ref) || ref.startsWith("color.")) return resolveColor(`{${ref}}`);
    throw new Error(`Unresolved reference {${ref}}`);
  });
}

const cssVar = (path) => `--${PREFIX}-${path.replace(/\./g, "-")}`;

// ---------------------------------------------------------------------------
// Build semantic color sets
// ---------------------------------------------------------------------------

const lightMap = flattenTokens(light, ["color"]);
const darkMap = flattenTokens(dark, ["color"]);

for (const key of lightMap.keys()) {
  if (!darkMap.has(key)) throw new Error(`Dark theme is missing semantic token ${key}`);
}
for (const key of darkMap.keys()) {
  if (!lightMap.has(key)) throw new Error(`Light theme is missing semantic token ${key}`);
}

const semanticLight = new Map([...lightMap].map(([k, t]) => [k, resolveColor(t.$value)]));
const semanticDark = new Map([...darkMap].map(([k, t]) => [k, resolveColor(t.$value)]));

// ---------------------------------------------------------------------------
// Contrast gate — the build fails if these pairs drop below WCAG AA.
// Format: [foreground, background, minimum]
// ---------------------------------------------------------------------------

const contrastPairs = [
  ["color.fg", "color.bg", 7],
  ["color.fg", "color.surface", 7],
  ["color.fg", "color.bg-subtle", 7],
  ["color.fg", "color.bg-inset", 4.5],
  ["color.fg-muted", "color.bg", 4.5],
  ["color.fg-muted", "color.surface", 4.5],
  ["color.fg-muted", "color.bg-subtle", 4.5],
  ["color.fg-subtle", "color.bg", 3],
  ["color.accent-fg", "color.bg", 4.5],
  ["color.accent-fg", "color.surface", 4.5],
  ["color.link", "color.bg", 4.5],
  ["color.fg-on-accent", "color.accent", 4.5],
  ["color.fg-on-accent", "color.accent-hover", 4.5],
  ["color.accent-subtle-fg", "color.accent-subtle", 4.5],
  ["color.success-fg", "color.bg", 4.5],
  ["color.success-subtle-fg", "color.success-subtle", 4.5],
  ["color.warning-fg", "color.bg", 4.5],
  ["color.warning-subtle-fg", "color.warning-subtle", 4.5],
  ["color.danger-fg", "color.bg", 4.5],
  ["color.danger-subtle-fg", "color.danger-subtle", 4.5],
  ["color.fg-on-danger", "color.danger", 4.5],
  ["color.fg-on-success", "color.success", 4.5],
  ["color.fg-on-warning", "color.warning", 4.5],
  ["color.border-strong", "color.bg", 3],
  ["color.focus-ring", "color.bg", 3],
];

function contrastReport(name, map) {
  const bg = map.get("color.bg");
  let failed = false;
  const rows = contrastPairs.map(([fgKey, bgKey, min]) => {
    const bgHex = flatten(map.get(bgKey), bg);
    const fgHex = flatten(map.get(fgKey), bgHex);
    const ratio = contrast(fgHex, bgHex);
    const ok = ratio >= min;
    if (!ok) failed = true;
    return `${ok ? "  ok " : " FAIL"}  ${ratio.toFixed(2).padStart(5)}  (min ${min})  ${fgKey} on ${bgKey}`;
  });
  return { text: `\n[${name}]\n${rows.join("\n")}`, failed };
}

// ---------------------------------------------------------------------------
// Emit css/tokens.css
// ---------------------------------------------------------------------------

function emitBlock(map) {
  return [...map].map(([k, v]) => `  ${cssVar(k)}: ${v};`).join("\n");
}

const primitiveCss = [...primitiveMap]
  .map(([k, t]) => `  ${cssVar(k)}: ${resolveColor(t.$value)};`)
  .join("\n");

const nonColorCss = [...allNonColor]
  .map(([k, t]) => `  ${cssVar(k)}: ${resolveValue(t.$value)};`)
  .join("\n");

const banner = `/* b0t design tokens v${VERSION} — generated by scripts/build-tokens.mjs. Do not edit by hand. */`;

const tokensCss = `${banner}

:root {
  color-scheme: light;

  /* Primitives — reference only; product UI uses the semantic tokens below. */
${primitiveCss}

  /* Typography, space, radius, shadow, motion, layout */
${nonColorCss}

  /* Semantic colors — light */
${emitBlock(semanticLight)}
}

:root[data-theme="dark"] {
  color-scheme: dark;
${emitBlock(semanticDark)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${emitBlock(semanticDark).replace(/^/gm, "  ")}
  }
}
`;

// ---------------------------------------------------------------------------
// Emit tailwind/theme.css (Tailwind v4, CSS-first)
// ---------------------------------------------------------------------------

function tailwindTheme() {
  const lines = [];
  lines.push(`/* b0t Tailwind v4 theme v${VERSION} — generated by scripts/build-tokens.mjs. Do not edit by hand.
 *
 *   @import "tailwindcss";
 *   @import "@b0t-at/design/css/tokens.css";
 *   @import "@b0t-at/design/css/base.css";
 *   @import "@b0t-at/design/tailwind/theme.css";
 *
 * Utilities become: bg-bg, bg-surface, text-fg, text-fg-muted, border-border,
 * bg-accent, text-accent-fg, rounded-md, shadow-md, font-sans, font-mono,
 * text-sm … text-5xl, leading-snug, tracking-tight, max-w-lg, ease-standard, ...
 * The default Tailwind palette, fonts, radii, shadows, text sizes and breakpoints
 * are replaced so product UI can only use b0t values.
 */
@theme {
  --color-*: initial;
  --font-*: initial;
  --radius-*: initial;
  --shadow-*: initial;
  --breakpoint-*: initial;
  --container-*: initial;
  --text-*: initial;
  --leading-*: initial;
  --tracking-*: initial;
  --ease-*: initial;
}

@theme inline {`);

  for (const k of semanticLight.keys()) {
    const name = k.replace(/^color\./, "");
    lines.push(`  --color-${name}: var(${cssVar(k)});`);
  }
  lines.push("");
  for (const k of primitiveMap.keys()) {
    lines.push(`  --color-${k.replace(/^color\./, "").replace(/\./g, "-")}: var(${cssVar(k)});`);
  }
  lines.push("");
  for (const [k] of flattenTokens(typography.family, ["font"])) {
    lines.push(`  --font-${k.split(".").pop()}: var(${cssVar("font.family." + k.split(".").pop())});`);
  }
  // Text sizes: Tailwind calls "md" "base". Default line-heights follow docs/typography.md.
  const textLeading = { xs: "normal", sm: "normal", base: "normal", lg: "normal", xl: "snug", "2xl": "snug", "3xl": "tight", "4xl": "tight", "5xl": "tight" };
  const textTracking = { "2xl": "tight", "3xl": "tight", "4xl": "tight", "5xl": "tight" };
  for (const [k] of flattenTokens(typography.size, ["font.size"])) {
    const step = k.split(".").pop();
    const tw = step === "md" ? "base" : step;
    lines.push(`  --text-${tw}: var(${cssVar(k)});`);
    lines.push(`  --text-${tw}--line-height: var(${cssVar("font.leading." + textLeading[tw])});`);
    if (textTracking[tw]) lines.push(`  --text-${tw}--letter-spacing: var(${cssVar("font.tracking." + textTracking[tw])});`);
  }
  for (const [k] of flattenTokens(typography.leading, ["font.leading"])) {
    lines.push(`  --leading-${k.split(".").pop()}: var(${cssVar(k)});`);
  }
  for (const [k] of flattenTokens(typography.tracking, ["font.tracking"])) {
    lines.push(`  --tracking-${k.split(".").pop()}: var(${cssVar(k)});`);
  }
  for (const [k] of flattenTokens(radius, ["radius"])) {
    lines.push(`  --radius-${k.split(".").pop()}: var(${cssVar(k)});`);
  }
  for (const [k] of flattenTokens(shadow, ["shadow"])) {
    lines.push(`  --shadow-${k.split(".").pop()}: var(${cssVar(k)});`);
  }
  for (const [k, t] of flattenTokens(layout.breakpoint, ["layout.breakpoint"])) {
    // Breakpoints and containers are used in media/container queries — inline the value.
    lines.push(`  --breakpoint-${k.split(".").pop()}: ${resolveValue(t.$value)};`);
  }
  for (const [k, t] of flattenTokens(layout.container, ["layout.container"])) {
    lines.push(`  --container-${k.split(".").pop()}: ${resolveValue(t.$value)};`);
  }
  for (const [k] of flattenTokens(motion.easing, ["motion.easing"])) {
    lines.push(`  --ease-${k.split(".").pop()}: var(${cssVar(k)});`);
  }
  lines.push(`  --default-transition-duration: var(${cssVar("motion.duration.fast")});`);
  lines.push(`  --default-transition-timing-function: var(${cssVar("motion.easing.standard")});`);
  lines.push(`  --spacing: var(${cssVar("space.unit")});`);
  lines.push("}");
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Emit dist/tokens.json + dist/tokens.mjs
// ---------------------------------------------------------------------------

const flat = {};
for (const [k, t] of primitiveMap) flat[k] = resolveColor(t.$value);
for (const k of semanticLight.keys()) flat[k] = { light: semanticLight.get(k), dark: semanticDark.get(k) };
for (const [k, t] of allNonColor) flat[k] = resolveValue(t.$value);

const distJson = JSON.stringify({ version: VERSION, prefix: PREFIX, tokens: flat }, null, 2) + "\n";
const distMjs = `// b0t design tokens v${VERSION} — generated. Do not edit by hand.
export const version = ${JSON.stringify(VERSION)};
export const prefix = ${JSON.stringify(PREFIX)};
export const tokens = ${JSON.stringify(flat, null, 2)};
export const cssVar = (path) => \`var(--${PREFIX}-\${path.replace(/\\./g, "-")})\`;
export default tokens;
`;

// ---------------------------------------------------------------------------
// Bundle css/b0t.css
// ---------------------------------------------------------------------------

const bundleParts = ["css/base.css", "css/components.css", "css/utilities.css"];
const bundle =
  `/* b0t.css v${VERSION} — single-file bundle (tokens + base + components + utilities). Generated. */\n\n@layer base, components, utilities;\n\n` +
  tokensCss +
  "\n" +
  bundleParts
    .map((p) => `/* ===== ${p} ===== */\n` + readFileSync(join(root, p), "utf8").replace(/@import[^;]+;\s*/g, ""))
    .join("\n");

// ---------------------------------------------------------------------------
// Write / check
// ---------------------------------------------------------------------------

const outputs = {
  "css/tokens.css": tokensCss,
  "css/b0t.css": bundle,
  "tailwind/theme.css": tailwindTheme(),
  "dist/tokens.json": distJson,
  "dist/tokens.mjs": distMjs,
};

const reports = [contrastReport("light", semanticLight), contrastReport("dark", semanticDark)];
console.log("Contrast gate (WCAG 2.x)" + reports.map((r) => r.text).join(""));
if (reports.some((r) => r.failed)) {
  console.error("\nContrast gate failed. Adjust tokens/color.semantic.*.json.");
  process.exit(1);
}

let stale = [];
for (const [rel, content] of Object.entries(outputs)) {
  const abs = join(root, rel);
  const normalized = content.replace(/\r\n/g, "\n");
  if (check) {
    const current = existsSync(abs) ? readFileSync(abs, "utf8").replace(/\r\n/g, "\n") : "";
    if (current !== normalized) stale.push(rel);
  } else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, normalized);
    console.log(`wrote ${rel}`);
  }
}

if (check && stale.length) {
  console.error(`\nGenerated files are out of date: ${stale.join(", ")}\nRun: npm run build`);
  process.exit(1);
}
if (check) console.log("\nGenerated files are up to date.");
