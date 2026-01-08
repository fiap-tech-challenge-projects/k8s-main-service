import { DomainException } from './domain-exception'

/**
 * Exception thrown when a value is invalid
 */
export class InvalidValueException extends DomainException {
  /**
   * Constructor for invalid value exception
   * @param value - The invalid value
   * @param reason - Reason why the value is invalid
   */
  constructor(value: string, reason: string) {
    super(`Invalid value '${value}': ${reason}`, 'InvalidValueException')
  }
}
