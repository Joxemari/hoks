/* PLLSG — cápsulas (pills) sobre fondo degradado, con grano de film.
 *
 * FUENTE ÚNICA del algoritmo: este archivo lo consumen TANTO el laboratorio
 * (sketches/pllsg/index.html) COMO, cuando se gradúe, la página de producción
 * (pllsg.html). Si arreglas algo aquí, se arregla en todas partes.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.PLLSG.render(ctx, W, H, seed, opts) → { pal, arch, num, styleCount }
 *   HOKS.PLLSG.traits(res)                   → { list:[…], overall }
 *
 * Nota: respecto al pllsg.html actual, esta versión SÍ dibuja los acabados
 * 'blnd', 'chess' y 'ribbed' (en la web viva quedaban invisibles por una
 * definición de drawPill duplicada). Es el comportamiento que el diseño busca.
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const OFF_WHITE = '#f5f0ea';
  const GRAIN_TILE = 14;     // tamaño de tesela del acabado ajedrez
  const PLACE_ATT  = 24;     // intentos de colocación antes de rendirse

  // Arquetipos de densidad: cuántas pills y cuánto pueden solaparse.
  const ARCHETYPES = [
    { name: 'Scattered',  prob: 0.52, pillMin: 5,  pillMax: 8  },
    { name: 'Dense',      prob: 0.25, pillMin: 11, pillMax: 22 },
    { name: 'Solo',       prob: 0.20, pillMin: 2,  pillMax: 3  },
    { name: 'Monumental', prob: 0.03, pillMin: 1,  pillMax: 1  },
  ];
  const OL_TOL = { Scattered: 0.32, Dense: 0.58, Solo: 0.12, Monumental: 0.05 };
  // Distribución de acabados (común a todos los arquetipos).
  const FINISH_PROBS = { solid: 0.34, blnd: 0.34, translucent: 0.15, outline: 0.05, chess: 0.03, gradient: 0.05, ribbed: 0.04 };

  function pickFinish(rng) { let v = rng.next(), acc = 0; for (const [s, w] of Object.entries(FINISH_PROBS)) { acc += w; if (v < acc) return s; } return 'solid'; }
  function pickBlendOp(colors) { return colors.reduce((s, c) => s + E.luma(c), 0) / colors.length < 0.45 ? 'screen' : 'multiply'; }
  function pillsOverlap(ax, ay, aL, at, bx, by, bL, bt, tol) {
    return Math.max(0, (at + bt) / 2 + Math.min(aL, bL) * 0.5 - Math.hypot(ax - bx, ay - by)) / ((at / 2 + bt / 2)) > tol;
  }
  function pillPath(ctx, x1, y1, x2, y2, t) {
    const r = t / 2, a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.arc(x1, y1, r, a + Math.PI / 2, a + Math.PI * 1.5);
    ctx.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2);
    ctx.closePath();
  }

  // Acabado "ajedrez": teselas alternas recortadas a la silueta de la pill.
  function drawChessPill(ctx, x1, y1, x2, y2, t, col, rng) {
    const [r, g, b] = E.hexToRgb(col), alt = rng.bool(0.5) ? '#0a0a0a' : '#f5f0ea';
    const ang = Math.atan2(y2 - y1, x2 - x1), cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const hL = Math.hypot(x2 - x1, y2 - y1) / 2 + t / 2, hw = t / 2;
    const pts = [
      [cx + Math.cos(ang) * hL - Math.sin(ang) * hw, cy + Math.sin(ang) * hL + Math.cos(ang) * hw],
      [cx + Math.cos(ang) * hL + Math.sin(ang) * hw, cy + Math.sin(ang) * hL - Math.cos(ang) * hw],
      [cx - Math.cos(ang) * hL - Math.sin(ang) * hw, cy - Math.sin(ang) * hL + Math.cos(ang) * hw],
      [cx - Math.cos(ang) * hL + Math.sin(ang) * hw, cy - Math.sin(ang) * hL - Math.cos(ang) * hw],
    ];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.floor(Math.min(...xs) / GRAIN_TILE) * GRAIN_TILE, x1e = Math.ceil(Math.max(...xs) / GRAIN_TILE) * GRAIN_TILE;
    const y0 = Math.floor(Math.min(...ys) / GRAIN_TILE) * GRAIN_TILE, y1e = Math.ceil(Math.max(...ys) / GRAIN_TILE) * GRAIN_TILE;
    ctx.save(); pillPath(ctx, x1, y1, x2, y2, t); ctx.clip();
    for (let tx = x0; tx < x1e; tx += GRAIN_TILE) for (let ty = y0; ty < y1e; ty += GRAIN_TILE) {
      const ev = (Math.round(tx / GRAIN_TILE) + Math.round(ty / GRAIN_TILE)) % 2 === 0;
      ctx.fillStyle = ev ? `rgb(${r},${g},${b})` : alt;
      ctx.fillRect(tx, ty, GRAIN_TILE, GRAIN_TILE);
    }
    ctx.restore();
  }

  // Acabado "estriado": esferas solapadas que dan volumen tubular.
  function drawRibbedPill(ctx, x1, y1, x2, y2, t, col) {
    const [r, g, b] = E.hexToRgb(col), outerR = t / 2, innerR = outerR * 0.55;
    ctx.save(); pillPath(ctx, x1, y1, x2, y2, t); ctx.clip();
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / (outerR * 0.45)) + 2;
    for (let i = 0; i <= steps; i++) {
      const fx = x1 + (x2 - x1) * (i / steps), fy = y1 + (y2 - y1) * (i / steps);
      const gr = ctx.createRadialGradient(fx, fy, innerR, fx, fy, outerR);
      gr.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gr.addColorStop(0.6, `rgba(${r},${g},${b},0.7)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},1)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(fx, fy, outerR, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawPill(ctx, x1, y1, x2, y2, t, col, style, rng, colors, blndOp) {
    const [r, g, b] = E.hexToRgb(col), W = ctx.canvas.width, H = ctx.canvas.height, safeR = t / 2 + 2;
    x1 = Math.max(safeR, Math.min(W - safeR, x1)); y1 = Math.max(safeR, Math.min(H - safeR, y1));
    x2 = Math.max(safeR, Math.min(W - safeR, x2)); y2 = Math.max(safeR, Math.min(H - safeR, y2));
    ctx.save();
    if (style === 'solid') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = t; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    } else if (style === 'blnd') {
      ctx.globalCompositeOperation = blndOp;
      ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = t; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    } else if (style === 'translucent') {
      ctx.globalCompositeOperation = blndOp;
      ctx.strokeStyle = `rgba(${r},${g},${b},${rng.range(0.30, 0.65)})`; ctx.lineWidth = t; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    } else if (style === 'outline') {
      const bw = Math.max(6, t * 0.07), oc = E.luma(col) > 0.5 ? '#0a0a0a' : '#f5f0ea';
      ctx.globalCompositeOperation = 'source-over';
      pillPath(ctx, x1, y1, x2, y2, t); ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fill();
      pillPath(ctx, x1, y1, x2, y2, t); ctx.strokeStyle = oc; ctx.lineWidth = bw; ctx.stroke();
    } else if (style === 'chess') {
      drawChessPill(ctx, x1, y1, x2, y2, t, col, rng);
    } else if (style === 'gradient') {
      ctx.globalCompositeOperation = 'source-over';
      const a = Math.atan2(y2 - y1, x2 - x1), px = -Math.sin(a), py = Math.cos(a), h = t / 2;
      const [r2, g2, b2] = E.hexToRgb(rng.pickFrom(colors));
      const gr = ctx.createLinearGradient((x1 + x2) / 2 + px * h, (y1 + y2) / 2 + py * h, (x1 + x2) / 2 - px * h, (y1 + y2) / 2 - py * h);
      gr.addColorStop(0, `rgb(${r},${g},${b})`); gr.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      pillPath(ctx, x1, y1, x2, y2, t); ctx.fillStyle = gr; ctx.fill();
    } else if (style === 'ribbed') {
      drawRibbedPill(ctx, x1, y1, x2, y2, t, col);
    }
    ctx.restore();
  }

  // Fondo: sólido, radial o diagonal (devuelve los 2 colores usados).
  function drawBg(ctx, W, H, colors, rng) {
    const mode = rng.weighted([{ prob: 0.15, v: 'radial' }, { prob: 0.15, v: 'diagonal' }, { prob: 0.70, v: 'solid' }]).v;
    const c1 = rng.pickFrom(colors), rest = colors.filter(x => x !== c1), c2 = rng.pickFrom(rest.length ? rest : colors);
    const [r1, g1, b1] = E.hexToRgb(c1), [r2, g2, b2] = E.hexToRgb(c2);
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    if (mode === 'radial') {
      const cx = W * rng.range(0.3, 0.7), cy = H * rng.range(0.3, 0.7), rad = Math.hypot(W, H) * rng.range(0.55, 0.80);
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      gr.addColorStop(0, `rgb(${r1},${g1},${b1})`); gr.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = gr;
    } else if (mode === 'diagonal') {
      const flip = rng.bool(0.5), gr = ctx.createLinearGradient(flip ? W : 0, 0, flip ? 0 : W, H);
      gr.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      gr.addColorStop(0.5, `rgb(${Math.round((r1 + r2) / 2)},${Math.round((g1 + g2) / 2)},${Math.round((b1 + b2) / 2)})`);
      gr.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = gr;
    } else {
      ctx.fillStyle = rng.bool(0.286) ? OFF_WHITE : c1;
    }
    ctx.fillRect(0, 0, W, H); ctx.restore();
    return [c1, c2];
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, archetype, count, thickness } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    // Paleta: fijada manualmente o elegida por peso.
    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors, blndOp = pickBlendOp(colors);

    // Arquetipo + número de pills (los params pueden forzarlos).
    const arch = (params.archetype && params.archetype !== 'auto')
      ? (ARCHETYPES.find(a => a.name === params.archetype) || rng.weighted(ARCHETYPES))
      : rng.weighted(ARCHETYPES);
    const num = params.count ? params.count : rng.int(arch.pillMin, arch.pillMax);
    const maxSize = Math.min(W, H) * 0.85 / Math.sqrt(num);
    const thick = maxSize * rng.range(0.62, 0.78) * (params.thickness || 1);
    const tol = OL_TOL[arch.name] * Math.min(1.0, num / 8);

    const bgColors = drawBg(ctx, W, H, colors, rng);

    const pills = [], placed = [];
    for (let i = 0; i < num; i++) {
      const hl = maxSize / 4;
      let cx, cy, angle, ok = false;
      for (let att = 0; att < PLACE_ATT; att++) {
        angle = rng.range(0, Math.PI * 2);
        cx = rng.range(maxSize / 3, W - maxSize / 3); cy = rng.range(maxSize / 3, H - maxSize / 3);
        let bad = false; const md = (thick + hl * 1.5) * (1.0 - tol);
        for (const p of placed) {
          if (Math.hypot(cx - p.cx, cy - p.cy) < md) { bad = true; break; }
          if (pillsOverlap(cx, cy, hl, thick, p.cx, p.cy, p.hl, p.t, tol)) { bad = true; break; }
        }
        if (!bad) { ok = true; break; }
      }
      if (!ok) { angle = rng.range(0, Math.PI * 2); cx = rng.range(maxSize / 3, W - maxSize / 3); cy = rng.range(maxSize / 3, H - maxSize / 3); }
      placed.push({ cx, cy, hl, t: thick });
      // Evitar pills del mismo tono que el fondo.
      const bgL = bgColors.map(c => E.luma(c)), cOk = c => bgL.every(bl => Math.abs(E.luma(c) - bl) > 0.12);
      const pc = colors.filter(cOk).length ? colors.filter(cOk)
        : (colors.filter(c => !bgColors.includes(c)).length ? colors.filter(c => !bgColors.includes(c)) : colors);
      pills.push({ cx, cy, hl, angle, col: rng.pickFrom(pc), style: pickFinish(rng), thick });
    }

    const styleCount = {};
    for (const p of pills) {
      styleCount[p.style] = (styleCount[p.style] || 0) + 1;
      const dx = Math.cos(p.angle) * p.hl, dy = Math.sin(p.angle) * p.hl;
      drawPill(ctx, p.cx - dx, p.cy - dy, p.cx + dx, p.cy + dy, p.thick, p.col, p.style, rng, colors, blndOp);
    }
    E.applyGrain(ctx, W, H, E.bakeGrain(W, H, colors, grainScale));

    return { pal, arch, num, styleCount, bgColors };
  }

  // Traits + rareza global a partir de un resultado de render().
  function traits(res) {
    const { pal, arch, num, styleCount } = res;
    const prob = pal.prob != null ? pal.prob : 0.05;
    const palR = E.palRarity(prob);
    const archR = arch.name === 'Monumental' ? 'superrare' : arch.name === 'Solo' ? 'rare' : arch.name === 'Dense' ? 'uncommon' : 'common';
    const dominant = Object.entries(styleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'solid';
    const finishR = (dominant === 'chess' || dominant === 'ribbed' || dominant === 'gradient') ? 'rare'
      : (dominant === 'outline' || dominant === 'translucent') ? 'uncommon' : 'common';
    const score = prob
      * (archR === 'rare' || archR === 'superrare' ? 0.3 : archR === 'uncommon' ? 0.7 : 1)
      * (finishR === 'rare' ? 0.3 : finishR === 'uncommon' ? 0.7 : 1);
    const overall = score > 0.06 ? 'common' : score > 0.025 ? 'uncommon' : score > 0.008 ? 'rare' : score > 0.002 ? 'superrare' : 'legendary';
    return {
      list: [
        { key: 'Palette',   val: pal.name, colors: pal.colors, rarity: palR },
        { key: 'Archetype', val: arch.name + ' · ' + num + ' pills', rarity: archR },
        { key: 'Finish',    val: dominant, rarity: finishR },
        { key: 'Texture',   val: 'Grain + Gradient', rarity: 'rare' },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).PLLSG = { render, traits, ARCHETYPES, FINISH_PROBS };
})(typeof window !== 'undefined' ? window : globalThis);
