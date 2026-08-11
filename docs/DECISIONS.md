# BICARBONATO205 — Registro de decisiones (Spec vivo)

Este documento registra **qué se decidió y por qué**, en el orden en que se tomaron
las decisiones a lo largo del proyecto. No reemplaza al README (Fase 9), que va a
explicar _cómo usar_ el proyecto terminado. Este archivo explica _cómo se llegó_
a cada elección, para poder repetir el proceso en otro proyecto o retomarlo
después de tiempo sin memoria del razonamiento.

Formato por entrada: **Decisión → Por qué → Alternativas descartadas**.

---

## FASE 1 — Planificación y arquitectura

**D1. Sitio estático generado con Eleventy, sin backend ni base de datos.**

- Por qué: se alinea con la filosofía "publicar poco, publicar bien" — cero
  mantenimiento de servidor, cero parches de seguridad recurrentes.
- Alternativas descartadas: WordPress u otro CMS dinámico (más mantenimiento,
  innecesario para el volumen de contenido previsto).

**D2. Arquitectura de contenido: "Archivo" como colección maestra, con
"Lanzamientos" y "Videos" como vistas filtradas de la misma colección.**

- Por qué: evita duplicar contenido en tres sistemas distintos; agregar un
  Markdown nuevo alcanza para que aparezca en todos los listados relevantes.
- Alternativas descartadas: tres colecciones independientes (más simple de
  entender al principio, pero genera duplicación y desincronización).

**D3. Streaming como enlace siempre visible en el menú principal.**

- Por qué: es la acción de mayor valor de conversión del sitio (escuchar
  música), se prioriza jerárquicamente sobre el resto.

---

## FASE 2 — Preparación del entorno

**D4. Eleventy instalado como dependencia local del proyecto (`--save-dev`),
no global.**

- Por qué: evita conflictos de versión entre distintos proyectos en la misma
  computadora; práctica estándar del ecosistema Node moderno.
- Alternativas descartadas: instalación global (`npm install -g`) — más simple
  al inicio, pero genera fragilidad a largo plazo entre proyectos.

---

## FASE 3 — Git y GitHub

**D5. Rama principal `main`, GitHub Pages configurado con fuente "GitHub
Actions" (no "Deploy from a branch").**

- Por qué: el sitio requiere un paso de build (Eleventy transformando Markdown
  a HTML) antes de publicarse; "Deploy from a branch" solo sirve para HTML ya
  generado y subido directamente al repo.
- Nota: el workflow de Actions concreto se implementa recién cuando hay
  contenido real de Eleventy que construir (Fase 5+).

**D6. `.gitignore` creado _antes_ del primer `git add`.**

- Por qué: evita que `node_modules/` quede commiteada por error, lo cual
  requeriría remoción retroactiva del historial (`git rm -r --cached`).

---

## FASE 4 — Diseño del sistema visual

**D7. El mockup aprobado se usa como fuente del sistema visual (color,
tipografía, espaciado, componentes), pero NO de la taxonomía de contenido.**

- Por qué: el mockup está resuelto sobre un sitio de entretenimiento genérico
  (cine/series/juegos), que contradice la taxonomía musical definida en D2.
  Separar "cómo se ve" de "qué contiene" es el mismo principio de
  arquitectura ya aplicado en Fase 1.
- Alternativas descartadas: replicar literalmente las categorías del mockup
  (más rápido, pero traiciona la definición de contenido ya acordada).

**D8. Paleta de color de 7 tokens base + 4 tokens de categoría, con el verde
lima (`#D4FF3D`) reservado como único acento de marca (CTAs, estados
interactivos) — los colores de categoría son solo etiquetas informativas.**

- Por qué: mantener un solo acento de marca evita que el lima pierda peso
  visual por sobreuso; los colores de categoría ayudan a escanear contenido
  mixto sin competir por ese rol.

**D9. Sistema tipográfico de tres roles: Archivo Black (display), IBM Plex
Mono (nav/labels/metadatos), Inter (cuerpo de texto).**

- Por qué: una sola fuente no puede ser simultáneamente efectiva en títulos
  gigantes y en párrafos largos; la fuente mono es, además, la firma
  tipográfica que distingue el diseño de un sitio editorial genérico.
- Trade-off aceptado: mayor peso de carga por tres familias tipográficas
  (se mitiga en Fase 8 con subsetting y `font-display: swap`).

**D10. `border-radius: 0` y sin `box-shadow` en todo el sistema.**

- Por qué: es la decisión visual central del carácter "brutalista" pedido
  desde el brief original; la jerarquía se resuelve con líneas finas y
  contraste de superficie, no con sombras.

**D11. `tokens.css` como archivo único y fuente de verdad de todas las
variables visuales; ningún otro archivo CSS del proyecto usa valores hex/px
sueltos.**

- Por qué: es la pieza más portable de la plantilla maestra — para un
  proyecto nuevo, este es prácticamente el único archivo que se reescribe
  por completo, mientras el resto del sistema consume estas variables por
  nombre sin modificarse.

---

## FASE 5 — Arquitectura Eleventy

**D12. `src/` como raíz dedicada de contenido, separada de la raíz del
proyecto (que contiene tooling: `package.json`, `.git/`, `docs/`).**

- Por qué: evita que Eleventy tenga que excluir manualmente archivos de
  configuración; la regla queda simple ("todo dentro de `src/` es el
  sitio") en vez de una lista creciente de excepciones.

**D13. Nunjucks (`.njk`) como motor de plantillas, en vez de Liquid
(default histórico de Eleventy).**

- Por qué: soporta herencia de plantillas y macros — necesarios para
  reutilizar componentes de tarjeta sin duplicar HTML (Fase 6).
- Alternativas descartadas: Liquid (más simple, pero sin macros).
- Error real cometido y corregido en esta fase: usar sintaxis de filtro
  de Liquid (`| date: "%Y"`) dentro de un archivo `.njk` — Nunjucks no
  tiene ese filtro. Se resolvió con un shortcode custom (`currentYear`)
  en `.eleventy.js`.

**D14. Collections por tag + Directory Data Files, en vez de registrar
colecciones manualmente en `.eleventy.js`.**

- Por qué: es el mecanismo que permite cumplir el requisito de la Fase 1
  ("agregar un lanzamiento nuevo requiere solo crear un Markdown") — el
  archivo `lanzamientos.json` dentro de `src/lanzamientos/` aplica
  `tags: lanzamiento` y el layout a todo archivo de esa carpeta
  automáticamente.
- Verificado con build real: `npx eleventy` generó `collections.lanzamiento`
  con el archivo de ejemplo sin registro manual adicional.

**D15. Passthrough copy explícito para `assets/css` y `assets/js`.**

- Por qué: Eleventy ignora por defecto archivos que no reconoce como
  plantilla; sin esto, el CSS/JS nunca llegaría a `_site/`.

---

## FASE 6 — Desarrollo del sitio

**D16. Navegación principal con 7 ítems, no 9. Contacto y Newsletter no
están en el nav.**

- Por qué: el brief pide explícitamente "menú extremadamente simple";
  Contacto va al footer (patrón estándar para info de baja frecuencia de
  uso) y Newsletter se resuelve como sección de footer, no como página,
  siguiendo el propio mockup aprobado.
- Alternativas descartadas: los 9 ítems originales del sitemap en el nav
  (contradice la simplicidad pedida en el propio brief).

**D17. Colección custom `archivo` (vía `addCollection` en `.eleventy.js`)
que combina lanzamiento + video + playlist ordenados por fecha.**

- Por qué: ninguna colección automática por tag combina múltiples tags en
  una sola línea de tiempo; se necesita lógica explícita.
- Verificado con build real: la página `/archivo/` muestra los 3 tipos de
  contenido de ejemplo intercalados correctamente.

**D18. Macro de Nunjucks (`macros/card.njk`) para la tarjeta de
contenido, reutilizada en Inicio, Archivo, Lanzamientos, Videos y
Playlists.**

- Por qué: es el componente que más se repite en el sitio; una macro con
  parámetros evita duplicar el mismo bloque de HTML cinco veces.

**D19. `components.css` separado de `base.css`.**

- Por qué: `base.css` mantiene el reset y estilos elementales; los estilos
  de cada componente (nav, cards, badges, botones, forms, footer) crecen
  con cada fase nueva y necesitan su propio archivo para no volver
  inmanejable `base.css`.

**D20. Colecciones mínimas de `video` y `playlist` creadas ya en esta
fase (con un archivo de ejemplo cada una), aunque el sistema completo de
contenido se define recién en la Fase 7.**

- Por qué: sin datos reales las páginas de Videos y Playlists no podían
  verificarse visualmente; se prioriza tener el shell funcionando de
  punta a punta sobre completar el modelo de datos antes de tiempo.

---

## FASE 7 — Contenido

**D21. Modelo de datos fijo por tipo de contenido (tabla en el chat de
la Fase 7), incluyendo un cuarto tipo nuevo: Noticia.**

- Por qué: evita `{% if %}` defensivos en las plantillas por campos que
  a veces existen y a veces no.

**D22. Layouts de detalle propios por tipo (`release.njk`, `video.njk`,
`playlist.njk`, `noticia.njk`), en vez de renderizar el Markdown crudo
sobre `layouts/base.njk` directamente (como quedó, de forma temporal,
en la Fase 5).**

- Por qué: layout chaining de Eleventy — cada layout de detalle tiene su
  propio `layout: layouts/base.njk` en el front matter, así se anida
  dentro del layout general sin duplicar `<html>/<head>`.

**D23. Cinco filtros custom (`limit`, `excerpt`, `siblingItem`,
`relatedItems`, `groupByYear`) en vez de resolver esa lógica dentro de
las plantillas Nunjucks.**

- Por qué: Nunjucks no tiene forma nativa de buscar el índice de un
  ítem en un array o de agrupar por año; hacerlo en la plantilla la
  volvería ilegible. La lógica de datos vive en `.eleventy.js`, la
  plantilla solo la consume.

\*\*D24. Búsqueda client-side vía JSON estático (`search-index.11ty.js`)

- JS vainilla, sin librería de búsqueda ni servicio externo.\*\*

* Por qué: el volumen de contenido esperado (pocas decenas de items) no
  justifica una librería de indexado; un `fetch` + `filter` por substring
  alcanza y no agrega peso ni dependencias.
* Alternativa descartada: Algolia/Lunr.js — sobre-ingeniería para este
  volumen de contenido.

**D25. RSS con el plugin oficial `@11ty/eleventy-plugin-rss`, no XML
escrito a mano.**

- Por qué: RSS exige formato de fecha RFC-822 y URLs absolutas; el
  plugin ya lo resuelve correctamente. Nota técnica real: la v3 del
  plugin cambió su forma de exportar (named exports en vez de default)
  y renombró `rssLastUpdatedDate` → `getNewestCollectionItemDate |
dateToRfc822` — ambos errores aparecieron y se corrigieron durante
  la verificación con build real en esta fase.

---

## FASE 8 — Optimización

**D26. SEO completo (canonical, Open Graph, Twitter Card, JSON-LD
`MusicGroup`) agregado a `layouts/base.njk`, con `cover` de cada
contenido como imagen social y `og-default.jpg` como fallback.**

- Por qué: sin esto, compartir un link del sitio en redes/WhatsApp
  muestra una tarjeta pelada — crítico para un proyecto que depende de
  que la música se comparta.

**D27. `robots.txt` y `sitemap.xml` generados como templates Eleventy
(`.njk` con permalink custom), no como archivos estáticos sueltos.**

- Por qué: el sitemap necesita iterar `collections.archivo` dinámicamente;
  generarlo a mano quedaría desactualizado en cada lanzamiento nuevo.

**D28. Carga de Google Fonts vía `<link>` con `preconnect` +
`font-display: swap`, en vez de self-hosting.**

- Por qué: implementación más simple; el trade-off (dependencia de un
  servicio externo) se documenta explícitamente para revisarlo si el
  proyecto migra a self-hosting de fuentes en el futuro por performance
  o privacidad.
- **Gap real detectado y corregido en esta fase:** las variables
  `--font-*` existían desde la Fase 4 pero nunca se habían cargado —
  el sitio no se veía con la tipografía del sistema hasta ahora.

**D29. `loading="lazy"` solo en imágenes de grilla (tarjetas), NO en la
imagen de portada de páginas de detalle.**

- Por qué: la portada de detalle está arriba del pliegue — lazy-load ahí
  perjudica el LCP (Largest Contentful Paint) en vez de ayudar. Es un
  error real que cometí y corregí durante esta fase: apliqué lazy a
  todas las imágenes por defecto, sin distinguir su posición en la
  página.

**D30. `srcset`/imágenes responsive NO implementado — queda como punto
abierto documentado, no resuelto con una suposición.**

- Por qué: depende de qué CDN externo se use para alojar imágenes
  (definido como pendiente desde la Fase 1); implementarlo ahora
  hubiera significado inventar una convención de URL que puede no
  coincidir con el CDN real que elijas.

**D31. Skip-link + `aria-current="page"` agregados a header/nav.**

- Por qué: patrón de accesibilidad estándar para navegación por teclado
  y lectores de pantalla, ausente hasta esta fase.

---

## FASE 9 — Documentación

**D32. Workflow de GitHub Actions completado (pendiente desde la
Fase 3), usando `npm ci` + `npx eleventy` + `actions/deploy-pages`.**

- Por qué: `npm ci` en vez de `npm install` en CI — instala exactamente
  `package-lock.json`, sin riesgo de que un build automático actualice
  una dependencia sin que nadie lo revise.

**D33. `README.md` separado de `DECISIONS.md`, con roles explícitamente
distintos: README = cómo usar; DECISIONS.md = por qué se construyó así.**

- Por qué: mezclar ambos en un solo documento obliga a elegir entre un
  README inflado de justificaciones técnicas (malo para alguien que solo
  quiere agregar un lanzamiento) o un spec pobre en contexto (malo para
  reutilizar la metodología en otro proyecto).

**D34. Scripts npm (`dev`, `build`, `clean`) agregados a `package.json`.**

- Por qué: convención estándar que cualquier desarrollador espera
  encontrar; documentados en el README para que el flujo de trabajo diario
  no dependa de recordar `npx eleventy` de memoria.

---

## FASE 9 (adenda) — Bug real de deploy encontrado post-cierre

**D35. Bug: el primer deploy falló porque GitHub Pages corrió Jekyll
automáticamente sobre el código fuente, en vez de usar `deploy.yml`.**

- Síntoma: el job "build" del workflow pasaba en verde, pero el deploy
  fallaba con `Error: Liquid syntax error ... Unknown tag 'from'` —
  Jekyll (motor de Pages por defecto) intentando parsear
  `{% from "macros/card.njk" import card %}` (sintaxis Nunjucks) como
  si fuera Liquid.
- Causa raíz: **Settings → Pages → Source** seguía en `Deploy from a
branch` en vez de `GitHub Actions`. Con esa fuente, Pages ignora el
  workflow custom y procesa la rama directamente con su pipeline Jekyll
  automático.
- Fix: cambiar Source a `GitHub Actions` en la configuración del repo
  (no requiere cambio de código).
- **D36. Se agregó `src/.nojekyll`** (passthrough copy a la raíz de
  `_site/`) como capa de seguridad adicional, independiente del fix de
  Source — evita que este mismo problema reaparezca si la configuración
  de Pages se resetea por error en el futuro.

**D37. Bug: el sitio publicado se veía sin estilos — CSS/JS/nav
devolvían 404.**

- Causa raíz: GitHub Pages de _proyecto_ (repo `hahnign/bicarbonato205`)
  sirve el sitio bajo `https://hahnign.github.io/bicarbonato205/`, no en
  la raíz del dominio. Todos los `href`/`src` del proyecto eran rutas
  absolutas (`/assets/css/tokens.css`), que el navegador resuelve contra
  la raíz del dominio, no contra el subpath del repo.
- Fix: `pathPrefix: "/bicarbonato205/"` en `.eleventy.js`. Eleventy v3
  reescribe automáticamente (vía su HTML transform interno) todo
  `href`/`src` que empiece con `/` en las páginas HTML generadas — no
  hizo falta tocar cada plantilla a mano para nav, CSS, JS, favicon o
  manifest.
- **Gap real no cubierto por el fix automático:** el HTML transform de
  Eleventy solo reescribe archivos `.html`. `search-index.json`,
  `feed.xml` y `sitemap.xml` (JSON/XML) no se tocan — sus URLs
  quedaron rotas y se corrigieron a mano.
- **Segundo bug encontrado al corregir el primero:** usar
  `item.url | absoluteUrl(site.url)` con `site.url` ya corregido a
  `https://hahnign.github.io/bicarbonato205` seguía dando URLs sin el
  subpath. Causa: `absoluteUrl` usa `new URL(path, base)` de JS — un
  `path` que empieza con `/` se resuelve contra el **origen** del
  dominio, descartando cualquier subcarpeta de `base`. Se reemplazó por
  concatenación directa (`{{ site.url }}{{ item.url }}`) en
  `feed.njk`, `sitemap.njk` y el `<head>` de `base.njk` (canonical,
  Open Graph, Twitter Card).
- `site.url` en `_data/site.json` corregido de
  `https://bicarbonato205.github.io` (suposición de la Fase 5, sin
  conocer el usuario real) a `https://hahnign.github.io/bicarbonato205`
  (valor real, confirmado en los logs de un deploy fallido).

## POST-LANZAMIENTO — Rediseño de identidad visual (reemplaza D7-D11)

**D38. Se reemplazó completamente la paleta/forma de la Fase 4 (oscuro,
lima, sin bordes redondeados, sin sombras) por la identidad real de
marca (claro, rojo, bordes redondeados, sombras suaves).**

- Causa: el mockup de la Fase 4 nunca fue contrastado contra el
  Linktree oficial del proyecto (`linktr.ee/bicarbonato205`) ni contra
  el logo real. Al revisar ambos, la identidad real es: fondo
  blanco/crema, rojo (`#B50000`, extraído por muestreo de píxeles del
  Linktree) como único acento, íconos e inputs circulares, tarjetas con
  sombra suave — contradice varios ejes de la Fase 4 a la vez (claro vs
  oscuro, redondeado vs anguloso, con sombra vs sin sombra).
- Alternativas planteadas y descartadas: mantener lima con fondo oscuro
  (ignoraría la marca real); mezclar ambas identidades (se descartó por
  ambigüedad, mejor una identidad consistente).
- Se reescribieron `tokens.css` y `components.css` completos;
  `base.css` se limpió de reglas de header/footer duplicadas que había
  quedado obsoletas desde la Fase 6.
- Pendiente explícito, no resuelto por mí: favicon todavía con el
  placeholder lima de la Fase 8 (ya no combina); tipografía de display
  no ajustada a la identidad real (Archivo Black se mantuvo); íconos
  sociales circulares (`.social-icon`, ya definidos en CSS) no
  conectados todavía al footer real.

**D39. Bug: el sitio no entraba en pantallas mobile reales (Galaxy A32,
iPhone) — scroll horizontal, layout roto.**

- Causa raíz: `.page-hero__title` usaba `--text-2xl: 4rem` (64px) fijo.
  La palabra "Bicarbonato205." dentro del tagline, a ese tamaño, mide
  ~500px+ — más ancha que un viewport mobile real (~360-390px) — y al
  ser una sola palabra sin espacios, el navegador no puede partirla
  para bajar de línea. Esto fuerza el ancho de toda la página y genera
  scroll horizontal.
- Por qué no se detectó antes: redimensionar una ventana de escritorio
  no siempre reproduce este comportamiento igual que un navegador
  mobile real con una palabra larga sin espacios — es el tipo de bug
  que aparece recién probando en el dispositivo real.
- Fix: `--text-lg`, `--text-xl` y `--text-2xl` pasaron de valores fijos
  en `rem` a `clamp(mínimo, preferido-en-vw, máximo)` — tipografía
  fluida que se adapta al ancho real de pantalla en vez de un tamaño
  único para todos los dispositivos.
- Red de seguridad agregada en `base.css`, independiente del fix
  puntual: `overflow-wrap: break-word` en títulos/párrafos +
  `overflow-x: hidden` en `html`/`body` — evita que este mismo problema
  reaparezca con cualquier palabra larga futura (nombre de tema, URL,
  hashtag) sin depender de anticipar cada caso.
- Verificado matemáticamente (no visualmente, por limitación del
  sandbox sin soporte gráfico): en un viewport de 360px, el título pasa
  de 64px fijos a ~36px reales vía `clamp()`, y la palabra más larga
  entra dentro del espacio disponible con margen.

## POST-LANZAMIENTO — Datos reales, favicon e íconos sociales

**D40. `_data/site.json` cargado con los datos reales del proyecto**
(Spotify, YouTube, Apple Music, Deezer, SoundCloud, Instagram, Facebook,
email de contacto). Se sacaron `bandcamp` y `twitter` (no provistos) en
vez de dejarlos con placeholder `REEMPLAZAR` — consistente con el
principio de mantenimiento mínimo: mejor un dato ausente que uno roto.

**D41. Favicon, apple-touch-icon, íconos de manifest y `og-default.jpg`
regenerados a partir del logo real** (subido por el usuario), reemplazando
los placeholders lima de la Fase 8. `theme-color` corregido a rojo
(`#B50000`) en `base.njk` y `site.webmanifest` (había quedado en negro
tras el rediseño de paleta).

- Limitación reconocida explícitamente: el favicon de 32px es poco
  legible porque el logo es un wordmark completo, no un ícono
  compacto — se mantiene así porque el usuario pidió usar ese archivo
  puntualmente, no se resolvió con un diseño alternativo inventado.

**D42. Íconos sociales del footer: monograma en círculo rojo (inicial
de la plataforma), no el logo oficial de cada marca.**

- Por qué: reproducir logos de marca de memoria en SVG es poco
  confiable y además son marcas registradas de terceros; el monograma
  mantiene el lenguaje visual circular del Linktree real sin ese riesgo.
- Alternativa disponible si se quiere más adelante: sumar una librería
  de íconos (ej. Simple Icons) para íconos de marca oficiales — no
  implementado ahora porque agrega una dependencia nueva sin que se
  haya pedido explícitamente.
- Implementado como macro reutilizable (`macros/icon.njk`), consumida
  genéricamente desde `site.streaming` y `site.social` — agregar una
  plataforma nueva a `site.json` alcanza para que aparezca en el
  footer, sin tocar el template.

Las 9 fases están completas y verificadas con builds reales en cada paso
(incluyendo errores genuinos que aparecieron y se corrigieron en el
camino: sintaxis Liquid en Nunjucks, exports de plugin RSS v3, filtros
RSS renombrados, lazy-loading aplicado incorrectamente a una imagen LCP).

Pendientes que quedan explícitamente para vos, no resueltos por
suposición (ver también el cierre de la Fase 8): completar los datos
reales en `_data/site.json`, reemplazar los assets de imagen
placeholder, conectar el newsletter a un proveedor real, y decidir la
estrategia de imágenes responsive según el CDN que elijas.

- `srcset`/imágenes responsive: depende del CDN de imágenes a elegir.
- Reemplazar `og-default.jpg`, favicon e íconos por diseño final de marca.
- Conectar el formulario de newsletter a un proveedor real (Buttondown, Mailchimp, etc.).
- Completar los valores `REEMPLAZAR` en `_data/site.json` (links reales de streaming y redes).
- Fase 7: modelo de datos de contenido (front matter de Markdown, colecciones, filtros).
- Fase 8: decisiones de SEO, performance y accesibilidad.

## POST-LANZAMIENTO — Ajuste de feedback: footer e íconos vueltos atrás

**D43. Revertido D42 (íconos circulares en el footer) a pedido explícito
del usuario — vuelta a la lista de texto plano (versión pre-D42).**

- Por qué: preferencia directa del usuario, sin ambigüedad — "no me
  gustaron los logos de streaming". Se eliminó también `macros/icon.njk`
  y el CSS de `.social-icon`/`.social-icon-row` por completo (no
  ocultado con CSS, sino removido del código) para no dejar código
  muerto en el proyecto.

**D44. Favicon simplificado a un monograma limpio: "B" blanca centrada
sobre el rojo de marca (`#B50000`), reemplazando el intento anterior de
usar el wordmark completo reducido (D41), que el usuario consideró poco
legible/prolijo.**

- Resuelve además la limitación que yo mismo había señalado en D41
  (favicon de 32px ilegible por ser un wordmark completo) — en este
  caso la corrección de diseño y el pedido del usuario coincidieron.

---

## PROYECTO CERRADO

Ver historial completo de decisiones arriba (D1-D44). El proyecto sigue
activo en mantenimiento — este documento continúa registrando cambios
reales a medida que aparecen, no solo las 9 fases originales.

## POST-LANZAMIENTO — Primer contenido real

**D45. Primer lanzamiento y video reales cargados ("Poco Tiempo",
13 feb 2022), reemplazando los 4 archivos de ejemplo/prueba, que se
eliminaron por completo (`ejemplo-single.md`, `ejemplo-video.md`,
`ejemplo-playlist.md`, `ejemplo-noticia.md`).**

- Se cargó como DOS entradas de contenido (lanzamiento + video), no una
  sola — el modelo de datos del proyecto ya distinguía ambos tipos
  desde la Fase 7, y esta pieza real encaja naturalmente en los dos:
  es una canción (con streaming) y tiene un video oficial (con YouTube).
- `cover` usa la miniatura de YouTube (`i.ytimg.com`) como portada
  provisoria, al no haber otra imagen disponible todavía — coherente
  con la decisión de la Fase 1 de no alojar imágenes pesadas en el
  repo (URL externa real, no un archivo local).
- Las colecciones `playlist` y `noticia` quedan vacías (sin archivo de
  ejemplo ni contenido real) — estado válido: las páginas
  correspondientes renderizan una grilla vacía sin romper, hasta que
  haya contenido real de esos tipos.

## POST-LANZAMIENTO — Tarjetas autosuficientes (sin navegación interna)

**D46. Las tarjetas de Lanzamiento, Video y Playlist dejaron de navegar
a una página de detalle interna — ahora muestran fecha, resumen
(generado con el filtro `excerpt` ya existente desde la Fase 7) y un
botón que lleva directo a la plataforma externa (Spotify/YouTube/etc),
similar a una grilla de YouTube.**

- Por qué: pedido explícito del usuario — no le gustaba que el click
  lo sacara a una página dominada por una imagen grande.
- Noticia es la excepción: sigue linkeando a su propia página, porque
  no tiene una plataforma externa a la que mandar al usuario.
- Las páginas de detalle (`release.njk`, `video.njk`, `playlist.njk`)
  NO se eliminaron — siguen existiendo como URLs reales (sitemap, RSS,
  resultados de búsqueda), solo se sacaron del flujo de navegación
  normal desde las grillas.
- Cambió la firma de la macro `card()` (de 7 a 9 parámetros, con dos
  modos: `actionUrl` para acción externa o `internalUrl` para link
  interno) — se actualizaron los 11 lugares donde se usaba.

## POST-LANZAMIENTO — Refinamiento de tarjetas (imagen, texto, plataforma, hover)

**D47. Cuatro ajustes a las tarjetas de contenido, todos a pedido
explícito del usuario:**

- Portada: `aspect-ratio` cambiado de 4:3 a 16:9, para que coincida
  exactamente con la proporción nativa de las miniaturas de YouTube
  (1280x720) y no las recorte.
- Descripción: ya no se corta con el filtro `excerpt` a nivel de
  visualización final — se muestra un preview (~110 caracteres) y,
  si el texto completo es más largo, un botón "Más"/"Menos" (JS
  delegado en `main.js`) alterna entre preview y texto completo sin
  recargar la página. Nuevo filtro `stripHtml` (quita tags sin
  truncar) para obtener el texto completo limpio.
- Botón de acción: pasó de texto fijo ("Escuchar"/"Ver video") a
  detección automática de plataforma por dominio de la URL (nuevo
  filtro `platformLabel`) — dice "Spotify", "YouTube", etc.
  automáticamente. **Limitación real, no resuelta:** acortadores
  genéricos (bit.ly, tinyurl) no son detectables por este método,
  solo dominios/acortadores oficiales de cada plataforma (incluye
  `spoti.fi` de Spotify, agregado tras detectarlo como bug real con
  el link provisto por el usuario).
- Hover de tarjeta: se sacó el `transform: translateY(-2px)` — el
  usuario no quería que la tarjeta "se mueva" al pasar el mouse; se
  mantiene solo el cambio de sombra.

## POST-LANZAMIENTO — Footer, botón "Más" real, y modo oscuro

**D48. Footer: email integrado a la misma lista que Instagram/Facebook,
sin mostrar la dirección textualmente ("Email" como texto de link, con
el mailto: real en el href).**

**D49. Botón "Más"/"Menos" rehecho: de recorte por cantidad fija de
caracteres a recorte visual con CSS (`-webkit-line-clamp: 3`) + JS que
mide el desborde real (`scrollHeight > clientHeight`) para decidir si
mostrar el botón.**

- Por qué: un recorte por caracteres no sabe si el texto realmente
  desborda una tarjeta de ancho variable (1 a 4 columnas según
  viewport) — el mismo texto puede sobrar espacio en mobile (1
  columna, más ancho) y desbordar en desktop (4 columnas, más angosto).
  La medición real resuelve esto sin adivinar.
- Se intentó primero poner el botón DENTRO del párrafo con line-clamp
  para que apareciera "en la misma línea que los tres puntos" — se
  descartó: el contenido que no entra en un `line-clamp` se oculta,
  no se reordena para aparecer en el punto de corte, es un
  comportamiento de CSS no confiable entre navegadores. Se resolvió
  con el botón inmediatamente debajo, sin espacio extra — visualmente
  equivalente, técnicamente robusto.

**D50. Modo oscuro/claro implementado.**

- Paleta oscura completa como override de `:root[data-theme="dark"]`
  en `tokens.css` — el resto del CSS no cambia, sigue consumiendo las
  mismas variables.
- Acento rojo ajustado en modo oscuro (`#FF5C5C` en vez de `#B50000`
  de marca) porque el rojo de marca pierde legibilidad como texto
  sobre fondo oscuro — se mantiene la familia de color, no el valor
  exacto.
- Persistencia con `localStorage` + respeto de `prefers-color-scheme`
  como default si el usuario nunca lo tocó — corresponde acá porque es
  un sitio real desplegado, no un artifact de la interfaz de Claude
  (la restricción de no usar localStorage aplica solo a ese contexto).
- Script bloqueante e inline al principio del `<head>` (antes de los
  `<link>` de CSS) para aplicar el tema guardado antes del primer
  render y evitar el flash de tema incorrecto.
