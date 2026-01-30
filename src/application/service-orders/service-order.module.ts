import { Module } from '@nestjs/common'

import { ClientApplicationModule } from '@application/clients'
import { EmployeeApplicationModule } from '@application/employees/employee.module'
import { ServiceOrderPresenter } from '@application/service-orders/presenters'
import { StockApplicationModule } from '@application/stock/stock.module'
import { VehicleApplicationModule } from '@application/vehicles'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

import {
  CreateServiceOrderUseCase,
  GetServiceOrderByIdUseCase,
  GetAllServiceOrdersUseCase,
  UpdateServiceOrderUseCase,
  UpdateServiceOrderStatusUseCase,
  GetServiceOrdersByStatusUseCase,
  GetServiceOrdersByClientIdUseCase,
  GetServiceOrdersByVehicleIdUseCase,
  GetOverdueServiceOrdersUseCase,
  DeleteServiceOrderUseCase,
} from './use-cases'

/**
 * Service Order application module
 * Provides service order application services and use cases
 */
@Module({
  imports: [
    InfraModule,
    ClientApplicationModule,
    EmployeeApplicationModule,
    VehicleApplicationModule,
    StockApplicationModule,
    SharedModule,
  ],
  providers: [
    ServiceOrderPresenter,
    CreateServiceOrderUseCase,
    GetServiceOrderByIdUseCase,
    GetAllServiceOrdersUseCase,
    UpdateServiceOrderUseCase,
    UpdateServiceOrderStatusUseCase,
    GetServiceOrdersByStatusUseCase,
    GetServiceOrdersByClientIdUseCase,
    GetServiceOrdersByVehicleIdUseCase,
    GetOverdueServiceOrdersUseCase,
    DeleteServiceOrderUseCase,
  ],
  exports: [
    ServiceOrderPresenter,
    CreateServiceOrderUseCase,
    GetServiceOrderByIdUseCase,
    GetAllServiceOrdersUseCase,
    UpdateServiceOrderUseCase,
    UpdateServiceOrderStatusUseCase,
    GetServiceOrdersByStatusUseCase,
    GetServiceOrdersByClientIdUseCase,
    GetServiceOrdersByVehicleIdUseCase,
    GetOverdueServiceOrdersUseCase,
    DeleteServiceOrderUseCase,
  ],
})
export class ServiceOrderApplicationModule {}
