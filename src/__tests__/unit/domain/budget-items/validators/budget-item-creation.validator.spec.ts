import { ServiceOrderStatus } from '@prisma/client'

import { InvalidServiceOrderStatusForBudgetItemException } from '@domain/budget-items/exceptions'
import { BudgetItemCreationValidator } from '@domain/budget-items/validators'

describe('BudgetItemCreationValidator', () => {
  it('allows adding budget items when status is IN_DIAGNOSIS', () => {
    expect(BudgetItemCreationValidator.canAddBudgetItems(ServiceOrderStatus.IN_DIAGNOSIS)).toBe(
      true,
    )
  })

  it('throws when status does not allow adding budget items', () => {
    expect(() =>
      BudgetItemCreationValidator.validateCanAddBudgetItems(ServiceOrderStatus.FINISHED, 'so-1'),
    ).toThrow(InvalidServiceOrderStatusForBudgetItemException)
  })
})
