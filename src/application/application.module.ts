import { Module } from '@nestjs/common'

import { BudgetApplicationModule } from '@application/budget'
import { BudgetItemApplicationModule } from '@application/budget-items'
import { ClientApplicationModule } from '@application/clients'
import { EmployeeApplicationModule } from '@application/employees'
import { EventHandlersModule } from '@application/event-handlers/event-handlers.module'
import { ServiceExecutionApplicationModule } from '@application/service-executions'
import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import { ServiceApplicationModule } from '@application/services'
import { StockApplicationModule } from '@application/stock'
import { VehicleEvaluationApplicationModule } from '@application/vehicle-evaluations'
import { VehicleApplicationModule } from '@application/vehicles'

/**
 * Application module that aggregates all application layer modules.
 *
 * This module serves as the main entry point for the application layer,
 * organizing and exposing all application services and use cases.
 *
 * Note: Auth module has been moved to AWS Lambda for serverless authentication.
 * JWT validation is now handled by API Gateway + Lambda Authorizer.
 *
 * @example
 * @Module({
 *   imports: [ApplicationModule],
 *   controllers: [AppController]
 * })
 * export class AppModule {}
 */
@Module({
  imports: [
    ClientApplicationModule,
    EmployeeApplicationModule,
    VehicleApplicationModule,
    ServiceApplicationModule,
    ServiceExecutionApplicationModule,
    VehicleEvaluationApplicationModule,
    StockApplicationModule,
    BudgetApplicationModule,
    BudgetItemApplicationModule,
    ServiceOrderApplicationModule,
    EventHandlersModule,
  ],
  providers: [],
  exports: [
    ClientApplicationModule,
    EmployeeApplicationModule,
    VehicleApplicationModule,
    ServiceApplicationModule,
    ServiceExecutionApplicationModule,
    VehicleEvaluationApplicationModule,
    StockApplicationModule,
    BudgetApplicationModule,
    BudgetItemApplicationModule,
    ServiceOrderApplicationModule,
  ],
})
export class ApplicationModule {}
