import { Module } from '@nestjs/common'

import { BUDGET_REPOSITORY } from '@domain/budget/interfaces'
import { BUDGET_ITEM_REPOSITORY } from '@domain/budget-items'
import { CLIENT_REPOSITORY } from '@domain/clients/interfaces'
import { EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { SERVICE_EXECUTION_REPOSITORY } from '@domain/service-executions/interfaces'
import { SERVICE_ORDER_REPOSITORY } from '@domain/service-orders/interfaces'
import { SERVICE_REPOSITORY } from '@domain/services/interfaces'
import { STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { VEHICLE_EVALUATION_REPOSITORY } from '@domain/vehicle-evaluations/interfaces'
import { VEHICLE_REPOSITORY } from '@domain/vehicles/interfaces'
import { SharedModule } from '@shared/shared.module'

import { PrismaService } from './prisma.service'
import {
  PrismaClientRepository,
  PrismaVehicleRepository,
  PrismaEmployeeRepository,
  PrismaStockRepository,
  PrismaServiceRepository,
  PrismaBudgetRepository,
  PrismaBudgetItemRepository,
  PrismaServiceOrderRepository,
  PrismaServiceExecutionRepository,
  PrismaVehicleEvaluationRepository,
} from './repositories'

/**
 * Prisma module that provides database access services
 */
@Module({
  imports: [SharedModule],
  providers: [
    PrismaService,
    {
      provide: CLIENT_REPOSITORY,
      useClass: PrismaClientRepository,
    },
    {
      provide: VEHICLE_REPOSITORY,
      useClass: PrismaVehicleRepository,
    },
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: PrismaEmployeeRepository,
    },
    {
      provide: STOCK_REPOSITORY,
      useClass: PrismaStockRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
    {
      provide: BUDGET_REPOSITORY,
      useClass: PrismaBudgetRepository,
    },
    {
      provide: BUDGET_ITEM_REPOSITORY,
      useClass: PrismaBudgetItemRepository,
    },
    {
      provide: SERVICE_ORDER_REPOSITORY,
      useClass: PrismaServiceOrderRepository,
    },
    {
      provide: SERVICE_EXECUTION_REPOSITORY,
      useClass: PrismaServiceExecutionRepository,
    },
    {
      provide: VEHICLE_EVALUATION_REPOSITORY,
      useClass: PrismaVehicleEvaluationRepository,
    },
  ],
  exports: [
    PrismaService,
    CLIENT_REPOSITORY,
    VEHICLE_REPOSITORY,
    EMPLOYEE_REPOSITORY,
    STOCK_REPOSITORY,
    SERVICE_REPOSITORY,
    BUDGET_REPOSITORY,
    BUDGET_ITEM_REPOSITORY,
    SERVICE_ORDER_REPOSITORY,
    SERVICE_EXECUTION_REPOSITORY,
    VEHICLE_EVALUATION_REPOSITORY,
  ],
})
export class PrismaModule {}
