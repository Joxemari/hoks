/* hoks · selector de paleta — componente único para toda la web y el laboratorio.
 *
 * Un <select> nativo no puede pintar color, y por eso cada página se había hecho
 * su propio desplegable: ocho copias, tres variantes, ninguna navegable con
 * teclado. Esto es esa pieza, una sola vez.
 *
 * La opción MUESTRA la paleta entera —una franja con todos los colores, no seis
 * puntos— porque elegir paleta es elegir color, no nombre: la decisión tiene que
 * poder tomarse sin abrir otra pestaña.
 *
 *   <script src="palette-picker.js"></script>   →   window.HOKSPAL
 *
 *   const picker = HOKSPAL.mount(hostEl, {
 *     palettes,                    // [{ name, colors, active?, prob? }]
 *     index: 0,                    // seleccionada
 *     onChange(idx, pal) {},       // al elegir
 *   });
 *   picker.setPalettes(list, idx); // repoblar (p. ej. al llegar data/palettes.json)
 *   picker.setIndex(i);            // mover la selección sin disparar onChange
 *
 * Teclado (patrón combobox de la práctica común): Enter/Espacio/↓ abre,
 * ↑↓ recorre, Home/End salta a los extremos, teclear busca por nombre,
 * Enter elige, Esc cierra y devuelve el foco al disparador.
 */
(function (global) {
  'use strict';

  const CSS = `
.hokspal { position: relative; width: 100%; font-family: var(--f, 'Courier New', Courier, monospace); }
.hokspal-trigger { display: flex; align-items: center; gap: 7px; width: 100%; padding: 6px 9px;
  background: var(--surface, #f7f7f7); border: 1px solid var(--border, #e8e8e8); border-radius: var(--r, 2px);
  cursor: pointer; font-family: inherit; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink, #111); text-align: left; transition: border-color 0.15s; }
.hokspal-trigger:hover { border-color: var(--border-dark, #d0d0d0); }
.hokspal-trigger:focus-visible { outline: 2px solid var(--ink, #111); outline-offset: 1px; }
.hokspal-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hokspal-caret { color: var(--ink3, #bbb); font-size: 9px; flex-shrink: 0; }
.hokspal-strip { display: flex; flex-shrink: 0; width: 46px; height: 12px; border-radius: 2px;
  overflow: hidden; border: 0.5px solid rgba(0,0,0,0.12); }
.hokspal-strip i { flex: 1 1 0; min-width: 0; }
.hokspal-list { display: none; position: absolute; top: calc(100% + 3px); left: 0; right: 0; z-index: 60;
  margin: 0; padding: 0; list-style: none; background: var(--bg, #fff);
  border: 1px solid var(--border-dark, #d0d0d0); border-radius: var(--r, 2px);
  max-height: 264px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.hokspal-list.open { display: block; }
.hokspal-list:focus { outline: none; }
.hokspal-opt { display: flex; align-items: center; gap: 7px; padding: 6px 9px; cursor: pointer;
  font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink, #111); }
.hokspal-opt:hover, .hokspal-opt.active { background: var(--surface, #f7f7f7); }
.hokspal-opt.active { box-shadow: inset 2px 0 0 var(--ink, #111); }
.hokspal-opt[aria-selected="true"] .hokspal-opt-name { font-weight: 700; }
.hokspal-opt-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hokspal-opt-tag { font-size: 8px; letter-spacing: 0.1em; color: var(--ink3, #bbb); flex-shrink: 0; }
.hokspal-opt.inactive .hokspal-opt-name { color: var(--ink3, #bbb); }
`;

  let cssDone = false;
  function injectCss() {
    if (cssDone) return;
    cssDone = true;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // Etiqueta de inactiva: usa el diccionario del sitio si nav.js está cargado.
  function inactiveLabel() {
    try { return global.HOKSI18N ? global.HOKSI18N.t('palettes.inactive') : 'Inactive'; }
    catch (e) { return 'Inactive'; }
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function strip(colors) { return (colors || []).map(c => `<i style="background:${esc(c)}"></i>`).join(''); }

  // La entrada "aleatoria" (item.auto) no tiene colores propios: se muestrea el
  // primer color de las demás paletas, que es justo lo que significa — cualquiera.
  function sampleColors(pals) {
    return pals.filter(p => !p.auto && p.colors && p.colors.length).slice(0, 8).map(p => p.colors[0]);
  }
  function stripFor(p, pals) { return strip(p.auto && !(p.colors || []).length ? sampleColors(pals) : p.colors); }

  let uid = 0;

  function mount(host, opts) {
    injectCss();
    opts = opts || {};
    const id = 'hokspal-' + (++uid);
    let pals = opts.palettes || [];
    let idx = opts.index || 0;
    let active = idx;
    let open = false;
    let typed = '', typedAt = 0;

    host.classList.add('hokspal');
    host.innerHTML =
      `<button type="button" class="hokspal-trigger" aria-haspopup="listbox" aria-expanded="false"` +
      ` aria-controls="${id}"${opts.label ? ` aria-label="${esc(opts.label)}"` : ''}>` +
      `<span class="hokspal-strip"></span><span class="hokspal-name">—</span>` +
      `<span class="hokspal-caret" aria-hidden="true">▾</span></button>` +
      `<ul class="hokspal-list" id="${id}" role="listbox" tabindex="-1"></ul>`;

    const trigger = host.querySelector('.hokspal-trigger');
    const list = host.querySelector('.hokspal-list');

    function renderTrigger() {
      const p = pals[idx];
      host.querySelector('.hokspal-strip').innerHTML = p ? stripFor(p, pals) : '';
      host.querySelector('.hokspal-name').textContent = p ? p.name : '—';
    }
    function renderList() {
      list.innerHTML = pals.map((p, i) =>
        `<li class="hokspal-opt${i === active ? ' active' : ''}${p.active === false ? ' inactive' : ''}"` +
        ` id="${id}-o${i}" role="option" aria-selected="${i === idx}" data-i="${i}">` +
        `<span class="hokspal-strip">${stripFor(p, pals)}</span>` +
        `<span class="hokspal-opt-name">${esc(p.name)}</span>` +
        (p.active === false ? `<span class="hokspal-opt-tag">${esc(inactiveLabel())}</span>` : '') +
        `</li>`).join('');
      list.setAttribute('aria-activedescendant', pals.length ? `${id}-o${active}` : '');
    }
    function setActive(i) {
      if (!pals.length) return;
      active = Math.max(0, Math.min(pals.length - 1, i));
      renderList();
      const el = list.children[active];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
    function setOpen(v) {
      open = v;
      list.classList.toggle('open', v);
      trigger.setAttribute('aria-expanded', String(v));
      if (v) { setActive(idx); list.focus(); } else { typed = ''; }
    }
    function choose(i) {
      idx = i; active = i;
      renderTrigger(); renderList();
      setOpen(false); trigger.focus();
      if (opts.onChange) opts.onChange(idx, pals[idx]);
    }
    // Búsqueda por tecleo: salta a la primera paleta cuyo nombre empiece por lo escrito.
    function typeahead(ch) {
      const now = Date.now();
      typed = (now - typedAt > 700 ? '' : typed) + ch.toLowerCase();
      typedAt = now;
      const hit = pals.findIndex(p => String(p.name).toLowerCase().startsWith(typed));
      if (hit >= 0) setActive(hit);
    }

    trigger.addEventListener('click', () => setOpen(!open));
    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); setOpen(true);
      }
    });
    list.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
        case 'ArrowUp':   e.preventDefault(); setActive(active - 1); break;
        case 'Home':      e.preventDefault(); setActive(0); break;
        case 'End':       e.preventDefault(); setActive(pals.length - 1); break;
        case 'Enter':
        case ' ':         e.preventDefault(); choose(active); break;
        case 'Escape':    e.preventDefault(); setOpen(false); trigger.focus(); break;
        case 'Tab':       setOpen(false); break;
        default:
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); typeahead(e.key); }
      }
    });
    list.addEventListener('click', e => {
      const li = e.target.closest('.hokspal-opt');
      if (li) choose(parseInt(li.dataset.i, 10));
    });
    list.addEventListener('mousemove', e => {
      const li = e.target.closest('.hokspal-opt');
      if (li && +li.dataset.i !== active) { active = +li.dataset.i; renderList(); }
    });
    document.addEventListener('click', e => { if (open && !host.contains(e.target)) setOpen(false); });

    renderTrigger(); renderList();

    return {
      get index() { return idx; },
      get palette() { return pals[idx]; },
      setPalettes(list2, i) { pals = list2 || []; idx = Math.max(0, Math.min(pals.length - 1, i == null ? idx : i)); active = idx; renderTrigger(); renderList(); },
      setIndex(i) { idx = Math.max(0, Math.min(pals.length - 1, i)); active = idx; renderTrigger(); renderList(); },
      open() { setOpen(true); },
      close() { setOpen(false); },
    };
  }

  global.HOKSPAL = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
