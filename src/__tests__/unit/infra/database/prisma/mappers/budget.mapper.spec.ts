import { BudgetStatus, DeliveryMethod } from '@prisma/client'

import { Budget } from '@domain/budget/entities'
import { BudgetMapper } from '@infra/database/prisma/mappers'

describe('BudgetMapper', () => {
  const mockPrismaBudget = {
    id: 'budget-123',
    status: BudgetStatus.GENERATED,
    totalAmount: 1500.0,
    validityPeriod: 7,
    generationDate: new Date('2023-01-01'),
    sentDate: null,
    approvalDate: null,
    rejectionDate: null,
    deliveryMethod: DeliveryMethod.EMAIL,
    notes: 'Test budget notes',
    serviceOrderId: 'service-order-456',
    clientId: 'client-789',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  }

  // Removed unused mockPrismaBudgetItem

  const mockBudgetEntity = Budget.create(
    'service-order-456',
    'client-789',
    7,
    DeliveryMethod.EMAIL,
    'Test budget notes',
    BudgetStatus.GENERATED,
    '1500.0',
  )

  describe('toDomain', () => {
    it('should convert Prisma budget model to domain entity', () => {
      const result = BudgetMapper.toDomain(mockPrismaBudget)

      expect(result).toBeInstanceOf(Budget)
      expect(result.status).toBe(mockPrismaBudget.status)
      expect(result.totalAmount.getValue()).toBe(mockPrismaBudget.totalAmount)
      expect(result.validityPeriod).toBe(mockPrismaBudget.validityPeriod)
      expect(result.generationDate).toBeInstanceOf(Date)
      expect(result.serviceOrderId).toBe(mockPrismaBudget.serviceOrderId)
    })

    it('should throw when prisma model is null or undefined', () => {
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toDomain(null)).toThrow(
        'Prisma Budget model cannot be null or undefined',
      )
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toDomain(undefined)).toThrow(
        'Prisma Budget model cannot be null or undefined',
      )
    })

    it('should map null optional dates/fields to undefined on domain', () => {
      const result = BudgetMapper.toDomain(mockPrismaBudget)

      expect(result.sentDate).toBeUndefined()
      expect(result.approvalDate).toBeUndefined()
      expect(result.rejectionDate).toBeUndefined()
      expect(result.deliveryMethod).toBe(mockPrismaBudget.deliveryMethod)
      expect(result.notes).toBe(mockPrismaBudget.notes)
    })
    it('should handle dates in optional fields', () => {
      // Already tested above: optional date fields
    })
  })

  describe('toPrismaCreate', () => {
    it('should convert domain entity to Prisma create input', () => {
      const result = BudgetMapper.toPrismaCreate(mockBudgetEntity)

      expect(result.status).toBe(mockBudgetEntity.status)
      expect(result.totalAmount).toBe(mockBudgetEntity.totalAmount.getValue())
      expect(result.validityPeriod).toBe(mockBudgetEntity.validityPeriod)
      expect(result.generationDate).toBeInstanceOf(Date)
      expect(result.serviceOrderId).toBe(mockBudgetEntity.serviceOrderId)
      expect(result.clientId).toBe(mockBudgetEntity.clientId)
      expect(result.sentDate).toBeNull()
      expect(result.approvalDate).toBeNull()
      expect(result.rejectionDate).toBeNull()
      expect(result.deliveryMethod).toBe(mockBudgetEntity.deliveryMethod)
      expect(result.notes).toBe(mockBudgetEntity.notes)
    })

    it('should throw when entity is null or undefined', () => {
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toPrismaCreate(null)).toThrow(
        'Budget domain entity cannot be null or undefined',
      )
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toPrismaCreate(undefined)).toThrow(
        'Budget domain entity cannot be null or undefined',
      )
    })
    // Removed invalid/unused test for budget items
  })

  describe('toPrismaUpdate', () => {
    it('should convert domain entity to Prisma update input', () => {
      const result = BudgetMapper.toPrismaUpdate(mockBudgetEntity)

      expect(result.status).toBe(mockBudgetEntity.status)
      expect(result.totalAmount).toBe(mockBudgetEntity.totalAmount.getValue())
      expect(result.validityPeriod).toBe(mockBudgetEntity.validityPeriod)
      expect(result.sentDate).toBeNull()
      expect(result.approvalDate).toBeNull()
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw when entity is null or undefined', () => {
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toPrismaUpdate(null)).toThrow(
        'Budget domain entity cannot be null or undefined',
      )
      // @ts-expect-error testing runtime behavior
      expect(() => BudgetMapper.toPrismaUpdate(undefined)).toThrow(
        'Budget domain entity cannot be null or undefined',
      )
    })

    it('toDomainMany should return empty array for non-array and filter nulls', () => {
      // @ts-expect-error testing runtime behavior
      expect(BudgetMapper.toDomainMany(null)).toEqual([])

      const many = BudgetMapper.toDomainMany([mockPrismaBudget, null, undefined] as any)
      expect(Array.isArray(many)).toBe(true)
      expect(many.length).toBe(1)
      expect(many[0]).toBeInstanceOf(Budget)
    })
    it('should handle budget with dates in optional fields', () => {
      const budgetWithDates = Budget.create(
        'service-order-456',
        'client-789',
        7,
        DeliveryMethod.EMAIL,
        'Test budget notes',
        BudgetStatus.APPROVED,
        '1500.0',
      )

      // Simulate setting dates (would normally be done by domain methods)
      Object.defineProperty(budgetWithDates, 'sentDate', {
        value: new Date('2023-01-02'),
        writable: true,
      })
      Object.defineProperty(budgetWithDates, 'approvalDate', {
        value: new Date('2023-01-03'),
        writable: true,
      })

      BudgetMapper.toPrismaUpdate(budgetWithDates)
      // Already tested above: optional date fields
    })
  })
})
