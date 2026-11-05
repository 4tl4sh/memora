import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { subjectSchema } from '@tfm/types'

import { TestsPanel } from '#/components/home/TestsPanel'
import { APP_NAME } from '#/env.constants'
import { useUser } from '#/lib/session-storage'

// Filtros del panel en la URL: un enlace compartido o recargar la página los conserva.
// Un valor que no encaja (?materia=xyz) se ignora en vez de romper la página.
const searchSchema = z.object({
  materia: subjectSchema.optional().catch(undefined),
  q: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/studia/private/')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: `Tus tests · ${APP_NAME}` }],
  }),
  component: PrivateHome,
})

function PrivateHome() {
  // El layout (route.tsx) ya garantiza que hay sesión
  const user = useUser()
  const { materia, q } = Route.useSearch()
  const navigate = Route.useNavigate()

  // replace: escribir en el buscador no llena el historial de entradas
  const setSearch = (next: z.input<typeof searchSchema>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }), replace: true })

  return (
    user && (
      <TestsPanel
        user={user}
        subjectFilter={materia ?? null}
        query={q ?? ''}
        onSubjectFilterChange={(subject) =>
          setSearch({ materia: subject ?? undefined })
        }
        onQueryChange={(text) => setSearch({ q: text || undefined })}
      />
    )
  )
}
