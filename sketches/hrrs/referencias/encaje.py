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
# EL TOPE POR LA MODA, QUITADO. Lo dijo la imagen antes que la medida: en el cartel
# el rojo -la tinta que falta- estaba en los FILOS EXTERIORES de las bandas anchas.
# Capar por la moda de la banda deja corta a toda banda mas ancha que la moda de la
# obra, o sea que la masa del cruce no se rellena. Y el tope estaba puesto para que
# los cruces no se comieran la incision, cosa que ya resuelve el perfil por vertice.
#
# Medido, trazado inicial: el acierto sube en las seis (mediana 90,2 % -> 91,5 %) y la
# tinta que falta baja casi a la mitad (5,7-11,0 % -> 3,9-8,7 %). Y con el ajuste
# completo gana donde importa: la litografia sale por fin 2 -> 2 componentes (era
# 2 -> 1), el cartel 3 -> 4, y la cuadrada 96,9 % -> 97,3 %.
TOPE = False


def ejesDe(mask, W, minLargo=1.2, dpTol=0.05, perfil=True):
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
        # de cada vertice, su sitio en el eje denso (para leer ahi la anchura)
        donde = {}
        for i, (yy, xx) in enumerate(cam):
            donde.setdefault((float(xx), float(yy)), i)
        enCam = [donde.get((p[0], p[1])) for p in sp]
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
        # LA ANCHURA ES UN PERFIL, NO UN NUMERO. Y ES LA CAUSA DE LA SOLDADURA.
        #
        # Medido sobre los pixeles de canal que la replica cierra: en el 80-94 % de
        # ellos la banda esta dibujada MAS ANCHA que la tinta que hay ahi de verdad
        # —el cartel pone 33 px donde el original mide 14, la cuadrada 15 donde mide
        # 5—. No es que el eje pase por el canal (medido: 0,0 % de los soldados tiene
        # eje encima) ni que sobre anchura en general: es que a la banda entera se le
        # daba UN modo, y donde el original adelgaza, la replica no adelgaza y se come
        # la incision de al lado.
        #
        # El perfil va CAPADO por el modo, nunca por encima. Es la regla de la gubia
        # de la casa —el temblor de anchura solo resta— y aqui ademas resuelve los
        # cruces: dentro de una mancha de dos bandas la distancia medial se dispara, y
        # el tope la devuelve a la anchura de la banda.
        #
        # Y SE LEE CRUDA, en el vertice, sin suavizar. Esto salio al reves de lo que
        # razone y la medida es tajante.
        #
        # Habia puesto un maximo corrido de 0,35 W «para deshacer el hundimiento de la
        # esquina», acordandome de que medir la anchura en los vertices la sacaba fina.
        # Pero aquel error era de otra cosa: era sacar UN numero para toda la banda a
        # base de muestras de esquina. Aqui cada vertice lleva su anchura, y el maximo
        # corrido lo unico que hace es RELLENAR LOS ESTRECHAMIENTOS con la anchura de
        # al lado — justo la averia que veniamos persiguiendo.
        #
        # Barrido de operadores sobre las seis, componentes y acierto del trazado
        # inicial (el original entre parentesis):
        #
        #             modo       max 0,35 W     max 0,15 W        cruda
        #   r1 ( 8)   7c 91,3 %   7c 91,4 %      8c 91,5 %      8c 91,7 %
        #   r2 (11)   4c 88,9 %   4c 89,2 %      9c 89,8 %     11c 90,1 %
        #   r4 ( 2)   1c 92,1 %   1c 92,3 %      1c 92,4 %      2c 92,2 %
        #   r5 ( 7)   1c 85,5 %   1c 85,9 %      1c 86,2 %      2c 86,2 %
        #   r6 (14)   3c 82,4 %   3c 82,6 %      4c 83,2 %      8c 83,5 %
        #
        # Cuanto menos se suaviza, mas incisiones sobreviven — y el acierto SUBE a la
        # vez, o sea que no hay canje: era anchura de mas y punto. Suavizar con mediana
        # (0,08, 0,15 y 0,35 W) da exactamente lo mismo que no suavizar, asi que no se
        # suaviza: no hay motivo medido para hacerlo.
        if not perfil:
            hs = [base] * len(sp)
        elif TOPE:
            hs = [float(min(crudo[i], base)) if i is not None else base for i in enCam]
        else:
            hs = [float(crudo[i]) if i is not None else base for i in enCam]
        sp = [hasta(sp[0], sp[1], base*1.4)] + sp[1:-1] + [hasta(sp[-1], sp[-2], base*1.4)]
        # EL LARGO MINIMO SE MIDE AQUI, sobre la banda tal y como se dibuja, y no antes
        # de alargar los cabos. Es la misma cifra de siempre —1,2 anchuras— puesta en el
        # sitio correcto, y no un mando nuevo: medida arriba, descartaba trazos que
        # despues del alargue miden mas de anchura y media. En la cuadrada eran SIETE
        # bandas de veintinueve, y devolverlas vale 6,5 puntos de acierto (83,5 % ->
        # 90,0 %) ademas de acercar el canal (0,35 -> 0,31 contra 0,23 del original).
        #
        # La alternativa era bajar el umbral, y el barrido volvia a pedir el extremo de
        # la rejilla —a 0,0 seguia subiendo—, que es la trampa de siempre: siempre se
        # parece mas si copias mas trozos. Medirlo donde toca da mas acierto que bajarlo
        # a la mitad (90,2 % de mediana contra 90,0 %) sin admitir ni una mota.
        L = sum(math.hypot(sp[i+1][0]-sp[i][0], sp[i+1][1]-sp[i][1]) for i in range(len(sp)-1))
        if L < W * minLargo:
            continue
        out.append((sp, hs))
    return out


def respetaCanal(bandas, g, tolAng=32.0):
    """Que dos bandas que SE ACOMPANAN no se toquen. Es la regla de la casa, leyendo.

    Aqui esta el techo de las dos obras que resisten: la incision se cierra AL
    EXTRAER, no al ajustar. En el cartel mide 4 px sobre una banda de 68 —0,06
    anchuras— asi que basta un error de dos pixeles en la anchura de cualquiera de
    las dos vecinas para soldarlas, y entonces el ajuste ya no tiene canal que
    defender.

    La familia tiene una regla para exactamente esto y no la estaba usando para leer:
    entre dos ejes a distancia d, el blanco mide d - (w1+w2)/2, y tiene que quedar al
    menos el pelo. Asi que se recorta la anchura hasta que quepa.

    Con una salvedad, que es la misma de siempre: en un CRUCE los dos ejes se juntan
    hasta cero y ahi no hay canal que guardar —se funden a proposito—. Se distingue
    por el angulo, igual que en el algoritmo: si los dos tramos son casi paralelos se
    acompanan y hay que respetar el pelo; si se cruzan, no.

    ── PROBADO Y NO SIRVE, Y ESO SENALA DONDE ESTA EL FALLO ─────────────────────

    Medido: no abre ni una incision. La litografia sigue en 1 componente de 7 y la
    cuadrada en 3 de 14, con recorte global (que ademas hunde el acierto de 92 % a
    72 %) y con recorte por vertice (que cuesta 4 puntos y tampoco abre nada).

    Y que no sirva es informativo: si estrechar las bandas no abre el canal, es que
    LOS EJES YA PASAN POR DONDE VA LA INCISION. O sea que el fallo no es de anchura
    sino del recorrido — `bandas()` esta cruzando el pelo en algun nudo y volviendo
    por el otro lado, que es justo la figura que el analisis llamo «el pelo empieza y
    acaba dentro del negro»: donde la incision muere dentro de la tinta, sus dos
    costados se encuentran y el esqueleto hace una Y. Atravesarla de largo produce un
    eje en horquilla que RELLENA la ranura.

    Se queda escrita, sin usar, porque descartarla es lo que localiza el sitio.
    """
    # POR VERTICE, no por banda. Recortando la banda entera con su punto mas
    # estrecho se repite el error de la «anchura declarada»: un solo encuentro
    # apretado adelgaza medio metro de banda y el acierto se hunde —92 % a 72 % en la
    # litografia—. El pelo se abre DONDE hace falta y en ningun otro sitio.
    import itertools
    topes = [list(h) for _, h in bandas]
    n = len(bandas)
    for i, j in itertools.combinations(range(n), 2):
        pi, hi = bandas[i]; pj, hj = bandas[j]
        for a in range(len(pi) - 1):
            axm = (pi[a][0]+pi[a+1][0])/2; aym = (pi[a][1]+pi[a+1][1])/2
            ta = math.atan2(pi[a+1][1]-pi[a][1], pi[a+1][0]-pi[a][0])
            for b2 in range(len(pj) - 1):
                bxm = (pj[b2][0]+pj[b2+1][0])/2; bym = (pj[b2][1]+pj[b2+1][1])/2
                d = math.hypot(axm-bxm, aym-bym)
                if d > (hi[a] + hj[b2]) * 1.6 + g:
                    continue
                tb = math.atan2(pj[b2+1][1]-pj[b2][1], pj[b2+1][0]-pj[b2][0])
                ang = abs(((math.degrees(ta - tb) + 90) % 180) - 90)
                if ang > tolAng:
                    continue                     # se cruzan: no hay canal que guardar
                cabe = max((d - g) / 2.0, hi[a] * 0.70)
                for k in (a, a+1):
                    topes[i][k] = min(topes[i][k], cabe)
                for k in (b2, b2+1):
                    topes[j][k] = min(topes[j][k], cabe)
    return [(p, topes[k]) for k, (p, h) in enumerate(bandas)]


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
