/* UNA HOJA DE CONTACTOS, para mirar. Nada que medir aquí: seis obras seguidas, sobre el papel y
 * con la tinta que se midieron en las fotos, para ver de golpe si la banda sigue haciendo nubes.
 *
 *   node hoja.js <salida.png> [n] [semilla0] [lado]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const OUT = process.argv[2] || 'hoja.png';
const N = parseInt(process.argv[3] || '6', 10);
const S0 = parseInt(process.argv[4] || '3', 10);
const LADO = parseInt(process.argv[5] || '420', 10);
const SEEDS = process.argv.slice(6).map(Number).filter(n => !isNaN(n));
// para poder poner el de antes al lado del de ahora sin tocar nada: HRRS_GEN=/tmp/gen_antes.js
const GEN = process.env.HRRS_GEN || path.resolve(__dirname, 'gen.js');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: GEN });

  const png = await p.evaluate(({ N, S0, LADO, SEEDS }) => {
    const seeds = SEEDS.length ? SEEDS : Array.from({ length: N }, (_, i) => S0 + i * 14 + 1);
    const cols = Math.min(3, seeds.length), filas = Math.ceil(seeds.length / cols);
    const G = 14, PIE = 18;
    const cv = document.createElement('canvas');
    cv.width = cols * LADO + (cols + 1) * G;
    cv.height = filas * (LADO + PIE) + (filas + 1) * G;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, cv.width, cv.height);
    seeds.forEach((sd, i) => {
      const cxi = i % cols, cyi = Math.floor(i / cols);
      const x = G + cxi * (LADO + G), y = G + cyi * (LADO + PIE + G);
      const sub = document.createElement('canvas');
      sub.width = LADO; sub.height = LADO;
      const o = circuito(sd >>> 0, { grainScale: 0 });
      pinta(sub.getContext('2d'), LADO, LADO, o, { grano: 0 });
      cx.drawImage(sub, x, y);
      cx.fillStyle = '#666'; cx.font = '11px monospace';
      cx.fillText('#' + sd + '   W ' + o.W.toFixed(3) + '   ' + o.trazos.length + ' trazos',
                  x, y + LADO + 13);
    });
    return cv.toDataURL('image/png').slice(22);
  }, { N, S0, LADO, SEEDS });

  fs.writeFileSync(OUT, Buffer.from(png, 'base64'));
  console.log(OUT);
  await b.close();
})();
