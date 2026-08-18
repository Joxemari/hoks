/* PLLS — cápsulas (pills) sobre fondo degradado, con grano de film.
 *
 * FUENTE ÚNICA del algoritmo: este archivo lo consumen TANTO el laboratorio
 * (sketches/plls/index.html) COMO, cuando se gradúe, la página de producción
 * (plls.html). Si arreglas algo aquí, se arregla en todas partes.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.PLLS.render(ctx, W, H, seed, opts) → { pal, arch, num, styleCount }
 *   HOKS.PLLS.traits(res)                   → { list:[…], overall }
 *
 * Nota: respecto al plls.html actual, esta versión SÍ dibuja los acabados
 * 'blnd', 'chess' y 'ribbed' (en la web viva quedaban invisibles por una
 * definición de drawPill duplicada). Es el comportamiento que el diseño busca.
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const OFF_WHITE = '#f5f0ea';
  const GRAIN_TILE = 14;     // tesela del acabado ajedrez, a resolución de referencia
  const PLACE_ATT  = 24;     // intentos de colocación antes de rendirse
  const SPREAD     = 0.85 / Math.pow(2, 0.25);   // ver maxSize en render()
  const BG_GRADIENT = 30;   // % de degradado cuando el fondo va en 'auto' (el resto, plano)
  const REF        = 1000;   // lado corto de referencia: las medidas en px se
                             // escalan por unit = min(W,H)/REF, así el dibujo es
                             // el mismo en pantalla y a resolución de impresión.

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

  function pickWeighted(rng, items, weights) {
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let v = rng.next(), acc = 0;
    for (let i = 0; i < items.length; i++) { acc += weights[i] / total; if (v < acc) return items[i]; }
    return items[items.length - 1];
  }
  // probs (opcional): pesos override del lab; si faltan, los de FINISH_PROBS. Se normalizan.
  function pickFinish(rng, probs) {
    const keys = Object.keys(FINISH_PROBS);
    return pickWeighted(rng, keys, keys.map(k => (probs && probs[k] != null) ? probs[k] : FINISH_PROBS[k]));
  }
  function pickBlendOp(colors) { return colors.reduce((s, c) => s + E.luma(c), 0) / colors.length < 0.45 ? 'screen' : 'multiply'; }
  function pillsOverlap(ax, ay, aL, at, bx, by, bL, bt, tol) {
    return Math.max(0, (at + bt) / 2 + Math.min(aL, bL) * 0.5 - Math.hypot(ax - bx, ay - by)) / ((at / 2 + bt / 2)) > tol;
  }
  // ⟨esaldia:eu⟩ Kapsula bat ez da forma: bi punturen arteko distantzia bat da, lodiera batekin.
  // ⟨esaldia:en⟩ A capsule is not a shape: it is a distance between two points, given a thickness.
  // ⟨gramatika⟩
  function capsuleOutline(ctx, fromX, fromY, toX, toY, thickness) {
    const radius = thickness / 2, along = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.arc(fromX, fromY, radius, along + Math.PI / 2, along + Math.PI * 1.5);
    ctx.arc(toX,   toY,   radius, along - Math.PI / 2, along + Math.PI / 2);
    ctx.closePath();
  }
  // ⟨/gramatika⟩

  // Acabado "ajedrez": teselas alternas recortadas a la silueta de la pill.
  function drawChessPill(ctx, x1, y1, x2, y2, t, col, rng, tile) {
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
    const x0 = Math.floor(Math.min(...xs) / tile) * tile, x1e = Math.ceil(Math.max(...xs) / tile) * tile;
    const y0 = Math.floor(Math.min(...ys) / tile) * tile, y1e = Math.ceil(Math.max(...ys) / tile) * tile;
    ctx.save(); capsuleOutline(ctx, x1, y1, x2, y2, t); ctx.clip();
    for (let tx = x0; tx < x1e; tx += tile) for (let ty = y0; ty < y1e; ty += tile) {
      const ev = (Math.round(tx / tile) + Math.round(ty / tile)) % 2 === 0;
      ctx.fillStyle = ev ? `rgb(${r},${g},${b})` : alt;
      ctx.fillRect(tx, ty, tile, tile);
    }
    ctx.restore();
  }

  // Acabado "estriado": esferas solapadas que dan volumen tubular.
  function drawRibbedPill(ctx, x1, y1, x2, y2, t, col) {
    const [r, g, b] = E.hexToRgb(col), outerR = t / 2, innerR = outerR * 0.55;
    ctx.save(); capsuleOutline(ctx, x1, y1, x2, y2, t); ctx.clip();
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

  function drawPill(ctx, x1, y1, x2, y2, t, col, style, rng, colors, blndOp, u) {
    // Sin clamping de extremos: la colocación ya garantiza que la cápsula cabe.
    // (Clampar movía los extremos → cambiaba la longitud → proporciones distintas.)
    const [r, g, b] = E.hexToRgb(col);
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
      const bw = Math.max(6 * u, t * 0.07), oc = E.luma(col) > 0.5 ? '#0a0a0a' : '#f5f0ea';
      ctx.globalCompositeOperation = 'source-over';
      capsuleOutline(ctx, x1, y1, x2, y2, t); ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fill();
      capsuleOutline(ctx, x1, y1, x2, y2, t); ctx.strokeStyle = oc; ctx.lineWidth = bw; ctx.stroke();
    } else if (style === 'chess') {
      drawChessPill(ctx, x1, y1, x2, y2, t, col, rng, GRAIN_TILE * u);
    } else if (style === 'gradient') {
      ctx.globalCompositeOperation = 'source-over';
      const a = Math.atan2(y2 - y1, x2 - x1), px = -Math.sin(a), py = Math.cos(a), h = t / 2;
      const [r2, g2, b2] = E.hexToRgb(rng.pickFrom(colors));
      const gr = ctx.createLinearGradient((x1 + x2) / 2 + px * h, (y1 + y2) / 2 + py * h, (x1 + x2) / 2 - px * h, (y1 + y2) / 2 - py * h);
      gr.addColorStop(0, `rgb(${r},${g},${b})`); gr.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      capsuleOutline(ctx, x1, y1, x2, y2, t); ctx.fillStyle = gr; ctx.fill();
    } else if (style === 'ribbed') {
      drawRibbedPill(ctx, x1, y1, x2, y2, t, col);
    }
    ctx.restore();
  }

  // Fondo: plano o degradado (devuelve los 2 colores usados).
  // forceMode (opcional): 'solid' | 'diagonal' para fijarlo desde el lab.
  // pGrad: % de fondo con degradado cuando va en 'auto'. El resto es plano, así
  // que los dos suman 100 sin poder no hacerlo.
  function drawBg(ctx, W, H, colors, rng, forceMode, pGrad) {
    const g = (pGrad == null ? BG_GRADIENT : pGrad) / 100;
    const mode = (forceMode && forceMode !== 'auto') ? forceMode
      : rng.weighted([{ prob: g, v: 'diagonal' }, { prob: 1 - g, v: 'solid' }]).v;
    const c1 = rng.pickFrom(colors), rest = colors.filter(x => x !== c1), c2 = rng.pickFrom(rest.length ? rest : colors);
    const [r1, g1, b1] = E.hexToRgb(c1), [r2, g2, b2] = E.hexToRgb(c2);
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    if (mode === 'diagonal') {
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
    const u = E.unit(W, H, REF);   // escala de las medidas en px absolutos
    const rng = new E.Rng(seed);

    // Paleta: fijada manualmente o elegida por peso.
    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors, blndOp = pickBlendOp(colors);

    // Arquetipo + número de pills (los params pueden forzarlos).
    const arch = (params.archetype && params.archetype !== 'auto')
      ? (ARCHETYPES.find(a => a.name === params.archetype) || ARCHETYPES[0])
      : pickWeighted(rng, ARCHETYPES, ARCHETYPES.map(a => (params.archProbs && params.archProbs[a.name] != null) ? params.archProbs[a.name] : a.prob));
    const num = params.count ? params.count : rng.int(arch.pillMin, arch.pillMax);
    // La cápsula se mide contra la MEDIA GEOMÉTRICA del pliego, no contra el
    // lado corto: la cobertura es entonces la misma en los tres formatos. Con
    // el lado corto, el DIN salía un 41% más vacío que el cuadrado — el
    // formato cambiaba la densidad de la obra, que no es lo que decide el
    // arquetipo. SPREAD está calibrado (0.85/2^¼) para que el horizontal siga
    // siendo exactamente el publicado.
    // El CAMPO puede ser el pliego entero o un cuadrado centrado en él: son dos
    // imágenes distintas y las dos tienen que poder existir. Las cápsulas se
    // componen contra FW/FH; el fondo y el grano siguen siendo de toda la hoja.
    const Sm = Math.min(W, H), square = E.fieldMode(params) === 'square';
    const FW = square ? Sm : W, FH = square ? Sm : H;
    const fx0 = (W - FW) / 2, fy0 = (H - FH) / 2;
    const maxSize = Math.sqrt(FW * FH) * SPREAD / Math.sqrt(num);
    const thick = maxSize * rng.range(0.62, 0.78) * (params.thickness || 1);
    const tol = OL_TOL[arch.name] * Math.min(1.0, num / 8);

    // La opción transversal manda sobre el modo propio de la obra.
    const bgT = E.bgMode(params);
    const bgForce = bgT === 'solid' ? 'solid'
      : bgT === 'gradient' ? 'diagonal'
      : params.bgMode;
    const pGrad = (params.bgProbs && params.bgProbs.gradient != null) ? params.bgProbs.gradient : BG_GRADIENT;
    const bgColors = drawBg(ctx, W, H, colors, rng, bgForce, pGrad);

    // Margen = extensión máxima de la cápsula desde su centro (hl + radio del cap).
    // Así todas caben sin recortes → todas conservan la MISMA proporción.
    const reach = maxSize / 4 + thick / 2, mx = Math.min(reach, FW / 2), my = Math.min(reach, FH / 2);
    // ⟨esaldia:eu⟩ Kolokatzea ez da apaingarria: elkarren gainean zenbat egon daitezkeen erabakitzen du arauak.
    // ⟨esaldia:en⟩ Placement is not arrangement: the rule decides how much they may overlap.
    // ⟨gramatika⟩
    const pills = [], placed = [];
    for (let i = 0; i < num; i++) {
      const halfLength = maxSize / 4;
      let cx, cy, angle, roomFound = false;
      for (let attempt = 0; attempt < PLACE_ATT; attempt++) {
        angle = rng.range(0, Math.PI * 2);
        cx = rng.range(mx, FW - mx); cy = rng.range(my, FH - my);
        let tooClose = false;
        const keepApart = (thick + halfLength * 1.5) * (1.0 - tol);
        for (const other of placed) {
          if (Math.hypot(cx - other.cx, cy - other.cy) < keepApart) { tooClose = true; break; }
          if (pillsOverlap(cx, cy, halfLength, thick, other.cx, other.cy, other.hl, other.t, tol)) { tooClose = true; break; }
        }
        if (!tooClose) { roomFound = true; break; }
      }
      // Sin sitio tras PLACE_ATT intentos, se coloca igual: el sistema cede antes
      // que dejar de hablar.
      if (!roomFound) { angle = rng.range(0, Math.PI * 2); cx = rng.range(mx, FW - mx); cy = rng.range(my, FH - my); }
      placed.push({ cx, cy, hl: halfLength, t: thick });
      // Evitar pills del mismo tono que el fondo.
      const bgL = bgColors.map(c => E.luma(c)), cOk = c => bgL.every(bl => Math.abs(E.luma(c) - bl) > 0.12);
      const pc = colors.filter(cOk).length ? colors.filter(cOk)
        : (colors.filter(c => !bgColors.includes(c)).length ? colors.filter(c => !bgColors.includes(c)) : colors);
      pills.push({ cx, cy, hl: halfLength, angle, col: rng.pickFrom(pc), style: pickFinish(rng, params.finishProbs), thick });
    }
    // ⟨/gramatika⟩

    const styleCount = {};
    ctx.save();
    ctx.translate(fx0, fy0);          // el campo, centrado en el pliego
    for (const p of pills) {
      styleCount[p.style] = (styleCount[p.style] || 0) + 1;
      const dx = Math.cos(p.angle) * p.hl, dy = Math.sin(p.angle) * p.hl;
      drawPill(ctx, p.cx - dx, p.cy - dy, p.cx + dx, p.cy + dy, p.thick, p.col, p.style, rng, colors, blndOp, u);
    }
    ctx.restore();
    E.grain(ctx, W, H, colors, grainScale, u);

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

  (global.HOKS = global.HOKS || {}).PLLS = { render, traits, ARCHETYPES, FINISH_PROBS, BG_GRADIENT };
})(typeof window !== 'undefined' ? window : globalThis);
