// static-gen.js — la cabecera y el bloque estáticos de una página de familia.
//
// POR QUÉ EXISTE. Los fetchers de agente no ejecutan JavaScript: piden el
// documento y leen lo que llega. Todo lo que tiene que leer una máquina va, por
// tanto, escrito en el HTML — no inyectado por nav.js ni traído por fetch.
// Pero la narrativa vive en data/works.json, que es su fuente única, así que el
// HTML pasa a ser un ARTEFACTO DERIVADO: nadie lo edita a mano. Lo escribe el
// panel al guardar una familia, entre los marcadores de abajo.
//
// POR QUÉ COMPARTIDO. admin.html es un panel autónomo y no carga scripts del
// sitio; esta es la excepción, y tiene motivo: si el panel generase por un lado
// y las herramientas por otro, dos implementaciones darían dos HTML y la deriva
// no se vería hasta que alguien leyese el archivo publicado. El generador es
// uno. Vale en navegador (window.HOKSGEN) y en node (module.exports).
(function (root) {
  'use strict';

  const BASE = 'https://joxemari.github.io/hoks/';
  const LANGS = ['en', 'es', 'eu'];   // en primero: nav.js abre en inglés

  const PERSON = {
    '@type': 'Person',
    name: 'Joxemari Gallastegi',
    alternateName: 'hoks',
    jobTitle: 'Generative artist',
    url: BASE + 'about.html',
  };

  // Las tres páginas fijas y los ensayos publicados. Los ensayos se sacan del
  // campo `makingof` de cada familia, así que no hay lista que mantener aparte.
  const FIXED = ['', 'about.html', 'palettes.html'];

  const MARK = {
    headA: '<!-- HOKS:AUTO-HEAD -->',
    headB: '<!-- /HOKS:AUTO-HEAD -->',
    bodyA: '<!-- HOKS:AUTO-BODY -->',
    bodyB: '<!-- /HOKS:AUTO-BODY -->',
  };

  // ── utilidades ────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  // Un texto de varias líneas dentro de un atributo: se aplana, porque un salto
  // de línea en un content="" es un salto de línea de verdad.
  function attr(s, max) {
    let v = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    if (max && v.length > max) {
      v = v.slice(0, max);
      const cut = v.lastIndexOf(' ');
      v = (cut > max * 0.6 ? v.slice(0, cut) : v).replace(/[,;:—–-]$/, '') + '…';
    }
    return esc(v);
  }
  // `description` y `cartela` son o una cadena (familias viejas) o {eu,es,en}.
  function pick(v, lang) {
    if (!v) return '';
    if (typeof v === 'string') return lang === 'en' ? v : '';
    return v[lang] || '';
  }
  function href(w) { return w.page || ('work.html?w=' + encodeURIComponent(w.slug)); }
  function isShell(w) { return !!w.page && /^[a-z0-9-]+\.html$/.test(w.page); }
  function name(w) { return w.name || String(w.slug || '').toUpperCase(); }

  // ── cabecera ──────────────────────────────────────────────────────────────
  function head(w) {
    const url = BASE + href(w);
    const nm = name(w);
    const desc = pick(w.description, 'en') || (nm + ' — a hoks family.');
    const L = [];
    L.push(MARK.headA);
    L.push('<!-- Generado desde data/works.json por static-gen.js. NO editar a mano:');
    L.push('     lo reescribe el panel al guardar la familia. Va estático porque los');
    L.push('     fetchers de agente no ejecutan JS. Ver CLAUDE.md § Buscadores y agentes. -->');

    // Una familia apagada no está publicada: no se indexa. Al encenderla en el
    // panel esta línea desaparece sola y su URL entra en el sitemap.
    if (!w.active) {
      L.push('<meta name="robots" content="noindex">');
    }
    L.push('<meta name="description" content="' + attr(desc, 200) + '">');
    L.push('<link rel="canonical" href="' + esc(url) + '">');
    L.push('<meta property="og:title" content="' + esc(nm) + ' — hoks">');
    L.push('<meta property="og:description" content="' + attr(desc, 200) + '">');
    L.push('<meta property="og:image" content="' + esc(ogImage(w)) + '">');
    L.push('<meta property="og:image:width" content="1200">');
    L.push('<meta property="og:image:height" content="630">');
    L.push('<meta property="og:image:alt" content="' + attr(imageAlt(w), 200) + '">');
    L.push('<meta property="og:url" content="' + esc(url) + '">');
    L.push('<meta property="og:type" content="website">');
    L.push('<meta name="twitter:card" content="summary_large_image">');
    L.push('<meta name="twitter:title" content="' + esc(nm) + ' — hoks">');
    L.push('<meta name="twitter:description" content="' + attr(desc, 200) + '">');
    L.push('<meta name="twitter:image" content="' + esc(ogImage(w)) + '">');

    // Una familia es una SERIE, no un cuadro: CreativeWorkSeries, no
    // VisualArtwork. Lo que se expone es la regla; las piezas son lo que deja.
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWorkSeries',
      name: nm,
      url: url,
      description: String(desc).replace(/\s+/g, ' ').trim(),
      creator: PERSON,
      genre: 'Generative art',
      inLanguage: ['eu', 'es', 'en'],
      isPartOf: { '@type': 'WebSite', name: 'hoks', url: BASE },
    };
    if (w.ogImage) ld.image = ogImage(w);
    if (w.year) ld.dateCreated = String(w.year);
    if (w.makingof) {
      ld.subjectOf = { '@type': 'Article', name: 'Making of ' + nm, url: BASE + w.makingof };
    }
    L.push('<script type="application/ld+json">');
    L.push(JSON.stringify(ld, null, 2));
    L.push('<\/script>');

    // El bloque estático solo lo ve quien no ejecuta JS (work-page.js lo
    // retira al arrancar). Su CSS va en un archivo: un navegador sin JS sí
    // pide la hoja de estilos, y a un agente le da igual.
    L.push('<link rel="stylesheet" href="assets/static.css">');
    L.push(MARK.headB);
    return L.join('\n');
  }

  // ── imagen ────────────────────────────────────────────────────────────────
  // Una por familia, en assets/og/. La obra es <canvas>: sin este archivo no
  // existe para un agente ni para un lector de pantalla. Si la familia aún no
  // tiene la suya, cae al preview general — mejor eso que un 404 en og:image.
  // El recurso general es preview.jpg, no el PNG: WhatsApp y X no enseñan la
  // miniatura si la imagen pesa como pesaba el PNG (1,2 MB). Una familia con su
  // propia tarjeta no lo necesita; las demás caen aquí, que es mejor que un 404.
  function ogImage(w) {
    return BASE + (w.ogImage ? 'assets/og/' + w.slug + '.jpg' : 'preview.jpg?v=3');
  }
  // El alt describe la IMAGEN, no repite la regla entera: la primera frase de
  // la descripción es la que dice qué se está viendo. Un alt de 300 caracteres
  // truncado a media palabra no es accesibilidad, es relleno.
  function firstSentence(s) {
    const v = String(s || '').replace(/\s+/g, ' ').trim();
    const m = v.match(/^(.{20,150}?)(?:[.;]|\s—\s)/);
    return (m ? m[1] : v.slice(0, 150)).trim();
  }
  function imageAlt(w) {
    const nm = name(w);
    if (!w.ogImage) return 'hoks — generative art by Joxemari Gallastegi.';
    const s = firstSentence(pick(w.description, 'en'));
    return 'A piece from the ' + nm + ' family' + (s ? ': ' + s + '.' : '.');
  }

  // ── bloque estático ───────────────────────────────────────────────────────
  // Lo que un lector sin JS —agente o navegador con el JS apagado— ve de esta
  // familia. work-page.js lo quita en cuanto arranca, así que nadie lo ve dos
  // veces. Va en los tres idiomas: el statement existe en euskara, castellano e
  // inglés, y aquí caben los tres sin pelearse por una URL.
  function body(w, works) {
    const nm = name(w);
    const L = [];
    L.push(MARK.bodyA);
    L.push('<!-- Generado desde data/works.json por static-gen.js. NO editar a mano.');
    L.push('     Lo que se lee sin JavaScript. work-page.js lo retira al arrancar. -->');
    L.push('<div id="hoks-static">');
    L.push('  <div class="s-eye">hoks — hand coded goods</div>');
    L.push('  <h1>' + esc(nm) + '</h1>');

    const meta = [];
    if (w.year) meta.push(String(w.year));
    if (w.canvas) meta.push(String(w.canvas));
    meta.push('Joxemari Gallastegi');
    L.push('  <p class="s-meta">' + esc(meta.join(' · ')) + '</p>');

    if (w.ogImage) {
      L.push('  <img src="assets/og/' + esc(w.slug) + '.jpg" width="1200" height="630"' +
             ' alt="' + attr(imageAlt(w), 300) + '">');
    }

    LANGS.forEach(function (lang) {
      const txt = pick(w.description, lang);
      if (txt) L.push('  <p lang="' + lang + '">' + esc(txt) + '</p>');
    });

    // La cartela: la frase que iría en la pared, si la familia la tiene.
    const cartEn = pick(w.cartela, 'en') || pick(w.cartela, 'eu');
    if (cartEn) L.push('  <blockquote>' + esc(cartEn) + '</blockquote>');

    if (w.makingof) {
      L.push('  <p><a href="' + esc(w.makingof) + '">Making of ' + esc(nm) + ' — the illustrated essay</a></p>');
    }

    // nav.js construye el nav entero, así que sin JS esta página no tenía NI UN
    // ENLACE: ni a las otras familias ni a About. Un lector que no ejecuta JS
    // llegaba a un callejón sin salida, y un rastreador también.
    const others = (works || []).filter(function (o) {
      return o.active && o.slug !== w.slug;
    });
    L.push('  <nav>');
    L.push('    <a href="index.html">hoks</a>');
    others.forEach(function (o) {
      L.push('    <a href="' + esc(href(o)) + '">' + esc(name(o)) + '</a>');
    });
    L.push('    <a href="about.html">About</a>');
    L.push('    <a href="palettes.html">Palettes</a>');
    L.push('  </nav>');
    return closeBlock(L);
  }

  // Un cierre común para los cuatro bloques: el div, y pegado a él el script
  // que lo retira. Va DENTRO del bloque generado porque así corre en el momento
  // en que el parser acaba de leer el div: no hay parpadeo, no depende de nav.js
  // —un script no puede retirar un elemento que aún no se ha parseado— y vale
  // también en la landing, que es autónoma y no lo carga. Si el JS no llega, el
  // bloque se queda: eso es el respaldo, no un fallo.
  function closeBlock(L) {
    L.push('</div>');
    L.push('<script>(function(){var e=document.getElementById(\'hoks-static\');'
           + 'if(e)e.parentNode.removeChild(e);})();<\/script>');
    L.push(MARK.bodyB);
    return L.join('\n');
  }

  // ── las páginas fijas ─────────────────────────────────────────────────────
  // Su CABECERA se queda a mano: es editorial y no se deriva de ningún JSON.
  // Lo que sí se genera es el bloque de contenido, porque eso sale de
  // works.json / site.json / palettes.json y a mano se desincroniza.
  //
  // La landing era el peor caso del sitio: la página a la que apunta todo, y
  // para un lector sin JS, dieciséis palabras y ni un h1. Lo pinta todo el JS.
  function homeBody(works) {
    const L = [];
    L.push(MARK.bodyA);
    L.push('<!-- Generado desde data/works.json por static-gen.js. NO editar a mano.');
    L.push('     Lo que se lee sin JavaScript: la landing lo pinta todo con JS, así que');
    L.push('     sin esto no había ni un título ni la lista de familias. -->');
    L.push('<div id="hoks-static">');
    L.push('  <div class="s-eye">hoks — hand coded goods</div>');
    L.push('  <h1>hoks</h1>');
    L.push('  <p>Generative art by Joxemari Gallastegi. Each family is a rule, not a');
    L.push('     picture: an algorithm, a seed, a deterministic RNG and a palette chosen');
    L.push('     by weight. What you see is the residue of a system at work.</p>');
    L.push('  <p class="s-meta">Every piece exists square, vertical and horizontal — not a');
    L.push('     crop: the algorithm is given other dimensions and recomposes. Same seed,');
    L.push('     same image, at any size.</p>');
    L.push('  <h2>Families</h2>');
    L.push('  <ul>');
    (works || []).filter(function (w) { return w.active; }).forEach(function (w) {
      const d = firstSentence(pick(w.description, 'en'));
      L.push('    <li><a href="' + esc(href(w)) + '">' + esc(name(w)) + '</a>' +
             (w.year ? ' <span class="s-meta">' + esc(w.year) + '</span>' : '') +
             (d ? ' — ' + esc(d) + '.' : '') + '</li>');
    });
    L.push('  </ul>');
    L.push('  <nav>');
    L.push('    <a href="about.html">About</a>');
    L.push('    <a href="palettes.html">Palettes</a>');
    (works || []).forEach(function (w) {
      if (w.active && w.makingof) L.push('    <a href="' + esc(w.makingof) + '">Making of ' + esc(name(w)) + '</a>');
    });
    L.push('  </nav>');
    return closeBlock(L);
  }

  // El statement, que es el texto que de verdad dice quién firma esto, vivía
  // solo en site.json y lo pintaba el JS: siete palabras para un agente.
  // Va en los tres idiomas. El correo NO: la web se lo enseña a un humano en
  // el footer, y ponerlo en el HTML crudo es regalárselo a los cosechadores.
  function aboutBody(site) {
    const L = [];
    L.push(MARK.bodyA);
    L.push('<!-- Generado desde data/site.json por static-gen.js. NO editar a mano. -->');
    L.push('<div id="hoks-static">');
    L.push('  <div class="s-eye">hoks — about</div>');
    L.push('  <h1>Joxemari Gallastegi</h1>');
    L.push('  <p class="s-meta">hoks — hand coded goods · Donostia / San Francisco</p>');
    const txt = (site && site.aboutText) || {};
    LANGS.forEach(function (lang) {
      const v = typeof txt === 'string' ? (lang === 'en' ? txt : '') : (txt[lang] || '');
      if (!v) return;
      String(v).split(/\n\s*\n/).forEach(function (par) {
        const p = par.replace(/\s+/g, ' ').trim();
        if (p) L.push('  <p lang="' + lang + '">' + esc(p) + '</p>');
      });
    });
    L.push('  <nav>');
    L.push('    <a href="index.html">hoks</a>');
    L.push('    <a href="palettes.html">Palettes</a>');
    L.push('  </nav>');
    return closeBlock(L);
  }

  // Las paletas son dato, y un dato se lee bien en texto: nombre y colores.
  // Las retiradas se cuentan pero no se listan — dejaron de estar en juego.
  function palettesBody(palettes) {
    const list = (palettes || []).filter(function (p) { return p.active; });
    const off = (palettes || []).length - list.length;
    const L = [];
    L.push(MARK.bodyA);
    L.push('<!-- Generado desde data/palettes.json por static-gen.js. NO editar a mano. -->');
    L.push('<div id="hoks-static">');
    // Sin <h1>: esta página ya trae el suyo escrito en el HTML, y dos h1 con el
    // mismo texto es lo que se ve cuando nadie ha mirado el documento crudo.
    L.push('  <div class="s-eye">hoks — palettes</div>');
    L.push('  <p>The colour catalogue behind every piece. A palette is chosen by weight at');
    L.push('     draw time — recent ones are likelier — so the colour of a piece is part of');
    L.push('     the throw, not a setting. ' + list.length + ' in play, ' + off + ' retired.</p>');
    L.push('  <ul>');
    list.forEach(function (p) {
      L.push('    <li>' + esc(p.name || ('#' + p.id)) + ' — ' +
             esc((p.colors || []).join(' ')) + '</li>');
    });
    L.push('  </ul>');
    L.push('  <nav>');
    L.push('    <a href="index.html">hoks</a>');
    L.push('    <a href="about.html">About</a>');
    L.push('  </nav>');
    return closeBlock(L);
  }

  // ── aplicar a un cascarón ─────────────────────────────────────────────────
  // Solo se toca lo que hay entre marcadores. Sin marcadores no se inventa
  // nada: se avisa, porque un cascarón sin ellos es un cascarón que alguien
  // escribió a mano y hay que mirar.
  function splice(html, a, b, block) {
    const i = html.indexOf(a), j = html.indexOf(b);
    if (i < 0 || j < 0 || j < i) throw new Error('marcador ausente: ' + a);
    return html.slice(0, i) + block + html.slice(j + b.length);
  }
  function apply(html, w, works) {
    return splice(splice(html, MARK.headA, MARK.headB, head(w)),
                  MARK.bodyA, MARK.bodyB, body(w, works));
  }
  function applyBody(html, block) {
    return splice(html, MARK.bodyA, MARK.bodyB, block);
  }

  // ── sitemap ───────────────────────────────────────────────────────────────
  // Sin <lastmod> a propósito: la única fecha que el panel conoce es "hoy", y
  // ponerla en cada URL cada vez que se guarda una familia es justo el lastmod
  // que los buscadores aprenden a ignorar. Mejor no decir nada que mentir.
  function sitemap(works) {
    const urls = FIXED.slice();
    (works || []).forEach(function (w) { if (w.active) urls.push(href(w)); });
    (works || []).forEach(function (w) { if (w.active && w.makingof) urls.push(w.makingof); });

    const L = ['<?xml version="1.0" encoding="UTF-8"?>'];
    L.push('<!-- Generado desde data/works.json por static-gen.js. NO editar a mano:');
    L.push('     lo reescribe el panel al guardar. Solo obra publicada — las familias');
    L.push('     `active`, sus ensayos y las tres páginas fijas. Hace falta porque');
    L.push('     making.html?w=… no se descubre sola: nadie enlaza a una query desde');
    L.push('     HTML. Ver CLAUDE.md § Buscadores y agentes. -->');
    L.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    urls.forEach(function (u) {
      L.push('  <url><loc>' + esc(BASE + u) + '</loc></url>');
    });
    L.push('</urlset>');
    return L.join('\n') + '\n';
  }

  // ── llms.txt ──────────────────────────────────────────────────────────────
  // La prosa se escribe a mano: qué es una familia, un seed, un pliego. Lo que
  // se genera es la lista, que es lo que se desincroniza al activar una familia.
  const LLMS = { a: '[//]: # (HOKS:AUTO-LIST)', b: '[//]: # (/HOKS:AUTO-LIST)' };
  function llmsList(works) {
    const act = (works || []).filter(function (w) { return w.active; });
    const L = [LLMS.a, ''];
    L.push('## Works');
    L.push('');
    act.forEach(function (w) {
      const d = firstSentence(pick(w.description, 'en'));
      L.push('- [' + name(w) + '](' + BASE + href(w) + ')' +
             (w.year ? ' (' + w.year + ')' : '') + (d ? ': ' + d + '.' : ''));
    });
    const essays = act.filter(function (w) { return w.makingof; });
    if (essays.length) {
      L.push('');
      L.push('## Essays');
      L.push('');
      L.push('Written from the real code — every figure is rendered by the algorithm it');
      L.push('describes, not drawn for the occasion.');
      L.push('');
      essays.forEach(function (w) {
        L.push('- [Making of ' + name(w) + '](' + BASE + w.makingof + ')');
      });
    }
    L.push('');
    L.push(LLMS.b);
    return L.join('\n');
  }
  function applyLlms(text, works) {
    return splice(text, LLMS.a, LLMS.b, llmsList(works));
  }

  const API = { head: head, body: body, apply: apply, applyBody: applyBody,
                homeBody: homeBody, aboutBody: aboutBody, palettesBody: palettesBody,
                sitemap: sitemap, applyLlms: applyLlms, LLMS: LLMS,
                isShell: isShell, href: href, MARK: MARK, BASE: BASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.HOKSGEN = API;
})(typeof window !== 'undefined' ? window : globalThis);
