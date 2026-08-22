# AGENTS.md — hoks

Instrucciones para agentes que trabajen en este repo (Codex, y cualquier otro que
lea `AGENTS.md`).

**La documentación larga está en [`CLAUDE.md`](CLAUDE.md): qué es cada página, cómo
funciona el motor de las obras, el laboratorio, los datos y el despliegue. Léela
antes de tocar nada.** Aquí solo están las reglas que no se pueden ignorar y las
que un agente rompe sin darse cuenta. Complementos: [`BRAND.md`](BRAND.md) (marca y
voz) y [`sketches/README.md`](sketches/README.md) (flujo de graduación de una obra).

## Lo que es esto

Web de arte generativo bajo el alias **hoks**. Cada pieza nace de una *seed* y un
RNG determinista: el código es la obra, la imagen es su residuo.

## No hay build

HTML/JS vanilla. **Sin framework, sin bundler, sin `package.json`, sin paso de
compilación.** GitHub Pages sirve la raíz de `main`, así que **lo commiteado es
exactamente lo que se publica**.

- No instales dependencias ni añadas un gestor de paquetes. La única dependencia
  externa es la webfont League Spartan, que carga `nav.js`.
- No introduzcas módulos ES ni imports entre archivos del sitio: los scripts se
  cargan con `<script src>` y se comunican por globales (`HOKS`, `HOKSNAV`,
  `HOKSPAL`, `HOKSWORK`, `HOKSGEN`, `HOKSUSAGE`, `HOKSLAB`).
- No hay suite de tests ni linter. La verificación es visual (abrir la página) más
  las baterías propias de algunas familias (`sketches/*/verificacion/`) y
  `node tools/static.mjs --check` para el HTML derivado.

## Los datos viven en `data/`

Los JSON se leen **siempre** desde
`raw.githubusercontent.com/Joxemari/hoks/main/data/…?t=<timestamp>` (cache-bust), no
por ruta relativa: así un cambio de datos aparece sin esperar el redeploy de Pages.
Si escribes un `fetch` nuevo, sigue ese patrón.

> Los `*.json` de la **raíz** (`bzrs.json`, `dtk.json`, `krrtk.json`…) están vacíos
> (`[]`) y son restos heredados. No los uses ni los confundas con los de `data/`.

`data/works.json` es el registro de familias y su campo **`active` es el único
interruptor de la web**: decide qué sale en la landing, en el dropdown *Work* y con
sección propia. Activar una familia no requiere tocar código.

## Las páginas de familia son artefacto derivado

`plls.html`, `krrtk.html`, `dtk.html`, `dtkrt.html`, `eclps.html`, `trzs.html`,
`evol.html` son cascarones. Lo que hay **entre los marcadores**
`<!-- HOKS:AUTO-HEAD -->` y `<!-- HOKS:AUTO-BODY -->` lo escribe `static-gen.js`
desde `works.json`, y **nadie lo edita a mano**. Igual `sitemap.xml`.

- Para regenerar: `node tools/static.mjs`. Para comprobar que lo commiteado es lo
  que el generador produce hoy: `node tools/static.mjs --check`.
- Si cambias `works.json`, regenera y commitea el HTML derivado en el mismo cambio.
- `bzrs.html` no tiene marcadores: es la heredada congelada, escrita a mano. Déjala
  en paz.

## El algoritmo tiene una sola fuente

Las obras graduadas viven en `sketches/<obra>/algo.js`, **compartido entre
laboratorio y producción**. No lo copies a la página ni reimplementes una variante
"reducida". La tabla de demos que aún queda en `index.html` (PLLS, KRRTK, DTK,
BZRS) está para vaciarse, no para crecer.

Reglas del motor que un algoritmo no puede romper:

- **Determinismo**: mismo seed → misma imagen, siempre. Nada de `Math.random()`,
  `Date.now()` ni estado global dentro de un draw. Todo el azar sale de `Rng`.
- **Sin suponer proporción ni resolución**: toda obra existe en cuadrado, vertical
  y horizontal (1:√2), y se re-renderiza a tamaño de pliego para imprimir. Mide
  contra `W`, `H` o `min(W,H)`; escala las constantes en px con
  `HOKS.unit(W,H,REF)`.
- **La firma no la dibuja el código**. `sketches/_firma.js` solo *mide* el píxel ya
  renderizado y dice dónde cabe la firma a mano. Ningún `algo.js` la pinta.

## Componentes compartidos: tócalos ahí

Antes estaban copiados en ocho páginas con variantes distintas. Si cambias el
comportamiento, cámbialo en el archivo, no en la página:

| Archivo | Qué es |
| --- | --- |
| `nav.js` | Nav, footer, favicon, tokens `:root`, i18n (EU/ES/EN), `HOKSNAV.workHref()` |
| `palette-picker.js` | El selector de paleta, único en toda la web y el laboratorio |
| `work-page.js` | La página de obra graduada (la usan los cascarones y `work.html`) |
| `static-gen.js` | El HTML derivado y el sitemap (lo comparten `admin.html` y `tools/`) |
| `usage.js` | Registro de uso de paletas (`data/palette-usage.json`) |

`sketches/` **no carga `nav.js`**: cada harness define sus propios tokens.

## URLs publicadas

`krrtkg.html`, `dtkg.html`, `pllsg.html` y `pills.html` son redirecciones porque
esas URLs estuvieron publicadas. No las borres. Lo mismo con el `page` de las
familias veteranas en `works.json`.

## Secretos

El token de GitHub del panel vive en `localStorage` del navegador del admin.
**Nunca escribas un token, PAT o credencial en un archivo del repo** — es un sitio
público servido desde `main`.

## Commits

Commits pequeños y descriptivos, en castellano, en minúscula, con el área delante:
`lab: …`, `static: …`, `about: …`, `fix: …`. El historial es parte de la
documentación: di *qué* cambia y, si hace falta, por qué.

El flujo humano de este repo es push directo a `main`; un agente en la nube trabaja
por rama y PR, y eso está bien. Lo que no está bien es dejar el HTML derivado
desincronizado o abrir un PR con archivos generados a mano.

## Tono, si escribes texto

Sobrio, poético, con confianza en lo mínimo. El código y las reglas **son** el
motor conceptual: el código como gramática, las reglas como forma, lo visible como
residuo del pensamiento. Referencia: Elena Asins. No rompas el lenguaje visual ya
establecido (paleta sobria, mono, geometría + azar controlado).

## Code Review Rules

Lo que de verdad rompe este sitio, en orden:

**P0 — bloquea**

- Azar no determinista en un algoritmo (`Math.random`, `Date.now`, estado
  compartido entre draws): mata la relación seed → obra, que es la obra.
- Suponer proporción o resolución: constantes en px sin `HOKS.unit`, `800` en vez de
  `W`, algo que solo cuadra en horizontal. Se ve al imprimir a A2, no en pantalla.
- Editar a mano lo que hay entre `HOKS:AUTO-*`, o cambiar `works.json` sin
  regenerar (`node tools/static.mjs --check` falla).
- Leer `data/*.json` por ruta relativa en vez de `raw.githubusercontent.com`.
- Un token, PAT o secreto commiteado.
- Añadir build, bundler, framework o dependencia npm.
- Borrar una URL publicada o su redirección.
- Escribir en los `*.json` de la raíz creyendo que son la fuente.

**P1 — arréglalo**

- Duplicar un componente compartido, o reimplementar un `algo.js` en una página.
- Divergencia entre lo que hace el laboratorio y lo que hace la página de obra.
- Texto de UI nuevo sin pasar por i18n (`window.HOKSI18N`) en una página pública.
  La operativa interna —panel, rejilla de uso— va en inglés y fuera de i18n a
  propósito.
- Un cascarón nuevo sin sus dos pares de marcadores.
- Dibujar la firma desde el código.
- Meter mandos que cambian la imagen en `sketches/_wall/`: el muro solo mide.
- Base64 gordo o obra guardada añadida a mano a `data/<obra>.json` — eso lo publica
  el lote desde el laboratorio, que además apunta la paleta en
  `data/palette-usage.json`.

**No lo marques**

- Falta de tests, de tipos o de framework: es una decisión, no un descuido.
- `<style>` y `<script>` inline en las páginas: es la arquitectura.
- Comentarios y nombres en castellano o euskara.
- Preferencias de formato de código.
