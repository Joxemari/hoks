# ptzd/verificacion — lo que la familia tiene que contestar igual

**No se publica.** Vive aquí por lo mismo que `trzs/verificacion/` y que
`ptzd/entrenamiento/`: es instrumento, no obra. La web no lo enlaza, no aparece
en el desplegable del laboratorio y no escribe nada en `data/`.

```bash
python -m http.server    # → http://localhost:8000/sketches/ptzd/verificacion/
```

Con `?auto=1&n=300` arranca solo, que es como se mide de verdad: un navegador
sin cabeza y el DOM volcado a un fichero.

```bash
chrome --headless --virtual-time-budget=800000 \
  --dump-dom "http://localhost:8000/sketches/ptzd/verificacion/?auto=1&n=300"
```

## Por qué existe

El entrenamiento mide **el gusto** y esto mide **el defecto**, que no es lo
mismo y no se sustituyen. El ojo dice «esto no» sobre cinco obras; aquí se
pregunta sobre dos mil si ese «esto» ha dejado de pasar — y sobre todo, si
al arreglarlo se ha roto otra cosa. Las tres veces que se ha tocado la gramática
de PTZD, lo que costó no fue el arreglo: fue enterarse de lo que el arreglo
había estropeado. La guarda que se comió las cuñas dejó al 20% de las obras sin
llegar a los cortes de su tipo, y eso no se ve mirando obras: se ve contando.

## Las cuatro preguntas

### 1 · Cuñas — ¿queda algún triángulo, alguna tira, algún pincho?

Se mide **sobre el píxel** y no sobre el polígono, y esa decisión es la mitad
del instrumento. La imagen ya pintada es la verdad: ahí el repaso del contorno
—que es lo que abre el hueco— ya se ha comido la punta de la cuña y la aguja
invisible donde se cruzan dos cortes, y lo que queda es exactamente lo que se
ve. Medir el polígono daba cuatro veces más defectos que los que existían, y
además se dejaba fuera algunos que sí.

La medida: en un punto del borde de la mancha, **la fracción de un disco que es
tinta vale el ángulo** — media en una recta, un cuarto en una esquina, un octavo
en una cuña de 45°. Y una tira más fina que el disco da lo mismo que una cuña,
que es lo que hace que un defecto y otro se cuenten juntos: los dos son falta de
materia. Tres radios (3,5%, 5,5% y 8,5% del lado del bloque) y se guarda el peor.

Por debajo de **62°** hay triángulo. El listón está en el 2% de las obras.

### 2 · Reparto — ¿sale lo que la gramática declara?

Interesa sobre todo **cortos**: obras que no llegan a los cortes de su tipo. Un
`astillado` con cuatro placas no es un astillado, es una etiqueta que miente —
y la rareza se calcula sobre la etiqueta. El listón está en el 3%.

Lo demás son las frecuencias medidas, que **hay que copiar al algoritmo** cada
vez que se toque la gramática: las tablas `F_PIEZAS`, `F_SAJA`, `F_FALTA`,
`F_ESCAL`, `F_TINTA`, la `p` de cada `GUBIAS` y el `P_MAX`. La última línea da
los umbrales de `rarComb` en los percentiles que la casa reparte
(≈40/35/15/7/3), listos para pegar. Es circular a propósito y hay que darle dos
vueltas: al cambiar las tablas cambia la cifra sobre la que se calculan los
percentiles.

⚠ Sin catálogo de paletas esta pregunta no vale. `HOKS.loadPalettes()` cae al
catálogo mínimo embebido cuando no hay red, y con una sola paleta el reparto de
tintas sale «1 al 100%» y la rareza se va al garete — parecería un dato y sería
el *fallback*. La página busca entonces el `data/` del propio repositorio, y si
tampoco lo encuentra **lo dice en voz alta**.

### 3 · Huella — ¿da el mismo seed la misma obra a cualquier tamaño?

**Medir elige.** Los mínimos de esta familia descartan candidatos, así que un
algoritmo que decidiera en píxeles daría una obra distinta en la vista previa y
en el A1 — la *deriva* que EVOL ya se comió. Se compara la huella de cada obra a
760, 2400 y 4200 px y en los tres formatos: tiene que salir **cero**, no «pocos».

### 4 · La mancha — lo que se lee de la imagen entera

Tres cosas que no se ven mirando un borde:

- **Soldadura.** Cada placa repasa su propio contorno con el color del suelo, así
  que dos placas **no pueden tocarse nunca**. Las manchas conectadas de la imagen
  tienen que ser tantas como placas; si son menos, dos se han soldado y ahí el
  hueco se ha cerrado. Es un fallo.
- **Recorte.** El bloque nace con holgura contra el pliego, pero la deriva empuja
  hacia fuera. Si hay tinta en el borde del lienzo, la obra está cortada. Es un
  fallo.
- **Flequillo.** Cuántas placas están **en el suelo de carne**, medido por el radio
  del mayor círculo que cabe en cada una. La regla 11 le pone suelo a cada tira
  por separado pero **no cuenta cuántas van juntas**, y tres seguidas del ancho
  mínimo se leen como un peine. Esto **no es un fallo**: es un número para
  decidir, y por eso se informa y no se juzga — la 2ª vuelta del entrenamiento
  pidió más estructura, no menos, así que dónde está el límite es decisión de
  autor y no de la batería.

## Lo que hay que hacer si sale MAL

En este orden, porque el orden es el que evita perder el tiempo:

1. **Huella distinta de cero** → hay una decisión tomada en píxeles. Se arregla
   antes que nada; con la huella suelta, las demás medidas no son reproducibles.
2. **Cortos por encima del 3%** → mirar el desglose por gubia. Casi siempre es
   que la gubia y el número de cortes se han desacoplado: con un filo gordo no
   caben nueve placas en el mismo taco (`TIPOS[].gubias` y `TECHO`).
3. **Cuñas por encima del 2%** → mirar de dónde salen antes de tocar `GROSOR_*`.
   Las tres veces que ha pasado, la causa estaba fuera de la partición: en el
   contorno del taco, en la retirada del canto o en el escalón al bies.
4. **Soldadura o recorte** → no ha pasado nunca, y si pasa no es un ajuste: es que
   algo dibuja fuera de la partición o que la deriva ha dejado de tener tope.
