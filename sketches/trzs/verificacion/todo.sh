#!/bin/bash
# La bateria entera. Cada bloque con su control roto a proposito: un cero sin
# control no significa nada.
cd "$(dirname "$0")"
python3 mktest.py "" trzs_test.js >/dev/null || exit 1
for r in orden mitad margen ojo remate; do python3 mktest.py $r trzs_$r.js >/dev/null || exit 1; done

# Las obras FANTASMA ya NO se excluyen: hueco.html y m2.html saben leerlas. En un
# cruce de fantasma la obra es su propio negativo —el cuerpo de la cinta es el
# color del suelo y la incision se pinta en `filo`—, asi que los detectores
# INTERCAMBIAN los dos colores en esos cruces en vez de excusar uno. Se miden
# aparte porque el control roto tiene que dispararles a ellas tambien, y eso hay
# que verlo por separado. Ver README, "el fantasma, de punto ciego a medido".
CFGS=('{}' '{"tipo":"suelto"}' '{"tipo":"anudado"}' '{"tipo":"trama"}' '{"tipo":"dos"}' '{"corner":"curvas"}' '{"aspecto":1.5}' '{"tipo":"dos","aspecto":1.5}')
res() { python3 -c "
import sys,json,re; d=json.load(sys.stdin)
m=[float(x.group(1)) for x in (re.search(r'racha=([\d.]+)px',p) for p in d['peores']) if x]
print(f\"  {json.dumps(d['cfg'],ensure_ascii=False):<28} {d['cruces']:>4} cruces · >=3px {d['racha3']:>3} · >=8px {d['racha8']:>3} · >=20px {d['racha20']:>3} · peor {max(m) if m else 0}px\")"; }

echo "##### 1. HUECOS EN LA INCISION (tinta solida donde debe haber fondo)"
for o in 0 250 500 750; do node hueco.js trzs_test.js 250 '{"fantasma":"no"}' $o | res; done
for c in "${CFGS[@]}"; do node hueco.js trzs_test.js 80 "$c" | res; done
echo "-- FANTASMA (la incision es \`filo\`; el detector intercambia los colores)"
node hueco.js trzs_test.js 60 '{"fantasma":"si"}' | res
echo "-- CONTROL: orden de pintado invertido (debe disparar), normales y fantasma"
node hueco.js trzs_orden.js 30 '{"fantasma":"no"}' | res
node hueco.js trzs_orden.js 30 '{"fantasma":"si"}' | res
echo
echo "##### 2. LA INCISION por cobertura de mascara"
for c in "${CFGS[@]}"; do echo -n "  $c "; node m2.js trzs_test.js 50 "$c" 2>&1 | sed -n 2p; done
echo -n "  fantasma:             "; node m2.js trzs_test.js 50 '{"fantasma":"si"}' 2>&1 | sed -n 2p
echo "-- CONTROLES (cada uno sobre normales y sobre fantasma)"
echo -n "  orden invertido:      "; node m2.js trzs_orden.js 20 '{"fantasma":"no"}' 2>&1 | sed -n 2p
echo -n "  orden inv. fantasma:  "; node m2.js trzs_orden.js 20 '{"fantasma":"si"}' 2>&1 | sed -n 2p
echo -n "  media seccion encima: "; node m2.js trzs_mitad.js 20 '{"fantasma":"no"}' 2>&1 | sed -n 2p
echo -n "  media seccion fantas: "; node m2.js trzs_mitad.js 20 '{"fantasma":"si"}' 2>&1 | sed -n 2p
echo
echo "##### 3. REMATES, MARGEN Y DISCOS"
for c in '{}' '{"tipo":"trama"}' '{"tipo":"dos","aspecto":1.5}'; do node o2.js trzs_test.js 50 "$c" 2>&1 | sed -n '1,5p'; done
echo "-- CONTROLES"
for r in margen ojo remate; do echo "  [$r]"; node o2.js trzs_$r.js 30 '{}' 2>&1 | sed -n '2,4p'; done
echo
echo "##### 4. COSTURAS (artefacto de 1px conocido; se registra el nivel)"
# Aqui la fantasma SI se queda fuera, y por una razon distinta a la de antes: una
# costura es una raya mezclada METIDA EN LA TINTA, y en una obra fantasma la tinta
# y el fondo son el mismo hex. `esTinta` y `esFondo` colapsan en la misma clase, se
# descarta el pixel entero y el test sale 0 por no tener nada que mirar. Un 0 asi no
# es una comprobacion. Intercambiar colores no salva este: no hay dos clases.
for c in '{"fantasma":"no"}' '{"tipo":"trama","fantasma":"no"}' '{"tipo":"dos","fantasma":"no"}'; do echo -n "  $c "; node cos.js trzs_test.js 50 "$c" 2>&1 | sed -n 2p; done
echo
echo "##### 5. DETERMINISMO"; node det.js
echo
echo "##### 6. HOLGURA GEOMETRICA entre hebras sin cruce"
for c in '{}' '{"tipo":"trama"}' '{"tipo":"dos"}'; do node solape.js 80 0 "$c" 2>&1 | sed -n '2,3p'; done
