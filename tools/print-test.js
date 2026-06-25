#!/usr/bin/env node
'use strict';

/*
 * print-test.js — utilidad LOCAL para afinar la impresión IPP de la Canon
 * PIXMA iP8750 antes de cablearla a la web. Sin dependencias: Node puro.
 *
 * No forma parte del sitio publicado (vive en tools/, Pages no lo enlaza).
 * Habla IPP directo a la impresora de red — el mismo canal que usará luego
 * el botón "Print" del admin, así que lo que afines aquí vale tal cual.
 *
 * Uso:
 *   node tools/print-test.js attrs <ip>
 *       Interroga la impresora y vuelca lo que SOPORTA: tamaños (media),
 *       tipos de papel (media-type), calidades, márgenes/borderless, formatos.
 *
 *   node tools/print-test.js print <ip> <archivo> [opciones]
 *       Envía un trabajo de prueba.
 *       --size a4|a3            tamaño (def. a4)
 *       --type <keyword>        media-type exacto del volcado de 'attrs'
 *       --quality draft|normal|high   (def. high)
 *       --borderless            márgenes a 0 (sin bordes)
 *       --copies <n>            (def. 1)
 *       --format <mime|auto>    def. auto por extensión
 *       --port <n>              def. 631
 *       --path <ruta>           def. /ipp/print
 *
 * Ej.:  node tools/print-test.js print 192.168.1.50 prueba.jpg --size a3 --borderless --type photographic-glossy
 *
 * Nota: las impresoras AirPrint aceptan con seguridad image/jpeg. PNG puede
 * no aceptarse; si una prueba PNG falla, reexporta a JPEG de máxima calidad.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- Tags IPP ----
const TAG = {
  opAttrs: 0x01, jobAttrs: 0x02, end: 0x03,
  integer: 0x21, boolean: 0x22, enum: 0x23,
  resolution: 0x32, rangeOfInteger: 0x33,
  begCollection: 0x34, endCollection: 0x37, memberAttrName: 0x4a,
  textWithoutLang: 0x41, nameWithoutLang: 0x42, keyword: 0x44,
  uri: 0x45, charset: 0x47, naturalLanguage: 0x48, mimeMediaType: 0x49,
};

// Tamaños en centésimas de mm (unidad IPP de márgenes/dimensiones).
const SIZES = {
  a4: { x: 21000, y: 29700 },
  a3: { x: 29700, y: 42000 },
};

const QUALITY = { draft: 3, normal: 4, high: 5 };

// ---- Codificación ----
function intVal(n) { const b = Buffer.alloc(4); b.writeInt32BE(n, 0); return b; }

// Un atributo: tag(1) nameLen(2) name valueLen(2) value
function attr(tag, name, value) {
  const nb = Buffer.from(name, 'utf8');
  const vb = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  const b = Buffer.alloc(1 + 2 + nb.length + 2 + vb.length);
  let o = 0;
  b.writeUInt8(tag, o); o += 1;
  b.writeUInt16BE(nb.length, o); o += 2;
  nb.copy(b, o); o += nb.length;
  b.writeUInt16BE(vb.length, o); o += 2;
  vb.copy(b, o);
  return b;
}

// Miembro de colección. value puede ser {__c:[...]} para anidar.
function encMember(name, tag, value) {
  const parts = [attr(TAG.memberAttrName, '', Buffer.from(name, 'utf8'))];
  if (value && value.__c) {
    parts.push(attr(TAG.begCollection, '', Buffer.alloc(0)));
    for (const m of value.__c) parts.push(encMember(m.name, m.tag, m.value));
    parts.push(attr(TAG.endCollection, '', Buffer.alloc(0)));
  } else {
    parts.push(attr(tag, '', value));
  }
  return Buffer.concat(parts);
}

function topCollection(name, members) {
  const parts = [attr(TAG.begCollection, name, Buffer.alloc(0))];
  for (const m of members) parts.push(encMember(m.name, m.tag, m.value));
  parts.push(attr(TAG.endCollection, '', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

function ippHeader(opId, reqId) {
  const h = Buffer.alloc(8);
  h.writeUInt16BE(0x0200, 0); // versión 2.0
  h.writeUInt16BE(opId, 2);
  h.writeUInt32BE(reqId, 4);
  return h;
}

function opGroup(printerUri, user) {
  const g = [Buffer.from([TAG.opAttrs])];
  g.push(attr(TAG.charset, 'attributes-charset', 'utf-8'));
  g.push(attr(TAG.naturalLanguage, 'attributes-natural-language', 'en'));
  g.push(attr(TAG.uri, 'printer-uri', printerUri));
  if (user) g.push(attr(TAG.nameWithoutLang, 'requesting-user-name', user));
  return g;
}

// ---- Parseo de respuesta (suficiente para volcar valores escalares 1setOf) ----
function parseResponse(buf) {
  const statusCode = buf.readUInt16BE(2);
  const attrs = {};
  let o = 8, curName = null;
  while (o < buf.length) {
    const tag = buf.readUInt8(o); o += 1;
    if (tag === TAG.end) break;
    if (tag < 0x10) { continue; } // delimitador de grupo
    const nameLen = buf.readUInt16BE(o); o += 2;
    const name = buf.toString('utf8', o, o + nameLen); o += nameLen;
    const valLen = buf.readUInt16BE(o); o += 2;
    const raw = buf.slice(o, o + valLen); o += valLen;
    let val;
    if (tag === TAG.integer || tag === TAG.enum) val = valLen >= 4 ? raw.readInt32BE(0) : null;
    else if (tag === TAG.boolean) val = raw.readUInt8(0) === 1;
    else if (tag === TAG.begCollection || tag === TAG.endCollection || tag === TAG.memberAttrName) val = null;
    else val = raw.toString('utf8');
    const key = nameLen > 0 ? name : curName;
    if (nameLen > 0) curName = name;
    if (key && val !== null) (attrs[key] = attrs[key] || []).push(val);
  }
  return { statusCode, attrs };
}

function post(ip, port, urlPath, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: ip, port, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/ipp', 'Content-Length': body.length },
      timeout: 15000,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ http: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout (¿IP/puerto correctos? ¿impresora encendida?)')));
    req.on('error', reject);
    req.end(body);
  });
}

function statusName(code) {
  if (code === 0x0000) return 'successful-ok';
  if (code === 0x0001) return 'successful-ok-ignored-or-substituted-attributes';
  if (code >= 0x0400 && code < 0x0500) return 'client-error (0x' + code.toString(16) + ')';
  if (code >= 0x0500) return 'server-error (0x' + code.toString(16) + ')';
  return '0x' + code.toString(16);
}

// ---- Subcomandos ----
async function cmdAttrs(ip, port, urlPath) {
  const uri = `ipp://${ip}:${port}${urlPath}`;
  const body = Buffer.concat([
    ippHeader(0x000b, 1), // Get-Printer-Attributes
    ...opGroup(uri, null),
    attr(TAG.keyword, 'requested-attributes', 'all'),
    Buffer.from([TAG.end]),
  ]);
  const res = await post(ip, port, urlPath, body);
  const { statusCode, attrs } = parseResponse(res.body);
  console.log(`\nIPP status: ${statusName(statusCode)}  (HTTP ${res.http})\n`);

  const show = (label, key, map) => {
    const v = attrs[key];
    if (!v) return;
    const out = map ? v.map(map) : v;
    console.log(`${label}:\n  ${[...new Set(out)].join('\n  ')}\n`);
  };
  const qn = (n) => ({ 3: 'draft(3)', 4: 'normal(4)', 5: 'high(5)' }[n] || n);

  console.log('=== Lo que soporta la impresora ===\n');
  show('Modelo', 'printer-make-and-model');
  show('Formatos de documento aceptados', 'document-format-supported');
  show('Tamaños de papel (media)', 'media-supported');
  show('Tipos de papel (media-type)', 'media-type-supported');
  show('Bandejas/fuentes (media-source)', 'media-source-supported');
  show('Calidades', 'print-quality-supported', qn);
  show('Resoluciones', 'printer-resolution-supported');
  show('Modos de color', 'print-color-mode-supported');
  show('Caras (sides)', 'sides-supported');
  console.log('--- Márgenes (0 = borderless disponible) ---');
  show('Margen inferior soportado (centésimas mm)', 'media-bottom-margin-supported');
  show('Margen superior soportado', 'media-top-margin-supported');
  show('Margen izquierdo soportado', 'media-left-margin-supported');
  show('Margen derecho soportado', 'media-right-margin-supported');

  console.log('\n(Para ver TODO crudo: añade --raw)\n');
  if (process.argv.includes('--raw')) {
    for (const k of Object.keys(attrs).sort()) console.log(`${k} = ${attrs[k].join(', ')}`);
  }
}

async function cmdPrint(ip, port, urlPath, file, opts) {
  const data = fs.readFileSync(file);
  let fmt = opts.format;
  if (!fmt || fmt === 'auto') {
    const ext = path.extname(file).toLowerCase();
    fmt = ext === '.png' ? 'image/png'
      : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg'
      : ext === '.pdf' ? 'application/pdf'
      : 'application/octet-stream';
  }
  const uri = `ipp://${ip}:${port}${urlPath}`;
  const size = SIZES[opts.size] || SIZES.a4;

  // media-col: tamaño + (márgenes 0 si borderless) + (tipo si se indicó)
  const members = [{
    name: 'media-size', tag: TAG.begCollection, value: {
      __c: [
        { name: 'x-dimension', tag: TAG.integer, value: intVal(size.x) },
        { name: 'y-dimension', tag: TAG.integer, value: intVal(size.y) },
      ],
    },
  }];
  if (opts.borderless) {
    for (const m of ['media-top-margin', 'media-bottom-margin', 'media-left-margin', 'media-right-margin'])
      members.push({ name: m, tag: TAG.integer, value: intVal(0) });
  }
  if (opts.type) members.push({ name: 'media-type', tag: TAG.keyword, value: Buffer.from(opts.type, 'utf8') });

  const job = [Buffer.from([TAG.jobAttrs])];
  job.push(attr(TAG.enum, 'print-quality', intVal(QUALITY[opts.quality] || QUALITY.high)));
  if (opts.copies > 1) job.push(attr(TAG.integer, 'copies', intVal(opts.copies)));
  job.push(topCollection('media-col', members));

  const body = Buffer.concat([
    ippHeader(0x0002, 1), // Print-Job
    ...opGroup(uri, process.env.USERNAME || process.env.USER || 'hoks'),
    attr(TAG.nameWithoutLang, 'job-name', path.basename(file)),
    attr(TAG.mimeMediaType, 'document-format', fmt),
    ...job,
    Buffer.from([TAG.end]),
    data,
  ]);

  console.log(`\nEnviando ${file} (${fmt}, ${(data.length / 1024).toFixed(0)} KB)`);
  console.log(`  tamaño=${opts.size}  calidad=${opts.quality}  borderless=${!!opts.borderless}  tipo=${opts.type || '(default)'}\n`);
  const res = await post(ip, port, urlPath, body);
  const { statusCode, attrs } = parseResponse(res.body);
  console.log(`IPP status: ${statusName(statusCode)}  (HTTP ${res.http})`);
  if (attrs['job-id']) console.log(`job-id: ${attrs['job-id'][0]}   estado: ${(attrs['job-state'] || ['?'])[0]}`);
  if (statusCode >= 0x0400) console.log(`\n⚠ La impresora rechazó algo. Revisa el volcado de 'attrs' para usar valores exactos (tipo de papel, borderless permitido en ese tamaño).`);
}

// ---- CLI ----
function parseFlags(argv) {
  const o = { size: 'a4', quality: 'high', copies: 1 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--borderless') o.borderless = true;
    else if (a === '--size') o.size = argv[++i];
    else if (a === '--type') o.type = argv[++i];
    else if (a === '--quality') o.quality = argv[++i];
    else if (a === '--copies') o.copies = parseInt(argv[++i], 10);
    else if (a === '--format') o.format = argv[++i];
    else if (a === '--port') o.port = parseInt(argv[++i], 10);
    else if (a === '--path') o.path = argv[++i];
  }
  return o;
}

async function main() {
  const [cmd, ip, third] = process.argv.slice(2);
  const flags = parseFlags(process.argv.slice(2));
  const port = flags.port || 631;
  const urlPath = flags.path || '/ipp/print';
  if (!cmd || !ip) {
    console.log('Uso:\n  node tools/print-test.js attrs <ip>\n  node tools/print-test.js print <ip> <archivo> [--size a4|a3] [--type K] [--quality high] [--borderless] [--copies n]');
    process.exit(1);
  }
  try {
    if (cmd === 'attrs') await cmdAttrs(ip, port, urlPath);
    else if (cmd === 'print') {
      if (!third) { console.error('Falta el archivo a imprimir.'); process.exit(1); }
      await cmdPrint(ip, port, urlPath, third, flags);
    } else { console.error(`Comando desconocido: ${cmd}`); process.exit(1); }
  } catch (e) {
    console.error(`\nError: ${e.message}`);
    process.exit(1);
  }
}

main();
