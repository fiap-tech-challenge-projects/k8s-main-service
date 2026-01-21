import { StockMovementType } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { CreateStockMovementDto } from '@application/stock/dto'

describe('CreateStockMovementDto', () => {
  it('validates a correct payload with optional fields trimmed', async () => {
    const payload = {
      type: StockMovementType.IN,
      quantity: 5,
      stockId: 's1',
      reason: ' purchase ',
      notes: ' note ',
      movementDate: new Date().toISOString(),
    }

    const dto = plainToInstance(CreateStockMovementDto, payload)
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
    expect(dto.reason).toBe('purchase')
    expect(dto.notes).toBe('note')
  })

  it('rejects invalid quantity and missing stockId', async () => {
    const dto = plainToInstance(CreateStockMovementDto, {
      type: 'IN',
      quantity: 0,
    } as any)

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('validates an instance constructed manually', async () => {
    const dto = new CreateStockMovementDto()
    dto.type = StockMovementType.IN
    dto.quantity = 10
    dto.stockId = 'stock-1'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('transforms string quantity to number when plainToInstance is used', async () => {
    const dto = plainToInstance(CreateStockMovementDto, {
      type: StockMovementType.IN,
      quantity: '15',
      stockId: 's2',
    }) as any

    expect(typeof dto.quantity).toBe('number')
    expect(dto.quantity).toBe(15)
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('rejects invalid movementDate and leaves non-string transforms intact', async () => {
    const dto = plainToInstance(CreateStockMovementDto, {
      type: StockMovementType.OUT,
      quantity: 1,
      stockId: 's3',
      movementDate: 'invalid-date',
      reason: 42,
      notes: null,
    }) as any

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(dto.reason).toBe(42)
    expect(dto.notes).toBeNull()
  })
})
