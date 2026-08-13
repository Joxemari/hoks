/* hoks · firma — el sistema no firma, pero sabe dónde hay sitio.
 *
 * De la regla 01 de impresión —el fondo va a sangre, no hay margen blanco— sale
 * una consecuencia que no es de gusto: **no existe reserva de papel donde
 * firmar**. La firma cae sobre la tinta. Y sobre la tinta el grafito se ve o no
 * se ve según lo que haya debajo, así que el sitio no puede ser fijo: se busca.
 *
 * Lo que este módulo NO hace es firmar. Una firma que sale del código no
 * acredita nada —mismo seed, mismo algoritmo, misma firma, mil veces— y por eso
 * no está en ningún algo.js ni toca la exportación. Lo que hace es medir el
 * píxel ya renderizado y decir dónde cabe la mano y con qué se la va a ver.
 *
 *   HOKSFIRMA.spot(ctx, W, H, opts)   → { x, y, w, h, L, sd, edge, tool, mm… }
 *   HOKSFIRMA.spotFromPixels(px, opts)→ lo mismo sin DOM (el script de medida)
 *   HOKSFIRMA.mark(ctx, spot, opts)   → pinta la reserva — vista previa, nunca papel
 *   HOKSFIRMA.printed(ctx, spot, o)   → la otra opción, impresa, para compararlas
 *
 * La caja NO escala con el pliego: una firma mide lo que mide una mano —58 × 14
 * mm— en A4 y en A1. Es el mismo supuesto que hace el muro con la figura de
 * 1,70 m: la obra crece, el cuerpo no. De ahí que en A4 la firma pese el doble
 * que en A1, que es exactamente lo que pasa en la obra gráfica de verdad.
 */
(function (global) {
  'use strict';

  const SIG_MM  = [58, 14];   // caja de firma, en mm de papel
  const EDGE_MM = 14;         // retirada del canto derecho e inferior
  const STEP_MM = 3;          // paso de la búsqueda a lo largo de la banda
  const K = 4;                // reducción para medir (ver abajo)

  // Umbrales, medidos sobre las obras guardadas (ver impresion.html §03).
  const QUIET_SD = 9, QUIET_EDGE = 0.004;
  const L_GRAFITO = 105, L_JUSTO = 70;
  const DEFAULT_SHORT_MM = 297;   // A3, el pliego por defecto del motor

  // El grano de film es ruido de alta frecuencia: a 1:1 dispara cualquier
  // detector de bordes y haría creer que no hay un solo sitio tranquilo en toda
  // la obra. Se mide sobre una reducción 1:K, donde el grano se promedia y la
  // figura —que es estructura grande— sobrevive. Mismo truco que la medida del
  // margen de composición, y por el mismo motivo.
  function lumaGrid(data, w, h, k) {
    const gw = Math.max(1, Math.floor(w / k)), gh = Math.max(1, Math.floor(h / k));
    const g = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        let s = 0, n = 0;
        for (let j = 0; j < k; j++) {
          const yy = y * k + j;
          if (yy >= h) break;
          for (let i = 0; i < k; i++) {
            const xx = x * k + i;
            if (xx >= w) break;
            const p = (yy * w + xx) << 2;
            s += 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
            n++;
          }
        }
        g[y * gw + x] = n ? s / n : 0;
      }
    }
    return { g, gw, gh };
  }

  // Estadística de una caja del retículo reducido: cuánta luz hay (¿se ve el
  // grafito?) y cuán quieta está (¿cruza la firma un borde de figura?).
  function stats(G, x0, y0, bw, bh) {
    const { g, gw } = G;
    let n = 0, s = 0, s2 = 0, edge = 0;
    for (let y = y0; y < y0 + bh; y++) {
      for (let x = x0; x < x0 + bw; x++) {
        const v = g[y * gw + x];
        s += v; s2 += v * v; n++;
        if (x > x0 && Math.abs(v - g[y * gw + x - 1]) > 26) edge++;
        if (y > y0 && Math.abs(v - g[(y - 1) * gw + x]) > 26) edge++;
      }
    }
    const mean = n ? s / n : 0;
    return { L: mean, sd: Math.sqrt(Math.max(0, (n ? s2 / n : 0) - mean * mean)), edge: n ? edge / n : 1 };
  }

  // Con qué lápiz se firma encima. No es preferencia: es si se ve. Lo que NO
  // cambia nunca es que se firme a mano — cambia la mina, no el gesto.
  //   grafito  — fondo claro, el lápiz muerde y contrasta
  //   justo    — zona media: el grafito se ve poco y además reluce sobre tinta
  //   blanco   — fondo oscuro: grafito invisible, lápiz blanco legible
  function toolFor(L) { return L >= L_GRAFITO ? 'grafito' : L >= L_JUSTO ? 'justo' : 'blanco'; }

  function spotFromPixels(px, opts) {
    opts = opts || {};
    const data = px.data, W = px.width, H = px.height;
    const shortMm = opts.sheetMm ? Math.min(opts.sheetMm[0], opts.sheetMm[1]) : DEFAULT_SHORT_MM;
    const pxMm = Math.min(W, H) / shortMm;          // píxeles por milímetro de papel
    const k = Math.max(1, Math.round((opts.k || K)));
    const G = lumaGrid(data, W, H, k);

    // Geometría en el retículo reducido.
    const bw = Math.max(2, Math.round(SIG_MM[0] * pxMm / k));
    const bh = Math.max(2, Math.round(SIG_MM[1] * pxMm / k));
    const edge = Math.round(EDGE_MM * pxMm / k);
    const step = Math.max(1, Math.round(STEP_MM * pxMm / k));
    const y0 = G.gh - edge - bh;
    const xMin = edge, xMax = G.gw - edge - bw;
    if (y0 < 0 || xMax < xMin) return null;         // el pliego no da ni para la mano

    // Se recorre la banda inferior entera y se guardan todas las posiciones.
    const cands = [];
    for (let x = xMin; x <= xMax; x += step) {
      const st = stats(G, x, y0, bw, bh);
      cands.push({ gx: x, ...st });
    }

    // La elección es léxica, no una suma de pesos con coeficientes inventados:
    //   1. de las cajas QUIETAS —sin borde de figura dentro—, la de más a la
    //      derecha en la que además se VEA el lápiz. La derecha es donde la
    //      firma ha ido siempre en obra gráfica, así que solo se abandona a
    //      cambio de algo: que la marca exista;
    //   2. si en ninguna quieta se ve bien, aquella en la que al menos se vea;
    //      si en ninguna, la quieta de más a la derecha igualmente —el sitio es
    //      bueno, lo que cambia es el lápiz—;
    //   3. si no hay ninguna quieta, la menos revuelta, y se avisa.
    const quiet = cands.filter(c => c.sd <= QUIET_SD && c.edge <= QUIET_EDGE);
    const tiers = [quiet.filter(c => c.L >= L_GRAFITO), quiet.filter(c => c.L >= L_JUSTO), quiet];
    let best, crowded = false;
    for (const t of tiers) if (t.length) { best = t[t.length - 1]; break; }
    if (!best) { crowded = true; best = cands.slice().sort((a, b) => (a.edge - b.edge) || (a.sd - b.sd))[0]; }

    const x = best.gx * k, y = y0 * k, w = bw * k, h = bh * k;
    return {
      x, y, w, h,                                   // en píxeles del lienzo medido
      L: best.L, sd: best.sd, edge: best.edge,
      tool: toolFor(best.L), crowded,
      // Y en milímetros del papel, que es donde de verdad va la mano: lo que se
      // mide con la regla sobre la estampa ya impresa.
      mm: {
        right:  +((W - (x + w)) / pxMm).toFixed(1),  // del canto derecho a la caja
        bottom: +((H - (y + h)) / pxMm).toFixed(1),  // del canto inferior
        w: SIG_MM[0], h: SIG_MM[1],
      },
    };
  }

  // La misma estadística sobre una caja QUE SE LE DA, en vez de sobre la que
  // encuentra. Es lo que necesita quien quiera comprobar un sitio concreto —una
  // esquina fija, por ejemplo— y compararlo con el que sale de buscar, sin
  // reimplementar el promediado y salirse de los mismos umbrales.
  function measure(px, box, opts) {
    opts = opts || {};
    const k = Math.max(1, Math.round(opts.k || K));
    const G = lumaGrid(px.data, px.width, px.height, k);
    const x0 = Math.max(0, Math.round(box.x / k)), y0 = Math.max(0, Math.round(box.y / k));
    const bw = Math.max(1, Math.min(G.gw - x0, Math.round(box.w / k)));
    const bh = Math.max(1, Math.min(G.gh - y0, Math.round(box.h / k)));
    const st = stats(G, x0, y0, bw, bh);
    st.tool = toolFor(st.L);
    st.crowded = !(st.sd <= QUIET_SD && st.edge <= QUIET_EDGE);
    return st;
  }

  function spot(ctx, W, H, opts) {
    const px = ctx.getImageData(0, 0, W, H);
    return spotFromPixels({ data: px.data, width: W, height: H }, opts);
  }

  // La reserva, dibujada. Es vista previa: dice dónde va la mano, y nunca se
  // exporta — si esto acabara en el PNG sería una firma impresa, que es
  // justamente lo que no se quiere.
  function mark(ctx, s, opts) {
    if (!s) return;
    opts = opts || {};
    const ink = opts.ink || (s.L >= L_JUSTO ? 'rgba(17,17,17,0.72)' : 'rgba(255,255,255,0.82)');
    const u = Math.max(1, s.h / 26);
    ctx.save();
    ctx.strokeStyle = ink; ctx.lineWidth = u; ctx.setLineDash([u * 5, u * 4]);
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.setLineDash([]);
    ctx.beginPath();                                  // el renglón donde se apoya
    ctx.moveTo(s.x + u * 2, s.y + s.h * 0.82);
    ctx.lineTo(s.x + s.w - u * 2, s.y + s.h * 0.82);
    ctx.stroke();
    if (opts.label !== false) {
      ctx.font = `700 ${Math.round(s.h * 0.3)}px 'Courier New', Courier, monospace`;
      ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(opts.label || s.tool).toUpperCase(), s.x, s.y - u * 3);
    }
    ctx.restore();
  }

  // La otra opción: la firma impresa, dentro del archivo. Está aquí para poder
  // MIRARLA al lado de la anterior y decidir, no porque el lote la use — nadie
  // la llama desde algo.js. Tinta por contraste, que es lo único que puede
  // hacer un mark que no sabe qué habrá debajo.
  function printed(ctx, s, opts) {
    if (!s) return;
    opts = opts || {};
    const txt = opts.text || 'hoks';
    ctx.save();
    ctx.fillStyle = opts.ink || (s.L >= 128 ? '#111' : '#fff');
    ctx.textBaseline = 'alphabetic';
    const size = Math.round(s.h * 0.62);
    ctx.font = `400 ${size}px 'Courier New', Courier, monospace`;
    const track = size * 0.16;
    let cx = s.x;
    for (const ch of txt) { ctx.fillText(ch, cx, s.y + s.h * 0.82); cx += ctx.measureText(ch).width + track; }
    ctx.restore();
  }

  global.HOKSFIRMA = {
    spot, spotFromPixels, measure, mark, printed, toolFor,
    SIG_MM, EDGE_MM, L_GRAFITO, L_JUSTO, QUIET_SD, QUIET_EDGE,
  };
})(typeof window !== 'undefined' ? window : globalThis);
