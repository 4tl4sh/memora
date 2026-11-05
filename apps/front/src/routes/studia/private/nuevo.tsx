import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { TestForm } from '#/components/test/TestForm'
import { useUser } from '#/lib/session-storage'
import { addTest } from '#/lib/tests-storage'

export const Route = createFileRoute('/studia/private/nuevo')({
  head: () => ({
    meta: [{ title: 'Nuevo test · Studia' }],
  }),
  component: NewTestPage,
})

function NewTestPage() {
  const user = useUser()
  const navigate = useNavigate()
  const goBack = () => navigate({ to: '/studia/private/' })

  return (
    <TestForm
      heading="Nuevo test"
      submitLabel="Crear test"
      onCancel={goBack}
      onSubmit={({ title, subject, questions }) => {
        // El layout ya garantiza que hay sesión
        if (!user || !questions) return
        addTest(
          {
            title,
            subject,
            status: 'private',
            source: { kind: 'Manual' },
            questions,
          },
          user.id,
        )
        goBack()
      }}
    />
  )
}
