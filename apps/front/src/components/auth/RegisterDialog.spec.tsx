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
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
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
})
