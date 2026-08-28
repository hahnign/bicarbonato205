# Plantillas de contenido — copiar y pegar

Guardá este archivo como referencia. No se usa en el build, es solo
para copiar el bloque que necesites.

---

## Tema (single / EP / álbum — con o sin video)

Archivo: `src/temas/NOMBRE-DEL-ARCHIVO.md`

```markdown
---
title: "Título del tema"
date: 2024-01-01
type: single
cover: "https://URL-DE-LA-PORTADA.jpg"
streamingUrl: "https://open.spotify.com/track/xxxx"
links:
  - "https://www.youtube.com/watch?v=xxxx"
  - "https://link.deezer.com/s/xxxx"
  - "https://music.apple.com/ar/artist/xxxx"
---

Descripción corta del tema (opcional, admite Markdown).
```

`type` puede ser: `single`, `ep`, o `album`.

`links` es opcional — una lista con tantas plataformas adicionales
como quieras (YouTube, Deezer, Apple Music, SoundCloud, Bandcamp).
Cada una se muestra como su propia pill, con el nombre detectado
automáticamente según la URL. Si el tema tiene video, el link de
YouTube va acá adentro, no en un archivo separado — no hay un tipo de
contenido "Video" propio, un tema con video es solo un tema con un
link de YouTube más en `links`.

Tip: la portada de cualquier video de YouTube siempre está en
`https://i.ytimg.com/vi/ID-DEL-VIDEO/maxresdefault.jpg`, cambiando
solo el ID (los 11 caracteres después de `v=` en el link del video).

---

## Playlist

Archivo: `src/playlists/NOMBRE-DEL-ARCHIVO.md`

```markdown
---
title: "Nombre de la playlist"
date: 2024-01-01
platform: "Spotify"
url: "https://open.spotify.com/playlist/xxxx"
---

Descripción corta (opcional).
```

---

## Noticia breve

Archivo: `src/noticias/NOMBRE-DEL-ARCHIVO.md`

```markdown
---
title: "Título de la noticia"
date: 2024-01-01
---

Texto de la noticia.
```

---

## Reglas generales

- El nombre del archivo (`NOMBRE-DEL-ARCHIVO.md`) no importa para el
  sitio — usalo solo para identificarlo vos (ej: `poco-tiempo.md`,
  dentro de `src/temas/`).
- `date` en formato `AAAA-MM-DD`.
- Después de crear el archivo: `npm run dev` para verlo en local, y
  cuando esté bien, `git add`, `git commit`, `git push`.

---

## Íconos de plataformas de streaming (Spotify, Apple Music, etc.)

Si conseguís los badges oficiales de cada plataforma (Spotify y Apple
Music tienen generadores oficiales — ver `docs/DECISIONS.md` para los
links), subilos a `src/assets/img/platforms/` con este nombre exacto:

| Plataforma  | Nombre de archivo            |
| ----------- | ---------------------------- |
| Spotify     | `spotify.svg` (o `.png`)     |
| Apple Music | `apple-music.svg` (o `.png`) |
| YouTube     | `youtube.svg` (o `.png`)     |
| Deezer      | `deezer.svg` (o `.png`)      |
| SoundCloud  | `soundcloud.svg` (o `.png`)  |
| Bandcamp    | `bandcamp.svg` (o `.png`)    |

No hace falta tocar ningún template — apenas el archivo con ese
nombre exacto exista, el ícono aparece solo (en la Fase de Streaming
y en las pills de las tarjetas) la próxima vez que corras
`npm run build`.

---

## Escribir texto largo en `_data/site.json`

A diferencia de los archivos `.md` de `src/temas/`, `_data/site.json`
es JSON puro — **no admite saltos de línea reales dentro de un
string**, tenés que escribirlos como `\n` (barra invertida + n). Para
un párrafo nuevo (con espacio visible entre medio), usá `\n\n`.

```json
"bio": "Primer párrafo.\n\nSegundo párrafo, separado por un espacio."
```

Si pegás texto con saltos de línea reales (copiado de un documento,
por ejemplo) vas a tener un error de sintaxis — reemplazá cada salto
de línea por `\n` a mano, o pedime que lo haga por vos.
