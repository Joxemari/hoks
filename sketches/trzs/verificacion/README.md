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
| `o2.js` | remates soldados, tinta en el borde, discos que invaden la cinta | `trzs_margen`, `trzs_ojo`, `trzs_remate` |
| `cos.js` | **costuras**: raya de 1 px dentro de la tinta | `trzs_costura` (el cuerpo vuelve a acabar a ras del halo) |
| `det.js` | determinismo en cuatro condiciones | — |
| `solape.js` | holgura geométrica entre hebras sin cruce | — |
| `lupa2.js` | PNG de una obra **diciendo qué color es tinta y cuál fondo** | — |

`hueco.js` es el que importa y el único sin umbrales: camina los dos bordes de la
hebra de arriba y, en cada punto donde debajo hay cuerpo de la otra, exige fondo.
Cuenta píxeles de **tinta sólida** seguidos. Un hueco es un hueco.

## Las siete trampas

Todas ellas dieron defectos **que no existían**, y las siete salieron por mirar la
imagen en vez de creerse el número. Ninguna ocultó nada: el sesgo del detector
mal hecho es inventar, no callar.

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
   inspeccionado a 11 aumentos y sin nada visible.

Y una octava que no era del detector sino del que lo llamaba: `m2.js` espera la
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

La costura ya no está abierta: era el filo del cabo —halo y cuerpo acababan en
el mismo arco, a ras— y se cierra haciendo que el cuerpo pase del halo. Con eso
el bloque tiene por fin un control, que es el código publicado con `sobra = 0`.

| bloque | resultado (1.000 obras por bloque) | su control |
|---|---|---|
| huecos en la incisión | 2.000 obras · **0** con 3 px o más | 332 de 332, hasta 72 px |
| la incisión por máscara | 0 sin corte · **3 a medias de 2.653 cruces** | 158/158 y 157/158 |
| costuras | **0 de 125 obras** en las ocho · 26–107 px | 97/125 · 5.967 px |
| remates soldados | **4 de 250** por defecto, 7 de 250 en trama | 1/30 (flojo) |

**Lo que sigue abierto, y los dos son PREVIOS al arreglo de la costura** —el
mismo código con `sobra = 0` da los mismos números y los mismos seeds:

1. **Remates soldados**, ~2 % de las obras: un extremo de cinta pegado a otra
   hebra sin fondo entre medias.
2. **Incisiones a medias**, 3 de 2.653 cruces, sólo en apaisado.

Ninguno de los dos salía en la graduación, y no porque el código fuera otro:
porque se medían 50 obras por configuración. A un 2 %, cero de cincuenta es lo
más probable que puede pasar. **La muestra era el defecto.**

**Y un control flojo, el mismo de siempre:** el de remates dispara en 1 de 30.
Abre la puerta y quita los reintentos, pero la selección puede seguir
prefiriendo un tejido con los remates holgados. Un cero de remates está peor
respaldado que los demás — y ahora que sabemos que hay remates soldados de
verdad, eso importa más.

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
