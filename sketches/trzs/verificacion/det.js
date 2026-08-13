// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const SEEDS=[0,1,7,42,123456,2654435761%1000000007,999999937];
playwright().chromium.launch().then(async b=>{
  const abre=async()=>{ const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
    await p.goto('file://'+D+'/hash.html');
    await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
    return [p, await p.evaluate(x=>HOKS.normalizePalettes(x), P)]; };
  const corre=async(p,pl,seeds)=>{ const o={};
    for(const s of seeds) o[s]=(await p.evaluate(([pp,s])=>window.h(s,pp,{}),[pl,s])).h;
    return o; };

  const [p1,pl1]=await abre();
  const A=await corre(p1,pl1,SEEDS);                       // 1. tal cual
  const B=await corre(p1,pl1,SEEDS);                       // 2. repitiendo
  const C=await corre(p1,pl1,SEEDS.slice().reverse());     // 3. en otro orden
  await p1.reload(); await p1.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const D2=await corre(p1,pl1,SEEDS);                      // 4. tras recargar
  const [p2,pl2]=await abre();
  const E=await corre(p2,pl2,SEEDS);                       // 5. en otra pestana
  await b.close();
  const ok=(x)=>SEEDS.every(s=>x[s]===A[s]);
  console.log('repitiendo la llamada :', ok(B)?'IDENTICO':'FALLA');
  console.log('pidiendolos al reves  :', ok(C)?'IDENTICO':'FALLA');
  console.log('tras recargar         :', ok(D2)?'IDENTICO':'FALLA');
  console.log('en otra pestana       :', ok(E)?'IDENTICO':'FALLA');
  console.log(`(${SEEDS.length} seeds)`);
});
