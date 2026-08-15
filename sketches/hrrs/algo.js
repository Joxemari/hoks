/* HRRS — itzulera. Trazos independientes, relacionados a propósito.
 *
 * ── Lo que esta familia ES, después de dos lecturas equivocadas ──────────────
 *
 * Son TRAZOS INDEPENDIENTES. Ni se tocan, ni se funden, ni se bifurcan, ni se
 * entrelazan. Cada uno empieza, viaja y muere por su cuenta. Lo que hace la obra
 * no está DENTRO de un trazo: está en cómo se colocan unos respecto a otros.
 *
 * La composición es el asunto. Y es INTENCIONAL: las relaciones se declaran y
 * luego se construye el trazo que las cumple. No emergen de un paseo con pesos —
 * eso ya se probó y da confeti.
 *
 * Los dos errores que costaron dos versiones, escritos para no repetirlos:
 *
 *   1. LA TOPOLOGÍA QUE NO EXISTE. La segunda versión leyó horquillas: un cuerpo
 *      que se parte en dos y cada mitad sigue por su lado. No hay tal cosa. Lo que
 *      parece una bifurcación son dos trazos distintos que se acercan. Ni una sola
 *      unión en ninguna de las seis referencias.
 *      OJO CON EL REBOTE: de esto NO se sigue que un trazo no pueda doblarse sobre
 *      sí mismo. El PLIEGUE —la banda se da la vuelta y vuelve pegada, con el pelo
 *      por medio— pasa dentro de un trazo, no une nada, y es el movimiento más
 *      frecuente de las referencias. Al corregir el error 1 lo quité también, y con
 *      él se fue medio parecido. Un trazo se pliega; dos trazos no se juntan.
 *   2. EL GARABATO. Las dos versiones hacían trazos de ocho a quince quiebros
 *      deambulando. Los de la referencia son LARGOS Y SIMPLES: de uno a cinco
 *      quiebros en todo el recorrido, con una dirección clara de principio a fin.
 *      Un trazo cruza media hoja y se quiebra tres veces. Eso solo explicaba la
 *      mitad del no-parecido, y es independiente de todo lo demás.
 *
 * Y de ahí, el RECINTO tampoco es una figura: el blanco grande de las referencias
 * no está encerrado por un trazo cerrado, está rodeado por VARIOS trazos que casi
 * se cierran y dejan aberturas. Es un efecto de vecindad (`cerco`), no un lazo.
 *
 * ── Las dos medidas, que siguen ─────────────────────────────────────────────
 * Anchura W y canal g ≈ W/5. Y la única restricción dura: dos tramos que no son
 * vecinos están a W+g o más. Nunca se tocan.
 *
 * Canvas 2D puro, un solo stroke(), cabos a escuadra, bisel en los codos — el
 * bisel es lo que hace SUFICIENTE la distancia mínima (ver la nota del dibujo).
 *
 *   HOKS.HRRS.render(ctx, W, H, seed, opts) → { pal, tipo, ojos, ocupacion, … }
 *   HOKS.HRRS.traits(res)                   → { list:[…], overall }
 */
(function (global) {
  'use strict';
  const E = global.HOKS;

  const REF = 1000;
  const BG_GRADIENT = 0;          // el suelo es PLANO: figura/fondo lo necesita

  // ── El material ─────────────────────────────────────────────────────────────
  const W_MIN = 0.030, W_MAX = 0.058;      // × lado corto
  // El canal, medido con regla sobre las seis: banda 55 px y blanco 4 en el cartel
  // de Múnich (0,07), banda 30 y blanco 3 en la litografía de las siete bandas
  // (0,10), banda 14 y blanco 2 en las dos de papel hecho a mano (0,14). Es un PELO,
  // más fino de lo que decía el «1/5» de oído. Y es la medida que hace que el
  // acompañamiento se lea como material partido y no como dos rayas paralelas.
  const GAMMA = [0.08, 0.16];              // canal = W × gamma

  // ── El trazo: LARGO Y SIMPLE ────────────────────────────────────────────────
  // De uno a cinco quiebros en todo el recorrido. No es una preferencia: es lo
  // que separa un trazo de un garabato, y era la mitad del no-parecido.
  const QUIEBROS = [1, 5];
  // EL PLAN DE LONGITUDES, y es lo que le faltaba a la obra para tener interés.
  //
  // Declarar un rango y tirar de él da trazos TODOS IGUALES, y una hoja donde todo
  // pesa lo mismo no tiene dónde mirarse — es el «papel pintado» de EVOL. En las
  // referencias hay un trazo que cruza la hoja entera y otros cortos al lado.
  //
  // Y medido, el rango ni siquiera se cumplía: declarado 0,44…1,15, la mediana
  // COLOCADA salía 0,46 —el suelo— porque los trazos largos no caben y los cortos
  // sí, así que el filtro de la restricción escogía por mí. Sesgo de supervivencia.
  //
  // Se arregla con tres cosas juntas: el protagonista se coloca con la hoja vacía,
  // CRECE hasta donde cabe en vez de ser rechazado entero (`recortar`), y la caída
  // de los demás se mide desde LO QUE CONSIGUIÓ, no desde lo que se le pidió.
  //
  // Esto último es del autor y es el equilibrio de la familia: «si empiezas por una
  // línea y se va haciendo larga, el resto de la composición se adaptará a eso; sé
  // que se tiene que componer, no ser adaptativo, pero se puede balancear». Las
  // RELACIONES siguen declaradas y construidas —eso es componer—; lo que se adapta
  // es la ESCALA.
  //
  // Y el techo del protagonista lo ponía el marco, no la gramática: un trazo sólo
  // podía medir lo que cupiera DENTRO, así que la hoja recortaba la jerarquía
  // antes de que se viera. Desde que el sangrado es de verdad (ver más abajo) el
  // trazo puede medir más que el pliego y salirse — que es lo que hace en las
  // referencias: el brazo largo no termina, se va.
  const PROTA = [1.45, 2.40];               // lo que se le PIDE, × lado corto
  const CAIDA = [0.76, 0.91];               // cada trazo respecto al anterior
  // Y un SUELO de longitud: un trazo más corto que esto no es un trazo, es una
  // pizca. Salían al desplazar un trozo muy corto para el `paralelo`, y una hoja
  // con pizcas se lee como confeti — que es justo el defecto que costó la primera
  // versión entera.
  const LARGO_MIN = 0.20;
  // El reparto entre tramos es desigual —un tramo largo y dos cortos, no tres
  // iguales— porque tres tramos iguales leen como una grapa.
  const PESO_TRAMO = [0.35, 1.65];
  // Los giros son VIVOS: ni curvas ni quiebros de dos grados. Bimodal, como en
  // EVOL: el codo abierto (lo corriente) y el cerrado (el acento).
  const P_ABIERTO = 0.68;
  const GIRO_ABIERTO = [22, 62], GIRO_CERRADO = [70, 118];
  // El PLIEGUE: cuántas veces, de los sucesos de un trazo, la banda se vuelve sobre
  // sí misma. `phi` es el ángulo de entrada al pliegue: a 90° sale una uve cuadrada
  // (el cartel de Múnich), a 55° una uve tumbada (las siete bandas).
  const P_VOLTEA = 0.38;
  const VOLTEA_PHI = [52, 90];
  // La VIBRACIÓN es del filo y es del MATERIAL: constante dentro de una obra,
  // distinta entre obras. Es uno de los ejes que nombró el autor («otros vibran»),
  // y va por subdivisión del tramo, no por giro — un tramo vibrado sigue yendo
  // recto en conjunto.
  // Y va casi siempre: en las seis referencias no hay un solo tramo largo que vaya
  // recto. Era una moda entre dos —45% de las obras— y el autor lo dijo mirando:
  // «siempre tienen mucha más vibración, el trazo parece de lápiz, hecho a mano».
  //
  // El TECHO de 7,5° no es estético, es aritmético y hay que dejarlo donde está: dos
  // subdivisiones seguidas con desvío de signo contrario se separan hasta 2·amp, y
  // `obra.js` cuenta como quiebro todo giro de más de 15°. A 7,5 el temblor cabe
  // justo por debajo; subiéndolo, la obra limpia empieza a contarse de garabato y el
  // detector deja de medir lo que dice medir. Lo que sí sube es el SUELO.
  const P_VIBRA = 0.86;
  const VIB_AMP = [4.0, 7.5];              // grados por subdivisión
  const VIB_ONDA = [1.1, 2.6];             // × W · más fino: el filo, no la onda

  // LA GUBIA no tiene una anchura sola. Varía poco y despacio a lo largo del corte,
  // y esa variación es la mitad de que parezca hecho a mano. Es del material, así
  // que la amplitud es de la OBRA y la fase de cada trazo.
  // Sólo adelgaza: engordar cerraría el canal, que se mide contra W.
  const P_GUBIA = 0.82;
  const GUB_AMP = [0.05, 0.15];            // cuánto adelgaza como mucho, × W
  const GUB_FREQ = [3.0, 7.0];             // ondas por trazo

  // ── El campo ────────────────────────────────────────────────────────────────
  const MARGEN = 0.055;
  const ZONA = [0.52, 0.88];               // el lado de la zona de trabajo, × el del pliego
  // Sangrado: un trazo que se sale del cuadro. Es uno de los ejes nombrados, y
  // aquí es una decisión por trazo — pero CUÁNTOS se salen es del conjunto: hay
  // hojas enteras que no tocan el borde y hojas donde casi todo se va. Con una
  // probabilidad fija salían todas iguales, un par de sangrados por obra.
  //
  // Y era, además, lo que estaba limitando la longitud: con 0,09 el sangrado era
  // un roce del borde, así que el trazo largo seguía teniendo que caber. Ahora se
  // va de verdad, y el trazo puede ser más largo que la hoja.
  const P_SANGRA_OBRA = [0.15, 0.62];      // cuántos se salen, por obra
  const P_SECA = 0.30;                     // obras que no tocan el borde
  const SANGRE = 0.22;                     // cuánto se pasa, × lado corto

  // ── Las relaciones ──────────────────────────────────────────────────────────
  // Esto es la familia. Cada trazo nuevo (salvo el primero) se coloca CUMPLIENDO
  // una relación declarada con uno ya puesto. Los nombres son los que el autor
  // usó al mirar las referencias.
  //
  //   paralelo   dos trazos comparten dirección a distancia casi constante. Se
  //              construye por DESPLAZAMIENTO de un trozo del otro, que es la
  //              única manera de que el canal salga constante de verdad.
  //   abanico    arrancan cerca y se abren: misma dirección ±poco, y divergen.
  //   tangencia  se acercan a un mínimo PUNTUAL y se separan. El pelo blanco
  //              aparece en un punto, no a lo largo. Es lo contrario de paralelo.
  //   continua   el cabo de uno nace a un pelo del cabo del otro y SIGUE su
  //              dirección: el ojo lee una línea sola, y son dos.
  //   caboCabo   dos extremos se buscan sin tocarse.
  //   caboCuerpo un extremo muere junto al costado de otro.
  //   suelto     lejos de todo. YA NO SE SORTEA: se reserva para el primer trazo,
  //              que no tiene con quién relacionarse. Lo dijo el autor mirando las
  //              seis: «no hay ningún trazo totalmente independiente». Un trazo
  //              suelto no es una relación pobre, es un trazo que sobra.
  const RELS = ['paralelo', 'abanico', 'tangencia', 'continua', 'caboCabo', 'caboCuerpo', 'suelto'];
  // Las dos que hacen HAZ: son las que heredan el canal del grupo. Un cabo o una
  // tangencia no continúan un haz, lo tocan.
  const ACOMPANA = { paralelo: 1, abanico: 1 };
  // A qué distancia se considera cumplida cada relación, en canales D.
  //
  // MEDIDO SOBRE LAS SEIS REFERENCIAS, y esto era el error grande: cuando dos
  // bandas van juntas, lo blanco que queda entre ellas es SIEMPRE el pelo, y es el
  // mismo pelo de punta a punta. No hay ni un solo sitio en las seis donde dos
  // bandas se acompañen a dos canales de distancia. Con `paralelo` sorteando entre
  // 1 y 2,3 canales, una separación de 2,3·D deja un blanco de casi DOS anchuras:
  // eso ya no es acompañar, son dos rayas que van en la misma dirección. Por eso
  // salían tiras y no salía masa.
  //
  // El resto baja por lo mismo: un cabo que muere junto a otra banda muere PEGADO
  // —a un pelo— y no a tres canales. Lo único que sigue lejos es `suelto`, que es
  // la separación buscada y el contraste que hace legible lo demás.
  const SEP_PAR = [1.0, 1.15];             // paralelo: el pelo, y poco más
  const SEP_TAN = [1.0, 1.35];             // tangencia: el mínimo puntual
  const SEP_CABO = [1.0, 2.0];             // cabo contra cabo o cuerpo
  const SEP_SUELTO = [4.5, 11];            // suelto: lejos

  // ── Los tipos ───────────────────────────────────────────────────────────────
  // Un tipo es un REPARTO DE RELACIONES y un número de trazos. Nada más: no hay
  // topología que declarar porque no hay topología.
  //   n     — el TOTAL de trazos de la obra, cerco incluido. Que el cerco sumara
  //           aparte era un error de contabilidad con consecuencia visible: un
  //           `recinto` pedía 5–9 y salía con 8–14, y un `haz` 7–11 salía con
  //           7–14. Contadas las referencias, ninguna pasa de ocho: la 3 tiene
  //           siete tramos, la 4 seis, la 5 seis o siete, la 1 y la 2 rondan seis
  //           entre techo, patas y muñones. La obra no es un montón de rayas.
  //   cerco — cuántos de esos n se colocan rodeando un blanco sin cerrarlo. Es el
  //           «recinto» de las referencias 1 y 6, y es vecindad, no figura.
  const TIPOS = {
    // Refs 3 y 4: pocos trazos largos, tendidos, mucho paralelo y mucho aire.
    tendido: { prob: 0.26, n: [3, 5], cerco: [0, 0],
               w: { paralelo: 0.42, abanico: 0.20, tangencia: 0.06, continua: 0.20, caboCabo: 0.07, caboCuerpo: 0.05 } },
    // Refs 1 y 2: un cerco y trazos que lo acompañan.
    recinto: { prob: 0.30, n: [5, 8], cerco: [3, 4],
               w: { paralelo: 0.36, abanico: 0.11, tangencia: 0.06, continua: 0.17, caboCabo: 0.15, caboCuerpo: 0.15 } },
    // Ref 6: denso, muchos paralelos cortos engranados.
    haz:     { prob: 0.28, n: [5, 8], cerco: [0, 3],
               w: { paralelo: 0.50, abanico: 0.18, tangencia: 0.05, continua: 0.14, caboCabo: 0.06, caboCuerpo: 0.07 } },
    // El examen duro: pocos trazos y mucha separación. Sin relación no hay obra.
    disperso:{ prob: 0.16, n: [3, 5], cerco: [0, 0],
               w: { paralelo: 0.30, abanico: 0.14, tangencia: 0.16, continua: 0.16, caboCabo: 0.15, caboCuerpo: 0.09 } },
  };
  const TIPO_NAMES = Object.keys(TIPOS);

  const REINTENTOS = 7;           // candidatos de obra con el mismo seed
  const COLOCA = 26;              // intentos de colocar un trazo cumpliendo su relación
  const GRID = 170;
  const OJO_MIN = 0.0004;

  const hypot = Math.hypot, min = Math.min, max = Math.max, abs = Math.abs;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const RAD = Math.PI / 180;

  function pointSegDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    if (l2 < 1e-18) return hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function cruzan(ax, ay, bx, by, cx, cy, dx, dy) {
    const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx, dy);
    const d3 = o(cx, cy, dx, dy, ax, ay), d4 = o(cx, cy, dx, dy, bx, by);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  }
  function segSegDist(a, b) {
    if (cruzan(a[0], a[1], a[2], a[3], b[0], b[1], b[2], b[3])) return 0;
    return min(pointSegDist(a[0], a[1], b[0], b[1], b[2], b[3]),
               pointSegDist(a[2], a[3], b[0], b[1], b[2], b[3]),
               pointSegDist(b[0], b[1], a[0], a[1], a[2], a[3]),
               pointSegDist(b[2], b[3], a[0], a[1], a[2], a[3]));
  }
  function segsDe(pts) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) out.push([pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y]);
    return out;
  }
  function largoDe(pts) {
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) L += hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    return L;
  }
  // Distancia mínima entre dos trazos. Como son independientes, TODOS los pares
  // de tramos cuentan: no hay vecindad que eximir entre trazos distintos.
  function distTrazos(A, B) {
    let d = Infinity;
    for (const a of A) for (const b of B) { const t = segSegDist(a, b); if (t < d) d = t; }
    return d;
  }
  // Y dentro de un mismo trazo se miden los tramos NO adyacentes: un trazo que se
  // cierra sobre sí mismo también se tocaría, y eso tampoco vale.
  function seCorta(segs, D) {
    for (let i = 0; i < segs.length; i++)
      for (let j = i + 2; j < segs.length; j++)
        if (segSegDist(segs[i], segs[j]) < D) return true;
    return false;
  }

  // ── Construir un trazo ──────────────────────────────────────────────────────
  // Largo y simple: `nq` sucesos, tramos de longitud desigual, giros vivos. La
  // vibración subdivide cada tramo sin cambiar su dirección de conjunto.
  //
  // Y un suceso puede ser un GIRO o un PLIEGUE, que es el movimiento más propio de
  // la referencia y el que faltaba: la banda se da la vuelta y vuelve pegada a sí
  // misma, con el pelo por medio. Está en las tres que el autor mandó en grande —el
  // cartel de Múnich es casi sólo pliegues, y las siete bandas se doblan en uve—.
  //
  // Lo había quitado yo, y por una lectura mal hecha: al corregirme «trazos
  // independientes que nunca se juntan» entendí que tampoco podían doblarse. Pero
  // el pliegue pasa DENTRO de un trazo y no toca nada; es la horquilla, y sigue
  // cumpliendo la regla — porque los dos brazos se separan por CONSTRUCCIÓN:
  // girando φ, recorriendo D/sen(φ) y girando 180−φ del mismo lado, se sale
  // antiparalelo a exactamente D. Esa fórmula ya estaba escrita en este README como
  // consecuencia de la regla 3; lo que faltaba era usarla.
  function trazar(rng, x, y, dir, largo, nq, vib, D) {
    const n = nq + 1;
    const pesos = [];
    let tot = 0;
    for (let i = 0; i < n; i++) { const w = rng.range(PESO_TRAMO[0], PESO_TRAMO[1]); pesos.push(w); tot += w; }
    const pts = [{ x, y }];
    let cx = x, cy = y, cd = dir, lado = rng.bool(0.5) ? 1 : -1;
    const avanza = (L, ang) => { cx += Math.cos(ang * RAD) * L; cy += Math.sin(ang * RAD) * L; pts.push({ x: cx, y: cy }); };
    for (let i = 0; i < n; i++) {
      const L = largo * pesos[i] / tot;
      if (vib) {
        // el filo tiembla: subdivisiones cortas con desvío alterno, así que el
        // tramo sigue yendo recto en conjunto
        const k = max(1, Math.round(L / vib.onda));
        for (let j = 0; j < k; j++)
          avanza(L / k, cd + (rng.bool(0.5) ? 1 : -1) * rng.range(vib.amp * 0.35, vib.amp));
      } else {
        avanza(L, cd);
      }
      if (i < n - 1) {
        if (D && rng.bool(P_VOLTEA)) {
          // EL PLIEGUE. Dos giros del mismo lado con el brazo justo por medio. El
          // 1,02 es holgura de coma flotante, no un umbral: a exactamente D la
          // comprobación de auto-corte cae en el filo y a veces sale 0,9999999·D.
          const phi = rng.range(VOLTEA_PHI[0], VOLTEA_PHI[1]);
          const brazo = D * 1.02 / Math.sin(phi * RAD);
          if (rng.bool(0.5)) lado = -lado;
          cd += lado * phi;
          avanza(brazo, cd);
          cd += lado * (180 - phi);
        } else {
          // los giros alternan de lado la mayoría de las veces: dos giros seguidos
          // del mismo lado dan una espiral, y eso no está en la referencia
          if (rng.bool(0.72)) lado = -lado;
          const mag = rng.bool(P_ABIERTO) ? rng.range(GIRO_ABIERTO[0], GIRO_ABIERTO[1])
                                          : rng.range(GIRO_CERRADO[0], GIRO_CERRADO[1]);
          cd += lado * mag;
        }
      }
    }
    return pts;
  }

  // ── La banda ────────────────────────────────────────────────────────────────
  // El contorno de un trazo, listo para rellenar. Es la construcción del BISEL
  // hecha a mano: por cada tramo, sus dos aristas paralelas; en cada vértice, los
  // dos puntos —uno de cada tramo— unidos por la cuerda. Ni un punto pasa de w/2
  // del eje, que es lo que hace suficiente la distancia mínima.
  //
  // `gubia` es la variación de anchura: sutil, lenta, y SIEMPRE HACIA ABAJO. Hacia
  // arriba cerraría el canal —la regla se mide contra W— así que la banda adelgaza
  // y nunca engorda. Dos senos de periodos primos entre sí para que no se lea la
  // onda; el filo de una gubia no es periódico.
  function anchoEn(u, W, gub) {
    if (!gub) return W;
    const a = Math.sin(u * gub.f1 + gub.p1), b = Math.sin(u * gub.f2 + gub.p2);
    return W * (1 - gub.amp * (0.5 + 0.25 * (a + b)));   // 0 … amp por debajo de W
  }
  function banda(ctx, pts, W, gub) {
    const n = pts.length;
    if (n < 2) return;
    const nx = [], ny = [], L = [];
    let tot = 0;
    for (let i = 0; i < n - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const m = hypot(dx, dy) || 1e-9;
      nx.push(-dy / m); ny.push(dx / m); L.push(m); tot += m;
    }
    // media anchura en cada vértice, por longitud de arco recorrida
    const h = [];
    { let acc = 0;
      for (let i = 0; i < n; i++) { h.push(anchoEn(tot > 0 ? acc / tot : 0, W, gub) / 2); if (i < n - 1) acc += L[i]; } }
    const izq = [], der = [];
    for (let i = 0; i < n - 1; i++) {
      izq.push({ x: pts[i].x + nx[i] * h[i],         y: pts[i].y + ny[i] * h[i] });
      izq.push({ x: pts[i + 1].x + nx[i] * h[i + 1], y: pts[i + 1].y + ny[i] * h[i + 1] });
      der.push({ x: pts[i].x - nx[i] * h[i],         y: pts[i].y - ny[i] * h[i] });
      der.push({ x: pts[i + 1].x - nx[i] * h[i + 1], y: pts[i + 1].y - ny[i] * h[i + 1] });
    }
    ctx.moveTo(izq[0].x, izq[0].y);
    for (let i = 1; i < izq.length; i++) ctx.lineTo(izq[i].x, izq[i].y);
    for (let i = der.length - 1; i >= 0; i--) ctx.lineTo(der[i].x, der[i].y);
    ctx.closePath();
  }

  // Desplazar un trazo en paralelo: cada vértice por su bisectriz, así el canal
  // sale CONSTANTE de verdad. Es lo que hace la relación `paralelo`; con dos
  // trazos generados aparte, la distancia varía y el canal deja de ser una medida.
  function desplazar(pts, sep, lado) {
    const n = pts.length, out = [];
    const nx = [], ny = [];
    for (let i = 0; i < n - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const m = hypot(dx, dy) || 1e-9;
      nx.push(-dy / m * lado); ny.push(dx / m * lado);
    }
    for (let i = 0; i < n; i++) {
      let mx, my, esc = 1;
      if (i === 0) { mx = nx[0]; my = ny[0]; }
      else if (i === n - 1) { mx = nx[n - 2]; my = ny[n - 2]; }
      else {
        const sx = nx[i - 1] + nx[i], sy = ny[i - 1] + ny[i], m = hypot(sx, sy);
        if (m < 1e-6) { mx = nx[i]; my = ny[i]; }
        else { mx = sx / m; my = sy / m; esc = min(3.2, 1 / max(mx * nx[i] + my * ny[i], 1e-3)); }
      }
      out.push({ x: pts[i].x + mx * sep * esc, y: pts[i].y + my * sep * esc });
    }
    return out;
  }
  // Un trozo del trazo, de `a` a `b` en fracción de su longitud.
  function trozo(pts, a, b) {
    const L = largoDe(pts), s0 = L * min(a, b), s1 = L * max(a, b);
    const out = []; let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      const t0 = acc, t1 = acc + seg;
      const en = t => ({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * ((t - t0) / (seg || 1)),
                         y: pts[i].y + (pts[i + 1].y - pts[i].y) * ((t - t0) / (seg || 1)) });
      if (t1 >= s0 && t0 <= s1) {
        if (!out.length) out.push(en(max(s0, t0)));
        out.push(en(min(s1, t1)));
      }
      acc = t1;
    }
    return out.length >= 2 ? out : pts.slice(0, 2);
  }
  function dirEn(pts, i) {
    const a = pts[clamp(i, 0, pts.length - 2)], b = pts[clamp(i + 1, 1, pts.length - 1)];
    return Math.atan2(b.y - a.y, b.x - a.x) / RAD;
  }
  function puntoEn(pts, f) {
    const L = largoDe(pts) * clamp(f, 0, 1);
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      if (acc + seg >= L) {
        const t = seg < 1e-12 ? 0 : (L - acc) / seg;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
                 y: pts[i].y + (pts[i + 1].y - pts[i].y) * t, dir: dirEn(pts, i) };
      }
      acc += seg;
    }
    const n = pts.length;
    return { x: pts[n - 1].x, y: pts[n - 1].y, dir: dirEn(pts, n - 2) };
  }

  // ── Colocar un trazo cumpliendo una relación ────────────────────────────────
  // Devuelve los puntos, o null si no cabe. La relación se DECLARA y aquí se
  // construye la geometría que la cumple — no se espera a que salga sola.
  function colocar(rng, ctx, rel, obj, largoRel, sangra, sepGrupo) {
    const { D, W } = ctx;
    const S = min(ctx.fw, ctx.fh);
    const nq = rng.int(QUIEBROS[0], QUIEBROS[1]);
    const largo = S * largoRel;

    if (rel === 'paralelo' && obj) {
      // EL ACOMPAÑAMIENTO ES DE UNA SECCIÓN, NO DEL TRAZO. Es lo que el autor vio
      // al final y explica por qué la hoja seguía sin ser un cuerpo: «casi todas
      // las líneas se paralelizan en algún momento, en alguna sección; a veces una
      // horizontal que da contra otra vertical; no hay ningún trazo totalmente
      // independiente, y eso genera un cuerpo en la zona de mayor intersección».
      //
      // Hasta aquí, un trazo `paralelo` era ENTERO el desplazamiento de otro: dos
      // rayas gemelas de punta a punta. Se lee como una pareja, no como un cuerpo.
      // Ahora el trazo se compone de tres partes —viene libre, ACOMPAÑA un tramo, y
      // sigue libre por su cuenta— así que un mismo trazo puede entrar en el nudo,
      // recorrerlo pegado a otro y salir por el otro lado a hacer otra cosa.
      const Lo = largoDe(obj);
      // el tramo acompañado es una PARTE del largo pedido, no todo
      const acomp = largo * rng.range(0.30, 0.72);
      const fr = clamp(acomp / (Lo || 1), 0.16, 1);
      // y se busca donde está el CUERPO: el trozo del otro más cercano al núcleo,
      // que es como se amontonan los acompañamientos en vez de repartirse.
      const c = ctx.nucleo, aMax = max(0, 1 - fr);
      let a = rng.range(0, aMax);
      if (c && aMax > 0) {
        let mejor = a, dMin = Infinity;
        for (let k = 0; k <= 6; k++) {
          const t = aMax * k / 6, p = puntoEn(obj, t + fr / 2);
          const d = hypot(p.x - c.x, p.y - c.y);
          if (d < dMin) { dMin = d; mejor = t; }
        }
        a = clamp(mejor + rng.range(-0.08, 0.08), 0, aMax);
      }
      const sub = trozo(obj, a, min(a + fr, 1));
      if (sub.length < 2) return null;
      // LA SEPARACIÓN ES DEL GRUPO, no del trazo. La pone `poner` y aquí sólo se
      // usa: dentro de un haz, los tres o cuatro canales son EL MISMO, y es lo que
      // hace que el haz se lea como una cosa y no como tres parejas.
      const medio = desplazar(sub, sepGrupo, rng.bool(0.5) ? 1 : -1);
      if (medio.length < 2) return null;
      const sobra = max(0, largo - largoDe(medio));
      if (sobra < ctx.S * 0.04) return medio;
      // lo que sobra se reparte entre lo que viene ANTES y lo que sigue DESPUÉS
      const fPre = rng.range(0, 1);
      const dIn = dirEn(medio, 0), dOut = dirEn(medio, medio.length - 2);
      let pts = medio;
      const Lpost = sobra * (1 - fPre);
      if (Lpost > ctx.S * 0.03) {
        const p = medio[medio.length - 1];
        const post = trazar(rng, p.x, p.y, dOut + rng.range(-14, 14), Lpost,
                            max(0, nq - 1), ctx.vib, D);
        pts = pts.concat(post.slice(1));
      }
      const Lpre = sobra * fPre;
      if (Lpre > ctx.S * 0.03) {
        // se traza hacia atrás desde el arranque y se le da la vuelta
        const p = medio[0];
        const pre = trazar(rng, p.x, p.y, dIn + 180 + rng.range(-14, 14), Lpre,
                           max(0, nq - 1), ctx.vib, D);
        pre.reverse();
        pts = pre.slice(0, -1).concat(pts);
      }
      return pts;
    }
    if (rel === 'abanico' && obj) {
      // Arrancan cerca y se abren: mismo punto de partida ±poco, dirección ±poco.
      // Arrancan al pelo, como el paralelo — en las referencias las bandas que se
      // abren SALEN DE UN NUDO, no de dos canales de distancia.
      const f = rng.bool(0.5) ? rng.range(0, 0.18) : rng.range(0.82, 1);
      const p = puntoEn(obj, f);
      const lado = rng.bool(0.5) ? 1 : -1;
      const sep = sepGrupo;
      const nrm = p.dir + 90 * lado;
      return trazar(rng, p.x + Math.cos(nrm * RAD) * sep, p.y + Math.sin(nrm * RAD) * sep,
                    p.dir + lado * rng.range(7, 26), largo, nq, ctx.vib, D);
    }
    if (rel === 'tangencia' && obj) {
      // Se acercan a un mínimo PUNTUAL y se separan: cruzan en ángulo, y el punto
      // de paso se pone a la distancia del canal. Lo contrario de paralelo.
      const p = puntoEn(obj, rng.range(0.15, 0.85));
      const lado = rng.bool(0.5) ? 1 : -1;
      const sep = D * rng.range(SEP_TAN[0], SEP_TAN[1]);
      const nrm = p.dir + 90 * lado;
      const cx = p.x + Math.cos(nrm * RAD) * sep, cy = p.y + Math.sin(nrm * RAD) * sep;
      const ang = p.dir + rng.range(22, 58) * (rng.bool(0.5) ? 1 : -1);
      // el punto de tangencia cae DENTRO del trazo, no en su cabo
      const atras = largo * rng.range(0.25, 0.6);
      return trazar(rng, cx - Math.cos(ang * RAD) * atras, cy - Math.sin(ang * RAD) * atras,
                    ang, largo, nq, ctx.vib, D);
    }
    if (rel === 'continua' && obj) {
      // LA CONTINUACIÓN. Es del autor, y es la que faltaba: «una línea y otra pueden
      // llegar a buscarse en el inicio y el fin; sus dos sistemas se buscan, y eso da
      // una composición visual como continuación, pero realmente son los trazos».
      //
      // El cabo del nuevo nace a un pelo del cabo del otro y SIGUE SU DIRECCIÓN, con
      // el quiebro que quiera. El ojo lee una sola línea que atraviesa la hoja; lo
      // que hay son dos trazos que ni se tocan. Es la diferencia con `caboCabo`, que
      // busca el cabo del otro para MORIR a su lado, no para seguirlo.
      const alFinal = rng.bool(0.5);
      const p = puntoEn(obj, alFinal ? 1 : 0);
      // hacia donde apunta el otro EN ESE CABO, no una dirección cualquiera
      const sigue = alFinal ? p.dir : p.dir + 180;
      const sep = D * rng.range(1.0, 1.5);
      const x0 = p.x + Math.cos(sigue * RAD) * sep, y0 = p.y + Math.sin(sigue * RAD) * sep;
      return trazar(rng, x0, y0, sigue + rng.range(-34, 34), largo, nq, ctx.vib, D);
    }
    if ((rel === 'caboCabo' || rel === 'caboCuerpo') && obj) {
      // Un extremo mío muere cerca de un extremo suyo (o de su costado), sin
      // tocarlo. El cabo es un suceso de la composición, no un resto.
      const f = rel === 'caboCabo' ? (rng.bool(0.5) ? 0 : 1) : rng.range(0.2, 0.8);
      const p = puntoEn(obj, f);
      const sep = D * rng.range(SEP_CABO[0], SEP_CABO[1]);
      const hacia = rng.range(0, 360);
      const x0 = p.x + Math.cos(hacia * RAD) * sep, y0 = p.y + Math.sin(hacia * RAD) * sep;
      // sale ALEJÁNDOSE, si no se echa encima
      return trazar(rng, x0, y0, hacia + rng.range(-52, 52), largo, nq, ctx.vib, D);
    }
    // suelto, o primer trazo: en cualquier sitio con aire DENTRO DE LA ZONA. Si
    // sangra, puede ARRANCAR fuera — el trazo entra desde detrás del marco en vez
    // de nacer dentro y morir en el borde. Es la mitad que faltaba del sangrado:
    // hasta ahora todos se iban, ninguno llegaba.
    const h = sangra ? -ctx.S * SANGRE + W / 2 : ctx.mg + W / 2 + 1e-4;
    const z = ctx.zona;
    return trazar(rng, rng.range(max(h, z.x0), min(ctx.fw - h, z.x1)),
                       rng.range(max(h, z.y0), min(ctx.fh - h, z.y1)),
                  rng.range(0, 360), largo, nq, ctx.vib, D);
  }

  // ¿Cabe? Nunca se tocan: W+g contra todos los demás, y sin cortarse a sí mismo.
  // El sangrado es la excepción declarada — un trazo puede salirse del cuadro,
  // pero entonces se recorta contra el sangrado y sigue midiendo igual.
  //
  // Va partida en dos, y la partición es lo que hace posible que el trazo CREZCA
  // en vez de ser aceptado o rechazado entero (ver `recortar`): `cabeDuro` es
  // MONÓTONA —si un tramo de trazo no cabe, ningún trazo más largo que lo contenga
  // cabe tampoco— y por eso se puede buscar el punto exacto donde deja de caber.
  // La regla de lo visible NO es monótona (un trazo más largo se ve más), así que
  // se comprueba aparte, una vez, al final.
  function cabeDuro(pts, ctx, sangra) {
    const h = ctx.W / 2, m = ctx.mg + h;
    // SANGRE mide el FILO DE LA TINTA, no el eje: si no, un trazo de gubia ancha
    // se pasa media anchura mas de lo declarado y el detector lo canta.
    const lim = sangra ? -ctx.S * SANGRE + h : m;
    for (const p of pts) {
      if (p.x < lim || p.x > ctx.fw - lim || p.y < lim || p.y > ctx.fh - lim) return false;
    }
    const segs = segsDe(pts);
    if (seCorta(segs, ctx.D)) return false;
    for (const t of ctx.trazos) if (distTrazos(segs, t.segs) < ctx.D - 1e-9) return false;
    return true;
  }

  // Con sangrado, lo que tiene que quedar dentro es TRAZO VISIBLE, medido en
  // longitud. Contando vértices no valía: sin vibración un tramo recto de media
  // hoja son dos puntos y uno vibrado son treinta, así que la cuenta hablaba de la
  // subdivisión y no del dibujo. Lo que no se puede es que sólo asome una punta por
  // la esquina — eso es suciedad, no sangrado.
  function bastaVisto(pts, ctx, sangra) {
    if (!sangra) return true;
    const m = ctx.mg + ctx.W / 2;
    let dentro = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const L = hypot(dx, dy); if (L <= 0) continue;
      const ns = max(2, Math.ceil(L / (ctx.S * 0.01)));
      let visto = 0;
      for (let s = 0; s < ns; s++) {
        const u = (s + 0.5) / ns, x = pts[i].x + dx * u, y = pts[i].y + dy * u;
        if (x > m && x < ctx.fw - m && y > m && y < ctx.fh - m) visto++;
      }
      dentro += L * visto / ns;
    }
    return dentro >= ctx.S * LARGO_MIN;
  }

  function cabe(pts, ctx, sangra) {
    return cabeDuro(pts, ctx, sangra) && bastaVisto(pts, ctx, sangra);
  }

  // EL QUE SALE, NO VUELVE. Es del autor y es una decisión, no una consecuencia:
  // «cuando una línea sale fuera, no vuelve. No es esa misma. Sale fuera y ya está».
  // Un trazo que asomaba por un borde y reaparecía dos palmos más allá se leía como
  // dos trazos con un puente invisible, y eso es contar una historia que el papel no
  // enseña. Se corta en el punto exacto en que vuelve a entrar.
  function cortarAlVolver(pts, ctx) {
    const m = ctx.mg + ctx.W / 2;
    const dentro = p => p.x > m && p.x < ctx.fw - m && p.y > m && p.y < ctx.fh - m;
    let fuera = false, acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const L = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      if (!dentro(pts[i + 1])) fuera = true;
      else if (fuera) return prefijo(pts, acc + L * 0.5);   // ya volvía: se corta aquí
      acc += L;
    }
    return pts;
  }

  // El trazo hasta una longitud dada. Corta por dentro del tramo, no por vértice:
  // el sitio donde el trazo deja de caber no tiene por qué ser una esquina.
  function prefijo(pts, t) {
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const L = hypot(dx, dy);
      if (acc + L >= t) {
        const u = L > 0 ? (t - acc) / L : 0;
        out.push({ x: pts[i].x + dx * u, y: pts[i].y + dy * u });
        return out;
      }
      acc += L; out.push({ x: pts[i + 1].x, y: pts[i + 1].y });
    }
    return out;
  }

  // EL TRAZO CRECE, NO SE RECHAZA. Era el juicio del autor: «si empiezas por una
  // línea y se va haciendo larga, el resto de la composición se adaptará a eso».
  // Antes un trazo que no cabía se tiraba entero y se pedía otro más corto, así
  // que la longitud la elegía el filtro y no el dibujo — y el trazo largo, que es
  // el que más veces choca, era el que más veces se perdía. Ahora se pide un trazo
  // ambicioso y se recorta EXACTAMENTE donde deja de caber, que es la regla que la
  // familia ya tenía escrita: el trazo se acaba donde ya no cabe.
  //
  // Y se prueba POR LOS DOS EXTREMOS, quedándose con el que salva más trazo. Desde
  // que un `paralelo` se compone de tres partes —viene libre, acompaña, sigue
  // libre—, cortar siempre por delante mataba el trazo entero cuando lo que no
  // cabía era su arranque, y con él se perdía la sección acompañada, que es la que
  // vale.
  function recortar(pts, ctx, sangra) {
    if (cabeDuro(pts, ctx, sangra)) return pts;
    const busca = (p) => {
      let lo = 0, hi = largoDe(p);
      for (let k = 0; k < 15; k++) {
        const mid = (lo + hi) / 2;
        if (cabeDuro(prefijo(p, mid), ctx, sangra)) lo = mid; else hi = mid;
      }
      return lo;
    };
    const aDelante = busca(pts);
    const rev = pts.slice().reverse();
    const aDetras = busca(rev);
    const L = max(aDelante, aDetras);
    if (L < ctx.S * LARGO_MIN) return null;
    return aDelante >= aDetras ? prefijo(pts, aDelante)
                               : prefijo(rev, aDetras).reverse();
  }

  // EL NÚCLEO: dónde está el cuerpo ahora mismo. Es el centro de gravedad de lo ya
  // puesto, y sirve para elegir CONTRA QUÉ TROZO se acompaña — no contra uno al
  // azar, sino contra el que cae más cerca del bulto. Es realimentación: cuanto más
  // se acompaña ahí, más ahí cae lo siguiente, y de eso sale «la zona de mayor
  // intersección» sin declararla en ningún sitio. Sólo hay que dejar que se forme.
  function recentrar(ctx) {
    let sx = 0, sy = 0, n = 0;
    for (const t of ctx.trazos) for (const p of t.pts) { sx += p.x; sy += p.y; n++; }
    ctx.nucleo = n ? { x: sx / n, y: sy / n } : null;
  }

  // La gubia de UN trazo: misma amplitud que el resto de la obra (es la misma
  // herramienta) y fase propia (es otro corte).
  function gubiaDe(rng, ctx) {
    if (!ctx.gubAmp) return null;
    return { amp: ctx.gubAmp,
             f1: rng.range(GUB_FREQ[0], GUB_FREQ[1]) * 6.2832,
             f2: rng.range(GUB_FREQ[0], GUB_FREQ[1]) * 6.2832 * 1.618,
             p1: rng.range(0, 6.2832), p2: rng.range(0, 6.2832) };
  }

  // ── El cerco ────────────────────────────────────────────────────────────────
  // Varios trazos rodeando un blanco SIN cerrarlo. El «recinto» de las referencias
  // no es un trazo cerrado: es vecindad. Se colocan como cuerdas alrededor de un
  // centro, con hueco entre una y la siguiente.
  function cercar(rng, ctx, n) {
    const S = min(ctx.fw, ctx.fh);
    const R = S * rng.range(0.15, 0.27);
    // el cerco se centra DENTRO DE LA ZONA, como todo lo demás
    const z = ctx.zona;
    const cx = rng.range(z.x0, z.x1), cy = rng.range(z.y0, z.y1);
    const a0 = rng.range(0, 360);
    let puestos = 0;
    for (let k = 0; k < n; k++) {
      const a = a0 + (360 / n) * k + rng.range(-16, 16);
      const px = cx + Math.cos(a * RAD) * R, py = cy + Math.sin(a * RAD) * R;
      // la cuerda va perpendicular al radio: así rodea en vez de apuntar al centro
      const dir = a + 90 + rng.range(-24, 24);
      const largo = R * rng.range(1.15, 2.1);
      for (let t = 0; t < COLOCA; t++) {
        const nq = rng.int(1, 3);
        let pts = trazar(rng, px - Math.cos(dir * RAD) * largo * 0.5,
                         py - Math.sin(dir * RAD) * largo * 0.5, dir, largo, nq, ctx.vib, ctx.D);
        // el cerco también CRECE hasta donde cabe: ahora se pone después del
        // protagonista, así que casi siempre tiene que ceder algo contra él, y
        // rechazarlo entero dejaba recintos de dos cuerdas.
        pts = recortar(pts, ctx, false);
        if (pts && largoDe(pts) >= ctx.S * LARGO_MIN) {
          ctx.trazos.push({ pts, segs: segsDe(pts), rel: 'cerco', gubia: gubiaDe(rng, ctx) });
          recentrar(ctx);
          puestos++; break;
        }
      }
    }
    return puestos;
  }

  // ── Medir ───────────────────────────────────────────────────────────────────
  // El OJO: el suelo donde la cinta ya no cabe. Alcance de un disco de radio W/2
  // desde el borde — y aquí mide exactamente lo que el `cerco` produce: un blanco
  // rodeado por trazos que no llegan a cerrarse. Si las aberturas son más
  // estrechas que el material, el disco no entra y el blanco cuenta como ojo.
  function edt(bin, NX, NY) {
    const INF = 1e20, f = new Float64Array(max(NX, NY));
    const d2 = new Float64Array(NX * NY);
    const v = new Int32Array(max(NX, NY) + 1), z = new Float64Array(max(NX, NY) + 2);
    const dt1d = (f, n) => {
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < n; q++) {
        let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      const src = f.slice(0, n); k = 0;
      for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; f[q] = (q - v[k]) * (q - v[k]) + src[v[k]]; }
    };
    for (let x = 0; x < NX; x++) {
      for (let y = 0; y < NY; y++) f[y] = bin[y * NX + x] ? 0 : INF;
      dt1d(f, NY);
      for (let y = 0; y < NY; y++) d2[y * NX + x] = f[y];
    }
    for (let y = 0; y < NY; y++) {
      for (let x = 0; x < NX; x++) f[x] = d2[y * NX + x];
      dt1d(f, NX);
      for (let x = 0; x < NX; x++) d2[y * NX + x] = f[x];
    }
    return d2;
  }

  function medir(trazos, W, fw, fh) {
    const paso = 1 / GRID;
    const q = E.nominalAspect(max(fw, fh), min(fw, fh));
    const NL = max(4, Math.round(q * GRID));
    const NX = fw >= fh ? NL : GRID, NY = fw >= fh ? GRID : NL;
    const total = NX * NY, tinta = new Uint8Array(total), h = W / 2;
    for (const t of trazos) {
      for (const s of t.segs) {
        const x0 = max(0, Math.floor((min(s[0], s[2]) - h) / paso));
        const x1 = min(NX - 1, Math.ceil((max(s[0], s[2]) + h) / paso));
        const y0 = max(0, Math.floor((min(s[1], s[3]) - h) / paso));
        const y1 = min(NY - 1, Math.ceil((max(s[1], s[3]) + h) / paso));
        for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
          const c = gy * NX + gx;
          if (tinta[c]) continue;
          if (pointSegDist((gx + 0.5) * paso, (gy + 0.5) * paso, s[0], s[1], s[2], s[3]) <= h) tinta[c] = 1;
        }
      }
    }
    let nT = 0;
    for (let i = 0; i < total; i++) if (tinta[i]) nT++;

    const rC = h / paso, r2 = rC * rC;
    const dTinta = edt(tinta, NX, NY);
    const libre = new Uint8Array(total);
    for (let i = 0; i < total; i++) if (!tinta[i] && dTinta[i] >= r2) libre[i] = 1;
    const agua = new Uint8Array(total), pila = [];
    for (let gx = 0; gx < NX; gx++) pila.push(gx, (NY - 1) * NX + gx);
    for (let gy = 0; gy < NY; gy++) pila.push(gy * NX, gy * NX + NX - 1);
    while (pila.length) {
      const k = pila.pop();
      if (agua[k] || !libre[k]) continue;
      agua[k] = 1;
      const gx = k % NX, gy = (k - gx) / NX;
      if (gx > 0) pila.push(k - 1);
      if (gx < NX - 1) pila.push(k + 1);
      if (gy > 0) pila.push(k - NX);
      if (gy < NY - 1) pila.push(k + NX);
    }
    const dAgua = edt(agua, NX, NY);
    const visto = new Uint8Array(total), ojos = [];
    for (let k0 = 0; k0 < total; k0++) {
      if (tinta[k0] || visto[k0] || dAgua[k0] <= r2) continue;
      let area = 0; const p = [k0]; visto[k0] = 1;
      while (p.length) {
        const k = p.pop(); area++;
        const gx = k % NX, gy = (k - gx) / NX;
        const vec = [gx > 0 ? k - 1 : -1, gx < NX - 1 ? k + 1 : -1,
                     gy > 0 ? k - NX : -1, gy < NY - 1 ? k + NX : -1];
        for (const w of vec) { if (w < 0 || visto[w] || tinta[w] || dAgua[w] <= r2) continue; visto[w] = 1; p.push(w); }
      }
      const frac = area / total;
      if (frac >= OJO_MIN) ojos.push(frac);
    }
    ojos.sort((a, b) => b - a);
    return { ojos, ocupacion: nT / total };
  }

  // El ACOMPAÑAMIENTO medido: pares de trazos que corren casi paralelos a
  // distancia de canal, y cuánto. Es el rasgo de la familia y se mide exacto
  // sobre la geometría, no sobre la rejilla.
  const PAR_ANG = 14, PAR_D = 2.6, PAR_L = 1.5;
  function pasillos(trazos, W, D) {
    let n = 0, largo = 0;
    for (let i = 0; i < trazos.length; i++) {
      for (let j = i + 1; j < trazos.length; j++) {
        let L = 0;
        for (const a of trazos[i].segs) for (const b of trazos[j].segs) {
          const ux = a[2] - a[0], uy = a[3] - a[1], um = hypot(ux, uy) || 1e-9;
          const vx = b[2] - b[0], vy = b[3] - b[1], vm = hypot(vx, vy) || 1e-9;
          if (abs((ux * vx + uy * vy) / (um * vm)) < Math.cos(PAR_ANG * RAD)) continue;
          const sep = pointSegDist((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, a[0], a[1], a[2], a[3]);
          if (sep > D * PAR_D) continue;
          const t = (px, py) => ((px - a[0]) * ux + (py - a[1]) * uy) / (um * um);
          const t0 = t(b[0], b[1]), t1 = t(b[2], b[3]);
          const lo = max(0, min(t0, t1)), hi = min(1, max(t0, t1));
          L += (hi - lo) * um;
        }
        if (L >= W * PAR_L) { n++; largo += L; }
      }
    }
    return { n, largo };
  }

  // ── Un candidato ────────────────────────────────────────────────────────────
  function tramar(rng, fw, fh, tipo, params) {
    const t = TIPOS[tipo];
    const S = min(fw, fh);
    const W = params.ancho ? S * W_MAX * params.ancho : S * rng.range(W_MIN, W_MAX);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam, D = W + g;
    const vibra = params.vibra != null ? !!params.vibra : rng.bool(P_VIBRA);
    // Cuánto sangra ESTA obra: o nada, o entre poco y mucho. Es constante dentro
    // de la hoja, como la vibración — que unas se salgan y otras no es del cuadro,
    // no del trazo.
    const pSangra = params.sangra != null ? params.sangra
                  : (rng.bool(P_SECA) ? 0 : rng.range(P_SANGRA_OBRA[0], P_SANGRA_OBRA[1]));
    // LA ZONA: el dibujo no ocupa la hoja, ocupa una parte de la hoja. Es lo último
    // que separaba esto de las referencias, y se ve de un vistazo en las seis — el
    // grabado del recinto vive en un tercio del papel y el resto está vacío; en las
    // otras el dibujo se apiña a un lado. Repartiendo los trazos por todo el pliego
    // sale una constelación; metiéndolos en una zona sale una MASA, que es lo que
    // hace que las bandas se encuentren y el canal aparezca.
    //
    // No es un margen más grande: es un encuadre descentrado, y el vacío que deja
    // no es simétrico. El blanco que sobra es material, igual que el canal.
    const zw = rng.range(ZONA[0], ZONA[1]), zh = rng.range(ZONA[0], ZONA[1]);
    const zx = rng.range(0, 1 - zw), zy = rng.range(0, 1 - zh);
    const gubAmp = params.gubia != null ? params.gubia
                 : (rng.bool(P_GUBIA) ? rng.range(GUB_AMP[0], GUB_AMP[1]) : 0);
    const ctx = {
      fw, fh, S, W, g, D, mg: S * MARGEN, trazos: [], pSangra, gubAmp,
      zona: { x0: zx * fw, y0: zy * fh, x1: (zx + zw) * fw, y1: (zy + zh) * fh },
      vib: vibra ? { amp: rng.range(VIB_AMP[0], VIB_AMP[1]), onda: W * rng.range(VIB_ONDA[0], VIB_ONDA[1]) } : null,
    };

    const N = params.trazos ? params.trazos : rng.int(t.n[0], t.n[1]);
    const relCount = {};
    for (const r of RELS) relCount[r] = 0;
    const pesos = RELS.filter(r => t.w[r] > 0).map(r => ({ n: r, prob: t.w[r] }));
    // Cada trazo se pide AMBICIOSO y se recorta donde deja de caber, en vez de
    // rechazarse entero. Los reintentos son de SITIO —dónde y contra quién— y ya no
    // de longitud: la longitud sale del dibujo.
    const poner = (L) => {
      const rel = ctx.trazos.length === 0 ? 'suelto' : rng.weighted(pesos).n;
      let mejor = null, mejorL = 0, mejorS = false, mejorSep = ctx.D;
      for (let k = 0; k < COLOCA; k++) {
        // CONTRA QUIÉN: encadenado, no al azar. Eligiendo un trazo cualquiera de
        // los ya puestos, cada uno se relacionaba con otro distinto y la hoja salía
        // como una lista de parejas sueltas. En las referencias los trazos van en
        // GRUPO —tres o cuatro patas paralelas, dos peines engranados—, y un grupo
        // se hace acompañando al ÚLTIMO: así el tercero acompaña al segundo, que
        // acompaña al primero, y sale el haz. Dos de cada tres veces se encadena;
        // la otra abre grupo nuevo, que es lo que impide que la obra sea una sola
        // fila.
        const obj = !ctx.trazos.length ? null
          : (rng.bool(0.68) ? ctx.trazos[ctx.trazos.length - 1]
                            : ctx.trazos[rng.int(0, ctx.trazos.length - 1)]).pts;
        const sangra = rng.bool(ctx.pSangra);
        // LA SEPARACIÓN ES DEL GRUPO. Si este trazo se engancha al último y el
        // último ya iba acompañando, es el MISMO haz: se hereda su canal. Si abre
        // grupo, se sortea uno nuevo. Sorteándolo por trazo, un peine de cuatro
        // salía con cuatro blancos distintos y se leía como cuatro parejas sueltas
        // en vez de como un cuerpo abierto — que es justo lo que da la cohesión.
        const alUltimo = obj && obj === ctx.trazos[ctx.trazos.length - 1].pts;
        const sigue = alUltimo && ctx.sepGrupo && ACOMPANA[ctx.ultRel];
        const sep = sigue ? ctx.sepGrupo : ctx.D * rng.range(SEP_PAR[0], SEP_PAR[1]);
        let pts = colocar(rng, ctx, rel, obj, L, sangra, sep);
        if (!pts || pts.length < 2) continue;
        pts = cortarAlVolver(pts, ctx);
        pts = recortar(pts, ctx, sangra);
        if (!pts || pts.length < 2) continue;
        if (!bastaVisto(pts, ctx, sangra)) continue;
        const Lr = largoDe(pts);
        if (Lr < ctx.S * LARGO_MIN) continue;
        // se queda el intento MÁS LARGO, no el primero que cabe: con el recorte,
        // el primero que cabe cabe siempre, y quedarse con él es volver a dejar
        // que el azar del sitio elija la longitud.
        if (Lr > mejorL) { mejor = pts; mejorL = Lr; mejorS = sangra; mejorSep = sep; }
        if (Lr > L * ctx.S * 0.92) break;   // ya es lo que se pedía: no busques más
      }
      if (!mejor) return 0;
      ctx.trazos.push({ pts: mejor, segs: segsDe(mejor), rel, sangra: mejorS, gubia: gubiaDe(rng, ctx) });
      recentrar(ctx);
      relCount[rel]++;
      ctx.sepGrupo = mejorSep; ctx.ultRel = rel;
      return mejorL / ctx.S;
    };

    // EL PROTAGONISTA PRIMERO, Y ANTES QUE EL CERCO. Con el cerco puesto primero,
    // el trazo largo entraba cuarto o sexto, con el centro de la hoja ya ocupado, y
    // se quedaba en uno más del montón: por eso los `recinto` salían de ocho trazos
    // cortos y ninguno mandaba. El cerco no pierde nada por ir detrás — se organiza
    // contra el trazo largo, que es lo que hace en las referencias.
    const real = poner(rng.range(PROTA[0], PROTA[1]));
    // El cerco SALE DE N, no se suma a N: son trazos de la obra, no un extra.
    let nC = params.cerco != null ? params.cerco : rng.int(t.cerco[0], t.cerco[1]);
    nC = min(nC, N - 2);              // siempre queda sitio para el protagonista y uno más
    let cerco = 0;
    if (nC >= 3) cerco = cercar(rng, ctx, nC);

    // LA CAÍDA SE MIDE DESDE LO QUE EL PROTAGONISTA CONSIGUIÓ, no desde lo que se
    // le pidió. Es el equilibrio que pedía el autor entre componer y adaptarse: las
    // RELACIONES siguen declaradas —cada trazo se construye cumpliendo una— pero la
    // ESCALA de la hoja la fija el primer trazo. Si el protagonista sale corto
    // porque el pliego no daba para más, los demás bajan con él y la jerarquía se
    // mantiene; con el plan declarado de antemano, salían todos pegados a él.
    const c0 = rng.range(CAIDA[0], CAIDA[1]);
    let L = (real || PROTA[0]) * c0;
    for (let idx = 1 + cerco; idx < N; idx++) {
      poner(max(L, LARGO_MIN * 1.2));
      L *= c0 * rng.range(0.92, 1.14);
    }

    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0, quiebros = 0;
    for (const tr of ctx.trazos) { vert += tr.pts.length; quiebros += tr.pts.length - 2; }
    // El REPARTO: cuánto mide el trazo mayor comparado con el mediano. Es la
    // jerarquía, en un número, y por eso se devuelve — se juzga en `falta`.
    const Ls = ctx.trazos.map(tr => largoDe(tr.pts) / S).sort((a, b) => a - b);
    const lMed = Ls.length ? Ls[Ls.length >> 1] : 0;
    const reparto = lMed > 0 ? Ls[Ls.length - 1] / lMed : 0;
    return { trazos: ctx.trazos, W, g, D, cerco, relCount, vibra,
             ojos: med.ojos, ocupacion: med.ocupacion,
             pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             largoMax: Ls.length ? Ls[Ls.length - 1] : 0, reparto,
             sangrados: ctx.trazos.filter(x => x.sangra).length };
  }

  // Cuánto se sale un candidato de lo que su tipo declara. Cero es cumplir.
  function falta(c, t, N) {
    let f = 0;
    // 1. los trazos que se pidieron. Si no caben, la obra no es la que se declaró.
    if (c.trazos.length < N) f += (N - c.trazos.length) * 0.35;
    // 2. la familia exige RELACIÓN: una obra donde nadie acompaña a nadie es un
    //    montón de rayas. Es la regla que sustituye a la vieja «franja».
    if (c.pasillos === 0 && c.trazos.length >= 3) f += 1.2;
    // 3. y exige que el trazo sea LARGO Y SIMPLE: más de seis quiebros de media
    //    es un garabato, que es el error que costó dos versiones.
    const qm = c.trazos.length ? c.quiebros / c.trazos.length : 0;
    if (!c.vibra && qm > 6) f += (qm - 6) * 0.3;
    // 4. y exige JERARQUÍA. Es, literalmente, el juicio del autor sobre la tercera
    //    vuelta —«a todas les falta un poco de interés»— y la medida decía lo
    //    mismo: reparto 1,36, o sea todos los trazos midiendo igual. Una hoja donde
    //    todo pesa lo mismo no tiene dónde mirarse. Va aquí y no en la colocación
    //    porque es un juicio sobre la obra terminada: de los siete candidatos se
    //    queda el que tiene un trazo que manda.
    if (c.trazos.length >= 3 && c.reparto < 1.5) f += (1.5 - c.reparto) * 0.9;
    return f;
  }

  // ── Entrada principal ───────────────────────────────────────────────────────
  function render(ctx, W, H, seed, opts) {
    opts = opts || {};
    const params = opts.params || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const grainScale = params.grainScale == null ? 1 : params.grainScale;
    const rng = new E.Rng(seed);

    const pal = (opts.locked && palettes[opts.lockedIdx]) ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;
    const dd = E.inkDice(rng, P_INV);
    const rol = E.inkRoles(colors, dd);

    const S = min(W, H);
    const cuad = E.fieldMode(params) === 'square';
    const AW = cuad ? S : W, ox = (W - AW) / 2;
    const q = E.nominalAspect(max(AW, H), min(AW, H));
    const fw = AW >= H ? q : 1, fh = AW >= H ? 1 : q;

    const tipo = params.tipo || rng.weighted(TIPO_NAMES.map(n => ({ n, prob: TIPOS[n].prob }))).n;
    const t = TIPOS[tipo];
    let best = null, bestF = Infinity;
    for (let i = 0; i < REINTENTOS; i++) {
      const r2 = new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0);
      const N = params.trazos ? params.trazos : r2.int(t.n[0], t.n[1]);
      const c = tramar(new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0), fw, fh, tipo, params);
      const f = falta(c, t, N);
      if (f < bestF) { bestF = f; best = c; }
      if (f === 0) break;
    }

    const bg = E.pickBg(seed, params, BG_GRADIENT);
    if (bg === 'gradient') E.drawMeshGradient(ctx, W, H, colors, new E.Rng(seed ^ 0xDEADBEEF));
    else { ctx.fillStyle = rol.suelo; ctx.fillRect(0, 0, W, H); }

    // UN SOLO stroke(). Nada se solapa, así que nada tiene que ir antes que nada:
    // ni capas, ni halo, ni orden de pintado. Y por eso tampoco hay costura.
    //
    // `butt`: el cabo es el corte de la gubia, no un remate.
    // `bevel`: NO es preferencia de dibujo, es lo que hace SUFICIENTE la distancia
    // mínima. Con `miter` el pico de un codo sale W/2/sen(α) del vértice —0,707 W
    // en uno recto— y la regla sólo deja W/2 + g = 0,67 W de aire: una esquina
    // cruzaría el canal y soldaría la obra. Con `bevel` toda la tinta cae dentro
    // de W/2 del eje, y «los ejes a W+g» equivale a «las tintas a g». Lo comprueba
    // el control `miter` de la batería, que dispara 10 de 10.
    //
    // Y va por RELLENO y no por `stroke()`, porque la gubia no tiene una anchura
    // sola: la tiene con variaciones muy pequeñas a lo largo del recorrido, que es
    // lo que hace que la banda parezca cortada a mano y no extruida. Un `stroke()`
    // no sabe hacer eso — sólo tiene un `lineWidth`—, así que la banda se construye
    // como contorno y se rellena de una vez.
    //
    // Lo que NO cambia es la garantía, y es lo único que aquí importa: el contorno
    // se levanta con la construcción del BISEL —dos puntos por vértice, uno por
    // cada tramo, unidos por su cuerda— así que ningún punto de tinta cae a más de
    // W/2 del eje. Con la anchura variando sólo HACIA ABAJO, sigue siendo cierto.
    // Lo comprueba `toque.js` píxel a píxel, y el control `miter` sigue disparando.
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(S, S);
    ctx.beginPath();
    for (const tr of best.trazos) banda(ctx, tr.pts, best.W, tr.gubia);
    ctx.fillStyle = rol.tinta;
    ctx.fill();
    ctx.restore();

    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF));

    return { pal, rol, tipo, bg, falta: bestF,
             field: cuad ? 'square' : 'sheet',
             cintas: best.trazos.length, pliegues: best.cerco,
             pasillos: best.pasillos, largoPas: best.largoPas,
             cabos: best.trazos.length * 2, vert: best.vert,
             quiebros: best.quiebros, vibra: best.vibra, sangrados: best.sangrados,
             rel: best.relCount,
             anchoRel: best.W / min(fw, fh), gam: best.g / best.W,
             ojos: best.ojos, ocupacion: best.ocupacion, esq: 0,
             geo: { cintas: best.trazos.map(x => x.pts), sangra: best.trazos.map(x => !!x.sangra),
                    SANGRE, MARGEN, W: best.W, g: best.g, D: best.D,
                    S, ox, fw, fh, veto: null } };
  }

  const P_INV = 0.14;

  // ── Traits ──────────────────────────────────────────────────────────────────
  function traits(res) {
    const prob = res.pal.prob != null ? res.pal.prob : 0.05;
    const palR = E.palRarity(prob);
    const n = res.ojos.length;
    const ojosLbl = n === 0 ? 'Abierto' : n === 1 ? 'Un ojo' : n + ' ojos';
    const ojosR = n === 0 ? 'common' : n <= 3 ? 'common' : n <= 7 ? 'uncommon' : 'rare';
    const areaOjos = res.ojos.reduce((a, b) => a + b, 0);
    const o = res.ocupacion;
    const ocLbl = o < 0.07 ? 'Leve' : o < 0.15 ? 'Justa' : o < 0.24 ? 'Cargada' : 'Trenzada';
    const ocR = o < 0.05 ? 'uncommon' : o >= 0.24 ? 'rare' : 'common';
    const qm = res.cintas ? res.quiebros / res.cintas : 0;
    const trazoLbl = qm < 1.6 ? 'Recto' : qm < 3.2 ? 'Quebrado' : 'Roto';
    const tipoR = res.tipo === 'disperso' ? 'uncommon' : 'common';
    const vibR = res.vibra ? 'uncommon' : 'common';
    const f = r => r === 'superrare' ? 0.18 : r === 'rare' ? 0.3 : r === 'uncommon' ? 0.7 : 1;
    const s = prob * f(ojosR) * f(ocR) * f(tipoR) * f(vibR);
    const overall = s > 0.06 ? 'common' : s > 0.025 ? 'uncommon' : s > 0.008 ? 'rare' : s > 0.002 ? 'superrare' : 'legendary';
    const rel = res.rel || {};
    const relTop = Object.keys(rel).filter(k => rel[k] > 0).sort((a, b) => rel[b] - rel[a]).slice(0, 2).join(' · ') || '—';
    return {
      list: [
        { key: 'Palette', val: res.pal.name, colors: res.pal.colors, rarity: palR },
        { key: 'Type',    val: res.tipo, rarity: tipoR },
        { key: 'Strokes', val: res.cintas + ' · ' + qm.toFixed(1) + ' bends', rarity: 'common' },
        { key: 'Line',    val: trazoLbl + (res.vibra ? ' · vibrada' : ''), rarity: vibR },
        { key: 'Relation',val: relTop, rarity: 'common' },
        { key: 'Along',   val: res.pasillos + ' × ' + res.largoPas.toFixed(1) + 'W', rarity: 'common' },
        { key: 'Ring',    val: res.pliegues ? res.pliegues + ' cerco' : '—', rarity: res.pliegues ? 'uncommon' : 'common' },
        { key: 'Eyes',    val: ojosLbl + (n ? ' · ' + (areaOjos * 100).toFixed(1) + '%' : ''), rarity: ojosR },
        { key: 'Ink',     val: ocLbl + ' · ' + Math.round(o * 100) + '%', rarity: ocR },
        { key: 'Bleed',   val: res.sangrados ? res.sangrados + ' fuera' : 'dentro', rarity: res.sangrados ? 'uncommon' : 'common' },
        { key: 'Paper',   val: res.rol.inv ? 'Oscuro' : res.rol.papel === 'crudo' ? 'Crudo' : 'Blanco',
          rarity: res.rol.papel === 'crudo' ? 'uncommon' : 'common' },
      ],
      overall,
    };
  }

  const FORMATS = ['square', 'horizontal'];
  (global.HOKS = global.HOKS || {}).HRRS = { render, traits, TIPOS, RELS, BG_GRADIENT, FORMATS };
})(typeof window !== 'undefined' ? window : globalThis);
