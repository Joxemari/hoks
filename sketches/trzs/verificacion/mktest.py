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
    # Se ancla a UNA LÍNEA, la del trazo del cuerpo, y a nada de su alrededor.
    # Ha roto tres veces por pedir contexto: primero el color cambió, luego la
    # anchura pasó a poder ser función, y luego apareció el remate entre el
    # trazo y la llave de cierre. La línea es única en el fichero; lo que la
    # rodea no es asunto del control.
    m2 = re.search(r'^( *)trazarTramo\(ctx, mapped, acum, iniC, finC, (?P<w>.+), (?P<paint>[^,]+), cfg\);$',
                   src, re.M)
    assert m2, 'no encuentro el trazo del cuerpo en renderComposition'
    linea, sangria, ancho, color = m2.group(0), m2.group(1), m2.group('w'), m2.group('paint')
    src = src.replace(linea, linea + """
%s_rotoRep.push([iniC, finC, %s, %s]);   // ROTO A PROPOSITO""" % (sangria, ancho, color))
    # y el repintado de media seccion, justo antes de cerrar el bucle de orden
    cierre = "    if (cfg.ends === \"redondos\" || cfg.ends === \"inglete\") {"
    if cierre not in src:
        cierre = "    if (cfg.dots === \"encima\")"
    assert cierre in src, 'no encuentro donde vaciar _rotoRep'
    src = src.replace(cierre, """    for (const [i0, f0, w0, t0] of _rotoRep)
      trazarTramo(ctx, mapped, acum, i0, (i0 + f0) / 2, w0, t0, cfg);
    _rotoRep.length = 0;
""" + cierre, 1)
    src = src.replace("  let rng = new E.Rng(0);", "  const _rotoRep = [];\n  let rng = new E.Rng(0);")
elif roto == 'margen':
    # Margen NEGATIVO: con 0 la cinta sólo roza el borde de vez en cuando y el
    # control salía flojo (2 de 30). Un control flojo no respalda un cero.
    a = "    margen:       0.022,"
    assert a in src
    src = src.replace(a, "    margen:       -0.06,      // ROTO A PROPOSITO")
elif roto == 'ojo':
    # Por patron, no literal: esta linea ya ha cambiado dos veces (el aire
    # primero, el temblor del disco despues) y cada vez rompio el banco entero.
    # Lo que importa es que el radio del ojo deja de descontar el aire.
    m4 = re.search(r'^( *)const rad = .*D\[mejor\].*aire.*$', src, re.M)
    assert m4, 'no encuentro el radio del ojo'
    src = src.replace(m4.group(0),
                      m4.group(1) + 'const rad = D[mejor];   // ROTO A PROPOSITO: sin aire')
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
elif roto == 'cara':
    # Quita la incisión de la CARA del cabo: el halo del cuerpo se traza a
    # hueso, así que sin ese disco el final de la cinta es el único filo de la
    # obra sin corte y se suelda a lo que tenga delante. Es el control del
    # bloque de remates: con la incisión puesta, el control de `remate`
    # (holgura 0) ya casi no dispara —el disco corta igual— y un cero sin
    # control no significa nada.
    m3 = re.search(r'^( *)ctx\.beginPath\(\); ctx\.arc\(p\.x, p\.y, wR / 2 \+ gap, 0, TWO_PI\); ctx\.fill\(\);$',
                   src, re.M)
    assert m3, 'no encuentro el disco de la incision del cabo'
    src = src.replace(m3.group(0), m3.group(1) + '/* ROTO A PROPOSITO: sin incision en la cara del cabo */')
    # Y ademas se abre la holgura, como en `remate`: con la holgura normal los
    # cabos casi nunca caen contra otra hebra, asi que quitar el disco solo no
    # dispara. Roto = el cabo puede caer donde sea Y sin corte en la cara.
    for a, b in [("    remateMin:    1.0,         // holgura",
                  "    remateMin:    0,         // ROTO A PROPOSITO // holgura"),
                 ("    reintentos:   5,",
                  "    reintentos:   0,           // ROTO A PROPOSITO")]:
        assert a in src
        src = src.replace(a, b)
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
