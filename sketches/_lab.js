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
  const GRADUATED = ['pllsg', 'krrtkg', 'dtkg', 'dtkrt'];
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

  // Seed inicial: ?seed= si viene del selector de obra, si no una al azar.
  function initialSeed() {
    const q = new URLSearchParams(location.search).get('seed');
    const n = q == null ? NaN : parseInt(q, 10);
    return Number.isFinite(n) ? (n >>> 0) : (Math.random() * 0xFFFFFFFF) >>> 0;
  }

  global.HOKSLAB = { GRADUATED, mountWorkPicker, mountPalettePicker, initialSeed, loadAlgos };
})(typeof window !== 'undefined' ? window : globalThis);
