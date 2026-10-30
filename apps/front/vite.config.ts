import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  // Las server functions leen process.env (GEMINI_API_KEY…): Vite solo expone .env
  // en import.meta.env, así que se copian aquí sin pisar variables ya definidas
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), '')))
    process.env[key] ??= value

  return {
    resolve: { tsconfigPaths: true },
    // pdf-parse depende de @napi-rs/canvas (binario nativo .node): rolldown no puede
    // pre-empaquetarlo, así que se deja fuera del optimizador y se carga desde node_modules
    optimizeDeps: { exclude: ['pdf-parse', '@napi-rs/canvas'] },
    ssr: { external: ['pdf-parse', '@napi-rs/canvas'] },
    plugins: [
      devtools(),
      nitro({
        // pdf-parse se carga tal cual desde node_modules: empaquetado pierde los
        // polyfills de Node (DOMMatrix…) y falla al leer el PDF
        traceDeps: ['pdf-parse*'],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})

export default config
