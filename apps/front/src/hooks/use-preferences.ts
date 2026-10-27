import { useCallback, useSyncExternalStore } from 'react'
import type { Theme, UserPreferences } from '@tfm/types'

// Preferencias de apariencia: viven en <html> (clase .dark y data-theme) y en localStorage.
// El script de __root.tsx las aplica antes de pintar; este hook las lee y las cambia.

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'teal', label: 'Teal' },
  { value: 'klein', label: 'Azul Klein' },
  { value: 'amarillo', label: 'Amarillo' },
]

const DARK_KEY = 'memora-oscuro'
const THEME_KEY = 'memora-tema'

const isTheme = (value: unknown): value is Theme =>
  THEMES.some((t) => t.value === value)

// Varios componentes (cabecera y menú móvil) comparten el estado: se avisan entre sí
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

const readDark = (): UserPreferences['darkMode'] =>
  document.documentElement.classList.contains('dark')

// "teal" es el de por defecto y no pone atributo
const readTheme = (): Theme => {
  const theme = document.documentElement.dataset.theme
  return isTheme(theme) ? theme : 'teal'
}

export function usePreferences() {
  const darkMode = useSyncExternalStore(subscribe, readDark, () => false)
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => 'teal' as const,
  )

  const setDarkMode = useCallback((dark: UserPreferences['darkMode']) => {
    document.documentElement.classList.toggle('dark', dark)
    save(DARK_KEY, dark ? '1' : '0')
    notify()
  }, [])

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    if (next === 'teal') delete root.dataset.theme
    else root.dataset.theme = next
    save(THEME_KEY, next)
    notify()
  }, [])

  return { darkMode, theme, setDarkMode, setTheme }
}

// Se inyecta en <head> para aplicar las preferencias antes del primer pintado (sin parpadeo)
export const preferencesScript = `(() => {
  const d = document.documentElement;
  let oscuro = null, tema = null;
  try {
    oscuro = localStorage.getItem("${DARK_KEY}");
    tema = localStorage.getItem("${THEME_KEY}");
  } catch {}
  if (oscuro === "1" || (oscuro === null && matchMedia("(prefers-color-scheme: dark)").matches)) {
    d.classList.add("dark");
  }
  if (${JSON.stringify(THEMES.map((t) => t.value))}.includes(tema) && tema !== "teal") d.dataset.theme = tema;
})();`
