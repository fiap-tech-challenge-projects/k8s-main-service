import { Module, forwardRef } from '@nestjs/common'

import { BudgetApplicationModule } from '@application/budget/budget.module'
import {
  CreateBudgetItemUseCase,
  GetBudgetItemByIdUseCase,
  GetAllBudgetItemsUseCase,
  UpdateBudgetItemUseCase,
  DeleteBudgetItemUseCase,
  GetBudgetItemsByBudgetIdUseCase,
  GetBudgetItemsByBudgetIdPaginatedUseCase,
} from '@application/budget-items/use-cases'
import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * Module for managing budget items.
 * This module imports the InfraModule and BudgetApplicationModule and provides the BudgetItemService.
 */
@Module({
  imports: [
    InfraModule,
    BudgetApplicationModule,
    forwardRef(() => ServiceOrderApplicationModule),
    SharedModule,
  ],
  providers: [
    CreateBudgetItemUseCase,
    GetBudgetItemByIdUseCase,
    GetAllBudgetItemsUseCase,
    UpdateBudgetItemUseCase,
    DeleteBudgetItemUseCase,
    GetBudgetItemsByBudgetIdUseCase,
    GetBudgetItemsByBudgetIdPaginatedUseCase,
  ],
  exports: [
    CreateBudgetItemUseCase,
    GetBudgetItemByIdUseCase,
    GetAllBudgetItemsUseCase,
    UpdateBudgetItemUseCase,
    DeleteBudgetItemUseCase,
    GetBudgetItemsByBudgetIdUseCase,
    GetBudgetItemsByBudgetIdPaginatedUseCase,
  ],
})
export class BudgetItemApplicationModule {}
