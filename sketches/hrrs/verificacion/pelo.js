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
 * ── NO VALE TODAVIA, Y SE QUEDA ESCRITO CON EL MOTIVO ──────────────────────────
 *
 * Medido: 41 obras de 42 «por debajo de g», con el minimo en 0,25. Eso no es el
 * dibujo, es este fichero. TODA incision se estrecha hasta cero EN SU PUNTA —es lo
 * que significa que la incision muera dentro de la tinta— asi que el minimo crudo
 * de la anchura del canal es siempre ~0 y la cifra no dice nada.
 *
 * Y la salida facil seria un percentil, que es justo lo que la casa no hace: un
 * percentil esconde el defecto corto, que es el unico que hay que cazar.
 *
 * La formulacion correcta no es sobre el fondo sino sobre la TINTA, y ademas es la
 * que el halo garantiza de verdad: ningun pixel del trazo A esta a menos de g de un
 * pixel del trazo B. Eso no tiene puntas ni tapers — es una distancia entre dos
 * conjuntos— y sale exacta con una transformada de distancia con etiqueta. Para
 * medirla hace falta pintar cada trazo con su etiqueta CON LOS MISMOS CORTES, o sea
 * exportar `banda()` desde algo.js en vez de reimplementarla aqui: un detector que
 * copia el dibujo mide su copia.
 *
 * Se queda sin borrar, y `canal.js` se queda sin poder decir nada, porque el hueco
 * hay que verlo. Un cero sin control no significa nada; un cero de un instrumento
 * que mide otra cosa es peor.
 *
 * El precio de medir sobre el pixel, y hay que decirlo: la rejilla. Un canal de g
 * cae en un numero entero de pixeles, asi que a base pequeña la cifra baila medio
 * pixel. Por eso se mide a 760 y se avisa cuando g sale por debajo de 3 px: ahi la
 * medida no es la del dibujo, es la de la rejilla.
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
  // Blanco y negro puros: aqui se mide donde hay tinta, no de que color es.
  const res = HOKS.HRRS.render(ctx, d.W, d.H, seed, {
    palettes: HOKS.normalizePalettes([{ name: 't', colors: ['#ffffff', '#000000'], prob: 1 }]),
    locked: true, lockedIdx: 0,
    params: Object.assign({}, params, { grainScale: 0, bg: 'solid' }),
  });
  const S = Math.min(d.W, d.H);
  const g = res.geo.g * S;                      // el canal de ESTA obra, en pixeles

  const px = ctx.getImageData(0, 0, d.W, d.H).data;
  const W = d.W, H = d.H;
  // tinta = oscuro. El fondo es blanco puro y la tinta negra, asi que el umbral
  // no decide nada: solo separa el antialias del filo, que cae a los dos lados.
  const tinta = new Uint8Array(W * H);
  for (let i = 0, k = 0; i < px.length; i += 4, k++) tinta[k] = px[i] < 128 ? 1 : 0;

  // Distancia de cada pixel de FONDO a la tinta, por dos pasadas (chamfer 3-4).
  const INF = 1 << 28;
  const dt = new Int32Array(W * H);
  for (let k = 0; k < W * H; k++) dt[k] = tinta[k] ? 0 : INF;
  const paso = (x0, x1, dx, y0, y1, dy, vecinos) => {
    for (let y = y0; y !== y1; y += dy) {
      for (let x = x0; x !== x1; x += dx) {
        const k = y * W + x;
        let m = dt[k];
        for (const [ox, oy, c] of vecinos) {
          const nx = x + ox, ny = y + oy;
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const v = dt[ny * W + nx] + c;
          if (v < m) m = v;
        }
        dt[k] = m;
      }
    }
  };
  paso(0, W, 1, 0, H, 1, [[-1, 0, 3], [0, -1, 3], [-1, -1, 4], [1, -1, 4]]);
  paso(W - 1, -1, -1, H - 1, -1, -1, [[1, 0, 3], [0, 1, 3], [1, 1, 4], [-1, 1, 4]]);

  // El canal: un pixel de fondo es el CENTRO de su canal si ningun vecino esta mas
  // lejos de la tinta que el. Es la cresta de la transformada, que es el esqueleto
  // del fondo sin tener que adelgazar nada — y basta, porque lo unico que se busca
  // es el minimo de la anchura.
  const anchoW = res.geo.W * S * 3;             // W en las mismas unidades (chamfer×3)
  let minA = Infinity, nCanal = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const k = y * W + x;
      if (tinta[k] || dt[k] <= 0) continue;
      const a = dt[k];
      if (a >= anchoW / 2) continue;            // suelo de alrededor, no canal
      let cresta = true;
      for (let oy = -1; oy <= 1 && cresta; oy++)
        for (let ox = -1; ox <= 1; ox++) {
          if (!ox && !oy) continue;
          if (dt[(y + oy) * W + x + ox] > a) { cresta = false; break; }
        }
      if (!cresta) continue;
      nCanal++;
      if (2 * a < minA) minA = 2 * a;
    }
  }
  return {
    seed,
    // en unidades de g. El chamfer da 3 por pixel, asi que se divide.
    pelo: nCanal ? (minA / 3) / Math.max(1e-9, g) : null,
    gpx: g, nCanal,
  };
}

(async () => {
  const rs = await recorrer(algo, N, BASE, ONLY, medir);
  const err = rs.filter(r => r.err);
  if (err.length) console.error(`  ${err.length} obras con error: ${err[0].err}`);
  const finos = rs.filter(r => r.gpx != null && r.gpx < 3);
  const v = rs.filter(r => r.pelo != null).map(r => r.pelo);
  const s = stats(v);
  const malas = rs.filter(r => r.pelo != null && r.pelo < 1 - 1e-9);
  console.log(`obras ${rs.length}   con canal medible ${v.length}`);
  if (finos.length) console.log(`  AVISO: ${finos.length} con g < 3 px — ahi manda la rejilla, no el dibujo`);
  if (s) console.log(`  pelo (canal visible / g)   min ${s.min.toFixed(3)}   p50 ${s.p50.toFixed(3)}   max ${s.max.toFixed(3)}`);
  console.log(`  por debajo de g: ${malas.length}   (OJO: la cifra NO vale — ver la cabecera)`);
  malas.slice(0, 5).forEach(r => console.log(`    ${r.cfg} seed ${r.seed}  pelo ${r.pelo.toFixed(3)}`));
  process.exit(0);          // no puede fallar nada: todavia no mide lo que dice
})();
