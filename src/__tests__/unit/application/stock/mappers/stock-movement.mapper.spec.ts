import { StockMovementMapper } from '@application/stock/mappers'

describe('StockMovementMapper', () => {
  it('converts create dto to domain and back to response', () => {
    const dto: any = {
      type: 'IN',
      quantity: 5,
      stockId: 'st-1',
      movementDate: new Date().toISOString(),
      reason: 'restock',
      notes: 'n',
    }

    const domain = StockMovementMapper.fromCreateDto(dto)
    const resp = StockMovementMapper.toResponseDto(domain)

    expect(resp.id).toBeDefined()
    expect(resp.quantity).toBe(dto.quantity)
  })

  it('updates existing entity when dto fields differ', () => {
    const existing: any = StockMovementMapper.fromCreateDto({
      type: 'IN',
      quantity: 1,
      stockId: 'st-1',
    })

    const updated = StockMovementMapper.fromUpdateDto(
      { quantity: 10, notes: 'new' } as any,
      existing,
    )

    expect(updated.quantity).toBe(10)
    expect(updated.notes).toBe('new')
  })

  it('maps array to response array', () => {
    const a = [StockMovementMapper.fromCreateDto({ type: 'IN', quantity: 2, stockId: 'st-1' })]
    const arr = StockMovementMapper.toResponseDtoArray(a as any)

    expect(Array.isArray(arr)).toBe(true)
    expect(arr[0].quantity).toBe(2)
  })
})
