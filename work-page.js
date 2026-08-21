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

  // Subtítulo (azul) de cada familia — trilingüe, como el mockup ("capsules · pills").
  const FAM_DESC = {
    plls:  { en: 'capsules · pills',           es: 'cápsulas · píldoras',        eu: 'kapsulak · pilulak' },
    krrtk: { en: 'recursive squares',          es: 'cuadrados recursivos',       eu: 'karratu errekurtsiboak' },
    dtk:   { en: 'a grid of circles',          es: 'una rejilla de círculos',    eu: 'zirkulu-sarea' },
    dtkrt: { en: 'one lattice, read twice',    es: 'una malla, leída dos veces', eu: 'sare bat, bitan irakurria' },
    eclps: { en: 'eclipses',                   es: 'eclipses',                   eu: 'eklipseak' },
    trzs:  { en: 'one continuous ribbon',      es: 'una cinta continua',         eu: 'zinta jarraitu bat' },
    bzrs:  { en: 'bézier fields',              es: 'campos bézier',              eu: 'bézier eremuak' }
  };

  // El resumen del código — pseudocódigo por familia, la "regla" del mockup. Es
  // lenguaje universal: no se traduce, se lee igual en cualquier idioma.
  const FAM_CODE = {
    plls:  'capsule = (p1,p2,thick)  · a distance\nn = weighted(archetype)  · 4 moods\nplace = try 24×, else overlap\nskin  = 1 of 7 finishes\nground → film grain',
    krrtk: 'square(x,y,s):\n  if s>min and rng()<split:\n    4× square(·, s/2)  · divide\n  else:\n    fill(square)  · or stop',
    dtk:   'grid = n×n circles\npresent[i][j] = rng() ≤ 0.8\ncolor = pick(palette)\ndraw circle if present',
    dtkrt: 'lattice = grid(cols,rows)\nmask[c] = noise > t  · circle?\nregion  = grow(cell→cell)  · shared\nrole = luma → floor/block/dot\nground = flat + grain',
    eclps: 'two disks, one ground\nΔ = offset(disk₂)  · the eclipse\nrole = luma → shadow / light\nground = mesh + grain',
    trzs:  'ribbon walks the frame ×k\ncrossing = over / under  · a knot\ncut = incision (the floor shows)\nend = a filed edge too',
    bzrs:  'n = 750…1250 curves\neach = bézier(margin → margin)\ncolor = lerp(c1, c2, i/n)'
  };

  // Familia siguiente (recorrido del mockup). Cae a la primera si no está.
  const FAM_NEXT = { plls: 'dtkrt', dtkrt: 'krrtk', krrtk: 'plls', eclps: 'trzs', trzs: 'plls' };

  // Estética del canvas de diseño (Family.dc.html): eyebrow (emoji) + nombre en
  // League Spartan, narrativa en cuerpo, lienzo vivo con su cartela en la
  // esquina, y el muro de piezas elegidas. Tokens de :root los pone nav.js.
  const CSS = `
.wk { max-width: 1180px; margin: 0 auto; padding: 34px 40px 70px; width: 100%; }
.wk-eye { font-size: 28px; line-height: 1; }
.wk-name { font-family: var(--geo); font-weight: 700; font-size: 56px; letter-spacing: 0.02em;
  text-transform: uppercase; margin: 8px 0 0; line-height: 1; }
.wk-desc { font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--blue); margin-top: 10px; }
.wk-year { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.14em; color: var(--mut); margin-top: 6px; }
.wk-text { font-family: var(--geo); font-size: 16.5px; line-height: 1.72; color: var(--body);
  max-width: 60ch; margin: 16px 0 0; white-space: pre-wrap; }
.wk-rule { height: 1px; background: var(--line); margin: 32px 0; }
.wk-sec { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--mut); margin: 0 0 16px; }
.wk-gen-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 32px; align-items: start; }
.wk-live { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.wk-canvas-wrap { position: relative; width: 100%; }
.wk-side { display: flex; flex-direction: column; gap: 14px; }
.wk-cartela { border: 1px solid var(--line); border-radius: 14px; padding: 20px; background: #fcfcfb; }
.wk-cartela .sh { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--mut); margin-bottom: 14px; }
.wk-cartela .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--acid);
  box-shadow: 0 0 0 3px rgba(220,255,50,0.18); animation: wkPulse 2.4s ease-in-out infinite; }
@keyframes wkPulse { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wk-cartela .live-dot { animation: none; } }
.wk-cartela .cart { font-family: var(--mono); font-size: 12px; line-height: 1.95; color: #3a3a37;
  border-left: 2px solid var(--blue); padding-left: 15px; font-variant-numeric: tabular-nums; }
.wk-cartela .cart .k { color: var(--mut); text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; display: inline-block; min-width: 62px; }
.wk-cartela .cart .big { font-family: var(--geo); font-weight: 700; font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); display: block; margin-bottom: 8px; }
.wk-cartela .seedval { color: var(--ink); }
.wk-rulecard { border: 1px solid #14140f; border-radius: 14px; padding: 16px 17px; background: #0b0b0a; overflow: hidden; }
.wk-rc-h { display: flex; align-items: center; gap: 9px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acid); margin-bottom: 10px; }
.wk-rc-h::after { content: ""; flex: 1; height: 1px; background: #1e1e18; }
.wk-rc-body { font-family: var(--mono); font-size: 11.5px; line-height: 1.85; color: #e4e3dc; white-space: pre; margin: 0; overflow-x: auto; }
@media (max-width: 820px) { .wk-gen-grid { grid-template-columns: 1fr; } }
.wk-live canvas { display: block; width: 100%; height: auto; cursor: pointer; border-radius: 4px;
  outline: 1px solid var(--line); transition: opacity 0.18s; }
.wk-live canvas:hover { opacity: 0.94; }
.wk-plate { position: absolute; right: 12px; bottom: 12px; font-family: var(--mono); font-size: 10.5px;
  color: #fff; background: rgba(10,10,10,0.44); padding: 5px 9px; border-radius: 6px;
  letter-spacing: 0.04em; pointer-events: none; }
.wk-gen { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; margin-top: 16px;
  font-family: var(--geo); font-weight: 600; font-size: 12.5px; letter-spacing: 0.1em; text-transform: uppercase;
  border: 1px solid var(--ink); background: var(--ink); color: #fff; padding: 13px 18px; border-radius: 10px; cursor: pointer; }
.wk-gen:hover { background: #000; }
.wk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.wk-piece { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; cursor: zoom-in; background: #fff; }
.wk-piece img { width: 100%; display: block; }
.wk-piece figcaption { font-family: var(--mono); font-size: 10px; color: var(--mut); letter-spacing: 0.05em;
  padding: 8px 10px; display: flex; justify-content: space-between; gap: 8px; }
.wk-piece figcaption b { color: var(--body); font-weight: 400; }
.wk-empty { font-family: var(--mono); font-size: 11px; color: var(--mut); letter-spacing: 0.06em; }
/* Making-of band + next family (mockup Family.dc.html). */
.wk-mof { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center;
  margin-top: 34px; padding: clamp(22px,3vw,32px); border-radius: 16px; background: var(--ink); color: #fff; }
.wk-mof-k { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acid); }
.wk-mof-t { font-family: var(--geo); font-weight: 700; font-size: clamp(22px,3vw,30px); letter-spacing: 0.01em;
  text-transform: uppercase; line-height: 1.02; margin: 8px 0 6px; }
.wk-mof-s { font-family: var(--mono); font-size: 12.5px; line-height: 1.6; color: #c9c8c2; max-width: 52ch; }
.wk-mof-go { font-family: var(--geo); font-weight: 700; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--ink); background: var(--acid); border: 0; border-radius: 30px; padding: 15px 26px; cursor: pointer;
  white-space: nowrap; text-decoration: none; display: inline-block; transition: transform 0.14s ease; }
.wk-mof-go:hover { transform: translateY(-2px); }
.wk-mof-go.soon { background: #2a2a26; color: #8a8983; cursor: default; }
.wk-next { display: flex; justify-content: space-between; align-items: center; gap: 16px;
  margin-top: 38px; padding-top: 22px; border-top: 1px solid var(--line); }
.wk-next .nl { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mut); }
.wk-next .nb { font-family: var(--geo); font-weight: 700; font-size: clamp(20px,3vw,26px); letter-spacing: 0.02em;
  text-transform: uppercase; color: var(--ink); text-decoration: none; display: inline-flex; align-items: center; gap: 12px; }
.wk-next .nb:hover { color: var(--blue); }
@media (max-width: 720px) { .wk-mof { grid-template-columns: 1fr; } }
.wk-soon { display: flex; align-items: center; gap: 12px; font-family: var(--mono); font-size: 12px;
  color: var(--mut); letter-spacing: 0.04em; }
.wk-soon-badge { font-family: var(--geo); font-weight: 700; font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; background: var(--acid); color: var(--ink); padding: 5px 11px; border-radius: 20px; }
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
    const lang = (global.HOKSI18N && global.HOKSI18N.lang) || 'en';
    return v[lang] || v.en || v.es || v.eu || '';
  }
  function t(key, fallback) {
    try { const s = global.HOKSI18N.t(key); return s === key ? fallback : s; } catch (e) { return fallback; }
  }

  function init(slug) {
    // El bloque estático (#hoks-static) lo escribe static-gen.js para quien NO
    // ejecuta JavaScript: agentes, rastreadores, navegador con el JS apagado.
    // Aquí sí lo hay, así que se retira antes de pintar — si no, la narrativa
    // saldría dos veces. Ver CLAUDE.md § Buscadores y agentes.
    const stat = document.getElementById('hoks-static');
    if (stat) stat.remove();

    css();
    const ALGO = global.HOKS && global.HOKS[slug.toUpperCase()];
    const root = el('div', 'wk');
    const head = el('div', 'wk-head');
    const eye = el('div', 'wk-eye', FAM_EM[slug] || '▦');
    const name = el('h1', 'wk-name', esc(slug.toUpperCase()));
    // Subtítulo azul (mockup): "capsules · pills". Trilingüe.
    const desc = el('div', 'wk-desc'); desc.textContent = pickText(FAM_DESC[slug]) || '';
    // Año de creación (works.json `year`). Las familias en curso aún no lo
    // tienen: se rellena al lanzar/activar, así que hasta entonces no se pinta.
    const year = el('div', 'wk-year'); year.style.display = 'none';
    const text = el('p', 'wk-text');
    head.appendChild(eye); head.appendChild(name); head.appendChild(desc); head.appendChild(year); head.appendChild(text);
    root.appendChild(head);

    // ── Lienzo vivo + su información a la derecha ────────────────────────────
    //    Izquierda: el lienzo mudo (un clic, otra pieza) con su cartela en la
    //    esquina y el botón Generate. Derecha: la cartela "This one" (familia ·
    //    seed vivo · edición) y la regla dicha (el texto de works.json). Sin
    //    traits ni rareza: eso es lenguaje de edición y vive en el laboratorio.
    let canvas = null, plate = null, genBtn = null, cartSeed = null, ruleWrap = null, ruleBody = null;
    if (ALGO) {
      root.appendChild(el('div', 'wk-rule'));
      root.appendChild(el('div', 'wk-sec', esc(t('family.generator', 'Generator — play with the system'))));
      const gg = el('div', 'wk-gen-grid');

      const live = el('div', 'wk-live');
      const cw = el('div', 'wk-canvas-wrap');
      // Lienzo horizontal (DIN), como el mockup: la ficha enseña la obra apaisada.
      canvas = el('canvas'); canvas.width = 848; canvas.height = 600;
      plate = el('div', 'wk-plate');
      cw.appendChild(canvas); cw.appendChild(plate);
      live.appendChild(cw);

      const side = el('div', 'wk-side');
      // Cartela de museo: "This one" · nombre · seed vivo (con punto ácido que
      // dice que se regenera) · formato · edición · año. Sin rareza (eso es del lab).
      const cart = el('div', 'wk-cartela',
        '<div class="sh"><span class="live-dot"></span>' + esc(t('cartela.thisone', 'This one')) + '</div>' +
        '<div class="cart"><span class="big">' + FAM_EM[slug] + ' ' + esc(slug.toUpperCase()) + '</span>' +
        '<div><span class="k">' + esc(t('cartela.seed', 'seed')) + '</span> <span class="seedval">…</span></div>' +
        '<div><span class="k">' + esc(t('cartela.format', 'format')) + '</span> ' + esc(t('cartela.horizontal', 'Horizontal (DIN)')) + '</div>' +
        '<div><span class="k">' + esc(t('cartela.edition', 'edition')) + '</span> ' + esc(t('cartela.unique', '1/1 · unique print')) + '</div>' +
        '<div class="cart-year" style="display:none"><span class="k">' + esc(t('cartela.year', 'year')) + '</span> <span class="yearval"></span></div>' +
        '</div>');
      // El botón vive DENTRO de la tarjeta "This one", a la derecha, como el mockup.
      genBtn = el('button', 'wk-gen', '↻ ' + esc(t('btn.generate', 'Generate')));
      genBtn.type = 'button';
      cart.appendChild(genBtn);
      // La regla: el resumen del código de la familia (FAM_CODE), como el mockup.
      const rc = el('div', 'wk-rulecard',
        '<div class="wk-rc-h">' + esc(t('rule.title', 'The rule')) + '</div><pre class="wk-rc-body"></pre>');
      const code = FAM_CODE[slug] || '';
      if (code) rc.querySelector('.wk-rc-body').textContent = code; else rc.style.display = 'none';
      side.appendChild(cart); side.appendChild(rc);

      gg.appendChild(live); gg.appendChild(side);
      root.appendChild(gg);

      cartSeed = cart.querySelector('.seedval');
      ruleWrap = rc; ruleBody = rc.querySelector('.wk-rc-body');
    }

    root.appendChild(el('div', 'wk-rule'));
    const sec = el('div', 'wk-sec', esc(t('label.selected', 'Selected works — each a seed, one of one')));
    const grid = el('div', 'wk-grid');
    root.appendChild(sec); root.appendChild(grid);

    let currentWork = null;   // (declarado aquí para que refreshMof lo vea)

    // ── Making-of band (mockup) ── el ensayo ilustrado de la familia. Cuando no
    //    hay ensayo publicado todavía, se dice "en preparación" en vez de dejar
    //    un enlace muerto: la sección queda referenciada, no rota.
    const mof = el('div', 'wk-mof');
    mof.innerHTML =
      '<div><div class="wk-mof-k">' + esc(t('mof.k', 'Making of')) + '</div>' +
      '<div class="wk-mof-t"></div><div class="wk-mof-s"></div></div>';
    const mofGo = el('a', 'wk-mof-go soon'); mofGo.textContent = t('mof.prep', 'In preparation');
    mof.appendChild(mofGo);
    root.appendChild(mof);

    // ── Next family ──
    const nextSlug = FAM_NEXT[slug] || null;
    const nextWrap = el('div', 'wk-next');
    if (nextSlug) {
      nextWrap.innerHTML = '<span class="nl">' + esc(t('next.family', 'Next family')) + '</span>';
      const nb = el('a', 'nb'); nb.href = nextSlug + '.html';
      nb.innerHTML = (FAM_EM[nextSlug] || '') + ' ' + esc(nextSlug.toUpperCase()) + ' <span>→</span>';
      nextWrap.appendChild(nb);
      root.appendChild(nextWrap);
    }

    // Rellena/actualiza el título y el estado del making-of (idioma + makingof).
    function refreshMof() {
      const nm = (currentWork && currentWork.name) || slug.toUpperCase();
      const tt = mof.querySelector('.wk-mof-t'), ss = mof.querySelector('.wk-mof-s');
      if (tt) tt.textContent = t('mof.title', 'How {n} is built').replace('{n}', nm);
      const ready = currentWork && currentWork.makingof;
      if (ready) {
        mofGo.textContent = t('mof.read', 'Read the essay →'); mofGo.classList.remove('soon');
        mofGo.href = currentWork.makingof;
        if (ss) ss.textContent = t('mof.blurb', 'An illustrated essay — where the rule came from, every decision, and the published odds.');
      } else {
        mofGo.textContent = t('mof.prep', 'In preparation'); mofGo.classList.add('soon'); mofGo.removeAttribute('href');
        if (ss) ss.textContent = t('mof.blurbPrep', 'The illustrated essay for this family is being written — the rule, the decisions, the published odds.');
      }
    }
    refreshMof();

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
    fetch(RAW + 'works.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const arr = list || [];
        const w = arr.find(x => x.slug === slug);
        // Enlace a la familia siguiente por su página real (works.json), no adivinada.
        if (nextSlug) {
          const nw = arr.find(x => x.slug === nextSlug);
          const nb = root.querySelector('.wk-next .nb');
          if (nb) nb.href = (global.HOKSNAV && HOKSNAV.workHref)
            ? HOKSNAV.workHref({ page: nw && nw.page, slug: nextSlug })
            : (nextSlug + '.html');
        }
        if (!w) return;
        currentWork = w;
        if (w.name) name.textContent = w.name;
        if (w.year) {
          year.textContent = w.year; year.style.display = '';
          const cy = root.querySelector('.cart-year'), yv = root.querySelector('.yearval');
          if (cy && yv) { yv.textContent = w.year; cy.style.display = ''; }
        }
        text.textContent = pickText(w.description);
        refreshMof();
        document.title = (w.name || slug.toUpperCase()) + ' — hoks';
      })
      .catch(() => {});

    // ── Cambio de idioma: reescribir las etiquetas dependientes del idioma ──
    // (el nav se re-traduce solo; estas se construyen en JS y hay que refrescarlas)
    global.addEventListener('hoks:langchange', () => {
      const genLabel = root.querySelector('.wk-gen');
      if (genLabel) genLabel.textContent = '↻ ' + t('btn.generate', 'Generate');
      const genSec = root.querySelector('.wk-sec');
      if (genSec && canvas) genSec.textContent = t('family.generator', 'Generator — play with the system');
      const rcH = root.querySelector('.wk-rc-h');
      if (rcH) rcH.textContent = t('rule.title', 'The rule');
      desc.textContent = pickText(FAM_DESC[slug]) || '';
      sec.textContent = t('label.selected', 'Selected works — each a seed, one of one');
      refreshMof();
      const nn = root.querySelector('.wk-next .nl'); if (nn) nn.textContent = t('next.family', 'Next family');
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
        // Familia activa pero aún sin lote publicado: "en curso". Se dice SOON en
        // vez de dejar un hueco, para que la sección vacía no parezca rota.
        if (!pieces.length) {
          grid.appendChild(el('div', 'wk-soon',
            '<span class="wk-soon-badge">Soon</span> New work is being made for this family.'));
          return;
        }
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
      if (cartSeed) cartSeed.textContent = '#' + seed;
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
