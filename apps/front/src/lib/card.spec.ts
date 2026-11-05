import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from './card'

// Número de prueba de Visa que pasa el algoritmo de Luhn
const VALID_CARD = '4242 4242 4242 4242'

describe('formatCardNumber', () => {
  it('debería agrupar los dígitos de 4 en 4 y quitar lo que no sea número', () => {
    expect(formatCardNumber('4242-4242a42424242')).toBe(VALID_CARD)
  })
})

describe('formatExpiry', () => {
  it('debería añadir la barra tras el mes', () => {
    expect(formatExpiry('1230')).toBe('12/30')
    expect(formatExpiry('1')).toBe('1')
  })
})

describe('isValidCardNumber', () => {
  it('debería aceptar un número que pasa el algoritmo de Luhn', () => {
    expect(isValidCardNumber(VALID_CARD)).toBe(true)
  })

  it('debería rechazar un número con un dígito cambiado', () => {
    expect(isValidCardNumber('4242 4242 4242 4241')).toBe(false)
  })

  it('debería rechazar un número demasiado corto', () => {
    expect(isValidCardNumber('4242')).toBe(false)
  })
})

describe('isValidExpiry', () => {
  const now = new Date(2026, 10, 5) // 5 de noviembre de 2026

  it('debería aceptar una tarjeta que caduca a final del mes actual', () => {
    expect(isValidExpiry('11/26', now)).toBe(true)
  })

  it('debería rechazar una tarjeta caducada o un mes que no existe', () => {
    expect(isValidExpiry('10/26', now)).toBe(false)
    expect(isValidExpiry('13/30', now)).toBe(false)
  })
})

describe('isValidCvv', () => {
  it('debería aceptar 3 o 4 dígitos', () => {
    expect(isValidCvv('123')).toBe(true)
    expect(isValidCvv('1234')).toBe(true)
    expect(isValidCvv('12')).toBe(false)
  })
})
