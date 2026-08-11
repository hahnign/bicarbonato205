# Plantillas de contenido — copiar y pegar

Guardá este archivo como referencia. No se usa en el build, es solo
para copiar el bloque que necesites.

---

## Lanzamiento (single / EP / álbum)

Archivo: `src/lanzamientos/NOMBRE-DEL-ARCHIVO.md`

```markdown
---
title: "Título del tema"
date: 2024-01-01
type: single
cover: "https://URL-DE-LA-PORTADA.jpg"
streamingUrl: "https://open.spotify.com/track/xxxx"
---

Descripción corta del tema (opcional, admite Markdown).
```

`type` puede ser: `single`, `ep`, o `album`.

---

## Video

Archivo: `src/videos/NOMBRE-DEL-ARCHIVO.md`

```markdown
---
title: "Nombre del video"
date: 2024-01-01
youtubeUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
cover: "https://i.ytimg.com/vi/XXXXXXXXXXX/maxresdefault.jpg"
---

Descripción corta del video (opcional).
```

Tip: la portada de cualquier video de YouTube siempre está en esa
misma URL, cambiando solo el ID (los 11 caracteres después de `v=`
en el link del video).

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
  sitio — usalo solo para identificarlo vos (ej: `poco-tiempo.md`).
- `date` en formato `AAAA-MM-DD`.
- Después de crear el archivo: `npm run dev` para verlo en local, y
  cuando esté bien, `git add`, `git commit`, `git push`.
