"""Extraccion de rasgos de las seis referencias. Todo con el mismo instrumento y todo
en unidades de la obra (anchuras o lados), para que se pueda comparar entre ellas y
contra la familia.

No se mide lo que ya sabemos que el motor tiene: se buscan los que le faltan.
"""
import numpy as np, glob, math, sys, json
from scipy import ndimage
from skimage.morphology import skeletonize
sys.path.insert(0, '/home/user/hoks/sketches/hrrs/referencias'); sys.path.insert(0, '.')
import encaje as E
G = E.G


def carga(r, lado=1200):
    a = G['recortar'](G['cargar'](r, lado)); t = a < G['otsu'](a)
    t = G['remove_small_holes'](G['remove_small_objects'](t, 128), 128)
    return G['soloElMaterial'](t)


def rasgos(A):
    H, Wd = A.shape; S = min(H, Wd)
    dt = ndimage.distance_transform_edt(A)
    W = G['moda'](2*dt[skeletonize(A)])
    b = E.ejesDe(A, W, dpTol=0.05)          # fino: para anchura y curvatura
    bg = E.ejesDe(A, W, dpTol=0.25)         # grueso: para quiebros de verdad
    R = {}
    R['W_lado'] = W/S
    R['tinta'] = float(A.mean())

    # ── el trazo ────────────────────────────────────────────────────────────────
    varAnc, largos, rectitud = [], [], []
    for p, h in b:
        L = sum(math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1))
        if L < W: continue
        hh = np.asarray(h)
        varAnc.append(float(np.std(hh)/max(1e-9, np.mean(hh))))
        largos.append(L/S)
    R['largo'] = float(np.median(largos)) if largos else 0
    R['largoP90'] = float(np.percentile(largos, 90)) if largos else 0
    R['vibraAncho'] = float(np.median(varAnc)) if varAnc else 0

    # quiebros: cuantos por longitud, y de que angulo
    angs, porLargo, giroTot, cuerda = [], [], [], []
    for p, h in bg:
        L = sum(math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1))
        if L < W: continue
        g = 0.0
        for i in range(1, len(p)-1):
            a1 = math.atan2(p[i][1]-p[i-1][1], p[i][0]-p[i-1][0])
            a2 = math.atan2(p[i+1][1]-p[i][1], p[i+1][0]-p[i][0])
            d = math.degrees(a2-a1) % 360
            if d > 180: d -= 360
            if abs(d) > 8: angs.append(abs(d))
            g += d
        porLargo.append((len(p)-2)/(L/W))
        giroTot.append(abs(g)/360.0)
        cuerda.append(math.hypot(p[-1][0]-p[0][0], p[-1][1]-p[0][1])/max(1e-9, L))
    R['quiebrosPorAnchura'] = float(np.median(porLargo)) if porLargo else 0
    R['anguloQuiebro'] = float(np.median(angs)) if angs else 0
    R['quiebroRecto'] = float(np.mean([70 <= a <= 110 for a in angs])) if angs else 0
    R['cierre'] = float(np.percentile(giroTot, 90)) if giroTot else 0
    R['cuerda'] = float(np.median(cuerda)) if cuerda else 0

    # direcciones: se alinean a pocos rumbos?
    dirs, pes = [], []
    for p, h in bg:
        for i in range(len(p)-1):
            dx, dy = p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]
            m = math.hypot(dx, dy)
            if m < W*0.5: continue
            dirs.append(math.degrees(math.atan2(dy, dx)) % 180); pes.append(m)
    if dirs:
        hst, _ = np.histogram(dirs, bins=18, range=(0, 180), weights=pes)
        hst = hst/max(1e-9, hst.sum())
        R['rumbos'] = float(np.sort(hst)[::-1][:4].sum())   # cuanta longitud en 4 rumbos
        R['ortogonal'] = float(sum(hst[i] for i in (0, 9, 17)))
    else:
        R['rumbos'] = R['ortogonal'] = 0

    # ── la relacion ─────────────────────────────────────────────────────────────
    fondo = ~A
    dtf = ndimage.distance_transform_edt(fondo); esqF = skeletonize(fondo)
    v = 2*dtf[esqF]; v = v[(v > 1) & (v < W)]
    if len(v) >= 20:
        med = float(np.median(v))
        R['canal'] = med/W
        R['canalConst'] = float((np.abs(v-med) <= 0.1*W).mean())
    else:
        R['canal'] = R['canalConst'] = 0
    borde = A & ~ndimage.binary_erosion(A)
    canal = esqF & (2*dtf < W) & (dtf > 0)
    R['acompana'] = float(canal.sum()*2)/max(1, borde.sum())
    R['linea'] = float(skeletonize(A).sum())/S
    R['piezas'] = int(ndimage.label(A)[1])
    R['ojos'] = int(ndimage.label(ndimage.binary_fill_holes(A) & ~A)[1])

    # gravedad: donde esta la tinta contra donde estaria repartida
    ys, xs = np.nonzero(A)
    R['dispersion'] = float(np.mean(np.hypot(xs-xs.mean(), ys-ys.mean()))/S)
    # margen: cuanto se acerca la tinta al borde del cuadro
    R['margen'] = float(min(xs.min(), ys.min(), Wd-1-xs.max(), H-1-ys.max())/S)
    R['sangra'] = float((xs.min() <= 1) or (ys.min() <= 1) or
                        (xs.max() >= Wd-2) or (ys.max() >= H-2))
    return R


FILAS = ['W_lado', 'largo', 'largoP90', 'vibraAncho', 'quiebrosPorAnchura',
         'anguloQuiebro', 'quiebroRecto', 'cierre', 'cuerda', 'rumbos', 'ortogonal',
         'canal', 'canalConst', 'acompana', 'linea', 'piezas', 'ojos',
         'dispersion', 'margen', 'sangra', 'tinta']
NOM = {'W_lado':'anchura / lado', 'largo':'largo del trazo (lados)',
       'largoP90':'el mas largo (p90)', 'vibraAncho':'vibracion de grosor (cv)',
       'quiebrosPorAnchura':'quiebros por anchura', 'anguloQuiebro':'angulo de quiebro',
       'quiebroRecto':'quiebros a escuadra', 'cierre':'cierre del circuito (p90)',
       'cuerda':'cuerda / largo', 'rumbos':'longitud en 4 rumbos',
       'ortogonal':'longitud en los ejes', 'canal':'canal (anchuras)',
       'canalConst':'constancia del canal', 'acompana':'cuanto se acompanan',
       'linea':'linea total (lados)', 'piezas':'piezas', 'ojos':'suelo encerrado',
       'dispersion':'dispersion de la tinta', 'margen':'margen al borde',
       'sangra':'sangra', 'tinta':'tinta'}
res = {}
for r in sorted(glob.glob('refs4/r*')):
    n = r.split('/')[-1].split('.')[0]
    res[n] = rasgos(carga(r))
json.dump(res, open('rasgos.json', 'w'))
print(f"{'':<26}" + ''.join(f"{n:>9}" for n in res) + f"{'mediana':>10}")
for k in FILAS:
    v = [res[n][k] for n in res]
    print(f"{NOM[k]:<26}" + ''.join(f"{res[n][k]:>9.2f}" for n in res) +
          f"{np.median(v):>10.2f}")
