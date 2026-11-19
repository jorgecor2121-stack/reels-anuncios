"""Banda sonora cinematográfica original: dron grave, pulso, tic-tac de reloj al inicio y golpes (booms) en cada plano.
Uso: python musica_cine.py salida.wav duracion cortes(coma) [tictac_hasta]"""
import sys, wave
import numpy as np
out, dur = sys.argv[1], float(sys.argv[2])
cortes = [float(x) for x in sys.argv[3].split(",") if x]
tic_hasta = float(sys.argv[4]) if len(sys.argv) > 4 else 0
sr = 44100; n = int(dur * sr); t = np.arange(n) / sr; mix = np.zeros(n)
rng = np.random.default_rng(3)
# dron: dos osciladores graves desafinados + quinta, con respiración lenta
dron = np.sin(2*np.pi*55*t) + 0.8*np.sin(2*np.pi*55.4*t) + 0.5*np.sin(2*np.pi*82.4*t) + 0.25*np.sin(2*np.pi*110*t)
mix += dron * 0.10 * (0.7 + 0.3*np.sin(2*np.pi*t/9))
# cuerdas altas que crecen hacia el final
pad = np.sin(2*np.pi*220*t) + np.sin(2*np.pi*261.6*t) + np.sin(2*np.pi*329.6*t)
mix += pad * 0.025 * np.clip(t/dur, 0, 1)**1.5
# pulso tipo latido cada 1 s
for k in np.arange(0, dur, 1.0):
    s = int(k*sr); L = int(0.25*sr); x = np.arange(min(L, n-s))/sr
    mix[s:s+len(x)] += np.sin(2*np.pi*(40+60*np.exp(-x*25))*x) * np.exp(-x*14) * 0.45
# tic-tac de reloj
for k in np.arange(0.0, tic_hasta, 0.5):
    s = int(k*sr); L = int(0.03*sr)
    if s+L < n: mix[s:s+L] += rng.standard_normal(L) * np.exp(-np.arange(L)/sr*300) * (0.35 if int(k*2)%2 else 0.22)
# boom + subida de ruido antes de cada corte
for c in cortes:
    s = int(c*sr); L = int(2.2*sr); x = np.arange(min(L, n-s))/sr
    if len(x): mix[s:s+len(x)] += np.sin(2*np.pi*(32+80*np.exp(-x*6))*x) * np.exp(-x*1.8) * 0.9
    r0 = int(max(0, c-0.8)*sr); R = s - r0
    if R > 0:
        nz = np.convolve(rng.standard_normal(R), np.ones(30)/30, mode="same")
        mix[r0:s] += nz * np.linspace(0, 1, R)**2 * 0.5
fade = int(1.5*sr); mix[:int(0.3*sr)] *= np.linspace(0,1,int(0.3*sr)); mix[-fade:] *= np.linspace(1,0,fade)
mix = mix/(np.max(np.abs(mix))+1e-9)*0.85
with wave.open(out,"wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix*32767).astype(np.int16).tobytes())
print(out)
