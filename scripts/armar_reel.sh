#!/usr/bin/env bash
# Arma un reel: video animado + narración + música de fondo.
# Uso: ./armar_reel.sh props.json narracion.wav salida.mp4
set -euo pipefail
PROPS=$1; NARR=$2; OUT=$3
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome

# Duración = fin de la última escena (incluye ~1 s de cola tras la voz)
D=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['scenes'][-1])" "$PROPS")

# 1) Voz normalizada a archivo aparte (loudnorm en línea retrasa y corta el final)
ffmpeg -y -loglevel error -i "$NARR" -af "aresample=44100,loudnorm=I=-16:TP=-1.5" -ar 44100 "$TMP/voz.wav"

# 2) Video
COMP=$(python3 -c "import json,sys;print('ReelTips' if json.load(open(sys.argv[1])).get('tipo')=='tips' else 'Reel')" "$PROPS")
npx remotion render "$COMP" "$TMP/video.mp4" --props="$PROPS" --browser-executable="$CHROME" --codec=h264 --log=error

# 3) Mezcla: voz + bombo suave, con fade al final
FADE=$(python3 -c "print(max(0, $D - 1.5))")
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='0.9*sin(2*PI*55*t)*exp(-12*mod(t,0.5))+0.08*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*0.25*t))':s=44100:d=$D" \
  -i "$TMP/voz.wav" -i "$TMP/video.mp4" \
  -filter_complex "[0:a]volume=0.12,afade=t=out:st=$FADE:d=1.5[bg];[1:a]adelay=150|150,apad[v];[v][bg]amix=inputs=2:duration=shortest:normalize=0[a]" \
  -map 2:v -map "[a]" -c:v copy -c:a aac -b:a 160k -t "$D" -movflags +faststart "$OUT"
rm -rf "$TMP"
echo "$OUT ($D s)"
