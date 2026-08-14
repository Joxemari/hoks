import sys, os, re

# Version de PRUEBA del algoritmo: es EL FICHERO QUE SE PUBLICA, tal cual, con
# como mucho UNA averia concreta. Probar una copia adaptada seria probar otra
# cosa — es la regla de trzs/verificacion y esta aqui por lo mismo.
#
# HRRS no necesita exponer tripas: `render` ya devuelve `res.geo` (las cintas, W,
# g, D y la transformada) y `res.rol` (los dos colores), asi que los detectores
# miden por el contrato publico. Un detector que necesita una puerta trasera mide
# algo que la obra no promete.
src = open(os.path.join(os.path.dirname(__file__), '..', 'algo.js')).read()

roto = sys.argv[1] if len(sys.argv) > 1 else None

if roto == 'duro':
    # LA RESTRICCION DURA, BAJADA. Con 0,72·D los trazos se acercan mas que la
    # anchura, asi que las tintas se solapan y el canal desaparece. Control de
    # `canal` y de `toque`.
    a = "    for (const t of ctx.trazos) if (distTrazos(segs, t.segs) < ctx.D - 1e-9) return false;"
    assert a in src, 'no encuentro la restriccion dura entre trazos'
    src = src.replace(a, "    for (const t of ctx.trazos) if (distTrazos(segs, t.segs) < ctx.D * 0.72) return false;   // ROTO A PROPOSITO")

elif roto == 'corta':
    # EL TRAZO SE CORTA A SI MISMO. Un trazo con giros cerrados puede cruzarse, y
    # entonces se toca consigo mismo — que tambien esta prohibido. Control de
    # `canal` por el otro lado.
    a = "    if (seCorta(segs, ctx.D)) return false;"
    assert a in src, 'no encuentro la comprobacion de auto-corte'
    src = src.replace(a, "    // ROTO A PROPOSITO: sin comprobar el auto-corte")

elif roto == 'miter':
    # EL BISEL, DESHECHO. Comprueba una AFIRMACION del algo.js: que el bisel es lo
    # que hace suficiente la distancia minima.
    a = "    ctx.lineJoin = 'bevel';"
    assert a in src, 'no encuentro el lineJoin'
    src = src.replace(a, "    ctx.lineJoin = 'miter'; ctx.miterLimit = 10;   // ROTO A PROPOSITO")

elif roto == 'margen':
    a = "  const MARGEN = 0.055;"
    assert a in src, 'no encuentro MARGEN'
    src = src.replace(a, "  const MARGEN = -0.045;   // ROTO A PROPOSITO")

elif roto == 'cabo':
    # El cabo redondo NO rompe el canal (cae dentro de la suma de Minkowski): es
    # regla de GRAMATICA, no de seguridad. Control del bloque del remate.
    a = "    ctx.lineCap = 'butt';"
    assert a in src, 'no encuentro el lineCap'
    src = src.replace(a, "    ctx.lineCap = 'round';   // ROTO A PROPOSITO")

elif roto == 'garabato':
    # EL GARABATO: de uno a cinco quiebros pasa a diez o veinte. Es el error que
    # costo dos versiones enteras —el trazo deja de ser largo y simple y se vuelve
    # un paseo— y es el control del bloque de `obra`.
    a = "  const QUIEBROS = [1, 5];"
    assert a in src, 'no encuentro QUIEBROS'
    src = src.replace(a, "  const QUIEBROS = [11, 20];   // ROTO A PROPOSITO")

elif roto == 'pizca':
    # SIN SUELO DE LONGITUD: vuelven las pizcas del `paralelo` sobre un trozo muy
    # corto, que es el confeti de la primera version.
    a = "        if (largoDe(pts) < ctx.S * LARGO_MIN) continue;"
    assert a in src, 'no encuentro el suelo de longitud'
    src = src.replace(a, "        // ROTO A PROPOSITO: sin suelo de longitud")
    src = src.replace("      const a = rng.range(0, 0.45), b = a + rng.range(0.48, 1 - a);",
                      "      const a = rng.range(0, 0.45), b = a + rng.range(0.03, 0.10);   // ROTO A PROPOSITO")

elif roto:
    raise SystemExit('averia desconocida: ' + roto)

open(sys.argv[2], 'w').write(src)
print('escrito', sys.argv[2], '(' + (roto or 'sano') + ')')
