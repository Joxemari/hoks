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

// ── LOS MANDOS QUE SE VOTAN ───────────────────────────────────────────────────
// Los de la composición, que es lo que NO se puede medir contra las referencias: la piel ya está
// clavada por número (`piel.py`), así que votarla sería gastar el ojo del autor en algo que hace
// un script. Estos no: no hay ninguna medida que diga si el canal debe ser 0,22 o 0,34.
//
// Vivían en `process.env`, que en una página no existe, así que el artefacto de pares no podía
// tocar ni uno. Ahora hay tres sitios y en este orden: `opt.mandos` —lo que pasa la página—,
// el entorno —los barridos de consola, que siguen valiendo— y el valor de la casa.
// LOS VALORES SON LOS QUE ÉL ELIGIÓ EN LOS DOCE PARES, uno por uno, y de once de los doce salió
// una decisión. Se anota lo que dijo al lado, porque el número solo no se acuerda de por qué.
const MANDOS = {
  canal:    null,        // el canal entre dos bandas, en anchuras de banda. NULL = se sortea
                         // estrecho: «quiero que tenga ambas versiones, ancho y estrecho, pero el
                         // blanco entre bandas paralelas debería ser estrecho».
  obl:      [58, 76],    // el rango de los rumbos oblicuos, en grados. Eligió los abiertos.
  tramo:    [0.58, 1.55],// lo que corre un tramo recto antes de doblar. Eligió la corta, que era
                         // [1,0 · 2,6], y esto es MÁS CORTO QUE LO QUE ELIGIÓ: con su valor la
                         // tirada mediana nos salía en 2,4 anchuras y en las seis va de 1,2 a 2,1,
                         // la del conjunto en 1,5. El par sólo ofrecía «corta» y «larga» una contra
                         // la otra, así que su voto no podía pedir menos de lo que se le enseñó —
                         // pero su nota sí lo pide («tiene que tener bastantes dobladuras») y las
                         // referencias también. Cuando el voto, la nota y la medida apuntan al
                         // mismo lado, se pasa del valor votado y se dice. Ver `tiradas.js`.
                         // Y ojo, que además se escala con la anchura de banda, más abajo.
  err:      3,           // el error de mano del rumbo, en grados: «el a mano tiene su toque pero
                         // queda desorganizado». Eligió ±3 sobre ±13. Queda apuntado que le ve
                         // toque al otro: es el candidato a volver, no un cabo suelto.
  largo:    1.60,        // el factor del largo. Segunda vuelta: eligió el que ATRAVIESA. Venía
                         // de 0,85 y ha subido dos veces seguidas, así que es dirección, no ajuste.
  crece:    1.15,        // hasta cuánto engorda la banda: «engorda sólo hasta asegurar márgenes
                         // más o menos constantes allá donde hay gravedad». Casi constante.
  pDenso:   0.62,        // «prefiero la densa pero podría ser todo». Se queda como estaba.
  pRecorte: 0.05,        // que la OBRA ENTERA sea el recorte de una mayor: raro, lo eligió dos veces
  sale:     0.22,        // ...pero que UN TRAZO se salga del pliego: eso es otra cosa y sí la quiere
  solo:     0.32,        // cuánto tiene que apartarse un trazo DE SÍ MISMO, en separaciones
  aire:     0,           // YA NO ES UNA TASA: es lo que se añade a mano por encima de lo que sale
                         // solo. Ver los cabos, que es la nota que más código cambió.
  nTrazos:  1.0,         // factor sobre el número de trazos. El ×1,45 que eligió está metido en la
                         // tabla de tipos: la decisión era «más trazos», no «un factor de 1,45».
  cats:     null,        // la mezcla de categorías; null = la del tipo, ya corrida hacia la suelta
  vueltas:  0,           // el campo, apagado. Lo confirmó: «se quedan donde cayeron de primeras».
  prop:     [1.02, 1.15],// la proporción del pliego. Segunda vuelta: eligió CASI CUADRADO sobre el
                         // rango libre de 1,02 a 1,55. La familia tiene silueta, no variedad.
};
const ENV = { canal: 'HRRS_CANAL', obl: 'HRRS_OBL', tramo: 'HRRS_T', err: 'HRRS_ERR',
              largo: 'HRRS_L', vueltas: 'HRRS_V' };
function mandos(opt) {
  const M = Object.assign({}, MANDOS, (opt && opt.mandos) || {});
  if (typeof process !== 'undefined' && process.env) {
    for (const k in ENV) {
      const v = process.env[ENV[k]];
      if (v == null || (opt && opt.mandos && opt.mandos[k] != null)) continue;
      M[k] = Array.isArray(MANDOS[k]) ? v.split(',').map(Number) : Number(v);
    }
  }
  return M;
}

function circuito(seed, opt) {
  const rng = new Rng(seed);
  const M = mandos(opt);
  let CANAL = M.canal;   // si viene un número, manda; si no, se sortea más abajo

  const pasos = (opt && opt.pasos) ? [] : null;
  let W = 0;    // la anchura de banda no existe hasta el paso 5. A propósito.
  const foto = (etq, modo, nota) => {
    if (!pasos) return;
    pasos.push({ etq, modo: modo || 'hilo', nota: nota || '', W,
                 trazos: trazos.map(t => t.map(q => [q[0], q[1]])) });
  };

  const prop = M.prop ? rng.range(M.prop[0], M.prop[1]) : rng.range(1.02, 1.55);
  const apais = rng.bool(0.5);
  const fw = (opt && opt.geometria) ? opt.geometria.fw : (apais ? prop : 1);
  const fh = (opt && opt.geometria) ? opt.geometria.fh : (apais ? 1 : prop);

  // EL ALFABETO. Dos rumbos anclados al pliego —en las referencias el 72 % de la longitud corre
  // a ±20° de los ejes— y dos o cuatro oblicuos, con su error de mano.
  const gira = rng.range(-4, 4);
  const rumbos = [gira, gira + 90], pesoRumbo = [0.30, 0.30];
  // el rango de los oblicuos, y es un mando de primer orden sobre el ángulo de quiebro: un giro
  // del eje a un oblicuo de 70° son 70°, y las referencias doblan 35 de mediana
  const OBL = M.obl;
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
    // MÁS TRAZOS —eligió el ×1,45— y LA MEZCLA, QUE ES EL ÚNICO SITIO DONDE SE HA CONTRADICHO.
    // Conviene dejarlo escrito entero, porque el que lo lea dentro de un mes va a pensar que uno de
    // los dos números está mal puesto:
    //
    //   vuelta 1 ... eligió «42 % suelta» sobre la mezcla del tipo, o sea MENOS paralelas. Y a la
    //                vez dijo que la otra le parecía «más suelta», cuando llevaba 29 % de sueltas
    //                contra 45 %. La palabra y el número no señalaban lo mismo.
    //   vuelta 1 ... nota en los oblicuos: «yo de menos paralizaciones aquí de todos modos».
    //   vuelta 2 ... eligió «44 % paralela», o sea MÁS paralelas, que es lo contrario.
    //
    // Se aplica lo de la vuelta 2 porque es la respuesta directa a la pregunta directa y es la
    // más reciente. Pero dos de tres apuntan al otro lado, así que esto no está cerrado: lo que
    // hay debajo es que ninguna de las dos veces estaba eligiendo por la cuenta de sueltas —estaba
    // eligiendo por la imagen— y la etiqueta no le dice lo que va a ver. El par que lo cierre
    // tendrá que preguntarlo sin nombrar la mezcla.
    // EL NÚMERO DE TRAZOS VUELVE A [8,13] Y [5,9], Y NO ES DESHACER SU VOTO: es conservarlo.
    // Él votó «×1,45, más trazos» mirando obras cuyo paseo se atascaba al 31 % del recorrido —sólo
    // 7 de cada 100 trazos llegaban a su largo—, así que lo que estaba pidiendo con más trazos era
    // MÁS TINTA, que era la única manera de conseguirla con el paseo roto. Arreglado el atasco, el
    // largo dibujado se triplica: con [12,19] la cobertura se va al 38,7 % cuando en las seis la
    // mediana es 23 % y el máximo 54 %. Devolver la tabla deja la tinta donde a él le gustó —el
    // ×1,45 sobre el paseo roto y el ×1,00 sobre el arreglado dan casi la misma cobertura— y de
    // paso vuelve al rango de trazos de las referencias, que es de 5 a 14.
    denso:   { n: [8, 13], sep: [0.055, 0.080], cats: [0.44, 0.14, 0.24, 0.18] },
    abierto: { n: [5, 9],  sep: [0.085, 0.150], cats: [0.38, 0.14, 0.20, 0.28] },
  };
  const tipo = rng.bool(M.pDenso) ? 'denso' : 'abierto';
  // EL CANAL NO ES UNA CONSTANTE DE LA FAMILIA, es una decisión de cada obra: «quiero que tenga
  // ambas versiones, ancho y estrecho, pero el blanco entre bandas paralelas debería ser
  // estrecho». Así que se sortea sesgado: tres de cada cuatro obras van estrechas.
  if (CANAL == null) CANAL = rng.bool(0.75) ? rng.range(0.17, 0.25) : rng.range(0.25, 0.36);
  // LA TASA DE CABOS AL AIRE VA CON LA DENSIDAD, y eso lo dicen las seis ordenadas por número de
  // trazos: 14 trazos → 0 %, 11 → 18 %, 8 → 19 %, 7 → 29 %, 6 → 17 %, 5 → 40 %. Cuantos más
  // trazos, menos cabos al aire — y tiene sentido: en una obra apretada un cabo tiene contra qué
  // morir, y en una dispersa no hay nada enfrente.
  //
  // Sorteándola libre de 0 a 40 % costaba 0,07 de acompañamiento, porque las obras que sacaban un
  // 40 % dejaban los cabos suel­tos lejos de todo. Atada al tipo, la variación se conserva y el
  // acompañamiento no se paga.
  const P_AIRE = Math.min(0.75, M.aire *
    (tipo === 'denso' ? rng.range(0.00, 0.16) : rng.range(0.16, 0.40)));
  // Y HAY OBRAS QUE SON UN RECORTE de una composición mayor: en r4, r5 y r6 la mitad de los cabos
  // están a menos de una anchura del borde del pliego, contra uno o dos en r1, r2 y r3. En un
  // recorte los trazos SE SALEN del papel; hasta ahora el paseo rebotaba en el margen y eso era
  // imposible ni por accidente.
  // «Me gusta que algunos trazos puedan salir fuera. Pero NO ES CUESTIÓN DE HACER ZOOM, para nada.
  // No es lo que estás planteando.» Tiene razón y el planteamiento era mío: `recorte` metía un
  // margen negativo A LA OBRA ENTERA, así que la composición completa se desbordaba y eso se lee
  // como el zoom de un cuadro mayor —no como un trazo que se va—. Son dos cosas distintas y las
  // tenía en una:
  //
  //   EL RECORTE ..... la obra entera es el encuadre de una composición mayor. Existe en r4, r5 y
  //                    r6 —la mitad de sus cabos están a menos de una anchura del borde— y él lo
  //                    ha dejado en raro las dos veces que se lo he preguntado: 5 %.
  //   QUE SE SALGA ... la composición cabe, y ALGÚN TRAZO se va por el borde. Es una decisión del
  //                    trazo, no del pliego, así que ahora se sortea por trazo.
  const recorte = rng.bool(M.pRecorte);
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
  const mgFuera = -sep * 0.9;              // el margen del trazo al que se le deja salir
  const n = Math.max(3, Math.round(rng.int(T.n[0], T.n[1]) * M.nTrazos));
  const PASO = 0.105, ERR = M.err, TOPE_VUELTA = 100;
  // el largo de un TRAMO recto, en pasos. Las referencias corren mucho antes de doblar.
  // LA TIRADA VA CON LA ANCHURA DE BANDA, y esto salió de una nota suya: «más largo cuanto más
  // estrecho sea el trazo, quizá en Chillida veo algo así». Se puede comprobar, así que se
  // comprobó — partiendo los ejes de `mano.json` cada vez que doblan y midiendo cada trozo en
  // anchuras de su obra:
  //
  //     r1  banda 0,033  tirada mediana 2,1 anchuras        r4  0,052  1,9
  //     r2  banda 0,042  tirada mediana 1,3                 r5  0,091  1,3
  //     r3  banda 0,054  tirada mediana 1,9                 r6  0,089  1,2
  //
  //   correlación banda ↔ tirada: r = -0,67 (umbral 12°), -0,39 (20°), -0,41 (30°)
  //
  // El signo es el suyo en los tres umbrales: la banda estrecha corre más. La fuerza es otra cosa
  // —seis obras y una de ellas la corrompida— así que se aplica el exponente que sale del ajuste,
  // -0,41, y no más: eso hace que una banda de 0,033 corra un 25 % más que una de 0,062. Suave, y
  // es lo que seis obras aguantan.
  const K_TIRADA = Math.pow(0.05 / Math.max(0.02, W_NOM), 0.41);
  const L_TRAMO = [M.tramo[0] * K_TIRADA, M.tramo[1] * K_TIRADA];
  // LA ESQUINA, por PASO y no por trazo. En las referencias hay 6,9 quiebros por unidad de
  // longitud, o sea ~0,7 por paso: con 0,11 el trazo hacía media esquina y salía recto —cuerda
  // 0,98 contra 0,79—. Un trazo corto con tasa baja de esquina es una raya.
  // No hay «probabilidad de doblar»: el paseo tira un tramo recto y al acabarlo SIEMPRE tuerce
  // —`eligeRumbo` sólo devuelve candidatos a más de 12°—, así que lo que gobierna cuánto dobla una
  // obra es el largo del tramo y nada más. Aquí vivía un `P_ESQ` declarado y nunca usado, herencia
  // de un generador anterior; se fue al ponerlo en un par y ver que los dos lados salían idénticos
  // hasta el píxel. Un mando que no dispara es peor que ninguno: haría votar ruido.
  // Y EL LARGO DEL TRAZO TAMBIÉN VA CON LA BANDA, en el sentido contrario que la tirada. Medido en
  // las seis, el largo medio de un trazo en unidades del pliego:
  //
  //     r1 banda 0,033 → 0,65     r4 0,052 → 1,25     r5 0,091 → 0,87
  //     r2 banda 0,042 → 0,44     r3 0,054 → 0,71     r6 0,089 → 0,54
  //
  // El ajuste da largo ∝ banda^0,24: la banda gorda dibuja trazos MÁS LARGOS en el papel, aunque
  // más cortos medidos en anchuras. Sin esto, nuestras obras finas ponían un 30 % de tinta contra
  // el 16 % de r1 —dibujaban de más— y las gordas se quedaban cortas. Es una relación floja, como
  // la de la tirada, y se aplica con el exponente que sale y no más. En el centro del rango no
  // toca nada, así que el 1,60 que él votó sigue valiendo donde lo votó.
  const K_LARGO = M.largo * Math.pow(Math.max(0.02, W_NOM) / 0.05, 0.24);

  const dentroDe = (m) => (p) => [Math.max(m, Math.min(fw - m, p[0])),
                                  Math.max(m, Math.min(fh - m, p[1]))];
  const fueraDe = (m) => (p) => p[0] < m || p[0] > fw - m || p[1] < m || p[1] > fh - m;
  const dentro = dentroDe(mg), fuera = fueraDe(mg);

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
  // CUÁNTO SE APARTA UN TRAZO DE SÍ MISMO, y esto estaba estrangulando el generador entero.
  //
  // El paseo se atascaba en el 93 % de los casos con el 31 % del recorrido hecho —sólo 7 de cada
  // 100 trazos llegaban a su largo— y el 59 % de los rechazos era éste: el trazo contra sí mismo.
  // Con las tiradas cortas que él eligió, girar acerca el tramo nuevo al anterior de inmediato, así
  // que la regla le prohibía doblar. Sus dos peticiones —«bastantes dobladuras» y un trazo que no
  // se cruza— se estaban peleando, y ganaba la que nadie había medido.
  //
  // Medido en `mano.json`, la distancia mínima de un trazo a sí mismo, en anchuras de banda:
  //
  //     r1 0,62   r2 0,60   r3 1,02   r4 0,55   r5 0,37   r6 0,00 (se toca)
  //     las seis juntas:  p05 0,03   p10 0,37   MEDIANA 0,83   p90 1,40
  //
  // El generador exigía 0,78 separaciones = 0,95 anchuras, o sea POR ENCIMA DE SU MEDIANA: le
  // prohibíamos más de la mitad de lo que Chillida hace. Se baja a su p10. Y no rompe la regla de
  // no fundir, que es sobre trazos DISTINTOS: un trazo pegado a sí mismo sigue siendo una pieza.
  const seCruza = (pts, u, q) => {
    for (let i = 0; i < pts.length - 2; i++)
      if (distTramos(u, q, pts[i], pts[i + 1]) < sep * M.solo) return true;
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
  function pasea(p0, dir0, largo, evita, meta, kT) {
    const err = rng.range(-ERR, ERR);
    // ¿ESTE TRAZO SE SALE? Es del trazo y no del pliego: el sorteo va aquí, una vez por paseo. Con
    // el margen negativo el paseo puede irse por el borde en vez de rebotar contra él, y la
    // composición sigue cabiendo — que es la diferencia que él marcó entre «que salgan trazos» y
    // «hacer zoom». El primero nunca se sale: es la base de la obra.
    const seSale = trazos.length > 0 && rng.bool(M.sale);
    const mgL = seSale ? mgFuera : mg;
    const dentroL = seSale ? dentroDe(mgL) : dentro;
    const fueraL = seSale ? fueraDe(mgL) : fuera;
    let dir = dir0 + err;
    const pts = [dentroL(p0)];
    let hecho = 0, atasco = 0;
    while (hecho < largo && atasco < 25) {
      // el largo del TRAMO, no del paso: varias anchuras de banda de recta seguida
      const kt = kT || 1;
      const objetivo = Math.min(largo - hecho, PASO * rng.range(L_TRAMO[0], L_TRAMO[1]) * kt);
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
          if (fueraL(q)) continue;
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
    // EL PRIMERO DOBLA MÁS QUE LOS DEMÁS: «tiene que tener bastantes dobladuras, al menos el
    // primer trazo, que es el que marca la base de la obra y siguientes trazos». Y es coherente con
    // el orden que él mismo puso —primero se dibuja el trazo central y los demás se relacionan con
    // él—: si el primero es una recta, no hay base a la que relacionarse, hay una raya.
    // el 0,60 dejó de bastar cuando el pliego pasó a casi cuadrado: el primero doblaba sólo un 9 %
    // más que los demás, y lo que él pidió es que se note. `tiradas.js` lo vigila.
    const pts = pasea(p0, eligeRumbo(null), rng.range(0.85, 1.45) * K_LARGO, null, null, 0.45);
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
    const mez = M.cats || T.cats;
    for (let i = 0; i < CATS.length; i++) { acc += mez[i]; if (u <= acc) return CATS[i]; }
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
      // NO CABÍA. Pero caer a `suelta` es caer a la categoría MÁS LEJANA de la que se pedía, y eso
      // rompía el mando entero: pidiendo 44 % de paralelas salían 24 %, y las sueltas subían de un
      // 18 % pedido a un 40 % real. O sea que la etiqueta del par nunca decía lo que él iba a ver, y
      // ahí está la explicación de que se contradijera entre las dos vueltas: la mezcla que eligió
      // en la segunda sale casi igual que la que rechazó en la primera.
      //
      // Una paralela que no cabe sigue queriendo ser un trazo EN RELACIÓN con otro. El apoyo lo es
      // —llega y muere contra un cuerpo—; la suelta es justo lo contrario. Así que cede a apoyo.
      cat = 'apoyo';
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
    ? { lejos:0, grapa1:0, medio:0, corto:0, estorba:0, cruza:0, ok:0, sinCand:0 } : null;
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
      // EL GESTO SE DECLARA, PERO LA ELECCIÓN ENTRE LOS DOS PERMITIDOS LA HACE LA GEOMETRÍA.
      //
      // Sorteando de antemano si este cabo llega de frente o en paralelo, el 84 % de los cabos se
      // quedaba al aire —contra el 17 % de las seis—, y el contador dijo por dónde: las dos grapas.
      // El último tramo tiene que llegar perpendicular al vecino o pegado a él, y desde el rumbo
      // con el que el trazo viene, ese gesto pedía doblar más de cien grados. No es un fallo del
      // remate: es que él eligió los oblicuos abiertos (58–76°) y con el alfabeto separado de los
      // ejes el gesto declarado cae lejos del rumbo de llegada. Su elección y esta regla se
      // peleaban, y las dos son suyas.
      //
      // Así que no se toca ninguna de las dos: se prueban LOS DOS GESTOS en cada candidato, en el
      // orden que el sorteo prefería. Los dos son modos permitidos —el ángulo de llegada medido es
      // bimodal, 0–15° y 75–90°, y el medio sigue prohibido—, así que probar los dos no relaja
      // ninguna regla; sólo deja de tirar un cabo por no haber preguntado por el otro modo.
      //
      // Y el temblor del gesto se tira UNA VEZ, antes de buscar, en vez de dentro del bucle: si se
      // tira dentro, el número de intentos cambia cuántas veces se llama al azar y entonces tocar
      // la búsqueda mueve todas las obras. Un mando no puede tener ese efecto secundario.
      // EL CODO NO SE DIBUJA, PERO SE ESTABA USANDO PARA DESCARTAR. Y ahí estaba el 75 % de los
      // cabos al aire, que es lo que él vio en el par 9 sin poder nombrarlo: «no veo mucha
      // diferencia entre ambas, ocurrirá de todo, pero algunos puntos tenderán a tener gravedad y
      // morirán contra algo, otros al aire».
      //
      // La historia: para que el último tramo fuera exactamente el gesto declarado —de frente o en
      // paralelo al vecino— se metía un vértice extra, el codo. Se quitó midiendo, porque rompía
      // trece obras de sesenta y se llevaba el acompañamiento de 0,52 a 0,38. Pero se quitó sólo de
      // la geometría: LOS TRES DESCARTES QUE LO COMPROBABAN SE QUEDARON. Así que el remate calculaba
      // un codo, lo medía, lo rechazaba por grapa o por estorbo, y tiraba el cabo entero — por un
      // vértice que no iba a insertar. El 78 % de los cabos moría al aire por eso, y no de hoy: la
      // versión de antes de los pares daba lo mismo.
      //
      // Ahora se comprueba LO QUE SE VA A DIBUJAR, que es el tramo `desde → q`, y nada más. Y la
      // regla del ángulo de llegada —bimodal, 0–15° y 75–90°, con el medio vacío en las seis— se
      // aplica también sobre ese tramo en vez de sobre el fantasma: se mide con qué ángulo llega al
      // vecino y se prohíbe el medio. La regla no se relaja; se aplica donde se ve.
      //
      // El gesto preferido sigue sorteándose (52 % de frente, como las seis) pero ya no ES el
      // rumbo: es el ORDEN en que se prueban los candidatos. Primera pasada, sólo los que llegan
      // con el gesto preferido; segunda, cualquiera que no caiga en el medio prohibido. Un cabo no
      // se tira por no haber preguntado por el otro modo.
      const resto = cual === 0 ? trazos[k].slice(2).reverse() : trazos[k].slice(0, -2);
      const desde = trazos[k][vec];
      const anterior = trazos[k][vec === 1 ? 2 : trazos[k].length - 3];
      const a1 = anterior ? Math.atan2(desde[1] - anterior[1], desde[0] - anterior[0]) : NaN;
      const prueba = (cd, exigeModo) => {
        if (cd.d > W_NOM * 7) { if (DBGC) DBGC.lejos++; return null; }
        // el cabo va a una anchura del eje del vecino, por el lado en el que ya estoy
        let nx = -Math.sin(cd.tang), ny = Math.cos(cd.tang);
        if ((trazos[k][idx][0] - cd.q[0]) * nx + (trazos[k][idx][1] - cd.q[1]) * ny < 0) {
          nx = -nx; ny = -ny;
        }
        const q0 = [cd.q[0] + nx * D_CABO, cd.q[1] + ny * D_CABO];
        const q = recorte ? q0 : dentro(q0);
        const L2 = hy(q[0] - desde[0], q[1] - desde[1]);
        if (L2 < W_NOM * 0.4) { if (DBGC) DBGC.corto++; return null; }
        const a2 = Math.atan2(q[1] - desde[1], q[0] - desde[0]);
        if (isFinite(a1) && Math.abs(corto((a2 - a1) / RAD)) > 100) {
          if (DBGC) DBGC.grapa1++; return null;
        }
        // con qué ángulo llega al vecino, entre 0° (tangencial) y 90° (de frente)
        const bruto = Math.abs(corto((a2 - cd.tang) / RAD));
        const ll = Math.min(bruto, 180 - bruto);
        if (ll > 90 - ANG_FRENTE + 22 && ll < ANG_FRENTE - 22) { if (DBGC) DBGC.medio++; return null; }
        const deFrenteReal = ll >= 45;
        if (exigeModo != null && deFrenteReal !== exigeModo) return null;
        if (estorba(k)(desde, q)) { if (DBGC) DBGC.estorba++; return null; }
        if (seCruza(resto.concat([desde]), desde, q)) { if (DBGC) DBGC.cruza++; return null; }
        return { q, clase: cd.clase + (deFrenteReal ? ' de frente' : ' en paralelo') };
      };
      let puesto = null;
      for (const exige of [deFrente, null]) {
        for (const cd of cands.slice(0, 8)) {
          const r = prueba(cd, exige);
          if (r) { trazos[k][idx] = r.q; puesto = r.clase; if (DBGC) DBGC.ok++; break; }
        }
        if (puesto) break;
      }
      destinos[k][cual] = puesto || 'al aire';
    }
  }
  if (DBGC) console.error('cabos: ok=' + DBGC.ok + ' lejos=' + DBGC.lejos +
    ' grapa=' + DBGC.grapa1 + ' medio prohibido=' + DBGC.medio + ' corto=' + DBGC.corto +
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
  const VUELTAS = M.vueltas;
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
  // banda sale una losa.
  //
  // EL TECHO ESTABA PUESTO SOBRE UN RANGO MAL CITADO. Decía aquí que «las referencias van de 0,032
  // a 0,042» y de ahí salía el 0,062. Van de 0,0325 a 0,0909: r5 mide 0,0909 y r6 0,0889, o sea que
  // con ese techo las dos eran literalmente INGENERABLES. Y eso explica lo que él ve —«las de trazo
  // gordo todavía no están de Chillida»—, porque además el techo invertía la relación:
  //
  //              cobertura de tinta        largo dibujado        (largo x banda / área)
  //   ellas      15-17 % las finas         casi constante        y 31 % en r5, 54 % en r6
  //              → correlación banda ↔ cobertura  +0,83
  //   nosotros   26 % las finas            2,2 en las gordas     y 12,8 % en las gordas
  //              contra 6,8 en las finas   → la relación al revés
  //
  // Lo que pasaba: como W sale del hueco que deja la composición, tocar el techo sólo era posible
  // en obras MUY DISPERSAS. O sea que «banda gorda» no era una elección sino un síntoma de obra
  // vacía, justo lo contrario de r5 y r6, que son gordas Y llenas. Subir el techo a 0,095 —un pelo
  // por encima de r5— devuelve esas dos a la familia.
  W = Math.min(percentil(hs0, P_BANDA), sep / (1 + CANAL) * 1.10, 0.095);
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
      // Y EL EMPUJE SE VETA SI EMPEORA A UN TERCERO. Esta reparación apartaba dos vértices sin
      // mirar a dónde iban, y en 4 obras de 300 el vértice apartado caía encima de OTRO trazo: el
      // hueco mínimo se iba a 0,00004 y con él la banda a cero, o sea la obra a blanco. Y no era
      // una obra difícil — antes de la reparación su hueco era 0,054, que da una banda de 0,053
      // perfectamente buena. La reparación era lo único que la mataba.
      //
      // Es la misma lección que ya está escrita dos veces en este archivo y que se me volvió a
      // escapar por escribirla en un sitio y no en el otro: VETAR CONSERVA, CORREGIR DESTROZA. El
      // campo lo tiene desde la autopsia; esto no, porque nadie lo miró. Se mide el hueco de los
      // tramos que tocan a esos dos vértices contra todos los demás trazos, antes y después: si
      // después es peor, no se mueve y se queda donde estaba, que era un sitio válido.
      const mideLocal = () => {
        let m = Infinity;
        for (const a of [i - 1, i, i + 1]) {
          if (a < 0 || a + 1 > t.length - 1) continue;
          for (let j2 = 0; j2 < trazos.length; j2++) {
            if (j2 === peor.k) continue;
            for (let q2 = 0; q2 < trazos[j2].length - 1; q2++)
              m = Math.min(m, distTramos(t[a], t[a + 1], trazos[j2][q2], trazos[j2][q2 + 1]));
          }
        }
        return m;
      };
      const antes = mideLocal();
      const viejo = [[t[i][0], t[i][1]], [t[i + 1][0], t[i + 1][1]]];
      for (const idx of [i, i + 1])
        t[idx] = dentro([t[idx][0] + ux * emp, t[idx][1] + uy * emp]);
      if (mideLocal() < antes - 1e-9) {
        t[i] = viejo[0]; t[i + 1] = viejo[1];
        break;                     // no hay empuje que valga: se deja la composición como estaba
      }
    }
    // Y LA REGLA MANDA. Pero el 0,98 que había aquí no la cumplía: dejaba un canal del 2 % de la
    // banda en el par más apretado, y un 2 % a la resolución a la que se mira esto es cero — dos
    // bandas pegadas. Medido con el detector exacto salían 4 obras de 100 fundidas.
    //
    // Lo que tiene que poner aquí es el propio modelo, que ya lo dice: separación = banda + canal.
    // Despejado, W = hueco / (1 + canal). Así el par más apretado deja un canal de verdad —el mismo
    // canal que la obra usa en todas partes— por construcción y no por un margen de seguridad
    // inventado. Es la misma cuenta que gobierna W_NOM, y estaba escrita a mano y mal en el único
    // sitio donde de verdad hacía falta.
    W = Math.min(W, huecoMinimo(trazos) / (1 + CANAL));
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
  const CRECE = M.crece;
  const PASO_FILO = W * 0.10;                 // 5 muestras por la octava más corta (0,5)
  // EL FILO VA EN LO QUE SE MIDE: la desviación típica de la semianchura, en anchuras de banda.
  // El 0,12–0,20 que había aquí era «amplitud de las octavas», una unidad que no se podía comparar
  // con ninguna medida, y por eso pudo estar tres veces por encima de las referencias sin que se
  // notara en ningún número. Con `piel.py`, el mismo código sobre las fotos y sobre lo nuestro:
  //
  //             sd total   lenta   rápida   escala        (restado el suelo del método)
  //   r1          0,032    0,024   0,019     0,4
  //   r2          0,036    0,027   0,017     0,4
  //   r5          0,034    0,027   0,016     0,4
  //   r6          0,034    0,026   0,015     0,3
  //   (r4 da 0,130: es la que tiene las bandas fundidas y la geometría corrompida — fuera)
  //
  // Las cuatro dicen lo mismo con bandas de 14 a 76 px, así que no es una casualidad de escala.
  // Y la lenta y la rápida no son lo mismo ni vienen del mismo sitio: LA LENTA es el relleno —la
  // banda se ensancha donde tiene sitio— y LA RÁPIDA es el filo. Al filo le toca 0,015.
  const SD_FILO = rng.range(0.017, 0.025);
  // EL CUERPO, que hasta ahora en el generador no existía: lo lento se lo ponía el relleno, y al
  // elegir él la banda casi constante («engorda sólo hasta asegurar márgenes más o menos constantes
  // allá donde hay gravedad») lo lento se fue con el relleno y la piel cayó a 0,021 contra los
  // 0,033 de las cuatro. Su nota no pide una banda matemáticamente constante: pide que el ensanche
  // sirva al margen y no al espacio libre. Así que lo lento vuelve, pero al CUERPO DEL TRAZO —una
  // onda larga de la anchura, que es lo que `trazo.js` ya tenía y esto no—, no al relleno.
  //
  // Y va bajo el mismo tope que todo lo demás, así que no puede fundir: la banda sigue cortada a
  // la medida del hueco que dejó la composición.
  // subido de 0,018–0,026: al derivar el suelo del canal la banda salió algo más fina y con menos
  // sitio para respirar, y la piel cayó de 0,033 a 0,028. El cuerpo es el mando que existe para eso.
  // Bajado de 0,024–0,033, y acortada su onda: con los trazos ya corriendo su largo entero —antes
  // se atascaban al 31 %— hay mucho más recorrido donde la onda se ve, y la banda salía festoneada.
  // La medida lo decía por la ESCALA más que por la amplitud: 0,4–0,6 anchuras contra las 0,3–0,4
  // de las cuatro referencias, o sea que nuestro respiro era del largo equivocado. Es la lección de
  // siempre: al arreglar una pieza, lo que estaba calibrado contra la rota deja de estarlo.
  const SD_CUERPO = rng.range(0.018, 0.026);
  const LAM_CUERPO = rng.range(2.5, 4.5);       // en anchuras de banda
  const COMUN = 0.32;                         // cuánto comparten los dos filos

  // ruido correlacionado y determinista: suma de octavas, con su fase.
  // Las octavas van de 2 a 0,5 anchuras: la escala medida en las cuatro es 0,3–0,4, así que una
  // octava de 4 anchuras —la que había— no es filo, es cuerpo, y sumaba a la parte lenta que ya
  // pone el relleno. Ahí estaban las nubes.
  const LAMS = [[2.0, 0.5], [1.0, 0.45], [0.5, 0.5]];
  // Y HAY QUE CONTAR LO QUE SE LLEVA EL ALISADO. Al final de todo esto el filo pasa dos veces por
  // una media móvil [¼,½,¼] para quitarle la serración entre muestras, y esa media no es neutral:
  // con las muestras a 0,10 anchuras deja el 95 % de la octava de 2 anchuras y sólo el 43 % de la
  // de 0,5. O sea que pedíamos un filo y salía otro, más lento y más flojo, y encima la cuenta de
  // normalización creía que había salido entero. Se calcula la atenuación y se compensa: así
  // SD_FILO vale de verdad lo que dice, que es la única manera de que se pueda comparar con la foto.
  const NALISA = 2;
  const atenua = (lam) => Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * 0.10 / lam), NALISA);
  const SD_OCT = Math.sqrt(LAMS.reduce((s2, l) => s2 + Math.pow(l[1] * atenua(l[0]), 2), 0) / 2)
               * Math.sqrt(COMUN * COMUN + (1 - COMUN) * (1 - COMUN));
  const octavas = () => LAMS.map(([lam, amp]) => ({ lam, amp, ph: rng.range(0, 6.2832) }));
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
      // el tope no es cosmético: cuando la banda colapsa —que es justo lo que los controles del
      // campo provocan a propósito— PASO_FILO se va a cero y esto pedía un array de mil millones.
      // El control moría con «Invalid array length» en vez de decir que la obra había colapsado,
      // o sea que el control no medía nada. Con el tope, colapsa y se puede contar.
      const n2 = Math.max(1, Math.min(4000, Math.round(L / PASO_FILO)));
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
    // EL RELLENO NO PUEDE IR PUNTO A PUNTO, y esto lo dijo la medida. El sitio libre cambia deprisa
    // —un vecino que se acerca y se va— así que la banda se hinchaba y se deshinchaba a lo largo de
    // sí misma: sd de la semianchura 0,05 anchuras cuando en r1, r2, r5 y r6 es 0,025. Eso es
    // exactamente lo que él veía: «parecen nubes, y el grosor es demasiado variable».
    //
    // Lo que hay en las referencias es una banda de grosor casi constante que se ENSANCHA DE UNA
    // PIEZA según el sitio que tiene, no una que respira cada media anchura. Así que el relleno se
    // pasa por un filtro largo —tres anchuras a cada lado— y se vuelve a topar contra el sitio real
    // punto a punto: liso donde sobra sitio, exacto donde aprieta. El tope conserva la regla.
    const VENT = Math.max(1, Math.round(3.0 / 0.10));
    for (const s2 of [0, 1]) {
      const raw = sm.map(l => l[s2]);
      for (let i = 0; i < sm.length; i++) {
        let a = 0, n3 = 0;
        for (let j = Math.max(0, i - VENT); j <= Math.min(sm.length - 1, i + VENT); j++) { a += raw[j]; n3++; }
        sm[i][s2] = Math.min(raw[i], a / n3);
      }
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
    // el cuerpo: una onda larga común a los dos lados —la banda engorda y adelgaza y el eje no se
    // mueve— y DE UN SOLO LADO, hacia dentro. Puesta como onda de media cero llegaba a la mitad: el
    // tope del relleno le recortaba toda la parte positiva, así que la piel medía 0,025 cuando se le
    // pedía 0,033. Y el recorte tenía razón: una banda no se hincha por encima del canal que la
    // separa de su vecina, se ESTRECHA desde él. Así que el techo es el sitio que hay y la onda
    // muerde hacia dentro — que además es lo que él describe, «engorda sólo hasta asegurar márgenes
    // más o menos constantes». Un seno rectificado de amplitud a tiene sd = a/(2√2).
    const faseC = rng.range(0, 6.2832);
    const ampC = SD_CUERPO * 2 * Math.SQRT2 * 2;
    // el largo del trazo en anchuras, que es la unidad del ruido
    const Ltot = largoDe(ejes[k]) / W;
    const tope = semis[k].map(l => [l[0], l[1]]);
    for (let i = 0; i < m; i++) {
      const u = Ltot * (m > 1 ? i / (m - 1) : 0.5);
      const com = evalua(oComun, u);
      const cuerpo = -ampC * 0.25 * (1 - Math.sin(u / LAM_CUERPO * 6.2832 + faseC));
      for (const s2 of [0, 1]) {
        let v = cuerpo + (SD_FILO / SD_OCT) * A * (COMUN * com + (1 - COMUN) * evalua(oc[s2], u));
        // la gubia adelgaza en los cabos y engorda en medio. Iba a ±0,12 anchuras, que ella sola
        // se comía cinco veces el presupuesto de variación lenta de las cuatro referencias; y es
        // además la calidad de r2 y r6, que son las dos que él descartó. Se queda, pero apuntada.
        if (c === 'gubia') v += (0.72 + 0.46 * Math.sin(Math.PI * i / Math.max(1, m - 1)) - 1) * 0.15;
        // el filo respira sobre la anchura, y nunca hacia dentro del canal
        semis[k][i][s2] = Math.max(W * 0.30, Math.min(tope[i][s2], semis[k][i][s2] + v * W));
      }
    }
  }
  // Y SE ALISA EL FILO. Sin esto el contorno son cientos de segmentos rectos entre muestras y el
  // borde queda picado; una pasada de media móvil corta lo que queda de serración sin tocar la
  // ondulación, que es la que lleva el carácter.
  // Y EL ALISADO NO PUEDE DESHACER EL TOPE. La media móvil de abajo puede levantar una semianchura
  // por encima del sitio que había, así que se guarda el techo y se vuelve a aplicar después: sin
  // esto el último paso del pipeline es capaz de romper la garantía que puso el anterior.
  const techo = semis.map(sm => sm.map(l => [l[0], l[1]]));
  for (const sm of semis) {
    for (let v = 0; v < NALISA; v++) {
      const cp = sm.map(l => [l[0], l[1]]);
      for (let i = 1; i < sm.length - 1; i++)
        for (const s2 of [0, 1])
          sm[i][s2] = cp[i][s2] * 0.5 + cp[i - 1][s2] * 0.25 + cp[i + 1][s2] * 0.25;
    }
  }
  for (let k = 0; k < semis.length; k++)
    for (let i = 0; i < semis[k].length; i++)
      for (const s2 of [0, 1]) semis[k][i][s2] = Math.min(semis[k][i][s2], techo[k][i][s2]);

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
//
// Y EL PAPEL NO ES BLANCO NI LA TINTA ES NEGRA, que era una sospecha suya —«quizás es un juego
// entre el color del fondo y el color del trazo: al no ser blanco puro, igual el contraste no se
// ve tanto»— y resultó ser cierta. Medido en las fotos (`piel.py color`), tomando el corazón de
// cada zona para no leer el borde, que es mezcla:
//
//   r1  papel #e4d8bc   tinta #302a27   contraste 0,67      ← las tres que él eligió
//   r4  papel #e8e6e5   tinta #313034   contraste 0,65
//   r5  papel #e6e1d2   tinta #211b18   contraste 0,78
//   r2  papel #d5d0c7   tinta #6d6658   contraste 0,34      (tinta gris: es otra técnica)
//   r6  papel #ffffff   tinta #222323   contraste 0,76      (escaneada sobre blanco)
//
// Lo nuestro era blanco puro sobre casi negro: 0,86, por encima de las seis. Un contraste de más
// endurece el filo —el ojo ve el borde antes que la forma— y eso es parte de lo que se leía como
// vectorial, aparte de la geometría. Ahora sale a 0,71, entre r1 y r5.
const PAPEL = '#e8e2d4', TINTA = '#2a2521';
function pinta(cx, Wpx, Hpx, o, opt) {
  opt = opt || {};
  const esc = Math.min(Wpx / o.fw, Hpx / o.fh);
  const ox = (Wpx - o.fw * esc) / 2, oy = (Hpx - o.fh * esc) / 2;
  const rng = new Rng((o.seed ^ 0x9e3779b9) >>> 0);
  cx.save();
  cx.fillStyle = opt.papel || PAPEL;
  cx.fillRect(0, 0, Wpx, Hpx);
  cx.translate(ox, oy); cx.scale(esc, esc);
  cx.fillStyle = opt.tinta || TINTA;
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
