/// <reference types="jest" />

import { StockMovementType } from '@prisma/client'

import { StockMovement } from '@domain/stock/entities'
import { StockMovementMapper } from '@infra/database/prisma/mappers'

describe('StockMovementMapper', () => {
  describe('toDomain', () => {
    it('should map prisma model to domain entity', () => {
      const now = new Date()
      const prismaModel: any = {
        id: 'sm-1',
        type: StockMovementType.IN,
        quantity: 10,
        movementDate: now,
        stockId: 'stock-1',
        reason: 'restock',
        notes: 'received',
        createdAt: now,
        updatedAt: now,
      }

      const entity = StockMovementMapper.toDomain(prismaModel)

      expect(entity).toBeInstanceOf(StockMovement)
      expect(entity.id).toBe('sm-1')
      expect(entity.type).toBe(StockMovementType.IN)
      expect(entity.quantity).toBe(10)
      expect(entity.movementDate).toBe(now)
      expect(entity.stockId).toBe('stock-1')
      expect(entity.reason).toBe('restock')
      expect(entity.notes).toBe('received')
    })

    it('should throw on null input', () => {
      // @ts-expect-error: passing null to assert runtime error
      expect(() => StockMovementMapper.toDomain(null)).toThrow()
    })
  })

  describe('toDomainMany', () => {
    it('should map array of prisma models', () => {
      const now = new Date()
      const arr = [
        {
          id: 'sm-1',
          type: StockMovementType.OUT,
          quantity: 5,
          movementDate: now,
          stockId: 'stock-1',
          reason: null,
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ]

      const entities = StockMovementMapper.toDomainMany(arr as any)
      expect(Array.isArray(entities)).toBe(true)
      expect(entities[0].id).toBe('sm-1')
    })

    it('should return empty array for non-array input', () => {
      // @ts-expect-error: passing null to assert runtime fallback
      expect(StockMovementMapper.toDomainMany(null)).toEqual([])
    })
  })

  describe('toPrismaCreate / toPrismaUpdate', () => {
    it('should map domain entity to prisma create input', () => {
      const movement = StockMovement.create(
        StockMovementType.ADJUSTMENT,
        3,
        new Date(),
        'stock-1',
        'reason',
        'notes',
      )

      const create = StockMovementMapper.toPrismaCreate(movement)
      expect(create).toHaveProperty('id')
      expect(create.type).toBe(StockMovementType.ADJUSTMENT)
      expect(create.quantity).toBe(3)
      expect(create.stockId).toBe('stock-1')
    })

    it('should build update input from partial data', () => {
      const partial: any = { quantity: 7, notes: 'updated' }
      const update = StockMovementMapper.toPrismaUpdate(partial)

      expect(update).toHaveProperty('quantity')
      expect(update.quantity).toBe(7)
      expect(update.notes).toBe('updated')
    })
  })
})
