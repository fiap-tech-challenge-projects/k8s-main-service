import { UserRole } from '@prisma/client'

describe('ClientAccess decorator', () => {
  it('is exported as a function (sanity)', async () => {
    const { ClientAccess } = await import('@shared/decorators')
    expect(ClientAccess).toBeDefined()
    expect(typeof ClientAccess).toBe('function')
  })

  it('factory handles all role branches and errors', async () => {
    jest.resetModules()

    const captured: { fn?: (data: any, ctx: any) => any } = {}
    const originalCommon = jest.requireActual('@nestjs/common')

    jest.doMock('@nestjs/common', () => ({
      ...originalCommon,
      createParamDecorator: (fn: (data: any, ctx: any) => any) => {
        captured.fn = fn
        return () => () => {}
      },
    }))

    // import after mocking so the factory is captured
    await import('@shared/decorators')

    const factory = captured.fn!
    const { UnauthorizedException } = jest.requireActual('@nestjs/common')

    const makeCtx = (user: any, params: Record<string, string>) =>
      ({
        switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
      }) as any

    // missing user -> Unauthorized
    expect(() => factory('clientId', makeCtx(undefined, { clientId: 'c1' }))).toThrow(
      UnauthorizedException,
    )

    // missing clientId -> Unauthorized
    expect(() => factory('clientId', makeCtx({ role: UserRole.ADMIN }, {}))).toThrow(
      UnauthorizedException,
    )

    // ADMIN and EMPLOYEE allowed
    expect(factory('clientId', makeCtx({ role: UserRole.ADMIN }, { clientId: 'a' }))).toBe('a')
    expect(factory('clientId', makeCtx({ role: UserRole.EMPLOYEE }, { clientId: 'b' }))).toBe('b')

    // CLIENT allowed only for own id
    expect(
      factory('clientId', makeCtx({ role: UserRole.CLIENT, clientId: 'me' }, { clientId: 'me' })),
    ).toBe('me')
    expect(() =>
      factory(
        'clientId',
        makeCtx({ role: UserRole.CLIENT, clientId: 'me' }, { clientId: 'other' }),
      ),
    ).toThrow(UnauthorizedException)

    // invalid role
    expect(() => factory('clientId', makeCtx({ role: 'X' }, { clientId: 'c' }))).toThrow(
      UnauthorizedException,
    )
  })
})
