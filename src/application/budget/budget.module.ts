import { Module } from '@nestjs/common'

import { BudgetPresenter } from '@application/budget/presenters'
import {
  CreateBudgetUseCase,
  GetBudgetByIdUseCase,
  GetBudgetsByClientIdUseCase,
  ApproveBudgetUseCase,
  RejectBudgetUseCase,
  GetAllBudgetsUseCase,
  GetBudgetByClientNameUseCase,
  GetBudgetByIdWithItemsUseCase,
  SendBudgetUseCase,
  MarkBudgetAsReceivedUseCase,
  CheckBudgetExpirationUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
  GetBudgetByServiceOrderIdUseCase,
  GetBudgetItemsUseCase,
} from '@application/budget/use-cases'
import { ClientApplicationModule } from '@application/clients/client.module'
import { EventsModule } from '@application/events/events.module'
import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import { StockApplicationModule } from '@application/stock/stock.module'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * Budget application module
 * Provides budget application services and use cases
 */
@Module({
  imports: [
    InfraModule,
    ServiceOrderApplicationModule,
    StockApplicationModule,
    ClientApplicationModule,
    SharedModule,
    EventsModule,
  ],
  providers: [
    BudgetPresenter,
    CreateBudgetUseCase,
    GetBudgetByIdUseCase,
    GetBudgetsByClientIdUseCase,
    ApproveBudgetUseCase,
    RejectBudgetUseCase,
    GetAllBudgetsUseCase,
    GetBudgetByClientNameUseCase,
    GetBudgetByIdWithItemsUseCase,
    SendBudgetUseCase,
    MarkBudgetAsReceivedUseCase,
    CheckBudgetExpirationUseCase,
    UpdateBudgetUseCase,
    DeleteBudgetUseCase,
    GetBudgetByServiceOrderIdUseCase,
    GetBudgetItemsUseCase,
  ],
  exports: [
    BudgetPresenter,
    CreateBudgetUseCase,
    GetBudgetByIdUseCase,
    GetBudgetsByClientIdUseCase,
    ApproveBudgetUseCase,
    RejectBudgetUseCase,
    GetAllBudgetsUseCase,
    GetBudgetByClientNameUseCase,
    GetBudgetByIdWithItemsUseCase,
    SendBudgetUseCase,
    MarkBudgetAsReceivedUseCase,
    CheckBudgetExpirationUseCase,
    UpdateBudgetUseCase,
    DeleteBudgetUseCase,
    GetBudgetByServiceOrderIdUseCase,
    GetBudgetItemsUseCase,
  ],
})
export class BudgetApplicationModule {}
