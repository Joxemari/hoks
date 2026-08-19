/* LA DENSIDAD DERIVADA. Ahora que la banda se corta a la medida del hueco, el numero que hay
 * que vigilar no es solo la fusion: es que la banda no se COLAPSE. Un solo punto apretado
 * decide la anchura de la obra entera, y si el hueco se va a cero la obra desaparece.
 *
 *   node densidad.js <gen.js> [n]
 */
const path = require('path');
const arg = process.argv[2] || './gen.js';
const { circuito } = require(arg.startsWith('.') || path.isAbsolute(arg) ? arg : './' + arg);
const N = parseInt(process.argv[3] || '120', 10);
// LAS DOS SUCESIONES DE SEMILLAS, y esto es la reparación de un agujero que dejó pasar una obra en
// blanco. Esta herramienta corría sobre `(i+1)*0x9E3779B1 ^ 0x5A17` y TODAS las demás corren sobre
// `2000 + 37i`. O sea que decía «0 de 120 colapsadas» con toda la razón: sobre sus 120 obras no
// había ninguna. Sobre las 40 de las otras herramientas había una, la #bdc, con la banda a cero — y
// la encontró la auditoría de rebote. Una comprobación que mira otra población que el resto del
// taller puede dar verde mientras otra da rojo, así que aquí se miran las dos.
const SEMILLAS = [
  ['2000+37i', (i) => (2000 + i * 37) >>> 0],
  ['hash', (i) => ((i + 1) * 0x9E3779B1 ^ 0x5A17) >>> 0],
];
const ws = [], hs = [], ceros = [];
for (const [nom, sem] of SEMILLAS)
  for (let i = 0; i < N; i++) {
    const c = circuito(sem(i), { grainScale: 0 });
    ws.push(c.W); hs.push(c.hueco / c.sep);
    if (!(c.W > 0.012)) ceros.push(nom + ':' + c.seed.toString(16));
  }
const p = (v, q) => { const s = v.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
console.log('W       p05=' + p(ws,0.05).toFixed(4) + '  mediana=' + p(ws,0.5).toFixed(4) +
            '  p95=' + p(ws,0.95).toFixed(4) + '   (referencias: 0,061)');
console.log('hueco/sep p05=' + p(hs,0.05).toFixed(2) + '  mediana=' + p(hs,0.5).toFixed(2));
console.log('obras con banda colapsada (W<=0,012): ' + ceros.length + ' de ' + (2 * N) +
            (ceros.length ? '  ' + ceros.slice(0,8).join(' ') : ''));
process.exit(ceros.length ? 1 : 0);
