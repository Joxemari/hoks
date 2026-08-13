// Ejecutar desde esta carpeta:  node <fichero>.js [args]
// Necesita Playwright con Chromium. Ver README.md.
// Playwright puede estar instalado global o local; se prueban los dos.
function playwright(){ for (const p of ['playwright','/opt/node22/lib/node_modules/playwright'])
  { try { return require(p); } catch (e) {} }
  throw new Error('no encuentro playwright: npm i -g playwright && npx playwright install chromium'); }
const { chromium } = playwright();
// node zoom.js entrada.png salida.png x y w h escala
const [src, out, x, y, w, h, k] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w * +k, height: +h * +k } });
  await p.setContent(`<style>body{margin:0}canvas{display:block;image-rendering:pixelated}</style>
   <canvas id=c width=${+w * +k} height=${+h * +k}></canvas><script>
   const i=new Image(); i.onload=()=>{const x=document.getElementById('c').getContext('2d');
   x.imageSmoothingEnabled=false; x.drawImage(i,${x},${y},${w},${h},0,0,${+w * +k},${+h * +k});
   window.__done=true;}; i.src='data:image/png;base64,${require('fs').readFileSync(src).toString('base64')}';
   </script>`);
  await p.waitForFunction(() => window.__done === true, { timeout: 20000 });
  await (await p.$('canvas')).screenshot({ path: out });
  await b.close();
  console.log('->', out);
})();
