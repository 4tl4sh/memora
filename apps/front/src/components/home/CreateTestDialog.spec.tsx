import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { setUser } from '#/lib/session-storage'
import { readTests } from '#/lib/tests-storage'
import { registerUser } from '#/lib/users-storage'
import { generateTest } from '#/server/generate-test'
import { CreateTestDialog } from './CreateTestDialog'

// La server function sale del proceso (servidor + IA): es lo único que se mockea
vi.mock('#/server/generate-test', () => ({ generateTest: vi.fn() }))

const pdf = new File(['%PDF'], 'tema1.pdf', { type: 'application/pdf' })

const questions = [
  {
    id: 1,
    type: 'true-false' as const,
    statement: 'Afirmación',
    correct: true,
  },
]

const openAiForm = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<CreateTestDialog open onClose={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: /Con asistencia de IA/ }))
}

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.upload(screen.getByLabelText('Temario en PDF'), pdf)
  await user.click(screen.getByRole('radio', { name: '5' }))
  await user.click(screen.getByRole('radio', { name: 'Verdadero o falso' }))
  await user.click(screen.getByRole('radio', { name: 'Groq' }))
  await user.selectOptions(screen.getByLabelText('Materia'), 'historia')
}

describe('CreateTestDialog', () => {
  beforeEach(() => {
    const result = registerUser({
      name: 'Lucía',
      email: 'lucia@correo.com',
      password: 'secreta',
    })
    if (result.ok) setUser(result.user.id)
  })

  it('debería tener el botón Crear desactivado hasta completar el formulario', async () => {
    const user = userEvent.setup()
    await openAiForm(user)

    expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled()

    await fillForm(user)

    expect(screen.getByRole('button', { name: 'Crear' })).toBeEnabled()
  })

  it('debería enviar las opciones al servidor y guardar el test generado', async () => {
    // Arrange
    vi.mocked(generateTest).mockResolvedValue({
      title: 'La Revolución',
      pages: 3,
      questions,
    })
    const user = userEvent.setup()
    await openAiForm(user)
    await fillForm(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    // Assert
    expect(generateTest).toHaveBeenCalledTimes(1)
    const [{ data }] = vi.mocked(generateTest).mock.calls[0]
    expect(data).toBeInstanceOf(FormData)
    expect(Object.fromEntries((data as FormData).entries())).toMatchObject({
      count: '5',
      type: 'true-false',
      subject: 'historia',
      model: 'groq',
    })
    expect(readTests()).toEqual([
      expect.objectContaining({
        title: 'La Revolución',
        subject: 'historia',
        ownerId: 1,
        source: { kind: 'pdf', fileName: 'tema1.pdf', pages: 3 },
      }),
    ])
  })

  it('debería mostrar el error del servidor y no guardar nada', async () => {
    vi.mocked(generateTest).mockRejectedValue(
      new Error('La IA está saturada ahora mismo. Inténtalo de nuevo.'),
    )
    const user = userEvent.setup()
    await openAiForm(user)
    await fillForm(user)

    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La IA está saturada',
    )
    expect(readTests()).toEqual([])
  })

  it('debería cancelar la generación sin mostrar ningún error', async () => {
    // Arrange: la petición no termina hasta que se cancela
    vi.mocked(generateTest).mockImplementation(
      ({ signal }: { signal?: AbortSignal }) =>
        new Promise((_, reject) =>
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Cancelado', 'AbortError')),
          ),
        ),
    )
    const user = userEvent.setup()
    await openAiForm(user)
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Crear' }))
    expect(
      await screen.findByRole('button', { name: /Generando test/ }),
    ).toBeDisabled()

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    // Assert
    expect(await screen.findByRole('button', { name: 'Crear' })).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(readTests()).toEqual([])
  })
})
