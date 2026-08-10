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

const DEF = {
  vertexMin: 9,
  vertexMax: 15,

  vueltasMin: 3,       // nº de pasadas del esqueleto sobre el marco
  vueltasMax: 3,       // más pasadas = más cruces = más trama
  vueltaGiro: 0.62,    // rotación entre pasadas, × TWO_PI
  vueltaEscala: 0.86,

  // La anchura NO es un valor absoluto: es una proporción de la
  // mediana de segmento. Así el material se mantiene coherente
  // aunque la familia tenga otra escala interna.
  widthOfSeg:   0.50,
  widthMin:     0.020,
  widthMax:     0.072,

  gapRatio:     0.07,    // separación, × anchura de cinta — sutil, una junta
  minSegRatio:  1.10,    // segmento mínimo, × anchura
  minTurnDeg:   38,
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
  miterLimit:   2.2,         // por encima, el pico del halo raja la hebra vecina

  dots:         "bajo",      // no | bajo | encima
  dotsMin:      3,
  dotsMax:      5,
  dotR:         0.85,        // radio ÚNICO, × anchura de cinta
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

  const colores = pickRoles(cfg.palette || PALETA_BASE);

  const family = random(FAMILY_NAMES);
  const spec = FAMILIES[family];

  // VUELTAS: el esqueleto se recorre varias veces, cada pasada girada
  // y encogida. La cinta vuelve a entrar en el marco y se cruza con
  // lo que ya dejó escrito. De ahí sale la trama.
  const vueltas = floor(random(cfg.vueltasMin, cfg.vueltasMax + 1));
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

  // nodos: los anchors son intocables, los insertados son material blando
  const targetCount = anchors.length + floor(random(2, 7));
  let nodes = buildPath(anchors, targetCount, cfg);

  // la anchura sale del propio recorrido, antes de encajarlo en el marco
  // La extensión declarada vale para UNA pasada. Cada vuelta añade
  // recorrido dentro del mismo marco, así que necesita más campo o
  // la cinta no tiene sitio donde separarse de sí misma.
  const extension = min(0.98, spec.extent + 0.12 * (vueltas - 1));
  nodes = fitToExtent(nodes, extension, cfg);
  let width = constrain(cfg.widthOfSeg * medianSeg(nodes), cfg.widthMin, cfg.widthMax);

  // Las tres restricciones se estorban entre sí: abrir un pliegue
  // acorta segmentos, separar hebras cierra giros. Se iteran juntas.
  for (let round = 0; round < 16; round++) {
    nodes = enforceMaterial(nodes, width, cfg);
    nodes = relaxFolds(nodes, cfg);
    nodes = selfAvoid(nodes, width, cfg);
    width = constrain(cfg.widthOfSeg * medianSeg(nodes), cfg.widthMin, cfg.widthMax);
  }

  // Encoger es lo último: cualquier reajuste posterior volvería a sacar
  // la cinta del cuadro. Dos pasadas porque al encoger cambia la mediana
  // de segmento y con ella la anchura, y con ella el propio margen.
  for (let i = 0; i < 2; i++) {
    nodes = shrinkIntoFrame(nodes, width, cfg);
    width = constrain(cfg.widthOfSeg * medianSeg(nodes), cfg.widthMin, cfg.widthMax);
  }

  // Encoger vuelve a juntar las hebras: la separación es absoluta y el
  // marco la comprime. Se repasa la evitacion DENTRO ya del marco final.
  for (let i = 0; i < 6; i++) {
    nodes = selfAvoid(nodes, width, cfg);
    nodes = relaxFolds(nodes, cfg);
    nodes = shrinkIntoFrame(nodes, width, cfg);
  }

  // La separación es innegociable: es lo único que distingue un cruce
  // de una costura. Si el solver no consiguió abrir hueco suficiente,
  // no se dibuja mal — se adelgaza la cinta hasta que el halo quepa.
  // El material cede ante el nudo, no al revés.
  // Los extremos SALEN de la trama. Una cinta que muere en mitad del
  // nudo, cortada a hueso, es lo único que queda sin resolver a la
  // vista: el principio y el final tienen que ser un acontecimiento.
  nodes = sacarExtremos(nodes, width, cfg);
  for (let i = 0; i < 4; i++) {
    nodes = selfAvoid(nodes, width, cfg);
    nodes = relaxFolds(nodes, cfg);
    nodes = shrinkIntoFrame(nodes, width, cfg);
  }
  width = constrain(cfg.widthOfSeg * medianSeg(nodes), cfg.widthMin, cfg.widthMax);

  width = min(width, holguraReal(nodes) / (1 + 2 * cfg.gapRatio + 0.12));
  // Un segmento más corto que la propia anchura deja de ser tramo y
  // pasa a ser bulto: la cinta también cede ante eso.
  width = min(width, minSeg(nodes) / 1.05);
  width = constrain(width, cfg.widthMin, cfg.widthMax);

  const points = nodes.map(n => n.p);
  const { cuts, order, crossings } = buildKnot(points);

  return { seed, family, vueltas, points, cuts, order, crossings, width, colores, cfg };
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

function minSeg(nodes) {
  let m = Infinity;
  for (let i = 0; i < nodes.length - 1; i++) m = min(m, p5.Vector.dist(nodes[i].p, nodes[i+1].p));
  return m === Infinity ? 0.2 : m;
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

  for (let pass = 0; pass < 160; pass++) {
    let moved = false;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 2; j < n - 1; j++) {
        const a = nodes[i].p, b = nodes[i+1].p, c = nodes[j].p, d = nodes[j+1].p;
        if (segIntersect(a, b, c, d)) continue;          // cruce legítimo
        const gap = segDist(a, b, c, d);
        if (gap >= dMin || gap < 1e-9) continue;

        const push = (dMin - gap) * 0.18;

        // Empujar según los puntos MÁS PRÓXIMOS, no según los puntos
        // medios: cuando una hebra se posa encima de otra los medios
        // casi coinciden, la dirección sale nula y el par se saltaba
        // — justo el caso que hay que resolver.
        const par = parMasProximo(a, b, c, d);
        let dir = p5.Vector.sub(par[0], par[1]);
        if (dir.magSq() < 1e-12) {
          const t = p5.Vector.sub(b, a);                 // respaldo: la normal
          dir = createVector(-t.y, t.x);
          if (dir.magSq() < 1e-12) continue;
        }
        dir.normalize().mult(push);

        a.add(dir); b.add(dir);
        c.sub(dir); d.sub(dir);
        moved = true;
      }
    }
    if (!moved) break;
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
  return width * (0.5 + cfg.gapRatio) + cfg.margen;
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

  // recolocar el bloque entero dentro del marco (traslación, no recorte)
  minX = cx + (minX-cx)*s; maxX = cx + (maxX-cx)*s;
  minY = cy + (minY-cy)*s; maxY = cy + (maxY-cy)*s;
  const dx = minX < m ? m - minX : (maxX > 1-m ? (1-m) - maxX : 0);
  const dy = minY < m ? m - minY : (maxY > 1-m ? (1-m) - maxY : 0);
  if (dx || dy) for (const n of nodes) { n.p.x += dx; n.p.y += dy; }

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
function buildKnot(points) {
  const last = points.length - 1;

  const X = [];
  for (let i = 0; i < last; i++) {
    for (let j = i + 2; j < last; j++) {
      const r = segParams(points[i], points[i+1], points[j], points[j+1]);
      if (r) X.push({ a: i + r.t, b: j + r.u });
    }
  }

  if (!X.length) {
    return { cuts: [{ startSeg: 0, startT: 0, endSeg: last - 1, endT: 1 }], order: [0], crossings: 0 };
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

  const bounds = [0];
  for (let m = 0; m < visits.length - 1; m++) bounds.push((visits[m].s + visits[m+1].s) / 2);
  bounds.push(last);

  // Una pieza puede contener VARIOS cruces si en todos ellos va a la
  // misma profundidad. Cortar en cada cruce multiplicaba las juntas
  // sin necesidad, y cada junta es una costura visible.
  const cuts = [], depth = [];
  let m = 0;
  while (m < visits.length) {
    let k = m;
    while (k + 1 < visits.length && visits[k+1].over === visits[m].over) k++;
    cuts.push(sToCut(bounds[m], bounds[k+1], last));
    depth.push(visits[m].over ? 1 : 0);
    m = k + 1;
  }

  // primero todo lo que va debajo, después lo que va encima
  const order = cuts.map((_, i) => i).sort((a, b) => depth[a] - depth[b]);
  return { cuts, order, crossings: X.length };
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
  const gap = cfg.gapRatio * width;

  ctx.fillStyle = col.bg;
  ctx.fillRect(ox, oy, S, S);

  let mapped = mapToSquare(comp.points, ox, oy, S, cfg);
  if (cfg.vibration) mapped = applyVibration(mapped, comp.seed, width, cfg);

  const polys = comp.cuts.map(c => piecePolyline(mapped, c));
  const tinta = cfg.tinta === "gradiente" ? makeGradient(ctx, mapped, comp) : col.fg;

  // Bajo la cinta: el contrapunto pertenece al campo y la cinta lo
  // eclipsa al pasar. El disco entra así en el sistema de profundidad
  // en vez de flotar encima de él.
  if (cfg.dots === "bajo") drawDots(ctx, mapped, width, comp, ox, oy, S);

  // Dos piezas que se tocan sin solaparse dejan medio píxel sin cubrir
  // por cada lado y el fondo se transparenta: esa es la línea fina que
  // se ve entre secciones. Se solapan un poco y desaparece.
  const solape = width * 0.20;
  const ultima = polys.length - 1;

  for (const idx of comp.order) {
    const pts = polys[idx];
    if (!pts || pts.length < 2) continue;
    const ini = idx > 0 ? solape : 0;
    const fin = idx < ultima ? solape : 0;

    if (gap > 0) {
      // En el arranque y el remate de la cinta el halo sobresale: son
      // los dos únicos cantos sin junta y si no se pegan a lo de debajo.
      strokePath(ctx, alargarExtremos(pts, idx > 0 ? ini : gap, idx < ultima ? fin : gap),
                 width + gap * 2, col.bg, cfg);
    }
    strokePath(ctx, alargarExtremos(pts, ini, fin), width, tinta, cfg);
  }

  if (cfg.ends === "redondos") {
    const first = polys[0], last = polys[polys.length - 1];
    ctx.fillStyle = tinta;
    for (const c of [first[0], last[last.length - 1]]) {
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

  const r = cfg.dotR * width;                                  // todos iguales
  const need = r + width * (0.5 + cfg.gapRatio + cfg.dotClear);
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
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TWO_PI); ctx.fill();
  });
  return placed;
}

function alargarExtremos(pts, ini, fin) {
  const out = pts.map(p => p.copy());
  if (ini > 0) {
    const d = p5.Vector.sub(out[0], out[1]);
    const l = d.mag();
    // nunca más de un tercio del tramo: si no, el solape se comería
    // el cruce que la pieza tiene justo al lado
    if (l > 0) out[0].add(d.normalize().mult(min(ini, l / 3)));
  }
  if (fin > 0) {
    const n = out.length - 1;
    const d = p5.Vector.sub(out[n], out[n-1]);
    const l = d.mag();
    if (l > 0) out[n].add(d.normalize().mult(min(fin, l / 3)));
  }
  return out;
}

function strokePath(ctx, pts, w, paint, cfg) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = paint;
  ctx.lineWidth = w;
  ctx.lineJoin = cfg.corner === "curvas" ? "round" : "miter";
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

function pointSegDist(p, a, b) {
  const ab = p5.Vector.sub(b, a);
  const l2 = ab.magSq();
  if (l2 === 0) return p5.Vector.dist(p, a);
  const t = constrain(((p.x-a.x)*ab.x + (p.y-a.y)*ab.y) / l2, 0, 1);
  return dist(p.x, p.y, a.x + ab.x*t, a.y + ab.y*t);
}

// Pareja de puntos más próxima entre dos segmentos (aproximada por
// proyección de los cuatro extremos: sobra para relajar).
function parMasProximo(a, b, c, d) {
  const cand = [
    [a, proyecta(a, c, d)], [b, proyecta(b, c, d)],
    [proyecta(c, a, b), c], [proyecta(d, a, b), d]
  ];
  let best = cand[0], bd = Infinity;
  for (const par of cand) {
    const v = p5.Vector.dist(par[0], par[1]);
    if (v < bd) { bd = v; best = par; }
  }
  return best;
}

function proyecta(p, a, b) {
  const ab = p5.Vector.sub(b, a);
  const l2 = ab.magSq();
  if (l2 === 0) return a.copy();
  const t = constrain(((p.x-a.x)*ab.x + (p.y-a.y)*ab.y) / l2, 0, 1);
  return createVector(a.x + ab.x*t, a.y + ab.y*t);
}

function segDist(a, b, c, d) {
  return min(min(pointSegDist(a,c,d), pointSegDist(b,c,d)),
             min(pointSegDist(c,a,b), pointSegDist(d,a,b)));
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
    const arr = (Array.isArray(data) ? data : data.palettes || [])
      .filter(p => p.active !== false && p.colors && p.colors.length >= 2);
    if (!arr.length) return;
    PALETAS = [PALETAS[0]].concat(arr.map(p => ({ name: p.name, colors: p.colors })));
    const sel = ui.paleta.elt;
    const antes = sel.value;
    sel.innerHTML = "";
    PALETAS.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.text = p.name; sel.add(o); });
    sel.value = antes;
    redibujar();
  }, () => {});
}

// ------------------------------------------------------------
function opciones() {
  return {
    palette:    PALETAS[int(ui.paleta.value())].colors,
    vueltasMin: int(ui.vueltas.value()),
    vueltasMax: int(ui.vueltas.value()),
    widthOfSeg: float(ui.anchura.value()),
    corner:     ui.esquinas.value(),
    ends:       ui.extremos.value(),
    tinta:      ui.gradiente.checked() ? "gradiente" : "solido",
    dots:       ui.dots.checked() ? "bajo" : "no",
    dotR:       float(ui.dotR.value()),
    dotsMin:    int(ui.dotsN.value()),
    dotsMax:    int(ui.dotsN.value())
  };
}

function nuevaComposicion() {
  seed = floor(Math.random() * 1000000000);
  redibujar();
}

function redibujar() {
  hoja ? pintarHoja() : pintarUna();
  actualizarInfo();
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
  ui.anchuraV.html(nf(float(ui.anchura.value()), 1, 2));
  ui.dotRV.html(nf(float(ui.dotR.value()), 1, 2));
  ui.vueltasV.html(ui.vueltas.value());
  ui.dotsNV.html(ui.dotsN.value());

  if (hoja) { ui.info.html("hoja de contactos · " + HOJA_N + " desde #" + seed); return; }
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

  ui.paleta = etiquetaSelect("paleta", PALETAS.map((p, i) => [i, p.name]), 12, y); y += fila;

  [ui.vueltas, ui.vueltasV] = etiquetaSlider("vueltas", 2, 5, 3, 1, 12, y); y += fila;
  [ui.anchura, ui.anchuraV] = etiquetaSlider("anchura", 0.25, 0.95, 0.50, 0.01, 12, y); y += fila;

  ui.esquinas = etiquetaSelect("esquinas", [["rectas", "rectas"], ["curvas", "curvas"]], 12, y); y += fila;
  ui.extremos = etiquetaSelect("extremos", [["rectos", "rectos"], ["redondos", "redondos"]], 12, y); y += fila;

  ui.dots = etiquetaCheck("discos", true, 12, y); y += fila - 8;
  [ui.dotsN, ui.dotsNV] = etiquetaSlider("nº discos", 0, 8, 4, 1, 12, y); y += fila;
  [ui.dotR, ui.dotRV] = etiquetaSlider("tamaño", 0.35, 2.0, 0.85, 0.05, 12, y); y += fila;

  ui.gradiente = etiquetaCheck("gradiente", false, 12, y); y += fila;

  ui.bNueva = boton("nueva composición", 12, y, nuevaComposicion); y += 30;
  ui.bHoja  = boton("hoja de contactos (g)", 12, y, () => { hoja = !hoja; redibujar(); }); y += 30;
  ui.bSave  = boton("guardar PNG (s)", 12, y, guardar); y += 38;

  ui.info = createP("");
  ui.info.position(12, y);
  estiloTexto(ui.info);
  ui.info.style("line-height", "17px");

  [ui.paleta, ui.esquinas, ui.extremos].forEach(e => e.changed(redibujar));
  [ui.vueltas, ui.anchura, ui.dotsN, ui.dotR].forEach(e => e.input(redibujar));
  [ui.dots, ui.gradiente].forEach(e => e.changed(redibujar));
}

function guardar() {
  if (hoja) { hoja = false; redibujar(); }
  save(art, "iterations2_" + seed + ".png");
}

function keyPressed() {
  if (document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName)) return;
  if (key === " ") nuevaComposicion();
  else if (keyCode === RIGHT_ARROW) { seed++; redibujar(); }
  else if (keyCode === LEFT_ARROW)  { seed--; redibujar(); }
  else if (key === "g" || key === "G") { hoja = !hoja; redibujar(); }
  else if (key === "s" || key === "S") guardar();
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
