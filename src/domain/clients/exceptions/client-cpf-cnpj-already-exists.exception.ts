import { AlreadyExistsException } from '@shared/exceptions'

/**
 * Exception thrown when a client CPF/CNPJ already exists
 */
export class ClientCpfCnpjAlreadyExistsException extends AlreadyExistsException {
  /**
   * Creates a ClientCpfCnpjAlreadyExistsException
   * @param cpfCnpj - The CPF/CNPJ that already exists
   */
  constructor(cpfCnpj: string) {
    super('client', 'cpfCnpj', cpfCnpj)
    this.name = 'ClientCpfCnpjAlreadyExistsException'
  }
}
