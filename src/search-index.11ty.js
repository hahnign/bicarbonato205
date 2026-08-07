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
    const items = data.collections.archivo.map((item) => ({
      title: item.data.title,
      url: item.url,
      date: item.date,
    }));
    return JSON.stringify(items);
  }
};
