"""Leer las incisiones del original sin morder la banda.

La version basta las sacaba del esqueleto del fondo estrecho y las dibujaba con la
anchura del vertice. Tres agujeros:

  1. no comprobaba que hubiera tinta A LOS DOS LADOS, asi que colaba fondo exterior
     que simplemente pasa cerca de un trazo;
  2. simplificaba el corte con la tolerancia de un TRAZO (0,05 anchuras), y una
     incision curva enderezada se sale del hueco;
  3. tomaba la anchura en el vertice, cuando lo que tiene que caber es el tramo
     entero: basta que el hueco se estreche en medio para que el corte muerda.

Aqui: se comprueban los dos lados por la normal, se simplifica diez veces mas fino
—una incision no es un trazo, no tiene cadencia que respetar— y la anchura de cada
vertice es la MINIMA del tramo que llega hasta el.
"""
import numpy as np, glob, pickle, json, subprocess, sys, math
from scipy import ndimage
from skimage.morphology import skeletonize
sys.path.insert(0, '/home/user/hoks/sketches/hrrs/referencias'); sys.path.insert(0, '.')
import encaje as E
from PIL import Image
G = E.G
TOL = float(sys.argv[1]) if len(sys.argv) > 1 else 0.005
FAC = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0


def incisiones(A, W, escala):
    H, Wd = A.shape
    fondo = ~A
    dtf = ndimage.distance_transform_edt(fondo)
    esqF = skeletonize(fondo)
    cand = esqF & (2*dtf < W) & (dtf > 0)
    if not cand.any():
        return []
    # 1) tinta a los dos lados, con la normal de la PROPIA senda del canal. Con el
    #    gradiente de la distancia no vale: en la cresta es cero por definicion, y el
    #    test rechazaba todo (0 incisiones de 23).
    bueno = cand
    ramas, cabos, nudos = G['poligonales'](bueno)
    out = []
    for cam in ramas:
        # cada punto de la senda tiene que tener TINTA A LOS DOS LADOS, por su normal
        dos = 0
        for j in range(2, len(cam)-2):
            y, x = cam[j]
            dy = cam[j+2][0]-cam[j-2][0]; dx = cam[j+2][1]-cam[j-2][1]
            m = math.hypot(dx, dy) or 1e-9
            nx, ny = -dy/m, dx/m
            r = dtf[y, x] + 1.5
            a = (int(round(y + ny*r)), int(round(x + nx*r)))
            b2 = (int(round(y - ny*r)), int(round(x - nx*r)))
            if (0 <= a[0] < H and 0 <= a[1] < Wd and 0 <= b2[0] < H and 0 <= b2[1] < Wd
                    and A[a] and A[b2]):
                dos += 1
        if len(cam) < 6 or dos / max(1, len(cam)-4) < 0.7:
            continue
        sp = G['simplificar'](cam, max(0.4, W*TOL))
        if len(sp) < 2:
            continue
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L < W*0.4:
            continue
        # 3) la anchura de cada vertice, la MINIMA del tramo que llega hasta el
        pos = {}
        for i, (yy, xx) in enumerate(cam):
            pos.setdefault((float(xx), float(yy)), i)
        idx = [pos.get((p[0], p[1])) for p in sp]
        crudo = [float(dtf[min(H-1, max(0, int(y))), min(Wd-1, max(0, int(x)))]) for y, x in cam]
        anc = []
        for t, i in enumerate(idx):
            if i is None:
                anc.append(0.6); continue
            a = idx[t-1] if t > 0 and idx[t-1] is not None else i
            b = idx[t+1] if t < len(idx)-1 and idx[t+1] is not None else i
            lo, hi = min(a, i, b), max(a, i, b)
            anc.append(max(0.3, min(crudo[lo:hi+1]) * FAC))
        out.append(dict(eje=[[x/escala, y/escala] for x, y in sp],
                        anchos=[a/escala for a in anc]))
    return out


todo = []
for f in sorted(glob.glob('orig_*.npy')):
    n = f[5:-4]; A = np.load(f)
    b, W, sh = pickle.load(open(f'fitT_{n}.pkl', 'rb'))
    H, Wp = A.shape; S = min(H, Wp)
    cs = incisiones(A, W, S)
    todo.append(dict(nombre=n, px=[Wp, H], alto=max(H, Wp)/S, anchoLienzo=Wp/S, ancho=W/S,
                     canal=0.10, gubia=0, grano=0, relleno=0, vibra=0,
                     trazos=[dict(eje=[[p[0]/S, p[1]/S] for p in pts],
                                  anchos=[h/S for h in hs]) for pts, hs in b],
                     cortes=cs))
json.dump(todo, open('recetas_final.json', 'w'))
subprocess.run(['node', 'final.js'], check=True)
print(f"{'ref':<5}{'cortes':>8}{'acierto':>10}{'sobra':>8}{'falta':>8}   (sin cortes: 97,9/97,0/97,4/98,2/96,8/97,1)")
ac = []
for i, f in enumerate(sorted(glob.glob('orig_*.npy'))):
    n = f[5:-4]; A = np.load(f)
    B = np.asarray(Image.open(f'final/{n}.png').convert('L')) < 128
    v = 1 - E.dif(A, B); ac.append(v)
    print(f'{n:<5}{len(todo[i]["cortes"]):>8}{v:>10.1%}{(B & ~A).sum()/A.sum():>8.1%}'
          f'{(A & ~B).sum()/A.sum():>8.1%}')
print(f"\nmediana: {np.median(ac):.1%}")
