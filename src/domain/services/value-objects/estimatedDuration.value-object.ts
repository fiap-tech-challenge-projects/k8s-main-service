import { BaseValueObject } from '@shared'

import { InvalidEstimatedDurationException } from '../exceptions'
import { EstimatedDurationValidator } from '../validators'

/**
 * Value object representing an estimated duration in hours.
 */
export class EstimatedDuration extends BaseValueObject<number> {
  private constructor(value: string | number) {
    super(typeof value === 'string' ? EstimatedDurationValidator.formatTimeToFloat(value) : value)
  }

  /**
   * Validate the estimated duration value.
   */
  protected validate(): void {
    // The validation is done in the constructor before calling super()
    // This method is called after the value is set, so we just need to ensure it's non-negative
    if (this._value < 0) {
      throw new InvalidEstimatedDurationException(this._value)
    }
  }

  /**
   * Factory method to create an EstimatedDuration value object.
   * @param value - The estimated duration value as a string (HH:MM:SS) or number (hours)
   * @returns A new EstimatedDuration instance
   */
  static create(value: string | number): EstimatedDuration {
    // Validate input before creating the instance
    if (!EstimatedDurationValidator.isValid(value)) {
      throw new InvalidEstimatedDurationException(value)
    }

    return new EstimatedDuration(value)
  }

  /**
   * Get the estimated duration value in hours.
   * @returns Estimated duration value in hours
   */
  public getValue(): number {
    return this._value
  }

  /**
   * Get the estimated duration formatted as a string in "HH:MM:SS" format.
   * @returns Formatted estimated duration string
   */
  public getFormatted(): string {
    return EstimatedDurationValidator.formatFloatToTime(this._value)
  }

  /**
   * Get the estimated duration in minutes.
   * @returns Estimated duration value in minutes
   */
  public getMinutes(): number {
    return Math.round(this._value * 60)
  }

  /**
   * Get the estimated duration in seconds.
   * @returns Estimated duration value in seconds
   */
  public getSeconds(): number {
    return Math.round(this._value * 3600)
  }
}
