# verificacion/ — cómo se comprueba que el halo de TRZS no está roto

**Nada de esto se publica.** No lo carga ninguna página, no se sirve, no entra en
el sketch. Son scripts que se ejecutan a mano cuando alguien toca el dibujo de la
cinta, y están aquí porque la alternativa es volver a derivarlos desde cero — con
sus siete trampas incluidas, que es lo caro.

## La regla

**Un cero sin control no significa nada.** Un detector que sólo ha dicho cero
jamás puede distinguir "no hay defectos" de "no estoy mirando donde hay que
mirar". Por eso cada bloque trae su versión **rota a propósito**, y si el control
no dispara, el cero del bloque no vale.

Los controles se generan solos desde `../algo.js` con `mktest.py`, así que no se
quedan viejos: son el código de producción más una avería concreta.

## Ejecutar

```bash
npm i -g playwright && npx playwright install chromium
cd sketches/trzs/verificacion
./todo.sh                 # la corta del día a día, ~50 obras por bloque
./mil.sh                  # la larga: 1.000 obras por bloque, tarda un rato largo
./mil.sh costuras         # un bloque suelto de la larga
```

**La corta no basta para dar por bueno un cambio en el dibujo.** Con 50 obras
por configuración, un defecto que sale en el 2 % de las obras da cero más de la
mitad de las veces — y un cero así no dice que no esté, dice que no se ha
mirado bastante. Dos de los defectos abiertos hoy aparecieron al pasar de 50 a
250 obras, sin que el código cambiara.

Suelto, con la configuración que sea:

```bash
python3 mktest.py "" trzs_test.js          # build de prueba desde ../algo.js
node hueco.js trzs_test.js 250 '{"tipo":"trama"}'
node m2.js    trzs_test.js  50 '{"corner":"curvas"}'
node lupa2.js 226678576                    # PNG + dice cuál es tinta y cuál fondo
node zoom.js  M_226678576.png Z.png 435 567 80 80 11
```

`mktest.py` toma `../algo.js` **tal y como se publica** y le añade una sola línea
que expone las tripas en `window.__TRZS`. Probar una copia adaptada sería probar
otra cosa.

## Los detectores

| script | qué mide | su control |
|---|---|---|
| `hueco.js` | **huecos en la incisión**: tinta sólida donde tiene que haber fondo | `trzs_orden` (orden de pintado invertido) |
| `m2.js` | la incisión por cobertura de máscara, medida por mitades | `trzs_orden`, `trzs_mitad` |
| `o2.js` | remates soldados, tinta en el borde, discos que invaden la cinta | `trzs_cara`, `trzs_margen`, `trzs_ojo`, `trzs_remate` |
| `cos.js` | **costuras**: raya de 1 px dentro de la tinta | `trzs_costura` (el cuerpo vuelve a acabar a ras del halo) |
| `det.js` | determinismo en cuatro condiciones | — |
| `solape.js` | holgura geométrica entre hebras sin cruce | — |
| `lupa2.js` | PNG de una obra **diciendo qué color es tinta y cuál fondo** | — |

`hueco.js` es el que importa y el único sin umbrales: camina los dos bordes de la
hebra de arriba y, en cada punto donde debajo hay cuerpo de la otra, exige fondo.
Cuenta píxeles de **tinta sólida** seguidos. Un hueco es un hueco.

## El fantasma, de punto ciego a medido

Durante un tiempo las obras fantasma se **excluían**, y el README decía en voz alta
que excluir no es comprobar. Ya no hace falta: `hueco.js` y `m2.js` las miden.

Una cinta fantasma es del color exacto del suelo. No se dibuja con masa: se dibuja
con su incisión, que va en `filo`, el color de la paleta más lejano al suelo. El
error fue leer eso como *una excepción que hay que excusar*. No lo es —

**en un cruce de fantasma la obra es su propio negativo.** A lo largo de la sonda,
una obra normal da `tinta | corte | tinta`; una fantasma da exactamente los mismos
tres tramos con los dos colores cambiados de sitio: el cuerpo es el color del suelo
y el corte es `filo`. Así que el detector no tiene que aprender un caso especial,
tiene que **intercambiar los dos colores** en esos cruces. Todo lo demás —los
umbrales, las rachas, la clase `mezcla` del antialias— se queda igual.

La diferencia entre excusar e intercambiar es la diferencia entre un detector ciego
y uno que mide, y se ve en el control roto:

| en obras fantasma | falsos en obra buena | control roto (orden invertido) |
|---|---|---|
| excusando `filo` | 0 de 172 | **1 de 91** — ciego |
| intercambiando colores | 0 de 172 | **87 de 91** — mide |

Excusar acepta `filo` *y además* sigue aceptando el fondo. Pero tapar la incisión
con el cuerpo de la cinta **es** el defecto que buscamos, y ese cuerpo es fondo: al
aceptarlo, el control roto pasaba por sano. Intercambiando, el fondo dentro de la
incisión vuelve a ser lo que es, un hueco. En `m2.js` la misma cuenta: el control
pasó de disparar en el 1,4% de los cruces al 91,8% — el mismo orden que el 97,3%
que da sobre obras normales.

La otra mitad del arreglo es saber **de qué cinta** es la sección que pasa por
encima, porque el intercambio sólo vale cuando esa sección es la fantasma: en una
obra de dos cintas, las demás se siguen midiendo contra el fondo. La cuenta es la
que ya hacía el algoritmo al pintar — *cuántos saltos ha dejado atrás la sección* —
y la fantasma es siempre la última.

Y hay una pista falsa que costó un rato: esto **no** empezó cuando se metió el
fantasma. Empezó cuando su halo dejó de fabricarse mezclando el fondo hacia el
negro o el blanco. Una mezcla cae en la clase `mezcla` de `hueco.html`, que el
detector ya ignoraba por ser filo de antialias, así que el caso pasaba **por
accidente, no por diseño** — y el día que el halo pasó a ser un color puro de la
paleta salieron 146 falsos de 172 cruces de golpe.

### Dónde sigue sin haber comprobación

Dos bloques mantienen la exclusión, y ahí sí es estructural:

- **Costuras** (`cos.js`). Una costura es una raya mezclada *metida en la tinta*.
  En una obra fantasma la tinta y el fondo son el mismo hex: `esTinta` y `esFondo`
  colapsan, cada píxel se descarta y el test sale 0 **por no mirar nada**.
  Intercambiar colores no lo salva, porque no hay dos clases que intercambiar.
- **Remates y discos** (`o2.js`). El sondeo busca fondo alrededor del cabo y en una
  fantasma no lo encuentra por ningún lado, así que marca los cuatro cabos.

Y sigue pendiente lo de siempre: `mktest.py` construye el control `sueloigual`, que
**`mil.sh` nunca llega a ejecutar**.

## Las once trampas

Todas ellas dieron defectos **que no existían**, y todas salieron por mirar la
imagen en vez de creerse el número. Ninguna ocultó nada: el sesgo del detector
mal hecho es inventar, no callar. Las cuatro últimas son de un detector que se
quedó viejo: el sondeo de remates se escribió cuando la cinta acababa a
escuadra, y cuando el remate pasó a tener forma dejó de medir lo que decía
medir — sin avisar, porque un detector que se equivoca sigue dando un número.

1. **Arco por parámetro.** `dir(s)` espera un parámetro de recorrido (índice de
   segmento + t), no una longitud de arco. Pasándole el arco, la normal sale a
   cualquier sitio. Síntoma: *406 de 406 puntos malos*. Una obra rota no da el
   100 %; eso delata al detector.
2. **El inglete del codo.** La sonda va a `W/2 + gap/2`, apenas `gap/2` fuera del
   cuerpo — y en un codo el inglete saca el borde más allá de `W/2`. Inventaba
   huecos de 25 px. Hay que excluir el cuerpo de la propia hebra de arriba.
3. **La máscara al 50 %.** Esa exclusión, umbralada a media cobertura, dejaba
   pasar el filo antialias. Va dilatada (`W + 3`).
4. **`fg2` como tinta.** Con una sola cinta, `fg2` es por construcción
   `mixHex(fg, bg, 0.38)`: el color exacto de un píxel mezclado al 38 %. Tomarlo
   por tinta convertía cada filo en un hueco. Sólo cuenta si la obra tiene dos
   cintas.
5. **El polígono en vez de la curva.** Con esquinas curvas el dibujo sigue la
   curva densa y `puntoEnArco` camina el polígono, del que la curva se aparta
   hasta un cuarto del tramo. Daba 55 cruces con hueco y uno de 76 px, ninguno
   real. Las sondas van por la misma curva que el render.
6. **El paseo demasiado largo.** Más allá de la huella, la máscara de abajo sigue
   existiendo porque incluye el cabo, que entra en tramos donde otra sección
   cruza legítimamente. Allí exigir fondo es exigir que no haya otro cruce.
7. **La Y de dos incisiones.** Donde dos cruces se encuentran, el detector camina
   por el borde de uno y entra en la cuña donde manda el otro. Ahí la tinta es
   cinta. Queda como falso positivo conocido: 3,5 px en 1 cruce de 2.597,
   inspeccionado a 11 aumentos y sin nada visible. La punta del anillo de la
   máscara es de la misma familia: donde el anillo se acaba caben cuatro píxeles
   y decide el antialias, así que un cruce con todos sus tramos al 100 % de
   fondo puede dar 0,50 de media.

8. **La tinta propia leída como ajena.** El sondeo de remates busca tinta más
   allá del cabo, y desde que el remate va en inglete o redondo la primera tinta
   que hay ahí es la SUYA: 122 de 200 obras marcadas. Y no sólo el remate — con
   el último tramo más corto que media anchura y en codo, el cuerpo del tramo
   anterior sobresale por delante del cabo: el extremo queda dentro de su propia
   esquina. El detector rasteriza aparte la sección del cabo y la reconoce.
9. **La sección buscada en el espacio equivocado.** `plano.secciones` viene en
   PARÁMETRO (índice de vértice + fracción); `renderComposition` lo pasa a arco
   con `arcoDeParam`. Comparar el arco del cabo contra el parámetro no falla:
   devuelve −1 y apaga la máscara en silencio, con lo que todo vuelve a leerse
   como tinta ajena. Y buscarla por contención tampoco vale: el cabo es la
   FRONTERA entre dos secciones. Se busca por el lado que le toca.
10. **El filo entre dos rasterizaciones.** La máscara de la sección es otro
   trazado del mismo camino, así que su borde y el del render no coinciden
   píxel a píxel y el antialias caía fuera. La máscara va dilatada 3 px y se
   toleran dos píxeles sueltos por delante.
11. **El cabo enterrado.** Con varias cintas, un extremo puede acabar DEBAJO de
   otra hebra: la holgura de remates sólo está garantizada frente a las huellas
   de cruce, y ahí no hay cruce porque el recorrido se acaba antes. Ese cabo no
   se ve, así que no puede estar soldado. Se cuenta aparte, con su nombre.

Y una que no era del detector sino del que lo llamaba: `m2.js` espera la
configuración en el **cuarto** argumento. Pasarle ahí el umbral hace que las ocho
configuraciones corran como la de por defecto — y los números salen sospechosamente
idénticos, que es la única pista.

## El estado al graduar

Batería completa sobre el algoritmo publicado, ejecutada desde esta carpeta:

| bloque | resultado | su control |
|---|---|---|
| huecos en la incisión | 4.234 cruces · **0** con 3 px o más · peor 1,5 px | 87 de 87, hasta 72 px |
| la incisión por máscara | 997 cruces en 8 configuraciones · **0 defectuosos** | 52/52 y 52/52 |
| remates, margen y discos | **0 de 50** en las tres configuraciones | 23/30 y 22/30 |
| determinismo | idéntico en las cuatro condiciones | — |
| holgura geométrica | 1,45 anchuras mínimo · **0 solapes** en 240 obras | — |
| costuras | 2.284 / 3.221 / 2.501 px | — (artefacto conocido) |

Las ocho configuraciones son: por defecto, los cuatro tipos, esquinas curvas,
apaisado, y dos cintas en apaisado.

## El estado hoy, con la batería larga

Batería completa (`./mil.sh`) sobre el algoritmo publicado, 1.000 obras por
bloque repartidas entre doce configuraciones: por defecto, los cinco tipos,
esquina curva, remate en inglete, temblor a 0,20 y a 0,35 con curva, apaisado, y
tres cintas en apaisado.

| bloque | resultado | su control |
|---|---|---|
| huecos en la incisión | 2.000 obras · **0** con 3 px o más | 349 de 349, hasta 79 px |
| la incisión por máscara | 0 sin corte · **2 a medias de 2.666 cruces** | 171/172 y 152/172 |
| costuras | **0 de 85** en diez de doce · 10–100 px | 94–108 de 125 · 5.775–7.061 px |
| remates soldados | **0 de 1.000** | 4 de 60 (`cara`) |
| tinta pegada al borde | **0 de 1.000** | 48 de 60 |
| discos que invaden la cinta | **0 de 1.000** | 40 de 60 |
| cuerpos solapados sin cruce | **0 de 1.000** · mínimo 1,45 anchuras | — |
| determinismo | idéntico en las cuatro condiciones | — |

**Lo que queda, y es lo que hay:**

1. **Dos incisiones "a medias" de 2.666 cruces**, las dos en apaisado. Miradas a
   cinco aumentos las dos están limpias, y una de ellas tiene *todos* sus tramos
   al 100 % de fondo: su 0,50 sale de las puntas del anillo, donde caben cuatro
   píxeles y decide el antialias. Es de la familia de la trampa 7.
2. **Dos obras de 85 con costura con temblor a 0,20**, 482 px en total. Con el
   temblor la cinta se dibuja como polígono y sus aristas no coinciden píxel a
   píxel con las del halo.

Se probó decidir el bloque de la máscara por el PEOR tramo en vez de por el
agregado —que es lo que pedía su propio comentario— y dispara donde no hay nada:
3,2 % "a medias" y 1,2 % "sin corte" en configuraciones donde `hueco.js`, que no
tiene umbrales, da cero sobre 2.000 obras. El agregado se queda como criterio y
el peor tramo se imprime al lado, que para mirar es mejor pista.

**Y un aviso sobre los controles:** el de remates (`cara`) dispara 4 de 60 con
dos cintas y 0 de 60 con una. La cara del cabo ya lleva incisión, así que para
verlo fallar hace falta además que el cabo caiga contra otra hebra, y con una
sola cinta eso casi no pasa. El cero de una cinta está respaldado por el de dos,
no por sí mismo.

## Lo que se midió con esto

- **El hueco de la incisión.** La zona que veta poner una junta cerca de un cruce
  medía `(W/2)/senθ × 1,20`, que cubre la huella pero no el sobresaliente con que
  el cuerpo se alarga en la junta. Con `1,60` se cierra. Sobre 1.000 obras y 2.603
  cruces: de 1,61 % con hueco de 3 px o más (el peor de 28 px sobre una cinta de
  66) a cero.
- **Dos cintas dibujadas como una.** Con cero cruces, `buildKnot` devolvía una sola
  sección de 0 a `last`, salto incluido — y el salto sólo se deja de pintar cuando
  una sección cae dentro de él, cosa que con una sección única no pasa nunca. Las
  dos cintas salían unidas por el salto. Lo delató el barrido POR CONFIGURACIÓN,
  no el grande: sólo pasa en el tipo `dos`, que es el 3 % de las obras, y se veía
  como dos remates soldados (46 de 48 puntos). El barrido por defecto no lo habría
  encontrado nunca.
- **Cuatro arreglos que perdieron**, cada uno con su medición escrita en
  `../algo.js` para que no se reintenten: solapar sólo la sección que pinta
  después, alargar el halo de las dos en la junta, reducir la pizca del solape, y
  —descartado midiendo— que hubiera cuerpos solapados sin cruce registrado.
- **El porte desde p5.** 200 obras de 200 idénticas al píxel antes del arreglo del
  veto; 170 de 200 después, y las 30 que cambian son exactamente aquellas donde el
  veto movió una junta. El runner de esa prueba no está aquí: necesitaba el p5
  original, y era una verificación de una sola vez.
