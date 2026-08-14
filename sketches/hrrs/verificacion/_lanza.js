/* Arranque comun de los detectores. No es un detector: solo abre Chromium, mete
 * _engine.js y el algo.js de prueba, y recorre N obras repartidas entre las
 * configuraciones que se le pasen.
 *
 * El grano va SIEMPRE a cero. Usa Math.random(), asi que con grano dos renders de
 * la misma seed no son comparables y cualquier medida sobre el pixel se vuelve
 * ruido. Es una de las trampas que TRZS ya pago.
 */
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const REPO = path.join(__dirname, '..', '..', '..');

// Las configuraciones de la bateria. La regla: una constante que nunca se varia
// esconde su rama entera, asi que aqui tiene que aparecer TODO lo que el
// algoritmo ramifica — los cuatro tipos, los dos formatos, los dos campos, y los
// extremos de la gubia y del canal.
const CONFIGS = [
  { n: 'defecto',    fmt: 'square',     p: {} },
  { n: 'tendido',    fmt: 'square',     p: { tipo: 'tendido' } },
  { n: 'recinto',    fmt: 'square',     p: { tipo: 'recinto' } },
  { n: 'haz',        fmt: 'square',     p: { tipo: 'haz' } },
  { n: 'disperso',   fmt: 'square',     p: { tipo: 'disperso' } },
  { n: 'apaisado',   fmt: 'horizontal', p: {} },
  { n: 'apais-haz',  fmt: 'horizontal', p: { tipo: 'haz' } },
  { n: 'cuadro',     fmt: 'horizontal', p: { field: 'square' } },
  { n: 'gubia-fina', fmt: 'square',     p: { ancho: 0.52, canal: 0.17 } },
  { n: 'gubia-ancha',fmt: 'square',     p: { ancho: 1.0, canal: 0.26 } },
  { n: 'vibrada',    fmt: 'square',     p: { vibra: 1 } },
  { n: 'degradado',  fmt: 'square',     p: { bg: 'gradient' } },
];

function configs(only) {
  if (!only) return CONFIGS;
  const list = only.split(',').map(s => s.trim());
  const out = CONFIGS.filter(c => list.indexOf(c.n) >= 0);
  if (!out.length) throw new Error('configuracion desconocida: ' + only);
  return out;
}

// Reparte N obras entre las configuraciones y llama a `fn` en la pagina por cada
// una. `fn` recibe ({seed, fmt, params, base}) y devuelve lo que quiera medir.
async function recorrer(algo, N, base, only, fn, extra) {
  const cfgs = configs(only);
  const porCfg = Math.max(1, Math.round(N / cfgs.length));
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.setContent('<body></body>');
  await p.addScriptTag({ path: path.join(REPO, 'sketches/_engine.js') });
  await p.addScriptTag({ path: path.resolve(algo) });
  await p.evaluate(fn.toString().startsWith('function') ? `window.__fn = ${fn.toString()}`
                                                       : `window.__fn = (${fn.toString()})`);
  const out = [];
  for (const c of cfgs) {
    const res = await p.evaluate(({ c, porCfg, base, extra }) => {
      const rs = [];
      for (let i = 0; i < porCfg; i++) {
        // Seeds bien repartidas: el LCG con seeds contiguas da primeras tiradas
        // casi iguales, asi que un barrido de 1..N no es una muestra.
        const seed = ((i + 1) * 0x9E3779B1 ^ 0x5A17) >>> 0;
        try {
          rs.push(window.__fn({ seed, fmt: c.fmt, params: c.p, base, extra }));
        } catch (e) { rs.push({ err: String(e && e.message || e) }); }
      }
      return rs;
    }, { c, porCfg, base, extra });
    res.forEach(r => { if (r) { r.cfg = c.n; out.push(r); } });
    process.stderr.write(`  ${c.n} ${res.length}\n`);
  }
  await b.close();
  if (errs.length) console.error('ERRORES DE PAGINA:', errs.slice(0, 3).join(' | '));
  return out;
}

// Estadistica minima, que es la que se lee en la tabla del README.
function stats(v) {
  if (!v.length) return null;
  const s = v.slice().sort((a, b) => a - b);
  const q = f => s[Math.min(s.length - 1, Math.floor(f * s.length))];
  return { n: s.length, min: s[0], p50: q(0.5), p90: q(0.9), max: s[s.length - 1] };
}

module.exports = { recorrer, stats, configs, CONFIGS, REPO };
