// hrrs — EL CIRCUITO, en el orden que dicta el autor a mano:
//
//   1. DIBUJAR PRIMER TRAZO ......... y el dibujo son PUNTOS SUELTOS
//   2. UNIR PUNTOS
//   3. DIBUJAR OTROS TRAZOS, TAMBIÉN PARTIENDO DE SUS PUNTOS
//        · PARALELIZAR / SOLAPE
//        · ATRAER ↑↑
//   4. DAR CUERPO
//   5. REVISAR MÁRGENES
//
// Y el orden es el hallazgo, no un detalle de implementación. El generador anterior
// CAMINABA: paso a paso, comprobando en cada tramo si cabía, y girando cuando no. Por eso
// un trazo que entraba en un callejón moría ahí —nunca retrocede— y el largo se quedaba
// en 0,35 contra los 0,64 de las referencias, arrastrando a la línea (3,28 contra 5,21).
//
// Sembrando los puntos ANTES y uniéndolos después no hay callejón que valga: la longitud
// la ponen los puntos, no lo lejos que se consiga caminar.
//
// Y la ATRACCIÓN es el mecanismo que faltaba para el punto 5 del encargo —«cada punto del
// trazo lleva un valor y si tiende a solaparse»—: el valor no se evalúa andando, se aplica
// AL PUNTO cuando se coloca. Fuerte, cae encima; media, cae al canal; débil, se queda.
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
// el punto más cercano de un trazo, con su tangente: lo que hace falta para atraer
function masCerca(p, trazos) {
  let dm = Infinity, r = null;
  for (const t of trazos)
    for (let i = 0; i < t.length - 1; i++) {
      const ax = t[i][0], ay = t[i][1];
      const ex = t[i + 1][0] - ax, ey = t[i + 1][1] - ay, l2 = ex * ex + ey * ey;
      let u = l2 > 1e-18 ? ((p[0] - ax) * ex + (p[1] - ay) * ey) / l2 : 0;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const qx = ax + ex * u, qy = ay + ey * u, d = hy(p[0] - qx, p[1] - qy);
      if (d < dm) { dm = d; r = { d, qx, qy, dir: Math.atan2(ey, ex) / RAD }; }
    }
  return r;
}

function circuito(seed) {
  const rng = new Rng(seed);

  const prop = rng.range(1.02, 1.55), apais = rng.bool(0.5);
  const fw = apais ? prop : 1, fh = apais ? 1 : prop;

  // el alfabeto de rumbos: dos anclados al pliego -media longitud va sobre los ejes en
  // las referencias- y dos o cuatro oblicuos, con su error
  const gira = rng.range(-4, 4);
  const rumbos = [gira, gira + 90], pesoRumbo = [0.26, 0.26];
  const nObl = rng.int(2, 4);
  for (let i = 0; i < nObl; i++) {
    rumbos.push(gira + rng.range(20, 70) * (rng.bool(0.5) ? 1 : -1));
    pesoRumbo.push(0.48 / nObl);
  }
  const todos = [];
  for (const r of rumbos) { todos.push(r); todos.push(r + 180); }

  const polo = [rng.range(0.32, 0.68) * fw, rng.range(0.32, 0.68) * fh];

  // LA BANDA FINA PESA MÁS. No es un invariante de las seis —van de 0,025 a 0,096— es una
  // preferencia del autor, medida: de 24 obras que eligió sin ponerles ni una queja, la
  // anchura sale 0,05 contra 0,06 de la población (z = −0,79). Se anota como lo que es.
  const W = rng.range(0.028, 0.075);

  const TIPOS = {
    denso:   { n: [8, 14], sepK: [1.04, 1.18], atrae: [0.55, 0.85], solape: 0.10 },
    abierto: { n: [5, 8],  sepK: [1.30, 2.20], atrae: [0.22, 0.50], solape: 0.03 },
  };
  const tipo = rng.bool(0.62) ? 'denso' : 'abierto';
  const T = TIPOS[tipo];
  const sep = W * rng.range(T.sepK[0], T.sepK[1]);
  const carril = sep * 1.10;
  const mg = W * 0.5 + 0.004;
  const n = rng.int(T.n[0], T.n[1]);
  const fuerza = rng.range(T.atrae[0], T.atrae[1]);   // cuánto atrae ESTA obra

  const PASO = 0.105;              // entre punto y punto: la cadencia de quiebro
  const ERR_RUMBO = 7;

  const eligeRumbo = (desde) => {
    if (desde == null) {
      let u = rng.u(), acc = 0, k = 0;
      for (; k < rumbos.length; k++) { acc += pesoRumbo[k]; if (u <= acc) break; }
      return rumbos[Math.min(k, rumbos.length - 1)] + (rng.bool(0.5) ? 0 : 180)
             + rng.range(-ERR_RUMBO, ERR_RUMBO);
    }
    const cand = todos.map(r => ({ r, d: Math.abs(((r - desde + 540) % 360) - 180) }))
                      .filter(o => o.d > 12).sort((a, b) => a.d - b.d);
    if (!cand.length) return desde;
    const i = rng.bool(0.72) ? 0 : Math.min(cand.length - 1, rng.int(1, 2));
    return cand[i].r + rng.range(-ERR_RUMBO, ERR_RUMBO);
  };
  const dentro = p => [Math.max(mg, Math.min(fw - mg, p[0])),
                       Math.max(mg, Math.min(fh - mg, p[1]))];

  // ── 1 y 2. SEMBRAR LOS PUNTOS Y UNIRLOS ──────────────────────────────────────
  // Sin comprobar nada: los puntos se ponen y se unen. Lo que estorbe se arregla en el
  // paso 3 y en la reparación, no impidiendo que el trazo exista.
  function siembra(p0, dir0, largo) {
    const pts = [dentro(p0)];
    let dir = dir0, hecho = 0;
    while (hecho < largo) {
      const L = Math.min(PASO * rng.range(0.72, 1.5), largo - hecho);
      const q = pts[pts.length - 1];
      pts.push(dentro([q[0] + Math.cos(dir * RAD) * L, q[1] + Math.sin(dir * RAD) * L]));
      hecho += L;
      dir = eligeRumbo(dir);
    }
    return pts;
  }

  // ── 3. ATRAER: paralelizar, o solapar si la atracción es fuerte ───────────────
  function atrae(pts, trazos) {
    if (!trazos.length) return pts;
    return pts.map((p, i) => {
      const v = masCerca(p, trazos);
      if (!v || v.d > sep * 4.5) return p;              // demasiado lejos: no le llega
      // el valor DE ESTE PUNTO: si tiende a solaparse, cae encima; si no, al canal
      const solapa = rng.bool(T.solape);
      const meta = solapa ? 0 : carril;
      const f = fuerza * (i === 0 || i === pts.length - 1 ? 0.75 : 1);
      const nx = (p[0] - v.qx) / Math.max(1e-9, v.d), ny = (p[1] - v.qy) / Math.max(1e-9, v.d);
      const d2 = v.d + (meta - v.d) * f;
      return dentro([v.qx + nx * d2, v.qy + ny * d2]);
    });
  }

  // ── la reparación: sin cruces, y sin rendijas ───────────────────────────────────
  // Las referencias no cruzan un solo par de centros en 220 posibles, así que un cruce se
  // repara APARTANDO EL PUNTO, no truncando el trazo: la longitud ya está decidida.
  function repara(pts, trazos) {
    for (let vuelta = 0; vuelta < 5; vuelta++) {
      let mal = false;
      for (let i = 0; i < pts.length - 1; i++) {
        let choca = null;
        for (const t of trazos)
          for (let j = 0; j < t.length - 1; j++) {
            const d = segSeg(pts[i], pts[i + 1], t[j], t[j + 1]);
            if (d < sep) { choca = masCerca(pts[i + 1], [t]); break; }
          }
        if (!choca) continue;
        mal = true;
        // se empuja el vértice hacia fuera hasta el canal
        const nx = (pts[i + 1][0] - choca.qx) / Math.max(1e-9, choca.d);
        const ny = (pts[i + 1][1] - choca.qy) / Math.max(1e-9, choca.d);
        pts[i + 1] = dentro([choca.qx + nx * carril * 1.06, choca.qy + ny * carril * 1.06]);
      }
      if (!mal) break;
    }
    // y si algo sigue cruzando, se recorta ahí: es la última salida, no la primera
    for (let i = 0; i < pts.length - 1; i++)
      for (const t of trazos)
        for (let j = 0; j < t.length - 1; j++)
          if (segCorta(pts[i], pts[i + 1], t[j], t[j + 1])) return pts.slice(0, i + 1);
    return pts;
  }

  const trazos = [];
  const Lmed = rng.range(0.52, 0.86);
  for (let k = 0; k < n; k++) {
    const largo = Lmed * (k === 0 ? rng.range(1.4, 1.8) : rng.range(0.62, 1.25));
    let mejor = null;
    for (let intento = 0; intento < 8 && !mejor; intento++) {
      // de dónde arranca: casi siempre junto al cuerpo ya puesto —dos de cada tres cabos
      // de las referencias mueren contra otro trazo— y si no, con la gravedad del polo
      let p0, dir0;
      if (trazos.length && rng.bool(0.72)) {
        const padre = rng.bool(0.66) ? trazos[trazos.length - 1] : rng.pick(trazos);
        const i = rng.int(0, padre.length - 2), f = rng.u();
        const q = [padre[i][0] + (padre[i + 1][0] - padre[i][0]) * f,
                   padre[i][1] + (padre[i + 1][1] - padre[i][1]) * f];
        const pd = Math.atan2(padre[i + 1][1] - padre[i][1], padre[i + 1][0] - padre[i][0]);
        const lado = rng.bool(0.5) ? 1 : -1;
        p0 = [q[0] + Math.cos(pd + Math.PI / 2 * lado) * carril,
              q[1] + Math.sin(pd + Math.PI / 2 * lado) * carril];
        dir0 = pd / RAD + (rng.bool(0.5) ? 0 : 180);
      } else {
        const a = rng.range(0, 6.2832), r = rng.range(0, 0.34);
        p0 = [polo[0] + Math.cos(a) * r * fw, polo[1] + Math.sin(a) * r * fh];
        dir0 = eligeRumbo(null);
      }
      let pts = siembra(p0, dir0, largo);
      pts = atrae(pts, trazos);
      pts = repara(pts, trazos);
      let L = 0;
      for (let i = 0; i < pts.length - 1; i++) L += hy(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      if (pts.length >= 2 && L > 0.18) mejor = pts;
    }
    if (mejor) trazos.push(mejor);
  }
  return { trazos, fw, fh, W, sep, polo, rumbos, tipo, fuerza, seed };
}

if (typeof module !== 'undefined') module.exports = { circuito, Rng };
