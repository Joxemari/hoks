#!/bin/bash
# LOS CONTROLES. Regla de la casa: un cero sin control no significa nada.
#
# Y la regla de que las bandas no se funden ya no la sostiene un martillo: la sostiene una
# DERIVACION. La densidad va al final y la banda se corta a la medida del hueco que dejo la
# composicion, W = hueco / (1 + canal). Asi que los controles rompen la derivacion y los vetos
# del campo, que son las dos piezas de las que depende.
#
# Se mide por dos sitios porque hay dos maneras de perder la obra: FUNDIR (dos bandas se tocan)
# y COLAPSAR (el hueco se va a cero y con el la densidad, o sea que no hay obra). Un control que
# rompe la derivacion funde; un control que quita un veto colapsa.
#
#   ./controles.sh [n]
set -u
cd "$(dirname "$0")"
N="${1:-40}"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
G=gen.js
fallo=0

# ── los que rompen la derivacion: se miden por la fusion ──────────────────────────────────────
# 1. la banda fija, sorteada al principio -- que es como estaba antes de su correccion
sed 's|W = Math.min(0.098, hueco / (1 + CANAL));|W = 0.062;  // ROTO: densidad al principio|' \
  "$G" > "$T/fija.js"
# 2. la banda igual al hueco, sin dejarle sitio al canal
sed 's|W = Math.min(0.098, hueco / (1 + CANAL));|W = hueco;  // ROTO: sin canal|' \
  "$G" > "$T/sincanal.js"

for c in fija sincanal; do
  node --check "$T/$c.js" || { echo "CONTROL $c: no compila"; fallo=1; continue; }
  out=$(node funde.js "$T/$c.js" "$N" 900 | head -1)
  n=$(echo "$out" | sed -n 's/.*FUNDEN=\([0-9]*\).*/\1/p')
  if [ "${n:-0}" -gt 0 ]; then echo "control $c ...... DISPARA   $out"
  else echo "control $c ...... NO DISPARA   $out"; fallo=1; fi
done

# ── los que quitan un veto: se miden por la densidad ──────────────────────────────────────────
# Sin veto no aparecen fusiones —la derivacion sigue cumpliendo la regla— pero el campo lleva
# dos trazos a cruzarse, el hueco se va a cero y la obra desaparece. Ahi es donde duele.
sed 's|      if (vale) trazos\[k\] = mov;|      trazos[k] = mov;  // ROTO: sin veto rigido|' \
  "$G" > "$T/sinrigido.js"
sed 's|      if (vale) trazos\[k\] = enc;|      trazos[k] = enc;  // ROTO: sin veto del encauzado|' \
  "$G" > "$T/sinencauza.js"

for c in sinrigido sinencauza; do
  node --check "$T/$c.js" || { echo "CONTROL $c: no compila"; fallo=1; continue; }
  sv=$(node densidad.js "$T/$c.js" "$N" | tail -1)
  nv=$(echo "$sv" | sed -n 's/.*colapsada (W<=0,012): \([0-9]*\).*/\1/p')
  if [ "${nv:-0}" -gt 0 ]; then echo "control $c ... DISPARA   $sv"
  else echo "control $c ... NO DISPARA   $sv"; fallo=1; fi
done

# EL VETO POR PUNTO NO ES PIEZA, y el control lo dice: quitandolo no funde ni colapsa nada. Se
# deja anotado en vez de fingir que sostiene algo. Los dos que sostienen son el del cuerpo
# rigido y el del encauzado: quitando cualquiera de los dos colapsan casi todas las obras.

# ── y el bueno ────────────────────────────────────────────────────────────────────────────────
echo "gen.js densidad .. $(node densidad.js "$G" "$N" | tail -1)"
out=$(node funde.js "$G" "$N" 900 | head -1)
n=$(echo "$out" | sed -n 's/.*FUNDEN=\([0-9]*\).*/\1/p')
if [ "${n:-1}" -eq 0 ]; then echo "gen.js ........... LIMPIO    $out"
else echo "gen.js ........... FUNDE     $out"; fallo=1; fi
exit $fallo
