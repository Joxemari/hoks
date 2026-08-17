"""EL FILO DE CHILLIDA, medido.

«Los trazos parecen demasiado vectoriales. Los de Chillida tienen cierto contorno, cierto
caracter organico.» Vale: se corta la banda real perpendicular a su eje, cada pocos pixeles,
y se mide hasta donde llega la tinta a cada lado. Eso da dos senales por banda -- el filo
izquierdo y el derecho-- y de ahi salen las tres cosas que hacen falta para reproducirlo:

  CUANTO respira (la desviacion tipica de la semianchura, en anchuras de banda)
  A QUE ESCALA (la longitud de correlacion: cada cuantas anchuras cambia)
  y si los dos filos respiran JUNTOS o por separado (si van juntos, la banda cambia de grosor;
  si van por separado, el filo tiembla y el eje no se mueve)
"""
import numpy as np, pickle, glob, math

def perfil(A, banda, W, paso=1.5):
    """recorre el eje y devuelve la semianchura a cada lado, en pixeles"""
    p = np.array(banda, float)
    if len(p) < 2: return None
    # remuestrear el eje cada `paso` pixeles
    seg = np.diff(p, axis=0)
    L = np.hypot(seg[:,0], seg[:,1])
    tot = L.sum()
    if tot < 4*W: return None
    n = max(4, int(tot/paso))
    s = np.linspace(0, tot, n)
    acc = np.concatenate([[0], np.cumsum(L)])
    xs = np.interp(s, acc, p[:,0]); ys = np.interp(s, acc, p[:,1])
    # tangente suave
    dx = np.gradient(xs); dy = np.gradient(ys)
    m = np.hypot(dx,dy); m[m<1e-9]=1
    nx, ny = -dy/m, dx/m
    H, Wd = A.shape
    izq = np.zeros(n); der = np.zeros(n)
    R = int(W*2.2)
    for i in range(n):
        for lado, out in ((1, izq), (-1, der)):
            d = 0.0
            for r in np.arange(0.5, R, 0.5):
                x = int(round(xs[i] + nx[i]*r*lado)); y = int(round(ys[i] + ny[i]*r*lado))
                if x<0 or y<0 or x>=Wd or y>=H or not A[y,x]: break
                d = r
            out[i] = d
    return s, izq, der

def corr_len(v, W):
    """cada cuantas anchuras de banda deja de parecerse a si misma (autocorrelacion < 0.5)"""
    v = v - v.mean()
    if v.std() < 1e-9: return float('nan')
    ac = np.correlate(v, v, 'full')[len(v)-1:]
    ac /= ac[0]
    for k in range(1, len(ac)):
        if ac[k] < 0.5: return k*1.5/W       # paso 1.5 px
    return len(ac)*1.5/W

print('%-4s %7s %9s %9s %9s %9s %9s' % ('obra','bandas','semi med','sd(semi)','sd rapida','escala','corr I-D'))
tot = {'sd':[], 'rap':[], 'esc':[], 'cor':[]}
for f in sorted(glob.glob('fitT_r?.pkl')):
    n = f[5:-4]
    A = np.load('orig_%s.npy' % n).astype(bool)
    b, W, sh = pickle.load(open(f,'rb'))
    sds, raps, escs, cors, nb = [], [], [], [], 0
    for banda, h in b:
        r = perfil(A, banda, W)
        if r is None: continue
        s, izq, der = r
        for v in (izq, der):
            if v.mean() < W*0.2: continue
            sds.append(v.std()/W)
            # la parte RAPIDA: lo que queda al quitarle una media movil de ~1 anchura
            k = max(3, int(W/1.5))
            sm = np.convolve(v, np.ones(k)/k, 'same')
            raps.append((v-sm)[k:-k].std()/W if len(v)>2*k else np.nan)
            escs.append(corr_len(v, W))
        if izq.std()>1e-9 and der.std()>1e-9:
            cors.append(float(np.corrcoef(izq, der)[0,1]))
        nb += 1
    f2 = lambda v: np.nanmedian(v) if len(v) else float('nan')
    print('%-4s %7d %9.2f %9.3f %9.3f %9.1f %9.2f' % (
        n, nb, f2([np.nanmedian(sds)])*0+np.nanmedian([1]),  # placeholder
        f2(sds), f2(raps), f2(escs), f2(cors)))
    tot['sd']+=sds; tot['rap']+=raps; tot['esc']+=escs; tot['cor']+=cors
print()
print('LAS SEIS JUNTAS, medianas:')
print('   sd de la semianchura ....... %.3f anchuras de banda' % np.nanmedian(tot['sd']))
print('   sd de la parte rapida ...... %.3f anchuras' % np.nanmedian(tot['rap']))
print('   escala de la variacion ..... %.1f anchuras' % np.nanmedian(tot['esc']))
print('   correlacion filo izq/der ... %+.2f' % np.nanmedian(tot['cor']))
