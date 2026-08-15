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

## Nueve patrones que no están nombrados, y son reglas

Lo de arriba ordena lo que el autor nombró. Esto es lo que además se ve en los
cuadros y sirve como **regla generativa**. Ordenadas por cuánto cambiarían el
resultado.

1. **EL ÁNGULO DE HORQUILLA ES PEQUEÑO: 15–40°, nunca 90°.** Es el más importante
   de la lista. Cuando el material se abre, el hijo sale **al bies suave** y los dos
   se separan despacio. Una horquilla a 90° es una **T** —el encuentro de PTZD, la
   grieta— y se lee como derivación; una a 20° se lee como un **delta**, como algo
   que se desdobla. Ahí está literalmente la palabra *acompañamiento*: los dos
   tramos salen del mismo sitio y tardan en despedirse.
2. **EL CANAL ES MÍNIMO EN LA HORQUILLA Y SÓLO SE ABRE.** Esto reconcilia «van en
   paralelo» con «se alejan», que parecían contradecirse: el canal vale `g` **en su
   origen** y de ahí crece, nunca al revés. Un canal no es una franja de anchura
   constante — es una **cuña que nace cerrada**. En las referencias 3 y 4 se ve
   entero: nacen pegados en el nudo y se abren hasta perderse.
3. **UN SOLO RECINTO GRANDE, no muchos ojos pequeños.** Las referencias 1, 2 y 6
   tienen **uno**, y grande (a ojo, del 15 al 25 % del cuadro). Mi versión produce
   seis o nueve ojos chicos, que es otra cosa: eso es una retícula, no un recinto.
   El recinto es el **suceso mayor** de la pieza y compite con el nudo por ser el
   sitio donde se entra a mirar.
4. **UN POLO DENSO, y la escala del tramo va con él.** La topología no se reparte:
   se **concentra** en una zona —el nudo, o el recinto— y el resto es viaje. Y los
   tramos son **cortos dentro del polo y largos fuera**. Hoy la escala de racha es
   global y ciega a eso; ahí se pierde la mitad del carácter.
5. **LOS CABOS COMPARTEN DIRECCIÓN Y TERMINAN ESCALONADOS.** En 1, 2 y 6 todos los
   cabos libres caen hacia el mismo lado —la obra tiene un «abajo»— pero **acaban a
   alturas distintas**. Alineados serían un rastrillo; escalonados son patas.
6. **W ES CONSTANTE Y EL HAZ NO ADELGAZA.** Toda «masa ancha» de las referencias es
   en realidad **N cintas adyacentes**, no una cinta gorda partida por una ranura.
   La horquilla, por tanto, **no reparte** material: emite una cinta nueva de la
   misma anchura. Parece un detalle y decide la implementación entera.
7. **LA OBRA TIENE SILUETA.** El conjunto se lee como una forma: cuadrada en la 6,
   rombo diagonal en la 1, abanico horizontal en la 3 y la 4. No es una nube de
   trazos con una densidad — tiene contorno. Mis piezas no tienen ninguna.
8. **EL CANAL MUERE EN PUNTA.** Donde un canal se acaba, se cierra **en cuña**
   porque las dos cintas convergen, no de golpe ni a escuadra. Es la firma visual
   de que aquello fue una sola cosa que se abrió.
9. **LA VIBRACIÓN TIENE LONGITUD DE ONDA PROPIA.** Y es del material, no del tramo:
   en la 6 son seis u ocho quiebros por tramo de viaje; en la 3 y la 4, dos o tres
   ondas largas. Constante dentro de una obra, distinta entre obras — o sea, un eje
   **serial**, como la gubia.

De las nueve, las tres primeras son las que explican por qué lo mío no se parece
aunque cumpla todas las reglas escritas: **horquilla suave, canal en cuña y un
recinto mayor.** Las otras seis afinan.

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

---

# Tercera vuelta: trazos independientes, relacionados a propósito

La segunda lectura también era falsa. **No hay horquillas, ni nudos, ni
reencuentros, ni un cuerpo que se parte.** Corregido por el autor mirando sus
propias referencias: *«lo que veo son trazos independientes, que se relacionan
compositivamente pero nunca se juntan; como mucho podrían entrelazarse y ni
siquiera hacen eso»*.

## Los dos errores, escritos para no repetirlos

1. **La topología que no existe.** Leí bifurcaciones donde hay dos trazos
   distintos que se acercan. Ni una sola unión en ninguna de las seis referencias.
2. **El garabato.** Las dos primeras versiones hacían trazos de ocho a quince
   quiebros deambulando. Los de la referencia son **largos y simples**: de uno a
   cinco quiebros en todo el recorrido, con una dirección clara de principio a
   fin. Un trazo cruza media hoja y se quiebra tres veces. **Esto solo explicaba
   la mitad del no-parecido**, y era independiente de toda la discusión de
   topología — o sea que la segunda vuelta se equivocó dos veces a la vez.

Y de ahí, el **recinto tampoco es una figura**: el blanco grande de las
referencias 1 y 6 no está encerrado por un trazo cerrado, está rodeado por
**varios trazos que casi se cierran** y dejan aberturas. Es vecindad (`cerco`), no
lazo. Por eso el `lazo` de la segunda vuelta no salía nunca: no existe.

## El modelo, ahora

**Trazos independientes, y la relación se COMPONE.** Se declara y luego se
construye la geometría que la cumple; no se espera a que emerja de un paseo con
pesos, que es lo que daba confeti. Seis relaciones, con los nombres del autor:

| relación | qué es | cómo se construye |
|---|---|---|
| `paralelo` | comparten dirección a distancia casi constante | **desplazando** un trozo del otro — única forma de que el canal salga constante |
| `abanico` | arrancan cerca y se abren | mismo punto ±poco, dirección ±poco |
| `tangencia` | mínimo **puntual** y se separan; el pelo aparece en un punto | cruzan en ángulo, con el paso a la distancia del canal |
| `caboCabo` | dos extremos se buscan sin tocarse | extremo a `1…3,2 D` de su extremo |
| `caboCuerpo` | un extremo muere junto al costado de otro | extremo a `1…3,2 D` de su costado |
| `suelto` | lejos. La separación también es una relación | sitio con aire |

Un **tipo** es sólo un reparto de relaciones y un número de trazos (3–20). No hay
topología que declarar porque no hay topología: `tendido` (refs 3 y 4), `recinto`
(1 y 2), `haz` (6), `disperso` (el examen duro).

## Medido

Batería completa sobre el algoritmo publicado, doce configuraciones (los cuatro
tipos, apaisado, apaisado con haz, campo cuadrado sobre DIN, gubia fina y ancha,
vibrada, degradado):

```
canal (regla 3)   996 obras · 217.517 pares no contiguos · 0 incumplen
                  minimo 1,0001 en las doce · 0 con tintas solapadas
toque             0 de 120 con tinta fuera de la geometria
                  0 de 120 con tinta mas alla del cabo
margen            0 de 204 con un trazo escapado (1.089 sangrados declarados)
garabato          0 de 204 con mas de 6 quiebros de media (p50 2,3 · max 5)
pizcas            0 de 204 con un trazo mas corto de 0,20 del lado corto
determinismo      60/60 al pixel · 60/60 con la paleta fijada
resolucion        60/60 misma huella a 760 / 2400 / 4200
```

Y los controles, todos disparando: `duro` 63/120 · `corta` 36/120 · `miter` 47/48
· `cabo` 48/48 · `margen` 73/120 · `garabato` 15/120 · `pizca` 89/120.

Distribución sobre 996: tipos `haz` 34% · `tendido` 26% · `recinto` 23% ·
`disperso` 17%; ojos p50 2, pasillos p50 2 con 11,7 anchuras, ocupación p50 8,8%.

## El plan de longitudes: lo que le faltaba para tener interés

Primer juicio del autor sobre la tercera vuelta: *«a todas y cada una de las
iteraciones les falta un poco de interés, y creo que la solución global puede ser
la longitud»*. Medido antes de tocar el mando, y la medida dijo que sí y además
por qué:

```
declarado 0,44 … 1,15      colocado  min 0,20  p50 0,46  p90 0,76
reparto dentro de una obra (largo/mediano)    p50 1,36
obras con algun trazo que cruza la hoja       38 de 300
```

**La mediana colocada caía en el suelo de lo declarado.** No es que los trazos se
declararan cortos: es que los largos **no llegaban a colocarse**. Sesgo de
supervivencia — el filtro de la restricción rechaza al largo y acepta al corto, así
que la distribución la elegía el filtro y no la gramática. Y el reparto en 1,36
significa que todos median casi lo mismo: el «papel pintado» de EVOL, una hoja
donde todo pesa igual y no hay dónde mirar.

Se arregla con **tres cosas a la vez**, y ninguna sola habría bastado:

1. **Se planifica la jerarquía**: un protagonista que cruza la hoja (1,10–1,60 del
   lado corto) y una caída geométrica hasta el suelo.
2. **Se coloca de mayor a menor**: el protagonista entra con la hoja vacía, que es
   la única manera de que quepa.
3. **Un trazo que no cabe CEDE longitud antes de rendirse** (×0,88), así el largo
   declarado aterriza tan largo como pueda en vez de ser sustituido por otro corto
   cualquiera.

```
                          antes        después
mediana colocada          0,46         0,45
p90                       0,76         0,90   (máx 1,55)
reparto largo/mediano     1,36         1,59   (p90 2,59)
obras que cruzan la hoja  38/300       113/300
acompañamiento p50        11,7 W       27 W
ocupación p50             8,8%         13,2%
falta = 0                 55%          92%
```

Que `falta` suba del 55% al 92% es consecuencia del punto 3, no de haber aflojado
lo declarado: los trazos se colocan de verdad en vez de perderse.

## El marco era el techo

Con el plan de longitudes puesto, el autor mira la hoja y añade una frase que
parecía un consuelo y era el arreglo entero: *«pueden ser largos porque pueden
salir del límite del canvas, no está mal»*.

No es un permiso, es un diagnóstico. **El techo del trazo largo no lo ponía la
gramática: lo ponía el marco.** El sangrado existía —era uno de los seis ejes que
salieron del análisis de las referencias— pero estaba declarado en `0,09` del lado
corto, que no es salirse: es rozar el borde. Así que un trazo, sangrara o no, tenía
que caber **dentro**, y el protagonista se quedaba en lo que cupiera en diagonal.
Un trazo que en Chillida no termina —se va— aquí terminaba siempre.

Tres cosas, y otra vez ninguna sola basta:

1. **`SANGRE` de 0,09 a 0,22.** Ahora salirse es salirse, y el protagonista puede
   medir más que el pliego: `PROTA` sube de 1,10–1,60 a **1,45–2,40** del lado
   corto.
2. **Cuántos se salen es del CUADRO, no del trazo.** Antes había una probabilidad
   fija (0,16) por trazo, así que todas las obras salían iguales: dos sangrados y
   a otra cosa. Ahora la hoja sortea su propia tasa —**tres de cada diez no tocan
   el borde**, el resto entre 0,15 y 0,62— igual que la vibración, que también es
   del material y no del trazo.
3. **Un trazo que sangra puede ARRANCAR fuera.** Faltaba la mitad del eje: todos
   se iban y ninguno llegaba. Ahora un trazo entra desde detrás del marco.

Y con el sangrado de verdad puesto se vio lo que tapaba: **el cerco iba antes que
el protagonista**. Con tres o cinco trazos ya puestos en el centro, el largo
entraba cuarto y cedía longitud hasta quedarse en uno más del montón — por eso los
`recinto` salían de ocho trazos cortos donde ninguno manda. El cerco no pierde
nada por ir detrás: se organiza contra el trazo largo, que es lo que hace en las
referencias.

**Y la jerarquía pasa a ser criterio de triaje.** `falta` tenía tres reglas —los
trazos que se pidieron, que alguien acompañe a alguien, y que el trazo sea largo y
simple— y le faltaba la que el autor había dicho con la mano: una hoja donde todos
los trazos miden lo mismo no tiene dónde mirarse. Ahora `falta` penaliza el reparto
por debajo de 1,5, así que de los siete candidatos del seed se queda el que tiene
un trazo que manda. Va en `falta` y no en la colocación **a propósito**: es un
juicio sobre la obra terminada, no una regla de construcción.

## El trazo crece, y la hoja se mide desde él

Segundo comentario del autor, y es el que arregla lo que quedaba: *«eso de que se
cortan, creo que es porque los estás dibujando de manera simultánea. Si empiezas
por una línea y se va haciendo larga, el resto de la composición se adaptará a eso.
Sé que se tiene que componer, no ser adaptativo, pero se puede balancear»*.

Tenía razón en el diagnóstico y la cura estaba **ya escrita en este README**, tres
secciones más arriba, como consecuencia de la regla 3: *la cinta se acaba donde ya
no cabe*. No estaba implementada. Lo que había era un plan de longitudes decidido
antes de dibujar nada, y un trazo que no cabía **se tiraba entero** y se pedía otro
más corto. Así que la longitud volvía a elegirla el filtro.

1. **`recortar`: el trazo se pide ambicioso y se corta EXACTAMENTE donde deja de
   caber**, por búsqueda binaria sobre la longitud de arco, cortando por dentro del
   tramo y no por vértice — el sitio donde un trazo choca no tiene por qué ser una
   esquina. Esto obliga a partir `cabe` en dos: `cabeDuro` es **monótona** (si un
   trozo no cabe, ningún trazo que lo contenga cabe) y por eso se puede buscar; la
   regla de lo visible no lo es (un trazo más largo se ve más) y se comprueba
   aparte, una vez, al final.
2. **De los intentos se queda el MÁS LARGO, no el primero.** Con recorte, el primero
   siempre cabe: quedarse con él es volver a dejar que el azar del sitio elija la
   longitud.
3. **La caída se mide desde lo que el protagonista CONSIGUIÓ**, no desde lo que se
   le pidió. Ese es el balance que el autor pedía, y cae justo donde tiene que caer:
   las **relaciones** siguen declaradas y construidas —eso es componer— y lo que se
   adapta es la **escala**. Si el protagonista sale corto porque el pliego no daba
   para más, los demás bajan con él y la jerarquía se mantiene.

El `cerco` también crece: ahora va detrás del protagonista, así que casi siempre
tiene que ceder algo contra él, y rechazarlo entero dejaba recintos de dos cuerdas.

## No hay más líneas, y están más relacionadas

Tercer comentario, mirando las seis referencias otra vez: *«en los casos que te pasé
no hay más líneas y están más relacionadas»*. Las dos mitades son dos errores
distintos.

**Cuántas.** Contadas en el análisis de arriba, ninguna referencia pasa de ocho:
la 3 tiene siete tramos, la 4 seis, la 5 seis o siete, la 1 y la 2 rondan seis entre
techo, patas y muñones. Y aquí salían de ocho a catorce — por un **error de
contabilidad**: el `cerco` se sumaba a `n` en vez de salir de `n`, así que un
`recinto` que pedía 5–9 dibujaba 8–14. El tipo declaraba una cosa y la obra hacía
otra. Ahora `n` es el total, cerco incluido, y los rangos bajan a 3–5 / 5–8 / 5–8 /
3–5.

**Cómo.** Cada trazo se relacionaba con **uno cualquiera** de los ya puestos, así
que la hoja salía como una lista de parejas sueltas: mucha relación declarada y
ningún grupo. En las referencias los trazos van en grupo —tres o cuatro patas
paralelas, dos peines engranados— y un grupo se hace **acompañando al último**: el
tercero acompaña al segundo, que acompaña al primero. Dos de cada tres veces se
encadena; la otra abre grupo nuevo, que es lo que impide que la obra sea una sola
fila.

```
                        v3    + sangrado  + prota antes   + crece   + menos y
                                          que el cerco              encadenados
mediana colocada        0,45    0,54        0,60           —         0,65
p90                     0,90    1,11        1,19           —         1,49
máximo                  1,55    1,87        1,89           —         2,35
reparto largo/mediano   1,59    1,45        1,61           —         2,01  (p90 3,80)
obras que cruzan        113     170         229            —         287   de 300
trazos por obra         6,1     6,1         6,1            —         5,6
```

De **38% a 96% de obras con un trazo que cruza la hoja entera**, y con menos trazos
que antes. Sin tocar ni una regla de las que sostienen la familia: la distancia
mínima sigue siendo `W+g` y sigue comprobándose igual.

## Cuarta vuelta: volver a mirar las seis, con regla

El autor mandó tres de las referencias **en grande** y dijo que seguía sin
parecerse. Las imágenes originales se habían perdido del contexto por compactación,
así que las saqué del transcripto de la sesión y las volví a medir en vez de opinar
de memoria. Salieron dos errores de medida y cuatro reglas que faltaban.

### Lo que estaba mal medido

**El canal era casi el doble de ancho.** Con regla sobre las tres grandes: cartel de
Múnich, banda 55 px y blanco 4 → 0,07. Litografía de las siete bandas, 30 y 3 →
0,10. Las de papel hecho a mano, 14 y 2 → 0,14. Yo tenía **0,17–0,26**, el «1/5» que
había puesto de oído. Ahora `GAMMA = [0,08, 0,16]`.

**Y peor: `paralelo` sorteaba la separación entre 1 y 2,3 canales.** A 2,3·D el
blanco entre dos bandas es *casi dos anchuras*: eso ya no es acompañar, son dos rayas
que van en la misma dirección. En las seis no hay **ni un** sitio donde dos bandas se
acompañen a esa distancia — cuando van juntas, van al pelo. `SEP_PAR = [1,0, 1,15]`,
y las demás separaciones bajan por lo mismo. Sólo `suelto` sigue lejos, que es el
contraste que hace legible el resto.

### El pliegue, que lo había quitado yo

*«Los trazos se voltean entre sí.»* Es **el** movimiento de la referencia: la banda
se da la vuelta y vuelve pegada a sí misma con el pelo por medio. El cartel de Múnich
es casi sólo pliegues; las siete bandas se doblan en uve; el recinto los tiene
apilados.

Lo tenía en la primera versión y lo quité al corregir el error de las horquillas:
entendí «trazos independientes que nunca se juntan» como «un trazo tampoco se dobla».
**El pliegue pasa dentro de un trazo y no une nada.** Un trazo se pliega; dos trazos
no se juntan. Las dos cosas son verdad a la vez y yo las había fundido en una — está
escrito en la cabecera del `algo.js` para que no vuelva a pasar.

Y era *estructuralmente imposible*, no sólo improbable: un pliegue necesita dos giros
seguidos **del mismo lado**, y había una regla puesta a propósito para evitarlos
(«dos giros del mismo lado dan una espiral»). Se construye con la fórmula que este
README ya tenía escrita como consecuencia de la regla 3 —girar φ, recorrer `D/sen φ`,
girar `180−φ`— y por eso **cumple la distancia mínima sin comprobar nada**: los dos
brazos salen antiparalelos a exactamente `D`.

Efecto medido: los ojos pasan de mediana 3 a 5 (p90 10) y su dispersión de tamaños de
1,8 a 4,3. El pliegue **atrapa suelo**, que es la doctrina del vacío, y las
obras-laberinto caen del 30% al 13%.

### El que sale, no vuelve

*«Cuando una línea sale fuera, no vuelve. No es esa misma. Sale fuera y ya está. Eso
es intencional.»* Un trazo que asomaba por un borde y reaparecía dos palmos más allá
se leía como dos trazos con un puente invisible — contar algo que el papel no enseña.
Se corta en el punto exacto en que vuelve a entrar.

### La continuación, que es una relación nueva

*«Una línea y otra pueden llegar a buscarse en el inicio y el fin; sus dos sistemas
se buscan, y eso da una composición visual como continuación, pero realmente son los
trazos.»* Es la séptima relación: el cabo de uno nace a un pelo del cabo del otro y
**sigue su dirección**. El ojo lee una línea sola que cruza la hoja, y son dos trazos
que ni se tocan. Es lo contrario de `caboCabo`, que busca el cabo del otro para morir
a su lado, no para seguirlo.

### La zona: el dibujo no ocupa la hoja

En las seis el dibujo se **concentra**: el grabado del recinto vive en un tercio del
papel y el resto está vacío. Repartiendo los trazos por todo el pliego sale una
constelación; metiéndolos en una zona sale una **masa**, que es lo que hace que las
bandas se encuentren y el canal aparezca. Cada obra tiene ahora un encuadre
descentrado (52–88% del lado) y todo nace dentro; los trazos largos salen de él, que
es lo que hacen los brazos de la referencia.

### El filo hecho a mano, y el fin del `stroke()` único

*«Siempre tienen mucha más vibración, el trazo parece de lápiz, hecho a mano. Y el
ancho tiene pequeñas variaciones, muy sutiles.»* Dos cosas:

- **El temblor** pasa del 45% de las obras al 86%, con la onda más fina. El techo de
  amplitud se queda en 7,5° y **no es una decisión estética sino aritmética**: dos
  subdivisiones seguidas con desvío de signo contrario se separan hasta 2·amp, y
  `obra.js` cuenta como quiebro todo giro de más de 15°. A 7,5 el temblor cabe justo
  por debajo; subiéndolo, la obra limpia empieza a contarse de garabato y el detector
  deja de medir lo que dice medir. Lo que sube es el **suelo**.
- **La anchura variable obliga a dejar el `stroke()` único**, que era una seña de la
  familia. Un `stroke()` sólo tiene un `lineWidth`; no sabe adelgazar. La banda pasa a
  construirse como **contorno y relleno**. Lo que no cambia es la garantía: el
  contorno se levanta con la construcción del **bisel** hecha a mano —dos puntos por
  vértice unidos por su cuerda— así que ningún punto de tinta cae a más de `W/2` del
  eje. Y la gubia **sólo adelgaza, nunca engorda**: hacia arriba cerraría el canal,
  que se mide contra `W`. Lo comprueba `toque.js` píxel a píxel: 0 de 252.

Eso dejó los controles `miter` y `cabo` apuntando a `lineJoin` y `lineCap`, que ya no
existen — y ahí sirvió el arreglo del apartado siguiente: `mil.sh` **se plantó** en
vez de medir los ficheros viejos. Reescritos contra la construcción nueva, y el del
cabo tuvo que ser **redondo y no cuadrado**: la esquina de un cabo cuadrado sale a
`h·√2` del extremo, o sea *fuera* de la suma de Minkowski, y entonces disparaba
también la medida de la geometría y dejaba de probar lo suyo — que el cabo es
gramática y no seguridad. Ahora cada uno dispara en su medida y sólo en la suya.

### Medido, sobre el resultado de esta vuelta

```
canal   994 obras · 0 incumplen · mínimo 1,0001 canales   controles: duro 100/126 · corta 120/126
toque   252 obras · 0 fuera de la geometría · 0 más allá del cabo
                                                          controles: miter 56/56 · cabo 56/56
obra    994 obras · 0 escapados · 0 garabatos · 0 pizcas
                                          controles: margen 96/126 · garabato 19/126 · pizca 59/126
det      56 obras · determinismo 56/56 · misma huella a 760/2400/4200 56/56
```

`falta = 0` baja del 92% al 85% (máx 1,05): con el pliegue, más obras se quedan sin
pasillo declarado. No es un defecto —`falta` es el criterio de triaje, no una regla—
pero está anotado porque es el número que hay que vigilar si sigue bajando.

## Quinta vuelta: la relación es de una SECCIÓN, no del trazo

Última corrección del autor, y tiene una consecuencia estructural que no había
visto:

> *«Casi todas las líneas se paralelizan en algún momento, en alguna sección. A
> veces tienes una totalmente horizontal, pero que da contra otra que viene
> vertical; otra se paraleliza en algún tramo. No hay ningún trazo totalmente
> independiente. Esto lo que consigue es generar un cuerpo en la zona de mayor
> intersección.»*

Hasta aquí, un `paralelo` era **entero** el desplazamiento de otro: dos rayas
gemelas de punta a punta. Eso se lee como una pareja, nunca como un cuerpo — y
explica por qué la hoja seguía saliendo repartida por mucho que se concentrara la
zona. Ahora un trazo se compone de **tres partes**: viene libre, **acompaña un
tramo**, y sigue por su cuenta. Un mismo trazo entra en el nudo, lo recorre pegado a
otro y sale por el otro lado a hacer otra cosa, que es exactamente la horizontal que
da contra la vertical.

**Y `suelto` sale de la baraja.** Se reserva para el primer trazo, que no tiene con
quién relacionarse. Un trazo suelto no es una relación pobre: es un trazo que sobra.

**El cuerpo, por realimentación y no por declaración.** Hay un `nucleo` —el centro de
gravedad de lo ya puesto— y cuando un trazo va a acompañar no elige un trozo
cualquiera del otro sino **el que cae más cerca del bulto**. Cuanto más se acompaña
ahí, más ahí cae lo siguiente. La zona de mayor intersección no está escrita en
ningún sitio: sólo hay que dejar que se forme. Declararla habría sido poner el
resultado en la premisa, que es lo que esta familia lleva cuatro vueltas evitando.

**Y obligó a arreglar `recortar`.** Con el trazo compuesto de tres partes, cortar
siempre por delante mataba el trazo entero cuando lo que no cabía era su arranque
libre — y con él se perdía la sección acompañada, que es la que vale. Ahora prueba
por los dos extremos y se queda con el que salva más trazo.

## Sexta vuelta: el blanco es una incisión, no un hueco

El autor mandó un **detalle a resolución alta** del cartel de Múnich con una frase:
*«ojo a cómo rellena los huecos en las curvas, donde el constraint es mantener el
margen fijo y rellenar el resto».*

No es un ajuste: es otra manera de entender qué se está dibujando. En el original el
blanco entre dos bandas **no es el hueco que queda entre dos objetos** — es una
**incisión de anchura fija**, y el negro ocupa todo lo demás. Por eso la banda de
fuera de una curva sale más gorda. Lo constante es el **margen**, no la anchura.

Yo tenía la lógica al revés —anchura fija, margen variable— y por eso mis esquinas
salían *recortadas* justo donde la referencia las llena. Ahora es una cuenta por
vértice: si el eje ajeno más cercano está a `d`, mi tinta puede llegar a
`d − W/2 − g`. Con `d = D` sale exactamente `W/2` —el bisel de siempre, junto al
canal— y con la hoja vacía alrededor sale el inglete entero y la esquina se rellena.
**La regla no se afloja: se aplica donde de verdad está, que es entre tintas y no
entre ejes.**

### Y eso partió en dos una afirmación que era una

Antes, «la tinta es la geometría» era una sola cosa y se comprobaba en un sitio.
Ahora son dos, y necesitan **dos controles rotos distintos**:

1. **La tinta obedece al plan** — se comprueba sobre el píxel (`toque.js`), contra el
   relleno que el algoritmo **declara** en `geo.relleno`.
2. **El plan no se come el pelo de nadie** — se comprueba sobre la geometría
   (`canal.js`), vértice a vértice.

Y el primer intento de romperlo **no disparaba**: 1 de 28. Rompía la *cuenta*, así
que el plan roto salía declarado, la tinta lo obedecía y el detector daba el visto
bueno. Un control que mide el resultado contra una declaración tiene que romper el
resultado, no la declaración. Con la avería en el sitio correcto, `miter` dispara
38/56 y el control nuevo `holgura` —que rompe la cuenta— 126/126 en el otro detector.

### El canal es uno solo por obra

*«El margen entre trazos, cuando se paralelicen o terminen una contra otra, será
constante dentro de una misma obra.»* No es del grupo ni del trazo: es del material,
como la anchura. Un cuadro con dos blancos distintos tiene dos materiales, y eso no
pasa en ninguna de las seis.

### La deriva, que no es el temblor

*«El trazo tiene que ser más manual, nunca recto ni demasiado digital.»* Resultó que
el temblor no bastaba, y por una razón concreta: **el temblor es del filo** —zumba y
vuelve— así que a distancia se lee como textura *sobre una recta*. Lo que faltaba es
del recorrido: un tramo largo **se va yendo**. Es un paseo aleatorio lento con
memoria, y la dirección que gana se queda para el tramo siguiente.

Al meterla hubo que bajar el temblor de 7,5° a 6,0°, y **no es una decisión
estética**: las dos juntas no pueden pasar de 15° entre puntos consecutivos, o el
detector de garabatos empieza a marcar obra limpia. `2×6,0 + 2×1,4 = 14,8`. Lo que se
gana por un lado se paga por el otro.

### Medido

```
canal   994 obras · 0 incumplen · 0 holguras que se comen el pelo · mínimo 1,000
                       controles: duro 119/126 · corta 124/126 · holgura 126/126
toque   252 obras · 0 fuera del plan · 0 más allá del cabo
                       controles: miter 38/56 · cabo 56/56
obra    994 obras · 0 escapados · 0 garabatos · 0 pizcas
                       controles: margen 97/126 · garabato 19/126 · pizca 39/126
det      56 obras · determinismo 56/56 · misma huella a 760/2400/4200 56/56
```

### Lo que queda de esta vuelta, y no está hecho

*«A veces se superponen.»* Es cierto y se ve en el cartel: la banda vertical cruza la
horizontal y se funden en una sola mancha, sin pelo por medio. Eso **cambia la regla
dura**, que hoy es «nunca se tocan». La forma que le veo es: el blanco entre dos
bandas es **o el pelo, o nada** — lo prohibido es un blanco *más fino* que el pelo,
que es lo que se ve sucio. Queda sin hacer a propósito: es el cambio que más toca el
invariante y merece una vuelta entera con la batería en verde de partida, no ir
encima de otros cinco cambios.

## Séptima vuelta: la malla, y el blanco que es o el pelo o nada

*«Las composiciones me siguen pareciendo pobres, hay poca relación entre trazos.»*
La causa se dice en una frase: **el grafo de relaciones era un árbol y el de las
referencias es una malla.** Cada trazo se colocaba cumpliendo **una** relación con
**uno**, así que N trazos daban N−1 parejas. En las seis, cada banda toca a varias, y
eso es lo que hace el cuerpo. Dos cosas lo abren.

### Un trazo acompaña a dos

Acompaña a A en una sección, cruza la hoja por un **puente** con codo —que hereda el
temblor y la deriva, no es un segmento recto— y acompaña a B en otra. Eso deja ciclos
en el grafo, no ramas.

### La superposición, que SIMPLIFICA la regla

*«A veces se superponen.»* Entre dos ejes a distancia `d`, el blanco mide `d − W`:

```
d ≥ D      → queda el pelo entero            LEGAL
d ≤ W      → se funden, no hay blanco        LEGAL
W < d < D  → RENDIJA más fina que el pelo    PROHIBIDO
```

**Lo que se prohíbe no es tocarse: es la rendija.** Un blanco más fino que el canal no
es una incisión, es suciedad — y es lo único que en las seis no aparece nunca. La
regla pasa de «no se tocan» a «el blanco es o el pelo, o nada», que además es más
corta de enunciar y más fácil de comprobar.

La única salvedad es que al cruzar hay que pasar por fuerza por la franja prohibida en
el camino de `D` a `W`. Si el cruce es transversal dura un suspiro; si es casi
paralelo deja una cuña que se va afilando, que es justo lo feo. Por eso el cruce exige
**ángulo** (38°).

### La trampa: una propiedad del trazo sorteada en el intento

El primer intento daba **cruces en 42 obras de 42**, cuando en el cartel de Múnich hay
dos. La causa no era la probabilidad: era **dónde se sorteaba**. `cruza` se decidía
dentro del bucle de intentos, y como un intento que puede cruzar tiene menos
restricción, cabe mejor, y de todos los intentos se elige **el más largo** — así que
los que cruzaban ganaban casi siempre. La probabilidad declarada era 0,34 y la
efectiva casi 1.

Sacándolo del bucle —es una propiedad **del trazo**, no del intento— pasó a 17 de 42.
El sangrado tenía exactamente el mismo error y se arregló igual. Es una trampa nueva y
merece nombre: **un parámetro sorteado dentro de un bucle de selección no vale lo que
dice valer, vale lo que el criterio de selección prefiera.**

## Octava vuelta: cuatro ejes que estaban escritos y sin hacer

*«Hay muchas cosas que hemos comentado que estás pasando por alto.»* Fui a mi propio
análisis —la tabla de nueve ejes de la segunda vuelta— y **cuatro de los nueve no
estaban implementados**. Estaban escritos, con la referencia donde se ven anotada al
lado, y nadie los comprobaba contra la hoja.

- **`patas`** (refs 1, 2, 6). Varios trazos que cuelgan del cuerpo en la misma
  dirección y mueren al aire, **escalonados**. El análisis incluso decía por qué:
  *«alineados serían un rastrillo; escalonados son patas»*. El grabado del recinto
  tiene tres colgando y es lo que le da peso a la obra.
- **`travesía`** (ref 5). Mi análisis la había dado por **imposible**: *«el margen en
  los cuatro lados la prohíbe por construcción»*. Con el sangrado de verdad dejó de
  serlo cuatro vueltas antes, y no la reabrí. Un «no cabe» sin fecha de revisión se
  convierte en un hecho.
- **`ortogonal`** (ref 5). En el cartel de Múnich no hay **una sola diagonal**: todo
  son verticales y horizontales con esquinas a escuadra. Esa retícula es la mitad de
  su carácter, y yo sorteaba direcciones a 360°.
- **`peine`** (ref 6, cuatro o más engranados). **Sigue sin hacer**, y queda dicho.

Y una quinta que no está en la tabla porque sólo salta poniendo las imágenes juntas:
**la banda era la mitad de gruesa.** En el cartel mide 1/8 del ancho del pliego y en
el grabado 1/12 del dibujo; yo tenía entre 1/17 y 1/33. No es acabado: con la banda
fina el canal es un pelo invisible y la obra se lee como un **dibujo de líneas**; con
la banda gorda se lee como **materia cortada**, que es de lo que va.

### La lección, que es sobre el método y no sobre el dibujo

Un análisis escrito no vale nada si no hay un instrumento que lo confronte. La tabla
de ejes llevaba seis vueltas en este fichero mientras la obra incumplía cuatro de
ellos, y ninguna batería lo notaba **porque los detectores miden la regla dura, no la
gramática**. La regla dura se puede automatizar; la gramática hay que mirarla.

Por eso el ejercicio pasa a ser instrumento y no costumbre: `verificacion/hoja.js`
vive ya en el repo, y `referencias/` trae el método escrito. Las imágenes **no se
commitean** —son de terceros y este repo es público, Pages sirve la raíz— así que la
carpeta las deja fuera y explica qué poner.

De las ocho vueltas que lleva esto, **siete salieron de poner las dos imágenes juntas
y medir**: el canal, los quiebros, la anchura de banda, el número de trazos. Las
cuatro estaban mal, las cuatro eran medibles, y ninguna se veía razonando.

## Novena vuelta: el ritmo es del material, y quién sostiene «largo y simple»

Reauditando contra las dos imágenes en alta salieron dos cosas, y la segunda es la
más importante que ha aparecido en toda la familia.

### Los quiebros no son una cuenta, son un ritmo

Medido por trazo: el protagonista salía con 5–9 quiebros en **dos lados de hoja** —
demasiado recto para su largo— y los trazos cortos con 0–3 en un palmo — demasiado
rectos también. Mediana **2 quiebros por trazo** con `[2,7]` declarado, y la mitad de
los trazos con dos vértices: o sea, rectas.

La causa es que `nq` era una cuenta **por trazo**, y la frecuencia con que gira una
gubia no depende de lo largo que sea el corte. En las dos referencias la frecuencia
es la misma en las bandas largas y en las patas cortas: **una vuelta grande cada 3
anchuras** en el grabado y **cada 6,7** en el cartel. Es del material.

Al pasarlo a ritmo me pasé al otro lado —2,0–3,6 anchuras daba escaleras, la obra
zigzagueaba entera y perdía los tramos rectos largos— y hubo que recalibrar a
3,5–7,5. **Y hay dos escalas que no hay que confundir**: los quiebros grandes
(22–118°) son decisiones y van espaciados; el temblor y la deriva son la mano y van
seguidos. Al contar «muchos quiebros» en el grabado estaba contando la mano y
metiéndola en el sitio de las decisiones.

El detector cambia con ello: mide **quiebros por diez anchuras de trazo**, no por
trazo. Contar por trazo no medía lo que decía — un trazo de dos lados de hoja con
cinco quiebros es casi una recta y salía bien; uno de un palmo con cinco es un
garabato y salía igual.

### Y el hallazgo: «largo y simple» no lo sostiene el ritmo, lo sostiene el auto-corte

El control de garabatos **dejó de disparar** (0 de 126) y perseguirlo dio con algo
que no sabía. Rompiendo el ritmo a una vuelta cada media anchura, el ritmo *observado*
sube de 3,56 a sólo 4,24 y no dispara. La razón: **un trazo que gira cada media
anchura se choca consigo mismo, y `seCorta` lo corta**. El garabato no puede existir.

O sea: el parámetro del ritmo declara la intención; **la regla de auto-corte impone el
resultado**. Son dos mecanismos sosteniendo una misma afirmación, y por eso el control
de `garabato` lleva —única excepción— **dos averías**: rompiendo las dos sale 83 de 84
y el ritmo observado se va a 10,65. Está escrito en `mktest.py` con los números.

De paso apareció un **tope que mordía**: `QUIEBROS` limitaba a 16 y un protagonista de
2,4 con la gubia fina pide 25, así que estaba gobernando en silencio *y* dejando el
control sin poder disparar. Un tope que muerde es un parámetro escondido; ahora es una
red a 40.

### Y el mismo error de contabilidad, otra vez

Las patas se **sumaban** a `n` en vez de salir de `n`: un `recinto` que declaraba 8
dibujaba 11. Es exactamente lo que ya se pagó con el cerco, reintroducido por la
puerta de al lado en cuanto se añadió una figura nueva. Queda dicho como regla: **cada
vez que se añade una figura, hay que decidir de dónde sale su cuenta.**

### La relación depende del tamaño

Un trazo largo puede acompañar a otro un buen tramo; uno corto no da de sí, así que si
se le pide `paralelo` sale una piedrecita paralela a nada y la hoja se llena de
cascotes. En las referencias los elementos pequeños **mueren contra el cuerpo**: son
cabos, no acompañamientos. Por debajo de medio lado corto, la baraja cambia y manda
`caboCuerpo`.

## La réplica exacta como fuente de verdad

Lo pidió el autor en una frase que cambia el orden de todo: *«quiero replicarlos al
100% y validar eso como source de cualquier otra cosa»*. O sea: la técnica no se
juzga por si las obras generadas «se parecen», sino por si es capaz de **reconstruir
las referencias**. Lo primero es falsable y lo segundo no.

El circuito es de dos piezas:

1. **`referencias/traza.py`** saca del píxel la geometría real: umbral, esqueleto, y
   —lo importante— el esqueleto recorrido **como bandas y no como ramas**. Una rama va
   de suceso a suceso, así que una banda que pasa por debajo de otras sale troceada en
   cuatro; para replicar hay que atravesar cada nudo **siguiendo recto**. Devuelve, por
   banda, la poligonal y la **semianchura en cada vértice**.
2. **`componer({eje, anchos})`** en `algo.js` dibuja esas poligonales con la técnica de
   la casa: la banda con su bisel, el canal, el grano. Nada más.

Lo que quede distinto entre réplica y original **ya no es de composición: es de
técnica**. Por eso vale como fuente de verdad.

### Medido, por solape de píxel

```
ref01  83 %    ref02  78 %    ref03  53 %
ref04  90 %    ref05  32 %    ref06  76 %      mediana 76,7 %
```

### Y las dos decisiones de la reconstrucción salieron al revés de lo razonado

El autor miró la primera réplica y dijo lo que se veía: *«la unión de trazos, los
márgenes, las juntas, los solapes… está francamente mal»*. Tenía razón, y yo tenía
razonada la causa: en un cruce la semianchura medial se dispara, así que había que
sustituirla por la **anchura declarada** de la banda. Lo implementé, lo medí, y **bajó**
de 70,7 % a 67,7 %. La segunda idea —no alargar los extremos que mueren en un nudo—
lo dejó en 58,2 %.

Barrido de las cuatro combinaciones, que es lo que había que hacer desde el principio:

```
anchura medida  + alargar todos los cabos   76,7 %   ← la buena
anchura declarada + alargar todos           67,7 %
anchura medida  + alargar sólo cabos        65,1 %
anchura declarada + alargar sólo cabos      58,2 %
```

Las dos hipótesis eran falsas, y por el mismo motivo de fondo:

- **La anchura medida no es un artefacto.** Donde dos bandas se cruzan, la mancha de
  verdad **es** ancha, porque es la unión de las dos. Declarar la anchura QUITA tinta
  que el original tiene.
- **Los extremos que mueren en un nudo también hay que alargarlos.** El reagrupado de
  ramas en bandas no siempre atraviesa el nudo, así que muchos extremos etiquetados
  «nudo» son el final de una banda que sí sigue por debajo, y no alargarlos deja el
  hueco a la vista.

Lo que sí era cierto es la corrección del **cabo**: el eje medial de un rectángulo se
queda a media anchura de su lado corto, así que todas las bandas salían cortas por los
dos extremos. Eso solo vale +6 puntos.

### La métrica me llevó al sitio equivocado, y por cómo estaba muestreada

El autor miró la réplica en detalle: *«los márgenes entre trazos paralelizados no son
constantes, los trazos se rompen, a veces el final se arista/estrecha»*. Las tres
cosas son **un solo defecto** —reconstruir con la anchura medida en cada punto—: en un
cabo la distancia medial cae a cero y la banda acaba en punta; en un codo baja y la
banda se estrangula; y donde acompaña a otra, el canal hereda esa variación y deja de
ser constante.

Pero yo ya había probado la anchura constante y **la medida decía que era peor** (64 %
contra 81 %). Así que o el ojo se equivocaba o la medida estaba mal. Estaba mal la
medida, y el motivo da vergüenza de lo simple: **la anchura se muestreaba en los
vértices de la poligonal, que son exactamente las esquinas.** En una esquina el disco
máximo no cabe, así que la distancia medial siempre baja ahí. La anchura constante
salía sistemáticamente flaca, la réplica perdía tinta por todas partes, y el número
«demostraba» que la variable era mejor.

Midiendo sobre el **eje denso** en vez de sobre los vértices —y recortando media
anchura por cada punta, que también hunden la cola— se da la vuelta:

```
anchura CONSTANTE   68,1 %
anchura medida      63,0 %
```

Es la segunda vez en esta familia que una medida apunta al revés por **cómo está
muestreada**, no por lo que mide. La primera fue el canal, que se buscaba sólo en el
suelo atrapado. Conviene anotarlo como patrón: cuando el ojo y el número se
contradicen, sospechar del muestreo antes que del ojo.

### «Cada línea son trazos, no píxeles rellenados»

El autor puso el dedo en el modelo, no en el resultado: *«ten en cuenta que cada línea
son trazos, no píxeles rellenados; la línea continua horizontal no se dibuja»*.

Y es cierto: **reconstruir desde el esqueleto del ráster es pensar en píxeles.** El
esqueleto de dos bandas cruzadas no son sus dos ejes — en el cruce se parte, se
desplaza y saca ramas que no existen. De ahí los tres defectos que se fueron señalando
uno a uno (los trazos se rompen, los márgenes no se respetan, el solape está mal) y de
ahí que el cartel, que es casi todo cruces de bandas anchas, saliera una aberración.

El modelo correcto es el objeto: **una banda es un trazo de anchura constante, o sea
dos aristas paralelas a distancia W.** Se busca eso —`referencias/traza2.py`— y el
cruce deja de ser un problema: los dos costados **exteriores** de cada banda siguen
ahí, sin enterarse de que otra pasa por encima. El esqueleto no puede saber eso; las
aristas sí.

**Y todavía no funciona.** Sale peor que el esqueleto: las bandas se trocean. La causa
está localizada y escrita en el fichero — cada costado se parte en varios tramos al
simplificar el contorno, el emparejado los cruza todos con todos, y una sola banda
produce una nube de piezas de eje solapadas que el encadenado no sabe coser. El
arreglo va **antes** de emparejar: fundir los tramos colineales de cada costado en una
arista larga, y sólo entonces buscar parejas.

Así que el mejor resultado sigue siendo el del esqueleto con anchura constante, y
queda dicho: **traza2 está subido sin funcionar, a propósito, con el fallo escrito.**

### Lo que queda mal, y ya con nombre

- **ref05, el cartel: 32 %, con 110 % de tinta de sobra.** Es la única de bandas anchas
  con muchos cruces, y ahí la reconstrucción por eje medial se dispara de verdad: el
  eje se desplaza dentro de la mancha del cruce y la banda sale al doble. **Una banda
  ancha no se puede describir por su eje cuando se cruza con otra** — y la solución no
  es declarar la anchura (medido: peor), sino separar las bandas ANTES de medir.
- **ref03, la enmarcada: 53 %.** Es la de bandas curvas. Mi banda es poligonal con
  bisel, así que en una curva larga sobra por fuera y falta por dentro a la vez. Es la
  primera vez que el «no hacemos curvas» tiene un número al lado.

Y las dos que fallan dicen exactamente qué falta, porque fallan de maneras opuestas:

- **ref05, el cartel: 78 % de tinta DE SOBRA.** Es la única con bandas de anchura
  grande y constante que **cruzan el pliego entero**. El trazado las recupera, pero al
  reconstruirlas con la semianchura del esqueleto los cruces se engordan: donde tres
  bandas anchas se superponen, el eje medial se desplaza y la distancia al fondo crece.
  La lección es sobre la técnica: **una banda ancha no se puede describir por su eje**
  cuando se cruza con otra. Hace falta llevar la anchura DECLARADA, no medida.
- **ref03, la enmarcada: 37 % de sobra y 36 % de falta a la vez.** Es la de bandas
  **curvas**. Mi banda es una poligonal con bisel, así que en una curva larga o sobra
  en la parte exterior o falta en la interior — y aquí pasan las dos. Es la primera vez
  que el «no hacemos curvas» sale con un número al lado.

Las cuatro que sí replican pasan de **68 % a 84 %**, y lo que les falta es casi todo
el mismo residuo: el borde. El original tiene filo de tinta sobre papel y la réplica
tiene una arista poligonal.

## Transcribir en vez de describir: el mismo instrumento en los dos lados

El primer intento de réplica fue por el mal camino y el autor lo dijo en tres
palabras: *«no se parecen en nada»*. Escribí recetas «parecidas» y comparé a ojo, que
es exactamente el vicio que este README lleva nueve vueltas documentando.

`referencias/traza.py` hace lo contrario: saca del **píxel** la geometría real —el
esqueleto, la anchura de banda, el canal, los cabos, los nudos— y la devuelve en
números. Y lo importante es que se le puede pasar **una obra mía**, así que por
primera vez la comparación es con la misma regla en las dos manos.

```
                        referencias   HRRS hoy   qué dice
anchura / lado corto       0,052       0,081     me pasé al ensanchar: 1,6× de más
canal / anchura            0,205       0,367     mi pelo es casi el doble de ancho
tinta                      24,4 %      33,6 %    pinto un tercio más
nudos                      42,5        33        menos encuentros
cabos                      30          19        LA MITAD: sus bandas terminan mucho más
largo mediano              0,341       0,282     mis tramos son más cortos
largo máximo               1,099       0,824     no tengo el brazo que cruza la hoja
giros por banda            2,08        0,915     mis tramos van demasiado rectos
un giro cada …             3,5 W       6,7 W     la mitad de ritmo
```

Tres cosas de esa tabla no las habría visto mirando, y una contradice lo que hice en
la vuelta anterior:

1. **La banda se me fue de ancho.** Medí «1/8 del pliego» en el cartel y subí el rango
   entero; pero el cartel es el caso extremo (0,114) y las otras cinco están en 0,032
   a 0,052. La mediana es **0,052** y yo estoy en 0,081. Corregir midiendo una sola
   referencia es cómo se llega aquí.
2. **Tengo la mitad de cabos que ellos.** No es que mis bandas sean largas: es que son
   **pocas y continuas**, y las suyas se cortan, mueren y vuelven a empezar. Un cabo
   es un suceso y ellos tienen el doble.
3. **El ritmo efectivo es la mitad del declarado.** Está puesto en un giro cada 3,4
   anchuras y sale uno cada 6,7. Entre nudo y nudo mis tramos van rectos, y el
   detector de garabatos —que cuenta por trazo, no por tramo— no lo ve.

## El ejercicio de réplica, y lo que delata

Lo propuso el autor y es el mejor instrumento que tiene esta familia, porque es
**falsable**: describir una referencia con palabras siempre sale bien; escribirla con
los movimientos propios sólo sale bien si los movimientos dan para ello.

`referencias/replica.js` escribe las seis referencias como **partituras en el
vocabulario de la casa** —`suelto`, `paralelo`, `continua`, `pata`, y los giros con
`pliega` para el pliegue— y las dibuja con el mismo `banda()`, el mismo canal y el
mismo grano que la obra generada. Para eso `algo.js` expone `componer()`, que
comparte el camino de dibujo entero con `render()`. **No es una puerta trasera para
los detectores**: siguen midiendo `geo`, lo mismo que siempre. Es al revés — la
réplica se somete a la regla dura igual que una obra.

### Lo primero que salió: las seis incumplen

```
firmada    6 rendijas · la peor a 0,902 canales
gris       3           ·           0,901
enmarcada  1           ·           0,899
gruesa     5           ·           0,916
múnich     2           ·           0,942
cuadrada   1           ·           0,911
```

Y hay que leerlo con cuidado antes de tocar nada. A 0,90·D con `g = 0,11·W` el blanco
que queda es **cero**: no son rendijas anchas, son bandas que casi se funden. Todas
salen en el mismo sitio — donde un cabo **muere a lo largo del costado de otra
banda**. O sea que no es que la regla esté mal: es que **no tengo un movimiento que
garantice el pelo en ese tramo**. `caboCuerpo` arranca a un pelo y luego el recorrido
se va, así que el pelo sale aproximado. El pliegue tuvo ese mismo problema y se
resolvió por construcción —girar φ, recorrer `D/sen φ`— y esto pide lo mismo.

### Lo segundo, y es más gordo: dónde empieza el pelo

Puestas las doce imágenes en dos columnas, la diferencia que salta no es de forma:
**en las referencias el pelo empieza y acaba DENTRO del negro.** No es una banda al
lado de otra con el blanco entre ellas de punta a punta; es una banda cuyo cabo
**muere metido en la silueta de la masa**, y entonces la incisión aparece, recorre un
trecho y se acaba en mitad de la tinta.

Eso explica de una vez dos cosas que llevaban vueltas resistiéndose:

- por qué las referencias se leen como **un cuerpo** y las mías como piezas juntas: el
  cabo enterrado no se ve, así que el ojo no encuentra dónde empieza cada banda;
- por qué mi `paralelo` se sigue leyendo como «dos rayas»: mis dos bandas empiezan y
  acaban a la vista, con sus cuatro cabos visibles.

Y ahora **es expresable**, que antes no lo era: con la regla vieja («nunca por debajo
de `D`») un cabo enterrado era ilegal por definición. Con la regla nueva —el blanco es
o el pelo o nada— superponerse es legal, así que el movimiento cabe. Está sin hacer y
es el siguiente.

### Lo tercero: dos referencias no se dejaron escribir

La **firmada** salió un anillo cerrado, y la referencia es un recinto ABIERTO con un
cuerpo colgando. Escribí un `suelto` de cinco giros donde había que usar `cercar` —
varias bandas que casi cierran—, y ese error de transcripción es en sí mismo el
hallazgo: **un recorrido largo con muchos giros da un anillo, no un recinto.** La
diferencia entre las dos cosas es de cuántos cuerpos, no de cuántos giros.

La **gruesa** se perdió del todo: seis bandas que convergen a un nudo con el pelo
donde se aparean, y salieron tres líneas cruzándose. Mi `abanico` abre desde un punto;
esto es lo contrario —**convergen** hacia uno— y no tengo el movimiento inverso.

## Tres trampas nuevas, pagadas en esta vuelta

1. **El sangrado leído como defecto.** El detector de margen marcaba 20 obras
   sanas de 60: un trazo puede salirse del cuadro **a propósito** (es uno de los
   ejes de la familia). Hay que distinguir sangrado declarado de escape — y de
   paso apareció que `SANGRE` medía el **eje** en el algoritmo y el **filo de la
   tinta** en el detector, así que una gubia ancha se pasaba media anchura de lo
   declarado. Ahora las dos miden el filo.
2. **La vibración contada como quiebros.** Contar vértices marcaba de garabato una
   obra limpia: con la vibración puesta, un tramo se subdivide en muchos puntos
   con desvíos de tres grados. Se cuentan **giros de más de 15°**, que es lo que
   la regla dice.
3. **Dos suelos de longitud distintos.** El `cerco` usaba `LARGO_MIN × 0,8` y el
   detector `LARGO_MIN`: 19 pizcas de 996 que eran de la definición, no del
   dibujo.
4. **Un control medido contra un artefacto viejo — y es la peor de todas.**
   `mktest.py` construye cada control parcheando **líneas literales** del `algo.js`
   publicado, así que cuando el algoritmo se reescribe un parche puede dejar de
   encajar. Pasó dos veces seguidas con `pizca`, y las dos fallaron distinto:

   - La primera, **en silencio**: de sus dos parches, uno apuntaba a una línea ya
     reescrita, y `str.replace` **no falla cuando no encuentra nada**. La avería se
     aplicaba a medias, el control seguía disparando por el otro parche, y no se
     enteró nadie. Ahora los dos llevan `assert`.
   - La segunda, **con `assert` puesto y aun así sin efecto**: al hacer que el trazo
     creciera, la línea del suelo de longitud volvió a cambiar y `mktest.py` reventó
     — pero `mil.sh` no comprobaba que la construcción hubiera ido bien, y en el
     directorio seguía el `t_pizca.js` de la ejecución anterior. Se midió ese. Salió
     94 de 126 y parecía perfecto.

   Un control medido contra un artefacto viejo **es peor que no tener control**: no
   prueba nada y además convence. Dos arreglos: `mil.sh` borra el fichero antes de
   construirlo y **se planta** si la construcción falla, y la avería de `pizca` ya no
   parchea el sitio donde se comprueba el suelo sino **la constante** `LARGO_MIN`,
   que es lo que no se mueve cuando se reescribe el algoritmo.

   Es la trampa 1 del encargo —una rama que nadie varía— pero dentro del instrumento
   de medida, que es donde más caro sale.
5. **Contar vértices para medir cuánto trazo se ve.** Con el sangrado hondo hay que
   exigir que quede obra dentro del cuadro, y la primera versión contaba qué
   fracción de los vértices caía dentro. No vale: sin vibración un tramo recto de
   media hoja son dos puntos y uno vibrado son treinta, así que la cuenta hablaba
   de la subdivisión y no del dibujo. Se mide **longitud vista**, muestreando cada
   tramo.
6. **Un tipo que declara `n` y dibuja `n + cerco`.** No es una trampa de medida sino
   de contabilidad, y es peor porque no la ve nadie: el número está escrito en el
   sitio correcto, sólo que se suma otro detrás. Se vio mirando, no midiendo — el
   autor contó las líneas de sus referencias y no salían.

## Lo que queda abierto

- **El reparto de tamaños de los ojos no está verificado.** Es el criterio de
  triaje que la regla 6 pide, y se mide — pero **no tiene control que dispare**: la
  rejilla daba 9 obras-laberinto de 120 contra 6 de 120 del sano. Así que esos
  números son descriptivos y la regla 6 sigue siendo una decisión del ojo en el
  grid. Dicho aquí para que el cero de al lado no se lea como si estuviera
  comprobado.
- **La cadencia tampoco lo está ya.** Tuvo control (`rejilla`) y se cayó de
  `mktest.py` al reescribirse el modelo; no se ha vuelto a poner. El número sigue
  saliendo y sigue sirviendo para el triaje, pero está en el mismo saco que los
  ojos: descriptivo. Escrito en `obra.js` y aquí, y no borrado, porque un número sin
  control que nadie marca acaba leyéndose como verificado.
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
