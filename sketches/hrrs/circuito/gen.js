// hrrs — EL CIRCUITO. Dos fases, y el orden lo dictó el autor:
//
//   FASE 1 · SEMBRAR. «Lo primero es dibujar una serie de puntos, que es el primer trazo.
//     Unirlo. Luego se dibujan otros trazos que son series de puntos.» Cada trazo se
//     siembra SIN MIRAR A LOS DEMÁS: líneas de un píxel, con nada aplicado.
//
//   FASE 2 · RELAJAR. «Ahí, ya después de que todos los trazos simples, se empiecen a
//     aplicar los conceptos de gravedad, atracción, probabilidad de solape.» El campo
//     actúa sobre el CONJUNTO ENTERO y todos los trazos se mueven a la vez: el
//     protagonista también, y de ahí sale la cohesión.
//
// LAS TRES VARIABLES, suyas, cada una EN SU SITIO —y aquí estaba el error de la vuelta
// anterior, que las puso las tres punto a punto y el campo deshilachó la forma—:
//
//   GRAVEDAD, DEL TRAZO. «La gravedad que pueda tener cada uno de los trazos». Es una MASA,
//     y una masa mueve un CUERPO: el trazo se traslada entero, sin cambiar ni un ángulo.
//     El que pesa se queda; el ligero va. El polo no se coloca: emerge donde hay masa.
//
//   ATRACCIÓN, DEL PUNTO. «No sé si tanto en el trazo o en los puntos del trazo». Ahí sí:
//     cada punto decide cuánto se deja llevar al carril del vecino, y eso es lo que
//     paraleliza. Deforma, pero contra un carril, así que ordena en vez de deshilachar.
//
//   PROBABILIDAD DE SOLAPE, DEL PUNTO. «Si dos líneas se han solapado, pero al chequear sus
//     variables de solape su fuerza no corresponde a solaparse, se paralelizarían y se
//     rompería el solape». El solape OCURRE primero y se JUSTIFICA después: es un juicio.
//
// EL ALFABETO NO CUANTIZA, ATRAE. Cuantizando —cada tramo al rumbo más próximo— el trazo
// dobla setenta grados ocho veces, y en las seis dobla treinta grados cinco veces: los
// trazos de Chillida CURVAN. Así que los rumbos son atractores y la dirección DERIVA hacia
// ellos con su inercia, y de vez en cuando —una de ocho— hay una ESQUINA de verdad, un salto
// a otro rumbo. Lo primero da lo orgánico y lo segundo la estructura; cuantizar daba lo
// segundo dos veces.
//
// EL CAMPO Y EL ALFABETO DECIDEN COSAS DISTINTAS, y esto es lo que faltaba. Un campo
// continuo sobre puntos libres redondea las direcciones, y en las seis media longitud corre
// sobre los ejes del pliego: relajando a secas los ejes caían de 0,52 a 0,24. Así que cada
// vuelta se relaja y luego se ENCAUZA —cada tramo deriva hacia el rumbo del alfabeto más
// próximo, guardando su largo—. El campo dice DÓNDE va el trazo y a quién acompaña; el
// alfabeto dice EN QUÉ RUMBO corre. Es el paso 3 del autor, «se le dan características al
// trazo», y de paso es una proyección sobre la restricción, que es lo que la hace converger.
//
// EL MARGEN ES EL LÍMITE, no la meta: «el que marca el constraint es el margen entre
// trazos, que es constante cuando están paralelizados». Así que la gravedad tira de lejos y
// MUERE en el carril, y del carril adentro solo manda el muelle. Sin esa zona muerta la
// gravedad es máxima justo donde debía parar y la obra se cierra en un grumo.
//
// ── LO QUE FALTA, dicho para que no haya que redescubrirlo ────────────────────────────────
//
// EL EJE Y EL DOBLEZ SE PELEAN, y no es un mando mal puesto. Si media longitud va sobre dos
// ejes perpendiculares hay que doblar noventa grados para pasar de uno al otro, así que subir
// el eje sube el giro: el barrido va de (ejes 0,35 / giro 40) a (0,48 / 48) y no hay
// combinación que dé 0,52 con 32. Las seis lo resuelven de otra manera —tiradas de eje LARGAS
// y transiciones por los oblicuos—, y eso es otra pieza de modelo: el rumbo tendría que durar
// un tramo declarado, no decidirse tramo a tramo. Hoy: ejes 0,40 contra 0,52, giro 41 contra 32.
//
// EL ACOMPAÑAMIENTO SE HA QUEDADO EN 0,38 contra el 0,52 de las seis, y el número no subió al
// arreglar la geometría: bajó de 0,44 a 0,38. No es una regresión, es que el 0,44 estaba
// medido sobre bandas que se solapaban —se dibujaba 1,35·W con los centros a 1,30·W como
// mucho—, así que aquello no era acompañar, era chocar. Dos mecanismos probados y descartados,
// los dos con el número peor: hacer que la atracción vaya a un SOCIO fijo en vez de al vecino
// más próximo (0,34), y añadir el socio como tirón de largo alcance (0,38). Lo que sí suma es
// el desvío del final —el de partir y empalmar—, y suma poco: 0,03, pagando dos codos.
// La conclusión, medida: acompañar no se consigue empujando trazos que nacieron sueltos. En
// las seis el trazo NACE acompañando, y eso pide sembrar unos como offset de otros — que
// choca con «los trazos se siembran sin mirarse», así que hay que preguntárselo a él.
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

function segCorta(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return ((o(a, b, c) > 0) !== (o(a, b, d) > 0)) && ((o(c, d, a) > 0) !== (o(c, d, b) > 0));
}
// el punto más cercano de un trazo, con su tangente: la tangente es la que paraleliza
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

function circuito(seed) {
  const rng = new Rng(seed);

  const prop = rng.range(1.02, 1.55), apais = rng.bool(0.5);
  const fw = apais ? prop : 1, fh = apais ? 1 : prop;

  // el alfabeto: dos rumbos anclados al pliego —media longitud va sobre los ejes en las
  // seis— y dos o cuatro oblicuos, con su error
  const K = (typeof process !== 'undefined' && process.env.HRRS_K)
    ? process.env.HRRS_K.split(',').map(Number)
    : [3.60, 0.34, 0.55, 0.11, 0.55, 9, 0.42, 0.60, 24];
  const TIRA_EJE   = K[0];   // la cuenca del eje frente al oblicuo
  const PESO_ALF   = K[1];   // cuánto se lleva el atractor a cada vuelta del encauzado
  const PESO_PAR   = K[2];   // y cuánto el rumbo del vecino — esto es lo que paraleliza
  const P_ESQUINA  = K[3];   // cada cuánto la siembra da una esquina de verdad
  const ATRAE_RUMBO= K[4];   // la deriva de la siembra hacia su rumbo
  const TEMBLOR    = K[5];   // y su temblor, en grados
  const PESO_INERCIA=K[6];   // el tramo anterior tira del siguiente: continuidad
  const P_ESQ_ENC  = K[7];   // (reservado)
  const TOPE_GIRO  = K[8];   // ningún tramo dobla más de esto en una vuelta
  const A = (typeof process !== 'undefined' && process.env.HRRS_A)
    ? process.env.HRRS_A.split(',').map(Number) : [3.0, 0.16, 4.0, 11.0, 55, 3, 62];
  const ALCANCE_ACOMP = A[0]; // hasta cuántos carriles se considera que hay a quién acompañar
  const UMBRAL_ACOMP  = A[1]; // y con cuánta atracción en ese punto merece la pena partir
  const RUN_MIN = A[2], RUN_MAX = A[3];  // el largo del acompañamiento, EN ANCHURAS DE BANDA
  const TOPE_CRUCE    = A[4]; // más cruzados que esto, no se acompaña: sería una grapa
  const RONDAS        = A[5]; // cuántos acompañamientos se le ofrecen a cada trazo
  const TOPE_EMPALME  = A[6]; // más cerrado que esto, el empalme es una grapa: se rechaza

  const gira = rng.range(-4, 4);
  // EL PESO DEL EJE, en la siembra. En las seis el 72 % de la longitud corre a ±20° de los
  // ejes del pliego; yo iba en el 60 %. La cuenca del encauzado ya tira, pero si la siembra
  // reparte a partes iguales el encauzado tiene que deshacer la mitad del trabajo — y deshacer
  // rumbo cuesta giro. Se siembra ya escorado al eje.
  const P_EJE = (typeof process !== 'undefined' && process.env.HRRS_EJE)
    ? Number(process.env.HRRS_EJE) : 0.34;
  const OBL_MIN = (typeof process !== 'undefined' && process.env.HRRS_OBL)
    ? Number(process.env.HRRS_OBL.split(',')[0]) : 20;
  const OBL_MAX = (typeof process !== 'undefined' && process.env.HRRS_OBL)
    ? Number(process.env.HRRS_OBL.split(',')[1]) : 70;
  const rumbos = [gira, gira + 90], pesoRumbo = [P_EJE, P_EJE];
  const nObl = rng.int(2, 4);
  for (let i = 0; i < nObl; i++) {
    rumbos.push(gira + rng.range(OBL_MIN, OBL_MAX) * (rng.bool(0.5) ? 1 : -1));
    pesoRumbo.push((1 - 2 * P_EJE) / nObl);
  }
  const todos = [], tira = [];
  for (let i = 0; i < rumbos.length; i++) {
    // LA CUENCA. Rectificar al rumbo MÁS PRÓXIMO reparte por igual, y en las seis los dos ejes
    // del pliego se llevan media longitud siendo dos rumbos de seis: tiran el triple. Así que
    // el eje tiene una cuenca más ancha y se queda con los tramos que le pasan cerca.
    const t = i < 2 ? TIRA_EJE : 1;
    todos.push(rumbos[i]); tira.push(t);
    todos.push(rumbos[i] + 180); tira.push(t);
  }

  // la banda fina pesa más: no es invariante de las seis —van de 0,025 a 0,096— es una
  // preferencia del autor, medida (z = −0,79 sobre 24 obras que eligió sin queja)
  // La cobertura de tinta de las seis es 24,8 % y la mía 20,1 %, y sale de aquí: con la línea
  // ya en su sitio, la tinta la pone la banda. Despejando en las seis —línea 5,21 sobre un
  // pliego de área ~1,28— su banda mediana es 0,061, y yo sorteaba con media 0,0515. Se sube
  // el rango sin perder la fina, que es la que él prefiere (z = −0,79 sobre 24 obras suyas).
  const W = rng.range(0.036, 0.086);

  // SEPARACIÓN = BANDA + CANAL, y esto es aritmética, no gusto. Antes la banda se dibujaba a
  // 1,35·W con los centros a 1,21·W: la banda era MÁS ANCHA que la separación de centros, así
  // que el foso tenía que morder a los vecinos y donde se juntaban tres quedaba un borrón. W es
  // la anchura de la tinta, el canal son 0,22 anchuras —medido en las seis— y los centros van
  // a la suma. El tipo modula esa suma; no la contradice.
  const CANAL = 0.22;
  const TIPOS = {
    denso:   { n: [7, 12], sepK: [1.00, 1.12], atrae: [0.30, 0.55],
               grav: [0.55, 1.25], solape: [0.10, 0.30] },
    abierto: { n: [5, 8],  sepK: [1.25, 2.10], atrae: [0.14, 0.32],
               grav: [0.12, 0.50], solape: [0.02, 0.12] },
  };
  const tipo = rng.bool(0.62) ? 'denso' : 'abierto';
  const T = TIPOS[tipo];
  const sep = W * (1 + CANAL) * rng.range(T.sepK[0], T.sepK[1]);
  // el reposo, un pelo por fuera de la línea prohibida: puesto EN `sep` justo, la prueba del
  // margen lo rechaza y las paralelas se mueren al nacer
  const carril = sep * 1.02;
  const mg = W * 0.5 + 0.004;
  const n = rng.int(T.n[0], T.n[1]);
  const fuerza = rng.range(T.atrae[0], T.atrae[1]);
  const G = rng.range(T.grav[0], T.grav[1]);
  const solMedia = rng.range(T.solape[0], T.solape[1]);
  // alto a propósito: el autor dice «puede llegar a haber solapes», no que sean la norma,
  // y las seis no cruzan un solo par de centros en 220 posibles
  const SOL_UMBRAL = 0.82;
  const VUELTAS = 18;

  const TOPE_VUELTA = 100;   // un giro más cerrado que esto no existe en las seis
  const PASO = 0.105;
  const ERR_RUMBO = 7;

  // el rumbo más próximo, con la cuenca del eje: a qué atractor cae esta dirección
  const atractor = (a) => {
    let mej = a, dm = Infinity;
    for (let r = 0; r < todos.length; r++) {
      const d = Math.abs(((todos[r] - a + 540) % 360) - 180) / tira[r];
      if (d < dm) { dm = d; mej = todos[r]; }
    }
    return mej;
  };
  const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  // paralelo, no misma dirección: dos hebras de la misma cinta corren al revés y acompañan
  const cortoPar = (d) => { const c = corto(d); return Math.abs(c) > 90 ? corto(d + 180) : c; };

  const eligeRumbo = (desde) => {
    if (desde == null) {
      let u = rng.u(), acc = 0, k = 0;
      for (; k < rumbos.length; k++) { acc += pesoRumbo[k]; if (u <= acc) break; }
      return rumbos[Math.min(k, rumbos.length - 1)] + (rng.bool(0.5) ? 0 : 180)
             + rng.range(-ERR_RUMBO, ERR_RUMBO);
    }
    // NI VUELTAS ATRÁS. `todos` lleva cada rumbo y su opuesto, así que sin este tope el trazo
    // podía elegir un candidato a 170° y doblarse sobre sí mismo: 19 % de mis giros pasaban de
    // 110° contra el 1 % de las seis, y eso convierte un circuito en un garabato. Es el defecto
    // que más se veía y no salía en ninguno de los quince rasgos que medía.
    const cand = todos.map(r => ({ r, d: Math.abs(((r - desde + 540) % 360) - 180) }))
                      .filter(o => o.d > 12 && o.d < TOPE_VUELTA).sort((a, b) => a.d - b.d);
    if (!cand.length) return desde;
    const i = rng.bool(0.72) ? 0 : Math.min(cand.length - 1, rng.int(1, 2));
    return cand[i].r + rng.range(-ERR_RUMBO, ERR_RUMBO);
  };
  // REBOTA, NO RECORTA. Recortando contra el pliego los puntos se apilan a lo largo del
  // borde y la obra se abraza al marco; rebotando, el trazo entra otra vez al papel.
  const dentro = (p) => {
    let x = p[0], y = p[1];
    if (x < mg) x = mg + (mg - x); if (x > fw - mg) x = (fw - mg) - (x - (fw - mg));
    if (y < mg) y = mg + (mg - y); if (y > fh - mg) y = (fh - mg) - (y - (fh - mg));
    return [Math.max(mg, Math.min(fw - mg, x)), Math.max(mg, Math.min(fh - mg, y))];
  };

  // el valor de cada punto: onda lenta, no ruido. Un trazo tiene TRAMOS que tienden a
  // solaparse, no puntos alternos — con ruido blanco el solape sale y se rompe cada dos
  // puntos y no se lee como una decisión.
  function perfil(m, media, amp) {
    const f = rng.range(0.8, 2.4), p0 = rng.range(0, 6.2832), out = [];
    for (let i = 0; i < m; i++) {
      const u = m > 1 ? i / (m - 1) : 0;
      out.push(Math.max(0, Math.min(1, media + amp * Math.sin(u * f * 6.2832 + p0)
                                     + rng.range(-0.08, 0.08))));
    }
    return out;
  }

  // RECTIFICAR: devolver cada tramo a su rumbo, guardando su largo. Se reconstruye DESDE EL
  // MEDIO hacia los dos lados, no desde el cabo: desde el cabo el error se acumula y el trazo
  // entero se va de sitio, y lo que el campo acababa de decidir se pierde.
  // ENCAUZAR es UNA SOLA DECISIÓN por tramo, y en ella caben las cuatro cosas que hacen
  // que esto se lea como Chillida y no como un campo de fuerzas:
  //
  //   el ALFABETO — el tramo va a un rumbo declarado, no a donde el campo lo dejó;
  //   el EJE — que tiene la cuenca más ancha, porque en las seis los dos ejes del pliego se
  //     llevan media longitud siendo dos rumbos de seis;
  //   la CONTINUIDAD — doblar cuesta. Sin este peaje cada tramo cae en un eje y el siguiente
  //     en el otro: noventa grados todo el rato, y el giro se iba a 84° contra los 32° suyos;
  //   el PARALELISMO — y aquí está lo que faltaba. Acompañar no es acercarse: es IR EN EL
  //     MISMO RUMBO. La atracción del campo mueve el punto perpendicular al vecino y lo deja
  //     al margen justo, pero cruzado; entonces el tramo se lee como un roce, no como una
  //     paralela, y el acompañamiento no pasaba de 0,25 contra el 0,52 de las seis. Así que el
  //     rumbo del vecino entra en el coste, pesado por la ATRACCIÓN DE ESE PUNTO, que es la
  //     variable del autor. Paralelizar dicho en el alfabeto.
  //
  // Y se reconstruye DESDE EL MEDIO hacia los dos lados, no desde el cabo: desde el cabo el
  // error se acumula y el trazo entero se va de sitio, perdiendo lo que el campo decidió.
  // las tres escalas tienen que hablarse: el coste del alfabeto se mide en 60° porque es el
  // hueco típico entre rumbos, y los dos peajes en la vuelta entera

  const encauza = (pts, err, k, atr) => {
    const m = pts.length;
    if (m < 2) return pts;
    const L = [], A = [];
    let prev = null;
    for (let i = 0; i < m - 1; i++) {
      const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
      L.push(hy(dx, dy));
      const a = Math.atan2(dy, dx) / RAD;
      // el rumbo del vecino más próximo al medio del tramo, si lo hay
      let par = null, fpar = 0;
      if (k != null) {
        const mid = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
        let mejor = null;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const c = cercaDe(mid, trazos[j]);
          if (c && (!mejor || c.d < mejor.d)) mejor = c;
        }
        if (mejor && mejor.d < carril * 3.2) {
          par = mejor.dir / RAD;
          fpar = atr ? (atr[Math.min(i, atr.length - 1)] || 0) : 0;
        }
      }
      // NO SE SALTA AL RUMBO: SE VA HACIA ÉL. Una parte del camino al atractor, más otra
      // parte del camino al rumbo del vecino —esto es paralelizar—, más la inercia del tramo
      // anterior. Saltando, el trazo dobla 70°; derivando, dobla 30° y sigue siendo suyo.
      let giroTramo = corto(atractor(a) - a) * PESO_ALF;
      if (par != null) giroTramo += cortoPar(par - a) * PESO_PAR * fpar;
      if (prev != null) giroTramo += corto(prev - a) * PESO_INERCIA;
      if (giroTramo > TOPE_GIRO) giroTramo = TOPE_GIRO;
      if (giroTramo < -TOPE_GIRO) giroTramo = -TOPE_GIRO;
      const mej = a + giroTramo;
      prev = mej;
      // el error de la mano va con el tramo y no se vuelve a tirar: si se sorteara en cada
      // vuelta el trazo temblaría distinto cada vez y el temblor no sería suyo. Y sin él todo
      // cae exactamente en cuatro rumbos —r4 se iba a 0,83 contra el 0,60 de las seis—.
      A.push(mej);
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
  const ERR = () => rng.range(-ERR_RUMBO, ERR_RUMBO);

  // ── FASE 1. SEMBRAR: series de puntos, sin mirarse entre sí ───────────────────
  const trazos = [], masas = [], sols = [], atrs = [], errs = [];
  // se siembra de más porque la quita-púas se lleva un 18 % del recorrido y la tinta se mide al
  // final, no al principio: sin esto la cobertura acaba en 20,8 % contra el 24,8 % de las seis
  const Lmed = rng.range(0.80, 1.22);
  for (let k = 0; k < n; k++) {
    const largo = Lmed * (k === 0 ? rng.range(1.4, 1.8) : rng.range(0.70, 1.30));
    const a = rng.range(0, 6.2832), r = rng.range(0.08, 0.46);
    let p = dentro([0.5 * fw + Math.cos(a) * r * fw, 0.5 * fh + Math.sin(a) * r * fh]);
    let dir = eligeRumbo(null);
    const pts = [p];
    let hecho = 0;
    while (hecho < largo) {
      const L = Math.min(PASO * rng.range(0.72, 1.5), largo - hecho);
      const q = pts[pts.length - 1];
      // AL LLEGAR AL BORDE GIRA EL TRAZO, no se refleja el punto. Reflejando el punto —lo que
      // hacía— el tramo siguiente sale hacia atrás y en la polilínea eso ES una vuelta atrás:
      // la siembra metía entre el 16 y el 50 % de giros de más de 110°, cuando las seis tienen
      // el 1 %. Y de paso era la causa de que las obras se abrazaran al marco. Un trazo que
      // llega al canto del papel no rebota: dobla.
      for (let intento = 0; intento < 3; intento++) {
        const nx = q[0] + Math.cos(dir * RAD) * L, ny = q[1] + Math.sin(dir * RAD) * L;
        if (nx > mg && nx < fw - mg && ny > mg && ny < fh - mg) break;
        // se refleja EL RUMBO contra la pared que estorba, y se vuelve a encauzar al alfabeto
        if (nx <= mg || nx >= fw - mg) dir = 180 - dir;
        if (ny <= mg || ny >= fh - mg) dir = -dir;
        dir = atractor(dir) + rng.range(-TEMBLOR, TEMBLOR);
      }
      pts.push(dentro([q[0] + Math.cos(dir * RAD) * L, q[1] + Math.sin(dir * RAD) * L]));
      hecho += L;
      // LA ESQUINA, de vez en cuando: un salto declarado a otro rumbo. Es lo que da la
      // estructura; el resto del camino es deriva, que es lo que da el trazo.
      if (rng.bool(P_ESQUINA)) dir = eligeRumbo(dir);
      else dir += corto(atractor(dir) - dir) * ATRAE_RUMBO
                  + rng.range(-TEMBLOR, TEMBLOR);
    }
    if (pts.length < 2) continue;
    trazos.push(pts);
    // LA MASA: el protagonista pesa más, que es lo que le da a la obra algo a qué agarrarse
    masas.push(k === 0 ? rng.range(1.5, 2.6) : rng.range(0.3, 1.2));
    sols.push(perfil(pts.length, solMedia, rng.range(0.10, 0.45)));
    atrs.push(perfil(pts.length, fuerza, rng.range(0.10, 0.30)));
    errs.push(pts.slice(0, pts.length - 1).map(ERR));
  }

  // lo que se sembró es lo que la obra pide: el recorte por cruce no reduce la obra, la dobla
  const objetivo = trazos.map(largoDe);

  // ── FASE 2. RELAJAR ───────────────────────────────────────────────────────────
  // Todo se calcula sobre la posición de la vuelta anterior y se aplica al final: si se
  // aplicara sobre la marcha, el orden de los trazos decidiría el resultado y volveríamos a
  // tener un protagonista congelado y unos sirvientes. Y el paso se enfría vuelta a vuelta,
  // porque un campo que empuja siempre igual no se asienta, oscila.
  const CERCA = carril * 1.55;             // de aquí adentro la gravedad calla
  const ALCANCE = Math.max(fw, fh) * 0.55; // y de aquí afuera no llega

  for (let v = 0; v < VUELTAS; v++) {
    const frio = 1 - 0.55 * (v / (VUELTAS - 1));

    // 2a · GRAVEDAD, del trazo: un cuerpo rígido. Se suma el tirón de las otras masas y el
    // trazo se traslada entero, así que no cambia ni un ángulo suyo. Se divide por la masa
    // propia porque eso es lo que significa pesar: el pesado aguanta y el ligero cede.
    const tras = [];
    for (let k = 0; k < trazos.length; k++) {
      let gx = 0, gy = 0;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        // el tirón se mide en el punto del trazo k más próximo a j, que es donde se toca
        let mejor = null;
        for (const p of trazos[k]) {
          const c = cercaDe(p, trazos[j]);
          if (c && (!mejor || c.d < mejor.d)) mejor = { c, p };
        }
        if (!mejor) continue;
        const d = mejor.c.d;
        if (d <= CERCA || d >= ALCANCE) continue;   // ni dentro del margen ni fuera de alcance
        const w = G * masas[j] * (CERCA / d) * (CERCA / d);
        gx += (mejor.c.qx - mejor.p[0]) / d * w;
        gy += (mejor.c.qy - mejor.p[1]) / d * w;
      }
      const m = hy(gx, gy), tope = sep * 0.55 * frio / masas[k];
      if (m > tope) { gx = gx / m * tope; gy = gy / m * tope; }
      tras.push([gx, gy]);
    }
    for (let k = 0; k < trazos.length; k++) {
      if (!hy(tras[k][0], tras[k][1])) continue;
      trazos[k] = trazos[k].map(p => dentro([p[0] + tras[k][0], p[1] + tras[k][1]]));
    }

    // 2b · ATRACCIÓN, del punto: al carril del vecino, con el valor DE ESTE PUNTO. Y su
    // destino lo elige su fuerza de solape —encima si la tiene, al canal si no—. Más el
    // muelle del propio trazo, que es la parte de «unir los puntos» que sobrevive al campo.
    const nuevo = trazos.map(t => t.map(p => [p[0], p[1]]));
    for (let k = 0; k < trazos.length; k++) {
      for (let i = 0; i < trazos[k].length; i++) {
        const p = trazos[k][i];
        let dx = 0, dy = 0;
        let mejor = null;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const c = cercaDe(p, trazos[j]);
          if (c && (!mejor || c.d < mejor.d)) mejor = c;
        }
        if (mejor && mejor.d < carril * 4.0) {
          const meta = sols[k][i] >= SOL_UMBRAL ? 0 : carril;
          const nx = mejor.d > 1e-9 ? (p[0] - mejor.qx) / mejor.d : Math.cos(mejor.dir + Math.PI / 2);
          const ny = mejor.d > 1e-9 ? (p[1] - mejor.qy) / mejor.d : Math.sin(mejor.dir + Math.PI / 2);
          const err = meta - mejor.d;
          dx += nx * err * atrs[k][i]; dy += ny * err * atrs[k][i];
        }
        // el muelle: fuerte a propósito. El campo tira de cada punto hacia un sitio distinto
        // y sin esto la polilínea se deshilacha —el giro se iba a 124° contra los 32° de las
        // seis—. Un trazo es una serie de puntos UNIDA, y la unión es una restricción.
        if (i > 0 && i < trazos[k].length - 1) {
          const a2 = trazos[k][i - 1], b2 = trazos[k][i + 1];
          dx += ((a2[0] + b2[0]) / 2 - p[0]) * 0.42;
          dy += ((a2[1] + b2[1]) / 2 - p[1]) * 0.42;
        }
        const m = hy(dx, dy), tope = sep * 0.45 * frio;
        if (m > tope) { dx = dx / m * tope; dy = dy / m * tope; }
        nuevo[k][i] = dentro([p[0] + dx, p[1] + dy]);
      }
    }
    // 2c · RECTIFICAR: el alfabeto corrige lo que el campo redondeó
    for (let k = 0; k < trazos.length; k++) trazos[k] = encauza(nuevo[k], errs[k], k, atrs[k]);
  }

  // ── REVISAR EL SOLAPE: el que no está justificado se rompe ────────────────────
  // «Se paralelizarían y se rompería el solape»: no se aparta al azar, se aparta A LO LARGO
  // DE LA NORMAL DEL VECINO, que es lo que deja las dos hebras paralelas a un margen.
  for (let v = 0; v < 8; v++) {
    let roto = false;
    for (let k = 0; k < trazos.length; k++) {
      for (let i = 0; i < trazos[k].length; i++) {
        if (sols[k][i] >= SOL_UMBRAL) continue;      // tiene fuerza: se queda solapado
        let mejor = null;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const c = cercaDe(trazos[k][i], trazos[j]);
          if (c && (!mejor || c.d < mejor.d)) mejor = c;
        }
        if (!mejor || mejor.d >= sep) continue;      // no está solapado
        const nx = mejor.d > 1e-9 ? (trazos[k][i][0] - mejor.qx) / mejor.d
                                  : Math.cos(mejor.dir + Math.PI / 2);
        const ny = mejor.d > 1e-9 ? (trazos[k][i][1] - mejor.qy) / mejor.d
                                  : Math.sin(mejor.dir + Math.PI / 2);
        trazos[k][i] = dentro([mejor.qx + nx * carril * 1.04, mejor.qy + ny * carril * 1.04]);
        roto = true;
      }
    }
    if (!roto) break;
  }
  // apartar puntos uno a uno deja dientes de sierra, y aquí NO se alisa: se encauza. Alisar
  // redondea, y lo que redondea se come los ejes; encauzar deja el diente convertido en un
  // tramo con rumbo, que es lo que hay en las seis.
  for (let k = 0; k < trazos.length; k++) trazos[k] = encauza(trazos[k], errs[k], k, atrs[k]);

  // LA PÚA. Apartar puntos de uno en uno clava vértices que doblan más de 110°, y las seis
  // tienen el 1 % de esos. Una púa no es un giro: es un punto mal puesto, así que se quita. Lo
  // que el trazo pierde de recorrido lo recupera el recrecido, que es su trabajo.
  //
  // SE PASA EN LOS TRES SITIOS DONDE SE CLAVAN —el barrido de solape, el recrecido y el
  // acompañamiento—, porque cada uno mete las suyas: la sonda por fases decía 2 % después de
  // relajar, 25 % después del solape y 22 % después del recrecido. Pasarla una vez sola dejaba
  // la mitad puestas, y no se veían en ninguno de los quince rasgos que medía.
  const quitaPuas = () => {
    for (let vuelta = 0; vuelta < 6; vuelta++) {
      let quitada = false;
      for (let k = 0; k < trazos.length; k++) {
        const t = trazos[k];
        for (let i = 1; i < t.length - 1 && t.length > 3; i++) {
          const a1 = Math.atan2(t[i][1] - t[i - 1][1], t[i][0] - t[i - 1][0]);
          const a2 = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]);
          if (Math.abs(corto((a2 - a1) / RAD)) <= TOPE_VUELTA) continue;
          t.splice(i, 1); sols[k].splice(i, 1); atrs[k].splice(i, 1);
          if (errs[k].length > i) errs[k].splice(i, 1);
          quitada = true; i--;
        }
      }
      if (!quitada) break;
    }
  };
  quitaPuas();

  // Y el cruce sin justificar cede: los empujones no siempre convergen —apartar un vértice
  // puede crear el cruce un tramo más allá— y las seis no cruzan un solo par de centros.
  // SE RECORTA, NO SE BORRA: borrar el trazo entero se llevaba la mitad de la obra (n bajaba
  // de 10 a 4). Si no queda trazo que valga la pena, se recorta por el otro lado.
  const cruza = (k, i) => {
    const t = trazos[k];
    for (let j = 0; j < trazos.length; j++) {
      if (j === k) continue;
      for (let q = 0; q < trazos[j].length - 1; q++)
        if (segCorta(t[i], t[i + 1], trazos[j][q], trazos[j][q + 1])) return true;
    }
    return false;
  };
  for (let k = 0; k < trazos.length; k++) {
    for (let paso = 0; paso < 4; paso++) {
      const t = trazos[k];
      let corte = -1;
      for (let i = 0; i < t.length - 1; i++) {
        if (Math.max(sols[k][i], sols[k][i + 1]) >= SOL_UMBRAL) continue;
        if (cruza(k, i)) { corte = i; break; }
      }
      if (corte < 0) break;
      // el trozo largo se queda: el cruce parte el trazo en dos y sobrevive el que más dice
      const izq = corte + 1, der = t.length - corte - 1;
      trazos[k] = (izq >= der ? t.slice(0, izq) : t.slice(corte + 1));
      const rec = (izq >= der);
      sols[k] = rec ? sols[k].slice(0, izq) : sols[k].slice(corte + 1);
      atrs[k] = rec ? atrs[k].slice(0, izq) : atrs[k].slice(corte + 1);
      errs[k] = rec ? errs[k].slice(0, Math.max(0, izq - 1)) : errs[k].slice(corte + 1);
      if (trazos[k].length < 2) break;
    }
  }
  // RECRECER. El recorte se llevaba casi la mitad de la tinta —3,39 de las 6,4 sembradas—, y
  // un trazo cortado no es un trazo corto: es un trazo que dobla. Así que donde el cruce le
  // quitó recorrido, el trazo SIGUE, por un rumbo del alfabeto que no cruce a nadie. Es la
  // misma regla con la que nació, aplicada al cabo nuevo.
  const chocaTramo = (a, b, k) => {
    for (let j = 0; j < trazos.length; j++) {
      if (j === k) continue;
      for (let q = 0; q < trazos[j].length - 1; q++)
        if (segCorta(a, b, trazos[j][q], trazos[j][q + 1])) return true;
    }
    return false;
  };
  for (let k = 0; k < trazos.length; k++) {
    if (trazos[k].length < 2) continue;
    let falta = objetivo[k] - largoDe(trazos[k]);
    let vueltas = 0;
    while (falta > PASO * 0.5 && vueltas++ < 24) {
      const t = trazos[k], u = t[t.length - 1], w = t[t.length - 2];
      const desde = Math.atan2(u[1] - w[1], u[0] - w[0]) / RAD;
      // el cabo nuevo sigue el trazo: deriva su rumbo, y solo a veces hace esquina
      const cand = [];
      for (let g = -TOPE_GIRO; g <= TOPE_GIRO; g += TOPE_GIRO / 3) cand.push({ r: desde + g });
      // y el cabo nuevo tampoco se da la vuelta: `todos` lleva cada rumbo y su opuesto, y sin
      // tope el recrecido metía del 13 al 22 % de vueltas atrás — era la fuente principal
      for (const r of todos) {
        const d = Math.abs(corto(r - desde));
        if (d > 12 && d < TOPE_VUELTA) cand.push({ r });
      }
      const paso = Math.min(PASO * rng.range(0.72, 1.5), falta);
      // cuánto lleva doblado ya: sin este tope el trazo esquiva cruces enrollándose sobre sí
      // mismo y el cierre se va a 0,62 contra el 0,30 de las seis
      let vuelta = 0;
      for (let i = 1; i < t.length - 1; i++) {
        const a1 = Math.atan2(t[i][1] - t[i - 1][1], t[i][0] - t[i - 1][0]);
        const a2 = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]);
        let d = (a2 - a1) / RAD % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
        vuelta += d;
      }
      // EL CABO NUEVO ACOMPAÑA. Antes se pedía margen con todo el mundo y se elegía el giro
      // más corto: eso es huir, y el acompañamiento bajaba a 0,26. Ahora, entre los rumbos que
      // caben, gana el que deja el cabo A LA DISTANCIA DE CARRIL de algún trazo — que es lo
      // mismo que hace el campo, aplicado al trozo que el cruce se llevó.
      const opciones = [];
      for (const o of cand) {
        const ang = (o.r + ERR()) * RAD;
        const q = dentro([u[0] + Math.cos(ang) * paso, u[1] + Math.sin(ang) * paso]);
        if (hy(q[0] - u[0], q[1] - u[1]) < paso * 0.55) continue;   // ha rebotado: no vale
        if (chocaTramo(u, q, k)) continue;
        let cerca = Infinity;
        for (let j = 0; j < trazos.length; j++) {
          if (j === k) continue;
          const c = cercaDe(q, trazos[j]);
          if (c && c.d < cerca) cerca = c.d;
        }
        if (cerca < sep * 0.96) continue;                            // no cabe: hay margen
        let giroN = 0;
        {
          const a1 = Math.atan2(u[1] - w[1], u[0] - w[0]);
          const a2 = Math.atan2(q[1] - u[1], q[0] - u[0]);
          let d = (a2 - a1) / RAD % 360; if (d > 180) d -= 360; if (d < -180) d += 360;
          giroN = d;
        }
        if (Math.abs(vuelta + giroN) > 150) continue;                 // se estaría enrollando
        // el coste: lo que le falta para acompañar, más un peaje por doblar mucho
        const coste = Math.abs(cerca - carril) / carril + Math.abs(giroN) / 180 * 0.55;
        opciones.push({ q, coste });
      }
      opciones.sort((a, b) => a.coste - b.coste);
      let puesto = false;
      for (const o of opciones) {
        const q = o.q;
        t.push(q);
        sols[k].push(sols[k][sols[k].length - 1]);
        atrs[k].push(atrs[k][atrs[k].length - 1]);
        errs[k].push(ERR());
        falta -= hy(q[0] - u[0], q[1] - u[1]);
        puesto = true; break;
      }
      if (!puesto) break;
    }
  }

  for (let k = trazos.length - 1; k >= 0; k--) {
    if (trazos[k].length < 2 || largoDe(trazos[k]) < PASO * 1.2) {
      trazos.splice(k, 1); masas.splice(k, 1); sols.splice(k, 1); atrs.splice(k, 1);
      errs.splice(k, 1);
    }
  }

  // ── FASE 3. PARTIR PARA ACOMPAÑAR — Y VA AL FINAL ─────────────────────────────
  // Iba antes del encauzado y el encauzado lo deshacía: reconstruye la polilínea desde el
  // medio con los rumbos derivados, así que el tramo que acababa de quedarse pegado al vecino
  // se despegaba EN BLOQUE, y el acompañamiento bajaba de 0,43 a 0,27. El orden importa: esto
  // es lo último que se toca.
  //
  // Y ES UNA OFERTA, no una orden: cada acompañamiento se prueba y se acepta solo si no cruza
  // a nadie y no se come el margen. Si rompe algo, el trazo se queda como estaba. Un trazo que
  // acompaña rompiendo la regla de los centros no acompaña: estorba.
  const arcoDe = (t) => { const a = [0]; for (let i = 0; i < t.length - 1; i++)
    a.push(a[i] + hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1])); return a; };
  const muestra = (t, arc, s) => {
    const S = arc[arc.length - 1];
    s = s < 0 ? 0 : s > S ? S : s;
    let i = 0; while (i < t.length - 2 && arc[i + 1] < s) i++;
    const L = Math.max(1e-12, arc[i + 1] - arc[i]), u = (s - arc[i]) / L;
    const ex = (t[i + 1][0] - t[i][0]) / L, ey = (t[i + 1][1] - t[i][1]) / L;
    return { x: t[i][0] + (t[i + 1][0] - t[i][0]) * u,
             y: t[i][1] + (t[i + 1][1] - t[i][1]) * u, ex, ey };
  };
  const interp = (v, a, b, t) => v[a] + (v[b] - v[a]) * t;

  // UN TRAZO PUEDE ACOMPAÑAR VARIAS VECES. Él no dijo que fuera una: dijo que donde un punto
  // se atrae a otro trazo, ese trazo se parte. Eso pasa en todos los puntos donde pasa.
  const acompanado = trazos.map(t => t.map(() => false));
  let ofertas = 0, aceptadas = 0; const porQue = {cruce:0, margen:0, grapa:0};
  for (let k = 0; k < trazos.length; k++)
  for (let ronda = 0; ronda < RONDAS; ronda++) {
    const t = trazos[k];
    if (t.length < 3) continue;
    // ¿dónde se acerca más este trazo a otro, de lo que aún no acompaña? Ahí es donde la
    // atracción pide acompañamiento
    let anc = -1, ad = Infinity, aj = -1;
    for (let i = 1; i < t.length - 1; i++) {
      if (acompanado[k][i]) continue;
      let libre = true;
      for (let d = -1; d <= 1; d++) if (acompanado[k][i + d]) libre = false;
      if (!libre) continue;
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        const c = cercaDe(t[i], trazos[j]);
        if (c && c.d < ad) { ad = c.d; anc = i; aj = j; }
      }
    }
    if (anc < 0 || ad > carril * ALCANCE_ACOMP) continue;
    if (atrs[k][Math.min(anc, atrs[k].length - 1)] < UMBRAL_ACOMP) continue;
    ofertas++;

    const arc = arcoDe(trazos[aj]);
    const ca = cercaDe(t[anc], trazos[aj]);
    if (!ca) continue;
    // el arco del vecino donde cae el ancla
    let s0 = 0, dm = Infinity;
    for (let q = 0; q <= 240; q++) {
      const S = arc[arc.length - 1], sq = S * q / 240, m = muestra(trazos[aj], arc, sq);
      const d = hy(t[anc][0] - m.x, t[anc][1] - m.y);
      if (d < dm) { dm = d; s0 = sq; }
    }
    // el rumbo propio en el ancla, y el del vecino ahí: SI VAN MUY CRUZADOS NO SE ACOMPAÑA.
    // Forzar la paralela de dos trazos en T significa doblar noventa grados dos veces, y eso
    // no es acompañar: es una grapa.
    const m0 = muestra(trazos[aj], arc, s0);
    const mio = Math.atan2(t[Math.min(anc + 1, t.length - 1)][1] - t[anc - 1][1],
                           t[Math.min(anc + 1, t.length - 1)][0] - t[anc - 1][0]);
    const suyo = Math.atan2(m0.ey, m0.ex);
    const cruce = Math.abs(cortoPar((suyo - mio) / RAD));
    if (cruce > TOPE_CRUCE) continue;
    const sentido = Math.cos(suyo - mio) >= 0 ? 1 : -1;   // por dónde se anda el vecino
    // el lado lo fija EL ANCLA y no cada punto: si cada punto eligiera el suyo, el trazo se
    // cruzaría al vecino a media paralela
    let lx, ly;
    if (ca.d > 1e-9) { lx = (t[anc][0] - ca.qx) / ca.d; ly = (t[anc][1] - ca.qy) / ca.d; }
    else { lx = -m0.ey; ly = m0.ex; }

    // el largo del acompañamiento, EN ANCHURAS DE BANDA — la unidad en la que las seis
    // coinciden (0,44–0,58); en unidades de lado cada obra dice otra cosa
    const Lrun = W * rng.range(RUN_MIN, RUN_MAX);

    // PARTIR Y EMPALMAR. No se mezcla: SE EMPALMA. Mezclando —arrastrar cada punto de la
    // ventana hacia el carril— el trazo se comprime, se enrolla y aparecen cruces: el cierre se
    // iba a 0,61 y salía un cruce por obra, los primeros de toda la serie. Empalmando, el trazo
    // DEJA su camino en un punto, corre pegado al vecino el tramo que sea, y vuelve a
    // engancharse donde estaban sus puntos. Los dos codos —«cambia de rumbo hacia donde estaban
    // los puntos del trazo original»— son los dos empalmes, y no hay que dibujarlos.
    const dPto = Math.max(carril * 1.05, PASO * 0.34);
    const cuantos = Math.max(2, Math.round(Lrun / dPto));
    const carrilPts = [];
    for (let c2 = 0; c2 <= cuantos; c2++) {
      const s = s0 + sentido * (c2 / cuantos - 0.5) * Lrun;
      const m = muestra(trazos[aj], arc, s);
      // la normal es LA DEL VECINO EN CADA MUESTRA, con el signo del ancla: así el carril sigue
      // al vecino cuando dobla, en vez de despegarse
      let nx = -m.ey, ny = m.ex;
      if (nx * lx + ny * ly < 0) { nx = -nx; ny = -ny; }
      carrilPts.push(dentro([m.x + nx * carril, m.y + ny * carril]));
    }
    // EL CARRIL ES EL OFFSET DEL VECINO, no «su normal desplazada». En un doblez la paralela de
    // dentro corta la esquina y se acerca a la otra pata más que el carril: por eso la prueba
    // del margen tumbaba 91 de 222 propuestas. Se empuja cada punto hasta que su distancia REAL
    // al vecino sea la del carril — que es el mismo offset con el que el motor grande corta el
    // canal, donde el corte es la tinta engordada y no una banda más ancha.
    for (let v2 = 0; v2 < 5; v2++) {
      for (let i = 0; i < carrilPts.length; i++) {
        const c = cercaDe(carrilPts[i], trazos[aj]);
        if (!c || c.d >= carril * 0.999) continue;
        const ux = c.d > 1e-9 ? (carrilPts[i][0] - c.qx) / c.d : -m0.ey;
        const uy = c.d > 1e-9 ? (carrilPts[i][1] - c.qy) / c.d : m0.ex;
        carrilPts[i] = dentro([c.qx + ux * carril, c.qy + uy * carril]);
      }
    }
    // EL EMPALME SE BUSCA. Enganchar siempre en anc±1 hace que el codo de entrada cruce al
    // vecino una de cuatro veces; probando varios se encuentra el que entra limpio, y el trazo
    // vuelve «hacia donde estaban los puntos del trazo original» por donde puede.
    const limpio = (p, q) => {
      for (let j = 0; j < trazos.length; j++) {
        if (j === k) continue;
        for (let z = 0; z < trazos[j].length - 1; z++)
          if (segCorta(p, q, trazos[j][z], trazos[j][z + 1])) return false;
      }
      return true;
    };
    // Y SE BUSCA EL MÁS TANGENTE, no el primero que esté limpio. Cogiendo el primero, el codo
    // de entrada salía de noventa grados y el giro de la obra se iba a 68° contra los 32° de las
    // seis: acompañaba, pero grapando. El empalme que menos dobla es el que menos se nota, y un
    // empalme más cerrado que el tope no es un empalme, es una grapa: se rechaza la oferta.
    const codo = (p, q, r) => {
      const a1 = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const a2 = Math.atan2(r[1] - q[1], r[0] - q[0]);
      return Math.abs(corto((a2 - a1) / RAD));
    };
    let a0 = -1, b0 = -1, ca0 = Infinity, cb0 = Infinity;
    for (let d = 1; d <= 4; d++) {
      const i = anc - d;
      if (i < 1 || !limpio(t[i], carrilPts[0])) continue;
      const c = codo(t[i - 1], t[i], carrilPts[0]);
      if (c < ca0) { ca0 = c; a0 = i; }
    }
    const fin2 = carrilPts.length - 1;
    for (let d = 1; d <= 4; d++) {
      const i = anc + d;
      if (i > t.length - 2 || !limpio(carrilPts[fin2], t[i])) continue;
      const c = codo(carrilPts[Math.max(0, fin2 - 1)], carrilPts[fin2], t[i]);
      if (c < cb0) { cb0 = c; b0 = i; }
    }
    if (a0 < 0 || b0 < 0) continue;
    if (Math.max(ca0, cb0) > TOPE_EMPALME) { if (typeof process !== 'undefined' && process.env.HRRS_ACDBG) porQue.grapa++; continue; }
    const rec = [], recS = [], recA = [], recM = [];
    const sAt = (i) => sols[k][Math.min(i, sols[k].length - 1)];
    const aAt = (i) => atrs[k][Math.min(i, atrs[k].length - 1)];
    for (let i = 0; i <= a0; i++) { rec.push(t[i]); recS.push(sAt(i)); recA.push(aAt(i)); recM.push(acompanado[k][i]); }
    for (const p of carrilPts) { rec.push(p); recS.push(sAt(anc)); recA.push(aAt(anc)); recM.push(true); }
    for (let i = b0; i < t.length; i++) { rec.push(t[i]); recS.push(sAt(i)); recA.push(aAt(i)); recM.push(acompanado[k][i]); }
    if (rec.length < 3) continue;

    // LA PRUEBA. Ni un cruce nuevo, ni un margen comido: si el acompañamiento cuesta eso, no
    // se acompaña. Es la misma regla que gobierna todo lo demás, aplicada a la propuesta.
    let vale = true, vale2 = 'cruce';
    for (let i = 0; i < rec.length - 1 && vale; i++)
      for (let j = 0; j < trazos.length && vale; j++) {
        if (j === k) continue;
        for (let q = 0; q < trazos[j].length - 1; q++)
          if (segCorta(rec[i], rec[i + 1], trazos[j][q], trazos[j][q + 1])) { vale = false; break; }
      }
    // SE JUZGA LO QUE LA OFERTA INTRODUCE, no el trazo entero. Midiendo todo el trazo se
    // tumbaban 71 propuestas de 217 por puntos que ya estaban cerca ANTES —el ancla es por
    // definición el punto más próximo a otro trazo—, así que la prueba estaba castigando la
    // propuesta por el estado que venía a arreglar.
    if (vale) vale2 = 'margen';
    for (let i = 0; i < carrilPts.length && vale; i++)
      for (let j = 0; j < trazos.length && vale; j++) {
        if (j === k) continue;
        const c = cercaDe(carrilPts[i], trazos[j]);
        if (c && c.d < sep * 0.94) vale = false;
      }
    if (!vale) { if (typeof process !== 'undefined' && process.env.HRRS_ACDBG) porQue[vale2]++; continue; }
    trazos[k] = rec; sols[k] = recS; atrs[k] = recA; acompanado[k] = recM;
    errs[k] = rec.slice(0, rec.length - 1).map(() => 0);
    aceptadas++;
  }
  quitaPuas();
  if (typeof process !== 'undefined' && process.env.HRRS_ACDBG)
    console.error('ofertas=' + ofertas + ' ok=' + aceptadas + ' cruce=' + porQue.cruce + ' margen=' + porQue.margen + ' grapa=' + porQue.grapa);


  return { trazos, masas, fw, fh, W, sep, rumbos, tipo, fuerza, G, solMedia,
           polo: [0.5 * fw, 0.5 * fh], seed };
}

if (typeof module !== 'undefined') module.exports = { circuito, Rng };
