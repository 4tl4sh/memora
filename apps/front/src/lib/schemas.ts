import { z } from 'zod'
import { planIdSchema, subjectSchema } from '@tfm/types'
import type { PlanId } from '@tfm/types'

import { plans } from '#/components/landing/data'
import { isValidCardNumber, isValidCvv, isValidExpiry } from '#/lib/card'
import { MAX_PDF_BYTES, isPdf } from '#/lib/pdf'

// Reglas de los formularios en un solo sitio: las usan TanStack Form en el navegador
// y, en el caso de crear un test, también la server function al recibir la petición

// ─── Login y registro ───────────────────────────────────────────

export const MIN_PASSWORD = 6

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Escribe tu email.')
  .pipe(z.email('Escribe un email válido.'))

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

// Un plan es de pago si cuesta algo al mes: entonces se piden los datos de la tarjeta
export const isPaidPlan = (planId: PlanId) =>
  (plans.find((plan) => plan.id === planId)?.pricePerMonth ?? 0) > 0

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Escribe tu nombre.'),
    email: emailSchema,
    password: z
      .string()
      .min(
        MIN_PASSWORD,
        `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`,
      ),
    planId: planIdSchema,
    // Pago simulado: solo se valida el formato, la tarjeta no se guarda
    cardNumber: z.string(),
    expiry: z.string(),
    cvv: z.string(),
  })
  // La tarjeta solo es obligatoria con un plan de pago: cada error va a su campo (path)
  .superRefine(({ planId, cardNumber, expiry, cvv }, ctx) => {
    if (!isPaidPlan(planId)) return
    if (!isValidCardNumber(cardNumber))
      ctx.addIssue({
        code: 'custom',
        path: ['cardNumber'],
        message: 'Escribe un número de tarjeta válido.',
      })
    if (!isValidExpiry(expiry))
      ctx.addIssue({
        code: 'custom',
        path: ['expiry'],
        message: 'Fecha no válida o caducada.',
      })
    if (!isValidCvv(cvv))
      ctx.addIssue({
        code: 'custom',
        path: ['cvv'],
        message: 'Entre 3 y 4 dígitos.',
      })
  })

export type LoginValues = z.input<typeof loginSchema>
export type RegisterValues = z.input<typeof registerSchema>

// ─── Crear un test ──────────────────────────────────────────────

export const QUESTION_COUNTS = [5, 10, 15] as const

export const testQuestionTypeSchema = z.enum([
  'single',
  'multiple',
  'true-false',
  'mixed',
])

// Lo que elige el usuario: todas de un tipo (simple, múltiple, verdadero/falso) o una mezcla
export type TestQuestionType = z.infer<typeof testQuestionTypeSchema>

// Proveedor de IA que elige el usuario: el prompt y la respuesta son los mismos
export const aiModelSchema = z.enum(['gemini', 'groq'])
export type AiModel = z.infer<typeof aiModelSchema>

export const AI_MODELS: { value: AiModel; label: string }[] = [
  { value: 'gemini', label: 'Gemini Flash' },
  { value: 'groq', label: 'Groq' },
]

export const pdfFileSchema = z
  .instanceof(File, { message: 'Sube el PDF con tu temario.' })
  .refine(isPdf, 'El fichero debe ser un PDF.')
  .refine((file) => file.size <= MAX_PDF_BYTES, 'El PDF no puede superar 5 MB.')

const questionCountSchema = z
  .number({ message: 'Elige cuántas preguntas quieres.' })
  .refine(
    (n) => QUESTION_COUNTS.some((count) => count === n),
    'Elige cuántas preguntas quieres.',
  )

// En el formulario los campos empiezan vacíos (null o ''): el esquema da el mensaje
export const createTestSchema = z.object({
  file: z
    .instanceof(File)
    .nullable()
    .superRefine((file, ctx) => {
      const result = pdfFileSchema.safeParse(file)
      if (!result.success)
        ctx.addIssue({
          code: 'custom',
          message: result.error.issues[0]?.message ?? 'PDF no válido.',
        })
    }),
  count: z
    .number()
    .nullable()
    .refine(
      (n) => questionCountSchema.safeParse(n).success,
      'Elige cuántas preguntas quieres.',
    ),
  type: testQuestionTypeSchema.nullable().refine((v) => v !== null, {
    message: 'Elige el tipo de preguntas.',
  }),
  subject: z
    .union([subjectSchema, z.literal('')])
    .refine((v) => v !== '', { message: 'Elige una materia.' }),
  model: aiModelSchema.nullable().refine((v) => v !== null, {
    message: 'Elige el modelo de IA.',
  }),
})

// Lo que recibe la server function (llega en un FormData, así que todo es texto)
export const generateTestInputSchema = z.object({
  file: pdfFileSchema,
  count: z.coerce.number().pipe(questionCountSchema),
  type: testQuestionTypeSchema,
  subject: subjectSchema,
  model: aiModelSchema,
})

export type CreateTestValues = z.input<typeof createTestSchema>
