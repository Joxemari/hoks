"""LAS RENDIJAS: los huecos de papel MÁS ESTRECHOS QUE UN CANAL.

Nació buscando cuñas en los cruces —«no hay rellenos», «las intersecciones no rellenadas»— y lo que
encontró fue otra cosa, más simple y más gorda. Conviene que se lea en ese orden, porque la hipótesis
era mía y la tiró la medida:

  1. Los cruces casi no existen, ni en las seis ni en lo nuestro: 0,2 cruces de eje por obra en las
     referencias (sólo r5 tiene uno) y 0,0 en las nuestras. No había cuñas de cruce que rellenar.
  2. Los trazos de las seis NO se solapan nunca: contando islas de tinta salen tantas como trazos
     —8 de 8 en r1, 11 de 11 en r2, 7 para 6 en r5—. Su regla absoluta es exactamente lo que hace
     Chillida, y esto lo comprueba en el píxel.
  3. Lo que cambia de obra a obra es la ANCHURA del canal, y cambia mucho más de lo que suponíamos:
     r5 y r6 tienen la misma banda —0,0909 y 0,0889— y canales de 0,06 y 0,19. El «0,22 de las seis»
     con el que estaba calibrado el generador era la media de seis números que van de 0,06 a 0,29,
     y una media de seis obras no es la medida de ninguna.

De ahí salió el cambio: la rama estrecha del canal iba de 0,17 a 0,25 y no podía dar ni el 0,06 de
r5 ni el 0,11 de r3. En banda gorda dejábamos cuatro veces más blanco que r5 — que es la obra que él
nombra cuando dice que en líneas gordas estamos lejos.

Se mide sobre el PÍXEL y no sobre los ejes, porque es donde él lo ve, y con el mismo código en las
seis fotos y en nuestros renders, que es la única forma de que la comparación signifique algo.

Y una advertencia que costó dos vueltas: r2 y r4 no se pueden medir así. En sus fotos entra el muro
o el marco, la máscara de tinta se los come y la medida cae al suelo de dos píxeles del método —de
ahí que la tabla diera 0,062 tres veces—. Eso no se ve en la tabla; se ve mirando el recorte.

    ancho de rendija = 2 × distancia al borde, en el esqueleto del PAPEL.

El esqueleto del papel corre por el centro de cada hueco; la transformada de distancia dice cuánto
hay desde ahí hasta la tinta más próxima. Se conserva sólo lo que baja de una anchura de banda —el
campo abierto y el margen de la hoja se caen solos por anchos, y así una cuña que llega al canto
sigue contando, que el control me obligó a arreglar— y se cuenta en anchuras de banda, con la banda
medida en la propia imagen, para que fotos y renders vayan en la misma unidad.

    python3 rendija.py fotos              las seis
    python3 rendija.py png a.png b.png    lo nuestro (`tanda.js` o `piel.js` los renderiza)
    python3 rendija.py control            el instrumento contra un caso conocido
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize
from skimage.filters import threshold_otsu

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.environ.get('HRRS_REFS', os.path.join(AQUI, 'refs4'))


def tinta(path, lado=1400):
    """la máscara de tinta: lo oscuro, sin motas. Igual que en piel.py, a propósito."""
    im = Image.open(path).convert('L')
    e = lado / max(im.size)
    if e < 1:
        im = im.resize((max(1, int(im.size[0] * e)), max(1, int(im.size[1] * e))), Image.LANCZOS)
    A = np.asarray(im, float)
    m = A < threshold_otsu(A)
    lab, n = ndimage.label(m)
    if n:
        tam = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, 1 + np.flatnonzero(tam > 0.0004 * m.size))
    return ndimage.binary_closing(m, np.ones((3, 3)))


def anchura(m):
    """la anchura de banda de la imagen: mediana de 2×distancia al borde sobre el eje de la tinta.
    Es la misma definición que usa piel.py para el grosor, así que las dos hablan de lo mismo."""
    d = ndimage.distance_transform_edt(m)
    esq = skeletonize(m)
    v = 2.0 * d[esq]
    return float(np.median(v)) if v.size else float('nan')


def rendijas(m, W):
    """anchos de los huecos de papel ESTRECHOS, en anchuras de banda.

    Primero se probó quedarse con el papel ENCERRADO entre trazos, contando el que toca el canto
    como margen de hoja. El control lo tumbó: dos bandas que cruzan cerca del borde dejan una cuña
    que llega al canto, y esa cuña se ve igual. Una rendija se define por lo ESTRECHA que es, no por
    su topología. Así que se mide el eje de TODO el papel y se conserva sólo lo que baja de una
    anchura de banda: el campo abierto y el margen de la hoja se caen solos por anchos."""
    papel = ~m
    if not papel.any():
        return np.array([]), 0
    # la distancia va contra la TINTA, así que una cuña que sale de un hueco grande y se afila hacia
    # la punta se mide bien en toda su longitud
    d = ndimage.distance_transform_edt(papel)
    esq = skeletonize(papel)
    v = 2.0 * d[esq] / W
    v = v[(v > 0) & (v < 1.0)]
    # HAY QUE SEPARAR LA CUÑA DEL GRANO, o esto mide el papel y no la obra: sin filtro las fotos daban
    # 96 y 110 rendijas, con r5 en una mediana de 0,06 anchuras, y eso son motas de tres o cuatro
    # píxeles del grano de la litografía, que a 75 px de banda caen justo por debajo del canal.
    #
    # El primer filtro fue el LARGO —una cuña mide al menos una banda— y se lo cargó el control: a 20°
    # el hueco se cierra en 24 px, media banda, así que descartaba la cuña de verdad junto con el
    # grano. El largo no es lo que las distingue.
    #
    # Lo que las distingue es a qué están pegadas. Una mota es una ISLA de papel dentro de la tinta.
    # Una cuña es la PUNTA DEL CAMPO ABIERTO afilándose entre dos bandas: la misma región de papel
    # que, unos píxeles más allá, es ancha. Así que se pide eso — que la región de papel llegue a
    # medir más de una banda en alguna parte — y el largo se queda en un suelo mínimo, sólo para que
    # un píxel de borde suelto no cuente como rendija.
    ancho = papel & (2.0 * d > W)
    reg, nreg = ndimage.label(papel, np.ones((3, 3)))
    campos = set(np.unique(reg[ancho])) - {0}
    finas = esq & (2.0 * d / W < 0.22) & (d > 0) & np.isin(reg, list(campos))
    lab, n = ndimage.label(finas, np.ones((3, 3)))
    largo = 0.0
    vale = 0
    if n:
        tam = ndimage.sum(finas, lab, range(1, n + 1))     # píxeles de eje ≈ largo en píxeles
        buenas = tam >= max(3, 0.15 * W)
        vale = int(buenas.sum())
        largo = float(tam[buenas].sum()) / W
    return v, vale, largo


def fila(nom, m, W_px=None):
    W = W_px if W_px else anchura(m)
    v, cuantas, largo = rendijas(m, W)
    if v.size == 0:
        print('  %-12s  W %5.1f px   sin papel estrecho' % (nom, W))
        return
    q = lambda p: float(np.percentile(v, p))
    print('  %-12s  W %5.1f px   rendijas %3d   estrecho p05 %.2f  p25 %.2f  med %.2f   '
          'largo %5.1f' % (nom, W, cuantas, q(5), q(25), q(50), largo))


CAB = ('  imagen           banda     rendijas   ancho del papel estrecho (anchuras)  '
       'largo bajo 0,22')

if sys.argv[1:2] == ['control']:
    # dos bandas rectas que se cruzan en ángulo: la cuña es conocida y se puede calcular a mano.
    # Con W px de banda y un ángulo A entre ellas, el hueco entre los dos brazos se afila a cero,
    # así que TIENE que haber rendija por debajo de un canal. Y el control limpio: dos bandas
    # paralelas separadas 0,22 W, donde la rendija tiene que medir 0,22 y ni una menos.
    N, W = 900, 40
    lim = np.zeros((N, N), bool)
    y = np.arange(N)[:, None] * np.ones((1, N))
    x = np.ones((N, 1)) * np.arange(N)[None, :]
    lim |= np.abs(y - 300) < W / 2
    lim |= np.abs(y - (300 + W * 1.22)) < W / 2
    print('CONTROL — dos bandas paralelas a canal exacto (0,22) y dos que se cruzan en 20°:')
    print(CAB)
    fila('paralelas', lim, W)
    cru = np.zeros((N, N), bool)
    cru |= np.abs(y - 450) < W / 2
    cru |= np.abs((y - 450) - (x - 100) * np.tan(np.radians(20))) < W / 2 / np.cos(np.radians(20))
    fila('cruce 20°', cru, W)
    # y el control CON GRANO: el mismo par de paralelas limpias, salpicadas de motas de papel como
    # las que tiene una litografía. Tiene que seguir dando cero rendijas — si no, el instrumento
    # está midiendo el grano y no la obra, que es justo lo que hacía antes del filtro de largo.
    rng = np.random.RandomState(7)
    gr = lim.copy()
    gr[(rng.rand(N, N) < 0.004) & lim] = False
    fila('con grano', gr, W)
    print('\n  esperado: paralelas 0,22 y cero rendijas; el cruce, cuñas por debajo; el grano, cero.')
    sys.exit(0)

if sys.argv[1:2] == ['png']:
    ficheros = sys.argv[2:]
    if not ficheros:
        print('uso: python3 rendija.py png <fichero.png> ...')
        sys.exit(2)
    print('LO NUESTRO — rendijas de papel entre trazos:')
else:
    ficheros = sorted(glob.glob(os.path.join(FOTOS, 'r?.*')))
    if not ficheros:
        print('no hay fotos en %s (HRRS_REFS)' % FOTOS)
        sys.exit(2)
    print('LAS SEIS — rendijas de papel entre trazos:')

print(CAB)
todo = []
for f in ficheros:
    m = tinta(f)
    W = anchura(m)
    fila(os.path.splitext(os.path.basename(f))[0], m, W)
    v, _, _ = rendijas(m, W)
    todo.append(v)
if todo:
    v = np.concatenate([t for t in todo if t.size])
    if v.size:
        print('  %-12s              %s          p05 %.2f  p25 %.2f  med %.2f'
              % ('el conjunto', ' ' * 5, np.percentile(v, 5), np.percentile(v, 25),
                 np.percentile(v, 50)))
