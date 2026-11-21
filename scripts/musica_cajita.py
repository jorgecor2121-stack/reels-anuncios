"""Música original tipo cajita musical (canción de cuna) con efectos: 'boing' de susto y burbujas de corazones.
Uso: python3 scripts/musica_cajita.py salida.wav duracion [susto_s] [corazones_s,...]"""
import sys, wave
import numpy as np
out, dur = sys.argv[1], float(sys.argv[2])
susto = float(sys.argv[3]) if len(sys.argv) > 3 else -1
cor = [float(x) for x in sys.argv[4].split(",")] if len(sys.argv) > 4 else []
sr = 44100; n = int(dur*sr); t = np.arange(n)/sr; mix = np.zeros(n)
def nota(f0, t0, d=1.6, v=0.22):
    s = int(t0*sr); L = min(int(d*sr), n-s)
    if L <= 0: return
    x = np.arange(L)/sr
    w = np.sin(2*np.pi*f0*x) + 0.35*np.sin(2*np.pi*f0*2.01*x) + 0.12*np.sin(2*np.pi*f0*3.98*x)
    mix[s:s+L] += w*np.exp(-x*3.2)*v
F = lambda m: 440*2**((m-69)/12)
# melodía de cuna en 3/4 (Do mayor), negra = 0.4 s
mel = [72,76,79,76,74,77,81,77,72,76,79,84,83,79,74,76, 72,76,79,76,74,77,81,77,79,76,74,72]
for i, m in enumerate(mel):
    if i*0.4 < dur-0.5: nota(F(m), 0.2+i*0.4)
bajos = [48,53,48,55,48,53,55,48,48,53,48,55]
for i, m in enumerate(bajos):
    if i*1.2 < dur-0.5: nota(F(m), 0.2+i*1.2, d=2.2, v=0.16)
if susto >= 0:  # boing
    s = int(susto*sr); L = int(0.6*sr); x = np.arange(min(L, n-s))/sr
    mix[s:s+len(x)] += np.sin(2*np.pi*(180+260*np.sin(2*np.pi*7*x)*np.exp(-x*4))*x)*np.exp(-x*5)*0.5
for c in cor:   # burbujitas
    for k in range(5):
        s = int((c+k*0.18)*sr); L = int(0.12*sr); x = np.arange(min(L, n-s))/sr
        if len(x): mix[s:s+len(x)] += np.sin(2*np.pi*(700+900*x/0.12+k*80)*x)*np.exp(-x*30)*0.25
fade = np.minimum(1, np.minimum(t/0.3, (dur-t)/0.8)); mix *= np.clip(fade, 0, 1)
mix = mix/np.max(np.abs(mix))*0.8
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix*32767).astype(np.int16).tobytes())
print(out)
