import { ServiceOrderStatus, UserRole } from '@prisma/client'

import { ServiceOrderStatusChangeValidator } from '@domain/service-orders/validators'

describe('ServiceOrderStatusChangeValidator', () => {
  it('allows employee to change to IN_DIAGNOSIS', () => {
    const ok = ServiceOrderStatusChangeValidator.canChangeStatus(
      ServiceOrderStatus.REQUESTED as any,
      ServiceOrderStatus.IN_DIAGNOSIS as any,
      UserRole.EMPLOYEE as any,
    )
    expect(ok).toBe(true)
  })

  it('prevents non-admin cancelling', () => {
    const ok = ServiceOrderStatusChangeValidator.canChangeStatus(
      ServiceOrderStatus.REQUESTED as any,
      ServiceOrderStatus.CANCELLED as any,
      UserRole.CLIENT as any,
    )
    expect(ok).toBe(false)
  })

  it('allows admin to cancel', () => {
    const ok = ServiceOrderStatusChangeValidator.canChangeStatus(
      ServiceOrderStatus.REQUESTED as any,
      ServiceOrderStatus.CANCELLED as any,
      UserRole.ADMIN as any,
    )
    expect(ok).toBe(true)
  })

  it('allows client or employee to approve/reject', () => {
    expect(
      ServiceOrderStatusChangeValidator.canChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.APPROVED as any,
        UserRole.CLIENT as any,
      ),
    ).toBe(true)

    expect(
      ServiceOrderStatusChangeValidator.canChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.REJECTED as any,
        UserRole.EMPLOYEE as any,
      ),
    ).toBe(true)
  })

  it('prevents non-employee from entering execution/finished/delivered', () => {
    expect(
      ServiceOrderStatusChangeValidator.canChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.IN_EXECUTION as any,
        UserRole.CLIENT as any,
      ),
    ).toBe(false)

    expect(
      ServiceOrderStatusChangeValidator.canChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.FINISHED as any,
        UserRole.CLIENT as any,
      ),
    ).toBe(false)

    expect(
      ServiceOrderStatusChangeValidator.canChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.DELIVERED as any,
        UserRole.CLIENT as any,
      ),
    ).toBe(false)
  })

  it('validateRoleCanChangeStatus throws for unauthorized role and does not throw for allowed roles', () => {
    // unauthorized: cancel by CLIENT
    expect(() =>
      ServiceOrderStatusChangeValidator.validateRoleCanChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.CANCELLED as any,
        UserRole.CLIENT as any,
        'so-1',
      ),
    ).toThrow()

    // authorized: cancel by ADMIN should not throw
    expect(() =>
      ServiceOrderStatusChangeValidator.validateRoleCanChangeStatus(
        ServiceOrderStatus.REQUESTED as any,
        ServiceOrderStatus.CANCELLED as any,
        UserRole.ADMIN as any,
        'so-1',
      ),
    ).not.toThrow()
  })
})
