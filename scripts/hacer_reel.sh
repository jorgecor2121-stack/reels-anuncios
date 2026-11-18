#!/usr/bin/env bash
# Produce un reel completo a partir de su guion y sus textos.
# Uso: scripts/hacer_reel.sh 02
#   Lee guiones/reel-02.txt (7 líneas) y reels/reel-02.json (textos en pantalla)
#   Genera la voz con ElevenLabs, sincroniza escenas y deja videos/reel-02.mp4
#
# Las 7 líneas del guion corresponden, en orden, a las escenas:
#   1 gancho · 2 idea · 3 cuenta regresiva · 4 tip 1 · 5 tip 2 · 6 secreto · 7 llamado a la acción
set -euo pipefail
N=$1
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
GUION="guiones/reel-$N.txt"; PROPS="reels/reel-$N.json"; NARR="narracion/reel-$N"

[ "$(grep -c . "$GUION")" -eq 7 ] || { echo "El guion debe tener 7 líneas"; exit 1; }
[ -d node_modules ] || npm ci --silent

python3 scripts/narrar_el.py "$GUION" "$NARR"

# Sincroniza: cada escena empieza cuando arranca su frase; 1 s de cola al final
python3 - "$NARR/tiempos.json" "$PROPS" <<'EOF'
import json, sys
t = json.load(open(sys.argv[1])); L = [l["start"] for l in t["lines"]]
p = json.load(open(sys.argv[2]))
p["scenes"] = [0, L[1], L[2], L[3], L[5], L[6], round(t["total"] + 1.0, 2)]
json.dump(p, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
EOF

scripts/armar_reel.sh "$PROPS" "$NARR/narracion.wav" "videos/reel-$N.mp4"
