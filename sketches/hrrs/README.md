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

#### El acompañamiento, desmontado: siete levas y ninguna paga

Escribí aquí que a un trazo le faltaba «acompañar a varios a lo largo de su camino» y que
`colocar('paralelo')` le daba una sección contra un objetivo. **Falso, y basta con abrir
el fichero**: la segunda sección lleva tiempo implementada (`P_DOBLE = 0,45`, con su
puente y su tramo libre detrás). Un diagnóstico que no se comprueba contra el código es
una historia.

Comprobado, entonces. Primero: **el acompañamiento no se pierde al recortar, no se
construye** — medido en el motor, 12,4 % al colocar y 9,8 % tras `desviar`. Y segundo, el
desglose que lo decide, midiendo cada trazo contra todos los demás con la obra ya puesta:

| relación | trazos | acompaña |
|---|---|---|
| **paralelo** | 42 | **38,4 %** |
| cerco | 18 | 16,6 % |
| suelto | 41 | 15,4 % |
| abanico | 20 | 15,2 % |
| continua | 24 | 14,1 % |
| caboCuerpo · tangencia · pata · caboCabo | 69 | 9–11 % |
| | 214 | **18,6 %** |

**`paralelo` da 38,4 %, que es exactamente el 37,7 % de las referencias.** La relación
funciona. Lo que no llega es el resto, y con esa aritmética el objetivo **no se alcanza
cambiando la mezcla**: si `paralelo` da 38 y los demás 13, para que el conjunto dé 37,7
haría falta que el 99 % de la longitud fuera `paralelo`. No es un problema de pesos.

Las siete levas, con su cifra:

| leva | resultado |
|---|---|
| subir el peso de `paralelo` | ya pesa 0,30–0,50; no es cuántas veces se pide |
| bajar la corrección de densidad (0,85 → 0,45 → 0) | 21,8 → 19,4 → 21,3 % |
| forzar la cuenta de trazos | 30,9 %, pero salta dos reglas a la vez: no dice cuál |
| subir el temblor | a 8° nada; a 14° la composición se cae (tinta 0,05) |
| `paralelo` en la baraja de los cortos (0,10 → 0,60) | 18,6 → 18,3 %: los cortos aportan poca longitud |
| todas las relaciones al alfabeto de rumbos | 18,6 → 19,3 % |
| **la densidad, como causa** | **correlación acompañado ↔ línea: −0,05 y +0,08** |

La última mata mi propia explicación: yo había escrito que acompañar dependía de la
densidad, la densidad del largo y el largo de la regla de cruce. **La correlación es
cero.** Y las referencias dicen lo mismo por su lado: **r6 es la más densa y la que menos
acompaña** (25 %), porque sus rumbos son ortogonales entre sí; r1 y r5, más aireadas,
llegan a 51 % y 58 %.

Lo que queda en pie, y ya sin historia alrededor: **la paralelización no es una relación
declarada, es una tendencia punto a punto.** Es literalmente el punto 5 del encargo —«cada
punto del trazo lleva un valor que dice si tiende a solaparse; si la paralelización es lo
bastante fuerte se da el solape, si no el trazo tiende a paralelizarse o a alejarse»— y es
lo único que no se ha implementado nunca: todas las levas de arriba están *dentro* del
marco de relaciones. Hoy sólo `desviar` paraleliza, y sólo cuando algo le bloquea.

### El tirón: el punto 5, implementado — y es la primera leva que paga

`trazar` recibe ahora los trazos ya puestos, y **en cada subdivisión del recorrido** el
punto mira qué tiene cerca (`vecinoEn`: el trazo más próximo dentro de `TIRON_R = 3`
canales, su distancia y su rumbo local) y **se deja llevar**: gira hacia el rumbo del
vecino hasta `TIRON = 20°` por subdivisión — o se aparta, si ya está a menos de un canal.
No es un salto, es una tendencia: una vez alineados, siguen juntos solos, que es
exactamente lo que el punto 5 describe.

Barrido sobre la obra terminada (acompañamiento total, dentro del motor):

| tirón | 0 | 4 | 10 | 15 | **20** | 25 | 35 |
|---|---|---|---|---|---|---|---|
| total | 18,6 | 19,3 | 18,7 | 22,4 | **26,7 %** | 25,0 | 23,7 |

Por encima de 20 vuelve a bajar: el trazo se pega demasiado y empieza a chocar. El radio
igual: 2,2 D da 24,8, 5 D da 23,6, y 3 D es el punto.

Con el instrumento honesto —del píxel, el mismo que las referencias—: **acompañado
18,4 % → 26,2 %** (objetivo 37,7) y la **racha p90 pasa de 2,7 a 3,7 anchuras, clavada a
las referencias**. Cuesta un 2,5 % de línea. En la hoja se ve: por primera vez hay haces
que no nacieron de la relación `paralelo`, sino de dos trazos que pasaron cerca y se
fueron juntos.

La batería, verde con el tirón puesto: `canal` 0 rendijas sin halo y 0 holguras de 195,
`pelo` 0 por debajo de g, `obra` 0/195 en las cuatro, y todos los controles disparando.

### El séquito: acompañar como ESTADO, no como empujón

Un ojo de fuera miró la hoja y dijo lo que faltaba mirar: **`circuito.png` absuelve la
técnica** —los esqueletos reales vestidos con la banda de la casa son casi
indistinguibles del original— **y condena la coreografía**. Las referencias no son N
trazos cerca unos de otros: son *carriles* de 2–4 hebras al pelo que **doblan juntas**.
Y el tirón, siendo la leva correcta, es un controlador **de rumbo sin consigna de
distancia**: captura pero no sostiene, y su racha muere en la primera bisagra porque el
giro del guion dispara ignorando si el punto va acompañado.

Así que el acompañamiento pasa a ser **estado del trazador**. Capturado un vecino —cerca
y ya más o menos a su rumbo (`SEQ_ANG = 38°`)—, el trazo **suspende su guion privado** y
viaja por el carril: sigue el rumbo local del vecino con un **servo de distancia** a la
consigna del grupo (`SEQ_KP` grados por canal de error), y en cada subdivisión sortea
seguir (`P_SUELTA`) o soltarse. Las co-bisagras salen solas: cuando el vecino dobla, su
tangente local cambia y el servo dobla detrás.

| | tirón solo | **séquito** | referencias |
|---|---|---|---|
| acompañado, en el motor | 26,7 % | **32,0 %** | — |
| acompañado, del píxel | 26,2 % | **30,9 %** | 37,7 % |

**Y cuatro de las cinco predicciones del diagnóstico fallan, que es lo que hay que
decir.** Se predijo canal 0,49 → ≤0,35, constancia 0,26 → ≥0,45, racha p90 3,7 → ≥6 W y
tinta ≥0,20. Medido: **canal 0,48, constancia 0,27, racha 3,6, tinta 0,17** — o sea que
el servo **captura pero no sostiene el carril**. Sólo el acompañamiento se movió.

El sospechoso es concreto y no es el mecanismo: la consigna está en `D·1,08`, pegada al
muro que `cabeDuro` rechaza a `D`. Con el temblor encima, cada bajada cruza el muro y el
trazo se trunca ahí, así que el carril nunca llega a durar. Se prueba subiendo la consigna
por encima de la amplitud del temblor — y si el canal no se estrecha con eso, entonces sí
es el mecanismo y no el ajuste.

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

## Décima vuelta: calcar los originales y sacar de ahí la lógica

El autor, viendo el modelo atascado, propuso otra cosa: *dibujar el trazo donde lo
sitúan los tres originales, ver si con eso la técnica llega a una exactitud alta, y
que las iteraciones salgan de la lógica de esos mismos cuadros*. Hecho, y en ese
orden.

1. **Calco automático.** Un trazador (`trace.py`, fuera del repo porque las
   referencias no se commitean) saca de cada original sus componentes, el esqueleto
   y los ejes simplificados. Pintados con el mismo campo de distancia que usa la
   obra, el solape con el original es del **88 %** en las referencias 1 y 3 y del
   70 % en la 2 (el grano de la xilografía ensucia el calco, no la técnica). La
   retícula ortogonal que había (`modelo: 'reja'`), encajada sobre los mismos ejes,
   cae al 61–67 %: la referencia no está en una reja, y la reja era el error.
2. **Lo que dicen los calcos**, medido sobre los tres (`stats.py`): quiebros por
   trazo 4 (2–6), ángulos de quiebro 27–55° con mediana en 40 y solo un 7 % a 80° o
   más, tramos de 0,8–2 anchuras, trazos de 5–12 anchuras de largo, el 89 % de los
   cabos **contra un cuerpo**, y la sección acompañada de un trazo entre 0,45 y 1,0
   de su largo.
3. **El modelo «libre»** (`tramarLibre`, el de producción desde esta vuelta) está
   escrito con esas distribuciones y nada más: el trazo es un paseo de tramos con
   quiebros que alternan de lado, el acompañante es el **desplazado exacto** de una
   sección del vecino, y el cabo cae donde ya no cabe.

Y las trampas que costó que midiera lo que dice:

- **El paseo moría en el primer sitio donde no cabía.** Un zigzag de 40° que
  alterna se choca consigo mismo a dos tramos, así que los trazos salían de 3
  anchuras. Ahora la mano prueba el giro que tocaba, y si no cabe sigue recta, o
  gira al otro lado, o gira menos; solo cuando ninguna de las cuatro cabe muere
  contra el cuerpo. La mediana pasó de 3 a 7 anchuras sin tocar un parámetro.
- **El acompañante se encogía en cascada**: cada uno era una fracción del anterior
  y el cuarto ya era un tocón. Ahora acompaña el 70–100 % del vecino y sobresale por
  los cabos, que es lo que hacen los de las referencias.
- **El pelo lo corta el halo, no la geometría.** El acompañante va a `W + g −
  0,12·W` de eje a eje, **solapado**, y el halo del de encima deja exactamente `g`:
  así el blanco mide lo mismo aunque la gubia adelgace el trazo. Sin halo no hay
  quien corte, y entonces va a `D` como todos — la batería `sin-halo` lo cantó a
  la primera, que es para lo que está.
- **Apretar.** Lo que hace compacta a la referencia 2 no es que los trazos se
  acompañen: es que entre dos que no se acompañan tampoco hay más blanco que un
  pelo. Al final, cada trazo se traslada —sin girar— hacia su vecino más cercano
  hasta quedar a `D`, y solo lo que cabe. No se aplica a la travesía, que es del
  papel entero.
- **Coherencia sin reja.** El trazo que no acompaña arranca paralelo o
  perpendicular al vecino junto al que nace (±10°). Es lo que hace que la
  referencia 2 parezca una reja sin serlo.
- **Cada tipo tiene su gramática en anchuras**, y es determinante (el autor lo dijo
  antes de que se midiera): el `recinto` (referencia 1, trazo fino) arranca con un
  **marco en U** de tres lados y los meandros cuelgan de la pared de enfrente hacia
  el lado abierto, con trazos de 15–40 anchuras; la `travesia` (referencia 3) entra
  por un borde y sale por el de enfrente, con cruces a 65° o más; el `bloque`
  (referencia 2) quiebra a 40–90°.

**Dónde está hoy, mirado en hoja:** `travesia` y `haz` leen como la referencia;
`bloque` tiene el canto, el pelo y los quiebros a escuadra pero sigue más suelto
que la 2 —quedan ríos de blanco entre grupos—; `recinto` tiene el marco y la
escala pero el interior sale a palos sueltos y no a meandros que corren juntos.
Lo de arriba es lo que falta, no un detalle: está escrito aquí para que la hoja
no se lea como acabada.

## Undécima vuelta: el calco como fuente

El modelo libre, con todo lo de arriba, seguía lejos: el autor lo dijo sin
rodeos («nada que ver con los originales aún») y tenía razón. Se probó la
alternativa de modelo —**una masa y sus cortes**, el blanco como incisión sobre un
cuerpo— y salió peor como imagen: compacta, pero un bloque tallado a rayas, sin el
tercio de papel abierto que tiene la referencia 2. Descartada en prototipo, sin
tocar el repo.

Lo que sí ha funcionado es la vía que el autor había apuntado al principio y que
yo había usado solo para medir: **el calco como fuente**. Los tres calcos (recinto
88 %, travesía 88 %, bloque 82 % tras limpiar el grano con un filtro de mediana)
están embebidos en `algo.js` (`CALCOS`: ejes y anchura de cada trazo, en unidades
del lado corto) y el modelo `calco` —el de producción desde esta vuelta— **muta el
calco dentro de su lógica**: simetrías y giro, quitar 1–4 trazos cortos, alargar o
acortar cabos hasta donde cabe, redoblar colas, mover medio trazo, temblar
vértices y añadir 1–3 acompañantes nuevos. Cada operación se comprueba contra el
canal con la anchura propia de cada trazo —`(Wi + Wj)/2 + g` de eje a eje, y un
cabo contra un cuerpo a `Wj/2 + g`— y se revierte si no cabe.

Lo que hubo que aprender por el camino:

- **El cabo se mide por el punto, no por el tramo.** Recortar los cabos del calco
  con la distancia de cuerpo a cuerpo los dejaba una anchura cortos y el bloque
  volvía a leerse suelto. Para un cabo contra un cuerpo la medida es la del punto.
- **Los cruces del calco solo valen en la travesía.** En las referencias 1 y 2 no
  hay cruces; los que el trazador encuentra son cabos metidos en el vecino, y
  pintados como cruce dejan esquirlas. Se anulan y el recorte de cabos los resuelve.
- **La anchura es de cada trazo**, no de la obra: `geo.anchos` la publica,
  `etiquetas()` la respeta y `canal.js` mide cada par con la suya.

**Dicho con todas las letras:** son obras derivadas de tres piezas concretas de
Chillida, en un proyecto que vende impresiones. Lo avisé como problema de autoría
y de derechos antes que de técnica, y el autor decidió seguir sabiéndolo. Queda
escrito aquí para que nadie lo descubra después.

**Lo que falta, mirado en hoja:** en los codos donde dos cabos se encuentran en
esquina aparece a veces una esquirla blanca (el corte del halo sobre una punta);
la travesía recorta trozos finos en el borde al pasar de vertical a cuadrado; y
las variaciones son todavía reconocibles como su original con pocas mutaciones.

## Duodécima vuelta: el margen se homogeneiza

El autor, sobre las hojas del calco: *«cuando trazos de Chillida se paralelizan,
me da igual si es la 1, 2 o 3, el margen entre trazos se homogeneiza prácticamente
en todo el cuadro. En tu caso hay distancias grandes y cortas»*. Y la regla que
propuso: el trazo es un conjunto de puntos, muchos, y cada punto está paralelizado
o no según la distancia a los trazos de alrededor.

Es `paralelizar()`, y corre después de componer en los modelos calco y libre: cada
trazo se muestrea a un cuarto de anchura; de cada muestra se busca el tramo de otro
trazo que corre casi paralelo (menos de 30°) más cercano, y si está a menos de una
anchura por encima del canal (`CAPTURA`), la muestra se lleva exactamente al canal
—a `(Wi + Wj)/2 + g` de eje a eje—; si no, queda libre. Los cabos que se encuentran
en ángulo no se tocan: la regla es de lo que corre junto, no de lo que se apoya.

Medido sobre 24 obras por tipo, con la distancia de cada muestra a su vecino
paralelo en unidades de su canal:

| | antes (p50 / p75) | después (p50 / p75) | hueco intermedio antes → después |
|---|---|---|---|
| bloque | 1,19 / 1,99 | 1,03 / 1,42 | 13,3 % → 7,9 % |
| recinto | 1,10 / 1,92 | 1,02 / 2,03 | 5,5 % → 2,7 % |
| travesía | 1,00 / 1,10 | 1,01 / 1,09 | 3,8 % → 3,2 % |

(«Hueco intermedio»: muestras a más de 1,3 canales pero a menos de un canal más
0,8 anchuras del vecino, o sea el blanco que no es ni pelo ni aire.)

Y la trampa, que costó una hoja entera: **el trazo se mueve como un cuerpo, no
punto a punto.** La primera versión llevaba cada muestra a su vecino por su
cuenta; dos muestras seguidas veían dos vecinos distintos, el eje salía como un
rosario y el campo pintaba esquirlas por toda la obra. Ahora el desplazamiento se
calcula por muestra, se descartan las rachas capturadas de menos de una anchura y
media, se suaviza a lo largo del eje con una ventana de tres anchuras, se limita a
0,3 anchuras por pasada y los cabos heredan el de su primer punto interior. Cuatro
pasadas. En bloque, donde los trazos son cortos y van rodeados, el borde sale aún
algo dentado en las zonas densas: queda.

## Decimotercera vuelta: progresivo, y hasta cubrir un porcentaje

El autor, sobre cómo lo haría Chillida: *«dibuja un trazo primero, y ese mismo ya
influye al resto en proporciones, direcciones, tamaño, paralelización»*, y
*«hacerlo progresivo: dibujar un trazo y el siguiente influenciado por el mismo, y
con eso se va completando hasta rellenar un % variable del canvas»*.

El modelo libre pasa a eso, con dos cambios y nada más:

- **El trazo nuevo nace del anterior**, siete de cada diez veces (`padre()`), no
  de uno cualquiera: lo acompaña a un canal exacto, o arranca a un pelo de él,
  paralelo o perpendicular. El primero decide la anchura, los rumbos y la escala,
  y la obra crece como una cadena.
- **La obra se detiene por cobertura**, no por cuenta de trazos: cada tipo declara
  un intervalo de tinta sobre el lienzo (`cobertura`: bloque 22–42 %, haz 15–32 %,
  recinto 7–14 %) y se añaden trazos hasta llegar; la zona sale de ahí (la masa de
  la familia tiene en torno a la mitad de tinta, así que su lado es la raíz del
  doble). La travesía, que va a sangre, sigue siendo 3–5 trazos que cruzan el
  pliego: ahí la cobertura la decide el formato.

La paralelización de la vuelta anterior corre después y es la que deja el margen
homogéneo en todo el cuadro. Mirado en hoja: bloque y haz ya se leen como de la
familia sin calco detrás; el recinto sale pequeño y a palos rectos (los
acompañantes del marco), y la travesía deja algún tocón. El calco sigue siendo el
modelo de producción; el libre es el que puede crecer sin deber nada a tres obras.

## Decimocuarta vuelta: el pintor de halo

El autor, sobre las hojas: «mala pinta, ¿qué nos falta?». Lo primero de la lista
era el pintor: el campo de distancia pinta el pelo exacto, pero su geometría de
ingletes y cortes dejaba esquirlas y dientes en cada unión complicada, y llevábamos
tres vueltas peleando con él en vez de con el dibujo.

`pintarHalo` es el mismo principio del halo con el lienzo nativo: sobre una capa
transparente, cada trazo en orden primero **borra** un halo de su anchura más dos
pelos (`destination-out`) y luego pinta su banda. Donde pasa por encima deja el pelo
exacto; donde dos corren a un canal el blanco mide g; donde se funden, se funden.
`etiquetas()` lo reproduce pintando cada trazo de su color, así que `pelo.js` mide
lo publicado. Es el pintor de producción; el campo queda en el harness para comparar.

Y lo que costó que la banda saliera limpia, por orden:

- **Desplazar el eje por su normal redondea toda esquina exterior con radio de
  media anchura**, aunque el eje sea vivo: gusanos. La esquina viva la da el
  inglete, no el eje.
- **Un solo polígono (ida por un costado, vuelta por el otro) se cruza a sí mismo
  en cada esquina interior** y la regla nonzero deja un triángulo vacío. Y el
  inglete escalado se dispara en los vértices agudos.
- Así que la banda es la construcción del campo hecha con polígonos: **un
  polígono por tramo** (los dos costados, con la anchura de la gubia en cada
  muestra; en un tramo recto no se cruza) y **una cuña por vértice** en el lado
  exterior, con el inglete a tope `MITER` y bisel más allá. Todas las piezas con
  la misma orientación, en un solo trazado.
- Dos bordes coincidentes con antialias dejan una costura clara: cada tramo se
  alarga 0,6 px por los cabos interiores. Pero alargar trapecios *por muestra*
  dejaba un diente en cada junta donde cambia la pendiente de la gubia (un peine
  por todo el costado): de ahí un polígono por tramo y no por muestra.

La gubia va a la mitad de amplitud: con el campo el temblor se leía como textura;
con el borde limpio la misma amplitud se leía como ondulación.

Y lo que cazó `pelo.js`, que es para lo que está:

- **Las etiquetas van en múltiplos de cuatro.** `etiquetas()` pinta cada trazo de
  su color y lee la capa; con alfa premultiplicada el antialias desplaza el valor
  en uno o dos y una etiqueta contigua se leía como otro trazo pegado (70 de 75).
- **El halo se alarga en los cabos** lo mismo que a los lados: un cabo apoyado
  contra un cuerpo lo tocaba.
- **La horquilla.** En un vértice con giro de casi 180° la banda hace punta y el
  halo, que solo ensancha a los lados, no la cubre por delante. Un disco de halo
  en cada vértice *interior* lo cierra; en los cabos no, que dejaba un mordisco
  redondo donde el original corta a escuadra.
- Y el control: `halo0` (el pelo del pintor a 0,4 g) dispara 56 de 60; `pelo0`
  parcheaba el campo, que ya no se publica, y se retira del bloque.

## Decimoquinta vuelta: la mano en el pintor, y las reglas del autor

Lo que el autor fijó mirando las hojas, y que manda sobre cualquier medida:

- **El grosor es homogéneo** en toda la obra, salvo la variación mínima natural de
  cada trazo (±4 %). Había metido piezas un tercio más gruesas: fuera.
- **Las esquinas son vivas, nunca curvas.** Probé achatar la punta del inglete y
  redondear el eje: fuera las dos cosas. `ESQUINA = 0`.
- **Nunca un giro en torno a sí mismo**: el trazo no vuelve sobre su propio
  cuerpo a un pelo. Las úes existen, pero abiertas.

Y la mano, en `pintarHalo`, con su propio `Rng` sembrado aparte (`manoSeed`) para
que la composición no cambie con ella:

- cada costado de cada pieza ondula despacio y por su cuenta (dos senos, amplitud
  `MANO_VIB` = 0,03 W, ondas de 2–4 anchuras). El halo lleva además el tope de esa
  ondulación, porque el vecino ondula por su cuenta y sin eso se metía en el pelo
  (`pelo.js` cantó 8 de 75).
- el **pelo fundido** —un tramo de una anchura donde el halo no corta— está escrito
  (`params.funde`) pero **apagado**: rompe a propósito la regla de la familia y
  `pelo.js` lo canta, que es lo que tiene que hacer. Si se enciende, la obra no
  promete la regla.
- el control `halo0` se reescribió para la firma nueva del pintor.

Fuera del repo sigue el prototipo del **paseo que rellena**: silueta sobre rejilla
de paso W + g, un paseo que no se cruza y crece por los dos cabos, con espina
(el primero, largo), úes (dos giros al mismo lado, nunca tres), una ventana grande
antes de pasear, y la anchura derivada del número de celdas. Es la base del bloque
que viene; lo siguiente es probar espesores y fijarlos por tipo.

## Decimosexta vuelta: el paseo que rellena, en producción para el bloque y el haz

Lo que el autor fue fijando sobre las hojas, y que el modelo cumple por
construcción (están en `tramarPaseo`):

- **Progresivo**: un trazo —la espina, larga— y los demás nacen alrededor y
  crecen por los dos cabos hasta cubrir el porcentaje de lienzo que pide el tipo.
- **El margen se homogeneiza en todo el cuadro**: es la rejilla de paso W + g.
- **Grosor homogéneo** (±4 %), **esquinas vivas**, y **nunca un giro de 180°**: el
  giro que repetiría el lado del anterior no existe como opción; si el otro lado
  no cabe, el trazo acaba ahí.
- **Ni rectas exactas ni 90° exactos**: un campo lento común curva todo a la vez
  (así las vecinas se mueven juntas y el margen no cambia), cada pieza gira ±3° y
  cada vértice se desvía ±0,08 W; los ángulos quedan en unos 82–98°.
- **Ramas**: una de cada dos piezas se abre en perpendicular, de la misma tinta,
  con una rama de 2–4 celdas. Salió del análisis de la referencia 2 (14 piezas,
  3–4 bifurcaciones, siempre perpendiculares desde el costado de un tronco, rama
  corta que acaba al aire). El esqueleto automático mete uniones falsas en cada
  esquina; el recuento se hizo a ojo sobre la máscara numerada.
- **Interés y asimetría**: un lado del cuerpo es el denso y el otro el abierto; la
  ventana grande se abre hacia el abierto y ahí se retiran más piezas. Dosificado:
  una primera versión tiraba la mitad de la obra. El cuerpo es uno (el grupo
  conexo mayor), salvo que quedarse con él tire más de un tercio.
- **Se traban**: el corte se elige para que cada pieza lleve un codo.

Lo que se probó y se quitó: una **dirección dominante** (rachas largas en un eje y
cortas en el otro) daba troncos apilados; el bloque es isótropo. Y el relleno por
celdas **no es el modelo del recinto**: con trazo fino sale laberinto, no meandros.
El recinto lleva marco en U y el interior en eses colgadas de la pared de enfrente,
que es lo que viene. La travesía no es relleno y sigue con su modelo.

Espesores, probados con el mismo motor: 0,10 del lado para el bloque (el que lee
como la referencia 2), 0,065–0,085 para el haz; a 0,045 ya es laberinto.

## Decimoséptima vuelta: el detector de solapes

El autor, con las hojas de los prototipos de travesía delante: «antes no había
solapes, ya habíamos dicho, creía que era algo que estaba superado». Tenía razón, y
el motivo de que volvieran es que el pintor de halo **convierte un solape en un
falso cruce**: fabrica un pelo entre dos tintas que se pisan, y a ojo parece que
una pasa por encima de la otra. La regla de la familia —no hay solape si no es cruce
claro— se cumplía por construcción en el paseo (rejilla) y había dejado de medirse.

`solape.js` la mide, **sobre la tinta**: cada trazo se pinta solo, sin halo, con la
mano publicada, y se cuentan los píxeles donde dos trazos distintos coinciden (más
de 0,15 W²; lo de menos es el filo). El ángulo entre los dos en el centroide del
solape dice si es cruce (≥ `CRUCE_MIN` − 8°, que la estimación en un trazo curvo
sale corta) o solape. Medir sobre los ejes cantaba el corte entre dos piezas de un
mismo camino, que tienen los ejes a un pelo cabo con cabo y no se pisan: por eso es
píxel. Control: `monta`, el desvío de vértices del paseo a 0,6 W.

Lo que cazó a la primera, en el estado que el autor había dado por bueno:

- en el **paseo**, 1 de 20: el giro de ±3° de la mano, en una espina de doce
  celdas, metía sus cabos en la vecina. Acotado a un cuarto de paso en los cabos.
- en el **calco**, 8 de 20 en el recinto: astillas del trazador tumbadas sobre otro
  trazo, un acompañante nuevo que se dobla sobre sí mismo en una esquina cóncava, y
  el cabo alargado que solo se comprobaba hasta el 80 %. Ahora, al cargar, de cada
  par que se pisa sin cruzarse se retira el más corto; se comprueba el alargamiento
  entero; y al final se vuelve a limpiar: fuera lo que se corta a sí mismo y, de cada
  par montado, el más corto. Queda un residuo de 2–3 de 60 por debajo de 0,45 W²,
  cabos que rozan al cuerpo que tienen delante.

Y lo que no entra: los prototipos de travesía y recinto de las dos vueltas
anteriores, que se construían a mano fuera de la rejilla y volvían a montar trazos.
Lo que venga sale del paseo, que es lo que cumple la regla por construcción.

## Decimoctava vuelta: núcleo, margen del pliego y el margen compartido

Tres reglas más del autor, mirando las hojas del paseo:

- **El margen del pliego**: a veces es salida (el trazo sigue y el borde lo corta) y
  a veces barrera (llega hasta él y gira en línea con el canto). Sobre la rejilla:
  en la mitad de las obras la silueta se empuja hasta uno o dos bordes; en una
  salida las celdas siguen un paso más allá del canto; en una barrera acaban en la
  fila a una anchura del canto, y el paseo, sin celda delante, gira y corre por esa
  fila. Si el borde se comiera más de un tercio del cuerpo, se cae. Una primera
  versión empujaba de más y dejaba obras de un trazo en una esquina.
- **Hay un centro.** «Hay como un núcleo muy marcado, y a partir de ahí empieza
  todo.» Una celda interior del lado denso; la espina pasa por ella, las tres
  piezas siguientes —el nudo— nacen pegadas con rachas cortas, y lo demás crece
  PROGRESIVO desde lo ya dibujado hacia fuera, con rachas largas, la ventana y las
  piezas retiradas lejos. Nacer lejos partía el cuerpo en dos.
- **Entre paralelos el margen es constante**: «la intención del margen es
  compartida; luego hay una pequeña vibración que es el signo manual». La
  ondulación del borde es un CAMPO del lienzo, el mismo para todos los bordes, así
  dos bordes enfrentados a un pelo reciben el mismo desplazamiento y el canal no
  cambia; encima, un temblor pequeño e independiente por costado (0,3 del campo,
  ondas de 1–2 anchuras), cuyo tope va al halo. Antes cada costado llevaba su fase
  y entre dos arcos de una misma pieza el pelo se abría y cerraba.

Y dos úes que el autor marcó en la hoja, con causa:

- una rama paralela a un brazo de su pieza cerraba una u. La rama solo sale hacia
  el lado del tramo recto donde el tronco NO tiene celdas.
- el primer paso de un paseo se contaba como giro, y al crecer por el otro cabo se
  espejaba ese codo fantasma: una de cada ocho piezas. `ues.js` cuenta sobre celdas y
  sobre ejes: 0 de 950 tras el arreglo.

El mismo motor, probado con el grosor de las referencias 1 y 3 (`PASEO.recinto`,
`PASEO.travesia`, solo con `modelo: 'paseo'` forzado): con trazo fino sale un
cuerpo denso sin marco ni flujo; con trazo gordo y borde siempre, salen barras que
giran en el canto pero sin la bifurcación ni la curva abierta del cartel. El
recinto y la travesía siguen con el calco en producción.

## Decimonovena vuelta: los ángulos vivos, la boca del cabo y el margen sin cuñas

Lo que decía Chillida de los ángulos, citado de memoria y sin fuente delante: que
el ángulo recto es un ángulo muerto, y que el de 89 o el de 91 es un ángulo vivo.
Medido en el calco de la referencia 2: las horizontales van a ±8°, las verticales
a 90 ± 12°, y los quiebros de 61 a 83° (mediana 77), abiertos en los dos sentidos
de giro. Se probó una rejilla de paralelogramos (todos los quiebros a 62–84°,
exactos) y se quitó: todo se inclinaba en el mismo sentido, como una cursiva, y
el cuerpo se volvía un haz. Lo que queda: la rejilla ortogonal deformada por un
campo lento de CIZALLA PURA (x según y, y según x: las paralelas se inclinan pero
no se separan), y en cada quiebro el paseo elige, cuando puede, el lado que el
campo abre (una zeta se abre entera si su brazo del medio se inclina hacia el lado
bueno). Con `ladeo` 0,28–0,42 W los quiebros quedan en 77–100 (mediana 89); más
cizalla abría más (55–105) pero volvían mordiscos y pelos cortos.

Y tres cosas que el autor vio en las hojas, cada una con su causa:

- **«Estos huecos no deberían ocurrir»**: cortes a mitad de un tramo recto, una raja
  entre dos celdas alineadas. En la referencia 2 no hay ninguno: cada pieza acaba
  donde el camino gira. El corte cae ahora justo antes de un codo (el más cercano
  al largo pedido, ±3 celdas), así el cabo da contra el costado de la siguiente.
- **«Ojo a los mordiscos»**: el halo del cabo, alargado un pelo por delante, con el
  eje inclinado por el campo entraba en cuña en el cuerpo de enfrente. Acortarlo
  dejaba cabos a menos de un pelo (`pelo.js`, 30 de 60): el campo inclina la boca y
  una esquina se acerca más que la otra. La solución es la del autor: **la boca
  del cabo se corta paralela al cuerpo que tiene delante** («casi rectangulares o
  con un poco de ángulo, nunca en inglete»). Cada cabo en te toma la dirección de
  ese costado como cara y se pone, por su eje, a W/2 + g del eje ajeno: el pelo mide
  g de esquina a esquina. `geo.caras` lo publica y `etiquetas()` lo respeta.
- **«Ese nivel de irregularidades en los márgenes no se ve en los originales»**:
  cuñas entre paralelas. Venían de la gubia (la deriva de anchura a lo largo de la
  pieza) y del temblor independiente por costado. En el paseo la gubia va fuera
  salvo que el panel la pida, el grosor por pieza es ±2 % y el temblor propio baja
  a 0,12 del campo.

Medido tras esto: pelo 1 de 60, solapes 0 de 60, úes 0 de 429, margen entre
paralelas mediana 1,01 canales.

## Vigésima vuelta: lo que dice la obra gráfica, y el espacio encerrado

Se buscó más obra y más pensamiento de Chillida (búsqueda web desde la sesión;
las páginas no se pudieron leer enteras, solo sus fragmentos: lo no verificado va
marcado). Lo que vale para el modelo:

- **El ángulo.** Lo que yo citaba de memoria («el recto es un ángulo muerto; el de
  89 o 91 está vivo») **no está documentado así**. Lo documentado: «tengo problemas
  con el ángulo recto; creo más en el gnomon de los griegos, el ángulo que hace el
  hombre con su sombra», y «no sabemos si ese ángulo tenía 90, 89 o 92 grados», con
  una geometría «orgánica, viva» (Sainsbury Centre, ficha de *Zeihartu IV*). Su
  nieto Mikel: el recto «no dialoga con ningún otro ángulo» (*Noticias de
  Navarra*, 2024).
- **El límite.** «El límite es el verdadero protagonista del espacio, como el
  presente, otro límite, es el protagonista del tiempo» (conferencia, 1988). «El
  espacio será anónimo mientras no lo limite» [sin fuente primaria].
- **La línea blanca no se dibuja**: «líneas gruesas en negro que, al ser colocadas
  unas cerca de las otras, dibujan entre sí líneas blancas» (Colección BBVA sobre
  *Inguru III*, 1968). Es el halo, dicho por otro.
- **El espacio encerrado es la figura**: los negros «encajan como piezas de un
  puzle, atrapan y encierran espacios» (BBVA sobre *Zeihartu II*, 1973); formas
  «casi laberínticas» (MGLC sobre *Gezna*, 1969).
- Las series de gráfica que importan: *Inguru* (1968), *Egokarri*, *Ikur* (1968),
  *Beltza I–V* (xilografías, 1969), *Gezna*, *Leku* (1969), *Aundi* (1970),
  *Zeihartu* (1973), *Euzkadi I–VII* (1975–76). *Gravitaciones* y *Lurra* no son
  grabados. Catálogo razonado: Van der Koelen, *Opus P.I–P.III*.
- Lo que el autor observó y está implementado (cruces solo en el borde, salida o
  barrera, núcleo denso y lado abierto) **no lo enuncia ninguna fuente**: es lectura
  nuestra. Del método en madera no hay nada accesible: que el pelo sea el surco de
  la gubia es hipótesis.

Y lo incorporado en esta vuelta:

- **La ventana tiene forma propia** (barra de 3–5 celdas, ele de dos brazos, o
  rectángulo de 2 × 3–4) y se apoya en el núcleo a 2–4 celdas, para que la espina y
  el nudo la bordeen y la cierren: el espacio atrapado como figura.
- **El cruce solo por encima de una pieza perpendicular**: pasar por encima de una
  paralela no es un cruce, es un trasvase (`solape.js` lo cantó a 1,38 W²).

## Vigesimoprimera vuelta: el límite como protagonista

«El límite es el verdadero protagonista del espacio» (Chillida, 1988). En el paseo
el contorno era un residuo del relleno: un blob. Ahora la silueta se decide antes
de rellenar y lleva una **bahía** (entrante rectangular de 1–2 anchuras de boca y
2–3 de fondo, nunca más del 35 % del cuerpo en ese eje, para no partirlo) y a veces
un **saliente** por el otro lado. Sin borde del pliego, el cuerpo se recentra tras
tallarlo.

Lo que se probó y se recogió: dos bahías profundas más la ventana más el relleno al
70 % dejaban cuerpos rotos en dos grupos y barras sueltas. Queda una bahía, el
relleno al 78 % y la retirada al 12 %: el contorno tiene entrantes y el cuerpo
sigue siendo uno.

## Vigesimosegunda vuelta: el borde recto, el contacto, y el recinto sobre el paseo

Tres reglas del autor más, y el recinto:

- **«Los que van por el borde son muy rectos, como si hubiese un límite.»** En las
  tres referencias. El campo que curva los tramos y la vibración se apagan junto al
  contorno del cuerpo (a una celda del exterior, nada; a dos, la mitad). El
  contorno es la regla y el interior, la mano.
- **Contacto**: en la referencia 2 casi todas las piezas tocan a dos o más vecinas.
  Una pieza que solo toca a una se funde con ella si son consecutivas del mismo
  camino (y la unión no hace una u), o se retira si es corta.
- **El grosor cambia la gramática** (probado con el mismo motor a 0,04, 0,065 y
  0,09 del lado): fino pide piezas de 8–20 anchuras colgando de un marco con una
  dirección dominante; medio es el bloque; grueso pide pocos trazos de borde a
  borde, que es la travesía y sigue con el calco.
- **Recinto sobre el paseo** (referencia 1), ya en producción: la rejilla no gira y
  la silueta es rectangular; el MARCO son las celdas del borde por tres lados, en
  orden, y solo si son contiguas (una celda que faltara partía el marco y la
  polilínea saltaba por dentro: los solapes de 6 W² que cantó `solape.js`). El
  cuarto lado es la abertura, y su fila y la siguiente quedan sin celdas: nadie
  cierra la caja. El anillo interior del marco está reservado: no se camina a lo
  largo de una pared, solo se entra o sale de él en perpendicular, y un paseo que
  nace en el anillo arranca hacia dentro. Los meandros nacen en la pared de
  enfrente y llevan rachas largas hacia la abertura y cortas en el otro eje: caen.
  Los cabos no se encaran contra el marco; los tocones junto al marco se retiran;
  el marco se pinta el último. `solape.js` 0 de 40, `pelo.js` 0 de 40.

Lo que le falta al recinto, en hoja: más meandros y más apretados en el nudo (la
referencia tiene unos diez colgando juntos), y algún trazo que se escape por un
costado del marco.

## Vigesimotercera vuelta: centros de gravedad, y el marco que no es una u

- **«El marco nunca es una u completa»**: en la referencia 1 es un trazo que nace
  dentro del cuerpo, sube por una pared, recorre el lado de enfrente de la
  abertura y baja por la otra pared una fracción; a veces solo hace un lado y el
  de enfrente. Las dos piernas arrancan entre el 30 y el 70 % de la altura y bajan
  entre el 15 y el 80 %. Los meandros nacen en un tramo contiguo de la pared de
  enfrente —el lado denso, elegido por obra— uno al lado de otro, y caen juntos:
  el haz. El otro lado queda vacío.
- **Centros de gravedad** (el autor: «hay un sitio donde se concentra la gravedad,
  uno, dos o tres; va dejando huecos y se aligera a medida que se aleja»). El
  núcleo es el centro mayor; con probabilidad hay un segundo y un tercero más
  flojos y lejos del primero. La densidad de una celda es la suma de campos que
  caen con la distancia (radio de 3–5 celdas), y decide dónde nacen los paseos
  (los más densos primero), hasta dónde se rellena (el paseo para cuando lo que
  queda libre es poco denso: los huecos quedan lejos de los centros) y qué se
  retira (más donde la densidad es baja). `params.centros` fija el número.
- Medido en los calcos, lo que distingue la referencia 3 de la 2: tramos rectos de
  5–14 anchuras (frente a 1–3) y quiebros de 25–55° encadenados sin rectas entre
  medias, más la bifurcación a mitad de camino. Gira menos de 90 y más seguido:
  una curva hecha de codos pequeños. El paseo sobre rejilla ortogonal no la
  produce; la travesía sigue con el calco hasta tener su gramática.

## Vigesimocuarta vuelta: la travesía sobre el paseo, oblicua

El autor: «la referencia 3 tiene como más cambios de dirección, o longitud de
trazo» y «ojo a la lógica de ángulos, muchos no son perpendiculares». Medido en su
calco: tramos de 5–14 anchuras y quiebros de 25–55° encadenados, sin rectas largas
entre medias, y la bifurcación a mitad de camino. Gira menos de 90 y más seguido.

La travesía es el paseo sobre una **rejilla de paralelogramos** de ángulo abierto
(`oblicua`: 52–70°), con giros solo hacia la diagonal abierta, así cada quiebro
mide ese ángulo. Esto mismo se probó para el bloque y se quitó porque allí todo se
inclinaba en cursiva; en la 3 es justo lo que hay: todos los brazos van en dos
direcciones oblicuas. La silueta es el pliego entero; dos bordes, el primero
siempre de salida; la espina nace en un borde de salida y cruza; 4–6 trazos de
9–20 celdas; la rama (la bifurcación) sale aunque el tronco tenga brazos hacia ese
lado —oblicua no es una u— y sigue 4–8 celdas. Los tres tipos corren ya sobre el
mismo motor; el calco queda en el harness solo para comparar.

Ángulos medidos en 30 obras: quiebros p10–p90 de 53 a 68°. `solape.js` 0 de 40,
`pelo.js` 1 de 40, úes 0 de 176.

Lo que le falta a la travesía, en hoja: a veces salen solo dos trazos y el cuerpo
se queda a un lado; el nudo donde los brazos se juntan no siempre existe; y la
barra que corre por el canto (la barrera) sale poco.

## Vigesimoquinta vuelta: referencia a referencia, la 1

El autor: «vamos referencia a referencia; analiza qué te falta de la 1, luego de
la 2 y luego de la 3». Medido en el calco de la 1 contra la hoja del recinto:

- **Los quiebros son de muchos ángulos**, 15–95° en los dos sentidos, y cambian
  dentro del mismo trazo; los nuestros eran todos de 90. La cizalla pasa a ser de
  REJILLA (cada fila se desplaza entera a lo largo de su dirección, con un
  desplazamiento que varía entre filas): dos vecinas de la misma fila se mueven
  juntas y la distancia perpendicular entre filas no cambia, así el margen sigue
  constante aunque los ángulos se abran. En el recinto no se apaga en el borde
  (el autor lo pidió para el borde del PLIEGO, y el marco se mantiene liso aparte).
  Se probó ondas de 2,5–4,5 anchuras y los meandros salían a garabato: quedan de
  6–10, y el ángulo se abre en pocos sitios por trazo, como en la referencia.
- **Jerarquía de largos**: en la 1 hay dos trazos de 24–31 anchuras, tres de 8–18 y
  el resto de 3–8. El recinto corta así: el marco y el meandro maestro enteros
  (18–30 celdas), tres medianos de 8–16 y el resto de 4–9.
- **Las rachas rectas son cortas** (1–4 anchuras entre quiebros, mediana 2,5): los
  meandros giran cada 2–5 celdas.
- **Más papel**: el cuerpo ocupa el 7–11 % del pliego, no el 10–16.
- El marco se mantiene **liso** (su eje no se deforma): es el límite.

`solape.js` 0 de 40, `pelo.js` 0 de 40, úes solo las del marco (una por obra, que
es una u por definición).

## Vigesimosexta vuelta: referencia a referencia, la 2 y la 3

**La 2**, medida en su calco contra la hoja del bloque: 14 piezas en un cuerpo de
14 × 10 anchuras; largos de 5–11 W; tramos rectos de 1–5 W; casi todas con 1–3
codos; quiebros de 60–97° en los dos sentidos; ninguna barra de 18 celdas. El
bloque pasa a rejilla más fina (W 0,062–0,075 del lado, 90–120 celdas), rachas de
1–4, espina de 9–12 celdas con codos, tres medianas de 7–9 y el resto de 4–7,
cuerpo más ancho que alto (1,3–1,55). Es lo más cerca de la 2 hasta ahora: piezas
con codo, encajadas, dos direcciones entrelazadas, un cuerpo. Falta aún más aire
dentro (la ventana grande y los pasillos de la referencia).

**La 3**, medida: tramos de 1–5 W, 4–5 quiebros por trazo de 25–90° en los dos
sentidos, rumbos que cambian a lo largo (no dos direcciones fijas), y la
bifurcación. Se probó volver a la rejilla ortogonal con cizalla fuerte de onda
larga y 3–4 trazos: sin oblicuidad se lee como tuberías, y se recoge. Queda la
rejilla de paralelogramos, que da codos de 53–68° y bifurcaciones. Lo que le
falta: que el rumbo cambie dentro del trazo (hoy todos los brazos van en las dos
mismas direcciones oblicuas), más aire, y el nudo donde los brazos se juntan.

**El aire del bloque, y lo que rompió.** Ventanas con forma y más grandes (barra
de 4–7, rectángulo de 2–3 × 3–5, ele de 4–6 + 3–4), `lleno` 0,74 y `retira` 0,12.
Al abrir la silueta hacia dos bordes opuestos el cuerpo se estiraba hasta
adelgazar la anchura a 0,046 del lado con 222 celdas, y el recentrado sólo
miraba si había borde, no en qué eje. Tres arreglos: suelo de anchura (0,9 del
mínimo del tipo), recentrado por eje —se centra en el eje que no toca borde— y
dos bordes opuestos se quedan en uno, al azar.

**Un control que no miraba.** `holgura`, el control de que el relleno de esquina
no se coma el pelo del vecino, llevaba saliendo 0 de 120 sin mirar nada: el
algoritmo publicaba la holgura por vértice en `geo.relleno` y dos líneas más
abajo el radio del campo, con el mismo nombre, la pisaba; `canal.js` y `toque.js`
leían un número donde esperaban un array y saltaban todas las cintas. Hoy va en
`geo.holgura`, el control dispara 128 de 128 y el sano sigue en 0. Es el caso
exacto que la cabecera de `mil.sh` avisa: un cero sin control no significa nada,
y este tenía control y seguía sin significar nada, porque el control tampoco
miraba. Se añade la configuración `campo` a la batería —el pintor que no es el de
producción— para que su código tampoco quede sin medir.

## Vigesimoséptima vuelta: la travesía que dobla, y lo que no aguanta la rejilla

**Lo que se probó.** La referencia 3 tiene rumbos que cambian dentro del trazo y
las bandas paralelas doblan juntas. Se intentó con lo que ya había: la cizalla
del campo lento, subida a 0,7–1,1 W con ondas de 14–22 anchuras. Las bandas
doblan juntas, sí, y se parece más — pero 26 de 80 obras con solape a 2°, y con la
cizalla pura (sin modulación a lo largo del eje) 41 de 80. El motivo es geometría,
no un ajuste: al doblar, las paralelas a una dirección se *trasladan*, y la
distancia entre dos trasladadas de una curva no es la de sus rectas. Un igualado
posterior del margen (cada vértice empujado hasta dejar D con su vecino paralelo)
bajó los solapes a 8 y luego, con tres celdas rectas mínimas entre giros, a 0 —
pero la composición se rompió por otro lado: cabos en cuña contra costados
oblicuos, trozos de dos celdas sueltos, hojas con una sola pieza. **Se retira**:
la rejilla no aguanta ese doblez en los contactos, y arreglar el margen a
empujones no arregla la composición. Si la 3 ha de tener ese doblez, no saldrá de
deformar la rejilla: saldrá de dibujar la curva maestra y sacar las demás como
*offsets* suyos, que es lo que hace la mano en el original. Eso es otro modelo,
y es decisión del autor si merece la pena.

**Lo que se queda, porque era error y no dirección:**

- **La boca iba al revés.** El cabo que da contra un costado se ponía a W/2 + g
  del eje ajeno… con el signo cambiado: `mueve = (dPerp − quiero)/cosA` doblaba
  el error del campo en vez de anularlo. En la rejilla ortogonal el error era
  casi cero y no se notaba; en la oblicua se notaba. Ahora anula, y la boca solo
  **avanza** si el camino está libre: entre el cabo y el costado puede haber el
  cabo de otra pieza casi colineal (recinto, 3°), y avanzar era pasarle por
  encima. Retroceder siempre se puede.
- **La esquina del cabo contra un costado oblicuo.** El cabo es cuadrado; contra
  un costado a 52–70° la esquina de dentro llega antes que el centro de la boca,
  (W/2)·sin del ángulo. Sin ese término, 8 de 80 travesías con solape a 50°. La
  boca retrocede y deja la cuña de aire de la referencia. El filtro de «a qué
  costado me encaro» baja de 60° a 37°.
- **La rama asomaba por detrás del tronco.** Su polilínea empieza en la celda del
  tronco y ese cabo se alargaba Pl/2 − g/2 como los demás: en la ortogonal, a ras
  del costado de enfrente, con el halo del cabo mordiendo medio pelo el canal del
  otro lado; en la oblicua, una V entera en el canal (seed 4260069136). Nace en
  el eje del tronco y el tronco la tapa.
- **Tres piezas al menos en la travesía**: `pedidos` pide tres, y `falta` elige
  otro intento si salen una o dos.

Medido tras retirar la cizalla fuerte, travesía sobre 80 obras: solape 0 de 80
(antes 1), pelo por debajo de g 2 de 40 (antes 3), y los tres tipos ortogonales
0 de 120. Batería entera: solape 0/208, pelo 0/50 por debajo, holgura 0/208 con
su control en 128/128, determinismo 64/64.

## Vigesimoctava vuelta: la hebra — un meandro maestro y sus paralelas

El autor, sobre la hoja anterior: «la referencia 3 está fatal; a la 1 le queda
mucho desde el punto de vista compositivo, quizá por ángulos». Mirada otra vez la
1 de cerca: lo que cuelga del marco no son escaleras a escuadra, son **meandros
con quiebros oblicuos** —35 a 60° respecto a la vertical— y cada vecino es una
**paralela exacta** del anterior, al mismo margen en todo su recorrido, con los
cabos escalonados. Eso no sale de una rejilla ni de deformarla (vuelta 27): sale
de dibujar un meandro y sacar los demás como paralelas suyas, que es lo que hace
la mano en el original. La 3 es el mismo gesto a otra escala.

**El modelo `hebra`** (`tramarHebra`, elegible en el laboratorio; producción
sigue en el paseo hasta que el autor lo vea):

- **El meandro maestro**: tramos verticales y quiebros oblicuos a uno y otro
  lado, con tramo horizontal a veces y barrido final hacia el lado que pesa.
  **Nunca un ángulo agudo**: el inglete de una paralela exterior crece con
  1/sin(θ/2) y a 45° una paralela a 4·D sacaba una púa de medio pliego. Tras un
  horizontal el quiebro sigue al mismo lado, entre dos quiebros hay siempre un
  vertical, y la deriva acumulada no pasa de 50°.
- **La paralela** (`paralela`): rectas desplazadas por tramo, vértices en sus
  intersecciones, esquinas vivas. Un tramo que se ha dado la vuelta es el bucle
  del lado de dentro y se quita su recta; dos rectas a menos de 12° no se cortan
  (se irían lejísimos) y se unen por el medio.
- **El recorte progresivo** (`recortar`): el marco va primero, luego cada haz; el
  trazo nuevo se corta donde su eje queda a menos de D de lo ya puesto y el cabo
  cortado avanza hasta dejar W/2 + g —la boca a un pelo—, **como mucho muestra y
  media**: sin tope, un cabo cortado por un vecino a 0,9 D seguía por papel libre
  un cuarto de pliego (25 de 50 obras con solape a 0°; con el tope, 0 de 150).
- **Recinto (1)**: marco de una sola tinta —pata izquierda, barra (partida a veces),
  pata derecha de largo distinto, nunca la U entera— y dos o tres haces de 2–5
  hebras colgando de la barra, el más denso al lado que pesa, cabos escalonados.
- **Travesía (3)**: una hebra maestra que cruza el pliego con tres a cinco quiebros
  abiertos, una paralela que la acompaña solo un tramo (40–75 %, cabos dentro),
  un afluente recto que entra por un costado y muere en ella a un pelo, y la barra
  del canto a veces. Vertical o transpuesta.

Medido: solape 0 de 150 (recinto, travesía, recinto apaisado), pelo 0 por debajo
de g en 60, determinismo 24/24. Configuraciones `hebra-rec`, `hebra-tra`,
`hebra-apais` en la batería.

**Lo que le falta, a ojo:** en la 1, los haces se quedan separados y en el original
se entrelazan abajo; en la 3, el nudo donde el afluente muere en la maestra es
una te limpia y en el original la hebra se abre (bifurca) — la rama sale del
mismo gesto. Y decidir si pasa a producción.

## Vigesimonovena vuelta: las tres referencias leídas a fondo, y la 3 rehecha

El autor: «analiza cada uno contra su referencia… especialmente la 3, creo que no
estamos acertando, para nada». Lectura a tamaño completo, trazo a trazo. Lo que
hay en cada original, lo que teníamos y lo que se ha hecho.

### Referencia 3 (Múnich 1972) — lo que hay

1. **Tres bandas verticales paralelas** bajan juntas desde la zona de la barra de
   arriba: una espina y dos compañeras a su izquierda, a un pelo entre sí. No son
   una hebra con un afluente: son un **haz** que luego se deshace.
2. **La bifurcación es una separación**: las dos compañeras giran a la izquierda
   y salen por el borde como **dos brazos paralelos** (pelo entre ellos); la
   espina sigue sola hasta abajo. Al otro lado, **uno o dos brazos paralelos**
   salen de la espina en diagonal ascendente y mueren en el borde derecho.
3. **Dos barras rectas por los cantos**, arriba y abajo, que **nacen a medio
   pliego** (no cruzan entero) y van hasta el borde derecho. La espina las
   **cruza por encima**: pelo a sus dos lados, la barra partida.
4. **Casi nada acaba en el aire**: todo sale por un borde o muere contra una
   barra. Los cabos libres son dos, y son cabos de barra.
5. **Las bandas ondulan**, no son poligonales: ±15–25° de deriva continua con
   un quiebro de ~45° por banda; los filos son irregulares (mano), las esquinas
   vivas.
6. **Grosor 0,10 del ancho, uniforme. Pelo de 0,03 W**: la mitad del que
   usábamos (0,06–0,09).
7. **Aire**: ocupación ~35–40 %, con cuatro grandes vacíos (arriba-izquierda,
   centro-izquierda, abajo-izquierda, abajo-derecha). El peso, arriba-derecha,
   donde el haz se abre.

**Lo que teníamos**: una hebra diagonal con quiebros, un afluente recto, una barra
entera. Nada de 1, 2, 3 ni 5. **Lo que hay ahora** (`tramarHebra`, travesía):
la espina entera con ondulación lenta de dos senos y un quiebro suavizado; una o
dos compañeras que son su paralela exacta en un tramo y giran hacia un costado
hasta el borde (la segunda, paralela de la primera entera, nace más abajo); cero,
uno o dos brazos al otro costado, en diagonal y hasta el borde, el segundo
paralela del primero; barras arriba (0,8) y abajo (0,5) que nacen junto a la
espina y van al borde contrario a los brazos. La espina va la **primera** y todo
se recorta contra ella: las barras quedan partidas con el pelo a sus dos lados
—eso es «cruzar por encima»— y los brazos nacen a un pelo de su costado (iba la
última y los brazos la pisaban: 13 de 50 con solape; primera, 0 de 150). Pelo
0,035–0,05 W.

**Lo que aún no está**: la segunda compañera a veces se queda en un muñón; los
brazos cortan a las barras formando cruces en te que el original no tiene (ahí
los brazos y las barras no coinciden en altura); y la ondulación es más
poligonal que la suya, que es de gubia.

### Referencia 1 (el recinto) — lo que hay

1. **Marco de una tinta**: barra arriba partida en dos (~45 %), pata izquierda
   corta con **gancho** hacia dentro, pata derecha más larga. Nunca cierra.
2. **Racimos de meandros paralelos** que cuelgan de la barra: tres racimos de
   3–5 hebras; cada hebra es la paralela exacta de su vecina. Quiebros oblicuos
   de 35–60° respecto a la vertical, tramos verticales de 1–3 W, horizontales
   cortos, y **barrido horizontal al final** hacia la izquierda.
3. **Los racimos se tocan y se entrelazan abajo**: el de la izquierda, el más
   denso, llega a la base y sus barridos pasan por debajo del central, que acaba
   más arriba. **La base es casi una línea**: los cabos de abajo se alinean.
4. Grosor ~0,035 del ancho del marco, el mismo en marco y hebras; pelo fino.
5. **Aire**: el rectángulo grande arriba-izquierda dentro del marco, y el hueco
   bajo la pata derecha. El peso, abajo-izquierda.

**Lo que teníamos** (paseo sobre rejilla): escaleras a escuadra, ningún quiebro
oblicuo, el marco en U, piezas sueltas. **Lo que hay ahora**: marco de una tinta
con gancho, racimos de paralelas exactas con quiebros de 35–60° (nunca agudos),
colocados **a una o dos D** unos de otros —no repartidos por la barra—, el
pesado hasta la base y los demás más arriba, las paralelas creciendo hacia
dentro del marco, cabos escalonados poco (0–2,5 W).

**Lo que aún no está**: los barridos del racimo pesado no pasan por debajo del
vecino con la claridad del original (el recorte los para antes); las hebras que
nacen de la pata, no de la barra; y las hebras del original son algo menos
regulares entre sí (dos de cada racimo cambian de quiebro).

### Referencia 2 (el bloque) — lo que hay

1. **Un cuerpo compacto** de 14 piezas, más ancho que alto, con el contorno
   exterior abombado: las piezas del borde **hacen** el contorno.
2. Piezas de 1–3 codos, largos de 5–11 W, tramos de 1–5 W; quiebros de 60–97°
   en los dos sentidos; algunas en **pi** (dos patas cortas). Cabos cuadrados,
   alguno oblicuo.
3. **Cada pieza sigue a su vecina**: contacto largo por el costado, pelo
   constante; dos direcciones entrelazadas.
4. **Una ventana grande** descentrada y dos o tres pasillos; ocupación ~60 %.
5. Pelo fino, ~0,04 W; grosor uniforme.

Es la que mejor está (el paseo sobre rejilla con cizalla moderada es casi esto).
**Lo que le falta**: el contorno abombado (hoy es la silueta del blob y queda
más recto), la pieza en pi, y el pelo más fino.

### Conclusión

Las tres obras son **haces**: bandas que corren juntas a un pelo y se separan, o
racimos de paralelas exactas. La rejilla sirve para la 2, donde las piezas son
cortas y el contacto es por costado; para la 1 y la 3, donde el gesto es la
**paralela que sigue a su maestra a lo largo de quiebros oblicuos**, hace falta
el modelo de hebra. Pendiente de que el autor decida si pasa a producción.

Medido: solape 0 de 150 en las tres configuraciones de hebra, pelo 0 por debajo
de g en 60, determinismo 24/24.

## Trigésima vuelta: dibujar las referencias, trazo a trazo, con atracción

El autor: «implementa el primer trazo de cada referencia y luego el resto, cada
trazo como una serie de puntos paralelizados o no, quizá con una gravedad entre
puntos; a ver qué conclusión sacas dibujándola». Hecho sobre los calcos
(`verificacion/gravedad.js`): el primer trazo se da; cada trazo siguiente es una
**cadena de puntos que solo conoce su inicio, su fin y lo ya dibujado** —avanza
hacia su meta y, si hay un trazo a menos de 1,5 D, sigue su tangente y un muelle
lo deja a D—. Se mide la distancia media de la cadena al trazo real, en D.

| referencia | trazos explicados (< 0,5 D) | los que no |
|---|---|---|
| 1 · recinto | 7 de 13 | la mitad derecha del marco (4,5 D), los maestros de cada racimo (1,2–1,7 D), dos cabos que giran solos |
| 2 · bloque | 9 de 13 | la pieza grande de abajo-derecha (1,4 D), la barra de arriba (0,8 D), la pieza interior que cambia de dirección (2,3 D) |
| 3 · travesía | 4 de 6 | la compañera exterior en su brazo (1,0 D) y el trazo que entra por la derecha y baja por la columna (1,0 D) |

Probado con alcance 1,5–3 D, seguimiento 0,6–0,95 y una gravedad de largo
alcance: los números se mueven poco y **los no explicados son siempre los
mismos**. Conclusiones, nuevas respecto a la vuelta 29:

1. **Dos clases de trazo, y nada más.** En las tres obras hay *maestros* —el
   gesto: el marco, el meandro que abre un racimo, la banda que cruza— y
   *seguidores*: trazos que, dado dónde empiezan y dónde acaban, **se explican
   enteros por seguir al vecino a D**. Son el 55–70 % de los trazos en cada obra.
   Los maestros hay que dibujarlos; los seguidores salen solos.
2. **Un seguidor se define por dos puntos.** No hace falta copiar la paralela
   entera: con el inicio (al lado del inicio del vecino, o en el marco, o en el
   borde) y el fin (el borde, la base común, o a la altura del fin del vecino) la
   cadena reproduce el trazo real a 0,1–0,4 D, quiebros incluidos. Eso es la
   «intención del margen compartida» del autor, hecha regla: la mano no copia la
   forma, sigue al vecino hasta donde quiere llegar.
3. **La bifurcación es un seguidor con otra meta.** En la 3, la compañera que
   baja con la espina y sale por la izquierda es una cadena que sigue mientras
   la meta queda delante y **se suelta cuando la meta tira hacia el lado**: la
   atracción local no la retiene. Sale a 0,4–0,6 D sin construirla a mano
   (vuelta 29 la construía tramo + brazo).
4. **Lo que la atracción no explica es exactamente lo que define cada obra**: en
   la 1 el marco y los arranques de racimo (cuántos, dónde, hacia dónde caen);
   en la 2 las tres piezas que hacen el contorno abombado y la ventana; en la 3
   el trazo que *entra* buscando la columna y la releva. La gravedad de largo
   alcance (tirar hacia el trazo más cercano estando lejos) **no** reproduce ese
   último: el trazo no va al vecino más próximo, va a la columna. Es una
   decisión, no una fuerza.
5. **El relevo.** El calco de la 3 lo deja claro: la «espina» no es un trazo,
   son dos que se turnan en la misma columna —uno entra por arriba y sale por la
   derecha, el otro entra por la derecha y sale por abajo— y corren juntos a D
   un tramo en medio. Es un patrón distinto de la bifurcación y no lo teníamos.

**Qué cambia en el generador.** La hebra construye los seguidores como
paralelas completas recortadas; la cadena con inicio y fin es más fiel —hace la
bifurcación y el escalonado solos— y es la siguiente pieza: `seguir(S, E, lo
puesto)` en `tramarHebra`, y los maestros como ahora. El relevo, como gramática
de la travesía. Y el bloque gana si sus piezas de contorno se dibujan como
maestros (tres) y el resto como seguidores: es lo que el calco dice que es.

## Trigésima primera vuelta: cuál es el primer trazo

El autor: «identificar el primer trazo es parte de la clave». Se mide
(`gravedad.js --primero`): se prueba **cada trazo del calco como primero** y los
demás se añaden uno a uno, siempre el que mejor se explica por lo ya dibujado.
El primero verdadero es el que deja más trazos explicados; el orden que sale es
un orden de dibujo posible.

**Referencia 1.** Primero: **el meandro de abajo a la izquierda** (t3 del calco),
el que baja con dos quiebros y barre en horizontal por la base hasta el límite
izquierdo del marco. Con él de primero salen 8 de 13 explicados y el error medio
baja de 0,78 (con el marco de primero) a 0,62. El orden: su paralela de arriba,
luego la siguiente, y así hacia arriba; **el marco llega el séptimo**, explicado
a 0,27 D por lo que tiene debajo. Es decir: el marco no engendra el cuerpo; el
cuerpo engendra el marco. Lo que fija el primer trazo son **la base y el límite
izquierdo**, y todo lo demás es seguirlo hacia arriba y hacia la derecha.

**Referencia 2.** **Da igual.** Cualquier pieza de primera explica 8 o 9 de 13,
y el error medio se mueve entre 0,35 y 0,61. El bloque es un sistema de
contacto mutuo: no tiene primer trazo, tiene regla. La mejor (t6, la ele de
arriba a la derecha) gana por poco.

**Referencia 3.** Primero: **el trazo que entra por el borde de arriba, baja por
la columna y sale por el borde derecho** (t3): una ele con el codo abierto en
dos quiebros, el único trazo que toca dos bordes. Con él: 4 de 6 explicados y
error 0,55; con la compañera de primera, 0,77–0,87. El orden: el trozo de barra
de arriba a la izquierda, **el relevo** (el que entra por la derecha y baja), la
barra de abajo, la barra de arriba a la derecha, y al final las dos compañeras
que salen por la izquierda, que son el segundo gesto (0,83 y 1,43 D).

**Lo común a 1 y 3.** El primer trazo **une dos límites** —la base con el canto
izquierdo del marco; el borde de arriba con el borde derecho— y tiene **forma de
ele**: un tramo largo, un codo oblicuo o en dos pasos, otro tramo largo. No es
el trazo más largo ni el más central: es el que **fija el sitio de la obra** en
el pliego. Después vienen sus paralelas (a un lado en la 1, a los dos en la 3) y
las barras, y lo último es el gesto que se separa.

**Para el generador.** El primer trazo de la 1 nace donde hoy acaba (la base):
el meandro pesado se dibuja de abajo arriba, con el barrido hasta el canto del
marco como arranque, y el marco se traza *después*, a D del cuerpo. En la 3 el
primer trazo es la ele que une dos bordes contiguos, con el codo abierto; las
compañeras y el relevo se le cuelgan. El bloque se queda como está: ahí el
orden no es la clave.

## Trigésima segunda vuelta: el primer trazo en el generador, y el seguidor exacto

Lo medido en las vueltas 30 y 31 pasa al modelo de hebra.

**Recinto, desde su primer trazo.** El meandro que baja hasta la base y **barre
por ella hasta el canto** del lado que pesa: nace a 0,35–0,5 del ancho del canto
para que el barrido sea largo, y no lleva tramos horizontales intermedios —uno
que se aleje del canto, la bajada y el barrido de vuelta hacen una U, la forma
que no existe, y las paralelas de dentro se colapsan en ella (7 de 50 con
solape)—. Sus seguidores nacen en la barra hacia el canto y apilan su barrido
encima, todos hasta el mismo canto. Los otros racimos, al lado contrario, bajan
menos. **El marco sale del cuerpo**: la pata del lado que pesa es corta y acaba
dos D por encima del barrido más alto, que es quien llega al canto; la del otro
lado, libre.

**Travesía, desde su primer trazo.** La **ele que une dos bordes contiguos**:
entra por un borde, baja por la columna ondulando, dobla con el codo abierto en
dos quiebros y sale por el borde de al lado (a veces con la subida en diagonal
del original). Después, en el orden que dio la medida: **el relevo** —la
paralela exacta de su brazo, por debajo, desde el borde hacia dentro, que donde
el brazo dobla sigue columna abajo hasta el borde de enfrente—, las **barras**
de los cantos, y las **compañeras**, una o dos, paralelas exactas de la columna
al otro costado, que nacen bajo la barra y giran justo antes del codo de la ele
para salir por su borde (la segunda, paralela entera de la primera).

**El seguidor, exacto.** Se probó la cadena de puntos con muelle tal como se
midió sobre los calcos. Decide bien *a quién* se sigue y *dónde* se suelta, pero
dibuja mal: redondea las esquinas, tiembla alrededor de D y el recorte la
trocea. Queda como instrumento de medida (`gravedad.js`); en el generador el
seguidor es **la paralela exacta del tramo que acompaña más una salida
explícita** (un quiebro de 40–55° y el camino a su meta). Es la misma
definición —inicio, a quién sigue, dónde se suelta, fin— con otra geometría.

**Dos arreglos del recorte.** El cabo cortado solo avanza si lo que lo cortó
está *delante*; si fue un vecino que pasaba a 0,9 D de lado no hay boca que
encarar, y los dos trozos avanzaban el uno hacia el otro hasta tocarse.

Medido: solape 0 de 150 en las tres configuraciones de hebra, pelo 0 por debajo
de g en 60, determinismo 24/24; solape y pelo en las diecinueve configuraciones,
0 con sus controles disparando.

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
