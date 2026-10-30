export function Opiniones() {
  return (
    <section
      id="opiniones"
      aria-labelledby="titulo-opiniones"
      className="bg-marca-50 py-16 sm:py-24 dark:bg-marca-950"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
            Opiniones
          </p>
          <h2
            id="titulo-opiniones"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 sm:text-4xl dark:text-neutral-0"
          >
            Ya repasan con Studia
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-600 dark:text-neutral-300">
            Estudiantes, opositores y profesores que preparan sus exámenes con
            tests.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li className="@container sm:col-span-2 lg:row-span-2">
            <figure className="flex h-full flex-col gap-6 rounded-3xl border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8 @xl:flex-row @xl:items-center @xl:gap-10 dark:border-neutral-700 dark:bg-neutral-900">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-full bg-marca-100 font-display text-xl font-bold text-marca-800 @xl:size-28 @xl:text-4xl dark:bg-marca-900/60 dark:text-marca-100"
              >
                LM
              </span>
              <div className="flex flex-1 flex-col">
                <blockquote className="flex-1 text-lg text-pretty text-neutral-800 @xl:font-display @xl:text-2xl @xl:font-semibold dark:text-neutral-100">
                  <p>
                    «Pegué mis apuntes de Historia y en un minuto tenía 20
                    preguntas. Las fui repasando en el bus y llegué al examen
                    sabiéndome las fechas.»
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-semibold text-neutral-950 dark:text-neutral-0">
                    Lucía M.
                  </span>{' '}
                  <span className="text-neutral-600 dark:text-neutral-300">
                    2.º de Bachillerato
                  </span>
                </figcaption>
              </div>
            </figure>
          </li>
          <li>
            <p className="flex h-full flex-col justify-center rounded-3xl p-6 sm:p-8 bg-marca-900 shadow-sm">
              <span className="font-display text-5xl font-bold text-chispa-300">
                4,8/5
              </span>{' '}
              <span className="mt-2 text-sm text-marca-100">
                de valoración media entre quienes repasan con Studia
              </span>
            </p>
          </li>
          <li>
            <p className="flex h-full flex-col justify-center rounded-3xl p-6 sm:p-8 bg-chispa-300 shadow-sm">
              <span className="font-display text-5xl font-bold text-neutral-950">
                +20.000
              </span>{' '}
              <span className="mt-2 text-sm text-neutral-900">
                tests creados este curso
              </span>
            </p>
          </li>
          <li className="@container">
            <figure className="flex h-full flex-col gap-6 rounded-3xl border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8 @xl:flex-row @xl:items-center @xl:gap-10 dark:border-neutral-700 dark:bg-neutral-900">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-full bg-marca-100 font-display text-xl font-bold text-marca-800 @xl:size-28 @xl:text-4xl dark:bg-marca-900/60 dark:text-marca-100"
              >
                DR
              </span>
              <div className="flex flex-1 flex-col">
                <blockquote className="flex-1 text-lg text-pretty text-neutral-800 @xl:font-display @xl:text-2xl @xl:font-semibold dark:text-neutral-100">
                  <p>
                    «Con la respuesta corta tengo que recordar de verdad, no
                    solo reconocer la opción buena. Para el temario de la
                    oposición es justo lo que necesitaba.»
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-semibold text-neutral-950 dark:text-neutral-0">
                    Daniel R.
                  </span>{' '}
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Opositor a Justicia
                  </span>
                </figcaption>
              </div>
            </figure>
          </li>
          <li className="@container lg:col-span-2">
            <figure className="flex h-full flex-col gap-6 rounded-3xl border border-neutral-200 bg-neutral-0 p-6 shadow-sm sm:p-8 @xl:flex-row @xl:items-center @xl:gap-10 dark:border-neutral-700 dark:bg-neutral-900">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-full bg-marca-100 font-display text-xl font-bold text-marca-800 @xl:size-28 @xl:text-4xl dark:bg-marca-900/60 dark:text-marca-100"
              >
                MG
              </span>
              <div className="flex flex-1 flex-col">
                <blockquote className="flex-1 text-lg text-pretty text-neutral-800 @xl:font-display @xl:text-2xl @xl:font-semibold dark:text-neutral-100">
                  <p>
                    «Preparo un test por tema y lo comparto con el grupo. Veo en
                    qué preguntas fallan más y eso es lo que repasamos en
                    clase.»
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-semibold text-neutral-950 dark:text-neutral-0">
                    Marta G.
                  </span>{' '}
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Profesora de Biología en una academia
                  </span>
                </figcaption>
              </div>
            </figure>
          </li>
        </ul>
      </div>
    </section>
  )
}
