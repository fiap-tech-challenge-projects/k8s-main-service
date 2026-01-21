import { DomainException } from '@shared'

/**
 * Exception thrown when an estimated duration value is invalid
 */
export class InvalidEstimatedDurationException extends DomainException {
  /**
   * Constructor for invalid estimated duration exception
   * @param value - The invalid estimated duration value
   */
  constructor(value: string | number) {
    super(
      `Invalid estimated duration: "${value}". Expected format: HH:MM:SS (e.g., "00:50:00") or hours as decimal (e.g., 0.83)`,
    )
    this.name = 'InvalidEstimatedDurationException'
  }
}
