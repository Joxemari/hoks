"""lleno.py — que no falte. El objetivo deja de ser simetrico.

Criterio del autor, y es estetico, no metrico: «que tenga de mas puedo aceptarlo, pero
lo que le falta por rellenar no». La diferencia simetrica trata igual un pixel de mas y
uno de menos, y eso no es lo que se mira. Asi que la falta pesa LAMBDA veces mas.

Se mantiene el peso del canal —el pelo blanco del original no es un hueco sin rellenar:
es una decision, y taparlo si es un error— y resulta que no hay que elegir entre las dos
cosas. Medido por `componer()`, con la falta a x8:

  tinta que falta   0,7-1,6 %  ->  0,1-0,7 %      (a x20: 0,0-0,5 %)
  tinta de mas      0,7-1,2 %  ->  1,8-3,9 %
  canal            r2 0,30 -> 0,25 (original 0,26)   r3 0,66 -> 0,61 (0,62)

O sea que llenando mas el canal no se cierra: MEJORA en dos de las seis y se queda igual
en tres. A x20 si empieza a comerselo (la cuadrada, 0,25 -> 0,20 contra 0,23) y el exceso
se va al 5 %, asi que x8 es el sitio.

El acierto de area BAJA —97,3 % a 96,6 % de mediana— y esa es la respuesta correcta a un
criterio que ya no es la diferencia simetrica: el numero que baja es el de la medida
vieja.
"""
import numpy as np, glob, pickle, sys, math, time
from scipy import ndimage
from PIL import Image, ImageDraw
sys.path.insert(0, '/home/user/hoks/sketches/hrrs/referencias'); sys.path.insert(0, '.')
import encaje as E
SS = 3
MARG = 3.0
LAM = float(sys.argv[1]) if len(sys.argv) > 1 else 4.0
SUF = sys.argv[2] if len(sys.argv) > 2 else 'L'


def pintaCaja(bandas, y0, y1, x0, x1, ss=SS):
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


def coste(A, B, w):
    """La falta pesa LAM; el exceso, uno. Los dos por el mapa del canal."""
    fa = ((A & ~B).astype(np.float64) * w).sum()
    so = ((B & ~A).astype(np.float64) * w).sum()
    u = ((A | B).astype(np.float64) * w).sum()
    return (LAM*fa + so), u


for f in sorted(glob.glob('orig_*.npy')):
    n = f[5:-4]; A = np.load(f)
    b, W, sh = pickle.load(open(f'fitT_{n}.pkl', 'rb'))
    w = E.pesoCanal(A, W, 8.0)
    b = [(list(p), list(h)) for p, h in b]
    H, Wp = A.shape
    B = E.pinta(b, A.shape, ss=SS)
    X, U = coste(A, B, w)
    t0 = time.time()
    fa0 = (A & ~B).sum()/A.sum(); so0 = (B & ~A).sum()/A.sum()

    def caja(k, i):
        pts, hs = b[k]
        js = [j for j in (i-1, i, i+1) if 0 <= j < len(pts)]
        m = max(hs[j] for j in js) + MARG
        return (max(0, int(min(pts[j][1] for j in js) - m)),
                min(H, int(max(pts[j][1] for j in js) + m) + 1),
                max(0, int(min(pts[j][0] for j in js) - m)),
                min(Wp, int(max(pts[j][0] for j in js) + m) + 1))

    def prueba(k, i, nuevo):
        global X, U
        y0, y1, x0, x1 = caja(k, i)
        if y1 <= y0 or x1 <= x0:
            return False
        sa = A[y0:y1, x0:x1]; sw = w[y0:y1, x0:x1]; sb = B[y0:y1, x0:x1]
        xa, ua = coste(sa, sb, sw)
        viejo = b[k]
        b[k] = nuevo
        nb = pintaCaja(b, y0, y1, x0, x1)
        xn, un = coste(sa, nb, sw)
        if (X - xa + xn) / (U - ua + un) < X / U - 1e-12:
            X = X - xa + xn; U = U - ua + un
            B[y0:y1, x0:x1] = nb
            return True
        b[k] = viejo
        return False

    for d in (0.6, 0.35, 0.2, -0.15):
        c = [(p, [v + d for v in h]) for p, h in b]
        Bc = E.pinta(c, A.shape, ss=SS)
        xc, uc = coste(A, Bc, w)
        if xc / uc < X / U:
            b, B, X, U = [(list(p), list(h)) for p, h in c], Bc, xc, uc

    for vuelta in range(4):
        for k in range(len(b)):
            for i in range(len(b[k][0])):
                for d in (0.5, -0.5, 0.25, -0.25, 0.12, -0.12):
                    nh = list(b[k][1]); nh[i] = max(0.5, nh[i] + d)
                    if prueba(k, i, (b[k][0], nh)):
                        break
                for dx, dy in ((0.4, 0), (-0.4, 0), (0, 0.4), (0, -0.4),
                               (0.2, 0), (-0.2, 0), (0, 0.2), (0, -0.2)):
                    np2 = list(b[k][0]); np2[i] = (np2[i][0] + dx, np2[i][1] + dy)
                    if prueba(k, i, (np2, b[k][1])):
                        break
    B = E.pinta(b, A.shape, ss=SS)
    pickle.dump((b, W, sh), open(f'fit{SUF}_{n}.pkl', 'wb'))
    fa = (A & ~B).sum()/A.sum(); so = (B & ~A).sum()/A.sum()
    print(f"{n}  falta {fa0:.1%} -> {fa:.1%}   sobra {so0:.1%} -> {so:.1%}"
          f"   area {1-E.dif(A,B):.1%}   {time.time()-t0:.0f}s", flush=True)
