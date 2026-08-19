"""LA PIEL DEL TRAZO, medida igual en las fotos y en lo nuestro.

«Ahora es demasiado irregular, parecen nubes, y el grosor es demasiado variable.»

Nubes y grosor variable son la MISMA queja vista dos veces, y no es «hay demasiada
irregularidad»: es que toda la que hay está en la escala equivocada. Una banda que se abre y se
cierra despacio parece una nube; una banda que tiembla deprisa parece dibujada a mano. Así que
esto no mide cuánto respira el filo —eso ya se midió— sino A QUÉ ESCALA respira, y lo hace con
el MISMO código sobre las fotos que él miró y sobre lo que sale de nuestro generador, que es la
única manera de que los dos números se puedan restar.

  sd total ..... la desviación de la semianchura, en anchuras de banda
  sd lenta ..... lo que sobrevive a una media móvil de una anchura (el CUERPO: abre y cierra)
  sd rápida .... lo que la media móvil se lleva (el FILO: el borde del corte)
  escala ....... cada cuántas anchuras la semianchura deja de parecerse a sí misma

Y EL SUELO DEL METODO, que es la razón de que exista el control: la semianchura se lee de la
transformada de distancia, que va en píxeles enteros, así que una banda matemáticamente lisa NO
mide cero. Mide ~0,29/W por pura cuantización. Con r1 a 12 px eso es 0,024 —un tercio de su
0,072— y sin restarlo estaríamos persiguiendo el ruido del medidor.

  python3 piel.py fotos              las seis referencias
  python3 piel.py color              el papel y la tinta de cada una, y su contraste
  python3 piel.py png a.png b.png    lo que sea que hayas renderizado (`piel.js` lo renderiza)
  python3 piel.py control            la banda lisa y la banda rota, que es lo que da sentido al 0

Las fotos no están en el repo —son de Chillida y esto se publica— así que se buscan en `refs4/`
o donde diga HRRS_REFS.
"""
import sys, os, math, glob
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize
from skimage.filters import threshold_otsu

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.environ.get('HRRS_REFS', os.path.join(AQUI, 'refs4'))

VEC = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def tinta(path, lado=1400):
    """la máscara de tinta de una foto: lo oscuro, sin motas"""
    im = Image.open(path).convert('L')
    e = lado / max(im.size)
    if e < 1:
        im = im.resize((max(1, int(im.size[0] * e)), max(1, int(im.size[1] * e))), Image.LANCZOS)
    A = np.asarray(im, float)
    m = A < threshold_otsu(A)
    # fuera motas y fuera agujeros de un pelo
    lab, n = ndimage.label(m)
    if n:
        tam = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, 1 + np.flatnonzero(tam > 0.0004 * m.size))
    return ndimage.binary_closing(m, np.ones((3, 3)))


def poda(esq, vueltas):
    """quita las púas del esqueleto: los pelos que salen del filo áspero y no son trazo.

    Sin esto un borde con temblor da un esqueleto lleno de espinas, y no sólo se mide mal —cada
    espina es una rama corta con la DT casi a cero— sino que el barrido de abajo se queda dando
    vueltas. Es la poda de siempre: quitar los extremos tantas veces como largo tenga la púa."""
    e = esq.copy()
    k = np.ones((3, 3)); k[1, 1] = 0
    for _ in range(int(vueltas)):
        g = ndimage.convolve(e.astype(np.uint8), k.astype(np.uint8), mode='constant')
        fin = e & (g <= 1)
        if not fin.any():
            break
        e = e & ~fin
    return e


def ramas(esq, minimo=40, tope=60):
    """los HILOS LARGOS del esqueleto: el más largo, y luego el más largo de lo que queda.

    Cortar por las bifurcaciones —que es lo primero que uno hace— aquí no vale, y por una razón
    que sólo aparece midiendo: un filo con temblor da un esqueleto sembrado de te-es, así que el
    recorrido de un trazo entero sale partido en veinte trozos de veinte píxeles y ninguno llega
    a la longitud mínima para medirle nada. Contra eso no hay poda que valga; lo que hay es no
    cortar. De cada componente se saca el camino más largo —el diámetro, por doble BFS—, se
    aparta, y se vuelve a empezar con lo que sobra."""
    px = {(y, x) for y, x in zip(*np.nonzero(esq))}
    gr = {p: [q for q in ((p[0] + dy, p[1] + dx) for dy, dx in VEC) if q in px] for p in px}
    vivos = set(px)

    def lejos(o):
        """BFS desde o: el más lejano y de dónde viene cada uno"""
        de = {o: None}; cola = [o]; i = 0; ult = o
        while i < len(cola):
            p = cola[i]; i += 1; ult = p
            for q in gr[p]:
                if q in vivos and q not in de:
                    de[q] = p; cola.append(q)
        return ult, de

    out = []
    while vivos and len(out) < tope:
        # una componente cualquiera, y su camino más largo
        o = next(iter(vivos))
        a, _ = lejos(o)
        b, de = lejos(a)
        cam = []
        p = b
        while p is not None:
            cam.append(p); p = de[p]
        comp = set(de)
        vivos -= set(cam)
        if len(cam) >= minimo:
            out.append(cam)
        elif len(comp) < minimo:
            vivos -= comp          # esa componente ya no puede dar nada, fuera entera
    return out


def corr_len(v, W):
    v = v - v.mean()
    if v.std() < 1e-9:
        return float('nan')
    ac = np.correlate(v, v, 'full')[len(v) - 1:]
    ac = ac / ac[0]
    for k in range(1, len(ac)):
        if ac[k] < 0.5:
            return k / W
    return len(ac) / W


def piel(m, nombre='', W_fijo=None):
    """la semianchura a lo largo de cada rama, y sus tres escalas"""
    if not m.any():
        return None
    dt = ndimage.distance_transform_edt(m)
    e0 = skeletonize(m)
    W0 = W_fijo or 2 * float(np.median(dt[e0]))
    if W0 < 3:
        return None
    esq = poda(e0, max(2, W0 * 0.5))
    cams = ramas(esq, minimo=int(6 * W0))
    if not cams:
        return None
    semis_todas = np.concatenate([[dt[y, x] for y, x in c] for c in cams]) if cams else np.array([])
    W = W_fijo if W_fijo else 2 * float(np.median(semis_todas))
    if W < 3:
        return None
    tot, len_, rap, esc, nb = [], [], [], [], 0
    recorte = max(2, int(round(W * 0.9)))      # los cabos y las bifurcaciones sesgan la DT a la baja
    for c in cams:
        v = np.array([dt[y, x] for y, x in c], float)
        if len(v) < 2 * recorte + int(4 * W):
            continue
        v = v[recorte:-recorte]
        if v.mean() < W * 0.25:
            continue
        k = max(3, int(round(W)))
        sm = np.convolve(v, np.ones(k) / k, 'same')[k:-k]
        vv = v[k:-k]
        if len(vv) < 8:
            continue
        tot.append(vv.std() / W)
        len_.append(sm.std() / W)
        rap.append((vv - sm).std() / W)
        esc.append(corr_len(vv, W))
        nb += 1
    if not nb:
        return None
    f = lambda a: float(np.nanmedian(a))
    return dict(nombre=nombre, W=W, ramas=nb, tot=f(tot), lento=f(len_), rapido=f(rap), esc=f(esc))


def fila(r, suelo=None):
    if r is None:
        return '   (sin ramas medibles)'
    c = lambda v: math.sqrt(max(0.0, v * v - suelo * suelo)) if suelo else v
    return '%-16s %5.0f %6d %8.3f %8.3f %8.3f %8.1f' % (
        r['nombre'][:16], r['W'], r['ramas'], c(r['tot']), c(r['lento']), c(r['rapido']), r['esc'])


CAB = '%-16s %5s %6s %8s %8s %8s %8s' % ('', 'W px', 'ramas', 'sd tot', 'sd lenta', 'sd rápid', 'escala')


# ── el control: una banda lisa de verdad y una banda rota a propósito ─────────────────────────
def banda(W, largo, amp_lenta=0.0, amp_rapida=0.0, semilla=7):
    """una cinta CURVA con la semianchura que se le pida, en píxeles enteros.

    Curva a propósito: una cinta horizontal es el único caso en que la transformada de distancia
    no se equivoca —la retícula está alineada con el filo— y da cero exacto. Medir el suelo del
    método con ella sería medirlo donde el método no falla. Una cinta que pasa por todas las
    orientaciones dice lo que de verdad cuesta leer un filo en una retícula."""
    rg = np.random.default_rng(semilla)
    L = int(W * largo)
    A = W * 3.0
    x = np.arange(0, L, 0.35)
    y = A * np.sin(2 * np.pi * x / (W * 14.0))
    H = int(A * 2 + W * 4); Wd = int(L + W * 3)
    cy, cx = H / 2 + y, W * 1.5 + x
    eje = np.zeros((H, Wd), bool)
    ii = np.clip(np.round(cy).astype(int), 0, H - 1)
    jj = np.clip(np.round(cx).astype(int), 0, Wd - 1)
    eje[ii, jj] = True
    # a cada punto del eje su semianchura, y el pixel se pinta si cae dentro de la del eje mas cerca
    s = np.full(len(x), W / 2.0)
    if amp_lenta:
        s = s + amp_lenta * W * np.sin(2 * np.pi * x / (W * 4.0) + rg.random() * 6.28)
    if amp_rapida:
        ru = rg.standard_normal(len(x))
        ru = np.convolve(ru, np.ones(3) / 3, 'same')
        s = s + amp_rapida * W * ru / (ru.std() or 1)
    smapa = np.zeros((H, Wd)); smapa[ii, jj] = 0
    for k in range(len(x)):
        smapa[ii[k], jj[k]] = s[k]
    d, idx = ndimage.distance_transform_edt(~eje, return_indices=True)
    return d <= smapa[idx[0], idx[1]]


def control():
    print(CAB)
    fallo = 0
    for W in (12, 38):
        lisa = piel(banda(W, 30), 'lisa W=%d' % W)
        rota = piel(banda(W, 30, amp_lenta=0.06, amp_rapida=0.05), 'rota W=%d' % W)
        print(fila(lisa)); print(fila(rota))
        if lisa is None or rota is None:
            print('   CONTROL: no mide'); fallo = 1; continue
        # No basta con que la banda rota dé más que la lisa: hay que INYECTAR una cantidad conocida
        # y ver si el medidor la devuelve. La lenta es un seno de amplitud 0,06 → sd 0,042; la
        # rápida es ruido de sd 0,05. Se le resta en cuadratura el suelo, que es lo que la lisa dice.
        q = lambda a, b: math.sqrt(max(0.0, a * a - b * b))
        for cual, dio, esperado in (('lenta', q(rota['lento'], lisa['lento']), 0.06 / math.sqrt(2)),
                                    ('rápida', q(rota['rapido'], lisa['rapido']), 0.05)):
            ok = 0.4 * esperado < dio < 1.6 * esperado
            print('   %s: inyectado %.3f → devuelve %.3f  %s'
                  % (cual, esperado, dio, 'ok' if ok else 'NO DISPARA'))
            if not ok:
                fallo = 1
    print('\nEL SUELO DEL MÉTODO (lo que mide una banda que no respira nada):')
    for W in (12, 20, 30, 38):
        r = piel(banda(W, 30), 'lisa')
        print('   W=%2d px  →  sd total %.3f   lenta %.3f   rápida %.3f' %
              (W, r['tot'], r['lento'], r['rapido']))
    return fallo


def color(path):
    """el papel y la tinta de una foto, y cuánto se separan de verdad.

    «Quizás es un juego entre el color del fondo y el color del trazo: al no ser blanco puro, igual
    el contraste no se ve tanto.» Es medible, así que se mide. Se coge el corazón de cada zona
    —erosionando la máscara— para no leer el borde, que es mezcla de los dos."""
    im = Image.open(path).convert('RGB')
    e = 1200 / max(im.size)
    if e < 1:
        im = im.resize((int(im.size[0] * e), int(im.size[1] * e)), Image.LANCZOS)
    A = np.asarray(im, float)
    g = A.mean(2)
    m = g < threshold_otsu(g)
    dentro = ndimage.binary_erosion(m, np.ones((7, 7)))
    fuera = ndimage.binary_erosion(~m, np.ones((7, 7)))
    if dentro.sum() < 50 or fuera.sum() < 50:
        dentro, fuera = m, ~m
    tin = np.median(A[dentro], 0)
    pap = np.median(A[fuera], 0)
    lum = lambda c: (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
    lt, lp = lum(tin), lum(pap)
    hexa = lambda c: '#%02x%02x%02x' % tuple(int(round(v)) for v in c)
    return hexa(pap), hexa(tin), (lp - lt) / (lp + lt + 1e-9)


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'fotos'
    if modo == 'control':
        sys.exit(control())
    if modo == 'color':
        print('%-4s %10s %10s %10s' % ('', 'papel', 'tinta', 'contraste'))
        for f in sorted(glob.glob(os.path.join(FOTOS, 'r?.*'))):
            pap, tin, c = color(f)
            print('%-4s %10s %10s %10.2f' % (os.path.basename(f).split('.')[0], pap, tin, c))
        print('\n(blanco puro sobre nuestra tinta #151412: %.2f)' % ((1 - 0.074) / (1 + 0.074)))
        sys.exit(0)
    print(CAB)
    if modo == 'fotos':
        for f in sorted(glob.glob(os.path.join(FOTOS, 'r?.*'))):
            n = os.path.basename(f).split('.')[0]
            r = piel(tinta(f), n)
            print(fila(r))
        print('\n(resta el suelo del método: python3 piel.py control)')
    else:
        for f in sys.argv[2:]:
            r = piel(tinta(f), os.path.basename(f).split('.')[0])
            print(fila(r))
