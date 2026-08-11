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
// VERSIÓN DEL ALGORITMO
// Un veredicto sin versión no vale nada: una obra que se juzgó perfecta
// vuelve a salir mal tres iteraciones después y no se sabe si cambió el
// criterio o cambió el código. Cada veredicto se guarda con la versión
// que lo produjo.
//
// ALGO_REV se sube A MANO cuando cambia el CÓDIGO. La huella de abajo
// sólo ve los PARÁMETROS: si retoco un umbral se mueve sola, pero no
// puede enterarse de que he reescrito una función. Esa parte depende de
// que yo la suba, y conviene desconfiar.
// ------------------------------------------------------------
const ALGO_REV = 9;

// Sólo lo que NO toca el laboratorio. Vueltas, trazo, curvatura,
// esquinas y extremos son mandos: cambiarlos no hace otra versión del
// algoritmo, hace otra obra — y ya se guardan como rasgos, que es donde
// sirven para buscar el patrón. Si contaran aquí, mover un slider
// invalidaría todos los veredictos anteriores y el aviso de versión
// saltaría siempre, hasta dejar de significar nada.
const PARAMS_QUE_CUENTAN = [
  "vueltaGiro","vueltaEscala","widthMin","widthMax",
  "cabo","caboMargen","cruceMinDeg","cruceSepMin","remateMin","segMinRatio","volteoMax","reintentos","densidad",
  "grosorMinimo","gapAbs","holguraMin","avoidRatio","minSegRatio","minTurnDeg",
  "salidaMax","margen","pad","miterLimit","anchorJitter"
];

function algoVersion(cfg) {
  const base = cfg || DEF;
  let h = 2166136261;
  for (const k of PARAMS_QUE_CUENTAN) {
    const s = k + "=" + base[k];
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  }
  return "r" + ALGO_REV + "." + (h >>> 0).toString(36).slice(0, 5);
}

// ------------------------------------------------------------
// ROLES DE COLOR
// Las paletas de hoks no declaran fondo ni tinta: son listas planas.
// El reparto se decide por luminancia — fondo en un extremo, cinta
// con el mayor contraste contra él, disco con el contraste que quede.
// ------------------------------------------------------------
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

// Peso por edad, igual que el motor de hoks: lo reciente pesa más.
function ageWeight(created) {
  if (!created || created < 1e12) return 4;
  const d = (Date.now() - created) / 86400000;
  return d < 30 ? 4 : d < 90 ? 2 : d < 180 ? 1 : d < 365 ? 0.4 : 0.15;
}

// Elección ponderada entre las paletas ACTIVAS, con el RNG sembrado: la
// paleta forma parte de la obra, así que tiene que salir del seed y no
// del momento en que se pulsa el botón.
// Devuelve la paleta ENTERA, no sólo los colores: el nombre es un rasgo
// de la obra y el triaje lo necesita para poder decir "descartas las
// Mondrian". Perdiéndolo aquí, ese patrón no se puede ni buscar.
function elegirPaleta(paletas) {
  const act = paletas.filter(p => p.active !== false && p.colors && p.colors.length >= 2);
  if (!act.length) return null;
  const w = act.map(p => ageWeight(p.created));
  const total = w.reduce((a, b) => a + b, 0);
  let r = random(total);
  for (let i = 0; i < act.length; i++) { r -= w[i]; if (r <= 0) return act[i]; }
  return act[act.length - 1];
}

function pickRoles(colors) {
  const cols = colors.slice().sort((a, b) => lum(a) - lum(b));
  if (cols.length < 2) return { bg: cols[0] || BG, fg: FG, fg2: FG2, dot: DOT };

  // fondo: uno de los dos extremos. El oscuro pesa más — es la
  // dirección en la que esta obra respira mejor.
  const oscuro = random() < 0.68;
  const bg = oscuro ? cols[0] : cols[cols.length - 1];
  const resto = cols.filter(c => c !== bg);

  const porContraste = resto.slice().sort((a, b) => abs(lum(b) - lum(bg)) - abs(lum(a) - lum(bg)));
  const fg = porContraste[0];

  // el disco quiere separarse del fondo Y de la cinta
  const dot = porContraste.length > 1
    ? porContraste.slice(1).sort((a, b) =>
        (abs(lum(b)-lum(bg)) + abs(lum(b)-lum(fg))) - (abs(lum(a)-lum(bg)) + abs(lum(a)-lum(fg))))[0]
    : mixHex(fg, oscuro ? '#ffffff' : '#000000', 0.55);

  // segundo extremo del gradiente: otro color de la paleta si lo hay,
  // y si no, la propia tinta desplazada hacia el fondo.
  const otros = porContraste.filter(c => c !== fg && c !== dot);
  const fg2 = otros.length ? otros[0] : mixHex(fg, bg, 0.42);

  // Los discos NO comparten un solo color: son el contrapunto, y en
  // una paleta como Mondrian el negro sobre crema casi no se ve. Se
  // quedan con todo lo que no es fondo ni cinta, por contraste.
  let dots = porContraste.filter(c => c !== fg);
  if (!dots.length) dots = [mixHex(fg, oscuro ? '#ffffff' : '#000000', 0.55)];

  return { bg, fg, fg2, dot, dots };
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
  remateMin:    1.0,         // holgura mínima del arranque y el final frente a la huella de un cruce
  segMinRatio:  0.85,        // tramo más corto admisible, × anchura (por debajo la cinta se pliega)
  volteoMax:    0.34,        // volteos por cruce que se toleran
  reintentos:   10,           // tejidos alternativos que se prueban con el mismo seed
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
  corner:       "rectas",    // curvas | rectas
  ends:         "rectos",    // redondos | rectos
  tinta:        "solido",    // solido | gradiente
  juntaSolape:  0.05,        // alargue en las juntas internas, × anchura
  punzonExtra:  0.35,        // recorrido extra del punzón más allá del cruce, × anchura         // longitud del punzón en cada cruce, × anchura
  curva:        0,           // 0 esquina viva ... 1 curva plena
  miterLimit:   1.0,         // el pico de inglete es tinta FUERA de la banda: no existe         // por encima, el pico del halo raja la hebra vecina

  paletas:      null,        // lista completa; si no se fija una, se elige por peso
  dots:         "bajo",      // no | bajo | encima
  dotsMin:      3,
  dotsMax:      5,
  dotRMin:      0.55,        // radio, × anchura de cinta — tamaños distintos
  dotRMax:      1.35,
  dotClear:     0.30,        // aire entre disco y cinta, × anchura
  dotGrid:      56,          // resolución del mapa de vacíos
  dotSpread:    5.2,         // separación entre discos, × radio — que ocupen vacíos distintos
  dotTope:      2.4,         // a partir de aquí un hueco ya es "bastante grande", × anchura
  weave:        false,
  vibration:    false,
  vibrationFactor: 0.22
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

// ------------------------------------------------------------
// GENERAR (todo lo aleatorio ocurre aquí, con seed)
// ------------------------------------------------------------
function generate(seed, cfg) {
  cfg = Object.assign({}, DEF, cfg || {});
  randomSeed(seed);
  noiseSeed(seed);

  const pal = cfg.palette ? { colors: cfg.palette, name: cfg.paletteName || "(fija)" }
            : (cfg.paletas && elegirPaleta(cfg.paletas)) || { colors: PALETA_BASE, name: "base" };
  const colores = pickRoles(pal.colors);
  colores.nombre = pal.name;
  const family = random(FAMILY_NAMES);
  const pedidas = floor(random(cfg.vueltasMin, cfg.vueltasMax + 1));

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

  const puntua = (t) => t.conserva >= cfg.grosorMinimo
                     && t.ang.grados >= cfg.cruceMinDeg
                     && t.ciclos === 0
                     && t.atasco === 0
                     && t.remate >= cfg.remateMin
                     && t.seg >= cfg.segMinRatio
                     && t.volteos <= cfg.volteoMax
                     && t.sep >= cfg.cruceSepMin;

  for (let k = 0; k <= cfg.reintentos; k++) {
    for (let v = pedidas; v >= cfg.vueltasMin; v--) {
      randomSeed(seed ^ 0xA17E ^ (k * 0x9E3779B1));
      noiseSeed(seed ^ (k * 7));
      const t = tejer(family, v, cfg);
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
      t.puertas = puertasQueFalla(t);

      if (!intento) { intento = t; vueltas = v; continue; }
      const pasa = puntua(t), pasaba = puntua(intento);
      let gana;
      if (pasa !== pasaba) gana = pasa;
      // entre dos que pasan: el más entrelazado, si se quiere conservar trama
      // entre dos que pasan: menos volteos manda sobre más trama, porque
      // la trama no se lee si el tejido no alterna
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

  const { nodes, width } = intento;
  const points = nodes.map(n => n.p);
  const { cuts, order, depth, cruces, plano, crossings } = intento.nudo;


  return { seed, family, vueltas, pedidas, sep: intento.sep, remate: intento.remate, seg: intento.seg, points, cuts, order, depth, cruces, plano, crossings, ciclos: intento.ciclos, width, colores, cfg };
}

// ------------------------------------------------------------
// TEJER — un intento completo con un nº de vueltas dado
// ------------------------------------------------------------
function tejer(family, vueltas, cfg) {
  const spec = FAMILIES[family];
  const anchura = cfg.widthOfSeg || ANCHOS[cfg.trazo] || ANCHOS.estandar;

  // El esqueleto se recorre varias veces, cada pasada girada y
  // encogida. La cinta vuelve a entrar en el marco y se cruza con lo
  // que ya dejó escrito. De ahí sale la trama.
  const centro = createVector(0.5, 0.5);
  let anchors = [];
  for (let t = 0; t < vueltas; t++) {
    const ang = t * cfg.vueltaGiro * TWO_PI + random(-0.25, 0.25);
    const esc = pow(cfg.vueltaEscala, t);
    let pass = spec.anchors.map(a => {
      const p = createVector(a[0] - centro.x, a[1] - centro.y).mult(esc);
      return createVector(
        centro.x + p.x * cos(ang) - p.y * sin(ang),
        centro.y + p.x * sin(ang) + p.y * cos(ang)
      );
    });
    if (t % 2 === 1) pass.reverse();   // enlace natural entre pasadas
    anchors = anchors.concat(pass);
  }

  const j = cfg.anchorJitter;
  for (const p of anchors) { p.x += random(-j, j); p.y += random(-j, j); }
  if (random() < 0.5)  for (const p of anchors) p.x = 1 - p.x;
  if (random() < 0.35) for (const p of anchors) p.y = 1 - p.y;

  // los anchors son intocables, los insertados son material blando
  let nodes = buildPath(anchors, anchors.length + floor(random(2, 7)), cfg);

  // La extensión declarada vale para UNA pasada. Cada vuelta añade
  // recorrido dentro del mismo marco y necesita más campo.
  nodes = fitToExtent(nodes, min(0.98, spec.extent + 0.12 * (vueltas - 1)), cfg);
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

  return { nodes, width, deseada, conserva: admitida / deseada };
}

// ------------------------------------------------------------
// CAMINO: curvatura COHERENTE por tramo (un arco, no un temblor)
// ------------------------------------------------------------
function buildPath(anchors, targetCount, cfg) {
  const segCount = anchors.length - 1;
  const extra = max(0, targetCount - anchors.length);
  const per = new Array(segCount).fill(0);
  for (let i = 0; i < extra; i++) per[floor(random(segCount))]++;

  const out = [];
  for (let s = 0; s < segCount; s++) {
    const a = anchors[s].copy();
    const b = anchors[s + 1].copy();
    if (s === 0) out.push({ p: a.copy(), anchor: true });

    const n = per[s];
    if (n > 0) {
      const dir = p5.Vector.sub(b, a);
      const normal = createVector(-dir.y, dir.x);
      if (normal.magSq() > 0) normal.normalize();
      const bend = random(-cfg.bendMax, cfg.bendMax);   // UN gesto por tramo
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        const p = p5.Vector.lerp(a, b, t);
        p.add(p5.Vector.mult(normal, bend * sin(t * PI)));
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
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const n of nodes) { minX=min(minX,n.p.x); minY=min(minY,n.p.y); maxX=max(maxX,n.p.x); maxY=max(maxY,n.p.y); }
  const bw = max(maxX-minX, 1e-6), bh = max(maxY-minY, 1e-6);
  const s = extent / max(bw, bh);

  // recolocar: centrado + desplazamiento seeded dentro del margen libre
  const newW = bw * s, newH = bh * s;
  const freeX = max(0, 1 - newW) / 2, freeY = max(0, 1 - newH) / 2;
  const ox = freeX + random(-freeX, freeX) * cfg.placeJitter;
  const oy = freeY + random(-freeY, freeY) * cfg.placeJitter;

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
  for (let i = 0; i < nodes.length - 1; i++) l.push(p5.Vector.dist(nodes[i].p, nodes[i+1].p));
  if (!l.length) return 0.2;
  l.sort((a, b) => a - b);
  return l[floor((l.length - 1) * q)];
}

function medianSeg(nodes) {
  const l = [];
  for (let i = 0; i < nodes.length - 1; i++) l.push(p5.Vector.dist(nodes[i].p, nodes[i+1].p));
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
      if (p5.Vector.dist(nodes[i].p, nodes[i+1].p) < minSeg) {
        const drop = !nodes[i+1].anchor ? i+1 : (!nodes[i].anchor ? i : -1);
        if (drop >= 0) { nodes.splice(drop, 1); changed = true; break; }
      }
    }
    if (changed) continue;

    for (let i = 1; i < nodes.length - 1 && nodes.length > 4; i++) {
      if (nodes[i].anchor) continue;
      const a = p5.Vector.sub(nodes[i-1].p, nodes[i].p);
      const b = p5.Vector.sub(nodes[i+1].p, nodes[i].p);
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
      const a = p5.Vector.sub(nodes[i-1].p, nodes[i].p);
      const b = p5.Vector.sub(nodes[i+1].p, nodes[i].p);
      if (!a.magSq() || !b.magSq()) continue;
      const ang = abs(a.angleBetween(b));
      if (ang < worstAng) { worstAng = ang; worst = i; }
    }
    if (worst < 0) break;

    const i = worst;
    const mid = p5.Vector.lerp(nodes[i-1].p, nodes[i+1].p, 0.5);
    // los anchors ceden menos: son la identidad de la familia
    const k = nodes[i].anchor ? 0.18 : 0.32;
    nodes[i].p = p5.Vector.lerp(nodes[i].p, mid, k);
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

  const avail = 1 - m * 2;
  const s = min(1, avail / max(maxX-minX, 1e-9), avail / max(maxY-minY, 1e-9));
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
  const dx = 0.5 - (minX + maxX) / 2;
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
    const d = p5.Vector.sub(nodes[fin].p, nodes[vecino].p);
    if (d.magSq() === 0) continue;
    d.normalize();
    const fuera = createVector(nodes[fin].p.x - cx, nodes[fin].p.y - cy);
    if (fuera.magSq() === 0 || p5.Vector.dot(d, fuera.normalize()) <= 0.1) continue;
    nodes[fin].p.add(p5.Vector.mult(d, tope));
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
      const u = p5.Vector.sub(b, a), v = p5.Vector.sub(d, c);
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
  for (let i = 0; i < nodes.length - 1; i++)
    d = min(d, p5.Vector.dist(nodes[i].p, nodes[i+1].p));
  return d === Infinity ? 0 : d;
}

function sepCruces(nodes) {
  const P = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 2; j < nodes.length - 1; j++) {
      const q = segParams(nodes[i].p, nodes[i+1].p, nodes[j].p, nodes[j+1].p);
      if (q) P.push(p5.Vector.lerp(nodes[i].p, nodes[i+1].p, q.t));
    }
  }
  let m = Infinity;
  for (let a = 0; a < P.length; a++)
    for (let b = a + 1; b < P.length; b++) m = min(m, p5.Vector.dist(P[a], P[b]));
  return m === Infinity ? 99 : m;
}

// Distancia mínima real entre hebras que NO se cruzan. Los cruces se
// excluyen: ahí el solape es la obra, no el defecto.
function holguraReal(nodes) {
  let d = Infinity;
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 2; j < nodes.length - 1; j++) {
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
    for (let j = i + 2; j < last; j++) {
      const r = segParams(points[i], points[i+1], points[j], points[j+1]);
      if (r) X.push({ a: i + r.t, b: j + r.u });
    }
  }

  if (!X.length) {
    return { cuts: [{ startSeg: 0, startT: 0, endSeg: last - 1, endT: 1 }], order: [0], depth: [0], cruces: [], plano: { secciones: [[0, last]], orden: [0], ciclos: 0, atasco: 0, juntas: [], volteados: 0 }, crossings: 0, remate: Infinity };
  }

  const visits = [];
  X.forEach((x, k) => { visits.push({ s: x.a, k }, { s: x.b, k }); });
  visits.sort((p, q) => p.s - q.s);
  visits.forEach((v, i) => { v.over = i % 2 === 0; });

  const first = {};
  for (const v of visits) {
    if (first[v.k] === undefined) first[v.k] = v.over;
    else v.over = !first[v.k];          // el cruce necesita un arriba y un abajo
  }

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
  const plano = planoDeSecciones(last, cruces, points, width);

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
    return p5.Vector.sub(points[i+1], points[i]).normalize();
  };
  const zonas = [];
  for (const c of cruces) {
    const sen = max(abs(sin(dir(c.abajo).angleBetween(dir(c.arriba)))), 0.18);
    const r = (width / 2) / sen * 1.20;
    zonas.push({ d: arcoDeParam(points, acum, c.arriba), r });
    zonas.push({ d: arcoDeParam(points, acum, c.abajo),  r });
  }
  return { acum, zonas, total: acum[acum.length - 1] };
}

function huellasDeCruces(points, cruces, width) {
  const { acum, zonas } = zonasDeCruces(points, cruces, width);
  return (s) => {
    const d = arcoDeParam(points, acum, s);
    return zonas.some(z => abs(d - z.d) < z.r);
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
  let peor = Infinity;
  for (const z of zonas) {
    peor = min(peor, z.d / z.r);              // contra el arranque
    peor = min(peor, (total - z.d) / z.r);    // contra el final
  }
  return peor;
}

function planoDeSecciones(last, cruces, points, width) {
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
  const extra = new Set();
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

    const k = plan.culpable;
    const c = cr[k];
    const t = c.arriba; c.arriba = c.abajo; c.abajo = t;
    veces[k]++; volteados++;
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
  let culpable = -1;
  if (orden.length < secciones.length) {
    const estado = secciones.map(() => 0);   // 0 sin ver, 1 en curso, 2 cerrado
    const salida = (i) => {
      estado[i] = 1;
      for (const e of aristas) {
        if (e.de !== i) continue;
        if (estado[e.a] === 1) return e.k;             // arista de retorno
        if (estado[e.a] === 0) { const r = salida(e.a); if (r >= 0) return r; }
      }
      estado[i] = 2;
      return -1;
    };
    for (let i = 0; i < secciones.length && culpable < 0; i++)
      if (estado[i] === 0) culpable = salida(i);

    const dentro = new Set(orden);
    secciones.forEach((_, i) => { if (!dentro.has(i)) orden.push(i); });
  }

  // Los cruces imposibles se atienden ANTES que los ciclos: un ciclo
  // sólo desordena, esto directamente no se puede dibujar.
  return { secciones, orden, culpable, imposible };
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
  const at = (seg, t) => p5.Vector.lerp(mapped[seg], mapped[seg + 1], t);
  const out = [at(cut.startSeg, cut.startT)];
  for (let i = cut.startSeg + 1; i <= cut.endSeg; i++) out.push(mapped[i].copy());
  out.push(at(cut.endSeg, cut.endT));
  return out.filter((p, i) => i === 0 || p5.Vector.dist(p, out[i-1]) > 0.0001);
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const k = floor(random(i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
  return a;
}

// ------------------------------------------------------------
// MAPEO: transformación FIJA (la extensión ya la fijó la familia)
// ------------------------------------------------------------
function mapToSquare(pts, ox, oy, S, cfg) {
  const p0 = cfg.pad, span = 1 - p0 * 2;
  return pts.map(p => createVector(ox + (p0 + p.x * span) * S, oy + (p0 + p.y * span) * S));
}

// ------------------------------------------------------------
// DIBUJO
// ------------------------------------------------------------
function renderComposition(ctx, ox, oy, S, comp) {
  const cfg = comp.cfg;
  const col = comp.colores;
  const width = comp.width * S * (1 - cfg.pad * 2);
  const gap = cfg.gapAbs * S * (1 - cfg.pad * 2);

  ctx.fillStyle = col.bg;
  ctx.fillRect(ox, oy, S, S);

  let mapped = mapToSquare(comp.points, ox, oy, S, cfg);
  if (cfg.vibration) mapped = applyVibration(mapped, comp.seed, width, cfg);

  const tinta = cfg.tinta === "gradiente" ? makeGradient(ctx, mapped, comp) : col.fg;

  if (cfg.dots === "bajo") drawDots(ctx, mapped, width, comp, ox, oy, S);

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
    return p5.Vector.sub(mapped[i+1], mapped[i]).normalize();
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
  const pizca = max(1, width * 0.15);

  for (const i of orden) {
    const [a, b] = secciones[i];
    const aJ = a > 0 && esJunta(a), bJ = b < total && esJunta(b);

    const iniC = max(0, a > 0 ? a - (aJ ? pizca : caboEn(a)) : a);
    const finC = min(total, b < total ? b + (bJ ? pizca : caboEn(b)) : b);
    const iniH = max(0, a > 0 && !aJ ? a - caboEn(a) : a);
    const finH = min(total, b < total && !bJ ? b + caboEn(b) : b);

    if (gap > 0) trazarTramo(ctx, mapped, acum, iniH, finH, width + gap * 2, col.bg, cfg, "round");
    trazarTramo(ctx, mapped, acum, iniC, finC, width, tinta, cfg);
  }


  if (cfg.ends === "redondos") {
    ctx.fillStyle = tinta;
    for (const c of [mapped[0], mapped[mapped.length - 1]]) {
      ctx.beginPath(); ctx.arc(c.x, c.y, width / 2, 0, TWO_PI); ctx.fill();
    }
  }

  if (cfg.dots === "encima") drawDots(ctx, mapped, width, comp, ox, oy, S);

  return { mapped, width };
}

// El gradiente recorre la composición, no la sección de la cinta:
// da atmósfera sin fingir volumen. La profundidad sigue viniendo
// solo del orden de dibujo.
function makeGradient(ctx, mapped, comp) {
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  for (const p of mapped) { minX=min(minX,p.x); minY=min(minY,p.y); maxX=max(maxX,p.x); maxY=max(maxY,p.y); }
  randomSeed(comp.seed ^ 0x5EED);
  const ang = random(TWO_PI);
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
function drawDots(ctx, mapped, width, comp, ox, oy, S) {
  const cfg = comp.cfg;
  randomSeed(comp.seed ^ 0xD075);

  const radios = [];
  for (let i = 0; i < cfg.dotsMax; i++) radios.push(width * random(cfg.dotRMin, cfg.dotRMax));
  const r = max(...radios);   // el hueco se reserva para el mayor
  const need = r + width * (0.5 + cfg.dotClear) + cfg.gapAbs * S;
  const borde = r + cfg.margen * S;
  const N = cfg.dotGrid;

  // mapa de vacíos: distancia de cada celda del campo a la cinta
  const huecos = [];
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      const p = createVector(ox + (gx + 0.5) * S / N, oy + (gy + 0.5) * S / N);
      if (p.x < ox + borde || p.x > ox + S - borde) continue;
      if (p.y < oy + borde || p.y > oy + S - borde) continue;
      let d = Infinity;
      for (let i = 0; i < mapped.length - 1; i++) d = min(d, pointSegDist(p, mapped[i], mapped[i+1]));
      if (d >= need) huecos.push({ p, d });
    }
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

  const count = floor(random(cfg.dotsMin, cfg.dotsMax + 1));
  const placed = [];
  for (const h of huecos) {
    if (placed.length >= count) break;
    let ok = true;
    for (const q of placed) if (p5.Vector.dist(h.p, q) < r * cfg.dotSpread) ok = false;
    if (ok) placed.push(h.p);
  }

  const gama = comp.colores.dots;
  placed.forEach((p, i) => {
    ctx.fillStyle = gama[i % gama.length];
    ctx.beginPath(); ctx.arc(p.x, p.y, radios[i % radios.length], 0, TWO_PI); ctx.fill();
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
    const d = p5.Vector.sub(out[0], out[1]);
    const l = d.mag();
    if (l > 0) out[0].add(d.normalize().mult(constrain(ini, -l * 0.85, l * 0.9)));
  }
  if (fin !== 0) {
    const n = out.length - 1;
    const d = p5.Vector.sub(out[n], out[n-1]);
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
  for (let i = 1; i < mapped.length; i++) a.push(a[i-1] + p5.Vector.dist(mapped[i-1], mapped[i]));
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
  return p5.Vector.lerp(mapped[i], mapped[i+1], (d - acum[i]) / tramo);
}

// Ángulo entre las dos hebras que se cruzan: en un cruce oblicuo el
// hueco tiene que ser más largo para tapar el mismo ancho de cinta.
function anguloCruce(mapped, sA, sB) {
  const dir = (s) => {
    const i = constrain(floor(s), 0, mapped.length - 2);
    return p5.Vector.sub(mapped[i+1], mapped[i]).normalize();
  };
  return dir(sA).angleBetween(dir(sB));
}

// Un tramo de cinta entre dos distancias, con sus vértices intactos.
function trazarTramo(ctx, mapped, acum, a, b, w, paint, cfg, junta) {
  if (b - a < 1e-6) return;
  const pts = [puntoEnArco(mapped, acum, a)];
  for (let i = 0; i < acum.length; i++) if (acum[i] > a && acum[i] < b) pts.push(mapped[i].copy());
  pts.push(puntoEnArco(mapped, acum, b));
  if (pts.length >= 2) strokePath(ctx, pts, w, paint, cfg, junta);
}

function tramoDePath(mapped, s, radio) {
  const punto = (t) => {
    const i = constrain(floor(t), 0, mapped.length - 2);
    return p5.Vector.lerp(mapped[i], mapped[i+1], constrain(t - i, 0, 1));
  };
  const centro = punto(s);

  const lado = (paso) => {
    const out = [];
    let t = s, acum = 0, prev = centro;
    while (acum < radio) {
      const sig = paso > 0 ? min(floor(t) + 1, mapped.length - 1) : max(ceil(t) - 1, 0);
      if (sig === t) break;
      const p = punto(sig);
      const d = p5.Vector.dist(prev, p);
      if (acum + d >= radio) {
        out.push(p5.Vector.lerp(prev, p, (radio - acum) / max(d, 1e-6)));
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
      const r = k * 0.5 * min(p5.Vector.dist(a, v), p5.Vector.dist(v, b));
      const ent = p5.Vector.lerp(v, a, r / max(p5.Vector.dist(a, v), 1e-6));
      const sal = p5.Vector.lerp(v, b, r / max(p5.Vector.dist(v, b), 1e-6));
      ctx.lineTo(ent.x, ent.y);
      ctx.quadraticCurveTo(v.x, v.y, sal.x, sal.y);
    }
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
  }
  ctx.strokeStyle = paint;
  ctx.lineWidth = w;
  ctx.lineJoin = junta || (cfg.corner === "curvas" ? "round" : "miter");
  ctx.miterLimit = cfg.miterLimit;
  ctx.lineCap = "butt";
  ctx.stroke();
  ctx.restore();
}

function applyVibration(pts, seedValue, width, cfg) {
  const amp = width * cfg.vibrationFactor;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i].copy();
    if (i === 0 || i === pts.length - 1) { out.push(p); continue; }
    const dir = p5.Vector.sub(pts[i+1], pts[i-1]);
    if (dir.magSq() === 0) { out.push(p); continue; }
    const normal = createVector(-dir.y, dir.x).normalize();
    const nv = (noise(i * 0.55) - 0.5) * 2;   // solo ruido coherente
    p.add(normal.mult(nv * amp));
    out.push(p);
  }
  return out;
}

// ------------------------------------------------------------
// MEDIR (no filtrar). Esto alimenta el triaje por lotes.
// ------------------------------------------------------------
function measure(mapped, width, S) {
  let crossings = 0, minGap = Infinity, minSeg = Infinity, minTurn = 180;

  for (let i = 0; i < mapped.length - 1; i++) {
    minSeg = min(minSeg, p5.Vector.dist(mapped[i], mapped[i+1]));
    for (let j = i + 2; j < mapped.length - 1; j++) {
      if (segIntersect(mapped[i], mapped[i+1], mapped[j], mapped[j+1])) crossings++;
      else minGap = min(minGap, segDist(mapped[i], mapped[i+1], mapped[j], mapped[j+1]));
    }
  }
  for (let i = 1; i < mapped.length - 1; i++) {
    const a = p5.Vector.sub(mapped[i-1], mapped[i]);
    const b = p5.Vector.sub(mapped[i+1], mapped[i]);
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

  let best = _pmp[0], bd = Infinity;
  for (const par of _pmp) {
    const dx = par[1].x - par[0].x, dy = par[1].y - par[0].y;
    const v = Math.sqrt(dx*dx + dy*dy);   // p5.Vector.dist = sqrt(magSq)
    if (v < bd) { bd = v; best = par; }
  }
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
  return createVector(v.x, v.y);
}

function segDist(a, b, c, d) {
  return min(min(pointSegDist(a,c,d), pointSegDist(b,c,d)),
             min(pointSegDist(c,a,b), pointSegDist(d,a,b)));
}

// ============================================================
// TRIAJE POR LOTES
// No se filtra mientras se genera. Se genera un lote entero, se
// descarta a mano y el sistema saca el patrón del descarte.
//
// La regla que hace que esto sirva de algo: cada veredicto se guarda
// con TODOS los rasgos medidos Y con la versión del algoritmo. Sin la
// versión, un "perfecta" de hace tres iteraciones miente.
// ============================================================

const TRIAJE_KEY = "iterations2.veredictos.v1";

// Cada obra del lote se deriva del seed del lote: un lote es
// reproducible con un solo número.
function seedsDeLote(loteSeed, n) {
  const s = [];
  for (let i = 0; i < n; i++) s.push((loteSeed + i * 0x9E3779B1) >>> 0);
  return s;
}

// Los rasgos que se guardan con el veredicto. Todo lo que el sistema
// sabe de la obra, medido, no interpretado. Si un patrón existe, tiene
// que poder salir de aquí.
function rasgosDe(comp, med) {
  const p = comp.plano || {};
  return {
    familia:   comp.family,
    paleta:    comp.colores.nombre || "?",
    vueltas:   comp.vueltas,
    pedidas:   comp.pedidas,
    trazo:     comp.cfg.trazo,
    curva:     comp.cfg.curva,
    esquinas:  comp.cfg.corner,
    vertices:  comp.points.length,
    cruces:    comp.crossings,
    secciones: (p.secciones || []).length,
    volteados: p.volteados || 0,
    juntas:    (p.juntas || []).length,
    sep:       +comp.sep.toFixed(3),
    anchura:   +comp.width.toFixed(4),
    gapW:      +med.gapW.toFixed(3),
    segW:      +med.segW.toFixed(3),
    giro:      +med.turn.toFixed(1),
    ocupacion: +med.fill.toFixed(3),
    discos:    comp.cfg.dots === "no" ? 0 : comp.cfg.dotsMax
  };
}

const RASGOS_NUM = ["vueltas","vertices","cruces","secciones","volteados","juntas",
                    "sep","anchura","gapW","segW","giro","ocupacion","curva","discos"];
const RASGOS_CAT = ["familia","paleta","trazo","esquinas"];

// ------------------------------------------------------------
// ALMACÉN
// ------------------------------------------------------------
function veredictosLeer() {
  try { return JSON.parse(localStorage.getItem(TRIAJE_KEY)) || []; }
  catch (e) { return []; }
}

function veredictosGuardar(arr) {
  try { localStorage.setItem(TRIAJE_KEY, JSON.stringify(arr)); } catch (e) {}
}

// Un seed sólo puede tener un veredicto POR VERSIÓN: si cambia el
// algoritmo la obra es otra y merece que la vuelvas a juzgar.
function veredictoPoner(seed, fallo, rasgos, version) {
  const arr = veredictosLeer();
  const i = arr.findIndex(v => v.seed === seed && v.version === version);
  const rec = { seed, fallo, version, rasgos };
  if (i >= 0) arr[i] = rec; else arr.push(rec);
  veredictosGuardar(arr);
  return arr;
}

// ------------------------------------------------------------
// EL PATRÓN
// Por cada rasgo se busca el corte que mejor separa lo descartado de lo
// aprobado. No se afina nada: se enseña, y decides tú si el patrón es
// tuyo o es ruido.
// ------------------------------------------------------------
// Cuánto se ordena el lote al partirlo por aquí. Se mide con Gini y no
// con "diferencia de porcentaje × apoyo": ese premiaba los cortes
// EQUILIBRADOS por encima de los LIMPIOS, y con la regla de prueba
// "fuera si cruces<=3" sacaba el corte en 2.5 (14/14 y 5/10) en vez del
// de 3.5, que separa perfecto. El corte que buscas es el que no deja
// mezcla, no el que reparte el lote en dos mitades.
function gini(n, malas) {
  if (!n) return 0;
  const p = malas / n;
  return 2 * p * (1 - p);
}

function ganancia(nb, mb, na, ma) {
  const n = nb + na;
  const padre = gini(n, mb + ma);
  return padre - (nb / n) * gini(nb, mb) - (na / n) * gini(na, ma);
}

function patronDeDescartes(regs) {
  const usa = regs.filter(v => v.fallo === "si" || v.fallo === "no");
  const malas = usa.filter(v => v.fallo === "si").length;
  const base = usa.length ? malas / usa.length : 0;
  const hallazgos = [];

  // El apoyo mínimo de cada lado. Con menos, cualquier cosa "separa".
  const MIN = 3;

  for (const r of RASGOS_NUM) {
    const vals = usa.map(v => v.rasgos[r]).filter(x => typeof x === "number" && isFinite(x));
    if (vals.length < usa.length || new Set(vals).size < 2) continue;
    const cortes = Array.from(new Set(vals)).sort((a, b) => a - b);
    let mejor = null;
    for (let i = 0; i < cortes.length - 1; i++) {
      const t = (cortes[i] + cortes[i+1]) / 2;
      const bajo = usa.filter(v => v.rasgos[r] <= t);
      const alto = usa.filter(v => v.rasgos[r] > t);
      if (bajo.length < MIN || alto.length < MIN) continue;
      const mb = bajo.filter(v => v.fallo === "si").length;
      const ma = alto.filter(v => v.fallo === "si").length;
      const pb = mb / bajo.length, pa = ma / alto.length;
      const fuerza = ganancia(bajo.length, mb, alto.length, ma);
      if (!mejor || fuerza > mejor.fuerza)
        mejor = { rasgo: r, corte: t, fuerza, salto: abs(pb - pa),
                  bajo: { n: bajo.length, malas: bajo.filter(v => v.fallo === "si").length },
                  alto: { n: alto.length, malas: alto.filter(v => v.fallo === "si").length },
                  lado: pb > pa ? "bajo" : "alto" };
    }
    if (mejor) hallazgos.push(mejor);
  }

  for (const r of RASGOS_CAT) {
    const grupos = {};
    for (const v of usa) {
      const k = String(v.rasgos[r]);
      (grupos[k] = grupos[k] || []).push(v);
    }
    if (Object.keys(grupos).length < 2) continue;
    for (const [k, g] of Object.entries(grupos)) {
      if (g.length < MIN) continue;
      const resto = usa.filter(v => String(v.rasgos[r]) !== k);
      if (resto.length < MIN) continue;
      const mg = g.filter(v => v.fallo === "si").length;
      const mr = resto.filter(v => v.fallo === "si").length;
      const pg = mg / g.length, pr = mr / resto.length;
      hallazgos.push({ rasgo: r, valor: k,
                       fuerza: ganancia(g.length, mg, resto.length, mr),
                       salto: abs(pg - pr),
                       grupo: { n: g.length, malas: g.filter(v => v.fallo === "si").length },
                       resto: { n: resto.length, malas: resto.filter(v => v.fallo === "si").length },
                       lado: pg > pr ? "este" : "otros" });
    }
  }

  hallazgos.sort((a, b) => b.fuerza - a.fuerza);
  return { n: usa.length, malas, base, hallazgos,
           versiones: cuentaVersiones(regs), dudas: regs.filter(v => v.fallo === "duda").length };
}

function cuentaVersiones(regs) {
  const c = {};
  for (const v of regs) c[v.version] = (c[v.version] || 0) + 1;
  return c;
}

// El informe en palabras. Un patrón sostenido por dos descartes no es un
// patrón: se dice, no se disimula.
function patronEnTexto(p, versionActual) {
  const L = [];
  L.push(`${p.n} veredictos · ${p.malas} descartadas (${(100*p.base).toFixed(0)}%)` +
         (p.dudas ? ` · ${p.dudas} en duda (no cuentan)` : ""));

  const vs = Object.entries(p.versiones).sort((a, b) => b[1] - a[1]);
  const otras = vs.filter(([v]) => v !== versionActual).reduce((a, x) => a + x[1], 0);
  if (otras) L.push(`OJO: ${otras} de otras versiones del algoritmo. Esas obras ya no salen igual.`);

  if (p.malas < 3) { L.push("Aún no hay descartes suficientes para hablar de patrón."); return L; }

  L.push("");
  const top = p.hallazgos.filter(h => h.salto >= 0.25).slice(0, 4);
  if (!top.length) { L.push("Ningún rasgo medido separa lo que descartas. El motivo no está en lo que mido."); return L; }

  for (const h of top) {
    if (h.valor !== undefined) {
      const g = h.lado === "este" ? h.grupo : h.resto;
      const o = h.lado === "este" ? h.resto : h.grupo;
      L.push(`${h.rasgo} = ${h.valor}: descartas ${h.grupo.malas}/${h.grupo.n}, ` +
             `frente a ${h.resto.malas}/${h.resto.n} en el resto.`);
    } else {
      const c = h.corte < 10 ? h.corte.toFixed(2) : h.corte.toFixed(0);
      L.push(`${h.rasgo}: por debajo de ${c} descartas ${h.bajo.malas}/${h.bajo.n}; ` +
             `por encima ${h.alto.malas}/${h.alto.n}.`);
    }
    // El aviso va por CUÁNTAS OBRAS sostienen cada lado, no por cuántos
    // descartes. Un corte que separa 19/19 contra 0/5 no es débil por
    // tener cero descartes arriba: eso es la señal más limpia que hay.
    // Es débil si uno de los lados lo forman cuatro obras.
    const lados = h.valor !== undefined
      ? min(h.grupo.n, h.resto.n)
      : min(h.bajo.n, h.alto.n);
    if (lados < 5) L[L.length-1] += `  (sólo ${lados} obras en un lado — puede ser ruido)`;
  }

  const nada = RASGOS_NUM.concat(RASGOS_CAT)
    .filter(r => !p.hallazgos.some(h => h.rasgo === r && h.salto >= 0.25));
  if (nada.length) { L.push(""); L.push("Sin señal: " + nada.join(", ") + "."); }
  return L;
}

// ============================================================
// LABORATORIO — p5 / OpenProcessing
// La obra se pinta en un buffer CUADRADO aparte. El PNG que
// guardas es ese buffer, no el lienzo con la UI encima.
// ============================================================

const ART = 1000;              // resolución interna de la obra
const CANVAS_W = 1360;
const CANVAS_H = 900;
const PANEL_W = 300;

let art;                       // p5.Graphics de la obra
let ui = {};
let seed = 1;
let comp = null;
let metrics = null;
let hoja = false;              // hoja de contactos
const HOJA_N = 12, HOJA_COLS = 4;

// --- triaje por lotes ---
let modo = "libre";            // libre | triaje | patron
let lote = null;               // { seed, seeds, i }
const LOTE_N = 24;

let PALETAS = [
  { name: "Iterations",  colors: ["#24358F", "#32C3CB"] },
  { name: "Science",     colors: ["#ffe819", "#000000"] },
  { name: "Mondrian",    colors: ["#0a0a0a", "#f7f3f2", "#0077e1", "#f5d216", "#fc3503"] },
  { name: "Troll",       colors: ["#294984", "#6ca0a7", "#ffc789", "#df5f50", "#5a3034", "#fff1dd"] },
  { name: "Escape",      colors: ["#f3e17e", "#dd483c", "#4b8a5f", "#0d150b", "#faf8e2"] },
  { name: "Homage",      colors: ["#fef9c6", "#ffcc4d", "#f5b800", "#56a1c4", "#4464a1", "#ee726b", "#df5f50", "#5a3034"] },
  { name: "Poet",        colors: ["#f4f3ed", "#efc807", "#ed5d53", "#e2dbb5", "#45291c", "#080b0f"] },
  { name: "Daily",       colors: ["#131314", "#272829", "#ffe18e", "#fff0c6"] }
];

const PALETAS_URL =
  "https://raw.githubusercontent.com/Joxemari/hoks/main/data/palettes.json";

// ------------------------------------------------------------
function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(2);
  art = createGraphics(ART, ART);
  art.pixelDensity(2);
  noLoop();

  document.body.style.margin = "0";
  document.body.style.background = "#111";
  textFont("monospace");

  construirUI();
  cargarPaletas();
  nuevaComposicion();
}

// Las paletas vivas de hoks; si la red falla, se queda con las de arriba.
function cargarPaletas() {
  loadJSON(PALETAS_URL + "?t=" + floor(millis()), (data) => {
    // Se listan TODAS, activas e inactivas: el laboratorio deja probar
    // cualquiera. La elección ponderada sólo usa las activas.
    const arr = (Array.isArray(data) ? data : data.palettes || [])
      .filter(p => p.colors && p.colors.length >= 2);
    if (!arr.length) return;
    PALETAS = [PALETAS[0]].concat(arr.map(p =>
      ({ name: p.name, colors: p.colors, active: p.active, created: p.created })));
    const sel = ui.paleta.elt;
    const antes = sel.value;
    sel.innerHTML = "";
    const auto = document.createElement("option");
    auto.value = "auto"; auto.text = "Random (weighted)"; sel.add(auto);
    PALETAS.forEach((p, i) => {
      const o = document.createElement("option");
      o.value = i; o.text = p.name + (p.active === false ? " · (inactive)" : "");
      sel.add(o);
    });
    sel.value = antes;
    redibujar();
  }, () => {});
}

// ------------------------------------------------------------
function opciones() {
  return {
    palette:    ui.paleta.value() === 'auto' ? null : PALETAS[int(ui.paleta.value())].colors,
    paletas:    PALETAS,
    vueltasMin: int(ui.vueltas.value()),
    vueltasMax: int(ui.vueltas.value()),
    trazo:      ui.trazo.value(),
    curva:      float(ui.curva.value()),
    corner:     ui.esquinas.value(),
    ends:       ui.extremos.value(),
    tinta:      ui.gradiente.checked() ? "gradiente" : "solido",
    dots:       ui.dots.checked() ? "bajo" : "no",
    dotRMin:    float(ui.dotR.value()) * 0.65,
    dotRMax:    float(ui.dotR.value()) * 1.6,
    dotsMin:    int(ui.dotsN.value()),
    dotsMax:    int(ui.dotsN.value())
  };
}

function nuevaComposicion() {
  seed = floor(Math.random() * 1000000000);
  redibujar();
}

function redibujar() {
  if (modo === "patron") { pintarPatron(); return; }
  if (modo === "triaje") { pintarTriaje(); actualizarInfo(); return; }
  hoja ? pintarHoja() : pintarUna();
  actualizarInfo();
}

// ------------------------------------------------------------
// TRIAJE: una obra a la vez, tres teclas, y el patrón al final.
// Se juzga a ciegas de los números — la ficha se ve DESPUÉS de votar,
// porque leer "sep 1.2" antes de mirar contamina el veredicto.
// ------------------------------------------------------------
function loteNuevo() {
  const s = floor(Math.random() * 1000000000);
  lote = { seed: s, seeds: seedsDeLote(s, LOTE_N), i: 0 };
  modo = "triaje";
  redibujar();
}

function votar(fallo) {
  if (modo !== "triaje" || !lote) return;
  const s = lote.seeds[lote.i];
  const c = generate(s, opciones());
  const r = renderComposition(art.drawingContext, 0, 0, ART, c);
  const m = measure(r.mapped, r.width, ART);
  veredictoPoner(s, fallo, rasgosDe(c, m), algoVersion(c.cfg));
  if (lote.i < LOTE_N - 1) { lote.i++; redibujar(); }
  else { modo = "patron"; redibujar(); }
}

function pintarTriaje() {
  seed = lote.seeds[lote.i];
  comp = generate(seed, opciones());
  const r = renderComposition(art.drawingContext, 0, 0, ART, comp);
  metrics = measure(r.mapped, r.width, ART);

  background(17);
  const lado = min(CANVAS_H - 76, CANVAS_W - PANEL_W - 40);
  const x0 = PANEL_W + (CANVAS_W - PANEL_W - lado) / 2;
  image(art, x0, 20, lado, lado);

  // barra de progreso: un tramo por obra, coloreado según su veredicto
  const dichos = veredictosLeer();
  const v = algoVersion(comp.cfg);
  const w = lado / LOTE_N;
  for (let i = 0; i < LOTE_N; i++) {
    const rec = dichos.find(d => d.seed === lote.seeds[i] && d.version === v);
    noStroke();
    fill(!rec ? color(60) : rec.fallo === "si" ? color(200, 60, 60)
         : rec.fallo === "no" ? color(80, 190, 110) : color(200, 180, 70));
    rect(x0 + i * w + 1, 30 + lado, w - 2, 10);
    if (i === lote.i) { fill(255); rect(x0 + i * w + 1, 44 + lado, w - 2, 3); }
  }
  fill(230); noStroke(); textAlign(LEFT, TOP); textSize(12);
  text(`obra ${lote.i + 1}/${LOTE_N}  ·  lote #${lote.seed}  ·  seed ${seed}  ·  ${v}` +
       `      [a] va  ·  [x] fuera  ·  [d] duda  ·  [←] atrás  ·  [p] patrón`,
       x0, 54 + lado);
}

// El informe. Lo único que hace es enseñar cómo se reparten los rasgos
// entre lo que dejas y lo que tiras. No propone corregir nada.
function pintarPatron() {
  background(17);
  const regs = veredictosLeer();
  const v = algoVersion(Object.assign({}, DEF, opciones()));
  const p = patronDeDescartes(regs);
  const L = patronEnTexto(p, v);

  fill(240); noStroke(); textAlign(LEFT, TOP);
  textSize(20); text("EL PATRÓN DEL DESCARTE", PANEL_W + 30, 26);
  textSize(13);
  let y = 68;
  for (const linea of L) { text(linea, PANEL_W + 30, y, CANVAS_W - PANEL_W - 60); y += linea ? 26 : 12; }
  y += 16;
  fill(150); textSize(12);
  text("[t] volver al triaje   ·   [n] lote nuevo   ·   [e] exportar veredictos JSON   ·   [ESC] libre",
       PANEL_W + 30, y);
  ui.info.html("patrón · " + p.n + " veredictos");
}

function exportarVeredictos() {
  const regs = veredictosLeer();
  if (!regs.length) return;
  saveJSON({ version_actual: algoVersion(Object.assign({}, DEF, opciones())),
             veredictos: regs }, "iterations2_veredictos.json");
}

function pintarUna() {
  comp = generate(seed, opciones());
  const r = renderComposition(art.drawingContext, 0, 0, ART, comp);
  metrics = measure(r.mapped, r.width, ART);

  background(17);
  const lado = min(CANVAS_H - 40, CANVAS_W - PANEL_W - 40);
  image(art, PANEL_W + (CANVAS_W - PANEL_W - lado) / 2, (CANVAS_H - lado) / 2, lado, lado);
}

// Hoja de contactos: la fealdad estructural se ve en la distribución,
// nunca en una pieza suelta.
function pintarHoja() {
  background(17);
  const filas = ceil(HOJA_N / HOJA_COLS);
  const lado = min((CANVAS_W - PANEL_W - 40) / HOJA_COLS, (CANVAS_H - 40) / filas) - 6;
  const g = createGraphics(360, 360);
  const opt = opciones();

  for (let i = 0; i < HOJA_N; i++) {
    const s = (seed + i * 0x9E3779B1) >>> 0;
    const c = generate(s, opt);
    renderComposition(g.drawingContext, 0, 0, 360, c);
    image(g, PANEL_W + 20 + (i % HOJA_COLS) * (lado + 6),
             20 + floor(i / HOJA_COLS) * (lado + 6), lado, lado);
  }
  g.remove();
  comp = null;
}

function actualizarInfo() {
  ui.dotRV.html(nf(float(ui.dotR.value()), 1, 2));
  ui.curvaV.html(nf(float(ui.curva.value()), 1, 2));
  ui.vueltasV.html(ui.vueltas.value());
  ui.dotsNV.html(ui.dotsN.value());

  if (hoja) { ui.info.html("hoja de contactos · " + HOJA_N + " desde #" + seed); return; }

  // En triaje la ficha se calla hasta que has votado: leer "sep 1.2"
  // antes de mirar la obra decide el veredicto por ti, y entonces el
  // patrón que sale no es tuyo, es el de los números.
  if (modo === "triaje") {
    const rec = veredictosLeer().find(d => d.seed === seed && d.version === algoVersion(comp.cfg));
    if (!rec) { ui.info.html("obra " + (lote.i + 1) + " de " + LOTE_N +
      "<br><br>mira la obra.<br>la ficha sale<br>después de votar."); return; }
    ui.info.html(
      "<b>" + (rec.fallo === "si" ? "FUERA" : rec.fallo === "no" ? "VA" : "DUDA") + "</b><br>" +
      "familia " + rec.rasgos.familia + "<br>" +
      "paleta " + rec.rasgos.paleta + "<br>" +
      "cruces " + rec.rasgos.cruces + " · sep " + nf(rec.rasgos.sep, 1, 2) + "<br>" +
      "secciones " + rec.rasgos.secciones + " · volteos " + rec.rasgos.volteados + "<br>" +
      "gap " + nf(rec.rasgos.gapW, 1, 2) + " · giro " + nf(rec.rasgos.giro, 1, 0) + "°"
    );
    return;
  }

  ui.info.html(
    "seed " + seed + "<br>" +
    "familia " + comp.family + "<br>" +
    "vértices " + comp.points.length + " · piezas " + comp.cuts.length + "<br>" +
    "<b>cruces " + comp.crossings + "</b><br>" +
    "gap " + nf(metrics.gapW, 1, 2) + " · seg " + nf(metrics.segW, 1, 2) + "<br>" +
    "giro " + nf(metrics.turn, 1, 0) + "°"
  );
}

// ------------------------------------------------------------
// UI
// ------------------------------------------------------------
function construirUI() {
  let y = 14;
  const fila = 40;

  ui.paleta = etiquetaSelect("paleta",
    [["auto", "Random (weighted)"]].concat(PALETAS.map((p, i) => [i, p.name])), 12, y); y += fila;

  [ui.vueltas, ui.vueltasV] = etiquetaSlider("vueltas", 2, 5, DEF.vueltasMax, 1, 12, y); y += fila;
  ui.trazo = etiquetaSelect("trazo",
    [["estandar", "estándar"], ["fino", "fino"], ["gordo", "gordo"]], 12, y); y += fila;

  [ui.curva, ui.curvaV] = etiquetaSlider("curvatura", 0, 1, 0, 0.05, 12, y); y += fila;

  ui.esquinas = etiquetaSelect("esquinas", [["rectas", "rectas"], ["curvas", "curvas"]], 12, y); y += fila;
  ui.extremos = etiquetaSelect("extremos", [["rectos", "rectos"], ["redondos", "redondos"]], 12, y); y += fila;

  ui.dots = etiquetaCheck("discos", true, 12, y); y += fila - 8;
  [ui.dotsN, ui.dotsNV] = etiquetaSlider("nº discos", 0, 8, 4, 1, 12, y); y += fila;
  [ui.dotR, ui.dotRV] = etiquetaSlider("tamaño", 0.35, 2.0, 0.85, 0.05, 12, y); y += fila;

  ui.gradiente = etiquetaCheck("gradiente", false, 12, y); y += fila;

  ui.bNueva = boton("nueva composición", 12, y, nuevaComposicion); y += 30;
  ui.bHoja  = boton("hoja de contactos (g)", 12, y, () => { hoja = !hoja; redibujar(); }); y += 30;
  ui.bSave  = boton("guardar PNG (s)", 12, y, guardar); y += 30;
  ui.bLote  = boton("triaje: lote de " + LOTE_N + " (n)", 12, y, loteNuevo); y += 30;
  ui.bPat   = boton("ver el patrón (p)", 12, y, () => { modo = "patron"; redibujar(); }); y += 38;

  ui.info = createP("");
  ui.info.position(12, y);
  estiloTexto(ui.info);
  ui.info.style("line-height", "17px");

  [ui.paleta, ui.esquinas, ui.extremos, ui.trazo].forEach(e => e.changed(redibujar));
  [ui.vueltas, ui.dotsN, ui.dotR, ui.curva].forEach(e => e.input(redibujar));
  [ui.dots, ui.gradiente].forEach(e => e.changed(redibujar));
}

function guardar() {
  if (hoja) { hoja = false; redibujar(); }
  save(art, "iterations2_" + seed + ".png");
}

function keyPressed() {
  if (document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName)) return;
  const k = (key || "").toLowerCase();

  if (k === "e") { exportarVeredictos(); return; }
  if (k === "p") { modo = "patron"; redibujar(); return; }
  if (k === "n") { loteNuevo(); return; }
  if (keyCode === ESCAPE) { modo = "libre"; redibujar(); return; }

  if (modo === "triaje") {
    if (k === "a") votar("no");                       // se queda
    else if (k === "x") votar("si");                  // fuera
    else if (k === "d") votar("duda");
    else if (keyCode === LEFT_ARROW && lote.i > 0) { lote.i--; redibujar(); }
    else if (keyCode === RIGHT_ARROW && lote.i < LOTE_N - 1) { lote.i++; redibujar(); }
    else if (k === "s") guardar();
    return;
  }
  if (modo === "patron") { if (k === "t") { modo = "triaje"; redibujar(); } return; }

  if (k === "t") { lote ? (modo = "triaje", redibujar()) : loteNuevo(); }
  else if (key === " ") nuevaComposicion();
  else if (keyCode === RIGHT_ARROW) { seed++; redibujar(); }
  else if (keyCode === LEFT_ARROW)  { seed--; redibujar(); }
  else if (k === "g") { hoja = !hoja; redibujar(); }
  else if (k === "s") guardar();
}

// --- fabriquitas de UI ---------------------------------------
function etiquetaSlider(txt, mn, mx, val, paso, x, y) {
  const l = createP(txt); l.position(x, y); estiloTexto(l);
  const v = createP(str(val)); v.position(x + 236, y); estiloTexto(v);
  const s = createSlider(mn, mx, val, paso);
  s.position(x, y + 18); s.style("width", "266px"); s.style("accent-color", "#fff");
  return [s, v];
}

function etiquetaSelect(txt, pares, x, y) {
  const l = createP(txt); l.position(x, y); estiloTexto(l);
  const s = createSelect();
  s.position(x + 110, y + 1); s.style("width", "168px");
  s.style("font-family", "monospace"); s.style("font-size", "12px");
  for (const [v, t] of pares) s.option(t, v);
  return s;
}

function etiquetaCheck(txt, val, x, y) {
  const c = createCheckbox(txt, val);
  c.position(x, y);
  c.style("color", "#eee"); c.style("font-family", "monospace"); c.style("font-size", "12px");
  return c;
}

function boton(txt, x, y, fn) {
  const b = createButton(txt);
  b.position(x, y);
  b.style("width", "276px"); b.style("font-family", "monospace"); b.style("font-size", "12px");
  b.style("padding", "5px"); b.style("background", "#eee"); b.style("border", "none");
  b.style("cursor", "pointer");
  b.mousePressed(fn);
  return b;
}

function estiloTexto(e) {
  e.style("margin", "0"); e.style("color", "#eee");
  e.style("font-family", "monospace"); e.style("font-size", "12px");
  e.style("line-height", "14px");
}
