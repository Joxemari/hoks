# EVOL — *hutsunea*

**Estado: nace aquí. No está en `data/works.json`, no tiene página, no está
publicada.** Es una propuesta de sistema para mirar en el grid de obras y decidir
si merece página, como lo fueron `dtkrt/` y `eclps/` antes que ella. El nombre es
provisional.

---

## La idea, en una frase

**TRZS es el cruce. EVOL es la soldadura.**

En TRZS dos hebras se encuentran y **pasan**: una por encima, otra por debajo, y
el suelo aparece entre ellas como una **incisión** — una línea, un corte que las
mantiene separadas. La profundidad se decide cruce a cruce, como un diagrama de
nudo, y toda la máquina de esa obra existe para que ese corte se vea.

En EVOL dos cuerpos se encuentran y se **funden**. No hay encima ni debajo, no hay
incisión, no hay diagrama de nudo. Un solo cuerpo. Y el suelo, que en TRZS pasaba
**entre**, aquí queda **atrapado**: sobrevive solo donde la masa se cierra a su
alrededor. Deja de ser una línea y se vuelve una isla con borde.

Eso es un **ojo**, y los ojos son la obra. El vacío no es lo que sobra: es lo que
la masa está ahí para definir. La misma técnica —una cinta que recorre el marco—
con la ley del encuentro invertida da la otra mitad del asunto: si TRZS trata de
cómo dos cosas se separan sin dejar de tocarse, EVOL trata de cómo dejan de ser
dos.

De ahí el subtítulo. *Hutsune* es el hueco, el vacío — y es palabra de Chillida,
título suyo, de un escultor de Donostia que se pasó la vida diciendo que no
trabajaba el hierro sino el espacio que el hierro deja. La continuidad con
**Elena Asins** sigue donde estaba: el sistema, la serie, la regla que produce la
forma. Chillida entra por la otra puerta, la de que el material solo está para
poner un borde al vacío.

## La gramática, en cinco reglas

1. **ESTRATOS.** La masa no divaga por el cuadro: recorre bandas casi horizontales
   que lo cruzan. Cada estrato **entra por un borde** — la obra es el corte de algo
   más grande, no una figura centrada en su hoja.
2. **CUERPO.** La anchura no es constante. Ahí es donde se separa de TRZS, donde el
   grosor **es** el material y no cambia nunca. Aquí va por **niveles discretos** y
   salta de uno a otro en los vértices: la masa engorda y adelgaza a escalones, no
   en rampa. De ahí el contorno facetado, y de ahí que en una misma pieza convivan
   el pelo y el bloque.
3. **SOLDADURA.** Los estratos se unen por **puentes**, y un cuerpo se cierra sobre
   sí mismo por **lazos** — una rama que sale y vuelve al tronco. Ni una cosa ni la
   otra tapa nada: suma. Y lo que queda encerrado es el ojo. **El ojo no se dibuja,
   se deja.**
4. **MUÑONES.** Ramas cortas que salen y mueren a corte vivo, oblicuo. No cierran
   nada: rompen la silueta. Un cuerpo sin muñones se lee como un tubo.
5. **GRAVEDAD.** El peso es asimétrico y hay una **reserva**: una esquina por la que
   no pasa nada, y por la que se lee todo lo demás. Chillida titula *Gravitaciones*
   a una serie entera; el peso cae hacia un lado y la hoja se lee por lo que queda
   libre.

Y una regla de método, heredada tal cual de TRZS: el tipo **declara** cuántos ojos
y cuánta mancha quiere, y luego se **comprueba sobre el resultado**. *Declarar sin
comprobar es lo que ya falló con las familias de TRZS.* Aquí importa más que allí,
porque el ojo declarado y el ojo medido no son el mismo: la masa engorda y se come
sus propios huecos. Lo que cuenta es el medido.

## Los cuatro tipos

| tipo         | peso | estratos | puentes | lazos | ojos medidos | mancha    |
|--------------|------|----------|---------|-------|--------------|-----------|
| `estrato`    | 22%  | 1–2      | 0       | 1–2   | 0–2          | 5–22%     |
| `soldado`    | 42%  | 2–3      | 1–3     | 1–3   | 1–4          | 10–32%    |
| `ramificado` | 24%  | 2–3      | 0–1     | 0–1   | 0–1          | 8–28%     |
| `isla`       | 12%  | 3–4      | 2–4     | 3–6   | 3–12         | 24–46%    |

`soldado` es el centro de la familia. `isla` es rara a propósito: la masa asedia el
suelo hasta que el vacío queda en minoría y figura y fondo se cambian el sitio.

## Lo que se hereda y lo que se abandona

**De TRZS se conserva** el esqueleto que recorre el marco, los remates a corte vivo
(`lineCap` a hueso), el mapa de vacíos por campo de distancias e inundación desde
el borde —el mismo con el que TRZS encuentra los ojos donde pone sus discos— y la
doctrina de medir en vez de suponer.

**Se abandona, y es la mitad del código de TRZS:** el diagrama de nudo, el plan de
secciones, el orden de pintado, el punzón y los detectores del halo. Sin
encima/debajo no hay nada que proteger, así que el cuerpo puede cruzarse consigo
mismo cuantas veces quiera: se rellena. **Una sola llamada a `fill()`.** La
soldadura no se dibuja — es la consecuencia de que todo esté en el mismo trazado.

`algo.js` son 925 líneas frente a las 2.344 de TRZS, y de esas 925 buena parte son
las notas de por qué cada número es el que es. Toda la complejidad que TRZS gasta en
la profundidad, EVOL la gasta en el contorno y en el vacío.

**Lo nuevo** es la anchura modulada, que es lo que obliga a construir el cuerpo como
polígono en vez de trazarlo: un cuadrilátero por tramo, con los dos vértices del
corte compartidos por los tramos vecinos, e inglete topado a 2,4. Que todos los
cuadriláteros salgan con la misma orientación no es un detalle — con `nonzero`, dos
orientaciones mezcladas se anularían y aparecería un agujero justo donde la masa es
más espesa. Está comprobado sobre la fórmula: el área con signo de `[aI, bI, bD, aD]`
sale negativa vaya el tramo en el sentido que vaya, porque izquierda y derecha se
definen con la normal, que gira con el tramo.

## Lo que costó, y por qué está escrito en el código

Nueve pasadas mirando el grid. Cada número del `algo.js` que parece arbitrario
tiene detrás una versión que se veía peor, y está anotado ahí:

- **Diente de sierra.** La `y` como tirada por vértice da ruido. Va por **rachas**
  de pendiente que se mantienen y se rompen, igual que TRZS curva por tramos y no
  por vértice.
- **Cordillera.** Con la pendiente uniforme salían diagonales de todas las
  inclinaciones a la vez, que promedian a montaña. Es **bimodal**: una racha va
  casi plana (58%) o va fuerte, y no hay término medio. De ahí los ángulos casi
  rectos.
- **Trozos soldados.** Dejando que un cuerpo recorriera la escala entera (×15 de
  golpe) la masa dejaba de leerse como un cuerpo. Cada estrato se mueve en una
  **ventana de tres niveles** y la escala completa se reparte **entre** estratos.
  El ×27 está entre la masa protagonista y sus ecos, no dentro de una.
- **Papel pintado.** Sin **jerarquía**, tres estratos del mismo peso y ningún sitio
  donde mirar. Uno es protagonista y se lleva dos de cada tres lazos y muñones.
- **Gusanos.** Con los ecos cayendo al nivel 1, bandas de 6 px cruzando la hoja.
  Los ecos bajan uno o dos niveles, nunca al suelo de la escala.
- **Terreno.** El margen se medía contra el eje, así que un cuerpo gordo sacaba
  media anchura fuera y tocaba el borde de abajo: eso deja de ser una masa y se
  vuelve la silueta de un monte, con el suelo convertido en cielo. Se mide contra
  el **borde** del cuerpo.
- **Costa.** El pasillo por el que vagabundea un cuerpo tiene que ser bastante más
  ancho que el cuerpo. Con amplitud 0,55 el pasillo salía de 0,22 H y la masa gorda
  mide 0,15: no cabía el gesto y la masa se aplanaba.
- **Lentejas.** El arco de un lazo medido en anchuras del tronco dejaba el hueco en
  negativo. Ahora **se deduce**: media anchura del tronco + media de la rama + el
  hueco que se quiere ver. El hueco es un dato de la obra, no un resto.
- **Pórtico.** Dos puentes verticales entre los mismos estratos leen como dos
  pilares y un dintel. El puente sale **oblicuo**.
- **Antenas.** Los muñones finos y largos son pelos pegados al dibujo. Gordos,
  cortos, y solo desde masa: los que salen de un vértice de nivel 0 o 1 se
  descartan.
- **Arañazo.** Una masa leve invertida no es un negativo, es una raya en una
  plancha. Por debajo del 18% de mancha la inversión **se cancela** — decidido
  después de medir, como los acoplamientos de ECLPS, así que corrige el color sin
  mover el dibujo.

## Color: dos, y se renuncia al resto

Las paletas de hoks son listas planas: no declaran suelo ni tinta. EVOL necesita
**dos** colores y renuncia a los demás. Es una decisión, no una limitación — un
cuerpo de tres colores deja de ser un cuerpo.

La pareja se elige por **distancia de color**, no por luminancia: con luminancia,
las series Itten (cuatro colores entre 0,31 y 0,44 de luma) daban rojo sobre rojo,
porque son contrastes de **tono** y ahí el ojo lee la figura perfectamente aunque el
valor sea el mismo. Elegido el par, la luminancia decide quién es suelo.

Y **el papel**: elegir el par más distante lleva siempre al blanco, y el blanco no
es el único suelo posible. Si la paleta tiene un tono medio y cálido que aguante el
contraste, se usa la mitad de las veces. Sobre papel crudo la masa pesa distinto,
porque el suelo deja de ser ausencia de tinta y se vuelve material. No es un ajuste
del laboratorio: es qué papel se compra.

Dos tintas —un estrato entero en otro color— existen y son el 4% de las piezas.

## Medido

400 tiradas en cuadrado, sobre las 15 paletas activas:

```
tipo        soldado 42%  ramificado 24%  estrato 22%  isla 12%
ojos        media 2,1 · p50 2 · p90 4 · max 12
            0:14% 1:32% 2:23% 3:13% 4:8% 5-7:7% 8+:3%
mancha      p10 16,1%  p50 24,0%  p90 31,2%  max 43,9%
modulación  2:6% 3:6% 4:13% 5:27% 6:49%   (niveles recorridos por la pieza)
falta = 0   99,8% de las piezas cumplen lo que su tipo declara
papel       crudo 25%  ·  invertida 14%  ·  dos tintas 4%
overall     common 40%  uncommon 39%  rare 10%  superrare 5%  legendary 6%
ms          p50 67  p90 78  max 109   (760 px, incluido el grano)
```

**Impresión.** Verificado que la composición no depende de la resolución: el mismo
seed a 760 px de vista previa y a 300 dpi da el **mismo** tipo, los mismos estratos,
el mismo número de ojos y la misma mancha con una décima de margen — en A3 cuadrado
(3508², 788 ms), A3 horizontal (4961×3508, 1,3 s) y A1 horizontal (9933×7016,
69,7 Mpx, 6,0 s). Lo que se ve es lo que se imprime. El coste a A1 es del grano,
que es por píxel; el dibujo es vectorial.

Los cortes de los traits salen de esa tabla, no de la intuición. El primero que se
puso —«desbocado» a partir de 3 niveles— ponía la misma etiqueta al 88% de las
piezas: un rasgo que dice lo mismo casi siempre no es un rasgo, y encima arrastraba
la rareza global de la familia entera.

## Decisiones abiertas

- **El nombre.** `EVOL` es de trabajo. Se sostiene como *evolución* —es literalmente
  la evolución de TRZS por la técnica— pero rompe la convención de la casa, que
  aprieta las vocales (`plls`, `krrtk`, `trzs`, `eclps`). Si se queda, el subtítulo
  es *hutsunea*.
- **El formato vertical.** La referencia de la que sale esta obra es un pliego
  **vertical**: bandas cortas con mucho aire arriba y abajo, que es lo que deja
  existir la reserva. El motor no lo ofrece —lo quitó a propósito, porque en las
  obras de retículo vertical y horizontal son la misma obra girada— y volver a
  ponerlo no es gratis: `nominalAspect` mide `W/min(W,H)`, que da 1,0 tanto en
  cuadrado como en vertical, así que no sabría distinguirlos, y EVOL lee la
  proporción para decidir cuántos estratos caben. Hoy va en `square` (lo más cercano
  a la referencia) y `horizontal` (que resulta que le sienta muy bien). **Queda
  apuntado como decisión del autor, no resuelto por lo bajo.**
- **Y la de verdad:** si esto merece página. Eso se decide en el grid, no aquí.

## Usarla

```bash
python -m http.server      # → http://localhost:8000/sketches/evol/
```

No aparece en el desplegable *Work* del laboratorio, porque ese desplegable lista
las familias activas de `works.json` y EVOL no está ahí. Se llega por URL, que es
lo correcto para una propuesta: `../evol/`. Sí está en `GRADUATED`, así que un lote
que la mezcle con otras obras pinta sus miniaturas.

Teclas y mandos, los de siempre (`espacio`, `←`/`→`, `g`, `a`, `s`). Los propios:
tipo, estratos, puentes, lazos, muñones, escala del cuerpo y gravedad.

**Aquí no hay botón de girar la vista**, y es una decisión. En las obras de retículo
vertical y horizontal son la misma obra girada, así que girar sirve para juzgarla de
pie. En EVOL los estratos **eligen** una dirección: girar daría estratos verticales,
que no son la obra. Se juzgaría lo que no existe.
