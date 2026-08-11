/* hoks · lotes — la selección vive en el laboratorio.
 *
 * Un lote es una lista de RECETAS, no de imágenes: { work, seed, params, palSel }.
 * Como el algoritmo es determinista, la receta *es* la pieza — pesa bytes, se
 * reabre tal cual estaba y se regenera a cualquier resolución, incluida la de
 * impresión. Los píxeles se fabrican al exportar, no al guardar.
 *
 * Se guarda en data/batches.json, commiteado con el token de admin: un lote
 * sobrevive al navegador y se puede retomar meses después.
 *
 *   HOKSBATCH.mount(host, { work, getRecipe, getPalettes, toast })
 *     .add(seed)   → mete esa seed del harness actual en el lote abierto
 *
 * Depende de _lab.js (para cargar los algos de todas las obras graduadas) y de
 * los algoritmos ya cargados en window.HOKS.
 */
(function (global) {
  'use strict';

  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';
  const REPO = 'Joxemari/hoks';
  const TOKEN_KEY = 'hoks-gh-token';
  const OPEN_KEY = 'hoks-batch-open';     // qué lote recibe, compartido entre labs
  const PUSH_DELAY = 1500;                // agrupa varios clics en un commit

  const CSS = `
.hb-row { display:flex; gap:4px; align-items:center; }
.hb-row select { flex:1 1 auto; width:auto; min-width:60px; }
.hb-row .hb-btn { flex:0 0 auto; width:auto; }
.hb-btn { font-family:inherit; font-size:10px; font-weight:700; letter-spacing:0.08em;
  text-transform:uppercase; border:1px solid var(--border,#e8e8e8); background:transparent;
  color:var(--ink,#111); border-radius:2px; padding:6px 8px; cursor:pointer; }
.hb-btn:hover { background:var(--surface,#f7f7f7); }
.hb-btn[disabled] { opacity:0.4; cursor:default; }
.hb-strip { display:flex; gap:4px; overflow-x:auto; min-height:46px; padding:2px 0; }
.hb-item { position:relative; flex-shrink:0; }
.hb-item canvas { display:block; width:46px; height:46px; outline:1px solid rgba(0,0,0,0.12); cursor:pointer; }
.hb-item .hb-x { position:absolute; top:-5px; right:-5px; width:14px; height:14px; line-height:12px;
  text-align:center; font-size:10px; border-radius:50%; border:1px solid var(--border-dark,#d0d0d0);
  background:#fff; color:var(--ink3,#bbb); cursor:pointer; }
.hb-item .hb-x:hover { color:#c0392b; }
.hb-item.drift canvas { outline:2px solid #c0392b; }
.hb-empty { font-size:9px; color:var(--ink3,#bbb); letter-spacing:0.06em; padding:14px 0; }
.hb-note { font-size:9px; color:var(--ink3,#bbb); letter-spacing:0.04em; }
/* el "+" que aparece sobre cada miniatura de la hoja de contactos */
.hb-add { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:2px;
  border:none; background:rgba(255,255,255,0.9); color:#111; font-size:14px; line-height:22px;
  text-align:center; cursor:pointer; opacity:0; transition:opacity 0.12s; font-family:inherit; }
figure:hover .hb-add, .hb-add:focus { opacity:1; }
.hb-add.done { background:#111; color:#fff; opacity:1; }
`;

  let cssDone = false;
  function injectCss() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
  }

  // ── Persistencia ───────────────────────────────────────────────────────────
  function token() { return localStorage.getItem(TOKEN_KEY); }

  async function pull() {
    try {
      const r = await fetch(RAW + 'batches.json?t=' + Date.now());
      const d = r.ok ? await r.json() : [];
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  async function push(batches) {
    const t = token();
    if (!t) throw new Error('sin token de GitHub — guárdalo en admin');
    const path = 'data/batches.json';
    let sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: { Authorization: 'Bearer ' + t } });
      if (r.ok) sha = (await r.json()).sha;
    } catch (e) {}
    const body = { message: 'update ' + path, content: btoa(unescape(encodeURIComponent(JSON.stringify(batches, null, 2)))) };
    if (sha) body.sha = sha;
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('GitHub ' + r.status);
  }

  // ── Receta → imagen ────────────────────────────────────────────────────────
  // Una paleta "auto" la elige el RNG entre las que había al capturar. Si la
  // lista cambia, la pieza cambia: por eso se guarda el nombre resuelto y se
  // marca la deriva en vez de fingir que la receta sigue valiendo.
  function renderRecipe(ctx, w, h, r, palettes) {
    const W = global.HOKS && global.HOKS[String(r.work || '').toUpperCase()];
    if (!W) return null;
    const o = (r.palSel === 'auto' || r.palSel == null)
      ? { palettes } : { palettes, locked: true, lockedIdx: r.palSel };
    try { return W.render(ctx, w, h, r.seed >>> 0, { ...o, params: r.params || {} }); }
    catch (e) { return null; }
  }

  function mount(host, opts) {
    injectCss();
    const toast = opts.toast || (m => console.log(m));
    let batches = [];
    let openId = (() => { const v = localStorage.getItem(OPEN_KEY); return v ? parseInt(v, 10) : null; })();
    let pushTimer = null, dirty = false;

    host.innerHTML =
      `<div class="hb-row"><select id="hb-sel"></select>` +
      `<button class="hb-btn" id="hb-new" title="Lote nuevo">+</button></div>` +
      `<div class="hb-strip" id="hb-strip"></div>` +
      `<div class="hb-row"><select id="hb-res">` +
      `<option value="600">600 px</option><option value="1800">1800 px</option><option value="7200">7200 px · impresión</option>` +
      `</select><button class="hb-btn" id="hb-dl">↓ PNG</button></div>` +
      `<span class="hb-note" id="hb-note"></span>`;

    const $ = id => host.querySelector('#' + id);
    const openBatch = () => batches.find(b => b.id === openId && b.status !== 'closed') || null;

    function schedulePush() {
      dirty = true;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        try { await push(batches); dirty = false; note(''); }
        catch (e) { note('⚠ sin guardar: ' + e.message); }
      }, PUSH_DELAY);
      note('guardando…');
    }
    function note(m) { $('hb-note').textContent = m; }

    function renderSelect() {
      const open = batches.filter(b => b.status !== 'closed');
      $('hb-sel').innerHTML = '<option value="">— sin lote —</option>' +
        open.map(b => `<option value="${b.id}"${b.id === openId ? ' selected' : ''}>${b.name} (${b.items.length})</option>`).join('');
    }
    function renderStrip() {
      const b = openBatch(), strip = $('hb-strip');
      if (!b) { strip.innerHTML = '<span class="hb-empty">sin lote abierto</span>'; $('hb-dl').disabled = true; return; }
      $('hb-dl').disabled = !b.items.length;
      if (!b.items.length) { strip.innerHTML = '<span class="hb-empty">vacío · pulsa <b>a</b> o el + de la hoja de contactos</span>'; return; }
      strip.innerHTML = '';
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      b.items.forEach((it, i) => {
        const wrap = document.createElement('div'); wrap.className = 'hb-item';
        const c = document.createElement('canvas'); c.width = 92; c.height = 92;
        const res = renderRecipe(c.getContext('2d'), 92, 92, it, palettes);
        if (res && it.palName && res.pal && res.pal.name !== it.palName) {
          wrap.classList.add('drift');
          wrap.title = `#${it.seed} · ${it.work.toUpperCase()} · deriva: era ${it.palName}, ahora ${res.pal.name}`;
        } else {
          wrap.title = `#${it.seed} · ${it.work.toUpperCase()}`;
        }
        c.onclick = () => { location.href = '../' + it.work + '/?seed=' + (it.seed >>> 0); };
        const x = document.createElement('span'); x.className = 'hb-x'; x.textContent = '×';
        x.onclick = e => { e.stopPropagation(); b.items.splice(i, 1); schedulePush(); render(); };
        wrap.appendChild(c); wrap.appendChild(x); strip.appendChild(wrap);
      });
    }
    function render() { renderSelect(); renderStrip(); }

    // ── Acciones ─────────────────────────────────────────────────────────────
    function add(seed) {
      const b = openBatch();
      if (!b) { toast('Sin lote abierto'); return false; }
      const r = opts.getRecipe(seed);
      if (!r) return false;
      if (b.items.some(it => it.work === r.work && it.seed === r.seed)) { toast('Ya estaba en el lote'); return false; }
      b.items.push({ ...r, addedAt: Date.now() });
      schedulePush(); render();
      toast(`→ ${b.name} (${b.items.length})`);
      return true;
    }
    function create() {
      const name = prompt('Nombre del lote:');
      if (!name) return;
      const b = { id: Date.now(), name: name.trim(), status: 'open', created: Date.now(), items: [] };
      batches.unshift(b); openId = b.id; localStorage.setItem(OPEN_KEY, String(openId));
      schedulePush(); render();
    }
    // Exportar: se regenera desde la receta, así que la resolución la eliges ahora
    // y no cuando guardaste. Es la ventaja de haber guardado reglas y no píxeles.
    function download() {
      const b = openBatch(); if (!b || !b.items.length) return;
      const size = parseInt($('hb-res').value, 10);
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      note(`generando ${b.items.length} PNG a ${size}px…`);
      b.items.forEach((it, i) => setTimeout(() => {
        const c = document.createElement('canvas'); c.width = size; c.height = size;
        if (!renderRecipe(c.getContext('2d'), size, size, it, palettes)) return;
        const a = document.createElement('a');
        a.download = `${b.name.replace(/\s+/g, '_')}_${i + 1}_${it.work}_${it.seed}.png`;
        a.href = c.toDataURL('image/png'); a.click();
        if (i === b.items.length - 1) note('');
      }, i * 250));
    }

    $('hb-sel').onchange = () => {
      const v = $('hb-sel').value;
      openId = v ? parseInt(v, 10) : null;
      if (openId) localStorage.setItem(OPEN_KEY, String(openId)); else localStorage.removeItem(OPEN_KEY);
      render();
    };
    $('hb-new').onclick = create;
    $('hb-dl').onclick = download;

    // Avisa si te vas con cambios sin commitear.
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    render();
    pull().then(d => { batches = d; render(); });

    return { add, refresh: render, get open() { return openBatch(); } };
  }

  global.HOKSBATCH = { mount, renderRecipe };
})(typeof window !== 'undefined' ? window : globalThis);
