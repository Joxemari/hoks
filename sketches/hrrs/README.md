# HRRS — *itzulera*

**Estado: construida y verificada. Hay `algo.js` y harness (`../hrrs/`), está en
`GRADUATED`, y NO está en `data/works.json` ni tiene página** — es una propuesta
de sistema para mirar en el grid de obras y decidir si merece página, como lo
fueron `dtkrt/`, `eclps/` y `evol/` antes que ella. El nombre sigue siendo
provisional: *harresiak*, las murallas, porque el dibujo se lee como el plano de un
recinto. Alternativas si no convence: **BDK** (*bideak*, los caminos) o **MGK**
(*mugak*, los límites).

> Lo que sigue hasta «Lo construido» es el análisis y la gramática tal y como se
> escribieron **antes** del código, sin retocar. Lo que se decidió mirando, lo que
> costó y lo que se midió está al final, y en dos sitios se contradice con lo de
> arriba — dicho en su sitio y con el motivo.

---

## La idea, en una frase

**TRZS es el cruce. EVOL es la soldadura. HRRS es el acompañamiento.**

Las tres son la misma técnica —una cinta de anchura constante que recorre el
marco— con la misma pregunta y tres respuestas distintas: *¿qué pasa cuando la
cinta se encuentra consigo misma?*

- En **TRZS** se **cruza**: una por encima, otra por debajo, y entre las dos
  aparece el suelo como una **incisión**. La profundidad se decide cruce a cruce
  y toda la máquina de esa obra existe para que ese corte se vea.
- En **EVOL** se **funde**: un solo cuerpo, sin encima ni debajo, y el suelo
  queda atrapado en forma de ojo.
- En **HRRS** **no se encuentra**: llega hasta donde iba a tocarse y se pone al
  lado. No hay profundidad porque el dibujo nunca sale del plano; no hay
  soldadura porque nunca se tocan. Entre las dos vueltas queda el suelo, en una
  franja del mismo grosor en toda la obra.

Y de ahí sale lo que hace a esta distinta de las otras dos: **HRRS no necesita
decidir nada.** TRZS decide profundidades y las tiene que poder pintar en plano;
EVOL decide qué se funde con qué. HRRS sólo tiene que **no tocarse**. Es la más
simple de las tres de dibujar y la más difícil de componer, porque cuando quitas
la profundidad no queda nada detrás de lo que esconderse: o el recorrido es
bueno, o no hay obra.

## Por qué no cabe dentro de TRZS

Se intentó, se midió y funcionaba; y aun así el sitio era éste. La razón es de
estructura, no de gusto:

**TRZS prohíbe esta figura, y la prohibición es portante.** `relaxFolds` abre
cualquier giro de casi 180º —"una horquilla hace que la cinta se acueste sobre su
propio cuerpo: ilegible"— y `selfAvoid` exige 1,36 anchuras entre hebras que no
se cruzan y empuja hasta conseguirlo. El acompañamiento de HRRS es exactamente
las dos cosas que allí están vetadas: una horquilla, y a 1,05 anchuras.

Metido dentro de TRZS, el paralelo tenía que declararse aparte y pedir **tres
excepciones** —a la anchura (`holguraReal`), a la evitación (`selfAvoid`) y al
detector de solapes—, y cada excepción es un sitio donde un defecto de verdad
puede colarse disfrazado. Y sobre todo: en TRZS la figura **casi no se ve**,
porque la obra está llena de cruces y el ojo lee el nudo, no el acompañamiento.
En el dibujo de referencia no hay nudo que leer: **el acompañamiento es la obra
entera**.

El intento vive en el commit `36f0541` (revertido en `main`). No es código
muerto que reaprovechar tal cual —el planteamiento aquí es otro—, pero sí una
libreta de lo que costó, y lo de abajo sale de allí.

## Y qué la separa de EVOL y de PTZD

Tres familias de la casa se apoyan en Chillida y ninguna es pariente de las
otras. Conviene dejarlo escrito antes de que se parezcan sin querer:

- **EVOL** (*hutsunea*) toma **la doctrina del vacío**: la masa se funde y el
  suelo queda atrapado en forma de ojo. El suceso es la **soldadura**.
- **PTZD** (el bloque partido) toma **las xilografías y las Lurras**: un bloque
  entero que se rompe, y el corte mete espacio donde había materia. El suceso es
  la **grieta**, y lo que se lee es el orden en que dejó de ser uno.
- **HRRS** toma **los dibujos de recorrido**: no hay masa que romper ni que
  fundir, hay una cinta que va y vuelve. El suceso es el **pliegue**.

Dicho por la vía corta: en EVOL sobra materia, en PTZD falta, y en HRRS no hay
materia que discutir — hay un camino. Y por eso HRRS es la única de las tres que
no tiene nada que decidir sobre el vacío: el suelo aparece donde el recorrido lo
deja, y punto.

## Lo que se ve en la referencia

Medido a ojo sobre la reproducción, que para las proporciones basta:

1. **Una sola cinta, de anchura constante en toda la obra.** Filo de gubia: los
   bordes son rectos pero no perfectos, con temblor de corte, no de mano.
2. **El canal entre dos vueltas es del orden de un quinto de la anchura**, y es
   el mismo en toda la obra. La obra tiene **dos medidas y sólo dos**: la cinta y
   el canal.
3. **Hasta tres vueltas en paralelo** en la parte derecha. No es un
   acompañamiento suelto: es una regla que se puede repetir.
4. **Todo es plano.** Nada pasa por encima de nada. No hay una sola profundidad
   que decidir en el cuadro.
5. **Ángulos vivos, tramos rectos.** Ni una curva. Los giros son frecuentes,
   irregulares, y ninguno se repite.
6. **Cabos libres, cortados a escuadra**, que se acaban en el aire o contra otra
   vuelta. Media docena. No salen de la trama como en TRZS: simplemente se
   acaban.
7. **Ojos de tamaños muy distintos**: uno grande a la izquierda y varios
   pequeños. El ritmo de la obra está ahí.
8. **La masa deriva en diagonal**, densa arriba a la izquierda y abierta abajo a
   la derecha. No está centrada ni llena el marco.

## La gramática, en seis reglas

1. **UNA CINTA, DOS MEDIDAS.** Anchura `W` y canal `g`. Todo lo que se ve en el
   cuadro es una de las dos, o suelo. Nada más. `g ≈ W/5`.
2. **EL PLIEGUE ES EL SUCESO.** Donde TRZS pone un cruce, HRRS pone una
   horquilla: la cinta llega, gira 180º y vuelve al lado, con el eje desplazado
   exactamente `W + g`. Un pliegue no es un accidente del recorrido: es la
   decisión que hay que tomar bien, y de su reparto sale la obra.
3. **EL RECORRIDO NO SE TOCA NUNCA.** Distancia mínima entre dos tramos no
   contiguos: `W + g`, exacta y por abajo. Es la única restricción dura, y
   sustituye a todas las de TRZS.
4. **NO HAY HALO.** Si nada se solapa, no hay nada que cortar: la incisión de
   TRZS aquí es sencillamente el suelo entre dos vueltas. La obra se dibuja de
   **un solo trazo**. Esto se lleva por delante la mitad complicada de TRZS —el
   plan de secciones, el orden de pintado, el halo, los cabos— y hay que
   resistirse a portarlo "por si acaso".
5. **CABOS A ESCUADRA Y AL AIRE.** El recorrido empieza y acaba donde le toca. No
   se sacan de la trama; el remate es el corte de la gubia y nada más.
6. **LOS OJOS SON EL RITMO.** Un recinto que sólo produzca ojos del mismo tamaño
   es un laberinto, no un plano. La distribución de tamaños es un rasgo medible y
   probablemente el mejor criterio de selección automática que va a tener esta
   familia.

## Lo que hereda del laboratorio

Lo de siempre, y sin excepciones:

- `HOKS.<OBRA>.render(ctx, W, H, seed, opts)` → datos de traits;
  `HOKS.<OBRA>.traits(res)` → `{list, overall}`.
- Canvas 2D puro. Ni p5 ni DOM. Siempre `new HOKS.Rng(seed)`, nunca
  `Math.random()` (el grano del motor es la única excepción declarada).
- Ni proporción ni resolución supuestas: todo se mide contra `W`, `H` o
  `min(W,H)`, y las constantes en px se escalan con `E.unit(W,H,REF)`. Los tres
  formatos —cuadrado, vertical y horizontal— no son recortes: se le pasan otras
  `W`/`H` y el algoritmo recompone.
- Fondo y grano del motor, `params.bg` y el grano como ajuste del laboratorio.

## Cómo se construiría (propuesta, no receta)

El orden que parece natural, sabiendo lo que costó TRZS:

1. **El recorrido, primero y solo.** Una poligonal de ángulos vivos con pliegues
   declarados. Nada de dibujo todavía: hasta que el recorrido no sea bueno mirado
   en crudo, el dibujo sólo va a disimular.
2. **La restricción dura, con la máquina que ya existe.** `selfAvoid` de TRZS
   sabe empujar pares de segmentos hasta una distancia mínima y ya aprendió a no
   aplastar los cabos. Aquí hace falta lo mismo con el mínimo puesto en `W + g` y
   con la horquilla permitida — que es, literalmente, quitar `relaxFolds`.
3. **El pliegue como primitiva.** Elegir dónde y con qué longitud de brazo. Dos
   pliegues seguidos y muy juntos dan las tres vueltas en paralelo de la
   referencia.
4. **Dibujar es un `stroke`.** Sin capas, sin halo, sin orden. Si en algún
   momento hace falta algo más, es que el recorrido está mal.
5. **Medir los ojos** y usarlos para el triaje del lote.

## Preguntas abiertas, para decidir mirando

- **¿El pliegue se declara o emerge?** En TRZS hubo que declararlo porque el
  solver lo prohibía. Aquí, con `relaxFolds` fuera y el mínimo en `W+g`, podría
  emerger solo de un recorrido que quiere volver. Emergente es más bonito;
  declarado es más gobernable. **Es la primera decisión y condiciona todo lo
  demás.**
- **¿Cuántos cabos libres?** La referencia tiene media docena, o sea que el
  recorrido **no es uno solo**: son varios trozos que conviven sin tocarse. Eso
  se parece más a los saltos de TRZS que a una cinta única, y hay que decidirlo
  pronto porque cambia la estructura de datos.
- **¿Ángulo vivo siempre?** La referencia sí. Una versión curva sería otra obra;
  probablemente ni ofrecerla.
- **¿`g` fijo o proporcional?** En TRZS la incisión se mide sobre el cuadro
  (`gapAbs`) para que sea igual de fina pase lo que pase con la anchura. Aquí el
  canal es parte del dibujo, no una separación técnica, así que puede que deba ir
  atado a `W`.
- **El temblor de gubia** de la referencia (regla 1) no es el temblor de TRZS
  —allí es la anchura la que respira—. Aquí sería el filo. Puede esperar.

## Cómo se verificará

Mismo contrato que `trzs/verificacion/`: **un cero sin control no significa
nada**. Cada detector, con su versión rota a propósito generada desde el
`algo.js` publicado.

Los que se ven venir:

| detector | qué mide | su control |
|---|---|---|
| canal | que entre dos vueltas haya SIEMPRE suelo, y del grosor declarado | recorrido con el mínimo bajado |
| toque | ni un píxel de cinta tocando cinta | evitación desactivada |
| margen | ni un píxel pegado al borde del cuadro | margen negativo |
| ojos | reparto de tamaños; que no salgan todos iguales | recorrido en rejilla regular |
| determinismo | mismo seed → misma imagen en cuatro condiciones | — |

El de **toque** es el que importa y es el único sin umbrales, como `hueco.js` en
TRZS: si nada se solapa, cualquier píxel de cinta con cinta al lado sin suelo por
medio es un defecto, y no hay nada que interpretar.

## Lo construido

```
hrrs/
  algo.js              ← el algoritmo, fuente única
  index.html           ← el harness (mandos: tipo, cintas, pliegues, gubia, canal, reserva)
  verificacion/        ← los detectores y sus controles rotos. Ver su README
```

Registrada en `GRADUATED` (`_lab.js` y `admin.html`), así que un lote la puede
mezclar con otras obras. **No** está en `works.json`: se llega por URL, `../hrrs/`.

Y una cosa que no es de HRRS y sale de aquí: la política de color de dos tintas
—el par por distancia de color, la luminancia decidiendo el suelo, el papel crudo—
**subió a `_engine.js`** como `E.inkDice` / `E.inkRoles`. Era lo que `ptzd/README.md`
tenía escrito («no se copia: se sube; es la segunda familia que lo pide, la tercera
ya sería tarde») y HRRS es la tercera. EVOL se portó a llamarla y se comprobó
**idéntica al píxel**: 80 de 80, dos formatos × cinco tipos × ocho seeds.

## La primera pregunta, decidida mirando: **el pliegue se declara**

Se montó lo mínimo para ver doce obras a la vez y se compararon las dos versiones
sobre las mismas seeds: una con la primitiva del pliegue quitada del todo —el
acompañamiento sólo puede emerger de la restricción dura más la preferencia por
la cercanía— y otra con el pliegue declarado.

Y lo que dice el grid no es lo que este README suponía («emergente es más bonito;
declarado es más gobernable»). **Emergente no es más bonito: es otra familia.** La
cinta sale en lazos amplios que vuelven sobre sí mismos, y al volver caen a la
distancia que sea — de un canal a cinco. Eso incumple la regla 1, que dice que la
obra tiene **dos medidas y sólo dos**: un hueco que puede medir cualquier cosa no
es un canal, es un espacio. Y con lazos grandes y vacío dentro, la obra se va al
territorio de EVOL, que es exactamente lo que la tabla de más arriba dice que no
tiene que pasar.

Declarado, el canal mide `g` **allí donde importa**, y salen las vueltas paralelas
largas de la observación 3. Medido: mediana de 8 pasillos por obra y 18,6 anchuras
de acompañamiento; con el pliegue quitado, 5 pasillos y casi nada de recorrido en
paralelo.

Se quedan además los candidatos de pliegue con peso bajo (0,04) cuando la obra no
ha pedido plegarse: así el pliegue también aparece donde no se le llamó, que es lo
que el planteamiento emergente tenía de bueno.

## Y una segunda decisión, ésta contra lo que este README proponía

El paso 2 de «Cómo se construiría» decía reusar `selfAvoid` de TRZS. **No se
porta.** Un relajador *empuja* pares de segmentos hasta la distancia mínima, o sea
que trabaja sobre un recorrido que ya está mal y lo corrige — y corrigiendo mueve
todo lo demás, que en TRZS costó una tanda entera de cabos aplastados. Aquí la
restricción es **constructiva**: el recorrido no crece hacia donde no cabe, así que
nunca hay nada que arreglar. No hay solver, no hay pasadas, no hay convergencia.

Y tiene un premio que no se veía venir: **el cabo deja de ser una decisión.** La
cinta se acaba donde ya no cabe, y eso es la regla 4 saliendo gratis de la regla 3.

## Los ojos de HRRS no son los de EVOL, y hay un teorema por medio

Una cinta **abierta** de anchura constante no puede encerrar suelo: el complemento
de un arco engrosado es conexo por mucho que se pliegue, y con varias cintas que no
se tocan sigue siéndolo. Así que aquí **no hay ojos cerrados**, y no por falta de
ganas.

El ojo grande de la referencia no está cerrado: está **cerrado para la cinta**. Se
sale de él por el canal, y por el canal la cinta no cabe. De ahí la definición, que
no lleva ni un umbral inventado:

> **Un ojo es el suelo donde la cinta ya no cabe.**

Se calcula como alcance de un disco de radio `W/2` —el material— desde el borde del
cuadro: suelo a `W/2` o más de la tinta, inundado desde el borde, dilatado en `W/2`;
lo que queda sin alcanzar, por componentes. Es **la misma regla que acaba un cabo**,
así que el ojo y el cabo son el mismo suceso visto por los dos lados. Y el margen
de la regla del campo se gana el sueldo: garantiza que el anillo del borde está
libre, así que el agua siempre tiene por dónde entrar.

## Lo que costó, y por qué está escrito en el código

Seis pasadas mirando el grid. Cada número que parece arbitrario tiene detrás una
versión que se veía peor:

- **Glifo.** Cinta gorda y recorrido corto: la obra se lee como una letra gruesa.
  Lo que hace a esta familia no es la cinta, es cuánto recorrido cabe en ella. El
  techo de la gubia baja de 0,072 a 0,058 del lado corto.
- **Ahogo.** Con tramos de hasta cuatro décimas del campo, un recorrido que no se
  puede tocar se encierra en seis tramos y se muere: mediana de **14 vértices con
  un tope de 90**, o sea que el tope no existía y lo que decidía la obra era el
  ahogo. Tramos más cortos, y el recorrido vive.
- **Una constante que no se variaba.** `INTENTOS = 26` era código muerto: sólo se
  generaban 6 candidatos, uno por dirección de giro, así que `min(cands, INTENTOS)`
  valía siempre 6. Ahora de cada giro se prueban **tres longitudes**, que es lo que
  le deja colarse por un sitio estrecho en vez de darse por acabada.
- **El pliegue que mataba la cinta.** Cuando la obra quería plegarse se generaban
  *sólo* candidatos de pliegue, y un pliegue casi nunca cabe cuando la cinta va
  apretada — que es justo cuando más falta hace seguir. La voluntad de plegar
  **pesa**, no excluye.
- **Garabato.** El paseo se metía en su propia zona densa y se ahogaba, porque el
  sitio más cercano es siempre el que ya está ocupado. Con un peso por la **holgura**
  del sitio donde cae el tramo, la cinta viaja.
- **Esqueleto.** Pero sólo con holgura las hebras salen repartidas por la hoja con
  mucho suelo suelto entre ellas. En la referencia van **cerca** unas de otras casi
  en todas partes, y lo que hay entre ellas es canal, no campo. De ahí la **franja
  del acompañamiento**: el peso premia caer a entre uno y dos canales y medio. Es
  la regla 3 leída por el otro lado — no sólo «no te toques», también «no te vayas».
- **Nervioso.** Con dos modas de giro (recto y bies) la cinta gira fuerte en cada
  vértice. Faltaba la tercera: el **quiebro**, de cuatro a veinte grados. Es lo que
  da las tiradas largas de la referencia, lo que la hace parecer cortada a mano — y
  lo que deja **vivir** al acompañamiento, porque una vuelta que gira fuerte al
  primer vértice se despide del pasillo enseguida.
- **Ovillo en una diagonal.** El recorrido vagabundeaba alrededor de un punto y
  dejaba cuatro márgenes muertos que no eran la reserva (ocupación del 6 al 11% con
  un techo declarado del 24%), porque una deriva hacia un punto fijo deja de tirar
  en cuanto se llega a él. Ahora hay una **ruta**: hitos que se van dejando atrás.
- **La puerta equivocada.** Con muchas cintas, un arranque que cae en un rincón ya
  cerrado da una cinta de dos tramos. Se prueban cuatro arranques y se queda el más
  largo. Probar dónde entrar no es corregir el recorrido —el recorrido no se toca—,
  es elegir la puerta.

## El bisel: lo único que hace **suficiente** a la regla 3

Parecía un detalle de dibujo y es lo contrario. Con `lineJoin: miter`, el pico de
un giro sale `W/2/sen(α)` del vértice —0,707 W en un giro recto, más al bies— y la
regla 3 sólo garantiza `W/2 + g = 0,67 W` de aire alrededor de un vértice: **una
esquina puede cruzar el canal y soldar la obra por donde menos se mira.** Con
`bevel` toda la tinta cae dentro de `W/2` del eje, y entonces «los ejes a `W+g`»
equivale exactamente a «las tintas a `g`».

No es una creencia: es el control `miter` de la batería, que dispara **10 de 10**.
Y de paso el bisel es lo que hace el filo — una esquina cortada.

El cabo a escuadra, en cambio, resultó ser **sólo** gramática (regla 5): un cabo
redondo es un semidisco centrado en el vértice del eje, así que cae *dentro* de la
suma de Minkowski y no rompe el canal. Se mide aparte, con su propio control.

## Medido

Batería completa sobre el algoritmo publicado. Los detalles, las trampas y los
controles están en `verificacion/README.md`.

```
canal (regla 3)   996 obras · 2.008.529 pares no contiguos · 0 incumplen
                  separacion minima 1,000 exacta en las doce configuraciones
                  tintas solapadas: 0 de 996
toque             0 de 252 con tinta fuera de la geometria (exceso maximo 0,00)
                  0 de 252 con tinta mas alla del cabo
margen            0 de 996 fuera del cuadro · minimo 0,055 exacto
determinismo      60/60 identico al pixel · 60/60 con la paleta fijada
resolucion        60/60 misma huella a 760 / 2400 / 4200 de lado corto
```

Distribución de la familia, 400 tiradas con los pesos de los tipos (sin forzar):

```
tipos       plegado 37%  acompanado 28%  suelto 21%  trenza 15%
ojos        p50 6 · p90 10 · max 16
pasillos    p50 8 · acompanamiento p50 16,6 anchuras
ocupacion   p10 8,0%  p50 21,4%  max 33,5%
cadencia    CV de longitudes p50 0,59 (con la rejilla rota, 0,30)
falta = 0   400 de 400
```

Sobre las doce configuraciones juntas `falta = 0` en **993 de 996**: con seeds
difíciles ningún candidato cumple lo que su tipo declara y manda el que menos
incumple (máximo 0,26). Por eso `falta` es un número y no un sí/no.

---

# Segunda vuelta: seis referencias, y un error de modelo

Con la familia ya construida y medida, aparecieron **seis referencias más** y el
veredicto fue: *no se parece en nada*. Tenía razón, y no era cosa de afinar
números. Era el modelo.

## El diagnóstico, en una frase

**Mis hebras son independientes. Las suyas son UNA que se parte.**

Lo que construí genera N cintas que se esquivan y a las que se premia por caer
cerca; el acompañamiento sale de un peso, así que es **incidental**. Lo que hay en
las referencias es un **cuerpo conectado que se bifurca**: dos tramos van juntos
porque *eran el mismo tramo*, y por eso van juntos todo el rato y a la distancia
exacta. De ahí el «confeti» que se ve en mi grid — muchas hebras sueltas que no
acompañan a nada — y de ahí que las suyas se lean como un organismo.

## Las seis, una a una

1. **La original, firmada** (papel crudo, deckle). Una banda entra por el borde
   izquierdo y forma el **techo de un recinto grande**; dentro del recinto hay dos
   **muñones** cortos, uno diagonal. Por la esquina derecha el cuerpo **se abre en
   tres o cuatro tramos paralelos** con dos o tres canales de un pelo entre ellos,
   que bajan y se convierten en **patas** con el cabo a escuadra. Deriva diagonal:
   denso arriba-izquierda, se deshilacha abajo-derecha.
2. **La gris, misma gramática.** Recinto a la izquierda, una entrada que sangra por
   el borde, y a la derecha el haz paralelo que baja en **tres patas** claras, cada
   una con sus quiebros. Dos muñones cortos apuntando arriba.
3. **La enmarcada, fondo texturado.** *Sin recinto.* Siete tramos casi
   horizontales que **converge­n hacia la derecha y se abren en abanico a la
   izquierda**. Los canales sólo aparecen donde dos tramos se emparejan, cerca de
   la convergencia. Cabos libres a los dos lados. Y **trazo curvo, no quebrado**.
4. **La de trazo grueso y blando.** Como la 3 pero más rotunda: seis tramos que se
   **reúnen en un nudo** a la derecha, con canales de un pelo donde se aparean. Dos
   tramos **sangran** por arriba y por abajo. Curva otra vez.
5. **El cartel de Múnich 72.** Geométrica: dos bandas **atraviesan el cuadro de
   lado a lado** (arriba y abajo, sangrando por los dos bordes) y en el centro un
   **cruce** donde cuatro o cinco se juntan y corren en paralelo con sus canales.
   Ángulos casi rectos y tramos largos.
6. **La última, casi cuadrada.** Un **recinto rectangular** arriba y, colgando de
   él, un **haz denso de tramos paralelos que se engranan** —dos peines que se
   meten uno en otro— y bajan en patas. Todo dentro del cuadro, con margen
   generoso.

## La ley que las une, y es una sola

> **El canal y el ojo son lo mismo a dos escalas.**

Una bifurcación cuyos dos hijos **vuelven a juntarse enseguida** deja un canal de
un pelo. Una bifurcación cuyos dos hijos **se vuelven a juntar muy lejos** deja un
**recinto**. Es la misma operación —el material se abre— leída a dos distancias.

Y el canal aparece **siempre que dos tramos de material van juntos**, sea porque
uno se partió (referencias 1, 3, 4, 6) o porque dos se encontraron (la 5). Las dos
cosas son el mismo corte; lo que cambia es la topología: **horquilla** o **cruce**.

Eso convierte la regla 3 de restricción en consecuencia: no hay que *impedir* que
se toquen, porque el material **nace ya partido** y el corte es lo que lo separa.
La regla negativa («no se tocan nunca») describe el resultado; la regla positiva
que lo produce es **«el material se abre y el corte queda»**. Es, literalmente, la
doctrina del vacío de Chillida puesta en un algoritmo — y es la misma lectura que
`ptzd/README.md` ya tenía escrita para la grieta: *el corte mete espacio, no quita
materia*.

## La categorización, en seis ejes

Lo que pedías: poder contemplarlas todas. Ninguna referencia es un «tipo»; cada
una es una **combinación** de valores en estos ejes. Eso es lo que hay que poder
tirar.

Los nombres de los ejes son **los del autor**, no los míos: «algunos más separado,
otros vibran, algunos en paralelo, otros se alejan, algunos se salen del cuadro y
otros juntan sus extremos». Esa frase *es* la taxonomía; lo de abajo sólo la ordena.

| eje | valores | dónde se ve |
|---|---|---|
| **topología** | `horquilla` (uno se parte) · `cruce` (dos se encuentran) · `suelta` (se va y muere) | 1,3,4,6 · 5 · todas |
| **reencuentro** | `canal` (van *en paralelo*) · `recinto` (se juntan lejos) · `abanico` (*se alejan*) | todas · 1,2,6 · 3,4 |
| **nudo** | `sin nudo` · `un nudo` (varios cabos *juntan sus extremos*) · `dos nudos` | 1,6 · 3,4 · 5 |
| **separación** | `pegado` (un canal) · `holgado` (2–3 canales) · `suelto` (mucho suelo entre tramos) | 6 · 1,2 · 3,4 |
| **marco** | `contenido` (con margen) · `sangrado` (algún cabo *se sale del cuadro*) · `travesía` (de lado a lado) | 3,6 · 1,2,4 · 5 |
| **cabos** | `patas` (varios, paralelos, mismo sentido) · `abiertos` · `a ras` (mueren junto a otro) | 1,2,6 · 3,4 · 1,5 |
| **trazo** | `quebrado` (ángulo vivo) · `ortogonal` (rectos largos) · `liso` (curva suave) | 1,2,6 · 5 · **3,4** |
| **vibración** | `quieto` · `tembloroso` (*vibra*: quiebros pequeños a lo largo del tramo) | 5 · 1,2,3,4,6 |
| **haz** | `par` (2 juntos) · `terna` (3) · `peine` (4+ engranados) | todas · 1,2 · 6 |

**La vibración es la que más echo de menos en lo que hay hecho.** En cinco de las
seis, un tramo largo no es recto: tiembla. Y no es el temblor de TRZS —allí respira
la anchura— ni ruido por vértice: es el **filo**, quiebros pequeños y seguidos que
recorren el tramo entero manteniendo la dirección. Mi `quiebro` (4–20°) apunta ahí
pero es una moda entre tres, así que sale a rachas y no *a lo largo*. En la
referencia la vibración no es un suceso: es la **textura del trazo**, constante en
toda la obra, como la anchura y el canal. Probablemente sea una **tercera medida**
del material, junto a `W` y `g`.

Dos avisos sobre esa tabla:

- **`liso` contradice la observación 5 de arriba** («ni una curva»). Las referencias
  3 y 4 son curvas sin discusión. Tu README ya lo había anticipado y despachado
  —*«una versión curva sería otra obra; probablemente ni ofrecerla»*—, y sigo
  pensando que tienes razón: mezclarla diluye la familia. Queda en la tabla porque
  **existe en la fuente**, no porque proponga meterla.
- **`travesía` tampoco cabe hoy**: el margen en los cuatro lados (regla del campo)
  la prohíbe por construcción. Es la decisión que habría que reabrir si la 5 entra.

## Lo que esto rompe de lo que hay hecho

Honestamente, y por orden de gravedad:

1. **La estructura de datos.** Hoy `cintas` es una lista de poligonales
   independientes. Hace falta un **árbol**: cada tramo con su padre, y los
   hermanos de una bifurcación corriendo a `W + g` por construcción. Eso es
   rehacer `andar` y `tramar`, no ajustarlos.
2. **`arranqueAlLado` se cae entero.** Nacer «al lado de» era la manera de fingir
   una bifurcación sin tenerla. Con horquillas de verdad, sobra.
3. **La franja del acompañamiento (`CERCA`, `PESO_CERCA`) también sobra**, y con
   ella el peso que la sostiene. La adyacencia deja de ser un premio y pasa a ser
   estructural. Sospecho que ahí se va la mitad del `andar` actual.
4. **Los tipos hay que rehacerlos** sobre los seis ejes, no sobre «cuántas cintas».
5. **La medida del ojo aguanta** —«el suelo donde la cinta ya no cabe» sigue
   valiendo, y además ahora *explica* el recinto— y **el pliegue declarado
   aguanta** como caso particular de horquilla con reencuentro inmediato.
6. **La batería aguanta casi entera.** `canal.js`, `toque.js` y `det.js` miden el
   resultado, no el método, así que sirven igual. `obra.js` necesitaría medir la
   topología nueva (bifurcaciones, reencuentros, profundidad del árbol).

Lo que **no** cambia es la garantía: el bisel sigue siendo lo que hace suficiente
la distancia mínima, y el canal sigue midiendo `W/5`.

## Lo que propongo, y lo que no voy a decidir solo

El siguiente paso es una **tercera pasada** que cambie el modelo: un cuerpo que se
bifurca, con reencuentro a dos escalas, y los seis ejes como parámetros del
laboratorio para poder mirarlos todos en el grid. Es rehacer `algo.js`, no
parchearlo — unas 400 líneas de las 700 actuales.

Y dos cosas que son tuyas:

- **Si la curva entra.** Yo diría que no, por lo que ya dejaste escrito.
- **Si la travesía entra**, porque obliga a reabrir el margen en los cuatro lados.

## Lo que queda abierto

- **El reparto de tamaños de los ojos no está verificado.** Es el criterio de
  triaje que la regla 6 pide, y se mide — pero **no tiene control que dispare**: la
  rejilla da 9 obras-laberinto de 120 contra 6 de 120 del sano. Así que esos números
  son descriptivos y la regla 6 sigue siendo una decisión del ojo en el grid. Dicho
  aquí para que el cero de al lado no se lea como si estuviera comprobado.
- **El temblor de gubia** de la observación 1 no está. Sigue pudiendo esperar, y
  añadirlo ahora sería una constante más que nadie varía.
- **Las tres vueltas en paralelo** salen de dos pliegues seguidos y están medidas
  como pasillos, pero no hay un rasgo que cuente *cuántas vueltas* corren juntas.
  Sería el rasgo más propio de la familia.
- **El nombre**, que es tuyo.
- **Y la de verdad:** si esto merece página. Eso se decide viendo doce seeds a la
  vez, no leyendo esto.

## Lo que ya está medido, del intento dentro de TRZS

Por si sirve de punto de partida, todo sobre 250 obras por configuración:

- Un par de tramos declarado paralelo **llega a su sitio** si se le da una fuerza
  de dos sentidos —tira si está lejos, empuja si está cerca—: distancia final
  entre 1,08 y 1,34 anchuras, mediana 1,11.
- Con la regla de holgura general puesta, **no llega**: no cabe. Las dos reglas
  se contradicen y hay que elegir. Aquí la elegida es la del canal.
- La distancia del acompañamiento **no puede entrar en el cálculo de la
  anchura**: si entra, la cinta adelgaza a 0,72 de lo pedido y la figura se come
  la obra.
- Un acompañamiento **declarado y no conseguido** hay que retirarlo, porque su
  excepción ciega al detector para nada.
