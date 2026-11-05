import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Question, Subject } from '@tfm/types'

import { SUBJECT_LABELS } from '#/components/landing/data'
import { generateTestInputSchema } from '#/lib/schemas'
import type { AiModel, TestQuestionType } from '#/lib/schemas'
import { getRequest } from '@tanstack/react-start/server'
import { extractPdfText } from '#/server/pdf-to-text'
import { isAbortError, withRetry } from '#/server/retry'

// Tipo de una pregunta concreta
export type QuestionType = Question['type']

const OPTIONS_PER_QUESTION = 4

// Tope de texto enviado a la IA (~15k tokens): sobra para 15 preguntas y cuanto
// menos texto, antes responde Gemini y menos cuota gratuita se gasta
const MAX_TEXT_CHARS = 60_000

// Groq gratuito tiene un límite bajo de tokens por minuto: se manda menos texto
// (~5k tokens), que además hace que responda antes
const MAX_GROQ_TEXT_CHARS = 20_000

// Tope de respuesta: 15 preguntas con explicaciones cortas caben de sobra
const MAX_OUTPUT_TOKENS = 4096

// Lite: peor calidad que flash, pero mucho más rápido y menos saturado en el plan gratuito
const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest'

// gpt-oss-20b: de los más rápidos de Groq y admite JSON con esquema estricto
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b'

// Tiempo máximo de cada llamada a la IA: si no responde, se corta en vez de esperar sin fin
const AI_TIMEOUT_MS = 60_000

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const API_KEYS: Record<AiModel, string> = {
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
}

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

// El modo estricto de Groq exige additionalProperties: false en cada objeto
const GROQ_SCHEMA = {
  ...RESPONSE_SCHEMA,
  additionalProperties: false,
  properties: {
    ...RESPONSE_SCHEMA.properties,
    questions: {
      ...RESPONSE_SCHEMA.properties.questions,
      items: {
        ...RESPONSE_SCHEMA.properties.questions.items,
        additionalProperties: false,
      },
    },
  },
}

// Lo que devuelve la IA, validado con Zod: puede equivocarse o devolver algo a medias
const aiQuestionSchema = z.object({
  statement: z.string(),
  options: z.array(z.string()),
  correctIndexes: z.array(z.number().int()),
  explanation: z.string().optional(),
})

const aiResponseSchema = z.object({
  title: z.string().optional().catch(undefined),
  // Cada pregunta se valida por separado (toQuestions): una mal formada no tira el test
  questions: z.array(z.unknown()).catch([]),
})

// Del texto de la IA a un objeto validado; si no es JSON o no encaja, vacío
export const parseAiResponse = (raw: string | undefined) => {
  let json: unknown
  try {
    json = raw ? JSON.parse(raw) : {}
  } catch {
    json = {}
  }
  const result = aiResponseSchema.safeParse(json)
  return result.success ? result.data : { title: undefined, questions: [] }
}

const SINGLE_ANSWER = 'exactamente 1 opción correcta'
const MULTIPLE_ANSWER = 'entre 2 y 3 opciones correctas'

// Verdadero o falso: se pide con el mismo esquema que el resto, con 2 opciones fijas
const TRUE_FALSE_OPTIONS = ['Verdadero', 'Falso']
const TRUE_FALSE_ANSWER = `el enunciado es una afirmación, options es exactamente ${JSON.stringify(
  TRUE_FALSE_OPTIONS,
)} y correctIndexes es [0] si la afirmación es verdadera o [1] si es falsa`

const buildPrompt = (count: number, type: TestQuestionType, subject: Subject) => {
  let answers: string
  if (type === 'mixed') {
    // Reparto en tres: lo que sobra va primero a simples y luego a múltiples
    const base = Math.floor(count / 3)
    const rest = count % 3
    const singles = base + (rest > 0 ? 1 : 0)
    const multiples = base + (rest > 1 ? 1 : 0)
    const trueFalse = base
    answers = [
      `${singles} preguntas de respuesta simple: ${OPTIONS_PER_QUESTION} opciones y ${SINGLE_ANSWER}.`,
      `${multiples} preguntas de respuesta múltiple: ${OPTIONS_PER_QUESTION} opciones y ${MULTIPLE_ANSWER}.`,
      `${trueFalse} preguntas de verdadero o falso: ${TRUE_FALSE_ANSWER}.`,
      'Intercala los tres tipos de pregunta a lo largo del test, no los agrupes.',
    ].join('\n')
  } else if (type === 'true-false') {
    answers = [
      `Todas las preguntas son de verdadero o falso: ${TRUE_FALSE_ANSWER}.`,
      'Equilibra afirmaciones verdaderas y falsas.',
    ].join('\n')
  } else {
    answers = `Cada pregunta tiene ${OPTIONS_PER_QUESTION} opciones y ${
      type === 'single' ? SINGLE_ANSWER : MULTIPLE_ANSWER
    }.`
  }
  return [
    `Eres un profesor de ${SUBJECT_LABELS[subject]} que prepara tests de repaso en español.`,
    `A partir del temario que te da el usuario, crea exactamente ${count} preguntas tipo test.`,
    answers,
    'correctIndexes son las posiciones (empezando en 0) de las opciones correctas.',
    'Usa solo información del temario, no repitas preguntas y reparte las preguntas por todo el contenido.',
    'Enunciados y opciones concisos. Explicación de una sola frase (máximo 150 caracteres).',
    'Añade un título corto (máximo 60 caracteres) para el test.',
  ].join('\n')
}

// Tipo de cada pregunta según sus opciones y respuestas correctas; null si no
// encaja con lo que eligió el usuario
export const resolveType = (
  type: TestQuestionType,
  options: number,
  correct: number,
): QuestionType | null => {
  let resolved: QuestionType | null = null
  if (options === TRUE_FALSE_OPTIONS.length && correct === 1) resolved = 'true-false'
  else if (options === OPTIONS_PER_QUESTION && correct === 1) resolved = 'single'
  else if (options === OPTIONS_PER_QUESTION && correct >= 2) resolved = 'multiple'
  return resolved && (type === 'mixed' || type === resolved) ? resolved : null
}

// Valor de la opción marcada en una pregunta de verdadero o falso, por su texto
// (no por su posición, por si la IA las devuelve en otro orden)
const trueFalseValue = (option: string): boolean | null => {
  const text = option.toLowerCase()
  if (text === 'verdadero' || text === 'true') return true
  if (text === 'falso' || text === 'false') return false
  return null
}

// La IA puede equivocarse: se descartan las preguntas mal formadas
export const toQuestions = (raw: unknown[], type: TestQuestionType): Question[] => {
  const questions: Question[] = []
  for (const item of raw) {
    const parsed = aiQuestionSchema.safeParse(item)
    if (!parsed.success) continue
    const q = parsed.data
    const statement = q.statement.trim()
    const options = q.options.map((o) => o.trim())
    const indexes = [...new Set(q.correctIndexes)].filter(
      (i) => i >= 0 && i < options.length,
    )
    if (!statement || options.some((o) => !o)) continue
    const questionType = resolveType(type, options.length, indexes.length)
    if (!questionType) continue

    const base = {
      id: questions.length + 1,
      statement,
      ...(q.explanation?.trim()
        ? { explanation: q.explanation.trim() }
        : {}),
    }
    if (questionType === 'true-false') {
      const values = options.map(trueFalseValue)
      // Tienen que ser justo una opción verdadera y otra falsa
      if (!values.includes(true) || !values.includes(false)) continue
      questions.push({
        ...base,
        type: questionType,
        correct: values[indexes[0]] === true,
      })
    } else if (questionType === 'single') {
      questions.push({ ...base, options, type: questionType, correctIndex: indexes[0] })
    } else {
      questions.push({
        ...base,
        options,
        type: questionType,
        correctIndexes: indexes.sort((a, b) => a - b),
      })
    }
  }
  return questions
}

// Errores de la IA traducidos a algo que se pueda enseñar al usuario
const aiErrorMessage = (err: unknown, keyName: string) => {
  const status =
    err && typeof err === 'object' && 'status' in err ? err.status : undefined
  if (status === 429)
    return 'Se ha alcanzado el límite gratuito de la IA. Prueba de nuevo en un minuto.'
  // Gemini responde 400 con una clave inválida; en Groq un 400 es otro fallo
  const badKey =
    status === 401 || status === 403 || (status === 400 && keyName === API_KEYS.gemini)
  if (badKey) return `La clave de la IA no es válida. Revisa ${keyName}.`
  if (status === 503) return 'La IA está saturada ahora mismo. Inténtalo de nuevo.'
  return 'La IA no ha podido generar el test. Inténtalo de nuevo.'
}

class AiHttpError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`HTTP ${status}: ${body}`)
  }
}

const callGemini = async (
  apiKey: string,
  system: string,
  text: string,
  signal: AbortSignal,
) => {
  // Import dinámico: el SDK de Gemini solo hace falta en el servidor
  const { GoogleGenAI, ThinkingLevel } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
  const response = await ai.models.generateContent({
    model,
    contents: `Temario:\n\n${text.slice(0, MAX_TEXT_CHARS)}`,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      responseJsonSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // Sin apenas razonamiento previo: es lo que más tiempo se llevaba
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      abortSignal: signal,
    },
  })
  return { model, raw: response.text }
}

// Groq tiene una API compatible con OpenAI: basta con fetch, sin SDK
const callGroq = async (
  apiKey: string,
  system: string,
  text: string,
  signal: AbortSignal,
) => {
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL
  // Esquema estricto y razonamiento solo existen en los modelos gpt-oss
  const isGptOss = model.startsWith('openai/gpt-oss')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Temario:\n\n${text.slice(0, MAX_GROQ_TEXT_CHARS)}` },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'test', strict: isGptOss, schema: GROQ_SCHEMA },
      },
      temperature: 0.4,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      // Prioriza la velocidad: el mínimo razonamiento antes de responder
      ...(isGptOss ? { reasoning_effort: 'low', include_reasoning: false } : {}),
    }),
  })
  if (!res.ok) throw new AiHttpError(res.status, await res.text())
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return { model, raw: json.choices?.[0]?.message?.content }
}

// Genera el test en el servidor: PDF → texto → Gemini → preguntas.
// Al navegador solo vuelven las preguntas; ni el texto del PDF ni la API key.
export const generateTest = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error('Formato de petición no válido')
    // Las mismas reglas que el formulario (lib/schemas.ts): no hay que fiarse del navegador
    const result = generateTestInputSchema.safeParse(Object.fromEntries(data))
    if (!result.success)
      throw new Error(result.error.issues[0]?.message ?? 'Petición no válida')
    return result.data
  })
  .handler(async ({ data: { file, count, type, subject, model: provider } }) => {
    const keyName = API_KEYS[provider]
    const apiKey = process.env[keyName]
    if (!apiKey) throw new Error(`Falta configurar ${keyName} en el servidor`)

    let start = Date.now()
    const { text, pages } = await extractPdfText(file)
    console.info(`PDF a texto: ${Date.now() - start} ms (${pages} páginas)`)
    if (!text)
      throw new Error('El PDF no tiene texto seleccionable (¿es un documento escaneado?)')

    const system = buildPrompt(count, type, subject)
    const call = provider === 'groq' ? callGroq : callGemini
    let raw: string | undefined
    start = Date.now()
    // Si el usuario cancela, el navegador corta la petición y llega aquí como abort
    const cancelled = getRequest().signal
    try {
      // Cada intento tiene su propio tiempo máximo; se reintenta ante 429, 5xx o fallo de red
      const result = await withRetry(
        () =>
          call(
            apiKey,
            system,
            text,
            AbortSignal.any([cancelled, AbortSignal.timeout(AI_TIMEOUT_MS)]),
          ),
        { signal: cancelled },
      )
      raw = result.raw
      console.info(`${provider} (${result.model}): ${Date.now() - start} ms`)
    } catch (err) {
      if (cancelled.aborted) throw new Error('Generación cancelada')
      console.error(`Error de ${provider}`, err)
      if (isAbortError(err))
        throw new Error('La IA ha tardado demasiado en responder. Inténtalo de nuevo.')
      throw new Error(aiErrorMessage(err, keyName))
    }

    const parsed = parseAiResponse(raw)
    const questions = toQuestions(parsed.questions, type).slice(0, count)
    if (questions.length === 0)
      throw new Error('La IA no ha devuelto preguntas válidas. Inténtalo de nuevo.')

    const title = parsed.title?.trim().slice(0, 80) ?? ''
    return { title, pages, questions }
  })
