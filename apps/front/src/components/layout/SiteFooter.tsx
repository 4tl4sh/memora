import { LogoIcon } from '#/components/icons'
import { landingLinks } from './nav-links'
import type { NavLink } from './nav-links'
import { Newsletter } from './Newsletter'

const linkClass =
  'rounded text-neutral-300 transition hover:text-neutral-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-0'

export function SiteFooter({ links = landingLinks }: { links?: NavLink[] }) {
  return (
    <footer className="bg-neutral-900 text-neutral-300 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-neutral-0">
              <span className="grid size-9 place-items-center rounded-xl bg-chispa-300 text-neutral-900">
                <LogoIcon className="size-5" />
              </span>
              Memora
            </p>
            <p className="mt-4 max-w-xs text-sm text-pretty">
              Convierte tu temario en tests y repásalos en el móvil hasta que te
              lo sepas.
            </p>
            <ul className="mt-6 flex gap-3">
              <li>
                <a
                  href="#"
                  className="grid size-10 place-items-center rounded-full border border-neutral-700 text-neutral-0 transition hover:border-chispa-300 hover:text-chispa-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-0"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="grid size-10 place-items-center rounded-full border border-neutral-700 text-neutral-0 transition hover:border-chispa-300 hover:text-chispa-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-0"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                  <span className="sr-only">YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="grid size-10 place-items-center rounded-full border border-neutral-700 text-neutral-0 transition hover:border-chispa-300 hover:text-chispa-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-0"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-neutral-0 uppercase">
              Producto
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <a className={linkClass} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-neutral-0 uppercase">
              Contacto
            </h2>
            <address className="mt-4 flex flex-col gap-3 text-sm not-italic">
              <a className={linkClass} href="mailto:hola@memora.example">
                hola@memora.example
              </a>{' '}
              <a className={linkClass} href="tel:+34910000000">
                +34 910 000 000
              </a>{' '}
              <span>
                Calle del Temario, 12
                <br />
                28001 Madrid
              </span>
            </address>
          </div>
          <Newsletter />
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Memora. Proyecto formativo: los datos y precios son
            inventados.
          </p>
          <ul className="flex gap-5">
            <li>
              <a className={`${linkClass} !text-neutral-400`} href="#">
                Privacidad
              </a>
            </li>
            <li>
              <a className={`${linkClass} !text-neutral-400`} href="#">
                Términos
              </a>
            </li>
            <li>
              <a className={`${linkClass} !text-neutral-400`} href="#">
                Cookies
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
