# _social — feed-fábrica

Vídeos para redes (Instagram / X / TikTok) generados **desde el algoritmo real**
de cada familia. No es parte de la web publicada: es utillería de estudio, como
`sketches/` o `_preview/`.

## Dos formatos

- **assembling** — una pieza se pinta sola: aparece el fondo y luego cada objeto,
  uno a uno. Es el mismo mecanismo del splash de la landing (se graban las
  llamadas de dibujo del `algo.js` y se reproducen en orden). Hipnótico, ~5 s.
- **iterations** — el sistema escupe seeds a cortes secos: muchas variaciones
  seguidas, la máquina produciendo. ~4 s.

Cada familia se saca en **3:4 maquetado** —la casilla de la fila del grid, con
la misma maqueta que la pieza— y a pantalla completa en **1:1** (X) y **9:16**
(Reels, Stories, TikTok), donde la obra es el fotograma.

La maqueta (márgenes, fondo, cartela, formatos) y el mecanismo del assembling
viven en **`kit.js`** (`HOKSPOST`), el sistema de diseño de las publicaciones.
Lo comparten este banco y `post.html`. Especificación: `BRAND.md` §9. Hoja de
especímenes: **`kit.html`**.

## Cómo se generan

Necesita, **solo en desarrollo**, Playwright (Chromium) y un `ffmpeg` con
`libx264`. La forma más simple del ffmpeg:

```
pip install imageio-ffmpeg      # trae un ffmpeg con H.264 + gif
node _social/make-videos.mjs ./social-out PLLS,KRRTK,DTKRT [SEED]
MAT=blue node _social/make-videos.mjs ./social-out TRZS     # fila sobre azul
```

Salida: `social-out/<familia>-<formato>-<aspecto>.mp4`. Los `.mp4` **no se
commitean** (pesan y se regeneran); son entregables para colgar, no código.

`harness.html` es el banco de render (carga `../sketches/*` y `kit.js`, y
expone `full / setup / step / resize / layout`); `make-videos.mjs` lo conduce
con Playwright, captura los fotogramas y los codifica.

## Publicar: `zernio.mjs`

Sube los activos del kit a [Zernio](https://zernio.com) y deja el post de
Instagram como **borrador** (o programado con `--at`) para aprobarlo allí.
Nunca publica directo. El pie va sin hashtags; los hashtags de la casa van solos
al primer comentario.

```
node _social/zernio.mjs accounts
node _social/zernio.mjs post pieza.png --caption pie.txt
node _social/zernio.mjs post pieza.png montaje.mp4 detalle.png --caption pie.txt --at 2026-11-10T19:00
```

Por API, Instagram acepta feed entre 4:5 y 1,91:1, así que para Zernio se
exporta en **`feed` 4:5**, no en `row` 3:4. El margen del 11 % absorbe el recorte
del perfil a 3:4 (unos 34 px por lado, todo papel).

## Estética

Sin texto, o el mínimo: que hablen el color y la obra (registro Judd / Oteiza).
El grano y el fondo vienen del propio `algo.js`, así que el vídeo es la obra —
no una animación aparte.
