// BICARBONATO205 — JS del sitio
//
// El sitio funciona completamente sin JavaScript (navegación, contenido,
// layout — todo HTML/CSS puro). Esta es la única mejora progresiva real:
// búsqueda client-side, que solo se activa si existe el input de búsqueda
// en la página actual (evita cargar/ejecutar lógica innecesaria en el
// resto del sitio).

// Toggle de modo oscuro/claro. El tema inicial ya se aplicó en el
// script bloqueante del <head> (evita el flash); acá solo manejamos
// el click y la persistencia.
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.querySelector("[data-theme-icon]");

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
}

updateThemeIcon();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    updateThemeIcon();
  });
}

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

// "Más" / "Menos" en la descripción de las tarjetas.
// A diferencia de un recorte por cantidad fija de caracteres, acá se
// mide el desborde REAL del texto renderizado: si el párrafo (recortado
// visualmente a 3 líneas por CSS) tiene más alto de contenido que el
// que se ve, el texto no entraba y corresponde mostrar "Más". Si entra
// completo, el botón directamente no se muestra.
function initCardDescriptions() {
  document.querySelectorAll("[data-clamp-text]").forEach((paragraph) => {
    const overflows = paragraph.scrollHeight > paragraph.clientHeight + 1;
    const button = paragraph.nextElementSibling;
    if (!button || !button.hasAttribute("data-more")) return;

    if (overflows) {
      button.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", initCardDescriptions);

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-more]");
  if (!button) return;

  const paragraph = button.previousElementSibling;
  const isExpanded = button.getAttribute("aria-expanded") === "true";

  paragraph.classList.toggle("is-expanded", !isExpanded);
  button.textContent = isExpanded ? "Más" : "Menos";
  button.setAttribute("aria-expanded", String(!isExpanded));
});
