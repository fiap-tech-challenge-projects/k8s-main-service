import { BudgetItem as PrismaBudgetItem, BudgetItemType } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { BudgetItemMapper } from '@infra/database/prisma/mappers'
import { Price } from '@shared/value-objects'

describe('BudgetItemMapper - unit', () => {
  const now = new Date('2020-01-01T00:00:00.000Z')

  it('toDomain throws when prisma model is null/undefined', () => {
    // @ts-expect-error testing invalid input
    expect(() => BudgetItemMapper.toDomain(null)).toThrow(
      'Prisma BudgetItem model cannot be null or undefined',
    )
  })

  it('toDomain maps prisma model to domain correctly', () => {
    const prisma: PrismaBudgetItem = {
      id: 'i1',
      type: BudgetItemType.SERVICE,
      description: 'desc',
      quantity: 2,
      unitPrice: 1000,
      totalPrice: 2000,
      budgetId: 'b1',
      notes: 'note',
      stockItemId: 's1',
      serviceId: 'svc1',
      createdAt: now,
    } as any

    const domain = BudgetItemMapper.toDomain(prisma)

    expect(domain).toBeInstanceOf(BudgetItem)
    expect(domain.id).toBe('i1')
    expect(domain.type).toBe(BudgetItemType.SERVICE)
    expect(domain.description).toBe('desc')
    expect(domain.quantity).toBe(2)
    expect(domain.unitPrice.getValue()).toBe(1000)
    expect(domain.totalPrice.getValue()).toBe(1000 * 2)
    expect(domain.budgetId).toBe('b1')
    expect(domain.notes).toBe('note')
    expect(domain.stockItemId).toBe('s1')
    expect(domain.serviceId).toBe('svc1')
    expect(domain.createdAt).toEqual(now)
    expect(domain.updatedAt).toEqual(now)
  })

  it('toDomainMany returns empty array for non-array and filters nulls', () => {
    // @ts-expect-error testing invalid input
    expect(BudgetItemMapper.toDomainMany(null)).toEqual([])

    const prisma1: PrismaBudgetItem = {
      id: 'i2',
      type: BudgetItemType.SERVICE,
      description: 'd2',
      quantity: 1,
      unitPrice: 500,
      totalPrice: 500,
      budgetId: 'b2',
      createdAt: now,
    } as any

    const arr = [prisma1, null, undefined]
    const many = BudgetItemMapper.toDomainMany(arr as any)
    expect(many.length).toBe(1)
    expect(many[0].id).toBe('i2')
  })

  it('toPrismaCreate throws on null and maps domain to prisma create input', () => {
    // @ts-expect-error testing invalid input
    expect(() => BudgetItemMapper.toPrismaCreate(null)).toThrow(
      'BudgetItem domain entity cannot be null or undefined',
    )

    const domain = new BudgetItem(
      'x1',
      BudgetItemType.SERVICE,
      'desc',
      3,
      Price.create(200),
      'b3',
      'n',
      's2',
      'svc2',
      now,
      now,
    )

    const prismaCreate = BudgetItemMapper.toPrismaCreate(domain)
    expect(prismaCreate.type).toBe(domain.type)
    expect(prismaCreate.unitPrice).toBe(domain.unitPrice.getValue())
    expect(prismaCreate.totalPrice).toBe(domain.totalPrice.getValue())
    expect(prismaCreate.budgetId).toBe(domain.budgetId)
  })

  it('toPrismaUpdate throws on null and maps domain to prisma update input', () => {
    // @ts-expect-error testing invalid input
    expect(() => BudgetItemMapper.toPrismaUpdate(null)).toThrow(
      'BudgetItem domain entity cannot be null or undefined',
    )

    const domain = new BudgetItem(
      'x2',
      BudgetItemType.SERVICE,
      'desc2',
      5,
      Price.create(300),
      'b4',
      undefined,
      undefined,
      undefined,
      now,
      now,
    )

    const prismaUpdate = BudgetItemMapper.toPrismaUpdate(domain)
    expect(prismaUpdate.type).toBe(domain.type)
    expect(prismaUpdate.unitPrice).toBe(domain.unitPrice.getValue())
    expect(prismaUpdate.totalPrice).toBe(domain.totalPrice.getValue())
    expect(prismaUpdate.notes).toBe(domain.notes)
  })
})
