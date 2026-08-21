/* hoks · cartela — la hoja que va en la pared, al lado de la obra.
 *
 * Un DIN A5 a 300 dpi con lo que identifica a la pieza: familia, año, seed,
 * pliego, paleta, la frase de la regla y el fragmento de código que la decide.
 * El código NO va en la web: su sitio es aquí, junto a la obra, donde sirve a
 * quien la tiene colgada para contar de dónde sale.
 *
 * Dos textos, dos sitios, y a propósito:
 *
 *   El FRAGMENTO se lee del algo.js REAL, de entre las marcas ⟨gramatika⟩. No
 *   se edita desde ningún panel porque no es texto: es la obra. Si cambia la
 *   regla, cambia la cartela, y no hay copia que se quede vieja.
 *
 *   La FRASE es escritura, y la escritura se corrige mil veces. Vive en
 *   data/works.json (campo `cartela`, una lengua por clave, un renglón por
 *   línea) y se edita desde admin.html sin tocar código. Si una familia no la
 *   tiene, se cae a las marcas ⟨esaldia:xx⟩ del propio algo.js, que es de donde
 *   salieron: así ninguna cartela se queda muda.
 *
 *   HOKSCARTELA.download({ work, seed, format, sheet, palette, year, lang })
 *   HOKSCARTELA.render(ctx, W, H, info)   → dibuja en cualquier lienzo
 *
 * Depende de window.HOKS (_engine.js) para el tamaño de pliego.
 */
(function (global) {
  'use strict';

  const MM = 25.4;
  const A5 = [148, 210];            // mm, de pie
  const MARGIN = 16;                // mm — la cartela es sobre todo aire
  const THUMB_MM = 42;              // ancho de la miniatura
  const GUTTER_MM = 7;              // aire entre el texto y la miniatura
  const MONO = `'Courier New', Courier, monospace`;

  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';

  // ── Fuente del fragmento ────────────────────────────────────────────────────
  const cache = {};
  function loadSource(slug, base) {
    if (cache[slug]) return Promise.resolve(cache[slug]);
    return fetch((base || '../') + slug + '/algo.js?t=' + Date.now())
      .then(r => r.ok ? r.text() : '')
      .then(src => (cache[slug] = parse(src)))
      .catch(() => ({ said: {}, code: [] }));
  }

  // ── La frase, escrita desde el panel ────────────────────────────────────────
  // works.json en vivo, no por ruta relativa: corregir una frase en admin tiene
  // que verse en la siguiente cartela, sin esperar al redespliegue de Pages.
  let worksP = null;
  function loadWorks() {
    if (!worksP) worksP = fetch(RAW + 'works.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : []).catch(() => []);
    return worksP;
  }
  function saidFor(works, slug, lang, fallback) {
    const w = (works || []).find(v => v.slug === slug) || {};
    const c = w.cartela || {};
    const txt = c[lang] || c.en || c.eu || '';
    const lines = String(txt).split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length) return lines;
    return (fallback[lang] && fallback[lang].length) ? fallback[lang] : (fallback.en || []);
  }

  function dedent(block) {
    const lines = block.replace(/\t/g, '  ').split('\n');
    const pad = lines.filter(l => l.trim()).reduce((m, l) => Math.min(m, l.match(/^ */)[0].length), 99);
    return lines.map(l => l.slice(pad));
  }
  // Los comentarios del fuente están en castellano y la cartela no: se caen.
  // La frase ya dice lo que decían.
  function stripComments(lines) {
    return lines
      .map(l => l.replace(/\s*\/\/(?=(?:[^'"`]*['"`][^'"`]*['"`])*[^'"`]*$).*$/, ''))
      .filter(l => l.trim());
  }

  function parse(src) {
    const said = {}, code = [];
    const re = /((?:[^\n]*⟨esaldia:[a-z]{2}⟩[^\n]*\n)*)[^\n]*⟨gramatika⟩\n([\s\S]*?)\n[^\n]*⟨\/gramatika⟩/g;
    let m;
    while ((m = re.exec(src))) {
      const rl = /⟨esaldia:([a-z]{2})⟩\s*([^\n]*)/g;
      let g;
      while ((g = rl.exec(m[1]))) (said[g[1]] = said[g[1]] || []).push(g[2].trim());
      if (code.length) code.push('');           // un renglón en blanco marca el corte
      stripComments(dedent(m[2])).forEach(l => code.push(l));
    }
    return { said, code };
  }

  // ── Dibujo ──────────────────────────────────────────────────────────────────
  function render(ctx, W, H, info) {
    const k = W / A5[0];                        // px por mm
    const pt = p => p * (W / (A5[0] / MM * 72)); // puntos tipográficos → px
    const x = MARGIN * k;
    let y = MARGIN * k;

    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    const line = (txt, size, color, spacing, weight) => {
      ctx.font = `${weight || 400} ${pt(size)}px ${MONO}`;
      ctx.fillStyle = color;
      if (!spacing) { ctx.fillText(txt, x, y); return; }
      let cx = x;                                // letterspacing a mano: canvas no lo trae
      for (const ch of txt) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
    };
    const rule = (w) => { ctx.fillStyle = '#e0e0e0'; ctx.fillRect(x, y, (w || (W - x * 2)), Math.max(1, k * 0.12)); };

    // La miniatura va ARRIBA A LA DERECHA, en la banda que la cabecera deja
    // vacía: así identifica la hoja sin costarle a la hoja un solo milímetro de
    // alto. El código, que es lo que puede no caber, se queda con la columna
    // entera de abajo.
    const thumb = info.thumb || null;
    const TW = thumb ? THUMB_MM * k : 0;
    const TH = thumb ? TW * (thumb.height / thumb.width) : 0;
    let textW = (W - x * 2) - (thumb ? TW + GUTTER_MM * k : 0);
    if (thumb) {
      const tx = W - x - TW;
      ctx.drawImage(thumb, tx, y, TW, TH);
      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = Math.max(1, k * 0.12);
      ctx.strokeRect(tx + 0.5, y + 0.5, TW - 1, TH - 1);
    }

    // Cabecera
    line('hoks', 7, '#bbb', pt(3));
    y += pt(26);
    line(String(info.work || '').toUpperCase(), 17, '#111', pt(6), 700);
    y += pt(15);
    line(String(info.year || new Date().getFullYear()), 9, '#888');
    y += pt(12);
    rule(textW); y += pt(16);

    // Identidad: la seed es lo que nombra a la pieza, así que va grande.
    line('#' + info.seed, 13, '#111', 0, 700);
    y += pt(16);

    // Formato y campo son dos decisiones distintas — el pliego da la proporción
    // del papel, el campo dice si la obra lo llena o se compone cuadrada dentro.
    // En dos renglones se leen como lo que son, y además caben junto a la
    // miniatura sin que haya que cortarlos.
    const rows = [
      ['Formato', info.format === 'square' ? 'Cuadrado' : 'Horizontal'],
      ['Campo', info.field === 'square' ? 'Cuadrado' : 'Llena el pliego'],
      ['Pliego', (info.sheet || 'A3') + ' · 300 dpi'],
      ['Paleta', info.palette || '—'],
    ].concat(info.extra || []);
    for (const [kk, vv] of rows) {
      ctx.font = `400 ${pt(8)}px ${MONO}`; ctx.fillStyle = '#999'; ctx.fillText(kk, x, y);
      ctx.fillStyle = '#111'; ctx.fillText(clip(ctx, String(vv), textW - pt(60)), x + pt(60), y);
      y += pt(13);
    }

    // La paleta, dicha en color. El nombre no dice nada — elegir paleta es
    // elegir color, y así lo dice el selector de toda la casa: la paleta entera
    // en una franja. Aquí igual, en el ancho de la columna de texto.
    const pc = info.palColors || [];
    if (pc.length) {
      y += pt(2);
      const bw = textW / pc.length, bh = pt(7);
      for (let i = 0; i < pc.length; i++) {
        ctx.fillStyle = pc[i];
        ctx.fillRect(x + i * bw, y, Math.ceil(bw) + 1, bh);
      }
      y += bh + pt(9);
    } else y += pt(8);

    // La hoja no sigue hasta que la miniatura ha terminado: el texto de abajo
    // usa el ancho entero y no puede meterse debajo de ella.
    y = Math.max(y, MARGIN * k + TH + pt(16));
    rule(); y += pt(16);

    // La regla, dicha
    const said = info.said || [];
    ctx.font = `400 ${pt(9.5)}px ${MONO}`; ctx.fillStyle = '#111';
    for (const s of said) for (const l of wrap(ctx, s, W - x * 2)) { ctx.fillText(l, x, y); y += pt(14); }
    if (said.length) y += pt(10);

    // El código: el resto de la hoja, en voz baja. El cuerpo no es fijo — se
    // encoge hasta caber en la columna, porque en papel un renglón que se sale
    // del margen no es un detalle: es un error de imprenta.
    //
    // Pero NO se mide contra la línea más larga: en PLLS hay dos renglones
    // sueltos que doblan a los demás, y servirles a ellos dejaba el bloque
    // entero ilegible y media hoja en blanco. Se mide contra el percentil 90 —
    // el ancho en que ya cabe casi todo — y los dos que sobran se cortan. Es
    // mejor negocio: dos renglones truncados y treinta legibles.
    const code = info.code || [];
    const colW = W - x * 2;
    let size = 6.6;
    if (code.length) {
      ctx.font = `400 ${pt(size)}px ${MONO}`;
      const ws = code.map(l => ctx.measureText(l).width).sort((a, b) => a - b);
      const p90 = ws[Math.floor(0.9 * (ws.length - 1))];
      if (p90 > colW) size = Math.max(4.4, size * (colW / p90));
    }
    ctx.font = `400 ${pt(size)}px ${MONO}`;
    const lh = pt(size * 1.42), bottom = H - MARGIN * k - pt(16);
    let cut = false;
    for (const l of code) {
      if (y > bottom) { cut = true; break; }
      ctx.fillStyle = '#666'; ctx.fillText(clip(ctx, l, colW), x, y); y += lh;
    }
    if (cut) { ctx.fillStyle = '#bbb'; ctx.fillText('…', x, y); }

    // Pie
    ctx.font = `400 ${pt(6.6)}px ${MONO}`; ctx.fillStyle = '#bbb';
    ctx.fillText('hoks.design', x, H - MARGIN * k);
    return ctx;
  }

  // El código no se parte en dos renglones: la sangría ES la estructura, y un
  // salto de línea inventado la desmiente. Si aun encogido no cabe, se corta.
  function clip(ctx, line, max) {
    if (ctx.measureText(line).width <= max) return line;
    let s = line;
    while (s.length > 1 && ctx.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s + '…';
  }

  function wrap(ctx, text, max) {
    const words = String(text).split(' '), out = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > max && cur) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }

  // ── Descarga ────────────────────────────────────────────────────────────────
  function dims(dpi) {
    return { W: Math.round(A5[0] / MM * (dpi || 300)), H: Math.round(A5[1] / MM * (dpi || 300)) };
  }

  // Pinta la cartela a tamaño de impresión y devuelve el lienzo. Separado de
  // download() porque el lote necesita muchas seguidas y no una descarga cada
  // vez.
  function sheetFor(info) {
    const lang = info.lang || (global.HOKSI18N && global.HOKSI18N.lang) || 'eu';
    return Promise.all([loadSource(info.work, info.base), loadWorks()]).then(([src, works]) => {
      const d = dims(info.dpi);
      const c = document.createElement('canvas'); c.width = d.W; c.height = d.H;
      render(c.getContext('2d'), d.W, d.H, {
        ...info,
        said: saidFor(works, info.work, lang, src.said),
        code: src.code,
      });
      return c;
    });
  }

  function download(info) {
    return sheetFor(info).then(c => new Promise(res => c.toBlob(b => {
      const url = URL.createObjectURL(b), a = document.createElement('a');
      a.download = `cartela_${info.work}_${info.seed}.png`; a.href = url; a.click();
      setTimeout(() => { URL.revokeObjectURL(url); c.width = c.height = 0; }, 4000);
      res({ W: c.width, H: c.height });
    }, 'image/png')));
  }

  global.HOKSCARTELA = { render, download, sheetFor, dims, loadSource, A5 };
})(typeof window !== 'undefined' ? window : globalThis);
