import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Test } from '@tfm/types'

import { renderWithRouter } from '#/test/render-with-router'
import { TestRunner } from './TestRunner'

// El confeti dibuja en un canvas, que jsdom no tiene: se sustituye por nada
vi.mock('canvas-confetti', () => ({
  default: { create: () => Object.assign(() => {}, { reset: () => {} }) },
}))

const test: Test = {
  id: 1,
  ownerId: 1,
  title: 'Repaso de química',
  subject: 'quimica',
  status: 'private',
  source: { kind: 'pdf', fileName: 'quimica.pdf', pages: 1 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 1,
      type: 'single',
      statement: '¿Símbolo del oro?',
      options: ['Ag', 'Au', 'Fe', 'O'],
      correctIndex: 1,
    },
    {
      id: 2,
      type: 'multiple',
      statement: '¿Cuáles son gases nobles?',
      options: ['Helio', 'Oxígeno', 'Neón', 'Hierro'],
      correctIndexes: [0, 2],
    },
    {
      id: 3,
      type: 'true-false',
      statement: 'El agua es H2O.',
      correct: true,
      explanation: 'Dos de hidrógeno y uno de oxígeno.',
    },
  ],
}

const question = (statement: string) =>
  screen.getByRole('group', { name: new RegExp(statement.replace('?', '\\?')) })

const answerAll = async (
  user: ReturnType<typeof userEvent.setup>,
  { multiple = ['Helio', 'Neón'] } = {},
) => {
  await user.click(
    within(question('¿Símbolo del oro?')).getByRole('radio', { name: 'Au' }),
  )
  for (const option of multiple)
    await user.click(
      within(question('¿Cuáles son gases nobles?')).getByRole('checkbox', {
        name: option,
      }),
    )
  await user.click(
    within(question('El agua es H2O.')).getByRole('radio', {
      name: 'Verdadero',
    }),
  )
}

describe('TestRunner', () => {
  it('debería mostrar el título y todas las preguntas', async () => {
    renderWithRouter(<TestRunner test={test} />)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Repaso de química',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(3)
  })

  it('no debería dejar finalizar hasta responder todas las preguntas', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<TestRunner test={test} />)
    const finish = await screen.findByRole('button', { name: 'Finalizar test' })

    // Act
    await user.click(
      within(question('¿Símbolo del oro?')).getByRole('radio', { name: 'Au' }),
    )

    // Assert
    expect(screen.getByText(/respondidas/)).toHaveTextContent(
      '1 de 3 respondidas',
    )
    expect(finish).toBeDisabled()
  })

  it('debería mostrar el resultado perfecto al acertarlas todas', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestRunner test={test} />)
    await screen.findByRole('heading', { level: 1 })

    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar test' }))

    expect(
      await screen.findByRole('heading', { name: '¡Perfecto!' }),
    ).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('debería contar como fallada una múltiple a la que le falta una opción', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<TestRunner test={test} />)
    await screen.findByRole('heading', { level: 1 })

    // Act
    await answerAll(user, { multiple: ['Helio'] })
    await user.click(screen.getByRole('button', { name: 'Finalizar test' }))

    // Assert
    expect(
      await screen.findByRole('heading', { name: 'Test terminado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('debería corregir cada pregunta al revisar el resultado', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestRunner test={test} />)
    await screen.findByRole('heading', { level: 1 })
    await answerAll(user, { multiple: ['Helio'] })
    await user.click(screen.getByRole('button', { name: 'Finalizar test' }))

    await user.click(
      await screen.findByRole('button', { name: 'Revisar resultado' }),
    )

    expect(
      within(question('¿Cuáles son gases nobles?')).getByText('Fallada'),
    ).toBeInTheDocument()
    expect(
      within(question('El agua es H2O.')).getByText('Acertada'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Dos de hidrógeno y uno de oxígeno.'),
    ).toBeInTheDocument()
  })

  it('debería empezar de cero al repetir el test', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestRunner test={test} />)
    await screen.findByRole('heading', { level: 1 })
    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar test' }))
    await user.click(
      await screen.findByRole('button', { name: 'Revisar resultado' }),
    )

    await user.click(screen.getByRole('button', { name: 'Repetir test' }))

    expect(screen.getByText(/respondidas/)).toHaveTextContent(
      '0 de 3 respondidas',
    )
    expect(screen.getByRole('radio', { name: 'Au' })).not.toBeChecked()
  })

  it('debería volver al panel al cerrar el resultado', async () => {
    const user = userEvent.setup()
    const { navigateSpy } = renderWithRouter(<TestRunner test={test} />)
    await screen.findByRole('heading', { level: 1 })
    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar test' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getAllByRole('button', { name: 'Cerrar' })[1],
    )

    expect(navigateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/studia/private/' }),
    )
  })
})
