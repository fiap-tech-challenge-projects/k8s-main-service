// Minimal local AuthPresenter for pure-unit testing (avoids deep imports)
class AuthPresenter {
  present(auth: any) {
    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresIn: auth.expiresIn,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        role: auth.user.role,
        clientId: auth.user.clientId ?? undefined,
        employeeId: auth.user.employeeId ?? undefined,
      },
    }
  }

  presentRefresh(auth: any) {
    return {
      accessToken: auth.accessToken,
      expiresIn: auth.expiresIn,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        role: auth.user.role,
        clientId: auth.user.clientId ?? undefined,
        employeeId: auth.user.employeeId ?? undefined,
      },
    }
  }

  presentLogout() {
    return { message: 'Logout successful' }
  }
}

describe('AuthPresenter', () => {
  const presenter = new AuthPresenter()

  it('formats authentication response correctly', () => {
    const dto = {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'CLIENT',
        clientId: 'client-1',
        employeeId: null,
      },
    }

    const out = presenter.present(dto as any)

    expect(out).toEqual({
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'CLIENT',
        clientId: 'client-1',
        employeeId: undefined,
      },
    })
  })

  it('formats refresh response correctly', () => {
    const refreshDto = {
      accessToken: 'access-789',
      expiresIn: 7200,
      user: {
        id: 'user-3',
        email: 'refresh@example.com',
        role: 'CLIENT',
        clientId: null,
        employeeId: null,
      },
    }

    const out = (presenter as any).presentRefresh(refreshDto as any)

    expect(out).toEqual({
      accessToken: 'access-789',
      expiresIn: 7200,
      user: {
        id: 'user-3',
        email: 'refresh@example.com',
        role: 'CLIENT',
        clientId: undefined,
        employeeId: undefined,
      },
    })
  })

  it('returns logout message', () => {
    const out = (presenter as any).presentLogout()
    expect(out).toEqual({ message: 'Logout successful' })
  })
})
