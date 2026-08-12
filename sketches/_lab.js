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
  const GRADUATED = ['plls', 'krrtk', 'dtk', 'dtkrt', 'trzs'];
  const RAW = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/';

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

    fetch(RAW + 'works.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!Array.isArray(data)) return;
        // Solo las ACTIVAS: el laboratorio es la mesa de trabajo, no el archivo.
        // Una familia retirada no debe estorbar la lista — se sigue pudiendo
        // abrir por URL (../<slug>/) mientras tenga su algo.js.
        const works = data.filter(w => GRADUATED.includes(w.slug) && w.active !== false);
        // La obra abierta se queda en la lista aunque esté retirada: si no, el
        // selector mostraría otra cosa distinta de lo que hay en pantalla.
        if (!works.some(w => w.slug === currentSlug)) {
          const me = data.find(w => w.slug === currentSlug);
          works.unshift(me ? { ...me, name: me.name + ' · (retirada)' }
                           : { slug: currentSlug, name: currentSlug.toUpperCase() });
        }
        if (works.length) fill(works);
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
    const AUTO = { name: opts.autoLabel || 'Random (weighted)', auto: true, colors: [] };
    let palettes = opts.palettes || [];
    let sel = 'auto';   // 'auto' | índice dentro de palettes

    const picker = global.HOKSPAL.mount(host, {
      palettes: [AUTO].concat(palettes),
      index: 0,
      label: 'Palette',
      onChange: i => { sel = i === 0 ? 'auto' : i - 1; if (opts.onChange) opts.onChange(); },
    });

    return {
      // Lo que espera render(): paleta fijada, o todas y que el RNG elija.
      opts() { return sel === 'auto' ? { palettes } : { palettes, locked: true, lockedIdx: sel }; },
      get selection() { return sel; },
      setPalettes(list) {
        palettes = list || [];
        picker.setPalettes([AUTO].concat(palettes), sel === 'auto' ? 0 : sel + 1);
      },
      select(v) {
        sel = (v === 'auto' || v == null) ? 'auto' : parseInt(v, 10);
        picker.setIndex(sel === 'auto' ? 0 : sel + 1);
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

  // ── Enlace al muro ─────────────────────────────────────────────────────────
  // El muro es una VISTA, no un parámetro: no cambia ni un píxel de la obra,
  // solo dice de qué tamaño es el objeto. Por eso vive en su propia página y el
  // panel solo pone un enlace — meter aquí pliego, ancho de pared y referencias
  // sería engordar los mandos de generar con mandos de mirar.
  //
  // Lo que viaja es la RECETA, que ya es el contrato común de los cinco
  // harnesses y de _batch.js. Se serializa entera en vez de campo a campo: así
  // un parámetro nuevo en una obra llega al muro sin tocar nada.
  function wallUrl(recipe) {
    const r = {
      work:   recipe.work,
      seed:   recipe.seed >>> 0,
      format: recipe.format || 'square',
      params: recipe.params || {},
      palSel: recipe.palSel == null ? 'auto' : recipe.palSel,
    };
    return '../_wall/?r=' + encodeURIComponent(JSON.stringify(r));
  }

  // Trae su propio CSS, como _batch.js y palette-picker.js: cinco harnesses no
  // tienen por qué llevar cinco copias de la misma regla.
  const WALL_CSS = `
.wall-link { display:block; font-family:'Courier New',Courier,monospace; font-size:10px;
  font-weight:700; letter-spacing:0.1em; text-transform:uppercase; text-align:center;
  color:#bbb; text-decoration:none; border:1px dashed #e8e8e8; border-radius:2px;
  padding:8px; cursor:pointer; transition:color .15s, border-color .15s; }
.wall-link:hover, .wall-link:focus-visible { color:#111; border-color:#d0d0d0; }
`;
  let wallCssDone = false;
  function injectWallCss() {
    if (wallCssDone || typeof document === 'undefined') return;
    wallCssDone = true;
    const s = document.createElement('style'); s.textContent = WALL_CSS;
    document.head.appendChild(s);
  }

  // El href se recalcula al posarse encima o al enfocar, no en cada refresh:
  // así sigue siendo un enlace de verdad (botón central, abrir en pestaña) sin
  // que arrastrar un slider tenga que reconstruir la URL en cada píxel.
  function mountWallLink(host, getRecipe) {
    injectWallCss();
    const a = document.createElement('a');
    a.className = 'wall-link';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '▤ Ver en el muro ↗';
    a.title = 'Abre la pieza a escala sobre una pared, en otra pestaña';
    host.appendChild(a);

    function sync() {
      try { a.href = wallUrl(getRecipe()); }
      catch (e) { a.removeAttribute('href'); }
    }
    a.addEventListener('pointerenter', sync);
    a.addEventListener('focus', sync);
    sync();
    return { sync };
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

  global.HOKSLAB = { GRADUATED, mountWorkPicker, mountPalettePicker, initialSeed, loadAlgos,
                     wallUrl, mountWallLink, formatControls };
})(typeof window !== 'undefined' ? window : globalThis);
