import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { RolesGuard } from '@shared/guards'

function makeCtx(req: any): ExecutionContext {
  return {
    getHandler: () => () => {},
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  it('returns true when no roles metadata', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector
    const guard = new RolesGuard(reflector)
    const ok = guard.canActivate(makeCtx({ user: { role: 'CLIENT' } }))
    expect(ok).toBe(true)
  })

  it('throws when user missing', () => {
    const reflector = { getAllAndOverride: () => ['CLIENT'] } as unknown as Reflector
    const guard = new RolesGuard(reflector)
    expect(() => guard.canActivate(makeCtx({}))).toThrow(ForbiddenException)
  })

  it('throws when user has insufficient role', () => {
    const reflector = { getAllAndOverride: () => ['EMPLOYEE'] } as unknown as Reflector
    const guard = new RolesGuard(reflector)
    expect(() => guard.canActivate(makeCtx({ user: { role: 'CLIENT' } }))).toThrow(
      ForbiddenException,
    )
  })

  it('returns true when user has required role', () => {
    const reflector = { getAllAndOverride: () => ['CLIENT'] } as unknown as Reflector
    const guard = new RolesGuard(reflector)
    const ok = guard.canActivate(makeCtx({ user: { role: 'CLIENT' } }))
    expect(ok).toBe(true)
  })
})
