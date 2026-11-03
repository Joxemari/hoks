# BRAND.md — hoks · sistema de marca y voz

Identidad para web y redes. Complementa `CLAUDE.md` (§ Sistema de diseño 2026).
Se escribe una vez para **no repetir** las decisiones. Si cambia algo, cambia aquí.

## 0 · Arquitectura narrativa

- **Nombre del artista:** `hoks`.
- **Definición:** `code blacksmith` — lo que hace y cómo trabaja; no sustituye el
  nombre del artista.
- **Descriptor principal:** `forging algorithms into matter`.
- **Tesis:** `code proposes. geometry translates. matter negotiates.`
- **Secuencia:** `code → geometry → matter`.
- **Metáfora productiva:** `production lines that repeat a process, not a result`.
- **Conflicto:** artefacto, sistema y el tránsito entre ambos.
- **Pregunta:** `where does the work reside — in the artifact, in the system, or
  in the passage between them?`

`code blacksmith` describe el proceso, no impone una estética literal. No usar yunques,
martillos, fuego, Matrix, cyberpunk, steampunk ni futurismo tecnológico genérico.
La voz debe sentirse material, silenciosa, precisa y museística.

### Arquitectura anterior → actual

| capa | anterior | actual |
|---|---|---|
| nombre | `hoks` | `hoks` |
| definición | `hand coded goods` | `code blacksmith` |
| secuencia | `code · manufacturing · art` | `code → geometry → matter` |
| producción | líneas que fabrican originales | líneas que repiten un proceso, no un resultado |
| conflicto | imagen / sistema | artefacto / sistema / tránsito |
| pregunta | qué hace la obra | dónde reside la obra |

Se conservan el sistema como núcleo, el azar controlado, la selección, el descarte
y `the visible is only a shadow: the residue of a system thinking`. La nueva
arquitectura amplía la anterior hacia la traducción y la materia; no borra su base.

## 0.1 · Método

1. define a system
2. generate possibilities
3. select an iteration
4. translate into fabrication
5. allow matter to intervene

Las tensiones recurrentes son `digital / physical`, `precision / imperfection`,
`algorithm / intuition`, `infinite computation / finite matter` y
`machine / craftsman`. La fórmula breve es: `perfect systems / imperfect matter`.

## 1 · Tipografía — dos voces

- **Display → `--geo`**: League Spartan. Stack:
  `"League Spartan","Century Gothic",Futura,"Trebuchet MS",system-ui,sans-serif`
- **Mono / operativa → `--mono`**: **NO Courier New** (era la voz vieja). Stack:
  `ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace`
- **Reparto:** display = nombres de familia, títulos, la obra. mono = código,
  datos, captions, **la notación**. (La auditoría de 2026 retiró Courier New de
  todo lo servido; queda solo en `bzrs.html` congelada y en `sketches/`+`_preview/`.)

## 2 · Color (tarjetas de redes)

- Fondo **`--blue` #000ef7** · texto/marca **`--acid` #dcff32** · sintaxis **blanco #fff**.
- Convención de tarjeta azul: fondo azul, contenido en acid, **etiquetas/tags en blanco**.

## 3 · Lenguaje: p5 / JavaScript (único)

Todo el copy de marca habla **p5.js**. Nada de HTML salvo el par `<p>…</p>` como
marco de "voz documento" cuando enmarca texto. **El código describe la obra, no
decora** — se elige el idiom VERDADERO de cada pieza.

Banco (rota, no repitas siempre `//`):

| idiom | qué dice |
|---|---|
| `setup()` | el origen, corre una vez → intro / manifiesto |
| `function draw()` | una ejecución = una obra → firma, pieza |
| `noLoop()` | corre una vez y para · **no se guardan dos** → cierre |
| `redraw()` | genera otra → GIF assembling |
| `loop()` | corre sin parar → una pregunta que no se resuelve |
| `randomSeed(n)` | la semilla de la pieza → **el sello** |
| `random(palette)` | el azar que elige color → paletas |
| `noise()` | el campo orgánico → fondos, mesh |
| `lerp()` / `lerpColor()` | interpolar → mesh gradient |
| `for (let d…)` | subdivisión / repetición → KRRTK, DTK |
| `beginShape() … endShape()` | forma punto a punto → TRZS (la cinta) |
| `createCanvas(A3)` | el pliego / formato |
| `// aside` · `/* bloque */` · `const seed = n` · `console.log()` | palabras humanas dentro del código |
| `→` produce · `·` datos · `===` identidad | glifos |

## 4 · Caja y ortografía

- **Minúscula SIEMPRE** en el texto visible y el código. (El código es minúscula;
  es la voz sobria, sistémica; el wordmark `hoks` y `code blacksmith` son
  minúscula.)
- **MAYÚSCULA solo** para nombres de familia usados como etiqueta: `PLLS`,
  `KRRTK`, `DTKRT`.
- `randomSeed` respeta su **camelCase** real (es la función de p5); lo demás, minúscula.
- Los metadatos invisibles y legibles por máquinas (`JSON-LD`, Schema.org) siguen
  la ortografía convencional y pueden usar términos taxonómicos como
  `Computational artist`. No constituyen voz de marca: la definición pública y
  visible continúa siendo `code blacksmith`.

## 5 · Cuentas y assets

- Instagram **@hoks.art** · X **@hoksart**. Definición: **code blacksmith**.
- Avatar: monograma acid sobre azul (`avatar-monogram.png`). Cabecera X:
  `x-header.png`. Tarjeta de compartir / OG: `preview.jpg`.
- Bio (EN): `code blacksmith · forging algorithms into matter / code → geometry
  → matter / donostia ↔ san francisco`.
- **El link vive SOLO en la bio.** Nunca en el pie (IG no lo hace clicable).
  Dominio: **`hoks.design`** (comprado en Namecheap; apunta a GitHub Pages).

## 6 · Reglas de publicación

- **Pie = palabras. Hashtags = primer comentario** (uno solo, escrito por la cuenta).
- **Un idioma por post del día**; el manifiesto **fijado** es trilingüe (EN/ES/EUS,
  orden fijo — elegir uno y mantenerlo).
- **AI label: OFF** — arte generativo/algorítmico escrito a mano, no contenido IA.
- Location `Stanford University` como guiño (opcional).

## 7 · El grid

- **Masthead (fila de apertura, 3 posts FIJADOS)** en orden de pineo
  `draw → hoks → loop`:
  `function draw(){ code blacksmith }` · logo hoks · `<p> loop() … ¿pregunta? </p>`.
  Pinear los tres clava la cabecera; la obra fluye por debajo sin romperla.
- **Filas de obra:** 1 familia = 1 fila. col1 pieza acabada · col2 GIF *assembling*
  · col3 detalle.
- **Sello de pieza:** `randomSeed(4827) · PLLS · A3 · 1/1`.
- IG pone lo último arriba-izquierda → **sube de derecha a izquierda** para
  componer cada fila.

## 8 · Formato de imagen (IG 3:4)

El perfil móvil actual muestra el grid en **3:4 vertical**. Un archivo 4:5 se
recorta lateralmente en la miniatura y rompe las uniones de un tríptico.

- **Filas de obra y trípticos → 1080×1440 (3:4).** Es el máster de composición
  para el grid; cada panel se comprueba unido a los otros dos antes de publicar.
- **Feed 4:5 → 1080×1350** solo cuando la pieza no depende de una unión entre
  tiles. No reutilizar un 4:5 para una fila compuesta.
- **La obra va matada sobre fondo** (papel o azul) con margen, para que el grid
  **nunca** corte lo que importa. Una pieza cuadrada a pelo pierde arriba y abajo.
- Stories / Reels verticales → 1080×1920 (9:16).
- Instagram pone lo último arriba-izquierda: una fila se publica
  **derecha → centro → izquierda** y se verifica en el perfil móvil.
- Todo esto lo ejecuta **`_social/kit.js`** (§9). Si una salida no pasa por ahí,
  no cumple esta sección.

## 9 · Sistema de publicaciones

Una regla, todas las salidas. La maqueta vive en **`_social/kit.js`**
(`HOKSPOST`), componente único como `palette-picker.js`: lo usan `post.html`
(la herramienta del día), `_social/harness.html` + `make-videos.mjs` (los
vídeos de estudio) y cualquier agente que prepare un post. La hoja de
especímenes es **`_social/kit.html`**: abre, elige familia y seed, y enseña
cada plantilla con una obra real. Antes había cuatro formatos para la misma
fila (3:4 aquí, 4:5 en `post.html`, 1:1/9:16 en `_social`, y las rutinas
estirando el borde de la obra); eso es lo que esta sección cierra.

**Tokens** — los de §1–2: papel `#fbfbfa`, tinta `#0a0a0a`, azul `#000ef7`,
acid `#dcff32`, gris `#8a8983`. Mono para todo lo que se escribe en la imagen.
Ninguna plantilla usa display: en redes la tipografía grande es la obra.

**Formatos**

| clave | medida | para qué |
|---|---|---|
| `row` | 1080×1440 · 3:4 | **máster**: las tres casillas de una fila |
| `feed` | 1080×1350 · 4:5 | post suelto que no forma fila |
| `story` | 1080×1920 · 9:16 | stories / reels |
| `x` | 1600×900 · 16:9 | tarjeta de X |

**Plantillas**

- **pieza** — la obra matada sobre papel (o azul) con un margen del **11 % del
  lado corto**: el mismo aire que las familias dejan dentro de su campo
  (`E.FIELD_MARGIN`), así la obra se retira de la página lo mismo que de su
  papel. Cualquier proporción cabe; un PLLS horizontal sigue horizontal.
  Debajo, la **cartela**: el sello (§7) en mono, pegado a la obra y alineado a su
  canto izquierdo, como una etiqueta de sala. `randomSeed` y la seed en tinta (o
  acid sobre azul), el resto en gris (o blanco).
- **montaje** — el vídeo *assembling* en la misma maqueta que la pieza, **sin
  cartela**. Su portada es un fotograma **a medio montar**: si fuera el último,
  la fila tendría dos casillas gemelas.
- **detalle** — a sangre, sin margen ni cartela: enseña la materia (grano,
  canto, cruce), no la composición. Recorte del 56 % del lado de la obra.
- **notación** — tarjeta azul, palabras en acid, sintaxis en blanco, comentario
  `//` en blanco atenuado. Masthead y posts de pensamiento (§3, §7).
- **comprobación de fila** — las tres casillas como las enseña el perfil. No se
  publica: se mira antes de subir.

**La obra no se amplía.** El algoritmo se renderiza al tamaño exacto que pide
la maqueta (`HOKSPOST.srcSize`): la pieza a su caja, el detalle lo bastante
grande para que el recorte salga a 1:1. Un PNG guardado de 600 px solo vale
para archivo; para publicar se vuelve a pintar desde su receta.

**Pie y primer comentario** — una línea de la casa (`HOKSPOST.LINES`, elegida
por la seed, así el mismo post da siempre el mismo pie) + salto + sello. Los
hashtags, **un solo juego** (`HOKSPOST.TAGS`), van en el primer comentario:
`#generativeart #creativecoding #genart #handcodedgoods`.

**Antes de publicar una fila**

1. Las tres casillas salen del kit en `row` y con el mismo fondo.
2. La pieza viene de su receta (seed + paleta + algoritmo), no de un PNG ampliado.
3. La comprobación de fila se ve como una sola cosa.
4. Pie con sello; hashtags aparte.
5. Se sube detalle → montaje → pieza y se mira en el perfil móvil.

## Apéndice · manifiesto canónico (post de lanzamiento, trilingüe)

```
// hoks — code blacksmith

// EN
// forging algorithms into matter.
// i build production lines that repeat a process, not a result.
// the visible is only a shadow: the residue of a system thinking.
// code proposes. geometry translates. matter negotiates.
// where does the work reside — in the artifact, in the system,
// or in the passage between them?

// ES
// forjando algoritmos en materia.
// construyo líneas de producción que repiten un proceso, no un resultado.
// lo visible es solo una sombra: el residuo de un sistema que piensa.
// el código propone. la geometría traduce. la materia negocia.
// ¿dónde reside la obra — en el artefacto, en el sistema
// o en el tránsito entre ambos?

// EUS
// algoritmoak materian forjatuz.
// emaitza bat ez, prozesu bat errepikatzen duten produkzio-lerroak eraikitzen ditut.
// ikusgai dena itzal bat besterik ez da: pentsatzen ari den sistema baten hondarra.
// kodeak proposatzen du. geometriak itzultzen du. materiak negoziatzen du.
// non bizi da obra — artefaktuan, sisteman, ala bien arteko igarobidean?

function draw() {
  randomSeed(seed)   // same seed → same world · no two are kept
}
```
