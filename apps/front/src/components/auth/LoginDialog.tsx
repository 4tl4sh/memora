import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

import { CloseIcon } from '#/components/icons'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  onLogin: (name: string) => void
}

const inputClass =
  'peer mt-1.5 block w-full rounded-xl border border-neutral-300 bg-neutral-0 px-4 py-2.5 text-neutral-950 placeholder:text-neutral-400 user-invalid:border-fallo-500 user-invalid:ring-2 user-invalid:ring-fallo-500/20 focus:border-marca-500 focus:ring-2 focus:ring-marca-500/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-0'

const errorClass =
  'mt-1.5 hidden text-sm font-medium text-fallo-700 peer-user-invalid:block dark:text-fallo-300'

// Login simulado: acepta cualquier usuario y contraseña.
// <dialog> nativo con showModal(): atrapa el foco, se cierra con Escape y devuelve el foco al salir.
export function LoginDialog({ open, onClose, onLogin }: LoginDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.querySelector<HTMLInputElement>(':invalid')?.focus()
      return
    }
    const name = new FormData(form).get('usuario') as string
    // Se cierra ya, antes de que el padre pinte el menú de usuario: mientras el modal
    // está abierto el resto de la página es inerte y no podría recibir el foco
    dialogRef.current?.close()
    onLogin(name.trim())
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-login"
      // Escape y close() disparan "close": se limpia el formulario y se avisa al padre
      onClose={() => {
        formRef.current?.reset()
        onClose()
      }}
      // Pulsar en el fondo (fuera de la tarjeta) también cierra
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%-2rem,26rem)] rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="titulo-login"
              className="font-display text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-0"
            >
              Inicia sesión
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Sigue repasando donde lo dejaste.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-0"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          className="mt-6 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="login-usuario"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-100"
            >
              Usuario
            </label>{' '}
            <input
              id="login-usuario"
              name="usuario"
              type="text"
              required
              pattern=".*\S.*"
              autoComplete="username"
              placeholder="lucia"
              className={inputClass}
            />
            <p className={errorClass}>Escribe tu nombre de usuario.</p>
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-neutral-800 dark:text-neutral-100"
            >
              Contraseña
            </label>{' '}
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
            <p className={errorClass}>Escribe tu contraseña.</p>
          </div>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
          >
            Entrar
          </button>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Versión de prueba: vale cualquier usuario y contraseña.
          </p>
        </form>
      </div>
    </dialog>
  )
}
