import { inputBaseClass } from '#/components/ui/inputs'

// Clases compartidas por los formularios de login y registro

export const labelClass =
  'text-sm font-semibold text-neutral-800 dark:text-neutral-100'

// Los formularios marcan el campo inválido (user-invalid) y enlazan su mensaje de error (peer)
export const inputClass = `${inputBaseClass} peer mt-1.5 px-4 user-invalid:border-fallo-500 user-invalid:ring-2 user-invalid:ring-fallo-500/20`

// Error de un campo: solo se ve cuando el campo anterior (peer) es inválido
export const errorClass =
  'mt-1.5 hidden text-sm font-medium text-fallo-700 peer-user-invalid:block dark:text-fallo-300'

// Error general del formulario (credenciales, email repetido…): vacío no ocupa sitio
export const formErrorClass =
  'text-sm font-medium text-fallo-700 empty:hidden dark:text-fallo-300'

export const submitClass =
  'mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300'

export const linkButtonClass =
  'cursor-pointer rounded font-semibold text-marca-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-marca-300'
