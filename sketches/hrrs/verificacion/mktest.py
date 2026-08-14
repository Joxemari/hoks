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
    # LA RESTRICCION DURA, BAJADA. Con la distancia minima en 0,72·D = 0,86·W los
    # ejes pueden acercarse mas que la anchura, asi que las tintas se solapan y el
    # canal desaparece. Es el control de `toque` y de `canal`: si con esto no
    # disparan, su cero no dice nada.
    a = "      if (segSegDist(ax, ay, bx, by, s.ax, s.ay, s.bx, s.by) < D - TOL) return false;"
    assert a in src, 'no encuentro la comprobacion de la restriccion dura'
    src = src.replace(a, "      if (segSegDist(ax, ay, bx, by, s.ax, s.ay, s.bx, s.by) < D * 0.72) return false;   // ROTO A PROPOSITO")

elif roto == 'miter':
    # EL BISEL, DESHECHO. Vuelve a `miter`, que es lo que parecia natural y es
    # justo lo que rompe la suficiencia de la regla 3: el pico de un giro sale
    # W/2/sen(alfa) del vertice y la regla solo garantiza W/2 + g de aire. Este
    # control no comprueba un detector: comprueba una AFIRMACION del algo.js.
    a = "    ctx.lineJoin = 'bevel';"
    assert a in src, 'no encuentro el lineJoin'
    src = src.replace(a, "    ctx.lineJoin = 'miter'; ctx.miterLimit = 10;   // ROTO A PROPOSITO")

elif roto == 'margen':
    # Margen NEGATIVO: la cinta se sale del cuadro. Es el control de `margen`.
    a = "  const MARGEN = 0.055;                    // × lado corto, al BORDE de la cinta"
    assert a in src, 'no encuentro MARGEN'
    src = src.replace(a, "  const MARGEN = -0.045;   // ROTO A PROPOSITO")

elif roto == 'rejilla':
    # RECORRIDO EN REJILLA: angulos exactos de 90, sin quiebro y sin variacion de
    # longitud. Es el control de `ojos` (regla 6: ojos todos del mismo tamano es un
    # laberinto) y de `cadencia`.
    for a, b in [("  const P_QUIEBRO = 0.34;", "  const P_QUIEBRO = 0;   // ROTO A PROPOSITO"),
                 ("  const GIRO_RECTO = [70, 112];            // la moda del recinto",
                  "  const GIRO_RECTO = [90, 90];   // ROTO A PROPOSITO"),
                 ("  const GIRO_BIES = [32, 152];             // la del corte al bies, ancha",
                  "  const GIRO_BIES = [90, 90];   // ROTO A PROPOSITO"),
                 ("  const LARGO_JIT = [0.70, 1.30];          // variación dentro de la racha",
                  "  const LARGO_JIT = [1, 1];   // ROTO A PROPOSITO"),
                 ("  const RACHA_L = [2, 3, 3, 4, 5];", "  const RACHA_L = [999];   // ROTO A PROPOSITO"),
                 # Sin esto NO es una rejilla y el control no dispara: medido, CV de
                 # 0,501 donde lo sano da 0,60. Las tres longitudes alternativas y
                 # la vuelta del pliegue seguian variando el tramo ellas solas, asi
                 # que la averia no llegaba a producir el defecto que dice producir.
                 ("  const LARGO_ALT = [1, 0.55, 0.32];", "  const LARGO_ALT = [1];   // ROTO A PROPOSITO"),
                 ("  const VUELTA = [0.55, 1.15];", "  const VUELTA = [1, 1];   // ROTO A PROPOSITO"),
                 # Y la escala de racha, FIJA. Cada cinta se tiraba la suya de
                 # [0,07 · 0,30], asi que con doce cintas las longitudes seguian
                 # variando ENTRE cintas y el CV se quedaba en 0,42 (sano 0,60). La
                 # averia tenia que llegar hasta aqui para producir un muestrario.
                 ("  const LARGO = [0.07, 0.30];               // escala de racha, × lado corto",
                  "  const LARGO = [0.16, 0.16];   // ROTO A PROPOSITO")]:
        assert a in src, a
        src = src.replace(a, b)

elif roto == 'cabo':
    # EL CABO REDONDO. `butt` es la regla 5 (el remate es el corte de la gubia);
    # con `round` el cabo se pasa W/2 del ultimo vertice, y ese medio circulo NO
    # esta cubierto por la restriccion dura, que mide contra el eje hasta el
    # vertice y no mas alla. Control de `toque` por el otro extremo.
    a = "    ctx.lineCap = 'butt';"
    assert a in src, 'no encuentro el lineCap'
    src = src.replace(a, "    ctx.lineCap = 'round';   // ROTO A PROPOSITO")

elif roto == 'vecino':
    # LA EXCLUSION, DEMASIADO ANCHA. Excluye de la comprobacion no solo el tramo
    # anterior sino los DOS anteriores. Es el fallo mas facil de cometer al
    # escribir `cabe` —"los de al lado no cuentan"— y produce toques reales en los
    # pliegues, donde i e i+2 son exactamente el par que hay que vigilar.
    a = "      if (s.cinta === cinta && s.idx === idx - 1) continue;"
    assert a in src, 'no encuentro la exclusion del vecino'
    src = src.replace(a, "      if (s.cinta === cinta && s.idx >= idx - 2) continue;   // ROTO A PROPOSITO")

elif roto == 'otracinta':
    # SOLO SE ESQUIVA A SI MISMA. Quita la comprobacion contra las OTRAS cintas,
    # que es el fallo que la regla 3 nombra explicitamente ("el acompanamiento no
    # distingue si la voz es la misma"). Con una cinta no se nota; con doce, si.
    a = "      if (s.cinta === cinta && s.idx === idx - 1) continue;"
    assert a in src, 'no encuentro la exclusion del vecino'
    src = src.replace(a, "      if (s.cinta !== cinta) continue;   // ROTO A PROPOSITO\n      if (s.cinta === cinta && s.idx === idx - 1) continue;")

elif roto:
    raise SystemExit('averia desconocida: ' + roto)

open(sys.argv[2], 'w').write(src)
print('escrito', sys.argv[2], '(' + (roto or 'sano') + ')')
