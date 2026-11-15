// cabos.js — cómo acaba cada trazo: sale del pliego, choca contra otro (junta) o se queda en el blanco.
// De la junta se mide el hueco en las DOS esquinas de la boca: si son iguales, la boca va paralela al
// filo contra el que choca (junta limpia); si no, queda una cuña. Uso: node cabos.js [N] [tipo]
require('../../_engine.js'); require('../algo.js'); const H = globalThis.HOKS, hyp = Math.hypot;
const NN = +process.argv[2] || 100, tipo = process.argv[3] || 'travesia', c = H.HRRS.CALCOS[tipo], hoja = tipo === 'travesia', fh = hoja ? c.h / c.w : 1;
const pSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12, t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return hyp(px - a.x - t * dx, py - a.y - t * dy); };
function cabos(T, caja) { const out = [];
  const polis = []; T.forEach((t, k) => { polis.push({ k, pl: t.pts, W: t.W, rama: false }); (t.ramas || []).forEach(r => polis.push({ k, pl: r, W: t.W, rama: true })); });
  const aTinta = (x, y, k) => { let d = 1e9; for (const p of polis) { if (p.k === k) continue; for (let i = 0; i + 1 < p.pl.length; i++) d = Math.min(d, pSeg(x, y, p.pl[i], p.pl[i + 1]) - p.W / 2); } return d; };
  for (const p of polis) for (const fin of p.rama ? [1] : [0, 1]) { const e = fin ? p.pl[p.pl.length - 1] : p.pl[0], a = fin ? p.pl[p.pl.length - 2] : p.pl[1], L = hyp(e.x - a.x, e.y - a.y) || 1e-9, ux = (e.x - a.x) / L, uy = (e.y - a.y) / L, W = p.W;
      if (caja && (e.x < caja.x0 + W * 0.3 || e.y < caja.y0 + W * 0.3 || e.x > caja.x1 - W * 0.3 || e.y > caja.y1 - W * 0.3)) { out.push({ rel: (T[p.k].rel || '') + (p.rama ? '·rama' : fin ? '·fin' : '·ini'), tipo: 'sale' }); continue; }
      const g1 = aTinta(e.x - uy * W / 2, e.y + ux * W / 2, p.k), g2 = aTinta(e.x + uy * W / 2, e.y - ux * W / 2, p.k), g0 = aTinta(e.x, e.y, p.k), mn = Math.min(g0, g1, g2), mx = Math.max(g1, g2);
      // ¿hay tinta DELANTE? se avanza desde la boca hasta 1,5 W
      let del = 1e9; for (let s = 0; s <= 1.5; s += 0.05) { if (aTinta(e.x + ux * W * s, e.y + uy * W * s, p.k) <= 0) { del = s; break; } }
      const borde = caja ? Math.min(e.x - caja.x0, e.y - caja.y0, caja.x1 - e.x, caja.y1 - e.y) / W : 9;
      out.push({ rel: (T[p.k].rel || '') + (p.rama ? '·rama' : fin ? '·fin' : '·ini'), tipo: del < 0.6 ? 'junta' : mn / W < 0.25 ? 'costado' : 'blanco', del, mn: mn / W, cuna: (mx - Math.min(g1, g2)) / W, borde, x: e.x, y: e.y }); }
  return out; }
const res = (nombre, L) => { const n = L.length, de = t => L.filter(q => q.tipo === t), pc = l => (l.length / n * 100).toFixed(0).padStart(3) + ' %', md = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; }, J = de('junta');
  console.log(nombre.padEnd(8), 'cabos', String(n).padStart(4), ' salen', pc(de('sale')), ' chocan de frente', pc(J), ' acaban pegados de costado', pc(de('costado')), ' rotos en el blanco', pc(de('blanco')));
  if (J.length) console.log('         juntas: hueco delante (W) mediana', md(J.map(q => q.del)).toFixed(2), '· cuña entre esquinas (W) mediana', md(J.map(q => q.cuna)).toFixed(2), '· con cuña > 0,25 W:', (J.filter(q => q.cuna > 0.25).length / J.length * 100).toFixed(0) + ' %');
  const B = de('blanco'); if (B.length) console.log('         rotos: distancia a la tinta más cercana (W) mediana', md(B.map(q => q.mn)).toFixed(2), '· al borde del pliego (W) mediana', md(B.map(q => q.borde)).toFixed(2)); };
const caja = hoja ? { x0: 0, y0: 0, x1: 1, y1: fh } : null;
const cc = cabos(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0] / c.w, y: p[1] / c.w })), W: t.W / c.w })), caja); res('calco', cc);
if (process.argv[4]) cc.forEach(q => console.log('   ', q.tipo, q.x != null ? q.x.toFixed(2) + ',' + q.y.toFixed(2) + ' delante ' + (q.del > 9 ? '—' : q.del.toFixed(2)) + ' cerca ' + q.mn.toFixed(2) + ' cuña ' + q.cuna.toFixed(2) + ' borde ' + q.borde.toFixed(1) : ''));
const all = [], porRel = {}; for (let sd = 1; sd <= NN; sd++) { const o = H.HRRS.tramarHebra(new H.Rng(sd * 7919), 1, fh, tipo, {}); const T = o.trazos.map(t => ({ pts: t.pts, ramas: t.ramas, W: t.W || o.W, rel: t.rel })); const r = cabos(T, caja); all.push(...r); }
res('motor', all);
if (process.argv[4]) { const R = {}; for (const q of all) { const r = R[q.rel] = R[q.rel] || { n: 0, sale: 0, junta: 0, costado: 0, blanco: 0, cu: 0 }; r.n++; r[q.tipo]++; if (q.tipo === 'junta' && q.cuna > 0.25) r.cu++; }
  console.log('  por papel del trazo y cabo:            n  sale junta (con cuña) costado blanco'); for (const k of Object.keys(R).sort()) { const r = R[k]; console.log('   ', k.padEnd(18), String(r.n).padStart(5), String(r.sale).padStart(5), String(r.junta).padStart(5), ('(' + r.cu + ')').padStart(7), String(r.costado).padStart(9), String(r.blanco).padStart(6)); } }
