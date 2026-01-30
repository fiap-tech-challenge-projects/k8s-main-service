import { Injectable } from '@nestjs/common'

/**
 * Service for handling Prisma-specific errors.
 *
 * This service provides centralized logic for mapping Prisma exceptions to
 * appropriate HTTP status codes.
 *
 * @example
 * const handler = new PrismaErrorHandlerService();
 * const statusCode = handler.getHttpStatusCode(exception);
 */
@Injectable()
export class PrismaErrorHandlerService {
  /**
   * Maps Prisma exception types to HTTP status codes.
   *
   * Provides intelligent status code mapping based on Prisma error codes.
   * Handles database-specific exceptions with appropriate HTTP responses.
   *
   * @param exception - The Prisma exception to analyze
   * @returns Appropriate HTTP status code
   *
   * @example
   * const statusCode = handler.getHttpStatusCode(exception);
   * // Returns HttpStatus enum value
   */
  getHttpStatusCode(exception: Error): number {
    // Check if it's a Prisma error by looking for Prisma-specific properties
    if (this.isPrismaError(exception)) {
      return this.getPrismaErrorStatusCode(exception)
    }

    // Default to internal server error for non-Prisma errors
    return 500 // INTERNAL_SERVER_ERROR
  }

  /**
   * Checks if an exception is a Prisma error.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Prisma error, false otherwise
   */
  private isPrismaError(exception: Error): boolean {
    // Check for Prisma-specific error properties
    return (
      exception.name === 'PrismaClientKnownRequestError' ||
      exception.name === 'PrismaClientUnknownRequestError' ||
      exception.name === 'PrismaClientValidationError' ||
      exception.name === 'PrismaClientInitializationError' ||
      exception.name === 'PrismaClientRustPanicError' ||
      (exception as { code?: string }).code !== undefined ||
      exception.message.includes('prisma') ||
      exception.message.includes('database')
    )
  }

  /**
   * Maps Prisma error codes to HTTP status codes.
   *
   * @param exception - The Prisma exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getPrismaErrorStatusCode(exception: Error): number {
    // Try to extract Prisma error code
    const prismaError = exception as { code?: string }
    const code = prismaError.code

    switch (code) {
      case 'P2002': // Unique constraint violation
        return 409 // CONFLICT
      case 'P2003': // Foreign key constraint violation
        return 400 // BAD_REQUEST
      case 'P2025': // Record not found
        return 404 // NOT_FOUND
      case 'P2021': // Table does not exist
      case 'P2022': // Column does not exist
        return 500 // INTERNAL_SERVER_ERROR
      case 'P2014': // Invalid ID provided
        return 400 // BAD_REQUEST
      case 'P2015': // Related record not found
        return 404 // NOT_FOUND
      case 'P2016': // Query interpretation error
        return 400 // BAD_REQUEST
      case 'P2017': // Relation not connected
        return 400 // BAD_REQUEST
      case 'P2018': // Connected records not found
        return 404 // NOT_FOUND
      case 'P2019': // Input error
        return 400 // BAD_REQUEST
      case 'P2020': // Value out of range
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Gets the appropriate error message for a Prisma exception.
   *
   * Provides meaningful error messages for Prisma exceptions.
   * Falls back to the exception message if no specific mapping exists.
   *
   * @param exception - The Prisma exception to get message for
   * @returns Error message
   *
   * @example
   * const message = handler.getErrorMessage(exception);
   * // Returns appropriate error message
   */
  getErrorMessage(exception: Error): string {
    // Try to extract Prisma error code
    const prismaError = exception as {
      code?: string
      meta?: { target?: string[]; field_name?: string }
    }
    const code = prismaError.code

    switch (code) {
      case 'P2002': // Unique constraint violation
        return this.getUniqueConstraintMessage(prismaError)
      case 'P2003': // Foreign key constraint violation
        return this.getForeignKeyConstraintMessage(prismaError)
      case 'P2025': // Record not found
        return 'Record not found'
      case 'P2021': // Table does not exist
        return 'Database table does not exist'
      case 'P2022': // Column does not exist
        return 'Database column does not exist'
      case 'P2014': // Invalid ID provided
        return 'Invalid ID provided'
      case 'P2015': // Related record not found
        return 'Related record not found'
      case 'P2016': // Query interpretation error
        return 'Query interpretation error'
      case 'P2017': // Relation not connected
        return 'Relation not connected'
      case 'P2018': // Connected records not found
        return 'Connected records not found'
      case 'P2019': // Input error
        return 'Input error'
      case 'P2020': // Value out of range
        return 'Value out of range'
      default:
        return exception.message || 'Database error'
    }
  }

  /**
   * Gets a specific error message for unique constraint violations.
   *
   * @param prismaError - The Prisma error with meta information
   * @param prismaError.code - The Prisma error code
   * @param prismaError.meta - The Prisma error metadata
   * @param prismaError.meta.target - The target field that caused the constraint violation
   * @returns Specific error message for the unique constraint violation
   */
  private getUniqueConstraintMessage(prismaError: {
    code?: string
    meta?: { target?: string[] }
  }): string {
    const target = prismaError.meta?.target

    if (!target || target.length === 0) {
      return 'A record with this unique field already exists'
    }

    // Map database field names to user-friendly names
    const fieldMapping: Record<string, string> = {
      email: 'email',
      cpfCnpj: 'CPF/CNPJ',
      sku: 'SKU',
      licensePlate: 'license plate',
      vin: 'VIN',
    }

    const fieldName = fieldMapping[target[0]] || target[0]
    return `A record with this ${fieldName} already exists`
  }

  /**
   * Gets a specific error message for foreign key constraint violations.
   *
   * @param prismaError - The Prisma error with meta information
   * @param prismaError.code - The Prisma error code
   * @param prismaError.meta - The Prisma error metadata
   * @param prismaError.meta.field_name - The field name that caused the constraint violation
   * @returns Specific error message for the foreign key constraint violation
   */
  private getForeignKeyConstraintMessage(prismaError: {
    code?: string
    meta?: { field_name?: string }
  }): string {
    const fieldName = prismaError.meta?.field_name

    if (!fieldName) {
      return 'Referenced record does not exist'
    }

    // Map database field names to user-friendly names
    const fieldMapping: Record<string, string> = {
      clientId: 'client',
      vehicleId: 'vehicle',
      serviceId: 'service',
      employeeId: 'employee',
      stockItemId: 'stock item',
      serviceOrderId: 'service order',
      serviceExecutionId: 'service execution',
      vehicleEvaluationId: 'vehicle evaluation',
    }

    const friendlyFieldName = fieldMapping[fieldName] || fieldName
    return `The specified ${friendlyFieldName} does not exist`
  }
}
