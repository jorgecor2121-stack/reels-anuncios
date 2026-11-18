"""Narración con la voz clonada en ElevenLabs.

Uso: python3 narrar_el.py guion.txt salida_dir
Genera linea_NN.mp3 por frase, narracion.wav completa y tiempos.json para sincronizar el video.
La clave la inyecta el proxy del entorno; aquí solo va un marcador.
"""
import json, subprocess, sys, urllib.request
from pathlib import Path

VOICE_ID = json.loads((Path(__file__).parent / "elevenlabs-voice.json").read_text())["voice_id"]
MODEL = "eleven_v4"
GAP_S = float(__import__("os").environ.get("PAUSA", "0.25"))
import os
SETTINGS = {"stability": 0.5, "similarity_boost": 0.5}
if os.environ.get("VELOCIDAD"):
    SETTINGS["speed"] = float(os.environ["VELOCIDAD"])  # p. ej. 1.08 para anuncios con más energía

guion, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
lines = [l.strip() for l in guion.read_text(encoding="utf-8").splitlines() if l.strip()]


def tts(text, prev, nxt, dest):
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS,
            "previous_text": prev, "next_text": nxt}
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), method="POST",
        headers={"xi-api-key": "proxy-injected", "Content-Type": "application/json"})
    dest.write_bytes(urllib.request.urlopen(req, timeout=120).read())


def duration(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))


timings, t, parts = [], 0.0, []
for i, text in enumerate(lines):
    f = out / f"linea_{i:02d}.mp3"
    tts(text, " ".join(lines[:i])[-300:], " ".join(lines[i + 1:])[:300], f)
    d = duration(f)
    timings.append({"text": text, "start": round(t, 3), "duration": round(d, 3)})
    parts.append(f)
    t += d + GAP_S
    print(f"[{i + 1}/{len(lines)}] {d:.1f}s  {text}", flush=True)

# Unir con pausas
inputs, filt = [], ""
for i, p in enumerate(parts):
    inputs += ["-i", str(p)]
    filt += f"[{i}:a]aresample=44100,apad=pad_dur={GAP_S}[a{i}];"
filt += "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", filt, "-map", "[o]", str(out / "narracion.wav")], check=True)
(out / "tiempos.json").write_text(json.dumps({"total": round(t, 3), "lines": timings}, ensure_ascii=False, indent=2), encoding="utf-8")
print("total", round(t, 1), "s")
