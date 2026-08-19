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

# Construye una version de prueba y se PLANTA si no puede.
#
# El borrado de antes no es cosmetico. `mktest.py` parchea lineas literales de
# ../algo.js, asi que cuando el algoritmo se reescribe un parche puede dejar de
# encajar — y si el fichero viejo sigue en disco, el detector se lanza igual y mide
# el control de HACE DOS VERSIONES. Sale un numero, el numero dispara, y todo el
# bloque parece comprobado. Un control medido contra un artefacto viejo es peor que
# no tener control: no prueba nada y ademas convence.
build() {
  rm -f "$2"
  if ! python3 mktest.py "$1" "$2" > /dev/null; then
    printf '\n\033[1;31m  NO SE PUDO CONSTRUIR EL CONTROL «%s»\033[0m\n' "${1:-sano}"
    printf '  El parche ya no encaja en algo.js. NO se mide contra el fichero viejo.\n'
    printf '  Arregla mktest.py antes de creerte los ceros de este bloque.\n'
    FALLOS=$((FALLOS + 1))
    return 1
  fi
}

# El sano se construye siempre desde ../algo.js tal cual se publica. Si esto falla,
# no hay nada que medir.
build "" hrrs_test.js || exit 2

corre() {  # corre <detector> <algo> <n> <base> <configs> <etiqueta>
  local out
  out=$(node "$1" "$2" "$3" "$4" "$5" 2>/dev/null)
  echo "$out" | grep -vE '^\s*$'
  return 0
}

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = canal ]; then
  # LA REGLA GEOMETRICA VALE DONDE NO HAY HALO, y por eso los controles corren en la
  # configuracion `sin-halo` y no en todas. Corridos en todas median la rama que el
  # halo no ejecuta -o sea, nada- y salian identicos al sano byte por byte. Un control
  # que parchea codigo muerto es la peor clase de control: sale verde y no ha mirado.
  linea "canal · la regla 3 exacta sobre la geometria · $N obras"
  corre canal.js hrrs_test.js "$N" 760 ""
  for r in duro corta rendija; do
    build "$r" "t_$r.js" || continue
    printf '\n  CONTROL %s (tiene que disparar, sin-halo):\n' "$r"
    node canal.js "t_$r.js" 120 760 "sin-halo" 2>/dev/null | grep -E "RENDIJA|^  min"
  done
  build holgura t_holgura.js && {
    printf '\n  CONTROL holgura (tiene que disparar):\n'
    node canal.js t_holgura.js 120 760 "" 2>/dev/null | grep -E "HOLGURA"
  }
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = pelo ]; then
  # DONDE VIVE HOY LA GARANTIA. Con halo el canal no se prohibe, se fabrica al pintar,
  # asi que la afirmacion -el blanco entre dos tintas nunca mide menos de g- ya no es
  # geometria de ejes: es pixel. `canal.js` mide la regla vieja y aqui se mide la que
  # rige. Sin este bloque la bateria comprobaba a fondo una regla retirada y no
  # comprobaba la vigente.
  linea "pelo · el canal VISIBLE, sobre el pixel · $((N / 4)) obras"
  corre pelo.js hrrs_test.js "$((N / 4))" 760 ""
  # `corta` estaba aqui y se ha quitado: desde que el corte es el offset exacto de la
  # tinta ya no produce ni un par por debajo de g, o sea que no ejercita nada. En su
  # sitio va `cuna`, que es la construccion de antes -la banda mas gorda, con su bisel-
  # y que es justo lo que este detector existe para cazar.
  for r in duro cuna; do
    build "$r" "t_$r.js" || continue
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node pelo.js "t_$r.js" 60 760 "" 2>/dev/null | grep -E "^  pelo|por debajo"
  done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = toque ]; then
  # A 900 px, que es donde el pixel tiene resolucion para decir algo. Menos obras:
  # cada una lee un lienzo de 900x1272 y calcula distancias sobre el.
  linea "toque · la tinta es la geometria · $((N / 4)) obras a 900 px"
  corre toque.js hrrs_test.js "$((N / 4))" 900 ""
  for r in miter cabo; do
    build "$r" "t_$r.js" || continue
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node toque.js "t_$r.js" 60 900 "" 2>/dev/null | grep -E "FUERA|CABO|^  p50"
  done
fi

if [ "$BLOQUE" = todo ] || [ "$BLOQUE" = obra ]; then
  linea "obra · margen, ojos, cadencia y ocupacion · $N obras"
  corre obra.js hrrs_test.js "$N" 760 ""
  for r in margen garabato pizca; do
    build "$r" "t_$r.js" || continue
    printf '\n  CONTROL %s (tiene que disparar):\n' "$r"
    node obra.js "t_$r.js" 120 760 "" 2>/dev/null | grep -E "ESCAPADO|GARABATO|PIZCAS"
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
