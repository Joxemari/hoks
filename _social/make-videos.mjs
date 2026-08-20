/* feed-fábrica · genera los vídeos sociales de hoks desde el algoritmo real.
 *
 * Dos formatos, los acordados:
 *   · assembling — una pieza se pinta sola (fondo → objetos), como el splash.
 *   · iterations — el sistema escupe seeds, cortes secos.
 * Cada familia en 1:1 (feed / X) y 9:16 (Reels / Stories / TikTok).
 *
 * Requiere (solo en desarrollo, no en la web): Playwright (Chromium) y un
 * ffmpeg con libx264 — p.ej. `pip install imageio-ffmpeg`. No hay build del
 * sitio: esto es utillería de estudio, como sketches/ o _preview/.
 *
 *   node _social/make-videos.mjs [OUT_DIR] [FAM,FAM,...]
 *   node _social/make-videos.mjs ./out PLLS,KRRTK,DTKRT
 *
 * Los .mp4 NO se commitean (pesan y se regeneran): son entregables para colgar.
 */
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { execFileSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || './social-out');
const FAMILIES = (process.argv[3] || 'PLLS,KRRTK,DTKRT').split(',');
const ASPECTS = [['1x1', 1080, 1080], ['9x16', 1080, 1920]];

// ffmpeg con libx264: imageio-ffmpeg si está, si no el del PATH.
function ffmpegExe() {
  try { return execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"').toString().trim(); }
  catch (e) { return 'ffmpeg'; }
}
const FF = ffmpegExe();
const CHROME = process.env.CHROME || undefined; // deja que Playwright resuelva por defecto

const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (e, d) => { if (e) { s.writeHead(404); s.end('nf'); return; } s.writeHead(200, { 'content-type': types[path.extname(fp)] || 'application/octet-stream' }); s.end(d); });
});
await new Promise(r => srv.listen(8080, r));
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto('http://localhost:8080/_social/harness.html', { waitUntil: 'load' });
await pg.waitForFunction('window.__ready===true', { timeout: 8000 });
const C = pg.locator('#c'), pad = n => String(n).padStart(4, '0');
const enc = (dir, out, fps, crf) => execFileSync(FF, ['-y', '-framerate', String(fps), '-i', path.join(dir, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(crf), '-movflags', '+faststart', out], { stdio: 'ignore' });
const clean = d => { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); };
const ease = t => 1 - Math.pow(1 - t, 3);
const ASM = path.join(OUT, '_asm'), ITR = path.join(OUT, '_itr');

for (const fam of FAMILIES) {
  for (const [lab, W, Hh] of ASPECTS) {
    await pg.setViewportSize({ width: W, height: Hh });
    await pg.evaluate(([w, h]) => window.resize(w, h), [W, Hh]);
    // assembling — la pieza se pinta sola
    { clean(ASM); const REVEAL = 120, HOLD = 36; let n = 0;
      await pg.evaluate(([f, s]) => window.setup(f, s), [fam, 782297919]);
      for (let f = 0; f < REVEAL; f++) { await pg.evaluate(x => window.step(x), ease(f / (REVEAL - 1))); await C.screenshot({ path: path.join(ASM, 'f' + pad(n++) + '.png') }); }
      const last = path.join(ASM, 'f' + pad(n - 1) + '.png'); for (let h = 0; h < HOLD; h++) fs.copyFileSync(last, path.join(ASM, 'f' + pad(n++) + '.png'));
      enc(ASM, path.join(OUT, fam.toLowerCase() + '-assembling-' + lab + '.mp4'), 30, 18); }
    // iterations — el sistema escupe seeds
    { clean(ITR); const N = 30; let n = 0;
      for (let i = 0; i < N; i++) { const seed = ((i + 1) * 2654435761 >>> 0) % 1e9; await pg.evaluate(([f, s]) => window.full(f, s), [fam, seed]); await C.screenshot({ path: path.join(ITR, 'f' + pad(n++) + '.png') }); }
      enc(ITR, path.join(OUT, fam.toLowerCase() + '-iterations-' + lab + '.mp4'), 8, 20); }
    console.log(fam, lab, 'ok');
  }
}
fs.rmSync(ASM, { recursive: true, force: true }); fs.rmSync(ITR, { recursive: true, force: true });
await b.close(); srv.close();
console.log('done →', OUT);
