const { rssPlugin } = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {

  /* ------------------------------------------------------------
     MARKDOWN: saltos de línea automáticos (breaks: true)
     Por defecto, Markdown ignora los saltos de línea "sueltos" dentro
     de un mismo párrafo (los colapsa en un espacio) — solo respeta
     salto de línea real si dejás una línea en blanco (nuevo párrafo)
     o dos espacios invisibles al final de la línea (frágil, se pierde
     fácil al editar). Con breaks:true, cualquier salto de línea que
     escribas en el .md se respeta tal cual, sin ese truco.
     ------------------------------------------------------------ */
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }));

  eleventyConfig.addPlugin(rssPlugin);

  /* ------------------------------------------------------------
     PASSTHROUGH COPY
     Copia estas carpetas/archivos TAL CUAL al resultado final,
     sin procesarlos como plantillas. CSS y JS no necesitan pasar
     por el motor de templates de Eleventy.
     ------------------------------------------------------------ */
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

  /* ------------------------------------------------------------
     FILTRO: formatDate
     Los datos de fecha en el front matter llegan como objeto Date
     de JavaScript. Sin un filtro, se mostrarían en formato técnico
     (ISO) en vez de un formato legible para el visitante.
     Uso en plantilla: {{ release.date | formatDate }}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("formatDate", (dateObj) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  });

  /* ------------------------------------------------------------
     SHORTCODE: currentYear
     Un shortcode es una "función" invocable directamente desde la
     plantilla, sin recibir un valor de entrada (a diferencia de un
     filtro, que siempre transforma algo que le pasás con "|").
     Lo usamos para no hardcodear el año del copyright a mano cada
     enero.
     Uso en plantilla: {% currentYear %}
     ------------------------------------------------------------ */
  eleventyConfig.addShortcode("currentYear", () => `${new Date().getFullYear()}`);

  /* ------------------------------------------------------------
     COLECCIÓN CUSTOM: archivo
     Combina tres colecciones por tag (tema, playlist, noticia) en
     una sola línea de tiempo ordenada por fecha descendente.
     Ninguna colección automática por tag hace esto por sí sola — se
     necesita una función custom.
     ------------------------------------------------------------ */
  eleventyConfig.addCollection("archivo", (collectionApi) => {
    const items = [
      ...collectionApi.getFilteredByTag("tema"),
      ...collectionApi.getFilteredByTag("playlist"),
      ...collectionApi.getFilteredByTag("noticia"),
    ];
    return items.sort((a, b) => b.date - a.date);
  });

  /* ------------------------------------------------------------
     FILTRO: limit
     Corta un array a los primeros N elementos.
     Uso: {{ collections.tema | reverse | limit(4) }}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  /* ------------------------------------------------------------
     FILTRO: excerpt
     Recorta contenido HTML a N caracteres de texto plano, sin
     cortar a mitad de una etiqueta. Uso: {{ content | excerpt(140) }}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("excerpt", (content, length = 140) => {
    const text = String(content).replace(/<[^>]*>/g, "").trim();
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + "…";
  });

  /* ------------------------------------------------------------
     FILTRO: siblingItem
     Dado un array de una colección y la URL actual, devuelve el
     ítem anterior o siguiente. direction: "prev" | "next".
     Uso: {% set prev = collections.tema | siblingItem(page.url, "prev") %}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("siblingItem", (collection, currentUrl, direction) => {
    const idx = collection.findIndex((item) => item.url === currentUrl);
    if (idx === -1) return null;
    const siblingIdx = direction === "next" ? idx + 1 : idx - 1;
    return collection[siblingIdx] || null;
  });

  /* ------------------------------------------------------------
     FILTRO: relatedItems
     Devuelve hasta N ítems de una colección, excluyendo el actual.
     Uso: {{ collections.tema | relatedItems(page.url, 3) }}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("relatedItems", (collection, currentUrl, limitN = 3) => {
    return collection.filter((item) => item.url !== currentUrl).slice(0, limitN);
  });

  /* ------------------------------------------------------------
     FILTRO: groupByYear
     Agrupa una colección por año (más reciente primero).
     Uso: {% set porAño = collections.archivo | groupByYear %}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("groupByYear", (collection) => {
    const groups = {};
    collection.forEach((item) => {
      const year = item.date.getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map((year) => ({ year, items: groups[year] }));
  });

  /* ------------------------------------------------------------
     FILTRO: stripHtml
     Quita etiquetas HTML SIN truncar (a diferencia de `excerpt`,
     que sí recorta). Se usa para mostrar el texto completo de una
     descripción cuando el usuario pide "leer más".
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("stripHtml", (content) => {
    return String(content)
      .replace(/<br\s*\/?>/gi, "\n") // <br> se convierte en salto de línea de TEXTO, no HTML — se preserva aunque el resto de las etiquetas se saquen
      .replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&") // siempre al final, evita decodificar de más
      .replace(/\n{2,}/g, "\n") // el HTML de markdown-it ya trae un \n real después de cada <br>, sin esto quedaban duplicados
      .trim();
  });

  /* ------------------------------------------------------------
     Tabla única de plataformas: nombre visible + slug de archivo.
     La usan platformLabel y platformIcon, para no mantener dos
     listas de regex separadas que puedan desincronizarse.
     ------------------------------------------------------------ */
  const PLATFORMS = [
    [/spotify|spoti\.fi/i, "Spotify", "spotify"],
    [/music\.apple/i, "Apple Music", "apple-music"],
    [/youtu\.?be/i, "YouTube", "youtube"],
    [/soundcloud/i, "SoundCloud", "soundcloud"],
    [/deezer/i, "Deezer", "deezer"],
    [/bandcamp/i, "Bandcamp", "bandcamp"],
  ];

  function detectPlatform(url) {
    if (!url) return { label: "Escuchar", slug: "" };
    for (const [regex, label, slug] of PLATFORMS) {
      if (regex.test(url)) return { label, slug };
    }
    return { label: "Escuchar", slug: "" };
  }

  /* ------------------------------------------------------------
     FILTRO: platformLabel
     Detecta la plataforma de streaming a partir del dominio de la
     URL, para que el botón de la tarjeta diga "Spotify", "YouTube",
     etc. automáticamente, sin tener que escribirlo a mano en cada
     página y sin que se desactualice si cambia el link.
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("platformLabel", (url) => detectPlatform(url).label);

  /* ------------------------------------------------------------
     FILTRO: platformIcon
     Si existe un ícono oficial subido para esta plataforma en
     src/assets/img/platforms/<slug>.svg (o .png), devuelve su URL
     pública. Si no existe todavía, devuelve "" — el template usa eso
     para mostrar solo el texto, sin romper nada. Apenas subas el
     archivo con el nombre correcto, el ícono aparece solo, sin tocar
     ningún template.
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("platformIcon", (url) => {
    const { slug } = detectPlatform(url);
    if (!slug) return "";
    for (const ext of ["svg", "png"]) {
      const filePath = path.join(__dirname, "src/assets/img/platforms", `${slug}.${ext}`);
      if (fs.existsSync(filePath)) return `/assets/img/platforms/${slug}.${ext}`;
    }
    return "";
  });

  /* ------------------------------------------------------------
     FILTRO: collectLinks
     Junta TODOS los links externos de un ítem de contenido en una
     sola lista, sin duplicados: el campo singular viejo
     (streamingUrl / youtubeUrl / url, según el tipo) más el campo
     plural nuevo `links` (una lista, para agregar plataformas
     adicionales). Esto es lo que permite mostrar varias pills
     (Spotify + YouTube + Deezer + Apple Music...) en una misma
     tarjeta, sin romper el contenido viejo que solo tiene un link.
     Uso: {{ item.data | collectLinks }}
     ------------------------------------------------------------ */
  eleventyConfig.addFilter("collectLinks", (data) => {
    const urls = [];
    if (data.streamingUrl) urls.push(data.streamingUrl);
    if (data.youtubeUrl) urls.push(data.youtubeUrl);
    if (data.url) urls.push(data.url);
    if (Array.isArray(data.links)) urls.push(...data.links);
    return [...new Set(urls)];
  });

  return {
    dir: {
      input: "src",       // Eleventy lee el contenido desde acá
      output: "_site",    // Eleventy escribe el HTML final acá (ignorado por Git)
      includes: "_includes",
      data: "_data",
    },
    // Motor de plantillas para archivos .njk
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // GitHub Pages de proyecto (no de usuario) sirve el sitio bajo
    // /bicarbonato205/, no en la raíz del dominio. pathPrefix le avisa
    // esto a Eleventy.
    pathPrefix: "/bicarbonato205/",
  };
};
