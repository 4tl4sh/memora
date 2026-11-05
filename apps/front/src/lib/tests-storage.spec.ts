import type { NewTest } from '@tfm/types'

import { addTest, deleteTest, parseTests, readTests } from './tests-storage'

const newTest: NewTest = {
  title: 'Tema 1',
  subject: 'historia',
  status: 'private',
  source: { kind: 'pdf', fileName: 'tema1.pdf', pages: 2 },
  questions: [
    {
      id: 1,
      type: 'true-false',
      statement: 'Colón llegó a América en 1492.',
      correct: true,
    },
  ],
}

describe('addTest', () => {
  it('debería guardar el test con id, dueño y fechas', () => {
    const test = addTest(newTest, 7)

    expect(test).toMatchObject({ ...newTest, id: 1, ownerId: 7 })
    expect(test.createdAt).toBe(test.updatedAt)
    expect(readTests()).toEqual([test])
  })

  it('debería dar el siguiente id al mayor que ya existe', () => {
    addTest(newTest, 1)
    addTest(newTest, 1)

    expect(addTest(newTest, 2).id).toBe(3)
  })

  it('no debería modificar la lista leída antes de añadir', () => {
    addTest(newTest, 1)
    const before = readTests()

    addTest(newTest, 1)

    expect(before).toHaveLength(1)
    expect(readTests()).toHaveLength(2)
  })
})

describe('deleteTest', () => {
  it('debería borrar solo el test indicado', () => {
    addTest(newTest, 1)
    addTest({ ...newTest, title: 'Tema 2' }, 1)

    deleteTest(1)

    expect(readTests().map((t) => t.title)).toEqual(['Tema 2'])
  })
})

describe('parseTests', () => {
  it('debería descartar los tests mal formados y conservar los válidos', () => {
    // Arrange
    const valid = addTest(newTest, 1)
    const raw = JSON.stringify([
      valid,
      { ...valid, id: 2, subject: 'magia' },
      'no soy un test',
    ])

    // Act + Assert
    expect(parseTests(raw)).toEqual([valid])
  })

  it('debería devolver una lista vacía si el texto no es JSON', () => {
    expect(parseTests('{roto')).toEqual([])
  })
})
