# iterations2 — el boceto de p5 del que salió TRZS

> **GRADUADA.** Esta obra ya es una familia: **TRZS**, en `sketches/trzs/`.
> Lo que se publica y se opera es eso — `algo.js` sobre el motor compartido,
> harness en el laboratorio general, página `trzs.html` y celda en la landing.
>
> Esta carpeta se queda como **el boceto de p5 del que salió**, porque el porte
> se verificó contra ella: 200 obras de 200 idénticas al píxel. Es la referencia
> de esa prueba, no código vivo. **No la toques para trabajar la obra.**
>
> Lo que TRZS tiene y esto no: los tres formatos, el fondo y el grano del motor,
> los lotes del laboratorio general, el muro, y el hueco de la incisión cerrado.

**No estaba graduada cuando se escribió lo de abajo.** Esto es el sketch de p5 que se pega en OpenProcessing, no
producción. No hay página de obra, no entra en `works.json`, no se publica.
Vive aquí solo para no perderlo entre sesiones.

Una cinta continua recorre el marco **varias veces**; al volver a entrar se cruza
con lo que ya dejó escrito. La profundidad no es el orden de dibujo: se decide
**cruce a cruce**, alternando encima/debajo como un diagrama de nudo.

## Estado

Fase 2. Determinista (`seed` → imagen). Un solo archivo, `sketch.js`: núcleo
generativo + UI de laboratorio. Se pega entero en OpenProcessing, y también se
sirve como página desde este mismo directorio:
**`joxemari.github.io/hoks/sketches/iterations2/`**.

p5 va vendorizado aquí a propósito, no por CDN: en este repo lo commiteado es
exactamente lo que se publica. Servido desde hoks no hay protección de bucles
—la de OpenProcessing acumula el tiempo de cada bucle a lo largo de la sesión
y acaba abortando aunque no haya ningún cuelgue— y va bastante más rápido.

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

## Las esquinas

Un solo mando con dos valores:

- **rectas** — ángulo vivo y junta a inglete. La cinta doblada, que es la
  referencia de la que salió la obra.
- **curvas** — cada vértice redondeado hasta la mitad del tramo más corto, que
  es el máximo antes de que dos redondeos vecinos choquen.

Se probó un tercer modo sin rectas (la curva por los puntos medios con los
vértices de control) y se descartó: con dos basta.

**La curva se calcula entera una vez y cada sección se recorta de ella.**
Curvando cada trozo por separado las dos curvas no coinciden en la costura —el
eje curvo se aparta del polígono hasta un cuarto del tramo, y cada sección se
aparta a su manera porque sus puntos de control son otros— y en el dibujo eso
salía como una cuña de tinta donde debía ir la incisión. Con la curva global,
todas las piezas caen sobre el mismo eje.

Comprobado además que curvar no inventa ni destruye cruces: aplanando el eje
tal y como se dibuja, los dos modos tienen exactamente los cruces que conoce
el nudo, en las 40 obras probadas.

## El tipo

Cuatro tipos, y son **lo primero que se lee** en la obra:

| tipo | prob. | pasadas | trazo | cruces | qué se ve |
|---|---|---|---|---|---|
| suelto | 22 % | 1 | gordo | 0–1 | un gesto abierto, casi un signo |
| anudado | 55 % | 2 | estándar | 2–3 | un nudo cerrado, el encima/debajo es el asunto |
| trama | 20 % | 3 | fino | 4+ | tejido, se lee como celosía |
| **dos** | **3 %** | 2 | estándar | 2+ | **dos cintas sueltas entrelazadas entre sí** |

El tipo declara **dos cosas materiales** —cuánto recorrido y de qué grosor— y
los cruces salen de ahí. Declarar sólo el recorrido no bastaba: a tres pasadas
en un marco fijo los tramos se acortan respecto a la anchura, el material
adelgaza la cinta más de lo que `grosorMinimo` permite, y el tejido se
descartaba entero. **Una trama no es una cinta ancha que ha adelgazado: es una
cinta fina desde el principio.**

Y luego **se comprueba sobre el resultado**: entre los tejidos dibujables, gana
el que cae en la banda de cruces de su tipo. Declarar sin comprobar es lo que
falló con las familias. Medido sobre 200 obras: **182 son del tipo que
declaran** (44/45, 94/107, 40/44, 4/4 sobre 200).

El orden del desempate importa y está pagado en errores:

1. **correcto** — si la obra se puede dibujar bien. No se negocia.
2. **en banda** — el tipo declarado. Va **antes** que las preferencias: un
   tejido denso incumple casi siempre `conserva`, y si la preferencia manda, el
   sistema elige siempre el tejido flojo y el tipo no ocurre nunca.
3. **preferible** — hipótesis sobre qué se ve bien.

### Dos cintas: el salto

El diagrama de nudo tiene que seguir siendo **uno**: los cruces *entre* las dos
cintas también necesitan un orden de pintado, y ese orden sale de las secciones
de un único recorrido. Así que las dos cintas van **concatenadas**, y el
segmento que las une —el **salto**— no se dibuja, no cuenta como cruce y no lo
tocan las restricciones del material.

Eso obliga a cuatro cambios que no son evidentes:

- El salto **no es un tramo**: no entra en la longitud mínima, ni en el
  relajado de pliegues, ni en la auto-evitación, ni en la separación entre
  cruces.
- Se fuerza como **frontera de sección**, para que las dos cintas nunca se
  pinten como un trazo continuo.
- Sus dos bordes son **extremos de cinta**, no cortes: sin cabo y sin alargar
  el halo. Si lo llevaran, el remate de una cinta se metería en el hueco de la
  otra.
- Hay **cuatro remates**, no dos, y la holgura del arranque y el final se mide
  contra los cuatro.

Las dos cintas se construyen **por separado** y luego se concatenan: pasándole
los anchors de las dos a `buildPath` de una vez, insertaría puntos entre ellas
y las uniría.

Medido: 0 cruces defectuosos de 100, remates 0/30, 29 de 30 con tejido
dibujable. El control con el orden de pintado invertido marca 50 de 51.

### Dos cintas, dos colores

Cuando hay dos cintas van en colores distintos. El segundo se elige por
**distancia de color**, no por luminancia: dos turquesas pueden tener
luminancias distintas y seguir siendo el mismo color a la vista, y con el
criterio de luminancia salían cintas turquesa sobre fondo turquesa y dos
naranjas casi iguales.

En una paleta de **dos colores** no hay segunda tinta que elegir, así que se
fabrica **a medio camino del fondo** (38 %). Mezclando hacia el blanco o el
negro, una cinta crema sobre negro daba otra crema y las dos se leían como una
sola. Hacia el fondo cambia de valor lo suficiente y conserva contraste de
sobra: sale una cinta dominante y otra recogida.

## El formato

`aspecto` es el ancho/alto del **campo**, no un estirado del dibujo: deformar
el dibujo ensancharía la cinta en un eje y dejaría de tener grosor constante.
El campo mide `A` de ancho por 1 de alto, y el mapeo al lienzo es **siempre de
escala uniforme**.

El campo de anchors se estira **más que el marco** (`A^1.5`). Con el estirado
justo, la obra salía centrada y con los costados vacíos: separar hebras y abrir
pliegues devuelve la mancha hacia lo isótropo y se come buena parte del
estirado.

La escala se limita por el eje que menos da, así que **la obra nunca se sale
del lienzo** aunque el lienzo sea más cuadrado que el campo — antes de eso,
dibujar un campo apaisado en un lienzo cuadrado dejaba 16 obras de 40 con tinta
pegada al borde.

Y **la escala es una sola**: la usan las posiciones y el grosor. Estaban
separadas —las posiciones por el eje que menos daba, el grosor por el alto— y
con `aspecto` 1,5 la cinta se pintaba media vez más gorda de lo que el
generador había medido. Todas las garantías geométricas (huella, separación,
cabos, remates) se calculan en proporción a la anchura, así que al crecer la
anchura después se quedaban cortas: 8 % de cruces a medias, y **sólo en
apaisado**. Con una sola escala, cero.

En el laboratorio: cuadrado, apaisado 3:2 y panorámico 2:1. El buffer de export
sigue el formato, así que el PNG sale apaisado y no recortado de un cuadrado.

### Con dos cintas, dos familias

Cada pasada del esqueleto ES una cinta, así que dos cintas de la misma
familia son la misma forma girada 0,62 de vuelta y encogida: se leen como el
eco de una sola, no como dos tejidos que se encuentran. La segunda cinta saca
sus anchors de **otra familia**, y la extensión la manda la más extendida de
las dos —encajar dos cintas en la extensión de la más recogida las apelotona
en el centro.

Esto no contradice lo de abajo. Las familias no se distinguen **una a una**,
comparadas contra una media recordada. Aquí las dos están en la misma imagen,
una al lado de la otra, y la comparación es directa: sale una cinta larga y
una anudada, o dos densidades distintas.

El corte entre las dos va por la **frontera de pasada**, no por la mitad de la
lista de anchors: dos familias no tienen el mismo número de anchors, y partir
por la mitad le daría a una cinta un trozo de la otra.

### El desplazamiento entre pasadas no sirve: lo lava el encuadre

Se probó a que cada pasada, además de girar, **se desplazara** en un rumbo
—`paso · t`— para que la cinta atravesara el marco en vez de orbitarlo.
Medido sobre 50 obras por tipo y cuatro valores de paso (0 / 0,12 / 0,22 /
0,34):

| tipo | aspecto de la mancha | desvío del centro | cruces (media) |
|---|---|---|---|
| anudado | 0,96 → 0,94 | 0,000 en los cuatro | 2,6 → 2,3 |
| trama | 0,97 → 1,00 | 0,000 en los cuatro | 4,3 → 4,1 |
| dos | 0,99 → 0,96 | 0,000 en los cuatro | 2,6 → **1,5** |

**Ningún efecto sobre la forma, y sí un coste.** En `dos`, las obras con menos
de dos cruces pasan de 11 de 50 a 23 de 50.

El motivo es `shrinkIntoFrame`, que es lo último que corre y **centra la caja
a mano** (`dx = A/2 − centro`). Cualquier desplazamiento metido antes se borra
ahí. Por lo mismo, `placeJitter` —que desplaza dentro de `fitToExtent`— no
llega a verse tampoco.

La obra está **siempre exactamente centrada, por construcción**. Y es
deliberado: sin centrar, la mancha acababa descolgada contra un borde con
medio cuadro vacío enfrente. Para que una obra se descentre a propósito habría
que decidirlo **después** del encuadre, como decisión de composición y no como
reparación del solver. El mando se retiró; queda la medición.

### Las familias no se leen (una a una)

Las cinco (`diagonal`, `compact`, `open`, `returning`, `cross`) siguen ahí como
variación interna, pero **no son una categoría**. Medido sobre 60 obras: mismo
aspecto (mediana 0,97), mismo centro (0,50 / 0,50), misma dispersión en los dos
ejes, y repartidas por igual. Girar cada pasada sobre el centro y ajustar al
marco lava la disposición de la familia.

### Los ciclos se rompen cortando, no volteando

Un nudo puede exigir que A vaya sobre B, B sobre C y C sobre A. En papel eso no
existe, y hay dos maneras de deshacerlo: **voltear** un cruce —que cambia el
tejido— o **partir** una de las secciones atrapadas, que no cambia nada de lo
que se ve salvo una costura a mitad de un tramo recto, invisible por
construcción. Se prueba primero a partir.

Esto no es un detalle: con dos cintas es **lo único** que permite que se
entrelacen. Dos cintas entrelazadas producen ciclo siempre, y volteando se
llega inevitablemente al único estado sin ciclos, que es una cinta entera
encima de la otra. Medido sobre 40 obras del tipo `dos`: el reparto de
arriba/abajo entrelazaba en las 34 con dos o más cruces compartidos, y el plano
lo deshacía en las 34. Cortando: **35 de 35 entrelazadas**, y los volteos caen
a cero en casi todas.

Las juntas se comprueban **otra vez al final**. Una junta se abre mirando las
huellas de ese momento; cada volteo posterior cambia qué hebra va arriba y con
ella el tamaño de la huella, así que una junta que era buena puede acabar
dentro de una. Ahí no se remienda: se descarta el tejido y se prueba otro.

`volteoMax` queda **desactivado**. Tres de las cinco obras que el autor aprobó
lo incumplían, y además impedía que la trama existiera: más cruces obligan a
más volteos.

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
  esquinas, extremos) **no** cuentan como versión: son rasgos de la
  obra, y se guardan como tales.

Los veredictos viven en `localStorage` y salen en JSON con `e`. El corte de cada
rasgo se busca por Gini, no por diferencia de porcentajes: interesa el corte
**limpio**, no el que parte el lote en dos mitades.

## Métricas

Cada composición reporta `cruces`, `gap`, `seg`, `giro`, y el triaje guarda
además familia, paleta, secciones, volteos, juntas, separación entre cruces,
anchura y ocupación. Ninguna filtra nada.

**Ningún detector cuenta hasta que dispara con código roto a propósito.** Tres
controles: invertir el orden de pintado entero (todos los cruces mal), repintar
una sola mitad de abajo encima (inversión de medio lado) y dejarlo intacto
(ninguno mal). Un detector que sólo sabe decir cero no distingue "no hay
defectos" de "no miro donde toca".

### Cómo se mide el halo

Comparando el render contra **la máscara que la geometría exige**, no caminando
rectas:

```
anillo(hebra de arriba, entre W/2 y W/2+gap)  ∩  cuerpo(hebra de abajo)
```

y midiendo qué fracción de esa máscara es fondo de verdad, **por separado a
cada lado del eje de la hebra de arriba** — que es lo que distingue una
inversión de medio lado de una entera. Es la misma cuenta a 40° que a 90°,
porque la máscara ya se alarga sola con el ángulo.

Los tres intentos anteriores caminaban rayos y decidían con un umbral de
color, y los tres mintieron:

| detector | a medias | sin corte | sesgo de ángulo | control |
|---|---|---|---|---|
| tres alturas, umbral duro | 1,3 % | 0 % | — | ninguno |
| sonda sub-píxel | 3,9 % | 1,9 % | 40 % a 38-45° → 0 % a 70-90° | 96 % |
| **máscara geométrica** | **1,0 %** | **0,5 %** | ninguno | **100 %** |

El sesgo monótono con el ángulo era la pista: en un cruce rasante la zona de
solape es un rombo largo y un sondeo por rectas se pierde dentro.

El primer detector daba **1,3 % a medias y 0 % sin corte**, y las dos cifras
eran falsas: cantaba un defecto donde la incisión estaba entera (seed
559686731 — fondo puro de lado a lado a resolución de píxel) y se comía nueve
que sí lo eran.

### Estado

**1 023 cruces sobre 8 configuraciones, cero defectuosos.**

| configuración | obras | cruces | a medias | sin corte |
|---|---|---|---|---|
| por defecto | 100 | 257 | 0 | 0 |
| tipo suelto | 40 | 21 | 0 | 0 |
| tipo anudado | 40 | 108 | 0 | 0 |
| tipo trama | 40 | 166 | 0 | 0 |
| tipo dos | 40 | 100 | 0 | 0 |
| apaisado 3:2 | 60 | 156 | 0 | 0 |
| panorámico 2:1 | 40 | 110 | 0 | 0 |
| dos + apaisado | 40 | 105 | 0 | 0 |

199/200 obras con tejido dibujable. **0,23 s por obra** (10,2 s al empezar).
Y 182 de 200 son del tipo que declaran: 44/45, 94/107, 40/44, 4/4.

Otras clases, con su control cada una:

| clase | resultado | control |
|---|---|---|
| remate soldado a otra hebra | 0 de 60 obras | 15 % antes del arreglo |
| tinta pegada al borde | 0 de 60 obras · holgura 25 px (pedida 20) | con `margen 0`: holgura 0 px y aparece |
| disco con el centro bajo la cinta | 0 de 125 discos | colocándolos al azar: 35,9 % |
| disco que invade la cinta o su aire | 0 de 40 obras, en tres configuraciones | sin el término de aire: 34/40 y 29/40 |

**Determinismo verificado**: 7 seeds dan la misma imagen al píxel repitiendo la
llamada, pidiéndolos en otro orden, tras recargar la página y en otra pestaña.

Antes de separar las condiciones eran 3 cruces defectuosos de 199, todos en las
4 obras (de 80) para las que ningún tejido pasaba. El dibujo nunca tuvo un
fallo propio: todo lo que sobrevivía venía de "para este seed no hay tejido
limpio".

## Dos clases de condición, y por qué importa

Las ocho condiciones del tejido no eran de la misma naturaleza, y mezclarlas
salía caro. Ahora están separadas:

- **`correcto`** — si la obra SE PUEDE DIBUJAR BIEN: ángulo de cruce,
  separación entre cruces, tramo mínimo, holgura de los remates, ciclos,
  atascos. No se negocian.
- **`preferible`** — hipótesis sobre qué se ve bien: `volteoMax`,
  `grosorMinimo`. Se conservan como preferencia, **no como veto**.

Entre un tejido dibujable que no cumple una preferencia y uno que la cumple
pero sale roto, gana el dibujable.

### El rescate por cambio de familia

Si para un seed no hay **ningún** tejido dibujable con su familia, se prueban
las demás. Las familias no dan igual de sí: en los cuatro seeds que fallaban,
`compact` siempre producía un nudo limpio de 3 cruces y `cross` ninguno.

Se dispara con `correcto`, nunca con `preferible`. Disparándolo con las ocho
condiciones entraban también las obras que sólo incumplen `volteos` —tres de
las cinco que el autor aprobó— y se las llevaba por delante. Con la separación,
**las cinco salen idénticas al bit** y el rescate sólo toca el ~8 % que lo
necesita (2 de 24), así que no cuesta tiempo medio.

Exige un nudo de verdad (≥3 cruces): sin eso el rescate se llena de tejidos de
un solo cruce, que cumplen todo al vacío porque con un cruce no hay separación
entre cruces que medir.

### La disyuntiva, medida

Se probó forzar más trama con una puerta de cruces mínimos (`crucesMin 3`) más
un suelo de una vuelta como último recurso:

| | cruces/obra | cruces defectuosos | obras sin tejido limpio |
|---|---|---|---|
| como está | 2,5 | **1,5 %** | 5 % |
| con `crucesMin 3` | 3,8 | 3,3 % | 10 % |

Más trama cuesta correctez, y ahora se sabe cuánto. **Revertido**: la
instrucción era cero defectos.

### Una puerta que contradice al autor

Comprobando qué incumplen las cinco obras que el autor aprobó:

| seed | familia | cruces | veredicto de las puertas |
|---|---|---|---|
| 7 | returning | 3 | **incumple `volteos` = 1,00** |
| 101 | cross | 3 | pasa todo |
| 2024 | returning | 3 | **incumple `volteos` = 1,00** |
| 55501 | cross | 5 | pasa todo |
| 880123 | compact | 2 | **incumple `volteos` = 0,50** |

`volteoMax` está en 0,34. **Tres de las cinco obras aprobadas lo incumplen.**
El umbral salió de una hipótesis —que un nudo con muchos volteos deja de
alternar y el ojo no lo sigue— y el ojo del autor la contradice. Era además la
puerta más dura de las ocho: de 22 candidatos la pasaban entre 0 y 4, y por eso
subir los reintentos no movía la tasa (96 % con 10, 88 % con 60). El pozo no
era pequeño; había un cuello.

Abrirla a 1,0 sube la trama de 2,5 a 2,7 cruces por obra y **no** arregla los
seeds sin tejido limpio (fallan por otras puertas). No se ha cambiado: mueve
tres de las cinco obras aprobadas, y eso lo decide el autor.

**Aquí se agota lo que puedo hacer midiendo contra mis propios criterios.** Tres
de las ocho puertas son hipótesis mías sin contrastar, y la que sí se ha
contrastado ha salido equivocada. Lo que hace falta ahora son veredictos —el
triaje por lotes existe para esto: recoge el juicio del autor con todos los
rasgos medidos y saca qué medida predice de verdad el descarte.

### Otras dos hipótesis probadas y descartadas

- **Dar variedad al pozo de candidatos.** El giro entre pasadas es `0,62·2π`
  fijo con un temblor de ±0,25 rad, así que los 22 candidatos son el mismo
  tejido con ruido. Sorteando el giro de verdad (±0,18·2π) y la escala: **95 %
  → 89 % de obras limpias**, y sin más trama. El 0,62 no es una limitación,
  está bien elegido.
- **Cambiar de familia como último recurso.** Las familias no dan igual de sí:
  en los cuatro seeds que fallan, `compact` siempre produce un nudo limpio de 3
  cruces y `cross` ninguno. Rescatarlos cambiando de familia da **80/80
  limpias**, pero triplica el coste (1,2 → 3,8 s por obra) y mueve tres de las
  cinco obras aprobadas, porque esas tampoco pasan las puertas.

### Dos trampas, por si se vuelve a intentar

- Un tejido de una vuelta **sin cruces cumple todas las demás puertas al
  vacío** —sin cruces no hay separación, ni volteos, ni ciclos, ni remates que
  medir— y se vuelve el óptimo degenerado: 28 obras de 60 se derrumbaron a una
  vuelta. Hace falta la puerta de cruces mínimos para que las otras siete
  signifiquen algo.
- El desempate entre tejidos que fallan **no puede contar puertas a peso
  igual**: el degenerado incumple una (no ser un nudo) y un nudo de verdad
  incumple dos, así que gana el degenerado (43 de 60). Hay que ponderar por
  severidad, y "no es un nudo" pesa más que todo lo demás.

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

## Los discos y los ojos del nudo

Hasta ahora la única regla de un disco era **no caer bajo la cinta**: buscaba el
vacío más profundo del fondo, con tope para que no se fuera a una esquina. Eso
los deja siempre *fuera* del tejido — un contrapunto plano y ajeno, que es lo
que eran.

Ahora una parte de ellos busca los **ojos del nudo**: los vacíos **cerrados por
la propia cinta**. Se encuentran inundando la rejilla desde el borde del cuadro
y quedándose con lo que el agua no alcanza.

Lo que ata el disco al nudo no es dónde cae, es **de qué tamaño es**: al disco
de un ojo lo dimensiona el ojo, no el azar. Sin eso el sistema no habría podido
usarlos nunca — medido sobre 30 obras por tipo, los ojos miden de mediana 1,07 a
1,3 anchuras de radio y el disco más pequeño de la gama pide 1,35, así que con
el tamaño sorteado **ninguno cabía dentro del tejido**.

| tipo | ojos por obra | obras con algún ojo |
|---|---|---|
| suelto | 0,6 | 17/30 |
| anudado | 2,8 | 30/30 |
| trama | 4,2 | 30/30 |
| dos | 3,3 | 30/30 |

Dos límites, los dos por lo mismo — que no aparezca una clase de objeto que no
existe en el resto de la obra:

- **Un ojo merece disco sólo si cabe uno de los que la obra iba a dibujar de
  todos modos** (`dotRMin`). Con un mínimo propio y más bajo salían motas de
  medio radio que no se leen como disco sino como suciedad.
- **Como mucho dos discos van a un ojo** (`dotOjosMax`). Llenar el cuadro de
  discos pequeños sería otra obra.

Resultado: **10 de 40 obras** en `trama`, 6 de 40 en `anudado`, 4 de 40 en `dos`
apaisado. Es raro a propósito.

La rejilla sube de 56 a 96. Con 56 la celda mide 16 px en un cuadro de 900 y un
ojo son cuatro celdas: el fondo del ojo se estimaba con un 25 % de error. Pintar
pasa de 4 a 20 ms por obra, contra los 250–1200 ms que cuesta tejer.
