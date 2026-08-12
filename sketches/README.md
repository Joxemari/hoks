# sketches/ — la sala de máquinas

**Aquí no se crea: aquí se endurece.** La creación vive en **p5.js /
OpenProcessing** — ese es el estudio, el espacio fluido donde nacen y se
exploran los conceptos. Esta carpeta es la fundición que convierte un boceto
ya maduro en la pieza de producción: canvas 2D puro, determinista, con una
sola fuente de código por obra. Normalmente la opera Claude, no tú.

## El flujo real

1. **Crear** — bocetas en OpenProcessing (p5, sin restricciones, sin ceremonia).
   Iteras ahí hasta que el sistema tiene su gramática.
2. **Graduar** — le pasas el sketch a Claude: *"gradúa esto"*. Claude lo porta a
   `sketches/<obra>/algo.js` (canvas 2D, `HOKS.Rng` sembrado), monta el harness
   y **verifica la equivalencia** (mismo seed → misma imagen; si porta desde una
   página ya en producción, con prueba op-a-op contra el motor original).
3. **Validar** — abres el harness, pulsas `g` y miras la **hoja de contactos**:
   12 seeds a la vez. Ahí es donde tu ojo decide — variaciones feas, repetitivas
   o rotas se ven en la distribución, nunca en una pieza suelta.
4. **Publicar** — la página de producción (`/<obra>.html`) consume el mismo
   `algo.js`. Push a `main` y está en la web.

Tú tocas los pasos 1 y 3. El 2 y el 4 son mecánicos: delégalos.

## Por qué existe

Un bug histórico de PLLS (acabados invisibles) vivió meses porque el algoritmo
estaba copiado 8 veces inline. Con fuente única, un arreglo en `algo.js` llega a
la vez al laboratorio y a producción. Ese es todo el trabajo de esta carpeta:
**que la obra exista una sola vez.**

## Estructura

```
sketches/
  _engine.js        ← motor compartido: Rng, color, mesh gradient, grano, paletas.
                      Una sola fuente: arréglalo aquí una vez.
  _lab.js           ← piezas comunes del harness: selector de obra (salta de
                      familia conservando la seed) y selector de paleta sobre
                      ../../palette-picker.js. Lista GRADUATED de obras.
  _batch.js         ← lotes: la selección se hace aquí, sobre la hoja de
                      contactos. Un lote es una lista de RECETAS
                      (obra + seed + params), no de imágenes.
  _wall/            ← el MURO: la pieza a escala sobre una pared. Página aparte,
                      se abre desde el enlace del panel y recibe la receta por
                      URL. Solo tiene mandos que NO cambian la obra.
  _template/        ← esqueleto para graduar una obra nueva
  plls/            ← graduada (algo.js + harness)
  krrtk/           ← graduada (porte fiel, verificado op-a-op)
  dtk/             ← graduada (porte fiel, verificado op-a-op)
  dtkrt/            ← EN PRUEBAS: familia nueva, aún sin página de producción
```

`dtkrt/` es el único caso hasta ahora de obra que **nace aquí** en vez de portarse
desde p5: propuesta de sistema para mirar en hoja de contactos antes de decidir si
merece página. No está en `data/works.json` ni publicada.

Cada obra expone el mismo contrato:

```js
HOKS.<OBRA>.render(ctx, W, H, seed, opts)  // dibuja; devuelve datos para traits
HOKS.<OBRA>.traits(res)                     // { list:[…], overall }
```

Reglas del contrato: función pura de canvas 2D, **determinista** (mismo `seed` →
misma imagen; siempre `new HOKS.Rng(seed)`, nunca `Math.random()` — el grano del
motor es la única excepción), sin DOM, sin p5. `opts.params` lleva los overrides
del laboratorio (grain, threshold…); producción no los pasa, así que los
defaults **son** el comportamiento publicado.

Y una regla más, que es la que hace posibles los formatos y la impresión:
**el algoritmo no da por hecho ni la proporción ni la resolución.** Toda medida
sale de `W`, `H` o `min(W,H)`; las pocas constantes en píxeles se escalan por
`E.unit(W, H, REF)`, donde `REF` es el lado corto de referencia de la obra. Con
eso, la misma seed da la misma composición en cuadrado, vertical y horizontal, y
la de pantalla es exactamente la que sale a 300 dpi sobre un A1 — no un
reescalado, el mismo dibujo hecho más grande.

## Formatos y tamaño de impresión

El motor da la parte común (`HOKS.fmtDims`, `previewDims`, `printDims`,
`mountFormat`, `exportPrint`):

El **campo** es otra decisión, no la misma: `params.field` = `sheet` (llena el
pliego) o `square` (se compone cuadrado y se centra en él). Y el **fondo**
(`params.bg`: `auto | solid | gradient`) más el grano son ajustes transversales
— son lo que antes justificaba una familia "G" aparte, y por eso ya no hay G.

| formato      | proporción | en papel                                  |
|--------------|-----------|-------------------------------------------|
| `square`     | 1:1       | lado corto del pliego (A3 → 297×297 mm)   |
| `vertical`   | 1:√2      | el pliego entero, de pie                  |
| `horizontal` | √2:1      | el pliego entero, tumbado                 |

Pliegos: A4, A3 (por defecto), A2, A1, siempre a 300 dpi. Un A3 horizontal son
4961×3508 px; un A1 vertical, 7016×9933. El PNG de impresión **se vuelve a
renderizar** fuera de pantalla a ese tamaño; el lienzo de la página es solo la
vista previa (lado corto 760 px, que es también lo que se guarda en la galería).

**A0 existe en la tabla `SHEETS` pero NO en `SHEET_IDS`**, que es lo que exporta
el lote: solo lo enseña el muro (`WALL_SHEET_IDS`). A 300 dpi un A0 horizontal
son 14043×9933 px — 139,5 Mpx y 532 MB de lienzo. Sale en Chromium (13,5 s, PNG
de 10,7 MB) pero queda por encima del techo de área de canvas de otros
navegadores, así que exportarlo pide antes decidir su dpi: a 150 son 34,9 Mpx y
1,8 s, y a esa distancia de lectura no se nota. Mirar un A0 es gratis;
imprimirlo, no.

En el harness, el desplegable *Format* cambia la proporción de la vista única y
de la hoja de contactos: mirar 12 seeds en vertical es la manera de saber si la
obra aguanta ese formato antes de imprimirla.

## El muro (`_wall/`)

Cuánto mide la obra no se ve en pantalla, y el pliego es una decisión que hoy no
se juzga en ningún sitio. El muro pone la pieza a escala sobre una pared, con
figura de 1,70 m, eje de colgado a 1,45 m y regla en cm; su segunda vista pone
los cinco pliegos en la misma pared, que es donde de verdad se decide.

Vive en **su propia página a propósito**. El laboratorio decide QUÉ se genera;
el muro solo dice DE QUÉ TAMAÑO es el objeto que sale. Aquí solo hay mandos que
no cambian ni un píxel — pliego, ancho de pared, referencias —, y todo lo que sí
mueve la imagen (seed, formato, paleta, params) llega por URL y es de solo
lectura. Meter esos mandos en el panel del harness habría convertido los
parámetros de generar en un cajón con parámetros de mirar.

Lo que viaja es la **receta**, la misma que ya usan los cinco harnesses y
`_batch.js`, serializada entera: un parámetro nuevo en una obra llega al muro sin
tocar nada. El enlace lo pone `HOKSLAB.mountWallLink()` — una línea por harness —
y recalcula el `href` al posarse encima, no en cada refresh, para seguir siendo
un enlace de verdad.

```
../_wall/?r=<receta JSON urlencoded>            ← lo que pone el enlace del panel
../_wall/?work=dtkrt&seed=123&fmt=horizontal    ← forma legible, a mano
```

## Usar el harness (paso 3)

Con servidor local (para que el `fetch` de paletas no choque con `file://`):

```bash
python -m http.server      # → http://localhost:8000/sketches/<obra>/
```

También publicados: `https://joxemari.github.io/hoks/sketches/<obra>/`.

| tecla     | acción                                  |
|-----------|------------------------------------------|
| `Espacio` | nueva seed aleatoria                     |
| `←` / `→` | seed − 1 / seed + 1                      |
| `g`       | hoja de contactos ↔ vista única         |
| `a`       | añadir la pieza actual al lote abierto   |
| `s`       | guardar PNG                              |

## Lotes (paso 3, la parte que importa)

Mirar doce y quedarte con dos **es** el trabajo, así que apartar una pieza es un
gesto de aquí: el `+` sobre cualquier miniatura de la hoja de contactos, o `a`
en vista única. Va al lote abierto, que eliges en el panel.

Un lote guarda **recetas** —`{obra, seed, params, palSel}`—, no imágenes. Como
el algoritmo es determinista la receta *es* la pieza: pesa bytes, se reabre tal
cual estaba (clic en la miniatura del lote) y se exporta a cualquier resolución,
incluida la de impresión. Los píxeles se fabrican al exportar.

Un lote puede **mezclar obras**: es una idea (una serie, una expo), no una
carpeta de familia. Vive en `data/batches.json`, commiteado con el token de
admin, así que sobrevive al navegador.

Si una paleta guardada como *aleatoria* deja de resolverse igual —porque la
lista de paletas cambió—, la miniatura sale **marcada en rojo**: la receta ya no
reproduce lo que viste. Es deriva, no un error.

Los sliders son de exploración: producción usa siempre los defaults.

## Graduar una obra nueva (lo que hace Claude en el paso 2)

1. Copiar `_template/` a `sketches/<obra>/`; renombrar `HOKS.TEMPLATE` →
   `HOKS.<OBRA>` y portar el `draw` de p5 a canvas 2D dentro de `render()`.
   Al portar, cambiar todo lo que dependa del ancho por `min(W,H)` y todo px
   absoluto por `px * E.unit(W, H, REF)`.
2. En el harness: `const WORK = HOKS.<OBRA>;`, el `BASE` (lado corto) y el
   `FORMAT` de partida de la obra.
3. Verificar: `node --check`, y si reemplaza un motor existente, prueba de
   equivalencia (log de operaciones de canvas idéntico para N seeds).
4. En la página de producción: cargar `_engine.js` + `algo.js` y delegar
   `draw()` en `HOKS.<OBRA>.render/traits`. Nada de motor inline.

Nada está publicado hasta el push a `main`; se puede probar y revertir sin
miedo (ver CLAUDE.md).
