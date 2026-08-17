"""EMPOTRA `trazo.js` DENTRO DE `fisica.html`.

La página es un artefacto suelto —no puede pedir un archivo— así que el trazo tiene que ir dentro.
Eso es una copia, y una copia a mano se desincroniza el primer día: la que había dentro seguía con
el cuerpo tres veces más gordo que el del archivo, así que la página enseñaba una física y el
generador hacía otra. Con esto la copia se rehace de una orden y no hay dos fuentes que mantener.

    python3 empotra.py            (y luego se republica la página)
"""
import os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
A, B = '/* ⟦trazo.js⟧ */', '/* ⟦/trazo.js⟧ */'

src = open(os.path.join(AQUI, 'trazo.js'), encoding='utf-8').read()
src = src.replace("'use strict';\n", '')           # aplicaría a toda la página, no sólo a esto
src = re.sub(r"\nif \(typeof module.*\n", '\n', src)

pag = open(os.path.join(AQUI, 'fisica.html'), encoding='utf-8').read()
if A not in pag or B not in pag:
    sys.exit('fisica.html no tiene las marcas %s … %s' % (A, B))
i, j = pag.index(A) + len(A), pag.index(B)
nuevo = pag[:i] + '\n' + src.rstrip() + '\n' + pag[j:]
if nuevo == pag:
    print('ya estaba al día')
else:
    open(os.path.join(AQUI, 'fisica.html'), 'w', encoding='utf-8').write(nuevo)
    print('empotrado: %d líneas' % src.count('\n'))
