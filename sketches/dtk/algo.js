/* DTK — rejilla n×n de círculos (Borobilak) sobre mesh gradient, con grano.
 *
 * FUENTE ÚNICA del algoritmo: este archivo lo consumen TANTO el laboratorio
 * (sketches/dtk/index.html) COMO la página de producción (dtk.html).
 * Si arreglas algo aquí, se arregla en todas partes.
 *
 * Porte FIEL del motor que vivía inline en dtk.html — mismo orden de consumo
 * del RNG, mismos números → mismo seed produce la misma imagen.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.DTK.render(ctx, W, H, seed, opts) → { pal, n, drawn }
 *   HOKS.DTK.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const THRESHOLD = 0.8;   // probabilidad de que un círculo exista (composition <= threshold dibuja)
  const REF = 600;          // lado corto de referencia (calibra el grano)
  const BG_GRADIENT = 30;   // % de degradado cuando el fondo va en 'auto' (el resto, plano)

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, grid, threshold } }
  // grid (lab): fuerza n (1–7); 0/ausente = aleatorio como producción.
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const threshold  = params.threshold  == null ? THRESHOLD : params.threshold;
    const rng = new E.Rng(seed);

    // Paleta: fijada manualmente o elegida por peso (consume 1 tirada del rng).
    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;

    // 1. Mesh gradient de fondo (stream RNG independiente, como el original).
    // Fondo: mesh gradient (lo propio de la obra) o plano si el laboratorio pide
    // 'solid'. Se sortea en su propio stream, así la composición no se entera.
    const rngBg = new E.Rng(seed ^ 0xDEADBEEF);
    if (E.pickBg(seed, params, BG_GRADIENT) === 'solid') {
      ctx.fillStyle = colors[rngBg.int(0, colors.length - 1)];
      ctx.fillRect(0, 0, W, H);
    } else {
      E.drawMeshGradient(ctx, W, H, colors, rngBg);
    }

    // 2. Rejilla — n de 1 a 7, celda cuadrada, con el aire del sistema alrededor.
    //    Antes iba a hueso contra el borde: era la única de la casa sin margen,
    //    y con las demás retiradas del papel no leía como la misma serie.
    const n = params.grid ? params.grid : rng.int(1, 7);
    const G = E.fieldGrid(W, H, n, params);
    const { pitch, cols, rows, ox: offsetX, oy: offsetY } = G;
    const size = pitch / 1.1;                        // 10% de aire entre círculos

    // Matriz de composición (una tirada por celda, como el original).
    // ⟨gramatika⟩
    const composition = [];
    for (let i = 0; i < cols; i++) {
      composition.push([]);
      for (let j = 0; j < rows; j++) composition[i].push(rng.next());
    }
    // ⟨/gramatika⟩

    // 3. Círculos.
    ctx.save();
    ctx.translate(offsetX, offsetY);
    let drawn = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (composition[i][j] <= threshold) {
          const x = (i + 0.5) * pitch;
          const y = (j + 0.5) * pitch;
          ctx.fillStyle = colors[rng.int(0, colors.length - 1)];
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.fill();
          drawn++;
        }
      }
    }
    ctx.restore();

    // 4. Grano (los defaults del engine a escala 1 son los números del original).
    //    unit mantiene el tamaño del grano al subir a resolución de impresión.
    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    return { pal, n, cols, rows, drawn };
  }

  // Traits + rareza global a partir de un resultado de render().
  function traits(res) {
    const cols = res.cols || res.n, rows = res.rows || res.n;
    const total = cols * rows;
    const coveragePct = Math.round((res.drawn / total) * 100);
    const coverageLabel = coveragePct > 70 ? 'Full' : coveragePct > 40 ? 'Scattered' : coveragePct > 0 ? 'Sparse' : 'Empty';
    const coverageR = coveragePct === 0 ? 'legendary' : coveragePct > 70 ? 'uncommon' : 'common';
    const gridLabel = res.n === 1 ? 'Solo' : res.n <= 3 ? 'Small' : res.n <= 5 ? 'Medium' : 'Large';
    const gridR = res.n === 1 ? 'rare' : res.n === 7 ? 'uncommon' : 'common';
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);
    // Fórmula del original: grid uncommon pesa 0.6 (no 0.7); coverage legendary no pondera.
    const score = prob
      * (gridR === 'rare' ? 0.3 : gridR === 'uncommon' ? 0.6 : 1)
      * (coverageR === 'rare' ? 0.3 : coverageR === 'uncommon' ? 0.7 : 1);
    const overall = score > 0.06 ? 'common' : score > 0.025 ? 'uncommon' : score > 0.008 ? 'rare' : score > 0.002 ? 'superrare' : 'legendary';
    return {
      list: [
        { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Grid',     val: cols + '×' + rows + ' · ' + gridLabel, rarity: gridR },
        { key: 'Coverage', val: coverageLabel + ' · ' + coveragePct + '%', rarity: coverageR },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).DTK = { render, traits, THRESHOLD, BG_GRADIENT };
})(typeof window !== 'undefined' ? window : globalThis);
