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
  // `p` NO es el peso del sorteo —eso lo pone cada tipo, abajo— sino la
  // frecuencia MEDIDA de cada gubia en la familia, que es lo que la rareza
  // necesita. Se vuelve a medir cada vez que se toquen los pesos de los tipos.
  const GUBIAS = [
    { key: 'fina',  w: 0.0130, p: 0.40 },
    { key: 'media', w: 0.0210, p: 0.47 },   // ~2%, que es lo que se mide en la referencia
    { key: 'ancha', w: 0.0330, p: 0.13 },
  ];

  // ── Los cuatro tipos ───────────────────────────────────────────────────────
  // `cortes` son los que se INTENTAN; los que salen se cuentan al final, que es
  // la regla de método de TRZS y EVOL: el tipo declara y el resultado se comprueba.
  /* LA GUBIA LA ELIGE EL TIPO, y no un sorteo aparte. Sorteándolas sueltas salía
   * `astillado` con gubia ancha, que es un encargo imposible: con el suelo de
   * carne puesto, una gubia de 3,3% no deja nueve placas en el mismo bloque, así
   * que el corte noveno no encontraba dónde ir y la obra salía con cinco placas
   * llamándose astillado. El 55% de las obras de gubia ancha no llegaba a los
   * cortes de su tipo, contra el 0% de las finas.
   *
   * No es un parche: es que el filo y el número de trozos son la misma decisión.
   * Con una gubia gorda se rompe en pocos trozos grandes; para astillar se coge
   * el filo fino. Escribirlo aquí es escribir lo que ya decidía la materia, y de
   * paso la etiqueta del tipo deja de mentir.
   *
   * Y el reparto va además hacia lo fino, que es lo que midió la 2ª vuelta del
   * entrenamiento (fina +7, ancha −9). */
  const TIPOS = [
    // Los pesos se mueven con el patrón medido en `entrenamiento/`. La 2ª vuelta
    // —ya con las guardas del hilo y del casi— dio la vuelta a la 1ª: pidió MÁS
    // estructura, no menos (arbol +5, astillado +3, hendido −9, y 5–7 placas por
    // encima de 2). Se lee como que el rechazo de la 1ª no era a los cortes sino
    // a los cortes MALOS: arreglados, el ojo quiere más. Se mueve en esa
    // dirección sin agotarla — dos vueltas afinan, diez producen una sola obra.
    { key: 'hendido',   p: 0.15, cortes: [1, 2], sajaduras: [0, 1], gubias: { fina: 0.18, media: 0.44, ancha: 0.38 } },
    { key: 'partido',   p: 0.34, cortes: [3, 4], sajaduras: [0, 1], gubias: { fina: 0.36, media: 0.52, ancha: 0.12 } },
    { key: 'arbol',     p: 0.33, cortes: [4, 6], sajaduras: [0, 1], gubias: { fina: 0.42, media: 0.50, ancha: 0.08 } },
    { key: 'astillado', p: 0.18, cortes: [7, 9], sajaduras: [0, 1], gubias: { fina: 0.66, media: 0.34, ancha: 0.00 } },
  ];

  /* Y el techo lo pone la gubia, no el tipo. Los pesos de arriba hacen que el
   * encargo imposible casi no salga; esto se ocupa del casi. Un bloque de este
   * tamaño no admite más de estos cortes con cada filo — con el suelo de carne
   * puesto, el corte de más no encuentra dónde ir.
   *
   * Se recorta lo PEDIDO y no lo obtenido, que no es lo mismo: así el tipo
   * declara lo que la materia admite y el resultado lo cumple, en vez de declarar
   * nueve, dar cinco y llamarse astillado igual. Es la regla de método de TRZS —
   * el tipo declara, el resultado se comprueba— aplicada donde se estaba
   * incumpliendo. */
  const TECHO = { fina: 9, media: 7, ancha: 3 };

  const BLOQUE_MIN = 0.58, BLOQUE_MAX = 0.70;   // lado del bloque / lado corto del campo

  // Un corte CRUZA. Va por avances largos en su rumbo y escalones cortos a un
  // lado — la escalera que se ve en la referencia—, no por rachas del mismo
  // tamaño en cualquier dirección: eso boxea sobre sí mismo y recorta rectángulos
  // (el riesgo «puzzle» del README, y lo primero que salió al mirar el grid).
  const AVANCE_MIN  = 0.20, AVANCE_MAX  = 0.44;   // tramo en el rumbo / lado del bloque
  const ESCALON_MIN = 0.045, ESCALON_MAX = 0.16;  // tramo al costado / lado del bloque
  const TRAMOS_CORTE = [5, 11], TRAMOS_SAJA = [3, 5];
  const P_DOBLE_ESCALON = 0.24;  // dos escalones seguidos: la placa deja de ser una caja
  /* EL BIES SE FUE. Hubo un escalón al bies (±45°) porque la referencia tiene
   * quiebros oblicuos, y era la única fuente de segmentos a 45° del sistema. El
   * problema es lo que hacía DESPUÉS: una arista al bies se convierte en el borde
   * de una placa, y el corte siguiente que entra por ella nace a escuadra —el
   * rumbo es par siempre— así que sale de ella a 45° y deja una cuña. El ángulo
   * en triángulo no lo dibujaba el bies: lo dibujaba el corte que venía detrás,
   * que es por lo que costó verlo. A escuadra siempre, y no hay de dónde salga. */
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

  // EL BLOQUE SIGUE EN PARTE AL PLIEGO. Midiéndolo sólo contra el lado corto, en
  // apaisado sale el mismo bloque con más aire a los lados: el papel cambia y la
  // masa no se entera. Siguiéndolo del todo sería la misma imagen estirada, que
  // es justo lo que esta casa no hace. Así que se sigue A MEDIAS —el ancho crece
  // una fracción de lo que crece el pliego— y como los cortes se siguen midiendo
  // contra el lado del bloque, en el ancho de más CABEN MÁS: la obra se recompone
  // en vez de deformarse, que es la regla de los formatos.
  const SEGUIR_MIN = 0.45, SEGUIR_MAX = 0.85;
  const AFILA      = 0.72;                       // dónde empieza a cerrarse la cuña de la sajadura

  // UNA ROTURA NO PARTE POR LA MITAD. Un corte que deja dos mitades iguales es
  // una división, no una fractura, y repetido da el suelo de baldosas. Se sortea
  // un reparto DESEADO —bien lejos del 1:1— y de varios cortes candidatos se
  // queda el que más se le acerca. De ahí la jerarquía de placas: una grande,
  // una mediana y un par pequeñas, que es lo que hace que haya dónde mirar.
  // Cuánto tiene que apartarse un corte de un borde que ya existe, en anchuras
  // de gubia, para que lo que quede en medio siga siendo materia y no un hilo.
  const HILO_MIN = 4.6;
  /* NINGUNA PLACA TIENE MENOS CARNE QUE ESTO. `GROSOR_MIN` va en anchuras de
   * gubia: la tira, el pincho o el hilo más fino que se admite. `GROSOR_VUELTA`
   * es cuántas veces más largo tiene que ser el camino por el contorno que la
   * recta para que eso cuente como defecto y no como esquina (ver `grosor`): con
   * 3,2, el ángulo más cerrado que pasa es de unos 36°. La esquina a escuadra
   * vale 1,41 y por eso no la roza nunca. */
  const GROSOR_VUELTA = 3.2, GROSOR_MIN = 4.6;
  // Una sajadura tiene que VIAJAR: cuerda/recorrido mínima, y largo mínimo.
  const RECTITUD_SAJA = 0.66, RECTITUD_CORTE = 0.42, SAJA_LARGO_MIN = 0.34;
  // Y tiene que viajar DENTRO DE SU PLACA, no sólo un trozo del bloque: por
  // debajo de esta fracción del diámetro de la placa es un arañazo en el canto.
  const SAJA_PIEZA_MIN = 0.42;
  // Cuántas obras llevan sajadura. Iba al 50% —`rng.int(0,1)`— y el
  // entrenamiento la puso en −18 en las dos vueltas: no es que sobre, es que
  // sobraba tanta. Con las exigencias de arriba, la que queda es la que viaja.
  const P_SAJADURA = 0.22;
  // Una sajadura APUNTA a otro borde y se queda corta: ni pega en él (sería un
  // corte que suelta) ni se muere en campo abierto (no diría nada). El aire que
  // le queda por delante, en anchuras de gubia.
  const SAJA_AIRE_MIN = 1.6, SAJA_AIRE_MAX = 5.5;

  const REPARTO_MIN = 0.10, REPARTO_MAX = 0.42;
  // Con la guarda del grosor, cuatro candidatos dejaban al 20% de las obras sin
  // llegar a los cortes de su tipo — y un `astillado` con tres placas no es un
  // astillado, es una etiqueta que miente. Se prueba más antes de rendirse.
  const CANDIDATOS  = 7;

  // El mínimo se mide contra la PIEZA QUE SE CORTA y no contra el bloque entero:
  // con la reserva apartada queda poca superficie, y un mínimo absoluto rechazaba
  // casi todas las particiones de dentro (27% de las obras no llegaba a los cortes
  // de su tipo). Queda un suelo absoluto, porque una placa por debajo de él no se
  // ve aunque su región sea pequeña.
  const PIEZA_MIN   = 0.16;                     // área mínima de placa / área de la pieza partida
  const PIEZA_SUELO = 0.016;                    // y nunca menos de esto del bloque
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
  function bloquePoly(rng, bx, by, bw, bh, pulso, morfa, S, escalones) {
    let c = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]]
      .map(p => add(p, [rng.range(-morfa, morfa) * bw, rng.range(-morfa, morfa) * bh]));

    /* EL BLOQUE NO NACE RECTANGULAR. Con la silueta encomendada sólo a «la que
     * falta», las obras de pocos cortes se quedaban en un rectángulo con una
     * muesca: el envoltorio cuadrado seguía mandando y la masa no tenía forma
     * propia. Así que al taco se le quita un escalón de una o dos esquinas antes
     * de empezar — la referencia tampoco cabe en un rectángulo, y no por lo que
     * le pasó al partirse sino por cómo estaba cortado el taco. */
    // Los escalones salen de las CUATRO esquinas del taco, y de cada una una vez.
    // Sorteando sobre la lista ya crecida, el segundo escalón podía morder un
    // vértice que había puesto el primero: dos mordiscos encadenados en el mismo
    // sitio dejan una pestaña estrecha, que es el defecto que las guardas
    // persiguen dentro y que aquí entraba antes de empezar.
    const muescas = [];
    while (muescas.length < Math.min(escalones, 4)) {
      const i = rng.int(0, 3);
      if (muescas.indexOf(i) < 0) muescas.push(i);
    }
    if (muescas.length) {
      const base = c; c = [];
      for (let i = 0; i < 4; i++) {
        const P = base[(i + 3) % 4], C = base[i], N = base[(i + 1) % 4];
        if (muescas.indexOf(i) < 0) { c.push(C); continue; }
        const a = lerp2(C, P, rng.range(0.20, 0.46)), b = lerp2(C, N, rng.range(0.20, 0.46));
        c.push(a, add(a, sub(b, C)), b);
      }
    }

    const wx = onda(rng, 12), wy = onda(rng, 12);
    const m = c.length;
    const per = c.reduce((s, p, i) => s + len(sub(c[(i + 1) % m], p)), 0) || 1;
    const out = [];
    let pos = 0;
    for (let i = 0; i < m; i++) {
      const a = c[i], b = c[(i + 1) % m], L = len(sub(b, a));
      const pasos = Math.max(2, Math.round(L / (PASO_CANTO * S)));
      for (let k = 0; k < pasos; k++) {
        const t = k / pasos, p = lerp2(a, b, t), s = (pos + L * t) / per;
        out.push([p[0] + pulso * CANTO_PULSO * wx(s), p[1] + pulso * CANTO_PULSO * wy(s)]);
      }
      pos += L;
    }
    return out;
  }

  // Distancia de un punto al segmento a→b.
  function distSeg(p, a, b) {
    const ab = sub(b, a), l2 = ab[0] * ab[0] + ab[1] * ab[1];
    if (l2 < 1e-18) return len(sub(p, a));
    let t = ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return len(sub(p, lerp2(a, b, t)));
  }

  /* EL HILO. Un corte que camina pegado a un borde que ya existe no separa una
   * placa: deja una TIRA DE MATERIA demasiado fina entre los dos blancos. El
   * problema no es que el hueco resultante sea pequeño —un hueco pequeño puede
   * ser bueno— sino que lo que queda de tinta ya no se lee como materia, se lee
   * como un pelo. Y dos blancos casi paralelos no dicen nada: no abren espacio,
   * sólo hacen ruido.
   *
   * Se mide la distancia del recorrido al borde de la pieza, saltándose las
   * aristas por las que el corte entra y sale —a ésas las toca por definición— y
   * los primeros y últimos pasos. */
  function hilo(poly, pts, evita) {
    let mn = Infinity;
    const m = poly.length, salto = 3;
    for (let k = salto; k < pts.length - salto; k++)
      for (let i = 0; i < m; i++) {
        if (evita(i)) continue;
        const d = distSeg(pts[k], poly[i], poly[(i + 1) % m]);
        if (d < mn) mn = d;
      }
    return mn;
  }
  /* LA RECTITUD. Cuerda entre recorrido. Un corte que entra y se vuelve sobre sí
   * mismo dibuja una V, y una V no abre nada: es una ida y una venida que dejan
   * la misma masa que había, más ruido. Una sajadura sólo abre el bloque si
   * VIAJA — si no, es un arañazo con forma de ángulo. */
  function rectitud(pts) {
    let arco = 0;
    for (let i = 0; i < pts.length - 1; i++) arco += len(sub(pts[i + 1], pts[i]));
    return arco > 1e-9 ? len(sub(pts[pts.length - 1], pts[0])) / arco : 0;
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
    let tocaAvance = true;
    for (let r = 0; r < runs; r++) {
      const avance = tocaAvance;
      tocaAvance = avance ? false : !rng.bool(P_DOBLE_ESCALON);
      let d, L;
      if (avance) {
        d = rumbo;
        L = rng.range(AVANCE_MIN, AVANCE_MAX) * S * k;
      } else {
        // El escalón sale a escuadra, y cambia de costado: eso último es lo que
        // impide que la escalera se convierta en una diagonal (la «cordillera»).
        d = (rumbo + lado) & 7;
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

  /* La sajadura no es una línea: es un hueco con forma. Trazarla como un trazo
   * con remate redondo la convierte en un palito con bola — una marca DIBUJADA
   * encima de la masa, que es justo lo que esta familia no hace: aquí el blanco
   * nunca se dibuja, se quita.
   *
   * Una gubia que entra por el canto muerde a plena anchura y, al levantarla,
   * el hueco se cierra en cuña. Así que la sajadura se construye como POLÍGONO:
   * anchura de gubia durante los primeros dos tercios —la regla 3 no se negocia,
   * el corte mide lo que mide la herramienta— y sólo el último tercio se afila
   * hasta morir. Lo que se estrecha no es el corte: es el gesto de sacarla.
   */
  function cinta(pts, w, rng) {
    const n = pts.length;
    if (n < 2) return null;
    const izq = [], der = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const d = norm(sub(b, a)), nr = [-d[1], d[0]];
      izq.push(add(pts[i], mul(nr,  w / 2)));
      der.push(add(pts[i], mul(nr, -w / 2)));
    }

    // EL TOPE. La anchura es constante hasta el final —la regla 3 no admite que
    // el corte se estreche—, así que el remate es un CORTE RECTO. Pero recto a
    // escuadra y a regla es un rectángulo acabado en tapa: se lee dibujado. Va
    // ladeado unos grados y con la cara temblando, como el final de un trazo de
    // lápiz o de una gubia que se levanta a mano.
    const P = pts[n - 1], d = norm(sub(P, pts[n - 2])), nr = [-d[1], d[0]];
    const a = rng.range(-0.34, 0.34);
    const ca = Math.cos(a), sa = Math.sin(a);
    const e = [nr[0] * ca - nr[1] * sa, nr[0] * sa + nr[1] * ca];
    const A = add(P, mul(e,  w / 2)), B = add(P, mul(e, -w / 2));
    izq[n - 1] = A; der[n - 1] = B;
    const cara = [];
    for (let k = 1; k <= 2; k++) {
      const t = k / 3;
      cara.push(add(lerp2(A, B, t), mul(d, rng.range(-0.22, 0.22) * w)));
    }
    return izq.concat(cara, der.reverse());
  }

  /* El área no basta para aceptar una placa. Una tira larga y estrecha tiene
   * área de sobra y se lee como un pelo, y tres seguidas son un flequillo — un
   * bloque roto no produce eso. Se mide la ESBELTEZ por el cociente
   * isoperimétrico (4πA/P²: 0,79 en un cuadrado, 0,14 en un rectángulo 1:20) y
   * se rechaza la partición que deja una tira. */
  function esbelta(poly, min) {
    let per = 0;
    for (let i = 0, m = poly.length; i < m; i++) per += len(sub(poly[(i + 1) % m], poly[i]));
    if (!(per > 0)) return false;
    return 4 * Math.PI * Math.abs(area(poly)) / (per * per) >= min;
  }
  const ESBELTEZ_MIN = 0.16;

  /* EL GROSOR: dos puntos del contorno están DEMASIADO CERCA PARA LO LEJOS QUE
   * ESTÁN. Dos cosas a la vez, y ninguna vale sola:
   *   · en línea recta hay menos que el suelo de carne — ahí no hay materia;
   *   · por el contorno hay varias veces más — luego no es una esquina, que es
   *     el sitio donde el contorno se acerca a sí mismo por buenas razones.
   *
   * Ese cociente entre el camino y la recta es lo único que separa una esquina
   * de un defecto, y lo hace sin escala: una esquina a escuadra vale 1,41 pase
   * lo que pase, una cuña de θ grados vale 1/sen(θ/2), y una tira o un pincho de
   * ancho w y largo ℓ valen 2ℓ/w. Así que un solo número —cuántas veces más
   * largo— dice a la vez cuál es el ángulo más cerrado y cuál la tira más fina
   * que se admiten, y lo dice igual para un pincho de dos milímetros que para
   * una tira que cruza el bloque.
   *
   * Hubo antes una ventana de arco en vez del cociente, y tenía un agujero por
   * el que se colaba justo lo que había que cazar: un pincho más corto que media
   * ventana tiene sus dos costados demasiado cerca EN EL CONTORNO, así que la
   * pareja nunca se comparaba. La ventana protegía las esquinas y de paso
   * escondía los pinchos, que son esquinas al revés.
   *
   * Y una sola medida acaba con cuatro defectos que el ojo había señalado por
   * separado, porque los cuatro son el mismo: el hilo demasiado fino entre dos
   * cortes, la tira sin sitio dentro, la miga suelta y el ángulo en triángulo —
   * una cuña es carne que se acaba. Lo que la esbeltez medía en promedio (una
   * tira larga sale mal de media) esto lo mide donde ocurre, que es lo que se ve. */
  function remuestrea(poly, paso) {
    const m = poly.length, out = [poly[0]];
    let resto = paso;
    for (let i = 0; i < m; i++) {
      const a = poly[i], b = poly[(i + 1) % m];
      let seg = len(sub(b, a));
      if (seg < 1e-12) continue;
      let t = 0;
      while (seg - t >= resto) { t += resto; out.push(lerp2(a, b, t / seg)); resto = paso; }
      resto -= seg - t;
    }
    return out.length >= 3 ? out : poly;
  }
  function grosor(poly, vuelta, paso) {
    const q = remuestrea(poly, paso), m = q.length;
    const acc = new Array(m + 1); acc[0] = 0;
    for (let i = 0; i < m; i++) acc[i + 1] = acc[i] + len(sub(q[(i + 1) % m], q[i]));
    const P = acc[m];
    let mn = Infinity;
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) {
      const e = len(sub(q[j], q[i]));
      if (e >= mn) continue;
      const d = acc[j] - acc[i], s = Math.min(d, P - d);
      if (s > vuelta * e) mn = e;
    }
    return mn;
  }

  /* LA VETA. Es la única familia donde la textura es CONTENIDO y no atmósfera:
   * no es el grano de película del motor —que simula la emulsión de una foto—
   * sino la fibra de la madera, que es de lo que está hecho el objeto que se
   * rompió. Y es lo que él llamaba «espacio lento»: la materia sentida como un
   * espacio que también se mueve, sólo que despacio, y la veta es lo único que
   * lo dice.
   *
   * Va como VECTOR y no por píxel: rayas casi horizontales recortadas contra las
   * placas, con su propio temblor. Así el coste a A1 sigue siendo el del grano y
   * no el de un filtro, y la fibra se imprime a la resolución del papel en vez de
   * ampliarse. Y por eso no toca `E.grain`, que es de seis familias: lo que aquí
   * es contenido, allí sería una avería.
   */
  const VETA_PASO = 3.2, VETA_ALFA = 0.115;
  function veta(ctx, ctxPts, rng, ink, ground, W, H, u, fuerza) {
    if (!(fuerza > 0)) return;
    ctx.save();
    ctx.beginPath();
    for (const poly of ctxPts) {
      poly.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.closePath();
    }
    ctx.clip();
    const paso = Math.max(1.4, VETA_PASO * u);
    const claro = E.lerpColor(ink, ground, 0.26), oscuro = E.lerpColor(ink, ground, -0.16);
    ctx.lineCap = 'butt';
    // El paso NO es constante: a intervalos iguales la veta bandea y se lee como
    // una trama de impresión, no como fibra. La madera va a rachas.
    for (let y = -paso; y < H + paso; y += paso * rng.range(0.55, 1.8)) {
      const largo = rng.range(0.25, 1.0) * W, x0 = rng.range(-0.15, 0.9) * W;
      ctx.strokeStyle = rng.bool(0.62) ? claro : oscuro;
      ctx.globalAlpha = VETA_ALFA * fuerza * rng.range(0.35, 1.6);
      ctx.lineWidth = paso * rng.range(0.30, 0.85);
      ctx.beginPath();
      // La fibra no es una regla: se desvía un pelo a lo largo del tablón.
      const n = 4, dy = paso * 0.55;
      for (let k = 0; k <= n; k++) {
        const x = x0 + largo * k / n, yy = y + rng.range(-dy, dy);
        if (k === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
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

  /* Las tintas de la obra. La primera es la del par elegido por distancia; las
   * demás se buscan lejos del SUELO —para que la figura siga leyéndose— y lejos
   * entre sí, pero no tanto como para que parezcan dos obras superpuestas: se
   * ordenan por distancia al suelo y se toman las mejores. Si la paleta no da
   * para tantas, se devuelven las que haya: la obra sale monócroma y no falla. */
  function paleta(rng, colors, col, n) {
    const out = [col.ink];
    if (n <= 1) return out;
    // La exigencia con el SUELO es mucho más dura que entre tintas: una placa del
    // color del papel no se lee como otra tinta, se lee como un AGUJERO, y con eso
    // se va figura/fondo y con ella la obra. Si la paleta no da una segunda tinta
    // que aguante, la pieza sale monócroma: es preferible a una placa fantasma.
    // TODAS LAS TINTAS CAEN DEL MISMO LADO DEL SUELO. Si la primera es más oscura
    // que el papel y la segunda más clara, esa segunda no se lee como otra tinta:
    // se lee como un AGUJERO en la masa, porque el ojo asigna el papel a lo claro.
    // Da igual que esté lejísimos del suelo en color — lo que decide es de qué
    // lado del valor cae. Con esto, todas las tintas son materia y el suelo sigue
    // siendo el vacío, que es la única lectura que esta familia admite.
    const lg = E.luma(col.ground), lado = Math.sign(E.luma(col.ink) - lg) || -1;
    const resto = colors
      .filter(c => c !== col.ground && c !== col.ink &&
                   Math.sign(E.luma(c) - lg) === lado &&
                   dist(c, col.ground) > 120 && Math.abs(E.luma(c) - lg) > 0.14)
      .sort((a, b) => dist(b, col.ground) - dist(a, col.ground));
    for (const c of resto) {
      if (out.length >= n) break;
      if (out.every(o => dist(o, c) > 70)) out.push(c);
    }
    return out;
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
                               : rng.weighted(GUBIAS.map(g => ({ ...g, prob: tipo.gubias[g.key] })));
    const ladeo = rng.range(-LADEO_MAX, LADEO_MAX);

    /* MONOCROMO O POLÍCROMO. La regla 1 dice una masa, una tinta, y sigue siendo
     * el caso de la mayoría — pero un taco se puede entintar en más de una
     * pasada, y él mismo lo hizo. Lo que NO puede pasar es que cada placa lleve
     * su color: eso es KRRTK, y convierte un bloque roto en un montaje.
     *
     * Así que el color no sigue a la placa: SIGUE A LA ROTURA. Cada tinta nueva
     * arranca en una de las primeras fracturas y la heredan todas las placas que
     * se soltaron de allí. El resultado es que el color cuenta el ORDEN en que el
     * bloque dejó de ser uno — que es exactamente lo que la regla 4 hace legible.
     * Dos placas del mismo color estuvieron juntas; dos de colores distintos se
     * separaron pronto. */
    const nTintas = params.tintas != null ? params.tintas
                  : rng.weighted([{ prob: 0.74, v: 1 }, { prob: 0.20, v: 2 }, { prob: 0.06, v: 3 }]).v;
    const tintas = paleta(rng, pal.colors, col, nTintas);
    const fuerzaVeta = params.veta != null ? params.veta : rng.range(0.55, 1.35);

    // El bloque. Nace exacto: toda la irregularidad viene después, y viene de las
    // reglas 6 y 7. No está centrado del todo — la reserva pesa a un lado, que es
    // lo que las hilarriak enseñan: un bloque plantado de cara, con su aire.
    const S = rng.range(BLOQUE_MIN, BLOQUE_MAX);
    // Tiende al cuadrado o al rectángulo, y no se queda en ninguno: la proporción
    // se abre de 0,82 a 1,18 y encima las esquinas se desvían. Un taco de madera
    // no está escuadrado, y un polígono exacto delata al vector.
    const seguir = params.seguir != null ? params.seguir : rng.range(SEGUIR_MIN, SEGUIR_MAX);
    const largo = Math.max(FW, FH) / Math.min(FW, FH);   // proporción NOMINAL del pliego
    const estira = 1 + (largo - 1) * seguir;
    let bw = S * rng.range(0.82, 1.18), bh = S * rng.range(0.82, 1.18);
    if (FW >= FH) bw *= estira; else bh *= estira;
    const pulso = rng.range(PULSO_MIN, PULSO_MAX) * S;
    const morfa = rng.range(0.012, MORFA_MAX);
    const holg = pulso * CANTO_PULSO + morfa * Math.max(bw, bh) + 0.012;
    const bx = Math.min(FW - bw - holg, Math.max(holg, (FW - bw) / 2 + rng.range(-0.045, 0.045) * FW));
    const by = Math.min(FH - bh - holg, Math.max(holg, (FH - bh) / 2 + rng.range(-0.035, 0.020) * FH));
    const escalones = params.escalones != null ? params.escalones
                    : rng.weighted([{ prob: 0.22, v: 0 }, { prob: 0.53, v: 1 }, { prob: 0.25, v: 2 }]).v;
    /* Y el taco pasa la misma aduana que las placas. Las obras de un solo corte
     * seguían saliendo con una pestaña o un pico, y no podían venir de ninguna
     * guarda: venían de antes de cortar. El suelo de carne no es una regla de la
     * partición, es una regla de la materia — así que también vale para el bloque
     * entero, que es la primera placa. */
    let bloque = bloquePoly(rng, bx, by, bw, bh, pulso, morfa, S, escalones);
    for (let t = 0; t < 10 &&
         grosor(bloque, GROSOR_VUELTA, gubia.w * S * 0.8) < GROSOR_MIN * gubia.w * S; t++)
      bloque = bloquePoly(rng, bx, by, bw, bh, pulso, morfa, S, escalones);
    const areaBloque = Math.abs(area(bloque));

    // El foco de la cadencia (regla 8): hacia dónde se agolpan los cortes.
    const foco = [bx + rng.range(0.22, 0.78) * bw, by + rng.range(0.22, 0.78) * bh];

    let piezas = [{ poly: bloque, kind: bloque.map(() => 0), drift: [0, 0], hondura: 0, retiro: 0, tinta: 0 }];
    const sajaduras = [];
    const cortes = [];

    const nCortes = params.cortes != null ? params.cortes
                  : Math.min(rng.int(tipo.cortes[0], tipo.cortes[1]), TECHO[gubia.key]);
    const nSaj    = params.sajaduras != null ? params.sajaduras
                  : (tipo.sajaduras[1] > 0 && rng.bool(P_SAJADURA) ? 1 : 0);
    const paso    = (params.deriva != null ? params.deriva : rng.range(DERIVA_MIN, DERIVA_MAX)) * gubia.w * S;

    // Cuándo se aparta la reserva: si es al primer corte se lleva media obra y
    // el resto sale picado; si tarda demasiado ya no queda masa grande que
    // apartar. Entre el segundo y el cuarto.
    const reservaTras = rng.int(1, 3);
    let reservaPuesta = false;
    let intentos = 0;
    while (cortes.length < nCortes && intentos < nCortes * 45) {
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

      // De varios cortes candidatos se queda el que más se acerca al reparto
      // deseado. No es afinar por afinar: un corte que deja dos mitades iguales
      // es una división, y repetido devuelve el suelo de baldosas que la reserva
      // ya vino a arreglar. Una rotura ARRANCA una placa.
      const quiere = rng.range(REPARTO_MIN, REPARTO_MAX);
      let mejor = null;
      for (let c = 0; c < CANDIDATOS; c++) {
        // Mientras haya canto se entra por el canto; después, por un corte
        // anterior: eso es una rama, y es lo que hace que el blanco sea un árbol.
        const ent = entrada(rng, pc, foco, cortes.length < 2 || rng.bool(0.45));
        const cand = walk(rng, pc, ent.e, ent.t, S, TRAMOS_CORTE, ladeo, 1, pulso);
        if (!cand.suelta) continue;
        const par = split(pc.poly, pc.kind, cand);
        const a0 = Math.abs(area(par[0].poly)), a1 = Math.abs(area(par[1].poly));
        if (par[0].poly.length < 3 || par[1].poly.length < 3) continue;
        if (Math.min(a0, a1) < Math.max(PIEZA_SUELO * areaBloque, PIEZA_MIN * (a0 + a1))) continue;
        if (!esbelta(par[0].poly, ESBELTEZ_MIN) || !esbelta(par[1].poly, ESBELTEZ_MIN)) continue;
        if (rectitud(cand.pts) < RECTITUD_CORTE) continue;
        // Y las dos placas que salen tienen que tener carne en todas partes. Es
        // la guarda que se come el triángulo, la tira y la miga de una vez.
        if (grosor(par[0].poly, GROSOR_VUELTA, gubia.w * S * 0.8) < GROSOR_MIN * gubia.w * S) continue;
        if (grosor(par[1].poly, GROSOR_VUELTA, gubia.w * S * 0.8) < GROSOR_MIN * gubia.w * S) continue;
        // Y no puede ir pegado a un borde que ya existe: entre los dos blancos
        // quedaría un hilo de tinta, y eso no es una placa.
        const mp = pc.poly.length, cerca = (a, b) => {
          const d = Math.abs(a - b) % mp; return Math.min(d, mp - d) <= 6;
        };
        if (hilo(pc.poly, cand.pts, i => cerca(i, cand.inEdge) || cerca(i, cand.outEdge))
            < HILO_MIN * gubia.w * S) continue;
        const falla = Math.abs(Math.min(a0, a1) / Math.max(a0, a1) - quiere);
        if (!mejor || falla < mejor.falla) mejor = { cut: cand, par, a0, a1, falla };
      }
      if (!mejor) continue;

      const cut = mejor.cut, [A, B] = mejor.par;
      const aA = mejor.a0, aB = mejor.a1;

      // Reglas 6 y 7: la pieza pequeña es la que se soltó. La madre se queda —es
      // la costura— y la hija se aparta, arrastrando a las suyas. Si se quitara
      // materia se quedaría en su sitio; como se mete espacio, tiene que moverse.
      const madre = aA >= aB ? A : B, hija = aA >= aB ? B : A;
      const dir = norm(sub(centroid(hija.poly), centroid(madre.poly)));
      const delta = add(mul(dir, paso), [0, GRAVEDAD * paso]);

      piezas.splice(idx, 1);
      // La tinta nueva arranca en una de las PRIMERAS fracturas y desde ahí se
      // hereda: así cada color es una rama entera del árbol, no una placa suelta.
      const nueva = cortes.length < tintas.length - 1;
      piezas.push({ poly: madre.poly, kind: madre.kind, drift: pc.drift, hondura: pc.hondura, retiro: pc.retiro, tinta: pc.tinta });
      piezas.push({ poly: hija.poly,  kind: hija.kind,  drift: add(pc.drift, delta), hondura: pc.hondura + 1,
                    // La retirada va después de las guardas, así que puede
                    // comerse la carne que acaban de exigir: se le pone un tope
                    // en función del suelo, y con gubia fina es el tope el que
                    // manda. Sin él, un canto recogido 3% del bloque sobre una
                    // placa de 3,8% deja justo la tira que el grosor rechazaba.
                    retiro: rng.bool(0.3) ? 0
                          : rng.range(0.008, Math.min(RETIRO_MAX, 0.35 * GROSOR_MIN * gubia.w)) * S,
                    tinta: nueva ? cortes.length + 1 : pc.tinta });
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
                 : (piezas.length >= 3 ? rng.weighted([{ prob: 0.26, v: 0 }, { prob: 0.42, v: 1 }, { prob: 0.32, v: 2 }]).v : 0);

    // Las cuatro esquinas del bloque de partida. Perder una placa de ENMEDIO de
    // un costado deja el envoltorio cuadrado intacto —sigue leyéndose el
    // rectángulo, sólo que mordido—; perder la de una esquina lo desmonta. Es la
    // diferencia entre un cuadrado con una muesca y una masa con forma propia, y
    // es lo que hace que la silueta deje de ser un polígono proporcional.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of bloque) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const esquinas = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const aEsquina = poly => {
      let d = Infinity;
      for (const e of esquinas) for (const v of poly) d = Math.min(d, len(sub(v, e)));
      return d;
    };

    let faltan = 0;
    for (let f = 0; f < nFalta; f++) {
      const cand = piezas
        .map((p, i) => ({ i, o: orilla(p.poly, p.kind), a: Math.abs(area(p.poly)), e: aEsquina(p.poly), p }))
        .filter(c => !c.p.reserva && c.o > 0.28 && c.a < areaBloque * 0.34);
      // Y no se pierde media obra: por encima de un tercio de las placas, lo que
      // queda deja de leerse como un bloque roto y pasa a ser dos objetos sueltos.
      if (!cand.length || piezas.length <= 2 || faltan >= Math.floor(piezas.length / 2)) break;
      // Pesa por estar fuera, por ser pequeña —la grande de en medio no se cae
      // sola— y sobre todo por tocar una esquina.
      let tot = 0;
      const w = cand.map(c => { const v = c.o / (0.05 + c.a / areaBloque) / (0.04 + c.e); tot += v; return v; });
      let x = rng.next() * tot, j = 0;
      while (j < cand.length - 1 && x > w[j]) { x -= w[j]; j++; }
      piezas.splice(cand[j].i, 1);
      faltan++;
    }

    // La retirada del canto se aplica ANTES de las sajaduras, no al dibujar: una
    // sajadura empieza en el borde de su pieza, y si la pieza se recoge después
    // el corte arranca fuera de ella, flotando en el suelo. `retirar` conserva el
    // número de vértices y su orden, así que las clases de arista siguen valiendo.
    // Y sólo se recoge el canto si la placa sigue teniendo carne después: la
    // retirada llega cuando las guardas ya han dicho que sí, así que es lo único
    // que puede desdecirlas. Si se la comería, la placa se queda con su canto.
    for (const pc of piezas) {
      const p2 = retirar(pc.poly, pc.kind, pc.retiro);
      if (grosor(p2, GROSOR_VUELTA, gubia.w * S * 0.8) >= GROSOR_MIN * gubia.w * S) pc.poly = p2;
    }

    // Las sajaduras: entran por el borde y se mueren dentro. No sueltan nada.
    let sInt = 0;
    while (sajaduras.length < nSaj && sInt < nSaj * 30) {
      sInt++;
      let tot = 0; const pesos = piezas.map(p => { const a = Math.abs(area(p.poly)); tot += a; return a; });
      let x = rng.next() * tot, idx = 0;
      while (idx < piezas.length - 1 && x > pesos[idx]) { x -= pesos[idx]; idx++; }
      const pc = piezas[idx];
      const ent = entrada(rng, pc, foco, rng.bool(0.6));
      const cut = walk(rng, pc, ent.e, ent.t, S, TRAMOS_SAJA, ladeo, rng.range(0.45, 1.0), pulso);
      if (cut.suelta) continue;
      /* QUÉ ABRE UNA SAJADURA. Ésta era la pregunta de verdad, y la respuesta que
       * estaba programada —«que muera dentro»— no valía: un corte que entra y se
       * para en campo abierto no genera ningún espacio, y se lee como una línea
       * dibujada encima de la masa.
       *
       * Una sajadura NO crea un espacio interior. Crea un CASI: apunta a otro
       * corte o a un canto y se queda corta, y lo que dice es que ahí hubo una
       * placa que estuvo a punto de soltarse y no se soltó. El vacío que produce
       * es virtual —el de la placa que no llegó a existir—, y por eso su medida
       * no es cuánto abre sino CUÁNTO LE FALTA.
       *
       * Ni pega en el borde (entonces sería un corte que suelta) ni se muere a
       * media hoja (entonces no señala nada). Entre gubia y media y cinco. */
      const fin = cut.pts[cut.pts.length - 1];
      const mf = pc.poly.length, cercaF = b => {
        const d = Math.abs(ent.e - b) % mf; return Math.min(d, mf - d) <= 6;
      };
      let aire = Infinity;
      for (let i = 0; i < mf; i++) {
        if (cercaF(i)) continue;   // el canto por el que entró no cuenta
        aire = Math.min(aire, distSeg(fin, pc.poly[i], pc.poly[(i + 1) % mf]));
      }
      if (!(aire >= gubia.w * S * SAJA_AIRE_MIN && aire <= gubia.w * S * SAJA_AIRE_MAX)) continue;

      /* Y aquí es donde la sajadura se gana el sitio o no lo tiene. El
       * entrenamiento la puso en negativo en TODAS las franjas de recuento de
       * placas —con 2 o 3 piezas, sin sajadura +32 y con dos −13—, así que no es
       * el arrastre de otro rasgo: la sajadura, tal como estaba, restaba
       * siempre. Y la razón es formal: entraba, no abría nada y volvía.
       *
       * Tres exigencias, y las tres dicen lo mismo de otra manera: una sajadura
       * es un corte que ABRE, no una línea que entra. */
      let arco = 0;
      for (let i = 0; i < cut.pts.length - 1; i++) arco += len(sub(cut.pts[i + 1], cut.pts[i]));
      if (arco < SAJA_LARGO_MIN * S) continue;                  // que recorra
      if (rectitud(cut.pts) < RECTITUD_SAJA) continue;          // que no sea una V
      /* Y que recorra SU PLACA. El largo contra el bloque no bastaba: en una
       * placa grande, un tercio del bloque es un trazo de verdad, y en una
       * pequeña es entrar y pararse. Lo que se rechazaba por corto y lo que se
       * colaba por largo eran la misma cosa medida contra la referencia
       * equivocada. Aquí la referencia es la placa que se abre. */
      let dx = Infinity, dy = Infinity, DX = -Infinity, DY = -Infinity;
      for (const p of pc.poly) { dx = Math.min(dx, p[0]); dy = Math.min(dy, p[1]); DX = Math.max(DX, p[0]); DY = Math.max(DY, p[1]); }
      if (arco < SAJA_PIEZA_MIN * Math.hypot(DX - dx, DY - dy)) continue;
      const ms = pc.poly.length, cercaS = (a, b) => {
        const d = Math.abs(a - b) % ms; return Math.min(d, ms - d) <= 6;
      };
      if (hilo(pc.poly, cut.pts, i => cercaS(i, ent.e)) < HILO_MIN * gubia.w * S) continue;

      // DOS SAJADURAS NO SE CRUZAN. Cruzándose forman un aspa o una cruz, y una
      // cruz es un SIGNO: deja de ser un hueco en la masa y pasa a ser algo
      // escrito encima. Es lo único de esta familia que puede leerse como
      // símbolo, y por eso es lo único que se prohíbe a mano.
      let choca = false;
      for (const s of sajaduras) {
        if (s.drift !== pc.drift) continue;
        for (let i = 0; i < cut.pts.length - 1 && !choca; i++)
          for (let j = 0; j < s.pts.length - 1 && !choca; j++)
            if (cross(cut.pts[i], cut.pts[i + 1], s.pts[j], s.pts[j + 1])) choca = true;
        if (choca) break;
      }
      if (choca) continue;

      sajaduras.push({ pts: cut.pts, poly: cinta(cut.pts, gubia.w * S, rng), drift: pc.drift });
    }

    // ── Dibujo ───────────────────────────────────────────────────────────────
    // El orden importa: se rellenan TODAS las placas, después entra la veta
    // recortada contra ellas, y sólo entonces se repasan los contornos. Así el
    // repaso se lleva la veta que hubiera caído dentro del corte y el hueco
    // queda limpio. Rellenar y repasar placa a placa daría el mismo resultado,
    // pero la veta tiene que ir en medio.
    ctx.fillStyle = col.ground;
    ctx.fillRect(0, 0, W, H);

    const gPx = gubia.w * S * SS;
    const caras = piezas.map(pc => pc.poly.map(p => toPx(add(p, pc.drift))));

    caras.forEach((q, i) => {
      ctx.beginPath();
      q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = tintas[piezas[i].tinta % tintas.length];
      ctx.fill();
    });

    veta(ctx, caras, new E.Rng(seed ^ 0x7E7A), col.ink, col.ground, W, H, u, fuerzaVeta);

    // Regla 3: la anchura sale de un lineWidth. Cada placa se come SU mitad del
    // corte repasando su propio contorno con el color del suelo, así que dos
    // vecinas dejan el corte entero — y el canto exterior también queda cortado,
    // que es lo que le pasa al canto del taco.
    ctx.lineJoin = 'round';
    ctx.lineWidth = gPx;
    ctx.strokeStyle = col.ground;
    for (const q of caras) {
      ctx.beginPath();
      q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.stroke();
    }

    // Las sajaduras se pintan encima: son el único blanco que no es una frontera.
    ctx.fillStyle = col.ground;
    for (const s of sajaduras) {
      if (!s.poly) continue;
      ctx.beginPath();
      s.poly.forEach((p, i) => {
        const q = toPx(add(p, s.drift));
        if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      });
      ctx.closePath();
      ctx.fill();
    }

    E.grain(ctx, W, H, tintas.concat([col.ground]), grainScale, u);

    // Lo medido, que es lo que manda sobre lo declarado.
    const mancha = piezas.reduce((s, p) => s + Math.abs(area(p.poly)), 0) / (FW * FH);
    return {
      pal, tipo: tipo.key, gubia: gubia.key, col, inks: tintas,
      piezas: piezas.length, sajaduras: sajaduras.length, cortes: cortes.length,
      faltan, escalones, tintas: tintas.length, seguir: +seguir.toFixed(2), pulso: +(pulso / S).toFixed(4), morfa: +morfa.toFixed(3),
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
   * hay que volver a medirlas cada vez que se toque la gramática. Las de ahora
   * están medidas sobre 2000 tiradas en `verificacion/`, que las imprime listas
   * para pegar — incluidos los umbrales de `rarComb`, que son percentiles. */
  const F_PIEZAS = { 2: .149, 3: .236, 4: .173, 5: .160, 6: .118, 7: .077, 8: .043, 9: .035, 10: .010 };
  // La sajadura pasó de una de cada cuatro a una de cada trece: se sortea menos
  // (22%) y de las sorteadas sólo pasa la que viaja de verdad por su placa. Ya no
  // es un rasgo frecuente sino un suceso, y la rareza lo dice.
  const F_SAJA   = { 0: .920, 1: .080, 2: .002 };
  const F_FALTA  = { 0: .343, 1: .479, 2: .178 };
  const F_ESCAL  = { 0: .218, 1: .547, 2: .235 };
  /* Ojo con esta tabla: NO es el sorteo (74/20/6). La regla 1 exige que todas las
   * tintas caigan del mismo lado del suelo, y dos de cada tres veces la paleta no
   * da una segunda que lo cumpla, así que la pieza sale monócroma. Lo policromo es
   * mucho más raro de lo que se pide — y esto sólo se vio al dispersar las seeds:
   * con seeds seguidas salía 82/16/2, porque se medían tres paletas. */
  const F_TINTA  = { 1: .902, 2: .083, 3: .015 };

  function rar(p) { return p > 0.06 ? 'common' : p > 0.018 ? 'uncommon' : p > 0.005 ? 'rare' : p > 0.0012 ? 'superrare' : 'legendary'; }

  // El producto de seis probabilidades es siempre un número diminuto, así que
  // como valor absoluto no dice nada: cualquier umbral fijo mete al 100% de las
  // obras en el mismo cajón. Lo que se compara es contra la obra MÁS PROBABLE de
  // la familia — cuánto se aparta ésta de la que más sale. Así la escala es
  // legible (1 = la más corriente posible) y no depende de cuántos rasgos haya.
  const P_MAX = { tipo: 0.34, gubia: 0.47, pz: 0.236, sj: 0.920, papel: 0.685, pal: 0.12, fl: 0.479, es: 0.547, tn: 0.902 };
  // Los cortes NO salen de la intuición: se midió la distribución real de `r`
  // sobre 500 tiradas y se pusieron en los percentiles que la casa reparte
  // (≈40/35/15/7/3). La paleta va aparte en el producto y sólo empuja hacia más
  // raro, así que el reparto medido queda algo por debajo de esos números.
  function rarComb(r) { return r > 0.0747 ? 'common' : r > 0.0209 ? 'uncommon' : r > 0.0069 ? 'rare' : r > 0.0028 ? 'superrare' : 'legendary'; }

  function traits(res) {
    const pTipo  = (TIPOS.find(t => t.key === res.tipo)  || { p: 0.25 }).p;
    const pGubia = (GUBIAS.find(g => g.key === res.gubia) || { p: 0.33 }).p;
    const pPz    = F_PIEZAS[res.piezas] || 0.01;
    const pSj    = F_SAJA[res.sajaduras] || 0.02;
    const pPapel = res.crudo ? 0.32 : 0.68;
    const pPal   = res.pal.prob || 0.05;
    const pFl    = F_FALTA[res.faltan] || 0.02;
    const pEs    = F_ESCAL[res.escalones] || 0.02;
    const pTn    = F_TINTA[res.tintas] || 0.02;

    const list = [
      { key: 'Palette',  val: res.pal.name, colors: res.pal.colors, rarity: E.palRarity(pPal) },
      { key: 'Tipo',     val: res.tipo,  rarity: rar(pTipo) },
      { key: 'Gubia',    val: res.gubia, rarity: rar(pGubia) },
      { key: 'Piezas',   val: String(res.piezas), rarity: rar(pPz) },
      { key: 'Sajadura', val: res.sajaduras ? String(res.sajaduras) : '—', rarity: rar(pSj) },
      { key: 'Faltan',   val: res.faltan ? String(res.faltan) : '—', rarity: rar(pFl) },
      { key: 'Escalones', val: String(res.escalones), rarity: rar(pEs) },
      { key: 'Tintas',   val: String(res.tintas), colors: res.inks, rarity: rar(pTn) },
      { key: 'Hondura',  val: String(res.hondura), rarity: 'common' },
      { key: 'Mancha',   val: (res.mancha * 100).toFixed(1) + '%', rarity: 'common' },
      { key: 'Papel',    val: res.crudo ? 'crudo' : 'blanco', rarity: rar(pPapel) },
    ];
    const r = Math.min(1, pTipo / P_MAX.tipo) * Math.min(1, pGubia / P_MAX.gubia) *
              Math.min(1, pPz / P_MAX.pz) * Math.min(1, pSj / P_MAX.sj) *
              Math.min(1, pPapel / P_MAX.papel) * Math.min(1, pPal / P_MAX.pal) *
              Math.min(1, pFl / P_MAX.fl) * Math.min(1, pEs / P_MAX.es) *
              Math.min(1, pTn / P_MAX.tn);
    // `r` sale fuera a propósito: los umbrales de `rarComb` son percentiles de
    // esta misma cifra, y sin ella la recalibración que el comentario de arriba
    // exige no se puede hacer desde fuera. Se mide en `verificacion/`.
    return { list, overall: rarComb(r), r };
  }

  (global.HOKS = global.HOKS || {}).PTZD = { render, traits, BG_GRADIENT, TIPOS, GUBIAS };
})(typeof window !== 'undefined' ? window : globalThis);
