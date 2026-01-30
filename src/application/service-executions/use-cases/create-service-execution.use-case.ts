import { Injectable, Logger, Inject } from '@nestjs/common'
import { UserRole } from '@prisma/client'

import {
  CreateServiceExecutionDto,
  ServiceExecutionResponseDto,
} from '@application/service-executions/dto'
import { ServiceExecutionMapper } from '@application/service-executions/mappers'
import { EmployeeNotFoundException } from '@domain/employees/exceptions'
import { IEmployeeRepository, EMPLOYEE_REPOSITORY } from '@domain/employees/interfaces'
import { ServiceOrderAlreadyHasExecutionException } from '@domain/service-executions/exceptions'
import {
  ServiceExecutionRepositoryInterface,
  SERVICE_EXECUTION_REPOSITORY,
} from '@domain/service-executions/interfaces'
import { ServiceOrderNotFoundException } from '@domain/service-orders/exceptions'
import {
  IServiceOrderRepository,
  SERVICE_ORDER_REPOSITORY,
} from '@domain/service-orders/interfaces'
import { DomainException } from '@shared/exceptions'
import { UserContextService } from '@shared/services/user-context.service'
import { Result, Success, Failure } from '@shared/types'

/**
 * Use case for creating a new service execution
 * Orchestrates the creation process with proper business rules
 */
@Injectable()
export class CreateServiceExecutionUseCase {
  private readonly logger = new Logger(CreateServiceExecutionUseCase.name)

  /**
   * Constructor for CreateServiceExecutionUseCase
   * @param serviceExecutionRepository - Repository for service execution operations
   * @param serviceOrderRepository - Repository for service order operations
   * @param employeeRepository - Repository for employee operations
   * @param userContextService - Service for accessing current user context
   */
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private readonly serviceExecutionRepository: ServiceExecutionRepositoryInterface,
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    private readonly userContextService: UserContextService,
  ) {}

  /**
   * Execute the create service execution use case
   * @param createServiceExecutionDto - Data for creating the service execution
   * @returns Result with service execution response
   */
  async execute(
    createServiceExecutionDto: CreateServiceExecutionDto,
  ): Promise<Result<ServiceExecutionResponseDto, DomainException>> {
    try {
      const userId = this.userContextService.getUserId() ?? 'system'
      const userRole = this.userContextService.getUserRole() ?? UserRole.ADMIN

      this.logger.log('Executing create service execution use case', {
        serviceOrderId: createServiceExecutionDto.serviceOrderId,
        mechanicId: createServiceExecutionDto.mechanicId,
        createdBy: userId,
        context: 'CreateServiceExecutionUseCase.execute',
      })

      const serviceOrder = await this.serviceOrderRepository.findById(
        createServiceExecutionDto.serviceOrderId,
      )
      if (!serviceOrder) {
        const error = new ServiceOrderNotFoundException(createServiceExecutionDto.serviceOrderId)
        this.logger.warn('Service order not found for execution creation', {
          serviceOrderId: createServiceExecutionDto.serviceOrderId,
          context: 'CreateServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      // Validate that service order is in APPROVED status
      if (serviceOrder.status !== 'APPROVED') {
        const error = new Error(
          `Service execution can only be created for service orders with APPROVED status. Current status: ${serviceOrder.status}`,
        )
        this.logger.warn('Invalid service order status for execution creation', {
          serviceOrderId: createServiceExecutionDto.serviceOrderId,
          currentStatus: serviceOrder.status,
          context: 'CreateServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      const existingExecution = await this.serviceExecutionRepository.findByServiceOrderId(
        createServiceExecutionDto.serviceOrderId,
      )
      if (existingExecution) {
        const error = new ServiceOrderAlreadyHasExecutionException(
          createServiceExecutionDto.serviceOrderId,
        )
        this.logger.warn('Service order already has execution', {
          serviceOrderId: createServiceExecutionDto.serviceOrderId,
          existingExecutionId: existingExecution.id,
          context: 'CreateServiceExecutionUseCase.execute',
        })
        return new Failure(error)
      }

      if (createServiceExecutionDto.mechanicId) {
        const employee = await this.employeeRepository.findById(
          createServiceExecutionDto.mechanicId,
        )
        if (!employee) {
          const error = new EmployeeNotFoundException(createServiceExecutionDto.mechanicId)
          this.logger.warn('Mechanic not found for execution creation', {
            mechanicId: createServiceExecutionDto.mechanicId,
            context: 'CreateServiceExecutionUseCase.execute',
          })
          return new Failure(error)
        }
      }

      const serviceExecution = ServiceExecutionMapper.fromCreateDto(createServiceExecutionDto)
      const savedServiceExecution = await this.serviceExecutionRepository.create(serviceExecution)
      const result = ServiceExecutionMapper.toResponseDto(savedServiceExecution)

      this.logger.log('Service execution created successfully', {
        serviceExecutionId: savedServiceExecution.id,
        serviceOrderId: savedServiceExecution.serviceOrderId,
        mechanicId: savedServiceExecution.mechanicId,
        status: savedServiceExecution.status,
        createdBy: userId,
        userRole: userRole,
        context: 'CreateServiceExecutionUseCase.execute',
      })

      return new Success(result)
    } catch (error) {
      this.logger.error('Error creating service execution', {
        error: error instanceof Error ? error.message : 'Unknown error',
        dto: createServiceExecutionDto,
        userId: this.userContextService.getUserId(),
        userRole: this.userContextService.getUserRole(),
        context: 'CreateServiceExecutionUseCase.execute',
      })
      return new Failure(
        error instanceof DomainException ? error : new Error('Service execution creation failed'),
      )
    }
  }
}
