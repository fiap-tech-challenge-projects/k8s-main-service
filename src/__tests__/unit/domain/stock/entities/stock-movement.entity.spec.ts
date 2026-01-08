import { StockMovementType } from '@prisma/client'

import { StockMovement } from '@domain/stock/entities'
import { StockMovementValidator } from '@domain/stock/validators'

describe('StockMovement entity', () => {
  const now = new Date('2025-01-01T00:00:00.000Z')

  beforeEach(() => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => now.getTime())
    jest.spyOn(StockMovementValidator, 'isValidMovementType').mockReturnValue(true)
    jest.spyOn(StockMovementValidator, 'isValidQuantity').mockReturnValue(true)
    jest.spyOn(StockMovementValidator, 'isValidMovementDate').mockReturnValue(true)
    jest.spyOn(StockMovementValidator, 'isValidStockId').mockReturnValue(true)
    jest.spyOn(StockMovementValidator, 'isValidReason').mockReturnValue(true)
    jest.spyOn(StockMovementValidator, 'isValidNotes').mockReturnValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates a valid StockMovement with create()', () => {
    const sm = StockMovement.create(
      StockMovementType.IN,
      5,
      new Date('2025-01-01T00:00:00.000Z'),
      'stock-1',
      'reason',
      'notes',
    )

    expect(sm).toBeInstanceOf(StockMovement)
    expect(sm.type).toBe(StockMovementType.IN)
    expect(sm.quantity).toBe(5)
    expect(sm.stockId).toBe('stock-1')
  })

  it('throws when constructor validation fails for type', () => {
    ;(StockMovementValidator.isValidMovementType as jest.Mock).mockReturnValue(false)

    expect(() => new StockMovement('id', StockMovementType.IN, 1, new Date(), 's1')).toThrow(
      'Invalid movement type',
    )
  })

  it('update methods validate and update fields', () => {
    const sm = StockMovement.create(
      StockMovementType.OUT,
      3,
      new Date('2025-01-01T00:00:00.000Z'),
      'stock-2',
    )

    // update type
    ;(StockMovementValidator.isValidMovementType as jest.Mock).mockReturnValue(true)
    sm.updateType(StockMovementType.ADJUSTMENT)
    expect(sm.type).toBe(StockMovementType.ADJUSTMENT)

    // update quantity
    ;(StockMovementValidator.isValidQuantity as jest.Mock).mockReturnValue(true)
    sm.updateQuantity(10)
    expect(sm.quantity).toBe(10)

    // update movement date
    ;(StockMovementValidator.isValidMovementDate as jest.Mock).mockReturnValue(true)
    const d = new Date('2025-02-01T00:00:00.000Z')
    sm.updateMovementDate(d)
    expect(sm.movementDate).toBe(d)

    // update reason/notes
    ;(StockMovementValidator.isValidReason as jest.Mock).mockReturnValue(true)
    sm.updateReason('new reason')
    expect(sm.reason).toBe('new reason')
    ;(StockMovementValidator.isValidNotes as jest.Mock).mockReturnValue(true)
    sm.updateNotes('new notes')
    expect(sm.notes).toBe('new notes')
  })

  it('throws on invalid updates', () => {
    const sm = StockMovement.create(
      StockMovementType.IN,
      2,
      new Date('2025-01-01T00:00:00.000Z'),
      'stock-3',
    )

    ;(StockMovementValidator.isValidQuantity as jest.Mock).mockReturnValue(false)
    expect(() => sm.updateQuantity(-1)).toThrow('Invalid quantity')
    ;(StockMovementValidator.isValidMovementDate as jest.Mock).mockReturnValue(false)
    expect(() => sm.updateMovementDate(new Date('1900-01-01'))).toThrow('Invalid movement date')
    ;(StockMovementValidator.isValidReason as jest.Mock).mockReturnValue(false)
    expect(() => sm.updateReason('x'.repeat(201))).toThrow('Invalid reason')
    ;(StockMovementValidator.isValidNotes as jest.Mock).mockReturnValue(false)
    expect(() => sm.updateNotes('x'.repeat(501))).toThrow('Invalid notes')
  })

  it('movement type helpers and effective quantity branches', () => {
    const inSm = StockMovement.create(
      StockMovementType.IN,
      5,
      new Date('2025-01-01T00:00:00.000Z'),
      's-in',
    )
    expect(inSm.isInMovement()).toBe(true)
    expect(inSm.getEffectiveQuantity()).toBe(5)

    const outSm = StockMovement.create(
      StockMovementType.OUT,
      5,
      new Date('2025-01-01T00:00:00.000Z'),
      's-out',
    )
    expect(outSm.isOutMovement()).toBe(true)
    expect(outSm.getEffectiveQuantity()).toBe(-5)

    const adjSm = StockMovement.create(
      StockMovementType.ADJUSTMENT,
      -3,
      new Date('2025-01-01T00:00:00.000Z'),
      's-adj',
    )
    expect(adjSm.isAdjustmentMovement()).toBe(true)
    expect(adjSm.getEffectiveQuantity()).toBe(-3)
  })
})
