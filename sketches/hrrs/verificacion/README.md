# verificacion/ — cómo se comprueba que HRRS no se toca

**Nada de esto se publica.** No lo carga ninguna página, no se sirve, no entra en
el sketch. Son scripts que se ejecutan a mano cuando alguien toca el recorrido o
el dibujo de la cinta, y están aquí porque la alternativa es volver a derivarlos
desde cero — con sus trampas incluidas, que es lo caro.

## La regla

**Un cero sin control no significa nada.** Un detector que sólo ha dicho cero
jamás puede distinguir "no hay defectos" de "no estoy mirando donde hay que
mirar". Por eso cada bloque trae su versión **rota a propósito**, y si el control
no dispara, el cero del bloque no vale.

Los controles se generan solos desde `../algo.js` con `mktest.py`, así que no se
quedan viejos: son el código de producción más una avería concreta. HRRS no
necesita exponer tripas — `render` ya devuelve `res.geo` (las cintas, W, g, D y la
transformada) y `res.rol` (los dos colores), así que los detectores miden por el
**contrato público**.

## Ejecutar

```bash
cd sketches/hrrs/verificacion
./mil.sh                 # la larga: 1.000 obras por bloque, tarda un rato
./mil.sh canal           # un bloque suelto
python3 mktest.py "" hrrs_test.js       # build sano desde ../algo.js
python3 mktest.py duro   t_duro.js      # build con una avería concreta
node canal.js hrrs_test.js 200 760 'trenza,apais-tren'
```

`playwright` y Chromium ya están en el entorno; no hace falta instalar nada.

**No edites `mil.sh` mientras corre**: bash lo lee a trozos y revienta con un
error de sintaxis que parece del código.

## Los detectores

| script | qué mide | su control |
|---|---|---|
| `canal.js` | **la regla 3**, exacta: distancia mínima entre todos los pares de tramos no contiguos, en unidades de `D = W+g` | `duro`, `vecino`, `otracinta` |
| `toque.js` | que la **tinta sea la geometría**: ni un píxel más allá de `W/2` del eje, y el remate plano | `miter`, `cabo` |
| `obra.js` | margen, ojos, cadencia y ocupación | `margen` · (ver abajo) |
| `det.js` | determinismo y **misma huella a 760 / 2400 / 4200** | — |

### Por qué el toque se mide en dos mitades

La regla es una sola: *si nada se solapa, cualquier píxel de cinta con cinta al
lado y sin suelo por medio es un defecto*. Pero medirla de una sola vez no sale.

La primera versión medía la **profundidad** de la tinta: siendo la cinta la suma
de Minkowski del eje con un disco de `W/2`, ningún punto de tinta debería estar a
más de `W/2` del suelo. Dio **24 de 24 obras "con toque"**, con la profundidad
clavada entre 1,44 y 1,60 medias anchuras. Un número tan igual en todas las obras
no es un defecto: es el detector inventando.

El agujero del razonamiento es el mismo que la trampa 2 de TRZS (el inglete del
codo): en un **giro** los dos tramos son **contiguos**, se solapan entre ellos, y
su unión es legítimamente más gruesa que `W`. La regla 3 no lo prohíbe — son el
mismo trozo de cinta, no dos pasadas. Y medido, **un giro legal de 152° da 1,94
medias anchuras mientras que dos pasadas de verdad fundidas a 0,86 W dan 1,86**:
el defecto mide *menos* que lo sano. No faltaba afinar el umbral; el criterio no
distingue.

Así que se parte en dos, y ninguna mitad lleva umbral inventado:

1. **`canal.js`** comprueba la **geometría**: ningún par de tramos no contiguos a
   menos de `W+g`. Exacto, sobre los ejes, sin rejilla.
2. **`toque.js`** comprueba que la **tinta no añade nada** a esa geometría.

Hace falta la segunda porque la primera habla de *ejes* y lo que se publica son
*píxeles*. Si el dibujo se pasara del eje, la distancia entre ejes seguiría siendo
correcta y las tintas se tocarían. Las dos juntas son la garantía entera.

### Y de paso comprueba una afirmación del `algo.js`

El control `miter` no comprueba un detector: comprueba que el **bisel** es lo que
hace suficiente a la regla 3. Con `miter` el pico de un giro sale `W/2/sen(α)` del
vértice y la regla sólo garantiza `W/2 + g` de aire alrededor, así que una esquina
puede cruzar el canal y soldar la obra por donde menos se mira. Dispara **10 de
10**. Con `bevel`, toda la tinta cae dentro de `W/2` del eje y los dos detectores
miden lo mismo.

## Las trampas que ya se pagaron

Todas dieron defectos **que no existían**, y todas salieron por mirar la imagen o
la cifra en vez de creerse el cero. El sesgo de un detector mal hecho es inventar,
no callar.

1. **La profundidad de la tinta.** La de arriba: 24 de 24 obras marcadas porque un
   giro cerrado engorda la tinta legítimamente.
2. **La tinta propia leída como ajena** (trampa 8 de TRZS, otra vez). El sondeo del
   cabo marcaba **4 obras sanas de 10**, siempre en el último vértice y siempre con
   el tramo terminal corto (1,1–1,6 anchuras). Causa: un giro cerrado en el
   penúltimo vértice manda el tramo **anterior** hacia delante — con 152° sale a
   28° de la dirección del cabo—, así que barre por delante del plano del remate y
   su tinta cae dentro del disco de medida. El argumento de "otra pasada está a D"
   no la cubre, porque no es otra pasada: es el vecino contiguo, al que la regla 3
   no mide. Un píxel sólo cuenta si **ningún otro tramo lo explica**.
3. **El degradado tomado por tinta** (trampa 4 de TRZS, otra cara). Con el mesh
   gradient el suelo no es un color: son cuatro colores de la paleta interpolados,
   y algunos caen más cerca de la tinta que del suelo nominal. **11 de 12
   configuraciones a 0/21 y la del degradado a 17/21**, con 170.000–600.000 px
   "fuera" en las **esquinas** del cuadro. `toque.js` fuerza el fondo a plano, y no
   es hacer la vista gorda: `E.pickBg` va por un hash del seed y no por el rng, y
   el fondo se pinta antes del `stroke`, así que la tinta es idéntica con degradado
   y sin él. El degradado no cambia lo que este detector mide — sólo impide medirlo.
4. **El bisel leído como falta de tinta.** `toque.js` cuenta también la geometría
   *sin* tinta, y sale en todas las obras: el bisel **corta** la esquina, así que la
   tinta es un **subconjunto** de la suma de Minkowski, no su igual. Y subconjunto
   es exactamente lo que hace falta. Se imprime como informativo, no como defecto.
5. **La coma flotante del pliegue.** El brazo del pliegue mide `D/sen(φ)` exactos y
   una voz que nace al lado se pone a `D` exactos, así que su par sale en
   0,999999999 y un `< 1` a pelo marca como defecto **justo la figura que la obra
   existe para producir**. La regla sigue siendo 1,0; la tolerancia es `1e-6` y es
   de coma flotante, no un umbral.
6. **El control que no rompía nada.** `rejilla` (ángulos exactos de 90°, sin
   quiebro, sin variación de longitud) daba un CV de longitudes de **0,501 contra
   0,60 del sano**: no llegaba a producir el defecto que dice producir, porque las
   tres longitudes alternativas, la vuelta del pliegue y la escala de racha por
   cinta seguían variando el tramo ellas solas. Una avería tiene que llegar hasta
   el final. Con las cinco constantes tocadas baja a 0,30.
7. **El centinela impreso como medida.** `toque.js` calculaba la distancia al eje
   sólo dentro de una caja por tramo, y la tinta de un pico de inglete cae fuera de
   esa caja: el control `miter` disparaba bien pero imprimía *5,6 × 10⁷* medias
   anchuras de exceso. Ahora la caja se ajusta a lo que hace falta para
   **clasificar**, y la magnitud se calcula después y sólo para los píxeles que
   fallan — exacta, y sin pagar 6 M de distancias por obra.
8. **La firma equivocada.** `det.js` toma `(algo, n, configs)` y el `mil.sh` lo
   llamaba con la firma de los otros `(algo, n, base, configs)`. Con `set -u` eso
   es un `$5: unbound variable` y el bloque entero no corría — dejando un hueco
   silencioso en la batería.

## El estado hoy

Batería completa (`./mil.sh`) sobre el algoritmo publicado, repartida entre **doce
configuraciones**: por defecto, los cuatro tipos, apaisado, apaisado con trenza,
campo cuadrado sobre DIN, gubia fina, gubia ancha, sin reserva y con degradado.

| bloque | resultado | su control |
|---|---|---|
| canal (la regla 3) | 996 obras · **2.008.529 pares** no contiguos · **0 incumplen** · mínimo 1,000 en las doce | `duro` 119/120 · `vecino` 113/120 · `otracinta` 118/120 |
| tintas solapadas | **0 de 996** | `duro` 113/120 · `otracinta` 118/120 |
| toque (tinta = geometría) | **0 de 252** en las doce · exceso máximo 0,00 | `miter` 10/10, exceso hasta 2,44 |
| remate plano | **0 de 252** | `cabo` 10/10, 7.453 px de mediana |
| margen | **0 de 996** fuera del cuadro · mínimo 0,055 exacto | `margen` 119/120 |
| determinismo | **60/60** idéntico al píxel en tres condiciones, y con la paleta fijada | — |
| misma huella a 760/2400/4200 | **60/60** | — |

**Lo que NO está verificado, y conviene que se lea:**

- **El reparto de tamaños de los ojos no tiene control que dispare.** Con la
  rejilla sale 9 de 120 obras-laberinto contra 6 de 120 del sano, que es lo mismo.
  Así que esos números son **descriptivos** —sirven para el triaje del lote— y no
  dan nada por comprobado. La regla 6 sigue siendo una decisión del ojo en el grid.
- **La cadencia es distribucional y tiene suelo.** El brazo del pliegue mide
  `D/sen(φ)` por construcción, así que un tercio de los tramos es forzosamente de
  otra longitud y el CV no puede bajar a cero por mucho que se rompa el resto. El
  control mueve la distribución (0,60 → 0,30) y eso es lo que se comprueba; no hay
  umbral por obra que separe limpio, porque el mínimo sano (0,21) y la mediana rota
  (0,30) se solapan.
- **El determinismo no tiene control, y no puede tenerlo.** Un control sería meter
  `Math.random()` en el algoritmo, y entonces no se estaría probando el artefacto
  publicado sino otro.
- **`falta` no es cero siempre**: 993 de 996. Con seeds difíciles ningún candidato
  cumple lo que su tipo declara y manda el que menos incumple (máximo 0,26). Por
  eso `falta` es un número y no un sí/no, y por eso el panel lo enseña.
