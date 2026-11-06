import {
  createTestSchema,
  generateTestInputSchema,
  loginSchema,
  registerSchema,
} from './schemas'

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

const pdf = (size = 1000, name = 'tema.pdf', type = 'application/pdf') =>
  new File([new Uint8Array(size)], name, { type })

describe('loginSchema', () => {
  it('debería pedir email y contraseña cuando están vacíos', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })

    expect(messages(result)).toEqual([
      'Escribe tu email.',
      'Escribe tu contraseña.',
    ])
  })

  it('debería rechazar un email mal escrito', () => {
    const result = loginSchema.safeParse({ email: 'lucia@', password: 'x' })

    expect(messages(result)).toEqual(['Escribe un email válido.'])
  })
})

const registration = {
  name: 'Lucía',
  email: 'lucia@correo.com',
  password: 'secreta',
  planId: 'gratis' as const,
  cardNumber: '',
  expiry: '',
  cvv: '',
}

describe('registerSchema', () => {
  it('debería rechazar un nombre con solo espacios', () => {
    const result = registerSchema.safeParse({ ...registration, name: '   ' })

    expect(messages(result)).toEqual(['Escribe tu nombre.'])
  })

  it('debería exigir al menos 6 caracteres de contraseña', () => {
    const result = registerSchema.safeParse({
      ...registration,
      password: '12345',
    })

    expect(messages(result)).toEqual([
      'La contraseña debe tener al menos 6 caracteres.',
    ])
  })

  it('debería quitar los espacios a los lados del nombre y del email', () => {
    const result = registerSchema.parse({
      ...registration,
      name: '  Lucía ',
      email: ' lucia@correo.com ',
    })

    expect(result).toMatchObject({
      name: 'Lucía',
      email: 'lucia@correo.com',
    })
  })

  it('no debería pedir tarjeta con el plan gratuito', () => {
    expect(registerSchema.safeParse(registration).success).toBe(true)
  })

  it('debería pedir los datos de la tarjeta con un plan de pago', () => {
    const result = registerSchema.safeParse({
      ...registration,
      planId: 'estudiante',
    })

    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      'cardNumber',
      'expiry',
      'cvv',
    ])
  })

  it('debería aceptar un plan de pago con una tarjeta válida', () => {
    const result = registerSchema.safeParse({
      ...registration,
      planId: 'academia',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/99',
      cvv: '123',
    })

    expect(result.success).toBe(true)
  })
})

describe('createTestSchema', () => {
  const complete = {
    file: pdf(),
    count: 10,
    type: 'mixed' as const,
    subject: 'historia' as const,
    model: 'groq' as const,
  }

  it('debería aceptar el formulario completo', () => {
    expect(createTestSchema.safeParse(complete).success).toBe(true)
  })

  it('debería explicar qué falta con el formulario vacío', () => {
    const result = createTestSchema.safeParse({
      file: null,
      count: null,
      type: null,
      subject: '',
      model: null,
    })

    expect(messages(result)).toEqual([
      'Sube el PDF con tu temario.',
      'Elige cuántas preguntas quieres.',
      'Elige el tipo de preguntas.',
      'Elige una materia.',
      'Elige el modelo de IA.',
    ])
  })

  it('debería rechazar un número de preguntas que no se ofrece', () => {
    const result = createTestSchema.safeParse({ ...complete, count: 7 })

    expect(messages(result)).toEqual(['Elige cuántas preguntas quieres.'])
  })

  it.each([
    ['que no es un PDF', pdf(10, 'foto.png', 'image/png'), 'debe ser un PDF'],
    ['de más de 30 MB', pdf(30 * 1024 * 1024 + 1), 'no puede superar 30 MB'],
  ])('debería rechazar un fichero %s', (_, file, text) => {
    const result = createTestSchema.safeParse({ ...complete, file })

    expect(messages(result).join()).toContain(text)
  })
})

describe('generateTestInputSchema', () => {
  it('debería convertir el número de preguntas que llega como texto', () => {
    const result = generateTestInputSchema.parse({
      file: pdf(),
      count: '15',
      type: 'single',
      subject: 'quimica',
      model: 'gemini',
    })

    expect(result.count).toBe(15)
  })

  it('debería rechazar una materia que no existe aunque el navegador la envíe', () => {
    const result = generateTestInputSchema.safeParse({
      file: pdf(),
      count: '5',
      type: 'single',
      subject: 'magia',
      model: 'gemini',
    })

    expect(result.success).toBe(false)
  })
})
