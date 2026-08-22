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
  const MARGIN = 15;                // mm — la cartela es sobre todo aire
  const THUMB_MM = 54;              // ancho de la miniatura (la pieza pesa arriba)
  const GUTTER_MM = 8;              // aire entre el texto y la miniatura
  // Voz mono del sistema 2026 (no Courier New, que era la voz vieja). En la
  // máquina del lab resuelve a SF Mono/Menlo; en print mantiene el aire mono.
  const MONO = `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`;
  // Tokens de marca (los mismos de nav.js): la cartela habla el idioma de la casa.
  const INK = '#0a0a0a', PAPER = '#fbfbfa', BLUE = '#000ef7', ACID = '#dcff32',
        MUT = '#8a8983', LINE = '#e2e0da', CODE = '#6b6b66';

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
    const right = W - MARGIN * k;
    const colW = right - x;                     // ancho útil
    let y = MARGIN * k;

    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // Un renglón desde x, con letterspacing a mano (canvas no lo trae).
    const line = (txt, size, color, spacing, weight) => {
      ctx.font = `${weight || 400} ${pt(size)}px ${MONO}`;
      ctx.fillStyle = color;
      if (!spacing) { ctx.fillText(txt, x, y); return; }
      let cx = x;
      for (const ch of txt) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
    };
    // Filete: fino gris (divisoria) o grueso acid (tick de marca).
    const hair = (yy, color, x1, hpt) => { ctx.fillStyle = color; ctx.fillRect(x, yy, (x1 || right) - x, Math.max(1, pt(hpt || 0.5))); };

    // La miniatura va ARRIBA A LA DERECHA: la pieza pesa arriba y la columna de
    // texto queda a su izquierda. El código, que es lo que puede no caber, se
    // queda con el ancho entero abajo.
    const thumb = info.thumb || null;
    const TW = thumb ? THUMB_MM * k : 0;
    const TH = thumb ? TW * (thumb.height / thumb.width) : 0;
    const colTextW = colW - (thumb ? TW + GUTTER_MM * k : 0);
    if (thumb) {
      const tx = right - TW;
      ctx.drawImage(thumb, tx, y, TW, TH);
      ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, pt(0.5));
      ctx.strokeRect(tx + 0.5, y + 0.5, TW - 1, TH - 1);
    }

    // Cabecera. El nombre de familia es el héroe: se encoge para no chocar con
    // la miniatura (DTKRT es más ancho que PLLS).
    line('hoks', 7.5, MUT, pt(3.2));
    y += pt(30);
    const fam = String(info.work || '').toUpperCase(), famSp = pt(7);
    let fs = 20; ctx.font = `700 ${pt(fs)}px ${MONO}`;
    const famW = () => { let w = 0; for (const ch of fam) w += ctx.measureText(ch).width + famSp; return w - famSp; };
    while (fs > 12 && famW() > colTextW) { fs -= 0.5; ctx.font = `700 ${pt(fs)}px ${MONO}`; }
    line(fam, fs, INK, famSp, 700);
    y += pt(14);
    line(String(info.year || new Date().getFullYear()), 9, MUT);
    y += pt(9);
    hair(y, ACID, x + colTextW, 1.2); y += pt(18);   // tick acid bajo el título

    // La seed nombra la pieza: es el sello, y va en azul (la voz de la notación).
    line('randomSeed(' + info.seed + ')', 11.5, BLUE, 0, 700);
    y += pt(17);

    // Formato y campo son dos decisiones — el pliego da la proporción, el campo
    // dice si la obra lo llena o se compone cuadrada dentro.
    const rows = [
      ['formato', info.format === 'square' ? 'cuadrado' : 'horizontal'],
      ['campo', info.field === 'square' ? 'cuadrado' : 'llena el pliego'],
      ['pliego', (info.sheet || 'A3') + ' · 300 dpi'],
      ['paleta', info.palette || '—'],
    ].concat(info.extra || []);
    const valX = x + pt(56);
    for (const [kk, vv] of rows) {
      ctx.font = `400 ${pt(8)}px ${MONO}`; ctx.fillStyle = MUT; ctx.fillText(kk, x, y);
      ctx.fillStyle = INK; ctx.fillText(clip(ctx, String(vv), colTextW - pt(56)), valX, y);
      y += pt(13);
    }

    // La paleta, dicha en color: elegir paleta es elegir color. Con bordes, para
    // que un color papel (casi blanco) también se vea sobre el fondo papel.
    const pc = info.palColors || [];
    if (pc.length) {
      y += pt(3);
      const barW = colTextW, bh = pt(8), bw = barW / pc.length;
      for (let i = 0; i < pc.length; i++) { ctx.fillStyle = pc[i]; ctx.fillRect(x + i * bw, y, Math.ceil(bw) + 1, bh); }
      ctx.strokeStyle = LINE; ctx.lineWidth = 1;
      for (let i = 1; i < pc.length; i++) { const sx = Math.round(x + i * bw) + 0.5; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y + bh); ctx.stroke(); }
      ctx.strokeRect(x + 0.5, y + 0.5, barW - 1, bh - 1);
      y += bh + pt(10);
    } else y += pt(8);

    // No se sigue hasta que la miniatura ha terminado: el texto de abajo usa el
    // ancho entero y no puede meterse debajo de ella.
    y = Math.max(y, MARGIN * k + TH + pt(16));

    // El colofón se ancla ABAJO y llena el pie con sentido (no con blanco): un
    // filete acid, la línea de edición y el dominio. El código corre hasta él.
    const footBase = H - MARGIN * k;
    const selloTop = footBase - pt(16);

    // Divisoria fina, luego la regla dicha.
    hair(y, LINE, right, 0.5); y += pt(18);
    const said = info.said || [];
    ctx.font = `400 ${pt(10)}px ${MONO}`; ctx.fillStyle = INK;
    for (const s of said) for (const l of wrap(ctx, s, colW)) { ctx.fillText(l, x, y); y += pt(15); }
    if (said.length) y += pt(12);

    // El código, en voz baja. Se encoge hasta caber en la columna (mide contra
    // el percentil 90, no contra la línea más larga: dos renglones sueltos no
    // deben empequeñecer el bloque entero). Corre hasta el colofón.
    const code = info.code || [];
    let size = 6.8;
    if (code.length) {
      ctx.font = `400 ${pt(size)}px ${MONO}`;
      const ws = code.map(l => ctx.measureText(l).width).sort((a, b) => a - b);
      const p90 = ws[Math.floor(0.9 * (ws.length - 1))];
      if (p90 > colW) size = Math.max(4.4, size * (colW / p90));
    }
    ctx.font = `400 ${pt(size)}px ${MONO}`;
    const lh = pt(size * 1.5), bottom = selloTop - pt(14);
    let cut = false;
    for (const l of code) {
      if (y > bottom) { cut = true; break; }
      ctx.fillStyle = CODE; ctx.fillText(clip(ctx, l, colW), x, y); y += lh;
    }
    if (cut) { ctx.fillStyle = MUT; ctx.fillText('…', x, y); }

    // Colofón anclado
    hair(selloTop, ACID, right, 1.2);
    const selloY = selloTop + pt(12);
    ctx.font = `400 ${pt(7.5)}px ${MONO}`;
    ctx.fillStyle = INK; ctx.textAlign = 'left';
    ctx.fillText(fam + ' · ' + (info.sheet || 'A3') + ' · 1/1', x, selloY);
    ctx.textAlign = 'right'; ctx.fillStyle = MUT; ctx.fillText('hoks.design', right, selloY);
    ctx.textAlign = 'left';
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
