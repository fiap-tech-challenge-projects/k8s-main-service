import { Injectable } from '@nestjs/common'

/**
 * Service for handling business-specific exceptions.
 *
 * This service provides centralized logic for mapping business exceptions to
 * appropriate HTTP status codes. It separates business error handling concerns
 * from the main exception filter.
 *
 * @example
 * const handler = new BusinessExceptionHandlerService();
 * const statusCode = handler.getHttpStatusCode(exception);
 */
@Injectable()
export class BusinessExceptionHandlerService {
  /**
   * Maps business exception types to HTTP status codes.
   *
   * Provides intelligent status code mapping based on exception names.
   * Handles domain-specific exceptions with appropriate HTTP responses.
   *
   * @param exception - The business exception to analyze
   * @returns Appropriate HTTP status code
   *
   * @example
   * const statusCode = handler.getHttpStatusCode(exception);
   * // Returns HttpStatus enum value
   */
  getHttpStatusCode(exception: Error): number {
    // Auth domain exceptions
    if (this.isAuthException(exception)) {
      return this.getAuthExceptionStatusCode(exception)
    }

    // Budget domain exceptions
    if (this.isBudgetException(exception)) {
      return this.getBudgetExceptionStatusCode(exception)
    }

    // Budget Items domain exceptions
    if (this.isBudgetItemException(exception)) {
      return this.getBudgetItemExceptionStatusCode(exception)
    }

    // Client domain exceptions
    if (this.isClientException(exception)) {
      return this.getClientExceptionStatusCode(exception)
    }

    // Employee domain exceptions
    if (this.isEmployeeException(exception)) {
      return this.getEmployeeExceptionStatusCode(exception)
    }

    // Stock domain exceptions
    if (this.isStockException(exception)) {
      return this.getStockExceptionStatusCode(exception)
    }

    // Stock Movement domain exceptions
    if (this.isStockMovementException(exception)) {
      return this.getStockMovementExceptionStatusCode(exception)
    }

    // Vehicle domain exceptions
    if (this.isVehicleException(exception)) {
      return this.getVehicleExceptionStatusCode(exception)
    }

    // Service domain exceptions
    if (this.isServiceException(exception)) {
      return this.getServiceExceptionStatusCode(exception)
    }

    // Service Order domain exceptions
    if (this.isServiceOrderException(exception)) {
      return this.getServiceOrderExceptionStatusCode(exception)
    }

    // Service Execution domain exceptions
    if (this.isServiceExecutionException(exception)) {
      return this.getServiceExecutionExceptionStatusCode(exception)
    }

    // Vehicle Evaluation domain exceptions
    if (this.isVehicleEvaluationException(exception)) {
      return this.getVehicleEvaluationExceptionStatusCode(exception)
    }

    // Common error types
    if (this.isCommonError(exception)) {
      return this.getCommonErrorStatusCode(exception)
    }

    // Default to internal server error
    return 500 // INTERNAL_SERVER_ERROR
  }

  /**
   * Checks if an exception is an Auth domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is an Auth domain exception, false otherwise
   */
  private isAuthException(exception: Error): boolean {
    const authExceptions = [
      'InvalidCredentialsException',
      'InactiveUserException',
      'EmailAlreadyExistsException',
      'InvalidRefreshTokenException',
      'UserNotFoundException',
      'UserNotFoundByEmailException',
      'AdminRoleNotAllowedException',
      'ClientIdRequiredException',
      'EmployeeIdRequiredException',
    ]
    return (
      authExceptions.includes(exception.name) || authExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Budget domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Budget domain exception, false otherwise
   */
  private isBudgetException(exception: Error): boolean {
    const budgetExceptions = [
      'BudgetNotFoundException',
      'BudgetAlreadyApprovedException',
      'BudgetAlreadyRejectedException',
      'BudgetExpiredException',
      'InvalidBudgetStatusException',
      'BudgetTotalMismatchException',
    ]
    return (
      budgetExceptions.includes(exception.name) ||
      budgetExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Budget Item domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Budget Item domain exception, false otherwise
   */
  private isBudgetItemException(exception: Error): boolean {
    const budgetItemExceptions = [
      'BudgetItemNotFoundException',
      'InvalidServiceOrderStatusForBudgetItemException',
    ]
    return (
      budgetItemExceptions.includes(exception.name) ||
      budgetItemExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Client domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Client domain exception, false otherwise
   */
  private isClientException(exception: Error): boolean {
    const clientExceptions = [
      'ClientAlreadyExistsException',
      'ClientNotFoundException',
      'ClientEmailAlreadyExistsException',
      'ClientCpfCnpjAlreadyExistsException',
      'ClientInvalidCpfCnpjException',
      'ClientInvalidEmailException',
    ]
    return (
      clientExceptions.includes(exception.name) ||
      clientExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is an Employee domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is an Employee domain exception, false otherwise
   */
  private isEmployeeException(exception: Error): boolean {
    const employeeExceptions = [
      'EmployeeAlreadyExistsException',
      'EmployeeNotFoundException',
      'EmployeeInactiveException',
      'EmployeeEmailAlreadyExistsException',
      'EmployeeInvalidRoleException',
    ]
    return (
      employeeExceptions.includes(exception.name) ||
      employeeExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Stock domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Stock domain exception, false otherwise
   */
  private isStockException(exception: Error): boolean {
    const stockExceptions = [
      'StockItemAlreadyExistsException',
      'StockItemNotFoundException',
      'InvalidSkuFormatException',
      'InvalidPriceMarginException',
    ]
    return (
      stockExceptions.includes(exception.name) ||
      stockExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Stock Movement domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Stock Movement domain exception, false otherwise
   */
  private isStockMovementException(exception: Error): boolean {
    const stockMovementExceptions = [
      'StockMovementNotFoundException',
      'InsufficientStockException',
      'InvalidStockMovementTypeException',
      'InvalidStockMovementDateException',
    ]
    return (
      stockMovementExceptions.includes(exception.name) ||
      stockMovementExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Vehicle domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Vehicle domain exception, false otherwise
   */
  private isVehicleException(exception: Error): boolean {
    const vehicleExceptions = [
      'VehicleNotFoundException',
      'LicensePlateAlreadyExistsException',
      'VinAlreadyExistsException',
    ]
    return (
      vehicleExceptions.includes(exception.name) ||
      vehicleExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Service domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Service domain exception, false otherwise
   */
  private isServiceException(exception: Error): boolean {
    const serviceExceptions = [
      'ServiceNotFoundException',
      'ServiceNameAlreadyExistsException',
      'InvalidServiceNameException',
      'InvalidServiceDescriptionException',
      'InvalidPriceException',
      'InvalidEstimatedDurationException',
    ]
    return (
      serviceExceptions.includes(exception.name) ||
      serviceExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Service Order domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Service Order domain exception, false otherwise
   */
  private isServiceOrderException(exception: Error): boolean {
    const serviceOrderExceptions = [
      'ServiceOrderNotFoundException',
      'InvalidDeliveryDateException',
      'InvalidServiceOrderStatusTransitionException',
      'ServiceOrderUnauthorizedOperationException',
      'ServiceOrderUnauthorizedStatusChangeException',
      'ServiceOrderVehicleOwnershipException',
    ]
    return (
      serviceOrderExceptions.includes(exception.name) ||
      serviceOrderExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Service Execution domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Service Execution domain exception, false otherwise
   */
  private isServiceExecutionException(exception: Error): boolean {
    const serviceExecutionExceptions = [
      'ServiceExecutionNotFoundException',
      'ServiceOrderAlreadyHasExecutionException',
      'InvalidStatusTransitionException',
      'MechanicNotAssignedException',
    ]
    return (
      serviceExecutionExceptions.includes(exception.name) ||
      serviceExecutionExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a Vehicle Evaluation domain exception.
   *
   * @param exception - The error to check
   * @returns True if the exception is a Vehicle Evaluation domain exception, false otherwise
   */
  private isVehicleEvaluationException(exception: Error): boolean {
    const vehicleEvaluationExceptions = ['VehicleEvaluationNotFoundException']
    return (
      vehicleEvaluationExceptions.includes(exception.name) ||
      vehicleEvaluationExceptions.includes(exception.constructor.name)
    )
  }

  /**
   * Checks if an exception is a common error type.
   *
   * @param exception - The error to check
   * @returns True if the exception is a common error type, false otherwise
   */
  private isCommonError(exception: Error): boolean {
    const commonErrors = [
      'ValidationError',
      'NotFoundError',
      'ConflictError',
      'UnauthorizedError',
      'ForbiddenError',
      'InvalidValueException',
      'EntityNotFoundException',
      'AlreadyExistsException',
      'InvalidPaginationException',
    ]
    return (
      commonErrors.includes(exception.name) || commonErrors.includes(exception.constructor.name)
    )
  }

  /**
   * Maps Auth domain exceptions to HTTP status codes.
   *
   * @param exception - The Auth domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getAuthExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'InvalidCredentialsException':
      case 'InvalidRefreshTokenException':
        return 401 // UNAUTHORIZED
      case 'InactiveUserException':
        return 403 // FORBIDDEN
      case 'EmailAlreadyExistsException':
        return 409 // CONFLICT
      case 'UserNotFoundException':
      case 'UserNotFoundByEmailException':
        return 404 // NOT_FOUND
      case 'AdminRoleNotAllowedException':
      case 'ClientIdRequiredException':
      case 'EmployeeIdRequiredException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Budget domain exceptions to HTTP status codes.
   *
   * @param exception - The Budget domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getBudgetExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'BudgetNotFoundException':
        return 404 // NOT_FOUND
      case 'BudgetAlreadyApprovedException':
      case 'BudgetAlreadyRejectedException':
      case 'BudgetTotalMismatchException':
        return 409 // CONFLICT
      case 'BudgetExpiredException':
        return 410 // GONE
      case 'InvalidBudgetStatusException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Budget Item domain exceptions to HTTP status codes.
   *
   * @param exception - The Budget Item domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getBudgetItemExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'BudgetItemNotFoundException':
        return 404 // NOT_FOUND
      case 'InvalidServiceOrderStatusForBudgetItemException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Client domain exceptions to HTTP status codes.
   *
   * @param exception - The Client domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getClientExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'ClientAlreadyExistsException':
      case 'ClientEmailAlreadyExistsException':
      case 'ClientCpfCnpjAlreadyExistsException':
        return 409 // CONFLICT
      case 'ClientNotFoundException':
        return 404 // NOT_FOUND
      case 'ClientInvalidCpfCnpjException':
      case 'ClientInvalidEmailException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Employee domain exceptions to HTTP status codes.
   *
   * @param exception - The Employee domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getEmployeeExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'EmployeeAlreadyExistsException':
      case 'EmployeeEmailAlreadyExistsException':
        return 409 // CONFLICT
      case 'EmployeeNotFoundException':
        return 404 // NOT_FOUND
      case 'EmployeeInactiveException':
        return 403 // FORBIDDEN
      case 'EmployeeInvalidRoleException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Stock domain exceptions to HTTP status codes.
   *
   * @param exception - The Stock domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getStockExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'StockItemAlreadyExistsException':
        return 409 // CONFLICT
      case 'StockItemNotFoundException':
        return 404 // NOT_FOUND
      case 'InvalidSkuFormatException':
        return 400 // BAD_REQUEST
      case 'InvalidPriceMarginException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Stock Movement domain exceptions to HTTP status codes.
   *
   * @param exception - The Stock Movement domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getStockMovementExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'StockMovementNotFoundException':
        return 404 // NOT_FOUND
      case 'InsufficientStockException':
        return 400 // BAD_REQUEST
      case 'InvalidStockMovementTypeException':
        return 400 // BAD_REQUEST
      case 'InvalidStockMovementDateException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Vehicle domain exceptions to HTTP status codes.
   *
   * @param exception - The Vehicle domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getVehicleExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'VehicleNotFoundException':
        return 404 // NOT_FOUND
      case 'LicensePlateAlreadyExistsException':
      case 'VinAlreadyExistsException':
        return 409 // CONFLICT
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Service domain exceptions to HTTP status codes.
   *
   * @param exception - The Service domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getServiceExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'ServiceNotFoundException':
        return 404 // NOT_FOUND
      case 'ServiceNameAlreadyExistsException':
        return 409 // CONFLICT
      case 'InvalidServiceNameException':
      case 'InvalidServiceDescriptionException':
      case 'InvalidPriceException':
      case 'InvalidEstimatedDurationException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Service Order domain exceptions to HTTP status codes.
   *
   * @param exception - The Service Order domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getServiceOrderExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'ServiceOrderNotFoundException':
        return 404 // NOT_FOUND
      case 'InvalidDeliveryDateException':
      case 'InvalidServiceOrderStatusTransitionException':
        return 400 // BAD_REQUEST
      case 'ServiceOrderUnauthorizedOperationException':
      case 'ServiceOrderUnauthorizedStatusChangeException':
        return 403 // FORBIDDEN
      case 'ServiceOrderVehicleOwnershipException':
        return 403 // FORBIDDEN
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Service Execution domain exceptions to HTTP status codes.
   *
   * @param exception - The Service Execution domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getServiceExecutionExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'ServiceExecutionNotFoundException':
        return 404 // NOT_FOUND
      case 'ServiceOrderAlreadyHasExecutionException':
        return 409 // CONFLICT
      case 'InvalidStatusTransitionException':
      case 'MechanicNotAssignedException':
        return 400 // BAD_REQUEST
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps Vehicle Evaluation domain exceptions to HTTP status codes.
   *
   * @param exception - The Vehicle Evaluation domain exception to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getVehicleEvaluationExceptionStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'VehicleEvaluationNotFoundException':
        return 404 // NOT_FOUND
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Maps common error types to HTTP status codes.
   *
   * @param exception - The common error to map
   * @returns The appropriate HTTP status code for the exception
   */
  private getCommonErrorStatusCode(exception: Error): number {
    switch (exception.name) {
      case 'ValidationError':
      case 'InvalidValueException':
      case 'InvalidPaginationException':
        return 400 // BAD_REQUEST
      case 'NotFoundError':
      case 'EntityNotFoundException':
        return 404 // NOT_FOUND
      case 'ConflictError':
      case 'AlreadyExistsException':
        return 409 // CONFLICT
      case 'UnauthorizedError':
        return 401 // UNAUTHORIZED
      case 'ForbiddenError':
        return 403 // FORBIDDEN
      default:
        return 500 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * Gets the appropriate error message for a business exception.
   *
   * Provides meaningful error messages for business exceptions.
   * Falls back to the exception message if no specific mapping exists.
   *
   * @param exception - The business exception to get message for
   * @returns Error message
   *
   * @example
   * const message = handler.getErrorMessage(exception);
   * // Returns appropriate error message
   */
  getErrorMessage(exception: Error): string {
    return exception.message || 'Business error'
  }
}
