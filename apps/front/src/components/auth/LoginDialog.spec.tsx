import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { registerUser } from '#/lib/users-storage'
import { LoginDialog } from './LoginDialog'

const renderLogin = () => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onLogin: vi.fn(),
    onSwitchToRegister: vi.fn(),
  }
  render(<LoginDialog {...props} />)
  return props
}

describe('LoginDialog', () => {
  beforeEach(() => {
    registerUser({
      name: 'Lucía',
      email: 'lucia@correo.com',
      password: 'secreta',
    })
  })

  it('debería mostrar los errores de los campos vacíos y no entrar', async () => {
    // Arrange
    const user = userEvent.setup()
    const { onLogin } = renderLogin()

    // Act
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    expect(await screen.findByText('Escribe tu email.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('debería avisar si el email o la contraseña no son correctos', async () => {
    const user = userEvent.setup()
    const { onLogin } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'lucia@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'equivocada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email o contraseña incorrectos.',
    )
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('debería entrar con las credenciales de un usuario registrado', async () => {
    const user = userEvent.setup()
    const { onLogin } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'lucia@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(onLogin).toHaveBeenCalledTimes(1)
    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Lucía', email: 'lucia@correo.com' }),
    )
  })

  it('debería pasar al registro desde el enlace', async () => {
    const user = userEvent.setup()
    const { onSwitchToRegister } = renderLogin()

    await user.click(screen.getByRole('button', { name: 'Regístrate' }))

    expect(onSwitchToRegister).toHaveBeenCalledTimes(1)
  })
})
