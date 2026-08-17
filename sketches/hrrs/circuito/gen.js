// hrrs — EL CIRCUITO. Sólo los centros: la línea fina de la que cuelga todo lo demás.
//
// Los invariantes salen de los seis circuitos que el autor marcó a mano, y hay uno que
// manda sobre los demás:
//
//   LOS CENTROS NO SE CRUZAN. Un cruce en 220 pares posibles, en las seis. El motor
//   llevaba nueve vueltas construyendo cruces —`cruceEntero`, `SOLAPE_MIN`, el halo que
//   los separa— y peleando por conseguir paralelas. Prohibido el cruce, las paralelas
//   salen solas: un trazo que no puede atravesar al vecino lo bordea, y bordear a un
//   canal de distancia ES acompañar.
//
//   Y MEDIA LONGITUD VA SOBRE LOS EJES DEL CUADRO (0,52). Chillida ancla el circuito al
//   pliego. El motor sorteaba una diagonal cualquiera y evitaba a propósito alinearse con
//   el papel — decisión contraria a la fuente.
//
// Objetivos medidos (mediana de las seis):
//   n 7,5 · largo 0,64 · reparto 1,56 · línea 5,21 · ejes 0,52 · r1 0,24 · r4 0,60
//   giro 32° · giros por lado 7,55 · cierre 0,30 · cuerda 0,76 · polo 0,41
//   cruces 0 · acompañado 0,32 · cabos al aire 0,32
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
function distSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  let t = l2 > 1e-18 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return hy(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t));
}
function segSeg(a, b, c, d) {
  if (segCorta(a, b, c, d)) return 0;
  return Math.min(distSeg(a, c, d), distSeg(b, c, d), distSeg(c, a, b), distSeg(d, a, b));
}

function circuito(seed) {
  const rng = new Rng(seed);

  // EL PLIEGO. Las seis van de 1,03 a 1,52; ninguna es cuadrada del todo.
  const prop = rng.range(1.02, 1.55), apais = rng.bool(0.5);
  const fw = apais ? prop : 1, fh = apais ? 1 : prop;

  // EL ALFABETO. Dos rumbos anclados al pliego y uno o dos oblicuos: es lo que da a la
  // vez `ejes 0,52` (la mitad de la longitud en horizontal y vertical) y `r4 0,60`
  // (repartida entre pocas direcciones). El giro del ancla es pequeño a propósito: la
  // obra está alineada con el papel, no girada.
  const gira = rng.range(-4, 4);
  // Con sólo dos anclas y un oblicuo, todo quiebro salía de 90°: medido, giro 90 contra
  // los 32 de las referencias, y toda la longitud en cuatro casillas (r4 = 1,00 contra
  // 0,60). El alfabeto tiene que ser FINO —rumbos cada ~30°— y los ejes pesados: así
  // salen a la vez el giro corto y la mitad de la longitud sobre el pliego.
  const rumbos = [gira, gira + 90], pesoRumbo = [0.26, 0.26];
  const nObl = rng.int(2, 4);
  for (let i = 0; i < nObl; i++) {
    rumbos.push(gira + rng.range(20, 70) * (rng.bool(0.5) ? 1 : -1));
    pesoRumbo.push(0.48 / nObl);
  }

  // EL POLO. El 41 % de la línea cae en un disco de radio 0,25: hay un sitio donde la
  // obra se aprieta, y no es el centro geométrico.
  const polo = [rng.range(0.32, 0.68) * fw, rng.range(0.32, 0.68) * fh];

  const W = rng.range(0.030, 0.092);        // la anchura que tendrá la banda

  // EL TIPO DE OBRA, y es lo que faltaba. Del autor: «hay que dibujar UN trazo y, sobre
  // él, empezar a hacer otros trazos que tendrán diferentes características. Si es
  // denso, habrá que empezar por alguna paralela cerca; si son abiertos, pues abiertos
  // y scattered».
  //
  // O sea que la obra no es una colección de trazos que se estorban: es UN trazo y una
  // manera de responderle, y esa manera es de la obra entera. El generador anterior
  // dejaba a cada trazo a su aire después de nacer, y sus notas lo cantaron: nueve de
  // quince decían que la composición general se lee, y trece que la relación entre
  // trazos no existe — ocho lo decían a la vez.
  const TIPOS = {
    denso:   { n: [8, 14], sepK: [1.04, 1.18],
               w: { paralela: 0.62, prolonga: 0.13, apoya: 0.20, suelta: 0.05 } },
    abierto: { n: [5, 8],  sepK: [1.30, 2.20],
               w: { paralela: 0.34, prolonga: 0.20, apoya: 0.16, suelta: 0.30 } },
  };
  const tipo = rng.bool(0.55) ? 'denso' : 'abierto';
  const T = TIPOS[tipo];
  const sep = W * rng.range(T.sepK[0], T.sepK[1]);
  // LA CONSIGNA NO ES `sep`, ES UN PELO MÁS. `cabe` rechaza cualquier tramo a menos de
  // `sep`, así que un servo que apunta a `sep` exactos vive sobre la línea prohibida:
  // el primer temblor lo tira fuera y la paralela muere al nacer. Se apunta por encima.
  const carril = sep * 1.10;
  const mg = W * 0.5 + 0.004;               // margen del pliego
  const relaciones = Object.keys(T.w);
  const eligeRel = () => {
    let u = rng.u(), acc = 0;
    for (const r of relaciones) { acc += T.w[r]; if (u <= acc) return r; }
    return 'paralela';
  };

  const n = rng.int(T.n[0], T.n[1]);
  // LA JERARQUÍA: el más largo mide 1,56 veces el mediano, no diez veces.
  const Lmed = rng.range(0.50, 0.82);
  const largos = [];
  for (let i = 0; i < n; i++) largos.push(Lmed * (i === 0 ? rng.range(1.4, 1.8) : rng.range(0.62, 1.25)));

  // 7,55 quiebros por lado de longitud: un tramo cada 0,13 daba 3,60. La cadencia es
  // del material y se mide, no se elige.
  const PASO = 0.085;
  const ERR_RUMBO = 7;                       // grados de holgura sobre el alfabeto
  const P_QUIEBRO = 0.82;
  const P_ENGANCHA = 0.55;                   // por paso, cuánto tarda en dejarse llevar
  const P_SUELTA = 0.09;                     // por paso, cuánto dura el carril
  const trazos = [];

  // EL QUIEBRO ES CORTO: se va al rumbo de al lado, no al perpendicular. Es lo que da
  // los 32° de las referencias, y es también lo que hace que el trazo parezca uno solo
  // y no una escuadra detrás de otra.
  const todos = [];
  for (const r of rumbos) { todos.push(r); todos.push(r + 180); }
  const eligeRumbo = (desde) => {
    if (desde == null) {
      let u = rng.u(), acc = 0, k = 0;
      for (; k < rumbos.length; k++) { acc += pesoRumbo[k]; if (u <= acc) break; }
      return rumbos[Math.min(k, rumbos.length - 1)] + (rng.bool(0.5) ? 0 : 180)
             + rng.range(-ERR_RUMBO, ERR_RUMBO);
    }
    const cand = todos
      .map(r => ({ r, d: Math.abs(((r - desde + 540) % 360) - 180) }))
      .filter(o => o.d > 12)
      .sort((a, b) => a.d - b.d);
    if (!cand.length) return desde;
    // el de al lado casi siempre; de vez en cuando dos casillas
    const i = rng.bool(0.72) ? 0 : Math.min(cand.length - 1, rng.int(1, 2));
    // con su error: sin el, toda la longitud cae en cuatro casillas de direccion
    // (r4 = 0,98 contra 0,60 de las referencias). El alfabeto se respeta, no se calca.
    return cand[i].r + rng.range(-ERR_RUMBO, ERR_RUMBO);
  };
  // EL CARRIL. `sep` era un SUELO que nadie buscaba: los trazos sólo se acercaban al
  // chocar, y el acompañamiento medía 0,01 contra el 0,32 de las referencias. Un suelo
  // no es una consigna. Aquí el trazo, cuando pasa cerca de otro y va más o menos en su
  // sentido, se ENGANCHA: copia su rumbo local y corrige hacia la distancia `sep`. Sin
  // cruces esto no tiene con qué pelearse — que es lo que lo hace posible.
  const vecinoEn = (p) => {
    let dm = Infinity, dir = 0, qx = 0, qy = 0, hay = false;
    for (const t of trazos)
      for (let i = 0; i < t.length - 1; i++) {
        const d = distSeg(p, t[i], t[i + 1]);
        if (d < dm) {
          dm = d; hay = true;
          dir = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) / RAD;
          const ex = t[i + 1][0] - t[i][0], ey = t[i + 1][1] - t[i][1], l2 = ex * ex + ey * ey;
          let u = l2 > 1e-18 ? ((p[0] - t[i][0]) * ex + (p[1] - t[i][1]) * ey) / l2 : 0;
          u = u < 0 ? 0 : u > 1 ? 1 : u;
          qx = t[i][0] + ex * u; qy = t[i][1] + ey * u;
        }
      }
    return hay ? { d: dm, dir, qx, qy } : null;
  };

  // ¿cabe este tramo? Ni cruza a nadie ni se le acerca más que `sep`; y tampoco a sí
  // mismo, que es lo que impide que el trazo se enrolle.
  const cabe = (a, b, mios) => {
    if (a[0] < mg || a[0] > fw - mg || a[1] < mg || a[1] > fh - mg) return false;
    if (b[0] < mg || b[0] > fw - mg || b[1] < mg || b[1] > fh - mg) return false;
    for (const t of trazos)
      for (let i = 0; i < t.length - 1; i++)
        if (segSeg(a, b, t[i], t[i + 1]) < sep) return false;
    for (let i = 0; i < mios.length - 2; i++)
      if (segSeg(a, b, mios[i], mios[i + 1]) < sep * 0.92) return false;
    return true;
  };

  for (let k = 0; k < n; k++) {
    const meta = largos[k];
    let mejor = null;
    for (let intento = 0; intento < 40 && !mejor; intento++) {
      // NACE SOBRE OTRO, Y CON UNA RELACIÓN DECLARADA. Antes nacía «cerca de alguien»
      // y se iba a su aire: el acompañamiento salía por casualidad, 0,27 contra 0,52.
      // Ahora la paralela nace EN SU CARRIL —a `sep` exactos, en la dirección del
      // padre— y sale enganchada; el carril no hay que encontrarlo, se hereda.
      const rel = trazos.length ? eligeRel() : 'suelta';
      let p, dir = null, carrilIni = false;
      // el padre: casi siempre el último puesto, que es como se forma un haz
      const padre = trazos.length
        ? (rng.bool(0.66) ? trazos[trazos.length - 1] : rng.pick(trazos)) : null;

      if (padre && (rel === 'paralela')) {
        const i = rng.int(0, padre.length - 2);
        const f = rng.u();
        const q = [padre[i][0] + (padre[i + 1][0] - padre[i][0]) * f,
                   padre[i][1] + (padre[i + 1][1] - padre[i][1]) * f];
        const pd = Math.atan2(padre[i + 1][1] - padre[i][1], padre[i + 1][0] - padre[i][0]);
        const lado = rng.bool(0.5) ? 1 : -1;
        const d = carril * rng.range(1.0, 1.10);
        p = [q[0] + Math.cos(pd + Math.PI / 2 * lado) * d,
             q[1] + Math.sin(pd + Math.PI / 2 * lado) * d];
        dir = pd / RAD + (rng.bool(0.5) ? 0 : 180);
        carrilIni = true;
      } else if (padre && rel === 'prolonga') {
        // sigue por donde el padre acaba, a un canal: dos trazos que el ojo lee como uno
        const alFin = rng.bool(0.5);
        const q = alFin ? padre[padre.length - 1] : padre[0];
        const q2 = alFin ? padre[padre.length - 2] : padre[1];
        const pd = Math.atan2(q[1] - q2[1], q[0] - q2[0]);
        p = [q[0] + Math.cos(pd) * sep * 1.25, q[1] + Math.sin(pd) * sep * 1.25];
        dir = eligeRumbo(pd / RAD);
      } else if (padre && rel === 'apoya') {
        // nace a un canal del cuerpo y se va: es el cabo que muere contra otro trazo
        const i = rng.int(0, padre.length - 2);
        const f = rng.u();
        const q = [padre[i][0] + (padre[i + 1][0] - padre[i][0]) * f,
                   padre[i][1] + (padre[i + 1][1] - padre[i][1]) * f];
        const nrm = Math.atan2(padre[i + 1][1] - padre[i][1], padre[i + 1][0] - padre[i][0])
                    + Math.PI / 2 * (rng.bool(0.5) ? 1 : -1);
        p = [q[0] + Math.cos(nrm) * sep * 1.05, q[1] + Math.sin(nrm) * sep * 1.05];
        dir = eligeRumbo(nrm / RAD);
      } else {
        const a = rng.range(0, 6.2832), r = rng.range(0, 0.34);
        p = [polo[0] + Math.cos(a) * r * fw, polo[1] + Math.sin(a) * r * fh];
      }
      p = [Math.max(mg, Math.min(fw - mg, p[0])), Math.max(mg, Math.min(fh - mg, p[1]))];
      if (dir == null) dir = eligeRumbo(null);
      const pts = [p];
      let hecho = 0, atasco = 0, enCarril = carrilIni;
      // una paralela declarada aguanta el carril: es su razón de existir
      const pSuelta = carrilIni ? P_SUELTA * 0.34 : P_SUELTA;
      while (hecho < meta && atasco < 6) {
        const act = pts[pts.length - 1];
        const v = vecinoEn(act);
        // ¿engancha, sigue, o suelta?
        if (enCarril && (!v || v.d > sep * 3.2 || rng.bool(pSuelta))) enCarril = false;
        if (!enCarril && v && v.d < sep * 2.6) {
          let dd = Math.abs(((v.dir - dir + 540) % 360) - 180);
          if (dd > 90) dd = 180 - dd;
          if (dd < 42 && rng.bool(P_ENGANCHA)) enCarril = true;
        }
        if (enCarril && v) {
          // su rumbo, en mi sentido, corregido hacia la consigna `sep`
          let base = v.dir;
          if (Math.abs(((base - dir + 540) % 360) - 180) > 90) base += 180;
          const nx = (act[0] - v.qx) / Math.max(1e-9, v.d), ny = (act[1] - v.qy) / Math.max(1e-9, v.d);
          const cruz = Math.cos(base * RAD) * ny - Math.sin(base * RAD) * nx;
          const err = (v.d - carril) / sep;
          dir = base + Math.max(-32, Math.min(32, err * 46)) * (cruz > 0 ? -1 : 1);
        }
        const L = Math.min(PASO * rng.range(0.7, 1.5), meta - hecho);
        const q = [act[0] + Math.cos(dir * RAD) * L, act[1] + Math.sin(dir * RAD) * L];
        if (cabe(act, q, pts)) {
          pts.push(q); hecho += L; atasco = 0;
          if (!enCarril && rng.bool(P_QUIEBRO)) dir = eligeRumbo(dir);
        } else {
          // BLOQUEADO: no se atraviesa, se BORDEA.
          enCarril = false; dir = eligeRumbo(dir); atasco++;
        }
      }
      // EL CABO MUERE BUSCANDO. Dos de cada tres cabos de las referencias caen junto a
      // otro trazo (0,32 al aire); nacían buscando y morían donde les pillara, y salía
      // 0,70. Si el final quedó al aire y hay alguien a tiro, se recorta hasta el último
      // punto que sí tenía vecino: el trazo acaba CONTRA el cuerpo, que es lo que hace
      // que la hoja se lea como una cosa.
      if (pts.length > 2) {
        const fin = vecinoEn(pts[pts.length - 1]);
        if (!fin || fin.d > sep * 3.5) {
          for (let i = pts.length - 2; i >= 2; i--) {
            const w = vecinoEn(pts[i]);
            if (w && w.d < sep * 2.2) { pts.length = i + 1; break; }
          }
        }
      }
      let Lr = 0;
      for (let i = 0; i < pts.length - 1; i++) Lr += hy(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      if (pts.length >= 2 && Lr > meta * 0.34 && Lr > 0.16) mejor = pts;
    }
    if (mejor) trazos.push(mejor);
  }
  return { trazos, fw, fh, W, sep, polo, rumbos, seed };
}

if (typeof module !== 'undefined') module.exports = { circuito, Rng };
