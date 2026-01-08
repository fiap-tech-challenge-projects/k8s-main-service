import { Injectable, Logger } from '@nestjs/common'

import { BusinessExceptionHandlerService } from './business-exception-handler.service'
import { PrismaErrorHandlerService } from './prisma-error-handler.service'

/**
 * Registry service that provides access to all exception handlers.
 *
 * This service acts as a central point for accessing different types of
 * exception handlers, making exception filters cleaner and more maintainable.
 * It encapsulates the complexity of managing multiple handlers while providing
 * a simple interface for exception filters.
 *
 * @example
 * // In an exception filter
 * constructor(private readonly exceptionRegistry: ExceptionHandlerRegistryService) {}
 *
 * // Usage
 * const statusCode = this.exceptionRegistry.getHttpStatusCode(exception);
 */
@Injectable()
export class ExceptionHandlerRegistryService {
  private readonly logger = new Logger(ExceptionHandlerRegistryService.name)

  /**
   * Creates a new ExceptionHandlerRegistryService instance.
   *
   * @param prismaErrorHandler - The service for handling Prisma-specific errors
   * @param businessExceptionHandler - The service for handling business logic exceptions
   */
  constructor(
    private readonly prismaErrorHandler: PrismaErrorHandlerService,
    private readonly businessExceptionHandler: BusinessExceptionHandlerService,
  ) {}

  /**
   * Gets the appropriate HTTP status code for an exception.
   *
   * Delegates to the appropriate handler based on exception type.
   *
   * @param exception - The exception to get status code for
   * @returns HTTP status code
   */
  getHttpStatusCode(exception: Error): number {
    return this.prismaErrorHandler.getHttpStatusCode(exception) !== 500
      ? this.prismaErrorHandler.getHttpStatusCode(exception)
      : this.businessExceptionHandler.getHttpStatusCode(exception)
  }

  /**
   * Gets the appropriate error message for an exception.
   *
   * Delegates to the appropriate handler based on exception type.
   *
   * @param exception - The exception to get message for
   * @returns Error message
   */
  getErrorMessage(exception: Error): string {
    const prismaMessage = this.prismaErrorHandler.getErrorMessage(exception)
    return prismaMessage !== 'Database error'
      ? prismaMessage
      : this.businessExceptionHandler.getErrorMessage(exception)
  }

  /**
   * Gets the logger instance.
   *
   * @returns Logger instance
   */
  getLogger(): Logger {
    return this.logger
  }
}
