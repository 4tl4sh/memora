import { useEffect, useRef, useState } from 'react'

import { LogOutIcon, UserIcon } from '#/components/icons'

interface UserMenuProps {
  name: string
  onLogout: () => void
}

// Icono de cuenta con un desplegable para cerrar sesión
export function UserMenu({ name, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      {/* Aparece justo tras el login: el foco pasa aquí desde el botón "Entrar", que ya no existe */}
      <button
        ref={buttonRef}
        type="button"
        autoFocus
        aria-expanded={open}
        aria-controls="menu-usuario"
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-full bg-marca-600 text-neutral-0 transition hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
      >
        <UserIcon className="size-5" />
        <span className="sr-only">Cuenta de {name}</span>
      </button>
      <div
        id="menu-usuario"
        hidden={!open}
        className="absolute top-full right-0 z-10 mt-2 w-60 rounded-2xl border border-neutral-200 bg-neutral-0 p-2 shadow-xl motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900"
      >
        <p className="px-3 pt-2 pb-3 text-sm text-neutral-600 dark:text-neutral-300">
          Sesión iniciada como{' '}
          <strong className="block truncate font-semibold text-neutral-950 dark:text-neutral-0">
            {name}
          </strong>
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onLogout()
          }}
          className="flex w-full items-center gap-3 rounded-xl border-t border-neutral-200 px-3 py-2.5 text-left text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-marca-300"
        >
          <LogOutIcon className="size-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
