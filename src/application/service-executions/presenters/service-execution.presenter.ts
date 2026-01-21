import { HttpStatus } from '@nestjs/common'

import { ServiceExecutionResponseDto } from '@application/service-executions/dto'

/**
 * Presenter for Service Execution responses
 * Handles response formatting without HTTP transport concerns
 */
export class ServiceExecutionPresenter {
  /**
   * Present successful service execution creation
   * @param serviceExecution - Service execution response data
   * @returns Formatted success response
   */
  public static presentCreateSuccess(serviceExecution: ServiceExecutionResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceExecutionResponseDto
  } {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Service execution created successfully',
      data: serviceExecution,
    }
  }

  /**
   * Present successful service execution retrieval
   * @param serviceExecution - Service execution response data
   * @returns Formatted success response
   */
  public static presentGetSuccess(serviceExecution: ServiceExecutionResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceExecutionResponseDto
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service execution retrieved successfully',
      data: serviceExecution,
    }
  }

  /**
   * Present successful service execution list retrieval
   * @param serviceExecutions - Array of service execution response data
   * @returns Formatted success response
   */
  public static presentListSuccess(serviceExecutions: ServiceExecutionResponseDto[]): {
    statusCode: HttpStatus
    message: string
    data: ServiceExecutionResponseDto[]
    count: number
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service executions retrieved successfully',
      data: serviceExecutions,
      count: serviceExecutions.length,
    }
  }

  /**
   * Present successful service execution update
   * @param serviceExecution - Updated service execution response data
   * @returns Formatted success response
   */
  public static presentUpdateSuccess(serviceExecution: ServiceExecutionResponseDto): {
    statusCode: HttpStatus
    message: string
    data: ServiceExecutionResponseDto
  } {
    return {
      statusCode: HttpStatus.OK,
      message: 'Service execution updated successfully',
      data: serviceExecution,
    }
  }

  /**
   * Present service execution error
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
      message: 'Service execution operation failed',
      error,
    }
  }
}
