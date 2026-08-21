# BRAND.md — hoks · sistema de marca y voz

Identidad para web y redes. Complementa `CLAUDE.md` (§ Sistema de diseño 2026).
Se escribe una vez para **no repetir** las decisiones. Si cambia algo, cambia aquí.

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

- **Minúscula SIEMPRE** en texto corrido y código. (El código es minúscula; es la
  voz sobria, sistémica; el wordmark `hoks` y `hand coded goods` ya son minúscula.)
- **MAYÚSCULA solo** para nombres de familia usados como etiqueta: `PLLS`,
  `KRRTK`, `DTKRT`.
- `randomSeed` respeta su **camelCase** real (es la función de p5); lo demás, minúscula.

## 5 · Cuentas y assets

- Instagram **@hoks.art** · X **@hoksart**. Strapline: **hand coded goods**.
- Avatar: monograma acid sobre azul (`avatar-monogram.png`). Cabecera X:
  `x-header.png`. Tarjeta de compartir / OG: `preview.jpg`.
- Bio (EN): `hand coded goods / generative systems · code as grammar, chance as
  form / Donostia ↔ San Francisco`.
- **El link vive SOLO en la bio.** Nunca en el pie (IG no lo hace clicable y el
  dominio va a cambiar — hoy `joxemari.github.io/hoks`, futuro `hoks.design`/`.art`).

## 6 · Reglas de publicación

- **Pie = palabras. Hashtags = primer comentario** (uno solo, escrito por la cuenta).
- **Un idioma por post del día**; el manifiesto **fijado** es trilingüe (EN/ES/EUS,
  orden fijo — elegir uno y mantenerlo).
- **AI label: OFF** — arte generativo/algorítmico escrito a mano, no contenido IA.
- Location `Stanford University` como guiño (opcional).

## 7 · El grid

- **Masthead (fila de apertura, 3 posts FIJADOS)** en orden de pineo
  `draw → hoks → loop`:
  `function draw(){ hand coded goods }` · logo hoks · `<p> loop() … ¿pregunta? </p>`.
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
// hoks — hand coded goods

// EN
// i build production lines that make only originals.
// what you see is a shadow — the residue of a system thinking.
// the essence is in what isn't shown: the discard, the void.
// a single question underneath:
// what makes the work — the image, or the system behind it?

// ES
// construyo líneas de producción que solo fabrican originales.
// lo visible es una sombra: el residuo de un sistema que piensa.
// la esencia está en lo que no se ve — en el descarte, en el vacío.
// y debajo, una pregunta:
// ¿qué hace la obra — lo visible o el sistema que hay detrás?

// EUS
// pieza bakarrak soilik ekoizten dituen produkzio-lerroak eraikitzen ditut.
// ikusgai dagoena itzal bat besterik ez da: sistema baten hondarra.
// mamia itzalean dago — baztertutakoan, hutsean.
// eta azpian, galdera bat:
// zerk egiten du obra — aurrean ikusgai dugunak ala atzean dagoen sistemak?

function draw() {
  randomSeed(seed)   // same seed → same world · no two are kept
}
```
