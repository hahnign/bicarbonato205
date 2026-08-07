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

## Pendiente de registrar (próximas fases)

- Fase 9: README, checklist de mantenimiento, guía de reutilización de la plantilla.

## Pendientes NO resueltos por diseño (requieren decisión humana)

- `srcset`/imágenes responsive: depende del CDN de imágenes a elegir.
- Reemplazar `og-default.jpg`, favicon e íconos por diseño final de marca.
- Conectar el formulario de newsletter a un proveedor real (Buttondown, Mailchimp, etc.).
- Completar los valores `REEMPLAZAR` en `_data/site.json` (links reales de streaming y redes).
- Fase 7: modelo de datos de contenido (front matter de Markdown, colecciones, filtros).
- Fase 8: decisiones de SEO, performance y accesibilidad.
