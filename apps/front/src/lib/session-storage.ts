import { useSyncExternalStore } from 'react'

// Sesión simulada: el nombre del usuario se guarda en localStorage para que
// sobreviva al cambiar de página y al recargar. No hay servidor ni contraseña real.

const USER_KEY = 'memora_user'

export const readUser = (): string | null => {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // Otra pestaña puede iniciar o cerrar sesión
  const onStorage = (e: StorageEvent) => e.key === USER_KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const setUser = (name: string) => {
  try {
    localStorage.setItem(USER_KEY, name)
  } catch {}
  notify()
}

export const clearUser = () => {
  try {
    localStorage.removeItem(USER_KEY)
  } catch {}
  notify()
}

// En el servidor no hay sesión: se pinta sin usuario y se corrige al hidratar
export const useUser = () => useSyncExternalStore(subscribe, readUser, () => null)
