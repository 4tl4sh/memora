import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { subjectSchema } from '@tfm/types'
import type { Subject, Test } from '@tfm/types'

import { ConfirmDeleteDialog } from '#/components/home/ConfirmDeleteDialog'
import { CreateTestDialog } from '#/components/home/CreateTestDialog'
import { TestActionsMenu } from '#/components/home/TestActionsMenu'
import { SearchIcon, SparklesIcon } from '#/components/icons'
import { SUBJECT_LABELS } from '#/components/landing/data'
import { primaryButtonClass } from '#/components/ui/buttons'
import { inputBaseClass } from '#/components/ui/inputs'
import type { SessionUser } from '#/lib/session-storage'
import { deleteTest, useUserTests } from '#/lib/tests-storage'

// Búsqueda sin mayúsculas ni tildes: «quimica» encuentra «Química»
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const SUBJECTS = subjectSchema.options

// Etiqueta de filtro: botón conmutable que se pinta según aria-pressed
const tagClass =
  'cursor-pointer rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-800 transition hover:border-marca-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 aria-pressed:border-marca-600 aria-pressed:bg-marca-600 aria-pressed:text-neutral-0 dark:border-neutral-700 dark:text-neutral-100 dark:aria-pressed:border-marca-400 dark:aria-pressed:bg-marca-400 dark:aria-pressed:text-marca-950'

interface TestsPanelProps {
  user: SessionUser
  // Los filtros viven en la URL (?materia=…&q=…): la ruta los lee y los pasa
  subjectFilter: Subject | null
  query: string
  onSubjectFilterChange: (subject: Subject | null) => void
  onQueryChange: (query: string) => void
}

// Panel del usuario con sesión iniciada: la lista de sus tests
export function TestsPanel({
  user,
  subjectFilter,
  query,
  onSubjectFilterChange,
  onQueryChange,
}: TestsPanelProps) {
  const tests = useUserTests(user.id)
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Test | null>(null)

  // Solo se ofrecen las materias que tiene algún test, en el orden de SUBJECT_LABELS
  const usedSubjects = new Set(tests.map((test) => test.subject))
  const availableSubjects = SUBJECTS.filter((s) => usedSubjects.has(s))
  // Si se borra el último test de la materia filtrada, se vuelve a «Todos»
  const activeFilter =
    subjectFilter && usedSubjects.has(subjectFilter) ? subjectFilter : null
  const search = normalize(query)
  const visibleTests = tests.filter(
    (test) =>
      (!activeFilter || test.subject === activeFilter) &&
      (!search || normalize(test.title).includes(search)),
  )
  const startTest = (test: Test) =>
    navigate({ to: '/tests/$id', params: { id: String(test.id) } })

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
        Hola, {user.name}
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
        <>
          <div className="mt-4 flex flex-col gap-3">
            <div role="search" className="relative sm:w-72 sm:shrink-0">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                aria-label="Buscar test por título"
                placeholder="Buscar por título…"
                className={`${inputBaseClass} pr-4 pl-11`}
              />
            </div>
            <div
              role="group"
              aria-label="Filtrar por materia"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={activeFilter === null}
                onClick={() => onSubjectFilterChange(null)}
                className={tagClass}
              >
                Todos
              </button>
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  aria-pressed={activeFilter === subject}
                  onClick={() =>
                    onSubjectFilterChange(
                      activeFilter === subject ? null : subject,
                    )
                  }
                  className={tagClass}
                >
                  {SUBJECT_LABELS[subject]}
                </button>
              ))}
            </div>
          </div>
          {visibleTests.length === 0 && (
            <p
              role="status"
              className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-0 p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              Ningún test coincide con tu búsqueda.
            </p>
          )}
          <ul
            hidden={visibleTests.length === 0}
            className="mt-4 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-neutral-0 dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {visibleTests.map((test) => (
              <li
                key={test.id}
                className="flex items-center gap-4 px-4 py-3 sm:px-6"
              >
                <span className="w-10 shrink-0 font-mono text-sm text-neutral-500 dark:text-neutral-400">
                  #{test.id}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={() => startTest(test)}
                    title="Realizar test"
                    className="min-w-0 flex-1 cursor-pointer truncate rounded-md text-left font-semibold text-neutral-950 transition hover:text-marca-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 dark:hover:text-marca-300"
                  >
                    {test.title}
                  </button>
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
                  onStart={() => startTest(test)}
                  onDelete={() => setToDelete(test)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <CreateTestDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ConfirmDeleteDialog
        open={toDelete !== null}
        title={toDelete?.title ?? ''}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteTest(toDelete.id)
          setToDelete(null)
        }}
      />
    </section>
  )
}
