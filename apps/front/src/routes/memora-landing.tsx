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

export const Route = createFileRoute('/memora-landing')({
  head: () => ({
    meta: [
      { title: 'Memora · Convierte tu temario en tests' },
      {
        name: 'description',
        content:
          'Sube tus apuntes, la IA te propone un test y lo repasas en el móvil hasta que te lo sepas. Empieza gratis.',
      },
    ],
  }),
  component: MemoraLanding,
})

function MemoraLanding() {
  return (
    <>
      <SiteHeader homeHref="/memora-landing/" />
      <main id="contenido">
        <Hero />
        <Ejemplos />
        <ComoFunciona />
        <Opiniones />
        <Planes />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  )
}
