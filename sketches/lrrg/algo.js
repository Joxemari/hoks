/* LRRG — lerroa. Iteración en un solo eje: una fila de círculos sobre mesh
 * gradient, con grano.
 *
 * La gramática, en tres reglas:
 *   1. El ancho se subdivide en n slots. El paso entre centros (pitch = W/n) es
 *      SIEMPRE el mismo dentro de una pieza. La retícula es perfecta.
 *   2. El diámetro no depende del paso. Por eso n es quien decide el solape:
 *      con n bajo los círculos se rozan; con n alto cada uno se come a varios
 *      vecinos.
 *   3. Algunos slots no se dibujan. La irregularidad no está en las posiciones
 *      — está en las ausencias.
 *
 * Cómo se reparten esas ausencias (trait Rhythm):
 *   Cadence — rachas alternas de presencia y silencio (1..runMax slots cada
 *             una). El ritmo es deliberado: suena uno, callan dos, suenan tres.
 *   Scatter — una moneda independiente por slot. Las rachas que aparecen son
 *             accidentales, no compuestas.
 *
 * Tres lecturas del solape (trait Mode):
 *   Stack — relleno, izquierda a derecha: el que llega tapa al anterior.
 *   Xor   — un solo trazado con regla even-odd: la intersección se cancela.
 *           Lo visible es el residuo de la superposición, no las formas.
 *   Ring  — solo contorno: la retícula queda expuesta como dibujo.
 *
 * Y cuánto deja pasar la tinta (trait Ink): opaca, velada o vidrio, en normal
 * o en multiply. Con alpha < 1 el solape deja de tapar y empieza a mezclar:
 * cada intersección es un color que no está en la paleta.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.LRRG.render(ctx, W, H, seed, opts) → { pal, n, drawn, ratio, mode, … }
 *   HOKS.LRRG.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const N_MIN = 2, N_MAX = 14;        // slots que subdividen el ancho
  const THRESHOLD = 0.68;             // Scatter: probabilidad de que un slot exista
  const D_MIN = 0.45, D_MAX = 0.92;   // diámetro como fracción de la altura
  const RING_LW = 0.0055;             // grosor de contorno como fracción del ancho
  const A_MIN = 0.40, A_MAX = 0.85;   // alpha cuando la tinta no es opaca
  const P_OPAQUE = 0.45;              // probabilidad de tinta opaca
  const P_MULTIPLY = 0.35;            // probabilidad de fundido multiply
  const MODES = [
    { name: 'Stack', prob: 0.50 },
    { name: 'Xor',   prob: 0.28 },
    { name: 'Ring',  prob: 0.22 },
  ];
  const RHYTHMS = [
    { name: 'Cadence', prob: 0.65 },
    { name: 'Scatter', prob: 0.35 },
  ];

  // Rachas alternas de presencia y silencio. Cada racha mide 1..runMax slots.
  // Es la diferencia entre un ritmo y un ruido: aquí las agrupaciones se
  // componen, no se le dejan al azar slot a slot.
  function cadence(rng, n, runMax) {
    const out = [];
    let on = rng.bool(0.6);                  // ¿la fila empieza sonando o callada?
    while (out.length < n) {
      const len = rng.int(1, runMax);
      for (let k = 0; k < len && out.length < n; k++) out.push(on);
      on = !on;
    }
    return out;
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, slots, diameter,
  //         mode, rhythm, runMax, alpha, blend, threshold } }
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

    // 2. Escalares de la pieza. Se tiran TODOS y en bloque, aunque el
    //    laboratorio los pise después: así mover un slider no descoloca el
    //    resto. Los colores van antes que las ausencias por el mismo motivo —
    //    cambiar de ritmo no debe recolorear la fila.
    const nRnd      = rng.int(N_MIN, N_MAX);
    const dRnd      = rng.range(D_MIN, D_MAX);
    const mRnd      = rng.weighted(MODES).name;
    const rhyRnd    = rng.weighted(RHYTHMS).name;
    const runMaxRnd = rng.int(2, 4);
    const opaqueRnd = rng.bool(P_OPAQUE);
    const aRnd      = rng.range(A_MIN, A_MAX);
    const mulRnd    = rng.bool(P_MULTIPLY);

    const n      = params.slots    ? params.slots    : nRnd;
    const dScale = params.diameter ? params.diameter : dRnd;
    const mode   = params.mode     ? params.mode     : mRnd;
    const rhythm = params.rhythm   ? params.rhythm   : rhyRnd;
    const runMax = params.runMax   ? params.runMax   : runMaxRnd;
    const alpha  = params.alpha    ? params.alpha    : (opaqueRnd ? 1 : aRnd);
    const blend  = params.blend    ? params.blend    : (mulRnd ? 'multiply' : 'source-over');

    const pitch = W / n;              // distancia entre centros — constante
    const r = (H * dScale) / 2;
    const cy = H / 2;
    const ratio = (r * 2) / pitch;    // >1 = hay solape

    // 3. Color por slot (se tira siempre, exista o no el círculo).
    const cols = [];
    for (let i = 0; i < n; i++) cols.push(colors[rng.int(0, colors.length - 1)]);

    // 4. Ausencias. Cadence consume un número variable de tiradas; por eso va
    //    la última, para no arrastrar al resto de la pieza.
    let present;
    if (rhythm === 'Scatter') {
      present = [];
      for (let i = 0; i < n; i++) present.push(rng.next() <= threshold);
    } else {
      present = cadence(rng, n, runMax);
    }

    // 5. Dibujo.
    const cx = i => (i + 0.5) * pitch;   // los extremos pueden sangrar fuera del lienzo
    let drawn = 0;
    for (let i = 0; i < n; i++) if (present[i]) drawn++;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = blend;

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
      ctx.lineWidth = Math.max(1, W * RING_LW);
      for (let i = 0; i < n; i++) {
        if (!present[i]) continue;
        ctx.strokeStyle = cols[i];
        ctx.beginPath();
        ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Stack: izquierda a derecha. Opaco tapa; translúcido mezcla.
      for (let i = 0; i < n; i++) {
        if (!present[i]) continue;
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // 6. Grano.
    E.applyGrain(ctx, W, H, E.bakeGrain(W, H, colors, grainScale));

    return { pal, n, drawn, ratio, mode, dScale, rhythm, runMax, alpha, blend, present };
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

    // La partitura, tal cual: ■ suena, · calla.
    const score = res.present.map(p => (p ? '■' : '·')).join('');
    const pct = Math.round((res.drawn / Math.max(1, res.n)) * 100);
    const rhythmR = res.drawn === 0 ? 'legendary'
      : res.drawn === res.n ? (res.n <= 4 ? 'uncommon' : 'rare')
      : res.rhythm === 'Cadence' ? 'common' : 'uncommon';

    const inkLabel = res.alpha === 1 ? 'Opaque' : res.alpha >= 0.65 ? 'Veiled' : 'Glass';
    const inkR = res.blend === 'multiply'
      ? (inkLabel === 'Glass' ? 'rare' : 'uncommon')
      : (inkLabel === 'Opaque' ? 'common' : 'uncommon');

    const modeR = res.mode === 'Xor' ? 'rare' : res.mode === 'Ring' ? 'uncommon' : 'common';

    const f = r => (r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1);
    const s = prob * f(slotsR) * f(overlapR) * f(rhythmR === 'legendary' ? 'common' : rhythmR) * f(inkR) * f(modeR);
    const overall = s > 0.06 ? 'common' : s > 0.025 ? 'uncommon' : s > 0.008 ? 'rare' : s > 0.002 ? 'superrare' : 'legendary';

    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Slots',   val: res.n + ' · ' + slotsLabel, rarity: slotsR },
        { key: 'Overlap', val: overlapLabel + ' · ×' + rt.toFixed(2), rarity: overlapR },
        { key: 'Rhythm',  val: res.rhythm + ' ' + score + ' · ' + pct + '%', rarity: rhythmR },
        { key: 'Mode',    val: res.mode, rarity: modeR },
        { key: 'Ink',     val: inkLabel + (res.alpha === 1 ? '' : ' ×' + res.alpha.toFixed(2)) + (res.blend === 'multiply' ? ' · multiply' : ''), rarity: inkR },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).LRRG = { render, traits, N_MIN, N_MAX, THRESHOLD, MODES, RHYTHMS };
})(typeof window !== 'undefined' ? window : globalThis);
