// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const N=parseInt(process.argv[2]||'120',10), OFF=parseInt(process.argv[3]||'0',10);
const cfg=JSON.parse(process.argv[4]||'{}');
playwright().chromium.launch().then(async b=>{
  const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+D+'/solape.html');
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const out=[];
  for(let i=0;i<N;i++){const s=((i+OFF)*2654435761)%1000000007;
    out.push(await p.evaluate(([pl,s,cfg])=>window.solapes(s,pl,cfg),[pals,s,cfg]));}
  await b.close();
  const mal=out.filter(o=>o.solapados>0).sort((a,b)=>a.peorHolgura-b.peorHolgura);
  const h=out.map(o=>o.peorHolgura).sort((a,b)=>a-b);
  console.log(`${out.length} obras · holgura exigida ${out[0].holguraMin} anchuras (avoidRatio ${out[0].avoidRatio})`);
  console.log(`  holgura real entre hebras SIN cruce: min ${h[0]} · p05 ${h[Math.floor(0.05*h.length)]} · mediana ${h[Math.floor(h.length/2)]} anchuras`);
  console.log(`  obras con CUERPOS SOLAPADOS sin cruce (holgura < 1): ${mal.length}/${out.length}`);
  mal.slice(0,8).forEach(o=>console.log(`   #${o.seed} ${o.tipo} · ${o.solapados} pares · peor ${o.peorHolgura} anchuras · ${JSON.stringify(o.casos)}`));
});
