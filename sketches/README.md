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

Un bug histórico de PLLSG (acabados invisibles) vivió meses porque el algoritmo
estaba copiado 8 veces inline. Con fuente única, un arreglo en `algo.js` llega a
la vez al laboratorio y a producción. Ese es todo el trabajo de esta carpeta:
**que la obra exista una sola vez.**

## Estructura

```
sketches/
  _engine.js        ← motor compartido: Rng, color, mesh gradient, grano, paletas.
                      Una sola fuente: arréglalo aquí una vez.
  _template/        ← esqueleto para graduar una obra nueva
  pllsg/            ← graduada (algo.js + harness)
  krrtkg/           ← graduada (porte fiel, verificado op-a-op)
  dtkg/             ← graduada (porte fiel, verificado op-a-op)
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

| formato      | proporción | en papel                                  |
|--------------|-----------|-------------------------------------------|
| `square`     | 1:1       | lado corto del pliego (A3 → 297×297 mm)   |
| `vertical`   | 1:√2      | el pliego entero, de pie                  |
| `horizontal` | √2:1      | el pliego entero, tumbado                 |

Pliegos: A4, A3 (por defecto), A2, A1, siempre a 300 dpi. Un A3 horizontal son
4961×3508 px; un A1 vertical, 7016×9933. El PNG de impresión **se vuelve a
renderizar** fuera de pantalla a ese tamaño; el lienzo de la página es solo la
vista previa (lado corto 760 px, que es también lo que se guarda en la galería).

En el harness, el desplegable *Format* cambia la proporción de la vista única y
de la hoja de contactos: mirar 12 seeds en vertical es la manera de saber si la
obra aguanta ese formato antes de imprimirla.

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
| `s`       | guardar PNG                              |

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
