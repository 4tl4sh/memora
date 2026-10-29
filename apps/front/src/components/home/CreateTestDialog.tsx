import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Subject } from '@tfm/types'

import { PdfDropzone } from '#/components/home/PdfDropzone'
import {
  CloseIcon,
  LoaderIcon,
  PencilIcon,
  SparklesIcon,
} from '#/components/icons'
import { SUBJECT_LABELS } from '#/components/landing/data'
import { iconButtonClass, primaryButtonClass } from '#/components/ui/buttons'
import { addTest } from '#/lib/tests-storage'
import { QUESTION_COUNTS, generateTest } from '#/server/generate-test'
import type { QuestionType } from '#/server/generate-test'

interface CreateTestDialogProps {
  open: boolean
  onClose: () => void
}

type Step = 'mode' | 'ai'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single', label: 'Respuesta simple' },
  { value: 'multiple', label: 'Respuesta múltiple' },
]

const SUBJECTS = Object.entries(SUBJECT_LABELS) as [Subject, string][]

const modeCardClass =
  'flex w-full items-start gap-4 rounded-2xl border border-neutral-200 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700'

const legendClass =
  'text-sm font-semibold text-neutral-800 dark:text-neutral-100'

// Píldora de radio: el input queda oculto y la etiqueta se pinta según :checked
const radioClass =
  'cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition has-checked:border-marca-600 has-checked:bg-marca-600 has-checked:text-neutral-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-100 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-400 dark:has-checked:text-marca-950'

// Crear test: se elige el modo (manual o con IA) y, con IA, se sube el PDF y las opciones
export function CreateTestDialog({ open, onClose }: CreateTestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<Step>('mode')
  const [file, setFile] = useState<File | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [type, setType] = useState<QuestionType | null>(null)
  const [subject, setSubject] = useState<Subject | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const reset = () => {
    setStep('mode')
    setFile(null)
    setCount(null)
    setType(null)
    setSubject('')
    setLoading(false)
    setError(null)
  }

  // Mientras se genera el test no se deja cerrar
  const close = () => !loading && onClose()

  const canCreate = Boolean(file && count && type && subject)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !count || !type || !subject || loading) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('count', String(count))
      formData.append('type', type)
      formData.append('subject', subject)
      // El servidor extrae el texto y se lo pasa a la IA: aquí solo llegan las preguntas
      const { title, pages, questions } = await generateTest({ data: formData })
      addTest({
        title: title || file.name.replace(/\.pdf$/i, ''),
        subject,
        status: 'private',
        source: { kind: 'pdf', fileName: file.name, pages },
        questions,
      })
      dialogRef.current?.close()
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo generar el test. Inténtalo de nuevo.',
      )
      setLoading(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-crear-test"
      onCancel={(e) => loading && e.preventDefault()}
      onClose={() => {
        reset()
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-auto w-[min(100%-2rem,32rem)] rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="titulo-crear-test"
              className="font-display text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-0"
            >
              Crear test
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {step === 'mode'
                ? '¿Cómo quieres crearlo?'
                : 'Sube tu temario y elige las opciones.'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            className={`-mt-1 -mr-1 ${iconButtonClass} disabled:opacity-50`}
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        {step === 'mode' ? (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled
              className={`${modeCardClass} cursor-not-allowed opacity-60`}
            >
              <PencilIcon className="mt-0.5 size-6 shrink-0 text-neutral-500" />
              <span>
                <span className="flex items-center gap-2 font-semibold text-neutral-950 dark:text-neutral-0">
                  Manual
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    Próximamente
                  </span>
                </span>
                <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">
                  Escribe tú las preguntas una a una.
                </span>
              </span>
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => setStep('ai')}
              className={`${modeCardClass} hover:border-marca-400 hover:bg-marca-50 dark:hover:bg-marca-950/40`}
            >
              <SparklesIcon className="mt-0.5 size-6 shrink-0 text-marca-600 dark:text-marca-300" />
              <span>
                <span className="block font-semibold text-neutral-950 dark:text-neutral-0">
                  Con asistencia de IA
                </span>
                <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">
                  Sube un PDF y la IA te propone las preguntas.
                </span>
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
            <PdfDropzone file={file} disabled={loading} onChange={setFile} />

            {file && (
              <>
                <fieldset disabled={loading}>
                  <legend className={legendClass}>Número de preguntas</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUESTION_COUNTS.map((n) => (
                      <label key={n} className={radioClass}>
                        <input
                          type="radio"
                          name="count"
                          value={n}
                          checked={count === n}
                          onChange={() => setCount(n)}
                          className="sr-only"
                        />
                        {n}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset disabled={loading}>
                  <legend className={legendClass}>Tipo de preguntas</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUESTION_TYPES.map((option) => (
                      <label key={option.value} className={radioClass}>
                        <input
                          type="radio"
                          name="type"
                          value={option.value}
                          checked={type === option.value}
                          onChange={() => setType(option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="crear-materia" className={legendClass}>
                    Materia
                  </label>
                  <select
                    id="crear-materia"
                    value={subject}
                    disabled={loading}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-neutral-0 px-4 py-2.5 text-neutral-950 focus:border-marca-500 focus:ring-2 focus:ring-marca-500/30 focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-0"
                  >
                    <option value="" disabled>
                      Elige una materia
                    </option>
                    {SUBJECTS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <p
                role="alert"
                className="text-sm font-medium text-fallo-700 dark:text-fallo-300"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep('mode')}
                className="text-sm font-semibold text-neutral-600 transition hover:text-marca-700 disabled:opacity-50 dark:text-neutral-300 dark:hover:text-marca-300"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={!canCreate || loading}
                aria-busy={loading}
                className={`${primaryButtonClass} px-6 py-3 text-base ${loading ? 'disabled:opacity-100' : ''}`}
              >
                {loading && (
                  <LoaderIcon className="size-5 motion-safe:animate-spin" />
                )}
                {loading ? 'Generando test…' : 'Crear'}
              </button>
            </div>
            <p aria-live="polite" className="sr-only">
              {loading ? 'Generando test, espera un momento.' : ''}
            </p>
          </form>
        )}
      </div>
    </dialog>
  )
}
