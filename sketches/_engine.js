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
  // Se pinta por bandas: a resolución de impresión (decenas de Mpx) una sola
  // ImageData de todo el lienzo son cientos de MB. La imagen es idéntica.
  const STRIP_PX = 2e6;   // ~2 Mpx por banda ≈ 8 MB de ImageData
  function drawMeshGradient(ctx, W, H, colors, rng) {
    const n = colors.length;
    const c00 = hexToRgb(colors[rng.int(0, n - 1)]), c10 = hexToRgb(colors[rng.int(0, n - 1)]);
    const c01 = hexToRgb(colors[rng.int(0, n - 1)]), c11 = hexToRgb(colors[rng.int(0, n - 1)]);
    const strip = Math.max(1, Math.min(H, Math.floor(STRIP_PX / W)));
    for (let y0 = 0; y0 < H; y0 += strip) {
      const h = Math.min(strip, H - y0);
      const img = ctx.createImageData(W, h), px = img.data;
      for (let y = 0; y < h; y++) {
        const ty = (y0 + y) / (H - 1);
        for (let x = 0; x < W; x++) {
          const tx = x / (W - 1), i = (y * W + x) * 4;
          px[i]     = (1 - tx) * (1 - ty) * c00[0] + tx * (1 - ty) * c10[0] + (1 - tx) * ty * c01[0] + tx * ty * c11[0];
          px[i + 1] = (1 - tx) * (1 - ty) * c00[1] + tx * (1 - ty) * c10[1] + (1 - tx) * ty * c01[1] + tx * ty * c11[1];
          px[i + 2] = (1 - tx) * (1 - ty) * c00[2] + tx * (1 - ty) * c10[2] + (1 - tx) * ty * c01[2] + tx * ty * c11[2];
          px[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, y0);
    }
  }

  // ── Grano de film (soft-light, teñido hacia la media de la paleta) ──────────
  const GRAIN_SAMPLES = 3, GRAIN_MAG = 1.0, GRAIN_AMIN = 0.4, GRAIN_AMAX = 0.8;

  // Grano en una pasada, por bandas y con "celda": el ruido se sortea una vez
  // por bloque de cell×cell píxeles, así el grano conserva su tamaño FÍSICO al
  // subir de resolución (a 300 dpi un grano de 1 px sería invisible). En
  // pantalla unit≈1 → cell=1 → exactamente el grano de siempre.
  //   unit = ladoCorto / ladoCortoDeReferencia de la obra.
  function grain(ctx, W, H, colors, scale, unit) {
    scale = scale == null ? 1 : scale;
    const cell = Math.max(1, Math.round(unit || 1));
    let aR = 0, aG = 0, aB = 0;
    for (const h of colors) { const [r, g, b] = hexToRgb(h); aR += r; aG += g; aB += b; }
    aR /= colors.length; aG /= colors.length; aB /= colors.length;
    const aL = 0.299 * aR + 0.587 * aG + 0.114 * aB + 1;
    const kR = 0.6 + (aR / aL) * 0.4, kG = 0.6 + (aG / aL) * 0.4, kB = 0.6 + (aB / aL) * 0.4;
    const mag = GRAIN_MAG * scale, mn = GRAIN_AMIN * scale, mx = GRAIN_AMAX * scale;
    const cols = Math.ceil(W / cell);
    const nR = new Float32Array(cols), nG = new Float32Array(cols), nB = new Float32Array(cols), nA = new Float32Array(cols);
    const clamp = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;
    const rows = Math.max(1, Math.floor(STRIP_PX / W / cell)) * cell;   // bandas alineadas a la celda
    for (let y0 = 0; y0 < H; y0 += rows) {
      const bh = Math.min(rows, H - y0);
      const id = ctx.getImageData(0, y0, W, bh), px = id.data;
      for (let cy = 0; cy < bh; cy += cell) {
        for (let ci = 0; ci < cols; ci++) {
          let v = 0; for (let k = 0; k < GRAIN_SAMPLES; k++) v += Math.random();
          const m = (v / GRAIN_SAMPLES - 0.5) * mag;
          nR[ci] = 0.5 + m * kR; nG[ci] = 0.5 + m * kG; nB[ci] = 0.5 + m * kB;
          nA[ci] = mn + Math.random() * (mx - mn);
        }
        const yEnd = Math.min(cy + cell, bh);
        for (let y = cy; y < yEnd; y++) {
          let i = y * W * 4;
          for (let x = 0; x < W; x++, i += 4) {
            const ci = (x / cell) | 0, a = nA[ci];
            let b = px[i]     / 255; px[i]     = clamp((softLight(b, nR[ci]) * a + b * (1 - a)) * 255);
            b     = px[i + 1] / 255; px[i + 1] = clamp((softLight(b, nG[ci]) * a + b * (1 - a)) * 255);
            b     = px[i + 2] / 255; px[i + 2] = clamp((softLight(b, nB[ci]) * a + b * (1 - a)) * 255);
          }
        }
      }
      ctx.putImageData(id, 0, y0);
    }
  }

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
  // ── Fondo: opción transversal del laboratorio ───────────────────────────────
  // 'solid' o 'gradient' es una decisión que atraviesa TODAS las obras, no un
  // parámetro de cada una: es lo que antes justificaba una familia "G" aparte. Cada
  // algoritmo la respeta a su manera; 'auto' = lo que la obra hace por defecto.
  //   params.bg → 'auto' | 'solid' | 'gradient'
  function bgMode(params, dflt) {
    const v = params && params.bg;
    return (v && v !== 'auto') ? v : (dflt || 'auto');
  }

  // ── Campo: cuadrado inscrito o nativo del pliego ────────────────────────────
  // El pliego y el campo son dos decisiones distintas. Un campo CUADRADO puede
  // ir sobre cualquiera de los tres pliegos —un cuadrado centrado en un DIN es
  // una imagen, no un accidente— pero también tiene que poder existir la obra
  // compuesta de verdad en vertical u horizontal. Por eso no se deduce del
  // formato: se elige.
  //   params.field → 'sheet' (llena el pliego, por defecto) | 'square'
  function fieldMode(params, dflt) {
    const v = params && params.field;
    return (v === 'square' || v === 'sheet') ? v : (dflt || 'sheet');
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

  // ── Formato de lienzo ───────────────────────────────────────────────────────
  // Toda obra puede darse en tres proporciones: cuadrado (1:1) y las dos DIN
  // (1:√2, vertical y horizontal). El pliego (A4…A1) fija el tamaño físico; el
  // cuadrado toma el lado CORTO del pliego, así siempre cabe en la hoja.
  //
  // La proporción es del ALGORITMO, no del lienzo: los algoritmos trabajan sobre
  // W y H, así que la misma seed en el mismo formato da la misma imagen a
  // cualquier resolución — lo que ves en pantalla es lo que se imprime.
  const SQRT2 = Math.SQRT2;
  const FORMATS = ['square', 'vertical', 'horizontal'];
  const SHEETS = {            // lado corto × lado largo, en mm
    A4: [210, 297], A3: [297, 420], A2: [420, 594], A1: [594, 841],
  };
  const SHEET_IDS = ['A4', 'A3', 'A2', 'A1'];
  const DEFAULT_SHEET = 'A3', DPI = 300;
  const PREVIEW_SHORT = 760;  // lado corto en pantalla (y de lo que se guarda)

  function fmtDims(fmt, shortSide) {
    const s = Math.round(shortSide), l = Math.round(s * SQRT2);
    if (fmt === 'vertical')   return { W: s, H: l };
    if (fmt === 'horizontal') return { W: l, H: s };
    return { W: s, H: s };
  }
  function previewDims(fmt) { return fmtDims(fmt, PREVIEW_SHORT); }
  function printDims(fmt, sheet, dpi) {
    dpi = dpi || DPI;
    const mm = SHEETS[sheet] || SHEETS[DEFAULT_SHEET];
    const sPx = Math.round(mm[0] / 25.4 * dpi), lPx = Math.round(mm[1] / 25.4 * dpi);
    if (fmt === 'square')   return { W: sPx, H: sPx, mm: [mm[0], mm[0]], dpi };
    if (fmt === 'vertical') return { W: sPx, H: lPx, mm: [mm[0], mm[1]], dpi };
    return { W: lPx, H: sPx, mm: [mm[1], mm[0]], dpi };
  }
  // Unidad de escala de la obra: cuánto mide este lienzo respecto al de
  // referencia. Multiplica las constantes en píxeles absolutas de cada algoritmo.
  function unit(W, H, ref) { return Math.min(W, H) / (ref || PREVIEW_SHORT); }

  function lsGet(k, dflt) { try { return localStorage.getItem(k) || dflt; } catch (e) { return dflt; } }
  function lsSet(k, v)    { try { localStorage.setItem(k, v); } catch (e) {} }

  const FMT_CSS = `
.hoks-fmt { display:flex; gap:4px; }
.hoks-fmt-btn {
  flex:1; display:flex; flex-direction:column; align-items:center; gap:5px;
  font-family:'Courier New',Courier,monospace; font-size:8px; font-weight:700;
  letter-spacing:0.08em; text-transform:uppercase; color:#bbb;
  background:transparent; border:1px solid #e8e8e8; border-radius:2px;
  padding:8px 2px 6px; cursor:pointer; transition:border-color .15s, color .15s;
}
.hoks-fmt-btn:hover { border-color:#d0d0d0; color:#111; }
.hoks-fmt-btn.on { border-color:#111; color:#111; }
.hoks-fmt-ico { border:1.5px solid currentColor; display:block; }
.hoks-fmt-sel {
  font-family:'Courier New',Courier,monospace; font-size:10px; letter-spacing:0.06em;
  text-transform:uppercase; padding:6px 8px; width:100%; color:#111;
  background:#f7f7f7; border:1px solid #e8e8e8; border-radius:2px; cursor:pointer;
}
.hoks-fmt-note { font-size:8px; color:#bbb; letter-spacing:0.06em; line-height:1.6; }
`;
  function injectFmtCss() {
    if (typeof document === 'undefined' || document.getElementById('hoks-fmt-css')) return;
    const s = document.createElement('style'); s.id = 'hoks-fmt-css'; s.textContent = FMT_CSS;
    document.head.appendChild(s);
  }

  const ICO = { square: [15, 15], vertical: [12, 17], horizontal: [17, 12] };

  // Control de formato + pliego de impresión para la barra lateral de una obra.
  //   mountFormat(el, { work:'plls', onChange(fmt){…} }) → { format, sheet, … }
  function mountFormat(el, opts) {
    opts = opts || {};
    const work = opts.work || 'hoks';
    const kF = 'hoks-fmt-' + work, kS = 'hoks-sheet-' + work;
    const T = k => (global.HOKSI18N ? global.HOKSI18N.t(k) : k);
    injectFmtCss();

    let format = opts.format || lsGet(kF, opts.defaultFormat || 'horizontal');
    if (FORMATS.indexOf(format) < 0) format = 'horizontal';
    let sheet = lsGet(kS, opts.defaultSheet || DEFAULT_SHEET);
    if (SHEET_IDS.indexOf(sheet) < 0) sheet = DEFAULT_SHEET;

    el.innerHTML =
      `<div class="sidebar-label" data-i18n="label.format">${T('label.format')}</div>` +
      `<div class="hoks-fmt">` + FORMATS.map(f =>
        `<button type="button" class="hoks-fmt-btn" data-fmt="${f}">` +
        `<span class="hoks-fmt-ico" style="width:${ICO[f][0]}px;height:${ICO[f][1]}px"></span>` +
        `<span data-i18n="format.${f}">${T('format.' + f)}</span></button>`).join('') + `</div>` +
      `<div class="sidebar-label" style="margin-top:6px" data-i18n="label.print">${T('label.print')}</div>` +
      `<select class="hoks-fmt-sel" data-role="sheet">` +
        SHEET_IDS.map(s => `<option value="${s}">${s}</option>`).join('') + `</select>` +
      `<div class="hoks-fmt-note" data-role="note"></div>`;

    const note = el.querySelector('[data-role=note]'), sel = el.querySelector('[data-role=sheet]');
    sel.value = sheet;

    function paint() {
      el.querySelectorAll('.hoks-fmt-btn').forEach(b => b.classList.toggle('on', b.dataset.fmt === format));
      const d = printDims(format, sheet);
      note.textContent = `${d.mm[0]} × ${d.mm[1]} mm · ${d.W} × ${d.H} px · ${d.dpi} dpi`;
    }
    el.querySelectorAll('.hoks-fmt-btn').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.fmt === format) return;
      format = b.dataset.fmt; lsSet(kF, format); paint();
      if (opts.onChange) opts.onChange(format);
    }));
    sel.addEventListener('change', () => { sheet = sel.value; lsSet(kS, sheet); paint(); });
    if (typeof window !== 'undefined') window.addEventListener('hoks:langchange', paint);
    paint();

    return {
      get format() { return format; },
      get sheet()  { return sheet; },
      preview() { return previewDims(format); },
      print()   { return printDims(format, sheet); },
    };
  }

  // Render fuera de pantalla al tamaño de impresión y descarga como PNG.
  //   exportPrint({ name, fmt, sheet, render(ctx, W, H) })
  function exportPrint(o) {
    const d = printDims(o.fmt, o.sheet, o.dpi);
    const cv = document.createElement('canvas');
    cv.width = d.W; cv.height = d.H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    o.render(ctx, d.W, d.H);
    // Safari (y móviles) devuelven un lienzo vacío por encima de su límite de
    // área: el fondo siempre se pinta opaco, así que un píxel transparente = fallo.
    let ok = true;
    try { ok = ctx.getImageData(0, 0, 1, 1).data[3] > 0; } catch (e) {}
    if (!ok) { cv.width = cv.height = 0; return Promise.reject(new Error('canvas-too-large')); }
    return new Promise(res => cv.toBlob(b => {
      const url = URL.createObjectURL(b), a = document.createElement('a');
      a.download = `${o.name}.png`; a.href = url; a.click();
      setTimeout(() => { URL.revokeObjectURL(url); cv.width = cv.height = 0; }, 4000);
      res(d);
    }, 'image/png'));
  }

  global.HOKS = {
    Rng, hexToRgb, luma, lerpColor, softLight,
    drawMeshGradient, bakeGrain, applyGrain, grain, bgMode, fieldMode,
    ageWeight, normalizePalettes, palRarity, loadPalettes, loadAllPalettes, DEFAULTS,
    FORMATS, SHEETS, SHEET_IDS, DEFAULT_SHEET, DPI, PREVIEW_SHORT,
    fmtDims, previewDims, printDims, unit, mountFormat, exportPrint,
  };
})(typeof window !== 'undefined' ? window : globalThis);
