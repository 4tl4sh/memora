import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { checkAnswer } from '@tfm/types'
import type { Answer, Question, Test } from '@tfm/types'

import { SUBJECT_LABELS } from '#/components/landing/data'
import { primaryButtonClass } from '#/components/ui/buttons'
import { ResultDialog } from './ResultDialog'

type Given = Answer['given']

// Cada opción es una tarjeta con el input nativo dentro: teclado y lectores de pantalla gratis
const optionClass =
  'flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 px-4 py-3 transition hover:border-marca-400 has-checked:border-marca-500 has-checked:bg-marca-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-950/40'

const inputClass = 'mt-0.5 size-4 shrink-0 accent-marca-600 dark:accent-marca-400'

// Una pregunta múltiple sin ninguna casilla marcada cuenta como sin responder
const isAnswered = (given: Given | undefined) =>
  given !== undefined && (!Array.isArray(given) || given.length > 0)

const hints: Record<Question['type'], string> = {
  single: 'Elige una respuesta',
  multiple: 'Elige todas las correctas',
  'true-false': 'Verdadero o falso',
}

// Pantalla para realizar un test: preguntas, progreso y botón de finalizar
export function TestRunner({ test }: { test: Test }) {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<number, Given>>({})
  const [correct, setCorrect] = useState<number | null>(null)

  const total = test.questions.length
  const answered = test.questions.filter((q) => isAnswered(answers[q.id])).length
  const allAnswered = total > 0 && answered === total

  const answer = (id: Question['id'], given: Given) =>
    setAnswers((prev) => ({ ...prev, [id]: given }))

  const toggle = (id: Question['id'], index: number) => {
    const current = answers[id]
    const selected = Array.isArray(current) ? current : []
    answer(
      id,
      selected.includes(index)
        ? selected.filter((i) => i !== index)
        : [...selected, index].sort((a, b) => a - b),
    )
  }

  const finish = () =>
    setCorrect(
      test.questions.filter((q) => checkAnswer(q, answers[q.id])).length,
    )

  // Revisar resultado: pendiente, aún no hay pantalla de corrección
  const review = () => {}

  return (
    <section
      aria-labelledby="titulo-test"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-10 sm:px-6 lg:px-8"
    >
      <p className="flex items-center gap-3 text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
        Test #{test.id}
        <span className="rounded-full bg-marca-50 px-2.5 py-0.5 font-medium tracking-normal text-marca-800 normal-case dark:bg-marca-950/60 dark:text-marca-200">
          {SUBJECT_LABELS[test.subject] ?? test.subject}
        </span>
      </p>
      <h1
        id="titulo-test"
        className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 motion-safe:animate-aparecer sm:text-4xl dark:text-neutral-0"
      >
        {test.title}
      </h1>

      <ol className="mt-8 flex flex-col gap-6">
        {test.questions.map((question, n) => {
          const given = answers[question.id]
          const name = `pregunta-${question.id}`
          return (
            <li key={question.id}>
              <fieldset className="rounded-3xl border border-neutral-200 bg-neutral-0 p-5 sm:p-6 dark:border-neutral-700 dark:bg-neutral-900">
                {/* float evita que la leyenda se pinte sobre el borde del fieldset */}
                <legend className="float-left w-full">
                  <span className="block text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    Pregunta {n + 1} de {total} · {hints[question.type]}
                  </span>
                  <span className="mt-2 block font-semibold text-pretty text-neutral-950 dark:text-neutral-0">
                    {question.statement}
                  </span>
                </legend>
                <div className="clear-both flex flex-col gap-2 pt-4">
                  {question.type === 'true-false'
                    ? [true, false].map((value) => (
                        <label key={String(value)} className={optionClass}>
                          <input
                            type="radio"
                            name={name}
                            checked={given === value}
                            onChange={() => answer(question.id, value)}
                            className={inputClass}
                          />
                          {value ? 'Verdadero' : 'Falso'}
                        </label>
                      ))
                    : question.options.map((option, index) => (
                        <label key={index} className={optionClass}>
                          {question.type === 'single' ? (
                            <input
                              type="radio"
                              name={name}
                              checked={given === index}
                              onChange={() => answer(question.id, index)}
                              className={inputClass}
                            />
                          ) : (
                            <input
                              type="checkbox"
                              name={name}
                              checked={Array.isArray(given) && given.includes(index)}
                              onChange={() => toggle(question.id, index)}
                              className={inputClass}
                            />
                          )}
                          {option}
                        </label>
                      ))}
                </div>
              </fieldset>
            </li>
          )
        })}
      </ol>

      {/* Barra fija abajo: progreso y botón de finalizar siempre a mano */}
      <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/90">
        <p
          aria-live="polite"
          className="text-sm text-neutral-600 dark:text-neutral-400"
        >
          <strong className="font-semibold text-neutral-950 dark:text-neutral-0">
            {answered} de {total}
          </strong>{' '}
          respondidas
        </p>
        <button
          type="button"
          onClick={finish}
          disabled={!allAnswered}
          className={`${primaryButtonClass} px-6 py-3`}
        >
          Finalizar test
        </button>
      </div>

      <ResultDialog
        open={correct !== null}
        correct={correct ?? 0}
        total={total}
        onReview={review}
        onClose={() => navigate({ to: '/' })}
      />
    </section>
  )
}
