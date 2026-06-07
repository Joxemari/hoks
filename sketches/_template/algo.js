/* PLANTILLA — copia esta carpeta a sketches/<tu-obra>/ y empieza aquí.
 *
 * Reglas del juego (las que hacen que el laboratorio Y la web compartan código):
 *   1. El algoritmo es una FUNCIÓN PURA de canvas 2D. Nada de p5, nada de DOM.
 *   2. render(ctx, W, H, seed, opts) debe ser determinista: mismo seed → misma
 *      imagen. Usa SIEMPRE el RNG sembrado (new HOKS.Rng(seed)), nunca Math.random()
 *      para nada que deba reproducirse (el grano del motor es la única excepción).
 *   3. Devuelve los datos que la barra lateral necesita para los traits.
 *
 * Depende de window.HOKS (_engine.js). Para clonar a una obra real:
 *   - renombra el namespace de abajo (HOKS.TEMPLATE → HOKS.MIOBRA)
 *   - en index.html cambia la línea `const WORK = HOKS.TEMPLATE;`
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  // opts: { palettes, locked, lockedIdx, params:{ grainScale, count } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;

    // —— Ejemplo trivial: fondo + círculos sembrados. Sustitúyelo por tu obra. ——
    ctx.fillStyle = rng.pickFrom(colors);
    ctx.fillRect(0, 0, W, H);
    const n = params.count || rng.int(8, 40);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = rng.pickFrom(colors);
      ctx.beginPath();
      ctx.arc(rng.range(0, W), rng.range(0, H), rng.range(W * 0.02, W * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    E.applyGrain(ctx, W, H, E.bakeGrain(W, H, colors, grainScale));
    // ————————————————————————————————————————————————————————————————————————

    return { pal, count: n };
  }

  function traits(res) {
    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: E.palRarity(res.pal.prob || 0.05) },
        { key: 'Count',   val: String(res.count), rarity: 'common' },
      ],
      overall: 'common',
    };
  }

  (global.HOKS = global.HOKS || {}).TEMPLATE = { render, traits };
})(typeof window !== 'undefined' ? window : globalThis);
