import { z } from 'zod'

import type { Question, Test, User } from './index'

// Esquemas de Zod: comprueban en ejecución lo que los tipos solo comprueban al compilar.
// Se usan con datos que llegan de fuera (localStorage, la IA, formularios), donde un `as`
// no valida nada.

export const subjectSchema = z.enum([
  'historia',
  'biologia',
  'quimica',
  'matematicas',
  'ingles',
  'derecho',
  'otra',
])

export const themeSchema = z.enum(['teal', 'klein', 'amarillo'])

export const planIdSchema = z.enum(['gratis', 'estudiante', 'academia'])

const baseQuestionSchema = z.object({
  id: z.number().int(),
  statement: z.string(),
  explanation: z.string().optional(),
})

export const questionSchema = z.discriminatedUnion('type', [
  baseQuestionSchema.extend({
    type: z.literal('single'),
    options: z.array(z.string()),
    correctIndex: z.number().int(),
  }),
  baseQuestionSchema.extend({
    type: z.literal('multiple'),
    options: z.array(z.string()),
    correctIndexes: z.array(z.number().int()),
  }),
  baseQuestionSchema.extend({
    type: z.literal('true-false'),
    correct: z.boolean(),
  }),
])

export const sourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), fileName: z.string() }),
  z.object({ kind: z.literal('pdf'), fileName: z.string(), pages: z.number() }),
  z.object({ kind: z.literal('Manual') }),
])

export const testSchema = z.object({
  id: z.number().int(),
  ownerId: z.number().int(),
  title: z.string(),
  subject: subjectSchema,
  status: z.enum(['public', 'private']),
  source: sourceSchema,
  questions: z.array(questionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  planId: planIdSchema,
  preferences: z.object({
    theme: themeSchema,
    darkMode: z.boolean(),
    dailyGoal: z.number(),
  }),
  createdAt: z.string(),
})

// Si el esquema y la interfaz se separan (se añade un campo a uno y no al otro),
// estas líneas dejan de compilar
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const check = <T extends true>(): T | undefined => undefined
check<Same<z.infer<typeof questionSchema>, Question>>()
check<Same<z.infer<typeof testSchema>, Test>>()
check<Same<z.infer<typeof userSchema>, User>>()
