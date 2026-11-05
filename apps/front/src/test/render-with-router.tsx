import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'

// Algunos componentes usan Link o useNavigate: necesitan un router alrededor.
// Se monta uno mínimo en memoria (sin tocar la URL de jsdom) que solo pinta el componente.
export const renderWithRouter = (ui: ReactNode) => {
  const rootRoute = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const navigateSpy = vi.spyOn(router, 'navigate')
  // El router de la aplicación está registrado con sus rutas; este de prueba solo tiene la raíz
  const result = render(<RouterProvider router={router as never} />)
  return { ...result, router, navigateSpy }
}
