// hrrs — EL CIRCUITO, en el orden que el autor corrigió viendo la autopsia paso a paso.
//
//   1. LOS PUNTOS DEL PRIMER TRAZO. Sólo del primero. «Hay un montón de puntos, cuando en
//      realidad el primer paso debería ser dibujar los puntos del primer trazo.»
//   2. UNIR SÓLO ESA LÍNEA. Un trazo de un píxel, y nada más en la hoja.
//   3. LOS DEMÁS TRAZOS, puntos y línea, YA EN RELACIÓN con lo que hay. «Ahí está la parte
//      creativa: cómo se dibujan esos trazos o cómo se relacionan. Ahí deberíamos tener
//      diferentes categorías visuales.» Cuatro: paralela, prolonga, apoyo y suelta.
//   4. EL CAMPO, sobre la estructura completa. «Una vez tengamos la estructura completa con
//      líneas ahí, empiezan a tomar efecto factores como la gravedad, el porcentaje de solape
//      y otras variables. Con eso llegaríamos a una composición que fuese líneas de un píxel,
//      a falta de trabajar los trazos.»
//   5. LA DENSIDAD, Y NO ANTES. «En ese momento, y no antes, se le daría densidad al trazo.»
//
// LO QUE CAMBIA DE VERDAD ES EL PASO 5, y cambia el modelo entero. Antes la anchura de banda se
// sorteaba AL PRINCIPIO y toda la geometría se medía en unidades de esa anchura: el carril, el
// canal, el suelo. Si la densidad va al final, es al revés — la composición se trabaja en
// unidades propias y LA BANDA SE AJUSTA AL HUECO QUE LA COMPOSICIÓN DEJÓ:
//
//     W = hueco mínimo real / (1 + canal)
//
// Y entonces las bandas NO PUEDEN FUNDIRSE, por construcción, sin una sola pasada correctora.
// Eso importa porque la autopsia demostró que las pasadas correctoras son las que se llevaban
// la esencia: la relajación dejaba la obra en el objetivo —ejes 0,59 contra 0,49 y
// acompañamiento 0,53 contra 0,52— y el barrido de solape la bajaba a 0,33 y 0,27 en una sola
// pasada. Aquí no hay barrido de solape, ni abrir el canal, ni quitar púas. El campo es lo
// último que toca la geometría, y la banda se corta a medida.
//
// Y CADA CABO TIENE UN DESTINO DECLARADO, que no es lo mismo que una tendencia: «los cabos
// tienden a terminar en abierto o, si no, terminar contra un cuerpo, ya sea el lateral de un
// trazo o el final o el inicio de un trazo». Tres destinos, y se sortean por cabo:
//
//   ABIERTO   muere al aire, y se aparta de todo para que se lea que muere al aire.
//   LATERAL   llega y muere contra el costado de otro trazo, a un canal: una T.
//   CABO      se encuentra con el cabo de otro y los dos se quedan a un canal, enfrentados.
//
// Y el reparto no es libre: en las cinco referencias buenas el 18 % de los cabos muere al aire,
// o sea que el 82 % muere contra algo. Un cabo que muere contra un cuerpo tiene que LLEGAR —el
// último tramo apunta al cuerpo—, porque si llega de refilón se lee como un roce y no como un
// encuentro.
'use strict';

function Rng(s) { this.s = (s >>> 0) || 1; }
Rng.prototype.u = function () {
  this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
  return this.s / 4294967296;
};
Rng.prototype.range = function (a, b) { return a + (b - a) * this.u(); };
Rng.prototype.int = function (a, b) { return a + Math.floor(this.u() * (b - a + 1)); };
Rng.prototype.bool = function (p) { return this.u() < p; };
Rng.prototype.pick = function (v) { return v[Math.floor(this.u() * v.length)]; };

const RAD = Math.PI / 180;
const hy = (a, b) => Math.hypot(a, b);
const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

function segCorta(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return ((o(a, b, c) > 0) !== (o(a, b, d) > 0)) && ((o(c, d, a) > 0) !== (o(c, d, b) > 0));
}
function distTramos(a, b, c, d) {
  if (segCorta(a, b, c, d)) return 0;
  const dp = (p, q, r) => {
    const ex = r[0] - q[0], ey = r[1] - q[1], l2 = ex * ex + ey * ey;
    let u = l2 > 1e-18 ? ((p[0] - q[0]) * ex + (p[1] - q[1]) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    return hy(p[0] - (q[0] + ex * u), p[1] - (q[1] + ey * u));
  };
  return Math.min(dp(a, c, d), dp(b, c, d), dp(c, a, b), dp(d, a, b));
}
function cercaDe(p, t) {
  let dm = Infinity, r = null;
  for (let i = 0; i < t.length - 1; i++) {
    const ax = t[i][0], ay = t[i][1];
    const ex = t[i + 1][0] - ax, ey = t[i + 1][1] - ay, l2 = ex * ex + ey * ey;
    let u = l2 > 1e-18 ? ((p[0] - ax) * ex + (p[1] - ay) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const qx = ax + ex * u, qy = ay + ey * u, d = hy(p[0] - qx, p[1] - qy);
    if (d < dm) { dm = d; r = { d, qx, qy, dir: Math.atan2(ey, ex) }; }
  }
  return r;
}
function largoDe(p) {
  let L = 0;
  for (let i = 0; i < p.length - 1; i++) L += hy(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
  return L;
}
// EL HUECO ENTRE CADA PAR DE TRAZOS, todos, no sólo el más apretado. Y esto importa: la banda no
// la decide el mínimo, la decide el PERCENTIL 25 — calibrado contra las obras reales, donde el
// p25 de los huecos entre los ejes marcados a mano da la anchura de banda medida con un error del
// 2 % en r1 y del 5 % en r2, dos obras independientes. Usando el mínimo, la banda sale entre un
// 30 y un 45 % más fina de lo que es, y la obra entera adelgaza por un solo punto apretado.
//
// Lo que eso dice del cuadro: EL CANAL NO ES CONSTANTE. La banda lo es y el canal se estrecha
// donde dos trazos se juntan. Nuestro modelo suponía separación = banda + canal en todas partes,
// y no: la separación varía y el canal la absorbe.
function huecosPares(trazos) {
  const hs = [];
  for (let k = 0; k < trazos.length; k++)
    for (let j = k + 1; j < trazos.length; j++) {
      let m = Infinity;
      for (let i = 0; i < trazos[k].length - 1; i++)
        for (let q = 0; q < trazos[j].length - 1; q++) {
          const d = distTramos(trazos[k][i], trazos[k][i + 1], trazos[j][q], trazos[j][q + 1]);
          if (d < m) m = d;
        }
      if (isFinite(m)) hs.push(m);
    }
  hs.sort((a, b) => a - b);
  return hs;
}
const percentil = (hs, q) => hs.length ? hs[Math.min(hs.length - 1, Math.floor(q * hs.length))] : 0;
function huecoMinimo(trazos) { const h = huecosPares(trazos); return h.length ? h[0] : Infinity; }

const CANAL = 0.22;   // el canal, en anchuras de banda: medido en las cinco referencias buenas
// el percentil de los huecos que da la banda. 0,25 está CALIBRADO contra las obras reales: el p25
// de los huecos entre los ejes que el autor marcó a mano reproduce la anchura de banda medida con
// un 2 % de error en r1 y un 5 % en r2. No es un ajuste, es una medida.
const P_BANDA = 0.25;

function circuito(seed, opt) {
  const rng = new Rng(seed);

  const pasos = (opt && opt.pasos) ? [] : null;
  let W = 0;    // la anchura de banda no existe hasta el paso 5. A propósito.
  const foto = (etq, modo, nota) => {
    if (!pasos) return;
    pasos.push({ etq, modo: modo || 'hilo', nota: nota || '', W,
                 trazos: trazos.map(t => t.map(q => [q[0], q[1]])) });
  };

  const prop = rng.range(1.02, 1.55), apais = rng.bool(0.5);
  const fw = (opt && opt.geometria) ? opt.geometria.fw : (apais ? prop : 1);
  const fh = (opt && opt.geometria) ? opt.geometria.fh : (apais ? 1 : prop);

  // EL ALFABETO. Dos rumbos anclados al pliego —en las referencias el 72 % de la longitud corre
  // a ±20° de los ejes— y dos o cuatro oblicuos, con su error de mano.
  const gira = rng.range(-4, 4);
  const rumbos = [gira, gira + 90], pesoRumbo = [0.30, 0.30];
  // el rango de los oblicuos, y es un mando de primer orden sobre el ángulo de quiebro: un giro
  // del eje a un oblicuo de 70° son 70°, y las referencias doblan 35 de mediana
  const OBL = (typeof process !== 'undefined' && process.env.HRRS_OBL)
    ? process.env.HRRS_OBL.split(',').map(Number) : [32, 48];
  const nObl = rng.int(2, 4);
  for (let i = 0; i < nObl; i++) {
    rumbos.push(gira + rng.range(OBL[0], OBL[1]) * (rng.bool(0.5) ? 1 : -1));
    pesoRumbo.push(0.40 / nObl);
  }
  const todos = [], tira = [];
  for (let i = 0; i < rumbos.length; i++) {
    const t = i < 2 ? 2.6 : 1;                 // la cuenca del eje, más ancha
    todos.push(rumbos[i]); tira.push(t);
    todos.push(rumbos[i] + 180); tira.push(t);
  }
  const atractor = (a) => {
    let mej = a, dm = Infinity;
    for (let r = 0; r < todos.length; r++) {
      const d = Math.abs(corto(todos[r] - a)) / tira[r];
      if (d < dm) { dm = d; mej = todos[r]; }
    }
    return mej;
  };

  // LA SEPARACIÓN NOMINAL, en unidades de la COMPOSICIÓN y no de la banda: es lo que separa dos
  // líneas paralelas. La banda saldrá de aquí al final, no al contrario.
  const TIPOS = {
    denso:   { n: [8, 13], sep: [0.055, 0.080], cats: [0.52, 0.14, 0.24, 0.10] },
    abierto: { n: [5, 9],  sep: [0.085, 0.150], cats: [0.30, 0.18, 0.20, 0.32] },
  };
  const tipo = rng.bool(0.62) ? 'denso' : 'abierto';
  // LA TASA DE CABOS AL AIRE VA CON LA DENSIDAD, y eso lo dicen las seis ordenadas por número de
  // trazos: 14 trazos → 0 %, 11 → 18 %, 8 → 19 %, 7 → 29 %, 6 → 17 %, 5 → 40 %. Cuantos más
  // trazos, menos cabos al aire — y tiene sentido: en una obra apretada un cabo tiene contra qué
  // morir, y en una dispersa no hay nada enfrente.
  //
  // Sorteándola libre de 0 a 40 % costaba 0,07 de acompañamiento, porque las obras que sacaban un
  // 40 % dejaban los cabos suel­tos lejos de todo. Atada al tipo, la variación se conserva y el
  // acompañamiento no se paga.
  const P_AIRE = tipo === 'denso' ? rng.range(0.00, 0.16) : rng.range(0.16, 0.40);
  // Y HAY OBRAS QUE SON UN RECORTE de una composición mayor: en r4, r5 y r6 la mitad de los cabos
  // están a menos de una anchura del borde del pliego, contra uno o dos en r1, r2 y r3. En un
  // recorte los trazos SE SALEN del papel; hasta ahora el paseo rebotaba en el margen y eso era
  // imposible ni por accidente.
  const recorte = rng.bool(0.42);
  const T = TIPOS[tipo];
  let sep = rng.range(T.sep[0], T.sep[1]);
  if (opt && opt.geometria) {
    // la escala del campo la pone la obra dada, no nuestro sorteo: si no, el campo la reordena
    // a una densidad que no es la suya y la comparación no dice nada
    const h = huecosPares(opt.geometria.trazos);
    if (h.length) sep = percentil(h, P_BANDA) * (1 + CANAL);
  }
  // la anchura NOMINAL de banda: la que la composición supone. La de verdad se decide al final
  // —la densidad va después— pero los cabos se rematan antes y necesitan una unidad en la que
  // medirse. Es `separación = banda + canal`, despejado.
  const W_NOM = sep / (1 + CANAL);
  const mg = recorte ? -sep * 0.9 : sep * 0.55 + 0.010;
  const n = rng.int(T.n[0], T.n[1]);
  const PASO = 0.105, ERR = 7, TOPE_VUELTA = 100;
  // el largo de un TRAMO recto, en pasos. Las referencias corren mucho antes de doblar.
  const L_TRAMO = (typeof process !== 'undefined' && process.env.HRRS_T)
    ? process.env.HRRS_T.split(',').map(Number) : [1.0, 2.6];
  // LA ESQUINA, por PASO y no por trazo. En las referencias hay 6,9 quiebros por unidad de
  // longitud, o sea ~0,7 por paso: con 0,11 el trazo hacía media esquina y salía recto —cuerda
  // 0,98 contra 0,79—. Un trazo corto con tasa baja de esquina es una raya.
  const P_ESQ = (typeof process !== 'undefined' && process.env.HRRS_E)
    ? Number(process.env.HRRS_E) : 0.45;
  const K_LARGO = (typeof process !== 'undefined' && process.env.HRRS_L)
    ? Number(process.env.HRRS_L) : 0.85;

  const dentro = (p) => [Math.max(mg, Math.min(fw - mg, p[0])),
                         Math.max(mg, Math.min(fh - mg, p[1]))];
  const fuera = (p) => p[0] < mg || p[0] > fw - mg || p[1] < mg || p[1] > fh - mg;

  const eligeRumbo = (desde) => {
    if (desde == null) {
      let u = rng.u(), acc = 0, k = 0;
      for (; k < rumbos.length; k++) { acc += pesoRumbo[k]; if (u <= acc) break; }
      return rumbos[Math.min(k, rumbos.length - 1)] + (rng.bool(0.5) ? 0 : 180)
             + rng.range(-ERR, ERR);
    }
    const cand = todos.map(r => ({ r, d: Math.abs(corto(r - desde)) }))
                      .filter(o => o.d > 12 && o.d < TOPE_VUELTA)
                      .sort((a, b) => a.d - b.d);
    if (!cand.length) return desde;
    const i = rng.bool(0.72) ? 0 : Math.min(cand.length - 1, rng.int(1, 2));
    return cand[i].r + rng.range(-ERR, ERR);
  };

  const trazos = [], masas = [], sols = [], atrs = [], cats = [], metas = [];

  // el paseo: una serie de puntos con la cadencia del alfabeto. Deriva casi siempre y de vez en
  // cuando hace ESQUINA — en las referencias el 73 % de los tramos dobla menos de 15°, así que
  // el trazo corre y la esquina es un acontecimiento.
  const DBG = (typeof process !== 'undefined' && process.env.HRRS_POR)
    ? { fuera: 0, estorba: 0, nace_fuera: 0, nace_pegado: 0 } : null;
  // EL PASEO: TRAMOS RECTOS Y ESQUINAS, y nada más. Antes cada paso derivaba hacia su rumbo y
  // llevaba un temblor de ±9°; acumulado sobre cinco o seis pasos eso no es un trazo con
  // carácter, es una CURVA DE NIVEL — y era lo que hacía que las obras leyeran como un mapa
  // topográfico en vez de como un circuito. Un trazo de Chillida es una sucesión de rectas
  // unidas por esquinas: dentro de un tramo la dirección NO CAMBIA.
  //
  // El error de mano se tira UNA VEZ POR TRAZO y no por paso. Un temblor que se sortea a cada
  // paso es ruido; uno que se sortea una vez es la mano de quien lo dibuja.
  // ¿el tramo u→q cruza o roza al propio trazo ya dibujado?
  const seCruza = (pts, u, q) => {
    for (let i = 0; i < pts.length - 2; i++)
      if (distTramos(u, q, pts[i], pts[i + 1]) < sep * 0.78) return true;
    return false;
  };
  // EL TRAZO SABE A DÓNDE VA. Rematar un trazo YA TERMINADO no funciona: se andaba hasta agotar
  // el recorrido y luego se intentaba torcer el último tramo hacia un vecino, y la geometría no lo
  // permitía el 80 % de las veces —dos topes de grapa y un estorbo—. Es la tercera vez que la
  // misma lección aparece en esta familia: construir, no retocar. Como las paralelas, que hay que
  // derivarlas y no acercarlas; como el campo, que no puede arreglar lo que no compuso.
  //
  // Así que el destino del cabo se decide ANTES de andar y el paseo se inclina hacia él: entre los
  // rumbos que caben, gana el que acerca. Y cuando llega a tiro, para.
  function pasea(p0, dir0, largo, evita, meta) {
    const err = rng.range(-ERR, ERR);
    let dir = dir0 + err;
    const pts = [dentro(p0)];
    let hecho = 0, atasco = 0;
    while (hecho < largo && atasco < 25) {
      // el largo del TRAMO, no del paso: varias anchuras de banda de recta seguida
      const objetivo = Math.min(largo - hecho, PASO * rng.range(L_TRAMO[0], L_TRAMO[1]));
      let dado = 0, puesto = false;
      // se prueba el rumbo que toca y, si no cabe, otros del alfabeto: esquivar es lo que hace
      // el trazo cuando no puede, no lo que quiere hacer
      const cand = [dir];
      for (let i = 0; i < 5; i++) cand.push(eligeRumbo(dir) + err);
      if (meta) {
        // el rumbo que más acerca, dentro del alfabeto: la meta inclina, no manda
        const u0 = pts[pts.length - 1];
        cand.sort((A, B) => {
          const dA = hy(u0[0] + Math.cos(A * RAD) * objetivo - meta.q[0],
                        u0[1] + Math.sin(A * RAD) * objetivo - meta.q[1]);
          const dB = hy(u0[0] + Math.cos(B * RAD) * objetivo - meta.q[0],
                        u0[1] + Math.sin(B * RAD) * objetivo - meta.q[1]);
          return dA - dB;
        });
        if (rng.bool(0.35)) cand.reverse();      // no siempre el mejor: el trazo no es un misil
      }
      for (const d2 of cand) {
        // el tramo entero de una vez: si no cabe entero, se prueba mas corto, y si no, otro rumbo
        for (const f of [1, 0.62, 0.38]) {
          const L = objetivo * f;
          if (L < PASO * 0.30) break;
          const u = pts[pts.length - 1];
          const q = [u[0] + Math.cos(d2 * RAD) * L, u[1] + Math.sin(d2 * RAD) * L];
          if (fuera(q)) continue;
          // UN TRAZO NO SE CRUZA CONSIGO MISMO. Regla del autor, absoluta, y estaba sin
          // comprobar: la función que impide los cruces dice `if (j === k) continue`, o sea que
          // salta el propio trazo. El 55 % de las obras tenía uno, y el autor lo cantó tres veces
          // sobre tres obras distintas. Los dos tramos contiguos comparten vértice y no cuentan;
          // y no basta con no cruzarse: meterse en el propio canal es igual de imposible.
          if (seCruza(pts, u, q)) continue;
          if (evita && evita(u, q)) continue;
          pts.push(q); dir = d2; dado = L; puesto = true; break;
        }
        if (puesto) break;
      }
      if (!puesto) { atasco++; dir = eligeRumbo(dir) + err; continue; }
      atasco = 0; hecho += dado;
      // ya está a tiro de su destino: para aquí y que el remate haga el gesto
      if (meta) {
        const u1 = pts[pts.length - 1];
        if (hy(u1[0] - meta.q[0], u1[1] - meta.q[1]) < meta.D * 2.6) break;
      }
      dir = eligeRumbo(dir) + err;      // y en el vertice, ESQUINA: se cambia de rumbo
    }
    return pts;
  }
  // no cruzar, y no meterse en el canal de nadie: el canal se respeta AL DIBUJAR
  // EL SUELO AL DIBUJAR, con una excepción medida: contra EL PADRE de una paralela se admite más
  // cerca. La paralela es el offset del padre, y en un codo el offset de dentro corta la esquina y
  // se acerca a la otra pata — pedirle el suelo entero ahí tumbaba el 90 % de las paralelas (17
  // construidas de 354 trazos) y las hacía caer a `suelta`, que es justo lo contrario de lo que se
  // buscaba. Y no es una licencia: en r1 la banda real es MÁS ancha que el hueco mínimo entre los
  // ejes marcados, o sea que en la obra el canal se estrecha en esos puntos. La densidad lo
  // absorbe, porque sale del percentil 25 y no del mínimo.
  const estorba = (k, padre) => (a, b) => {
    for (let j = 0; j < trazos.length; j++) {
      if (j === k) continue;
      const suelo = (padre != null && trazos[j] === padre) ? sep * 0.80 : sep * 0.78;
      for (let q = 0; q < trazos[j].length - 1; q++)
        if (distTramos(a, b, trazos[j][q], trazos[j][q + 1]) < suelo) return true;
    }
    return false;
  };

  // ── LA GEOMETRÍA PUEDE VENIR DE FUERA ─────────────────────────────────────────
  // `circuito(seed, {geometria: {trazos, fw, fh}})` se salta la siembra y le aplica a lo que se
  // le dé sólo los pasos de después: el campo y la densidad. Es lo que permite meter un Chillida
  // de verdad —los ejes que el autor marcó a mano— y ver qué le hace nuestro motor. Sin esto, la
  // única comparación posible es la nuestra contra la suya, y ahí los dos errores se suman y no
  // se distinguen.
  const dado = opt && opt.geometria;
  if (dado) {
    for (const t of dado.trazos) if (t.length > 1) {
      trazos.push(t.map(q => dentro([q[0], q[1]])));
      masas.push(trazos.length === 1 ? rng.range(1.5, 2.6) : rng.range(0.3, 1.2));
      cats.push('dado');
    }
  }

  // ── 1 y 2. EL PRIMER TRAZO, SOLO ──────────────────────────────────────────────
  // Es el protagonista: más largo que los demás y sin nadie a quien mirar. La hoja está vacía.
  if (!dado) {
    const a = rng.range(0, 6.2832), r = rng.range(0.06, 0.30);
    const p0 = [0.5 * fw + Math.cos(a) * r * fw, 0.5 * fh + Math.sin(a) * r * fh];
    const pts = pasea(p0, eligeRumbo(null), rng.range(0.85, 1.45) * K_LARGO, null);
    trazos.push(pts); masas.push(rng.range(1.5, 2.6)); cats.push('primero'); metas[0] = null;
  }
  foto('1 · los puntos del primer trazo', 'puntos',
       'Sólo el primero. La hoja está vacía y no hay nada que mirar.');
  foto('2 · unido', 'hilo',
       'Se une, y ya está: un trazo de un píxel, el protagonista, y nada más en la hoja.');

  // ── 3. LOS DEMÁS, YA EN RELACIÓN — las categorías visuales ────────────────────
  // «Ahí está la parte creativa: cómo se dibujan esos trazos o cómo se relacionan.» Cuatro
  // maneras de responderle a lo que ya hay, y el tipo de obra decide con qué frecuencia:
  //
  //   PARALELA   nace en el carril del padre, en su dirección, ya acompañando.
  //   PROLONGA   arranca donde el padre acaba y sigue, con su giro: la línea continúa.
  //   APOYO      llega y MUERE contra el cuerpo — «los finales tienen que tender a juntarse».
  //   SUELTA     lejos, con su propio rumbo. Es la que da aire.
  const CATS = ['paralela', 'prolonga', 'apoyo', 'suelta'];
  const eligeCat = () => {
    let u = rng.u(), acc = 0;
    for (let i = 0; i < CATS.length; i++) { acc += T.cats[i]; if (u <= acc) return CATS[i]; }
    return 'suelta';
  };
  const puntoDe = (t) => {
    const i = rng.int(0, t.length - 2), f = rng.u();
    return { p: [t[i][0] + (t[i + 1][0] - t[i][0]) * f, t[i][1] + (t[i + 1][1] - t[i][1]) * f],
             dir: Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) / RAD };
  };

  // EL NACIMIENTO SE COMPRUEBA. El punto de partida se colocaba respecto al PADRE sin mirar a
  // nadie más, así que tres o cuatro trazos por obra nacían dentro del canal de un TERCERO — y
  // desde ahí no hay salida: todos los primeros pasos estorban, el trazo se atasca y logra cero
  // de recorrido. Dos tercios de los trazos morían así, y de ahí salían la mitad de la tinta
  // (línea 2,8 contra 5,2) y el trazo recto (cuerda 0,98). Se prueban varios nacimientos y, si
  // ninguno está limpio, la categoría cede: mejor una suelta que un trazo que no existe.
  const libre = (p) => {
    for (const t of trazos) { const c = cercaDe(p, t); if (c && c.d < sep * 0.92) return false; }
    return !fuera(p);
  };
  const naceCat = (cat) => {
    const padre = trazos[rng.bool(0.55) ? 0 : rng.int(0, trazos.length - 1)];
    if (cat === 'paralela') {
      const q = puntoDe(padre), lado = rng.bool(0.5) ? 1 : -1;
      return { p: [q.p[0] + Math.cos((q.dir + 90 * lado) * RAD) * sep * 1.06,
                   q.p[1] + Math.sin((q.dir + 90 * lado) * RAD) * sep * 1.06],
               dir: q.dir + (rng.bool(0.5) ? 0 : 180) + rng.range(-ERR, ERR) };
    }
    if (cat === 'prolonga') {
      const cabo = rng.bool(0.5) ? padre[0] : padre[padre.length - 1];
      const otro = cabo === padre[0] ? padre[1] : padre[padre.length - 2];
      const d = Math.atan2(cabo[1] - otro[1], cabo[0] - otro[0]) / RAD;
      return { p: [cabo[0] + Math.cos(d * RAD) * sep * 1.30,
                   cabo[1] + Math.sin(d * RAD) * sep * 1.30],
               dir: eligeRumbo(d) };
    }
    if (cat === 'apoyo') {
      const q = puntoDe(padre), lado = rng.bool(0.5) ? 1 : -1;
      return { p: [q.p[0] + Math.cos((q.dir + 90 * lado) * RAD) * sep * 1.10,
                   q.p[1] + Math.sin((q.dir + 90 * lado) * RAD) * sep * 1.10],
               dir: q.dir + 90 * lado + rng.range(-28, 28) };
    }
    const a = rng.range(0, 6.2832), r = rng.range(0.14, 0.42);
    return { p: [0.5 * fw + Math.cos(a) * r * fw, 0.5 * fh + Math.sin(a) * r * fh],
             dir: eligeRumbo(null) };
  };

  // LA PARALELA ES EL OFFSET DEL PADRE. Naciendo al lado y andando por su cuenta, dos trazos
  // comparten un punto de partida y nada más: se separan al segundo tramo y la obra se lee como
  // un montón de líneas que casualmente empiezan juntas. En las referencias una paralela es la
  // MISMA línea desplazada —r3 y r5 son haces de tres, cuatro y cinco curvas casi idénticas—, y
  // de ahí sale la coherencia visual: los trazos se parecen porque uno está DERIVADO del otro.
  //
  // Esto es lo que el campo intentaba fabricar después y no puede: la coherencia no se consigue
  // atrayendo trazos que nacieron distintos, se consigue derivándolos.
  // EL OFFSET, POR BISECTRIZ. Desplazando cada vértice por la normal de UN tramo, en las esquinas
  // el punto sale mal colocado respecto a la otra pata: el 90 % de las paralelas se rechazaban por
  // el primer tramo. La bisectriz es la construcción correcta —la misma matemática con la que el
  // motor grande dibuja el borde de una banda— y mantiene la distancia en el codo.
  const offsetDe = (padre, lado, desde, cuantos) => {
    const hasta = Math.min(padre.length - 1, desde + cuantos);
    if (hasta - desde < 1) return [];
    const out = [];
    const nor = (i) => {   // la normal del tramo i→i+1, al lado que toca
      const d = Math.atan2(padre[i + 1][1] - padre[i][1], padre[i + 1][0] - padre[i][0]);
      return [Math.cos(d + Math.PI / 2 * lado), Math.sin(d + Math.PI / 2 * lado)];
    };
    const R = sep * 1.06;
    for (let i = desde; i <= hasta; i++) {
      const a = padre[i];
      if (i === desde || i === hasta) {
        // en los cabos, la normal del único tramo que hay
        const n2 = nor(i === desde ? i : i - 1);
        out.push([a[0] + n2[0] * R, a[1] + n2[1] * R]);
        continue;
      }
      const n1 = nor(i - 1), n2 = nor(i);
      let bx = n1[0] + n2[0], by = n1[1] + n2[1];
      const m = hy(bx, by);
      if (m < 1e-9) { out.push([a[0] + n2[0] * R, a[1] + n2[1] * R]); continue; }
      bx /= m; by /= m;
      // el largo de la bisectriz: R / cos(mitad del giro). Se topa, porque en un codo cerrado se
      // dispara y sale una púa — ahí el offset se corta a escuadra, como el motor grande.
      const cosm = Math.max(0.42, bx * n2[0] + by * n2[1]);
      const L = Math.min(R / cosm, R * 2.4);
      out.push([a[0] + bx * L, a[1] + by * L]);
    }
    return out.map(dentro);
  };

  for (let k = 1; k < n && !dado; k++) {
    let cat = eligeCat(), nac = null;

    // LA PARALELA SE CONSTRUYE, NO SE PASEA. Y se prueba VARIAS VECES: el carril de un padre se
    // ocupa en cuanto le sale la primera paralela —a menudo con otra paralela del mismo padre—, así
    // que con un solo intento se rechazaban nueve de cada diez y caían a `suelta`, que es
    // exactamente lo contrario de lo que se busca. Se prueban padres, lados y ventanas.
    if (cat === 'paralela') {
      let hecha = null;
      for (let intento = 0; intento < 12 && !hecha; intento++) {
        const padre = trazos[rng.bool(0.45) ? 0 : rng.int(0, trazos.length - 1)];
        if (padre.length < 3) continue;
        const lado = rng.bool(0.5) ? 1 : -1;
        const cuantos = Math.max(2, Math.round((padre.length - 1) * rng.range(0.45, 1.0)));
        const desde = rng.int(0, Math.max(0, padre.length - 1 - cuantos));
        const pts = offsetDe(padre, lado, desde, cuantos);
        let ok = pts.length >= 2 && largoDe(pts) > PASO * 1.4;
        for (let i = 0; ok && i < pts.length - 1; i++) {
          if (estorba(-1, padre)(pts[i], pts[i + 1])) ok = false;
          // el offset de un trazo que se dobla sobre sí mismo se cruza solo, aunque el padre no
          else if (seCruza(pts.slice(0, i + 1), pts[i], pts[i + 1])) ok = false;
        }
        if (ok) hecha = pts;
      }
      if (hecha) {
        trazos.push(hecha); masas.push(rng.range(0.3, 1.2)); cats.push('paralela');
        metas[trazos.length - 1] = null;
        continue;
      }
      cat = 'suelta';   // no cabía: cede la categoría antes que perder el trazo
    }
    for (let intento = 0; intento < 8 && !nac; intento++) {
      const c = naceCat(cat);
      if (libre(c.p)) nac = c;
    }
    if (!nac) {
      cat = 'suelta';
      for (let intento = 0; intento < 12 && !nac; intento++) {
        const c = naceCat('suelta');
        if (libre(c.p)) nac = c;
      }
    }
    if (!nac) continue;                      // la hoja está llena: no se fuerza
    const largo = rng.range(0.38, 0.95) * K_LARGO;
    // AQUÍ HABÍA UNA META —decirle al trazo contra qué iba a morir para que se acercara mientras
    // andaba— Y SALE FUERA. Medida contra el control: costaba 0,03 de acompañamiento (0,46 → 0,43)
    // y 6° de ángulo de quiebro (45,4 → 51,1), y no compró nada donde tenía que comprar: los
    // remates se quedaron en el 19 % con ella y sin ella. Un trazo que persigue un punto deja de
    // seguir su alfabeto, que es lo que le daba el carácter.
    let meta = null;
    if (false) {
      const j = rng.int(0, trazos.length - 1), o = trazos[j];
      if (o.length >= 2) {
        if (rng.bool(0.66)) {                 // contra un cabo: el 55 % de las seis
          const oi = rng.bool(0.5) ? 0 : o.length - 1;
          meta = { q: o[oi], D: W_NOM };
        } else {                              // contra el costado
          const c = cercaDe(nac.p, o);
          if (c) meta = { q: [c.qx, c.qy], D: W_NOM };
        }
      }
    }
    let pts = pasea(nac.p, nac.dir, largo, estorba(-1), meta);
    if (typeof process !== 'undefined' && process.env.HRRS_PIDE)
      console.error('pide ' + largo.toFixed(2) + ' logra ' + largoDe(pts).toFixed(2) + '  ' + cat);
    if (pts.length < 2 || largoDe(pts) < PASO * 1.4) continue;
    if (cat === 'apoyo') pts.reverse();
    trazos.push(pts); masas.push(rng.range(0.3, 1.2)); cats.push(cat);
    // se guarda CONTRA QUÉ andaba, para que el remate use ese destino y no otro
    metas[trazos.length - 1] = meta;
  }
  // cada punto trae sus dos variables: cuánto se deja llevar y cuánta fuerza de solape tiene.
  // Onda lenta y no ruido: un trazo tiene TRAMOS que tienden a arrimarse, no puntos alternos.
  const fuerza = rng.range(tipo === 'denso' ? 0.34 : 0.16, tipo === 'denso' ? 0.58 : 0.34);
  const solMedia = rng.range(0.04, 0.26);
  for (let k = 0; k < trazos.length; k++) {
    const m = trazos[k].length;
    const perfil = (media, amp) => {
      const f = rng.range(0.8, 2.4), p0 = rng.range(0, 6.2832), out = [];
      for (let i = 0; i < m; i++) {
        const u = m > 1 ? i / (m - 1) : 0;
        out.push(Math.max(0, Math.min(1, media + amp * Math.sin(u * f * 6.2832 + p0)
                                       + rng.range(-0.08, 0.08))));
      }
      return out;
    };
    atrs.push(perfil(fuerza, rng.range(0.10, 0.30)));
    sols.push(perfil(solMedia, rng.range(0.10, 0.45)));
  }
  foto('3 · los demás trazos', 'hilo',
       'Puntos y línea de cada uno, ya en relación con lo que hay: paralela, prolonga, apoyo ' +
       'o suelta. El cruce y el canal se respetan AL DIBUJAR, así que después no hay que ' +
       'cortar nada.');

  // ── 4. EL DESTINO DE CADA CABO ────────────────────────────────────────────────
  // Se sortea por cabo y se resuelve como geometría, así que va antes del campo. El último
  // tramo se REORIENTA para llegar: se apunta al cuerpo y se le da el largo justo para quedarse
  // a un canal. Si al llegar estorbaría a alguien, o si el giro que pide es una grapa, el cabo
  // se queda abierto — el destino es una intención, no una orden.
  // ── 4. EL DESTINO DE CADA CABO, con lo que dicen los 102 cabos de las seis ────
  //
  //   AL AIRE ............ 17 % (pero de 0 en r6 a 40 % en r4: lo decide la obra)
  //   CONTRA UN CABO ..... 55 %  ← el caso PRINCIPAL, y yo lo tenía como la rareza
  //   CONTRA EL COSTADO .. 28 %
  //
  // Y SE PARA A UNA ANCHURA DE BANDA DEL EJE DEL VECINO. Eso es lo bonito de la medida: eje a eje
  // sale 1,02 contra un cabo y 0,98 contra un costado —el mismo número— y los dos huecos de tinta
  // distintos (1,02 W y 0,48 W) salen solos de si el vecino tiene tinta ahí o no. Un número, no
  // dos. Y comparado con el canal de una paralela (0,22 W), un encuentro de cabos deja casi cinco
  // veces más: por eso las obras se leían apretadas cuando se aplicaba 0,22 en todas partes.
  //
  // DOS GESTOS, Y EL MEDIO PROHIBIDO. El ángulo de llegada es bimodal con el centro vacío: 28
  // cabos entre 0° y 15°, 26 entre 75° y 90°, y NI UNO entre 30° y 60°. O el trazo llega de
  // frente y se para, o muere en paralelo al lado de su vecino —que es el final de un
  // acompañamiento—. Un cabo a 45° no existe en las seis, así que aquí tampoco.
  const D_CABO = W_NOM;              // a una anchura de banda del eje del vecino
  const ANG_FRENTE = 78, ANG_PAR = 8;
  const DBGC = (typeof process !== 'undefined' && process.env.HRRS_CABO)
    ? { lejos:0, grapa1:0, grapa2:0, corto:0, estorba:0, cruza:0, ok:0, sinCand:0 } : null;
  const destinos = [];
  for (let k = 0; k < trazos.length; k++) {
    destinos.push([null, null]);
    if (dado) { destinos[k] = ['dado', 'dado']; continue; }
    for (const cual of [0, 1]) {
      const idx = cual === 0 ? 0 : trazos[k].length - 1;
      const vec = cual === 0 ? 1 : trazos[k].length - 2;
      if (trazos[k].length < 3) { destinos[k][cual] = 'al aire'; continue; }
      if (rng.bool(P_AIRE)) { destinos[k][cual] = 'al aire'; continue; }
      // cabo contra cabo dos de cada tres: 55 contra 28 en las seis
      const quiereCabo = (cual === 1 && metas[k]) ? true : rng.bool(0.66);
      const deFrente = rng.bool(0.52);      // 26 de frente contra 28 en paralelo

      const cands = [];
      // SI EL TRAZO ANDABA HACIA ALGO, se remata contra ESO. El paseo se acercaba a un destino y
      // el remate elegía otro por su cuenta —el más próximo que tuviera enfrente— así que el
      // trabajo de acercarse no servía para nada y el 80 % de los cabos se quedaba al aire.
      const mia = cual === 1 ? metas[k] : null;
      if (mia) {
        let mej = null;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k || trazos[j].length < 2) continue;
          const c = cercaDe(mia.q, trazos[j]);
          if (c && (!mej || c.d < mej.d)) mej = { d: c.d, j };
        }
        if (mej) {
          const o = trazos[mej.j];
          const c2 = cercaDe(trazos[k][idx], o);
          // ¿el destino era un cabo de ese trazo o su costado?
          const dc = Math.min(hy(mia.q[0] - o[0][0], mia.q[1] - o[0][1]),
                              hy(mia.q[0] - o[o.length - 1][0], mia.q[1] - o[o.length - 1][1]));
          if (dc < W_NOM * 0.8) {
            const oi = hy(mia.q[0] - o[0][0], mia.q[1] - o[0][1]) < W_NOM * 0.8 ? 0 : o.length - 1;
            const ov = o[oi === 0 ? 1 : o.length - 2];
            cands.push({ q: o[oi], tang: Math.atan2(o[oi][1] - ov[1], o[oi][0] - ov[0]),
                         d: hy(o[oi][0] - trazos[k][idx][0], o[oi][1] - trazos[k][idx][1]),
                         clase: 'contra un cabo' });
          } else if (c2) {
            cands.push({ q: [c2.qx, c2.qy], tang: c2.dir, d: c2.d, clase: 'contra el costado' });
          }
        }
      }
      for (let j = 0; j < trazos.length; j++) {
        if (j === k || trazos[j].length < 2) continue;
        if (quiereCabo) {
          for (const oi of [0, trazos[j].length - 1]) {
            const o = trazos[j][oi];
            const ov = trazos[j][oi === 0 ? 1 : trazos[j].length - 2];
            cands.push({ q: o, tang: Math.atan2(o[1] - ov[1], o[0] - ov[0]),
                         d: hy(o[0] - trazos[k][idx][0], o[1] - trazos[k][idx][1]),
                         clase: 'contra un cabo' });
          }
        } else {
          const c = cercaDe(trazos[k][idx], trazos[j]);
          if (c) cands.push({ q: [c.qx, c.qy], tang: c.dir, d: c.d, clase: 'contra el costado' });
        }
      }
      // EL VECINO TIENE QUE ESTAR DELANTE. Ordenando sólo por distancia, el más próximo suele
      // estar detrás del trazo —a su espalda— y llegar hasta él pide doblar cien grados: los dos
      // topes de grapa se llevaban el 70 % de los remates. Un cabo remata contra lo que tiene
      // enfrente, que es lo que hace una mano.
      {
        const p0 = trazos[k][idx], pv = trazos[k][vec];
        const av = Math.atan2(p0[1] - pv[1], p0[0] - pv[0]);
        for (const cd of cands) {
          const ac = Math.atan2(cd.q[1] - pv[1], cd.q[0] - pv[0]);
          cd.delante = Math.abs(corto((ac - av) / RAD));
        }
        // primero los que están enfrente, y entre ellos el más cercano
        cands.sort((a, b) => (a.delante > 85) - (b.delante > 85) || a.d - b.d);
        while (cands.length && cands[0].delante > 85) cands.shift();
      }
      if (DBGC && !cands.length) DBGC.sinCand++;
      let puesto = null;
      for (const cd of cands.slice(0, 4)) {
        if (cd.d > W_NOM * 7) { if (DBGC) DBGC.lejos++; break; }
        const desde = trazos[k][vec];
        // EL SITIO DONDE MUERE LO FIJA EL VECINO, no mi trazo. Se coloca el cabo a una anchura
        // del eje del vecino por el lado en el que ya estoy, y se mete un CODO para que el último
        // tramo sea exactamente el gesto —de frente o en paralelo— en vez del ángulo que salga.
        // Calculándolo al revés —proyectar desde el penúltimo punto— sólo acierta si ese punto ya
        // estaba en la línea buena, y el 70 % de los cabos se quedaba sin destino.
        let nx = -Math.sin(cd.tang), ny = Math.cos(cd.tang);
        if ((trazos[k][idx][0] - cd.q[0]) * nx + (trazos[k][idx][1] - cd.q[1]) * ny < 0) {
          nx = -nx; ny = -ny;                              // por el lado en el que ya estoy
        }
        const q0 = [cd.q[0] + nx * D_CABO, cd.q[1] + ny * D_CABO];
        const q = recorte ? q0 : dentro(q0);
        // el rumbo del último tramo: perpendicular al vecino si es de frente, paralelo si no
        // y el sentido del gesto se ELIGE, no se sortea: el que menos obliga a doblar
        const salgo = Math.atan2(trazos[k][idx][1] - desde[1], trazos[k][idx][0] - desde[0]);
        let rumbo;
        if (deFrente) {
          rumbo = Math.atan2(-ny, -nx) + rng.range(-1, 1) * (90 - ANG_FRENTE) * RAD;
        } else {
          const a = cd.tang, b = cd.tang + Math.PI;
          rumbo = (Math.abs(corto((a - salgo) / RAD)) <= Math.abs(corto((b - salgo) / RAD)) ? a : b)
                  + rng.range(-1, 1) * ANG_PAR * RAD;
        }
        const Lg = W_NOM * rng.range(1.1, 2.2);            // lo que dura el gesto
        const codo = [q[0] - Math.cos(rumbo) * Lg, q[1] - Math.sin(rumbo) * Lg];
        // ¿se puede llegar al codo desde donde estoy, sin grapa y sin estorbar?
        const a1 = Math.atan2(desde[1] - trazos[k][vec === 1 ? 2 : trazos[k].length - 3][1],
                              desde[0] - trazos[k][vec === 1 ? 2 : trazos[k].length - 3][0]);
        const a2 = Math.atan2(codo[1] - desde[1], codo[0] - desde[0]);
        if (isFinite(a1) && Math.abs(corto((a2 - a1) / RAD)) > 100) { if (DBGC) DBGC.grapa1++; continue; }
        if (Math.abs(corto((rumbo - a2) / RAD)) > 100) { if (DBGC) DBGC.grapa2++; continue; }
        if (hy(codo[0] - desde[0], codo[1] - desde[1]) < W_NOM * 0.4) { if (DBGC) DBGC.corto++; continue; }
        if (estorba(k)(desde, codo) || estorba(k)(codo, q)) { if (DBGC) DBGC.estorba++; continue; }
        const resto = cual === 0 ? trazos[k].slice(2).reverse() : trazos[k].slice(0, -2);
        if (seCruza(resto.concat([desde]), desde, codo)) { if (DBGC) DBGC.cruza++; continue; }
        if (seCruza(resto.concat([desde, codo]), codo, q)) { if (DBGC) DBGC.cruza++; continue; }
        // EL CODO NO ENTRA, y lo dice la medida. Meter un vértice extra para que el último tramo
        // fuera exactamente el gesto rompía 13 obras de 60 —el contorno se cruzaba consigo mismo y
        // la banda salía partida en dos— y tiraba el acompañamiento de 0,52 a 0,38, porque un codo
        // al final de una paralela la deja de ser. Así que el cabo se MUEVE al sitio que le toca y
        // el gesto se queda en la dirección con la que llega, que a veces no es la declarada.
        //
        // Es el cuarto intento de rematar un trazo YA TERMINADO y el cuarto que no sale. La
        // conclusión, después de medir los cuatro: esto no es un paso que se añade al final, es
        // parte de cómo se anda el trazo — y andarlo hacia un destino con un ángulo de llegada
        // declarado es otra pieza de modelo, no un ajuste de ésta.
        trazos[k][idx] = q;
        puesto = cd.clase + (deFrente ? ' de frente' : ' en paralelo');
        if (DBGC) DBGC.ok++;
        break;
      }
      destinos[k][cual] = puesto || 'al aire';
    }
  }
  if (DBGC) console.error('cabos: ok=' + DBGC.ok + ' lejos=' + DBGC.lejos +
    ' grapa(entrada)=' + DBGC.grapa1 + ' grapa(codo)=' + DBGC.grapa2 + ' corto=' + DBGC.corto +
    ' estorba=' + DBGC.estorba + ' cruza=' + DBGC.cruza + ' sinCand=' + DBGC.sinCand);
  // y el que muere al aire se aparta, para que se lea que muere al aire
  for (let k = 0; k < trazos.length; k++) {
    for (const cual of [0, 1]) {
      if (destinos[k][cual] !== 'al aire') continue;
      const idx = cual === 0 ? 0 : trazos[k].length - 1;
      const vec = cual === 0 ? 1 : trazos[k].length - 2;
      if (trazos[k].length < 3) continue;
      let mejor = null;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        const c = cercaDe(trazos[k][idx], trazos[j]);
        if (c && (!mejor || c.d < mejor.d)) mejor = c;
      }
      if (!mejor || mejor.d > W_NOM * 3) continue;
      const desde = trazos[k][vec];
      const d = Math.atan2(trazos[k][idx][1] - desde[1], trazos[k][idx][0] - desde[0]);
      const L = hy(trazos[k][idx][0] - desde[0], trazos[k][idx][1] - desde[1]);
      const q0 = [desde[0] + Math.cos(d) * L * 1.5, desde[1] + Math.sin(d) * L * 1.5];
      const q = recorte ? q0 : dentro(q0);
      if (!estorba(k)(desde, q) && !seCruza(trazos[k].slice(0, -2), desde, q))
        trazos[k][idx] = q;
    }
  }

  foto('4 · los cabos rematados', 'hilo',
       'Cada cabo tiene su destino: abierto, contra el lateral de un trazo, o contra el cabo ' +
       'de otro. El que muere contra un cuerpo LLEGA —el último tramo apunta— y el que muere ' +
       'al aire se aparta para que se lea que muere al aire.');

  // ── 5. EL CAMPO, sobre la estructura completa ─────────────────────────────────
  // Y es LO ÚLTIMO que toca la geometría. La autopsia lo dejó claro: la relajación deja la obra
  // en el objetivo y cualquier pasada correctora posterior se lo lleva. Así que aquí no hay
  // ninguna: ni barrido de solape, ni abrir el canal, ni quitar púas.
  // EL VETO, y es la primitiva que sustituye a los martillos. La autopsia demostró que corregir
  // después de relajar se lleva la esencia; pero el campo tampoco puede hacer lo que quiera,
  // porque un cruce no lo rescata ninguna anchura de banda —el hueco se va a cero y con él la
  // densidad—. La salida no es corregir el resultado: es NO DEJAR LLEGAR AHÍ. Si el
  // desplazamiento que propone el campo cruzaría a alguien o cerraría el hueco por debajo del
  // suelo, ese punto no se mueve y se queda donde estaba, que era un sitio válido.
  //
  // Vetar conserva; corregir destroza. Es la misma diferencia que hay entre no dar un paso y
  // darlo y luego arrastrar el pie de vuelta.
  const SUELO = 0.62;              // el hueco mínimo que el campo puede dejar, en unidades de sep
  const valeMover = (k, i, q) => {
    const t = trazos[k];
    for (const par of [[i - 1, i], [i, i + 1]]) {
      const a = par[0], b = par[1];
      if (a < 0 || b > t.length - 1) continue;
      const p1 = a === i ? q : t[a], p2 = b === i ? q : t[b];
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        for (let z = 0; z < trazos[j].length - 1; z++)
          if (distTramos(p1, p2, trazos[j][z], trazos[j][z + 1]) < sep * SUELO) return false;
      }
    }
    return true;
  };

  const carril = sep * 1.04;
  const CERCA = carril * 1.55, ALCANCE = Math.max(fw, fh) * 0.55;
  const G = rng.range(tipo === 'denso' ? 0.55 : 0.12, tipo === 'denso' ? 1.25 : 0.50);
  // EL CAMPO VA APAGADO, y lo apaga una prueba, no un gusto. Metiendo la geometría
  // real de r1, r2, r3 y r6 —los ejes que el autor marcó a mano— y aplicándoles sólo el campo:
  // borra las celdas de blanco atrapado de las CUATRO, cuatro de cuatro, y contrae la obra (r6
  // pierde el 44 % de su tinta, r1 el 35 %). Es un paso que RESTA.
  //
  // Y con él apagado, la obra mejora justo donde peor estaba: el ángulo de quiebro pasa de 23,6°
  // a 36,4° contra los 35 de las referencias, los quiebros por lado de 10,8 a 6,3 contra 6,9, y
  // la cuerda de 0,79 a 0,78 clavada. Cuesta 0,10 de acompañamiento (0,43 → 0,33), y ese cambio
  // es el que hay que hacer: acompañar contrayendo la obra no es acompañar.
  //
  // Se deja el mando porque el campo NO es basura —sabe arrimar dos trazos— pero tal como está
  // paga ese arrimo con la estructura. Lo que tiene que aprender es a no contraer, y hasta
  // entonces va a cero. Con VUELTAS=0 los vetos son código muerto, y sus controles se pasan con
  // el campo encendido, que es donde significan algo.
  const VUELTAS = (typeof process !== 'undefined' && process.env.HRRS_V)
    ? Number(process.env.HRRS_V) : 0;
  const encauza = (pts, k) => {
    const m = pts.length;
    if (m < 2) return pts;
    const L = [], A = [];
    let prev = null;
    for (let i = 0; i < m - 1; i++) {
      const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
      L.push(hy(dx, dy));
      const a = Math.atan2(dy, dx) / RAD;
      // el rumbo del vecino, que es lo que paraleliza dicho en el alfabeto
      let par = null, fpar = 0;
      const mid = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      let mejor = null;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        const c = cercaDe(mid, trazos[j]);
        if (c && (!mejor || c.d < mejor.d)) mejor = c;
      }
      if (mejor && mejor.d < carril * 4.2) {
        par = mejor.dir / RAD;
        fpar = atrs[k][Math.min(i, atrs[k].length - 1)] || 0;
      }
      let g = corto(atractor(a) - a) * 0.30;
      if (par != null) {
        const c = corto(par - a);
        g += (Math.abs(c) > 90 ? corto(par - a + 180) : c) * 0.55 * fpar;
      }
      if (prev != null) g += corto(prev - a) * 0.42;
      g = Math.max(-24, Math.min(24, g));
      A.push(a + g); prev = a + g;
    }
    const c = Math.floor((m - 1) / 2);
    const out = new Array(m);
    out[c] = [pts[c][0], pts[c][1]];
    for (let i = c; i < m - 1; i++)
      out[i + 1] = [out[i][0] + Math.cos(A[i] * RAD) * L[i],
                    out[i][1] + Math.sin(A[i] * RAD) * L[i]];
    for (let i = c; i > 0; i--)
      out[i - 1] = [out[i][0] - Math.cos(A[i - 1] * RAD) * L[i - 1],
                    out[i][1] - Math.sin(A[i - 1] * RAD) * L[i - 1]];
    return out.map(dentro);
  };

  for (let v = 0; v < VUELTAS; v++) {
    const frio = 1 - 0.55 * (v / (VUELTAS - 1));

    // GRAVEDAD, del trazo: una masa mueve un CUERPO, así que el trazo se traslada entero y no
    // cambia ni un ángulo suyo. Se divide por la masa propia: el pesado aguanta, el ligero cede.
    const tras = [];
    for (let k = 0; k < trazos.length; k++) {
      let gx = 0, gy = 0;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        let mejor = null;
        for (const p of trazos[k]) {
          const c = cercaDe(p, trazos[j]);
          if (c && (!mejor || c.d < mejor.c.d)) mejor = { c, p };
        }
        if (!mejor) continue;
        const d = mejor.c.d;
        if (d <= CERCA || d >= ALCANCE) continue;
        const w = G * masas[j] * (CERCA / d) * (CERCA / d);
        gx += (mejor.c.qx - mejor.p[0]) / d * w; gy += (mejor.c.qy - mejor.p[1]) / d * w;
      }
      const m = hy(gx, gy), tope = sep * 0.55 * frio / masas[k];
      if (m > tope) { gx = gx / m * tope; gy = gy / m * tope; }
      tras.push([gx, gy]);
    }
    for (let k = 0; k < trazos.length; k++) {
      if (hy(tras[k][0], tras[k][1]) <= 1e-12) continue;
      const mov = trazos[k].map(p => dentro([p[0] + tras[k][0], p[1] + tras[k][1]]));
      // el cuerpo se mueve entero o no se mueve: se comprueba trazo contra trazo
      let vale = true;
      for (let i = 0; i < mov.length - 1 && vale; i++)
        for (let j = 0; j < trazos.length && vale; j++) {
          if (j === k) continue;
          for (let z = 0; z < trazos[j].length - 1; z++)
            if (distTramos(mov[i], mov[i + 1], trazos[j][z], trazos[j][z + 1]) < sep * SUELO) {
              vale = false; break;
            }
        }
      if (vale) trazos[k] = mov;
    }

    // ATRACCIÓN, del punto, al carril del vecino; y su FUERZA DE SOLAPE decide si se arrima al
    // canal o guarda aire. Nunca a través: arrimarse tiene un suelo, y ese suelo es el carril.
    const nuevo = trazos.map(t => t.map(p => [p[0], p[1]]));
    for (let k = 0; k < trazos.length; k++) {
      for (let i = 0; i < trazos[k].length; i++) {
        const p = trazos[k][i];
        let dx = 0, dy = 0, mejor = null;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const c = cercaDe(p, trazos[j]);
          if (c && (!mejor || c.d < mejor.d)) mejor = c;
        }
        if (mejor && mejor.d < carril * 4.0) {
          const meta = carril * (1 + (1 - Math.min(1, sols[k][i] / 0.82)) * 0.45);
          const nx = mejor.d > 1e-9 ? (p[0] - mejor.qx) / mejor.d
                                    : Math.cos(mejor.dir + Math.PI / 2);
          const ny = mejor.d > 1e-9 ? (p[1] - mejor.qy) / mejor.d
                                    : Math.sin(mejor.dir + Math.PI / 2);
          dx += nx * (meta - mejor.d) * atrs[k][i];
          dy += ny * (meta - mejor.d) * atrs[k][i];
        }
        // el muelle: un trazo es una serie de puntos UNIDA, y la unión es una restricción
        if (i > 0 && i < trazos[k].length - 1) {
          const a2 = trazos[k][i - 1], b2 = trazos[k][i + 1];
          dx += ((a2[0] + b2[0]) / 2 - p[0]) * 0.42;
          dy += ((a2[1] + b2[1]) / 2 - p[1]) * 0.42;
        }
        const m = hy(dx, dy), tope = sep * 0.45 * frio;
        if (m > tope) { dx = dx / m * tope; dy = dy / m * tope; }
        const q = dentro([p[0] + dx, p[1] + dy]);
        nuevo[k][i] = valeMover(k, i, q) ? q : p;
      }
    }
    for (let k = 0; k < trazos.length; k++) {
      trazos[k] = nuevo[k];
      const enc = encauza(nuevo[k], k);
      let vale = true;
      for (let i = 0; i < enc.length - 1 && vale; i++)
        for (let j = 0; j < trazos.length && vale; j++) {
          if (j === k) continue;
          for (let z = 0; z < trazos[j].length - 1; z++)
            if (distTramos(enc[i], enc[i + 1], trazos[j][z], trazos[j][z + 1]) < sep * SUELO) {
              vale = false; break;
            }
        }
      if (vale) trazos[k] = enc;
    }
  }
  foto(VUELTAS ? '5 · el campo' : '5 · el campo (APAGADO)', 'hilo',
       VUELTAS
         ? 'Gravedad del trazo, atracción del punto, fuerza de solape y el encauzado. Es lo ' +
           'último que toca la geometría.'
         : 'Va a cero, y lo apaga una prueba: metiéndole la geometría real de r1, r2, r3 y r6 ' +
           'borra las celdas de blanco atrapado de las CUATRO y contrae la obra (r6 pierde el ' +
           '44 % de su tinta). Esta columna es igual que la anterior a propósito. La coherencia ' +
           'no la da un campo: la da que un trazo sea el offset de otro.');

  // Y LA ÚLTIMA COMPROBACIÓN DE QUE NINGÚN TRAZO SE CRUZA CONSIGO MISMO. La regla se respeta al
  // dibujar —ahí bajó del 55 % al 2 %— pero el offset de una paralela y el remate de un cabo
  // pueden crearlo después. Si queda uno, se recorta por ahí: es local y es la última salida.
  for (let k = 0; k < trazos.length; k++) {
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      const t = trazos[k];
      let corte = -1;
      for (let a = 0; a < t.length - 1 && corte < 0; a++)
        for (let b = a + 2; b < t.length - 1; b++)
          if (segCorta(t[a], t[a + 1], t[b], t[b + 1])) { corte = b; break; }
      if (corte < 0) break;
      trazos[k] = t.slice(0, corte + 1);
      if (trazos[k].length < 2) break;
    }
  }
  for (let k = trazos.length - 1; k >= 0; k--)
    if (trazos[k].length < 2 || largoDe(trazos[k]) < PASO * 0.9) {
      trazos.splice(k, 1); masas.splice(k, 1); cats.splice(k, 1);
      if (atrs.length > k) atrs.splice(k, 1);
      if (sols.length > k) sols.splice(k, 1);
    }

  // ── 6. LA DENSIDAD, Y NO ANTES ────────────────────────────────────────────────
  // «En ese momento, y no antes, se le daría densidad al trazo.» La banda se corta a la medida
  // del hueco que la composición dejó: separación = banda + canal, así que
  //
  //     W = hueco mínimo / (1 + canal)
  //
  // y las bandas NO PUEDEN FUNDIRSE, por construcción y sin una sola pasada correctora. Si la
  // composición quedó apretada en un sitio, la obra entera se dibuja más fina — que es lo que
  // debe pasar: la banda obedece a la composición y no al revés.
  if (DBG) console.error('rechazos: fuera=' + DBG.fuera + ' estorba=' + DBG.estorba +
                         ' | nacen fuera=' + DBG.nace_fuera + ' nacen pegados=' + DBG.nace_pegado);
  // LA BANDA, del percentil 25 de los huecos y no del mínimo. Y como el p25 deja por debajo a
  // una cuarta parte de los pares, esos pocos se separan a mano —un puñado de vértices, no la
  // obra— para que la regla de no fundir siga cumpliéndose. Es una reparación LOCAL: la autopsia
  // condenó los martillos globales, no arreglar tres sitios que se sabe cuáles son.
  const hs0 = huecosPares(trazos);
  // LA BANDA NO PUEDE SER MÁS ANCHA QUE LA SEPARACIÓN CON LA QUE SE COMPUSO. El tope estaba en
  // 0,098 —casi una décima del pliego— y cuando la composición queda holgada el percentil 25 llega
  // hasta ahí: una obra de trece trazos salía como un RECTÁNGULO NEGRO, la hoja entera de tinta.
  // La separación nominal es la escala de la composición, así que la banda se mide contra ella y
  // no contra un número absoluto que no sabe de qué obra se está hablando.
  // Y un techo absoluto, porque en una obra dispersa el percentil 25 cae en un hueco grande y la
  // banda sale una losa. Las referencias van de 0,032 a 0,042 sobre el lado corto; 0,062 deja
  // sitio a la variedad sin que ninguna obra se vuelva un bloque.
  W = Math.min(percentil(hs0, P_BANDA), sep / (1 + CANAL) * 1.10, 0.062);
  {
    const SUELO_W = W * 1.06;      // la banda más un pelo de canal: por debajo, se funde
    for (let v = 0; v < 12; v++) {
      let peor = null;
      for (let k = 0; k < trazos.length; k++)
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          for (let i = 0; i < trazos[k].length - 1; i++)
            for (let q = 0; q < trazos[j].length - 1; q++) {
              const d = distTramos(trazos[k][i], trazos[k][i + 1], trazos[j][q], trazos[j][q + 1]);
              if (d < SUELO_W && (!peor || d < peor.d)) peor = { d, k, i, j };
            }
        }
      if (!peor) break;
      // se aparta EL PAR MÁS APRETADO y sólo él, y se vuelve a mirar: así se toca lo mínimo
      const t = trazos[peor.k], i = peor.i;
      const mx = (t[i][0] + t[i + 1][0]) / 2, my = (t[i][1] + t[i + 1][1]) / 2;
      const c = cercaDe([mx, my], trazos[peor.j]);
      if (!c) break;
      const ux = c.d > 1e-9 ? (mx - c.qx) / c.d : Math.cos(c.dir + Math.PI / 2);
      const uy = c.d > 1e-9 ? (my - c.qy) / c.d : Math.sin(c.dir + Math.PI / 2);
      const emp = (SUELO_W - peor.d) * 0.62;
      for (const idx of [i, i + 1])
        t[idx] = dentro([t[idx][0] + ux * emp, t[idx][1] + uy * emp]);
    }
    W = Math.min(W, huecoMinimo(trazos) * 0.98);   // y la regla manda: nunca funde
  }
  const hueco = huecoMinimo(trazos);

  // ── EL CUERPO: EL RELLENO HASTA EL MARGEN, Y EL FILO ──────────────────────────
  //
  // Dos cosas a la vez, y las dos medidas sobre los originales.
  //
  // EL RELLENO. «El centro de trazos seguiría siendo el mismo, pero rellenaríamos la diferencia
  // hasta dejar el margen entre los trazos.» La banda NO es de anchura constante: W es su mínimo
  // y donde hay sitio la tinta crece hacia el vecino hasta dejar el canal, POR CADA LADO POR
  // SEPARADO, así que el centro puede no quedar en el centro visual. Lo constante no es la banda,
  // es el hueco que queda entre dos.
  //
  // EL FILO. «Los trazos parecen demasiado vectoriales; los de Chillida tienen cierto contorno,
  // cierto carácter orgánico.» Cortando las bandas reales perpendiculares a su eje y midiendo
  // hasta dónde llega la tinta (`filo.py`):
  //
  //     sd de la semianchura ........ 0,215 anchuras de banda
  //     parte rápida (tras quitarle una media móvil de una anchura) ... 0,061
  //     escala de la variación ...... 0,3 anchuras
  //     correlación entre los dos filos ... +0,32
  //
  // Yo tenía una sola onda de amplitud 0,05 y varias anchuras de largo: cuatro veces poco y diez
  // veces lento. Y sobre todo, el contorno se construía sobre los VÉRTICES DEL EJE —cuatro o cinco
  // por trazo— así que no podía variar cada 0,3 anchuras ni queriendo. Ahora el eje se remuestrea
  // fino y el filo lleva tres octavas: una lenta que engorda y adelgaza la banda, una media, y una
  // rápida que es el temblor del corte. Y un tercio del temblor es COMÚN a los dos filos —la banda
  // cambia de grosor— y dos tercios propios de cada uno —el filo tiembla y el eje no se mueve—,
  // que es lo que dice esa correlación de +0,32.
  const MARGEN = W * CANAL;
  const CRECE = 1.7;
  const PASO_FILO = W * 0.16;                 // para que el filo pueda variar a 0,3 anchuras
  // la desviación del filo. En las obras que el autor eligió —r1, r4, r5— vale 0,177 y 0,117, así
  // que el rango es ése y no el de las seis: r2 y r6 desvían el doble porque son de taco.
  const SD_FILO = rng.range(0.12, 0.20);
  const COMUN = 0.32;                         // cuánto comparten los dos filos

  // ruido correlacionado y determinista: suma de octavas, con su fase
  const octavas = () => {
    const o = [];
    // La octava rápida se queda corta A PROPÓSITO. Medida sale en 0,061 anchuras, pero buena
    // parte de eso es ruido de binarización del escaneo y no del cuadro: puesta entera, el filo
    // sale en diente de sierra, que es otra manera de ser digital. Lo que se ve en las seis es una
    // ondulación confiada con algún mordisco, no una serración constante.
    for (const [lam, amp] of [[4.0, 0.66], [1.5, 0.27], [0.55, 0.07]])
      o.push({ lam, amp, ph: rng.range(0, 6.2832) });
    return o;
  };
  const evalua = (o, u) => {
    let v = 0;
    for (const c of o) v += c.amp * Math.sin(u / c.lam * 6.2832 + c.ph);
    return v;
  };

  const semis = [], ejes = [];
  for (let k = 0; k < trazos.length; k++) {
    // 1. el eje, remuestreado fino
    const t = trazos[k], fino = [t[0]];
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      const n2 = Math.max(1, Math.round(L / PASO_FILO));
      for (let z = 1; z <= n2; z++)
        fino.push([t[i][0] + (t[i + 1][0] - t[i][0]) * z / n2,
                   t[i][1] + (t[i + 1][1] - t[i][1]) * z / n2]);
    }
    ejes.push(fino);
    const m = fino.length, sm = [];
    // 2. el sitio que hay a cada lado
    for (let i = 0; i < m; i++) {
      const a = fino[Math.max(0, i - 1)], b = fino[Math.min(m - 1, i + 1)];
      const d = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const nx = -Math.sin(d), ny = Math.cos(d);
      const lado = [W / 2, W / 2];
      for (const s2 of [0, 1]) {
        const sg = s2 === 0 ? 1 : -1;
        let libre = Infinity;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const o = trazos[j];
          for (let z = 0; z < o.length - 1; z++) {
            const mx = (o[z][0] + o[z + 1][0]) / 2, my = (o[z][1] + o[z + 1][1]) / 2;
            if ((mx - fino[i][0]) * nx * sg + (my - fino[i][1]) * ny * sg <= 0) continue;
            let d1 = Math.min(hy(fino[i][0] - o[z][0], fino[i][1] - o[z][1]),
                              hy(fino[i][0] - o[z + 1][0], fino[i][1] - o[z + 1][1]));
            for (const par of [[i - 1, i], [i, i + 1]]) {
              if (par[0] < 0 || par[1] > m - 1) continue;
              d1 = Math.min(d1, distTramos(fino[par[0]], fino[par[1]], o[z], o[z + 1]));
            }
            libre = Math.min(libre, d1);
          }
        }
        const ALCANCE = W * 3.2;
        const hasta = (isFinite(libre) && libre < ALCANCE) ? (libre - MARGEN) / 2 : W / 2;
        lado[s2] = Math.max(W * 0.42, Math.min(W / 2 * CRECE, hasta));
      }
      sm.push(lado);
    }
    semis.push(sm);
  }

  // ── EL CONTORNO: DOS O TRES CALIDADES DE TRAZO ────────────────────────────────
  // «Distingo dos o tres contornos de trazos, podrían alternarse o relacionarlos con el grosor.»
  // Tres, la obra elige dos y los alterna, y el grosor inclina cuál toca. Lo que cambia entre
  // ellos es CUÁNTO respira el filo y cómo: el temblor medido es de todos, la gubia es del corte.
  const CONTORNOS = ['limpio', 'vibrado', 'gubia'];
  const c0 = rng.int(0, 2);
  const dosDe = [CONTORNOS[c0], CONTORNOS[(c0 + 1 + rng.int(0, 1)) % 3]];
  // CUÁNTA HUELLA DE TACO tiene esta obra. Medido en las seis: r6 casi plano (sd 3 % del rango) y
  // r1, r2 y r3 muy mordidos (17–28 %). No es una constante: es la técnica de cada obra.
  const taco = rng.bool(0.30) ? rng.range(0, 0.04) : rng.range(0.12, 0.34);
  const contornos = [];
  for (let k = 0; k < trazos.length; k++) {
    const m = semis[k].length;
    const gordo = semis[k].reduce((a, b) => a + b[0] + b[1], 0) / m / W;
    const cual = rng.bool(Math.max(0.1, Math.min(0.9, 0.5 + 0.30 * (gordo - 1)))) ? 1 : 0;
    const c = dosDe[cual];
    contornos.push(c);
    const A = c === 'limpio' ? 0.62 : c === 'vibrado' ? 1.25 : 0.85;
    const oc = [octavas(), octavas()], oComun = octavas();
    // el largo del trazo en anchuras, que es la unidad del ruido
    const Ltot = largoDe(ejes[k]) / W;
    const tope = semis[k].map(l => [l[0], l[1]]);
    for (let i = 0; i < m; i++) {
      const u = Ltot * (m > 1 ? i / (m - 1) : 0.5);
      const com = evalua(oComun, u);
      for (const s2 of [0, 1]) {
        let v = SD_FILO * A * (COMUN * com + (1 - COMUN) * evalua(oc[s2], u));
        if (c === 'gubia') v += (0.72 + 0.46 * Math.sin(Math.PI * i / Math.max(1, m - 1)) - 1) * 0.5;
        // el filo respira sobre la anchura, y nunca hacia dentro del canal
        semis[k][i][s2] = Math.max(W * 0.30, Math.min(tope[i][s2], semis[k][i][s2] + v * W));
      }
    }
  }
  // Y SE ALISA EL FILO. Sin esto el contorno son cientos de segmentos rectos entre muestras y el
  // borde queda picado; una pasada de media móvil corta lo que queda de serración sin tocar la
  // ondulación, que es la que lleva el carácter.
  for (const sm of semis) {
    for (let v = 0; v < 2; v++) {
      const cp = sm.map(l => [l[0], l[1]]);
      for (let i = 1; i < sm.length - 1; i++)
        for (const s2 of [0, 1])
          sm[i][s2] = cp[i][s2] * 0.5 + cp[i - 1][s2] * 0.25 + cp[i + 1][s2] * 0.25;
    }
  }
  trazos.length = 0;
  for (const e of ejes) trazos.push(e);   // el eje fino ES el trazo: el contorno cuelga de él

  foto('6 · con densidad', 'banda',
       'La banda, cortada a la medida del hueco que dejó la composición. Por eso no puede ' +
       'fundirse: no hace falta abrir ningún canal, ya cabe.');

  return { trazos, masas, cats, destinos, semis, contornos, taco, fw, fh, W, sep, hueco, rumbos, tipo, fuerza, G, solMedia,
           polo: [0.5 * fw, 0.5 * fh], seed, pasos };
}

// EL CONTORNO DE UNA BANDA, cerrado y listo para rellenar. Vive aquí y no en cada dibujante
// porque la banda ya no es una línea gruesa: tiene media anchura propia por punto y por lado, y
// tres dibujantes con tres copias de esa geometría serían tres bandas distintas.
//
// Se recorre el borde de un lado hacia delante y el del otro hacia atrás, y se cierra. Los cabos
// van a escuadra —el remate de las referencias— así que no hay casquete: el contorno se cierra
// con el segmento que une los dos bordes.
function contornoDe(o, k) {
  const t = o.trazos[k], sm = o.semis[k];
  if (!t || t.length < 2) return [];
  const nor = (i) => {
    const a = t[Math.max(0, i - 1)], b = t[Math.min(t.length - 1, i + 1)];
    const d = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [-Math.sin(d), Math.cos(d)];
  };
  const izq = [], der = [];
  for (let i = 0; i < t.length; i++) {
    const n = nor(i), s = sm[Math.min(i, sm.length - 1)];
    izq.push([t[i][0] + n[0] * s[0], t[i][1] + n[1] * s[0]]);
    der.push([t[i][0] - n[0] * s[1], t[i][1] - n[1] * s[1]]);
  }
  return izq.concat(der.reverse());
}

// ── PINTAR ────────────────────────────────────────────────────────────────────
// LA TÉCNICA ES LA DE r1, r4 y r5: litografía, serigrafía u offset. Tinta PLANA y filo limpio.
// Mirando las seis a resolución nativa hay tres técnicas distintas y el autor eligió ésta:
//
//   r1, r4, r5 .. negro plano, filo limpio ......................... ESTA
//   r3 ......... filo blando y papel muy granulado (aguatinta) ..... descartada: además las
//                bandas se juntan, que va contra la regla
//   r2, r6 ..... el negro lleno de motas y el filo dentado (taco) ... descartadas
//
// Así que aquí no hay textura de tinta, ni huella de gubia, ni línea de lápiz: probé las tres y
// las tres eran la respuesta a otra pregunta. **Todo el carácter está en el CONTORNO** — y eso es
// lo que hace que r1 no parezca vectorial teniendo la tinta plana: el filo es limpio pero no es
// recto, porque lo cortó una mano.
//
// El único añadido es un grano de papel muy leve, que en r1 se ve y en r4 casi no.
function pinta(cx, Wpx, Hpx, o, opt) {
  opt = opt || {};
  const esc = Math.min(Wpx / o.fw, Hpx / o.fh);
  const ox = (Wpx - o.fw * esc) / 2, oy = (Hpx - o.fh * esc) / 2;
  const rng = new Rng((o.seed ^ 0x9e3779b9) >>> 0);
  cx.save();
  cx.fillStyle = opt.papel || '#ffffff';
  cx.fillRect(0, 0, Wpx, Hpx);
  cx.translate(ox, oy); cx.scale(esc, esc);
  cx.fillStyle = opt.tinta || '#151412';
  for (let k = 0; k < o.trazos.length; k++) {
    const ct = contornoDe(o, k);
    if (ct.length < 3) continue;
    cx.beginPath(); cx.moveTo(ct[0][0], ct[0][1]);
    for (let i = 1; i < ct.length; i++) cx.lineTo(ct[i][0], ct[i][1]);
    cx.closePath(); cx.fill();
  }
  cx.restore();
  // el grano del papel, apenas: en r1 se ve y en r4 casi no
  if ((opt.grano == null ? 1 : opt.grano) > 0 && typeof document !== 'undefined') {
    cx.save();
    const n = Math.round(Wpx * Hpx / 900);
    for (let i = 0; i < n; i++) {
      cx.globalAlpha = rng.range(0.012, 0.045);
      cx.fillStyle = rng.bool(0.5) ? '#000' : '#fff';
      const x = rng.range(0, Wpx), y = rng.range(0, Hpx);
      cx.fillRect(x, y, rng.range(0.7, 1.8), rng.range(0.7, 1.8));
    }
    cx.restore();
  }
}

if (typeof module !== 'undefined') module.exports = { circuito, Rng, contornoDe, pinta };
