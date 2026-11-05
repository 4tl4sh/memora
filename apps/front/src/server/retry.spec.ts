import { isRetryable, withRetry } from './retry'

// Sin esperas reales: los reintentos se prueban con retrasos de 0 ms
const NO_DELAYS = [0, 0, 0]

const httpError = (status: number) =>
  Object.assign(new Error('HTTP'), { status })

describe('isRetryable', () => {
  it.each([429, 500, 503])('debería reintentar un %i', (status) => {
    expect(isRetryable(httpError(status))).toBe(true)
  })

  it.each([400, 401, 403, 404])('no debería reintentar un %i', (status) => {
    expect(isRetryable(httpError(status))).toBe(false)
  })

  it('debería reintentar un fallo de red (TypeError de fetch)', () => {
    expect(isRetryable(new TypeError('Failed to fetch'))).toBe(true)
  })

  it('no debería reintentar una cancelación ni un tiempo agotado', () => {
    expect(isRetryable(new DOMException('', 'AbortError'))).toBe(false)
    expect(isRetryable(new DOMException('', 'TimeoutError'))).toBe(false)
  })
})

describe('withRetry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('debería devolver el resultado a la primera si no falla', async () => {
    const fn = vi.fn().mockResolvedValue('ok')

    await expect(withRetry(fn, { delays: NO_DELAYS })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('debería reintentar tras un 503 hasta que funcione', async () => {
    // Arrange
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValue('ok')

    // Act
    const result = await withRetry(fn, { delays: NO_DELAYS })

    // Assert
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('no debería reintentar un 401', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(401))

    await expect(withRetry(fn, { delays: NO_DELAYS })).rejects.toMatchObject({
      status: 401,
    })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('debería rendirse tras agotar los reintentos', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(503))

    await expect(withRetry(fn, { delays: NO_DELAYS })).rejects.toMatchObject({
      status: 503,
    })
    // El intento inicial más uno por cada retraso
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('no debería reintentar si la petición se ha cancelado', async () => {
    const controller = new AbortController()
    const fn = vi.fn().mockImplementation(async () => {
      controller.abort()
      throw httpError(503)
    })

    await expect(
      withRetry(fn, { delays: NO_DELAYS, signal: controller.signal }),
    ).rejects.toMatchObject({ status: 503 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('debería esperar el doble en cada reintento', async () => {
    // Arrange: temporizadores falsos, nadie espera de verdad
    vi.useFakeTimers()
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValue('ok')

    // Act
    const promise = withRetry(fn)
    await vi.advanceTimersByTimeAsync(499)
    const callsBeforeFirstDelay = fn.mock.calls.length
    await vi.advanceTimersByTimeAsync(1)
    await vi.advanceTimersByTimeAsync(999)
    const callsBeforeSecondDelay = fn.mock.calls.length
    await vi.advanceTimersByTimeAsync(1)

    // Assert
    await expect(promise).resolves.toBe('ok')
    expect(callsBeforeFirstDelay).toBe(1)
    expect(callsBeforeSecondDelay).toBe(2)
    expect(fn).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })
})
