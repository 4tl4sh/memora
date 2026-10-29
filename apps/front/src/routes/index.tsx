import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createFileRoute } from '@tanstack/react-router'

import { LoginDialog } from '#/components/auth/LoginDialog'
import { Bienvenida } from '#/components/home/Bienvenida'
import { TestsPanel } from '#/components/home/TestsPanel'
import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { UserMenu } from '#/components/layout/UserMenu'
import { landingLinks } from '#/components/layout/nav-links'
import {
  primaryButtonClass,
  secondaryButtonClass,
} from '#/components/ui/buttons'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Memora · Convierte tu temario en tests' },
      {
        name: 'description',
        content:
          'Sube tus apuntes, la IA te propone un test y lo repasas en el móvil hasta que te lo sepas. Regístrate gratis.',
      },
    ],
  }),
  component: Home,
})

// El pie enlaza a las secciones de la landing, que aquí no están
const footerLinks = landingLinks.map((link) => ({
  ...link,
  href: `/memora-landing${link.href}`,
}))

// Registro: pendiente, de momento los botones no hacen nada
const register = () => {}

function Home() {
  // Sesión simulada: solo vive en memoria, al recargar se pierde
  const [user, setUser] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const loginButtonRef = useRef<HTMLButtonElement>(null)

  const login = (name: string) => {
    setLoginOpen(false)
    setUser(name)
  }

  // Tras cerrar sesión el menú de usuario desaparece: el foco vuelve al botón "Entrar"
  const logout = () => {
    flushSync(() => setUser(null))
    loginButtonRef.current?.focus()
  }

  const actions = user ? (
    <UserMenu name={user} onLogout={logout} />
  ) : (
    <>
      {/* En móvil no cabe en la barra: va al final del menú (menuAction) */}
      <button
        type="button"
        onClick={register}
        className={`${primaryButtonClass} hidden sm:inline-flex`}
      >
        Regístrate
      </button>{' '}
      <button
        ref={loginButtonRef}
        type="button"
        onClick={() => setLoginOpen(true)}
        className={secondaryButtonClass}
      >
        Entrar
      </button>
    </>
  )

  return (
    <>
      {/* Cabecera y contenido ocupan justo una pantalla; el pie queda debajo */}
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          links={[]}
          homeHref="/"
          actions={actions}
          menuAction={
            !user && (
              <button
                type="button"
                onClick={register}
                className={`${primaryButtonClass} w-full px-6 py-3 text-base sm:hidden`}
              >
                Regístrate
              </button>
            )
          }
        />
        <main id="contenido" className="flex flex-1 flex-col">
          {user ? (
            <TestsPanel name={user} />
          ) : (
            <Bienvenida
              onRegister={register}
              onLogin={() => setLoginOpen(true)}
            />
          )}
        </main>
      </div>
      <SiteFooter links={footerLinks} />
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={login}
      />
    </>
  )
}
