#!/usr/bin/env python3
"""traza.py — TRANSCRIBIR una referencia, no describirla.

    python3 referencias/traza.py referencias/ref01.webp [--json salida.json]

El error de la primera vuelta del ejercicio fue escribir recetas «parecidas» y
comparar a ojo. Esto hace lo contrario: saca del PIXEL la geometria real —los ejes,
la anchura de banda, el canal, los cabos, los cruces— y devuelve numeros y una
poligonal por banda. A partir de ahi la receta ya no se inventa: se transcribe, y lo
que no se pueda dibujar con el vocabulario de la casa es exactamente lo que falta.

Que mide, y por que cada cosa:

  W        anchura de banda. Es la MODA del doble de la transformada de distancia
           sobre la tinta, no la media: la media la hunden los cabos y los codos,
           donde el disco maximo no cabe. Con la moda sale la anchura de la gubia.
  g        el canal. Se mide donde el suelo esta ATRAPADO entre dos bandas — o sea
           en las componentes de fondo que no tocan el borde— y otra vez por la moda
           del doble de la distancia. Es el numero que llevo mal desde el principio.
  ejes     el esqueleto (medial axis), podado y partido en poligonales. Cada una es
           el eje de una banda o de un tramo entre bifurcaciones.
  cabos    puntos del esqueleto con un solo vecino: donde una banda MUERE.
  nudos    puntos con tres o mas: donde dos bandas se tocan o se cruzan. En esta
           familia un nudo es un suceso declarado, asi que contarlos dice cuanta
           superposicion hay de verdad en la referencia.
"""
import sys, json, math
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize, remove_small_objects, remove_small_holes


def cargar(ruta, lado=900):
    im = Image.open(ruta).convert('L')
    esc = lado / max(im.size)
    im = im.resize((max(1, round(im.size[0] * esc)), max(1, round(im.size[1] * esc))), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float64) / 255.0
    return a


def recortar(a):
    """Quita el marco, el paspartu y el papel de alrededor.

    Las fotos vienen con marco, pared y firma. Se busca el rectangulo de la OBRA:
    la caja de la tinta, con un poco de aire. Sin esto, el umbral de Otsu separa el
    marco negro del papel y la tinta se pierde entera."""
    u = otsu(a)
    tinta = a < u
    tinta = remove_small_objects(tinta, 64)
    ys, xs = np.nonzero(tinta)
    if len(xs) == 0:
        return a
    # el marco toca el borde; la obra no. Se descartan las componentes que tocan.
    lab, n = ndimage.label(tinta)
    bordes = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    bordes.discard(0)
    dentro = np.isin(lab, list(set(range(1, n + 1)) - bordes))
    if dentro.sum() < tinta.sum() * 0.15:
        dentro = tinta
    ys, xs = np.nonzero(dentro)
    m = 12
    y0, y1 = max(0, ys.min() - m), min(a.shape[0], ys.max() + m)
    x0, x1 = max(0, xs.min() - m), min(a.shape[1], xs.max() + m)
    return a[y0:y1, x0:x1]


def otsu(a):
    h, _ = np.histogram((a * 255).astype(np.uint8), bins=256, range=(0, 256))
    tot = h.sum()
    sm = np.dot(np.arange(256), h)
    sB = wB = 0.0
    mx, um = -1.0, 128
    for i in range(256):
        wB += h[i]
        if wB == 0:
            continue
        wF = tot - wB
        if wF == 0:
            break
        sB += i * h[i]
        v = wB * wF * ((sB / wB) - ((sm - sB) / wF)) ** 2
        if v > mx:
            mx, um = v, i
    return um / 255.0


def moda(v, paso=0.5):
    """Moda robusta de una lista de distancias, en pasos de medio pixel."""
    if len(v) == 0:
        return 0.0
    b = np.round(np.asarray(v) / paso).astype(int)
    c = np.bincount(b)
    return c.argmax() * paso


def poligonales(esq):
    """Parte el esqueleto en poligonales entre cabos y nudos."""
    H, W = esq.shape
    vec = np.zeros_like(esq, dtype=np.uint8)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            vec += np.roll(np.roll(esq, dy, 0), dx, 1).astype(np.uint8)
    vec = vec * esq
    cabos = [(y, x) for y, x in zip(*np.nonzero((vec == 1) & esq))]
    nudos = [(y, x) for y, x in zip(*np.nonzero((vec >= 3) & esq))]
    especiales = set(cabos) | set(nudos)

    vistos = set()
    ramas = []

    def vecinos(p):
        y, x = p
        out = []
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                q = (y + dy, x + dx)
                if 0 <= q[0] < H and 0 <= q[1] < W and esq[q]:
                    out.append(q)
        return out

    for p0 in list(especiales):
        for q in vecinos(p0):
            if (p0, q) in vistos:
                continue
            cam = [p0, q]
            vistos.add((p0, q)); vistos.add((q, p0))
            act, ant = q, p0
            while act not in especiales:
                sig = [r for r in vecinos(act) if r != ant]
                if not sig:
                    break
                nx = sig[0]
                vistos.add((act, nx)); vistos.add((nx, act))
                cam.append(nx)
                ant, act = act, nx
            if len(cam) >= 4:
                ramas.append(cam)
    return ramas, cabos, nudos


def simplificar(cam, tol):
    """Douglas-Peucker: el eje en los vertices que de verdad hacen falta."""
    pts = [(float(x), float(y)) for y, x in cam]

    def dp(a, b):
        if b - a < 2:
            return []
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1e-9
        peor, k = -1.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / L
            if d > peor:
                peor, k = d, i
        if peor <= tol:
            return []
        return dp(a, k) + [k] + dp(k, b)

    idx = [0] + dp(0, len(pts) - 1) + [len(pts) - 1]
    return [pts[i] for i in idx]


def bandas(esq, dt, anchoPx):
    """El esqueleto partido en BANDAS, no en ramas.

    Una rama del esqueleto va de suceso a suceso (cabo o nudo), asi que una banda que
    cruza por debajo de otras sale troceada en cuatro. Para replicar hace falta lo
    contrario: recorrer el grafo y en cada nudo SEGUIR RECTO — continuar por la rama
    cuya direccion se parece mas a la de entrada. Eso reconstruye la banda entera, que
    es lo que dibuja `banda()` de un tiron.

    Y se podan las espuelas: el esqueleto de una esquina o de un cabo a escuadra saca
    ramitas cortas que no son bandas, son artefactos del adelgazado."""
    ramas, cabos, nudos = poligonales(esq)
    if not ramas:
        return []
    espuela = anchoPx * 1.1
    def largo(c):
        return sum(math.hypot(c[i+1][0]-c[i][0], c[i+1][1]-c[i][1]) for i in range(len(c)-1))
    setC, setN = set(cabos), set(nudos)
    ramas = [r for r in ramas
             if not ((r[0] in setC or r[-1] in setC) and (r[0] in setN or r[-1] in setN)
                     and largo(r) < espuela)]
    # indice: de cada extremo, las ramas que salen de ahi
    porExtremo = {}
    for i, r in enumerate(ramas):
        porExtremo.setdefault(r[0], []).append((i, 0))
        porExtremo.setdefault(r[-1], []).append((i, 1))

    def dirDe(r, extremo, n=6):
        c = r if extremo == 0 else r[::-1]
        k = min(n, len(c) - 1)
        return math.atan2(c[k][0] - c[0][0], c[k][1] - c[0][1])

    usadas = set()
    out = []
    # se empieza por las ramas mas largas: la banda principal manda en cada nudo
    for i0 in sorted(range(len(ramas)), key=lambda i: -largo(ramas[i])):
        if i0 in usadas:
            continue
        cam = list(ramas[i0]); usadas.add(i0)
        for sentido in (1, 0):
            if sentido == 0:
                cam.reverse()
            while True:
                fin = cam[-1]
                if fin not in setN:
                    break
                # direccion de LLEGADA
                k = min(6, len(cam) - 1)
                da = math.atan2(cam[-1][0] - cam[-1-k][0], cam[-1][1] - cam[-1-k][1])
                mejor, mejorD = None, math.pi / 3     # 60 grados: mas que eso no es seguir recto
                for (j, ex) in porExtremo.get(fin, []):
                    if j in usadas:
                        continue
                    d = abs((dirDe(ramas[j], ex) - da + math.pi) % (2 * math.pi) - math.pi)
                    if d < mejorD:
                        mejorD, mejor = d, (j, ex)
                if mejor is None:
                    break
                j, ex = mejor; usadas.add(j)
                r = ramas[j] if ex == 0 else ramas[j][::-1]
                cam.extend(r[1:])
            if sentido == 1:
                cam.reverse()
        out.append((cam, cam[0] in setC, cam[-1] in setC))
    return out


# Las dos decisiones de la reconstruccion, y las dos MEDIDAS, no razonadas. Barrido
# de las cuatro combinaciones sobre las seis referencias (IoU mediano):
#
#   anchura medida + alargar todos los cabos   76,7 %   <- esta
#   anchura declarada + alargar todos          67,7 %
#   anchura medida + alargar solo cabos        65,1 %
#   anchura declarada + alargar solo cabos     58,2 %
#
# Las dos me salieron al reves de lo que esperaba:
#
# CLAMP=False. Yo habia razonado que en un cruce la semianchura medial se dispara y
# habia que sustituirla por la anchura declarada de la banda. Medido, eso QUITA tinta
# que el original tiene: donde dos bandas se cruzan la mancha de verdad es ancha,
# porque es la union de las dos. No era un artefacto de la medida, era el dibujo.
#
# SOLO_CABOS=False. Tambien razone que alargar un extremo que muere en un nudo mete
# tinta donde no la hay. Medido, es al reves: el reagrupado de ramas en bandas no
# siempre atraviesa el nudo, asi que muchos extremos marcados «nudo» son en realidad
# el final de una banda que si sigue por debajo — y no alargarlos deja el hueco.
# ── LOS MANDOS, Y TODOS SALEN DE UN BARRIDO, NO DE UN RAZONAMIENTO ───────────────
# 54 ajustes por referencia, minimizando la diferencia de pixel contra el original
# (`ajusta.py`, en el laboratorio). Resultado por referencia:
#
#   r1 14,0 %   r2 17,2 %   r3 28,5 %   r4 12,1 %   r5 12,5 %   r6 24,2 %
#
# Antes de barrer, la mediana de diferencia era 23 %; ahora 15,6 %. Y el cartel de
# Munich, que era la aberracion, pasa de 68 % a 12,5 %.
CLAMP = True
SOLO_CABOS = False
# Cuanto se tira de los vertices que caen dentro de un cruce. CERO, y es una
# correccion de una decision mia: ver la nota larga abajo.
CRUCE_LIM = 0
# La anchura leida sale corta un 12 %, en las seis. No es azar ni es estetica: la
# transformada de distancia mide al centro del pixel de fondo mas cercano, y con el
# umbral y el antialias el filo real cae medio pixel mas alla — medio por cada lado.
# Es un sesgo del instrumento, asi que se corrige como tal, con su motivo escrito.
CALIBRE = 1.12
# Cuanto se alarga el cabo, en semianchuras. El eje medial de un rectangulo se queda
# a media anchura de su lado corto; media es lo que sale mejor en cuatro de las seis.
ALARGA = 0.5
# Cuanto se simplifica el eje, en anchuras. Y a que resolucion se lee: no es un
# detalle de rendimiento —a 900 px la moda de la anchura cae en otro escalon del
# histograma y toda la reconstruccion se mueve—. Las dos salen del mismo barrido, y
# olvidar aplicarlas fue lo que hizo que el ajuste global saliera peor que el mejor
# por referencia: cuatro mandos medidos y solo dos puestos.
DP_TOL = 0.18
LADO = 1200


def soloElMaterial(t):
    """Fuera lo que no esta hecho con la misma gubia.

    En el cartel de Munich el trazador estaba dibujando el TEXTO IMPRESO —«Olympische
    Spiele Munchen 1972»— como si fueran bandas. Y la firma, y los aros. Filtrarlo por
    tamano es fragil (una letra grande mide como un cabo corto); por GROSOR no lo es:
    la obra esta hecha con una sola gubia, asi que todo lo que la compone tiene el
    mismo espesor. Una letra es mucho mas fina.

    Asi que se mide el grosor modal de la obra entera y se tira toda componente cuyo
    grosor propio no llegue a la mitad. Es la misma idea que sostiene la familia —una
    obra, un material— usada aqui para leer en vez de para dibujar."""
    dt = ndimage.distance_transform_edt(t)
    esq = skeletonize(t)
    if not esq.sum():
        return t
    lab, n = ndimage.label(t)
    if n < 2:
        return t
    # El grosor de la OBRA se pondera por AREA, no por esqueleto. Medido sobre el
    # esqueleto entero, el cartel de Munich daba 4 px — que es el grosor de las
    # LETRAS del pie: veintidos componentes de texto tienen mucho mas esqueleto que
    # siete bandas, aunque las bandas sean toda la tinta. La moda contaba longitud de
    # eje y habia que contar materia.
    grosores, areas = [], []
    for i in range(1, n + 1):
        m = (lab == i)
        e = esq & m
        if not e.sum():
            continue
        grosores.append(moda(2 * dt[e])); areas.append(int(m.sum()))
    if not grosores:
        return t
    orden = np.argsort(grosores)
    g = np.asarray(grosores)[orden]; ac = np.cumsum(np.asarray(areas)[orden])
    W0 = float(g[int(np.searchsorted(ac, ac[-1] / 2))])   # mediana ponderada por area
    if W0 <= 0:
        return t
    fuera = [i for i in range(1, n + 1)
             if (esq & (lab == i)).sum() and moda(2 * dt[esq & (lab == i)]) < W0 * 0.55]
    if fuera and np.isin(lab, fuera).sum() < t.sum() * 0.5:
        t = t & ~np.isin(lab, fuera)
    return t


def analizar(ruta):
    a = recortar(cargar(ruta, LADO))
    H, W = a.shape
    u = otsu(a)
    tinta = a < u
    tinta = remove_small_holes(remove_small_objects(tinta, 128), 128)
    tinta = soloElMaterial(tinta)

    # W: moda del doble de la distancia al fondo, sobre la tinta
    dt = ndimage.distance_transform_edt(tinta)
    esq = skeletonize(tinta)
    anchoPx = moda(2 * dt[esq])

    # g: el canal. PRIMER INTENTO, MAL: lo buscaba solo en el suelo ATRAPADO —las
    # componentes de fondo que no tocan el borde— y en cuatro de las seis daba cero.
    # El motivo es de bulto: cuando las dos bandas que forman un canal SE SALEN del
    # cuadro, el canal desemboca fuera y no esta atrapado. Justo las referencias con
    # mas travesias eran las que no median nada.
    #
    # El canal no es «suelo encerrado»: es suelo ESTRECHO. Asi que se mide sobre el
    # esqueleto del fondo entero, quedandose con los puntos donde el suelo mide menos
    # que una banda — que es la definicion de rendija de esta familia, mirada desde el
    # otro lado— y se toma la moda de esos.
    fondo = ~tinta
    dtf = ndimage.distance_transform_edt(fondo)
    esqf = skeletonize(fondo)
    anchoFondo = 2 * dtf[esqf]
    fino = anchoFondo[(anchoFondo > 1.0) & (anchoFondo < anchoPx)]
    canalPx = moda(fino) if len(fino) else 0.0

    # y de paso, cuanto del contorno de la tinta va acompanado a esa distancia: es
    # «cuanta obra es incision», que es lo que separa una masa de un monton de rayas.
    pelo = float((anchoFondo < anchoPx).mean()) if len(anchoFondo) else 0.0

    lab, n = ndimage.label(fondo)
    bordes = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    bordes.discard(0)

    # los ojos atrapados, por tamano
    tam = sorted([(lab == i).sum() for i in set(range(1, n + 1)) - bordes], reverse=True)

    ramas0, cabos, nudos = poligonales(esq)
    ramasX = bandas(esq, dt, anchoPx)
    lado = min(H, W)
    tol = max(1.0, anchoPx * DP_TOL)
    polis, largos, giros, anchos = [], [], [], []
    for cam, cabo0, cabo1 in ramasX:
        sp = simplificar(cam, tol)
        if len(sp) < 2:
            continue
        # LA ANCHURA REAL EN CADA VERTICE, no la modal de la obra. Dibujando todas
        # las bandas al ancho modal, alli donde dos van a un pelo la reconstruccion
        # las SUELDA y el canal desaparece — que es justo lo que la familia mide. La
        # semianchura local es el valor de la transformada de distancia sobre el eje,
        # y en un cabo o un codo baja sola, como en el original.
        # LA ANCHURA ES DECLARADA, NO MEDIDA — y esto es el arreglo grande.
        #
        # La semianchura local es la distancia al fondo sobre el eje, y DENTRO DE UN
        # CRUCE esa distancia se dispara: alli el eje esta en medio de una mancha
        # formada por dos bandas, asi que el disco que cabe es mucho mayor que la
        # banda. Reconstruyendo con ese valor, cada cruce sale con un bulto, las
        # juntas se engordan y el canal de al lado se cierra. Que es exactamente lo
        # que el autor senalo: «la union de trazos, los margenes, las juntas, los
        # solapes estan francamente mal».
        #
        # Una banda tiene UNA anchura, la de su gubia, y se lee en los tramos limpios.
        # Asi que: se mide en todos los vertices, se toma la mediana de los que NO
        # estan hinchados, y se admite solo una variacion pequena alrededor de ella.
        # Es la misma regla que el generador ya cumple —la gubia varia poco y solo
        # hacia abajo— aplicada a la lectura.
        # DENTRO DE UN CRUCE EL EJE NO VALE, Y SE TIRA.
        #
        # El esqueleto es fiable donde hay UNA banda y mentiroso donde hay dos: en un
        # cruce el eje medial no es el eje de ninguna de las dos, es la bisectriz de
        # la mancha que forman juntas, asi que se desvia, hace codos que no existen y
        # arrastra la banda fuera de su recta. Eso es lo que rompe el margen con la
        # vecina y ensucia el solape.
        #
        # Se distingue por el GROSOR: donde el material mide mas que W, no es banda,
        # es cruce. Esos vertices se quitan y el eje pasa RECTO por debajo — que es lo
        # que la banda hace de verdad. La conectividad la sigue dando el esqueleto,
        # que para eso si sirve; la geometria la da el tramo limpio.
        def grosorEn(x, y):
            yy = min(H - 1, max(0, int(round(y)))); xx = min(W - 1, max(0, int(round(x))))
            return 2 * float(dt[yy, xx])
        # …Y MEDIDO, NO: tirarlos sale PEOR en las seis referencias, sin una sola
        # excepcion (barrido de 54 ajustes por referencia, minimizando la diferencia
        # de pixel). El razonamiento era correcto sobre el eje y equivocado sobre el
        # dibujo: el eje dentro del cruce esta mal, si, pero la banda que se dibuja
        # con el sigue cayendo dentro de la mancha del cruce —que es negra de todas
        # formas, porque las dos bandas se funden ahi—, asi que el error no se ve. Y
        # quitando esos vertices se pierde la curvatura con la que la banda ENTRA y
        # SALE del cruce, que si se ve.
        #
        # Se deja el mando, apagado, porque la conclusion es del barrido y no mia.
        if CRUCE_LIM and len(sp) > 2:
            lim = anchoPx * CRUCE_LIM
            sp = [sp[0]] + [q for q in sp[1:-1] if grosorEn(q[0], q[1]) <= lim] + [sp[-1]]

        # SE MIDE SOBRE EL EJE DENSO, NO SOBRE LOS VERTICES. Y esto era un error de
        # bulto: los vertices de la poligonal simplificada son EXACTAMENTE las
        # esquinas, y en una esquina la distancia medial baja siempre —el disco
        # maximo no cabe en el codo—. Muestreando ahi, la anchura salia
        # sistematicamente corta, la banda constante salia flaca, y la medida decia
        # que la anchura variable era mejor. Lo era, pero solo porque la constante
        # estaba mal estimada.
        crudo = []
        for yy0, xx0 in cam:
            yy = min(H - 1, max(0, int(yy0))); xx = min(W - 1, max(0, int(xx0)))
            crudo.append(float(dt[yy, xx]))
        # y en el eje denso los cabos tambien hunden la cola: se recorta un tramo de
        # media anchura por cada punta antes de leer la moda
        k = int(anchoPx * 0.6)
        limpio = crudo[k:-k] if len(crudo) > 2 * k + 4 else crudo
        # y sin los puntos de cruce, que inflan la moda igual que inflaban el eje
        limpio = [v for v in limpio if not CRUCE_LIM or 2 * v <= anchoPx * CRUCE_LIM] or limpio
        # Y se lee con la MEDIANA DE LOS NO HINCHADOS, no con un percentil bajo.
        # Probe el percentil 30 pensando que en una banda muy cruzada mas de la mitad
        # de los vertices estarian hinchados; medido, sale peor en las seis (IoU
        # mediano 56% contra 68%). El motivo es que la distancia medial tambien BAJA
        # en cada codo y en cada cabo, asi que la cola baja no es «el tramo limpio»:
        # es el tramo limpio mezclado con todas las esquinas. La mediana filtrada
        # quita el bulto por arriba sin comerse la anchura por abajo.
        # LA MODA, no la mediana ni un percentil. La distancia medial sobre un eje
        # tiene TRES poblaciones: el tramo limpio (donde vale media anchura y es la
        # mas numerosa), los codos y cabos (por debajo) y los cruces (muy por encima).
        # La mediana mezcla las tres; la moda coge la primera, que es la anchura de la
        # gubia — que es lo que se busca, porque la banda tiene UNA anchura.
        base = (float(moda(np.asarray(limpio), 0.5)) or float(np.median(crudo)) or (anchoPx / 2)) * CALIBRE
        # CONSTANTE. El autor lo dijo mirando el detalle en alta: «los margenes entre
        # trazos paralelizados no son constantes, los trazos se rompen, a veces el
        # final se arista/estrecha». Las tres cosas son el mismo defecto — reconstruir
        # con la anchura MEDIDA en cada punto—: en un cabo la distancia medial cae a
        # cero, asi que la banda acaba en punta; en un codo baja, asi que se estrangula;
        # y donde acompana a otra el canal hereda esa variacion y deja de ser constante.
        # En el original la banda tiene una anchura y un cabo a escuadra.
        an = [round(base / lado, 5) for _ in sp] if CLAMP else None

        # Y LOS CABOS SE ALARGAN media anchura. El eje medial de un rectangulo NO
        # llega hasta su lado corto: se queda a media anchura del final, porque a
        # partir de ahi el disco maximo ya no cabe. Reconstruyendo tal cual, TODAS las
        # bandas salen cortas por los dos extremos — es la mitad de la tinta que
        # faltaba, y se ve sobre todo en los cabos a escuadra, que son casi la firma
        # de la familia.
        def alarga(p0, p1, h):
            dx, dy = p0[0] - p1[0], p0[1] - p1[1]
            m = math.hypot(dx, dy) or 1e-9
            return (p0[0] + dx / m * h, p0[1] + dy / m * h)
        # …y SOLO en los cabos de verdad. Una banda que acaba en un nudo no acaba: se
        # mete debajo de otra, y alargarla ahi mete tinta donde el original no tiene.
        # Alargando los dos extremos por igual, las dos referencias mas cruzadas
        # empeoraban mientras las dos mas limpias mejoraban — el promedio tapaba que
        # eran dos efectos contrarios.
        if len(sp) >= 2:
            p0 = alarga(sp[0], sp[1], base * ALARGA) if (cabo0 or not SOLO_CABOS) else sp[0]
            p1 = alarga(sp[-1], sp[-2], base * ALARGA) if (cabo1 or not SOLO_CABOS) else sp[-1]
            sp = [p0] + sp[1:-1] + [p1]
        if an is None:
            an = []
            for x, y in sp:
                yy = min(H - 1, max(0, int(round(y)))); xx = min(W - 1, max(0, int(round(x))))
                an.append(round(float(dt[yy, xx]) / lado, 5))
        elif len(an) != len(sp):
            an = [round(base / lado, 5) for _ in sp]
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L < anchoPx * 1.2:
            continue
        polis.append([[round(x / lado, 4), round(y / lado, 4)] for x, y in sp])
        anchos.append(an)
        largos.append(L / lado)
        for i in range(1, len(sp) - 1):
            a1 = math.atan2(sp[i][1]-sp[i-1][1], sp[i][0]-sp[i-1][0])
            a2 = math.atan2(sp[i+1][1]-sp[i][1], sp[i+1][0]-sp[i][0])
            d = abs(math.degrees(a2 - a1)) % 360
            giros.append(360 - d if d > 180 else d)

    giros = [g for g in giros if g > 12]
    return {
        'fichero': ruta.split('/')[-1],
        'lienzo': [W, H], 'proporcion': round(max(W, H) / min(W, H), 3),
        'W_rel': round(anchoPx / lado, 4),
        'W_frac': f'1/{round(lado / anchoPx)}' if anchoPx else '-',
        'canal_rel': round(canalPx / anchoPx, 3) if anchoPx else 0,
        'pelo_pct': round(100 * pelo, 1),
        'tinta_pct': round(100 * tinta.mean(), 1),
        'bandas': len(polis),
        'cabos': len(cabos), 'nudos': len(nudos),
        'largo_p50': round(float(np.median(largos)), 3) if largos else 0,
        'largo_max': round(float(np.max(largos)), 3) if largos else 0,
        'largo_total': round(float(np.sum(largos)), 3) if largos else 0,
        'giros_por_banda': round(len(giros) / max(1, len(polis)), 2),
        'giro_p50': round(float(np.median(giros)), 1) if giros else 0,
        'giro_p90': round(float(np.percentile(giros, 90)), 1) if giros else 0,
        'ritmo_W': round(float(np.sum(largos)) * lado / anchoPx / max(1, len(giros)), 2) if giros and anchoPx else 0,
        'ojos': len(tam),
        'ojo_mayor_pct': round(100 * tam[0] / (W * H), 2) if tam else 0,
        'ejes': polis,
        'receta': {
            'nombre': ruta.split('/')[-1],
            'alto': round(H / lado, 4), 'anchoLienzo': round(W / lado, 4),
            'ancho': round(anchoPx / lado, 4),
            'canal': round(canalPx / anchoPx, 3) if anchoPx else 0.12,
            'trazos': [{'eje': e, 'anchos': a2} for e, a2 in zip(polis, anchos)],
        },
    }


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    salida = None
    if '--json' in sys.argv:
        salida = sys.argv[sys.argv.index('--json') + 1]
    todo = []
    for r in args:
        d = analizar(r)
        todo.append(d)
        breve = {k: v for k, v in d.items() if k != 'ejes'}
        print(json.dumps(breve, ensure_ascii=False))
    if salida:
        with open(salida, 'w') as f:
            json.dump(todo, f)
        print(f'\nejes escritos en {salida}')
