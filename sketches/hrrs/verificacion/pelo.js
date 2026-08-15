/* pelo.js — el canal VISIBLE, medido sobre el pixel. Sustituye a `canal.js`.
 *
 *   node pelo.js <algo.js> [n] [base] [configs]
 *
 * ── Por que hubo que re-fundar esto ────────────────────────────────────────────
 *
 * `canal.js` medía la regla vieja: ningun par de tramos no contiguos a menos de
 * D = W + g, exacto sobre los ejes, sano ≥ 1,000. Esa regla ya no existe. Con el
 * halo el canal no se PROHIBE, se FABRICA: cada trazo corta a su alrededor una
 * franja de un canal antes de pintarse, asi que dos trazos pueden solaparse y el
 * blanco entre ellos sigue midiendo g. Una obra sana tiene hoy pares a 0,55 W y
 * `canal.js` los canta.
 *
 * Un detector que dispara sobre obra sana es peor que no tener detector: convence
 * en la direccion contraria. Asi que se retira su umbral y la garantia se traslada
 * al sitio donde ahora vive, que es el pixel.
 *
 * ── Lo que se mide ─────────────────────────────────────────────────────────────
 *
 * El blanco que separa dos tintas nunca mide menos de g. Y eso sale garantizado por
 * construccion en los dos casos, que es lo que hace que la afirmacion sea entera:
 *
 *   · si dos trazos se solapan, el corte del de encima deja exactamente g;
 *   · si no llegan a tocarse, deja su hueco MAS g.
 *
 * Se mide sobre la mascara entintada: el esqueleto del fondo, y en cada punto suyo
 * el doble de su distancia a la tinta. Los puntos con anchura ≥ W no son canal
 * —son el suelo de alrededor— y no cuentan. El minimo de los que quedan, en
 * unidades de g, es la cifra: sano ≥ 1,000, y no hay umbral que elegir porque 1,0
 * ES la regla.
 *
 * ── Y lo que costo que midiera lo que dice ────────────────────────────────────
 *
 * La primera version media el hueco sobre el FONDO, y daba 41 obras de 42 «por
 * debajo de g». Eso no era el dibujo: toda incision se estrecha hasta cero EN SU
 * PUNTA —es lo que significa que la incision muera dentro de la tinta— asi que el
 * minimo crudo de la anchura del canal es siempre ~0. La salida facil habria sido un
 * percentil, que es justo lo que la casa no hace: un percentil esconde el defecto
 * corto, que es el unico que hay que cazar.
 *
 * Se mide sobre la TINTA, que ademas es lo que el halo garantiza de verdad: ningun
 * pixel del trazo A a menos de g de un pixel del trazo B. Eso no tiene puntas — es
 * una distancia entre dos conjuntos— y sale exacta con una transformada de distancia
 * CON ETIQUETA: donde dos etiquetas se encuentran, la suma de sus dos distancias es
 * lo que separa a esos dos trazos.
 *
 * Y se pinta con la `banda()` PUBLICADA, exportada desde algo.js para esto: un
 * detector que reimplementa el dibujo mide su copia.
 *
 * Una trampa mas, y de las caras: con la etiqueta en 1, 2, 3… el antialias entre dos
 * tintas da valores intermedios —el filo de la 3 sobre la 5 pinta un 4— y ese 4
 * cuenta como un trazo nuevo pegado a los dos. Daba 0,125 g de minimo, o sea un
 * pixel, o sea el filo. Con las etiquetas separadas y tolerancia de uno, el filo se
 * descarta en vez de inventarse un trazo, y la cifra pasa de 0,199 a 1,126 de mediana.
 *
 * El precio de medir sobre el pixel, y hay que decirlo: la rejilla. Un canal de g
 * cae en un numero entero de pixeles, asi que a base pequeña la cifra baila medio
 * pixel. Por eso se mide a 760 y se avisa cuando g sale por debajo de 3,5 px: ahi la
 * medida no es la del dibujo, es la de la rejilla.
 *
 * ── LO QUE ENCUENTRA HOY, y es un defecto de verdad ────────────────────────────
 *
 * 14 obras de 42 por debajo de g. Las que rondan 0,96-1,00 son la rejilla —medio
 * pixel— y las de g < 3,5 px tambien. Pero el peor caso es real y esta localizado:
 * `vibrada` seed 2415074606, los trazos 3 y 1 a 2,2 px con g = 7. Mirado a tamaño,
 * la incision corre limpia y constante y de pronto la cruza una CUÑA: una punta de
 * esquina que se salta el canal.
 *
 * O sea que el halo garantiza el canal en el costado y no en el pico. Es la trampa
 * del inglete otra vez, que en esta casa ya ha entrado tres veces por tres puertas
 * distintas. Queda ahi, con su seed, para arreglarlo con la punta a la vista.
 *
 * El grano va a cero, como en toda la bateria: usa Math.random().
 */
const { recorrer, stats } = require('./_lanza');

const algo = process.argv[2] || './hrrs_test.js';
const N = parseInt(process.argv[3] || '80', 10);
const BASE = parseInt(process.argv[4] || '760', 10);
const ONLY = process.argv[5] || null;

function medir({ seed, fmt, params, base }) {
  const d = HOKS.fmtDims(fmt, base);
  const cv = document.createElement('canvas');
  cv.width = d.W; cv.height = d.H;
  const ctx = cv.getContext('2d');
  const res = HOKS.HRRS.render(ctx, d.W, d.H, seed, {
    palettes: HOKS.normalizePalettes([{ name: 't', colors: ['#ffffff', '#000000'], prob: 1 }]),
    locked: true, lockedIdx: 0,
    params: Object.assign({}, params, { grainScale: 0, bg: 'solid' }),
  });
  const geo = res.geo, S = geo.S, g = geo.g * S;
  const n = geo.cintas.length;
  if (n < 2) return { seed, pelo: null, gpx: g, n };

  // La obra otra vez, pero con CADA TRAZO DE SU COLOR y con los mismos cortes. Se
  // usa la `banda()` publicada: un detector que reimplementa el dibujo mide su copia.
  const lb = document.createElement('canvas');
  lb.width = d.W; lb.height = d.H;
  const lx = lb.getContext('2d');
  lx.translate(geo.ox, 0); lx.scale(S, S);
  const halo = params.halo != null ? params.halo * geo.W : geo.g;
  // LAS ETIQUETAS, BIEN SEPARADAS. Con la etiqueta en 1,2,3… el antialias entre dos
  // tintas da valores intermedios —el filo de la 3 sobre la 5 pinta un 4— y esos
  // cuentan como una etiqueta nueva pegada a las dos. Medido: daba 0,125 g de minimo,
  // que es un pixel, o sea el filo. Separadas y con tolerancia, el filo se descarta
  // en vez de inventarse un trazo.
  const paso1 = Math.max(2, Math.floor(250 / Math.max(1, n)));
  for (let k = 0; k < n; k++) {
    const pts = geo.cintas[k], rel = geo.relleno[k];
    if (halo > 0) {
      lx.globalCompositeOperation = 'destination-out';
      lx.beginPath(); HOKS.HRRS.banda(lx, pts, geo.W, geo.gubia[k], rel, null, halo);
      lx.fill();
    }
    lx.globalCompositeOperation = 'source-over';
    lx.fillStyle = 'rgb(' + paso1 * (k + 1) + ',0,0)';
    lx.beginPath(); HOKS.HRRS.banda(lx, pts, geo.W, geo.gubia[k], rel);
    lx.fill();
  }
  const px = lx.getImageData(0, 0, d.W, d.H).data;
  const W = d.W, H = d.H;
  const et = new Int32Array(W * H);
  for (let i = 0, k = 0; i < px.length; i += 4, k++) {
    const v = px[i], q = Math.round(v / paso1);
    et[k] = (px[i + 3] > 250 && q >= 1 && q <= n && Math.abs(v - q * paso1) <= 1) ? q : 0;
  }

  // Transformada de distancia CON ETIQUETA (chamfer 3-4, dos pasadas): de cada
  // pixel, a que distancia esta el trazo mas cercano y cual es.
  const INF = 1 << 28;
  const dt = new Int32Array(W * H), lab = new Int32Array(W * H);
  for (let k = 0; k < W * H; k++) { const e = et[k]; dt[k] = e ? 0 : INF; lab[k] = e; }
  const paso = (x0, x1, dx, y0, y1, dy, vec) => {
    for (let y = y0; y !== y1; y += dy) for (let x = x0; x !== x1; x += dx) {
      const k = y * W + x; let m = dt[k], l = lab[k];
      for (let t = 0; t < vec.length; t++) {
        const nx = x + vec[t][0], ny = y + vec[t][1];
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const v = dt[ny * W + nx] + vec[t][2];
        if (v < m) { m = v; l = lab[ny * W + nx]; }
      }
      dt[k] = m; lab[k] = l;
    }
  };
  paso(0, W, 1, 0, H, 1, [[-1, 0, 3], [0, -1, 3], [-1, -1, 4], [1, -1, 4]]);
  paso(W - 1, -1, -1, H - 1, -1, -1, [[1, 0, 3], [0, 1, 3], [1, 1, 4], [-1, 1, 4]]);

  // La frontera de Voronoi: donde dos etiquetas se encuentran, la suma de sus dos
  // distancias es lo que separa a esos dos trazos. El minimo de todas es la cifra,
  // y no tiene puntas: es una distancia entre dos conjuntos, no la anchura de un
  // hueco que se acaba.
  let min = Infinity, quien = null;
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const k = y * W + x, a = lab[k];
    if (!a) continue;
    for (const nb of [k + 1, k + W]) {
      const b2 = lab[nb];
      if (!b2 || b2 === a) continue;
      const v = dt[k] + dt[nb] + 3;
      if (v < min) { min = v; quien = a + '/' + b2; }
    }
  }
  return { seed, pelo: min === Infinity ? null : (min / 3) / Math.max(1e-9, g),
           gpx: g, n, quien };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir);
  const err = rs.filter(r => r.err);
  if (err.length) console.error(`  ${err.length} obras con error: ${err[0].err}`);
  const finos = rs.filter(r => r.gpx != null && r.gpx < 3);
  const v = rs.filter(r => r.pelo != null).map(r => r.pelo);
  const s = stats(v);
  const malas = rs.filter(r => r.pelo != null && r.pelo < 1 - 1e-9);
  console.log(`obras ${rs.length}   con dos trazos o mas ${v.length}`);
  if (finos.length) console.log(`  AVISO: ${finos.length} con g < 3 px — ahi manda la rejilla, no el dibujo`);
  if (s) console.log(`  pelo (canal visible / g)   min ${s.min.toFixed(3)}   p50 ${s.p50.toFixed(3)}   max ${s.max.toFixed(3)}`);
  console.log(`  por debajo de g: ${malas.length}`);
  malas.sort((a, b) => a.pelo - b.pelo).slice(0, 6).forEach(r =>
    console.log(`    ${r.cfg} seed ${r.seed}  pelo ${r.pelo.toFixed(3)}  trazos ${r.quien}  g ${r.gpx.toFixed(1)} px`));
  process.exit(malas.length ? 1 : 0);
})();
