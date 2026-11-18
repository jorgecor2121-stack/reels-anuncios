"""Genera una pista tecnológica/energética original (sin derechos de terceros).
Uso: python musica_tech.py salida.wav duracion_seg [bpm] [cortes_seg separados por coma]
Bombo four-on-the-floor, hi-hats, bajo arpegiado sintetizado, pad, y un "whoosh" en cada corte de escena.
"""
import sys, wave
import numpy as np

out, dur = sys.argv[1], float(sys.argv[2])
bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 124
cortes = [float(x) for x in sys.argv[4].split(",")] if len(sys.argv) > 4 and sys.argv[4] else []
sr = 44100
n = int(dur * sr)
t = np.arange(n) / sr
beat = 60 / bpm
mix = np.zeros(n)

def env(length, attack=0.002, decay=0.2):
    x = np.arange(length) / sr
    return np.minimum(1, x / attack) * np.exp(-x / decay)

# Bombo
k_len = int(0.35 * sr)
kx = np.arange(k_len) / sr
kick = np.sin(2 * np.pi * (45 + 90 * np.exp(-kx * 30)) * kx) * env(k_len, 0.001, 0.12)
# Hi-hat (ruido filtrado simple)
rng = np.random.default_rng(7)
h_len = int(0.06 * sr)
hat = np.diff(rng.standard_normal(h_len + 1)) * env(h_len, 0.0005, 0.015) * 0.25
# Notas del bajo (La menor, arpegio)
notas = [55.0, 55.0, 65.41, 73.42, 55.0, 82.41, 73.42, 65.41]

i = 0
while i * beat < dur:
    s = int(i * beat * sr)
    e = min(n, s + k_len)
    mix[s:e] += kick[: e - s] * 0.9
    sh = int((i + 0.5) * beat * sr)
    if sh < n:
        eh = min(n, sh + h_len)
        mix[sh:eh] += hat[: eh - sh]
    for q in range(2):  # bajo en corcheas
        sb = int((i + q * 0.5) * beat * sr)
        lb = int(beat * 0.45 * sr)
        if sb >= n:
            break
        eb = min(n, sb + lb)
        f = notas[(i * 2 + q) % len(notas)]
        xb = np.arange(eb - sb) / sr
        saw = 2 * ((xb * f) % 1) - 1
        mix[sb:eb] += np.tanh(saw * 2.5) * env(eb - sb, 0.003, 0.12) * 0.22
    i += 1

# Pad suave
pad = (np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 261.6 * t) + np.sin(2 * np.pi * 329.6 * t)) / 3
mix += pad * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * t / 8))

# Whoosh en cada corte
w_len = int(0.6 * sr)
for c in cortes:
    s = int(max(0, c - 0.45) * sr)
    e = min(n, s + w_len)
    x = np.linspace(0, 1, e - s)
    noise = rng.standard_normal(e - s)
    noise = np.convolve(noise, np.ones(8) / 8, mode="same")
    mix[s:e] += noise * np.sin(np.pi * x) ** 2 * 0.35

# Fade in/out y normalización
fade = int(1.2 * sr)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.85
pcm = (mix * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(pcm.tobytes())
print(out, round(dur, 2), "s")
