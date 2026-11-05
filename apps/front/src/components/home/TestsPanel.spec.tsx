import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { NewTest, Subject } from '@tfm/types'

import { addTest } from '#/lib/tests-storage'
import { renderWithRouter } from '#/test/render-with-router'
import { TestsPanel } from './TestsPanel'

// El panel incluye el diálogo de crear test, que importa la server function:
// se sustituye para no cargar el servidor de TanStack Start en los tests
vi.mock('#/server/generate-test', () => ({ generateTest: vi.fn() }))

const user = { id: 1, name: 'Lucía', email: 'lucia@correo.com' }

const newTest = (title: string, subject: Subject): NewTest => ({
  title,
  subject,
  status: 'private',
  source: { kind: 'pdf', fileName: `${title}.pdf`, pages: 1 },
  questions: [
    { id: 1, type: 'true-false', statement: 'Afirmación', correct: true },
  ],
})

const renderPanel = (
  filters: { subjectFilter?: Subject | null; query?: string } = {},
) => {
  const props = {
    user,
    subjectFilter: filters.subjectFilter ?? null,
    query: filters.query ?? '',
    onSubjectFilterChange: vi.fn(),
    onQueryChange: vi.fn(),
  }
  return { ...renderWithRouter(<TestsPanel {...props} />), props }
}

const testTitles = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => within(item).getAllByRole('button')[0].textContent)

describe('TestsPanel', () => {
  beforeEach(() => {
    addTest(newTest('Revolución francesa', 'historia'), 1)
    addTest(newTest('Tabla periódica', 'quimica'), 1)
    // De otro usuario: no debe verse
    addTest(newTest('Test ajeno', 'historia'), 2)
  })

  it('debería mostrar solo los tests del usuario', async () => {
    renderPanel()

    expect(
      await screen.findByRole('heading', { name: 'Hola, Lucía' }),
    ).toBeInTheDocument()
    expect(testTitles()).toEqual(['Revolución francesa', 'Tabla periódica'])
  })

  it('debería filtrar por la materia que llega de la URL', async () => {
    renderPanel({ subjectFilter: 'quimica' })

    await screen.findByRole('heading', { name: 'Hola, Lucía' })
    expect(testTitles()).toEqual(['Tabla periódica'])
    expect(screen.getByRole('button', { name: 'Química' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('debería buscar sin tener en cuenta mayúsculas ni tildes', async () => {
    renderPanel({ query: 'REVOLUCION' })

    await screen.findByRole('heading', { name: 'Hola, Lucía' })
    expect(testTitles()).toEqual(['Revolución francesa'])
  })

  it('debería avisar cuando ningún test coincide con la búsqueda', async () => {
    renderPanel({ query: 'zzz' })

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ningún test coincide con tu búsqueda.',
    )
  })

  it('debería pedir el cambio de filtro al pulsar una materia y al escribir', async () => {
    // Arrange
    const userEv = userEvent.setup()
    const { props } = renderPanel()

    // Act
    await userEv.click(await screen.findByRole('button', { name: 'Historia' }))
    await userEv.type(
      screen.getByRole('searchbox', { name: 'Buscar test por título' }),
      'a',
    )

    // Assert
    expect(props.onSubjectFilterChange).toHaveBeenCalledWith('historia')
    expect(props.onQueryChange).toHaveBeenCalledWith('a')
  })

  it('debería mostrar el estado vacío si el usuario no tiene tests', async () => {
    localStorage.clear()
    renderPanel()

    expect(
      await screen.findByText('Todavía no tienes tests'),
    ).toBeInTheDocument()
  })
})
