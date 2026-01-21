import { Module } from '@nestjs/common'

import { ClientPresenter } from '@application/clients/presenters'
import {
  CreateClientUseCase,
  GetClientByIdUseCase,
  GetClientByCpfCnpjUseCase,
  GetClientByEmailUseCase,
  GetAllClientsUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
  SearchClientsByNameUseCase,
  CheckCpfCnpjAvailabilityUseCase,
  CheckEmailAvailabilityUseCase,
} from '@application/clients/use-cases'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * Client module
 * Provides client-related functionality
 */
@Module({
  imports: [InfraModule, SharedModule],
  providers: [
    ClientPresenter,
    CreateClientUseCase,
    GetClientByIdUseCase,
    GetClientByCpfCnpjUseCase,
    GetClientByEmailUseCase,
    GetAllClientsUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    SearchClientsByNameUseCase,
    CheckCpfCnpjAvailabilityUseCase,
    CheckEmailAvailabilityUseCase,
  ],
  exports: [
    ClientPresenter,
    CreateClientUseCase,
    GetClientByIdUseCase,
    GetClientByCpfCnpjUseCase,
    GetClientByEmailUseCase,
    GetAllClientsUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    SearchClientsByNameUseCase,
    CheckCpfCnpjAvailabilityUseCase,
    CheckEmailAvailabilityUseCase,
  ],
})
export class ClientApplicationModule {}
