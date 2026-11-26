#!/usr/bin/env python3
"""Arma los props de Remotion (04_remotion.json) y la hoja de escenas (04_escenas.md) de una publicación JA-NNN.

Uso: python3 scripts/ja_props.py JORGE_ALMONTE/LOTE-01/JA-001
Lee 00_spec.json (dirección de escenas) y 03_audio/tiempos.json (tiempos reales de la voz).
"""
import json, sys
from pathlib import Path

d = Path(sys.argv[1])
ja = d.name
spec = json.loads((d / "00_spec.json").read_text())
t = json.loads((d / "03_audio" / "tiempos.json").read_text())
L = t["lines"]
n = len(L)
assert len(spec["tomas"]) == n, f"{ja}: {len(spec['tomas'])} tomas para {n} frases"
at = lambda i, f=0: round(L[i]["start"] + f * L[i]["duration"], 2)

props = {
    "tipo": spec.get("tipo", "avatar"),
    "entorno": spec["entorno"], "vestimenta": spec["vestimenta"], "escalaEscena": 0.78,
    "marca": "@jorgealmonteia", "audio": f"ja/{ja}.wav",
    "lineas": L, "fin": round(t["total"] + 1.2, 2),
    "resaltar": spec["resaltar"],
    "escenas": [tm["escena"] for tm in spec["tomas"]],
    "planos": [tm["plano"] for tm in spec["tomas"]],
    "gestos": [{"start": at(i, f), "pose": p} for i, tm in enumerate(spec["tomas"]) for f, p in zip([0, .35, .7], tm["poses"])],
    "chips": [{"start": at(c["frase"], c.get("en", .3)), "texto": c["texto"], "lado": c["lado"], "color": c["color"]} for c in spec.get("chips", [])],
    "reacciones": [{"start": at(r["frase"], r.get("en", .3)), "emoji": r["emoji"]} for r in spec.get("reacciones", [])],
    "portada": spec["portada"],
}
if spec.get("entornos"): props["entornos"] = spec["entornos"]
if spec.get("cine"): props["cine"] = True
(d / "04_remotion.json").write_text(json.dumps(props, ensure_ascii=False, indent=2))

md = [f"# {ja} — Hoja de escenas", f"Formato 1080x1920 · 30 fps · duración {props['fin']} s · entorno `{spec['entorno']}` · vestuario `{spec['vestimenta']}`",
      f"Modalidad: {spec.get('modalidad', 'presentador')}. Iluminación: {spec.get('luz', 'la del set')}.", ""]
for i, (l, tm) in enumerate(zip(L, spec["tomas"])):
    md += [f"## Escena {i + 1} · {l['start']:.1f}–{l['start'] + l['duration']:.1f} s",
           f"- Voz: «{l['text']}»",
           f"- Visual: {tm['visual']}",
           f"- Personaje: {', '.join(tm['poses'])} (gestos al 0 %, 35 % y 70 % de la frase)",
           f"- Lugar: {(spec.get('entornos') or [spec['entorno']]*n)[i]}",
           f"- Cámara: plano {tm['plano']} con empuje lento",
           f"- Gráfico: `{tm['escena']['tipo']}`",
           f"- Transición: {tm.get('transicion', 'corte con fundido de la escena superior')}", ""]
(d / "04_escenas.md").write_text("\n".join(md))
print(f"{ja}: {n} escenas, fin {props['fin']} s")
