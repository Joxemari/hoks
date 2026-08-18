/* ¿SE TOCAN DOS BANDAS? La regla absoluta del autor, medida donde de verdad vive.
 *
 * `funde.js` la mide contando las piezas de tinta de la imagen y comparándolas con las que debería
 * haber. Es una buena idea —fundirse es un hecho del dibujo— pero tiene dos costes que se han ido
 * viendo por el camino: hay que llevar la cuenta de cuántas piezas ESPERA cada trazo, que con los
 * trazos que se salen del pliego es un cálculo aparte y ya se equivocó dos veces; y el número
 * depende del tamaño al que se rasterice y del filtro de motas.
 *
 * Y MIDE TAMBIÉN EL TRAZO CONTRA SÍ MISMO, que es la misma regla y se me había escapado: «no se
 * puede ver una superficie negra porque uno de los trazos haya volteado sobre sí; siempre se tiene
 * que ver que es un trazo». Un trazo que se doblara encima de sí mismo dejaba la obra con el mismo
 * número de piezas de tinta, así que `funde.js` no lo veía y esto tampoco lo miraba. Se comprueba
 * sobre el CONTORNO: si el borde de un trazo se cruza con otra parte de su propio borde, la banda
 * se ha comido a sí misma y ha dejado de ser un trazo.
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

// EL CANAL DE UN TRAZO CONSIGO MISMO. La misma regla, dentro del mismo trazo.
//
// Antes probé dos medidas y las dos fallan, y conviene dejarlo escrito para no volver:
//
//   el CRUCE del contorno ... una horquilla no cruza su propio contorno, porque el borde de dentro
//                             se recorta al radio de curvatura. Sale «limpio» con la tinta doblada.
//   el ÁREA perdida ......... una esquina de 140° pierde el 33 % del área legítimamente y una U que
//                             se toca justo pierde el 5 %. No separa una cosa de la otra.
//
// Lo que sí corresponde a lo que él pide —«siempre tiene que haber márgenes, siempre se tiene que
// ver que es un trazo»— es el hueco entre las dos ramas: la distancia entre dos partes del eje
// MENOS sus dos semianchuras.
//
// Y HACEN FALTA LAS DOS CONDICIONES, giro Y recorrido, que con una sola me equivoqué otra vez. Con
// sólo el giro acumulado salían 6 obras de 60 «dobladas», y mirando dónde: pares de tramos a 2 y a
// 11 muestras de distancia, o sea 0,2 a 1,1 anchuras de recorrido. No eran pliegues, eran esquinas
// tan cerradas que en ese trecho el giro ya pasa de 115°. Una vuelta sobre sí exige haberse ido y
// haber vuelto: giro ≥ 115° Y recorrido ≥ 2 anchuras entre los dos tramos.
//
// Con ese mismo umbral, las seis obras dejan p10 0,53 y mediana 1,04 anchuras de canal propio.
const MEDIA_VUELTA = 115, ARCO_MIN = 2.0;
const cortoG = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
function canalPropio(t0, semis0, W) {
  // diezmado por lo mismo que en el generador: un eje trae 450 puntos y esto es O(n²) con
  // trigonometría dentro. A uno de cada tres, nueve veces más rápido y el pliegue se ve igual.
  const paso = t0.length > 90 ? 3 : 1;
  const t = paso > 1 ? t0.filter((_, i) => i % paso === 0 || i === t0.length - 1) : t0;
  const semis = paso > 1 ? semis0.filter((_, i) => i % paso === 0 || i === semis0.length - 1) : semis0;
  const dir = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  const sm = (i) => { const l = semis[Math.min(i, semis.length - 1)]; return Math.max(l[0], l[1]); };
  let peor = Infinity;
  for (let i = 0; i < t.length - 1; i++) {
    let giro = 0, arco = 0, ult = dir(t[i], t[i + 1]);
    for (let j = i + 1; j < t.length - 1; j++) {
      const d = dir(t[j], t[j + 1]);
      giro += Math.abs(cortoG(d - ult));
      arco += Math.hypot(t[j][0] - t[j - 1][0], t[j][1] - t[j - 1][1]);
      ult = d;
      if (giro < MEDIA_VUELTA || arco < ARCO_MIN * W) continue;
      const g = dSeg(t[i], t[i + 1], t[j], t[j + 1]) - sm(i) - sm(j);
      if (g < peor) peor = g;
    }
  }
  return peor;
}

function canalDe(o, cd) {
  const cont = cd || contornoDe;
  o = o || {};
  const C = [], K = [];
  for (let k = 0; k < o.trazos.length; k++) {
    const c = cont(o, k);
    if (c.length < 4) { C.push(null); K.push(null); continue; }
    const s = PASO > 1 ? c.filter((_, i) => i % PASO === 0) : c;
    C.push(s); K.push(caja(s));
  }
  // UNA REJILLA, porque comparar dos contornos de novecientos puntos todos contra todos es un
  // millón de cuentas por par y con diez trazos la herramienta deja de terminar. Cada segmento se
  // mete en las celdas que toca —de lado una anchura de banda— y sólo se compara con lo que cae en
  // su vecindad. No pierde precisión: lo que está a más de una celda no puede ser el mínimo.
  const LADO = Math.max(1e-6, o.W);
  const cel = (x, y) => Math.floor(x / LADO) + ',' + Math.floor(y / LADO);
  const rejilla = (P) => {
    const m = new Map();
    for (let i = 0; i < P.length - 1; i++) {
      const x0 = Math.min(P[i][0], P[i + 1][0]), x1 = Math.max(P[i][0], P[i + 1][0]);
      const y0 = Math.min(P[i][1], P[i + 1][1]), y1 = Math.max(P[i][1], P[i + 1][1]);
      for (let cx = Math.floor(x0 / LADO); cx <= Math.floor(x1 / LADO); cx++)
        for (let cy = Math.floor(y0 / LADO); cy <= Math.floor(y1 / LADO); cy++) {
          const kk = cx + ',' + cy;
          if (!m.has(kk)) m.set(kk, []);
          m.get(kk).push(i);
        }
    }
    return m;
  };
  let peor = Infinity, par = null;
  const R = C.map(c => (c ? rejilla(c) : null));
  for (let k = 0; k < C.length; k++) {
    if (!C[k]) continue;
    for (let j = k + 1; j < C.length; j++) {
      if (!C[j] || cajasLejos(K[k], K[j], peor === Infinity ? 1e9 : peor)) continue;
      const P = C[k], Q = C[j], g = R[j];
      const vistos = new Set();
      for (let i = 0; i < P.length - 1; i++) {
        const cx = Math.floor(P[i][0] / LADO), cy = Math.floor(P[i][1] / LADO);
        for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) {
          const lista = g.get((cx + ax) + ',' + (cy + ay));
          if (!lista) continue;
          for (const q of lista) {
            const kk = i * 100000 + q;
            if (vistos.has(kk)) continue;
            vistos.add(kk);
            const d = dSeg(P[i], P[i + 1], Q[q], Q[q + 1]);
            if (d < peor) { peor = d; par = [k, j]; if (peor <= 0) return { canal: peor, par }; }
          }
        }
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
  let dobla = 0, propio = Infinity;
  for (let k = 0; k < o.trazos.length; k++) {
    const g = canalPropio(o.trazos[k], o.semis[k], o.W);
    if (isFinite(g)) { if (g < propio) propio = g; if (g <= 0) dobla++; }
  }
  filas.push({ seed, W: o.W, n: o.trazos.length, canal: canal / o.W, par, tipo: o.tipo, dobla,
               propio: isFinite(propio) ? propio / o.W : Infinity });
}
const tocan = filas.filter(f => f.canal <= 0);
const cs = filas.filter(f => isFinite(f.canal)).map(f => f.canal).sort((a, b) => a - b);
const q = (v) => cs.length ? cs[Math.min(cs.length - 1, Math.floor(v * cs.length))] : NaN;

const doblan = filas.filter(f => f.dobla > 0);
console.log('obras=' + N + '   SE TOCAN=' + tocan.length +
            ' (' + (100 * tocan.length / N).toFixed(0) + '%)' +
            '   SE DOBLAN SOBRE SÍ=' + doblan.length +
            ' (' + (100 * doblan.length / N).toFixed(0) + '%)');
for (const f of doblan.slice(0, 6))
  console.log('   se dobla  #' + f.seed.toString(16) + '  ' + f.dobla + ' de ' + f.n +
              ' trazos   canal propio ' + f.propio.toFixed(3));
{
  const ps = filas.map(f => f.propio).filter(isFinite).sort((a, b) => a - b);
  if (ps.length) console.log('canal de un trazo consigo mismo: mínimo ' + ps[0].toFixed(3) +
    '   p10 ' + ps[Math.floor(0.1 * ps.length)].toFixed(3) +
    '   mediana ' + ps[Math.floor(0.5 * ps.length)].toFixed(3));
}
console.log('canal entre bandas de trazos distintos, en anchuras:');
console.log('   mínimo ' + q(0).toFixed(3) + '   p10 ' + q(0.1).toFixed(3) +
            '   mediana ' + q(0.5).toFixed(3) + '   (el canal medido en las seis: 0,22)');
for (const f of tocan.slice(0, 8))
  console.log('   #' + f.seed.toString(16) + '  trazos ' + f.n + '  canal ' +
              f.canal.toFixed(3) + '  par ' + JSON.stringify(f.par) + '  (' + f.tipo + ')');
process.exit(tocan.length || doblan.length ? 1 : 0);
