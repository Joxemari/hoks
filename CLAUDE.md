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
llevan su JS *inline*. No hay módulos ni dependencias instaladas. Tipografía
única en todo el sitio: `Courier New` monoespaciada; fondo blanco, tinta `#111`.

## Estructura

### Páginas

- **`index.html`** — Landing. Rejilla 9×10 arrastrable (drag/pan, perspectiva 3D
  al hover). Carga obras guardadas reales desde `data/*.json` y rellena los
  huecos con *demos* dibujadas en vivo. Filtra a las familias `active` según
  `data/works.json`. Reimplementa los algoritmos de dibujo de cada serie (versión
  reducida) para las celdas demo.
- **Páginas de obra** — **archivo, no herramienta**. Las graduadas
  (`plls.html`, `krrtk.html`, `dtk.html`, `dtkrt.html`) son cascarones de 20
  líneas que cargan `work-page.js`: nombre, narrativa (`description` de
  `works.json`), las piezas elegidas (`data/<obra>.json`, con lupa al clic) y un
  **lienzo vivo mudo** que se regenera al clic — sin panel, sin traits, sin
  rareza, sin guardar. La rareza es lenguaje de edición: describe la
  improbabilidad de una tirada que nadie posee, así que vive en el laboratorio.
  Las heredadas (`bzrs.html`) siguen con
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
  panel. El dropdown *Work* del nav lista solo las familias `active`.

### Compartido

- **`nav.js`** — Se incluye en todas las páginas. Inyecta `<nav>` (logo "hoks",
  dropdown *Work* con las 8 series, About, Palettes), favicon SVG, footer
  (© hoks, contacto, Instagram si está en `site.json`) y badge ADMIN si hay
  sesión. Aloja también el i18n (`window.HOKSI18N`, diccionarios EU/ES/EN).
- **`palette-picker.js`** — Selector de paleta, **componente único** de toda la
  web y del laboratorio (`HOKSPAL.mount(host, {palettes, index, onChange})`).
  Cada opción muestra la paleta entera en una franja de color —elegir paleta es
  elegir color, no nombre— y se navega con teclado (↑↓, Home/End, tecleo para
  buscar, Esc). Trae su propio CSS inyectado; las páginas solo ponen un
  `<div id="palPicker">`. Antes esto estaba copiado en 8 páginas con 3 variantes
  distintas: si tocas el desplegable, tócalo aquí.
- **`work-page.js`** — La página de obra graduada, una sola vez: narrativa,
  piezas elegidas y lienzo vivo mudo.
- **`usage.js`** — Registro de uso de paletas (`data/palette-usage.json`).
  `HOKSUSAGE.load()` / `.counts()` los lee (palettes.html, solo con sesión
  admin); `.recordMany()` añade filas al **publicar un lote** desde el
  laboratorio (un commit por publicación, no uno por pieza) y `.record()` añade
  una al Guardar en las páginas heredadas. Sin token de admin no escribe.

No hay otro CSS/JS global: cada página trae su propio `<style>`.

### Laboratorio (`sketches/`)

**Aquí se genera y aquí se elige.** Motor compartido (`_engine.js`: Rng, mesh
gradient, grano, paletas) + `_lab.js` (selector de obra y de paleta) +
`_batch.js` (lotes) + una carpeta por obra graduada con `algo.js` (el
algoritmo, fuente única) y un harness (scrub de seeds, hoja de contactos).

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
  page, canvas`. El flag `active` decide qué series aparecen en la landing y en
  el dropdown *Work* del nav. Hoy activas: **plls y dtkrt**; el resto
  (pills/krrtk/dtk/bzrs/krrtk/dtk) están inactivas. La landing reimplementa el
  algoritmo de cada serie salvo DTKRT, que consume su `algo.js` real.
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

## Despliegue

**GitHub Pages servido desde la rama `main`, raíz del repo.** No hay workflow de
Actions, ni `_config.yml`, ni compilación: cada push a `main` redespliega
`https://joxemari.github.io/hoks/` automáticamente. Lo commiteado = lo publicado.

Doble canal de "publicación":
1. **Código/páginas** → GitHub Pages (rama `main`).
2. **Datos JSON** → leídos en vivo desde `raw.githubusercontent.com/.../main/data/`.
   admin.html escribe esos JSON commiteando a `main` por la Contents API (token
   PAT en `localStorage`), así que se actualizan sin tocar el código.

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
