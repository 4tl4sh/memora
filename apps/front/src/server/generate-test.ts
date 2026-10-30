import { createServerFn } from '@tanstack/react-start'
import type { Question, Subject } from '@tfm/types'

import { SUBJECT_LABELS } from '#/components/landing/data'
import { MAX_PDF_BYTES, isPdf } from '#/lib/pdf'
import { extractPdfText } from '#/server/pdf-to-text'

export type QuestionType = Extract<Question['type'], 'single' | 'multiple'>

export const QUESTION_COUNTS = [5, 10, 15] as const

const QUESTION_TYPES: QuestionType[] = ['single', 'multiple']

const OPTIONS_PER_QUESTION = 4

// Tope de texto enviado a la IA (~15k tokens): sobra para 15 preguntas y cuanto
// menos texto, antes responde Gemini y menos cuota gratuita se gasta
const MAX_TEXT_CHARS = 60_000

// Tope de respuesta: 15 preguntas con explicaciones cortas caben de sobra
const MAX_OUTPUT_TOKENS = 4096

// Lite: peor calidad que flash, pero mucho más rápido y menos saturado en el plan gratuito
const DEFAULT_MODEL = 'gemini-flash-lite-latest'

// Lo que se pide a Gemini: siempre correctIndexes, y luego se adapta al tipo elegido
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          statement: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctIndexes: { type: 'array', items: { type: 'integer' } },
          explanation: { type: 'string' },
        },
        required: ['statement', 'options', 'correctIndexes', 'explanation'],
      },
    },
  },
  required: ['title', 'questions'],
}

interface AiQuestion {
  statement?: unknown
  options?: unknown
  correctIndexes?: unknown
  explanation?: unknown
}

const buildPrompt = (count: number, type: QuestionType, subject: Subject) => {
  const answers =
    type === 'single'
      ? 'exactamente 1 opción correcta'
      : 'entre 2 y 3 opciones correctas'
  return [
    `Eres un profesor de ${SUBJECT_LABELS[subject]} que prepara tests de repaso en español.`,
    `A partir del temario que te da el usuario, crea exactamente ${count} preguntas tipo test.`,
    `Cada pregunta tiene ${OPTIONS_PER_QUESTION} opciones y ${answers}.`,
    'correctIndexes son las posiciones (empezando en 0) de las opciones correctas.',
    'Usa solo información del temario, no repitas preguntas y reparte las preguntas por todo el contenido.',
    'Enunciados y opciones concisos. Explicación de una sola frase (máximo 150 caracteres).',
    'Añade un título corto (máximo 60 caracteres) para el test.',
  ].join('\n')
}

// La IA puede equivocarse: se descartan las preguntas mal formadas
const toQuestions = (raw: unknown, type: QuestionType): Question[] => {
  if (!Array.isArray(raw)) return []
  const questions: Question[] = []
  for (const q of raw as AiQuestion[]) {
    const statement = typeof q.statement === 'string' ? q.statement.trim() : ''
    const options = Array.isArray(q.options)
      ? q.options.filter((o): o is string => typeof o === 'string').map((o) => o.trim())
      : []
    const indexes = Array.isArray(q.correctIndexes)
      ? [...new Set(q.correctIndexes)].filter(
          (i): i is number => Number.isInteger(i) && i >= 0 && i < options.length,
        )
      : []
    if (!statement || options.length !== OPTIONS_PER_QUESTION || options.some((o) => !o))
      continue
    if (type === 'single' ? indexes.length !== 1 : indexes.length < 2) continue

    const base = {
      id: questions.length + 1,
      statement,
      options,
      ...(typeof q.explanation === 'string' && q.explanation.trim()
        ? { explanation: q.explanation.trim() }
        : {}),
    }
    questions.push(
      type === 'single'
        ? { ...base, type, correctIndex: indexes[0] }
        : { ...base, type, correctIndexes: indexes.sort((a, b) => a - b) },
    )
  }
  return questions
}

// Errores de Gemini traducidos a algo que se pueda enseñar al usuario
const aiErrorMessage = (err: unknown) => {
  const status =
    err && typeof err === 'object' && 'status' in err ? err.status : undefined
  if (status === 429)
    return 'Se ha alcanzado el límite gratuito de la IA. Prueba de nuevo en un minuto.'
  if (status === 400 || status === 401 || status === 403)
    return 'La clave de la IA no es válida. Revisa GEMINI_API_KEY.'
  if (status === 503) return 'La IA está saturada ahora mismo. Inténtalo de nuevo.'
  return 'La IA no ha podido generar el test. Inténtalo de nuevo.'
}

// Genera el test en el servidor: PDF → texto → Gemini → preguntas.
// Al navegador solo vuelven las preguntas; ni el texto del PDF ni la API key.
export const generateTest = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error('Formato de petición no válido')
    const file = data.get('file')
    if (!(file instanceof File)) throw new Error('Falta el fichero')
    if (!isPdf(file)) throw new Error('El fichero debe ser un PDF')
    if (file.size > MAX_PDF_BYTES) throw new Error('El PDF no puede superar 5 MB')

    const count = Number(data.get('count'))
    if (!QUESTION_COUNTS.some((n) => n === count))
      throw new Error('Número de preguntas no válido')
    const type = data.get('type')
    if (!QUESTION_TYPES.some((t) => t === type))
      throw new Error('Tipo de preguntas no válido')
    const subject = data.get('subject')
    if (typeof subject !== 'string' || !(subject in SUBJECT_LABELS))
      throw new Error('Materia no válida')

    return { file, count, type: type as QuestionType, subject: subject as Subject }
  })
  .handler(async ({ data: { file, count, type, subject } }) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('Falta configurar GEMINI_API_KEY en el servidor')

    let start = Date.now()
    const { text, pages } = await extractPdfText(file)
    console.info(`PDF a texto: ${Date.now() - start} ms (${pages} páginas)`)
    if (!text)
      throw new Error('El PDF no tiene texto seleccionable (¿es un documento escaneado?)')

    // Import dinámico: el SDK de Gemini solo hace falta en el servidor
    const { GoogleGenAI, ThinkingLevel } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
    let raw: string | undefined
    start = Date.now()
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Temario:\n\n${text.slice(0, MAX_TEXT_CHARS)}`,
        config: {
          systemInstruction: buildPrompt(count, type, subject),
          responseMimeType: 'application/json',
          responseJsonSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          // Sin apenas razonamiento previo: es lo que más tiempo se llevaba
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      })
      raw = response.text
    } catch (err) {
      console.error('Error de Gemini', err)
      throw new Error(aiErrorMessage(err))
    }
    console.info(`Gemini (${model}): ${Date.now() - start} ms`)

    let parsed: { title?: unknown; questions?: unknown } = {}
    try {
      parsed = raw ? JSON.parse(raw) : {}
    } catch {}
    const questions = toQuestions(parsed.questions, type).slice(0, count)
    if (questions.length === 0)
      throw new Error('La IA no ha devuelto preguntas válidas. Inténtalo de nuevo.')

    const title =
      typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 80) : ''
    return { title, pages, questions }
  })
