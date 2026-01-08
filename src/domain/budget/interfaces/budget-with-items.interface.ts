import { Budget } from '@domain/budget/entities'
import { BudgetItem } from '@domain/budget-items/entities'

/**
 * Interface representing a budget with its associated budget items
 */
export interface BudgetWithItems {
  budget: Budget
  budgetItems: BudgetItem[]
}
