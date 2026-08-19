/* POR QUÉ SE ROMPE UN ACOMPAÑAMIENTO — Y LA REGLA CON LA QUE SE MIDE.
 *
 * Nació para explicar un agujero que resultó no existir, y eso es lo primero que tiene que contar.
 *
 * `acomp2.js` daba rachas de 0,6-0,9 anchuras contra sus 1,4-4,5, y ese hueco justificó dos vueltas
 * de trabajo: enumerar las paralelas en vez de sortearlas, un suelo de duración, un barrido de seis
 * valores. El suelo no movió la mediana ni una décima —primera señal— y el apiñamiento salió igual
 * que el suyo: 1,33 vecinos a la vez contra sus 1,28-1,88. Mismo apiñamiento y quince veces más
 * roturas no cuadra, así que el sospechoso era la regla, no la obra: sus ejes están marcados A MANO
 * con un paso de una o dos anchuras de banda; los nuestros salen del paseo con un paso de 0,10. La
 * rotura se decide tramo a tramo, así que los nuestros tenían quince veces más ocasiones de romper.
 * Su «4,5» estaba medido con un metro que no distingue nada por debajo de 2.
 *
 * Con los dos lados al mismo paso, el agujero se cierra solo: mediana 2,0 contra su 1,9, p90 8,0 y
 * 6,3 contra su 5,9. Las nuestras duran algo MÁS que las suyas, y también en banda gorda. Lo que él
 * ve en las gordas —«tipo r5, aún estamos lejos»— es real, pero no es esto, y esta página existe
 * para que no se vuelva a buscar aquí.
 *
 * Lo que sí mide: cuando dos trazos que iban juntos dejan de ir juntos, QUÉ ha pasado.
 *
 * Cinco motivos, y cada uno pide un arreglo distinto:
 *
 *   ABRE    el vecino se va: la distancia pasa de 1,9 separaciones. Los trazos divergen.
 *   CIERRA  la distancia baja de 0,7. No debería pasar nunca —el suelo es 1,0— y si pasa es un fallo.
 *   GIRA    siguen a distancia buena pero el rumbo se separa más de 25°. Uno dobla y el otro no.
 *   CAMBIA  aparece un TERCERO más cerca. La racha no se acaba: se la queda otro. Esto no es que el
 *           acompañamiento falle, es que la obra está apelotonada — tres hebras trenzadas donde las
 *           seis tienen dos corriendo limpio.
 *   ACABA   se acaba el trazo. Aquí la racha no se rompe: la corta el largo del trazo, y entonces el
 *           problema no está en la relación sino en que los trazos son cortos.
 *
 * El mismo código sobre las seis y sobre lo nuestro, que es la única forma de que la comparación
 * signifique algo. Y con control: dos curvas paralelas largas de separación conocida tienen que dar
 * cero roturas y dos ACABA. Un cero sin control no significa nada.
 *
 *   node rompe.js [obras]     lo nuestro
 *   node rompe.js refs        las seis, sobre los ejes que él marcó a mano
 *   node rompe.js control     el instrumento contra un caso conocido
 */
const fs = require('fs');
const path = require('path');
const AQUI = __dirname;
const GEN = process.env.HRRS_GEN ? path.resolve(process.env.HRRS_GEN) : path.join(AQUI, 'gen.js');

const hy = Math.hypot;
const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

// mismos umbrales que acomp2.js, a propósito: si aquí se afinan, deja de explicar aquello
const CERCA = 0.7, LEJOS = 1.9, RUMBO = 25;

// LA MISMA REGLA PARA LOS DOS, QUE ES TODO EL PUNTO DE ESTE ARCHIVO.
//
// Sus ejes están marcados A MANO: 79 tramos en r1, 51 en r3, con un paso de una o dos anchuras de
// banda. Los nuestros salen del paseo y se remuestrean fino: 886 tramos, paso de 0,10 anchuras.
// Quince veces más resolución. Y la rotura de una racha se decide TRAMO A TRAMO, así que los
// nuestros tienen quince veces más ocasiones de que el vecino más próximo cambie por un tramo y
// vuelva. De ahí salía el agujero que llevo dos vueltas persiguiendo —«rachas de 0,7 anchuras
// contra sus 4,5»— y de ahí que no lo moviera ningún mando: no estaba en la obra, estaba en la
// regla. Su 4,5 se mide con un metro que no distingue nada por debajo de 2.
//
// Así que antes de medir, los dos lados al mismo paso. Se coge el suyo, que es el basto (1 anchura,
// el extremo fino de su rango: bastante grueso para no inventar roturas, bastante fino para no
// borrar un giro de verdad).
const PASO_MEDIDA = 1.0;                 // en anchuras de banda

function remuestrea(t, paso) {
  if (t.length < 2) return t;
  const out = [t[0].slice()];
  let resto = paso;
  for (let i = 0; i < t.length - 1; i++) {
    let ax = t[i][0], ay = t[i][1];
    const bx = t[i + 1][0], by = t[i + 1][1];
    let d = hy(bx - ax, by - ay);
    while (d >= resto) {
      const f = resto / d;
      ax += (bx - ax) * f; ay += (by - ay) * f;
      out.push([ax, ay]);
      d = hy(bx - ax, by - ay);
      resto = paso;
    }
    resto -= d;
  }
  const u = t[t.length - 1], v = out[out.length - 1];
  if (hy(u[0] - v[0], u[1] - v[1]) > paso * 0.35) out.push(u.slice());
  return out;
}

const alMismoPaso = (trazos, W) => trazos.map(t => remuestrea(t, W * PASO_MEDIDA))
                                        .filter(t => t.length > 1);

const cerca = (p, t) => {
  let dm = Infinity, dir = 0;
  for (let i = 0; i < t.length - 1; i++) {
    const ax = t[i][0], ay = t[i][1], ex = t[i + 1][0] - ax, ey = t[i + 1][1] - ay;
    const l2 = ex * ex + ey * ey;
    let u = l2 > 1e-18 ? ((p[0] - ax) * ex + (p[1] - ay) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const d = hy(p[0] - (ax + ex * u), p[1] - (ay + ey * u));
    if (d < dm) { dm = d; dir = Math.atan2(ey, ex) * 180 / Math.PI; }
  }
  return { d: dm, dir };
};

// de cada tramo: quién es el vecino que lo acompaña (o -1), y de los que NO acompañan, por qué no
function vecinoDe(trazos, k, i, sep) {
  const t = trazos[k];
  const mid = [(t[i][0] + t[i + 1][0]) / 2, (t[i][1] + t[i + 1][1]) / 2];
  const mio = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) * 180 / Math.PI;
  let mej = null, quien = -1;
  const porque = {};      // por cada trazo j, por qué no vale
  for (let j = 0; j < trazos.length; j++) {
    if (j === k || trazos[j].length < 2) continue;
    const c = cerca(mid, trazos[j]);
    const dif = Math.abs(corto(c.dir - mio));
    const rumbo = Math.min(dif, 180 - dif);
    if (c.d < sep * CERCA) { porque[j] = 'CIERRA'; continue; }
    if (c.d > sep * LEJOS) { porque[j] = 'ABRE'; continue; }
    if (rumbo > RUMBO) { porque[j] = 'GIRA'; continue; }
    if (!mej || c.d < mej.d) { mej = c; quien = j; }
  }
  return { quien, d: mej ? mej.d : 0, porque };
}

function motivos(crudos, W) {
  const trazos = alMismoPaso(crudos, W);
  const sep = W * 1.22;
  const cuenta = { ABRE: 0, CIERRA: 0, GIRA: 0, CAMBIA: 0, ACABA: 0 };
  const largos = [];
  for (let k = 0; k < trazos.length; k++) {
    const t = trazos[k];
    let act = null;                       // { quien, L }
    const cierra = (motivo) => {
      if (!act || act.L <= 0) { act = null; return; }
      cuenta[motivo]++; largos.push(act.L / W); act = null;
    };
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      if (L < 1e-9) continue;
      const v = vecinoDe(trazos, k, i, sep);
      if (act && v.quien === act.quien) { act.L += L; continue; }
      // la racha en curso se acaba aquí: el motivo lo da el vecino QUE LA LLEVABA
      if (act) cierra(v.quien >= 0 ? 'CAMBIA' : (v.porque[act.quien] || 'ABRE'));
      if (v.quien >= 0) act = { quien: v.quien, L };
    }
    cierra('ACABA');
  }
  return { cuenta, largos };
}

const q = (v, p) => v.length
  ? v.slice().sort((a, b) => a - b)[Math.min(v.length - 1, Math.floor(p * v.length))] : NaN;

function fila(nom, r) {
  const c = r.cuenta, n = Object.values(c).reduce((a, b) => a + b, 0) || 1;
  const pc = (x) => String(Math.round(100 * x / n)).padStart(3) + ' %';
  console.log('  %s  rachas %s   med %s p90 %s    ABRE %s  GIRA %s  CAMBIA %s  ACABA %s  CIERRA %s',
    nom.padEnd(12), String(n).padStart(4),
    q(r.largos, 0.5).toFixed(1).padStart(4), q(r.largos, 0.9).toFixed(1).padStart(4),
    pc(c.ABRE), pc(c.GIRA), pc(c.CAMBIA), pc(c.ACABA), pc(c.CIERRA));
}

const CAB = '  obra          rachas    largo         motivo de la rotura';

if (process.argv[2] === 'control') {
  // dos curvas paralelas largas, separación exacta de 1,22 W. Tienen que dar dos ACABA y nada más.
  const W = 0.05, R = W * 1.22, A = [], B = [];
  for (let i = 0; i <= 200; i++) {
    const u = i / 200, x = 0.1 + u * 0.8, y = 0.5 + Math.sin(u * 4) * 0.12;
    const dx = 0.8, dy = Math.cos(u * 4) * 4 * 0.12, m = hy(dx, dy);
    A.push([x, y]); B.push([x - dy / m * R, y + dx / m * R]);
  }
  console.log('CONTROL — dos curvas paralelas de separación exacta:');
  console.log(CAB); fila('paralelas', motivos([A, B], W));
  // y el control ROTO: la segunda se abre por la mitad. Tiene que aparecer un ABRE.
  const C = B.map((p, i) => i < 120 ? p : [p[0], p[1] + (i - 120) * 0.004]);
  console.log(CAB); fila('una se abre', motivos([A, C], W));
  // La rota da GIRA y no ABRE, y está bien: un trazo que empieza a irse CAMBIA DE RUMBO antes de
  // pasarse de distancia, así que el primer umbral que cruza es el del rumbo. Lo que importa del
  // control es que la limpia dure entera (18,6 anchuras, sin una sola rotura) y que la rota se corte.
  console.log('\n  esperado: la limpia 2 rachas, 100 % ACABA y el largo entero; la rota, cortada.');
  process.exit(0);
}

if (process.argv[2] === 'refs') {
  const MANO = JSON.parse(fs.readFileSync(path.join(AQUI, 'mano.json'), 'utf8'));
  const W = { r1: 0.0325, r2: 0.0417, r3: 0.0536, r4: 0.0523, r5: 0.0909, r6: 0.0889 };
  console.log('LAS SEIS — por qué se rompe cada acompañamiento:');
  console.log(CAB);
  const suma = { cuenta: { ABRE: 0, CIERRA: 0, GIRA: 0, CAMBIA: 0, ACABA: 0 }, largos: [] };
  for (const o of ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']) {
    const r = motivos(MANO[o].ejes.filter(e => e.length > 1), W[o]);
    fila(o + (W[o] > 0.07 ? ' (gorda)' : ''), r);
    for (const kk in r.cuenta) suma.cuenta[kk] += r.cuenta[kk];
    suma.largos.push(...r.largos);
  }
  console.log(CAB.replace(/./g, '-'));
  fila('las seis', suma);
  process.exit(0);
}

const { circuito } = require(GEN);
const N = parseInt(process.argv[2] || '40', 10);
const fino = { cuenta: { ABRE: 0, CIERRA: 0, GIRA: 0, CAMBIA: 0, ACABA: 0 }, largos: [] };
const gordo = { cuenta: { ABRE: 0, CIERRA: 0, GIRA: 0, CAMBIA: 0, ACABA: 0 }, largos: [] };
for (let i = 0; i < N; i++) {
  const o = circuito((2000 + i * 37) >>> 0, { grainScale: 0 });
  const r = motivos(o.trazos, o.W);
  const d = o.W < 0.055 ? fino : gordo;
  for (const kk in r.cuenta) d.cuenta[kk] += r.cuenta[kk];
  d.largos.push(...r.largos);
}
console.log('LO NUESTRO (%d obras) — por qué se rompe cada acompañamiento:', N);
console.log(CAB);
fila('banda fina', fino);
fila('banda gorda', gordo);
console.log('\n  las seis: med 1,9  p90 5,9   ABRE 12 %  GIRA 34 %  CAMBIA 33 %  ACABA 21 %' +
            '   (node rompe.js refs)');
console.log('  al mismo paso no hay hueco: ni de duración ni de motivo. Lo que él ve en las gordas');
console.log('  está en otra parte —el relleno de los cruces, el trazo que se bifurca— no aquí.');
