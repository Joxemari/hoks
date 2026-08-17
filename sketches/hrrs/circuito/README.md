# El circuito

**La corriente 1**: cómo se relacionan los centros de los trazos. La línea fina de la que
cuelga todo lo demás, separada de la corriente 2 —cómo se dibuja y se rellena la banda—,
que es la partición que pidió el autor cuando vio que la técnica ya estaba y la
composición no.

## De dónde salen los números

`mano.json` son los ejes que **el autor marcó a mano** sobre las seis referencias, en el
artefacto hecho para eso, normalizados por el lado corto. No es una traza automática: es
su lectura de cuáles son los trazos y por dónde va el centro de cada uno. Él mismo puso
la advertencia: es orientativo, no de píxel, y el punto central no tiene por qué caer en
el centro visual de la banda —porque la banda se rellena hacia un lado u otro según el
vecino—.

Ahí aparecieron además las **ramas**: el trazo se bifurca, sobre todo en r6, y las marcó
como idas y vueltas porque la herramienta no daba más. Desdobladas: cinco en r6, ninguna
en las otras cinco. **El trazo es un árbol, no un camino**, y eso no está implementado.

`esencia.py` mide los invariantes del circuito sobre esos ejes. `gen.js` es el generador
que intenta cumplirlos y `medir.js` lo mide con la misma vara.

## Los dos invariantes que mandan

**LOS CENTROS NO SE CRUZAN.** Un cruce en 220 pares posibles, en las seis. La familia
llevaba nueve vueltas construyendo cruces —`cruceEntero`, `SOLAPE_MIN`, el halo que los
separa— y peleando por conseguir paralelas. Prohibido el cruce, las paralelas salen
solas: un trazo que no puede atravesar al vecino lo bordea, y bordear a un canal de
distancia *es* acompañar.

**MEDIA LONGITUD VA SOBRE LOS EJES DEL CUADRO** (0,52). Chillida ancla el circuito al
pliego. El motor sorteaba una diagonal cualquiera y evitaba a propósito alinearse con el
papel — decisión contraria a la fuente, y escrita en su comentario.

## El juicio del autor, contado

`elegidas.json` son 17 obras elegidas y 15 notas suyas sobre la primera versión. Contadas:

| | |
|---|---|
| **9** | la composición general se lee — «interesante», «dice algo», «cierta cohesión compositiva», «buena densidad», «potencial» |
| **7** | la relación entre trazos es nula — «mal relacionados», «cohesión nula» |
| **6** | mal paralelizados |
| 2 | sin rellenos, intersecciones vacías |
| 2 | solape que sobra |
| 1 cada uno | márgenes cambiantes · sin árboles · trazo demasiado digital · sueltos y scattered |

**Ocho notas dicen las dos cosas a la vez**: la composición bien, la relación mal. Es el
diagnóstico más limpio que ha dado esta familia en toda su historia — el gesto global ya
está y lo que falla es cómo se responden los trazos entre sí.

Y su corrección, en sus palabras: *«hay que dibujar UN trazo y, sobre él, empezar a hacer
otros trazos que tendrán diferentes características. Si es denso, habrá que empezar por
alguna paralela cerca; si son abiertos, pues abiertos y scattered»*.

## El tipo de obra

La obra deja de ser una colección de trazos que se estorban y pasa a ser **un trazo y una
manera de responderle**, declarada para la obra entera:

| | trazos | separación | paralela | prolonga | apoya | suelta |
|---|---|---|---|---|---|---|
| **denso** | 8–14 | 1,04–1,18 W | 0,62 | 0,13 | 0,20 | 0,05 |
| **abierto** | 5–8 | 1,30–2,20 W | 0,34 | 0,20 | 0,16 | 0,30 |

Y la paralela **nace en su carril** —a `sep` del padre, en su dirección, ya enganchada—
en vez de encontrarlo por casualidad. Con un detalle que costó una vuelta: la consigna del
servo no puede ser `sep`, porque `cabe` rechaza todo lo que baje de `sep` y un servo que
apunta al límite vive sobre la línea prohibida; el primer temblor mata la paralela al
nacer. Se apunta un 10 % por encima.

## El marcador

| rasgo | generador | referencias | |
|---|---|---|---|
| rasgo | v1 | con tipos | referencias | |
|---|---|---|---|---|
| cruces entre centros | 0 | **0** | **0** | ✔ |
| ángulo de quiebro | 31,5 | **32,6** | **32** | ✔ |
| longitud en 4 rumbos | 0,63 | **0,61** | **0,60** | ✔ |
| trazos | 8 | **8** | **7,5** | ✔ |
| polo | 0,38 | **0,38** | **0,41** | ✔ |
| cabos al aire | 0,08 | **0,10** | **0,18** | casi |
| quiebros por lado | 6,20 | 6,03 | 7,55 | casi |
| reparto | 1,63 | 1,81 | 1,56 | |
| longitud en 1 rumbo | 0,25 | 0,19 | 0,24 | |
| cierre | 0,26 | 0,20 | 0,30 | |
| longitud en los ejes | 0,40 | 0,32 | 0,52 | |
| **acompañado** | 0,27 | **0,35** | **0,52** | ↑ |
| **largo del trazo** | 0,39 | 0,35 | **0,64** | ✗ |
| **línea total** | 3,22 | 3,28 | **5,21** | ✗ |

## Y una unidad mal puesta que invalidaba el objetivo

El acompañamiento se medía con un umbral **absoluto** —0,08 del lado—, y eso son **3,2
anchuras de banda en r1 y 0,9 en r5**. A 0,9 anchuras el umbral **no puede dispararse**:
dos centros a menos de ~1,2 anchuras estarían solapados. Los ceros de r5 y r6 eran del
instrumento, y el objetivo «0,32» era la mediana de cuatro medidas válidas y dos
imposibles.

En anchuras, las seis **coinciden entre sí** —0,44 · 0,45 · 0,56 · 0,58 · 0,58 · 0,44—
y el objetivo es **0,52**. Un instrumento que mide algo hace que la fuente se ponga de
acuerdo consigo misma; ésa es la señal. Lo mismo con los cabos: 0,18 al aire, no 0,32,
o sea que **el 82 % muere contra el cuerpo**.

Y de paso el generador pasó de un «0,01» que era mentira a un 0,27 que es real.

## Lo que falta, con su causa

- **El largo (0,39 contra 0,64) y la línea (3,22 contra 5,21).** Sin cruces, un trazo que
  entra en un callejón muere ahí: al bloquearse prueba otro rumbo *desde donde está* y no
  retrocede nunca. Medido: subir la persistencia del carril no lo arregla (0,40 → 0,39).
- **El acompañamiento (0,27 contra 0,52).** El carril engancha y suelta bien, pero sólo se
  entra en él por casualidad — pasando cerca. En las referencias un trazo *nace* para
  acompañar a otro la mitad de su recorrido.
- **Las ramas.** Cinco en r6, ninguna en las otras cinco. El trazo es un árbol y el
  generador sólo hace caminos.

## Vestir el circuito

`tanda.html` es la vista en vivo: tandas de 5 o 10, clic para elegir, `C` alterna entre la
tinta y el circuito desnudo con los cabos marcados, y un **campo de nota por obra**.

La nota no es un extra: **va también en las elegidas, y en las descartadas**. Lo que falla
en la que más te gusta es lo que más enseña, y un «esto no» razonado vale tanto como un
sí. Se guarda por SEMILLA y no por posición, así que sobrevive a la tanda y una obra que
vuelva a salir trae lo que ya se dijo de ella. `Copiar elegidas y notas` saca
`{semilla, elegida, nota}` para poder cruzar lo que gusta con lo que se mide.

*(Y un fallo que se comió la primera versión: la rejilla se reconstruía entera en cada
clic, así que escribir una nota y tocar otra obra la borraba y mandaba el foco al limbo.
Ahora se construye una vez por tanda y se toca en sitio.)* Y con los centros sin cruzarse, la técnica cabe en diez
líneas: por cada trazo, primero su **foso** —un trazo blanco de W+2g— y encima su tinta de
W. El foso del que llega después muerde al que ya estaba, así que entre dos bandas queda
exactamente g y el reparto sale **asimétrico solo**. Es el paso 4 del autor —«se rellena
hasta el margen»— resuelto por orden de pintado en vez de por aritmética de esquinas, que
es lo que en el motor grande costó cuatro intentos y una cuña.
