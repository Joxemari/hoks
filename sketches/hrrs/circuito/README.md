# El circuito

## LOS CUATRO PROBLEMAS

El autor los separó, y esta división manda sobre el resto del documento — dos días de vueltas
salieron de tratarlos como uno:

| | problema | quién lo posee |
|---|---|---|
| **1** | **La fisicalidad del trazo**, su diseño | `trazo.js` · banco: `fisica.html` |
| **2** | **El primer trazo**, cómo se dibuja | `gen.js`, fase 1–2 |
| **3** | **Las relaciones de trazos** | `gen.js`, fase 3: las cuatro categorías y el offset |
| **4** | **La densidad**: cómo la elongación rellena y fija los márgenes | `gen.js`, fase 6: `semis` y `contornoDe` |

Y una regla de método que sale de haberlos mezclado: **cada problema se juzga en su propio banco.**
El trazo no se puede decidir mirando una composición de nueve, porque lo que falla no se sabe de
quién es.

### El problema 1, aparte

*«No dibujas una línea, simplemente una línea con otra paralela, sin más, que tenga algo de curva.»*
Y tenía razón en el diagnóstico: lo que el generador producía **no era una línea con cuerpo**, era un
eje y dos bordes desplazados. El carácter se le pedía al borde —que respirara, que temblara— cuando
el carácter de un trazo está en **su recorrido**. Un borde irregular sobre un eje sin gesto da un
trazo irregular, no un trazo con carácter — que es exactamente lo que él vio: *«demasiado irregular,
muy digital»*, las dos cosas a la vez.

`trazo.js` define un trazo por lo que un trazo tiene, y en este orden de tamaños:

1. **El recorrido** — tiradas rectas unidas por esquinas, y sobre todas ellas **una curva larga**:
   el brazo pivota, no es un plóter. La curva es del trazo entero y no de cada tramo; una deriva por
   tramo daba curvas de nivel, y eso ya se descartó midiendo.
2. **La esquina** — viva o con radio. Una esquina en ángulo perfecto es lo que más delata el vector.
3. **El cuerpo** — la anchura se abre y se cierra a lo largo. Es la irregularidad **grande**, la del
   gesto.
4. **El filo** — la desviación del borde, medida en 0,177 (r1) y 0,117 (r5). Es la **pequeña**, la
   del corte. Y ahí estaba el error: se le pedía todo al filo, que es la última y la menor de las
   tres.
5. **Los cabos** — a escuadra, pero **no perpendiculares**: un cabo perpendicular es la firma del
   vector.

`fisica.html` es su banco: un trazo solo, grande, con **seis físicas** —dos de ellas medidas sobre
r1 y r5, no inventadas— para elegir una con un clic y afinarla. Lo que se toca se aplica sólo a la
elegida, así que las otras cinco siguen ahí para comparar.

---

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

## R4 ES UN ERROR, y eso cambia dos cosas

Palabras del autor: **«r4 es un error, nunca debe fundir.»** Las bandas no se funden jamás, y
eso deja de ser una tendencia medida para ser una **regla absoluta**.

**Primero: el generador la rompía en el 63 % de las obras.** Medido sobre el píxel, no sobre
la geometría, porque fundirse es un hecho del dibujo: dos centros que no se cruzan pueden
pasar a menos de una anchura y las bandas se tocan igual. La tinta de una obra tiene que tener
exactamente tantos trozos conectados como trazos, y salían menos.

Dos causas, las dos mías y de bulto:

- **El «solape justificado» mandaba una banda encima de otra** (`meta = 0`). Eso es fundir por
  diseño. Su idea y su regla se reconcilian de una manera: la fuerza de solape dice **cuánto se
  arrima**, hasta el canal y nunca a través. Y el corte de cruces **eximía** a los cruces
  justificados, cuando un cruce *es* una fusión.
- **El canal se medía vértice a vértice.** Dos tramos pasan a menos de una anchura entre
  vértice y vértice y las bandas se tocan igual. Ahora se mide **tramo contra tramo** y se abre
  a empujones hasta que cabe (`abreCanal`).

`funde.js` es el detector y `controles.sh` lo rompe a propósito de tres maneras — sin abrir el
canal (77 % funde), midiendo sólo los vértices (53 %) y con el suelo del corredor por debajo de
la anchura de banda (67 %)—. **Un cero sin control no significa nada.** Y un control que *no*
disparó también dijo algo: devolver el `meta = 0` no funde, porque `abreCanal` lo limpia
después. La pieza que sostiene la regla es abrir el canal, no el cambio del solape.

Queda un residuo honesto: **2 obras de 60 salen con una banda PARTIDA** por el foso de otra —
el mismo defecto por el otro lado, y una banda interrumpida es tan falsa como dos fundidas.

**Segundo: r4 contaminaba los objetivos.** Al fundirse corrompió su propia geometría trazada —
`cuerda` **0,23** cuando las otras cinco van de 0,59 a 0,84, y **cinco cabos tocando el borde**
cuando las demás tienen cero o uno. Las medianas cambian al quitarlo:

| rasgo | con r4 | sin r4 | |
|---|---|---|---|
| **largo del trazo** | 0,644 | **0,568** | **−12 %** |
| **reparto** | 1,565 | **1,800** | **+15 %** |
| **giro** | 32 | **35** | +9 % |
| quiebros por lado | 7,55 | 6,90 | −9 % |
| trazos | 7,5 | 8,0 | +7 % |
| sobre los ejes | 0,515 | 0,490 | −5 % |
| polo | 0,405 | 0,380 | −6 % |
| cuerda | 0,76 | 0,79 | +4 % |

Y de ahí sale **el peor error de método de toda la sesión**: la familia llevaba media sesión
persiguiendo un trazo de 0,64 que no existe, y yo subí la longitud de siembra **dos veces**
para llegar a él. Tres veredictos se dan la vuelta al corregirlo.

`acomp` y `cabosLibres` se quedan como estaban: son los valores recalculados en anchuras de
banda y no se sabe cuál de los seis era r4, así que quitarlo a ciegas sería inventar.

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

## Las dos fases, y las tres variables en su sitio

El autor completó el esquema con la pieza que faltaba: **todos los trazos se siembran
primero**, como líneas de un píxel y sin nada aplicado, y **después** el campo actúa sobre
el conjunto entero. Antes el campo se aplicaba mientras se construía, así que el primer
trazo quedaba congelado y los últimos hacían toda la acomodación: la obra se leía como un
protagonista y un montón de sirvientes. **En su orden el protagonista también se mueve.**

Y sus tres variables, cada una donde él las puso:

- **Gravedad, del trazo.** «La gravedad que pueda tener cada uno de los trazos». Es una
  **masa**, y una masa mueve un **cuerpo**: el trazo se traslada entero, sin cambiar ni un
  ángulo. Poniéndola punto a punto —el primer intento— el campo deshilacha la polilínea y
  el ángulo de quiebro se va a **124°** contra los 32 de la fuente.
- **Atracción, del punto.** «No sé si tanto en el trazo o en los puntos del trazo». Ahí sí:
  cada punto decide cuánto se deja llevar al carril del vecino.
- **Probabilidad de solape, del punto.** El solape **ocurre** primero y se **justifica**
  después: es un juicio, no una prohibición.

Tres correcciones que costaron una vuelta cada una, apuntadas para no repetirlas:

1. **La gravedad era máxima justo donde debía parar.** Con `d = max(sep, distancia)` el
   tirón vale ~200 en el margen mismo contra 0,3 del muelle: todo colapsa en un grumo
   (`polo` 0,70 contra 0,41). Tiene que tirar de lejos y **morir en el carril**.
2. **El alfabeto no cuantiza, atrae.** Llevando cada tramo al rumbo más próximo el trazo
   dobla 70° ocho veces; las seis doblan 30° cinco veces. **Los trazos de Chillida curvan**:
   los rumbos son atractores y la dirección deriva hacia ellos, con una **esquina** de
   verdad de vez en cuando. Cuantizar daba la estructura dos veces y lo orgánico ninguna.
3. **El barrido de cruces borraba trazos enteros** — n bajaba de 10 a 4. Se recorta, y lo
   que el cruce quitó de recorrido el trazo lo **recrece** por un rumbo que no cruce.

## Partir para acompañar

«Si un punto se atrae a otro de un diferente trazo, uno de esos trazos se parte en más
puntos: una parte del trazo sí está paralelizada con otra a la que se ha traído, y luego ya
**cambia de rumbo hacia donde estaban los puntos del trazo original**.» Es lo que separa un
roce de una paralela: la atracción mueve **un punto**, y un punto se toca y se va;
acompañar es un **tramo**, y para tener tramo hay que tener puntos.

Está implementado como un **empalme**, no como una mezcla, y va **al final de todo**. Cinco
cosas que hubo que arreglar antes de que sumara nada, cada una medida:

| lo que hacía mal | qué pasaba |
|---|---|
| proyectar cada punto sobre *su* punto más cercano del vecino | dos trazos de través caen todos en el mismo sitio: **un nudo, no una paralela** (0,43 → 0,35) |
| arrastrar los puntos hacia el carril en vez de empalmar | el trazo se comprime y se enrolla: cierre 0,61, y **el primer cruce de toda la serie** |
| hacerlo antes del encauzado | el encauzado reconstruye desde el medio y **despega el tramo en bloque** (0,43 → 0,27) |
| construir el carril con la normal desplazada | en un doblez la paralela de dentro **corta la esquina**: 91 de 222 propuestas tumbadas. El carril es el **offset** del vecino |
| juzgar la propuesta sobre el trazo entero | el ancla es por definición el punto más próximo a otro trazo: la prueba **castigaba la propuesta por el estado que venía a arreglar** |
| coger el primer empalme limpio | el codo salía de 90°: acompañaba **grapando**. Se busca el más tangente |

Arreglado todo, el desvío suma **+0,03** de acompañamiento pagando dos codos. Es poco, y es
un dato: no es un fallo de ajuste.

## Lo que falta, con su causa

- **El acompañamiento (0,38 contra 0,52).** El número **no subió** al arreglar la
  geometría: bajó de 0,44 a 0,38. No es una regresión — el 0,44 estaba medido sobre bandas
  que **se solapaban** (se dibujaba `1,35·W` con los centros a `1,30·W` como mucho), así
  que aquello no era acompañar, era chocar. Dos mecanismos más probados y **descartados por
  peores**: que la atracción vaya a un **socio** fijo en vez de al vecino más próximo
  (0,34), y añadir el socio como tirón de largo alcance (0,38). La conclusión, medida:
  **acompañar no se consigue empujando trazos que nacieron sueltos.** En las seis el trazo
  *nace* acompañando, y eso pide sembrar unos como offset de otros — que choca de frente
  con «los trazos se siembran sin mirarse». Esa decisión es del autor, no mía.
- **El eje y el doblez se pelean, y no es un mando mal puesto.** Si media longitud va sobre
  dos ejes perpendiculares hay que doblar 90° para pasar de uno al otro: el barrido va de
  (ejes 0,35 / giro 40) a (0,48 / 48) y **no hay combinación que dé 0,52 con 32**. Las seis
  lo resuelven con tiradas de eje **largas** y transiciones por los oblicuos: el rumbo
  tendría que durar un tramo declarado, no decidirse tramo a tramo.
- **El cierre (0,40 contra 0,30) y los cabos al aire (0,07 contra 0,18).**
- **Componer, y ahora más.** Con el canal garantizado y el trazo en su largo real, la mitad de
  las obras salen **en confeti**: bandas cortas y sueltas sin relación entre sí. Abrir el canal
  separa y el trazo corto no llega a nadie, así que la cohesión se queda sin de dónde salir. Es
  el mismo agujero que el acompañamiento, visto desde la composición.
- **Las ramas.** Cinco en r6, ninguna en las otras cinco. El trazo es un árbol y el
  generador sólo hace caminos.

## Dónde está hoy, medido a 200 obras

| rasgo | caminando | puntos primero | **dos fases** | referencias | |
|---|---|---|---|---|---|
| **largo del trazo** | 0,35 | 0,49 | **0,68** | 0,64 | ✔ |
| **línea total** | 3,28 | 4,68 | **4,97** | 5,21 | ✔ |
| reparto | — | 1,85 | **1,49** | 1,56 | ✔ |
| longitud en 4 rumbos | 0,61 | 0,59 | **0,60** | 0,60 | ✔ |
| rumbo dominante | — | 0,19 | **0,22** | 0,24 | ✔ |
| cuerda / largo | — | 0,89 | **0,75** | 0,76 | ✔ |
| polo | — | 0,38 | **0,39** | 0,41 | ✔ |
| quiebros por lado | 6,03 | 7,58 | **7,14** | 7,55 | ✔ |
| cruces entre centros | 0 | 0 | **0** | 0 | ✔ |
| trazos | — | 10 | **8** | 7,5 | ✔ |
| ángulo de quiebro | 32,6 | 37,2 | 40,7 | 32 | |
| cierre | 0,20 | 0,38 | 0,40 | 0,30 | |
| **sobre los ejes** | — | 0,34 | **0,40** | 0,52 | ↑ |
| **acompañado** | 0,35 | 0,39 | 0,38 | 0,52 | ↑ |
| cabos al aire | 0,10 | 0,06 | 0,07 | 0,18 | |

## LA TÉCNICA, mirada en los originales

*«Los trazos parecen demasiado vectoriales. Los de Chillida tienen cierto contorno, cierto
carácter orgánico.»* Y luego: *«tiene que ser la de Chillida. No sé si era grabada, pero los
grabados dejan imperfecciones.»*

No se adivina: se recortan las bandas reales a resolución nativa y se mira. **Y no hay una
técnica, hay tres:**

| | el negro | el filo | qué es |
|---|---|---|---|
| **r1, r4, r5** | **plano** | **limpio** | litografía, serigrafía u offset |
| r3 | plano, papel muy granulado | **blando** | aguatinta |
| r2, r6 | **lleno de motas claras** | **dentado** | xilografía o linóleo: la gubia deja el taco irregular |

Medido dentro de la tinta de las de taco: motas de 2–3 px —**0,06–0,09 anchuras de banda**—,
elongación **2 a 1**, cobertura del 11 al 23 %. Y r6 casi plano: desviación del 3 % del rango
contra el 17–28 % de las otras.

**El autor eligió r1, r4 y r5**, descartó r3 —*«además se juntan y no tiene sentido para lo que
estamos haciendo»*, que es exactamente la regla de no fundir— y dejó r2 y r6 fuera. Así que
**tinta plana y filo limpio**, y *«lo importante es que parezca orgánico y que las rectas no sean
ultra digitales»*.

### Tres texturas probadas y tiradas, con su razón

- **El pastel** (relleno gris mordido por el diente del papel): con mordiscos grandes sale un
  **cielo estrellado**, que es ruido de fotocopia y no materia.
- **La pasada de pastel a lo largo del trazo** (quitar tinta donde la mano apretó menos): sale
  **cromado**. Los tramos con remate redondo se solapan, el alfa se acumula y la banda parece un
  tubo con luz.
- **La huella de gubia** (motas alargadas en la dirección del trazo, del tamaño medido): es
  correcta —es r2 y r6— y el autor no la quiere.

Lo que queda es lo que hace que **r1 no parezca vectorial teniendo la tinta plana**: el filo es
limpio pero **no es recto**, porque lo cortó una mano. Todo el carácter está en el contorno.

### El filo, medido y reproducido

`filo.py` corta las bandas reales perpendiculares a su eje y mide hasta dónde llega la tinta:

| | las seis | **r1 / r5** | el generador |
|---|---|---|---|
| sd de la semianchura | 0,215 | **0,177 / 0,117** | **0,119** |
| parte rápida | 0,061 | — | 0,040 |
| escala de la variación | 0,3 anchuras | — | — |
| correlación entre los dos filos | +0,32 | — | 0,12 |

El rango que importa es el de r1 y r5, no el de las seis: **r2 y r6 desvían el doble porque son de
taco**. Y para poder variar a esa escala el contorno se construye sobre un **eje remuestreado
fino** —antes colgaba de los cuatro o cinco vértices del trazo, así que no podía respirar ni
queriendo— con **tres octavas**: una lenta que engorda y adelgaza la banda, una media, y una rápida
muy corta a propósito, porque puesta entera el filo sale **en diente de sierra**, que es otra manera
de ser digital. Un tercio del temblor es común a los dos filos —la banda cambia de grosor— y dos
tercios propios de cada uno —el filo tiembla y el eje no se mueve—, que es lo que dice esa
correlación de +0,32.

## LOS CABOS DE r1 A r6, uno a uno

102 cabos en las seis. `cabos.py` los clasifica sobre los ejes marcados a mano y en **anchuras de
banda reales** —la única unidad en que las seis se comparan: sus bandas van de 0,0325 a 0,0909 del
lado corto, casi el triple de una a otra—.

| obra | trazos | cabos | al aire | contra un cabo | contra el costado |
|---|---|---|---|---|---|
| r1 | 8 | 16 | 3 (19 %) | 2 | 11 |
| r2 | 11 | 22 | 4 (18 %) | 10 | 8 |
| r3 | 7 | 14 | 4 (29 %) | 7 | 3 |
| r4 | 5 | 10 | 4 (40 %) | 4 | 2 |
| r5 | 6 | 12 | 2 (17 %) | **10** | **0** |
| r6 | 14 | 28 | **0** | **23** | 5 |
| **total** | 51 | **102** | **17 %** | **55 %** | **28 %** |

**1. El remate dominante es cabo contra cabo, no la T.** 55 % contra 28 %. Yo tenía la T como el
caso normal y el encuentro de dos cabos como la rareza; es al revés. En r5 son 10 de 12 y ni un
solo costado; en r6, 23 de 28.

**2. No hay un margen: hay TRES, y cada uno es de una situación.** Medidos entre tintas:

| | hueco |
|---|---|
| entre dos trazos paralelos | **0,22 W** |
| cabo contra el costado de otro | **0,48 W** |
| cabo contra cabo | **1,02 W** |

Un encuentro de dos cabos deja **casi cinco veces** el canal de una paralela. Eso explica por qué
mis obras se leen apretadas: aplico 0,22 en todas partes.

**3. El ángulo de llegada es BIMODAL, y el centro está vacío.** No es una distribución con
dispersión: son dos gestos declarados.

| grados | 0-15 | 15-30 | 30-45 | 45-60 | 60-75 | 75-90 |
|---|---|---|---|---|---|---|
| contra un cabo | **28** | 2 | 0 | 0 | 0 | **26** |
| contra el costado | **11** | 0 | 0 | 0 | 3 | **15** |

O el trazo llega **de frente** y se para —una T, o dos cabos enfrentados— o muere **en paralelo**,
al lado de su vecino, que es el final de un acompañamiento. Entre 30° y 60° no hay **ni uno**.

**4. Y cada obra decide lo suyo.** De 0 cabos al aire en r6 a un 40 % en r4. No es una constante
global: es una decisión de la obra, como el tipo.

**5. La mitad de los cabos al aire se van del papel.** 8 de 17 están a menos de una anchura del
borde. Y por obra: r4 tiene 6 cabos de 10 a menos de una anchura del borde, r5 6 de 12, r6 11 de
28 — contra 1 ó 2 en r1, r2 y r3. **Hay obras que son un recorte de una composición mayor y obras
que caben enteras en su pliego.** Mi generador rebota contra el margen: nunca puede hacer la
primera.

**6. Los dos cabos de un trazo hacen lo mismo sólo el 43 % de las veces**, o sea que cada cabo se
decide por su cuenta. Eso sí lo hago bien.

`cabos.py` imprime la tabla y dibuja la clasificación encima de cada obra, para poder auditarla a
ojo en vez de creérsela: círculo hueco = al aire, cuadrado = llega de frente, barra = muere en
paralelo.

### Aplicado, y lo que no entró

**Los tres márgenes son UN número.** Eje a eje sale 1,02 contra un cabo y 0,98 contra un costado —
el mismo—, así que la regla es **un cabo se para a una anchura de banda del eje del vecino**, y los
dos huecos de tinta distintos (1,02 W y 0,48 W) salen solos de si el vecino tiene tinta ahí o no.
Un número, no tres. ✔

**Cada obra decide su tasa de cabos al aire**, de 0 a 40 %, en vez de una constante. ✔ Con eso
`cabosLibres` sube de 0,04 a **0,11** contra el 0,17 de las seis.

**Las obras recorte.** La mitad de los cabos al aire de las seis están a menos de una anchura del
borde, y por obra se reparte muy desigual: r4, r5 y r6 tienen la mitad de sus cabos pegados al
borde y r1, r2, r3 uno o dos. **Hay obras que son un recorte de una composición mayor**, y el
paseo rebotaba contra el margen: era imposible ni por accidente. Ahora el 40 % de las obras nace
recortada y sus trazos se salen del pliego. ✔

**Los dos gestos, sí — pero sólo llegan al 19 % de los cabos.** Cuatro construcciones probadas y
las cuatro rechazadas por la geometría: apuntar el último tramo al vecino (el ángulo sale el que
sale, y el que salía es justo el que no existe en las seis); meter un codo para que el último tramo
sea el gesto exacto (rompe el contorno: 13 obras de 60 con la banda partida en dos, y el
acompañamiento de 0,52 a 0,38); filtrar los vecinos que están enfrente y elegir el sentido del
gesto en vez de sortearlo (del 17 % al 20 %); y decirle al paseo a dónde va para que se acerque
mientras anda (sin cambio). El desglose por causa: los dos topes de grapa y el estorbo se llevan
casi todo.

**La conclusión, después de medir las cuatro: rematar no es un paso que se añada al final.** Es
parte de cómo se anda el trazo, y andarlo *hacia un destino con un ángulo de llegada declarado* es
otra pieza de modelo. Es la cuarta vez que esta familia aprende lo mismo —el campo no puede
arreglar lo que no compuso, la paralela hay que derivarla y no acercarla, el canal hay que
respetarlo al dibujar y no abrirlo después— y la cuarta vez con la misma forma: **lo que se
construye sale; lo que se retoca, no.**

### Dos controles que dieron la vuelta a dos decisiones

Aislando la caída del acompañamiento (0,52 → 0,43) con un control por cambio:

| variante | acomp | giro |
|---|---|---|
| como estaba | 0,43 | 51,1 |
| con la tasa de cabos al aire FIJA en 0,18 | **0,50** | 49,2 |
| **sin la meta del paseo** | 0,46 | **45,4** |
| sin las obras recorte | 0,40 | 51,2 |

- **La meta del paseo sale fuera.** Costaba 0,03 de acompañamiento y 6° de ángulo de quiebro, y no
  compró nada donde tenía que comprar: los remates se quedaron en el 19 % con ella y sin ella. Un
  trazo que persigue un punto deja de seguir su alfabeto, que es lo que le daba el carácter.
- **La tasa de cabos al aire no es libre: va con la densidad.** Las seis, ordenadas por número de
  trazos: 14 → 0 %, 11 → 18 %, 8 → 19 %, 7 → 29 %, 6 → 17 %, 5 → 40 %. **Cuantos más trazos, menos
  cabos al aire** — y tiene sentido: en una obra apretada un cabo tiene contra qué morir y en una
  dispersa no hay nada enfrente. Atada al tipo, la variación se conserva y el acompañamiento vuelve
  a 0,50. Sorteándola libre, costaba 0,07.
- Y las obras **recorte** ayudan (0,43 contra 0,40 sin ellas), al contrario de lo que suponía.

### Y un fallo del instrumento, no del generador

`funde.js` marcaba 12 obras de 60 con «la banda partida». No lo estaban: **son las obras recorte**
— un trazo que se sale del pliego y vuelve a entrar aparece como dos piezas de tinta, y eso es el
recorte, no un defecto. Corregido en el detector. La fusión se sigue midiendo igual, porque dos
bandas que se tocan se tocan, recortada la obra o no.

Queda **1 obra de 80 que funde**, con semilla: `be1e5234`. Diagnosticada — el relleno se pasa 0,004
en un par— y con tres arreglos ya aplicados en el camino, el último de ellos el que importa: **el
lado no se decide con un solo punto.** Se cogía el punto más cercano del vecino y, si caía al otro
lado, se descartaba al vecino entero para ese borde aunque otra parte suya sí estuviera enfrente.
Y el hueco se mide entre TRAMOS y no desde el vértice: **es la tercera vez que ese mismo error
aparece** —el suelo del campo, el abrir el canal y ahora el relleno— y las tres por lo mismo, que
la regla es sobre tramos y la medida era sobre vértices.

## UN TRAZO NO SE CRUZA CONSIGO MISMO — y estaba sin comprobar

Lo cantó tres veces sobre tres obras distintas: *«hay un trazo que se sigue cruzando consigo
mismo, que ya hemos dicho que esto es imposible»*. Tenía razón y la causa es de una línea: la
función que impide los cruces dice `if (j === k) continue`, o sea que **salta el propio trazo**.
Nunca se había mirado. `solo.js` lo mide: **66 obras de 120, el 55 %**.

Arreglado en la raíz —el paseo se mira a sí mismo antes de dar cada tramo, y no basta con no
cruzarse: meterse en el propio canal es igual de imposible— más una comprobación final para el
offset de las paralelas y el remate de los cabos, que pueden crearlo después. **0 de 120.**

Y un efecto que no esperaba: **el acompañamiento subió de 0,44 a 0,50 sin tocar nada más.** Un
trazo que no se dobla sobre sí mismo corre al lado de otro.

## EL CUERPO: EL RELLENO HASTA EL MARGEN, Y TRES CONTORNOS

*«El centro de trazos seguiría siendo el mismo, pero rellenaríamos la diferencia hasta dejar el
margen entre los trazos.»* La banda **no es de anchura constante**: `W` es su mínimo, y donde hay
sitio la tinta **crece hacia el vecino** hasta dejar el canal — y crece **por cada lado por
separado**, así que el centro puede no quedar en el centro visual. Es lo que él describió hace
mucho, y es lo que hace que los márgenes se lean constantes: **lo constante no es la banda, es el
hueco que queda entre dos.**

Con eso, **el canal sale de la geometría y no de pintar un foso blanco encima**. El foso era un
apaño: tapaba al vecino para fabricar un canal que la banda no dejaba. Ya no está.

Y *«distingo dos o tres contornos de trazos, podrían alternarse o relacionarlos con el grosor»*:
tres, la obra elige dos y los alterna, y cuál le toca a cada trazo lo **inclina su grosor**.

- **limpio** — el borde recto. El de la banda fina.
- **vibrado** — el borde ondula, y cada lado por su cuenta. **No es que el trazo curve** —eso era
  la curva de nivel que hubo que matar— **es que el filo tiembla**. Ahí está lo orgánico.
- **gubia** — engorda por el medio y afina en los cabos, como un corte de gubia.

Dos cosas que costaron: creciendo **hacia el vacío** la obra sale a lozas (rellenar hasta el
margen sólo significa algo cuando hay un margen que dejar, así que se crece sólo hacia un vecino a
tiro), y el techo absoluto de la banda tuvo que bajar a 0,062 porque en una obra dispersa el
percentil 25 cae en un hueco grande y la banda se vuelve un bloque.

`contornoDe(obra, k)` vive en el generador y no en cada dibujante: la banda ya no es una línea
gruesa, y tres dibujantes con tres copias de esa geometría serían tres bandas distintas.

### Dónde queda

| rasgo | generador | refs (5) | |
|---|---|---|---|
| **acompañado** | **0,52** | **0,52** | ✔ |
| línea total | 5,06 | 5,19 | ✔ |
| largo del trazo | 0,54 | 0,568 | ✔ |
| reparto | 1,77 | 1,80 | ✔ |
| rumbo dominante | 0,23 | 0,24 | ✔ |
| longitud en 4 rumbos | 0,63 | 0,60 | ✔ |
| anchura de banda | 0,062 | 0,061 | ✔ |
| cruces entre trazos | 0 | 0 | ✔ |
| **un trazo consigo mismo** | **0** | 0 | ✔ |
| fusiones | 0 | 0 | ✔ |
| sobre los ejes | 0,41 | 0,49 | ↑ |
| cierre | 0,39 | 0,30 | |
| cuerda | 0,86 | 0,79 | |
| ángulo de quiebro | 45,1 | 35 | ↓ |
| quiebros por lado | 4,32 | 6,9 | ↓ |
| cabos al aire | 0,04 | 0,18 | ↓ |

Lo que queda, y ya está localizado: **se dobla poco y demasiado** —45° cuatro veces por unidad de
longitud contra 35° siete veces— y **casi ningún cabo muere al aire** (0,04 contra 0,18), cuando
él pide justo lo contrario: que un cabo termine en abierto *o* contra un cuerpo, y que se note
cuál de las dos cosas es.

## LA COHERENCIA NO LA DA UN CAMPO: LA DA DERIVAR

Su juicio: *«el punto 5 sigue curvando de manera excesiva, y ninguna tiene coherencia visual
similar a las de Chillida, el campo no está bien logrado»*. Las dos cosas eran ciertas y ninguna
era del campo — que ya estaba **apagado**.

**Lo que curvaba era la siembra.** Cada paso derivaba hacia su rumbo y llevaba un temblor de ±9°;
acumulado sobre cinco o seis pasos eso no es un trazo con carácter, es una **curva de nivel**. Un
trazo de Chillida es una sucesión de **rectas unidas por esquinas**: dentro de un tramo la
dirección no cambia. Y el error de mano se tira **una vez por trazo**, no por paso — uno que se
sortea a cada paso es ruido; uno que se sortea una vez es la mano de quien dibuja.

**Y la coherencia se consigue derivando, no atrayendo.** Una paralela nacía al lado del padre y se
iba por su cuenta: dos trazos compartían un punto de partida y nada más. En las referencias una
paralela es **la misma línea desplazada** —r3 y r5 son haces de tres, cuatro y cinco curvas casi
idénticas—, y de ahí sale la coherencia: **los trazos se parecen porque uno está derivado del
otro**. Eso es lo que el campo intentaba fabricar después y no puede.

Tres cosas que costó que el offset funcionara, cada una medida:

| lo que fallaba | qué pasaba |
|---|---|
| el offset por la normal de **un** tramo | en las esquinas el punto sale mal colocado. La construcción es la **bisectriz**, la misma con la que el motor grande dibuja el borde de una banda |
| **un solo intento** por paralela | el carril de un padre se ocupa en cuanto le sale la primera —a menudo con otra paralela del mismo padre—, así que se rechazaban 9 de cada 10 y caían a `suelta`. Con doce intentos (padres, lados y ventanas): **12 → 100 paralelas** en 40 obras, y el acompañamiento 0,25 → 0,44 |
| el tope de la banda en 0,098 | casi una décima del pliego. Con la composición holgada el percentil 25 llegaba hasta ahí y una obra de trece trazos salía como un **rectángulo negro**. La banda se mide contra la separación con la que se compuso, no contra un número absoluto |

Y dos avisos de método, los dos de la misma familia: **un mando que no está cableado da números
idénticos y parecen medidas**. Pasó con `barre.sh` —midiendo `gen13` mientras yo leía como si fuera
`gen22`— y volvió a pasar con el rango de los oblicuos, que existía en el generador viejo y no en
el nuevo: tres filas de barrido exactamente iguales.

### Dónde queda

| rasgo | generador | refs (5) | |
|---|---|---|---|
| línea total | 5,71 | 5,19 | ✔ |
| largo del trazo | 0,60 | 0,568 | ✔ |
| rumbo dominante | 0,25 | 0,24 | ✔ |
| cuerda | 0,75 | 0,79 | ✔ |
| **anchura de banda** | **0,063** | **0,061** | ✔ |
| cruces | 0 | 0 | ✔ |
| fusiones | 0 | 0 | ✔ |
| **celdas de blanco** | **1** | 1–4 | de 0 a 1 |
| **cierre** | **0,30** | **0,30** | ✔ |
| acompañado | 0,50 | 0,52 | casi |
| sobre los ejes | 0,43 | 0,49 | ↑ |
| ángulo de quiebro | 43,2 | 35 | ↓ |
| quiebros por lado | 3,87 | 6,9 | ↓ |
| cabos al aire | 0,07 | 0,18 | ↓ |

**Y una distinción que hay que tener presente**: el remate *intenta* un gesto y **falla tres veces
de cada cuatro**, pero el cabo tampoco queda al aire —`cabosLibres` es 0,07— porque se para donde
sea, cerca de algo, sin gesto legible. Eso es exactamente lo que el autor vio: *«algunas
terminaciones tengan más sentido»*. El 75 % de intención fallida y el 7 % de cabos realmente libres
son dos medidas distintas y las dos hacen falta.

Lo que sigue faltando: **el quiebro es demasiado grande y hay demasiados pocos**. Un trazo dobla
46° cinco veces por unidad de longitud y las referencias doblan 35° siete veces. Y **el cierre**
(0,45 contra 0,30): los trazos se enrollan más de lo que se enrolla la fuente.

## METER UN CHILLIDA EN NUESTRO MOTOR

La prueba que faltaba, y la que contesta «¿qué nos falta para hacer r1 y r2?». `mano.json` tiene
el trazo de un píxel de cada obra tal como el autor lo marcó; `desde_mano.js` lo carga y
`circuito(seed, {geometria})` le aplica **sólo los pasos de después** — el campo y la densidad.
Sin esto la única comparación posible es la nuestra contra la suya, y ahí los dos errores se suman
y no se distinguen.

**Tres respuestas, y las tres duras.**

### 1. La banda y el canal están BIEN

Vestir la geometría real de r1 y r2 con nuestra regla de densidad **da r1 y da r2**. Se reconoce
la obra. Ese paso está resuelto.

Y de paso se calibró la regla, que estaba mal: usaba el hueco **mínimo**, y eso da una banda un
30–45 % más fina de lo que es. La medida:

| | hueco mín | p25 de los huecos | **W real** |
|---|---|---|---|
| r1 | 0,0280 | **0,0320** | **0,0325** |
| r2 | 0,0284 | **0,0396** | **0,0417** |

**El percentil 25 de los huecos entre pares de trazos ES la anchura de banda**, con un 2 % de
error en r1 y un 5 % en r2 — dos obras independientes, la misma constante. Y lo que eso dice del
cuadro: **el canal no es constante.** La banda lo es y el canal se estrecha donde dos trazos se
juntan; nuestro modelo suponía `separación = banda + canal` en todas partes.

### 2. EL CAMPO DESTRUYE LA OBRA, y no es una opinión

Aplicando sólo el campo a la geometría real de cuatro referencias:

| | celdas de blanco atrapado | tinta |
|---|---|---|
| r1 mano | **1** | 0,188 |
| r1 tras nuestro campo | **0** | 0,123 |
| r2 mano | **2** | 0,153 |
| r2 tras campo | **0** | 0,115 |
| r3 mano | **3** | 0,342 |
| r3 tras campo | **0** | 0,332 |
| r6 mano | **4** | 0,635 |
| r6 tras campo | **0** | 0,356 |

**Borra las celdas de las cuatro, cuatro de cuatro**, y contrae la obra: r6 pierde el 44 % de su
tinta y r1 el 35 %. La gravedad contrae, la atracción disuelve las celdas y el encauzado endereza.

Así que **va apagado** (`VUELTAS = 0`). Y con él apagado la obra mejora justo donde peor estaba:
el ángulo de quiebro pasa de 23,6° a **36,4°** contra los 35 de las referencias, los quiebros por
lado de 10,8 a **6,3** contra 6,9, y la cuerda a **0,78** contra 0,79. Cuesta 0,10 de
acompañamiento (0,43 → 0,33) y ese cambio es el que hay que hacer: **acompañar contrayendo la obra
no es acompañar.** El mando se deja, porque el campo sí sabe arrimar dos trazos; lo que tiene que
aprender es a no contraer.

### 3. LO QUE FALTA: la celda

Las referencias **encierran blanco** —1, 2, 3 y 4 celdas— y las nuestras **0 de mediana en 12**.
El circuito de Chillida **se cierra sobre sí mismo**; el nuestro hace trazos que se esquivan y no
vuelven. Eso no es un parámetro: es una pieza de modelo que no existe, y es la que queda.

`celdas.js` la mide: se dibuja la banda, se engorda por el canal para que las vecinas se toquen
—o sea, se mira la obra como UNA figura— y se cuentan los agujeros.

### Y una atribución equivocada que un control cazó antes de publicarse

Al principio escribí que la regla de no fundir la garantizaba la derivación del percentil. Los
controles no dispararon al romperla, y por una razón: detrás hay una reparación local que separa
los pares más apretados y **arreglaba la rotura del propio control**. La cadena, con cada pieza en
su sitio:

- `W = percentil 25 de los huecos` → pone la **densidad** (calibrada contra r1 y r2).
- la **reparación local** → separa los pares más apretados, para que un caso extremo no arrastre
  la densidad de la obra entera. Toca un puñado de vértices, no la obra.
- `W = min(W, hueco mínimo · 0,98)` → **garantiza** que no funde. Ésta y sólo ésta: quitándola
  funde el 70 % de las obras.

## EL ORDEN, corregido por el autor sobre la autopsia

Vio la autopsia paso a paso y reescribió el orden. Es el que está implementado hoy:

1. **Los puntos del primer trazo.** Sólo del primero — *«hay un montón de puntos, cuando en
   realidad el primer paso debería ser dibujar los puntos del primer trazo»*.
2. **Unir sólo esa línea.** Un trazo de un píxel y nada más en la hoja.
3. **Los demás trazos, ya en relación con lo que hay.** *«Ahí está la parte creativa: cómo se
   dibujan esos trazos o cómo se relacionan. Ahí deberíamos tener diferentes categorías
   visuales.»* Cuatro: **paralela** (nace en el carril del padre), **prolonga** (arranca donde el
   padre acaba), **apoyo** (llega y muere contra el cuerpo) y **suelta** (la que da aire).
4. **El destino de cada cabo**, declarado y sorteado por cabo: *«los cabos tienden a terminar en
   abierto o, si no, terminar contra un cuerpo, ya sea el lateral de un trazo o el final o el
   inicio de un trazo»*. **Abierto** (y se aparta, para que se lea que muere al aire),
   **lateral** (una T contra el costado) o **cabo** (dos finales enfrentados a un canal). El
   reparto lo pone la medida: 18 % al aire en las cinco referencias buenas, o sea 82 % contra
   algo. Y el que muere contra un cuerpo **llega** —el último tramo apunta—, porque de refilón se
   lee como un roce y no como un encuentro.
5. **El campo**, sobre la estructura completa en líneas de un píxel.
6. **La densidad, y no antes.** *«En ese momento, y no antes, se le daría densidad al trazo.»*

### El paso 6 cambia el modelo entero

Antes la anchura de banda se sorteaba **al principio** y toda la geometría se medía en unidades
de ella: el carril, el canal, el suelo. Si la densidad va al final es al revés — la composición
se trabaja en unidades propias y **la banda se corta a la medida del hueco que la composición
dejó**:

    W = hueco mínimo real / (1 + canal)

Y entonces **las bandas no pueden fundirse, por construcción**, sin una sola pasada correctora.
Que es exactamente lo que hacía falta, porque la autopsia había demostrado que las pasadas
correctoras eran las que se llevaban la esencia. Hoy no hay barrido de solape, ni abrir el canal,
ni quitar púas: **no queda un solo martillo**.

Lo que sí hay es un **veto**: si el desplazamiento que propone el campo cruzaría a alguien, ese
punto no se mueve y se queda donde estaba, que era un sitio válido. **Vetar conserva; corregir
destroza** — la misma diferencia que hay entre no dar un paso y darlo y luego arrastrar el pie de
vuelta. Los controles dicen cuáles son piezas: quitando el veto del cuerpo rígido colapsan **30
de 30** obras y quitando el del encauzado **28 de 30**; quitando el de punto a punto, **nada**.
Ese último se deja anotado como lo que es, en vez de fingir que sostiene algo.

### Y dos cosas que costaron encontrar

- **El nacimiento hay que comprobarlo.** El punto de partida se colocaba respecto al *padre* sin
  mirar a nadie más, así que tres o cuatro trazos por obra nacían dentro del canal de un
  **tercero** — y desde ahí no hay salida: todos los primeros pasos estorban, el trazo se atasca
  y logra **cero** de recorrido. **Dos tercios de los trazos morían así**, y de ahí salían la
  mitad de la tinta (línea 2,8 contra 5,2) y el trazo recto (cuerda 0,98). El diagnóstico salió
  de imprimir `pide 0,66 logra 0,00` trazo a trazo.
- **La intención primero y el escape después.** Probando primero «seguir recto» y usando el giro
  sólo como salida de emergencia, el trazo sale recto **por construcción**. Lo que un trazo
  quiere hacer es derivar hacia su rumbo o hacer esquina; esquivar es lo que hace cuando no puede.

### Dónde queda, y qué se ve mal

| rasgo | generador | refs (5) | |
|---|---|---|---|
| trazos | 9 | 8,0 | ✔ |
| línea total | 4,91 | 5,19 | ✔ |
| largo del trazo | 0,54 | 0,568 | ✔ |
| polo | 0,41 | 0,38 | ✔ |
| cruces | **0** | 0 | ✔ |
| **fusiones** | **0** | 0 | ✔ por construcción |
| cuerda | 0,84 | 0,79 | casi |
| quiebros por lado | 10,0 | 6,9 | |
| ángulo de quiebro | 21,6 | 35 | ↓ |
| sobre los ejes | 0,34 | 0,49 | ↓ |
| acompañado | 0,37 | 0,52 | ↑ |

Y dos defectos que se ven a la primera y que los números sólo insinúan:

- **Curvan demasiado.** Las obras leen como **curvas de nivel de un mapa**, no como circuitos
  angulares. Es el quiebro en 21,6° contra 35 y el modelo de deriva: el trazo se engancha a un
  rumbo y lo suelta suavemente.
- **La densidad varía muchísimo de una obra a otra**, de banda gruesa a un pelo. Es la
  consecuencia directa de «densidad al final»: **un solo punto apretado decide la anchura de la
  obra entera**. Es lo que hace que la regla se cumpla sin martillos, y es también su fragilidad;
  el arreglo pasa por que el campo iguale los huecos, no por volver a decidir la banda antes.

## LA AUTOPSIA: qué paso se lleva la esencia

Intuición del autor: *«tengo la intuición de que en alguno de los pasos perdemos el 90 % de la
esencia»*. Era exacta, y es **un solo paso**. `circuito(seed, {pasos:true})` devuelve una copia
de la geometría en cada estación, `pasos.js` la mide con la misma vara y `autopsia.html` la
enseña —una columna por paso, una fila por obra, y hueco para anotar en la celda, en la columna
y en la fila—.

| paso | línea | largo | ejes | giro | vuelta% | acomp |
|---|---|---|---|---|---|---|
| 1 · los puntos | 8,55 | 0,85 | 0,66 | 33 | 14 | 0,21 |
| 2 · unidos | 8,55 | 0,85 | 0,66 | 33 | 14 | 0,21 |
| **3 · relajado** | 6,96 | 0,68 | **0,59** | 26 | 5 | **0,53** |
| **4 · solape roto** | 8,25 | 0,79 | **0,33** | 39 | 5 | **0,27** |
| 5 · cruces cortados | 4,04 | 0,38 | 0,37 | 31 | 4 | 0,32 |
| 6 · recrecido | 5,45 | 0,60 | 0,36 | 36 | 7 | 0,36 |
| 7 · canal abierto | 4,91 | 0,54 | 0,37 | 41 | 6 | 0,33 |
| 8 · acompañado | 4,83 | 0,54 | 0,38 | 41 | 6 | 0,33 |
| **objetivo (5 refs)** | 5,19 | 0,568 | **0,49** | 35 | 1 | **0,52** |

**Después de relajar, la obra está EN EL OBJETIVO de las dos cosas que llevaban toda la familia
sin salir**: sobre los ejes 0,59 contra 0,49, y acompañamiento **0,53 contra 0,52 clavado**. El
barrido de solape se lleva las dos en una sola pasada, y no se recupera nunca. Hay una segunda
pérdida en el paso 5, pero ésa es de **cantidad** (línea 8,25 → 4,04), no de esencia.

La causa: el barrido va **punto por punto**, ocho rondas, martilleando todo lo que baje de `sep`
hasta el carril, sin mirar la dirección del trazo. Deshace lo que el campo acaba de conseguir. Y
`abreCanal` es el mismo martillo: quitando el barrido de solape, el daño se muda al paso 7 —
ejes 0,57 → 0,38, acompañamiento 0,53 → 0,36— exactamente igual.

**LA LECCIÓN:** una regla que hay que cumplir es una **fuerza dentro de la relajación**, no una
pasada correctora después. Corrigiendo después se cumple la regla y se pierde la obra.

### Y el arreglo obvio no funciona, con su razón

Probado en esta misma vuelta, medido y descartado:

- **Poner el suelo del canal como fuerza del campo** (medido entre tramos, que es lo que mide la
  regla): compra un 10 % de fusiones menos a cambio del acompañamiento (0,68 → 0,50) y del largo
  del trazo (0,55 → 0,43). La fusión no nace del campo —en el carril, a 1,24 anchuras, no puede
  haberla— nace de los tres sitios que crean geometría **fuera** del campo: los muñones del
  corte de cruces, los cabos del recrecido y los empalmes del acompañamiento. Una fuerza global
  para arreglar tres sitios locales cuesta la obra entera.
- **Reordenar el circuito** para que la relajación sea lo último (corte y recrecido antes):
  arregla lo que buscaba —ejes 0,77, acompañamiento 0,69— y **rompe la forma del trazo**. Salen
  **peines**: longitud en un solo rumbo 0,69 contra 0,24, cuerda **0,99** contra 0,79, quiebros
  por lado 3,3 contra 6,9, y los cruces vuelven (2 por obra). Y no es un mando: `cuerda` sale
  0,99 en las ocho combinaciones de vueltas y peso del alfabeto que barrí. La causa es que el
  recrecido elige el giro más pequeño, así que alargar un trazo cortado lo alarga **recto**.

O sea que el arreglo pide tres cosas a la vez, no una: que el corte y el recrecido respeten el
canal al crear geometría, que el recrecido conserve la cadencia de quiebro del trazo, y que
después no haya ningún martillo. Eso es la próxima vuelta, no un ajuste.

**Y un aviso de método para mí:** leí «el paso 7 es el mejor estado que ha tenido esta familia»
mirando una tabla de siete rasgos, y el marcador completo decía que `r1`, `cuerda` y
`girosPorLado` se habían ido a hacer peines. Se mide con el marcador entero o no se mide.

## Cuando el ojo dice una cosa y el píxel otra

«Estéticamente sigue sin funcionar vs Chillida en general.» Puestas las seis al lado de una
hoja de contactos, aposté cuatro diagnósticos. **La medida tumbó tres.**

| lo que vi | lo que dice el píxel |
|---|---|
| «las seis son **una figura** cuyas bandas se funden; yo hago cintas separadas» | **falso.** r1 son 8 trozos de tinta desconectados, r6 son 14 — las cuentas de trazos del autor. El canal los separa del todo. Sólo **r4** funde (91 % en una pieza) |
| «las seis **escalonan**, no curvan: tiradas largas rectas» | **falso en la comparación.** La tirada recta de las seis es de 1,1 anchuras de mediana y la mía 2,0: **mis trazos corren más rectos**. El 1,1 es densidad de vértices del trazador, no del cuadro, así que el rasgo no compara |
| «falta una **espina** que cruce la hoja» | **falso.** Extensión máxima: 0,66 del lado corto en las seis, **0,73** en las mías |
| «mis trazos **se doblan sobre sí mismos**» | **cierto, y gordo:** 19 % de mis giros pasan de 110°; en las seis, **1 %** |

Dos rasgos que sí faltaban y no estaban en la lista de quince: **la vuelta atrás** y la
**cobertura de tinta** (20,1 % contra 24,8 %). Ninguno de los dos aparecía en el marcador, y
la vuelta atrás es la que convierte un circuito en un garabato.

La vuelta atrás no estaba donde aposté **dos veces**. Una sonda por fases la localizó:

| fase | vueltas atrás |
|---|---|
| sembrado | 16–50 % |
| relajado | **2–6 %** — el campo las quita |
| barrido de solape | 15–29 % — las vuelve a meter |
| recrecido | 13–22 % — **la fuente principal** |

Tres causas, las tres de la misma forma: **una lista de candidatos que incluye cada rumbo y
su opuesto, sin tope**. En la siembra, encima, el rebote reflejaba **el punto** contra el
pliego, y reflejar el punto es exactamente dar la vuelta — de ahí también que las obras se
abrazaran al marco. Un trazo que llega al canto del papel no rebota: **dobla**. Y el
empujón punto a punto del solape clava púas, que no son giros sino puntos mal puestos: se
quitan, y lo que el trazo pierde de recorrido lo recupera el recrecido.

Resultado: **19 % → 5 %** de vueltas atrás, tinta **23,6 %** contra 24,8, y el ángulo de
quiebro cae a **33,5** contra 32.

Y una confirmación por el otro lado: subir el peso del eje **en la siembra** de 0,52 a 0,92
mueve los ejes de 61 % a 62 %. **El eje no se pierde al sembrar: se pierde después.** La
relajación y el acompañamiento sacan los puntos del eje y el encauzado no los sostiene — lo
mismo que salió al medir gen7 desde la otra dirección. Es la pieza de modelo que falta, no
un mando: **el rumbo tiene que durar un tramo declarado**, no decidirse tramo a tramo.

## Un banco que medía otra cosa

`barre.sh` llevaba el generador **escrito dentro** y se cambiaba a golpe de `sed`. Un `sed`
que no encajó dejó el banco midiendo `gen13` mientras yo leía los números como si fueran de
`gen22`: un barrido entero de cuatro configuraciones, tirado. Ahora el generador es un
argumento. Y `medir.js` pedía un `./gen2.js` que no existe en el repositorio — el
instrumento no arrancaba desde aquí.

**Y nada por debajo de 200 obras significa nada.** Añadir una sola tirada de RNG cambia el
número de sorteos y vuelve a sortear todo lo que viene detrás: a 20 obras un cambio nulo se
lee como una mejora o un desastre de 0,06.

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

**Separación = banda + canal**, y esto es aritmética, no gusto. Se dibujaba `1,35·W` con los
centros a `1,30·W` como mucho: **la banda era más ancha que la separación de centros**, así
que el foso tenía que morder a los vecinos y donde se juntaban tres quedaba un borrón. El
canal son 0,22 anchuras —medido en las seis—, el generador separa los centros por
`banda + canal`, y aquí la tinta es `W`. Es el mismo offset con el que el motor grande corta
el canal, donde el corte **es** la tinta engordada y no una banda más ancha.
