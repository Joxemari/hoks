/* gravedad.js — EL EXPERIMENTO DE LA ATRACCIÓN (vuelta 30), sobre los calcos.
 *
 *   node gravedad.js [alcance=1.5] [alfa=0.9] [salida.png] [beta=0] [--primero]
 *
 * Pregunta: ¿cuánto de cada obra es «primer trazo + atracción» y cuánto es gesto?
 * Cada trazo del calco, menos el primero, se reconstruye como una cadena de puntos
 * que solo conoce su INICIO, su FIN y lo ya dibujado: el punto avanza hacia su meta
 * y, si hay un trazo anterior a menos de `alcance`·D, sigue su tangente (peso
 * `alfa`) y un muelle lo deja a D de su eje. `beta` añade una gravedad de largo
 * alcance hacia el trazo más cercano (no ayuda: se deja en 0). Se mide la distancia
 * media de la cadena al eje real, en D: un trazo a < 0,5 D está EXPLICADO por la
 * atracción; uno a > 1 D es un gesto que hay que dibujar.
 *
 * Resultado (alcance 1,5 · alfa 0,9): recinto 7 de 13, bloque 9 de 13, travesía 4
 * de 6. Los no explicados son siempre los mismos: la mitad derecha del marco, los
 * maestros de cada racimo, las piezas que cambian de dirección sin vecino. Ver
 * README, vuelta 30. El dibujo que sale es orientativo: la cadena tiembla
 * alrededor de D y deja púas; lo que vale es la cifra.
 */
const fs=require('fs'); const {chromium}=require('playwright');
const src=fs.readFileSync(__dirname+'/../algo.js','utf8');
const m=src.match(/const CALCOS = (\{[\s\S]*?\n  \});/); const CALCOS=eval('('+m[1]+')');
const ALCANCE=parseFloat(process.argv[2]||'2.2'), ALFA=parseFloat(process.argv[3]||'0.8'), GAM=0.08, BETA=parseFloat(process.argv[5]||'0');
const hyp=Math.hypot;
function pSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1e-12;const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/L2));return {d:hyp(px-ax-t*dx,py-ay-t*dy),x:ax+t*dx,y:ay+t*dy,tx:dx/Math.sqrt(L2),ty:dy/Math.sqrt(L2)};}
function nearest(p,strokes){let best=null;for(const s of strokes)for(let i=0;i+1<s.length;i++){const r=pSeg(p.x,p.y,s[i][0],s[i][1],s[i+1][0],s[i+1][1]);if(!best||r.d<best.d)best=r;}return best;}
function reconstruye(S,E,prev,W){const D=W*(1+GAM),paso=W/3;const pts=[[S[0],S[1]]];let p={x:S[0],y:S[1]},pdx=null,pdy=null;for(let n=0;n<600;n++){const gx=E[0]-p.x,gy=E[1]-p.y,gm=hyp(gx,gy);if(gm<paso)break;let dx=gx/gm,dy=gy/gm;const nb=nearest(p,prev);
 if(nb&&nb.d>=ALCANCE*D&&BETA>0){let ax=nb.x-p.x,ay=nb.y-p.y;const am=hyp(ax,ay)||1e-9;dx=dx+BETA*ax/am;dy=dy+BETA*ay/am;const dm=hyp(dx,dy)||1e-9;dx/=dm;dy/=dm;}
 else if(nb&&nb.d<ALCANCE*D&&nb.d>0.2*D){let tx=nb.tx,ty=nb.ty;if(tx*dx+ty*dy<0){tx=-tx;ty=-ty;}let nx=p.x-nb.x,ny=p.y-nb.y;const nm=hyp(nx,ny)||1e-9;nx/=nm;ny/=nm;const muelle=(D-nb.d)/D;dx=ALFA*tx+(1-ALFA)*dx+0.5*muelle*nx;dy=ALFA*ty+(1-ALFA)*dy+0.5*muelle*ny;const dm=hyp(dx,dy)||1e-9;dx/=dm;dy/=dm;}
 p={x:p.x+dx*paso,y:p.y+dy*paso};pts.push([p.x,p.y]);}pts.push([E[0],E[1]]);return pts;}
function dist(pts,real){let s=0;for(const q of pts){const r=nearest({x:q[0],y:q[1]},[real]);s+=r.d;}return s/pts.length;}
function simplifica(pts,tol){if(pts.length<3)return pts;let imax=0,dmax=0;const a=pts[0],b=pts[pts.length-1];for(let i=1;i<pts.length-1;i++){const d=pSeg(pts[i][0],pts[i][1],a[0],a[1],b[0],b[1]).d;if(d>dmax){dmax=d;imax=i;}}if(dmax>tol){const l=simplifica(pts.slice(0,imax+1),tol),r=simplifica(pts.slice(imax),tol);return l.slice(0,-1).concat(r);}return [a,b];}
// ── ¿CUÁL ES EL PRIMER TRAZO? ─────────────────────────────────────────────────
// (el autor: «identificar el primer trazo es parte de la clave»). Se prueba CADA
// trazo como primero; los demás se añaden uno a uno, siempre el que mejor se
// explica por lo ya dibujado (voraz). El primero verdadero es el que deja más
// trazos explicados y menor error total; el orden que sale es el orden de dibujo.
if (process.argv.includes('--primero')) {
  for (const [name,c] of Object.entries(CALCOS)) {
    const n=c.trazos.length, res=[];
    for (let f=0; f<n; f++) {
      const puestos=[c.trazos[f].pts], quedan=new Set([...Array(n).keys()].filter(i=>i!==f)), orden=[f], errs=[];
      while (quedan.size) { let best=null;
        for (const k of quedan) { const t=c.trazos[k], real=t.pts, rec=reconstruye(real[0], real[real.length-1], puestos, t.W), d=dist(rec,real)/(t.W*(1+GAM)); if(!best||d<best.d) best={k,d}; }
        quedan.delete(best.k); orden.push(best.k); errs.push(best.d); puestos.push(c.trazos[best.k].pts); }
      res.push({f, explicados: errs.filter(d=>d<0.5).length, errorMedio: +(errs.reduce((a,b)=>a+b,0)/errs.length).toFixed(2), orden, errs: errs.map(e=>+e.toFixed(2))});
    }
    res.sort((a,b)=>b.explicados-a.explicados||a.errorMedio-b.errorMedio);
    console.log(`\n${name}: primero → explicados / error medio`);
    res.forEach(r=>console.log(`  t${r.f}: ${r.explicados}/${n-1}  ${r.errorMedio}`));
    const m=res[0]; console.log(`  MEJOR PRIMERO: t${m.f} · orden de dibujo: ${m.orden.map(i=>'t'+i).join(' → ')}\n  errores en ese orden: ${m.errs.join(' ')}`);
  }
  process.exit(0);
}
const out={};
for(const [name,c] of Object.entries(CALCOS)){const strokes=[c.trazos[0].pts];const rows=[];const recs=[c.trazos[0].pts];
 for(let k=1;k<c.trazos.length;k++){const t=c.trazos[k];const W=t.W;const real=t.pts;const S=real[0],E=real[real.length-1];
  // el inicio y el fin son los reales; lo demás se lo inventa la atracción
  const rec=reconstruye(S,E,strokes,W);const d=dist(rec,real)/(W*(1+GAM));const simp=simplifica(rec,W/4);
  rows.push({k,d:+d.toFixed(2),vertReal:real.length,vertRec:simp.length});recs.push(simp);strokes.push(real);}
 out[name]={rows,recs,W:c.trazos.map(t=>t.W),w:c.w,h:c.h};
 console.log(name, rows.map(r=>`t${r.k}:${r.d}`).join('  '), ' explicados(<0.5D):',rows.filter(r=>r.d<0.5).length,'/',rows.length);}
// dibujar: real en gris claro (bandas), reconstrucción en negro (bandas al 60 %), primer trazo en gris oscuro
(async()=>{const br=await chromium.launch();const p=await br.newPage();
const png=await p.evaluate(({CALCOS,out})=>{const cw=620,gap=12;const names=Object.keys(CALCOS);const sheet=document.createElement('canvas');sheet.width=names.length*(cw+gap)+gap;sheet.height=cw*1.4+2*gap;const s=sheet.getContext('2d');s.fillStyle='#fbfbfa';s.fillRect(0,0,sheet.width,sheet.height);
 names.forEach((nm,i)=>{const c=CALCOS[nm],o=out[nm];const sc=cw/c.w;const ox=gap+i*(cw+gap),oy=gap;s.save();s.translate(ox,oy);s.lineJoin='miter';s.lineCap='butt';
  const band=(pts,W,col)=>{s.strokeStyle=col;s.lineWidth=W*sc;s.beginPath();pts.forEach((q,j)=>j?s.lineTo(q[0]*sc,q[1]*sc):s.moveTo(q[0]*sc,q[1]*sc));s.stroke();};
  c.trazos.forEach((t,k)=>band(t.pts,t.W,'#d8d6ce'));
  band(c.trazos[0].pts,c.trazos[0].W,'#6a6963');
  o.recs.forEach((r,k)=>{if(k===0)return;band(r,o.W[k]*0.55,'#0a0a0a');});
  s.fillStyle='#26251f';s.font='12px Courier New';s.fillText(nm+' · gris: calco · negro: cadena atraída · oscuro: primer trazo',4,cw*1.4-6);s.restore();});
 return sheet.toDataURL('image/png');},{CALCOS,out});
fs.writeFileSync(process.argv[4]||'gravedad.png',Buffer.from(png.split(',')[1],'base64'));await br.close();})();
