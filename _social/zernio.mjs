/* zernio — deja posts de Instagram listos en Zernio, para aprobarlos allí.
 *
 * Nunca publica directo: un post sale como BORRADOR (por defecto) o
 * PROGRAMADO con --at. La aprobación es tuya, en el calendario de Zernio. El
 * activo sale del kit (_social/kit.js, BRAND.md §9); esto solo lo sube.
 *
 *   node _social/zernio.mjs accounts
 *   node _social/zernio.mjs post pieza.png --caption pie.txt [--comment "…"]
 *   node _social/zernio.mjs post a.png b.mp4 c.png --caption pie.txt      (carrusel)
 *   node _social/zernio.mjs post pieza.png --caption pie.txt --at 2026-11-10T19:00 [--tz Europe/Madrid]
 *
 * --caption acepta un archivo o el texto mismo. --comment es el primer
 * comentario; si no se da, van los hashtags de la casa (HOKSPOST.TAGS).
 *
 * Clave: ZERNIO_API_KEY en el entorno. En las sesiones en la nube va como
 * "network secret" y la añade el proxy, así que el script no la necesita ver;
 * ahí el fetch de Node tiene que ir por el proxy: NODE_USE_ENV_PROXY=1.
 * API: https://zernio.com/api/v1 (verificada contra el SDK oficial,
 * github.com/zernio-dev/zernio-node, noviembre de 2026).
 *
 * Ojo con el formato: por API, Instagram acepta feed entre 4:5 y 1,91:1, así
 * que la fila 3:4 (1080×1440) no pasa. Para Zernio se exporta en `feed` 4:5:
 * su margen del 11 % absorbe el recorte del perfil a 3:4 (≈34 px por lado,
 * todo papel), así que la fila se sigue leyendo entera.
 */
import fs from 'fs'; import path from 'path'; import crypto from 'crypto';

const API = 'https://zernio.com/api/v1';
const TAGS = '#generativeart #creativecoding #genart #handcodedgoods'; // = HOKSPOST.TAGS
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
                '.mp4': 'video/mp4', '.mov': 'video/quicktime' };

function headers(extra) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (process.env.ZERNIO_API_KEY) h.Authorization = 'Bearer ' + process.env.ZERNIO_API_KEY;
  return h;
}
async function api(method, p, body, extra) {
  const r = await fetch(API + p, { method, headers: headers(extra), body: body && JSON.stringify(body) });
  const text = await r.text(); let data; try { data = JSON.parse(text); } catch (e) { data = text; }
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status}: ${typeof data === 'string' ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)}`);
  return data;
}

// La cuenta se elige por NOMBRE, nunca por ser "la que hay": la primera vez se
// conectó por error la personal del autor, y con "la única conectada" los
// borradores habrían ido allí.
const HANDLE = (process.env.ZERNIO_IG_USERNAME || 'hoks.art').replace(/^@/, '');
async function instagram() {
  const { accounts = [] } = await api('GET', '/accounts');
  const ig = accounts.filter(a => a.platform === 'instagram');
  const it = ig.find(a => a.username === HANDLE);
  if (!it) throw new Error(`@${HANDLE} no está conectada en Zernio` +
    (ig.length ? ` (hay: ${ig.map(a => '@' + a.username).join(', ')}).` : '.') +
    '\nConéctala (Business o Creator) y vuelve a probar.');
  return it;
}

async function upload(file) {
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) throw new Error('formato no admitido: ' + file);
  const buf = fs.readFileSync(file);
  if (type.startsWith('image/') && buf.length > 5 * 1024 * 1024)
    throw new Error(`${file} pesa ${(buf.length / 1048576).toFixed(1)} MB; Instagram pide imágenes de menos de 5 MB.`);
  const pre = await api('POST', '/media/presign', { filename: path.basename(file), contentType: type, size: buf.length });
  const put = await fetch(pre.uploadUrl, { method: 'PUT', body: buf, headers: { 'Content-Type': type } });
  if (!put.ok) throw new Error(`subida de ${file} → ${put.status}`);
  return { type: type.startsWith('video/') ? 'video' : 'image', url: pre.publicUrl };
}

function args(argv) {
  const o = { files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--caption') o.caption = argv[++i];
    else if (a === '--comment') o.comment = argv[++i];
    else if (a === '--at') o.at = argv[++i];
    else if (a === '--tz') o.tz = argv[++i];
    else if (a.startsWith('--')) throw new Error('opción desconocida: ' + a);
    else o.files.push(a);
  }
  return o;
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'accounts') {
    const { accounts = [] } = await api('GET', '/accounts');
    if (!accounts.length) console.log('Ninguna red conectada todavía en Zernio.');
    for (const a of accounts) console.log(`${a.platform.padEnd(10)} @${a.username || a.displayName}  (${a._id})`);
  } else if (cmd === 'post') {
    const o = args(rest);
    if (!o.files.length) throw new Error('falta al menos un archivo');
    if (o.files.length > 10) throw new Error('un carrusel admite como mucho 10 piezas');
    if (!o.caption) throw new Error('falta --caption (archivo o texto)');
    const content = fs.existsSync(o.caption) ? fs.readFileSync(o.caption, 'utf8').trim() : o.caption;
    if (/#\w/.test(content)) console.warn('⚠ el pie lleva hashtags: en la casa van en el primer comentario (BRAND.md §6).');
    const ig = await instagram();
    const mediaItems = [];
    for (const f of o.files) { mediaItems.push(await upload(f)); console.log('subido', f); }
    const body = {
      content, mediaItems,
      platforms: [{ platform: 'instagram', accountId: ig._id,
                    platformSpecificData: { firstComment: o.comment || TAGS } }],
    };
    // Sin --at es un borrador. Con --at se programa; nunca publishNow.
    if (o.at) { body.scheduledFor = o.at; body.timezone = o.tz || 'Europe/Madrid'; }
    else body.isDraft = true;
    // Mismos archivos + mismo pie = misma clave: un reintento no duplica el post.
    const h = crypto.createHash('sha256').update(content + o.files.map(f => fs.readFileSync(f).length + f).join('|') + (o.at || '')).digest('hex');
    const key = [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-');
    const res = await api('POST', '/posts', body, { 'Idempotency-Key': key });
    const post = res.post || res;
    console.log(`${o.at ? 'programado para ' + o.at + ' (' + body.timezone + ')' : 'borrador'} en @${ig.username} · ${post._id || ''}`);
    console.log('Revísalo y apruébalo en zernio.com.');
  } else {
    console.log('uso: node _social/zernio.mjs accounts | post <archivos…> --caption <archivo|texto> [--comment …] [--at ISO] [--tz IANA]');
    process.exit(cmd ? 2 : 0);
  }
} catch (e) { console.error(e.message); process.exit(1); }
