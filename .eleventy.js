module.exports = function (eleventyConfig) {

  /* ------------------------------------------------------------
     PASSTHROUGH COPY
     Copia estas carpetas/archivos TAL CUAL al resultado final,
     sin procesarlos como plantillas. CSS y JS no necesitan pasar
     por el motor de templates de Eleventy.
     ------------------------------------------------------------ */
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");

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
     Combina las tres colecciones por tag (lanzamiento, video,
     playlist) en una sola línea de tiempo ordenada por fecha
     descendente. Ninguna colección automática por tag hace esto
     por sí sola — se necesita una función custom.
     ------------------------------------------------------------ */
  eleventyConfig.addCollection("archivo", (collectionApi) => {
    const items = [
      ...collectionApi.getFilteredByTag("lanzamiento"),
      ...collectionApi.getFilteredByTag("video"),
      ...collectionApi.getFilteredByTag("playlist"),
    ];
    return items.sort((a, b) => b.date - a.date);
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
  };
};
