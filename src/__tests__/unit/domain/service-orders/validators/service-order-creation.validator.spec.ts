import { UserRole } from '@prisma/client'

import {
  ServiceOrderVehicleOwnershipException,
  ServiceOrderUnauthorizedOperationException,
} from '@domain/service-orders/exceptions'
import { ServiceOrderCreationValidator } from '@domain/service-orders/validators'

describe('ServiceOrderCreationValidator', () => {
  it('allows EMPLOYEE and CLIENT roles', () => {
    expect(ServiceOrderCreationValidator.canCreateServiceOrder(UserRole.EMPLOYEE)).toBe(true)
    expect(ServiceOrderCreationValidator.canCreateServiceOrder(UserRole.CLIENT)).toBe(true)
  })

  it('rejects other roles', () => {
    expect(ServiceOrderCreationValidator.canCreateServiceOrder((UserRole as any).ADMIN)).toBe(false)
  })

  it('validateClientCanCreateForVehicle throws when client mismatch', () => {
    expect(() =>
      ServiceOrderCreationValidator.validateClientCanCreateForVehicle('v1', 'other', 'vehicle-1'),
    ).toThrow(ServiceOrderVehicleOwnershipException)
  })

  it('validateCanCreateServiceOrder throws for unauthorized role', () => {
    expect(() =>
      ServiceOrderCreationValidator.validateCanCreateServiceOrder((UserRole as any).ADMIN),
    ).toThrow(ServiceOrderUnauthorizedOperationException)
  })
})
