/* hoks · registro de uso de paletas — data/palette-usage.json
 *
 * Los JSON de obras guardadas solo llevan {seed, dataUrl, savedAt}: nunca
 * registraron la paleta, y no se puede re-derivar del seed (rng.weighted()
 * depende del conjunto de paletas activas en el momento del dibujo). Así que
 * el uso vive en su propio índice: una fila por obra guardada.
 *
 * Lo lee palettes.html (rejilla de uso) y lo escriben las páginas de obra al
 * pulsar Guardar, commiteando a main como el resto de los datos.
 *
 *   <script src="gh-store.js"></script>   (solo para escribir)
 *   <script src="usage.js"></script>
 *     HOKSUSAGE.load()                       → { works: [...] }
 *     HOKSUSAGE.counts(data)                 → { <paletteId>: nObras }
 *     HOKSUSAGE.record(fam, seed, ts, pal)   → añade una fila (requiere token)
 */
(function (global) {
'use strict';

const RAW  = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/palette-usage.json';
const PATH = 'data/palette-usage.json';

const empty = () => ({ works: [] });

async function load() {
  try {
    const r = await fetch(RAW + '?t=' + Date.now());
    if (!r.ok) return empty();
    const d = await r.json();
    return (d && Array.isArray(d.works)) ? d : empty();
  } catch (e) { return empty(); }
}

function counts(data) {
  const m = {};
  for (const w of ((data && data.works) || [])) {
    if (w.paletteId == null) continue;
    m[w.paletteId] = (m[w.paletteId] || 0) + 1;
  }
  return m;
}

// Añade varias obras al índice de una vez: un solo commit por publicación de
// lote, no uno por pieza. Sin token de admin no hace nada.
// rows: [{ family, seed, savedAt, paletteId, paletteName }]
//
// Pasa por HOKSGH.update (gh-store.js): lee el índice tal como está en main,
// le añade las filas y, si alguien escribió entre medias, repite sobre lo
// nuevo. Si el índice existe pero no se puede leer, NO se escribe: antes un
// índice ilegible (o de más de 1 MB, que la API devolvía vacío) se reescribía
// con solo las filas nuevas.
// → true si quedó escrito, false si no había nada que hacer o no hay token.
async function recordMany(rows) {
  rows = (rows || []).filter(r => r && r.paletteId != null);
  if (!rows.length || !global.HOKSGH || !global.HOKSGH.token()) return false;
  const msg = rows.length === 1
    ? 'palette usage: ' + rows[0].family + ' #' + rows[0].seed + ' → ' + rows[0].paletteName
    : 'palette usage: +' + rows.length + ' obras';
  await global.HOKSGH.update(PATH, cur => {
    if (cur !== undefined && !(cur && Array.isArray(cur.works)))
      throw new Error('palette-usage.json no tiene la forma esperada: no se escribe encima');
    const data = cur || empty();
    data.works.unshift(...rows.map(r => ({
      family: r.family, seed: Number(r.seed), savedAt: r.savedAt || Date.now(),
      paletteId: r.paletteId, paletteName: r.paletteName, source: 'save',
    })));
    data.generated = Date.now();
    return data;
  }, msg);
  return true;
}

// Una sola obra (páginas de obra heredadas, que aún guardan de una en una).
function record(family, seed, savedAt, pal) {
  if (!pal) return Promise.resolve(false);
  return recordMany([{ family, seed, savedAt, paletteId: pal.id, paletteName: pal.name }])
    .catch(e => { console.warn('[usage]', e.message); return false; });
}

global.HOKSUSAGE = { load, counts, record, recordMany };
})(window);
