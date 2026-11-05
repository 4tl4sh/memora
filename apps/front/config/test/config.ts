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
    include: ['src/**/*.spec.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.{ts,tsx}', 'src/routeTree.gen.ts'],
    },
  },
})
