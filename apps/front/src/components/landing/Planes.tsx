import { CheckIcon, SparklesIcon } from '#/components/icons'
import { formatPrice, plans } from './data'
import type { PlanCard } from './data'

export function Planes() {
  return (
    <section
      id="planes"
      aria-labelledby="titulo-planes"
      className="bg-neutral-0 py-16 sm:py-24 dark:bg-neutral-900"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
            Planes
          </p>
          <h2
            id="titulo-planes"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 sm:text-4xl dark:text-neutral-0"
          >
            Empieza gratis, crece cuando quieras
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-600 dark:text-neutral-300">
            Sin permanencia. Cambia de plan o cancela cuando te venga bien.
          </p>
        </div>
        <ul className="mt-14 grid items-center gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className={plan.featured ? 'mt-4 lg:mt-0' : undefined}
            >
              {plan.featured ? (
                <FeaturedPlan plan={plan} />
              ) : (
                <RegularPlan plan={plan} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RegularPlan({ plan }: { plan: PlanCard }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
      <h3 className="font-display text-2xl font-bold text-neutral-950 dark:text-neutral-0">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        {plan.description}
      </p>
      <p className="mt-6 flex items-baseline gap-1 text-neutral-950 dark:text-neutral-0">
        <span className="font-display text-5xl font-bold">
          {formatPrice(plan.pricePerMonth)}
        </span>
        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          €/mes
        </span>
      </p>
      <Features
        features={plan.features}
        checkClass="bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100"
      />
      <a
        href="#"
        className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 px-6 py-3 font-semibold text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300"
      >
        {plan.cta}
        <span className="sr-only">con el plan {plan.name}</span>
      </a>
    </article>
  )
}

function FeaturedPlan({ plan }: { plan: PlanCard }) {
  return (
    <article className="relative flex h-full flex-col rounded-3xl bg-marca-900 p-6 text-marca-50 shadow-2xl ring-2 ring-marca-500 sm:p-8 lg:py-12">
      <p className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-chispa-300 px-4 py-1.5 text-xs font-semibold whitespace-nowrap text-neutral-900">
        <SparklesIcon className="size-4" />
        Más popular
      </p>
      <h3 className="font-display text-2xl font-bold text-neutral-0">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-marca-100">{plan.description}</p>
      <p className="mt-6 flex items-baseline gap-1 text-neutral-0">
        <span className="font-display text-5xl font-bold">
          {formatPrice(plan.pricePerMonth)}
        </span>
        <span className="text-sm font-semibold text-marca-100">€/mes</span>
      </p>
      <Features
        features={plan.features}
        checkClass="bg-chispa-300 text-neutral-900"
      />
      <a
        href="#"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-chispa-300 px-6 py-3 font-semibold text-neutral-900 transition duration-200 ease-out hover:bg-chispa-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chispa-300 motion-safe:hover:-translate-y-0.5"
      >
        {plan.cta}
        <span className="sr-only">con el plan {plan.name}</span>
      </a>
    </article>
  )
}

function Features({
  features,
  checkClass,
}: {
  features: string[]
  checkClass: string
}) {
  return (
    <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${checkClass}`}
          >
            <CheckIcon className="size-3" />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
