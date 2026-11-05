import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { SparklesIcon } from '#/components/icons'
import { TestForm } from '#/components/test/TestForm'
import { primaryButtonClass } from '#/components/ui/buttons'
import { useUser } from '#/lib/session-storage'
import { editTest, useTest } from '#/lib/tests-storage'

export const Route = createFileRoute('/studia/private/editar/$id')({
  head: () => ({
    meta: [{ title: 'Editar test · Studia' }],
  }),
  component: EditTestPage,
})

function EditTestPage() {
  const { id } = Route.useParams()
  const user = useUser()
  // Solo se encuentra si es del usuario con sesión
  const test = useTest(Number(id), user?.id)
  const navigate = useNavigate()
  const goBack = () => navigate({ to: '/studia/private/' })

  if (!test)
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid min-h-72 flex-1 place-items-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-0/60 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
          <div className="flex flex-col items-center">
            <SparklesIcon className="size-8 text-marca-600 dark:text-marca-300" />
            <h1 className="mt-3 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
              No encontramos este test
            </h1>
            <Link
              to="/studia/private/"
              className={`${primaryButtonClass} mt-5`}
            >
              Volver a tus tests
            </Link>
          </div>
        </div>
      </section>
    )

  return (
    // key: al pasar de un test a otro el formulario empieza con sus datos
    <TestForm
      key={test.id}
      heading="Editar test"
      initial={test}
      submitLabel="Guardar cambios"
      onCancel={goBack}
      onSubmit={({ title, subject, questions }) => {
        editTest(test.id, { title, subject, ...(questions && { questions }) })
        goBack()
      }}
    />
  )
}
