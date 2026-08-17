// QUE ELIGE EL AUTOR. Las 24 semillas nuevas -elegidas sobre el generador con tipos-
// contra 240 al azar del mismo generador. Cada rasgo, en unidades de desviacion tipica
// de la poblacion: por encima de |0,5| la diferencia se ve, por debajo es ruido.
const { circuito } = require('./gen.js');
const hy=Math.hypot;
const NUEVAS=[189924236,874447944,887604234,998626587,1397152406,1409981984,1449357985,
 1534777149,1577596631,1766639467,1905131946,2045930416,2064570323,2170971786,2249476475,
 2264614814,2842843220,3367491348,3490125522,3509586878,3654437713,3670563508,3738133210,
 3758216622];
function largo(p){let L=0;for(let i=0;i<p.length-1;i++)L+=hy(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);return L;}
function remu(p,paso){paso=paso||0.025;const o=[];
  for(let i=0;i<p.length-1;i++){const ax=p[i][0],ay=p[i][1],bx=p[i+1][0],by=p[i+1][1];
    const L=hy(bx-ax,by-ay),n=Math.max(1,Math.floor(L/paso));
    for(let k=0;k<n;k++){const t=k/n;o.push([ax+(bx-ax)*t,ay+(by-ay)*t,Math.atan2(by-ay,bx-ax)]);}}
  return o;}
const med=v=>{const s=v.slice().sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:0;};
function rasgos(c){
  const T=c.trazos; if(T.length<2) return null;
  const Ls=T.map(function(p){return largo(p);}), Lt=Ls.reduce((a,b)=>a+b,0);
  const hs=new Array(18).fill(0); const gir=[], cier=[], cue=[];
  for(const p of T){
    for(let i=0;i<p.length-1;i++){const dx=p[i+1][0]-p[i][0],dy=p[i+1][1]-p[i][1],m=hy(dx,dy);
      if(m>1e-9){const a=(Math.atan2(dy,dx)*180/Math.PI+180)%180; hs[Math.floor(a/10)%18]+=m;}}
    let tot=0;
    for(let i=1;i<p.length-1;i++){const a1=Math.atan2(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0]);
      const a2=Math.atan2(p[i+1][1]-p[i][1],p[i+1][0]-p[i][0]);
      let d=(a2-a1)*180/Math.PI%360; if(d>180)d-=360; if(d<-180)d+=360; tot+=d;
      if(Math.abs(d)>8)gir.push(Math.abs(d));}
    cier.push(Math.abs(tot)/360);
    cue.push(hy(p[p.length-1][0]-p[0][0],p[p.length-1][1]-p[0][1])/Math.max(1e-9,largo(p)));
  }
  const s=hs.reduce((a,b)=>a+b,0)||1, h=hs.map(x=>x/s);
  const SM=T.map(function(p){return remu(p);});
  let ac=0,tt=0,lib=0,tot2=0;
  for(let i=0;i<SM.length;i++)for(const q of SM[i]){tt++;let mj=9,da=0;
    for(let j=0;j<SM.length;j++){if(i===j)continue;for(const o of SM[j]){const dd=hy(q[0]-o[0],q[1]-o[1]);if(dd<mj){mj=dd;da=o[2];}}}
    const df=Math.abs(((q[2]-da+Math.PI/2)%Math.PI)-Math.PI/2);
    if(mj<2.5*c.W&&df<25*Math.PI/180)ac++;}
  for(let i=0;i<T.length;i++)for(const p of [T[i][0],T[i][T[i].length-1]]){tot2++;let ce=9;
    for(let j=0;j<SM.length;j++){if(i===j)continue;for(const o of SM[j])ce=Math.min(ce,hy(p[0]-o[0],p[1]-o[1]));}
    if(ce>3.0*c.W)lib++;}
  const M=[]; for(const p of T) for(const q of remu(p,0.03)) M.push(q);
  let polo=0;
  for(let gx=0;gx<=8;gx++)for(let gy=0;gy<=8;gy++){const cx=gx/8*c.fw,cy=gy/8*c.fh;let n2=0;
    for(const q of M) if(hy(q[0]-cx,q[1]-cy)<0.25) n2++; polo=Math.max(polo,n2/M.length);}
  return { trazos:T.length, linea:Lt, largo:med(Ls), reparto:Math.max(...Ls)/med(Ls),
    ancho:c.W, sep:c.sep/c.W, denso:(c.tipo==='denso'?1:0),
    ejes:h[0]+h[17]+h[9]+h[8], giro:med(gir), girosPorLado:gir.length/Lt,
    cierre:med(cier), cuerda:med(cue), polo, acomp:ac/Math.max(1,tt),
    cabosLibres:lib/Math.max(1,tot2) };
}
const sel=[], pob=[];
for(const s of NUEVAS){const r=rasgos(circuito(s)); if(r) sel.push(r);}
for(let i=0;i<240;i++){const r=rasgos(circuito(((i*2654435761)^0x9e37)>>>0)); if(r) pob.push(r);}
const K=Object.keys(sel[0]);
console.log(`elegidas ${sel.length}   poblacion ${pob.length}\n`);
console.log('rasgo'.padEnd(15)+'ELEGIDAS'.padStart(10)+'poblacion'.padStart(11)+'  z');
const filas=[];
for(const k of K){
  const a=sel.map(r=>r[k]), b=pob.map(r=>r[k]);
  const mb=b.reduce((x,y)=>x+y,0)/b.length;
  const sd=Math.sqrt(b.reduce((x,y)=>x+(y-mb)*(y-mb),0)/b.length)||1e-9;
  const ma=a.reduce((x,y)=>x+y,0)/a.length;
  filas.push([k,ma,mb,(ma-mb)/sd]);
}
filas.sort((p,q)=>Math.abs(q[3])-Math.abs(p[3]));
for(const [k,ma,mb,z] of filas)
  console.log(k.padEnd(15)+ma.toFixed(2).padStart(10)+mb.toFixed(2).padStart(11)+
    ('  '+(z>0?'+':'')+z.toFixed(2))+(Math.abs(z)>0.5?'   <<':''));
