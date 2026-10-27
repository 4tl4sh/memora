import { useState } from 'react'
import type { FormEvent } from 'react'

// Newsletter (simulado): el botón se activa solo con el formulario válido
export function Newsletter() {
  const [valid, setValid] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) return
    setSent(true)
    form.reset()
    setValid(form.checkValidity())
  }

  return (
    <div>
      <h2
        id="titulo-newsletter"
        className="text-sm font-semibold tracking-wider text-neutral-0 uppercase"
      >
        Newsletter
      </h2>
      <p className="mt-4 text-sm">
        Un correo al mes con trucos para estudiar mejor.
      </p>
      <form
        noValidate
        onInput={(e) => setValid(e.currentTarget.checkValidity())}
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3"
        aria-labelledby="titulo-newsletter"
      >
        <div>
          <label
            htmlFor="correo"
            className="text-sm font-semibold text-neutral-0"
          >
            Correo electrónico
          </label>{' '}
          <input
            id="correo"
            name="correo"
            type="email"
            required
            autoComplete="email"
            placeholder="lucia@correo.com"
            className="peer mt-1.5 block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-neutral-0 placeholder:text-neutral-400 user-invalid:border-fallo-500 user-invalid:ring-2 user-invalid:ring-fallo-500/20 focus:border-marca-400 focus:ring-2 focus:ring-marca-400/30 focus:outline-none"
          />
          <p className="mt-1.5 hidden text-sm font-medium text-fallo-100 peer-user-invalid:block">
            Escribe un correo válido, por ejemplo lucia@correo.com.
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acepto"
            required
            className="mt-0.5 size-5 shrink-0 rounded accent-marca-500"
          />{' '}
          <span>Acepto recibir el boletín y la política de privacidad.</span>
        </label>{' '}
        <button
          type="submit"
          disabled={!valid}
          aria-describedby="ayuda-newsletter"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-chispa-300 px-6 py-3 font-semibold text-neutral-900 transition duration-200 ease-out hover:bg-chispa-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chispa-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300 disabled:hover:translate-y-0 motion-safe:hover:-translate-y-0.5"
        >
          Suscribirme
        </button>
        <p id="ayuda-newsletter" className="text-xs text-neutral-400">
          El botón se activa cuando el correo es válido y aceptas.
        </p>
        <p
          hidden={!sent}
          role="status"
          className="rounded-xl bg-acierto-100 px-4 py-3 text-sm font-semibold text-acierto-700"
        >
          ¡Hecho! Te hemos apuntado a la newsletter.
        </p>
      </form>
    </div>
  )
}
