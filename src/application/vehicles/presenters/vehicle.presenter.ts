import { VehicleResponseDto, PaginatedVehiclesResponseDto } from '@application/vehicles/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Vehicle data
 */
export interface VehicleHttpResponse {
  id: string
  licensePlate: string
  make: string
  model: string
  year: number
  vin?: string
  color?: string
  clientId: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Vehicles
 */
export interface PaginatedVehiclesHttpResponse {
  data: VehicleHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Vehicle data formatting
 * Separates business data structure from HTTP response format
 */
export class VehiclePresenter extends BasePresenter<VehicleResponseDto, VehicleHttpResponse> {
  /**
   * Formats Vehicle business data for HTTP response
   * @param vehicle - Vehicle data from application layer
   * @returns Formatted Vehicle for HTTP transport
   */
  present(vehicle: VehicleResponseDto): VehicleHttpResponse {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      color: vehicle.color,
      clientId: vehicle.clientId,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    }
  }

  /**
   * Formats paginated Vehicles data for HTTP response
   * @param data - Paginated Vehicles from application layer
   * @returns Formatted paginated response for HTTP transport
   */
  presentPaginatedVehicles(data: PaginatedVehiclesResponseDto): PaginatedVehiclesHttpResponse {
    return this.presentPaginated(data)
  }
}
