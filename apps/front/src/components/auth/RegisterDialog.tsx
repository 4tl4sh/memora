import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { PlanId } from '@tfm/types'

import {
  errorClass,
  formErrorClass,
  inputClass,
  labelClass,
  linkButtonClass,
  submitClass,
} from '#/components/auth/form-classes'
import { CloseIcon } from '#/components/icons'
import { formatPrice, plans } from '#/components/landing/data'
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from '#/lib/card'
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
  const [planId, setPlanId] = useState<PlanId>('gratis')
  const plan = plans.find((p) => p.id === planId) ?? plans[0]
  const paid = plan.pricePerMonth > 0

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
      planId,
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
        setPlanId('gratis')
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
                    name="plan"
                    value={p.id}
                    checked={planId === p.id}
                    onChange={() => setPlanId(p.id)}
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
          {paid && (
            <fieldset className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <legend className="px-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Datos de pago
              </legend>
              <div>
                <label htmlFor="registro-tarjeta" className={labelClass}>
                  Número de tarjeta
                </label>{' '}
                <input
                  id="registro-tarjeta"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  required
                  maxLength={23}
                  placeholder="1234 5678 9012 3456"
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.value = formatCardNumber(el.value)
                    el.setCustomValidity(
                      isValidCardNumber(el.value) ? '' : 'Número no válido',
                    )
                  }}
                  className={inputClass}
                />
                <p className={errorClass}>Escribe un número de tarjeta válido.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="registro-caducidad" className={labelClass}>
                    Caducidad
                  </label>{' '}
                  <input
                    id="registro-caducidad"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    required
                    maxLength={5}
                    placeholder="MM/AA"
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.value = formatExpiry(el.value)
                      el.setCustomValidity(
                        isValidExpiry(el.value) ? '' : 'Fecha no válida',
                      )
                    }}
                    className={inputClass}
                  />
                  <p className={errorClass}>Fecha no válida o caducada.</p>
                </div>
                <div>
                  <label htmlFor="registro-cvv" className={labelClass}>
                    CVV
                  </label>{' '}
                  <input
                    id="registro-cvv"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    required
                    maxLength={4}
                    placeholder="123"
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.value = el.value.replace(/\D/g, '')
                      el.setCustomValidity(
                        isValidCvv(el.value) ? '' : 'CVV no válido',
                      )
                    }}
                    className={inputClass}
                  />
                  <p className={errorClass}>Entre 3 y 4 dígitos.</p>
                </div>
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
