/* obra.js — lo que se mide sobre la obra y no sobre el toque: margen, ojos,
 * cadencia y ocupacion.
 *
 *   node obra.js <algo.js> [n] [base] [configs]
 *
 * Van juntos porque los cuatro salen del mismo render y ninguno necesita mirar el
 * pixel: el margen se mide contra el eje (y que la tinta no se pase del eje ya lo
 * prueba `toque.js`, asi que medirlo aqui otra vez seria medir dos veces lo mismo).
 *
 *   margen    — el BORDE de la cinta contra el borde del cuadro. Sano > 0.
 *               Control: `margen`.
 *   ojos      — cuantos y con que reparto de tamanos. La regla 6 dice que un
 *               recinto con todos los ojos iguales es un laberinto, asi que lo que
 *               se mide es la DISPERSION: ojo mayor / ojo mediano. SIN CONTROL —
 *               ver la nota de abajo, y no leerlo como verificado.
 *   cadencia  — dispersion de las longitudes de tramo (CV). Es DISTRIBUCIONAL, no
 *               un defecto por obra: una obra con tramos parejos no esta mal, una
 *               FAMILIA en la que todas los tienen parejos si. Y tiene suelo — el
 *               brazo del pliegue mide D/sen(phi) por construccion, asi que un
 *               tercio de los tramos es forzosamente de otra longitud y el CV no
 *               puede bajar a cero por mucho que se rompa el resto.
 *               HOY TAMPOCO TIENE CONTROL: el que tuvo (`rejilla`) se cayo de
 *               `mktest.py` al reescribirse el modelo y no se ha vuelto a poner, asi
 *               que este numero es DESCRIPTIVO igual que el de los ojos. Queda
 *               escrito aqui, y no borrado, para que no se lea como comprobado.
 *   ojos      — el reparto de tamanos NO TIENE CONTROL QUE DISPARE: cuando lo tuvo
 *               salia 9 de 120 contra 6 de 120 sano, que es lo mismo. Asi que estos
 *               numeros son DESCRIPTIVOS y sirven para el triaje del lote, no para
 *               dar nada por comprobado. Queda escrito para que nadie lea el cero
 *               de al lado como si estuviera verificado.
 *   ocupacion — fraccion de pliego entintada. El vacio es material: se mide.
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
    palettes: HOKS.normalizePalettes(HOKS.DEFAULTS),
    params: Object.assign({}, params, { grainScale: 0 }),
  });
  const g = res.geo, h = g.W / 2;

  // MARGEN: lo mas cerca que el borde de la cinta llega del borde del cuadro, en
  // fraccion del lado corto. Se mide contra el campo normalizado, que es donde el
  // algoritmo lo decide.
  // Y hay que separar el SANGRADO del escape: un trazo puede salirse del cuadro a
  // proposito (es uno de los ejes de la familia), pero solo hasta el sangrado
  // declarado. Sin distinguirlos el detector marcaba 20 de 60 obras sanas — el
  // sangrado leido como defecto.
  let margen = Infinity, escapes = 0, sangrados = 0;
  const lim = -(g.SANGRE || 0.09) * Math.min(g.fw, g.fh);
  g.cintas.forEach((pts, k) => {
    const sangra = g.sangra && g.sangra[k];
    let m = Infinity;
    for (const p of pts) m = Math.min(m, p.x - h, p.y - h, g.fw - p.x - h, g.fh - p.y - h);
    if (sangra) { sangrados++; if (m < lim) escapes++; }
    else if (m <= 0) escapes++;
    margen = Math.min(margen, m);
  });

  // EL TRAZO LARGO Y SIMPLE: quiebros por trazo, y trazos-pizca. Son las dos
  // reglas que costaron dos versiones enteras, asi que se miden.
  // Los quiebros son GIROS DE VERDAD, no vertices: con la vibracion puesta un
  // tramo se subdivide en muchos puntos con desvios de tres grados, y contarlos
  // como quiebros marcaba de garabato una obra que va limpia. Se cuenta lo que
  // cambia la direccion mas de 15 grados.
  const QUIEBRO_MIN = 15;
  let quiebros = 0, pizcas = 0, cortoMin = Infinity;
  for (const pts of g.cintas) {
    for (let i = 1; i < pts.length - 1; i++) {
      const a = Math.atan2(pts[i].y - pts[i-1].y, pts[i].x - pts[i-1].x);
      const b = Math.atan2(pts[i+1].y - pts[i].y, pts[i+1].x - pts[i].x);
      let d = Math.abs((b - a) * 180 / Math.PI) % 360;
      if (d > 180) d = 360 - d;
      if (d > QUIEBRO_MIN) quiebros++;
    }
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) L += Math.hypot(pts[i+1].x - pts[i].x, pts[i+1].y - pts[i].y);
    if (L < 0.20 * Math.min(g.fw, g.fh)) pizcas++;
    if (L < cortoMin) cortoMin = L;
  }
  const qm = g.cintas.length ? quiebros / g.cintas.length : 0;

  // CADENCIA: coeficiente de variacion de las longitudes de tramo.
  const largos = [];
  for (const pts of g.cintas)
    for (let i = 0; i < pts.length - 1; i++)
      largos.push(Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y));
  const mu = largos.reduce((a, b) => a + b, 0) / (largos.length || 1);
  const sd = Math.sqrt(largos.reduce((a, b) => a + (b - mu) ** 2, 0) / (largos.length || 1));
  const cv2 = mu > 0 ? sd / mu : 0;

  // OJOS: cuantos y con que reparto.
  const n = res.ojos.length;
  const disp = n >= 2 ? res.ojos[0] / res.ojos[(n - 1) >> 1] : 0;

  return { seed, tipo: res.tipo, cintas: res.cintas, vert: res.vert,
           margen: +margen.toFixed(5), escapes, sangrados, cadencia: +cv2.toFixed(3),
           quiebros: +qm.toFixed(2), pizcas, cortoMin: +cortoMin.toFixed(3),
           ojos: n, disp: +disp.toFixed(2),
           area: +(res.ojos.reduce((a, b) => a + b, 0)).toFixed(4),
           ocup: +res.ocupacion.toFixed(4), pliegues: res.pliegues,
           pasillos: res.pasillos, largoPas: +res.largoPas.toFixed(1),
           falta: +res.falta.toFixed(2) };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir);
  const ok = rs.filter(r => r && !r.err);
  if (!ok.length) {
    console.log(`obra · NADA MEDIDO · ${rs.filter(r => r.err).length} errores`);
    const e = rs.find(r => r.err); if (e) console.log('  ' + e.err);
    process.exit(2);
  }
  const fuera = ok.filter(r => r.escapes > 0);
  const lab = ok.filter(r => r.ojos >= 2 && r.disp < 1.3);
  const muestrario = ok.filter(r => r.cadencia < 0.10);
  const P = (k, f) => { const s = stats(ok.map(r => r[k])); return f ? f(s) : s; };
  console.log(`\nobra · ${algo} · ${ok.length} obras`);
  console.log(`  margen (fraccion del lado corto, >0 sano): min ${P('margen').min}  p50 ${P('margen').p50}`);
  console.log(`  OBRAS CON UN TRAZO ESCAPADO (fuera sin declararlo): ${fuera.length} de ${ok.length}`);
  console.log(`  sangrados declarados: ${ok.reduce((a, r) => a + r.sangrados, 0)} trazos`);
  console.log(`  quiebros por trazo (1..5 sano): p50 ${P('quiebros').p50}  max ${P('quiebros').max}`);
  const garab = ok.filter(r => r.quiebros > 6);
  console.log(`  OBRAS-GARABATO (>6 quiebros de media): ${garab.length} de ${ok.length}`);
  const piz = ok.filter(r => r.pizcas > 0);
  console.log(`  OBRAS CON PIZCAS (trazo < 0,20 del lado corto): ${piz.length} de ${ok.length}`);
  console.log(`  cadencia (CV de longitudes): p50 ${P('cadencia').p50}  min ${P('cadencia').min}`);
  console.log(`  OBRAS-MUESTRARIO (CV < 0,10, degenerado): ${muestrario.length} de ${ok.length}`);
  console.log(`  ojos: p50 ${P('ojos').p50}  p90 ${P('ojos').p90}  max ${P('ojos').max}`);
  console.log(`  dispersion de tamanos (ojoMax/ojoMed): p50 ${P('disp').p50}  min ${P('disp').min}`);
  console.log(`  obras-laberinto (>=2 ojos y dispersion < 1,3): ${lab.length} de ${ok.length}` +
              `   [DESCRIPTIVO: sin control que dispare]`);
  console.log(`  ocupacion: p10 ${stats(ok.map(r => r.ocup)).min}  p50 ${P('ocup').p50}  max ${P('ocup').max}`);
  console.log(`  pasillos: p50 ${P('pasillos').p50}  largo p50 ${P('largoPas').p50}W`);
  console.log(`  falta = 0 en ${ok.filter(r => r.falta === 0).length} de ${ok.length}  (max ${P('falta').max})`);
  const porTipo = {};
  for (const r of ok) { porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1; }
  console.log(`  tipos: ${Object.entries(porTipo).map(([k, v]) => k + ' ' + Math.round(v * 100 / ok.length) + '%').join('  ')}`);
  fuera.slice(0, 4).forEach(r => console.log(`    ✗ margen #${r.seed} ${r.cfg} ${r.margen}`));
  process.exit((fuera.length || garab.length || piz.length) ? 1 : 0);
})();
