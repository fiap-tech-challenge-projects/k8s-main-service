import { IBaseRepository } from '@shared/bases'

import { VehicleEvaluation } from '../entities'

export const VEHICLE_EVALUATION_REPOSITORY = Symbol('VEHICLE_EVALUATION_REPOSITORY')

/**
 * Repository interface for VehicleEvaluation entity
 */
export interface VehicleEvaluationRepositoryInterface extends IBaseRepository<VehicleEvaluation> {
  findByServiceOrderId(serviceOrderId: string): Promise<VehicleEvaluation | null>
  findByVehicleId(vehicleId: string): Promise<VehicleEvaluation[]>
}
