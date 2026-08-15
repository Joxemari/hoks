/* HRRS — itzulera. Trazos independientes, relacionados a propósito.
 *
 * ── Lo que esta familia ES, después de dos lecturas equivocadas ──────────────
 *
 * Son TRAZOS INDEPENDIENTES. Ni se tocan, ni se funden, ni se bifurcan, ni se
 * entrelazan. Cada uno empieza, viaja y muere por su cuenta. Lo que hace la obra
 * no está DENTRO de un trazo: está en cómo se colocan unos respecto a otros.
 *
 * La composición es el asunto. Y es INTENCIONAL: las relaciones se declaran y
 * luego se construye el trazo que las cumple. No emergen de un paseo con pesos —
 * eso ya se probó y da confeti.
 *
 * Los dos errores que costaron dos versiones, escritos para no repetirlos:
 *
 *   1. LA TOPOLOGÍA QUE NO EXISTE. La segunda versión leyó horquillas: un cuerpo
 *      que se parte y viaja acompañándose. No hay tal cosa. Lo que parece una
 *      bifurcación son dos trazos distintos que se acercan. Ni una sola unión en
 *      ninguna de las seis referencias.
 *   2. EL GARABATO. Las dos versiones hacían trazos de ocho a quince quiebros
 *      deambulando. Los de la referencia son LARGOS Y SIMPLES: de uno a cinco
 *      quiebros en todo el recorrido, con una dirección clara de principio a fin.
 *      Un trazo cruza media hoja y se quiebra tres veces. Eso solo explicaba la
 *      mitad del no-parecido, y es independiente de todo lo demás.
 *
 * Y de ahí, el RECINTO tampoco es una figura: el blanco grande de las referencias
 * no está encerrado por un trazo cerrado, está rodeado por VARIOS trazos que casi
 * se cierran y dejan aberturas. Es un efecto de vecindad (`cerco`), no un lazo.
 *
 * ── Las dos medidas, que siguen ─────────────────────────────────────────────
 * Anchura W y canal g ≈ W/5. Y la única restricción dura: dos tramos que no son
 * vecinos están a W+g o más. Nunca se tocan.
 *
 * Canvas 2D puro, un solo stroke(), cabos a escuadra, bisel en los codos — el
 * bisel es lo que hace SUFICIENTE la distancia mínima (ver la nota del dibujo).
 *
 *   HOKS.HRRS.render(ctx, W, H, seed, opts) → { pal, tipo, ojos, ocupacion, … }
 *   HOKS.HRRS.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;
  const BG_GRADIENT = 0;          // el suelo es PLANO: figura/fondo lo necesita

  // ── El material ─────────────────────────────────────────────────────────────
  const W_MIN = 0.030, W_MAX = 0.058;      // × lado corto
  const GAMMA = [0.17, 0.26];              // canal = W × gamma · la referencia da 1/5

  // ── El trazo: LARGO Y SIMPLE ────────────────────────────────────────────────
  // De uno a cinco quiebros en todo el recorrido. No es una preferencia: es lo
  // que separa un trazo de un garabato, y era la mitad del no-parecido.
  const QUIEBROS = [1, 5];
  // EL PLAN DE LONGITUDES, y es lo que le faltaba a la obra para tener interés.
  //
  // Declarar un rango y tirar de él da trazos TODOS IGUALES, y una hoja donde todo
  // pesa lo mismo no tiene dónde mirarse — es el «papel pintado» de EVOL. En las
  // referencias hay un trazo que cruza la hoja entera y otros cortos al lado.
  //
  // Y medido, el rango ni siquiera se cumplía: declarado 0,44…1,15, la mediana
  // COLOCADA salía 0,46 —el suelo— porque los trazos largos no caben y los cortos
  // sí, así que el filtro de la restricción escogía por mí. Sesgo de supervivencia.
  //
  // Se arregla con tres cosas juntas: se planifica la jerarquía (un protagonista
  // que cruza y una caída geométrica), se colocan DE MAYOR A MENOR (el
  // protagonista entra con la hoja vacía) y, si uno no cabe, se ACORTA antes de
  // rendirse — así el largo declarado aterriza tan largo como pueda en vez de ser
  // sustituido por otro corto cualquiera.
  const PROTA = [1.10, 1.60];               // el que cruza la hoja, × lado corto
  const CAIDA = [0.76, 0.91];               // cada trazo respecto al anterior
  const ACORTA = 0.88;                      // cuánto cede un trazo que no cabe
  // Y un SUELO de longitud: un trazo más corto que esto no es un trazo, es una
  // pizca. Salían al desplazar un trozo muy corto para el `paralelo`, y una hoja
  // con pizcas se lee como confeti — que es justo el defecto que costó la primera
  // versión entera.
  const LARGO_MIN = 0.20;
  // El reparto entre tramos es desigual —un tramo largo y dos cortos, no tres
  // iguales— porque tres tramos iguales leen como una grapa.
  const PESO_TRAMO = [0.35, 1.65];
  // Los giros son VIVOS: ni curvas ni quiebros de dos grados. Bimodal, como en
  // EVOL: el codo abierto (lo corriente) y el cerrado (el acento).
  const P_ABIERTO = 0.68;
  const GIRO_ABIERTO = [22, 62], GIRO_CERRADO = [70, 118];
  // La VIBRACIÓN es del filo y es del MATERIAL: constante dentro de una obra,
  // distinta entre obras. Es uno de los ejes que nombró el autor («otros vibran»),
  // y va por subdivisión del tramo, no por giro — un tramo vibrado sigue yendo
  // recto en conjunto.
  const P_VIBRA = 0.45;
  const VIB_AMP = [2.5, 7.5];              // grados por subdivisión
  const VIB_ONDA = [2.2, 4.5];             // × W

  // ── El campo ────────────────────────────────────────────────────────────────
  const MARGEN = 0.055;
  // Sangrado: un trazo que se sale del cuadro. Es uno de los ejes nombrados, y
  // aquí es una decisión por trazo, no del conjunto.
  const P_SANGRA = 0.16;
  const SANGRE = 0.09;                     // cuánto se pasa, × lado corto

  // ── Las relaciones ──────────────────────────────────────────────────────────
  // Esto es la familia. Cada trazo nuevo (salvo el primero) se coloca CUMPLIENDO
  // una relación declarada con uno ya puesto. Los nombres son los que el autor
  // usó al mirar las referencias.
  //
  //   paralelo   dos trazos comparten dirección a distancia casi constante. Se
  //              construye por DESPLAZAMIENTO de un trozo del otro, que es la
  //              única manera de que el canal salga constante de verdad.
  //   abanico    arrancan cerca y se abren: misma dirección ±poco, y divergen.
  //   tangencia  se acercan a un mínimo PUNTUAL y se separan. El pelo blanco
  //              aparece en un punto, no a lo largo. Es lo contrario de paralelo.
  //   caboCabo   dos extremos se buscan sin tocarse.
  //   caboCuerpo un extremo muere junto al costado de otro.
  //   suelto     lejos de todo. La separación también es una relación.
  const RELS = ['paralelo', 'abanico', 'tangencia', 'caboCabo', 'caboCuerpo', 'suelto'];
  // A qué distancia se considera cumplida cada relación, en canales D.
  const SEP_PAR = [1.0, 2.3];              // paralelo: de un canal a dos y pico
  const SEP_TAN = [1.0, 1.8];              // tangencia: el mínimo puntual
  const SEP_CABO = [1.0, 3.2];             // cabo contra cabo o cuerpo
  const SEP_SUELTO = [4.5, 11];            // suelto: lejos

  // ── Los tipos ───────────────────────────────────────────────────────────────
  // Un tipo es un REPARTO DE RELACIONES y un número de trazos. Nada más: no hay
  // topología que declarar porque no hay topología.
  //   cerco — cuántos trazos se colocan rodeando un blanco sin cerrarlo. Es el
  //           «recinto» de las referencias 1 y 6, y es vecindad, no figura.
  const TIPOS = {
    // Refs 3 y 4: pocos trazos largos, tendidos, mucho paralelo y mucho aire.
    tendido: { prob: 0.26, n: [3, 7], cerco: [0, 0],
               w: { paralelo: 0.34, abanico: 0.26, tangencia: 0.08, caboCabo: 0.10, caboCuerpo: 0.06, suelto: 0.16 } },
    // Refs 1 y 2: un cerco y trazos que lo acompañan.
    recinto: { prob: 0.30, n: [5, 9], cerco: [3, 5],
               w: { paralelo: 0.30, abanico: 0.14, tangencia: 0.12, caboCabo: 0.16, caboCuerpo: 0.16, suelto: 0.12 } },
    // Ref 6: denso, muchos paralelos cortos engranados.
    haz:     { prob: 0.28, n: [7, 11], cerco: [0, 3],
               w: { paralelo: 0.42, abanico: 0.22, tangencia: 0.10, caboCabo: 0.10, caboCuerpo: 0.10, suelto: 0.06 } },
    // El examen duro: pocos trazos y mucha separación. Sin relación no hay obra.
    disperso:{ prob: 0.16, n: [3, 6], cerco: [0, 0],
               w: { paralelo: 0.18, abanico: 0.14, tangencia: 0.20, caboCabo: 0.14, caboCuerpo: 0.10, suelto: 0.24 } },
  };
  const TIPO_NAMES = Object.keys(TIPOS);

  const REINTENTOS = 7;           // candidatos de obra con el mismo seed
  const COLOCA = 26;              // intentos de colocar un trazo cumpliendo su relación
  const GRID = 170;
  const OJO_MIN = 0.0004;

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
  function segSegDist(a, b) {
    if (cruzan(a[0], a[1], a[2], a[3], b[0], b[1], b[2], b[3])) return 0;
    return min(pointSegDist(a[0], a[1], b[0], b[1], b[2], b[3]),
               pointSegDist(a[2], a[3], b[0], b[1], b[2], b[3]),
               pointSegDist(b[0], b[1], a[0], a[1], a[2], a[3]),
               pointSegDist(b[2], b[3], a[0], a[1], a[2], a[3]));
  }
  function segsDe(pts) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) out.push([pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y]);
    return out;
  }
  function largoDe(pts) {
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) L += hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    return L;
  }
  // Distancia mínima entre dos trazos. Como son independientes, TODOS los pares
  // de tramos cuentan: no hay vecindad que eximir entre trazos distintos.
  function distTrazos(A, B) {
    let d = Infinity;
    for (const a of A) for (const b of B) { const t = segSegDist(a, b); if (t < d) d = t; }
    return d;
  }
  // Y dentro de un mismo trazo se miden los tramos NO adyacentes: un trazo que se
  // cierra sobre sí mismo también se tocaría, y eso tampoco vale.
  function seCorta(segs, D) {
    for (let i = 0; i < segs.length; i++)
      for (let j = i + 2; j < segs.length; j++)
        if (segSegDist(segs[i], segs[j]) < D) return true;
    return false;
  }

  // ── Construir un trazo ──────────────────────────────────────────────────────
  // Largo y simple: `nq` quiebros, tramos de longitud desigual, giros vivos. La
  // vibración subdivide cada tramo sin cambiar su dirección de conjunto.
  function trazar(rng, x, y, dir, largo, nq, vib) {
    const n = nq + 1;
    const pesos = [];
    let tot = 0;
    for (let i = 0; i < n; i++) { const w = rng.range(PESO_TRAMO[0], PESO_TRAMO[1]); pesos.push(w); tot += w; }
    const pts = [{ x, y }];
    let cx = x, cy = y, cd = dir, lado = rng.bool(0.5) ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const L = largo * pesos[i] / tot;
      if (vib) {
        // el filo tiembla: subdivisiones cortas con desvío alterno, así que el
        // tramo sigue yendo recto en conjunto
        const k = max(1, Math.round(L / vib.onda));
        for (let j = 0; j < k; j++) {
          const d2 = cd + (rng.bool(0.5) ? 1 : -1) * rng.range(vib.amp * 0.35, vib.amp);
          cx += Math.cos(d2 * RAD) * (L / k); cy += Math.sin(d2 * RAD) * (L / k);
          pts.push({ x: cx, y: cy });
        }
      } else {
        cx += Math.cos(cd * RAD) * L; cy += Math.sin(cd * RAD) * L;
        pts.push({ x: cx, y: cy });
      }
      if (i < n - 1) {
        // los giros alternan de lado la mayoría de las veces: dos giros seguidos
        // del mismo lado dan una espiral, y eso no está en la referencia
        if (rng.bool(0.72)) lado = -lado;
        const mag = rng.bool(P_ABIERTO) ? rng.range(GIRO_ABIERTO[0], GIRO_ABIERTO[1])
                                        : rng.range(GIRO_CERRADO[0], GIRO_CERRADO[1]);
        cd += lado * mag;
      }
    }
    return pts;
  }

  // Desplazar un trazo en paralelo: cada vértice por su bisectriz, así el canal
  // sale CONSTANTE de verdad. Es lo que hace la relación `paralelo`; con dos
  // trazos generados aparte, la distancia varía y el canal deja de ser una medida.
  function desplazar(pts, sep, lado) {
    const n = pts.length, out = [];
    const nx = [], ny = [];
    for (let i = 0; i < n - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const m = hypot(dx, dy) || 1e-9;
      nx.push(-dy / m * lado); ny.push(dx / m * lado);
    }
    for (let i = 0; i < n; i++) {
      let mx, my, esc = 1;
      if (i === 0) { mx = nx[0]; my = ny[0]; }
      else if (i === n - 1) { mx = nx[n - 2]; my = ny[n - 2]; }
      else {
        const sx = nx[i - 1] + nx[i], sy = ny[i - 1] + ny[i], m = hypot(sx, sy);
        if (m < 1e-6) { mx = nx[i]; my = ny[i]; }
        else { mx = sx / m; my = sy / m; esc = min(3.2, 1 / max(mx * nx[i] + my * ny[i], 1e-3)); }
      }
      out.push({ x: pts[i].x + mx * sep * esc, y: pts[i].y + my * sep * esc });
    }
    return out;
  }
  // Un trozo del trazo, de `a` a `b` en fracción de su longitud.
  function trozo(pts, a, b) {
    const L = largoDe(pts), s0 = L * min(a, b), s1 = L * max(a, b);
    const out = []; let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      const t0 = acc, t1 = acc + seg;
      const en = t => ({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * ((t - t0) / (seg || 1)),
                         y: pts[i].y + (pts[i + 1].y - pts[i].y) * ((t - t0) / (seg || 1)) });
      if (t1 >= s0 && t0 <= s1) {
        if (!out.length) out.push(en(max(s0, t0)));
        out.push(en(min(s1, t1)));
      }
      acc = t1;
    }
    return out.length >= 2 ? out : pts.slice(0, 2);
  }
  function dirEn(pts, i) {
    const a = pts[clamp(i, 0, pts.length - 2)], b = pts[clamp(i + 1, 1, pts.length - 1)];
    return Math.atan2(b.y - a.y, b.x - a.x) / RAD;
  }
  function puntoEn(pts, f) {
    const L = largoDe(pts) * clamp(f, 0, 1);
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      if (acc + seg >= L) {
        const t = seg < 1e-12 ? 0 : (L - acc) / seg;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
                 y: pts[i].y + (pts[i + 1].y - pts[i].y) * t, dir: dirEn(pts, i) };
      }
      acc += seg;
    }
    const n = pts.length;
    return { x: pts[n - 1].x, y: pts[n - 1].y, dir: dirEn(pts, n - 2) };
  }

  // ── Colocar un trazo cumpliendo una relación ────────────────────────────────
  // Devuelve los puntos, o null si no cabe. La relación se DECLARA y aquí se
  // construye la geometría que la cumple — no se espera a que salga sola.
  function colocar(rng, ctx, rel, obj, largoRel) {
    const { D, W } = ctx;
    const S = min(ctx.fw, ctx.fh);
    const nq = rng.int(QUIEBROS[0], QUIEBROS[1]);
    const largo = S * largoRel;

    if (rel === 'paralelo' && obj) {
      // Por DESPLAZAMIENTO de un trozo del otro: es la única forma de que el
      // canal sea constante. El trozo puede ser corto (acompaña un rato) o casi
      // entero (acompaña todo el recorrido).
      // el trozo se dimensiona al largo PEDIDO, no a una fracción al azar: si no,
      // el `paralelo` se salta el plan de longitudes por completo
      const Lo = largoDe(obj);
      const fr = clamp(largo / (Lo || 1), 0.22, 1);
      const a = rng.range(0, max(0, 1 - fr)), b = a + fr;
      const sub = trozo(obj, a, min(b, 1));
      if (sub.length < 2) return null;
      const sep = D * rng.range(SEP_PAR[0], SEP_PAR[1]);
      return desplazar(sub, sep, rng.bool(0.5) ? 1 : -1);
    }
    if (rel === 'abanico' && obj) {
      // Arrancan cerca y se abren: mismo punto de partida ±poco, dirección ±poco.
      const f = rng.bool(0.5) ? rng.range(0, 0.18) : rng.range(0.82, 1);
      const p = puntoEn(obj, f);
      const lado = rng.bool(0.5) ? 1 : -1;
      const sep = D * rng.range(1.0, 1.9);
      const nrm = p.dir + 90 * lado;
      return trazar(rng, p.x + Math.cos(nrm * RAD) * sep, p.y + Math.sin(nrm * RAD) * sep,
                    p.dir + lado * rng.range(7, 26), largo, nq, ctx.vib);
    }
    if (rel === 'tangencia' && obj) {
      // Se acercan a un mínimo PUNTUAL y se separan: cruzan en ángulo, y el punto
      // de paso se pone a la distancia del canal. Lo contrario de paralelo.
      const p = puntoEn(obj, rng.range(0.15, 0.85));
      const lado = rng.bool(0.5) ? 1 : -1;
      const sep = D * rng.range(SEP_TAN[0], SEP_TAN[1]);
      const nrm = p.dir + 90 * lado;
      const cx = p.x + Math.cos(nrm * RAD) * sep, cy = p.y + Math.sin(nrm * RAD) * sep;
      const ang = p.dir + rng.range(22, 58) * (rng.bool(0.5) ? 1 : -1);
      // el punto de tangencia cae DENTRO del trazo, no en su cabo
      const atras = largo * rng.range(0.25, 0.6);
      return trazar(rng, cx - Math.cos(ang * RAD) * atras, cy - Math.sin(ang * RAD) * atras,
                    ang, largo, nq, ctx.vib);
    }
    if ((rel === 'caboCabo' || rel === 'caboCuerpo') && obj) {
      // Un extremo mío muere cerca de un extremo suyo (o de su costado), sin
      // tocarlo. El cabo es un suceso de la composición, no un resto.
      const f = rel === 'caboCabo' ? (rng.bool(0.5) ? 0 : 1) : rng.range(0.2, 0.8);
      const p = puntoEn(obj, f);
      const sep = D * rng.range(SEP_CABO[0], SEP_CABO[1]);
      const hacia = rng.range(0, 360);
      const x0 = p.x + Math.cos(hacia * RAD) * sep, y0 = p.y + Math.sin(hacia * RAD) * sep;
      // sale ALEJÁNDOSE, si no se echa encima
      return trazar(rng, x0, y0, hacia + rng.range(-52, 52), largo, nq, ctx.vib);
    }
    // suelto, o primer trazo: en cualquier sitio con aire.
    const h = ctx.mg + W / 2 + 1e-4;
    return trazar(rng, rng.range(h, ctx.fw - h), rng.range(h, ctx.fh - h),
                  rng.range(0, 360), largo, nq, ctx.vib);
  }

  // ¿Cabe? Nunca se tocan: W+g contra todos los demás, y sin cortarse a sí mismo.
  // El sangrado es la excepción declarada — un trazo puede salirse del cuadro,
  // pero entonces se recorta contra el sangrado y sigue midiendo igual.
  function cabe(pts, ctx, sangra) {
    const h = ctx.W / 2, m = ctx.mg + h;
    // SANGRE mide el FILO DE LA TINTA, no el eje: si no, un trazo de gubia ancha
    // se pasa media anchura mas de lo declarado y el detector lo canta.
    const lim = sangra ? -ctx.S * SANGRE + h : m;
    for (const p of pts) {
      if (p.x < lim || p.x > ctx.fw - lim || p.y < lim || p.y > ctx.fh - lim) return false;
    }
    // y con sangrado, al menos la mitad del trazo tiene que estar DENTRO
    if (sangra) {
      let dentro = 0;
      for (const p of pts) if (p.x > m && p.x < ctx.fw - m && p.y > m && p.y < ctx.fh - m) dentro++;
      if (dentro < pts.length * 0.45) return false;
    }
    const segs = segsDe(pts);
    if (seCorta(segs, ctx.D)) return false;
    for (const t of ctx.trazos) if (distTrazos(segs, t.segs) < ctx.D - 1e-9) return false;
    return true;
  }

  // ── El cerco ────────────────────────────────────────────────────────────────
  // Varios trazos rodeando un blanco SIN cerrarlo. El «recinto» de las referencias
  // no es un trazo cerrado: es vecindad. Se colocan como cuerdas alrededor de un
  // centro, con hueco entre una y la siguiente.
  function cercar(rng, ctx, n) {
    const S = min(ctx.fw, ctx.fh);
    const R = S * rng.range(0.15, 0.27);
    const cx = ctx.fw * rng.range(0.3, 0.7), cy = ctx.fh * rng.range(0.3, 0.7);
    const a0 = rng.range(0, 360);
    let puestos = 0;
    for (let k = 0; k < n; k++) {
      const a = a0 + (360 / n) * k + rng.range(-16, 16);
      const px = cx + Math.cos(a * RAD) * R, py = cy + Math.sin(a * RAD) * R;
      // la cuerda va perpendicular al radio: así rodea en vez de apuntar al centro
      const dir = a + 90 + rng.range(-24, 24);
      const largo = R * rng.range(1.15, 2.1);
      for (let t = 0; t < COLOCA; t++) {
        const nq = rng.int(1, 3);
        const pts = trazar(rng, px - Math.cos(dir * RAD) * largo * 0.5,
                           py - Math.sin(dir * RAD) * largo * 0.5, dir, largo, nq, ctx.vib);
        if (largoDe(pts) >= ctx.S * LARGO_MIN && cabe(pts, ctx, false)) {
          ctx.trazos.push({ pts, segs: segsDe(pts), rel: 'cerco' });
          puestos++; break;
        }
      }
    }
    return puestos;
  }

  // ── Medir ───────────────────────────────────────────────────────────────────
  // El OJO: el suelo donde la cinta ya no cabe. Alcance de un disco de radio W/2
  // desde el borde — y aquí mide exactamente lo que el `cerco` produce: un blanco
  // rodeado por trazos que no llegan a cerrarse. Si las aberturas son más
  // estrechas que el material, el disco no entra y el blanco cuenta como ojo.
  function edt(bin, NX, NY) {
    const INF = 1e20, f = new Float64Array(max(NX, NY));
    const d2 = new Float64Array(NX * NY);
    const v = new Int32Array(max(NX, NY) + 1), z = new Float64Array(max(NX, NY) + 2);
    const dt1d = (f, n) => {
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < n; q++) {
        let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      const src = f.slice(0, n); k = 0;
      for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; f[q] = (q - v[k]) * (q - v[k]) + src[v[k]]; }
    };
    for (let x = 0; x < NX; x++) {
      for (let y = 0; y < NY; y++) f[y] = bin[y * NX + x] ? 0 : INF;
      dt1d(f, NY);
      for (let y = 0; y < NY; y++) d2[y * NX + x] = f[y];
    }
    for (let y = 0; y < NY; y++) {
      for (let x = 0; x < NX; x++) f[x] = d2[y * NX + x];
      dt1d(f, NX);
      for (let x = 0; x < NX; x++) d2[y * NX + x] = f[x];
    }
    return d2;
  }

  function medir(trazos, W, fw, fh) {
    const paso = 1 / GRID;
    const q = E.nominalAspect(max(fw, fh), min(fw, fh));
    const NL = max(4, Math.round(q * GRID));
    const NX = fw >= fh ? NL : GRID, NY = fw >= fh ? GRID : NL;
    const total = NX * NY, tinta = new Uint8Array(total), h = W / 2;
    for (const t of trazos) {
      for (const s of t.segs) {
        const x0 = max(0, Math.floor((min(s[0], s[2]) - h) / paso));
        const x1 = min(NX - 1, Math.ceil((max(s[0], s[2]) + h) / paso));
        const y0 = max(0, Math.floor((min(s[1], s[3]) - h) / paso));
        const y1 = min(NY - 1, Math.ceil((max(s[1], s[3]) + h) / paso));
        for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
          const c = gy * NX + gx;
          if (tinta[c]) continue;
          if (pointSegDist((gx + 0.5) * paso, (gy + 0.5) * paso, s[0], s[1], s[2], s[3]) <= h) tinta[c] = 1;
        }
      }
    }
    let nT = 0;
    for (let i = 0; i < total; i++) if (tinta[i]) nT++;

    const rC = h / paso, r2 = rC * rC;
    const dTinta = edt(tinta, NX, NY);
    const libre = new Uint8Array(total);
    for (let i = 0; i < total; i++) if (!tinta[i] && dTinta[i] >= r2) libre[i] = 1;
    const agua = new Uint8Array(total), pila = [];
    for (let gx = 0; gx < NX; gx++) pila.push(gx, (NY - 1) * NX + gx);
    for (let gy = 0; gy < NY; gy++) pila.push(gy * NX, gy * NX + NX - 1);
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
    const dAgua = edt(agua, NX, NY);
    const visto = new Uint8Array(total), ojos = [];
    for (let k0 = 0; k0 < total; k0++) {
      if (tinta[k0] || visto[k0] || dAgua[k0] <= r2) continue;
      let area = 0; const p = [k0]; visto[k0] = 1;
      while (p.length) {
        const k = p.pop(); area++;
        const gx = k % NX, gy = (k - gx) / NX;
        const vec = [gx > 0 ? k - 1 : -1, gx < NX - 1 ? k + 1 : -1,
                     gy > 0 ? k - NX : -1, gy < NY - 1 ? k + NX : -1];
        for (const w of vec) { if (w < 0 || visto[w] || tinta[w] || dAgua[w] <= r2) continue; visto[w] = 1; p.push(w); }
      }
      const frac = area / total;
      if (frac >= OJO_MIN) ojos.push(frac);
    }
    ojos.sort((a, b) => b - a);
    return { ojos, ocupacion: nT / total };
  }

  // El ACOMPAÑAMIENTO medido: pares de trazos que corren casi paralelos a
  // distancia de canal, y cuánto. Es el rasgo de la familia y se mide exacto
  // sobre la geometría, no sobre la rejilla.
  const PAR_ANG = 14, PAR_D = 2.6, PAR_L = 1.5;
  function pasillos(trazos, W, D) {
    let n = 0, largo = 0;
    for (let i = 0; i < trazos.length; i++) {
      for (let j = i + 1; j < trazos.length; j++) {
        let L = 0;
        for (const a of trazos[i].segs) for (const b of trazos[j].segs) {
          const ux = a[2] - a[0], uy = a[3] - a[1], um = hypot(ux, uy) || 1e-9;
          const vx = b[2] - b[0], vy = b[3] - b[1], vm = hypot(vx, vy) || 1e-9;
          if (abs((ux * vx + uy * vy) / (um * vm)) < Math.cos(PAR_ANG * RAD)) continue;
          const sep = pointSegDist((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, a[0], a[1], a[2], a[3]);
          if (sep > D * PAR_D) continue;
          const t = (px, py) => ((px - a[0]) * ux + (py - a[1]) * uy) / (um * um);
          const t0 = t(b[0], b[1]), t1 = t(b[2], b[3]);
          const lo = max(0, min(t0, t1)), hi = min(1, max(t0, t1));
          L += (hi - lo) * um;
        }
        if (L >= W * PAR_L) { n++; largo += L; }
      }
    }
    return { n, largo };
  }

  // ── Un candidato ────────────────────────────────────────────────────────────
  function tramar(rng, fw, fh, tipo, params) {
    const t = TIPOS[tipo];
    const S = min(fw, fh);
    const W = params.ancho ? S * W_MAX * params.ancho : S * rng.range(W_MIN, W_MAX);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam, D = W + g;
    const vibra = params.vibra != null ? !!params.vibra : rng.bool(P_VIBRA);
    const ctx = {
      fw, fh, S, W, g, D, mg: S * MARGEN, trazos: [],
      vib: vibra ? { amp: rng.range(VIB_AMP[0], VIB_AMP[1]), onda: W * rng.range(VIB_ONDA[0], VIB_ONDA[1]) } : null,
    };

    const N = params.trazos ? params.trazos : rng.int(t.n[0], t.n[1]);
    // La jerarquía, declarada: protagonista y caída geométrica.
    const plan = [];
    { let L = rng.range(PROTA[0], PROTA[1]);
      const c = rng.range(CAIDA[0], CAIDA[1]);
      for (let i = 0; i < N; i++) { plan.push(max(L, LARGO_MIN * 1.2)); L *= c * rng.range(0.92, 1.14); } }
    // EL CERCO primero: es lo que organiza el cuadro, y lo demás se cuelga de él.
    const nC = params.cerco != null ? params.cerco : rng.int(t.cerco[0], t.cerco[1]);
    let cerco = 0;
    if (nC >= 3) cerco = cercar(rng, ctx, nC);

    // Y el resto, cada uno con su relación DECLARADA.
    const relCount = {};
    for (const r of RELS) relCount[r] = 0;
    const pesos = RELS.map(r => ({ n: r, prob: t.w[r] }));
    // DE MAYOR A MENOR: el protagonista se coloca con la hoja vacía, que es la
    // única manera de que quepa. Colocando al azar, el largo nunca entraba.
    for (let idx = 0; idx < plan.length; idx++) {
      const rel = ctx.trazos.length === 0 ? 'suelto' : rng.weighted(pesos).n;
      let puesto = false, L = plan[idx];
      for (let k = 0; k < COLOCA && !puesto; k++) {
        const obj = ctx.trazos.length ? ctx.trazos[rng.int(0, ctx.trazos.length - 1)].pts : null;
        const sangra = rng.bool(P_SANGRA);
        const pts = colocar(rng, ctx, rel, obj, L);
        // si no cabe, CEDE longitud antes de rendirse
        if (k % 3 === 2) L = max(L * ACORTA, LARGO_MIN * 1.1);
        if (!pts || pts.length < 2) continue;
        if (largoDe(pts) < ctx.S * LARGO_MIN) continue;
        if (!cabe(pts, ctx, sangra)) continue;
        ctx.trazos.push({ pts, segs: segsDe(pts), rel, sangra });
        relCount[rel]++; puesto = true;
      }
    }

    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0, quiebros = 0;
    for (const tr of ctx.trazos) { vert += tr.pts.length; quiebros += tr.pts.length - 2; }
    return { trazos: ctx.trazos, W, g, D, cerco, relCount, vibra,
             ojos: med.ojos, ocupacion: med.ocupacion,
             pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             sangrados: ctx.trazos.filter(x => x.sangra).length };
  }

  // Cuánto se sale un candidato de lo que su tipo declara. Cero es cumplir.
  function falta(c, t, N) {
    let f = 0;
    // 1. los trazos que se pidieron. Si no caben, la obra no es la que se declaró.
    if (c.trazos.length < N) f += (N - c.trazos.length) * 0.35;
    // 2. la familia exige RELACIÓN: una obra donde nadie acompaña a nadie es un
    //    montón de rayas. Es la regla que sustituye a la vieja «franja».
    if (c.pasillos === 0 && c.trazos.length >= 3) f += 1.2;
    // 3. y exige que el trazo sea LARGO Y SIMPLE: más de seis quiebros de media
    //    es un garabato, que es el error que costó dos versiones.
    const qm = c.trazos.length ? c.quiebros / c.trazos.length : 0;
    if (!c.vibra && qm > 6) f += (qm - 6) * 0.3;
    return f;
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;
    const dd = E.inkDice(rng, P_INV);
    const rol = E.inkRoles(colors, dd);

    const S = min(W, H);
    const cuad = E.fieldMode(params) === 'square';
    const AW = cuad ? S : W, ox = (W - AW) / 2;
    const q = E.nominalAspect(max(AW, H), min(AW, H));
    const fw = AW >= H ? q : 1, fh = AW >= H ? 1 : q;

    const tipo = params.tipo || rng.weighted(TIPO_NAMES.map(n => ({ n, prob: TIPOS[n].prob }))).n;
    const t = TIPOS[tipo];
    let best = null, bestF = Infinity;
    for (let i = 0; i < REINTENTOS; i++) {
      const r2 = new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0);
      const N = params.trazos ? params.trazos : r2.int(t.n[0], t.n[1]);
      const c = tramar(new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0), fw, fh, tipo, params);
      const f = falta(c, t, N);
      if (f < bestF) { bestF = f; best = c; }
      if (f === 0) break;
    }

    const bg = E.pickBg(seed, params, BG_GRADIENT);
    if (bg === 'gradient') E.drawMeshGradient(ctx, W, H, colors, new E.Rng(seed ^ 0xDEADBEEF));
    else { ctx.fillStyle = rol.suelo; ctx.fillRect(0, 0, W, H); }

    // UN SOLO stroke(). Nada se solapa, así que nada tiene que ir antes que nada:
    // ni capas, ni halo, ni orden de pintado. Y por eso tampoco hay costura.
    //
    // `butt`: el cabo es el corte de la gubia, no un remate.
    // `bevel`: NO es preferencia de dibujo, es lo que hace SUFICIENTE la distancia
    // mínima. Con `miter` el pico de un codo sale W/2/sen(α) del vértice —0,707 W
    // en uno recto— y la regla sólo deja W/2 + g = 0,67 W de aire: una esquina
    // cruzaría el canal y soldaría la obra. Con `bevel` toda la tinta cae dentro
    // de W/2 del eje, y «los ejes a W+g» equivale a «las tintas a g». Lo comprueba
    // el control `miter` de la batería, que dispara 10 de 10.
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(S, S);
    ctx.beginPath();
    for (const tr of best.trazos) {
      ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
      for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
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
             cintas: best.trazos.length, pliegues: best.cerco,
             pasillos: best.pasillos, largoPas: best.largoPas,
             cabos: best.trazos.length * 2, vert: best.vert,
             quiebros: best.quiebros, vibra: best.vibra, sangrados: best.sangrados,
             rel: best.relCount,
             anchoRel: best.W / min(fw, fh), gam: best.g / best.W,
             ojos: best.ojos, ocupacion: best.ocupacion, esq: 0,
             geo: { cintas: best.trazos.map(x => x.pts), sangra: best.trazos.map(x => !!x.sangra),
                    SANGRE, MARGEN, W: best.W, g: best.g, D: best.D,
                    S, ox, fw, fh, veto: null } };
  }

  const P_INV = 0.14;

  // ── Traits ──────────────────────────────────────────────────────────────────
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);
    const n = res.ojos.length;
    const ojosLbl = n === 0 ? 'Abierto' : n === 1 ? 'Un ojo' : n + ' ojos';
    const ojosR = n === 0 ? 'common' : n <= 3 ? 'common' : n <= 7 ? 'uncommon' : 'rare';
    const areaOjos = res.ojos.reduce((a, b) => a + b, 0);
    const o = res.ocupacion;
    const ocLbl = o < 0.07 ? 'Leve' : o < 0.15 ? 'Justa' : o < 0.24 ? 'Cargada' : 'Trenzada';
    const ocR = o < 0.05 ? 'uncommon' : o >= 0.24 ? 'rare' : 'common';
    const qm = res.cintas ? res.quiebros / res.cintas : 0;
    const trazoLbl = qm < 1.6 ? 'Recto' : qm < 3.2 ? 'Quebrado' : 'Roto';
    const tipoR = res.tipo === 'disperso' ? 'uncommon' : 'common';
    const vibR = res.vibra ? 'uncommon' : 'common';
    const f = r => r === 'superrare' ? 0.18 : r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1;
    const s = prob * f(ojosR) * f(ocR) * f(tipoR) * f(vibR);
    const overall = s > 0.06 ? 'common' : s > 0.025 ? 'uncommon' : s > 0.008 ? 'rare' : s > 0.002 ? 'superrare' : 'legendary';
    const rel = res.rel || {};
    const relTop = Object.keys(rel).filter(k => rel[k] > 0).sort((a, b) => rel[b] - rel[a]).slice(0, 2).join(' · ') || '—';
    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Type',    val: res.tipo, rarity: tipoR },
        { key: 'Strokes', val: res.cintas + ' · ' + qm.toFixed(1) + ' bends', rarity: 'common' },
        { key: 'Line',    val: trazoLbl + (res.vibra ? ' · vibrada' : ''), rarity: vibR },
        { key: 'Relation',val: relTop, rarity: 'common' },
        { key: 'Along',   val: res.pasillos + ' × ' + res.largoPas.toFixed(1) + 'W', rarity: 'common' },
        { key: 'Ring',    val: res.pliegues ? res.pliegues + ' cerco' : '—', rarity: res.pliegues ? 'uncommon' : 'common' },
        { key: 'Eyes',    val: ojosLbl + (n ? ' · ' + (areaOjos * 100).toFixed(1) + '%' : ''), rarity: ojosR },
        { key: 'Ink',     val: ocLbl + ' · ' + Math.round(o * 100) + '%', rarity: ocR },
        { key: 'Bleed',   val: res.sangrados ? res.sangrados + ' fuera' : 'dentro', rarity: res.sangrados ? 'uncommon' : 'common' },
        { key: 'Paper',   val: res.rol.inv ? 'Oscuro' : res.rol.papel === 'crudo' ? 'Crudo' : 'Blanco',
          rarity: res.rol.papel === 'crudo' ? 'uncommon' : 'common' },
      ],
      overall,
    };
  }

  const FORMATS = ['square', 'horizontal'];
  (global.HOKS = global.HOKS || {}).HRRS = { render, traits, TIPOS, RELS, BG_GRADIENT, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
