/// <reference types="vite/client" />

// Con strictImportMetaEnv, leer una variable que no esté declarada aquí es un error de
// TypeScript (por ejemplo, una errata como VITE_APP_NAM)
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

// Solo las variables con prefijo VITE_ llegan al navegador: acaban escritas en el JS
// que se descarga, así que aquí nunca va nada secreto (las claves de la IA no llevan VITE_)
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_SHOW_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
