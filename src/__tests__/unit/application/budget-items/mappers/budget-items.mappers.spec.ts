import { BudgetItemType } from '@prisma/client'

import { CreateBudgetItemDto, UpdateBudgetItemDto } from '@application/budget-items/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'

import { BudgetItemFactory } from '../../../../factories/entities'

describe('BudgetItemMapper', () => {
  const baseEntity = BudgetItemFactory.create({
    type: BudgetItemType.SERVICE,
    description: 'Troca de óleo',
    quantity: 2,
    unitPrice: '100',
    budgetId: 'budget-1',
    serviceId: 'service-1',
  })

  it('should map entity to response dto', () => {
    const dto = BudgetItemMapper.toResponseDto(baseEntity)
    expect(dto).toMatchObject({
      id: baseEntity.id,
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: baseEntity.getFormattedUnitPrice(),
      totalPrice: baseEntity.getFormattedTotalPrice(),
      budgetId: 'budget-1',
      serviceId: 'service-1',
      notes: 'Óleo sintético',
      stockItemId: undefined,
      createdAt: baseEntity.createdAt,
      updatedAt: baseEntity.updatedAt,
    })
  })

  it('should map array of entities to response dto array', () => {
    const dtos = BudgetItemMapper.toResponseDtoArray([baseEntity])
    expect(dtos).toHaveLength(1)
    expect(dtos[0].id).toBe(baseEntity.id)
  })

  it('should map create dto to entity', () => {
    const dto: CreateBudgetItemDto = {
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: '100',
      budgetId: 'budget-1',
      serviceId: 'service-1',
    }
    const mapped = BudgetItemMapper.fromCreateDto(dto)
    expect(mapped.type).toBe(BudgetItemType.SERVICE)
    expect(mapped.description).toBe('Troca de óleo')
    expect(mapped.quantity).toBe(2)
    expect(mapped.unitPrice.getValue()).toBe(100)
    expect(mapped.budgetId).toBe('budget-1')
    expect(mapped.serviceId).toBe('service-1')
  })

  it('should map update dto to entity', () => {
    const existing = BudgetItemFactory.create({
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: '100',
      budgetId: 'budget-1',
      serviceId: 'service-1',
    })
    const dto: UpdateBudgetItemDto = {
      description: 'Troca de filtro',
      quantity: 3,
      unitPrice: '120',
    }
    const mapped = BudgetItemMapper.fromUpdateDto(dto, existing)
    expect(mapped.description).toBe('Troca de filtro')
    expect(mapped.quantity).toBe(3)
    expect(mapped.unitPrice.getValue()).toBe(120)
    expect(mapped.budgetId).toBe('budget-1')
    expect(mapped.serviceId).toBe('service-1')
  })

  it('should handle undefined optional fields in create dto', () => {
    const dto: CreateBudgetItemDto = {
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: '100',
      budgetId: 'budget-1',
    }
    const mapped = BudgetItemMapper.fromCreateDto(dto)
    expect(mapped.serviceId).toBeUndefined()
    expect(mapped.stockItemId).toBeUndefined()
    expect(mapped.notes).toBeUndefined()
  })

  it('should keep existing values if update dto fields are undefined', () => {
    const existing = BudgetItemFactory.create({
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 2,
      unitPrice: '100',
      budgetId: 'budget-1',
      notes: 'Alguma observação',
      stockItemId: 'stock-1',
      serviceId: 'service-1',
    })
    const dto: UpdateBudgetItemDto = {}
    const mapped = BudgetItemMapper.fromUpdateDto(dto, existing)
    expect(mapped.type).toBe(existing.type)
    expect(mapped.description).toBe(existing.description)
    expect(mapped.quantity).toBe(existing.quantity)
    expect(mapped.unitPrice.getValue()).toBe(existing.unitPrice.getValue())
    expect(mapped.notes).toBe(existing.notes)
    expect(mapped.stockItemId).toBe(existing.stockItemId)
    expect(mapped.serviceId).toBe(existing.serviceId)
  })
})
