export interface NavLink {
  href: string
  label: string
  shortLabel?: string // en la barra de escritorio, si no cabe el texto largo
}

// Secciones de la landing; otras páginas pueden pasar sus propios enlaces a la cabecera
export const landingLinks: NavLink[] = [
  { href: '#ejemplos', label: 'Ejemplos' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes', label: 'Planes' },
  { href: '#faq', label: 'Preguntas frecuentes', shortLabel: 'FAQ' },
]

export const loginLink: NavLink = { href: '#', label: 'Entrar' }

// Pie de las páginas de la app: enlaza a las secciones de la landing, que ahí no están
export const appFooterLinks: NavLink[] = landingLinks.map((link) => ({
  ...link,
  href: `/memora-landing${link.href}`,
}))
