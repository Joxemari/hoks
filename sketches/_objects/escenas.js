/* hoks · escenas — las fotos.
 *
 * Una escena recibe un lienzo, un tamaño y la obra ya renderizada, y devuelve
 * una FOTO: superficie, objeto, obra encima y la misma luz para las tres cosas.
 * Nada de alzados ni cotas — eso es el muro, que ya existe y contesta otra
 * pregunta. Aquí lo que se busca es una imagen que se pueda publicar.
 *
 *   HOKSESC.list                       → los soportes disponibles
 *   HOKSESC.render(ctx, W, H, art, o)  → pinta la escena o.scene
 *
 * Reglas que valen para todas, y que son las que dan el parecido:
 *
 *   · UNA sola luz, arriba a la izquierda, para todas las escenas. Dos fuentes
 *     incoherentes es lo primero que delata un montaje.
 *   · El objeto se construye en su propio lienzo y se coloca con sombra: así la
 *     sombra es del objeto y no de un rectángulo.
 *   · Nada axial. Un objeto paralelo al canto del cuadro se lee como diagrama;
 *     dos o tres grados de giro bastan para que se lea como foto.
 *   · El acabado (viñeta, grado, grano) va al final y sobre TODO el cuadro: una
 *     cámara mete el mismo defecto en todo lo que entra por el objetivo, y ese
 *     defecto compartido es lo que dice que hay una sola foto.
 *   · Todo se mide contra W, H o min(W,H): la escena no puede suponer ni
 *     proporción ni resolución, igual que un algo.js.
 */
(function (global) {
  'use strict';

  const M = global.HOKSMOCK;
  const TAU = Math.PI * 2;

  const list = [
    { id: 'foto',     label: 'Tu foto',  sub: 'montaje sobre foto', needsPhoto: true },
    { id: 'pared',    label: 'Pared',    sub: 'el pliego colgado' },
    { id: 'camiseta', label: 'Camiseta', sub: 'plano, sobre mesa' },
    { id: 'vinilo',   label: 'Vinilo',   sub: 'funda de 315 mm' },
    { id: 'reloj',    label: 'Reloj',    sub: 'esfera de 38 mm' },
  ];

  // ── Superficie de fondo ─────────────────────────────────────────────────────
  // Un fondo plano no existe en una foto: hay caída de luz y hay grano. Estas
  // dos cosas, y nada más, ya sacan el cuadro del terreno del render.
  function surface(ctx, W, H, o) {
    o = o || {};
    const base = o.base || '#e6e1d8', lo = o.lo || '#c9c3b7';
    const g = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, H);
    g.addColorStop(0, base); g.addColorStop(1, lo);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Textura: ruido grande y muy bajo. Da irregularidad sin dar materia.
    const n = M.noiseField(200, 250, { scale: 14, octaves: 3, seed: (o.seed || 1) + 41 });
    const t = M.makeCanvas(200, 250), tc = t.getContext('2d');
    const img = tc.createImageData(200, 250), P = img.data;
    for (let i = 0; i < n.length; i++) {
      const v = 128 + (n[i] - 0.5) * 26, j = i * 4;
      P[j] = P[j + 1] = P[j + 2] = v; P[j + 3] = 255;
    }
    tc.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = o.texture == null ? 0.32 : o.texture;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(t, 0, 0, W, H);
    ctx.restore();
  }

  // La obra sobre papel: la tinta impresa nunca llega al brillo de la pantalla,
  // y el papel tiene diente. Sin esto el pliego se lee como una pantalla dentro
  // de la foto — que es exactamente lo que no queremos.
  function onPaper(art, w, h, seed) {
    const c = M.makeCanvas(w, h), cx = c.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(art, 0, 0, w, h);
    // Resolución FIJA y frecuencia alta: un campo derivado del lienzo se estira
    // al ampliar y el diente del papel se convierte en manchas. Y amplitud
    // mínima: el papel se nota, no se ve.
    const F = 320;
    const n = M.noiseField(F, F, { scale: 1.9, octaves: 2, seed: seed + 9 });
    M.shade(c, n, F, F, { gain: 2.2, bias: 0.5, dark: 0.055, light: 0.05 });
    return c;
  }

  // ── 0 · Tu foto ─────────────────────────────────────────────────────────────
  // El montaje de verdad. Las otras escenas dibujan la luz; esta la TOMA
  // PRESTADA de una fotografía, que es la única manera de que el resultado sea
  // una foto y no un render. El orden importa y es este:
  //
  //   1 · la foto, encajada en el encuadre
  //   2 · la obra proyectada en el quad que ha marcado la mano (homografía)
  //   3 · la obra DOBLADA por el gradiente de luminancia de la foto — donde la
  //       foto tiene un pliegue, la impresión se dobla; sin esto es una pegatina
  //   4 · la luz de la foto encima de la obra: su sombra y su brillo, no otros
  //   5 · grano en la capa de la obra, no en el cuadro: la foto ya trae el suyo,
  //       y lo que hay que hacer es igualarlo, no añadirlo dos veces
  //
  // La foto no se guarda en ningún sitio: vive en el navegador y se acabó. El
  // repo es público y una foto ajena dentro es un problema de licencia; una foto
  // propia tampoco tiene por qué estar en un repo de código.
  function coverRect(iw, ih, W, H) {
    const s = Math.max(W / iw, H / ih);
    const w = iw * s, h = ih * s;
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }

  function foto(ctx, W, H, art, o) {
    const ph = o.photo;
    if (!ph) {
      // Sin foto la escena no existe. Se dice, y no se pinta un sucedáneo.
      ctx.fillStyle = '#e4dfd5'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8a8983';
      ctx.font = `${Math.round(Math.min(W, H) * 0.030)}px 'Courier New',monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('suelta una foto aquí', W / 2, H / 2 - Math.min(W, H) * 0.02);
      ctx.font = `${Math.round(Math.min(W, H) * 0.021)}px 'Courier New',monospace`;
      ctx.fillText('y marca las cuatro esquinas del plano', W / 2, H / 2 + Math.min(W, H) * 0.025);
      return;
    }

    const rect = coverRect(ph.width, ph.height, W, H);
    ctx.drawImage(ph, rect.x, rect.y, rect.w, rect.h);

    const { field, fw, fh } = M.lumField(ph, rect, W, H);

    // El quad llega normalizado (0..1 del encuadre): así sobrevive al cambio de
    // tamaño entre la vista previa y el archivo, que es todo el asunto.
    const q = o.quad.map((v, i) => (i % 2 ? v * H : v * W));

    let layer = M.makeCanvas(W, H);
    M.warpFree(layer, art, q, { steps: 16 });

    if (o.fold > 0) layer = M.displace(layer, field, fw, fh, { amount: Math.min(W, H) * 0.05 * o.fold });

    if (o.light > 0) {
      // La referencia sale de dentro del plano marcado, no del cuadro entero.
      const bias = M.meanIn(field, fw, fh, q, W, H);
      M.shadeLight(layer, field, fw, fh, { bias, gain: 1.5, dark: 1.15 * o.light, light: 0.5 * o.light });
    }
    // Textura fina, a resolución COMPLETA. El campo de luz va a 360 px porque
    // para sombra y pliegue sobra, pero a esa resolución la trama del tejido y
    // el diente del papel ya no existen — y son justo lo que hace que la tinta
    // parezca metida en la superficie. Así que la propia foto, en gris y en
    // `overlay`, se pasa por encima de la obra: transfiere el detalle sin tocar
    // el color. Ni overlay ni multiply respetan el recorte, así que después hay
    // que devolverle el alfa.
    if (o.texture > 0) {
      const keep = M.makeCanvas(W, H);
      keep.getContext('2d').drawImage(layer, 0, 0);
      const lc = layer.getContext('2d');
      lc.save();
      lc.globalCompositeOperation = 'overlay';
      lc.globalAlpha = 0.45 * o.texture;
      lc.filter = 'grayscale(1)';
      lc.drawImage(ph, rect.x, rect.y, rect.w, rect.h);
      lc.filter = 'none';
      lc.globalAlpha = 1;
      lc.globalCompositeOperation = 'destination-in';
      lc.drawImage(keep, 0, 0);
      lc.restore();
    }

    // Grano igualado: una obra generada es perfectamente limpia y una foto no.
    // La diferencia de ruido entre las dos capas es lo que delata un montaje
    // antes que la perspectiva.
    if (o.noise > 0) M.grain(layer.getContext('2d'), W, H, 14 * o.noise, o.seed || 1);

    ctx.save();
    ctx.globalAlpha = o.opacity == null ? 1 : o.opacity;
    // `multiply` es el atajo bueno cuando lo de debajo es claro —una camiseta
    // cruda, papel— porque la tinta deja pasar la trama. Sobre oscuro se come la
    // obra, y entonces manda el modo normal con la luz de la foto encima.
    if (o.blend === 'multiply') ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  // ── 1 · Pared ───────────────────────────────────────────────────────────────
  // El pliego colgado, con la pared girada un par de grados, un paño de luz
  // entrando y algo desenfocado delante. El desenfoque de primer plano es el que
  // más trabaja: da profundidad, y de paso tapa lo que un dibujo a mano no puede
  // sostener a foco.
  function pared(ctx, W, H, art, o) {
    const S = Math.min(W, H), seed = o.seed >>> 0;
    const r = M.rng(seed);

    // Pared: más caliente arriba a la izquierda, donde está la luz.
    const g = ctx.createLinearGradient(0, 0, W * 0.85, H);
    g.addColorStop(0, '#f4efe4'); g.addColorStop(0.42, '#e6dfd2');
    g.addColorStop(0.78, '#cec6b7'); g.addColorStop(1, '#b3ab9c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Paño de luz de ventana: un paralelogramo muy difuso. Es el detalle que más
    // rápido convierte una pared en una habitación.
    ctx.save();
    ctx.filter = `blur(${S * 0.05}px)`;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255,246,222,0.22)';
    ctx.beginPath();
    ctx.moveTo(-W * 0.05, H * 0.02); ctx.lineTo(W * 0.42, -H * 0.04);
    ctx.lineTo(W * 0.64, H * 0.55); ctx.lineTo(W * 0.10, H * 0.72);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Grano de gotelé, muy bajo: una pared pintada no es un degradado liso.
    const wn = M.noiseField(260, 330, { scale: 1.7, octaves: 3, seed: seed + 3 });
    const wt = M.makeCanvas(260, 330), wc = wt.getContext('2d');
    const wi = wc.createImageData(260, 330), WP = wi.data;
    for (let i = 0; i < wn.length; i++) {
      const v = 128 + (wn[i] - 0.5) * 30, j = i * 4;
      WP[j] = WP[j + 1] = WP[j + 2] = v; WP[j + 3] = 255;
    }
    wc.putImageData(wi, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.30;
    ctx.drawImage(wt, 0, 0, W, H); ctx.restore();

    // El pliego. Proporción real de la obra, alto en función del cuadro, y la
    // pared girada: el canto derecho queda un pelo más corto que el izquierdo.
    const ar = art.width / art.height;
    let ph = S * (ar > 1.2 ? 0.46 : 0.60), pw = ph * ar;
    if (pw > W * 0.72) { pw = W * 0.72; ph = pw / ar; }
    const cx = W * 0.47, cy = H * 0.42;
    const tilt = 0.982;                       // acortamiento del canto lejano
    const x0 = cx - pw / 2, x1 = cx + pw / 2;
    const hL = ph, hR = ph * tilt;
    const yL = cy - hL / 2, yR = cy - hR / 2 + ph * 0.004;
    const quad = [x0, yL, x1, yR, x1, yR + hR, x0, yL + hL];

    const paper = onPaper(art, Math.round(pw * 1.2), Math.round(ph * 1.2), seed);

    // Sombra proyectada: corta y difusa, hacia abajo y a la derecha, porque la
    // luz está arriba a la izquierda. Y el canto de arriba casi no la tiene: la
    // estampa está pegada a la pared.
    M.shadow(ctx, c => {
      c.beginPath();
      c.moveTo(quad[0], quad[1]); c.lineTo(quad[2], quad[3]);
      c.lineTo(quad[4], quad[5]); c.lineTo(quad[6], quad[7]);
      c.closePath(); c.fill();
    }, { blur: S * 0.045, dx: S * 0.012, dy: S * 0.018, color: 'rgba(40,33,24,0.42)' });

    M.warp(ctx, paper, quad);

    // Canto: una estampa a sangre no tiene marco, pero sí tiene borde de papel
    // recibiendo la luz por arriba y sombra propia por abajo.
    ctx.save();
    ctx.lineWidth = Math.max(1, S * 0.0016);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.moveTo(quad[0], quad[1]); ctx.lineTo(quad[2], quad[3]); ctx.stroke();
    ctx.strokeStyle = 'rgba(30,24,16,0.20)';
    ctx.beginPath(); ctx.moveTo(quad[6], quad[7]); ctx.lineTo(quad[4], quad[5]); ctx.stroke();
    ctx.restore();

    // Primer plano desenfocado: una rama entrando por abajo a la derecha. No hay
    // que dibujarla bien —está fuera de foco— y a cambio da la profundidad que
    // una pared frontal no puede dar sola.
    ctx.save();
    ctx.filter = `blur(${S * 0.028}px)`;
    ctx.globalAlpha = 0.92;
    const bx = W * 1.02, by = H * 1.06;
    ctx.strokeStyle = '#3c4433'; ctx.lineWidth = S * 0.012; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(W * 0.86, H * 0.86, W * 0.72, H * 0.80);
    ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const t = 0.04 + i * 0.062;
      const lx = bx + (W * 0.70 - bx) * t + S * r.range(-0.03, 0.03);
      const ly = by + (H * 0.78 - by) * t + S * r.range(-0.03, 0.03);
      const ang = -0.75 + r.range(-0.5, 0.5) + (i % 2 ? 1.7 : 0);
      const L = S * r.range(0.10, 0.19), Wd = L * r.range(0.34, 0.46);
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang);
      // Hoja lanceolada, no elipse: dos cuadráticas que se juntan en punta. Aun
      // desenfocada, la punta se nota — una elipse se lee como una mancha.
      ctx.fillStyle = i % 3 === 0 ? '#4c563d' : (i % 3 === 1 ? '#39422e' : '#2c3324');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(L * 0.45, -Wd * 0.5, L, 0);
      ctx.quadraticCurveTo(L * 0.45, Wd * 0.5, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Un suelo apenas insinuado abajo: sin él el encuadre no tiene abajo.
    ctx.save();
    ctx.filter = `blur(${S * 0.02}px)`;
    const fg = ctx.createLinearGradient(0, H * 0.93, 0, H);
    fg.addColorStop(0, 'rgba(70,58,44,0)'); fg.addColorStop(1, 'rgba(60,49,36,0.55)');
    ctx.fillStyle = fg; ctx.fillRect(0, H * 0.9, W, H * 0.1);
    ctx.restore();
  }

  // ── 2 · Camiseta ────────────────────────────────────────────────────────────
  // Plano cenital sobre mesa. Aquí el realismo está entero en dos cosas: que la
  // impresión se DESPLACE con los pliegues (si no, es una pegatina) y que la
  // tinta pierda algo de fuerza al entrar en el algodón (si no, es una pantalla
  // cosida a una camiseta).
  const TEE = 'M370 42 L180 55 L40 240 L132 345 L200 278 L200 745 L700 745 L700 278 ' +
              'L768 345 L860 240 L720 55 L530 42 C500 108 400 108 370 42 Z';

  function camiseta(ctx, W, H, art, o) {
    const S = Math.min(W, H), seed = o.seed >>> 0;
    const dark = o.material === 'tinta';
    surface(ctx, W, H, dark ? { base: '#cfc8bb', lo: '#a49b8c', seed }
                            : { base: '#c8bfae', lo: '#9c9384', seed });

    // La prenda, en su propio lienzo y en sus proporciones (900 × 780).
    const gw = Math.round(Math.min(W * 0.94, S * 1.05)), gh = Math.round(gw * 780 / 900);
    const g = M.makeCanvas(gw, gh), gc = g.getContext('2d');
    const k = gw / 900;
    gc.save(); gc.scale(k, k);
    gc.fillStyle = dark ? '#1d1d20' : '#e3ddd2';
    gc.beginPath(); pathFrom(gc, TEE); gc.fill();
    gc.restore();

    // Pliegues de la prenda. Los surcos caen en vertical porque una camiseta
    // extendida guarda la memoria de estar doblada y colgada.
    // Resolución FIJA del campo, no derivada del lienzo: si depende del tamaño,
    // la vista previa y el archivo exportado salen con pliegues distintos, y
    // entonces lo que se mira no es lo que se guarda.
    const fw = 240, fh = 208;
    const folds = M.foldField(fw, fh, { seed, folds: 7, angle: Math.PI / 2 + 0.15,
                                        scale: Math.max(fw, fh) / 2.6 });
    M.shade(g, folds, fw, fh, { gain: 2.3, bias: 0.5,
                                dark: dark ? 0.55 : 0.40, light: dark ? 0.14 : 0.20 });

    // Oclusión de canto: el grosor de la tela. Se traza la silueta con un trazo
    // ancho y desenfocado recortado a ella misma, así que solo entra hacia dentro.
    gc.save();
    gc.scale(k, k);
    gc.beginPath(); pathFrom(gc, TEE); gc.clip();
    gc.filter = `blur(${Math.max(2, 22 / k * 0.5)}px)`;
    gc.globalCompositeOperation = 'source-atop';
    gc.strokeStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(74,62,46,0.38)';
    gc.lineWidth = 46;
    gc.beginPath(); pathFrom(gc, TEE); gc.stroke();
    gc.restore();

    // El estampado. Área de pecho, la obra entera dentro y colgada de arriba,
    // que es como se coloca de verdad.
    const ar = art.width / art.height;
    const maxW = 300 * k, maxH = 360 * k;
    let iw = maxW, ih = iw / ar;
    if (ih > maxH) { ih = maxH; iw = ih * ar; }
    const ix = Math.round(450 * k - iw / 2), iy = Math.round(205 * k);

    // 1 · la obra al tamaño del estampado
    const ink = M.makeCanvas(Math.round(iw), Math.round(ih));
    const ic = ink.getContext('2d');
    ic.imageSmoothingQuality = 'high';
    ic.drawImage(art, 0, 0, ink.width, ink.height);
    // 2 · desplazada por LOS pliegues que le tocan, no por unos nuevos
    const sf = M.sub(folds, fw, fh, ix / gw * fw, iy / gh * fh, iw / gw * fw, ih / gh * fh);
    const sfw = Math.round(iw / gw * fw), sfh = Math.round(ih / gh * fh);
    const moved = M.displace(ink, sf, sfw, sfh, { amount: S * 0.020 });
    // 3 · la misma luz de la tela sobre la tinta, y algo MÁS marcada que en la
    //     tela: es lo único que impide que el estampado se lea como una pegatina.
    M.shade(moved, sf, sfw, sfh, { gain: 2.1, bias: 0.5, dark: 0.42, light: 0.22 });

    gc.save();
    // La tinta entra en el hilo: pierde un poco de cuerpo y de canto. Un 0,93 de
    // alfa y medio píxel de desenfoque es toda la diferencia entre serigrafía y
    // captura de pantalla.
    gc.globalAlpha = 0.93;
    gc.filter = `blur(${Math.max(0.3, S * 0.0008)}px)`;
    gc.drawImage(moved, ix, iy);
    gc.restore();

    // Trama de tejido sobre TODO, prenda y tinta: en la realidad la trama está
    // encima de la tinta, porque la tinta está dentro del hilo.
    M.weave(gc, 0, 0, gw, gh, { step: Math.max(2, Math.round(S * 0.0035)), alpha: 0.055 });

    // Costuras: cuello, bajo y mangas. Van al final para que la trama no las coma.
    gc.save(); gc.scale(k, k);
    gc.lineWidth = 2.2; gc.setLineDash([7, 5]);
    gc.strokeStyle = dark ? 'rgba(255,255,255,0.16)' : 'rgba(60,50,38,0.20)';
    gc.beginPath(); gc.moveTo(200, 726); gc.lineTo(700, 726); gc.stroke();
    gc.beginPath(); gc.moveTo(124, 330); gc.lineTo(196, 268); gc.stroke();
    gc.beginPath(); gc.moveTo(776, 330); gc.lineTo(704, 268); gc.stroke();
    gc.setLineDash([]);
    gc.lineWidth = 9; gc.strokeStyle = dark ? 'rgba(255,255,255,0.10)' : 'rgba(70,58,44,0.13)';
    gc.beginPath(); gc.moveTo(366, 58); gc.bezierCurveTo(400, 120, 500, 120, 534, 58); gc.stroke();
    gc.restore();

    // Y ahora se recorta a la silueta. La trama y las costuras se pintan sobre el
    // lienzo entero —es más simple y más rápido que ir recortando cada una— así
    // que al final se borra lo que caiga fuera de la prenda. Sin esto se veía la
    // caja del lienzo alrededor de la camiseta, que es el error que más grita.
    gc.save();
    gc.globalCompositeOperation = 'destination-in';
    gc.scale(k, k);
    gc.fillStyle = '#000';
    gc.beginPath(); pathFrom(gc, TEE); gc.fill();
    gc.restore();

    // Y a la mesa, girada, con su sombra. La sombra es de la silueta, no de la
    // caja: por eso la prenda se ha construido aparte.
    const cxp = W / 2, cyp = H * 0.51;
    ctx.save();
    ctx.translate(cxp, cyp); ctx.rotate(-0.035); ctx.translate(-gw / 2, -gh / 2);
    // Dos sombras: la de contacto (corta y oscura, dice que está apoyada) y la
    // proyectada (larga y difusa, dice de dónde viene la luz). Con una sola la
    // prenda flota o parece pegada, nunca apoyada.
    ctx.shadowColor = 'rgba(38,30,21,0.34)';
    ctx.shadowBlur = S * 0.075;
    ctx.shadowOffsetX = S * 0.022; ctx.shadowOffsetY = S * 0.034;
    ctx.drawImage(g, 0, 0);
    ctx.shadowColor = 'rgba(30,24,16,0.42)';
    ctx.shadowBlur = S * 0.012;
    ctx.shadowOffsetX = S * 0.004; ctx.shadowOffsetY = S * 0.006;
    ctx.drawImage(g, 0, 0);
    ctx.restore();
  }

  // ── 3 · Vinilo ──────────────────────────────────────────────────────────────
  // Funda de 315 mm apoyada, girada, con el disco saliendo y un brillo cruzado.
  // El brillo es lo que dice "cartón plastificado"; sin él es una cartulina.
  function vinilo(ctx, W, H, art, o) {
    const S = Math.min(W, H), seed = o.seed >>> 0;
    surface(ctx, W, H, { base: '#26262a', lo: '#0e0e10', seed, texture: 0.3 });

    // Luz dura entrando por la izquierda: en fondo oscuro el objeto se dibuja
    // con el brillo, no con el contorno.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.18, H * 0.10, S * 0.02, W * 0.18, H * 0.10, S * 1.05);
    lg.addColorStop(0, 'rgba(255,246,226,0.30)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const side = Math.min(W * 0.66, S * 0.68);
    const cx = W * 0.44, cy = H * 0.50;
    const tilt = 0.90;                        // la funda gira sobre su vertical
    const x0 = cx - side / 2, x1 = cx + side / 2;
    const hL = side, hR = side * tilt;
    const yL = cy - hL / 2, yR = cy - hR / 2;
    const quad = [x0, yL, x1, yR, x1, yR + hR, x0, yL + hL];

    // El disco, detrás y asomando por el canto lejano.
    const dR = side * 0.475, dcx = x1 - dR * 0.42, dcy = cy;
    ctx.save();
    ctx.translate(dcx, dcy); ctx.scale(1, 0.995);
    const dg = ctx.createRadialGradient(-dR * 0.4, -dR * 0.4, dR * 0.05, 0, 0, dR);
    dg.addColorStop(0, '#3a3a3e'); dg.addColorStop(0.5, '#17171a'); dg.addColorStop(1, '#0b0b0d');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.arc(0, 0, dR, 0, TAU); ctx.fill();
    // Surcos: círculos finísimos. Es lo que hace que el negro no sea un agujero.
    ctx.strokeStyle = 'rgba(255,255,255,0.075)';
    ctx.lineWidth = Math.max(0.5, S * 0.0009);
    for (let rr = dR * 0.32; rr < dR * 0.985; rr += Math.max(1.4, S * 0.0042)) {
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke();
    }
    // Canto del disco: en fondo oscuro, un negro sin brillo es un agujero, no un
    // objeto. La luz que resbala por el borde es lo que lo saca del fondo.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const eg = ctx.createRadialGradient(0, 0, dR * 0.9, 0, 0, dR);
    eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(0.82, 'rgba(214,206,188,0.16)');
    eg.addColorStop(1, 'rgba(236,228,208,0.45)');
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.arc(0, 0, dR, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#d8d2c4';
    ctx.beginPath(); ctx.arc(0, 0, dR * 0.31, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0e0e10';
    ctx.beginPath(); ctx.arc(0, 0, dR * 0.022, 0, TAU); ctx.fill();
    ctx.restore();

    // Sombra de la funda sobre la mesa y sobre el disco.
    M.shadow(ctx, c => {
      c.beginPath();
      c.moveTo(quad[0], quad[1]); c.lineTo(quad[2], quad[3]);
      c.lineTo(quad[4], quad[5]); c.lineTo(quad[6], quad[7]);
      c.closePath(); c.fill();
    }, { blur: S * 0.06, dx: S * 0.02, dy: S * 0.03, color: 'rgba(0,0,0,0.8)' });

    const sleeve = onPaper(art, Math.round(side * 1.15), Math.round(side * 1.15), seed);
    M.warp(ctx, sleeve, quad);

    // Brillo cruzado del plastificado + oscurecimiento hacia el canto lejano.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(quad[0], quad[1]); ctx.lineTo(quad[2], quad[3]);
    ctx.lineTo(quad[4], quad[5]); ctx.lineTo(quad[6], quad[7]);
    ctx.closePath(); ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    const sg = ctx.createLinearGradient(x0, yL, x1, yL + hL);
    sg.addColorStop(0, 'rgba(255,252,240,0.00)');
    sg.addColorStop(0.30, 'rgba(255,252,240,0.20)');
    sg.addColorStop(0.42, 'rgba(255,252,240,0.03)');
    sg.addColorStop(1, 'rgba(255,252,240,0)');
    ctx.fillStyle = sg; ctx.fillRect(x0, yL, side, hL);
    ctx.globalCompositeOperation = 'multiply';
    const fg = ctx.createLinearGradient(x0, 0, x1, 0);
    fg.addColorStop(0, 'rgba(255,255,255,1)');
    fg.addColorStop(0.55, 'rgba(226,222,214,1)');
    fg.addColorStop(1, 'rgba(150,146,140,1)');
    ctx.fillStyle = fg; ctx.fillRect(x0, yL - 2, side, hL + 4);
    ctx.restore();

    // Canto vivo del cartón en el borde cercano: 2 mm de grosor que se ven.
    ctx.save();
    ctx.strokeStyle = 'rgba(255,250,238,0.30)';
    ctx.lineWidth = Math.max(1, S * 0.0022);
    ctx.beginPath(); ctx.moveTo(quad[0], quad[1]); ctx.lineTo(quad[6], quad[7]); ctx.stroke();
    ctx.restore();
  }

  // ── 4 · Reloj ───────────────────────────────────────────────────────────────
  // Bodegón: la esfera es un disco de 38 mm y lo que hay que ver es justo eso —a
  // esa escala la obra da un tono y un gesto, no un sistema—. El cristal es
  // obligatorio: sin reflejo, la obra parece pintada en la caja.
  function reloj(ctx, W, H, art, o) {
    const S = Math.min(W, H), seed = o.seed >>> 0;
    surface(ctx, W, H, { base: '#2a2a2e', lo: '#101012', seed, texture: 0.34 });
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lg = ctx.createRadialGradient(W * 0.24, H * 0.14, S * 0.02, W * 0.30, H * 0.20, S * 0.95);
    lg.addColorStop(0, 'rgba(255,247,230,0.34)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const R = S * 0.215;                        // radio de la caja
    const cx = W * 0.5, cy = H * 0.48;

    // Correa: dos tramos que se van de cuadro curvándose. Se dibuja antes que la
    // caja porque pasa por debajo.
    const strapW = R * 1.02;
    ctx.save();
    for (const dir of [-1, 1]) {
      const grd = ctx.createLinearGradient(cx - strapW / 2, 0, cx + strapW / 2, 0);
      grd.addColorStop(0, '#4a3a2c'); grd.addColorStop(0.35, '#6d5641');
      grd.addColorStop(0.7, '#553f2f'); grd.addColorStop(1, '#33261c');
      ctx.fillStyle = grd;
      // Una banda, no una almendra: los dos cantos van casi paralelos y solo se
      // estrechan un poco al alejarse. Con los bezier apuntando hacia fuera la
      // correa se hinchaba por el medio y parecía un huso.
      const y0 = cy + dir * R * 0.72, y1 = cy + dir * S * 0.62;
      const wA = strapW / 2, wB = strapW * 0.40, bow = R * 0.10 * dir;
      ctx.beginPath();
      ctx.moveTo(cx - wA, y0);
      ctx.bezierCurveTo(cx - wA - bow * 0.3, y0 + (y1 - y0) * 0.45,
                        cx - wB - bow * 0.2, y0 + (y1 - y0) * 0.75, cx - wB, y1);
      ctx.lineTo(cx + wB, y1);
      ctx.bezierCurveTo(cx + wB + bow * 0.2, y0 + (y1 - y0) * 0.75,
                        cx + wA + bow * 0.3, y0 + (y1 - y0) * 0.45, cx + wA, y0);
      ctx.closePath(); ctx.fill();
      // Pespunte
      ctx.save();
      ctx.strokeStyle = 'rgba(228,214,190,0.30)';
      ctx.lineWidth = Math.max(1, S * 0.0022); ctx.setLineDash([S * 0.012, S * 0.010]);
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + s * strapW * 0.38, y0 + dir * R * 0.10);
        ctx.lineTo(cx + s * strapW * 0.30, y1);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // Sombra de la caja sobre la mesa
    M.shadow(ctx, c => { c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); },
             { blur: S * 0.05, dx: S * 0.014, dy: S * 0.022, color: 'rgba(0,0,0,0.85)' });

    // Caja de acero: el aro se hace con un degradado cónico —el brillo gira con
    // la superficie— y no con uno lineal, que sale plano.
    ctx.save();
    const ring = ctx.createConicGradient
      ? ctx.createConicGradient(-0.9, cx, cy)
      : ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    if (ctx.createConicGradient) {
      ring.addColorStop(0.00, '#f2eee6'); ring.addColorStop(0.12, '#9c968c');
      ring.addColorStop(0.30, '#e8e2d6'); ring.addColorStop(0.50, '#6d6862');
      ring.addColorStop(0.68, '#ddd6c9'); ring.addColorStop(0.85, '#8b857c');
      ring.addColorStop(1.00, '#f2eee6');
    } else {
      ring.addColorStop(0, '#eee8dd'); ring.addColorStop(1, '#75706a');
    }
    ctx.fillStyle = ring;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.restore();

    // La esfera: la obra recortada en disco, un poco apagada —está bajo cristal—
    const dR = R * 0.83;
    const dial = M.makeCanvas(Math.round(dR * 2), Math.round(dR * 2));
    const dc = dial.getContext('2d');
    dc.save();
    dc.beginPath(); dc.arc(dR, dR, dR, 0, TAU); dc.clip();
    dc.imageSmoothingQuality = 'high';
    const ar = art.width / art.height;
    const dw = ar >= 1 ? dR * 2 * ar : dR * 2, dh = ar >= 1 ? dR * 2 : dR * 2 / ar;
    dc.drawImage(art, dR - dw / 2, dR - dh / 2, dw, dh);
    dc.restore();
    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.drawImage(dial, cx - dR, cy - dR);
    ctx.restore();

    // Oclusión del aro sobre la esfera: el borde de la esfera está en sombra
    // porque la caja tiene canto. Es lo que le da fondo al disco.
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, dR, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = 'multiply';
    const ao = ctx.createRadialGradient(cx, cy, dR * 0.62, cx, cy, dR);
    ao.addColorStop(0, 'rgba(255,255,255,1)'); ao.addColorStop(1, 'rgba(120,112,100,1)');
    ctx.fillStyle = ao; ctx.fillRect(cx - dR, cy - dR, dR * 2, dR * 2);
    ctx.restore();

    // Agujas, con su sombra: sin sombra están dentro de la esfera, no encima.
    ctx.save();
    ctx.translate(cx, cy);
    for (const pass of [0, 1]) {
      ctx.save();
      if (pass === 0) { ctx.translate(R * 0.035, R * 0.045); ctx.globalAlpha = 0.35; }
      const col = pass === 0 ? '#000' : '#f6f2e8';
      for (const [ang, len, wid] of [[-2.25, dR * 0.52, R * 0.055], [-0.72, dR * 0.80, R * 0.036]]) {
        ctx.save(); ctx.rotate(ang);
        ctx.fillStyle = col;
        ctx.strokeStyle = pass === 1 ? 'rgba(28,24,18,0.55)' : col;
        ctx.lineWidth = Math.max(0.6, S * 0.0012);
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-wid * 0.5, -wid / 2, len + wid * 0.5, wid, wid / 2)
                      : ctx.rect(-wid * 0.5, -wid / 2, len + wid * 0.5, wid);
        ctx.fill(); if (pass === 1) ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = pass === 1 ? '#e9e3d6' : col;
      ctx.beginPath(); ctx.arc(0, 0, R * 0.045, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Cristal: un arco de reflejo y un velo. Es lo último y es lo que dice que
    // hay un cristal — sin él la obra parece pintada sobre la caja.
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, dR, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-0.5);
    const glare = ctx.createLinearGradient(0, -dR, 0, dR * 0.4);
    glare.addColorStop(0, 'rgba(255,255,255,0.46)');
    glare.addColorStop(0.55, 'rgba(255,255,255,0.10)');
    glare.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glare;
    ctx.beginPath();
    ctx.ellipse(-dR * 0.15, -dR * 0.55, dR * 0.92, dR * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // Corona
    ctx.save();
    const crg = ctx.createLinearGradient(cx + R, cy - R * 0.1, cx + R * 1.16, cy + R * 0.1);
    crg.addColorStop(0, '#e6e0d4'); crg.addColorStop(1, '#7a746c');
    ctx.fillStyle = crg;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cx + R * 0.97, cy - R * 0.10, R * 0.17, R * 0.20, R * 0.04)
                  : ctx.rect(cx + R * 0.97, cy - R * 0.10, R * 0.17, R * 0.20);
    ctx.fill();
    ctx.restore();
  }

  // Un `d` de SVG mínimo (M, L, C, Z) sobre un contexto 2D: la silueta de la
  // prenda ya estaba escrita así y no hay motivo para transcribirla a mano.
  function pathFrom(c, d) {
    const t = d.match(/[MLCZ][^MLCZ]*/gi) || [];
    let px = 0, py = 0;
    for (const seg of t) {
      const n = (seg.slice(1).trim().match(/-?[\d.]+/g) || []).map(Number);
      const k = seg[0].toUpperCase();
      if (k === 'M') { c.moveTo(n[0], n[1]); px = n[0]; py = n[1]; }
      else if (k === 'L') { for (let i = 0; i < n.length; i += 2) { c.lineTo(n[i], n[i + 1]); px = n[i]; py = n[i + 1]; } }
      else if (k === 'C') { c.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]); px = n[4]; py = n[5]; }
      else if (k === 'Z') c.closePath();
    }
  }

  const SCENES = { foto, pared, camiseta, vinilo, reloj };

  function render(ctx, W, H, art, o) {
    o = o || {};
    const fn = SCENES[o.scene] || pared;
    ctx.save();
    fn(ctx, W, H, art, o);
    ctx.restore();
    // El acabado, para las escenas SINTÉTICAS: es lo que las hace la misma foto.
    // Sobre un montaje no va — la fotografía ya trae su viñeta, su temperatura y
    // su grano, y ponerle otros encima es fotografiar una foto.
    if (o.finish !== false && o.scene !== 'foto') {
      M.grade(ctx.canvas, { seed: o.seed, lx: 0.28, ly: 0.12,
                            grainAmount: o.scene === 'pared' ? 8 : 10 });
    }
  }

  global.HOKSESC = { list, render };
})(typeof window !== 'undefined' ? window : globalThis);
