// tools/static.mjs — rellena los bloques estáticos y el sitemap sin pasar por
// el panel. Node, desde la raíz del repo:  node tools/static.mjs [--check]
//
// El panel (admin.html) hace esto mismo al guardar una familia, con el MISMO
// static-gen.js: aquí no hay una segunda implementación, solo otra manera de
// invocarla — para el relleno inicial, para verificar que lo commiteado es lo
// que el generador produce (--check), y para no depender de un token cuando lo
// único que cambia es el HTML derivado.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
const GEN = require(path.join(ROOT, 'static-gen.js'));
const CHECK = process.argv.includes('--check');

const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const works = readJson('data/works.json');
let changed = 0, drift = 0;

function write(rel, next) {
  const abs = path.join(ROOT, rel);
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (prev === next) return;
  if (CHECK) { console.log('DERIVA:', rel); drift++; return; }
  fs.writeFileSync(abs, next);
  console.log('escrito:', rel);
  changed++;
}

for (const w of works) {
  if (!GEN.isShell(w)) continue;                  // cae a work.html?w=…: no hay cascarón que tocar
  const abs = path.join(ROOT, w.page);
  if (!fs.existsSync(abs)) { console.log('sin cascarón:', w.page); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes(GEN.MARK.headA)) { console.log('sin marcadores, se salta:', w.page); continue; }
  write(w.page, GEN.apply(src, w, works));
}
// Las páginas fijas: su cabecera es editorial y se queda a mano; lo que se
// genera es el bloque de contenido, que sale de un JSON y a mano se
// desincroniza. Ver CLAUDE.md § Buscadores y agentes.
const site = readJson('data/site.json');
const palettes = readJson('data/palettes.json');
for (const [file, block] of [['index.html', GEN.homeBody(works)],
                             ['about.html', GEN.aboutBody(site)],
                             ['palettes.html', GEN.palettesBody(palettes)]]) {
  const abs = path.join(ROOT, file);
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes(GEN.MARK.bodyA)) { console.log('sin marcadores, se salta:', file); continue; }
  write(file, GEN.applyBody(src, block));
}

// llms.txt: la prosa a mano, la lista generada.
const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
if (llms.includes(GEN.LLMS.a)) write('llms.txt', GEN.applyLlms(llms, works));
else console.log('sin marcadores, se salta: llms.txt');

write('sitemap.xml', GEN.sitemap(works));

if (CHECK) {
  console.log(drift ? `\n${drift} archivo(s) fuera de sincronía con works.json` : '\nsincronizado');
  process.exit(drift ? 1 : 0);
}
console.log(`\n${changed} archivo(s) escrito(s)`);
