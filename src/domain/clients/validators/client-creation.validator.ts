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
 * Type for email validation function
 */
export type EmailValidationFunction = (email: string) => Promise<boolean>

/**
 * Type for CPF/CNPJ validation function
 */
export type CpfCnpjValidationFunction = (cpfCnpj: string) => Promise<boolean>

/**
 * Validator for client creation business rules
 */
export class ClientCreationValidator {
  private static readonly logger = new Logger(ClientCreationValidator.name)
  /**
   * Validates if an email is available for registration
   * @param emailExists - Whether the email already exists
   * @returns True if email is available, false if already exists
   */
  public static isEmailAvailable(emailExists: boolean): boolean {
    return !emailExists
  }

  /**
   * Validates if a CPF/CNPJ is available for registration
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists
   * @returns True if CPF/CNPJ is available, false if already exists
   */
  public static isCpfCnpjAvailable(cpfCnpjExists: boolean): boolean {
    return !cpfCnpjExists
  }

  /**
   * Validates if a client can be created
   * @param emailExists - Whether the email already exists
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists
   * @returns True if client can be created, false otherwise
   */
  public static canCreateClient(emailExists: boolean, cpfCnpjExists: boolean): boolean {
    return this.isEmailAvailable(emailExists) && this.isCpfCnpjAvailable(cpfCnpjExists)
  }

  /**
   * Validates if a client can be created by performing the actual validation
   * @param email - The email to validate
   * @param cpfCnpj - The CPF/CNPJ to validate
   * @param checkEmailExists - Function to check if email exists
   * @param checkCpfCnpjExists - Function to check if CPF/CNPJ exists
   * @throws ClientEmailAlreadyExistsException if email already exists
   * @throws ClientCpfCnpjAlreadyExistsException if CPF/CNPJ already exists
   * @throws ClientInvalidEmailException if email format is invalid
   * @throws ClientInvalidCpfCnpjException if CPF/CNPJ format is invalid
   */
  public static async validateClientCreation(
    email: string,
    cpfCnpj: string,
    checkEmailExists: EmailValidationFunction,
    checkCpfCnpjExists: CpfCnpjValidationFunction,
  ): Promise<void> {
    // Validate email format
    try {
      Email.create(email)
    } catch (error) {
      this.logger.error('Invalid email format:', email, error)
      throw new ClientInvalidEmailException(email)
    }

    // Validate CPF/CNPJ format
    try {
      CpfCnpj.create(cpfCnpj)
    } catch (error) {
      this.logger.error('Invalid CPF/CNPJ format:', cpfCnpj, error)
      throw new ClientInvalidCpfCnpjException(cpfCnpj)
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      throw new ClientEmailAlreadyExistsException(email)
    }

    // Check if CPF/CNPJ already exists
    const cpfCnpjExists = await checkCpfCnpjExists(cpfCnpj)
    if (cpfCnpjExists) {
      throw new ClientCpfCnpjAlreadyExistsException(cpfCnpj)
    }
  }

  /**
   * Validates if a client can be created with the given email and throws an error if not
   * @param emailExists - Whether the email already exists
   * @param email - The email being validated
   * @throws ClientEmailAlreadyExistsException if email already exists
   */
  public static validateEmailAvailability(emailExists: boolean, email: string): void {
    if (!this.isEmailAvailable(emailExists)) {
      throw new ClientEmailAlreadyExistsException(email)
    }
  }

  /**
   * Validates if a client can be created with the given CPF/CNPJ and throws an error if not
   * @param cpfCnpjExists - Whether the CPF/CNPJ already exists
   * @param cpfCnpj - The CPF/CNPJ being validated
   * @throws ClientCpfCnpjAlreadyExistsException if CPF/CNPJ already exists
   */
  public static validateCpfCnpjAvailability(cpfCnpjExists: boolean, cpfCnpj: string): void {
    if (!this.isCpfCnpjAvailable(cpfCnpjExists)) {
      throw new ClientCpfCnpjAlreadyExistsException(cpfCnpj)
    }
  }
}
