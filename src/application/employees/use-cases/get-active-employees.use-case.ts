import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting active employees
 * Handles the orchestration for active employee listing business process
 */
@Injectable()
export class GetActiveEmployeesUseCase {
  private readonly logger = new Logger(GetActiveEmployeesUseCase.name)

  /**
   * Constructor for GetActiveEmployeesUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute active employee listing
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Result with paginated active employee response DTOs or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedResult<EmployeeResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get active employees use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetActiveEmployeesUseCase.execute',
      })

      const employeesResult = await this.employeeRepository.findActive(page, limit)
      const responseDtos = employeesResult.data.map((employee) =>
        EmployeeMapper.toResponseDto(employee),
      )

      const result: PaginatedResult<EmployeeResponseDto> = {
        data: responseDtos,
        meta: employeesResult.meta,
      }

      this.logger.log('Get active employees use case completed successfully', {
        employeeCount: responseDtos.length,
        totalPages: employeesResult.meta.totalPages,
        requestedBy: currentUserId,
        context: 'GetActiveEmployeesUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting active employees', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetActiveEmployeesUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
