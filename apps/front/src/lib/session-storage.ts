import { useSyncExternalStore } from 'react'
import type { User } from '@tfm/types'

import { USERS_KEY, findUserById } from '#/lib/users-storage'

// Sesión simulada: se guarda el id del usuario registrado (ver users-storage.ts) en
// localStorage para que sobreviva al cambiar de página y al recargar.

const USER_KEY = 'studia_user'

export type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'planId'>

// useSyncExternalStore necesita la misma referencia mientras no cambie nada
let cachedKey: string | null = null
let cachedUser: SessionUser | null = null

const readUserId = (): number | null => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(USER_KEY)
  } catch {}
  const id = raw ? Number(raw) : NaN
  return Number.isInteger(id) ? id : null
}

// Usuario de la sesión, o null si no hay sesión o apunta a un usuario que ya no existe
export const readUser = (): SessionUser | null => {
  const id = readUserId()
  const stored = id === null ? undefined : findUserById(id)
  const key = stored ? `${stored.id}|${stored.name}|${stored.email}|${stored.planId}` : null
  if (key === cachedKey) return cachedUser
  cachedKey = key
  cachedUser = stored
    ? {
        id: stored.id,
        name: stored.name,
        email: stored.email,
        planId: stored.planId,
      }
    : null
  return cachedUser
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // Otra pestaña puede iniciar o cerrar sesión, o cambiar los usuarios
  const onStorage = (e: StorageEvent) =>
    (e.key === USER_KEY || e.key === USERS_KEY) && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const setUser = (id: User['id']) => {
  try {
    localStorage.setItem(USER_KEY, String(id))
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
