import { Logger } from '@nestjs/common'

import {
  ClientEmailAlreadyExistsException,
  ClientCpfCnpjAlreadyExistsException,
  ClientInvalidEmailException,
  ClientInvalidCpfCnpjException,
} from '@domain/clients/exceptions'
import { CpfCnpj } from '@domain/clients/value-objects'
import { Email } from '@shared'

/**
 * Type for email validation function in updates
 */
export type EmailUpdateValidationFunction = (email: string, excludeId?: string) => Promise<boolean>

/**
 * Type for CPF/CNPJ validation function in updates
 */
export type CpfCnpjUpdateValidationFunction = (
  cpfCnpj: string,
  excludeId?: string,
) => Promise<boolean>

/**
 * Validator for client update business rules
 */
export class ClientUpdateValidator {
  private static readonly logger = new Logger(ClientUpdateValidator.name)
  /**
   * Validates if an email is available for update (excluding current client)
   * @param emailExists - Whether the email already exists for another client
   * @returns True if email is available, false if already exists
   */
  public static isEmailAvailable(emailExists: boolean): boolean {
    return !emailExists
  }

  /**
   * Validates if a CPF/CNPJ is available for update (excluding current client)
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists for another client
   * @returns True if CPF/CNPJ is available, false if already exists
   */
  public static isCpfCnpjAvailable(cpfCnpjExists: boolean): boolean {
    return !cpfCnpjExists
  }

  /**
   * Validates if a client can be updated
   * @param emailExists - Whether the email already exists for another client
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists for another client
   * @returns True if client can be updated, false otherwise
   */
  public static canUpdateClient(emailExists: boolean, cpfCnpjExists: boolean): boolean {
    return this.isEmailAvailable(emailExists) && this.isCpfCnpjAvailable(cpfCnpjExists)
  }

  /**
   * Validates client update data
   * @param email - The email to validate (optional)
   * @param cpfCnpj - The CPF/CNPJ to validate (optional)
   * @param checkEmailExists - Function to check if email exists for another client
   * @param checkCpfCnpjExists - Function to check if CPF/CNPJ exists for another client
   * @param clientId - The ID of the client being updated (to exclude from uniqueness checks)
   * @throws ClientEmailAlreadyExistsException if email already exists for another client
   * @throws ClientCpfCnpjAlreadyExistsException if CPF/CNPJ already exists for another client
   * @throws ClientInvalidEmailException if email format is invalid
   * @throws ClientInvalidCpfCnpjException if CPF/CNPJ format is invalid
   */
  public static async validateClientUpdate(
    email: string | undefined,
    cpfCnpj: string | undefined,
    checkEmailExists: EmailUpdateValidationFunction,
    checkCpfCnpjExists: CpfCnpjUpdateValidationFunction,
    clientId: string,
  ): Promise<void> {
    // Validate email format if provided
    if (email !== undefined) {
      try {
        Email.create(email)
      } catch (error) {
        this.logger.error('Invalid email format:', email, error)
        throw new ClientInvalidEmailException(email)
      }

      // Check if email already exists for another client
      const emailExists = await checkEmailExists(email, clientId)
      if (emailExists) {
        throw new ClientEmailAlreadyExistsException(email)
      }
    }

    // Validate CPF/CNPJ format if provided
    if (cpfCnpj !== undefined) {
      try {
        CpfCnpj.create(cpfCnpj)
      } catch (error) {
        this.logger.error('Invalid CPF/CNPJ format:', cpfCnpj, error)
        throw new ClientInvalidCpfCnpjException(cpfCnpj)
      }

      // Check if CPF/CNPJ already exists for another client
      const cpfCnpjExists = await checkCpfCnpjExists(cpfCnpj, clientId)
      if (cpfCnpjExists) {
        throw new ClientCpfCnpjAlreadyExistsException(cpfCnpj)
      }
    }
  }

  /**
   * Validates if a client can be updated with the given email and throws an error if not
   * @param emailExists - Whether the email already exists for another client
   * @param email - The email being validated
   * @throws ClientEmailAlreadyExistsException if email already exists for another client
   */
  public static validateEmailAvailability(emailExists: boolean, email: string): void {
    if (!this.isEmailAvailable(emailExists)) {
      throw new ClientEmailAlreadyExistsException(email)
    }
  }

  /**
   * Validates if a client can be updated with the given CPF/CNPJ and throws an error if not
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists for another client
   * @param cpfCnpj - The CPF/CNPJ being validated
   * @throws ClientCpfCnpjAlreadyExistsException if CPF/CNPJ already exists for another client
   */
  public static validateCpfCnpjAvailability(cpfCnpjExists: boolean, cpfCnpj: string): void {
    if (!this.isCpfCnpjAvailable(cpfCnpjExists)) {
      throw new ClientCpfCnpjAlreadyExistsException(cpfCnpj)
    }
  }
}
