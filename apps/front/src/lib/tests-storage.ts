import { useSyncExternalStore } from 'react'
import type { NewTest, Test } from '@tfm/types'

// Tests del usuario: de momento viven solo en localStorage, sin servidor.

const TESTS_KEY = 'memora_tests'

const EMPTY: Test[] = []

// useSyncExternalStore necesita la misma referencia mientras no cambie nada:
// se guarda el último texto leído y su array ya parseado
let cachedRaw: string | null = null
let cachedTests: Test[] = EMPTY

export const readTests = (): Test[] => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(TESTS_KEY)
  } catch {}
  if (raw === cachedRaw) return cachedTests
  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY
    cachedTests = Array.isArray(parsed) ? (parsed as Test[]) : EMPTY
  } catch {
    cachedTests = EMPTY
  }
  return cachedTests
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // Otra pestaña puede cambiar los tests
  const onStorage = (e: StorageEvent) => e.key === TESTS_KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const saveTests = (tests: Test[]) => {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests))
  } catch {}
  notify()
}

// Sin usuarios reales todavía: todos los tests son del usuario 0
export const addTest = (newTest: NewTest): Test => {
  const tests = readTests()
  const now = new Date().toISOString()
  const test: Test = {
    ...newTest,
    id: tests.reduce((max, t) => Math.max(max, t.id), 0) + 1,
    ownerId: 0,
    createdAt: now,
    updatedAt: now,
  }
  saveTests([...tests, test])
  return test
}

export const deleteTest = (id: Test['id']) =>
  saveTests(readTests().filter((t) => t.id !== id))

// En el servidor no hay localStorage: se pinta la lista vacía y se rellena al hidratar
export const useTests = () =>
  useSyncExternalStore(subscribe, readTests, () => EMPTY)
