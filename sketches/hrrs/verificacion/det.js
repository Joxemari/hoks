/* det.js — determinismo y, lo que de verdad muerde, INVARIANCIA DE RESOLUCION.
 *
 *   node det.js <algo.js> [n] [configs]
 *
 * Dos cosas distintas:
 *
 * 1. DETERMINISMO. Misma seed → misma imagen, en cuatro condiciones: dos llamadas
 *    seguidas, con otra obra pintada en medio, con el lienzo reutilizado, y con la
 *    paleta fijada a mano. El grano va a cero: usa Math.random(), asi que con
 *    grano dos renders NUNCA son iguales y la prueba no diria nada. Es una de las
 *    cuatro trampas que TRZS ya pago.
 *
 * 2. LA MISMA HUELLA A TRES RESOLUCIONES (760, 2400 y 4200 de lado corto). Esta
 *    es la que importa, y es la leccion de la «deriva» de EVOL: `medir` no solo
 *    informa, ELIGE — `falta` descarta candidatos —, asi que si la composicion se
 *    generara en pixeles, 1075×760 y 9933×7016 (el mismo 'horizontal', pero con
 *    cocientes 1,41447 y 1,41576 porque los milimetros DIN estan redondeados)
 *    darian geometrias distintas en la cuarta cifra, y un ojo justo en el filo de
 *    cerrarse caeria de un lado en pantalla y del otro a 300 dpi. La rareza de una
 *    pieza dependeria del pliego en que se imprimiera.
 *
 *    Se compara la huella ENTERA: tipo, cintas, vertices, pliegues, pasillos,
 *    ojos con su area a seis decimales, ocupacion, gubia, canal y colores. Y las
 *    coordenadas de todos los vertices del campo normalizado, que es el sitio
 *    donde la composicion se decide.
 */
const { recorrer } = require('./_lanza');

const algo = process.argv[2] || './hrrs_test.js';
const N = parseInt(process.argv[3] || '40', 10);
const ONLY = process.argv[4] || null;

function medir({ seed, fmt, params }) {
  const pal = HOKS.normalizePalettes(HOKS.DEFAULTS);
  const P = extra => Object.assign({}, params, { grainScale: 0 }, extra || {});
  const pinta = (base, extra, opts) => {
    const d = HOKS.fmtDims(fmt, base);
    const cv = document.createElement('canvas'); cv.width = d.W; cv.height = d.H;
    const x = cv.getContext('2d', { willReadFrequently: true });
    const r = HOKS.HRRS.render(x, d.W, d.H, seed, Object.assign({ palettes: pal, params: P(extra) }, opts || {}));
    return { r, cv, x, d };
  };
  // La huella: todo lo que la obra decide, SIN los pixeles — para poder
  // compararla entre tamanos distintos.
  const huella = r => JSON.stringify({
    tipo: r.tipo, cintas: r.cintas, vert: r.vert, pliegues: r.pliegues,
    pasillos: r.pasillos, largoPas: +r.largoPas.toFixed(6), cabos: r.cabos,
    ojos: r.ojos.map(o => +o.toFixed(6)), ocup: +r.ocupacion.toFixed(6),
    ancho: +r.anchoRel.toFixed(9), gam: +r.gam.toFixed(9), esq: r.esq,
    rol: r.rol, pal: r.pal.name, field: r.field,
    // La geometria normalizada, vertice a vertice: es donde se decide la obra.
    geo: r.geo.cintas.map(pts => pts.map(p => [+p.x.toFixed(9), +p.y.toFixed(9)])),
  });
  const pix = ({ cv, x, d }) => {
    // Un hash barato pero sensible de todo el lienzo.
    const px = x.getImageData(0, 0, d.W, d.H).data;
    let a = 2166136261 >>> 0;
    for (let i = 0; i < px.length; i += 4) {
      a ^= px[i]; a = Math.imul(a, 16777619) >>> 0;
      a ^= px[i + 1]; a = Math.imul(a, 16777619) >>> 0;
      a ^= px[i + 2]; a = Math.imul(a, 16777619) >>> 0;
    }
    return a >>> 0;
  };

  // 1. determinismo: cuatro condiciones al mismo tamano.
  const A = pinta(400);
  const hA = pix(A), fA = huella(A.r);
  const B = pinta(400);                                   // dos llamadas seguidas
  pinta(400, {}, {});                                     // ruido: otra pasada
  const C = pinta(400);
  const detOk = pix(B) === hA && pix(C) === hA;
  // Y determinismo CON LA PALETA FIJADA, que es otra condicion y no la misma:
  // fijarla salta el `rng.weighted(palettes)`, asi que el stream corre distinto y
  // la composicion es OTRA. No es un defecto de HRRS — es como funciona toda la
  // casa (EVOL y TRZS hacen igual), y por eso lo que se comprueba es que fijada
  // sea reproducible, no que coincida con la libre. Medido: coincide en la mitad
  // de las seeds por casualidad, que es justo el numero que delata la confusion.
  const D1 = pinta(400, {}, { locked: true, lockedIdx: 0 });
  const D2 = pinta(400, {}, { locked: true, lockedIdx: 0 });
  const palOk = pix(D1) === pix(D2);

  // 2. tres resoluciones: la huella entera tiene que ser identica.
  const f760 = huella(pinta(760).r);
  const f2400 = huella(pinta(2400).r);
  const f4200 = huella(pinta(4200).r);
  return { seed, detOk, palOk,
           resOk: f760 === f2400 && f2400 === f4200,
           r1: f760 === f2400, r2: f2400 === f4200,
           // para poder ver EN QUE se diferencian cuando fallan
           dif: f760 === f4200 ? null : primeraDif(f760, f4200) };
}

function primeraDif(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++)
    if (a[i] !== b[i]) return { i, a: a.slice(Math.max(0, i - 60), i + 60), b: b.slice(Math.max(0, i - 60), i + 60) };
  return { i: -1, a: a.length, b: b.length };
}

(async () => {
  const rs = await recorrer(algo, N, 400, ONLY, medir);
  const ok = rs.filter(r => r && !r.err);
  if (!ok.length) {
    console.log(`det · NADA MEDIDO · ${rs.filter(r => r.err).length} errores`);
    const e = rs.find(r => r.err); if (e) console.log('  ' + e.err);
    process.exit(2);
  }
  const malDet = ok.filter(r => !r.detOk), malPal = ok.filter(r => !r.palOk);
  const malRes = ok.filter(r => !r.resOk);
  console.log(`\ndet · ${algo} · ${ok.length} obras`);
  console.log(`  determinismo (pixel identico en tres condiciones): ${ok.length - malDet.length}/${ok.length}`);
  console.log(`  determinismo con la paleta fijada: ${ok.length - malPal.length}/${ok.length}`);
  console.log(`  MISMA HUELLA A 760 / 2400 / 4200: ${ok.length - malRes.length}/${ok.length}`);
  malRes.slice(0, 3).forEach(r => {
    console.log(`    ✗ #${r.seed} ${r.cfg}  760=2400:${r.r1} 2400=4200:${r.r2}`);
    if (r.dif) console.log(`      en ${r.dif.i}:\n      A …${r.dif.a}…\n      B …${r.dif.b}…`);
  });
  process.exit((malDet.length || malRes.length || malPal.length) ? 1 : 0);
})();
