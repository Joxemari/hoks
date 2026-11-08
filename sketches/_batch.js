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
 * Depende de _lab.js (para cargar los algos de todas las obras graduadas), de
 * los algoritmos ya cargados en window.HOKS y de gh-store.js para escribir.
 *
 * Quién manda en cada campo de un lote: el laboratorio manda en sus piezas
 * (`items`, y si están publicadas); el panel manda en el nombre y el estado
 * (abierto/cerrado). Por eso el lab no sube su copia entera: sube solo los
 * lotes que ha tocado, sobre lo que haya en main en ese momento, conservando
 * el nombre y el estado de allí. Antes subía el array entero y deshacía lo que
 * se hubiera renombrado o cerrado en el panel mientras tanto.
 */
(function (global) {
  'use strict';

  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';
  const OPEN_KEY = 'hoks-batch-open';     // qué lote recibe, compartido entre labs
  const OUTBOX_KEY = 'hoks-batches-outbox'; // copia recuperable hasta que GitHub confirma
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
.hb-exprow select { flex:0 0 58px; min-width:0; }
.hb-exprow .hb-btn { flex:1 1 0; min-width:0; padding:6px 3px; font-size:9px; letter-spacing:0.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hb-pubbtn { width:100%; padding:8px; margin-top:4px; border-color:var(--ink,#111); }
.hb-pubbtn:not([disabled]):hover { background:var(--ink,#111); color:#fff; }
.hb-export { display:flex; flex-direction:column; gap:6px; }
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
/* apartar desde el grid: un botón con texto en el pie de cada pieza, junto a
   su seed. Antes era un "+" blanco de 22 px que solo salía al pasar el ratón,
   pegado a la esquina de la obra: no se veía ni se entendía. */
.hb-cap { display:flex; align-items:center; justify-content:space-between; gap:6px; }
.hb-add { flex:0 0 auto; width:auto; font-family:inherit; font-size:9px; font-weight:700;
  letter-spacing:0.1em; text-transform:uppercase; padding:3px 8px; border-radius:2px; cursor:pointer;
  border:1px solid var(--border,#e7e5df); background:transparent; color:var(--ink3,#8a8983); }
figure:hover .hb-add, .hb-add:focus-visible { border-color:var(--ink,#111); color:var(--ink,#111); }
.hb-add:hover { opacity:1; background:var(--paper,#fff); }
.hb-add.done, .hb-add.done:hover { background:var(--ink,#111); border-color:var(--ink,#111); color:#fff; }
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

  const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ── Persistencia ───────────────────────────────────────────────────────────
  const GH = () => {
    if (!global.HOKSGH) throw new Error('falta gh-store.js en esta página');
    if (!global.HOKSGH.token()) throw new Error('sin token de GitHub — guárdalo en admin');
    return global.HOKSGH;
  };

  // La cola guarda los lotes tocados y cuáles son. Formato viejo (array a
  // secas): se da por tocado todo, que es lo que hacía antes.
  function readOutbox() {
    try {
      const d = JSON.parse(localStorage.getItem(OUTBOX_KEY) || 'null');
      if (Array.isArray(d)) return { batches: d, touched: d.map(b => b.id) };
      if (d && Array.isArray(d.batches) && Array.isArray(d.touched)) return d;
      return null;
    } catch (e) { return null; }
  }

  function writeOutbox(batches, touched) {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify({ batches, touched: [...touched] }));
  }

  function clearOutbox() { localStorage.removeItem(OUTBOX_KEY); }

  async function pull() {
    try {
      const r = await fetch(RAW + 'batches.json?t=' + Date.now());
      const d = r.ok ? await r.json() : [];
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  // Sube los lotes `local` sobre lo que haya en main. Un lote que el panel
  // borró mientras el lab lo tocaba vuelve a aparecer: se prefiere recuperar
  // piezas apartadas a perderlas en silencio.
  async function pushBatches(local, msg) {
    const res = await GH().update('data/batches.json', cur => {
      if (cur !== undefined && !Array.isArray(cur)) throw new Error('batches.json no es una lista: no se escribe encima');
      const remote = cur || [];
      const byId = new Map(local.map(b => [b.id, b]));
      const out = remote.map(rb => {
        const lb = byId.get(rb.id);
        return lb ? { ...lb, name: rb.name, status: rb.status } : rb;
      });
      const fresh = local.filter(lb => !remote.some(rb => rb.id === lb.id));
      return fresh.concat(out);
    }, msg || 'update data/batches.json');
    return res.data;
  }

  // ── Receta → imagen ────────────────────────────────────────────────────────
  // Una paleta "auto" la elige el RNG entre las que había al capturar. Si la
  // lista cambia, la pieza cambia: por eso se guarda el nombre resuelto y se
  // marca la deriva en vez de fingir que la receta sigue valiendo.
  // La proporción es parte de la receta: la misma seed en vertical no es un
  // recorte de la cuadrada, es otra composición. Todo render parte de aquí.
  // Un lote puede mezclar familias —un capítulo de Instagram es eso: una pieza de
  // cada una— y cada laboratorio carga SOLO su algo.js. Sin esto, las piezas de
  // las otras familias salían en blanco en la tira y, peor, en blanco al pliego.
  // El algoritmo que falte se pide a su carpeta, una vez, como hace la landing.
  const algoLoads = {};   // work → Promise<bool>
  const hasAlgo = w => !!(global.HOKS && global.HOKS[String(w || '').toUpperCase()]);
  function ensureWork(work) {
    if (hasAlgo(work)) return Promise.resolve(true);
    if (!algoLoads[work]) algoLoads[work] = new Promise(res => {
      const s = document.createElement('script');
      s.src = '../' + work + '/algo.js';
      s.onload = () => res(hasAlgo(work)); s.onerror = () => res(false);
      document.head.appendChild(s);
    });
    return algoLoads[work];
  }
  function ensureWorks(items) {
    return Promise.all([...new Set(items.map(it => it.work))].map(ensureWork)).then(() => items.filter(it => !hasAlgo(it.work)));
  }
  // ¿Hay piezas cuyo algoritmo aún no se ha pedido? (Las que ya fallaron no
  // cuentan: si no, la tira se repintaría sin fin esperando lo que no llega.)
  const pendingAlgo = items => items.some(it => !hasAlgo(it.work) && !algoLoads[it.work]);

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

  // ── Lo que se publica tiene que poder reimprimirse ─────────────────────────
  // Una pieza publicada guarda su receta COMPLETA y con qué código se pintó.
  // Antes solo quedaban seed y PNG: la paleta 'auto' depende de qué paletas
  // había ese día y el algo.js cambia, así que una pieza vieja ya no salía igual
  // y no se podía llevar a A2. Ahora:
  //   recipe — formato, params, la paleta con sus colores y si salió sola
  //            ('auto': consumió una tirada) o fijada ('locked': ninguna).
  //   code   — el hash git (blob SHA-1) del algo.js y del _engine.js que
  //            corrían: `git cat-file -p <hash>` devuelve el archivo exacto
  //            aunque después cambie. tools/rerender.mjs lo usa para reimprimir.
  //   El grano va SIEMPRE escrito en params: los harnesses lo mandan, pero una
  //   pieza publicada por otro camino (los capítulos de Instagram lo fueron)
  //   llegaba con params vacíos y heredaba el defecto del código. Si ese defecto
  //   cambia, la pieza cambia con él y `rerender --check` deja de pasar. La
  //   receta tiene que bastar sola.
  function recipeOf(it, pal) {
    const params = { ...(it.params || {}) };
    if (params.grainScale == null) params.grainScale = global.HOKS.GRAIN_DEFAULT;
    return {
      work: it.work, seed: it.seed >>> 0, format: it.format || 'square', base: it.base,
      params,
      pal: (it.palSel === 'auto' || it.palSel == null) ? 'auto' : 'locked',
      palette: pal ? { id: pal.id, name: pal.name, colors: pal.colors } : null,
    };
  }
  async function gitBlob(url) {
    // force-cache: el archivo que ya cargó la página, no uno desplegado después.
    const bytes = new Uint8Array(await (await fetch(url, { cache: 'force-cache' })).arrayBuffer());
    const head = new TextEncoder().encode('blob ' + bytes.length + '\0');
    const all = new Uint8Array(head.length + bytes.length); all.set(head); all.set(bytes, head.length);
    const h = new Uint8Array(await crypto.subtle.digest('SHA-1', all));
    return Array.from(h, b => b.toString(16).padStart(2, '0')).join('');
  }
  async function codeOf(work) {
    const code = {};
    const find = re => { const s = [...document.scripts].find(s => re.test(s.src.split('?')[0])); return s && s.src; };
    const src = { algo: find(new RegExp('/' + work + '/algo\\.js$')), engine: find(/\/_engine\.js$/) };
    for (const k in src) if (src[k]) { try { code[k] = await gitBlob(src[k]); } catch (e) {} }
    return code;
  }
  // La entrada de galería de una receta: el PNG a la resolución del sitio, su
  // receta y su código. Es lo que hace publicar, pieza a pieza.
  function entryFor(it, palettes, code) {
    const c = document.createElement('canvas');
    const d = dimsFor(it, global.HOKS.PREVIEW_SHORT); c.width = d.W; c.height = d.H;
    const res = renderRecipe(c.getContext('2d'), d.W, d.H, it, palettes);
    if (!res) return null;
    return { res, entry: { seed: it.seed, dataUrl: c.toDataURL('image/png'), savedAt: Date.now(),
                           recipe: recipeOf(it, res.pal), code: code || {} } };
  }

  function mount(host, opts) {
    injectCss();
    const toast = opts.toast || (m => console.log(m));
    let batches = [];
    let openId = (() => { const v = localStorage.getItem(OPEN_KEY); return v ? parseInt(v, 10) : null; })();
    let pushTimer = null, dirty = false;
    // Lotes tocados aquí y aún no confirmados por GitHub, con un contador para
    // no dar por subido un lote que se volvió a tocar mientras se subía.
    const touched = new Map();
    const touch = id => touched.set(id, (touched.get(id) || 0) + 1);

    host.innerHTML =
      `<div class="hb-row"><select id="hb-sel"></select>` +
      `<button class="hb-btn" id="hb-new" title="Lote nuevo">+</button></div>` +
      // En vista única no había forma de meter la pieza en el lote salvo la
      // tecla `a`: el + solo existía sobre las miniaturas de la hoja de
      // contactos, y encima al pasar el ratón. El botón es la acción principal
      // del panel, así que va en el panel.
      `<button class="hb-btn hb-take" id="hb-add">+ Al lote<kbd>a</kbd></button>` +
      `<div class="hb-strip" id="hb-strip"></div>` +
      `<div class="hb-row hb-exprow"><select id="hb-res">` +
      global.HOKS.SHEET_IDS.map(id => `<option value="${id}"${id === global.HOKS.DEFAULT_SHEET ? ' selected' : ''} title="${id} a 300 dpi">${id}</option>`).join('') +
      `</select><button class="hb-btn" id="hb-dl" title="El archivo de impresión: cada pieza re-renderizada al pliego elegido, a 300 dpi">↓ Impresión</button>` +
      // La obra y su cartela se imprimen juntas, así que se descargan juntas y
      // al mismo pliego: el selector de arriba manda sobre las dos.
      `<button class="hb-btn" id="hb-cart" title="Una cartela A5 por pieza">↓ Cartelas</button></div>` +
      // Publicar escribe en main, que es la web: es la acción más seria del
      // laboratorio y era un triángulo sin texto. Va sola y dice lo que hace.
      `<button class="hb-btn hb-pubbtn" id="hb-pub">▲ Publicar en la web</button>` +
      `<span class="hb-note" id="hb-note"></span>`;

    const $ = id => host.querySelector('#' + id);
    // El botón de añadir se guarda por referencia: el laboratorio lo saca del
    // panel y lo pone en la barra de encima de la obra, donde se mira.
    const addBtn = $('hb-add');
    const openBatch = () => batches.find(b => b.id === openId && b.status !== 'closed') || null;

    async function syncNow(msg) {
      clearTimeout(pushTimer);
      if (!touched.size) return;
      const sent = new Map(touched);
      const merged = await pushBatches(batches.filter(b => sent.has(b.id)), msg);
      sent.forEach((v, id) => { if (touched.get(id) === v) touched.delete(id); });
      // Se adopta lo de main (trae lo que haya cambiado el panel), salvo los
      // lotes que se han vuelto a tocar mientras tanto.
      const keep = new Map(batches.filter(b => touched.has(b.id)).map(b => [b.id, b]));
      batches = merged.map(b => keep.get(b.id) || b)
        .concat([...keep.values()].filter(b => !merged.some(m => m.id === b.id)));
      if (touched.size) writeOutbox(batches, touched.keys()); else { clearOutbox(); dirty = false; }
    }

    function schedulePush(id) {
      if (id != null) touch(id);
      dirty = true;
      // La selección se escribe primero en una cola recuperable. Si el token
      // falla o se cierra la pestaña durante el debounce, el siguiente arranque
      // retoma exactamente estas recetas en vez de fingir que se guardaron.
      writeOutbox(batches, touched.keys());
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        try {
          await syncNow();
          render();
          note('✓ guardado en GitHub');
          setTimeout(() => { if (!dirty) note(''); }, 1800);
        }
        catch (e) { note('⚠ pendiente de GitHub: ' + e.message); }
      }, PUSH_DELAY);
      note('guardado local · sincronizando con GitHub…');
    }
    function note(m) { $('hb-note').textContent = m; }

    function renderSelect() {
      const open = batches.filter(b => b.status !== 'closed');
      $('hb-sel').innerHTML = '<option value="">— sin lote —</option>' +
        open.map(b => `<option value="${Number(b.id)}"${b.id === openId ? ' selected' : ''}>${escHtml(b.name)} (${b.items.length})</option>`).join('');
    }
    function renderStrip() {
      const b = openBatch(), strip = $('hb-strip');
      // Sin lote no se deshabilita: añadir sin lote abre uno (pide nombre) con
      // la pieza ya dentro, que es lo que hace también la tecla a.
      addBtn.title = b ? 'Añade la pieza en pantalla al lote «' + b.name + '» (a)' : 'Crea un lote con esta pieza (a)';
      // Sin piezas no hay nada que sacar ni publicar: se esconde, en vez de
      // enseñar cuatro botones apagados.
      const exportRow = $('hb-res').parentNode, pub = $('hb-pub');
      const showExport = on => { exportRow.style.display = on ? '' : 'none'; pub.style.display = on ? '' : 'none'; };
      if (!b) { strip.innerHTML = '<span class="hb-empty">sin lote abierto · «+ al lote» crea uno con la pieza dentro</span>'; showExport(false); return; }
      if (!b.items.length) { strip.innerHTML = '<span class="hb-empty">vacío · «+ al lote» sobre la obra, o la tecla <b>a</b></span>'; showExport(false); return; }
      showExport(true);
      $('hb-dl').disabled = $('hb-cart').disabled = false;
      const faltan = b.items.filter(it => !it.published).length;
      pub.disabled = !faltan;
      pub.textContent = faltan ? `▲ Publicar en la web · ${faltan}` : '✓ Todo publicado';
      pub.title = faltan ? `Escribe ${faltan} pieza${faltan > 1 ? 's' : ''} en main: salen en hoks.design` : 'Todas las piezas de este lote ya están en la web';
      strip.innerHTML = '';
      if (pendingAlgo(b.items)) ensureWorks(b.items).then(() => renderStrip());
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
        x.onclick = e => { e.stopPropagation(); b.items.splice(i, 1); schedulePush(b.id); render(); };
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
      schedulePush(b.id); render();
      toast(`→ ${b.name} (${b.items.length}) · sincronizando`);
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
      schedulePush(b.id); render();
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
      plus.type = 'button';
      plus.className = 'hb-add'; plus.textContent = '+ lote';
      plus.title = 'Añadir al lote — botón derecho para elegir a cuál';
      plus.addEventListener('mousedown', e => e.preventDefault());
      const done = () => { const b = openBatch(); plus.classList.add('done'); plus.textContent = '✓ ' + (b ? b.name : 'en lote'); };
      // La pieza ya apartada se ve apartada: volver al grid no la "olvida".
      const b0 = openBatch();
      if (b0 && b0.items.some(it => it.work === opts.work && (it.seed >>> 0) === (seed >>> 0))) done();
      plus.onclick = ev => { ev.stopPropagation(); if (plus.classList.contains('done')) return; if (add(seed)) done(); };
      plus.oncontextmenu = ev => { ev.preventDefault(); ev.stopPropagation(); openMenu(ev, seed, done); };
      fig.oncontextmenu = ev => { ev.preventDefault(); openMenu(ev, seed, done); };
      // Va en el pie, junto a la seed; si la miniatura no tiene pie, se le pone.
      let cap = fig.querySelector('figcaption');
      if (!cap) { cap = document.createElement('figcaption'); fig.appendChild(cap); }
      const wrap = document.createElement('div'); wrap.className = 'hb-cap';
      const label = document.createElement('span');
      while (cap.firstChild) label.appendChild(cap.firstChild);
      wrap.appendChild(label); wrap.appendChild(plus); cap.appendChild(wrap);
      return plus;
    }
    // Exportar: se regenera desde la receta, así que la resolución la eliges ahora
    // y no cuando guardaste. Es la ventaja de haber guardado reglas y no píxeles.
    async function download() {
      const b = openBatch(); if (!b || !b.items.length) return;
      const sheet = $('hb-res').value;
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      // Nunca un pliego en blanco: si el algoritmo de una pieza no carga, se dice.
      const sin = await ensureWorks(b.items);
      if (sin.length) { note('⚠ no carga el algoritmo de ' + [...new Set(sin.map(it => it.work))].join(', ') + ': no se exporta nada'); return; }
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
      const sin = await ensureWorks(b.items);
      if (sin.length) { note('⚠ no carga el algoritmo de ' + [...new Set(sin.map(it => it.work))].join(', ')); return; }
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
      const fams = [...new Set(pending.map(it => it.work.toUpperCase()))].join(', ');
      const ya = b.items.length - pending.length;
      if (!confirm(`¿Publicar en la web ${pending.length} pieza${pending.length > 1 ? 's' : ''} de «${b.name}» (${fams})?\n\n` +
        `Se escribe directamente en main: salen en hoks.design en cuanto GitHub lo sirva, y quedan en la galería de su familia.` +
        (ya ? `\n${ya} ya estaba${ya > 1 ? 'n' : ''} publicada${ya > 1 ? 's' : ''} y no se repite${ya > 1 ? 'n' : ''}.` : ''))) return;
      const palettes = opts.getPalettes ? opts.getPalettes() : [];
      const sin = await ensureWorks(pending);
      if (sin.length) { note('⚠ no carga el algoritmo de ' + [...new Set(sin.map(it => it.work))].join(', ') + ': no se publica nada'); return; }
      const byWork = {};
      pending.forEach(it => { (byWork[it.work] = byWork[it.work] || []).push(it); });
      note('');
      let done = 0, warned = false;
      for (const work of Object.keys(byWork)) {
        note('publicando ' + work.toUpperCase() + '…');
        const code = await codeOf(work);
        const made = [], usage = [];
        for (const it of byWork[work]) {
          const m = entryFor(it, palettes, code);
          if (!m) continue;
          made.push({ it, m });
          // La paleta que va al índice es la que ha salido en ESTE render, no la
          // que tuviera la receta: si hubo deriva, manda el píxel publicado.
          if (m.res.pal) usage.push({ family: work, seed: it.seed >>> 0, savedAt: m.entry.savedAt,
                                      paletteId: m.res.pal.id, paletteName: m.res.pal.name });
        }
        if (!made.length) continue;
        // La galería se lee y se escribe en la misma operación: si otra
        // publicación entra a la vez, se repite sobre lo nuevo en vez de pisarla.
        try {
          await GH().update('data/' + work + '.json', cur => {
            if (cur !== undefined && !Array.isArray(cur)) throw new Error(work + '.json no es una lista: no se escribe encima');
            return made.map(x => x.m.entry).concat(cur || []);
          }, 'publish ' + made.length + ' ' + work + ' from batch ' + b.name);
        } catch (e) { warned = true; note('⚠ ' + work + ': ' + e.message + ' · no se ha publicado nada de ' + work.toUpperCase()); break; }
        // Solo ahora está publicada: antes se marcaba antes de subir, y un
        // fallo dejaba piezas "publicadas" que nunca llegaron a la galería.
        // Se marca sobre el lote vigente (la sincronización puede haberlo
        // sustituido por la copia de main), pieza a pieza por obra y seed.
        const cur = batches.find(x => x.id === b.id) || b;
        cur.items.forEach(it => { if (made.some(x => x.it.work === it.work && x.it.seed === it.seed)) it.published = true; });
        done += made.length;
        touch(b.id);
        try { await syncNow('mark published ' + work + ' in ' + b.name); }
        catch (e) { warned = true; note('⚠ publicado, pero el lote no se pudo marcar: ' + e.message); }
        // El índice de uso (data/palette-usage.json) solo tiene sentido si se
        // alimenta aquí: publicar es lo único que crea obra guardada.
        if (global.HOKSUSAGE) {
          try { await global.HOKSUSAGE.recordMany(usage); }
          catch (e) { warned = true; note('⚠ publicado, pero el índice de paletas no se actualizó: ' + e.message); }
        }
      }
      if (!warned) note('');
      render();
      if (done) toast('Publicado · ' + done + ' pieza(s)');
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
      if (pendingAlgo(b.items)) ensureWorks(b.items).then(() => { if (host.isConnected) renderFull(host); });
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
        x.onclick = () => { b.items.splice(i, 1); schedulePush(b.id); render(); renderFull(host); };
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
    // Sin flecha, onclick le pasaba el evento como seed: cada lote nuevo nacía
    // con una pieza de seed 0 dentro (el evento >>> 0 es 0).
    $('hb-new').onclick = () => create();
    $('hb-dl').onclick = download;
    $('hb-cart').onclick = downloadCartelas;
    addBtn.onclick = () => {
      if (!opts.getSeed) { toast('El harness no expone la seed actual'); return; }
      if (add(opts.getSeed())) { addBtn.textContent = '✓ En el lote';
        setTimeout(() => { addBtn.innerHTML = '+ Al lote<kbd>a</kbd>'; }, 1100); }
    };

    // Avisa si te vas con cambios sin commitear.
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    render();
    pull().then(d => {
      const pending = readOutbox();
      batches = d;
      if (pending) {
        // Lo pendiente se pone encima de lo de main, lote a lote.
        const mine = new Map(pending.batches.filter(b => pending.touched.includes(b.id)).map(b => [b.id, b]));
        batches = d.map(b => mine.get(b.id) || b)
          .concat([...mine.values()].filter(b => !d.some(x => x.id === b.id)));
        mine.forEach((b, id) => touch(id));
      }
      render();
      if (pending && touched.size) {
        note('recuperado · sincronizando con GitHub…');
        schedulePush();
      }
    });

    // El pliego se elige una sola vez y aquí: la descarga de la obra y la de su
    // cartela tienen que hablar del mismo papel.
    return { add, addTo, attach, refresh: render, renderFull, sheet: () => $('hb-res').value,
             get open() { return openBatch(); } };
  }

  global.HOKSBATCH = { mount, renderRecipe, entryFor, codeOf };
})(typeof window !== 'undefined' ? window : globalThis);
