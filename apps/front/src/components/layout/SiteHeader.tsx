import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Theme } from '@tfm/types'

import {
  CloseIcon,
  LogoIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from '#/components/icons'
import { THEMES, usePreferences } from '#/hooks/use-preferences'
import { cn } from '#/lib/utils'
import { landingLinks, loginLink } from './nav-links'
import type { NavLink } from './nav-links'

interface SiteHeaderProps {
  links?: NavLink[]
  homeHref?: string
  // Sustituyen al enlace "Entrar" y al botón "Empieza gratis" de la landing.
  // actions se ve en la barra a cualquier ancho; menuAction, al final del menú móvil
  actions?: ReactNode
  menuAction?: ReactNode
}

export function SiteHeader({
  links = landingLinks,
  homeHref = '/',
  actions,
  menuAction,
}: SiteHeaderProps) {
  const { darkMode, theme, setDarkMode, setTheme } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Menú móvil (hasta 1023 px): se cierra con Escape, al pulsar fuera o al pasar a escritorio
  useEffect(() => {
    if (!menuOpen) return
    const desktop = matchMedia('(min-width: 1024px)')
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onResize = (e: MediaQueryListEvent) => e.matches && setMenuOpen(false)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onClick)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick)
      desktop.removeEventListener('change', onResize)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const navLinks = actions ? links : [...links, loginLink]

  return (
    <>
      <a
        href="#contenido"
        className="sr-only rounded-full bg-marca-600 px-5 py-3 font-semibold text-neutral-0 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] dark:bg-marca-400 dark:text-marca-950"
      >
        Saltar al contenido
      </a>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-neutral-200/70 bg-neutral-50/75 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/75"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href={homeHref}
            className="flex items-center gap-2 rounded-lg font-display text-xl font-extrabold tracking-tight text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-0"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-chispa-300 text-neutral-900">
              <LogoIcon className="size-5" />
            </span>
            Memora
          </a>
          {navLinks.length > 0 && (
            <nav aria-label="Principal" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-marca-300"
                      href={link.href}
                    >
                      {link.shortLabel ?? link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <label className="relative">
                <span className="sr-only">Tema de color</span>{' '}
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="min-h-10 cursor-pointer rounded-full border border-neutral-300 bg-neutral-0 py-2 pr-3 pl-3 text-sm font-semibold text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
                >
                  {THEMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>{' '}
              <button
                type="button"
                aria-pressed={darkMode}
                onClick={() => setDarkMode(!darkMode)}
                className="grid size-10 place-items-center rounded-full border border-neutral-300 bg-neutral-0 text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300"
              >
                <MoonIcon className="size-5 dark:hidden" />
                <SunIcon className="hidden size-5 dark:block" />
                <span className="sr-only">Modo oscuro</span>
              </button>{' '}
              {!actions && (
                <a
                  href="#planes"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-marca-600 px-4 py-2 text-sm font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
                >
                  Empieza gratis
                </a>
              )}
            </div>
            {actions}
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              onClick={() => setMenuOpen(!menuOpen)}
              className="group grid size-10 place-items-center rounded-full border border-neutral-300 bg-neutral-0 text-neutral-900 transition hover:border-marca-400 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:text-marca-300 lg:hidden"
            >
              <MenuIcon className="size-5 group-aria-expanded:hidden" />
              <CloseIcon className="hidden size-5 group-aria-expanded:block" />
              <span className="sr-only">Menú</span>
            </button>
          </div>
        </div>
        <div
          id="menu-movil"
          hidden={!menuOpen}
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-neutral-200 bg-neutral-50 motion-safe:animate-aparecer lg:hidden dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
            {navLinks.length > 0 && (
              <nav aria-label="Secciones de la página">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        className="block rounded-xl px-4 py-3 text-base font-semibold text-neutral-900 transition hover:bg-neutral-100 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:hover:text-marca-300"
                        href={link.href}
                        onClick={closeMenu}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div
              className={cn(
                'flex flex-col gap-5',
                navLinks.length > 0 &&
                  'border-t border-neutral-200 pt-6 dark:border-neutral-800',
              )}
            >
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Tema de color
                </legend>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <label
                      key={t.value}
                      className="cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-marca-400 has-checked:border-marca-600 has-checked:bg-marca-600 has-checked:text-neutral-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-500 dark:border-neutral-700 dark:has-checked:border-marca-400 dark:has-checked:bg-marca-400 dark:has-checked:text-marca-950"
                    >
                      <input
                        type="radio"
                        name="tema-movil"
                        value={t.value}
                        checked={theme === t.value}
                        onChange={() => setTheme(t.value)}
                        className="sr-only"
                      />{' '}
                      {t.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Modo oscuro{' '}
                <input
                  type="checkbox"
                  role="switch"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="peer sr-only"
                />{' '}
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 rounded-full bg-neutral-300 peer-checked:bg-marca-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marca-500 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-neutral-0 peer-checked:after:translate-x-5 motion-safe:after:transition-transform dark:bg-neutral-600 dark:peer-checked:bg-marca-400"
                />
              </label>
            </div>
            {actions ? (
              menuAction
            ) : (
              <a
                href="#planes"
                onClick={closeMenu}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-marca-600 px-6 py-3 font-semibold text-neutral-0 transition duration-200 ease-out hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-500 dark:bg-marca-400 dark:text-marca-950 dark:hover:bg-marca-300"
              >
                Empieza gratis
              </a>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
