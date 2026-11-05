import { useEffect, useRef, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'

import { TextField } from '#/components/auth/TextField'
import {
  formErrorClass,
  labelClass,
  linkButtonClass,
  submitClass,
} from '#/components/auth/form-classes'
import { CloseIcon } from '#/components/icons'
import { formatPrice, plans } from '#/components/landing/data'
import { formatCardNumber, formatExpiry } from '#/lib/card'
import { focusFirstInvalid } from '#/lib/forms'
import { MIN_PASSWORD, isPaidPlan, registerSchema } from '#/lib/schemas'
import type { RegisterValues } from '#/lib/schemas'
import { registerUser } from '#/lib/users-storage'
import type { StoredUser } from '#/lib/users-storage'

interface RegisterDialogProps {
  open: boolean
  onClose: () => void
  onRegister: (user: StoredUser) => void
  onSwitchToLogin: () => void
}

const defaultValues: RegisterValues = {
  name: '',
  email: '',
  password: '',
  planId: 'gratis',
  cardNumber: '',
  expiry: '',
  cvv: '',
}

const onlyDigits = (value: string) => value.replace(/\D/g, '')

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

  // TanStack Form con el esquema de Zod: valida al escribir y al enviar
  const form = useForm({
    defaultValues,
    validators: { onChange: registerSchema, onSubmit: registerSchema },
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: ({ value }) => {
      // parse aplica las transformaciones del esquema (trim del nombre y del email).
      // La tarjeta solo se valida: no se guarda en ningún sitio
      const { name, email, password, planId } = registerSchema.parse(value)
      const result = registerUser({ name, email, password, planId })
      if (!result.ok) {
        setError('Ya existe una cuenta con ese email.')
        formRef.current
          ?.querySelector<HTMLInputElement>('[name="email"]')
          ?.focus()
        return
      }
      // Igual que en el login: se cierra antes de que el padre cambie la página
      dialogRef.current?.close()
      onRegister(result.user)
    },
  })

  // Con un plan de pago aparecen los datos de la tarjeta y el precio en el botón
  const planId = useStore(form.store, (state) => state.values.planId)
  const plan = plans.find((p) => p.id === planId) ?? plans[0]
  const paid = isPaidPlan(planId)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-registro"
      onClose={() => {
        form.reset()
        setError(null)
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,28rem)] overflow-y-auto rounded-3xl border border-neutral-200 bg-neutral-0 p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm open:motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          onInput={() => setError(null)}
          className="mt-6 flex flex-col gap-4"
        >
          <form.Field name="name">
            {(field) => (
              <TextField
                field={field}
                id="registro-nombre"
                label="Nombre"
                autoComplete="name"
                placeholder="Lucía"
              />
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <TextField
                field={field}
                id="registro-email"
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
                id="registro-password"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
              />
            )}
          </form.Field>
          <form.Field name="planId">
            {(field) => (
              <fieldset>
                <legend className={labelClass}>Plan</legend>
                <div className="mt-1.5 flex flex-col gap-2">
                  {plans.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-300 px-4 py-2.5 transition hover:border-marca-400 has-checked:border-marca-600 has-checked:bg-marca-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-950/40"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={p.id}
                        checked={field.state.value === p.id}
                        onChange={() => field.handleChange(p.id)}
                        className="size-4 shrink-0 accent-marca-600 dark:accent-marca-400"
                      />
                      <span className="flex-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {p.name}
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {p.pricePerMonth === 0
                          ? 'Gratis'
                          : `${formatPrice(p.pricePerMonth)} €/mes`}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>
          {paid && (
            <fieldset className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <legend className="px-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Datos de pago
              </legend>
              <form.Field name="cardNumber">
                {(field) => (
                  <TextField
                    field={field}
                    id="registro-tarjeta"
                    label="Número de tarjeta"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={23}
                    placeholder="1234 5678 9012 3456"
                    format={formatCardNumber}
                  />
                )}
              </form.Field>
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="expiry">
                  {(field) => (
                    <TextField
                      field={field}
                      id="registro-caducidad"
                      label="Caducidad"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                      placeholder="MM/AA"
                      format={formatExpiry}
                    />
                  )}
                </form.Field>
                <form.Field name="cvv">
                  {(field) => (
                    <TextField
                      field={field}
                      id="registro-cvv"
                      label="CVV"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      placeholder="123"
                      format={onlyDigits}
                    />
                  )}
                </form.Field>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pago simulado: no se cobra nada y la tarjeta no se guarda.
              </p>
            </fieldset>
          )}
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
          <button type="submit" className={submitClass}>
            {paid
              ? `Crear cuenta · ${formatPrice(plan.pricePerMonth)} €/mes`
              : 'Crear cuenta'}
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
