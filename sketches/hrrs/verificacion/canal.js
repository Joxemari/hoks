/* canal.js — la regla 3, medida exacta sobre la geometria publicada.
 *
 *   node canal.js <algo.js> [n] [base] [configs]
 *
 * Distancia minima entre TODOS los pares de tramos no contiguos, en unidades de
 * D = W + g. Sano es ≥ 1,000. No hay umbral: 1,0 es la regla.
 *
 * Se escribe entero y aparte de `cabe()`, recorriendo todos los pares sin
 * excepciones y sin heredar su idea de que es "contiguo": si `cabe()` se olvida de
 * un par —las otras cintas, el vecino de dos mas alla— esto lo ve. Es lo que
 * comprueban los controles `vecino` y `otracinta`.
 *
 * Y es EXACTO: geometria, no rejilla. Significa lo mismo en pantalla y a 300 dpi,
 * que es lo que hace falta cuando la magnitud que se mide es la que decide si la
 * obra esta bien.
 */
const { recorrer, stats } = require('./_lanza');

const algo = process.argv[2] || './hrrs_test.js';
const N = parseInt(process.argv[3] || '80', 10);
const BASE = parseInt(process.argv[4] || '760', 10);
const ONLY = process.argv[5] || null;

function medir({ seed, fmt, params, base }) {
  const d = HOKS.fmtDims(fmt, base);
  const cv = document.createElement('canvas');
  cv.width = 8; cv.height = 8;                  // no hace falta pintar para medir
  const res = HOKS.HRRS.render(cv.getContext('2d'), d.W, d.H, seed, {
    palettes: HOKS.normalizePalettes(HOKS.DEFAULTS),
    params: Object.assign({}, params, { grainScale: 0 }),
  });
  const g = res.geo, D = g.D;
  const segs = [];
  g.cintas.forEach((pts, c) => {
    for (let i = 0; i < pts.length - 1; i++)
      segs.push({ ax: pts[i].x, ay: pts[i].y, bx: pts[i + 1].x, by: pts[i + 1].y, c, i });
  });

  const pSeg = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    if (l2 < 1e-18) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const cruzan = (ax, ay, bx, by, cx, cy, dx2, dy2) => {
    const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx2, dy2);
    const d3 = o(cx, cy, dx2, dy2, ax, ay), d4 = o(cx, cy, dx2, dy2, bx, by);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  };
  const ssd = (A, B) => {
    if (cruzan(A.ax, A.ay, A.bx, A.by, B.ax, B.ay, B.bx, B.by)) return 0;
    return Math.min(pSeg(A.ax, A.ay, B.ax, B.ay, B.bx, B.by), pSeg(A.bx, A.by, B.ax, B.ay, B.bx, B.by),
                    pSeg(B.ax, B.ay, A.ax, A.ay, A.bx, A.by), pSeg(B.bx, B.by, A.ax, A.ay, A.bx, A.by));
  };

  let peor = Infinity, pares = 0, malos = 0, solapes = 0, donde = null;
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const A = segs[i], B = segs[j];
      if (A.c === B.c && Math.abs(A.i - B.i) <= 1) continue;   // vecinos: comparten vertice
      pares++;
      const u = ssd(A, B) / D;
      // 1e-6 es COMA FLOTANTE, no un umbral. El brazo del pliegue mide D/sen(phi)
      // exactos y una voz que nace al lado se pone a D exactos, asi que su par sale
      // en 0,999999999 y sin esto el detector marca como defecto justo la figura
      // que la obra existe para producir. La regla sigue siendo 1,0.
      if (u < 1 - 1e-6) { malos++; if (!donde) donde = [A.c, A.i, B.c, B.i]; }
      if (ssd(A, B) < g.W * (1 - 1e-6)) solapes++;            // tintas SOLAPADAS: eso ya es un toque
      if (u < peor) peor = u;
    }
  }
  // ── LA HOLGURA DECLARADA ────────────────────────────────────────────────────
  // El algoritmo se permite RELLENAR la esquina mas alla de W/2, y declara cuanto en
  // `geo.relleno`. Que la tinta obedezca a ese plan lo comprueba `toque.js` sobre el
  // pixel; lo que se comprueba AQUI es que el plan mismo sea legal — que lo que un
  // vertice se permite rellenar nunca se coma el pelo de otro trazo.
  //
  // La cuenta: si el eje ajeno mas cercano a un vertice esta a `d`, mi tinta puede
  // llegar a `d - W/2 - g` y no mas, porque el otro llega a W/2 hacia mi y entre los
  // dos tiene que quedar `g`. Sin control, este numero seria palabra del algoritmo
  // sobre si mismo: su control es `holgura`.
  let holgMalos = 0, holgPeor = 0;
  const rell = g.relleno || [];
  for (let c = 0; c < g.cintas.length; c++) {
    const r = rell[c]; if (!r) continue;
    const pts = g.cintas[c];
    for (let i = 0; i < pts.length; i++) {
      let d = Infinity;
      for (const B of segs) {
        if (B.c === c && B.i >= i - 2 && B.i <= i + 1) continue;
        const t2 = pSeg(pts[i].x, pts[i].y, B.ax, B.ay, B.bx, B.by);
        if (t2 < d) d = t2;
      }
      const tope = Math.max(g.W / 2, d - g.W / 2 - g.g);
      const exceso = (r[i] - tope) / D;
      if (exceso > 1e-6) { holgMalos++; if (exceso > holgPeor) holgPeor = exceso; }
    }
  }

  return { seed, pares, malos, solapes, peor: +peor.toFixed(4), donde,
           holgMalos, holgPeor: +holgPeor.toFixed(4),
           cintas: res.cintas, tipo: res.tipo, vert: res.vert };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir);
  const ok = rs.filter(r => r && !r.err && isFinite(r.peor));
  if (!ok.length) {
    console.log(`canal · NADA MEDIDO · ${rs.filter(r => r.err).length} errores`);
    const e = rs.find(r => r.err); if (e) console.log('  ' + e.err);
    process.exit(2);
  }
  const malas = ok.filter(r => r.malos > 0), sol = ok.filter(r => r.solapes > 0);
  const st = stats(ok.map(r => r.peor));
  const pares = ok.reduce((a, r) => a + r.pares, 0);
  console.log(`\ncanal · ${algo} · ${ok.length} obras · ${pares} pares no contiguos`);
  console.log(`  separacion minima, en canales D=W+g (1,000 = la regla):`);
  console.log(`  min ${st.min}  p50 ${st.p50}  max ${st.max}`);
  console.log(`  OBRAS QUE INCUMPLEN: ${malas.length} de ${ok.length}`);
  console.log(`  obras con TINTAS SOLAPADAS: ${sol.length} de ${ok.length}`);
  const holg = ok.filter(r => r.holgMalos > 0);
  console.log(`  OBRAS CON UNA HOLGURA QUE SE COME EL PELO: ${holg.length} de ${ok.length}` +
              `  (peor exceso ${stats(ok.map(r => r.holgPeor)).max} canales)`);
  const porCfg = {};
  for (const r of ok) { porCfg[r.cfg] = porCfg[r.cfg] || { n: 0, mal: 0, min: 9 };
    porCfg[r.cfg].n++; if (r.malos) porCfg[r.cfg].mal++;
    porCfg[r.cfg].min = Math.min(porCfg[r.cfg].min, r.peor); }
  for (const k of Object.keys(porCfg))
    console.log(`    ${k.padEnd(12)} ${porCfg[k].mal}/${porCfg[k].n}  min ${porCfg[k].min.toFixed(3)}`);
  malas.slice(0, 6).forEach(r => console.log(`    ✗ #${r.seed} ${r.cfg} ${r.tipo} · ${r.malos} pares · min ${r.peor} · ${JSON.stringify(r.donde)}`));
  process.exit((malas.length || holg.length) ? 1 : 0);
})();
