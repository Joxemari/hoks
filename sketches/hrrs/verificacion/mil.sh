#!/bin/bash
# mil.sh — la bateria larga: 1.000 obras por bloque, repartidas entre las doce
# configuraciones, y cada bloque con su control ROTO A PROPOSITO.
#
#   ./mil.sh            # todo
#   ./mil.sh toque      # un bloque suelto
#
# NO EDITES ESTE FICHERO MIENTRAS CORRE: bash lo lee a trozos y revienta con un
# error de sintaxis que parece del codigo. Es una de las cuatro trampas que TRZS
# ya pago.
#
# La regla, y no tiene excepciones: UN CERO SIN CONTROL NO SIGNIFICA NADA. Un
# detector que solo ha dicho cero no puede distinguir "no hay defectos" de "no
# estoy mirando donde hay que mirar".
set -u
cd "$(dirname "$0")"

N=${N:-1000}
BLOQUE=${1:-todo}
FALLOS=0

linea() { printf '\n\033[1m── %s ──\033[0m\n' "$1"; }

build() { python3 mktest.py "$1" "$2" > /dev/null; }

# El sano se construye siempre desde ../algo.js tal cual se publica.
build "" hrrs_test.js

corre() {  # corre <detector> <algo> <n> <base> <configs> <etiqueta>
  local out
  out=$(node "$1" "$2" "$3" "$4" "$5" 2>/dev/null)
  echo "$out" | grep -vE '^\s*$'
  return 0
}

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = canal ]; then
  linea "canal · la regla 3 exacta sobre la geometria · $N obras"
  corre canal.js hrrs_test.js "$N" 760 ""
  for r in duro vecino otracinta; do
    build "$r" "t_$r.js"
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node canal.js "t_$r.js" 120 760 "" 2>/dev/null | grep -E "INCUMPLEN|SOLAPADAS|^  min"
  done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = toque ]; then
  # A 900 px, que es donde el pixel tiene resolucion para decir algo. Menos obras:
  # cada una lee un lienzo de 900x1272 y calcula distancias sobre el.
  linea "toque · la tinta es la geometria · $((N / 4)) obras a 900 px"
  corre toque.js hrrs_test.js "$((N / 4))" 900 ""
  for r in miter cabo; do
    build "$r" "t_$r.js"
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node toque.js "t_$r.js" 60 900 "" 2>/dev/null | grep -E "FUERA|CABO|^  p50"
  done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = obra ]; then
  linea "obra · margen, ojos, cadencia y ocupacion · $N obras"
  corre obra.js hrrs_test.js "$N" 760 ""
  for r in margen rejilla; do
    build "$r" "t_$r.js"
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node obra.js "t_$r.js" 120 760 "" 2>/dev/null | grep -E "FUERA DEL CUADRO|MUESTRARIO|LABERINTO|cadencia|dispersion"
  done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = det ]; then
  # Menos obras: cada una son SEIS renders, dos de ellos a 2400 y 4200 de lado
  # corto. No tiene control porque no puede tenerlo — un control de determinismo
  # seria meter Math.random() en el algoritmo, y entonces no se estaria probando
  # el artefacto publicado sino otro.
  linea "det · determinismo y misma huella a tres resoluciones · 60 obras"
  node det.js hrrs_test.js 60 "" 2>&1 | grep -vE "^\\s*$"
fi

linea "hecho"
echo "Los ceros de arriba solo valen si su CONTROL disparo. Comprobalo."
exit $FALLOS
