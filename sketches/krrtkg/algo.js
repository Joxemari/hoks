/* KRRTKG — subdivisión recursiva de cuadrados sobre mesh gradient, con grano.
 *
 * FUENTE ÚNICA del algoritmo: este archivo lo consumen TANTO el laboratorio
 * (sketches/krrtkg/index.html) COMO la página de producción (krrtkg.html).
 * Si arreglas algo aquí, se arregla en todas partes.
 *
 * Porte FIEL del motor que vivía inline en krrtkg.html — mismo orden de
 * consumo del RNG, mismos números → mismo seed produce la misma imagen.
 * Nota: la subdivisión descarta el 4º hijo de cada división (el splice del
 * original). No es un bug a arreglar: es la firma visual de la serie.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.KRRTKG.render(ctx, W, H, seed, opts) → { pal, squares, drawCount, depthLevel, coveragePct }
 *   HOKS.KRRTKG.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const THRESHOLD  = 0.6;   // probabilidad de NO dibujar un cuadrado (rng.next() > threshold dibuja)
  const RECT_ALPHA = 0.61;  // 155/255 — cuadrados semitransparentes sobre el gradiente
  const REF        = 600;   // lado corto de referencia (calibra el grano)

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, threshold, rectAlpha } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const threshold  = params.threshold  == null ? THRESHOLD  : params.threshold;
    const rectAlpha  = params.rectAlpha  == null ? RECT_ALPHA : params.rectAlpha;
    const rng = new E.Rng(seed);

    // Paleta: fijada manualmente o elegida por peso (consume 1 tirada del rng).
    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;

    // El campo de subdivisión es CUADRADO y se centra en el lienzo: en cuadrado
    // ocupa toda la hoja; en vertical y horizontal se inscribe en el lado corto.
    const S = Math.min(W, H);
    const margin = Math.round(S * 0.1667);
    const a = S - margin * 2;
    const ox = (W - S) / 2, oy = (H - S) / 2;

    // 1. Mesh gradient de fondo (stream RNG independiente, como el original).
    // Fondo: mesh gradient (lo propio de la obra) o plano si el laboratorio pide
    // 'solid'. Se sortea en su propio stream, así la composición no se entera.
    const rngBg = new E.Rng(seed ^ 0xDEADBEEF);
    if (E.bgMode(params) === 'solid') {
      ctx.fillStyle = colors[rngBg.int(0, colors.length - 1)];
      ctx.fillRect(0, 0, W, H);
    } else {
      E.drawMeshGradient(ctx, W, H, colors, rngBg);
    }

    // 2. Construir cuadrados (algoritmo KRRTK fiel, splice incluido).
    const squares = [{ x: margin, y: margin, size: a, color: colors[rng.int(0, colors.length - 1)] }];
    let si = 0;
    while (si < squares.length) {
      const sq = squares[si];
      if (sq.size > a / 4) {
        const ns = sq.size / 2;
        squares.push(
          { x: sq.x,      y: sq.y,      size: ns, color: colors[rng.int(0, colors.length - 1)] },
          { x: sq.x + ns, y: sq.y,      size: ns, color: colors[rng.int(0, colors.length - 1)] },
          { x: sq.x,      y: sq.y + ns, size: ns, color: colors[rng.int(0, colors.length - 1)] },
          { x: sq.x + ns, y: sq.y + ns, size: ns, color: colors[rng.int(0, colors.length - 1)] }
        );
        squares.splice(squares.length - 1, 1);   // descarta el 4º hijo — firma de la serie
      }
      si++;
    }
    const toDraw = squares.map(() => rng.next() > threshold);
    const drawCount = toDraw.filter(Boolean).length;

    // 3. Dibujar cuadrados con alpha sobre el gradiente.
    for (let i = 0; i < squares.length; i++) {
      if (!toDraw[i]) continue;
      const [r, g, b] = E.hexToRgb(squares[i].color);
      ctx.fillStyle = `rgba(${r},${g},${b},${rectAlpha})`;
      ctx.fillRect(ox + squares[i].x, oy + squares[i].y, squares[i].size, squares[i].size);
    }

    // 4. Grano (los defaults del engine a escala 1 son los números del original).
    //    unit mantiene el tamaño del grano al subir a resolución de impresión.
    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    // Datos para traits.
    const minSize = squares.reduce((m, sq) => Math.min(m, sq.size), a);
    const depthLevel = Math.max(1, Math.round(Math.log2(a / Math.max(minSize, 1))));
    const coveragePct = Math.round((drawCount / Math.max(1, squares.length)) * 100);
    return { pal, squares: squares.length, drawCount, depthLevel, coveragePct };
  }

  // Traits + rareza global a partir de un resultado de render().
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);
    const coverageLabel = res.coveragePct > 65 ? 'Dense' : res.coveragePct > 35 ? 'Balanced' : 'Sparse';
    const coverageR = res.coveragePct > 65 ? 'uncommon' : res.coveragePct < 20 ? 'rare' : 'common';
    const depthR = res.depthLevel >= 4 ? 'rare' : res.depthLevel >= 3 ? 'uncommon' : 'common';
    const score = prob
      * (depthR === 'rare' ? 0.3 : depthR === 'uncommon' ? 0.7 : 1)
      * (coverageR === 'rare' ? 0.3 : coverageR === 'uncommon' ? 0.7 : 1);
    const overall = score > 0.06 ? 'common' : score > 0.025 ? 'uncommon' : score > 0.008 ? 'rare' : score > 0.002 ? 'superrare' : 'legendary';
    return {
      list: [
        { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Depth',    val: res.depthLevel + ' levels', rarity: depthR },
        { key: 'Coverage', val: coverageLabel + ' · ' + res.coveragePct + '%', rarity: coverageR },
        { key: 'Texture',  val: 'Grain + Gradient', rarity: 'rare' },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).KRRTKG = { render, traits, THRESHOLD, RECT_ALPHA };
})(typeof window !== 'undefined' ? window : globalThis);
