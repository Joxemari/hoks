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

## Lo que elige el autor, cruzado contra la población

24 semillas elegidas sobre el generador con tipos —sin una sola nota, o sea elegidas sin
queja— contra 240 al azar del mismo generador (`cruce.js`). En desviaciones típicas de la
población: por encima de |0,5| la diferencia se ve, por debajo es ruido.

| rasgo | elegidas | población | z | referencias |
|---|---|---|---|---|
| **largo del trazo** | **0,50** | 0,39 | **+1,04** | 0,64 |
| **línea total** | **5,06** | 3,66 | **+0,82** | **5,21** |
| **anchura de banda** | **0,05** | 0,06 | **−0,79** | 0,05 |
| **quiebros por lado** | **7,03** | 5,98 | **+0,70** | **7,55** |
| acompañado | 0,41 | 0,34 | +0,46 | 0,52 |
| longitud en los ejes | 0,33 | 0,38 | −0,46 | 0,52 |
| trazos | 10,2 | 8,8 | +0,44 | 7,5 |
| separación (anchuras) | 1,22 | 1,37 | −0,42 | — |
| tipo denso | 0,79 | 0,61 | +0,36 | — |
| cabos al aire | 0,09 | 0,14 | −0,37 | 0,18 |

**Su ojo y las referencias dicen lo mismo.** Elige las de trazo más largo, más línea, banda
más fina y más quiebros — que son exactamente cuatro de los rasgos que el generador tenía
peor. Y las que elige **ya alcanzan la línea total de las referencias** (5,06 contra 5,21)
y casi su cadencia de quiebros (7,03 contra 7,55): está seleccionando la cola buena de mi
distribución, y esa cola cae donde caen las seis.

No hay que elegir entre «lo que miden las referencias» y «lo que le gusta». Apuntan al
mismo sitio, y eso vale como validación cruzada del banco de invariantes entero.

Lo que su ojo añade y las referencias no decían: **prefiere la banda fina** (−0,79). Eso
no es un invariante de la fuente —las seis van de 0,025 a 0,096— es una preferencia suya,
y como tal se anota aparte.

## Dos avisos de método

- **La semilla no vale sin el código que la hizo.** Las 15 semillas con nota son de la
  versión anterior del generador; pasadas por el código de hoy dan otra obra. Lo que se
  guarda tiene que llevar la versión al lado, o el juicio se despega de lo juzgado.
- **`tipo` no se devolvía**, así que la primera vez que crucé denso contra abierto la
  columna salió 0,00 en los dos lados. Eso no es un empate: es que no se medía nada. Con
  el dato puesto sale +0,36 hacia lo denso.

## El orden, dictado a mano por el autor

Un esquema suyo en un cuaderno, y es un algoritmo entero:

1. **Dibujar primer trazo** — y el dibujo son **puntos sueltos**.
2. **Unir puntos.**
3. **Dibujar otros trazos, también partiendo de sus puntos** · *paralelizar / solape* ·
   ***atraer ↑↑***
4. **Dar cuerpo.**
5. **Revisar márgenes.**

**El orden es el hallazgo, no un detalle de implementación.** El generador anterior
*caminaba*: paso a paso, comprobando en cada tramo si cabía y girando cuando no. Por eso
un trazo que entraba en un callejón moría ahí —nunca retrocede— y el largo se quedaba en
0,35 contra 0,64, arrastrando a la línea. Sembrando los puntos ANTES y uniéndolos después
no hay callejón que valga: **la longitud la ponen los puntos, no lo lejos que se consiga
caminar.**

Y la **atracción** es el mecanismo que faltaba para el punto 5 del encargo —«cada punto del
trazo lleva un valor y si tiende a solaparse»—: el valor no se evalúa andando, se aplica
**al punto** cuando se coloca. Fuerte, cae encima (solape); media, cae al canal
(paralelizar); débil, se queda donde estaba. El cruce ya no se evita caminando: se
**repara** apartando el vértice, porque la longitud ya está decidida.

| rasgo | caminando | **puntos primero** | referencias | |
|---|---|---|---|---|
| **largo del trazo** | 0,35 | **0,49** | 0,64 | +40 % |
| **línea total** | 3,28 | **4,68** | 5,21 | +43 % |
| **quiebros por lado** | 6,03 | **7,58** | **7,55** | ✔ |
| longitud en 4 rumbos | 0,61 | **0,59** | **0,60** | ✔ |
| cruces entre centros | 0 | **0** | **0** | ✔ |
| acompañado | 0,35 | **0,39** | 0,52 | ↑ |
| ángulo de quiebro | 32,6 | 37,2 | 32 | |
| cierre | 0,20 | 0,38 | 0,30 | |
| cabos al aire | 0,10 | 0,06 | 0,18 | |

La población entera cae ya donde caían **las obras que el autor elegía** del generador
anterior (largo 0,50, línea 5,06).

## Lo que falta, con su causa

- **Demasiado pegado.** Con la atracción puesta las obras se leen como una masa con
  pelos, y las seis tienen más aire. La atracción necesita techo, o un `solape` que no
  cierre el canal.
- **Se abrazan al marco.** `dentro()` recorta el punto contra el pliego, así que los
  puntos se apilan a lo largo del borde. Hay que rebotar, no recortar.
- **El acompañamiento (0,39 contra 0,52).** Va subiendo con cada vuelta y ya no está lejos.
- **El cierre (0,38 contra 0,30) y el ángulo (37 contra 32).** Sembrar sin comprobar deja
  al trazo girar más de lo que gira la fuente.
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
