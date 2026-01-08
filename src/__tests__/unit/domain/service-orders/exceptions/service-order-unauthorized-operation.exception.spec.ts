import { UserRole, ServiceOrderStatus } from '@prisma/client'

import {
  ServiceOrderUnauthorizedOperationException,
  ServiceOrderUnauthorizedStatusChangeException,
  ServiceOrderVehicleOwnershipException,
} from '@domain/service-orders/exceptions'

describe('ServiceOrder unauthorized exceptions', () => {
  it('constructs operation exception with role and operation', () => {
    const ex = new ServiceOrderUnauthorizedOperationException('delete', UserRole.CLIENT)
    expect(ex.name).toBe('ServiceOrderUnauthorizedOperationException')
    expect(ex.message).toContain('CLIENT')
    expect(ex.message).toContain('delete')
  })

  it('constructs status change exception with details', () => {
    const ex = new ServiceOrderUnauthorizedStatusChangeException(
      'so1',
      ServiceOrderStatus.REQUESTED,
      ServiceOrderStatus.DELIVERED,
      UserRole.EMPLOYEE,
    )

    expect(ex.name).toBe('ServiceOrderUnauthorizedStatusChangeException')
    expect(ex.message).toContain('so1')
    expect(ex.message).toContain('REQUESTED')
    expect(ex.message).toContain('DELIVERED')
    expect(ex.message).toContain('EMPLOYEE')
  })

  it('constructs vehicle ownership exception with ids', () => {
    const ex = new ServiceOrderVehicleOwnershipException('v1', 'c1')
    expect(ex.name).toBe('ServiceOrderVehicleOwnershipException')
    expect(ex.message).toContain('v1')
    expect(ex.message).toContain('c1')
  })
})
