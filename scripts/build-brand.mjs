#!/usr/bin/env node
// Rasterises the brand marks to PNG without any dependencies.
//
//   node scripts/build-brand.mjs          write brand/png/*
//   node scripts/build-brand.mjs --check  fail if committed PNGs differ (compares decoded pixels,
//                                         so zlib differences between Node versions don't matter)
//
// The shapes mirror brand/logo/*.svg exactly (same coordinates), drawn as signed-distance
// fields with 1px analytic anti-aliasing. If you change an SVG, change the geometry here too.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "brand", "png");
const check = process.argv.includes("--check");

// Brand colors (resolved values of the tokens — see dist/tokens.json).
const PETROL = [0x00, 0x64, 0x6d];
const PETROL_LIGHT = [0x4c, 0xb8, 0xc4];
const INK = [0x22, 0x21, 0x20];
const PAPER = [0xf7, 0xf7, 0xf6];

// ---------------------------------------------------------------------------
// Signed distance functions (negative inside). All in shape units.
// ---------------------------------------------------------------------------

const len = (x, y) => Math.hypot(x, y);

const disc = (cx, cy, r) => (x, y) => len(x - cx, y - cy) - r;
const ring = (cx, cy, r, w) => (x, y) => Math.abs(len(x - cx, y - cy) - r) - w / 2;

function capsule(ax, ay, bx, by, w) {
  const dx = bx - ax, dy = by - ay, dd = dx * dx + dy * dy;
  return (x, y) => {
    const t = dd === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / dd));
    return len(x - (ax + t * dx), y - (ay + t * dy)) - w / 2;
  };
}

// Circular arc from angle a0 to a1 (degrees, screen coords: 0 = right, 90 = down) with round caps.
function arc(cx, cy, r, a0, a1, w) {
  const toRad = (d) => (d * Math.PI) / 180;
  const p0 = [cx + r * Math.cos(toRad(a0)), cy + r * Math.sin(toRad(a0))];
  const p1 = [cx + r * Math.cos(toRad(a1)), cy + r * Math.sin(toRad(a1))];
  return (x, y) => {
    let a = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    if (a < 0) a += 360;
    const inside = a0 <= a1 ? a >= a0 && a <= a1 : a >= a0 || a <= a1;
    if (inside) return Math.abs(len(x - cx, y - cy) - r) - w / 2;
    return Math.min(len(x - p0[0], y - p0[1]), len(x - p1[0], y - p1[1])) - w / 2;
  };
}

function roundedRect(cx, cy, hw, hh, rad) {
  return (x, y) => {
    const qx = Math.abs(x - cx) - hw + rad, qy = Math.abs(y - cy) - hh + rad;
    return Math.min(Math.max(qx, qy), 0) + len(Math.max(qx, 0), Math.max(qy, 0)) - rad;
  };
}

const union = (...fns) => (x, y) => Math.min(...fns.map((f) => f(x, y)));

// ---------------------------------------------------------------------------
// Artwork — coordinates copied from the SVG sources.
// ---------------------------------------------------------------------------

// brand/logo/b0t-mark.svg (64 × 64)
const markGlyph = union(ring(32, 32, 20, 8), disc(32, 32, 6.5));

// brand/logo/b0t-app-icon.svg (512 × 512)
const appTile = roundedRect(256, 256, 256, 256, 112);
const appGlyph = union(ring(256, 256, 160, 64), disc(256, 256, 52));

// brand/logo/b0t-wordmark.svg (170 × 74)
const wordLetters = union(
  capsule(17, 10, 17, 64, 10), // b stem
  ring(37, 44, 20, 10), // b bowl
  capsule(139, 12, 139, 52, 10), // t stem
  arc(151, 52, 12, 90, 180, 10), // t hook: M139 52 a12 12 0 0 0 12 12
  capsule(127, 24, 153, 24, 10), // t bar
);
const wordZero = union(ring(96, 44, 20, 10), disc(96, 44, 7));

// ---------------------------------------------------------------------------
// Rasteriser
// ---------------------------------------------------------------------------

// layers: [{ sdf, rgb }] painted in order onto a transparent canvas.
function render(width, height, unitsW, unitsH, layers, padding = 0) {
  const scale = Math.min((width - 2 * padding) / unitsW, (height - 2 * padding) / unitsH);
  const ox = (width - unitsW * scale) / 2, oy = (height - unitsH * scale) / 2;
  const px = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ux = (x + 0.5 - ox) / scale, uy = (y + 0.5 - oy) / scale;
      let r = 0, g = 0, b = 0, a = 0;
      for (const { sdf, rgb } of layers) {
        const cov = Math.min(1, Math.max(0, 0.5 - sdf(ux, uy) * scale));
        if (cov <= 0) continue;
        // "over" compositing, straight alpha
        const na = cov + a * (1 - cov);
        r = (rgb[0] * cov + r * a * (1 - cov)) / na;
        g = (rgb[1] * cov + g * a * (1 - cov)) / na;
        b = (rgb[2] * cov + b * a * (1 - cov)) / na;
        a = na;
      }
      const i = (y * width + x) * 4;
      px[i] = Math.round(r);
      px[i + 1] = Math.round(g);
      px[i + 2] = Math.round(b);
      px[i + 3] = Math.round(a * 255);
    }
  }
  return px;
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder / IDAT reader
// ---------------------------------------------------------------------------

const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function scanlines(px, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    px.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return raw;
}

function encodePng(px, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines(px, width, height), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function decodeScanlines(png) {
  const parts = [];
  let pos = 8;
  while (pos < png.length) {
    const size = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") parts.push(png.subarray(pos + 8, pos + 8 + size));
    pos += 12 + size;
  }
  return inflateSync(Buffer.concat(parts));
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

const tile = (rgb) => [{ sdf: appTile, rgb }];
const targets = [
  // App icon (opaque petrol tile) — PWA / manifest / store icons and PNG favicons.
  { file: "app-icon-512.png", w: 512, h: 512, units: [512, 512], layers: [...tile(PETROL), { sdf: appGlyph, rgb: PAPER }] },
  { file: "app-icon-192.png", w: 192, h: 192, units: [512, 512], layers: [...tile(PETROL), { sdf: appGlyph, rgb: PAPER }] },
  { file: "apple-touch-icon.png", w: 180, h: 180, units: [512, 512], layers: [...tile(PETROL), { sdf: appGlyph, rgb: PAPER }] },
  { file: "favicon-32.png", w: 32, h: 32, units: [512, 512], layers: [...tile(PETROL), { sdf: appGlyph, rgb: PAPER }] },
  { file: "favicon-16.png", w: 16, h: 16, units: [512, 512], layers: [...tile(PETROL), { sdf: appGlyph, rgb: PAPER }] },
  // Mark alone, transparent background.
  { file: "mark-256.png", w: 256, h: 256, units: [64, 64], layers: [{ sdf: markGlyph, rgb: PETROL }] },
  { file: "mark-256-dark.png", w: 256, h: 256, units: [64, 64], layers: [{ sdf: markGlyph, rgb: PETROL_LIGHT }] },
  // Wordmark at 4×, transparent background.
  { file: "wordmark-680.png", w: 680, h: 296, units: [170, 74], layers: [{ sdf: wordLetters, rgb: INK }, { sdf: wordZero, rgb: PETROL }] },
  { file: "wordmark-dark-680.png", w: 680, h: 296, units: [170, 74], layers: [{ sdf: wordLetters, rgb: PAPER }, { sdf: wordZero, rgb: PETROL_LIGHT }] },
];

mkdirSync(outDir, { recursive: true });
let stale = [];
for (const t of targets) {
  const px = render(t.w, t.h, t.units[0], t.units[1], t.layers);
  const file = join(outDir, t.file);
  if (check) {
    const current = existsSync(file) ? decodeScanlines(readFileSync(file)) : Buffer.alloc(0);
    if (!current.equals(scanlines(px, t.w, t.h))) stale.push(`brand/png/${t.file}`);
  } else {
    writeFileSync(file, encodePng(px, t.w, t.h));
    console.log(`wrote brand/png/${t.file} (${t.w}×${t.h})`);
  }
}

if (check && stale.length) {
  console.error(`Brand PNGs are out of date: ${stale.join(", ")}\nRun: npm run build:brand`);
  process.exit(1);
}
if (check) console.log("Brand PNGs are up to date.");
