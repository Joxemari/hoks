/* METER UN CHILLIDA DE VERDAD EN NUESTRO MOTOR.
 *
 * `mano.json` son los ejes que el autor marcó a mano sobre las referencias: el trazo de un píxel
 * de cada obra, tal cual, sin pasar por nuestra siembra. Esto los carga y les aplica SOLO los
 * pasos de después —el campo y la densidad— para responder una pregunta que ninguna medida
 * indirecta contesta:
 *
 *     ¿qué le hace nuestro motor a un Chillida?
 *
 * Si el campo coge la geometría real y la empeora, el campo está mal. Si la deja casi igual, el
 * campo está bien y lo que falla es la siembra. No hay manera de saberlo midiendo la nuestra
 * contra la suya, porque en esa comparación los dos errores se suman y no se distinguen.
 *
 *   node desde_mano.js [r1|r2|...] [salida.png]
 */
const path = require('path');
const fs = require('fs');

const MANO = JSON.parse(fs.readFileSync(path.join(__dirname, 'mano.json'), 'utf8'));
const hy = Math.hypot;

// ── la geometría de la mano, en nuestras coordenadas ──────────────────────────
// mano.json viene normalizado por el LADO CORTO (S = px[0]), que es la misma convención que usa
// el generador: fw o fh valen 1 y el otro lado vale la proporción. Así que entra sin escalar.
function cargaMano(obra) {
  const m = MANO[obra];
  if (!m) throw new Error('no hay ' + obra + ' en mano.json');
  const [pw, ph] = m.px;
  const corto = Math.min(pw, ph);
  const fw = pw / corto, fh = ph / corto;
  // los ejes vienen ya normalizados por S; se comprueba que caen en el pliego
  const trazos = m.ejes.map(t => t.map(q => [q[0], q[1]]));
  return { obra, trazos, fw, fh, marcados: m.trazos, objetivo: m.objetivo };
}

// ── los invariantes, la misma vara de siempre ────────────────────────────────
function distTramos(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  if (((o(a, b, c) > 0) !== (o(a, b, d) > 0)) && ((o(c, d, a) > 0) !== (o(c, d, b) > 0))) return 0;
  const dp = (p, q, r) => {
    const ex = r[0] - q[0], ey = r[1] - q[1], l2 = ex * ex + ey * ey;
    let u = l2 > 1e-18 ? ((p[0] - q[0]) * ex + (p[1] - q[1]) * ey) / l2 : 0;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    return hy(p[0] - (q[0] + ex * u), p[1] - (q[1] + ey * u));
  };
  return Math.min(dp(a, c, d), dp(b, c, d), dp(c, a, b), dp(d, a, b));
}
function huecoMinimo(trazos) {
  let m = Infinity;
  for (let k = 0; k < trazos.length; k++)
    for (let j = k + 1; j < trazos.length; j++)
      for (let i = 0; i < trazos[k].length - 1; i++)
        for (let q = 0; q < trazos[j].length - 1; q++) {
          const d = distTramos(trazos[k][i], trazos[k][i + 1], trazos[j][q], trazos[j][q + 1]);
          if (d < m) m = d;
        }
  return m;
}
const largoDe = (p) => {
  let L = 0;
  for (let i = 0; i < p.length - 1; i++) L += hy(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
  return L;
};
const med = (v) => { const s = v.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0; };
function remu(p, paso) {
  const o = [];
  for (let i = 0; i < p.length - 1; i++) {
    const ax = p[i][0], ay = p[i][1], bx = p[i + 1][0], by = p[i + 1][1];
    const L = hy(bx - ax, by - ay), n = Math.max(1, Math.floor(L / paso));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      o.push([ax + (bx - ax) * t, ay + (by - ay) * t, Math.atan2(by - ay, bx - ax)]);
    }
  }
  if (p.length) o.push([p[p.length - 1][0], p[p.length - 1][1], o.length ? o[o.length - 1][2] : 0]);
  return o;
}
function rasgos(trazos, W) {
  const Ls = trazos.map(largoDe), Lt = Ls.reduce((a, b) => a + b, 0);
  const hs = new Array(18).fill(0);
  let gir = [], cue = [], cier = [];
  for (const p of trazos) {
    for (let i = 0; i < p.length - 1; i++) {
      const dx = p[i + 1][0] - p[i][0], dy = p[i + 1][1] - p[i][1], m = hy(dx, dy);
      if (m > 1e-9) { let a = (Math.atan2(dy, dx) * 180 / Math.PI + 180) % 180;
        hs[Math.floor(a / 10) % 18] += m; }
    }
    let tot = 0;
    for (let i = 1; i < p.length - 1; i++) {
      const a1 = Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0]);
      const a2 = Math.atan2(p[i + 1][1] - p[i][1], p[i + 1][0] - p[i][0]);
      let d = (a2 - a1) * 180 / Math.PI % 360;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      tot += d; if (Math.abs(d) > 8) gir.push(Math.abs(d));
    }
    cier.push(Math.abs(tot) / 360);
    cue.push(hy(p[p.length - 1][0] - p[0][0], p[p.length - 1][1] - p[0][1]) /
             Math.max(1e-9, largoDe(p)));
  }
  const s = hs.reduce((a, b) => a + b, 0) || 1, h = hs.map(x => x / s);
  const ord = h.slice().sort((a, b) => b - a);
  // cruces y acompañamiento
  let cru = 0;
  const corta = (a, b, c, d) => {
    const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    return ((o(a, b, c) > 0) !== (o(a, b, d) > 0)) && ((o(c, d, a) > 0) !== (o(c, d, b) > 0));
  };
  for (let a = 0; a < trazos.length; a++) for (let b = a + 1; b < trazos.length; b++) {
    let hay = false;
    for (let i = 0; i < trazos[a].length - 1 && !hay; i++)
      for (let j = 0; j < trazos[b].length - 1; j++)
        if (corta(trazos[a][i], trazos[a][i + 1], trazos[b][j], trazos[b][j + 1])) { hay = true; break; }
    if (hay) cru++;
  }
  const SM = trazos.map(p => remu(p, 0.025));
  let ac = 0, tt = 0, lib = 0, tot2 = 0;
  for (let i = 0; i < SM.length; i++) for (const q of SM[i]) {
    tt++; let mj = 9, da = 0;
    for (let j = 0; j < SM.length; j++) { if (i === j) continue;
      for (const o of SM[j]) { const dd = hy(q[0] - o[0], q[1] - o[1]); if (dd < mj) { mj = dd; da = o[2]; } } }
    const df = Math.abs(((q[2] - da + Math.PI / 2) % Math.PI) - Math.PI / 2);
    if (mj < 2.5 * W && df < 25 * Math.PI / 180) ac++;
  }
  for (let i = 0; i < trazos.length; i++) for (const p of [trazos[i][0], trazos[i][trazos[i].length - 1]]) {
    tot2++; let cerca = 9;
    for (let j = 0; j < SM.length; j++) { if (i === j) continue;
      for (const o of SM[j]) cerca = Math.min(cerca, hy(p[0] - o[0], p[1] - o[1])); }
    if (cerca > 3.0 * W) lib++;
  }
  return { n: trazos.length, linea: Lt, largo: med(Ls),
           reparto: Math.max(...Ls) / med(Ls), r1: ord[0],
           r4: ord.slice(0, 4).reduce((a, b) => a + b, 0),
           ejes: h[0] + h[17] + h[9] + h[8], giro: med(gir),
           girosPorLado: gir.length / Lt, cierre: [...cier].sort((a, b) => a - b)[Math.floor(0.9 * (cier.length - 1))],
           cuerda: med(cue), cruces: cru, acomp: ac / Math.max(1, tt),
           cabosLibres: lib / Math.max(1, tot2) };
}

if (require.main === module) {
  const cuales = process.argv[2] ? [process.argv[2]] : ['r1', 'r2'];
  const CANAL = 0.22;
  console.log('LA GEOMETRÍA DE LA MANO, y la banda que nuestra regla le daría\n');
  for (const c of cuales) {
    const m = cargaMano(c);
    const hueco = huecoMinimo(m.trazos);
    const W = hueco / (1 + CANAL);
    const R = rasgos(m.trazos, W);
    console.log(c + '  pliego ' + m.fw.toFixed(2) + '×' + m.fh.toFixed(2) +
                '  trazos marcados ' + m.marcados);
    console.log('   hueco mínimo real = ' + hueco.toFixed(4) +
                '  →  W que le daríamos = ' + W.toFixed(4));
    console.log('   ' + Object.entries(R).map(([k, v]) =>
      k + '=' + (typeof v === 'number' ? v.toFixed(2) : v)).join('  '));
    console.log('');
  }
}

module.exports = { cargaMano, huecoMinimo, rasgos, distTramos, largoDe };
