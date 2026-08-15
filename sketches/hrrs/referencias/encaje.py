"""encaje.py — ajustar la replica hasta >=95 % de acierto, por residuo.

Trazar de una pasada tiene un techo: cada error de lectura se paga entero y no hay
manera de enterarse. Esto es lo contrario — un AJUSTE: se parte de los ejes trazados,
se mira lo que FALTA y lo que SOBRA, y se corrige hasta que no baje mas.

El dibujo se rasteriza aqui, en numpy, con la MISMA construccion de bisel que
`banda()` de algo.js (dos puntos por vertice, unidos por su cuerda). Sacar el
navegador del bucle es lo que hace posible iterar: mil renders en vez de veinte.
Al final se comprueba con el renderizador de verdad.
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage.morphology import skeletonize, remove_small_objects, remove_small_holes

G = {}
exec(open('/home/user/hoks/sketches/hrrs/referencias/traza.py').read().split("if __name__")[0], G)


# ── El dibujo, en numpy, igual que `banda()` ────────────────────────────────────
def poligono(pts, h):
    """El contorno de una banda: bisel, dos puntos por vertice."""
    n = len(pts)
    if n < 2:
        return None
    nx, ny = [], []
    for i in range(n - 1):
        dx = pts[i+1][0] - pts[i][0]; dy = pts[i+1][1] - pts[i][1]
        m = math.hypot(dx, dy) or 1e-9
        nx.append(-dy / m); ny.append(dx / m)
    izq, der = [], []
    for i in range(n - 1):
        izq.append((pts[i][0] + nx[i]*h[i],     pts[i][1] + ny[i]*h[i]))
        izq.append((pts[i+1][0] + nx[i]*h[i+1], pts[i+1][1] + ny[i]*h[i+1]))
        der.append((pts[i][0] - nx[i]*h[i],     pts[i][1] - ny[i]*h[i]))
        der.append((pts[i+1][0] - nx[i]*h[i+1], pts[i+1][1] - ny[i]*h[i+1]))
    return izq + der[::-1]


def pinta(bandas, shape):
    """El mismo dibujo que `banda()`, y la palabra «mismo» costo tres puntos.

    La primera version pintaba UN poligono por banda, igual que el contorno que
    construye `banda()`. Pero ese contorno SE AUTOINTERSECA en los codos —por dentro
    del giro los dos costados se cruzan— y ahi PIL y el canvas no hacen lo mismo:
    PIL rellena por paridad (even-odd) y deja un agujero justo en la esquina; el
    canvas rellena por vueltas (nonzero) y lo llena. Los dos rasterizadores coincidian
    solo un 97 %, asi que el ajuste estaba afinando contra una forma que no era la que
    dibuja la casa.

    Se arregla no autointersecando: cada tramo es su cuadrilatero y cada vertice su
    triangulo de bisel, todos convexos y pintados por separado. Asi las dos reglas de
    relleno dan lo mismo."""
    im = Image.new('1', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(im)
    for pts, h in bandas:
        n = len(pts)
        if n < 2:
            continue
        nx, ny = [], []
        for i in range(n - 1):
            dx = pts[i+1][0] - pts[i][0]; dy = pts[i+1][1] - pts[i][1]
            m = math.hypot(dx, dy) or 1e-9
            nx.append(-dy / m); ny.append(dx / m)
        for i in range(n - 1):
            d.polygon([(pts[i][0] + nx[i]*h[i],     pts[i][1] + ny[i]*h[i]),
                       (pts[i+1][0] + nx[i]*h[i+1], pts[i+1][1] + ny[i]*h[i+1]),
                       (pts[i+1][0] - nx[i]*h[i+1], pts[i+1][1] - ny[i]*h[i+1]),
                       (pts[i][0] - nx[i]*h[i],     pts[i][1] - ny[i]*h[i])], fill=1)
        for i in range(1, n - 1):          # el bisel: la cuerda entre los dos costados
            for sg in (1, -1):
                d.polygon([(pts[i][0], pts[i][1]),
                           (pts[i][0] + sg*nx[i-1]*h[i], pts[i][1] + sg*ny[i-1]*h[i]),
                           (pts[i][0] + sg*nx[i]*h[i],   pts[i][1] + sg*ny[i]*h[i])], fill=1)
    return np.asarray(im, dtype=bool)


def dif(A, B, w=None):
    x = A ^ B; u = A | B
    if w is None:
        return x.sum() / max(1, u.sum())
    return float((w * x).sum()) / max(1e-9, float((w * u).sum()))


def pesoCanal(A, W, peso=8.0):
    """El mapa de pesos que hace que el ajuste VEA la incision.

    El area es ciega al canal: una incision de un pelo son cuatro pixeles de fondo,
    asi que cerrarla no cuesta casi nada y el ajuste la cierra sin enterarse — es lo
    que el evaluador midio (soldar todas las incisiones de un original contra si
    mismo cuesta entre 1,3 y 9,9 %) y lo que el autor lleva viendo desde el principio
    en las paralelas y las uniones.
    #
    Se arregla en el OBJETIVO, no en el dibujo: los pixeles que en el original son
    fondo ESTRECHO —el suelo entre dos bandas, y solo ese— pesan ocho veces mas. Con
    eso, cerrar un canal deja de salir gratis y el ajuste lo defiende solo. El resto
    de la hoja pesa uno, asi que el blanco de alrededor no manda."""
    fondo = ~A
    dtf = ndimage.distance_transform_edt(fondo)
    canal = fondo & (2 * dtf < W)          # suelo mas fino que una banda: eso es canal
    # Y SE ENSANCHA EL PESO HASTA EL FILO DE LAS DOS BANDAS, no solo el hueco.
    #
    # Pesando unicamente el fondo del canal, se castiga CERRARLO pero no ABRIRLO: si
    # la replica deja el hueco mas ancho, los pixeles de mas son tinta del original
    # que no esta, y esos caian fuera de la zona pesada. Medido: en las dos obras de
    # banda ancha el canal salia 3-4 veces mas gordo que el original (0,11 -> 0,45 y
    # 0,06 -> 0,17) mientras el area marcaba 97 % — porque una banda un pelo mas fina
    # casi no cuesta area, y el canal doblado si se ve.
    #
    # Ensanchando el peso un tercio de anchura a cada lado entran tambien los dos
    # filos, asi que abrir de mas cuesta igual que cerrar. El margen se defiende por
    # los dos lados o no se defiende.
    # DOS PIXELES, FIJOS, y no una fraccion de la anchura. Con bandas de 78 px un
    # tercio de anchura son 27 px de dilatacion: eso no marca el filo del canal, INUNDA
    # media obra y diluye el peso hasta dejarlo en nada. Medido, con la version
    # proporcional el canal empeoraba (0,11 -> 0,54) mientras el area subia. Lo que hay
    # que pesar es el hilo y sus dos bordes, que son dos pixeles a cada lado.
    canal = ndimage.binary_dilation(canal, iterations=2)
    w = np.ones(A.shape, np.float32)
    w[canal] = peso
    return w


# ── Sacar ejes de una mascara cualquiera (el original, o un residuo) ───────────
def ejesDe(mask, W, minLargo=1.2, dpTol=0.05):
    # OJO CON EL UMBRAL DE AGUJEROS: tapaba huecos de hasta W*W pixeles, y con bandas
    # de 68 px eso son 4.600 — o sea que TAPABA LAS INCISIONES antes de trazar nada.
    # Se veia en el numero: la litografia tiene 7 componentes y el trazado inicial
    # daba 1, asi que el ajuste no podia defender un canal que ya no existia cuando
    # llegaba. Ningun peso en el objetivo arregla eso; no habia nada que pesar.
    #
    # El umbral es para MOTAS del escaneo, asi que va en pixeles absolutos y pequeno.
    mask = remove_small_holes(remove_small_objects(mask, int(max(16, (W*0.7)**2))), 24)
    if not mask.any():
        return []
    dt = ndimage.distance_transform_edt(mask)
    esq = skeletonize(mask)
    if not esq.any():
        return []
    out = []
    for cam, c0, c1 in G['bandas'](esq, dt, W):
        sp = G['simplificar'](cam, max(1.0, W * dpTol))
        if len(sp) < 2:
            continue
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L < W * minLargo:
            continue
        crudo = []
        for yy0, xx0 in cam:
            yy = min(mask.shape[0]-1, max(0, int(yy0))); xx = min(mask.shape[1]-1, max(0, int(xx0)))
            crudo.append(float(dt[yy, xx]))
        k = int(W * 0.6)
        limpio = crudo[k:-k] if len(crudo) > 2*k+4 else crudo
        # LA ANCHURA SE LEE FUERA DE LOS CRUCES. En una obra llena de cruces la mayor
        # parte del eje pasa por dentro de una mancha de dos bandas, donde la distancia
        # medial vale mucho mas que media banda: la moda se va hacia arriba, cada banda
        # se dibuja gorda y AL DIBUJARLAS SE COMEN LA INCISION de al lado. Se veia en
        # el numero: la litografia tiene 7 componentes y el trazado inicial daba 1,
        # antes de ajustar nada. Ningun peso en el objetivo arregla eso — no habia
        # canal que defender, se cerraba al dibujar.
        fino = [v for v in limpio if 2*v <= W * 1.15]
        base = (float(G['moda'](np.asarray(fino or limpio), 0.5))
                or float(np.median(crudo)) or W/2)
        # el cabo, hasta donde haya tinta
        def hasta(p0, p1, hmax):
            dx, dy = p0[0]-p1[0], p0[1]-p1[1]
            m = math.hypot(dx, dy) or 1e-9
            dx, dy = dx/m, dy/m
            a, paso = 0.0, 0.5
            while a + paso <= hmax:
                x = p0[0] + dx*(a+paso); y = p0[1] + dy*(a+paso)
                yy, xx = int(round(y)), int(round(x))
                if not (0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx]):
                    break
                a += paso
            return (p0[0]+dx*a, p0[1]+dy*a)
        sp = [hasta(sp[0], sp[1], base*1.4)] + sp[1:-1] + [hasta(sp[-1], sp[-2], base*1.4)]
        out.append((sp, [base]*len(sp)))
    return out


# ── El ajuste ──────────────────────────────────────────────────────────────────
def ajustar(A, W, vueltas=6, verbose=True, peso=8.0):
    """Parte de los ejes del original y corrige por residuo hasta que no baje mas."""
    w = pesoCanal(A, W, peso) if peso else None
    bandas = ejesDe(A, W)
    B = pinta(bandas, A.shape)
    d = dif(A, B, w)
    if verbose:
        print(f"    inicio        {d:.1%}  ({len(bandas)} bandas)")

    for v in range(vueltas):
        mejoro = False

        # 1. LO QUE FALTA: tinta del original que la replica no cubre. Se le sacan
        #    ejes y se anaden como bandas nuevas. Es como se recuperan las bandas
        #    que el trazado de una pasada no vio.
        falta = A & ~B
        nuevas = ejesDe(falta, W, minLargo=1.0)
        if nuevas:
            cand = bandas + nuevas
            dc = dif(A, pinta(cand, A.shape), w)
            if dc < d - 1e-4:
                bandas, d, mejoro = cand, dc, True
                B = pinta(bandas, A.shape)
                if verbose:
                    print(f"    +{len(nuevas):<3} bandas   {d:.1%}")

        # 2. LO QUE SOBRA: se prueba a quitar cada banda. Si la replica mejora sin
        #    ella, es que el trazado la invento —un artefacto del esqueleto— y no
        #    estaba en la obra.
        i = 0
        quitadas = 0
        while i < len(bandas):
            sin = bandas[:i] + bandas[i+1:]
            ds = dif(A, pinta(sin, A.shape), w)
            if ds < d - 1e-4:
                bandas, d = sin, ds
                quitadas += 1; mejoro = True
            else:
                i += 1
        if quitadas:
            B = pinta(bandas, A.shape)
            if verbose:
                print(f"    -{quitadas:<3} bandas   {d:.1%}")

        # 3. LA ANCHURA DE CADA BANDA, una a una. Es lo que mas mueve la aguja y lo
        #    que el trazado no puede acertar de un tiro: la moda de la distancia
        #    medial es un estimador, no una medida.
        for i in range(len(bandas)):
            pts, h = bandas[i]
            mejorH, mejorD = h, d
            for f in (0.90, 0.95, 1.05, 1.10):
                pr = bandas[:i] + [(pts, [x*f for x in h])] + bandas[i+1:]
                dp2 = dif(A, pinta(pr, A.shape), w)
                if dp2 < mejorD - 1e-5:
                    mejorD, mejorH = dp2, [x*f for x in h]
            if mejorH is not h:
                bandas[i] = (pts, mejorH); d = mejorD; mejoro = True
        B = pinta(bandas, A.shape)
        if verbose:
            print(f"    anchuras      {d:.1%}")

        # 4. CADA VERTICE, UNO A UNO. Cuando la topologia ya esta bien, lo que queda
        #    es error de BORDE: el eje pasa a un pixel o dos de donde deberia. Ningun
        #    estimador global lo arregla —es ruido de lectura, distinto en cada
        #    vertice— asi que se baja por descenso: se prueba a mover cada vertice en
        #    las cuatro direcciones y se queda el movimiento que reduce la diferencia.
        #    Es lo que separa el 92 % del 98 %.
        # 3b. LA ANCHURA VERTICE A VERTICE, pero ACOTADA a ±8 % de la de la banda.
        #     Sin cota vuelve el defecto que el autor senalo —el cabo en punta, el
        #     codo estrangulado— porque el ajuste, si le dejas, adelgaza donde le
        #     conviene. Con cota solo recoge la variacion real de la gubia.
        if v >= 1:
            for i in range(len(bandas)):
                pts, h = bandas[i]
                b0 = float(np.median(h))
                for k in range(len(h)):
                    mejorH, mejorD = None, d
                    for f in (0.94, 1.06):
                        nh = list(h); nh[k] = min(max(h[k]*f, b0*0.92), b0*1.08)
                        pr = bandas[:i] + [(pts, nh)] + bandas[i+1:]
                        dd = dif(A, pinta(pr, A.shape), w)
                        if dd < mejorD - 1e-6:
                            mejorD, mejorH = dd, nh
                    if mejorH is not None:
                        bandas[i] = (pts, mejorH); h = mejorH; d = mejorD; mejoro = True
            B = pinta(bandas, A.shape)
            if verbose:
                print(f"    anchura/vert  {d:.1%}")

        # 4b. Y ANTES, MAS VERTICES DONDE HAGA FALTA. El eje simplificado no puede
        #     seguir el temblor del original: entre dos vertices va recto y la obra
        #     no. Partiendo por la mitad los tramos largos, el descenso tiene por
        #     donde doblar. Sin esto el ajuste se estanca sobre el 95 %.
        # y se parte SIEMPRE en la primera vuelta, no solo si mejora: la libertad
        # de doblar hay que darla antes de saber si sirve.
        if v == 1 or (v >= 1 and len(bandas) < 40):
            nb = []
            for pts, h in bandas:
                q, qh = [pts[0]], [h[0]]
                for k in range(len(pts)-1):
                    L = math.hypot(pts[k+1][0]-pts[k][0], pts[k+1][1]-pts[k][1])
                    if L > W * 1.1:
                        n = int(L // (W * 0.55))
                        for j in range(1, n):
                            u = j / n
                            q.append((pts[k][0]+(pts[k+1][0]-pts[k][0])*u,
                                      pts[k][1]+(pts[k+1][1]-pts[k][1])*u))
                            qh.append(h[k])
                    q.append(pts[k+1]); qh.append(h[k+1])
                nb.append((q, qh))
            dn = dif(A, pinta(nb, A.shape), w)
            # se acepta AUNQUE EMPEORE un poco: partir un tramo mueve el bisel y
            # cuesta unas centesimas, pero le da al descenso por donde doblar y lo
            # devuelve con creces. Exigiendo que no empeorase, el paso no se activaba
            # nunca y el ajuste se estancaba en el 96 %.
            if v == 1 or dn <= d + 0.006:
                bandas, d = nb, dn
                if verbose:
                    print(f"    +vertices     {d:.1%}  ({sum(len(p) for p,_ in bandas)} en total)")

        for delta in (3.0, 1.5, 0.75, 0.4, 0.2):
            movidos = 0
            for i in range(len(bandas)):
                pts, h = bandas[i]
                for k in range(len(pts)):
                    mejorP, mejorD = None, d
                    for dx, dy in ((delta,0), (-delta,0), (0,delta), (0,-delta),
                                   (delta,delta), (-delta,-delta), (delta,-delta), (-delta,delta)):
                        q = list(pts)
                        q[k] = (pts[k][0]+dx, pts[k][1]+dy)
                        pr = bandas[:i] + [(q, h)] + bandas[i+1:]
                        dd = dif(A, pinta(pr, A.shape), w)
                        if dd < mejorD - 1e-6:
                            mejorD, mejorP = dd, q
                    if mejorP is not None:
                        bandas[i] = (mejorP, h); pts = mejorP; d = mejorD
                        movidos += 1; mejoro = True
            if verbose and movidos:
                print(f"    vertices ±{delta:<4}{d:.1%}  ({movidos} movidos)")
        B = pinta(bandas, A.shape)

        if not mejoro:
            break
    return bandas, d
