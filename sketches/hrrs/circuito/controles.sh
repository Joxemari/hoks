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
N="${1:-120}"   # 40 se quedaba corto tres veces seguidas: ver disparan.js
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
G=gen.js
fallo=0

# ── los que rompen la garantia: se miden por la fusion ────────────────────────────────────────
# Y OJO CON QUE PIEZA ES. La primera version de estos controles rompia la DERIVACION de la banda
# (W del percentil 25) y no disparaba: porque detras hay una reparacion local que separa los pares
# mas apretados hasta W*1,06, y esa reparacion arreglaba la rotura del propio control. O sea que
# la regla no la garantiza el percentil -- eso es la DENSIDAD-- la garantiza la reparacion local.
# El control lo dijo antes de que se publicara la atribucion equivocada.
#
# Y la cadena, ya con cada pieza en su sitio:
#   W = percentil 25 de los huecos ......... pone la DENSIDAD (calibrada contra r1 y r2)
#   la reparacion local .................... separa los pares mas apretados, para que un outlier
#                                            no arrastre la densidad de la obra entera
#   W = min(W, hueco minimo * 0,98) ........ GARANTIZA que no funde, y es esta y solo esta
#
# 1. sin el suelo final: se queda el percentil y los pares por debajo se funden
sed 's|W = Math.min(W, huecoMinimo(trazos) / (1 + CANAL));|// ROTO: sin el suelo que garantiza la regla|' \
  "$G" > "$T/sinsuelo.js"
# 2. sin la reparacion Y con la banda fija: la densidad deja de obedecer a la composicion
sed -e 's|      if (!peor) break;|      if (!peor) break; if (1) break;  // ROTO|' \
    -e 's|W = Math.min(W, huecoMinimo(trazos) / (1 + CANAL));|// ROTO: sin el suelo final|' \
    -e 's|W = Math.min(0.098, percentil(hs0, P_BANDA));|W = 0.062;  // ROTO: banda fija|' \
  "$G" > "$T/fija.js"

for c in sinsuelo fija; do
  node --check "$T/$c.js" || { echo "CONTROL $c: no compila"; fallo=1; continue; }
  # UN SED QUE NO ENGANCHA ES UN CONTROL QUE MIENTE, y acaba de pasar: al derivar el suelo del
  # canal cambió la línea y estos parches se quedaron buscando un texto que ya no existe. El
  # control habría dicho «no dispara» y yo habría ido a buscar el fallo al generador.
  if cmp -s "$G" "$T/$c.js"; then echo "CONTROL $c: EL PARCHE NO ENGANCHA (texto cambiado)"; fallo=1; continue; fi
  out=$(node funde.js "$T/$c.js" "$N" 900 | head -1)
  n=$(echo "$out" | sed -n 's/.*FUNDEN=\([0-9]*\).*/\1/p')
  if [ "${n:-0}" -gt 0 ]; then echo "control $c ...... DISPARA   $out"
  else echo "control $c ...... NO DISPARA   $out"; fallo=1; fi
done

# ── los que quitan un veto: se miden por la densidad ──────────────────────────────────────────
# Sin veto no aparecen fusiones —la derivacion sigue cumpliendo la regla— pero el campo lleva
# dos trazos a cruzarse, el hueco se va a cero y la obra desaparece. Ahi es donde duele.
#
# Y SE PASAN CON EL CAMPO ENCENDIDO (HRRS_V=16), porque el campo va apagado por defecto -- una
# prueba contra la geometria real de r1, r2, r3 y r6 dijo que borra las celdas de las cuatro. Con
# el apagado los vetos son codigo muerto y su control no podria significar nada.
sed 's|      if (vale) trazos\[k\] = mov;|      trazos[k] = mov;  // ROTO: sin veto rigido|' \
  "$G" > "$T/sinrigido.js"
sed 's|      if (vale) trazos\[k\] = enc;|      trazos[k] = enc;  // ROTO: sin veto del encauzado|' \
  "$G" > "$T/sinencauza.js"

for c in sinrigido sinencauza; do
  node --check "$T/$c.js" || { echo "CONTROL $c: no compila"; fallo=1; continue; }
  sv=$(HRRS_V=16 node densidad.js "$T/$c.js" "$N" | tail -1)
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
