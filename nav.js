(function() {
// Favicon de marca: el monograma (la "o" cruzada) en ácido sobre azul, como el
// avatar de Notion. Servido same-origin desde la raíz.
const FAVICON = `<link rel="icon" type="image/png" href="/hoks/favicon.png">`;

// ─────────────────────────────────────────────────────────────────────────────
// i18n — trilingüe EU / ES / EN. Se aloja aquí porque nav.js se carga (bloqueando
// el parseo) en todas las páginas antes que sus scripts inline, así que
// window.HOKSI18N ya está disponible cuando esos scripts dibujan.
// Idioma por defecto: EN. Persistencia: localStorage 'hoks-lang'.
// ─────────────────────────────────────────────────────────────────────────────
const LANGS = ['eu', 'es', 'en'];
// Euskara por defecto: el statement ya está validado en las tres lenguas.
const DEFAULT_LANG = 'eu';
// La parte pública es bilingüe euskara / inglés (conmutador en el nav).
// El diccionario ES se conserva para reactivarlo en el futuro si hiciera falta.
const SHOW_LANG_SWITCHER = true;

const DICT = {
  en: {
    'nav.work': 'Work', 'nav.about': 'About', 'nav.palettes': 'Palettes',
    'footer.contact': 'Contact',
    'index.hint': 'drag to explore',
    'index.enter': 'click to enter',
    'hall.title': 'The hall', 'hall.desc': 'a pulse sweeps from a zone, then rests',
    'hall.sound': 'Sound', 'hall.thread': 'common thread', 'hall.threadval': 'code + chance',
    'btn.generate': 'Generate', 'btn.copycard': 'Copy Card', 'btn.save': 'Save',
    'btn.savebatch': 'Save to Batch', 'btn.download': 'Download PNG',
    'label.palette': 'Palette', 'label.grain': 'Grain', 'label.seed': 'Seed',
    'label.traits': 'Traits', 'label.saved': 'Saved', 'label.overall': 'Overall',
    'label.format': 'Format', 'label.print': 'Print', 'rule.said': 'The rule, said',
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
    'trait.Region': 'Region', 'trait.Ground': 'Ground', 'trait.Contrast': 'Contrast',
    'val.Cluster': 'Cluster', 'val.Ell': 'Ell', 'val.Bar': 'Bar', 'val.Field': 'Field', 'val.Twin': 'Twin',
    'val.Dark': 'Dark', 'val.Light': 'Light', 'val.High': 'High', 'val.Mid': 'Mid', 'val.Low': 'Low',
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
    'about.fallback': 'hoks is the work of Joxemari Gallastegi, a generative artist based in Donostia. He studied at Stanford University, where he presented his first solo exhibition.\n\nThe work begins where a rule is written. Each series is a small system — a grammar of modules, geometry and controlled chance — and every piece is one sentence that grammar can utter: a seed, a deterministic sequence, an image. Same seed, same image. Nothing is retouched.\n\nThere is a virtue in modularity: a module explains nothing on its own. It asks for repetition, for contact, for a shared edge. The unit is kept deliberately poor so that the field can be rich — meaning does not live in the pieces but between them.\n\nWhat reaches the screen is not the subject of the work but its residue: the visible trace of a system thinking. The series matter more than the pieces; the rules matter more than the series.',
  },
  es: {
    'nav.work': 'Obra', 'nav.about': 'Autor', 'nav.palettes': 'Paletas',
    'footer.contact': 'Contacto',
    'index.hint': 'arrastra para explorar',
    'index.enter': 'entra',
    'hall.title': 'La sala', 'hall.desc': 'un pulso recorre una zona y luego descansa',
    'hall.sound': 'Sonido', 'hall.thread': 'hilo común', 'hall.threadval': 'código + azar',
    'btn.generate': 'Generar', 'btn.copycard': 'Copiar tarjeta', 'btn.save': 'Guardar',
    'btn.savebatch': 'Guardar en lote', 'btn.download': 'Descargar PNG',
    'label.palette': 'Paleta', 'label.grain': 'Grano', 'label.seed': 'Semilla',
    'label.traits': 'Rasgos', 'label.saved': 'Guardados', 'label.overall': 'Global',
    'label.format': 'Formato', 'label.print': 'Impresión', 'rule.said': 'La regla, dicha',
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
    'trait.Region': 'Región', 'trait.Ground': 'Suelo', 'trait.Contrast': 'Contraste',
    'val.Cluster': 'Racimo', 'val.Ell': 'Ele', 'val.Bar': 'Barra', 'val.Field': 'Campo', 'val.Twin': 'Doble',
    'val.Dark': 'Oscuro', 'val.Light': 'Claro', 'val.High': 'Alto', 'val.Mid': 'Medio', 'val.Low': 'Bajo',
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
    'about.fallback': 'hoks es el trabajo de Joxemari Gallastegi, artista generativo afincado en Donostia. Estudió en la Universidad de Stanford, donde presentó su primera exposición individual.\n\nLa obra empieza donde se escribe una regla. Cada serie es un pequeño sistema —una gramática de módulos, geometría y azar controlado— y cada pieza es una frase que esa gramática puede pronunciar: una semilla, una secuencia determinista, una imagen. Misma semilla, misma imagen. Nada se retoca.\n\nHay una virtud en lo modular: un módulo no explica nada por sí solo. Pide repetición, contacto, un borde compartido. La unidad se mantiene deliberadamente pobre para que el campo pueda ser rico: el sentido no habita en las piezas, sino entre ellas.\n\nLo que llega a la pantalla no es el asunto de la obra sino su residuo: el rastro visible de un sistema pensando. Importan más las series que las piezas; importan más las reglas que las series.',
  },
  eu: {
    'nav.work': 'Lana', 'nav.about': 'Egilea', 'nav.palettes': 'Paletak',
    'footer.contact': 'Kontaktua',
    'index.hint': 'arrastatu esploratzeko',
    'index.enter': 'sartu',
    'hall.title': 'Aretoa', 'hall.desc': 'pultsu batek gune bat zeharkatzen du, gero atseden hartzen',
    'hall.sound': 'Soinua', 'hall.thread': 'hari komuna', 'hall.threadval': 'kodea + zoria',
    'btn.generate': 'Sortu', 'btn.copycard': 'Kopiatu txartela', 'btn.save': 'Gorde',
    'btn.savebatch': 'Gorde sortan', 'btn.download': 'Deskargatu PNG',
    'label.palette': 'Paleta', 'label.grain': 'Pikorra', 'label.seed': 'Hazia',
    'label.traits': 'Ezaugarriak', 'label.saved': 'Gordeak', 'label.overall': 'Orokorra',
    'label.format': 'Formatua', 'label.print': 'Inprimaketa', 'rule.said': 'Araua, esanda',
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
    'trait.Region': 'Eremua', 'trait.Ground': 'Zorua', 'trait.Contrast': 'Kontrastea',
    'val.Cluster': 'Multzoa', 'val.Ell': 'Ele', 'val.Bar': 'Barra', 'val.Field': 'Zelaia', 'val.Twin': 'Bikoitza',
    'val.Dark': 'Iluna', 'val.Light': 'Argia', 'val.High': 'Handia', 'val.Mid': 'Ertaina', 'val.Low': 'Txikia',
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

// Marca hoks (la "o" cruzada, pintada a mano). Se sirve desde el mismo origen
// —GitHub Pages, /hoks/— porque una -webkit-mask cross-origin la bloquean
// algunos navegadores. Ruta absoluta para que valga igual desde la raíz y
// desde sketches/<obra>/.
const MONO = '/hoks/monogram.png';

// El sistema de diseño vive aquí, en :root, porque nav.js se carga en todas
// las páginas: así los tokens (paper/ink/blue/acid/line/mut/body) y la
// tipografía están disponibles en cualquier <style> de página sin repetirlos.
// League Spartan (display) + Courier New (captions/operativa) sobre papel.
const NAV_CSS = `
:root{
  --paper:#fbfbfa; --ink:#0a0a0a; --blue:#000ef7; --acid:#dcff32;
  --line:#e7e5df; --mut:#8a8983; --body:#26251f; --red:#c0392b;
  --geo:"League Spartan","Century Gothic",Futura,system-ui,sans-serif;
  --mono:"Courier New",ui-monospace,Menlo,monospace;
}
*, *::before, *::after { box-sizing: border-box; }
body { display: flex; flex-direction: column; min-height: 100vh; }

/* Barra superior: marca + badge admin a la izquierda, notch/burger a la
   derecha. El burger abre el cajón azul. */
nav.hoks-top {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.6rem; height: 52px;
  background: var(--paper); border-bottom: 1px solid var(--line);
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.nav-logo .mark {
  width: 27px; height: 25px; background: var(--ink);
  -webkit-mask: url("${MONO}") center/contain no-repeat;
          mask: url("${MONO}") center/contain no-repeat;
}
.nav-logo .name {
  font-family: var(--geo); font-weight: 700; font-size: 15px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink);
}
.nav-admin-badge {
  font-family: var(--geo); font-weight: 700; font-size: 8px; letter-spacing: 0.12em;
  text-transform: uppercase; background: var(--red); color: #fff;
  padding: 3px 8px; border-radius: 3px; cursor: pointer;
}
.nav-burger {
  width: 28px; height: 20px; background: none; border: 0; padding: 0; cursor: pointer;
  display: flex; flex-direction: column; justify-content: center; gap: 5px;
}
.nav-burger span { display: block; height: 2px; background: var(--blue); transition: transform .2s, opacity .2s; }

/* Cajón azul + velo */
.nav-scrim {
  position: fixed; inset: 0; z-index: 110; background: rgba(10,10,10,0.32);
  opacity: 0; visibility: hidden; transition: opacity .22s, visibility .22s;
}
.nav-scrim.open { opacity: 1; visibility: visible; }
.nav-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 120;
  width: 300px; max-width: 82vw; background: var(--blue); color: #fff;
  padding: 32px 30px; display: flex; flex-direction: column; gap: 3px;
  transform: translateX(100%); transition: transform .26s cubic-bezier(.4,0,.2,1);
}
.nav-drawer.open { transform: translateX(0); }
.nav-drawer .d-mark {
  width: 30px; height: 28px; background: var(--acid); margin-bottom: 22px;
  -webkit-mask: url("${MONO}") center/contain no-repeat;
          mask: url("${MONO}") center/contain no-repeat;
}
.nav-drawer a {
  color: #fff; font-family: var(--geo); font-weight: 600; font-size: 16px;
  letter-spacing: 0.26em; text-transform: uppercase; text-decoration: none;
  padding: 7px 0; display: flex; align-items: center; gap: 12px;
  opacity: 0.92; transition: color .15s, opacity .15s; cursor: pointer;
}
.nav-drawer a:hover, .nav-drawer a.active { color: var(--acid); opacity: 1; }
/* Familias en curso (sin año / sin lote): salen atenuadas y marcadas "soon",
   como en el mockup. Siguen siendo enlace: su sala enseña el badge SOON. */
.nav-drawer a.soon { opacity: 0.45; }
.nav-drawer a.soon:hover { opacity: 0.7; }
.nav-drawer a small { font-family: var(--mono); font-weight: 400; font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; margin-left: 8px; opacity: 0.85; }
.nav-drawer .d-em { display: inline-block; width: 20px; font-size: 15px; line-height: 1; }
.nav-drawer .d-sep { height: 1px; background: rgba(255,255,255,0.18); margin: 15px 0; }
.nav-drawer .d-close {
  position: absolute; top: 24px; right: 26px; width: 22px; height: 22px;
  background: none; border: 0; padding: 0; cursor: pointer;
}
.nav-drawer .d-close::before, .nav-drawer .d-close::after {
  content: ''; position: absolute; top: 10px; left: 0; width: 22px; height: 2px; background: #fff;
}
.nav-drawer .d-close::before { transform: rotate(45deg); }
.nav-drawer .d-close::after { transform: rotate(-45deg); }
.nav-drawer .d-lang { display: flex; gap: 16px; margin-top: 10px; }
.nav-drawer .d-lang button {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255,255,255,0.7); background: none; border: 0; padding: 0; cursor: pointer;
  transition: color .15s;
}
.nav-drawer .d-lang button:hover, .nav-drawer .d-lang button.active { color: var(--acid); }
.nav-drawer .d-who {
  margin-top: auto; font-family: var(--mono); font-size: 11px; line-height: 1.7;
  color: rgba(255,255,255,0.72);
}
@media (max-width: 600px) { nav.hoks-top { padding: 0 1rem; } }

/* Footer */
.site-footer {
  padding: 1.2rem 1.6rem; border-top: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between; background: var(--paper);
}
.footer-copy { font-family: var(--mono); font-size: 10px; color: var(--mut); letter-spacing: 0.1em; }
.footer-links { display: flex; gap: 1.4rem; }
.footer-links a { font-family: var(--mono); font-size: 10px; color: var(--mut); text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase; transition: color .15s; }
.footer-links a:hover { color: var(--ink); }
`;

const style = document.createElement('style');
style.textContent = NAV_CSS;
document.head.appendChild(style);

// League Spartan (display) desde Google Fonts. Es la única dependencia externa
// del sitio; las captions siguen en Courier New (--mono).
if (!document.querySelector('link[data-hoks-font]')) {
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link data-hoks-font rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;600;700&display=swap">');
}

if (!document.querySelector('link[rel="icon"]')) {
  document.head.insertAdjacentHTML('beforeend', FAVICON);
}

const path = window.location.pathname.split('/').pop() || 'index.html';
// Adivinanza inicial, corregida en cuanto llega works.json: el catálogo de
// familias es un dato, no una lista escrita aquí. Sirve para que el nav no
// parpadee mientras tanto.
const isWork = ['index.html','','work.html','plls.html','krrtk.html','dtk.html','bzrs.html',
                'dtkrt.html','eclps.html','trzs.html'].includes(path);
const isAbout = path === 'about.html';
const isPalettes = path === 'palettes.html';

// Dónde vive la sección de una familia. Sin `page` no hay página propia: la
// obra cae a la página genérica, que es lo que permite que activar una familia
// en el panel baste para que tenga sección en la web. La regla vive aquí y se
// exporta porque la landing enlaza a lo mismo: dos reglas distintas darían dos
// destinos distintos para la misma obra.
function workHref(w) { return w.page || ('work.html?w=' + encodeURIComponent(w.slug)); }
window.HOKSNAV = { workHref };

const nav = document.createElement('nav');
nav.className = 'hoks-top';
nav.innerHTML = `
  <div style="display:flex;align-items:center;gap:12px;">
    <a class="nav-logo" href="index.html" aria-label="hoks">
      <span class="mark"></span>
    </a>
    <span id="nav-admin-badge" class="nav-admin-badge" style="display:none;" onclick="window.location.href='admin.html'">Admin</span>
  </div>
  <button type="button" class="nav-burger" id="nav-burger" aria-label="Menu"><span></span><span></span><span></span></button>`;
document.body.insertBefore(nav, document.body.firstChild);

// Velo + cajón azul. El menú (familias, About, Palettes, idioma) vive dentro:
// una sola superficie que reskinea todas las páginas a la vez.
const scrim = document.createElement('div');
scrim.className = 'nav-scrim';
scrim.id = 'nav-scrim';
const drawer = document.createElement('aside');
drawer.className = 'nav-drawer';
drawer.id = 'nav-drawer';
drawer.innerHTML = `
  <button type="button" class="d-close" id="nav-drawer-close" aria-label="Close"></button>
  <span class="d-mark"></span>
  <!-- Lista de arranque: la real la escribe works.json más abajo. Se queda si
       no hay red y evita el hueco mientras llega. -->
  <div id="nav-fam-list">
    <a href="plls.html"${path==='plls.html'?' class="active"':''}><span class="d-em">💊</span>PLLS</a>
    <a href="krrtk.html"${path==='krrtk.html'?' class="active"':''}><span class="d-em">🟥</span>KRRTK</a>
    <a href="dtkrt.html"${path==='dtkrt.html'?' class="active"':''}><span class="d-em">🔵</span>DTKRT</a>
    <a class="soon${path==='eclps.html'?' active':''}" href="eclps.html"><span class="d-em">🌑</span>ECLPS <small>soon</small></a>
    <a class="soon${path==='trzs.html'?' active':''}" href="trzs.html"><span class="d-em">🪢</span>TRZS <small>soon</small></a>
  </div>
  <div class="d-sep"></div>
  <a href="about.html"${isAbout?' class="active"':''} data-i18n="nav.about">About</a>
  <a href="palettes.html"${isPalettes?' class="active"':''} data-i18n="nav.palettes">Palettes</a>
  ${SHOW_LANG_SWITCHER ? `<div class="d-lang" id="nav-lang">
    <button type="button" data-lang="eu">EU</button>
    <button type="button" data-lang="en">EN</button>
  </div>` : ''}`;
document.body.appendChild(scrim);
document.body.appendChild(drawer);

const _isAdmin = sessionStorage.getItem('hoks-admin-session') === '1' ||
                 localStorage.getItem('hoks-admin-session')   === '1';
if (_isAdmin) {
  const badge = document.getElementById('nav-admin-badge');
  if (badge) badge.style.display = '';
}

// ── Abrir / cerrar el cajón ──
function openDrawer()  { drawer.classList.add('open'); scrim.classList.add('open'); }
function closeDrawer() { drawer.classList.remove('open'); scrim.classList.remove('open'); }
document.getElementById('nav-burger').addEventListener('click', e => { e.stopPropagation(); openDrawer(); });
document.getElementById('nav-drawer-close').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

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
apply(nav); apply(drawer); // traducir de inmediato (evita parpadeo con idioma no-EN guardado)

// Emoji por familia — el mismo lenguaje del canvas de diseño. La lista de
// arranque los trae escritos; al reescribir desde works.json los recuperamos
// por slug (works.json no guarda emoji).
const FAM_EM = { plls:'💊', krrtk:'🟥', dtk:'🟥', dtkrt:'🔵', eclps:'🌑', trzs:'🪢', bzrs:'〰️' };

const famList = document.getElementById('nav-fam-list');
if (famList) {
  // La lista SE ESCRIBE desde data/works.json: una entrada por familia activa,
  // en el orden del catálogo. Antes estaba escrita aquí y works.json solo podía
  // esconder entradas; activar una familia nueva en el panel no la traía al nav.
  // Ahora `active` es el único interruptor. Si el fetch falla se queda la lista
  // de arranque (degradación segura).
  fetch('https://raw.githubusercontent.com/Joxemari/hoks/main/data/works.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : null)
    .then(works => {
      if (!Array.isArray(works) || !works.length) return;
      const live = works.filter(w => w && w.active && w.slug);
      if (!live.length) return;
      const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      // La página genérica sirve a varias familias, así que para saber cuál se
      // está mirando no basta el nombre del archivo: hay que mirar el ?w=.
      const hereSlug = new URLSearchParams(location.search).get('w');
      famList.innerHTML = live.map(w => {
        const href = workHref(w);
        const mine = href.split('?')[0] === path &&
                     (href.indexOf('?w=') < 0 || hereSlug === w.slug);
        const em = FAM_EM[w.slug] || '▦';
        // Sin año = familia en curso (sin lote publicado): sale "soon", como el
        // mockup. El año se rellena al lanzar/activar, y ahí deja de ser soon.
        const soon = !w.year;
        const cls = [soon ? 'soon' : '', mine ? 'active' : ''].filter(Boolean).join(' ');
        return `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''}>` +
               `<span class="d-em">${em}</span>${esc(w.name || w.slug.toUpperCase())}` +
               `${soon ? ' <small>soon</small>' : ''}</a>`;
      }).join('');
    })
    .catch(() => {});
}

document.querySelectorAll('main, #main-content, .about-wrap, .work-section, .wk, .lab-wrap').forEach(el => el.style.flex = '1');

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
