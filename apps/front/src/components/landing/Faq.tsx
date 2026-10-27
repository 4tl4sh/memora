export function Faq() {
  return (
    <section id="faq" aria-labelledby="titulo-faq" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
          Preguntas frecuentes
        </p>
        <h2
          id="titulo-faq"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 sm:text-4xl dark:text-neutral-0"
        >
          Lo que suelen preguntarnos
        </h2>
        <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
          <li>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 [&::-webkit-details-marker]:hidden">
                ¿Qué tengo que subir para crear un test?{' '}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
                  <svg
                    className="size-4 group-open:rotate-180 motion-safe:transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                Pega el texto de tus apuntes o sube un PDF. Si prefieres hacerlo
                a mano, empieza un test en blanco y escribe tú las preguntas.
              </p>
            </details>
          </li>
          <li>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 [&::-webkit-details-marker]:hidden">
                ¿Puedo cambiar las preguntas que propone la IA?{' '}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
                  <svg
                    className="size-4 group-open:rotate-180 motion-safe:transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                Sí. La propuesta es un borrador: editas el enunciado y las
                respuestas, borras lo que no te convenza y añades las tuyas
                antes de guardar.
              </p>
            </details>
          </li>
          <li>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 [&::-webkit-details-marker]:hidden">
                ¿Qué tipos de pregunta hay?{' '}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
                  <svg
                    className="size-4 group-open:rotate-180 motion-safe:transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                Respuesta única, respuesta múltiple, verdadero o falso y
                respuesta corta. Tú eliges cuáles quieres al generar el test.
              </p>
            </details>
          </li>
          <li>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 [&::-webkit-details-marker]:hidden">
                ¿Funciona bien desde el móvil?{' '}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
                  <svg
                    className="size-4 group-open:rotate-180 motion-safe:transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                Está pensado para eso. Las opciones son grandes, el botón
                principal queda al alcance del pulgar y puedes repasar en
                cualquier momento.
              </p>
            </details>
          </li>
          <li>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0 [&::-webkit-details-marker]:hidden">
                ¿Puedo cancelar cuando quiera?{' '}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
                  <svg
                    className="size-4 group-open:rotate-180 motion-safe:transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-pretty text-neutral-600 dark:text-neutral-300">
                Claro. No hay permanencia: puedes cambiar de plan o volver al
                gratuito en cualquier momento y conservas tus tests.
              </p>
            </details>
          </li>
        </ul>
      </div>
    </section>
  )
}
