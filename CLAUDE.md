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
- **`static-gen.js`** — El HTML que lee una máquina: cabecera, JSON-LD y el
  bloque `#hoks-static` de una página de familia, más `sitemap.xml`. Lo llama
  `admin.html` al guardar (y `tools/static.mjs` desde node). Ver § Buscadores y
  agentes: las páginas de familia son artefacto derivado de `works.json`, no se
  editan a mano.
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
`HOKSLAB.mountViewLinks()`, una línea por harness (que monta los dos: muro y
objetos). No metas mandos de mirar en el panel de generar: esa separación es el
motivo de que existan estas páginas.

**`_objects/` + `_mockup.js` — las fotos.** El muro es un **alzado**: mide, para
decidir el pliego. Esto es una **foto**: la obra sobre la cosa —pared, camiseta,
vinilo, reloj—, para **publicar**. Dos oficios distintos, dos páginas: un alzado
con cotas no se puede poner en Instagram. Sale a 1080 px con 4:5 por defecto
(BRAND.md § 8) y guardar vuelve a renderizar a tamaño de publicación. La **toma**
es un azar aparte del de la obra: los pliegues, las hojas y el grano cambian con
`Espacio`; la pieza, no. Lo que hace que parezca una foto vive en `_mockup.js` y
son tres cosas: `warp` (perspectiva **proyectiva** —interpolar la textura en 1/z—
recortada al quad), `displace` (la impresión se **dobla** con los pliegues que le
tocan; sin esto es una pegatina, siempre) y `grade` (luz, temperatura y grano al
final y sobre todo el cuadro, que es el defecto compartido que dice que hay una
sola foto). Una sola luz para todas las escenas, el objeto en su propio lienzo
para que la sombra sea de la silueta, y nada paralelo al canto.

Pero esas cuatro son **renders**, y se nota. Lo que da fotorrealismo es la escena
**`foto`**, que es la que se usa para publicar: sueltas una imagen (móvil,
plantilla comprada), arrastras las **cuatro esquinas** hasta el plano —pared,
pecho, funda— y la obra se proyecta ahí por **homografía** tomando prestada la
luz de la propia fotografía: su sombra multiplica y su brillo va en screen (con
la referencia medida **dentro del plano**, no en el cuadro entero), el gradiente
de luminancia la **dobla**, la foto en gris y en overlay le mete la trama a
resolución completa, y un grano igualado tapa la diferencia entre una obra
perfectamente limpia y una foto que no lo es. **La foto no sale del navegador**:
no se sube ni se commitea —el repo es público—, solo se recuerdan las cuatro
esquinas por archivo. Lo que no llega: un plano curvo (una taza es un cilindro,
no un quad) y la máscara para lo que pase por delante.

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
- **La tinta tiene que verse sobre el suelo** (`E.pickInk`, `E.inkOn`,
  `E.blendFor`): las paletas son listas planas y el suelo sale de la misma lista,
  así que la tirada del color podía caer justo en el color de debajo — la marca se
  dibujaba, contaba en los traits y en el papel no había nada. Medido sobre el
  píxel: DTK 5,0% de piezas invisibles en cuadrado, ECLPS 14,0%, KRRTK 1,5%,
  PLLS 0,5%. La distancia es de **color**, no de luminancia (las Itten son
  contrastes de tono). `pickInk` consume la misma tirada de siempre y solo salta
  si cae en el suelo; `blendFor` es lo mismo para lo que se funde en vez de
  superponerse — multiply con tinta blanca no es un fundido flojo, es no pintar.
  Y la obra **siempre deja una marca**: si ninguna celda de DTK pasa el umbral
  pasa la que más cerca estuvo, y si ninguna nota de ECLPS suena, suena la del
  medio. Una hoja en blanco no es una tirada rara: es la obra que no está.
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
`https://hoks.design/` automáticamente. Lo commiteado = lo publicado.

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
para ese lector no existe.

Pero la narrativa vive en `data/works.json`, que es su fuente única, así que la
salida no es duplicarla: **el HTML de una página de familia es un artefacto
derivado**. Lo escribe el panel al guardar la familia, entre marcadores, y nadie
lo edita a mano.

- **`static-gen.js`** — el generador, **compartido a propósito**. `admin.html` es
  un panel autónomo y no carga scripts del sitio; esta es la excepción, y tiene
  motivo: si el panel generase por un lado y las herramientas por otro, dos
  implementaciones darían dos HTML y la deriva no se vería hasta leer el archivo
  publicado. Produce la cabecera, el bloque estático y el sitemap. Vale en
  navegador (`window.HOKSGEN`) y en node (`module.exports`).
- **`tools/static.mjs`** — el mismo generador sin pasar por el panel:
  `node tools/static.mjs` rellena, `--check` dice si lo commiteado es lo que el
  generador produce hoy. Útil cuando lo único que cambia es el HTML derivado y
  no hace falta token.
- **Marcadores** — `<!-- HOKS:AUTO-HEAD -->` en el `<head>` y
  `<!-- HOKS:AUTO-BODY -->` en el `<body>`. **Solo se toca lo que hay entre
  ellos.** Un cascarón sin marcadores es un cascarón escrito a mano y se deja en
  paz (`bzrs.html`, que es la heredada congelada).
- **El bloque estático** — `#hoks-static`: nombre, año, pliegos, la imagen con
  su `alt`, la descripción **en los tres idiomas**, la cartela y —esto es lo que
  faltaba— **enlaces**. `nav.js` construye el nav entero, así que sin JS una
  página de familia no tenía *ni un enlace*: era un callejón sin salida para un
  lector y para un rastreador. `work-page.js` lo retira al arrancar, así que
  nadie lo ve dos veces.
- **`assets/og/<slug>.jpg`** — una tarjeta 1200×630 por familia activa, la obra
  centrada sobre papel. Es lo que hace que la obra **exista** para quien no puede
  mirar un `<canvas>`: agente o lector de pantalla. Las de PLLS y KRRTK son la
  pieza publicada tal cual (no se re-renderiza el seed: `data/*.json` no guarda
  la paleta y la elección por peso dependía de qué paletas estaban activas ese
  día, así que manda el píxel publicado). Las tres sin lote son un render con
  seed fijo, **provisionales**: en cuanto haya lote se cambian por obra
  publicada. El campo `ogImage` de `works.json` dice quién tiene la suya; sin él
  se cae a `preview.png`, que es mejor que un 404.
- **`assets/static.css`** — el estilo de ese bloque, en archivo y no repetido en
  cada cascarón: el CSS sí lo pide un navegador con el JS apagado, y a un agente
  le da igual.
- **`robots.txt`** — declara la frontera taller/obra y apunta al sitemap. Ojo:
  en un *project page* (`hoks.design/`) **es inerte**, porque
  `robots.txt` solo se lee en la raíz del origen, que es otro repo. Lo que de
  verdad mantiene el taller fuera del índice es el `noindex` de esas páginas,
  que sí viaja en el documento. El archivo pasa a valer el día que haya dominio
  propio.
- **`sitemap.xml`** — generado, **sin `lastmod` a propósito**: la única fecha que
  el panel conoce es "hoy", y ponerla en cada URL cada vez que se guarda es
  justo el `lastmod` que los buscadores aprenden a ignorar. Hace falta porque
  `making.html?w=…` no se descubre sola: nadie enlaza a una query desde HTML.
- **`llms.txt`** — la gramática en prosa: qué es una familia, un *seed*, una
  paleta, un pliego, y dónde están los JSON. Es una **convención propuesta, no
  un estándar**: nadie garantiza que se lea. Está por coherencia y porque cuesta
  cero, no porque vaya a traer visitas. Se escribe a mano.
- **`lang`** — `nav.js` abre en inglés (`DEFAULT_LANG`), así que el `lang="eu"`
  estático de los cascarones mentía a quien no ejecuta JS. Las públicas dicen
  `en`; `nav.js` lo reescribe al cambiar de idioma.

**Activar una familia sigue siendo un clic.** El panel guarda `works.json` y
acto seguido reescribe los cascarones y el sitemap: el `noindex` se cae solo
—lo pone el generador cuando `active` es falso—, la URL entra en el sitemap y la
narrativa aparece en el HTML. Un commit por archivo que de verdad cambie.

**Al añadir una familia nueva con cascarón propio**, lo único que hay que hacer
a mano es pegar los dos pares de marcadores; a partir de ahí lo llena el panel.
Sin `page`, cae a `work.html?w=<slug>` y no hay nada que pegar — pero tampoco hay
bloque estático: esa página es genérica y el slug llega por URL, así que su
cabecera no puede ser por familia sin paso de build.

**Lo que queda pendiente:**

1. **URLs por idioma + `hreflang`.** El statement existe en euskara, castellano e
   inglés, pero en una sola URL con el idioma en `localStorage`: solo se puede
   indexar uno. El bloque estático ya trae los tres marcados con `lang`, que es
   un parche honesto, no la solución. Arreglarlo de verdad es cambio de
   estructura.
2. **`making.html` y `work.html`.** Las dos reciben el slug por `?w=`, así que su
   cabecera y su texto no pueden ser por pieza sin build. Los ensayos están en el
   sitemap y se indexarán por lo que renderice el buscador, no por lo que diga el
   documento.
3. **Obra publicada por familia.** Cuando DTKRT, ECLPS y TRZS tengan lote, sus
   tarjetas `og` dejan de ser un render provisional. Y una imagen por *pieza*
   —no por familia— sigue sin existir.

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
