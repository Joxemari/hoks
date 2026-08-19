"""pulir.py — el ultimo ajuste, contra el patron BUENO y en local.

El ajuste largo (`encaje.py`) busca la geometria contra un dibujo de un pixel, que es
barato; esto le pone encima el convenio de filo del canvas, que es lo que se publica.
Sube la mediana por `componer()` de 96,0 % a 97,3 %.

Y VA EN LOCAL, que no es una optimizacion opcional: mover un vertice cambia la tinta en
una caja del tamaño de dos tramos, y redibujar la obra entera a 3x para eso cuesta una
hora por referencia — la primera version se quedo cincuenta y cinco minutos sin acabar
la primera. Se lleva la cuenta global del error y solo se recalcula la caja: lo de
dentro se resta, se prueba y se vuelve a sumar. Mismo resultado, 36 segundos las seis.

Una segunda pasada con pasos mas finos (0,05 px de anchura, 0,15 px de posicion) añade
0,2 puntos y ahi se para. Y un desplazamiento global del filo medido YA en el canvas no
añade nada (+0,08 px, 97,3 % igual): el pulido lo ha absorbido. Esta convergido.
"""
import numpy as np, glob, pickle, sys, math, time
from PIL import Image, ImageDraw
sys.path.insert(0, '/home/user/hoks/sketches/hrrs/referencias'); sys.path.insert(0, '.')
import encaje as E
SS = 3
MARG = 3.0


def pintaCaja(bandas, y0, y1, x0, x1, ss=SS):
    """Las bandas, dibujadas solo dentro de la caja."""
    hh, ww = y1 - y0, x1 - x0
    im = Image.new('1', (ww * ss, hh * ss), 0)
    d = ImageDraw.Draw(im)
    for pts, h in bandas:
        n = len(pts)
        if n < 2:
            continue
        mx = max(h) + 2
        if (min(p[0] for p in pts) - mx > x1 or max(p[0] for p in pts) + mx < x0 or
                min(p[1] for p in pts) - mx > y1 or max(p[1] for p in pts) + mx < y0):
            continue
        P = [((p[0] - x0) * ss, (p[1] - y0) * ss) for p in pts]
        H = [v * ss for v in h]
        nx, ny = [], []
        for i in range(n - 1):
            dx = P[i+1][0] - P[i][0]; dy = P[i+1][1] - P[i][1]
            m = math.hypot(dx, dy) or 1e-9
            nx.append(-dy / m); ny.append(dx / m)
        for i in range(n - 1):
            d.polygon([(P[i][0] + nx[i]*H[i],     P[i][1] + ny[i]*H[i]),
                       (P[i+1][0] + nx[i]*H[i+1], P[i+1][1] + ny[i]*H[i+1]),
                       (P[i+1][0] - nx[i]*H[i+1], P[i+1][1] - ny[i]*H[i+1]),
                       (P[i][0] - nx[i]*H[i],     P[i][1] - ny[i]*H[i])], fill=1)
        for i in range(1, n - 1):
            for sg in (1, -1):
                d.polygon([(P[i][0], P[i][1]),
                           (P[i][0] + sg*nx[i-1]*H[i], P[i][1] + sg*ny[i-1]*H[i]),
                           (P[i][0] + sg*nx[i]*H[i],   P[i][1] + sg*ny[i]*H[i])], fill=1)
    a = np.asarray(im, dtype=np.uint8).reshape(hh, ss, ww, ss).mean(axis=(1, 3))
    return a >= 0.5


def cuentas(A, B, w):
    x = (A ^ B).astype(np.float64) * w
    u = (A | B).astype(np.float64) * w
    return x.sum(), u.sum()


for f in sorted(glob.glob('orig_*.npy')):
    n = f[5:-4]; A = np.load(f)
    b, W, sh = pickle.load(open(f'fitQ_{n}.pkl', 'rb'))
    w = E.pesoCanal(A, W, 8.0)
    b = [(list(p), list(h)) for p, h in b]
    H, Wp = A.shape
    B = E.pinta(b, A.shape, ss=SS)
    X, U = cuentas(A, B, w)
    t0 = time.time()
    print(f"{n}  antes {1 - X/U:.1%}", end='', flush=True)

    def caja(k, i):
        pts, hs = b[k]
        js = [j for j in (i-1, i, i+1) if 0 <= j < len(pts)]
        m = max(hs[j] for j in js) + MARG
        y0 = max(0, int(min(pts[j][1] for j in js) - m))
        y1 = min(H, int(max(pts[j][1] for j in js) + m) + 1)
        x0 = max(0, int(min(pts[j][0] for j in js) - m))
        x1 = min(Wp, int(max(pts[j][0] for j in js) + m) + 1)
        return y0, y1, x0, x1

    def prueba(k, i, nuevo):
        """Cambia el vertice i de la banda k y devuelve (mejora, X, U, B_caja)."""
        global X, U
        y0, y1, x0, x1 = caja(k, i)
        if y1 <= y0 or x1 <= x0:
            return None
        sa = A[y0:y1, x0:x1]; sw = w[y0:y1, x0:x1]; sb = B[y0:y1, x0:x1]
        xa, ua = cuentas(sa, sb, sw)
        viejo = b[k]
        b[k] = nuevo
        nb = pintaCaja(b, y0, y1, x0, x1)
        xn, un = cuentas(sa, nb, sw)
        if (X - xa + xn) / (U - ua + un) < X / U - 1e-12:
            X = X - xa + xn; U = U - ua + un
            B[y0:y1, x0:x1] = nb
            return True
        b[k] = viejo
        return False

    # 1) desplazamiento global del filo
    for d in (0.4, 0.25, 0.15, -0.15):
        c = [(p, [v + d for v in h]) for p, h in b]
        Bc = E.pinta(c, A.shape, ss=SS)
        xc, uc = cuentas(A, Bc, w)
        if xc / uc < X / U:
            b, B, X, U = [(list(p), list(h)) for p, h in c], Bc, xc, uc
    print(f"  global {1 - X/U:.1%}", end='', flush=True)

    # 2) anchura y posicion por vertice, local
    for vuelta in range(3):
        for k in range(len(b)):
            pts, hs = b[k]
            for i in range(len(pts)):
                for d in (0.5, -0.5, 0.25, -0.25, 0.12, -0.12):
                    nh = list(b[k][1]); nh[i] = max(0.5, nh[i] + d)
                    if prueba(k, i, (b[k][0], nh)):
                        break
                for dx, dy in ((0.4, 0), (-0.4, 0), (0, 0.4), (0, -0.4),
                               (0.2, 0), (-0.2, 0), (0, 0.2), (0, -0.2)):
                    np2 = list(b[k][0])
                    np2[i] = (np2[i][0] + dx, np2[i][1] + dy)
                    if prueba(k, i, (np2, b[k][1])):
                        break
    B = E.pinta(b, A.shape, ss=SS)
    X, U = cuentas(A, B, w)
    pickle.dump((b, W, sh), open(f'fitR_{n}.pkl', 'wb'))
    print(f"  pulido {1 - X/U:.1%}   area {1 - E.dif(A, B):.1%}   {time.time()-t0:.0f}s", flush=True)
