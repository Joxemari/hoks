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
  _lab.js           ← piezas comunes del harness: selector de obra (salta de
                      familia conservando la seed) y selector de paleta sobre
                      ../../palette-picker.js. Lista GRADUATED de obras.
  _batch.js         ← lotes: la selección se hace aquí, sobre la hoja de
                      contactos. Un lote es una lista de RECETAS
                      (obra + seed + params), no de imágenes.
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
2. En el harness: `const WORK = HOKS.<OBRA>;` y la resolución de producción.
3. Verificar: `node --check`, y si reemplaza un motor existente, prueba de
   equivalencia (log de operaciones de canvas idéntico para N seeds).
4. En la página de producción: cargar `_engine.js` + `algo.js` y delegar
   `draw()` en `HOKS.<OBRA>.render/traits`. Nada de motor inline.

Nada está publicado hasta el push a `main`; se puede probar y revertir sin
miedo (ver CLAUDE.md).
