import { describe, expect, it } from 'vitest'

import {
  assertNever,
  checkAnswer,
  countTestsByStatus,
  questionSchema,
  testSchema,
  updateTest,
} from './index'
import type { Question, Test } from './index'

const single: Question = {
  id: 1,
  type: 'single',
  statement: '¿Capital de Francia?',
  options: ['Roma', 'París', 'Berlín', 'Lisboa'],
  correctIndex: 1,
}

const multiple: Question = {
  id: 2,
  type: 'multiple',
  statement: '¿Cuáles son gases nobles?',
  options: ['Helio', 'Oxígeno', 'Neón', 'Hierro'],
  correctIndexes: [0, 2],
}

const trueFalse: Question = {
  id: 3,
  type: 'true-false',
  statement: 'El agua hierve a 100 ºC al nivel del mar.',
  correct: true,
}

const makeTest = (overrides: Partial<Test> = {}): Test => ({
  id: 1,
  ownerId: 1,
  title: 'Repaso',
  subject: 'historia',
  status: 'private',
  source: { kind: 'pdf', fileName: 'tema1.pdf', pages: 3 },
  questions: [single],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('checkAnswer', () => {
  it('debería dar por buena la opción correcta de una pregunta simple', () => {
    expect(checkAnswer(single, 1)).toBe(true)
  })

  it('debería dar por mala otra opción de una pregunta simple', () => {
    expect(checkAnswer(single, 0)).toBe(false)
  })

  it('debería aceptar las correctas de una múltiple en cualquier orden', () => {
    expect(checkAnswer(multiple, [2, 0])).toBe(true)
  })

  it('debería dar por mala una múltiple incompleta o con una opción de más', () => {
    expect(checkAnswer(multiple, [0])).toBe(false)
    expect(checkAnswer(multiple, [0, 2, 3])).toBe(false)
  })

  it('debería dar por mala una múltiple respondida con un solo número', () => {
    expect(checkAnswer(multiple, 0)).toBe(false)
  })

  it('debería corregir verdadero o falso comparando el booleano', () => {
    expect(checkAnswer(trueFalse, true)).toBe(true)
    expect(checkAnswer(trueFalse, false)).toBe(false)
  })
})

describe('assertNever', () => {
  it('debería lanzar un error si se llega a un caso no contemplado', () => {
    expect(() => assertNever('nuevo' as never)).toThrow('Caso no contemplado')
  })
})

describe('updateTest', () => {
  it('debería aplicar los cambios y la fecha sin modificar el test original', () => {
    // Arrange
    const test = makeTest()
    const copy = { ...test }

    // Act
    const updated = updateTest(test, { title: 'Nuevo' }, '2026-02-01')

    // Assert
    expect(updated).toEqual({
      ...test,
      title: 'Nuevo',
      updatedAt: '2026-02-01',
    })
    expect(updated).not.toBe(test)
    expect(test).toEqual(copy)
  })
})

describe('countTestsByStatus', () => {
  it('debería devolver 0 en cada estado cuando no hay tests', () => {
    expect(countTestsByStatus([])).toEqual({ public: 0, private: 0 })
  })

  it('debería contar los tests de cada estado', () => {
    const tests = [
      makeTest({ id: 1, status: 'public' }),
      makeTest({ id: 2, status: 'private' }),
      makeTest({ id: 3, status: 'private' }),
    ]
    expect(countTestsByStatus(tests)).toEqual({ public: 1, private: 2 })
  })
})

describe('esquemas', () => {
  it('debería aceptar un test bien formado', () => {
    expect(testSchema.safeParse(makeTest()).success).toBe(true)
  })

  it('debería rechazar un test con una materia que no existe', () => {
    const result = testSchema.safeParse({ ...makeTest(), subject: 'magia' })
    expect(result.success).toBe(false)
  })

  it('debería rechazar una pregunta simple sin correctIndex', () => {
    const { correctIndex: _, ...broken } = single as Extract<
      Question,
      { type: 'single' }
    >
    expect(questionSchema.safeParse(broken).success).toBe(false)
  })
})
