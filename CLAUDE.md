# Reels educativos de anuncios — @almonte.suarez

Este repositorio produce y publica reels animados en Instagram, narrados con la voz clonada del dueño de la cuenta.
Idioma de trabajo con el usuario: español.

## Archivos
- `GUIA-MARCA.md` — estilo, tono, fórmula de cada reel.
- `LISTADO-VIDEOS.md` — banco de 40 temas, cada uno con su palabra clave.
- `publicados.json` — registro de reels publicados (número, palabra clave, media_id, enlace, fecha). Se actualiza en cada publicación.
- `guiones/reel-NN.txt` — guion narrado, 7 líneas exactas (gancho, idea, cuenta regresiva, tip 1, tip 2, secreto, llamado a la acción).
- `reels/reel-NN.json` — textos en pantalla (mismas claves que `reels/reel-01.json`); `scenes` lo calcula el script.
- `videos/reel-NN.mp4` — video final. Instagram lo descarga desde
  `https://raw.githubusercontent.com/jorgecor2121-stack/reels-anuncios/main/videos/reel-NN.mp4`
- `src/Composition.tsx` — plantilla Remotion (1080x1920, 30 fps).
- `scripts/hacer_reel.sh NN` — voz + video + mezcla en un paso.

## Voz
- ElevenLabs, voz "J" (`scripts/elevenlabs-voice.json`), modelo `eleven_v4`, stability 0.5, similarity 0.5.
  Son los ajustes que el usuario eligió en la web; no cambiarlos sin pedirlo.
- La clave la inyecta el proxy del entorno (host `api.elevenlabs.io`); en el código va el marcador `proxy-injected`.
- Plan Starter: ~39k créditos/mes, ~450 por reel.

## Producir un reel
1. Tomar el siguiente tema de `LISTADO-VIDEOS.md` que no esté en `publicados.json`.
2. Escribir `guiones/reel-NN.txt` (7 líneas, habladas, naturales) y `reels/reel-NN.json`.
   El secreto NO se revela en el video: se dice que existe y se pide comentar la palabra clave.
3. `scripts/hacer_reel.sh NN` (Chromium: `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`).
4. Verificar que el audio llega completo hasta el final (por ejemplo, transcribiendo con whisper).
5. Commit y push del guion, props y video a `main`.

## Publicar en Instagram (Composio, toolkit `instagram`, cuenta almonte.suarez)
1. `INSTAGRAM_POST_IG_USER_MEDIA` con `ig_user_id: "me"`, `media_type: "REELS"`, `video_url` (enlace raw de arriba), `caption`, `share_to_feed: true`.
2. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` con `creation_id`, `max_wait_seconds: 180`.
3. Anotar en `publicados.json` y hacer push.

Caption: primera línea = gancho; 2–3 líneas de valor sin revelar el secreto; "👉 Comenta PALABRA y te lo envío por mensaje"; 5–10 hashtags de `GUIA-MARCA.md`.

## Responder comentarios con mensaje privado
Para cada reel de `publicados.json` de los últimos 7 días:
1. Leer comentarios (`INSTAGRAM_GET_IG_MEDIA_COMMENTS`).
2. Si el texto contiene la palabra clave (sin distinguir mayúsculas, tolerando errores leves) y el comentario no está en `respondidos.json`:
   - Mensaje privado: `POST /me/messages` con `{"recipient":{"comment_id":ID},"message":{"text":...}}` (Private Replies; 1 por comentario, dentro de 7 días).
   - Respuesta pública al comentario: "¡Te lo envié por mensaje! 📩" (`INSTAGRAM_POST_IG_COMMENT_REPLIES`).
   - Guardar el ID en `respondidos.json` y hacer push.
3. Nunca enviar dos veces al mismo comentario.
