import { AlreadyExistsException } from '@shared'

/**
 * Client already exists exception
 * Thrown when attempting to create a client with an email or CPF/CNPJ that already exists
 */
export class ClientAlreadyExistsException extends AlreadyExistsException {
  /**
   * Constructor for Client already exists exception
   * @param fieldName - The field that caused the conflict (email or cpfCnpj)
   * @param fieldValue - The value that already exists
   */
  constructor(fieldName: string, fieldValue: string) {
    super('Client', fieldName, fieldValue)
    this.name = 'ClientAlreadyExistsException'
  }
}
