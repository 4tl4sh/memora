// Sección para usuarios con sesión iniciada. Por ahora solo reserva el sitio
export function PanelPlaceholder({ name }: { name: string }) {
  return (
    <section
      aria-labelledby="titulo-panel"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8"
    >
      <p className="text-sm font-semibold tracking-wider text-marca-700 uppercase dark:text-marca-300">
        Tu panel
      </p>
      <h1
        id="titulo-panel"
        className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-neutral-950 motion-safe:animate-aparecer sm:text-4xl dark:text-neutral-0"
      >
        Hola, {name}
      </h1>
      <div className="mt-8 grid min-h-72 flex-1 place-items-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-0/60 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
        <div>
          <p className="font-display text-xl font-bold text-neutral-950 dark:text-neutral-0">
            Aquí irán tus tests y tu progreso
          </p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sección en construcción.
          </p>
        </div>
      </div>
    </section>
  )
}
