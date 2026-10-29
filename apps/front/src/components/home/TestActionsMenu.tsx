import { useEffect, useRef, useState } from 'react'

import { MoreVerticalIcon, PlayIcon, TrashIcon } from '#/components/icons'
import { iconButtonClass } from '#/components/ui/buttons'

interface TestActionsMenuProps {
  testId: number
  title: string
  onStart: () => void
  onDelete: () => void
}

const itemClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500'

// Menú de tres puntos de cada fila: realizar o borrar el test
export function TestActionsMenu({
  testId,
  title,
  onStart,
  onDelete,
}: TestActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = `menu-test-${testId}`

  // Se cierra con Escape o al pulsar fuera
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className={iconButtonClass}
      >
        <MoreVerticalIcon className="size-5" />
        <span className="sr-only">Acciones de «{title}»</span>
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute top-full right-0 z-10 mt-2 w-52 rounded-2xl border border-neutral-200 bg-neutral-0 p-2 shadow-xl motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900"
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onStart()
          }}
          className={`${itemClass} text-neutral-800 hover:bg-neutral-100 hover:text-marca-700 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-marca-300`}
        >
          <PlayIcon className="size-5" />
          Realizar test
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onDelete()
          }}
          className={`${itemClass} text-fallo-700 hover:bg-fallo-50 dark:text-fallo-300 dark:hover:bg-fallo-950/40`}
        >
          <TrashIcon className="size-5" />
          Borrar test
        </button>
      </div>
    </div>
  )
}
