/* PTZD — el bloque partido. Familia nueva, EN PRUEBAS.
 *
 * KRRTK PARTE el cuadrado; PTZD lo ROMPE. La subdivisión conoce el todo —por eso
 * sus cortes van de lado a lado y sus piezas son rectángulos—. Una grieta sólo
 * conoce su punta: avanza, gira y se para contra lo que ya estaba roto. De ahí
 * piezas que son polígonos, un blanco que forma un ÁRBOL y no una retícula, y un
 * ORDEN —el de los cortes— que queda escrito en el resultado.
 *
 * La gramática, en ocho reglas (ver README.md para de dónde sale cada una):
 *   1. UN BLOQUE, UNA TINTA. Una masa, no una composición. Ningún color por pieza.
 *   2. EL CORTE ENTRA POR EL BORDE Y PASA POR ENCIMA DEL CANTO. Una grieta empieza
 *      en un canto; las que no, entran por otro corte: son ramas.
 *   3. LA ANCHURA ES LA HERRAMIENTA. Constante dentro de una obra, distinta entre
 *      obras (fina · media · ancha). Sale de un lineWidth, no de un cálculo.
 *   4. UN CORTE MUERE CONTRA OTRO. El corte i sólo puede morir contra los cortes
 *      0…i−1 o contra el canto: nunca los atraviesa. Aquí eso es ESTRUCTURAL y no
 *      una comprobación — un corte vive dentro de UNA pieza y acaba en su borde,
 *      y el borde de una pieza ya son los cortes anteriores. No hay X posible.
 *   5. HAY CORTES QUE SUELTAN Y CORTES QUE NO. El que llega al borde suelta una
 *      pieza; el que agota su recorrido dentro es una SAJADURA: abre y no divide.
 *   6. EL CORTE METE ESPACIO, NO QUITA MATERIA. Si se quitara materia las piezas
 *      se quedarían en su sitio y el hueco mediría exactamente la gubia. Como lo
 *      que se mete es espacio, las piezas TIENEN que apartarse.
 *   7. LA COSTURA Y LA GRAVITACIÓN. Una pieza es la costura y no se mueve; las
 *      demás se apartan de aquella de la que se soltaron y arrastran a sus
 *      descendientes. El bloque se abre desde la costura, y más cuanto más lejos.
 *   8. CADENCIA. Los cortes no se reparten parejos: se acumulan en un pasaje y
 *      dejan silencios de masa entera. Un bloque con los cortes a intervalos
 *      iguales no es una obra, es una muestra de material.
 *
 * Y de ahí, SIN REGLA PROPIA: la silueta. Nadie la traza. Es lo que queda cuando
 * las piezas se han apartado. El cuadrado del principio no sobrevive a su rotura.
 *
 * Nada gira: rotar una pieza convierte el bloque partido en una explosión.
 *
 * La composición se genera en CAMPO NORMALIZADO (lado corto = 1, largo = la
 * proporción nominal) y se mide ahí, no en píxeles. Es la lección de la deriva de
 * EVOL: medir ELIGE —el recuento de piezas descarta candidatos—, así que en
 * píxeles la misma seed podría dar siete piezas en pantalla y ocho a 300 dpi.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.PTZD.render(ctx, W, H, seed, opts) → { pal, tipo, piezas, sajaduras, … }
 *   HOKS.PTZD.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;          // lado corto de referencia: calibra el grano

  // El suelo es PLANO, siempre. Figura/fondo necesita un plano estable: es lo que
  // decidió DTKRT al romper con las "G" y lo que ratificó EVOL. Un degradado
  // detrás de una masa cortada convierte el vacío en atmósfera, y aquí el vacío
  // es el asunto.
  const BG_GRADIENT = 0;

  // ── Regla 3: la gubia ──────────────────────────────────────────────────────
  // Él talla las Lurras con palos, maderas y cañas de bambú — herramientas
  // distintas, cada una con su grosor. Así que el filo cambia de obra a obra y NO
  // cambia dentro de una. Es el eje serial de la familia: la misma gramática
  // dicha con otra voz. Fracción del lado del bloque.
  const GUBIAS = [
    { key: 'fina',  w: 0.0130, p: 0.28 },
    { key: 'media', w: 0.0210, p: 0.50 },   // ~2%, que es lo que se mide en la referencia
    { key: 'ancha', w: 0.0330, p: 0.22 },
  ];

  // ── Los cuatro tipos ───────────────────────────────────────────────────────
  // `cortes` son los que se INTENTAN; los que salen se cuentan al final, que es
  // la regla de método de TRZS y EVOL: el tipo declara y el resultado se comprueba.
  const TIPOS = [
    { key: 'hendido',   p: 0.18, cortes: [1, 2],  sajaduras: [1, 2] },
    { key: 'partido',   p: 0.30, cortes: [3, 4],  sajaduras: [0, 1] },
    { key: 'arbol',     p: 0.38, cortes: [5, 8],  sajaduras: [0, 2] },
    { key: 'astillado', p: 0.14, cortes: [8, 11], sajaduras: [0, 1] },
  ];

  const BLOQUE_MIN = 0.58, BLOQUE_MAX = 0.70;   // lado del bloque / lado corto del campo

  // Un corte CRUZA. Va por avances largos en su rumbo y escalones cortos a un
  // lado — la escalera que se ve en la referencia—, no por rachas del mismo
  // tamaño en cualquier dirección: eso boxea sobre sí mismo y recorta rectángulos
  // (el riesgo «puzzle» del README, y lo primero que salió al mirar el grid).
  const AVANCE_MIN  = 0.20, AVANCE_MAX  = 0.44;   // tramo en el rumbo / lado del bloque
  const ESCALON_MIN = 0.045, ESCALON_MAX = 0.16;  // tramo al costado / lado del bloque
  const TRAMOS_CORTE = [4, 9], TRAMOS_SAJA = [3, 5];
  const P_ESCALON_BIES = 0.16;   // el escalón sale al bies (±45°) en vez de a escuadra
  const P_RUMBO_GIRA   = 0.16;   // el rumbo entero se ladea ±45° a mitad de camino

  // ── El pulso: la mano ──────────────────────────────────────────────────────
  // Un canto de madera no es una recta. La gubia tiembla, la fibra se rompe y el
  // filo se va — y esa irregularidad no es un defecto del taco: es lo que separa
  // una talla de un vector. Pero NO es ruido: un temblor por vértice da un borde
  // sucio, no una mano. Es una ONDA — valores sembrados e interpolados suave—,
  // así que el canto ondula despacio y con su propia longitud.
  //
  // Y va sobre la GEOMETRÍA COMPARTIDA, no sobre cada cara al dibujar. El corte
  // que separa dos piezas es UNA polilínea, ondulada una sola vez, y las dos la
  // heredan. Si cada cara ondulase por su cuenta el hueco cambiaría de anchura y
  // la obra se leería RASGADA en vez de cortada: la regla 3, rota. Por eso el
  // pulso entra al generar y no al pintar.
  const PULSO_MIN = 0.0025, PULSO_MAX = 0.0080;  // amplitud / lado del bloque
  const PASO_CORTE = 0.022, ONDA_CORTE = 0.85;   // paso y longitud de onda / lado
  const PASO_CANTO = 0.030, CANTO_PULSO = 1.60;  // el canto ondula más que el corte: se talló a pulso
  const ARRANQUE   = 0.075;                      // el pulso nace en cero sobre el borde
  const MORFA_MAX  = 0.055;                      // desvío de las esquinas / lado del bloque

  const PIEZA_MIN  = 0.032;                     // área mínima de pieza / área del bloque
  const DERIVA_MIN = 0.15, DERIVA_MAX = 0.50;   // paso de deriva, en anchuras de gubia
  const GRAVEDAD   = 0.28;                      // sesgo hacia abajo de la deriva
  const RETIRO_MAX = 0.030;                     // retirada del canto / lado del bloque
  const LADEO_MAX  = 0.075;                     // rotación de la retícula de direcciones, en rad

  // ── Vectores y polígonos ───────────────────────────────────────────────────
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = a => Math.hypot(a[0], a[1]);
  const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  function area(poly) {   // con signo
    let s = 0;
    for (let i = 0, n = poly.length; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return s / 2;
  }

  function centroid(poly) {
    let cx = 0, cy = 0, s = 0;
    for (let i = 0, n = poly.length; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n], f = a[0] * b[1] - b[0] * a[1];
      cx += (a[0] + b[0]) * f; cy += (a[1] + b[1]) * f; s += f;
    }
    if (Math.abs(s) < 1e-12) return poly[0].slice();
    return [cx / (3 * s), cy / (3 * s)];
  }

  function inside(poly, p) {
    let hit = false;
    for (let i = 0, n = poly.length, j = n - 1; i < n; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) &&
          p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
  }

  // Ruido coherente sembrado en [-1,1], periódico en n: la onda del pulso.
  function onda(rng, n) {
    const v = []; for (let i = 0; i < n; i++) v.push(rng.range(-1, 1));
    return t => {
      const x = (((t % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i;
      const a = v[i % n], b = v[(i + 1) % n];
      return a + (b - a) * (f * f * (3 - 2 * f));
    };
  }

  // Normal hacia dentro de la arista i, deducida del sentido de giro del
  // polígono en vez de probando con `inside`: con cantos de doscientos vértices,
  // probar punto a punto es O(m²) y aquí sobra.
  function normales(poly) {
    const s = area(poly) > 0 ? 1 : -1, m = poly.length, out = [];
    for (let i = 0; i < m; i++) {
      const a = poly[i], b = poly[(i + 1) % m];
      out.push(norm([-(b[1] - a[1]) * s, (b[0] - a[0]) * s]));
    }
    return out;
  }

  /* El bloque. Tiende al cuadrado o al rectángulo y no lo es: las cuatro
   * esquinas se desvían —el taco no está escuadrado— y los cantos ondulan con el
   * pulso. La onda es periódica sobre el perímetro, así que cierra sin costura. */
  function bloquePoly(rng, bx, by, bw, bh, pulso, morfa, S) {
    const c = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]]
      .map(p => add(p, [rng.range(-morfa, morfa) * bw, rng.range(-morfa, morfa) * bh]));
    const wx = onda(rng, 12), wy = onda(rng, 12);
    const per = c.reduce((s, p, i) => s + len(sub(c[(i + 1) % 4], p)), 0) || 1;
    const out = [];
    let pos = 0;
    for (let i = 0; i < 4; i++) {
      const a = c[i], b = c[(i + 1) % 4], L = len(sub(b, a));
      const pasos = Math.max(2, Math.round(L / (PASO_CANTO * S)));
      for (let k = 0; k < pasos; k++) {
        const t = k / pasos, p = lerp2(a, b, t), s = (pos + L * t) / per;
        out.push([p[0] + pulso * CANTO_PULSO * wx(s), p[1] + pulso * CANTO_PULSO * wy(s)]);
      }
      pos += L;
    }
    return out;
  }

  // Intersección de a→b con c→d. Devuelve {t,u} o null.
  function cross(a, b, c, d) {
    const r = sub(b, a), s = sub(d, c);
    const den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-12) return null;
    const q = sub(c, a);
    const t = (q[0] * s[1] - q[1] * s[0]) / den;
    const u = (q[0] * r[1] - q[1] * r[0]) / den;
    if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
    return { t, u };
  }

  // Primer corte del segmento a→b con el borde del polígono, ignorando los
  // toques a la salida (t≈0), que son el propio punto de entrada.
  function firstHit(poly, a, b) {
    let best = null;
    for (let i = 0, n = poly.length; i < n; i++) {
      const c = poly[i], d = poly[(i + 1) % n];
      const x = cross(a, b, c, d);
      if (!x || x.t < 1e-6) continue;
      if (!best || x.t < best.t) best = { t: x.t, u: x.u, edge: i, pt: lerp2(a, b, x.t) };
    }
    return best;
  }

  // ¿Está la posición x (índice de vértice) en el arco que va de s1 a s2 hacia
  // delante? Las posiciones del borde se miden como `edge + t`, así que un
  // vértice j vale j. Esto es lo que hace que partir por la MISMA arista por la
  // que se entró funcione igual que por otra.
  function arcPos(x, s1, m) { const a = (x - s1) % m; return a < 0 ? a + m : a; }

  /* Parte `poly` (con las clases de arista `kind`) por el corte `cut`.
   * Devuelve las dos caras, cada una con sus vértices y sus clases de arista.
   * kind: 0 = canto del bloque, 1 = corte. Se conserva a través de las particiones
   * para que la regla 2 pueda distinguir un corte que entra por el canto de una
   * RAMA que entra por otro corte. */
  function split(poly, kind, cut) {
    const m = poly.length;
    const sIn  = cut.inEdge  + cut.inT;
    const sOut = cut.outEdge + cut.outT;
    const spanA = arcPos(sOut, sIn, m);      // longitud del arco sIn→sOut
    const pts = cut.pts;

    // Vértices del borde en el arco (s1 → s2), en orden.
    function between(s1, s2) {
      const span = arcPos(s2, s1, m), out = [];
      for (let j = 0; j < m; j++) {
        const a = arcPos(j, s1, m);
        if (a > 1e-9 && a < span - 1e-9) out.push({ j, a });
      }
      out.sort((p, q) => p.a - q.a);
      return out;
    }

    // Cara A: el corte de ida, y el borde de vuelta desde la salida hasta la entrada.
    const vA = pts.slice(), kA = [];
    for (let i = 0; i < pts.length - 1; i++) kA.push(1);
    const bA = between(sOut, sIn);
    kA.push(kind[cut.outEdge]);
    for (const v of bA) { vA.push(poly[v.j]); kA.push(kind[v.j]); }
    kA[kA.length - 1] = kind[cut.inEdge];

    // Cara B: el corte al revés, y el borde desde la entrada hasta la salida.
    const vB = pts.slice().reverse(), kB = [];
    for (let i = 0; i < pts.length - 1; i++) kB.push(1);
    const bB = between(sIn, sOut);
    kB.push(kind[cut.inEdge]);
    for (const v of bB) { vB.push(poly[v.j]); kB.push(kind[v.j]); }
    kB[kB.length - 1] = kind[cut.outEdge];

    void spanA;
    return [{ poly: vA, kind: kA }, { poly: vB, kind: kB }];
  }

  // ── La retícula de direcciones ─────────────────────────────────────────────
  // Ocho direcciones a 45°, con un LADEO pequeño por obra. Sin el ladeo el dibujo
  // sale de CAD; con él sigue siendo ortogonal pero está hecho a mano. Los giros
  // son ±90° la mayoría y ±45° de vez en cuando: nunca curvas, que es lo que
  // separa esto de un puzzle.
  function dirVec(i, ladeo) { const a = i * Math.PI / 4 + ladeo; return [Math.cos(a), Math.sin(a)]; }
  function snapDir(v, ladeo) {
    let best = 0, bd = -2;
    for (let i = 0; i < 8; i++) { const d = v[0] * dirVec(i, ladeo)[0] + v[1] * dirVec(i, ladeo)[1]; if (d > bd) { bd = d; best = i; } }
    return best;
  }

  /* Camina un corte dentro de una pieza. Empieza SIEMPRE en su borde (regla 2) y
   * entra perpendicular: ése es su RUMBO. Después alterna avances largos en el
   * rumbo con escalones cortos a un costado, que es como cruza la referencia — no
   * como una racha que puede ir a cualquier lado, que es lo que boxea sobre sí
   * misma y devuelve un puzzle de rectángulos.
   *
   * Acaba de dos maneras y las dos son la obra (regla 5): tocando el borde —y
   * entonces SUELTA— o agotando sus tramos —y entonces es una SAJADURA—. */
  function walk(rng, pc, inEdge, inT, S, tramos, ladeo, escala, pulso) {
    const poly = pc.poly, m = poly.length;
    const a = poly[inEdge], b = poly[(inEdge + 1) % m];
    const p0 = lerp2(a, b, inT);
    let n = norm([-(b[1] - a[1]), b[0] - a[0]]);
    if (!inside(poly, add(p0, mul(n, 1e-4)))) n = mul(n, -1);
    const wx = onda(rng, 16), wy = onda(rng, 16);
    // El rumbo nace SIEMPRE a escuadra (índice par), aunque se entre por una
    // arista al bies. Si no, un corte que entra por un escalón oblicuo hereda un
    // rumbo diagonal, y como los avances son largos la obra se llena de aspas: la
    // cordillera por la puerta de atrás. Al bies sólo se va en un escalón.
    let rumbo = (((snapDir(n, ladeo) + 1) >> 1) << 1) & 7;   // al par MÁS CERCANO, no al de abajo
    const k = escala == null ? 1 : escala;

    const pts = [p0];
    let cur = p0, espina = p0, arco = 0;
    const runs = rng.int(tramos[0], tramos[1]);
    let lado = rng.bool(0.5) ? 2 : 6;
    for (let r = 0; r < runs; r++) {
      const avance = (r % 2 === 0);
      let d, L;
      if (avance) {
        d = rumbo;
        L = rng.range(AVANCE_MIN, AVANCE_MAX) * S * k;
      } else {
        // El escalón sale a escuadra casi siempre y al bies de vez en cuando: el
        // quiebro oblicuo de la referencia. Y cambia de costado, que es lo que
        // impide que la escalera se convierta en una diagonal (la «cordillera»).
        const g = rng.bool(P_ESCALON_BIES) ? (lado === 2 ? 1 : 7) : lado;
        d = (rumbo + g) & 7;
        L = rng.range(ESCALON_MIN, ESCALON_MAX) * S * k;
        if (rng.bool(0.45)) lado = lado === 2 ? 6 : 2;
      }
      // El tramo no se emite de una pieza: se recorre a pasos cortos, y cada
      // punto es la ESPINA (el recorrido ideal) más el pulso. La espina guarda el
      // rumbo —así el corte sigue cruzando y no se pone a vagar— y la onda le
      // quita la recta. Al arrancar el pulso vale cero, porque el corte tiene que
      // nacer exactamente sobre el borde: si se moviera, la partición no cerraría.
      const base = dirVec(d, ladeo);
      let hecho = 0, salida = null;
      while (hecho < L - 1e-9) {
        const paso = Math.min(PASO_CORTE * S, L - hecho);
        hecho += paso; arco += paso;
        espina = add(espina, mul(base, paso));
        const t = Math.min(1, arco / (ARRANQUE * S)), u = arco / (S * ONDA_CORTE);
        const next = add(espina, [pulso * t * wx(u), pulso * t * wy(u)]);
        const hit = firstHit(poly, cur, next);
        if (hit) { salida = hit; break; }
        pts.push(next);
        cur = next;
      }
      if (salida) {
        pts.push(salida.pt);
        return { pts, inEdge, inT, outEdge: salida.edge, outT: salida.u, suelta: true };
      }
      // El rumbo dobla A ESCUADRA, nunca al bies. Ladeándolo 45° los avances
      // —que son largos— salían diagonales, y varios seguidos promedian a
      // montaña: la «cordillera» que EVOL ya se comió. Al bies sólo se va en un
      // escalón, que es corto y no llega a leerse como dirección.
      if (!avance && rng.bool(P_RUMBO_GIRA)) rumbo = (rumbo + (rng.bool(0.5) ? 2 : 6)) & 7;
    }
    return { pts, inEdge, inT, suelta: false };
  }

  /* Regla 6, la mitad que la deriva no puede dar: cada pieza se RETIRA de sus
   * cantos exteriores por su cuenta. Sólo se mueven las aristas de clase 0 —el
   * canto del bloque—; las que son corte se quedan donde están, y por eso los
   * huecos interiores conservan la anchura de la gubia mientras la silueta se
   * escalona. Sin esto el bloque sigue siendo el rectángulo del principio, que es
   * justo lo que la referencia no es.
   *
   * Se desplaza cada arista hacia dentro y se recalculan los vértices como corte
   * de las dos aristas desplazadas que llegan a él. */
  function retirar(poly, kind, d) {
    if (!(d > 0)) return poly;
    const m = poly.length, N = normales(poly), out = [];
    for (let i = 0; i < m; i++) {
      // Sólo se mueve el vértice cuyas DOS aristas son canto. Donde el canto se
      // encuentra con un corte, el vértice se queda: si se moviera arrastraría el
      // extremo del corte y el hueco dejaría de medir la gubia. Así la retirada
      // se desvanece justo donde empieza la rotura, que es como se recoge una
      // placa de verdad.
      //
      // Se hace por VÉRTICE y no desplazando cada recta: con cantos ondulados,
      // dos aristas casi paralelas cortan en el infinito y el polígono explota.
      if (kind[(i - 1 + m) % m] !== 0 || kind[i] !== 0) { out.push(poly[i].slice()); continue; }
      out.push(add(poly[i], mul(norm(add(N[(i - 1 + m) % m], N[i])), d)));
    }
    return Math.abs(area(out)) < Math.abs(area(poly)) * 0.35 ? poly : out;
  }

  // ¿Cuánto del perímetro de una pieza es canto del bloque? Lo usa «la que
  // falta»: sólo se puede perder una placa que esté por fuera.
  function orilla(poly, kind) {
    let canto = 0, todo = 0;
    for (let i = 0, m = poly.length; i < m; i++) {
      const l = len(sub(poly[(i + 1) % m], poly[i]));
      todo += l; if (kind[i] === 0) canto += l;
    }
    return todo > 0 ? canto / todo : 0;
  }

  // Un punto del borde de la pieza, elegido por CADENCIA (regla 8): se sortean
  // varios candidatos y gana el que cae más cerca del foco de la obra, así los
  // cortes se agolpan en un pasaje y dejan silencios. Se prefiere entrar por el
  // canto mientras quede canto, y por un corte anterior después: eso es una rama.
  function entrada(rng, pc, foco, quiereCanto) {
    const poly = pc.poly, m = poly.length;
    let best = null;
    for (let k = 0; k < 5; k++) {
      let tot = 0; const L = [];
      for (let i = 0; i < m; i++) {
        const l = len(sub(poly[(i + 1) % m], poly[i]));
        const w = l * (quiereCanto ? (pc.kind[i] === 0 ? 3 : 1) : (pc.kind[i] === 1 ? 3 : 1));
        L.push(w); tot += w;
      }
      let x = rng.next() * tot, e = 0;
      while (e < m - 1 && x > L[e]) { x -= L[e]; e++; }
      const t = rng.range(0.18, 0.82);
      const p = lerp2(poly[e], poly[(e + 1) % m], t);
      // El foco INCLINA, no manda: con un denominador pequeño ganaba siempre el
      // candidato más cercano y todos los cortes se agolpaban en una esquina,
      // dejando tres cuartos de bloque intactos. Eso no es un silencio, es una
      // pieza sin repartir.
      const score = 1 / (0.16 + len(sub(p, foco)));
      if (!best || score > best.score) best = { e, t, score };
    }
    return best;
  }

  // ── Color: dos, y se renuncia al resto ─────────────────────────────────────
  // Una masa de tres colores deja de ser una masa. El par se elige por DISTANCIA
  // de color y no por luminancia: con luminancia las series Itten (cuatro colores
  // entre 0,31 y 0,44 de luma) dan rojo sobre rojo, porque son contrastes de TONO
  // y ahí el ojo lee la figura aunque el valor sea el mismo. Elegido el par, la
  // luminancia decide quién es suelo.
  //
  // NOTA: esto es lo mismo que hace evol/algo.js. Es la segunda familia que lo
  // pide, así que su sitio es _engine.js y no una copia — el bug histórico de
  // PLLS (acabados invisibles durante meses, ocho copias inline) fue exactamente
  // esto. Se sube cuando esta familia decida si merece página.
  function dist(c1, c2) {
    const a = E.hexToRgb(c1), b = E.hexToRgb(c2);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  function pareja(rng, colors) {
    let best = null;
    for (let i = 0; i < colors.length; i++)
      for (let j = i + 1; j < colors.length; j++) {
        const d = dist(colors[i], colors[j]);
        if (!best || d > best.d) best = { d, a: colors[i], b: colors[j] };
      }
    if (!best) return { ink: '#111', ground: '#f4f2ec' };
    let lo = best.a, hi = best.b;
    if (E.luma(lo) > E.luma(hi)) { const t = lo; lo = hi; hi = t; }

    // Y EL PAPEL: elegir el par más distante lleva siempre al blanco, y el blanco
    // no es el único suelo posible. Si la paleta tiene un tono medio que aguante
    // el contraste, se usa la mitad de las veces — sobre papel crudo la masa pesa
    // distinto, porque el suelo deja de ser ausencia de tinta y se vuelve material.
    let ground = hi, crudo = false;
    const cand = colors.filter(c => c !== lo && c !== hi && E.luma(c) > 0.42 && dist(c, lo) > 110);
    if (cand.length && rng.bool(0.32)) { ground = rng.pickFrom(cand); crudo = true; }
    return { ink: lo, ground, crudo };
  }

  // ── Entrada principal ──────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ grainScale, tipo, gubia, cortes,
  //         sajaduras, deriva, bg } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const u = E.unit(W, H, REF);
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const col = pareja(rng, pal.colors);

    // Campo normalizado: lado corto = 1, largo = la proporción NOMINAL. Todo se
    // decide y se mide aquí; el píxel sólo aparece al dibujar.
    const NA = E.nominalAspect(W, H);
    const FW = W >= H ? NA : 1, FH = W >= H ? 1 : NA;
    const SS = Math.min(W, H);
    const toPx = p => [p[0] * SS, p[1] * SS];

    const tipo = params.tipo ? (TIPOS.find(t => t.key === params.tipo) || TIPOS[2])
                             : rng.weighted(TIPOS.map(t => ({ ...t, prob: t.p })));
    const gubia = params.gubia ? (GUBIAS.find(g => g.key === params.gubia) || GUBIAS[1])
                               : rng.weighted(GUBIAS.map(g => ({ ...g, prob: g.p })));
    const ladeo = rng.range(-LADEO_MAX, LADEO_MAX);

    // El bloque. Nace exacto: toda la irregularidad viene después, y viene de las
    // reglas 6 y 7. No está centrado del todo — la reserva pesa a un lado, que es
    // lo que las hilarriak enseñan: un bloque plantado de cara, con su aire.
    const S = rng.range(BLOQUE_MIN, BLOQUE_MAX);
    // Tiende al cuadrado o al rectángulo, y no se queda en ninguno: la proporción
    // se abre de 0,82 a 1,18 y encima las esquinas se desvían. Un taco de madera
    // no está escuadrado, y un polígono exacto delata al vector.
    const bw = S * rng.range(0.82, 1.18), bh = S * rng.range(0.82, 1.18);
    const pulso = rng.range(PULSO_MIN, PULSO_MAX) * S;
    const morfa = rng.range(0.012, MORFA_MAX);
    const holg = pulso * CANTO_PULSO + morfa * Math.max(bw, bh) + 0.012;
    const bx = Math.min(FW - bw - holg, Math.max(holg, (FW - bw) / 2 + rng.range(-0.045, 0.045) * FW));
    const by = Math.min(FH - bh - holg, Math.max(holg, (FH - bh) / 2 + rng.range(-0.035, 0.020) * FH));
    const bloque = bloquePoly(rng, bx, by, bw, bh, pulso, morfa, S);
    const areaBloque = Math.abs(area(bloque));

    // El foco de la cadencia (regla 8): hacia dónde se agolpan los cortes.
    const foco = [bx + rng.range(0.22, 0.78) * bw, by + rng.range(0.22, 0.78) * bh];

    let piezas = [{ poly: bloque, kind: bloque.map(() => 0), drift: [0, 0], hondura: 0, retiro: 0 }];
    const sajaduras = [];
    const cortes = [];

    const nCortes = params.cortes != null ? params.cortes : rng.int(tipo.cortes[0], tipo.cortes[1]);
    const nSaj    = params.sajaduras != null ? params.sajaduras : rng.int(tipo.sajaduras[0], tipo.sajaduras[1]);
    const paso    = (params.deriva != null ? params.deriva : rng.range(DERIVA_MIN, DERIVA_MAX)) * gubia.w * S;

    // Cuándo se aparta la reserva: si es al primer corte se lleva media obra y
    // el resto sale picado; si tarda demasiado ya no queda masa grande que
    // apartar. Entre el segundo y el cuarto.
    const reservaTras = rng.int(1, 3);
    let reservaPuesta = false;
    let intentos = 0;
    while (cortes.length < nCortes && intentos < nCortes * 18) {
      intentos++;

      // LA RESERVA. Sin ella el reparto por área iguala los tamaños y la obra se
      // vuelve un suelo de baldosas: todas las piezas del mismo peso y ningún
      // sitio donde mirar. Es el «papel pintado» que EVOL ya se comió, y aquí
      // salía en cuanto había más de cinco piezas. A partir del segundo o tercer
      // corte, la masa mayor queda INTACTA y todo lo demás pasa a ocurrir contra
      // ella. Eso es la regla 8 de verdad —un pasaje denso y un silencio de masa
      // entera—, y es lo que enseña la referencia: una placa grande abajo y las
      // demás partidas encima. La reserva sigue admitiendo sajaduras: abrirla sin
      // dividirla es justamente lo que puede pasarle a un bloque entero.
      if (!reservaPuesta && cortes.length >= reservaTras) {
        let mx = -1, mi = -1;
        piezas.forEach((p, i) => { const a = Math.abs(area(p.poly)); if (a > mx) { mx = a; mi = i; } });
        if (mx > areaBloque * 0.25) { piezas[mi].reserva = true; reservaPuesta = true; }
      }

      // Qué pieza se corta: por área entre las que no son reserva.
      let tot = 0; const pesos = piezas.map(p => { const a = p.reserva ? 0 : Math.abs(area(p.poly)); tot += a; return a; });
      if (tot <= 0) break;
      let x = rng.next() * tot, idx = 0;
      while (idx < piezas.length - 1 && x > pesos[idx]) { x -= pesos[idx]; idx++; }
      const pc = piezas[idx];
      if (pc.reserva) continue;

      // Mientras haya canto se entra por el canto; después, por un corte
      // anterior: eso es una rama, y es lo que hace que el blanco sea un árbol.
      const ent = entrada(rng, pc, foco, cortes.length < 2 || rng.bool(0.45));
      const cut = walk(rng, pc, ent.e, ent.t, S, TRAMOS_CORTE, ladeo, 1, pulso);
      if (!cut.suelta) continue;

      const [A, B] = split(pc.poly, pc.kind, cut);
      const aA = Math.abs(area(A.poly)), aB = Math.abs(area(B.poly));
      if (A.poly.length < 3 || B.poly.length < 3) continue;
      if (Math.min(aA, aB) < PIEZA_MIN * areaBloque) continue;

      // Reglas 6 y 7: la pieza pequeña es la que se soltó. La madre se queda —es
      // la costura— y la hija se aparta, arrastrando a las suyas. Si se quitara
      // materia se quedaría en su sitio; como se mete espacio, tiene que moverse.
      const madre = aA >= aB ? A : B, hija = aA >= aB ? B : A;
      const dir = norm(sub(centroid(hija.poly), centroid(madre.poly)));
      const delta = add(mul(dir, paso), [0, GRAVEDAD * paso]);

      piezas.splice(idx, 1);
      piezas.push({ poly: madre.poly, kind: madre.kind, drift: pc.drift, hondura: pc.hondura, retiro: pc.retiro });
      piezas.push({ poly: hija.poly,  kind: hija.kind,  drift: add(pc.drift, delta), hondura: pc.hondura + 1,
                    retiro: rng.bool(0.3) ? 0 : rng.range(0.008, RETIRO_MAX) * S });
      cortes.push(cut);
    }

    /* LA QUE FALTA. La silueta de la referencia no tiene mordiscos pequeños: le
     * faltan placas enteras. Y no hay por qué inventarse un contorno raro para
     * conseguirlo — el bloque ya está partido, así que basta con que alguna de
     * las piezas que se soltaron NO ESTÉ. Es la lectura más literal del bloque
     * partido, y es la que hace que el contorno no sea un polígono proporcional.
     *
     * Sólo puede perderse una placa de la ORILLA: quitar una de dentro dejaría un
     * agujero rodeado de masa, y eso es el `calado`, que es territorio de EVOL y
     * no de aquí. Y la reserva nunca se va: es contra ella contra lo que se lee
     * todo lo demás. */
    const nFalta = params.faltan != null ? params.faltan
                 : (piezas.length >= 4 ? rng.weighted([{ prob: 0.42, v: 0 }, { prob: 0.40, v: 1 }, { prob: 0.18, v: 2 }]).v : 0);
    let faltan = 0;
    for (let f = 0; f < nFalta; f++) {
      const cand = piezas
        .map((p, i) => ({ i, o: orilla(p.poly, p.kind), a: Math.abs(area(p.poly)), p }))
        .filter(c => !c.p.reserva && c.o > 0.30 && c.a < areaBloque * 0.30);
      if (!cand.length || piezas.length <= 2) break;
      // Se pierde antes una placa de fuera y pequeña, que es lo que se cae de un
      // bloque roto; la grande de en medio no se cae sola.
      let tot = 0; const w = cand.map(c => { const v = c.o / (0.04 + c.a / areaBloque); tot += v; return v; });
      let x = rng.next() * tot, j = 0;
      while (j < cand.length - 1 && x > w[j]) { x -= w[j]; j++; }
      piezas.splice(cand[j].i, 1);
      faltan++;
    }

    // La retirada del canto se aplica ANTES de las sajaduras, no al dibujar: una
    // sajadura empieza en el borde de su pieza, y si la pieza se recoge después
    // el corte arranca fuera de ella, flotando en el suelo. `retirar` conserva el
    // número de vértices y su orden, así que las clases de arista siguen valiendo.
    for (const pc of piezas) pc.poly = retirar(pc.poly, pc.kind, pc.retiro);

    // Las sajaduras: entran por el borde y se mueren dentro. No sueltan nada.
    let sInt = 0;
    while (sajaduras.length < nSaj && sInt < nSaj * 14) {
      sInt++;
      let tot = 0; const pesos = piezas.map(p => { const a = Math.abs(area(p.poly)); tot += a; return a; });
      let x = rng.next() * tot, idx = 0;
      while (idx < piezas.length - 1 && x > pesos[idx]) { x -= pesos[idx]; idx++; }
      const pc = piezas[idx];
      const ent = entrada(rng, pc, foco, true);
      const cut = walk(rng, pc, ent.e, ent.t, S, TRAMOS_SAJA, ladeo, 0.5, pulso);
      if (cut.suelta) continue;
      // Una sajadura que muere a un pelo del borde no es una sajadura: es un corte
      // que no llegó. Se exige aire por delante.
      const fin = cut.pts[cut.pts.length - 1];
      let aire = Infinity;
      for (let i = 0, m = pc.poly.length; i < m; i++) {
        const a = pc.poly[i], b = pc.poly[(i + 1) % m], ab = sub(b, a);
        const t = Math.max(0, Math.min(1, (ab[0] * (fin[0] - a[0]) + ab[1] * (fin[1] - a[1])) / (ab[0] * ab[0] + ab[1] * ab[1] || 1)));
        aire = Math.min(aire, len(sub(fin, lerp2(a, b, t))));
      }
      if (aire < gubia.w * S * 1.6) continue;
      sajaduras.push({ pts: cut.pts, drift: pc.drift });
    }

    // ── Dibujo ───────────────────────────────────────────────────────────────
    ctx.fillStyle = col.ground;
    ctx.fillRect(0, 0, W, H);

    // Regla 3: la anchura sale de un lineWidth. Cada pieza se come SU mitad del
    // corte repasando su propio contorno con el color del suelo, así que dos
    // vecinas dejan el corte entero — y el canto exterior también queda cortado,
    // que es lo que le pasa al canto del taco.
    const gPx = gubia.w * S * SS;
    ctx.lineJoin = 'round';
    ctx.lineWidth = gPx;

    for (const pc of piezas) {
      ctx.beginPath();
      pc.poly.forEach((p, i) => {
        const q = toPx(add(p, pc.drift));
        if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      });
      ctx.closePath();
      ctx.fillStyle = col.ink; ctx.fill();
      ctx.strokeStyle = col.ground; ctx.stroke();
    }

    // Las sajaduras se pintan encima: son el único blanco que no es una frontera.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = col.ground;
    for (const s of sajaduras) {
      ctx.beginPath();
      s.pts.forEach((p, i) => {
        const q = toPx(add(p, s.drift));
        if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      });
      ctx.stroke();
    }
    ctx.lineCap = 'butt';

    E.grain(ctx, W, H, [col.ink, col.ground], grainScale, u);

    // Lo medido, que es lo que manda sobre lo declarado.
    const mancha = piezas.reduce((s, p) => s + Math.abs(area(p.poly)), 0) / (FW * FH);
    return {
      pal, tipo: tipo.key, gubia: gubia.key, col,
      piezas: piezas.length, sajaduras: sajaduras.length, cortes: cortes.length,
      faltan, pulso: +(pulso / S).toFixed(4), morfa: +morfa.toFixed(3),
      pedidos: nCortes,
      hondura: piezas.reduce((m, p) => Math.max(m, p.hondura), 0),
      mancha, crudo: !!col.crudo,
    };
  }

  /* La rareza global es PROBABILIDAD COMBINADA, no el máximo de los rasgos.
   * Por máximo, con siete rasgos casi cualquier obra encuentra uno poco común y
   * la familia entera sale rara: medido sobre 400 tiradas daba 6% common, 58%
   * uncommon, 36% rare y CERO superrare o legendary. Un reparto en el que nada
   * es común y nada es excepcional no dice nada — el mismo error que EVOL cometió
   * con «desbocado», que etiquetaba al 88% de las piezas.
   *
   * Las frecuencias de abajo salen de esa misma medición, no de la intuición, y
   * hay que volver a medirlas cada vez que se toque la gramática. */
  const F_PIEZAS = { 2: 0.12, 3: 0.12, 4: 0.19, 5: 0.16, 6: 0.14, 7: 0.12, 8: 0.07, 9: 0.06, 10: 0.02 };
  const F_SAJA   = { 0: 0.36, 1: 0.42, 2: 0.22 };

  function rar(p) { return p > 0.06 ? 'common' : p > 0.018 ? 'uncommon' : p > 0.005 ? 'rare' : p > 0.0012 ? 'superrare' : 'legendary'; }

  // El producto de seis probabilidades es siempre un número diminuto, así que
  // como valor absoluto no dice nada: cualquier umbral fijo mete al 100% de las
  // obras en el mismo cajón. Lo que se compara es contra la obra MÁS PROBABLE de
  // la familia — cuánto se aparta ésta de la que más sale. Así la escala es
  // legible (1 = la más corriente posible) y no depende de cuántos rasgos haya.
  const P_MAX = { tipo: 0.38, gubia: 0.50, pz: 0.19, sj: 0.42, papel: 0.68, pal: 0.12 };
  function rarComb(r) { return r > 0.30 ? 'common' : r > 0.10 ? 'uncommon' : r > 0.030 ? 'rare' : r > 0.008 ? 'superrare' : 'legendary'; }

  function traits(res) {
    const pTipo  = (TIPOS.find(t => t.key === res.tipo)  || { p: 0.25 }).p;
    const pGubia = (GUBIAS.find(g => g.key === res.gubia) || { p: 0.33 }).p;
    const pPz    = F_PIEZAS[res.piezas] || 0.01;
    const pSj    = F_SAJA[res.sajaduras] || 0.02;
    const pPapel = res.crudo ? 0.32 : 0.68;
    const pPal   = res.pal.prob || 0.05;

    const list = [
      { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: E.palRarity(pPal) },
      { key: 'Tipo',     val: res.tipo,  rarity: rar(pTipo) },
      { key: 'Gubia',    val: res.gubia, rarity: rar(pGubia) },
      { key: 'Piezas',   val: String(res.piezas), rarity: rar(pPz) },
      { key: 'Sajadura', val: res.sajaduras ? String(res.sajaduras) : '—', rarity: rar(pSj) },
      { key: 'Hondura',  val: String(res.hondura), rarity: 'common' },
      { key: 'Mancha',   val: (res.mancha * 100).toFixed(1) + '%', rarity: 'common' },
      { key: 'Papel',    val: res.crudo ? 'crudo' : 'blanco', rarity: rar(pPapel) },
    ];
    const r = Math.min(1, pTipo / P_MAX.tipo) * Math.min(1, pGubia / P_MAX.gubia) *
              Math.min(1, pPz / P_MAX.pz) * Math.min(1, pSj / P_MAX.sj) *
              Math.min(1, pPapel / P_MAX.papel) * Math.min(1, pPal / P_MAX.pal);
    return { list, overall: rarComb(r) };
  }

  (global.HOKS = global.HOKS || {}).PTZD = { render, traits, BG_GRADIENT, TIPOS, GUBIAS };
})(typeof window !== 'undefined' ? window : globalThis);
