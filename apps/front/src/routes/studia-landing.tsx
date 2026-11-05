import { createFileRoute } from '@tanstack/react-router'

import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { ComoFunciona } from '#/components/landing/ComoFunciona'
import { Cta } from '#/components/landing/Cta'
import { Ejemplos } from '#/components/landing/Ejemplos'
import { Faq } from '#/components/landing/Faq'
import { Hero } from '#/components/landing/Hero'
import { Opiniones } from '#/components/landing/Opiniones'
import { Planes } from '#/components/landing/Planes'

// Landing pública: las llamadas a empezar llevan a la aplicación, donde se entra o se registra
const APP_HREF = '/studia/'

export const Route = createFileRoute('/studia-landing')({
  head: () => ({
    meta: [
      { title: 'Studia · Convierte tu temario en tests' },
      {
        name: 'description',
        content:
          'Sube tus apuntes, la IA te propone un test y lo repasas en el móvil hasta que te lo sepas. Empieza gratis.',
      },
    ],
  }),
  component: StudiaLanding,
})

function StudiaLanding() {
  return (
    <>
      <SiteHeader homeHref="/studia-landing/" startHref={APP_HREF} />
      <main id="contenido">
        <Hero startHref={APP_HREF} />
        <Ejemplos tryHref={APP_HREF} />
        <ComoFunciona />
        <Opiniones />
        <Planes />
        <Faq />
        <Cta startHref={APP_HREF} />
      </main>
      <SiteFooter />
    </>
  )
}
