// hrrs — UN TRAZO, y nada más.
//
// «El trazo me parece demasiado irregular porque no dibujas una línea, simplemente una línea con
// otra paralela, sin más, que tenga algo de curva. Definimos el trazo por un lado, o sea, vamos a
// dividir problemas.»
//
// Tiene razón en las dos cosas. Lo que el generador producía no era una línea con cuerpo: era un
// eje y dos bordes desplazados, y el carácter se le pedía al borde —que respirara, que temblara—
// cuando el carácter de un trazo está en SU RECORRIDO. Un borde irregular sobre un eje sin gesto
// da un trazo irregular, no un trazo con carácter.
//
// Así que aquí sólo vive el trazo, aparte de la composición, y se define por lo que un trazo tiene:
//
//   EL RECORRIDO   tiradas rectas unidas por esquinas, y sobre todas ellas UNA CURVA LARGA —el
//                  brazo pivota, no es un plóter—. Eso es lo que faltaba y lo que él pide: «que
//                  tenga algo de curva». La curva es del trazo entero, no de cada tramo: una
//                  deriva por tramo daba curvas de nivel, que ya se descartó midiendo.
//   LA ESQUINA     viva o redondeada, y con radio. Una esquina en ángulo perfecto es lo que más
//                  delata el vector.
//   EL CUERPO      la anchura, que no es constante: se abre y se cierra a lo largo del recorrido.
//   EL FILO        y encima, la desviación del borde. Medida SOBRE LAS FOTOS que el autor miró:
//                  r1 0,072 y r5 0,019 anchuras — casi lisas. Es la MÁS PEQUEÑA de las tres
//                  irregularidades y durante toda la familia se le pidió que fuera la única.
//
//                  (Aviso de dato: el 0,177 y el 0,117 que se citaron antes salían de la geometría
//                  trazada, que está en OTRO juego de archivos —`orig_*.npy` son las obras
//                  recortadas y `refs4/*` las fotos enteras— y los dos juegos NO se pueden
//                  emparejar: por contenido sólo casan dos de seis. Lo que el autor eligió lo
//                  eligió mirando las fotos, así que la medida que vale es la de las fotos.)
//   LOS CABOS      a escuadra, y con su ángulo: el remate no es perpendicular al eje por defecto.
'use strict';

const RAD = Math.PI / 180;
const hy = (a, b) => Math.hypot(a, b);
const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

function Rng(s) { this.s = (s >>> 0) || 1; }
Rng.prototype.u = function () {
  this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
  return this.s / 4294967296;
};
Rng.prototype.range = function (a, b) { return a + (b - a) * this.u(); };
Rng.prototype.int = function (a, b) { return a + Math.floor(this.u() * (b - a + 1)); };
Rng.prototype.bool = function (p) { return this.u() < p; };

// Los mandos del trazo, con lo que se ha medido en las referencias como valor de partida.
// Todo lo que mide longitud va EN ANCHURAS DE BANDA, que es la unidad en la que las seis se
// pueden comparar entre sí: sus bandas van de 0,032 a 0,089 del lado corto, casi el triple.
const POR_DEFECTO = {
  largo: 14,          // el recorrido, en anchuras de banda (r1..r6: de 6 a 18)
  tirada: [2.5, 6.5], // lo que dura una tirada recta, en anchuras
  curva: 0.22,        // LA CURVA LARGA del trazo entero, en radianes de giro total
  esquina: 55,        // el giro típico de una esquina, en grados
  radio: 0.55,        // el radio de la esquina, en anchuras (0 = viva)
  cuerpo: 0.28,       // cuánto se abre y se cierra la anchura a lo largo (fracción)
  filo: 0.07,         // la desviación del borde. Medida sobre las fotos: r1 0,072 · r5 0,019
  filoRapido: 0.30,   // cuánta parte del filo es rápida (el resto es ondulación lenta)
  cabo: 22,           // cuánto se inclina el remate respecto a la perpendicular, en grados
  remate: 'escuadra', // escuadra · sesgo · punta · redondo
  vibra: 0.07,        // LA VIBRACIÓN del eje, en anchuras. Oscila y VUELVE: no es deriva.
  vibraLam: 1.8,      // su longitud de onda, en anchuras
  viva: 0.45,         // qué parte de las esquinas son vivas; el resto van con radio
};

// ── EL RECORRIDO ──────────────────────────────────────────────────────────────
// Tiradas rectas, esquinas entre ellas, y LA CURVA repartida por todo el recorrido. La curva no
// se reparte por igual: se acumula, que es lo que hace un brazo — al principio del gesto va recto
// y al final está girado.
function recorrido(rng, P) {
  const pts = [[0, 0]];
  let dir = 0, hecho = 0;
  const tramos = [];
  while (hecho < P.largo) {
    const L = Math.min(P.largo - hecho, rng.range(P.tirada[0], P.tirada[1]));
    if (L < 0.4) break;
    tramos.push({ L, dir });
    hecho += L;
    // la esquina: un giro de verdad, con su signo y su tamaño
    const g = P.esquina * rng.range(0.65, 1.35) * (rng.bool(0.5) ? 1 : -1);
    dir += g;
  }
  if (!tramos.length) tramos.push({ L: P.largo, dir: 0 });
  // y encima, la curva larga: cada tramo gira un poco más que el anterior, siempre al mismo lado
  const signo = rng.bool(0.5) ? 1 : -1;
  const total = P.curva / RAD * signo;
  let acc = 0, s = 0;
  for (let i = 0; i < tramos.length; i++) {
    s += tramos[i].L;
    acc = total * (s / P.largo);
    tramos[i].dir += acc;
  }
  // se construye el recorrido, redondeando las esquinas si toca
  const salida = [[0, 0]];
  let p = [0, 0];
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i], a = t.dir * RAD;
    const fin = [p[0] + Math.cos(a) * t.L, p[1] + Math.sin(a) * t.L];
    // ¿esta esquina es viva o va con radio? «Combinan ángulos rectos con curvas.» No es una
    // propiedad del trazo, es de cada esquina: un trazo tiene de las dos.
    const estaViva = rng.bool(P.viva);
    if (P.radio > 0.01 && !estaViva && i < tramos.length - 1) {
      // la esquina redondeada: se corta el final del tramo y se pone un arco hasta el siguiente
      const b = tramos[i + 1].dir * RAD;
      const giro = corto((tramos[i + 1].dir - t.dir));
      const r = Math.min(P.radio, t.L * 0.4, tramos[i + 1].L * 0.4);
      const rec = r * Math.abs(Math.tan(giro * RAD / 2));
      const e1 = [fin[0] - Math.cos(a) * rec, fin[1] - Math.sin(a) * rec];
      salida.push(e1);
      const n = Math.max(2, Math.round(Math.abs(giro) / 12));
      for (let k = 1; k <= n; k++) {
        const u = k / n, ang = (t.dir + giro * u) * RAD;
        // se avanza sobre la cuerda del arco: no es el arco exacto y no hace falta que lo sea
        const q = salida[salida.length - 1];
        salida.push([q[0] + Math.cos(ang) * (2 * rec / n), q[1] + Math.sin(ang) * (2 * rec / n)]);
      }
      p = salida[salida.length - 1];
      // el resto del tramo siguiente se anda en la vuelta que viene
      tramos[i + 1].L = Math.max(0.4, tramos[i + 1].L - rec);
    } else {
      salida.push(fin);
      p = fin;
    }
  }
  return salida;
}

// ── EL CUERPO Y EL FILO ───────────────────────────────────────────────────────
// Dos irregularidades distintas y de tamaños distintos, y ahí estaba el error: se le pedía todo
// al filo. El CUERPO abre y cierra la anchura del trazo —es del gesto, y es la grande—; el FILO
// es el borde del corte, y es la pequeña. Y el filo lleva un tercio común a los dos lados (la
// banda engorda) y dos tercios propios de cada uno (el borde tiembla y el eje no se mueve), que
// es la correlación de +0,32 medida en las seis.
function octavas(rng, lams) {
  return lams.map(([lam, amp]) => ({ lam, amp, ph: rng.range(0, 6.2832) }));
}
const evalua = (oc, u) => oc.reduce((v, c) => v + c.amp * Math.sin(u / c.lam * 6.2832 + c.ph), 0);

// LA VIBRACIÓN. «Tienen curvas, pero no tienen nada de vibración, que es lo que un trazo un poco
// orgánico suele dar en la aplicación de la tinta en el papel.»
//
// Y aquí había una confusión mía de bulto: la DERIVA y la VIBRACIÓN no son lo mismo. La deriva
// acumula rumbo —cada paso gira un poco más— y curva la línea: eso daba curvas de nivel y se
// descartó midiendo. La vibración OSCILA Y VUELVE: desplaza el eje perpendicular a sí mismo, con
// media cero, así que el trazo va a donde iba pero no llega en línea recta. Yo quité la primera y
// nunca puse la segunda, y por eso ninguna de las seis físicas tenía vibración.
//
// Va sobre el eje y no sobre el filo: es la mano, no el corte.
function vibra(rng, eje, P) {
  if (!(P.vibra > 0.001)) return eje;
  const s = [0];
  for (let i = 0; i < eje.length - 1; i++)
    s.push(s[i] + hy(eje[i + 1][0] - eje[i][0], eje[i + 1][1] - eje[i][1]));
  const oc = octavas(rng, [[P.vibraLam, 0.62], [P.vibraLam * 0.42, 0.28], [P.vibraLam * 2.4, 0.34]]);
  const out = [];
  for (let i = 0; i < eje.length; i++) {
    const a = eje[Math.max(0, i - 1)], b = eje[Math.min(eje.length - 1, i + 1)];
    const d = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const v = P.vibra * evalua(oc, s[i]);
    out.push([eje[i][0] - Math.sin(d) * v, eje[i][1] + Math.cos(d) * v]);
  }
  return out;
}

function cuerpoYFilo(rng, eje, P) {
  // el recorrido, en anchuras acumuladas
  const s = [0];
  for (let i = 0; i < eje.length - 1; i++)
    s.push(s[i] + hy(eje[i + 1][0] - eje[i][0], eje[i + 1][1] - eje[i][1]));
  const L = s[s.length - 1] || 1;
  const ocCuerpo = octavas(rng, [[L * 0.55, 0.7], [L * 0.22, 0.3]]);
  const ocComun = octavas(rng, [[4.0, 0.66], [1.5, 0.27], [0.55, 0.07 * P.filoRapido / 0.3]]);
  const ocLado = [octavas(rng, [[4.0, 0.66], [1.5, 0.27], [0.55, 0.07 * P.filoRapido / 0.3]]),
                  octavas(rng, [[4.0, 0.66], [1.5, 0.27], [0.55, 0.07 * P.filoRapido / 0.3]])];
  const COMUN = 0.32;
  const semis = [];
  for (let i = 0; i < eje.length; i++) {
    const u = s[i];
    const cuerpo = 1 + P.cuerpo * evalua(ocCuerpo, u);
    const com = evalua(ocComun, u);
    const lado = [];
    for (const k of [0, 1]) {
      const f = P.filo * (COMUN * com + (1 - COMUN) * evalua(ocLado[k], u));
      lado.push(Math.max(0.12, 0.5 * cuerpo + f));
    }
    semis.push(lado);
  }
  return semis;
}

// ── EL CONTORNO ───────────────────────────────────────────────────────────────
// El borde de un lado hacia delante y el del otro hacia atrás. Los cabos van a escuadra —el
// remate de las referencias— pero NO perpendiculares al eje: se inclinan, que es lo que hace un
// corte. Un cabo perpendicular es la firma del vector.
function contorno(eje, semis, P) {
  const m = eje.length;
  if (m < 2) return [];
  const nor = (i) => {
    const a = eje[Math.max(0, i - 1)], b = eje[Math.min(m - 1, i + 1)];
    const d = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [-Math.sin(d), Math.cos(d)];
  };
  // LA CUÑA HACIA ADENTRO ES UN BUG, y es éste: en el interior de una curva la semianchura supera
  // el radio de curvatura, el borde se dobla sobre sí mismo y el relleno deja una muesca en pico.
  // Se recorta el borde de dentro al radio, que es el arreglo de siempre del offset de una
  // polilínea. El de fuera no tiene ese problema: ahí el offset se abre.
  const radioEn = (i) => {
    if (i === 0 || i === m - 1) return Infinity;
    const a = eje[i - 1], b = eje[i], c = eje[i + 1];
    const A = hy(b[0] - a[0], b[1] - a[1]), B = hy(c[0] - b[0], c[1] - b[1]);
    const C = hy(c[0] - a[0], c[1] - a[1]);
    const area2 = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    if (area2 < 1e-9) return Infinity;
    return (A * B * C) / area2;          // circunradio de los tres puntos
  };
  const ladoCurva = (i) => {
    if (i === 0 || i === m - 1) return 0;
    const a = eje[i - 1], b = eje[i], c = eje[i + 1];
    const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    return cr > 0 ? 1 : cr < 0 ? -1 : 0;   // +1 gira a la izquierda
  };
  const izq = [], der = [];
  for (let i = 0; i < m; i++) {
    const n = nor(i), sm0 = semis[Math.min(i, semis.length - 1)];
    const R = radioEn(i), gira = ladoCurva(i);
    const sm = [sm0[0], sm0[1]];
    // el borde de DENTRO de la curva es el del lado hacia el que gira
    if (isFinite(R)) {
      if (gira > 0) sm[0] = Math.min(sm[0], R * 0.88);
      else if (gira < 0) sm[1] = Math.min(sm[1], R * 0.88);
    }
    izq.push([eje[i][0] + n[0] * sm[0], eje[i][1] + n[1] * sm[0]]);
    der.push([eje[i][0] - n[0] * sm[1], eje[i][1] - n[1] * sm[1]]);
  }
  // ── EL REMATE ───────────────────────────────────────────────────────────────
  // Cuatro, porque «no me gusta la terminación de ninguno» y con un solo remate no hay nada que
  // elegir. Los cuatro salen de mirar los cabos de las seis: el 52 % llega de frente y el 48 %
  // muere en paralelo, así que el remate no puede ser siempre el mismo corte.
  //
  //   ESCUADRA  el corte perpendicular al eje. Es el más limpio y el que más delata el vector.
  //   SESGO     el corte inclinado: un borde acaba antes que el otro.
  //   PUNTA     los dos bordes se juntan: el trazo se afila y muere en un filo.
  //   REDONDO   el corte se cierra con un arco.
  const rem = (i, dirSg) => {
    const j = i === 0 ? 1 : m - 2;
    const d = Math.atan2(eje[i][1] - eje[j][1], eje[i][0] - eje[j][0]);   // hacia fuera
    const sm = semis[Math.min(i, semis.length - 1)];
    if (P.remate === 'punta') {
      // los dos bordes convergen en un punto un poco más allá del cabo
      const L = (sm[0] + sm[1]) * 0.5 * 0.9;
      const q = [eje[i][0] + Math.cos(d) * L, eje[i][1] + Math.sin(d) * L];
      izq[i] = [q[0], q[1]]; der[i] = [q[0], q[1]];
      return;
    }
    if (P.remate === 'redondo') {
      // se mete un arco: unos puntos entre los dos bordes, pasando por delante del cabo
      const n = 5, arco = [];
      const nrm = Math.atan2(izq[i][1] - der[i][1], izq[i][0] - der[i][0]);
      const R = (sm[0] + sm[1]) / 2;
      for (let k = 1; k < n; k++) {
        const a = nrm + (dirSg > 0 ? -1 : 1) * Math.PI * k / n;
        arco.push([eje[i][0] + Math.cos(a) * R, eje[i][1] + Math.sin(a) * R]);
      }
      (i === 0 ? tapaIni : tapaFin).push(...arco);
      return;
    }
    if (P.remate === 'sesgo' || P.cabo > 0.5) {
      const inc = Math.tan(P.cabo * RAD);
      izq[i][0] += Math.cos(d) * sm[0] * inc; izq[i][1] += Math.sin(d) * sm[0] * inc;
      der[i][0] -= Math.cos(d) * sm[1] * inc; der[i][1] -= Math.sin(d) * sm[1] * inc;
    }
  };
  const tapaIni = [], tapaFin = [];
  rem(0, -1); rem(m - 1, +1);
  return izq.concat(tapaFin, der.reverse(), tapaIni);
}

// ── UN TRAZO ──────────────────────────────────────────────────────────────────
function trazo(seed, opts) {
  const P = Object.assign({}, POR_DEFECTO, opts || {});
  const rng = new Rng(seed);
  // EL EJE SE REMUESTREA ANTES DE VIBRAR. Con un punto cada 0,7 anchuras y una onda de 1,8 no
  // caben ni tres muestras por ciclo: la vibración no se vería y el trazo saldría igual de recto.
  // Es el mismo error que ya apareció con el filo, que colgaba de cuatro vértices.
  const fino = (t, paso) => {
    const o = [t[0]];
    for (let i = 0; i < t.length - 1; i++) {
      const L = hy(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]);
      const n = Math.max(1, Math.round(L / paso));
      for (let k = 1; k <= n; k++)
        o.push([t[i][0] + (t[i + 1][0] - t[i][0]) * k / n,
                t[i][1] + (t[i + 1][1] - t[i][1]) * k / n]);
    }
    return o;
  };
  const eje = vibra(rng, fino(recorrido(rng, P), 0.22), P);
  const semis = cuerpoYFilo(rng, eje, P);
  return { eje, semis, contorno: contorno(eje, semis, P), P, seed };
}

if (typeof module !== 'undefined') module.exports = { trazo, POR_DEFECTO, Rng, contorno };
