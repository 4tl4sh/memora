import { useEffect, useRef } from 'react'

import { CloseIcon } from '#/components/icons'
import {
  iconButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '#/components/ui/buttons'
import { cn } from '#/lib/utils'

interface ResultDialogProps {
  open: boolean
  correct: number
  total: number
  onClose: () => void
  onReview: () => void
}

// Resultado del test. <dialog> nativo con showModal(), como LoginDialog.
// Escape, pulsar en el fondo y el botón Cerrar llaman a onClose.
export function ResultDialog({
  open,
  correct,
  total,
  onClose,
  onReview,
}: ResultDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const perfect = total > 0 && correct === total
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Confeti si se aciertan todas. El modal vive en la capa superior (top layer) y taparía
  // un canvas normal: el canvas es un popover, que se abre después y queda por encima.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!open || !perfect || !canvas) return
    let cancelled = false
    let reset: (() => void) | undefined
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return
      canvas.showPopover()
      const fire = confetti.create(canvas, {
        resize: true,
        disableForReducedMotion: true,
      })
      reset = fire.reset
      fire({ particleCount: 160, spread: 90, origin: { y: 0.6 } })
    })
    return () => {
      cancelled = true
      reset?.()
      if (canvas.matches(':popover-open')) canvas.hidePopover()
    }
  }, [open, perfect])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-resultado"
      aria-describedby="detalle-resultado"
      onClose={onClose}
      // Pulsar en el fondo (fuera de la tarjeta) también cierra
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%-2rem,26rem)] rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-6 text-center sm:p-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(iconButtonClass, '-mt-2 -mr-2')}
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <p
          className={cn(
            'mx-auto grid size-24 place-items-center rounded-full font-display text-3xl font-bold',
            perfect
              ? 'bg-acierto-100 text-acierto-800 dark:bg-acierto-950/60 dark:text-acierto-200'
              : 'bg-marca-50 text-marca-800 dark:bg-marca-950/60 dark:text-marca-200',
          )}
        >
          {percent}%
        </p>
        <h2
          id="titulo-resultado"
          className="mt-5 font-display text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-0"
        >
          {perfect ? '¡Perfecto!' : 'Test terminado'}
        </h2>
        <p
          id="detalle-resultado"
          className="mt-2 text-neutral-600 dark:text-neutral-400"
        >
          Has acertado{' '}
          <strong className="font-semibold text-neutral-950 dark:text-neutral-0">
            {correct} de {total}
          </strong>{' '}
          {total === 1 ? 'pregunta' : 'preguntas'}.
          {!perfect && ' Repasa las que has fallado y vuelve a intentarlo.'}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onReview}
            className={cn(secondaryButtonClass, 'px-6 py-3')}
          >
            Revisar resultado
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(primaryButtonClass, 'px-6 py-3')}
          >
            Cerrar
          </button>
        </div>
      </div>
      {/* Lienzo del confeti: popover manual a pantalla completa que no recibe clics */}
      <canvas
        ref={canvasRef}
        popover="manual"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 m-0 size-full max-h-none max-w-none border-0 bg-transparent p-0"
      />
    </dialog>
  )
}
