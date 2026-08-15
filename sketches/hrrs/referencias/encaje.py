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
    im = Image.new('1', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(im)
    for pts, h in bandas:
        p = poligono(pts, h)
        if p and len(p) >= 3:
            d.polygon(p, fill=1)
    return np.asarray(im, dtype=bool)


def dif(A, B):
    return (A ^ B).sum() / max(1, (A | B).sum())


# ── Sacar ejes de una mascara cualquiera (el original, o un residuo) ───────────
def ejesDe(mask, W, minLargo=1.2, dpTol=0.05):
    mask = remove_small_holes(remove_small_objects(mask, int(max(16, (W*0.7)**2))), int(W*W))
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
        base = float(G['moda'](np.asarray(limpio), 0.5)) or float(np.median(crudo)) or W/2
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
def ajustar(A, W, vueltas=6, verbose=True):
    """Parte de los ejes del original y corrige por residuo hasta que no baje mas."""
    bandas = ejesDe(A, W)
    B = pinta(bandas, A.shape)
    d = dif(A, B)
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
            dc = dif(A, pinta(cand, A.shape))
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
            ds = dif(A, pinta(sin, A.shape))
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
                dp2 = dif(A, pinta(pr, A.shape))
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
                        dd = dif(A, pinta(pr, A.shape))
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
            dn = dif(A, pinta(nb, A.shape))
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
                        dd = dif(A, pinta(pr, A.shape))
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
