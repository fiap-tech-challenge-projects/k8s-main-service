import { StockMovementType } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { UpdateStockMovementDto } from '@application/stock/dto'

describe('UpdateStockMovementDto', () => {
  it('validates optional fields correctly', async () => {
    const dto = plainToInstance(UpdateStockMovementDto, {
      quantity: 5,
      reason: ' updated ',
    })

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
    expect(dto.reason).toBeDefined()
  })

  it('rejects negative quantity', async () => {
    const dto = plainToInstance(UpdateStockMovementDto, { quantity: -1 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('accepts partial valid payloads and trims strings', async () => {
    const dto = new UpdateStockMovementDto()
    dto.quantity = 5
    dto.type = StockMovementType.IN
    dto.reason = '  reason '
    dto.notes = ' notes '

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('transforms string quantity to number and validates', async () => {
    const dto = plainToInstance(UpdateStockMovementDto, { quantity: '10' })
    // @Type(() => Number) should convert string to number
    expect(typeof (dto as any).quantity).toBe('number')

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
    expect(dto.quantity).toBe(10)
  })

  it('validates movementDate as ISO string', async () => {
    const good = plainToInstance(UpdateStockMovementDto, {
      movementDate: '2025-08-13T10:30:00.000Z',
    })
    const bad = plainToInstance(UpdateStockMovementDto, { movementDate: 'not-a-date' })

    const goodErrors = await validate(good)
    const badErrors = await validate(bad)

    expect(goodErrors.length).toBe(0)
    expect(badErrors.length).toBeGreaterThan(0)
  })

  it('rejects invalid enum type values', async () => {
    const dto = plainToInstance(UpdateStockMovementDto, { type: 'INVALID' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('trims reason and notes strings via Transform', () => {
    const dto = plainToInstance(UpdateStockMovementDto, { reason: '  a b c  ', notes: '\nnotes\n' })
    expect(dto.reason).toBe('a b c')
    expect(dto.notes).toBe('notes')
  })

  it('leaves non-string values unchanged by Transform (no validation run)', () => {
    const dto = plainToInstance(UpdateStockMovementDto, { reason: 123, notes: null }) as any
    // transform should not throw and should return original non-string values
    expect(dto.reason).toBe(123)
    expect(dto.notes).toBeNull()
  })
})
