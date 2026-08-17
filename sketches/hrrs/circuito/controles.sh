#!/bin/bash
# LOS CONTROLES DEL DETECTOR DE FUSION. Regla de la casa: un cero sin control no significa
# nada. Se rompe el generador a proposito de tres maneras y se comprueba que `funde.js` lo
# canta; luego se comprueba que el bueno da cero.
#
#   ./controles.sh [n]
set -u
cd "$(dirname "$0")"
N="${1:-40}"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
G=gen.js

# 1. sin abrir el canal -- la pasada que sostiene la regla
sed 's|^  abreCanal(|  // ROTO abreCanal(|' "$G" > "$T/sincanal.js"
# 2. el canal medido solo entre vertices, que es lo que se hacia antes
sed 's|const d = distTramos(trazos\[k\]\[i\], trazos\[k\]\[i + 1\], trazos\[j\]\[q\], trazos\[j\]\[q + 1\]);|const d = hy(trazos[k][i][0]-trazos[j][q][0], trazos[k][i][1]-trazos[j][q][1]); // ROTO|' "$G" > "$T/vertice.js"
# 3. el suelo del corredor, por debajo de la anchura de la banda
sed 's|const MIN = sep \* 1.08;|const MIN = sep * 0.45;  // ROTO|' "$G" > "$T/suelo.js"

fallo=0
for c in sincanal vertice suelo; do
  node --check "$T/$c.js" || { echo "CONTROL $c: no compila"; fallo=1; continue; }
  out=$(node funde.js "$T/$c.js" "$N" 900 | head -1)
  n=$(echo "$out" | sed -n 's/.*FUNDEN=\([0-9]*\).*/\1/p')
  if [ "${n:-0}" -gt 0 ]; then echo "control $c ....... DISPARA   $out"
  else echo "control $c ....... NO DISPARA (el detector no ve su rotura)   $out"; fallo=1; fi
done

out=$(node funde.js "$G" "$N" 900 | head -1)
n=$(echo "$out" | sed -n 's/.*FUNDEN=\([0-9]*\).*/\1/p')
if [ "${n:-1}" -eq 0 ]; then echo "gen.js ........... LIMPIO    $out"
else echo "gen.js ........... FUNDE     $out"; fallo=1; fi
exit $fallo
