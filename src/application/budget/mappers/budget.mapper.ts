import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetResponseDto,
  BudgetWithItemsResponseDto,
} from '@application/budget/dto'
import { BudgetItemMapper } from '@application/budget-items/mappers'
import { Budget } from '@domain/budget/entities'
import { BudgetItem } from '@domain/budget-items/entities'
import { validateBaseMapper } from '@shared'

/**
 * Mapper for converting between Budget entities and DTOs
 */
export class BudgetMapper {
  /**
   * Convert Budget entity to BudgetResponseDto
   * @param budget - Budget entity to convert
   * @returns BudgetResponseDto
   */
  static toResponseDto(budget: Budget): BudgetResponseDto {
    return {
      id: budget.id,
      status: budget.status,
      totalAmount: budget.getFormattedTotalAmount(),
      validityPeriod: budget.validityPeriod,
      generationDate: budget.generationDate,
      sentDate: budget.sentDate,
      approvalDate: budget.approvalDate,
      rejectionDate: budget.rejectionDate,
      deliveryMethod: budget.deliveryMethod,
      notes: budget.notes,
      serviceOrderId: budget.serviceOrderId,
      clientId: budget.clientId,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    }
  }

  /**
   * Convert Budget entity with items to BudgetWithItemsResponseDto
   * @param budget - Budget entity to convert
   * @param budgetItems - Array of budget items to include
   * @returns BudgetWithItemsResponseDto
   */
  static toResponseDtoWithItems(
    budget: Budget,
    budgetItems: BudgetItem[],
  ): BudgetWithItemsResponseDto {
    return {
      ...this.toResponseDto(budget),
      budgetItems: BudgetItemMapper.toResponseDtoArray(budgetItems),
    }
  }

  /**
   * Convert array of Budget entities to BudgetResponseDto array
   * @param budgets - Array of Budget entities to convert
   * @returns Array of BudgetResponseDto
   */
  static toResponseDtoArray(budgets: Budget[]): BudgetResponseDto[] {
    return budgets.map((budget) => this.toResponseDto(budget))
  }

  /**
   * Convert CreateBudgetDto to Budget entity
   * @param createBudgetDto - DTO for creating a budget
   * @returns Budget entity
   */
  static fromCreateDto(createBudgetDto: CreateBudgetDto): Budget {
    return Budget.create(
      createBudgetDto.serviceOrderId,
      createBudgetDto.clientId,
      createBudgetDto.validityPeriod ?? 7,
      createBudgetDto.deliveryMethod,
      createBudgetDto.notes,
      undefined, // status (default: GENERATED)
      createBudgetDto.totalAmount,
    )
  }

  /**
   * Convert UpdateBudgetDto to Budget entity (modifies existing entity)
   * @param updateBudgetDto - DTO for updating a budget
   * @param existingBudget - Existing budget entity to modify
   * @returns The same Budget entity with updated properties
   */
  static fromUpdateDto(updateBudgetDto: UpdateBudgetDto, existingBudget: Budget): Budget {
    if (updateBudgetDto.status !== undefined && updateBudgetDto.status !== existingBudget.status) {
      existingBudget.updateStatus(updateBudgetDto.status)
    }

    if (
      updateBudgetDto.totalAmount !== undefined &&
      updateBudgetDto.totalAmount !== existingBudget.getFormattedTotalAmount()
    ) {
      existingBudget.updateTotalAmount(updateBudgetDto.totalAmount)
    }

    if (
      updateBudgetDto.validityPeriod !== undefined &&
      updateBudgetDto.validityPeriod !== existingBudget.validityPeriod
    ) {
      existingBudget.updateValidityPeriod(updateBudgetDto.validityPeriod)
    }

    if (
      updateBudgetDto.sentDate !== undefined &&
      updateBudgetDto.sentDate !== existingBudget.sentDate
    ) {
      existingBudget.updateSentDate(updateBudgetDto.sentDate)
    }

    if (
      updateBudgetDto.approvalDate !== undefined &&
      updateBudgetDto.approvalDate !== existingBudget.approvalDate
    ) {
      existingBudget.updateApprovalDate(updateBudgetDto.approvalDate)
    }

    if (
      updateBudgetDto.rejectionDate !== undefined &&
      updateBudgetDto.rejectionDate !== existingBudget.rejectionDate
    ) {
      existingBudget.updateRejectionDate(updateBudgetDto.rejectionDate)
    }

    if (
      updateBudgetDto.deliveryMethod !== undefined &&
      updateBudgetDto.deliveryMethod !== existingBudget.deliveryMethod
    ) {
      existingBudget.updateDeliveryMethod(updateBudgetDto.deliveryMethod)
    }

    if (updateBudgetDto.notes !== undefined && updateBudgetDto.notes !== existingBudget.notes) {
      existingBudget.updateNotes(updateBudgetDto.notes)
    }

    return existingBudget
  }
}

// Validate that this mapper implements the BaseMapper contract
validateBaseMapper(BudgetMapper, 'BudgetMapper')
