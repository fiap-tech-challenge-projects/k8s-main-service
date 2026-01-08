import { EntityNotFoundException } from '@shared'

/**
 * Exception thrown when a client is not found
 */
export class ClientNotFoundException extends EntityNotFoundException {
  /**
   * Constructor for client not found exception
   * @param clientId - ID of the client that was not found
   */
  constructor(clientId: string) {
    super('Client', clientId)
    this.name = 'ClientNotFoundException'
  }
}
