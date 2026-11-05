import { useEffect, useRef } from 'react'

import { TrashIcon } from '#/components/icons'
import { secondaryButtonClass } from '#/components/ui/buttons'
import { cn } from '#/lib/utils'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  onConfirm: () => void
  onCancel: () => void
}

const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-fallo-600 px-6 py-3 text-sm font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-fallo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fallo-500 dark:bg-fallo-400 dark:text-fallo-900 dark:hover:bg-fallo-300'

// Confirmación antes de borrar un test. <dialog> nativo con showModal(), como ResultDialog.
// Escape, pulsar en el fondo y Cancelar llaman a onCancel.
export function ConfirmDeleteDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-borrar-test"
      aria-describedby="detalle-borrar-test"
      // Escape: se cancela a mano para que el estado del padre sea la única fuente de verdad
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="m-auto w-[min(100%-2rem,26rem)] rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-6 text-center sm:p-8">
        <p className="mx-auto grid size-14 place-items-center rounded-full bg-fallo-50 text-fallo-700 dark:bg-fallo-900/60 dark:text-fallo-300">
          <TrashIcon className="size-6" />
        </p>
        <h2
          id="titulo-borrar-test"
          className="mt-4 font-display text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-0"
        >
          ¿Borrar test?
        </h2>
        <p
          id="detalle-borrar-test"
          className="mt-2 text-pretty text-neutral-600 dark:text-neutral-400"
        >
          Se borrará{' '}
          <strong className="font-semibold text-neutral-950 dark:text-neutral-0">
            «{title}»
          </strong>
          . Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className={cn(secondaryButtonClass, 'px-6 py-3')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={dangerButtonClass}
          >
            Borrar
          </button>
        </div>
      </div>
    </dialog>
  )
}
