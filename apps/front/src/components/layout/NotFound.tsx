import { Link } from '@tanstack/react-router'

import { SparklesIcon } from '#/components/icons'
import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { appFooterLinks } from '#/components/layout/nav-links'
import { primaryButtonClass } from '#/components/ui/buttons'

// Cualquier URL que no coincide con ninguna ruta (notFoundComponent de __root.tsx)
export function NotFound() {
  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader links={[]} homeHref="/studia/" />
        <main id="contenido" className="flex flex-1 flex-col">
          <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid min-h-72 flex-1 place-items-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-0/60 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
              <div className="flex flex-col items-center">
                <SparklesIcon className="size-8 text-marca-600 dark:text-marca-300" />
                <h1 className="mt-3 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
                  Página no encontrada
                </h1>
                <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
                  La dirección no existe o ha cambiado.
                </p>
                <Link to="/studia/" className={`${primaryButtonClass} mt-5`}>
                  Volver al inicio
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
      <SiteFooter links={appFooterLinks} />
    </>
  )
}
