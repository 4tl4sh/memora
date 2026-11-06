import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { generateTestInputSchema } from '#/lib/schemas'
import {
  AI_TIMEOUT_MS,
  OPENAI_TIMEOUT_MS,
  API_KEYS,
  aiErrorMessage,
  buildPrompt,
  callGemini,
  callGroq,
  callOpenAI,
  parseAiResponse,
  toQuestions,
} from '#/server/ai'
import { extractPdfText } from '#/server/pdf-to-text'
import { isAbortError, withRetry } from '#/server/retry'

// Genera el test en el servidor: PDF → texto → Gemini → preguntas.
// Al navegador solo vuelven las preguntas; ni el texto del PDF ni la API key.
export const generateTest = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData))
      throw new Error('Formato de petición no válido')
    // Las mismas reglas que el formulario (lib/schemas.ts): no hay que fiarse del navegador
    const result = generateTestInputSchema.safeParse(Object.fromEntries(data))
    if (!result.success)
      throw new Error(result.error.issues[0]?.message ?? 'Petición no válida')
    return result.data
  })
  .handler(
    async ({ data: { file, count, type, subject, model: provider } }) => {
      const keyName = API_KEYS[provider]
      const apiKey = process.env[keyName]
      if (!apiKey) throw new Error(`Falta configurar ${keyName} en el servidor`)

      let start = Date.now()
      const { text, pages } = await extractPdfText(file)
      console.info(`PDF a texto: ${Date.now() - start} ms (${pages} páginas)`)
      if (!text)
        throw new Error(
          'El PDF no tiene texto seleccionable (¿es un documento escaneado?)',
        )

      const system = buildPrompt(count, type, subject)
      const call = { gemini: callGemini, groq: callGroq, openai: callOpenAI }[
        provider
      ]
      const timeoutMs =
        provider === 'openai' ? OPENAI_TIMEOUT_MS : AI_TIMEOUT_MS
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
              AbortSignal.any([cancelled, AbortSignal.timeout(timeoutMs)]),
            ),
          { signal: cancelled },
        )
        raw = result.raw
        console.info(`${provider} (${result.model}): ${Date.now() - start} ms`)
      } catch (err) {
        if (cancelled.aborted) throw new Error('Generación cancelada')
        console.error(`Error de ${provider}`, err)
        if (isAbortError(err))
          throw new Error(
            'La IA ha tardado demasiado en responder. Inténtalo de nuevo.',
          )
        throw new Error(aiErrorMessage(err, keyName))
      }

      const parsed = parseAiResponse(raw)
      const questions = toQuestions(parsed.questions, type).slice(0, count)
      if (questions.length === 0)
        throw new Error(
          'La IA no ha devuelto preguntas válidas. Inténtalo de nuevo.',
        )

      const title = parsed.title?.trim().slice(0, 80) ?? ''
      return { title, pages, questions }
    },
  )
