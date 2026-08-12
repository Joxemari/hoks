/* DTKRT — el retículo con regiones. Borobilak (círculos) + karratuak (bloques).
 *
 * FUENTE ÚNICA del algoritmo: este archivo lo consume TANTO el laboratorio
 * (sketches/dtkrt/index.html) COMO la página de producción (dtkrt.html).
 *
 * Gramática: una sola malla n×n leída dos veces.
 *   · presencia  — ¿hay círculo en esta celda?      (máscara booleana, como DTK)
 *   · pertenencia — ¿esta celda es región?          (poliominó sobre la misma malla)
 * El círculo es constante; lo que varía es el suelo bajo él. Figura y fondo
 * comparten retículo: el bloque no decora, reencuadra.
 *
 * Divergencias deliberadas respecto a DTK (y por qué):
 *   · Fondo PLANO, sin mesh gradient — figura/fondo necesita un plano estable.
 *   · Margen: la malla se retira del borde para que el suelo sea visible.
 *   · Tres roles de color fijos (fondo / bloque / punto) elegidos por luma —
 *     si cada círculo sacara su color, la capa de región no se leería.
 *   · n ≥ 3: con menos celdas no hay región que leer.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.DTKRT.render(ctx, W, H, seed, opts) → datos para traits
 *   HOKS.DTKRT.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const THRESHOLD = 0.8;    // probabilidad de que un círculo exista
  const MARGIN    = 0.11;   // retiro de la malla respecto al lienzo (fracción)
  const GUTTER    = 1.1;    // paso de celda = diámetro × 1.1 (10% de aire)
  const P_INVERT  = 0.25;   // 1 de cada 4: suelo claro, punto oscuro
  const P_ACCENT  = 0.4;    // acento suelto de 1 celda
  const P_TWIN    = 0.18;   // segunda región
  const REF       = 600;    // lado corto de referencia (calibra el grano)
  const BG_GRADIENT = 30;   // % de degradado cuando el fondo va en 'auto' (el resto, plano)

  // ── Roles de color ─────────────────────────────────────────────────────────
  // Tres papeles de la paleta ordenada por luma: suelo, bloque, punto. El bloque
  // vive entre los otros dos; si la paleta no tiene un tono intermedio con aire
  // suficiente, se deriva mezclando (una paleta de 2 colores sigue funcionando).
  function roles(rng, colors) {
    const sorted = colors.slice().sort((a, b) => E.luma(a) - E.luma(b));
    const k = sorted.length;
    const dark  = sorted.slice(0, Math.max(1, Math.ceil(k / 3)));
    const light = sorted.slice(Math.min(k - 1, Math.floor((k * 2) / 3)));

    const inverted = rng.bool(P_INVERT);
    const ground = rng.pickFrom(inverted ? light : dark);
    const dot    = rng.pickFrom(inverted ? dark  : light);

    // El bloque quiere ser un PIGMENTO de la paleta, no una mezcla: una mezcla
    // lee como veladura sucia, un color propio lee como plano. Preferimos el
    // tono intermedio con aire suficiente; si ninguno lo tiene, el que más aire
    // deje; solo se deriva cuando no queda ningún color libre (paletas de dos).
    // El aire con el PUNTO manda: el círculo se apoya en el bloque, y si ambos
    // comparten luma el círculo desaparece. El aire con el suelo es secundario
    // (si falta, la región se pierde). Sin candidato que cumpla las dos, se
    // deriva mezclando: la mezcla garantiza el punto medio.
    const lg = E.luma(ground), ld = E.luma(dot), mid = (lg + ld) / 2;
    const fit = colors.filter(c => c !== ground && c !== dot
      && Math.abs(E.luma(c) - ld) >= 0.18 && Math.abs(E.luma(c) - lg) >= 0.12);
    let block = fit.length
      ? fit.reduce((a, b) => (Math.abs(E.luma(a) - mid) <= Math.abs(E.luma(b) - mid) ? a : b))
      : null;
    const derived = !block;
    if (derived) block = E.lerpColor(ground, dot, 0.34);

    return { ground, block, dot, inverted, derived, contrast: Math.abs(ld - lg) };
  }

  // ── Región: poliominó por crecimiento ortogonal ────────────────────────────
  // Semilla + expansión a vecinos: salen barras, eles, escaleras y campos, sin
  // catálogo de formas. La forma es consecuencia de la regla, no un dibujo.
  // ⟨gramatika⟩
  function grow(rng, cols, rows, target, avoid) {
    const cells = new Set(), order = [];
    const si = rng.int(0, cols - 1), sj = rng.int(0, rows - 1);
    if (avoid && avoid.has(si + ',' + sj)) return cells;
    cells.add(si + ',' + sj); order.push([si, sj]);
    let guard = target * 12;
    while (cells.size < target && guard-- > 0) {
      const [ci, cj] = order[rng.int(0, order.length - 1)];
      const d = rng.int(0, 3);
      const ni = ci + (d === 0 ? 1 : d === 1 ? -1 : 0);
      const nj = cj + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
      const key = ni + ',' + nj;
      if (cells.has(key) || (avoid && avoid.has(key))) continue;
      cells.add(key); order.push([ni, nj]);
    }
    return cells;
  }
  // ⟨/gramatika⟩

  // Celdas pintadas con bordes redondeados al mismo entero: las contiguas
  // comparten arista exacta y la región se lee como una sola masa, sin costuras.
  function paintCells(ctx, cells, pitch) {
    for (const key of cells) {
      const [i, j] = key.split(',').map(Number);
      const x0 = Math.round(i * pitch), x1 = Math.round((i + 1) * pitch);
      const y0 = Math.round(j * pitch), y1 = Math.round((j + 1) * pitch);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }

  // ── Entrada principal ──────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, grid, threshold } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const threshold  = params.threshold  == null ? THRESHOLD : params.threshold;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const R = roles(rng, pal.colors);

    // 1. Suelo. Plano por diseño —figura/fondo necesita un plano estable— salvo
    //    que el laboratorio pida 'gradient'. Stream propio: la composición igual.
    if (E.pickBg(seed, params, BG_GRADIENT) === 'gradient') {
      E.drawMeshGradient(ctx, W, H, pal.colors, new E.Rng(seed ^ 0xDEADBEEF));
    } else {
      ctx.fillStyle = R.ground;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Malla retirada del borde. La CELDA es siempre cuadrada: n celdas en el
    //    lado corto, y el lado largo se lleva las que le caben. Así el formato
    //    no añade aire, añade retículo: en vertical la misma seed no es la
    //    misma obra estirada, es la obra pensada de pie.
    //
    //    El margen ha de ser el MISMO en los cuatro lados, y eso, con la celda
    //    cuadrada, deja de ser gratis: si el retículo es n×(n+k), de S−2m=n·p y
    //    L−2m=(n+k)·p sale p=(L−S)/k. El paso lo fija k, y el margen es
    //    consecuencia — no un parámetro. Se toma la k cuyo margen cae más cerca
    //    del objetivo; con la proporción DIN eso da 4×6, 5×8, 7×11…
    //    Con el campo en 'square' no crece: se compone cuadrado y se centra en
    //    el pliego, que es otra imagen — la obra cuadrada puesta sobre un DIN.
    const n = params.grid ? params.grid : rng.int(3, 7);
    const G = E.fieldGrid(W, H, n, params);          // retículo del sistema
    const { pitch, cols, rows, ox: offX, oy: offY } = G;
    const size = pitch / GUTTER;                     // diámetro: la celda menos su aire

    // 3. Máscara de presencia (una tirada por celda).
    const composition = [];
    for (let i = 0; i < cols; i++) {
      composition.push([]);
      for (let j = 0; j < rows; j++) composition[i].push(rng.next());
    }

    // 4. Capa de pertenencia.
    const total = cols * rows;
    const target = rng.int(2, Math.max(2, Math.round(total * 0.45)));
    const region = grow(rng, cols, rows, target, null);
    const twin = rng.bool(P_TWIN) ? grow(rng, cols, rows, rng.int(2, Math.max(2, Math.round(total * 0.2))), region) : new Set();
    const accent = new Set();
    if (rng.bool(P_ACCENT)) {
      const ai = rng.int(0, cols - 1), aj = rng.int(0, rows - 1), key = ai + ',' + aj;
      if (!region.has(key) && !twin.has(key)) accent.add(key);
    }

    ctx.save();
    ctx.translate(offX, offY);
    ctx.fillStyle = R.block;
    // El bloque llena su celda —así dos contiguas comparten arista y la región
    // se lee como una masa— pero el círculo deja dentro de la suya el aire del
    // GUTTER. Sin más, una región que toca el borde encoge el margen aparente
    // justo ese aire, y el margen deja de leerse igual en los cuatro lados. Se
    // recorta SOLO el contorno exterior del campo: dentro nada cambia, y la
    // tinta —bloque o punto— arranca a la misma distancia del papel.
    const air = (pitch - size) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(air, air, cols * pitch - air * 2, rows * pitch - air * 2);
    ctx.clip();
    paintCells(ctx, region, pitch);
    paintCells(ctx, twin, pitch);
    paintCells(ctx, accent, pitch);
    ctx.restore();

    // 5. Círculos — color constante: el punto no compite con la región.
    ctx.fillStyle = R.dot;
    let drawn = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (composition[i][j] <= threshold) {
          ctx.beginPath();
          ctx.arc((i + 0.5) * pitch, (j + 0.5) * pitch, size / 2, 0, Math.PI * 2);
          ctx.fill();
          drawn++;
        }
      }
    }
    ctx.restore();

    // 6. Grano — unit mantiene su tamaño al subir a resolución de impresión.
    E.grain(ctx, W, H, pal.colors, grainScale, E.unit(W, H, REF));

    return { pal, n, cols, rows, drawn, region, twin, accent, roles: R };
  }

  // ── Traits ─────────────────────────────────────────────────────────────────
  // Forma de la región deducida de sus celdas: caja contenedora vs. población.
  function shapeOf(cells) {
    if (!cells.size) return 'None';
    let i0 = Infinity, i1 = -Infinity, j0 = Infinity, j1 = -Infinity;
    for (const key of cells) {
      const [i, j] = key.split(',').map(Number);
      if (i < i0) i0 = i; if (i > i1) i1 = i;
      if (j < j0) j0 = j; if (j > j1) j1 = j;
    }
    const w = i1 - i0 + 1, h = j1 - j0 + 1, c = cells.size;
    if (c === 1) return 'Solo';
    if (w === 1 || h === 1) return 'Bar';
    if (c === w * h) return 'Field';
    if (c === w + h - 1) return 'Ell';
    return 'Cluster';
  }

  function traits(res) {
    const cols = res.cols || res.n, rows = res.rows || res.n;
    const total = cols * rows;
    const coveragePct = Math.round((res.drawn / total) * 100);
    const coverageLabel = coveragePct > 70 ? 'Full' : coveragePct > 40 ? 'Scattered' : coveragePct > 0 ? 'Sparse' : 'Empty';
    const coverageR = coveragePct === 0 ? 'legendary' : coveragePct > 70 ? 'uncommon' : 'common';

    // La rareza la fija n (celdas en el lado corto), que es la decisión; las
    // celdas del lado largo son consecuencia del formato, no una tirada más.
    const gridLabel = res.n <= 3 ? 'Small' : res.n <= 5 ? 'Medium' : 'Large';
    const gridR = res.n === 7 ? 'uncommon' : res.n === 3 ? 'uncommon' : 'common';

    const shape = shapeOf(res.region);
    const cells = res.region.size + res.twin.size + res.accent.size;
    const regionLabel = (res.twin.size ? 'Twin ' : '') + shape + ' · ' + cells + '/' + total;
    const regionR = res.twin.size ? 'rare' : shape === 'Solo' ? 'rare' : (shape === 'Field' || shape === 'Bar') ? 'uncommon' : 'common';

    const k = res.roles.contrast;
    const contrastLabel = k > 0.6 ? 'High' : k > 0.3 ? 'Mid' : 'Low';
    const contrastR = k > 0.6 ? 'common' : k > 0.3 ? 'common' : 'uncommon';

    const groundLabel = res.roles.inverted ? 'Light' : 'Dark';
    const groundR = res.roles.inverted ? 'uncommon' : 'common';

    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const w = r => (r === 'rare' ? 0.3 : r === 'uncommon' ? 0.6 : 1);
    const score = prob * w(gridR) * w(regionR) * w(groundR) * (coverageR === 'uncommon' ? 0.7 : 1);
    const overall = score > 0.06 ? 'common' : score > 0.025 ? 'uncommon' : score > 0.008 ? 'rare' : score > 0.002 ? 'superrare' : 'legendary';

    return {
      list: [
        { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: E.palRarity(prob) },
        { key: 'Grid',     val: cols + '×' + rows + ' · ' + gridLabel, rarity: gridR },
        { key: 'Region',   val: regionLabel, rarity: regionR },
        { key: 'Coverage', val: coverageLabel + ' · ' + coveragePct + '%', rarity: coverageR },
        { key: 'Ground',   val: groundLabel, rarity: groundR },
        { key: 'Contrast', val: contrastLabel, rarity: contrastR },
      ],
      overall,
    };
  }

  (global.HOKS = global.HOKS || {}).DTKRT = { render, traits, THRESHOLD, MARGIN, BG_GRADIENT };
})(typeof window !== 'undefined' ? window : globalThis);
