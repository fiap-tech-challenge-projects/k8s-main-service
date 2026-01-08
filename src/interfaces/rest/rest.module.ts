import { Module } from '@nestjs/common'

import { ApplicationModule } from '@application/application.module'
import { BudgetPresenter } from '@application/budget/presenters'
import { ClientPresenter } from '@application/clients/presenters'
import { EmployeePresenter } from '@application/employees/presenters'
import { ServiceExecutionPresenter } from '@application/service-executions/presenters'
import { ServiceOrderPresenter } from '@application/service-orders/presenters'
import { StockItemPresenter } from '@application/stock/presenters'
import { VehiclePresenter } from '@application/vehicles/presenters'
import { SharedModule } from '@shared/shared.module'

import {
  ClientController,
  MetricsController,
  WelcomeController,
  VehicleController,
  ServiceController,
  EmployeeController,
  StockController,
  ServiceOrderController,
  ServiceExecutionController,
  VehicleEvaluationController,
  BudgetController,
  BudgetItemController,
} from './controllers'
import { ClientPortalModule } from './controllers/client-portal'

/**
 * REST Interface Module
 * Provides REST API endpoints for all domains including clients, vehicles, and employees.
 *
 * Note: Auth endpoints have been moved to AWS Lambda for serverless authentication.
 * Authentication is handled by API Gateway + Lambda Authorizer.
 */
@Module({
  imports: [ApplicationModule, SharedModule, ClientPortalModule],
  controllers: [
    WelcomeController,
    ClientController,
    MetricsController,
    VehicleController,
    ServiceController,
    EmployeeController,
    BudgetController,
    StockController,
    ServiceOrderController,
    ServiceExecutionController,
    VehicleEvaluationController,
    BudgetItemController,
  ],
  providers: [
    BudgetPresenter,
    ClientPresenter,
    EmployeePresenter,
    ServiceExecutionPresenter,
    ServiceOrderPresenter,
    StockItemPresenter,
    VehiclePresenter,
  ],
  exports: [],
})
export class RestModule {}
