# CLAUDE.md — hoks

Guía para sesiones futuras. Léela antes de tocar nada.

## Qué es

Web de arte generativo / algorítmico bajo el alias **hoks** (Joxemari Gallastegi,
Donostia / Stanford). Sistemas que producen imagen a partir de código y azar
controlado: cada pieza nace de una *seed* y un RNG determinista.

**HTML/JS vanilla. Sin framework, sin bundler, sin paso de build.** Lo que se
commitea es exactamente lo que se publica. Las obras **graduadas** (pllsg,
krrtkg, dtkg) tienen su algoritmo en `sketches/<obra>/algo.js` (fuente única,
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
- **Páginas de obra** (una por serie): `pills.html` (PLLS), `krrtk.html`,
  `dtk.html`, `bzrs.html`, `krrtkg.html`, `dtkg.html`, `pllsg.html`. Cada una es
  autónoma: canvas 2D + RNG sembrado + selector/peso de paletas + sistema de
  *traits* y rareza en la barra lateral. Click en el canvas = nueva variación.
  Botones: Generate, Copy Card, Save, Download PNG. "Save" sube la imagen
  (dataURL) al JSON de la familia vía API de GitHub (requiere sesión admin).
- **`about.html`** — Texto leído de `data/site.json` (con *fallback* embebido).
- **`palettes.html`** — Galería de paletas desde `data/palettes.json`; muestra
  activas/inactivas y su rareza/probabilidad.
- **`editor.html`** — Editor de código. Se pega la función `draw` de
  OpenProcessing y se guarda en el campo `drawCode` de `works.json`.
- **`admin.html`** — Panel protegido por contraseña. Gestiona paletas, familias
  (`works.json`), contenido (`site.json`) y el token de GitHub. Escribe
  commiteando directamente a `main` por la Contents API.

### Compartido

- **`nav.js`** — Se incluye en todas las páginas. Inyecta `<nav>` (logo "hoks",
  dropdown *Work* con las 7 series, About, Palettes), favicon SVG, footer
  (© hoks, contacto, Instagram si está en `site.json`) y badge ADMIN si hay
  sesión. No hay otro CSS/JS global: cada página trae su propio `<style>`.

### Laboratorio (`sketches/`)

Motor compartido (`_engine.js`: Rng, mesh gradient, grano, paletas) + una
carpeta por obra graduada con `algo.js` (el algoritmo, fuente única) y un
harness de desarrollo (scrub de seeds, hoja de contactos). **El flujo creativo
vive en p5/OpenProcessing; el laboratorio es porte + QA y lo opera Claude.**
Ver `sketches/README.md` para el flujo completo de graduación.

### Datos (`data/`)

Los JSON **vivos** están en `data/` y se leen siempre desde
`raw.githubusercontent.com/Joxemari/hoks/main/data/…?t=<timestamp>` (cache-bust),
no por ruta relativa. Esto permite que un cambio de datos aparezca sin esperar el
redeploy de Pages.

- **`works.json`** — Registro de familias: `id, name, slug, active, description,
  page, canvas` y `drawCode` (el código de la obra como string). El flag `active`
  decide qué series aparecen en la landing. Hoy activas: **krrtkg, dtkg, pllsg**
  (las que llevan grano); pills/krrtk/dtk/bzrs están inactivas.
- **`palettes.json`** — Paletas con `colors`, `active`, `tags`, `notes`. Mezcla
  sets de Roni Kaufman (color_pals) y series Itten (contraste complementario).
- **`site.json`** — `aboutText`, `footerEmail`, `footerInstagram`.
- **`plls.json`, `krrtkg.json`, `dtkg.json`, `pllsg.json`, `gallery*.json`** —
  Obras guardadas como `{seed, dataUrl(base64), savedAt}`. Pueden pesar MB.

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
- **Variantes "G"** (KRRTKG/DTKG/PLLSG): añaden **mesh gradient** de fondo
  (interpolación bilineal de 4 esquinas, `drawMeshGradient`) y **grano de film**
  por soft-light (`bakeGrain`/`applyGrain`). Es la dirección actual del trabajo.
- **Traits/rareza**: cada draw calcula traits (paleta, arquetipo, cobertura…) y
  una rareza global (`common`→`legendary`) por probabilidad combinada.

## Despliegue

**GitHub Pages servido desde la rama `main`, raíz del repo.** No hay workflow de
Actions, ni `_config.yml`, ni compilación: cada push a `main` redespliega
`https://joxemari.github.io/hoks/` automáticamente. Lo commiteado = lo publicado.

Doble canal de "publicación":
1. **Código/páginas** → GitHub Pages (rama `main`).
2. **Datos JSON** → leídos en vivo desde `raw.githubusercontent.com/.../main/data/`.
   admin.html y editor.html escribíen esos JSON commiteando a `main` por la
   Contents API (token PAT en `localStorage`), así que se actualizan sin tocar el
   código.

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
