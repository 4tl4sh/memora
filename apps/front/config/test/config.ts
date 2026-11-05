import { fileURLToPath } from 'node:url'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Configuración de Vitest, aparte de vite.config.ts: los tests no necesitan
// TanStack Start, Nitro ni Tailwind, solo React y los alias #/…
export default defineConfig({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    // describe, it, expect y vi sin importarlos
    globals: true,
    // Cada test empieza con los spies y mocks restaurados: no se arrastra nada del anterior
    restoreMocks: true,
    // Un DOM simulado (document, localStorage…) para los componentes y los storages
    environment: 'jsdom',
    setupFiles: ['./config/test/setup.ts'],
    // Los tests de componentes escriben tecla a tecla con user-event y cada pulsación
    // valida el formulario: con todos los ficheros en paralelo, 5 s se queda corto
    testTimeout: 15_000,
    include: ['src/**/*.spec.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.{ts,tsx}', 'src/routeTree.gen.ts'],
    },
  },
})
