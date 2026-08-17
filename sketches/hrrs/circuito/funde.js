/* ¿SE FUNDEN LAS BANDAS? Regla absoluta del autor: nunca. Así que la tinta de una obra tiene
 * que tener EXACTAMENTE tantos trozos conectados como trazos. Ni uno menos.
 *
 * Se mide sobre el PÍXEL y no sobre la geometría, porque fundirse es un hecho del dibujo: dos
 * centros que no se cruzan pueden pasar a menos de una anchura y las bandas se tocan igual.
 *
 *   node funde.js <gen.js> [n] [lado]
 */
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const GEN = process.argv[2];
const N = parseInt(process.argv[3] || '60', 10);
const LADO = parseInt(process.argv[4] || '900', 10);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: path.resolve(GEN) });

  const res = await p.evaluate(({ N, LADO }) => {
    // el mismo vestido que la tanda: foso de W+2g y tinta de W
    function pinta(cx, W, H, c) {
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H);
      const esc = Math.min(W, H) / Math.min(c.fw, c.fh);
      cx.save();
      cx.translate((W - c.fw * esc) / 2, (H - c.fh * esc) / 2); cx.scale(esc, esc);
      const traza = (q) => {
        cx.beginPath(); cx.moveTo(q[0][0], q[0][1]);
        for (let i = 1; i < q.length; i++) cx.lineTo(q[i][0], q[i][1]);
      };
      const g = c.W * 0.22;
      cx.lineJoin = 'round'; cx.lineCap = 'butt';
      for (const q of c.trazos) {
        cx.strokeStyle = '#fff'; cx.lineWidth = c.W + 2 * g; traza(q); cx.stroke();
        cx.strokeStyle = '#000'; cx.lineWidth = c.W;         traza(q); cx.stroke();
      }
      cx.restore();
    }
    // trozos conectados de tinta, 8-conexo, con una pila propia (sin recursión)
    function trozos(d, w, h) {
      const vis = new Uint8Array(w * h);
      let k = 0; const tam = [];
      const pila = new Int32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        if (vis[i] || d[i * 4] > 127) continue;
        let sp = 0; pila[sp++] = i; vis[i] = 1; let n = 0;
        while (sp) {
          const q = pila[--sp]; n++;
          const x = q % w, y = (q - x) / w;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = ny * w + nx;
            if (vis[j] || d[j * 4] > 127) continue;
            vis[j] = 1; pila[sp++] = j;
          }
        }
        tam.push(n); k++;
      }
      return { k, tam };
    }

    const filas = [];
    for (let i = 0; i < N; i++) {
      const seed = ((i + 1) * 0x9E3779B1 ^ 0x5A17) >>> 0;
      const c = circuito(seed);
      const h = Math.round(LADO * (c.fh / c.fw));
      const cv = document.createElement('canvas');
      cv.width = LADO; cv.height = h;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      pinta(cx, LADO, h, c);
      const d = cx.getImageData(0, 0, LADO, h).data;
      const t = trozos(d, LADO, h);
      // los trozos de menos de 20 px son antialias suelto, no una banda
      const reales = t.tam.filter(x => x >= 20).length;
      filas.push({ seed, trazos: c.trazos.length, piezas: reales, tipo: c.tipo });
    }
    return filas;
  }, { N, LADO });

  let funden = 0, parten = 0;
  for (const f of res) {
    if (f.piezas < f.trazos) funden++;
    if (f.piezas > f.trazos) parten++;
  }
  console.log('obras=' + res.length +
              '  FUNDEN=' + funden + ' (' + (100 * funden / res.length).toFixed(0) + '%)' +
              '  se parten=' + parten);
  const mal = res.filter(f => f.piezas < f.trazos).slice(0, 12);
  for (const f of mal)
    console.log('  #' + f.seed.toString(16) + '  ' + f.trazos + ' trazos -> ' +
                f.piezas + ' piezas   (' + f.tipo + ')');
  await b.close();
  process.exit(funden ? 1 : 0);
})();
