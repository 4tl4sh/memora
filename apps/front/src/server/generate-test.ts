import { createServerFn } from '@tanstack/react-start'
import type { Question, Subject } from '@tfm/types'

import { SUBJECT_LABELS } from '#/components/landing/data'
import { MAX_PDF_BYTES, isPdf } from '#/lib/pdf'
import { extractPdfText } from '#/server/pdf-to-text'

// Tipo de una pregunta concreta
export type QuestionType = Question['type']

// Lo que elige el usuario: todas simples, todas múltiples, todas de verdadero o
// falso, o mezcla de los tres tipos
export type TestQuestionType = QuestionType | 'mixed'

export const QUESTION_COUNTS = [5, 10, 15] as const

// Proveedor de IA que elige el usuario: el prompt y la respuesta son los mismos
export type AiModel = 'gemini' | 'groq'

export const AI_MODELS: { value: AiModel; label: string }[] = [
  { value: 'gemini', label: 'Gemini Flash' },
  { value: 'groq', label: 'Groq' },
]

const QUESTION_TYPES: TestQuestionType[] = ['single', 'multiple', 'true-false', 'mixed']

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

interface AiQuestion {
  statement?: unknown
  options?: unknown
  correctIndexes?: unknown
  explanation?: unknown
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
const resolveType = (
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
const toQuestions = (raw: unknown, type: TestQuestionType): Question[] => {
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
    if (!statement || options.some((o) => !o)) continue
    const questionType = resolveType(type, options.length, indexes.length)
    if (!questionType) continue

    const base = {
      id: questions.length + 1,
      statement,
      ...(typeof q.explanation === 'string' && q.explanation.trim()
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

const callGemini = async (apiKey: string, system: string, text: string) => {
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
    },
  })
  return { model, raw: response.text }
}

// Groq tiene una API compatible con OpenAI: basta con fetch, sin SDK
const callGroq = async (apiKey: string, system: string, text: string) => {
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL
  // Esquema estricto y razonamiento solo existen en los modelos gpt-oss
  const isGptOss = model.startsWith('openai/gpt-oss')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
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
    const model = data.get('model')
    if (!AI_MODELS.some((m) => m.value === model))
      throw new Error('Modelo no válido')

    return {
      file,
      count,
      type: type as TestQuestionType,
      subject: subject as Subject,
      model: model as AiModel,
    }
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
    try {
      const result = await call(apiKey, system, text)
      raw = result.raw
      console.info(`${provider} (${result.model}): ${Date.now() - start} ms`)
    } catch (err) {
      console.error(`Error de ${provider}`, err)
      throw new Error(aiErrorMessage(err, keyName))
    }

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
