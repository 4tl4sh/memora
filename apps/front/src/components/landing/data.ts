import type { Plan, StudyStats, Subject, TestPreview } from '@tfm/types'

export const SUBJECT_LABELS: Record<Subject, string> = {
  historia: 'Historia',
  biologia: 'Biología',
  quimica: 'Química',
  matematicas: 'Matemáticas',
  ingles: 'Inglés',
  derecho: 'Derecho',
  otra: 'Otra',
}

// Tarjeta de ejemplo: la vista ligera del test más lo que solo muestra la landing
export type ExampleTest = TestPreview & {
  level: string
  description: string
  minutes: number
}

export const exampleTests: ExampleTest[] = [
  {
    id: 1,
    title: 'La Revolución Francesa',
    subject: 'historia',
    status: 'public',
    questionCount: 20,
    level: 'Bachillerato',
    description:
      'De la toma de la Bastilla al Directorio: fechas, causas y protagonistas.',
    minutes: 8,
  },
  {
    id: 2,
    title: 'El corazón y la circulación',
    subject: 'biologia',
    status: 'public',
    questionCount: 15,
    level: '2.º Bachillerato',
    description:
      'Cámaras, válvulas y recorrido de la sangre, con preguntas de respuesta múltiple.',
    minutes: 6,
  },
  {
    id: 3,
    title: 'Enlace y formulación inorgánica',
    subject: 'quimica',
    status: 'public',
    questionCount: 25,
    level: 'Universidad',
    description:
      'Iónico, covalente y metálico, y los nombres que siempre se te cuelan.',
    minutes: 10,
  },
  {
    id: 4,
    title: 'Ecuaciones de segundo grado',
    subject: 'matematicas',
    status: 'public',
    questionCount: 18,
    level: '4.º ESO',
    description:
      'Discriminante, soluciones y problemas con enunciado. Respuesta corta incluida.',
    minutes: 9,
  },
  {
    id: 5,
    title: 'Phrasal verbs de uso diario',
    subject: 'ingles',
    status: 'public',
    questionCount: 30,
    level: 'B2',
    description:
      'Cien verbos compuestos que suenan naturales en una conversación.',
    minutes: 10,
  },
  {
    id: 6,
    title: 'La Constitución española: Título I',
    subject: 'derecho',
    status: 'public',
    questionCount: 40,
    level: 'Oposiciones',
    description:
      'Derechos y deberes fundamentales, artículo a artículo, con verdadero o falso.',
    minutes: 15,
  },
]

// Plan con los textos de su tarjeta
export type PlanCard = Plan & {
  description: string
  features: string[]
  cta: string
  featured?: boolean
}

export const plans: PlanCard[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    pricePerMonth: 0,
    aiTestsPerMonth: 50,
    maxSavedTests: 3,
    description: 'Para probar Studia con tu próximo examen.',
    features: [
      '3 tests guardados',
      '50 preguntas con IA al mes',
      'Respuesta única y verdadero/falso',
    ],
    cta: 'Empezar',
  },
  {
    id: 'estudiante',
    name: 'Estudiante',
    pricePerMonth: 4.99,
    aiTestsPerMonth: 1000,
    description: 'Todo lo que necesitas para llegar al examen sabiéndotelo.',
    features: [
      'Tests ilimitados',
      '1.000 preguntas con IA al mes',
      'Todos los tipos de pregunta',
      'Repaso espaciado y estadísticas',
    ],
    cta: 'Elegir Estudiante',
    featured: true,
  },
  {
    id: 'academia',
    name: 'Academia',
    pricePerMonth: 19,
    aiTestsPerMonth: 1000,
    description: 'Para profesores y academias con grupos.',
    features: [
      'Todo lo de Estudiante',
      'Comparte tests con hasta 40 alumnos',
      'Resultados por alumno',
    ],
    cta: 'Elegir Academia',
  },
]

export const formatPrice = (euros: number) =>
  euros.toLocaleString('es-ES', { maximumFractionDigits: 2 })

// Racha que enseña la tarjeta flotante del hero
export const heroStats: Pick<StudyStats, 'streakDays'> = { streakDays: 7 }
