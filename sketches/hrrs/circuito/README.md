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
