import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { UserMenu } from '#/components/layout/UserMenu'
import { appFooterLinks } from '#/components/layout/nav-links'
import { clearUser, readUser, useUser } from '#/lib/session-storage'

// Zona privada: la sesión vive en localStorage, así que solo se comprueba en el cliente
export const Route = createFileRoute('/studia/private')({
  ssr: false,
  beforeLoad: () => {
    if (!readUser()) throw redirect({ to: '/studia/' })
  },
  component: PrivateLayout,
})

function PrivateLayout() {
  const user = useUser()
  const navigate = useNavigate()

  // La sesión puede cerrarse desde otra pestaña
  if (!user) return <Navigate to="/studia/" />

  const logout = () => {
    clearUser()
    navigate({ to: '/studia/' })
  }

  return (
    <>
      {/* Cabecera y contenido ocupan justo una pantalla; el pie queda debajo */}
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          links={[]}
          homeHref="/studia/private/"
          actions={<UserMenu name={user} onLogout={logout} />}
        />
        <main id="contenido" className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <SiteFooter links={appFooterLinks} />
    </>
  )
}
