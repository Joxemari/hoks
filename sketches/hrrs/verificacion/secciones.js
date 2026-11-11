/* secciones.js — CUÁNTAS SECCIONES HAY EN CADA ÁNGULO (vuelta 52).
 *
 *   node secciones.js            # los tres calcos y los tres tipos de producción, lado a lado
 *
 * El autor: «saca el dato de cuántas secciones hay en cada ángulo y compara con tu motor,
 * veo mucho vertical y horizontal». Una SECCIÓN es un tramo recto entre dos quiebros: cada
 * trazo se simplifica (Douglas-Peucker a W/3, que quita la mano y deja el dibujo) y cada
 * segmento que queda, de más de 0,8 W, es una sección. Se cuenta por ORIENTACIÓN, de 0° a
 * 180° sin sentido (0° horizontal, 90° vertical; 45° baja hacia la derecha, 135° hacia la
 * izquierda), en doce franjas de 15°. Se da el % de secciones y, entre paréntesis, el % del
 * largo. Las franjas «a eje» son las cuatro pegadas a 0° y a 90°: 0–15, 75–90, 90–105, 165–180.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS;
const pSeg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
const dp = (P, tol) => { if (P.length < 3) return P; let im = 0, dm = 0; for (let i = 1; i < P.length - 1; i++) { const d = pSeg(P[i], P[0], P[P.length - 1]); if (d > dm) { dm = d; im = i; } } if (dm <= tol) return [P[0], P[P.length - 1]]; return dp(P.slice(0, im + 1), tol).slice(0, -1).concat(dp(P.slice(im), tol)); };
function cuenta(T, acc) { for (const t of T) for (const pl of [t.pts].concat(t.ramas || [])) { const P = dp(pl, t.W / 3); for (let i = 0; i + 1 < P.length; i++) { const dx = P[i + 1].x - P[i].x, dy = P[i + 1].y - P[i].y, L = Math.hypot(dx, dy) / t.W; if (L < 0.8) continue; let a = Math.atan2(dy, dx) * 180 / Math.PI; a = ((a % 180) + 180) % 180; const b = Math.min(11, Math.floor(a / 15)); acc.n[b]++; acc.l[b] += L; } } }
const nuevo = () => ({ n: new Float64Array(12), l: new Float64Array(12) });
const filas = [];
for (const [nm, c] of Object.entries(H.HRRS.CALCOS)) { const a = nuevo(); cuenta(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })), a); filas.push(['calco ' + nm, a]); }
for (const [tipo, f] of [['recinto', 'tramarPaseo'], ['bloque', 'tramarPaseo'], ['travesia', 'tramarHebra']]) { const a = nuevo(); for (let sd = 1; sd <= 60; sd++) { const c = H.HRRS[f](new H.Rng(sd * 7919), 1, 1, tipo, {}); cuenta(c.trazos.map(t => ({ pts: t.pts, ramas: t.ramas, W: t.W || c.W })), a); } filas.push(['motor ' + tipo, a]); }
console.log('franja (°)'.padEnd(16) + [...Array(12).keys()].map(b => (b * 15 + '–' + (b * 15 + 15)).padStart(9)).join('') + '     A EJE   secciones');
for (const [nm, a] of filas) { const N = a.n.reduce((x, y) => x + y, 0), Lt = a.l.reduce((x, y) => x + y, 0), eje = (a.n[0] + a.n[5] + a.n[6] + a.n[11]) / N * 100;
  console.log(nm.padEnd(16) + Array.from(a.n, (v, b) => ((v / N * 100).toFixed(0) + '(' + (a.l[b] / Lt * 100).toFixed(0) + ')').padStart(9)).join('') + ('  ' + eje.toFixed(0) + ' %').padStart(10) + String(Math.round(N / (nm.startsWith('motor') ? 60 : 1))).padStart(8)); }
