"""Acorta pausas internas y acelera levemente cada frase (sin cambiar el tono); rehace narracion.wav y tiempos.json.
Uso: python3 scripts/acelerar_narracion.py narracion/CARPETA [tempo=1.12] [pausa=0.08]"""
import json, subprocess, sys
d = sys.argv[1]; TEMPO = sys.argv[2] if len(sys.argv) > 2 else "1.12"; GAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.08
t = json.load(open(f"{d}/tiempos.json")); tot = 0; parts = []
dur = lambda p: float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
for i, l in enumerate(t["lines"]):
    src = f"{d}/linea_{i:02d}.mp3"; out = f"{d}/rapida_{i:02d}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af",
        f"silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.18:stop_threshold=-42dB,atempo={TEMPO}", "-ar", "44100", out], check=True)
    dd = dur(out); l["start"] = round(tot, 3); l["duration"] = round(dd, 3); tot += dd + GAP; parts.append(out)
inputs = sum([["-i", p] for p in parts], [])
filt = "".join(f"[{i}:a]apad=pad_dur={GAP}[a{i}];" for i in range(len(parts))) + "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", filt, "-map", "[o]", f"{d}/narracion.wav"], check=True)
t["total"] = round(tot, 3); json.dump(t, open(f"{d}/tiempos.json", "w"), ensure_ascii=False, indent=2)
print("total", round(tot, 1), [round(l["start"], 2) for l in t["lines"]])
