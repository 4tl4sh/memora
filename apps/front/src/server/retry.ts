// Reintentos para las llamadas a la IA.
// Solo se reintenta lo que puede arreglarse esperando: un fallo de red, un 429 (límite
// de peticiones) o un 5xx (servidor saturado). Un 4xx es un error nuestro (clave mala,
// petición mal hecha): repetirla daría lo mismo. Y una cancelación tampoco se reintenta.

export const RETRY_DELAYS_MS = [500, 1000, 2000]

const statusOf = (err: unknown): number | undefined =>
  err && typeof err === 'object' && 'status' in err && typeof err.status === 'number'
    ? err.status
    : undefined

export const isAbortError = (err: unknown) =>
  err instanceof DOMException &&
  (err.name === 'AbortError' || err.name === 'TimeoutError')

export const isRetryable = (err: unknown): boolean => {
  if (isAbortError(err)) return false
  const status = statusOf(err)
  // Sin código de estado: fallo de red (fetch lanza TypeError)
  if (status === undefined) return err instanceof TypeError
  return status === 429 || status >= 500
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })

// Ejecuta fn y, si falla con un error reintentable, lo vuelve a intentar esperando
// cada vez el doble (500 ms, 1 s, 2 s). Si se cancela, deja de reintentar.
export const withRetry = async <T>(
  fn: () => Promise<T>,
  { delays = RETRY_DELAYS_MS, signal }: { delays?: number[]; signal?: AbortSignal } = {},
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const delay = delays[attempt]
      if (delay === undefined || !isRetryable(err) || signal?.aborted) throw err
      console.warn(`Reintento ${attempt + 1} en ${delay} ms`, statusOf(err) ?? err)
      await wait(delay, signal)
    }
  }
}
