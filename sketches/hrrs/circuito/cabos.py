"""LOS CABOS DE r1 A r6, uno a uno.

Cada trazo tiene dos cabos y en las seis obras hay 114. La pregunta no es cuántos mueren
al aire —eso ya se midió— sino QUÉ HACE cada uno: contra qué muere, a qué distancia, con
qué ángulo, y si el trazo llega o pasa de largo.

Se mide sobre `mano.json` —los ejes que el autor marcó— y en ANCHURAS DE BANDA reales,
que es la única unidad en la que las seis se pueden comparar entre sí: sus bandas van de
0,0325 a 0,0909 del lado corto, casi el triple de una a otra.
"""
import json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
MANO = json.load(open(os.path.join(AQUI, 'mano.json')))

# la anchura de banda real de cada obra, del trazador, normalizada por el lado corto
W_REAL = {'r1': 0.0325, 'r2': 0.0417, 'r3': 0.0536,
          'r4': 0.0523, 'r5': 0.0909, 'r6': 0.0889}


def dist_punto_tramo(p, a, b):
    ex, ey = b[0] - a[0], b[1] - a[1]
    l2 = ex * ex + ey * ey
    u = ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / l2 if l2 > 1e-18 else 0.0
    u = max(0.0, min(1.0, u))
    qx, qy = a[0] + ex * u, a[1] + ey * u
    return math.hypot(p[0] - qx, p[1] - qy), (qx, qy), u, math.atan2(ey, ex)


def cerca_de(p, t):
    """el punto más próximo de una polilínea, con su tangente y su posición en el recorrido"""
    mejor = None
    L = [0.0]
    for i in range(len(t) - 1):
        L.append(L[-1] + math.hypot(t[i + 1][0] - t[i][0], t[i + 1][1] - t[i][1]))
    for i in range(len(t) - 1):
        d, q, u, ang = dist_punto_tramo(p, t[i], t[i + 1])
        if mejor is None or d < mejor[0]:
            s = L[i] + u * (L[i + 1] - L[i])
            mejor = (d, q, ang, s, L[-1])
    return mejor


def analiza(obra):
    m = MANO[obra]
    W = W_REAL[obra]
    pw, ph = m['px']
    corto = min(pw, ph)
    fw, fh = pw / corto, ph / corto
    trazos = m['ejes']
    filas = []
    for k, t in enumerate(trazos):
        if len(t) < 2:
            continue
        for cual, idx in ((0, 0), (1, len(t) - 1)):
            p = t[idx]
            vec = t[1] if idx == 0 else t[-2]
            dir_llegada = math.atan2(p[1] - vec[1], p[0] - vec[0])
            # el vecino más próximo, y en qué parte de su recorrido cae
            mejor, cual_j = None, -1
            for j, o in enumerate(trazos):
                if j == k or len(o) < 2:
                    continue
                c = cerca_de(p, o)
                if mejor is None or c[0] < mejor[0]:
                    mejor, cual_j = c, j
            if mejor is None:
                continue
            d, q, ang_v, s, S = mejor
            dW = d / W
            # ¿cae cerca de un CABO del vecino o en mitad de su costado?
            al_cabo = min(s, S - s) / W
            # el ángulo con el que llega: 90° es una T, 0° es tangencial
            dif = abs(((dir_llegada - ang_v + math.pi / 2) % math.pi) - math.pi / 2)
            ang = math.degrees(dif)
            # ¿está el cabo pegado al borde del pliego?
            borde = min(p[0], fw - p[0], p[1], fh - p[1]) / W
            # ¿el trazo LLEGA o pasa de largo? Si prolongando su último tramo se acerca más al
            # vecino, es que apuntaba a él; si se aleja, pasaba de largo.
            ext = (p[0] + math.cos(dir_llegada) * W, p[1] + math.sin(dir_llegada) * W)
            d2 = cerca_de(ext, trazos[cual_j])[0] / W
            apunta = d2 < dW
            filas.append(dict(obra=obra, trazo=k, cabo=cual, d=dW, alCabo=al_cabo,
                              ang=ang, borde=borde, apunta=apunta))
    return filas, W, len(trazos)


def clase(f, LIBRE=2.5, CABO=2.0):
    if f['d'] > LIBRE:
        return 'al aire'
    if f['alCabo'] < CABO:
        return 'contra un cabo'
    return 'contra el costado'


if __name__ == '__main__':
    todas = []
    print('%-4s %6s %7s %8s %8s %9s %9s' %
          ('obra', 'trazos', 'cabos', 'al aire', 'a cabo', 'a costado', 'apuntan'))
    for o in ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']:
        fs, W, n = analiza(o)
        todas += fs
        c = {}
        for f in fs:
            c[clase(f)] = c.get(clase(f), 0) + 1
        ap = sum(1 for f in fs if f['apunta'] and clase(f) != 'al aire')
        noaire = max(1, len(fs) - c.get('al aire', 0))
        print('%-4s %6d %7d %8s %8s %9s %9s' % (
            o, n, len(fs),
            '%d (%.0f%%)' % (c.get('al aire', 0), 100 * c.get('al aire', 0) / len(fs)),
            '%d' % c.get('contra un cabo', 0),
            '%d' % c.get('contra el costado', 0),
            '%.0f%%' % (100 * ap / noaire)))
    n = len(todas)
    c = {}
    for f in todas:
        c[clase(f)] = c.get(clase(f), 0) + 1
    print('\nLAS SEIS JUNTAS: %d cabos' % n)
    for k in ['al aire', 'contra un cabo', 'contra el costado']:
        print('   %-18s %3d  (%.0f %%)' % (k, c.get(k, 0), 100 * c.get(k, 0) / n))

    pegados = [f for f in todas if clase(f) != 'al aire']
    ds = sorted(f['d'] for f in pegados)
    angs = sorted(f['ang'] for f in pegados)
    bord = sorted(f['borde'] for f in todas if clase(f) == 'al aire')
    pc = lambda v, q: v[min(len(v) - 1, int(q * len(v)))]
    print('\nEL QUE MUERE CONTRA ALGO (%d):' % len(pegados))
    print('   distancia al vecino, en anchuras:  p10=%.2f  mediana=%.2f  p90=%.2f'
          % (pc(ds, .1), pc(ds, .5), pc(ds, .9)))
    print('   ángulo de llegada:  p10=%.0f°  mediana=%.0f°  p90=%.0f°'
          % (pc(angs, .1), pc(angs, .5), pc(angs, .9)))
    tt = sum(1 for f in pegados if f['ang'] > 60)
    pp = sum(1 for f in pegados if f['ang'] < 25)
    print('   de frente (>60°): %d (%.0f %%)   tangencial (<25°): %d (%.0f %%)'
          % (tt, 100 * tt / len(pegados), pp, 100 * pp / len(pegados)))
    if bord:
        print('\nEL QUE MUERE AL AIRE (%d):' % len(bord))
        print('   distancia al borde del pliego, en anchuras:  p10=%.1f  mediana=%.1f'
              % (pc(bord, .1), pc(bord, .5)))
        print('   cabos al aire que están a menos de 2 anchuras del borde: %d de %d'
              % (sum(1 for b in bord if b < 2), len(bord)))

    # los dos cabos del mismo trazo, ¿hacen lo mismo?
    porTrazo = {}
    for f in todas:
        porTrazo.setdefault((f['obra'], f['trazo']), []).append(clase(f))
    ig = sum(1 for v in porTrazo.values() if len(v) == 2 and v[0] == v[1])
    print('\nLOS DOS CABOS DEL MISMO TRAZO hacen lo mismo en %d de %d trazos (%.0f %%)'
          % (ig, len(porTrazo), 100 * ig / len(porTrazo)))
