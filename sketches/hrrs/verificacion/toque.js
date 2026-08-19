/* toque.js — que la TINTA sea exactamente la GEOMETRIA, ni un pixel mas.
 *
 *   node toque.js <algo.js> [n] [base] [configs]
 *
 * ── Por que este detector es asi y no como parecia ─────────────────────────────
 *
 * La primera version media la PROFUNDIDAD de la tinta: siendo la cinta la suma de
 * Minkowski del eje con un disco de W/2, ningun punto de tinta deberia estar a mas
 * de W/2 del suelo, y lo que pasara de ahi seria dos pasadas fundidas. Dio 24 de
 * 24 obras "con toque", con la profundidad clavada entre 1,44 y 1,60 mitades de
 * anchura. Un numero tan igual en todas las obras no es un defecto: es el
 * detector inventando.
 *
 * El razonamiento tenia un agujero, y es el mismo que la trampa 2 de TRZS (el
 * inglete del codo): en un GIRO los dos tramos son CONTIGUOS, se solapan entre
 * ellos, y su union es legitimamente mas gruesa que W. Cuanto mas cerrado el giro,
 * mas gruesa. La regla 3 no lo prohibe —son el mismo trozo de cinta, no dos
 * pasadas— asi que la tinta profunda ahi es correcta.
 *
 * Y peor: medido, un giro legal de 152° da 1,94 mitades de anchura, mientras que
 * dos pasadas de verdad fundidas a 0,86 W dan 1,86. El defecto mide MENOS que lo
 * sano, asi que por profundidad no se pueden separar. No es que faltara afinar el
 * umbral: es que el criterio no distingue.
 *
 * ── Lo que se mide en su lugar ─────────────────────────────────────────────────
 *
 * La comprobacion se parte en dos, y cada mitad no tiene umbral:
 *
 *   · `canal.js` comprueba la GEOMETRIA: ningun par de tramos no contiguos a menos
 *     de W+g. Exacto, sobre los ejes.
 *   · este comprueba que la TINTA no anade nada a esa geometria: todo pixel
 *     entintado esta a W/2 o menos del eje, y todo punto a W/2 o menos del eje
 *     esta entintado.
 *
 * Las dos juntas son la garantia entera, y hace falta la segunda porque la primera
 * habla de ejes y lo que se publica son pixeles. Si el dibujo se pasara del eje
 * —un inglete que saca un pico, un cabo redondo que se pasa medio disco— la
 * distancia entre ejes seguiria siendo correcta y las tintas se tocarian. Eso es
 * exactamente lo que disparan los controles `miter` y `cabo`, y es la afirmacion
 * que el `stroke` de algo.js hace sobre el bisel: aqui se comprueba, no se cree.
 *
 * La unica tolerancia es de rasterizacion: el filo antialias cae de un lado o de
 * otro y eso mueve el borde menos de un pixel. Se da 1 px por cada lado, y se
 * cuentan los pixeles que se pasan de ahi.
 */
const { recorrer, stats } = require('./_lanza');

const algo = process.argv[2] || './hrrs_test.js';
const N = parseInt(process.argv[3] || '60', 10);
const BASE = parseInt(process.argv[4] || '900', 10);
const ONLY = process.argv[5] || null;
const TOL = 1.0;

function medir({ seed, fmt, params, base, extra }) {
  const TOL = extra.tol;
  const R_INF = 1e9;
  const d = HOKS.fmtDims(fmt, base);
  const cv = document.createElement('canvas');
  cv.width = d.W; cv.height = d.H;
  const x = cv.getContext('2d', { willReadFrequently: true });
  // EL FONDO SE FUERZA A PLANO, y no es hacer la vista gorda. Con el mesh
  // gradient el suelo no es un color: es cuatro colores de la paleta
  // interpolados, y algunos caen mas cerca de la tinta que del suelo nominal, asi
  // que la clasificacion por color mete de tinta trozos de fondo. Medido: 11 de
  // 12 configuraciones a 0/21 y la del degradado a 17/21, con 170.000–600.000 px
  // "fuera" en las ESQUINAS del cuadro. Es la trampa 4 de TRZS (`fg2` tomado por
  // tinta) con otra cara.
  //
  // Forzarlo no pierde cobertura: `E.pickBg` va por un hash del seed y no por el
  // rng, y el fondo se pinta ANTES del stroke, asi que la TINTA es identica con
  // degradado y sin el. Este detector mide la tinta. El degradado no cambia lo que
  // mide — solo impide medirlo.
  const res = HOKS.HRRS.render(x, d.W, d.H, seed, {
    palettes: HOKS.normalizePalettes(HOKS.DEFAULTS),
    params: Object.assign({}, params, { grainScale: 0, bg: 'solid' }),
  });
  const g = res.geo, NX = d.W, NY = d.H, total = NX * NY;
  const S = g.S, ox = g.ox, W = g.W * S, h = W / 2;
  const px = x.getImageData(0, 0, NX, NY).data;

  // Clasificar tinta. Se compara SOLO contra el color de la tinta, con el radio a
  // mitad de camino del suelo: con el fondo en degradado el suelo no es un color
  // plano, y compararlo contra `rol.suelo` clasificaria mal medio cuadro.
  const t = HOKS.hexToRgb(res.rol.tinta), s = HOKS.hexToRgb(res.rol.suelo);
  const lim = ((t[0] - s[0]) ** 2 + (t[1] - s[1]) ** 2 + (t[2] - s[2]) ** 2) / 4;
  const esTinta = i => {
    const j = i * 4;
    return ((px[j] - t[0]) ** 2 + (px[j + 1] - t[1]) ** 2 + (px[j + 2] - t[2]) ** 2) < lim;
  };

  // Distancia de cada pixel al eje, en pixeles. Se rasteriza por tramos con caja,
  // que si no esto es NX·NY·tramos.
  const dist = new Float64Array(total).fill(R_INF);
  const pSeg = (px0, py0, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    if (l2 < 1e-18) return Math.hypot(px0 - ax, py0 - ay);
    let tt = ((px0 - ax) * dx + (py0 - ay) * dy) / l2;
    tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
    return Math.hypot(px0 - (ax + tt * dx), py0 - (ay + tt * dy));
  };
  // El radio de la caja de cada tramo. Solo hace falta DISTINGUIR dist ≤ h+TOL de
  // dist > h+TOL, asi que la caja se ajusta a eso: un pixel al que no llega
  // ninguna caja ya esta fuera por definicion. Inflarla para poder medir tambien
  // el pico de un inglete (5·h) costaba 6 M de distancias por obra y la bateria de
  // 250 obras no acababa. La MAGNITUD del exceso se calcula despues, y solo para
  // los pocos pixeles que fallan: exacta y gratis.
  const R = h + TOL + 2;
  for (const pts of g.cintas) {
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = pts[i].x * S + ox, ay = pts[i].y * S;
      const bx = pts[i + 1].x * S + ox, by = pts[i + 1].y * S;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - R));
      const x1 = Math.min(NX - 1, Math.ceil(Math.max(ax, bx) + R));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by) - R));
      const y1 = Math.min(NY - 1, Math.ceil(Math.max(ay, by) + R));
      for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
          const c = gy * NX + gx;
          const dd = pSeg(gx + 0.5, gy + 0.5, ax, ay, bx, by);
          if (dd < dist[c]) dist[c] = dd;
        }
      }
    }
  }

  // Los dos incumplimientos, y el peor de cada uno.
  //   fuera  = tinta donde la geometria no la pone (inglete, cabo redondo)
  //   mordido= geometria sin tinta. NO es un defecto: es el BISEL. El bisel corta
  //            la esquina, asi que la tinta es un SUBCONJUNTO de la suma de
  //            Minkowski, no su igual — y subconjunto es exactamente lo que hace
  //            falta para que "los ejes a W+g" implique "las tintas a g". Se
  //            cuenta para poder verlo, no para suspender.
  let fuera = 0, mordido = 0, peorFuera = 0, fx = 0, fy = 0;
  const sospechosos = [];
  for (let i = 0; i < total; i++) {
    const dd = dist[i], ink = esTinta(i);
    if (ink && dd > h + TOL) { fuera++; if (sospechosos.length < 4000) sospechosos.push(i); }
    else if (!ink && dd < h - TOL) mordido++;
  }
  // La distancia de verdad, solo de los que fallan: bucle sobre todos los tramos.
  //
  // Y AQUI ENTRA EL RELLENO DE ESQUINA. Desde que el negro rellena la esquina hasta
  // donde le deja el margen —que es lo que hace el original: el blanco es una
  // incision de anchura fija y la tinta ocupa el resto—, la tinta SI pasa de W/2 del
  // eje, y a proposito. Pero no en cualquier sitio ni en cualquier cantidad: solo
  // alrededor de un vertice, y solo hasta la holgura que el algoritmo calculo y
  // DECLARA en `geo.relleno`. Asi que el detector no afloja el umbral: comprueba que
  // la tinta de mas cae dentro de lo declarado, vertice por vertice.
  //
  // Que la propia holgura no se coma el canal de nadie es otra afirmacion, y se
  // comprueba en otro sitio (`canal.js`, sobre la geometria). Aqui solo se mide que
  // el pixel obedece al plan.
  const rell = g.relleno || [];
  for (const i of sospechosos) {
    const gx = i % NX, gy = (i - gx) / NX;
    const px = gx + 0.5, py = gy + 0.5;
    let dmin = 1e9;
    for (const pts of g.cintas) {
      for (let k = 0; k < pts.length - 1; k++) {
        const dd2 = pSeg(px, py, pts[k].x * S + ox, pts[k].y * S,
                         pts[k + 1].x * S + ox, pts[k + 1].y * S);
        if (dd2 < dmin) dmin = dd2;
      }
    }
    if (dmin <= h + TOL) continue;
    // ¿lo explica un relleno declarado?
    let explicado = false;
    for (let c = 0; c < g.cintas.length && !explicado; c++) {
      const pts = g.cintas[c], r = rell[c];
      if (!r) continue;
      for (let k = 0; k < pts.length; k++) {
        const lim = r[k] * S;
        if (lim <= h + TOL) continue;
        const dv = Math.hypot(px - (pts[k].x * S + ox), py - pts[k].y * S);
        if (dv <= lim + TOL) { explicado = true; break; }
      }
    }
    if (explicado) { fuera--; continue; }
    if (dmin - h > peorFuera) { peorFuera = dmin - h; fx = gx; fy = gy; }
  }
  // ── El cabo: que el remate sea PLANO (regla 5) ────────────────────────────
  // El cabo redondo NO saca tinta de la suma de Minkowski —un semidisco de radio
  // W/2 centrado en el vertice del eje cae dentro de ella—, asi que el bloque de
  // arriba no lo ve, y no por estar mal: es que el cabo a escuadra es una regla de
  // la GRAMATICA y no de la seguridad. El bisel si es de seguridad. Se miden
  // aparte porque son dos cosas distintas.
  //
  // Se cuenta la tinta que se pasa del plano del cabo, y solo la que esta a W/2
  // del vertice: otra pasada esta a D = 1,2·W del eje por la regla 3, o sea mas
  // lejos que W/2, asi que no puede colarse en la medida.
  // Y hay que reconocer la TINTA PROPIA, que es la trampa 8 de TRZS otra vez y
  // aparecio igual: 4 obras sanas de 10 marcadas, siempre en el ULTIMO vertice y
  // siempre con el tramo terminal corto (1,1–1,6 anchuras). La causa es que un
  // giro cerrado en el penultimo vertice manda el tramo ANTERIOR hacia delante:
  // con un giro de 152° ese tramo sale a 28° de la direccion del cabo, o sea que
  // barre por delante del plano del remate y su tinta cae dentro del disco. Es
  // tinta de la propia cinta y es legitima.
  //
  // El argumento de "otra pasada esta a D" no la cubre, porque no es otra pasada:
  // es el vecino contiguo, al que la regla 3 no mide. Asi que un pixel solo cuenta
  // si NINGUN otro tramo lo explica.
  const todos = [];
  g.cintas.forEach((pts, ci) => {
    for (let i = 0; i < pts.length - 1; i++)
      todos.push({ ax: pts[i].x * S + ox, ay: pts[i].y * S,
                   bx: pts[i + 1].x * S + ox, by: pts[i + 1].y * S, ci, i });
  });
  let cabo = 0, caboMax = 0;
  g.cintas.forEach((pts, ci) => {
    const finales = [[pts[0], pts[1], 0], [pts[pts.length - 1], pts[pts.length - 2], pts.length - 2]];
    for (const [v, w, iSeg] of finales) {
      const vx = v.x * S + ox, vy = v.y * S, wx = w.x * S + ox, wy = w.y * S;
      const m = Math.hypot(vx - wx, vy - wy) || 1e-9;
      const ux = (vx - wx) / m, uy = (vy - wy) / m;      // hacia fuera
      const r = Math.ceil(h + TOL + 2);
      for (let gy = Math.max(0, Math.floor(vy - r)); gy <= Math.min(NY - 1, Math.ceil(vy + r)); gy++) {
        for (let gx = Math.max(0, Math.floor(vx - r)); gx <= Math.min(NX - 1, Math.ceil(vx + r)); gx++) {
          const dxp = gx + 0.5 - vx, dyp = gy + 0.5 - vy;
          if (Math.hypot(dxp, dyp) > h + TOL) continue;
          const proy = dxp * ux + dyp * uy;
          if (proy <= TOL) continue;                     // no se pasa del plano
          if (!esTinta(gy * NX + gx)) continue;
          // ¿lo explica otro tramo? (cualquiera que no sea el propio terminal)
          let propio = false;
          for (const t2 of todos) {
            if (t2.ci === ci && t2.i === iSeg) continue;
            if (pSeg(gx + 0.5, gy + 0.5, t2.ax, t2.ay, t2.bx, t2.by) <= h + TOL) { propio = true; break; }
          }
          if (propio) continue;
          cabo++; if (proy > caboMax) caboMax = proy;
        }
      }
    }
  });

  return { seed, W: +W.toFixed(1), fuera, mordido, cabo, caboMax: +caboMax.toFixed(1),
           // El exceso en MITADES DE ANCHURA, que significa lo mismo con
           // cualquier gubia y a cualquier tamano.
           exceso: +(peorFuera / h).toFixed(3), x: fx, y: fy,
           cintas: res.cintas, tipo: res.tipo };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir, { tol: TOL });
  const ok = rs.filter(r => r && !r.err);
  if (!ok.length) {
    console.log(`toque · NADA MEDIDO · ${rs.filter(r => r.err).length} errores`);
    const e = rs.find(r => r.err); if (e) console.log('  ' + e.err);
    process.exit(2);
  }
  const malas = ok.filter(r => r.fuera > 0);
  const st = stats(ok.map(r => r.exceso));
  console.log(`\ntoque · ${algo} · ${ok.length} obras a ${BASE} px de lado corto`);
  console.log(`  la tinta se pasa del eje, en mitades de anchura (0 = exacta):`);
  console.log(`  p50 ${st.p50}  p90 ${st.p90}  max ${st.max}`);
  console.log(`  OBRAS CON TINTA FUERA DE LA GEOMETRIA: ${malas.length} de ${ok.length}`);
  const mord = stats(ok.map(r => r.mordido));
  console.log(`  mordido del bisel (informativo, no es defecto): p50 ${mord.p50} px  max ${mord.max} px`);
  const cab = ok.filter(r => r.cabo > 0);
  console.log(`  OBRAS CON TINTA MAS ALLA DEL CABO: ${cab.length} de ${ok.length}` +
              `  (px: p50 ${stats(ok.map(r => r.cabo)).p50}  max ${stats(ok.map(r => r.cabo)).max})`);
  const porCfg = {};
  for (const r of ok) { porCfg[r.cfg] = porCfg[r.cfg] || { n: 0, mal: 0, max: 0, px: 0 };
    porCfg[r.cfg].n++; if (r.fuera) porCfg[r.cfg].mal++;
    porCfg[r.cfg].px += r.fuera;
    porCfg[r.cfg].max = Math.max(porCfg[r.cfg].max, r.exceso); }
  for (const k of Object.keys(porCfg))
    console.log(`    ${k.padEnd(12)} ${porCfg[k].mal}/${porCfg[k].n}  ${porCfg[k].px} px  peor ${porCfg[k].max.toFixed(2)}`);
  malas.slice(0, 6).forEach(r => console.log(`    ✗ #${r.seed} ${r.cfg} ${r.tipo} · ${r.fuera} px · exceso ${r.exceso} · en (${r.x},${r.y})`));
  process.exit((malas.length || cab.length) ? 1 : 0);
})();
