# iterations2 — obra en curso (sin nombre)

**No está graduada.** Esto es el sketch de p5 que se pega en OpenProcessing, no
producción. No hay página de obra, no entra en `works.json`, no se publica.
Vive aquí solo para no perderlo entre sesiones.

Una cinta continua recorre el marco **varias veces**; al volver a entrar se cruza
con lo que ya dejó escrito. La profundidad no es el orden de dibujo: se decide
**cruce a cruce**, alternando encima/debajo como un diagrama de nudo.

## Estado

Fase 2. Determinista (`seed` → imagen). Un solo archivo, `sketch.js`: núcleo
generativo + UI de laboratorio. Se pega entero en OpenProcessing.

| tecla | acción |
|---|---|
| `espacio` | nueva composición |
| `←` / `→` | seed ∓ 1 |
| `g` | hoja de contactos (12) |
| `s` | guardar PNG |
| `n` | triaje: lote nuevo de 24 |
| `a` / `x` / `d` | (en triaje) va · fuera · duda |
| `p` | el patrón del descarte |
| `e` | exportar los veredictos en JSON |

El PNG se guarda desde un buffer cuadrado de 1000×1000, no desde el lienzo con
la UI: el export no lleva la banda del panel.

Las paletas se leen en vivo de `data/palettes.json` por `raw.githubusercontent`,
con un juego embebido de respaldo. Las paletas de hoks son listas planas sin
roles, así que el reparto se decide por luminancia: fondo en un extremo, cinta
con el mayor contraste contra él, discos con el resto.

## Las tres esquinas

Un solo mando con tres valores, y el tercero **no es un número más alto**: es
otro mecanismo.

- **rectas** — ángulo vivo y junta a inglete. La cinta doblada, que es la
  referencia de la que salió la obra.
- **curvas** — cada vértice redondeado hasta la mitad del tramo más corto, que
  es el máximo antes de que dos redondeos vecinos choquen. Quedan tramos rectos
  entre esquina y esquina.
- **muy curvas** — sin una sola recta: la curva pasa por los puntos medios de
  cada tramo usando los vértices como control.

**La curva se calcula entera una vez y cada sección se recorta de ella.**
Curvando cada trozo por separado las dos curvas no coinciden en la costura —el
eje curvo se aparta del polígono hasta un cuarto del tramo, y cada sección se
aparta a su manera porque sus puntos de control son otros— y en el dibujo eso
salía como una cuña de tinta donde debía ir la incisión. Con la curva global,
todas las piezas caen sobre el mismo eje.

Comprobado además que curvar no inventa ni destruye cruces: aplanando el eje
tal y como se dibuja, los tres modos tienen exactamente los cruces que conoce
el nudo, en las 40 obras probadas.

## Restricciones materiales

Una cinta no se pliega más corto que su anchura, no gira sobre sí misma y no se
acuesta sobre su propio cuerpo. No son filtros estéticos y **no descartan
piezas**: corrigen la geometría. Se iteran juntas porque se estorban — abrir un
pliegue acorta tramos, separar hebras cierra giros.

Cuando la trama queda demasiado apretada para que quepa la separación, **la cinta
adelgaza**. El material cede ante el nudo, no al revés. Esa es la garantía de que
el halo nunca falla.

## Triaje por lotes

No se filtra mientras se genera. `n` saca un lote de 24, se juzga una a una con
tres teclas —**va**, **fuera**, **duda**— y `p` enseña cómo se reparten los
rasgos entre lo que dejas y lo que tiras. El sistema no corrige nada: enseña el
patrón y decides tú si es tuyo o es ruido.

Dos reglas que hacen que esto sirva de algo:

- **La ficha se calla hasta que has votado.** Leer «sep 1.2» antes de mirar
  decide el veredicto por ti, y entonces el patrón que sale es el de los
  números, no el tuyo.
- **Cada veredicto se guarda con la versión del algoritmo.** Sin eso, un
  «perfecta» de hace tres iteraciones miente: la obra ya no sale igual. La
  versión es `rN.xxxxx` — `N` a mano cuando cambia el código, la huella sola
  cuando cambian los parámetros. Los mandos del laboratorio (vueltas, trazo,
  esquinas, extremos) **no** cuentan como versión: son rasgos de la
  obra, y se guardan como tales.

Los veredictos viven en `localStorage` y salen en JSON con `e`. El corte de cada
rasgo se busca por Gini, no por diferencia de porcentajes: interesa el corte
**limpio**, no el que parte el lote en dos mitades.

## Métricas

Cada composición reporta `cruces`, `gap`, `seg`, `giro`, y el triaje guarda
además familia, paleta, secciones, volteos, juntas, separación entre cruces,
anchura y ocupación. Ninguna filtra nada.

**Ningún detector cuenta hasta que dispara con código roto a propósito.** Tres
controles: invertir el orden de pintado entero (todos los cruces mal), repintar
una sola mitad de abajo encima (inversión de medio lado) y dejarlo intacto
(ninguno mal). Un detector que sólo sabe decir cero no distingue "no hay
defectos" de "no miro donde toca".

### Cómo se mide el halo

Comparando el render contra **la máscara que la geometría exige**, no caminando
rectas:

```
anillo(hebra de arriba, entre W/2 y W/2+gap)  ∩  cuerpo(hebra de abajo)
```

y midiendo qué fracción de esa máscara es fondo de verdad, **por separado a
cada lado del eje de la hebra de arriba** — que es lo que distingue una
inversión de medio lado de una entera. Es la misma cuenta a 40° que a 90°,
porque la máscara ya se alarga sola con el ángulo.

Los tres intentos anteriores caminaban rayos y decidían con un umbral de
color, y los tres mintieron:

| detector | a medias | sin corte | sesgo de ángulo | control |
|---|---|---|---|---|
| tres alturas, umbral duro | 1,3 % | 0 % | — | ninguno |
| sonda sub-píxel | 3,9 % | 1,9 % | 40 % a 38-45° → 0 % a 70-90° | 96 % |
| **máscara geométrica** | **1,0 %** | **0,5 %** | ninguno | **100 %** |

El sesgo monótono con el ángulo era la pista: en un cruce rasante la zona de
solape es un rombo largo y un sondeo por rectas se pierde dentro.

El primer detector daba **1,3 % a medias y 0 % sin corte**, y las dos cifras
eran falsas: cantaba un defecto donde la incisión estaba entera (seed
559686731 — fondo puro de lado a lado a resolución de píxel) y se comía nueve
que sí lo eran.

### Estado

**981 cruces sobre 5 configuraciones, cero defectuosos.**

| configuración | obras | cruces | a medias | sin corte |
|---|---|---|---|---|
| por defecto | 200 | 445 | 0 | 0 |
| trazo fino | 60 | 145 | 0 | 0 |
| trazo estándar | 60 | 146 | 0 | 0 |
| trazo gordo | 60 | 146 | 0 | 0 |
| esquinas rectas | 60 | 146 | 0 | 0 |
| esquinas curvas | 60 | 146 | 0 | 0 |
| esquinas muy curvas | 60 | 146 | 0 | 0 |

Cero en las cuatro bandas de ángulo en todas ellas, y 0/200 obras sin tejido
dibujable. 1,20 s por obra.

Otras tres clases, con su control cada una:

| clase | resultado | control |
|---|---|---|
| remate soldado a otra hebra | 0 de 60 obras | 15 % antes del arreglo |
| tinta pegada al borde | 0 de 140 obras · holgura 20–21 px (pedida 20) | con `margen 0`: holgura 0 px y aparece |
| disco con el centro bajo la cinta | 0 de 244 discos | colocándolos al azar: 35,9 % |

**Determinismo verificado**: 7 seeds dan la misma imagen al píxel repitiendo la
llamada, pidiéndolos en otro orden, tras recargar la página y en otra pestaña.

Antes de separar las condiciones eran 3 cruces defectuosos de 199, todos en las
4 obras (de 80) para las que ningún tejido pasaba. El dibujo nunca tuvo un
fallo propio: todo lo que sobrevivía venía de "para este seed no hay tejido
limpio".

## Dos clases de condición, y por qué importa

Las ocho condiciones del tejido no eran de la misma naturaleza, y mezclarlas
salía caro. Ahora están separadas:

- **`correcto`** — si la obra SE PUEDE DIBUJAR BIEN: ángulo de cruce,
  separación entre cruces, tramo mínimo, holgura de los remates, ciclos,
  atascos. No se negocian.
- **`preferible`** — hipótesis sobre qué se ve bien: `volteoMax`,
  `grosorMinimo`. Se conservan como preferencia, **no como veto**.

Entre un tejido dibujable que no cumple una preferencia y uno que la cumple
pero sale roto, gana el dibujable.

### El rescate por cambio de familia

Si para un seed no hay **ningún** tejido dibujable con su familia, se prueban
las demás. Las familias no dan igual de sí: en los cuatro seeds que fallaban,
`compact` siempre producía un nudo limpio de 3 cruces y `cross` ninguno.

Se dispara con `correcto`, nunca con `preferible`. Disparándolo con las ocho
condiciones entraban también las obras que sólo incumplen `volteos` —tres de
las cinco que el autor aprobó— y se las llevaba por delante. Con la separación,
**las cinco salen idénticas al bit** y el rescate sólo toca el ~8 % que lo
necesita (2 de 24), así que no cuesta tiempo medio.

Exige un nudo de verdad (≥3 cruces): sin eso el rescate se llena de tejidos de
un solo cruce, que cumplen todo al vacío porque con un cruce no hay separación
entre cruces que medir.

### La disyuntiva, medida

Se probó forzar más trama con una puerta de cruces mínimos (`crucesMin 3`) más
un suelo de una vuelta como último recurso:

| | cruces/obra | cruces defectuosos | obras sin tejido limpio |
|---|---|---|---|
| como está | 2,5 | **1,5 %** | 5 % |
| con `crucesMin 3` | 3,8 | 3,3 % | 10 % |

Más trama cuesta correctez, y ahora se sabe cuánto. **Revertido**: la
instrucción era cero defectos.

### Una puerta que contradice al autor

Comprobando qué incumplen las cinco obras que el autor aprobó:

| seed | familia | cruces | veredicto de las puertas |
|---|---|---|---|
| 7 | returning | 3 | **incumple `volteos` = 1,00** |
| 101 | cross | 3 | pasa todo |
| 2024 | returning | 3 | **incumple `volteos` = 1,00** |
| 55501 | cross | 5 | pasa todo |
| 880123 | compact | 2 | **incumple `volteos` = 0,50** |

`volteoMax` está en 0,34. **Tres de las cinco obras aprobadas lo incumplen.**
El umbral salió de una hipótesis —que un nudo con muchos volteos deja de
alternar y el ojo no lo sigue— y el ojo del autor la contradice. Era además la
puerta más dura de las ocho: de 22 candidatos la pasaban entre 0 y 4, y por eso
subir los reintentos no movía la tasa (96 % con 10, 88 % con 60). El pozo no
era pequeño; había un cuello.

Abrirla a 1,0 sube la trama de 2,5 a 2,7 cruces por obra y **no** arregla los
seeds sin tejido limpio (fallan por otras puertas). No se ha cambiado: mueve
tres de las cinco obras aprobadas, y eso lo decide el autor.

**Aquí se agota lo que puedo hacer midiendo contra mis propios criterios.** Tres
de las ocho puertas son hipótesis mías sin contrastar, y la que sí se ha
contrastado ha salido equivocada. Lo que hace falta ahora son veredictos —el
triaje por lotes existe para esto: recoge el juicio del autor con todos los
rasgos medidos y saca qué medida predice de verdad el descarte.

### Otras dos hipótesis probadas y descartadas

- **Dar variedad al pozo de candidatos.** El giro entre pasadas es `0,62·2π`
  fijo con un temblor de ±0,25 rad, así que los 22 candidatos son el mismo
  tejido con ruido. Sorteando el giro de verdad (±0,18·2π) y la escala: **95 %
  → 89 % de obras limpias**, y sin más trama. El 0,62 no es una limitación,
  está bien elegido.
- **Cambiar de familia como último recurso.** Las familias no dan igual de sí:
  en los cuatro seeds que fallan, `compact` siempre produce un nudo limpio de 3
  cruces y `cross` ninguno. Rescatarlos cambiando de familia da **80/80
  limpias**, pero triplica el coste (1,2 → 3,8 s por obra) y mueve tres de las
  cinco obras aprobadas, porque esas tampoco pasan las puertas.

### Dos trampas, por si se vuelve a intentar

- Un tejido de una vuelta **sin cruces cumple todas las demás puertas al
  vacío** —sin cruces no hay separación, ni volteos, ni ciclos, ni remates que
  medir— y se vuelve el óptimo degenerado: 28 obras de 60 se derrumbaron a una
  vuelta. Hace falta la puerta de cruces mínimos para que las otras siete
  signifiquen algo.
- El desempate entre tejidos que fallan **no puede contar puertas a peso
  igual**: el degenerado incumple una (no ser un nudo) y un nudo de verdad
  incumple dos, así que gana el degenerado (43 de 60). Hay que ponderar por
  severidad, y "no es un nudo" pesa más que todo lo demás.

**El cruce invertido ya se mide**, y está validado: con el orden de pintado
invertido dispara en 52 de 54 cruces. Lo que sigue sin validar es su
sensibilidad al caso de **medio lado** — el control para eso no llegó a
reproducir el fallo.

## Pendiente

- Los extremos de la cinta no se leen: empiezan y acaban a hueso en cualquier
  sitio. En un tejido, principio y final son un acontecimiento.
- Las familias (`diagonal`, `compact`, `open`, `returning`, `cross`) se
  distinguen poco: con 3 vueltas rotadas convergen al mismo tipo de nudo.
- Sin traits ni rareza — hace falta para que sea una obra de hoks y no un sketch.
- Sin grano. Las tres series activas lo llevan; hay que decidir si entra en esa
  familia visual o se declara aparte.
