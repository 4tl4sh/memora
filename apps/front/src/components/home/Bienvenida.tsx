import {
  ArrowRightIcon,
  FileUpIcon,
  SmartphoneIcon,
  SparklesIcon,
} from '#/components/icons'

const steps = [
  { icon: FileUpIcon, title: 'Sube tu temario', text: 'Texto o PDF' },
  { icon: SparklesIcon, title: 'La IA crea el test', text: 'En segundos' },
  {
    icon: SmartphoneIcon,
    title: 'Repasa en el móvil',
    text: 'Hasta sabértelo',
  },
]

interface BienvenidaProps {
  onRegister: () => void
  onLogin: () => void
}

// Resumen de la landing en una sola pantalla: presenta Studia e invita a registrarse
export function Bienvenida({ onRegister, onLogin }: BienvenidaProps) {
  return (
    <section
      aria-labelledby="titulo-bienvenida"
      className="relative flex flex-1 items-center overflow-hidden py-10 lg:py-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-marca-200/50 blur-3xl dark:bg-marca-700/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-chispa-200/40 blur-3xl dark:bg-chispa-900/20"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1.15fr_1fr] lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-chispa-200 px-3 py-1 text-xs font-semibold text-neutral-900 motion-safe:animate-aparecer">
            <SparklesIcon className="size-4" />
            Ahora con generación por IA
          </p>
          <h1
            id="titulo-bienvenida"
            className="mt-5 font-display text-4xl font-extrabold tracking-tight text-balance text-neutral-950 motion-safe:animate-aparecer motion-safe:[animation-delay:100ms] sm:text-5xl xl:text-6xl dark:text-neutral-0"
          >
            Convierte tu temario en tests
          </h1>
          <p className="mt-5 max-w-prose text-lg text-pretty text-neutral-600 motion-safe:animate-aparecer motion-safe:[animation-delay:200ms] dark:text-neutral-300">
            Sube tus apuntes, la IA te propone un test y tú lo repasas en el
            móvil hasta que te lo sepas. Crea tu cuenta y empieza gratis.
          </p>
          <div className="mt-8 flex flex-col gap-3 motion-safe:animate-aparecer motion-safe:[animation-delay:300ms] sm:flex-row">
            <button
              type="button"
              onClick={onRegister}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-neutral-0 shadow-lg shadow-marca-600/25 transition duration-200 ease-out hover:bg-marca-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 motion-safe:hover:-translate-y-0.5 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
            >
              Crea tu cuenta gratis
              <ArrowRightIcon className="size-5" />
            </button>{' '}
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 px-6 py-3 font-semibold text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300"
            >
              Ya tengo cuenta
            </button>
          </div>
          <ol
            aria-label="Cómo funciona"
            className="mt-10 grid gap-4 border-t border-neutral-200 pt-6 motion-safe:animate-aparecer motion-safe:[animation-delay:400ms] sm:grid-cols-3 dark:border-neutral-800"
          >
            {steps.map(({ icon: StepIcon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-marca-600 text-neutral-0 dark:bg-marca-400 dark:text-marca-950">
                  <StepIcon className="size-5" />
                </span>{' '}
                <span className="flex flex-col text-sm leading-tight">
                  <strong className="font-display font-bold text-neutral-950 dark:text-neutral-0">
                    {title}
                  </strong>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <img
          src="/img/hero.svg"
          alt="Unos apuntes con frases subrayadas se transforman en un test en el móvil, con una respuesta marcada como correcta."
          width="640"
          height="560"
          fetchPriority="high"
          className="mx-auto hidden max-h-[min(30rem,60dvh)] w-auto md:block"
        />
      </div>
    </section>
  )
}
