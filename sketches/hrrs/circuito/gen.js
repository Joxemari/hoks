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
  const sep = W * rng.range(1.14, 1.34);    // lo que dos centros se respetan
  const mg = W * 0.5 + 0.004;               // margen del pliego

  const n = rng.int(5, 13);
  // LA JERARQUÍA: el más largo mide 1,56 veces el mediano, no diez veces.
  const Lmed = rng.range(0.50, 0.82);
  const largos = [];
  for (let i = 0; i < n; i++) largos.push(Lmed * (i === 0 ? rng.range(1.4, 1.8) : rng.range(0.62, 1.25)));

  const PASO = 0.13;                         // un quiebro cada 0,13 de lado
  const trazos = [];
  // el rumbo del vecino en el sentido en que yo voy
  const dir0Aux = (rv, a2) => (a2 > 0 ? rv : rv + 180);

  // EL QUIEBRO ES CORTO: se va al rumbo de al lado, no al perpendicular. Es lo que da
  // los 32° de las referencias, y es también lo que hace que el trazo parezca uno solo
  // y no una escuadra detrás de otra.
  const todos = [];
  for (const r of rumbos) { todos.push(r); todos.push(r + 180); }
  const eligeRumbo = (desde) => {
    if (desde == null) {
      let u = rng.u(), acc = 0, k = 0;
      for (; k < rumbos.length; k++) { acc += pesoRumbo[k]; if (u <= acc) break; }
      return rumbos[Math.min(k, rumbos.length - 1)] + (rng.bool(0.5) ? 0 : 180);
    }
    const cand = todos
      .map(r => ({ r, d: Math.abs(((r - desde + 540) % 360) - 180) }))
      .filter(o => o.d > 12)
      .sort((a, b) => a.d - b.d);
    if (!cand.length) return desde;
    // el de al lado casi siempre; de vez en cuando dos casillas
    const i = rng.bool(0.72) ? 0 : Math.min(cand.length - 1, rng.int(1, 2));
    return cand[i].r;
  };
  // Y AL BORDEAR, SE PARALELIZA. Sin cruces, un trazo bloqueado tiene que rodear al
  // vecino; si al rodearlo toma SU rumbo, lo acompaña. Es de donde salen las paralelas
  // ahora que el cruce está prohibido.
  const rumboDe = (p) => {
    let dm = Infinity, dir = null;
    for (const t of trazos)
      for (let i = 0; i < t.length - 1; i++) {
        const d = distSeg(p, t[i], t[i + 1]);
        if (d < dm) { dm = d; dir = Math.atan2(t[i + 1][1] - t[i][1], t[i + 1][0] - t[i][0]) / RAD; }
      }
    return dm < sep * 3 ? dir : null;
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
      // DÓNDE NACE. Dos de cada tres cabos mueren cerca de otro trazo (0,32 al aire),
      // así que dos de cada tres nacen buscando a alguien: a un canal del cuerpo ya
      // puesto. El resto, con la gravedad del polo.
      let p;
      if (trazos.length && rng.bool(0.66)) {
        const o = rng.pick(trazos);
        const i = rng.int(0, o.length - 2);
        const f = rng.u();
        const q = [o[i][0] + (o[i + 1][0] - o[i][0]) * f, o[i][1] + (o[i + 1][1] - o[i][1]) * f];
        const nrm = Math.atan2(o[i + 1][1] - o[i][1], o[i + 1][0] - o[i][0]) + Math.PI / 2 * (rng.bool(0.5) ? 1 : -1);
        const d = sep * rng.range(1.0, 1.9);
        p = [q[0] + Math.cos(nrm) * d, q[1] + Math.sin(nrm) * d];
      } else {
        const a = rng.range(0, 6.2832), r = rng.range(0, 0.34);
        p = [polo[0] + Math.cos(a) * r * fw, polo[1] + Math.sin(a) * r * fh];
      }
      p = [Math.max(mg, Math.min(fw - mg, p[0])), Math.max(mg, Math.min(fh - mg, p[1]))];

      let dir = eligeRumbo(null);
      const pts = [p];
      let hecho = 0, atasco = 0;
      while (hecho < meta && atasco < 5) {
        const L = Math.min(PASO * rng.range(0.7, 1.5), meta - hecho);
        const q = [pts[pts.length - 1][0] + Math.cos(dir * RAD) * L,
                   pts[pts.length - 1][1] + Math.sin(dir * RAD) * L];
        if (cabe(pts[pts.length - 1], q, pts)) {
          pts.push(q); hecho += L; atasco = 0;
          // el quiebro: a otro rumbo del alfabeto, casi siempre al de al lado
          if (rng.bool(0.62)) dir = eligeRumbo(dir);
        } else {
          // BLOQUEADO: no se atraviesa, se BORDEA — y bordear tomando el rumbo del que
          // estorba es acompañarlo.
          const rv = rumboDe(pts[pts.length - 1]);
          if (rv != null && rng.bool(0.7)) {
            const a2 = ((rv - dir + 540) % 360) - 180;
            dir = eligeRumbo(null);
            let mejorD = Infinity, mejorR = dir;
            for (const r of todos) {
              const d = Math.abs(((r - (dir0Aux(rv, a2)) + 540) % 360) - 180);
              if (d < mejorD) { mejorD = d; mejorR = r; }
            }
            dir = mejorR;
          } else dir = eligeRumbo(dir);
          atasco++;
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
