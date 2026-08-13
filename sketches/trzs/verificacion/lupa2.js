// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
playwright().chromium.launch().then(async b=>{
  const p=await b.newPage({viewport:{width:900,height:900}});
  p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+D+'/lupa.html');
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const seed=parseInt(process.argv[2],10);
  const r=await p.evaluate(([pl,s])=>{
    const T=window.__TRZS, S=900;
    const c=T.generate(s,{paletas:pl,aspecto:1,dots:'no'});
    const cv=document.createElement('canvas'); cv.width=cv.height=S; cv.id='v';
    document.body.appendChild(cv);
    const rr=T.renderComposition(cv.getContext('2d'),0,0,S,c,S,true,false);
    return {tinta:c.colores.fg, fondo:c.colores.bg, W:Math.round(rr.width), gap:+rr.gap.toFixed(2)};
  },[pals,seed]);
  await (await p.$('#v')).screenshot({path:`${D}/M_${seed}.png`});
  await b.close();
  console.log(`TINTA ${r.tinta}   FONDO ${r.fondo}   anchura ${r.W}px   incision ${r.gap}px`);
});
