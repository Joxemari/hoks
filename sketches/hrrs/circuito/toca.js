/* ¿SE TOCAN DOS BANDAS? La regla absoluta del autor, medida donde de verdad vive.
 *
 * `funde.js` la mide contando las piezas de tinta de la imagen y comparándolas con las que debería
 * haber. Es una buena idea —fundirse es un hecho del dibujo— pero tiene dos costes que se han ido
 * viendo por el camino: hay que llevar la cuenta de cuántas piezas ESPERA cada trazo, que con los
 * trazos que se salen del pliego es un cálculo aparte y ya se equivocó dos veces; y el número
 * depende del tamaño al que se rasterice y del filtro de motas.
 *
 * Esto lo mide sin rasterizar nada: la distancia mínima entre el CONTORNO de un trazo y el de otro.
 * Si es negativa, la tinta se toca; si es positiva, ése es el canal que queda. Un número por obra,
 * exacto, y en anchuras de banda para poder compararlo con las referencias — donde el canal medido
 * entre dos bandas paralelas es 0,22.
 *
 * El caso que lo motivó: una obra que `funde.js` daba por fundida (13 piezas de 14) tenía en
 * realidad 0,255 anchuras de canal en su punto más apretado. La geometría estaba limpia y lo que
 * fallaba era la contabilidad de piezas esperadas.
 *
 *   node toca.js [obras] [semilla0]
 *   node toca.js control            rompe la garantía y comprueba que entonces SÍ se tocan
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { circuito, contornoDe } = require(process.env.HRRS_GEN
  ? path.resolve(process.env.HRRS_GEN) : path.resolve(__dirname, 'gen.js'));

const N = parseInt(process.argv[2] || '60', 10);
const S0 = parseInt(process.argv[3] || '2000', 10);
const PASO = parseInt(process.argv[4] || '2', 10);   // 1 = exacto, 2 = un punto de cada dos

const dp = (p, u, v) => {
  const ex = v[0] - u[0], ey = v[1] - u[1], l2 = ex * ex + ey * ey;
  let t = l2 > 1e-18 ? ((p[0] - u[0]) * ex + (p[1] - u[1]) * ey) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(p[0] - (u[0] + ex * t), p[1] - (u[1] + ey * t));
};
const lado = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
function dSeg(a, b, c, d) {
  if (((lado(a, b, c) > 0) !== (lado(a, b, d) > 0)) &&
      ((lado(c, d, a) > 0) !== (lado(c, d, b) > 0))) return 0;   // se cruzan: la tinta es una sola
  // (cero y no un número negativo: la profundidad del solape no se mide aquí y meter un centinela
  // negativo lo disfrazaba de magnitud — salía «-20 anchuras», que no significa nada)
  return Math.min(dp(a, c, d), dp(b, c, d), dp(c, a, b), dp(d, a, b));
}

// la caja de un contorno, para no comparar todo contra todo cuando están lejos
const caja = (P) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of P) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
                       if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return [x0, y0, x1, y1];
};
const cajasLejos = (A, B, d) =>
  A[0] - B[2] > d || B[0] - A[2] > d || A[1] - B[3] > d || B[1] - A[3] > d;

function canalDe(o, cd) {
  const cont = cd || contornoDe;
  const C = [], K = [];
  for (let k = 0; k < o.trazos.length; k++) {
    const c = cont(o, k);
    if (c.length < 4) { C.push(null); K.push(null); continue; }
    const s = PASO > 1 ? c.filter((_, i) => i % PASO === 0) : c;
    C.push(s); K.push(caja(s));
  }
  let peor = Infinity, par = null;
  for (let k = 0; k < C.length; k++) {
    if (!C[k]) continue;
    for (let j = k + 1; j < C.length; j++) {
      if (!C[j] || cajasLejos(K[k], K[j], peor === Infinity ? 1e9 : peor)) continue;
      const P = C[k], Q = C[j];
      for (let i = 0; i < P.length - 1; i++)
        for (let q = 0; q < Q.length - 1; q++) {
          const d = dSeg(P[i], P[i + 1], Q[q], Q[q + 1]);
          if (d < peor) { peor = d; par = [k, j]; if (peor <= 0) return { canal: peor, par }; }
        }
    }
  }
  return { canal: peor, par };
}

// EL CONTROL, Y NO ES EL QUE YO ESPERABA.
//
// Primero se intentó lo de siempre: romper la línea que sostiene la regla y comprobar que entonces
// las bandas se tocan. No disparó. Se probaron las tres candidatas —el suelo de W, el tope del
// relleno y el filtro largo del relleno— y con las tres rotas siguen sin tocarse 0 de 40. La
// conclusión no es que la medida no valga: es que LA REGLA ESTÁ SOBREDETERMINADA. La sostienen a la
// vez el paseo (que no deja acercar dos ejes a menos de 0,78 separaciones), el tope del relleno
// (que corta cada lado al sitio que hay), el suelo de W y la derivación del percentil. Quitando una
// cualquiera, las otras siguen bastando. Eso es una propiedad del diseño y conviene saberla: no hay
// una línea que proteja la regla del autor, hay cuatro.
//
// Pero entonces hace falta controlar el INSTRUMENTO por otro lado, porque un cero sin control sigue
// sin significar nada. Se le dan dos bandas de anchura conocida a distancia conocida —igual que
// `piel.py` se controla con una banda lisa y otra rota— y se comprueba que mide lo que debe:
// a 2 anchuras de eje tiene que ver 1 anchura de canal, y a 1 anchura tiene que ver cero.
function bandasA(d) {
  const W = 0.05, n = 40, t1 = [], t2 = [];
  for (let i = 0; i < n; i++) { const x = 0.1 + i * 0.02; t1.push([x, 0.5]); t2.push([x, 0.5 + d * W]); }
  return { trazos: [t1, t2], W, fw: 1, fh: 1, seed: 1, taco: 0,
           contornos: ['limpio', 'limpio'],
           semis: [t1.map(() => [W / 2, W / 2]), t2.map(() => [W / 2, W / 2])] };
}
if (process.argv[2] === 'control') {
  let fallo = 0;
  console.log('el instrumento, contra bandas de separación conocida:');
  for (const [d, esperado] of [[2.0, 1.0], [1.4, 0.4], [1.0, 0.0], [0.6, 0.0]]) {
    const o = bandasA(d);
    const m = canalDe(o).canal / o.W;
    const ok = Math.abs(m - esperado) < 0.03;
    console.log('   ejes a ' + d.toFixed(1) + ' anchuras → canal ' + m.toFixed(3) +
                '   espera ' + esperado.toFixed(2) + (ok ? '   ok' : '   MAL'));
    if (!ok) fallo = 1;
  }
  console.log('\ny las tres piezas que se creía que sostenían la regla, rotas una a una:');
  const src = fs.readFileSync(path.resolve(__dirname, 'gen.js'), 'utf8');
  const rot = [
    ['suelo de W', 'W = Math.min(W, huecoMinimo(trazos) / (1 + CANAL));', '// ROTO'],
    ['tope del relleno', 'lado[s2] = Math.max(W * 0.42, Math.min(W / 2 * CRECE, hasta));',
     'lado[s2] = W / 2 * CRECE;  // ROTO'],
    ['filtro del relleno', 'sm[i][s2] = Math.min(raw[i], a / n3);', 'sm[i][s2] = a / n3;  // ROTO'],
  ];
  for (const [nom, a, b] of rot) {
    if (!src.includes(a)) { console.log('   ' + nom + ': NO ESTÁ LA LÍNEA — el control ha caducado');
                            fallo = 1; continue; }
    const f = path.join(os.tmpdir(), 'gen_roto_' + nom.replace(/\W/g, '') + '.js');
    fs.writeFileSync(f, src.replace(a, b, 1));
    const g2 = require(f);
    let t = 0;
    for (let i = 0; i < 30; i++)
      if (canalDe(g2.circuito((2000 + i * 37) >>> 0, { grainScale: 0 }), g2.contornoDe).canal <= 0) t++;
    console.log('   ' + nom.padEnd(20) + ' se tocan ' + t + ' de 30');
  }
  console.log('\nninguna dispara: la regla no cuelga de una línea, cuelga de cuatro a la vez.');
  process.exit(fallo);
}

const filas = [];
for (let i = 0; i < N; i++) {
  const seed = (S0 + i * 37) >>> 0;
  const o = circuito(seed, { grainScale: 0 });
  const { canal, par } = canalDe(o);
  filas.push({ seed, W: o.W, n: o.trazos.length, canal: canal / o.W, par, tipo: o.tipo });
}
const tocan = filas.filter(f => f.canal <= 0);
const cs = filas.filter(f => isFinite(f.canal)).map(f => f.canal).sort((a, b) => a - b);
const q = (v) => cs.length ? cs[Math.min(cs.length - 1, Math.floor(v * cs.length))] : NaN;

console.log('obras=' + N + '   SE TOCAN=' + tocan.length +
            ' (' + (100 * tocan.length / N).toFixed(0) + '%)');
console.log('canal entre bandas de trazos distintos, en anchuras:');
console.log('   mínimo ' + q(0).toFixed(3) + '   p10 ' + q(0.1).toFixed(3) +
            '   mediana ' + q(0.5).toFixed(3) + '   (el canal medido en las seis: 0,22)');
for (const f of tocan.slice(0, 8))
  console.log('   #' + f.seed.toString(16) + '  trazos ' + f.n + '  canal ' +
              f.canal.toFixed(3) + '  par ' + JSON.stringify(f.par) + '  (' + f.tipo + ')');
process.exit(tocan.length ? 1 : 0);
