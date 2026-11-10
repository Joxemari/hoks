/* conexion.js — TRAZOS INCONEXOS Y NÚCLEOS (vuelta 44).
 *
 *   node conexion.js calcos
 *   node conexion.js <tipo> [modelo=hebra] [n=60]
 *
 * El autor: «es raro que haya trazos inconexos; en la mayoría de los grabados hay
 * espacios sin aire donde se concentran muchos trazos (alta densidad, aunque puede que
 * con algún huequillo) y de ahí salen para fuera. En cada cuadro puede haber uno o más
 * de un espacio de alta densidad, y su superficie es variable».
 *
 * Dos trazos SE TOCAN si sus ejes pasan a menos de 1,35 D (van a un pelo en algún punto).
 *   · SUELTOS: trazos que no tocan a ninguno;
 *   · PIEZAS: componentes del grafo de contactos (una obra entera es 1);
 *   · FUERA: fracción de la tinta que no está en la pieza mayor;
 *   · CONTACTO: fracción del largo de cada trazo que va a un pelo de otro (mediana);
 *   · NÚCLEOS: manchas conexas de celdas llenas (> 65 % de tinta) en rejilla de 12 × 12
 *     de la caja, de al menos 3 celdas; y la superficie del mayor, en fracción de la caja.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, hyp = Math.hypot, N = 12, SUB = 5;
const pSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return hyp(px - a.x - t * dx, py - a.y - t * dy); };
const q = (v, f) => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor(f * (s.length - 1))] : 0; };
function medir(T, caja) {
  const n = T.length, toca = T.map(() => new Set()), cont = [], largo = [];
  T.forEach((t, k) => { let tot = 0, c = 0, L = 0; for (let i = 0; i + 1 < t.pts.length; i++) { const a = t.pts[i], b = t.pts[i + 1], l = hyp(b.x - a.x, b.y - a.y), m = Math.max(1, Math.round(l / (t.W / 4))); L += l;
      for (let s = 0; s < m; s++) { const x = a.x + (b.x - a.x) * (s + .5) / m, y = a.y + (b.y - a.y) * (s + .5) / m; tot++; let cerca = false;
        T.forEach((o, j) => { if (j === k) return; const D = (t.W + o.W) / 2 * 1.1; for (let u = 0; u + 1 < o.pts.length; u++) if (pSeg(x, y, o.pts[u], o.pts[u + 1]) < 1.35 * D) { toca[k].add(j); cerca = true; break; } }); if (cerca) c++; } }
    cont.push(c / (tot || 1)); largo.push(L); });
  const comp = new Int32Array(n).fill(-1); let nc = 0; for (let i = 0; i < n; i++) { if (comp[i] >= 0) continue; const pila = [i]; comp[i] = nc; while (pila.length) { const a = pila.pop(); for (const b of toca[a]) if (comp[b] < 0) { comp[b] = nc; pila.push(b); } } nc++; }
  const tinta = new Float64Array(nc); for (let i = 0; i < n; i++) tinta[comp[i]] += largo[i]; const total = largo.reduce((a, b) => a + b, 0);
  // núcleos
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; if (caja) ({ x0, y0, x1, y1 } = caja); else T.forEach(t => t.pts.forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }));
  const g = Array.from({ length: N }, () => new Uint8Array(N));
  for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) { let c = 0; for (let sy = 0; sy < SUB; sy++) for (let sx = 0; sx < SUB; sx++) { const x = x0 + (ix + (sx + .5) / SUB) / N * (x1 - x0), y = y0 + (iy + (sy + .5) / SUB) / N * (y1 - y0); let ink = false; for (const t of T) { for (let i = 0; i + 1 < t.pts.length && !ink; i++) if (pSeg(x, y, t.pts[i], t.pts[i + 1]) < t.W / 2) ink = true; if (ink) break; } if (ink) c++; } g[iy][ix] = c / (SUB * SUB) > 0.65 ? 1 : 0; }
  const visto = g.map(r => r.map(() => 0)), nuc = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (!g[y][x] || visto[y][x]) continue; let m = 0; const pila = [[x, y]]; visto[y][x] = 1; while (pila.length) { const [a, b] = pila.pop(); m++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = a + dx, v = b + dy; if (u >= 0 && v >= 0 && u < N && v < N && g[v][u] && !visto[v][u]) { visto[v][u] = 1; pila.push([u, v]); } } } if (m >= 3) nuc.push(m / (N * N)); }
  return { n, sueltos: toca.filter(s => !s.size).length, piezas: nc, fuera: 1 - Math.max(...tinta) / (total || 1), contacto: q(cont, .5), nucleos: nuc.length, mayor: nuc.length ? Math.max(...nuc) : 0, sumaNuc: nuc.reduce((a, b) => a + b, 0) };
}
const pc = v => (v * 100).toFixed(0) + ' %', tipo = process.argv[2];
if (tipo === 'calcos') { for (const [nm, c] of Object.entries(H.HRRS.CALCOS)) { const r = medir(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })), nm === 'travesia' ? { x0: 0, y0: 0, x1: c.w, y1: c.h } : null);
    console.log(`${('calco ' + nm).padEnd(16)} ${r.n} trazos · sueltos ${r.sueltos} · piezas ${r.piezas} · tinta fuera de la mayor ${pc(r.fuera)} · contacto mediano ${pc(r.contacto)} · núcleos ${r.nucleos} (el mayor ${pc(r.mayor)} de la caja, todos ${pc(r.sumaNuc)})`); } }
else { const modelo = process.argv[3] || 'hebra', NN = +(process.argv[4] || 60), S = { sueltos: 0, piezas: 0, fuera: 0, contacto: 0, nucleos: 0, mayor: 0, sumaNuc: 0, n: 0 }; let conS = 0, una = 0; const nn = {};
  for (let sd = 1; sd <= NN; sd++) { const c = (modelo === 'hebra' ? H.HRRS.tramarHebra : H.HRRS.tramarPaseo)(new H.Rng(sd * 7919), 1, 1, tipo, {}); const r = medir(c.trazos.map(t => ({ pts: t.pts, W: t.W || c.W })), tipo === 'travesia' ? { x0: 0, y0: 0, x1: 1, y1: 1 } : null);
    for (const k in S) S[k] += r[k] / NN; if (r.sueltos) conS++; if (r.piezas === 1) una++; nn[r.nucleos] = (nn[r.nucleos] || 0) + 1; }
  console.log(`${(tipo + ' · ' + modelo).padEnd(16)} ${S.n.toFixed(1)} trazos · sueltos ${S.sueltos.toFixed(2)} por obra (en ${conS} de ${NN}) · de una pieza: ${una} de ${NN} · tinta fuera de la mayor ${pc(S.fuera)} · contacto mediano ${pc(S.contacto)} · núcleos ${S.nucleos.toFixed(1)} ${JSON.stringify(nn)} (el mayor ${pc(S.mayor)}, todos ${pc(S.sumaNuc)})`); }
