import {
  CreateVehicleEvaluationDto,
  UpdateVehicleEvaluationDto,
  VehicleEvaluationResponseDto,
  PaginatedVehicleEvaluationsResponseDto,
} from '@application/vehicle-evaluations/dto'

/**
 * Factory for creating VehicleEvaluation DTOs for testing
 */
export class VehicleEvaluationDtoFactory {
  /**
   * Creates a basic create vehicle evaluation DTO
   */
  static createCreateDto(
    overrides: Partial<CreateVehicleEvaluationDto> = {},
  ): CreateVehicleEvaluationDto {
    return {
      serviceOrderId: 'so-1234567890abcdef',
      vehicleId: 'v-1234567890abcdef',
      details: {
        engineCondition: 'Good',
        brakeCondition: 'Needs replacement',
        tireCondition: 'Good',
        mileage: 50000,
      },
      mechanicNotes: 'Brake pads at 20% remaining, recommend replacement',
      ...overrides,
    }
  }

  /**
   * Creates a basic update vehicle evaluation DTO
   */
  static createUpdateDto(
    overrides: Partial<UpdateVehicleEvaluationDto> = {},
  ): UpdateVehicleEvaluationDto {
    return {
      details: {
        engineCondition: 'Excellent',
        brakeCondition: 'Good',
        tireCondition: 'Good',
        mileage: 52000,
      },
      mechanicNotes: 'All systems in good condition',
      ...overrides,
    }
  }

  /**
   * Creates a basic vehicle evaluation response DTO
   */
  static createResponseDto(
    overrides: Partial<VehicleEvaluationResponseDto> = {},
  ): VehicleEvaluationResponseDto {
    return {
      id: 'eval-1234567890abcdef',
      serviceOrderId: 'so-1234567890abcdef',
      vehicleId: 'v-1234567890abcdef',
      details: {
        engineCondition: 'Good',
        brakeCondition: 'Needs replacement',
        tireCondition: 'Good',
        mileage: 50000,
      },
      evaluationDate: new Date('2024-01-01T10:00:00.000Z'),
      mechanicNotes: 'Brake pads at 20% remaining, recommend replacement',
      createdAt: new Date('2024-01-01T10:00:00.000Z'),
      updatedAt: new Date('2024-01-01T10:00:00.000Z'),
      ...overrides,
    }
  }

  /**
   * Creates multiple vehicle evaluation response DTOs
   */
  static createManyResponseDto(
    count: number,
    overrides: Partial<VehicleEvaluationResponseDto> = {},
  ): VehicleEvaluationResponseDto[] {
    return Array.from({ length: count }, (_, index) =>
      this.createResponseDto({
        id: `eval-${index + 1}`,
        serviceOrderId: `so-${index + 1}`,
        vehicleId: `v-${index + 1}`,
        ...overrides,
      }),
    )
  }

  /**
   * Creates a paginated vehicle evaluations response DTO
   */
  static createPaginatedResponseDto(
    data: VehicleEvaluationResponseDto[] = [this.createResponseDto()],
    overrides: Partial<PaginatedVehicleEvaluationsResponseDto> = {},
  ): PaginatedVehicleEvaluationsResponseDto {
    return {
      data,
      meta: {
        page: 1,
        limit: 10,
        total: data.length,
        totalPages: Math.ceil(data.length / 10),
        hasNext: false,
        hasPrev: false,
      },
      ...overrides,
    }
  }

  /**
   * Creates an empty paginated vehicle evaluations response DTO
   */
  static createEmptyPaginatedResponseDto(): PaginatedVehicleEvaluationsResponseDto {
    return this.createPaginatedResponseDto([], {
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    })
  }
}
