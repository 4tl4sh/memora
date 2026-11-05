// Validación y formato de los datos de tarjeta del registro. Solo se usan para
// comprobar el formulario: la tarjeta no se guarda ni se envía a ningún sitio.

export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')

// 1234 → 12/34
export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

// Algoritmo de Luhn: detecta un número mal escrito sin consultar a ningún banco
const passesLuhn = (digits: string) => {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  return sum % 10 === 0
}

export const isValidCardNumber = (value: string) => {
  const digits = value.replace(/\s/g, '')
  return /^\d{13,19}$/.test(digits) && passesLuhn(digits)
}

// MM/AA, mes de 1 a 12 y que la tarjeta no haya caducado (vale hasta fin de mes)
export const isValidExpiry = (value: string, now = new Date()) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  return new Date(year, month, 1) > now
}

export const isValidCvv = (value: string) => /^\d{3,4}$/.test(value)
