/**
 * Base value object class for all domain value objects
 * Provides common functionality for immutable value objects
 *
 * This class should be in domain/utils because:
 * 1. It's a generic utility for all value objects
 * 2. It provides common validation and comparison logic
 * 3. It ensures consistency across all value objects
 */
export abstract class BaseValueObject<T> {
  /**
   * The underlying value of this value object
   */
  protected readonly _value: T

  /**
   * Constructor for base value object
   * @param value - The underlying value
   */
  constructor(value: T) {
    this._value = value
    this.validate()
  }

  /**
   * Get the underlying value
   * @returns The underlying value
   */
  public get value(): T {
    return this._value
  }

  /**
   * Validate the value object
   * Must be implemented by subclasses
   */
  protected abstract validate(): void

  /**
   * Check if this value object equals another value object
   * @param valueObject - The value object to compare with
   * @returns True if value objects are equal, false otherwise
   */
  public equals(valueObject: BaseValueObject<T>): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false
    }

    if (this === valueObject) {
      return true
    }

    return this._value === valueObject._value
  }

  /**
   * Get the value object's hash code
   * @returns Hash code based on the underlying value
   */
  public hashCode(): number {
    const str = JSON.stringify(this._value)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  /**
   * Convert value object to string representation
   * @returns String representation of the value object
   */
  public toString(): string {
    return String(this._value)
  }
}
