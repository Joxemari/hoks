/* Hoja de contactos para mirar. No se publica: es el instrumento del paso 3.
 *
 *   node hoja.js <salida.png> [n] [cols] [base] [modo] [paramsJSON] [algo.js] [fmt]
 *
 * modo: banda | eje | ambos   (eje = el recorrido en crudo, sin dibujo que lo tape)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const REPO = '/home/user/hoks';
const out = process.argv[2] || 'hoja.png';
const N = parseInt(process.argv[3] || '12', 10);
const COLS = parseInt(process.argv[4] || '4', 10);
const BASE = parseInt(process.argv[5] || '300', 10);
const MODO = process.argv[6] || 'banda';
const PARAMS = process.argv[7] ? JSON.parse(process.argv[7]) : {};
const ALGO = process.argv[8] || path.join(REPO, 'sketches/hrrs/algo.js');
const FMT = process.argv[9] || 'square';
const SEED0 = parseInt(process.env.SEED0 || '1', 10);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0;background:#888"></body>');
  await p.addScriptTag({ path: path.join(REPO, 'sketches/_engine.js') });
  await p.addScriptTag({ path: ALGO });

  const res = await p.evaluate(({ N, COLS, BASE, MODO, PARAMS, FMT, SEED0 }) => {
    const WORK = HOKS.HRRS;
    const pal = HOKS.normalizePalettes(HOKS.DEFAULTS);
    const d = HOKS.fmtDims(FMT, BASE);
    const cols = COLS, rows = Math.ceil(N / cols);
    const GAP = 6, LAB = 14;
    const modos = MODO === 'ambos' ? ['eje', 'banda'] : [MODO];
    const cw = d.W * modos.length + (modos.length - 1) * 2;
    const big = document.createElement('canvas');
    big.width = cols * cw + (cols + 1) * GAP;
    big.height = rows * (d.H + LAB) + (rows + 1) * GAP;
    const B = big.getContext('2d');
    B.fillStyle = '#fff'; B.fillRect(0, 0, big.width, big.height);
    B.font = '10px monospace'; B.textBaseline = 'top';

    const filas = [];
    for (let i = 0; i < N; i++) {
      const seed = (SEED0 + i * 0x9E3779B1) >>> 0;
      const gx = GAP + (i % cols) * (cw + GAP);
      const gy = GAP + Math.floor(i / cols) * (d.H + LAB + GAP);
      let r = null;
      modos.forEach((modo, mi) => {
        const c = document.createElement('canvas');
        c.width = d.W; c.height = d.H;
        const x = c.getContext('2d', { willReadFrequently: true });
        // Grano SIEMPRE apagado aquí: usa Math.random(), así que con grano dos
        // renders de la misma seed no son comparables.
        const params = Object.assign({}, PARAMS, { grainScale: 0 });
        try { r = WORK.render(x, d.W, d.H, seed, { palettes: pal, params }) || r; }
        catch (e) { x.fillStyle = '#c00'; x.fillRect(0, 0, d.W, d.H); r = { err: e.message }; }
        if (modo === 'eje' && r && r.geo) {
          // El recorrido en CRUDO: fondo blanco, eje a un pelo, reserva punteada.
          x.fillStyle = '#fff'; x.fillRect(0, 0, d.W, d.H);
          const g = r.geo;
          x.save(); x.translate(g.ox, 0); x.scale(g.S, g.S);
          if (g.veto) {
            x.strokeStyle = '#e0e0e0'; x.lineWidth = 1.5 / g.S; x.setLineDash([4 / g.S, 4 / g.S]);
            x.strokeRect(g.veto.x0, g.veto.y0, g.veto.x1 - g.veto.x0, g.veto.y1 - g.veto.y0);
            x.setLineDash([]);
          }
          // el canal declarado, para ver a qué distancia va todo
          x.strokeStyle = '#111'; x.lineWidth = 1 / g.S; x.lineJoin = 'miter';
          for (const pts of g.cintas) {
            x.beginPath(); x.moveTo(pts[0].x, pts[0].y);
            for (let k = 1; k < pts.length; k++) x.lineTo(pts[k].x, pts[k].y);
            x.stroke();
          }
          // vértices, para leer la cadencia de longitudes
          x.fillStyle = '#c00';
          for (const pts of g.cintas) for (const pt of pts) {
            x.beginPath(); x.arc(pt.x, pt.y, 1.6 / g.S, 0, 6.2832); x.fill();
          }
          // los cabos, en azul: son la regla 4
          x.fillStyle = '#06c';
          for (const pts of g.cintas) for (const pt of [pts[0], pts[pts.length - 1]]) {
            x.beginPath(); x.arc(pt.x, pt.y, 3 / g.S, 0, 6.2832); x.fill();
          }
          x.restore();
        }
        B.drawImage(c, gx + mi * (d.W + 2), gy);
      });
      B.strokeStyle = '#ddd'; B.lineWidth = 1;
      B.strokeRect(gx + 0.5, gy + 0.5, cw - 1, d.H - 1);
      B.fillStyle = '#333';
      const lab = r && !r.err
        ? `#${seed} ${r.tipo} ${r.cintas}c ${r.pliegues}f ${r.pasillos}p ojo${r.ojos.length} `
          + `${Math.round(r.ocupacion * 100)}% v${r.vert} falta${r.falta.toFixed(2)}`
        : `#${seed} ERR ${r && r.err}`;
      B.fillText(lab, gx, gy + d.H + 2);
      if (r && !r.err) filas.push({ seed, tipo: r.tipo, cintas: r.cintas, pliegues: r.pliegues,
        pasillos: r.pasillos, largoPas: +r.largoPas.toFixed(1), ojos: r.ojos.length,
        area: +(r.ojos.reduce((a, x2) => a + x2, 0) * 100).toFixed(1),
        ocup: +(r.ocupacion * 100).toFixed(1), vert: r.vert, falta: +r.falta.toFixed(2) });
      else filas.push({ seed, err: r && r.err });
    }
    return { png: big.toDataURL('image/png'), filas };
  }, { N, COLS, BASE, MODO, PARAMS, FMT, SEED0 });

  fs.writeFileSync(out, Buffer.from(res.png.split(',')[1], 'base64'));
  console.log(res.filas.map(f => JSON.stringify(f)).join('\n'));
  const ok = res.filas.filter(f => !f.err);
  if (ok.length) {
    const med = k => { const v = ok.map(f => f[k]).sort((a, c) => a - c); return v[v.length >> 1]; };
    console.log(`\n${out} · n=${ok.length} · mediana: vert ${med('vert')} pliegues ${med('pliegues')} `
      + `pasillos ${med('pasillos')} ojos ${med('ojos')} ocup ${med('ocup')}% falta ${med('falta')}`);
  }
  await b.close();
})();
