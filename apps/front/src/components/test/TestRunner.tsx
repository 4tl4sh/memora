import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { assertNever, checkAnswer } from '@tfm/types'
import type { Answer, Question, Test } from '@tfm/types'

import { ArrowLeftIcon, CheckIcon, CloseIcon } from '#/components/icons'
import { SUBJECT_LABELS } from '#/components/landing/data'
import {
  primaryButtonClass,
  secondaryButtonClass,
} from '#/components/ui/buttons'
import { cn } from '#/lib/utils'
import { ResultDialog } from './ResultDialog'

type Given = Answer['given']

// Cada opción es una tarjeta con el input nativo dentro: teclado y lectores de pantalla gratis
const optionClass =
  'flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 px-4 py-3 transition hover:border-marca-400 has-checked:border-marca-500 has-checked:bg-marca-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-950/40'

// Al revisar, la opción se pinta según lo que era y lo que marcó el usuario
const reviewOptionClass =
  'flex items-start gap-3 rounded-2xl border px-4 py-3 border-neutral-200 bg-neutral-0 dark:border-neutral-700 dark:bg-neutral-900'
const reviewRightClass =
  'border-acierto-500 bg-acierto-50 dark:border-acierto-500 dark:bg-acierto-950/40'
const reviewWrongClass =
  'border-fallo-500 bg-fallo-50 dark:border-fallo-500 dark:bg-fallo-950/40'

const inputClass =
  'mt-0.5 size-4 shrink-0 accent-marca-600 dark:accent-marca-400'

// Una pregunta múltiple sin ninguna casilla marcada cuenta como sin responder
const isAnswered = (given: Given | undefined) =>
  given !== undefined && (!Array.isArray(given) || given.length > 0)

const typeLabels: Record<Question['type'], string> = {
  single: 'Respuesta simple',
  multiple: 'Respuesta múltiple',
  'true-false': 'Verdadero o falso',
}

const hints: Record<Question['type'], string> = {
  single: 'Elige una respuesta',
  multiple: 'Elige todas las correctas',
  'true-false': 'Elige una respuesta',
}

// Pantalla para realizar un test: preguntas, progreso y botón de finalizar
export function TestRunner({ test }: { test: Test }) {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<number, Given>>({})
  const [correct, setCorrect] = useState<number | null>(null)
  const [reviewing, setReviewing] = useState(false)

  const total = test.questions.length
  const answered = test.questions.filter((q) =>
    isAnswered(answers[q.id]),
  ).length
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

  // Revisar: se cierra el resultado y las preguntas se muestran corregidas
  const review = () => {
    setReviewing(true)
    window.scrollTo({ top: 0 })
  }

  const retry = () => {
    setAnswers({})
    setCorrect(null)
    setReviewing(false)
    window.scrollTo({ top: 0 })
  }

  const goToPanel = () => navigate({ to: '/studia/private/' })

  // Cada opción: si es correcta y si el usuario la marcó
  const optionReview = (
    question: Question,
    index: number,
    given: Given | undefined,
  ) => {
    switch (question.type) {
      case 'single':
        return {
          right: index === question.correctIndex,
          picked: given === index,
        }
      case 'multiple':
        return {
          right: question.correctIndexes.includes(index),
          picked: Array.isArray(given) && given.includes(index),
        }
      case 'true-false':
        // index 0 = Verdadero, 1 = Falso
        return {
          right: question.correct === (index === 0),
          picked: given === (index === 0),
        }
      default:
        // Si mañana se añade un tipo de pregunta, TypeScript avisa aquí
        return assertNever(question)
    }
  }

  return (
    <section
      aria-labelledby="titulo-test"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-10 sm:px-6 lg:px-8"
    >
      <Link
        to="/studia/private/"
        className={`${secondaryButtonClass} mb-6 gap-2 self-start`}
      >
        <ArrowLeftIcon className="size-4" />
        Atrás
      </Link>
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
          const isRight = reviewing && checkAnswer(question, given)
          return (
            <li key={question.id}>
              <fieldset
                disabled={reviewing}
                className={cn(
                  'rounded-3xl border bg-neutral-0 p-5 sm:p-6 dark:bg-neutral-900',
                  !reviewing && 'border-neutral-200 dark:border-neutral-700',
                  reviewing &&
                    (isRight
                      ? 'border-acierto-500 dark:border-acierto-500'
                      : 'border-fallo-500 dark:border-fallo-500'),
                )}
              >
                {/* float evita que la leyenda se pinte sobre el borde del fieldset */}
                <legend className="float-left w-full">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    Pregunta {n + 1} de {total}
                    <span className="rounded-full bg-marca-50 px-2.5 py-0.5 font-medium text-marca-800 dark:bg-marca-950/60 dark:text-marca-200">
                      {typeLabels[question.type]}
                    </span>
                    {reviewing ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold',
                          isRight
                            ? 'bg-acierto-100 text-acierto-800 dark:bg-acierto-950/60 dark:text-acierto-200'
                            : 'bg-fallo-100 text-fallo-800 dark:bg-fallo-950/60 dark:text-fallo-200',
                        )}
                      >
                        {isRight ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <CloseIcon className="size-4" />
                        )}
                        {isRight ? 'Acertada' : 'Fallada'}
                      </span>
                    ) : (
                      <span className="font-normal">
                        {hints[question.type]}
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block font-semibold text-pretty text-neutral-950 dark:text-neutral-0">
                    {question.statement}
                  </span>
                </legend>
                <div className="clear-both flex flex-col gap-2 pt-4">
                  {(question.type === 'true-false'
                    ? ['Verdadero', 'Falso']
                    : question.options
                  ).map((option, index) => {
                    const value = index === 0 // solo para verdadero/falso
                    const review = reviewing
                      ? optionReview(question, index, given)
                      : null
                    const control =
                      question.type === 'multiple' ? (
                        <input
                          type="checkbox"
                          name={name}
                          checked={
                            Array.isArray(given) && given.includes(index)
                          }
                          onChange={() => toggle(question.id, index)}
                          className={inputClass}
                        />
                      ) : (
                        <input
                          type="radio"
                          name={name}
                          checked={
                            question.type === 'true-false'
                              ? given === value
                              : given === index
                          }
                          onChange={() =>
                            answer(
                              question.id,
                              question.type === 'true-false' ? value : index,
                            )
                          }
                          className={inputClass}
                        />
                      )
                    return (
                      <label
                        key={index}
                        className={
                          review
                            ? cn(
                                reviewOptionClass,
                                review.right && reviewRightClass,
                                review.picked &&
                                  !review.right &&
                                  reviewWrongClass,
                              )
                            : optionClass
                        }
                      >
                        {control}
                        <span className="flex-1">{option}</span>
                        {review?.right && (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-acierto-700 dark:text-acierto-200">
                            <CheckIcon className="size-4" />
                            {review.picked ? 'Tu respuesta' : 'Correcta'}
                          </span>
                        )}
                        {review?.picked && !review.right && (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-fallo-700 dark:text-fallo-200">
                            <CloseIcon className="size-4" />
                            Tu respuesta
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
                {reviewing && question.explanation && (
                  <p className="mt-4 rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <strong className="font-semibold">Explicación:</strong>{' '}
                    {question.explanation}
                  </p>
                )}
              </fieldset>
            </li>
          )
        })}
      </ol>

      {/* Barra fija abajo: progreso y botón de finalizar siempre a mano */}
      <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/90">
        {reviewing ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <strong className="font-semibold text-neutral-950 dark:text-neutral-0">
                {correct} de {total}
              </strong>{' '}
              correctas
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={retry}
                className={`${secondaryButtonClass} px-5 py-3`}
              >
                Repetir test
              </button>
              <button
                type="button"
                onClick={goToPanel}
                className={`${primaryButtonClass} px-5 py-3`}
              >
                Volver a tus tests
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <ResultDialog
        open={correct !== null && !reviewing}
        correct={correct ?? 0}
        total={total}
        onReview={review}
        // Al pasar a revisar el diálogo se cierra solo: eso no debe sacarnos de la página
        onClose={() => !reviewing && goToPanel()}
      />
    </section>
  )
}
