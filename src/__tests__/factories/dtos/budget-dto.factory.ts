import { BudgetStatus, DeliveryMethod } from '@prisma/client'
import { plainToClass } from 'class-transformer'

import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetResponseDto,
  PaginatedBudgetsResponseDto,
  BudgetWithItemsResponseDto,
} from '@application/budget/dto'

/**
 * Factory for creating Budget DTOs for testing
 */
export class BudgetDtoFactory {
  /**
   * Create a valid CreateBudgetDto
   */
  public static createCreateBudgetDto(overrides: Partial<CreateBudgetDto> = {}): CreateBudgetDto {
    const defaults: CreateBudgetDto = {
      serviceOrderId: 'service-order-id',
      clientId: 'client-id',
      validityPeriod: 7,
      deliveryMethod: DeliveryMethod.EMAIL,
      notes: 'Test budget',
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(CreateBudgetDto, data)
  }

  /**
   * Create a valid UpdateBudgetDto
   */
  public static createUpdateBudgetDto(overrides: Partial<UpdateBudgetDto> = {}): UpdateBudgetDto {
    const defaults: UpdateBudgetDto = {
      validityPeriod: 10,
      deliveryMethod: DeliveryMethod.WHATSAPP,
      notes: 'Updated notes',
    }
    const data = { ...defaults, ...overrides }
    return plainToClass(UpdateBudgetDto, data)
  }

  /**
   * Create a valid BudgetResponseDto
   */
  public static createBudgetResponseDto(
    overrides: Partial<BudgetResponseDto> = {},
  ): BudgetResponseDto {
    const now = new Date('2024-01-01T00:00:00.000Z')
    const defaults: BudgetResponseDto = {
      id: `budget-test-${Date.now()}`,
      status: BudgetStatus.GENERATED,
      totalAmount: '1000',
      validityPeriod: 7,
      generationDate: now,
      sentDate: undefined,
      approvalDate: undefined,
      rejectionDate: undefined,
      deliveryMethod: DeliveryMethod.EMAIL,
      notes: 'Test budget',
      serviceOrderId: 'service-order-id',
      clientId: 'client-id',
      createdAt: now,
      updatedAt: now,
    }
    return { ...defaults, ...overrides }
  }

  /**
   * Create a BudgetWithItemsResponseDto
   */
  public static createBudgetWithItemsResponseDto(
    overrides: Partial<BudgetWithItemsResponseDto> = {},
  ): BudgetWithItemsResponseDto {
    const defaults: BudgetWithItemsResponseDto = {
      ...this.createBudgetResponseDto(),
      budgetItems: [],
    }
    return { ...defaults, ...overrides }
  }

  /**
   * Create a PaginatedBudgetsResponseDto
   */
  public static createPaginatedBudgetsResponseDto(
    overrides: Partial<PaginatedBudgetsResponseDto> = {},
  ): PaginatedBudgetsResponseDto {
    const budgetsData = overrides.data ?? [
      this.createBudgetResponseDto({ id: 'budget-1' }),
      this.createBudgetResponseDto({ id: 'budget-2' }),
    ]
    const defaults = {
      data: budgetsData,
      meta: {
        total: budgetsData.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(budgetsData.length / 10),
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
   * Create an empty PaginatedBudgetsResponseDto
   */
  public static createEmptyPaginatedBudgetsResponseDto(): PaginatedBudgetsResponseDto {
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
}
