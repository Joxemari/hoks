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
 *   node _social/zernio.mjs post montaje.mp4 --caption pie.txt --cover portada.jpg   (Reel)
 *   node _social/zernio.mjs post pieza-9x16.png --story                               (Story)
 *
 * Qué sale lo decide el material, como en Instagram: una imagen es un post,
 * varias son un carrusel (hasta 10) y un vídeo solo es un Reel. --cover pone
 * la portada del Reel; sin ella, el primer fotograma. --story lo manda a
 * Stories, que no llevan pie ni primer comentario.
 *
 *   ZERNIO_TT_USERNAME=… node _social/zernio.mjs post reel.mp4 --to tiktok --caption pie.txt --cover p.jpg --at …
 *
 * A TikTok solo van vídeos, y como BORRADOR a la bandeja de la app: TikTok pide
 * que quien publica vea la pieza y dé su consentimiento, así que el último paso
 * es siempre del autor. Sin primer comentario: los hashtags van en el pie.
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
const HANDLES = {
  instagram: (process.env.ZERNIO_IG_USERNAME || 'hoks.art').replace(/^@/, ''),
  tiktok:    (process.env.ZERNIO_TT_USERNAME || 'hoks.art').replace(/^@/, ''),
};
async function account(platform) {
  const HANDLE = HANDLES[platform];
  const { accounts = [] } = await api('GET', '/accounts');
  const ig = accounts.filter(a => a.platform === platform);
  const it = ig.find(a => a.username === HANDLE);
  if (!it) throw new Error(`@${HANDLE} no está conectada en Zernio (${platform})` +
    (ig.length ? ` (hay: ${ig.map(a => '@' + a.username).join(', ')}).` : '.') +
    '\nConéctala y vuelve a probar.');
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
    else if (a === '--cover') o.cover = argv[++i];
    else if (a === '--story') o.story = true;
    else if (a === '--to') o.to = argv[++i];
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
    if (o.story && o.files.length > 1) throw new Error('una Story es una sola pieza');
    if (o.cover && !(o.files.length === 1 && /\.(mp4|mov)$/i.test(o.files[0]))) throw new Error('--cover es solo para un Reel (un vídeo solo)');
    if (!o.caption && !o.story) throw new Error('falta --caption (archivo o texto)');
    const content = !o.caption ? '' : fs.existsSync(o.caption) ? fs.readFileSync(o.caption, 'utf8').trim() : o.caption;
    if (/#\w/.test(content)) console.warn('⚠ el pie lleva hashtags: en la casa van en el primer comentario (BRAND.md §6).');
    const to = o.to || 'instagram';
    if (!HANDLES[to]) throw new Error('--to admite instagram o tiktok');
    if (to === 'tiktok' && (o.story || o.files.length !== 1 || !/\.(mp4|mov)$/i.test(o.files[0])))
      throw new Error('a TikTok solo va un vídeo suelto');
    const ig = await account(to);
    const mediaItems = [];
    for (const f of o.files) { mediaItems.push(await upload(f)); console.log('subido', f); }
    let psd, text = content;
    if (to === 'tiktok') {
      // TikTok no tiene primer comentario: los hashtags van al final del pie.
      // Y no se publica directo: va a la bandeja de TikTok como BORRADOR
      // (draft:true → Creator Inbox) y el autor lo termina desde la app. Esa
      // es su revisión y su consentimiento, que es lo que TikTok exige.
      text = content + '\n\n' + (o.comment || TAGS);
      psd = { draft: true, allowComment: true, allowDuet: false, allowStitch: false,
              contentPreviewConfirmed: true, expressConsentGiven: true };
      if (o.cover) { psd.videoCoverImageUrl = (await upload(o.cover)).url; console.log('portada', o.cover); }
    } else {
      psd = o.story ? { contentType: 'story' } : { firstComment: o.comment || TAGS };
      if (o.cover) { psd.instagramThumbnail = (await upload(o.cover)).url; console.log('portada', o.cover); }
    }
    const body = {
      content: text, mediaItems,
      platforms: [{ platform: to, accountId: ig._id, platformSpecificData: psd }],
    };
    // Sin --at es un borrador. Con --at se programa; nunca publishNow.
    if (o.at) { body.scheduledFor = o.at; body.timezone = o.tz || 'Europe/Madrid'; }
    else body.isDraft = true;
    // Mismos archivos + mismo pie = misma clave: un reintento no duplica el post.
    const h = crypto.createHash('sha256').update(to + text + o.files.map(f => fs.readFileSync(f).length + f).join('|') + (o.at || '') + (o.story ? 'story' : '') + (o.cover || '')).digest('hex');
    const key = [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-');
    const res = await api('POST', '/posts', body, { 'Idempotency-Key': key });
    const post = res.post || res;
    const kind = to === 'tiktok' ? 'tiktok (a la bandeja)' : o.story ? 'story' : o.files.length > 1 ? `carrusel de ${o.files.length}` : mediaItems[0].type === 'video' ? 'reel' : 'post';
    console.log(`${kind} · ${o.at ? 'programado para ' + o.at + ' (' + body.timezone + ')' : 'borrador'} en @${ig.username} · ${post._id || ''}`);
    console.log('Revísalo y apruébalo en zernio.com.');
  } else {
    console.log('uso: node _social/zernio.mjs accounts | post <archivos…> --caption <archivo|texto> [--comment …] [--cover img] [--story] [--to instagram|tiktok] [--at ISO] [--tz IANA]');
    process.exit(cmd ? 2 : 0);
  }
} catch (e) { console.error(e.message); process.exit(1); }
