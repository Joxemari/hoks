/* HOKSPOST — el sistema de diseño de las publicaciones. Componente ÚNICO.
 *
 * Lo que sale a redes (pieza, detalle, fotograma de vídeo, tarjeta de código,
 * story, tarjeta de X) se maqueta aquí y en ningún otro sitio. Antes cada
 * herramienta tenía su formato: BRAND.md pedía 3:4, post.html exportaba 4:5,
 * _social grababa 1:1 y 9:16 y las rutinas estiraban el degradado del borde.
 * Una fila del grid con cuatro reglas no es una fila. Si tocas una plantilla,
 * tócala aquí; la especificación está en BRAND.md §8–9 y la hoja de
 * especímenes en _social/kit.html.
 *
 * No dibuja la obra: recibe un lienzo ya pintado (por el algo.js, a la
 * resolución que pide srcSize, o el PNG publicado) y lo pone en página.
 *
 *   HOKSPOST.piece(src, fmt, meta, opts)  → canvas  obra matada + sello
 *   HOKSPOST.detail(src, fmt, opts)       → canvas  recorte a sangre
 *   HOKSPOST.code(lines, fmt, opts)       → canvas  tarjeta azul de notación
 *   HOKSPOST.row([a,b,c])                 → canvas  comprobación de la fila
 *   HOKSPOST.assembly(draw, w, h)         → {steps, at(frac)}  la obra montándose
 *   HOKSPOST.srcSize(fmt, kind, opts)     → px a los que renderizar la obra
 *   HOKSPOST.stamp(meta) · caption(meta) · TAGS · LINES
 *
 * Vale en navegador (window.HOKSPOST). Sin dependencias.
 */
(function (global) {
  'use strict';

  // ── Tokens (los de nav.js; BRAND.md §1–2) ────────────────────────────────
  const T = {
    paper: '#fbfbfa', ink: '#0a0a0a', blue: '#000ef7', acid: '#dcff32',
    white: '#ffffff', mut: '#8a8983', line: '#e7e5df',
    mono: 'ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace',
  };

  // ── Formatos (BRAND.md §8) ───────────────────────────────────────────────
  // row es el máster: el perfil móvil enseña el grid en 3:4, y una fila se
  // compone con tres casillas iguales. feed solo para lo que no depende de
  // la unión entre casillas.
  const FORMATS = {
    row:   { w: 1080, h: 1440, label: 'fila · 3:4' },
    feed:  { w: 1080, h: 1350, label: 'feed · 4:5' },
    story: { w: 1080, h: 1920, label: 'story · 9:16' },
    x:     { w: 1600, h: 900,  label: 'x · 16:9' },
  };
  function fmtOf(f) { return typeof f === 'string' ? (FORMATS[f] || FORMATS.row) : (f || FORMATS.row); }

  // El margen. Nació igual al de la obra (las familias se retiran del papel un
  // 11 %, E.FIELD_MARGIN), pero en el grid del perfil la pieza se quedaba
  // pequeña: la casilla ya es pequeña y el 11 % más el aire propio de la obra
  // eran demasiado papel. Un 6 % basta para lo único que el margen tiene que
  // hacer aquí: que el recorte del perfil (4:5 → 3:4, ~34 px por lado en 1080)
  // caiga siempre en papel y nunca en la obra.
  const MARGIN = 0.06;
  // La cartela va pegada a la obra, no al borde: es una etiqueta de sala.
  const STAMP_GAP = 0.45;   // × margen, entre la obra y la línea del sello
  const STAMP_SIZE = 0.022; // × lado corto

  // ── Maqueta ──────────────────────────────────────────────────────────────
  function layout(fmt) {
    const F = fmtOf(fmt), W = F.w, H = F.h;
    const m = Math.round(Math.min(W, H) * MARGIN);
    return { W, H, m, box: { x: m, y: m, w: W - 2 * m, h: H - 2 * m } };
  }

  // A qué tamaño renderizar la obra para que nunca se amplíe.
  //   piece: el lado del cuadrado que cabe en la caja (o la caja, si fill).
  //   detail: lo bastante grande para que el recorte salga a 1:1.
  function srcSize(fmt, kind, opts) {
    opts = opts || {};
    const L = layout(fmt);
    if (kind === 'detail') {
      // El recorte mide zoom·S de ancho y W/H de proporción: sale a 1:1 cuando
      // zoom·S ≥ W y cabe en alto cuando S ≥ H.
      const zoom = opts.zoom || DETAIL_ZOOM;
      return Math.ceil(Math.max(L.W / zoom, L.H));
    }
    return Math.floor(Math.min(L.box.w, L.box.h));
  }

  function canvas(W, H) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; return c;
  }
  function hiQ(x) { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; return x; }
  function dims(src) { return { w: src.naturalWidth || src.width, h: src.naturalHeight || src.height }; }

  // ── Sello ────────────────────────────────────────────────────────────────
  // randomSeed(4827) · PLLS · A3 · 1/1   (BRAND.md §7). Lo que falte, no sale.
  function stamp(meta) {
    meta = meta || {};
    const parts = ['randomSeed(' + meta.seed + ')'];
    if (meta.family) parts.push(String(meta.family).toUpperCase());
    if (meta.sheet) parts.push(meta.sheet);
    parts.push(meta.edition || '1/1');
    return parts.join(' · ');
  }
  // Se pinta por tramos: la función en tinta, la notación en gris.
  function drawStamp(x, meta, px, py, size, mat) {
    const strong = mat === 'blue' ? T.acid : T.ink;
    const soft = mat === 'blue' ? T.white : T.mut;
    const rest = stamp(meta).slice(('randomSeed(' + meta.seed + ')').length);
    const runs = [['randomSeed', strong], ['(', soft], [String(meta.seed), strong], [')', soft], [rest, soft]];
    x.font = size + 'px ' + T.mono; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    let cx = px;
    for (const [t, col] of runs) { x.fillStyle = col; x.fillText(t, cx, py); cx += x.measureText(t).width; }
  }

  // ── Plantillas ───────────────────────────────────────────────────────────
  // Obra matada sobre papel (o azul) con el margen del sistema y la cartela
  // debajo, alineada a su canto izquierdo. Cualquier proporción de obra cabe:
  // un PLLS horizontal se queda horizontal.
  //   opts: { mat:'paper'|'blue', stamp:true, into: canvas a reutilizar (vídeo) }
  function piece(src, fmt, meta, opts) {
    opts = opts || {};
    const L = layout(fmt);
    const c = opts.into || canvas(L.W, L.H);
    if (c.width !== L.W || c.height !== L.H) { c.width = L.W; c.height = L.H; }
    const x = hiQ(c.getContext('2d'));
    const mat = opts.mat === 'blue' ? 'blue' : 'paper';
    x.fillStyle = mat === 'blue' ? T.blue : T.paper; x.fillRect(0, 0, L.W, L.H);
    const s = dims(src), k = Math.min(L.box.w / s.w, L.box.h / s.h);
    const w = Math.round(s.w * k), h = Math.round(s.h * k);
    const px = Math.round((L.W - w) / 2), py = Math.round((L.H - h) / 2);
    x.drawImage(src, px, py, w, h);
    if (opts.stamp !== false && meta && meta.seed != null) {
      const size = Math.round(Math.min(L.W, L.H) * STAMP_SIZE);
      drawStamp(x, meta, px, py + h + Math.round(L.m * STAMP_GAP) + size * 0.8, size, mat);
    }
    return c;
  }

  // Detalle a sangre: un recorte de la obra a la proporción del formato. Es
  // lo único que no lleva margen — enseña la materia (grano, canto, cruce),
  // no la composición.
  //   opts: { zoom: 0..1 del lado de la obra, fx, fy: centro 0..1 }
  const DETAIL_ZOOM = 0.56;
  function detail(src, fmt, opts) {
    opts = opts || {};
    const L = layout(fmt), c = canvas(L.W, L.H), x = hiQ(c.getContext('2d'));
    const s = dims(src), ar = L.W / L.H, zoom = opts.zoom || DETAIL_ZOOM;
    let cw = Math.min(s.w, s.h) * zoom, ch = cw / ar;
    if (ch > s.h) { ch = s.h; cw = ch * ar; }
    if (cw > s.w) { cw = s.w; ch = cw / ar; }
    const fx = opts.fx == null ? 0.5 : opts.fx, fy = opts.fy == null ? 0.5 : opts.fy;
    const sx = Math.min(Math.max(0, fx * s.w - cw / 2), s.w - cw);
    const sy = Math.min(Math.max(0, fy * s.h - ch / 2), s.h - ch);
    x.drawImage(src, sx, sy, cw, ch, 0, 0, L.W, L.H);
    return c;
  }

  // Tarjeta de notación (BRAND.md §2–3): fondo azul, palabras en acid,
  // sintaxis en blanco. Para el masthead y los posts de pensamiento.
  //   lines: ['function draw() {', '  code blacksmith', '}']
  const SYNTAX = /[(){}\[\];,.·→=<>"'+\-*/]/;
  function code(lines, fmt, opts) {
    opts = opts || {};
    const L = layout(fmt), c = canvas(L.W, L.H), x = c.getContext('2d');
    x.fillStyle = T.blue; x.fillRect(0, 0, L.W, L.H);
    let size = Math.round(Math.min(L.W, L.H) * 0.046);
    x.font = size + 'px ' + T.mono;
    const widest = Math.max(1, ...lines.map(l => x.measureText(l).width));
    if (widest > L.box.w) { size = Math.floor(size * L.box.w / widest); x.font = size + 'px ' + T.mono; }
    const lh = Math.round(size * 1.55), top = Math.round((L.H - lh * lines.length) / 2 + size);
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    lines.forEach((ln, i) => {
      let cx = L.m; const y = top + i * lh;
      const cut = ln.indexOf('//');
      const body = cut >= 0 ? ln.slice(0, cut) : ln, note = cut >= 0 ? ln.slice(cut) : '';
      for (const ch of body) { x.fillStyle = SYNTAX.test(ch) ? T.white : T.acid; x.fillText(ch, cx, y); cx += x.measureText(ch).width; }
      if (note) { x.fillStyle = T.white; x.globalAlpha = 0.72; x.fillText(note, cx, y); x.globalAlpha = 1; }
    });
    return c;
  }

  // Comprobación de fila: las tres casillas como las enseña el perfil (3:4,
  // separadas por la ranura del grid). No se publica: se mira antes de subir.
  // Orden de lectura, izquierda → derecha: [pieza, assembling, detalle].
  function row(panels, opts) {
    opts = opts || {};
    const cell = opts.cell || 360, gap = opts.gap || 3, ch = Math.round(cell * 4 / 3);
    const c = canvas(cell * 3 + gap * 2, ch), x = hiQ(c.getContext('2d'));
    x.fillStyle = T.white; x.fillRect(0, 0, c.width, c.height);
    panels.slice(0, 3).forEach((p, i) => {
      if (!p) return;
      const s = dims(p), k = Math.max(cell / s.w, ch / s.h);   // cover, como el grid
      const w = s.w * k, h = s.h * k;
      x.save(); x.beginPath(); x.rect(i * (cell + gap), 0, cell, ch); x.clip();
      x.drawImage(p, i * (cell + gap) + (cell - w) / 2, (ch - h) / 2, w, h); x.restore();
    });
    return c;
  }

  // ── Assembling: la obra pintándose sola ──────────────────────────────────
  // Se graban las llamadas de dibujo del algo.js y se reproducen en orden:
  // el fondo de golpe, luego objeto a objeto. Es el mismo mecanismo del splash
  // de la landing; antes estaba copiado en post.html y en _social/harness.html.
  //   const a = assembly((ctx, w, h) => HOKS.DTKRT.render(ctx, w, h, seed, o), w, h)
  //   a.steps        nº de objetos
  //   a.at(frac)     lienzo con la obra montada hasta frac (0..1). Es un lienzo
  //                  COMPARTIDO: se avanza sobre él, no se rehace, así que cópialo
  //                  si lo necesitas guardar.
  const PATH_OPS = { arc: 1, ellipse: 1, moveTo: 1, lineTo: 1, quadraticCurveTo: 1, bezierCurveTo: 1, arcTo: 1, roundRect: 1 };
  const COMMIT_OPS = { fill: 1, stroke: 1, fillRect: 1, strokeRect: 1, drawImage: 1, putImageData: 1, fillText: 1, strokeText: 1 };
  const STYLE_PROPS = ['fillStyle', 'strokeStyle', 'globalAlpha', 'globalCompositeOperation', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'lineDashOffset', 'filter', 'imageSmoothingEnabled', 'imageSmoothingQuality'];
  // Primer objeto: el primer trazo, o el primer rectángulo que no cubre el
  // lienzo entero (lo que lo cubre es el fondo).
  function objStart(ops, w, h) {
    for (let i = 0; i < ops.length; i++) {
      const o = ops[i]; if (!o.m) continue;
      if (PATH_OPS[o.m]) return i;
      if ((o.m === 'fillRect' || o.m === 'rect') && o.a && o.a.length >= 4) {
        const [x, y, ww, hh] = o.a;
        if (!(Math.abs(x) < 2 && Math.abs(y) < 2 && ww >= w * 0.98 && hh >= h * 0.98)) return i;
      }
    }
    return ops.length;
  }
  function replay(x, o) { if (o.p !== undefined) { try { x[o.p] = o.v; } catch (e) {} } else { try { x[o.m].apply(x, o.a); } catch (e) {} } }
  function assembly(draw, w, h) {
    const rec = canvas(w, h), ops = [];
    const proxy = new Proxy(rec.getContext('2d'), {
      get(t, k) { const v = t[k]; return typeof v === 'function' ? function () { const a = [].slice.call(arguments); const r = v.apply(t, a); ops.push({ m: k, a }); return r; } : v; },
      set(t, k, val) { if (STYLE_PROPS.indexOf(k) >= 0) ops.push({ p: k, v: val }); try { t[k] = val; } catch (e) {} return true; },
    });
    draw(proxy, w, h);
    const start = objStart(ops, w, h), chunks = []; let cur = [];
    for (let j = start; j < ops.length; j++) { cur.push(ops[j]); if (ops[j].m && COMMIT_OPS[ops[j].m]) { chunks.push(cur); cur = []; } }
    if (cur.length) chunks.push(cur);
    let work = null, done = -1;
    function reset() {
      work = canvas(w, h); const x = work.getContext('2d');
      for (let i = 0; i < start; i++) replay(x, ops[i]);
      done = 0;
    }
    return {
      steps: chunks.length, final: rec,
      at(frac) {
        const k = Math.max(0, Math.min(chunks.length, Math.round(frac * chunks.length)));
        if (!work || k < done) reset();
        const x = work.getContext('2d');
        for (; done < k; done++) for (const o of chunks[done]) replay(x, o);
        return work;
      },
    };
  }

  // ── Pie y primer comentario (BRAND.md §3, §4, §6) ────────────────────────
  // Pie = palabras, en minúscula; sello en notación p5; hashtags APARTE, en
  // el primer comentario. Las líneas son de la casa, no se inventan por post.
  const LINES = [
    'the process repeats. the result does not.',
    'code proposes. geometry translates. matter negotiates.',
    'the visible is only a shadow.',
    "a system's residue.",
    'one possibility, carried into matter.',
    'selected, then forged.',
    'each execution produces a possibility.',
    'kept. the rest, discarded.',
    'the essence is in the discard.',
    'precision meets matter.',
  ];
  // Un solo juego. Antes convivían dos (post.html y las rutinas semanales).
  const TAGS = '#generativeart #creativecoding #genart #handcodedgoods';
  function caption(meta) {
    meta = meta || {};
    const line = meta.line || LINES[((meta.seed >>> 0) || 0) % LINES.length];
    return line + '\n\n' + stamp(meta);
  }

  global.HOKSPOST = { T, FORMATS, MARGIN, layout, srcSize, piece, detail, code, row, assembly, stamp, caption, LINES, TAGS };
})(typeof window !== 'undefined' ? window : globalThis);
