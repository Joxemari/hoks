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
3. **Validar** — abres el harness, pulsas `g` y miras el **grid de obras**:
   12 seeds a la vez. Ahí es donde tu ojo decide — variaciones feas, repetitivas
   o rotas se ven en la distribución, nunca en una pieza suelta.
4. **Publicar** — marcar *Active* en el panel. Con eso la obra entra en la
   landing, en el dropdown *Work* y tiene sección: la página genérica
   (`work.html?w=<obra>`) consume el mismo `algo.js`. Un cascarón propio
   (`/<obra>.html`) es opcional y se apunta en `page`; las veteranas lo tienen
   porque sus URLs estuvieron publicadas.

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
                      ../../palette-picker.js. Lista GRADUATED de obras: las
                      abre TODAS, publicadas o no — `active` es cosa de la web,
                      no de la mesa. Las apagadas van marcadas.
  _batch.js         ← lotes: la selección se hace aquí, sobre la hoja de
                      contactos. Un lote es una lista de RECETAS
                      (obra + seed + params), no de imágenes.
  _wall/            ← el MURO: la pieza a escala sobre una pared. Página aparte,
                      se abre desde el enlace del panel y recibe la receta por
                      URL. Solo tiene mandos que NO cambian la obra.
  _mockup.js        ← el taller de fotografía: campos de pliegues, perspectiva
                      proyectiva, desplazamiento, sombras y grado. Lo que hace que
                      una maqueta parezca una foto es la LUZ, y está aquí.
  _objects/         ← las FOTOS: la obra sobre la cosa —pared, camiseta, vinilo,
                      reloj— para publicar. Salida a 1080 px, 4:5 por defecto.
                      Misma receta por URL, mismas reglas: aquí no se genera.
                      Las escenas, en su escenas.js.
  _template/        ← esqueleto para graduar una obra nueva
  plls/            ← graduada (algo.js + harness)
  krrtk/           ← graduada (porte fiel, verificado op-a-op)
  dtk/             ← graduada (porte fiel, verificado op-a-op)
  dtkrt/            ← publicada: la primera familia que nació aquí
  eclps/             ← publicada: la fila, con su pliego doble
  evol/             ← EN PRUEBAS: la ley del encuentro invertida. Ver su README
  hrrs/             ← EN PRUEBAS: la ley del encuentro esquivada — la cinta no se
                      cruza, se pone al lado. Con algo.js, harness y batería
                      propia. Ver su README y su verificacion/
  ptzd/             ← EN PRUEBAS: el bloque partido. La gramática se escribió
                      ANTES que el código, y el grid la corrigió. Ver su README
    entrenamiento/  ← el ojo, registrado: 100 lotes de 5, se eligen 2 de cada uno
                      y sale un patrón de preferencia sobre los rasgos. No se
                      publica; es instrumento. Ver su README
    verificacion/   ← el defecto, contado: cuñas sobre el píxel, el reparto contra
                      lo declarado y la huella a tres resoluciones. Lo que el
                      entrenamiento no puede decir. Tampoco se publica
  trzs/             ← graduada desde p5 (porte idéntico al píxel, verificado)
    verificacion/   ← los detectores del halo y sus controles rotos a propósito.
                      No se publica: se ejecuta a mano cuando alguien toca el
                      dibujo de la cinta. Ver su README.
```

`dtkrt/` fue el primer caso de obra que **nace aquí** en vez de portarse
desde p5: propuesta de sistema para mirar en el grid de obras antes de decidir si
merece página. No está en `data/works.json` ni publicada.

`eclps/` es el segundo, y llega igual: nace aquí. Una fila de círculos con paso
constante donde las ausencias hacen el ritmo — un eclipse es exactamente eso, un
disco que tapa a otro. Usa el harness compartido, está en `GRADUATED` y ya tiene
página (`eclps.html`) y entrada activa en `works.json`.

`evol/` es el tercero, y el primero que nace **de otra familia de aquí** en vez de
una idea suelta: es TRZS con la ley del encuentro invertida. Donde TRZS cruza —una
hebra por encima, otra por debajo, y el suelo entre las dos como una incisión— EVOL
**suelda**: los cuerpos se funden, no hay profundidad que ordenar, y el suelo solo
sobrevive donde la masa se cierra a su alrededor. Ese hueco cerrado es un **ojo**, y
los ojos son la obra.

Por eso es **más pequeña** que su madre: 975 líneas contra 2.344. Sin encima/debajo
no hay nada que proteger, así que se cae el diagrama de nudo, el plan de secciones,
el orden de pintado, el punzón y los detectores del halo — y el cuerpo puede
cruzarse consigo mismo cuantas veces quiera, porque se rellena. **Una sola llamada a
`fill()`.** Lo que TRZS gasta en la profundidad, EVOL lo gasta en el contorno (la
anchura va por niveles discretos, así que la masa engorda a escalones) y en el
vacío. Lo que sí hereda entero es el método: el tipo declara cuántos ojos quiere y
luego **se comprueban** sobre el dibujo, por campo de distancias e inundación desde
el borde — el mismo mapa de vacíos con el que TRZS coloca sus discos.

Registrada en `works.json` y **apagada** — se quedó en el laboratorio. Reformulada
desde los estratos a **la trama**: hebras en dos
direcciones que se cruzan y se sueldan, y el ojo es la celda que dejan al cruzarse
—cuadrangular, como los de la referencia, y no el huso que daba un lazo—. Ver
`evol/README.md` para el concepto, el filo (el canto vivo, que no toca la anatomía) y
las decisiones que quedan abiertas.

`hrrs/` es la tercera respuesta a la pregunta de TRZS —¿qué pasa cuando la cinta se
encuentra consigo misma?—, y la única que contesta **no se encuentra**: llega hasta
donde iba a tocarse y se pone al lado. TRZS **cruza** (una hebra por encima y la
incisión entre las dos), EVOL **suelda** (un cuerpo y el suelo atrapado en forma de
ojo), HRRS **acompaña**: entre las dos vueltas queda el suelo, en una franja del
mismo grosor en toda la obra.

Sin profundidad no hay halo, ni plan de secciones, ni orden de pintado: **un solo
`stroke()`**. Lo que en TRZS son 2.344 líneas y en EVOL 975, aquí son 700, y toda la
complejidad se va al recorrido — que es lo que queda cuando quitas la profundidad y
no hay nada detrás de lo que esconderse.

No es una cinta que se pliega sino **varios trazos independientes que no se tocan
nunca** y cuya relación —paralelo, abanico, tangencia, cabo contra cabo, cabo contra
cuerpo, suelto— **se declara y se construye**, no se espera a que salga sola. Cinco
u ocho por obra, encadenados: el tercero acompaña al segundo, que acompaña al
primero, y de ahí sale el haz.

La regla que la gobierna es NEGATIVA y es una sola: dos tramos que no comparten
vértice están a `W + g` o más. Y no se persigue con un relajador —`selfAvoid` no se
porta— sino que se cumple por construcción: el trazo no crece hacia donde no cabe.
De ahí sale gratis el cabo, que deja de decidirse: **el trazo se acaba donde ya no
cabe**, y por eso se pide ambicioso y se recorta en el punto exacto en vez de
rechazarse entero. Lo que fija la escala de la hoja es el primer trazo: los demás
caen desde lo que él **consiguió**, no desde lo que se le pidió.

Verificada con su propia batería (`hrrs/verificacion/`): 996 obras repartidas entre
catorce configuraciones, **cero** por debajo del canal, y cada detector con su
control roto a propósito. Uno de esos controles comprueba una afirmación del
algoritmo y no un detector: que el **bisel** es lo que hace suficiente a la regla —
con inglete, el pico de una esquina cruza el canal y suelda la obra.

No está en `works.json` ni publicada. Ver `hrrs/README.md`.

Y `ptzd/` sí está en `works.json`, con `active: false`: registrada para el panel y
para el laboratorio, y fuera de la web hasta que se marque la casilla.

`ptzd/` es el quinto, y es distinto de los cuatro anteriores en el método: **la
gramática se escribió antes que el código**, que es el paso que a `dtkrt/`,
`eclps/` y `evol/` les faltó por escrito. El bloque tiende al cuadrado sin serlo, y
unos cortes de anchura constante entran por los cantos, se ramifican y mueren unos
contra otros; las piezas que sueltan se apartan, alguna no vuelve, y la silueta es
lo que queda. Si KRRTK **parte** el cuadrado, PTZD lo **rompe**: la subdivisión
conoce el todo, y una grieta sólo conoce su punta.

Escribir la gramática primero salió a cuenta y no fue gratis: el ojo le añadió tres
reglas que el papel no vio —el **pulso** (sin irregularidad la familia se lee como
un render, pero el temblor tiene que ir sobre la geometría COMPARTIDA o el hueco
cambia de anchura y la obra se lee rasgada), **la que falta** (a la silueta de la
referencia no le sobran mordiscos: le faltan placas enteras) y **la carne** (lo que
queda entre dos blancos tiene que seguir siendo cuerpo: el hilo, la tira, la miga y
el ángulo en triángulo son cuatro nombres para el mismo defecto, así que los mide
una sola regla)— y le tumbó una docena de defectos con nombre. Ver
`ptzd/README.md` para las once reglas, las influencias contrastadas de las que sale
cada una, lo que el grid cambió y lo medido.

Y es la primera familia con **los dos instrumentos**: `entrenamiento/` mide el
gusto y `verificacion/` mide el defecto, que no es lo mismo y no se sustituyen. El
segundo salió del primero por las malas — la guarda que se comió las cuñas dejó al
20% de las obras sin llegar a los cortes de su tipo, y eso no se ve mirando obras:
se ve contando.

ECLPS es también la primera familia que existe en **un solo formato**: `double`, dos
pliegos apaisados uno al lado del otro (2√2:1). No es capricho ni límite técnico
—la obra se compone igual en cuadrado— es que una fila necesita recorrido: en
1:1 el trayecto de los centros da para dos o tres círculos y deja de ser una
fila. De ahí sale el mecanismo de formatos por familia.

### TRZS: el porte salió idéntico al píxel, y luego mejor

`trzs/` viene de `sketches/iterations2/` (p5). El porte quitó p5 entero —vectores,
azar, globales matemáticos— y **la imagen no se movió ni un píxel**: 200 obras de
200, en ocho configuraciones (los cuatro tipos, esquinas rectas y curvas, cuadrado
y apaisado).

Eso no fue suerte: **p5 y el motor usan el mismo LCG**. `p5.prototype._lcg` es
`(1664525·s + 1013904223) mod 2³²` dividido por 2³², que es exactamente
`HOKS.Rng`. Contrastado en el p5 vendorizado, no supuesto. Traducir sitio a sitio
—`random()`→`next()`, `random(a,b)`→`range(a,b)`, `random(arr)`→`pickFrom(arr)`—
conserva el stream, y con él la obra.

Y va **1,8× más rápido**: 40 obras a 900×900, mediana 378→211 ms en el tipo por
defecto y 1130→608 ms en la trama, cuyo peor caso baja de 4,9 s a 3,0 s. El p5
que quedaba estaba en el camino caliente, sobre todo `p5.Vector`.

La equivalencia se midió sobre el algoritmo y su dibujo. Lo que el contrato añade
—fondo del motor, grano, los tres formatos— es nuevo por definición y se verificó
aparte.

**Y desde ahí ya no es idéntica, a propósito.** Al portarla se encontró un hueco
en la incisión que p5 también tenía: la zona que impide poner una junta cerca de
un cruce medía `(W/2)/senθ × 1,20`, que cubre la huella del cruce pero **no el
sobresaliente con que el cuerpo se alarga en la junta**. Donde ese trozo de cinta
sin halo caía dentro de la incisión, la tapaba — hasta 26,5 px sobre una cinta de
66, el 40% de su anchura. Con el factor en **1,60** se cierra, sin coste medible:
las costuras se mueven un 1,4% y no se pierde ni un tejido.

El defecto no se veía porque el detector de la incisión promediaba la cobertura de
todo el anillo del cruce, y un hueco local se diluía. El que lo encontró no tiene
umbrales: camina los dos bordes de la hebra de arriba y, donde debajo hay cuerpo
de la otra, exige fondo; cuenta píxeles de **tinta sólida** seguidos. Un hueco es
un hueco.

Cuatro arreglos se probaron antes y perdieron, y los cuatro están medidos en el
código para que no se reintenten: solapar sólo la sección que pinta después,
alargar el halo de las dos en la junta, reducir la pizca del solape, y —descartado
midiendo— que hubiera cuerpos solapados sin cruce registrado.

Los detectores que encontraron todo eso están commiteados en
`trzs/verificacion/`, con sus controles rotos a propósito y las once trampas que
dieron defectos inexistentes. Se ejecutan a mano cuando alguien toca el dibujo de
la cinta.

**Y el final de la cinta también lleva incisión.** El halo del cuerpo se traza
con cabo a hueso, así que se acaba justo donde se acaba la cinta: la cara del
final era el único filo de la obra sin corte, y cuando caía contra otra hebra las
dos tintas se tocaban y se leían como una sola pieza. La holgura sólo está
garantizada frente a las huellas de cruce, no frente a una vecina que pasa de
largo, así que el caso no era raro: 22 de 60 obras de tres cintas y 13 de 60 de
dos. El remate en inglete o redondo llevaba el mismo problema, y ahí el halo ya
se había intentado una vez y se retiró porque traía de vuelta la costura de 1 px.
No era el halo: era el ORDEN. Se pintaba detrás de la tinta del cuerpo, y ahora
va con los demás halos.

**Y el salto no es una esquina.** La curva redondeaba todos los vértices
interiores, y el vértice de un salto es el final de una cinta y el principio de
otra: redondeándolo, el final se doblaba hacia la cinta siguiente y el remate
—que va al vértice— caía fuera del cuerpo. Tampoco es un tramo para la mediana
de la que sale la anchura: un brinco que mide media obra inflaba la mediana y
dejaba la cinta más ancha de lo que su recorrido admite.

**Y el cabo no se aplasta: es material, no holgura.** Separar hebras empuja los
dos segmentos de cada par, y a un extremo de cinta lo empuja contra su vecino.
En medio del recorrido eso lo arregla `enforceMaterial` quitando el nodo; en un
cabo no hay nodo que quitar sin acortar la cinta. Con una cinta hay dos extremos
y no se nota; con tres hay seis, y **una de cada cuatro obras** salía con un
tramo más corto que el material admite. Reponerlo al final del solver no
funciona —mete el cabo en la vecina, y los cuerpos solapados sin cruce pasaron de
0 a 53 de 200—; reponerlo DENTRO de las pasadas de `selfAvoid` sí, porque la
pasada siguiente vuelve a separar y lo que cede es la otra hebra. Con eso el
tejido de tres cintas pasa de 29 obras sucias de 100 a 2, y de 1.546 a 977 ms.

**Y la costura de 1 px, que se quedó abierta al graduar, ya está cerrada.** Era
el filo del cabo: el halo y el cuerpo acababan en el mismo arco y el remate va a
ras, así que en los píxeles que ese filo parte por la mitad el halo se llevaba
una fracción de tinta que el cuerpo no devolvía entera. Basta con que el cuerpo
pase del halo un píxel. Los cuatro arreglos que habían fallado antes atacaban la
junta; no era la junta.

Lo que sí sigue abierto son dos defectos **que ya estaban** y que no se veían
porque la batería medía 50 obras por configuración: remates soldados a otra
hebra (~2 %) e incisiones a medias en apaisado (3 de 2.653 cruces). A un 2 %,
cero de cincuenta es lo más probable que puede pasar — la muestra era el
defecto. De ahí `mil.sh`, que mide mil.

### Lo que la cinta sabe hacer y no se veía

Tres mandos que existían a medias o no existían:

- **La esquina curva la tira ahora la obra.** El default era `rectas` a secas, así
  que la variante curva no salía nunca sola: ni en un lote, ni en la landing, ni
  en la galería, sólo eligiéndola a mano en el laboratorio. Un rasgo que vale lo
  mismo en todas las obras no es un rasgo. Sale una de cada cuatro, con su propio
  azar para no correr el stream principal y dejar igual todo lo ya visto.
- **El temblor** (`params.temblor`), portado de la "vibración opcional" del sketch
  de p5 con dos diferencias: entra *dentro* de `tejer`, antes de analizar el nudo
  —en p5 movía los puntos ya mapeados, después, así que la incisión dejaba de
  caer donde el análisis creía— y su ruido va sembrado, porque el de p5 no
  llamaba a `noiseSeed` y todas las obras temblaban exactamente igual. Va detrás
  de los lazos de restricción: probado antes, `selfAvoid` y `relaxFolds` se lo
  comían enteros incluso a amplitud 1,0.
- **Tres cintas** (`tipo: "tres"`). El salto pasó de escalar a lista y `esSalto()`
  siguió siendo la única puerta, así que de los 39 sitios que lo tocaban sólo
  cambiaron los que contaban uno. Cada cinta se lleva una pasada, y el suelo de
  vueltas ahora respeta eso: antes el bucle bajaba las vueltas hasta que el
  tejido validaba, y con eso un tipo de tres cintas devolvía dos.

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
del grid de obras: mirar 12 seeds en vertical es la manera de saber si la
obra aguanta ese formato antes de imprimirla.

## El muro (`_wall/`)

Cuánto mide la obra no se ve en pantalla, y el pliego es una decisión que hoy no
se juzga en ningún sitio. El muro pone la pieza a escala sobre una pared, con
figura de 1,70 m, eje de colgado a 1,45 m y regla en cm; su segunda vista pone
los cinco pliegos en la misma pared, que es donde de verdad se decide.

Vive en **su propia página a propósito**. El laboratorio decide QUÉ se genera;
el muro solo dice DE QUÉ TAMAÑO es el objeto que sale. Aquí solo hay mandos que
no cambian ni un píxel — pliego y referencias —, y todo lo que sí
mueve la imagen (seed, formato, paleta, params) llega por URL y es de solo
lectura. Meter esos mandos en el panel del harness habría convertido los
parámetros de generar en un cajón con parámetros de mirar.

Lo que viaja es la **receta**, la misma que ya usan los cinco harnesses y
`_batch.js`, serializada entera: un parámetro nuevo en una obra llega al muro sin
tocar nada. Los enlaces los pone `HOKSLAB.mountViewLinks()` —una línea por
harness, los dos destinos: el muro y las fotos— y recalculan el `href` al posarse
encima, no en cada refresh, para seguir siendo enlaces de verdad.

```
../_wall/?r=<receta JSON urlencoded>            ← lo que pone el enlace del panel
../_wall/?work=dtkrt&seed=123&fmt=horizontal    ← forma legible, a mano
```

## Las fotos (`_objects/`)

El muro es un **alzado**: mide, con figura, regla y cotas, para decidir el
pliego. Esto es una **foto**: luz, sombra, tela y cristal, para **publicar**. Son
dos oficios distintos y por eso son dos páginas — la primera versión de esta
intentó ser las dos cosas, y un alzado con cotas no se puede poner en Instagram.

Cuatro soportes, y todos salen del mismo sitio:

| escena     | qué es                          | qué la hace creíble                       |
|------------|---------------------------------|-------------------------------------------|
| `pared`    | el pliego colgado, en una sala  | el paño de luz, la sombra corta y algo desenfocado delante |
| `camiseta` | plano cenital sobre mesa        | el estampado se DESPLAZA con los pliegues |
| `vinilo`   | funda de 315 mm, girada         | el brillo cruzado del plastificado        |
| `reloj`    | esfera de 38 mm                 | el reflejo del cristal y el aro en cónico |

**Encuadre y salida.** 4:5 (1080 × 1350) por defecto, porque el grid de Instagram
recorta un cuadrado (BRAND.md § 8); también 1:1 y 9:16. Guardar **vuelve a
renderizar** al tamaño de publicación, como el PNG de impresión del motor: lo que
se ve es lo que se guarda, con más píxeles. Y hay botón de copiar al portapapeles.

**La toma es un azar aparte.** La obra tiene su seed y la foto tiene la suya —los
pliegues, las hojas, el grano—. `Espacio` cambia de toma sin tocar la obra: la
misma pieza fotografiada otra vez, no otra pieza.

### Por qué parece una foto (`_mockup.js`)

Una maqueta no convence por tener el objeto bien dibujado: convence por la luz.
Tres piezas hacen casi todo:

- **`warp`** — la obra sobre un plano girado, con perspectiva **proyectiva**. La
  coordenada de textura se interpola en 1/z (y aquí 1/z es el alto proyectado del
  borde); interpolada linealmente, la imagen no se comprime hacia el lado lejano
  y el resultado se lee como un trapecio pintado. Va recortada al propio quad,
  porque el dibujo se hace en tiras y si no el canto sale en escalera.
- **`displace`** — la obra impresa se **dobla** con lo que hay debajo. Sin esto la
  impresión es una pegatina, siempre, y se nota justo en los bordes rectos. Y son
  LOS pliegues de esa prenda, no unos nuevos: un campo aparte para el estampado
  daba una tela con dos telas dentro.
- **`grade`** — caída de luz, temperatura y grano, al final y sobre TODO el
  cuadro. Una cámara mete el mismo defecto en todo lo que entra por el objetivo, y
  ese defecto compartido es lo que dice que hay una sola foto.

Reglas comunes: **una sola luz** (arriba a la izquierda, en todas las escenas);
el objeto se construye en su propio lienzo y se coloca con sombra, para que la
sombra sea de la silueta y no de una caja; **nada axial** —dos grados de giro
separan una foto de un diagrama—; y todo medido contra `W`, `H` o `min(W,H)`,
como un `algo.js`, para que la vista previa y el archivo sean la misma imagen.

```
../_objects/?r=<receta JSON urlencoded>            ← lo que pone el enlace del panel
../_objects/?work=dtkrt&seed=123&fmt=horizontal    ← forma legible, a mano
```

| tecla     | acción                          |
|-----------|---------------------------------|
| `Espacio` | otra toma (misma obra)          |
| `←` / `→` | soporte anterior / siguiente    |
| `s`       | guardar PNG a tamaño de publicación |

**Lo que falta:**

1. **Tote y pañuelo.** El pañuelo pide seda cayendo, que es el caso difícil: una
   tela colgada, no extendida.
2. **Interior amueblado.** Hoy `pared` es una pared con una rama delante. Un salón
   —sofá, lámpara, suelo— es otra escena, no un ajuste de esta.
3. **Foto propia.** Todo esto es sintético: se dibuja la luz, no se fotografía.
   Para una foto de verdad la vía es soltar una imagen en la página y marcar las
   cuatro esquinas del plano — el `warp` ya sabe hacer el resto—. Es el camino a
   fotorrealismo real y no está hecho.

## Usar el harness (paso 3)

Con servidor local (para que el `fetch` de paletas no choque con `file://`):

```bash
python -m http.server      # → http://localhost:8000/sketches/<obra>/
```

También publicados: `https://hoks.design/sketches/<obra>/`.

| tecla     | acción                                  |
|-----------|------------------------------------------|
| `Espacio` | nueva seed aleatoria                     |
| `←` / `→` | seed − 1 / seed + 1                      |
| `g`       | grid de obras ↔ vista única             |
| `a`       | añadir la pieza actual al lote abierto   |
| `s`       | guardar PNG                              |

## Lotes (paso 3, la parte que importa)

Mirar doce y quedarte con dos **es** el trabajo, así que apartar una pieza es un
gesto de aquí: el `+` sobre cualquier miniatura del grid de obras, o `a`
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
4. Añadir el slug a `GRADUATED` — en `_lab.js` **y** en `admin.html`, que es un
   panel autónomo y lleva su propia copia. Con eso ya se abre en el laboratorio
   y aparece en su selector de obra, esté publicada o no.
5. La página de producción no hay que escribirla: `work.html?w=<obra>` carga
   `_engine.js` + el `algo.js` del slug y delega en `HOKS.<OBRA>.render`. Solo si
   la obra merece URL propia se escribe el cascarón de veinte líneas y se apunta
   en `page`. Nada de motor inline, en cualquier caso.

Nada está publicado hasta el push a `main`; se puede probar y revertir sin
miedo (ver CLAUDE.md).
