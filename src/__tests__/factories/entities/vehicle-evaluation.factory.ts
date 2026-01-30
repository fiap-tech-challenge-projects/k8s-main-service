import { VehicleEvaluation } from '@domain/vehicle-evaluations/entities'

/**
 * Factory for creating VehicleEvaluation entities for testing
 */
export class VehicleEvaluationFactory {
  /**
   * Creates a basic vehicle evaluation entity
   */
  static create(overrides: Partial<VehicleEvaluation> = {}): VehicleEvaluation {
    const defaultVehicleEvaluation = new VehicleEvaluation(
      'eval-1234567890abcdef',
      'so-1234567890abcdef',
      'v-1234567890abcdef',
      {
        engineCondition: 'Good',
        brakeCondition: 'Needs replacement',
        tireCondition: 'Good',
        mileage: 50000,
      },
      new Date('2024-01-01T10:00:00.000Z'),
      'Brake pads at 20% remaining, recommend replacement',
      new Date('2024-01-01T10:00:00.000Z'),
      new Date('2024-01-01T10:00:00.000Z'),
    )

    return Object.assign(defaultVehicleEvaluation, overrides)
  }

  /**
   * Creates multiple vehicle evaluation entities
   */
  static createMany(
    count: number,
    overrides: Partial<VehicleEvaluation> = {},
  ): VehicleEvaluation[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `eval-${index + 1}`,
        serviceOrderId: `so-${index + 1}`,
        vehicleId: `v-${index + 1}`,
        ...overrides,
      }),
    )
  }

  /**
   * Creates a vehicle evaluation with specific details
   */
  static createWithDetails(details: Record<string, unknown>): VehicleEvaluation {
    return this.create({ details })
  }

  /**
   * Creates a vehicle evaluation with specific mechanic notes
   */
  static createWithNotes(mechanicNotes: string): VehicleEvaluation {
    return this.create({ mechanicNotes })
  }

  /**
   * Creates a vehicle evaluation for a specific service order
   */
  static createForServiceOrder(serviceOrderId: string): VehicleEvaluation {
    return this.create({ serviceOrderId })
  }

  /**
   * Creates a vehicle evaluation for a specific vehicle
   */
  static createForVehicle(vehicleId: string): VehicleEvaluation {
    return this.create({ vehicleId })
  }
}
