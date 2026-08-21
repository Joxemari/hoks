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
 *   HOKSBATCH.mount(host, { work, getRecipe, getPalettes, getSeed, toast })
 *     .add(seed)        → mete esa seed del harness actual en el lote abierto
 *     .renderFull(host) → pinta el lote entero (la vista de decidir)
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
.hb-take { width:100%; padding:8px; background:var(--ink,#111); color:#fff; border-color:var(--ink,#111); }
.hb-take:hover { background:var(--ink,#111); opacity:0.78; }
.hb-take[disabled] { background:transparent; color:var(--ink3,#bbb); border-color:var(--border,#e8e8e8); opacity:1; }
.hb-strip { display:flex; gap:4px; overflow-x:auto; min-height:46px; padding:2px 0; }
.hb-item { position:relative; flex-shrink:0; }
.hb-item canvas { display:block; height:46px; width:auto; outline:1px solid rgba(0,0,0,0.12); cursor:pointer; }
.hb-item .hb-x { position:absolute; top:-5px; right:-5px; width:14px; height:14px; line-height:12px;
  text-align:center; font-size:10px; border-radius:50%; border:1px solid var(--border-dark,#d0d0d0);
  background:var(--paper,#fff); color:var(--ink3,#bbb); cursor:pointer; }
.hb-item .hb-x:hover { color:#c0392b; }
.hb-item.drift canvas { outline:2px solid #c0392b; }
.hb-item.pub canvas { outline:2px solid var(--ink,#111); }
.hb-empty { font-size:9px; color:var(--ink3,#bbb); letter-spacing:0.06em; padding:14px 0; }
.hb-note { font-size:9px; color:var(--ink3,#bbb); letter-spacing:0.04em; }
/* el "+" que aparece sobre cada miniatura de la hoja de contactos */
.hb-add { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:2px;
  border:none; background:rgba(255,255,255,0.9); color:var(--ink,#111); font-size:14px; line-height:22px;
  text-align:center; cursor:pointer; opacity:0; transition:opacity 0.12s; font-family:inherit; }
figure:hover .hb-add, .hb-add:focus { opacity:1; }
.hb-add.done { background:var(--ink,#111); color:#fff; opacity:1; }
/* el menú del botón derecho sobre una miniatura */
.hb-menu { position:fixed; z-index:400; background:var(--paper,#fff); border:1px solid var(--border-dark,#d0d0d0);
  border-radius:2px; box-shadow:0 3px 14px rgba(0,0,0,0.13); padding:3px; min-width:150px; }
/* text-transform:none a propósito: el nombre del lote lo escribes tú, no es una
   etiqueta de interfaz, y en versalitas deja de ser el que pusiste. */
.hb-mi { display:block; width:100%; text-align:left; font-family:inherit; font-size:10px;
  letter-spacing:0.04em; text-transform:none; border:none; background:none; color:var(--ink,#111);
  padding:6px 9px; cursor:pointer; white-space:nowrap; }
.hb-mi:hover { background:var(--surface,#f7f7f7); }
.hb-mi-new { border-top:1px solid var(--border,#e8e8e8); margin-top:3px; padding-top:7px; }
.hb-mi-off { color:var(--ink3,#bbb); cursor:default; }
.hb-mi-off:hover { background:none; }
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

  async function pushJson(path, payload) {
    const t = token();
    if (!t) throw new Error('sin token de GitHub — guárdalo en admin');
    let sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: { Authorization: 'Bearer ' + t } });
      if (r.ok) sha = (await r.json()).sha;
    } catch (e) {}
    const body = { message: 'update ' + path, content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))) };
    if (sha) body.sha = sha;
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('GitHub ' + r.status);
  }
  const push = batches => pushJson('data/batches.json', batches);

  async function pullJson(name) {
    try { const r = await fetch(RAW + name + '?t=' + Date.now()); const d = r.ok ? await r.json() : []; return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }

  // ── Receta → imagen ────────────────────────────────────────────────────────
  // Una paleta "auto" la elige el RNG entre las que había al capturar. Si la
  // lista cambia, la pieza cambia: por eso se guarda el nombre resuelto y se
  // marca la deriva en vez de fingir que la receta sigue valiendo.
  // La proporción es parte de la receta: la misma seed en vertical no es un
  // recorte de la cuadrada, es otra composición. Todo render parte de aquí.
  function dimsFor(r, shortSide) {
    return global.HOKS.fmtDims(r.format || 'square', shortSide);
  }
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
      // En vista única no había forma de meter la pieza en el lote salvo la
      // tecla `a`: el + solo existía sobre las miniaturas de la hoja de
      // contactos, y encima al pasar el ratón. El botón es la acción principal
      // del panel, así que va en el panel.
      `<button class="hb-btn hb-take" id="hb-add">+ Añadir esta pieza <span style="opacity:.5">(a)</span></button>` +
      `<div class="hb-strip" id="hb-strip"></div>` +
      `<div class="hb-row"><select id="hb-res">` +
      global.HOKS.SHEET_IDS.map(id => `<option value="${id}"${id === global.HOKS.DEFAULT_SHEET ? ' selected' : ''}>${id} · 300 dpi</option>`).join('') +
      `</select><button class="hb-btn" id="hb-dl">↓ PNG</button>` +
      // La obra y su cartela se imprimen juntas, así que se descargan juntas y
      // al mismo pliego: el selector de arriba manda sobre las dos.
      `<button class="hb-btn" id="hb-cart" title="Una cartela A5 por pieza">↓ A5</button>` +
      `<button class="hb-btn" id="hb-pub" title="Publicar a la galería">▲</button></div>` +
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
      $('hb-add').disabled = !b;
      $('hb-add').title = b ? 'Añade la pieza en pantalla al lote «' + b.name + '»' : 'Elige o crea un lote primero';
      if (!b) { strip.innerHTML = '<span class="hb-empty">sin lote abierto</span>'; $('hb-dl').disabled = $('hb-cart').disabled = $('hb-pub').disabled = true; return; }
      $('hb-dl').disabled = $('hb-cart').disabled = $('hb-pub').disabled = !b.items.length;
      if (!b.items.length) { strip.innerHTML = '<span class="hb-empty">vacío · pulsa <b>a</b> o el + de la hoja de contactos</span>'; return; }
      strip.innerHTML = '';
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      b.items.forEach((it, i) => {
        const wrap = document.createElement('div'); wrap.className = 'hb-item';
        const c = document.createElement('canvas');
        const d = dimsFor(it, 64); c.width = d.W; c.height = d.H;
        const res = renderRecipe(c.getContext('2d'), d.W, d.H, it, palettes);
        if (res && it.palName && res.pal && res.pal.name !== it.palName) {
          wrap.classList.add('drift');
          wrap.title = `#${it.seed} · ${it.work.toUpperCase()} · deriva: era ${it.palName}, ahora ${res.pal.name}`;
        } else {
          wrap.title = `#${it.seed} · ${it.work.toUpperCase()}` + (it.published ? ' · publicada' : '');
        }
        if (it.published) wrap.classList.add('pub');
        c.onclick = () => { location.href = '../' + it.work + '/?seed=' + (it.seed >>> 0); };
        const x = document.createElement('span'); x.className = 'hb-x'; x.textContent = '×';
        x.onclick = e => { e.stopPropagation(); b.items.splice(i, 1); schedulePush(); render(); };
        wrap.appendChild(c); wrap.appendChild(x); strip.appendChild(wrap);
      });
    }
    function render() { renderSelect(); renderStrip(); }

    // ── Acciones ─────────────────────────────────────────────────────────────
    // Apartar una pieza no tiene por qué ir al lote que esté abierto: mirando
    // doce a la vez uno separa a la vez para dos sitios distintos. addTo deja
    // elegir el destino sin cambiar de lote y sin perder el hilo de lo que se
    // está mirando.
    function addTo(id, seed) {
      const b = batches.find(v => v.id === id && v.status !== 'closed');
      if (!b) { toast('Sin lote abierto'); return false; }
      const r = opts.getRecipe(seed);
      if (!r) return false;
      if (b.items.some(it => it.work === r.work && it.seed === r.seed)) { toast('Ya estaba en ' + b.name); return false; }
      b.items.push({ ...r, addedAt: Date.now() });
      schedulePush(); render();
      toast(`→ ${b.name} (${b.items.length})`);
      return true;
    }
    function add(seed) {
      const b = openBatch();
      // Sin lote abierto, apartar no debe morir en silencio: se crea uno
      // (pide nombre) y la pieza entra ya dentro. El primer "+" abre lote.
      if (!b) { return !!create(seed); }
      return addTo(b.id, seed);
    }
    function create(seed) {
      const name = prompt('Nombre del lote:');
      if (!name) return null;
      const b = { id: Date.now(), name: name.trim(), status: 'open', created: Date.now(), items: [] };
      batches.unshift(b); openId = b.id; localStorage.setItem(OPEN_KEY, String(openId));
      schedulePush(); render();
      if (seed != null) addTo(b.id, seed);
      return b;
    }

    // ── Apartar desde la hoja de contactos ──────────────────────────────────
    // El ojo decide mirando las doce, así que apartar tiene que ser un gesto de
    // ahí y no un viaje al panel. Dos caminos al mismo sitio: el "+" para la
    // mano rápida, y el botón derecho para cuando el destino importa —abre el
    // menú de lotes abiertos, y desde ahí también se crea uno nuevo con la
    // pieza ya dentro.
    function closeMenu() { const m = document.getElementById('hb-menu'); if (m) m.remove(); }
    function openMenu(ev, seed, onAdd) {
      closeMenu();
      const m = document.createElement('div');
      m.id = 'hb-menu'; m.className = 'hb-menu';
      const open = batches.filter(b => b.status !== 'closed');
      const item = (label, fn, cls) => {
        const el = document.createElement('button');
        el.className = 'hb-mi' + (cls ? ' ' + cls : ''); el.textContent = label;
        el.onclick = () => { closeMenu(); fn(); };
        m.appendChild(el);
      };
      if (open.length) {
        open.forEach(b => item(
          (b.id === openId ? '● ' : '○ ') + b.name + '  (' + b.items.length + ')',
          () => { if (addTo(b.id, seed) && onAdd) onAdd(); }));
      } else item('sin lotes abiertos', () => {}, 'hb-mi-off');
      item('+ Lote nuevo…', () => { if (create(seed) && onAdd) onAdd(); }, 'hb-mi-new');
      document.body.appendChild(m);
      // Anclado al cursor, pero sin salirse: un menú medio fuera de la ventana
      // no es un menú.
      const r = m.getBoundingClientRect();
      m.style.left = Math.min(ev.clientX, innerWidth  - r.width  - 8) + 'px';
      m.style.top  = Math.min(ev.clientY, innerHeight - r.height - 8) + 'px';
      setTimeout(() => {
        document.addEventListener('click', closeMenu, { once: true });
        document.addEventListener('contextmenu', closeMenu, { once: true });
      }, 0);
    }

    // Deja una miniatura lista para apartarse. Lo llaman los cinco laboratorios:
    // el gesto es el mismo en todos, así que el código también.
    function attach(fig, seed) {
      const plus = document.createElement('button');
      plus.className = 'hb-add'; plus.textContent = '+';
      plus.title = 'Añadir al lote — botón derecho para elegir a cuál';
      const done = () => { plus.classList.add('done'); plus.textContent = '✓'; };
      plus.onclick = ev => { ev.stopPropagation(); if (add(seed)) done(); };
      plus.oncontextmenu = ev => { ev.preventDefault(); ev.stopPropagation(); openMenu(ev, seed, done); };
      fig.oncontextmenu = ev => { ev.preventDefault(); openMenu(ev, seed, done); };
      fig.appendChild(plus);
      return plus;
    }
    // Exportar: se regenera desde la receta, así que la resolución la eliges ahora
    // y no cuando guardaste. Es la ventaja de haber guardado reglas y no píxeles.
    function download() {
      const b = openBatch(); if (!b || !b.items.length) return;
      const sheet = $('hb-res').value;
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      note(`generando ${b.items.length} PNG a ${sheet} · 300 dpi…`);
      // exportPrint re-renderiza a tamaño de papel (no reescala) y avisa si el
      // navegador no puede con ese lienzo.
      b.items.forEach((it, i) => setTimeout(() => {
        try {
          global.HOKS.exportPrint({
            name: `${b.name.replace(/\s+/g, '_')}_${i + 1}_${it.work}_${it.seed}`,
            fmt: it.format || 'square', sheet,
            render: (ctx, W, H) => renderRecipe(ctx, W, H, it, palettes),
          });
        } catch (e) { note('⚠ ' + e.message); }
        if (i === b.items.length - 1) note('');
      }, i * 400));
    }

    // Las cartelas del lote. Una obra sin su hoja no está lista para colgar, y
    // hacerlas de una en una desde la vista única es contar las piezas dos
    // veces. La miniatura se pinta aquí desde la misma receta, y la paleta es la
    // que SALIÓ en ese render — si hubo deriva, manda el píxel, igual que al
    // publicar.
    async function downloadCartelas() {
      const b = openBatch(); if (!b || !b.items.length) return;
      const sheet = $('hb-res').value;
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      note(`generando ${b.items.length} cartela(s) A5…`);
      for (let i = 0; i < b.items.length; i++) {
        const it = b.items[i];
        try {
          const d = dimsFor(it, 420);
          const thumb = document.createElement('canvas'); thumb.width = d.W; thumb.height = d.H;
          const res = renderRecipe(thumb.getContext('2d'), d.W, d.H, it, palettes);
          await global.HOKSCARTELA.download({
            work: it.work, seed: it.seed >>> 0,
            format: it.format || 'square', field: (it.params && it.params.field) || 'sheet',
            sheet, palette: (res && res.pal && res.pal.name) || it.palName || '—',
            palColors: (res && res.pal && res.pal.colors) || [],
            thumb, year: new Date().getFullYear(),
          });
          thumb.width = thumb.height = 0;
        } catch (e) { note('⚠ ' + e.message); return; }
      }
      note('');
      toast(`${b.items.length} cartela(s) A5 · 148×210 mm · 300 dpi`);
    }

    // Publicar: el lote es la curaduría, así que la galería pública se alimenta
    // de aquí y no de un botón suelto en la página de obra. La imagen se fabrica
    // ahora, desde la receta, a la resolución del sitio.
    async function publish() {
      const b = openBatch(); if (!b || !b.items.length) return;
      const pending = b.items.filter(it => !it.published);
      if (!pending.length) { toast('Todo el lote ya está publicado'); return; }
      if (!confirm(`¿Publicar ${pending.length} pieza(s) a la galería?`)) return;
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      const byWork = {};
      pending.forEach(it => { (byWork[it.work] = byWork[it.work] || []).push(it); });
      for (const work of Object.keys(byWork)) {
        note('publicando ' + work.toUpperCase() + '…');
        const gallery = await pullJson(work + '.json');
        const usage = [];
        for (const it of byWork[work]) {
          const c = document.createElement('canvas');
          const d = dimsFor(it, global.HOKS.PREVIEW_SHORT); c.width = d.W; c.height = d.H;
          const res = renderRecipe(c.getContext('2d'), d.W, d.H, it, palettes);
          if (!res) continue;
          const savedAt = Date.now();
          gallery.unshift({ seed: it.seed, dataUrl: c.toDataURL('image/png'), savedAt });
          // La paleta que va al índice es la que ha salido en ESTE render, no la
          // que tuviera la receta: si hubo deriva, manda el píxel publicado.
          if (res.pal) usage.push({ family: work, seed: it.seed >>> 0, savedAt,
                                    paletteId: res.pal.id, paletteName: res.pal.name });
          it.published = true;
        }
        try { await pushJson('data/' + work + '.json', gallery); }
        catch (e) { note('⚠ ' + work + ': ' + e.message); return; }
        // El índice de uso (data/palette-usage.json) solo tiene sentido si se
        // alimenta aquí: publicar es lo único que crea obra guardada.
        if (global.HOKSUSAGE) await global.HOKSUSAGE.recordMany(usage);
      }
      note('');
      try { await push(batches); } catch (e) {}
      render();
      toast('Publicado');
    }


    // ── Vista completa ───────────────────────────────────────────────────────
    // La tira del panel dice QUÉ hay; para decidir qué se queda hace falta ver
    // el lote entero y del tamaño en que se mira una obra. Se pinta en el mismo
    // contenedor que la hoja de contactos: es el otro modo de mirar del lab.
    function renderFull(host) {
      const b = openBatch();
      host.innerHTML = '';
      if (!b) { host.innerHTML = '<span class="hb-empty">sin lote abierto</span>'; return 'sin lote'; }
      if (!b.items.length) { host.innerHTML = '<span class="hb-empty">lote vacío</span>'; return b.name + ' · vacío'; }
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      b.items.forEach((it, i) => {
        const fig = document.createElement('figure');
        const d = dimsFor(it, 300);
        const c = document.createElement('canvas'); c.width = d.W; c.height = d.H;
        const res = renderRecipe(c.getContext('2d'), d.W, d.H, it, palettes);
        const drift = res && it.palName && res.pal && res.pal.name !== it.palName;
        const cap = document.createElement('figcaption');
        cap.textContent = `${it.work.toUpperCase()} #${it.seed}` +
          (it.published ? ' · publicada' : '') + (drift ? ' · ⚠ deriva' : '');
        if (drift) cap.style.color = '#c0392b';
        c.style.cursor = 'pointer';
        c.title = 'Abrir esta receta en su laboratorio';
        c.onclick = () => { location.href = '../' + it.work + '/?seed=' + (it.seed >>> 0); };
        const x = document.createElement('button');
        x.className = 'hb-btn'; x.textContent = '× quitar';
        x.style.cssText = 'margin-top:4px;padding:3px 6px;font-size:9px';
        x.onclick = () => { b.items.splice(i, 1); schedulePush(); render(); renderFull(host); };
        fig.appendChild(c); fig.appendChild(cap); fig.appendChild(x);
        host.appendChild(fig);
      });
      return `${b.name} · ${b.items.length} pieza(s) · el pliego, la descarga y las cartelas, en el panel`;
    }

    $('hb-pub').onclick = publish;
    $('hb-sel').onchange = () => {
      const v = $('hb-sel').value;
      openId = v ? parseInt(v, 10) : null;
      if (openId) localStorage.setItem(OPEN_KEY, String(openId)); else localStorage.removeItem(OPEN_KEY);
      render();
    };
    $('hb-new').onclick = create;
    $('hb-dl').onclick = download;
    $('hb-cart').onclick = downloadCartelas;
    $('hb-add').onclick = () => {
      if (!opts.getSeed) { toast('El harness no expone la seed actual'); return; }
      if (add(opts.getSeed())) { $('hb-add').textContent = '✓ En el lote';
        setTimeout(() => { $('hb-add').innerHTML = '+ Añadir esta pieza <span style="opacity:.5">(a)</span>'; }, 1100); }
    };

    // Avisa si te vas con cambios sin commitear.
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    render();
    pull().then(d => { batches = d; render(); });

    // El pliego se elige una sola vez y aquí: la descarga de la obra y la de su
    // cartela tienen que hablar del mismo papel.
    return { add, addTo, attach, refresh: render, renderFull, sheet: () => $('hb-res').value,
             get open() { return openBatch(); } };
  }

  global.HOKSBATCH = { mount, renderRecipe };
})(typeof window !== 'undefined' ? window : globalThis);
