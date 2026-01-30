import { Service } from '@domain/services/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY')

/**
 * Repository interface for Services domain operations
 * Extends base repository with service-specific query methods
 */
export interface IServiceRepository extends IBaseRepository<Service> {
  /**
   * Find service by name (partial match)
   * @param name - The name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   * */
  findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<Service>>
}
