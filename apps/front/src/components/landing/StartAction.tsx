import type { ReactNode } from 'react'

// Llamada a "crear tu primer test": un botón si la página la gestiona (abrir el login),
// o un enlace si no (la landing estática o la zona privada con sesión)
export interface StartProps {
  onStart?: () => void
  startHref?: string
}

export function StartAction({
  onStart,
  startHref = '#',
  className,
  children,
}: StartProps & { className: string; children: ReactNode }) {
  return onStart ? (
    <button type="button" onClick={onStart} className={className}>
      {children}
    </button>
  ) : (
    <a href={startHref} className={className}>
      {children}
    </a>
  )
}
