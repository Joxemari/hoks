# CLAUDE.md — hoks

Guía para sesiones futuras. Léela antes de tocar nada.

## Qué es

Web de arte generativo / algorítmico bajo el alias **hoks** (Joxemari Gallastegi,
Donostia / Stanford). Sistemas que producen imagen a partir de código y azar
controlado: cada pieza nace de una *seed* y un RNG determinista.

**HTML/JS vanilla. Sin framework, sin bundler, sin paso de build.** Lo que se
commitea es exactamente lo que se publica. Las obras **graduadas** (plls,
krrtk, dtk, dtkrt) tienen su algoritmo en `sketches/<obra>/algo.js` (fuente única,
compartida entre laboratorio y producción); las páginas de las demás series aún
llevan su JS *inline*. No hay módulos ni dependencias instaladas salvo una
webfont: **League Spartan** (Google Fonts), cargada desde `nav.js`.

**Sistema de diseño (2026).** El sitio dejó atrás el "Courier New único" por un
lenguaje de dos voces: **League Spartan** (display — títulos, nombres de familia,
botones) + **Courier New** (captions, datos, operativa). Paleta en tokens `:root`
que inyecta `nav.js` en todas las páginas: `--paper #fbfbfa`, `--ink #0a0a0a`,
`--blue #000ef7`, `--acid #dcff32`, `--line #e7e5df`, `--mut #8a8983`,
`--body #26251f`, `--red #c0392b`. El nav es un **cajón azul** que entra desde la
derecha (el burger lo abre); la marca es la "o" cruzada pintada a mano
(`monogram.png` en la raíz, servida same-origin porque una `-webkit-mask`
cross-origin la bloquean algunos navegadores; `logo_tall.png` es la versión alta
para landing/About). El canvas de diseño de todas las pantallas vive en
`_preview/design/` (artboards `*.dc.html`). Ojo: **el laboratorio (`sketches/`)
no carga `nav.js`**, así que cada harness define sus propios tokens `:root`; hoy
solo el de PLLS está portado al sistema nuevo, el resto sigue en el look viejo.

## Estructura

### Páginas

- **`index.html`** — Landing. Rejilla 9×10 arrastrable (drag/pan, perspectiva 3D
  al hover). Carga obras guardadas reales desde `data/*.json` y rellena los
  huecos con *demos* dibujadas en vivo. **El catálogo lo pone `works.json`**: una
  familia `active` sale aquí sin tocar código —la landing le pide su
  `sketches/<slug>/algo.js` cuando hace falta, y saca nombre, destino y
  proporción de celda de su ficha—. Solo las familias anteriores al algo.js
  compartido (PLLS, KRRTK, DTK, BZRS) conservan aquí una reimplementación
  reducida para su demo; esa tabla está para vaciarse, no para crecer.
- **Páginas de obra** — **archivo, no herramienta**. Las graduadas
  (`plls.html`, `krrtk.html`, `dtk.html`, `dtkrt.html`) son cascarones de 20
  líneas que cargan `work-page.js`: nombre, narrativa (`description` de
  `works.json`), las piezas elegidas (`data/<obra>.json`, con lupa al clic) y un
  **lienzo vivo mudo** que se regenera al clic — sin panel, sin traits, sin
  rareza, sin guardar. La rareza es lenguaje de edición: describe la
  improbabilidad de una tirada que nadie posee, así que vive en el laboratorio.
  Una familia **sin cascarón propio** no se queda sin sección: cae a
  **`work.html?w=<slug>`**, la misma página genérica, que carga el algo.js por su
  slug. El campo `page` de `works.json` decide cuál usa cada una — las veteranas
  lo tienen porque sus URLs estuvieron publicadas; una familia nueva no lo lleva
  y por eso activarla basta. Las heredadas (`bzrs.html`) siguen con
  su generador inline **congelado**: son inactivas y su algoritmo aún no está
  graduado, así que ahí sí quedan Generate, formato/pliego, Save (que además
  apunta la paleta en `data/palette-usage.json`, ver `usage.js`) y Download.
  Publicar lo nuevo, en cambio, es cosa del lote.
- **`about.html`** — Texto leído de `data/site.json` (con *fallback* embebido).
- **`palettes.html`** — Galería de paletas desde `data/palettes.json`; muestra
  activas/inactivas y su rareza/probabilidad. **Solo con sesión admin** aparece
  arriba una **rejilla de uso** al estilo del grid de actividad de GitHub: una
  celda por paleta en orden de catálogo (12 por fila), tono en 5 niveles según
  cuántas obras guardadas la usan, celda con borde = paleta retirada. Click en
  una celda = filtrar por esa paleta; con sesión admin cada tarjeta lleva además
  su contador `×N`, hay orden *por uso* y un botón **Copy data** que copia el
  volcado en TSV (paleta, colores, prob, obras, cuota, familias) para trabajar la
  narrativa de escasez fuera de la web. Sin sesión no se pinta ni se llega a
  pedir `palette-usage.json`: el uso es dato interno, y por eso ese bloque va en
  inglés y fuera de i18n, como el resto de la operativa. Enlace desde el panel:
  pestaña *Palettes* → **Usage grid**.
- **`admin.html`** — Panel protegido por contraseña. Gestiona paletas, familias
  (`works.json`), contenido (`site.json`) y el token de GitHub. Escribe
  commiteando directamente a `main` por la Contents API. En cada familia
  graduada muestra un enlace **Lab** (`sketches/<slug>/`), solo visible desde el
  panel y presente también en las apagadas —el lab las abre igual—. El check
  *Active* de cada familia es el interruptor de la web entera: al marcarlo, la
  obra aparece en la landing, en el dropdown *Work* y con su sección, sin tocar
  código.

### Compartido

- **`nav.js`** — Se incluye en todas las páginas. Inyecta `<nav>` (logo "hoks",
  dropdown *Work*, About, Palettes), favicon SVG, footer (© hoks, contacto,
  Instagram si está en `site.json`) y badge ADMIN si hay sesión. **El dropdown
  se escribe desde `works.json`**, una entrada por familia activa en el orden del
  catálogo; la lista que hay en el archivo es solo el arranque, para que no
  parpadee y para sobrevivir sin red. Exporta `HOKSNAV.workHref(w)` —la regla de
  a dónde lleva una familia, `page` o la genérica— porque la landing enlaza a lo
  mismo y dos reglas darían dos destinos. Aloja también el i18n
  (`window.HOKSI18N`, diccionarios EU/ES/EN).
- **`palette-picker.js`** — Selector de paleta, **componente único** de toda la
  web y del laboratorio (`HOKSPAL.mount(host, {palettes, index, onChange})`).
  Cada opción muestra la paleta entera en una franja de color —elegir paleta es
  elegir color, no nombre— y se navega con teclado (↑↓, Home/End, tecleo para
  buscar, Esc). Trae su propio CSS inyectado; las páginas solo ponen un
  `<div id="palPicker">`. Antes esto estaba copiado en 8 páginas con 3 variantes
  distintas: si tocas el desplegable, tócalo aquí.
- **`work-page.js`** — La página de obra graduada, una sola vez: narrativa,
  piezas elegidas y lienzo vivo mudo. La usan los cascarones (`HOKSWORK.init`) y
  `work.html`, que es el mismo cascarón sin obra fija: lee el slug del `?w=`,
  pide su algo.js y llama a lo mismo.
- **`usage.js`** — Registro de uso de paletas (`data/palette-usage.json`).
  `HOKSUSAGE.load()` / `.counts()` los lee (palettes.html, solo con sesión
  admin); `.recordMany()` añade filas al **publicar un lote** desde el
  laboratorio (un commit por publicación, no uno por pieza) y `.record()` añade
  una al Guardar en las páginas heredadas. Sin token de admin no escribe.

No hay otro CSS/JS global: cada página trae su propio `<style>`.

### Laboratorio (`sketches/`)

**Aquí se genera y aquí se elige.** Motor compartido (`_engine.js`: Rng, mesh
gradient, grano, paletas) + `_lab.js` (selector de obra y de paleta) +
`_batch.js` (lotes) + `_wall/` (el muro) + `_firma.js` (el sitio de la firma) +
una carpeta por obra graduada con `algo.js` (el algoritmo, fuente única) y un
harness (scrub de seeds, hoja de contactos).

**`_firma.js` — dónde firma la mano.** La firma **no está en el archivo**: va a
mano sobre la tinta, porque el fondo va a sangre y no hay margen blanco donde
firmar (`impresion.html` §03). Una firma que sale del código no acredita nada
—mismo seed, misma firma, mil veces—, así que ningún `algo.js` la dibuja. Lo que
hace el módulo es medir el píxel ya renderizado y decir **dónde** cabe y **con
qué**: recorre la banda inferior, elige la caja quieta más a la derecha donde el
lápiz se vea, y devuelve los milímetros desde el canto. Lo que cambia con el
fondo es la mina —grafito en claro, lápiz blanco en oscuro—, no el gesto. La caja
mide 58 × 14 mm en cualquier pliego: la obra escala, la mano no.

**`_wall/` — el muro.** La pieza a escala sobre una pared: figura de 1,70 m, eje
de colgado a 1,45 m, regla en cm, y una segunda vista con los cinco pliegos en
la misma pared. Está en **su propia página a propósito**: el laboratorio decide
*qué* se genera y el muro solo dice *de qué tamaño* es el objeto, así que aquí
solo hay mandos que no cambian ni un píxel (pliego y referencias) — el muro
mide 3 m y el encuadre se corta arriba, que son supuestos, no ajustes. Todo lo
que mueve la imagen llega por URL y es de solo lectura: si hay que cambiar la
obra, se vuelve al lab. Lo que viaja es la **receta**, la
misma de los harnesses y `_batch.js`, serializada entera, así que un parámetro
nuevo llega al muro sin tocar nada. El enlace lo pone
`HOKSLAB.mountWallLink()`, una línea por harness. No metas mandos de mirar en
el panel de generar: esa separación es el motivo de que exista la página.

El circuito completo: **lab → lote → publicar → galería**. Se mira la hoja de
contactos, se aparta con `+` o `a`, y el lote —una lista de *recetas*, no de
imágenes— se publica desde el propio laboratorio a `data/<obra>.json`, que es lo
que enseña la web. Publicar es también lo único que crea obra guardada, así que
es ahí donde `_batch.js` apunta la paleta de cada pieza en
`data/palette-usage.json` — con la paleta que ha salido en ese render, no la que
tuviera la receta: si hubo deriva, manda el píxel publicado. **El flujo creativo
vive en p5/OpenProcessing; el laboratorio es porte + QA y lo opera Claude.**
Ver `sketches/README.md` para el flujo completo de graduación.

### Datos (`data/`)

Los JSON **vivos** están en `data/` y se leen siempre desde
`raw.githubusercontent.com/Joxemari/hoks/main/data/…?t=<timestamp>` (cache-bust),
no por ruta relativa. Esto permite que un cambio de datos aparezca sin esperar el
redeploy de Pages.

- **`works.json`** — Registro de familias: `id, name, slug, active, description,
  page, canvas, formats`. **`active` es el único interruptor de la web**: decide
  qué familias salen en la landing, en el dropdown *Work* del nav y con sección
  propia. **No decide nada en el laboratorio**, que abre *todas* las graduadas
  —publicadas o no— y marca `· (fuera de la web)` las que no lo están: el lab es
  la mesa de trabajo, y esconder lo inactivo escondía justo el trabajo en curso.
  Activar una familia es, por tanto, un clic en el panel y nada más: ni tocar
  `nav.js`, ni la landing, ni escribir un `<slug>.html`. Hoy activas: **plls,
  krrtk, dtkrt, eclps y trzs**. Lo que sí hace falta antes es que la obra esté en
  el registro (**+ Add Family**) y graduada, o saldrá sin celdas demo.
- **`palettes.json`** — Paletas con `colors`, `active`, `tags`, `notes`. Mezcla
  sets de Roni Kaufman (color_pals) y series Itten (contraste complementario).
- **`site.json`** — `aboutText`, `footerEmail`, `footerInstagram`.
- **`plls.json`, `krrtk.json`, `dtk.json`, `plls.json`, `dtkrt.json`,
  `gallery*.json`** —
  Obras guardadas como `{seed, dataUrl(base64), savedAt}`. Pueden pesar MB.
  Ojo: **no guardan la paleta**, y no se puede re-derivar del seed (la elección
  por peso depende de qué paletas estaban activas ese día). De ahí el índice
  aparte.
- **`palette-usage.json`** — Índice de uso: una fila por obra guardada con
  `{family, seed, savedAt, paletteId, paletteName, source}`. Lo escribe la página
  de obra al Guardar (`source:"save"`). Las filas `source:"backfill"` son las 26
  obras que ya existían: se reconstruyeron re-renderizando cada seed con el
  algoritmo de su época (rescatado de git) y comparando píxel a píxel contra el
  PNG guardado — no por parecido de color, que en las familias con grano y mesh
  gradient se equivoca. Es un índice **derivado**: si se borran obras de una
  galería, sus filas quedan huérfanas y hay que quitarlas a mano.

> ⚠️ Los `*.json` en la **raíz** (`bzrs.json`, `dtk.json`, `krrtk.json`, etc.)
> están vacíos (`[]`) y son restos heredados. La fuente real es `data/`. No los
> uses ni los confundas con los de `data/`.

## Motor común (cómo funcionan las obras)

- **RNG**: clase `Rng` (LCG, `Math.imul(1664525,s)+1013904223`). Mismo seed →
  mismo resultado. Helpers: `int, range, bool, pickFrom, weighted`.
- **Paletas ponderadas**: `ageWeight()` da más probabilidad a las recientes;
  `getActivePalette(rng)` elige por peso (o fija una si el admin la bloquea).
- **Familias base**: PLLS (cápsulas/pills con arquetipos de densidad y *finishes*),
  KRRTK (subdivisión recursiva de cuadrados), DTK (rejilla de círculos), BZRS
  (cientos de curvas Bézier con degradado entre dos colores).
- **TRZS** (trazos): una cinta continua recorre el marco varias veces y al volver
  a entrar se cruza con lo que ya dejó escrito. La profundidad **no** es el orden
  del dibujo: se decide cruce a cruce, alternando encima y debajo como un diagrama
  de nudo, y el dibujo se parte en secciones ordenadas para que ese orden se pueda
  pintar en plano. Lo que separa las hebras no es un contorno: es una **incisión**,
  el corte por donde se ve el suelo — y **el final de la cinta también es un
  filo**: lleva su incisión aunque el remate sea a escuadra, porque si no se
  suelda a lo que tenga delante. Cinco tipos declarados (suelto, anudado,
  trama, —raro— dos cintas entrelazadas y tres cintas, este último sólo en el
  laboratorio) que se comprueban sobre el resultado. La esquina puede salir viva
  o curva —una de cada cuatro—, y hay un **temblor** opcional del recorrido, que
  entra antes de analizar el nudo para que la incisión siga cayendo donde el
  análisis dice. Graduada desde p5 (`sketches/iterations2/`), con el porte
  verificado idéntico al píxel y una batería propia en `sketches/trzs/verificacion/`
  (`mil.sh`: mil obras por bloque, cada bloque con su control roto a propósito).
- **Variantes "G"** (KRRTK/DTK/PLLS): añaden **mesh gradient** de fondo
  (interpolación bilineal de 4 esquinas, `drawMeshGradient`) y **grano de film**
  por soft-light (`bakeGrain`/`applyGrain`).
- **DTKRT**: la misma malla de DTK leída dos veces — *presencia* (¿hay círculo?) y
  *pertenencia* (región crecida celda a celda). Rompe con las "G" a propósito:
  fondo **plano** (figura/fondo necesita un plano estable), margen para que el
  suelo se vea, y tres roles de color fijos por luma (suelo/bloque/punto) en vez
  de un color por forma. Conserva el grano. Es la dirección actual del trabajo.
- **Traits/rareza**: cada draw calcula traits (paleta, arquetipo, cobertura…) y
  una rareza global (`common`→`legendary`) por probabilidad combinada.
- **Familias, sin variantes "G"**: la familia es la **matriz** (PLLS, KRRTK, DTK,
  BZRS, DTKRT). Lo que antes era una serie aparte —el mesh gradient de fondo y el
  grano de film— es hoy un **ajuste del laboratorio**: `params.bg`
  (`auto | solid | gradient`) y el slider de grano. Las galerías de las G se
  fundieron en su matriz y las URLs viejas (`krrtkg.html`, `dtkg.html`,
  `pllsg.html`, `pills.html`) quedan como redirecciones: estuvieron publicadas.
- **Pliego y campo son dos decisiones**: el pliego da la proporción del papel y
  `params.field` (`sheet | square`) dice si la obra lo llena o se compone
  cuadrada y se centra en él. Un cuadrado sobre un DIN es una imagen buscada, no
  un resto de no haber adaptado el algoritmo.
- **Formato**: toda obra existe en tres proporciones — **cuadrado** (1:1),
  **vertical** y **horizontal** (1:√2, la proporción DIN). No es un recorte: se
  le pasan otras `W`/`H` al algoritmo y él recompone. El algoritmo no puede
  suponer ni proporción ni resolución — todo se mide contra `W`, `H` o
  `min(W,H)`, y las constantes en px se escalan por `HOKS.unit(W,H,REF)`.
- **Impresión**: "Download PNG" **vuelve a renderizar** fuera de pantalla al
  tamaño del pliego (A4 / **A3** / A2 / A1, 300 dpi); el lienzo de la página es
  solo vista previa (lado corto 760 px). Mismo seed + mismo formato = la misma
  imagen a cualquier tamaño, así que lo que se ve es lo que se imprime.
  **A0 está en `SHEETS` pero no en `SHEET_IDS`**: solo lo enseña el muro
  (`WALL_SHEET_IDS`), porque a 300 dpi son 139,5 Mpx y 532 MB de lienzo —
  exportarlo pide antes decidir su dpi (a 150 son 34,9 Mpx y a ese tamaño no se
  nota). Ojo: `printDims` con un pliego que no esté en la tabla no falla, cae al
  de por defecto; ahora al menos avisa por consola.

## Despliegue

**GitHub Pages servido desde la rama `main`, raíz del repo.** No hay workflow de
Actions, ni `_config.yml`, ni compilación: cada push a `main` redespliega
`https://joxemari.github.io/hoks/` automáticamente. Lo commiteado = lo publicado.

Doble canal de "publicación":
1. **Código/páginas** → GitHub Pages (rama `main`).
2. **Datos JSON** → leídos en vivo desde `raw.githubusercontent.com/.../main/data/`.
   admin.html escribe esos JSON commiteando a `main` por la Contents API (token
   PAT en `localStorage`), así que se actualizan sin tocar el código.

## Buscadores y agentes

El sitio se lee de dos maneras: con navegador y sin él. Un buscador puede
renderizar JavaScript —a veces—; los *fetchers* de agente (`GPTBot`,
`ClaudeBot`, `PerplexityBot`, `ChatGPT-User`…) **no lo ejecutan**: piden el
documento y leen lo que llega. Como aquí todo lo pinta el JS con datos traídos
de `raw.githubusercontent.com`, un cascarón de familia era, para ellos, un
`<title>` y nada más.

**La regla, una sola:** lo que tiene que leer una máquina va **estático en el
HTML**. Si un dato solo existe después de un `fetch` o de que corra `nav.js`,
para ese lector no existe. Por eso las cabeceras no se inyectan: se escriben en
cada archivo, aunque se repitan.

De ahí lo que hay hoy:

- **`robots.txt`** — declara la frontera taller/obra y apunta al sitemap. Ojo:
  en un *project page* (`joxemari.github.io/hoks/`) **es inerte**, porque
  `robots.txt` solo se lee en la raíz del origen, que es otro repo. Lo que de
  verdad mantiene el taller fuera del índice es el `<meta name="robots"
  content="noindex">` de esas páginas, que sí viaja en el documento. El archivo
  pasa a valer el día que haya dominio propio.
- **`sitemap.xml`** — las once URLs públicas, con `lastmod`. Es estático porque
  no hay paso de build, y hace falta porque `making.html?w=…` no se descubre
  sola: nadie enlaza a una URL con query desde HTML.
- **`llms.txt`** — la gramática en prosa: qué es una familia, un *seed*, una
  paleta, un pliego, y dónde están los JSON. Es una **convención propuesta, no
  un estándar**: nadie garantiza que se lea. Está por coherencia y porque cuesta
  cero, no porque vaya a traer visitas.
- **Cabeceras** — `description`, canonical, OG/Twitter y **JSON-LD** en las
  cinco familias activas, la landing, About y Palettes. La familia se declara
  `CreativeWorkSeries` (una familia es una serie, no un cuadro), la persona
  `Person`, y el ensayo cuelga de su familia por `subjectOf`.
- **`lang`** — `nav.js` abre en inglés (`DEFAULT_LANG`), así que el `lang="eu"`
  estático de los cascarones mentía a quien no ejecuta JS. Las públicas dicen
  `en`; `nav.js` lo reescribe al cambiar de idioma.

**Al activar una familia** el clic en el panel ya no basta del todo: sigue
bastando para la web, pero para las máquinas hay que (1) quitar su `noindex`,
(2) añadir su URL a `sitemap.xml` y (3) darle cabecera al cascarón. Es el
peaje de no tener build; si algún día molesta, la salida es generar sitemap y
cabeceras al publicar, no inyectarlos con JS.

**Lo que queda pendiente**, por orden de lo que de verdad pesa:

1. **Narrativa estática en el HTML.** Es el arreglo de fondo: hoy un agente lee
   la `description` de la cabecera, no la obra. Choca con la fuente única de
   `data/works.json`, y esa decisión —o el panel escribe también el HTML, o el
   HTML pasa a ser el canónico— está sin tomar.
2. **Un PNG por pieza publicada, con `alt` de verdad.** La obra es `<canvas>`:
   no existe para un agente ni para un lector de pantalla. La imagen ya está en
   los `data/*.json` en base64; lo que falta es sacarla a archivo y enseñarla en
   un `<img>`. Mientras no esté, todas las `og:image` son el mismo `preview.png`.
3. **URLs por idioma + `hreflang`.** El statement existe en euskara, castellano
   e inglés, pero en una sola URL con el idioma en `localStorage`: solo se puede
   indexar uno. Arreglarlo es cambio de estructura, no de cabecera.

## Workflow

Trabajar **directamente sobre `main`** y hacer **push directo**. Sin ramas de
feature, sin PRs. El objetivo es iterar rápido y ver el cambio publicado al
instante en la web. Commits pequeños y descriptivos.

## Estética y tono

Para cualquier obra, copy o texto que generes:

- Sobrio, poético, con confianza en lo mínimo; base conceptual/filosófica.
- El código y las reglas **son** el motor conceptual, no un medio: el código como
  gramática, las reglas como forma, lo visible como **residuo del pensamiento**.
- Continuidad con la obra existente (paleta sobria, mono, blanco y negro,
  geometría + azar controlado). No romper el lenguaje visual ya establecido.
- Influencia de referencia: **Elena Asins** (estructura, serialidad, sistema).

## Stack técnico

- Desarrollo y prototipado: **p5.js / OpenProcessing**. Producción en la web:
  **canvas 2D nativo** (sin p5 en runtime; el código se porta a 2D puro).
- Para documentación de librerías usa **Context7** cuando haga falta.
- **No inventes APIs**: contrasta firmas y comportamiento antes de usarlos.
</content>
