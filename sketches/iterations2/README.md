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

**Ningún detector cuenta hasta que dispara con código roto a propósito.** Dos
controles: invertir el orden de pintado entero (todos los cruces deben salir
mal) y dejarlo intacto (ninguno). Un detector que sólo sabe decir cero no
distingue "no hay defectos" de "no miro donde toca".

Estado sobre 60 obras · 154 cruces, con la sonda sub-píxel:

| | |
|---|---|
| cruces sanos | 145 |
| **a medias** | **6 (3,9 %)** |
| **sin corte** | **3 (1,9 %)** |
| cruce invertido entero | 0 de 102 |
| remate soldado a otra hebra | 0 de 40 obras |
| incisión injustificada | 7 px por obra |

El detector anterior de cortes daba **1,3 % a medias y 0 % sin corte**, y las
dos cifras eran falsas: cantaba un defecto donde la incisión estaba entera
(seed 559686731 — fondo puro de lado a lado a resolución de píxel) y se comía
nueve que sí lo eran. Muestreaba tres alturas con un umbral duro; la incisión
mide 3,3 px sobre 900 y los píxeles mezclados la despistaban en las dos
direcciones. La sonda actual mide, en cada punto **a lo ancho** de la hebra de
abajo, cuánto se acerca al fondo el píxel más claro a cada lado del cruce.

**Ese 3,9 % / 1,9 % tampoco es de fiar.** El detector marca mal en proporción
directa a lo rasante que sea el cruce:

| ángulo | cruces | marcados |
|---|---|---|
| 38–45° | 5 | 2 (40 %) |
| 45–55° | 14 | 3 (21 %) |
| 55–70° | 46 | 2 (4 %) |
| 70–90° | 84 | 0 |

Monótono perfecto: firma de artefacto de medida, no de defecto. Dos de los
nueve se han mirado a ojo (seeds 250815244 y 617742974, ambos en obras que
pasan las ocho puertas) y **los dos tienen la incisión entera a los dos
lados**. En un cruce rasante la zona de solape es un rombo largo y el sondeo
por rectas se pierde.

Medir esto con rayos y umbral de color no da más de sí. Lo que hace falta es
comparar el render contra la geometría esperada del halo, no caminar líneas.

### El fallo que sí es real

Seeds para los que **ningún** tejido pasa las ocho puertas: 2 de 60. Ahí se
dibuja el menos malo y sale agolpado. No es un fallo de selección —enumerando
los 22 candidatos, `generate()` devuelve justo uno de los que pasan cuando
existe— sino que para esos seeds no existe ninguno.

Se probó dejar bajar a **una vuelta** como último recurso: rescata los 2, pero
**se revirtió**. Un tejido de una vuelta con cero cruces cumple todas las demás
puertas *al vacío* —sin cruces no hay separación, ni volteos, ni ciclos, ni
remates que medir— y se convierte en el óptimo degenerado: 28 obras de 60 se
derrumbaron a una vuelta. Añadir una puerta de cruces mínimos lo empeoró (43
de 60), porque el desempate cuenta cuántas puertas incumple cada tejido y el
degenerado incumple **una** mientras que un nudo de verdad incumple dos.

La lección: las puertas son todas condiciones *sobre los cruces*, así que un
tejido sin cruces las gana todas. Arreglarlo pide rediseñar la puntuación, no
un parche.

**El cruce invertido ya se mide**, y está validado: con el orden de pintado
invertido dispara en 52 de 54 cruces. Lo que sigue sin validar es su
sensibilidad al caso de **medio lado** — el control para eso no llegó a
reproducir el fallo.

## Pendiente

- Los extremos de la cinta no se leen: empiezan y acaban a hueso en cualquier
  sitio. En un tejido, principio y final son un acontecimiento.
- Las familias (`diagonal`, `compact`, `open`, `returning`, `cross`) se
  distinguen poco: con 3 vueltas rotadas convergen al mismo tipo de nudo.
- Sin traits ni rareza — hace falta para que sea una obra de hoks y no un sketch.
- Sin grano. Las tres series activas lo llevan; hay que decidir si entra en esa
  familia visual o se declara aparte.
