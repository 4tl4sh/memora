import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Question, Subject, Test } from '@tfm/types'

import { CloseIcon, PlusIcon, TrashIcon } from '#/components/icons'
import { SUBJECT_LABELS } from '#/components/landing/data'
import {
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '#/components/ui/buttons'
import { inputBaseClass } from '#/components/ui/inputs'
import { Select } from '#/components/ui/Select'

const SUBJECTS = Object.entries(SUBJECT_LABELS) as [Subject, string][]

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const TYPE_LABELS: Record<Question['type'], string> = {
  single: 'Respuesta simple',
  multiple: 'Respuesta múltiple',
  'true-false': 'Verdadero o falso',
}

// Chip de tipo de pregunta: el radio queda oculto y la etiqueta se pinta según :checked
const chipClass =
  'cursor-pointer rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-800 transition hover:border-marca-400 has-checked:border-marca-600 has-checked:bg-marca-600 has-checked:text-neutral-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:text-neutral-100 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-400 dark:has-checked:text-marca-950'

// Botón de borrar pregunta: como iconButtonClass pero con hover rojo en icono y fondo
const deleteButtonClass =
  'grid size-10 shrink-0 place-items-center rounded-full text-neutral-600 transition hover:bg-fallo-50 hover:text-fallo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fallo-500 dark:text-neutral-300 dark:hover:bg-fallo-950/40 dark:hover:text-fallo-300'

const labelClass =
  'text-sm font-semibold text-neutral-800 dark:text-neutral-100'
const fieldClass = `${inputBaseClass} mt-1.5 px-4`
const errorClass = 'mt-2 text-sm font-medium text-fallo-700 dark:text-fallo-300'

// Pregunta en edición: todo lo que puede teclear el usuario, sea cual sea el tipo.
// Al guardar se convierte en la Question de @tfm/types que corresponda.
interface Draft {
  key: number
  type: Question['type']
  statement: string
  options: string[]
  correct: number[] // índices marcados como correctos (simple y múltiple)
  truth: boolean // respuesta de verdadero o falso
  explanation: string
}

const emptyDraft = (key: number): Draft => ({
  key,
  type: 'single',
  statement: '',
  options: ['', '', ''],
  correct: [],
  truth: true,
  explanation: '',
})

const toDraft = (question: Question, key: number): Draft => {
  const base = {
    key,
    statement: question.statement,
    explanation: question.explanation ?? '',
  }
  switch (question.type) {
    case 'single':
      return {
        ...base,
        type: 'single',
        options: question.options,
        correct: [question.correctIndex],
        truth: true,
      }
    case 'multiple':
      return {
        ...base,
        type: 'multiple',
        options: question.options,
        correct: question.correctIndexes,
        truth: true,
      }
    case 'true-false':
      return {
        ...base,
        type: 'true-false',
        options: ['', '', ''],
        correct: [],
        truth: question.correct,
      }
  }
}

const toQuestion = (draft: Draft, id: number): Question => {
  const base = {
    id,
    statement: draft.statement.trim(),
    ...(draft.explanation.trim() && { explanation: draft.explanation.trim() }),
  }
  switch (draft.type) {
    case 'single':
      return {
        ...base,
        type: 'single',
        options: draft.options.map((o) => o.trim()),
        correctIndex: draft.correct[0],
      }
    case 'multiple':
      return {
        ...base,
        type: 'multiple',
        options: draft.options.map((o) => o.trim()),
        correctIndexes: [...draft.correct].sort((a, b) => a - b),
      }
    case 'true-false':
      return { ...base, type: 'true-false', correct: draft.truth }
  }
}

// Mensaje del primer problema de una pregunta, o null si está bien
const problemOf = (draft: Draft): string | null => {
  if (!draft.statement.trim()) return 'Escribe el enunciado.'
  if (draft.type === 'true-false') return null
  if (draft.options.some((o) => !o.trim()))
    return 'Rellena todas las opciones o quita las vacías.'
  if (draft.correct.length === 0)
    return draft.type === 'single'
      ? 'Marca cuál es la respuesta correcta.'
      : 'Marca al menos una respuesta correcta.'
  return null
}

export interface TestFormData {
  title: string
  subject: Subject
  // Solo viene si se pueden editar las preguntas (tests manuales)
  questions?: Question[]
}

interface TestFormProps {
  heading: string
  // Test que se edita; sin él, se crea uno nuevo
  initial?: Test
  submitLabel: string
  onSubmit: (data: TestFormData) => void
  onCancel: () => void
}

// Formulario de test manual: título, materia y preguntas. Los tests de IA solo permiten
// cambiar título y materia: sus explicaciones y su origen (PDF) dependen de las preguntas.
export function TestForm({
  heading,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: TestFormProps) {
  const editableQuestions = !initial || initial.source.kind === 'Manual'
  const nextKey = useRef(0)
  const newKey = () => nextKey.current++

  const [title, setTitle] = useState(initial?.title ?? '')
  const [subject, setSubject] = useState<Subject | ''>(initial?.subject ?? '')
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    initial
      ? initial.questions.map((q) => toDraft(q, newKey()))
      : [emptyDraft(newKey())],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Pregunta recién añadida: al pintarse, el foco va a su enunciado
  const [focusKey, setFocusKey] = useState<number | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (focusKey === null) return
    document.getElementById(`pregunta-${focusKey}-enunciado`)?.focus()
    setFocusKey(null)
  }, [focusKey])

  const update = (key: number, changes: Partial<Draft>) =>
    setDrafts((all) =>
      all.map((d) => (d.key === key ? { ...d, ...changes } : d)),
    )

  const changeType = (draft: Draft, type: Question['type']) =>
    update(draft.key, {
      type,
      // Pasar a simple deja solo una marcada
      correct: type === 'single' ? draft.correct.slice(0, 1) : draft.correct,
    })

  const addQuestion = () => {
    const key = newKey()
    setDrafts((all) => [...all, emptyDraft(key)])
    setFocusKey(key)
  }

  const removeQuestion = (key: number) => {
    setDrafts((all) => all.filter((d) => d.key !== key))
    addButtonRef.current?.focus()
  }

  const addOption = (draft: Draft) =>
    update(draft.key, { options: [...draft.options, ''] })

  const removeOption = (draft: Draft, index: number) =>
    update(draft.key, {
      options: draft.options.filter((_, i) => i !== index),
      // Los índices posteriores se desplazan una posición
      correct: draft.correct
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i)),
    })

  const toggleCorrect = (draft: Draft, index: number) =>
    update(draft.key, {
      correct:
        draft.type === 'single'
          ? [index]
          : draft.correct.includes(index)
            ? draft.correct.filter((i) => i !== index)
            : [...draft.correct, index],
    })

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found: Record<string, string> = {}
    if (!title.trim()) found.title = 'Escribe un título.'
    if (!subject) found.subject = 'Elige una materia.'
    if (editableQuestions) {
      if (drafts.length === 0) found.list = 'Añade al menos una pregunta.'
      for (const draft of drafts) {
        const problem = problemOf(draft)
        if (problem) found[`q${draft.key}`] = problem
      }
    }
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      const target =
        first === 'title'
          ? 'manual-titulo'
          : first === 'subject'
            ? 'manual-materia'
            : first === 'list'
              ? null
              : `pregunta-${first.slice(1)}-enunciado`
      if (target) document.getElementById(target)?.focus()
      else addButtonRef.current?.focus()
      return
    }
    onSubmit({
      title: title.trim(),
      subject: subject as Subject,
      ...(editableQuestions && {
        questions: drafts.map((d, i) => toQuestion(d, i + 1)),
      }),
    })
  }

  return (
    <section
      aria-labelledby="titulo-formulario"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-10 sm:px-6 lg:px-8"
    >
      <h1
        id="titulo-formulario"
        className="font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-neutral-0"
      >
        {heading}
      </h1>

      <form noValidate onSubmit={submit} className="mt-8 flex flex-1 flex-col">
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <div>
            <label htmlFor="manual-titulo" className={labelClass}>
              Título
            </label>
            <input
              id="manual-titulo"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? 'manual-titulo-error' : undefined
              }
              placeholder="Ej. La Revolución Francesa"
              className={fieldClass}
            />
            {errors.title && (
              <p id="manual-titulo-error" className={errorClass}>
                {errors.title}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="manual-materia" className={labelClass}>
              Materia
            </label>
            <Select
              id="manual-materia"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? 'manual-materia-error' : undefined
              }
            >
              <option value="" disabled>
                Elige una materia
              </option>
              {SUBJECTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.subject && (
              <p id="manual-materia-error" className={errorClass}>
                {errors.subject}
              </p>
            )}
          </div>
        </div>

        {!editableQuestions && (
          <p className="mt-6 rounded-2xl bg-marca-50 px-4 py-3 text-sm text-marca-900 dark:bg-marca-950/60 dark:text-marca-100">
            Este test se generó con IA, así que sus preguntas no se pueden
            editar: las explicaciones y el origen del PDF dependen de ellas.
            Puedes cambiar el título y la materia, o duplicarlo como manual
            desde el panel para retocar las preguntas.
          </p>
        )}

        {editableQuestions && (
          <>
            <ol className="mt-8 flex flex-col gap-6">
              {drafts.map((draft, n) => {
                const base = `pregunta-${draft.key}`
                const error = errors[`q${draft.key}`]
                return (
                  <li key={draft.key}>
                    <fieldset
                      aria-describedby={error ? `${base}-error` : undefined}
                      className="rounded-3xl border border-neutral-200 bg-neutral-0 p-5 sm:p-6 dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <legend className="sr-only">Pregunta {n + 1}</legend>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                          Pregunta {n + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeQuestion(draft.key)}
                          className={deleteButtonClass}
                        >
                          <TrashIcon className="size-5" />
                          <span className="sr-only">
                            Borrar la pregunta {n + 1}
                          </span>
                        </button>
                      </div>
                      <fieldset className="mt-1">
                        <legend className="sr-only">
                          Tipo de la pregunta {n + 1}
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(TYPE_LABELS).map(([value, label]) => (
                            <label key={value} className={chipClass}>
                              <input
                                type="radio"
                                name={`${base}-tipo`}
                                value={value}
                                checked={draft.type === value}
                                onChange={() =>
                                  changeType(draft, value as Question['type'])
                                }
                                className="sr-only"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <label
                        htmlFor={`${base}-enunciado`}
                        className={`${labelClass} mt-4 block`}
                      >
                        Enunciado
                      </label>
                      <textarea
                        id={`${base}-enunciado`}
                        rows={2}
                        value={draft.statement}
                        onChange={(e) =>
                          update(draft.key, { statement: e.target.value })
                        }
                        className={fieldClass}
                      />

                      {draft.type === 'true-false' ? (
                        <fieldset className="mt-4">
                          <legend className={labelClass}>
                            Respuesta correcta
                          </legend>
                          <div className="mt-2 flex gap-3">
                            {[true, false].map((value) => (
                              <label
                                key={String(value)}
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold has-checked:border-marca-600 has-checked:bg-marca-50 dark:border-neutral-700 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-950/40"
                              >
                                <input
                                  type="radio"
                                  name={`${base}-verdad`}
                                  checked={draft.truth === value}
                                  onChange={() =>
                                    update(draft.key, { truth: value })
                                  }
                                  className="size-4 accent-marca-600 dark:accent-marca-400"
                                />
                                {value ? 'Verdadero' : 'Falso'}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ) : (
                        <fieldset className="mt-4">
                          <legend className={labelClass}>
                            Opciones{' '}
                            <span className="font-normal text-neutral-500 dark:text-neutral-400">
                              (marca{' '}
                              {draft.type === 'single'
                                ? 'la correcta'
                                : 'las correctas'}
                              )
                            </span>
                          </legend>
                          <ul className="mt-2 flex flex-col gap-2">
                            {draft.options.map((option, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type={
                                    draft.type === 'single'
                                      ? 'radio'
                                      : 'checkbox'
                                  }
                                  name={`${base}-correcta`}
                                  checked={draft.correct.includes(index)}
                                  onChange={() => toggleCorrect(draft, index)}
                                  aria-label={`Opción ${index + 1} correcta`}
                                  className="size-4 shrink-0 accent-marca-600 dark:accent-marca-400"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    update(draft.key, {
                                      options: draft.options.map((o, i) =>
                                        i === index ? e.target.value : o,
                                      ),
                                    })
                                  }
                                  aria-label={`Texto de la opción ${index + 1}`}
                                  className={`${inputBaseClass} px-4`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(draft, index)}
                                  disabled={draft.options.length <= MIN_OPTIONS}
                                  className={`${iconButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                                >
                                  <CloseIcon className="size-4" />
                                  <span className="sr-only">
                                    Quitar la opción {index + 1}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                          {draft.options.length < MAX_OPTIONS && (
                            <button
                              type="button"
                              onClick={() => addOption(draft)}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-marca-700 transition hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-marca-300 dark:hover:bg-marca-950/40"
                            >
                              <PlusIcon className="size-4" />
                              Añadir opción
                            </button>
                          )}
                        </fieldset>
                      )}

                      <label
                        htmlFor={`${base}-explicacion`}
                        className={`${labelClass} mt-4 block`}
                      >
                        Explicación{' '}
                        <span className="font-normal text-neutral-500 dark:text-neutral-400">
                          (opcional, se muestra al revisar)
                        </span>
                      </label>
                      <input
                        id={`${base}-explicacion`}
                        type="text"
                        value={draft.explanation}
                        onChange={(e) =>
                          update(draft.key, { explanation: e.target.value })
                        }
                        className={fieldClass}
                      />
                      {error && (
                        <p
                          id={`${base}-error`}
                          role="alert"
                          className={errorClass}
                        >
                          {error}
                        </p>
                      )}
                    </fieldset>
                  </li>
                )
              })}
            </ol>
            {errors.list && (
              <p role="alert" className={errorClass}>
                {errors.list}
              </p>
            )}
            <button
              ref={addButtonRef}
              type="button"
              onClick={addQuestion}
              className={`${secondaryButtonClass} mt-6 gap-2 self-center`}
            >
              <PlusIcon className="size-4" />
              Añadir pregunta
            </button>
          </>
        )}

        {/* Barra fija abajo, como en la pantalla de hacer el test */}
        <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/90">
          <button
            type="button"
            onClick={onCancel}
            className={`${secondaryButtonClass} px-5 py-3`}
          >
            Cancelar
          </button>
          <button type="submit" className={`${primaryButtonClass} px-6 py-3`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  )
}
