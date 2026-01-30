import { ServiceResponseDto, PaginatedServicesResponseDto } from '@application/services/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Service data
 */
export interface ServiceHttpResponse {
  id: string
  name: string
  description: string
  price: string
  estimatedDuration: string
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Services
 */
export interface PaginatedServicesHttpResponse {
  data: ServiceHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Service data formatting
 * Handles transformation of business data to HTTP response format
 */
export class ServicePresenter extends BasePresenter<ServiceResponseDto, ServiceHttpResponse> {
  /**
   * Format Service data for HTTP response
   * @param service - Service response DTO from application layer
   * @returns Formatted Service data for HTTP transport
   */
  present(service: ServiceResponseDto): ServiceHttpResponse {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      estimatedDuration: service.estimatedDuration,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt?.toISOString() ?? service.createdAt.toISOString(),
    }
  }

  /**
   * Format paginated Service data for HTTP response
   * @param data - Paginated Service response DTO from application layer
   * @returns Formatted paginated Service data for HTTP transport
   */
  presentPaginatedServices(data: PaginatedServicesResponseDto): PaginatedServicesHttpResponse {
    return super.presentPaginated(data)
  }
}
