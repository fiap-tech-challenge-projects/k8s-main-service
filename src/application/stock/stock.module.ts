import { Module } from '@nestjs/common'

import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

import {
  CreateStockItemUseCase,
  GetAllStockItemsUseCase,
  GetStockItemByIdUseCase,
  GetStockItemBySkuUseCase,
  GetStockItemsByNameUseCase,
  GetStockItemsBySupplierUseCase,
  UpdateStockItemUseCase,
  DeleteStockItemUseCase,
  CreateStockMovementUseCase,
  UpdateStockMovementUseCase,
  DecreaseStockUseCase,
  CheckSkuAvailabilityUseCase,
  CheckStockAvailabilityUseCase,
} from './use-cases'

/**
 * Stock module
 * Provides stock-related functionality
 */
@Module({
  imports: [InfraModule, SharedModule],
  providers: [
    CreateStockItemUseCase,
    GetAllStockItemsUseCase,
    GetStockItemByIdUseCase,
    GetStockItemBySkuUseCase,
    GetStockItemsByNameUseCase,
    GetStockItemsBySupplierUseCase,
    UpdateStockItemUseCase,
    DeleteStockItemUseCase,
    CreateStockMovementUseCase,
    UpdateStockMovementUseCase,
    DecreaseStockUseCase,
    CheckSkuAvailabilityUseCase,
    CheckStockAvailabilityUseCase,
  ],
  exports: [
    CreateStockItemUseCase,
    GetAllStockItemsUseCase,
    GetStockItemByIdUseCase,
    GetStockItemBySkuUseCase,
    GetStockItemsByNameUseCase,
    GetStockItemsBySupplierUseCase,
    UpdateStockItemUseCase,
    DeleteStockItemUseCase,
    CreateStockMovementUseCase,
    UpdateStockMovementUseCase,
    DecreaseStockUseCase,
    CheckSkuAvailabilityUseCase,
    CheckStockAvailabilityUseCase,
  ],
})
export class StockApplicationModule {}
