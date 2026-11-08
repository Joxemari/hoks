/* ues.js — la regla del autor: EN U NUNCA. Ninguna pieza gira dos veces seguidas al
 * mismo lado (volver sobre su propio cuerpo). Se cuenta sobre las celdas publicadas
 * del paseo (`geo.dbg.piezas`) y sobre los ejes pintados simplificados a 0,3 W.
 *   node ues.js '{"tipo":"bloque"}'
 * Lo que cazó: el primer paso de un paseo se contaba como giro (no hay tramo
 * anterior), y al crecer por el otro cabo se espejaba ese codo fantasma en vez del
 * primero de verdad: 42 úes de 327 piezas. Con el arreglo, 0 de 950. */
const {chromium}=require('playwright');const P=JSON.parse(process.argv[2]||'{}');
(async()=>{const br=await chromium.launch();const p=await br.newPage();await p.goto('http://localhost:8777/sketches/hrrs/');await p.waitForTimeout(2500);
const out=await p.evaluate(({P})=>{const pal=HOKS.normalizePalettes([{name:'bn',colors:['#f2efe6','#1a1816'],prob:1}]);
 const dp=(pts,tol)=>{if(pts.length<3)return pts;const a=pts[0],b=pts[pts.length-1];let dm=-1,im=-1;for(let i=1;i<pts.length-1;i++){const q=pts[i];const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1e-9;const d=Math.abs(dx*(a.y-q.y)-dy*(a.x-q.x))/L;if(d>dm){dm=d;im=i;}}
  if(dm>tol){return dp(pts.slice(0,im+1),tol).slice(0,-1).concat(dp(pts.slice(im),tol));}return [a,b];};
 const uDe=pts=>{const signs=[];for(let m=1;m+1<pts.length;m++){const ax=pts[m].x-pts[m-1].x,ay=pts[m].y-pts[m-1].y,bx=pts[m+1].x-pts[m].x,by=pts[m+1].y-pts[m].y;const cr=ax*by-ay*bx;const ang=Math.abs(Math.atan2(cr,ax*bx+ay*by))*180/Math.PI;if(ang>45)signs.push(Math.sign(cr));}for(let m=1;m<signs.length;m++)if(signs[m]===signs[m-1])return true;return false;};
 let uc=0,ue=0,n=0,ej=[];
 for(let i=0;i<40;i++){const c=document.createElement('canvas');c.width=c.height=300;const r=WORK.render(c.getContext('2d'),300,300,(4000+i)>>>0,{palettes:pal,locked:true,lockedIdx:0,params:{...params(),bg:'solid',grainScale:0,...P}});
  const g=r.geo;for(const pz of g.dbg.piezas){n++;const pts=pz.map(([i2,j2])=>({x:i2,y:j2}));if(uDe(pts))uc++;}
  g.cintas.forEach((pts,k)=>{if(uDe(dp(pts,0.3*g.W))){ue++;if(ej.length<3)ej.push({seed:4000+i,k,pts:dp(pts,0.3*g.W).map(q=>[+(q.x/g.W).toFixed(1),+(q.y/g.W).toFixed(1)])});}});}
 return {piezas:n,u_celdas:uc,u_ejes:ue,ej};},{P});
console.log(JSON.stringify(out));await br.close();})();
