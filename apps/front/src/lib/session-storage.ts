import { useSyncExternalStore } from 'react'
import type { User } from '@tfm/types'

import {
  USERS_KEY,
  findUserByToken,
  setSessionToken,
} from '#/lib/users-storage'

// Sesión simulada: al hacer login se genera un token aleatorio, se asocia al usuario
// registrado (ver users-storage.ts) y se guarda en localStorage para que sobreviva al
// cambiar de página y al recargar. Así no basta con escribir otro id para suplantar a
// otro usuario. Limitación: todo vive en el navegador, así que quien lea studia_users
// ve los tokens; la solución real es una sesión validada en servidor (cookie HttpOnly).

const USER_KEY = 'studia_user'

export type SessionUser = Pick<User, 'id' | 'name' | 'email'>

// useSyncExternalStore necesita la misma referencia mientras no cambie nada
let cachedKey: string | null = null
let cachedUser: SessionUser | null = null

const readToken = (): string | null => {
  try {
    return localStorage.getItem(USER_KEY) || null
  } catch {
    return null
  }
}

// Usuario de la sesión, o null si no hay sesión o el token no es de ningún usuario
export const readUser = (): SessionUser | null => {
  const token = readToken()
  const stored = token === null ? undefined : findUserByToken(token)
  const key = stored ? `${stored.id}|${stored.name}|${stored.email}` : null
  if (key === cachedKey) return cachedUser
  cachedKey = key
  cachedUser = stored
    ? { id: stored.id, name: stored.name, email: stored.email }
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
  const token = crypto.randomUUID()
  setSessionToken(id, token)
  try {
    localStorage.setItem(USER_KEY, token)
  } catch {}
  notify()
}

export const clearUser = () => {
  // Se invalida el token para que no se pueda reutilizar tras cerrar sesión
  const user = readUser()
  if (user) setSessionToken(user.id, null)
  try {
    localStorage.removeItem(USER_KEY)
  } catch {}
  notify()
}

// En el servidor no hay sesión: se pinta sin usuario y se corrige al hidratar
export const useUser = () => useSyncExternalStore(subscribe, readUser, () => null)
