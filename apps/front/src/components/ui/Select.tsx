import type { SelectHTMLAttributes } from 'react'

import { ChevronDownIcon } from '#/components/icons'
import { inputBaseClass } from '#/components/ui/inputs'
import { cn } from '#/lib/utils'

// Desplegable con el estilo de los campos de texto. Se quita la flecha del navegador
// (appearance-none) y se pinta una propia, que no recibe clics: el select las recibe.
export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative mt-1.5">
      <select
        {...props}
        className={cn(
          inputBaseClass,
          'cursor-pointer appearance-none pr-11 pl-4 disabled:cursor-not-allowed disabled:opacity-50',
          // Sin elegir todavía (opción vacía): el texto se ve como un placeholder
          props.value === '' && 'text-neutral-500 dark:text-neutral-400',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" />
    </div>
  )
}
