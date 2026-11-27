#!/usr/bin/env python3
"""Sistema de análisis de Instagram para los reels JA-NNN (SOLO LECTURA: no publica ni edita nada).

Las métricas se consultan con Composio (Instagram Graph API) desde la sesión de Claude; este script
solo organiza, guarda y analiza las respuestas.

Uso:
  python3 scripts/ja_analisis.py sync                      # crea/actualiza el historial JA-NNN.json con los datos de cada carpeta
  python3 scripts/ja_analisis.py pendientes                # qué mediciones (24h / 48h / 7d) tocan ahora
  python3 scripts/ja_analisis.py registrar JA-001 24h reel.json [cuenta.json]
                                                           # guarda una medición a partir de las respuestas crudas de la API
  python3 scripts/ja_analisis.py informe                   # genera analiticas/INFORME.md (comparativo y recomendaciones)

Archivos (JORGE_ALMONTE/analiticas/):
  JA-NNN.json      historial por código: datos del reel + mediciones 24h/48h/7d (y "control" para pruebas)
  crudo/           respuestas originales de la API, sin tocar
  INFORME.md       comparativo, patrones y recomendaciones
"""
import json, sys, glob, os, shutil, datetime as dt
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
JA = RAIZ / "JORGE_ALMONTE"
AN = JA / "analiticas"
CRUDO = AN / "crudo"
VENTANAS = {"24h": 24, "48h": 48, "7d": 168}
FUENTE_REEL = "Instagram Graph API vía Composio · INSTAGRAM_GET_IG_MEDIA_INSIGHTS (period=lifetime)"
FUENTE_CUENTA = "Instagram Graph API vía Composio · INSTAGRAM_GET_USER_INSIGHTS (period=day)"
NOTA_CUENTA = ("Métrica de TODA la cuenta en ese periodo. La API no permite atribuir visitas al perfil "
               "ni seguidores nuevos a un reel individual: NO es un resultado de este reel.")

ahora = lambda: dt.datetime.now(dt.timezone.utc)
iso = lambda d: d.strftime("%Y-%m-%dT%H:%M:%SZ")


def leer(p, defecto=None):
    try:
        return json.loads(Path(p).read_text())
    except Exception:
        return defecto


def carpetas():
    return sorted(Path(p) for p in glob.glob(str(JA / "LOTE-*" / "JA-*")))


def seccion(md, titulo):
    if f"## {titulo}\n" not in md:
        return ""
    return md.split(f"## {titulo}\n", 1)[1].split("\n## ")[0].strip()


def datos_carpeta(d: Path):
    spec = leer(d / "00_spec.json", {})
    props = leer(d / "04_remotion.json", {})
    pub = (d / "07_publicacion.md").read_text() if (d / "07_publicacion.md").exists() else ""
    linea = lambda k: next((l.split(":", 1)[1].strip() for l in pub.splitlines() if l.startswith(k + ":")), None)
    cta = seccion(pub, "CTA")
    accion = None
    for a in ("COMENTAR", "SEGUIR", "GUARDAR", "COMPARTIR"):
        if f"**{a}**" in cta:
            accion = a
    if not accion:  # reels publicados antes de la regla de CTA (27-nov)
        accion = "SEGUIR (genérico, antes de la regla de CTA)"
    lote = d.parent.name
    return {
        "titulo": linea("Título"), "tipo": linea("Tipo"), "gancho": linea("Gancho"),
        "modalidad": "cine/protagonista" if spec.get("cine") else "presentador",
        "cta_accion": accion, "vestimenta": spec.get("vestimenta"),
        "entornos": spec.get("entornos") or [spec.get("entorno")],
        "duracion_s": props.get("fin"), "lote": lote, "carpeta": str(d.relative_to(RAIZ)),
    }


def publicados():
    out = {}
    for p in leer(RAIZ / "publicados.json", []):
        n = str(p.get("numero", ""))
        if n.startswith("JA-"):
            out[n] = p
    return out


def sync():
    AN.mkdir(parents=True, exist_ok=True)
    CRUDO.mkdir(exist_ok=True)
    pubs = publicados()
    for d in carpetas():
        ja = d.name
        f = AN / f"{ja}.json"
        h = leer(f, {"id": ja, "mediciones": {}})
        h["reel"] = datos_carpeta(d)
        p = pubs.get(ja)
        if p:
            h["publicacion"] = {"media_id": p["media_id"], "enlace": p["enlace"], "publicado_utc": p["publicado"]}
            # la duración de un reel publicado queda fija (la del video que salió)
            h["reel"]["duracion_s"] = h.get("duracion_publicada") or h["reel"]["duracion_s"]
            h["duracion_publicada"] = h["reel"]["duracion_s"]
            h["estado"] = "publicado"
        else:
            h["publicacion"] = None
            h["estado"] = "pendiente de publicar"
        f.write_text(json.dumps(h, ensure_ascii=False, indent=2))
    print(f"historial sincronizado: {len(carpetas())} reels en {AN.relative_to(RAIZ)}")


def horas_desde(h):
    t = dt.datetime.strptime(h["publicacion"]["publicado_utc"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc)
    return (ahora() - t).total_seconds() / 3600


def pendientes():
    sync()
    filas = []
    for f in sorted(AN.glob("JA-*.json")):
        h = leer(f)
        if h.get("estado") != "publicado":
            continue
        hs = horas_desde(h)
        for v, lim in VENTANAS.items():
            if hs >= lim and v not in h["mediciones"]:
                filas.append((h["id"], v, h["publicacion"]["media_id"], round(hs, 1)))
    for r in filas:
        print("\t".join(map(str, r)))
    if not filas:
        print("NINGUNA")
    return filas


def valores(resp):
    """Saca {métrica: valor} de la respuesta de INSTAGRAM_GET_IG_MEDIA_INSIGHTS / GET_USER_INSIGHTS (cualquier envoltorio)."""
    def buscar(x):
        if isinstance(x, dict):
            if isinstance(x.get("data"), list) and x["data"] and isinstance(x["data"][0], dict) and "name" in x["data"][0]:
                return x["data"]
            for v in x.values():
                r = buscar(v)
                if r:
                    return r
        if isinstance(x, list):
            for v in x:
                r = buscar(v)
                if r:
                    return r
        return None
    out = {}
    for r in buscar(resp) or []:
        v = (r.get("total_value") or {}).get("value")
        if v is None and r.get("values"):
            vals = [x.get("value") for x in r["values"] if isinstance(x.get("value"), (int, float))]
            v = sum(vals) if r.get("period") == "day" and len(vals) > 1 else (r["values"][-1].get("value"))
        out[r["name"]] = v
    return out


def registrar(ja, ventana, reel_json, cuenta_json=None):
    sync()
    f = AN / f"{ja}.json"
    h = leer(f)
    assert h and h.get("estado") == "publicado", f"{ja} no está publicado"
    sello = ahora().strftime("%Y%m%dT%H%M%SZ")
    crudo_reel = CRUDO / f"{ja}_{ventana}_{sello}_reel.json"
    shutil.copy(reel_json, crudo_reel)
    m = valores(leer(reel_json))
    dur = h["reel"].get("duracion_s") or 0
    avg = (m.get("ig_reels_avg_watch_time") or 0) / 1000
    reach = m.get("reach") or 0
    por1000 = lambda k: round((m.get(k) or 0) * 1000 / reach, 1) if reach else None
    med = {
        "consultado_utc": iso(ahora()), "horas_desde_publicacion": round(horas_desde(h), 1),
        "reales": {"fuente": FUENTE_REEL, "crudo": str(crudo_reel.relative_to(RAIZ)),
                   "reproducciones": m.get("views"), "alcance": m.get("reach"), "me_gusta": m.get("likes"),
                   "comentarios": m.get("comments"), "compartidos": m.get("shares"), "guardados": m.get("saved"),
                   "interacciones_totales": m.get("total_interactions"),
                   "tiempo_promedio_visto_s": round(avg, 2) if m.get("ig_reels_avg_watch_time") is not None else None,
                   "tiempo_total_visto_s": round((m.get("ig_reels_video_view_total_time") or 0) / 1000, 1) if m.get("ig_reels_video_view_total_time") is not None else None,
                   "saltos_primeros_3s_pct": m.get("reels_skip_rate")},
        "calculados": {"nota": "Calculados por este script a partir de los datos reales; no vienen de Instagram.",
                       "retencion_promedio_pct": round(avg * 100 / dur, 1) if dur and m.get("ig_reels_avg_watch_time") is not None else None,
                       "guardados_por_1000_alcance": por1000("saved"), "compartidos_por_1000_alcance": por1000("shares"),
                       "comentarios_por_1000_alcance": por1000("comments"),
                       "interacciones_por_1000_alcance": por1000("total_interactions")},
        "no_disponible": {"curva_de_retencion": "La API no la ofrece; se usa retención promedio = tiempo promedio / duración.",
                          "visitas_al_perfil_por_reel": "La API no la ofrece para reels.",
                          "seguidores_por_reel": "La API no la ofrece para reels."},
    }
    if cuenta_json:
        crudo_c = CRUDO / f"{ja}_{ventana}_{sello}_cuenta.json"
        shutil.copy(cuenta_json, crudo_c)
        c = valores(leer(cuenta_json))
        med["cuenta_no_atribuible"] = {"fuente": FUENTE_CUENTA, "crudo": str(crudo_c.relative_to(RAIZ)), "nota": NOTA_CUENTA,
                                       "visitas_al_perfil": c.get("profile_views"), "seguidores_nuevos": c.get("follower_count"),
                                       "alcance_cuenta": c.get("reach"), "reproducciones_cuenta": c.get("views")}
    h["mediciones"][ventana] = med
    f.write_text(json.dumps(h, ensure_ascii=False, indent=2))
    print(f"{ja} {ventana}: guardado ({med['reales']['reproducciones']} reproducciones, alcance {med['reales']['alcance']})")


def ultima(h):
    for v in ("7d", "48h", "24h", "control"):
        if v in h["mediciones"]:
            return v, h["mediciones"][v]
    return None, None


def informe():
    sync()
    H = [leer(f) for f in sorted(AN.glob("JA-*.json"))]
    pub = [h for h in H if h.get("estado") == "publicado"]
    L = ["# Informe de análisis — reels JA", "",
         f"Generado: {iso(ahora())} · Fuente: Instagram vía Composio (solo lectura).",
         "Leyenda: **real** = dato de Instagram · *calc.* = calculado aquí a partir de datos reales · "
         "*cuenta* = métrica de toda la cuenta, **no atribuible** a un reel.", ""]
    L += ["## Tabla comparativa (última medición disponible de cada reel)", "",
          "| ID | Título | Medición | Reprod. | Alcance | Me gusta | Coment. | Compart. | Guard. | Prom. visto (s) | Retención *calc.* | Saltos 3 s | CTA |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    base = None
    for h in pub:
        v, m = ultima(h)
        r = (m or {}).get("reales", {}); c = (m or {}).get("calculados", {})
        if h["id"] == "JA-001":
            base = (v, r, c)
        fmt = lambda x, s="": "—" if x is None else f"{x}{s}"
        L.append(f"| {h['id']} | {h['reel'].get('titulo')} | {v or 'sin medir'} | {fmt(r.get('reproducciones'))} | {fmt(r.get('alcance'))} | "
                 f"{fmt(r.get('me_gusta'))} | {fmt(r.get('comentarios'))} | {fmt(r.get('compartidos'))} | {fmt(r.get('guardados'))} | "
                 f"{fmt(r.get('tiempo_promedio_visto_s'))} | {fmt(c.get('retencion_promedio_pct'), ' %')} | {fmt(r.get('saltos_primeros_3s_pct'), ' %')} | {h['reel'].get('cta_accion')} |")
    pend = [h["id"] for h in H if h.get("estado") != "publicado"]
    if pend:
        L += ["", f"Pendientes de publicar (sin métricas): {', '.join(pend)}."]
    # Comparación contra JA-001 en la misma ventana
    L += ["", "## Comparación contra JA-001 (misma ventana de medición)", ""]
    hubo = False
    ref = next((h for h in pub if h["id"] == "JA-001"), None)
    for h in pub:
        if h["id"] == "JA-001" or not ref:
            continue
        for v in ("7d", "48h", "24h"):
            if v in h["mediciones"] and v in ref["mediciones"]:
                a, b = ref["mediciones"][v], h["mediciones"][v]
                dif = lambda k, sec="reales": (b[sec].get(k), a[sec].get(k))
                L.append(f"- **{h['id']} vs JA-001 ({v})**: reproducciones {dif('reproducciones')[0]} vs {dif('reproducciones')[1]} · "
                         f"retención {dif('retencion_promedio_pct','calculados')[0]} % vs {dif('retencion_promedio_pct','calculados')[1]} % · "
                         f"saltos 3 s {dif('saltos_primeros_3s_pct')[0]} % vs {dif('saltos_primeros_3s_pct')[1]} %")
                hubo = True
                break
    if not hubo:
        L.append("Aún no hay dos reels con la misma ventana (24 h / 48 h / 7 d) medida. Se completará automáticamente.")
    # Patrones
    L += ["", "## Patrones (promedio de la última medición, solo reels medidos)", ""]
    def grupo(clave, etiqueta):
        g = {}
        for h in pub:
            v, m = ultima(h)
            if not m or v == "control":
                continue
            g.setdefault(clave(h), []).append(m)
        if not g:
            return
        L.append(f"**Por {etiqueta}:**")
        for k, ms in g.items():
            prom = lambda f: round(sum(f(x) or 0 for x in ms) / len(ms), 1)
            L.append(f"- {k} (n={len(ms)}): retención {prom(lambda x: x['calculados'].get('retencion_promedio_pct'))} % · "
                     f"saltos 3 s {prom(lambda x: x['reales'].get('saltos_primeros_3s_pct'))} % · "
                     f"interacciones/1000 alcance {prom(lambda x: x['calculados'].get('interacciones_por_1000_alcance'))}")
        L.append("")
    grupo(lambda h: h["reel"]["modalidad"], "modalidad")
    grupo(lambda h: h["reel"]["cta_accion"], "CTA")
    grupo(lambda h: "≤45 s" if (h["reel"].get("duracion_s") or 0) <= 45 else "45–60 s", "duración")
    medidos = [h for h in pub if ultima(h)[0] not in (None, "control")]
    if not medidos:
        L.append("Todavía no hay mediciones de 24 h / 48 h / 7 d. Los patrones aparecen cuando existan.")
    # Recomendaciones basadas en datos
    L += ["", "## Recomendaciones", ""]
    n = len(medidos)
    conf = "baja (menos de 5 reels medidos)" if n < 5 else "media" if n < 10 else "alta"
    L.append(f"Confianza actual: **{conf}**. Con pocos videos, las diferencias pueden ser azar; se confirman con más datos.")
    rec = []
    for h in medidos:
        v, m = ultima(h)
        s = m["reales"].get("saltos_primeros_3s_pct"); ret = m["calculados"].get("retencion_promedio_pct")
        if s is not None and s >= 40:
            rec.append(f"- {h['id']}: {s} % salta en los primeros 3 s → el gancho «{h['reel'].get('gancho')}» no detiene; probar arranque con movimiento + texto grande y frase más corta.")
        if ret is not None and ret < 25:
            rec.append(f"- {h['id']}: retención {ret} % → acortar o dar un giro antes del segundo {round((m['reales'].get('tiempo_promedio_visto_s') or 0))}.")
    L += rec or ["- Sin recomendaciones automáticas todavía (faltan mediciones)."]
    L += ["", "## Limitaciones de los datos", "",
          "- La curva de retención segundo a segundo no está disponible por API; se usa la retención promedio calculada.",
          "- Visitas al perfil y seguidores nuevos solo existen a nivel de cuenta y por día: se registran como *cuenta*, nunca se asignan a un reel.",
          "- Consultas y oportunidades comerciales (mensajes) no salen de esta API: deben anotarse a mano.",
          "- La medición «control» es una prueba del sistema, no una ventana de 24/48/7 d."]
    (AN / "INFORME.md").write_text("\n".join(L) + "\n")
    print(f"informe: {(AN / 'INFORME.md').relative_to(RAIZ)}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sync"
    {"sync": lambda: sync(), "pendientes": lambda: pendientes(), "informe": lambda: informe(),
     "registrar": lambda: registrar(*sys.argv[2:6])}[cmd]()
