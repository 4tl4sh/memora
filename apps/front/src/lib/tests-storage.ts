import { useMemo, useSyncExternalStore } from 'react'
import { updateTest } from '@tfm/types'
import type { NewTest, Test, TestChanges } from '@tfm/types'

// Tests de los usuarios: de momento viven solo en localStorage, sin servidor.
// Cada test pertenece a quien lo creó (ownerId) y solo él lo ve.

const TESTS_KEY = 'studia_tests'

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

export const addTest = (newTest: NewTest, ownerId: Test['ownerId']): Test => {
  const tests = readTests()
  const now = new Date().toISOString()
  const test: Test = {
    ...newTest,
    id: tests.reduce((max, t) => Math.max(max, t.id), 0) + 1,
    ownerId,
    createdAt: now,
    updatedAt: now,
  }
  saveTests([...tests, test])
  return test
}

// Aplica los cambios a un test (updateTest de @tfm/types pone la fecha de modificación)
export const editTest = (id: Test['id'], changes: TestChanges) =>
  saveTests(
    readTests().map((t) =>
      t.id === id ? updateTest(t, changes, new Date().toISOString()) : t,
    ),
  )

// Copia un test como manual: no arrastra el origen (PDF) y se puede editar libremente
export const duplicateAsManual = (
  test: Test,
  ownerId: Test['ownerId'],
): Test =>
  addTest(
    {
      title: `${test.title} (copia)`,
      subject: test.subject,
      status: test.status,
      source: { kind: 'Manual' },
      questions: structuredClone(test.questions),
    },
    ownerId,
  )

export const deleteTest = (id: Test['id']) =>
  saveTests(readTests().filter((t) => t.id !== id))

// En el servidor no hay localStorage: se pinta la lista vacía y se rellena al hidratar
export const useTests = () =>
  useSyncExternalStore(subscribe, readTests, () => EMPTY)

// Solo los tests del usuario indicado
export const useUserTests = (ownerId: Test['ownerId'] | undefined) => {
  const tests = useTests()
  return useMemo(
    () =>
      ownerId === undefined
        ? EMPTY
        : tests.filter((t) => t.ownerId === ownerId),
    [tests, ownerId],
  )
}

// Un test por id; undefined si no existe, es de otro usuario o aún no se ha hidratado
export const useTest = (
  id: Test['id'],
  ownerId: Test['ownerId'] | undefined,
) =>
  useTests().find(
    (t) => t.id === id && ownerId !== undefined && t.ownerId === ownerId,
  )
