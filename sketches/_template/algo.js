/* PLANTILLA — copia esta carpeta a sketches/<tu-obra>/ y empieza aquí.
 *
 * Reglas del juego (las que hacen que el laboratorio Y la web compartan código):
 *   1. El algoritmo es una FUNCIÓN PURA de canvas 2D. Nada de p5, nada de DOM.
 *   2. render(ctx, W, H, seed, opts) debe ser determinista: mismo seed → misma
 *      imagen. Usa SIEMPRE el RNG sembrado (new HOKS.Rng(seed)), nunca Math.random()
 *      para nada que deba reproducirse (el grano del motor es la única excepción).
 *   3. Devuelve los datos que la barra lateral necesita para los traits.
 *   4. NADA de píxeles absolutos ni de dar por hecho el formato: toda medida se
 *      expresa en función de W, H o min(W,H), y las constantes en px se escalan
 *      por E.unit(W, H, REF). Así la obra existe en los tres formatos
 *      (cuadrado · vertical · horizontal) y a cualquier resolución: la misma
 *      seed da la misma imagen en pantalla y a 300 dpi sobre un A1.
 *
 * Depende de window.HOKS (_engine.js). Para clonar a una obra real:
 *   - renombra el namespace de abajo (HOKS.TEMPLATE → HOKS.MIOBRA)
 *   - en index.html cambia la línea `const WORK = HOKS.TEMPLATE;`
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;   // lado corto de referencia: calibra el grano y las medidas en px
  const BG_GRADIENT = 30;   // % de degradado cuando el fondo va en 'auto' (el resto, plano)

  // opts: { palettes, locked, lockedIdx, params:{ grainScale, count } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const u = E.unit(W, H, REF);   // escala de las medidas en px absolutos
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;

    // —— Ejemplo trivial: fondo + círculos sembrados. Sustitúyelo por tu obra. ——
    // Fíjate en S = min(W,H): los radios se miden contra el lado corto, así el
    // dibujo no se deforma al cambiar de formato.
    const S = Math.min(W, H);
    // El suelo se guarda: la tinta sale de la MISMA lista, así que sin decir cuál
    // es el suelo la tirada puede caer justo en él y la marca no existe. E.pickInk
    // tira igual —un índice sobre la lista entera— y solo salta si cae ahí.
    const ground = rng.pickFrom(colors);
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);
    const n = params.count || rng.int(8, 40);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = E.pickInk(rng, colors, ground);
      ctx.beginPath();
      ctx.arc(rng.range(0, W), rng.range(0, H), rng.range(S * 0.02, S * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    E.grain(ctx, W, H, colors, grainScale, u);
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

  (global.HOKS = global.HOKS || {}).TEMPLATE = { render, traits, BG_GRADIENT };
})(typeof window !== 'undefined' ? window : globalThis);
