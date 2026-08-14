/* CHLLD — PROTOTIPO. Partición del plano por fronteras compartidas.
 *
 * Todavía no es una familia: es el núcleo geométrico, para mirarlo en el grid antes
 * de decidir nada. Sin tipos, sin traits, sin rareza. Ver el README.
 *
 * LA IDEA
 * Chillida repitió de muchas maneras que el material no es el sujeto: es lo que pone
 * un límite al espacio. De ahí dos consecuencias que ninguna familia de la casa ha
 * usado todavía, y que son el encargo de ésta:
 *
 *   1. No hay CONTORNO, hay FRONTERA. Una masa suya no tiene silueta propia: comparte
 *      el borde con lo que tiene al lado. Dibujar una silueta es dibujar un objeto
 *      sobre un fondo, y ahí ya has decidido que el fondo es lo que sobra.
 *   2. No hay FIGURA SOBRE FONDO, hay REPARTO. El plano entero se parte, y sólo
 *      después se decide de qué lado cae cada pieza.
 *
 * Así que aquí no se traza nada. Se PARTE: el pliego entero es una región, y se corta
 * en dos por una quebrada, y otra vez, y otra. Lo que sale son piezas que se tocan
 * porque nacieron de la misma partición — la frontera no es de ninguna de las dos.
 *
 * Es la hermana orgánica de KRRTK, que ya subdivide, pero en cuadrados: aquí la
 * frontera es quebrada y la subdivisión no tiene retícula. Y es la hermana de EVOL
 * por el otro lado: donde EVOL traza una masa y el vacío es la consecuencia, CHLLD
 * reparte y ninguna de las dos cosas es consecuencia de la otra.
 *
 * ESTADO: el corte y la partición. El reparto de tinta viene después.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;
  const min = Math.min, max = Math.max, abs = Math.abs, hypot = Math.hypot;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  // ── Geometría ───────────────────────────────────────────────────────────────
  function area(p) {
    let a = 0;
    for (let i = 0, n = p.length; i < n; i++) {
      const q = p[(i + 1) % n];
      a += p[i].x * q.y - q.x * p[i].y;
    }
    return a / 2;
  }

  // Intersección de dos segmentos. Devuelve el punto y los dos parámetros, o null.
  // Los extremos se excluyen con un épsilon: un corte que pasa EXACTAMENTE por un
  // vértice del polígono da dos intersecciones en el mismo sitio y rompe el reparto
  // de aristas. Descartarlo y volver a tirar sale más barato que tratarlo.
  const EPS = 1e-9;
  function segInter(a, b, c, d) {
    const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
    const den = rx * sy - ry * sx;
    if (abs(den) < EPS) return null;
    const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den;
    const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
    if (t <= EPS || t >= 1 - EPS || u <= EPS || u >= 1 - EPS) return null;
    return { t, u, x: a.x + rx * t, y: a.y + ry * t };
  }

  function compacidad(p) {
    let per = 0;
    for (let i = 0, n = p.length; i < n; i++) {
      const q = p[(i + 1) % n];
      per += hypot(q.x - p[i].x, q.y - p[i].y);
    }
    return per > 1e-9 ? 4 * Math.PI * abs(area(p)) / (per * per) : 0;
  }

  function dentro(poly, x, y) {
    let d = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) d = !d;
    }
    return d;
  }

  // Vértices del borde desde la arista e (excluida) hasta la arista f (incluida),
  // dando la vuelta si hace falta.
  function tramoBorde(poly, e, f) {
    const n = poly.length, out = [];
    let i = (e + 1) % n;
    for (let k = 0; k <= n; k++) {
      out.push(poly[i]);
      if (i === f) return out;
      i = (i + 1) % n;
    }
    return out;
  }

  // ── La quebrada ─────────────────────────────────────────────────────────────
  // Atraviesa la caja de la región de lado a lado, monótona en su eje de avance.
  // La monotonía es la misma decisión que en EVOL y por el mismo motivo: garantiza
  // que la línea cruza y que no se enrosca, y sale gratis de la gramática en vez de
  // costar un solver.
  //
  // El ángulo tira a los ejes pero no se queda en ellos: Chillida corta casi en
  // ángulo recto, y ese CASI es justo lo que separa su corte del de una retícula.
  function quebrada(rng, poly, cfg) {
    // El eje de avance no se sortea a cara o cruz: se sesga. Con 50/50 la partición
    // sale isótropa y las piezas tienden al cuadrado, y una masa hecha de cuadrados
    // no se estira. Cortando más veces en horizontal, las piezas salen anchas y bajas
    // y la masa se alarga sola — que es la proporción de la referencia.
    const ang = (rng.bool(cfg.pHoriz) ? 0 : Math.PI / 2) + rng.range(-cfg.sesgoAng, cfg.sesgoAng);
    const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    for (const p of poly) {
      const u = p.x * ux + p.y * uy, v = p.x * vx + p.y * vy;
      if (u < u0) u0 = u; if (u > u1) u1 = u;
      if (v < v0) v0 = v; if (v > v1) v1 = v;
    }
    const holgura = (u1 - u0) * 0.08 + 1e-4;      // que entre y salga de verdad
    const nv = rng.int(cfg.vertMin, cfg.vertMax);
    // El corte no parte por la mitad: se sesga, porque una partición que siempre
    // reparte a partes iguales da una retícula, y esto no es una retícula.
    let v = v0 + (v1 - v0) * rng.range(cfg.corteMin, 1 - cfg.corteMin);
    const amp = (v1 - v0) * cfg.deriva;
    let pend = rng.range(-1, 1), racha = rng.int(1, 3);
    const pts = [];
    for (let j = 0; j <= nv; j++) {
      const u = u0 - holgura + (u1 - u0 + holgura * 2) * (j / nv);
      pts.push({ x: u * ux + v * vx, y: u * uy + v * vy });
      if (racha-- <= 0) { pend = rng.range(-1, 1); racha = rng.int(1, 3); }
      v = clamp(v + pend * amp, v0 + (v1 - v0) * 0.06, v1 - (v1 - v0) * 0.06);
    }
    return pts;
  }

  // ── El corte ────────────────────────────────────────────────────────────────
  // Parte un polígono en dos por una quebrada. Devuelve {a, b} o null.
  //
  // Y COMPRUEBA, que es la doctrina de la casa: las dos mitades tienen que sumar el
  // área de la madre y ninguna puede salir degenerada. Un corte que no cuadra se
  // tira y se vuelve a tirar — sale mucho más barato que tratar los casos raros
  // (la quebrada que roza un vértice, la que entra y sale por la misma arista, la
  // que se escapa por un entrante del polígono).
  function cortar(rng, poly, cfg) {
    const A0 = abs(area(poly));
    for (let intento = 0; intento < cfg.reintentos; intento++) {
      const q = quebrada(rng, poly, cfg);
      const hits = [];
      for (let k = 0; k < q.length - 1; k++) {
        for (let e = 0; e < poly.length; e++) {
          const r = segInter(q[k], q[k + 1], poly[e], poly[(e + 1) % poly.length]);
          if (r) hits.push({ k, e, x: r.x, y: r.y, t: k + r.t });
        }
      }
      if (hits.length < 2) continue;
      hits.sort((x, y) => x.t - y.t);
      const h1 = hits[0], h2 = hits[hits.length - 1];
      if (h1.e === h2.e) continue;              // entra y sale por la misma arista

      // El tramo de quebrada que queda DENTRO, con sus dos extremos en el borde.
      const C = [{ x: h1.x, y: h1.y }];
      for (let k = h1.k + 1; k <= h2.k; k++) C.push(q[k]);
      C.push({ x: h2.x, y: h2.y });
      // ¿de verdad va por dentro? Con un polígono con entrantes, la quebrada puede
      // salirse y volver, y entonces las dos mitades se solapan.
      let fuera = false;
      for (let k = 0; k < C.length - 1 && !fuera; k++) {
        if (!dentro(poly, (C[k].x + C[k + 1].x) / 2, (C[k].y + C[k + 1].y) / 2)) fuera = true;
      }
      if (fuera) continue;

      const med = C.slice(1, -1);
      const a = [C[0]].concat(tramoBorde(poly, h1.e, h2.e), [C[C.length - 1]], med.slice().reverse());
      const b = [C[C.length - 1]].concat(tramoBorde(poly, h2.e, h1.e), [C[0]], med);
      const Aa = abs(area(a)), Ab = abs(area(b));
      if (Aa < cfg.areaMin || Ab < cfg.areaMin) continue;
      if (abs(Aa + Ab - A0) > A0 * 0.002) continue;      // el reparto tiene que cuadrar
      // Y ninguna de las dos puede salir ASTILLA. Una pieza larga y finísima no es
      // una pieza: cuando cae del lado de la tinta se lee como una raya perdida, y
      // cuando cae del lado del suelo, como una grieta. Se mide por compacidad
      // (4·pi·area / perimetro^2), que vale 1 en el círculo y se va a cero en cuanto
      // la pieza se afila.
      if (compacidad(a) < cfg.compMin || compacidad(b) < cfg.compMin) continue;
      return { a, b };
    }
    return null;
  }

  // ── La partición ────────────────────────────────────────────────────────────
  // Se corta la región MÁS GRANDE cada vez. Con elección al azar, las piezas grandes
  // sobreviven enteras y las pequeñas se pican, que es lo contrario de lo que hace
  // una partición: el reparto tiene que ir de lo general a lo particular.
  function particion(rng, W, H, cfg) {
    const raiz = { poly: [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }], hijos: null };
    raiz.area = abs(area(raiz.poly));
    const hojas = [raiz];
    for (let i = 0; i < cfg.cortes; i++) {
      let j = 0, mejor = -1;
      for (let k = 0; k < hojas.length; k++) if (hojas[k].area > mejor) { mejor = hojas[k].area; j = k; }
      const nodo = hojas[j];
      const r = cortar(rng, nodo.poly, cfg);
      if (!r) break;
      const a = { poly: r.a, hijos: null, area: abs(area(r.a)) };
      const b = { poly: r.b, hijos: null, area: abs(area(r.b)) };
      nodo.hijos = [a, b];
      hojas.splice(j, 1, a, b);
    }
    return { raiz, hojas };
  }

  // ── EL REPARTO, por el árbol ─────────────────────────────────────────────────
  // Aquí es donde esta familia deja de parecerse a nada de la casa.
  //
  // El primer reparto crecía la tinta pieza a pieza por vecindad, y no valía: con
  // piezas grandes salían dos bloques y una bipartición con horizonte quebrado —dos
  // regiones, no una masa sobre un suelo—; con piezas pequeñas, el borde se llenaba
  // de dientes y se leía como una sierra. Los dos fallos tienen la misma causa: el
  // borde lo iba decidiendo la pieza, y una pieza es corta.
  //
  // El borde de una masa de Chillida está hecho de tramos LARGOS. Y en una partición
  // los tramos largos ya existen: son los CORTES TEMPRANOS, los que atravesaban el
  // pliego entero cuando aún no estaba dividido. Así que la tinta no se decide por
  // pieza: se decide por NODO. Se baja por el árbol y, en cuanto un nodo es lo
  // bastante pequeño, todo su subárbol toma un solo valor de golpe.
  //
  // Eso da las dos cosas a la vez, y sin negociarlas: el contorno de un bloque
  // unificado es la frontera de su nodo, o sea un corte temprano —tramos largos—, y
  // la articulación fina aparece donde dos nodos hermanos caen de distinto lado.
  //
  // 'bloque' es el tamaño máximo de una DECISIÓN. Por encima de eso no se decide: se
  // sigue bajando. Es el único mando que hace falta y dice algo entendible — de qué
  // tamaño es la pieza más grande de la que consta la masa.
  // Y la decisión SE HEREDA. Decidiendo cada bloque por su cuenta salía confeti:
  // los bloques de tinta caían dispersos y la pieza no tenía masa, tenía manchas.
  // Aquí cada nodo baja una TENDENCIA a sus dos hijos, y al repartirla les da a uno
  // un poco más y al otro un poco menos. Bajando, las dos ramas se van inclinando
  // hasta que la duda se resuelve sola: un lado del árbol acaba siendo tinta y el
  // otro suelo. Como los dos hijos de un nodo son las dos mitades de una región,
  // esa correlación es espacial — y por eso la masa sale de una pieza.
  //
  // Es la iteración haciendo el trabajo, y no un ajuste: la obra no decide dónde va
  // la tinta, decide CUÁNDO deja de dudar.
  function repartir(rng, raiz, cfg) {
    const hojas = [];
    function marcar(n, t) {
      if (!n.hijos) { n.tinta = t; hojas.push(n); return; }
      marcar(n.hijos[0], t); marcar(n.hijos[1], t);
    }
    function bajar(n, tend) {
      if (!n.hijos) { n.tinta = rng.bool(tend); hojas.push(n); return; }
      if (n.area <= cfg.bloque) { marcar(n, rng.bool(tend)); return; }
      const d = cfg.divergencia;
      const a = rng.bool(0.5) ? 1 : -1;   // a qué mitad le toca inclinarse hacia dónde
      bajar(n.hijos[0], clamp(tend + d * a, 0, 1));
      bajar(n.hijos[1], clamp(tend - d * a, 0, 1));
    }
    bajar(raiz, cfg.tendencia);
    let tinta = 0, total = 0;
    for (const h of hojas) { total += h.area; if (h.tinta) tinta += h.area; }
    return { hojas, mancha: total > 0 ? tinta / total : 0 };
  }

  // ── La adyacencia ───────────────────────────────────────────────────────────
  // Dos piezas son vecinas si comparten AL MENOS DOS vértices, y eso es exacto, no
  // aproximado: al cortar, los puntos de la quebrada se meten en las dos mitades, así
  // que la frontera común está literalmente hecha de los mismos puntos. Cuando una
  // mitad se vuelve a partir, sus hijas heredan su parte de esa frontera y la cuenta
  // sigue saliendo. Un solo vértice compartido no basta — eso es tocarse en una
  // esquina, y por una esquina no pasa una masa.
  function adyacencias(regs) {
    const key = p => Math.round(p.x * 1e6) + '|' + Math.round(p.y * 1e6);
    const mapa = new Map();
    regs.forEach((poly, i) => {
      const vistos = new Set();
      for (const v of poly) {
        const k = key(v);
        if (vistos.has(k)) continue;
        vistos.add(k);
        if (!mapa.has(k)) mapa.set(k, []);
        mapa.get(k).push(i);
      }
    });
    // Y no solo QUIÉNES son vecinas: CUÁNTO se tocan. La longitud de la frontera
    // común es lo que decide por dónde crece la masa, así que hay que medirla: para
    // cada arista de cada pieza, si sus dos extremos los comparte la misma vecina,
    // esa arista es frontera con ella.
    const vec = regs.map(() => []);
    const largo = regs.map(() => new Map());
    regs.forEach((poly, i) => {
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k], b = poly[(k + 1) % poly.length];
        const la = mapa.get(key(a)), lb = mapa.get(key(b));
        if (!la || !lb) continue;
        const d = hypot(b.x - a.x, b.y - a.y);
        for (const j of la) {
          if (j === i || lb.indexOf(j) < 0) continue;
          largo[i].set(j, (largo[i].get(j) || 0) + d);
        }
      }
    });
    // Vecina de verdad es la que comparte frontera con longitud, no la que roza una
    // esquina: por una esquina no pasa una masa.
    regs.forEach((_, i) => {
      for (const [j, d] of largo[i]) if (d > 1e-6) vec[i].push(j);
    });
    return { vec, largo };
  }

  // ── El reparto ──────────────────────────────────────────────────────────────
  // Aquí es donde la partición se vuelve obra. NO se colorea pieza a pieza —eso da
  // un vitral, que es lo que salía en el primer prototipo—: se elige una semilla y
  // la tinta CRECE por vecindad hasta ocupar su cuota. Lo que sale es una masa
  // conexa cuyo borde es frontera de otras piezas, nunca contorno propio.
  //
  // El precedente está en casa: DTKRT lee la misma malla dos veces, una para saber
  // si hay algo y otra para saber a qué región pertenece. Esto es esa segunda
  // lectura, sobre una partición en vez de sobre un retículo.
  function pertenencia(rng, regs, vec, largo, areas, cfg) {
    const tinta = new Array(regs.length).fill(false);
    const total = areas.reduce((a, b) => a + b, 0);
    const objetivo = total * cfg.cuota;
    const nSem = cfg.semillas;
    let acc = 0;
    // Las semillas nacen en piezas que TOCAN EL BORDE del pliego. La obra es el
    // corte de algo más grande —lo mismo que en EVOL— y una masa que nace en el
    // centro se queda como una figura posada en su hoja. Naciendo en el borde, entra.
    const borde = [];
    regs.forEach((poly, i) => {
      for (const v of poly) {
        if (v.x < 1e-6 || v.y < 1e-6 || v.x > cfg._fw - 1e-6 || v.y > cfg._fh - 1e-6) { borde.push(i); return; }
      }
    });
    const pool = borde.length ? borde : regs.map((_, i) => i);

    // Las semillas se reparten: la primera al azar y las siguientes lo más lejos
    // posible de las ya puestas, medido en SALTOS de vecindad, no en distancia. Dos
    // masas que nacen pegadas se funden en una y la pieza se queda con un solo
    // suceso — que es justo lo que la jerarquía de EVOL tuvo que arreglar a mano.
    const semillas = [pool[rng.int(0, pool.length - 1)]];
    for (let k = 1; k < nSem; k++) {
      const dist = new Array(regs.length).fill(-1);
      const cola = semillas.slice();
      for (const s of semillas) dist[s] = 0;
      for (let qi = 0; qi < cola.length; qi++) {
        for (const n of vec[cola[qi]]) if (dist[n] < 0) { dist[n] = dist[cola[qi]] + 1; cola.push(n); }
      }
      let mejor = -1, dMax = -1;
      for (const i of pool) if (dist[i] > dMax) { dMax = dist[i]; mejor = i; }
      if (mejor >= 0 && dMax > 0) semillas.push(mejor);
    }

    const frontera = [];
    for (const s of semillas) {
      if (tinta[s]) continue;
      tinta[s] = true; acc += areas[s];
      for (const n of vec[s]) frontera.push(n);
    }
    // POR DÓNDE CRECE. Tres criterios probados, y el tercero es el que hace la obra:
    //   · al azar        → la masa se deshilacha y el borde se vuelve ruido;
    //   · por la mayor   → bloques compactos, que es lo que salía y era demasiado
    //                      simple: dos o tres piezas gordas y ninguna articulación;
    //   · por la FRONTERA MÁS LARGA → la masa avanza por donde más se toca, y eso da
    //     brazos: sigue los cortes largos y deja atrás las piezas que solo rozan.
    // Es además lo único de los tres que se puede defender: la masa se extiende por
    // donde el contacto es mayor, no por donde hay más área ni por capricho.
    while (acc < objetivo && frontera.length) {
      let j = -1, mejor = -1;
      for (let k = 0; k < frontera.length; k++) {
        const r = frontera[k];
        if (tinta[r]) continue;
        // La frontera individual MÁS LARGA, no la suma. Sumando, gana siempre la
        // pieza más abrazada por la masa y el crecimiento se compacta en un bolo:
        // es crecimiento por curvatura, y da bolas. Con el máximo, la masa sigue EL
        // CORTE más largo que la toca, y los cortes largos son los que cruzan el
        // pliego — así la masa se estira en vez de engordar.
        let d = 0;
        for (const [v, L] of largo[r]) if (tinta[v] && L > d) d = L;
        if (d > mejor) { mejor = d; j = k; }
      }
      if (j < 0) break;
      const r = frontera.splice(j, 1)[0];
      tinta[r] = true; acc += areas[r];
      for (const n of vec[r]) if (!tinta[n]) frontera.push(n);
    }
    return { tinta, mancha: acc / total, semillas };
  }

  const DEF = {
    // Sube de 14 a 44. Con 15 piezas la masa se comía dos o tres bloques enormes y
    // la obra se quedaba en una silueta simple: la articulación fina no tenía de qué
    // estar hecha. La partición tiene que ser MÁS FINA que la masa que va a soportar.
    cortes: 64,
    reintentos: 12,
    vertMin: 4, vertMax: 10,
    sesgoAng: 0.13,      // desvío del ángulo recto, en radianes (~7°)
    deriva: 0.30,        // cuánto se mueve la quebrada a lo ancho de la caja
    corteMin: 0.22,      // el corte no reparte por la mitad
    areaMin: 0.0012,     // área mínima de una pieza, en lado corto al cuadrado
    tendencia: 0.42,     // duda inicial: probabilidad de tinta en la raíz
    divergencia: 0.24,   // cuánto se separan las dos ramas en cada corte
    repartos: 24,        // repartos que se prueban sobre la misma partición
    manchaMin: 0.17, manchaMax: 0.34,
    compMin: 0.13,       // compacidad mínima de una pieza: por debajo es una astilla
    bloque: 0.055,       // área máxima de una decisión, en lado corto al cuadrado
    pHoriz: 0.60,        // probabilidad de que el corte sea horizontal
  };

  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const rng = new E.Rng(seed);
    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;

    const S = min(W, H);
    const q = E.nominalAspect(max(W, H), min(W, H));
    const fw = W >= H ? q : 1, fh = W >= H ? 1 : q;
    const cfg = Object.assign({}, DEF, params);
    cfg._fw = fw; cfg._fh = fh;

    // DECLARAR Y COMPROBAR, que es la doctrina de la casa. La densidad es una
    // probabilidad por decisión, y con pocas decisiones grandes eso da una mancha
    // que se dispara: medida sin control iba del 19% al 60%, y por encima del 40%
    // la pieza deja de tener figura y suelo — es camuflaje. Así que se reparte
    // varias veces sobre la MISMA partición (que es lo caro) y se queda el reparto
    // que cae dentro de la banda. Repartir es barato: solo baja por el árbol.
    const arb = particion(rng, fw, fh, cfg);
    let rep = null, falta = Infinity;
    for (let i = 0; i < cfg.repartos; i++) {
      const r = repartir(new E.Rng((seed ^ (0x9E3B * (i + 1))) >>> 0), arb.raiz, cfg);
      const f = r.mancha < cfg.manchaMin ? cfg.manchaMin - r.mancha
              : r.mancha > cfg.manchaMax ? r.mancha - cfg.manchaMax : 0;
      if (f < falta) { falta = f; rep = r; }
      if (f === 0) break;
    }
    const regs = rep.hojas.map(h => h.poly);

    // Dos colores: los extremos por distancia, como en EVOL.
    const uniq = colors.filter((c, i) => colors.indexOf(c) === i);
    let ca = uniq[0], cb = uniq[uniq.length - 1], best = -1;
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const x = E.hexToRgb(uniq[i]), y = E.hexToRgb(uniq[j]);
        const d = abs(x[0] - y[0]) + abs(x[1] - y[1]) + abs(x[2] - y[2]);
        if (d > best) { best = d; ca = uniq[i]; cb = uniq[j]; }
      }
    }
    const suelo = E.luma(ca) >= E.luma(cb) ? ca : cb;
    const tinta = suelo === ca ? cb : ca;

    ctx.save();
    ctx.scale(S, S);
    ctx.fillStyle = suelo;
    ctx.fillRect(0, 0, fw, fh);
    // La masa va en UN solo trazado: las piezas vecinas comparten frontera, así que
    // rellenadas juntas no dejan costura. Ésa es la prueba de que no hay contorno.
    ctx.beginPath();
    rep.hojas.forEach(h => {
      if (!h.tinta) return;
      const p = h.poly;
      ctx.moveTo(p[0].x, p[0].y);
      for (let k = 1; k < p.length; k++) ctx.lineTo(p[k].x, p[k].y);
      ctx.closePath();
    });
    ctx.fillStyle = tinta;
    ctx.fill();
    ctx.restore();

    E.grain(ctx, W, H, colors, params.grainScale == null ? 1 : params.grainScale, E.unit(W, H, REF));

    return { pal, piezas: regs.length, mancha: rep.mancha, falta, regs };
  }

  function traits(res) {
    return { list: [{ key: 'Pieces', val: String(res.piezas), rarity: 'common' }], overall: 'common' };
  }

  const FORMATS = ['square', 'horizontal'];
  (global.HOKS = global.HOKS || {}).CHLLD = { render, traits, particion, cortar, DEF, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
