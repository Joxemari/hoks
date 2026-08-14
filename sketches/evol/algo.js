/* EVOL — hutsunea. La evolución de TRZS por la técnica: misma cinta, otra ley
 * en el encuentro.
 *
 * TRZS es EL CRUCE. Dos hebras se encuentran y PASAN: una por encima, otra por
 * debajo, y el suelo aparece entre ellas como una INCISIÓN — una línea, un corte
 * que las mantiene separadas. La profundidad se decide cruce a cruce.
 *
 * EVOL es LA SOLDADURA. Dos cuerpos se encuentran y se FUNDEN: no hay encima ni
 * debajo, no hay incisión, no hay diagrama de nudo. Un solo cuerpo. Y el suelo,
 * que en TRZS pasaba ENTRE, aquí queda ATRAPADO: sobrevive solo donde la masa se
 * cierra a su alrededor. Deja de ser una línea y se vuelve una isla con borde.
 * Eso es un OJO, y los ojos son la obra: el vacío no es lo que sobra, es lo que
 * la masa está ahí para definir.
 *
 * La gramática, en cinco reglas:
 *   1. ESTRATOS. La masa no divaga por el cuadro: recorre bandas casi
 *      horizontales que lo cruzan. Cada estrato ENTRA por un borde — la obra es
 *      el corte de algo más grande, no una figura centrada en su hoja.
 *   2. CUERPO. La anchura no es constante (ahí se separa de TRZS, donde el
 *      grosor ES el material). Va por NIVELES discretos y salta de uno a otro en
 *      los vértices: la masa engorda y adelgaza a escalones, no en rampa. De ahí
 *      el contorno facetado, y de ahí que en una misma pieza convivan el pelo y
 *      el bloque.
 *   3. SOLDADURA. Dos estratos vecinos se unen por puentes. Un puente no tapa
 *      nada: suma. Y DOS puentes entre los mismos estratos encierran el suelo
 *      que quedaba en medio — el ojo no se dibuja, se deja.
 *   4. MUÑONES. Ramas cortas que salen y mueren a corte vivo. No cierran nada:
 *      rompen la silueta. Un cuerpo sin muñones se lee como un tubo.
 *   5. GRAVEDAD. El peso es asimétrico y hay una RESERVA: una esquina por la que
 *      no pasa nada, y por la que se lee todo lo demás.
 *
 * Y una regla de método, heredada de TRZS: el tipo DECLARA cuántos ojos y cuánta
 * mancha quiere, y luego se COMPRUEBA sobre el resultado (campo de distancias +
 * inundación desde el borde). Declarar sin comprobar es lo que ya falló con las
 * familias de TRZS. Aquí el ojo declarado y el ojo medido no son el mismo: la
 * masa engorda y se come sus propios huecos, así que lo que cuenta es el medido.
 *
 * Lo que se ABANDONA de TRZS, y es la mitad de su código: el diagrama de nudo,
 * el plan de secciones, el orden de pintado, el punzón y los detectores del halo.
 * Sin encima/debajo no hay nada que proteger, así que el cuerpo puede cruzarse
 * consigo mismo cuantas veces quiera: se rellena. Toda la complejidad que TRZS
 * gasta en la profundidad, EVOL la gasta en el contorno y en el vacío.
 *
 * Ni proporción ni resolución se dan por hechas: todo se mide contra W, H o
 * min(W,H), así que la misma seed es la misma composición en cuadrado y en
 * horizontal, en pantalla y a 300 dpi.
 *
 * Canvas 2D puro. Depende de window.HOKS (_engine.js).
 *
 *   HOKS.EVOL.render(ctx, W, H, seed, opts) → { pal, tipo, ojos, mancha, … }
 *   HOKS.EVOL.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;          // lado corto de referencia: calibra grano y px
  // El suelo es PLANO, siempre. No es pereza: figura/fondo necesita un plano
  // estable. Es la misma razón por la que DTKRT rompió con las "G" — un degradado
  // detrás de una masa negra convierte el vacío en atmósfera, y aquí el vacío
  // tiene que ser papel. El laboratorio puede forzar el degradado para mirarlo;
  // por defecto no existe.
  const BG_GRADIENT = 0;

  // ── El cuerpo ───────────────────────────────────────────────────────────────
  // Niveles DISCRETOS de anchura, geométricos entre el pelo y el bloque. Que sean
  // niveles y no un continuo es la decisión: la masa cambia de grosor a saltos,
  // como una plancha cortada, no como un pincel que se levanta.
  //
  // El recorrido es enorme a propósito — ×27 entre el nivel 0 y el 6 — porque el
  // rango CONVIVE dentro de una misma pieza: el pelo y el bloque son la misma
  // masa a dos vértices de distancia. Con un rango estrecho (la primera versión
  // iba de 0,0075 a 0,088) cada cuerpo salía de grosor casi constante y la obra
  // se leía como tres bandas de paisaje.
  const NIVELES = 7;
  const W_MIN = 0.012, W_MAX = 0.150;   // × lado corto
  // El grosor va por RACHAS, no por vértice. Una racha mantiene el nivel 1..3
  // vértices y luego SALTA, y el salto es de dos clases: vecino (±1, ±2) o
  // REVUELTA — un nivel cualquiera de la escala. La revuelta es el gesto que hace
  // la familia: de hilo a bloque de golpe, sin rampa. Sin ella el paseo del nivel
  // se queda en la mitad de la escala y no vuelve a salir.
  const P_REVUELTA = 0.34;
  const RACHA_W = [1, 1, 2, 2, 3];
  // Pero la escala entera NO se recorre dentro de un cuerpo: cada estrato se mueve
  // en una VENTANA de tres niveles y la escala completa se reparte ENTRE estratos.
  // Dejando que un cuerpo saltara del 0 al 6 en un vértice (×15 de golpe) la masa
  // dejaba de leerse como un cuerpo modulado y salían trozos poligonales soldados:
  // en la referencia una masa varía tres o cuatro veces de la parte más fina a la
  // más gorda, y el ×27 está entre la masa de arriba y las de abajo.
  const VENTANA = 2;         // ancho de la ventana de niveles de un cuerpo, en niveles
  // El ESTRANGULAMIENTO es la excepción medida: un solo vértice muy por debajo de
  // la ventana. Es el cuello de la referencia —donde la masa casi se corta y sigue—
  // y funciona porque es uno, no porque sea frecuente.
  const P_ESTRANGULA = 0.5, ESTRANGULA = 3;
  // ── EL FILO ─────────────────────────────────────────────────────────────────
  // Hasta aquí el borde era un polígono exacto, y eso es lo que delataba el dibujo
  // como vectorial: la FORMA estaba bien, pero la MARCA no existía. Una masa de
  // tinta sobre papel no tiene el canto recto — lo tiene vivo, porque el pelo del
  // pincel y el diente del papel se pelean por el último milímetro.
  //
  // Así que el borde se subdivide y se desplaza con un ruido COHERENTE a lo largo
  // del recorrido. Coherente es la palabra: con ruido por punto sale un serrucho,
  // que es suciedad, no pincel. Tres octavas —la ondulación de la mano, el temblor
  // del pelo y el diente del papel— y cada borde con su propia semilla, porque un
  // canto de pincel no es simétrico respecto a su eje.
  //
  // Lo que NO toca: la anatomía. 'medir' trabaja sobre el eje y la media anchura,
  // no sobre el contorno dibujado, así que el filo no mueve ni un ojo ni un punto
  // de mancha. Cambia la piel, no el esqueleto — y por tanto tampoco la rareza.
  // Las frecuencias son ALTAS y la amplitud pequeña, y ése es el ajuste que costó.
  // El primer intento llevaba una octava lenta y gorda —«la ondulación de la mano»—
  // y estaba mal planteado: la ondulación de la mano YA ESTÁ en la geometría, son los
  // vértices. Poniéndola otra vez en el filo, la masa engordaba y adelgazaba a lo
  // largo del recorrido, o sea que el filo invadía la FORMA, que es exactamente lo
  // que no debe tocar. Y de paso se comía las esquinas de cincel, que son lo mejor
  // del dibujo. Al filo le toca el pelo y el diente del papel: nada por encima de
  // 17 px de onda en una hoja de 760.
  //
  // El paso baja a 0,0015 porque el muestreo manda: un subtramo de 0,006 no puede
  // dibujar una onda de 0,006 —hacen falta cuatro muestras por onda como poco—, así
  // que la octava fina se habría convertido en un alias, que se ve como un moaré.
  const PASO_FILO = 0.0015;  // longitud de subtramo, en lado corto
  const OCT = [
    { f: 45,  a: 0.50 },     // 17 px de onda en una hoja de 760
    { f: 95,  a: 0.32 },     // el pelo
    { f: 160, a: 0.18 },     // el diente del papel
  ];
  // Cuánto puede comerse el ruido de la anchura local. Sin tope, en un nivel 0
  // —media anchura 0,006— una amplitud de 0,0045 se lleva el cuerpo por delante y
  // el borde cruza el eje: el cuadrilátero se da la vuelta y aparece un agujero.
  const FILO_TOPE = 0.45;
  // La MORDIDA es el salto en seco: el pincel se queda sin carga y el papel se ve.
  // Va siempre hacia dentro —una mordida que sale es un pegote, no un salto— y es
  // rara por definición: si pasa a menudo deja de ser un accidente y es una textura.
  const MORD_F = 34;         // celdas por lado corto donde puede caer una mordida
  const FILOS = {
    // El corte limpio: lo que la familia hacía antes de esto. Se queda porque es
    // una decisión legítima —la serigrafía corta así— y porque conviene poder
    // comparar contra ella.
    cortado: { prob: 0.22, amp: 0,      mord: 0    },
    pincel:  { prob: 0.56, amp: 0.0021, mord: 0.06 },
    seco:    { prob: 0.22, amp: 0.0032, mord: 0.20 },
  };
  const FILO_NAMES = Object.keys(FILOS);

  // EL GRANO ES DEL PAPEL, Y LA TINTA LO TAPA. Ésta es la parte de superficie, y
  // resultó ser una línea, no una textura: el motor aplica el grano a todo el
  // lienzo por igual, así que la masa y el suelo salían del MISMO material, solo
  // que de distinto color. En una hoja impresa no es así — el diente lo tiene el
  // papel, y donde hay carga queda cubierto. Se repinta el cuerpo por encima del
  // grano con esta opacidad: el suelo conserva su grano entero y la tinta queda
  // casi lisa. No añade ninguna forma, que es la condición — el primer intento
  // metió vetas de suelo dentro de la masa y se leían como agujeros dibujados,
  // porque una veta que engorda en el centro y se afila en las puntas tiene forma
  // de almendra, y esa forma no la hace un pincel: la hace quien la dibuja.
  const ALISO = 0.55;

  const MITER = 2.4;         // tope del inglete: por encima, el pico es una astilla
  const SESGO_MAX = 0.34;    // asimetría del cuerpo respecto a su eje
  const CORTE_MAX = 0.75;    // oblicuidad del corte de un remate, × anchura

  // ── El campo ────────────────────────────────────────────────────────────────
  // Margen SOLO en el eje corto. Los estratos tienen que salirse por los lados
  // —son el corte de un continuo— pero arriba y abajo el suelo respira. Un
  // margen en los cuatro lados daría una figura flotando, que es justo lo que no
  // es esta obra.
  // 0,085 no bastaba: el margen se medía contra el EJE, así que un cuerpo gordo
  // pegado al límite de su banda sacaba media anchura fuera y se comía el borde.
  // Una masa que toca el borde de abajo deja de ser una masa y se vuelve TERRENO —
  // se lee como la silueta de un monte, con el suelo convertido en cielo. El margen
  // se mide ahora contra el BORDE del cuerpo (ver el tope de 'estrato').
  const MARGEN_Y = 0.11;
  const SANGRE = 0.06;       // cuánto se pasa del borde un estrato que cruza, × W

  const VERT_MIN = 12, VERT_MAX = 20;   // vértices por estrato
  // Amplitud vertical de un estrato, × la mitad de su hueco. Sube de 0,42 a 0,80, y
  // el número sale de una relación, no del gusto: el PASILLO por el que vagabundea
  // un cuerpo (2×amplitud) tiene que ser bastante más ancho que el cuerpo, o el
  // cuerpo no puede subir ni bajar más que su propio grosor y la masa se aplana
  // hasta leerse como una costa. Con 0,55 y dos estratos el pasillo salía de 0,22 H
  // y la masa gorda mide 0,15: no cabía el gesto. Con 0,80 el pasillo es 0,32 H.
  // Que los vecinos lleguen a tocarse no es un defecto: es soldar.
  const BANDA = 0.80;
  // La pendiente va por RACHAS: se mantiene 1..4 vértices y luego se rompe. Es la
  // misma razón por la que TRZS curva por tramos y no por vértice — sin racha, un
  // paseo aleatorio en y da diente de sierra, y el diente de sierra se lee como
  // ruido. Con racha da tramos rectos largos que se quiebran de golpe, que es el
  // gesto del que sale esta obra.
  //
  // Y la pendiente es BIMODAL, no continua: una racha va casi plana o va fuerte, y
  // no hay término medio. Ésa es la diferencia entre un perfil de montaña y el
  // perfil escalonado de la referencia — largo tramo horizontal, quiebro fuerte,
  // otro tramo horizontal. Con una ley continua (u^1,9) la obra salía en diagonales
  // de todas las inclinaciones a la vez, que promedia a cordillera; con dos modos
  // aparecen los ángulos casi rectos, que es el gesto.
  const P_LLANA = 0.50;
  const PEND_LLANA = 0.22, PEND_MIN = 0.75, PEND_MAX = 1.9;
  const RACHA_P = [1, 2, 2, 3, 4];
  // La asimetría también va por rachas. Por vértice solo hacía temblar el eje;
  // sostenida, deja un lado del cuerpo casi recto y todo el accidente en el otro,
  // que es como está cortada la masa de la referencia.
  const RACHA_S = [2, 3, 3, 4];

  // ── Los tipos ───────────────────────────────────────────────────────────────
  // Declaran cuántos estratos, cuántos puentes y cuánta mancha, y luego se
  // comprueba. Es el mecanismo de TRZS, y está aquí por lo mismo: una etiqueta
  // puesta antes de dibujar que no corresponde a nada visible no es un rasgo.
  //   ojos    — ojos MEDIDOS que se aceptan
  //   mancha  — fracción de tinta que se acepta
  // Los muñones bajan a la mitad de lo que eran: cuando cada rama pesa como el
  // tronco, doce ramas no son un cuerpo ramificado, son maleza.
  // Y la mancha baja unos puntos en los cuatro tipos. Con el techo de 'isla' en 46%
  // la pieza dejaba de leerse como figura sobre suelo y pasaba a ser un rompecabezas
  // de dos colores: por encima del 38% no hay vacío en minoría, hay empate. La hoja
  // tiene que respirar, y en la referencia respira mucho.
  const TIPOS = {
    // Un estrato solo, o dos sin tocarse — pero con un lazo: una masa que cruza la
    // hoja y encierra UN vacío es la pieza mínima de esta familia. Sin lazo la
    // versión callada salía sin suceso, una banda y nada más.
    estrato:    { prob: 0.22, estratos: [1, 2], puentes: [0, 0], lazos: [1, 2], munones: [1, 3],
                  ojos: [0, 2], mancha: [0.05, 0.20] },
    // El de la referencia: dos o tres estratos soldados y cerrados sobre sí
    // mismos, con vacíos dentro de la masa. Es el centro de la familia.
    soldado:    { prob: 0.42, estratos: [2, 3], puentes: [1, 3], lazos: [1, 3], munones: [2, 5],
                  ojos: [1, 4], mancha: [0.09, 0.28] },
    // Muchos muñones y nada que se cierre: la silueta se deshilacha.
    ramificado: { prob: 0.24, estratos: [2, 3], puentes: [0, 1], lazos: [0, 1], munones: [4, 8],
                  ojos: [0, 1], mancha: [0.07, 0.25] },
    // Rara a propósito: la masa asedia el suelo hasta que el vacío queda en
    // minoría. Figura y fondo se cambian el sitio.
    isla:       { prob: 0.12, estratos: [3, 4], puentes: [2, 4], lazos: [3, 6], munones: [3, 6],
                  ojos: [3, 12], mancha: [0.21, 0.37] },
  };
  const TIPO_NAMES = Object.keys(TIPOS);

  // Sube de 6 a 9. El bucle corta en cuanto un candidato cumple, así que los 9 solo
  // se pagan en las seeds difíciles: con 6 cumplía el 95,3% y con 9 el 98,0%, y la
  // mediana por pieza no se mueve. Lo que queda sin cumplir se queda: con seeds
  // difíciles no hay ningún candidato bueno, y entonces manda el que menos incumple
  // —no el primero—, que es por lo que 'falta' es un número y no un sí/no.
  const REINTENTOS = 9;      // candidatos que se prueban con el mismo seed
  const GRID = 150;          // resolución del campo de distancias, en el lado corto
  // Un ojo de dos celdas es ruido de rasterización, no un hueco. El umbral se
  // mide en fracción de la hoja para que signifique lo mismo en cualquier
  // formato y a cualquier resolución del grid.
  const OJO_MIN = 0.00035;

  // ── Geometría ───────────────────────────────────────────────────────────────
  const hypot = Math.hypot, min = Math.min, max = Math.max, abs = Math.abs;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  // Ruido de valor 1D, interpolado con smoothstep. Es función PURA de (semilla,
  // posición) —no un RNG con estado— y ésa es la condición: el dibujo recorre las
  // cadenas en un orden que no tiene por qué ser el de generación, y el filo tiene
  // que salir igual pase lo que pase. hash01 es el finalizer de murmur3 del motor,
  // que ya está ahí porque el fondo lo necesitaba por lo mismo: sin avalancha, dos
  // enteros vecinos dan valores casi iguales y el ruido sale peinado.
  function ruido1(sem, t) {
    const i = Math.floor(t), f = t - i;
    const a = E.hash01((sem + i) >>> 0), b = E.hash01((sem + i + 1) >>> 0);
    return a + (b - a) * f * f * (3 - 2 * f);
  }
  function filoRuido(sem, s) {
    let v = 0;
    for (let k = 0; k < OCT.length; k++) {
      v += (ruido1((sem ^ (0x9E3779B1 * (k + 1))) >>> 0, s * OCT[k].f) * 2 - 1) * OCT[k].a;
    }
    return v;
  }
  // Mordida: una celda de cada tantas se muerde, y dentro de la celda el mordisco
  // sube y baja (seno) en vez de aparecer de golpe — un escalón se lee como un
  // defecto del trazado, no como falta de carga.
  function mordida(sem, s, p) {
    if (p <= 0) return 0;
    const c = Math.floor(s * MORD_F);
    if (E.hash01(((sem ^ 0xB17E5) + c * 0x27D4EB2D) >>> 0) >= p) return 0;
    return Math.sin((s * MORD_F - c) * Math.PI);
  }

  function pointSegDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    if (l2 < 1e-12) return hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  // El CUERPO de una cadena: dos bordes desplazados y los cuadriláteros que van
  // de uno a otro.
  //
  // Se emite un cuadrilátero POR TRAMO, no un polígono por cuerpo, y los dos
  // vértices del corte los comparten los tramos vecinos: así no hay costura que
  // se abra ni pico que sobresalga, y —lo que importa— todos los cuadriláteros
  // salen con la MISMA orientación. Con `nonzero`, dos cuadriláteros que se pisan
  // suman; con orientaciones mezcladas se anularían y aparecería un agujero donde
  // la masa es más espesa. Está comprobado sobre la fórmula: el área con signo de
  // [aI, bI, bD, aD] sale negativa vaya el tramo en el sentido que vaya, porque
  // izquierda y derecha se definen con la normal, que gira con el tramo.
  //
  // Y el inglete se topa: el pico de un giro cerrado es tinta MUY fuera de la
  // banda. Al toparlo, la esquina exterior queda cortada — que es exactamente el
  // corte de cincel del que viene esta obra.
  function bordes(ch) {
    const n = ch.length;
    const nx = new Float64Array(n - 1), ny = new Float64Array(n - 1);
    const ux = new Float64Array(n - 1), uy = new Float64Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      const dx = ch[i + 1].x - ch[i].x, dy = ch[i + 1].y - ch[i].y;
      const m = hypot(dx, dy) || 1e-9;
      ux[i] = dx / m; uy[i] = dy / m;
      nx[i] = -uy[i];  ny[i] = ux[i];
    }
    const I = new Array(n), D = new Array(n), M = new Array(n);
    for (let i = 0; i < n; i++) {
      let mx, my, esc = 1;
      if (i === 0) { mx = nx[0]; my = ny[0]; }
      else if (i === n - 1) { mx = nx[n - 2]; my = ny[n - 2]; }
      else {
        const sx = nx[i - 1] + nx[i], sy = ny[i - 1] + ny[i], m = hypot(sx, sy);
        if (m < 1e-6) { mx = nx[i]; my = ny[i]; }       // inversión: sin bisectriz
        else {
          mx = sx / m; my = sy / m;
          esc = min(MITER, 1 / max(mx * nx[i] + my * ny[i], 1e-3));
        }
      }
      const s = ch[i].sesgo || 0;
      const hi = ch[i].hw * (1 + s) * esc, hd = ch[i].hw * (1 - s) * esc;
      // El corte de un remate es OBLICUO: los dos bordes no acaban a la misma
      // altura del eje. Un corte perpendicular es un tubo serrado; el oblicuo es
      // el hachazo. Se resuelve corriendo cada borde por la tangente en sentido
      // contrario, no girando la normal: así el cuerpo no cambia de anchura.
      const c = ch[i].corte || 0;
      const tx = i === 0 ? ux[0] : ux[n - 2], ty = i === 0 ? uy[0] : uy[n - 2];
      const k = (i === 0 || i === n - 1) ? c * ch[i].hw : 0;
      I[i] = { x: ch[i].x + mx * hi + tx * k, y: ch[i].y + my * hi + ty * k };
      D[i] = { x: ch[i].x - mx * hd - tx * k, y: ch[i].y - my * hd - ty * k };
      // La dirección del vértice y la anchura que se usó ahí: las necesita el filo
      // para desplazar el borde por donde toca y para saber cuánto puede morder.
      M[i] = { mx, my, hi, hd };
    }
    return { I, D, M };
  }

  // Emite el cuerpo como cuadriláteros consecutivos. Con filo, cada tramo se parte
  // en subtramos y los dos bordes se desplazan; sin filo (amp 0) sale exactamente el
  // polígono de antes, sin coste.
  //
  // Las COSTURAS son lo delicado. Dos condiciones, y las dos se cumplen por
  // construcción: dentro de un tramo, los subcuadriláteros comparten sus dos puntos
  // de corte; y entre dos tramos, el punto del vértice se calcula UNA vez —con la
  // dirección de la bisectriz, no con la normal de ninguno de los dos tramos— y lo
  // usan los dos. Si cada tramo desplazara el vértice con su propia normal, en cada
  // esquina se abriría una rendija por la que se vería el suelo.
  function emitir(ctx, ch, filo, sem) {
    if (ch.length < 2) return;
    const { I, D, M } = bordes(ch);
    const n = ch.length;
    const amp = filo ? filo.amp : 0;

    if (!amp) {
      for (let i = 0; i < n - 1; i++) {
        ctx.moveTo(I[i].x, I[i].y);
        ctx.lineTo(I[i + 1].x, I[i + 1].y);
        ctx.lineTo(D[i + 1].x, D[i + 1].y);
        ctx.lineTo(D[i].x, D[i].y);
        ctx.closePath();
      }
      return;
    }

    const semI = (sem ^ 0x1F35C) >>> 0, semD = (sem ^ 0x7A21B) >>> 0;
    // Arco acumulado sobre el EJE, en unidades de lado corto: es la coordenada del
    // ruido, así que el filo no depende ni del número de vértices ni del tamaño.
    const arco = new Float64Array(n);
    for (let i = 1; i < n; i++) {
      arco[i] = arco[i - 1] + hypot(ch[i].x - ch[i - 1].x, ch[i].y - ch[i - 1].y);
    }

    // Desplazamiento de un borde: ruido menos mordida, topado contra la anchura de
    // ahí. El tope es lo que impide que en un estrangulamiento el borde cruce el eje
    // y el cuadrilátero se dé la vuelta.
    const off = (semilla, sArco, hw) => {
      const v = filoRuido(semilla, sArco) - mordida(semilla, sArco, filo.mord) * 1.6;
      const t = hw * FILO_TOPE;
      return clamp(v * amp, -t, t);
    };
    // Los puntos de los VÉRTICES, una sola vez y con la bisectriz.
    const vI = new Array(n), vD = new Array(n);
    for (let i = 0; i < n; i++) {
      const oI = off(semI, arco[i], M[i].hi), oD = off(semD, arco[i], M[i].hd);
      vI[i] = { x: I[i].x + M[i].mx * oI, y: I[i].y + M[i].my * oI };
      vD[i] = { x: D[i].x - M[i].mx * oD, y: D[i].y - M[i].my * oD };
    }

    for (let i = 0; i < n - 1; i++) {
      const L = hypot(ch[i + 1].x - ch[i].x, ch[i + 1].y - ch[i].y);
      const k = max(1, Math.ceil(L / PASO_FILO));
      // Normal del TRAMO para los puntos de dentro; en los extremos manda el vértice.
      const ux = (ch[i + 1].x - ch[i].x) / (L || 1e-9), uy = (ch[i + 1].y - ch[i].y) / (L || 1e-9);
      const nx = -uy, ny = ux;
      let aI = vI[i], aD = vD[i];
      for (let j = 1; j <= k; j++) {
        let bI, bD;
        if (j === k) { bI = vI[i + 1]; bD = vD[i + 1]; }
        else {
          const t = j / k, sA = arco[i] + L * t;
          const bx = I[i].x + (I[i + 1].x - I[i].x) * t, by = I[i].y + (I[i + 1].y - I[i].y) * t;
          const dx = D[i].x + (D[i + 1].x - D[i].x) * t, dy = D[i].y + (D[i + 1].y - D[i].y) * t;
          const hwI = M[i].hi + (M[i + 1].hi - M[i].hi) * t;
          const hwD = M[i].hd + (M[i + 1].hd - M[i].hd) * t;
          const oI = off(semI, sA, hwI), oD = off(semD, sA, hwD);
          bI = { x: bx + nx * oI, y: by + ny * oI };
          bD = { x: dx - nx * oD, y: dy - ny * oD };
        }
        ctx.moveTo(aI.x, aI.y);
        ctx.lineTo(bI.x, bI.y);
        ctx.lineTo(bD.x, bD.y);
        ctx.lineTo(aD.x, aD.y);
        ctx.closePath();
        aI = bI; aD = bD;
      }
    }
  }

  // ── Roles de color ──────────────────────────────────────────────────────────
  // Las paletas de hoks son listas planas: no declaran suelo ni tinta. EVOL
  // necesita DOS colores y renuncia al resto, que es una decisión y no una
  // limitación — un cuerpo de tres colores deja de ser un cuerpo.
  //
  // La pareja se elige por DISTANCIA DE COLOR, no por luminancia. Con luminancia,
  // las series Itten (cuatro colores entre 0,31 y 0,44 de luma) daban rojo sobre
  // rojo: son contrastes de TONO, y ahí el ojo lee la figura perfectamente aunque
  // el valor sea el mismo. Elegido el par, la luminancia sí decide quién es
  // suelo — el claro, salvo inversión.
  // Las DOS decisiones de color se tiran aparte del reparto, y siempre las dos.
  // Así el stream del RNG no depende de lo que salga, y el reparto puede volver a
  // calcularse con otra bandera sin mover ni un vértice — que es lo que necesita el
  // acoplamiento de la inversión (ver render).
  function dadosColor(rng) { return { inv: rng.bool(P_INV), crudo: rng.bool(0.5) }; }

  function rolesFor(colors, dd) {
    const uniq = colors.filter((c, i) => colors.indexOf(c) === i);
    if (uniq.length < 2) return { suelo: uniq[0] || '#e8e2d0', tinta: '#111111', otra: null, inv: false, papel: 'blanco' };

    let a = uniq[0], b = uniq[1], best = -1;
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const d = dcolor(uniq[i], uniq[j]);
        if (d > best) { best = d; a = uniq[i]; b = uniq[j]; }
      }
    }
    const claro = E.luma(a) >= E.luma(b) ? a : b;
    const oscuro = claro === a ? b : a;
    // La inversión —tinta clara sobre suelo oscuro— existe y es minoría. No es un
    // negativo: es la otra manera de que el vacío tenga borde.
    const inv = dd.inv;
    const tinta = inv ? claro : oscuro;
    let suelo = inv ? oscuro : claro;

    // EL PAPEL. Elegir el par más distante lleva SIEMPRE al blanco, y el blanco no
    // es el único suelo posible: la referencia de esta familia está sobre papel
    // crudo —un tono medio y cálido— y ahí la masa negra pesa distinto, porque el
    // suelo deja de ser ausencia de tinta y se vuelve material. Si la paleta tiene
    // un tono medio que aguante el contraste, se usa la mitad de las veces. No es
    // un ajuste: es qué papel se compra.
    let papel = 'blanco';
    if (!inv) {
      const crudos = uniq.filter(c => c !== tinta && E.luma(c) >= 0.52 && E.luma(c) <= 0.93
                                      && dcolor(c, tinta) > 0.42);
      if (crudos.length && dd.crudo) {
        // El más oscuro de los crudos: es el que más se aleja del blanco, que es
        // justo lo que se busca al pedir papel.
        suelo = crudos.sort((x, y) => E.luma(x) - E.luma(y))[0];
        papel = 'crudo';
      }
    }

    // Segunda tinta: un cuerpo entero en otro color. Tiene que sostenerse solo
    // —contraste contra el suelo Y diferencia con la primera tinta—, si no se lee
    // como un error de registro en la impresión.
    const resto = uniq.filter(c => c !== suelo && c !== tinta);
    const otra = resto.find(c => dcolor(c, suelo) > 0.34 && dcolor(c, tinta) > 0.30) || null;
    return { suelo, tinta, otra, inv, papel };
  }

  const P_INV = 0.16;        // tinta clara sobre suelo oscuro
  // Y el acoplamiento: una masa LEVE invertida no es un negativo, es un arañazo.
  // Medido sobre 500 tiradas —la mancha va de 14,4% (p10) a 28,6% (p90)— por debajo
  // del 18% la tinta clara sobre suelo oscuro se lee como una raya en una plancha,
  // no como un cuerpo. Ahí la inversión se cancela. Es el patrón de ECLPS: se decide
  // DESPUÉS de medir, así que corrige el color sin mover el dibujo.
  const INV_MIN_MANCHA = 0.18;

  function dcolor(a, b) {
    const x = E.hexToRgb(a), y = E.hexToRgb(b);
    return (abs(x[0] - y[0]) + abs(x[1] - y[1]) + abs(x[2] - y[2])) / 765;
  }

  // El grosor de una cadena, por rachas. Devuelve los niveles, no las anchuras:
  // el nivel es lo que se lee en el trait (cuánta escala ha recorrido la pieza).
  // Los niveles de un cuerpo: un paseo por rachas DENTRO de la ventana [lo, hi].
  // La ventana la pone la jerarquía, y es lo que hace que dos estratos de la misma
  // pieza no pesen lo mismo. Sin jerarquía los estratos salían equivalentes y la
  // pieza se leía como papel pintado: tres bandas iguales y ningún sitio donde
  // mirar. Una obra tiene un suceso y unos ecos.
  function grosores(rng, nv, lo, hi) {
    lo = clamp(lo, 0, NIVELES - 1); hi = clamp(hi, lo, NIVELES - 1);
    const lv = [];
    let cur = rng.int(lo, hi), racha = rng.pickFrom(RACHA_W);
    for (let i = 0; i < nv; i++) {
      if (racha-- <= 0) {
        cur = rng.bool(P_REVUELTA) ? rng.int(lo, hi)
                                   : clamp(cur + (rng.bool(0.5) ? 1 : -1), lo, hi);
        racha = rng.pickFrom(RACHA_W);
      }
      lv.push(cur);
    }
    // El estrangulamiento: UN vértice, y de los de dentro — un cuello en un remate
    // es un remate fino, no un cuello.
    if (nv >= 5 && rng.bool(P_ESTRANGULA)) {
      lv[rng.int(2, nv - 3)] = clamp(lo - ESTRANGULA, 0, NIVELES - 1);
    }
    return lv;
  }

  function pendiente(rng) {
    const s = rng.bool(0.5) ? 1 : -1;
    return s * (rng.bool(P_LLANA) ? rng.range(0, PEND_LLANA) : rng.range(PEND_MIN, PEND_MAX));
  }

  // ── El recorrido de un estrato ──────────────────────────────────────────────
  // Cruza el campo en un sentido, con x monótona. La monotonía no es un atajo
  // estético: sin ella aparecen inversiones de dirección donde la bisectriz del
  // inglete es indefinida, y ahí el cuerpo revienta. TRZS necesita un ángulo
  // mínimo de giro y un solver que lo persiga; aquí sale gratis de la gramática.
  //
  // La y NO es una tirada por vértice: es una PENDIENTE que se mantiene una racha
  // y se rompe. Y cuando la masa llega al techo de su banda, la pendiente REBOTA
  // en vez de recortarse — recortando, el cuerpo se queda pegado al límite y sale
  // una meseta; rebotando, el límite produce el pliegue.
  function estrato(rng, X0, X1, yc, banda, niveles, sentido, lo, hi, yLo, yHi) {
    const nv = rng.int(VERT_MIN, VERT_MAX);
    const lv = grosores(rng, nv, lo, hi);
    const ch = [];
    // Pasos desiguales: con paso constante la masa se lee como un diagrama.
    const pesos = [];
    let tot = 0;
    for (let i = 0; i < nv - 1; i++) { const w = rng.range(0.4, 1.6); pesos.push(w); tot += w; }

    let y = yc + rng.range(-0.45, 0.45) * banda;
    let pend = pendiente(rng), racha = rng.pickFrom(RACHA_P);
    let ses = rng.range(-SESGO_MAX, SESGO_MAX), rachaS = rng.pickFrom(RACHA_S);
    let t = 0;
    for (let i = 0; i < nv; i++) {
      const x = X0 + (X1 - X0) * t;
      if (rachaS-- <= 0) { ses = rng.range(-SESGO_MAX, SESGO_MAX); rachaS = rng.pickFrom(RACHA_S); }
      const hw = niveles[lv[i]] / 2;
      // El tope contra la hoja se aplica con la ANCHURA de este vértice: es lo que
      // mantiene el cuerpo flotando en el suelo en vez de aterrizar en el borde.
      const lim = (hw * (1 + SESGO_MAX)) * 1.05;
      const yv = yHi - lim > yLo + lim ? clamp(y, yLo + lim, yHi - lim) : (yLo + yHi) / 2;
      ch.push({ x, y: yv, hw, lv: lv[i], sesgo: ses, corte: 0 });
      if (i === nv - 1) break;
      const paso = (X1 - X0) * pesos[i] / tot;
      if (racha-- <= 0) { pend = pendiente(rng); racha = rng.pickFrom(RACHA_P); }
      // El desnivel de un paso se topa contra la BANDA, no contra el paso. Sin este
      // tope la pendiente fuerte agota la banda en un vértice, rebota, y la masa se
      // pasa la pieza rebotando: sale diente de sierra otra vez, ahora en grande.
      y += clamp(pend * abs(paso), -banda * 0.55, banda * 0.55);
      // Al llegar al techo de la banda la pendiente REBOTA en vez de recortarse:
      // recortando, el cuerpo se queda pegado al límite y sale una meseta.
      if (y > yc + banda) { y = yc + banda - (y - yc - banda) * 0.5; pend = -abs(pend); racha = 0; }
      if (y < yc - banda) { y = yc - banda + (yc - banda - y) * 0.5; pend =  abs(pend); racha = 0; }
      t += pesos[i] / tot;
    }
    if (sentido < 0) ch.reverse();
    ch[0].corte = rng.range(-CORTE_MAX, CORTE_MAX);
    ch[ch.length - 1].corte = rng.range(-CORTE_MAX, CORTE_MAX);
    return ch;
  }

  // Un corte oblicuo sobre un remate FINO no es un hachazo: es una púa. La
  // oblicuidad se reparte según el grosor del remate, así que el gesto solo aparece
  // donde hay masa que cortar.
  function corteDe(rng, hw, gordo) {
    const k = clamp(hw / max(gordo, 1e-9), 0, 1);
    return rng.range(-CORTE_MAX, CORTE_MAX) * k;
  }

  // ── El lazo: el ojo que se hace un cuerpo solo ──────────────────────────────
  // Una rama sale de un vértice, se arquea hacia un lado y VUELVE al tronco unos
  // vértices más allá. Al volver se suelda, y lo que queda entre la rama y el
  // tronco es suelo con borde: un ojo.
  //
  // Éste es el mecanismo bueno, y en la primera versión no estaba: los ojos salían
  // solo de dos puentes verticales entre estratos vecinos, y dos plomadas paralelas
  // leen como pilares — la obra se iba a arquitectura. Un cuerpo que se cierra
  // sobre sí mismo no tiene ese problema: el hueco hereda la forma del cuerpo.
  //
  // El arco se mide contra la ANCHURA LOCAL, no contra la hoja: un lazo tiene que
  // abrirse más de lo que la masa engorda, o la masa se come su propio ojo. Ése es
  // justo el caso que 'medir' encuentra y por el que un candidato se descarta.
  function lazo(rng, ch, S, niveles) {
    if (ch.length < 5) return null;
    const k = rng.int(2, min(4, ch.length - 2));
    const i = rng.int(0, ch.length - 1 - k);
    const a = ch[i], b = ch[i + k];
    const dx = b.x - a.x, dy = b.y - a.y, m = hypot(dx, dy) || 1e-9;
    const ux = dx / m, uy = dy / m, nx = -uy, ny = ux;

    // El arco cae del lado contrario a por donde el tronco se va: si va por el
    // mismo, la rama se apoya sobre el tronco y no encierra nada.
    let s = 0;
    for (let j = i + 1; j < i + k; j++) s += (ch[j].x - a.x) * nx + (ch[j].y - a.y) * ny;
    const lado = s > 0 ? -1 : 1;

    // EL ARCO SE DEDUCE, no se calibra. Un lazo tiene que salvar media anchura del
    // tronco MÁS media de la rama MÁS el hueco que se quiere ver; medido en
    // anchuras del tronco salían lentejas: con un tronco de 25 px y una rama de 15,
    // cuatro anchuras dejaban el hueco en negativo y el ojo no llegaba a existir.
    // Así el hueco es un dato de la obra —cuánto suelo queda dentro— y no un resto.
    // La rama de un lazo pesa CASI LO MISMO que el tronco del que sale, y su
    // ventana se saca del nivel de ese tronco en vez de una fija baja. Con la
    // ventana fija [1,3] las ramas salían siempre finas y el ojo quedaba cercado
    // por un alambre: en la referencia el hueco está rodeado de masa por los cuatro
    // lados, porque las ramas SON la masa, no un apéndice suyo.
    const nv = rng.int(2, 3);
    const lvT = a.lv == null ? NIVELES - 3 : a.lv;
    const lv = grosores(rng, nv + 2, max(0, lvT - 2), max(1, lvT));
    const bw = niveles[lv[1]] / 2;
    const hueco = S * rng.range(0.035, 0.115);
    const arco = max(a.hw, b.hw) + bw + hueco;
    const out = [{ x: a.x, y: a.y, hw: a.hw, sesgo: 0, corte: 0 }];
    for (let j = 1; j <= nv; j++) {
      const u = j / (nv + 1);
      const alza = Math.sin(u * Math.PI) * arco * lado;
      out.push({
        x: a.x + dx * u + nx * alza + ux * rng.range(-0.1, 0.1) * m,
        y: a.y + dy * u + ny * alza + uy * rng.range(-0.1, 0.1) * m,
        hw: bw,
        sesgo: rng.range(-SESGO_MAX, SESGO_MAX), corte: 0,
      });
    }
    out.push({ x: b.x, y: b.y, hw: b.hw, sesgo: 0, corte: 0 });
    return out;
  }

  // Punto de una cadena a una x dada, interpolado. Es lo que necesita un puente
  // para nacer SOBRE el estrato y no al lado.
  function enX(ch, x) {
    for (let i = 0; i < ch.length - 1; i++) {
      const a = ch[i], b = ch[i + 1];
      const lo = min(a.x, b.x), hi = max(a.x, b.x);
      if (x >= lo && x <= hi) {
        const t = abs(b.x - a.x) < 1e-9 ? 0 : (x - a.x) / (b.x - a.x);
        return { x, y: a.y + (b.y - a.y) * t, hw: a.hw + (b.hw - a.hw) * t };
      }
    }
    const e = ch[0].x <= ch[ch.length - 1].x ? (x < ch[0].x ? ch[0] : ch[ch.length - 1])
                                            : (x > ch[0].x ? ch[0] : ch[ch.length - 1]);
    return { x: e.x, y: e.y, hw: e.hw };
  }

  // ── El puente: la soldadura ─────────────────────────────────────────────────
  // Une dos estratos. Se mete DENTRO de los dos cuerpos —no los toca de canto—
  // porque una soldadura que solo roza deja una junta visible, y una junta
  // visible es una incisión, que es exactamente la obra anterior.
  // El puente sale OBLICUO, no a plomo. Con dos puentes verticales entre los
  // mismos estratos la pieza se lee como un pórtico: dos pilares y un dintel. La
  // oblicuidad es lo que devuelve el encuentro al terreno de la masa.
  function puente(rng, chA, chB, x, niveles) {
    const a = enX(chA, x), b = enX(chB, x);
    const dy = b.y - a.y;
    if (abs(dy) < 1e-6) return null;
    const lv = rng.int(2, NIVELES - 2);
    const hw = niveles[lv] / 2;
    // Entra un 60% del grosor del estrato: soldado, no apoyado.
    const ai = { x: a.x, y: a.y + Math.sign(dy) * a.hw * 0.6 };
    // El pie de llegada se corre en x: ahí está la oblicuidad.
    const bi = { x: b.x + rng.range(-1, 1) * abs(dy) * 0.75, y: b.y - Math.sign(dy) * b.hw * 0.6 };
    const desv = rng.range(-1, 1) * abs(dy) * 0.3;
    const mx = (ai.x + bi.x) / 2 + desv, my = (ai.y + bi.y) / 2;
    return [
      { x: ai.x, y: ai.y, hw: hw * rng.range(0.9, 1.6), sesgo: 0, corte: 0 },
      { x: mx,   y: my,   hw, sesgo: rng.range(-SESGO_MAX, SESGO_MAX), corte: 0 },
      { x: bi.x, y: bi.y, hw: hw * rng.range(0.9, 1.6), sesgo: 0, corte: 0 },
    ];
  }

  // ── El muñón: la rama que muere ─────────────────────────────────────────────
  // Sale de un vértice hacia fuera y se corta a hachazo. GORDO y CORTO: en la
  // primera versión salían de 2-3 vértices, largos y de nivel bajo, y leían como
  // antenas — pelos pegados a la masa, que es un defecto de dibujo, no un gesto.
  // Un muñón es un trozo de la misma masa que se ha ido y se ha quedado a medias,
  // así que su grosor se mide contra el del tronco del que sale (0,45..1,15 de su
  // anchura), no contra la escala entera.
  // `foco` es el vértice alrededor del cual se agrupa el accidente. Sin él los
  // muñones se reparten por todo el recorrido y la masa sale peluda de punta a
  // punta; en la referencia el ramaje se concentra en una zona y el resto del
  // cuerpo viaja limpio. Se sortean dos candidatos y gana el más cercano al foco:
  // agrupa sin llegar a amontonar.
  function munon(rng, ch, S, niveles, foco) {
    let i = rng.int(1, ch.length - 2);
    if (foco != null) {
      const j = rng.int(1, ch.length - 2);
      if (abs(j - foco) < abs(i - foco)) i = j;
    }
    const a = ch[i], b = ch[i + 1], p = ch[i - 1];
    if (a.lv != null && a.lv < 2) return null;
    const dx = b.x - p.x, dy = b.y - p.y, m = hypot(dx, dy) || 1e-9;
    const lado = rng.bool(0.5) ? 1 : -1;
    const ang = Math.atan2(dy / m, dx / m) + lado * (Math.PI / 2) + rng.range(-0.7, 0.7);
    // El largo se mide contra la ANCHURA DEL MUÑÓN, no contra la del tronco a secas,
    // y con una proporción mínima: un muñón tan ancho como largo no es una rama, es
    // un DIENTE, y una masa con doce dientes se lee como un engranaje. Al subir el
    // grosor de la rama (de 0,45–1,15 del tronco a 0,62–1,28) el largo tenía que
    // subir con él o el gesto se convertía en mordisco — que es exactamente lo que
    // pasó. Con 3,5–8 anchuras la rama viaja, y viajando vuelve a ser una rama.
    const nv = rng.bool(0.55) ? 1 : 2;
    const largo = max(a.hw * rng.range(3.5, 8.0), S * 0.03);
    const out = [{ x: a.x, y: a.y, hw: a.hw * rng.range(0.7, 1.1), sesgo: 0, corte: 0 }];
    let x = a.x, y = a.y, an = ang;
    for (let k = 1; k <= nv; k++) {
      const paso = largo / nv;
      if (k > 1) an += rng.range(-0.7, 0.7);
      x += Math.cos(an) * paso; y += Math.sin(an) * paso;
      // El remate puede ENGORDAR antes de morir —el remate en maza—: un muñón que
      // solo adelgaza se lee como una púa, y las púas no son de esta obra.
      out.push({ x, y, hw: a.hw * rng.range(0.62, 1.28) * (k === nv ? rng.range(0.8, 1.5) : 1),
                 sesgo: rng.range(-SESGO_MAX, SESGO_MAX), corte: 0 });
    }
    const u = out[out.length - 1];
    u.corte = corteDe(rng, u.hw, niveles[NIVELES - 1] / 2);
    return out;
  }

  // ── Medir: los ojos y la mancha ─────────────────────────────────────────────
  // Campo de distancias sobre una rejilla + inundación desde el borde. Lo que el
  // agua NO alcanza y no es cuerpo, es un ojo. Es el mismo mecanismo con el que
  // TRZS encuentra los vacíos donde pone sus discos; aquí no se pone nada: el
  // hueco se cuenta y se deja.
  //
  // El test es ANALÍTICO (distancia al eje contra media anchura), no un
  // getImageData: así mide igual en pantalla y a 300 dpi, y no depende de que el
  // dibujo ya esté hecho. Su cuerpo es de cabos redondos y el dibujado es de
  // inglete topado, así que en las esquinas mide un pelo de más — cierra antes de
  // lo que se ve, nunca al revés, y por eso el umbral del ojo tiene holgura.
  // OJO con la resolución: esto no solo informa, ELIGE. 'falta' se calcula sobre lo
  // que mide y con eso se descarta un candidato, así que si midiera distinto en
  // pantalla y a 300 dpi podría elegirse otro tejido y la misma seed daría dos
  // imágenes. Pasaba: en A1 horizontal el conteo de ojos salía 0 donde en pantalla
  // salía 1, porque un vacío justo en el filo de cerrarse cae de un lado o de otro
  // según el redondeo en píxeles.
  //
  // Así que se mide en unidades de LADO CORTO, no en píxeles: la geometría se divide
  // por S y la celda es 1/GRID. Y el número de columnas sale de la proporción
  // NOMINAL, no del cociente en píxeles — 1075×760, 4961×3508 y 9933×7016 son el
  // mismo 'horizontal' pero sus cocientes difieren lo bastante como para cruzar un
  // Math.round. Es el mismo cuidado que ECLPS tiene con su rango de slots, y por la
  // misma razón: del formato se lee la decisión ENTERA, no el píxel.
  function medir(cuerpos, W, H) {
    const S = min(W, H);
    const k = 1 / S;                       // a unidades de lado corto
    const paso = 1 / GRID;
    const q = E.nominalAspect(max(W, H), S);
    const NL = max(4, Math.round(q * GRID));
    const NX = W >= H ? NL : GRID, NY = W >= H ? GRID : NL;
    const dentro = new Uint8Array(NX * NY);

    // Caja de cada tramo: sin ella esto es NX·NY·tramos y con 60 tramos en un A3
    // de rejilla fina ya se nota. Con caja, cada tramo solo mira sus celdas.
    for (const ch of cuerpos) {
      for (let i = 0; i < ch.length - 1; i++) {
        const ax = ch[i].x * k, ay = ch[i].y * k, ahw = ch[i].hw * k;
        const bx = ch[i + 1].x * k, by = ch[i + 1].y * k, bhw = ch[i + 1].hw * k;
        const hw = max(ahw, bhw) * (1 + SESGO_MAX) * MITER;
        const x0 = max(0, Math.floor((min(ax, bx) - hw) / paso));
        const x1 = min(NX - 1, Math.ceil((max(ax, bx) + hw) / paso));
        const y0 = max(0, Math.floor((min(ay, by) - hw) / paso));
        const y1 = min(NY - 1, Math.ceil((max(ay, by) + hw) / paso));
        const L = hypot(bx - ax, by - ay) || 1e-9;
        for (let gy = y0; gy <= y1; gy++) {
          for (let gx = x0; gx <= x1; gx++) {
            const c = gy * NX + gx;
            if (dentro[c]) continue;
            const px = (gx + 0.5) * paso, py = (gy + 0.5) * paso;
            // Media anchura donde cae la proyección: el cuerpo es un tronco de
            // cinta, no un tubo.
            let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (L * L);
            t = clamp(t, 0, 1);
            const h = ahw + (bhw - ahw) * t;
            if (pointSegDist(px, py, ax, ay, bx, by) <= h) dentro[c] = 1;
          }
        }
      }
    }

    let mancha = 0;
    for (let i = 0; i < dentro.length; i++) if (dentro[i]) mancha++;
    const total = NX * NY;

    // Inundación desde el borde, en pila propia. Recursión aquí revienta:
    // 150×212 celdas de suelo son 30.000 llamadas anidadas en el peor caso.
    const agua = new Uint8Array(total);
    const pila = [];
    for (let gx = 0; gx < NX; gx++) { pila.push(gx); pila.push((NY - 1) * NX + gx); }
    for (let gy = 0; gy < NY; gy++) { pila.push(gy * NX); pila.push(gy * NX + NX - 1); }
    while (pila.length) {
      const k = pila.pop();
      if (agua[k] || dentro[k]) continue;
      agua[k] = 1;
      const gx = k % NX, gy = (k - gx) / NX;
      if (gx > 0)      pila.push(k - 1);
      if (gx < NX - 1) pila.push(k + 1);
      if (gy > 0)      pila.push(k - NX);
      if (gy < NY - 1) pila.push(k + NX);
    }

    // Componentes de suelo que el agua no alcanzó: los ojos.
    const visto = new Uint8Array(total);
    const ojos = [];
    for (let k0 = 0; k0 < total; k0++) {
      if (dentro[k0] || agua[k0] || visto[k0]) continue;
      let area = 0;
      const q = [k0]; visto[k0] = 1;
      while (q.length) {
        const k = q.pop(); area++;
        const gx = k % NX, gy = (k - gx) / NX;
        const vec = [gx > 0 ? k - 1 : -1, gx < NX - 1 ? k + 1 : -1,
                     gy > 0 ? k - NX : -1, gy < NY - 1 ? k + NX : -1];
        for (const v of vec) {
          if (v < 0 || visto[v] || dentro[v] || agua[v]) continue;
          visto[v] = 1; q.push(v);
        }
      }
      const frac = area / total;
      if (frac >= OJO_MIN) ojos.push(frac);
    }
    ojos.sort((a, b) => b - a);
    return { ojos, mancha: mancha / total };
  }

  // ── Un candidato completo ───────────────────────────────────────────────────
  // OJO: W y H llegan NORMALIZADOS (lado corto = 1, largo = proporción nominal), no
  // en píxeles. Ver la nota del campo en render. Por eso S vale 1 y todas las
  // medidas de aquí abajo son ya fracciones del lado corto.
  function tramar(rng, W, H, tipo, params) {
    const S = min(W, H);
    const t = TIPOS[tipo];

    // LA ESCALA DEL CUERPO, por pieza. No es un ajuste del laboratorio que se haya
    // colado aquí: es con qué grosor de plancha está cortada ESTA pieza, y hacía
    // falta. Con el techo fijo, la mancha que sale de la gramática se agolpa entre
    // el 16% y el 32%, así que al bajar los topes declarados el 9% de las piezas no
    // podía cumplirlos por mucho que se retejiera — no había ningún candidato ligero
    // que encontrar. Tirándola por candidato, el bucle de reintentos BUSCA de verdad
    // sobre este eje: si el tipo pide una obra que respire, aparece una plancha más
    // fina. Y de paso la familia gana la variación que le faltaba, que es la que hay
    // entre una pieza cortada a hacha y otra cortada a cuchilla.
    const esc = params.cuerpo ? params.cuerpo : rng.range(0.70, 1.14);
    // Niveles de anchura, geométricos. Se calculan aquí y no como constante
    // porque dependen del lado corto: la escala es de la hoja, no del px.
    const wmax = S * W_MAX * esc;
    const niveles = [];
    for (let i = 0; i < NIVELES; i++) {
      niveles.push(S * W_MIN * Math.pow(wmax / (S * W_MIN), i / (NIVELES - 1)));
    }

    const my = H * MARGEN_Y;
    const alto = H - my * 2;
    const k = params.estratos ? params.estratos : rng.int(t.estratos[0], t.estratos[1]);

    // GRAVEDAD. Los estratos no se reparten a partes iguales: se apiñan hacia un
    // borde con exponente, y el hueco que dejan enfrente es la RESERVA. Chillida
    // titula una serie entera 'Gravitaciones'; el peso cae hacia un lado y la
    // hoja se lee por lo que queda libre.
    const grav = params.gravedad ? params.gravedad : (rng.bool(0.5) ? 'N' : 'S');
    const p = rng.range(1.25, 2.1);
    const ys = [];
    for (let j = 0; j < k; j++) {
      // Con UN estrato la gravedad no tiene nada que repartir, así que no se le
      // aplica el exponente: aplicándoselo, un u de 0,30 con p de 2,1 caía en 0,076
      // y la única masa de la pieza se pegaba al borde de arriba dejando tres cuartos
      // de hoja vacíos — que no es una reserva, es una pieza sin centro.
      if (k === 1) { ys.push(my + rng.range(0.28, 0.72) * alto); continue; }
      const u = (j + 0.5) / k;
      const v = grav === 'N' ? Math.pow(u, p) : 1 - Math.pow(1 - u, p);
      ys.push(my + v * alto);
    }
    // Hueco vertical de cada estrato: hasta el vecino, nunca más.
    const banda = [];
    for (let j = 0; j < k; j++) {
      const arr = j > 0 ? ys[j] - ys[j - 1] : (ys[j] - my) * 2;
      const aba = j < k - 1 ? ys[j + 1] - ys[j] : (my + alto - ys[j]) * 2;
      banda.push(min(arr, aba) * 0.5 * BANDA);
    }

    // La RESERVA es una esquina: el lado por el que el estrato más cercano a ella
    // NO llega. Es el único sitio donde la obra renuncia a cruzar la hoja, y por
    // eso el vacío tiene dónde acumularse.
    const lado = rng.bool(0.5) ? 'E' : 'O';
    const jRes = grav === 'N' ? k - 1 : 0;
    const reserva = (grav === 'N' ? 'S' : 'N') + lado;

    // JERARQUÍA. Uno de los estratos es el PROTAGONISTA: escala desplazada arriba,
    // y se queda con la mayoría de los lazos y los muñones. Los demás son ecos.
    const prot = rng.int(0, k - 1);

    const cuerpos = [];
    const chains = [];
    for (let j = 0; j < k; j++) {
      let X0 = -W * SANGRE, X1 = W * (1 + SANGRE);
      // El estrato de la reserva muere dentro del cuadro por su lado.
      if (j === jRes && k > 1) {
        if (lado === 'E') X1 = W * rng.range(0.55, 0.86);
        else              X0 = W * rng.range(0.14, 0.45);
      }
      // La ventana de niveles: el protagonista arriba de la escala y los ecos UNO O
      // DOS niveles por debajo, nunca en el suelo de la escala. Dejándolos caer al
      // nivel 1 salían gusanos: una banda de 6 px que cruza la hoja entera no es un
      // eco de la masa, es un pelo — y con dos ecos así la pieza se quedaba sin
      // suceso. En la referencia hasta la masa más callada tiene cuerpo.
      const alto0 = NIVELES - 1 - VENTANA;
      const base = j === prot ? alto0 : max(1, alto0 - rng.int(1, 2));
      const ch = estrato(rng, X0, X1, ys[j], banda[j], niveles, rng.bool(0.5) ? 1 : -1,
                         base, base + VENTANA, my, H - my);
      chains.push(ch);
      cuerpos.push(ch);
    }
    // Dos de cada tres lazos y muñones caen en el protagonista: el accidente se
    // concentra donde ya hay masa. Repartido a partes iguales, la jerarquía de
    // grosor que acaba de establecerse se deshace.
    const cual = () => (k > 1 && rng.bool(0.66)) ? prot : rng.int(0, k - 1);
    // Un foco por estrato, tirado antes de los lazos para que no dependa de ellos.
    const focos = chains.map(c => rng.int(1, max(1, c.length - 2)));

    // PUENTES. Dos entre el mismo par encierran suelo: el ojo es la consecuencia
    // de la soldadura, no un objeto que se dibuje.
    const nP = params.puentes != null ? params.puentes : rng.int(t.puentes[0], t.puentes[1]);
    let puentes = 0;
    if (k > 1) {
      for (let n = 0; n < nP; n++) {
        const j = rng.int(0, k - 2);
        const a = chains[j], b = chains[j + 1];
        const lo = max(min(a[0].x, a[a.length - 1].x), min(b[0].x, b[b.length - 1].x));
        const hi = min(max(a[0].x, a[a.length - 1].x), max(b[0].x, b[b.length - 1].x));
        if (hi - lo < W * 0.08) continue;
        const pu = puente(rng, a, b, rng.range(lo + (hi - lo) * 0.06, hi - (hi - lo) * 0.06), niveles);
        if (pu) { cuerpos.push(pu); puentes++; }
      }
    }

    // LAZOS. Van DESPUÉS de los puentes y ANTES de los muñones a propósito: el
    // lazo es la fuente principal de ojos, así que se tira sobre el tronco limpio
    // —sin muñones que le estorben la elección de vértices— y el muñón, que no
    // cierra nada, se pone al final sobre lo que haya.
    const nL = params.lazos != null ? params.lazos : rng.int(t.lazos[0], t.lazos[1]);
    let lazos = 0;
    for (let n = 0; n < nL; n++) {
      const lz = lazo(rng, chains[cual()], S, niveles);
      if (lz) { cuerpos.push(lz); lazos++; }
    }

    // MUÑONES. Solo desde masa: un muñón que sale de un vértice de nivel 0 o 1 es
    // un pelo pegado al dibujo, no un gesto. Ahí se descarta en vez de adelgazarlo.
    const nM = params.munones != null ? params.munones : rng.int(t.munones[0], t.munones[1]);
    let munones = 0;
    for (let n = 0; n < nM; n++) {
      const ch = chains[cual()];
      if (ch.length < 3) continue;
      const mu = munon(rng, ch, S, niveles, focos[chains.indexOf(ch)]);
      if (mu) { cuerpos.push(mu); munones++; }
    }

    const med = medir(cuerpos, W, H);
    // Rango de niveles usado: la modulación real del cuerpo, que es el rasgo que
    // separa esta familia de TRZS.
    let lvMin = NIVELES, lvMax = 0;
    for (const ch of chains) for (const v of ch) {
      if (v.lv == null) continue;
      if (v.lv < lvMin) lvMin = v.lv;
      if (v.lv > lvMax) lvMax = v.lv;
    }
    return { cuerpos, chains, k, prot, puentes, lazos, munones, grav, reserva, niveles, esc,
             ojos: med.ojos, mancha: med.mancha,
             modulacion: lvMax >= lvMin ? lvMax - lvMin : 0 };
  }

  // Cuánto se sale un candidato de lo que su tipo declara. Cero es cumplir.
  // No es un booleano porque con seeds difíciles ningún candidato cumple, y
  // entonces hay que quedarse con el que menos incumple — no con el primero.
  function falta(c, t) {
    const n = c.ojos.length;
    const fo = n < t.ojos[0] ? t.ojos[0] - n : n > t.ojos[1] ? n - t.ojos[1] : 0;
    const m = c.mancha;
    const fm = m < t.mancha[0] ? (t.mancha[0] - m) / t.mancha[0]
             : m > t.mancha[1] ? (m - t.mancha[1]) / t.mancha[1] : 0;
    // La modulación no la declara el tipo: la exige la familia. Un cuerpo que se
    // mueve menos de dos niveles es una cinta de TRZS sin su incisión, o sea nada.
    const fmod = c.modulacion < 2 ? (2 - c.modulacion) : 0;
    return fo + fm * 2 + fmod * 0.6;
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  // opts: { palettes, locked, lockedIdx, params:{ tipo, estratos, puentes,
  //         munones, cuerpo, gravedad, filo, bg, bgProbs, field, grainScale } }
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;
    const dd = dadosColor(rng);
    let rol = rolesFor(colors, dd);

    // 1. El campo. Con 'square' la obra se compone cuadrada y se centra: el
    //    pliego y el campo son dos decisiones.
    const S = min(W, H);
    const cuad = E.fieldMode(params) === 'square';
    const AW = cuad ? S : W, ox = (W - AW) / 2;

    // EL CAMPO NORMALIZADO. La composición NO se genera en píxeles: se genera en un
    // campo cuyo lado corto vale 1 y cuyo lado largo es la proporción NOMINAL del
    // formato, y solo al dibujar se multiplica por el lado corto real.
    //
    // No es elegancia, es corrección. Generando en píxeles, 1075×760 y 9933×7016 son
    // el mismo 'horizontal' pero sus cocientes son 1,41447 y 1,41576, así que la
    // geometría normalizada difería en la cuarta cifra — y como 'medir' ELIGE el
    // candidato, un vacío al filo de cerrarse caía de un lado en pantalla y del otro
    // a 300 dpi. Medido: el conteo de ojos cambiaba en el 20% de las seeds entre un
    // tamaño y otro, y con él la rareza de la pieza. Generando normalizado, la misma
    // seed en el mismo formato da la MISMA composición a cualquier resolución, que es
    // el contrato de la casa.
    const q = E.nominalAspect(max(AW, H), min(AW, H));
    const fw = AW >= H ? q : 1, fh = AW >= H ? 1 : q;

    // 2. El tipo, y los candidatos. Declarar y comprobar: se traman varios con el
    //    mismo seed y se queda el que menos se sale de lo declarado. Con el mismo
    //    seed el orden de las tiradas es fijo, así que esto sigue siendo
    //    determinista aunque el número de candidatos cambie de un tipo a otro.
    const tipo = params.tipo || rng.weighted(TIPO_NAMES.map(n => ({ n, prob: TIPOS[n].prob }))).n;
    // El filo es la HERRAMIENTA, no el tejido: se tira una vez por pieza y fuera del
    // bucle de candidatos, porque cambiar de pincel no puede cambiar la composición.
    const filoName = params.filo || rng.weighted(FILO_NAMES.map(n => ({ n, prob: FILOS[n].prob }))).n;
    const filo = FILOS[filoName] || FILOS.pincel;
    const t = TIPOS[tipo];
    let best = null, bestF = Infinity;
    for (let i = 0; i < REINTENTOS; i++) {
      const c = tramar(new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0), fw, fh, tipo, params);
      const f = falta(c, t);
      if (f < bestF) { bestF = f; best = c; }
      if (f === 0) break;
    }

    // 3. El acoplamiento de la inversión, y solo entonces el suelo. El fondo se
    //    pinta DESPUÉS de tramar porque la decisión de invertir depende de cuánta
    //    masa hay, y eso no se sabe hasta medirla. El dibujo no se mueve: el
    //    reparto de color se recalcula con la misma tirada.
    if (rol.inv && best.mancha < INV_MIN_MANCHA) rol = rolesFor(colors, { inv: false, crudo: dd.crudo });

    const bg = E.pickBg(seed, params, BG_GRADIENT);
    if (bg === 'gradient') {
      // Stream propio, como en el resto de la casa: cambiar el fondo no puede mover
      // la masa.
      E.drawMeshGradient(ctx, W, H, colors, new E.Rng(seed ^ 0xDEADBEEF));
    } else {
      ctx.fillStyle = rol.suelo;
      ctx.fillRect(0, 0, W, H);
    }

    // 4. El cuerpo. UNA sola llamada a fill(): la soldadura no se dibuja, es la
    //    consecuencia de que todo esté en el mismo trazado. Ahí es donde esta
    //    obra se separa de TRZS — no hay orden de pintado porque no hay
    //    profundidad que ordenar.
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(S, S);   // del campo normalizado al pliego
    // La segunda tinta, cuando la hay, se lleva UN estrato entero. No medio
    // cuerpo, no un degradado: un cuerpo. Es raro a propósito.
    const dos = rol.otra && rng.bool(0.14) && best.chains.length > 1;
    const jOtra = dos ? rng.int(0, best.chains.length - 1) : -1;
    const suyos = dos ? new Set([best.chains[jOtra]]) : null;

    // La semilla del filo va por CUERPO (índice + seed), no por pieza: si todos
    // compartieran ruido, dos cuerpos paralelos ondularían a la vez y se leería el
    // patrón en vez del pincel.
    ctx.beginPath();
    best.cuerpos.forEach((ch, i) => {
      if (!dos || !suyos.has(ch)) emitir(ctx, ch, filo, (seed ^ (0x2545F491 * (i + 1))) >>> 0);
    });
    ctx.fillStyle = rol.tinta;
    ctx.fill();

    if (dos) {
      ctx.beginPath();
      const i = best.cuerpos.indexOf(best.chains[jOtra]);
      emitir(ctx, best.chains[jOtra], filo, (seed ^ (0x2545F491 * (i + 1))) >>> 0);
      ctx.fillStyle = rol.otra;
      ctx.fill();
    }
    ctx.restore();

    // 5. Grano: el papel. unit lo mantiene del mismo tamaño físico a 300 dpi.
    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    // 6. Y la tinta, por encima del grano, tapando el diente del papel.
    if (grainScale > 0 && ALISO > 0) {
      ctx.save();
      ctx.globalAlpha = ALISO;
      ctx.translate(ox, 0);
      ctx.scale(S, S);
      ctx.beginPath();
      best.cuerpos.forEach((ch, i) => {
        if (!dos || !suyos.has(ch)) emitir(ctx, ch, filo, (seed ^ (0x2545F491 * (i + 1))) >>> 0);
      });
      ctx.fillStyle = rol.tinta;
      ctx.fill();
      if (dos) {
        ctx.beginPath();
        const i = best.cuerpos.indexOf(best.chains[jOtra]);
        emitir(ctx, best.chains[jOtra], filo, (seed ^ (0x2545F491 * (i + 1))) >>> 0);
        ctx.fillStyle = rol.otra;
        ctx.fill();
      }
      ctx.restore();
    }

    return { pal, rol, tipo, filo: filoName, bg, dos, falta: bestF,
             field: cuad ? 'square' : 'sheet',
             estratos: best.k, puentes: best.puentes, lazos: best.lazos, munones: best.munones,
             esc: best.esc,
             ojos: best.ojos, mancha: best.mancha, modulacion: best.modulacion,
             grav: best.grav, reserva: best.reserva };
  }

  // ── Traits ──────────────────────────────────────────────────────────────────
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);

    const n = res.ojos.length;
    // El ojo es el rasgo de la familia, así que su rareza está en los extremos:
    // una masa que no encierra nada (ciega) y una que encierra mucho (asedio)
    // son las dos cosas difíciles.
    const ojosLbl = n === 0 ? 'Ciego' : n === 1 ? 'Un ojo' : n + ' ojos';
    // Medido: 0:15% 1:35% 2:22% 3:12% 4:8% 5-7:8% 8+:2%.
    const ojosR = n === 0 ? 'uncommon' : n <= 2 ? 'common' : n <= 4 ? 'uncommon' : n <= 7 ? 'rare' : 'superrare';
    // Cuánto suelo queda atrapado: dos piezas con tres ojos no son lo mismo si
    // en una miden el 0,1% de la hoja y en la otra el 6%.
    const areaOjos = res.ojos.reduce((a, b) => a + b, 0);

    const m = res.mancha;
    const manchaLbl = m < 0.10 ? 'Leve' : m < 0.20 ? 'Justa' : m < 0.32 ? 'Cargada' : 'Asedio';
    const manchaR = m < 0.07 ? 'uncommon' : m >= 0.32 ? 'rare' : 'common';

    // Los cortes salen de la distribución MEDIDA sobre 400 tiradas, no de la
    // intuición: 2:6% 3:6% 4:13% 5:28% 6:47%. Con el corte anterior (desbocado a
    // partir de 3) el 88% de las piezas llevaba la misma etiqueta y encima la
    // rareza 'uncommon' — un rasgo que dice lo mismo casi siempre no es un rasgo, y
    // arrastraba la rareza global de la familia entera hacia abajo.
    const mod = res.modulacion;
    const cuerpoLbl = mod <= 3 ? 'Uniforme' : mod <= 5 ? 'Modulado' : 'Desbocado';
    const cuerpoR = mod <= 2 ? 'rare' : mod === 3 ? 'uncommon' : 'common';

    // Solo 'isla' es rara: 'estrato' y 'ramificado' salen uno de cada cuatro, que
    // es corriente. La rareza del tipo se la lleva el que asedia el suelo.
    const tipoR = res.tipo === 'isla' ? 'rare' : 'common';
    const tintaR = res.dos ? 'rare' : res.rol.inv ? 'uncommon' : 'common';
    const tintaLbl = (res.dos ? 'Dos tintas' : 'Una tinta') + (res.rol.inv ? ' · invertida' : '');
    const papelLbl = res.rol.inv ? 'Oscuro' : res.rol.papel === 'crudo' ? 'Crudo' : 'Blanco';

    // El filo NO entra en la rareza global, y es a propósito: es con qué está hecha
    // la marca, no qué salió en la tirada. Un rasgo que describe la herramienta se
    // enseña, pero no encarece la pieza.
    const filoR = 'common';

    const f = r => r === 'superrare' ? 0.18 : r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1;
    const s = prob * f(ojosR) * f(manchaR) * f(cuerpoR) * f(tipoR) * f(tintaR);
    const overall = s > 0.06 ? 'common' : s > 0.025 ? 'uncommon' : s > 0.008 ? 'rare' : s > 0.002 ? 'superrare' : 'legendary';

    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Type',    val: res.tipo, rarity: tipoR },
        { key: 'Strata',  val: res.estratos + ' · ' + res.puentes + ' welds · ' + res.lazos + ' loops', rarity: 'common' },
        { key: 'Voids',   val: ojosLbl + (n ? ' · ' + (areaOjos * 100).toFixed(1) + '%' : ''), rarity: ojosR },
        { key: 'Body',    val: cuerpoLbl + ' · ' + (mod + 1) + '/' + NIVELES, rarity: cuerpoR },
        { key: 'Ink',     val: manchaLbl + ' · ' + Math.round(m * 100) + '%', rarity: manchaR },
        { key: 'Gravity', val: res.grav === 'N' ? 'North' : 'South', rarity: 'common' },
        { key: 'Edge',    val: res.filo, rarity: filoR },
        { key: 'Paper',   val: papelLbl, rarity: res.rol.papel === 'crudo' ? 'uncommon' : 'common' },
        { key: 'Inks',    val: tintaLbl, rarity: tintaR },
      ],
      overall,
    };
  }

  // Los estratos recorren el ANCHO, así que la proporción no es indiferente. La
  // referencia de la que sale esta obra es un pliego VERTICAL: bandas cortas con
  // mucho aire arriba y abajo, que es lo que deja existir la reserva. El motor no
  // ofrece 'vertical' —lo quitó a propósito, porque en las obras de retículo era
  // la misma obra girada— y volver a ponerlo no es gratis: `nominalAspect` mide
  // W/min(W,H), que da 1,0 tanto en cuadrado como en vertical, así que no sabría
  // distinguirlos y EVOL lee la proporción para decidir cuántos estratos caben.
  // Queda apuntado como decisión del autor, no resuelto por lo bajo.
  const FORMATS = ['square', 'horizontal'];

  (global.HOKS = global.HOKS || {}).EVOL = { render, traits, TIPOS, FILOS, NIVELES, BG_GRADIENT, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
