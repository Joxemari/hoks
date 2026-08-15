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
    a = "      if (distTrazos(segs, t.segs) >= ctx.D - 1e-9) continue;   // el caso corriente"
    assert a in src, 'no encuentro la restriccion dura entre trazos'
    src = src.replace(a, "      if (distTrazos(segs, t.segs) >= ctx.D * 0.72) continue;   // ROTO A PROPOSITO")

elif roto == 'corta':
    # EL TRAZO SE CORTA A SI MISMO. Un trazo con giros cerrados puede cruzarse, y
    # entonces se toca consigo mismo — que tambien esta prohibido. Control de
    # `canal` por el otro lado.
    a = "    if (seCorta(segs, ctx.D)) return false;"
    assert a in src, 'no encuentro la comprobacion de auto-corte'
    src = src.replace(a, "    // ROTO A PROPOSITO: sin comprobar el auto-corte")

elif roto == 'miter':
    # EL BISEL, DESHECHO. Comprueba una AFIRMACION del algo.js: que la tinta no se
    # sale de lo que el margen deja libre.
    #
    # Ya no es `ctx.lineJoin` ni la construccion de dos puntos por vertice: desde que
    # la esquina se RELLENA hasta la holgura, lo que sujeta la regla es esa cuenta.
    # Se rompe ahi y en un solo sitio —la holgura pasa a ser infinita— asi que la
    # esquina se llena hasta el inglete entero se coma lo que se coma. Es la misma
    # averia de siempre contada donde ahora vive.
    # OJO: hay que romper EL DIBUJO, no la cuenta. `toque.js` comprueba que la tinta
    # obedece al plan que el algoritmo DECLARA en `geo.relleno`; si se rompe la cuenta,
    # el plan roto sale declarado, la tinta lo obedece y el control no dispara —
    # medido, 1 de 28. Que el plan no se coma el canal de nadie es otra afirmacion y
    # tiene su propio control (`holgura`, sobre la geometria, en `canal.js`).
    a = "          if (r <= lim + 1e-9 && r > h[i + 1] * 1.02) {"
    assert a in src, 'no encuentro el tope del relleno de esquina'
    src = src.replace(a, "          if (r > h[i + 1] * 1.02) {   // ROTO A PROPOSITO: relleno sin tope")

elif roto == 'rendija':
    # LA RENDIJA. Control de la regla nueva: entre dos bandas el blanco es o el pelo
    # entero o nada, nunca una rendija mas fina que el pelo. Rota, un trazo que cruza
    # puede quedarse a media distancia y dejar la cuna sucia.
    a = "    if (d <= ctx.W) return false;                 // fundidos: no hay blanco"
    assert a in src, 'no encuentro la banda prohibida'
    src = src.replace(a, "    if (d <= ctx.D) return false;   // ROTO A PROPOSITO: la rendija pasa")

elif roto == 'holgura':
    # LA CUENTA DE LA HOLGURA, ROTA. Es el control de la otra mitad: que lo que el
    # algoritmo se permite rellenar nunca se coma el pelo de otro trazo. Se comprueba
    # sobre la GEOMETRIA en `canal.js`, no sobre el pixel.
    a = "        out.push(clamp(d - h0 - ctx.g, h0, techo));"
    assert a in src, 'no encuentro el calculo de la holgura'
    src = src.replace(a, "        out.push(techo);   // ROTO A PROPOSITO: sin mirar quien hay al lado")

elif roto == 'margen':
    a = "  const MARGEN = 0.055;"
    assert a in src, 'no encuentro MARGEN'
    src = src.replace(a, "  const MARGEN = -0.045;   // ROTO A PROPOSITO")

elif roto == 'cabo':
    # El cabo alargado NO rompe el canal (cae dentro de la suma de Minkowski): es
    # regla de GRAMATICA, no de seguridad. Control del bloque del remate.
    #
    # Como el bisel, ya no es propiedad del canvas: el cabo a escuadra es la cuerda
    # que cierra el poligono en el ultimo vertice. Aqui se le pone un cabo REDONDO,
    # que es media circunferencia de radio h alrededor del punto final — y por eso
    # sigue cayendo dentro de la suma de Minkowski del eje con el disco de radio h.
    # Tiene que ser redondo y no cuadrado: la esquina de un cabo cuadrado sale a
    # h*raiz(2) del extremo, o sea FUERA de esa suma, y entonces el control
    # dispararia tambien la medida de la geometria y ya no probaria lo que dice —
    # que el cabo es gramatica y no seguridad.
    a = "    ctx.moveTo(izq[0].x, izq[0].y);"
    assert a in src, 'no encuentro el cierre del contorno en banda()'
    src = src.replace(a, """    // ROTO A PROPOSITO: cabo redondo en vez de a escuadra
    { const K = 7;
      const a0 = Math.atan2(pts[0].y - pts[1].y, pts[0].x - pts[1].x);
      const a1 = Math.atan2(pts[n-1].y - pts[n-2].y, pts[n-1].x - pts[n-2].x);
      const arco = (c, ang, r) => { const o = [];
        for (let k = 1; k < K; k++) { const t2 = ang - Math.PI / 2 + Math.PI * k / K;
          o.push({ x: c.x + Math.cos(t2) * r, y: c.y + Math.sin(t2) * r }); }
        return o; };
      izq.unshift.apply(izq, arco(pts[0], a0, h[0]).reverse());
      der.push.apply(der, arco(pts[n-1], a1, h[n-1])); }
    ctx.moveTo(izq[0].x, izq[0].y);""")

elif roto == 'garabato':
    # EL GARABATO: el trazo deja de ser largo y simple y se vuelve un paseo. Es el
    # error que costo dos versiones enteras y es el control del bloque de `obra`.
    #
    # Se rompe EL RITMO, que es lo que el detector mide desde que se vio que contar
    # quiebros por trazo no medía lo que decia: con `QUIEBROS` roto a [16,26] el
    # control se quedaba en 0 de 126, porque el numero por trazo no gobernaba la
    # geometria — la gobierna cada cuanto gira la gubia. Con la vuelta cada media
    # anchura en vez de cada tres, sale el paseo.
    # ESTE CONTROL LLEVA DOS AVERIAS, y es la unica excepcion a la regla de una. La
    # razon es un hallazgo, no una comodidad: romper solo el ritmo NO produce
    # garabatos. Medido, con la vuelta cada media anchura en vez de cada tres, el
    # ritmo observado sube de 3,56 a 4,24 y el control dispara 0 de 84 — porque un
    # trazo que gira cada media anchura SE CHOCA CONSIGO MISMO y `seCorta` lo corta.
    #
    # O sea: lo que mantiene el trazo largo y simple NO es el parametro del ritmo,
    # es la regla de auto-corte. El ritmo declara la intencion; la restriccion
    # impone el resultado. Rompiendo las dos —que es romper UNA afirmacion por los
    # dos mecanismos que la sostienen— sale 83 de 84 y el ritmo se va a 10,65.
    a = "  const PASO = [3.5, 7.5];                 // una vuelta grande cada tantas anchuras"
    assert a in src, 'no encuentro el ritmo'
    src = src.replace(a, "  const PASO = [0.35, 0.75];   // ROTO A PROPOSITO: el paseo")
    b2 = "    if (seCorta(segs, ctx.D)) return false;"
    assert b2 in src, 'no encuentro la comprobacion de auto-corte'
    src = src.replace(b2, "    // ROTO A PROPOSITO: sin auto-corte, para que el paseo pueda existir")

elif roto == 'pizca':
    # SIN SUELO DE LONGITUD: vuelven las pizcas del `paralelo` sobre un trozo muy
    # corto, que es el confeti de la primera version.
    #
    # Se rompe LA CONSTANTE, no los sitios donde se usa. Antes se parcheaba la linea
    # concreta que la comprueba al colocar, y esa linea se ha reescrito dos veces —
    # la ultima al hacer que el trazo crezca en vez de rechazarse. Rompiendo
    # `LARGO_MIN` la averia cae en los cuatro sitios a la vez y no se descoloca cada
    # vez que se toca el algoritmo. El detector mide contra su propio 0,20, asi que
    # sigue midiendo lo mismo.
    a = "  const LARGO_MIN = 0.20;"
    assert a in src, 'no encuentro LARGO_MIN'
    src = src.replace(a, "  const LARGO_MIN = 0.02;   // ROTO A PROPOSITO")
    # Y el trozo minimo del `paralelo`, que es de donde salian las pizcas. Las dos
    # cosas hacen la misma averia por los dos lados. OJO: esto antes parcheaba una
    # linea que ya no existe —`str.replace` no falla cuando no encuentra nada, asi
    # que la averia se habia quedado a medias sin avisar. Por eso lleva `assert`,
    # como las demas.
    b = "      const fr = clamp(acomp / (Lo || 1), 0.16, 1);"
    assert b in src, 'no encuentro el trozo minimo del acompanamiento'
    src = src.replace(b, "      const fr = clamp(acomp / (Lo || 1), 0.02, 1);   // ROTO A PROPOSITO")

elif roto:
    raise SystemExit('averia desconocida: ' + roto)

open(sys.argv[2], 'w').write(src)
print('escrito', sys.argv[2], '(' + (roto or 'sano') + ')')
