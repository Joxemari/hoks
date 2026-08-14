// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const SRC=process.argv[2], N=parseInt(process.argv[3]||'40',10), EXTRA=JSON.parse(process.argv[4]||'{}');
playwright().chromium.launch().then(async b=>{
  fs.writeFileSync(D+'/o2_run.html', fs.readFileSync(D+'/o2.html','utf8').replace('./SRC','./'+SRC));
  const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+D+'/o2_run.html');
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const out=[];
  for(let i=0;i<N;i++){const s=(i*2654435761)%1000000007;
    out.push(await p.evaluate(([pl,s,e])=>window.otros(s,pl,e),[pals,s,EXTRA]));}
  await b.close();
  const sold=out.filter(o=>o.pegado>0), bor=out.filter(o=>o.borde>0), sol=out.filter(o=>o.solape>0);
  const nd=out.reduce((a,o)=>a+o.nDisc,0), oj=out.reduce((a,o)=>a+o.enOjo,0);
  console.log(`[${SRC}] ${out.length} obras · ${JSON.stringify(EXTRA)}`);
  console.log(`  remates soldados a otra hebra : ${sold.length}/${out.length}` + (sold.length?'  '+sold.slice(0,4).map(o=>`#${o.seed}(${o.pegado}/${o.tot})`).join(' '):''));
  console.log(`  tinta pegada al borde         : ${bor.length}/${out.length}` + (bor.length?'  '+bor.slice(0,4).map(o=>`#${o.seed}(${o.borde}px)`).join(' '):''));
  console.log(`  discos que invaden la cinta   : ${sol.length}/${out.length}` + (sol.length?'  '+sol.slice(0,4).map(o=>`#${o.seed}(${(100*o.solape/o.area).toFixed(1)}%)`).join(' '):''));
  for (const o of out) for (const R of (o.rayos||[])) console.log(`  #${o.seed} ${R}`);
  console.log(`  discos ${nd}, en ojo del nudo ${oj}` +
              `, cabos tapados por otra hebra ${out.reduce((a,o)=>a+(o.cubiertos||0),0)}`);
});
