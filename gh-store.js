/* hoks · escritura en el repo por la Contents API de GitHub
 *
 * Todo lo que escribe datos —el panel, el laboratorio al publicar, el índice
 * de uso— pasa por aquí. Antes cada uno pedía el `sha` del archivo justo antes
 * de escribir y mandaba su copia en memoria: así GitHub nunca veía un
 * conflicto y ganaba el último en escribir, aunque su copia fuera de hacía
 * una hora. Ahora el `sha` sale de lo mismo que se leyó, y si el archivo ha
 * cambiado entretanto GitHub responde 409 y no se pisa nada.
 *
 * Dos formas de escribir, según qué sea el cambio:
 *
 *   HOKSGH.update(path, fn, msg)  — el cambio es una operación (añadir piezas,
 *       borrar una, renombrar un lote). Se lee el archivo tal como está ahora,
 *       se le aplica `fn`, y si otro escribió entre medias se repite sobre lo
 *       nuevo. Nada se pierde.
 *   HOKSGH.put(path, data, msg, baseSha) — el cambio es "este es el archivo"
 *       (el formulario de familias, de paletas, de contenido). Se escribe solo
 *       si nadie lo ha tocado desde `baseSha`; si no, error 'conflict' y quien
 *       llama pide recargar.
 *
 * La lectura usa el tipo raw de la API, que sirve archivos de hasta 100 MB; el
 * JSON normal de la API deja `content` vacío a partir de 1 MB, y eso era una
 * forma silenciosa de reescribir un archivo entero con solo lo nuevo. El `sha`
 * se calcula aquí con el mismo algoritmo que git (sha1 de "blob <n>\0" + bytes).
 */
(function (global) {
'use strict';

const REPO = 'Joxemari/hoks';
const API = 'https://api.github.com/repos/' + REPO + '/contents/';
const TOKEN_KEY = 'hoks-gh-token';

function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }

function fail(code, message) { const e = new Error(message); e.code = code; return e; }

async function blobSha(bytes) {
  const head = new TextEncoder().encode('blob ' + bytes.byteLength + '\0');
  const all = new Uint8Array(head.length + bytes.byteLength);
  all.set(head, 0); all.set(new Uint8Array(bytes), head.length);
  const d = new Uint8Array(await crypto.subtle.digest('SHA-1', all));
  return Array.from(d, b => b.toString(16).padStart(2, '0')).join('');
}

// Utf-8 → base64 sin pasar por cadenas latin1 (las galerías pesan MB).
function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// → { text, sha }  ·  { text: null, sha: null } si el archivo no existe.
async function readText(path) {
  const t = token();
  if (!t) throw fail('token', 'sin token de GitHub — guárdalo en admin');
  const r = await fetch(API + path + '?ref=main', {
    headers: { Authorization: 'Bearer ' + t, Accept: 'application/vnd.github.raw+json' },
    cache: 'no-store',
  });
  if (r.status === 404) return { text: null, sha: null };
  if (!r.ok) throw fail('read', 'GitHub ' + r.status + ' al leer ' + path);
  const buf = await r.arrayBuffer();
  return { text: new TextDecoder().decode(buf), sha: await blobSha(buf) };
}

// → { data, sha }. Un archivo que existe y no se puede leer como JSON es un
// error, no un archivo vacío: escribir encima lo borraría.
async function read(path) {
  const { text, sha } = await readText(path);
  if (text == null) return { data: undefined, sha: null };
  try { return { data: JSON.parse(text), sha }; }
  catch (e) { throw fail('parse', path + ' no es JSON válido: no se escribe encima'); }
}

async function putText(path, text, msg, sha) {
  const body = { message: msg || ('update ' + path), content: b64(text), branch: 'main' };
  if (sha) body.sha = sha;
  const r = await fetch(API + path, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.status === 409 || (r.status === 422 && !sha)) throw fail('conflict', path + ' ha cambiado mientras tanto');
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw fail('write', 'GitHub ' + r.status + (d.message ? ': ' + d.message : ''));
  }
  const d = await r.json().catch(() => ({}));
  return (d.content && d.content.sha) || null;
}

const json = data => JSON.stringify(data, null, 2);

async function put(path, data, msg, baseSha) {
  if (!token()) throw fail('token', 'sin token de GitHub — guárdalo en admin');
  return putText(path, json(data), msg, baseSha);
}

// fn(actual) → nuevo contenido, o undefined para no escribir nada.
// `actual` es undefined si el archivo no existe todavía.
async function update(path, fn, msg, tries) {
  tries = tries || 4;
  for (let i = 0; i < tries; i++) {
    const { data, sha } = await read(path);
    const next = await fn(data);
    if (next === undefined) return { data, sha, written: false };
    try {
      const nsha = await putText(path, json(next), msg, sha);
      return { data: next, sha: nsha, written: true };
    } catch (e) {
      if (e.code !== 'conflict' || i === tries - 1) throw e;
      await new Promise(res => setTimeout(res, 400 * (i + 1)));
    }
  }
}

global.HOKSGH = { token, read, readText, put, putText, update, blobSha };
})(window);
