/* densidad.js — ZONAS DE DENSIDAD Y ZONAS VACÍAS (vuelta 43).
 *
 *   node densidad.js calcos
 *   node densidad.js <tipo> [modelo=hebra] [n=60]
 *
 * El autor: «queda definir mejor zonas de densidad y las que no». Se rasteriza la tinta
 * de cada obra sobre la caja de su cuerpo en una rejilla de 8 × 8 (36 puntos por celda:
 * un punto es tinta si queda a menos de W/2 de un eje). De cada obra salen:
 *   · VACÍAS: celdas con menos del 10 % de tinta;  · LLENAS: con más del 70 %;
 *   · MEDIAS: lo de en medio (10–70 %): el gris, lo que no es ni masa ni aire;
 *   · el mayor VACÍO CONEXO (celdas vacías unidas por un lado), en fracción de la caja;
 *   · la ocupación de la caja.
 * Un original tiene las dos cosas a la vez: muchas llenas Y muchas vacías, pocas medias,
 * y los vacíos juntos (ventanas), no repartidos. En lo generado se imprime además el
 * mapa medio, con cada obra espejada para que su mitad más pesada caiga a la izquierda.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, hyp = Math.hypot, N = 8, SUB = 6;
const pSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return hyp(px - a.x - t * dx, py - a.y - t * dy); };
function mapa(T, caja) {   // T: [{pts:[{x,y}], W}] · caja opcional {x0,y0,x1,y1}
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; if (caja) ({ x0, y0, x1, y1 } = caja); else T.forEach(t => t.pts.forEach(p => { x0 = Math.min(x0, p.x - t.W / 2); y0 = Math.min(y0, p.y - t.W / 2); x1 = Math.max(x1, p.x + t.W / 2); y1 = Math.max(y1, p.y + t.W / 2); }));
  const g = Array.from({ length: N }, () => new Float64Array(N));
  for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++) { let c = 0;
    for (let sy = 0; sy < SUB; sy++) for (let sx = 0; sx < SUB; sx++) { const x = x0 + (ix + (sx + .5) / SUB) / N * (x1 - x0), y = y0 + (iy + (sy + .5) / SUB) / N * (y1 - y0); let tinta = false;
      for (const t of T) { for (let i = 0; i + 1 < t.pts.length && !tinta; i++) if (pSeg(x, y, t.pts[i], t.pts[i + 1]) < t.W / 2) tinta = true; if (tinta) break; } if (tinta) c++; }
    g[iy][ix] = c / (SUB * SUB); }
  return g; }
function resumen(g) { let vac = 0, lle = 0, tot = 0; const V = g.map(r => Array.from(r, v => v < 0.1));
  for (const r of g) for (const v of r) { tot += v; if (v < 0.1) vac++; else if (v > 0.7) lle++; }
  let mayor = 0; const visto = V.map(r => r.map(() => false));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (!V[y][x] || visto[y][x]) continue; let n = 0; const pila = [[x, y]]; visto[y][x] = true;
      while (pila.length) { const [a, b] = pila.pop(); n++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = a + dx, v = b + dy; if (u >= 0 && v >= 0 && u < N && v < N && V[v][u] && !visto[v][u]) { visto[v][u] = true; pila.push([u, v]); } } } if (n > mayor) mayor = n; }
  const c = N * N; return { vac: vac / c, lle: lle / c, med: 1 - (vac + lle) / c, mayor: mayor / c, ocup: tot / c }; }
const pinta = g => g.forEach(r => console.log('   ' + Array.from(r, v => String(Math.round(v * 99)).padStart(3)).join('')));
const pc = v => (v * 100).toFixed(0).padStart(3) + ' %';
const tipo = process.argv[2];
if (tipo === 'calcos') { for (const [nm, c] of Object.entries(H.HRRS.CALCOS)) { const T = c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })); const g = mapa(T, nm === 'travesia' ? { x0: 0, y0: 0, x1: c.w, y1: c.h } : null), r = resumen(g);
    console.log(`\n== calco ${nm} · vacías ${pc(r.vac)} · llenas ${pc(r.lle)} · medias ${pc(r.med)} · mayor vacío conexo ${pc(r.mayor)} · ocupación ${pc(r.ocup)}`); pinta(g); } }
else { const modelo = process.argv[3] || 'hebra', NN = +(process.argv[4] || 60), acc = Array.from({ length: N }, () => new Float64Array(N)), S = { vac: 0, lle: 0, med: 0, mayor: 0, ocup: 0 };
  for (let sd = 1; sd <= NN; sd++) { const c = (modelo === 'hebra' ? H.HRRS.tramarHebra : H.HRRS.tramarPaseo)(new H.Rng(sd * 7919), 1, 1, tipo, {}); const T = c.trazos.map(t => ({ pts: t.pts, W: t.W || c.W }));
    let g = mapa(T, tipo === 'travesia' ? { x0: 0, y0: 0, x1: 1, y1: 1 } : null); let izq = 0, der = 0; for (let y = N / 2; y < N; y++) for (let x = 0; x < N; x++) (x < N / 2 ? (izq += g[y][x]) : (der += g[y][x])); if (der > izq) g = g.map(r => Float64Array.from(r).reverse());
    const r = resumen(g); for (const k in S) S[k] += r[k] / NN; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) acc[y][x] += g[y][x] / NN; }
  console.log(`\n== ${tipo} · ${modelo} · ${NN} obras · vacías ${pc(S.vac)} · llenas ${pc(S.lle)} · medias ${pc(S.med)} · mayor vacío conexo ${pc(S.mayor)} · ocupación ${pc(S.ocup)}\n   (mapa medio, la mitad pesada a la izquierda)`); pinta(acc); }
