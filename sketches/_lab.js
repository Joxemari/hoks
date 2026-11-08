/* hoks · piezas comunes del laboratorio — selector de obra y selector de paleta.
 *
 * El harness de cada obra es casi el mismo archivo cuatro veces; esto recorta la
 * parte que no tiene por qué repetirse. Depende de palette-picker.js (raíz).
 *
 *   <script src="../../palette-picker.js"></script>
 *   <script src="../_lab.js"></script>          →   window.HOKSLAB
 */
(function (global) {
  'use strict';

  // Obras graduadas: las que tienen sketches/<slug>/algo.js y por tanto pueden
  // abrirse en el laboratorio. admin.html mantiene su propia copia (es un panel
  // autónomo, no carga scripts externos): al graduar una obra, tocar las dos.
  const GRADUATED = ['plls', 'krrtk', 'dtk', 'dtkrt', 'eclps', 'trzs', 'evol', 'hrrs', 'ptzd'];
  const REPO = 'Joxemari/hoks';
  const RAW = 'https://raw.githubusercontent.com/' + REPO + '/main/data/';

  // works.json una sola vez por página: lo piden el selector de obra y el de
  // formato, y no tiene sentido traerlo dos veces.
  let worksCache = null, worksPending = null;
  function loadWorks() {
    if (worksCache) return Promise.resolve(worksCache);
    if (!worksPending) {
      worksPending = fetch(RAW + 'works.json?t=' + Date.now())
        .then(r => r.ok ? r.json() : null)
        .then(d => (worksCache = Array.isArray(d) ? d : []))
        .catch(() => (worksCache = []));
    }
    return worksPending;
  }

  // ── Selector de formato: qué proporciones ofrece ESTA obra ──────────────────
  // No todas las familias existen en todos los formatos. Una fila necesita
  // recorrido y en cuadrado deja de ser una fila; un retículo, en cambio, se
  // compone igual de bien en los dos. Lo que cada una admite se declara en su
  // algo.js (FORMATS) y el panel lo puede cambiar por works.json sin tocar
  // código. Sin red manda lo del algo.js, que es lo que viaja con la obra.
  const FMT_LABEL = {
    square:     '\u25A1 Cuadrado (1:1)',
    vertical:   '\u25AF Vertical (1:\u221A2)',
    horizontal: '\u25AD Horizontal (\u221A2:1)',
    double:     '\u25AD\u25AD Doble \u00B7 dos pliegos (2\u221A2:1)',
  };
  function mountFormatSelect(sel, slug, opts) {
    opts = opts || {};
    const fallback = (opts.fallback && opts.fallback.length) ? opts.fallback : global.HOKS.FORMATS;
    let current = null;
    function fill(list) {
      const keep = list.indexOf(sel.value) >= 0 ? sel.value : list[0];
      sel.innerHTML = list.map(f => `<option value="${f}">${FMT_LABEL[f] || f}</option>`).join('');
      sel.value = keep;
      // Un solo formato no es una elección: se enseña, pero no se toca.
      sel.disabled = list.length < 2;
      const changed = current !== null && keep !== current;
      current = keep;
      return changed;
    }
    fill(fallback);
    loadWorks().then(w => {
      if (fill(global.HOKS.formatsFor(slug, w) || fallback) && opts.onChange) opts.onChange(sel.value);
    });
    return { value: () => sel.value };
  }

  // ── Selector de obra ───────────────────────────────────────────────────────
  // Cambiar de familia sin volver al índice, conservando la seed: la misma seed
  // en otra gramática no da la misma imagen, pero mantiene el hilo de la sesión.
  function mountWorkPicker(host, currentSlug, getSeed) {
    const sel = document.createElement('select');
    sel.id = 'work';
    host.appendChild(sel);

    function fill(works) {
      sel.innerHTML = works.map(w =>
        `<option value="${w.slug}"${w.slug === currentSlug ? ' selected' : ''}>${w.name}</option>`).join('');
    }
    // Sin red (file://, sin conexión) el laboratorio tiene que seguir abriendo.
    fill(GRADUATED.map(s => ({ slug: s, name: s.toUpperCase() })));

    loadWorks()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        // TODAS las graduadas, publicadas o no. `active` decide qué enseña la
        // WEB, no qué se puede abrir en la mesa: esconder aquí lo inactivo era
        // esconder justamente el trabajo en curso —una familia que aún no tiene
        // ficha, o una retirada que se está rehaciendo— y obligaba a llegar a
        // ella tecleando la URL. El orden es el de GRADUATED, no el de
        // works.json, para que la lista no se recoloque cuando llega la red.
        const byslug = new Map(list.filter(w => w && w.slug).map(w => [w.slug, w]));
        const works = GRADUATED.map(slug => {
          const w = byslug.get(slug);
          const name = (w && w.name) || slug.toUpperCase();
          // Marcada la que no está publicada: el laboratorio enseña las dos
          // cosas, así que tiene que decir cuál es cuál.
          return { slug, name: w && w.active ? name : name + ' · (fuera de la web)' };
        });
        // La obra abierta se queda en la lista aunque no esté graduada: si no,
        // el selector mostraría otra cosa distinta de lo que hay en pantalla.
        if (!works.some(w => w.slug === currentSlug)) {
          const me = byslug.get(currentSlug);
          works.unshift({ slug: currentSlug, name: (me && me.name) || currentSlug.toUpperCase() });
        }
        fill(works);
      })
      .catch(() => {});

    sel.onchange = () => {
      const seed = getSeed ? getSeed() : null;
      location.href = '../' + sel.value + '/' + (seed == null ? '' : '?seed=' + (seed >>> 0));
    };
    return sel;
  }

  // ── Selector de paleta ─────────────────────────────────────────────────────
  // Envuelve el picker compartido añadiendo la entrada "aleatoria por peso", que
  // es el comportamiento de producción y por tanto el que debe venir por defecto.
  function mountPalettePicker(host, opts) {
    opts = opts || {};
    const AUTO = { name: opts.autoLabel || 'Al azar entre todas (por peso)', auto: true, colors: [] };
    let palettes = opts.palettes || [];
    let sel = 'auto';   // 'auto' | índice dentro de palettes

    const picker = global.HOKSPAL.mount(host, {
      palettes: [AUTO].concat(palettes),
      index: 0,
      label: 'Palette',
      onChange: i => { sel = i === 0 ? 'auto' : i - 1; if (sel === 'auto' && modo === 'una') setModo('todas'); if (opts.onChange) opts.onChange(); },
    });

    // TRES MANERAS DE ELEGIR, a la vista y con nombre: TODAS (el azar por peso,
    // que es producción), UNA (fijada) y VARIAS (el azar solo entre las marcadas,
    // a partes iguales). Lo pidió el autor para trabajar una serie de DTKRT con
    // dos o tres paletas; la primera versión era un enlace discreto y no lo
    // encontró. Para el algoritmo «varias» es `auto` con una lista corta —consume
    // la misma tirada—, así que la receta guarda `pal:'auto'` y la paleta que
    // salió, y se reproduce igual.
    const marcadas = new Set();   // nombres, para sobrevivir a setPalettes
    let modo = 'todas';           // 'todas' | 'una' | 'varias'
    const seg = document.createElement('div');
    seg.style.cssText = 'display:flex;gap:3px;margin-top:5px';
    const btn = {};
    [['todas', 'Todas'], ['una', 'Una'], ['varias', 'Varias']].forEach(([k, txt]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = txt;
      b.style.cssText = 'flex:1;padding:5px 4px;font-size:9px;letter-spacing:0.08em;border:1px solid var(--border,#e8e8e8);background:transparent;color:var(--ink,#111);width:auto';
      b.onclick = () => { setModo(k); if (opts.onChange) opts.onChange(); };
      btn[k] = b; seg.appendChild(b);
    });
    const lista = document.createElement('div');
    lista.style.cssText = 'display:none;max-height:170px;overflow:auto;margin-top:4px;border:1px solid var(--border,#e8e8e8);border-radius:2px;padding:4px 5px;font-size:10px;letter-spacing:0.02em';
    const barra = document.createElement('div');
    barra.style.cssText = 'display:none;justify-content:space-between;margin-top:3px;font-size:9px;color:var(--ink3,#888);letter-spacing:0.04em';
    host.appendChild(seg); host.appendChild(barra); host.appendChild(lista);
    function subset() { return palettes.filter(p => marcadas.has(p.name)); }
    function setModo(k) {
      modo = k;
      if (k !== 'una') { sel = 'auto'; picker.setIndex(0); }
      if (k === 'una' && sel === 'auto') { sel = 0; picker.setIndex(1); }
      Object.keys(btn).forEach(x => { btn[x].style.background = x === modo ? 'var(--ink,#111)' : 'transparent'; btn[x].style.color = x === modo ? '#fff' : 'var(--ink,#111)'; });
      lista.style.display = modo === 'varias' ? '' : 'none';
      barra.style.display = modo === 'varias' ? 'flex' : 'none';
      // el desplegable es el mando de UNA: en los otros dos modos sobra
      const trig = host.querySelector('.hokspal-trigger');
      if (trig) trig.style.display = modo === 'una' ? '' : 'none';
      pintaBarra();
    }
    function pintaLista() {
      lista.innerHTML = '';
      // activas primero; las retiradas al final y dichas
      const orden = palettes.map((p, i) => ({ p, i })).sort((a, b) => ((b.p.active !== false) - (a.p.active !== false)) || (a.i - b.i));
      orden.forEach(({ p }) => {
        const row = document.createElement('label');
        row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 0;cursor:pointer;text-transform:none;font-weight:400';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = marcadas.has(p.name);
        cb.onchange = () => { if (cb.checked) marcadas.add(p.name); else marcadas.delete(p.name); pintaBarra(); if (opts.onChange) opts.onChange(); };
        const strip = document.createElement('span');
        strip.style.cssText = 'display:inline-flex;width:48px;height:10px;flex:0 0 auto;border:1px solid rgba(0,0,0,0.08)';
        (p.colors || []).forEach(c => { const sw = document.createElement('i'); sw.style.cssText = 'flex:1;background:' + c; strip.appendChild(sw); });
        const nm = document.createElement('span'); nm.textContent = p.name + (p.active === false ? ' · retirada' : '');
        if (p.active === false) nm.style.color = 'var(--ink3,#888)';
        row.appendChild(cb); row.appendChild(strip); row.appendChild(nm); lista.appendChild(row);
      });
      pintaBarra();
    }
    function pintaBarra() {
      const n = subset().length;
      barra.innerHTML = '';
      const t = document.createElement('span'); t.textContent = n ? n + ' marcadas · el azar elige entre ellas' : 'marca dos o más';
      const acc = document.createElement('span');
      const mk = (txt, fn) => { const a = document.createElement('a'); a.href = '#'; a.textContent = txt; a.style.cssText = 'color:inherit;margin-left:8px'; a.onclick = e => { e.preventDefault(); fn(); pintaLista(); if (opts.onChange) opts.onChange(); }; acc.appendChild(a); };
      mk('activas', () => { marcadas.clear(); palettes.filter(p => p.active !== false).forEach(p => marcadas.add(p.name)); });
      mk('ninguna', () => marcadas.clear());
      barra.appendChild(t); barra.appendChild(acc);
    }
    pintaLista();
    setModo('todas');

    return {
      // Lo que espera render(): paleta fijada, o todas y que el RNG elija —o solo
      // entre las marcadas, que para el algoritmo es lo mismo con una lista corta.
      opts() {
        if (modo === 'una' && sel !== 'auto') return { palettes, locked: true, lockedIdx: sel };
        const sub = modo === 'varias' ? subset() : [];
        // entre las marcadas, a partes iguales: el peso por antigüedad es para
        // la tirada entre todas, no para una selección hecha a mano
        return { palettes: sub.length ? sub.map(p => Object.assign({}, p, { prob: 1 / sub.length })) : palettes };
      },
      get selection() { return modo === 'una' ? sel : 'auto'; },
      get marcadas() { return modo === 'varias' ? subset().map(p => p.name) : []; },
      setPalettes(list) {
        palettes = list || [];
        picker.setPalettes([AUTO].concat(palettes), sel === 'auto' ? 0 : sel + 1);
        pintaLista();
      },
      select(v) {
        sel = (v === 'auto' || v == null) ? 'auto' : parseInt(v, 10);
        picker.setIndex(sel === 'auto' ? 0 : sel + 1);
        setModo(sel === 'auto' ? 'todas' : 'una');
      },
    };
  }

  // Un lote puede mezclar obras, así que para pintar sus miniaturas hacen falta
  // todos los algoritmos, no solo el de este harness. Pesan unos KB cada uno.
  // Se inyectan DESPUÉS de _engine.js (los algos lo necesitan cargado).
  function loadAlgos(done) {
    const missing = GRADUATED.filter(s => !(global.HOKS && global.HOKS[s.toUpperCase()]));
    let left = missing.length;
    if (!left) { if (done) done(); return; }
    missing.forEach(slug => {
      const el = document.createElement('script');
      el.src = '../' + slug + '/algo.js';
      el.async = false;
      el.onload = el.onerror = () => { if (--left === 0 && done) done(); };
      document.head.appendChild(el);
    });
  }

  // ── Enlaces a las páginas de MIRAR ─────────────────────────────────────────
  // El muro y las fotos son VISTAS, no parámetros: ninguna cambia un píxel de la
  // obra. El muro es el ALZADO —cuánto mide, para decidir el pliego—; las fotos
  // son la FOTO —la obra sobre la cosa, para publicar—. Por eso viven en sus
  // propias páginas y el panel solo pone enlaces: meter aquí pliego, soporte y
  // encuadre sería engordar los mandos de generar con mandos de mirar.
  //
  // Lo que viaja es la RECETA, que ya es el contrato común de los harnesses y de
  // _batch.js. Se serializa entera en vez de campo a campo: así un parámetro
  // nuevo en una obra llega a las dos páginas sin tocar nada.
  function recipeParam(recipe) {
    const r = {
      work:   recipe.work,
      seed:   recipe.seed >>> 0,
      format: recipe.format || 'square',
      params: recipe.params || {},
      palSel: recipe.palSel == null ? 'auto' : recipe.palSel,
    };
    return '?r=' + encodeURIComponent(JSON.stringify(r));
  }
  function wallUrl(recipe)    { return '../_wall/' + recipeParam(recipe); }

  // ── La receta que LLEGA por URL ────────────────────────────────────────────
  // La otra mitad del mismo contrato, y vive aquí por el mismo motivo: la leen
  // dos páginas, y dos copias de un contrato son deriva esperando turno. Admite
  // las dos formas: el blob JSON que manda el panel y una versión legible que se
  // puede teclear (?work=dtkrt&seed=123&fmt=horizontal). Sin nada, una tirada al
  // azar de `dflt` para que la página abra igual y se entienda de qué va.
  function readRecipe(dflt) {
    const q = new URLSearchParams(location.search);
    const raw = q.get('r');
    if (raw) {
      try {
        const r = JSON.parse(raw);
        if (r && r.work) return normalizeRecipe(r);
      } catch (e) { console.warn('[hoks] receta ilegible en ?r=', e); }
    }
    return normalizeRecipe({
      work:   q.get('work') || dflt || 'dtkrt',
      seed:   q.get('seed'),
      format: q.get('fmt') || q.get('format'),
      palSel: q.get('pal'),
    });
  }
  function normalizeRecipe(r) {
    const seed = parseInt(r.seed, 10);
    const fmt = global.HOKS.ALL_FORMATS.indexOf(r.format) >= 0 || r.format === 'vertical'
      ? r.format : 'square';
    const palSel = (r.palSel == null || r.palSel === 'auto' || r.palSel === '')
      ? 'auto' : parseInt(r.palSel, 10);
    return {
      work:   String(r.work || 'dtkrt').toLowerCase(),
      seed:   Number.isFinite(seed) ? (seed >>> 0) : ((Math.random() * 0xFFFFFFFF) >>> 0),
      format: fmt,
      params: (r.params && typeof r.params === 'object') ? r.params : {},
      palSel: Number.isFinite(palSel) ? palSel : 'auto',
    };
  }

  // Trae su propio CSS, como _batch.js y palette-picker.js: diez harnesses no
  // tienen por qué llevar diez copias de la misma regla.
  const VIEW_CSS = `
.view-links { display:flex; flex-direction:column; gap:6px; }
.view-link { display:block; font-family:'Courier New',Courier,monospace; font-size:10px;
  font-weight:700; letter-spacing:0.1em; text-transform:uppercase; text-align:center;
  color:#8a8983; text-decoration:none; border:1px dashed #e7e5df; border-radius:6px;
  padding:8px; cursor:pointer; transition:color .15s, border-color .15s; }
.view-link:hover, .view-link:focus-visible { color:#0a0a0a; border-color:#d8d5cc; }
`;
  let viewCssDone = false;
  function injectViewCss() {
    if (viewCssDone || typeof document === 'undefined') return;
    viewCssDone = true;
    const s = document.createElement('style'); s.textContent = VIEW_CSS;
    document.head.appendChild(s);
  }

  // El href se recalcula al posarse encima o al enfocar, no en cada refresh:
  // así sigue siendo un enlace de verdad (botón central, abrir en pestaña) sin
  // que arrastrar un slider tenga que reconstruir la URL en cada píxel.
  function mountViewLinks(host, getRecipe) {
    injectViewCss();
    const box = document.createElement('div');
    box.className = 'view-links';
    host.appendChild(box);

    const syncs = [
      ['▤ Ver en el muro ↗',  'La pieza a escala sobre una pared: pliego, figura y regla', wallUrl],
    ].map(([text, title, url]) => {
      const a = document.createElement('a');
      a.className = 'view-link';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = text;
      a.title = title + ', en otra pestaña';
      box.appendChild(a);
      const sync = () => {
        try { a.href = url(getRecipe()); }
        catch (e) { a.removeAttribute('href'); }
      };
      a.addEventListener('pointerenter', sync);
      a.addEventListener('focus', sync);
      sync();
      return sync;
    });

    return { sync: () => syncs.forEach(f => f()) };
  }

  // Seed inicial: ?seed= si viene del selector de obra, si no una al azar.
  function initialSeed() {
    const q = new URLSearchParams(location.search).get('seed');
    const n = q == null ? NaN : parseInt(q, 10);
    return Number.isFinite(n) ? (n >>> 0) : (Math.random() * 0xFFFFFFFF) >>> 0;
  }

  // ── Girar la vista y elegir campo: solo dicen algo en horizontal ────────────
  // Los dos controles son no-ops sobre formato cuadrado, pero por motivos
  // distintos:
  //   · El giro no es inocuo. Sobre un DIN devuelve la misma obra vista de pie;
  //     sobre un cuadrado devuelve la obra ROTADA 90°, que es otra imagen y no
  //     es la que se publica. Juzgar por ahí sería juzgar lo que no existe.
  //   · El campo sí es inocuo, y por eso confunde más: fieldGrid entra por la
  //     rama del campo cuadrado en cuanto L−S < 1, mire lo que mire
  //     params.field. El desplegable se mueve y no pasa nada.
  // Se esconden en vez de quedarse ahí sin efecto, y el botón se deshabilita
  // para que la tecla r tampoco lo reviva: un button disabled no dispara click().
  // Devuelve el ROT que debe quedar — falso si el formato es cuadrado.
  function formatControls(format, rotOn) {
    const square = format === 'square';
    const rot = document.getElementById('rot');
    const field = document.getElementById('field');
    const fieldGroup = field && field.closest('.group');
    const rotHint = rot && rot.parentElement && rot.parentElement.querySelector('.hintline');
    const on = square ? false : !!rotOn;
    if (rot) {
      rot.disabled = square;
      rot.style.display = square ? 'none' : '';
      rot.textContent = on ? '⟲ Ver tumbado (r)' : '⟲ Ver de pie (r)';
    }
    if (rotHint)    rotHint.style.display    = square ? 'none' : '';
    if (fieldGroup) fieldGroup.style.display = square ? 'none' : '';
    return on;
  }

  // ── Lanzar a producción = ACTIVAR ──────────────────────────────────────────
  // Un solo sitio para el gesto que antes vivía copiado en el harness. Lanzar
  // NO publica obra (eso es publicar el lote): solo pone active:true en
  // works.json, o sea, enciende la familia en la web. Por eso aquí: si no hay
  // lote publicado avisa de que se verá como SOON, y si la familia aún no tiene
  // año de creación lo pide — dejar de estar "en curso" es justo esto.
  //   HOKSLAB.launch('plls', document.getElementById('launchMsg'))
  async function launch(slug, msgEl) {
    const msg = t => { if (msgEl) msgEl.textContent = t; };
    const token = localStorage.getItem('hoks-gh-token');
    const isAdmin = sessionStorage.getItem('hoks-admin-session') === '1' ||
                    localStorage.getItem('hoks-admin-session') === '1';
    if (!isAdmin || !token) { msg('⚠ Requiere sesión admin con token — entra en /admin.html.'); return; }

    // ¿Hay lote publicado? Activar sin obra deja la sección como SOON.
    msg('Comprobando galería…');
    let count = 0;
    try {
      const g = await fetch(RAW + slug + '.json?t=' + Date.now());
      if (g.ok) { const arr = await g.json(); count = Array.isArray(arr) ? arr.length : 0; }
    } catch (e) {}
    if (count === 0 && !confirm(
        slug.toUpperCase() + ' no tiene ningún lote publicado todavía.\n\n' +
        'Lanzar solo la HACE VISIBLE en la web: se verá como SOON hasta que publiques un lote ' +
        '(publicar el lote es lo que llena la galería). ¿Activar igualmente?')) {
      msg('Cancelado — publica un lote primero, o actívala igualmente.'); return;
    }

    msg('Leyendo works.json…');
    try {
      const rd = await fetch(`https://api.github.com/repos/${REPO}/contents/data/works.json`, { headers: { Authorization: 'Bearer ' + token } });
      if (!rd.ok) { msg('⚠ No se pudo leer works.json (' + rd.status + ')'); return; }
      const j = await rd.json();
      const works = JSON.parse(decodeURIComponent(escape(atob(j.content))));
      const w = works.find(x => x.slug === slug || x.id === slug);
      if (!w) { msg('⚠ "' + slug + '" no está en works.json'); return; }
      if (w.active === true && w.year) { msg('✓ Ya está en producción.'); return; }

      w.active = true;
      if (!w.year) {
        const y = prompt('Año de creación de ' + slug.toUpperCase() + ' (se muestra bajo el nombre):', String(new Date().getFullYear()));
        const yi = parseInt(y, 10);
        if (yi >= 2000 && yi <= 2099) w.year = yi;
      }
      msg('Activando…');
      const body = { message: `launch ${slug} to production`, content: btoa(unescape(encodeURIComponent(JSON.stringify(works, null, 2)))), sha: j.sha };
      const wr = await fetch(`https://api.github.com/repos/${REPO}/contents/data/works.json`, { method: 'PUT', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      msg(wr.ok
        ? '✓ Activada — visible en la landing en ~30s' + (count === 0 ? ' (como SOON hasta publicar un lote).' : '.')
        : '⚠ Error al escribir (' + wr.status + ')');
    } catch (e) { msg('⚠ ' + e.message); }
  }

  // ── Botón "atrás" ───────────────────────────────────────────────────────
  // El admin abre laboratorio y muro en pestaña nueva, así que la flecha del
  // navegador no vuelve a ningún sitio. Este chip sí: si hay historial, atrás;
  // si no (pestaña recién abierta), a admin.html. Se inyecta en todo harness y
  // en el muro —los dos cargan este archivo— sin tocar sus HTML.
  function injectBack() {
    if (typeof document === 'undefined' || document.getElementById('hoks-back')) return;
    const a = document.createElement('button');
    a.id = 'hoks-back';
    a.type = 'button';
    a.textContent = '← atrás';
    a.title = 'Volver (al panel si vienes de él)';
    // width:auto a propósito: los harnesses ponen `button { width:100% }` y el
    // chip salía como una barra de lado a lado del escenario
    a.style.cssText = 'position:fixed;bottom:12px;right:14px;z-index:300;width:auto;' +
      "font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.1em;" +
      'text-transform:uppercase;color:#0a0a0a;background:rgba(251,251,250,0.92);' +
      'border:1px solid #d8d5cc;border-radius:8px;padding:6px 11px;cursor:pointer;' +
      'backdrop-filter:saturate(1.2) blur(2px);';
    a.addEventListener('mouseenter', () => { a.style.borderColor = '#0a0a0a'; });
    a.addEventListener('mouseleave', () => { a.style.borderColor = '#d8d5cc'; });
    a.addEventListener('click', () => {
      if (history.length > 1 && document.referrer) history.back();
      else location.href = '/admin.html';
    });
    document.body.appendChild(a);
  }
  // ── Botón "copiar imagen" ───────────────────────────────────────────────
  // Junto a Save PNG, uno más ligero (ghost): copia la vista actual al
  // portapapeles como PNG —sin archivo, sin re-render a tamaño de impresión—
  // para pegar rápido en un chat, un doc o una story. Se inyecta en el panel
  // de cualquier harness (los que tienen #save y #single); el muro no los
  // tiene, así que ahí no aparece. Sin tocar el HTML de cada harness.
  function injectCopy() {
    if (typeof document === 'undefined' || document.getElementById('copyImg')) return;
    const save = document.getElementById('save');
    const canvas = document.getElementById('single');
    if (!save || !canvas || !save.parentNode) return;
    const b = document.createElement('button');
    b.id = 'copyImg';
    b.type = 'button';
    b.className = 'ghost';
    b.textContent = '⎘ Copiar imagen';
    b.title = 'Copia la vista actual al portapapeles (PNG). Más ligero que descargar.';
    const status = document.getElementById('status');
    const flash = (m) => {
      if (status) { status.textContent = m; return; }
      const t = b.textContent; b.textContent = m; setTimeout(() => { b.textContent = t; }, 1400);
    };
    b.addEventListener('click', () => {
      if (!(navigator.clipboard && window.ClipboardItem && canvas.toBlob)) { flash('⚠ portapapeles no disponible'); return; }
      canvas.toBlob((blob) => {
        if (!blob) { flash('⚠ no se pudo generar la imagen'); return; }
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(() => flash('✓ imagen copiada'))
          .catch(() => flash('⚠ no se pudo copiar (¿permiso del portapapeles?)'));
      }, 'image/png');
    });
    save.parentNode.insertBefore(b, save.nextSibling);
  }

  // ── El escenario: mirar va junto a la obra, ajustar va en la columna ───────
  // La columna mezclaba dos trabajos: decidir QUÉ se genera (obra, tirada,
  // afinado) y MIRAR lo generado (seed, pieza / grid / lote, apartar). Lo
  // segundo se hace con los ojos en la obra, así que va encima de ella, en una
  // barra fija. La columna se queda con lo que cambia la imagen y con sacar.
  // Se monta sobre los ids que comparten los diez harnesses —no reescribe su
  // HTML ni su lógica—: mueve los elementos con sus manejadores puestos.
  const STAGE_CSS = `
.lab-bar { position:sticky; top:-1.5rem; z-index:20; align-self:stretch; display:flex; flex-wrap:wrap;
  align-items:center; gap:8px 14px; margin:-1.5rem -1.5rem 0; padding:10px 1.5rem;
  background:var(--surface,#f3f1ec); border-bottom:1px solid var(--border,#e7e5df); }
.lab-bar button { width:auto; }
.lab-seg { display:inline-flex; border:1px solid var(--ink,#0a0a0a); border-radius:2px; overflow:hidden; }
.lab-seg button { border:0; border-radius:0; background:transparent; color:var(--ink,#0a0a0a);
  padding:7px 12px; font-size:10px; letter-spacing:0.1em; }
.lab-seg button + button { border-left:1px solid var(--ink,#0a0a0a); }
.lab-seg button.on { background:var(--ink,#0a0a0a); color:#fff; }
.lab-seg button:hover { opacity:1; background:var(--paper,#fbfbfa); }
.lab-seg button.on:hover { background:var(--ink,#0a0a0a); }
.lab-seg kbd, .lab-bar kbd { font-family:inherit; font-weight:400; opacity:0.5; margin-left:4px; }
.lab-seed { display:inline-flex; align-items:center; gap:4px; }
.lab-seed button { background:transparent; color:var(--ink,#0a0a0a); border:1px solid var(--border,#e7e5df);
  padding:6px 9px; }
.lab-seed button:hover { border-color:var(--ink,#0a0a0a); opacity:1; }
.lab-seed input#seed { width:15ch; padding:6px 7px; font-size:12px; border:1px solid var(--border,#e7e5df);
  background:var(--paper,#fbfbfa); border-radius:2px; }
.lab-bar .lab-push { margin-left:auto; }
.lab-bar #hb-add { width:auto; padding:7px 14px; }
.lab-bar #volver { padding:6px 10px; }
/* La barra arriba del todo y la obra centrada en lo que queda: el escenario
   centraba el bloque entero y la barra flotaba a media altura. */
.stage { justify-content:flex-start !important; }
.stage > #single { margin-top:auto; max-height:calc(100vh - 190px); max-width:min(100%, calc(100vh - 190px)); }
.stage > #status { margin-bottom:auto; }
.lab-rasgos { align-self:stretch; max-width:980px; margin:0 auto; width:100%; }
.lab-rasgos .traits { flex-direction:row; flex-wrap:wrap; justify-content:center; gap:4px 16px; }
.lab-rasgos .traits .t { gap:6px; justify-content:flex-start; }
.lab-rasgos .traits .t[style] { margin-top:0 !important; border-top:0 !important; padding-top:0 !important; }
.lab-auto { width:auto; margin-left:auto; flex:0 0 auto; font-size:8px; letter-spacing:0.12em; padding:2px 6px;
  border:1px solid var(--border,#e7e5df); background:transparent; color:var(--ink3,#8a8983); border-radius:2px; }
.lab-auto.on { background:var(--ink,#0a0a0a); border-color:var(--ink,#0a0a0a); color:#fff; cursor:default; }
.lab-auto:not(.on):hover { border-color:var(--ink,#0a0a0a); color:var(--ink,#0a0a0a); opacity:1; }
.lab-lbl-row { display:flex; align-items:center; gap:6px; }
.lab-reset { margin-top:8px; }
details.afinado summary .lab-fixed { color:var(--ink,#0a0a0a); }
`;

  function stageButton(html, title) {
    const b = document.createElement('button');
    b.type = 'button'; b.innerHTML = html; if (title) b.title = title;
    // Sin foco: el espacio y las flechas son del laboratorio. Un botón enfocado
    // se "pulsaría" otra vez con el espacio que pide una seed nueva.
    b.addEventListener('mousedown', e => e.preventDefault());
    return b;
  }
  // Las flechas y el espacio ya los atiende cada harness en su keydown: los
  // botones de la barra le dicen lo mismo que el teclado, sin otra copia de la
  // lógica de seeds en cada laboratorio.
  const key = (k, code) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: code || k, bubbles: true }));
  function hideIfEmpty(el) {
    if (el && !el.querySelector('input, select, button, a, canvas, #batchPanel')) el.style.display = 'none';
  }

  function mountStage() {
    const stage = document.querySelector('.stage'), panel = document.querySelector('.panel');
    const $ = id => document.getElementById(id);
    if (!stage || !panel || !$('single') || !$('sheetGrid') || $('labBar')) return;
    const css = document.createElement('style'); css.textContent = STAGE_CSS; document.head.appendChild(css);

    const bar = document.createElement('div'); bar.id = 'labBar'; bar.className = 'lab-bar';
    stage.insertBefore(bar, stage.firstChild);

    // 1. Qué se mira: la pieza, doce variaciones de su seed, o el lote.
    const seg = document.createElement('div'); seg.className = 'lab-seg';
    const views = [['single', 'Pieza', ''], ['sheet', 'Grid', 'g'], ['batch', 'Lote', 'b']];
    const segBtn = {};
    views.forEach(([v, label, k]) => {
      const b = stageButton(label + (k ? `<kbd>${k}</kbd>` : ''), label === 'Pieza' ? 'Vista de la pieza' : label === 'Grid' ? 'Doce variaciones desde esta seed (g)' : 'El lote abierto entero (b)');
      b.onclick = () => { if (typeof global.setView === 'function') global.setView(v); };
      segBtn[v] = b; seg.appendChild(b);
    });
    bar.appendChild(seg);
    let current = 'single';
    const mark = v => { current = v; Object.keys(segBtn).forEach(k => segBtn[k].classList.toggle('on', k === v)); syncRasgos(); };
    if (typeof global.setView === 'function') {
      const orig = global.setView;
      global.setView = function (v) {
        orig.apply(this, arguments);
        // setView se niega a cambiar (lote sin abrir): manda lo que se ve.
        const single = $('single').style.display !== 'none';
        mark(single ? 'single' : (v === 'single' ? current : v));
      };
    }
    // Los botones viejos de la columna siguen existiendo (el harness les cambia
    // el texto); solo dejan de verse.
    ['sheet', 'batchView'].forEach(id => { const b = $(id); if (b) b.style.display = 'none'; });
    if ($('volver')) bar.appendChild($('volver'));

    // 2. Qué seed: la de antes, esta, la de después, una nueva.
    const sd = document.createElement('div'); sd.className = 'lab-seed';
    const prev = stageButton('‹', 'Seed anterior (←)'); prev.onclick = () => key('ArrowLeft');
    const next = stageButton('›', 'Seed siguiente (→)'); next.onclick = () => key('ArrowRight');
    sd.appendChild(prev);
    const seedIn = $('seed'); const seedGroup = seedIn && seedIn.closest('.group');
    if (seedIn) { seedIn.title = 'Teclea una seed para volver a ella'; sd.appendChild(seedIn); }
    sd.appendChild(next);
    const rnd = $('rnd');
    if (rnd) { rnd.innerHTML = '↻ Nueva<kbd>espacio</kbd>'; rnd.title = 'Una seed al azar (espacio)';
      rnd.addEventListener('mousedown', e => e.preventDefault()); sd.appendChild(rnd); }
    bar.appendChild(sd);
    hideIfEmpty(seedGroup);

    // 3. Apartar: la acción principal de mirar, a la derecha de la barra.
    const add = $('hb-add');
    if (add) { add.classList.add('lab-push'); add.innerHTML = '+ Al lote<kbd>a</kbd>';
      add.addEventListener('mousedown', e => e.preventDefault()); bar.appendChild(add); }

    // La sección de la columna que era "mirar y elegir" se queda en el lote.
    const bp = $('batchPanel'), sec = bp && bp.closest('.sec');
    if (sec) {
      const h = sec.querySelector('h2'); if (h) h.textContent = h.textContent.replace(/Mirar y elegir/i, 'Lote');
      sec.querySelectorAll('.group').forEach(g => {
        if (g.contains(bp)) { const l = g.querySelector('.lbl'); if (l && /^lote$/i.test(l.textContent.trim())) l.style.display = 'none'; return; }
        if (!g.querySelector('input, select, a, canvas') && ![...g.querySelectorAll('button')].some(b => b.style.display !== 'none')) g.style.display = 'none';
      });
    }

    // Los rasgos describen la pieza que se mira: van debajo de ella.
    const tr = $('traits'), trGroup = tr && tr.closest('.group');
    let rasgos = null;
    if (tr) {
      rasgos = document.createElement('div'); rasgos.className = 'lab-rasgos';
      rasgos.appendChild(tr);
      const st = $('status'); stage.insertBefore(rasgos, st && st.parentNode === stage ? st : null);
      if (trGroup) trGroup.style.display = 'none';
    }
    // En el grid se aparta pieza a pieza desde su pie; en el lote no hay nada
    // que apartar. El botón de la barra añadiría una seed que no se ve.
    function syncRasgos() {
      if (rasgos) rasgos.style.display = current === 'single' ? '' : 'none';
      if (add) add.style.visibility = current === 'single' ? '' : 'hidden';
    }

    mark($('sheetGrid').style.display === 'none' || !$('sheetGrid').style.display ? 'single' : 'sheet');
    mountAutoChips(panel);
  }

  // ── "Auto" en cada mando del afinado ──────────────────────────────────────
  // Cada mando arranca en lo que hace la obra sola: en unos eso es un sorteo
  // por seed (0 o −1 = que decida la tirada), en otros es la constante de
  // producción (el umbral 0,60 de KRRTK). Las dos cosas son "auto": lo que hace
  // la obra si nadie la toca. El chip dice si el mando está ahí y lo devuelve.
  // Para la receta no cambia nada: el harness sigue mandando el valor, así que
  // una constante de producción va escrita, no heredada del código.
  // Plegado, el afinado escondía si había algo fijado; ahora lo dice el título.
  function mountAutoChips(panel) {
    const det = panel.querySelector('details.afinado'); if (!det) return;
    // Un select sin ninguna opción marcada `selected` arranca en la primera.
    const defIdx = c => Math.max(0, [...c.options].findIndex(o => o.defaultSelected));
    const isDefault = c => c.tagName === 'SELECT'
      ? c.selectedIndex === defIdx(c)
      : String(c.value) === String(c.defaultValue) || (parseFloat(c.value) === Math.min(Math.max(parseFloat(c.defaultValue), parseFloat(c.min)), parseFloat(c.max)));
    const reset = c => {
      if (c.tagName === 'SELECT') c.selectedIndex = defIdx(c);
      else c.value = c.defaultValue;
      c.dispatchEvent(new Event('input', { bubbles: true }));
      c.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const chips = [];
    det.querySelectorAll('.group').forEach(g => {
      const ctl = g.querySelectorAll('input[type=range], select');
      const lbl = g.querySelector(':scope > .lbl');
      if (ctl.length !== 1 || !lbl) return;   // los pesos de PLLS son varios mandos: se quedan como están
      const c = ctl[0];
      const row = document.createElement('div'); row.className = 'lab-lbl-row';
      lbl.parentNode.insertBefore(row, lbl); row.appendChild(lbl);
      const chip = stageButton('auto', 'Devolver a lo que hace la obra sola');
      chip.className = 'lab-auto';
      chip.onclick = () => { if (!isDefault(c)) reset(c); };
      row.appendChild(chip);
      const sync = () => { chip.classList.toggle('on', isDefault(c)); chip.title = isDefault(c) ? 'En auto: lo que hace la obra sola' : 'Fijado · pulsa para volver a auto'; syncSummary(); };
      c.addEventListener('input', sync); c.addEventListener('change', sync);
      chips.push({ c, sync });
    });
    if (!chips.length) return;
    const summary = det.querySelector('summary');
    const base = summary ? summary.textContent.trim() : 'Afinado';
    const all = stageButton('Todo a auto', 'Devuelve todos los mandos del afinado a lo que hace la obra sola');
    all.className = 'ghost lab-reset';
    all.onclick = () => chips.forEach(({ c }) => { if (!isDefault(c)) reset(c); });
    det.appendChild(all);
    function syncSummary() {
      if (!summary) return;
      const n = chips.filter(({ c }) => !isDefault(c)).length;
      summary.innerHTML = base + (n ? ` · <span class="lab-fixed">${n} fijado${n > 1 ? 's' : ''}</span>` : ' · todo auto');
      all.disabled = !n;
    }
    chips.forEach(({ sync }) => sync());
  }

  if (typeof document !== 'undefined') {
    const run = () => { injectBack(); injectCopy(); mountStage(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  global.HOKSLAB = { GRADUATED, mountWorkPicker, mountPalettePicker, mountFormatSelect, loadWorks,
                     initialSeed, loadAlgos, wallUrl, readRecipe, mountViewLinks,
                     formatControls, launch, injectBack, injectCopy, mountStage };
})(typeof window !== 'undefined' ? window : globalThis);
