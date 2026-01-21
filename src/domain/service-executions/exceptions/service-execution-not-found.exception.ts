import { EntityNotFoundException } from '@shared/exceptions'

/**
 * Exception thrown when a ServiceExecution is not found
 */
export class ServiceExecutionNotFoundException extends EntityNotFoundException {
  /**
   * Creates a new ServiceExecutionNotFoundException
   * @param id - The service execution ID that was not found
   */
  constructor(id: string) {
    super('ServiceExecution', id)
    this.name = 'ServiceExecutionNotFoundException'
  }
}
