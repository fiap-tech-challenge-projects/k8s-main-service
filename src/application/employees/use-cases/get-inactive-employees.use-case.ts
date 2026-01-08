import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for getting inactive employees
 * Handles the orchestration for inactive employee listing business process
 */
@Injectable()
export class GetInactiveEmployeesUseCase {
  private readonly logger = new Logger(GetInactiveEmployeesUseCase.name)

  /**
   * Constructor for GetInactiveEmployeesUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute inactive employee listing
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Result with paginated inactive employee response DTOs or error
   */
  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedResult<EmployeeResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing get inactive employees use case', {
        page,
        limit,
        requestedBy: currentUserId,
        context: 'GetInactiveEmployeesUseCase.execute',
      })

      const employeesResult = await this.employeeRepository.findInactive(page, limit)
      const responseDtos = employeesResult.data.map((employee) =>
        EmployeeMapper.toResponseDto(employee),
      )

      const result: PaginatedResult<EmployeeResponseDto> = {
        data: responseDtos,
        meta: employeesResult.meta,
      }

      this.logger.log('Get inactive employees use case completed successfully', {
        employeeCount: responseDtos.length,
        totalPages: employeesResult.meta.totalPages,
        requestedBy: currentUserId,
        context: 'GetInactiveEmployeesUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error getting inactive employees', {
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'GetInactiveEmployeesUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
