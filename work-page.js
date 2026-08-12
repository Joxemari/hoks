/* hoks · página de obra — archivo y narrativa, no herramienta.
 *
 * Las ocho páginas de obra eran el mismo archivo con otro algoritmo dentro, y
 * eran un generador abierto al público: panel, traits, rareza, guardar. Pero si
 * las piezas se eligen en el laboratorio, lo que la web enseña son las elegidas.
 * Una tirada al azar con su rareza describe algo que nadie tiene.
 *
 * Queda: el texto de la obra, las piezas elegidas y un lienzo vivo MUDO — se
 * regenera al clic, sin panel y sin botones. No está para trabajar: está para
 * que se vea en un segundo que esto es una máquina y no un cuadro.
 *
 *   <script src="sketches/_engine.js"></script>
 *   <script src="sketches/<slug>/algo.js"></script>   (si está graduada)
 *   <script src="work-page.js"></script>
 *   <script>HOKSWORK.init('dtkrt');</script>
 *
 * Sin algo.js la obra sigue teniendo página: archivo y texto, sin lienzo vivo.
 */
(function (global) {
  'use strict';

  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';

  const CSS = `
.wk { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
.wk-head { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 3.5rem; }
.wk-name { font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; }
.wk-text { font-size: 12px; line-height: 2; color: #444; max-width: 62ch; white-space: pre-wrap; }
.wk-live { display: flex; flex-direction: column; align-items: center; gap: 0.7rem; margin-bottom: 4rem; }
.wk-live canvas { display: block; width: min(80vw, 460px); height: auto; cursor: pointer;
  outline: 1px solid rgba(0,0,0,0.12); transition: opacity 0.18s; }
.wk-live canvas:hover { opacity: 0.94; }
.wk-hint { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #bbb; }
.wk-sec { font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
  color: #bbb; margin-bottom: 1.2rem; }
.wk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
.wk-piece { border: 1px solid #e8e8e8; cursor: zoom-in; background: #fff; }
.wk-piece img { width: 100%; display: block; }
.wk-piece figcaption { font-size: 9px; color: #bbb; letter-spacing: 0.06em; padding: 5px 7px; }
.wk-gram { margin: 0 0 4rem; }
.wk-gram { position: relative; }
.wk-gram pre { font-family: inherit; font-size: 10px; line-height: 1.85; color: #555;
  background: #fafafa; border-left: 1px solid #e8e8e8; padding: 1.1rem 1.3rem;
  overflow-x: auto; max-width: 78ch; white-space: pre;
  /* el texto se va por la derecha: se desvanece, para que el corte se lea como
     decisión y no como un renglón truncado por accidente */
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 3.5rem), transparent);
          mask-image: linear-gradient(to right, #000 calc(100% - 3.5rem), transparent); }
.wk-gram .cut { color: #ccc; letter-spacing: 0.4em; display: block; padding: 0.6rem 0; }
.wk-gram-said { font-size: 12px; line-height: 2.1; color: #111; max-width: 58ch;
  white-space: pre-line; margin-bottom: 1.4rem; }
.wk-gram-note { font-size: 9px; color: #bbb; letter-spacing: 0.06em; line-height: 1.9;
  max-width: 62ch; margin-top: 0.7rem; }
.wk-empty { font-size: 10px; color: #bbb; letter-spacing: 0.06em; }
.wk-lb { position: fixed; inset: 0; background: rgba(255,255,255,0.97); display: none;
  align-items: center; justify-content: center; flex-direction: column; gap: 1rem; z-index: 200; cursor: zoom-out; }
.wk-lb.open { display: flex; }
.wk-lb img { max-width: min(92vw, 860px); max-height: 78vh; outline: 1px solid rgba(0,0,0,0.12); }
.wk-lb-cap { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #bbb; }
@media (max-width: 680px) { .wk { padding: 2.5rem 1rem 3rem; } }
`;

  function css() { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // La narrativa admite cadena (legado) u objeto {eu,es,en}, como site.aboutText.
  function pickText(v) {
    if (!v) return '';
    if (typeof v === 'string') return v;
    const lang = (global.HOKSI18N && global.HOKSI18N.lang) || 'eu';
    return v[lang] || v.eu || v.en || v.es || '';
  }
  function t(key, fallback) {
    try { const s = global.HOKSI18N.t(key); return s === key ? fallback : s; } catch (e) { return fallback; }
  }

  // El fragmento vive dentro de dos funciones: sin quitar la sangría común se
  // leería como un margen que no significa nada.
  // El fuente está comentado en castellano y la web es eu/en: los comentarios
  // se caen. Además la FRASE ya dice lo que decían — enseñar las dos cosas sería
  // decirlo dos veces, y una de ellas en el idioma equivocado.
  function stripComments(block) {
    return block.split('\n')
      .map(l => l.replace(/\s*\/\/(?=(?:[^'"`]*['"`][^'"`]*['"`])*[^'"`]*$).*$/, ''))
      .filter(l => l.trim())
      .join('\n');
  }

  function dedent(block) {
    const lines = block.replace(/\t/g, '  ').split('\n');
    const pad = lines.filter(l => l.trim()).reduce((m, l) => Math.min(m, l.match(/^ */)[0].length), 99);
    return lines.map(l => l.slice(pad)).join('\n');
  }

  function init(slug) {
    css();
    const ALGO = global.HOKS && global.HOKS[slug.toUpperCase()];
    const root = el('div', 'wk');
    const head = el('div', 'wk-head');
    const name = el('h1', 'wk-name', esc(slug.toUpperCase()));
    const text = el('p', 'wk-text');
    head.appendChild(name); head.appendChild(text);
    root.appendChild(head);

    // ── Lienzo vivo: un clic, otra pieza. Ni panel ni traits ni guardar. ──
    let canvas = null;
    let hintSpan = null;
    if (ALGO) {
      const live = el('div', 'wk-live');
      canvas = el('canvas'); canvas.width = 600; canvas.height = 600;
      live.appendChild(canvas);
      hintSpan = el('span', 'wk-hint', esc(t('hint.canvas', 'Click canvas to generate new variation')));
      live.appendChild(hintSpan);
      root.appendChild(live);
    }

    const sec = el('div', 'wk-sec', esc(t('label.saved', 'Saved')));
    const grid = el('div', 'wk-grid');
    root.appendChild(sec); root.appendChild(grid);
    // nav.js ya ha puesto el footer al final del body: hay que entrar antes.
    const foot = document.querySelector('footer');
    if (foot) document.body.insertBefore(root, foot); else document.body.appendChild(root);


    // ── Gramática: el código que decide la forma ──────────────────────────────
    // Se extrae del algo.js REAL, de entre las marcas ⟨gramatika⟩: así lo que se
    // lee es literalmente el código que hizo la pieza y no puede quedarse viejo
    // cuando el algoritmo cambie. Lo que hay fuera de las marcas no sale — el
    // corte se señala, no se disimula: es una obra, no un tutorial.
    const gram = el('div', 'wk-gram');
    const gramSec = el('div', 'wk-sec', esc(t('label.grammar', 'Grammar')));
    const gramPre = el('pre');
    const gramNote = el('p', 'wk-gram-note', esc(t('grammar.note', 'The fragment that decides the form.')));
    gram.appendChild(gramSec); gram.appendChild(gramPre); gram.appendChild(gramNote);

    fetch('sketches/' + slug + '/algo.js')
      .then(r => r.ok ? r.text() : '')
      .then(src => {
        // Cada fragmento puede traer su FRASE: la versión conceptual, escrita en
        // comentarios justo encima del código que describe. Viven en el mismo
        // archivo a propósito — no se puede cambiar la regla sin tener la frase
        // delante, que es la única sincronización que aguanta.
        const lang = (global.HOKSI18N && global.HOKSI18N.lang) || 'eu';
        const re = /((?:[^\n]*⟨esaldia:[a-z]{2}⟩[^\n]*\n)*)[^\n]*⟨gramatika⟩\n([\s\S]*?)\n[^\n]*⟨\/gramatika⟩/g;
        const parts = [];
        let m;
        while ((m = re.exec(src))) {
          const said = [];
          const rl = /⟨esaldia:([a-z]{2})⟩\s*([^\n]*)/g;
          let g;
          while ((g = rl.exec(m[1]))) said.push({ lang: g[1], text: g[2].trim() });
          const pick = said.filter(x => x.lang === lang);
          parts.push({ said: (pick.length ? pick : said.filter(x => x.lang === 'en')).map(x => x.text),
                       code: dedent(stripComments(m[2])) });
        }
        if (!parts.length) return;
        gramPre.innerHTML = parts.map(p => esc(p.code)).join('<span class="cut">…</span>');
        // La frase va primero y en tinta; el código, debajo y en voz baja. Quien
        // quiera la verdad la tiene; quien mire, lee la regla.
        const saidAll = parts.flatMap(p => p.said);
        if (saidAll.length) {
          const said = el('p', 'wk-gram-said');
          said.textContent = saidAll.join('\n');
          gram.insertBefore(said, gramPre);
        }
        root.insertBefore(gram, sec);
      })
      .catch(() => {});

    const lb = el('div', 'wk-lb');
    const lbImg = el('img'); const lbCap = el('span', 'wk-lb-cap');
    lb.appendChild(lbImg); lb.appendChild(lbCap);
    lb.onclick = () => lb.classList.remove('open');
    document.body.appendChild(lb);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

    // ── Narrativa desde works.json ──
    let currentWork = null;
    fetch(RAW + 'works.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const w = (list || []).find(x => x.slug === slug);
        if (!w) return;
        currentWork = w;
        if (w.name) name.textContent = w.name;
        text.textContent = pickText(w.description);
        document.title = (w.name || slug.toUpperCase()) + ' — hoks';
      })
      .catch(() => {});

    // ── Cambio de idioma: reescribir las etiquetas dependientes del idioma ──
    // (el nav se re-traduce solo; estas se construyen en JS y hay que refrescarlas)
    global.addEventListener('hoks:langchange', () => {
      if (hintSpan) hintSpan.textContent = t('hint.canvas', 'Click canvas to generate new variation');
      sec.textContent = t('label.saved', 'Saved');
      if (currentWork) text.textContent = pickText(currentWork.description);
    });

    // ── Piezas elegidas ──
    let pieces = [];
    function openPiece(i) {
      const p = pieces[i]; if (!p) return;
      lbImg.src = p.dataUrl;
      const d = p.savedAt ? new Date(p.savedAt) : null;
      lbCap.textContent = '#' + p.seed + (d ? ' · ' + d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
      lb.classList.add('open');
    }
    fetch(RAW + slug + '.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        pieces = Array.isArray(list) ? list : [];
        if (!pieces.length) { grid.appendChild(el('span', 'wk-empty', '—')); return; }
        pieces.forEach((p, i) => {
          const fig = el('figure', 'wk-piece');
          const img = el('img'); img.src = p.dataUrl; img.alt = slug + ' #' + p.seed; img.loading = 'lazy';
          const d = p.savedAt ? new Date(p.savedAt) : null;
          fig.appendChild(img);
          fig.appendChild(el('figcaption', null, '#' + esc(p.seed) +
            (d ? ' · ' + d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '')));
          fig.onclick = () => openPiece(i);
          grid.appendChild(fig);
        });
        // Enlace directo a una pieza concreta: index.html?i=… sigue funcionando.
        const q = new URLSearchParams(location.search).get('i');
        if (q !== null) openPiece(parseInt(q, 10));
      })
      .catch(() => { grid.appendChild(el('span', 'wk-empty', '—')); });

    // ── Motor del lienzo vivo ──
    if (!ALGO) return;
    let palettes = null;
    function draw() {
      if (!palettes) return;
      try { ALGO.render(canvas.getContext('2d'), canvas.width, canvas.height, (Math.random() * 0xFFFFFFFF) >>> 0, { palettes }); }
      catch (e) {}
    }
    canvas.addEventListener('click', draw);
    global.HOKS.loadPalettes().then(p => { palettes = p; draw(); }).catch(() => {});
  }

  global.HOKSWORK = { init };
})(typeof window !== 'undefined' ? window : globalThis);
