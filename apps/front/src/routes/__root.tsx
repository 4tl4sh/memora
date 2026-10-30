import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
// Las mismas fuentes que declara fonts.css: se precargan para no esperar al CSS
import interFont from '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url'
import bricolageFont from '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url'
import { preferencesScript } from '#/hooks/use-preferences'

const preloadFont = (href: string) => ({
  rel: 'preload',
  as: 'font',
  type: 'font/woff2',
  href,
  crossOrigin: 'anonymous' as const,
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Studia',
      },
    ],
    links: [
      preloadFont(interFont),
      preloadFont(bricolageFont),
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg?v=2',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // El script de preferencias cambia la clase y data-theme de <html> antes de hidratar
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
        <HeadContent />
      </head>
      <body className="bg-neutral-50 font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
