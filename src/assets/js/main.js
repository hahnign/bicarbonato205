// BICARBONATO205 — JS del sitio
//
// El sitio funciona completamente sin JavaScript (navegación, contenido,
// layout — todo HTML/CSS puro). Esta es la única mejora progresiva real:
// búsqueda client-side, que solo se activa si existe el input de búsqueda
// en la página actual (evita cargar/ejecutar lógica innecesaria en el
// resto del sitio).

const searchInput = document.getElementById("search-input");

if (searchInput) {
  let index = [];

  fetch("/search-index.json")
    .then((res) => res.json())
    .then((data) => {
      index = data;
    });

  const resultsList = document.getElementById("search-results");

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    resultsList.innerHTML = "";

    if (query.length < 2) return;

    const matches = index.filter((item) =>
      item.title.toLowerCase().includes(query)
    );

    matches.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.url;
      a.textContent = item.title;
      li.appendChild(a);
      resultsList.appendChild(li);
    });

    if (matches.length === 0) {
      resultsList.innerHTML = "<li>Sin resultados.</li>";
    }
  });
}

// Toggle "Más" / "Menos" en la descripción de las tarjetas.
// Delegado en document: funciona para cualquier tarjeta, sin importar
// cuántas haya en la página ni si se agregan más en el futuro.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-more]");
  if (!button) return;

  const card = button.closest(".card");
  const preview = card.querySelector("[data-preview]");
  const full = card.querySelector("[data-full]");
  const isExpanded = button.getAttribute("aria-expanded") === "true";

  if (isExpanded) {
    full.hidden = true;
    preview.hidden = false;
    button.textContent = "Más";
    button.setAttribute("aria-expanded", "false");
  } else {
    full.hidden = false;
    preview.hidden = true;
    button.textContent = "Menos";
    button.setAttribute("aria-expanded", "true");
  }
});
