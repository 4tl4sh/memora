import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { CreateTestDialog } from '#/components/home/CreateTestDialog'
import { TestActionsMenu } from '#/components/home/TestActionsMenu'
import { SparklesIcon } from '#/components/icons'
import { SUBJECT_LABELS } from '#/components/landing/data'
import { primaryButtonClass } from '#/components/ui/buttons'
import { deleteTest, useTests } from '#/lib/tests-storage'

// Panel del usuario con sesión iniciada: la lista de sus tests
export function TestsPanel({ name }: { name: string }) {
  const tests = useTests()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)

  const openCreate = () => setCreateOpen(true)

  return (
    <section
      aria-labelledby="titulo-panel"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8"
    >
      <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
        Tu panel
      </p>
      <h1
        id="titulo-panel"
        className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 motion-safe:animate-aparecer sm:text-4xl dark:text-neutral-0"
      >
        Hola, {name}
      </h1>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
          Tus tests
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className={primaryButtonClass}
        >
          Crear test
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="mt-4 grid min-h-72 flex-1 place-items-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-0/60 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
          <div className="flex flex-col items-center">
            <SparklesIcon className="size-8 text-marca-600 dark:text-marca-300" />
            <p className="mt-3 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
              Todavía no tienes tests
            </p>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
              Sube tus apuntes en PDF y crea tu primer test para empezar a
              repasar.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className={`${primaryButtonClass} mt-5`}
            >
              Crear mi primer test
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-neutral-0 dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
          {tests.map((test) => (
            <li
              key={test.id}
              className="flex items-center gap-4 px-4 py-3 sm:px-6"
            >
              <span className="w-10 shrink-0 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                #{test.id}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <strong className="min-w-0 flex-1 truncate font-semibold text-neutral-950 dark:text-neutral-0">
                  {test.title}
                </strong>
                <span className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="rounded-full bg-marca-50 px-2.5 py-0.5 font-medium text-marca-800 dark:bg-marca-950/60 dark:text-marca-200">
                    {SUBJECT_LABELS[test.subject] ?? test.subject}
                  </span>
                  <span className="sm:w-24 sm:text-right">
                    {test.questions.length}{' '}
                    {test.questions.length === 1 ? 'pregunta' : 'preguntas'}
                  </span>
                </span>
              </div>
              <TestActionsMenu
                testId={test.id}
                title={test.title}
                onStart={() =>
                  navigate({
                    to: '/tests/$id',
                    params: { id: String(test.id) },
                  })
                }
                onDelete={() => {
                  if (confirm(`¿Borrar el test «${test.title}»?`))
                    deleteTest(test.id)
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateTestDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </section>
  )
}
