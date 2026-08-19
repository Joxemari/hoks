/* RENDERIZA PARA QUE `piel.py` LO MIDA. Nada más.
 *
 * La única gracia está en el tamaño: la piel se mide en anchuras de banda y el suelo del método
 * depende de cuántos píxeles tiene esa anchura, así que si nuestro trazo se rinde a 200 px de
 * banda y la foto de r1 tiene 14, los dos números no se pueden restar. Aquí la banda sale
 * SIEMPRE a los píxeles que se pidan.
 *
 *   node piel.js trazo <salida.png> [W px] [seed] [clave=valor ...]
 *   node piel.js obra  <salida.png> [W px] [seed]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const MODO = process.argv[2] || 'trazo';
const OUT = process.argv[3] || 'piel.png';
const WPX = parseFloat(process.argv[4] || '28');
const SEED = parseInt(process.argv[5] || '1', 10);
const OPTS = {};
for (const a of process.argv.slice(6)) {
  const [k, v] = a.split('=');
  OPTS[k] = isNaN(parseFloat(v)) ? v : parseFloat(v);
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: path.resolve(__dirname, MODO === 'obra' ? 'gen.js' : 'trazo.js') });

  const png = await p.evaluate(({ MODO, WPX, SEED, OPTS }) => {
    const cv = document.createElement('canvas');
    const cx = cv.getContext('2d');
    const relleno = (q) => {
      cx.beginPath(); cx.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length; i++) cx.lineTo(q[i][0], q[i][1]);
      cx.closePath(); cx.fill();
    };
    if (MODO === 'obra') {
      const c = circuito(SEED, { grainScale: 0 });
      const esc = WPX / c.W;
      cv.width = Math.round(c.fw * esc); cv.height = Math.round(c.fh * esc);
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
      cx.save(); cx.scale(esc, esc);
      cx.fillStyle = '#000';
      for (let k = 0; k < c.trazos.length; k++) {
        const q = contornoDe(c, k);
        if (q.length > 2) relleno(q);
      }
      cx.restore();
    } else {
      // varios trazos, uno debajo de otro, en anchuras de banda escaladas a WPX
      const N = 6, sep = 9;
      const ts = [];
      for (let i = 0; i < N; i++) ts.push(trazo(SEED + i * 7919, OPTS));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      ts.forEach((t, i) => {
        t.contorno.forEach(q => {
          const y = q[1] + i * sep;
          if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        });
      });
      const m = 2;
      cv.width = Math.round((x1 - x0 + 2 * m) * WPX);
      cv.height = Math.round((y1 - y0 + 2 * m) * WPX);
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
      cx.save(); cx.scale(WPX, WPX); cx.translate(-x0 + m, -y0 + m);
      cx.fillStyle = '#000';
      ts.forEach((t, i) => {
        cx.save(); cx.translate(0, i * sep); relleno(t.contorno); cx.restore();
      });
      cx.restore();
    }
    return cv.toDataURL('image/png').slice(22);
  }, { MODO, WPX, SEED, OPTS });

  fs.writeFileSync(OUT, Buffer.from(png, 'base64'));
  console.log(OUT, 'W=' + WPX + 'px');
  await b.close();
})();
