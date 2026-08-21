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

const works = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/works.json'), 'utf8'));
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
write('sitemap.xml', GEN.sitemap(works));

if (CHECK) {
  console.log(drift ? `\n${drift} archivo(s) fuera de sincronía con works.json` : '\nsincronizado');
  process.exit(drift ? 1 : 0);
}
console.log(`\n${changed} archivo(s) escrito(s)`);
