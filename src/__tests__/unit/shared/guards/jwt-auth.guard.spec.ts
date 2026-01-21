import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { JwtAuthGuard } from '@shared/guards'

describe('JwtAuthGuard', () => {
  const reflector = new Reflector()
  const guard = new JwtAuthGuard(reflector)

  const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const request = {
      headers,
      user: undefined,
    }
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext
  }

  it('returns true for public routes via reflector', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)
    const ctx = createMockContext()
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('throws UnauthorizedException when missing required headers', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const ctx = createMockContext({})
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException)
  })

  it('throws UnauthorizedException when x-user-id is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const ctx = createMockContext({
      'x-user-email': 'test@example.com',
      'x-user-role': 'ADMIN',
    })
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException)
  })

  it('returns true and sets user when all required headers are present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const ctx = createMockContext({
      'x-user-id': 'user-123',
      'x-user-email': 'test@example.com',
      'x-user-role': 'ADMIN',
    })
    const result = guard.canActivate(ctx)
    expect(result).toBe(true)

    const request = ctx.switchToHttp().getRequest()
    expect(request.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'ADMIN',
      clientId: null,
      employeeId: null,
    })
  })

  it('includes optional headers when present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const ctx = createMockContext({
      'x-user-id': 'user-123',
      'x-user-email': 'test@example.com',
      'x-user-role': 'CLIENT',
      'x-client-id': 'client-456',
      'x-employee-id': 'employee-789',
    })
    const result = guard.canActivate(ctx)
    expect(result).toBe(true)

    const request = ctx.switchToHttp().getRequest()
    expect(request.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'CLIENT',
      clientId: 'client-456',
      employeeId: 'employee-789',
    })
  })
})
