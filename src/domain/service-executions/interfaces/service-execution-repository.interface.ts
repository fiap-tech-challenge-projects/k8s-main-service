import { IBaseRepository, PaginatedResult } from '@shared/bases'

import { ServiceExecution } from '../entities'

export const SERVICE_EXECUTION_REPOSITORY = Symbol('SERVICE_EXECUTION_REPOSITORY')

/**
 * Repository interface for ServiceExecution entity
 */
export interface ServiceExecutionRepositoryInterface extends IBaseRepository<ServiceExecution> {
  findByServiceOrderId(serviceOrderId: string): Promise<ServiceExecution | null>
  findByServiceOrderIdPaginated(
    serviceOrderId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ServiceExecution>>
  findByMechanicId(mechanicId: string): Promise<ServiceExecution[]>
  findInProgressByMechanicId(mechanicId: string): Promise<ServiceExecution[]>
}
