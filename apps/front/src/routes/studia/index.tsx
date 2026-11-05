import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { LoginDialog } from '#/components/auth/LoginDialog'
import { RegisterDialog } from '#/components/auth/RegisterDialog'
import { ComoFunciona } from '#/components/landing/ComoFunciona'
import { Cta } from '#/components/landing/Cta'
import { Ejemplos } from '#/components/landing/Ejemplos'
import { Faq } from '#/components/landing/Faq'
import { Hero } from '#/components/landing/Hero'
import { Opiniones } from '#/components/landing/Opiniones'
import { Planes } from '#/components/landing/Planes'
import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { UserMenu } from '#/components/layout/UserMenu'
import {
  primaryButtonClass,
  secondaryButtonClass,
} from '#/components/ui/buttons'
import { clearUser, setUser, useUser } from '#/lib/session-storage'
import type { StoredUser } from '#/lib/users-storage'

export const Route = createFileRoute('/studia/')({
  head: () => ({
    meta: [
      { title: 'Studia · Convierte tu temario en tests' },
      {
        name: 'description',
        content:
          'Sube tus apuntes, la IA te propone un test y lo repasas en el móvil hasta que te lo sepas. Regístrate gratis.',
      },
    ],
  }),
  component: Studia,
})

function Studia() {
  // Sesión simulada: se guarda en localStorage (ver session-storage.ts)
  const user = useUser()
  const navigate = useNavigate()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const loginButtonRef = useRef<HTMLButtonElement>(null)

  // Tanto al entrar como al registrarse se inicia sesión y se va a la zona privada
  const enter = (account: StoredUser) => {
    setLoginOpen(false)
    setRegisterOpen(false)
    setUser(account.id)
    navigate({ to: '/studia/private/' })
  }

  const openRegister = () => {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  const openLogin = () => {
    setRegisterOpen(false)
    setLoginOpen(true)
  }

  // Tras cerrar sesión el menú de usuario desaparece: el foco vuelve al botón "Entrar"
  const logout = () => {
    flushSync(() => clearUser())
    loginButtonRef.current?.focus()
  }

  // Con sesión, las llamadas a crear un test llevan directamente a la zona privada
  const startProps = user
    ? { startHref: '/studia/private/' }
    : { onStart: () => setLoginOpen(true) }

  const actions = user ? (
    <UserMenu name={user.name} onLogout={logout} />
  ) : (
    <>
      {/* En móvil no cabe en la barra: va al final del menú (menuAction) */}
      <button
        type="button"
        onClick={openRegister}
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
      <SiteHeader
        homeHref="/studia/"
        actions={actions}
        menuAction={
          !user && (
            <button
              type="button"
              onClick={openRegister}
              className={`${primaryButtonClass} w-full px-6 py-3 text-base sm:hidden`}
            >
              Regístrate
            </button>
          )
        }
      />
      <main id="contenido">
        <Hero {...startProps} />
        <Ejemplos />
        <ComoFunciona />
        <Opiniones />
        <Planes />
        <Faq />
        <Cta {...startProps} />
      </main>
      <SiteFooter />
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={enter}
        onSwitchToRegister={openRegister}
      />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={enter}
        onSwitchToLogin={openLogin}
      />
    </>
  )
}
