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
  // MEDIDO en los dos detalles en alta, y me habia quedado corto otra vez: en el
  // cartel la banda vertical mide 1/8 del ancho del pliego y en el grabado del
  // recinto 1/12 del dibujo. Yo tenia entre 1/17 y 1/33 — bandas de la mitad de
  // gruesas. Y no es un detalle: con la banda fina el canal es un pelo invisible y
  // la obra se lee como un dibujo de lineas; con la banda gorda se lee como MATERIA
  // cortada, que es de lo que va.
  const W_MIN = 0.032, W_MAX = 0.092;      // × lado corto. Medido en las seis: 0,03-0,09
  // El canal, medido con regla sobre las seis: banda 55 px y blanco 4 en el cartel
  // de Múnich (0,07), banda 30 y blanco 3 en la litografía de las siete bandas
  // (0,10), banda 14 y blanco 2 en las dos de papel hecho a mano (0,14). Es un PELO,
  // más fino de lo que decía el «1/5» de oído. Y es la medida que hace que el
  // acompañamiento se lea como material partido y no como dos rayas paralelas.
  const GAMMA = [0.08, 0.16];              // canal = W × gamma

  // ── El trazo: LARGO Y SIMPLE ────────────────────────────────────────────────
  // De uno a cinco quiebros en todo el recorrido. No es una preferencia: es lo
  // que separa un trazo de un garabato, y era la mitad del no-parecido.
  // RECONTADO sobre los dos detalles en alta que mando el autor, y me habia quedado
  // corto: las bandas del grabado del recinto tienen OCHO cambios de direccion
  // largos, no tres, y ademas se pliegan. El «de uno a cinco» salio de mirar las
  // referencias pequenas, donde los quiebros chicos no se ven. Subir esto obliga a
  // subir el umbral del detector de garabatos (de 6 a 9 de media), y eso hay que
  // decirlo claro: el umbral se mueve porque la FUENTE dice otra cosa, no porque
  // estorbara. Un detector que se afloja para que pase la obra ya no mide nada.
  // Y NO ES UNA CUENTA POR TRAZO, ES UN RITMO. Medido en las dos imágenes en alta:
  // en el cartel las bandas largas giran cada dos anchuras y pico; en el grabado, las
  // patas —que miden ocho anchuras— llevan tres quiebros, o sea uno cada 2,7. La
  // frecuencia es la misma en los trazos largos y en los cortos, porque es una
  // propiedad DEL MATERIAL: la gubia gira cada tanto, mida lo que mida el corte.
  //
  // Con una cuenta fija por trazo pasaba lo contrario de lo que hace falta: el
  // protagonista salía con 5-9 quiebros en dos lados de hoja (demasiado simple para
  // su largo) y los trazos cortos con 0-3 en un palmo (demasiado rectos). Medido:
  // mediana 2 quiebros por trazo con [2,7] declarado, y la mitad de los trazos con
  // dos vértices — o sea, rectas.
  // RECALIBRADO, y con la cuenta hecha en las dos imagenes en alta: la banda que
  // entra por la izquierda en el cartel recorre unas cuarenta anchuras y gira seis
  // veces —una cada 6,7—; el contorno del recinto en el grabado recorre unas treinta
  // y gira diez —una cada 3—. A 2,0-3,6 salian escaleras: la obra zigzagueaba entera
  // y perdia los tramos rectos largos, que son la mitad del caracter.
  //
  // Y hay DOS ESCALAS que no hay que confundir: los quiebros grandes (22-118 grados)
  // son decisiones y van espaciados; el temblor y la deriva son la mano y van
  // seguidos. Al contar «muchos quiebros» en el grabado estaba contando la mano y
  // metiendola en el sitio de las decisiones.
  const PASO = [3.5, 7.5];                 // una vuelta grande cada tantas anchuras
  // El tope es UNA RED, no un mando: a 16 estaba mordiendo en obra sana —un
  // protagonista de 2,4 con la gubia fina pide 25— y de paso dejaba el control de
  // garabatos sin poder disparar, porque por mucho que se rompiera el ritmo el
  // recuento chocaba con el tope. Un tope que muerde es un parámetro escondido.
  const QUIEBROS = [1, 40];                // la red, no el reparto
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
  const PROTA = [2.05, 3.20];               // lo que se le PIDE, × lado corto
  // La caída era demasiado suave: con 0,76-0,91 el segundo trazo mide casi lo que el
  // primero y la hoja sale de piezas medianas. En las referencias hay UNO que cruza y
  // los demás son claramente menores — el salto es franco.
  const CAIDA = [0.62, 0.82];               // cada trazo respecto al anterior
  // LA ESCALERA, MEDIDA CONTRA LAS REFERENCIAS Y NO ELEGIDA. Con el mismo trazador
  // por los dos lados, las seis ponen 6,9 lados de linea y 0,25 de tinta sobre la
  // hoja; la familia ponia 4,0 y 0,16. No es que se acompañen menos —eso esta clavado,
  // 0,52 contra 0,50— ni que haya menos trazos —18 bandas contra 19—: es que hay
  // MENOS LINEA, y por eso la hoja se lee vacia al lado de un Chillida.
  //
  // PERO LA LINEA NO SE COMPRA APLANANDO LA ESCALERA, y esto me costo una vuelta.
  // Persiguiendo esos 6,9 subi CAIDA a [0,80 0,92] y la linea subio, si — y la hoja se
  // rompio. Con esa caida todos los trazos miden casi lo mismo: no hay protagonista,
  // y sin protagonista la obra es confeti. El autor lo vio de un vistazo y tenia razon.
  //
  // La linea se compra por PROTA, que alarga al que manda sin tocar la forma de la
  // escalera. [2,05 3,20] con CAIDA [0,62 0,82] da la misma linea que la escalera plana
  // —4,1 lados— con la jerarquia intacta.
  //
  // Y queda dicho para que 4,1 no se lea como el objetivo: el objetivo son los 6,9 de
  // las referencias, y la diferencia no se cierra con esta constante.
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
  // LOS RUMBOS: la obra tiene un ALFABETO CORTO DE DIRECCIONES, no ángulos libres.
  //
  // Medido en las seis con el mismo trazador: entre el 48 % y el 81 % de la longitud
  // cae en sólo 4 de 18 casillas de dirección, y entre el 19 % y el 60 % sobre los
  // ejes. O sea que un trazo no gira lo que le apetece: vuelve a uno de los pocos
  // rumbos que la obra tiene. Es lo que hace que un Chillida se lea CONSTRUIDO y no
  // garabateado, y es el rasgo que más le faltaba al motor — sólo lo tenían las obras
  // `orto`, que son el 30 %.
  //
  // El paso entre rumbos sale de la misma medida: el ángulo de quiebro mediano de las
  // seis es 34–47°, y sólo del 4 % al 35 % son a escuadra. O sea que la escuadra es un
  // TIPO —la cuadrada pequeña, con el 35 %— y no la norma.
  const RUMBOS = [3, 5];                   // cuántas direcciones tiene la obra
  const RUMBO_PASO = [30, 52];             // cuánto se separan, en grados
  const RUMBO_ERR = 5;                     // cuánto se le permite salirse
  // EL CIERRE: cuánto tiende el trazo a cerrarse o a abrirse. Es del autor, y es una
  // variable de OBRA y no de trazo — «se aplica sobre todo al primer trazo y marca el
  // carácter; la relación entre trazos depende de la gravedad, no del cierre».
  //
  // Medido en las seis como el giro NETO de un trazo partido por 360, p90 de la obra:
  // r1 0,72 (la que más circula), r2 0,23 (la más abierta), r3 0,63, r4 0,59, r5 0,41,
  // r6 0,40. De un cuarto de vuelta a tres cuartos: rango ancho, y de obra.
  //
  // Y se dibuja con UNA SOLA COSA, la mano: un trazo que alterna el lado en cada giro
  // zigzaguea y no cierra; uno que gira siempre del mismo lado da la vuelta. Así que el
  // cierre es la probabilidad de NO alternar y no hace falta ni un ángulo más.
  //
  // De paso se arregla un descuido: la rama que hoy gobierna casi todos los giros —la
  // de los rumbos— tiraba una moneda NUEVA cada vez en vez de llevar la mano, así que
  // ahí el recorrido era un paseo aleatorio gobernara lo que gobernara el resto.
  //
  // ── Y AHORA LO QUE MIDE, que no es lo que yo esperaba ─────────────────────────
  //
  // Fijando el mando y midiendo el giro neto que sale (50 obras por punto):
  //
  //     pedido   0,00  0,10  0,20  0,35  0,50  0,65  0,80  1,00
  //     p50      0,37  0,44  0,46  0,49  0,48  0,49  0,50  0,54
  //     p90      0,50  0,54  0,62  0,66  0,65  0,69  0,75  0,84
  //
  // Gobierna, y es monótono — pero flojo: de punta a punta mueve la mediana 0,17,
  // mientras que a mando FIJO la variación entre obras va de 0,23 a 0,84. O sea que
  // manda más la tirada que el mando, y eso tiene una causa concreta y no es el mando:
  // PARA CERRAR HACEN FALTA GIROS, y los giros salen de la longitud (`quiebrosPara`).
  // Con tres quiebros de 45°, ni girando siempre del mismo lado se pasa de 0,38 de
  // vuelta. El cierre está TOPADO POR EL LARGO, que es justo el rasgo donde la familia
  // más lejos está (0,43 contra 0,79 de las referencias). Arreglado el largo, el cierre
  // recupera su rango solo; forzarlo aquí sería tapar un síntoma.
  //
  // Y una corrección de lo que este README llegó a afirmar: que la familia cerraba 0,19
  // contra 0,50. Era del trazador VIEJO, el que partía un trazo en cuatro — partir un
  // trazo le destruye el giro neto. Medido con trazos enteros la familia ya daba 0,46.
  // El mando no llegó para arreglar un número: llegó porque el autor lo declaró como
  // variable y una variable de carácter tiene que poder pedirse.
  const CIERRE = [0.05, 0.95];
  const CIERRE_POR = 0.27;                 // el valor de siempre, para quien no lo pase
  // El PLIEGUE: cuántas veces, de los sucesos de un trazo, la banda se vuelve sobre
  // sí misma. `phi` es el ángulo de entrada al pliegue: a 90° sale una uve cuadrada
  // (el cartel de Múnich), a 55° una uve tumbada (las siete bandas).
  // LA ORTOGONAL. En el cartel de Múnich no hay una sola diagonal: todo son tramos
  // verticales y horizontales con esquinas a escuadra, y esa retícula es la mitad de
  // su carácter. Estaba en mi propia tabla de ejes («trazo: quebrado · ORTOGONAL ·
  // liso») y no la había implementado. Es de la OBRA, no del trazo: una hoja es
  // ortogonal entera o no lo es.
  const P_ORTO = 0.30;
  const ORTO_ERR = 7;                      // cuánto se permite desviarse del eje
  const P_VOLTEA = 0.52;
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
  const VIB_AMP = [3.5, 6.0];              // grados por subdivisión
  const VIB_ONDA = [1.1, 2.6];             // × W · más fino: el filo, no la onda
  // Y LA DERIVA, que es otra cosa. El temblor es del filo —zumba y vuelve—; la
  // deriva es del recorrido: un tramo largo no va recto, se va yendo. «Nunca recto
  // ni demasiado digital» es esto y no el temblor, porque el temblor a distancia se
  // lee como textura y el tramo sigue siendo una recta. Es un paseo aleatorio lento
  // de la dirección, con memoria.
  //
  // El techo de las dos juntas es ARITMÉTICO: dos subdivisiones seguidas con desvío
  // contrario se separan hasta 2·VIB_AMP, y `obra.js` cuenta como quiebro todo giro
  // de más de 15°. 2×6,0 + 2×1,4 = 14,8. Por eso VIB_AMP baja de 7,5 a 6,0 al entrar
  // la deriva: lo que se gana por un lado se paga por el otro, y el detector tiene
  // que seguir midiendo lo que dice.
  const DERIVA = 1.4;                      // grados por subdivisión, acumulativos
  // Grados por subdivisión, SOSTENIDOS: el sesgo que convierte la deriva en una curva.
  // Barrido sobre 28 obras con el mismo instrumento que las referencias (eje fino ÷ eje
  // grueso, del píxel): 0 → 1,007 · 2,5 → 1,005 · 5 → 1,010 · 8 → 1,006, contra 1,013 de
  // las referencias. A 5 se recorta el 40 % de lo que faltaba, y de propina el
  // acompañamiento sube de 18,4 % a 21,1 % —un trazo que curva roza más—. Cuesta un 7 %
  // de línea (4,79 → 4,44), y eso hay que decirlo.
  const CURVA = 5;
  const DERIVA_MAX = 60;                   // cuánto se puede ir en total

  // LA GUBIA no tiene una anchura sola. Varía poco y despacio a lo largo del corte,
  // y esa variación es la mitad de que parezca hecho a mano. Es del material, así
  // que la amplitud es de la OBRA y la fase de cada trazo.
  // Sólo adelgaza: engordar cerraría el canal, que se mide contra W.
  const P_GUBIA = 0.82;
  // Medido con el mismo trazador por los dos lados: la anchura de un trazo de las seis
  // varía con un coeficiente de variación de 0,15 (0,08 en las finas, 0,28 en el
  // cartel) y la familia daba 0,05. Tres veces menos temblor del que tiene el original.
  const GUB_AMP = [0.07, 0.18];            // cuánto adelgaza el temblor, × W
  const GUB_FREQ = [3.0, 7.0];             // ondas por trazo, el temblor
  const GUB_DERIVA = [0.8, 2.2];           // la deriva, × la amplitud del temblor

  // ── El campo ────────────────────────────────────────────────────────────────
  const MARGEN = 0.022;                    // medido en las seis: 0,00-0,03 del lado
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
  // Y ES UNA SOLA MEDIDA POR OBRA. Lo dijo el autor mirando el cartel de Múnich: «el
  // margen entre trazos, cuando se paralelicen o terminen una contra otra, será
  // constante dentro de una misma obra». No es del grupo ni del trazo: es del
  // material, como la anchura. Un cuadro con dos blancos distintos tiene dos
  // materiales, y eso no pasa en ninguna de las seis.
  const SEP_OBRA = [1.0, 1.20];            // el pelo de ESTA obra, en canales D
  // EL SOLAPE NO ES UN CONTINUO: SON DOS LECTURAS. O los trazos se apartan y se
  // paralelizan, o uno pasa por encima del otro ENTERO. Lo de en medio —el roce, dos
  // bandas que se muerden un poco— no se lee como decisión: se lee como una
  // paralelización que salió mal, y es lo que el autor venía viendo.
  //
  // Así que se mide cuánto se meten, en anchuras: 0 es rozarse y 1 es coincidir. Por
  // debajo de este número no hay solape que valga y el candidato se rechaza —el
  // reintento lo aparta y sale paralelo—; por encima, tiene que ser un cruce entero.
  const SOLAPE_MIN = 0.35;
  // El radio del disco de la incision, en anchuras. Lo usa el dibujo Y la regla, y tiene
  // que ser EL MISMO numero: la regla autoriza el acercamiento exactamente donde el
  // corte llega. Si se separan, o la regla deja pasar tinta que el corte no abre, o el
  // corte muerde donde no hacia falta.
  //
  // 2,2 y no menos: a 1,6 quedaban pares de tinta a 0,20 g. Y no mas, porque a 3,0 la
  // medida no mejora — o sea que 2,2 no es un ajuste, es la cuenta: con el angulo
  // minimo de cruce (38°) el solape de dos bandas llega a 0,81 anchuras del corte, y
  // el corte tiene que pasar de ahi.
  const RCRUCE_G = 2.2;
  const SEP_SUELTO = [4.5, 11];            // el primer trazo no tiene con quién
  const RELLENO_MAX = 2.2;                 // techo del relleno de esquina, × W
  // El cruce: cuántos trazos de una obra pueden atravesar a otro, y con qué ángulo
  // mínimo. Pocos —en el cartel de Múnich hay dos— porque un cruce es un suceso.
  const P_CRUZA = 0.12;
  const P_DOBLE = 0.45;                    // acompañar a DOS, no a uno: la malla
  const ATRAE = 0.9;                       // la gravedad hacia el núcleo
  // Las patas: cuántas cuelgan y cuánto miden respecto al protagonista. El rango es
  // ancho A PROPÓSITO — patas iguales son un rastrillo.
  const P_PATAS = 0.42;
  const PATAS = [2, 4];
  const PATA_LARGO = [0.22, 0.62];
  // La TRAVESÍA: un trazo que cruza el pliego de lado a lado y se sale por los dos.
  // Es la referencia 5 entera, y mi propio análisis la había dado por imposible
  // («el margen en los cuatro lados la prohíbe por construcción»). Con el sangrado
  // de verdad ya no lo es: sólo hay que pedirla.
  const P_TRAVESIA = 0.28;
  const P_OUTLIER = 0.20;                  // los que se le escapan
  const CRUCE_MIN = 38;                    // grados: por debajo, la cuña se afila
  // Y NO EN CUALQUIER SITIO. Lo dijo el autor: «el cruce tiene que ser muy, muy raro,
  // y normalmente debería darse sólo cuando hay un cambio de dirección en un trazo —
  // que parta en ángulo y cubra al trazo que tiene paralelo». O sea: no es que dos
  // trazos se atraviesen porque sí, es que uno DEJA a su acompañado, gira, y al
  // girar le pasa por encima. Así que el cruce tiene que caer junto a un quiebro mío
  // de verdad, no en mitad de un tramo recto.
  const CRUCE_GIRO = 40;                   // el quiebro que justifica el cruce
  const CRUCE_CERCA = 3.0;                 // cómo de cerca del quiebro, × W

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
  function corteDe(a, b) {
    if (!cruzan(a[0], a[1], a[2], a[3], b[0], b[1], b[2], b[3])) return null;
    const r1 = a[2] - a[0], r2 = a[3] - a[1], s1 = b[2] - b[0], s2 = b[3] - b[1];
    const den = r1 * s2 - r2 * s1;
    if (abs(den) < 1e-12) return null;
    const t = ((b[0] - a[0]) * s2 - (b[1] - a[1]) * s1) / den;
    return { x: a[0] + t * r1, y: a[1] + t * r2 };
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
  // `guion` es la partitura escrita a mano: `{ pesos:[…], giros:[{mag, lado, pliega}] }`.
  // Cuando viene, manda sobre el sorteo — y sólo sobre el sorteo: el pliegue se sigue
  // construyendo con la misma fórmula, el temblor y la deriva siguen siendo los
  // mismos, y la banda se dibuja igual. Es lo que permite REPLICAR una referencia con
  // esta gramática en vez de describirla con palabras (ver `referencias/`).
  function alRumbo(rng, cd, rumbos) {
    // el rumbo más cercano al que se pretendía, con su pizca de error
    if (!rumbos || !rumbos.length) return cd;
    let mejor = cd, dm = Infinity;
    for (const r of rumbos) for (const q of (r, [r, r + 180])) {
      const d = abs(((cd - q + 540) % 360) - 180);
      if (d < dm) { dm = d; mejor = q; }
    }
    return mejor + rng.range(-RUMBO_ERR, RUMBO_ERR);
  }

  // QUE HAY CERCA DE ESTE PUNTO, y hacia donde va. Es el campo que lee la tendencia
  // a paralelizarse: el trazo mas proximo dentro de un radio, su distancia y su rumbo
  // local. Barato a proposito -distancia punto-tramo- porque se consulta en cada
  // subdivision del recorrido.
  function vecinoEn(x, y, vecinos, R) {
    let dm = R, dir = 0, hx = 0, hy = 0, hay = false;
    for (const t of vecinos) {
      const p = t.pts;
      for (let i = 0; i < p.length - 1; i++) {
        const ax = p[i].x, ay = p[i].y;
        const ex = p[i + 1].x - ax, ey = p[i + 1].y - ay, l2 = ex * ex + ey * ey;
        let u = l2 > 1e-18 ? ((x - ax) * ex + (y - ay) * ey) / l2 : 0;
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const qx = ax + ex * u, qy = ay + ey * u;
        const d = hypot(x - qx, y - qy);
        if (d < dm) { dm = d; dir = Math.atan2(ey, ex) / RAD; hx = qx; hy = qy; hay = true; }
      }
    }
    return hay ? { d: dm, dir, qx: hx, qy: hy } : null;
  }

  // EL TIRON: cuanto se deja llevar el trazo por lo que tiene al lado, en grados por
  // subdivision. Es el punto 5 del encargo, y es lo unico que no estaba implementado:
  // «cada punto del trazo lleva un valor que dice si tiende a solaparse; si la
  // paralelizacion es lo bastante fuerte se da el solape, si no el trazo tiende a
  // paralelizarse o a alejarse».
  //
  // Hasta aqui la paralelizacion era una RELACION DECLARADA -`colocar('paralelo')`- y
  // eso tiene un techo aritmetico: medido, un trazo `paralelo` acompana el 38,4 % de su
  // longitud, que es clavado el 37,7 % de las referencias, pero solo el 20 % de los
  // trazos son `paralelo` y los demas acompanan el 13 %. Para que el conjunto diera
  // 37,7 haria falta que el 99 % de la longitud fuera `paralelo`. Siete levas dentro del
  // marco de relaciones -pesos, densidad, cuenta, temblor, la baraja de los cortos, el
  // alfabeto- y ninguna movio el total de 18,6 %. No era un problema de pesos: la
  // paralelizacion no es una relacion, es una TENDENCIA PUNTO A PUNTO.
  // Barrido, midiendo el acompanamiento sobre la obra terminada (cada trazo contra
  // todos los demas, dentro del motor):
  //
  //     tiron    0     4    10    15    20    25    35
  //     total  18,6  19,3  18,7  22,4  26,7  25,0  23,7 %
  //
  // y el radio: 2,2 D da 24,8 y 5,0 D da 23,6, asi que 3 D. Por encima de 20 el trazo se
  // pega demasiado y empieza a chocar, que es por lo que vuelve a bajar.
  //
  // Comprobado luego con el instrumento honesto -del pixel, el mismo que las
  // referencias-: acompanado 18,4 % -> 26,2 % (referencias 37,7) y la RACHA p90 pasa de
  // 2,7 a 3,7 anchuras, que es clavada la de las referencias. Cuesta un 2,5 % de linea.
  //
  // Es la primera leva que mueve esto de verdad. Las siete anteriores -pesos, densidad,
  // cuenta, temblor, la baraja de los cortos, el alfabeto, la densidad como causa- no
  // movieron nada, y todas estaban DENTRO del marco de relaciones.
  const TIRON = 20;                        // grados por subdivisión
  const TIRON_R = 3.0;                     // radio de influencia, en canales D
  function trazar(rng, x, y, dir, largo, nq, vib, D, orto, guion, rumbos, cierre, vecinos) {
    const n = (guion && guion.giros ? guion.giros.length + 1 : nq + 1);
    // LA MANO. Probabilidad de cambiar de lado en cada giro; es el cierre, del revés.
    // A 0,95 el trazo zigzaguea y no cierra nunca; a 0,10 gira siempre igual y da la
    // vuelta. El valor de siempre —0,72 de alternancia— es CIERRE_POR.
    const pAlt = 0.95 - 0.85 * clamp(cierre == null ? CIERRE_POR : cierre, 0, 1);
    const pesos = [];
    let tot = 0;
    if (guion && guion.pesos) { for (const w of guion.pesos) { pesos.push(w); tot += w; } }
    else for (let i = 0; i < n; i++) { const w = rng.range(PESO_TRAMO[0], PESO_TRAMO[1]); pesos.push(w); tot += w; }
    const pts = [{ x, y }];
    let cx = x, cy = y, cd = dir, lado = rng.bool(0.5) ? 1 : -1;
    let der = 0;                            // la deriva acumulada del tramo en curso
    const avanza = (L, ang) => { cx += Math.cos(ang * RAD) * L; cy += Math.sin(ang * RAD) * L; pts.push({ x: cx, y: cy }); };
    for (let i = 0; i < n; i++) {
      const L = largo * pesos[i] / tot;
      if (vib) {
        // el filo TIEMBLA (zumba y vuelve) y el recorrido DERIVA (se va yendo). Son
        // dos cosas distintas y hacen falta las dos: sin la segunda, un tramo largo
        // es una recta con textura.
        const k = max(1, Math.round(L / vib.onda));
        // LA CURVATURA DEL TRAMO, y es lo que faltaba para que el trazo no parezca de
        // regla. El autor: «el trazo parece poco orgánico».
        //
        // La deriva sola es un paseo aleatorio de ±1,4° por paso, y con tramos de dos o
        // tres subdivisiones no llega a moverse; además una desviación CONSTANTE da una
        // recta inclinada, no una curva. Lo que curva es un sesgo sostenido, y es lo que
        // hacen las bandas de las referencias: arcos largos y suaves. Se sortea una vez
        // por tramo y se aplica en cada paso.
        //
        // Y no se arregla subiendo el TEMBLOR, que fue lo primero que probé: a 8° la
        // medida no se mueve y a 14° la composición se cae —tinta 0,05, tres obras de
        // catorce sobreviven— porque un trazo que zigzaguea se choca consigo mismo y
        // `seCorta` se lo come. Es la misma lección que ya costó la vibración de grosor:
        // lo que el original tiene no es alta frecuencia, es una onda larga.
        const curv = rng.range(-CURVA, CURVA);
        for (let j = 0; j < k; j++) {
          der = clamp(der + curv + rng.range(-DERIVA, DERIVA), -DERIVA_MAX, DERIVA_MAX);
          // EL TIRON. Si hay algo cerca, el trazo se deja llevar por su rumbo -o se
          // aparta si ya esta encima-, unos pocos grados por subdivision. No es un
          // salto: es una tendencia, asi que una vez alineados siguen juntos solos.
          if (vecinos && vecinos.length && TIRON > 0) {
            const v = vecinoEn(cx, cy, vecinos, D * TIRON_R);
            if (v) {
              // hacia su rumbo, en el sentido que menos gire
              let dif = ((v.dir - (cd + der)) % 180 + 180) % 180;
              if (dif > 90) dif -= 180;
              // y si esta demasiado cerca, la tendencia es apartarse
              if (v.d < D) {
                const fuera = Math.atan2(cy - v.qy, cx - v.qx) / RAD;
                dif = ((fuera - (cd + der)) % 360 + 540) % 360 - 180;
              }
              der += clamp(dif, -TIRON, TIRON);
            }
          }
          avanza(L / k, cd + der + (rng.bool(0.5) ? 1 : -1) * rng.range(vib.amp * 0.35, vib.amp));
        }
        cd += der; der = 0;   // la deriva se queda: el tramo siguiente sale de donde llegó
      } else {
        avanza(L, cd);
      }
      if (i < n - 1) {
        const gi = guion && guion.giros && guion.giros[i];
        if (gi) {
          if (gi.pliega) {
            const phi = gi.mag;
            cd += gi.lado * phi;
            avanza(D * 1.02 / Math.sin(phi * RAD), cd);
            cd += gi.lado * (180 - phi);
          } else {
            cd += gi.lado * gi.mag;
          }
        } else if (orto) {
          // a escuadra, y de vez en cuando media vuelta: la retícula del cartel
          if (rng.bool(pAlt)) lado = -lado;
          cd += lado * (rng.bool(0.16) ? 180 - rng.range(0, ORTO_ERR) : 90 + rng.range(-ORTO_ERR, ORTO_ERR));
        } else if (rumbos && rumbos.length && !(D && rng.bool(P_VOLTEA))) {
          // gira a OTRO rumbo de la obra, prefiriendo el de al lado — y DEL LADO QUE
          // MANDA LA MANO. Aquí había una moneda nueva en cada giro, y con moneda
          // nueva el recorrido es un paseo aleatorio: nunca cierra, gire lo que gire.
          if (rng.bool(pAlt)) lado = -lado;
          const salto = rng.bool(0.72) ? 1 : rng.int(2, max(2, rumbos.length - 1));
          cd = alRumbo(rng, cd + lado * salto * RUMBO_PASO[0], rumbos);
        } else if (D && rng.bool(P_VOLTEA)) {
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
          // los giros alternan de lado según la mano: alternando sale un zigzag y
          // sin alternar sale una vuelta, que es de lo que trata el cierre
          if (rng.bool(pAlt)) lado = -lado;
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
    // DOS COSAS Y NO UNA: el temblor rápido de la gubia, y la DERIVA — que el trazo
    // engorde y adelgace a lo largo de su recorrido.
    //
    // Medido con el mismo trazador por los dos lados: la anchura de un trazo de las
    // seis varía con un coeficiente de variación de 0,15 (0,08 en las finas, 0,28 en
    // el cartel) y la familia daba 0,05. Y no se arregla subiendo el temblor: `anchoEn`
    // promedia dos senos, así que la variación efectiva es la cuarta parte de lo que se
    // le pide — triplicando la amplitud el coeficiente pasaba de 0,05 a 0,07 y la banda
    // se deshilachaba. La variación del original no es de alta frecuencia: es que el
    // trazo tiene partes más gordas y partes más finas, una o dos ondas en todo el
    // recorrido. Eso es la deriva, y va con la amplitud entera.
    const a = Math.sin(u * gub.f1 + gub.p1), b = Math.sin(u * gub.f2 + gub.p2);
    const d = Math.sin(u * gub.fd + gub.pd);
    return W * (1 - gub.amp * (0.5 + 0.25 * (a + b)) - gub.der * 0.5 * (1 + d));
  }
  // CUÁNTO PUEDE RELLENAR CADA VÉRTICE. Es la lectura del detalle que mandó el
  // autor: en el original, el blanco entre dos bandas es una INCISIÓN de anchura
  // fija y el negro rellena todo lo demás. Por eso la banda de fuera de una curva
  // sale más gorda: lo que se mantiene constante es el MARGEN, no la anchura.
  //
  // Aquí eso se traduce en una cuenta por vértice: si el eje ajeno más cercano está
  // a `d`, mi tinta puede llegar a `d − W/2 − g` sin comerse el pelo de nadie. Con
  // `d = D = W+g` sale exactamente W/2, que es el bisel de siempre; con la hoja
  // vacía alrededor, sale el inglete entero y la esquina se rellena. La regla no se
  // afloja: se aplica donde de verdad está, que es entre TINTAS y no entre ejes.
  function holguras(ctx) {
    const h0 = ctx.W / 2, techo = ctx.W * RELLENO_MAX;
    for (let k = 0; k < ctx.trazos.length; k++) {
      const tr = ctx.trazos[k], out = [];
      for (let i = 0; i < tr.pts.length; i++) {
        const p = tr.pts[i];
        let d = Infinity;
        for (let j = 0; j < ctx.trazos.length; j++) {
          const o = ctx.trazos[j];
          for (let m = 0; m < o.segs.length; m++) {
            // los tramos vecinos del propio trazo no cuentan: son el codo
            if (j === k && m >= i - 2 && m <= i + 1) continue;
            const q = o.segs[m];
            const t2 = pointSegDist(p.x, p.y, q[0], q[1], q[2], q[3]);
            if (t2 < d) d = t2;
          }
        }
        out.push(clamp(d - h0 - ctx.g, h0, techo));
      }
      tr.relleno = out;
    }
  }

  // `anchos` (opcional) son las SEMIANCHURAS por vértice, en unidades de campo.
  // Sólo las usa la réplica: el original no tiene una anchura sola, y reconstruirlo
  // con la modal suelda las bandas que van a un pelo.
  function banda(ctx, pts, W, gub, relleno, anchos, mas) {
    // `mas` ensancha la banda: es el CORTE del halo, la misma banda un canal mas
    // gorda y un canal mas larga. Va por los dos sitios porque el cabo también es
    // un filo — si sólo se ensancharan los costados, el remate se soldaría a lo que
    // tuviera delante, que es la lección que TRZS ya tenía escrita.
    mas = mas || 0;
    const n = pts.length;
    if (n < 2) return;
    // LA ANCHURA SE MIDE ANTES DE ALARGAR. La gubia es funcion de la fraccion de arco
    // recorrida, asi que si se alarga el cabo primero, la fraccion se desplaza y el
    // perfil del CORTE deja de caer donde cae el de la TINTA. Con la gubia al maximo
    // eso son 0,015 anchuras de descuadre, que con canales de 0,12 son la cuarta parte
    // del canal — medido, dejaba pares de trazos a 0,29 g, y salia en las vibradas
    // porque son las que mas arco tienen. El corte tiene que ser LA MISMA forma.
    let hBase = null;
    if (mas > 0 && !anchos) {
      let t0 = 0; const Ls = [];
      for (let i = 0; i < n - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
        const m = hypot(dx, dy) || 1e-9; Ls.push(m); t0 += m;
      }
      hBase = []; let acc = 0;
      for (let i = 0; i < n; i++) { hBase.push(anchoEn(t0 > 0 ? acc / t0 : 0, W, gub) / 2); if (i < n - 1) acc += Ls[i]; }
    }
    if (mas > 0) {
      const alarga = (a, b) => {
        const dx = a.x - b.x, dy = a.y - b.y, m = hypot(dx, dy) || 1e-9;
        return { x: a.x + dx / m * mas, y: a.y + dy / m * mas };
      };
      pts = [alarga(pts[0], pts[1])].concat(pts.slice(1, n - 1), [alarga(pts[n - 1], pts[n - 2])]);
    }
    const nx = [], ny = [], L = [];
    let tot = 0;
    for (let i = 0; i < n - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y;
      const m = hypot(dx, dy) || 1e-9;
      nx.push(-dy / m); ny.push(dx / m); L.push(m); tot += m;
    }
    // media anchura en cada vértice, por longitud de arco recorrida
    const h = [];
    if (anchos && anchos.length === n) { for (const a2 of anchos) h.push(a2 + mas); }
    else if (hBase) { for (const a2 of hBase) h.push(a2 + mas); }
    else { let acc = 0;
      for (let i = 0; i < n; i++) { h.push(anchoEn(tot > 0 ? acc / tot : 0, W, gub) / 2 + mas); if (i < n - 1) acc += L[i]; } }
    const izq = [], der = [];
    for (let i = 0; i < n - 1; i++) {
      izq.push({ x: pts[i].x + nx[i] * h[i],         y: pts[i].y + ny[i] * h[i] });
      izq.push({ x: pts[i + 1].x + nx[i] * h[i + 1], y: pts[i + 1].y + ny[i] * h[i + 1] });
      der.push({ x: pts[i].x - nx[i] * h[i],         y: pts[i].y - ny[i] * h[i] });
      der.push({ x: pts[i + 1].x - nx[i] * h[i + 1], y: pts[i + 1].y - ny[i] * h[i + 1] });
      // EL RELLENO DE LA ESQUINA, en el vértice i+1 y sólo por FUERA del giro: se
      // mete el punto del inglete si cabe en la holgura que se calculó. Si no cabe,
      // no se mete y queda el bisel — que es el caso de siempre, junto al canal.
      //
      // El corte del halo YA NO PASA POR AQUI: se dibuja como el offset de la tinta
      // (ver `corte`), asi que esta esquina es solo la de la TINTA y `mas` vale cero.
      if (i < n - 2 && relleno) {
        const sx = nx[i] + nx[i + 1], sy = ny[i] + ny[i + 1], mm = hypot(sx, sy);
        if (mm > 1e-6) {
          const mx = sx / mm, my = sy / mm;
          const cos = max(mx * nx[i] + my * ny[i], 1e-3);
          const hIn = h[i + 1] - mas;
          const lim = relleno[i + 1] || hIn;
          // el inglete sale por el lado CONVEXO; el otro lado es el interior del
          // codo y ahí no hay nada que rellenar
          const cruz = nx[i] * ny[i + 1] - ny[i] * nx[i + 1];
          if (hIn / cos <= lim + 1e-9 && hIn / cos > hIn * 1.02) {
            const r = h[i + 1] / cos;
            if (cruz < 0) izq.push({ x: pts[i + 1].x + mx * r, y: pts[i + 1].y + my * r });
            else          der.push({ x: pts[i + 1].x - mx * r, y: pts[i + 1].y - my * r });
          }
        }
      }
    }
    ctx.moveTo(izq[0].x, izq[0].y);
    for (let i = 1; i < izq.length; i++) ctx.lineTo(izq[i].x, izq[i].y);
    for (let i = der.length - 1; i >= 0; i--) ctx.lineTo(der[i].x, der[i].y);
    ctx.closePath();
  }

  // EL CORTE ES EL OFFSET DE LA TINTA, y el canvas lo dibuja exacto sin aritmética.
  //
  // Rellenar la banda y además TRAZARLA con `lineWidth = 2·mas` y las uniones redondas
  // da exactamente {p : dist(p, banda) ≤ mas} — la suma de Minkowski con un disco, que
  // es la definición misma de «a menos de un canal». El cabo entra solo, por el remate
  // redondo, así que tampoco hace falta alargar el eje.
  //
  // Antes el corte se dibujaba como «la misma banda un canal más gorda», y eso NO es lo
  // mismo: en una esquina convexa el bisel sustituye el arco por su cuerda, y entre la
  // cuerda y el arco queda una cuña SIN CORTAR por donde se cuela la tinta del vecino a
  // menos de g. Es la cuarta puerta por la que entra el inglete en esta casa, y con esta
  // construcción se cierra sin un solo umbral: la punta del inglete ya no es un punto
  // que haya que desplazar a mano, es parte del contorno que se traza.
  function corte(ctx, pts, W, gub, relleno, anchos, mas) {
    ctx.beginPath();
    banda(ctx, pts, W, gub, relleno, anchos);
    ctx.fill();
    if (mas > 0) {
      ctx.save();
      ctx.lineWidth = 2 * mas; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
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

  // EL PUENTE: el tramo libre que lleva de una sección acompañada a la siguiente.
  // Sale por donde venía y entra por donde toca, con un codo en medio — no es un
  // segmento recto, que se leería como una grapa.
  function puente(rng, a, dirA, b, dirB, vib, D) {
    const d = hypot(b.x - a.x, b.y - a.y);
    if (d < 1e-9) return [a];
    const s = d * rng.range(0.24, 0.44);
    const p1 = { x: a.x + Math.cos(dirA * RAD) * s, y: a.y + Math.sin(dirA * RAD) * s };
    const p2 = { x: b.x - Math.cos(dirB * RAD) * s, y: b.y - Math.sin(dirB * RAD) * s };
    // se recorre el codo con `trazar` por tramos, para que herede temblor y deriva
    const out = [a];
    const tramo = (de, a2) => {
      const L = hypot(a2.x - de.x, a2.y - de.y);
      if (L < 1e-9) return;
      const dir = Math.atan2(a2.y - de.y, a2.x - de.x) / RAD;
      const q = trazar(rng, de.x, de.y, dir, L, 0, vib, D);
      // el temblor desvía el final: se reengancha al punto pedido
      q[q.length - 1] = a2;
      for (let i = 1; i < q.length; i++) out.push(q[i]);
    };
    tramo(a, p1); tramo(p1, p2); tramo(p2, b);
    return out;
  }

  // Cuántas vueltas da un corte de este largo. El ritmo es del material.
  function quiebrosPara(rng, largo, W) {
    const paso = W * rng.range(PASO[0], PASO[1]);
    return clamp(Math.round(largo / paso), QUIEBROS[0], QUIEBROS[1]);
  }

  // ── Colocar un trazo cumpliendo una relación ────────────────────────────────
  // Devuelve los puntos, o null si no cabe. La relación se DECLARA y aquí se
  // construye la geometría que la cumple — no se espera a que salga sola.
  function colocar(rng, ctx, rel, obj, largoRel, sangra, sep) {
    const { D, W } = ctx;
    const S = min(ctx.fw, ctx.fh);
    const largo = S * largoRel;
    const nq = quiebrosPara(rng, largo, ctx.W);

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
      const medio = desplazar(sub, sep, rng.bool(0.5) ? 1 : -1);
      if (medio.length < 2) return null;
      // LA SEGUNDA SECCIÓN. Un trazo que acompaña a UNO deja el grafo de relaciones
      // en árbol: N trazos, N−1 parejas, y la hoja se lee pobre por mucho que cada
      // pareja esté bien resuelta. En las referencias el grafo es una MALLA — cada
      // banda toca a varias— y eso es lo que hace el cuerpo. Así que un trazo puede
      // acompañar a uno, cruzar la hoja por un puente, y acompañar a OTRO.
      let pts2 = null;
      if (ctx.trazos.length >= 2 && rng.bool(P_DOBLE)) {
        const otros = ctx.trazos.filter(t => t.pts !== obj);
        const o2 = otros[rng.int(0, otros.length - 1)];
        const Lo2 = largoDe(o2.pts);
        const fr2 = clamp(largo * rng.range(0.22, 0.45) / (Lo2 || 1), 0.14, 1);
        const a2 = rng.range(0, max(0, 1 - fr2));
        const sub2 = trozo(o2.pts, a2, min(a2 + fr2, 1));
        if (sub2.length >= 2) {
          const m2 = desplazar(sub2, sep, rng.bool(0.5) ? 1 : -1);
          if (m2.length >= 2) pts2 = m2;
        }
      }
      const sobra = max(0, largo - largoDe(medio) - (pts2 ? largoDe(pts2) : 0));
      if (!pts2 && sobra < ctx.S * 0.04) return medio;
      // lo que sobra se reparte entre lo que viene ANTES y lo que sigue DESPUÉS
      const fPre = rng.range(0, 1);
      const dIn = dirEn(medio, 0), dOut = dirEn(medio, medio.length - 2);
      let pts = medio, dOut2 = null;
      // si hay segunda sección, el puente la engancha — y DESPUÉS sigue habiendo
      // tramo libre. Que aquí se devolviera el trazo ya cerrado era la causa de que
      // los trazos salieran simples: casi la mitad de ellos eran copia + puente +
      // copia, sin un solo metro andado por su cuenta. El detector lo cantaba y yo
      // no lo estaba leyendo — mediana 2,4 quiebros por trazo con [2,7] declarado.
      if (pts2) {
        // se engancha por el extremo que caiga más cerca, y si hace falta al revés
        const fin = pts[pts.length - 1];
        const d0 = hypot(pts2[0].x - fin.x, pts2[0].y - fin.y);
        const d1 = hypot(pts2[pts2.length - 1].x - fin.x, pts2[pts2.length - 1].y - fin.y);
        if (d1 < d0) pts2.reverse();
        const pu = puente(rng, fin, dOut, pts2[0], dirEn(pts2, 0), ctx.vib, D, ctx.orto);
        pts = pts.concat(pu.slice(1), pts2.slice(1));
        dOut2 = dirEn(pts2, pts2.length - 2);
      }
      const Lpost = (pts2 ? largo * rng.range(0.12, 0.34) : sobra * (1 - fPre));
      if (Lpost > ctx.S * 0.03) {
        const p = pts[pts.length - 1];
        const post = trazar(rng, p.x, p.y, (dOut2 != null ? dOut2 : dOut) + rng.range(-14, 14), Lpost,
                            quiebrosPara(rng, Lpost, ctx.W), ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos);
        pts = pts.concat(post.slice(1));
      }
      const Lpre = pts2 ? largo * rng.range(0.10, 0.30) : sobra * fPre;
      if (Lpre > ctx.S * 0.03) {
        // se traza hacia atrás desde el arranque y se le da la vuelta
        const p = medio[0];
        const pre = trazar(rng, p.x, p.y, dIn + 180 + rng.range(-14, 14), Lpre,
                           quiebrosPara(rng, Lpre, ctx.W), ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos);
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
      const nrm = p.dir + 90 * lado;
      return trazar(rng, p.x + Math.cos(nrm * RAD) * sep, p.y + Math.sin(nrm * RAD) * sep,
                    p.dir + lado * rng.range(7, 26), largo, nq, ctx.vib, D, ctx.orto,
                    null, null, ctx.cierre, ctx.trazos);
    }
    if (rel === 'tangencia' && obj) {
      // Se acercan a un mínimo PUNTUAL y se separan: cruzan en ángulo, y el punto
      // de paso se pone a la distancia del canal. Lo contrario de paralelo.
      const p = puntoEn(obj, rng.range(0.15, 0.85));
      const lado = rng.bool(0.5) ? 1 : -1;
      const sep = ctx.sep;
      const nrm = p.dir + 90 * lado;
      const cx = p.x + Math.cos(nrm * RAD) * sep, cy = p.y + Math.sin(nrm * RAD) * sep;
      const ang = p.dir + rng.range(22, 58) * (rng.bool(0.5) ? 1 : -1);
      // el punto de tangencia cae DENTRO del trazo, no en su cabo
      const atras = largo * rng.range(0.25, 0.6);
      return trazar(rng, cx - Math.cos(ang * RAD) * atras, cy - Math.sin(ang * RAD) * atras,
                    ang, largo, nq, ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos);
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
      const sep = ctx.sep;
      const x0 = p.x + Math.cos(sigue * RAD) * sep, y0 = p.y + Math.sin(sigue * RAD) * sep;
      return trazar(rng, x0, y0, sigue + rng.range(-34, 34), largo, nq, ctx.vib, D, ctx.orto,
                    null, ctx.rumbos, ctx.cierre, ctx.trazos);
    }
    if ((rel === 'caboCabo' || rel === 'caboCuerpo') && obj) {
      // Un extremo mío muere cerca de un extremo suyo (o de su costado), sin
      // tocarlo. El cabo es un suceso de la composición, no un resto.
      const f = rel === 'caboCabo' ? (rng.bool(0.5) ? 0 : 1) : rng.range(0.2, 0.8);
      const p = puntoEn(obj, f);
      const sep = ctx.sep;
      const hacia = rng.range(0, 360);
      const x0 = p.x + Math.cos(hacia * RAD) * sep, y0 = p.y + Math.sin(hacia * RAD) * sep;
      // sale ALEJÁNDOSE, si no se echa encima
      return trazar(rng, x0, y0, hacia + rng.range(-52, 52), largo, nq, ctx.vib, D, ctx.orto,
                    null, ctx.rumbos, ctx.cierre, ctx.trazos);
    }
    // suelto, o primer trazo: en cualquier sitio con aire DENTRO DE LA ZONA. Si
    // sangra, puede ARRANCAR fuera — el trazo entra desde detrás del marco en vez
    // de nacer dentro y morir en el borde. Es la mitad que faltaba del sangrado:
    // hasta ahora todos se iban, ninguno llegaba.
    const h = sangra ? -ctx.S * SANGRE + W / 2 : ctx.mg + W / 2 + 1e-4;
    const z = ctx.zona;
    // y el trazo nace YA en uno de los rumbos de la obra
    const dir0 = ctx.orto ? ctx.ejeBase + 90 * rng.int(0, 3) + rng.range(-ORTO_ERR, ORTO_ERR)
               : (ctx.rumbos && ctx.rumbos.length
                  ? rng.pickFrom(ctx.rumbos) + (rng.bool(0.5) ? 0 : 180) + rng.range(-RUMBO_ERR, RUMBO_ERR)
                  : rng.range(0, 360));
    return trazar(rng, rng.range(max(h, z.x0), min(ctx.fw - h, z.x1)),
                       rng.range(max(h, z.y0), min(ctx.fh - h, z.y1)),
                  dir0, largo, nq, ctx.vib, D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos);
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
  // ¿Cuánto se acercan dos tramos, y es legal? La regla vieja era «nunca por debajo
  // de D». La nueva la dijo el autor mirando el cartel: «a veces se superponen».
  //
  // Y reformulada es MÁS SIMPLE que la vieja, no más laxa. Entre dos ejes a
  // distancia `d`, el blanco que queda mide `d − W`. O sea:
  //
  //     d ≥ D  →  queda el pelo entero (g o más).      LEGAL
  //     d ≤ W  →  no queda blanco: se funden en negro.  LEGAL
  //     W < d < D  →  queda una RENDIJA más fina que el pelo.  PROHIBIDO
  //
  // Lo que se prohíbe no es tocarse: es la rendija. Un blanco más fino que el canal
  // no es una incisión, es suciedad — y es lo único que en las seis no aparece
  // nunca. La regla pasa de «no se tocan» a «el blanco es o el pelo, o nada».
  //
  // Con una salvedad: al cruzar, dos ejes pasan por fuerza por la franja prohibida
  // en el camino de D a W. Si el cruce es transversal eso dura un suspiro; si es casi
  // paralelo, deja una cuña blanca larga que se va afilando, que es justo lo feo. Por
  // eso el cruce exige ángulo.
  function bandaMala(A, B, ctx) {
    const d = segSegDist(A, B);
    if (d >= ctx.D - 1e-9) return false;          // el pelo entero
    if (d <= ctx.W) return false;                 // fundidos: no hay blanco
    return true;                                  // rendija
  }
  function anguloEntre(A, B) {
    const a1 = Math.atan2(A[3] - A[1], A[2] - A[0]), a2 = Math.atan2(B[3] - B[1], B[2] - B[0]);
    let d = abs((a1 - a2) / RAD) % 180;
    return d > 90 ? 180 - d : d;
  }

  // ¿Cae este tramo junto a un cambio de dirección de su propio trazo? Se mira el
  // giro en los vértices que lo abrazan, y en los de al lado por si el cruce ocurre
  // una pizca antes o después del codo.
  function juntoAQuiebro(pts, i, ctx) {
    const R = ctx.W * CRUCE_CERCA;
    for (let k = max(1, i - 2); k <= min(pts.length - 2, i + 3); k++) {
      const a1 = Math.atan2(pts[k].y - pts[k - 1].y, pts[k].x - pts[k - 1].x);
      const a2 = Math.atan2(pts[k + 1].y - pts[k].y, pts[k + 1].x - pts[k].x);
      let d = abs((a2 - a1) / RAD) % 360; if (d > 180) d = 360 - d;
      if (d < CRUCE_GIRO) continue;
      // el quiebro tiene que estar CERCA del tramo que cruza
      const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
      if (hypot(pts[k].x - mx, pts[k].y - my) <= R) return true;
    }
    return false;
  }

  // ¿Es esto un CRUCE ENTERO, o dos trazos arrimándose? Tres condiciones, y las tres
  // dicen lo mismo con distintas palabras: que uno pase por encima del otro y salga
  // por el otro lado.
  //
  //   · los ejes se cortan de verdad (no se rozan las bandas: se cortan las líneas);
  //   · el ángulo no es rasante, o sea que se lee como cruce y no como paralelo;
  //   · y ningún cabo se queda ENTERRADO dentro del otro trazo — ni los míos ni los
  //     suyos. Un remate que muere dentro de otra banda no es un cruce, es un trazo
  //     que se acabó donde no se le veía.
  function cruceEntero(pts, segs, otro, ctx) {
    const P = [];
    for (const a of segs) for (const b of otro.segs) {
      const c = corteDe(a, b);
      if (!c) continue;
      if (anguloEntre(a, b) < CRUCE_MIN) return false;   // rasante: eso es arrimarse
      P.push(c);
    }
    if (!P.length) return false;                         // se meten pero no se cruzan
    // Y NO BASTA CON QUE SE CRUCEN EN ALGUN SITIO. Sin esto, dos trazos que se cruzan
    // una vez quedaban autorizados a rozarse en cualquier otro punto de su recorrido
    // —el minimo global es cero por el cruce, asi que la comprobacion pasaba entera— y
    // ahi la incision no llega: se pinta en un disco alrededor del cruce, no por todo
    // el trazo. Medido: dejaba pares de tinta a 0,14 g. Cada acercamiento tiene que
    // estar en SU cruce o no valer.
    const R = ctx.W * RCRUCE_G;
    for (const a of segs) for (const b of otro.segs) {
      if (segSegDist(a, b) >= ctx.D - 1e-9) continue;
      const mx = (a[0] + a[2] + b[0] + b[2]) / 4, my = (a[1] + a[3] + b[1] + b[3]) / 4;
      let cerca = false;
      for (const c of P) if (hypot(c.x - mx, c.y - my) <= R) { cerca = true; break; }
      if (!cerca) return false;
    }
    const enterrado = (p, sg) => {
      let d = Infinity;
      for (const b of sg) d = min(d, pointSegDist(p.x, p.y, b[0], b[1], b[2], b[3]));
      return d < ctx.W;
    };
    if (enterrado(pts[0], otro.segs) || enterrado(pts[pts.length - 1], otro.segs)) return false;
    const q = otro.pts;
    if (q && (enterrado(q[0], segs) || enterrado(q[q.length - 1], segs))) return false;
    return true;
  }

  function cabeDuro(pts, ctx, sangra, cruza) {
    const h = ctx.W / 2, m = ctx.mg + h;
    // SANGRE mide el FILO DE LA TINTA, no el eje: si no, un trazo de gubia ancha
    // se pasa media anchura mas de lo declarado y el detector lo canta.
    const lim = sangra ? -ctx.S * SANGRE + h : m;
    for (const p of pts) {
      if (p.x < lim || p.x > ctx.fw - lim || p.y < lim || p.y > ctx.fh - lim) return false;
    }
    const segs = segsDe(pts);
    if (seCorta(segs, ctx.D)) return false;
    for (const t of ctx.trazos) {
      const dd = distTrazos(segs, t.segs);
      if (dd >= ctx.D - 1e-9) continue;                         // el caso corriente
      // CON HALO no hay rendija que temer: el canal se fabrica al pintar, así que un
      // acercamiento deja de ser un defecto y pasa a ser composición. Pero tiene que
      // ser una de las DOS lecturas, no un término medio.
      //
      // Ojo con el número: `distTrazos` devuelve CERO cuando dos ejes se cruzan de
      // verdad, así que un umbral del tipo «que no se acerquen más de 0,55 W»
      // rechaza TODOS los cruces y deja pasar sólo los roces. Es exactamente al
      // revés de lo que hace falta, y era lo que estaba escrito.
      if (ctx.halo > 0) {
        const met = 1 - dd / ctx.W;               // cuánto se meten: 0 rozarse, 1 coincidir
        if (met < SOLAPE_MIN) return false;       // roce o rendija: que se aparte
        if (!cruceEntero(pts, segs, t, ctx)) return false;
        continue;
      }
      // hay acercamiento: o es un cruce declarado y legal, o no cabe
      if (!cruza) return false;
      for (let ia = 0; ia < segs.length; ia++) for (const B of t.segs) {
        const A = segs[ia];
        if (!bandaMala(A, B, ctx)) continue;
        if (anguloEntre(A, B) < CRUCE_MIN) return false;
        // y tiene que pasar EN UN QUIEBRO MIO: si no, es un cruce cualquiera
        if (!juntoAQuiebro(pts, ia, ctx)) return false;
      }
    }
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

  function cabe(pts, ctx, sangra, cruza) {
    return cabeDuro(pts, ctx, sangra, cruza) && bastaVisto(pts, ctx, sangra);
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
  // ANTE UN ESTORBO EL TRAZO SE DESVÍA, NO SE ACORTA.
  //
  // Lo dijo el autor y la medida lo respalda: «si la paralelización es lo bastante
  // fuerte se da el solape; si no, el trazo tiende a paralelizarse o a irse a otro
  // lado». Hasta aquí la única salida ante un estorbo era `recortar` — quedarse con el
  // trozo más largo que cabe y tirar el resto— y eso explicaba cuatro rasgos a la vez:
  // medido con el mismo trazador por los dos lados, el largo del trazo salía 0,21
  // lados contra 0,30 de las referencias, el más largo 0,45 contra 0,77, los quiebros
  // por anchura 0,01 contra 0,20, y la línea total 4,3 contra 6,5. No eran cuatro
  // problemas: era uno. Un trazo truncado nunca llega a ser largo ni a dar sus
  // quiebros, y por eso la hoja se leía a base de palos en vez de a base de cintas.
  //
  // Y se veía en el número: pidiendo protagonistas de 2,05 · 2,6 · 3,2 y 4,0 lados
  // salían 4,55 · 4,46 · 4,47 · 4,61 de línea. Plano. La longitud pedida no mandaba
  // nada porque se tiraba entera.
  //
  // Así que el trozo que no cabe no se tira: se reencamina. Desde donde se paró, el
  // trazo sale por OTRO RUMBO DE LA OBRA con la longitud que le quedaba. Se prueba de
  // fuera hacia dentro y se queda el que cabe entero; si ninguno cabe, se recorta y se
  // vuelve a intentar. El desvío no inventa direcciones: usa el mismo alfabeto, así
  // que un trazo que esquiva sigue perteneciendo a la obra.
  // UNO, y satura ahí: medido sobre la geometría declarada, la línea total pasa de
  // 4,65 a 5,56 lados con el primer desvío y no se mueve con el segundo, el cuarto ni
  // el séptimo (5,56 los tres). El largo del trazo, de 0,65 a 0,81. Después del primer
  // desvío o cabe o lo que queda ya no da para otro.
  const DESVIOS = 1;
  // QUIÉN ESTORBA. Ante un bloqueo el trazo no gira a un rumbo cualquiera: gira al DEL
  // QUE LE CORTA EL PASO —para paralelizarse— o al que le ALEJA de él. Los dos los da
  // el estorbo, no la obra, así que hay que saber cuál es. Es, literalmente, el punto 5
  // del encargo: «si la paralelización es lo bastante fuerte se da el solape; si no, el
  // trazo tiende a paralelizarse o a irse a otro lado».
  function quienEstorba(p, ctx) {
    let mejor = null, dm = Infinity;
    for (const t of ctx.trazos) {
      for (let i = 0; i < t.pts.length - 1; i++) {
        const a2 = t.pts[i], b2 = t.pts[i + 1];
        const dx = b2.x - a2.x, dy = b2.y - a2.y, l2 = dx * dx + dy * dy;
        let u = l2 > 1e-18 ? ((p.x - a2.x) * dx + (p.y - a2.y) * dy) / l2 : 0;
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        const qx = a2.x + dx * u, qy = a2.y + dy * u;
        const d = hypot(p.x - qx, p.y - qy);
        if (d < dm) { dm = d; mejor = { d, dir: Math.atan2(dy, dx) / RAD, qx, qy }; }
      }
    }
    return mejor && mejor.d < ctx.D * 3 ? mejor : null;
  }
  function desviar(rng, pts, ctx, sangra, cruza) {
    const meta = largoDe(pts);
    // SIN EL VETO DE LONGITUD AQUÍ, y era el agujero grande. `recortar` devolvía null
    // cuando lo que salvaba no llegaba al mínimo, y `desviar` se rendía en esta línea:
    // o sea que el trazo bloqueado EN SU ARRANQUE —justo el que más necesita
    // desviarse— no llegaba nunca a intentarlo. Medido, el 34 % de las llamadas moría
    // ahí. El mínimo se comprueba al final, sobre el trazo ya reencaminado.
    let cur = recortar(pts, ctx, sangra, cruza, 0);
    if (!cur) return null;
    for (let v = 0; v < DESVIOS; v++) {
      const hecho = largoDe(cur);
      const falta = meta - hecho;
      if (falta < ctx.S * LARGO_MIN * 0.6) break;
      const n = cur.length;
      const p = cur[n - 1], q = cur[n - 2];
      const cd = Math.atan2(p.y - q.y, p.x - q.x) / RAD;
      let mejor = null, mejorL = hecho;
      // Los rumbos que el autor nombra, primero: paralelizarse con el que estorba, o
      // alejarse de él. Los de antes —girar un paso o dos desde donde iba— se quedan
      // detrás como salida general.
      const est = quienEstorba(p, ctx);
      const cand = [];
      if (est) {
        cand.push(alRumbo(rng, est.dir, ctx.rumbos));
        cand.push(alRumbo(rng, est.dir + 180, ctx.rumbos));
        cand.push(alRumbo(rng, Math.atan2(p.y - est.qy, p.x - est.qx) / RAD, ctx.rumbos));
      }
      for (const lado of [1, -1]) for (const salto of [1, 2])
        cand.push(alRumbo(rng, cd + lado * salto * RUMBO_PASO[0], ctx.rumbos));
      for (const nd of cand) {
        const cola = trazar(rng, p.x, p.y, nd, falta, quiebrosPara(rng, falta, ctx.W),
                            ctx.vib, ctx.D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos);
        if (!cola || cola.length < 2) continue;
        const junto = cur.concat(cola.slice(1));
        if (cabeDuro(junto, ctx, sangra, cruza)) {
          const L = largoDe(junto);
          if (L > mejorL) { mejorL = L; mejor = junto; }
        }
      }
      if (!mejor) break;
      cur = mejor;
    }
    return largoDe(cur) < ctx.S * LARGO_MIN ? null : cur;
  }

  // `minimo` es el suelo de longitud por debajo del cual no vale la pena devolver nada.
  // `desviar` pasa 0 a propósito: allí el recorte es un paso intermedio y el suelo se
  // comprueba al final, sobre el trazo ya reencaminado. Los demás no lo pasan y se
  // quedan con el de siempre.
  function recortar(pts, ctx, sangra, cruza, minimo) {
    if (cabeDuro(pts, ctx, sangra, cruza)) return pts;
    // NO ES MONOTONO, y por eso esto no puede ser una busqueda binaria.
    //
    // Con el solape binario, un trazo A MEDIO CRUZAR no cabe y el mismo trazo cruzado
    // ENTERO si. O sea que «lo que cabe» ya no es un intervalo desde cero: la binaria
    // asume que si cabe un trozo cabe cualquiera mas corto, y con esa suposicion se
    // para SIEMPRE justo antes del primer cruce, amputandole al trazo todo lo que
    // venia detras.
    //
    // Medido: el 64 % de los cabos moria contra otro trazo —recortado— y solo el 28 %
    // llegaba al aire; la hoja se quedaba en 4,1 lados de linea contra los 6,9 de las
    // referencias. La mitad del dibujo se perdia en esta suposicion.
    //
    // Se busca de fuera hacia dentro y se coge la primera que cabe, que es la mas
    // larga. Sin halo el predicado si es monotono y esto da exactamente lo mismo, asi
    // que no hay dos comportamientos: hay uno que ya no supone de mas.
    const PASOS = 24;
    const busca = (p) => {
      const L = largoDe(p);
      for (let k = PASOS; k >= 1; k--) {
        const t = L * k / PASOS;
        if (cabeDuro(prefijo(p, t), ctx, sangra, cruza)) return t;
      }
      return 0;
    };
    const aDelante = busca(pts);
    const rev = pts.slice().reverse();
    const aDetras = busca(rev);
    const L = max(aDelante, aDetras);
    if (L <= 0 || L < (minimo == null ? ctx.S * LARGO_MIN : minimo)) return null;
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
             p1: rng.range(0, 6.2832), p2: rng.range(0, 6.2832),
             der: ctx.gubAmp * rng.range(GUB_DERIVA[0], GUB_DERIVA[1]),
             fd: rng.range(0.6, 1.7) * 6.2832, pd: rng.range(0, 6.2832) };
  }

  // ── Las patas ───────────────────────────────────────────────────────────────
  // Varios trazos que CUELGAN del cuerpo en la misma dirección y mueren al aire, con
  // los cabos a ALTURAS DISTINTAS. Está en las referencias 1, 2 y 6 —el grabado del
  // recinto tiene tres colgando— y estaba en mi tabla de ejes desde el análisis, sin
  // implementar. Es lo que le da peso a la obra: el cuerpo arriba y las patas
  // bajando.
  //
  // Escalonadas, no alineadas: si acaban a la misma altura es un rastrillo. Ese
  // detalle está escrito en el análisis y es la diferencia entre una figura y un
  // objeto.
  function colgar(rng, ctx, n, largoRef) {
    if (!ctx.trazos.length) return 0;
    // la dirección de caída, una para todas: perpendicular al eje del cuerpo
    let sx = 0, sy = 0;
    for (const t of ctx.trazos)
      for (let i = 0; i < t.pts.length - 1; i++) { sx += abs(t.pts[i+1].x - t.pts[i].x); sy += abs(t.pts[i+1].y - t.pts[i].y); }
    const caida = (sx >= sy ? 90 : 0) + (rng.bool(0.5) ? 0 : 180) + rng.range(-12, 12);
    let puestas = 0;
    for (let k = 0; k < n; k++) {
      for (let t2 = 0; t2 < COLOCA; t2++) {
        const o = ctx.trazos[rng.int(0, ctx.trazos.length - 1)];
        const p = puntoEn(o.pts, rng.range(0.1, 0.9));
        // nace a un pelo del cuerpo, por el lado hacia el que se cae
        const x0 = p.x + Math.cos(caida * RAD) * ctx.sep, y0 = p.y + Math.sin(caida * RAD) * ctx.sep;
        // ESCALONADAS: cada pata mide distinto, y bastante
        const L = largoRef * rng.range(PATA_LARGO[0], PATA_LARGO[1]);
        let pts = trazar(rng, x0, y0, caida + rng.range(-14, 14), ctx.S * L,
                         quiebrosPara(rng, ctx.S * L, ctx.W), ctx.vib, ctx.D, ctx.orto,
                         null, ctx.rumbos, ctx.cierre, ctx.trazos);
        pts = cortarAlVolver(pts, ctx);
        pts = recortar(pts, ctx, false, false);
        if (!pts || largoDe(pts) < ctx.S * LARGO_MIN) continue;
        ctx.trazos.push({ pts, segs: segsDe(pts), rel: 'pata', gubia: gubiaDe(rng, ctx) });
        recentrar(ctx); puestas++; break;
      }
    }
    return puestas;
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
        const nq = quiebrosPara(rng, largo, ctx.W);
        let pts = trazar(rng, px - Math.cos(dir * RAD) * largo * 0.5,
                         py - Math.sin(dir * RAD) * largo * 0.5, dir, largo, nq, ctx.vib,
                         ctx.D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos);
        // el cerco también CRECE hasta donde cabe: ahora se pone después del
        // protagonista, así que casi siempre tiene que ceder algo contra él, y
        // rechazarlo entero dejaba recintos de dos cuerdas.
        pts = recortar(pts, ctx, false, false);
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
    // la zona también: banda gorda pide más papel para el mismo dibujo
    const zEsc = clamp(0.86 + 0.30 * ((W / S) / 0.065 - 1), 0.8, 1.25);
    const zw = clamp(rng.range(ZONA[0], ZONA[1]) * zEsc, 0.4, 1),
          zh = clamp(rng.range(ZONA[0], ZONA[1]) * zEsc, 0.4, 1);
    const zx = rng.range(0, 1 - zw), zy = rng.range(0, 1 - zh);
    const gubAmp = params.gubia != null ? params.gubia
                 : (rng.bool(P_GUBIA) ? rng.range(GUB_AMP[0], GUB_AMP[1]) : 0);
    const ctx = {
      fw, fh, S, W, g, D, mg: S * MARGEN, trazos: [], pSangra, gubAmp,
      halo: params.halo != null ? params.halo * W : g,
      // el pelo de ESTA obra: uno solo, para paralelos y para cabos
      sep: D * rng.range(SEP_OBRA[0], SEP_OBRA[1]),
      // la retícula, si la hay: es de la obra, y con su propio giro para que no
      // salgan todas alineadas con el pliego
      orto: params.orto != null ? !!params.orto : rng.bool(P_ORTO),
      ejeBase: rng.range(0, 90),
      // el alfabeto de direcciones de ESTA obra
      rumbos: (() => {
        const base = rng.range(0, 180);
        if (params.orto != null ? params.orto : false) return [base, base + 90];
        const k = rng.int(RUMBOS[0], RUMBOS[1]);
        const out = [base];
        let a = base;
        for (let i = 1; i < k; i++) { a += rng.range(RUMBO_PASO[0], RUMBO_PASO[1]); out.push(a); }
        return out;
      })(),
      // cuánto cierra el circuito ESTA obra. Del autor, y de obra: marca el carácter.
      cierre: params.cierre != null ? params.cierre : rng.range(CIERRE[0], CIERRE[1]),
      zona: { x0: zx * fw, y0: zy * fh, x1: (zx + zw) * fw, y1: (zy + zh) * fh },
      vib: vibra ? { amp: rng.range(VIB_AMP[0], VIB_AMP[1]), onda: W * rng.range(VIB_ONDA[0], VIB_ONDA[1]) } : null,
    };

    // LA ANCHURA MANDA SOBRE LO DEMÁS, y esto faltaba. Al subir la banda al doble, la
    // misma cuenta de trazos no cabe: cada uno ocupa 1,7 veces más suelo, el canal
    // `D = W+g` crece con ella, y `recortar` empieza a comerse los trazos por detrás
    // — medido, mediana de 2 quiebros por trazo con [2,7] pedido. Los trazos no
    // salían simples por falta de quiebros declarados: salían simples porque se
    // quedaban a medias.
    //
    // Y en la fuente la relación está: la referencia de banda más gorda (el cartel)
    // tiene SEIS bandas y mucho aire; la de banda más fina (el grabado del recinto)
    // tiene nueve apretadas. La anchura y la cuenta no son dos decisiones, son una.
    const escala = (W / S) / 0.065;
    let N = params.trazos ? params.trazos : rng.int(t.n[0], t.n[1]);
    if (!params.trazos) N = clamp(Math.round(N / Math.pow(escala, 0.85)), 3, 10);
    const relCount = {};
    for (const r of RELS) relCount[r] = 0;
    const pesos = RELS.filter(r => t.w[r] > 0).map(r => ({ n: r, prob: t.w[r] }));
    // la baraja de los cortos: el cabo manda y el acompañamiento casi desaparece
    const CORTOS = { paralelo: 0.10, abanico: 0.10, tangencia: 0.14,
                     continua: 0.20, caboCabo: 0.20, caboCuerpo: 0.26 };
    const pesosCortos = RELS.filter(r => CORTOS[r] > 0).map(r => ({ n: r, prob: CORTOS[r] }));
    // Cada trazo se pide AMBICIOSO y se recorta donde deja de caber, en vez de
    // rechazarse entero. Los reintentos son de SITIO —dónde y contra quién— y ya no
    // de longitud: la longitud sale del dibujo.
    const poner = (L, forzarSangre) => {
      // LA RELACIÓN DEPENDE DEL TAMAÑO. Un trazo largo puede acompañar a otro un buen
      // tramo; uno corto no —no da de sí— así que si se le pide `paralelo` sale una
      // piedrecita paralela a nada, y la hoja se llena de cascotes sueltos. En las
      // referencias los elementos pequeños MUEREN CONTRA el cuerpo: son cabos, no
      // acompañamientos. Así que por debajo de medio lado corto la baraja cambia.
      const corto = L < 0.5;
      const baraja = ctx.trazos.length === 0 ? null : (corto ? pesosCortos : pesos);
      const rel = baraja ? rng.weighted(baraja).n : 'suelto';
      // SANGRAR y CRUZAR son propiedades DEL TRAZO, así que se deciden una vez y no
      // en cada intento. Sorteándolas dentro del bucle, los intentos que cruzan
      // caben mejor —tienen menos restricción— y como se elige el más largo, ganaban
      // casi siempre: salían obras con cruces por todas partes. En la referencia un
      // cruce es un suceso, no la norma.
      const sangra = forzarSangre || rng.bool(ctx.pSangra), cruza = rng.bool(P_CRUZA);
      // LA GRAVEDAD, y los que se le escapan. Lo dijo el autor: «hay un primer trazo
      // que marca algo, y en torno a eso se generan los demás; a veces tienden a
      // alejarse, pero hay como una fuerza gravitacional que los lleva al centro. Y
      // hay otros que son outliers, que dan complejidad».
      //
      // Hasta aquí, de los 26 intentos se quedaba EL MÁS LARGO, y el más largo es
      // casi siempre el que se va lejos — por eso la hoja se abría en vez de hacer
      // cuerpo. Ahora se puntúa largo MENOS distancia al núcleo, así que entre dos
      // igual de largos gana el que se arrima. Y un trazo de cada cinco es OUTLIER:
      // se le quita la gravedad y se va donde quiera. Sin ellos la obra se cierra
      // sobre sí misma y se vuelve un ovillo; son los que dan el aire.
      const fuga = rng.bool(P_OUTLIER);
      const atrae = fuga ? 0 : ATRAE;
      let mejor = null, mejorP = -Infinity, mejorL = 0;
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
        // LA SEPARACIÓN ES DEL GRUPO. Si este trazo se engancha al último y el
        // último ya iba acompañando, es el MISMO haz: se hereda su canal. Si abre
        // grupo, se sortea uno nuevo. Sorteándolo por trazo, un peine de cuatro
        // salía con cuatro blancos distintos y se leía como cuatro parejas sueltas
        // en vez de como un cuerpo abierto — que es justo lo que da la cohesión.
        let pts = colocar(rng, ctx, rel, obj, L, sangra, ctx.sep);
        if (!pts || pts.length < 2) continue;
        pts = cortarAlVolver(pts, ctx);
        pts = desviar(rng, pts, ctx, sangra, cruza);
        if (!pts || pts.length < 2) continue;
        if (!bastaVisto(pts, ctx, sangra)) continue;
        const Lr = largoDe(pts);
        if (Lr < ctx.S * LARGO_MIN) continue;
        // se queda el intento MÁS LARGO, no el primero que cabe: con el recorte,
        // el primero que cabe cabe siempre, y quedarse con él es volver a dejar
        // que el azar del sitio elija la longitud.
        let punt = Lr;
        if (atrae && ctx.nucleo) {
          const m = puntoEn(pts, 0.5);
          punt -= atrae * hypot(m.x - ctx.nucleo.x, m.y - ctx.nucleo.y);
        }
        if (punt > mejorP) { mejor = pts; mejorP = punt; mejorL = Lr; }
        if (!atrae && Lr > L * ctx.S * 0.92) break;   // el que huye no busca más
      }
      if (!mejor) return 0;
      ctx.trazos.push({ pts: mejor, segs: segsDe(mejor), rel, sangra, cruza, fuga, gubia: gubiaDe(rng, ctx) });
      recentrar(ctx);
      relCount[rel]++;
      return mejorL / ctx.S;
    };

    // EL PROTAGONISTA PRIMERO, Y ANTES QUE EL CERCO. Con el cerco puesto primero,
    // el trazo largo entraba cuarto o sexto, con el centro de la hoja ya ocupado, y
    // se quedaba en uno más del montón: por eso los `recinto` salían de ocho trazos
    // cortos y ninguno mandaba. El cerco no pierde nada por ir detrás — se organiza
    // contra el trazo largo, que es lo que hace en las referencias.
    // Si la obra es de TRAVESÍA, al protagonista se le pide más que la diagonal y se
    // le deja sangrar por los dos cabos: entra por un borde y sale por otro.
    ctx.travesia = params.travesia != null ? !!params.travesia : rng.bool(P_TRAVESIA);
    const real = poner(ctx.travesia ? hypot(fw, fh) / S * rng.range(1.15, 1.5)
                                    : rng.range(PROTA[0], PROTA[1]), ctx.travesia);
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
    const hayPatas = rng.bool(P_PATAS);
    const tope = hayPatas ? max(2 + cerco, N - rng.int(PATAS[0], PATAS[1])) : N;
    for (let idx = 1 + cerco; idx < tope; idx++) {
      poner(max(L, LARGO_MIN * 1.2));
      L *= c0 * rng.range(0.92, 1.14);
    }

    // LAS PATAS, al final: cuelgan del cuerpo ya hecho. Y SALEN DE N, no se suman —
    // es el mismo error de contabilidad que ya se pago con el cerco, reintroducido
    // por la puerta de al lado: un `recinto` que declaraba 8 dibujaba 11. Cada vez
    // que se anade una figura nueva hay que decidir de donde sale su cuenta.
    let patas = 0;
    if (hayPatas) {
      const hueco = max(0, N - ctx.trazos.length);
      const nP = min(rng.int(PATAS[0], PATAS[1]), hueco);
      if (nP > 0) patas = colgar(rng, ctx, nP, real || 0.7);
    }

    holguras(ctx);
    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0, quiebros = 0;
    for (const tr of ctx.trazos) { vert += tr.pts.length; quiebros += tr.pts.length - 2; }
    // El REPARTO: cuánto mide el trazo mayor comparado con el mediano. Es la
    // jerarquía, en un número, y por eso se devuelve — se juzga en `falta`.
    const Ls = ctx.trazos.map(tr => largoDe(tr.pts) / S).sort((a, b) => a - b);
    const lMed = Ls.length ? Ls[Ls.length >> 1] : 0;
    const reparto = lMed > 0 ? Ls[Ls.length - 1] / lMed : 0;
    return { trazos: ctx.trazos, W, g, D, cerco, patas, relCount, vibra, orto: ctx.orto, travesia: ctx.travesia,
             // los dos de OBRA que los detectores necesitan y `ctx` no cruza sola:
             // el halo -para saber que regla toca- y el cierre -el carácter-
             halo: ctx.halo, cierre: ctx.cierre,
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
    // EL HALO. Dos trazos no se solapan nunca sin dejar suelo entre ellos, y la
    // manera de garantizarlo no es prohibir la rendija: es FABRICAR el canal. Cada
    // trazo, antes de pintarse, corta a su alrededor una franja del ancho del canal
    // de la obra. Así el margen no depende de acertar dos anchuras a la vez —que es
    // exactamente donde la réplica se rompía, y donde el autor lo venía viendo— sino
    // que sale constante por construcción. Es la incisión de TRZS: lo que separa dos
    // hebras no es un contorno, es el corte por donde se ve el suelo.
    //
    // Va en una capa aparte y se corta con `destination-out` en vez de pintar el
    // color del suelo, porque con fondo de degradado el suelo no es un color.
    //
    // El corte se extiende UN CANAL ENTERO más allá del filo, no medio. Con medio, dos
    // trazos solapados quedaban a g/2 y el invariante se caía justo donde tenía que
    // valer. Con uno entero queda garantizado por los dos lados: si se solapan, el
    // blanco mide g; si no llegan a tocarse, mide su hueco MÁS g. Nunca menos de g, y
    // eso es lo que hay que poder medir sobre el píxel.
    const halo = params.halo != null ? params.halo * best.W : best.g;
    // DÓNDE va la incisión: sólo en los CRUCES, no a lo largo de todo el trazo.
    //
    // Cortando el halo por todo el contorno se estropea justo lo que funcionaba. Dos
    // trazos que se acompañan están a `sep = D·[1,00–1,20]`, o sea que su canal YA mide
    // g o más; el segundo, al pintarse, le comía otro g al primero — el canal se
    // duplicaba y la banda de abajo salía adelgazada. La medida decía que el canal
    // seguía ancho y yo lo leía como «faltan contactos»; era esto.
    //
    // Y la regla del solape ya garantiza lo demás: o están a D o más —y entonces el
    // canal existe solo— o se cruzan enteros, y ahí sí hace falta el corte. Así que la
    // incisión se recorta a un disco alrededor de cada cruce. De paso sale la figura
    // que las referencias tienen y que el análisis llevaba nombrada sin implementar:
    // el pelo empieza y acaba DENTRO del negro.
    // LA INCISION CORRE CON EL TRAZO, no es un disco.
    //
    // Recortando el corte a un disco centrado en el cruce, la incision sale como una
    // mancha redonda y en un nudo apretado se astilla en esquirlas — se vio pasando por
    // aqui los ejes de la referencia del haz, que tiene DOS pelos largos y limpios y
    // salia con veinte trocitos. Un corte de gubia no es una mancha: es la raya que
    // deja el trazo que pasa por encima, y por tanto tiene la forma del que pasa y la
    // extension del que esta debajo.
    //
    // Asi que el recorte deja de ser un disco y pasa a ser LA BANDA DEL DE ABAJO: el
    // corte de k existe solo donde k esta encima de j, y ahi son las dos rayas de los
    // costados de k cruzando la banda de j. Que es exactamente lo que se ve en las
    // referencias. De paso desaparece el radio del disco, que era un numero que
    // elegir.
    const debajo = best.trazos.map(() => []);
    for (let k = 0; k < best.trazos.length; k++)
      for (let j = 0; j < k; j++) {
        let toca = false;
        for (const a of best.trazos[k].segs) {
          for (const b of best.trazos[j].segs) if (corteDe(a, b)) { toca = true; break; }
          if (toca) break;
        }
        if (toca) debajo[k].push(j);
      }
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(S, S);
    if (halo > 0) {
      const capa = ctx.canvas.ownerDocument.createElement('canvas');
      capa.width = W; capa.height = H;
      const cx = capa.getContext('2d');
      cx.translate(ox, 0); cx.scale(S, S);
      cx.fillStyle = rol.tinta;
      for (let k = 0; k < best.trazos.length; k++) {
        const tr = best.trazos[k];
        if (debajo[k].length) {
          cx.save();
          cx.beginPath();
          for (const j of debajo[k]) {
            const t2 = best.trazos[j];
            banda(cx, t2.pts, best.W, t2.gubia, t2.relleno, null, halo);
          }
          cx.clip();
          cx.globalCompositeOperation = 'destination-out';
          corte(cx, tr.pts, best.W, tr.gubia, tr.relleno, null, halo);
          cx.restore();
        }
        cx.globalCompositeOperation = 'source-over';
        cx.beginPath(); banda(cx, tr.pts, best.W, tr.gubia, tr.relleno);
        cx.fill();
      }
      ctx.restore();
      ctx.drawImage(capa, 0, 0);
      ctx.save();
    } else {
      ctx.beginPath();
      for (const tr of best.trazos) banda(ctx, tr.pts, best.W, tr.gubia, tr.relleno);
      ctx.fillStyle = rol.tinta;
      ctx.fill();
    }
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
             cierre: best.cierre,
             geo: { cintas: best.trazos.map(x => x.pts), sangra: best.trazos.map(x => !!x.sangra),
                    relleno: best.trazos.map(x => x.relleno || null),
                    cruza: best.trazos.map(x => !!x.cruza), CRUCE_MIN,
                    gubia: best.trazos.map(x => x.gubia || 0), debajo,
                    cierre: best.cierre, rumbos: best.rumbos,
                    // el halo de ESTA obra. Lo mira `canal.js`: la regla vieja -ningun
                    // par por debajo de D- vale donde NO hay halo, y donde lo hay no,
                    // porque ahi el canal se fabrica al pintar. Sin este dato el
                    // detector no puede saber cual de las dos reglas le toca.
                    halo: best.halo,
                    SANGRE, MARGEN, W: best.W, g: best.g, D: best.D,
                    S, ox, fw, fh, veto: null } };
  }

  // ── Componer a mano ─────────────────────────────────────────────────────────
  // La misma familia con la partitura escrita en vez de sorteada. NO es una puerta
  // trasera para los detectores —siguen midiendo `geo`, lo mismo que siempre— sino
  // la manera de hacer el ejercicio que pidió el autor: replicar cada referencia
  // CON ESTA GRAMÁTICA. Si una referencia no se deja escribir con estos movimientos,
  // el hallazgo es sobre la gramática, no sobre la referencia.
  //
  // La receta habla el vocabulario de la familia y nada más:
  //   { suelto:[x,y,dir], largo, giros:[…] }      un recorrido libre
  //   { paralelo:k, a, b, lado }                  desplazamiento de un trozo del k
  //   { continua:k, cabo, giro, largo, giros:[…] } el cabo nace del cabo del k
  //   { pata:k, f, dir, largo, giros:[…] }        cuelga del costado del k
  // Coordenadas en el CAMPO NORMALIZADO (lado corto = 1), como todo lo demás.
  function componer(ctx, W, H, receta, opts) {
    opts = opts || {};
    const palettes = opts.palettes || E.normalizePalettes(E.DEFAULTS);
    const seed = receta.seed || 1;
    const rng = new E.Rng(seed);
    const pal = opts.locked && palettes[opts.lockedIdx] ? palettes[opts.lockedIdx] : rng.weighted(palettes);
    const colors = pal.colors;
    const rol = E.inkRoles(colors, E.inkDice(rng, P_INV));

    const S = min(W, H), cuad = E.fieldMode(opts.params || {}) === 'square';
    const AW = cuad ? S : W, ox = (W - AW) / 2;
    // LA PROPORCIÓN, TAL CUAL, cuando la receta la trae. `nominalAspect` redondea a
    // la proporción del pliego (la DIN), que es lo correcto para GENERAR —una obra
    // nace para un papel— y es un error para REPLICAR: la obra original no tiene la
    // proporción de un DIN, tiene la suya. Ajustada una réplica al 97 % contra un
    // rasterizador propio, al pasarla por aquí bajaba a 94 %, y no era el dibujo:
    // era que el campo estaba estirado. Se descartaron antes la gubia, la escala y
    // el relleno de esquina, cada uno con su medida.
    const q = receta.alto ? max(receta.alto, receta.anchoLienzo || 1)
                          : E.nominalAspect(max(AW, H), min(AW, H));
    const fw = AW >= H ? q : 1, fh = AW >= H ? 1 : q;

    const Wb = min(fw, fh) * (receta.ancho || 0.065);
    void fw; void fh;
    const gam = receta.canal || 0.11, g = Wb * gam, D = Wb + g;
    const vib = receta.vibra === 0 ? null
              : { amp: receta.vibAmp || 4.2, onda: Wb * (receta.vibOnda || 1.8) };
    const cx2 = { fw, fh, S: min(fw, fh), W: Wb, g, D, mg: 0, trazos: [], sep: D * (receta.sep || 1.0), vib };

    for (const r of receta.trazos) {
      let pts = null;
      const gu = { giros: r.giros || [], pesos: r.pesos };
      if (r.eje) {
        // EL EJE DADO. Es la réplica exacta: la poligonal viene trazada del píxel de
        // una referencia (`referencias/traza.py`) y aquí sólo se le pone encima la
        // técnica de la casa — la banda con su bisel, la gubia y el canal. Lo que
        // quede distinto entre la réplica y el original ya no es de composición: es
        // de TÉCNICA, y por eso esto vale como fuente de verdad.
        pts = r.eje.map(q => ({ x: q[0], y: q[1] }));
      } else if (r.paralelo != null) {
        const o = cx2.trazos[r.paralelo].pts;
        const sub = trozo(o, r.a, r.b);
        pts = desplazar(sub, cx2.sep * (r.canales || 1), r.lado);
      } else if (r.continua != null) {
        const o = cx2.trazos[r.continua].pts;
        const p = puntoEn(o, r.cabo ? 1 : 0);
        const sigue = (r.cabo ? p.dir : p.dir + 180) + (r.giro || 0);
        pts = trazar(rng, p.x + Math.cos(sigue * RAD) * cx2.sep, p.y + Math.sin(sigue * RAD) * cx2.sep,
                     sigue, cx2.S * r.largo, 0, vib, D, false, gu);
      } else if (r.pata != null) {
        const o = cx2.trazos[r.pata].pts;
        const p = puntoEn(o, r.f);
        pts = trazar(rng, p.x + Math.cos(r.dir * RAD) * cx2.sep, p.y + Math.sin(r.dir * RAD) * cx2.sep,
                     r.dir, cx2.S * r.largo, 0, vib, D, false, gu);
      } else {
        pts = trazar(rng, r.suelto[0] * fw, r.suelto[1] * fh, r.suelto[2],
                     cx2.S * r.largo, 0, vib, D, false, gu);
      }
      cx2.trazos.push({ pts, segs: segsDe(pts), rel: 'receta', anchos: r.anchos,
                        // la holgura del codo, si la receta la trae: es cuanto se deja
                        // llenar la esquina, y con el inglete recortado ya es una
                        // magnitud continua en vez de un si o un no
                        relleno: r.holgura || null,
                        gubia: receta.gubia === 0 ? null : gubiaDe(rng, { gubAmp: receta.gubia || 0.09 }) });
    }
    // `relleno: 0` apaga el relleno de esquina. Lo pide la REPLICA, y por un motivo
    // que es en si un hallazgo: ajustada la replica hasta el 97 % contra un
    // rasterizador propio, al pasarla por `componer` bajaba a 94 %. La diferencia no
    // era la gubia ni la escala: es que la casa RELLENA LOS CODOS hacia el hueco y el
    // original no los rellena igual. Tres puntos de los seis que quedan estan ahi.
    if (receta.relleno !== 0 && !receta.trazos.some(r => r.holgura)) holguras(cx2);

    ctx.fillStyle = rol.suelo; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, 0); ctx.scale(S, S);
    // EL HALO TAMBIEN AQUI. Lo pide el laboratorio: poder ver una composicion dada
    // —la de una referencia, por ejemplo— dibujada con la mano entera de la casa y no
    // solo con su banda. Es el mismo corte que `render`, con los mismos discos en los
    // cruces, asi que no hay dos incisiones distintas segun por donde se entre.
    // Aqui va APAGADO por defecto, al reves que en `render`: una receta es una
    // transcripcion y no debe cambiar sola. Se pide con `halo: <fraccion de W>`.
    const halo2 = receta.halo ? receta.halo * Wb : 0;
    if (halo2 > 0) {
      // LA INCISION ES UNA DECISION, NO UNA CONSECUENCIA de que dos ejes se corten.
      //
      // Sin esta puerta, pasando por aqui los ejes transcritos de las seis referencias
      // el corte disparaba en CADA interseccion y convertia la masa en confeti: la
      // enmarcada, la litografia y la cuadrada quedaban hechas trizas, y el nudo
      // central de la litografia se llenaba de rectangulos blancos. El original de esa
      // litografia tiene un nudo enorme con DOS pelos, no veinte.
      //
      // La puerta es la MISMA que usa `render` para autorizar el solape —los ejes se
      // cortan de verdad, el angulo no es rasante, y ningun cabo muere enterrado dentro
      // del otro— asi que no hay dos incisiones distintas segun por donde se entre. En
      // `render` no cambia nada, porque alli los trazos ya nacen cumpliendola.
      const deb2 = cx2.trazos.map(() => []);
      for (let k = 0; k < cx2.trazos.length; k++)
        for (let j = 0; j < k; j++)
          if (cruceEntero(cx2.trazos[k].pts, cx2.trazos[k].segs, cx2.trazos[j], cx2))
            deb2[k].push(j);
      const capa2 = ctx.canvas.ownerDocument.createElement('canvas');
      capa2.width = W; capa2.height = H;
      const c2 = capa2.getContext('2d');
      c2.translate(ox, 0); c2.scale(S, S);
      c2.fillStyle = rol.tinta;
      for (let k = 0; k < cx2.trazos.length; k++) {
        const tr = cx2.trazos[k];
        if (deb2[k].length) {
          c2.save();
          c2.beginPath();
          for (const j of deb2[k]) {
            const t2 = cx2.trazos[j];
            banda(c2, t2.pts, Wb, t2.gubia, t2.relleno, t2.anchos, halo2);
          }
          c2.clip();
          c2.globalCompositeOperation = 'destination-out';
          corte(c2, tr.pts, Wb, tr.gubia, tr.relleno, tr.anchos, halo2);
          c2.restore();
        }
        c2.globalCompositeOperation = 'source-over';
        c2.beginPath(); banda(c2, tr.pts, Wb, tr.gubia, tr.relleno, tr.anchos);
        c2.fill();
      }
      ctx.restore();
      ctx.drawImage(capa2, 0, 0);
      ctx.save(); ctx.translate(ox, 0); ctx.scale(S, S);
    } else {
      ctx.beginPath();
      for (const tr of cx2.trazos) banda(ctx, tr.pts, Wb, tr.gubia, tr.relleno, tr.anchos);
      ctx.fillStyle = rol.tinta; ctx.fill();
    }
    // LAS INCISIONES. El pelo blanco de un original NO es un hueco entre dos bandas:
    // es un CORTE hecho encima. Se vio midiendo: el 100 % de la tinta que le sobra a
    // la replica, en las seis referencias, es canal del original que la replica tapa —
    // y estrechar la banda que lo tapa NUNCA mejora, en ninguna de las seis y con
    // ningun paso, o sea que la banda no esta gorda. Estan bien las dos y el blanco de
    // en medio se quita despues.
    //
    // Es la incision de la casa, la misma que `render` fabrica con el halo, aqui
    // llegando por receta porque la replica sabe donde estan: se leen del original.
    if (receta.cortes && receta.cortes.length) {
      ctx.beginPath();
      for (const c of receta.cortes) {
        const pts = c.eje.map(q => ({ x: q[0], y: q[1] }));
        banda(ctx, pts, Wb, null, null, c.anchos);
      }
      ctx.fillStyle = rol.suelo; ctx.fill();
    }
    ctx.restore();
    if (receta.grano !== 0) E.grain(ctx, W, H, colors, receta.grano == null ? 1 : receta.grano, E.unit(W, H, REF));

    const med = medir(cx2.trazos, Wb, fw, fh);
    return { pal, rol, cintas: cx2.trazos.length, ojos: med.ojos, ocupacion: med.ocupacion,
             geo: { cintas: cx2.trazos.map(x => x.pts), sangra: cx2.trazos.map(() => true),
                    relleno: cx2.trazos.map(x => x.relleno || null),
                    cruza: cx2.trazos.map(() => true), CRUCE_MIN,
                    // igual que en `render`: el halo se publica para que un detector
                    // sepa cual de las dos reglas le toca en vez de suponerla
                    halo: receta.halo != null ? receta.halo * Wb : g,
                    gubia: cx2.trazos.map(x => x.gubia || 0),
                    SANGRE, MARGEN, W: Wb, g, D, S, ox, fw, fh, veto: null } };
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
  // `banda` sale fuera para el DETECTOR, no para dibujar. `pelo.js` tiene que pintar
  // cada trazo con su etiqueta y con los mismos cortes que la obra publicada, y un
  // detector que reimplementa el dibujo mide su copia, no el dibujo.
  (global.HOKS = global.HOKS || {}).HRRS = { render, componer, traits, TIPOS, RELS, BG_GRADIENT, FORMATS, banda, corte };
})(typeof window !== 'undefined' ? window : globalThis);
