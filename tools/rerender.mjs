/* rerender — vuelve a pintar una pieza publicada TAL CUAL se publicó.
 *
 * Una pieza publicada guarda su receta y el hash git del código que la pintó
 * (sketches/_batch.js, publish). Con eso no hace falta que el algo.js siga
 * igual: se saca de git el archivo exacto y se pinta a pliego.
 *
 *   node tools/rerender.mjs <obra> <seed>                 → A3 a 300 dpi
 *   node tools/rerender.mjs <obra> <seed> A2 pieza.png    → otro pliego / salida
 *   node tools/rerender.mjs <obra> <seed> --check         → ¿sale igual que lo publicado?
 *
 * --check pinta a la resolución del sitio y compara con el PNG de
 * data/<obra>.json. Es la prueba de que la receta basta. Con el grano sembrado
 * (noviembre de 2026) tiene que salir idéntica al píxel; una pieza pintada con
 * el grano aleatorio de antes solo puede coincidir en composición.
 *
 * Requiere (solo en desarrollo): Playwright (Chromium) y el historial de git
 * que contenga esos archivos. En un clon superficial: git fetch --unshallow.
 */
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';

// Playwright no es dependencia del repo (no hay package.json, a propósito).
// Un import ESM a secas solo mira node_modules junto al script; require sí
// respeta NODE_PATH y las instalaciones globales, que es donde suele estar.
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) {
  try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
  catch (e2) {
    console.error('Falta Playwright. Instálalo global (npm i -g playwright) y exporta NODE_PATH=$(npm root -g).');
    process.exit(2);
  }
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [work, seedArg, ...rest] = process.argv.slice(2);
const check = rest.includes('--check');
const pos = rest.filter(a => !a.startsWith('--'));
const sheet = pos[0] || 'A3';
if (!work || !seedArg) { console.error('uso: node tools/rerender.mjs <obra> <seed> [A3|A2|A1] [salida.png] [--check]'); process.exit(2); }
const seed = Number(seedArg) >>> 0;

const gallery = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', work + '.json'), 'utf8'));
const entry = gallery.find(e => (e.seed >>> 0) === seed);
if (!entry) { console.error(`no hay ${work} #${seed} en data/${work}.json`); process.exit(1); }
if (!entry.recipe || !entry.code || !entry.code.algo || !entry.code.engine) {
  console.error(`${work} #${seed} se publicó antes de que la galería guardara receta y código:\n` +
    'solo existe su PNG. No se puede reimprimir desde aquí.');
  process.exit(1);
}
const { recipe, code } = entry;

function blob(hash, what) {
  try { return execFileSync('git', ['-C', ROOT, 'cat-file', '-p', hash], { maxBuffer: 1 << 26 }).toString('utf8'); }
  catch (e) {
    console.error(`el ${what} de esta pieza (${hash}) no está en este clon.\n` +
      'Si es un clon superficial: git fetch --unshallow origin');
    process.exit(1);
  }
}
const engineSrc = blob(code.engine, '_engine.js'), algoSrc = blob(code.algo, recipe.work + '/algo.js');

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage();
await page.addScriptTag({ content: engineSrc });
await page.addScriptTag({ content: algoSrc });

// La paleta se reproduce con la lista [esa paleta]: si salió sola ('auto'), el
// sorteo consume la misma tirada que entonces y devuelve la misma; si estaba
// fijada, no consume ninguna. El resto del azar queda donde estaba.
const BLOCK_TOL = 12;   // niveles de diferencia media por bloque que se atribuyen al grano
const out = await page.evaluate(async ({ recipe, sheet, check, ref, BLOCK_TOL }) => {
  const E = window.HOKS, W = E[recipe.work.toUpperCase()];
  const d = check ? E.fmtDims(recipe.format, E.PREVIEW_SHORT) : E.printDims(recipe.format, sheet);
  const c = document.createElement('canvas'); c.width = d.W; c.height = d.H;
  const x = c.getContext('2d');
  const res = W.render(x, d.W, d.H, recipe.seed >>> 0, {
    palettes: [{ ...recipe.palette, prob: 1 }], locked: recipe.pal === 'locked', lockedIdx: 0,
    params: recipe.params || {},
  });
  const info = { W: d.W, H: d.H, palette: res && res.pal && res.pal.name };
  if (check) {
    const img = new Image(); img.src = ref; await img.decode();
    const r = document.createElement('canvas'); r.width = d.W; r.height = d.H;
    const rx = r.getContext('2d'); rx.drawImage(img, 0, 0);
    const a = x.getImageData(0, 0, d.W, d.H).data, b = rx.getImageData(0, 0, d.W, d.H).data;
    // El grano sale de Math.random (_engine.js): cambia en cada render, también
    // en el laboratorio. Lo que tiene que coincidir es la composición, así que se
    // compara por bloques de 16 px, donde el grano se promedia. Un bloque con la
    // forma o el color equivocados se va a decenas de niveles.
    let px = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) px++;
    const B = 16, bx = Math.floor(d.W / B), by = Math.floor(d.H / B);
    let worst = 0, off = 0;
    for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      const s = [0, 0, 0, 0, 0, 0];
      for (let y = j * B; y < (j + 1) * B; y++) for (let xx = i * B; xx < (i + 1) * B; xx++) {
        const k = (y * d.W + xx) * 4; for (let c = 0; c < 3; c++) { s[c] += a[k + c]; s[c + 3] += b[k + c]; }
      }
      const m = Math.max(...[0, 1, 2].map(c => Math.abs(s[c] - s[c + 3]) / (B * B)));
      if (m > worst) worst = m; if (m > BLOCK_TOL) off++;
    }
    return { ...info, sameSize: img.naturalWidth === d.W && img.naturalHeight === d.H, worst: +worst.toFixed(1), off, blocks: bx * by, px };
  }
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return { ...info, png: btoa(s) };
}, { recipe, sheet, check, ref: entry.dataUrl, BLOCK_TOL });
await browser.close();

const tag = `${work} #${seed} · ${recipe.format} · ${out.palette}`;
if (check) {
  const ok = out.sameSize && out.off === 0;
  console.log(`${tag} · ${out.W}×${out.H} · ` + (!ok
    ? `NO coincide: ${out.off} de ${out.blocks} bloques distintos (peor: ${out.worst})`
    : out.px === 0 ? 'idéntica al píxel a lo publicado'
    : `misma composición, grano distinto (${out.px} px): se pintó con el grano aleatorio de antes`));
  process.exit(ok ? 0 : 1);
}
const file = pos[1] || `${work}-${seed}-${sheet}-${recipe.format}.png`;
fs.writeFileSync(file, Buffer.from(out.png, 'base64'));
console.log(`${tag} · ${sheet} 300 dpi · ${out.W}×${out.H} → ${file}`);
