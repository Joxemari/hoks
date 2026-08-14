#!/bin/bash
# La bateria LARGA: al menos 1.000 obras por bloque, cada bloque con su control.
# `todo.sh` es la version corta del dia a dia; esta es la que se corre antes de
# dar por bueno un cambio en el dibujo de la cinta.
#
#   ./mil.sh              # entera, tarda un rato largo
#   ./mil.sh costuras     # un bloque suelto: huecos | mascara | costuras |
#                         #   remates | resto
#
# OJO CON LOS ARGUMENTOS, que ya ha costado dos veces:
#   hueco.js  SRC N cfg [offset]
#   m2.js     SRC N cfg [capa]
#   o2.js     SRC N cfg
#   cos.js    SRC N cfg
#   det.js    (sin argumentos)
#   solape.js N offset cfg        <- este NO lleva SRC
cd "$(dirname "$0")"
BLOQUE="${1:-todo}"

python3 mktest.py "" trzs_test.js >/dev/null || exit 1
for r in orden mitad margen ojo remate costura cara sueloigual; do
  python3 mktest.py $r trzs_$r.js >/dev/null || exit 1
done

# Las configuraciones: por defecto, los CINCO tipos, esquinas curvas, temblor,
# apaisado, dos cintas en apaisado y tres cintas en apaisado.
# La batería tiene que cubrir lo que se publica: cuando entró el tipo de tres
# cintas y el temblor, entraron aquí. Un detector que no ve la tercera cinta no
# dice nada sobre ella.
# Las obras FANTASMA se excluyen a mano: su cinta es del color del suelo y los
# detectores que comparan tinta contra fondo no pueden medirlas por
# construccion. Tienen su propio control (sueloigual) y se miran aparte.
CFGS=('{"fantasma":"no"}' '{"tipo":"suelto","fantasma":"no"}' '{"tipo":"anudado","fantasma":"no"}' '{"tipo":"trama","fantasma":"no"}' '{"tipo":"dos","fantasma":"no"}' '{"tipo":"tres","fantasma":"no"}' '{"corner":"curvas","fantasma":"no"}' '{"ends":"inglete","fantasma":"no"}' '{"temblor":0.2,"fantasma":"no"}' '{"temblor":0.35,"corner":"curvas","fantasma":"no"}' '{"aspecto":1.5,"fantasma":"no"}' '{"tipo":"tres","aspecto":1.5,"fantasma":"no"}' '{"paralelo":"si","fantasma":"no"}')
POR=77   # 13 configuraciones x 77 = 1.001, mas las cuatro tandas de 250

res() { python3 -c "
import sys,json,re; d=json.load(sys.stdin)
m=[float(x.group(1)) for x in (re.search(r'racha=([\d.]+)px',p) for p in d['peores']) if x]
print(f\"  {json.dumps(d['cfg'],ensure_ascii=False):<30} {d['obras']:>4} obras {d['cruces']:>5} cruces · >=3px {d['racha3']:>3} · >=8px {d['racha8']:>3} · >=20px {d['racha20']:>3} · peor {max(m) if m else 0}px\")"; }

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = huecos ]; then
echo "##### 1. HUECOS EN LA INCISION (tinta solida donde debe haber fondo)"
echo "  1.000 obras con la configuracion por defecto, en cuatro tandas:"
for o in 0 250 500 750; do node hueco.js trzs_test.js 250 '{"fantasma":"no"}' $o | res; done
echo "  1.000 mas repartidas entre las once configuraciones:"
for c in "${CFGS[@]}"; do node hueco.js trzs_test.js $POR "$c" | res; done
echo "-- CONTROL: orden de pintado invertido (debe disparar)"
node hueco.js trzs_orden.js 125 '{"fantasma":"no"}' | res
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = mascara ]; then
echo
echo "##### 2. LA INCISION por cobertura de mascara (90 x 11 = 990)"
for c in "${CFGS[@]}"; do printf '  %-30s' "$c"; node m2.js trzs_test.js $POR "$c" 2>&1 | sed -n 2p; done
echo "-- CONTROLES (deben disparar)"
printf '  %-30s' 'orden invertido';    node m2.js trzs_orden.js 60 '{"fantasma":"no"}' 2>&1 | sed -n 2p
printf '  %-30s' 'media seccion encima'; node m2.js trzs_mitad.js 60 '{"fantasma":"no"}' 2>&1 | sed -n 2p
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = costuras ]; then
echo
echo "##### 3. COSTURAS: la raya de 1 px dentro de la tinta (90 x 11 = 990)"
for c in "${CFGS[@]}"; do printf '  %-30s' "$c"; node cos.js trzs_test.js $POR "$c" 2>&1 | sed -n 2p; done
echo "-- CONTROL: el cuerpo vuelve a acabar a ras del halo (debe disparar)"
for c in '{}' '{"tipo":"trama"}' '{"tipo":"dos"}'; do
  printf '  %-30s' "$c"; node cos.js trzs_costura.js 125 "$c" 2>&1 | sed -n 2p; done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = remates ]; then
echo
echo "##### 4. REMATES, MARGEN Y DISCOS (200 x 5 = 1.000)"
# Aqui tambien se excluyen las fantasma: su halo NO es el color del suelo (es un
# tono corrido, para separar del suelo una cinta del color del suelo), asi que
# el sondeo no ve fondo por ningun lado y marca los cuatro cabos de la obra.
for c in '{"fantasma":"no"}' '{"tipo":"trama","fantasma":"no"}' '{"tipo":"dos","fantasma":"no"}' '{"tipo":"tres","fantasma":"no"}' '{"paralelo":"si","fantasma":"no"}'; do
  node o2.js trzs_test.js 200 "$c" 2>&1 | sed -n '1,5p'; done
echo "-- CONTROLES (deben disparar)"
# `cara` es el control del sondeo de remates: quita la incision de la cara del
# cabo y abre la holgura. `remate` (solo holgura) ya no dispara desde que la
# cara lleva su corte, y se queda como comprobacion de que asi es.
for r in cara margen ojo remate; do echo "  [$r]"
  node o2.js trzs_$r.js 60 '{"fantasma":"no"}' 2>&1 | sed -n '2,4p'
  [ $r = cara ] && node o2.js trzs_cara.js 60 '{"tipo":"dos","fantasma":"no"}' 2>&1 | sed -n '2p'
done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = resto ]; then
echo
echo "##### 5. DETERMINISMO"; node det.js
echo
echo "##### 6. HOLGURA GEOMETRICA entre hebras sin cruce (200 x 5 = 1.000)"
for c in '{}' '{"tipo":"trama"}' '{"tipo":"dos"}' '{"tipo":"tres"}' '{"paralelo":"si"}'; do
  node solape.js 200 0 "$c" 2>&1 | sed -n '2,3p'; done
fi

echo
echo "FIN"
