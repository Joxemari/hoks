import sys, re
# Version de PRUEBA del algoritmo: es el fichero que se publica MAS UNA LINEA
# que expone las tripas. Probar otra cosa que no sea el artefacto real es
# probar otra cosa.
src = open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','algo.js')).read()
# La línea de exportación se busca por patrón, no literal: lo que exporta la
# obra crece —FORMATS llegó después— y anclarse al texto exacto rompía el
# banco entero por añadir una palabra. El assert sigue: si no aparece, falla
# aquí y no a mitad de una batería.
m = re.search(r'^  \(global\.HOKS = global\.HOKS \|\| \{\}\)\.TRZS = \{[^}]*\};$', src, re.M)
assert m, 'no encuentro la exportacion de HOKS.TRZS en ../algo.js'
cierre = m.group(0)
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
    # Se ancla al trazo del CUERPO por patrón, no al texto exacto: la expresión
    # del color ha cambiado ya dos veces (tinta2 -> tintaDe(cinta)) y cada vez
    # rompía el banco entero por una palabra.
    # Ni la anchura ni el color son ya texto fijo: la anchura puede ser una
    # función (el temblor la hace variar) y el color depende de la cinta. Se
    # capturan los dos, porque anclarse al texto exacto ha roto el banco entero
    # dos veces por cambiar una palabra.
    m2 = re.search(r'^      trazarTramo\(ctx, mapped, acum, iniC, finC, (?P<w>.+), (?P<paint>[^,]+), cfg\);\n    \}\n',
                   src, re.M)
    assert m2, 'no encuentro el trazo del cuerpo en renderComposition'
    a, ancho, color = m2.group(0), m2.group('w'), m2.group('paint')
    src = src.replace(a, """      trazarTramo(ctx, mapped, acum, iniC, finC, %s, %s, cfg);
      _rotoRep.push([iniC, finC, %s, %s]);   // ROTO A PROPOSITO
    }
    for (const [i0, f0, w0, t0] of _rotoRep)
      trazarTramo(ctx, mapped, acum, i0, (i0 + f0) / 2, w0, t0, cfg);
    _rotoRep.length = 0;
""" % (ancho, color, ancho, color))
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
elif roto == 'sueloigual':
    # Fuerza el caso que pickRoles evita por contraste: la SEGUNDA cinta sale
    # exactamente del color del suelo. Sin esto no se puede comprobar que el
    # halo aparece a lo largo de todo el cuerpo, porque por la vía normal el
    # caso no se alcanza — y un arreglo que no se puede ver disparar no está
    # comprobado, está escrito.
    a = "    return { bg, fg, fg2, fg3, dot, dots };"
    assert a in src
    src = src.replace(a, "    return { bg, fg, fg2: bg, fg3, dot, dots };   // ROTO A PROPOSITO")
elif roto == 'costura':
    # El cuerpo vuelve a acabar a ras del halo, que es de donde salía la raya
    # de 1 px. Es el control del bloque de costuras: sin él, su cero no dice
    # nada. Deja el resto exactamente igual.
    a = "    const sobra = max(E.unit(S, ALTO, REF), 1);"
    assert a in src
    src = src.replace(a, "    const sobra = 0;   // ROTO A PROPOSITO")
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
