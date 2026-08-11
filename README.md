# BICARBONATO205

**El archivo vivo de Bicarbonato205.**

Sitio estático construido con [Eleventy](https://www.11ty.dev/), publicado en
GitHub Pages. Filosofía del proyecto: publicar poco, publicar bien, mantenerlo
simple.

Para el razonamiento detrás de cada decisión técnica y de diseño, ver
[`docs/DECISIONS.md`](docs/DECISIONS.md) — este README explica _cómo usar_
el proyecto; ese archivo explica _por qué_ se construyó así.

---

## Requisitos

- [Node.js](https://nodejs.org/) (versión LTS)
- Git

## Puesta en marcha

```bash
git clone https://github.com/TU-USUARIO/bicarbonato205.git
cd bicarbonato205
npm install
npm run dev
```

`npm run dev` levanta un servidor local (por defecto en `http://localhost:8080`)
con recarga automática: cualquier cambio que guardes en `src/` se refleja en
el navegador sin que tengas que recargar manualmente.

---

## Estructura del proyecto

```
bicarbonato205/
├── .eleventy.js              # Configuración de Eleventy: input/output,
│                              # passthrough copy, filtros, colecciones custom
├── .github/workflows/
│   └── deploy.yml             # Build y publicación automática en cada push a main
├── docs/
│   └── DECISIONS.md           # Registro de decisiones de arquitectura y diseño
├── package.json
└── src/                       # Todo lo que compone el sitio vive acá
    ├── _data/
    │   └── site.json          # Datos globales: nombre, streaming, redes, contacto
    ├── _includes/
    │   ├── layouts/
    │   │   ├── base.njk        # Layout maestro (head, header, footer)
    │   │   ├── release.njk     # Layout de detalle de un lanzamiento
    │   │   ├── video.njk       # Layout de detalle de un video
    │   │   ├── playlist.njk    # Layout de detalle de una playlist
    │   │   └── noticia.njk     # Layout de detalle de una noticia
    │   ├── partials/
    │   │   ├── header.njk
    │   │   ├── nav.njk
    │   │   └── footer.njk
    │   └── macros/
    │       └── card.njk        # Tarjeta de contenido reutilizable
    ├── assets/
    │   ├── css/
    │   │   ├── tokens.css      # Variables de diseño: color, tipografía, espaciado
    │   │   ├── base.css        # Reset y estilos elementales
    │   │   └── components.css  # Estilos de cada componente (nav, cards, forms...)
    │   ├── js/
    │   │   └── main.js         # Búsqueda client-side (única lógica JS del sitio)
    │   └── img/                # Favicons, íconos, imagen social por defecto
    ├── lanzamientos/           # Un archivo .md por single/EP/álbum
    ├── videos/                 # Un archivo .md por videoclip
    ├── playlists/              # Un archivo .md por playlist
    ├── noticias/               # Un archivo .md por noticia breve
    ├── index.njk               # Inicio
    ├── archivo.njk             # Archivo (todo el contenido, agrupado por año)
    ├── lanzamientos.njk        # Listado de lanzamientos
    ├── videos.njk               # Listado de videos
    ├── playlists.njk            # Listado de playlists
    ├── streaming.njk            # Accesos a plataformas
    ├── acerca.njk                # Biografía
    ├── contacto.njk               # Contacto
    ├── buscar.njk                  # Búsqueda
    ├── search-index.11ty.js         # Genera el índice JSON para la búsqueda
    ├── feed.njk                      # RSS
    ├── sitemap.njk                    # Sitemap XML
    ├── robots.njk                      # robots.txt
    └── site.webmanifest
```

---

## Cómo agregar contenido nuevo

### La forma automática (recomendada)

```bash
npm run new -- lanzamiento
npm run new -- video
npm run new -- playlist
npm run new -- noticia
```

Te va a preguntar los datos uno por uno. Para lanzamientos y videos, si
pegás un link de YouTube al principio, completa **título** y
**portada** automáticamente (sin API key, usa el servicio público de
YouTube) — vos solo completás lo que falta.

### La forma manual

Ver [`docs/PLANTILLAS.md`](docs/PLANTILLAS.md) para copiar y pegar el
front matter de cada tipo de contenido a mano.

### Un lanzamiento nuevo (detalle del formato)

Creá un archivo en `src/lanzamientos/`, por ejemplo `mi-nuevo-single.md`:

```markdown
---
title: "Nombre del tema"
date: 2026-09-01
type: single
cover: "https://tu-cdn/portada.jpg"
streamingUrl: "https://open.spotify.com/track/xxxx"
---

Descripción o nota sobre el lanzamiento (opcional, admite Markdown).
```

`git add`, `git commit`, `git push`. Eso es todo — aparece automáticamente en
Inicio, Lanzamientos y Archivo, sin tocar ningún otro archivo.

### Un video, playlist o noticia

Mismo patrón, en `src/videos/`, `src/playlists/` o `src/noticias/`
respectivamente. Los campos de cada tipo están documentados en
`docs/DECISIONS.md` (Fase 7, sección "Modelo de datos").

---

## Cómo cambiar el diseño

- **Colores, tipografía, espaciado:** editar únicamente
  `src/assets/css/tokens.css`. Ningún otro archivo CSS del proyecto debería
  necesitar cambios para un rediseño de paleta o tipografía.
- **Estilo de un componente puntual** (una tarjeta, el botón, el footer):
  `src/assets/css/components.css`.
- **Estructura HTML de una página:** el archivo `.njk` correspondiente en
  `src/`.

---

## Cómo reutilizar este proyecto como plantilla para otro sitio

1. Cloná el repositorio con otro nombre.
2. Reemplazá `src/assets/css/tokens.css` con la nueva paleta/tipografía.
3. Reemplazá `src/_data/site.json` con los datos del nuevo proyecto.
4. Reemplazá los archivos de ejemplo en `lanzamientos/`, `videos/`, etc. por
   contenido real (o dejalos vacíos si el nuevo sitio no necesita ese tipo
   de contenido — simplemente borrá la carpeta y su referencia en
   `.eleventy.js` y en la navegación).
5. Reemplazá los assets de `src/assets/img/` (favicon, íconos, imagen OG).
6. La arquitectura de Eleventy (`.eleventy.js`, layouts, macros, filtros,
   workflow de GitHub Actions) se mantiene intacta — es precisamente la
   parte de este proyecto diseñada para no tener que reescribirse.

---

## Cómo actualizar dependencias

```bash
npm outdated        # ver qué dependencias tienen versión más nueva disponible
npm update           # actualizar dentro de los rangos permitidos por package.json
npm run build         # verificar que el sitio sigue compilando después de actualizar
```

Para una actualización mayor de Eleventy (ej. de v3 a v4), revisar primero
la guía de migración oficial antes de actualizar — cambios de versión mayor
pueden romper filtros o plugins, como vimos con `eleventy-plugin-rss` en la
Fase 7.

---

## Cómo publicar

Publicar **es** hacer `git push` a `main`. El workflow en
`.github/workflows/deploy.yml` construye el sitio con Eleventy y lo publica
en GitHub Pages automáticamente. Podés seguir el progreso en la pestaña
**Actions** del repositorio en GitHub.

Para publicar sin ningún commit nuevo (por ejemplo, para forzar una
republicación), se puede disparar el workflow manualmente desde esa misma
pestaña ("Run workflow").

---

## Checklist antes de dar un lanzamiento por publicado

- [ ] El archivo Markdown tiene `title`, `date` y los campos obligatorios de su tipo.
- [ ] La imagen de portada (`cover`) carga correctamente desde el CDN externo.
- [ ] El link de streaming/YouTube/plataforma funciona.
- [ ] `npm run build` corre sin errores en local antes de hacer push.
- [ ] Después del push, la Action en GitHub terminó en verde (no en rojo).
- [ ] El sitio publicado muestra el contenido nuevo (puede tardar 1-2 minutos en propagarse).

## Checklist de mantenimiento periódico (sugerido: cada 3-6 meses)

- [ ] `npm outdated` — revisar dependencias desactualizadas.
- [ ] Revisar que los links de `_data/site.json` (streaming, redes) sigan vigentes.
- [ ] Verificar `/sitemap.xml` y `/feed.xml` en el sitio publicado.
- [ ] Revisar Lighthouse (Chrome DevTools) para confirmar performance/accesibilidad.

---

## Licencia

Definir según corresponda — el proyecto no incluye una licencia por defecto.
