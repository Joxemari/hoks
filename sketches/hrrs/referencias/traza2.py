#!/usr/bin/env python3
"""traza2.py — sacar TRAZOS, no esqueleto.

    python3 referencias/traza2.py referencias/ref05.jpeg [--png fuera.png]

`traza.py` reconstruye desde el esqueleto del raster, y eso es pensar en pixeles. El
esqueleto de dos bandas cruzadas NO son sus dos ejes: en el cruce se parte, se
desplaza y saca ramas que no existen. De ahi los tres defectos que el autor fue
senalando uno a uno —los trazos se rompen, los margenes no se respetan, el solape
esta mal— y de ahi que el cartel de Munich, que es casi todo cruces de bandas anchas,
saliera una aberracion.

Aqui el modelo es el objeto: **una banda es un trazo de anchura constante**, o sea
DOS ARISTAS PARALELAS a distancia W. Asi que se busca eso y no otra cosa:

  1. el contorno de la tinta, partido en tramos rectos;
  2. las PAREJAS de tramos antiparalelos separados por ~W, que son los dos costados
     de una misma banda — su eje es la media de los dos;
  3. las piezas de eje encadenadas en trazos.

Un cruce deja de ser un problema y pasa a ser lo natural: los dos costados EXTERIORES
de cada banda siguen ahi, sin enterarse de que otra banda pasa por encima. El
esqueleto no puede saber eso; las aristas si.

── LO QUE SE PROBO, Y LO QUE VALE ───────────────────────────────────────────────

El emparejado de aristas (`aristas`/`fundir`/`parejas`/`encadena`, abajo) era el
modelo correcto y la implementacion equivocada, y se queda escrito porque el error
tiene ensenanza: **el costado de una banda no es una recta, es una POLILINEA**, asi
que «fundir tramos colineales» no funde nada y cada banda sigue dando una nube de
piezas de eje solapadas que el encadenado no sabe coser.

Lo que si funciona es `ejesPorGrosor`, y es mas simple que todo lo anterior: lo que
distingue una banda de un cruce no son las aristas, es el GROSOR. En una banda el
material mide W; en un cruce mide mas. Asi que el eje son los puntos donde 2*dt vale
W —ni mas ni menos— y **el cruce se cae solo**: no hay que detectarlo ni deshacerlo,
sencillamente no entra. Eso deja el eje partido justo en los cruces, que es lo que se
quiere, y luego se cose siguiendo recto.

ESTADO, honesto: el cartel de Munich pasa de aberracion a reconocible —siete trazos,
que son los que tiene— y las dos referencias de bandas anchas mejoran claramente. Las
densas (la gris, la enmarcada, la cuadrada) EMPEORAN: en ellas hay mas cruce que
banda limpia, asi que el filtro de grosor se lleva por delante media obra y los ejes
salen cortos. Ninguno de los dos trazadores sirve para las seis todavia — el de
grosor para las de bandas anchas, el del esqueleto para las densas.
"""
import sys, math
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure
from skimage.morphology import remove_small_objects, remove_small_holes


def otsu(a):
    h, _ = np.histogram((a * 255).astype(np.uint8), bins=256, range=(0, 256))
    tot = h.sum(); sm = np.dot(np.arange(256), h)
    sB = wB = 0.0; mx, um = -1.0, 128
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


def binaria(ruta, lado=1400):
    im = Image.open(ruta).convert('L')
    esc = lado / max(im.size)
    im = im.resize((max(1, round(im.size[0] * esc)), max(1, round(im.size[1] * esc))), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float64) / 255.0
    t = a < otsu(a)
    t = remove_small_objects(t, 200)
    # EL MARCO SI, LA TRAVESIA NO. Descartar toda componente que toca el borde quita
    # el marco de la foto… y tambien las bandas que CRUZAN el pliego de lado a lado,
    # que son la firma del cartel de Munich. El autor lo vio antes que yo: «la linea
    # continua horizontal no se dibuja». Salian las siete bandas del nudo y faltaban
    # las dos travesias, que son justo las que sostienen la composicion.
    #
    # Un marco se reconoce por lo que es: su caja abarca casi toda la imagen Y esta
    # hueca —es un anillo—. Una travesia toca el borde pero su caja es una franja.
    lab, n = ndimage.label(t)
    if n:
        alto, ancho = t.shape
        fuera = []
        for i in range(1, n + 1):
            m = lab == i
            ys, xs = np.nonzero(m)
            if not len(xs):
                continue
            h = ys.max() - ys.min() + 1; w = xs.max() - xs.min() + 1
            abarca = (h > alto * 0.92) and (w > ancho * 0.92)
            hueca = m.sum() / float(h * w) < 0.35
            if abarca and hueca:
                fuera.append(i)
        if fuera:
            t = t & ~np.isin(lab, fuera)
    ys, xs = np.nonzero(t)
    if len(xs):
        m = 8
        t = t[max(0, ys.min()-m):ys.max()+m, max(0, xs.min()-m):xs.max()+m]
    return remove_small_holes(t, 200)


def dp(pts, tol):
    """Douglas-Peucker. OJO: sobre un contorno CERRADO no vale tal cual.

    El primer punto y el ultimo coinciden, asi que la recta que los une mide cero, la
    distancia de todos los demas a ella sale cero, y el algoritmo devuelve dos
    vertices —o sea, borra el contorno entero—. Es un fallo clasico y aqui costo una
    tarde: `aristas` devolvia CERO y parecia que el modelo de parejas de aristas no
    funcionaba, cuando lo que no funcionaba era el simplificador. Se parte el
    contorno en dos por el punto mas lejano al primero y se simplifica cada mitad."""
    if len(pts) > 8 and math.hypot(pts[0][0]-pts[-1][0], pts[0][1]-pts[-1][1]) < 2.0:
        k = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0]-pts[0][0], pts[i][1]-pts[0][1]))
        if 2 < k < len(pts) - 2:
            return dp(pts[:k+1], tol)[:-1] + dp(pts[k:], tol)
    def rec(a, b):
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
        return rec(a, k) + [k] + rec(k, b)
    idx = [0] + rec(0, len(pts) - 1) + [len(pts) - 1]
    return [pts[i] for i in idx]


def aristas(t, W):
    """El contorno de la tinta, en tramos rectos largos."""
    out = []
    for c in measure.find_contours(t.astype(float), 0.5):
        p = [(float(x), float(y)) for y, x in c]
        if len(p) < 8:
            continue
        s = dp(p, max(1.0, W * 0.09))
        for i in range(len(s) - 1):
            L = math.hypot(s[i+1][0]-s[i][0], s[i+1][1]-s[i][1])
            if L >= W * 0.55:          # un costado de banda mide, como poco, media anchura
                out.append((s[i], s[i+1], L))
    return out


def ejesPorGrosor(t, dt, W, tol=0.20):
    """El eje de cada banda, POR GROSOR LOCAL. Es la idea que faltaba y es simple.

    El emparejado de aristas era el modelo correcto pero la implementacion equivocada:
    el costado de una banda no es una recta sino una POLILINEA, asi que «fundir tramos
    colineales» no funde nada y cada banda sigue dando una nube de piezas.

    Lo que si distingue una banda de un cruce es el GROSOR: en una banda el material
    mide W, y en un cruce mide mas. Asi que el eje son los puntos donde 2*dt vale W —
    ni mas ni menos— y el cruce se cae solo, porque alli 2*dt es mayor. No hay que
    detectar el cruce ni deshacerlo: no entra.

    Eso deja el eje de cada banda partido en los cruces, que es exactamente lo que se
    quiere: cada trozo es banda limpia, y luego se cosen siguiendo recto. Un puente
    sobre un cruce es una linea recta, que es lo que la banda hace por debajo."""
    from skimage.morphology import skeletonize
    nucleo = np.abs(2 * dt - W) < W * tol
    nucleo = remove_small_objects(nucleo & t, int(max(8, W * 0.8)))
    esq = skeletonize(nucleo)
    ramas, cabos, nudos = poligonalesDe(esq)
    tol_dp = max(1.0, W * 0.20)
    piezas = []
    for cam in ramas:
        sp = dp([(float(x), float(y)) for y, x in cam], tol_dp)
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L >= W * 0.9:
            piezas.append(sp)
    return coser(piezas, W, t)


def coser(piezas, W, t, tolAng=26.0):
    """Cose las piezas de eje que se cortan en un cruce: se salta recto al otro lado.

    El salto solo vale si el hueco es TINTA — si no, se estaria uniendo dos bandas
    distintas que casualmente se apuntan."""
    usadas = [False] * len(piezas)
    def dirf(c):
        k = min(4, len(c)-1)
        return math.atan2(c[-1][1]-c[-1-k][1], c[-1][0]-c[-1-k][0])
    def tinta(p, q, n=9):
        H, Wd = t.shape
        for s in range(1, n):
            u = s / n
            y = int(round(p[1] + (q[1]-p[1])*u)); x = int(round(p[0] + (q[0]-p[0])*u))
            if not (0 <= y < H and 0 <= x < Wd and t[y, x]):
                return False
        return True
    out = []
    orden = sorted(range(len(piezas)), key=lambda i: -sum(
        math.hypot(piezas[i][j+1][0]-piezas[i][j][0], piezas[i][j+1][1]-piezas[i][j][1])
        for j in range(len(piezas[i])-1)))
    for i0 in orden:
        if usadas[i0]:
            continue
        cam = list(piezas[i0]); usadas[i0] = True
        for _ in range(2):
            cam.reverse()
            while True:
                da = dirf(cam)
                mejor, mejorC = None, W * 3.2
                for j, p in enumerate(piezas):
                    if usadas[j]:
                        continue
                    for ini in (True, False):
                        q = p[0] if ini else p[-1]
                        dd = math.hypot(q[0]-cam[-1][0], q[1]-cam[-1][1])
                        if dd >= mejorC or dd < 1e-6:
                            continue
                        # ha de apuntar hacia donde vamos, y salir en la misma direccion
                        dSalto = math.atan2(q[1]-cam[-1][1], q[0]-cam[-1][0])
                        r = p[min(3, len(p)-1)] if ini else p[max(0, len(p)-4)]
                        dOtro = math.atan2(r[1]-q[1], r[0]-q[0])
                        if abs(((math.degrees(dSalto-da)+180) % 360)-180) > tolAng: continue
                        if abs(((math.degrees(dOtro-da)+180) % 360)-180) > tolAng: continue
                        if not tinta(cam[-1], q): continue
                        mejorC, mejor = dd, (j, ini)
                if mejor is None:
                    break
                j, ini = mejor; usadas[j] = True
                cam.extend(piezas[j] if ini else piezas[j][::-1])
        out.append(cam)
    return out


def poligonalesDe(esq):
    """Igual que en traza.py: el esqueleto partido en ramas entre cabos y nudos."""
    H, W = esq.shape
    vec = np.zeros_like(esq, dtype=np.uint8)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy or dx:
                vec += np.roll(np.roll(esq, dy, 0), dx, 1).astype(np.uint8)
    vec = vec * esq
    cabos = [(y, x) for y, x in zip(*np.nonzero((vec == 1) & esq))]
    nudos = [(y, x) for y, x in zip(*np.nonzero((vec >= 3) & esq))]
    esp = set(cabos) | set(nudos)
    vistos, ramas = set(), []
    def vecinos(p):
        y, x = p; o = []
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy or dx:
                    q = (y+dy, x+dx)
                    if 0 <= q[0] < H and 0 <= q[1] < W and esq[q]: o.append(q)
        return o
    for p0 in list(esp):
        for q in vecinos(p0):
            if (p0, q) in vistos: continue
            cam = [p0, q]; vistos.add((p0, q)); vistos.add((q, p0))
            act, ant = q, p0
            while act not in esp:
                sig = [r for r in vecinos(act) if r != ant]
                if not sig: break
                nx = sig[0]; vistos.add((act, nx)); vistos.add((nx, act))
                cam.append(nx); ant, act = act, nx
            if len(cam) >= 4: ramas.append(cam)
    return ramas, cabos, nudos


def fundir(ar, W, tolAng=9.0):
    """Funde los tramos COLINEALES de un mismo costado en una arista larga.

    Es el paso que faltaba, y va ANTES de emparejar. Un costado de banda con cuatro
    codos se parte en cinco tramos al simplificar el contorno; si se emparejan todos
    con todos, una sola banda produce una nube de piezas de eje solapadas y el
    encadenado no sabe coserlas. Fundidos, cada costado es UNA arista y cada banda da
    UNA pieza.

    Colineal = misma direccion dentro de unos grados, desviacion perpendicular por
    debajo de un tercio de anchura, y contiguos o solapados a lo largo de la
    direccion. Los tres criterios: sin el tercero se funden dos costados distintos
    que casualmente comparten recta —los dos lados de una banda que va y vuelve.
    """
    def ang(e):
        return math.atan2(e[1][1]-e[0][1], e[1][0]-e[0][0])
    piezas = [[e[0], e[1]] for e in ar]
    cambio = True
    while cambio:
        cambio = False
        for i in range(len(piezas)):
            if piezas[i] is None:
                continue
            for j in range(i+1, len(piezas)):
                if piezas[j] is None:
                    continue
                A, B = piezas[i], piezas[j]
                aA, aB = ang(A), ang(B)
                if abs(((math.degrees(aA-aB)+180) % 360)-180) > tolAng:
                    continue
                va = (A[1][0]-A[0][0], A[1][1]-A[0][1])
                La = math.hypot(*va) or 1e-9
                # desviacion perpendicular de los dos extremos de B respecto a la recta de A
                dev = max(abs(va[0]*(q[1]-A[0][1]) - va[1]*(q[0]-A[0][0]))/La for q in B)
                if dev > W * 0.33:
                    continue
                us = sorted([proyecta(q, A[0], A[1]) for q in B])
                if us[1] < -W*0.5/La or us[0] > 1 + W*0.5/La:
                    continue                       # ni contiguos ni solapados
                todos = A + B
                u = {q: proyecta(q, A[0], A[1]) for q in todos}
                piezas[i] = [min(todos, key=lambda q: u[q]), max(todos, key=lambda q: u[q])]
                piezas[j] = None
                cambio = True
    return [(p[0], p[1], math.hypot(p[1][0]-p[0][0], p[1][1]-p[0][1]))
            for p in piezas if p is not None]


def proyecta(p, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]
    l2 = dx*dx + dy*dy or 1e-9
    return ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / l2


def parejas(ar, W, tolAng=14.0, tolW=0.30):
    """Las parejas de aristas ANTIPARALELAS a distancia ~W: los dos costados de una
    banda. Se exige solape en proyeccion, o dos aristas de bandas distintas que se
    crucen de lejos entrarian como pareja."""
    ejes = []
    n = len(ar)
    for i in range(n):
        a0, a1, La = ar[i]
        va = (a1[0]-a0[0], a1[1]-a0[1])
        ang_a = math.atan2(va[1], va[0])
        for j in range(i + 1, n):
            b0, b1, Lb = ar[j]
            vb = (b1[0]-b0[0], b1[1]-b0[1])
            ang_b = math.atan2(vb[1], vb[0])
            d = abs(math.degrees(ang_a - ang_b)) % 360
            d = min(abs(d - 180), abs(d - 180 + 360) % 360, 360 - d if d > 180 else d)
            # ANTIparalelas: el contorno recorre los dos costados en sentidos opuestos
            dif = abs(((math.degrees(ang_a - ang_b) + 180) % 360) - 180)
            if abs(dif - 180) > tolAng:
                continue
            # distancia perpendicular entre las dos rectas
            mb = ((b0[0]+b1[0])/2, (b0[1]+b1[1])/2)
            La2 = math.hypot(*va) or 1e-9
            dist = abs(va[0]*(mb[1]-a0[1]) - va[1]*(mb[0]-a0[0])) / La2
            if not (W * (1 - tolW) <= dist <= W * (1 + tolW)):
                continue
            # solape en proyeccion sobre a
            u0, u1 = sorted((proyecta(b0, a0, a1), proyecta(b1, a0, a1)))
            lo, hi = max(0.0, u0), min(1.0, u1)
            if hi - lo < 0.25:
                continue
            p0 = (a0[0] + va[0]*lo, a0[1] + va[1]*lo)
            p1 = (a0[0] + va[0]*hi, a0[1] + va[1]*hi)
            # el eje: el punto medio entre cada extremo y su proyeccion en la otra
            def medio(p):
                u = proyecta(p, b0, b1); u = max(0.0, min(1.0, u))
                q = (b0[0] + (b1[0]-b0[0])*u, b0[1] + (b1[1]-b0[1])*u)
                return ((p[0]+q[0])/2, (p[1]+q[1])/2)
            e0, e1 = medio(p0), medio(p1)
            if math.hypot(e1[0]-e0[0], e1[1]-e0[1]) >= W * 0.5:
                ejes.append((e0, e1))
    return ejes


def encadena(ejes, W, tolAng=32.0):
    """Piezas de eje -> trazos. Se unen las que acaban cerca y siguen la direccion."""
    piezas = [list(e) for e in ejes]
    usadas = [False]*len(piezas)
    def dirp(p, ini):
        a, b = (p[0], p[1]) if ini else (p[-1], p[-2])
        return math.atan2(b[1]-a[1], b[0]-a[0])
    out = []
    orden = sorted(range(len(piezas)), key=lambda i: -math.hypot(
        piezas[i][-1][0]-piezas[i][0][0], piezas[i][-1][1]-piezas[i][0][1]))
    for i0 in orden:
        if usadas[i0]:
            continue
        cam = list(piezas[i0]); usadas[i0] = True
        for _ in range(2):
            cam.reverse()
            while True:
                fin = cam[-1]
                da = math.atan2(fin[1]-cam[-2][1], fin[0]-cam[-2][0])
                mejor, mejorC = None, W * 1.4
                for j, p in enumerate(piezas):
                    if usadas[j]:
                        continue
                    for ini in (True, False):
                        q = p[0] if ini else p[-1]
                        dd = math.hypot(q[0]-fin[0], q[1]-fin[1])
                        if dd >= mejorC:
                            continue
                        db = math.atan2((p[1] if ini else p[-2])[1]-q[1],
                                        (p[1] if ini else p[-2])[0]-q[0])
                        if abs(((math.degrees(db-da)+180) % 360)-180) > tolAng:
                            continue
                        mejorC, mejor = dd, (j, ini)
                if mejor is None:
                    break
                j, ini = mejor; usadas[j] = True
                cam.extend(piezas[j] if ini else piezas[j][::-1])
        out.append(cam)
    return out


def analizar(ruta, lado=1400):
    t = binaria(ruta, lado)
    H, Wpx = t.shape
    dt = ndimage.distance_transform_edt(t)
    from skimage.morphology import skeletonize
    esq = skeletonize(t)
    v = 2 * dt[esq]
    b = np.round(v / 0.5).astype(int)
    W = np.bincount(b).argmax() * 0.5
    tr = ejesPorGrosor(t, dt, W)
    corto = min(H, Wpx)
    tr = [c for c in tr
          if sum(math.hypot(c[i+1][0]-c[i][0], c[i+1][1]-c[i][1]) for i in range(len(c)-1)) > W * 1.5]
    return {
        'fichero': ruta.split('/')[-1], 'lienzo': [Wpx, H],
        'W_px': round(W, 2), 'W_rel': round(W / corto, 4),
        'trazos': len(tr),
        'receta': {
            'nombre': ruta.split('/')[-1],
            'alto': round(H / corto, 4), 'anchoLienzo': round(Wpx / corto, 4),
            'ancho': round(W / corto, 4), 'canal': 0.10,
            'trazos': [{'eje': [[round(x / corto, 4), round(y / corto, 4)] for x, y in c],
                        'anchos': [round(W / 2 / corto, 5)] * len(c)} for c in tr],
        },
    }


if __name__ == '__main__':
    import json
    for r in [a for a in sys.argv[1:] if not a.startswith('--')]:
        d = analizar(r)
        print(json.dumps({k: v for k, v in d.items() if k != 'receta'}, ensure_ascii=False))
