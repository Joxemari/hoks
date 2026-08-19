"""ajusta.py — minimizar la diferencia por pixel, referencia a referencia.

El trazador tiene mandos (cuanto se simplifica el eje, a partir de que grosor un
vertice se considera cruce y se tira, como se lee la anchura, cuanto se alarga el
cabo). En vez de razonar cada uno, se barren y se queda el mejor POR REFERENCIA, con
la diferencia de pixel como criterio.

La medida se hace bien: se recorta cada imagen a la caja de su tinta, se escala a un
tamano comun CONSERVANDO LA PROPORCION —deformar para cuadrar era otra manera de
mentirse— y se busca la mejor traslacion en un margen pequeno.
"""
import json, math, subprocess, itertools, sys
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize, remove_small_objects, remove_small_holes

BASE = '/home/user/hoks/sketches/hrrs/referencias/traza.py'
G = {}
exec(open(BASE).read().split("if __name__")[0], G)


def mascara(ruta):
    """La mascara de la OBRA, con el mismo filtro en los dos lados.

    Si al original se le deja el texto impreso y a la replica se le quita, la
    diferencia mide el pie del cartel y no el dibujo — el numero se disparo de 13 % a
    55 % por eso, y no por la reconstruccion."""
    a = G['recortar'](G['cargar'](ruta, 1200))
    t = a < G['otsu'](a)
    t = remove_small_holes(remove_small_objects(t, 128), 128)
    return G['soloElMaterial'](t)


def encaja(A, B, lado=520, margen=0.03):
    """Recorta a la caja de la tinta, escala CONSERVANDO PROPORCION y busca traslacion."""
    def prep(M):
        ys, xs = np.nonzero(M)
        M = M[ys.min():ys.max()+1, xs.min():xs.max()+1]
        h, w = M.shape
        e = lado / max(h, w)
        im = Image.fromarray((M * 255).astype(np.uint8)).resize(
            (max(1, round(w*e)), max(1, round(h*e))), Image.NEAREST)
        return np.asarray(im) > 127
    a, b = prep(A), prep(B)
    H = max(a.shape[0], b.shape[0]) + 2*int(lado*margen) + 2
    W = max(a.shape[1], b.shape[1]) + 2*int(lado*margen) + 2
    def pon(M, dy, dx):
        c = np.zeros((H, W), bool)
        y0 = (H - M.shape[0])//2 + dy; x0 = (W - M.shape[1])//2 + dx
        c[y0:y0+M.shape[0], x0:x0+M.shape[1]] = M
        return c
    A2 = pon(a, 0, 0)
    mejor, mejorD = None, 1e9
    paso = max(1, int(lado * margen / 4))
    for dy in range(-int(lado*margen), int(lado*margen)+1, paso):
        for dx in range(-int(lado*margen), int(lado*margen)+1, paso):
            B2 = pon(b, dy, dx)
            d = (A2 ^ B2).sum() / max(1, (A2 | B2).sum())
            if d < mejorD:
                mejorD, mejor = d, B2
    return A2, mejor, mejorD


def receta(ruta, p):
    """Traza con los mandos dados. Copia reducida de traza.analizar, parametrizada."""
    a = G['recortar'](G['cargar'](ruta, 1200))
    H, W = a.shape
    t = a < G['otsu'](a)
    t = remove_small_holes(remove_small_objects(t, 128), 128)
    dt = ndimage.distance_transform_edt(t)
    esq = skeletonize(t)
    anchoPx = G['moda'](2 * dt[esq])
    ramasX = G['bandas'](esq, dt, anchoPx)
    lado = min(H, W)
    tol = max(1.0, anchoPx * p['dp'])
    polis, anchos = [], []
    for cam, c0, c1 in ramasX:
        sp = G['simplificar'](cam, tol)
        if len(sp) < 2:
            continue
        if p['cruce'] and len(sp) > 2:
            lim = anchoPx * p['cruce']
            def gr(q):
                yy = min(H-1, max(0, int(round(q[1])))); xx = min(W-1, max(0, int(round(q[0]))))
                return 2*float(dt[yy, xx])
            sp = [sp[0]] + [q for q in sp[1:-1] if gr(q) <= lim] + [sp[-1]]
        crudo = []
        for yy0, xx0 in cam:
            yy = min(H-1, max(0, int(yy0))); xx = min(W-1, max(0, int(xx0)))
            crudo.append(float(dt[yy, xx]))
        k = int(anchoPx * 0.6)
        limpio = crudo[k:-k] if len(crudo) > 2*k+4 else crudo
        if p['cruce']:
            limpio = [v for v in limpio if 2*v <= anchoPx * p['cruce']] or limpio
        base = (float(G['moda'](np.asarray(limpio), 0.5)) or float(np.median(crudo)) or anchoPx/2) * p['esc']
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L < anchoPx * 1.1:
            continue
        if p['alarga'] and len(sp) >= 2:
            def al(p0, p1, h):
                dx, dy = p0[0]-p1[0], p0[1]-p1[1]
                m = math.hypot(dx, dy) or 1e-9
                return (p0[0]+dx/m*h, p0[1]+dy/m*h)
            sp = [al(sp[0], sp[1], base*p['alarga'])] + sp[1:-1] + [al(sp[-1], sp[-2], base*p['alarga'])]
        polis.append([[round(x/lado, 4), round(y/lado, 4)] for x, y in sp])
        anchos.append([round(base/lado, 5)]*len(sp))
    return {'nombre': ruta.split('/')[-1], 'alto': round(H/lado, 4), 'anchoLienzo': round(W/lado, 4),
            'ancho': round(anchoPx/lado, 4), 'canal': 0.10,
            'trazos': [{'eje': e, 'anchos': a2} for e, a2 in zip(polis, anchos)]}


REJILLA = [
    {'dp': dpv, 'cruce': cr, 'esc': es, 'alarga': al}
    for dpv in (0.18, 0.28)
    for cr in (0, 1.22, 1.45)
    for es in (0.88, 1.0, 1.12)
    for al in (0, 0.5, 1.0)
]

if __name__ == '__main__':
    refs = sys.argv[1:] or ['refs4/r1.webp']
    for r in refs:
        A = mascara(r)
        mejor, mejorP, mejorD = None, None, 1e9
        for p in REJILLA:
            rec = receta(r, p)
            if not rec['trazos']:
                continue
            json.dump([rec], open('rec_uno.json', 'w'))
            subprocess.run(['node', 'rep_uno.js'], capture_output=True)
            try:
                B = mascara('reps_opt/uno.png')
            except Exception:
                continue
            _, _, d = encaja(A, B)
            if d < mejorD:
                mejorD, mejorP, mejor = d, p, rec
        print(f"{r.split('/')[-1]:<12} diferencia {mejorD:.1%}   {mejorP}")
        json.dump(mejor, open(f"best_{r.split('/')[-1].split('.')[0]}.json", 'w'))
