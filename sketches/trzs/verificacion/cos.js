// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const SRC=process.argv[2],N=parseInt(process.argv[3]||'40',10),EXTRA=JSON.parse(process.argv[4]||'{}');
playwright().chromium.launch().then(async b=>{
  fs.writeFileSync(D+'/cos_run.html', fs.readFileSync(D+'/cos.html','utf8').replace('./SRC','./'+SRC));
  const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+D+'/cos_run.html');
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const out=[];
  for(let i=0;i<N;i++){const s=(i*2654435761)%1000000007;
    out.push(await p.evaluate(([pl,s,e])=>window.costuras(s,pl,e),[pals,s,EXTRA]));}
  await b.close();
  const con=out.filter(o=>o.mez>=25).sort((a,b)=>b.mez-a.mez);
  const tot=out.reduce((a,o)=>a+o.mez,0);
  console.log(`[${SRC}] ${out.length} obras ${JSON.stringify(EXTRA)}`);
  console.log(`  obras con costura visible (>=25 px mezclados dentro): ${con.length}/${out.length} · px totales ${tot}`);
  con.slice(0,6).forEach(o=>console.log(`   #${o.seed} ${o.mez}px  ${o.tipo} ${o.cruces}cr ${o.secs}secs ${o.juntas}juntas  en ${JSON.stringify(o.pts.slice(0,2))}`));
});
