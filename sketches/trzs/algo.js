/* hoks · TRZS — trazos.
 *
 * Una cinta continua recorre el marco varias veces; al volver a entrar se cruza
 * con lo que ya dejó escrito. La profundidad NO es el orden de dibujo: se decide
 * cruce a cruce, alternando encima y debajo como un diagrama de nudo, y el
 * dibujo se parte en secciones para que ese orden se pueda pintar en plano.
 *
 * Graduada desde el sketch de p5 (sketches/iterations2/). El porte quita p5
 * entero: aritmética a pelo, HOKS.Rng en vez de random(), y ninguna medida en
 * píxeles absolutos — todo sale de W, H o min(W,H), y las pocas constantes en px
 * se escalan por E.unit(W, H, REF). Así la misma seed da la misma composición en
 * cuadrado, vertical y horizontal, y la de pantalla es la que sale a 300 dpi.
 *
 * Contrato (ver sketches/README.md):
 *   HOKS.TRZS.render(ctx, W, H, seed, opts) -> datos para los traits
 *   HOKS.TRZS.traits(res) -> { list, overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 900;          // lado corto de referencia: calibra grano y px
  const BG_GRADIENT = 22;   // % de fondo en degradado cuando va en 'auto'
  // Cada cuánto la esquina sale curva cuando nadie la fija. Una de cada
  // cuatro: la cinta doblada en ángulo vivo es la referencia de la que salió
  // la obra, y la curva es la segunda lectura de la misma regla, no un empate.
  const CURVA_PROB = 0.25;
  // El tope del temblor. Como sólo adelgaza, no hay riesgo geométrico ninguno:
  // el tope es de lectura. Por encima de la mitad del ancho, los adelgazamientos
  // estrangulan la cinta y lo que se lee ya no es un filo cortado a mano sino
  // una cinta rota.
  const TEMBLOR_MAX = 0.5;
  // Cada cuánto el remate va en inglete cuando la esquina es viva. El remate a
  // escuadra es el corte de sierra y el inglete es el corte a 45º: los dos son
  // de la misma pletina, así que reparten casi a medias.
  const INGLETE_PROB = 0.45;
  // Por debajo de esta distancia de color, una cinta y el suelo no se
  // distinguen y el halo de esa cinta deja de ser invisible sobre el suelo: se
  // pinta en un tono corrido para que la incisión la separe también del fondo.
  // 0,12 es holgado a propósito — el criterio de la segunda tinta ya exige
  // 0,34 contra el fondo, así que esto sólo salta en lo que se le escapa.
  const HALO_MIN_DIST = 0.12;
  // EL TRAZO FANTASMA. Una cinta del color exacto del suelo: no se ve como
  // cinta, se ve como el corte que la separa del suelo. Antes el reparto de
  // roles lo evitaba por contraste —y con razón, mientras el remate lo
  // reventaba— pero resuelto es de lo mejor que da la familia, así que se
  // busca a propósito. Improbable: es lo que lo hace valioso.
  const FANTASMA_PROB = 0.035;

  // ── Aritmética ────────────────────────────────────────────────────────────
  // Los nombres cortos son los de p5 a propósito: el algoritmo viene de ahí y
  // conservarlos deja el porte comparable línea a línea con el original.
  const { min, max, abs, floor, ceil, round, pow, sqrt, sin, cos, tan, atan2, PI } = Math;
  const TWO_PI = PI * 2;
  const constrain = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  const radians = (d) => d * PI / 180;
  const degrees = (r) => r * 180 / PI;

  // ── Vectores ──────────────────────────────────────────────────────────────
  // Clase propia en vez de objetos planos por dos razones: los métodos de
  // instancia del original (.copy, .add, .normalize…) siguen valiendo sin
  // tocarlos, y una clase magra no paga la asignación del array 'arguments'
  // que hacía p5.Vector — medido en su día, eso dominaba selfAvoid.
  class Vec {
    constructor(x, y) { this.x = x; this.y = y; }
    copy()       { return new Vec(this.x, this.y); }
    add(v)       { this.x += v.x; this.y += v.y; return this; }
    sub(v)       { this.x -= v.x; this.y -= v.y; return this; }
    mult(k)      { this.x *= k;   this.y *= k;   return this; }
    mag()        { return Math.hypot(this.x, this.y); }
    magSq()      { return this.x * this.x + this.y * this.y; }
    dot(v)       { return this.x * v.x + this.y * v.y; }
    heading()    { return atan2(this.y, this.x); }
    // p5 deja el vector intacto si es nulo; el algoritmo cuenta con eso.
    normalize()  { const m = this.mag(); if (m !== 0) { this.x /= m; this.y /= m; } return this; }
    lerp(v, t)   { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }
    // Fiel al p5 vendorizado, contrastado contra su fuente:
    //   atan2(|cross_z|, dot) · sign(cross_z || 1)  ≡  atan2(cross_z, dot)
    // con NaN si alguno de los dos es nulo. De aquí sale el ángulo de cruce y
    // con él la huella, así que la equivalencia no es un detalle.
    angleBetween(v) {
      if (this.magSq() * v.magSq() === 0) return NaN;
      return atan2(this.x * v.y - this.y * v.x, this.dot(v));
    }
  }
  const V = (x, y) => new Vec(x, y);
  const PV = {
    sub:  (a, b) => new Vec(a.x - b.x, a.y - b.y),
    mult: (a, k) => new Vec(a.x * k, a.y * k),
    dist: (a, b) => Math.hypot(b.x - a.x, b.y - a.y),
    lerp: (a, b, t) => new Vec(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t),
    dot:  (a, b) => a.x * b.x + a.y * b.y,
  };

  // ── Azar ──────────────────────────────────────────────────────────────────
  // El algoritmo resiembra varias veces (cada reintento de tejido, los discos,
  // el degradado), así que el RNG es de módulo y reseed() lo repone. El dibujo
  // es síncrono: no hay dos renders a la vez.
  let rng = new E.Rng(0);
  // La semilla de la obra, aparte del RNG: la necesitan los azares que van por
  // su cuenta (el degradado, la esquina, el temblor) para no correr el stream.
  let _semilla = 0;
  function reseed(s) { _semilla = s >>> 0; rng = new E.Rng(s >>> 0); }
  // ============================================================
  // ITERATIONS 2 — FASE 2
  // Núcleo generativo. Determinista: seed -> imagen.
  // ============================================================

  const BG  = "#24358F";
  const FG  = "#32C3CB";
  const FG2 = "#7FE3C6";   // extremo del gradiente dentro de la cinta
  const DOT = "#F2EFE6";   // contrapunto: plano, neutro, ajeno a la cinta

  const PALETA_BASE = [BG, FG, FG2, DOT];


  // ------------------------------------------------------------
  // ROLES DE COLOR
  // Las paletas de hoks no declaran fondo ni tinta: son listas planas.
  // El reparto se decide por luminancia — fondo en un extremo, cinta
  // con el mayor contraste contra él, disco con el contraste que quede.
  // ------------------------------------------------------------
  // Distancia entre dos colores, 0 a 1. Suma de diferencias por canal: no
  // es perceptual, pero distingue el tono, que es justo lo que la
  // luminancia no hace.
  function dcolor(a, b) {
    const p = a.replace('#',''), q = b.replace('#','');
    let d = 0;
    for (let i = 0; i < 6; i += 2)
      d += abs(parseInt(p.substr(i,2),16) - parseInt(q.substr(i,2),16));
    return d / 765;
  }

  function lum(hex) {
    const c = hex.replace('#', '');
    const n = c.length === 3 ? c.split('').map(x => parseInt(x + x, 16)) : [0,2,4].map(i => parseInt(c.substr(i,2),16));
    const [r, g, b] = n.map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : pow((v+0.055)/1.055, 2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }

  function mixHex(a, b, t) {
    const pa = [1,3,5].map(i => parseInt(a.replace('#','').substr(i-1,2),16));
    const pb = [1,3,5].map(i => parseInt(b.replace('#','').substr(i-1,2),16));
    return '#' + pa.map((v,i) => floor(v + (pb[i]-v)*t).toString(16).padStart(2,'0')).join('');
  }

  // Elección ponderada entre las paletas ACTIVAS, con el RNG sembrado: la
  // paleta forma parte de la obra, así que tiene que salir del seed y no
  // del momento en que se pulsa el botón.
  // Devuelve la paleta ENTERA, no sólo los colores: el nombre es un rasgo
  // de la obra y el triaje lo necesita para poder decir "descartas las
  // Mondrian". Perdiéndolo aquí, ese patrón no se puede ni buscar.

  function pickRoles(colors) {
    const cols = colors.slice().sort((a, b) => lum(a) - lum(b));
    if (cols.length < 2) return { bg: cols[0] || BG, fg: FG, fg2: FG2, dot: DOT };

    // fondo: uno de los dos extremos. El oscuro pesa más — es la
    // dirección en la que esta obra respira mejor.
    const oscuro = rng.next() < 0.68;
    const bg = oscuro ? cols[0] : cols[cols.length - 1];
    const resto = cols.filter(c => c !== bg);

    const porContraste = resto.slice().sort((a, b) => abs(lum(b) - lum(bg)) - abs(lum(a) - lum(bg)));
    const fg = porContraste[0];

    // el disco quiere separarse del fondo Y de la cinta
    const dot = porContraste.length > 1
      ? porContraste.slice(1).sort((a, b) =>
          (abs(lum(b)-lum(bg)) + abs(lum(b)-lum(fg))) - (abs(lum(a)-lum(bg)) + abs(lum(a)-lum(fg))))[0]
      : mixHex(fg, oscuro ? '#ffffff' : '#000000', 0.55);

    // SEGUNDA CINTA. Antes esto era el extremo de un degradado y valía con
    // que fuera parecido; ahora es una cinta entera y tiene que sostenerse
    // sola: contraste suficiente contra el fondo Y diferencia suficiente
    // con la primera. Un segundo color que se parece a la primera cinta no
    // se lee como otra cinta, se lee como un error de impresión.
    // Se elige por DISTANCIA DE COLOR, no por luminancia: dos turquesas
    // pueden tener luminancias distintas y seguir siendo el mismo color a
    // la vista. Con el criterio de luminancia salían cintas turquesa sobre
    // fondo turquesa y dos naranjas casi iguales.
    const otros = porContraste.filter(c => c !== fg);
    const fg2 = otros.find(c => dcolor(c, bg) > 0.34 && dcolor(c, fg) > 0.28)
             || otros.find(c => dcolor(c, bg) > 0.28 && dcolor(c, fg) > 0.20)
             // Paleta de dos colores: no hay segunda tinta que elegir. Se
             // fabrica a MEDIO CAMINO DEL FONDO, no hacia el blanco o el
             // negro: mezclando hacia el extremo, una cinta crema sobre
             // negro daba otra crema y las dos se leían como una sola.
             // Hacia el fondo cambia de valor lo suficiente y conserva
             // contraste de sobra. Sale una cinta dominante y otra recogida.
             || mixHex(fg, bg, 0.38);

    // TERCERA CINTA, cuando la paleta la tiene. Mismo criterio que la segunda
    // —distancia de color, no luminancia— y encima tiene que separarse de las
    // DOS anteriores. Si no hay ninguna que cumpla, no se inventa: se devuelve
    // null y las cintas alternan entre dos tintas, que es lo que hacían antes.
    // Una tercera tinta sacada a la fuerza sale pegada a otra y se lee como un
    // error de impresión, que es justo lo que el criterio de la segunda ya
    // aprendió a evitar.
    const fg3 = otros.filter(c => c !== fg2)
                     .find(c => dcolor(c, bg) > 0.34 && dcolor(c, fg) > 0.28 && dcolor(c, fg2) > 0.28)
             || null;

    // Los discos NO comparten un solo color: son el contrapunto, y en
    // una paleta como Mondrian el negro sobre crema casi no se ve. Se
    // quedan con todo lo que no es fondo ni cinta, por contraste.
    let dots = porContraste.filter(c => c !== fg);
    if (!dots.length) dots = [mixHex(fg, oscuro ? '#ffffff' : '#000000', 0.55)];

    return { bg, fg, fg2, fg3, dot, dots };
  }

  // Tres grosores fijos en vez de un slider continuo: el estándar
  // calibrado a las referencias, uno fino y uno gordo.
  const ANCHOS = { fino: 0.42, estandar: 0.64, gordo: 0.88 };

  const DEF = {
    vertexMin: 9,
    vertexMax: 15,

    vueltasMin: 2,       // el retejido puede bajar una vuelta si el nudo no cabe       // nº de pasadas del esqueleto sobre el marco
    vueltasMax: 3,       // más pasadas = más cruces = más trama
    vueltaGiro: 0.62,    // rotación entre pasadas, × TWO_PI
    vueltaEscala: 0.86,

    // La anchura NO es un valor absoluto: es una proporción de la
    // mediana de segmento. Así el material se mantiene coherente
    // aunque la familia tenga otra escala interna.
    trazo:        "estandar",  // fino | estandar | gordo
    widthOfSeg:   null,        // si se fija, manda sobre trazo
    widthMin:     0.022,
    cabo:         0.20,        // cabo mínimo
    caboMargen:   1.20,        // cuánto se pasa del borde de la hebra que lo tapa
    caboTope:     0.45,        // fracción de la distancia al cruce vecino que NO se rebasa        // cuánto se pasa del borde de la hebra que lo tapa        // cuánto se mete el cabo de cada sección bajo la hebra que lo tapa, x anchura
    cruceMinDeg:  40,          // ángulo mínimo de cruce: por debajo, la hebra de abajo queda en astilla
    cruceSepMin:  1.20,        // separación mínima entre cruces, × anchura
    crucesRescate: 3,          // cruces mínimos para aceptar un rescate de familia
    remateMin:    1.0,         // holgura mínima del arranque y el final frente a la huella de un cruce
    segMinRatio:  0.85,        // tramo más corto admisible, × anchura (por debajo la cinta se pliega)
    // Se abre a 1,0, es decir, se desactiva. Dos razones, y las dos medidas:
    // (1) De las cinco obras que el autor aprobó, TRES lo incumplían
    //     (volteos 1,00, 1,00 y 0,50). El umbral salió de una hipótesis mía
    //     —que un nudo con muchos volteos deja de alternar y el ojo no lo
    //     sigue— y su ojo la contradice.
    // (2) Impedía que el tipo 'trama' existiera: más cruces obligan a más
    //     volteos, así que la puerta rechazaba justo los tejidos densos y el
    //     sistema se quedaba siempre con el de dos vueltas.
    volteoMax:    1.00,        // volteos por cruce que se toleran
    // Baja de 10 a 5. Buscar MÁS estaba seleccionando EN CONTRA de la
    // trama: entre los tejidos que pasan, el desempate prefiere menos
    // volteos, y con más candidatos aparece más fácilmente uno flojo que se
    // lleva el sitio. Con el rescate de familia puesto, sobre 60-80 obras:
    //
    //    reint.  obras limpias  cruces/obra  remates soldados  s/obra
    //      3        100%            2,9          2 de 60        0,46
    //      5        100%            2,7          0 de 60        0,70
    //     10        100%            2,4          0 de 60        1,43
    //
    // El 3 sale más rápido y más entrelazado pero deja dos remates pegados
    // a otra hebra: con tan pocos candidatos, la holgura del arranque y el
    // final deja de encontrarse. El 5 es el primero que da cero en TODOS
    // los detectores, y aun así dobla la velocidad del 10 y trae más trama.
    reintentos:   5,           // tejidos alternativos que se prueban con el mismo seed
    densidad:     true,        // entre los que pasan, quedarse con el más entrelazado
    grosorMinimo: 0.78,    // fracción del grosor pedido que un intento debe conservar
    widthMax:     0.098,

    // La junta es una INCISIÓN, no una separación: línea finísima y
    // constante, medida sobre el cuadro y no sobre la cinta, para que
    // sea igual de fina en toda la obra pase lo que pase con la anchura.
    gapAbs:       0.0042,  // × lado del cuadro
    minSegRatio:  1.10,    // segmento mínimo, × anchura
    minTurnDeg:   38,
    holguraMin:   1.45,        // holgura exigida entre hebras vecinas, × anchura
    avoidRatio:   1.36,    // separación mínima entre hebras que NO se cruzan

    salidaMax:    3.2,     // cuánto asoma cada extremo fuera del nudo, × anchura
    margen:       0.022,   // aire libre entre el BORDE de la cinta y el marco
    anchorJitter: 0.030,
    bendMax:      0.075,
    placeJitter:  0.35,    // desplazamiento en el marco, × margen libre

    pad:          0.07,
    aspecto:      1,           // ancho/alto del campo. 1 = cuadrado
    corner:       "auto",      // auto | rectas | curvas — MANDO ÚNICO de la esquina
    ends:         "auto",      // auto | rectos | inglete | redondos
    tinta:        "solido",    // solido | gradiente
    temblor:      0,           // amplitud del temblor del recorrido, × anchura
    // La longitud de onda del temblor, EN ANCHURAS DE CINTA. Dos anchuras es
    // un picado corto; subiendo, la cinta se mece en vez de temblar.
    temblorOnda:  2,
    juntaSolape:  0.05,        // alargue en las juntas internas, × anchura
    punzonExtra:  0.35,        // recorrido extra del punzón más allá del cruce, × anchura         // longitud del punzón en cada cruce, × anchura
    // 'curva' ya NO es un mando aparte: se deriva de 'corner'. Tener un
    // selector recta/curva Y un deslizador de curvatura era pedir dos
    // veces la misma decisión, y encima se pisaban — uno dobla el
    // RECORRIDO y el otro sólo cambia el lineJoin del CONTORNO, así que
    // "rectas" con curvatura 0,4 daba una esquina redonda por fuera y
    // viva por dentro, que no es ninguna de las dos cosas.
    //   rectas → ángulo vivo y junta a inglete (la cinta doblada, que es
    //            la referencia de la que salió la obra)
    //   curvas → cada vértice redondeado hasta la mitad del tramo más corto,
    //            que es el máximo antes de que dos redondeos vecinos
    //            choquen, y junta redonda
    // Se probó un tercer modo sin rectas (la curva por los puntos medios con
    // los vértices de control). Se descartó: con dos basta.
    curva:        0,           // derivado; no lo pongas a mano
    miterLimit:   1.0,         // el pico de inglete es tinta FUERA de la banda: no existe         // por encima, el pico del halo raja la hebra vecina

    paletas:      null,        // lista completa; si no se fija una, se elige por peso
    dots:         "bajo",      // no | bajo | encima
    dotsMin:      3,
    dotsMax:      5,
    dotRMin:      0.55,        // radio, × anchura de cinta — tamaños distintos
    dotRMax:      1.35,
    dotClear:     0.30,        // aire entre disco y cinta, × anchura
    // Sube de 56 a 96. Con 56, la celda mide 16 px en un cuadro de 900 y
    // un ojo del nudo son cuatro celdas: el fondo del ojo se estimaba con
    // un 25% de error y el disco salía o pasado o corto.
    dotGrid:      96,          // resolución del mapa de vacíos
    dotSpread:    5.2,         // separación entre discos, × radio — que ocupen vacíos distintos
    dotTope:      2.4,         // a partir de aquí un hueco ya es "bastante grande", × anchura
    dotOjos:      true,        // buscar los vacíos CERRADOS por la cinta
    dotOjosMax:   2,           // cuántos discos como mucho van a un ojo
  };

  // La familia declara forma Y extensión. La extensión deja de ser
  // un accidente de las coordenadas para ser una decisión.
  const FAMILIES = {
    diagonal: {
      extent: 0.86,
      anchors: [[0.18,0.18],[0.36,0.30],[0.58,0.48],[0.38,0.62],[0.68,0.74],[0.80,0.48]]
    },
    compact: {
      extent: 0.60,
      anchors: [[0.36,0.30],[0.58,0.32],[0.66,0.48],[0.46,0.54],[0.62,0.68],[0.40,0.72],[0.32,0.56],[0.50,0.44]]
    },
    open: {
      extent: 0.98,
      anchors: [[0.78,0.10],[0.44,0.22],[0.14,0.42],[0.48,0.48],[0.20,0.74],[0.58,0.86],[0.88,0.62]]
    },
    returning: {
      extent: 0.80,
      anchors: [[0.22,0.20],[0.48,0.28],[0.74,0.20],[0.62,0.46],[0.36,0.40],[0.52,0.62],[0.24,0.80],[0.60,0.72]]
    },
    cross: {
      extent: 0.94,
      anchors: [[0.16,0.18],[0.48,0.36],[0.76,0.58],[0.36,0.54],[0.18,0.80],[0.58,0.42],[0.84,0.16]]
    }
  };
  const FAMILY_NAMES = Object.keys(FAMILIES);

  // Las cuatro vecinas de una celda. Constante de módulo: dentro del
  // relleno por inundación esto se recorre decenas de miles de veces y
  // crearla en cada vuelta era basura pura.
  const VECINAS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // ------------------------------------------------------------
  // LOS SALTOS
  // Con varias cintas el diagrama de nudo tiene que seguir siendo UNO: los
  // cruces ENTRE ellas también necesitan un orden de pintado, y ese orden
  // sale de las secciones de un único recorrido. Así que las cintas van
  // concatenadas y los segmentos que las unen —los SALTOS— no se dibujan, no
  // cuentan como cruce y no los tocan las restricciones del material.
  //
  // Es una LISTA porque tres cintas necesitan dos saltos. Fue un escalar
  // mientras sólo hubo dos, y toda la maquinaría pregunta por `esSalto(i)`,
  // así que pasar a lista no tocó ninguno de los sitios que sólo preguntan.
  //
  // Es una variable de módulo y no un parámetro porque la atraviesan siete
  // funciones que ya tienen su firma hecha. El dibujo es síncrono: se pone
  // al empezar el tejido y se quita al acabar.
  let _saltos = [];

  const esSalto = (i) => _saltos.indexOf(i) >= 0;
  // El índice de cinta de un nodo: cuántos saltos han quedado atrás.
  const cintaDe = (i) => { let k = 0; for (const s of _saltos) if (i > s) k++; return k; };

  // ------------------------------------------------------------
  // EL TIPO
  // Las cinco familias de arriba NO se leen. Medido sobre 60 obras: mismo
  // aspecto (mediana 0,97), mismo centro (0,50 / 0,50), misma dispersión en
  // los dos ejes, y repartidas por igual. Son etiquetas puestas ANTES de
  // dibujar que no corresponden a nada visible — girar cada pasada sobre el
  // centro y ajustar al marco lava la disposición de la familia.
  //
  // Lo que sí se lee es cuánto se anuda la cinta, y se lee porque el
  // material acompaña: más cruces obligan a adelgazar, así que un tejido
  // denso sale además de cinta fina. Suelto ancho, trama fino.
  //
  // El tipo declara el LARGO DEL TRAZO —que es lo que gobierna los cruces:
  // 49 anchuras de recorrido dan 2,6 cruces, 102 dan 6,7— y luego se
  // COMPRUEBA sobre el resultado. Declarar sin comprobar es lo que ya falló
  // con las familias.
  // El tipo declara DOS cosas materiales —cuánto recorrido y de qué grosor—
  // y los cruces salen de ahí. Declarar sólo el recorrido no funcionaba: a
  // tres vueltas en un marco fijo los tramos se acortan respecto a la
  // anchura, el material adelgaza la cinta más de lo que 'conserva'
  // permite, y el tejido se descartaba entero. Una trama no es una cinta
  // ancha que ha adelgazado: es una cinta fina desde el principio.
  const TIPOS = {
    suelto:  { prob: 0.22, vueltas: 1, trazo: "gordo",    cruces: [0, 1] },
    anudado: { prob: 0.55, vueltas: 2, trazo: "estandar", cruces: [2, 3] },
    trama:   { prob: 0.20, vueltas: 3, trazo: "fino",     cruces: [4, 999] },
    // Dos cintas sueltas que se entrelazan entre sí. Rara a propósito.
    dos:     { prob: 0.03, vueltas: 2, trazo: "estandar", cruces: [2, 999], cintas: 2 },
    // Y tres. Cada cinta se lleva una pasada, así que pide tres vueltas y el
    // trazo fino: tres cintas estándar en el mismo cuadro no dejan holgura y
    // la cinta lo pagaría adelgazando de todas formas, pero eligiendo mal.
    // Sigue fuera del reparto por peso (prob 0) mientras se prueba: el tipo
    // existe para el laboratorio, no para la galería.
    tres:    { prob: 0,    vueltas: 3, trazo: "fino",     cruces: [3, 999], cintas: 3 }
  };
  const TIPO_NAMES = Object.keys(TIPOS);

  function elegirTipo() {
    let r = rng.next(), acc = 0;
    for (const k of TIPO_NAMES) { acc += TIPOS[k].prob; if (r < acc) return k; }
    return "anudado";
  }

  // ------------------------------------------------------------
  // GENERAR (todo lo aleatorio ocurre aquí, con seed)
  // ------------------------------------------------------------
  function generate(seed, cfg) {
    cfg = Object.assign({}, DEF, cfg || {});

    // LA ESQUINA LA TIRA LA OBRA, cuando nadie la fija.
    // El default era "rectas" a secas, así que la variante curva no salía
    // NUNCA sola: ni en un lote, ni en la landing, ni en la galería, sólo si
    // se elegía a mano en el laboratorio. Un rasgo que vale lo mismo en todas
    // las obras no es un rasgo, es una constante mal puesta.
    //
    // Y se tira con su PROPIO azar, no con el principal. Meter una decisión
    // más en el stream compartido correría todos los números siguientes y
    // cambiaría hasta la última obra ya vista por un motivo que no tiene nada
    // que ver con ellas. Es el mismo recurso que usa el degradado.
    // El dado SÓLO cuando nadie la ha fijado, y eso se sabe por el valor: si
    // cfg.corner trae "rectas" o "curvas", manda. Con una bandera aparte
    // (cornerFijo) el dado pisaba a quien llamaba a generate() directamente —
    // que es lo que hacen los seis detectores— y sus configuraciones de esquina
    // se estaban ignorando EN SILENCIO. Una batería que no puede fijar lo que
    // mide no mide.
    if (!cfg.corner || cfg.corner === "auto")
      cfg.corner = new E.Rng((seed ^ 0xC0FFEE) >>> 0).next() < CURVA_PROB ? "curvas" : "rectas";
    cfg.curva = cfg.corner === "curvas" ? 1 : 0;

    // Y EL REMATE IGUAL, que tenía el mismo problema exacto: `ends` valía
    // "rectos" fijo, así que el remate redondo NO SALÍA NUNCA — estaba escrito,
    // dibujado y sin usar. En la esquina curva el remate va redondo, que es lo
    // que pide una cinta redondeada; en la viva reparte entre escuadra e
    // inglete. Mismo azar aparte, por lo mismo.
    if (!cfg.ends || cfg.ends === "auto") {
      cfg.ends = cfg.corner === "curvas" ? "redondos"
               : (new E.Rng((seed ^ 0x1A6E7E) >>> 0).next() < INGLETE_PROB ? "inglete" : "rectos");
    }
    // EL REDONDO ES DE LA CURVA. Un medio disco al final de una cinta de
    // ángulos vivos es de otra obra: si alguien lo pide sobre esquina recta, se
    // le da el corte al bies, que es el remate que esa cinta sí admite.
    if (cfg.ends === "redondos" && cfg.corner !== "curvas") cfg.ends = "inglete";

    reseed(seed);

    // Paleta por la convención del motor: normalizePalettes ya reparte 'prob'
    // por edad, así que un solo weighted la elige y palRarity la puntúa.
    const pal = (cfg.locked && cfg.paletas && cfg.paletas[cfg.lockedIdx])
              ? cfg.paletas[cfg.lockedIdx]
              : (cfg.paletas && cfg.paletas.length ? rng.weighted(cfg.paletas)
                                                   : { colors: PALETA_BASE, name: "base", prob: 0.05 });
    const colores = pickRoles(pal.colors);
    // Con su propio azar, como la esquina y el remate: una decisión más en el
    // stream principal correría todas las obras ya vistas.
    // El valor se lee, no se convierte a booleano a lo bruto: quien llama a
    // generate() directamente —los seis detectores— usa el vocabulario del
    // laboratorio, y `!!"no"` es true. Con eso, pedir "sin fantasma" ponía
    // fantasma en TODAS las obras. Es el mismo error que ya costó la esquina.
    const fq = cfg.fantasma;
    colores.fantasma = (fq === true || fq === 'si') ? true
                     : (fq === false || fq === 'no') ? false
                     : new E.Rng((seed ^ 0xFA5714) >>> 0).next() < FANTASMA_PROB;
    colores.nombre = pal.name;
    const family = rng.pickFrom(FAMILY_NAMES);
    // El tipo manda sobre las vueltas. Las familias siguen existiendo como
    // variación dentro del tipo, no como categoría.
    const tipo = cfg.tipo && TIPOS[cfg.tipo] ? cfg.tipo : elegirTipo();
    const banda = TIPOS[tipo].cruces;
    const enBandaDe = (t) => t.nudo.crossings >= banda[0] && t.nudo.crossings <= banda[1];
    const pedidas = cfg.vueltasFijas ? floor(rng.range(cfg.vueltasMin, cfg.vueltasMax + 1))
                                     : TIPOS[tipo].vueltas;
    // El trazo del tipo manda salvo que el laboratorio lo fije a mano.
    if (!cfg.trazoFijo || cfg.trazo === 'auto')
      cfg = Object.assign({}, cfg, { trazo: TIPOS[tipo].trazo });
    if (TIPOS[tipo].cintas > 1) cfg = Object.assign({}, cfg, { cintas: TIPOS[tipo].cintas });

    // La junta es innegociable: es lo único que distingue un cruce de una
    // costura. Si con las vueltas pedidas la cinta no encuentra sitio
    // donde separarse de sí misma, el sistema QUITA UNA VUELTA y lo
    // vuelve a intentar. Antes de dibujar mal, la obra se hace menos
    // densa. Es la última cesión y la que garantiza que el halo siempre
    // se aplique.
    // OJO: no vale con comprobar que la junta quepa. Adelgazando la cinta
    // la condición se cumple sola y la obra se convierte en un alambre.
    // Un intento se acepta si la cinta CONSERVA el grosor que pedía.
    // El mismo seed admite varios tejidos: se cambian los dados y se vuelve a
    // tejer. Un cruce demasiado rasante NO se repara en sitio —probado: pelea
    // con la auto-evitación y gana el último que se aplique, rompiendo o la
    // holgura o el ángulo— sino que se descarta ese tejido y se prueba otro.
    let intento = null, vueltas = pedidas;
    // Un tejido vale si conserva el grosor, no tiene cruces rasantes Y
    // ADEMÁS SE PUEDE PINTAR: sin ciclos, no hay ninguna sección obligada
    // a ir encima y debajo a la vez.
    // Cuántas de las condiciones incumple. Un tejido vale si son cero.
    const puertasQueFalla = (t) =>
        (t.conserva  >= cfg.grosorMinimo ? 0 : 1)
      + (t.ang.grados >= cfg.cruceMinDeg ? 0 : 1)
      + (t.ciclos === 0                  ? 0 : 1)
      + (t.atasco === 0                  ? 0 : 1)
      + (t.remate  >= cfg.remateMin      ? 0 : 1)
      + (t.seg     >= cfg.segMinRatio    ? 0 : 1)
      + (t.volteos <= cfg.volteoMax      ? 0 : 1)
      + (t.sep     >= cfg.cruceSepMin    ? 0 : 1);

    // Las ocho condiciones NO son de la misma naturaleza y mezclarlas salía
    // caro. Unas dicen si la obra SE PUEDE DIBUJAR BIEN: un cruce rasante
    // deja astilla, dos cruces pegados no dejan sitio a la incisión, un
    // ciclo obliga a una sección a ir encima y debajo a la vez. Ésas no se
    // negocian.
    //
    // Otras son HIPÓTESIS MÍAS sobre qué se ve bien, y una de ellas ya ha
    // salido equivocada: volteoMax nació de suponer que un nudo con muchos
    // volteos deja de alternar y el ojo no lo sigue, y de las cinco obras
    // que el autor aprobó TRES lo incumplen (volteos 1,00, 1,00 y 0,50).
    // Se conservan como preferencia, no como veto.
    const correcto = (t) => t.ang.grados >= cfg.cruceMinDeg
                         && t.ciclos === 0
                         && t.atasco === 0
                         && t.remate >= cfg.remateMin
                         && t.seg >= cfg.segMinRatio
                         && t.sep >= cfg.cruceSepMin;

    const preferible = (t) => t.conserva >= cfg.grosorMinimo
                           && t.volteos <= cfg.volteoMax;

    const puntua = (t) => correcto(t) && preferible(t);

    for (let k = 0; k <= cfg.reintentos; k++) {
      // El suelo de vueltas no es sólo vueltasMin: una cinta se lleva una
      // pasada, así que bajar de ahí le quita cintas al tipo y el tipo deja de
      // ser lo que dice. 'tres' con dos pasadas son dos cintas, y eso ya tiene
      // su propio tipo.
      for (let v = pedidas; v >= min(pedidas, max(cfg.vueltasMin, cfg.cintas || 1)); v--) {
        reseed(seed ^ 0xA17E ^ (k * 0x9E3779B1));
        const t = tejer(family, v, cfg);
        t.saltos = _saltos.slice();
        t.ang = minAnguloCruce(t.nodes);
        t.nudo = buildKnot(t.nodes.map(n => n.p), t.width);
        t.ciclos = t.nudo.plano.ciclos;
        // Sin sitio donde partir: el tejido no se puede dibujar sin que
        // un cruce cambie de profundidad a media huella.
        t.atasco = t.nudo.plano.atasco || 0;
        // Holgura del peor remate en unidades de huella. Por debajo de 1 la
        // cinta se acaba antes de que el halo termine de cortar.
        t.remate = t.nudo.remate;
        // Cada volteo rompe la alternancia del tejido. Un nudo que se
        // deja pintar con pocos volteos se lee como tejido; uno que
        // necesita diez ya no alterna y el ojo no lo sigue.
        t.volteos = t.nudo.plano.volteados / max(t.nudo.cruces.length, 1);
        t.sep = sepCruces(t.nodes) / max(t.width, 1e-9);
        // Tramo más corto en anchuras. enforceMaterial APUNTA a minSegRatio,
        // pero los anchors no se pueden mover: cuando dos caen encima, la
        // reparación no llega y nadie lo cazaba. Un tramo de 0,2 anchuras es
        // un pliegue — la cinta dobla sobre sí misma y el codo sale como un
        // pico o una muesca. Ahora se mide y se descarta el tejido.
        t.seg = minSegDe(t.nodes) / max(t.width, 1e-9);
        t.enBanda = enBandaDe(t);
        t.puertas = puertasQueFalla(t);

        if (!intento) { intento = t; vueltas = v; continue; }
        // Correcto manda sobre preferible: entre un tejido dibujable que no
        // me gusta y uno que me gusta pero sale roto, gana el dibujable.
        const ok = correcto(t), okAntes = correcto(intento);
        const pasa = ok && preferible(t), pasaba = okAntes && preferible(intento);
        let gana;
        // El orden dice qué manda sobre qué, y está pagado en errores:
        //   1. CORRECTO — si la obra se puede dibujar bien. No se negocia.
        //   2. EN BANDA — el tipo declarado. Es lo que hace que 'trama'
        //      exista: un tejido denso incumple casi siempre 'conserva',
        //      porque un nudo apretado adelgaza la cinta, y si la
        //      preferencia va antes que la banda el sistema elige siempre
        //      el tejido flojo y el tipo no llega a ocurrir nunca.
        //   3. PREFERIBLE — hipótesis mías sobre qué se ve bien.
        if (ok !== okAntes) gana = ok;
        else if (ok && t.enBanda !== intento.enBanda) gana = t.enBanda;
        else if (pasa !== pasaba) gana = pasa;
        // entre dos que pasan: el más entrelazado, si se quiere conservar trama
        // entre dos que pasan: menos volteos manda sobre más trama, porque
        // la trama no se lee si el tejido no alterna
        // Entre dos dibujables manda ESTAR EN LA BANDA del tipo: es lo que
        // hace que el tipo signifique algo en la obra terminada y no sólo en
        // la etiqueta.
        else if (pasa) gana = abs(t.volteos - intento.volteos) > 0.05
                            ? t.volteos < intento.volteos
                            : (cfg.densidad && t.ang.cruces > intento.ang.cruces);
        // entre dos que fallan: manda el ángulo, y SÓLO el ángulo — desempatar
        // por trama aquí elige justo el tejido con más cruces rasantes
        // Entre dos que fallan manda CUÁNTAS puertas incumple cada uno, no
        // por cuánto. Encadenar magnitudes no funciona: son de unidades
        // distintas y no se pueden comparar entre sí. Al ordenarlas en
        // cascada, una diferencia trivial de 'seg' —1,0 contra 1,7
        // anchuras, las dos perfectamente sanas— aplastaba una diferencia
        // catastrófica de 'sep' (0,4 contra 3,4) y el sistema elegía el
        // tejido agolpado. Contando puertas eso no puede pasar.
        // El desempate final es 'sep', que es la única de estas medidas
        // que ha coincidido con el criterio del autor.
        else gana = t.puertas !== intento.puertas ? t.puertas < intento.puertas
                  : abs(t.sep - intento.sep) > 0.08 ? t.sep > intento.sep
                  : abs(t.volteos - intento.volteos) > 0.05 ? t.volteos < intento.volteos
                  : t.ang.grados > intento.ang.grados;
        if (gana) { intento = t; vueltas = v; }
      }
      if (!cfg.densidad && puntua(intento)) break;
    }

    // ÚLTIMO RECURSO: CAMBIAR DE FAMILIA
    // Si para este seed no hay NINGÚN tejido DIBUJABLE con su familia, se
    // prueban las demás. No dan igual de sí: en los cuatro seeds que
    // fallaban, 'compact' siempre producía un nudo limpio de 3 cruces y
    // 'cross' ninguno.
    //
    // Se dispara sólo con 'correcto', no con 'puntua'. Disparándolo con las
    // ocho puertas entraban también las obras que sólo incumplen volteos —
    // tres de las cinco que el autor aprobó— y se las llevaba por delante.
    //
    // Y se exige un nudo DE VERDAD (>= crucesRescate): sin eso el rescate se
    // llena de tejidos de un solo cruce, que pasan todas las puertas al
    // vacío porque con un cruce no hay separación entre cruces que medir.
    let familiaFinal = family;
    if (!correcto(intento)) {
      let rescate = null;
      for (const F of FAMILY_NAMES) {
        if (F === family) continue;
        for (let k = 0; k <= cfg.reintentos; k++) {
          for (let v = pedidas; v >= max(cfg.vueltasMin, cfg.cintas || 1); v--) {
            reseed(seed ^ 0xA17E ^ (k * 0x9E3779B1));
            const t = tejer(F, v, cfg);
            t.saltos = _saltos.slice();
            t.ang = minAnguloCruce(t.nodes);
            t.nudo = buildKnot(t.nodes.map(n => n.p), t.width);
            t.ciclos = t.nudo.plano.ciclos;
            t.atasco = t.nudo.plano.atasco || 0;
            t.remate = t.nudo.remate;
            t.volteos = t.nudo.plano.volteados / max(t.nudo.cruces.length, 1);
            t.sep = sepCruces(t.nodes) / max(t.width, 1e-9);
            t.seg = minSegDe(t.nodes) / max(t.width, 1e-9);
            if (!correcto(t) || t.nudo.crossings < cfg.crucesRescate) continue;
            t.enBanda = enBandaDe(t);
            const mejorQue = !rescate
              || (t.enBanda && !rescate.t.enBanda)
              || (t.enBanda === rescate.t.enBanda && preferible(t) && !preferible(rescate.t))
              || (t.enBanda === rescate.t.enBanda && preferible(t) === preferible(rescate.t)
                  && t.nudo.crossings > rescate.t.nudo.crossings);
            if (mejorQue) rescate = { t, v, F };
          }
        }
      }
      if (rescate) { intento = rescate.t; vueltas = rescate.v; familiaFinal = rescate.F; }
    }

    const { nodes, width } = intento;
    const points = nodes.map(n => n.p);
    const { cuts, order, depth, cruces, plano, crossings } = intento.nudo;


    // ¿Se entrelazan de verdad las dos cintas? Cada una tiene que ganar algún
    // cruce compartido. Cuando el nudo no deja partir ninguna sección, el plano
    // resuelve el ciclo volteando y acaba con una cinta entera encima: se puede
    // dibujar, pero es otra cosa, y como rasgo se dice.
    // Con tres cintas la pregunta es la misma pero no basta con "una y otra":
    // se exige que TODAS ganen algún cruce compartido. Si una de las tres pasa
    // entera por encima de las demás, el tejido está apilado igual que antes,
    // aunque las otras dos sí se entrelacen.
    let entrelazada = null;
    const saltos = intento.saltos || [];
    if (saltos.length) {
      const cinta = (s) => { let k = 0; for (const x of saltos) if (s > x + 0.5) k++; return k; };
      const gana = new Array(saltos.length + 1).fill(0);
      for (const c of cruces) {
        const ka = cinta(c.arriba), kb = cinta(c.abajo);
        if (ka === kb) continue;              // cruce de una cinta consigo misma
        gana[ka]++;
      }
      entrelazada = gana.every(v => v > 0);
    }

    return { seed, tipo, pal, entrelazada, saltos, family: familiaFinal, rescatada: familiaFinal !== family, vueltas, pedidas, sep: intento.sep, remate: intento.remate, seg: intento.seg, points, cuts, order, depth, cruces, plano, crossings, ciclos: intento.ciclos, family2: intento.family2, conserva: intento.conserva, volteos: intento.volteos, width, colores, cfg };
  }

  // ------------------------------------------------------------
  // TEJER — un intento completo con un nº de vueltas dado
  // ------------------------------------------------------------
  // ── El temblor: la mano, no la máquina ────────────────────────────────────
  // Ruido COHERENTE y SEMBRADO. En el sketch de p5 era `noise(i * 0.55)` sin
  // noiseSeed, así que todas las obras temblaban exactamente igual — el mismo
  // perfil de ondas en todas. Aquí el ruido sale de su propio Rng, sembrado
  // con el seed de la obra: cada una tiembla a su manera y el azar principal
  // no se mueve ni un número.
  //
  // Es valor interpolado con smoothstep, no Perlin. Para lo que hace falta
  // —una onda suave a lo largo del recorrido— la diferencia no se ve, y esto
  // cabe en diez líneas sin traer una tabla de gradientes.
  function ruidoCoherente(semilla, escala) {
    const r = new E.Rng(semilla >>> 0);
    const tabla = [];
    for (let i = 0; i < 256; i++) tabla.push(r.next() * 2 - 1);
    return (i) => {
      const x = i * escala, k = floor(x), t = x - k;
      const s = t * t * (3 - 2 * t);
      return tabla[k % 256] * (1 - s) + tabla[(k + 1) % 256] * s;
    };
  }

  function tejer(family, vueltas, cfg) {
    const spec = FAMILIES[family];
    const anchura = cfg.widthOfSeg || ANCHOS[cfg.trazo] || ANCHOS.estandar;

    // El esqueleto se recorre varias veces, cada pasada girada y
    // encogida. La cinta vuelve a entrar en el marco y se cruza con lo
    // que ya dejó escrito. De ahí sale la trama.
    const centro = V(0.5, 0.5);

    // Con varias cintas, cada pasada ES una cinta. Y dos cintas de la misma
    // familia son la misma forma girada 0,62 de vuelta y encogida: se leen
    // como el eco de una sola, no como dos tejidos que se encuentran. Cada
    // cinta a partir de la primera saca sus anchors de OTRA familia.
    //
    // Medido, las familias no se distinguen una a una —mismo aspecto de
    // mancha, mismo centro, misma dispersión—, y por eso no son una
    // categoría. Pero aquí no se comparan contra una media recordada: están
    // EN LA MISMA IMAGEN, una al lado de la otra, y ahí la comparación sí es
    // directa.
    //
    // Una cinta se lleva una pasada, así que no puede haber más cintas que
    // pasadas: tres cintas piden tres vueltas. Si el tipo pide más cintas de
    // las que caben, manda lo que cabe.
    const nCintas = min(max(1, cfg.cintas || 1), vueltas);
    const specs = [];
    for (let t = 0; t < vueltas; t++) specs.push(spec);
    const familiasExtra = [];
    if (nCintas > 1) {
      // Familias DISTINTAS entre sí: repetir familia en dos cintas devuelve el
      // eco que se quería evitar.
      const otras = FAMILY_NAMES.filter(f => f !== family);
      for (let k = 1; k < nCintas; k++) {
        const libres = otras.filter(f => familiasExtra.indexOf(f) < 0);
        const f = libres.length ? libres[floor(rng.next() * libres.length)]
                                : otras[floor(rng.next() * otras.length)];
        familiasExtra.push(f);
        specs[k] = FAMILIES[f];
      }
    }
    const family2 = familiasExtra.length ? familiasExtra[0] : null;

    let anchors = [];
    const cortes = [];
    for (let t = 0; t < vueltas; t++) {
      const ang = t * cfg.vueltaGiro * TWO_PI + rng.range(-0.25, 0.25);
      const esc = pow(cfg.vueltaEscala, t);
      let pass = specs[t].anchors.map(a => {
        const p = V(a[0] - centro.x, a[1] - centro.y).mult(esc);
        return V(
          centro.x + p.x * cos(ang) - p.y * sin(ang),
          centro.y + p.x * sin(ang) + p.y * cos(ang)
        );
      });
      if (t % 2 === 1) pass.reverse();   // enlace natural entre pasadas
      anchors = anchors.concat(pass);
      cortes.push(anchors.length);        // dónde acaba cada pasada
    }

    // El campo es A veces más ancho, así que la disposición se reparte por
    // él. No deforma la cinta: sólo cambia dónde caen los anchors, y la
    // anchura se saca DESPUÉS de la mediana de los tramos.
    // Se estira MÁS que el marco (A^1.5 en vez de A). Con el estirado justo,
    // la obra salía centrada y con los costados vacíos: separar hebras y
    // abrir pliegues devuelve la mancha hacia lo isótropo, y se come buena
    // parte del estirado. Medido: con A solo, el aspecto de la mancha
    // apenas se movía de 1.
    const A = cfg.aspecto || 1;
    if (A !== 1) {
      const k = pow(A, 1.5);
      for (const p of anchors) p.x = A * 0.5 + (p.x - 0.5) * k;
    }

    const j = cfg.anchorJitter;
    for (const p of anchors) { p.x += rng.range(-j, j); p.y += rng.range(-j, j); }
    if (rng.next() < 0.5)  for (const p of anchors) p.x = 1 - p.x;
    if (rng.next() < 0.35) for (const p of anchors) p.y = 1 - p.y;

    // los anchors son intocables, los insertados son material blando
    let nodes;
    if (nCintas > 1) {
      // VARIAS CINTAS: cada pasada es una cinta suya, no un tramo más del
      // mismo recorrido. Se construyen por separado —si no, buildPath
      // insertaría puntos ENTRE ellas y las uniría— y se concatenan con un
      // salto entre cada dos.
      // El corte va por la FRONTERA DE PASADA, no por partes iguales de la
      // lista: dos familias distintas no tienen el mismo número de anchors,
      // y repartir a ojo le daría a una cinta un trozo de la otra.
      const trozos = [];
      let desde = 0;
      for (let k = 0; k < nCintas; k++) {
        const hasta = k === nCintas - 1 ? anchors.length : cortes[k];
        const aK = anchors.slice(desde, hasta);
        trozos.push(buildPath(aK, aK.length + floor(rng.range(1, 4)), cfg));
        desde = hasta;
      }
      nodes = trozos[0];
      _saltos = [];
      for (let k = 1; k < trozos.length; k++) {
        // el salto es el ÍNDICE DEL ÚLTIMO NODO de la cinta anterior: el
        // segmento que va de ahí al siguiente es el que no se dibuja.
        _saltos.push(nodes.length - 1);
        nodes = nodes.concat(trozos[k]);
      }
    } else {
      _saltos = [];
      nodes = buildPath(anchors, anchors.length + floor(rng.range(2, 7)), cfg);
    }

    // La extensión declarada vale para UNA pasada. Cada vuelta añade
    // recorrido dentro del mismo marco y necesita más campo.
    // Con dos familias manda la más extendida: encajar dos cintas en la
    // extensión de la más recogida las apelotona en el centro.
    const extension = familiasExtra.reduce((m, f) => max(m, FAMILIES[f].extent), spec.extent);
    nodes = fitToExtent(nodes, min(0.98, extension + 0.12 * (vueltas - 1)), cfg);
    let width = constrain(anchura * medianSeg(nodes), cfg.widthMin, cfg.widthMax);

    // Las tres restricciones se estorban entre sí: abrir un pliegue
    // acorta segmentos, separar hebras cierra giros. Se iteran juntas.
    for (let round = 0; round < 16; round++) {
      nodes = enforceMaterial(nodes, width, cfg);
      nodes = relaxFolds(nodes, cfg);
      nodes = selfAvoid(nodes, width, cfg);
      width = constrain(anchura * medianSeg(nodes), cfg.widthMin, cfg.widthMax);
    }

    // Encoger es lo último de cada fase: cualquier reajuste posterior
    // volvería a sacar la cinta del cuadro. Y encoger vuelve a juntar
    // las hebras, así que la evitación se repasa ya dentro del marco.
    for (let i = 0; i < 2; i++) {
      nodes = shrinkIntoFrame(nodes, width, cfg);
      width = constrain(anchura * medianSeg(nodes), cfg.widthMin, cfg.widthMax);
    }
    for (let i = 0; i < 6; i++) {
      nodes = selfAvoid(nodes, width, cfg);
      nodes = relaxFolds(nodes, cfg);
      nodes = shrinkIntoFrame(nodes, width, cfg);
    }

    // Los extremos SALEN de la trama. Una cinta que muere en mitad del
    // nudo, cortada a hueso, es lo único que queda sin resolver a la vista.
    nodes = sacarExtremos(nodes, width, cfg);
    for (let i = 0; i < 6; i++) {
      nodes = selfAvoid(nodes, width, cfg);
      nodes = relaxFolds(nodes, cfg);
      nodes = shrinkIntoFrame(nodes, width, cfg);
    }
    // EL TEMBLOR VA AQUÍ, detrás de todos los lazos.
    // Se probó antes de ellos y después de sacarExtremos, y en los dos sitios
    // selfAvoid y relaxFolds se lo comían: a amplitud 1,0 —el ancho entero de
    // la cinta— la obra salía indistinguible de la lisa. Ahí no hay temblor,
    // hay tiempo gastado.
    // Detrás sólo queda shrinkIntoFrame, que es una escala y una traslación
    // uniformes: mete la mancha en el cuadro sin alisar nada. Y la anchura se
    // recalcula justo después sobre el recorrido ya tembloroso, así que la
    // holgura entre hebras se sigue exigiendo sobre lo que se dibuja: si el
    // temblor junta dos hebras, la cinta adelgaza. Por eso de 0,30 para arriba
    // el mando que de verdad manda es el grosor.
    width = constrain(anchura * medianSeg(nodes), cfg.widthMin, cfg.widthMax);

    // La cinta cede: adelgaza hasta que la incisión quepa, y hasta que
    // ningún tramo sea más corto que ella misma (si no, deja de ser
    // tramo y pasa a ser bulto).
    // La anchura que el tejido admite de verdad, sin suelo: si sale
    // ridícula es que este nudo no aguanta esta cinta, y hay que
    // enterarse ANTES de subirla por el mínimo — si no, el suelo la
    // devuelve por encima del tramo más corto y reaparecen los bultos.
    const deseada = width;
    const admitida = min(deseada,
                         holguraReal(nodes) / cfg.holguraMin,   // canal de verdad, no un pelo
                         segPercentil(nodes, 0.15) / 1.05);
    width = constrain(admitida, cfg.widthMin, cfg.widthMax);

    // El temblor NO va aquí. Se probó moviendo el recorrido —en tres sitios
    // distintos del pipeline— y el resultado fue siempre el mismo callejón:
    // con amplitud pequeña no se ve, y con amplitud grande deja de ser la misma
    // obra. El temblor vive ahora en el DIBUJO, variando la anchura sobre un
    // eje que no se mueve (ver trazarVariable). Así los cruces y las incisiones
    // no se recalculan y no hay nada que se pueda romper.

    return { nodes, width, deseada, family2, conserva: admitida / deseada };
  }

  // ------------------------------------------------------------
  // CAMINO: curvatura COHERENTE por tramo (un arco, no un temblor)
  // ------------------------------------------------------------
  function buildPath(anchors, targetCount, cfg) {
    const segCount = anchors.length - 1;
    const extra = max(0, targetCount - anchors.length);
    const per = new Array(segCount).fill(0);
    for (let i = 0; i < extra; i++) per[floor(rng.next() * segCount)]++;

    const out = [];
    for (let s = 0; s < segCount; s++) {
      const a = anchors[s].copy();
      const b = anchors[s + 1].copy();
      if (s === 0) out.push({ p: a.copy(), anchor: true });

      const n = per[s];
      if (n > 0) {
        const dir = PV.sub(b, a);
        const normal = V(-dir.y, dir.x);
        if (normal.magSq() > 0) normal.normalize();
        const bend = rng.range(-cfg.bendMax, cfg.bendMax);   // UN gesto por tramo
        for (let k = 1; k <= n; k++) {
          const t = k / (n + 1);
          const p = PV.lerp(a, b, t);
          p.add(PV.mult(normal, bend * sin(t * PI)));
          out.push({ p, anchor: false });
        }
      }
      out.push({ p: b.copy(), anchor: true });
    }
    return out;
  }

  // ------------------------------------------------------------
  // ENCAJAR EN LA EXTENSIÓN DECLARADA POR LA FAMILIA
  // Escala uniforme (nunca deforma) + colocación con holgura.
  // ------------------------------------------------------------
  function fitToExtent(nodes, extent, cfg) {
    // El campo mide A de ancho por 1 de alto. La escala es SIEMPRE uniforme:
    // deformarlo estiraría la cinta y dejaría de tener grosor constante.
    const A = cfg.aspecto || 1;
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const n of nodes) { minX=min(minX,n.p.x); minY=min(minY,n.p.y); maxX=max(maxX,n.p.x); maxY=max(maxY,n.p.y); }
    const bw = max(maxX-minX, 1e-6), bh = max(maxY-minY, 1e-6);
    const s = min(extent * A / bw, extent / bh);

    // recolocar: centrado + desplazamiento seeded dentro del margen libre
    const newW = bw * s, newH = bh * s;
    const freeX = max(0, A - newW) / 2, freeY = max(0, 1 - newH) / 2;
    const ox = freeX + rng.range(-freeX, freeX) * cfg.placeJitter;
    const oy = freeY + rng.range(-freeY, freeY) * cfg.placeJitter;

    for (const n of nodes) {
      n.p.x = ox + (n.p.x - minX) * s;
      n.p.y = oy + (n.p.y - minY) * s;
    }
    return nodes;
  }

  // Percentil bajo, NO el mínimo: un único tramo corto produce un bulto
  // local, pero si manda sobre la anchura adelgaza la cinta entera.
  function segPercentil(nodes, q) {
    const l = [];
    for (let i = 0; i < nodes.length - 1; i++) l.push(PV.dist(nodes[i].p, nodes[i+1].p));
    if (!l.length) return 0.2;
    l.sort((a, b) => a - b);
    return l[floor((l.length - 1) * q)];
  }

  function medianSeg(nodes) {
    const l = [];
    for (let i = 0; i < nodes.length - 1; i++) l.push(PV.dist(nodes[i].p, nodes[i+1].p));
    if (!l.length) return 0.2;
    l.sort((a, b) => a - b);
    return l[floor(l.length / 2)];
  }

  // ------------------------------------------------------------
  // RESTRICCIÓN MATERIAL
  // Una cinta no puede plegarse más corto que su anchura ni girar
  // más cerrado sin morderse. No es un filtro estético: es el
  // material. Solo se retiran puntos INSERTADOS: los anchors son
  // la familia y no se tocan.
  // ------------------------------------------------------------
  function enforceMaterial(nodes, width, cfg) {
    const minSeg = cfg.minSegRatio * width;
    const minTurn = radians(cfg.minTurnDeg);

    let changed = true, guard = 0;
    while (changed && guard++ < 30) {
      changed = false;

      for (let i = 0; i < nodes.length - 1 && nodes.length > 4; i++) {
        if (esSalto(i)) continue;              // el salto no es un tramo
        if (PV.dist(nodes[i].p, nodes[i+1].p) < minSeg) {
          const drop = !nodes[i+1].anchor ? i+1 : (!nodes[i].anchor ? i : -1);
          if (drop >= 0) { nodes.splice(drop, 1); changed = true; break; }
        }
      }
      if (changed) continue;

      for (let i = 1; i < nodes.length - 1 && nodes.length > 4; i++) {
        if (esSalto(i) || esSalto(i-1)) continue;   // extremos de cinta, no codos
        if (nodes[i].anchor) continue;
        const a = PV.sub(nodes[i-1].p, nodes[i].p);
        const b = PV.sub(nodes[i+1].p, nodes[i].p);
        if (!a.magSq() || !b.magSq()) continue;
        if (abs(a.angleBetween(b)) < minTurn) { nodes.splice(i, 1); changed = true; break; }
      }
    }
    return nodes;
  }

  // ------------------------------------------------------------
  // RELAJACIÓN DE PLIEGUES
  // Una horquilla —giro de casi 180°— hace que la cinta se acueste
  // sobre su propio cuerpo: ilegible. Aquí no se descarta la pieza:
  // el pliegue se abre atrayendo el vértice hacia la mediatriz de
  // sus vecinos, que es lo que haría una cinta real al no poder
  // plegarse tan cerrado.
  // ------------------------------------------------------------
  function relaxFolds(nodes, cfg) {
    const minTurn = radians(cfg.minTurnDeg);

    for (let pass = 0; pass < 60; pass++) {
      let worst = -1, worstAng = minTurn;
      for (let i = 1; i < nodes.length - 1; i++) {
        if (esSalto(i) || esSalto(i-1)) continue;   // extremos de cinta, no codos
        const a = PV.sub(nodes[i-1].p, nodes[i].p);
        const b = PV.sub(nodes[i+1].p, nodes[i].p);
        if (!a.magSq() || !b.magSq()) continue;
        const ang = abs(a.angleBetween(b));
        if (ang < worstAng) { worstAng = ang; worst = i; }
      }
      if (worst < 0) break;

      const i = worst;
      const mid = PV.lerp(nodes[i-1].p, nodes[i+1].p, 0.5);
      // los anchors ceden menos: son la identidad de la familia
      const k = nodes[i].anchor ? 0.18 : 0.32;
      nodes[i].p = PV.lerp(nodes[i].p, mid, k);
    }
    return nodes;
  }

  // ------------------------------------------------------------
  // AUTO-EVITACIÓN
  // Dos hebras que casi se tocan sin llegar a cruzarse producen una
  // hairline de fondo entre ellas: el ojo no sabe si es un cruce o
  // una costura. Se separan hasta que la lectura es inequívoca.
  // Los cruces reales se respetan: ahí es donde vive la profundidad.
  // ------------------------------------------------------------
  function selfAvoid(nodes, width, cfg) {
    const dMin = cfg.avoidRatio * width;
    const n = nodes.length;

    // Descarte barato antes de medir. Dos segmentos cuyos CENTROS distan
    // más que dMin más sus dos medias longitudes no pueden estar a menos
    // de dMin: es una cota, no una aproximación, así que el resultado es
    // idéntico — sólo se deja de calcular lo que ya se sabe que no toca.
    // Sin esto, cada pasada medía los ~300 pares enteros, con cuatro
    // proyecciones y varios vectores nuevos cada uno, y una composición
    // tardaba diez segundos en salir.
    //
    // Los centros se recalculan por par y no se cachean por pasada: los
    // puntos se mueven DENTRO de la pasada, y una caché de la pasada
    // anterior podría descartar un par que ya se ha acercado.
    // Se para cuando el mayor empujón de la pasada ya no significa nada.
    // Antes se paraba sólo si NINGÚN par se había movido, y eso no llega
    // a pasar nunca: el empuje decae geométricamente pero se queda en el
    // suelo del coma flotante (1e-16 de dMin) sin tocar el cero. Cada
    // llamada gastaba sus 160 pasadas, y a partir de la segunda ya
    // entraba convergida.
    //
    // El umbral es 1e-12 y no 1e-9 porque a 1e-9 una de las cinco obras de
    // referencia cambiaba el antialiasing: la geometría era la misma
    // —familia, cruces, secciones, anchura y vértices idénticos— pero
    // shrinkIntoFrame escala según los extremos, y mover un extremo una
    // diezmillonésima de píxel corre el encuadre entero lo justo para
    // voltear un borde. A 1e-12 las cinco salen idénticas al bit.
    const quieto = dMin * 1e-12;

    for (let pass = 0; pass < 160; pass++) {
      let mayor = 0;
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n - 1; j++) {
          if (esSalto(i) || esSalto(j)) continue;
          const a = nodes[i].p, b = nodes[i+1].p, c = nodes[j].p, d = nodes[j+1].p;
          const mdx = (a.x + b.x - c.x - d.x) / 2, mdy = (a.y + b.y - c.y - d.y) / 2;
          const alcance = dMin
            + (Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(d.x - c.x, d.y - c.y)) / 2;
          if (mdx*mdx + mdy*mdy > alcance*alcance) continue;
          if (segIntersect(a, b, c, d)) continue;          // cruce legítimo
          const gap = segDist(a, b, c, d);
          if (gap >= dMin || gap < 1e-9) continue;

          const push = (dMin - gap) * 0.18;
          if (push > mayor) mayor = push;

          // Empujar según los puntos MÁS PRÓXIMOS, no según los puntos
          // medios: cuando una hebra se posa encima de otra los medios
          // casi coinciden, la dirección sale nula y el par se saltaba
          // — justo el caso que hay que resolver.
          const par = parMasProximo(a, b, c, d);
          let dx = par[0].x - par[1].x, dy = par[0].y - par[1].y;
          if (dx*dx + dy*dy < 1e-12) {
            dx = -(b.y - a.y); dy = b.x - a.x;             // respaldo: la normal
            if (dx*dx + dy*dy < 1e-12) continue;
          }
          const inv = 1 / Math.sqrt(dx*dx + dy*dy);        // normalize().mult(push)
          dx = dx * inv * push; dy = dy * inv * push;

          a.x += dx; a.y += dy; b.x += dx; b.y += dy;
          c.x -= dx; c.y -= dy; d.x -= dx; d.y -= dy;
        }
      }
      if (mayor <= quieto) break;
    }

    return nodes;   // el ajuste al marco es una sola vez, al final de generate()
  }

  // ------------------------------------------------------------
  // MARGEN
  // El límite lo marca el BORDE de la cinta, no su eje: media anchura
  // más el halo. Clampear el eje a 0.99 dejaba media banda fuera del
  // cuadro, y ahí es donde se veía cortada.
  // ------------------------------------------------------------
  function frameMargin(width, cfg) {
    return width * 0.5 + cfg.gapAbs + cfg.margen;
  }

  // El conjunto se encoge y se recoloca; NUNCA se recorta punto a punto.
  // Un constrain por vértice empuja varios contra la misma esquina, los
  // vuelve coincidentes y aparecen segmentos de longitud cero — que es
  // exactamente lo que se lee luego como hebras superpuestas.
  function shrinkIntoFrame(nodes, width, cfg) {
    const m = frameMargin(width, cfg);
    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    for (const n of nodes) { minX=min(minX,n.p.x); minY=min(minY,n.p.y); maxX=max(maxX,n.p.x); maxY=max(maxY,n.p.y); }

    const A = cfg.aspecto || 1;
    const s = min(1, (A - m*2) / max(maxX-minX, 1e-9), (1 - m*2) / max(maxY-minY, 1e-9));
    const cx = (minX+maxX)/2, cy = (minY+maxY)/2;

    for (const n of nodes) {
      n.p.x = cx + (n.p.x - cx) * s;
      n.p.y = cy + (n.p.y - cy) * s;
    }

    // Centrar. Las restricciones empujan la mancha en la dirección que
    // encuentran hueco, y acababa descolgada contra un borde con medio
    // cuadro vacío enfrente. El encuadre es del cuadro, no del solver.
    minX = cx + (minX-cx)*s; maxX = cx + (maxX-cx)*s;
    minY = cy + (minY-cy)*s; maxY = cy + (maxY-cy)*s;
    const dx = A / 2 - (minX + maxX) / 2;
    const dy = 0.5 - (minY + maxY) / 2;
    for (const n of nodes) { n.p.x += dx; n.p.y += dy; }

    return nodes;
  }

  // ------------------------------------------------------------
  // CORTES A MITAD DE SEGMENTO (no en el vértice)
  // Cortar en un vértice hacía que el halo de la pieza siguiente
  // mordiese la esquina de la anterior -> cruce falso.
  // ------------------------------------------------------------
  // Prolonga los dos extremos siguiendo su propia dirección hasta salir
  // del cuerpo de la trama. Si un extremo apunta hacia dentro no se toca:
  // alargarlo lo haría atravesar toda la composición.
  function sacarExtremos(nodes, width, cfg) {
    let cx = 0, cy = 0;
    for (const n of nodes) { cx += n.p.x; cy += n.p.y; }
    cx /= nodes.length; cy /= nodes.length;

    const tope = cfg.salidaMax * width;
    const extremos = [[0, 1], [nodes.length - 1, nodes.length - 2]];

    for (const [fin, vecino] of extremos) {
      const d = PV.sub(nodes[fin].p, nodes[vecino].p);
      if (d.magSq() === 0) continue;
      d.normalize();
      const fuera = V(nodes[fin].p.x - cx, nodes[fin].p.y - cy);
      if (fuera.magSq() === 0 || PV.dot(d, fuera.normalize()) <= 0.1) continue;
      nodes[fin].p.add(PV.mult(d, tope));
    }
    return nodes;
  }

  // Ángulo del cruce más rasante del tejido. Un cruce muy oblicuo deja una
  // cola de solape larguísima y reduce la hebra de abajo a una astilla: la
  // incisión es legítima pero deja de leerse como cruce.
  function minAnguloCruce(nodes) {
    let peor = 180, n = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 2; j < nodes.length - 1; j++) {
        const a = nodes[i].p, b = nodes[i+1].p, c = nodes[j].p, d = nodes[j+1].p;
        if (!segIntersect(a, b, c, d)) continue;
        n++;
        const u = PV.sub(b, a), v = PV.sub(d, c);
        if (!u.magSq() || !v.magSq()) continue;
        let g = degrees(abs(u.angleBetween(v)));
        if (g > 90) g = 180 - g;
        peor = min(peor, g);
      }
    }
    return { grados: n ? peor : 180, cruces: n };
  }

  // Separación mínima ENTRE CRUCES. Dos cruces más juntos que la anchura
  // dejan entre ellos una sección más corta que la propia cinta: sus dos
  // remates se pisan, la geometría degenera y salen astillas. No es un
  // problema de orden —esos cruces se ordenan bien— sino de tejido.
  // Tramo más corto del recorrido, en las unidades de los puntos.
  function minSegDe(nodes) {
    let d = Infinity;
    for (let i = 0; i < nodes.length - 1; i++) {
      if (esSalto(i)) continue;
      d = min(d, PV.dist(nodes[i].p, nodes[i+1].p));
    }
    return d === Infinity ? 0 : d;
  }

  function sepCruces(nodes) {
    const P = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 2; j < nodes.length - 1; j++) {
        if (esSalto(i) || esSalto(j)) continue;
        const q = segParams(nodes[i].p, nodes[i+1].p, nodes[j].p, nodes[j+1].p);
        if (q) P.push(PV.lerp(nodes[i].p, nodes[i+1].p, q.t));
      }
    }
    let m = Infinity;
    for (let a = 0; a < P.length; a++)
      for (let b = a + 1; b < P.length; b++) m = min(m, PV.dist(P[a], P[b]));
    return m === Infinity ? 99 : m;
  }

  // Distancia mínima real entre hebras que NO se cruzan. Los cruces se
  // excluyen: ahí el solape es la obra, no el defecto.
  function holguraReal(nodes) {
    let d = Infinity;
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 2; j < nodes.length - 1; j++) {
        if (esSalto(i) || esSalto(j)) continue;
        const a = nodes[i].p, b = nodes[i+1].p, c = nodes[j].p, e = nodes[j+1].p;
        if (segIntersect(a, b, c, e)) continue;
        d = min(d, segDist(a, b, c, e));
      }
    }
    return d === Infinity ? 1 : d;
  }

  // ------------------------------------------------------------
  // DIAGRAMA DE NUDO
  // La profundidad deja de ser "quién se dibujó después" y pasa a
  // decidirse cruce a cruce. Se recorre la cinta y se va alternando
  // encima/debajo; cuando la alternancia se contradice a sí misma en
  // un cruce —ocurre, no todo nudo es alternado— gana la primera
  // visita y la segunda cede. Luego se corta la cinta a mitad de
  // camino entre cruces, de modo que cada trozo contiene exactamente
  // un cruce y por tanto una sola profundidad.
  // ------------------------------------------------------------
  function buildKnot(points, width) {
    const last = points.length - 1;

    const X = [];
    for (let i = 0; i < last; i++) {
      if (esSalto(i)) continue;
      for (let j = i + 2; j < last; j++) {
        if (esSalto(j)) continue;
        const r = segParams(points[i], points[i+1], points[j], points[j+1]);
        if (r) X.push({ a: i + r.t, b: j + r.u });
      }
    }

    if (!X.length) {
      // SIN CRUCES SIGUE HABIENDO SALTO.
      // El atajo devolvía UNA sección de 0 a last, salto incluido — y el salto
      // sólo se deja de pintar cuando una sección cae dentro de él, cosa que
      // con una sección única no pasa nunca. Resultado: una obra de dos cintas
      // sin cruces se dibujaba como UNA cinta, con el salto pintado uniéndolas.
      // Se veía como dos remates soldados (46 de 48 puntos) en las obras del
      // tipo 'dos' que salen sin ningún cruce.
      // Con N saltos, N+1 cintas y N secciones-salto en medio: se parte en
      // cada salto y el trozo que ES el salto queda como sección suya, que es
      // lo único que hace que no se pinte.
      const secc = [];
      let ini = 0;
      for (const s of _saltos.slice().sort((a, b) => a - b)) {
        if (s > ini) secc.push([ini, s]);
        secc.push([s, s + 1]);
        ini = s + 1;
      }
      if (last > ini) secc.push([ini, last]);
      if (!secc.length) secc.push([0, last]);
      const ord = secc.map((_, i) => i);
      return { cuts: [{ startSeg: 0, startT: 0, endSeg: last - 1, endT: 1 }], order: [0], depth: [0], cruces: [],
               plano: { secciones: secc, orden: ord, ciclos: 0, atasco: 0, juntas: [], volteados: 0 },
               crossings: 0, remate: Infinity };
    }

    // La profundidad no es el orden del dibujo: se recorre la cinta y se
    // alterna. Cada cruce se pisa dos veces, y la segunda dice lo contrario
    // que la primera, que es lo que obliga a que tenga un arriba y un abajo.
    // ⟨esaldia:eu⟩ Gainetik eta azpitik ez dira bi geruza: ibilbideari jarraituz txandakatzen dira.
    // ⟨esaldia:eu⟩ Gurutzagune bakoitzetik bi aldiz igarotzen da, eta bigarrenak lehenaren kontrakoa dio.
    // ⟨esaldia:en⟩ Over and under are not two layers: they alternate as the line is walked.
    // ⟨esaldia:en⟩ Every crossing is passed twice, and the second pass says the opposite of the first.
    // ⟨gramatika⟩
    const visits = [];
    X.forEach((x, k) => { visits.push({ s: x.a, k }, { s: x.b, k }); });
    visits.sort((p, q) => p.s - q.s);
    visits.forEach((v, i) => { v.over = i % 2 === 0; });

    const first = {};
    for (const v of visits) {
      if (first[v.k] === undefined) first[v.k] = v.over;
      else v.over = !first[v.k];          // el cruce necesita un arriba y un abajo
    }
    // ⟨/gramatika⟩

    // Los cortes van SIEMPRE al interior de un segmento, nunca cerca de
    // un vértice. En un codo las dos piezas no están alineadas, y el halo
    // de una barre en su dirección una zona que el cuerpo de la otra
    // ocupa y el suyo no: queda una cuña de fondo cruzando la banda, que
    // se lee como una incisión donde no hay ningún cruce.
    const bounds = [0];
    for (let m = 0; m < visits.length - 1; m++) {
      bounds.push(corteEntre(visits[m].s, visits[m+1].s));
    }
    bounds.push(last);

    // Una pieza puede contener VARIOS cruces si en todos ellos va a la
    // misma profundidad. Cortar en cada cruce multiplicaba las juntas
    // sin necesidad, y cada junta es una costura visible.
    const cuts = [], depth = [];
    let m = 0;
    while (m < visits.length) {
      let k = m;
      while (k + 1 < visits.length && visits[k+1].over === visits[m].over) k++;
      for (let i = m; i <= k; i++) visits[i].pieza = cuts.length;
      cuts.push(sToCut(bounds[m], bounds[k+1], last));
      depth.push(visits[m].over ? 1 : 0);
      m = k + 1;
    }

    // ORDEN DE PINTADO
    // "Encima" y "debajo" no son dos capas: dos piezas que van las dos
    // encima pueden cruzarse entre sí, y ahí también hace falta decidir
    // cuál pasa sobre cuál. Pintarlas por grupos borraba esa incisión.
    // Cada cruce impone una relación —la de abajo antes que la de
    // arriba— y el orden sale de ordenar todas esas relaciones.
    const despues = cuts.map(() => []);
    const grado = cuts.map(() => 0);
    const puesta = {};
    for (const v of visits) {
      if (puesta[v.k] === undefined) { puesta[v.k] = v; continue; }
      const otro = puesta[v.k];
      const abajo = v.over ? otro : v;
      const arriba = v.over ? v : otro;
      if (abajo.pieza !== arriba.pieza && !despues[abajo.pieza].includes(arriba.pieza)) {
        despues[abajo.pieza].push(arriba.pieza);
        grado[arriba.pieza]++;
      }
    }

    const order = [], cola = [];
    for (let i = 0; i < cuts.length; i++) if (grado[i] === 0) cola.push(i);
    while (cola.length) {
      const i = cola.shift();
      order.push(i);
      for (const j of despues[i]) if (--grado[j] === 0) cola.push(j);
    }
    // Un nudo puede exigir A sobre B, B sobre C y C sobre A: en papel no
    // existe. Lo que queda en el ciclo se pinta al final por orden de
    // recorrido, y alguno de esos cruces cederá.
    for (let i = 0; i < cuts.length; i++) if (!order.includes(i)) order.push(i);

    // Para el dibujo hace falta, por cada cruce, DÓNDE está y qué hebra
    // pasa por encima; el rango de su pieza da el orden de punzado.
    // Por cada cruce: dónde pasa la hebra de ARRIBA (ahí se punza) y el
    // rango de su pieza, que da el orden en que se punza.
    const rango = {};
    order.forEach((p, i) => { rango[p] = i; });
    const cruces = [];
    const vistos = {};
    for (const v of visits) {
      if (vistos[v.k] === undefined) { vistos[v.k] = v; continue; }
      const otro = vistos[v.k];
      const abajo = v.over ? otro : v;
      const arriba = v.over ? v : otro;
      cruces.push({ arriba: arriba.s, abajo: abajo.s });
    }

    // El plan de secciones se calcula aquí, no al dibujar, para poder
    // comprobar ANTES si este nudo se puede pintar en plano.
    // El salto se fuerza como frontera de sección para que las dos cintas
    // nunca se pinten como un trazo continuo.
    const forzados = [];
    for (const s of _saltos) { forzados.push(s, s + 1); }
    const plano = planoDeSecciones(last, cruces, points, width, forzados);
    // Copia de la alternancia ANTES de que el plano voltee nada. Sin esto no
    // se puede saber si un desequilibrio viene del reparto o del volteo.
    plano.crudos = cruces.map(c => ({ arriba: c.arriba, abajo: c.abajo }));

    // Con los cruces ya volteados por el plano: el ángulo, y con él la
    // huella, dependen de qué hebra ha quedado arriba.
    const remate = holguraDeRemates(points, plano.cruces, width);

    return { cuts, order, depth, cruces: plano.cruces, plano, crossings: X.length, remate };
  }

  // Busca el centro de un segmento dentro del intervalo entre dos
  // cruces: ahí las dos piezas quedan alineadas y el halo es inofensivo.
  // Si no cabe ninguno, se conforma con el punto medio.
  //
  // `veto(s)` marca las posiciones prohibidas. Cuando se pasa y ninguna
  // posición vale, devuelve null: no hay dónde partir y quien llama tiene
  // que descartar el tejido, no partir de todos modos.
  function corteEntre(a, b, veto) {
    const medio = (a + b) / 2;
    let mejor = null;
    for (let k = floor(a); k <= floor(b); k++) {
      const c = k + 0.5;
      if (c <= a || c >= b) continue;
      if (veto && veto(c)) continue;
      if (mejor === null || abs(c - medio) < abs(mejor - medio)) mejor = c;
    }
    if (mejor !== null) return mejor;        // el centro de segmento más equidistante
    return veto ? null : medio;
  }

  // ------------------------------------------------------------
  // PLAN DE SECCIONES
  // La cinta se parte en cada cruce donde pasa por DEBAJO. Cada sección
  // se pintará entera, junta y cuerpo, y sus dos cabos quedarán tapados
  // por la hebra que le pasa por encima.
  //
  // El orden importa: una sección que termina bajo un cruce tiene que
  // pintarse ANTES que la que pasa por encima de ese cruce. Si esas
  // relaciones se contradicen —A sobre B, B sobre C, C sobre A— el nudo
  // NO SE PUEDE PINTAR en plano: alguna sección acabaría encima cuando le
  // tocaba debajo, y ahí aparece un halo donde no debe y falta donde sí.
  // Se cuenta cuántas quedan fuera del orden; generate() descarta ese
  // tejido y prueba otro.
  // ------------------------------------------------------------
  // La HUELLA de un cruce es el trozo de recorrido que la hebra de
  // arriba tapa, medido a lo largo de la de abajo: (W/2)/sen del ángulo.
  // Dentro de esa huella la cinta NO PUEDE cambiar de profundidad. Si una
  // junta cae ahí, la hebra va por encima a un lado del corte y por
  // debajo al otro: el halo aparece a medias por un lado y sobra por el
  // otro, y el cruce deja de leerse. Es el defecto que se veía como
  // "halos que se contradicen".
  function zonasDeCruces(points, cruces, width) {
    const acum = arcosDe(points);
    const dir = (s) => {
      const i = constrain(floor(s), 0, points.length - 2);
      return PV.sub(points[i+1], points[i]).normalize();
    };
    const zonas = [];
    for (const c of cruces) {
      const sen = max(abs(sin(dir(c.abajo).angleBetween(dir(c.arriba)))), 0.18);
      // El 1,20 era el margen de la huella y se quedaba corto por un pelo. La
    // zona vetada tiene que cubrir la huella MÁS el sobresaliente del cuerpo en
    // la junta: medido en la obra que peor salía, la junta caía a 55 px de un
    // cruce cuya huella + pizca medía 55,8 — justo en el filo, y ahí el
    // sobresaliente entraba en la incisión y la tapaba. Barrido del factor
    // sobre 120 obras y 322 cruces:
    //
    //   ×1,20  5 cruces con hueco (peor 26,5 px)   costuras 5.757 px
    //   ×1,60  0 cruces con hueco                  costuras 5.838 px
    //   ×2,00  0 cruces con hueco                  costuras 5.793 px
    //
    // y en los tres casos, cero obras sin tejido limpio: apretar aquí no cuesta
    // tejidos. Se toma 1,60, que es el primero que cierra sin pedir más.
    const r = (width / 2) / sen * 1.60;
      zonas.push({ d: arcoDeParam(points, acum, c.arriba), r });
      zonas.push({ d: arcoDeParam(points, acum, c.abajo),  r });
    }
    return { acum, zonas, total: acum[acum.length - 1] };
  }

  function huellasDeCruces(points, cruces, width) {
    const { acum, zonas } = zonasDeCruces(points, cruces, width);
    // Las dos secciones que se encuentran en una junta NO se tocan: se
    // SOLAPAN una pizca, o el empalme se abriría al primer redondeo. Ese
    // solape lleva tinta una pizca más allá del corte, así que una junta
    // que cae justo fuera de la huella mete cuerpo dentro de ella igual.
    // La zona vetada tiene que contar el solape, no sólo la huella.
    const pizca = width * 0.15;
    return (s) => {
      const d = arcoDeParam(points, acum, s);
      return zonas.some(z => abs(d - z.d) < z.r + pizca);
    };
  }

  // LOS DOS EXTREMOS DE LA CINTA SON TAMBIÉN UN BORDE DE HUELLA.
  // Un cruce pegado al final del recorrido no se puede dibujar: la hebra
  // de arriba necesita seguir media anchura más allá para que su halo
  // termine de cortar, y ahí la cinta ya se ha acabado. La incisión sale a
  // medias y el remate queda soldado a la hebra vecina — que es el defecto
  // que se ve como "al remate le falta el halo".
  //
  // Devuelve la holgura del peor extremo en unidades de huella: 1 es
  // justo, por debajo de 1 no cabe. Es la misma regla que veta las juntas
  // dentro de una huella, aplicada al principio y al final del recorrido.
  function holguraDeRemates(points, cruces, width) {
    const { acum, zonas, total } = zonasDeCruces(points, cruces, width);
    if (!zonas.length) return Infinity;
    // Con dos cintas hay CUATRO remates, no dos: los dos extremos del
    // recorrido y los dos lados del salto.
    const finales = [0, total];
    for (const s of _saltos) { finales.push(acum[s], acum[s + 1]); }
    let peor = Infinity;
    for (const z of zonas)
      for (const f of finales) peor = min(peor, abs(z.d - f) / z.r);
    return peor;
  }

  function planoDeSecciones(last, cruces, points, width, forzados) {
    // Con alternancia estricta casi ningún nudo de esta complejidad se
    // puede pintar en plano: aparecen ciclos (A sobre B, B sobre C, C
    // sobre A). Antes eso dejaba secciones fuera del orden y alguna
    // acababa encima cuando le tocaba debajo — halo donde no debe y falta
    // donde sí. Ahora el nudo SE HACE pintable: se voltea el cruce que
    // cierra cada ciclo, uno a uno, hasta que no queda ninguno. Es lo que
    // hace un grabador cuando un nudo no se puede tumbar en el papel.
    const cr = cruces.map(c => ({ arriba: c.arriba, abajo: c.abajo }));
    const veces = cr.map(() => 0);
    // Un cruce que no se arregla al voltearlo se reportaría eternamente y
    // agotaría el tope sin converger. Tras dos intentos se acepta como
    // está y se pasa al siguiente problema.
    // Cuando la cinta se cruza consigo misma DENTRO de una sección, no hay
    // orden que lo salve: hay que partir también por el punto de arriba.
    // Ese cabo no queda al aire — lo tapa su propia otra mitad, que es
    // justo la que le pasa por encima.
    const extra = new Set(forzados || []);
    let plan = null, volteados = 0, atasco = 0;

    for (let i = 0; i < 120; i++) {
      plan = ordenar(last, cr, extra);
      if (plan.imposible >= 0) {
        // La huella se recalcula en cada vuelta: cada volteo cambia qué
        // hebra va arriba y con ella el ángulo que define la zona vetada.
        const veto = points ? huellasDeCruces(points, cr, width) : null;
        // El corte va ENTRE el punto de abajo y el de arriba, no en uno de
        // ellos: partiendo por 'arriba' la sección que queda entre ambos
        // sigue siendo a la vez la de arriba y la de abajo, y la relación
        // apunta a sí misma. Partiendo en medio, dejan de ser la misma.
        const c = cr[plan.imposible];
        // Y al CENTRO DE UN SEGMENTO: si el corte cae sobre un vértice las
        // dos secciones se encuentran en codo, no alineadas, y el remate
        // del halo cruza la banda. En el centro de un tramo recto es
        // invisible.
        const medio = corteEntre(min(c.arriba, c.abajo), max(c.arriba, c.abajo), veto);
        // No hay ni un centro de segmento libre entre las dos mitades: la
        // cinta se cruza consigo misma en un gancho demasiado corto para
        // partirla en ningún sitio. No se remienda — se descarta el tejido
        // y se prueba otro, que es lo que ya se hace con los cruces
        // rasantes y con los ciclos.
        if (medio === null) { atasco = 1; break; }
        if (extra.has(medio)) break;
        extra.add(medio);
        continue;
      }
      if (plan.culpable < 0) break;

      // Un ciclo se rompe de dos maneras: volteando un cruce —que cambia
      // el tejido— o PARTIENDO una de las secciones atrapadas, que no
      // cambia nada de lo que se ve salvo una costura invisible a mitad
      // de un tramo. Se prueba primero a partir. Con dos cintas esto es
      // lo único que permite que se entrelacen de verdad: entrelazadas
      // SIEMPRE hay ciclo, y volteando se llega inevitablemente al único
      // estado sin ciclos, que es una cinta entera encima de la otra.
      let cortado = false;
      if (plan.ciclo) {
        const veto = points ? huellasDeCruces(points, cr, width) : null;
        for (const n of plan.ciclo) {
          if (n.entra < 0 || n.sale < 0 || n.entra === n.sale) continue;
          const p = cr[n.entra].arriba, q = cr[n.sale].abajo;
          const medio = corteEntre(min(p, q), max(p, q), veto);
          if (medio === null || extra.has(medio)) continue;
          extra.add(medio); cortado = true; break;
        }
      }
      if (cortado) continue;

      const k = plan.culpable;
      const c = cr[k];
      const t = c.arriba; c.arriba = c.abajo; c.abajo = t;
      veces[k]++; volteados++;
    }

    // COMPROBACIÓN FINAL DE LAS JUNTAS.
    // Una junta se abre mirando las huellas de ESE momento. Cada volteo
    // posterior cambia qué hebra va arriba, y con ella el ángulo y el
    // tamaño de la huella: una junta que era buena cuando se abrió puede
    // acabar dentro de una. Ahí la cinta cambia de profundidad dentro de
    // la zona tapada y la incisión sale a medias. No se remienda —el
    // motivo de la junta ya se ha perdido—: se descarta el tejido y se
    // prueba otro, que es lo que ya se hace con los cruces rasantes.
    // Los forzados (los dos lados del salto) no cuentan: no son juntas,
    // son remates, y de ellos se ocupa holguraDeRemates.
    if (!atasco && points) {
      const vetoFinal = huellasDeCruces(points, cr, width);
      const fijos = new Set(forzados || []);
      for (const j of extra) if (!fijos.has(j) && vetoFinal(j)) { atasco = 1; break; }
    }

    return { secciones: plan.secciones, orden: plan.orden,
             ciclos: plan.culpable >= 0 ? 1 : 0, partidos: extra.size,
             atasco: atasco || (plan.imposible >= 0 ? 1 : 0),
             juntas: Array.from(extra), volteados, cruces: cr };
  }

  // Parte la cinta en los cruces donde pasa por debajo y ordena las
  // secciones. Devuelve el índice del cruce que cierra un ciclo, o -1.
  function ordenar(last, cr, extra) {
    const cortes = cr.map(c => c.abajo).concat(Array.from(extra || []))
                     .filter(s => s > 1e-6 && s < last - 1e-6)
                     .sort((a, b) => a - b);

    const secciones = [];
    let desde = 0;
    for (const c of cortes) { if (c > desde + 1e-9) secciones.push([desde, c]); desde = c; }
    secciones.push([desde, last]);

    const cual = (s) => {
      for (let i = 0; i < secciones.length; i++)
        if (s >= secciones[i][0] - 1e-9 && s <= secciones[i][1] + 1e-9) return i;
      return secciones.length - 1;
    };

    const aristas = [];
    const luego = secciones.map(() => []);
    const grado = secciones.map(() => 0);
    // Si la hebra de arriba cae en la MISMA sección que una de las dos
    // mitades de abajo, la cinta se cruza consigo misma dentro de una
    // sección: se pinta de una vez y ahí no hay forma de que una parte
    // tape a la otra. Se funden sin incisión. Ese cruce hay que voltearlo.
    let imposible = -1;
    cr.forEach((c, k) => {
      const a1 = cual(c.arriba - 1e-5), a2 = cual(c.arriba + 1e-5);
      const b1 = cual(c.abajo - 1e-5), b2 = cual(c.abajo + 1e-5);
      // Basta con que UNA de las mitades choque. Si se exigen las dos, el
      // caso parcial pasa desapercibido: su relación de orden se descarta
      // igual (apunta a sí misma) y esa mitad puede pintarse después de la
      // hebra de arriba. Resultado: el cruce sale invertido SÓLO POR UN
      // LADO, que es exactamente lo que se veía.
      if (imposible < 0 && (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2)) imposible = k;
    });

    cr.forEach((c, k) => {
      const arribas = [cual(c.arriba - 1e-5), cual(c.arriba + 1e-5)];
      const abajos = [cual(c.abajo - 1e-5), cual(c.abajo + 1e-5)];
      for (const arriba of arribas) {
        for (const i of abajos) {
          if (i === arriba) continue;
          if (luego[i].includes(arriba)) continue;
          luego[i].push(arriba); grado[arriba]++;
          aristas.push({ de: i, a: arriba, k });
        }
      }
    });

    const orden = [], cola = [];
    secciones.forEach((_, i) => { if (grado[i] === 0) cola.push(i); });
    while (cola.length) {
      const i = cola.shift(); orden.push(i);
      for (const j of luego[i]) if (--grado[j] === 0) cola.push(j);
    }

    // Si algo no entró en el orden hay ciclo. Para romperlo hace falta la
    // ARISTA DE RETORNO concreta, no una cualquiera de las atrapadas: se
    // busca con un recorrido en profundidad, y su cruce es el que se
    // voltea. Volteando una arista al azar el ciclo puede seguir intacto.
    // Se devuelve además EL CICLO ENTERO: por cada sección atrapada, el
    // cruce por el que se entra (pasa por encima de ella) y el cruce por
    // el que se sale (ella pasa por encima de otra). Partir la sección
    // entre esos dos puntos rompe el ciclo sin voltear nada.
    let culpable = -1, ciclo = null;
    if (orden.length < secciones.length) {
      const estado = secciones.map(() => 0);   // 0 sin ver, 1 en curso, 2 cerrado
      const pila = [];
      const salida = (i) => {
        estado[i] = 1;
        const yo = { sec: i, sale: -1 };
        pila.push(yo);
        for (const e of aristas) {
          if (e.de !== i) continue;
          yo.sale = e.k;
          if (estado[e.a] === 1) {                       // arista de retorno
            const desde = pila.findIndex(x => x.sec === e.a);
            const nodos = pila.slice(desde);
            ciclo = nodos.map((x, n) => ({ sec: x.sec, sale: x.sale,
                                           entra: n === 0 ? e.k : nodos[n-1].sale }));
            return e.k;
          }
          if (estado[e.a] === 0) { const r = salida(e.a); if (r >= 0) return r; }
        }
        yo.sale = -1;
        estado[i] = 2;
        pila.pop();
        return -1;
      };
      for (let i = 0; i < secciones.length && culpable < 0; i++)
        if (estado[i] === 0) culpable = salida(i);

      const dentro = new Set(orden);
      secciones.forEach((_, i) => { if (!dentro.has(i)) orden.push(i); });
    }

    // Los cruces imposibles se atienden ANTES que los ciclos: un ciclo
    // sólo desordena, esto directamente no se puede dibujar.
    return { secciones, orden, culpable, imposible, ciclo };
  }

  function sToCut(s0, s1, last) {
    let startSeg = floor(s0), startT = s0 - startSeg;
    let endSeg = floor(s1), endT = s1 - endSeg;
    if (startSeg >= last) { startSeg = last - 1; startT = 1; }
    if (endSeg >= last) { endSeg = last - 1; endT = 1; }
    return { startSeg, startT, endSeg, endT };
  }

  function segParams(p1, p2, p3, p4) {
    const d = (p2.x-p1.x)*(p4.y-p3.y) - (p2.y-p1.y)*(p4.x-p3.x);
    if (abs(d) < 1e-12) return null;
    const t = ((p3.x-p1.x)*(p4.y-p3.y) - (p3.y-p1.y)*(p4.x-p3.x)) / d;
    const u = ((p3.x-p1.x)*(p2.y-p1.y) - (p3.y-p1.y)*(p2.x-p1.x)) / d;
    return (t > 0 && t < 1 && u > 0 && u < 1) ? { t, u } : null;
  }

  function piecePolyline(mapped, cut) {
    const at = (seg, t) => PV.lerp(mapped[seg], mapped[seg + 1], t);
    const out = [at(cut.startSeg, cut.startT)];
    for (let i = cut.startSeg + 1; i <= cut.endSeg; i++) out.push(mapped[i].copy());
    out.push(at(cut.endSeg, cut.endT));
    return out.filter((p, i) => i === 0 || PV.dist(p, out[i-1]) > 0.0001);
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const k = floor(rng.next() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
    return a;
  }

  // ------------------------------------------------------------
  // MAPEO: transformación FIJA (la extensión ya la fijó la familia)
  // ------------------------------------------------------------
  // El lienzo puede no ser cuadrado. La escala se saca del ALTO y se aplica
  // a los dos ejes: el campo ya viene con la proporción metida (mide A de
  // ancho), así que no hace falta —ni se debe— estirar aquí.
  // LA ESCALA ES UNA SOLA. Se limita por el eje que menos da: si el lienzo
  // es más cuadrado que el campo —por ejemplo, un campo apaisado dibujado
  // en un lienzo cuadrado— la obra se sale por los costados; medido, 16
  // obras de 40 con tinta pegada al borde. Encajar por el mínimo deja
  // banda arriba y abajo, que es feo pero no roto.
  //
  // Y la usan LOS DOS: las posiciones y el grosor. Estaban separadas —las
  // posiciones por el mínimo, el grosor por el alto— y con aspecto 1.5 la
  // cinta se pintaba media vez más gorda de lo que el generador había
  // medido. Todas las garantías geométricas (huella, separación, cabos,
  // remates) se calculan en proporción a la anchura: si la anchura crece
  // después, se quedan cortas. Ése era el 8% de cruces a medias que sólo
  // salía en apaisado.
  function escalaDe(S, alto, cfg) {
    const A = cfg.aspecto || 1;
    return min(alto * (1 - cfg.pad * 2), S * (1 - cfg.pad * 2) / A);
  }

  function mapToSquare(pts, ox, oy, S, cfg, H) {
    const alto = H == null ? S : H;
    const A = cfg.aspecto || 1;
    const esc = escalaDe(S, alto, cfg);
    const mx = (S - A * esc) / 2, my = (alto - esc) / 2;
    return pts.map(p => V(ox + mx + p.x * esc, oy + my + p.y * esc));
  }

  // ------------------------------------------------------------
  // DIBUJO
  // ------------------------------------------------------------
  function renderComposition(ctx, ox, oy, S, comp, H, fondo, borrar) {
    const ALTO = H == null ? S : H;
    const cfg = comp.cfg;
    const col = comp.colores;
    const esc = escalaDe(S, ALTO, cfg);
    const width = comp.width * esc;
    const gap = cfg.gapAbs * esc;

    // El fondo es del contrato, no del dibujo de la cinta: render() ya lo ha
    // puesto (plano o mesh). Sólo se pinta aquí cuando alguien llama a mano.
    if (fondo !== false) {
      ctx.fillStyle = col.bg;
      ctx.fillRect(ox, oy, S, ALTO);
    }

    let mapped = mapToSquare(comp.points, ox, oy, S, cfg, ALTO);

    const tinta = cfg.tinta === "gradiente" ? makeGradient(ctx, mapped, comp) : col.fg;
    // Cada cinta va en su color, alternando. Sólo con tinta plana: sobre un
    // degradado el cambio de cinta dejaría de leerse.
    // Se ALTERNA entre dos tintas en vez de pedir una tercera: con tres cintas
    // salen fg, fg2, fg — la primera y la tercera comparten color, y no se
    // confunden porque lo que las separa donde se cruzan no es el color, es la
    // incisión. Una tercera tinta sacada a la fuerza de la paleta salía casi
    // siempre pegada a una de las dos, y eso sí se lee como un error.
    const nSaltos = (comp.saltos || []).length;
    // Con tres cintas y una paleta que da tercera tinta, tres colores. Si la
    // paleta no la da, se alterna entre dos: la primera y la tercera comparten
    // color y no se confunden, porque lo que las separa donde se cruzan no es
    // el color sino la incisión.
    const tintas = [tinta, col.fg2, col.fg3 || tinta];
    // La última cinta puede ser FANTASMA: del color exacto del suelo. Con una
    // sola cinta, la obra entera pasa a ser un dibujo hecho sólo de incisiones.
    const kFantasma = col.fantasma ? nSaltos : -1;
    const tintaDe = (k) => k === kFantasma ? col.bg
                         : (cfg.tinta === "gradiente" || !nSaltos) ? tinta
                         : (nSaltos >= 2 && col.fg3 ? tintas[k % 3]
                                                    : (k % 2 === 0 ? tinta : col.fg2));

    // UNA CINTA DEL COLOR DEL SUELO SIGUE SIENDO UNA CINTA.
    // El halo se pinta a lo largo de TODO el cuerpo de cada sección, pero del
    // color del fondo: donde la cinta pasa sobre el suelo, fondo sobre fondo no
    // se ve, y sólo asoma como incisión donde hay otra hebra debajo. Eso es
    // exactamente lo que se quiere... mientras la cinta y el suelo se
    // distingan. Si no —y puede pasar: una paleta corta, una tercera tinta
    // apretada, un mesh que roza el color de una cinta— la cinta desaparece
    // contra el suelo y de ella sólo quedan los trozos de incisión de los
    // cruces, que se leen como fragmentos sueltos.
    //
    // Entonces el halo de ESA cinta se pinta en un tono corrido del fondo, y
    // pasa a verse en todo el recorrido. No es un contorno dibujado alrededor:
    // es la misma incisión de siempre, que ahora tiene que separar la cinta del
    // suelo y no sólo de otra hebra. El orden de pintado, los solapes y los
    // cabos no cambian NADA — una cinta del color del suelo se dibuja como
    // cualquier otra.
    const haloDe = (k) => {
      const t = tintaDe(k);
      if (typeof t !== 'string') return col.bg;         // tinta en degradado
      if (dcolor(t, col.bg) >= HALO_MIN_DIST) return col.bg;
      return mixHex(col.bg, lum(col.bg) > 0.5 ? '#000000' : '#ffffff', 0.42);
    };
    // Y si alguna cinta lo necesita, el fondo en degradado deja de poder
    // RECORTAR: recortar enseña el suelo, y el problema es justo que el suelo y
    // la cinta se parecen. En esas obras el halo se pinta, no borra.
    let sueloIgual = false;
    for (let k = 0; k <= nSaltos; k++) if (haloDe(k) !== col.bg) sueloIgual = true;

    if (cfg.dots === "bajo") drawDots(ctx, mapped, width, comp, ox, oy, S, ALTO);

    // ============================================================
    // SECCIONES QUE TERMINAN DEBAJO DE OTRA HEBRA
    // La cinta se parte EXACTAMENTE en los cruces donde pasa por debajo.
    // Cada sección se dibuja entera dos veces —junta y cuerpo, a lo largo
    // de TODA su longitud— y sus dos remates quedan tapados por la hebra
    // que le pasa por encima. Por eso la junta es continua y no se ve
    // ninguna costura: no hay ningún corte a la vista.
    //
    // Los dos intentos anteriores fallaban por dónde se cortaba. Cortando
    // en mitad de un tramo recto, las juntas quedaban al aire. Vaciando la
    // cinta bajo el cruce, quedaban secciones sueltas. El corte va en el
    // cruce mismo.
    // ============================================================
    const acum = arcosDe(mapped);
    const total = acum[acum.length - 1];
    _densa = curvaDensa(mapped, acum, Object.assign({}, cfg, { unidadAncho: width }),
                        comp.saltos || []);

    // Los saltos: ni se dibujan, ni sus bordes son cortes. Cada uno son DOS
    // extremos de cinta —con dos cintas hay cuatro, con tres hay seis— y un
    // extremo no lleva cabo ni alarga el halo: si lo llevara, el remate de una
    // cinta se metería en el hueco de la otra.
    _saltos = (comp.saltos || []).slice();
    const saltoArcs = _saltos.map(s => [acum[s], acum[s + 1]]);
    const esFinal = (d) => d <= 1e-6 || d >= total - 1e-6 ||
      saltoArcs.some(r => abs(d - r[0]) < 1e-6 || abs(d - r[1]) < 1e-6);

    const secciones = comp.plano.secciones.map(([a, b]) =>
      [arcoDeParam(mapped, acum, a), arcoDeParam(mapped, acum, b)]);
    const orden = comp.plano.orden;

    // El cabo de cada sección tiene que llegar MÁS ALLÁ del borde de la
    // hebra que lo tapa. Ese borde, medido a lo largo de la hebra de
    // abajo, es (W/2)/sen del ángulo del cruce: en uno oblicuo de 21
    // grados son 1.4 anchuras, no 0.2. Con un cabo fijo el trozo se queda
    // corto y la incisión no asoma por ese lado. Cada remate se alarga
    // según SU cruce.
    const direccion = (s) => {
      const i = constrain(floor(s), 0, mapped.length - 2);
      return PV.sub(mapped[i+1], mapped[i]).normalize();
    };
    // Todos los puntos del recorrido donde ocurre algo: por ahí no puede
    // pasar un cabo. Si una sección se alarga hasta el cruce siguiente,
    // su cuerpo lo arrolla y borra la incisión de ese cruce — que es
    // justo lo que se veía como una costura de un píxel en vez de un
    // corte.
    const hitos = [];
    for (const c of comp.cruces) {
      hitos.push(arcoDeParam(mapped, acum, c.abajo));
      hitos.push(arcoDeParam(mapped, acum, c.arriba));
    }

    const caboEn = (d) => {
      let largo = width * cfg.cabo;
      for (const c of comp.cruces) {
        if (abs(arcoDeParam(mapped, acum, c.abajo) - d) > 1e-6) continue;
        const sen = max(abs(sin(direccion(c.abajo).angleBetween(direccion(c.arriba)))), 0.18);
        largo = max(largo, (width / 2) / sen * cfg.caboMargen);
      }
      let tope = Infinity;
      for (const h of hitos) { const v = abs(h - d); if (v > 1e-6) tope = min(tope, v); }
      return largo;   // el tope por cruce vecino se probó y empeora: 6.6% -> 13% a medias
    };

    // Las juntas que el propio sistema tuvo que abrir (para poder ordenar
    // un cruce que caía dentro de una sola sección) NO están debajo de
    // ninguna hebra: ahí el halo no separa de nada y su remate se vería
    // como una incisión falsa. En esas el halo se queda en el corte y sólo
    // se solapan los cuerpos.
    const juntas = (comp.plano.juntas || []).map(j => arcoDeParam(mapped, acum, j));
    const esJunta = (d) => juntas.some(j => abs(j - d) < 1e-6);
    const pizca = max(E.unit(S, ALTO, REF), width * 0.15);
    // LA COSTURA DE 1 PX ERA EL FILO DEL CABO.
    // El halo y el cuerpo acababan en el MISMO arco, y el remate va a ras
    // (butt). En los píxeles que ese filo parte por la mitad, el halo se
    // lleva una fracción f de la tinta y el cuerpo sólo devuelve (1−f) de
    // lo que queda: sobra f(1−f) de fondo, hasta un 25% en el píxel justo
    // encima del filo. Sobre la sección vecina —ya pintada— eso se lee como
    // una raya finísima cruzando la cinta.
    //
    // Basta con que el cuerpo PASE del halo: su filo cae más allá y lo tapa
    // entero. Es lo que ya hacían las juntas con la pizca, y por eso las
    // juntas nunca tuvieron costura. El mínimo de 1 px es porque el efecto
    // es de antialias y no de composición: por debajo de un píxel de
    // dispositivo no hay nada que tapar, y las celdas de la landing se
    // dibujan a 320 px de lado corto.
    const sobra = max(E.unit(S, ALTO, REF), 1);

    // EL TEMBLOR, EN EL ANCHO. Una cinta cortada a mano no tiene el mismo
    // grosor en todo su recorrido. El eje no se toca —de ahí que sea seguro— y
    // el ancho ondula con ruido coherente, sembrado y medido en anchuras: la
    // onda es la misma a cualquier resolución y a cualquier formato.
    //
    // El tope de 0,45 no es estético: la holgura entre hebras se exige a 1,45
    // anchuras, y una cinta que engorda un 45% por los dos lados se come 0,9 de
    // esa holgura. Por encima, dos hebras que no se cruzan llegarían a tocarse.
    const tmb = cfg.temblor || 0;
    const ruido = tmb > 0 ? ruidoCoherente((_semilla ^ 0x7E3B10) >>> 0, 1) : null;
    const onda = max(width * (cfg.temblorOnda || 2), 1e-6);
    // EL TEMBLOR SÓLO QUITA MATERIAL, nunca lo añade — y no es una elección
    // estética, es lo que lo hace seguro. Los cabos, las huellas de los cruces
    // y el veto de las juntas están medidos con la anchura NOMINAL: una cinta
    // que engorda se sale de lo que el análisis dio por hecho y su cuerpo asoma
    // por donde el halo de la de arriba ya no llega. Medido: con el temblor
    // engordando a 0,45, 132 de 158 cruces con hueco, el peor de 77 px.
    // Adelgazando, todas las garantías se conservan o mejoran: el cuerpo es más
    // fácil de tapar y el canal entre hebras, más ancho.
    // Un corte a mano quita material. No lo pone.
    // Siempre definida, con o sin temblor: los detectores la necesitan para
    // saber dónde está el borde de verdad. Sin temblor devuelve la nominal.
    const anchoEn = ruido
      ? (d) => width * (1 - min(tmb, TEMBLOR_MAX) * (ruido(d / onda) + 1) / 2)
      : () => width;
    const rango = {};
    orden.forEach((sec, k) => { rango[sec] = k; });

    // EL REMATE VA EN EL TURNO DE SU SECCIÓN, no al final.
    //
    // Se pintaba después de todo, y eso lo dejaba ENCIMA de incisiones ya
    // cortadas: un remate que cae sobre un cruce lo rellena de tinta. El
    // step-trace del píxel lo dijo entero — la sección 3 cortaba bien la
    // incisión y el remate la devolvía a tinta al final:
    //
    //   sec 3 HALO       -> 250,250,250   (corta)
    //   sec 3 cuerpo     -> 250,250,250   (se mantiene)
    //   tras los REMATES -> 205,20,64     (rellena)
    //
    // Darle su halo no basta, y se midió: el halo abre un anillo alrededor del
    // remate, pero la tinta del remate sigue cayendo dentro de la incisión
    // ajena. Lo que hace falta es que el remate se pinte CUANDO le toca a su
    // cinta, para que las secciones que van después lo corten como cortan
    // cualquier otro trozo de cinta.
    //
    // Por eso sólo salía con esquina curva: ahí el remate es un disco entero de
    // radio W/2 y barre mucha más superficie que el triángulo del inglete. Con
    // esquina viva, 0 huecos de 634 cruces; con curva, 4.
    // OJO CON LA ANCHURA: el remate se dibuja con la de SU punto, no con la
    // nominal. Con temblor la cinta puede ser ahí un 45% más fina, y un remate
    // de anchura nominal sobresale por los lados y pisa incisiones vecinas —
    // que es exactamente lo que hacía: 0 huecos de 321 cruces con el remate a
    // escuadra (que no dibuja nada) y 17 de 634 con el remate rodando.
    //
    // EL REMATE TAMBIÉN LLEVA INCISIÓN, Y VA EN EL TURNO DEL HALO.
    //
    // Sin ella, el remate es el único trozo de cinta que se suelda a lo que
    // pisa: el cuerpo se separa de la hebra de debajo con su halo y el remate
    // cae encima a pelo. Con la punta del inglete llegando a 1,03 anchuras por
    // delante del cabo y la holgura garantizada allí de 1,0, el caso no es
    // raro: 43 de 60 obras con inglete y 43 de 60 con esquina curva.
    //
    // Ponerla ya se intentó una vez y trajo de vuelta la costura de 1 px
    // (26–107 px pasaban a 2.512 y a 5.561 con inglete). No era el halo: era el
    // ORDEN. Se pintaba halo-del-remate DESPUÉS de la tinta del cuerpo, así que
    // el halo mordía el cuerpo ya pintado y la tinta del remate volvía a taparlo
    // acabando a ras — el f(1−f) de siempre. Pintándolo con los demás halos, la
    // tinta del cuerpo pasa por encima después y no queda nada que sumar.
    //
    // Y LA CARA DEL CABO TAMBIÉN, AUNQUE EL REMATE SEA A ESCUADRA.
    //
    // El halo del cuerpo se traza con cabo a hueso (`lineCap = "butt"`), así que
    // se acaba exactamente donde se acaba la cinta: la cara del final es el
    // único filo de la obra sin incisión. Cuando ese final cae contra otra
    // hebra —y la holgura sólo está garantizada frente a las HUELLAS DE CRUCE,
    // no frente a una vecina que pasa de largo— las dos tintas se tocan y se
    // leen como una sola pieza. Medido con remate a escuadra, que no dibuja
    // nada: 22 de 60 obras de tres cintas y 13 de 60 de dos. Por eso la
    // incisión del extremo se pinta siempre, sea cual sea el remate.
    const remateEn = (p, hacia, kC, arco, pasada, recorta) => {
      const wR = ruido ? anchoEn(arco) : width;
      const redondo = cfg.ends === "redondos", inglete = cfg.ends === "inglete";
      if (pasada === 'tinta' && !redondo && !inglete) return;
      const crece = pasada === 'halo' ? gap : 0;
      if (pasada === 'halo' && recorta) ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = pasada === 'halo' ? (recorta ? 'rgba(0,0,0,1)' : haloDe(kC))
                                        : tintaDe(kC);
      // La incisión del extremo: un disco de la anchura del cabo más el
      // hueco. Lo que se come del cuerpo lo devuelve la tinta, que va después.
      if (pasada === 'halo') {
        ctx.beginPath(); ctx.arc(p.x, p.y, wR / 2 + gap, 0, TWO_PI); ctx.fill();
      }
      if (!inglete) {
        if (pasada === 'tinta' && redondo) {
          ctx.beginPath(); ctx.arc(p.x, p.y, wR / 2, 0, TWO_PI); ctx.fill();
        }
        if (pasada === 'halo' && recorta) ctx.globalCompositeOperation = 'source-over';
        return;
      }
      // INGLETE: UN SOLO CORTE AL BIES.
      // Una punta simétrica añadiría un VÉRTICE en el eje que no existe en
      // una pletina cortada: el corte al bies es UNA línea, no dos. Se añade
      // material en UN lado nada más y el filo que queda a la vista es la
      // diagonal. El lado y la inclinación salen del seed — dos remates
      // idénticos en la misma obra se leen como plantilla, y un corte a mano
      // no repite.
      const d = PV.sub(p, hacia).normalize();
      if (!isFinite(d.x) || !isFinite(d.y) || (d.x === 0 && d.y === 0)) {
        if (pasada === 'halo' && recorta) ctx.globalCompositeOperation = 'source-over';
        return;
      }
      const rr = new E.Rng((_semilla ^ 0x81E5 ^ (mapped.indexOf(p) * 0x9E3779B1)) >>> 0);
      const lado = rr.next() < 0.5 ? 1 : -1;
      const largo = wR * (0.35 + rr.next() * 0.55);
      const n = V(-d.y * lado, d.x * lado);
      const h = wR / 2 + crece;
      // LA BASE DEL TRIANGULO ENTRA EN EL CUERPO, no se queda a ras de él.
      // A ras, el filo del triángulo y el del cuerpo comparten arista, y dos
      // figuras del mismo color que comparten arista NO suman cobertura 1:
      // cada una aporta su fracción y queda una raya más clara. Es el mismo
      // f(1−f) del cabo, ahora en el remate. Medido: con remate a escuadra
      // 0 de 85 obras y 39 px de costura; con inglete a ras, 77 de 85 y
      // 5.631 px. Metiendo la base una pizca dentro, la arista cae sobre
      // tinta maciza y no hay nada que sumar.
      const atras = max(E.unit(S, ALTO, REF), 1) * 2;
      const A = V(p.x + n.x * h - d.x * atras, p.y + n.y * h - d.y * atras);
      const B = V(p.x - n.x * h - d.x * atras, p.y - n.y * h - d.y * atras);
      // El halo crece también HACIA DELANTE: la punta es justo la parte del
      // remate que se mete en terreno ajeno, y una incisión que sólo la
      // rodease por los lados la dejaría soldada por el filo.
      const alcance = largo + crece;
      const C = V(p.x + n.x * h + d.x * alcance, p.y + n.y * h + d.y * alcance);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(C.x, C.y); ctx.lineTo(B.x, B.y);
      ctx.closePath();
      ctx.fill();
      if (pasada === 'halo' && recorta) ctx.globalCompositeOperation = 'source-over';
    };

    // Cada extremo de cinta con su punto, su direccion de SALIDA y su arco: la
    // direccion hace falta porque el inglete apunta hacia fuera, y el arco para
    // saber a que seccion pertenece. Con varias cintas hay dos extremos por
    // salto ademas de los dos del recorrido: seis en una obra de tres cintas.
    const ultN = mapped.length - 1;
    const cabos = [[mapped[0], mapped[1], 0], [mapped[ultN], mapped[ultN - 1], total]];
    for (const sN of _saltos) {
      if (sN - 1 >= 0)   cabos.push([mapped[sN],     mapped[sN - 1], acum[sN]]);
      if (sN + 2 <= ultN) cabos.push([mapped[sN + 1], mapped[sN + 2], acum[sN + 1]]);
    }
    const cintaEnArco = (d) => {
      let k = 0;
      for (const r of saltoArcs) if (d >= r[1] - 1e-6) k++;
      return k;
    };

    for (const i of orden) {
      const [a, b] = secciones[i];
      const aJ = a > 0 && esJunta(a), bJ = b < total && esJunta(b);

      if (saltoArcs.some(r => a >= r[0] - 1e-6 && b <= r[1] + 1e-6)) continue;

      const aFin = esFinal(a), bFin = esFinal(b);

      // EL SOLAPE DE LA JUNTA, Y POR QUÉ SIGUE SIENDO DE LAS DOS.
      //
      // Dos secciones que se encuentran en una junta se solapan una pizca o el
      // empalme se abre al primer redondeo. El halo no acompaña, así que cada
      // una mete una pizca de cuerpo desnudo más allá de su propio halo. Eso
      // abre un hueco en la incisión cuando ese trozo cae encima de otra hebra.
      //
      // Se probaron los dos arreglos y los dos están medidos sobre 1.000 obras
      // y 2.603 cruces, con el detector ya limpio:
      //
      //   alargar el halo de LAS DOS   → costuras 2.755 → 6.545 px
      //   solapar sólo la que pinta
      //   DESPUÉS (cuerpo y halo)      → huecos 1,46% → 1,31% (>=3px)
      //                                  costuras 2.755 → 6.652 px
      //
      // El segundo mejora los huecos un 0,15%, no toca el peor caso (26,5 px) y
      // multiplica por 2,4 las costuras. Los dos pierden por lo mismo: el
      // remate del halo alargado corta a la vecina. Así que el solape se queda
      // como está, y el hueco se ataca por donde de verdad se produce.
      // El `sobra` va SÓLO en los cabos internos. En los remates de verdad
      // —los cuatro extremos de cinta— se midió y empeora: alargar ahí mete
      // tinta en el hueco de la otra cinta y el tipo 'dos' pasa de 4 a 12 px
      // de costura. Un remate es el final de la cinta, no una junta tapada.
      const iniC = max(0, !aFin ? a - (aJ ? pizca : caboEn(a) + sobra) : a);
      const finC = min(total, !bFin ? b + (bJ ? pizca : caboEn(b) + sobra) : b);
      const iniH = max(0, !aFin && !aJ ? a - caboEn(a) : a);
      const finH = min(total, !bFin && !bJ ? b + caboEn(b) : b);

      // De qué cinta es esta sección: cuántos saltos ha dejado atrás.
      let cinta = 0;
      for (const r of saltoArcs) if (a >= r[1] - 1e-6) cinta++;
      // LA INCISIÓN NO ES UN COLOR, ES UN CORTE.
      // Pintarla del color del fondo sólo funciona si el fondo es plano. Sobre
      // un mesh gradient, un halo de color plano deja de leerse como incisión y
      // pasa a leerse como un contorno dibujado alrededor de la cinta — se veía
      // como un borde casi negro sobre el azul del degradado. Cuando el suelo no
      // es plano la obra se pinta en una capa y el halo RECORTA: por el corte se
      // ve el suelo que haya, y la incisión vuelve a ser lo que dice ser.
      if (gap > 0) {
        // El halo de ESTA cinta. Casi siempre es el color del fondo (o el
        // recorte, si el suelo va en degradado); en las obras donde una cinta
        // no se separa del suelo, el tono corrido — y entonces se pinta, porque
        // recortar enseñaría justamente el suelo del que hay que separarla.
        const halo = haloDe(cinta);
        const recorta = borrar && !sueloIgual;
        if (recorta) ctx.globalCompositeOperation = 'destination-out';
        trazarTramo(ctx, mapped, acum, iniH, finH,
                    ruido ? (d) => anchoEn(d) + gap * 2 : width + gap * 2,
                    recorta ? 'rgba(0,0,0,1)' : halo, cfg, "round");
        if (recorta) ctx.globalCompositeOperation = 'source-over';
        // El halo del remate va AQUÍ, con el del cuerpo: lo que se mete dentro
        // del cuerpo lo vuelve a tapar la tinta de abajo y no queda arista que
        // sumar. Detrás de la tinta era de donde salía la costura.
        for (const [cp, chacia, cd] of cabos)
          if (cd >= a - 1e-6 && cd <= b + 1e-6)
            remateEn(cp, chacia, cintaEnArco(cd), cd, 'halo', recorta);
      }
      trazarTramo(ctx, mapped, acum, iniC, finC, ruido ? anchoEn : width, tintaDe(cinta), cfg);

      // El remate de esta seccion, si lo tiene: aqui y no al final.
      for (const [cp, chacia, cd] of cabos)
        if (cd >= a - 1e-6 && cd <= b + 1e-6)
          remateEn(cp, chacia, cintaEnArco(cd), cd, 'tinta', false);
    }



    if (cfg.dots === "encima") drawDots(ctx, mapped, width, comp, ox, oy, S, ALTO);

    _densa = null; _saltos = [];
    // `anchoEn` sale fuera A PROPÓSITO: con el temblor, la anchura ya no es un
    // número y un detector que sonde a la nominal mide donde el borde no está.
    // Costó 135 falsos positivos de 158 cruces enterarse.
    // Sólo cuando hay temblor: si sale siempre, los detectores levantan sus
    // máscaras con el polígono mientras el render usa el trazo, y son dos
    // rasterizaciones distintas. Con eso, 61 cruces «sin corte» de la nada.
    return { mapped, width, gap, esc, anchoEn: ruido ? anchoEn : null };
  }

  // El gradiente recorre la composición, no la sección de la cinta:
  // da atmósfera sin fingir volumen. La profundidad sigue viniendo
  // solo del orden de dibujo.
  function makeGradient(ctx, mapped, comp) {
    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    for (const p of mapped) { minX=min(minX,p.x); minY=min(minY,p.y); maxX=max(maxX,p.x); maxY=max(maxY,p.y); }
    reseed(comp.seed ^ 0x5EED);
    const ang = rng.next() * TWO_PI;
    const cx = (minX+maxX)/2, cy = (minY+maxY)/2;
    const r  = max(maxX-minX, maxY-minY) / 2;
    const g = ctx.createLinearGradient(cx - cos(ang)*r, cy - sin(ang)*r, cx + cos(ang)*r, cy + sin(ang)*r);
    g.addColorStop(0, comp.colores.fg);
    g.addColorStop(1, comp.colores.fg2);
    return g;
  }

  // Contrapunto: discos planos, neutros, del campo y no de la cinta.
  // Única regla de colocación: el CENTRO nunca queda bajo la cinta.
  // El borde sí puede quedar eclipsado — un disco a medio tapar dice
  // más que uno colocado a distancia prudente.
  function drawDots(ctx, mapped, width, comp, ox, oy, S, H) {
    const ALTO = H == null ? S : H;
    const cfg = comp.cfg;
    reseed(comp.seed ^ 0xD075);

    const radios = [];
    for (let i = 0; i < cfg.dotsMax; i++) radios.push(width * rng.range(cfg.dotRMin, cfg.dotRMax));
    const r = max(...radios);   // el hueco se reserva para el mayor
    // Aire entre el borde de la cinta y el borde del disco.
    const aire = width * (0.5 + cfg.dotClear) + cfg.gapAbs * ALTO;
    const need = r + aire;
    const borde = r + cfg.margen * ALTO;
    const N = cfg.dotGrid;

    // Distancia de cada celda del campo a la cinta. Se calcula una vez y
    // sirve para las dos cosas: los vacíos abiertos y los ojos del nudo.
    const D = new Float32Array(N * N);
    const P = new Array(N * N);
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        const p = V(ox + (gx + 0.5) * S / N, oy + (gy + 0.5) * ALTO / N);
        let d = Infinity;
        for (let i = 0; i < mapped.length - 1; i++) d = min(d, pointSegDist(p, mapped[i], mapped[i+1]));
        D[gy * N + gx] = d; P[gy * N + gx] = p;
      }
    }

    // ------------------------------------------------------------
    // LOS OJOS DEL NUDO
    // Un vacío CERRADO POR LA PROPIA CINTA no es lo mismo que un hueco
    // del fondo: pertenece al tejido. Se encuentran inundando desde el
    // borde del cuadro y quedándose con lo que el agua no alcanza.
    //
    // Y el disco lo dimensiona EL OJO, no el azar. Ésa es la diferencia:
    // medido, los ojos miden de mediana 1,07 a 1,3 anchuras de radio y el
    // disco más pequeño de la gama pide 1,35, así que con el tamaño
    // sorteado NINGUNO cabía dentro del tejido. Un disco que llena un ojo
    // pertenece al nudo; uno suelto en el fondo es decoración.
    // ------------------------------------------------------------
    const ojos = [];
    if (cfg.dotOjos !== false && cfg.dotOjosMax > 0) {
      const bajo = (k) => D[k] < width / 2;
      const fuera = new Uint8Array(N * N);
      const pila = [];
      for (let i = 0; i < N; i++)
        for (const k of [i, (N - 1) * N + i, i * N, i * N + N - 1])
          if (!bajo(k) && !fuera[k]) { fuera[k] = 1; pila.push(k); }
      while (pila.length) {
        const k = pila.pop(), x = k % N, y = (k - x) / N;
        for (const v of VECINAS) {
          const nx = x + v[0], ny = y + v[1];
          if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
          const j = ny * N + nx;
          if (bajo(j) || fuera[j]) continue;
          fuera[j] = 1; pila.push(j);
        }
      }
      const visto = new Uint8Array(N * N);
      for (let k = 0; k < N * N; k++) {
        if (bajo(k) || fuera[k] || visto[k]) continue;
        const q = [k]; visto[k] = 1; let mejor = k;
        while (q.length) {
          const t = q.pop();
          if (D[t] > D[mejor]) mejor = t;
          const x = t % N, y = (t - x) / N;
          for (const v of VECINAS) {
            const nx = x + v[0], ny = y + v[1];
            if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
            const j = ny * N + nx;
            if (bajo(j) || fuera[j] || visto[j]) continue;
            visto[j] = 1; q.push(j);
          }
        }
        // Un ojo merece disco sólo si cabe uno de los que la obra iba a
        // dibujar de todos modos. Con un mínimo propio y más bajo salían
        // motas de medio radio que no se leen como disco sino como
        // suciedad, y aparecía una clase de tamaño que no existe en el
        // resto de la obra.
        const rad = D[mejor] - aire;
        if (rad >= width * cfg.dotRMin)
          ojos.push({ p: P[mejor], r: min(rad, width * cfg.dotRMax) });
      }
      ojos.sort((a, b) => b.r - a.r);
    }

    // mapa de vacíos abiertos: los de siempre
    const huecos = [];
    for (let k = 0; k < N * N; k++) {
      const p = P[k];
      if (p.x < ox + borde || p.x > ox + S - borde) continue;
      if (p.y < oy + borde || p.y > oy + ALTO - borde) continue;
      if (D[k] >= need) huecos.push({ p, d: D[k] });
    }
    // El hueco más profundo está SIEMPRE en la esquina del marco, y ahí
    // el disco parece una pegatina. Se le pone tope a la profundidad: en
    // cuanto un vacío es bastante grande, gana el que esté más metido en
    // la composición — los ojos de la propia trama.
    let cx = 0, cy = 0;
    for (const p of mapped) { cx += p.x; cy += p.y; }
    cx /= mapped.length; cy /= mapped.length;
    const tope = cfg.dotTope * width;
    for (const h of huecos) { h.score = min(h.d, tope); h.centro = dist(h.p.x, h.p.y, cx, cy); }
    huecos.sort((a, b) => (b.score - a.score) || (a.centro - b.centro));

    const count = floor(rng.range(cfg.dotsMin, cfg.dotsMax + 1));
    const placed = [];
    // La separación se mide entre BORDES y no con un radio único: ahora
    // los discos no miden todos lo mismo.
    const cabe = (p, rad) => placed.every(q =>
      PV.dist(p, q.p) > (rad + q.r) * 0.5 * cfg.dotSpread);

    // Los ojos primero, pero no todos: llenar el cuadro de discos pequeños
    // sería otra obra. Los demás discos siguen buscando vacío abierto.
    let enOjo = 0;
    for (const o of ojos) {
      if (placed.length >= count || enOjo >= cfg.dotOjosMax) break;
      if (!cabe(o.p, o.r)) continue;
      placed.push({ p: o.p, r: o.r, ojo: true }); enOjo++;
    }
    for (const h of huecos) {
      if (placed.length >= count) break;
      const rad = radios[placed.length % radios.length];
      if (!cabe(h.p, rad)) continue;
      placed.push({ p: h.p, r: rad, ojo: false });
    }

    const gama = comp.colores.dots;
    placed.forEach((d, i) => {
      ctx.fillStyle = gama[i % gama.length];
      ctx.beginPath(); ctx.arc(d.p.x, d.p.y, d.r, 0, TWO_PI); ctx.fill();
    });
    return placed;
  }

  function alargarExtremos(pts, ini, fin) {
    const out = pts.map(p => p.copy());
    // El tope es proporcional al propio tramo SOLO si el tramo es más
    // corto que el solape. Antes lo limitaba a un tercio del tramo, y
    // cuando el corte caía cerca de un vértice ese tramo medía casi nada:
    // el solape se quedaba en cero justo donde hacía falta, y la costura
    // reaparecía. Un píxel no se come ningún cruce.
    // Valor positivo alarga hacia fuera; negativo recorta hacia dentro.
    if (ini !== 0) {
      const d = PV.sub(out[0], out[1]);
      const l = d.mag();
      if (l > 0) out[0].add(d.normalize().mult(constrain(ini, -l * 0.85, l * 0.9)));
    }
    if (fin !== 0) {
      const n = out.length - 1;
      const d = PV.sub(out[n], out[n-1]);
      const l = d.mag();
      if (l > 0) out[n].add(d.normalize().mult(constrain(fin, -l * 0.85, l * 0.9)));
    }
    return out;
  }

  // Trozo del recorrido centrado en la posición s (en parámetro de
  // recorrido), de radio dado en píxeles y siguiendo el camino real:
  // si dentro cae un vértice, el trozo dobla con él.
  // Longitud acumulada en cada vértice: permite trabajar en distancia
  // real y no en índice de segmento.
  function arcosDe(mapped) {
    const a = [0];
    for (let i = 1; i < mapped.length; i++) a.push(a[i-1] + PV.dist(mapped[i-1], mapped[i]));
    return a;
  }

  function arcoDeParam(mapped, acum, s) {
    const i = constrain(floor(s), 0, mapped.length - 2);
    return acum[i] + (s - i) * (acum[i+1] - acum[i]);
  }

  function puntoEnArco(mapped, acum, d) {
    d = constrain(d, 0, acum[acum.length - 1]);
    let i = 0;
    while (i < acum.length - 2 && acum[i+1] < d) i++;
    const tramo = max(acum[i+1] - acum[i], 1e-9);
    return PV.lerp(mapped[i], mapped[i+1], (d - acum[i]) / tramo);
  }

  // Ángulo entre las dos hebras que se cruzan: en un cruce oblicuo el
  // hueco tiene que ser más largo para tapar el mismo ancho de cinta.
  function anguloCruce(mapped, sA, sB) {
    const dir = (s) => {
      const i = constrain(floor(s), 0, mapped.length - 2);
      return PV.sub(mapped[i+1], mapped[i]).normalize();
    };
    return dir(sA).angleBetween(dir(sB));
  }

  // Pinta un tramo con la anchura variando a lo largo, COMO POLÍGONO.
  //
  // El primer intento lo hacía con trozos de trazo solapados, cada uno con su
  // grosor. No vale: eso son losas puestas una encima de otra, y lo que se ve
  // son escalones, no un filo. Un corte deja ARISTAS — puntos unidos.
  //
  // Así que se levantan los dos lados a mano: cada punto del recorrido se
  // desplaza por su normal media anchura, la de ESE punto, y el contorno es el
  // lado de ida más el de vuelta. Las esquinas del polígono son las aristas.
  //
  // El eje no se toca. El halo pide lo mismo con `+ gap` y sale un contorno
  // paralelo al del cuerpo, así que la incisión conserva su grosor exacto en
  // todo el recorrido.
  function poligonoTramo(ctx, mapped, acum, a, b, hf, paint) {
    const P = [], A = [];
    if (_densa) {
      const { pts: DP, arco: DA } = _densa;
      const en = (d) => {
        let i = 0;
        while (i < DA.length - 2 && DA[i+1] < d) i++;
        const t = (d - DA[i]) / max(DA[i+1] - DA[i], 1e-9);
        return PV.lerp(DP[i], DP[i+1], constrain(t, 0, 1));
      };
      P.push(en(a)); A.push(a);
      for (let i = 0; i < DA.length; i++) if (DA[i] > a && DA[i] < b) { P.push(DP[i].copy()); A.push(DA[i]); }
      P.push(en(b)); A.push(b);
    } else {
      P.push(puntoEnArco(mapped, acum, a)); A.push(a);
      for (let i = 0; i < acum.length; i++) if (acum[i] > a && acum[i] < b) { P.push(mapped[i].copy()); A.push(acum[i]); }
      P.push(puntoEnArco(mapped, acum, b)); A.push(b);
    }
    if (P.length < 2) return;

    // La normal de cada punto: la del segmento en los extremos, y la media de
    // los dos en los vértices — si no, la arista se abre por fuera del codo.
    const nor = [];
    for (let i = 0; i < P.length; i++) {
      const p0 = P[max(0, i - 1)], p1 = P[min(P.length - 1, i + 1)];
      const d = PV.sub(p1, p0).normalize();
      nor.push(V(-d.y, d.x));
    }
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < P.length; i++) {
      const h = hf(A[i]);
      const x = P[i].x + nor[i].x * h, y = P[i].y + nor[i].y * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = P.length - 1; i >= 0; i--) {
      const h = hf(A[i]);
      ctx.lineTo(P[i].x - nor[i].x * h, P[i].y - nor[i].y * h);
    }
    ctx.closePath();
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.restore();
  }

  // Un tramo de cinta entre dos distancias, con sus vértices intactos.
  //
  // `w` puede ser un número o una FUNCIÓN del arco. Con función, el tramo se
  // pinta en trozos cortos, cada uno con su anchura: el eje no se mueve ni un
  // píxel y lo que respira es el ancho. Esa es toda la diferencia entre esto y
  // el temblor que se descartó — aquel movía el recorrido, así que pequeño no
  // se veía y grande cambiaba la obra. Aquí los cruces, los cabos y el plan de
  // secciones siguen siendo exactamente los mismos, porque el eje es el mismo:
  // no hay nada que recalcular y nada que se pueda romper.
  //
  // El halo se pide con la MISMA función más el doble del gap, así que la
  // incisión conserva su grosor exacto en todo el recorrido: respiran juntos.
  function trazarTramo(ctx, mapped, acum, a, b, w, paint, cfg, junta) {
    if (b - a < 1e-6) return;
    if (typeof w === 'function') { poligonoTramo(ctx, mapped, acum, a, b, (d) => w(d) / 2, paint); return; }
    if (_densa) {
      // recorte de la curva global: ya viene aplanada, así que se traza a
      // rectas y strokePath no vuelve a curvar nada
      const { pts: P, arco: A } = _densa;
      const en = (d) => {
        let i = 0;
        while (i < A.length - 2 && A[i+1] < d) i++;
        const t = (d - A[i]) / max(A[i+1] - A[i], 1e-9);
        return PV.lerp(P[i], P[i+1], constrain(t, 0, 1));
      };
      const trozo = [en(a)];
      for (let i = 0; i < A.length; i++) if (A[i] > a && A[i] < b) trozo.push(P[i].copy());
      trozo.push(en(b));
      if (trozo.length >= 2) strokePath(ctx, trozo, w, paint, Object.assign({}, cfg, { curva: 0 }), junta);
      return;
    }
    const pts = [puntoEnArco(mapped, acum, a)];
    for (let i = 0; i < acum.length; i++) if (acum[i] > a && acum[i] < b) pts.push(mapped[i].copy());
    pts.push(puntoEnArco(mapped, acum, b));
    if (pts.length >= 2) strokePath(ctx, pts, w, paint, cfg, junta);
  }

  function tramoDePath(mapped, s, radio) {
    const punto = (t) => {
      const i = constrain(floor(t), 0, mapped.length - 2);
      return PV.lerp(mapped[i], mapped[i+1], constrain(t - i, 0, 1));
    };
    const centro = punto(s);

    const lado = (paso) => {
      const out = [];
      let t = s, acum = 0, prev = centro;
      while (acum < radio) {
        const sig = paso > 0 ? min(floor(t) + 1, mapped.length - 1) : max(ceil(t) - 1, 0);
        if (sig === t) break;
        const p = punto(sig);
        const d = PV.dist(prev, p);
        if (acum + d >= radio) {
          out.push(PV.lerp(prev, p, (radio - acum) / max(d, 1e-6)));
          break;
        }
        acum += d; prev = p; t = sig;
        out.push(p.copy());
        if (sig === 0 || sig === mapped.length - 1) break;
      }
      return out;
    };

    return lado(-1).reverse().concat([centro], lado(1));
  }

  // LA CURVA, UNA SOLA VEZ
  // Cortando el recorrido en secciones y re-curvando cada trozo por
  // separado, las dos curvas NO COINCIDEN en la costura: el eje curvo se
  // aparta del polígono hasta un cuarto del tramo, y cada sección se lo
  // aparta a su manera porque sus puntos de control son otros. En el
  // dibujo eso sale como una cuña de tinta donde debería ir la incisión.
  //
  // Así que la curva se calcula entera una vez, se aplana, y cada sección
  // se recorta DE ELLA. Todas las piezas caen sobre el mismo eje y las
  // costuras casan.
  let _densa = null;   // { pts, arco } — arco en la escala del polígono

  // EL SALTO NO ES UNA ESQUINA.
  // La curva redondea todos los vértices interiores, y el vértice de un salto
  // no es un codo de la cinta: es el final de una cinta y el principio de otra,
  // unidos por un tramo que no se dibuja. Redondeándolo, el final de la cinta
  // se doblaba HACIA la cinta siguiente y dejaba de acabar donde dice el
  // recorrido — el remate y su incisión, que van al vértice, caían fuera del
  // cuerpo. Sólo se veía en obras de varias cintas con esquina curva, y salía
  // como remates soldados en 6 de 60. Los dos lados del salto se quedan vivos.
  function curvaDensa(mapped, acum, cfg, saltos) {
    const _s = saltos || [];
    const finDeCinta = (i) => _s.indexOf(i) >= 0 || _s.indexOf(i - 1) >= 0;
    const k = cfg.curva || 0;
    // Con TEMBLOR hace falta un recorrido denso aunque la esquina sea viva: el
    // temblor se dibuja uniendo puntos, y entre dos vértices sueltos no hay
    // nada que unir. Se reparte cada tramo en trozos de un tercio de onda, que
    // es lo que hace falta para que la onda se lea y no se vea el muestreo.
    if (k <= 0.001 && (cfg.temblor || 0) > 0 && mapped.length >= 2) {
      const paso = max((cfg.temblorOnda || 2) * (cfg.unidadAncho || 0.03) / 3, 1e-4);
      const pts = [], arco = [];
      for (let i = 0; i < mapped.length - 1; i++) {
        const largo = acum[i+1] - acum[i];
        const n = constrain(round(largo / paso), 1, 64);
        for (let t = 0; t < n; t++) {
          pts.push(PV.lerp(mapped[i], mapped[i+1], t / n));
          arco.push(acum[i] + largo * t / n);
        }
      }
      pts.push(mapped[mapped.length-1].copy());
      arco.push(acum[acum.length-1]);
      return { pts, arco };
    }
    if (k <= 0.001 || mapped.length < 3) return null;
    const N = 16;
    const pts = [mapped[0].copy()], arco = [0];
    const q = (p0, p1, p2, t) => V(
      (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x,
      (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y);

    for (let i = 1; i < mapped.length - 1; i++) {
      if (finDeCinta(i)) { pts.push(mapped[i].copy()); arco.push(acum[i]); continue; }
      const a = mapped[i-1], v = mapped[i], b = mapped[i+1];
      const la = PV.dist(a, v), lb = PV.dist(v, b);
      const r = k * 0.5 * min(la, lb);
      const ent = PV.lerp(v, a, r / max(la, 1e-6));
      const sal = PV.lerp(v, b, r / max(lb, 1e-6));
      pts.push(ent); arco.push(acum[i] - r);
      for (let t = 1; t <= N; t++) {
        pts.push(q(ent, v, sal, t/N));
        arco.push(acum[i] - r + 2*r * t/N);
      }
    }
    pts.push(mapped[mapped.length-1].copy());
    arco.push(acum[acum.length-1]);
    // monotonía, por si un tramo cortísimo desordena la escala
    for (let i = 1; i < arco.length; i++) if (arco[i] < arco[i-1]) arco[i] = arco[i-1];

    // CON TEMBLOR, DENSO EN TODAS PARTES. La curva mete dieciséis puntos en
    // cada codo y deja los TRAMOS RECTOS con sólo sus dos extremos — para
    // dibujar una curva sobra, porque entre dos vértices la cinta es recta.
    // Pero el temblor se dibuja uniendo puntos: donde no hay puntos, el
    // polígono salta de un extremo al otro con las anchuras de esos dos
    // extremos, y el filo se va de sitio. Medido, con temblor 0,35: esquina
    // viva 0 huecos de 634 cruces, esquina curva 49.
    if ((cfg.temblor || 0) > 0) {
      const paso = max((cfg.temblorOnda || 2) * (cfg.unidadAncho || 0.03) / 3, 1e-4);
      const P2 = [pts[0]], A2 = [arco[0]];
      for (let i = 1; i < pts.length; i++) {
        const dl = arco[i] - arco[i-1];
        const n = constrain(round(dl / paso), 1, 64);
        for (let t = 1; t < n; t++) {
          P2.push(PV.lerp(pts[i-1], pts[i], t / n));
          A2.push(arco[i-1] + dl * t / n);
        }
        P2.push(pts[i]); A2.push(arco[i]);
      }
      return { pts: P2, arco: A2 };
    }
    return { pts, arco };
  }

  function strokePath(ctx, pts, w, paint, cfg, junta) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    // CURVATURA. Con 0 la esquina es viva; subiendo, cada vértice se
    // redondea con una cuadrática cuyo punto de control ES el vértice.
    // No son dos obras distintas: una bézier con el control sobre la
    // recta es una recta, así que el mando recorre lo mismo.
    const k = cfg.curva || 0;
    if (k <= 0.001 || pts.length < 3) {
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i-1], v = pts[i], b = pts[i+1];
        const r = k * 0.5 * min(PV.dist(a, v), PV.dist(v, b));
        const ent = PV.lerp(v, a, r / max(PV.dist(a, v), 1e-6));
        const sal = PV.lerp(v, b, r / max(PV.dist(v, b), 1e-6));
        ctx.lineTo(ent.x, ent.y);
        ctx.quadraticCurveTo(v.x, v.y, sal.x, sal.y);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    }
    ctx.strokeStyle = paint;
    ctx.lineWidth = w;
    ctx.lineJoin = junta || (cfg.corner === "rectas" ? "miter" : "round");
    ctx.miterLimit = cfg.miterLimit;
    ctx.lineCap = "butt";
    ctx.stroke();
    ctx.restore();
  }


  // ------------------------------------------------------------
  // MEDIR (no filtrar). Esto alimenta el triaje por lotes.
  // ------------------------------------------------------------
  function measure(mapped, width, S) {
    let crossings = 0, minGap = Infinity, minSeg = Infinity, minTurn = 180;

    for (let i = 0; i < mapped.length - 1; i++) {
      minSeg = min(minSeg, PV.dist(mapped[i], mapped[i+1]));
      for (let j = i + 2; j < mapped.length - 1; j++) {
        if (segIntersect(mapped[i], mapped[i+1], mapped[j], mapped[j+1])) crossings++;
        else minGap = min(minGap, segDist(mapped[i], mapped[i+1], mapped[j], mapped[j+1]));
      }
    }
    for (let i = 1; i < mapped.length - 1; i++) {
      const a = PV.sub(mapped[i-1], mapped[i]);
      const b = PV.sub(mapped[i+1], mapped[i]);
      if (a.magSq() && b.magSq()) minTurn = min(minTurn, degrees(abs(a.angleBetween(b))));
    }

    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const p of mapped) { minX=min(minX,p.x); minY=min(minY,p.y); maxX=max(maxX,p.x); maxY=max(maxY,p.y); }

    return {
      crossings,
      gapW: minGap === Infinity ? 99 : minGap / width,   // <1 = las hebras se funden
      segW: minSeg / width,
      turn: minTurn,
      fill: ((maxX-minX) * (maxY-minY)) / (S * S)
    };
  }

  function segIntersect(p1, p2, p3, p4) {
    const d = (p2.x-p1.x)*(p4.y-p3.y) - (p2.y-p1.y)*(p4.x-p3.x);
    if (abs(d) < 1e-9) return false;
    const t = ((p3.x-p1.x)*(p4.y-p3.y) - (p3.y-p1.y)*(p4.x-p3.x)) / d;
    const u = ((p3.x-p1.x)*(p2.y-p1.y) - (p3.y-p1.y)*(p2.x-p1.x)) / d;
    return t > 0 && t < 1 && u > 0 && u < 1;
  }

  // Aritmética a pelo, sin p5.Vector ni dist()/constrain() de p5. No es
  // un cambio de criterio: es LA MISMA cuenta en el mismo orden —
  // dist(x1,y1,x2,y2) de p5 es Math.hypot(x2-x1,y2-y1) y su constrain es
  // Math.max(Math.min(n,alto),bajo)— pero sin construir un array de
  // argumentos ni un vector nuevo en cada llamada. Esta función se llama
  // veinticinco millones de veces por composición: ahí se iba el tiempo.
  function pointSegDist(p, a, b) {
    const abx = b.x - a.x, aby = b.y - a.y;
    const l2 = abx*abx + aby*aby;
    if (l2 === 0) return Math.sqrt((p.x-a.x)*(p.x-a.x) + (p.y-a.y)*(p.y-a.y));
    const t = Math.max(Math.min(((p.x-a.x)*abx + (p.y-a.y)*aby) / l2, 1), 0);
    return Math.hypot(a.x + abx*t - p.x, a.y + aby*t - p.y);
  }

  // Pareja de puntos más próxima entre dos segmentos (aproximada por
  // proyección de los cuatro extremos: sobra para relajar).
  // Los cuatro candidatos se guardan en objetos reutilizados: el bucle de
  // auto-evitación entra aquí más de un millón de veces por composición y
  // cada vector nuevo se paga.
  const _pmp = [
    [{x:0,y:0},{x:0,y:0}], [{x:0,y:0},{x:0,y:0}],
    [{x:0,y:0},{x:0,y:0}], [{x:0,y:0},{x:0,y:0}]
  ];

  function parMasProximo(a, b, c, d) {
    _pmp[0][0].x = a.x; _pmp[0][0].y = a.y; proyectaEn(_pmp[0][1], a, c, d);
    _pmp[1][0].x = b.x; _pmp[1][0].y = b.y; proyectaEn(_pmp[1][1], b, c, d);
    proyectaEn(_pmp[2][0], c, a, b); _pmp[2][1].x = c.x; _pmp[2][1].y = c.y;
    proyectaEn(_pmp[3][0], d, a, b); _pmp[3][1].x = d.x; _pmp[3][1].y = d.y;

    // Desenrollado a propósito. Son cuatro candidatos fijos, así que el
    // bucle no aportaba nada — y la protección de bucles infinitos de
    // OpenProcessing ACUMULA el tiempo de cada bucle a lo largo de toda la
    // sesión. Éste se entra más de un millón de veces por composición, así
    // que acababa saltando el aviso de los 13 segundos aunque cada vuelta
    // dure nanosegundos.
    let best = _pmp[0], bd = Infinity, dx, dy, v;
    dx = _pmp[0][1].x - _pmp[0][0].x; dy = _pmp[0][1].y - _pmp[0][0].y;
    bd = Math.sqrt(dx*dx + dy*dy);
    dx = _pmp[1][1].x - _pmp[1][0].x; dy = _pmp[1][1].y - _pmp[1][0].y;
    v = Math.sqrt(dx*dx + dy*dy); if (v < bd) { bd = v; best = _pmp[1]; }
    dx = _pmp[2][1].x - _pmp[2][0].x; dy = _pmp[2][1].y - _pmp[2][0].y;
    v = Math.sqrt(dx*dx + dy*dy); if (v < bd) { bd = v; best = _pmp[2]; }
    dx = _pmp[3][1].x - _pmp[3][0].x; dy = _pmp[3][1].y - _pmp[3][0].y;
    v = Math.sqrt(dx*dx + dy*dy); if (v < bd) { bd = v; best = _pmp[3]; }
    return best;
  }

  // Escribe en 'fuera' en vez de devolver un vector nuevo, por lo mismo.
  function proyectaEn(fuera, p, a, b) {
    const abx = b.x - a.x, aby = b.y - a.y;
    const l2 = abx*abx + aby*aby;
    if (l2 === 0) { fuera.x = a.x; fuera.y = a.y; return fuera; }
    const t = Math.max(Math.min(((p.x-a.x)*abx + (p.y-a.y)*aby) / l2, 1), 0);
    fuera.x = a.x + abx*t; fuera.y = a.y + aby*t;
    return fuera;
  }

  function proyecta(p, a, b) {
    const v = proyectaEn({ x: 0, y: 0 }, p, a, b);
    return V(v.x, v.y);
  }

  function segDist(a, b, c, d) {
    return min(min(pointSegDist(a,c,d), pointSegDist(b,c,d)),
               min(pointSegDist(c,a,b), pointSegDist(d,a,b)));
  }


  // ──────────────────────────────────────────────────────────────────────────
  // EL CONTRATO
  // ──────────────────────────────────────────────────────────────────────────
  // El CAMPO decide la proporción de la obra, y no el pliego: 'sheet' compone en
  // la del lienzo, 'square' compone cuadrado y se centra en él. La cinta NUNCA
  // se deforma: el campo mide A de ancho por 1 de alto y el mapeo es de escala
  // uniforme, así que cambiar de formato cambia la DISPOSICIÓN, no el grosor.
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const u = E.unit(W, H, REF);

    const campo = E.fieldMode(params, 'sheet');
    const cfg = {
      aspecto: campo === 'square' ? 1 : W / H,
      paletas: palettes, locked: !!opts.locked, lockedIdx: opts.lockedIdx,
      unidad: u,
    };
    // Mandos del laboratorio. 'auto' significa "lo que hace la obra", así que
    // no se pisa el default: producción no pasa params y por tanto los defaults
    // SON el comportamiento publicado.
    if (params.tipo && params.tipo !== 'auto') cfg.tipo = params.tipo;
    // Lo que distingue "la obra decide" de "lo decido yo" es el propio valor:
    // "auto" o vacío deja el dado, y cualquier otra cosa manda. Se probó con
    // una bandera aparte y el dado acababa pisando a quien llamaba a generate()
    // sin pasar por aquí.
    if (params.corner && params.corner !== 'auto') cfg.corner = params.corner;
    if (params.temblor != null && params.temblor !== 'auto') cfg.temblor = +params.temblor;
    if (params.ends && params.ends !== 'auto') cfg.ends = params.ends;
    if (params.fantasma && params.fantasma !== 'auto') cfg.fantasma = params.fantasma;
    if (params.dots && params.dots !== 'auto') cfg.dots = params.dots;
    if (params.reintentos) cfg.reintentos = params.reintentos | 0;

    const comp = generate(seed, cfg);
    const col = comp.colores;

    // FONDO. Plano o mesh gradient, por el stream propio del motor: elegir el
    // fondo no puede mover la composición. Se pinta aquí y no en el dibujo de
    // la cinta, que sólo se ocupa de la cinta.
    // El degradado se hace con los colores QUE NO SON TINTA. Con la paleta
    // entera, el mesh puede caer del color de la cinta justo donde la cinta
    // pasa y la obra se borra: salían cintas amarillas sobre suelo amarillo.
    // Si al quitar las tintas no quedan dos colores, no hay degradado que
    // hacer y el suelo se queda plano, que es lo correcto y no un apaño.
    const modo0 = E.pickBg(seed, params, BG_GRADIENT);
    // fg3 también, y no es un detalle: al añadir la tercera tinta el mesh podía
    // volver a caer del color de una cinta —justo el fallo que este filtro
    // existe para evitar— porque la tercera no estaba en la lista.
    const suelo = comp.pal.colors.filter(c => c !== col.fg && c !== col.fg2 && c !== col.fg3);
    const modo = (modo0 === 'gradient' && suelo.length >= 2) ? 'gradient' : 'solid';
    if (modo === 'gradient') {
      E.drawMeshGradient(ctx, W, H, suelo, new E.Rng((seed ^ 0x5EEDB6) >>> 0));
    } else {
      ctx.fillStyle = col.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // LA CINTA.
    // Con suelo plano se pinta directamente: el halo del color del fondo ES la
    // incisión y no hay nada que componer. Con suelo en degradado hace falta una
    // CAPA: ahí el halo recorta en vez de pintar, y al posar la capa sobre el
    // suelo la incisión enseña el degradado en vez de un color que no le
    // corresponde. Cuesta un lienzo más, así que sólo se paga cuando hace falta.
    if (modo === 'gradient') {
      const capa = document.createElement('canvas');
      capa.width = W; capa.height = H;
      renderComposition(capa.getContext('2d'), 0, 0, W, comp, H, false, true);
      ctx.drawImage(capa, 0, 0);
    } else {
      renderComposition(ctx, 0, 0, W, comp, H, false, false);
    }

    E.grain(ctx, W, H, comp.pal.colors, grainScale, u);

    return {
      pal: comp.pal, tipo: comp.tipo, familia: comp.family, familia2: comp.family2,
      cruces: comp.cruces.length, vueltas: comp.vueltas,
      esquinas: comp.cfg.corner, trazo: comp.cfg.trazo, temblor: comp.cfg.temblor || 0,
      fantasma: !!comp.colores.fantasma,
      remate: comp.cfg.ends, tresTintas: !!(comp.colores.fg3 && (comp.saltos||[]).length >= 2),
      cintas: (comp.saltos || []).length + 1,
      secciones: comp.plano.secciones.length, volteos: comp.volteos,
      conserva: comp.conserva, entrelazada: comp.entrelazada,
      fondo: modo, campo,
    };
  }

  // ── Traits ────────────────────────────────────────────────────────────────
  // La rareza de cada rasgo sale de su PROBABILIDAD, no de una escala inventada:
  // el tipo la trae declarada en TIPOS y la paleta la da el motor.
  function rarezaDe(p) {
    return p > 0.30 ? 'common' : p > 0.12 ? 'uncommon' : p > 0.04 ? 'rare'
         : p > 0.012 ? 'superrare' : 'legendary';
  }
  const NOMBRE_TIPO = { suelto: 'Loose', anudado: 'Knotted', trama: 'Weave', dos: 'Two ribbons' };

  function traits(res) {
    const t = TIPOS[res.tipo] || {};
    const list = [
      { key: 'Palette', val: res.pal.name, colors: res.pal.colors,
        rarity: E.palRarity(res.pal.prob || 0.05) },
      { key: 'Type', val: NOMBRE_TIPO[res.tipo] || res.tipo, rarity: rarezaDe(t.prob || 0.25) },
      { key: 'Crossings', val: String(res.cruces),
        rarity: res.cruces >= 8 ? 'rare' : res.cruces >= 5 ? 'uncommon' : 'common' },
      // Ya no es un empate: la esquina curva sale una de cada cuatro, y la
      // rareza tiene que decir la probabilidad de verdad o no dice nada.
      { key: 'Corners', val: res.esquinas === 'curvas' ? 'Round' : 'Sharp',
        rarity: res.esquinas === 'curvas' ? 'uncommon' : 'common' },
      // El remate: escuadra, inglete o medio disco. El redondo va atado a la
      // esquina curva, así que su rareza es la de la esquina.
      { key: 'Ends', val: res.remate === 'redondos' ? 'Round' : res.remate === 'inglete' ? 'Mitre' : 'Square',
        rarity: res.remate === 'redondos' ? 'uncommon' : 'common' },
      { key: 'Ground', val: res.fondo === 'gradient' ? 'Gradient' : 'Flat',
        rarity: res.fondo === 'gradient' ? 'uncommon' : 'common' },
    ];
    // El trazo fantasma: una cinta que sólo existe como corte.
    if (res.fantasma)
      list.push({ key: 'Ghost', val: 'Ribbon as cut', rarity: 'legendary' });

    // El temblor sólo se declara cuando lo hay: en las obras lisas no es un
    // rasgo con valor cero, es un rasgo que no existe.
    if (res.temblor > 0)
      list.push({ key: 'Shake', val: res.temblor.toFixed(2).replace('.', ','),
                  rarity: 'uncommon' });

    // Cuántas cintas, cuando hay más de una: es la primera cosa que se ve.
    if (res.cintas > 1)
      list.push({ key: 'Ribbons', val: String(res.cintas) + (res.tresTintas ? ' · 3 tintas' : ''),
                  rarity: res.cintas >= 3 ? 'rare' : 'uncommon' });

    // Con más de una cinta: que se entrelacen DE VERDAD —cada una gana algún
    // cruce compartido— frente a una entera por encima de las demás, que es lo
    // que pasa cuando el nudo no deja partir ninguna sección.
    if (res.cintas > 1)
      list.push({ key: 'Interlace', val: res.entrelazada ? 'Woven' : 'Stacked',
                  rarity: res.entrelazada ? 'rare' : 'superrare' });

    // La rareza global es la de la combinación, no la del rasgo más raro: dos
    // rasgos poco probables a la vez son más raros que cualquiera de los dos.
    const ORDEN = ['common', 'uncommon', 'rare', 'superrare', 'legendary'];
    const P = { common: 0.5, uncommon: 0.2, rare: 0.07, superrare: 0.02, legendary: 0.005 };
    let p = 1;
    for (const it of list) p *= P[it.rarity] == null ? 0.5 : P[it.rarity];
    const overall = p > 0.02 ? 'common' : p > 0.004 ? 'uncommon' : p > 0.0006 ? 'rare'
                  : p > 0.00008 ? 'superrare' : 'legendary';
    return { list, overall };
  }

  // Las dos proporciones existen, y el orden es el que manda: el primero es el
  // que se abre. La cinta se traza en apaisado —el recorrido tiene que caber
  // varias veces antes de volver a cruzarse consigo mismo— y el cuadrado es una
  // segunda lectura de la misma regla, no la de partida. El panel lo puede
  // cambiar por works.json; esto es lo que vale sin red.
  const FORMATS = ['horizontal', 'square'];

  (global.HOKS = global.HOKS || {}).TRZS = { render, traits, BG_GRADIENT, REF, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
