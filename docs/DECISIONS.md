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

## Pendiente de registrar (próximas fases)

- Fase 6: decisiones de construcción de páginas.
- Fase 7: modelo de datos de contenido (front matter de Markdown, colecciones, filtros).
- Fase 8: decisiones de SEO, performance y accesibilidad.
