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
 *   <script src="usage.js"></script>
 *     HOKSUSAGE.load()                       → { works: [...] }
 *     HOKSUSAGE.counts(data)                 → { <paletteId>: nObras }
 *     HOKSUSAGE.record(fam, seed, ts, pal)   → añade una fila (requiere token)
 */
(function (global) {
'use strict';

const RAW  = 'https://raw.githubusercontent.com/Joxemari/hoks/main/data/palette-usage.json';
const PATH = 'data/palette-usage.json';
const REPO = 'Joxemari/hoks';
const GH_TOKEN_KEY = 'hoks-gh-token';

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

const b64enc = s => btoa(unescape(encodeURIComponent(s)));
const b64dec = s => decodeURIComponent(escape(atob(String(s).replace(/\s/g, ''))));

// Añade la obra recién guardada al índice. Sin token de admin no hace nada.
async function record(family, seed, savedAt, pal) {
  const token = localStorage.getItem(GH_TOKEN_KEY);
  if (!token || !pal) return;
  const url = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  const auth = { 'Authorization': 'Bearer ' + token };
  let sha, data = empty();
  try {
    const r = await fetch(url + '?t=' + Date.now(), { headers: auth });
    if (r.ok) {
      const j = await r.json();
      sha = j.sha;
      try { const p = JSON.parse(b64dec(j.content)); if (p && Array.isArray(p.works)) data = p; } catch (e) {}
    }
  } catch (e) { return; }   // sin poder leer el índice, no lo sobrescribimos
  data.works.unshift({
    family, seed: Number(seed), savedAt: savedAt || Date.now(),
    paletteId: pal.id, paletteName: pal.name, source: 'save',
  });
  data.generated = Date.now();
  const body = { message: 'palette usage: ' + family + ' #' + seed + ' → ' + pal.name,
                 content: b64enc(JSON.stringify(data, null, 2)) };
  if (sha) body.sha = sha;
  try {
    await fetch(url, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, auth),
                       body: JSON.stringify(body) });
  } catch (e) {}
}

global.HOKSUSAGE = { load, counts, record };
})(window);
