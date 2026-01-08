import { AlreadyExistsException } from '@shared'

/**
 * Exception thrown when attempting to create a service with a name that already exists.
 *
 * This exception should be thrown during service creation when the provided name
 * is already in use by another service in the system.
 */
export class ServiceNameAlreadyExistsException extends AlreadyExistsException {
  /**
   * Creates a new instance of ServiceNameAlreadyExistsException
   * @param serviceName - The service name that already exists
   * @param details - Optional additional details about the error
   */
  constructor(serviceName: string, details?: string) {
    const baseMessage = `Service with name '${serviceName}' already exists`
    const message = details ? `${baseMessage}: ${details}` : baseMessage
    super('Service', serviceName, message)
    this.name = 'ServiceNameAlreadyExistsException'
  }
}
