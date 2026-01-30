import { Injectable, Logger, Inject } from '@nestjs/common'

import { EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { PaginatedResult } from '@shared/bases'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for searching employees by name
 * Handles the orchestration for employee search by name business process
 */
@Injectable()
export class SearchEmployeesByNameUseCase {
  private readonly logger = new Logger(SearchEmployeesByNameUseCase.name)

  /**
   * Constructor for SearchEmployeesByNameUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee search by name
   * @param name - Employee name to search
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Result with paginated employee response DTOs or error
   */
  async execute(
    name: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedResult<EmployeeResponseDto>, Error>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing search employees by name use case', {
        name,
        page,
        limit,
        requestedBy: currentUserId,
        context: 'SearchEmployeesByNameUseCase.execute',
      })

      const employeesResult = await this.employeeRepository.findByName(name, page, limit)
      const responseDtos = employeesResult.data.map((employee) =>
        EmployeeMapper.toResponseDto(employee),
      )

      const result: PaginatedResult<EmployeeResponseDto> = {
        data: responseDtos,
        meta: employeesResult.meta,
      }

      this.logger.log('Search employees by name use case completed successfully', {
        name,
        employeeCount: responseDtos.length,
        totalPages: employeesResult.meta.totalPages,
        requestedBy: currentUserId,
        context: 'SearchEmployeesByNameUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error searching employees by name', {
        name,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'SearchEmployeesByNameUseCase.execute',
      })
      return new Failure(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
