import { Result } from '@shared/types'

/**
 * Helper utility for working with Result type
 */
export class ResultHelper {
  /**
   * Unwraps a Result and returns the value or throws the error
   * @param result - The result to unwrap
   * @returns The success value
   * @throws The error if result is a failure
   */
  static unwrapOrThrow<T, E>(result: Result<T, E>): T {
    if (result.isSuccess) {
      return result.value
    }
    throw result.error
  }
}
