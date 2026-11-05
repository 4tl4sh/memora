import {
  USERS_KEY,
  authenticate,
  findUserByToken,
  parseUsers,
  readUsers,
  registerUser,
  setSessionToken,
} from './users-storage'

const lucia = { name: 'Lucía', email: 'lucia@correo.com', password: 'secreta' }

describe('registerUser', () => {
  it('debería crear el usuario con id 1 cuando no hay ninguno', () => {
    const result = registerUser(lucia)

    expect(result).toMatchObject({
      ok: true,
      user: { id: 1, name: 'Lucía', email: 'lucia@correo.com' },
    })
    expect(readUsers()).toHaveLength(1)
  })

  it('debería guardar el email en minúsculas y sin espacios', () => {
    const result = registerUser({ ...lucia, email: '  Lucia@Correo.COM ' })

    expect(result.ok && result.user.email).toBe('lucia@correo.com')
  })

  it('debería rechazar un email ya registrado aunque cambien las mayúsculas', () => {
    // Arrange
    registerUser(lucia)

    // Act
    const result = registerUser({ ...lucia, email: 'LUCIA@correo.com' })

    // Assert
    expect(result).toEqual({ ok: false, error: 'email-taken' })
    expect(readUsers()).toHaveLength(1)
  })

  it('debería dar a cada usuario nuevo el siguiente id', () => {
    registerUser(lucia)
    const result = registerUser({ ...lucia, email: 'marcos@correo.com' })

    expect(result.ok && result.user.id).toBe(2)
  })
})

describe('authenticate', () => {
  beforeEach(() => {
    registerUser(lucia)
  })

  it('debería devolver el usuario con el email y la contraseña correctos', () => {
    expect(authenticate('Lucia@correo.com', 'secreta')?.name).toBe('Lucía')
  })

  it('debería devolver null con una contraseña incorrecta', () => {
    expect(authenticate('lucia@correo.com', 'otra')).toBeNull()
  })

  it('debería devolver null con un email que no existe', () => {
    expect(authenticate('nadie@correo.com', 'secreta')).toBeNull()
  })
})

describe('setSessionToken', () => {
  it('debería asociar el token al usuario y poder invalidarlo', () => {
    // Arrange
    registerUser(lucia)

    // Act + Assert
    setSessionToken(1, 'token-1')
    expect(findUserByToken('token-1')?.id).toBe(1)

    setSessionToken(1, null)
    expect(findUserByToken('token-1')).toBeUndefined()
  })
})

describe('parseUsers', () => {
  it('debería devolver una lista vacía si no hay nada o no es JSON', () => {
    expect(parseUsers(null)).toEqual([])
    expect(parseUsers('{roto')).toEqual([])
    expect(parseUsers('{"no":"array"}')).toEqual([])
  })

  it('debería descartar los usuarios mal formados y conservar el resto', () => {
    // Arrange: alguien ha editado localStorage a mano
    registerUser(lucia)
    const valid = readUsers()[0]
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([valid, { id: 'dos', name: 42 }]),
    )

    // Act
    const users = parseUsers(localStorage.getItem(USERS_KEY))

    // Assert
    expect(users).toEqual([valid])
  })
})
