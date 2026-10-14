import "./fonts.css";
import "./style.css";

const raiz = document.documentElement;

/* Modo oscuro: botón de escritorio e interruptor del menú móvil, siempre sincronizados */
const botonesOscuro = document.querySelectorAll("[data-toggle-dark]");
const interruptorOscuro = document.querySelector("[data-dark-switch]");
const pintarOscuro = () => {
  const oscuro = raiz.classList.contains("dark");
  botonesOscuro.forEach((b) => b.setAttribute("aria-pressed", String(oscuro)));
  if (interruptorOscuro) interruptorOscuro.checked = oscuro;
};
const guardarOscuro = (oscuro) => {
  raiz.classList.toggle("dark", oscuro);
  try {
    localStorage.setItem("memora-oscuro", oscuro ? "1" : "0");
  } catch {}
  pintarOscuro();
};
botonesOscuro.forEach((boton) =>
  boton.addEventListener("click", () =>
    guardarOscuro(!raiz.classList.contains("dark")),
  ),
);
interruptorOscuro?.addEventListener("change", () =>
  guardarOscuro(interruptorOscuro.checked),
);
pintarOscuro();

/* Tema de color: "teal" es el de por defecto y no pone atributo */
const selectorTema = document.querySelector("[data-theme-select]");
const radiosTema = document.querySelectorAll("[data-theme-radio]");
const TEMAS = ["teal", "klein", "amarillo"];
if (raiz.dataset.theme && !TEMAS.includes(raiz.dataset.theme))
  delete raiz.dataset.theme;
const pintarTema = () => {
  const tema = raiz.dataset.theme ?? "teal";
  if (selectorTema) selectorTema.value = tema;
  radiosTema.forEach((r) => (r.checked = r.value === tema));
};
const guardarTema = (tema) => {
  if (tema === "teal") delete raiz.dataset.theme;
  else raiz.dataset.theme = tema;
  try {
    localStorage.setItem("memora-tema", tema);
  } catch {}
  pintarTema();
};
selectorTema?.addEventListener("change", () => guardarTema(selectorTema.value));
radiosTema.forEach((r) =>
  r.addEventListener("change", () => r.checked && guardarTema(r.value)),
);
pintarTema();

/* Menú móvil (hasta 1023 px): el estado vive en aria-expanded y en el atributo hidden */
const botonMenu = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
if (botonMenu && menu) {
  const escritorio = matchMedia("(min-width: 1024px)");
  const abrir = (abierto) => {
    menu.hidden = !abierto;
    botonMenu.setAttribute("aria-expanded", String(abierto));
  };
  botonMenu.addEventListener("click", () =>
    abrir(botonMenu.getAttribute("aria-expanded") !== "true"),
  );
  // Al pulsar un enlace del menú se cierra para dejar ver la sección
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => abrir(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      abrir(false);
      botonMenu.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !e.target.closest("header")) abrir(false);
  });
  // Si se agranda la ventana hasta escritorio, el menú móvil se cierra
  escritorio.addEventListener("change", (e) => e.matches && abrir(false));
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
