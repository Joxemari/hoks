/* patrones.js — LA FICHA: todos los patrones medidos, calco frente a motor (vuelta 54).
 *
 *   node patrones.js [n=60]
 *
 * El autor: «identifica patrones y compara contra los originales». Reúne en una tabla por
 * referencia lo que miden por separado conexion.js, densidad.js, gemelos.js, secciones.js y
 * angulos.js, con las mismas definiciones, sobre el modelo de PRODUCCIÓN de cada tipo. La
 * última columna marca la distancia: «=» dentro de un 15 % del valor del calco (o 5 puntos),
 * «~» dentro de un 35 % (o 12 puntos), «✗» más lejos.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, hyp = Math.hypot, NN = +(process.argv[2] || 60);
const pSeg = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12, t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return hyp(px - a.x - t * dx, py - a.y - t * dy); };
const med = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const dp = (P, tol) => { if (P.length < 3) return P; let im = 0, dm = 0; for (let i = 1; i < P.length - 1; i++) { const d = pSeg(P[i].x, P[i].y, P[0], P[P.length - 1]); if (d > dm) { dm = d; im = i; } } if (dm <= tol) return [P[0], P[P.length - 1]]; return dp(P.slice(0, im + 1), tol).slice(0, -1).concat(dp(P.slice(im), tol)); };
function ficha(T, caja) {   // T: [{pts, W, ramas}]
  const n = T.length, L = T.map(t => { let l = 0; for (let i = 1; i < t.pts.length; i++) l += hyp(t.pts[i].x - t.pts[i - 1].x, t.pts[i].y - t.pts[i - 1].y); return l / t.W; });
  // contacto y gemelos
  const F = T.map(() => new Float64Array(n)), N = new Float64Array(n), cont = [];
  T.forEach((t, k) => { let c = 0; for (let i = 0; i + 1 < t.pts.length; i++) { const a = t.pts[i], b = t.pts[i + 1], l = hyp(b.x - a.x, b.y - a.y), m = Math.max(1, Math.round(l / (t.W / 4))), ta = Math.atan2(b.y - a.y, b.x - a.x);
      for (let s = 0; s < m; s++) { const x = a.x + (b.x - a.x) * (s + .5) / m, y = a.y + (b.y - a.y) * (s + .5) / m; N[k]++; let cerca = false;
        T.forEach((o, j) => { if (j === k) return; const D = (t.W + o.W) / 2 * 1.1; let bp = 1e9, bc = 1e9; for (let u = 0; u + 1 < o.pts.length; u++) { const d = pSeg(x, y, o.pts[u], o.pts[u + 1]); if (d < bc) bc = d; const tb = Math.atan2(o.pts[u + 1].y - o.pts[u].y, o.pts[u + 1].x - o.pts[u].x); let da = Math.abs(((ta - tb) % Math.PI + Math.PI) % Math.PI); da = Math.min(da, Math.PI - da); if (da <= Math.PI / 6 && d < bp) bp = d; }
          if (bc < 1.35 * D) cerca = true; if (bp > 0.75 * D && bp < 1.4 * D) F[k][j]++; }); if (cerca) c++; } } cont.push(c / (N[k] || 1)); });
  let gem = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (F[i][j] / N[i] >= .7 && F[j][i] / N[j] >= .7) gem++;
  // secciones y codos
  let sec = 0, eje = 0; const giros = [];
  for (const t of T) for (const pl of [t.pts].concat(t.ramas || [])) { const P = dp(pl, t.W / 3), an = []; for (let i = 0; i + 1 < P.length; i++) { const dx = P[i + 1].x - P[i].x, dy = P[i + 1].y - P[i].y; if (hyp(dx, dy) / t.W < 0.8) continue; let a = ((Math.atan2(dy, dx) * 180 / Math.PI) % 180 + 180) % 180; sec++; if (a < 15 || a >= 165 || (a >= 75 && a < 105)) eje++; an.push(Math.atan2(dy, dx)); }
      for (let i = 0; i + 1 < an.length; i++) { let g = Math.abs(an[i + 1] - an[i]) * 180 / Math.PI; if (g > 180) g = 360 - g; if (g > 12) giros.push(g); } }
  // densidad 12x12
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; if (caja) ({ x0, y0, x1, y1 } = caja); else T.forEach(t => t.pts.forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }));
  const G = 12, g = []; let tinta = 0, vac = 0; for (let iy = 0; iy < G; iy++) { g.push([]); for (let ix = 0; ix < G; ix++) { let c = 0; for (let sy = 0; sy < 5; sy++) for (let sx = 0; sx < 5; sx++) { const x = x0 + (ix + (sx + .5) / 5) / G * (x1 - x0), y = y0 + (iy + (sy + .5) / 5) / G * (y1 - y0); if (T.some(t => [t.pts].concat(t.ramas || []).some(pl => pl.some((p, i) => i + 1 < pl.length && pSeg(x, y, pl[i], pl[i + 1]) < t.W / 2)))) c++; } tinta += c / 25; if (c / 25 < 0.1) vac++; g[iy].push(c / 25 > 0.65 ? 1 : 0); } }
  const v = g.map(r => r.map(() => 0)); let mayor = 0, nuc = 0; for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { if (!g[y][x] || v[y][x]) continue; let m = 0; const p = [[x, y]]; v[y][x] = 1; while (p.length) { const [a, b] = p.pop(); m++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = a + dx, w = b + dy; if (u >= 0 && w >= 0 && u < G && w < G && g[w][u] && !v[w][u]) { v[w][u] = 1; p.push([u, w]); } } } if (m >= 3) { nuc++; if (m > mayor) mayor = m; } }
  return { trazos: n, largoMed: med(L), cortos: L.filter(l => l < 4).length / n * 100, contacto: med(cont) * 100, gemelos: gem, ramas: T.reduce((a, t) => a + (t.ramas ? t.ramas.length : 0), 0), aEje: eje / (sec || 1) * 100, codo: med(giros), escuadra: giros.filter(q => q >= 85 && q <= 95).length / (giros.length || 1) * 100, ocup: tinta / (G * G) * 100, vacias: vac / (G * G) * 100, nucleos: nuc, nucleoMayor: mayor / (G * G) * 100 };
}
const FILAS = [['trazos', 'trazos por obra', 0], ['largoMed', 'largo mediano del trazo (W)', 1], ['cortos', 'trazos cortos, < 4 W (%)', 0, 1], ['contacto', 'parte del trazo que va a un pelo de otro (%)', 0, 1], ['gemelos', 'pares de gemelos', 2], ['ramas', 'bifurcaciones (rama en la misma tinta)', 2], ['aEje', 'secciones a eje (%)', 0, 1], ['codo', 'codo mediano (°)', 0], ['escuadra', 'codos a escuadra (%)', 0, 1], ['ocup', 'ocupación de la caja (%)', 0, 1], ['vacias', 'celdas vacías (%)', 0, 1], ['nucleos', 'núcleos densos', 1], ['nucleoMayor', 'núcleo mayor (% de la caja)', 0, 1]];
for (const [tipo, f] of [['recinto', 'tramarPaseo'], ['bloque', 'tramarPaseo'], ['travesia', 'tramarHebra']]) { const c = H.HRRS.CALCOS[tipo], hoja = tipo === 'travesia';
  const C = ficha(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })), hoja ? { x0: 0, y0: 0, x1: c.w, y1: c.h } : null), M = {};
  for (let sd = 1; sd <= NN; sd++) { const o = H.HRRS[f](new H.Rng(sd * 7919), 1, 1, tipo, {}), r = ficha(o.trazos.map(t => ({ pts: t.pts, ramas: t.ramas, W: t.W || o.W })), hoja ? { x0: 0, y0: 0, x1: 1, y1: 1 } : null); for (const k in r) M[k] = (M[k] || 0) + r[k] / NN; }
  console.log(`\n== ${tipo.toUpperCase()} · calco / motor (${NN} obras)`); let ok = 0, casi = 0, mal = 0;
  for (const [k, nm, dec, pts] of FILAS) { const a = C[k], b = M[k], d = Math.abs(a - b), lim1 = pts ? 5 : Math.max(0.15 * Math.abs(a), 0.35), lim2 = pts ? 12 : Math.max(0.35 * Math.abs(a), 0.8), s = k === 'ramas' ? ' ' : (k === 'gemelos' && b <= a + 0.35) ? '=' : d <= lim1 ? '=' : d <= lim2 ? '~' : '✗'; /* gemelos: tener menos que el calco no es estar lejos */ if (s === '=') ok++; else if (s === '~') casi++; else if (s === '✗') mal++;
    console.log('  ' + nm.padEnd(46) + a.toFixed(dec).padStart(7) + b.toFixed(dec).padStart(8) + '   ' + s); }
  console.log(`  → coinciden ${ok} · cerca ${casi} · lejos ${mal}   (las bifurcaciones no se comparan: el calco traza cada rama como trazo aparte)`); }
