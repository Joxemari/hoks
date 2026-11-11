/* angulos.js — ¿TODO HORIZONTAL O VERTICAL? (vuelta 51)
 *
 *   node angulos.js calcos
 *   node angulos.js <tipo> [modelo=paseo] [n=60]
 *
 * El autor: «revisa los ángulos de las secciones, sigue todo horizontal o vertical».
 * De cada tramo (ponderado por su largo) se mide la DESVIACIÓN respecto al eje más
 * cercano, horizontal o vertical (0° = a escuadra con el papel, 45° = diagonal pura), y
 * de cada codo el ÁNGULO DE GIRO (90° = escuadra). Los tramos de menos de media anchura
 * no cuentan (son la mano, no el dibujo).
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, q = (v, f) => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor(f * (s.length - 1))] : 0; };
function medir(T, acc) { for (const t of T) { const P = t.pts.filter((p, i) => i === 0 || Math.hypot(p.x - t.pts[i - 1].x, p.y - t.pts[i - 1].y) > 1e-9), segs = [];
    for (let i = 0; i + 1 < P.length; i++) { const dx = P[i + 1].x - P[i].x, dy = P[i + 1].y - P[i].y, L = Math.hypot(dx, dy); if (L < t.W * 0.5) continue; let a = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI) % 90; if (a > 45) a = 90 - a; acc.dev.push([a, L / t.W]); segs.push(Math.atan2(dy, dx)); }
    for (let i = 0; i + 1 < segs.length; i++) { let g = Math.abs(segs[i + 1] - segs[i]) * 180 / Math.PI; if (g > 180) g = 360 - g; if (g > 12) acc.giro.push(g); } } }
function informe(nm, acc) { const tot = acc.dev.reduce((a, d) => a + d[1], 0), fr = (lo, hi) => (acc.dev.filter(d => d[0] >= lo && d[0] < hi).reduce((a, d) => a + d[1], 0) / tot * 100).toFixed(0) + ' %';
  console.log(`${nm.padEnd(18)} largo a escuadra (< 5°) ${fr(0, 5)} · 5–15° ${fr(5, 15)} · 15–30° ${fr(15, 30)} · > 30° ${fr(30, 46)}   |  codos: p25 ${q(acc.giro, .25).toFixed(0)}° p50 ${q(acc.giro, .5).toFixed(0)}° p75 ${q(acc.giro, .75).toFixed(0)}° · a escuadra (85–95°) ${(acc.giro.filter(g => g >= 85 && g <= 95).length / (acc.giro.length || 1) * 100).toFixed(0)} %`); }
const tipo = process.argv[2];
if (tipo === 'calcos') for (const [nm, c] of Object.entries(H.HRRS.CALCOS)) { const acc = { dev: [], giro: [] }; medir(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })), acc); informe('calco ' + nm, acc); }
else { const modelo = process.argv[3] || 'paseo', N = +(process.argv[4] || 60), acc = { dev: [], giro: [] };
  for (let sd = 1; sd <= N; sd++) { const c = (modelo === 'hebra' ? H.HRRS.tramarHebra : H.HRRS.tramarPaseo)(new H.Rng(sd * 7919), 1, 1, tipo, {}); medir(c.trazos.map(t => ({ pts: H.HRRS.simplificarEje ? H.HRRS.simplificarEje(t.pts) : t.pts, W: t.W || c.W })), acc); }
  informe(tipo + ' · ' + modelo, acc); }
