import { BudgetItemType } from '@prisma/client'
import { validate } from 'class-validator'

import { IsValidBudgetItemType } from '@application/budget-items/validators'

class DTO {
  // property used just to attach decorator
  @IsValidBudgetItemType()
  prop!: unknown

  type?: BudgetItemType
  serviceId?: string
  stockItemId?: string
}

describe('budget-item-type-validator', () => {
  it('fails when type is missing', async () => {
    const dto = new DTO()
    dto.type = undefined

    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].constraints).toBeDefined()
  })

  it('fails when both serviceId and stockItemId provided', async () => {
    const dto = new DTO()
    dto.type = BudgetItemType.SERVICE
    dto.serviceId = 's'
    dto.stockItemId = 'st'

    const errors = await validate(dto)

    expect(errors[0].constraints).toBeDefined()
    const msg = Object.values(errors[0].constraints!).join(' ')
    expect(msg).toMatch(/both serviceId and stockItemId/i)
  })

  it('SERVICE type requires serviceId and forbids stockItemId', async () => {
    const dtoNoService = new DTO()
    dtoNoService.type = BudgetItemType.SERVICE

    const e1 = await validate(dtoNoService)
    expect(e1.length).toBeGreaterThan(0)
    expect(Object.values(e1[0].constraints!).join(' ')).toMatch(
      /SERVICE type must have a serviceId/i,
    )

    const dtoWithStock = new DTO()
    dtoWithStock.type = BudgetItemType.SERVICE
    dtoWithStock.serviceId = 's'
    dtoWithStock.stockItemId = 'st'

    const e2 = await validate(dtoWithStock)
    expect(e2.length).toBeGreaterThan(0)
    expect(Object.values(e2[0].constraints!).join(' ')).toMatch(
      /Cannot provide both serviceId and stockItemId/i,
    )

    const dtoOk = new DTO()
    dtoOk.type = BudgetItemType.SERVICE
    dtoOk.serviceId = 's'

    const e3 = await validate(dtoOk)
    expect(e3.length).toBe(0)
  })

  it('STOCK_ITEM type requires stockItemId and forbids serviceId', async () => {
    const dtoNoStock = new DTO()
    dtoNoStock.type = BudgetItemType.STOCK_ITEM

    const e1 = await validate(dtoNoStock)
    expect(e1.length).toBeGreaterThan(0)
    expect(Object.values(e1[0].constraints!).join(' ')).toMatch(
      /STOCK_ITEM type must have a stockItemId/i,
    )

    const dtoWithService = new DTO()
    dtoWithService.type = BudgetItemType.STOCK_ITEM
    dtoWithService.stockItemId = 'st'
    dtoWithService.serviceId = 's'

    const e2 = await validate(dtoWithService)
    expect(e2.length).toBeGreaterThan(0)
    expect(Object.values(e2[0].constraints!).join(' ')).toMatch(
      /Cannot provide both serviceId and stockItemId/i,
    )

    const dtoOk = new DTO()
    dtoOk.type = BudgetItemType.STOCK_ITEM
    dtoOk.stockItemId = 'st'

    const e3 = await validate(dtoOk)
    expect(e3.length).toBe(0)
  })
})
