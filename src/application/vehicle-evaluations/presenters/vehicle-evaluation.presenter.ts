import { Injectable } from '@nestjs/common'

import {
  PaginatedVehicleEvaluationsResponseDto,
  VehicleEvaluationResponseDto,
} from '@application/vehicle-evaluations/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for vehicle evaluation data
 * Adapts VehicleEvaluationResponseDto to standardized HTTP response format
 * with camelCase field names and proper date serialization
 */
export interface VehicleEvaluationHttpResponse {
  id: string
  details: Record<string, unknown>
  evaluationDate: string
  mechanicNotes?: string
  serviceOrderId: string
  vehicleId: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated vehicle evaluation data
 */
export type PaginatedVehicleEvaluationHttpResponse = Awaited<
  ReturnType<
    BasePresenter<VehicleEvaluationResponseDto, VehicleEvaluationHttpResponse>['presentPaginated']
  >
> & {
  data: VehicleEvaluationHttpResponse[]
}

/**
 * Presenter for vehicle evaluation HTTP responses
 * Transforms application layer DTOs into HTTP transport format
 * following the presenter pattern for consistent response formatting
 */
@Injectable()
export class VehicleEvaluationPresenter extends BasePresenter<
  VehicleEvaluationResponseDto,
  VehicleEvaluationHttpResponse
> {
  /**
   * Format single vehicle evaluation data for HTTP response
   * @param data - Vehicle evaluation response DTO from application layer
   * @returns Formatted vehicle evaluation data for HTTP transport
   */
  present(data: VehicleEvaluationResponseDto): VehicleEvaluationHttpResponse {
    return {
      id: data.id,
      details: data.details,
      evaluationDate: data.evaluationDate.toISOString(),
      mechanicNotes: data.mechanicNotes,
      serviceOrderId: data.serviceOrderId,
      vehicleId: data.vehicleId,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    }
  }

  /**
   * Format paginated vehicle evaluation data for HTTP response
   * @param data - Paginated vehicle evaluation response DTO from application layer
   * @returns Formatted paginated vehicle evaluation data for HTTP transport
   */
  presentPaginatedVehicleEvaluations(
    data: PaginatedVehicleEvaluationsResponseDto,
  ): PaginatedVehicleEvaluationHttpResponse {
    return super.presentPaginated(data)
  }
}
