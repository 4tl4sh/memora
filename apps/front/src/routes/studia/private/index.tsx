import { createFileRoute } from '@tanstack/react-router'

import { TestsPanel } from '#/components/home/TestsPanel'
import { useUser } from '#/lib/session-storage'

export const Route = createFileRoute('/studia/private/')({
  head: () => ({
    meta: [{ title: 'Tus tests · Studia' }],
  }),
  component: PrivateHome,
})

function PrivateHome() {
  // El layout (route.tsx) ya garantiza que hay sesión
  const user = useUser()
  return user && <TestsPanel name={user} />
}
