/* gemelos.js — TRAZOS GEMELOS (vuelta 41).
 *
 *   node gemelos.js calcos
 *   node gemelos.js <tipo> [modelo=hebra] [n=60]
 *
 * El autor: «que sean paralelas en un tramo no importa, pero no quiere decir que tengan
 * que ser iguales. Haces muchas que son prácticamente gemelas, y en Chillida ninguno es
 * gemelo, no hay dos trazos iguales, y eso a nivel compositivo cambia muchísimo».
 *
 * Dos trazos son GEMELOS si cada uno corre paralelo AL OTRO (a menos de 30° y a
 * 0,75–1,4 D) en el 70 % o más de su largo: misma forma y mismo tamaño, uno al lado del
 * otro. Un trazo corto pegado a uno largo no es gemelo (el largo no va con él el 70 %),
 * ni dos que comparten un tramo y luego se separan. Se cuenta además el trazo más
 * «copiado»: la mayor fracción de un trazo que va con un solo vecino.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, hyp = Math.hypot, UMBRAL = 0.7;
const pSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return hyp(px - a.x - t * dx, py - a.y - t * dy); };
function medir(T) {   // T: [{ pts: [{x,y}], W }]
  const n = T.length, F = T.map(() => new Float64Array(n)), N = new Float64Array(n);
  T.forEach((t, k) => { const W = t.W; for (let i = 0; i + 1 < t.pts.length; i++) { const a = t.pts[i], b = t.pts[i + 1], L = hyp(b.x - a.x, b.y - a.y), m = Math.max(1, Math.round(L / (W / 4))), ta = Math.atan2(b.y - a.y, b.x - a.x);
      for (let q = 0; q < m; q++) { const x = a.x + (b.x - a.x) * (q + .5) / m, y = a.y + (b.y - a.y) * (q + .5) / m; N[k]++;
        T.forEach((o, j) => { if (j === k) return; const D = (W + o.W) / 2 * 1.1; let best = Infinity;
          for (let s = 0; s + 1 < o.pts.length; s++) { const tb = Math.atan2(o.pts[s + 1].y - o.pts[s].y, o.pts[s + 1].x - o.pts[s].x); let da = Math.abs(((ta - tb) % Math.PI + Math.PI) % Math.PI); da = Math.min(da, Math.PI - da); if (da > Math.PI / 6) continue; const d = pSeg(x, y, o.pts[s], o.pts[s + 1]); if (d < best) best = d; }
          if (best > 0.75 * D && best < 1.4 * D) F[k][j]++; }); } } });
  let pares = 0, enGemelo = new Set(), maxCopia = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (i === j || !N[i]) continue; const f = F[i][j] / N[i]; if (f > maxCopia) maxCopia = f; if (j > i && N[j] && f >= UMBRAL && F[j][i] / N[j] >= UMBRAL) { pares++; enGemelo.add(i); enGemelo.add(j); } }
  return { n, pares, enGemelo: enGemelo.size, maxCopia };
}
const tipo = process.argv[2];
if (tipo === 'calcos') { for (const [nm, c] of Object.entries(H.HRRS.CALCOS)) { const r = medir(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })));
    console.log(`${nm.padEnd(9)} ${r.n} trazos · pares gemelos: ${r.pares} · trazos en algún par: ${r.enGemelo} · el más copiado va con un vecino el ${(r.maxCopia * 100).toFixed(0)} %`); } }
else { const modelo = process.argv[3] || 'hebra', NN = +(process.argv[4] || 60); let pares = 0, enG = 0, nt = 0, con = 0, mc = 0;
  for (let sd = 1; sd <= NN; sd++) { const c = (modelo === 'hebra' ? H.HRRS.tramarHebra : H.HRRS.tramarPaseo)(new H.Rng(sd * 7919), 1, 1, tipo, {}); const r = medir(c.trazos.map(t => ({ pts: t.pts, W: t.W || c.W })));
    pares += r.pares; enG += r.enGemelo; nt += r.n; if (r.pares) con++; mc += r.maxCopia; }
  console.log(`${tipo} · ${modelo} · ${NN} obras · pares gemelos por obra: ${(pares / NN).toFixed(2)} · trazos en algún par: ${(enG / nt * 100).toFixed(0)} % · obras con gemelos: ${con} de ${NN} · el más copiado, de media: ${(mc / NN * 100).toFixed(0)} %`); }
