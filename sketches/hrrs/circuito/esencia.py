"""LOS INVARIANTES DEL CIRCUITO, sacados de los ejes que el autor marco a mano.

No de la tinta: del CENTRO. Es la corriente 1 -como se relacionan los centros de los
trazos- separada de la 2 -como se dibuja y se rellena la banda-. Todo en unidades del
lado corto, que es lo unico que hay aqui: no hay anchura de banda en un circuito.
"""
import numpy as np, json, math, sys
sys.path.insert(0,'.')
from crecer import desdobla

man=json.load(open('mano.json'))

def largo(p):
    return sum(math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1))
def dirs(p):
    out=[]
    for i in range(len(p)-1):
        dx,dy=p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]
        m=math.hypot(dx,dy)
        if m>1e-9: out.append((math.degrees(math.atan2(dy,dx))%180, m))
    return out
def remuestrea(p, paso=0.01):
    o=[]
    for i in range(len(p)-1):
        ax,ay=p[i]; bx,by=p[i+1]; L=math.hypot(bx-ax,by-ay)
        n=max(1,int(L/paso))
        for k in range(n):
            t=k/n; o.append((ax+(bx-ax)*t, ay+(by-ay)*t, math.atan2(by-ay,bx-ax)))
    if p: o.append((p[-1][0],p[-1][1], o[-1][2] if o else 0.0))
    return o

R={}
for n,v in sorted(man.items()):
    caminos=[]; ramas=0
    for e in v['ejes']:
        pri,ram = desdobla(e); ramas+=len(ram)
        caminos.append([pri]+ram)
    planos=[seg for c in caminos for seg in c]
    Ls=[largo(c[0]) for c in caminos]
    Ltot=sum(largo(s) for s in planos)
    # proporcion del cuadro
    W,H=v['px']; S=v['S']
    prop=max(W,H)/min(W,H)
    # rumbos: longitud por casilla de 10 grados
    hs=np.zeros(18)
    for s in planos:
        for a,m in dirs(s): hs[int(a//10)%18]+=m
    hs=hs/max(1e-9,hs.sum()); orden=np.sort(hs)[::-1]
    # ejes del cuadro: casillas 0 (horizontal) y 9 (vertical), con su vecina
    ejes=hs[0]+hs[17]+hs[9]+hs[8]
    # giros y cierre
    gir=[]; cierres=[]; cuerdas=[]
    for c in caminos:
        p=c[0]; tot=0
        for i in range(1,len(p)-1):
            a1=math.atan2(p[i][1]-p[i-1][1], p[i][0]-p[i-1][0])
            a2=math.atan2(p[i+1][1]-p[i][1], p[i+1][0]-p[i][0])
            d=math.degrees(a2-a1)%360
            if d>180: d-=360
            tot+=d
            if abs(d)>8: gir.append(abs(d))
        cierres.append(abs(tot)/360)
        cuerdas.append(math.hypot(p[-1][0]-p[0][0], p[-1][1]-p[0][1])/max(1e-9,largo(p)))
    # el polo: cuanta longitud cae en el disco de radio 0,25 mas cargado
    M=[q for s in planos for q in remuestrea(s)]
    xs=np.array([q[0] for q in M]); ys=np.array([q[1] for q in M])
    mejor=0
    for cx,cy in zip(xs[::7], ys[::7]):
        d=np.hypot(xs-cx, ys-cy)
        mejor=max(mejor, float((d<0.25).mean()))
    disp=float(np.mean(np.hypot(xs-xs.mean(), ys-ys.mean())))
    # cruces entre trazos distintos
    def corta(a,b,c,d):
        o=lambda p,q,r:(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
        return (o(a,b,c)>0)!=(o(a,b,d)>0) and (o(c,d,a)>0)!=(o(c,d,b)>0)
    cru=0
    for i in range(len(caminos)):
        for j in range(i+1,len(caminos)):
            hay=False
            for A in caminos[i]:
                for k in range(len(A)-1):
                    for B in caminos[j]:
                        for l in range(len(B)-1):
                            if corta(A[k],A[k+1],B[l],B[l+1]): hay=True; break
                        if hay: break
                    if hay: break
                if hay: break
            cru += 1 if hay else 0
    # acompanamiento entre centros, a menos de 0,08 del lado y < 25 grados
    SM=[remuestrea(c[0]) for c in caminos]
    ac=0; tt=0
    for i,a in enumerate(SM):
        for (x,y,d) in a:
            tt+=1; mejorD=9; da=0
            for j,b in enumerate(SM):
                if i==j: continue
                for (u,vv,e) in b:
                    dd=math.hypot(x-u,y-vv)
                    if dd<mejorD: mejorD=dd; da=e
            if mejorD<0.08 and abs(((d-da+math.pi/2)%math.pi)-math.pi/2)<math.radians(25): ac+=1
    # cabos: al aire o contra otro
    libres=0; total=0
    for i,c in enumerate(caminos):
        for p in (c[0][0], c[0][-1]):
            total+=1; cerca=9
            for j,o in enumerate(SM):
                if i==j: continue
                for (u,vv,_) in o: cerca=min(cerca, math.hypot(p[0]-u,p[1]-vv))
            if cerca>0.10: libres+=1
    borde = sum(1 for c in caminos for p in (c[0][0],c[0][-1])
                if p[0]<0.02 or p[1]<0.02 or p[0]>W/S-0.02 or p[1]>H/S-0.02)
    R[n]=dict(n=len(caminos), ramas=ramas, prop=round(prop,2),
              linea=round(Ltot,2), largo=round(float(np.median(Ls)),3),
              largoP90=round(float(np.percentile(Ls,90)),3),
              reparto=round(float(max(Ls)/np.median(Ls)),2),
              r1=round(float(orden[0]),2), r4=round(float(orden[:4].sum()),2),
              ejes=round(float(ejes),2),
              giro=round(float(np.median(gir)),0) if gir else 0,
              girosPorLado=round(len(gir)/max(1e-9,Ltot),1),
              cierre=round(float(np.percentile(cierres,90)),2),
              cuerda=round(float(np.median(cuerdas)),2),
              polo=round(mejor,2), disp=round(disp,2),
              cruces=cru, paresPos=len(caminos)*(len(caminos)-1)//2,
              acomp=round(ac/max(1,tt),2),
              cabosLibres=round(libres/max(1,total),2), cabosBorde=borde)
FIL=['n','ramas','prop','linea','largo','largoP90','reparto','r1','r4','ejes','giro',
     'girosPorLado','cierre','cuerda','polo','disp','cruces','paresPos','acomp',
     'cabosLibres','cabosBorde']
print(f"{'':<14}"+''.join(f"{k:>8}" for k in sorted(R))+f"{'MED':>9}")
for f in FIL:
    v=[R[k][f] for k in sorted(R)]
    print(f"{f:<14}"+''.join(f"{x:>8}" for x in v)+f"{np.median(v):>9.2f}")
json.dump(R, open('esencia.json','w'))
