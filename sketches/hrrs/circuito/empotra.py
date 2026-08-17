"""EMPOTRA LAS FUENTES DENTRO DE LOS ARTEFACTOS.

Un artefacto es una página suelta —no puede pedir un archivo— así que el generador tiene que ir
dentro. Eso es una copia, y una copia a mano se desincroniza el primer día: la que había dentro de
`fisica.html` seguía con el cuerpo tres veces más gordo que el del archivo, así que la página
enseñaba una física y el generador hacía otra. Con esto la copia se rehace de una orden.

    python3 empotra.py            (y luego se republican las páginas que haya tocado)
"""
import os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))

# qué va dentro de qué. La marca es la misma en todas: /* ⟦fuente⟧ */ … /* ⟦/fuente⟧ */
EMPOTRES = [
    ('trazo.js', 'fisica.html'),
    ('gen.js',   'pares.html'),
]


def limpia(src):
    """lo que no puede viajar a una página: el 'use strict' —que aplicaría a todo el <script>—
    y la exportación de Node."""
    src = src.replace("'use strict';\n", '')
    return re.sub(r"\nif \(typeof module.*\n", '\n', src)


def uno(fuente, pagina):
    A, B = '/* ⟦%s⟧ */' % fuente, '/* ⟦/%s⟧ */' % fuente
    src = limpia(open(os.path.join(AQUI, fuente), encoding='utf-8').read())
    ruta = os.path.join(AQUI, pagina)
    pag = open(ruta, encoding='utf-8').read()
    if A not in pag or B not in pag:
        print('  %-12s → %-14s SIN MARCAS %s … %s' % (fuente, pagina, A, B))
        return 1
    i, j = pag.index(A) + len(A), pag.index(B)
    nuevo = pag[:i] + '\n' + src.rstrip() + '\n' + pag[j:]
    if nuevo == pag:
        print('  %-12s → %-14s ya estaba al día' % (fuente, pagina))
        return 0
    open(ruta, 'w', encoding='utf-8').write(nuevo)
    print('  %-12s → %-14s %d líneas' % (fuente, pagina, src.count('\n')))
    return 0


if __name__ == '__main__':
    print('empotrando:')
    sys.exit(sum(uno(f, p) for f, p in EMPOTRES))
