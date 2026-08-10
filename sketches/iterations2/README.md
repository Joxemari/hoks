# iterations2 — obra en curso (sin nombre)

**No está graduada.** Esto es el sketch de p5 que se pega en OpenProcessing, no
producción. No hay página de obra, no entra en `works.json`, no se publica.
Vive aquí solo para no perderlo entre sesiones.

Una cinta continua recorre el marco **varias veces**; al volver a entrar se cruza
con lo que ya dejó escrito. La profundidad no es el orden de dibujo: se decide
**cruce a cruce**, alternando encima/debajo como un diagrama de nudo.

## Estado

Fase 2. Determinista (`seed` → imagen). Un solo archivo, `sketch.js`: núcleo
generativo + UI de laboratorio. Se pega entero en OpenProcessing.

| tecla | acción |
|---|---|
| `espacio` | nueva composición |
| `←` / `→` | seed ∓ 1 |
| `g` | hoja de contactos (12) |
| `s` | guardar PNG |

El PNG se guarda desde un buffer cuadrado de 1000×1000, no desde el lienzo con
la UI: el export no lleva la banda del panel.

Las paletas se leen en vivo de `data/palettes.json` por `raw.githubusercontent`,
con un juego embebido de respaldo. Las paletas de hoks son listas planas sin
roles, así que el reparto se decide por luminancia: fondo en un extremo, cinta
con el mayor contraste contra él, discos con el resto.

## Restricciones materiales

Una cinta no se pliega más corto que su anchura, no gira sobre sí misma y no se
acuesta sobre su propio cuerpo. No son filtros estéticos y **no descartan
piezas**: corrigen la geometría. Se iteran juntas porque se estorban — abrir un
pliegue acorta tramos, separar hebras cierra giros.

Cuando la trama queda demasiado apretada para que quepa la separación, **la cinta
adelgaza**. El material cede ante el nudo, no al revés. Esa es la garantía de que
el halo nunca falla.

## Métricas (para el triaje por lotes)

Cada composición reporta `cruces`, `gap`, `seg`, `giro`. No filtran nada: se
miden para que, al descartar por lotes, el patrón del descarte salga solo.

Estado del último lote de 24: `gap` mínimo 1.26 (el halo necesita 1.14), giro
mínimo 38°, cruces 6–25 (media 12.2). Quedan 2 de 24 con algún tramo más corto
que la anchura.

## Pendiente

- Los extremos de la cinta no se leen: empiezan y acaban a hueso en cualquier
  sitio. En un tejido, principio y final son un acontecimiento.
- Las familias (`diagonal`, `compact`, `open`, `returning`, `cross`) se
  distinguen poco: con 3 vueltas rotadas convergen al mismo tipo de nudo.
- Sin traits ni rareza — hace falta para que sea una obra de hoks y no un sketch.
- Sin grano. Las tres series activas lo llevan; hay que decidir si entra en esa
  familia visual o se declara aparte.
