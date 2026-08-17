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

## El marcador

| rasgo | generador | referencias | |
|---|---|---|---|
| cruces entre centros | **0** | **0** | ✔ |
| ángulo de quiebro | **35** | **32** | ✔ |
| reparto (mayor / mediano) | **1,58** | **1,56** | ✔ |
| trazos | 8 | 7,5 | ✔ |
| longitud en los ejes | 0,45 | 0,52 | casi |
| cuerda / largo | 0,91 | 0,76 | |
| polo | 0,34 | 0,41 | |
| largo del trazo | 0,53 | 0,64 | |
| línea total | 4,12 | 5,21 | |
| cierre | 0,44 | 0,30 | |
| longitud en 4 rumbos | 0,98 | 0,60 | ✗ |
| quiebros por lado | 3,60 | 7,55 | ✗ |
| cabos al aire | 0,70 | 0,32 | ✗ |
| **acompañado** | **0,01** | **0,32** | ✗ |

## Lo que falta, con su causa

- **El acompañamiento (0,01 contra 0,32).** `sep` es un mínimo que no se puede violar, y
  nada tira de los trazos *hacia* esa distancia: sólo se acercan cuando chocan, y nacen
  a `sep × 1,9`. Falta la consigna — que dos trazos que se encuentran se queden a `sep`,
  no que se limiten a no bajar de ahí.
- **Los rumbos (r4 0,98 contra 0,60).** Toda la longitud cae en cuatro casillas: el
  alfabeto es fino pero se usa poco. Falta error alrededor de cada rumbo.
- **Los quiebros (3,60 contra 7,55).** El paso es 0,13 del lado y sólo se quiebra el
  62 % de las veces; hay que quebrar más y avanzar menos.
- **Los cabos (0,70 al aire contra 0,32).** Dos de cada tres tendrían que morir junto a
  otro trazo. Nacen buscando, pero no mueren buscando.
