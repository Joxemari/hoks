/* LAS CELDAS: cuanto blanco ATRAPA la obra. Se dibuja la banda, se engorda por el canal para que
 * las bandas vecinas se toquen —o sea, se mira la obra como una sola figura— y se cuentan los
 * agujeros. Un agujero es una celda: un trozo de papel rodeado de circuito.
 *
 * Es lo que se ve en r1 y r2 y no habia manera de medir: la obra no es un manojo de trazos que se
 * esquivan, es una red que encierra.
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { circuito } = require('./gen.js');
const { cargaMano, huecoMinimo } = require('./desde_mano.js');

(async () => {
  const casos = [];
  for (const c of ['r1', 'r2', 'r3', 'r6']) {
    const m = cargaMano(c);
    const o = circuito(1, { geometria: m });
    casos.push({ etq: c + ' (mano)', fw: m.fw, fh: m.fh, W: o.W, trazos: m.trazos });
    casos.push({ etq: c + ' (tras campo)', fw: m.fw, fh: m.fh, W: o.W, trazos: o.trazos });
  }
  for (let i = 0; i < 12; i++) {
    const o = circuito(((i + 1) * 0x9E3779B1 ^ 0x5A17) >>> 0);
    casos.push({ etq: 'nuestra #' + i, fw: o.fw, fh: o.fh, W: o.W, trazos: o.trazos });
  }
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<body style="margin:0"></body>');
  const res = await p.evaluate((casos) => {
    const LADO = 700;
    return casos.map(d => {
      const h = Math.round(LADO * d.fh / d.fw);
      const cv = document.createElement('canvas');
      cv.width = LADO; cv.height = h;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, LADO, h);
      const esc = LADO / d.fw;
      cx.save(); cx.scale(esc, esc);
      cx.lineJoin = 'round'; cx.lineCap = 'butt'; cx.strokeStyle = '#000';
      // LA BANDA ENGORDADA POR EL CANAL: asi dos bandas vecinas se tocan y la obra se lee como
      // UNA figura, que es lo que hace falta para que un agujero sea una celda
      cx.lineWidth = d.W * (1 + 0.22 * 1.15);
      for (const q of d.trazos) {
        if (q.length < 2) continue;
        cx.beginPath(); cx.moveTo(q[0][0], q[0][1]);
        for (let i = 1; i < q.length; i++) cx.lineTo(q[i][0], q[i][1]);
        cx.stroke();
      }
      cx.restore();
      const img = cx.getImageData(0, 0, LADO, h).data;
      const N = LADO * h;
      const tinta = new Uint8Array(N);
      for (let i = 0; i < N; i++) tinta[i] = img[i * 4] < 128 ? 1 : 0;
      // el blanco que toca el borde no esta atrapado: se inunda desde fuera
      const vis = new Uint8Array(N);
      const pila = new Int32Array(N);
      let sp = 0;
      const mete = (x, y) => { const i = y * LADO + x;
        if (x < 0 || y < 0 || x >= LADO || y >= h || vis[i] || tinta[i]) return;
        vis[i] = 1; pila[sp++] = i; };
      for (let x = 0; x < LADO; x++) { mete(x, 0); mete(x, h - 1); }
      for (let y = 0; y < h; y++) { mete(0, y); mete(LADO - 1, y); }
      while (sp) { const q = pila[--sp], x = q % LADO, y = (q - x) / LADO;
        mete(x + 1, y); mete(x - 1, y); mete(x, y + 1); mete(x, y - 1); }
      // lo que queda de blanco sin visitar son las celdas
      let celdas = 0, area = 0;
      const vis2 = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        if (tinta[i] || vis[i] || vis2[i]) continue;
        let s2 = 0; pila[s2++] = i; vis2[i] = 1; let n = 0;
        while (s2) { const q = pila[--s2], x = q % LADO, y = (q - x) / LADO; n++;
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= LADO || ny >= h) continue;
            const j = ny * LADO + nx;
            if (tinta[j] || vis[j] || vis2[j]) continue;
            vis2[j] = 1; pila[s2++] = j;
          } }
        if (n > N * 0.0012) { celdas++; area += n; }   // menos de eso es una rendija, no una celda
      }
      let ti = 0; for (let i = 0; i < N; i++) ti += tinta[i];
      return { etq: d.etq, celdas, areaCeldas: +(area / N).toFixed(3), tinta: +(ti / N).toFixed(3) };
    });
  }, casos);
  console.log('caso'.padEnd(20) + 'celdas'.padStart(8) + 'area celdas'.padStart(13) + 'tinta'.padStart(8));
  for (const r of res)
    console.log(r.etq.padEnd(20) + String(r.celdas).padStart(8) +
                r.areaCeldas.toFixed(3).padStart(13) + r.tinta.toFixed(3).padStart(8));
  const nu = res.filter(r => r.etq.startsWith('nuestra'));
  const md = v => { const s = v.slice().sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; };
  console.log('\nnuestras (mediana de 12): celdas=' + md(nu.map(r=>r.celdas)) +
              '  area=' + md(nu.map(r=>r.areaCeldas)).toFixed(3));
  await b.close();
})();
