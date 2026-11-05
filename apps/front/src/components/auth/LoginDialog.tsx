import { useEffect, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { TextField } from '#/components/auth/TextField'
import {
  formErrorClass,
  linkButtonClass,
  submitClass,
} from '#/components/auth/form-classes'
import { CloseIcon } from '#/components/icons'
import { focusFirstInvalid } from '#/lib/forms'
import { loginSchema } from '#/lib/schemas'
import type { LoginValues } from '#/lib/schemas'
import { authenticate } from '#/lib/users-storage'
import type { StoredUser } from '#/lib/users-storage'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  onLogin: (user: StoredUser) => void
  onSwitchToRegister: () => void
}

// Login: solo entran los usuarios registrados (studia_users) con su email y contraseña.
// <dialog> nativo con showModal(): atrapa el foco, se cierra con Escape y devuelve el foco al salir.
export function LoginDialog({
  open,
  onClose,
  onLogin,
  onSwitchToRegister,
}: LoginDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const defaultValues: LoginValues = { email: '', password: '' }

  // TanStack Form con el esquema de Zod: valida al escribir y al enviar
  const form = useForm({
    defaultValues,
    validators: { onChange: loginSchema, onSubmit: loginSchema },
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: ({ value }) => {
      const user = authenticate(value.email, value.password)
      if (!user) {
        setError('Email o contraseña incorrectos.')
        return
      }
      // Se cierra ya, antes de que el padre pinte el menú de usuario: mientras el modal
      // está abierto el resto de la página es inerte y no podría recibir el foco
      dialogRef.current?.close()
      onLogin(user)
    },
  })

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-login"
      // Escape y close() disparan "close": se limpia el formulario y se avisa al padre
      onClose={() => {
        form.reset()
        setError(null)
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
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          // Al corregir los datos desaparece el aviso de credenciales incorrectas
          onInput={() => setError(null)}
          className="mt-6 flex flex-col gap-4"
        >
          <form.Field name="email">
            {(field) => (
              <TextField
                field={field}
                id="login-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="lucia@correo.com"
              />
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <TextField
                field={field}
                id="login-password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
              />
            )}
          </form.Field>
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
          <button type="submit" className={submitClass}>
            Entrar
          </button>
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className={linkButtonClass}
            >
              Regístrate
            </button>
          </p>
        </form>
      </div>
    </dialog>
  )
}
