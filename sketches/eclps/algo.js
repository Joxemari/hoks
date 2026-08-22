/* ECLPS — lerroa. Iteración en un solo eje: una fila de círculos.
 *
 * La gramática, en cuatro reglas:
 *   1. Ningún círculo pisa el borde. El margen es el del SISTEMA
 *      (E.FIELD_MARGIN), el mismo que usan las obras de retículo.
 *   2. Lo que queda de ancho tras sacar el círculo y los márgenes es el
 *      RECORRIDO. Se subdivide en n−1 pasos, y el paso entre centros es
 *      SIEMPRE el mismo dentro de una pieza.
 *   3. El diámetro no depende del paso. Por eso n es quien decide el solape:
 *      con n bajo los círculos se rozan; con n alto cada uno se come a varios
 *      vecinos. El rango de n se DEDUCE del solape que se quiere (×1 tangentes
 *      a ×8 fundidos), así que ese recorrido es el mismo en cualquier formato.
 *   4. Algunos slots no se dibujan. La irregularidad no está en las posiciones
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
 * Ni proporción ni resolución se dan por hechas: todo se mide contra W, H o
 * min(W,H), así que la misma seed es la misma composición en cuadrado y en
 * horizontal, y en pantalla o a 300 dpi.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.ECLPS.render(ctx, W, H, seed, opts) → { pal, n, drawn, ratio, mode, … }
 *   HOKS.ECLPS.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;           // lado corto de referencia: calibra grano y px
  const BG_GRADIENT = 70;     // % de degradado en 'auto' — la obra nació con mesh
  const THRESHOLD = 0.68;     // Scatter: probabilidad de que un slot exista
  // Diámetro como fracción del lado corto. Centrado en 0.57, la proporción
  // elegida: banda con aire generoso arriba y abajo, no un friso que llena el
  // alto. Nunca > 1 − 2·margen: el círculo no puede salirse del cuadro.
  const D_MIN = 0.46, D_MAX = 0.68;
  const RING_LW = 0.0078;     // grosor de contorno como fracción del lado corto
  const A_MIN = 0.40, A_MAX = 0.85;   // alpha cuando la tinta no es opaca
  const P_OPAQUE = 0.45;      // probabilidad de tinta opaca
  const P_MULTIPLY = 0.35;    // probabilidad de fundido multiply
  const RING_ALPHA_MIN = 0.70; // tinta mínima del contorno (ver acoplamientos)
  const MUD_LUMA = 0.18;      // por debajo de esto, un color es "negro" para multiply
  const RATIO_MIN = 1.0, RATIO_MAX = 8.0;   // solape disponible: tangente → fundido
  const MODES = [
    { name: 'Stack', prob: 0.50 },
    { name: 'Xor',   prob: 0.28 },
    { name: 'Ring',  prob: 0.22 },
  ];
  const RHYTHMS = [
    { name: 'Cadence', prob: 0.65 },
    { name: 'Scatter', prob: 0.35 },
  ];

  // Rango de slots — DEDUCIDO, no calibrado. El solape vale D·(n−1)/recorrido,
  // así que fijar el solape que se quiere fija n. Por eso el mismo abanico de
  // solape existe en cuadrado y en horizontal aunque el recorrido sea otro.
  function slotRange(span, D) {
    if (!(span > 0) || !(D > 0)) return [1, 1];
    const k = span / D;
    const lo = Math.max(2, 1 + Math.round(RATIO_MIN * k));
    return [lo, Math.max(lo + 1, 1 + Math.round(RATIO_MAX * k))];
  }

  // Rachas alternas de presencia y silencio. Cada racha mide 1..runMax slots.
  // Es la diferencia entre un ritmo y un ruido: aquí las agrupaciones se
  // componen, no se le dejan al azar slot a slot.
  // ⟨esaldia:es⟩ El paso entre centros no cambia nunca. Lo que cambia es cuál de los círculos se calla.
  // ⟨esaldia:es⟩ La retícula no se rompe: el ritmo está hecho de ausencias.
  // ⟨esaldia:en⟩ The step between centres never changes. What changes is which circle falls silent.
  // ⟨esaldia:en⟩ The lattice never breaks: the rhythm is made of absences.
  // ⟨gramatika⟩
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
  // ⟨/gramatika⟩

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ field, bg, bgProbs, grainScale,
  //         slots, diameter, mode, rhythm, runMax, alpha, blend, threshold } }
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

    // 1. Fondo. Transversal: lo elige el sistema con su propio stream, así que
    //    cambiarlo no mueve ni un círculo. La obra tiende a degradado porque
    //    nació con mesh, pero el plano también es suyo.
    const bg = E.pickBg(seed, params, BG_GRADIENT);
    const rngBg = new E.Rng(seed ^ 0xDEADBEEF);
    let ground = null;                    // el suelo, cuando es un color y no un degradado
    if (bg === 'gradient') {
      ground = E.meshGround(E.drawMeshGradient(ctx, W, H, colors, rngBg));
    } else {
      ground = colors[rngBg.int(0, colors.length - 1)];
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Campo. El pliego y el campo son dos decisiones: con 'square' la obra se
    //    compone en un cuadrado centrado en el pliego, no estirada en él.
    const S = Math.min(W, H);
    const square = E.fieldMode(params) === 'square';
    const AW = square ? S : W;            // ancho del campo
    const ox = (W - AW) / 2;              // el campo, centrado en el pliego
    const margin = E.FIELD_MARGIN * S;    // margen del sistema, no de esta obra

    // 3. Escalares de la pieza. Se tiran TODOS y en bloque, aunque el
    //    laboratorio los pise después: así mover un mando no descoloca el
    //    resto. Los colores van antes que las ausencias por el mismo motivo —
    //    cambiar de ritmo no debe recolorear la fila.
    const dRnd      = rng.range(D_MIN, D_MAX);
    const mRnd      = rng.weighted(MODES).name;
    const rhyRnd    = rng.weighted(RHYTHMS).name;
    const runMaxRnd = rng.int(2, 4);
    const opaqueRnd = rng.bool(P_OPAQUE);
    const aRnd      = rng.range(A_MIN, A_MAX);
    const mulRnd    = rng.bool(P_MULTIPLY);

    // Diámetro: acotado para que el círculo entre en el alto CON su margen.
    // El tope también sale de la proporción nominal, por el mismo motivo.
    const dCap   = Math.min(1, E.nominalAspect(H, S) - E.FIELD_MARGIN * 2);
    const dScale = Math.min(params.diameter ? params.diameter : dRnd, dCap);
    const D = S * dScale, r = D / 2;

    // 4. El recorrido: lo que sobra del ancho del campo tras sacar el círculo y
    //    los dos márgenes. De ahí sale el rango de n, y solo entonces se tira.
    const span = AW - margin * 2 - D;

    // El rango de n sale de la PROPORCIÓN NOMINAL del formato, no del cociente
    // en píxeles: 1075×760 en pantalla, 4961×3508 en A3 y 9933×7016 en A1 son
    // el mismo 'horizontal', pero sus cocientes difieren lo bastante como para
    // cruzar un Math.round y cambiar n de un pliego a otro. El dibujo sigue en
    // píxeles reales; lo que se lee del formato es solo la decisión ENTERA.
    const q = E.nominalAspect(AW, S);
    const [nMin, nMax] = slotRange(q - E.FIELD_MARGIN * 2 - dScale, dScale);
    const nRnd = rng.int(nMin, nMax);

    const n      = params.slots  ? params.slots  : nRnd;
    const mode   = params.mode   ? params.mode   : mRnd;
    const rhythm = params.rhythm ? params.rhythm : rhyRnd;
    const runMax = params.runMax ? params.runMax : runMaxRnd;
    // Dos acoplamientos, medidos sobre 3.000 tiradas antes de ponerlos. Se
    // aplican DESPUÉS de tirar, así que no mueven el stream del RNG. Y solo
    // corrigen la tirada automática: si el laboratorio fuerza un valor, pasa
    // tal cual — explorar incluye poder mirar la zona mala a propósito.
    //   · Un contorno al 40% sobre el degradado no es una veladura, es un
    //     fallo: se perdía del todo en el 4,2% de las piezas. Ring conserva
    //     una tinta mínima.
    //   · multiply sobre una paleta con negros colapsa a barro y se come la
    //     paleta entera (12,0%). Con un color muy oscuro en la mano no se
    //     funde: el fundido estaba eligiendo por la paleta, no por la obra.
    const alphaRaw = params.alpha ? params.alpha : (opaqueRnd ? 1 : aRnd);
    const alpha = (!params.alpha && mode === 'Ring') ? Math.max(alphaRaw, RING_ALPHA_MIN) : alphaRaw;
    const blendRaw = params.blend ? params.blend : (mulRnd ? 'multiply' : 'source-over');
    const muddy = blendRaw === 'multiply' && colors.some(c => E.luma(c) < MUD_LUMA);
    const blendPal = (!params.blend && muddy) ? 'source-over' : blendRaw;

    const solo  = n < 2 || span <= 0;             // un único círculo: al centro
    const pitch = solo ? 0 : span / (n - 1);      // distancia entre centros — constante
    const ratio = solo ? 0 : D / pitch;           // >1 = hay solape
    const cy = H / 2;
    // Primer centro a margen + radio; el último, simétrico. Nada pisa el borde.
    const cx = i => ox + (solo ? AW / 2 : margin + r + i * pitch);

    // 5. Color por slot (se tira siempre, exista o no el círculo).
    //    Y tinta que se vea: sobre suelo plano, un disco del color del suelo no
    //    es un disco. Con dos o tres slots era la obra entera —el 14,0% de las
    //    piezas salía sin nada, la peor de la casa—, y es el mismo desajuste que
    //    ya corregían Ring y multiply un poco más arriba: el color se estaba
    //    eligiendo por la paleta, no por la obra. Consume la misma tirada.
    const cols = [];
    for (let i = 0; i < n; i++) cols.push(E.pickInk(rng, colors, ground));

    // 6. Ausencias. Cadence consume un número variable de tiradas; por eso va
    //    la última, para no arrastrar al resto de la pieza.
    let present;
    if (rhythm === 'Scatter') {
      present = [];
      for (let i = 0; i < n; i++) present.push(rng.next() <= threshold);
    } else {
      present = cadence(rng, n, runMax);
    }

    // La partitura siempre suena. Si NINGÚN slot queda presente no hay obra, hay
    // papel — y con dos o tres slots el silencio total no es un ritmo raro, es
    // una tirada corta que sale demasiado. Suena entonces el del medio.
    if (!present.some(Boolean)) present[(n - 1) >> 1] = true;

    // 7. Dibujo.
    let drawn = 0;
    for (let i = 0; i < n; i++) if (present[i]) drawn++;

    // Tercer acoplamiento, el mismo de PLLS y por eso vive en el motor: multiply
    // con una tinta casi blanca no oscurece nada. Es lo que quedaba después de
    // arreglar el color —un disco #fafafa fundido sobre #cd1440— y solo corrige
    // la tirada automática: si el laboratorio fuerza el fundido, pasa tal cual.
    //
    // `tinta` es la que se va a poner de verdad: Xor pinta el trazado entero con
    // cols[0]; Ring y Stack, la de cada slot presente.
    const tinta = mode === 'Xor' ? [cols[0]] : cols.filter((c, i) => present[i]);
    const blend = params.blend ? blendPal : E.blendFor(blendPal, tinta, [ground]);

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
      ctx.lineWidth = Math.max(1, S * RING_LW);
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

    // 8. Grano — unit mantiene su tamaño al subir a resolución de impresión.
    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    return { pal, n, nMin, nMax, drawn, ratio, mode, dScale, rhythm, runMax,
             alpha, blend, bg, field: square ? 'square' : 'sheet', present };
  }

  // Traits + rareza global a partir de un resultado de render().
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);

    // Posición dentro del rango del formato, no valor absoluto: así "Few" y
    // "Many" significan lo mismo en cuadrado que en horizontal.
    const span = Math.max(1, (res.nMax || 14) - (res.nMin || 2));
    const frac = (res.n - (res.nMin || 2)) / span;
    const slotsLabel = frac <= 0.15 ? 'Few' : frac <= 0.6 ? 'Medium' : 'Many';
    const slotsR = frac <= 0.02 ? 'rare' : frac >= 0.9 ? 'uncommon' : 'common';

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

  // La familia existe en UNA sola proporción. No es una limitación técnica —la
  // obra se compone igual en cuadrado— es que una fila necesita recorrido: en
  // cuadrado no es la misma obra más corta, son dos círculos y ya. El panel
  // puede cambiarlo por works.json; esto es lo que vale sin red y por defecto.
  const FORMATS = ['double'];

  (global.HOKS = global.HOKS || {}).ECLPS = { render, traits, slotRange, THRESHOLD, MODES, RHYTHMS, BG_GRADIENT, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
