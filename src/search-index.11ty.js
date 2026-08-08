module.exports = class {
  data() {
    return {
      // eleventyExcludeFromCollections: este archivo genera un dato de
      // salida (JSON), no es "contenido" del sitio — no debe aparecer
      // dentro de collections.archivo ni de ninguna otra colección.
      eleventyExcludeFromCollections: true,
      permalink: "/search-index.json",
    };
  }

  render(data) {
    // El transform automático de pathPrefix de Eleventy (Fase de fix del
    // deploy) solo reescribe HTML. Este archivo es JSON puro, así que
    // el prefijo se agrega a mano, derivándolo de site.url para no
    // duplicar el valor en dos lugares distintos.
    const prefix = new URL(data.site.url).pathname.replace(/\/$/, "");
    const items = data.collections.archivo.map((item) => ({
      title: item.data.title,
      url: prefix + item.url,
      date: item.date,
    }));
    return JSON.stringify(items);
  }
};
