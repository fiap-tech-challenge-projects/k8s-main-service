import { Module } from '@nestjs/common'

import { ClientApplicationModule } from '@application/clients'
import {
  CheckLicensePlateAvailabilityUseCase,
  CheckVinAvailabilityUseCase,
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleByIdUseCase,
  GetVehicleByLicensePlateUseCase,
  GetVehicleByVinUseCase,
  GetVehiclesByClientUseCase,
  SearchVehiclesByMakeModelUseCase,
  UpdateVehicleUseCase,
} from '@application/vehicles/use-cases'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * Vehicle application module
 * Provides vehicle application services and use cases
 */
@Module({
  imports: [InfraModule, ClientApplicationModule, SharedModule],
  providers: [
    CheckLicensePlateAvailabilityUseCase,
    CheckVinAvailabilityUseCase,
    CreateVehicleUseCase,
    DeleteVehicleUseCase,
    GetAllVehiclesUseCase,
    GetVehicleByIdUseCase,
    GetVehicleByLicensePlateUseCase,
    GetVehicleByVinUseCase,
    GetVehiclesByClientUseCase,
    SearchVehiclesByMakeModelUseCase,
    UpdateVehicleUseCase,
  ],
  exports: [
    CheckLicensePlateAvailabilityUseCase,
    CheckVinAvailabilityUseCase,
    CreateVehicleUseCase,
    DeleteVehicleUseCase,
    GetAllVehiclesUseCase,
    GetVehicleByIdUseCase,
    GetVehicleByLicensePlateUseCase,
    GetVehicleByVinUseCase,
    GetVehiclesByClientUseCase,
    SearchVehiclesByMakeModelUseCase,
    UpdateVehicleUseCase,
  ],
})
export class VehicleApplicationModule {}
