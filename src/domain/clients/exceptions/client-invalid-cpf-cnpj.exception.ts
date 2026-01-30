import { DomainException } from '@shared/exceptions'

/**
 * Exception thrown when a client has an invalid CPF/CNPJ
 */
export class ClientInvalidCpfCnpjException extends DomainException {
  /**
   * Creates a ClientInvalidCpfCnpjException
   * @param cpfCnpj - The invalid CPF/CNPJ
   */
  constructor(cpfCnpj: string) {
    super(
      `Invalid CPF/CNPJ format: ${cpfCnpj}. Please provide a valid Brazilian CPF (11 digits) or CNPJ (14 digits).`,
      'ClientInvalidCpfCnpjException',
    )
  }
}
