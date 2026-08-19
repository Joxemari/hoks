/* replica.js — el ejercicio: REPLICAR cada referencia con la gramática de la casa.
 *
 *   node referencias/replica.js salida.png [lado]
 *
 * Lo pidió el autor y es el mejor instrumento que tiene esta familia, porque es
 * FALSABLE: describir una referencia con palabras siempre sale bien; escribirla con
 * los movimientos propios sólo sale bien si los movimientos dan para ello. Donde hay
 * que pelearse con la gramática, ahí está lo que falta — y si una réplica rompe la
 * regla dura, la que está mal es la regla.
 *
 * Las recetas hablan el vocabulario de la familia y nada más (ver `componer` en
 * ../algo.js): `suelto`, `paralelo`, `continua`, `pata`, y los giros —con `pliega`
 * para el pliegue—. Coordenadas en el campo normalizado, lado corto = 1.
 *
 * Las imágenes de referencia NO están en el repo (obra de terceros, repo público).
 * Esto dibuja sólo las réplicas; la comparación se monta en local al lado de ellas.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const REPO = path.join(__dirname, '..', '..', '..');
const out = process.argv[2] || 'replicas.png';
const LADO = parseInt(process.argv[3] || '460', 10);

// Un giro: {mag, lado} — o {mag, lado, pliega:1} para el pliegue, que se construye
// con la fórmula de la casa (girar φ, recorrer D/sen φ, girar 180−φ).
const G = (mag, lado) => ({ mag, lado });
const P = (phi, lado) => ({ mag: phi, lado, pliega: 1 });

const RECETAS = [
{ // 1 · la firmada: recinto grande arriba-izquierda, y por la derecha se abre en
  // patas paralelas que bajan. Deriva diagonal: denso arriba-izq, deshilachado abajo-der.
  nombre: 'firmada · recinto + patas',
  alto: 1.15, ancho: 0.052, canal: 0.13, sep: 1.0, vibAmp: 4.5,
  trazos: [
    // el techo del recinto: entra por el borde izquierdo y da la vuelta al blanco
    { suelto: [-0.04, 0.42, -52], largo: 1.85,
      giros: [G(58, 1), G(38, 1), G(46, 1), G(52, 1), G(40, 1)],
      pesos: [0.5, 1.5, 1.1, 1.3, 1.0, 1.2] },
    // el muñón corto dentro del recinto
    { suelto: [0.30, 0.44, 74], largo: 0.20, giros: [] },
    // el cuerpo de la derecha, que se abre en tres patas
    { continua: 0, cabo: 1, giro: 26, largo: 1.20,
      giros: [P(74, -1), G(62, 1), G(48, -1)], pesos: [0.9, 0.7, 1.4, 1.0] },
    { paralelo: 2, a: 0.10, b: 0.86, lado: 1 },
    { paralelo: 3, a: 0.20, b: 0.95, lado: 1 },
    // las patas, escalonadas
    { pata: 2, f: 0.72, dir: 96, largo: 0.46, giros: [G(22, -1)] },
    { pata: 3, f: 0.62, dir: 92, largo: 0.30, giros: [G(18, 1)] },
  ] },

{ // 2 · la gris: mismo idioma, recinto a la izquierda y tres patas claras a la derecha
  nombre: 'gris · recinto + tres patas',
  alto: 1.0, ancho: 0.048, canal: 0.14, sep: 1.0, vibAmp: 5.0,
  trazos: [
    { suelto: [0.30, 0.14, 96], largo: 1.55,
      giros: [G(64, 1), G(52, 1), G(58, 1), G(44, 1)], pesos: [0.8, 1.2, 1.4, 1.0, 0.9] },
    // el brazo que entra por la izquierda y muere contra el recinto
    { suelto: [-0.05, 0.40, 6], largo: 0.42, giros: [G(50, 1)] },
    // el haz de la derecha
    { suelto: [0.52, 0.16, 88], largo: 0.72, giros: [P(80, -1), G(40, 1)] },
    { paralelo: 2, a: 0.05, b: 0.80, lado: -1 },
    { suelto: [0.66, 0.14, 92], largo: 0.66, giros: [G(38, -1), G(46, 1)] },
    // la horizontal larga que cruza por debajo y sale por la derecha
    { suelto: [0.22, 0.55, 2], largo: 0.95, giros: [G(20, -1), G(16, 1)] },
    // tres patas, alturas distintas
    { pata: 5, f: 0.18, dir: 92, largo: 0.34, giros: [G(14, 1)] },
    { pata: 5, f: 0.46, dir: 88, largo: 0.44, giros: [G(12, -1)] },
    { pata: 5, f: 0.74, dir: 94, largo: 0.28, giros: [G(16, 1)] },
  ] },

{ // 3 · la enmarcada: SIN recinto. Siete tramos casi horizontales que convergen a la
  // derecha y se abren en abanico a la izquierda. Cabos libres a los dos lados.
  nombre: 'enmarcada · abanico de siete',
  alto: 1.35, ancho: 0.044, canal: 0.12, sep: 1.0, vibAmp: 5.5,
  trazos: [
    { suelto: [0.62, 0.16, 104], largo: 0.62, giros: [G(30, -1)] },
    { suelto: [0.10, 0.36, -8], largo: 0.72, giros: [G(34, 1), G(26, -1)] },
    { paralelo: 1, a: 0.30, b: 1.0, lado: 1 },
    { suelto: [0.16, 0.52, -4], largo: 0.66, giros: [G(30, 1), G(22, -1)] },
    { paralelo: 3, a: 0.25, b: 1.0, lado: 1 },
    { suelto: [0.06, 0.62, 4], largo: 0.78, giros: [G(26, -1), G(30, 1)] },
    { suelto: [0.12, 0.76, 10], largo: 0.58, giros: [G(34, -1)] },
    { suelto: [0.58, 0.60, 84], largo: 0.46, giros: [G(28, 1)] },
  ] },

{ // 4 · la de trazo grueso: seis bandas que se REÚNEN en un nudo a la derecha, con
  // el pelo donde se aparean. Dos sangran por arriba y por abajo.
  nombre: 'gruesa · el nudo de la derecha',
  alto: 1.32, ancho: 0.058, canal: 0.10, sep: 1.0, vibAmp: 4.0,
  trazos: [
    // la vertical que entra por arriba y baja al nudo
    { suelto: [0.60, -0.06, 92], largo: 0.52, giros: [G(56, 1)] },
    // el brazo de arriba-izquierda
    { suelto: [0.02, 0.14, 16], largo: 0.72, giros: [G(24, 1), G(20, -1)] },
    { paralelo: 1, a: 0.28, b: 1.0, lado: 1 },
    // los dos del medio, que convergen
    { suelto: [-0.04, 0.42, 4], largo: 0.86, giros: [G(20, 1), G(26, -1)] },
    { paralelo: 3, a: 0.22, b: 1.0, lado: 1 },
    { suelto: [0.06, 0.52, 2], largo: 0.74, giros: [G(24, 1)] },
    // el que sale del nudo y baja hasta salirse por abajo
    { continua: 3, cabo: 1, giro: 62, largo: 0.78, giros: [G(30, -1), G(24, 1)] },
    // el brazo de abajo-izquierda
    { suelto: [-0.04, 0.72, -6], largo: 0.66, giros: [G(28, -1)] },
  ] },

{ // 5 · el cartel de Múnich: ortogonal, dos travesías de lado a lado y un nudo
  // central donde cuatro corren en paralelo con su pelo.
  nombre: 'múnich · travesías y nudo',
  alto: 1.05, ancho: 0.075, canal: 0.085, sep: 1.0, vibAmp: 2.2, vibOnda: 2.6,
  trazos: [
    // travesía de arriba: cabo a escuadra a la izquierda, sale por la derecha
    { suelto: [0.29, 0.09, 0], largo: 0.80, giros: [] },
    // la vertical que entra por arriba y baja al nudo, con pliegue
    { suelto: [0.47, -0.05, 90], largo: 0.86, giros: [G(88, -1), G(86, 1), G(84, 1)],
      pesos: [1.2, 0.6, 1.0, 0.8] },
    // su acompañante a un pelo: el blanco que recorre el nudo
    { paralelo: 1, a: 0.12, b: 0.92, lado: -1 },
    // el brazo que entra por la izquierda, se dobla y vuelve (la U de abajo-izq)
    { suelto: [-0.05, 0.62, 0], largo: 1.10,
      giros: [G(86, 1), G(88, -1), P(88, -1), G(84, -1)], pesos: [0.9, 0.5, 1.1, 0.7, 0.9] },
    { paralelo: 3, a: 0.18, b: 0.98, lado: 1 },
    // el brazo de la derecha que entra y llega al nudo
    { suelto: [1.06, 0.36, 180], largo: 0.62, giros: [G(84, 1), G(86, -1)] },
    { paralelo: 5, a: 0.10, b: 0.95, lado: 1 },
    // la vertical que baja y se sale por abajo
    { continua: 1, cabo: 1, giro: 6, largo: 0.52, giros: [G(16, -1), G(14, 1)] },
    // travesía de abajo-derecha
    { suelto: [0.55, 0.98, 0], largo: 0.55, giros: [] },
  ] },

{ // 6 · la casi cuadrada: recinto rectangular arriba y, colgando, un haz denso de
  // paralelos ENGRANADOS —dos peines que se meten uno en otro— que bajan en patas.
  nombre: 'cuadrada · recinto + peine',
  alto: 1.0, ancho: 0.040, canal: 0.14, sep: 1.0, vibAmp: 4.0,
  trazos: [
    // el recinto rectangular
    { suelto: [0.14, 0.30, -88], largo: 1.15,
      giros: [G(88, 1), G(90, 1), G(88, 1)], pesos: [0.7, 1.3, 0.8, 0.5] },
    // el peine: cuatro que bajan engranados
    { suelto: [0.40, 0.26, 84], largo: 0.44, giros: [G(28, -1), G(24, 1)] },
    { paralelo: 1, a: 0.0, b: 0.90, lado: 1 },
    { paralelo: 2, a: 0.05, b: 0.95, lado: 1 },
    { suelto: [0.62, 0.24, 92], largo: 0.40, giros: [G(30, 1), G(26, -1)] },
    { paralelo: 4, a: 0.0, b: 0.92, lado: -1 },
    // la horizontal que cruza el peine y sale por la derecha
    { suelto: [0.22, 0.56, -4], largo: 0.82, giros: [G(18, 1), G(14, -1)] },
    // las patas
    { pata: 6, f: 0.12, dir: 90, largo: 0.30, giros: [G(12, -1)] },
    { pata: 6, f: 0.42, dir: 88, largo: 0.40, giros: [G(14, 1)] },
    { pata: 6, f: 0.68, dir: 92, largo: 0.24, giros: [G(10, -1)] },
  ] },
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.error('  [page]', m.text()); });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ path: path.join(REPO, 'sketches/_engine.js') });
  await p.addScriptTag({ path: path.join(__dirname, '..', 'algo.js') });

  const res = await p.evaluate(({ RECETAS, LADO }) => {
    const big = document.createElement('canvas');
    const COLS = 3, filas = Math.ceil(RECETAS.length / COLS);
    const altoMax = Math.max.apply(null, RECETAS.map(r => r.alto || 1));
    const CH = Math.round(LADO * altoMax);
    big.width = COLS * (LADO + 8); big.height = filas * (CH + 22);
    const B = big.getContext('2d');
    B.fillStyle = '#fff'; B.fillRect(0, 0, big.width, big.height);
    B.font = '11px monospace';
    const filasOut = [];
    RECETAS.forEach((r, i) => {
      const W = LADO, H = Math.round(LADO * (r.alto || 1));
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      let out;
      try {
        out = HOKS.HRRS.componer(c.getContext('2d'), W, H, r, {
          palettes: HOKS.normalizePalettes([{ name: 'tinta', colors: ['#f2efe6', '#1a1a1a'], prob: 1 }]),
          locked: true, lockedIdx: 0,
        });
      } catch (e) { filasOut.push({ n: r.nombre, err: String(e && e.message || e) }); return; }
      const gx = (i % COLS) * (LADO + 8), gy = Math.floor(i / COLS) * (CH + 22);
      B.drawImage(c, gx, gy);
      B.fillStyle = '#333'; B.fillText(r.nombre, gx, gy + CH + 14);

      // ── LA REGLA DURA, sobre la réplica ──────────────────────────────────
      // Si una referencia escrita con esta gramática incumple, la que esta mal es
      // la regla. Es el punto del ejercicio.
      const g = out.geo, D = g.D, Wb = g.W, segs = [];
      g.cintas.forEach((pts, k) => {
        for (let j = 0; j < pts.length - 1; j++)
          segs.push([pts[j].x, pts[j].y, pts[j+1].x, pts[j+1].y, k, j]);
      });
      const pSD = (px, py, ax, ay, bx, by) => {
        const dx = bx - ax, dy = by - ay, l2 = dx*dx + dy*dy;
        if (l2 < 1e-18) return Math.hypot(px - ax, py - ay);
        let t = ((px-ax)*dx + (py-ay)*dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
      };
      const cruzan = (a, b2) => { const o = (px,py,qx,qy,rx,ry) => (qx-px)*(ry-py)-(qy-py)*(rx-px);
        const d1=o(a[0],a[1],a[2],a[3],b2[0],b2[1]), d2=o(a[0],a[1],a[2],a[3],b2[2],b2[3]);
        const d3=o(b2[0],b2[1],b2[2],b2[3],a[0],a[1]), d4=o(b2[0],b2[1],b2[2],b2[3],a[2],a[3]);
        return ((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0)); };
      const ssd = (a, b2) => cruzan(a, b2) ? 0 : Math.min(
        pSD(a[0],a[1],b2[0],b2[1],b2[2],b2[3]), pSD(a[2],a[3],b2[0],b2[1],b2[2],b2[3]),
        pSD(b2[0],b2[1],a[0],a[1],a[2],a[3]), pSD(b2[2],b2[3],a[0],a[1],a[2],a[3]));
      let rendijas = 0, fundidos = 0, peor = Infinity;
      for (let x = 0; x < segs.length; x++) for (let y = x + 1; y < segs.length; y++) {
        const A = segs[x], Bs = segs[y];
        if (A[4] === Bs[4] && Math.abs(A[5] - Bs[5]) < 2) continue;
        const d = ssd(A, Bs);
        if (d <= Wb * (1 + 1e-6)) { fundidos++; continue; }
        if (d < D * (1 - 1e-6)) {
          const a1 = Math.atan2(A[3]-A[1], A[2]-A[0]), a2 = Math.atan2(Bs[3]-Bs[1], Bs[2]-Bs[0]);
          let ang = Math.abs((a1-a2)*180/Math.PI) % 180; if (ang > 90) ang = 180 - ang;
          if (ang < (g.CRUCE_MIN || 38)) rendijas++;
          if (d / D < peor) peor = d / D;
        }
      }
      filasOut.push({ n: r.nombre, trazos: out.cintas, ojos: out.ojos.length,
                      ocup: +(out.ocupacion * 100).toFixed(1),
                      rendijas, fundidos, peor: peor === Infinity ? 1 : +peor.toFixed(3) });
    });
    return { png: big.toDataURL('image/png'), filas: filasOut };
  }, { RECETAS, LADO });

  fs.writeFileSync(out, Buffer.from(res.png.split(',')[1], 'base64'));
  res.filas.forEach(f => console.log(JSON.stringify(f)));
  const mal = res.filas.filter(f => f.rendijas > 0);
  console.log(`\n${out} · ${res.filas.length} replicas`);
  console.log(mal.length
    ? `  ${mal.length} replicas INCUMPLEN la regla dura — y eso es el hallazgo, no el fallo:\n` +
      mal.map(f => `    ${f.n}: ${f.rendijas} rendijas, la peor a ${f.peor} canales`).join('\n')
    : '  ninguna replica incumple la regla dura');
  await b.close();
})();
