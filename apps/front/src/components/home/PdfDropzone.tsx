import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

import { CloseIcon, FileUpIcon } from '#/components/icons'
import { iconButtonClass, secondaryButtonClass } from '#/components/ui/buttons'
import { MAX_PDF_BYTES, isPdf } from '#/lib/pdf'

interface PdfDropzoneProps {
  file: File | null
  disabled?: boolean
  onChange: (file: File | null) => void
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const validate = (file: File) => {
  if (!isPdf(file)) return 'El fichero tiene que ser un PDF.'
  if (file.size > MAX_PDF_BYTES) return 'El PDF no puede pesar más de 5 MB.'
  return null
}

// Zona para subir el temario: con el botón o soltando el PDF encima
export function PdfDropzone({ file, disabled, onChange }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = (picked: File | undefined) => {
    if (!picked) return
    const problem = validate(picked)
    setError(problem)
    onChange(problem ? null : picked)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled) pick(e.dataTransfer.files[0])
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-marca-300 bg-marca-50 p-4 dark:border-marca-800 dark:bg-marca-950/40">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-marca-600 text-neutral-0 dark:bg-marca-400 dark:text-marca-950">
          <FileUpIcon className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm">
          <strong className="block truncate font-semibold text-neutral-950 dark:text-neutral-0">
            {file.name}
          </strong>
          <span className="text-neutral-600 dark:text-neutral-400">
            {formatSize(file.size)}
          </span>
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          className={`${iconButtonClass} disabled:opacity-50`}
        >
          <CloseIcon className="size-5" />
          <span className="sr-only">Quitar fichero</span>
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragging
            ? 'border-marca-500 bg-marca-50 dark:bg-marca-950/40'
            : 'border-neutral-300 dark:border-neutral-700'
        }`}
      >
        <FileUpIcon className="size-8 text-marca-600 dark:text-marca-300" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Arrastra aquí tu PDF o
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={secondaryButtonClass}
        >
          Subir fichero
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Solo PDF, hasta 5 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0])
            // Permite volver a elegir el mismo fichero tras un error
            e.target.value = ''
          }}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="mt-2 text-sm font-medium text-fallo-700 dark:text-fallo-300"
        >
          {error}
        </p>
      )}
    </div>
  )
}
