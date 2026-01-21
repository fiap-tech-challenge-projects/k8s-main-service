/**
 * Represents the result of an operation that can either succeed or fail
 * @template TSuccess - Type of successful result
 * @template TError - Type of error result
 */
export type Result<TSuccess, TError = Error> = Success<TSuccess> | Failure<TError>

/**
 * Represents a successful result
 * @template TValue - Type of the success value
 */
export class Success<TValue> {
  readonly isSuccess = true
  readonly isFailure = false

  /**
   * Constructor for Success
   * @param value - The success value
   */
  constructor(public readonly value: TValue) {}

  /**
   * Maps the success value to a new type
   * @param fn - Function to transform the success value
   * @returns New Success with transformed value
   */
  map<TNewValue>(fn: (value: TValue) => TNewValue): Success<TNewValue> {
    return new Success(fn(this.value))
  }

  /**
   * Flat maps the success value to a new Result
   * @param fn - Function to transform the success value to a Result
   * @returns Result returned by the function
   */
  flatMap<TNewValue, TError>(
    fn: (value: TValue) => Result<TNewValue, TError>,
  ): Result<TNewValue, TError> {
    return fn(this.value)
  }

  /**
   * Returns the success value or throws if this is actually a failure
   * @returns The success value
   */
  unwrap(): TValue {
    return this.value
  }

  /**
   * Returns the success value or the default value if this is a failure
   * @param _defaultValue - Default value to return if this is a failure (unused in Success)
   * @returns The success value
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrapOr<TDefault>(_defaultValue: TDefault): TValue {
    return this.value
  }
}

/**
 * Represents a failed result
 * @template TError - Type of the error
 */
export class Failure<TError> {
  readonly isSuccess = false
  readonly isFailure = true

  /**
   * Constructor for Failure
   * @param error - The error
   */
  constructor(public readonly error: TError) {}

  /**
   * Maps the success value (no-op for Failure)
   * @param _fn - Function to transform the success value (ignored)
   * @returns This failure instance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<TNewValue>(_fn: (value: never) => TNewValue): this {
    return this
  }

  /**
   * Flat maps the success value (no-op for Failure)
   * @param _fn - Function to transform the success value (ignored)
   * @returns This failure instance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatMap<TNewValue, TNewError>(_fn: (value: never) => Result<TNewValue, TNewError>): this {
    return this
  }

  /**
   * Throws the error since this is a failure
   * @throws The error contained in this failure
   */
  unwrap(): never {
    throw this.error
  }

  /**
   * Returns the default value since this is a failure
   * @param defaultValue - Default value to return
   * @returns The default value
   */
  unwrapOr<TDefault>(defaultValue: TDefault): TDefault {
    return defaultValue
  }
}

/**
 * Creates a successful result
 * @param value - The success value
 * @returns Success instance
 */
export const SUCCESS = <TValue>(value: TValue): Success<TValue> => new Success(value)

/**
 * Creates a failed result
 * @param error - The error
 * @returns Failure instance
 */
export const FAILURE = <TError>(error: TError): Failure<TError> => new Failure(error)

/**
 * Type guard to check if a Result is a Success
 * @param result - The result to check
 * @returns True if the result is a Success
 */
export const IS_SUCCESS = <TSuccess, TError>(
  result: Result<TSuccess, TError>,
): result is Success<TSuccess> => result.isSuccess

/**
 * Type guard to check if a Result is a Failure
 * @param result - The result to check
 * @returns True if the result is a Failure
 */
export const IS_FAILURE = <TSuccess, TError>(
  result: Result<TSuccess, TError>,
): result is Failure<TError> => result.isFailure
