/* hoks · making of — el ensayo ilustrado de una familia.
 *
 * El diseño es el del canvas aceptado (Making.dc.html / #view-making del
 * prototipo): ensayo a la derecha, raíl numerado a la izquierda, figuras a
 * sangre. El texto vive en data/makingof/<slug>.md (validado en Notion) y se
 * lee en vivo desde raw, como el resto de los datos. Un subconjunto de Markdown
 * basta: ##, párrafos, > (cita grande), - (lista), ![alt](ruta) y | tablas |.
 *
 *   <script src="nav.js"></script>
 *   <script src="making-page.js"></script>
 *   <script>HOKSMAKING.init('plls');</script>   // o making.html?w=plls
 */
(function (global) {
  'use strict';
  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';
  const FAM_EM = { plls: '💊', krrtk: '🟥', dtk: '🟥', dtkrt: '🔵', eclps: '🌑', trzs: '🪢', bzrs: '〰️' };

  const CSS = `
.mo-wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px,5vw,64px) 90px; }
.mo-back { display: inline-block; margin: 24px 0 0; font-family: var(--geo); font-weight: 700; font-size: 12px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--blue); text-decoration: none; }
.mo-back:hover { color: #000ac2; }
.mo-hero { display: grid; grid-template-columns: 180px minmax(0,600px); gap: 60px; justify-content: end;
  align-items: end; padding: clamp(28px,6vh,64px) 0 clamp(18px,3vh,34px); }
.mo-eye { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mut); }
.mo-h1 { font-family: var(--geo); font-weight: 700; font-size: clamp(38px,6.6vw,74px); letter-spacing: 0.005em;
  text-transform: uppercase; line-height: 0.96; margin: 14px 0 0; }
.mo-sec { display: grid; grid-template-columns: 180px minmax(0,600px); gap: 60px; justify-content: end;
  align-items: start; padding: clamp(30px,5vh,58px) 0; }
.mo-sec + .mo-sec { border-top: 1px solid var(--line); }
.mo-rail { position: sticky; top: 74px; text-align: right; }
.mo-num { display: block; font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; color: var(--blue); }
.mo-lab { display: block; margin-top: 7px; font-family: var(--geo); font-weight: 700; font-size: 13.5px;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink); line-height: 1.2; }
.mo-col { max-width: 600px; min-width: 0; }
.mo-col p { font-size: 17.5px; line-height: 1.78; color: var(--body); margin: 0 0 20px; }
.mo-col p:last-child { margin-bottom: 0; }
.mo-col strong { font-weight: 700; color: var(--ink); }
.mo-col em { font-style: italic; }
.mo-col code { font-family: var(--mono); font-size: 0.85em; background: #f1f0ea; padding: 2px 6px; border-radius: 5px; color: #3a3a37; }
.mo-lead p { font-family: var(--mono); font-size: 12.5px; line-height: 1.7; color: var(--mut); }
.mo-q { font-family: var(--geo); font-weight: 600; font-size: clamp(20px,2.4vw,27px); line-height: 1.34;
  border-left: 3px solid var(--acid); padding-left: 22px; margin: 6px 0 24px; color: var(--ink); }
.mo-ul { margin: 0 0 20px; padding: 0; list-style: none; }
.mo-ul li { font-size: 16.5px; line-height: 1.55; color: var(--body); padding: 9px 0; border-bottom: 1px solid var(--line); }
.mo-ul li:first-child { border-top: 1px solid var(--line); }
.mo-fig { margin: 26px 0 0; }
.mo-fig.wide { margin-left: calc(-1 * (180px + 60px)); width: calc(100% + 180px + 60px); }
.mo-fig img { width: 100%; display: block; border: 1px solid var(--line); border-radius: 3px; background: #f2f0ec; }
.mo-fig figcaption { font-family: var(--mono); font-size: 11px; color: var(--mut); margin-top: 11px; text-align: right; }
.mo-table { width: 100%; border-collapse: collapse; margin: 6px 0 20px; font-family: var(--mono); font-size: 12.5px; }
.mo-table td { border-top: 1px solid var(--line); padding: 9px 10px; color: var(--body); vertical-align: top; }
.mo-table tr:first-child td { color: var(--mut); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10.5px; border-top: 0; }
@media (max-width: 820px) {
  .mo-hero, .mo-sec { grid-template-columns: 1fr; gap: 14px; }
  .mo-rail { position: static; text-align: left; }
  .mo-fig.wide { margin-left: 0; width: 100%; }
}`;

  function css() { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
  // Inline: negrita, cursiva, código. Se escapa primero; los marcadores sobreviven.
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function parse(md) {
    const lines = md.replace(/\r/g, '').split('\n');
    let title = '', lead = '';
    while (lines.length) {
      const l = lines[0];
      if (/^TITLE:/.test(l)) { title = l.replace(/^TITLE:/, '').trim(); lines.shift(); }
      else if (/^LEAD:/.test(l)) { lead = l.replace(/^LEAD:/, '').trim(); lines.shift(); }
      else break;
    }
    const blocks = []; let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { i++; continue; }
      if (/^##\s+/.test(l)) { blocks.push({ t: 'h', v: l.replace(/^##\s+/, '').trim() }); i++; continue; }
      let m = l.match(/^!\[(.*?)\]\((.*?)\)/);
      if (m) { blocks.push({ t: 'fig', alt: m[1], src: m[2] }); i++; continue; }
      if (/^>\s?/.test(l)) { blocks.push({ t: 'q', v: l.replace(/^>\s?/, '').trim() }); i++; continue; }
      if (/^-\s+/.test(l)) { const items = []; while (i < lines.length && /^-\s+/.test(lines[i])) { items.push(lines[i].replace(/^-\s+/, '').trim()); i++; } blocks.push({ t: 'ul', items }); continue; }
      if (/^\|/.test(l)) { const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i].split('|').slice(1, -1).map(s => s.trim())); i++; } blocks.push({ t: 'table', rows }); continue; }
      blocks.push({ t: 'p', v: l.trim() }); i++;
    }
    return { title, lead, blocks };
  }

  function renderCol(blocks) {
    return blocks.map(b => {
      if (b.t === 'p') return '<p>' + inline(b.v) + '</p>';
      if (b.t === 'q') return '<div class="mo-q">' + inline(b.v) + '</div>';
      if (b.t === 'ul') return '<ul class="mo-ul">' + b.items.map(it => '<li>' + inline(it) + '</li>').join('') + '</ul>';
      if (b.t === 'table') return '<table class="mo-table"><tbody>' + b.rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
      if (b.t === 'fig') return '<figure class="mo-fig wide"><img src="' + esc(b.src) + '" alt="' + esc(b.alt) + '" loading="lazy"><figcaption>' + inline(b.alt) + '</figcaption></figure>';
      return '';
    }).join('');
  }

  function build(slug, name, page, doc) {
    const wrap = document.createElement('div'); wrap.className = 'mo-wrap';
    const fam = name || slug.toUpperCase();
    let html = '';
    html += '<a class="mo-back" href="' + esc(page || (slug + '.html')) + '">← ' + esc(t('mof.back', 'Back to') + ' ' + fam) + '</a>';
    html += '<div class="mo-hero"><div class="mo-rail"><span class="mo-eye">' + (FAM_EM[slug] || '') + ' ' + esc(fam) + '</span></div>' +
      '<div><span class="mo-eye">' + esc(t('mof.essay', 'Making of · an illustrated essay')) + '</span>' +
      '<h1 class="mo-h1">' + esc(doc.title || fam) + '</h1></div></div>';

    // Intro = bloques antes del primer ## (raíl vacío, sin número).
    const first = doc.blocks.findIndex(b => b.t === 'h');
    const intro = first < 0 ? doc.blocks : doc.blocks.slice(0, first);
    const rest = first < 0 ? [] : doc.blocks.slice(first);
    if (doc.lead || intro.length) {
      html += '<div class="mo-sec"><div class="mo-rail"></div><div class="mo-col mo-lead">' +
        (doc.lead ? '<p>' + inline(doc.lead) + '</p>' : '') + renderCol(intro) + '</div></div>';
    }
    // Secciones numeradas desde 02 (la intro es la 01 implícita, como el mockup).
    let n = 2, i = 0;
    while (i < rest.length) {
      const label = rest[i].v; i++;
      const body = [];
      while (i < rest.length && rest[i].t !== 'h') { body.push(rest[i]); i++; }
      const num = String(n++).padStart(2, '0');
      html += '<div class="mo-sec"><div class="mo-rail"><span class="mo-num">' + num + '</span>' +
        '<span class="mo-lab">' + esc(label) + '</span></div><div class="mo-col">' + renderCol(body) + '</div></div>';
    }
    wrap.innerHTML = html;
    const foot = document.querySelector('footer');
    if (foot) document.body.insertBefore(wrap, foot); else document.body.appendChild(wrap);
    document.title = (doc.title ? doc.title + ' — ' : '') + fam + ' · making of — hoks';
  }

  function t(key, fallback) {
    try { const s = global.HOKSI18N.t(key); return s === key ? fallback : s; } catch (e) { return fallback; }
  }

  function init(slug) {
    css();
    // Nombre + página real de la familia (para el enlace de vuelta).
    let name = null, page = null;
    fetch(RAW + 'works.json?t=' + Date.now()).then(r => r.ok ? r.json() : []).then(list => {
      const w = (list || []).find(x => x.slug === slug);
      if (w) { name = w.name; page = (global.HOKSNAV && HOKSNAV.workHref) ? HOKSNAV.workHref({ page: w.page, slug }) : w.page; }
    }).catch(() => {}).then(() =>
      fetch(RAW + 'makingof/' + slug + '.md?t=' + Date.now()).then(r => r.ok ? r.text() : null)
    ).then(md => {
      if (!md) { missing(slug); return; }
      build(slug, name, page, parse(md));
    }).catch(() => missing(slug));
  }

  function missing(slug) {
    const wrap = document.createElement('div'); wrap.className = 'mo-wrap';
    wrap.innerHTML = '<a class="mo-back" href="index.html">← ' + t('mof.back', 'Back to') + ' hoks</a>' +
      '<div class="mo-hero"><div class="mo-rail"></div><div><span class="mo-eye">' +
      esc(t('mof.essay', 'Making of · an illustrated essay')) + '</span>' +
      '<h1 class="mo-h1">' + esc(t('mof.prep', 'In preparation')) + '</h1></div></div>' +
      '<div class="mo-sec"><div class="mo-rail"></div><div class="mo-col"><p>' +
      esc(t('mof.blurbPrep', 'The illustrated essay for this family is being written — the rule, the decisions, the published odds.')) +
      '</p></div></div>';
    const foot = document.querySelector('footer');
    if (foot) document.body.insertBefore(wrap, foot); else document.body.appendChild(wrap);
  }

  global.HOKSMAKING = { init, missing: () => missing('') };
})(typeof window !== 'undefined' ? window : globalThis);
