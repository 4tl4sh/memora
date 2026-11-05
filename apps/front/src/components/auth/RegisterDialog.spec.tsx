import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { readUsers, registerUser } from '#/lib/users-storage'
import { RegisterDialog } from './RegisterDialog'

const renderRegister = () => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onRegister: vi.fn(),
    onSwitchToLogin: vi.fn(),
  }
  render(<RegisterDialog {...props} />)
  return props
}

const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  { name = 'Lucía', email = 'lucia@correo.com', password = 'secreta' } = {},
) => {
  await user.type(screen.getByLabelText('Nombre'), name)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Contraseña'), password)
  await user.click(screen.getByRole('button', { name: /^Crear cuenta/ }))
}

describe('RegisterDialog', () => {
  it('debería crear la cuenta y avisar con el usuario nuevo', async () => {
    const user = userEvent.setup()
    const { onRegister } = renderRegister()

    await fill(user, { name: '  Lucía  ' })

    expect(onRegister).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Lucía' }),
    )
    expect(readUsers()).toHaveLength(1)
  })

  it('debería mostrar el error de una contraseña corta y no registrar', async () => {
    const user = userEvent.setup()
    const { onRegister } = renderRegister()

    await fill(user, { password: '123' })

    expect(
      await screen.findByText(
        'La contraseña debe tener al menos 6 caracteres.',
      ),
    ).toBeInTheDocument()
    expect(onRegister).not.toHaveBeenCalled()
    expect(readUsers()).toEqual([])
  })

  it('debería avisar si ya existe una cuenta con ese email', async () => {
    // Arrange
    registerUser({
      name: 'Otra',
      email: 'lucia@correo.com',
      password: 'secreta',
      planId: 'gratis',
    })
    const user = userEvent.setup()
    const { onRegister } = renderRegister()

    // Act
    await fill(user)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese email.',
    )
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('con un plan de pago debería pedir la tarjeta y guardar el plan elegido', async () => {
    // Arrange
    const user = userEvent.setup()
    const { onRegister } = renderRegister()
    await user.click(screen.getByRole('radio', { name: /Estudiante/ }))

    // Act: sin tarjeta no deja registrarse
    await fill(user)

    // Assert
    expect(
      await screen.findByText('Escribe un número de tarjeta válido.'),
    ).toBeInTheDocument()
    expect(onRegister).not.toHaveBeenCalled()

    // Act: con una tarjeta válida (el número se formatea al escribir)
    await user.type(
      screen.getByLabelText('Número de tarjeta'),
      '4242424242424242',
    )
    await user.type(screen.getByLabelText('Caducidad'), '1299')
    await user.type(screen.getByLabelText('CVV'), '123')
    expect(screen.getByLabelText('Número de tarjeta')).toHaveValue(
      '4242 4242 4242 4242',
    )
    await user.click(
      screen.getByRole('button', { name: /Crear cuenta · 4,99 €\/mes/ }),
    )

    // Assert
    expect(onRegister).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'estudiante' }),
    )
    // La tarjeta no se guarda
    expect(JSON.stringify(readUsers())).not.toContain('4242')
  })
})
