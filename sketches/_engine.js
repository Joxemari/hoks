/* hoks · motor compartido — canvas 2D, sin dependencias, sin build.
 *
 * Fuente única de las primitivas que usan TODAS las obras (laboratorio y web):
 * RNG determinista, helpers de color, mesh gradient, grano de film y utilidades
 * de paleta. Se carga como <script> normal y expone todo en window.HOKS.
 *
 *   <script src="../_engine.js"></script>   →   window.HOKS.Rng, .applyGrain, …
 */
(function (global) {
  'use strict';

  // ── RNG (LCG). Mismo seed → mismo resultado. ───────────────────────────────
  class Rng {
    constructor(s) { this.s = (s | 0) >>> 0; }
    next()        { this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0; return this.s / 4294967296; }
    int(a, b)     { return Math.floor(a + this.next() * (b - a + 1)); }
    range(a, b)   { return a + this.next() * (b - a); }
    bool(p)       { return this.next() < p; }
    pickFrom(arr) { return arr[this.int(0, arr.length - 1)]; }
    weighted(items) { let v = this.next(), acc = 0; for (const it of items) { acc += it.prob; if (v < acc) return it; } return items[items.length - 1]; }
  }

  // ── Color ──────────────────────────────────────────────────────────────────
  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function luma(h) { const [r, g, b] = hexToRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
  function lerpColor(c1, c2, t) {
    const [r1, g1, b1] = hexToRgb(c1), [r2, g2, b2] = hexToRgb(c2);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  }
  function softLight(base, blend) {
    if (blend <= 0.5) return base - (1 - 2 * blend) * base * (1 - base);
    const d = base <= 0.25 ? ((16 * base - 12) * base + 4) * base : Math.sqrt(base);
    return base + (2 * blend - 1) * (d - base);
  }

  // ── Mesh gradient: interpolación bilineal de 4 esquinas al azar ─────────────
  function drawMeshGradient(ctx, W, H, colors, rng) {
    const n = colors.length;
    const c00 = hexToRgb(colors[rng.int(0, n - 1)]), c10 = hexToRgb(colors[rng.int(0, n - 1)]);
    const c01 = hexToRgb(colors[rng.int(0, n - 1)]), c11 = hexToRgb(colors[rng.int(0, n - 1)]);
    const img = ctx.createImageData(W, H), px = img.data;
    for (let y = 0; y < H; y++) {
      const ty = y / (H - 1);
      for (let x = 0; x < W; x++) {
        const tx = x / (W - 1), i = (y * W + x) * 4;
        px[i]     = (1 - tx) * (1 - ty) * c00[0] + tx * (1 - ty) * c10[0] + (1 - tx) * ty * c01[0] + tx * ty * c11[0];
        px[i + 1] = (1 - tx) * (1 - ty) * c00[1] + tx * (1 - ty) * c10[1] + (1 - tx) * ty * c01[1] + tx * ty * c11[1];
        px[i + 2] = (1 - tx) * (1 - ty) * c00[2] + tx * (1 - ty) * c10[2] + (1 - tx) * ty * c01[2] + tx * ty * c11[2];
        px[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // ── Grano de film (soft-light, teñido hacia la media de la paleta) ──────────
  const GRAIN_SAMPLES = 3, GRAIN_MAG = 1.0, GRAIN_AMIN = 0.4, GRAIN_AMAX = 0.8;
  function bakeGrain(W, H, colors, scale) {
    scale = scale == null ? 1 : scale;
    let aR = 0, aG = 0, aB = 0;
    for (const h of colors) { const [r, g, b] = hexToRgb(h); aR += r; aG += g; aB += b; }
    aR /= colors.length; aG /= colors.length; aB /= colors.length;
    const aL = 0.299 * aR + 0.587 * aG + 0.114 * aB + 1, tR = aR / aL, tG = aG / aL, tB = aB / aL;
    const mag = GRAIN_MAG * scale, mn = GRAIN_AMIN * scale, mx = GRAIN_AMAX * scale, n = W * H;
    const R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), A = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let v = 0; for (let k = 0; k < GRAIN_SAMPLES; k++) v += Math.random();
      const m = (v / GRAIN_SAMPLES - 0.5) * mag;
      R[i] = 0.5 + m * (0.6 + tR * 0.4); G[i] = 0.5 + m * (0.6 + tG * 0.4); B[i] = 0.5 + m * (0.6 + tB * 0.4);
      A[i] = mn + Math.random() * (mx - mn);
    }
    return { R, G, B, A };
  }
  function applyGrain(ctx, W, H, grain) {
    const id = ctx.getImageData(0, 0, W, H), px = id.data, n = W * H;
    for (let i = 0; i < n; i++) {
      const pi = i * 4, a = grain.A[i], g = [grain.R[i], grain.G[i], grain.B[i]];
      for (let c = 0; c < 3; c++) {
        const b = px[pi + c] / 255, bl = softLight(b, g[c]);
        px[pi + c] = Math.min(255, Math.max(0, ((bl * a + b * (1 - a)) * 255) | 0));
      }
    }
    ctx.putImageData(id, 0, 0);
  }

  // ── Paletas: probabilidad ponderada por edad (lo reciente pesa más) ─────────
  function ageWeight(created) {
    if (!created || created < 1e12) return 4;
    const d = (Date.now() - created) / 86400000;
    return d < 30 ? 4 : d < 90 ? 2 : d < 180 ? 1 : d < 365 ? 0.4 : 0.15;
  }
  function normalizePalettes(pals) {
    const w = pals.map(p => ageWeight(p.created)), t = w.reduce((a, b) => a + b, 0) || 1;
    return pals.map((p, i) => ({ ...p, prob: w[i] / t }));
  }
  function palRarity(p) { return p > 0.08 ? 'common' : p > 0.03 ? 'uncommon' : p > 0.01 ? 'rare' : p > 0.003 ? 'superrare' : 'legendary'; }

  // Paletas vivas (solo activas) desde data/, con fallback embebido.
  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';
  async function loadPalettes() {
    try {
      const data = await fetch(RAW + 'palettes.json?t=' + Date.now()).then(r => r.ok ? r.json() : null);
      const active = (data || []).filter(p => p.active !== false);
      return normalizePalettes(active.length ? active : DEFAULTS);
    } catch (e) { return normalizePalettes(DEFAULTS); }
  }

  // TODAS las paletas (activas + inactivas) — para el laboratorio, donde se prueba con todo.
  async function loadAllPalettes() {
    try {
      const data = await fetch(RAW + 'palettes.json?t=' + Date.now()).then(r => r.ok ? r.json() : null);
      return normalizePalettes((data && data.length) ? data : DEFAULTS);
    } catch (e) { return normalizePalettes(DEFAULTS); }
  }

  // Fallback mínimo para que el laboratorio funcione sin red.
  const DEFAULTS = [
    { id: 1,  name: 'Science', colors: ['#ffe819', '#000000'], created: 1 },
    { id: 7,  name: 'Troll',   colors: ['#294984', '#6ca0a7', '#ffc789', '#df5f50', '#5a3034', '#fff1dd'], created: 7 },
    { id: 22, name: 'Homage',  colors: ['#fef9c6', '#ffcc4d', '#f5b800', '#56a1c4', '#4464a1', '#ee726b', '#df5f50', '#5a3034'], created: 22 },
    { id: 28, name: 'Poet',    colors: ['#f4f3ed', '#efc807', '#ed5d53', '#e2dbb5', '#45291c', '#080b0f'], created: 28 },
    { id: 31, name: 'Itten I', colors: ['#e8b84b', '#9b7fb6', '#7a6b8a', '#c9a227'], created: 31 },
  ];

  global.HOKS = {
    Rng, hexToRgb, luma, lerpColor, softLight,
    drawMeshGradient, bakeGrain, applyGrain,
    ageWeight, normalizePalettes, palRarity, loadPalettes, loadAllPalettes, DEFAULTS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
