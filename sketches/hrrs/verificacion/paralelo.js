/* paralelo.js — CUÁNTO DE CADA TRAZO VA PARALELIZADO (vuelta 33).
 *
 *   node paralelo.js calcos                    # la vara, sobre los tres calcos
 *   node paralelo.js <tipo> [modelo=hebra] [n=60]   # lo generado, con la misma vara
 *
 * El autor: «las paralelizaciones son relaciones entre puntos de trazos subsiguientes,
 * pero pocas veces todos los puntos son paralelos; si no, son trazos repetidos». Cada
 * trazo se muestrea cada W/4; una muestra va paralelizada si el tramo ajeno más cercano
 * corre casi paralelo (< 30°) y su eje queda entre 0,75 y 1,4 D. Sale: la fracción del
 * largo, las rachas (en W), con cuántos vecinos distintos, y la ocupación.
 *
 * Los calcos: recinto 65 % · rachas 3,3–5,5 W · 2–4 vecinos · 5 de 14 trazos > 90 %;
 * bloque 53 % · 1,5–2,5 W · 2–6 vecinos; travesía 70 % · 7,5–10 W · 1–3 vecinos.
 * No lleva control roto porque no es un detector de defectos: es una medida de
 * parecido, y su referencia es el calco.
 */
require(__dirname + '/../../_engine.js'); require(__dirname + '/../algo.js');
if (process.argv[2] === 'calcos') { const CALCOS = globalThis.HOKS.HRRS.CALCOS, hyp = Math.hypot;

function pSegC(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-12;const t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/L2));return hyp(px-a[0]-t*dx,py-a[1]-t*dy);}
const qC=(v,f)=>{const s=[...v].sort((a,b)=>a-b);return s.length?s[Math.floor(f*(s.length-1))]:0;};
for(const [name,c] of Object.entries(CALCOS)){const T=c.trazos;const fr=[],runs=[],socios=[];let totP=0,tot=0;
 T.forEach((t,k)=>{const W=t.W,paso=W/4;const marks=[];const who=new Set();
  for(let i=0;i+1<t.pts.length;i++){const a=t.pts[i],b=t.pts[i+1],L=hyp(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/paso)),ta=Math.atan2(b[1]-a[1],b[0]-a[0]);
   for(let m=0;m<n;m++){const x=a[0]+(b[0]-a[0])*(m+.5)/n,y=a[1]+(b[1]-a[1])*(m+.5)/n;let best=Infinity,bj=-1;
    T.forEach((o,j)=>{if(j===k)return;for(let s=0;s+1<o.pts.length;s++){const tb=Math.atan2(o.pts[s+1][1]-o.pts[s][1],o.pts[s+1][0]-o.pts[s][0]);let da=Math.abs(((ta-tb)%Math.PI+Math.PI)%Math.PI);da=Math.min(da,Math.PI-da);if(da>Math.PI/6)continue;const d=pSegC(x,y,o.pts[s],o.pts[s+1]);if(d<best){best=d;bj=j;}}});
    const D=(W+(bj>=0?T[bj].W:W))/2*1.08;const ok=bj>=0&&best>0.75*D&&best<1.4*D;marks.push(ok?bj:-1);if(ok)who.add(bj);}}
  const p=marks.filter(m=>m>=0).length;fr.push(p/marks.length);totP+=p;tot+=marks.length;socios.push(who.size);
  let r=0;for(const m of marks.concat([-1])){if(m>=0)r++;else{if(r>1)runs.push(r*0.25);r=0;}}});
 // densidad: rejilla 8x8 sobre la caja de la obra; ocupación de la caja y del pliego
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;T.forEach(t=>t.pts.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}));
 const N=8,g=Array.from({length:N},()=>Array(N).fill(0));let tinta=0;
 T.forEach(t=>{for(let i=0;i+1<t.pts.length;i++){const a=t.pts[i],b=t.pts[i+1],L=hyp(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/0.005));for(let m=0;m<n;m++){const x=a[0]+(b[0]-a[0])*(m+.5)/n,y=a[1]+(b[1]-a[1])*(m+.5)/n;const ar=L/n*t.W;tinta+=ar;const ix=Math.min(N-1,Math.floor((x-x0)/(x1-x0)*N)),iy=Math.min(N-1,Math.floor((y-y0)/(y1-y0)*N));g[iy][ix]+=ar;}}});
 const cel=(x1-x0)*(y1-y0)/(N*N);
 console.log(`\n== ${name} · ${T.length} trazos`);
 console.log(`  largo paralelizado: ${(totP/tot*100).toFixed(0)} % del total · por trazo p25 ${(qC(fr,.25)*100).toFixed(0)} %  p50 ${(qC(fr,.5)*100).toFixed(0)} %  p75 ${(qC(fr,.75)*100).toFixed(0)} %  · trazos > 90 %: ${fr.filter(f=>f>.9).length}`);
 console.log(`  rachas paralelas (W): n ${runs.length}  p25 ${qC(runs,.25).toFixed(1)}  p50 ${qC(runs,.5).toFixed(1)}  p75 ${qC(runs,.75).toFixed(1)}  max ${Math.max(...runs).toFixed(1)}`);
 console.log(`  vecinos distintos por trazo: ${socios.join(' ')}`);
 console.log(`  ocupación de la caja: ${(tinta/((x1-x0)*(y1-y0))*100).toFixed(0)} % · del pliego (${c.w}×${c.h}): ${(tinta/(c.w*c.h)*100).toFixed(0)} % · caja = ${((x1-x0)/c.w*100).toFixed(0)} × ${((y1-y0)/c.h*100).toFixed(0)} % del pliego`);
 console.log('  densidad por celda (tinta/celda, %):');g.forEach(r=>console.log('   '+r.map(v=>String(Math.min(99,Math.round(v/cel*100))).padStart(3)).join('')));
}

  process.exit(0);
}
const H=globalThis.HOKS, tipo=process.argv[2], modelo=process.argv[3]||'hebra', N=+(process.argv[4]||60), hyp=Math.hypot;
const pSeg=(px,py,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,L2=dx*dx+dy*dy||1e-12;const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/L2));return hyp(px-a.x-t*dx,py-a.y-t*dy);};
const q=(v,f)=>{const s=[...v].sort((a,b)=>a-b);return s.length?s[Math.floor(f*(s.length-1))]:0;};
const fr=[],runs=[],soc=[],occ=[];let totP=0,tot=0,m90=0,nt=0;
for(let sd=1;sd<=N;sd++){const c=(modelo==='hebra'?H.HRRS.tramarHebra:H.HRRS.tramarPaseo)(new H.Rng(sd*7919),1,1,tipo,{});const T=c.trazos,W=c.W,D=c.D;occ.push(c.ocupacion);
 T.forEach((t,k)=>{const marks=[],who=new Set();for(let i=0;i+1<t.pts.length;i++){const a=t.pts[i],b=t.pts[i+1],L=hyp(b.x-a.x,b.y-a.y),n=Math.max(1,Math.round(L/(W/4))),ta=Math.atan2(b.y-a.y,b.x-a.x);
   for(let m=0;m<n;m++){const x=a.x+(b.x-a.x)*(m+.5)/n,y=a.y+(b.y-a.y)*(m+.5)/n;let best=Infinity,bj=-1;T.forEach((o,j)=>{if(j===k)return;for(let s=0;s+1<o.pts.length;s++){const tb=Math.atan2(o.pts[s+1].y-o.pts[s].y,o.pts[s+1].x-o.pts[s].x);let da=Math.abs(((ta-tb)%Math.PI+Math.PI)%Math.PI);da=Math.min(da,Math.PI-da);if(da>Math.PI/6)continue;const d=pSeg(x,y,o.pts[s],o.pts[s+1]);if(d<best){best=d;bj=j;}}});
    const ok=bj>=0&&best>0.75*D&&best<1.4*D;marks.push(ok?bj:-1);if(ok)who.add(bj);}}
  if(!marks.length)return;const p=marks.filter(m=>m>=0).length;fr.push(p/marks.length);totP+=p;tot+=marks.length;soc.push(who.size);nt++;if(p/marks.length>.9)m90++;let r=0;for(const m of marks.concat([-1])){if(m>=0)r++;else{if(r>1)runs.push(r*0.25);r=0;}}});}
console.log(`${tipo} · ${modelo} · ${N} obras · ${(nt/N).toFixed(1)} trazos/obra`);
console.log(`  largo paralelizado ${(totP/tot*100).toFixed(0)} % · por trazo p25 ${(q(fr,.25)*100).toFixed(0)} p50 ${(q(fr,.5)*100).toFixed(0)} p75 ${(q(fr,.75)*100).toFixed(0)} · trazos > 90 %: ${(m90/nt*100).toFixed(0)} %`);
console.log(`  rachas (W) p25 ${q(runs,.25).toFixed(1)} p50 ${q(runs,.5).toFixed(1)} p75 ${q(runs,.75).toFixed(1)} · vecinos por trazo p25 ${q(soc,.25)} p50 ${q(soc,.5)} p75 ${q(soc,.75)} · ocupación del pliego p50 ${(q(occ,.5)*100).toFixed(0)} %`);
