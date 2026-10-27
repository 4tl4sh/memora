import { SUBJECT_LABELS, exampleTests } from './data'
import type { ExampleTest } from './data'

export function Ejemplos() {
  return (
    <section
      id="ejemplos"
      aria-labelledby="titulo-ejemplos"
      className="bg-neutral-0 py-16 sm:py-24 dark:bg-neutral-900"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
            Ejemplos
          </p>
          <h2
            id="titulo-ejemplos"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 sm:text-4xl dark:text-neutral-0"
          >
            Tests listos para repasar
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-600 dark:text-neutral-300">
            Elige uno y pruébalo ahora. Así se ve un test generado a partir de
            unos apuntes.
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exampleTests.map((test) => (
            <li key={test.id}>
              <ExampleCard test={test} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ExampleCard({ test }: { test: ExampleTest }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 shadow-sm transition duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="overflow-hidden">
        <img
          src={`/img/${test.subject}.svg`}
          alt=""
          width="640"
          height="360"
          loading="lazy"
          className="aspect-video w-full object-cover duration-500 motion-safe:group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-marca-100 px-2.5 py-0.5 text-xs font-semibold text-marca-800 dark:bg-marca-900/60 dark:text-marca-100">
            {SUBJECT_LABELS[test.subject]}
          </span>{' '}
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {test.level}
          </span>
        </p>
        <h3 className="mt-3 font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
          {test.title}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {test.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <dl className="flex gap-5">
            <div className="flex flex-col-reverse">
              <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                preguntas
              </dt>
              <dd className="font-display text-3xl font-bold text-marca-700 dark:text-marca-300">
                {test.questionCount}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-xs text-neutral-600 dark:text-neutral-400">
                duración
              </dt>
              <dd className="font-display text-3xl font-bold text-neutral-950 dark:text-neutral-0">
                {test.minutes}
                <span className="text-base font-semibold">min</span>
              </dd>
            </div>
          </dl>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-4 py-2 text-sm font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
          >
            Probar
            <span className="sr-only">: {test.title}</span>
          </a>
        </div>
      </div>
    </article>
  )
}
