(function() {
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><circle cx='50' cy='50' r='40' fill='%23111'/></svg>">`;

// ─────────────────────────────────────────────────────────────────────────────
// i18n — trilingüe EU / ES / EN. Se aloja aquí porque nav.js se carga (bloqueando
// el parseo) en todas las páginas antes que sus scripts inline, así que
// window.HOKSI18N ya está disponible cuando esos scripts dibujan.
// Idioma por defecto: EN. Persistencia: localStorage 'hoks-lang'.
// ─────────────────────────────────────────────────────────────────────────────
const LANGS = ['eu', 'es', 'en'];
const DEFAULT_LANG = 'eu';
// La parte pública va SOLO en euskara por ahora. El motor y los diccionarios
// ES/EN se conservan; para reactivar el conmutador público, pon esto a true.
const SHOW_LANG_SWITCHER = false;

const DICT = {
  en: {
    'nav.work': 'Work', 'nav.about': 'About', 'nav.palettes': 'Palettes',
    'footer.contact': 'Contact',
    'index.hint': 'drag to explore',
    'btn.generate': 'Generate', 'btn.copycard': 'Copy Card', 'btn.save': 'Save',
    'btn.savebatch': 'Save to Batch', 'btn.download': 'Download PNG',
    'label.palette': 'Palette', 'label.grain': 'Grain', 'label.seed': 'Seed',
    'label.traits': 'Traits', 'label.saved': 'Saved', 'label.overall': 'Overall',
    'label.format': 'Format', 'label.print': 'Print',
    'format.square': 'Square', 'format.vertical': 'Vertical', 'format.horizontal': 'Horizontal',
    'toast.rendering': 'Rendering print file…',
    'toast.tooLarge': 'Too large for this browser — choose a smaller sheet',
    'hint.canvas': 'Click canvas to generate new variation',
    'lock.random': 'RANDOM', 'lock.specific': 'SPECIFIC',
    'rarity.explain': 'Each iteration is unique. Rarity is probabilistic — it quantifies the statistical likelihood of a given combination of traits.',
    'rarity.explainLong': 'Each iteration is unique. Rarity classification is probabilistic — it quantifies the statistical likelihood of a given combination of traits converging within a single generative work.',
    'rarity.common': 'Common', 'rarity.uncommon': 'Uncommon', 'rarity.rare': 'Rare',
    'rarity.superrare': 'Super Rare', 'rarity.legendary': 'Legendary',
    'toast.saving': 'Saving…', 'toast.savedGallery': 'Saved to gallery',
    'toast.cardCopied': 'Card copied to clipboard', 'toast.copyFailed': 'Copy failed',
    'toast.downloaded': 'Downloaded', 'toast.pngDownloaded': 'PNG downloaded',
    'toast.pngPrintReady': 'PNG downloaded — print-ready', 'toast.error': 'Error',
    'toast.noBatch': 'No active %s batch — create one in Admin',
    'toast.addedBatch': 'Added to batch "%1" (%2 total)', 'trait.savedMsg': 'Saved iteration — generate a new one to see traits.',
    'trait.Archetype': 'Archetype', 'trait.Count': 'Count', 'trait.Coverage': 'Coverage',
    'trait.Depth': 'Depth', 'trait.Finish': 'Finish', 'trait.Grid': 'Grid',
    'trait.Palette': 'Palette', 'trait.Texture': 'Texture', 'trait.Density': 'Density',
    'trait.Bg': 'Bg', 'trait.Pills': 'Pills', 'trait.Blend': 'Blend', 'trait.Curves': 'Curves',
    'val.Sparse': 'Sparse', 'val.Balanced': 'Balanced', 'val.Dense': 'Dense',
    'val.Full': 'Full', 'val.Scattered': 'Scattered', 'val.Empty': 'Empty',
    'val.Solo': 'Solo', 'val.Small': 'Small', 'val.Medium': 'Medium', 'val.Large': 'Large',
    'val.Monumental': 'Monumental', 'val.Colored': 'Colored', 'val.Off-white': 'Off-white',
    'val.Monochrome': 'Monochrome', 'val.Gradient': 'Gradient', 'val.Grain': 'Grain',
    'val.Solid': 'Solid', 'val.Multiply': 'Multiply', 'val.Translucent': 'Translucent',
    'val.Outline': 'Outline', 'val.Mesh': 'Mesh', 'val.levels': 'levels',
    'sort.rarity': 'By Rarity', 'sort.newest': 'Newest', 'sort.oldest': 'Oldest',
    'palettes.search': 'Search by name or tag…', 'palettes.colors': 'Colors',
    'palettes.inactive': 'Inactive', 'palettes.noResults': 'No results',
    'palettes.tryDifferent': 'Try a different term',
    'palettes.loadError': 'Could not load palettes', 'palettes.chance': 'chance',
    'sort.name': 'Name', 'palettes.count': '%1 palettes · %2 active',
    'palettes.copied': 'Copied: ', 'palettes.copyAll': 'Copy all',
    'sort.usage': 'By Usage', 'usage.title': 'Usage',
    'usage.sub': '%1 saved works · %2 palettes used',
    'usage.none': 'No saved works yet',
    'usage.less': 'less', 'usage.more': 'more',
    'usage.tip': '%1 · %2 works', 'usage.tip1': '%1 · 1 work',
    'usage.unused': '%1 · unused', 'usage.card': '%1 works', 'usage.card1': '1 work',
    'about.fallback': 'hoks is the work of Joxemari Gallastegi, a generative artist based in Donostia. He studied at Stanford University, where he presented his first solo exhibition.\n\nThe work begins where a rule is written. Each series is a small system — a grammar of modules, geometry and controlled chance — and every piece is one sentence that grammar can utter: a seed, a deterministic sequence, an image. Same seed, same image. Nothing is retouched.\n\nThere is a virtue in modularity: a module explains nothing on its own. It asks for repetition, for contact, for a shared edge. The unit is kept deliberately poor so that the field can be rich — meaning does not live in the pieces but between them.\n\nWhat reaches the screen is not the subject of the work but its residue: the visible trace of a system thinking. The series matter more than the pieces; the rules matter more than the series.',
  },
  es: {
    'nav.work': 'Obra', 'nav.about': 'Autor', 'nav.palettes': 'Paletas',
    'footer.contact': 'Contacto',
    'index.hint': 'arrastra para explorar',
    'btn.generate': 'Generar', 'btn.copycard': 'Copiar tarjeta', 'btn.save': 'Guardar',
    'btn.savebatch': 'Guardar en lote', 'btn.download': 'Descargar PNG',
    'label.palette': 'Paleta', 'label.grain': 'Grano', 'label.seed': 'Semilla',
    'label.traits': 'Rasgos', 'label.saved': 'Guardados', 'label.overall': 'Global',
    'label.format': 'Formato', 'label.print': 'Impresión',
    'format.square': 'Cuadrado', 'format.vertical': 'Vertical', 'format.horizontal': 'Horizontal',
    'toast.rendering': 'Renderizando el archivo de impresión…',
    'toast.tooLarge': 'Demasiado grande para este navegador — elige un pliego menor',
    'hint.canvas': 'Haz clic en el lienzo para generar una nueva variación',
    'lock.random': 'ALEATORIO', 'lock.specific': 'ESPECÍFICO',
    'rarity.explain': 'Cada iteración es única. La rareza es probabilística: cuantifica la probabilidad estadística de una combinación dada de rasgos.',
    'rarity.explainLong': 'Cada iteración es única. La clasificación de rareza es probabilística: cuantifica la probabilidad estadística de que una combinación dada de rasgos converja en una sola obra generativa.',
    'rarity.common': 'Común', 'rarity.uncommon': 'Poco común', 'rarity.rare': 'Raro',
    'rarity.superrare': 'Superraro', 'rarity.legendary': 'Legendario',
    'toast.saving': 'Guardando…', 'toast.savedGallery': 'Guardado en la galería',
    'toast.cardCopied': 'Tarjeta copiada al portapapeles', 'toast.copyFailed': 'Error al copiar',
    'toast.downloaded': 'Descargado', 'toast.pngDownloaded': 'PNG descargado',
    'toast.pngPrintReady': 'PNG descargado — listo para imprimir', 'toast.error': 'Error',
    'toast.noBatch': 'No hay lote activo de %s — crea uno en Admin',
    'toast.addedBatch': 'Añadido al lote "%1" (%2 en total)', 'trait.savedMsg': 'Iteración guardada — genera una nueva para ver los rasgos.',
    'trait.Archetype': 'Arquetipo', 'trait.Count': 'Recuento', 'trait.Coverage': 'Cobertura',
    'trait.Depth': 'Profundidad', 'trait.Finish': 'Acabado', 'trait.Grid': 'Rejilla',
    'trait.Palette': 'Paleta', 'trait.Texture': 'Textura', 'trait.Density': 'Densidad',
    'trait.Bg': 'Fondo', 'trait.Pills': 'Cápsulas', 'trait.Blend': 'Mezcla', 'trait.Curves': 'Curvas',
    'val.Sparse': 'Disperso', 'val.Balanced': 'Equilibrado', 'val.Dense': 'Denso',
    'val.Full': 'Lleno', 'val.Scattered': 'Esparcido', 'val.Empty': 'Vacío',
    'val.Solo': 'Solo', 'val.Small': 'Pequeño', 'val.Medium': 'Medio', 'val.Large': 'Grande',
    'val.Monumental': 'Monumental', 'val.Colored': 'Con color', 'val.Off-white': 'Hueso',
    'val.Monochrome': 'Monocromo', 'val.Gradient': 'Degradado', 'val.Grain': 'Grano',
    'val.Solid': 'Sólido', 'val.Multiply': 'Multiplicar', 'val.Translucent': 'Translúcido',
    'val.Outline': 'Contorno', 'val.Mesh': 'Malla', 'val.levels': 'niveles',
    'sort.rarity': 'Por rareza', 'sort.newest': 'Más recientes', 'sort.oldest': 'Más antiguas',
    'palettes.search': 'Buscar por nombre o etiqueta…', 'palettes.colors': 'Colores',
    'palettes.inactive': 'Inactiva', 'palettes.noResults': 'Sin resultados',
    'palettes.tryDifferent': 'Prueba otro término',
    'palettes.loadError': 'No se pudieron cargar las paletas', 'palettes.chance': 'prob.',
    'sort.name': 'Nombre', 'palettes.count': '%1 paletas · %2 activas',
    'palettes.copied': 'Copiado: ', 'palettes.copyAll': 'Copiar todo',
    'sort.usage': 'Por uso', 'usage.title': 'Uso',
    'usage.sub': '%1 obras guardadas · %2 paletas usadas',
    'usage.none': 'Aún no hay obras guardadas',
    'usage.less': 'menos', 'usage.more': 'más',
    'usage.tip': '%1 · %2 obras', 'usage.tip1': '%1 · 1 obra',
    'usage.unused': '%1 · sin usar', 'usage.card': '%1 obras', 'usage.card1': '1 obra',
    'about.fallback': 'hoks es el trabajo de Joxemari Gallastegi, artista generativo afincado en Donostia. Estudió en la Universidad de Stanford, donde presentó su primera exposición individual.\n\nLa obra empieza donde se escribe una regla. Cada serie es un pequeño sistema —una gramática de módulos, geometría y azar controlado— y cada pieza es una frase que esa gramática puede pronunciar: una semilla, una secuencia determinista, una imagen. Misma semilla, misma imagen. Nada se retoca.\n\nHay una virtud en lo modular: un módulo no explica nada por sí solo. Pide repetición, contacto, un borde compartido. La unidad se mantiene deliberadamente pobre para que el campo pueda ser rico: el sentido no habita en las piezas, sino entre ellas.\n\nLo que llega a la pantalla no es el asunto de la obra sino su residuo: el rastro visible de un sistema pensando. Importan más las series que las piezas; importan más las reglas que las series.',
  },
  eu: {
    'nav.work': 'Lana', 'nav.about': 'Egilea', 'nav.palettes': 'Paletak',
    'footer.contact': 'Kontaktua',
    'index.hint': 'arrastatu esploratzeko',
    'btn.generate': 'Sortu', 'btn.copycard': 'Kopiatu txartela', 'btn.save': 'Gorde',
    'btn.savebatch': 'Gorde sortan', 'btn.download': 'Deskargatu PNG',
    'label.palette': 'Paleta', 'label.grain': 'Pikorra', 'label.seed': 'Hazia',
    'label.traits': 'Ezaugarriak', 'label.saved': 'Gordeak', 'label.overall': 'Orokorra',
    'label.format': 'Formatua', 'label.print': 'Inprimaketa',
    'format.square': 'Karratua', 'format.vertical': 'Bertikala', 'format.horizontal': 'Horizontala',
    'toast.rendering': 'Inprimatzeko fitxategia sortzen…',
    'toast.tooLarge': 'Handiegia nabigatzaile honentzat — aukeratu orri txikiagoa',
    'hint.canvas': 'Egin klik oihalean aldaera berri bat sortzeko',
    'lock.random': 'AUSAZKOA', 'lock.specific': 'ZEHATZA',
    'rarity.explain': 'Iterazio bakoitza bakarra da. Bakantasuna probabilistikoa da: ezaugarri-konbinazio jakin baten probabilitate estatistikoa neurtzen du.',
    'rarity.explainLong': 'Iterazio bakoitza bakarra da. Bakantasunaren sailkapena probabilistikoa da: ezaugarri-konbinazio jakin batek obra sortzaile bakar batean bat egiteko duen probabilitate estatistikoa neurtzen du.',
    'rarity.common': 'Arrunta', 'rarity.uncommon': 'Ez-ohikoa', 'rarity.rare': 'Bakana',
    'rarity.superrare': 'Oso bakana', 'rarity.legendary': 'Legendazkoa',
    'toast.saving': 'Gordetzen…', 'toast.savedGallery': 'Galerian gordeta',
    'toast.cardCopied': 'Txartela arbelean kopiatuta', 'toast.copyFailed': 'Kopiak huts egin du',
    'toast.downloaded': 'Deskargatuta', 'toast.pngDownloaded': 'PNG deskargatuta',
    'toast.pngPrintReady': 'PNG deskargatuta — inprimatzeko prest', 'toast.error': 'Errorea',
    'toast.noBatch': 'Ez dago %s sorta aktiborik — sortu bat Adminen',
    'toast.addedBatch': 'Sortari gehituta "%1" (%2 guztira)', 'trait.savedMsg': 'Gordetako iterazioa — sortu berri bat ezaugarriak ikusteko.',
    'trait.Archetype': 'Arketipoa', 'trait.Count': 'Kopurua', 'trait.Coverage': 'Estaldura',
    'trait.Depth': 'Sakonera', 'trait.Finish': 'Akabera', 'trait.Grid': 'Sareta',
    'trait.Palette': 'Paleta', 'trait.Texture': 'Ehundura', 'trait.Density': 'Dentsitatea',
    'trait.Bg': 'Hondoa', 'trait.Pills': 'Kapsulak', 'trait.Blend': 'Nahasketa', 'trait.Curves': 'Kurbak',
    'val.Sparse': 'Sakabanatua', 'val.Balanced': 'Orekatua', 'val.Dense': 'Trinkoa',
    'val.Full': 'Betea', 'val.Scattered': 'Barreiatua', 'val.Empty': 'Hutsik',
    'val.Solo': 'Bakarra', 'val.Small': 'Txikia', 'val.Medium': 'Ertaina', 'val.Large': 'Handia',
    'val.Monumental': 'Monumentala', 'val.Colored': 'Koloreztatua', 'val.Off-white': 'Zurixka',
    'val.Monochrome': 'Monokromoa', 'val.Gradient': 'Gradientea', 'val.Grain': 'Pikorra',
    'val.Solid': 'Solidoa', 'val.Multiply': 'Biderkatu', 'val.Translucent': 'Zeharrargitsua',
    'val.Outline': 'Ingerada', 'val.Mesh': 'Sarea', 'val.levels': 'maila',
    'sort.rarity': 'Bakantasunez', 'sort.newest': 'Berrienak', 'sort.oldest': 'Zaharrenak',
    'palettes.search': 'Bilatu izenez edo etiketaz…', 'palettes.colors': 'Koloreak',
    'palettes.inactive': 'Ez-aktiboa', 'palettes.noResults': 'Emaitzarik ez',
    'palettes.tryDifferent': 'Saiatu beste termino batekin',
    'palettes.loadError': 'Ezin izan dira paletak kargatu', 'palettes.chance': 'aukera',
    'sort.name': 'Izena', 'palettes.count': '%1 paleta · %2 aktibo',
    'palettes.copied': 'Kopiatuta: ', 'palettes.copyAll': 'Kopiatu dena',
    'sort.usage': 'Erabileraz', 'usage.title': 'Erabilera',
    'usage.sub': '%1 obra gordeta · %2 paleta erabilita',
    'usage.none': 'Oraindik ez dago obra gordeta',
    'usage.less': 'gutxiago', 'usage.more': 'gehiago',
    'usage.tip': '%1 · %2 obra', 'usage.tip1': '%1 · obra 1',
    'usage.unused': '%1 · erabili gabe', 'usage.card': '%1 obra', 'usage.card1': 'obra 1',
    'about.fallback': 'hoks Joxemari Gallastegiren lana da, Donostian bizi den artista sortzailea. Stanfordeko Unibertsitatean ikasi zuen, eta han aurkeztu zuen bere lehen bakarkako erakusketa.\n\nLana araua idazten den lekuan hasten da. Serie bakoitza sistema txiki bat da —moduluen gramatika bat, geometria eta zori kontrolatua— eta pieza bakoitza gramatika horrek esan dezakeen esaldi bat da: hazi bat, sekuentzia deterministiko bat, irudi bat. Hazi bera, irudi bera. Ez da ezer ukitzen.\n\nBertute bat dago modulartasunean: modulu batek ez du ezer azaltzen bakarrik. Errepikapena eskatzen du, kontaktua, ertz partekatu bat. Unitatea nahita mantentzen da pobre, eremua aberatsa izan dadin: esanahia ez da piezetan bizi, haien artean baizik.\n\nPantailara iristen dena ez da lanaren gaia, haren hondarra baizik: sistema bat pentsatzen ari denaren aztarna ikusgaia. Serieek piezek baino gehiago axola dute; arauek serieek baino gehiago.',
  },
};

function readLang() {
  let l;
  try { l = localStorage.getItem('hoks-lang'); } catch (e) {}
  return LANGS.includes(l) ? l : DEFAULT_LANG;
}
// Con el conmutador oculto se ignora cualquier valor guardado y se fija el
// idioma por defecto (euskara), para que la web pública sea siempre euskara.
let LANG = SHOW_LANG_SWITCHER ? readLang() : DEFAULT_LANG;

function t(key) {
  const d = DICT[LANG] || DICT[DEFAULT_LANG];
  if (d && key in d) return d[key];
  const e = DICT[DEFAULT_LANG];
  return (e && key in e) ? e[key] : key;
}
// Fuerza inglés — para controles de operativa interna (admin) embebidos en
// páginas públicas, que deben quedarse en inglés aunque la web sea euskara.
function en(key) { const e = DICT.en; return (e && key in e) ? e[key] : key; }
// trait key → translated label (fallback: original key)
function tk(k) { return t('trait.' + k) === ('trait.' + k) ? k : t('trait.' + k); }
// trait value → translate categorical tokens, pass everything else (numbers,
// palette names, %, ×) through unchanged. Palette values are proper names → skip.
function tv(key, val) {
  if (key === 'Palette' || val == null) return val;
  return String(val).split(/(\s*[·+,×]\s*|\s+)/).map(tok => {
    const k = 'val.' + tok;
    const d = DICT[LANG] || {};
    if (k in d) return d[k];
    if (k in DICT[DEFAULT_LANG]) return DICT[DEFAULT_LANG][k];
    return tok;
  }).join('');
}

function apply(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
}

function setLang(l) {
  if (!LANGS.includes(l) || l === LANG) return;
  LANG = l;
  try { localStorage.setItem('hoks-lang', l); } catch (e) {}
  document.documentElement.setAttribute('lang', l);
  syncSwitcher();
  apply(document);
  window.dispatchEvent(new CustomEvent('hoks:langchange', { detail: { lang: l } }));
}

window.HOKSI18N = { get lang() { return LANG; }, langs: LANGS, t, en, tk, tv, apply, setLang };
document.documentElement.setAttribute('lang', LANG);

const NAV_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'Courier New', Courier, monospace; }
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 52px;
  background: #fff; border-bottom: 1px solid #e8e8e8;
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #111; }
.nav-logo-dot { width: 14px; height: 14px; border-radius: 50%; background: #111; flex-shrink: 0; }
.nav-logo-name { font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 400; letter-spacing: 0.08em; color: #111; }
.nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; margin: 0; padding: 0; }
@media (max-width: 600px) {
  .nav-links { gap: 1.2rem; }
  .nav-links a, .nav-work-label { font-size: 10px; letter-spacing: 0.06em; }
  nav { padding: 0 1rem; }
  .nav-lang { gap: 0.5rem; padding-left: 0.6rem; }
}
.nav-links a, .nav-work-label {
  font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 400;
  letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
  color: #bbb; transition: color 0.15s; cursor: pointer; user-select: none;
}
.nav-links a:hover, .nav-links a.active { color: #111; }
.nav-work-label:hover { color: #111; }
.nav-work.active > .nav-work-label { color: #111; }
.nav-work { position: relative; }
.nav-work-dropdown {
  position: absolute; top: calc(100% + 12px); right: -16px;
  background: #fff; border-top: 2px solid #111;
  border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8;
  padding: 8px 0; list-style: none; min-width: 140px;
  opacity: 0; visibility: hidden; pointer-events: none;
  transform: translateY(-6px); transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
}
.nav-work-dropdown.open { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
.nav-work-dropdown::before {
  content: ''; position: absolute; top: -7px; right: 22px;
  width: 6px; height: 6px; background: #111;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
.nav-work-dropdown li a {
  display: block; padding: 7px 20px;
  font-family: 'Courier New', Courier, monospace; font-size: 11px;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #bbb; white-space: nowrap; text-decoration: none; transition: color 0.15s;
}
.nav-work-dropdown li a:hover, .nav-work-dropdown li a.active { color: #111; }
.nav-lang { display: flex; align-items: center; gap: 0.75rem; padding-left: 1.2rem; }
.nav-lang button {
  font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 400;
  letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
  color: #bbb; background: none; border: none; padding: 0; cursor: pointer;
  transition: color 0.15s; user-select: none;
}
.nav-lang button:hover { color: #111; }
.nav-lang button.active { color: #111; }
.site-footer {
  padding: 1.2rem 2rem; border-top: 1px solid #e8e8e8;
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'Courier New', Courier, monospace; background: #fff;
}
.footer-copy { font-size: 10px; color: #ccc; letter-spacing: 0.08em; text-transform: uppercase; }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a { font-size: 10px; color: #ccc; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; }
.footer-links a:hover { color: #111; }
body { display: flex; flex-direction: column; min-height: 100vh; }
`;

const style = document.createElement('style');
style.textContent = NAV_CSS;
document.head.appendChild(style);

if (!document.querySelector('link[rel="icon"]')) {
  document.head.insertAdjacentHTML('beforeend', FAVICON);
}

const path = window.location.pathname.split('/').pop() || 'index.html';
const isWork = ['index.html','','pills.html','krrtk.html','dtk.html','bzrs.html','krrtkg.html','dtkg.html','pllsg.html'].includes(path);
const isAbout = path === 'about.html';
const isPalettes = path === 'palettes.html';

const nav = document.createElement('nav');
nav.innerHTML = `
  <div style="display:flex;align-items:center;gap:10px;">
    <a class="nav-logo" href="index.html">
      <span class="nav-logo-dot"></span>
      <span class="nav-logo-name">hoks</span>
    </a>
    <span id="nav-admin-badge" style="display:none;font-family:'Courier New',Courier,monospace;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:#c0392b;color:#fff;padding:2px 7px;border-radius:2px;cursor:pointer;" onclick="window.location.href='admin.html'">ADMIN</span>
  </div>
  <ul class="nav-links">
    <li class="nav-work${isWork?' active':''}">
      <span class="nav-work-label" id="nav-work-label" data-i18n="nav.work">Work</span>
      <ul class="nav-work-dropdown" id="nav-work-dropdown">
        <li data-slug="pills"><a href="pills.html"${path==='pills.html'?' class="active"':''}>PLLS</a></li>
        <li data-slug="krrtk"><a href="krrtk.html"${path==='krrtk.html'?' class="active"':''}>KRRTK</a></li>
        <li data-slug="dtk"><a href="dtk.html"${path==='dtk.html'?' class="active"':''}>DTK</a></li>
        <li data-slug="bzrs"><a href="bzrs.html"${path==='bzrs.html'?' class="active"':''}>BZRS</a></li>
        <li data-slug="krrtkg"><a href="krrtkg.html"${path==='krrtkg.html'?' class="active"':''}>KRRTKG</a></li>
        <li data-slug="dtkg"><a href="dtkg.html"${path==='dtkg.html'?' class="active"':''}>DTKG</a></li>
        <li data-slug="pllsg"><a href="pllsg.html"${path==='pllsg.html'?' class="active"':''}>PLLSG</a></li>
      </ul>
    </li>
    <li><a href="about.html"${isAbout?' class="active"':''} data-i18n="nav.about">About</a></li>
    <li><a href="palettes.html"${isPalettes?' class="active"':''} data-i18n="nav.palettes">Palettes</a></li>
    ${SHOW_LANG_SWITCHER ? `<li class="nav-lang" id="nav-lang">
      <button type="button" data-lang="eu">EU</button>
      <button type="button" data-lang="es">ES</button>
      <button type="button" data-lang="en">EN</button>
    </li>` : ''}
  </ul>`;
document.body.insertBefore(nav, document.body.firstChild);

const _isAdmin = sessionStorage.getItem('hoks-admin-session') === '1' ||
                 localStorage.getItem('hoks-admin-session')   === '1';
if (_isAdmin) {
  const badge = document.getElementById('nav-admin-badge');
  if (badge) badge.style.display = '';
}

// ── Language switcher ──
function syncSwitcher() {
  document.querySelectorAll('#nav-lang button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === LANG);
  });
}
document.querySelectorAll('#nav-lang button').forEach(b => {
  b.addEventListener('click', e => { e.stopPropagation(); setLang(b.getAttribute('data-lang')); });
});
syncSwitcher();
apply(nav); // traducir el nav de inmediato (evita parpadeo con idioma no-EN guardado)

const workLabel = document.getElementById('nav-work-label');
const workDropdown = document.getElementById('nav-work-dropdown');
if (workLabel && workDropdown) {
  workLabel.addEventListener('click', e => { e.stopPropagation(); workDropdown.classList.toggle('open'); });
  document.addEventListener('click', () => workDropdown.classList.remove('open'));
  workDropdown.addEventListener('click', e => e.stopPropagation());

  // El dropdown lista solo las familias activas de data/works.json.
  // Si el fetch falla, se dejan visibles todas (degradación segura).
  fetch('https://raw.githubusercontent.com/Joxemari/hoks/main/data/works.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : null)
    .then(works => {
      if (!Array.isArray(works) || !works.length) return;
      const activeSlugs = new Set(works.filter(w => w.active).map(w => w.slug));
      workDropdown.querySelectorAll('li[data-slug]').forEach(li => {
        if (!activeSlugs.has(li.dataset.slug)) li.style.display = 'none';
      });
    })
    .catch(() => {});
}

document.querySelectorAll('main, #main-content, .about-wrap, .work-section').forEach(el => el.style.flex = '1');

// Footer — Instagram aparece solo cuando esté configurado en site.json
const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <span class="footer-copy">© 2026 hoks</span>
  <div class="footer-links" id="footer-links">
    <a href="mailto:joxemgallastegi@gmail.com" data-i18n="footer.contact">Contact</a>
  </div>`;
document.body.appendChild(footer);

fetch('https://raw.githubusercontent.com/Joxemari/hoks/main/data/site.json?t=' + Date.now())
  .then(r => r.ok ? r.json() : null)
  .then(d => {
    const fl = document.getElementById('footer-links');
    if (fl && d?.footerInstagram) {
      const a = document.createElement('a');
      a.href = d.footerInstagram;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Instagram';
      fl.appendChild(a);
    }
  })
  .catch(() => {});

// Traducir el contenido estático de la página una vez parseado el DOM.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => apply(document));
} else {
  apply(document);
}
})();
