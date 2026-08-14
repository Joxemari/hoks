# HRRS — *itzulera*

**Estado: nace aquí. No hay `algo.js`, no hay harness, no está en
`data/works.json`, no tiene página.** Esto es sólo el análisis y la gramática,
escritos para que otra sesión pueda empezar a construir sin volver a derivarlos.
El nombre es provisional: *harresiak*, las murallas, porque el dibujo se lee como
el plano de un recinto. Alternativas si no convence: **BDK** (*bideak*, los
caminos) o **MGK** (*mugak*, los límites).

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
