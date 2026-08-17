// los mismos invariantes que esencia.py, sobre lo que sale del generador
const { circuito } = require('./gen2.js');
const hy=Math.hypot;
function largo(p){let L=0;for(let i=0;i<p.length-1;i++)L+=hy(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);return L;}
function remu(p,paso){paso=paso||0.025;const o=[];for(let i=0;i<p.length-1;i++){const ax=p[i][0],ay=p[i][1],bx=p[i+1][0],by=p[i+1][1];
  const L=hy(bx-ax,by-ay),n=Math.max(1,Math.floor(L/paso));for(let k=0;k<n;k++){const t=k/n;o.push([ax+(bx-ax)*t,ay+(by-ay)*t,Math.atan2(by-ay,bx-ax)]);}}
  if(p.length)o.push([p[p.length-1][0],p[p.length-1][1],o.length?o[o.length-1][2]:0]);return o;}
function corta(a,b,c,d){const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  return ((o(a,b,c)>0)!==(o(a,b,d)>0))&&((o(c,d,a)>0)!==(o(c,d,b)>0));}
const med=v=>{const s=v.slice().sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:0;};
const acc={};
const push=(k,v)=>{(acc[k]=acc[k]||[]).push(v);};
for(let i=0;i<20;i++){
  const c=circuito(((i+1)*0x9E3779B1 ^ 0x5A17)>>>0);
  const T=c.trazos; if(T.length<2) continue;
  const Ls=T.map(largo), Lt=Ls.reduce((a,b)=>a+b,0);
  const hs=new Array(18).fill(0); let gir=[], cier=[], cue=[];
  for(const p of T){
    for(let i2=0;i2<p.length-1;i2++){const dx=p[i2+1][0]-p[i2][0],dy=p[i2+1][1]-p[i2][1],m=hy(dx,dy);
      if(m>1e-9){let a=(Math.atan2(dy,dx)*180/Math.PI+180)%180; hs[Math.floor(a/10)%18]+=m;}}
    let tot=0;
    for(let i2=1;i2<p.length-1;i2++){const a1=Math.atan2(p[i2][1]-p[i2-1][1],p[i2][0]-p[i2-1][0]);
      const a2=Math.atan2(p[i2+1][1]-p[i2][1],p[i2+1][0]-p[i2][0]);
      let d=(a2-a1)*180/Math.PI%360; if(d>180)d-=360; if(d<-180)d+=360; tot+=d; if(Math.abs(d)>8)gir.push(Math.abs(d));}
    cier.push(Math.abs(tot)/360);
    cue.push(hy(p[p.length-1][0]-p[0][0],p[p.length-1][1]-p[0][1])/Math.max(1e-9,largo(p)));
  }
  const s=hs.reduce((a,b)=>a+b,0)||1; const h=hs.map(x=>x/s);
  const ord=h.slice().sort((a,b)=>b-a);
  push('n',T.length); push('linea',Lt); push('largo',med(Ls));
  push('reparto',Math.max(...Ls)/med(Ls));
  push('r1',ord[0]); push('r4',ord.slice(0,4).reduce((a,b)=>a+b,0));
  push('ejes',h[0]+h[17]+h[9]+h[8]);
  push('giro',med(gir)); push('girosPorLado',gir.length/Lt);
  push('cierre',[...cier].sort((a,b)=>a-b)[Math.floor(0.9*(cier.length-1))]);
  push('cuerda',med(cue));
  // cruces
  let cru=0;
  for(let a=0;a<T.length;a++)for(let b=a+1;b<T.length;b++){let hay=false;
    for(let i2=0;i2<T[a].length-1&&!hay;i2++)for(let j=0;j<T[b].length-1;j++)
      if(corta(T[a][i2],T[a][i2+1],T[b][j],T[b][j+1])){hay=true;break;}
    if(hay)cru++;}
  push('cruces',cru);
  // polo y acompanamiento
  const M=[]; for(const p of T) for(const q of remu(p,0.025)) M.push(q); let mejorP=0;
  for(let gx=0;gx<=10;gx++)for(let gy=0;gy<=10;gy++){
    const cx=gx/10*c.fw, cy=gy/10*c.fh; let c2=0;
    for(const q of M) if(hy(q[0]-cx,q[1]-cy)<0.25) c2++;
    mejorP=Math.max(mejorP,c2/M.length);}
  push('polo',mejorP);
  const SM=T.map(function(p){return remu(p,0.025);}); let ac=0,tt=0,lib=0,tot2=0;
  for(let i2=0;i2<SM.length;i2++)for(const q of SM[i2]){tt++;let mj=9,da=0;
    for(let j=0;j<SM.length;j++){if(i2===j)continue;for(const o of SM[j]){const dd=hy(q[0]-o[0],q[1]-o[1]);if(dd<mj){mj=dd;da=o[2];}}}
    let df=Math.abs(((q[2]-da+Math.PI/2)%Math.PI)-Math.PI/2);
    if(mj<2.5*c.W&&df<25*Math.PI/180)ac++;}
  push('acomp',ac/Math.max(1,tt));
  for(let i2=0;i2<T.length;i2++)for(const p of [T[i2][0],T[i2][T[i2].length-1]]){tot2++;let cerca=9;
    for(let j=0;j<SM.length;j++){if(i2===j)continue;for(const o of SM[j])cerca=Math.min(cerca,hy(p[0]-o[0],p[1]-o[1]));}
    if(cerca>3.0*c.W)lib++;}
  push('cabosLibres',lib/Math.max(1,tot2));
}
const OBJ={n:7.5,linea:5.21,largo:0.64,reparto:1.56,r1:0.24,r4:0.60,ejes:0.52,giro:32,
  girosPorLado:7.55,cierre:0.30,cuerda:0.76,polo:0.41,cruces:0,acomp:0.52,cabosLibres:0.18};
console.log('rasgo'.padEnd(15)+'GENERADOR'.padStart(10)+'refs'.padStart(9));
for(const k of Object.keys(OBJ)){
  const v=med(acc[k]||[0]);
  console.log(k.padEnd(15)+v.toFixed(2).padStart(10)+String(OBJ[k]).padStart(9));
}
