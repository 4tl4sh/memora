import {
  AiHttpError,
  aiErrorMessage,
  buildPrompt,
  callGroq,
  parseAiResponse,
  resolveType,
  toQuestions,
} from './ai'

const aiQuestion = (overrides: Record<string, unknown> = {}) => ({
  statement: '¿Capital de Francia?',
  options: ['Roma', 'París', 'Berlín', 'Lisboa'],
  correctIndexes: [1],
  explanation: 'París es la capital.',
  ...overrides,
})

describe('resolveType', () => {
  it('en un test mixto debería deducir el tipo por las respuestas correctas', () => {
    expect(resolveType('mixed', 1)).toBe('single')
    expect(resolveType('mixed', 2)).toBe('multiple')
  })

  it('debería descartar una pregunta que no es del tipo pedido', () => {
    expect(resolveType('single', 2)).toBeNull()
    expect(resolveType('multiple', 1)).toBeNull()
  })

  it('debería descartar una pregunta sin respuestas correctas', () => {
    expect(resolveType('mixed', 0)).toBeNull()
  })
})

describe('toQuestions', () => {
  it('debería convertir una pregunta simple válida', () => {
    expect(toQuestions([aiQuestion()], 'single')).toEqual([
      {
        id: 1,
        type: 'single',
        statement: '¿Capital de Francia?',
        options: ['Roma', 'París', 'Berlín', 'Lisboa'],
        correctIndex: 1,
        explanation: 'París es la capital.',
      },
    ])
  })

  it('debería descartar las preguntas mal formadas y quedarse con el resto', () => {
    // Arrange
    const raw = [
      aiQuestion({ options: 'no es un array' }),
      aiQuestion({ statement: '   ' }),
      aiQuestion({ correctIndexes: [9] }),
      null,
      aiQuestion({ statement: 'Válida' }),
    ]

    // Act
    const questions = toQuestions(raw, 'single')

    // Assert
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({ id: 1, statement: 'Válida' })
  })

  it('debería ordenar las respuestas de una múltiple y quitar repetidas', () => {
    const [question] = toQuestions(
      [aiQuestion({ correctIndexes: [3, 0, 3] })],
      'multiple',
    )
    expect(question).toMatchObject({ type: 'multiple', correctIndexes: [0, 3] })
  })

  it('debería descartar una pregunta que no tiene 4 opciones', () => {
    const questions = toQuestions(
      [aiQuestion({ options: ['Verdadero', 'Falso'], correctIndexes: [0] })],
      'mixed',
    )
    expect(questions).toEqual([])
  })
})

describe('parseAiResponse', () => {
  it('debería devolver título y preguntas de un JSON válido', () => {
    const raw = JSON.stringify({ title: 'Tema 1', questions: [aiQuestion()] })
    expect(parseAiResponse(raw)).toEqual({
      title: 'Tema 1',
      questions: [aiQuestion()],
    })
  })

  it.each([
    ['vacío', undefined],
    ['texto que no es JSON', 'no soy JSON'],
    ['JSON sin preguntas', '{"title": 3}'],
  ])('debería devolver una lista vacía con %s', (_, raw) => {
    expect(parseAiResponse(raw).questions).toEqual([])
  })
})

describe('buildPrompt', () => {
  it('debería pedir el número de preguntas y la materia', () => {
    const prompt = buildPrompt(10, 'single', 'historia')
    expect(prompt).toContain('exactamente 10 preguntas')
    expect(prompt).toContain('Historia')
  })

  it('en un test mixto debería repartir las preguntas entre simples y múltiples', () => {
    const prompt = buildPrompt(5, 'mixed', 'quimica')
    expect(prompt).toContain(
      '3 preguntas deben tener exactamente 1 opción correcta y 2 preguntas deben tener entre 2 y 3 opciones correctas',
    )
    expect(prompt).not.toContain('verdadero o falso')
  })
})

describe('aiErrorMessage', () => {
  it.each([
    [429, 'límite gratuito'],
    [401, 'clave de la IA no es válida'],
    [503, 'saturada'],
    [500, 'no ha podido generar'],
  ])('debería traducir un %i', (status, text) => {
    expect(aiErrorMessage({ status }, 'GROQ_API_KEY')).toContain(text)
  })
})

describe('callGroq', () => {
  const signal = new AbortController().signal

  it('debería llamar a Groq con la clave y devolver el contenido', async () => {
    // Arrange: no se llama a la API de verdad, fetch devuelve lo que decidimos
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: '{"a":1}' } }] }),
          { status: 200 },
        ),
      )

    // Act
    const result = await callGroq('clave', 'sistema', 'temario', signal)

    // Assert
    expect(result.raw).toBe('{"a":1}')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toContain('api.groq.com')
    expect(init?.method).toBe('POST')
    expect(init?.signal).toBe(signal)
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer clave' })
  })

  it.each([429, 503])(
    'debería lanzar un AiHttpError con el estado %i',
    async (status) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('error', { status }),
      )

      const promise = callGroq('clave', 'sistema', 'temario', signal)

      await expect(promise).rejects.toBeInstanceOf(AiHttpError)
      await expect(promise).rejects.toMatchObject({ status })
    },
  )

  it('debería dejar pasar el error si falla la red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )

    await expect(
      callGroq('clave', 'sistema', 'temario', signal),
    ).rejects.toThrow('Failed to fetch')
  })
})
