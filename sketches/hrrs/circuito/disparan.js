/* ¿DISPARAN LOS DOCE PARES?
 *
 * Un par en el que los dos lados salen iguales es peor que no tener el par: le haría votar ruido
 * y yo aprendería algo falso. Y eso ya pasó — `esq` se declaraba y no se usaba en ninguna parte,
 * así que A y B salían idénticos hasta el píxel. Se vio al ponerlo aquí, no mirando el código.
 *
 * Así que antes de publicar la página, cada par tiene que demostrar que mueve la obra:
 *
 *   difieren ..... en cuántas semillas cambia algo. Y OJO CON EL CRITERIO, que ya se ha equivocado
 *                  dos veces en el mismo sitio: hay mandos que son una MONEDA —`pDenso`,
 *                  `pRecorte`— y mover su probabilidad de 0,62 a 0,38 sólo cambia el resultado en
 *                  las semillas cuyo sorteo cae en medio, o sea el 24 %. Pedirles la mitad de las
 *                  semillas, o un cuarto, es pedirles algo aritméticamente imposible.
 *                  Un mando MUERTO da exactamente cero —así se cazó `esq`—, así que el corte está
 *                  en dos: por debajo, muerto. Y por debajo del 20 % se avisa, porque entonces la
 *                  página tiene que rebuscar semillas y el par deja de representar lo que el mando
 *                  hace de media: el autor vería tres casos escogidos, no tres casos.
 *   Δ tinta ...... cuánto cambia la tinta media, en puntos
 *   Δ banda ...... y la anchura de banda
 *   Δ forma ...... cuánto se mueve un vértice, en anchuras de banda, MEDIDO SÓLO EN LAS SEMILLAS
 *                  QUE CAMBIAN. Promediarlo sobre todas diluía el efecto con los empates.
 *
 * Y CUARENTA SEMILLAS POR DEFECTO, no doce. Con doce, un mando que cambia una obra de cada seis
 * sale «1 de 12» y suspende por suerte: pasó con `pDenso` y con `pRecorte`, los dos vivos, y me
 * llevó a abrirles el salto cuando el problema era el tamaño de la muestra. Es la tercera vez en
 * esta familia que un cero significa «no he mirado bastante» y no «no hay nada».
 *
 *   node disparan.js [semillas]
 */
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const N = parseInt(process.argv[2] || '40', 10);

// los mismos doce de `pares.html`. Si se cambian ahí, se cambian aquí: son la misma pregunta.
const PARES = [
  ['canal',    { canal: null },       { canal: 0.22 }],
  ['obl',      { obl: [58, 76] },     { obl: [32, 76] }],
  ['tramo',    { tramo: [0.66, 1.75] }, { tramo: [1.1, 2.9] }],
  ['err',      { err: 3 },            { err: 7 }],
  ['largo',    { largo: 1.30 },       { largo: 1.60 }],
  ['crece',    { crece: 1.15 },       { crece: 1.35 }],
  ['pDenso',   { pDenso: 0.62 },      { pDenso: 0.38 }],
  ['pRecorte', { pRecorte: 0.05 },    { pRecorte: 0.28 }],
  ['aire',     { aire: 0 },           { aire: 0.35 }],
  ['nTrazos',  { nTrazos: 1.0 },      { nTrazos: 0.75 }],
  ['cats',     { cats: null },        { cats: [0.44, 0.14, 0.24, 0.18] }],
  ['prop',     { prop: null },        { prop: [1.02, 1.15] }],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: path.resolve(__dirname, 'gen.js') });

  const filas = await p.evaluate(({ PARES, N }) => {
    const cv = document.createElement('canvas');
    cv.width = 220; cv.height = 220;
    const cx = cv.getContext('2d');
    const tintaDe = (o) => {
      pinta(cx, cv.width, cv.height, o, { grano: 0 });
      const d = cx.getImageData(0, 0, cv.width, cv.height).data;
      let osc = 0, tot = 0;
      for (let i = 0; i < d.length; i += 4 * 7) { tot++; if (d[i] < 140) osc++; }
      return osc / tot;
    };
    // LA FIRMA TIENE QUE VER LA BANDA, no sólo los ejes. `crece` gobierna el relleno y no mueve
    // ni un vértice: con la firma puesta sobre los ejes salía «0 de 12», o sea muerto, cuando
    // cambia la tinta dos puntos y medio. Se le añade la anchura y la suma de semianchuras.
    const clave = (o) => o.W.toFixed(5) + '|' +
      o.trazos.map(t => t.map(q => q[0].toFixed(4) + ',' + q[1].toFixed(4)).join(';')).join('|') +
      '|' + o.semis.map(sm => sm.reduce((a, l) => a + l[0] + l[1], 0).toFixed(4)).join(',');
    // cuánto se mueve la obra a la vista: la distancia media entre vértices emparejados por
    // recorrido, en anchuras de banda. Si sobran o faltan trazos, cuenta como un trazo entero.
    const forma = (o1, o2) => {
      const W = (o1.W + o2.W) / 2 || 0.05;
      const n = Math.min(o1.trazos.length, o2.trazos.length);
      const mas = Math.abs(o1.trazos.length - o2.trazos.length);
      let s = 0, c = 0;
      for (let k = 0; k < n; k++) {
        const a = o1.trazos[k], b2 = o2.trazos[k], m = Math.min(a.length, b2.length);
        for (let i = 0; i < m; i++) {
          s += Math.hypot(a[i][0] - b2[i][0], a[i][1] - b2[i][1]); c++;
        }
      }
      const d = c ? s / c / W : 0;
      return d + mas * 3;      // un trazo de más o de menos vale mucho, y así se ve
    };
    return PARES.map(([k, ma, mb]) => {
      let dif = 0, ta = 0, tb = 0, wa = 0, wb = 0, na = 0, nb = 0, fm = 0;
      for (let i = 0; i < N; i++) {
        const s = 500 + i * 61;
        const oa = circuito(s, { grainScale: 0, mandos: ma });
        const ob = circuito(s, { grainScale: 0, mandos: mb });
        if (clave(oa) !== clave(ob)) { dif++; fm += forma(oa, ob); }
        ta += tintaDe(oa); tb += tintaDe(ob);
        wa += oa.W; wb += ob.W;
        na += oa.trazos.length; nb += ob.trazos.length;
      }
      return { k, dif, dTinta: 100 * (tb - ta) / N, dW: (wb - wa) / N,
               dN: (nb - na) / N, forma: dif ? fm / dif : 0 };
    });
  }, { PARES, N });

  console.log(['mando'.padEnd(10), 'difieren'.padStart(9), 'Δ tinta'.padStart(9),
               'Δ banda'.padStart(9), 'Δ trazos'.padStart(9), 'Δ forma'.padStart(9)].join(' '));
  let fallo = 0;
  for (const f of filas) {
    // dispara si cambia en al menos 3 semillas de 12 Y, cuando cambia, cambia algo que se ve:
    // o la forma, o la tinta. Los mandos de moneda cambian poco a menudo y mucho cuando lo hacen.
    const muerto = f.dif < 2 || (f.forma < 0.25 && Math.abs(f.dTinta) < 1.0);
    const raro = !muerto && f.dif / N < 0.20;
    console.log([f.k.padEnd(10),
                 (f.dif + '/' + N).padStart(9),
                 (f.dTinta >= 0 ? '+' : '') + f.dTinta.toFixed(1),
                 (f.dW >= 0 ? '+' : '') + f.dW.toFixed(4),
                 (f.dN >= 0 ? '+' : '') + f.dN.toFixed(1),
                 f.forma.toFixed(2)].map((v, i) => i ? v.padStart(9) : v).join(' ')
                 + (muerto ? '   NO DISPARA' : raro ? '   moneda estrecha: la página rebusca' : ''));
    if (muerto) fallo = 1;
  }
  console.log(fallo ? '\nHay pares que no mueven la obra: quítalos de pares.html o arréglalos.'
                    : '\nLos doce mueven la obra.');
  await b.close();
  process.exit(fallo);
})();
