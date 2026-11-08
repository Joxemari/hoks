/* solape.js — la regla del autor: NO HAY SOLAPE SI NO ES CRUCE CLARO.
 *
 *   node solape.js <algo.js> [n] [base] [configs]
 *
 * Dos trazos distintos cuyos ejes se acercan a menos de la anchura (sus tintas se
 * meterian una en la otra) solo pueden hacerlo CRUZANDOSE, a CRUCE_MIN grados o mas.
 * Lo demas es un solape: un trazo montado en otro, un compañero metido en su padre,
 * dos cabos que se pisan. Se mide SOBRE LA TINTA: cada trazo pintado solo, sin halo,
 * y los pixeles donde dos coinciden (mas de 0,15 W²: lo de menos es el filo). Medir
 * sobre los ejes cantaba el corte entre dos piezas de un mismo camino, que tienen
 * los ejes a un pelo cabo con cabo y no se pisan. En todas las configuraciones: el halo fabrica el pelo entre dos tintas que
 * se pisan, y por eso un solape con halo PARECE un cruce. Es lo que convirtio en
 * cruces lo que no lo era en las ultimas vueltas, y lo que el autor canto en hoja.
 *
 * Las ramas de una pieza (`geo.ramas`) no cuentan contra su tronco: son la misma
 * tinta. Si cuentan contra los demas trazos.
 */
const { recorrer, stats } = require('./_lanza');

const algo = process.argv[2] || './hrrs_test.js';
const N = parseInt(process.argv[3] || '80', 10);
const BASE = parseInt(process.argv[4] || '760', 10);
const ONLY = process.argv[5] || null;

function medir({ seed, fmt, params, base }) {
  const d = HOKS.fmtDims(fmt, base);
  const cv = document.createElement('canvas'); cv.width = 8; cv.height = 8;
  const res = HOKS.HRRS.render(cv.getContext('2d'), d.W, d.H, seed, {
    palettes: HOKS.normalizePalettes(HOKS.DEFAULTS), params: Object.assign({}, params, { grainScale: 0 }),
  });
  const g = res.geo, CM = g.CRUCE_MIN || 65, W = d.W, H = d.H, Wpx = g.W * g.S;
  // SOBRE LA TINTA, no sobre los ejes: dos piezas cortadas de un mismo camino tienen
  // los ejes a un pelo cabo con cabo, y eso no es solape. Se pinta cada trazo SOLO,
  // sin halo, con la mano publicada, y se cuentan los pixeles donde dos trazos
  // distintos coinciden. Las ramas van con su tronco.
  const n = g.cintas.length;
  const cuenta = new Uint8Array(W * H), primero = new Int16Array(W * H), pares = new Map();
  const et = new Int32Array(W * H);
  for (let k = 0; k < n; k++) {
    const tr = { pts: g.cintas[k], gubia: g.gubia ? g.gubia[k] : null, W: g.anchos ? g.anchos[k] || undefined : undefined, ramas: g.ramas ? g.ramas[k] : null };
    et.fill(0);
    HOKS.HRRS.pintarHalo(null, [tr], g.W, 0, g.S, g.ox, '#000', W, H, g.esquina, et, (g.manoSeed || 0) + k * 7919, g.manoAmp);
    for (let i = 0; i < W * H; i++) if (et[i]) { if (cuenta[i] === 0) { primero[i] = k; } else { const a = primero[i], key = a * 4096 + k; const o = pares.get(key) || { px: 0, sx: 0, sy: 0 }; o.px++; o.sx += i % W; o.sy += (i / W) | 0; pares.set(key, o); } cuenta[i]++; }
  }
  // el angulo entre los dos trazos en el punto del solape: el tramo de cada uno mas
  // cercano al centroide del solape
  const dirEn = (k, x, y) => { let best = Infinity, ang = 0; const mira = pts => { for (let i = 0; i + 1 < pts.length; i++) { const ax = g.ox + pts[i].x * g.S, ay = pts[i].y * g.S, bx = g.ox + pts[i + 1].x * g.S, by = pts[i + 1].y * g.S;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9; let t = ((x - ax) * dx + (y - ay) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dd = Math.hypot(x - ax - t * dx, y - ay - t * dy); if (dd < best) { best = dd; ang = Math.atan2(dy, dx); } } };
    mira(g.cintas[k]); if (g.ramas && g.ramas[k]) for (const r of g.ramas[k]) mira(r); return ang; };
  let solapes = 0, cruces = 0, peor = 0, donde = null;
  const umbral = 0.15 * Wpx * Wpx;   // menos de esto es el filo del antialias, no tinta
  for (const [key, o] of pares) { if (o.px < umbral) continue; const a = (key / 4096) | 0, b = key % 4096;
    const cx = o.sx / o.px, cy = o.sy / o.px; let ang = Math.abs((dirEn(a, cx, cy) - dirEn(b, cx, cy)) * 180 / Math.PI) % 180; if (ang > 90) ang = 180 - ang;
    // el angulo se estima en el centroide del solape y en un trazo curvo sale corto:
    // 8 grados de tolerancia, que en las obras del calco separan un cruce de 63° de
    // un solape de verdad (los peores de verdad salen a 0–30°)
    if (ang >= CM - 8) { cruces++; continue; }
    solapes++; const u = o.px / (Wpx * Wpx); if (u > peor) { peor = u; donde = [a, b, Math.round(ang)]; } }
  return { seed, solapes, cruces, peor: solapes ? peor : null, donde, n };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir);
  const err = rs.filter(r => r.err); if (err.length) console.error(`  ${err.length} obras con error: ${err[0].err}`);
  const ok = rs.filter(r => !r.err), malas = ok.filter(r => r.solapes > 0);
  console.log(`obras ${ok.length}   cruces legales ${ok.reduce((a, r) => a + r.cruces, 0)}`);
  console.log(`  OBRAS CON SOLAPE (dos tintas que se pisan sin cruce claro): ${malas.length} de ${ok.length}`);
  const porCfg = {}; ok.forEach(r => { porCfg[r.cfg] = porCfg[r.cfg] || [0, 0]; porCfg[r.cfg][1]++; if (r.solapes) porCfg[r.cfg][0]++; });
  Object.keys(porCfg).forEach(k => console.log(`    ${k.padEnd(12)} ${porCfg[k][0]}/${porCfg[k][1]}`));
  malas.sort((a, b) => b.peor - a.peor).slice(0, 6).forEach(r => console.log(`    ✗ #${r.seed} ${r.cfg} · ${r.solapes} pares · el mayor ${r.peor.toFixed(2)} W² · trazos ${r.donde[0]}/${r.donde[1]} a ${r.donde[2]}°`));
  process.exit(malas.length ? 1 : 0);
})();
