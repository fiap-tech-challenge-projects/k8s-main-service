import { Injectable, Logger, Inject } from '@nestjs/common'

import { CreateEmployeeDto, EmployeeResponseDto } from '@application/employees/dto'
import { EmployeeMapper } from '@application/employees/mappers'
import { EmployeeAlreadyExistsException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { EmployeeCreationValidator } from '@domain/employees/validators'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new employee
 * Handles the orchestration for employee creation business process
 */
@Injectable()
export class CreateEmployeeUseCase {
  private readonly logger = new Logger(CreateEmployeeUseCase.name)

  /**
   * Constructor for CreateEmployeeUseCase
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute employee creation
   * @param createEmployeeDto - Employee creation data
   * @returns Result with employee response DTO or domain exception
   */
  async execute(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<Result<EmployeeResponseDto, EmployeeAlreadyExistsException>> {
    try {
      const currentUserId = this.userContextService.getUserId()

      this.logger.log('Executing create employee use case', {
        email: createEmployeeDto.email,
        name: createEmployeeDto.name,
        requestedBy: currentUserId,
        context: 'CreateEmployeeUseCase.execute',
      })

      // Validate employee creation (excluding password as it's not in CreateEmployeeDto)
      await EmployeeCreationValidator.validateEmployeeCreationWithoutPassword(
        createEmployeeDto.email,
        createEmployeeDto.name,
        createEmployeeDto.role,
        (email) => this.employeeRepository.emailExists(email),
      )

      const employee = EmployeeMapper.fromCreateDto(createEmployeeDto)
      const savedEmployee = await this.employeeRepository.create(employee)
      const responseDto = EmployeeMapper.toResponseDto(savedEmployee)

      this.logger.log('Employee creation use case completed successfully', {
        employeeId: responseDto.id,
        email: responseDto.email,
        requestedBy: currentUserId,
        context: 'CreateEmployeeUseCase.execute',
      })

      return new Success(responseDto)
    } catch (error) {
      this.logger.error('Error creating employee', {
        email: createEmployeeDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'CreateEmployeeUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException
          ? error
          : new EmployeeAlreadyExistsException(createEmployeeDto.email),
      )
    }
  }
}
