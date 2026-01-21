import { Module } from '@nestjs/common'

import { ClientApplicationModule } from '@application/clients/client.module'
import { EmployeeApplicationModule } from '@application/employees/employee.module'
import { ServiceExecutionPresenter } from '@application/service-executions/presenters'
import {
  AssignMechanicUseCase,
  CompleteServiceExecutionUseCase,
  CreateServiceExecutionUseCase,
  DeleteServiceExecutionUseCase,
  GetAllServiceExecutionsUseCase,
  GetServiceExecutionByIdUseCase,
  GetServiceExecutionsByMechanicUseCase,
  GetServiceExecutionsByServiceOrderUseCase,
  StartServiceExecutionUseCase,
  UpdateServiceExecutionUseCase,
  UpdateServiceExecutionNotesUseCase,
} from '@application/service-executions/use-cases'
import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * ServiceExecution module
 * Provides service execution functionality
 */
@Module({
  imports: [
    InfraModule,
    EmployeeApplicationModule,
    ClientApplicationModule,
    ServiceOrderApplicationModule,
    SharedModule,
  ],
  providers: [
    ServiceExecutionPresenter,
    AssignMechanicUseCase,
    CompleteServiceExecutionUseCase,
    CreateServiceExecutionUseCase,
    DeleteServiceExecutionUseCase,
    GetAllServiceExecutionsUseCase,
    GetServiceExecutionByIdUseCase,
    GetServiceExecutionsByMechanicUseCase,
    GetServiceExecutionsByServiceOrderUseCase,
    StartServiceExecutionUseCase,
    UpdateServiceExecutionUseCase,
    UpdateServiceExecutionNotesUseCase,
  ],
  exports: [
    ServiceExecutionPresenter,
    AssignMechanicUseCase,
    CompleteServiceExecutionUseCase,
    CreateServiceExecutionUseCase,
    DeleteServiceExecutionUseCase,
    GetAllServiceExecutionsUseCase,
    GetServiceExecutionByIdUseCase,
    GetServiceExecutionsByMechanicUseCase,
    GetServiceExecutionsByServiceOrderUseCase,
    StartServiceExecutionUseCase,
    UpdateServiceExecutionUseCase,
    UpdateServiceExecutionNotesUseCase,
  ],
})
export class ServiceExecutionApplicationModule {}
