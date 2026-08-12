/* hoks · cartela — la hoja que va en la pared, al lado de la obra.
 *
 * Un DIN A5 a 300 dpi con lo que identifica a la pieza: familia, año, seed,
 * pliego, paleta, la frase de la regla y el fragmento de código que la decide.
 * El código NO va en la web: su sitio es aquí, junto a la obra, donde sirve a
 * quien la tiene colgada para contar de dónde sale.
 *
 * El fragmento se lee del algo.js REAL, de entre las marcas ⟨gramatika⟩, y la
 * frase de las marcas ⟨esaldia:xx⟩ que viven pegadas a ese mismo código. No hay
 * copia que mantener: si cambia la regla, cambia la cartela.
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
  const MONO = `'Courier New', Courier, monospace`;

  // ── Fuente del fragmento ────────────────────────────────────────────────────
  const cache = {};
  function loadSource(slug, base) {
    if (cache[slug]) return Promise.resolve(cache[slug]);
    return fetch((base || '../') + slug + '/algo.js?t=' + Date.now())
      .then(r => r.ok ? r.text() : '')
      .then(src => (cache[slug] = parse(src)))
      .catch(() => ({ said: {}, code: [] }));
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

    // Cabecera
    line('hoks', 7, '#bbb', pt(3));
    y += pt(26);
    line(String(info.work || '').toUpperCase(), 17, '#111', pt(6), 700);
    y += pt(15);
    line(String(info.year || new Date().getFullYear()), 9, '#888');
    y += pt(12);
    rule(); y += pt(16);

    // Identidad: la seed es lo que nombra a la pieza, así que va grande.
    line('#' + info.seed, 13, '#111', 0, 700);
    y += pt(16);

    const rows = [
      ['Formato', (info.format === 'square' ? 'Cuadrado' : 'Horizontal') + ' · ' + (info.field === 'square' ? 'campo cuadrado' : 'llena el pliego')],
      ['Pliego', (info.sheet || 'A3') + ' · 300 dpi'],
      ['Paleta', info.palette || '—'],
    ].concat(info.extra || []);
    for (const [kk, vv] of rows) {
      ctx.font = `400 ${pt(8)}px ${MONO}`; ctx.fillStyle = '#999'; ctx.fillText(kk, x, y);
      ctx.fillStyle = '#111'; ctx.fillText(String(vv), x + pt(60), y);
      y += pt(13);
    }
    y += pt(8);
    rule(); y += pt(16);

    // La regla, dicha
    const said = info.said || [];
    ctx.font = `400 ${pt(9.5)}px ${MONO}`; ctx.fillStyle = '#111';
    for (const s of said) for (const l of wrap(ctx, s, W - x * 2)) { ctx.fillText(l, x, y); y += pt(14); }
    if (said.length) y += pt(10);

    // El código: el resto de la hoja, en voz baja. El cuerpo no es fijo — se
    // encoge hasta que la línea más larga cabe en la columna, porque en papel un
    // renglón que se sale del margen no es un detalle: es un error de imprenta.
    // Con suelo, eso sí: por debajo de 4,4 pt el código deja de leerse y más
    // vale cortar el renglón y decirlo.
    const code = info.code || [];
    const colW = W - x * 2;
    let size = 6.6;
    if (code.length) {
      ctx.font = `400 ${pt(size)}px ${MONO}`;
      const widest = code.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
      if (widest > colW) size = Math.max(4.4, size * (colW / widest));
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
    ctx.fillText('joxemari.github.io/hoks', x, H - MARGIN * k);
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

  function download(info) {
    const lang = info.lang || (global.HOKSI18N && global.HOKSI18N.lang) || 'eu';
    return loadSource(info.work, info.base).then(src => {
      const d = dims(info.dpi);
      const c = document.createElement('canvas'); c.width = d.W; c.height = d.H;
      render(c.getContext('2d'), d.W, d.H, {
        ...info,
        said: (src.said[lang] && src.said[lang].length) ? src.said[lang] : (src.said.en || []),
        code: src.code,
      });
      return new Promise(res => c.toBlob(b => {
        const url = URL.createObjectURL(b), a = document.createElement('a');
        a.download = `cartela_${info.work}_${info.seed}.png`; a.href = url; a.click();
        setTimeout(() => { URL.revokeObjectURL(url); c.width = c.height = 0; }, 4000);
        res(d);
      }, 'image/png'));
    });
  }

  global.HOKSCARTELA = { render, download, dims, loadSource, A5 };
})(typeof window !== 'undefined' ? window : globalThis);
