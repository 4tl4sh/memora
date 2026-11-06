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
      <div className="flex min-h-svh flex-col">
        <SiteHeader
          links={[]}
          homeHref="/studia/private/"
          actions={
            <UserMenu name={user.name} planId={user.planId} onLogout={logout} />
          }
        />
        <main id="contenido" className="relative isolate flex flex-1 flex-col">
          {/* Rejilla tenue que se desvanece enseguida, detrás del contenido */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] mask-[linear-gradient(to_bottom,black,transparent)] bg-size-[24px_24px] text-neutral-950/3 sm:bg-size-[40px_40px] dark:text-neutral-0/4"
          />
          <Outlet />
        </main>
      </div>
      <SiteFooter links={appFooterLinks} />
    </>
  )
}
