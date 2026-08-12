/* LRRG — lerroa. Iteración en un solo eje: una fila de círculos sobre mesh
 * gradient, con grano.
 *
 * La gramática, en tres reglas:
 *   1. El ancho se subdivide en n slots. El paso entre centros (pitch = W/n) es
 *      SIEMPRE el mismo dentro de una pieza. La retícula es perfecta.
 *   2. El diámetro no depende del paso. Por eso n es quien decide el solape:
 *      con n bajo los círculos se rozan; con n alto cada uno se come a varios
 *      vecinos.
 *   3. Cada slot tira una moneda. Los que salen cruz no se dibujan. La
 *      irregularidad no está en las posiciones — está en las ausencias.
 *
 * Tres lecturas del solape (trait Mode):
 *   Stack — relleno opaco, izquierda a derecha: el que llega tapa al anterior.
 *   Xor   — un solo trazado con regla even-odd: la intersección se cancela.
 *           Lo visible es el residuo de la superposición, no las formas.
 *   Ring  — solo contorno: la retícula queda expuesta como dibujo.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.LRRG.render(ctx, W, H, seed, opts) → { pal, n, drawn, ratio, mode, dScale }
 *   HOKS.LRRG.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const N_MIN = 2, N_MAX = 14;        // slots que subdividen el ancho
  const THRESHOLD = 0.68;             // probabilidad de que un slot exista
  const D_MIN = 0.45, D_MAX = 0.92;   // diámetro como fracción de la altura
  const MODES = [
    { name: 'Stack', prob: 0.50 },
    { name: 'Xor',   prob: 0.28 },
    { name: 'Ring',  prob: 0.22 },
  ];

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, slots, diameter, mode, threshold } }
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

    // 1. Fondo: mesh gradient (stream RNG independiente, como el resto de la familia G).
    const rngBg = new E.Rng(seed ^ 0xDEADBEEF);
    E.drawMeshGradient(ctx, W, H, colors, rngBg);

    // 2. Parámetros de la fila. Se tiran SIEMPRE, aunque el laboratorio los pise
    //    después: así mover un slider no descoloca el resto de la pieza.
    const nRnd = rng.int(N_MIN, N_MAX);
    const dRnd = rng.range(D_MIN, D_MAX);
    const mRnd = rng.weighted(MODES).name;
    const n      = params.slots    ? params.slots    : nRnd;
    const dScale = params.diameter ? params.diameter : dRnd;
    const mode   = params.mode     ? params.mode     : mRnd;

    const pitch = W / n;              // distancia entre centros — constante
    const r = (H * dScale) / 2;
    const cy = H / 2;
    const ratio = (r * 2) / pitch;    // >1 = hay solape

    // 3. Presencia y color. Ambos se tiran para TODOS los slots, existan o no:
    //    quitar un círculo no debe recolorear a sus vecinos.
    const present = [], cols = [];
    for (let i = 0; i < n; i++) present.push(rng.next() <= threshold);
    for (let i = 0; i < n; i++) cols.push(colors[rng.int(0, colors.length - 1)]);

    // 4. Dibujo.
    const cx = i => (i + 0.5) * pitch;   // los extremos pueden sangrar fuera del lienzo
    let drawn = 0;
    for (let i = 0; i < n; i++) if (present[i]) drawn++;

    if (mode === 'Xor') {
      // Un único trazado con todos los círculos + regla even-odd: donde se
      // solapa un número par de discos, el relleno se cancela.
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (!present[i]) continue;
        ctx.moveTo(cx(i) + r, cy);
        ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = cols[0];
      ctx.fill('evenodd');
    } else if (mode === 'Ring') {
      ctx.lineWidth = Math.max(1, W * 0.0035);
      for (let i = 0; i < n; i++) {
        if (!present[i]) continue;
        ctx.strokeStyle = cols[i];
        ctx.beginPath();
        ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Stack: opaco, izquierda a derecha. El que llega tapa al anterior.
      for (let i = 0; i < n; i++) {
        if (!present[i]) continue;
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Grano.
    E.applyGrain(ctx, W, H, E.bakeGrain(W, H, colors, grainScale));

    return { pal, n, drawn, ratio, mode, dScale };
  }

  // Traits + rareza global a partir de un resultado de render().
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);

    const slotsLabel = res.n <= 3 ? 'Few' : res.n <= 8 ? 'Medium' : 'Many';
    const slotsR = res.n <= 2 ? 'rare' : res.n >= 13 ? 'uncommon' : 'common';

    const rt = res.ratio;
    const overlapLabel = rt < 0.98 ? 'Apart' : rt < 1.6 ? 'Grazing' : rt < 3 ? 'Overlap' : rt < 5 ? 'Dense' : 'Fused';
    const overlapR = rt < 0.98 ? 'uncommon' : rt >= 5 ? 'rare' : 'common';

    const pct = Math.round((res.drawn / Math.max(1, res.n)) * 100);
    const presenceLabel = pct === 0 ? 'Silence' : pct === 100 ? 'Complete' : pct > 60 ? 'Broken' : 'Sparse';
    const presenceR = pct === 0 ? 'legendary' : pct === 100 ? (res.n <= 4 ? 'uncommon' : 'rare') : pct <= 40 ? 'uncommon' : 'common';

    const modeR = res.mode === 'Xor' ? 'rare' : res.mode === 'Ring' ? 'uncommon' : 'common';

    const f = r => (r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1);
    const score = prob * f(slotsR) * f(overlapR) * f(presenceR === 'legendary' ? 'common' : presenceR) * f(modeR);
    const overall = score > 0.06 ? 'common' : score > 0.025 ? 'uncommon' : score > 0.008 ? 'rare' : score > 0.002 ? 'superrare' : 'legendary';

    return {
      list: [
        { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Slots',    val: res.n + ' · ' + slotsLabel, rarity: slotsR },
        { key: 'Overlap',  val: overlapLabel + ' · ×' + rt.toFixed(2), rarity: overlapR },
        { key: 'Presence', val: presenceLabel + ' · ' + res.drawn + '/' + res.n, rarity: presenceR },
        { key: 'Mode',     val: res.mode, rarity: modeR },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).LRRG = { render, traits, N_MIN, N_MAX, THRESHOLD, MODES };
})(typeof window !== 'undefined' ? window : globalThis);
