import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * Exception thrown when a user is not authorized to perform an action.
 * Maps to HTTP 403 Forbidden status code.
 */
export class ForbiddenException extends HttpException {
  /**
   * Creates a new ForbiddenException instance.
   * @param message - Error message describing the authorization failure
   */
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN)
  }
}
