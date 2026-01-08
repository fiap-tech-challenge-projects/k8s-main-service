import { StockMovementType } from '@prisma/client'

import { StockMovement } from '@domain/stock/entities'

describe('StockMovement entity', () => {
  it('creates successfully with valid data', () => {
    const sm = StockMovement.create(
      StockMovementType.IN,
      10,
      new Date(),
      'stock-1',
      'reason',
      'notes',
    )

    expect(sm).toBeInstanceOf(StockMovement)
    expect(sm.quantity).toBe(10)
    expect(sm.stockId).toBe('stock-1')
    expect(sm.isInMovement()).toBeTruthy()
  })

  it('returns correct effective quantity for IN/OUT/ADJUSTMENT', () => {
    const now = new Date()

    const inSm = new StockMovement('id1', StockMovementType.IN, 5, now, 's1')
    expect(inSm.getEffectiveQuantity()).toBe(5)

    const outSm = new StockMovement('id2', StockMovementType.OUT, 3, now, 's1')
    expect(outSm.getEffectiveQuantity()).toBe(-3)

    const adjSm = new StockMovement('id3', StockMovementType.ADJUSTMENT, 2, now, 's1')
    expect(adjSm.getEffectiveQuantity()).toBe(2)
  })

  it('throws when created with invalid quantity', () => {
    expect(() => new StockMovement('id4', StockMovementType.IN, 0, new Date(), 's1')).toThrow()
  })
})
