/* EL ACOMPAÑAMIENTO: qué parte de un trazo corre al lado de otro.
 *
 * Es lo primero que él pidió de esta familia —«las paralelizaciones»— y lo más fácil de perder sin
 * enterarse, porque no lo delata ningún fallo: la obra sigue saliendo, sólo que sus trazos ya no se
 * acompañan. Cada cambio del paseo puede llevárselo, así que se mide contra las seis.
 *
 * De cada punto del eje se mira si hay OTRO trazo a distancia de canal —entre 0,8 y 1,7
 * separaciones— y con rumbo parecido, menos de 25° de diferencia. La fracción de la longitud que
 * cumple eso es el acompañamiento de la obra.
 *
 *   node acomp.js [obras]        lo nuestro
 *   node acomp.js refs           las seis, sobre los ejes que él marcó a mano
 */
const fs = require('fs');
const path = require('path');
const AQUI = __dirname;
const GEN = process.env.HRRS_GEN ? path.resolve(process.env.HRRS_GEN) : path.join(AQUI, 'gen.js');
const { circuito } = require(GEN);

const hy = Math.hypot;
const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

// el punto más próximo de una polilínea, con su rumbo
function cerca(p, t) {
  let dm = Infinity, dir = 0;
  for (let i = 0; i < t.length - 1; i++) {
    const ax = t[i][0], ay = t[i][1];
    const ex = t[i + 1][0] - ax, ey = t[i + 1][1] - ay, l2 = ex * ex + ey * ey;
    let u = l2 > 1e-18 ? ((p[0] - ax) * ex + (p[1] - ay) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const d = hy(p[0] - (ax + ex * u), p[1] - (ay + ey * u));
    if (d < dm) { dm = d; dir = Math.atan2(ey, ex) * 180 / Math.PI; }
  }
  return { d: dm, dir };
}

// acompañamiento de una obra: sep es la separación nominal (banda + canal)
function acompDe(trazos, sep) {
  let conVecino = 0, total = 0;
  for (let k = 0; k < trazos.length; k++) {
    const t = trazos[k];
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      if (L < 1e-9) continue;
      const mid = [(t[i][0] + t[i + 1][0]) / 2, (t[i][1] + t[i + 1][1]) / 2];
      const mio = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) * 180 / Math.PI;
      let acompaña = false;
      for (let j = 0; j < trazos.length && !acompaña; j++) {
        if (j === k || trazos[j].length < 2) continue;
        const c = cerca(mid, trazos[j]);
        if (c.d < sep * 0.8 || c.d > sep * 1.7) continue;
        const dif = Math.abs(corto(c.dir - mio));
        if (Math.min(dif, 180 - dif) < 25) acompaña = true;
      }
      total += L;
      if (acompaña) conVecino += L;
    }
  }
  return total > 0 ? conVecino / total : 0;
}

if (process.argv[2] === 'refs') {
  const MANO = JSON.parse(fs.readFileSync(path.join(AQUI, 'mano.json'), 'utf8'));
  const W = { r1: 0.0325, r2: 0.0417, r3: 0.0536, r4: 0.0523, r5: 0.0909, r6: 0.0889 };
  const vs = [];
  console.log('obra   banda   trazos   acompañamiento');
  for (const o of ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']) {
    const t = MANO[o].ejes.filter(e => e.length > 1);
    const a = acompDe(t, W[o] * 1.22);
    vs.push(a);
    console.log('  ' + o + '  ' + W[o].toFixed(4) + '   ' + String(t.length).padStart(3) +
                '      ' + (100 * a).toFixed(0) + ' %');
  }
  vs.sort((a, b) => a - b);
  console.log('\nlas seis: mediana ' + (100 * vs[3]).toFixed(0) + ' %   rango ' +
              (100 * vs[0]).toFixed(0) + '–' + (100 * vs[5]).toFixed(0) + ' %');
  process.exit(0);
}

const N = parseInt(process.argv[2] || '40', 10);
const vs = [];
for (let i = 0; i < N; i++) {
  const o = circuito((2000 + i * 37) >>> 0, { grainScale: 0 });
  vs.push(acompDe(o.trazos, o.sep || o.W * 1.22));
}
vs.sort((a, b) => a - b);
const q = (v) => vs[Math.min(vs.length - 1, Math.floor(v * vs.length))];
console.log('acompañamiento en ' + N + ' obras:');
console.log('   p10 ' + (100 * q(0.1)).toFixed(0) + ' %   mediana ' + (100 * q(0.5)).toFixed(0) +
            ' %   p90 ' + (100 * q(0.9)).toFixed(0) + ' %');
console.log('   las seis: mediana 57 %   rango 32-63 %   (node acomp.js refs)');
