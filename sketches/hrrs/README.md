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

### El eje no vale dentro de un cruce

El esqueleto es fiable donde hay **una** banda y mentiroso donde hay dos: en un cruce
el eje medial no es el eje de ninguna de las dos, es la bisectriz de la mancha que
forman juntas. Se desvía, hace codos que no existen y arrastra la banda fuera de su
recta — y **eso** es lo que rompe el margen con la vecina y ensucia el solape.

Se distingue por el grosor: donde el material mide más que `W`, no es banda, es cruce.
Esos vértices se tiran y el eje pasa **recto** por debajo, que es lo que la banda hace
de verdad. La conectividad la sigue dando el esqueleto, que para eso sí sirve; la
geometría la da sólo el tramo limpio.

A ojo es lo más limpio que ha salido: los trazos son continuos, la anchura no se
estrangula en los codos y el margen entre paralelas se mantiene. **Y el IoU baja** —
de 76,7 % a 60,8 %.

### Y por eso el IoU deja de ser el criterio

Tres veces seguidas el solape de píxel ha premiado lo que el ojo rechaza, y ya no es
casualidad: **el IoU mide cuánta tinta coincide, no si el objeto está bien hecho.** Una
réplica que engorda en los cruces cubre más área y puntúa mejor que una de bandas
limpias; una banda que se estrangula en cada codo pierde poca área y no se entera.

Lo que hay que medir son los tres defectos que el autor nombró, que además son
exactamente las tres constantes de la familia:

- **anchura**: coeficiente de variación del grosor a lo largo de cada banda — en el
  original es casi cero;
- **canal**: variación del blanco entre dos bandas que se acompañan — en el original es
  constante;
- **continuidad**: cuántas bandas por trazo, o cuánto se parte lo que debería ser uno.

Está sin hacer, y es lo siguiente. Hasta entonces el número de solape se queda como
está —informativo— y **no** como criterio.

### El bucle: replicar, medir la diferencia, minimizarla

Lo propuso el autor con una distincion que ordena todo lo anterior: *«la lógica de
escritura no es por píxel, pero la verificación para determinar la diferencia sí se
puede hacer por píxel»*. El algoritmo sigue escribiendo trazos; el píxel sólo dice
cuánto se parece el resultado.

`referencias/ajusta.py` cierra el bucle. La medida es
`diferencia = |A ⊻ B| / |A ∪ B|`, con las dos imágenes recortadas a la caja de su
tinta, escaladas a tamaño común **conservando la proporción** —deformar para cuadrar
era otra manera de mentirse— y con búsqueda de la mejor traslación. Y el trazador deja
de tener constantes razonadas: sus cuatro mandos se **barren** (54 ajustes) y se queda
el mejor por referencia.

```
            antes    ahora
r1           19 %     14,1 %
r2           22 %     16,9 %
r3           47 %     42,5 %
r4           10 %     12,4 %
r5 (cartel)  68 %     18,1 %
r6           24 %     21,5 %
mediana      23 %     17,5 %
```

**Y el barrido corrige dos decisiones mías, una de ellas de la vuelta anterior:**

- **Tirar los vértices que caen dentro de un cruce sale peor en las seis, sin una sola
  excepción.** El razonamiento era correcto sobre el eje y equivocado sobre el dibujo:
  el eje dentro del cruce está mal, sí, pero la banda que se dibuja con él cae dentro
  de la mancha del cruce —que es negra de todas formas, porque las dos bandas se funden
  ahí— así que el error no se ve. Y quitando esos vértices se pierde la curvatura con
  la que la banda **entra y sale** del cruce, que sí se ve.
- **La anchura leída sale corta un 12 %**, también en las seis. No es azar ni gusto: la
  transformada de distancia mide al centro del píxel de fondo más cercano, y con el
  umbral y el antialias el filo real cae medio píxel más allá — medio por cada lado. Es
  un sesgo del instrumento y se corrige como tal.

### Y dos fallos del propio instrumento, los dos por medir cosas distintas en cada lado

1. **El grosor de la obra lo fijaban las letras.** En el cartel, la moda del grosor daba
   **4 px** — el grosor del texto del pie— porque veintidós componentes de texto tienen
   mucho más esqueleto que siete bandas, aunque las bandas sean toda la tinta. La moda
   contaba **longitud de eje** y había que contar **materia**: ahora es la mediana
   ponderada por área. Y con eso se puede tirar lo que no está hecho con la misma
   gubia, que es la misma idea que sostiene la familia —una obra, un material— usada
   para leer en vez de para dibujar.
2. **Y al quitarle el texto sólo a la réplica, la diferencia se disparó de 13 % a 55 %.**
   Estaba midiendo el pie del cartel, no el dibujo. El filtro tiene que aplicarse a los
   dos lados.

### El evaluador independiente, y lo que desmiente

Con el bucle montado, un agente evaluador midió por su cuenta las seis réplicas —sin
tocar el repositorio— con instrucciones de decir si la métrica premiaba algo indebido.
Volvió con tres correcciones, y las tres van contra lo que yo venía diciendo.

**1. La réplica no trocea: SUELDA.** Llevo tres vueltas diciendo «los trazos se
rompen». Medido, es al revés: el original tiene **más** componentes de tinta que la
réplica, no menos —11 → 4, 7 → 2, y en la cuadrada **14 → 1**—. Lo que hace la réplica
es fundir en un bloque lo que el original tiene separado por la incisión. El defecto
era el contrario del que yo nombraba, y el número lo dice sin ambigüedad.

**2. La anchura ya está bien en las seis** (≤ 5 % de error, 4,3 % el peor). Donde falla
es en **canal** y en **topología**. O sea que el trabajo de las últimas vueltas sobre
el grosor está hecho, y seguir ahí no da nada.

**3. La métrica de área premia lo que no debe, y de tres maneras medidas.** La sospecha
era mía pero los números son suyos:

- **Engorde.** Dilatando la réplica, la cuadrada baja de 34,4 % a 27,8 % con bandas un
  48 % más gruesas: se pueden comprar 6,6 puntos de «parecido» empeorando la obra.
- **El área es ciega al canal, y esto es lo grave.** Soldar todas las incisiones de un
  original contra sí mismo cuesta entre **1,3 % y 9,9 %** de diferencia — sobre un
  recorrido útil de 65 puntos, la característica central de la obra vale entre uno y
  diez. Caso flagrante: la réplica **mejor puntuada** por área (13,0 %) es la que tiene
  **el peor canal de las seis** — 7× más ancho que el original.
- **Favorece las bandas gruesas.** `xor/union ≈ 2ε/W`, así que el mismo error de dibujo
  puntúa mejor cuanto más gorda sea la banda. En desplazamiento de borde real, la
  litografía (18,3 %) y la enmarcada (33,4 %) tienen prácticamente el mismo error.

Y dio una **escala**, que era lo que le faltaba al número para significar algo: dos
originales distintos entre sí dan 69–85 %; un original contra sí mismo **girado 2°** da
15–36 %. Así que **13 % es el suelo del método** y 34 % es del orden de girar la pieza
entera cinco grados.

**Y una cuarta cosa, que es sobre el barrido y no sobre la obra:** midió que las
réplicas dibujan con **menos vértices y tramos más largos** que el original (0,74·W
contra 1,95·W de longitud mediana de tramo). El eje se estaba simplificando de más — y
mi barrido eligió el valor más fino… **de los que yo le ofrecí**. Un barrido sólo puede
decirte cuál de los que le das es mejor, nunca que el rango estaba mal puesto. Es la
misma trampa de la constante que nadie varía, disfrazada de optimización.

### Dónde parar de afinar, y por qué no lo dice la diferencia

Con la rejilla reabierta, las seis volvieron a elegir el valor **más fino que les
ofrecí**. Bajar más era la tentación obvia, y es donde este ejercicio se rompe: **minimizar
área a secas empuja hacia el calco** — siempre se parece más si copias más puntos—, así
que el óptimo de área no puede decidir cuándo parar.

Lo que lo decide es una medida de **forma** al lado. El evaluador midió la cadencia del
original: longitud mediana de tramo, **0,74–0,91 anchuras**. Y la réplica, barrida:

```
simplificación   0,02    0,05    0,10    0,18    0,28
tramo / W        0,51–0,71  0,81–0,93  1,25–1,80  1,69–2,46  2,12–2,58
diferencia       igual o peor   la mejor   peor    peor      peor
```

A **0,05** la réplica tiene la cadencia del original y además la diferencia mínima. Que
coincidan **dos criterios independientes** es lo que convierte el valor en un hallazgo y
no en un ajuste: a 0,02 la diferencia ya no mejora y el tramo baja a 0,51 — la réplica
dibujaría **más fino que la obra**, que es exactamente el calco.

```
r1 12,6 %   r2 14,7 %   r3 34,2 %   r4 11,5 %   r5 17,0 %   r6 21,9 %
mediana 15,8 %   ·   suelo del método 13 %   ·   dos obras distintas 69–85 %
```

Tres de las seis están **en el suelo del método**, o sea que su diferencia ya es ruido de
binarizado y registro, no error de trazo. Las otras tres tienen nombre: la enmarcada
(34 %) es la de bandas **curvas** contra una banda poligonal; la cuadrada (22 %) es la
**ortogonal estricta** —60 % de su contorno a menos de 5° de un eje, contra 50 % de la
réplica— y además la que más suelda; y la litografía (17 %) es inestable según el ajuste,
que es un defecto del trazador y no de la obra.

### El cabo se alarga hasta donde hay tinta

El alargue fijo del cabo era lo que **soldaba** las bandas, y el área lo pagaba. En la
firmada, con alargue 0,5 la réplica tiene 7 componentes y con 0 tiene **8 — las 8 del
original**… y la diferencia de píxel **sube** de 11 % a 20 %. O sea que el número premia
con ocho puntos destruir la incisión, que es el asunto entero de la obra. Es la ceguera
al canal que midió el evaluador, en su forma más concreta y más cara.

Y la salida no es elegir entre las dos cosas, porque **el original dice dónde acaba la
banda**: se avanza mientras el punto siga siendo tinta y se para al salir. Reproduce el
cabo exacto y **no puede soldar**, porque al otro lado de la incisión hay fondo. Es,
literalmente, la regla que la familia ya tiene escrita —*el trazo se acaba donde ya no
cabe*— usada para leer en vez de para dibujar.

```
              antes    ahora
r1             12,6 %   10,5 %
r2             14,7 %   13,4 %
r3             34,2 %   16,5 %   ← era el peor con diferencia
r4             11,5 %   10,8 %
r5             17,0 %   14,5 %
r6             21,9 %   21,1 %
mediana        15,8 %   13,9 %   (suelo del método: 13 %)
```

**Cinco de las seis están ya en el suelo del método**, o cerca: su diferencia es ruido
de binarizado y registro, no error de trazo.

### Y la soldadura NO está arreglada. Cuatro causas descartadas, una en pie

La topología sigue mal —el original de la cuadrada tiene **14** componentes y la réplica
**1**— y eso es lo que hace que a ojo siga «lejísimo» aunque el número diga 14 %. Se han
descartado cuatro sospechosos, cada uno con su medida:

1. **El alargue del cabo** — era *una* causa (arreglada arriba), pero no la única: con el
   alargue limitado a la tinta, la cuadrada sigue en 14 → 1.
2. **La calibración de anchura** (+12 %) — sin efecto: 14 → 2 con calibre 1,00 y 14 → 2
   con 1,12.
3. **Dónde se lee la anchura** (excluyendo o no los cruces) — sin efecto ninguno en las
   seis.
4. **La resolución del render** — sin efecto: mismos recuentos a 700 y a 1600 px, así que
   no es que la incisión se cierre al rasterizar.

Queda **un sospechoso, y con nombre**: el recorrido de `bandas()`, que atraviesa cada
nudo siguiendo la dirección más parecida. Si en un nudo elige mal, el eje resultante
**corta de una banda a la vecina cruzando la incisión** — y entonces la banda dibujada la
tapa. Es la única de las cinco que no está medida, y es la siguiente.

### El ajuste iterativo: de 86 % a 97 % de acierto

*«Deberías replicar cada una con un éxito del +95 % para sacar conclusiones»*, y luego
*«me gustaría subirlo al 98 %»*. Tiene razón en las dos cosas: con réplicas al 86 % no
se puede concluir nada sobre la técnica, porque no se sabe si lo que falla es la
técnica o la lectura.

Trazar de una pasada tiene un techo: cada error de lectura se paga entero y no hay
manera de enterarse. `referencias/encaje.py` hace lo contrario, un **ajuste**: se parte
de los ejes leídos y se corrige por RESIDUO —lo que falta y lo que sobra— con cuatro
movimientos: añadir bandas donde queda tinta sin cubrir, quitar las que el trazador se
inventó, afinar la anchura de cada una, y bajar cada vértice por descenso. Para que sea
posible, el dibujo se rasteriza en numpy con la misma construcción de bisel que
`banda()`: sacar el navegador del bucle es lo que permite hacer miles de renders en vez
de veinte.

```
              acierto   comp o→r   suelo
r1             97,5 %     8 → 8     0,7 %
r2             97,3 %    11 → 11    0,3 %
r3             96,8 %     7 → 7     1,0 %
r4             97,7 %     2 → 2     0,4 %
r5             96,9 %     7 → 4     0,1 %
r6             95,9 %    14 → 13    0,3 %
mediana        97,1 %
```

**Y la soldadura se arregló sola.** Es lo que más dice de todo esto: la topología pasa
de 14 → 1 a **14 → 13**, y no la arreglé buscándola. Salió de dejar que el ajuste quitara
las bandas inventadas y añadiera las que el trazado no vio. Llevaba tres vueltas
persiguiendo esa soldadura causa por causa; lo que la deshizo fue cambiar de método,
no encontrar la causa.

Dos cosas fueron las que separaron el 96 % del 97,5 %:

- **Forzar la inserción de vértices.** El eje simplificado no puede seguir el temblor
  del original: entre dos vértices va recto y la obra no. Partiendo los tramos (196 →
  373 vértices) el descenso tiene por dónde doblar. Lo tenía condicionado a que no
  empeorase — y partir un tramo empeora unas centésimas ANTES de que el descenso lo
  recupere, así que el paso no se activaba nunca.
- **Anchura vértice a vértice, acotada a ±8 %.** Sin cota vuelve el defecto que el autor
  señaló —cabo en punta, codo estrangulado— porque el ajuste, si le dejas, adelgaza
  donde le conviene.

**Y el suelo real es 0,1–1,0 %**, medido comparando cada original contra sí mismo con el
umbral movido un 4 %. O sea que el 98 % que pide el autor es alcanzable y lo que queda
por cerrar es error de verdad, no grano de papel.

### Resuelto: eran dos cosas, y ninguna es error de dibujo

El 97,1 % del ajuste y el 94 % que salía al pasar por `componer` se separaban por dos
causas, las dos medidas y ninguna de forma:

**1. No era la misma medida (≈1,5 puntos).** La primera compara en sitio; la segunda
recortaba, re-umbralizaba, filtraba por material, reescalaba y re-registraba, y cada
paso pierde algo. Midiendo las dos **igual** —en sitio, al mismo tamaño de píxel— el
renderizador de la casa da **95,5 %** de mediana, no 94 %.

**2. Lo que queda entre los dos rasterizadores es UN PÍXEL DE BORDE (≈1,6 puntos).** Y
esto se comprueba, no se supone: de los píxeles en que discrepan, el **97–99 % está a
un píxel o menos del borde**, y el percentil 95 de esa distancia es **1,0 px**. O sea que
las dos dibujan **la misma figura** y difieren en el convenio del filo — el canvas
rellena con antialias y PIL no.

Así que el ajuste es válido: está afinando la técnica de la casa y no una aproximación
mía. Y el reparto del 3 % que falta para el 98 % queda desglosado: **~1 punto de suelo
de binarizado, ~1,6 de convenio de rasterizado, y el resto —menos de un punto— error de
dibujo de verdad.**

Dicho de otro modo: contra un original impreso, con filo de tinta sobre papel, un
modelo de banda poligonal está **a un píxel** de su techo. El 98 % es alcanzable pero
cae dentro del margen del convenio, no del dibujo.



### Las paralelas, las uniones y el margen: pesar el canal en el objetivo

El área es ciega al canal —una incisión de un pelo son cuatro píxeles de fondo— así que
cerrarla no cuesta casi nada y el ajuste la cerraba sin enterarse. Se arregla **en el
objetivo, no en el dibujo**: los píxeles que en el original son fondo ESTRECHO —el suelo
entre dos bandas, y sólo ése— pesan ocho veces más.

```
ref   acierto  comp o→r   canal o→r    constancia o→r
r1     97,1 %    8 → 8    0,30 → 0,30    0,77 → 0,74
r2     97,1 %   11 → 12   0,26 → 0,26    0,72 → 0,69
r3     95,8 %    7 → 7    0,62 → 0,66    0,32 → 0,31
r4     97,4 %    2 → 1    0,11 → 0,45    0,55 → 0,17
r5     95,9 %    7 → 3    0,06 → 0,17    0,57 → 0,29
r6     94,3 %   14 → 14   0,23 → 0,31    0,56 → 0,19
```

**En tres de las seis el canal sale exacto**, y en la cuadrada —que llegó a estar en
14 → 1— la topología queda **14 → 14**. El área baja 1,3 puntos al conseguirlo: el precio
que el evaluador había predicho, cobrado y verificado.

Un error propio por el camino, y de los instructivos: al ensanchar el peso hasta el filo
de las dos bandas —para que abrir de más costara igual que cerrar— dilataba
**proporcionalmente a la anchura**, y con bandas de 78 px eso son 27 px de dilatación.
Eso no marca el filo del canal: **inunda media obra y diluye el peso hasta dejarlo en
nada**. El canal empeoró (0,11 → 0,54) mientras el área subía. Va en píxeles absolutos y
pequeño, que es lo que la cosa es: un hilo y sus dos bordes.

### Y las dos que resisten: la incisión se cierra AL EXTRAER, no al ajustar

En la litografía y en el cartel el ajuste no puede defender el canal **porque cuando
llega ya no existe**: la litografía tiene 7 componentes y el trazado inicial da **1**,
antes de ajustar nada. Ningún peso en el objetivo arregla eso — no hay nada que pesar.

Descartadas, cada una con su medida:

- **El umbral de tapar agujeros** (`remove_small_holes` a `W²`, que con W=68 son 4.600 px
  y sí tapaba incisiones). Corregido a un valor absoluto pequeño; los recuentos no
  cambian.
- **La anchura inflada por los cruces** — leerla sólo fuera de ellos no mueve el
  recuento.
- **La resolución** — a 1.786 px en vez de 1.200 sale lo mismo (7 → 1).

Lo que queda medido y es el dato duro: en el cartel **la incisión mide 4 px sobre una
banda de 68**, o sea 0,06 anchuras. Reproducirla exige acertar el eje Y la anchura de
las dos bandas vecinas con menos de dos píxeles de error a la vez. Ahí es donde está el
techo hoy, y no en el objetivo.

### Aplicar la regla de la casa a la lectura: probado, y no sirve — que es el dato

Si la incisión se cierra al extraer, lo evidente es extraer con la regla puesta:
`respetaCanal()` en `encaje.py` recorta la anchura de dos ejes que **se acompañan**
hasta que el blanco entre ellos vuelva a medir el pelo, saltándose los pares cuyas
tangentes difieren más de 32° porque eso es un **cruce** y ahí la fusión es lo buscado.
Es la misma distinción de ángulo que usa el algoritmo para generar.

No abre ni una incisión:

```
trazado inicial, recorte GLOBAL          orig   sin    con
  ref04, la litografía                     2     1       2   (92,1 % → 72,0 %)
  ref05                                    7     1       1   (85,5 % → 77,4 %)
  ref06, la cuadrada                      14     3       3   (82,4 % =)
  ref01                                    8     7       7   (91,3 % =)

recorte POR VÉRTICE, g = 0,06 W / 0,12 W
  ref04  1 comp (88,4 % / 87,7 %)   ref05  1 comp (84,6 % / 84,4 %)
```

El recorte global además repite el error de la «anchura declarada» —un solo encuentro
apretado adelgaza media banda y hunde el acierto veinte puntos—; por vértice cuesta
cuatro y tampoco abre nada.

**Y que no sirva es lo informativo.** Si estrechar las bandas no abre el canal, es que
**los ejes ya pasan por donde va la incisión**: el fallo no es de anchura sino de
recorrido. `bandas()` cruza el pelo en un nudo y vuelve por el otro lado — que es
exactamente la figura que el análisis nombró hace tres vueltas y dejó sin implementar,
**«el pelo empieza y acaba dentro del negro»**: donde la incisión muere dentro de la
tinta sus dos costados se encuentran, el esqueleto hace una **Y**, y atravesarla de
largo produce un eje en horquilla que rellena la ranura.

La función se queda escrita y sin usar, con la medida en su docstring, porque
descartarla es lo que localiza el sitio. Lo siguiente no es pesar mejor: es **no
atravesar esa Y**.

### La soldadura, resuelta: la anchura era un número y tenía que ser un perfil

La horquilla era mentira. Medido sobre los píxeles de canal que la réplica cierra:
**el 0,0 % tiene un eje encima**. Lo que hay en el 80–94 % de ellos es que la banda
está dibujada más ancha que la tinta que hay ahí de verdad — el cartel pone 33 px
donde el original mide 14, la cuadrada 15 donde mide 5.

La causa es de un sitio concreto: a cada banda se le daba **un solo número** de
anchura, su moda. Donde el original adelgaza, la réplica no adelgazaba, y se comía la
incisión de al lado. Ahora cada vértice lleva la distancia medial de su sitio,
**capada por la moda** — la regla de la gubia de la casa, la que sólo resta, que de
paso devuelve los cruces a su anchura.

Y se lee **cruda**, sin suavizar, que salió al revés de lo que razoné. Había puesto un
máximo corrido de 0,35 W «para deshacer el hundimiento de la esquina», acordándome de
que medir la anchura en los vértices la sacaba fina. Pero aquel error era otro: era
sacar *un* número para toda la banda a base de muestras de esquina. Aquí el máximo
corrido lo único que hacía era **rellenar los estrechamientos con la anchura de al
lado**, o sea la avería que veníamos persiguiendo.

Y una segunda corrección del mismo sitio: el largo mínimo se medía **antes** de alargar
los cabos, así que descartaba trazos que dibujados miden anchura y media. En la
cuadrada eran siete bandas de veintinueve, y devolverlas vale 6,5 puntos. La
alternativa —bajar el umbral— volvía a pedir el extremo de la rejilla: a 0,0 seguía
subiendo, que es la trampa de siempre.

Resultado, ya con el ajuste completo:

| | antes | ahora | comp | canal o→r | constancia o→r |
|---|---|---|---|---|---|
| r1 | 97,1 % | 97,9 % | 8 → 8 | 0,30 → 0,30 | 0,77 → **0,77** |
| r2 | 97,1 % | 97,6 % | 11 → **11** | 0,26 → 0,26 | 0,72 → 0,70 |
| r3 | 95,8 % | 97,2 % | 7 → 7 | 0,62 → 0,63 | 0,32 → 0,31 |
| r4 | 97,4 % | **98,3 %** | 2 → 1 | 0,11 → 0,29 | 0,55 → 0,15 |
| r5 | 95,9 % | 95,3 % | 7 → 3 | 0,06 → 0,24 | 0,57 → 0,21 |
| r6 | 94,3 % | 96,9 % | 14 → **14** | 0,23 → 0,25 | 0,56 → **0,49** |

Mediana 96,5 % → **97,4 %**. Sin canje: suben a la vez el acierto, el número de
incisiones, la anchura del canal y su constancia.

### El 97,4 % era mentira: me estaba midiendo con mi propia regla

El autor no se lo tragó — *estoy seguro de que no estás al 98 %* — y tenía razón. El
número que venía dando salía de `pinta()`, el rasterizador de numpy que existe para
poder iterar. **La comprobación que cuenta es pasar la receta por `componer()` en el
navegador**, y esa no la había vuelto a hacer desde que se tocó `banda()`.

Hecha: mediana **95,9 %**, no 97,4 %. Punto por punto: 96,0 / 95,2 / 96,2 / 97,5 /
94,7 / 95,7.

Y las dos construcciones **sí son la misma forma**: el 97–100 % de la discrepancia
entre los dos rasterizadores está a un píxel del filo, p95 = 1,0 px. Lo que pasa es que
el canvas **antialiasa** y `pinta()` no, así que el canvas sale medio píxel más fino en
todo el contorno. Y como el ajuste optimiza contra `pinta()`, heredaba su convenio:
**un ajuste siempre se parece más a su propio patrón de medida**.

No se arregla desplazando el filo —corregirlo en +0,2/+0,4 px sólo devuelve 0,3 puntos,
95,9 → 96,2— así que se arregla el patrón: `pinta()` dibuja a 3× y baja con umbral de
media cobertura. Con eso los dos coinciden al 98,8–99,5 % (antes 96,7–98,8) y numpy
predice el canvas con medio punto de error. Reajustando la anchura contra ese patrón,
por `componer()`:

| | acierto | ≤1 px del filo | sin esa franja |
|---|---|---|---|
| r1 | 97,4 % | 97 % | **100,0 %** |
| r2 | 96,5 % | 90 % | 99,6 % |
| r3 | 97,1 % | 92 % | 99,8 % |
| r4 | **98,0 %** | 87 % | 99,8 % |
| r5 | 95,1 % | 46 % | 97,3 % |
| r6 | 96,6 % | 88 % | 99,6 % |

**Mediana 96,8 %.** Una llega al 98 % pedido y las demás no. El residuo sigue siendo
una piel de un píxel —87–97 % de la discrepancia en cinco de las seis— así que lo que
falta no es composición sino filo, y el suelo del método (el original contra sí mismo
con el umbral movido) está en 0,1–1,0 %: o sea que el 98 % es alcanzable en principio y
hay que ganarlo ahí, con pasos de anchura y posición más finos que los 0,25 px de este
pulido.

### Los rasgos, extraídos de las seis, y el marcador contra la familia

El mismo trazador por los dos lados, todo en unidades de la obra. No se mide lo que ya
se sabe que el motor tiene: se buscan los que le faltan.

Los números de abajo son los de **trazos enteros**. La tabla anterior se midió con el
trazador que partía un trazo en cuatro, y eso no movía un decimal: movía la mitad de la
tabla. Todo lo que se calcula *por trazo* —largo, giros, cierre, cuerda— salía
sistemáticamente corto, y en el caso del cierre salía **al revés**: partir un trazo le
destruye el giro neto. Un instrumento mal calibrado no da ruido, da un objetivo falso.

| | r1 | r2 | r3 | r4 | r5 | r6 | refs | familia |
|---|---|---|---|---|---|---|---|---|
| anchura / lado | 0,03 | 0,04 | 0,05 | 0,05 | 0,09 | 0,09 | 0,05 | 0,04 |
| **largo del trazo (lados)** | 0,74 | 0,54 | 0,85 | 1,46 | 1,04 | 0,61 | **0,79** | 0,43 |
| **el más largo (p90)** | 1,13 | 1,04 | 1,16 | 2,52 | 1,17 | 1,09 | **1,14** | 0,81 |
| vibración de grosor (cv) | 0,08 | 0,20 | 0,12 | 0,26 | 0,34 | 0,28 | 0,23 | 0,26 |
| quiebros por anchura | 0,31 | 0,34 | 0,26 | 0,28 | 0,43 | 0,39 | 0,32 | 0,21 |
| ángulo de quiebro | 39 | 45 | 49 | 46 | 48 | 78 | 47 | 56 |
| quiebros a escuadra | 0,08 | 0,19 | 0,07 | 0,15 | 0,14 | 0,49 | 0,14 | 0,25 |
| cierre del circuito (p90) | 0,72 | 0,23 | 0,63 | 0,59 | 0,41 | 0,40 | 0,50 | 0,46 |
| cuerda / largo | 0,60 | 0,80 | 0,68 | 0,23 | 0,90 | 0,72 | 0,70 | 0,74 |
| longitud en 4 rumbos | 0,46 | 0,55 | 0,67 | 0,64 | 0,70 | 0,82 | 0,66 | 0,59 |
| longitud en los ejes | 0,21 | 0,39 | 0,48 | 0,57 | 0,43 | 0,61 | 0,45 | 0,22 |
| canal (anchuras) | 0,30 | 0,26 | 0,62 | 0,11 | 0,06 | 0,23 | **0,24** | 0,49 |
| constancia del canal | 0,77 | 0,72 | 0,32 | 0,55 | 0,57 | 0,56 | **0,56** | 0,26 |
| cuánto se acompañan | 0,46 | 0,57 | 0,48 | 0,46 | 0,87 | 1,06 | 0,53 | 0,43 |
| **línea total (lados)** | 6,47 | 6,43 | 5,74 | 6,94 | 6,23 | 7,67 | **6,45** | 4,83 |
| piezas | 8 | 11 | 7 | 2 | 7 | 14 | 7,5 | 11 |
| suelo encerrado | 0 | 0 | 0 | 5 | 2 | 0 | 0 | 0 |
| margen al borde | 0,01 | 0,02 | 0,02 | 0,00 | 0,01 | 0,03 | 0,02 | 0,00 |
| **tinta** | 0,17 | 0,20 | 0,25 | 0,25 | 0,32 | 0,51 | **0,25** | 0,17 |

Y lo que la tabla nueva dice, que no es lo que decía la vieja:

- **El largo es el rasgo que falla, y falla el doble de lo que parecía.** 0,43 contra
  0,79 —y el más largo 0,81 contra 1,14—. Con la medida vieja el hueco era 0,21 contra
  0,30; ahora se ve entero. Es *el* problema abierto de la familia.
- **El cierre NO fallaba.** 0,46 contra 0,50, y con la misma dispersión (p10 0,25 / p90
  0,74 contra 0,23 / 0,72). El 0,19 de la tabla vieja era el trazador partiendo trazos.
- **La vibración de grosor ya está** (0,26 contra 0,23): la deriva lenta la arregló.
- Lo que sigue mal y ya se sabía: **el canal sale del doble de ancho y la mitad de
  constante** (0,49/0,26 contra 0,24/0,56), y **la tinta es dos tercios** de la que hay
  que poner.

Cuatro rasgos que el motor no tenía y ahora sí:

- **Los rumbos.** Entre el 48 % y el 81 % de la longitud cae en sólo 4 de 18 casillas de
  dirección. La obra tiene un **alfabeto corto de direcciones** y un trazo no gira lo
  que le apetece: vuelve a uno de los pocos rumbos que la obra tiene. Es lo que hace
  que un Chillida se lea *construido* y no garabateado. El motor sólo lo hacía en las
  obras `orto`, que son el 30 %; ahora lo hace siempre, y el número sale clavado a la
  primera (0,60 contra 0,61).
- **El ángulo de quiebro es de 34 a 47 grados, y sólo del 4 % al 35 % son a escuadra.**
  La escuadra es un TIPO —la cuadrada pequeña, con el 35 %— y no la norma. El motor
  tenía el 18 %, o sea el doble de la mediana.
- **La anchura llega de 0,032 a 0,091 del lado**, casi el triple entre la más fina y la
  más gorda. El motor iba de 0,048 a 0,086: no sabía dibujar las dos finas.
- **El margen es casi cero**: la tinta llega al filo del cuadro (0,00–0,03 del lado). El
  motor dejaba 0,055, más del doble de aire.

Y uno que se resistía, con su medida: **la anchura de un trazo varía un 15 % (cv)** y el
motor daba 0,05. No se arregla subiendo el temblor — `anchoEn` promedia dos senos, así
que la variación efectiva es la cuarta parte de lo pedido, y triplicando la amplitud el
coeficiente pasaba de 0,05 a 0,07 mientras la banda se deshilachaba. **La variación del
original no es de alta frecuencia**: el trazo tiene partes gordas y partes finas, una o
dos ondas en todo el recorrido. Añadida esa deriva sube a 0,09.

*(Con trazos enteros el objetivo era 0,23 y la deriva lo deja en 0,26: resuelto. La
medida vieja estaba corta por los dos lados —el objetivo y el resultado— porque un trozo
de trazo no tiene la variación de un trazo.)*

### El encargo, dicho por el autor, y lo que le falta al motor para cumplirlo

*«Producir en serie lo irrepetible.»* Y una aclaración que reencuadra las seis
referencias: **nunca fueron el objetivo**. Eran un banco de pruebas para dar con las
funciones — el algoritmo tiene que dar obras *como* esas, no esas. Cada una podría ser
una tirada suya, ninguna tiene que salir.

El orden de construcción, en sus palabras:

1. **Primero un trazo central**, un circuito. Un trazo es una línea de puntos unidos
   por rectas; eso es lo único que hay de partida.
2. A ese circuito se le dan las **variables: anchura —con una vibración, incluso de
   grosor— y longitud**, que ya está implícita en el trazo dibujado.
3. **Sobre él sale el número de trazos y la gravedad**, y se aplican. En r1–r4 los
   trazos tienden al centro.
4. **Márgenes constantes entre los trazos paralelizados.** Importantísimo.
5. **Cada punto del trazo tendrá un valor** que dice si tiende a solaparse. Si la
   paralelización es lo bastante fuerte, se da el solape; si no, el trazo **tiende a
   paralelizarse o a irse a otro lado**.
6. **La longitud manda**: en r6 los trazos son mucho más cortos que en r4.
7. El trazo es **casi cuadrado** —un rotulador de punta cuadrada con algo de
   organismo— y **también en el remate**: los que acaban en arista o en redondo no
   valen.
8. **Las juntas se rellenan**, porque el atributo principal es el halo: el margen entre
   trazos solapados.
9. **Todo son trazos, y un trazo tiene continuidad y longitud.** Los micro-trazos no.

De eso, lo que ya cumple el motor: la anchura con gubia, el margen fabricado por el
halo, las juntas rellenas (`holguras`), el remate a escuadra, la gravedad al núcleo, y
—desde esta vuelta— la incisión corriendo con el trazo.

**Lo que no cumple es el punto 9, y ahora se sabe por qué.** Medido: la línea total
sobre la hoja no depende de lo que se pida. Pidiendo protagonistas de 2,05 · 2,6 · 3,2 y
4,0 lados, sale 4,55 · 4,46 · 4,47 · 4,61. Plana. La escalera no es la que manda.

Lo que manda es que **un trazo que roza a otro sin poder cruzarlo se TRUNCA**:
`recortar()` devuelve el trozo más largo que cabe, y el resto se tira. Por eso todo sale
corto por mucho que se pida largo. Y el arreglo está en el punto 5 del encargo: cuando
el solape no sale, el trazo **no debe truncarse — debe desviarse**, paralelizarse o
irse. Truncar es la respuesta equivocada a un estorbo, y es la causa de que la hoja se
lea a base de palos en vez de a base de cintas.

### r5, y por qué es la última: su pelo es de 4 px y mi temblor de 0,97

El 100 % de la tinta que sobra, en las seis, es **canal del original que la réplica
tapa**. Ni un píxel de exceso es otra cosa. Y sin embargo:

- estrechar la banda que lo tapa **nunca** mejora — ni en una de las seis, ni con ningún
  paso, ni con el canal pesado a 8, 25 o 60. O sea que la banda **no está gorda**;
- **cortar** la incisión sí quita el exceso (0,8 % → 0,3 % de tinta) pero cuesta más en
  tinta que falta, y al estrechar el corte el resultado converge otra vez a no cortar.

Las dos cosas juntas dicen lo mismo: **el exceso y la falta son los mismos píxeles
vistos por los dos lados.** No es que sobre tinta en un sitio y falte en otro: es un
filo desplazado una fracción de píxel, y moverlo cambia de qué lado se cuenta.

Y de ahí sale por fin lo que separa a r5:

| | W (px) | canal (px) | canal/W | temblor del filo | temblor/canal |
|---|---|---|---|---|---|
| r1 | 24 | 7,2 | 0,30 | 0,26 px | 0,04 |
| r2 | 24 | 6,3 | 0,26 | 0,34 px | 0,05 |
| r3 | 30 | 18,7 | 0,62 | 0,41 px | 0,02 |
| r4 | 40 | 4,5 | 0,11 | 0,40 px | 0,09 |
| **r5** | **68** | **4,0** | **0,06** | **0,97 px** | **0,24** |
| r6 | 32 | 7,2 | 0,23 | 0,39 px | 0,05 |

**El canal es casi constante en píxeles —4 a 7 en cinco de las seis— mientras la banda
va de 24 a 68.** O sea que la incisión no es una fracción de la banda: es una anchura
física, la del gubia. Y el temblor del filo sí escala con la banda (0,013 W). En r5 la
banda es la más ancha, así que el temblor es el mayor (0,97 px), y el canal es el más
estrecho (4 px): el temblor vale el 24 % del canal, de tres a doce veces más que en
ninguna otra. Por eso se le cierran los pelos, y por eso no se arregla con nada de lo
anterior.

**La consecuencia para la técnica es directa y ya está implementada:** un canal dejado
como *hueco entre dos filos* hereda el temblor de los dos, así que no se puede sostener
por debajo de un cierto ancho. Un canal **cortado** —la incisión, sustractiva, con su
propia anchura— no hereda ninguno. Es exactamente lo que el halo hace en `render`, y se
añadió hoy por otro motivo; la réplica lo justifica por su cuenta.

Y llevarlo a la réplica **no se puede a esta resolución**, que también es un resultado.
`componer` acepta `receta.cortes` y se afinó la lectura de las incisiones en tres sitios
—comprobar que hay tinta a los dos lados por la normal del propio canal (con el
gradiente de la distancia no vale: en la cresta es cero, y el filtro rechazaba las 23 de
23), simplificar diez veces más fino porque una incisión no es un trazo y no tiene
cadencia que respetar, y darle a cada vértice la anchura **mínima** de su tramo y no la
del vértice—. Con eso el exceso baja de verdad: en el cartel de 1,2 % a 0,6 %.

Pero la tinta que falta sube más, y se midió por qué: **el corte pisa tinta del original
en el 7–12 % de su propia área**, que es exactamente la falta que añade. No es un fallo
de la lectura: un corte tan ancho como el canal apoya su filo antialiaseado sobre los
píxeles de tinta de al lado, y el canal mide 4–7 píxeles. Estrechándolo deja de morder y
deja de quitar exceso a la vez — el barrido converge a no cortar.

O sea: **a 1200 px la incisión no se puede reproducir como marca propia, porque su
anchura es del orden del error de rasterizado.** No es que la técnica no la tenga: es que
el patrón de medida no la resuelve. La predicción —que a doble resolución el corte sí
pague— queda sin comprobar: `recortar` usa un margen de 12 px absolutos, así que el
recorte a 2400 no es la misma región física y la receta no encaja. Arreglarlo es
alinear el recorte, no cambiar nada de la técnica.

### Dónde está el suelo, por fin con una cifra: el filo se desvía 0,013 anchuras

Siete hipótesis seguidas sobre el residuo, todas medidas y todas muertas — y las cinco
últimas **añadían tinta** en algún sitio, lo cual ya era el aviso. Por orden:

1. el relleno de codo (barrido de bisel puro a inglete entero: el bisel gana o empata
   en cuatro de las seis);
2. ensanchar la anchura en el vértice del codo (92,1 % → 92,3 %, y cuesta incisiones);
3. llevar el vértice del codo al cruce de las dos rectas, porque el eje medial
   redondea la esquina (91,0–92,1 %: peor o igual);
4. alargar más el cabo (tope 1,4 → 2,0 → 2,8: peor);
5. parar el cabo mirando los dos costados y no sólo el eje (peor);
6. rematar el cabo en oblicuo en vez de a escuadra (peor);
7. un desplazamiento global del filo, medido ya en el canvas (+0,08 px: igual).

Lo que la medida dice cuando se le pregunta bien: **la mediana del desvío entre el filo
de la réplica y el del original es 0,00 px en las seis**, sin sesgo y sin depender de la
orientación del borde (0°, 45° y 90° dan lo mismo). Entre el 92 % y el 99 % del contorno
está a un píxel o menos.

Y el desvío medio, escrito en anchuras de banda:

| | acierto | W (px) | desvío del filo | en anchuras |
|---|---|---|---|---|
| r1 | 97,9 % | 24 | 0,26 px | 0,011 |
| r2 | 97,0 % | 24 | 0,34 px | 0,014 |
| r3 | 97,4 % | 30 | 0,41 px | 0,014 |
| r4 | 98,2 % | 40 | 0,40 px | 0,010 |
| r5 | 96,8 % | 68 | 0,97 px | 0,014 |
| r6 | 97,1 % | 32 | 0,39 px | 0,012 |

**0,010 a 0,014 en las seis, con bandas de 24 a 68 píxeles.** Constante en anchuras y no
en píxeles: no es la rejilla, es la técnica — el temblor de una poligonal con un vértice
cada 0,85 anchuras contra un filo dibujado a mano. Bajarlo pide más vértices, y eso ya
está medido: hunde la cadencia del tramo de 0,88 a 0,36 anchuras, o sea calcar.

De ahí sale algo que conviene tener claro antes de perseguir un número: **con el desvío
fijo, el acierto lo decide cuánto perímetro tiene cada obra por unidad de tinta.** r1
tiene el doble de perímetro relativo que r4 y por eso saca 97,9 % en vez de 98,2 %
haciendo exactamente lo mismo de bien. Pedir «98 % en las seis» es pedir que las seis
tengan la misma filigrana.

### Un agujero cerrado que no es una incisión no parte un trazo

Lo que quedaba mal en el cartel se veía de un vistazo en la hoja de comparación: **un
bloque rojo entero en la barra de abajo**, casi cuatro de los cinco puntos que le
faltaban. La firma en blanco casi corta la barra en dos, el esqueleto se rompe ahí, los
trozos caen por cortos y la banda sale con un muñón.

Pero taparlos todos no vale: en la litografía los agujeros cerrados **sí** son
incisiones —de las que mueren dentro de la tinta por los dos lados— y taparlas las
borra (medido: 94,2 % → 93,5 %).

La diferencia se ve midiéndolos, y es la regla de la casa: **una incisión mide `g`**.

| | ancho de cada agujero, en canales |
|---|---|
| ref04, la litografía | 0,9 · 1,0 · 0,6 · 0,6 · 0,9 |
| ref05, el cartel | **1,8 · 3,0** |

Un hueco de verdad entre los dos grupos, así que el umbral —canal y medio— cae en el
vacío y no en una nube de puntos. Se tapan sólo los anchos, y para las dos cosas: el
esqueleto (para que no trocee) y la anchura (para que no pellizque). Los estrechos
siguen mandando en el filo.

Medido sobre el trazado inicial: el cartel pasa de **89,1 % a 92,5 %** y la litografía
**no pierde nada**.

### Cinco de las seis están en el suelo del método, y se puede decir con un número

Quitando una franja de píxel y medio a cada lado del filo, el acierto es **100,0 %** en
r1 y 99,4–99,8 % en r2, r3, r4 y r6. El 97 % de la discrepancia de r1 cae a un píxel del
borde. O sea que en cinco de las seis **no queda dibujo mal**: queda el convenio del
filo — mi banda tiene arista poligonal y el original tiene tinta sobre papel.

La única con error de verdad es **r5**: sólo el 45 % de su discrepancia está a un píxel
del filo, el p95 se va a 10,8 px, y quitando la franja se queda en 97,5 %.

Dos maneras de comprar ese 2 % restante, las dos medidas y las dos descartadas:

- **Leer a más resolución.** A 1.800 px el acierto sube entre 0,1 y 4,8 puntos… pero es
  aritmética, no dibujo: el residuo es una piel de un píxel, así que al escalar por *k*
  el error cae como 1/*k* solo. Predicho para r1: 92,2 % → 94,8 %; medido 93,4 %, o sea
  que en términos reales **empeora**. Sólo r5 gana algo de verdad (+0,6). El hallazgo de
  la vuelta anterior —«la resolución no cambia nada»— sigue en pie, y ahora con la
  cuenta al lado.
- **Simplificar menos el eje.** Bajar DP de 0,05 a 0,01 da entre 0,1 y 0,2 puntos en
  cinco de las seis. Sólo r5 gana un punto entero, y a cambio la cadencia del tramo
  cae de 0,88 a 0,36 anchuras contra 0,74–0,91 del original: eso ya no es trazar.

### La medida vuelve a la familia: el margen sale del doble de ancho y la mitad de constante

El instrumento que se construyó para las réplicas se pasó por sesenta obras generadas,
la misma medida en los dos lados:

| | referencias | familia (60 obras) |
|---|---|---|
| canal (en anchuras) | 0,24 | **0,46** |
| constancia | 0,56 | **0,26** |

Es la queja del autor con número: *los márgenes entre trazos paralelizados no son
constantes*. Y no es que esté mal declarado — la obra elige **un** canal
(`sep = D·[1,00–1,20]`, `g = W·[0,08–0,16]`), o sea de 0,08 a 0,39 anchuras, justo el
rango de las referencias. Lo que sale no es lo que se pide.

Los dos primeros sospechosos **no lo explican**: apagando la gubia la constancia va de
0,25 a 0,27, apagando la vibración a 0,35, y apagando las dos vuelve a 0,26 — con 40
obras por caso esas diferencias no se sostienen. Queda abierto y con instrumento.

### El solape es binario, y el número estaba escrito del revés

El autor lo dijo así: *el solape sólo tiene que ser como un quiebro completo, o sea que
lo pase por encima siempre; si no, se paralelizarán*. O los trazos se apartan y se
acompañan, o uno pasa por encima del otro entero. Lo de en medio —el roce, dos bandas
que se muerden un poco— no se lee como decisión sino como una paralelización fallida.

Y el fallo estaba en el código, literal: **`distTrazos` devuelve cero cuando dos ejes
se cruzan de verdad**, así que el suelo que yo había puesto —«que no se acerquen más de
0,55 W»— rechazaba *todos* los cruces y dejaba pasar sólo los roces. Exactamente al
revés de lo que hacía falta.

Ahora se mide cuánto se meten, en anchuras (0 rozarse, 1 coincidir): por debajo de 0,35
se rechaza, y por encima tiene que ser un **cruce entero**, que son tres condiciones
diciendo lo mismo — los ejes se cortan de verdad, el ángulo no es rasante, y ningún
cabo (ni el mío ni el suyo) muere enterrado dentro del otro trazo.

Medido con `pelo.js`: el canal visible mínimo pasa de **0,286 g a 0,892 g**, y de 14
obras por debajo de g a 6 — las seis por medio píxel de rejilla. Y la cuña que se
saltaba el canal era un roce: se fue con ellos, sin tocarla.

### La valoración contra las seis, con el mismo trazador por los dos lados

| | referencias | familia |
|---|---|---|
| bandas | 19 | 18 |
| W / lado | 0,05 | 0,05 |
| acompañamiento | 0,50 | 0,55 |
| **línea total (lados)** | **6,9** | 4,1 → 5,2 |
| **tinta** | **0,25** | 0,16 → 0,17 |

Lo que *no* falla, y yo habría jurado que sí: **el acompañamiento**. Mirando la hoja
diría que mis trazos van cada uno a lo suyo, y la medida dice 0,55 contra 0,50. El
número de trazos también está clavado, y la anchura de banda también.

Lo que falla es **densidad**: hay un tercio menos de línea sobre la hoja, y por eso se
lee vacía al lado de un Chillida. La escalera se subió a `PROTA [1,70 2,80]` y
`CAIDA [0,80 0,92]` —y el objetivo son las referencias, no un gusto— pero **satura**:
subiendo `PROTA` a [2,0 3,2] la línea *baja* a 5,41. O sea que el techo ya no está en lo
que se pide sino en lo que la composición admite, y ahí es donde sigue el trabajo.

Dos hipótesis mías, muertas por medida en esta vuelta:

- **Que `recortar` se comiera los trazos.** El 64 % de los cabos muere contra otro
  trazo, y parecía la explicación. Pero `caboCabo` y `caboCuerpo` son relaciones
  *declaradas*: ese test no distingue recorte de intención. Y al cambiar la búsqueda
  binaria por un barrido de fuera hacia dentro, el número se movió de 63,9 % a 65,4 %:
  nada. (El cambio se queda porque el predicado de verdad **no es monótono** con el
  solape binario —a medio cruzar no cabe y cruzado entero sí— y una binaria supone que
  lo es. Pero no compró línea, y eso hay que decirlo.)
- **Que fuera culpa del halo.** Sin halo la línea es 3,79 y con halo 3,72, con los
  mismos quiebros. El trazo ya salía corto antes.

### Y entonces se rompió. Dos cosas, y las dos mías

El autor lo vio de un vistazo: *se ha jodido; ni se aproximan a lo de antes, que
estaban cerca*. Tenía razón las dos veces.

**La primera: la incisión no va a lo largo del trazo, va en el cruce.** Cortando el
halo por todo el contorno se destroza justo lo que funcionaba. Dos trazos que se
acompañan están a `sep = D·[1,00–1,20]`, o sea que su canal **ya** mide g o más; el
segundo, al pintarse, le comía otro g al primero — el canal se duplicaba y la banda de
abajo salía adelgazada. Yo leía el canal ancho como «faltan contactos» y era esto.

Y la regla del solape ya cubre lo demás: o están a D o más —y el canal existe solo— o
se cruzan enteros, y ahí sí hace falta el corte. Así que la incisión se recorta a un
disco alrededor de cada cruce. De propina sale la figura que las referencias tienen y
que este README llevaba nombrada sin implementar: **el pelo empieza y acaba dentro del
negro**.

Eso destapó un agujero en mi propia regla: dos trazos que se cruzan **en un sitio**
quedaban autorizados a rozarse en cualquier otro, porque el mínimo global es cero por
el cruce y la comprobación pasaba entera. Ahí el corte no llega. Ahora cada
acercamiento tiene que estar en **su** cruce. Y el radio del disco es el mismo número
en el dibujo y en la regla —2,2 anchuras— porque si se separan, o la regla deja pasar
tinta que el corte no abre, o el corte muerde donde no hacía falta. 2,2 no es un ajuste:
con el ángulo mínimo de cruce el solape de dos bandas llega a 0,81 anchuras del corte,
y a 3,0 la medida ya no mejora.

**La segunda: la línea no se compra aplanando la escalera.** Persiguiendo los 6,9 lados
subí `CAIDA` a [0,80 0,92]. La línea subió, sí — y la hoja se rompió: con esa caída
todos los trazos miden casi lo mismo, no hay protagonista, y sin protagonista la obra
es confeti. Comprar el número aplanando la jerarquía es pagar con lo único que hacía
que la composición se leyera.

Se compra por `PROTA`, que alarga al que manda sin tocar la forma de la escalera:
[2,05 3,20] con `CAIDA` [0,62 0,82] da **la misma línea que la escalera plana** —4,1
lados— con la jerarquía intacta.

La lección, que es la de siempre y esta vez la pagué en la imagen y no en la medida:
**un número medido de las referencias es un objetivo, no una instrucción.** 6,9 lados
de línea es cierto; «sube CAIDA hasta que salgan» no se sigue de ahí.

### Y una regla que las referencias cumplen y la familia no: el suelo no se encierra

Las seis tienen **cero ojos** — cero suelo encerrado por la tinta (la enmarcada tiene
tres, y suman el 1 % de su tinta). El blanco siempre drena hacia fuera. Es coherente
con lo que la incisión es: un corte por donde se ve el suelo, no un ojal.

La familia llega a **9 ojos** en su p90. Es la diferencia estructural más limpia que ha
salido en toda la comparación, va en la dirección contraria a la que yo buscaba, y es
justo el rasgo que este README lleva desde el principio anotado como *medido pero sin
control que dispare*. Ahora tiene contra qué compararse.

### El circuito son ocho trazos, no dieciséis: contar como cuenta el autor

El autor lo dijo dos veces y a la segunda puso los números: *«te digo los trazos que veo
yo. r1‑8, r2‑10 (uno de ellos solapado, que parecen 11), r3‑7, r4‑5, r5‑6, r6‑14»*. Son
**50**. El trazador iba por **65**, así que la columna del circuito —lo único que el
algoritmo tiene que inventar— se leía un 30 % más complicada de lo que es. Eso no es un
detalle de instrumento: si el circuito se lee partido, el motor aprende a partir.

Calibrando contra esos números salen dos cosas, y ninguna es un ajuste fino:

- **La distancia entre cabos no gobierna nada.** Limitar la unión a 20 anchuras da
  exactamente el mismo resultado que no limitarla. Quien decide es la prueba de tinta:
  dos cabos solo se juntan si la recta entre ellos es toda tinta, y eso ya acota la
  separación sola —lo que hay entre dos cabos del mismo trazo es la masa por debajo de
  la cual pasa—. Un umbral que no corta nada es peor que no tenerlo, porque aparenta
  gobernar; queda apagado y dicho.
- **El ángulo no es un mando aparte: es `GIRO_NUDO`.** La pregunta —cuánto puede girar
  un trazo y seguir siendo el mismo— es la misma en un nudo y a media distancia, y dos
  umbrales para una pregunta dan dos respuestas. Además cae donde tiene que caer: 100°
  es la escuadra de la casa más holgura, así que una banda que dobla en ángulo recto
  sigue siendo una.

Resultado: **8 / 11 / 7 / 5 / 7 / 14** contra los 8 / 10 / 7 / 5 / 6 / 14 del autor
—error 2, desde 15— y el acierto de píxel ni se entera (91,9 % contra 92,0 % de mediana).

Las dos que sobran están explicadas y ninguna es del instrumento:

- **r2** lo canta el propio autor: *«uno de ellos solapado, que parecen 11»*. 11 es lo
  que se ve y 10 lo que hay. El trazador ve.
- **r5** es un muñón de 1,7 anchuras arriba a la izquierda. Mirado en el píxel, lo que
  lo separa de la banda de abajo es una **incisión de verdad** —la fila y=114 está
  blanca de lado a lado—, así que el trazador lee bien: es el trozo visible de un trazo
  que sigue por debajo.

Y la tentación evidente —subir el mínimo de longitud hasta que el muñón caiga— **está
medida y no se hace**: a 2,5 anchuras r5 sale 6, pero r6 baja de 14 a 11 y pierde 4,5
puntos. Eso no es un umbral mal puesto; es el **punto 6 del encargo** con un número al
lado: *los trazos de r6 son mucho más cortos*, y lo son de verdad. Donde el trazador y
el autor no coinciden es justo donde uno lee el píxel y el otro lee la intención, y el
desacuerdo cae siempre en un trazo que pasa por debajo y solo asoma. El instrumento no
tiene que resolver eso: tiene que decirlo.

**Y un subproducto que vale más que la cuenta: piezas = trazos.** Con los trazos
enteros, el número de componentes de tinta y el número de trazos coinciden **exactamente
en cinco de las seis** (8‑8, 11‑11, 7‑7, 7‑7, 14‑14). No es circular —un trazo no puede
saltar de una componente a otra, porque la unión exige tinta, y una componente sí puede
contener dos trazos—: lo que dice es que **en estas obras ningún trazo comparte tinta con
otro**. La incisión corta *todos* los cruces. La excepción es **r4**, 5 trazos en 2
componentes, que es justo la de las bandas que convergen y se funden a la derecha.

Es la formulación más limpia que ha salido del halo, y es comprobable en la familia sin
elegir umbral: si la incisión hace su trabajo, contar manchas es contar trazos.

### Y con la mitad de trazos replica MEJOR, que era lo contrario de lo que yo esperaba

Rehecho el ajuste entero con la descomposición nueva, contra el mismo patrón y con el
mismo rasterizador de la casa a 3×:

| ref | trazos | acierto | acierto (canal pesado ×8) |
|---|---|---|---|
| r1 | 16 → **8** | 97,3 → **97,6 %** | 90,5 → **91,7 %** |
| r2 | 20 → **11** | 96,5 → **96,9 %** | 88,7 → **90,1 %** |
| r3 | 17 → **8** | 96,2 → **97,1 %** | 85,6 → **89,1 %** |
| r4 | 24 → **5** | 98,0 → **98,1 %** | 91,1 → **91,8 %** |
| r5 | 10 → **7** | 96,2 → **96,8 %** | 83,2 → **87,2 %** |
| r6 | 29 → **14** | 96,3 → **96,4 %** | 87,0 → **88,2 %** |
| | 116 → **53** | 96,4 → **97,0 %** | 87,8 → **89,6 %** |

**Mejora en las seis, en las dos medidas, con menos de la mitad de trazos.** Yo contaba
con pagar algo: menos piezas es menos grados de libertad, y un ajuste con menos grados de
libertad ajusta peor. Pues no.

El motivo, y es de fondo: **un trazo tiene UNA anchura, la de su gubia.** Partido en
cuatro, cada trozo se lleva la suya, y eso parece más expresivo pero es peor —los trozos
cortos caen justo en los cruces, que es donde la medida de anchura miente, así que la
libertad de más se gasta en copiar el error—. Entero, la anchura sale del tramo limpio
más largo, que es de donde el artista la sacó.

Y lo confirma **cuál** de las dos medidas mejora más: la del canal pesado, +1,8 frente a
+0,6. O sea que donde los trazos enteros pagan es **en la incisión**, que es exactamente
lo que el autor lleva señalando desde el principio.

### El cierre, que sí era una variable y no era el número que yo decía

El autor lo declaró: *«cuánto tiende el trazo a cerrarse o a abrirse; r1 circula más, r3
es totalmente abierto»*, y añadió que **es de obra y no de trazo** — se aplica sobre todo
al primero y marca el carácter; la relación entre trazos la manda la gravedad, no el
cierre. Estaba sin implementar.

Se dibuja con una sola cosa, **la mano**: un trazo que alterna el lado en cada giro
zigzaguea y no cierra; uno que gira siempre del mismo lado da la vuelta. Así que el
cierre es la probabilidad de *no* alternar, y no hace falta ni un ángulo más. De paso
apareció un descuido: la rama que gobierna casi todos los giros —la de los rumbos—
tiraba una **moneda nueva** en cada giro en vez de llevar la mano, o sea un paseo
aleatorio gobernara lo que gobernara el resto.

Y entonces la medida dijo dos cosas que yo no esperaba:

**Una, que el número que este README traía era falso.** Decía que la familia cerraba 0,19
contra el 0,50 de las referencias. Era del trazador viejo: **partir un trazo le destruye
el giro neto**, así que medía trozos y los trozos no cierran. Con trazos enteros la
familia ya daba 0,46 contra 0,50, y con la misma dispersión (p10 0,25 / p90 0,74 contra
0,23 / 0,72). No había nada roto.

**Y dos, que el mando gobierna pero flojo.** Fijándolo y midiendo el giro neto que sale,
50 obras por punto:

| pedido | 0,00 | 0,10 | 0,20 | 0,35 | 0,50 | 0,65 | 0,80 | 1,00 |
|---|---|---|---|---|---|---|---|---|
| p50 | 0,37 | 0,44 | 0,46 | 0,49 | 0,48 | 0,49 | 0,50 | 0,54 |
| p90 | 0,50 | 0,54 | 0,62 | 0,66 | 0,65 | 0,69 | 0,75 | 0,84 |

Monótono, sí, pero de punta a punta mueve la mediana 0,17 mientras que **a mando fijo la
variación entre obras va de 0,23 a 0,84**. Manda más la tirada que el mando, y la causa
es concreta y no es el mando: **para cerrar hacen falta giros, y los giros salen de la
longitud**. Con tres quiebros de 45°, ni girando siempre del mismo lado se pasa de 0,38
de vuelta. El cierre está **topado por el largo**, que es justo el rasgo donde la familia
más lejos está. Arreglado el largo, el cierre recupera su rango solo; forzarlo aquí sería
tapar un síntoma.

Se queda, entonces, no porque arregle un número —no arreglaba ninguno— sino porque el
autor lo declaró como variable y **una variable de carácter tiene que poder pedirse**.

### El largo: primero medir QUÉ para el trazo, y luego tres hipótesis mías caídas

El largo es el rasgo que peor va —0,43 contra 0,79— y llevaba dos vueltas atacado a
ciegas. Antes de tocar nada, la pregunta: ¿los trazos se **piden** cortos o se **cortan**?

Instrumentado el bucle de colocación: se piden **1,74 lados** —más ambiciosos que el
trazo más largo de cualquier referencia— y se entrega el **35 %**. No se piden cortos: se
cortan. Y de las llamadas a `desviar`, **el 56 % moría sin devolver nada**.

**El primer agujero, y era de bulto.** `desviar` empieza llamando a `recortar`, y
`recortar` devuelve `null` cuando lo que salva no llega al mínimo de longitud. Así que el
trazo bloqueado **en su arranque** —justo el que más necesita desviarse— se rendía en esa
línea sin llegar a intentarlo nunca. El mínimo pasa al final, sobre el trazo ya
reencaminado.

**El segundo, el del encargo.** `desviar` giraba a un rumbo cualquiera de la obra medido
*desde donde iba*, y nunca miraba al que le corta el paso. El punto 5 dice otra cosa: *si
la paralelización es lo bastante fuerte se da el solape; si no, el trazo tiende a
paralelizarse o a irse a otro lado*. Ahora `quienEstorba` devuelve el trazo más cercano al
punto de parada y los dos primeros candidatos son los suyos: **su rumbo** (paralelizarse,
en los dos sentidos) y **su normal** (alejarse). Snapped al alfabeto, como todo.

| | largo p50 | p90 | línea |
|---|---|---|---|
| antes | 0,471 | 1,451 | 4,48 |
| + paralelizarse / alejarse | 0,486 | 1,456 | 4,72 |
| + el veto al final | **0,513** | **1,482** | **4,94** |

**Y tres hipótesis mías, muertas por medida en la misma vuelta:**

- **Que la colocación fuera el cuello.** El 34 % de las llamadas moría porque *ni el
  arranque cabía*: `caboCabo` y `caboCuerpo` salen en una dirección al azar de 0 a 360°
  alrededor de un punto del otro trazo, y media vuelta apunta a lo ya dibujado. Escribí
  un `sitioLibre` que mira antes de saltar. **4,94 → 4,92**: nada. `poner` se queda con el
  más largo de 26 intentos, y el máximo lo pone la geometría disponible, no cuántos
  intentos sobreviven.
- **Que el marco se arreglara girando hacia dentro.** Es el estorbo más frecuente (abajo),
  y ahí `quienEstorba` no devuelve nada. Añadido el candidato «al rumbo que mira al
  cuerpo»: **+0,00 en línea**.
- **Que se arreglara plegando.** Girar hacia dentro devuelve el trazo junto a su propio
  recorrido y lo mata `seCorta`; volver de verdad pide el pliegue, que la casa ya tiene.
  Ofrecido como salida del desvío: **4,94 → 4,92**. Tampoco.

**Y una trampa de método que casi me hace publicar ruido.** Cada candidato nuevo consume
tiradas del RNG, así que añadir uno **re-sortea el flujo entero**: a 60 obras el candidato
«hacia dentro» parecía *empeorar* la línea un 2 %, y a 200 obras da exactamente lo mismo.
Con un RNG determinista, cualquier cambio en el número de tiradas es un cambio de muestra.
**Nada por debajo de 200 obras dice nada aquí.**

#### Lo que de verdad para un trazo, con su cifra

| qué lo para | | |
|---|---|---|
| **el marco** | 35,0 % | se acabó el papel |
| **cruce malo** | 29,4 % | llega a otro pero el cruce no es entero (ángulo < 38°, cabo enterrado) |
| **roce** | 18,9 % | se acerca por debajo de `SOLAPE_MIN` y tiene que apartarse |
| **se corta** | 16,6 % | el trazo se echa encima de sí mismo |

Las dos del solape suman **48 %**, más que el marco. Y el marco no se recupera
desviando —las dos hipótesis de arriba lo demuestran—, así que el techo del largo está en
la regla de cruce, no en el tamaño del papel. Ahí es donde sigue el trabajo, y ahora con
una cifra al lado en vez de una intuición.

### La cuña, cerrada: el corte es el OFFSET de la tinta, no la misma banda más gorda

El largo se compró con esquinas, y cada esquina era una cuña: `pelo` pasó de **3 obras
por debajo de g a 8**. Esta vez, en vez de suponer, se miró — se pintó la obra peor con
cada trazo de su color y se recortó el píxel exacto donde dos tintas se tocan.

Dos hipótesis mías cayeron ahí mismo, y las dos en un minuto porque había número:

- **Que fuera un pincho de inglete pasándose de media anchura.** Medido en el punto del
  conflicto: la tinta está a **0,353 W** de un eje y a **0,424 W** del otro. Las dos
  dentro de su media anchura. No hay pincho.
- **Que la gubia pudiera ensanchar por encima del nominal.** `anchoEn` devuelve
  `W · (1 − …)` con los dos términos no negativos: **sólo estrecha**. Tampoco.

Lo que había era esto, y es de definición, no de ajuste. **Lo que hay que quitar no es
«la misma banda un canal más gorda»**: es el conjunto de puntos a menos de un canal de la
banda, o sea su **suma de Minkowski con un disco**. Y en una esquina convexa eso es un
**arco** de radio `h+g` alrededor del vértice. El bisel lo sustituía por su cuerda, y
entre la cuerda y el arco quedaba sin cortar una cuña por donde se colaba la tinta del
vecino. Cuarta puerta por la que entra el inglete en esta casa.

Primer intento: meter el arco a mano en `banda()`. Bajó de 9 a 7 obras y el mínimo subió
de 0,243 a 0,567 — mejor, pero no exacto, **y con un fallo mío dentro**: empujaba los
puntos del arco *antes* que la punta del inglete, así que el contorno se cruzaba consigo
mismo y dejaba una astilla. Los puntos de una esquina van en orden angular o no son un
contorno.

Y con eso a la vista salió la construcción que no necesita aritmética ninguna:

```js
ctx.beginPath(); banda(ctx, pts, W, gub, relleno, anchos); ctx.fill();
ctx.lineWidth = 2 * mas; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
```

Rellenar la banda **y además trazarla** con `lineWidth = 2·mas` y uniones redondas da
exactamente `{p : dist(p, banda) ≤ mas}`. Es la definición, dibujada. El cabo entra solo
por el remate redondo —ya no hace falta alargar el eje— y la punta del inglete deja de ser
un punto que haya que desplazar a mano: es parte del contorno que se traza.

**Resultado: 0 obras por debajo de g de 126, mínimo 1,063.** Sin un solo umbral nuevo.

Y una consecuencia en la batería que hay que decir: **`corta` dejó de disparar aquí**.
Antes cazaba 25 de 42; con el corte exacto, un trazo que se cruza consigo mismo ya no
deja ningún par por debajo de g —`pelo` mide entre etiquetas distintas y un trazo es una
etiqueta—. O sea que había dejado de ejercitar nada. Se retira del bloque y en su sitio
va **`cuna`**, que es la construcción de antes —la banda más gorda, con su bisel— y que
es justo lo que este detector existe para cazar: dispara 10 de 42, mínimo 0,365. El
control de un arreglo es el estado anterior al arreglo.

### «Las paralelizaciones no las veo y el trazo parece poco orgánico»

Dos juicios del autor mirando la familia al lado de las seis. Los dos ciertos, y los dos
con cifra — con **el mismo instrumento por los dos lados**, que es donde estuve a punto de
equivocarme otra vez: la primera medida de la familia salió de `geo.cintas` (la poligonal
generada) y la de las referencias de `ejesDe` (el eje trazado del píxel). Dos
instrumentos, ninguna comparación. Rehecho todo desde el píxel:

| | familia | referencias |
|---|---|---|
| **acompañado** (longitud a < 2 W de otro y a < 25°) | **21,8 %** | **37,7 %** |
| racha p50 / p90 (anchuras) | 1,8 / 4,5 | 1,3 / 3,7 |
| **orgánico** (eje fino ÷ eje grueso) | **1,006** | **1,013** |

Y lo que la tabla dice **no** es lo que yo habría dicho mirando: cuando la familia
acompaña, la sección es incluso **más larga** que en las referencias. Lo que falla es la
**frecuencia**. Las referencias tienen muchas rachas cortas por todas partes; la familia,
pocas y largas. No hay que alargar el acompañamiento: hay que repartirlo.

**Cuatro levas probadas para el acompañamiento, y ninguna paga:**

- **Subir el peso de `paralelo`.** Ya pesa 0,30–0,50 según el tipo: se declara mucho. El
  problema no es cuántas veces se pide.
- **La corrección de densidad.** El motor divide la cuenta de trazos por `escala^0,85`
  —banda ancha, menos trazos—. Las referencias **no la respaldan**: la correlación entre
  anchura y número de trazos es **+0,26**, débil y del signo contrario (r6 tiene la banda
  más ancha *y* catorce trazos). Bajado el exponente a 0,45 y a 0: **21,8 % → 19,4 % →
  21,3 %**. Nada. La regla estará mal fundada, pero no es la que aprieta aquí.
- **Forzar la cuenta.** Con `trazos: 7` sube a 30,9 %, pero eso salta el rango del tipo
  *y* la corrección a la vez, así que no dice cuál de las dos manda.
- **Subir el temblor.** A 8° la medida no se mueve; a 14° **la composición se cae** —tinta
  0,05, tres obras de catorce sobreviven— porque un trazo que zigzaguea se choca consigo
  mismo y `seCorta` se lo come. Misma lección que ya costó la vibración de grosor: lo que
  el original tiene no es alta frecuencia.

**Lo orgánico sí tenía leva, y no era el temblor: es la CURVATURA.** La deriva que había
es un paseo aleatorio de ±1,4° por paso, y con tramos de dos o tres subdivisiones no llega
a moverse; además una desviación *constante* da una recta inclinada, no una curva. Lo que
curva es un **sesgo sostenido**, sorteado una vez por tramo. Barrido sobre 28 obras:

| `CURVA` | 0 | 2,5 | 5 | 8 |
|---|---|---|---|---|
| orgánico | 1,007 | 1,005 | **1,010** | 1,006 |

A 5 se recorta el **40 % de lo que faltaba**, y de propina el acompañamiento sube de
18,4 % a 21,1 %: un trazo que curva roza más. **Y cuesta un 7 % de línea** (4,79 → 4,44),
que es justo el rasgo que peor va. Se queda porque el juicio era sobre lo orgánico, pero
el precio está aquí escrito y es discutible.

**Lo que NO está resuelto, y con nombre:** el acompañamiento sigue en 21 % contra 37,7 %.
El diagnóstico es que a un trazo le falta **acompañar a varios a lo largo de su camino**
—en las referencias una banda va un rato con A, se separa y va otro rato con B— mientras
que `colocar('paralelo')` le da **una** sección contra **un** objetivo y `DESVIOS = 1` no
deja encadenar una segunda. Ahí es donde hay que ir, y no a los pesos.

Al pasar la batería salió lo que el propio `mil.sh` está escrito para que salga —*«un
control medido contra un artefacto viejo es peor que no tener control: no prueba nada y
además convence»*— y salió por tres puertas a la vez.

**1. Tres parches que ya no encajaban.** `duro`, `miter` y `margen` parchean líneas
literales de `algo.js`, y las tres líneas se habían reescrito en refactores anteriores.
El guardia funcionó (se planta y no mide contra el fichero viejo), pero llevaban sin
comprobar nada desde entonces. Reparados. Y `margen` pasa a parchearse **por expresión y
no por literal**, con su motivo: `MARGEN` es una constante *medida*, así que se vuelve a
mover cada vez que se remide, y un control que se cae al remedir una constante es un
control que se acaba borrando. El código sí sigue por literal: si el código cambia, el
control hay que mirarlo.

**2. Una rama entera sin ejecutar, y su control parcheando código muerto.** Con halo, la
mitad de `cabeDuro` que decide los cruces por geometría —`bandaMala`, `CRUCE_MIN`,
`juntoAQuiebro`— **no se ejecuta nunca**, porque el camino del halo sale antes. Las
catorce configuraciones de la batería tienen halo. Así que el control `rendija` parcheaba
código muerto y salía **idéntico al sano, byte por byte**, sin que nadie se enterara. Es
exactamente lo que prohíbe la cabecera de `_lanza.js`: *una constante que nunca se varía
esconde su rama entera*. Añadida la configuración **`sin-halo`**, y los tres controles
geométricos (`duro`, `corta`, `rendija`) corren ahí: disparan 27/40, 33/40 y 7/40.

**3. Y el detector principal disparaba sobre obra sana.** `canal.js` seguía aplicando la
regla vieja —ningún par de ejes por debajo de `D = W+g`— a obras **con** halo, donde esa
regla no rige: el canal no se prohíbe, se fabrica al pintar, y dos ejes a 0,55 W son
composición. Cantaba **102 obras de 238**, más del 40 %, y con eso decidía el código de
salida de la batería. `pelo.js` documentaba la retirada desde hacía versiones; nadie la
había ejecutado.

La regla no estaba mal: estaba **sin acotar**. Ahora `canal.js` la afirma donde es cierta
—`geo.halo === 0`, y ahí sale 0 de 11 con mínimo 1,0016, exacta— y donde hay halo informa
de cuánto se meten los trazos sin dar veredicto. La garantía con halo la mide `pelo.js`,
**que además no estaba en `mil.sh`**: la batería comprobaba a fondo una regla retirada y
no comprobaba la vigente. Ya tiene su bloque, con `duro` y `corta` de control.

**Y el mismo error, en el otro sentido, en el detector nuevo.** Metida la configuración
`sin-halo`, `pelo.js` cantó `sin-halo` seed 1013885301 a **0,201 g**, el peor de los 45.
No es un defecto: sin halo el canal no se fabrica, se prohíbe sobre los ejes, y un cruce
**legal** —dos trazos que se funden— no deja blanco ninguno entre las dos tintas. Allí una
regla de geometría aplicada a obra con halo; aquí una regla de píxel aplicada a obra sin
él. **Cada detector afirma en su mitad y describe en la otra**, y `pelo.js` se planta con
código 2 si *ninguna* obra tiene halo — el caso en que un cero no significaría nada.

#### El marcador, a 160 obras por bloque

| bloque | sano | controles |
|---|---|---|
| canal | 0 rendijas sin halo (**min 1,0016**), 0 holguras de 165 | duro 84/120 · corta · rendija · holgura 120/120 |
| pelo | **0 de 126** por debajo de g (**min 1,063**) | duro 32/42 · cuña 10/42 |
| toque | 0 de 45 tinta fuera de la geometría | miter 57/60 · cabo 60/60 |
| obra | 0/165 escapado, garabato, pizcas, muestrario | margen 102/120 · garabato 120/120 · pizca 92/120 |
| det | 60/60 determinismo · 60/60 misma huella a 760/2400/4200 | *(no puede tenerlo, y está dicho)* |

**Verde entero, y `pelo` en cero por primera vez.** El rojo que había —el halo garantiza
el canal en el costado y no en el pico— está cerrado, y por construcción: ver la sección
de la cuña.

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
