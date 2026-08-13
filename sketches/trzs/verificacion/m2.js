// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const D=__dirname,fs=require('fs');
const raw=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../data/palettes.json'),'utf8'));
const P=(Array.isArray(raw)?raw:raw.palettes||[]).filter(p=>p.colors&&p.colors.length>=2&&p.active!==false);
const SRC=process.argv[2], N=parseInt(process.argv[3]||'40',10);
const EXTRA=JSON.parse(process.argv[4]||'{}'), CAPA=process.argv[5]==='capa';
const U=0.55;
playwright().chromium.launch().then(async b=>{
  fs.writeFileSync(D+'/m2_run.html', fs.readFileSync(D+'/m2.html','utf8').replace('./SRC','./'+SRC));
  const p=await b.newPage(); p.on('pageerror',e=>console.log('ERR '+e.message));
  await p.goto('file://'+D+'/m2_run.html');
  await p.waitForFunction(()=>window.__ok===true,{timeout:20000});
  const pals=await p.evaluate(x=>HOKS.normalizePalettes(x), P);
  const out=[];
  for(let i=0;i<N;i++){const s=(i*2654435761)%1000000007;
    out.push(await p.evaluate(([pl,s,e,c])=>window.medir(s,pl,e,c),[pals,s,EXTRA,CAPA]));}
  await b.close();
  let n=0,sanos=0,med=0,nul=0; const casos=[];
  for(const r of out) for(const x of r.resultados){ n++;
    const a=x.cob1>=U, bb=x.cob2>=U;
    if(a&&bb) sanos++;
    else if(!a&&!bb){ nul++; casos.push(`#${r.seed} x${x.k} ${x.ang}° SIN CORTE (${x.cob1}/${x.cob2})`); }
    else { med++; casos.push(`#${r.seed} x${x.k} ${x.ang}° A MEDIAS (${x.cob1}/${x.cob2})`); } }
  console.log(`[${SRC}${CAPA?' · CAPA':''}] ${out.length} obras · ${n} cruces · ${JSON.stringify(EXTRA)}`);
  console.log(`  sanos ${sanos}   a medias ${med} (${n?(100*med/n).toFixed(1):0}%)   sin corte ${nul} (${n?(100*nul/n).toFixed(1):0}%)`);
  console.log(`  obras sin tejido limpio: ${out.filter(r=>!r.limpio).length}/${out.length} · cruces/obra ${(n/out.length).toFixed(2)}`);
  casos.slice(0,8).forEach(c=>console.log('   '+c));
});
