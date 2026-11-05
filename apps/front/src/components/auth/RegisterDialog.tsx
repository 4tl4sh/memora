import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  errorClass,
  formErrorClass,
  inputClass,
  labelClass,
  linkButtonClass,
  submitClass,
} from '#/components/auth/form-classes'
import { CloseIcon } from '#/components/icons'
import { registerUser } from '#/lib/users-storage'
import type { StoredUser } from '#/lib/users-storage'

interface RegisterDialogProps {
  open: boolean
  onClose: () => void
  onRegister: (user: StoredUser) => void
  onSwitchToLogin: () => void
}

const MIN_PASSWORD = 6

// Registro: crea el usuario en localStorage (studia_users) y entra directamente.
// Mismo <dialog> nativo que LoginDialog.
export function RegisterDialog({
  open,
  onClose,
  onRegister,
  onSwitchToLogin,
}: RegisterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)

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
    const data = new FormData(form)
    const result = registerUser({
      name: data.get('nombre') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
    })
    if (!result.ok) {
      setError('Ya existe una cuenta con ese email.')
      form.querySelector<HTMLInputElement>('[name="email"]')?.focus()
      return
    }
    // Igual que en el login: se cierra antes de que el padre cambie la página
    dialogRef.current?.close()
    onRegister(result.user)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-registro"
      onClose={() => {
        formRef.current?.reset()
        setError(null)
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%-2rem,26rem)] rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="titulo-registro"
              className="font-display text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-0"
            >
              Crea tu cuenta
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Convierte tus apuntes en tests en un minuto.
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
          onInput={() => setError(null)}
          className="mt-6 flex flex-col gap-4"
        >
          <div>
            <label htmlFor="registro-nombre" className={labelClass}>
              Nombre
            </label>{' '}
            <input
              id="registro-nombre"
              name="nombre"
              type="text"
              required
              pattern=".*\S.*"
              autoComplete="name"
              placeholder="Lucía"
              className={inputClass}
            />
            <p className={errorClass}>Escribe tu nombre.</p>
          </div>
          <div>
            <label htmlFor="registro-email" className={labelClass}>
              Email
            </label>{' '}
            <input
              id="registro-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="lucia@correo.com"
              className={inputClass}
            />
            <p className={errorClass}>Escribe un email válido.</p>
          </div>
          <div>
            <label htmlFor="registro-password" className={labelClass}>
              Contraseña
            </label>{' '}
            <input
              id="registro-password"
              name="password"
              type="password"
              required
              minLength={MIN_PASSWORD}
              autoComplete="new-password"
              aria-describedby="registro-password-ayuda"
              className={inputClass}
            />
            <p className={errorClass}>
              La contraseña debe tener al menos {MIN_PASSWORD} caracteres.
            </p>
            <p
              id="registro-password-ayuda"
              className="mt-1.5 text-xs text-neutral-500 peer-user-invalid:hidden dark:text-neutral-400"
            >
              Mínimo {MIN_PASSWORD} caracteres.
            </p>
          </div>
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
          <button type="submit" className={submitClass}>
            Crear cuenta
          </button>
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={linkButtonClass}
            >
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </dialog>
  )
}
