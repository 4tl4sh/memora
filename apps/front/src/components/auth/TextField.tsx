import type { AnyFieldApi } from '@tanstack/react-form'

import {
  errorClass,
  inputClass,
  labelClass,
} from '#/components/auth/form-classes'

interface TextFieldProps {
  field: AnyFieldApi
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  placeholder?: string
  hint?: string
  inputMode?: 'text' | 'numeric' | 'email'
  maxLength?: number
  // Da formato al valor mientras se escribe (por ejemplo, espacios en la tarjeta)
  format?: (value: string) => string
}

// Mensajes de error de un campo: con Zod (Standard Schema) llegan como issues con message
export const fieldErrors = (field: AnyFieldApi): string[] =>
  field.state.meta.isTouched
    ? field.state.meta.errors
        .map((error: unknown) =>
          typeof error === 'string'
            ? error
            : error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : '',
        )
        .filter(Boolean)
    : []

// Campo de texto de TanStack Form: label, ayuda y error enlazados con aria-describedby
export function TextField({
  field,
  id,
  label,
  type = 'text',
  autoComplete,
  placeholder,
  hint,
  inputMode,
  maxLength,
  format,
}: TextFieldProps) {
  const errors = fieldErrors(field)
  const invalid = errors.length > 0
  const describedBy = [invalid && `${id}-error`, hint && `${id}-ayuda`]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>{' '}
      <input
        id={id}
        name={field.name}
        type={type}
        value={field.state.value}
        onChange={(e) =>
          field.handleChange(format ? format(e.target.value) : e.target.value)
        }
        onBlur={field.handleBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={describedBy || undefined}
        className={inputClass}
      />
      {invalid && (
        <p id={`${id}-error`} className={errorClass}>
          {errors[0]}
        </p>
      )}
      {hint && !invalid && (
        <p
          id={`${id}-ayuda`}
          className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400"
        >
          {hint}
        </p>
      )}
    </div>
  )
}
