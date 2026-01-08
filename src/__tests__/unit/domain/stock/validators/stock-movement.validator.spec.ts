import { StockMovementType } from '@prisma/client'

import { StockMovementValidator } from '@domain/stock/validators'

describe('domain/stock/validators/StockMovementValidator', () => {
  describe('basic validators', () => {
    it('validates movement type', () => {
      expect(StockMovementValidator.isValidMovementType(StockMovementType.IN)).toBe(true)
      // invalid value
      expect(StockMovementValidator.isValidMovementType('INVALID' as any)).toBe(false)
    })

    it('validates quantity', () => {
      expect(StockMovementValidator.isValidQuantity(1)).toBe(true)
      expect(StockMovementValidator.isValidQuantity(0)).toBe(false)
      expect(StockMovementValidator.isValidQuantity(-1)).toBe(false)
      expect(StockMovementValidator.isValidQuantity(1.5)).toBe(false)
    })

    it('validates movement date ranges', () => {
      const now = new Date()
      expect(StockMovementValidator.isValidMovementDate(now)).toBe(true)

      // far past
      const farPast = new Date()
      farPast.setFullYear(farPast.getFullYear() - 2)
      expect(StockMovementValidator.isValidMovementDate(farPast)).toBe(false)

      // far future
      const farFuture = new Date()
      farFuture.setDate(farFuture.getDate() + 10)
      expect(StockMovementValidator.isValidMovementDate(farFuture)).toBe(false)
    })

    it('validates optional reason and notes length', () => {
      expect(StockMovementValidator.isValidReason()).toBe(true)
      expect(StockMovementValidator.isValidNotes()).toBe(true)

      const longReason = 'a'.repeat(201)
      expect(StockMovementValidator.isValidReason(longReason)).toBe(false)

      const longNotes = 'b'.repeat(501)
      expect(StockMovementValidator.isValidNotes(longNotes)).toBe(false)
    })

    it('validates stock id', () => {
      expect(StockMovementValidator.isValidStockId('id')).toBe(true)
      expect(StockMovementValidator.isValidStockId('')).toBe(false)
      expect(StockMovementValidator.isValidStockId('   ')).toBe(false)
    })

    it('validates out movement availability and adjustments', () => {
      expect(StockMovementValidator.canPerformOutMovement(5, 3)).toBe(true)
      expect(StockMovementValidator.canPerformOutMovement(2, 5)).toBe(false)

      expect(StockMovementValidator.isValidAdjustmentMovement(5, -3)).toBe(true)
      expect(StockMovementValidator.isValidAdjustmentMovement(2, -3)).toBe(false)
    })
  })

  describe('validateStockMovementData', () => {
    const base = {
      stockId: 's1',
      reason: undefined as unknown as string | undefined,
      notes: undefined as unknown as string | undefined,
      currentStock: 10,
    }

    it('accepts a valid IN movement', () => {
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 5,
          movementDate: new Date(),
          ...base,
        }),
      ).not.toThrow()
    })

    it('throws on invalid movement type', () => {
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: 'UNKNOWN' as any,
          quantity: 1,
          movementDate: new Date(),
          ...base,
        }),
      ).toThrow('Invalid movement type')
    })

    it('throws on invalid quantity', () => {
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 0,
          movementDate: new Date(),
          ...base,
        }),
      ).toThrow('Invalid quantity')
    })

    it('throws on invalid movement date', () => {
      const old = new Date()
      old.setFullYear(old.getFullYear() - 5)
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 1,
          movementDate: old,
          ...base,
        }),
      ).toThrow('Invalid movement date')
    })

    it('throws on invalid stock id', () => {
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 1,
          movementDate: new Date(),
          stockId: '',
          currentStock: 0,
        }),
      ).toThrow('Invalid stock ID')
    })

    it('throws on too long reason/notes', () => {
      const longReason = 'r'.repeat(201)
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 1,
          movementDate: new Date(),
          stockId: 's1',
          reason: longReason,
          currentStock: 0,
        }),
      ).toThrow('Invalid reason')

      const longNotes = 'n'.repeat(501)
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.IN,
          quantity: 1,
          movementDate: new Date(),
          stockId: 's1',
          notes: longNotes,
          currentStock: 0,
        }),
      ).toThrow('Invalid notes')
    })

    it('throws when OUT movement has insufficient stock', () => {
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.OUT,
          quantity: 5,
          movementDate: new Date(),
          stockId: 's1',
          currentStock: 2,
        }),
      ).toThrow('Insufficient stock for OUT movement')
    })

    it('throws when ADJUSTMENT provided with invalid quantity', () => {
      // negative quantity is invalid and will be rejected earlier
      expect(() =>
        StockMovementValidator.validateStockMovementData({
          type: StockMovementType.ADJUSTMENT,
          quantity: -5,
          movementDate: new Date(),
          stockId: 's1',
          currentStock: 2,
        }),
      ).toThrow('Invalid quantity')
    })
  })
})
