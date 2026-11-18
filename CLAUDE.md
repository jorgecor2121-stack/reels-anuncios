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
4. Crear la guía PDF del tema (ver "Guías PDF").
5. Verificar que el audio llega completo hasta el final (por ejemplo, transcribiendo con whisper).
6. Commit y push del guion, props y video a `main`.

## Publicar en Instagram (Composio, toolkit `instagram`, cuenta almonte.suarez)
1. `INSTAGRAM_POST_IG_USER_MEDIA` con `ig_user_id: "me"`, `media_type: "REELS"`, `video_url` (enlace raw de arriba), `caption`, `share_to_feed: true`.
2. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` con `creation_id`, `max_wait_seconds: 180`.
3. Anotar en `publicados.json` y hacer push.

Caption: primera línea = gancho; 2–3 líneas de valor sin revelar el secreto; "👉 Comenta PALABRA y te lo envío por mensaje"; 5–10 hashtags de `GUIA-MARCA.md`.

## Responder comentarios (estilo botones, como pidió el usuario)
**DESACTIVADO desde el 18-nov-2026:** los comentarios y mensajes los responde ManyChat. No revisar ni responder comentarios o mensajes desde aquí
(el usuario no quiere gastar uso de Claude en eso). Lo de abajo queda solo como referencia.

**Permiso permanente del usuario:** responder siempre de forma automática (comentarios, mensajes y guías) sin pedir confirmación.
Nota (18-nov-2026): la tarjeta del paso 2 falló con error 10/2534022 ("outside of allowed window") aunque la persona había escrito
hacía 3 min. Se activaron las suscripciones de eventos (`INSTAGRAM_ENABLE_WEBHOOK_SUBSCRIPTIONS`: messages, comments, messaging_postbacks).
Si vuelve a fallar con ese error con un mensaje recibido DESPUÉS de esa fecha, no reintentar: marcar `"error": "ventana"` en
`respondidos.json` y avisar al usuario en el resumen.
Todas las llamadas de mensajes van por `COMPOSIO_PROXY_EXECUTE` (toolkit `instagram`), `POST https://graph.instagram.com/v21.0/me/messages`.

### Paso 1 — Alguien comenta la palabra clave
Para cada reel de `publicados.json` de los últimos 7 días, leer comentarios (`INSTAGRAM_GET_IG_MEDIA_COMMENTS`).
Si contiene la palabra clave (sin distinguir mayúsculas, tolerando errores leves) y el comentario no está en `respondidos.json`:
- Mensaje privado con botón de respuesta rápida:
```json
{"recipient":{"comment_id":"ID_COMENTARIO"},
 "message":{"text":"👋 ¡Hola! Gracias por comentar PALABRA. Ya tengo lista la guía que te prometí en el video. Toca el botón de abajo para recibirla 👇",
            "quick_replies":[{"content_type":"text","title":"📩 Quiero la guía ✨","payload":"GUIA_PALABRA"}]}}
```
- Respuesta pública al comentario: "¡Te lo envié por mensaje! 📩" (`INSTAGRAM_POST_IG_COMMENT_REPLIES`).
- Guardar en `respondidos.json`: comment_id, usuario, usuario_id (= `from.id` del comentario), reel, palabra, fechas, `"guia_enviada": false`.
- Nunca enviar dos veces al mismo comentario (Instagram solo permite 1 respuesta privada por comentario, dentro de 7 días).

### Paso 2 — La persona toca el botón (o responde cualquier cosa)
Para cada entrada con `guia_enviada: false`: buscar su conversación (`INSTAGRAM_LIST_ALL_CONVERSATIONS` con `user_id` = usuario_id)
y ver si escribió después de nuestro mensaje (`INSTAGRAM_LIST_ALL_MESSAGES`). Si escribió hace menos de 24 h, enviar la tarjeta:
```json
{"recipient":{"id":"USUARIO_ID"},
 "message":{"attachment":{"type":"template","payload":{"template_type":"generic","elements":[{
   "title":"📥 Aquí tienes tu guía: TÍTULO DE LA GUÍA",
   "subtitle":"Toca el botón para verla completa 👇",
   "image_url":"https://raw.githubusercontent.com/jorgecor2121-stack/reels-anuncios/main/guias/portada-TEMA.png",
   "buttons":[{"type":"web_url","url":"ENLACE_GUIA","title":"Ver la guía 🔗"}]}]}}}}
```
ENLACE_GUIA: `https://raw.githubusercontent.com/jorgecor2121-stack/reels-anuncios/main/guias/guia-TEMA.pdf`.
Si la tarjeta falla, enviar texto + enlace. Marcar `guia_enviada: true` y hacer push.

### Paso 3 — Si vuelve a escribir después de la guía
No responder automáticamente: avisar al usuario en el resumen ("@usuario escribió: …") para que lo atienda él.

## Guías PDF
Cada reel tiene su guía: `guias/src/TEMA.html` → `node scripts/hacer_guia.js TEMA` → `guias/guia-TEMA.pdf`,
y su portada para la tarjeta del mensaje: `node scripts/portada_guia.js TEMA` → `guias/portada-TEMA.png`
(usar `NODE_PATH=$(npm root -g)` para encontrar playwright). Copiar el diseño de `guias/src/gancho.html`: 7 páginas
1080x1350 — portada, lo básico, los errores (incluido el secreto del reel), plantillas, ejemplos antes/después, checklist, "tu turno".
Al producir un reel nuevo, crear también su guía y anotarla en `publicados.json` (campo `guia`).
