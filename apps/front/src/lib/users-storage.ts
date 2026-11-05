import type { User } from '@tfm/types'

// Usuarios registrados: de momento viven solo en localStorage, sin servidor.
// Simulación: la contraseña se guarda en claro. Con un backend real iría hasheada en el servidor.

export const USERS_KEY = 'studia_users'

// sessionToken: token aleatorio de la sesión abierta (ver session-storage.ts)
export type StoredUser = User & { password: string; sessionToken?: string }

export interface Registration {
  name: string
  email: string
  password: string
}

export type RegisterResult =
  | { ok: true; user: StoredUser }
  | { ok: false; error: 'email-taken' }

const EMPTY: StoredUser[] = []

// Misma idea que en tests-storage: se reutiliza el array mientras el texto no cambie
let cachedRaw: string | null = null
let cachedUsers: StoredUser[] = EMPTY

export const readUsers = (): StoredUser[] => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(USERS_KEY)
  } catch {}
  if (raw === cachedRaw) return cachedUsers
  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY
    cachedUsers = Array.isArray(parsed) ? (parsed as StoredUser[]) : EMPTY
  } catch {
    cachedUsers = EMPTY
  }
  return cachedUsers
}

const saveUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const registerUser = ({
  name,
  email,
  password,
}: Registration): RegisterResult => {
  const users = readUsers()
  const normalized = normalizeEmail(email)
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: 'email-taken' }
  }
  const user: StoredUser = {
    id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
    name: name.trim(),
    email: normalized,
    password,
    planId: 'gratis',
    preferences: { theme: 'teal', darkMode: false, dailyGoal: 10 },
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  return { ok: true, user }
}

// Solo pueden entrar los usuarios registrados con su email y contraseña
export const authenticate = (
  email: string,
  password: string,
): StoredUser | null => {
  const normalized = normalizeEmail(email)
  return (
    readUsers().find(
      (u) => u.email === normalized && u.password === password,
    ) ?? null
  )
}

export const findUserByToken = (token: string): StoredUser | undefined =>
  readUsers().find((u) => u.sessionToken === token)

// Asocia (o con null, invalida) el token de sesión de un usuario
export const setSessionToken = (id: User['id'], token: string | null) => {
  saveUsers(
    readUsers().map((u) => {
      if (u.id !== id) return u
      const { sessionToken: _, ...rest } = u
      return token ? { ...rest, sessionToken: token } : rest
    }),
  )
}
