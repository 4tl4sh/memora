import { useEffect, useRef, useState } from 'react'

import { MoonIcon, SunIcon } from '#/components/icons'
import { THEMES, usePreferences } from '#/hooks/use-preferences'

const optionClass =
  'cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-marca-400 has-checked:border-marca-600 has-checked:bg-marca-600 has-checked:text-neutral-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-400 dark:has-checked:text-marca-950'

// Botón claro/oscuro que despliega los ajustes de apariencia: modo y tema de color
export function ThemeMenu() {
  const { darkMode, theme, setDarkMode, setTheme } = usePreferences()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Se cierra con Escape o al pulsar fuera
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-apariencia"
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-full border border-neutral-300 bg-neutral-0 text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300"
      >
        <MoonIcon className="size-5 dark:hidden" />
        <SunIcon className="hidden size-5 dark:block" />
        <span className="sr-only">Apariencia</span>
      </button>
      <div
        id="menu-apariencia"
        hidden={!open}
        className="absolute top-full right-0 z-10 mt-2 flex w-80 flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 shadow-xl motion-safe:animate-aparecer dark:border-neutral-700 dark:bg-neutral-900"
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Modo
          </legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: false, label: 'Claro', Icon: SunIcon },
              { value: true, label: 'Oscuro', Icon: MoonIcon },
            ].map(({ value, label, Icon }) => (
              <label
                key={label}
                className={`${optionClass} inline-flex items-center gap-2 text-neutral-800 dark:text-neutral-100`}
              >
                <input
                  type="radio"
                  name="modo-apariencia"
                  checked={darkMode === value}
                  onChange={() => setDarkMode(value)}
                  className="sr-only"
                />
                <Icon className="size-4" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Tema de color
          </legend>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <label
                key={t.value}
                className={`${optionClass} text-neutral-800 dark:text-neutral-100`}
              >
                <input
                  type="radio"
                  name="tema-apariencia"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => setTheme(t.value)}
                  className="sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
