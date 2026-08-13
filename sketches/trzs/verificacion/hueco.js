// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const SRC=process.argv[2],N=parseInt(process.argv[3]||'40',10),EXTRA=JSON.parse(process.argv[4]||'{}'),OFF=parseInt(process.argv[5]||'0',10);
playwright().chromium.launch().then(async b=>{
  const f=D+'/hueco_run_'+process.pid+'.html';
  fs.writeFileSync(f, fs.readFileSync(D+'/'+(process.env.DET||'hueco.html'),'utf8').replace('./SRC','./'+SRC));
  const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+f);
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const todos=[];
  for(let i=0;i<N;i++){ const s=((i+OFF)*2654435761)%1000000007;
    const r=await p.evaluate(([pl,s,e])=>window.huecos(s,pl,e),[pals,s,EXTRA]);
    for(const x of r.cruces) todos.push({seed:r.seed,W:r.W,...x}); }
  await b.close(); fs.unlinkSync(f);
  const r3=todos.filter(x=>x.racha>=3), r8=todos.filter(x=>x.racha>=8), r20=todos.filter(x=>x.racha>=20);
  console.log(JSON.stringify({src:SRC,cfg:EXTRA,obras:N,cruces:todos.length,
    racha3:r3.length, racha8:r8.length, racha20:r20.length,
    peores: todos.slice().sort((a,b)=>b.racha-a.racha).slice(0,5)
      .map(x=>`#${x.seed} x${x.k} ${x.ang}deg racha=${x.racha}px (W=${x.W}, pizca=${x.pizca}) en ${JSON.stringify(x.donde)} color ${x.colorPeor} · a ${x.aJunta}px de junta`)}));
});
