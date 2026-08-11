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
| `n` | triaje: lote nuevo de 24 |
| `a` / `x` / `d` | (en triaje) va · fuera · duda |
| `p` | el patrón del descarte |
| `e` | exportar los veredictos en JSON |

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

## Triaje por lotes

No se filtra mientras se genera. `n` saca un lote de 24, se juzga una a una con
tres teclas —**va**, **fuera**, **duda**— y `p` enseña cómo se reparten los
rasgos entre lo que dejas y lo que tiras. El sistema no corrige nada: enseña el
patrón y decides tú si es tuyo o es ruido.

Dos reglas que hacen que esto sirva de algo:

- **La ficha se calla hasta que has votado.** Leer «sep 1.2» antes de mirar
  decide el veredicto por ti, y entonces el patrón que sale es el de los
  números, no el tuyo.
- **Cada veredicto se guarda con la versión del algoritmo.** Sin eso, un
  «perfecta» de hace tres iteraciones miente: la obra ya no sale igual. La
  versión es `rN.xxxxx` — `N` a mano cuando cambia el código, la huella sola
  cuando cambian los parámetros. Los mandos del laboratorio (vueltas, trazo,
  curvatura, esquinas, extremos) **no** cuentan como versión: son rasgos de la
  obra, y se guardan como tales.

Los veredictos viven en `localStorage` y salen en JSON con `e`. El corte de cada
rasgo se busca por Gini, no por diferencia de porcentajes: interesa el corte
**limpio**, no el que parte el lote en dos mitades.

## Métricas

Cada composición reporta `cruces`, `gap`, `seg`, `giro`, y el triaje guarda
además familia, paleta, secciones, volteos, juntas, separación entre cruces,
anchura y ocupación. Ninguna filtra nada.

Último lote de 40 (90 cruces): cruces mudos 0, sin corte 0, a medias 1 (1,1 %),
incisión injustificada 7 px de media por obra. Cruces por obra 3–6 — flojo
frente a los 6–25 de antes de exigir separación entre cruces.

**Lo que las métricas no ven: un cruce invertido.** Comprueban que haya corte,
no que esté en la hebra correcta. Los cuatro invertidos que se han corregido
los encontró el autor mirando, no el instrumental.

## Pendiente

- Los extremos de la cinta no se leen: empiezan y acaban a hueso en cualquier
  sitio. En un tejido, principio y final son un acontecimiento.
- Las familias (`diagonal`, `compact`, `open`, `returning`, `cross`) se
  distinguen poco: con 3 vueltas rotadas convergen al mismo tipo de nudo.
- Sin traits ni rareza — hace falta para que sea una obra de hoks y no un sketch.
- Sin grano. Las tres series activas lo llevan; hay que decidir si entra en esa
  familia visual o se declara aparte.
