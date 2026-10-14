import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "./style.css";

const raiz = document.documentElement;

/* Modo oscuro */
const botonesOscuro = document.querySelectorAll("[data-toggle-dark]");
const pintarOscuro = () => {
  const oscuro = raiz.classList.contains("dark");
  botonesOscuro.forEach((b) => b.setAttribute("aria-pressed", String(oscuro)));
};
botonesOscuro.forEach((boton) =>
  boton.addEventListener("click", () => {
    const oscuro = raiz.classList.toggle("dark");
    try {
      localStorage.setItem("memora-oscuro", oscuro ? "1" : "0");
    } catch {}
    pintarOscuro();
  }),
);
pintarOscuro();

/* Tema de color: "teal" es el de por defecto y no pone atributo */
const selectorTema = document.querySelector("[data-theme-select]");
const TEMAS = ["teal", "klein", "amarillo"];
if (raiz.dataset.theme && !TEMAS.includes(raiz.dataset.theme))
  delete raiz.dataset.theme;
if (selectorTema) {
  selectorTema.value = raiz.dataset.theme ?? "teal";
  selectorTema.addEventListener("change", () => {
    const tema = selectorTema.value;
    if (tema === "teal") delete raiz.dataset.theme;
    else raiz.dataset.theme = tema;
    try {
      localStorage.setItem("memora-tema", tema);
    } catch {}
  });
}

/* Newsletter (simulado): el botón se activa solo con el formulario válido */
const form = document.querySelector("[data-form-newsletter]");
if (form) {
  const boton = form.querySelector("button[type=submit]");
  const aviso = form.querySelector("[data-aviso]");
  const sincronizar = () => {
    boton.disabled = !form.checkValidity();
  };
  form.addEventListener("input", sincronizar);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return;
    aviso.hidden = false;
    form.reset();
    sincronizar();
  });
  sincronizar();
}
