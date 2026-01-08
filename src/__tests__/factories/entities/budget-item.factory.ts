import { BudgetItemType } from '@prisma/client'

import { BudgetItem } from '@domain/budget-items/entities'
import { Price } from '@shared/value-objects'

/**
 * Factory for creating BudgetItem entities for testing
 */
export class BudgetItemFactory {
  /**
   * Create a valid BudgetItem entity with default values
   * @param overrides - Optional properties to override defaults
   * @returns BudgetItem entity
   */
  public static create(
    overrides: Partial<{
      id: string
      type: BudgetItemType
      description: string
      quantity: number
      unitPrice: string | number
      budgetId: string
      notes?: string
      stockItemId?: string
      serviceId?: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): BudgetItem {
    const defaults = {
      id: overrides.id ?? `budget_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 1,
      unitPrice: 'R$100,00',
      budgetId: `budget-test-${Date.now()}`,
      notes: 'Óleo sintético',
      stockItemId: undefined,
      serviceId: 'service-123456',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    const data = { ...defaults, ...overrides }
    return new BudgetItem(
      data.id,
      data.type,
      data.description,
      data.quantity,
      typeof data.unitPrice === 'string'
        ? Price.create(data.unitPrice)
        : Price.create(data.unitPrice),
      data.budgetId,
      data.notes,
      data.stockItemId,
      data.serviceId,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create a minimal BudgetItem entity with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns BudgetItem entity
   */
  public static createMinimal(
    overrides: Partial<{
      id: string
      type: BudgetItemType
      description: string
      quantity: number
      unitPrice: string | number
      budgetId: string
      createdAt: Date
      updatedAt: Date
    }> = {},
  ): BudgetItem {
    const defaults = {
      id: `budget-item-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: BudgetItemType.SERVICE,
      description: 'Alinhamento',
      quantity: 1,
      unitPrice: 'R$80,00',
      budgetId: `budget-test-${Date.now()}`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    const data = { ...defaults, ...overrides }
    return new BudgetItem(
      data.id,
      data.type,
      data.description,
      data.quantity,
      typeof data.unitPrice === 'string'
        ? Price.create(data.unitPrice)
        : Price.create(data.unitPrice),
      data.budgetId,
      undefined,
      undefined,
      undefined,
      data.createdAt,
      data.updatedAt,
    )
  }

  /**
   * Create an array of BudgetItem entities
   * @param count - Number of items to create
   * @param baseOverrides - Base overrides to apply to all items
   * @returns Array of BudgetItem entities
   */
  public static createMany(
    count: number,
    baseOverrides: Partial<{
      type: BudgetItemType
      description: string
      quantity: number
      unitPrice: string | number
      budgetId: string
    }> = {},
  ): BudgetItem[] {
    const types = [BudgetItemType.SERVICE, BudgetItemType.STOCK_ITEM]
    const descriptions = ['Troca de óleo', 'Alinhamento', 'Balanceamento', 'Filtro de óleo']
    return Array.from({ length: count }, (_, index) => {
      return this.create({
        ...baseOverrides,
        type: baseOverrides.type ?? types[index % types.length],
        description: baseOverrides.description ?? descriptions[index % descriptions.length],
        quantity: baseOverrides.quantity ?? 1 + (index % 3),
        unitPrice: baseOverrides.unitPrice ?? `R$${100 + index * 10},00`,
        budgetId: baseOverrides.budgetId ?? `budget-test-${index}`,
      })
    })
  }
}
