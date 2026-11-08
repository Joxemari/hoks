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
  const SOLAPE = 0.12;                     // el acompañante se solapa esto (× W): el pelo lo corta el halo

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
  const P_ORTO = 0.50;                     // la retícula del cartel y del grabado del haz: la mitad
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
  const P_SANGRA_OBRA = [0.10, 0.40];      // cuántos se salen, por obra
  const P_SECA = 0.55;                     // obras que no tocan el borde: en los grabados, la mayoría
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
  // DEL AUTOR, mirando los grabados: «no hay solapes si no son cruces claros;
  // si dos trazos se acercan de manera no perpendicular (o casi), lo que hacen es
  // paralelizarse». Un cruce es un suceso a escuadra; todo lo demás es carril.
  const CRUCE_MIN = 65;                    // grados: por debajo no hay cruce, hay acompañamiento
  // Y NO EN CUALQUIER SITIO. Lo dijo el autor: «el cruce tiene que ser muy, muy raro,
  // y normalmente debería darse sólo cuando hay un cambio de dirección en un trazo —
  // que parta en ángulo y cubra al trazo que tiene paralelo». O sea: no es que dos
  // trazos se atraviesen porque sí, es que uno DEJA a su acompañado, gira, y al
  // girar le pasa por encima. Así que el cruce tiene que caer junto a un quiebro mío
  // de verdad, no en mitad de un tramo recto.
  const CRUCE_GIRO = 40;                   // el quiebro que justifica el cruce
  const CRUCE_CERCA = 3.0;                 // cómo de cerca del quiebro, × W

  // ── La masa ─────────────────────────────────────────────────────────────────
  // MEDIDO SOBRE LAS REFERENCIAS con una sola regla (umbral de tinta, caja de la
  // figura, longitudes de las rachas): dentro de la caja de la figura hay un 23–56 %
  // de tinta, y del blanco que queda entre trazos, un 46–68 % son pelos (más
  // estrechos que media anchura). Lo nuestro, sobre 24 obras por configuración:
  // 21–30 % de tinta y 13–44 % de pelos — y NINGÚN MANDO LO MOVÍA: con 14 trazos
  // pedidos la tinta se quedaba en el 27 %. Más trazos no daban más masa porque
  // cada trazo nuevo se coloca buscando sitio, y el sitio que queda está siempre
  // lejos: la adyacencia era un premio del sorteo, no una pieza de la obra.
  //
  // Así que la densidad se DECLARA por obra, como la anchura o el pelo, y se
  // cumple pegando: un trazo de masa es un trozo de otro desplazado exactamente
  // un canal, que es la única manera de que el pelo salga constante. Es la regla 6
  // del análisis, literal: «toda masa ancha es N cintas adyacentes de la misma
  // anchura». La masa se mide sobre la geometría (tinta ≈ largo × anchura, caja =
  // la de los ejes más media anchura), sin pintar: es la misma cuenta que la regla
  // de arriba, a falta del bisel.
  const MASA = [0.25, 0.42];               // el rango que pide la referencia (hoy no se sortea)
  const MASA_MAX = 11;                     // techo de trazos, masa incluida
  const MASA_LARGO = 0.55;                 // un trazo de masa que no acompaña al menos esto, sobra

  // ── Los ejes de la obra ─────────────────────────────────────────────────────
  // Del autor, mirando las referencias: «debería haber una especie de variables
  // que determinen cómo van a ser: si son más rectos o menos rectos, si tienen
  // más vibración o menos, si están más concentrados o más separados. Y muy
  // importante: la paralelización cuando dos trazos pasan cerca». Cuatro ejes,
  // de OBRA (se sortean una vez por hoja, como la anchura), y cada uno con su
  // mando en el laboratorio para poder mirarlos de uno en uno.
  // Los rangos de `auto` miran a los grabados, no al centro del mando: trazos
  // largos y firmes, pegados cuando pasan cerca, apiñados en una parte del papel,
  // con poco temblor. Lo demás sigue ahí para el laboratorio.
  const PEGA  = [0.60, 1.00];              // cuánto se deja llevar un trazo por el que pasa cerca
  const RECTO = [0.55, 0.95];              // 1 = pocos quiebros y largos; 0 = muchos
  const VIBF  = [0.20, 0.60];              // factor sobre la amplitud del temblor
  const CONC  = [0.60, 0.95];              // 1 = la obra apiñada en poco papel; 0 = repartida
  const MASA_FALLOS = 10;                  // intentos seguidos sin colocar: se para
  const MASA_FR = [0.35, 0.95];            // qué parte del otro se acompaña
  const P_MASA_COLA = 0.35;                // y a veces sigue por su cuenta un poco

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
  // LOS TIPOS SON LAS LECTURAS DEL AUTOR SOBRE LOS GRABADOS (noviembre de 2026),
  // y cada uno fija sus EJES —no solo el reparto de relaciones—, porque en cada
  // grabado todas las decisiones van juntas:
  //   bloque    (ref. 2) «no hay cruces ni solapes»: una masa, retícula, banda
  //             gorda, sin salirse del papel, muchos paralelos, cabos al contorno.
  //   travesia  (ref. 3) «mucha paralelización, algunos cruces y terminaciones en
  //             perpendicular»: pocos trazos largos que atraviesan el pliego, a
  //             escuadra, un cruce claro, cabos que mueren contra un cuerpo.
  //   recinto   (ref. 1) «mucha concentración en un lado, amplitud en otro, trazo
  //             fino y muchísima paralelización»: banda fina, cerco arriba y las
  //             hebras colgando, apiñado en una parte del papel.
  //   haz       (ref. 6) los paralelos cortos engranados, dos peines.
  // `ejes` manda sobre los rangos globales de auto; un mando del laboratorio manda
  // sobre los dos.
  const TIPOS = {
    bloque:  { prob: 0.32, n: [6, 9], cerco: [0, 2],
               w: { paralelo: 0.46, abanico: 0.06, tangencia: 0.04, continua: 0.18, caboCabo: 0.10, caboCuerpo: 0.16 },
               ejes: { ancho: [0.70, 1.00], cruza: 0, orto: 0.9, conc: [0.70, 0.95], seca: 0.9, sangra: [0.1, 0.25],
                       relleno: [2.0, 2.6], pega: [0.8, 1.0], recto: [0.7, 0.95], travesia: 0, patas: 0.2 },
               reja: { n: [5, 8], ancho: [0.085, 0.11], zona: [0.70, 0.85], pega: 0.9, recto: 0.85, cruza: 0, largo: [0.8, 1.8], giros: 3, giro: 4, sangra: false, mano: [0.3, 0.8], ventanas: [0, 2] },
               libre: { n: [6, 9], ancho: [0.07, 0.10], zona: [0.6, 0.8], pega: 0.85, largo: [5, 12], ang: [40, 90], paso: [1.2, 3.0], alterna: 0.55, cruza: 0, sangra: false, coherente: 0.85, cobertura: [0.22, 0.42], companias: [0.7, 1.0] } },
    travesia:{ prob: 0.24, n: [4, 6], cerco: [0, 0],
               w: { paralelo: 0.50, abanico: 0.08, tangencia: 0.04, continua: 0.10, caboCabo: 0.04, caboCuerpo: 0.24 },
               ejes: { ancho: [0.80, 1.00], cruza: 0.45, orto: 0.85, conc: [0.30, 0.60], seca: 0.05, sangra: [0.5, 0.9],
                       relleno: [1.6, 2.2], pega: [0.8, 1.0], recto: [0.8, 1.0], travesia: 1, patas: 0.1 },
               reja: { n: [3, 4], ancho: [0.085, 0.11], zona: [1.0, 1.1], pega: 0.4, recto: 0.95, cruza: 0.7, largo: [1.0, 1.6], giros: 2, giro: 3, sangra: true, borde: true, mano: [0.3, 0.7], ventanas: [0, 1] },
               libre: { n: [3, 5], ancho: [0.08, 0.11], zona: [1.0, 1.0], pega: 0.8, largo: [10, 22], ang: [25, 50], paso: [1.5, 3.0], alterna: 0.8, cruza: 0.6, sangra: true, coherente: 0.5, cobertura: [0.2, 0.38], companias: [0.7, 1.0] } },
    recinto: { prob: 0.28, n: [7, 10], cerco: [3, 4],
               w: { paralelo: 0.52, abanico: 0.08, tangencia: 0.04, continua: 0.14, caboCabo: 0.08, caboCuerpo: 0.14 },
               ejes: { ancho: [0.35, 0.55], cruza: 0, orto: 0.7, conc: [0.80, 0.95], seca: 0.8, sangra: [0.1, 0.3],
                       relleno: [1.6, 2.2], pega: [0.9, 1.0], recto: [0.5, 0.8], travesia: 0, patas: 0.9 },
               reja: { n: [6, 9], ancho: [0.038, 0.052], zona: [0.55, 0.70], pega: 0.95, recto: 0.8, cruza: 0, largo: [0.6, 1.5], giros: 3, giro: 6, sangra: false, lado: 0.3, marco: true, mano: [0.4, 0.9], ventanas: [0, 1] },
               libre: { n: [12, 18], ancho: [0.025, 0.035], zona: [0.42, 0.55], pega: 0.92, largo: [15, 40], ang: [60, 100], paso: [2.0, 5.0], alterna: 0.6, cruza: 0, sangra: false, lado: 0.3, marco: true, cobertura: [0.07, 0.14], companias: [0.7, 1.0] } },
    haz:     { prob: 0.16, n: [5, 8], cerco: [0, 3],
               w: { paralelo: 0.50, abanico: 0.18, tangencia: 0.05, continua: 0.14, caboCabo: 0.06, caboCuerpo: 0.07 },
               ejes: { ancho: [0.6, 1.0], cruza: 0.05, orto: 0.6, conc: [0.6, 0.9], seca: 0.6, sangra: [0.1, 0.4],
                       relleno: [1.8, 2.6], pega: [0.7, 1.0], recto: [0.55, 0.9], travesia: 0.1, patas: 0.4 },
               reja: { n: [6, 9], ancho: [0.06, 0.09], zona: [0.6, 0.8], pega: 0.95, recto: 0.85, cruza: 0.05, largo: [0.5, 1.2], giros: 2, giro: 4, sangra: false, mano: [0.3, 0.8], ventanas: [0, 1] },
               libre: { n: [6, 10], ancho: [0.05, 0.08], zona: [0.55, 0.75], pega: 0.95, largo: [6, 12], ang: [15, 40], paso: [1.2, 2.6], alterna: 0.8, cruza: 0.05, sangra: false, coherente: 0.9, cobertura: [0.15, 0.32], companias: [0.75, 1.0] } },
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
  // El par de puntos más cercano entre dos tramos (el de a y el de b), para saber
  // hacia dónde acercarse. Si se cruzan, el punto de corte dos veces.
  function segSegPuntos(a, b) {
    const c = corteDe(a, b); if (c) return [c.x, c.y, c.x, c.y];
    const proy = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1e-12;
      const t = clamp(((px - x1) * dx + (py - y1) * dy) / L2, 0, 1);
      return [x1 + t * dx, y1 + t * dy];
    };
    let best = null, dm = Infinity;
    const prueba = (p, q) => { const d = hypot(p[0] - q[0], p[1] - q[1]); if (d < dm) { dm = d; best = [p[0], p[1], q[0], q[1]]; } };
    prueba([a[0], a[1]], proy(a[0], a[1], b[0], b[1], b[2], b[3]));
    prueba([a[2], a[3]], proy(a[2], a[3], b[0], b[1], b[2], b[3]));
    const p3 = proy(b[0], b[1], a[0], a[1], a[2], a[3]); prueba(p3, [b[0], b[1]]);
    const p4 = proy(b[2], b[3], a[0], a[1], a[2], a[3]); prueba(p4, [b[2], b[3]]);
    return best;
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
  // EL PASO 4 DEL AUTOR: «viendo el dibujo en general, se rellena hasta el margen».
  // No es una anchura mayor: es una PASADA POSTERIOR. La composición se hace con la
  // anchura base -por eso el trazo no se acorta por engordar- y al pintar la banda
  // crece hasta que el hueco con el vecino vale g. El reparto sale asimétrico solo, que
  // es por lo que el eje marcado a mano no cae en el centro visual de la banda.
  // El factor sale de dos sitios independientes y coinciden:
  //   · ajustando los cuatro pasos sobre los ejes que el autor marcó A MANO, la anchura
  //     base sale ~60 % de la final (r1 1,63× · r2 1,39 · r3 1,82 · r4 1,11 · r5 1,25 ·
  //     r6 1,68 — mediana 1,63);
  //   · y midiendo la tinta de la familia contra la de las referencias: a 1,6 sale 0,25,
  //     que es EXACTAMENTE el 0,25 de las seis, desde el 0,17 que daba sin rellenar.
  //
  // Lo demás que mueve, medido sobre el píxel con el mismo instrumento que las seis:
  //   acompañado 31,4 % → 41,4 % (referencias 37,7)   canal 0,51 → 0,36 W (0,24)
  // y la línea no se mueve (4,73 → 4,82), que es la prueba de que el relleno es una
  // pasada POSTERIOR: si engordara la banda antes de componer, el trazo se acortaría.
  //
  // Lo que NO arregla, y hay que decirlo: la constancia del canal baja de 0,25 a 0,20
  // contra 0,56 de las referencias.
  // APAGADO, y con su motivo. El número es correcto y la IMAGEN es peor: a 1,6 las
  // bandas se hinchan en bloques y se comen las incisiones -r5 y r6 quedan como papel
  // rasgado-. La causa es mía y es de bulto: esto engorda UNIFORME, y «rellenar hasta el
  // margen» sólo tiene sentido DONDE HAY MARGEN. Donde no hay vecino no hay nada hasta
  // lo que rellenar, y es justo donde más engorda. El 0,25 de tinta es el correcto y
  // está puesto en el sitio equivocado.
  //
  // La corrección es una condición más —que el vecino esté al alcance, `d2 <= alcance`—
  // y está a medio medir sobre los ejes que el autor marcó a mano. Queda el mecanismo
  // puesto y a 1,0 hasta que la medida diga con qué crece.
  const RELLENO_W = 1.0;
  // EL RELLENO HASTA EL MARGEN, por lados. Del autor: «el margen entre trazos
  // debería tender a ser homogéneo, para lo que hay que completar los espacios
  // entre los trazos, que realmente son líneas que luego se rellenan». O sea: la
  // composición son ejes; la tinta crece desde cada eje hacia el vecino hasta
  // dejar entre los dos EXACTAMENTE el pelo. Crece por cada lado lo que ese lado
  // tiene de sitio —(d − g)/2, la mitad del hueco menos el canal, así las dos
  // bandas se encuentran en el medio— y nunca más de `relleno` medias anchuras.
  // Donde no hay vecino al alcance la banda se queda en su anchura base: el
  // intento de engordar UNIFORME (1,6×) ya se midió y se tiró — engordaba justo
  // donde no había nada que rellenar. Es un eje de obra, con mando en el lab:
  // a 1,0 es la banda de siempre; a 2,4 la masa de la referencia 6.
  const RELLENO = [1.8, 2.6];
  const TIRON = 20;                        // grados por subdivisión
  const TIRON_R = 3.0;                     // radio de influencia, en canales D
  // EL SEQUITO: el acompanamiento como ESTADO, no como empujon. Capturado un vecino
  // -cerca y mas o menos al rumbo-, el trazo suspende su guion y viaja por su carril:
  // sigue el rumbo local del vecino con CONSIGNA DE DISTANCIA (el canal del grupo) y en
  // cada paso sortea seguir o soltarse. Es el punto 5 del encargo leido entero: la
  // tendencia tiene memoria.
  const SEQ_ANG = 65;      // capturable si no viene a escuadra: lo que no cruza, acompaña
  const P_CAPTA = 0.45;    // por subdivision: cuanto tarda en dejarse llevar
  const P_SUELTA = 0.12;   // por subdivision: cuanto dura el carril
  const SEQ_KP = 30;     // grados de correccion por canal de error de distancia
  const SEQ_MAX = 40;      // techo de la correccion
  function trazar(rng, x, y, dir, largo, nq, vib, D, orto, guion, rumbos, cierre, vecinos, sepV) {
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
    let seq = false;                        // ¿va por el carril de un vecino?
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
          // EL SEQUITO primero, y el tiron para el que va suelto. El tiron solo
          // -un controlador de rumbo sin consigna de distancia- se estanco en 26 %:
          // dejaba el canal ancho (0,49 W) e inconstante (0,26), y la racha moria en
          // la primera bisagra porque el giro del guion dispara ignorando si el punto
          // va acompanado. El estado arregla las tres cosas a la vez.
          if (vecinos && vecinos.length) {
            const v = vecinoEn(cx, cy, vecinos, D * (vib.radio || TIRON_R));
            if (seq && (!v || rng.bool(vib.suelta != null ? vib.suelta : P_SUELTA))) seq = false;   // se suelta
            if (!seq && v && rng.bool(vib.capta != null ? vib.capta : P_CAPTA)) {
              let dif = ((v.dir - cd) % 180 + 180) % 180;
              if (dif > 90) dif = 180 - dif;
              if (dif < SEQ_ANG) seq = true;                      // se deja llevar
            }
            if (seq && v) {
              // EL CARRIL: el rumbo del vecino en mi sentido, corregido hacia la
              // consigna. Las co-bisagras salen solas: cuando el vecino dobla, su
              // tangente local cambia y el servo dobla detras.
              let base = v.dir;
              const dcd = ((base - cd) % 360 + 540) % 360 - 180;
              if (abs(dcd) > 90) base += 180;
              const nx2 = (cx - v.qx) / max(1e-9, v.d), ny2 = (cy - v.qy) / max(1e-9, v.d);
              const cruz2 = Math.cos(base * RAD) * ny2 - Math.sin(base * RAD) * nx2;
              const err = (v.d - (sepV || D * 1.08)) / D;
              cd = base + clamp(err * SEQ_KP, -SEQ_MAX, SEQ_MAX) * (cruz2 > 0 ? -1 : 1);
              der = 0;
            } else if (v && TIRON > 0) {
              let dif = ((v.dir - (cd + der)) % 180 + 180) % 180;
              if (dif > 90) dif -= 180;
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
      // ACOMPANANDO, EL GIRO LO PONE EL CARRIL, no el guion privado: era lo que
      // mataba la racha en la primera bisagra. El giro perdido no se difiere -el
      // vecino ya esta doblando por los dos-.
      if (i < n - 1 && !seq) {
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
  // ── EL CAMPO: la tinta se calcula, no se dibuja ──────────────────────────────
  // Decisión del autor (noviembre de 2026), y es de arquitectura: HRRS se pinta
  // por CAMPO DE DISTANCIA, píxel a píxel, y no como polígonos. Es la lectura
  // literal de lo que dijo mirando los grabados: «el margen entre trazos debería
  // tender a ser homogéneo: los trazos son líneas que luego se rellenan».
  //
  // Para cada píxel: d1 = distancia al eje más cercano, d2 = al segundo (otro
  // trazo, o un tramo lejano del mismo: el pliegue). Hay tinta si d1 ≤ R —el radio
  // de relleno de ese trazo en ese punto— y d2 − d1 ≥ g: el pelo es la franja donde
  // los dos ejes están casi a la misma distancia, y mide g de verdad, en todas
  // partes, sin un solo escalón. Donde los ejes se separan, el pelo muere en punta
  // solo. Donde se CRUZAN (dos ejes que se cortan), manda el orden: el de arriba
  // va entero y al de abajo lo corta el halo del de arriba, que es lo que se ve en
  // el cartel de Múnich.
  //
  // Lo que cuesta: es píxel. Una A1 a 300 dpi son 70 Mpx; con la rejilla de
  // candidatos salen ~12 tramos por píxel y unos segundos de exportación. Y lo que
  // da: bordes lisos, el pelo exacto, y los cabos a escuadra —más allá del cabo la
  // distancia salta por encima de R, así que la banda acaba donde acaba el eje—.
  // Los codos salen redondos por fuera (es la distancia a una poligonal) y vivos
  // por dentro.
  const MITER = 2.0;                       // tope del pico del inglete, en radios
  // `etiquetas` (opcional): un Int32Array de Wpx×Hpx donde se apunta, para cada
  // píxel de tinta llena, el trazo (k+1) al que pertenece. Es para los detectores:
  // el pelo visible se mide sobre ESTE campo, que es lo publicado.
  function pintarCampo(ctx, trazos, Wf, gf, relleno, S, ox, tinta, Wpx, Hpx, cruza, etiquetas) {
    const n = trazos.length; if (!n) return;
    // sonda de depuración: global.__CAMPO_DBG = { pts: [[x, y], …], out: [] }
    const DBG = (global.__CAMPO_DBG && global.__CAMPO_DBG.pts) ? global.__CAMPO_DBG : null;
    const segs = [];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, Rmax = 0;
    trazos.forEach((tr, k) => {
      const p = tr.pts, Ls = []; let tot = 0;
      for (let i = 0; i < p.length - 1; i++) { const L = hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y); Ls.push(L); tot += L; }
      let acc = 0;
      for (let i = 0; i < p.length - 1; i++) {
        const L = Ls[i]; if (L < 1e-9) { continue; }
        const ax = ox + p[i].x * S, ay = p[i].y * S, bx = ox + p[i + 1].x * S, by = p[i + 1].y * S;
        const f0 = tot > 0 ? acc / tot : 0, f1 = tot > 0 ? (acc + L) / tot : 0;
        // `tr.W`: anchura propia del trazo, si la tiene (el calco de un original y, en
        // su día, el marco grueso con hebras finas); si no, la de la obra
        const Wt = tr.W || Wf;
        const R0 = anchoEn(f0, Wt, tr.gubia) * relleno / 2 * S, R1 = anchoEn(f1, Wt, tr.gubia) * relleno / 2 * S;
        Rmax = max(Rmax, R0, R1);
        segs.push({ k, i, ax, ay, bx, by, ux: (bx - ax) / (L * S), uy: (by - ay) / (L * S), len: L * S,
                    R0, R1, end0: i === 0, end1: i === p.length - 2, prev: null, next: null });
        x0 = min(x0, ax, bx); x1 = max(x1, ax, bx); y0 = min(y0, ay, by); y1 = max(y1, ay, by);
        acc += L;
      }
    });
    if (!segs.length) return;
    // cada tramo conoce a sus vecinos del mismo trazo: el inglete los necesita
    for (let q = 1; q < segs.length; q++)
      if (segs[q].k === segs[q - 1].k && segs[q].i === segs[q - 1].i + 1) { segs[q].prev = segs[q - 1]; segs[q - 1].next = segs[q]; }
    // el alcance de un tramo: su radio, el pico del inglete y el pelo. Con solo
    // R + g, la punta del codo (que llega a MITER·R del vértice) se quedaba fuera
    // de la lista de candidatos de su celda y el pelo se cerraba justo ahí.
    const gpx = gf * S, reach = MITER * Rmax + gpx + 2;
    const px0 = max(0, Math.floor(x0 - reach)), py0 = max(0, Math.floor(y0 - reach));
    const px1 = min(Wpx, Math.ceil(x1 + reach)), py1 = min(Hpx, Math.ceil(y1 + reach));
    const RW = px1 - px0, RH = py1 - py0; if (RW <= 0 || RH <= 0) return;
    // la rejilla de candidatos: cada tramo apuntado en las celdas que alcanza
    const CELL = 48, cols = Math.ceil(RW / CELL), rows = Math.ceil(RH / CELL);
    const cells = new Array(cols * rows); for (let c = 0; c < cells.length; c++) cells[c] = [];
    segs.forEach((sg, idx) => {
      const bx = sg.ax + sg.ux * sg.len, by = sg.ay + sg.uy * sg.len;
      const c0 = max(0, Math.floor((min(sg.ax, bx) - reach - px0) / CELL)), c1 = min(cols - 1, Math.floor((max(sg.ax, bx) + reach - px0) / CELL));
      const r0 = max(0, Math.floor((min(sg.ay, by) - reach - py0) / CELL)), r1 = min(rows - 1, Math.floor((max(sg.ay, by) + reach - py0) / CELL));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells[r * cols + c].push(idx);
    });
    const col = E.hexToRgb ? E.hexToRgb(tinta) : [0, 0, 0];
    let cx2 = null, img = null, data = null, capa = null;
    if (ctx) {
      const doc = ctx.canvas.ownerDocument || document;
      capa = doc.createElement('canvas'); capa.width = RW; capa.height = RH;
      cx2 = capa.getContext('2d');
      img = cx2.createImageData(RW, RH); data = img.data;
    }
    const cerca = (a, b) => a.k === b.k && abs(a.i - b.i) <= 2;   // el mismo trazo, tramos contiguos: el codo
    for (let gy = 0; gy < RH; gy++) {
      const py = py0 + gy + 0.5, row = Math.floor(gy / CELL) * cols;
      for (let gx = 0; gx < RW; gx++) {
        const px = px0 + gx + 0.5;
        const lista = cells[row + Math.floor(gx / CELL)];
        // Un candidato por trazo —su tramo más cercano— y, si el mismo trazo pasa
        // otra vez por aquí lejos de ese tramo (el pliegue), un segundo. Luego cada
        // candidato se juzga contra TODOS los demás, no solo contra el segundo más
        // cercano: con dos, un tramo lejano del propio trazo tapaba al que cruza y
        // el cruce se pintaba de una manera en un píxel y de otra en el de al lado.
        const ents = [];
        for (let q = 0; q < lista.length; q++) {
          const sg = segs[lista[q]];
          const vx = px - sg.ax, vy = py - sg.ay;
          const u = (vx * sg.ux + vy * sg.uy) / sg.len;
          const perp = abs(vx * sg.uy - vy * sg.ux);
          const uc = u < 0 ? 0 : u > 1 ? 1 : u;
          // LA BANDA SON PIEZAS, y la distancia es la mínima a cualquiera de ellas:
          //   · la FRANJA de cada tramo: el rectángulo de media anchura R entre sus
          //     dos extremos. Fuera de los extremos la distancia salta por encima de
          //     R (R + lo que se pasa), así que la franja acaba a escuadra;
          //   · el INGLETE de cada vértice interior: el cruce de las dos franjas
          //     prolongadas, limado a MITER radios del vértice, y cortado por el
          //     plano del cabo si uno de los dos tramos es el primero o el último.
          // Cada pieza da una distancia con pendiente 1 (es un máximo de distancias
          // a rectas y a planos), que es lo que el reparto del pelo necesita.
          const R = sg.R0 + (sg.R1 - sg.R0) * uc;
          const dxOut = u < 0 ? -u * sg.len : u > 1 ? (u - 1) * sg.len : 0;
          // dentro del tramo es la perpendicular a secas: max(perp, R + 0) daba R
          // en toda la franja —tinta a medias, un gris— en vez de la distancia.
          let d = dxOut > 0 ? max(perp, R + dxOut) : perp, sd = Infinity;
          // sd: la distancia de verdad al rectángulo del CABO, para que el vecino
          // que pase por delante se quede a g de ese borde y no del eje
          if (dxOut > 0 && ((u < 0 && sg.end0) || (u > 1 && sg.end1))) sd = hypot(max(0, perp - R), dxOut);
          if (sg.next) {
            const vec = sg.next, Rv = sg.R1;
            const wx = px - vec.ax, wy = py - vec.ay;
            const perp2 = abs(wx * vec.uy - wy * vec.ux);
            let dj = max(perp, perp2, hypot(wx, wy) - (MITER - 1) * Rv);
            if (sg.end0) { const u0 = (vx * sg.ux + vy * sg.uy) / sg.len; if (u0 < 0) dj = max(dj, Rv - u0 * sg.len); }
            if (vec.end1) { const u2 = (wx * vec.ux + wy * vec.uy) / vec.len; if (u2 > 1) dj = max(dj, Rv + (u2 - 1) * vec.len); }
            if (dj < d) d = dj;
          }
          if (d > reach && sd > reach) continue;
          // El candidato de un trazo es el tramo que lo deja MÁS DENTRO (R − d), no
          // el de eje más cercano: la gubia hace que R cambie a lo largo del trazo,
          // y con el eje más cercano un tramo fino ganaba a uno gordo y la banda
          // se quedaba sin tinta justo donde otro la cruzaba.
          const sc = R - d;
          let e0 = null, e1 = null, i0 = -1, i1 = -1;
          for (let t = 0; t < ents.length; t++) { const e = ents[t]; if (e.k !== sg.k) continue; if (e.far) { e1 = e; i1 = t; } else { e0 = e; i0 = t; } }
          if (!e0) ents.push({ k: sg.k, i: sg.i, d, R, sd, sc, far: false });
          else if (abs(sg.i - e0.i) <= 2) { if (sc > e0.sc) { e0.i = sg.i; e0.d = d; e0.R = R; e0.sc = sc; } if (sd < e0.sd) e0.sd = sd; }
          else if (sc > e0.sc) { ents[i0] = { k: sg.k, i: sg.i, d, R, sd, sc, far: false }; if (e1) { ents[i1] = e0; e0.far = true; } else { e0.far = true; ents.push(e0); } }
          else if (!e1) ents.push({ k: sg.k, i: sg.i, d, R, sd, sc, far: true });
          else if (sc > e1.sc) { e1.i = sg.i; e1.d = d; e1.R = R; e1.sd = sd; e1.sc = sc; }
        }
        if (!ents.length) continue;
        if (DBG && DBG.pts.some(q => q[0] === Math.floor(px) && q[1] === Math.floor(py)))
          DBG.out.push({ x: Math.floor(px), y: Math.floor(py), e: ents.map(e => e.k + ':' + e.i + (e.far ? 'f' : '') + ' d' + e.d.toFixed(1) + ' R' + e.R.toFixed(1) + (e.sd < Infinity ? ' sd' + e.sd.toFixed(1) : '')) });
        // cada candidato, contra todos los demás
        let a = -Infinity, de = -1;
        for (let t = 0; t < ents.length; t++) {
          const e = ents[t];
          let ae = e.R - e.d;                       // su propia banda
          if (ae + 0.5 <= 0) continue;
          for (let r = 0; r < ents.length && ae + 0.5 > 0; r++) {
            if (r === t) continue;
            const f = ents[r];
            // EL PELO SE REPARTE POR PROFUNDIDAD (R − d), no por distancia al eje:
            // la gubia hace que R cambie a lo largo del trazo, y comparando ejes el
            // representante de un trazo saltaba de un tramo a otro entre dos píxeles
            // vecinos (misma profundidad, distinta d) y el pelo se cerraba en el
            // salto. La profundidad es continua por construcción (es un máximo).
            if (f.k !== e.k && cruza.has(e.k < f.k ? e.k * 4096 + f.k : f.k * 4096 + e.k)) {
              // se cruzan: el de arriba (puesto después) va entero; al de abajo lo
              // corta el halo del de arriba
              if (f.k > e.k) ae = min(ae, -f.sc - gpx);
            } else {
              ae = min(ae, (e.sc - f.sc - gpx) / 2);   // el pelo, repartido a medias
              if (f.sd < Infinity) ae = min(ae, f.sd - gpx);   // y a g de su cabo
            }
          }
          if (ae > a) { a = ae; de = e.k; }
        }
        if (DBG && DBG.out.length && DBG.out[DBG.out.length - 1].x === Math.floor(px) && DBG.out[DBG.out.length - 1].y === Math.floor(py)) Object.assign(DBG.out[DBG.out.length - 1], { a: +a.toFixed(2), de });
        a = a + 0.5; if (a <= 0) continue; if (a > 1) a = 1;
        if (etiquetas && a >= 0.98) etiquetas[(py0 + gy) * Wpx + px0 + gx] = de + 1;
        if (!ctx) continue;
        const o = (gy * RW + gx) * 4;
        data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; data[o + 3] = Math.round(a * 255);
      }
    }
    if (!ctx) return;
    cx2.putImageData(img, 0, 0);
    ctx.drawImage(capa, px0, py0);
  }
  // El campo de una obra ya hecha, desde su `geo` publicada: las etiquetas por
  // píxel. Lo usa `verificacion/pelo.js`; no pinta nada.
  // ── El pintor de HALO: el lienzo nativo, en orden ───────────────────────────
  //
  // El campo de distancia (`pintarCampo`) pinta el pelo exacto, pero su geometría
  // de ingletes y cortes deja esquirlas y dientes en cada unión complicada, y
  // llevábamos tres vueltas peleando con el pintor en vez de con el dibujo. Esto
  // es el mismo principio del halo con el lienzo del navegador: cada trazo, en
  // orden, primero BORRA un halo de su anchura más dos pelos (destination-out,
  // sobre una capa transparente, así vale con cualquier fondo) y luego pinta su
  // banda. Donde pasa por encima deja el pelo exacto; donde dos corren a un canal
  // el blanco mide g; donde se funden, se funden. Sin ingletes que calcular.
  //
  // Y de paso la mano: el eje se SUAVIZA en las esquinas (radio `esquina` × W) y
  // la banda se construye muestra a muestra con la anchura de la gubia, así que el
  // trazo engorda y adelgaza a lo largo y el borde no es una regla. Los cabos van
  // a escuadra.
  const ESQUINA = 0;                       // radio de la esquina, × W: 0 = inglete vivo, el de la xilografía
  function suavizarEje(pts, r) {
    if (pts.length < 3 || r <= 0) return pts.slice();
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], p = pts[i], b = pts[i + 1];
      const la = hypot(p.x - a.x, p.y - a.y), lb = hypot(b.x - p.x, b.y - p.y);
      const ra = min(r, la * 0.45), rb = min(r, lb * 0.45);
      const p0 = { x: p.x + (a.x - p.x) / la * ra, y: p.y + (a.y - p.y) / la * ra };
      const p1 = { x: p.x + (b.x - p.x) / lb * rb, y: p.y + (b.y - p.y) / lb * rb };
      // bezier cuadrático p0 → p → p1, en 6 pasos
      for (let t = 0; t <= 1.0001; t += 1 / 6) {
        const u = 1 - t;
        out.push({ x: u * u * p0.x + 2 * u * t * p.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * p.y + t * t * p1.y });
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function bandaHalo(pts, Wt, gub, paso, mas) {
    // la banda como piezas que no se cruzan: RECTÁNGULOS por muestra a lo largo de
    // cada tramo (con la normal del tramo, así la gubia varía la anchura) y una CUÑA
    // en cada vértice por el lado exterior —vértice, esquina del tramo que llega, el
    // inglete (tope MITER; más allá, bisel) y esquina del tramo que sale—. Es la
    // construcción del campo, hecha con polígonos. Desplazar un eje por su normal
    // redondeaba toda esquina con radio de media anchura (gusanos) y un solo
    // polígono se cruzaba a sí mismo por dentro (triángulos vacíos).
    const n = pts.length; if (n < 2) return null;
    let tot = 0; const Ls = [];
    for (let i = 0; i + 1 < n; i++) { const L = hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y); Ls.push(L); tot += L; }
    if (tot < 1e-9) return null;
    const out = []; let acc = 0;
    const normal = i => { const L = Ls[i] || 1e-9; return { x: -(pts[i + 1].y - pts[i].y) / L, y: (pts[i + 1].x - pts[i].x) / L }; };
    const hEn = f => (Wt + (anchoEn(f, Wt, gub) - Wt) * 0.5) / 2 + mas;
    for (let i = 0; i + 1 < n; i++) {
      const L = Ls[i]; if (L < 1e-9) continue;
      const a = pts[i], b = pts[i + 1], nn = normal(i);
      const m = max(1, Math.ceil(L / paso));
      // UN polígono por tramo: el costado izquierdo de ida y el derecho de vuelta,
      // con la anchura de la gubia en cada muestra. En un tramo recto no se cruza.
      // Se alarga 0,6 px por los dos cabos interiores para que la junta con el
      // vecino no deje costura de antialias (trapecios sueltos dejaban dientes).
      // y en los cabos, el halo se alarga `mas`: un cabo apoyado contra un cuerpo
      // también deja su pelo (sin esto, pelo.js cantaba el cabo pegado al cuerpo)
      const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, e0 = i === 0 ? mas : 0.6, e1 = i + 2 >= n ? mas : 0.6;
      const izq = [], der = [];
      for (let k = 0; k <= m; k++) {
        const t = k / m, h = hEn((acc + L * t) / tot), ext = k === 0 ? -e0 : k === m ? e1 : 0;
        const px = a.x + (b.x - a.x) * t + ux * ext, py = a.y + (b.y - a.y) * t + uy * ext;
        izq.push({ x: px + nn.x * h, y: py + nn.y * h }); der.push({ x: px - nn.x * h, y: py - nn.y * h });
      }
      out.push(izq.concat(der.reverse()));
      if (i + 2 < n && Ls[i + 1] > 1e-9) {
        // la cuña del vértice b, por el lado exterior del giro
        const n2 = normal(i + 1), h = hEn((acc + L) / tot);
        const cruz = (b.x - a.x) * (pts[i + 2].y - b.y) - (b.y - a.y) * (pts[i + 2].x - b.x);
        const sg = cruz > 0 ? -1 : 1;   // exterior: el lado contrario al giro
        const e1 = { x: b.x + nn.x * h * sg, y: b.y + nn.y * h * sg }, e2 = { x: b.x + n2.x * h * sg, y: b.y + n2.y * h * sg };
        const bx = (nn.x + n2.x) * sg, by = (nn.y + n2.y) * sg, bm = hypot(bx, by);
        if (bm > 1e-6) {
          const cosH = (bx * nn.x * sg + by * nn.y * sg) / bm, esc = 1 / max(1e-6, cosH);
          if (esc <= MITER) out.push([b, e1, { x: b.x + bx / bm * h * esc, y: b.y + by / bm * h * esc }, e2]);
          else out.push([b, e1, e2]);   // bisel
        }
      }
      acc += L;
    }
    // EL HALO LLEVA UN DISCO EN CADA VÉRTICE. En una horquilla (giro de casi 180°)
    // la banda hace punta y el halo, que solo ensancha a los lados, no la cubre por
    // delante: un cuerpo que pase por ahí la toca (pelo.js lo cantó, 20 de 30). El
    // disco de radio h + g alrededor de cada vértice INTERIOR lo cierra. En los
    // cabos no: ahí el halo ya se alarga `mas` a escuadra, y un disco dejaba un
    // mordisco redondo en el cuerpo donde el cabo se apoya, que en los originales
    // es un corte recto.
    if (mas > 0) {
      let acc2 = 0;
      for (let i = 0; i < n - 1; i++) {
        acc2 += Ls[i];
        if (i + 1 >= n - 1) break;
        const h = hEn(acc2 / tot), q = [];
        for (let k = 0; k < 16; k++) q.push({ x: pts[i + 1].x + Math.cos(k * Math.PI / 8) * h, y: pts[i + 1].y + Math.sin(k * Math.PI / 8) * h });
        out.push(q);
      }
    }
    // todas con la misma orientación: nonzero suma, no resta
    for (let q of out) { let area = 0; for (let k = 0; k < q.length; k++) { const a2 = q[k], b2 = q[(k + 1) % q.length]; area += a2.x * b2.y - b2.x * a2.y; } if (area < 0) q.reverse(); }
    return out;
  }
  function pintarHalo(ctx, trazos, Wf, gf, S, ox, tinta, Wpx, Hpx, esquina, etiquetas) {
    const capa = document.createElement('canvas'); capa.width = Wpx; capa.height = Hpx;
    const c = capa.getContext('2d');
    const poly = (quads) => { c.beginPath(); for (const q of quads) { c.moveTo(q[0].x, q[0].y); for (let i = 1; i < q.length; i++) c.lineTo(q[i].x, q[i].y); c.closePath(); } c.fill(); };
    const r = (esquina != null ? esquina : ESQUINA) * Wf * S, paso = Wf * S / 6, gpx = gf * S;
    trazos.forEach((tr, k) => {
      const Wt = (tr.W || Wf) * S;
      const eje = suavizarEje(tr.pts.map(p => ({ x: ox + p.x * S, y: p.y * S })), r);
      const halo = bandaHalo(eje, Wt, tr.gubia, paso, gpx), banda = bandaHalo(eje, Wt, tr.gubia, paso, 0);
      if (!halo || !banda) return;
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; poly(halo);
      c.globalCompositeOperation = 'source-over';
      // con etiquetas: cada trazo con su color, en MÚLTIPLOS DE CUATRO: con alfa
      // premultiplicada el antialias desplaza el valor en uno o dos, y una etiqueta
      // contigua se leía como otro trazo pegado (pelo.js cantaba 70 de 75)
      const lab = (k + 1) * 4;
      c.fillStyle = etiquetas ? `rgb(${lab & 255},${(lab >> 8) & 255},0)` : tinta; poly(banda);
    });
    if (etiquetas) {
      const d = c.getImageData(0, 0, Wpx, Hpx).data;
      for (let i = 0; i < Wpx * Hpx; i++) etiquetas[i] = d[i * 4 + 3] > 200 ? Math.round((d[i * 4] + (d[i * 4 + 1] << 8)) / 4) : 0;
      return;
    }
    ctx.drawImage(capa, 0, 0);
  }

  function etiquetas(geo, Wpx, Hpx) {
    if (geo.pintor === 'halo') {
      const trazos = geo.cintas.map((pts, k) => ({ pts, gubia: geo.gubia ? geo.gubia[k] : null, W: geo.anchos ? geo.anchos[k] || undefined : undefined }));
      const et = new Int32Array(Wpx * Hpx);
      pintarHalo(null, trazos, geo.W, geo.g, geo.S, geo.ox, '#000', Wpx, Hpx, geo.esquina, et);
      return et;
    }
    const trazos = geo.cintas.map((pts, k) => ({ pts, gubia: geo.gubia ? geo.gubia[k] : null, W: geo.anchos ? geo.anchos[k] || undefined : undefined }));
    const cruza = new Set();
    if (geo.debajo) geo.debajo.forEach((lst, k) => lst.forEach(j => cruza.add(j * 4096 + k)));
    const et = new Int32Array(Wpx * Hpx);
    pintarCampo(null, trazos, geo.W, geo.g, geo.relleno || 1, geo.S, geo.ox, '#000000', Wpx, Hpx, cruza, et);
    return et;
  }

  function holguras(ctx) {
    const h0 = ctx.W / 2, techo = ctx.W * RELLENO_MAX;
    const techoLado = h0 * (ctx.relleno || 1);
    for (let k = 0; k < ctx.trazos.length; k++) {
      const tr = ctx.trazos[k], out = [], izq = [], der = [];
      for (let i = 0; i < tr.pts.length; i++) {
        const p = tr.pts[i];
        // la normal "izquierda" del vértice, la misma que usa `banda`
        const a = tr.pts[max(0, i - 1)], b = tr.pts[min(tr.pts.length - 1, i + 1)];
        const tx = b.x - a.x, ty = b.y - a.y, tm = hypot(tx, ty) || 1e-9;
        const nx = -ty / tm, ny = tx / tm;
        let d = Infinity, dI = Infinity, dD = Infinity;
        for (let j = 0; j < ctx.trazos.length; j++) {
          const o = ctx.trazos[j];
          for (let m = 0; m < o.segs.length; m++) {
            // los tramos vecinos del propio trazo no cuentan: son el codo
            if (j === k && m >= i - 2 && m <= i + 1) continue;
            const q = o.segs[m];
            const t2 = pointSegDist(p.x, p.y, q[0], q[1], q[2], q[3]);
            if (t2 < d) d = t2;
            // de qué lado cae ese tramo: por su punto medio
            const lado = ((q[0] + q[2]) / 2 - p.x) * nx + ((q[1] + q[3]) / 2 - p.y) * ny;
            if (lado >= 0) { if (t2 < dI) dI = t2; } else { if (t2 < dD) dD = t2; }
          }
        }
        out.push(clamp(d - h0 - ctx.g, h0, techo));
        // el relleno de cada lado: hasta el medio del hueco menos el pelo, y
        // nunca por debajo de la banda base ni por encima del techo de la obra
        izq.push(clamp((dI - ctx.g) / 2, h0, techoLado));
        der.push(clamp((dD - ctx.g) / 2, h0, techoLado));
      }
      tr.relleno = out;
      // EN CUÑA, no a escalones. El sitio de cada vértice sale de un vecino distinto
      // y la anchura saltaba de golpe donde cambia el vecino: dientes de sierra en el
      // costado. La tinta no puede ensancharse más deprisa de lo que avanza —una
      // pendiente de 1 : 1,15—, en los dos sentidos, así el relleno nace y muere en
      // punta, que es como muere el canal en la referencia (regla 8 del análisis).
      const PEND = 1 / 1.15;
      const cuna = v => {
        for (let i = 1; i < v.length; i++) {
          const L = hypot(tr.pts[i].x - tr.pts[i - 1].x, tr.pts[i].y - tr.pts[i - 1].y);
          if (v[i] > v[i - 1] + L * PEND) v[i] = v[i - 1] + L * PEND;
        }
        for (let i = v.length - 2; i >= 0; i--) {
          const L = hypot(tr.pts[i + 1].x - tr.pts[i].x, tr.pts[i + 1].y - tr.pts[i].y);
          if (v[i] > v[i + 1] + L * PEND) v[i] = v[i + 1] + L * PEND;
        }
        return v;
      };
      tr.lados = techoLado > h0 * 1.001 ? { izq: cuna(izq), der: cuna(der) } : null;
    }
  }

  // `anchos` (opcional) son las SEMIANCHURAS por vértice, en unidades de campo.
  // Sólo las usa la réplica: el original no tiene una anchura sola, y reconstruirlo
  // con la modal suelda las bandas que van a un pelo.
  function banda(ctx, pts, W, gub, relleno, anchos, mas, lados) {
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
    // el relleno hasta el margen va por LADOS: cada costado crece lo que su lado
    // tiene de sitio. Con `mas` (el corte) crece lo mismo que la tinta: el corte es
    // el offset de la tinta ya rellena, no de la base.
    const hI = h.slice(), hD = h.slice();
    if (lados && lados.izq.length === n) {
      for (let i = 0; i < n; i++) { hI[i] = max(h[i], lados.izq[i] + mas); hD[i] = max(h[i], lados.der[i] + mas); }
    }
    const izq = [], der = [];
    for (let i = 0; i < n - 1; i++) {
      izq.push({ x: pts[i].x + nx[i] * hI[i],         y: pts[i].y + ny[i] * hI[i] });
      izq.push({ x: pts[i + 1].x + nx[i] * hI[i + 1], y: pts[i + 1].y + ny[i] * hI[i + 1] });
      der.push({ x: pts[i].x - nx[i] * hD[i],         y: pts[i].y - ny[i] * hD[i] });
      der.push({ x: pts[i + 1].x - nx[i] * hD[i + 1], y: pts[i + 1].y - ny[i] * hD[i + 1] });
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
  function corte(ctx, pts, W, gub, relleno, anchos, mas, lados) {
    ctx.beginPath();
    banda(ctx, pts, W, gub, relleno, anchos, 0, lados);
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
  function quiebrosPara(rng, largo, W, recto) {
    // cuanto más recto, más larga la vuelta: es el eje `recto` de la obra
    const paso = W * rng.range(PASO[0], PASO[1]) * (recto == null ? 1 : 0.55 + 1.6 * recto);
    return clamp(Math.round(largo / paso), QUIEBROS[0], QUIEBROS[1]);
  }

  // ── Colocar un trazo cumpliendo una relación ────────────────────────────────
  // Devuelve los puntos, o null si no cabe. La relación se DECLARA y aquí se
  // construye la geometría que la cumple — no se espera a que salga sola.
  function colocar(rng, ctx, rel, obj, largoRel, sangra, sep) {
    const { D, W } = ctx;
    const S = min(ctx.fw, ctx.fh);
    const largo = S * largoRel;
    const nq = quiebrosPara(rng, largo, ctx.W, ctx.recto);

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
                            quiebrosPara(rng, Lpost, ctx.W, ctx.recto), ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos, ctx.sep);
        pts = pts.concat(post.slice(1));
      }
      const Lpre = pts2 ? largo * rng.range(0.10, 0.30) : sobra * fPre;
      if (Lpre > ctx.S * 0.03) {
        // se traza hacia atrás desde el arranque y se le da la vuelta
        const p = medio[0];
        const pre = trazar(rng, p.x, p.y, dIn + 180 + rng.range(-14, 14), Lpre,
                           quiebrosPara(rng, Lpre, ctx.W, ctx.recto), ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos, ctx.sep);
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
                    null, null, ctx.cierre, ctx.trazos, ctx.sep);
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
                    ang, largo, nq, ctx.vib, D, ctx.orto, null, null, ctx.cierre, ctx.trazos, ctx.sep);
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
                    null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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
                    null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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
                  dir0, largo, nq, ctx.vib, D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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
        const cola = trazar(rng, p.x, p.y, nd, falta, quiebrosPara(rng, falta, ctx.W, ctx.recto),
                            ctx.vib, ctx.D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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
                         quiebrosPara(rng, ctx.S * L, ctx.W, ctx.recto), ctx.vib, ctx.D, ctx.orto,
                         null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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
        const nq = quiebrosPara(rng, largo, ctx.W, ctx.recto);
        let pts = trazar(rng, px - Math.cos(dir * RAD) * largo * 0.5,
                         py - Math.sin(dir * RAD) * largo * 0.5, dir, largo, nq, ctx.vib,
                         ctx.D, ctx.orto, null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
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

  // ── La masa ─────────────────────────────────────────────────────────────────
  // Cuánta tinta hay dentro de la caja de la figura, por la geometría.
  function masaDe(ctx) {
    if (!ctx.trazos.length) return 0;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, L = 0;
    const m = ctx.mg + ctx.W / 2;
    const dentro = (x, y) => x > m && x < ctx.fw - m && y > m && y < ctx.fh - m;
    for (const t of ctx.trazos) {
      const p = t.pts;
      for (let i = 0; i < p.length - 1; i++) {
        // sólo cuenta lo que está en la hoja: lo que sangra no es tinta de la caja
        const dx = p[i + 1].x - p[i].x, dy = p[i + 1].y - p[i].y, seg = hypot(dx, dy);
        const ns = max(1, Math.ceil(seg / (ctx.W * 0.5)));
        for (let k = 0; k < ns; k++) {
          const u = (k + 0.5) / ns, x = p[i].x + dx * u, y = p[i].y + dy * u;
          if (!dentro(x, y)) continue;
          L += seg / ns;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (!(x1 >= x0)) return 0;
    const area = (x1 - x0 + ctx.W) * (y1 - y0 + ctx.W);
    return area > 0 ? min(1, L * ctx.W / area) : 0;
  }

  // La PARALELA de un trazo: su desplazado a `sep`, con las esquinas interiores
  // quitadas. `desplazar` mueve los vértices y en un codo cerrado el desplazado por
  // dentro se cruza consigo mismo y queda a menos de D del original — y `cabeDuro`
  // lo tiraba entero. Aquí se muestrea el trazo fino, se desplaza cada muestra por
  // su normal, se descartan las que caen a menos de `sep` del original (las del
  // codo interior) y se devuelve la racha más larga que queda.
  // `minimo` es lo que `cabeDuro` exige entre ejes (D): se filtra contra ESO y no
  // contra `sep`, porque entre dos muestras la cuerda cae un pelo por dentro en
  // los codos y a 0,985·D la regla tiraba la paralela entera.
  function paralela(pts, sep, lado, paso, minimo) {
    const segs = segsDe(pts);
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x, dy = pts[i + 1].y - pts[i].y, L = hypot(dx, dy);
      if (L < 1e-9) continue;
      const nx = -dy / L * lado, ny = dx / L * lado;
      const ns = max(1, Math.ceil(L / paso));
      for (let k = (i === 0 ? 0 : 1); k <= ns; k++) {
        const u = k / ns;
        out.push({ x: pts[i].x + dx * u + nx * sep, y: pts[i].y + dy * u + ny * sep });
      }
    }
    // fuera las muestras del codo interior; la racha más larga es la paralela
    let mejor = [], cur = [];
    for (const q of out) {
      let d = Infinity;
      for (const sg of segs) { const t = pointSegDist(q.x, q.y, sg[0], sg[1], sg[2], sg[3]); if (t < d) d = t; }
      if (d >= minimo) cur.push(q);
      else { if (largoDe(cur) > largoDe(mejor)) mejor = cur; cur = []; }
    }
    if (largoDe(cur) > largoDe(mejor)) mejor = cur;
    // y se SIMPLIFICA: `seCorta` mide tramos no adyacentes del mismo trazo, así
    // que un trazo muestreado más fino que D se "corta" consigo mismo a cada paso.
    // Con los vértices sobrantes fuera, los tramos vuelven a ser largos, como en
    // el trazo del que sale.
    return simplificar(mejor, paso * 0.18);
  }
  // Douglas–Peucker: quita los vértices que no apartan el trazo más de `tol`.
  function simplificar(pts, tol) {
    if (pts.length < 3) return pts;
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    const pila = [[0, pts.length - 1]];
    while (pila.length) {
      const [a, b] = pila.pop();
      let dm = -1, im = -1;
      for (let i = a + 1; i < b; i++) {
        const d = pointSegDist(pts[i].x, pts[i].y, pts[a].x, pts[a].y, pts[b].x, pts[b].y);
        if (d > dm) { dm = d; im = i; }
      }
      if (dm > tol) { keep[im] = 1; pila.push([a, im], [im, b]); }
    }
    const out = [];
    for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  }

  // Trazos de masa hasta llegar al objetivo: cada uno, un trozo de otro desplazado
  // un pelo. Se escoge a quién acompañar cerca del núcleo —como `paralelo`— para
  // que la masa crezca donde ya hay cuerpo y no se reparta. Devuelve cuántos puso.
  function engrosar(rng, ctx, objetivo) {
    let puestos = 0, fallos = 0;
    while (ctx.trazos.length < MASA_MAX && fallos < MASA_FALLOS && masaDe(ctx) < objetivo) {
      // a quién: el último dos de cada tres veces (así sale el haz), si no uno
      // cualquiera; y de él, el trozo que cae más cerca del núcleo
      const o = rng.bool(0.66) ? ctx.trazos[ctx.trazos.length - 1]
                               : ctx.trazos[rng.int(0, ctx.trazos.length - 1)];
      const fr = rng.range(MASA_FR[0], MASA_FR[1]);
      const aMax = max(0, 1 - fr);
      let a = rng.range(0, aMax);
      if (ctx.nucleo && aMax > 0) {
        let mejor = a, dMin = Infinity;
        for (let k = 0; k <= 6; k++) {
          const t = aMax * k / 6, p = puntoEn(o.pts, t + fr / 2);
          const d = hypot(p.x - ctx.nucleo.x, p.y - ctx.nucleo.y);
          if (d < dMin) { dMin = d; mejor = t; }
        }
        a = clamp(mejor + rng.range(-0.1, 0.1), 0, aMax);
      }
      const sub = trozo(o.pts, a, min(a + fr, 1));
      if (sub.length < 2) { fallos++; continue; }
      const sangra = !!o.sangra && rng.bool(0.7);
      const cola = rng.bool(P_MASA_COLA), Lc = ctx.S * rng.range(0.08, 0.22), giro = rng.range(-30, 30);
      // por los dos lados, y se queda el que más trazo deja
      let pts = null;
      for (const lado of (rng.bool(0.5) ? [1, -1] : [-1, 1])) {
        let q = paralela(sub, max(ctx.sep, ctx.D * 1.03), lado, ctx.W * 0.35, ctx.D * 1.005);
        if (q.length < 2) continue;
        // y a veces, al acabar de acompañar, sigue un poco por su cuenta
        if (cola) {
          const p = q[q.length - 1];
          const c = trazar(new E.Rng((rng.int(0, 1e9)) >>> 0), p.x, p.y, dirEn(q, q.length - 2) + giro, Lc,
                           quiebrosPara(rng, Lc, ctx.W, ctx.recto), ctx.vib, ctx.D, ctx.orto,
                           null, ctx.rumbos, ctx.cierre, ctx.trazos, ctx.sep);
          q = q.concat(c.slice(1));
        }
        q = cortarAlVolver(q, ctx);
        q = recortar(q, ctx, sangra, false, ctx.S * LARGO_MIN * 0.6);
        if (!q || (sangra && !bastaVisto(q, ctx, sangra))) continue;
        // un acompañamiento corto no es masa, es un diente: se tira
        if (largoDe(q) < largoDe(sub) * MASA_LARGO) continue;
        if (!pts || largoDe(q) > largoDe(pts)) pts = q;
      }
      if (!pts) { fallos++; continue; }
      ctx.trazos.push({ pts, segs: segsDe(pts), rel: 'masa', sangra, gubia: gubiaDe(rng, ctx) });
      recentrar(ctx); puestos++; fallos = 0;
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
    const t = TIPOS[tipo], ej = t.ejes || {};
    const S = min(fw, fh);
    const rr = (v, def) => rng.range((v || def)[0], (v || def)[1]);
    const W = params.ancho ? S * W_MAX * params.ancho : (ej.ancho ? S * W_MAX * rr(ej.ancho) : S * rng.range(W_MIN, W_MAX));
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam, D = W + g;
    const vibra = params.vibra != null ? !!params.vibra : rng.bool(P_VIBRA);
    const pega  = params.pega  != null ? params.pega  : rr(ej.pega, PEGA);
    const recto = params.recto != null ? params.recto : rr(ej.recto, RECTO);
    const vibF  = params.vibAmp != null ? params.vibAmp : rng.range(VIBF[0], VIBF[1]);
    const conc  = params.concentra != null ? params.concentra : rr(ej.conc, CONC);
    const relleno = params.relleno != null ? params.relleno : rr(ej.relleno, RELLENO);
    // Cuánto sangra ESTA obra: o nada, o entre poco y mucho. Es constante dentro
    // de la hoja, como la vibración — que unas se salgan y otras no es del cuadro,
    // no del trazo.
    const pSangra = params.sangra != null ? params.sangra
                  : (rng.bool(ej.seca != null ? ej.seca : P_SECA) ? 0 : rr(ej.sangra, P_SANGRA_OBRA));
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
    // la concentración manda sobre la zona: apiñada, los trazos se encuentran
    const zCon = 1.35 - 0.8 * conc;
    const zw = clamp(rng.range(ZONA[0], ZONA[1]) * zEsc * zCon, 0.3, 1),
          zh = clamp(rng.range(ZONA[0], ZONA[1]) * zEsc * zCon, 0.3, 1);
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
      orto: params.orto != null ? !!params.orto : rng.bool(ej.orto != null ? ej.orto : P_ORTO),
      pCruza: ej.cruza != null ? ej.cruza : P_CRUZA,
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
      // el temblor lleva dentro la PEGA: cuánto se captura, cuánto dura el carril
      // y desde qué distancia se nota el vecino. Van juntos porque `trazar` sólo
      // sigue a nadie cuando recorre el trazo paso a paso, que es lo que hace vibrado.
      vib: vibra ? { amp: rng.range(VIB_AMP[0], VIB_AMP[1]) * vibF, onda: W * rng.range(VIB_ONDA[0], VIB_ONDA[1]),
                     capta: 0.15 + 0.75 * pega, suelta: 0.02 + 0.30 * (1 - pega), radio: 1.5 + 3.0 * pega } : null,
      recto, pega, conc, relleno,
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
      const sangra = forzarSangre || rng.bool(ctx.pSangra), cruza = rng.bool(ctx.pCruza);
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
    ctx.travesia = params.travesia != null ? !!params.travesia : rng.bool(ej.travesia != null ? ej.travesia : P_TRAVESIA);
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
    const hayPatas = rng.bool(ej.patas != null ? ej.patas : P_PATAS);
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

    // LA MASA, la última: sobre la obra ya compuesta, se pega trazo a trazo hasta la
    // densidad declarada. Va después de las patas porque acompaña a lo que haya.
    // APAGADA POR DEFECTO, y con su motivo, medido: con la masa puesta la tinta en
    // la caja sube del 24 al 30 % y los pelos del 22 al 35 % —hacia las referencias,
    // 23–56 y 46–68— pero LA IMAGEN es peor: los trazos de masa salen cortos
    // (`recortar` los come contra el tercero) y se leen como dientes de peine, no
    // como cuerpo. Queda como mando del laboratorio para mirarla; `auto` no la sortea.
    const objMasa = params.masa != null ? params.masa : 0;
    const masaN = objMasa > 0 ? engrosar(rng, ctx, objMasa) : 0;
    const masa = masaDe(ctx);

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
    return { trazos: ctx.trazos, W, g, D, cerco, patas, masaN, masa, objMasa, pega, recto, vibF, conc, relleno, relCount, vibra, orto: ctx.orto, travesia: ctx.travesia,
             // los dos de OBRA que los detectores necesitan y `ctx` no cruza sola:
             // el halo -para saber que regla toca- y el cierre -el carácter-
             halo: ctx.halo, cierre: ctx.cierre,
             ojos: med.ojos, ocupacion: med.ocupacion,
             pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             largoMax: Ls.length ? Ls[Ls.length - 1] : 0, reparto,
             sangrados: ctx.trazos.filter(x => x.sangra).length };
  }

  // ── LA RETÍCULA: la composición de los grabados ─────────────────────────────
  // Del autor, viendo la tercera vuelta del modelo de trazos sueltos: «muchísimo
  // mordisco, poca coherencia estructural, sin clara relación entre trazos». La
  // relación no sale de premiar vecindades en un paseo libre; sale de una
  // RETÍCULA: bandas de la misma anchura W separadas por el pelo g, y cada trazo
  // es un recorrido por celdas de paso W + g. Gira a escuadra, prefiere correr
  // pegado a lo que ya hay (pega), y muere contra un cuerpo cuando no cabe (el
  // cabo a ras). Un cruce es un suceso: solo recto, solo sobre un tramo
  // perpendicular, uno por trazo, y lo declara el tipo. El pliegue son dos giros
  // seguidos del mismo lado. La retícula gira unos grados: no es un plóter.
  //
  // Dos cosas que la celda da gratis y el modelo anterior no conseguía: la
  // distancia entre ejes vecinos es EXACTAMENTE D = W + g, así que el pelo es
  // constante por construcción; y no hay solapes salvo el cruce declarado.
  function tramarReja(rng, fw, fh, tipo, params) {
    const t = TIPOS[tipo], rj = t.reja, ej = t.ejes || {};
    const S = min(fw, fh);
    const rr = (v, def) => rng.range((v || def)[0], (v || def)[1]);
    const W = params.ancho ? S * W_MAX * params.ancho : S * rr(rj.ancho);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam, D = W + g, P = D;
    const pega  = params.pega  != null ? params.pega  : rj.pega;
    const recto = params.recto != null ? params.recto : rj.recto;
    const conc  = params.concentra != null ? params.concentra : rr(ej.conc, CONC);
    const sangra = params.sangra != null ? params.sangra > 0 : rj.sangra;
    // TODO MANDO TIENE «AUTO» (lo que sortee el tipo) O UN VALOR, y la receta
    // guarda lo que se fijó: así un lote puede llevar un mando común a todas sus
    // piezas o distinto en cada una, según se tocara al apartarla.
    const pCruza = params.cruza != null ? params.cruza : rj.cruza;
    const maxGiros = params.giros != null ? params.giros : (rj.giros != null ? rj.giros : 99);
    const inclina = params.inclina != null ? params.inclina : rj.giro;
    // LA MANO: la retícula es de regla, el grabado no. Una deformación suave de
    // toda la hoja —dos ondas largas, de amplitud pequeña— curva un poco los
    // tramos largos y mueve juntos a los vecinos, así que el pelo no se resiente;
    // y el filo tiembla con la gubia. Es un eje: a 0 es un plóter.
    const mano = params.mano != null ? params.mano : rr(rj.mano, [0.3, 0.8]);
    const gubAmp = params.gubia != null ? params.gubia
                 : (rng.bool(P_GUBIA) ? rng.range(GUB_AMP[0], GUB_AMP[1]) * (0.5 + mano) : 0);
    // LAS VENTANAS: blancos cerrados dentro de la masa (ref. 2). Se declaran: un
    // rectángulo de celdas reservado, y dos eles de trazo alrededor que se
    // encuentran a un pelo. Lo demás crece pegado a ellas.
    const nVent = params.ventanas != null ? params.ventanas : rng.int((rj.ventanas || [0, 0])[0], (rj.ventanas || [0, 0])[1]);
    // LA ZONA: cuánto papel ocupa la retícula (concentración) y dónde. Si sangra,
    // la retícula es más grande que el pliego y los trazos salen por los bordes.
    const zf = sangra ? rr(rj.zona) : clamp(rr(rj.zona) * (1.25 - 0.5 * conc), 0.3, 1 - 2 * MARGEN);
    const zw = zf * fw, zh = zf * fh;
    const NX = max(4, Math.round(zw / P)), NY = max(4, Math.round(zh / P));
    let ox, oy;
    if (sangra) { ox = (fw - NX * P) / 2; oy = (fh - NY * P) / 2; }
    else {
      const m = MARGEN * S + W / 2;
      const lado = rj.lado != null ? rj.lado : 1;   // recinto: a un lado del papel
      ox = m + rng.range(0, max(0, fw - 2 * m - NX * P)) * lado;
      oy = m + rng.range(0, max(0, fh - 2 * m - NY * P));
    }
    const occ = new Int16Array(NX * NY).fill(-1), dirc = new Int8Array(NX * NY).fill(-1);
    const at = (r, c) => (r < 0 || c < 0 || r >= NY || c >= NX) ? -2 : occ[r * NX + c];
    const DIR = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const vecinos = (r, c, k) => { let n = 0; for (const [dr, dc] of DIR) { const v = at(r + dr, c + dc); if (v >= 0 && v !== k) n++; } return n; };
    const ctx = { fw, fh, S, W, g, D, mg: S * MARGEN, trazos: [], gubAmp, relleno: 1,
                  halo: params.halo != null ? params.halo * W : g };
    const pedidos = params.trazos ? params.trazos : rng.int(rj.n[0], rj.n[1]);
    const caminos = [];
    // cuántas celdas libres hay por delante desde (r,c) en la dirección d
    const libres = (r, c, d) => { let n = 0; while (at(r + DIR[d][0] * (n + 1), c + DIR[d][1] * (n + 1)) === -1) n++; return n; };
    // EL MARCO (ref. 1): el primer trazo es una U que cuelga del techo de la zona
    // —sube, cruza, baja—, y lo demás son hebras que cuelgan de ese techo.
    let marco = null;
    if (rj.marco) {
      const top = rng.int(0, max(0, Math.floor(NY * 0.25))), c0 = rng.int(0, max(0, Math.floor(NX * 0.2)));
      const c1 = min(NX - 1, c0 + rng.int(Math.floor(NX * 0.5), NX - 1 - c0 + 0));
      const h0 = rng.int(Math.floor(NY * 0.3), NY - 1), h1 = rng.int(Math.floor(NY * 0.3), NY - 1);
      marco = []; for (let r = h0; r >= top; r--) marco.push([r, c0]); for (let c = c0 + 1; c <= c1; c++) marco.push([top, c]); for (let r = top + 1; r <= h1; r++) marco.push([r, c1]);
    }
    let kBase = 0, ventanas = 0;
    for (let v = 0; v < nVent; v++) {
      const vw = rng.int(1, max(1, Math.floor(NX / 4))), vh = rng.int(1, max(1, Math.floor(NY / 4)));
      let puesto = false;
      for (let t2 = 0; t2 < 40 && !puesto; t2++) {
        const r0 = rng.int(1, NY - vh - 2), c0 = rng.int(1, NX - vw - 2);
        if (r0 < 1 || c0 < 1) break;
        let libre = true;
        for (let r = r0 - 1; r <= r0 + vh && libre; r++) for (let c = c0 - 1; c <= c0 + vw; c++) if (at(r, c) !== -1) { libre = false; break; }
        if (!libre) continue;
        for (let r = r0; r < r0 + vh; r++) for (let c = c0; c < c0 + vw; c++) occ[r * NX + c] = -3;   // blanco reservado
        // dos eles: techo + lado derecho, y suelo + lado izquierdo
        const L1 = [], L2 = [];
        for (let c = c0 - 1; c <= c0 + vw; c++) L1.push([r0 - 1, c]);
        for (let r = r0; r <= r0 + vh; r++) L1.push([r, c0 + vw]);
        for (let c = c0 + vw - 1; c >= c0 - 1; c--) L2.push([r0 + vh, c]);
        for (let r = r0 + vh - 1; r >= r0; r--) L2.push([r, c0 - 1]);
        for (const [cam, k] of [[L1, kBase], [L2, kBase + 1]]) {
          cam.forEach(([pr, pc], i) => { occ[pr * NX + pc] = k; const nx = cam[min(i + 1, cam.length - 1)]; dirc[pr * NX + pc] = nx[0] !== pr ? (nx[0] > pr ? 1 : 3) : (nx[1] > pc ? 0 : 2); });
          caminos.push({ k, path: cam, cruzado: false, cruceCon: -1 });
        }
        kBase += 2; ventanas++; puesto = true;
      }
    }
    for (let k = kBase; k < kBase + pedidos; k++) {
      let r = 0, c = 0, d = rng.int(0, 3), ok = false;
      if (k === kBase && marco) {
        if (marco.every(([pr, pc]) => at(pr, pc) === -1)) {
          marco.forEach(([pr, pc], i) => { occ[pr * NX + pc] = k; dirc[pr * NX + pc] = i < marco.length - 1 ? (marco[i + 1][0] !== pr ? (marco[i + 1][0] > pr ? 1 : 3) : (marco[i + 1][1] > pc ? 0 : 2)) : 1; });
          caminos.push({ k, path: marco, cruzado: false, cruceCon: -1 });
        }
        continue;
      }
      if (rj.borde) {
        // travesía: arranca en un borde, mirando hacia dentro
        for (let tr2 = 0; tr2 < 80 && !ok; tr2++) {
          const side = rng.int(0, 3);
          if (side === 0) { r = 0; c = rng.int(0, NX - 1); d = 1; } else if (side === 1) { r = NY - 1; c = rng.int(0, NX - 1); d = 3; }
          else if (side === 2) { c = 0; r = rng.int(0, NY - 1); d = 0; } else { c = NX - 1; r = rng.int(0, NY - 1); d = 2; }
          ok = at(r, c) === -1 && libres(r, c, d) >= 3;
        }
      } else if (marco && caminos.length) {
        // hebras que cuelgan del techo: nacen bajo el marco, pegadas a la anterior
        for (let tr2 = 0; tr2 < 80 && !ok; tr2++) {
          r = marco[0] ? min(NY - 1, Math.min(...marco.map(x => x[0])) + 1) : 0; c = rng.int(0, NX - 1); d = 1;
          ok = at(r, c) === -1 && libres(r, c, d) >= 2 && (rng.bool(pega) ? vecinos(r, c, k) > 0 : true);
        }
      } else {
        for (let tr2 = 0; tr2 < 80 && !ok; tr2++) {
          r = rng.int(0, NY - 1); c = rng.int(0, NX - 1); d = rng.int(0, 3);
          if (at(r, c) !== -1) continue;
          // un arranque con sitio por delante: los trazos nacen largos, no a trozos
          ok = libres(r, c, d) >= 3 && (caminos.length === 0 || (rng.bool(pega) ? vecinos(r, c, k) > 0 : true));
        }
      }
      if (!ok) continue;
      const largo = Math.round(max(NX, NY) * rr(rj.largo));
      const path = [[r, c]]; occ[r * NX + c] = k; dirc[r * NX + c] = d;
      let cruzado = false; const mano = rng.bool(0.5) ? 1 : 3;
      let cruceCon = -1, giros = 0;
      for (let i = 0; i < largo; i++) {
        const cands = [];
        for (const dd of (giros >= maxGiros ? [d] : [d, (d + 1) % 4, (d + 3) % 4])) {
          const nr = r + DIR[dd][0], nc = c + DIR[dd][1], v = at(nr, nc);
          if (v === -1) {
            let sc = dd === d ? recto * 3 : 1;
            sc += vecinos(nr, nc, k) * pega * 2;
            if (dd !== d && dd === (d + mano) % 4) sc += 0.3;
            cands.push({ dd, nr, nc, sc, cruce: -1 });
          } else if (v >= 0 && v !== k && dd === d && !cruzado && rng.bool(pCruza)) {
            const dj = dirc[nr * NX + nc];
            const nr2 = nr + DIR[dd][0], nc2 = nc + DIR[dd][1];
            if (dj >= 0 && (dj % 2) !== (d % 2) && at(nr2, nc2) === -1) cands.push({ dd, nr, nc, sc: 2, cruce: v });
          }
        }
        if (!cands.length) break;
        let pick;
        if (cands.length > 1 && rng.bool((1 - recto) * 0.25)) {
          const turns = cands.filter(x => x.dd !== d); pick = turns.length ? turns[rng.int(0, turns.length - 1)] : cands[0];
        } else {
          const tot = cands.reduce((a, x) => a + x.sc, 0); let v = rng.range(0, tot); pick = cands[cands.length - 1];
          for (const x of cands) { v -= x.sc; if (v <= 0) { pick = x; break; } }
        }
        if (pick.cruce >= 0) {
          cruzado = true; cruceCon = pick.cruce;
          r = pick.nr; c = pick.nc; path.push([r, c]);
          r += DIR[d][0]; c += DIR[d][1]; occ[r * NX + c] = k; dirc[r * NX + c] = d; path.push([r, c]);
          continue;
        }
        if (pick.dd !== d) giros++;
        d = pick.dd; r = pick.nr; c = pick.nc; occ[r * NX + c] = k; dirc[r * NX + c] = d; path.push([r, c]);
      }
      if (path.length < 3) { for (const [pr, pc] of path) if (occ[pr * NX + pc] === k) occ[pr * NX + pc] = -1; continue; }
      caminos.push({ k, path, cruzado, cruceCon });
    }
    // celdas → polilínea sin puntos colineales; la retícula girada unos grados; y
    // LA MANO: los tramos se vuelven a muestrear cada media celda para que la
    // deformación suave los curve, no solo los mueva
    const th = rng.range(-inclina, inclina) * RAD, cx = fw / 2, cy = fh / 2;
    const A = mano * 0.06 * P, l1 = P * rng.range(5, 8), l2 = P * rng.range(5, 8), f1 = rng.range(0, 6.2832), f2 = rng.range(0, 6.2832);
    const warp = p => ({ x: p.x + A * Math.sin(6.2832 * p.y / l1 + f1), y: p.y + A * Math.sin(6.2832 * p.x / l2 + f2) });
    let quiebrosReja = 0;
    for (const cam of caminos) {
      const pts0 = cam.path.map(([pr, pc]) => ({ x: ox + (pc + 0.5) * P, y: oy + (pr + 0.5) * P }));
      const esq = [pts0[0]];
      for (let i = 1; i < pts0.length - 1; i++) {
        const a = esq[esq.length - 1], b = pts0[i], q = pts0[i + 1];
        if (abs((b.x - a.x) * (q.y - b.y) - (b.y - a.y) * (q.x - b.x)) > 1e-9) esq.push(b);
      }
      esq.push(pts0[pts0.length - 1]);
      quiebrosReja += esq.length - 2;
      let pts = esq;
      if (A > 0) {
        pts = [esq[0]];
        for (let i = 0; i < esq.length - 1; i++) {
          const a = esq[i], b = esq[i + 1], n = max(1, Math.round(hypot(b.x - a.x, b.y - a.y) / (P * 0.5)));
          for (let j = 1; j <= n; j++) pts.push({ x: a.x + (b.x - a.x) * j / n, y: a.y + (b.y - a.y) * j / n });
        }
        pts = pts.map(warp);
      }
      for (const p of pts) { const x = p.x - cx, y = p.y - cy; p.x = cx + x * Math.cos(th) - y * Math.sin(th); p.y = cy + x * Math.sin(th) + y * Math.cos(th); }
      const fuera = pts.some(p => p.x < 0 || p.y < 0 || p.x > fw || p.y > fh);
      ctx.trazos.push({ pts, segs: segsDe(pts), rel: 'reja', sangra: fuera, cruza: cam.cruzado, gubia: gubiaDe(rng, ctx) });
    }
    holguras(ctx);
    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0;
    const quiebros = quiebrosReja;   // los giros de verdad, no los puntos de la mano
    for (const tr of ctx.trazos) vert += tr.pts.length;
    const Ls = ctx.trazos.map(tr => largoDe(tr.pts) / S).sort((a, b) => a - b);
    const lMed = Ls.length ? Ls[Ls.length >> 1] : 0;
    const base = rng.range(0, 180);
    return { trazos: ctx.trazos, W, g, D, cerco: ventanas, patas: 0, masaN: 0, masa: med.ocupacion, objMasa: 0, mano, ventanas,
             pega, recto, vibF: 0, conc, relleno: 1, relCount: { reja: ctx.trazos.length }, vibra: false,
             orto: true, travesia: !!sangra, halo: ctx.halo, cierre: CIERRE_POR, rumbos: [base, base + 90],
             modelo: 'reja', pedidos,
             ojos: med.ojos, ocupacion: med.ocupacion, pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             largoMax: Ls.length ? Ls[Ls.length - 1] : 0, reparto: lMed > 0 ? Ls[Ls.length - 1] / lMed : 0,
             sangrados: ctx.trazos.filter(x => x.sangra).length };
  }

  // ── EL MODELO LIBRE: la lógica de los calcos ─────────────────────────────────
  // Medido sobre el calco automático de tres grabados (noviembre de 2026): un
  // trazo quiebra 2–6 veces, a 27–55° (casi nunca a escuadra), en tramos de 0,8–2
  // anchuras, mide 5–12 anchuras, va PEGADO a otro trazo la mitad o la totalidad
  // de su recorrido, y 9 de cada 10 cabos mueren contra un cuerpo. Pintados con
  // nuestro campo, esos calcos dan el 88 % del original; forzados a una retícula
  // a escuadra, el 64 %. Así que la gramática es esta: polilíneas libres que
  // nacen como DESPLAZADO de un tramo de otra, a un pelo, y siguen por su cuenta.
  // APRETAR. Lo que hace compacta a la referencia 2 no es que los trazos sean
  // vecinos: es que entre dos trazos que no se acompañan tampoco hay más blanco
  // que un pelo. El paseo deja ríos —cada trazo arranca a un pelo pero se aleja—,
  // así que al final cada trazo (menos el primero) se traslada, sin girar, hacia
  // su vecino más cercano hasta que su hueco mínimo mide exactamente D de eje a
  // eje. Si al acercarse chocara con otro, se acerca solo lo que cabe. Dos
  // pasadas: la segunda recoge lo que la primera dejó libre.
  function apretar(ctx, D, DC) {
    const T = ctx.trazos; if (T.length < 2) return;
    const minA = (k, pts) => {
      // el hueco mínimo del trazo k (con ejes pts) al resto, y el par más cercano
      let dm = Infinity, px = 0, py = 0, qx = 0, qy = 0;
      for (let j = 0; j < T.length; j++) {
        if (j === k) continue;
        for (let i = 0; i + 1 < pts.length; i++) for (const q of T[j].segs) {
          const d = segSegDist([pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y], q);
          if (d < dm) { dm = d; const c = segSegPuntos([pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y], q); px = c[0]; py = c[1]; qx = c[2]; qy = c[3]; }
        }
      }
      return { dm, px, py, qx, qy };
    };
    const mueve = (pts, dx, dy) => pts.map(p => ({ x: p.x + dx, y: p.y + dy }));
    for (let pasada = 0; pasada < 2; pasada++) {
      for (let k = 1; k < T.length; k++) {
        const tr = T[k], m0 = minA(k, tr.pts);
        if (!(m0.dm > D * 1.02) || !isFinite(m0.dm)) continue;
        const vx = m0.qx - m0.px, vy = m0.qy - m0.py, vm = hypot(vx, vy) || 1e-9;
        const ux = vx / vm, uy = vy / vm;
        // cuánto: hasta que el hueco mida D; por bisección, porque al moverse
        // puede acercarse a otro antes
        let lo = 0, hi = m0.dm - D;
        for (let it = 0; it < 12; it++) {
          const mid = (lo + hi) / 2, p2 = mueve(tr.pts, ux * mid, uy * mid);
          if (minA(k, p2).dm >= DC) lo = mid; else hi = mid;
        }
        if (lo > 1e-6) { tr.pts = mueve(tr.pts, ux * lo, uy * lo); tr.segs = segsDe(tr.pts); }
      }
    }
  }

  // ── PARALELIZAR: el margen se homogeneiza en todo el cuadro ─────────────────
  //
  // El autor, mirando las hojas: «cuando trazos de Chillida se paralelizan, me da
  // igual si es la 1, 2 o 3, el margen entre trazos se homogeneiza prácticamente en
  // todo el cuadro. En tu caso hay distancias grandes y cortas». Y la regla que
  // propuso: el trazo es un conjunto de puntos, muchos, y cada punto está
  // paralelizado o no según la distancia a los trazos de alrededor.
  //
  // Eso es esto. Cada trazo se muestrea a un cuarto de anchura; de cada punto se
  // busca el tramo de otro trazo que corre casi paralelo (menos de 30°) más
  // cercano; si está a menos de `captura` por encima del canal, el punto se lleva
  // EXACTAMENTE al canal —a (Wi + Wj)/2 + g de eje a eje— y si no, queda libre.
  // Un punto no se mueve si al moverse se metería en el canal de un tercero. Tres
  // pasadas, porque al mover uno cambia lo que ve el siguiente; y al final el eje se
  // simplifica para que el campo pinte tramos y no un rosario de puntos.
  //
  // Los cabos que se encuentran en ángulo no se tocan: la regla es de lo que corre
  // paralelo, no de lo que se cruza o se apoya.
  const CAPTURA = 1.0;                     // × W: hasta aquí por encima del canal, el punto se pega
  const PARALELO_ANG = 30;                 // grados: por debajo, dos tramos «corren juntos»
  function paralelizar(ctx, g, captura) {
    const T = ctx.trazos; if (T.length < 2) return;
    const anchoDe = t => t.W || ctx.W;
    const paso = ctx.W / 4;
    const remuestrea = pts => { const out = [pts[0]];
      for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const L = hypot(b.x - a.x, b.y - a.y); const n = max(1, Math.round(L / paso));
        for (let m = 1; m <= n; m++) out.push({ x: a.x + (b.x - a.x) * m / n, y: a.y + (b.y - a.y) * m / n, esq: m === n }); }
      out[0].esq = true; return out; };
    // EL TRAZO SE MUEVE COMO UN CUERPO, no punto a punto. La primera versión llevaba
    // cada muestra al vecino más cercano por su cuenta y el eje salía como un
    // rosario: dos muestras seguidas veían dos vecinos distintos y el campo pintaba
    // esquirlas. Ahora el desplazamiento de cada muestra se calcula, se descartan las
    // rachas capturadas de menos de una anchura, se suaviza a lo largo del eje y se
    // limita a un tercio de anchura por pasada. Cuatro pasadas convergen.
    const TOPE = ctx.W * 0.3, RADIO = 6, MIN_RACHA = 6;
    for (let pasada = 0; pasada < 4; pasada++) {
      for (let k = 0; k < T.length; k++) {
        const tr = T[k], Wk = anchoDe(tr), dense = remuestrea(tr.pts);
        const n = dense.length, delta = new Float64Array(n), nxs = new Float64Array(n), nys = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const p = dense[i];
          const a = dense[max(0, i - 1)], b = dense[min(n - 1, i + 1)];
          const tx = b.x - a.x, ty = b.y - a.y, tm = hypot(tx, ty) || 1e-9;
          const ta = Math.atan2(ty, tx);
          nxs[i] = -ty / tm; nys[i] = tx / tm;
          let best = Infinity, bq = null, bj = -1;
          for (let j = 0; j < T.length; j++) { if (j === k) continue;
            for (const sg of T[j].segs) {
              const tb = Math.atan2(sg[3] - sg[1], sg[2] - sg[0]);
              let da = abs(((ta - tb) % Math.PI + Math.PI) % Math.PI); da = min(da, Math.PI - da);
              if (da > PARALELO_ANG * RAD) continue;
              const dx = sg[2] - sg[0], dy = sg[3] - sg[1], L2 = dx * dx + dy * dy || 1e-12;
              const u = clamp(((p.x - sg[0]) * dx + (p.y - sg[1]) * dy) / L2, 0, 1);
              const qx = sg[0] + u * dx, qy = sg[1] + u * dy, d = hypot(p.x - qx, p.y - qy);
              if (d < best) { best = d; bq = { x: qx, y: qy }; bj = j; } } }
          if (bj < 0 || best < 1e-9) continue;
          const D = (Wk + anchoDe(T[bj])) / 2 + g;
          if (best >= D + captura) continue;
          // de qué lado está el vecino, por la normal propia; el desplazamiento es
          // hacia él si hay hueco de más, y lejos si se mete en su canal
          const lado = ((p.x - bq.x) * nxs[i] + (p.y - bq.y) * nys[i]) >= 0 ? 1 : -1;
          delta[i] = lado * (D - best);
        }
        // rachas cortas fuera
        for (let i = 0; i < n;) { if (delta[i] === 0) { i++; continue; } let j = i; while (j < n && delta[j] !== 0) j++; if (j - i < MIN_RACHA) for (let m = i; m < j; m++) delta[m] = 0; i = j; }
        // los cabos no se doblan: heredan el desplazamiento del primer punto interior
        if (n > 3) { const c0 = delta[2], c1 = delta[n - 3]; delta[0] = delta[1] = c0; delta[n - 1] = delta[n - 2] = c1; }
        // suavizado triangular (ventana de ~3 anchuras) y tope
        const suave = new Float64Array(n);
        for (let i = 0; i < n; i++) { let acc = 0, wsum = 0; for (let r = -RADIO; r <= RADIO; r++) { const m = i + r; if (m < 0 || m >= n) continue; const w = RADIO + 1 - abs(r); acc += delta[m] * w; wsum += w; } suave[i] = clamp(acc / wsum, -TOPE, TOPE); }
        let movido = false;
        for (let i = 0; i < n; i++) {
          if (abs(suave[i]) < g * 0.05) continue;
          const p = dense[i], p2 = { x: p.x + nxs[i] * suave[i], y: p.y + nys[i] * suave[i] };
          // ¿se mete en el canal de un tercero? entonces se queda
          let libre = true;
          for (let j = 0; j < T.length && libre; j++) { if (j === k) continue; const Dj = (Wk + anchoDe(T[j])) / 2 + g;
            for (const sg of T[j].segs) if (pointSegDist(p2.x, p2.y, sg[0], sg[1], sg[2], sg[3]) < Dj * 0.97) { libre = false; break; } }
          if (!libre) continue;
          p.x = p2.x; p.y = p2.y; movido = true;
        }
        if (movido) { tr.pts = simplificar(dense, g * 0.6); tr.segs = segsDe(tr.pts); }
      }
    }
  }

  // ── El modelo CALCO: variaciones sobre los tres originales ──────────────────
  //
  // El autor, con el modelo libre todavía lejos de las referencias, pidió la vía
  // directa: calcar los tres originales y que las obras salgan de mutar ese calco
  // dentro de su misma lógica. Estos son los ejes y anchuras de cada trazo, sacados
  // con el trazador automático (esqueleto + transformada de distancia) de las tres
  // referencias, en unidades del lado corto. Pintados con el campo reproducen el
  // original al 88 % (recinto, travesía) y al 82 % (bloque).
  //
  // Lo que se muta, y nada más: simetrías y giro de la obra entera, quitar 1–4
  // trazos de entre los cortos, alargar o acortar cabos (hasta donde cabe), redoblar
  // una cola alrededor de un codo, mover un trazo media anchura, temblar los
  // vértices, y añadir 1–3 acompañantes nuevos (desplazados de una sección de un
  // trazo, a un pelo). Cada operación se comprueba contra el canal —a (Wi+Wj)/2 + g
  // de eje a eje, y un cabo contra un cuerpo a Wj/2 + g— y se revierte si no cabe.
  // Los cruces del original (solo la travesía los tiene) se respetan.
  //
  // Dicho con todas las letras: son obras derivadas de tres piezas concretas de
  // Chillida. El autor lo decidió sabiéndolo.
  const CALCOS = {
    recinto: { w: 1.000, h: 1.153, trazos: [
      { W: 0.027, pts: [[0.445,0.59],[0.418,0.575],[0.415,0.55],[0.433,0.515],[0.44,0.48],[0.438,0.448],[0.43,0.428],[0.43,0.412],[0.44,0.383],[0.437,0.33],[0.313,0.328],[0.285,0.333],[0.283,0.488],[0.303,0.498],[0.328,0.555],[0.35,0.585],[0.37,0.585],[0.385,0.578],[0.383,0.54],[0.418,0.493]] },
      { W: 0.027, pts: [[0.457,0.33],[0.7,0.33],[0.713,0.335],[0.713,0.433],[0.71,0.437],[0.647,0.43],[0.603,0.438],[0.593,0.445],[0.598,0.495],[0.597,0.555],[0.62,0.612]] },
      { W: 0.023, pts: [[0.536,0.487],[0.527,0.502],[0.52,0.593],[0.543,0.628],[0.547,0.64],[0.535,0.702],[0.54,0.707],[0.585,0.717],[0.603,0.662],[0.605,0.645],[0.633,0.623],[0.645,0.618],[0.67,0.617],[0.723,0.621]] },
      { W: 0.024, pts: [[0.474,0.625],[0.468,0.692],[0.452,0.735],[0.402,0.733],[0.37,0.742],[0.337,0.737],[0.32,0.747],[0.268,0.749]] },
      { W: 0.027, pts: [[0.447,0.633],[0.438,0.69],[0.432,0.7],[0.375,0.71],[0.325,0.703],[0.296,0.725]] },
      { W: 0.027, pts: [[0.629,0.447],[0.625,0.548],[0.638,0.58],[0.648,0.588],[0.723,0.59]] },
      { W: 0.027, pts: [[0.268,0.571],[0.3,0.573],[0.313,0.585],[0.343,0.642],[0.437,0.638]] },
      { W: 0.027, pts: [[0.277,0.732],[0.28,0.693],[0.312,0.672],[0.333,0.67],[0.375,0.677],[0.421,0.667]] },
      { W: 0.023, pts: [[0.498,0.465],[0.498,0.53],[0.492,0.572],[0.487,0.577],[0.47,0.577],[0.444,0.605]] },
      { W: 0.026, pts: [[0.466,0.621],[0.483,0.608],[0.493,0.61],[0.513,0.637],[0.513,0.66],[0.5,0.707]] },
      { W: 0.027, pts: [[0.567,0.515],[0.573,0.592],[0.55,0.612]] },
      { W: 0.024, pts: [[0.351,0.615],[0.41,0.608],[0.443,0.62],[0.465,0.613]] },
      { W: 0.023, pts: [[0.601,0.605],[0.578,0.63],[0.575,0.657],[0.561,0.698]] },
      { W: 0.027, pts: [[0.642,0.461],[0.723,0.468]] } ] },
    bloque: { w: 1.000, h: 1.333, trazos: [
      { W: 0.067, pts: [[0.656,0.849],[0.677,0.76],[0.67,0.638],[0.562,0.625],[0.375,0.653]] },
      { W: 0.070, pts: [[0.182,0.546],[0.322,0.562],[0.323,0.722],[0.377,0.738],[0.396,0.901]] },
      { W: 0.057, pts: [[0.5,0.334],[0.143,0.345],[0.133,0.367],[0.142,0.535],[0.133,0.543],[0.067,0.545],[0.035,0.628]] },
      { W: 0.070, pts: [[0.759,0.73],[0.748,0.892],[0.725,0.903],[0.587,0.907],[0.493,0.893],[0.48,0.883],[0.466,0.752]] },
      { W: 0.066, pts: [[0.724,0.69],[0.905,0.702],[0.933,0.817],[0.931,0.921]] },
      { W: 0.053, pts: [[0.927,0.329],[0.685,0.342],[0.584,0.33]] },
      { W: 0.050, pts: [[0.657,0.472],[0.91,0.482],[0.936,0.643]] },
      { W: 0.060, pts: [[0.542,0.313],[0.54,0.412],[0.525,0.445],[0.428,0.457],[0.41,0.468],[0.406,0.597]] },
      { W: 0.077, pts: [[0.191,0.71],[0.228,0.793],[0.302,0.82],[0.302,0.947]] },
      { W: 0.063, pts: [[0.615,0.37],[0.595,0.55],[0.459,0.565]] },
      { W: 0.053, pts: [[0.252,0.597],[0.238,0.665],[0.017,0.676]] },
      { W: 0.073, pts: [[0.831,0.729],[0.845,0.868]] },
      { W: 0.047, pts: [[0.205,0.605],[0.098,0.611]] },
      { W: 0.064, pts: [[0.898,0.365],[0.915,0.443]] } ] },
    travesia: { w: 1.000, h: 1.352, trazos: [
      { W: 0.087, pts: [[0.451,0.225],[0.405,0.287],[0.415,0.395],[0.575,0.493],[0.585,0.793],[0.507,0.843],[0.187,0.878],[0.107,0.863],[0.041,0.896]] },
      { W: 0.090, pts: [[0.302,0.2],[0.325,0.442],[0.343,0.467],[0.455,0.52],[0.477,0.56],[0.475,0.743],[0.18,0.785],[0.007,0.734]] },
      { W: 0.092, pts: [[0.998,0.417],[0.91,0.485],[0.842,0.667],[0.69,0.688],[0.688,0.817],[0.63,0.905],[0.638,1.013],[0.607,1.185],[0.523,1.257]] },
      { W: 0.088, pts: [[0.472,0.065],[0.497,0.32],[0.522,0.35],[0.657,0.417],[0.673,0.583],[0.782,0.575],[0.85,0.413],[0.987,0.357]] },
      { W: 0.087, pts: [[0.535,0.153],[0.985,0.153]] },
      { W: 0.087, pts: [[0.987,1.175],[0.71,1.177],[0.623,1.238]] },
      { W: 0.087, pts: [[0.257,0.156],[0.425,0.152]] } ] }
  };

  function tramarCalco(rng, fw, fh, tipo, params) {
    const base = CALCOS[tipo] ? tipo : 'bloque';
    const calco = CALCOS[base];
    const S = min(fw, fh);
    const rr = (v) => rng.range(v[0], v[1]);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const conCruces = base === 'travesia';
    const sangra = base === 'travesia';
    // 1. los trazos del calco en unidades del calco
    let tr = calco.trazos.map(t => ({ pts: t.pts.map(q => ({ x: q[0], y: q[1] })), W: t.W }));
    const Ws = tr.map(t => t.W).sort((a, b) => a - b), Wmed = Ws[Ws.length >> 1], g = Wmed * gam;
    const crucesDe = T => { const cz = new Set(); const SS = T.map(t => segsDe(t.pts));
      for (let j = 0; j < T.length; j++) for (let k = j + 1; k < T.length; k++) if (SS[j].some(a => SS[k].some(b => !!corteDe(a, b)))) cz.add(j * 4096 + k); return cz; };
    const cruces0 = conCruces ? crucesDe(tr) : new Set();
    // 2. simetrías y giro de la obra entera
    const bb = () => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const t of tr) for (const q of t.pts) { x0 = min(x0, q.x); y0 = min(y0, q.y); x1 = max(x1, q.x); y1 = max(y1, q.y); } return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    const b0 = bb();
    if (rng.bool(0.5)) for (const t of tr) for (const q of t.pts) q.x = 2 * b0.cx - q.x;
    if (rng.bool(0.3)) for (const t of tr) for (const q of t.pts) q.y = 2 * b0.cy - q.y;
    const pGiro = sangra ? 0 : (fw > fh * 1.1 ? 0.7 : fw * 1.1 < fh ? 0.1 : 0.3);
    if (rng.bool(pGiro)) for (const t of tr) for (const q of t.pts) { const x = q.x - b0.cx, y = q.y - b0.cy; q.x = b0.cx - y; q.y = b0.cy + x; }
    const th = rng.range(-5, 5) * RAD, sx = rng.range(0.92, 1.08);
    for (const t of tr) for (const q of t.pts) { const x = (q.x - b0.cx) * sx, y = q.y - b0.cy; q.x = b0.cx + x * Math.cos(th) - y * Math.sin(th); q.y = b0.cy + x * Math.sin(th) + y * Math.cos(th); }
    // 3. quitar trazos, entre el 70 % más corto
    const quitados = new Set();
    const nq = params.trazos ? max(0, tr.length - params.trazos) : rng.int(1, base === 'travesia' ? 2 : 4);
    const porLargo = tr.map((t, i) => [largoDe(t.pts), i]).sort((a, b) => a[0] - b[0]).slice(0, max(1, Math.round(tr.length * 0.7))).map(x => x[1]);
    for (let k = 0; k < nq && porLargo.length; k++) quitados.add(porLargo.splice(rng.int(0, porLargo.length - 1), 1)[0]);
    const idx = tr.map((t, i) => i);
    for (const t of tr) t.segs = segsDe(t.pts);
    const cabe = (i, pts) => { const sg = segsDe(pts);
      for (const j of idx) { if (j === i || quitados.has(j)) continue; const a = min(i, j), c = max(i, j); if (cruces0.has(a * 4096 + c)) continue;
        const D = (tr[i].W + tr[j].W) / 2 + g; for (const s1 of sg) for (const s2 of tr[j].segs) if (segSegDist(s1, s2) < D * 0.97) return false; }
      return true; };
    const puntoCabe = (i, q) => { for (const j of idx) { if (j === i || quitados.has(j)) continue; const a = min(i, j), c = max(i, j); if (cruces0.has(a * 4096 + c)) continue;
        const Dp = tr[j].W / 2 + g; for (const s2 of tr[j].segs) if (pointSegDist(q.x, q.y, s2[0], s2[1], s2[2], s2[3]) < Dp * 0.97) return false; } return true; };
    // 3b. los cabos del calco, recortados al canal (el trazador alarga cada cabo media anchura)
    for (const i of idx) { if (quitados.has(i)) continue; const t = tr[i];
      for (const lado of [0, 1]) { const pts = lado ? t.pts : t.pts.slice().reverse(); const a = pts[pts.length - 2], e = pts[pts.length - 1];
        if (puntoCabe(i, e)) continue;
        let lo = 0, hi = 1; for (let k = 0; k < 10; k++) { const m = (lo + hi) / 2; const q = { x: e.x + (a.x - e.x) * m, y: e.y + (a.y - e.y) * m }; if (puntoCabe(i, q)) hi = m; else lo = m; }
        const L = hypot(e.x - a.x, e.y - a.y); const m = min(hi, t.W / L);
        pts[pts.length - 1] = { x: e.x + (a.x - e.x) * m, y: e.y + (a.y - e.y) * m }; t.pts = lado ? pts : pts.reverse(); t.segs = segsDe(t.pts); } }
    // 4. cabos: alargar o acortar el último tramo; si al alargar no cabe, hasta donde cabe
    for (const i of idx) { if (quitados.has(i)) continue; const t = tr[i];
      for (const lado of [0, 1]) { if (!rng.bool(0.5)) continue;
        const pts = lado ? t.pts : t.pts.slice().reverse(); const a = pts[pts.length - 2], e = pts[pts.length - 1];
        const u = rng.range(0.6, 1.6); const e2 = { x: a.x + (e.x - a.x) * u, y: a.y + (e.y - a.y) * u };
        const prueba = q => puntoCabe(i, q) && cabe(i, pts.slice(0, -1).concat([{ x: a.x + (q.x - a.x) * 0.8, y: a.y + (q.y - a.y) * 0.8 }]))
                            && (sangra || (q.x > -0.02 && q.y > -0.02 && q.x < calco.w + 0.02 && q.y < calco.h + 0.02));
        let fin = e2; if (u > 1 && !prueba(e2)) { let lo = 1, hi = u; for (let k = 0; k < 10; k++) { const m = (lo + hi) / 2; const q = { x: a.x + (e.x - a.x) * m, y: a.y + (e.y - a.y) * m }; if (prueba(q)) lo = m; else hi = m; } fin = { x: a.x + (e.x - a.x) * lo, y: a.y + (e.y - a.y) * lo }; }
        pts[pts.length - 1] = fin; t.pts = lado ? pts : pts.reverse(); t.segs = segsDe(t.pts); } }
    // 4b. redoblar: la cola gira alrededor de un codo (±18°) si cabe
    for (const i of idx) { if (quitados.has(i)) continue; const t = tr[i]; if (t.pts.length < 3 || !rng.bool(0.6)) continue;
      const k = rng.int(1, t.pts.length - 2); const ang = rng.range(-18, 18) * RAD; const piv = t.pts[k]; const cola = rng.bool(0.5);
      const old = t.pts.map(q => ({ x: q.x, y: q.y }));
      for (let m = 0; m < t.pts.length; m++) { if (cola ? m <= k : m >= k) continue; const q = t.pts[m]; const x = q.x - piv.x, y = q.y - piv.y; q.x = piv.x + x * Math.cos(ang) - y * Math.sin(ang); q.y = piv.y + x * Math.sin(ang) + y * Math.cos(ang); }
      t.segs = segsDe(t.pts); if (!cabe(i, t.pts)) { t.pts = old; t.segs = segsDe(t.pts); } }
    // 4c. mover el trazo entero hasta 0,6 W, si cabe
    for (const i of idx) { if (quitados.has(i)) continue; const t = tr[i]; if (!rng.bool(0.5)) continue;
      const a = rng.range(0, 360) * RAD, d = rng.range(0.2, 0.6) * t.W; const old = t.pts.map(q => ({ x: q.x, y: q.y }));
      for (const q of t.pts) { q.x += Math.cos(a) * d; q.y += Math.sin(a) * d; } t.segs = segsDe(t.pts); if (!cabe(i, t.pts)) { t.pts = old; t.segs = segsDe(t.pts); } }
    // 5. temblor de vértices (±0,12 W por la normal), revertido si rompe el canal
    for (const i of idx) { if (quitados.has(i)) continue; const t = tr[i];
      for (let k = 0; k < t.pts.length; k++) { const q = t.pts[k]; const a = t.pts[max(0, k - 1)], c = t.pts[min(t.pts.length - 1, k + 1)]; const tx = c.x - a.x, ty = c.y - a.y, tm = hypot(tx, ty) || 1e-9;
        const d = rng.range(-0.12, 0.12) * t.W; const old = { x: q.x, y: q.y }; q.x -= ty / tm * d; q.y += tx / tm * d; t.segs = segsDe(t.pts);
        if (!cabe(i, t.pts)) { q.x = old.x; q.y = old.y; t.segs = segsDe(t.pts); } } }
    // 6. acompañantes nuevos (1–3): el desplazado de una sección, por el lado libre
    const nuevos = rng.int(1, 3);
    for (let n = 0; n < nuevos; n++) {
      for (let t2 = 0; t2 < 20; t2++) { const i = rng.int(0, tr.length - 1); if (quitados.has(i)) continue; const t = tr[i];
        const Wn = t.W * rng.range(0.85, 1.1); const Dn = (t.W + Wn) / 2 + g; const lado = rng.bool(0.5) ? 1 : -1;
        const fr = rng.range(0.4, 1), a0 = rng.range(0, 1 - fr); const L = largoDe(t.pts);
        const sub = []; let acc = 0;
        for (let k = 0; k < t.pts.length - 1; k++) { const a = t.pts[k], c = t.pts[k + 1]; const l = hypot(c.x - a.x, c.y - a.y);
          const s0 = max(0, (a0 * L - acc) / l), s1 = min(1, ((a0 + fr) * L - acc) / l); if (s1 > s0) { if (!sub.length) sub.push({ x: a.x + (c.x - a.x) * s0, y: a.y + (c.y - a.y) * s0 }); sub.push({ x: a.x + (c.x - a.x) * s1, y: a.y + (c.y - a.y) * s1 }); } acc += l; }
        if (sub.length < 2) continue;
        const q = sub.map((pt, k) => { const a = sub[max(0, k - 1)], c = sub[min(sub.length - 1, k + 1)]; const tx = c.x - a.x, ty = c.y - a.y, tm = hypot(tx, ty) || 1e-9; return { x: pt.x - ty / tm * Dn * lado, y: pt.y + tx / tm * Dn * lado }; });
        const ni = tr.length; const cand = { pts: q, W: Wn, segs: segsDe(q) }; tr.push(cand); idx.push(ni);
        const ok = [];
        for (let k = 0; k < q.length - 1; k++) { const sg = [q[k].x, q[k].y, q[k + 1].x, q[k + 1].y]; let bien = true;
          for (const j of idx) { if (j === ni || j === i || quitados.has(j)) continue; const Dj = (Wn + tr[j].W) / 2 + g; for (const s2 of tr[j].segs) if (segSegDist(sg, s2) < Dj * 0.97) { bien = false; break; } if (!bien) break; }
          if (bien) { if (!ok.length) ok.push(q[k]); ok.push(q[k + 1]); } else if (ok.length >= 2) break; else ok.length = 0; }
        if (ok.length >= 2 && largoDe(ok) >= Wn * 2.5) { cand.pts = ok; cand.segs = segsDe(ok); break; }
        tr.pop(); idx.pop(); } }
    const vivos = tr.filter((t, i) => !quitados.has(i));
    // 7. encuadre: dentro del pliego con margen (recinto, bloque) o a sangre (travesía)
    const m = MARGEN * S;
    let Sc, ox, oy;
    if (sangra) { Sc = max(fw / calco.w, fh / calco.h) * 0.94; ox = (fw - calco.w * Sc) / 2 + rng.range(-0.03, 0.03) * S; oy = (fh - calco.h * Sc) / 2 + rng.range(-0.03, 0.03) * S; }
    else { const b = bb.call(null); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const t of vivos) for (const q of t.pts) { x0 = min(x0, q.x); y0 = min(y0, q.y); x1 = max(x1, q.x); y1 = max(y1, q.y); }
      x0 -= Wmed / 2; y0 -= Wmed / 2; x1 += Wmed / 2; y1 += Wmed / 2;
      const conc = params.concentra != null ? params.concentra : rng.range(0.55, 0.8);
      const lleno = 1 - 0.2 * conc;    // 1 = toda la caja útil; con conc alta, algo menos
      Sc = min((fw - 2 * m) / (x1 - x0), (fh - 2 * m) / (y1 - y0)) * lleno;
      const libreX = fw - (x1 - x0) * Sc, libreY = fh - (y1 - y0) * Sc;
      ox = (libreX / 2) + rng.range(-0.25, 0.25) * libreX - x0 * Sc; oy = (libreY / 2) + rng.range(-0.25, 0.25) * libreY - y0 * Sc; }
    const W = Wmed * Sc, gS = g * Sc, D = W + gS;
    // EL CALCO EXIGE HALO. El trazador deja pares de ejes a 0,8 D —no promete la
    // regla geométrica— y el canal lo fabrica el halo al pintar; sin él las tintas
    // se fundirían. Así que aquí el halo nunca baja de g, pida lo que pida el panel.
    const ctx = { fw, fh, S, W, g: gS, D, mg: m, trazos: [], gubAmp: params.gubia != null ? params.gubia : (rng.bool(P_GUBIA) ? rng.range(GUB_AMP[0], GUB_AMP[1]) : 0), relleno: 1,
                  halo: max(gS, params.halo != null ? params.halo * W : gS) };
    for (const t of vivos) {
      const pts = t.pts.map(q => ({ x: ox + q.x * Sc, y: oy + q.y * Sc }));
      const fuera = pts.some(q => q.x < 0 || q.y < 0 || q.x > fw || q.y > fh);
      ctx.trazos.push({ pts, segs: segsDe(pts), W: t.W * Sc, rel: 'calco', sangra: fuera, cruza: false, gubia: gubiaDe(rng, ctx), fin: 'calco' });
    }
    paralelizar(ctx, gS, (params.captura != null ? params.captura : CAPTURA) * W);
    holguras(ctx);
    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0, quiebros = 0;
    for (const t of ctx.trazos) { vert += t.pts.length; quiebros += max(0, t.pts.length - 2); }
    const Ls = ctx.trazos.map(t => largoDe(t.pts) / S).sort((a, b) => a - b);
    const lMed = Ls.length ? Ls[Ls.length >> 1] : 0;
    return { trazos: ctx.trazos, W, g: gS, D, cerco: 0, patas: 0, masaN: 0, masa: med.ocupacion, objMasa: 0, mano: 0, ventanas: 0,
             pega: 1, recto: 0.5, vibF: 0, conc: 0, relleno: 1, relCount: { calco: ctx.trazos.length }, vibra: false,
             orto: false, travesia: sangra, halo: ctx.halo, cierre: CIERRE_POR, rumbos: [0],
             modelo: 'calco', calco: base, pedidos: ctx.trazos.length,
             ojos: med.ojos, ocupacion: med.ocupacion, pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             largoMax: Ls.length ? Ls[Ls.length - 1] : 0, reparto: lMed > 0 ? Ls[Ls.length - 1] / lMed : 0,
             sangrados: ctx.trazos.filter(x => x.sangra).length };
  }

  function tramarLibre(rng, fw, fh, tipo, params) {
    const t = TIPOS[tipo], lb = t.libre, ej = t.ejes || {};
    const S = min(fw, fh);
    const rr = (v, def) => rng.range((v || def)[0], (v || def)[1]);
    const W = params.ancho ? S * W_MAX * params.ancho : S * rr(lb.ancho);
    const gam = params.canal ? params.canal : rng.range(GAMMA[0], GAMMA[1]);
    const g = W * gam, D = W + g;
    const pega  = params.pega  != null ? params.pega  : lb.pega;
    const recto = params.recto != null ? params.recto : 0.5;
    const conc  = params.concentra != null ? params.concentra : rr(ej.conc, CONC);
    const sangra = params.sangra != null ? params.sangra > 0 : lb.sangra;
    const pCruza = params.cruza != null ? params.cruza : lb.cruza;
    const maxGiros = params.giros != null ? params.giros : 99;
    const mano = params.mano != null ? params.mano : rr(lb.mano, [0.3, 0.8]);
    const gubAmp = params.gubia != null ? params.gubia
                 : (rng.bool(P_GUBIA) ? rng.range(GUB_AMP[0], GUB_AMP[1]) * (0.5 + mano) : 0);
    // LA OBRA SE DETIENE POR COBERTURA, no por cuenta de trazos: un porcentaje
    // variable del lienzo en tinta (el autor: «se va completando hasta rellenar un %
    // variable del canvas»). La zona sale de ahí: la masa de la familia tiene en
    // torno a la mitad de tinta, así que el lado de la zona es la raíz del doble.
    const cobertura = params.cobertura != null ? params.cobertura : rr(lb.cobertura || [0.18, 0.4]);
    const zf = sangra ? rr(lb.zona) : clamp(Math.sqrt(cobertura / 0.5) * (1.15 - 0.3 * conc), 0.3, 1 - 2 * MARGEN);
    const zw = zf * fw, zh = zf * fh;
    const m = MARGEN * S + W / 2, lado = lb.lado != null ? lb.lado : 1;
    const zx0 = sangra ? (fw - zw) / 2 : m + rng.range(0, max(0, fw - 2 * m - zw)) * lado;
    const zy0 = sangra ? (fh - zh) / 2 : m + rng.range(0, max(0, fh - 2 * m - zh));
    const zona = { x0: zx0, y0: zy0, x1: zx0 + zw, y1: zy0 + zh };
    // la zona es blanda: el trazo puede asomar media anchura, no es una pared
    const hz = W * 0.5;
    const dentro = p => p.x >= zona.x0 - hz && p.x <= zona.x1 + hz && p.y >= zona.y0 - hz && p.y <= zona.y1 + hz;
    // en la travesía el papel es la zona, y el trazo lo atraviesa: ha salido cuando
    // está a más de una anchura fuera del pliego
    const salido = p => p.x < -W || p.y < -W || p.x > fw + W || p.y > fh + W;
    const ctx = { fw, fh, S, W, g, D, mg: S * MARGEN, trazos: [], gubAmp, relleno: 1,
                  halo: params.halo != null ? params.halo * W : g };
    const tope = params.trazos ? params.trazos : (sangra ? rng.int(lb.n[0], lb.n[1]) : 40);
    const tinta = () => ctx.trazos.reduce((a, t) => a + largoDe(t.pts) * W, 0) / (fw * fh);
    // EL COMPAÑERO SE SOLAPA. El canal no se prohíbe, se fabrica: el acompañante va
    // a W + g − SOLAPE·W de eje a eje, y el halo del de encima corta el pelo exacto.
    // Así el blanco mide g aunque la gubia adelgace el trazo: lo que separa es el
    // corte, no la suma de dos anchuras.
    // (sin halo no hay quien corte el pelo: entonces el acompañante va a D, como todos)
    const DC = ctx.halo > 0 ? D - W * SOLAPE : D;
    // y la tolerancia de «cabe»: con halo un 2 % de holgura (el pelo lo corta él);
    // sin halo la regla es exacta sobre los ejes, que es lo que mide canal.js
    const TOL = ctx.halo > 0 ? 0.98 : 1 - 1e-6;
    // ¿cabe un tramo nuevo? A D de todo lo que no sea su compañero ni su cruce,
    // y a D de los tramos no contiguos del propio trazo.
    const cabeSeg = (a, b, propios, companero, cruceCon) => {
      const sg = [a.x, a.y, b.x, b.y];
      for (let i = 0; i + 2 < propios.length; i++) {   // los contiguos son el codo
        const q = propios[i];
        if (segSegDist(sg, [q.x, q.y, propios[i + 1].x, propios[i + 1].y]) < D * TOL) return false;
      }
      for (let k = 0; k < ctx.trazos.length; k++) {
        if (k === cruceCon) continue;
        const o = ctx.trazos[k];
        const tol = (k === companero ? DC : D) * TOL;
        for (const q of o.segs) if (segSegDist(sg, q) < tol) return false;
      }
      return true;
    };
    // hasta dónde cabe un tramo que no cabe entero: se acorta hasta que cabe (cabo
    // contra un cuerpo), por bisección
    const hastaDonde = (a, b, propios, companero, cruceCon) => {
      let lo = 0, hi = 1;
      for (let i = 0; i < 10; i++) { const mid = (lo + hi) / 2; const q = { x: a.x + (b.x - a.x) * mid, y: a.y + (b.y - a.y) * mid }; if (cabeSeg(a, q, propios, companero, cruceCon)) lo = mid; else hi = mid; }
      return lo;
    };
    // EL PASEO: tramos de 0,8–2 anchuras, quiebros de 27–55° que alternan de lado
    // (y por eso avanzan), hasta el largo pedido o hasta que no cabe
    const pasear = (pts, dir, largo, companero, cruzaOk, fin) => {
      let acc = 0, lado2 = rng.bool(0.5) ? 1 : -1, giros = 0, cruceCon = -1;
      const paso = () => W * rr(lb.paso);
      let primero = true;
      const punto = (a, d, L) => ({ x: a.x + Math.cos(d * RAD) * L, y: a.y + Math.sin(d * RAD) * L });
      while (acc < largo) {
        const L = min(paso(), largo - acc);
        const a = pts[pts.length - 1];
        if (sangra && pts.length > 1 && salido(a)) { if (fin) fin.por = 'sangra'; break; }
        // EL QUIEBRO SE ELIGE DONDE HAY SITIO. La mano que graba no muere en el
        // primer sitio donde no cabe: prueba el giro que tocaba, y si no cabe
        // sigue recta, o gira al otro lado, o gira menos. Solo cuando ninguna
        // de las cuatro cabe, el trazo muere contra un cuerpo —que es lo que
        // hacen el 89% de los cabos de las referencias.
        const quiere = !primero && giros < maxGiros && rng.bool(0.5 + 0.5 * (1 - recto));
        const alt = rng.bool(lb.alterna) ? -lado2 : lado2;
        const ang = rr(lb.ang);
        const cand = quiere ? [[alt * ang, alt], [0, 0], [-alt * ang, -alt], [alt * ang * 0.5, alt]]
                            : [[0, 0], [lado2 * ang, lado2], [-lado2 * ang, -lado2]];
        primero = false;
        let b = null, dirB = dir;
        for (const [giro, ld] of cand) {
          let d2 = dir + giro, b2 = punto(a, d2, L);
          if (!sangra && !dentro(b2)) {
            // el borde de la zona: se gira hacia dentro y se prueba otra vez
            const cx = (zona.x0 + zona.x1) / 2, cy = (zona.y0 + zona.y1) / 2;
            const hacia = Math.atan2(cy - a.y, cx - a.x) / RAD;
            const dd = ((hacia - d2) % 360 + 540) % 360 - 180; d2 += clamp(dd, -70, 70);
            b2 = punto(a, d2, L);
            if (!dentro(b2)) continue;
          }
          if (cabeSeg(a, b2, pts, companero, cruceCon)) {
            b = b2; dirB = d2;
            if (Math.abs(d2 - dir) > 1) { giros++; if (ld) lado2 = ld; }
            break;
          }
        }
        if (!b) {
          // ninguna cabe. ¿cruce? solo recto, solo si el otro va a ≥ CRUCE_MIN, uno por trazo
          const bR = punto(a, dir, L);
          if (cruzaOk && cruceCon < 0 && rng.bool(pCruza)) {
            let cruzo = false;
            for (let k = 0; k < ctx.trazos.length && !cruzo; k++) {
              for (const q of ctx.trazos[k].segs) {
                if (segSegDist([a.x, a.y, bR.x, bR.y], q) < D) {
                  if (anguloEntre([a.x, a.y, bR.x, bR.y], q) >= CRUCE_MIN) { cruceCon = k; cruzo = true; }
                  break;
                }
              }
            }
            if (cruzo) {
              // atraviesa: el tramo sigue recto hasta salir al otro lado
              const b3 = punto(a, dir, L + D * 2.2);
              if (cabeSeg(a, b3, pts, companero, cruceCon) && (sangra || dentro(b3))) { pts.push(b3); acc += L + D * 2.2; continue; }
              cruceCon = -1;
            }
          }
          const u = hastaDonde(a, bR, pts, companero, cruceCon);
          if (u * L > W * 0.15) pts.push({ x: a.x + (bR.x - a.x) * u, y: a.y + (bR.y - a.y) * u });
          if (fin) fin.por = (sangra || dentro(bR)) ? 'cuerpo' : 'zona';
          break;   // muere contra un cuerpo
        }
        pts.push(b); dir = dirB; acc += L;
      }
      if (fin && !fin.por) fin.por = 'largo';
      return cruceCon;
    };
    // PROGRESIVO: el trazo nuevo nace del ANTERIOR (siete de cada diez veces) y
    // no de uno cualquiera: lo acompaña, o se apoya en él. Así el primero decide
    // proporciones y rumbos y la obra crece como una cadena, que es como el autor
    // lee los originales.
    const padre = () => rng.bool(0.7) ? ctx.trazos[ctx.trazos.length - 1] : ctx.trazos[rng.int(0, ctx.trazos.length - 1)];
    for (let k = 0; k < tope; k++) {
      if (!params.trazos && !sangra && ctx.trazos.length >= 2 && tinta() >= cobertura) break;
      let pts = null, companero = -1, cruceCon = -1;
      const largo = W * rr(lb.largo), fin = { por: null };
      // los primeros trazos después del marco van libres: del marco se cuelgan
      // meandros, y los acompañantes acompañan a los meandros, no a la pared
      const pegaK = lb.marco ? pega * min(1, (ctx.trazos.length - 1) / 3) : pega;
      if (ctx.trazos.length && rng.bool(pegaK)) {
        // COMPAÑÍA: un desplazado, a un pelo, de un tramo de otro trazo. Por el
        // lado que quepa, y lo que quepa; luego sigue por su cuenta.
        for (let t2 = 0; t2 < 30 && !pts; t2++) {
          const o = padre();
          const fr = rr(o.fin === 'marco' ? [0.25, 0.5] : lb.companias), a0 = rng.range(0, max(0, 1 - fr));
          const sub = trozo(o.pts, a0, min(1, a0 + fr));
          if (sub.length < 2 || largoDe(sub) < W * 2) continue;
          let ladoC = rng.bool(0.5) ? 1 : -1;
          if (o.fin === 'marco') {
            // del marco se cuelga hacia DENTRO: el lado cuyo desplazado queda más
            // cerca del centro del marco
            const cx = o.pts.reduce((a2, q2) => a2 + q2.x, 0) / o.pts.length, cy = o.pts.reduce((a2, q2) => a2 + q2.y, 0) / o.pts.length;
            const q1 = paralela(sub, DC, 1, W * 0.35, DC * TOL), q2 = paralela(sub, DC, -1, W * 0.35, DC * TOL);
            const dc = qq => qq.length ? hypot(qq[qq.length >> 1].x - cx, qq[qq.length >> 1].y - cy) : Infinity;
            ladoC = dc(q1) <= dc(q2) ? 1 : -1;
          }
          const q = paralela(sub, DC, ladoC, W * 0.35, DC * TOL);
          if (q.length < 2) continue;
          // recortado a lo que cabe contra los demás (no contra su compañero)
          const ok = []; const kidx = ctx.trazos.indexOf(o);
          for (let i = 0; i < q.length - 1; i++) {
            const cabe = (sangra || (dentro(q[i]) && dentro(q[i + 1]))) && cabeSeg(q[i], q[i + 1], ok, kidx, -1);
            if (cabe) { if (!ok.length) ok.push(q[i]); ok.push(q[i + 1]); }
            else if (ok.length >= 2) break; else ok.length = 0;
          }
          // un acompañante de menos de tres anchuras es un tocón, no un trazo
          if (ok.length >= 2 && largoDe(ok) >= W * 3) { pts = ok; companero = kidx; }
        }
        if (pts) {
          // y sigue por su cuenta por uno de los cabos (o los dos): en las
          // referencias el acompañante casi nunca se queda corto, sobresale
          const ext = () => sangra ? fw + fh : W * rr([2, 7]);
          if (sangra || rng.bool(0.75)) { const d0 = dirEn(pts, pts.length - 2); cruceCon = pasear(pts, d0, ext(), companero, true, fin); }
          if (sangra || rng.bool(0.55)) { const rev = pts.slice().reverse(); const d1 = dirEn(rev, rev.length - 2); pasear(rev, d1, ext(), companero, false, null); pts = rev.reverse(); }
        }
      }
      if (!pts && lb.marco && !ctx.trazos.length) {
        // EL MARCO del recinto: tres lados de la zona, en U, abierto por uno de los
        // cuatro. Es el primer trazo y el que da la escala; los demás cuelgan de él.
        const j = () => rng.range(-W * 0.3, W * 0.3);
        const esq = [{ x: zona.x0, y: zona.y0 }, { x: zona.x1, y: zona.y0 }, { x: zona.x1, y: zona.y1 }, { x: zona.x0, y: zona.y1 }];
        const abierto = rng.int(0, 3);   // el lado que falta: 0 arriba, 1 derecha, 2 abajo, 3 izquierda
        ctx.abierto = abierto;
        const orden = [0, 1, 2, 3].map(i => esq[(abierto + 1 + i) % 4]);
        pts = orden.map(q => ({ x: q.x + j(), y: q.y + j() }));
        fin.por = 'marco';
        // y por el lado abierto la obra sigue: en la referencia los meandros cuelgan
        // del marco y bajan por donde no hay pared
        const ext = 0.45;
        if (abierto === 0) zona.y0 = max(m, zona.y0 - zh * ext);
        else if (abierto === 1) zona.x1 = min(fw - m, zona.x1 + zw * ext);
        else if (abierto === 2) zona.y1 = min(fh - m, zona.y1 + zh * ext);
        else zona.x0 = max(m, zona.x0 - zw * ext);
      }
      if (!pts && sangra) {
        // TRAVESÍA: entra por un borde del pliego y sale por el de enfrente (±35°)
        const lado0 = rng.int(0, 3), u = rng.range(0.15, 0.85);
        const a = lado0 === 0 ? { x: fw * u, y: -W } : lado0 === 1 ? { x: fw + W, y: fh * u } : lado0 === 2 ? { x: fw * u, y: fh + W } : { x: -W, y: fh * u };
        const d0 = [90, 180, 270, 0][lado0] + rng.range(-35, 35);
        if (!cabeSeg(a, a, [], -1, -1)) continue;
        pts = [a];
        cruceCon = pasear(pts, d0, fw + fh, -1, true, fin);
      }
      if (!pts) {
        // LIBRE: arranca pegado a la masa, a un pelo (o donde sea, si es el primero)
        let a = null, dirV = null;
        for (let t2 = 0; t2 < 30 && !a; t2++) {
          let c;
          if (ctx.trazos.length) {
            const o = padre(), u = rng.range(0, 1);
            const pq = puntoEn(o.pts, u); const ang = rng.range(0, 360);
            c = { x: pq.x + Math.cos(ang * RAD) * D * rng.range(1.0, 1.6), y: pq.y + Math.sin(ang * RAD) * D * rng.range(1.0, 1.6) };
            dirV = dirEn(o.pts, min(o.pts.length - 2, Math.floor(u * (o.pts.length - 1))));
          }
          else c = { x: rng.range(zona.x0, zona.x1), y: rng.range(zona.y0, zona.y1) };
          if (dentro(c) && cabeSeg(c, c, [], -1, -1)) a = c;
        }
        if (!a) continue;
        pts = [a];
        let d0 = rng.range(0, 360);
        // COHERENCIA: el trazo que no acompaña tampoco va a su aire. Arranca
        // paralelo o perpendicular al vecino junto al que nace (± 10°), que es lo
        // que hace que la referencia 2 parezca una reja sin serlo.
        if (dirV != null && lb.coherente != null && rng.bool(lb.coherente)) d0 = dirV + 90 * rng.int(0, 3) + rng.range(-10, 10);
        if (ctx.abierto != null) {
          // EN EL RECINTO LA OBRA FLUYE: los meandros cuelgan de la pared de enfrente
          // y bajan hacia el lado abierto, todos en la misma dirección general
          const hacia = [270, 0, 90, 180][ctx.abierto];
          d0 = hacia + rng.range(-30, 30);
          const mk = ctx.trazos[0];
          const op = [{ x: zona.x0, y: zona.y1 }, { x: zona.x0, y: zona.y0 }, { x: zona.x0, y: zona.y0 }, { x: zona.x1, y: zona.y0 }][ctx.abierto];
          const lenB = ctx.abierto % 2 === 0 ? zona.x1 - zona.x0 : zona.y1 - zona.y0;
          for (let t2 = 0; t2 < 30; t2++) {
            const u = rng.range(0.1, 0.9), r = DC * rng.range(1.0, 1.6);
            const c = ctx.abierto % 2 === 0 ? { x: op.x + lenB * u, y: op.y + (ctx.abierto === 0 ? -r : r) }
                                            : { x: op.x + (ctx.abierto === 1 ? r : -r), y: op.y + lenB * u };
            if (dentro(c) && cabeSeg(c, c, [], -1, -1)) { pts = [c]; break; }
          }
          if (mk && pts.length === 1 && !dentro(pts[0])) continue;
        }
        cruceCon = pasear(pts, d0, largo, -1, true, fin);
      }
      if (!pts || pts.length < 2 || largoDe(pts) < W * 1.5) continue;
      const fuera = pts.some(p2 => p2.x < 0 || p2.y < 0 || p2.x > fw || p2.y > fh);
      ctx.trazos.push({ pts, segs: segsDe(pts), rel: companero >= 0 ? 'compania' : 'libre', sangra: fuera, cruza: cruceCon >= 0, gubia: gubiaDe(rng, ctx), fin: fin.por || 'compania' });
    }
    if (!sangra) apretar(ctx, D, DC * TOL);
    // sin halo la regla es exacta sobre los ejes y nadie fabrica el canal: ahí no se paraleliza
    if (ctx.halo > 0) paralelizar(ctx, g, (params.captura != null ? params.captura : CAPTURA) * W);
    holguras(ctx);
    const med = ctx.trazos.length ? medir(ctx.trazos, W, fw, fh) : { ojos: [], ocupacion: 0 };
    const pas = pasillos(ctx.trazos, W, D);
    let vert = 0, quiebros = 0;
    for (const tr of ctx.trazos) { vert += tr.pts.length; quiebros += max(0, tr.pts.length - 2); }
    const Ls = ctx.trazos.map(tr => largoDe(tr.pts) / S).sort((a, b) => a - b);
    const lMed = Ls.length ? Ls[Ls.length >> 1] : 0;
    const relCount = { compania: ctx.trazos.filter(x => x.rel === 'compania').length, libre: ctx.trazos.filter(x => x.rel === 'libre').length };
    return { trazos: ctx.trazos, W, g, D, cerco: 0, patas: 0, masaN: 0, masa: med.ocupacion, objMasa: 0, mano, ventanas: 0,
             pega, recto, vibF: 0, conc, relleno: 1, relCount, vibra: false,
             orto: false, travesia: !!sangra, halo: ctx.halo, cierre: CIERRE_POR, rumbos: [rng.range(0, 180)],
             modelo: 'libre', pedidos: ctx.trazos.length, cobertura, tinta: tinta(),
             ojos: med.ojos, ocupacion: med.ocupacion, pasillos: pas.n, largoPas: pas.largo / W, vert, quiebros,
             largoMax: Ls.length ? Ls[Ls.length - 1] : 0, reparto: lMed > 0 ? Ls[Ls.length - 1] / lMed : 0,
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
      // EL MODELO: la retícula es la de los grabados y la de producción; el de
      // trazos sueltos se queda en el laboratorio para comparar.
      const modelo = params.modelo || 'calco';
      const r3 = new E.Rng((seed ^ (0x51E7 * (i + 1))) >>> 0);
      const c = modelo === 'calco' ? tramarCalco(r3, fw, fh, tipo, params)
              : modelo === 'libre' ? tramarLibre(r3, fw, fh, tipo, params)
              : modelo === 'reja' ? tramarReja(r3, fw, fh, tipo, params)
              : tramar(r3, fw, fh, tipo, params);
      const f = falta(c, t, c.pedidos != null ? c.pedidos : N);
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
    // Los pares que SE CRUZAN (ejes que se cortan): ahí manda el orden de pintado,
    // y `debajo` sigue diciendo quién está debajo de quién para los detectores.
    const debajo = best.trazos.map(() => []);
    const cruza = new Set();
    for (let k = 0; k < best.trazos.length; k++)
      for (let j = 0; j < k; j++) {
        let toca = false;
        for (const a of best.trazos[k].segs) {
          for (const b of best.trazos[j].segs) { if (corteDe(a, b)) { toca = true; break; } }
          if (toca) break;
        }
        if (toca) { debajo[k].push(j); cruza.add(j * 4096 + k); }
      }
    const pintor = params.pintor || 'halo';
    const esquina = params.esquina != null ? params.esquina : ESQUINA;
    if (pintor === 'halo') pintarHalo(ctx, best.trazos, best.W, best.g, S, ox, rol.tinta, W, H, esquina);
    else pintarCampo(ctx, best.trazos, best.W, best.g, best.relleno || 1, S, ox, rol.tinta, W, H, cruza);

    E.grain(ctx, W, H, colors, grainScale, E.unit(W, H, REF), seed);

    return { pal, rol, tipo, bg, falta: bestF,
             field: cuad ? 'square' : 'sheet',
             cintas: best.trazos.length, pliegues: best.cerco,
             masa: best.masa, masaN: best.masaN, objMasa: best.objMasa,
             pega: best.pega, recto: best.recto, vibF: best.vibF, conc: best.conc, relleno: best.relleno,
             pasillos: best.pasillos, largoPas: best.largoPas,
             cabos: best.trazos.length * 2, vert: best.vert,
             quiebros: best.quiebros, vibra: best.vibra, sangrados: best.sangrados,
             rel: best.relCount,
             anchoRel: best.W / min(fw, fh), gam: best.g / best.W,
             ojos: best.ojos, ocupacion: best.ocupacion, esq: 0,
             cierre: best.cierre,
             geo: { cintas: best.trazos.map(x => x.pts), sangra: best.trazos.map(x => !!x.sangra),
                    relleno: best.trazos.map(x => x.relleno || null),
                    lados: best.trazos.map(x => x.lados || null),
                    // el radio de relleno del campo, × media anchura: con esto y los ejes,
                    // `etiquetas()` reconstruye exactamente lo pintado
                    relleno: best.relleno || 1,
                    cruza: best.trazos.map(x => !!x.cruza), CRUCE_MIN,
                    gubia: best.trazos.map(x => x.gubia || 0), fin: best.trazos.map(x => x.fin || null), debajo,
                    // la anchura propia de cada trazo (el calco las tiene distintas); null = la de la obra
                    anchos: best.trazos.map(x => x.W || null),
                    pintor, esquina,
                    cierre: best.cierre, rumbos: best.rumbos,
                    // el halo de ESTA obra. Lo mira `canal.js`: la regla vieja -ningun
                    // par por debajo de D- vale donde NO hay halo, y donde lo hay no,
                    // porque ahi el canal se fabrica al pintar. Sin este dato el
                    // detector no puede saber cual de las dos reglas le toca.
                    halo: best.halo,
                    SANGRE, MARGEN, W: best.W, Wtinta: best.W * RELLENO_W, g: best.g, D: best.D,
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
    if (receta.grano !== 0) E.grain(ctx, W, H, colors, receta.grano == null ? 1 : receta.grano, E.unit(W, H, REF), seed);

    const med = medir(cx2.trazos, Wb, fw, fh);
    return { pal, rol, cintas: cx2.trazos.length, ojos: med.ojos, ocupacion: med.ocupacion,
             geo: { cintas: cx2.trazos.map(x => x.pts), sangra: cx2.trazos.map(() => true),
                    relleno: cx2.trazos.map(x => x.relleno || null),
                    lados: cx2.trazos.map(x => x.lados || null),
                    cruza: cx2.trazos.map(() => true), CRUCE_MIN,
                    // igual que en `render`: el halo se publica para que un detector
                    // sepa cual de las dos reglas le toca en vez de suponerla
                    halo: receta.halo != null ? receta.halo * Wb : g,
                    gubia: cx2.trazos.map(x => x.gubia || 0),
                    SANGRE, MARGEN, W: Wb, g, D, S, ox, fw, fh, veto: null } };
  }

  const P_INV = 0.08;                      // tinta oscura sobre papel claro casi siempre: es grabado

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
    const tipoR = res.tipo === 'haz' ? 'uncommon' : 'common';
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
  (global.HOKS = global.HOKS || {}).HRRS = { render, componer, traits, TIPOS, RELS, BG_GRADIENT, FORMATS, banda, corte, etiquetas, pintarCampo, pintarHalo };
})(typeof window !== 'undefined' ? window : globalThis);
