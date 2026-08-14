/* HRRS — itzulera. La tercera respuesta a la pregunta de TRZS: ¿qué pasa cuando
 * la cinta se encuentra consigo misma?
 *
 *   TRZS  se CRUZA   → una por encima, otra por debajo, y el suelo entre las dos
 *                      como una INCISIÓN. La profundidad se decide cruce a cruce.
 *   EVOL  se FUNDE   → un solo cuerpo, y el suelo queda ATRAPADO: un ojo.
 *   HRRS  NO SE ENCUENTRA → llega hasta donde iba a tocarse y se pone AL LADO.
 *                      Entre las dos vueltas queda el suelo, en una franja del
 *                      mismo grosor en toda la obra: el CANAL.
 *
 * Por eso esta es la más simple de dibujar y la más difícil de componer: cuando
 * quitas la profundidad no queda nada detrás de lo que esconderse. O el recorrido
 * es bueno, o no hay obra.
 *
 * La gramática, en seis reglas (ver README.md):
 *   1. UNA CINTA, DOS MEDIDAS. Anchura W y canal g ≈ W/5. Todo lo que se ve es
 *      una de las dos, o suelo. Nada más.
 *   2. EL PLIEGUE ES EL SUCESO. Donde TRZS pone un cruce, HRRS pone una
 *      horquilla: la cinta gira 180° y vuelve al lado, con el eje desplazado
 *      exactamente W + g.
 *   3. EL RECORRIDO NO SE TOCA NUNCA. Distancia mínima entre dos tramos no
 *      contiguos: W + g, exacta y por abajo. Es la única restricción dura.
 *   4. NO HAY HALO. Si nada se solapa, no hay nada que cortar. UN SOLO stroke().
 *   5. CABOS A ESCUADRA Y AL AIRE. El remate es el corte de la gubia y nada más.
 *   6. LOS OJOS SON EL RITMO. Un recinto que sólo produzca ojos del mismo tamaño
 *      es un laberinto, no un plano.
 *
 * ── Lo que NO se porta de TRZS, y es la mitad de su código ──────────────────
 * Diagrama de nudo, plan de secciones, orden de pintado, punzón, halo y los
 * detectores del halo. Nada de eso está aquí y no es un olvido: si hiciera falta
 * un halo sería porque dos tramos se están tocando, y eso no es un problema de
 * dibujo — es la regla 3 incumplida.
 *
 * Y tampoco se porta `selfAvoid`, que es lo que el README proponía. Un relajador
 * EMPUJA pares de segmentos hasta la distancia mínima, así que trabaja sobre un
 * recorrido que ya está mal y lo corrige; y corrigiendo mueve todo lo demás —en
 * TRZS eso costó una tanda entera de cabos aplastados—. Aquí la restricción es
 * CONSTRUCTIVA: el recorrido no crece hacia donde no cabe, así que nunca hay nada
 * que arreglar. No hay solver, no hay pasadas, no hay convergencia. La regla 3 no
 * se persigue: se cumple.
 *
 * Ni proporción ni resolución se dan por hechas: la composición se genera en un
 * campo normalizado (lado corto = 1, largo = la proporción NOMINAL del formato) y
 * sólo al dibujar se multiplica por el lado corto real. No es elegancia — `medir`
 * ELIGE el candidato, así que medir en píxeles haría que la misma seed diera otra
 * obra en pantalla y a 300 dpi. Es la lección de la «deriva» de EVOL.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.HRRS.render(ctx, W, H, seed, opts) → { pal, tipo, ojos, ocupacion, … }
 *   HOKS.HRRS.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;          // lado corto de referencia: calibra grano y px
  // El suelo es PLANO, siempre. Es la decisión de DTKRT que EVOL ratificó: un
  // degradado detrás de una figura plana convierte el vacío en atmósfera, y aquí
  // el vacío es la mitad de la obra. El laboratorio puede forzarlo para mirarlo.
  const BG_GRADIENT = 0;

  // ── Las dos medidas (regla 1) ───────────────────────────────────────────────
  // La anchura es la GUBIA: constante dentro de una obra, distinta entre obras.
  // Es el eje serial de la familia —la misma gramática dicha con otro filo—, y es
  // lo contrario del cuerpo modulado de EVOL: aquí el grosor ES el material.
  // La referencia da ~1/23 del lado corto. El techo bajó de 0,072: con la cinta
  // gorda y el recorrido corto la obra se lee como un glifo —una letra gruesa—
  // en vez de como un camino. Lo que hace a esta familia no es la cinta: es
  // cuánto recorrido cabe en ella.
  const W_MIN = 0.026, W_MAX = 0.058;      // × lado corto
  // El canal, atado a la anchura y no al cuadro. En TRZS la incisión se mide
  // sobre el cuadro (`gapAbs`) para que salga igual de fina pase lo que pase con
  // la anchura, porque allí es una separación TÉCNICA. Aquí el canal es parte del
  // dibujo —es una de las dos medidas que se ven— así que va atado a W: una cinta
  // gorda con un canal de cinta fina se lee como dos obras distintas pegadas.
  // Ésa es la pregunta abierta de `¿g fijo o proporcional?` del README, resuelta
  // por lo que el canal ES, no por lo que costaría menos.
  const GAMMA = [0.17, 0.26];              // g = W × gamma · la referencia da ~1/5

  // ── El recorrido ────────────────────────────────────────────────────────────
  // Ángulos VIVOS y nada más (observación 5: ni una curva). Pero la magnitud del
  // giro es CONTINUA y no un juego de tres valores exactos: la referencia está
  // cortada a mano y no repite un solo ángulo. Con {45, 90, 135} clavados la obra
  // sale de CAD —una retícula girada, el riesgo «laberinto»—; con la magnitud
  // tirada de un rango, sale cortada.
  //
  // Y es BIMODAL, que es la lección de la «cordillera» de EVOL: una ley continua
  // sobre todo el rango promedia a nada. Aquí las dos modas son el ángulo casi
  // recto —lo que hace que el dibujo se lea como un recinto— y el bies, ancho.
  // Y hay una TERCERA moda, que es la que de verdad faltaba: el QUIEBRO. Un giro
  // de cuatro a veinte grados — la cinta sigue, pero no recta. Con sólo las dos
  // modas anteriores el recorrido gira fuerte en CADA vértice y sale nervioso, un
  // garabato; la referencia tiene tiradas largas con quiebros pequeños dentro, y
  // eso es lo que la hace parecer cortada a mano y no calculada.
  //
  // El quiebro es además lo que deja VIVIR al acompañamiento. Una vuelta que gira
  // fuerte al primer vértice se despide del pasillo enseguida; con quiebros, la
  // vuelta sigue al lado de la ida durante varios tramos, que es lo que hace a
  // esta familia. Ver `paralelo` en `andar`.
  //
  // Ojo con una cosa que parece un problema y no lo es: dos tramos casi
  // colineales i e i+2 no son contiguos y por tanto la regla 3 los mide. Su
  // distancia es exactamente la longitud del tramo de en medio, que nunca baja de
  // D por el tope de abajo — así que un tramo largo con quiebros es legal por
  // construcción, y no hay que hacerle ninguna excepción.
  const P_QUIEBRO = 0.34;
  const P_QUIEBRO_PAR = 0.86;              // dentro de un acompañamiento
  const GIRO_QUIEBRO = [4, 20];
  const P_RECTO = 0.60;                    // reparto entre las otras dos modas
  const GIRO_RECTO = [70, 112];            // la moda del recinto
  const GIRO_BIES = [32, 152];             // la del corte al bies, ancha
  const NGIRO = 7;                         // giros que se sortean por vértice
  // Cuántos vértices dura un acompañamiento recién abierto. Es un suceso con
  // duración, no un instante: es lo que separa «dos tramos que se cruzaron cerca»
  // de «una vuelta que va al lado de la ida».
  const PARALELO = [3, 7];
  // Las longitudes van por RACHAS, no por tirada. Es la lección del «diente de
  // sierra» de EVOL: una tirada por vértice da ruido y no gesto. Una racha
  // mantiene la ESCALA del tramo 2..5 vértices y luego la rompe, así que salen
  // pasajes de tramos largos y pasajes de tramos cortos — que es la «cadencia» de
  // PTZD y lo que la referencia tiene: ningún tramo mide lo que el vecino, pero
  // los vecinos se parecen.
  const RACHA_L = [2, 3, 3, 4, 5];
  // La escala de racha bajó de [0,10 · 0,42] a esto, y no por gusto: con tramos
  // que cruzan cuatro décimas del campo, un recorrido que no se puede tocar se
  // encierra en seis tramos y se muere. Medido: mediana de 14 vértices con un
  // tope de 90 — o sea que el tope no existía y lo que decidía la obra era el
  // ahogo. Con tramos cortos el recorrido VIVE, y de la vida sale el dibujo.
  const LARGO = [0.07, 0.30];               // escala de racha, × lado corto
  const LARGO_JIT = [0.70, 1.30];          // variación dentro de la racha
  // Y de cada giro se prueban TRES longitudes, no una: la de la racha y dos más
  // cortas. Es lo que le deja colarse por un sitio estrecho en vez de darse por
  // acabada — el equivalente de mirar antes de pasar.
  const LARGO_ALT = [1, 0.55, 0.32];
  // Vértices por cinta. El tope es un tope de verdad: el recorrido casi siempre
  // se acaba antes por no caber (regla 4), que es el final bueno.
  const VERT_MAX = 90;

  // ── El pliegue (regla 2) ────────────────────────────────────────────────────
  // Dos giros del mismo signo que suman 180°, separados por un tramo de longitud
  // la que deja el eje a W+g: con el primer giro de φ, el brazo mide (W+g)/sen φ.
  // Al salir del segundo giro la cinta corre ANTIPARALELA a lo que acaba de
  // dejar, a W+g exactos, y sigue así todo lo que quiera. El pliegue es el único
  // sitio de la obra donde la restricción se toca con la mano.
  //
  // φ ≈ 90 da la horquilla a escuadra; al bies el brazo sale más largo y el
  // remate del pliegue en diagonal. Las dos están en la referencia, y φ va
  // tirada igual que los giros: si el pliegue fuera el único ángulo exacto de la
  // obra, sería el único sitio donde se vería la máquina.
  const PHI_RECTO = [74, 106], PHI_BIES = [42, 138], NPHI = 4;
  // Cuánto mide la vuelta del pliegue, en fracción de la ida. Menos de la mitad y
  // el acompañamiento no se llega a leer; más de 1 y la vuelta se pasa de largo,
  // que también es bueno de vez en cuando.
  const VUELTA = [0.55, 1.15];
  // DOS PLIEGUES SEGUIDOS del mismo signo dan las TRES VUELTAS EN PARALELO de la
  // referencia (observación 3). Tres seguidos dan cuatro, y a partir de ahí es un
  // peine — el riesgo «serpentín», que es el riesgo propio de esta familia porque
  // el pliegue es su primitiva. Se permite la cadena de dos con probabilidad alta
  // y la de tres baja, y de cuatro no hay.
  const CADENA = [0.46, 0.13];             // P(segundo pliegue), P(tercero)

  // ── El campo ────────────────────────────────────────────────────────────────
  // Margen en los cuatro lados: la obra NO toca el marco. Es lo que pide el
  // detector `margen` del README, y tiene una consecuencia que no es estética —
  // con el anillo del borde garantizado libre de tinta, la inundación desde el
  // borde con la que se miden los ojos siempre tiene por dónde entrar. Si la
  // cinta pudiera salirse del cuadro, un ojo y el exterior serían la misma cosa.
  const MARGEN = 0.055;                    // × lado corto, al BORDE de la cinta
  // LA RESERVA (observación 8: densa arriba a la izquierda, abierta abajo a la
  // derecha). Una esquina por la que no pasa nada. No es un adorno: es desde
  // donde se lee todo lo demás, y sin ella el recorrido reparte su ocupación por
  // toda la hoja y la obra se queda sin sitio desde donde mirarse.
  const RESERVA = [0.26, 0.44];            // lado de la esquina vetada, × campo
  // LA RUTA. Un recorrido va a algún sitio: la cinta no vagabundea alrededor de
  // un punto, atraviesa el campo por una sucesión de hitos y los va dejando
  // atrás. Sin esto la obra sale hecha un ovillo en medio de la hoja con cuatro
  // márgenes muertos que no son la reserva —medido: ocupación del 6 al 11% con un
  // techo declarado del 24%—, porque una deriva hacia un punto fijo deja de tirar
  // en cuanto se llega a él.
  //
  // La ruta NO dibuja: pesa. Los hitos deciden por dónde pasa la cinta y nada
  // más; lo que hace en el camino —plegarse, acompañarse, morirse— sigue saliendo
  // de la gramática. Es el mismo papel que los estratos en EVOL o la fila en
  // ECLPS: la familia necesita una espina de composición, y aquí es el viaje.
  const HITOS = [2, 4];                    // hitos de la ruta
  const HITO_JIT = 0.20;                   // desvío lateral de cada hito, × campo
  const DERIVA = 2.2;                      // cuánto pesa ir hacia el hito
  // La holgura: cuánto pesa que el tramo caiga donde hay aire. Es lo que
  // distingue un recorrido de un garabato — ver la nota de `andar`.
  const HOLGURA = 0.9;
  // Y LA FRANJA DEL ACOMPAÑAMIENTO, que es lo que de verdad hace la densidad de
  // la referencia. Con sólo la holgura la cinta busca aire, y entonces las hebras
  // salen repartidas por la hoja con mucho suelo suelto entre ellas: se lee como
  // un esqueleto, no como un recinto. En la referencia las hebras van CERCA unas
  // de otras casi en todas partes, y lo que hay entre ellas es canal, no campo.
  //
  // Así que el peso premia caer a una distancia de entre uno y dos canales y
  // medio: ni encima (lo prohíbe la regla 3) ni lejos. Es la regla 3 leída por el
  // otro lado — no sólo «no te toques», también «no te vayas».
  const CERCA = [1.0, 2.5];                // en múltiplos de D
  const PESO_CERCA = 6;
  // Cuánto pesa un pliegue cuando la obra quiere plegarse. Alto para que se
  // pruebe primero, no infinito para que un pliegue imposible no mate la cinta.
  const PESO_PLIEGUE = 14;

  // ── Los tipos ───────────────────────────────────────────────────────────────
  // Declaran cuántas cintas y cuántos pliegues, y qué reparto de ojos se acepta;
  // luego se COMPRUEBA sobre el dibujo. Es el mecanismo de TRZS, EVOL y PTZD, y
  // está aquí por lo mismo: una etiqueta puesta antes de dibujar que no
  // corresponde a nada visible no es un rasgo.
  //   ojos  — ojos MEDIDOS que se aceptan (los de área ≥ OJO_MIN)
  //   disp  — dispersión mínima de tamaños: ojoMax / ojoMediano. Es la regla 6
  //           puesta en un número, y es lo que separa un plano de un laberinto.
  //   ocup  — fracción de pliego entintada
  // Las cuentas de cintas subieron mucho —de [1..4] a esto— y no es un ajuste
  // fino: es lo que la referencia tiene. Una hebra sola en el cuadro, por buen
  // recorrido que traiga, se lee como un glifo; lo que hace la obra es la
  // CONVIVENCIA de muchas hebras que se acompañan sin tocarse. Y cada hebra que
  // entra tiene menos sitio que la anterior, así que sale más corta y con sus dos
  // cabos: de ahí la media docena de cabos libres de la observación 6, que con
  // dos cintas no salía nunca.
  const TIPOS = {
    // El recorrido casi desnudo. Es el examen más duro de la familia: con pocas
    // hebras no hay nada que mirar salvo el camino.
    suelto:     { prob: 0.20, cintas: [2, 4], pliegues: [0, 2], ojos: [0, 4],
                  disp: 1.0, ocup: [0.08, 0.18] },
    // El de la referencia, y el centro de la familia.
    plegado:    { prob: 0.38, cintas: [5, 9], pliegues: [3, 7], ojos: [2, 10],
                  disp: 1.7, ocup: [0.12, 0.28] },
    // Muchas voces, cada una naciendo al lado de la anterior.
    acompanado: { prob: 0.28, cintas: [8, 13], pliegues: [2, 6], ojos: [4, 14],
                  disp: 1.7, ocup: [0.14, 0.30] },
    // Rara a propósito: el suelo queda reducido a una retícula de hilos y la
    // lectura se invierte. El mismo papel que `isla` en EVOL y `astillado` en
    // PTZD — el sitio donde la familia se pregunta quién manda.
    trenza:     { prob: 0.14, cintas: [14, 20], pliegues: [5, 10], ojos: [8, 24],
                  disp: 2.0, ocup: [0.21, 0.38] },
  };
  const TIPO_NAMES = Object.keys(TIPOS);

  // Candidatos por seed. El bucle corta en cuanto uno cumple, así que los 9 sólo
  // se pagan en las seeds difíciles. Es el patrón de EVOL y por la misma razón:
  // con seeds difíciles no hay ningún candidato bueno, y entonces manda el que
  // MENOS incumple —no el primero—, que es por lo que `falta` es un número.
  const REINTENTOS = 9;
  // Arranques que se prueban por cinta, y a partir de cuántos vértices se da uno
  // por bueno y se deja de probar. Ver la nota de `tramar`.
  const ARRANQUES = 4, VERT_BUENO = 14;
  const GRID = 170;                        // celdas en el lado corto, para medir
  // Un ojo de tres celdas es ruido de rasterización, no un hueco. El umbral va en
  // fracción de la hoja para que signifique lo mismo en cualquier formato y a
  // cualquier resolución del grid.
  const OJO_MIN = 0.0004;

  // ── Geometría ───────────────────────────────────────────────────────────────
  const hypot = Math.hypot, min = Math.min, max = Math.max, abs = Math.abs;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const RAD = Math.PI / 180;

  function pointSegDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    if (l2 < 1e-18) return hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function cruzan(ax, ay, bx, by, cx, cy, dx, dy) {
    const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx, dy);
    const d3 = o(cx, cy, dx, dy, ax, ay), d4 = o(cx, cy, dx, dy, bx, by);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  }

  // Distancia mínima entre dos segmentos. Si no se cruzan, el mínimo se alcanza
  // en un extremo — así que las cuatro distancias punto-segmento bastan.
  function segSegDist(ax, ay, bx, by, cx, cy, dx, dy) {
    if (cruzan(ax, ay, bx, by, cx, cy, dx, dy)) return 0;
    return min(pointSegDist(ax, ay, cx, cy, dx, dy), pointSegDist(bx, by, cx, cy, dx, dy),
               pointSegDist(cx, cy, ax, ay, bx, by), pointSegDist(dx, dy, ax, ay, bx, by));
  }

  // ¿El segmento toca el rectángulo? Contención de un extremo, o cruce con
  // cualquiera de los cuatro lados.
  function tocaRect(ax, ay, bx, by, r) {
    const dentro = (x, y) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
    if (dentro(ax, ay) || dentro(bx, by)) return true;
    return cruzan(ax, ay, bx, by, r.x0, r.y0, r.x1, r.y0)
        || cruzan(ax, ay, bx, by, r.x1, r.y0, r.x1, r.y1)
        || cruzan(ax, ay, bx, by, r.x1, r.y1, r.x0, r.y1)
        || cruzan(ax, ay, bx, by, r.x0, r.y1, r.x0, r.y0);
  }

  // ── La restricción dura (regla 3) ───────────────────────────────────────────
  // Un tramo candidato cabe si está a D o más de TODOS los tramos que no son su
  // vecino, sea de su cinta o de otra — el acompañamiento no distingue si la voz
  // es la misma. Sólo se excluye el tramo inmediatamente anterior de la propia
  // cinta, que comparte vértice con él y por tanto está a cero por construcción.
  //
  // La tolerancia es de coma flotante y nada más: el brazo del pliegue mide
  // exactamente D/sen φ, así que su par sale a D justo y sin ella lo rechazaría.
  const TOL = 1e-9;
  function cabe(segs, ax, ay, bx, by, cinta, idx, D, veto, mg, fw, fh, W) {
    // El BORDE de la cinta es lo que no puede tocar el marco ni la reserva, no su
    // eje: por eso las dos comprobaciones llevan media anchura de más.
    const h = W / 2;
    if (min(ax, bx) < mg + h || max(ax, bx) > fw - mg - h) return false;
    if (min(ay, by) < mg + h || max(ay, by) > fh - mg - h) return false;
    if (veto) {
      const r = { x0: veto.x0 - h, y0: veto.y0 - h, x1: veto.x1 + h, y1: veto.y1 + h };
      if (tocaRect(ax, ay, bx, by, r)) return false;
    }
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (s.cinta === cinta && s.idx === idx - 1) continue;
      if (segSegDist(ax, ay, bx, by, s.ax, s.ay, s.bx, s.by) < D - TOL) return false;
    }
    return true;
  }

  // La magnitud de un giro: tres modas. `pQ` es la del quiebro, que sube mucho
  // mientras la cinta va acompañando.
  function magGiro(rng, pQ) {
    if (rng.bool(pQ)) return rng.range(GIRO_QUIEBRO[0], GIRO_QUIEBRO[1]);
    return rng.bool(P_RECTO) ? rng.range(GIRO_RECTO[0], GIRO_RECTO[1])
                             : rng.range(GIRO_BIES[0], GIRO_BIES[1]);
  }

  // Dónde acaba un candidato, sin comprobar si cabe, y el punto medio de su
  // ÚLTIMO tramo — que es por donde va a correr la cinta, y por tanto donde hay
  // que preguntar si acompaña a algo. Preguntarlo sólo en el extremo se equivoca
  // en los tramos largos: un tramo puede acabar pegado a una hebra habiendo
  // cruzado media hoja de suelo vacío.
  function finalDe(c, x, y, dir) {
    if (c.tipo === 'giro') {
      const a = (dir + c.d) * RAD;
      const ex = x + Math.cos(a) * c.L, ey = y + Math.sin(a) * c.L;
      return { x: ex, y: ey, mx: (x + ex) / 2, my: (y + ey) / 2 };
    }
    const a1 = (dir + c.s * c.phi) * RAD, a2 = (dir + c.s * 180) * RAD;
    const qx = x + Math.cos(a1) * c.brazo, qy = y + Math.sin(a1) * c.brazo;
    const ex = qx + Math.cos(a2) * c.vuelta, ey = qy + Math.sin(a2) * c.vuelta;
    return { x: ex, y: ey, mx: (qx + ex) / 2, my: (qy + ey) / 2 };
  }

  // Cuánto aire hay en un punto: distancia al tramo más cercano, saturada en
  // `tope` — más allá de cuatro canales, más aire ya no es mejor aire, y sin
  // saturar la cinta se iría siempre al rincón más vacío de la hoja.
  function holgura(segs, x, y, cinta, idx, tope) {
    let d = tope;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (s.cinta === cinta && s.idx >= idx - 1) continue;
      const t = pointSegDist(x, y, s.ax, s.ay, s.bx, s.by);
      if (t < d) { d = t; if (d <= 0) break; }
    }
    return d;
  }

  // ── Andar una cinta ─────────────────────────────────────────────────────────
  // Crece vértice a vértice y NO retrocede: cada tramo que se acepta ya cumple la
  // regla 3 contra todo lo que había, así que nunca hay que deshacer nada. Cuando
  // ningún candidato cabe, la cinta se acaba — y ése es el cabo de la regla 4: no
  // se decide, es el sitio donde el material se quedó sin sitio.
  //
  // `orden` es la parte delicada. Los candidatos no se prueban en el orden en que
  // se generan (saldría siempre el mismo giro) ni del todo al azar (el recorrido
  // no iría a ninguna parte): se hace un BARAJADO PONDERADO —clave = tirada/peso,
  // menor primero— y se coge el primero que cabe. El peso lleva la deriva de la
  // observación 8, así que la cinta tiende a alejarse de la reserva sin que el
  // recorrido se vuelva un dibujo dirigido.
  function andar(rng, p0, dir0, nMax, ctx) {
    const { D, W, mg, fw, fh, veto, segs, cinta } = ctx;
    const pts = [{ x: p0.x, y: p0.y }];
    let x = p0.x, y = p0.y, dir = dir0;
    let escala = rng.range(LARGO[0], LARGO[1]), racha = rng.pickFrom(RACHA_L);
    let idx = 0, pliegues = 0, cadena = 0;
    // El acompañamiento en curso: mientras dura, la cinta quiebra en vez de girar,
    // así que se queda al lado de lo que acaba de dejar. Una cinta que NACE al
    // lado de otra empieza ya acompañando — es su razón de existir.
    let paralelo = ctx.paralelo0 || 0;
    // La ruta: hitos que se van dejando atrás. Cuando se agotan manda el último,
    // que es donde el recorrido se queda dando vueltas hasta que no cabe — y ahí
    // se acaba, que es la regla 4.
    const ruta = ctx.ruta;
    let wp = 0;

    for (let v = 0; v < nMax; v++) {
      if (racha-- <= 0) { escala = rng.range(LARGO[0], LARGO[1]); racha = rng.pickFrom(RACHA_L); }
      while (wp < ruta.length - 1 && hypot(ruta[wp].x - x, ruta[wp].y - y) < escala * 1.3) wp++;
      const cx = ruta[wp].x, cy = ruta[wp].y;

      // ¿Toca pliegue? Una cadena de pliegues se decide al entrar en ella y se
      // continúa con su propia probabilidad: así las tres vueltas en paralelo son
      // un suceso y no una racha que se alarga sin querer.
      const quiere = cadena > 0
        ? rng.bool(CADENA[min(cadena - 1, CADENA.length - 1)])
        : rng.bool(ctx.pPliegue);

      // Los candidatos son SIEMPRE los dos juegos, pliegues y giros, y no uno o
      // el otro. Con sólo los pliegues, un pliegue que no cabe acababa la cinta
      // —y un pliegue casi nunca cabe cuando la cinta va apretada, que es justo
      // cuando más falta hace seguir—. Lo que hace la voluntad de plegar es PESAR
      // más, no excluir: si cabe sale, y si no, la cinta gira y sigue viva.
      const cands = [];
      const signos = cadena > 0 ? [ctx.signo] : [1, -1];
      for (const s of signos) for (let i = 0; i < NPHI; i++) {
        const phi = rng.bool(P_RECTO) ? rng.range(PHI_RECTO[0], PHI_RECTO[1])
                                      : rng.range(PHI_BIES[0], PHI_BIES[1]);
        cands.push({ tipo: 'pliegue', s, phi, brazo: D / Math.sin(phi * RAD),
                     vuelta: ctx.largoPrev * rng.range(VUELTA[0], VUELTA[1]),
                     peso: quiere ? PESO_PLIEGUE : 0.04, k: 0 });
      }
      for (let i = 0; i < NGIRO; i++) {
        const d = (rng.bool(0.5) ? 1 : -1) * magGiro(rng, paralelo > 0 ? P_QUIEBRO_PAR : P_QUIEBRO);
        for (const alt of LARGO_ALT) {
          const L = clamp(escala * alt * rng.range(LARGO_JIT[0], LARGO_JIT[1]), D * 1.02, LARGO[1] * 1.4);
          cands.push({ tipo: 'giro', d, L, peso: alt === 1 ? 1 : 0.5, k: 0 });
        }
      }

      // Peso final: el del candidato por la deriva y por la HOLGURA del sitio
      // donde cae. La holgura es lo que convierte un garabato en un recorrido:
      // sin ella el paseo se mete en su propia zona densa y se ahoga —medido,
      // mediana de 14 vértices—, porque el sitio más cercano es siempre el que
      // ya está ocupado. Prefiriendo el aire, la cinta VIAJA, que es lo que hace
      // la referencia. Y no es un imán: es un peso, así que el recorrido sigue
      // pudiendo volver sobre sí mismo, que es de lo que va la obra.
      for (const c of cands) {
        const e = finalDe(c, x, y, dir);
        const dx = e.x - x, dy = e.y - y, m = hypot(dx, dy) || 1e-9;
        const hx = cx - x, hy = cy - y, hm = hypot(hx, hy) || 1e-9;
        const alineado = (dx * hx + dy * hy) / (m * hm);        // −1..1
        c.peso *= 1 + DERIVA * max(0, alineado);
        const tope = D * 5;
        const aire = min(holgura(segs, e.x, e.y, cinta, idx, tope),
                         holgura(segs, e.mx, e.my, cinta, idx, tope));
        const u = aire / D;
        c.peso *= 1 + (u >= CERCA[0] && u <= CERCA[1] ? PESO_CERCA : 0)
                    + HOLGURA * min(1, u / 5);
        c.k = rng.next() / max(c.peso, 1e-6);
      }
      cands.sort((a, b) => a.k - b.k);

      let puesto = null;
      for (let i = 0; i < cands.length; i++) {
        const c = cands[i];
        if (c.tipo === 'giro') {
          const a = (dir + c.d) * RAD;
          const nx = x + Math.cos(a) * c.L, ny = y + Math.sin(a) * c.L;
          if (!cabe(segs, x, y, nx, ny, cinta, idx, D, veto, mg, fw, fh, W)) continue;
          puesto = { pasos: [{ x: nx, y: ny }], dir: dir + c.d, largo: c.L };
        } else {
          // El pliegue son DOS tramos y los dos tienen que caber: el brazo y la
          // vuelta. Se comprueban en orden, y el segundo contra el primero ya
          // puesto — que es su vecino, así que se excluye solo.
          const a1 = (dir + c.s * c.phi) * RAD;
          const mx = x + Math.cos(a1) * c.brazo, my = y + Math.sin(a1) * c.brazo;
          if (!cabe(segs, x, y, mx, my, cinta, idx, D, veto, mg, fw, fh, W)) continue;
          const a2 = (dir + c.s * 180) * RAD;
          const nx = mx + Math.cos(a2) * c.vuelta, ny = my + Math.sin(a2) * c.vuelta;
          // El brazo entra en la lista ANTES de comprobar la vuelta, si no la
          // vuelta lo tomaría por un tramo lejano y su propio vecino la vetaría.
          segs.push({ ax: x, ay: y, bx: mx, by: my, cinta, idx });
          const ok = cabe(segs, mx, my, nx, ny, cinta, idx + 1, D, veto, mg, fw, fh, W);
          segs.pop();
          if (!ok) continue;
          puesto = { pasos: [{ x: mx, y: my }, { x: nx, y: ny }],
                     dir: dir + c.s * 180, largo: c.vuelta, pliegue: c.s };
        }
        break;
      }
      if (!puesto) break;            // no cabe: aquí se acaba la cinta (regla 4)

      for (const p of puesto.pasos) {
        segs.push({ ax: x, ay: y, bx: p.x, by: p.y, cinta, idx });
        pts.push({ x: p.x, y: p.y });
        x = p.x; y = p.y; idx++;
      }
      dir = puesto.dir;
      ctx.largoPrev = puesto.largo;
      if (puesto.pliegue != null) {
        pliegues++; cadena++; ctx.signo = puesto.pliegue;
        // Un pliegue ABRE un acompañamiento: de aquí a unos vértices la cinta va
        // al lado de su propia ida. Sin esto el pliegue es un gesto de un solo
        // tramo y el pasillo mide dos anchuras — medido, y no se lee.
        paralelo = rng.int(PARALELO[0], PARALELO[1]);
      } else { cadena = 0; if (paralelo > 0) paralelo--; }
    }
    return { pts, pliegues };
  }

  // Un punto de arranque sobre el campo, con dirección hacia dentro. El margen ya
  // está descontado, y la dirección va tirada continua por lo mismo que los
  // giros: cuatro direcciones de salida se notan en el grid.
  function arranque(rng, ctx) {
    const { mg, fw, fh, W } = ctx;
    const h = mg + W / 2 + 1e-4;
    return { x: rng.range(h, fw - h), y: rng.range(h, fh - h), dir: rng.range(0, 360) };
  }

  // ── La ruta ─────────────────────────────────────────────────────────────────
  // Una cuerda que atraviesa el campo, con los hitos desviados a un lado y a
  // otro. No es un dibujo: es por dónde pasa. Se corta contra el margen y se
  // aparta de la reserva, que si no la cinta tira contra un sitio donde no puede
  // entrar y se pasa la obra empujando la valla.
  function trazarRuta(rng, fw, fh, veto, mg, W) {
    const h = mg + W / 2 + 1e-4;
    const n = rng.int(HITOS[0], HITOS[1]);
    const a = rng.range(0, Math.PI * 2);
    const cx = fw / 2, cy = fh / 2, R = min(fw, fh) * 0.5;
    const ax = cx - Math.cos(a) * R, ay = cy - Math.sin(a) * R;
    const bx = cx + Math.cos(a) * R, by = cy + Math.sin(a) * R;
    const nx = -Math.sin(a), ny = Math.cos(a);
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const j = rng.range(-HITO_JIT, HITO_JIT) * min(fw, fh);
      let px = ax + (bx - ax) * t + nx * j, py = ay + (by - ay) * t + ny * j;
      // Fuera de la reserva: al hito se le da la vuelta por el lado más corto.
      if (veto && px >= veto.x0 && px <= veto.x1 && py >= veto.y0 && py <= veto.y1) {
        const dEste = abs(px - veto.x1), dOeste = abs(px - veto.x0);
        const dSur = abs(py - veto.y1), dNorte = abs(py - veto.y0);
        const m = min(dEste, dOeste, dSur, dNorte);
        if (m === dEste) px = veto.x1 + h; else if (m === dOeste) px = veto.x0 - h;
        else if (m === dSur) py = veto.y1 + h; else py = veto.y0 - h;
      }
      out.push({ x: clamp(px, h, fw - h), y: clamp(py, h, fh - h) });
    }
    return out;
  }

  // ── La segunda voz (regla 5 del README) ─────────────────────────────────────
  // Una cinta que NACE ACOMPAÑANDO: se pone a W+g de una huella que ya estaba y
  // sale en su misma dirección. Es la que produce los tramos cortos de la
  // referencia — los que no van a ninguna parte y están para doblar a otro.
  //
  // Nace acompañando, pero NO se le obliga a seguir acompañando: en cuanto anda,
  // manda la misma gramática que a las demás. Un paralelo forzado durante N
  // vértices sale mecánico, y además es exactamente el error que el intento
  // dentro de TRZS ya pagó (un acompañamiento declarado y no conseguido hay que
  // retirarlo, porque su excepción ciega al detector para nada).
  function arranqueAlLado(rng, ctx) {
    const { segs, D } = ctx;
    if (!segs.length) return null;
    for (let i = 0; i < 40; i++) {
      const s = segs[rng.int(0, segs.length - 1)];
      const dx = s.bx - s.ax, dy = s.by - s.ay, m = hypot(dx, dy);
      if (m < D * 1.6) continue;                  // en un tramo corto no cabe una voz
      const ux = dx / m, uy = dy / m;
      const lado = rng.bool(0.5) ? 1 : -1;
      const t = rng.range(0.12, 0.88);
      // El eje a D exactos: es el canal declarado, el mismo que deja el pliegue.
      const x = s.ax + dx * t - uy * lado * D;
      const y = s.ay + dy * t + ux * lado * D;
      const dir = Math.atan2(uy, ux) / RAD + (rng.bool(0.5) ? 0 : 180);
      return { x, y, dir, alLado: true };
    }
    return null;
  }

  // ── Medir ───────────────────────────────────────────────────────────────────
  // Tres cosas, y las tres sobre el campo normalizado: la ocupación, los ojos y
  // el acompañamiento.
  //
  // LOS OJOS, y aquí está el hallazgo de esta familia. Una cinta ABIERTA de
  // anchura constante no puede encerrar suelo: el complemento de un arco
  // engrosado es conexo, por mucho que se pliegue, y con varias cintas que no se
  // tocan sigue siéndolo. Así que en HRRS no hay ojos en el sentido de EVOL, y no
  // por falta de ganas — es un teorema. El ojo grande de la referencia no está
  // cerrado: está cerrado PARA LA CINTA. Se sale de él por el canal, y por el
  // canal no cabe la cinta.
  //
  // De ahí la definición, que no lleva ni un umbral inventado: UN OJO ES EL SUELO
  // DONDE LA CINTA YA NO CABE. Se calcula como alcance de un disco de radio W/2
  // —el material— desde el borde:
  //   1. `libre`: suelo a W/2 o más de la tinta (donde el centro del disco puede
  //      estar).
  //   2. inundar `libre` desde el borde del cuadro (el margen garantiza que el
  //      anillo del borde está libre, así que el agua siempre tiene por dónde
  //      entrar).
  //   3. dilatar lo inundado en W/2: hasta ahí llega el disco.
  //   4. lo que queda de suelo sin alcanzar, por componentes: los ojos.
  // Es la MISMA regla que acaba un cabo (regla 4: la cinta se para donde no cabe),
  // y por eso el ojo y el cabo son el mismo suceso visto por los dos lados.
  //
  // Las distancias van por transformada exacta (Felzenszwalb, 1D por filas y
  // columnas): un chamfer aproximado se equivoca un 2% y el umbral es justo W/2.
  function edt(bin, NX, NY, dentro) {
    // Distancia euclídea al conjunto {bin == dentro}, en CELDAS. Devuelve d².
    const INF = 1e20, f = new Float64Array(max(NX, NY));
    const d2 = new Float64Array(NX * NY);
    const v = new Int32Array(max(NX, NY) + 1), z = new Float64Array(max(NX, NY) + 2);
    // Por columnas primero.
    for (let x = 0; x < NX; x++) {
      for (let y = 0; y < NY; y++) f[y] = (bin[y * NX + x] === dentro) ? 0 : INF;
      dt1d(f, NY, v, z);
      for (let y = 0; y < NY; y++) d2[y * NX + x] = f[y];
    }
    for (let y = 0; y < NY; y++) {
      for (let x = 0; x < NX; x++) f[x] = d2[y * NX + x];
      dt1d(f, NX, v, z);
      for (let x = 0; x < NX; x++) d2[y * NX + x] = f[x];
    }
    return d2;
  }
  function dt1d(f, n, v, z) {
    let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    const src = f.slice(0, n);
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      f[q] = (q - v[k]) * (q - v[k]) + src[v[k]];
    }
  }

  function medir(cintas, W, g, fw, fh) {
    const paso = 1 / GRID;
    const q = E.nominalAspect(max(fw, fh), min(fw, fh));
    const NL = max(4, Math.round(q * GRID));
    const NX = fw >= fh ? NL : GRID, NY = fw >= fh ? GRID : NL;
    const total = NX * NY;
    const tinta = new Uint8Array(total);
    const h = W / 2;

    // Rasterizar la cinta: celda dentro si su centro está a ≤ W/2 del eje. Con
    // caja por tramo, que si no esto es NX·NY·tramos.
    for (const pts of cintas) {
      for (let i = 0; i < pts.length - 1; i++) {
        const ax = pts[i].x, ay = pts[i].y, bx = pts[i + 1].x, by = pts[i + 1].y;
        const x0 = max(0, Math.floor((min(ax, bx) - h) / paso));
        const x1 = min(NX - 1, Math.ceil((max(ax, bx) + h) / paso));
        const y0 = max(0, Math.floor((min(ay, by) - h) / paso));
        const y1 = min(NY - 1, Math.ceil((max(ay, by) + h) / paso));
        for (let gy = y0; gy <= y1; gy++) {
          for (let gx = x0; gx <= x1; gx++) {
            const c = gy * NX + gx;
            if (tinta[c]) continue;
            if (pointSegDist((gx + 0.5) * paso, (gy + 0.5) * paso, ax, ay, bx, by) <= h) tinta[c] = 1;
          }
        }
      }
    }
    let nTinta = 0;
    for (let i = 0; i < total; i++) if (tinta[i]) nTinta++;

    // 1. `libre`: el centro del disco cabe aquí.
    const rC = h / paso;                       // radio del material, en celdas
    const dTinta = edt(tinta, NX, NY, 1);      // d² a la tinta
    const libre = new Uint8Array(total);
    for (let i = 0; i < total; i++) if (!tinta[i] && dTinta[i] >= rC * rC) libre[i] = 1;

    // 2. inundar `libre` desde el borde.
    const agua = new Uint8Array(total), pila = [];
    for (let gx = 0; gx < NX; gx++) { pila.push(gx, (NY - 1) * NX + gx); }
    for (let gy = 0; gy < NY; gy++) { pila.push(gy * NX, gy * NX + NX - 1); }
    while (pila.length) {
      const k = pila.pop();
      if (agua[k] || !libre[k]) continue;
      agua[k] = 1;
      const gx = k % NX, gy = (k - gx) / NX;
      if (gx > 0) pila.push(k - 1);
      if (gx < NX - 1) pila.push(k + 1);
      if (gy > 0) pila.push(k - NX);
      if (gy < NY - 1) pila.push(k + NX);
    }

    // 3. dilatar en W/2: hasta ahí llega el disco.
    const dAgua = edt(agua, NX, NY, 1);
    // 4. suelo sin alcanzar, por componentes.
    const visto = new Uint8Array(total), ojos = [];
    for (let k0 = 0; k0 < total; k0++) {
      if (tinta[k0] || visto[k0] || dAgua[k0] <= rC * rC) continue;
      let area = 0;
      const p = [k0]; visto[k0] = 1;
      while (p.length) {
        const k = p.pop(); area++;
        const gx = k % NX, gy = (k - gx) / NX;
        const vec = [gx > 0 ? k - 1 : -1, gx < NX - 1 ? k + 1 : -1,
                     gy > 0 ? k - NX : -1, gy < NY - 1 ? k + NX : -1];
        for (const w of vec) {
          if (w < 0 || visto[w] || tinta[w] || dAgua[w] <= rC * rC) continue;
          visto[w] = 1; p.push(w);
        }
      }
      const frac = area / total;
      if (frac >= OJO_MIN) ojos.push(frac);
    }
    ojos.sort((a, b) => b - a);
    return { ojos, ocupacion: nTinta / total };
  }

  // ── El acompañamiento, medido sobre la geometría ────────────────────────────
  // Un pasillo es un par de tramos no contiguos que corren casi paralelos, a una
  // distancia de eje del orden del canal, y a lo largo de algo. Se mide exacto —
  // sin rejilla y sin umbral de rasterización — porque es el rasgo de la familia
  // y porque así el número significa lo mismo en pantalla y a 300 dpi.
  const PAR_ANG = 12;              // grados de tolerancia para llamarlo paralelo
  const PAR_D = 1.9;               // hasta cuántos canales de separación cuenta
  const PAR_L = 1.2;               // largo mínimo del pasillo, × anchura
  function pasillos(cintas, W, g) {
    const D = W + g, segs = [];
    cintas.forEach((pts, c) => {
      for (let i = 0; i < pts.length - 1; i++)
        segs.push({ ax: pts[i].x, ay: pts[i].y, bx: pts[i + 1].x, by: pts[i + 1].y, c, i });
    });
    const out = [];
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const a = segs[i], b = segs[j];
        if (a.c === b.c && abs(a.i - b.i) <= 1) continue;
        const ux = a.bx - a.ax, uy = a.by - a.ay, um = hypot(ux, uy) || 1e-9;
        const vx = b.bx - b.ax, vy = b.by - b.ay, vm = hypot(vx, vy) || 1e-9;
        const cosang = (ux * vx + uy * vy) / (um * vm);
        if (abs(cosang) < Math.cos(PAR_ANG * RAD)) continue;
        // Separación: la distancia del punto medio de b al eje de a, que con los
        // dos casi paralelos es la del canal.
        const sep = pointSegDist((b.ax + b.bx) / 2, (b.ay + b.by) / 2, a.ax, a.ay, a.bx, a.by);
        if (sep > D * PAR_D) continue;
        // Solape de la proyección de b sobre a: el largo del pasillo.
        const t = p => ((p.x - a.ax) * ux + (p.y - a.ay) * uy) / (um * um);
        const t0 = t({ x: b.ax, y: b.ay }), t1 = t({ x: b.bx, y: b.by });
        const lo = max(0, min(t0, t1)), hi = min(1, max(t0, t1));
        const L = (hi - lo) * um;
        if (L < W * PAR_L) continue;
        out.push({ L, sep });
      }
    }
    return out;
  }

  // ── Un candidato completo ───────────────────────────────────────────────────
  // OJO: fw y fh llegan NORMALIZADOS (lado corto = 1, largo = proporción
  // nominal), no en píxeles. Ver la nota de la cabecera.
  function tramar(rng, fw, fh, tipo, params) {
    const t = TIPOS[tipo];
    const S = min(fw, fh);
    const W = params.ancho ? S * W_MAX * params.ancho : S * rng.range(W_MIN, W_MAX);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam;
    const D = W + g;
    const mg = S * MARGEN;

    // La reserva, en una de las cuatro esquinas.
    const esq = rng.int(0, 3);                       // 0 NO, 1 NE, 2 SE, 3 SO
    const rw = fw * rng.range(RESERVA[0], RESERVA[1]);
    const rh = fh * rng.range(RESERVA[0], RESERVA[1]);
    const este = esq === 1 || esq === 2, sur = esq === 2 || esq === 3;
    const veto = params.reserva === 0 ? null : {
      x0: este ? fw - rw : 0, x1: este ? fw : rw,
      y0: sur ? fh - rh : 0,  y1: sur ? fh : rh,
    };
    const nC = params.cintas ? params.cintas : rng.int(t.cintas[0], t.cintas[1]);
    const nP = params.pliegues != null ? params.pliegues : rng.int(t.pliegues[0], t.pliegues[1]);

    const segs = [];
    const cintas = [];
    let pliegues = 0;
    for (let c = 0; c < nC; c++) {
      const ctx = {
        D, W, mg, fw, fh, veto, segs, cinta: c, tipo,
        ruta: trazarRuta(rng, fw, fh, veto, mg, W),
        largoPrev: rng.range(LARGO[0], LARGO[1]), signo: 1,
        // Los pliegues declarados se reparten entre las cintas, y la probabilidad
        // por vértice sale de ahí en vez de ser una constante: una cinta corta con
        // la misma p que una larga sale sin un solo pliegue.
        pPliegue: clamp(nP / max(nC * 10, 1), 0, 0.5),
      };
      // La primera cinta arranca donde sea; las siguientes prueban primero a nacer
      // acompañando, que es lo que hace la familia.
      // Se prueban varios arranques y se queda el más largo. Un arranque que cae
      // en un rincón ya cerrado da una cinta de dos tramos, y con muchas cintas
      // eso pasa a menudo: la obra salía con la masa en una diagonal y tres
      // cuartos de hoja muertos que no eran la reserva. Probar dónde entrar no es
      // corregir el recorrido —el recorrido no se toca—, es elegir la puerta.
      const limpiar = () => {
        for (let i = segs.length - 1; i >= 0; i--) if (segs[i].cinta === c) segs.splice(i, 1);
      };
      let mejor = null;
      for (let intento = 0; intento < ARRANQUES; intento++) {
        // `andar` deja sus tramos en `segs` a medida que crece, así que el intento
        // siguiente tiene que empezar con la pizarra limpia: si no, se esquivaría
        // a sí mismo — al recorrido que acabamos de descartar.
        limpiar();
        let ini = null;
        if (c > 0 && rng.bool(0.72)) ini = arranqueAlLado(rng, ctx);
        if (!ini) ini = arranque(rng, ctx);
        // Nacida al lado, nace acompañando: arranca con el paralelo abierto.
        ctx.paralelo0 = ini.alLado ? rng.int(PARALELO[0], PARALELO[1]) : 0;
        const r = andar(rng, ini, ini.dir, VERT_MAX, ctx);
        if (!mejor || r.pts.length > mejor.pts.length) mejor = r;
        if (mejor.pts.length >= VERT_BUENO) break;
      }
      // Una cinta de un solo tramo no es una cinta: es una raya. Se descarta, y
      // sus tramos con ella — si no, la raya vetaría el sitio para nada.
      limpiar();
      if (!mejor || mejor.pts.length < 3) continue;
      for (let i = 0; i < mejor.pts.length - 1; i++)
        segs.push({ ax: mejor.pts[i].x, ay: mejor.pts[i].y,
                    bx: mejor.pts[i + 1].x, by: mejor.pts[i + 1].y, cinta: c, idx: i });
      cintas.push(mejor.pts);
      pliegues += mejor.pliegues;
    }

    const med = cintas.length ? medir(cintas, W, g, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(cintas, W, g);
    let largoPas = 0;
    for (const p of pas) largoPas += p.L;
    // Vértices y cabos: dos cabos por cinta, siempre (regla 5).
    let vert = 0;
    for (const c of cintas) vert += c.length;
    return { cintas, W, g, D, veto, esq, pliegues, pasillos: pas.length, largoPas,
             cabos: cintas.length * 2, vert, gam,
             ojos: med.ojos, ocupacion: med.ocupacion };
  }

  // Cuánto se sale un candidato de lo que su tipo declara. Cero es cumplir.
  // No es un booleano porque con seeds difíciles ningún candidato cumple, y
  // entonces hay que quedarse con el que menos incumple — no con el primero.
  function falta(c, t) {
    const n = c.ojos.length;
    const fo = n < t.ojos[0] ? t.ojos[0] - n : n > t.ojos[1] ? n - t.ojos[1] : 0;
    const o = c.ocupacion;
    const fc = o < t.ocup[0] ? (t.ocup[0] - o) / t.ocup[0]
             : o > t.ocup[1] ? (o - t.ocup[1]) / t.ocup[1] : 0;
    // LA DISPERSIÓN es la regla 6 puesta en un número: ojos todos iguales es un
    // laberinto. Sólo se exige cuando hay al menos dos, que si no no hay reparto
    // del que hablar.
    let fd = 0;
    if (n >= 2) {
      const med = c.ojos[(n - 1) >> 1];
      const disp = med > 0 ? c.ojos[0] / med : 1;
      if (disp < t.disp) fd = t.disp - disp;
    }
    // Y una que no declara el tipo, la exige la familia: sin recorrido no hay
    // obra. Una pieza que se queda sin cinta —porque la reserva y la restricción
    // la ahogaron— no es una pieza callada, es una hoja en blanco.
    const fv = c.vert < 12 ? (12 - c.vert) * 0.25 : 0;
    return fo * 0.7 + fc * 2 + fd * 0.5 + fv;
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ tipo, cintas, pliegues, ancho,
  //         canal, reserva, bg, bgProbs, field, grainScale } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;
    // Dos colores y se renuncia al resto: una cinta de tres colores deja de ser
    // una cinta. La política es del motor —tercera familia que la pide, ver
    // ptzd/README.md— y las dos tiradas se hacen SIEMPRE, salga lo que salga, para
    // que el stream no dependa del reparto.
    const dd = E.inkDice(rng, P_INV);
    const rol = E.inkRoles(colors, dd);

    // El campo. Con 'square' la obra se compone cuadrada y se centra: el pliego y
    // el campo son dos decisiones.
    const S = min(W, H);
    const cuad = E.fieldMode(params) === 'square';
    const AW = cuad ? S : W, ox = (W - AW) / 2;
    const q = E.nominalAspect(max(AW, H), min(AW, H));
    const fw = AW >= H ? q : 1, fh = AW >= H ? 1 : q;

    const tipo = params.tipo || rng.weighted(TIPO_NAMES.map(n => ({ n, prob: TIPOS[n].prob }))).n;
    const t = TIPOS[tipo];
    let best = null, bestF = Infinity;
    for (let i = 0; i < REINTENTOS; i++) {
      const c = tramar(new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0), fw, fh, tipo, params);
      const f = falta(c, t);
      if (f < bestF) { bestF = f; best = c; }
      if (f === 0) break;
    }

    const bg = E.pickBg(seed, params, BG_GRADIENT);
    if (bg === 'gradient') {
      E.drawMeshGradient(ctx, W, H, colors, new E.Rng(seed ^ 0xDEADBEEF));
    } else {
      ctx.fillStyle = rol.suelo;
      ctx.fillRect(0, 0, W, H);
    }

    // ── El dibujo: UN SOLO stroke() (regla 4) ─────────────────────────────────
    // Aquí es donde la familia cobra lo que le costó la restricción. No hay
    // capas, ni halo, ni orden de pintado: nada se solapa, así que nada tiene que
    // ir antes que nada. Y por eso mismo tampoco hay COSTURA — dos figuras del
    // mismo color acabadas a ras no suman cobertura 1 y dejan una raya más clara;
    // con un solo trazado ese caso no existe.
    //
    // `butt` es la regla 5: el cabo es el corte de la gubia, no un remate.
    //
    // Y `bevel`, que NO es una preferencia de dibujo: es lo que hace que la
    // restricción dura sea SUFICIENTE. Con `miter`, el pico de un giro sale
    // W/2/sen(α) del vértice —0,707 W en un giro recto, más aún al bies— y la
    // regla 3 sólo garantiza W/2 + g = 0,67 W de aire alrededor de un vértice:
    // el pico de una esquina puede cruzar el canal y soldar la obra por donde
    // menos se mira. Con `bevel` toda la tinta cae DENTRO de W/2 del eje (el
    // bisel une dos puntos que están a W/2 del vértice, así que la cuerda
    // también), y entonces «los ejes a W+g» equivale exactamente a «las tintas a
    // g». La comprobación geométrica y la del píxel miden lo mismo porque el
    // bisel las hace medir lo mismo.
    //
    // Y de paso es lo que el filo hace: un bisel es una esquina CORTADA.
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(S, S);
    ctx.beginPath();
    for (const pts of best.cintas) {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = rol.tinta;
    ctx.lineWidth = best.W;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'bevel';
    ctx.stroke();
    ctx.restore();

    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    return { pal, rol, tipo, bg, falta: bestF,
             field: cuad ? 'square' : 'sheet',
             cintas: best.cintas.length, pliegues: best.pliegues,
             pasillos: best.pasillos, largoPas: best.largoPas / best.W,
             cabos: best.cabos, vert: best.vert,
             anchoRel: best.W / min(fw, fh), gam: best.gam,
             ojos: best.ojos, ocupacion: best.ocupacion,
             esq: best.esq,
             // La geometría sale para que los detectores midan lo EXACTO y no una
             // rasterización, y para que el harness pueda dibujar el recorrido en
             // crudo. Va en unidades del campo normalizado, con el mismo `scale`
             // que el dibujo: quien la use, la escala igual.
             geo: { cintas: best.cintas, W: best.W, g: best.g, D: best.D,
                    S, ox, fw, fh, veto: best.veto } };
  }

  const P_INV = 0.14;        // tinta clara sobre suelo oscuro
  const MITER = 2.61;        // 1/sen(22,5°): el giro más cerrado de la gramática

  // ── Traits ──────────────────────────────────────────────────────────────────
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);

    const n = res.ojos.length;
    const ojosLbl = n === 0 ? 'Abierto' : n === 1 ? 'Un ojo' : n + ' ojos';
    const ojosR = n === 0 ? 'uncommon' : n <= 4 ? 'common' : n <= 8 ? 'uncommon' : n <= 13 ? 'rare' : 'superrare';
    const areaOjos = res.ojos.reduce((a, b) => a + b, 0);
    // El reparto de tamaños, que es la regla 6: un plano tiene un ojo grande y
    // varios pequeños; un laberinto los tiene todos iguales.
    const disp = n >= 2 ? res.ojos[0] / res.ojos[(n - 1) >> 1] : 0;
    const dispLbl = n < 2 ? '—' : disp < 1.8 ? 'Laberinto' : disp < 4 ? 'Repartido' : 'Un ojo manda';
    const dispR = n < 2 ? 'common' : disp < 1.8 ? 'uncommon' : 'common';

    const pl = res.pliegues;
    const plLbl = pl === 0 ? 'Sin pliegue' : pl === 1 ? 'Un pliegue' : pl + ' pliegues';
    const plR = pl === 0 ? 'uncommon' : pl <= 4 ? 'common' : pl <= 7 ? 'uncommon' : 'rare';

    const o = res.ocupacion;
    const ocLbl = o < 0.09 ? 'Leve' : o < 0.18 ? 'Justa' : o < 0.28 ? 'Cargada' : 'Trenzada';
    const ocR = o < 0.06 ? 'uncommon' : o >= 0.28 ? 'rare' : 'common';

    const tipoR = res.tipo === 'trenza' ? 'rare' : 'common';
    const tintaLbl = res.rol.inv ? 'Invertida' : 'Directa';
    const tintaR = res.rol.inv ? 'uncommon' : 'common';
    const papelLbl = res.rol.inv ? 'Oscuro' : res.rol.papel === 'crudo' ? 'Crudo' : 'Blanco';

    const f = r => r === 'superrare' ? 0.18 : r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1;
    const s = prob * f(ojosR) * f(dispR) * f(plR) * f(ocR) * f(tipoR) * f(tintaR);
    const overall = s > 0.06 ? 'common' : s > 0.025 ? 'uncommon' : s > 0.008 ? 'rare' : s > 0.002 ? 'superrare' : 'legendary';

    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Type',    val: res.tipo, rarity: tipoR },
        { key: 'Route',   val: res.cintas + (res.cintas === 1 ? ' band · ' : ' bands · ') + res.vert + ' turns', rarity: 'common' },
        { key: 'Folds',   val: plLbl, rarity: plR },
        { key: 'Along',   val: res.pasillos + ' × ' + res.largoPas.toFixed(1) + 'W', rarity: 'common' },
        { key: 'Eyes',    val: ojosLbl + (n ? ' · ' + (areaOjos * 100).toFixed(1) + '%' : ''), rarity: ojosR },
        { key: 'Rhythm',  val: dispLbl, rarity: dispR },
        { key: 'Ink',     val: ocLbl + ' · ' + Math.round(o * 100) + '%', rarity: ocR },
        { key: 'Gouge',   val: (res.anchoRel * 100).toFixed(1) + '% · canal 1/' + Math.round(1 / res.gam), rarity: 'common' },
        { key: 'Paper',   val: papelLbl, rarity: res.rol.papel === 'crudo' ? 'uncommon' : 'common' },
        { key: 'Inks',    val: tintaLbl, rarity: tintaR },
      ],
      overall,
    };
  }

  // La obra es un recorrido por el marco, así que la proporción no es
  // indiferente: en cuadrado el recorrido se pliega sobre sí mismo y en apaisado
  // viaja. Las dos son la obra, y no una la otra girada. ('vertical' no existe en
  // el motor; se quitó a propósito.)
  const FORMATS = ['square', 'horizontal'];

  (global.HOKS = global.HOKS || {}).HRRS = { render, traits, TIPOS, BG_GRADIENT, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
