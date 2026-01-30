import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import {
  EmployeeResponseDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  PaginatedEmployeesResponseDto,
} from '@application/employees/dto'
import { EmployeePresenter } from '@application/employees/presenters'
import {
  ActivateEmployeeUseCase,
  CheckEmailAvailabilityUseCase,
  CreateEmployeeUseCase,
  DeactivateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetActiveEmployeesUseCase,
  GetAllEmployeesUseCase,
  GetEmployeeByEmailUseCase,
  GetEmployeeByIdUseCase,
  GetInactiveEmployeesUseCase,
  SearchEmployeesByNameUseCase,
  SearchEmployeesByRoleUseCase,
  UpdateEmployeeUseCase,
} from '@application/employees/use-cases'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for employee operations
 * Handles HTTP requests and responses for employee management
 */
@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name)

  /**
   * Constructor for EmployeeController
   * @param createEmployeeUseCase Use case for creating new employees
   * @param getEmployeeByIdUseCase Use case for retrieving employees by ID
   * @param getAllEmployeesUseCase Use case for retrieving all employees
   * @param getActiveEmployeesUseCase Use case for retrieving active employees
   * @param getInactiveEmployeesUseCase Use case for retrieving inactive employees
   * @param updateEmployeeUseCase Use case for updating employee information
   * @param activateEmployeeUseCase Use case for activating employees
   * @param deactivateEmployeeUseCase Use case for deactivating employees
   * @param deleteEmployeeUseCase Use case for deleting employees
   * @param searchEmployeesByNameUseCase Use case for searching employees by name
   * @param searchEmployeesByRoleUseCase Use case for searching employees by role
   * @param getEmployeeByEmailUseCase Use case for retrieving employees by email
   * @param checkEmailAvailabilityUseCase Use case for checking email availability
   * @param employeePresenter Presenter for formatting employee responses
   */
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly getEmployeeByIdUseCase: GetEmployeeByIdUseCase,
    private readonly getAllEmployeesUseCase: GetAllEmployeesUseCase,
    private readonly getActiveEmployeesUseCase: GetActiveEmployeesUseCase,
    private readonly getInactiveEmployeesUseCase: GetInactiveEmployeesUseCase,
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly activateEmployeeUseCase: ActivateEmployeeUseCase,
    private readonly deactivateEmployeeUseCase: DeactivateEmployeeUseCase,
    private readonly deleteEmployeeUseCase: DeleteEmployeeUseCase,
    private readonly searchEmployeesByNameUseCase: SearchEmployeesByNameUseCase,
    private readonly searchEmployeesByRoleUseCase: SearchEmployeesByRoleUseCase,
    private readonly getEmployeeByEmailUseCase: GetEmployeeByEmailUseCase,
    private readonly checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase,
    private readonly employeePresenter: EmployeePresenter,
  ) {}

  /**
   * Create a new employee
   * @param createEmployeeDto The data for creating the employee
   * @returns Promise resolving to the created employee data
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create employee',
    description: 'Create a new employee with the provided data',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Employee data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid employee data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    try {
      const result = await this.createEmployeeUseCase.execute(createEmployeeDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error creating employee:', error)
      throw error
    }
  }

  /**
   * Get all employees with pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated employee list
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieve all employees with optional pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: PaginatedEmployeesResponseDto,
  })
  async getAllEmployees(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedEmployeesResponseDto> {
    try {
      const result = await this.getAllEmployeesUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting all employees:', error)
      throw error
    }
  }

  /**
   * Get active employees with pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated active employee list
   */
  @Get('active')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get active employees',
    description: 'Retrieve all active employees with optional pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Active employees retrieved successfully',
    type: PaginatedEmployeesResponseDto,
  })
  async getActiveEmployees(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedEmployeesResponseDto> {
    try {
      const result = await this.getActiveEmployeesUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting active employees:', error)
      throw error
    }
  }

  /**
   * Get inactive employees with pagination
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated inactive employee list
   */
  @Get('inactive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get inactive employees',
    description: 'Retrieve all inactive employees with optional pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Inactive employees retrieved successfully',
    type: PaginatedEmployeesResponseDto,
  })
  async getInactiveEmployees(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedEmployeesResponseDto> {
    try {
      const result = await this.getInactiveEmployeesUseCase.execute(page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting inactive employees:', error)
      throw error
    }
  }

  /**
   * Search employees by name
   * @param name Employee name to search for
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated search results
   */
  @Get('search/name/:name')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search employees by name',
    description: 'Search for employees by name with pagination',
  })
  @ApiParam({
    name: 'name',
    description: 'Name to search for',
    example: 'John',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: PaginatedEmployeesResponseDto,
  })
  async searchEmployeesByName(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedEmployeesResponseDto> {
    try {
      const result = await this.searchEmployeesByNameUseCase.execute(name, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error searching employees by name:', error)
      throw error
    }
  }

  /**
   * Search employees by role
   * @param role Employee role to search for
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise resolving to paginated search results
   */
  @Get('search/role/:role')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search employees by role',
    description: 'Search for employees by role with pagination',
  })
  @ApiParam({
    name: 'role',
    description: 'Role to search for',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: PaginatedEmployeesResponseDto,
  })
  async searchEmployeesByRole(
    @Param('role') role: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedEmployeesResponseDto> {
    try {
      const result = await this.searchEmployeesByRoleUseCase.execute(role, page, limit)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error searching employees by role:', error)
      throw error
    }
  }

  /**
   * Get employee by email
   * @param email Employee email address
   * @returns Promise resolving to employee data
   */
  @Get('email/:email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get employee by email',
    description: 'Retrieve a specific employee by their email',
  })
  @ApiParam({
    name: 'email',
    description: 'Employee email',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee found successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async getEmployeeByEmail(@Param('email') email: string): Promise<EmployeeResponseDto> {
    try {
      const result = await this.getEmployeeByEmailUseCase.execute(email)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting employee by email:', error)
      throw error
    }
  }

  /**
   * Check email availability
   * @param email Email address to check availability
   * @returns Promise resolving to availability status
   */
  @Get('check-email/:email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check email availability',
    description: 'Check if an email is available for use',
  })
  @ApiParam({
    name: 'email',
    description: 'Email to check',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Email availability checked',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
      },
    },
  })
  async checkEmailAvailability(@Param('email') email: string): Promise<{ available: boolean }> {
    try {
      const result = await this.checkEmailAvailabilityUseCase.execute(email)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error checking email availability:', error)
      throw error
    }
  }

  /**
   * Get employee by ID
   * @param id Employee ID
   * @returns Promise resolving to employee data
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Retrieve a specific employee by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 'emp-1234567890-abc123def',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee found successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async getEmployeeById(@Param('id') id: string): Promise<EmployeeResponseDto> {
    try {
      const result = await this.getEmployeeByIdUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error getting employee by ID:', error)
      throw error
    }
  }

  /**
   * Update employee by ID
   * @param id Employee ID
   * @param updateEmployeeDto Employee data to update
   * @param req Request object containing user information
   * @param req.user Authenticated user details
   * @param req.user.id User ID
   * @param req.user.role User role
   * @param req.user.employeeId Employee ID associated with the user
   * @returns Promise resolving to updated employee data
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Update employee by ID',
    description:
      'Update details of a specific employee by their ID. Employees can only update their own profile.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 'emp-1234567890-abc123def',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Employee data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid employee data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Employees can only update their own profile',
  })
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    try {
      const result = await this.updateEmployeeUseCase.execute(id, updateEmployeeDto)

      if (result.isFailure) {
        throw result.error
      }

      return result.value
    } catch (error) {
      this.logger.error('Error updating employee:', error)
      throw error
    }
  }

  /**
   * Activate employee by ID
   * @param id Employee ID
   */
  @Put(':id/activate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Activate employee by ID',
    description: 'Activate a specific employee by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 'emp-1234567890-abc123def',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async activateEmployee(@Param('id') id: string): Promise<void> {
    try {
      const result = await this.activateEmployeeUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error activating employee:', error)
      throw error
    }
  }

  /**
   * Deactivate employee by ID
   * @param id Employee ID
   */
  @Put(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate employee by ID',
    description: 'Deactivate a specific employee by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 'emp-1234567890-abc123def',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async deactivateEmployee(@Param('id') id: string): Promise<void> {
    try {
      const result = await this.deactivateEmployeeUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error deactivating employee:', error)
      throw error
    }
  }

  /**
   * Delete employee by ID
   * @param id Employee ID
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete employee by ID',
    description: 'Delete a specific employee by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 'emp-1234567890-abc123def',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async deleteEmployee(@Param('id') id: string): Promise<void> {
    try {
      const result = await this.deleteEmployeeUseCase.execute(id)

      if (result.isFailure) {
        throw result.error
      }
    } catch (error) {
      this.logger.error('Error deleting employee:', error)
      throw error
    }
  }
}
