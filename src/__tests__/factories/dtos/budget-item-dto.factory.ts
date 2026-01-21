import { BudgetItemType } from '@prisma/client'
import { plainToClass } from 'class-transformer'

import {
  CreateBudgetItemDto,
  UpdateBudgetItemDto,
  BudgetItemResponseDto,
  PaginatedBudgetItemsResponseDto,
} from '@application/budget-items/dto'

/**
 * Factory for creating Budget Item DTOs for testing
 */
export class BudgetItemDtoFactory {
  /**
   * Create a valid CreateBudgetItemDto
   * @param overrides - Optional properties to override defaults
   * @returns CreateBudgetItemDto
   */
  public static createCreateBudgetItemDto(
    overrides: Partial<CreateBudgetItemDto> = {},
  ): CreateBudgetItemDto {
    const defaults: CreateBudgetItemDto = {
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 1,
      unitPrice: 'R$100,00',
      budgetId: `budget-test-${Date.now()}`,
      notes: 'Óleo sintético',
      stockItemId: undefined,
      serviceId: 'service-123456',
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(CreateBudgetItemDto, data)
  }

  /**
   * Create a minimal CreateBudgetItemDto with only required fields
   * @param overrides - Optional properties to override defaults
   * @returns CreateBudgetItemDto
   */
  public static createMinimalCreateBudgetItemDto(
    overrides: Partial<CreateBudgetItemDto> = {},
  ): CreateBudgetItemDto {
    const defaults: CreateBudgetItemDto = {
      type: BudgetItemType.SERVICE,
      description: 'Alinhamento',
      quantity: 1,
      unitPrice: 'R$80,00',
      budgetId: `budget-test-${Date.now()}`,
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(CreateBudgetItemDto, data)
  }

  /**
   * Create a valid UpdateBudgetItemDto
   * @param overrides - Optional properties to override defaults
   * @returns UpdateBudgetItemDto
   */
  public static createUpdateBudgetItemDto(
    overrides: Partial<UpdateBudgetItemDto> = {},
  ): UpdateBudgetItemDto {
    const defaults: UpdateBudgetItemDto = {
      type: BudgetItemType.STOCK_ITEM,
      description: 'Filtro de óleo',
      quantity: 2,
      unitPrice: 'R$30,00',
      notes: 'Trocar junto com o óleo',
      stockItemId: 'stock-item-123456',
      serviceId: undefined,
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateBudgetItemDto, data)
  }

  /**
   * Create a partial UpdateBudgetItemDto with only some fields
   * @param overrides - Optional properties to override defaults
   * @returns UpdateBudgetItemDto
   */
  public static createPartialUpdateBudgetItemDto(
    overrides: Partial<UpdateBudgetItemDto> = {},
  ): UpdateBudgetItemDto {
    const defaults: UpdateBudgetItemDto = {
      description: 'Atualização parcial',
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateBudgetItemDto, data)
  }

  /**
   * Create a valid BudgetItemResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns BudgetItemResponseDto
   */
  public static createBudgetItemResponseDto(
    overrides: Partial<BudgetItemResponseDto> = {},
  ): BudgetItemResponseDto {
    const defaults: BudgetItemResponseDto = {
      id: `budget-item-test-${Date.now()}`,
      type: BudgetItemType.SERVICE,
      description: 'Troca de óleo',
      quantity: 1,
      unitPrice: 'R$100,00',
      totalPrice: 'R$100,00',
      budgetId: `budget-test-${Date.now()}`,
      notes: 'Óleo sintético',
      stockItemId: undefined,
      serviceId: 'service-123456',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    return { ...defaults, ...overrides }
  }

  /**
   * Create a minimal BudgetItemResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns BudgetItemResponseDto
   */
  public static createMinimalBudgetItemResponseDto(
    overrides: Partial<BudgetItemResponseDto> = {},
  ): BudgetItemResponseDto {
    const defaults: BudgetItemResponseDto = {
      id: `budget-item-test-${Date.now()}`,
      type: BudgetItemType.SERVICE,
      description: 'Alinhamento',
      quantity: 1,
      unitPrice: 'R$80,00',
      totalPrice: 'R$80,00',
      budgetId: `budget-test-${Date.now()}`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedBudgetItemsResponseDto
   * @param overrides - Optional properties to override defaults
   * @returns PaginatedBudgetItemsResponseDto
   */
  public static createPaginatedBudgetItemsResponseDto(
    overrides: Partial<{
      data: BudgetItemResponseDto[]
      meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }> = {},
  ): PaginatedBudgetItemsResponseDto {
    const itemsData = overrides.data ?? [
      this.createBudgetItemResponseDto({ id: 'item-1', description: 'Troca de óleo' }),
      this.createBudgetItemResponseDto({ id: 'item-2', description: 'Alinhamento' }),
      this.createBudgetItemResponseDto({ id: 'item-3', description: 'Balanceamento' }),
    ]
    const defaults = {
      data: itemsData,
      meta: {
        total: itemsData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(itemsData.length / 10),
        hasNext: false,
        hasPrev: false,
      },
    }
    return {
      data: overrides.data ?? defaults.data,
      meta: overrides.meta ? { ...defaults.meta, ...overrides.meta } : defaults.meta,
    }
  }

  /**
   * Create an empty PaginatedBudgetItemsResponseDto
   * @returns PaginatedBudgetItemsResponseDto
   */
  public static createEmptyPaginatedBudgetItemsResponseDto(): PaginatedBudgetItemsResponseDto {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }

  /**
   * Create multiple CreateBudgetItemDto instances
   * @param count - Number of DTOs to create
   * @param baseOverrides - Base overrides to apply to all DTOs
   * @returns Array of CreateBudgetItemDto
   */
  public static createManyCreateBudgetItemDto(
    count: number,
    baseOverrides: Partial<CreateBudgetItemDto> = {},
  ): CreateBudgetItemDto[] {
    const types = [BudgetItemType.SERVICE, BudgetItemType.STOCK_ITEM]
    const descriptions = ['Troca de óleo', 'Alinhamento', 'Balanceamento', 'Filtro de óleo']
    return Array.from({ length: count }, (_, index) => {
      return this.createCreateBudgetItemDto({
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
