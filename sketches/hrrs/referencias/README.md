# Las referencias

> **r4 NO ES VÁLIDA para la separación de bandas.** El autor: «r4 es un error, nunca debe
> fundir». Y al fundirse corrompió su propia geometría trazada —`cuerda` 0,23 contra 0,59–0,84
> de las otras cinco, cinco cabos tocando el borde contra cero o uno—, así que **sus números
> quedan fuera de los objetivos**: ver `sketches/hrrs/circuito/README.md`.

Aquí van las imágenes de referencia contra las que se juzga cada iteración. **No se
commitean**: son obra de terceros y este repo es público —GitHub Pages sirve la
raíz—, así que el `.gitignore` de esta carpeta lo deja todo fuera menos estos dos
ficheros. Quien trabaje aquí las deja en local.

## El ejercicio, y es el que pide el autor

> *«Cuando hagas una iteración, compárala contra ésas y con ello ve mejorando, igual
> que hemos hecho en PTZD.»*

No es una recomendación de estilo: es **el método**. Mirar la hoja sola engaña —todo
parece razonable— y sólo puesta al lado de la fuente se ven las diferencias, que
además resultan ser medibles casi siempre. De las siete vueltas que lleva esta
familia, **todas menos una** salieron de poner las dos cosas juntas y contar:

- el canal, medido con regla: 0,07–0,14 de la anchura, y yo tenía 0,17–0,26;
- los quiebros por trazo: ocho en el grabado, y yo tenía «de uno a cinco»;
- la anchura de banda: 1/8 del pliego en el cartel, y yo tenía 1/17 a 1/33;
- el número de trazos: ninguna referencia pasa de ocho, y yo dibujaba hasta catorce.

Ninguna de esas cuatro se ve razonando. Las cuatro se ven con una regla encima.

## Medir, que es lo que de verdad decide

```
python3 referencias/traza.py referencias/ref01.webp        # una referencia
node verificacion/hoja.js /tmp/x.png 8 4 900               # y obra propia al lado
python3 referencias/traza.py /tmp/mia.png                  # medida con la MISMA regla
```

`traza.py` saca del píxel el esqueleto, la anchura de banda (moda del doble de la
transformada de distancia, no la media: la media la hunden los cabos), el canal, los
cabos y los nudos. Se le puede pasar una obra propia, y ahí está el valor: la
comparación deja de ser de impresiones.

Dos avisos sobre sus números:

- El **canal** se mide como suelo ESTRECHO, no como suelo encerrado. La primera
  versión buscaba componentes de fondo que no tocaran el borde y daba cero en cuatro
  de las seis — porque cuando las dos bandas de un canal se salen del cuadro, el canal
  desemboca fuera. Justo las referencias con más travesías eran las que no medían.
- Las cifras absolutas llevan sesgo del umbral y de la resolución. Lo que vale es la
  **diferencia** entre las dos columnas, medida igual.

## Cómo

```
node verificacion/hoja.js salida.png 12 4 380      # doce obras, cuatro por fila
SEED0=900 node verificacion/hoja.js otra.png 12 4 380
```

Y luego se mira **al lado** de las referencias, no después. Lo que no se pueda
señalar con el dedo en las dos imágenes, no está visto.

## Lo que queda por mirar, de lo ya nombrado

El análisis de `../README.md` tiene una tabla de nueve ejes. Estos salieron de ahí y
tardaron vueltas en implementarse porque estaban escritos y nadie los comprobaba
contra la hoja:

- **patas** (refs 1, 2, 6) — puestas en la séptima vuelta.
- **travesía** (ref 5) — puesta en la séptima; el análisis la había dado por
  imposible («el margen en los cuatro lados la prohíbe»), y con el sangrado de verdad
  ya no lo era.
- **ortogonal** (ref 5) — puesta en la séptima.
- **peine** (ref 6, 4+ paralelos engranados) — **sin hacer**.
- **liso** (refs 3, 4, curva en vez de quiebro) — decidido que no entra: sería otra
  familia. Está en la tabla porque existe en la fuente, no porque se proponga.
