import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Precarga las fuentes latinas para que no esperen a que se descargue y analice el CSS
const precargarFuentes = () => ({
  name: "precargar-fuentes",
  transformIndexHtml: {
    order: "post",
    handler(_html, { bundle }) {
      if (!bundle) return [];
      return Object.keys(bundle)
        .filter((f) => /-latin-wght-normal-.*\.woff2$/.test(f))
        .map((f) => ({
          tag: "link",
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/woff2",
            href: "./" + f,
            crossorigin: "",
          },
          injectTo: "head-prepend",
        }));
    },
  },
});

// Hace que el build también se vea abriendo index.html con doble clic (file://):
// los <script type="module"> y los recursos con crossorigin los bloquea el navegador desde file://.
// El bundle no tiene import/export, así que se puede cargar como script clásico.
const abrirDesdeFile = () => ({
  name: "abrir-desde-file",
  transformIndexHtml: {
    order: "post",
    handler(html, { bundle }) {
      if (!bundle) return html;
      return html
        .replace(/(<script[^>]*?) type="module"/g, "$1 defer")
        .replace(/(<script[^>]*?) crossorigin(?:="[^"]*")?/g, "$1")
        .replace(
          /(<link rel="stylesheet"[^>]*?) crossorigin(?:="[^"]*")?/g,
          "$1",
        );
    },
  },
});

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), precargarFuentes(), abrirDesdeFile()],
  build: {
    rolldownOptions: {
      input: {
        landing: resolve(import.meta.dirname, "index.html"),
      },
    },
  },
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
});
