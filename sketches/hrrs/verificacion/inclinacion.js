/* inclinacion.js — ¿SE INCLINAN TODOS HACIA EL MISMO SITIO? (vuelta 55)
 *
 *   node inclinacion.js [n=60]
 *
 * El autor: «parece que todos tienden a inclinarse hacia el mismo sitio, cuando en los
 * originales no todos los trazos están orientados al mismo sitio. Es como si todos
 * estuviesen a 90 y de repente hayan girado un poco hacia la izquierda y todos están
 * paralelizados».
 *
 * De cada obra se toman las secciones (tramos rectos de más de 0,8 W tras quitar la mano) y
 * se separan en casi verticales y casi horizontales (a menos de 35° del eje). De cada grupo:
 *   · DISPERSIÓN: desviación típica de la inclinación, en grados, ponderada por el largo.
 *     Baja = todas paralelas; alta = cada una a lo suyo;
 *   · MISMO LADO: fracción del largo que se inclina hacia el lado mayoritario, contando solo
 *     las que se desvían más de 3°. 50 % = mitad y mitad; 100 % = todas al mismo lado.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
const H = globalThis.HOKS, NN = +(process.argv[2] || 60);
const pSeg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1e-12, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
const dp = (P, tol) => { if (P.length < 3) return P; let im = 0, dm = 0; for (let i = 1; i < P.length - 1; i++) { const d = pSeg(P[i], P[0], P[P.length - 1]); if (d > dm) { dm = d; im = i; } } if (dm <= tol) return [P[0], P[P.length - 1]]; return dp(P.slice(0, im + 1), tol).slice(0, -1).concat(dp(P.slice(im), tol)); };
function medir(T) { const g = { v: [], h: [] };
  for (const t of T) for (const pl of [t.pts].concat(t.ramas || [])) { const P = dp(pl, t.W / 3); for (let i = 0; i + 1 < P.length; i++) { const dx = P[i + 1].x - P[i].x, dy = P[i + 1].y - P[i].y, L = Math.hypot(dx, dy) / t.W; if (L < 0.8) continue;
      let a = ((Math.atan2(dy, dx) * 180 / Math.PI) % 180 + 180) % 180; if (Math.abs(a - 90) < 35) g.v.push([a - 90, L]); else if (a < 35) g.h.push([a, L]); else if (a > 145) g.h.push([a - 180, L]); } }
  const r = {}; for (const k of ['v', 'h']) { const S = g[k], W = S.reduce((x, s) => x + s[1], 0); if (S.length < 3) { r[k] = null; continue; } const m = S.reduce((x, s) => x + s[0] * s[1], 0) / W, sd = Math.sqrt(S.reduce((x, s) => x + (s[0] - m) ** 2 * s[1], 0) / W);
    const pos = S.filter(s => s[0] > 3).reduce((x, s) => x + s[1], 0), neg = S.filter(s => s[0] < -3).reduce((x, s) => x + s[1], 0); r[k] = { sd, lado: pos + neg > 0 ? Math.max(pos, neg) / (pos + neg) * 100 : 100 }; } return r; }
const fila = (nm, R) => console.log(nm.padEnd(18) + ['v', 'h'].map(k => { const v = R.map(r => r[k]).filter(Boolean); const sd = v.reduce((a, x) => a + x.sd, 0) / (v.length || 1), l = v.reduce((a, x) => a + x.lado, 0) / (v.length || 1); return ((k === 'v' ? 'verticales' : 'horizontales') + ': dispersión ' + sd.toFixed(1) + '° · mismo lado ' + l.toFixed(0) + ' %').padEnd(52); }).join(''));
for (const [tipo, f] of [['recinto', 'tramarPaseo'], ['bloque', 'tramarPaseo'], ['travesia', 'tramarHebra']]) { const c = H.HRRS.CALCOS[tipo];
  fila('calco ' + tipo, [medir(c.trazos.map(t => ({ pts: t.pts.map(p => ({ x: p[0], y: p[1] })), W: t.W })))]);
  const R = []; for (let sd = 1; sd <= NN; sd++) { const o = H.HRRS[f](new H.Rng(sd * 7919), 1, 1, tipo, {}); R.push(medir(o.trazos.map(t => ({ pts: t.pts, ramas: t.ramas, W: t.W || o.W })))); } fila('motor ' + tipo, R); }
