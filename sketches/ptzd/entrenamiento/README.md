# ptzd/entrenamiento — el ojo, registrado

**No se publica.** Vive aquí por lo mismo que `trzs/verificacion/`: es
instrumento, no obra. La web no lo enlaza, no aparece en el desplegable del
laboratorio y no escribe nada en `data/`.

```bash
python -m http.server    # → http://localhost:8000/sketches/ptzd/entrenamiento/
```

Hay además un **gemelo publicado como artefacto**, con el motor y el algoritmo
metidos dentro del propio HTML, para juzgar sin levantar un servidor:
<https://claude.ai/code/artifact/a46643c5-5add-43b5-87e5-95036d9f971f>

Va por la **2ª vuelta**. Es el mismo instrumento con una diferencia obligada:
allí el entorno bloquea la descarga de ficheros, así que los juicios salen al
**portapapeles y a un cuadro de texto** en vez de a un `.json`. Los dos guardan en `localStorage`, pero **cada uno
en el suyo**: son almacenamientos distintos y el avance no se comparte. Se elige
uno y se termina en él.

Y si se toca `algo.js`, el artefacto **no se entera**: lleva su copia congelada
dentro. Hay que volver a generarlo para que juzgue la obra de ahora — y conviene,
porque juzgar una versión vieja produce un patrón sobre una obra que ya no existe.

## Las vueltas

Cada vuelta usa **seeds propias y clave de almacenamiento propia**, y las dos
cosas por el mismo motivo: volver a juzgar las mismas obras no sería una muestra
sino un re-test contaminado por el recuerdo, y mezclar los juicios de dos
versiones del algoritmo daría un patrón sobre una obra que ya no existe.

| vuelta | seeds | clave | qué se juzgaba |
|---|---|---|---|
| 1ª | 700000– | `…-v1` | antes de las guardas del hilo, la rectitud y el casi |
| 2ª | 710000– | `…-v2` | con ellas, y con los pesos ya movidos por la 1ª |
| 3ª | 720000– | `…-v3` | pendiente: la 5ª revisión, y ya con las seeds mezcladas |

Lo que dieron las dos está en `../README.md`, en «Lo que el grid cambió». En
resumen: la primera dio dos señales independientes —menos placas y **ninguna
sajadura**—, y la segunda estaba explicada por un defecto formal que se arregló.

**Y la segunda vuelta le dio la vuelta a la primera**, que es lo mejor que ha
salido de aquí. Lo primero que dijo no está en ninguna columna: el rechazo cayó
del **38% al 9%** —lotes en los que no gustaba ninguna de las cinco—, así que las
guardas de la primera vuelta funcionaron. Y con los cortes malos ya arreglados, el
ojo pidió lo contrario que antes: `arbol` +5 y `astillado` +3 frente a `hendido`
−9, y 5–7 placas por encima de 2, cuando la primera vuelta había pedido menos de
todo. La lectura simple que explica el bloque entero: **el rechazo de la primera
no era a los cortes, era a los cortes malos**.

Lo único que no dio la vuelta fue la sajadura: −18, más marcada. Dos vueltas
seguidas diciendo lo mismo sobre un rasgo es lo más parecido a un dato que este
instrumento produce.

Y una tercera vuelta **juzgaría otra obra**: la quinta revisión cambió la
gramática después de esto. Antes de volver a juzgar hay que regenerar el
artefacto, o se estará midiendo el gusto sobre una familia que ya no existe.

## La seed se mezcla, y las dos primeras vueltas no lo hacían

El `Rng` del motor es un LCG, y en un LCG los primeros sorteos de seeds
**consecutivas** no son independientes: el primero avanza 0,000388 por seed y el
segundo 0,0907. Del tercero en adelante ya está disperso.

Aquí eso importaba el doble, porque **el primer sorteo de esta familia es la
paleta** y el segundo la pareja tinta/suelo. Con seeds seguidas, las cinco obras
de un lote salían casi siempre de la misma paleta — medido: 300 seeds seguidas
usaron **3 paletas de 15**, y las tres vecinas en el catálogo.

Así que la fila `paleta ≈ 0` de las dos primeras vueltas **no dice «da igual la
paleta»: dice que no había ninguna que comparar**. Hay que tacharla, no leerla. Y
lo mismo con `tintas`, que depende de qué colores trae la paleta que tocó.

Lo demás **sí vale**: tipo, gubia, piezas, sajaduras, faltan, escalones y todo lo
geométrico se sortean del tercer sorteo en adelante, donde el LCG ya está
disperso. Las señales que movieron la gramática —la sajadura, el recuento de
placas, el tipo— no están tocadas.

Desde la 3ª vuelta la seed pasa por un mezclador (MurmurHash3) antes de usarse.
**No se toca el `Rng`**: cambiarlo cambiaría todas las obras ya guardadas de seis
familias. El fallo estaba en cómo el instrumento elegía la muestra, no en el motor.

**Y ojo con la deriva.** Cada vuelta mueve los pesos hacia lo que gustó, así que
la siguiente juzga una familia ya estrechada y volverá a pedir más de lo mismo.
Dos o tres vueltas afinan; diez producen una sola obra repetida. El instrumento
no sabe parar — eso es decisión de autor.

## Para qué

El grid de obras ya sirve para decidir, pero **no deja registro**: mirar doce
seeds y quedarse con dos es exactamente el trabajo, y al cerrar la pestaña ese
trabajo se ha perdido. Esto es lo mismo hecho a propósito y anotado: **100 lotes
de 5 obras**, de cada uno se eligen las dos que más gustan —o una, o ninguna— y
de ahí sale un patrón de preferencia sobre los rasgos.

Lo que se busca no es una nota por obra: es **qué rasgos del sistema tiran del
ojo**. Con eso se pueden mover los pesos de la gramática con un motivo, en vez de
con una intuición — que es todo lo que ha habido hasta ahora.

## Las dos decisiones de método

Sin estas dos, el ejercicio produce un número que parece un dato y no lo es.

**1. Se juzga a ciegas.** Ni tipo, ni gubia, ni seed, ni traits a la vista. Leer
«astillado» debajo de una imagen deja de ser juzgarla, y el patrón que saldría
sería el de las etiquetas y no el del ojo. Se registra todo; no se enseña nada.

**2. La comparación es dentro del lote.** Lo que se mide no es «qué porcentaje de
las astilladas gustan» sobre el total — eso depende de con qué les tocó competir.
Se mide, lote a lote, si un rasgo sale elegido **más de lo que su presencia en ese
lote hacía esperar**. Ésa es la columna `sesgo`, en puntos porcentuales: cero es
indiferente. La columna `tasa` está para mirarla al lado, pero se la lleva la
composición del muestreo, así que no decide.

## Y una advertencia que hay que tener delante

Con once rasgos categóricos, cuatro continuos y unos cientos de obras, **algo va a
parecer un patrón por puro azar**. Vale lo que salga grande, repetido y con muchas
vistas; no lo que salga primero en la tabla. Las filas con menos de 20 apariciones
salen en gris y con `?` justamente para que no se lean como conclusión.

**Y mide compañía, no causa.** Los rasgos de esta familia van juntos: `hendido`
trae pocas piezas y hondura 1; más tintas trae más rareza. Si el ojo pide una
cosa, se encienden en la tabla todas las que vienen con ella. Está comprobado a
propósito — se sembró una preferencia falsa por `hendido` y por más de una tinta,
y el análisis las sacó con +47 y +47, dejó en cero lo que no se había sembrado
(gubia, papel, paleta) **y encendió además `piezas 2`, `hondura 1` y `rare`, que
nadie había pedido**. Son el cortejo de lo sembrado. Así que lo que hay que buscar
es **la causa más simple que explique el bloque entero**, no leer fila por fila.

Y lo que sale de aquí es una **preferencia**, no una verdad sobre la familia. Si
el ojo pide siempre lo mismo, mover los pesos hacia ahí estrecha la obra: parte
del valor de una serie está en las tiradas que no gustan a la primera. Lo que este
instrumento da es el dato; qué hacer con él es decisión de autor.

## Cómo se usa

| tecla | acción |
|-------|--------|
| `1`–`5` | marcar / desmarcar una obra (dos como mucho; la tercera empuja a la primera) |
| `0` | ninguna me gusta — el lote se descarta entero |
| `enter` | pasar al siguiente lote |
| `retroceso` | volver al lote anterior y corregir |
| `p` | ver el patrón a mitad de camino |

El avance se guarda solo en `localStorage`: se puede cerrar y volver. Un lote
descartado entero **no informa** y queda fuera del cálculo, pero se registra: que
un lote no dé ninguna es un dato sobre el lote.

Al final —o pulsando `p`— salen las tablas, un **JSON descargable** con la huella
completa de las 500 obras y sus elegidas, y un **resumen copiable** para pegar
donde haga falta.

## Qué hacer con el resultado

Los pesos que este dato puede mover, por orden de lo que costaría cambiarlos:

- los de `TIPOS` y `GUBIAS`, que hoy son una intuición sin medir detrás;
- los de `faltan`, `escalones` y `tintas`, que se pusieron a ojo en su pasada;
- los rangos de `PULSO`, `MORFA`, `SEGUIR` y `REPARTO`, si la mediana de lo
  elegido cae claramente a un lado;
- y, si el sesgo apunta ahí, las **frecuencias de la rareza** — que hoy se miden
  sobre lo que el algoritmo produce y no sobre lo que se elegiría.
