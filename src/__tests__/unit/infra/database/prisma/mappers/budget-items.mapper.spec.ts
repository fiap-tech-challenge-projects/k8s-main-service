import { BudgetItem as PrismaBudgetItem, BudgetItemType } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { BudgetItemMapper } from '@infra/database/prisma/mappers'
import { Price } from '@shared/value-objects'

describe('BudgetItemMapper (Prisma)', () => {
  const prismaBudgetItem: PrismaBudgetItem = {
    id: 'budget-item-1',
    type: BudgetItemType.SERVICE,
    description: 'Troca de óleo',
    quantity: 2,
    unitPrice: 100,
    totalPrice: 200,
    budgetId: 'budget-1',
    notes: 'Usar óleo sintético',
    stockItemId: null,
    serviceId: 'service-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  }

  it('should map PrismaBudgetItem to BudgetItem domain entity', () => {
    const entity = BudgetItemMapper.toDomain(prismaBudgetItem)
    expect(entity).toBeInstanceOf(BudgetItem)
    expect(entity.id).toBe(prismaBudgetItem.id)
    expect(entity.type).toBe(prismaBudgetItem.type)
    expect(entity.description).toBe(prismaBudgetItem.description)
    expect(entity.quantity).toBe(prismaBudgetItem.quantity)
    expect(entity.unitPrice.getValue()).toBe(prismaBudgetItem.unitPrice)
    expect(entity.totalPrice.getValue()).toBe(
      prismaBudgetItem.unitPrice * prismaBudgetItem.quantity,
    )
    expect(entity.budgetId).toBe(prismaBudgetItem.budgetId)
    expect(entity.notes).toBe(prismaBudgetItem.notes)
    expect(entity.stockItemId).toBeUndefined()
    expect(entity.serviceId).toBe(prismaBudgetItem.serviceId)
    expect(entity.createdAt).toEqual(prismaBudgetItem.createdAt)
  })

  it('should map array of PrismaBudgetItem to array of BudgetItem domain entities', () => {
    const arr = [prismaBudgetItem, { ...prismaBudgetItem, id: 'budget-item-2' }]
    const entities = BudgetItemMapper.toDomainMany(arr)
    expect(entities).toHaveLength(2)
    expect(entities[0].id).toBe('budget-item-1')
    expect(entities[1].id).toBe('budget-item-2')
  })

  it('should return empty array if toDomainMany receives non-array', () => {
    // @ts-expect-error Testing undefined input for toDomainMany
    expect(BudgetItemMapper.toDomainMany(undefined)).toEqual([])
    // @ts-expect-error Testing null input for toDomainMany
    expect(BudgetItemMapper.toDomainMany(null)).toEqual([])
  })

  it('should throw if toDomain receives null or undefined', () => {
    // @ts-expect-error Testing null input for toDomain
    expect(() => BudgetItemMapper.toDomain(null)).toThrow()
    // @ts-expect-error Testing undefined input for toDomain
    expect(() => BudgetItemMapper.toDomain(undefined)).toThrow()
  })

  it('should map BudgetItem domain entity to Prisma create input', () => {
    const entity = new BudgetItem(
      'budget-item-1',
      BudgetItemType.SERVICE,
      'Troca de óleo',
      2,
      Price.create(100),
      'budget-1',
      'Usar óleo sintético',
      undefined,
      'service-1',
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    )
    const prismaInput = BudgetItemMapper.toPrismaCreate(entity)
    expect(prismaInput).toMatchObject({
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: 100,
      totalPrice: 200,
      budgetId: 'budget-1',
      notes: 'Usar óleo sintético',
      stockItemId: undefined,
      serviceId: 'service-1',
    })
  })

  it('should throw if toPrismaCreate receives null or undefined', () => {
    // @ts-expect-error Testing null input for toPrismaCreate
    expect(() => BudgetItemMapper.toPrismaCreate(null)).toThrow()
    // @ts-expect-error Testing undefined input for toPrismaCreate
    expect(() => BudgetItemMapper.toPrismaCreate(undefined)).toThrow()
  })

  it('should map BudgetItem domain entity to Prisma update input', () => {
    const entity = new BudgetItem(
      'budget-item-1',
      BudgetItemType.SERVICE,
      'Troca de óleo',
      2,
      Price.create(100),
      'budget-1',
      'Usar óleo sintético',
      undefined,
      'service-1',
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    )
    const prismaInput = BudgetItemMapper.toPrismaUpdate(entity)
    expect(prismaInput).toMatchObject({
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: 100,
      totalPrice: 200,
      notes: 'Usar óleo sintético',
      stockItemId: undefined,
      serviceId: 'service-1',
    })
  })

  it('should throw if toPrismaUpdate receives null or undefined', () => {
    // @ts-expect-error Testing null input for toPrismaUpdate
    expect(() => BudgetItemMapper.toPrismaUpdate(null)).toThrow()
    // @ts-expect-error Testing undefined input for toPrismaUpdate
    expect(() => BudgetItemMapper.toPrismaUpdate(undefined)).toThrow()
  })

  it('should handle optional fields (notes, stockItemId, serviceId) as undefined', () => {
    const prismaBudgetItemNoOptionals: PrismaBudgetItem = {
      ...prismaBudgetItem,
      notes: null,
      stockItemId: null,
      serviceId: null,
    }
    const entity = BudgetItemMapper.toDomain(prismaBudgetItemNoOptionals)
    expect(entity.notes).toBeUndefined()
    expect(entity.stockItemId).toBeUndefined()
    expect(entity.serviceId).toBeUndefined()
  })
})
