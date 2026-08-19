/* UN TRAZO NO SE CRUZA CONSIGO MISMO. Regla del autor, absoluta, y estaba sin comprobar: la
 * funcion que impide los cruces dice `if (j === k) continue`, o sea que salta el propio trazo.
 * Nunca se habia mirado, y el autor lo canto tres veces sobre tres obras distintas.
 *
 *   node solo.js [gen.js] [n]
 */
const path = require('path');
const arg = process.argv[2] || './gen.js';
const { circuito } = require(arg.startsWith('.') || path.isAbsolute(arg) ? arg : './' + arg);
const N = parseInt(process.argv[3] || '120', 10);

const corta = (a, b, c, d) => {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return ((o(a, b, c) > 0) !== (o(a, b, d) > 0)) && ((o(c, d, a) > 0) !== (o(c, d, b) > 0));
};
let conCruce = 0, total = 0, cruces = 0;
const malas = [];
for (let i = 0; i < N; i++) {
  const c = circuito(((i + 1) * 0x9E3779B1 ^ 0x5A17) >>> 0);
  let hay = 0;
  for (const t of c.trazos) {
    total++;
    // los tramos contiguos comparten vertice y no cuentan: se empieza en i+2
    for (let a = 0; a < t.length - 1; a++)
      for (let b = a + 2; b < t.length - 1; b++)
        if (corta(t[a], t[a + 1], t[b], t[b + 1])) hay++;
  }
  if (hay) { conCruce++; cruces += hay; malas.push(c.seed.toString(16) + '(' + hay + ')'); }
}
console.log('obras=' + N + '  CON UN TRAZO QUE SE CRUZA A SI MISMO=' + conCruce +
            ' (' + (100 * conCruce / N).toFixed(0) + '%)  cruces totales=' + cruces +
            '  trazos=' + total);
if (malas.length) console.log('  ' + malas.slice(0, 10).join(' '));
process.exit(conCruce ? 1 : 0);
