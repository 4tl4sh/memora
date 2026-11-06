import { z } from 'zod'
import type { Question, Subject } from '@tfm/types'

import { SUBJECT_LABELS } from '#/components/landing/data'
import type { AiModel, TestQuestionType } from '#/lib/schemas'

// Todo lo que habla con la IA y trata su respuesta, separado de la server function
// (generate-test.ts) para poder probarlo con Vitest sin levantar el servidor.

// Tipo de una pregunta concreta
export type QuestionType = Question['type']

const OPTIONS_PER_QUESTION = 4

// Tope de texto enviado a la IA (~15k tokens): sobra para 15 preguntas y cuanto
// menos texto, antes responde Gemini y menos cuota gratuita se gasta
const MAX_TEXT_CHARS = 60_000

// Groq gratuito tiene un límite bajo de tokens por minuto: se manda menos texto
// (~5k tokens), que además hace que responda antes
const MAX_GROQ_TEXT_CHARS = 20_000

// OpenAI (gpt-4.1-mini admite 1M de tokens): ~800k tokens como máximo, que deja margen
// para el prompt y la respuesta. Cabe un libro de 1.000 páginas; un texto más largo (la
// Biblia entera, ~4M de caracteres) se corta y solo se pregunta por la parte inicial
const MAX_OPENAI_TEXT_CHARS = 3_000_000

// Tope de respuesta: 15 preguntas con explicaciones cortas caben de sobra
const MAX_OUTPUT_TOKENS = 4096

// Lite: peor calidad que flash, pero mucho más rápido y menos saturado en el plan gratuito
const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest'

// gpt-oss-20b: de los más rápidos de Groq y admite JSON con esquema estricto
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b'

// gpt-4.1-mini: ventana de 1M de tokens, barato y admite JSON con esquema estricto
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini'

// Tiempo máximo de cada llamada a la IA: si no responde, se corta en vez de esperar sin fin
export const AI_TIMEOUT_MS = 60_000

// Con tanto texto OpenAI tarda más en empezar a responder
export const OPENAI_TIMEOUT_MS = 180_000

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export const API_KEYS: Record<AiModel, string> = {
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
  openai: 'OPENAI_API_KEY',
}

// Lo que se pide a la IA: correctIndexes en las de opciones y truth en las de verdadero/falso
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
          truth: { type: 'boolean' },
          explanation: { type: 'string' },
        },
        required: ['statement', 'options', 'correctIndexes', 'explanation'],
      },
    },
  },
  required: ['title', 'questions'],
}

// El modo estricto de Groq y de OpenAI exige additionalProperties: false en cada objeto y que
// todas las propiedades sean obligatorias: truth también, con null en las de opciones
const STRICT_SCHEMA = {
  ...RESPONSE_SCHEMA,
  additionalProperties: false,
  properties: {
    ...RESPONSE_SCHEMA.properties,
    questions: {
      ...RESPONSE_SCHEMA.properties.questions,
      items: {
        ...RESPONSE_SCHEMA.properties.questions.items,
        required: [
          ...RESPONSE_SCHEMA.properties.questions.items.required,
          'truth',
        ],
        properties: {
          ...RESPONSE_SCHEMA.properties.questions.items.properties,
          truth: { type: ['boolean', 'null'] },
        },
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
  truth: z.boolean().nullish(),
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
const TRUE_FALSE_ANSWER =
  'una afirmación (no una pregunta) que sea verdadera o falsa; en esas deja options y correctIndexes como arrays vacíos y pon en truth si es verdadera'

// Reparto de un test mixto: un tercio de verdadero/falso y el resto, mitad simples y mitad múltiples
export const mixedSplit = (count: number) => {
  const trueFalse = Math.floor(count / 3)
  const multiples = Math.floor((count - trueFalse) / 2)
  return { trueFalse, multiples, singles: count - trueFalse - multiples }
}

export const buildPrompt = (
  count: number,
  type: TestQuestionType,
  subject: Subject,
) => {
  let answers: string
  if (type === 'mixed') {
    const { singles, multiples, trueFalse } = mixedSplit(count)
    answers = [
      `Las preguntas de opciones tienen ${OPTIONS_PER_QUESTION} opciones.`,
      `${singles} preguntas deben tener ${SINGLE_ANSWER}, ${multiples} deben tener ${MULTIPLE_ANSWER} y ${trueFalse} deben ser ${TRUE_FALSE_ANSWER}.`,
      'Intercala los tipos de pregunta a lo largo del test, no los agrupes.',
    ].join('\n')
  } else if (type === 'true-false') {
    answers = [
      `Todas las preguntas son ${TRUE_FALSE_ANSWER}.`,
      'Reparte las verdaderas y las falsas de forma equilibrada.',
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
    ...(type === 'true-false'
      ? []
      : ['En las preguntas de opciones, truth es null.']),
    'Usa solo información del temario, no repitas preguntas y reparte las preguntas por todo el contenido.',
    'Enunciados y opciones concisos. Explicación de una sola frase (máximo 150 caracteres).',
    'Añade un título corto (máximo 60 caracteres) para el test.',
  ].join('\n')
}

// Preguntas de opciones (las de verdadero/falso se reconocen aparte, por truth)
type OptionsType = Exclude<QuestionType, 'true-false'>

// Tipo de una pregunta de opciones: en un test mixto se deduce del número de
// respuestas correctas; null si no encaja con lo que eligió el usuario
export const resolveType = (
  type: TestQuestionType,
  correct: number,
): OptionsType | null => {
  if (type === 'true-false') return null
  const resolved: OptionsType | null =
    correct === 1 ? 'single' : correct >= 2 ? 'multiple' : null
  return resolved && (type === 'mixed' || type === resolved) ? resolved : null
}

// La IA puede equivocarse: se descartan las preguntas mal formadas
export const toQuestions = (
  raw: unknown[],
  type: TestQuestionType,
): Question[] => {
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
    if (!statement) continue
    const explanation = q.explanation?.trim()
      ? { explanation: q.explanation.trim() }
      : {}

    // Verdadero o falso: sin opciones y con truth. En un test mixto se reconoce por eso mismo
    const truth = q.truth ?? undefined
    const isTrueFalse = truth !== undefined && options.length === 0
    if (type === 'true-false' || (type === 'mixed' && isTrueFalse)) {
      if (truth === undefined) continue
      questions.push({
        id: questions.length + 1,
        statement,
        type: 'true-false',
        correct: truth,
        ...explanation,
      })
      continue
    }

    if (options.length !== OPTIONS_PER_QUESTION || options.some((o) => !o))
      continue
    const questionType = resolveType(type, indexes.length)
    if (!questionType) continue

    const base = {
      id: questions.length + 1,
      statement,
      options,
      ...explanation,
    }
    questions.push(
      questionType === 'single'
        ? { ...base, type: questionType, correctIndex: indexes[0] }
        : {
            ...base,
            type: questionType,
            correctIndexes: indexes.sort((a, b) => a - b),
          },
    )
  }
  return questions
}

// Errores de la IA traducidos a algo que se pueda enseñar al usuario
export const aiErrorMessage = (err: unknown, keyName: string) => {
  const status =
    err && typeof err === 'object' && 'status' in err ? err.status : undefined
  if (status === 429)
    return 'Se ha alcanzado el límite gratuito de la IA. Prueba de nuevo en un minuto.'
  // Gemini responde 400 con una clave inválida; en Groq y OpenAI un 400 es otro fallo
  const badKey =
    status === 401 ||
    status === 403 ||
    (status === 400 && keyName === API_KEYS.gemini)
  if (badKey) return `La clave de la IA no es válida. Revisa ${keyName}.`
  if (status === 503)
    return 'La IA está saturada ahora mismo. Inténtalo de nuevo.'
  return 'La IA no ha podido generar el test. Inténtalo de nuevo.'
}

export class AiHttpError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`HTTP ${status}: ${body}`)
  }
}

export const callGemini = async (
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
export const callGroq = async (
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
        {
          role: 'user',
          content: `Temario:\n\n${text.slice(0, MAX_GROQ_TEXT_CHARS)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'test', strict: isGptOss, schema: STRICT_SCHEMA },
      },
      temperature: 0.4,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      // Prioriza la velocidad: el mínimo razonamiento antes de responder
      ...(isGptOss
        ? { reasoning_effort: 'low', include_reasoning: false }
        : {}),
    }),
  })
  if (!res.ok) throw new AiHttpError(res.status, await res.text())
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return { model, raw: json.choices?.[0]?.message?.content }
}

// OpenAI: misma API de chat que Groq, con el esquema estricto y sin SDK
export const callOpenAI = async (
  apiKey: string,
  system: string,
  text: string,
  signal: AbortSignal,
) => {
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
  const res = await fetch(OPENAI_URL, {
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
        {
          role: 'user',
          content: `Temario:\n\n${text.slice(0, MAX_OPENAI_TEXT_CHARS)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'test', strict: true, schema: STRICT_SCHEMA },
      },
      temperature: 0.4,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
    }),
  })
  if (!res.ok) throw new AiHttpError(res.status, await res.text())
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return { model, raw: json.choices?.[0]?.message?.content }
}
