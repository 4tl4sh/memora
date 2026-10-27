export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="titulo-pasos"
      className="py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
            Cómo funciona
          </p>
          <h2
            id="titulo-pasos"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 sm:text-4xl dark:text-neutral-0"
          >
            De los apuntes al test en tres pasos
          </h2>
        </div>
        <ol className="relative mt-14 flex flex-col gap-12 md:flex-row md:gap-8">
          <li
            aria-hidden="true"
            className="absolute top-10 right-1/6 left-1/6 hidden border-t-2 border-dashed border-marca-300 md:block dark:border-marca-700"
          />
          <li className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="relative z-10 grid size-20 place-items-center rounded-full bg-marca-600 text-neutral-0 ring-8 ring-neutral-0 dark:bg-marca-400 dark:text-marca-950 dark:ring-neutral-900">
              <svg
                className="size-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M12 12v6" />
                <path d="m9 15 3-3 3 3" />
              </svg>
            </span>
            <p className="mt-5 text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
              Paso 1
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
              Sube tu temario
            </h3>
            <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Pega el texto de tus apuntes o sube un PDF. También puedes empezar
              un test en blanco.
            </p>
          </li>
          <li className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="relative z-10 grid size-20 place-items-center rounded-full bg-marca-600 text-neutral-0 ring-8 ring-neutral-0 dark:bg-marca-400 dark:text-marca-950 dark:ring-neutral-900">
              <svg
                className="size-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </svg>
            </span>
            <p className="mt-5 text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
              Paso 2
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
              La IA te propone un test
            </h3>
            <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Eliges cuántas preguntas y de qué tipos. En unos segundos tienes
              una propuesta que puedes revisar.
            </p>
          </li>
          <li className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="relative z-10 grid size-20 place-items-center rounded-full bg-marca-600 text-neutral-0 ring-8 ring-neutral-0 dark:bg-marca-400 dark:text-marca-950 dark:ring-neutral-900">
              <svg
                className="size-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </span>
            <p className="mt-5 text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
              Paso 3
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
              Repásalo en el móvil
            </h3>
            <p className="mt-2 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Hazlo cuantas veces quieras. Memora te dice qué fallas para que
              insistas ahí.
            </p>
          </li>
        </ol>
      </div>
    </section>
  )
}
