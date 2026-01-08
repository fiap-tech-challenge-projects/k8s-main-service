import { UserRole } from '@prisma/client'

import { UserContextMiddleware } from '@shared/middleware'
import { UserContextService } from '@shared/services'

describe('UserContextMiddleware', () => {
  it('sets user context when req.user present', () => {
    const svc = new UserContextService()
    const mw = new UserContextMiddleware(svc)

    const req: any = { user: { id: 'u1', email: 'a@b.com', role: UserRole.CLIENT } }
    const res: any = {}
    const next = jest.fn()

    mw.use(req, res, next)

    expect(svc.getUserId()).toBe('u1')
    expect(svc.getUserEmail()).toBe('a@b.com')
    expect(svc.getUserRole()).toBe(UserRole.CLIENT)
    expect(next).toHaveBeenCalled()
  })

  describe('UserContextService (unit)', () => {
    it('manages user context and role checks', () => {
      const svc = new UserContextService()

      // initially empty
      expect(svc.getUserContext()).toBeNull()
      expect(svc.getUserId()).toBeNull()
      expect(svc.getUserEmail()).toBeNull()
      expect(svc.getUserRole()).toBeNull()
      expect(svc.getClientId()).toBeNull()
      expect(svc.getEmployeeId()).toBeNull()

      // set context
      svc.setUserContext({
        userId: 'u1',
        email: 'a@b.com',
        role: UserRole.CLIENT,
        clientId: 'c1',
        employeeId: 'e1',
      })

      const ctx = svc.getUserContext()
      expect(ctx).not.toBeNull()
      if (ctx) {
        expect(ctx.userId).toBe('u1')
        expect(ctx.email).toBe('a@b.com')
        expect(ctx.role).toBe(UserRole.CLIENT)
        expect(ctx.clientId).toBe('c1')
        expect(ctx.employeeId).toBe('e1')
      }

      expect(svc.getUserId()).toBe('u1')
      expect(svc.getUserEmail()).toBe('a@b.com')
      expect(svc.getUserRole()).toBe(UserRole.CLIENT)
      expect(svc.getClientId()).toBe('c1')
      expect(svc.getEmployeeId()).toBe('e1')

      // role checks
      expect(svc.hasRole(UserRole.CLIENT)).toBe(true)
      expect(svc.hasRole(UserRole.ADMIN)).toBe(false)
      expect(svc.hasAnyRole([UserRole.ADMIN, UserRole.CLIENT])).toBe(true)

      // clear
      svc.clearUserContext()
      expect(svc.getUserContext()).toBeNull()
      expect(svc.getUserId()).toBeNull()
    })
  })
})
