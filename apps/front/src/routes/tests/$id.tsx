import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { SparklesIcon } from '#/components/icons'
import { SiteFooter } from '#/components/layout/SiteFooter'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { UserMenu } from '#/components/layout/UserMenu'
import { appFooterLinks } from '#/components/layout/nav-links'
import { TestRunner } from '#/components/test/TestRunner'
import { primaryButtonClass } from '#/components/ui/buttons'
import { clearUser, useUser } from '#/lib/session-storage'
import { useTest } from '#/lib/tests-storage'

export const Route = createFileRoute('/tests/$id')({
  head: () => ({
    meta: [{ title: 'Realizar test · Memora' }],
  }),
  component: TestPage,
})

function TestPage() {
  const { id } = Route.useParams()
  // Los tests viven en localStorage: en el servidor y antes de hidratar no hay ninguno
  const test = useTest(Number(id))
  const user = useUser()
  const navigate = useNavigate()

  const logout = () => {
    clearUser()
    navigate({ to: '/' })
  }

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          links={[]}
          homeHref="/"
          actions={user && <UserMenu name={user} onLogout={logout} />}
        />
        <main id="contenido" className="flex flex-1 flex-col">
          {test ? (
            // key: al pasar de un test a otro se empiezan de cero las respuestas
            <TestRunner key={test.id} test={test} />
          ) : (
            <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid min-h-72 flex-1 place-items-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-0/60 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
                <div className="flex flex-col items-center">
                  <SparklesIcon className="size-8 text-marca-600 dark:text-marca-300" />
                  <h1 className="mt-3 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
                    No encontramos este test
                  </h1>
                  <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
                    Puede que lo hayas borrado o que se creara en otro
                    navegador.
                  </p>
                  <Link to="/" className={`${primaryButtonClass} mt-5`}>
                    Volver a tus tests
                  </Link>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
      <SiteFooter links={appFooterLinks} />
    </>
  )
}
