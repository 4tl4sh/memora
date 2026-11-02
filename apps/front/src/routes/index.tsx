import { createFileRoute, redirect } from '@tanstack/react-router'

// La página principal vive en /studia/
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/studia/' })
  },
})
