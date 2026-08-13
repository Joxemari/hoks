import sys, re
# Version de PRUEBA del algoritmo: es el fichero que se publica MAS UNA LINEA
# que expone las tripas. Probar otra cosa que no sea el artefacto real es
# probar otra cosa.
src = open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','algo.js')).read()
cierre = "  (global.HOKS = global.HOKS || {}).TRZS = { render, traits, BG_GRADIENT, REF };"
assert cierre in src
expo = cierre + """
  global.__TRZS = { generate, renderComposition, arcosDe, arcoDeParam, puntoEnArco,
                    trazarTramo, curvaDensa, escalaDe, mapToSquare, drawDots,
                    pointSegDist, V, PV, TIPOS, DEF,
                    setDensa: (v) => { _densa = v; } };"""
src = src.replace(cierre, expo)

roto = sys.argv[1] if len(sys.argv) > 1 else None
if roto == 'orden':
    a = "    const orden = comp.plano.orden;"
    assert a in src
    src = src.replace(a, "    const orden = comp.plano.orden.slice().reverse();   // ROTO A PROPOSITO")
elif roto == 'mitad':
    a = """      trazarTramo(ctx, mapped, acum, iniC, finC, width, segunda ? tinta2 : tinta, cfg);
    }
"""
    assert a in src
    src = src.replace(a, """      trazarTramo(ctx, mapped, acum, iniC, finC, width, segunda ? tinta2 : tinta, cfg);
      _rotoRep.push([iniC, finC, segunda ? tinta2 : tinta]);   // ROTO A PROPOSITO
    }
    for (const [i0, f0, t0] of _rotoRep)
      trazarTramo(ctx, mapped, acum, i0, (i0 + f0) / 2, width, t0, cfg);
    _rotoRep.length = 0;
""")
    src = src.replace("  let rng = new E.Rng(0);", "  const _rotoRep = [];\n  let rng = new E.Rng(0);")
elif roto == 'margen':
    # Margen NEGATIVO: con 0 la cinta sólo roza el borde de vez en cuando y el
    # control salía flojo (2 de 30). Un control flojo no respalda un cero.
    a = "    margen:       0.022,"
    assert a in src
    src = src.replace(a, "    margen:       -0.06,      // ROTO A PROPOSITO")
elif roto == 'ojo':
    a = "      const rad = D[mejor] - aire;"
    assert a in src
    src = src.replace(a, "      const rad = D[mejor];   // ROTO A PROPOSITO: sin aire")
elif roto == 'remate':
    # Abrir la puerta no basta: la selección puede seguir prefiriendo un tejido
    # con los remates holgados. Se abre la puerta Y se quitan los alternativos,
    # de modo que sale el primer tejido que se teja, con lo que traiga.
    a = "    remateMin:    1.0,         // holgura"
    assert a in src
    src = src.replace(a, "    remateMin:    0,         // ROTO A PROPOSITO // holgura")
    b = "    reintentos:   5,"
    assert b in src
    src = src.replace(b, "    reintentos:   0,           // ROTO A PROPOSITO")

open(sys.argv[2], 'w').write(src)
print('escrito', sys.argv[2])
