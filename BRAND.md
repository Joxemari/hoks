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

## 8 · Formato de imagen (IG 4:5)

Instagram muestra el grid y el feed en **4:5 vertical** (desde 2024, universal).
Una imagen cuadrada se **recorta** a 4:5 en la miniatura.

- **Todas las tarjetas y posts de obra → 1080×1350 (4:5).** Llenan el tile sin recorte.
- **La obra va matada sobre fondo** (papel o azul) con margen, para que el grid
  **nunca** corte lo que importa. Una pieza cuadrada a pelo pierde arriba y abajo.
- Stories / Reels verticales → 1080×1920 (9:16).

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
