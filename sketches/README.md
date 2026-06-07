# sketches/ — el laboratorio

Aquí se **desarrolla y pule cada obra**, separado de la web. Es donde vives el
90% del tiempo: iteras una obra visualmente (scrub de seeds, hoja de contactos,
parámetros en vivo) hasta que está lista, y solo entonces la "gradúas" a
producción.

Vanilla puro: canvas 2D + HTML. **Sin p5, sin Tweakpane, sin build.** (p5 lo
sigues usando libre para bocetar en OpenProcessing; cuando una idea cuaja, la
traes aquí ya en canvas 2D.)

## Estructura

```
sketches/
  _engine.js        ← motor compartido por TODAS las obras (RNG, color, mesh,
                      grano, paletas). Una sola fuente: arréglalo aquí una vez.
  _template/        ← clónalo para empezar una obra nueva
    index.html      ← harness de desarrollo (UI)
    algo.js         ← el algoritmo (función pura)
  pllsg/            ← ejemplo completo
    index.html
    algo.js
```

## El principio: una sola fuente por obra

`algo.js` **es** el algoritmo de la obra. Lo consumen dos sitios:

1. el **laboratorio** (`index.html`), que le pone la UI alrededor;
2. la **página de producción** (`/pllsg.html`, etc.), cuando la obra se gradúa.

Así un bug se arregla **una vez** (no en 8 copias inline, que es de donde venían
los fallos históricos de PLLSG).

`algo.js` expone:

```js
HOKS.<OBRA>.render(ctx, W, H, seed, opts)  // dibuja; devuelve datos para traits
HOKS.<OBRA>.traits(res)                     // { list:[…], overall }
```

Reglas: función pura de canvas 2D, **determinista** (mismo `seed` → misma imagen;
usa siempre `new HOKS.Rng(seed)`), sin tocar el DOM, sin p5.

## Cómo trabajar

Abre `sketches/pllsg/index.html` en el navegador. Mejor con un servidor local
(para que `fetch` de paletas no choque con `file://`):

```bash
python -m http.server      # luego abre http://localhost:8000/sketches/pllsg/
```

Atajos del harness:

| tecla     | acción                                  |
|-----------|------------------------------------------|
| `Espacio` | nueva seed aleatoria                     |
| `←` / `→` | seed − 1 / seed + 1                      |
| `g`       | hoja de contactos ↔ vista única         |
| `s`       | guardar PNG                              |

La **hoja de contactos** (`g`) es la clave para juzgar el sistema: no mires una
pieza, mira la distribución de 12 a la vez. Ahí detectas variaciones feas,
repetitivas o rotas. Los sliders (grano, arquetipo, nº de pills, grosor)
redibujan al instante.

## Empezar una obra nueva

1. Copia `_template/` a `sketches/<tu-obra>/`.
2. En `algo.js`: renombra el namespace (`HOKS.TEMPLATE` → `HOKS.<TUOBRA>`) y
   escribe tu `render`/`traits`.
3. En `index.html`: cambia `const WORK = HOKS.TEMPLATE;` por tu namespace (y la
   resolución `W/H` si tu obra no es cuadrada).
4. Itera hasta que te guste.

## Graduar a producción

Nada está en la web hasta que haces `push` a `main`; puedes probar y revertir sin
miedo (ver CLAUDE.md). Cuando una obra esté lista, su página de producción la
consume en vez de llevar el algoritmo duplicado inline:

```html
<!-- en pllsg.html, en lugar del motor inline -->
<script src="sketches/_engine.js"></script>
<script src="sketches/pllsg/algo.js"></script>
<script>
  function draw(seed) {
    const ctx = document.getElementById('c').getContext('2d');
    const res = HOKS.PLLSG.render(ctx, 1414, 1000, seed,
      { palettes, locked: _paletteLocked, lockedIdx: _lockedPalIdx,
        params: { grainScale: GRAIN_SCALE } });
    const t = HOKS.PLLSG.traits(res);   // pinta t.list / t.overall en la barra
  }
</script>
```

> El `algo.js` de PLLSG ya incluye la versión **correcta y completa** (con los
> acabados `blnd`/`chess`/`ribbed`, que en el `pllsg.html` actual quedaban
> invisibles por código duplicado). Graduarlo, además de unificar la fuente,
> arregla ese bug — y cambia el aspecto de la obra, así que decídelo viéndolo
> antes en el laboratorio.
