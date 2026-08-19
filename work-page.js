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
 *
 * Los cascarones (plls.html, dtkrt.html…) fijan su slug porque esas URLs
 * estuvieron publicadas. work.html hace lo mismo con el slug del `?w=`, y por
 * eso una familia recién activada ya tiene sección sin escribir un archivo.
 */
(function (global) {
  'use strict';

  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';
  // Emoji por familia — el mismo lenguaje del canvas de diseño y del nav.
  const FAM_EM = { plls: '💊', krrtk: '🟥', dtk: '🟥', dtkrt: '🔵', eclps: '🌑', trzs: '🪢', bzrs: '〰️' };

  // Estética del canvas de diseño (Family.dc.html): eyebrow (emoji) + nombre en
  // League Spartan, narrativa en cuerpo, lienzo vivo con su cartela en la
  // esquina, y el muro de piezas elegidas. Tokens de :root los pone nav.js.
  const CSS = `
.wk { max-width: 1180px; margin: 0 auto; padding: 34px 40px 70px; width: 100%; }
.wk-eye { font-size: 28px; line-height: 1; }
.wk-name { font-family: var(--geo); font-weight: 700; font-size: 56px; letter-spacing: 0.02em;
  text-transform: uppercase; margin: 8px 0 0; line-height: 1; }
.wk-year { font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em; color: var(--blue); margin-top: 10px; }
.wk-text { font-family: var(--geo); font-size: 16.5px; line-height: 1.72; color: var(--body);
  max-width: 60ch; margin: 16px 0 0; white-space: pre-wrap; }
.wk-rule { height: 1px; background: var(--line); margin: 32px 0; }
.wk-sec { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--mut); margin: 0 0 16px; }
.wk-live { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.wk-canvas-wrap { position: relative; width: min(80vw, 460px); }
.wk-live canvas { display: block; width: 100%; height: auto; cursor: pointer; border-radius: 4px;
  outline: 1px solid var(--line); transition: opacity 0.18s; }
.wk-live canvas:hover { opacity: 0.94; }
.wk-plate { position: absolute; right: 12px; bottom: 12px; font-family: var(--mono); font-size: 10.5px;
  color: #fff; background: rgba(10,10,10,0.44); padding: 5px 9px; border-radius: 6px;
  letter-spacing: 0.04em; pointer-events: none; }
.wk-gen { display: inline-flex; align-items: center; gap: 9px; font-family: var(--geo); font-weight: 600;
  font-size: 12.5px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid var(--ink);
  background: var(--ink); color: #fff; padding: 12px 18px; border-radius: 10px; cursor: pointer; }
.wk-gen:hover { background: #000; }
.wk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.wk-piece { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; cursor: zoom-in; background: #fff; }
.wk-piece img { width: 100%; display: block; }
.wk-piece figcaption { font-family: var(--mono); font-size: 10px; color: var(--mut); letter-spacing: 0.05em;
  padding: 8px 10px; display: flex; justify-content: space-between; gap: 8px; }
.wk-piece figcaption b { color: var(--body); font-weight: 400; }
.wk-empty { font-family: var(--mono); font-size: 11px; color: var(--mut); letter-spacing: 0.06em; }
.wk-lb { position: fixed; inset: 0; background: rgba(251,251,250,0.97); display: none;
  align-items: center; justify-content: center; flex-direction: column; gap: 1rem; z-index: 200; cursor: zoom-out; }
.wk-lb.open { display: flex; }
.wk-lb img { max-width: min(92vw, 860px); max-height: 76vh; outline: 1px solid var(--line); border-radius: 4px; }
.wk-lb-cap { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; color: var(--mut); }
@media (max-width: 680px) { .wk { padding: 24px 18px 40px; } .wk-name { font-size: 40px; } }
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

  function init(slug) {
    css();
    const ALGO = global.HOKS && global.HOKS[slug.toUpperCase()];
    const root = el('div', 'wk');
    const head = el('div', 'wk-head');
    const eye = el('div', 'wk-eye', FAM_EM[slug] || '▦');
    const name = el('h1', 'wk-name', esc(slug.toUpperCase()));
    // Año de creación (works.json `year`). Las familias en curso aún no lo
    // tienen: se rellena al lanzar/activar, así que hasta entonces no se pinta.
    const year = el('div', 'wk-year'); year.style.display = 'none';
    const text = el('p', 'wk-text');
    head.appendChild(eye); head.appendChild(name); head.appendChild(year); head.appendChild(text);
    root.appendChild(head);

    // ── Lienzo vivo: un clic, otra pieza. Sin panel ni traits ni guardar; solo
    //    su cartela en la esquina (familia · seed) para que se lea que es una
    //    máquina y no un cuadro. El botón Generate hace lo mismo que el clic. ──
    let canvas = null, plate = null, genBtn = null;
    if (ALGO) {
      root.appendChild(el('div', 'wk-rule'));
      root.appendChild(el('div', 'wk-sec', esc(t('hint.canvas', 'Click canvas to generate new variation'))));
      const live = el('div', 'wk-live');
      const cw = el('div', 'wk-canvas-wrap');
      canvas = el('canvas'); canvas.width = 600; canvas.height = 600;
      plate = el('div', 'wk-plate');
      cw.appendChild(canvas); cw.appendChild(plate);
      live.appendChild(cw);
      genBtn = el('button', 'wk-gen', '↻ ' + esc(t('btn.generate', 'Generate')));
      genBtn.type = 'button';
      live.appendChild(genBtn);
      root.appendChild(live);
    }

    root.appendChild(el('div', 'wk-rule'));
    const sec = el('div', 'wk-sec', esc(t('label.saved', 'Saved')));
    const grid = el('div', 'wk-grid');
    root.appendChild(sec); root.appendChild(grid);
    // nav.js ya ha puesto el footer al final del body: hay que entrar antes.
    const foot = document.querySelector('footer');
    if (foot) document.body.insertBefore(root, foot); else document.body.appendChild(root);


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
        if (w.year) { year.textContent = w.year; year.style.display = ''; }
        text.textContent = pickText(w.description);
        document.title = (w.name || slug.toUpperCase()) + ' — hoks';
      })
      .catch(() => {});

    // ── Cambio de idioma: reescribir las etiquetas dependientes del idioma ──
    // (el nav se re-traduce solo; estas se construyen en JS y hay que refrescarlas)
    global.addEventListener('hoks:langchange', () => {
      const genLabel = root.querySelector('.wk-gen');
      if (genLabel) genLabel.textContent = '↻ ' + t('btn.generate', 'Generate');
      const genSec = root.querySelector('.wk-sec');
      if (genSec && canvas) genSec.textContent = t('hint.canvas', 'Click canvas to generate new variation');
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
          fig.appendChild(img);
          fig.appendChild(el('figcaption', null, '<span>#' + esc(p.seed) + '</span><b>1/1</b>'));
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
      const seed = (Math.random() * 0xFFFFFFFF) >>> 0;
      try { ALGO.render(canvas.getContext('2d'), canvas.width, canvas.height, seed, { palettes }); }
      catch (e) {}
      if (plate) plate.textContent = 'hoks · ' + slug.toUpperCase() + ' · #' + seed;
    }
    canvas.addEventListener('click', draw);
    if (genBtn) genBtn.addEventListener('click', draw);
    global.HOKS.loadPalettes().then(p => { palettes = p; draw(); }).catch(() => {});
  }

  // work.html sin ?w= válido: no hay obra que enseñar. Se dice y se sale, en vez
  // de dejar la página en blanco preguntándose qué ha pasado.
  function missing() {
    css();
    const root = el('div', 'wk');
    const head = el('div', 'wk-head');
    head.appendChild(el('h1', 'wk-name', '—'));
    head.appendChild(el('p', 'wk-text', 'No work named. <a href="index.html" style="color:#111;">Back to the grid</a>.'));
    root.appendChild(head);
    const foot = document.querySelector('footer');
    if (foot) document.body.insertBefore(root, foot); else document.body.appendChild(root);
  }

  global.HOKSWORK = { init, missing };
})(typeof window !== 'undefined' ? window : globalThis);
