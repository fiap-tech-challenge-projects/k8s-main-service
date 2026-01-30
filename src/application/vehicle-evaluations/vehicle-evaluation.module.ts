import { Module } from '@nestjs/common'

import { ServiceOrderApplicationModule } from '@application/service-orders/service-order.module'
import {
  CreateVehicleEvaluationUseCase,
  DeleteVehicleEvaluationUseCase,
  GetAllVehicleEvaluationsUseCase,
  GetVehicleEvaluationByIdUseCase,
  GetVehicleEvaluationByServiceOrderIdUseCase,
  GetVehicleEvaluationsByVehicleIdUseCase,
  UpdateVehicleEvaluationUseCase,
  UpdateVehicleEvaluationDetailsUseCase,
  UpdateVehicleEvaluationMechanicNotesUseCase,
} from '@application/vehicle-evaluations/use-cases'
import { VehicleApplicationModule } from '@application/vehicles/vehicle.module'
import { InfraModule } from '@infra/infra.module'
import { SharedModule } from '@shared/shared.module'

/**
 * VehicleEvaluation module
 * Provides vehicle evaluation functionality
 */
@Module({
  imports: [InfraModule, VehicleApplicationModule, ServiceOrderApplicationModule, SharedModule],
  providers: [
    CreateVehicleEvaluationUseCase,
    DeleteVehicleEvaluationUseCase,
    GetAllVehicleEvaluationsUseCase,
    GetVehicleEvaluationByIdUseCase,
    GetVehicleEvaluationByServiceOrderIdUseCase,
    GetVehicleEvaluationsByVehicleIdUseCase,
    UpdateVehicleEvaluationUseCase,
    UpdateVehicleEvaluationDetailsUseCase,
    UpdateVehicleEvaluationMechanicNotesUseCase,
  ],
  exports: [
    CreateVehicleEvaluationUseCase,
    DeleteVehicleEvaluationUseCase,
    GetAllVehicleEvaluationsUseCase,
    GetVehicleEvaluationByIdUseCase,
    GetVehicleEvaluationByServiceOrderIdUseCase,
    GetVehicleEvaluationsByVehicleIdUseCase,
    UpdateVehicleEvaluationUseCase,
    UpdateVehicleEvaluationDetailsUseCase,
    UpdateVehicleEvaluationMechanicNotesUseCase,
  ],
})
export class VehicleEvaluationApplicationModule {}
