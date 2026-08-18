/* LA TIRADA: LO QUE CORRE UN TRAZO SIN DOBLAR, en anchuras de banda.
 *
 * Guarda dos compromisos que salieron de los pares y que si no se miden se pierden solos:
 *
 *   1. «Más largo cuanto más estrecho sea el trazo.» Medido en `mano.json` sale cierto en el signo
 *      —r = -0,67 / -0,39 / -0,41 según el umbral de esquina— y flojo en la fuerza, así que el
 *      generador lo aplica con exponente -0,41. Aquí se comprueba que de verdad sale al otro lado.
 *   2. «Bastantes dobladuras, al menos el primer trazo, que es el que marca la base de la obra.»
 *      O sea: la tirada del primero tiene que ser MÁS CORTA que la de los demás.
 *
 * Y con qué comparar, que es lo que hace que el número signifique algo — las seis, medidas igual:
 *
 *     r1  banda 0,033  mediana 2,1     r3  0,054  1,9     r5  0,091  1,3
 *     r2  banda 0,042  mediana 1,3     r4  0,052  1,9     r6  0,089  1,2
 *
 *   node tiradas.js [obras] [umbral en grados]
 */
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const N = parseInt(process.argv[2] || '40', 10);
const UMB = parseFloat(process.argv[3] || '12');
const GEN = process.env.HRRS_GEN || path.resolve(__dirname, 'gen.js');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: GEN });

  const r = await p.evaluate(({ N, UMB }) => {
    const hy = Math.hypot;
    const corto = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
    const tiradas = (t, W) => {
      const out = []; let acc = 0, dp = null;
      for (let i = 0; i < t.length - 1; i++) {
        const dx = t[i + 1][0] - t[i][0], dy = t[i + 1][1] - t[i][1];
        const L = hy(dx, dy); if (L < 1e-9) continue;
        const d = Math.atan2(dy, dx) * 180 / Math.PI;
        if (dp != null && Math.abs(corto(d - dp)) > UMB) { out.push(acc / W); acc = 0; }
        acc += L; dp = d;
      }
      if (acc > 0) out.push(acc / W);
      return out;
    };
    const med = (v) => { if (!v.length) return NaN; const q = v.slice().sort((a, b) => a - b);
                         return q[q.length >> 1]; };
    const pri = [], res = [], porW = [];
    for (let i = 0; i < N; i++) {
      const o = circuito((700 + i * 53) >>> 0, { grainScale: 0 });
      const a = [], b2 = [];
      o.trazos.forEach((t, k) => { (k === 0 ? a : b2).push(...tiradas(t, o.W)); });
      if (a.length) pri.push(med(a));
      if (b2.length) res.push(med(b2));
      porW.push({ W: o.W, t: med(a.concat(b2)) });
    }
    // la relación banda ↔ tirada sobre lo nuestro: el mismo signo que en las seis o no vale
    const n = porW.length;
    const mx = porW.reduce((s, o) => s + o.W, 0) / n, my = porW.reduce((s, o) => s + o.t, 0) / n;
    const sx = Math.sqrt(porW.reduce((s, o) => s + (o.W - mx) ** 2, 0) / n) || 1;
    const sy = Math.sqrt(porW.reduce((s, o) => s + (o.t - my) ** 2, 0) / n) || 1;
    const cor = porW.reduce((s, o) => s + (o.W - mx) * (o.t - my), 0) / n / (sx * sy);
    // y por tercios de anchura, que se lee mejor que un coeficiente
    const ord = porW.slice().sort((a, b3) => a.W - b3.W);
    const t3 = (a, b3) => med(ord.slice(a, b3).map(o => o.t));
    const k = Math.floor(n / 3);
    return { pri: med(pri), res: med(res), cor,
             estrechas: t3(0, k), medias: t3(k, 2 * k), anchas: t3(2 * k, n),
             wEstr: med(ord.slice(0, k).map(o => o.W)), wAnch: med(ord.slice(2 * k).map(o => o.W)) };
  }, { N, UMB });

  const f = (v, d) => (v >= 0 ? '' : '') + v.toFixed(d == null ? 1 : d);
  console.log('umbral de esquina ' + UMB + '°, ' + N + ' obras\n');
  console.log('  tirada mediana del PRIMER trazo ...... ' + f(r.pri) + ' anchuras');
  console.log('  tirada mediana de los DEMÁS .......... ' + f(r.res));
  console.log('  ' + (r.pri < r.res * 0.9 ? 'el primero dobla más — es lo pedido'
                                          : 'EL PRIMERO NO DOBLA MÁS QUE LOS DEMÁS') + '\n');
  console.log('  obras de banda estrecha (' + f(r.wEstr, 3) + ') ....... ' + f(r.estrechas));
  console.log('  de banda media ....................... ' + f(r.medias));
  console.log('  de banda ancha (' + f(r.wAnch, 3) + ') ........... ' + f(r.anchas));
  console.log('  correlación banda ↔ tirada ........... ' + (r.cor >= 0 ? '+' : '') + f(r.cor, 2)
              + '   (las seis: -0,67)');
  console.log('  ' + (r.cor < -0.15 ? 'la estrecha corre más — el signo de las seis'
                                    : 'NO SALE LA RELACIÓN QUE DICEN LAS SEIS'));
  console.log('\n  las seis, medidas igual: mediana de 1,2 a 2,1 anchuras, la del conjunto 1,5.');
  await b.close();
  process.exit((r.pri < r.res * 0.9 && r.cor < -0.15) ? 0 : 1);
})();
