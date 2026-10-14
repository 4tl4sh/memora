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

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), precargarFuentes()],
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
