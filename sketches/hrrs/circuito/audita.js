/* LA AUDITORÍA: TODA LA FAMILIA CONTRA r1, r2, r5 Y r6, DIMENSIÓN POR DIMENSIÓN.
 *
 * Hasta ahora cada rasgo tenía su herramienta y cada herramienta su tabla, así que la comparación
 * con las referencias estaba repartida en doce sitios y ninguno decía cuánto nos falta EN TOTAL.
 * Esto lo junta: un solo camino de código, aplicado a los ejes que él marcó a mano y a lo que sale
 * del generador, y una tabla con el veredicto de cada dimensión.
 *
 * LAS CUATRO Y NO LAS SEIS, porque él las descartó a mano y por buenos motivos:
 *   r3 — «ya hemos dicho que era raro, descártalo».
 *   r4 — en su foto las bandas salen fundidas y la geometría marcada queda corrompida: da una piel
 *        de 0,130 cuando las otras dan 0,034, y una rectitud de 0,23 cuando ninguna baja de 0,40.
 * De r2 se usan los EJES pero no la foto: en su fotografía entra el muro, la máscara de tinta se lo
 * come y todo lo que se mide sobre el píxel cae al suelo del método (ver `rendija.py`).
 *
 * Y TODO LO QUE SE DECIDE TRAMO A TRAMO SE MIDE AL MISMO PASO. Sus ejes están marcados a mano —diez
 * puntos en un trazo de r1— y los nuestros salen del paseo remuestreados a 0,10 anchuras: quince
 * veces más resolución. Cualquier medida que cuente por tramos —el giro, la tirada, quién acompaña a
 * quién— sale quince veces distinta por eso y por nada más. Ya me pasó: dos vueltas de trabajo
 * persiguiendo un hueco de acompañamiento que sólo estaba en la regla (ver `rompe.js`). Las medidas
 * integrales —largo, cuerda, cobertura— no lo necesitan y se toman en crudo, y aquí está dicho cuál
 * es cuál.
 *
 *   node audita.js [obras]        la tabla (40 obras nuestras por defecto)
 *   node audita.js control        el instrumento contra casos conocidos
 */
const fs = require('fs');
const path = require('path');
const AQUI = __dirname;
const GEN = process.env.HRRS_GEN ? path.resolve(process.env.HRRS_GEN) : path.join(AQUI, 'gen.js');

const hy = Math.hypot;
const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
const REFS = ['r1', 'r2', 'r5', 'r6'];
const W_REAL = { r1: 0.0325, r2: 0.0417, r3: 0.0536, r4: 0.0523, r5: 0.0909, r6: 0.0889 };
const PASO_MEDIDA = 1.0;            // en anchuras de banda, el paso común. El suyo es el basto.

// ── LA REGLA COMÚN ────────────────────────────────────────────────────────────
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

const largoDe = (t) => {
  let L = 0;
  for (let i = 0; i < t.length - 1; i++) L += hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
  return L;
};

// el punto más próximo de una polilínea: distancia, punto, rumbo y recorrido hasta él
function cercaDe(p, t) {
  let mej = null, acc = 0;
  for (let i = 0; i < t.length - 1; i++) {
    const ax = t[i][0], ay = t[i][1], ex = t[i + 1][0] - ax, ey = t[i + 1][1] - ay;
    const l2 = ex * ex + ey * ey, L = Math.sqrt(l2);
    let u = l2 > 1e-18 ? ((p[0] - ax) * ex + (p[1] - ay) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const d = hy(p[0] - (ax + ex * u), p[1] - (ay + ey * u));
    if (!mej || d < mej.d) mej = { d, dir: Math.atan2(ey, ex) * 180 / Math.PI, s: acc + L * u };
    acc += L;
  }
  if (mej) mej.S = acc;
  return mej;
}

// ── LAS MEDIDAS, UNA FUNCIÓN POR DIMENSIÓN, LOS DOS LADOS POR EL MISMO SITIO ──
//
// Cada una recibe la obra ya normalizada: { trazos, W, fw, fh } con las coordenadas en unidades del
// lado corto y W la anchura de banda en esas mismas unidades.

function medidas(o) {
  const { W, fw, fh } = o;
  const crudos = o.trazos.filter(t => t.length > 1);
  if (!crudos.length) return null;
  // el mismo paso para todo lo que cuenta por tramos
  const T = crudos.map(t => remuestrea(t, W * PASO_MEDIDA)).filter(t => t.length > 1);
  const sep = W * 1.22;
  const m = {};

  // ── integrales: no dependen de la resolución, van en crudo ──
  m.trazos = crudos.length;
  const Ls = crudos.map(largoDe);
  const Lt = Ls.reduce((a, b) => a + b, 0);
  m.largoTrazo = mediana(Ls.map(L => L / W));
  m.largoTotal = Lt / W;
  m.cobertura = 100 * Lt * W / (fw * fh);
  m.rectitud = mediana(crudos.map(t =>
    hy(t[t.length - 1][0] - t[0][0], t[t.length - 1][1] - t[0][1]) / Math.max(1e-9, largoDe(t))));
  m.proporcion = Math.max(fw, fh) / Math.min(fw, fh);
  // EL CANAL entra aquí aunque no se mida sobre el eje, porque es la dimensión que trajo toda esta
  // vuelta y tiene que estar en la tabla. En las referencias se mide sobre el PÍXEL —la moda del
  // papel estrecho, `python3 rendija.py fotos`, de donde salen las constantes de CANAL_FOTO— y en lo
  // nuestro es un parámetro de la obra, así que se lee de `sep / W - 1`. No es el mismo camino de
  // código y por eso está dicho: es la única fila de la tabla que compara una medida con un ajuste.
  m.canal = o.canal != null ? o.canal : NaN;

  // ── por tramos: al paso común ──
  // el rumbo, en doce sectores de 15°, pesado por longitud. La CONCENTRACIÓN es el sector mayor:
  // dice si la obra tiene un alfabeto de direcciones o se va a todos lados.
  const h = new Array(12).fill(0);
  let tot = 0;
  for (const t of T) for (let i = 0; i < t.length - 1; i++) {
    const dx = t[i + 1][0] - t[i][0], dy = t[i + 1][1] - t[i][1], L = hy(dx, dy);
    if (L < 1e-12) continue;
    let a = Math.atan2(dy, dx) * 180 / Math.PI;
    a = ((a % 180) + 180) % 180;
    h[Math.min(11, Math.floor(a / 15))] += L; tot += L;
  }
  m.concentracion = 100 * Math.max(...h) / Math.max(1e-9, tot);

  // el giro y la tirada: cuánto dobla y cuánto corre entre quiebros. Un quiebro es un vértice de
  // más de 30° medido AL PASO COMÚN, que es la única forma de que su trazo de diez puntos y el
  // nuestro de cuatrocientos hablen de lo mismo.
  const giros = [], tiradas = [];
  for (const t of T) {
    let corrido = 0;
    for (let i = 1; i < t.length - 1; i++) {
      const a = Math.atan2(t[i][1] - t[i - 1][1], t[i][0] - t[i - 1][0]) * 180 / Math.PI;
      const b = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) * 180 / Math.PI;
      const g = Math.abs(corto(b - a));
      corrido += hy(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1]);
      if (g > 30) { giros.push(g); tiradas.push(corrido / W); corrido = 0; }
    }
  }
  m.quiebro = giros.length ? mediana(giros) : NaN;
  m.tirada = tiradas.length ? mediana(tiradas) : NaN;

  // el acompañamiento: fracción de longitud con otro trazo al lado, y las rachas continuas
  const R = rachas(T, W, sep);
  m.acompana = 100 * R.fraccion;
  m.rachaMed = R.med;
  m.rachaP90 = R.p90;
  m.cambia = R.cambia;               // qué parte de las roturas es «se la queda un tercero»
  m.acaba = R.acaba;                 // ...y qué parte es «se acabó el trazo»
  m.vecinos = R.vecinos;             // cuántos trazos a la vez, allí donde hay alguien
  m.socios = R.socios;               // cuántos socios distintos tiene un trazo a lo largo de sí

  // EL HAZ, que es la dimensión que encontró la diferencia de verdad y por eso está aquí. Dos trazos
  // van EN EL MISMO HAZ si se acompañan a distancia de canal durante dos anchuras seguidas —no un
  // instante: seguidas, o cualquier cruce contaría—. Los haces son las componentes conexas de esa
  // relación, y lo que importa es el MAYOR: sus obras tienen uno que se traga casi todo (los 8 trazos
  // de r1 en uno solo, 9 de los 14 de r6) mientras las nuestras se desmigaban en grupitos. Ninguna de
  // las otras veinte columnas lo decía, porque todas miran rasgos y ésta mira la ESTRUCTURA.
  const H = haces(T, W, sep);
  m.hazMayor = 100 * H.mayor / T.length;
  m.sueltos = 100 * H.sueltos / T.length;

  // los cruces de eje: en las cuatro casi no hay, y conviene que se vea
  let cr = 0;
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++)
    for (let p = 0; p < T[i].length - 1; p++) for (let q = 0; q < T[j].length - 1; q++)
      if (seCortan(T[i][p], T[i][p + 1], T[j][q], T[j][q + 1])) cr++;
  m.cruces = cr;

  // los cabos, con los umbrales de `cabos.py`: más de 2,5 anchuras es al aire, y si cae a menos de
  // 2 anchuras de un cabo del vecino es cabo contra cabo
  const C = cabos(crudos, W, fw, fh);
  m.mueren = C.mueren;
  m.aCabo = C.aCabo;
  m.aire = C.aire;
  return m;
}

// los haces: componentes conexas de «se acompañan de corrido durante dos anchuras»
function haces(T, W, sep) {
  const n = T.length;
  const junto = Array.from({ length: n }, () => new Set());
  for (let k = 0; k < n; k++) {
    const t = T[k], corrido = {};
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      if (L < 1e-12) continue;
      const mid = [(t[i][0] + t[i + 1][0]) / 2, (t[i][1] + t[i + 1][1]) / 2];
      const mio = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) * 180 / Math.PI;
      for (let j = 0; j < n; j++) {
        if (j === k || T[j].length < 2) continue;
        const c = cercaDe(mid, T[j]);
        let ok = false;
        if (c && c.d >= sep * 0.7 && c.d <= sep * 1.9) {
          const dif = Math.abs(corto(c.dir - mio));
          ok = Math.min(dif, 180 - dif) < 25;
        }
        // DE CORRIDO: el contador se pone a cero en cuanto se pierde. Sumando sin más, dos trazos que
        // se rozan en veinte sitios distintos acabarían «en el mismo haz» sin haber corrido juntos.
        if (ok) {
          corrido[j] = (corrido[j] || 0) + L;
          if (corrido[j] >= 2 * W) { junto[k].add(j); junto[j].add(k); }
        } else corrido[j] = 0;
      }
    }
  }
  const visto = new Array(n).fill(false);
  let mayor = 0, sueltos = 0;
  for (let k = 0; k < n; k++) {
    if (visto[k]) continue;
    let c = 0; const pila = [k]; visto[k] = true;
    while (pila.length) { const x = pila.pop(); c++;
      for (const y of junto[x]) if (!visto[y]) { visto[y] = true; pila.push(y); } }
    if (c > mayor) mayor = c;
    if (c === 1) sueltos++;
  }
  return { mayor, sueltos };
}

function seCortan(a, b, c, d) {
  const s = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return s(a, b, c) !== s(a, b, d) && s(c, d, a) !== s(c, d, b);
}

function rachas(T, W, sep) {
  const out = [];
  let conVecino = 0, total = 0, cambia = 0, acaba = 0, otras = 0;
  let sumaVec = 0, nVec = 0;
  const socios = [];
  for (let k = 0; k < T.length; k++) {
    const t = T[k], vistos = new Set();
    let act = null;
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      if (L < 1e-12) continue;
      const mid = [(t[i][0] + t[i + 1][0]) / 2, (t[i][1] + t[i + 1][1]) / 2];
      const mio = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) * 180 / Math.PI;
      let mej = null, quien = -1, cuantos = 0;
      for (let j = 0; j < T.length; j++) {
        if (j === k || T[j].length < 2) continue;
        const c = cercaDe(mid, T[j]);
        if (!c || c.d < sep * 0.7 || c.d > sep * 1.9) continue;
        const dif = Math.abs(corto(c.dir - mio));
        if (Math.min(dif, 180 - dif) > 25) continue;
        cuantos++; vistos.add(j);
        if (!mej || c.d < mej.d) { mej = c; quien = j; }
      }
      total += L;
      if (quien >= 0) { conVecino += L; sumaVec += cuantos; nVec++; }
      if (act && quien === act.quien) { act.L += L; continue; }
      if (act) { out.push(act.L / W); if (quien >= 0) cambia++; else otras++; }
      act = quien >= 0 ? { quien, L } : null;
    }
    if (act) { out.push(act.L / W); acaba++; }
    socios.push(vistos.size);
  }
  const n = cambia + acaba + otras || 1;
  return {
    fraccion: total > 0 ? conVecino / total : 0,
    med: out.length ? mediana(out) : NaN,
    p90: out.length ? pct(out, 0.9) : NaN,
    cambia: 100 * cambia / n,
    acaba: 100 * acaba / n,
    vecinos: nVec ? sumaVec / nVec : 0,
    socios: socios.reduce((a, b) => a + b, 0) / Math.max(1, socios.length),
  };
}

// los cabos, con las definiciones de `cabos.py` para que las dos herramientas digan lo mismo
function cabos(trazos, W, fw, fh) {
  const LIBRE = 2.5, CABO = 2.0;
  let n = 0, aire = 0, aCabo = 0;
  for (let k = 0; k < trazos.length; k++) {
    const t = trazos[k];
    for (const cual of [0, 1]) {
      const p = cual === 0 ? t[0] : t[t.length - 1];
      let mej = null;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k || trazos[j].length < 2) continue;
        const c = cercaDe(p, trazos[j]);
        if (c && (!mej || c.d < mej.d)) mej = c;
      }
      n++;
      if (!mej) { aire++; continue; }
      if (mej.d / W > LIBRE) { aire++; continue; }
      if (Math.min(mej.s, mej.S - mej.s) / W < CABO) aCabo++;
    }
  }
  n = n || 1;
  return { mueren: 100 * (n - aire) / n, aCabo: 100 * aCabo / n, aire: 100 * aire / n };
}

const mediana = (v) => pct(v, 0.5);
function pct(v, p) {
  if (!v.length) return NaN;
  const s = v.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

// ── LAS DOS FUENTES ───────────────────────────────────────────────────────────
// el canal de cada referencia, medido sobre el píxel con `python3 rendija.py fotos`: la moda del
// papel estrecho, en anchuras de banda. r2 no está porque en su foto entra el muro y la medida cae
// al suelo de dos píxeles del método; su fila de canal sale vacía a propósito.
const CANAL_FOTO = { r1: 0.288, r3: 0.113, r5: 0.062, r6: 0.188 };

function obraRef(nom) {
  const MANO = JSON.parse(fs.readFileSync(path.join(AQUI, 'mano.json'), 'utf8'));
  const d = MANO[nom];
  // los ejes vienen normalizados por el lado corto, así que el pliego mide 1 por el lado corto
  const S = d.S || Math.min(d.px[0], d.px[1]);
  return { trazos: d.ejes.filter(e => e.length > 1), W: W_REAL[nom],
           fw: d.px[0] / S, fh: d.px[1] / S,
           canal: CANAL_FOTO[nom] != null ? CANAL_FOTO[nom] : NaN };
}

// ── LA TABLA ──────────────────────────────────────────────────────────────────
// qué se enseña, con qué formato, y —lo que de verdad importa— si un número ALTO acerca o aleja.
// Ninguna dimensión tiene «mejor»: lo que hay es DENTRO o FUERA del sobre que dibujan las cuatro.
const DIMS = [
  ['trazos', 'trazos por obra', 0],
  ['largoTrazo', 'largo de un trazo (anchuras)', 1],
  ['largoTotal', 'largo dibujado total (anchuras)', 1],
  ['cobertura', 'cobertura de tinta (%)', 1],
  ['rectitud', 'cuerda / largo  (1 = recta)', 2],
  ['proporcion', 'proporción del pliego', 2],
  ['canal', 'canal entre bandas (anchuras)', 3],
  ['concentracion', 'concentración de rumbo (%)', 0],
  ['quiebro', 'ángulo de quiebro (°)', 0],
  ['tirada', 'tirada entre quiebros (anchuras)', 1],
  ['acompana', 'acompañamiento (% del largo)', 0],
  ['rachaMed', 'racha de acompañamiento (anchuras)', 1],
  ['rachaP90', 'racha, p90 (anchuras)', 1],
  ['cambia', 'roturas por CAMBIO de socio (%)', 0],
  ['acaba', 'roturas por ACABARSE el trazo (%)', 0],
  ['vecinos', 'vecinos a la vez', 2],
  ['socios', 'socios por trazo', 1],
  ['hazMayor', 'el haz mayor (% de los trazos)', 0],
  ['sueltos', 'trazos fuera de todo haz (%)', 0],
  ['cruces', 'cruces de eje por obra', 1],
  ['mueren', 'cabos que mueren contra algo (%)', 0],
  ['aCabo', 'cabos contra otro cabo (%)', 0],
  ['aire', 'cabos al aire (%)', 0],
];

if (process.argv[2] === 'control') {
  // UN CERO SIN CONTROL NO SIGNIFICA NADA, y esta herramienta compara dos fuentes distintas: hay que
  // comprobar que el camino de código no las trata distinto. Se le da a las dos LA MISMA obra —los
  // ejes de r1— una por la puerta de las referencias y otra por la del generador, y tiene que dar
  // exactamente lo mismo. Si no, la tabla mide la puerta y no la obra.
  const A = obraRef('r1');
  const B = { trazos: A.trazos.map(t => t.map(p => p.slice())), W: A.W, fw: A.fw, fh: A.fh,
              canal: A.canal };
  const ma = medidas(A), mb = medidas(B);
  let mal = 0;
  for (const [k] of DIMS) {
    const x = ma[k], y = mb[k];
    const igual = (Number.isNaN(x) && Number.isNaN(y)) || Math.abs(x - y) < 1e-9;
    if (!igual) { console.log('   MAL  ' + k + ': ' + x + ' vs ' + y); mal = 1; }
  }
  console.log('la misma obra por las dos puertas: ' + (mal ? 'NO COINCIDE' : 'idéntica en las ' + DIMS.length + ' dimensiones'));

  // y el control ROTO: la misma obra remuestreada quince veces más fina, que es exactamente la
  // diferencia que hay entre sus ejes y los nuestros. Las medidas integrales tienen que aguantar;
  // las que van por tramos, si no se remuestreara al paso común, se irían. Aquí se ve que aguantan.
  const C = { trazos: A.trazos.map(t => remuestrea(t, A.W * 0.10)), W: A.W, fw: A.fw, fh: A.fh,
              canal: A.canal };
  const mc = medidas(C);
  console.log('\nla misma obra a paso 0,10 en vez de 1,0 (quince veces más fina):');
  let peor = 0, cual = '';
  for (const [k, et, dec] of DIMS) {
    const x = ma[k], y = mc[k];
    if (Number.isNaN(x) || Number.isNaN(y) || Math.abs(x) < 1e-9) continue;
    const dif = Math.abs(y - x) / Math.abs(x);
    if (dif > peor) { peor = dif; cual = et; }
    if (dif > 0.15) console.log('   ' + et.padEnd(34) + x.toFixed(dec) + ' → ' + y.toFixed(dec));
  }
  console.log('   la que más se mueve: ' + cual + ', un ' + (100 * peor).toFixed(0) + ' %');
  console.log('   (sin el paso común, el giro y la tirada se iban quince veces — ver rompe.js)');
  process.exit(mal);
}

// EL MODO `json`, para que una página pueda enseñar esta tabla sin que nadie copie los números a
// mano. Copiar a mano es como se desincronizan las cosas en este repo —ya pasó con el generador
// dentro de los artefactos, ver `empotra.py`— y una auditoría con números caducados es peor que no
// tenerla. Sale lo mismo que la tabla, en crudo.
const JSON_OUT = process.argv[2] === 'json';
const N = parseInt((JSON_OUT ? process.argv[3] : process.argv[2]) || '40', 10);
const { circuito } = require(GEN);

const ref = {};
for (const r of REFS) ref[r] = medidas(obraRef(r));

const nues = [];
for (let i = 0; i < N; i++) {
  const o = circuito((2000 + i * 37) >>> 0, { grainScale: 0 });
  nues.push(medidas({ trazos: o.trazos, W: o.W, fw: o.fw != null ? o.fw : 1,
                      fh: o.fh != null ? o.fh : 1, canal: o.sep / o.W - 1 }));
}

if (JSON_OUT) {
  const filas = [];
  for (const [k, et, dec] of DIMS) {
    const vs0 = REFS.map(r => ref[r][k]);
    const vs = vs0.filter(x => !Number.isNaN(x));
    if (!vs.length) continue;
    const lo = Math.min(...vs), hi = Math.max(...vs);
    const mios = nues.map(m => m[k]).filter(x => !Number.isNaN(x));
    const ancho = Math.max(hi - lo, 1e-9);
    const med = pct(mios, 0.5);
    let estado = 'dentro', exceso = 0;
    if (med < lo || med > hi) {
      exceso = med < lo ? (lo - med) / ancho : (med - hi) / ancho;
      estado = exceso < 0.10 ? 'borde' : (med < lo ? 'bajo' : 'alto');
    } else if ((pct(mios, 0.9) - pct(mios, 0.1)) > 2.2 * ancho) estado = 'disperso';
    filas.push({ clave: k, etiqueta: et, dec,
                 refs: REFS.map((r, i) => ({ obra: r, v: Number.isNaN(vs0[i]) ? null : vs0[i] })),
                 lo, hi, p10: pct(mios, 0.1), med, p90: pct(mios, 0.9),
                 estado, exceso, flojo: (hi - lo) > Math.abs((hi + lo) / 2) });
  }
  console.log(JSON.stringify({ obras: N, refs: REFS, filas }, null, 1));
  process.exit(0);
}

console.log('AUDITORÍA — ' + N + ' obras nuestras contra r1, r2, r5 y r6');
console.log('(r3 lo descartó él; r4 tiene la geometría corrompida por las bandas fundidas)\n');
console.log('  ' + 'dimensión'.padEnd(34) + '    r1     r2     r5     r6  │  las cuatro   │' +
            '   nuestro (p10-med-p90)   veredicto');
console.log('  ' + '-'.repeat(34) + '  -----  -----  -----  -----  │  -----------  │  ' +
            '-'.repeat(23) + '  ' + '-'.repeat(20));

const fuera = [];
let flojas = 0, hechas = 0;
for (const [k, et, dec] of DIMS) {
  const vs0 = REFS.map(r => ref[r][k]);
  const vs = vs0.filter(x => !Number.isNaN(x));
  if (!vs.length) continue;
  const lo = Math.min(...vs), hi = Math.max(...vs);
  // ¿APRIETA ESTA DIMENSIÓN? Cuatro obras que van del 13 al 83 % no definen un sobre, definen un
  // encogimiento de hombros: caer «dentro» de eso no dice nada de nosotros. Se marca cuando el
  // ancho del sobre pasa del propio valor medio, que es donde deja de constreñir.
  const flojo = (hi - lo) > Math.abs((hi + lo) / 2);
  hechas++; if (flojo) flojas++;
  const mios = nues.map(m => m[k]).filter(x => !Number.isNaN(x));
  const p10 = pct(mios, 0.1), med = pct(mios, 0.5), p90 = pct(mios, 0.9);
  // el veredicto: ¿cae nuestra mediana dentro del sobre de las cuatro? Y si no, ¿cuánto se pasa,
  // medido en anchos de ese sobre, que es la única escala que tiene sentido para todas a la vez?
  const ancho = Math.max(hi - lo, 1e-9);
  let vd, orden = 0;
  if (med >= lo && med <= hi) {
    vd = 'dentro';
    // dentro, pero conviene saber si nuestra VARIEDAD es la suya o mucho mayor
    const suyo = ancho, nuestro = p90 - p10;
    if (nuestro > 2.2 * suyo) { vd = 'dentro, más disperso'; orden = 0.5; }
  } else {
    const fa = med < lo ? (lo - med) / ancho : (med - hi) / ancho;
    // EN EL BORDE NO ES FUERA. Cuando nuestra mediana cae justo en el canto del sobre, el exceso es
    // de milésimas y decir «×0,0 del rango» es alarmar por nada — la proporción del pliego salía así,
    // con la mediana en 1,03 y su mínimo en 1,03. Por debajo de una décima del ancho del sobre se
    // llama lo que es: estamos en el canto, mirando hacia afuera.
    if (fa < 0.10) { vd = 'en el borde ' + (med < lo ? 'bajo' : 'alto'); orden = 0.4; }
    else { vd = (med < lo ? 'BAJO ' : 'ALTO ') + '×' + fa.toFixed(1) + ' del rango'; orden = 1 + fa; }
  }
  if (orden > 0) fuera.push([orden, et, vd, lo, hi, med, dec]);
  const f = (x) => Number.isNaN(x) ? '  —  ' : x.toFixed(dec).padStart(5);
  if (flojo) vd += (vd === 'dentro' ? ' (sobre flojo)' : ' · sobre flojo');
  console.log('  ' + et.padEnd(34) + '  ' + vs0.map(f).join('  ') + '  │  ' +
              (lo.toFixed(dec) + '-' + hi.toFixed(dec)).padStart(11) + '  │  ' +
              (p10.toFixed(dec) + ' ' + med.toFixed(dec) + ' ' + p90.toFixed(dec)).padStart(23) +
              '  ' + vd);
}

fuera.sort((a, b) => b[0] - a[0]);
console.log('\nLO QUE ESTÁ FUERA, de peor a mejor:');
if (!fuera.length) console.log('  nada: las veinte dimensiones caen dentro del sobre de las cuatro.');
for (const [orden, et, vd, lo, hi, med, dec] of fuera)
  console.log('  ' + (orden >= 1 ? '· ' : '  ') + et.padEnd(34) + ' ' + vd +
              '   (ellas ' + lo.toFixed(dec) + '-' + hi.toFixed(dec) +
              ', nosotros ' + med.toFixed(dec) + ')');
// los recuentos del pie SE CUENTAN, no se escriben a mano. Estaban a mano y decían «nueve de las
// veinte» cuando ya eran veintitrés dimensiones — la clase de desajuste que hace desconfiar de toda
// la tabla.
console.log('\n' + flojas + ' DE LAS ' + hechas + ' LLEVAN «SOBRE FLOJO», y eso va antes que los veredictos:');
console.log('cuatro obras que van del 13 al 83 % no definen un sobre. Caer dentro de ésas no prueba');
console.log('nada; las que aprietan son las otras ' + (hechas - flojas) + '.');
console.log('\nY lo que esta tabla mide son ' + hechas + ' distribuciones POR SEPARADO: estar dentro de');
console.log('todas no es parecerse. Con veinte de veintiuna dentro las obras seguían leyéndose');
console.log('distintas, y lo que faltaba —el haz— no lo decía ninguna columna hasta que se añadió.');
console.log('Así que el aviso sigue en pie para lo que aún no se le haya ocurrido a nadie medir.');
console.log('La piel del filo va aparte: `python3 piel.py fotos`.');
