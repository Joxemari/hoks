// LOS INVARIANTES EN CADA PASO. La sospecha del autor es que un paso se lleva la esencia; esto
// lo mide con la misma vara en las ocho estaciones, para que la respuesta no sea una impresion.
const { circuito } = require('./gen.js');
const N = parseInt(process.argv[2] || '80', 10);
const hy = Math.hypot;
const largo = p => { let L=0; for (let i=0;i<p.length-1;i++) L+=hy(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]); return L; };
const remu = (p, paso) => { const o=[]; for (let i=0;i<p.length-1;i++){
  const ax=p[i][0],ay=p[i][1],bx=p[i+1][0],by=p[i+1][1],L=hy(bx-ax,by-ay),n=Math.max(1,Math.floor(L/paso));
  for(let k=0;k<n;k++){const t=k/n;o.push([ax+(bx-ax)*t,ay+(by-ay)*t,Math.atan2(by-ay,bx-ax)]);}}
  if(p.length)o.push([p[p.length-1][0],p[p.length-1][1],o.length?o[o.length-1][2]:0]); return o; };
const med = v => { const s=v.slice().sort((a,b)=>a-b); return s.length?s[Math.floor(s.length/2)]:0; };

const acc = [];
for (let i = 0; i < N; i++) {
  const c = circuito(((i+1)*0x9E3779B1 ^ 0x5A17)>>>0, { pasos: true });
  c.pasos.forEach((p, k) => {
    acc[k] = acc[k] || { etq: p.etq, linea: [], largo: [], ejes: [], giro: [], vuelta: [], acomp: [], ext: [] };
    const T = p.trazos.filter(t => t.length > 1);
    if (!T.length) return;
    const Ls = T.map(largo), Lt = Ls.reduce((a,b)=>a+b,0);
    acc[k].linea.push(Lt); acc[k].largo.push(med(Ls));
    // sobre los ejes, a +-10 grados y pesado por longitud (la misma vara que medir.js)
    let eje = 0, tot = 0, gir = [], vue = 0, ng = 0;
    for (const t of T) {
      for (let j = 0; j < t.length-1; j++) {
        const dx=t[j+1][0]-t[j][0], dy=t[j+1][1]-t[j][1], m=hy(dx,dy);
        if (m < 1e-9) continue;
        let a = ((Math.atan2(dy,dx)*180/Math.PI)%180+180)%180;
        tot += m; if (Math.min(a,180-a) < 10 || Math.abs(a-90) < 10) eje += m;
      }
      for (let j = 1; j < t.length-1; j++) {
        const a1=Math.atan2(t[j][1]-t[j-1][1],t[j][0]-t[j-1][0]);
        const a2=Math.atan2(t[j+1][1]-t[j][1],t[j+1][0]-t[j][0]);
        const g=Math.abs((a2-a1)*180/Math.PI%360>180?(a2-a1)*180/Math.PI%360-360:(a2-a1)*180/Math.PI%360);
        ng++; if (g>110) vue++; if (g>8) gir.push(g);
      }
    }
    acc[k].ejes.push(tot?eje/tot:0); acc[k].giro.push(med(gir)); acc[k].vuelta.push(ng?vue/ng:0);
    // acompanamiento, en anchuras de banda
    const SM = T.map(t => remu(t, 0.025));
    let ac = 0, n2 = 0;
    for (let a = 0; a < SM.length; a++) for (const q of SM[a]) { n2++;
      let mj = 9, da = 0;
      for (let b = 0; b < SM.length; b++) { if (a===b) continue;
        for (const o of SM[b]) { const dd = hy(q[0]-o[0], q[1]-o[1]); if (dd<mj){mj=dd;da=o[2];} } }
      const df = Math.abs(((q[2]-da+Math.PI/2)%Math.PI)-Math.PI/2);
      if (mj < 2.5*c.W && df < 25*Math.PI/180) ac++; }
    acc[k].acomp.push(ac/Math.max(1,n2));
    acc[k].ext.push(Math.max(...T.map(t => {
      const xs=t.map(q=>q[0]), ys=t.map(q=>q[1]);
      return Math.max(Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys));
    })) / Math.min(c.fw, c.fh));
  });
}
const OBJ = { linea:5.19, largo:0.568, ejes:0.49, giro:35, vuelta:0.01, acomp:0.52, ext:0.66 };
console.log('paso'.padEnd(20) + ['linea','largo','ejes','giro','vuelta%','acomp','ext'].map(s=>s.padStart(9)).join(''));
for (const a of acc) {
  console.log(a.etq.padEnd(20) +
    [med(a.linea).toFixed(2), med(a.largo).toFixed(2), med(a.ejes).toFixed(2),
     med(a.giro).toFixed(0), (100*med(a.vuelta)).toFixed(0), med(a.acomp).toFixed(2),
     med(a.ext).toFixed(2)].map(s=>s.padStart(9)).join(''));
}
console.log('OBJETIVO (5 refs)'.padEnd(20) +
  [OBJ.linea, OBJ.largo, OBJ.ejes, OBJ.giro, 1, OBJ.acomp, OBJ.ext].map(s=>String(s).padStart(9)).join(''));
