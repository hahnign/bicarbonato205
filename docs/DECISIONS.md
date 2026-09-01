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

## POST-LANZAMIENTO — Automatización de contenido nuevo

**D51. Script `scripts/nuevo-contenido.mjs` (`npm run new -- <tipo>`)
para automatizar la creación de contenido, más `docs/PLANTILLAS.md`
como referencia manual de respaldo.**

- El script usa el oEmbed público de YouTube (sin API key) para
  autocompletar título y portada cuando se pega un link, ante la
  necesidad real del usuario de subir contenido que ya tiene publicado.
- Extensión `.mjs` (no `.js` + `"type": "module"` en `package.json`):
  se descartó explícitamente `"type": "module"` global porque hubiera
  roto `.eleventy.js`, que usa sintaxis CommonJS (`module.exports`).
  `.mjs` fuerza módulo ES solo para este archivo, sin tocar la
  configuración del resto del proyecto — bug real evitado antes de
  llegar a entregarlo.
- Verificado con un harness de prueba que simula tipeo real
  (respuestas con demora entre cada una, vía `child_process.spawn`),
  no con `printf | node`, porque ese método de testing tiene un
  artefacto conocido de Node (el pipe se cierra antes de que el
  programa termine de leer preguntas secuenciales) que no reproduce
  el uso real en una terminal interactiva.

## POST-LANZAMIENTO — Cambio de tipografía

**D52. Tipografía reemplazada: Passion One (títulos) + Google Sans Code
(todo lo demás: nav, labels, fechas y cuerpo de texto), reemplazando
Archivo Black + IBM Plex Mono + Inter.**

- Pedido explícito del usuario, con el link de Google Fonts ya
  provisto para Passion One.
- Se simplificó de 3 familias a 2: `--font-mono` y `--font-body` ahora
  apuntan a la misma fuente (Google Sans Code), a pedido de "para el
  resto" (todo menos títulos).
- Nota de diseño dejada explícita para el usuario: Google Sans Code es
  monoespaciada — al aplicarse también al cuerpo de texto (antes solo
  en nav/labels), el look de párrafos largos cambia notablemente
  (estilo "técnico/terminal"). No se revirtió preventivamente porque
  fue un pedido directo, pero se marcó como punto a confirmar tras ver
  el resultado publicado.

## POST-LANZAMIENTO — Múltiples plataformas por tarjeta

\*\*D53. Nuevo campo opcional `links` (lista) en Lanzamiento y Video,
para mostrar varias pills de plataforma en una misma tarjeta (Spotify

- YouTube + Deezer + Apple Music, etc.), no solo una.\*\*

* Nuevo filtro `collectLinks`: combina el campo singular viejo
  (`streamingUrl`/`youtubeUrl`/`url`, según tipo) con el nuevo campo
  plural `links`, sin duplicados — mantiene compatibilidad total con
  el contenido ya cargado (Poco Tiempo sigue funcionando sin cambios).
* La macro `card()` pasó de recibir una URL única a recibir un array;
  renderiza una pill por link, cada una con su plataforma
  auto-detectada (mismo filtro `platformLabel` de D47).
* Segundo lanzamiento real cargado como ejemplo de uso ("No Estamos
  Solos", con Spotify + YouTube simultáneos).
* **Bug real encontrado y corregido en el camino:** el filtro
  `stripHtml` no decodificaba entidades HTML (`&quot;`), y Nunjucks
  las volvía a escapar al mostrarlas (`&amp;quot;`, doble-escapado
  visible en pantalla). Se corrigió decodificando entidades comunes
  dentro de `stripHtml`, con `&amp;` decodificado al final para evitar
  decodificar de más.
* El script de automatización (`npm run new`) también se actualizó:
  después de los campos principales, pregunta plataformas adicionales
  en loop hasta que se deja vacío, y genera el bloque YAML `links:`
  automáticamente.

## POST-LANZAMIENTO — Footer: espaciado, y newsletter reemplazado por frase

**D54. Columnas del footer: separación horizontal aumentada de 32px a
64px** (`column-gap` separado de `row-gap` en el grid), a pedido del
usuario ("Contacto" se sentía muy pegado a la columna del medio).

**D55. La columna de Newsletter se eliminó por completo (formulario,
CSS, y el `action="#"` placeholder que venía sin conectar desde la
Fase 6) y se reemplazó por una frase de identidad de marca, en un
cuarto rol tipográfico nuevo: `--font-accent` (Amatic SC, cursiva).**

- Por qué: decisión directa del usuario — no van a mandar mails, así
  que un newsletter sin implementar no aporta nada y ocupa espacio.
- El texto vive en `_data/site.json` (`footerQuote`), no hardcodeado
  en el template — mismo principio de separar contenido de estructura
  que se viene aplicando desde la Fase 1.
- Se verificó explícitamente que no quedara CSS/JS muerto de
  `newsletter-form` en ningún otro archivo antes de eliminarlo.

## POST-LANZAMIENTO — Hero con logo, footer de 4 columnas, bio en Acerca

**D56. Padding vertical del hero reducido de 64px fijos a 32px en
mobile (64px se mantiene desde 1024px de ancho).**

- Por qué: en celular quedaba demasiado separado del header y del
  contenido — pedido explícito del usuario tras verlo en uso real.

**D57. Logo circular agregado al hero de Inicio, junto al título**
(`.page-hero__brand`: columna en mobile, fila en desktop desde
1024px), estilo inspirado en el header de un canal de YouTube (avatar

- título grande al lado).

* El recorte circular es 100% CSS (`border-radius: 50%` sobre una
  imagen cuadrada) — no se editó el archivo de imagen. Esto es lo que
  permite que "afuera del círculo" sea transparente y se adapte solo a
  modo claro/oscuro, sin depender de ningún trabajo de diseño extra.
* Verificado con un recorte de prueba (Pillow) antes de implementar,
  para confirmar que el diseño real del logo no perdía letras
  importantes en las esquinas del círculo.

**D58. Footer reestructurado a 4 columnas: [Streaming + Contacto
agrupadas, ~1/3 del ancho] + [Frase] + [Logo circular, mismo criterio
que D57].**

- Streaming y Contacto viven en un `.site-footer__group` con su propio
  grid interno de 2 columnas, más pegadas entre sí que la separación
  general del footer (`column-gap` interno menor al del grid externo).

**D59. Bio completa cargada en `_data/site.json` (`bio`), mostrada en
Acerca (reemplaza `site.description` genérica) — NO en el hero de
Inicio.**

- Decisión (con recomendación explícita dada al usuario, aceptada):
  el hero de Inicio prioriza una primera impresión rápida (definido
  desde la Fase 1); un párrafo largo de biografía le compite ese
  objetivo. Acerca es la página de Biografía real del sitemap
  original — es su lugar natural.
- **Bug real encontrado y corregido en el camino:** el párrafo de bio
  se había puesto inicialmente con la clase `.card__desc`, que desde
  D49 tiene recorte a 3 líneas (`-webkit-line-clamp`) pensado para
  tarjetas — hubiera cortado la bio sin querer. Se creó una clase
  nueva (`.page-text`) para texto de página completa, sin ese recorte.

## POST-LANZAMIENTO — Hero: logo y título en fila también en mobile

**D60. `.page-hero__brand` pasó de columna-en-mobile/fila-en-desktop a
fila siempre, con el logo más chico en mobile (56px vs 110px en
desktop) y `flex-shrink: 0` para que no se deforme.**

- Por qué: en mobile, el layout en columna hacía que el logo y el
  título se vieran "separados por un enter" — pedido explícito del
  usuario de que queden uno al lado del otro en cualquier tamaño de
  pantalla.

## POST-LANZAMIENTO — line-height de títulos grandes (bug de raíz)

**D61. Ningún título con `--font-display` tenía `line-height` propio —
todos heredaban el `1.5` de `body`, pensado para párrafos. En títulos
grandes que saltan a 2+ líneas (como el hero en mobile), eso deja un
espacio excesivo entre renglones, rompiendo la sensación de "bloque
compacto" con el logo al lado.**

- Corregido en las cuatro reglas que usan `--font-display`:
  `.page-hero__title` (1.05), `.page-section__heading` (1.1),
  `.site-header__logo` (1.1), `.card__title` (1.15) — valores más
  ajustados cuanto más grande es el texto.
- Se corrigieron las cuatro juntas (no solo el hero, que fue el
  síntoma reportado) porque es la misma causa raíz — evita que el
  mismo bug aparezca después en cualquier otro título que salte a más
  de una línea.

## POST-LANZAMIENTO — Bug real: la búsqueda estaba rota en producción

**D62. `fetch("/search-index.json")` en `main.js` era una ruta absoluta
escrita a mano, ajena al `pathPrefix` — apuntaba a la raíz del dominio
en vez de `/bicarbonato205/`. La búsqueda estaba rota en producción
desde que se agregó `pathPrefix` (fix de deploy, mensaje "el sitio no
se veía con estilos").**

- Causa: el HTML transform automático de Eleventy (que corrige rutas
  con `pathPrefix`) solo reescribe atributos `href`/`src` dentro de
  HTML — nunca toca strings dentro de archivos `.js`.
- Detectado al explicarle al usuario cómo funciona la búsqueda y
  decidir verificarla con el estado actual del proyecto, en vez de
  asumir que seguía funcionando desde la Fase 7.
- Fix: la ruta correcta (`{{ '/search-index.json' | url }}`, que sí
  respeta `pathPrefix` por ser un valor calculado en la plantilla) se
  pasa desde `buscar.njk` al input vía `data-search-index`, y
  `main.js` la lee de ahí en vez de tenerla hardcodeada.
- Lección general para el proyecto: cualquier ruta interna referenciada
  desde JavaScript puro necesita este mismo patrón (pasarla desde el
  HTML vía atributo `data-*`, calculada con el filtro `url`), nunca
  escribirla directamente como string en un `.js`.

## POST-LANZAMIENTO — Páginas de detalle rediseñadas como tarjeta grande

**D63. Los layouts de detalle (`release.njk`, `video.njk`,
`playlist.njk`) tenían la imagen de portada sin ningún límite de
tamaño (se veía "descomunal") y usaban el sistema viejo de un solo
link de acción, sin el soporte de múltiples plataformas agregado en
D53. Reescritos con un nuevo componente `.detail-card`.**

- Imagen contenida a `max-width: 640px`, proporción 16:9 (mismo
  criterio que D47, pero más grande que una tarjeta de grilla) —
  resuelve el problema real reportado por el usuario.
- Envuelto en una tarjeta con el mismo lenguaje visual que `.card`
  (superficie, borde, radio, sombra), pero a mayor escala — es la
  página dedicada de un solo ítem, no una entre muchas.
- Descripción completa, sin el recorte/botón "Más" de `.card__desc`
  (con sentido en grilla, no en una página dedicada) — nueva clase
  `.detail-card__desc`.
- Los pills de acción ahora usan `collectLinks` (como las tarjetas),
  mostrando TODAS las plataformas del ítem, no solo la primera —
  corrige que esas páginas se habían quedado con el sistema de un
  solo link tras el cambio de D53, que en su momento solo tocó la
  sección de relacionados de estos mismos layouts, no su bloque
  principal.

## POST-LANZAMIENTO — Padding del hero en desktop, a la mitad

**D64. Padding vertical del hero en desktop (≥1024px) reducido de 64px
a 32px (la mitad), quedando igual al valor de mobile por coincidencia
de la escala de espaciado. Mobile sin cambios.**

- Se eliminó la media query que fijaba el valor de desktop, ya que
  ahora coincide con la regla base — dejarla hubiera sido código
  redundante sin ningún efecto real.

## POST-LANZAMIENTO — Íconos SVG, frase de marca reutilizable, hero con descripción

**D65. Íconos de Buscar y de modo oscuro/claro: de texto/emoji a SVG
inline con `fill/stroke: currentColor`.**

- Por qué "currentColor": el ícono hereda automáticamente el color de
  texto del tema activo (claro/oscuro) sin necesitar dos archivos de
  ícono distintos — resuelve el pedido de "que cambie con el modo
  claro/oscuro" de la forma más simple posible.
- Solo se usa el ícono de luna en ambos estados del toggle (no hay
  ícono de sol distinto provisto) — el ícono no cambia, solo el
  `aria-label` según el modo activo.

**D66. Clase `.brand-quote` (nueva) reemplaza a `.site-footer__quote`:
de Amatic SC cursiva a Google Sans Code mono en mayúsculas, igual
tratamiento visual que el heading "STREAMING" del footer, pero más
grande.**

- Se aplicó `text-transform: uppercase` explícitamente porque el
  pedido fue "como está escrito STREAMING", que también está en
  mayúsculas — no es solo la tipografía.
- Amatic SC se eliminó del proyecto por completo (variable
  `--font-accent` y su import de Google Fonts) al quedar sin ningún
  uso — una fuente menos para descargar.

**D67. La misma frase (`brand-quote`) ahora aparece también en el hero
de Inicio, debajo del avatar+título — imita la estructura de un header
de canal/perfil (avatar, nombre, línea de descripción debajo), a
pedido del usuario con una captura de referencia de YouTube.**

- Aclarado explícitamente: no se agregó una imagen de banner/foto de
  banda arriba del avatar (como sí tiene la referencia) — no había
  ese archivo disponible; queda pendiente si el usuario lo provee.

## POST-LANZAMIENTO — Hero: título y frase alineados en la misma columna

**D68. La frase (`brand-quote`) estaba como hermana del bloque
avatar+título, no dentro de él — arrancaba pegada al borde izquierdo
de toda la sección (debajo del avatar) en vez de debajo del título.
Se movió a una columna de texto nueva (`.page-hero__text`, flex
column) junto al título, ambos alineados a la izquierda entre sí.**

## POST-LANZAMIENTO — Fusión de Lanzamientos + Videos en "Temas"

**D69. Los tipos de contenido "lanzamiento" y "video" se fusionaron en
un único tipo "tema" — un tema tiene portada, streaming y opcionalmente
un video, todo en una sola entrada de contenido, no dos separadas.**

- Por qué: cada canción real del proyecto (Poco Tiempo, No Estamos
  Solos) ya vivía repetida en dos lugares — el sistema `links` de D53
  ya permitía múltiples plataformas por ítem, así que mantener
  "lanzamiento" y "video" como colecciones separadas era redundante
  una vez que ese sistema existía.
- Renombrado completo, no solo el texto visible: carpeta
  `src/lanzamientos/` → `src/temas/`, tag `lanzamiento` → `tema`,
  colección `collections.lanzamiento` → `collections.tema`, clase CSS
  `card__tag--lanzamiento` → `card__tag--tema`, variable de color
  `--color-cat-lanzamientos` → `--color-cat-tema`, layout
  `release.njk` → `tema.njk`, página `/lanzamientos/` → `/temas/`.
- El tipo "video" se eliminó por completo (carpeta, layout, página de
  listado, ítem de nav, filtro en la colección `archivo`) — un video
  ahora es simplemente uno de los links de un tema.
- Contenido real migrado: "Poco Tiempo" (video, antes en
  `videos/poco-tiempo-video-oficial.md`) se fusionó dentro de
  `temas/poco-tiempo.md`, agregando su YouTube a `links` — ya no hay
  dos entradas para la misma canción.
- Navegación: de 6 ítems a 6 ítems, pero cambia la composición
  (Lanzamientos + Videos → un solo Temas), liberando espacio
  conceptual en el menú.
- **Pendiente explícito, no resuelto en este cambio:** `README.md` y
  `docs/PLANTILLAS.md` todavía documentan Lanzamientos y Videos como
  tipos separados — quedan desactualizados hasta la próxima revisión.

## POST-LANZAMIENTO — Fusión de Videos y Lanzamientos en "Temas"

**D69. Los tipos de contenido `lanzamiento` y `video` se fusionaron en
uno solo: `tema` — decisión del usuario, ya que cada canción real
tiene tanto lanzamiento (streaming) como video, y mantenerlos
separados significaba cargar el mismo contenido dos veces (ya visto
con "Poco Tiempo", que vivía duplicado en ambas colecciones).**

- Nombre elegido para la sección: "Temas" (a pedido explícito del
  usuario, sobre "Lanzamientos" u otra alternativa).
- `src/lanzamientos/` + `src/videos/` → `src/temas/`. El contenido
  duplicado de "Poco Tiempo" se fusionó en un solo archivo, con
  Spotify (`streamingUrl`) y YouTube (`links`) juntos.
- Layouts de detalle `release.njk` + `video.njk` → un solo
  `tema.njk`. El campo `youtubeUrl` como campo dedicado desapareció
  del modelo de datos — el link de YouTube de un tema, si existe, va
  en `links` como cualquier otra plataforma adicional (mismo sistema
  de D53).
- Colección custom `archivo` en `.eleventy.js`: de combinar 4 tags
  (`lanzamiento`, `video`, `playlist`, `noticia`) a combinar 3
  (`tema`, `playlist`, `noticia`).
- Navegación: de 7 a 6 ítems (Videos ya no existe como link separado).
- CSS: `card__tag--lanzamiento` + `card__tag--video` → una sola clase
  `card__tag--tema`; mismo criterio en las variables de color de
  categoría en `tokens.css`.
- Script de automatización (`npm run new`) y documentación
  (`docs/PLANTILLAS.md`, `README.md`) actualizados para reflejar el
  tipo unificado — ya no ofrecen "video" como opción separada; un
  link de YouTube se carga como plataforma adicional al crear un tema.
- Verificado con build real: 14 archivos generados, ambos temas reales
  muestran sus dos plataformas correctamente, sitemap/RSS/búsqueda
  usan las URLs `/temas/...` nuevas sin rastros de `/lanzamientos/` ni
  `/videos/`.

## POST-LANZAMIENTO — Saltos de línea automáticos en Markdown

**D70. Se configuró Eleventy para usar `markdown-it` con `breaks: true`
explícitamente (antes usaba la configuración por defecto de Eleventy,
sin este flag).**

- Síntoma reportado: en `poco-tiempo.md`, un párrafo escrito en varias
  líneas (sin línea en blanco entre ellas, solo para comodidad de
  lectura en el editor) se renderizaba como una sola línea corrida —
  comportamiento correcto de Markdown estándar (los saltos de línea
  sueltos se colapsan en un espacio), pero no el resultado que el
  usuario esperaba.
- Alternativa descartada: pedirle al usuario que termine cada línea
  con dos espacios invisibles (la sintaxis "oficial" de Markdown para
  salto de línea duro) — se descartó por frágil: muchos editores de
  texto recortan espacios al final de línea automáticamente, rompiendo
  el formato sin que se note.
- Fix: `eleventyConfig.setLibrary("md", markdownIt({ html:true,
breaks:true, linkify:true }))` — con esto, cualquier salto de línea
  real en el `.md` se respeta como `<br>`, sin necesitar trucos.
  Verificado que párrafos de una sola línea (No Estamos Solos, bio de
  Acerca) no se vieron afectados — el cambio solo actúa donde había
  saltos de línea reales en el origen.
- Nueva dependencia: `markdown-it` como devDependency explícita (antes
  Eleventy lo usaba internamente sin que el proyecto pudiera
  configurarlo directamente).

## POST-LANZAMIENTO — Saltos de línea también en la tarjeta

**D71. `stripHtml` ahora preserva los saltos de línea (`<br>` → `\n`
de texto real) en vez de eliminarlos junto con el resto del HTML —
a pedido del usuario, tras confirmar que el fix de D70 (breaks:true)
solo afectaba la página de detalle, no la tarjeta (que usa `stripHtml`
para su preview en texto plano).**

- Se agregó `white-space: pre-line` a `.card__desc` — sin esto, un
  salto de línea de _texto_ (no HTML) tampoco se renderiza visualmente
  en el navegador; es el mismo problema de fondo que D70, en otra capa.
- **Bug real encontrado y corregido en el camino:** el HTML que genera
  markdown-it ya trae un `\n` real después de cada `<br>` — sin
  normalizar, el reemplazo `<br>` → `\n` duplicaba el salto (quedaban
  líneas con espacio de más, como si fueran párrafos separados).
  Se agregó `.replace(/\n{2,}/g, "\n")` para colapsar cualquier
  secuencia de saltos duplicados a uno solo.
- Formato como cursiva/negrita sigue sin mostrarse en la tarjeta —
  eso no cambió, solo los saltos de línea.

## POST-LANZAMIENTO — Header: lupa y luna alineadas con el logo

**D72. `.site-header__top` tenía logo, tagline y los dos íconos todos
en una misma fila flex con `align-items: baseline` + `flex-wrap` —
con texto e íconos SVG mezclados, "baseline" da resultados impredecibles
(los SVG no tienen línea de base de texto real), y el wrap reordenaba
todo de forma distinta según el ancho disponible.**

- Fix: se separó en dos niveles — `.site-header__row` (logo + lupa +
  luna, `align-items: center`, la lupa/luna empujadas a la derecha
  con el `margin-left: auto` ya existente) y la tagline como línea
  propia debajo, fuera de esa fila.
- Con `align-items: center` en vez de `baseline`, los íconos quedan
  centrados verticalmente contra la altura real del texto del logo,
  sin depender de cómo el navegador calcule la línea de base de un SVG.

## POST-LANZAMIENTO — Estructura lista para íconos oficiales de plataforma

**D73. Se preparó el soporte para mostrar el logo oficial de cada
plataforma (Spotify, Apple Music, etc.) en los pills, sin dibujar los
logos nosotros mismos — son marcas registradas de terceros (mismo
criterio que D42).**

- Investigadas fuentes oficiales: Spotify tiene un hub de brand
  guidelines para developers/partners
  (developer.spotify.com/documentation/design); Apple Music tiene un
  generador de badges para artistas
  (artists.apple.com/support/1117-apple-music-marketing-tools), con
  sus propias Identity Guidelines de uso. No se encontraron con la
  misma certeza equivalentes para YouTube Music/Deezer/SoundCloud en
  esta ronda de búsqueda.
- Nuevo filtro `platformIcon(url)`: detecta la plataforma (reutiliza
  la misma tabla que `platformLabel`, ahora unificada en una función
  `detectPlatform()` para no mantener dos listas de regex separadas)
  y chequea en el filesystem, en tiempo de build, si existe
  `src/assets/img/platforms/<slug>.svg` (o `.png`). Si existe, devuelve
  su URL pública; si no, devuelve cadena vacía — el template muestra
  el ícono solo si lo encuentra, sin romper nada mientras tanto.
- Carpeta `src/assets/img/platforms/` creada (vacía, con `.gitkeep`
  para que Git la versione) — el usuario va a ir subiendo los badges
  ahí a medida que los consiga, con nombre de archivo documentado en
  `docs/PLANTILLAS.md`.
- Verificado con un archivo SVG de prueba (creado y eliminado en la
  misma sesión) que el mecanismo funciona de punta a punta: aparece
  el ícono con la URL correcta (incluyendo `pathPrefix`) apenas el
  archivo existe, sin tocar ningún template.
- Aplicado en los tres lugares donde se muestran pills: la macro
  `card()`, los layouts de detalle (`tema.njk`, `playlist.njk`), y la
  página `/streaming/` (que además dejó de mostrar la clave cruda del
  JSON —`appleMusic`— y ahora usa el nombre auto-detectado, igual
  que el resto del sitio).

## POST-LANZAMIENTO — Streaming: de pills a lista de texto grande

**D74. La página `/streaming/` dejó de usar pills con botón/ícono/flecha
— ahora es una lista vertical de links de texto plano, con el mismo
font/tamaño que el título "Streaming" (`--font-display`, `--text-2xl`),
pero en `--color-text` (negro en modo claro, blanco en modo oscuro por
el sistema de tokens ya existente) en vez del rojo de acento.**

- Se agregó un `:hover` a rojo, no pedido explícitamente — feedback de
  que el texto es clickeable. Reversible si no gusta.
- Esto es independiente de D73 (íconos oficiales de plataforma): esa
  estructura sigue lista para las tarjetas/pills de contenido, solo se
  sacó de esta página puntual.

## POST-LANZAMIENTO — Archivo desplegable por año + reproductor de playlist

**D75. Archivo: cada año pasó de `<section>` fija a `<details>`/
`<summary>` nativo de HTML — colapsado por defecto muestra una sola
línea (año + cantidad de publicaciones), click para desplegar.**

- Sin JavaScript: es comportamiento nativo del navegador, funciona con
  teclado y lectores de pantalla sin código adicional.
- El año más reciente (primero de la lista, ya que `groupByYear`
  ordena descendente) queda abierto por defecto; el resto colapsados.

**D76. Reproductor de playlist de YouTube Music embebido — SOLO en el
hero de Inicio, no en el header global.**

- Decisión explícita del usuario tras señalarle el trade-off de
  performance: un iframe de YouTube en el header pesaría en _todas_
  las páginas del sitio; limitarlo a Inicio evita ese costo en el
  resto.
- Se usa `youtube-nocookie.com` (versión sin cookies de seguimiento de
  YouTube) en vez del dominio estándar, y `loading="lazy"` en el
  iframe — coherente con los principios de performance/privacidad ya
  establecidos en el proyecto (Fase 8).
- El ID de playlist vive en `_data/site.json`
  (`featuredPlaylistId`), no hardcodeado en la plantilla — cambiarlo
  en el futuro no requiere tocar ningún template.
- Verificado con build real que el embed aparece únicamente en
  `index.html`, en ninguna otra página del sitio.

## POST-LANZAMIENTO — Hero: bio en segunda columna junto al reproductor

**D77. Se agregó `site.bio` (la misma bio de Acerca, sin título) como
segunda columna al lado del reproductor de playlist en Inicio —
`.hero-columns` en fila desde 1024px, columna (reproductor arriba, bio
abajo) en mobile.**

- Reutiliza el dato `site.bio` ya existente (D59) — no se duplicó el
  texto en ningún lado nuevo.
- El orden en el HTML (reproductor primero, bio después) es lo que
  determina el apilado correcto en mobile sin necesitar CSS adicional
  de reordenamiento.

## POST-LANZAMIENTO — Bio extendida + documentación de saltos de línea en JSON

**D78. Bio de `_data/site.json` actualizada con el texto completo
nuevo (varios párrafos). El texto que pasó el usuario tenía saltos de
línea reales dentro del string, lo cual es sintaxis JSON inválida —
JSON no permite saltos de línea literales dentro de un string, a
diferencia de Markdown.**

- Corregido escapando cada salto de párrafo como `\n\n` (generado con
  `json.dump` de Python, para garantizar sintaxis válida en vez de
  editar el escapado a mano).
- Se agregó `white-space: pre-line` a `.page-text` (usada en Acerca y
  en la columna de bio del hero) — sin esto, el `\n\n` escapado se
  guarda bien en el JSON pero el navegador igual lo colapsa en HTML,
  mismo problema de fondo que D71 en otra capa (JSON en vez de
  Markdown, pero la causa raíz de "salto de línea que no se ve" es
  análoga).
- Documentado en `docs/PLANTILLAS.md`: la regla de saltos de línea en
  `_data/site.json` es distinta a la de los `.md` de `src/temas/`
  (breaks:true no aplica ahí, porque no es contenido Markdown).

## POST-LANZAMIENTO — Renombres de secciones + íconos sociales en el header

**D79. Renombres de texto visible (nav, títulos h1, subtítulos),
manteniendo las URLs sin cambiar:**

- "Archivo" → "Publicaciones" (nav + h1 + front matter `title`; URL
  sigue siendo `/archivo/`).
- "Acerca" → "Nosotros" (ídem; URL sigue siendo `/acerca/`).
- Subtítulos actualizados en Playlists, Streaming y Temas al texto
  provisto por el usuario.
- Decisión explícita: no tocar las URLs sin que se pida — cambiarlas
  rompería el sitemap y cualquier link externo ya compartido; se
  avisó al usuario que es un cambio aparte si lo quiere.

**D80. Tres íconos sociales nuevos en el header (Instagram, Facebook,
YouTube), mismo estilo que la lupa/luna existentes (SVG lineales,
`currentColor`, se adaptan solos a modo claro/oscuro).**

- Mismo criterio que D42/D73: no son los logos oficiales exactos de
  cada marca (son propiedad de terceros) — se usaron los íconos
  genéricos del set Feather Icons (licencia MIT, libre), que ya
  comparten el mismo lenguaje visual que los íconos propios del sitio.
- Los links salen de datos ya existentes (`site.social.instagram`,
  `site.social.facebook`, `site.streaming.youtube`) — no se agregó
  ningún campo nuevo a `site.json`.

## POST-LANZAMIENTO — URLs nuevas: /publicaciones/ y /nosotros/

**D81. Permalinks cambiados: `/archivo/` → `/publicaciones/`,
`/acerca/` → `/nosotros/` (a pedido explícito del usuario, tras el
renombre de texto D79). Actualizado en `archivo.njk`, `acerca.njk`,
`nav.njk` y `sitemap.njk`.**

**D82. Se agregaron páginas de redirección automática en las URLs
viejas** (`redirect-publicaciones.njk` en `/archivo/`,
`redirect-nosotros.njk` en `/acerca/`, ambas con
`eleventyExcludeFromCollections: true`) — no pedido explícitamente,
agregado como buena práctica de bajo costo: evita que un link
compartido o guardado antes del rename dé 404.

**Bug real encontrado y corregido en el camino: doble `pathPrefix`
(`/bicarbonato205/bicarbonato205/...`) en las páginas de redirección.**

- Causa: se usó el filtro `{{ ... | url }}` a mano en el `<a href>` y
  en el `<meta http-equiv="refresh" content="url=...">` — pero la
  transformación automática de Eleventy que corrige `pathPrefix`
  _también_ reescribe esos dos casos por su cuenta (confirmado
  empíricamente: el `<a href>` normal ya lo cubre solo, igual que en
  el resto del sitio, Y — hallazgo nuevo — el `content` de un
  `meta[http-equiv=refresh]` también, algo que no estaba documentado
  de las correcciones anteriores de `pathPrefix`, D37).
- Fix: se sacó el filtro `| url` de ambos lugares, dejando que la
  transformación automática los prefije una sola vez — mismo patrón
  que ya usa el resto del sitio para `href`/`src` normales.
- El `<link rel="canonical">` no tuvo este problema porque se
  construye con `site.url` (dominio completo) + concatenación directa,
  no con el filtro `url`, y no es un path que empiece con `/` (es una
  URL absoluta) — la transformación automática no lo toca.

## POST-LANZAMIENTO — URLs de Archivo y Acerca renombradas

**D81. `/archivo/` → `/publicaciones/`, `/acerca/` → `/nosotros/` —
esta vez sí, a pedido explícito del usuario (D79 había dejado las URLs
sin tocar deliberadamente).**

- Archivos renombrados para que coincidan: `archivo.njk` →
  `publicaciones.njk`, `acerca.njk` → `nosotros.njk` (además del
  `permalink` en el front matter, que es lo que realmente determina la
  URL de salida).
- Se verificó con `grep` en todo `src/`, `.eleventy.js`, `README.md` y
  `docs/` que no quedara ninguna referencia residual a las rutas
  viejas antes de dar el cambio por terminado — se encontraron y
  corrigieron las 4 referencias reales: `nav.njk`, `sitemap.njk`, y
  los dos archivos renombrados.
- **Pendiente señalado al usuario, no resuelto por decisión propia:**
  no se agregaron redirecciones de las URLs viejas (`/archivo/`,
  `/acerca/`) a las nuevas — si esas rutas ya estaban compartidas o
  indexadas, van a devolver 404 a partir de este cambio. Se ofreció
  agregar redirecciones como capa extra si el usuario las quiere.
