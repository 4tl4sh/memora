// Tras un envío con errores, el foco va al primer campo inválido (como hacía el
// navegador con la validación nativa). Se espera un fotograma a que React pinte aria-invalid.
export const focusFirstInvalid = (form: HTMLFormElement | null) =>
  requestAnimationFrame(() =>
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
  )
