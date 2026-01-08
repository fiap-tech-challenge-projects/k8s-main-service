import { EntityNotFoundException } from '@shared/exceptions'

/**
 * Exception thrown when a VehicleEvaluation is not found
 */
export class VehicleEvaluationNotFoundException extends EntityNotFoundException {
  /**
   * Creates a new VehicleEvaluationNotFoundException
   * @param id - The vehicle evaluation ID that was not found
   */
  constructor(id: string) {
    super('VehicleEvaluation', id)
    this.name = 'VehicleEvaluationNotFoundException'
  }
}
