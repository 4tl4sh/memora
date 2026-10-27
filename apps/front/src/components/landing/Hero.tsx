import { SparklesIcon } from '#/components/icons'
import { heroStats } from './data'

export function Hero() {
  return (
    <section
      aria-labelledby="titulo-hero"
      className="relative overflow-hidden py-16 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-marca-200/50 blur-3xl dark:bg-marca-700/30"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-chispa-200 px-3 py-1 text-xs font-semibold text-neutral-900 motion-safe:animate-aparecer">
            <SparklesIcon className="size-4" />
            Ahora con generación por IA
          </p>
          <h1
            id="titulo-hero"
            className="mt-5 font-display text-4xl font-extrabold tracking-tight text-balance text-neutral-950 motion-safe:animate-aparecer motion-safe:[animation-delay:100ms] sm:text-5xl lg:text-6xl dark:text-neutral-0"
          >
            Convierte tu temario en tests
          </h1>
          <p className="mt-5 max-w-prose text-lg text-pretty text-neutral-600 motion-safe:animate-aparecer motion-safe:[animation-delay:200ms] dark:text-neutral-300">
            Sube tus apuntes, la IA te propone un test y tú lo repasas en el
            móvil: en el autobús, en la cola o entre clases. Hasta que te lo
            sepas.
          </p>
          <div className="mt-8 flex flex-col gap-3 motion-safe:animate-aparecer motion-safe:[animation-delay:300ms] sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-neutral-0 shadow-lg shadow-marca-600/25 transition duration-200 ease-out hover:bg-marca-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 motion-safe:hover:-translate-y-0.5 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
            >
              Crea tu primer test
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
            </a>{' '}
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 px-6 py-3 font-semibold text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300"
            >
              Ver cómo funciona
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-neutral-200 pt-6 motion-safe:animate-aparecer motion-safe:[animation-delay:400ms] dark:border-neutral-800">
            <div className="flex flex-col-reverse">
              <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                tests creados
              </dt>
              <dd className="font-display text-3xl font-bold text-neutral-950 dark:text-neutral-0">
                12.400
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                preguntas al día
              </dt>
              <dd className="font-display text-3xl font-bold text-neutral-950 dark:text-neutral-0">
                38.000
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                aprobados
              </dt>
              <dd className="font-display text-3xl font-bold text-neutral-950 dark:text-neutral-0">
                94 %
              </dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <img
            src="/img/hero.svg"
            alt="Unos apuntes con frases subrayadas se transforman en un test en el móvil, con una respuesta marcada como correcta."
            width="640"
            height="560"
            fetchPriority="high"
            className="w-full"
          />
          <p className="absolute top-6 right-0 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-3 pr-5 shadow-lg shadow-marca-600/25 motion-safe:animate-flotar dark:border-neutral-700 dark:bg-neutral-800">
            <span className="grid size-10 place-items-center rounded-full bg-chispa-300 text-neutral-900">
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
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </span>{' '}
            <span className="flex flex-col text-sm leading-tight">
              <strong className="font-display font-bold text-neutral-950 dark:text-neutral-0">
                {heroStats.streakDays} días de racha
              </strong>
              <span className="text-neutral-600 dark:text-neutral-300">
                Sigue así, Lucía
              </span>
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
