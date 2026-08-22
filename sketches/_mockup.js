/* hoks · _mockup.js — el taller de fotografía.
 *
 * Una maqueta no parece una foto por tener el objeto bien dibujado: parece una
 * foto por la LUZ. El contorno lo resuelve cualquiera; lo que convence es que
 * haya una sola fuente, que la sombra caiga donde debe, que la superficie tenga
 * grano y que la imagen impresa se doble con lo que hay debajo. Por eso aquí no
 * hay "formas de objetos": hay campos de luz, superficies y sombras, y cada
 * escena los usa. La coherencia entre escenas sale de compartir la fuente.
 *
 * Tres piezas hacen casi todo el trabajo:
 *
 *   · `warp`      — la obra sobre un plano girado, con perspectiva de verdad
 *                   (proyectiva, no un trapecio interpolado).
 *   · `displace`  — la obra se DESPLAZA con los pliegues, no solo se oscurece.
 *                   Sin esto la impresión es una pegatina, siempre.
 *   · `grade`     — viñeta, grado y grano. Es lo último y es lo que hace que las
 *                   piezas dejen de parecer piezas.
 *
 * Determinista: misma seed, misma foto. Sin dependencias, canvas 2D puro.
 *
 *   <script src="../_mockup.js"></script>      →   window.HOKSMOCK
 */
(function (global) {
  'use strict';

  const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  // Smoothstep de quinto grado: la de tercer grado deja una discontinuidad en la
  // segunda derivada y en un campo de pliegues eso se ve como una rejilla.
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }

  // ── Azar ────────────────────────────────────────────────────────────────────
  // El mismo LCG del motor: la foto de una seed tiene que ser siempre la misma
  // foto, o no se puede volver a ella.
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    const next = () => ((s = (Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296);
    return { next, range: (a, b) => a + next() * (b - a), int: n => Math.floor(next() * n) };
  }

  // ── Campos ──────────────────────────────────────────────────────────────────
  // Un campo es un Float32Array de w×h en 0..1. Todo lo que parece materia sale
  // de aquí: la tela, el papel, el metal rayado.

  // Ruido de valor con octavas. La retícula se interpola con smoothstep, así que
  // no hay aristas; sumar octavas es lo que le da tamaño de grano y de pliegue a
  // la vez.
  function noiseField(w, h, o) {
    o = o || {};
    const oct = o.octaves || 4, per = o.persistence || 0.5;
    const out = new Float32Array(w * h);
    let amp = 1, norm = 0, scale = o.scale || 64;
    for (let k = 0; k < oct; k++) { norm += amp; amp *= per; }
    amp = 1;
    const r = rng((o.seed || 1) >>> 0);
    for (let k = 0; k < oct; k++) {
      // Una tabla de gradientes por octava: barata y suficiente. El hash tiene
      // que depender de la octava o todas saldrían alineadas.
      const gw = Math.max(2, Math.ceil(w / scale) + 2), gh = Math.max(2, Math.ceil(h / scale) + 2);
      const grid = new Float32Array(gw * gh);
      for (let i = 0; i < grid.length; i++) grid[i] = r.next();
      for (let y = 0; y < h; y++) {
        const fy = y / scale, y0 = Math.floor(fy), ty = smooth(fy - y0);
        const r0 = Math.min(y0, gh - 2) * gw, r1 = r0 + gw;
        for (let x = 0; x < w; x++) {
          const fx = x / scale, x0 = Math.min(Math.floor(fx), gw - 2), tx = smooth(fx - Math.floor(fx));
          const a = lerp(grid[r0 + x0], grid[r0 + x0 + 1], tx);
          const b = lerp(grid[r1 + x0], grid[r1 + x0 + 1], tx);
          out[y * w + x] += amp * lerp(a, b, ty);
        }
      }
      amp *= per; scale *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= norm;
    return out;
  }

  // Pliegues: crestas largas en una dirección dominante + ruido suave encima.
  // Una tela no es ruido —tiene surcos con dirección, porque cuelga— y esa
  // dirección es lo que hace que se lea como tejido y no como niebla.
  function foldField(w, h, o) {
    o = o || {};
    const n = noiseField(w, h, { scale: o.scale || Math.max(w, h) / 3.2, octaves: 4, seed: o.seed });
    const fine = noiseField(w, h, { scale: Math.max(w, h) / 26, octaves: 2, seed: (o.seed || 1) + 7717 });
    const r = rng(((o.seed || 1) + 331) >>> 0);
    const ridges = [];
    for (let i = 0; i < (o.folds == null ? 5 : o.folds); i++) {
      const ang = r.range(-0.5, 0.5) + (o.angle == null ? Math.PI / 2 : o.angle);
      ridges.push({ cx: r.range(0, w), cy: r.range(0, h), c: Math.cos(ang), s: Math.sin(ang),
                    wide: r.range(0.06, 0.20) * Math.max(w, h), amp: r.range(0.35, 1) });
    }
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let v = n[i] * 0.62 + fine[i] * 0.12;
        for (const g of ridges) {
          // Distancia con signo a la recta del surco. El perfil es d·e^(−d²/2)
          // —la derivada de la gaussiana—: continua en d = 0 y con cresta a un
          // lado y surco al otro, que es exactamente lo que hace un pliegue.
          // Con un signo partido (una campana positiva a un lado y negativa al
          // otro) había un salto en el eje y la tela salía cruzada por rayas
          // rectas y duras.
          const d = ((x - g.cx) * g.s - (y - g.cy) * g.c) / g.wide;
          v += g.amp * 0.46 * d * Math.exp(-d * d * 0.5);
        }
        out[i] = clamp(v + 0.2, 0, 1);
      }
    }
    return out;
  }

  // Un trozo de campo, como campo. Los pliegues de una prenda son UNOS, y la
  // impresión tiene que doblarse con los que le tocan: generar un campo aparte
  // para el estampado daba una tela con dos telas dentro.
  function sub(field, fw, fh, x, y, w, h) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const out = new Float32Array(w * h);
    for (let j = 0; j < h; j++) {
      const sy = clamp(y + j, 0, fh - 1) * fw;
      for (let i = 0; i < w; i++) out[j * w + i] = field[sy + clamp(x + i, 0, fw - 1)];
    }
    return out;
  }

  // ── La obra sobre un plano ──────────────────────────────────────────────────
  // Canvas 2D solo sabe transformar AFÍN, así que un plano girado se pinta en
  // tiras. Lo que no puede ser afín es la coordenada de textura: si se interpola
  // linealmente, la imagen no se comprime hacia el lado lejano y el resultado se
  // lee como un trapecio pintado, no como un plano girado. La corrección es la
  // de siempre —interpolar en 1/z, y aquí 1/z es proporcional al alto proyectado
  // del borde— y es la diferencia entre una maqueta y un dibujo.
  //
  //   quad: [x0,y0, x1,y1, x2,y2, x3,y3] en orden TL, TR, BR, BL.
  //
  // Se resuelve el caso "plano girado sobre un eje": bordes izquierdo y derecho
  // verticales-ish, que es el de una pared, una funda apoyada o un pliego sobre
  // una mesa. `axis:'y'` gira sobre el horizontal (un plano visto desde arriba).
  function warp(dst, src, quad, o) {
    const ctx = dst.getContext ? dst.getContext('2d') : dst;
    warpColumns(ctx, src, quad, o || {});
  }

  function warpColumns(ctx, src, q, o) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = q;
    const hL = Math.hypot(x3 - x0, y3 - y0), hR = Math.hypot(x2 - x1, y2 - y1);
    const xa = Math.min(x0, x3), xb = Math.max(x1, x2);
    const cols = Math.max(2, Math.round(xb - xa));
    const sw = src.width, sh = src.height;
    ctx.save();
    // El canto lo pone el clip, no las tiras: sin esto cada columna redondea su
    // alto por su cuenta y el borde sale en escalera.
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
    ctx.closePath(); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for (let i = 0; i < cols; i++) {
      const s0 = i / cols, s1 = (i + 1) / cols;
      // Perspectiva correcta: u = s·hR / ((1−s)·hL + s·hR).
      const u0 = (s0 * hR) / ((1 - s0) * hL + s0 * hR);
      const u1 = (s1 * hR) / ((1 - s1) * hL + s1 * hR);
      const sx = u0 * sw, sWid = Math.max(0.35, (u1 - u0) * sw);
      const dxa = lerp(x0, x1, s0), dxb = lerp(x0, x1, s1);
      const top = lerp(y0, y1, s0), bot = lerp(y3, y2, s0);
      // Solape de medio píxel: sin él se ven costuras claras entre tiras.
      ctx.drawImage(src, sx, 0, sWid, sh, dxa, top, (dxb - dxa) + 0.7, bot - top);
    }
    ctx.restore();
  }

  // ── Desplazamiento ──────────────────────────────────────────────────────────
  // La obra impresa sobre tela se dobla con la tela. Se lee el gradiente del
  // campo y se muestrea la obra desplazada por él: es un desplazamiento de
  // verdad, no un desenfoque que lo imite. Sin esto la impresión es una pegatina
  // —y se nota justo en los bordes rectos, que son los que delatan.
  function displace(src, field, fw, fh, o) {
    o = o || {};
    const amt = o.amount == null ? 6 : o.amount;
    const w = src.width, h = src.height;
    const sctx = src.getContext('2d');
    const sd = sctx.getImageData(0, 0, w, h);
    const out = makeCanvas(w, h), octx = out.getContext('2d');
    const od = octx.createImageData(w, h);
    const S = sd.data, D = od.data;
    for (let y = 0; y < h; y++) {
      const fy = Math.min(fh - 2, (y / h * fh) | 0);
      for (let x = 0; x < w; x++) {
        const fx = Math.min(fw - 2, (x / w * fw) | 0);
        const i = fy * fw + fx;
        const gx = field[i + 1] - field[i], gy = field[i + fw] - field[i];
        let sx = (x + gx * amt * fw / w * 8) | 0, sy = (y + gy * amt * fh / h * 8) | 0;
        sx = clamp(sx, 0, w - 1); sy = clamp(sy, 0, h - 1);
        const a = (y * w + x) * 4, b = (sy * w + sx) * 4;
        D[a] = S[b]; D[a + 1] = S[b + 1]; D[a + 2] = S[b + 2]; D[a + 3] = S[b + 3];
      }
    }
    octx.putImageData(od, 0, 0);
    return out;
  }

  // ── Luz sobre una superficie ────────────────────────────────────────────────
  // El campo se convierte en una máscara de dos signos —negro donde el surco se
  // hunde, blanco donde la cresta recibe la luz— y se compone RECORTADA a lo ya
  // pintado (`source-atop`), así que no mancha el fondo. Se mezcla en normal, no
  // en overlay: overlay apaga los colores saturados y las paletas de hoks lo son.
  function shade(target, field, fw, fh, o) {
    o = o || {};
    const w = target.width, h = target.height;
    const g = makeCanvas(fw, fh), gc = g.getContext('2d');
    const img = gc.createImageData(fw, fh), P = img.data;
    const gain = o.gain == null ? 1 : o.gain, bias = o.bias == null ? 0.5 : o.bias;
    for (let i = 0; i < field.length; i++) {
      const v = clamp((field[i] - bias) * gain, -1, 1);
      const j = i * 4;
      if (v < 0) { P[j] = P[j + 1] = P[j + 2] = 0; P[j + 3] = (-v * 255 * (o.dark == null ? 0.55 : o.dark)) | 0; }
      else       { P[j] = P[j + 1] = P[j + 2] = 255; P[j + 3] = (v * 255 * (o.light == null ? 0.30 : o.light)) | 0; }
    }
    gc.putImageData(img, 0, 0);
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.filter = o.blur ? `blur(${o.blur}px)` : 'none';
    ctx.drawImage(g, 0, 0, w, h);
    ctx.restore();
  }

  // ── Sombras ─────────────────────────────────────────────────────────────────
  // Una sombra de maqueta son DOS: el contacto —corto, oscuro, pegado al canto—
  // y la proyectada —larga, difusa, en la dirección de la luz—. Con una sola el
  // objeto flota o parece pegado, nunca apoyado.
  function shadow(ctx, draw, o) {
    o = o || {};
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.shadowColor = o.color || 'rgba(24,20,14,0.55)';
    ctx.shadowBlur = o.blur == null ? 30 : o.blur;
    ctx.shadowOffsetX = o.dx || 0;
    ctx.shadowOffsetY = o.dy == null ? 12 : o.dy;
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    draw(ctx);
    ctx.restore();
  }

  // ── Acabado ─────────────────────────────────────────────────────────────────
  // Viñeta, temperatura y grano, en ese orden y sobre TODO el cuadro. Es lo que
  // hace que las piezas dejen de leerse como piezas: una cámara mete el mismo
  // defecto en todo lo que entra por el objetivo, y ese defecto compartido es la
  // señal de que hay una sola foto.
  function grade(canvas, o) {
    o = o || {};
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const R = Math.hypot(W, H) / 2;
    if (o.light !== false) {
      // Caída de luz: no es una viñeta centrada, es una fuente que está en algún
      // sitio. Una viñeta simétrica es el truco que se ve; esto no.
      const lx = o.lx == null ? 0.3 : o.lx, ly = o.ly == null ? 0.12 : o.ly;
      const gl = ctx.createRadialGradient(W * lx, H * ly, R * 0.05, W * lx, H * ly, R * 1.5);
      gl.addColorStop(0, 'rgba(255,252,244,0.16)');
      gl.addColorStop(0.45, 'rgba(255,250,240,0.02)');
      gl.addColorStop(1, 'rgba(18,16,12,0.20)');
      ctx.save(); ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    if (o.warm !== false) {
      ctx.save(); ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = o.tint || 'rgba(255,236,204,0.20)';
      ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    if (o.grain !== false) grain(ctx, W, H, o.grainAmount == null ? 9 : o.grainAmount, o.seed || 1);
  }

  // Grano fotográfico: ruido monocromo en soft-light. Es el mismo gesto que
  // `bakeGrain` del motor y por el mismo motivo — un plano perfectamente liso no
  // existe en una foto.
  function grain(ctx, W, H, amount, seed) {
    const s = Math.max(2, Math.min(1400, Math.round(Math.max(W, H) / 2)));
    const g = makeCanvas(s, s), gc = g.getContext('2d');
    const img = gc.createImageData(s, s), P = img.data;
    const r = rng(seed >>> 0);
    for (let i = 0; i < s * s; i++) {
      const v = 128 + (r.next() - 0.5) * amount * 6;
      const j = i * 4;
      P[j] = P[j + 1] = P[j + 2] = v; P[j + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.55;
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) ctx.drawImage(g, x, y);
    ctx.restore();
  }

  // Trama de tejido: dos rejillas de líneas finas cruzadas, en overlay y muy
  // bajas. No se ve; se nota. Es lo que separa "tela" de "papel de color".
  function weave(ctx, x, y, w, h, o) {
    o = o || {};
    const step = o.step || 3, a = o.alpha == null ? 0.05 : o.alpha;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.globalCompositeOperation = 'overlay';
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = x; i < x + w; i += step) { ctx.moveTo(i, y); ctx.lineTo(i, y + h); }
    ctx.stroke();
    ctx.strokeStyle = `rgba(0,0,0,${a * 0.9})`;
    ctx.beginPath();
    for (let j = y; j < y + h; j += step) { ctx.moveTo(x, j); ctx.lineTo(x + w, j); }
    ctx.stroke();
    ctx.restore();
  }

  global.HOKSMOCK = { rng, noiseField, foldField, sub, warp, displace, shade, shadow,
                      grade, grain, weave, makeCanvas, clamp, lerp, smooth };
})(typeof window !== 'undefined' ? window : globalThis);
