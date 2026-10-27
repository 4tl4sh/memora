export function Cta() {
  return (
    <section aria-labelledby="titulo-cta" className="pb-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-marca-900 px-6 py-14 text-center text-marca-50 shadow-2xl sm:px-12 sm:py-20">
          <h2
            id="titulo-cta"
            className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance text-neutral-0 sm:text-5xl"
          >
            Tu próximo examen empieza hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-marca-100">
            Crea tu primer test en menos de un minuto. Es gratis y no hace falta
            tarjeta.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-chispa-300 px-6 py-3 font-semibold text-neutral-900 transition duration-200 ease-out hover:bg-chispa-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chispa-300 motion-safe:hover:-translate-y-0.5"
          >
            Crear mi primer test
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
