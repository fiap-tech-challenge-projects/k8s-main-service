import { HttpStatus } from '@nestjs/common'

import { ServiceOrderResponseDto } from '@application/service-orders/dto'

/**
 * Presenter for Service Order responses
 * Handles response formatting without HTTP transport concerns
 */
export class ServiceOrderPresenter {
  /**
   * Present successful service order creation
   * @param serviceOrder - Service order response data
   * @returns Formatted success response
   */
  public static presentCreateSuccess(serviceOrder: ServiceOrderResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceOrderResponseDto
  } {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Service order created successfully',
      data: serviceOrder,
    }
  }

  /**
   * Present successful service order retrieval
   * @param serviceOrder - Service order response data
   * @returns Formatted success response
   */
  public static presentGetSuccess(serviceOrder: ServiceOrderResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceOrderResponseDto
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service order retrieved successfully',
      data: serviceOrder,
    }
  }

  /**
   * Present successful service order list retrieval
   * @param serviceOrders - Array of service order response data
   * @returns Formatted success response
   */
  public static presentListSuccess(serviceOrders: ServiceOrderResponseDto[]): {
    statusCode: HttpStatus
    message: string
    data: ServiceOrderResponseDto[]
    count: number
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service orders retrieved successfully',
      data: serviceOrders,
      count: serviceOrders.length,
    }
  }

  /**
   * Present successful service order update
   * @param serviceOrder - Updated service order response data
   * @returns Formatted success response
   */
  public static presentUpdateSuccess(serviceOrder: ServiceOrderResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceOrderResponseDto
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service order updated successfully',
      data: serviceOrder,
    }
  }

  /**
   * Present successful service order deletion
   * @returns Formatted success response
   */
  public static presentDeleteSuccess(): {
    statusCode: HttpStatus
    message: string
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service order deleted successfully',
    }
  }

  /**
   * Present service order error
   * @param error - Error message
   * @param statusCode - HTTP status code
   * @returns Formatted error response
   */
  public static presentError(
    error: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ): {
    statusCode: HttpStatus
    message: string
    error: string
  } {
    return {
      statusCode,
      message: 'Service order operation failed',
      error,
    }
  }
}
