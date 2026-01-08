import { Module } from '@nestjs/common'

import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

import {
  CreateServiceUseCase,
  GetAllServicesUseCase,
  GetServiceByIdUseCase,
  SearchServicesByNameUseCase,
  UpdateServiceUseCase,
  DeleteServiceUseCase,
} from './use-cases'

/**
 * services module
 * Provides service list-related functionality
 */
@Module({
  imports: [InfraModule, SharedModule],
  providers: [
    CreateServiceUseCase,
    GetAllServicesUseCase,
    GetServiceByIdUseCase,
    SearchServicesByNameUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
  exports: [
    CreateServiceUseCase,
    GetAllServicesUseCase,
    GetServiceByIdUseCase,
    SearchServicesByNameUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
})
export class ServiceApplicationModule {}
