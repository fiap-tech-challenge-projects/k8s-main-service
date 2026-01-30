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
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
  PaginatedClientsResponseDto,
} from '@application/clients/dto'
import { ClientPresenter, ClientHttpResponse } from '@application/clients/presenters'
import {
  CreateClientUseCase,
  GetClientByIdUseCase,
  GetClientByCpfCnpjUseCase,
  GetClientByEmailUseCase,
  GetAllClientsUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
  SearchClientsByNameUseCase,
  CheckCpfCnpjAvailabilityUseCase,
  CheckEmailAvailabilityUseCase,
} from '@application/clients/use-cases'
import { ClientNotFoundException } from '@domain/clients/exceptions'
import { Roles } from '@shared/decorators'
import { JwtAuthGuard, RolesGuard } from '@shared/guards'

/**
 * REST controller for client operations
 * Handles HTTP requests and responses for client management
 */
@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientController {
  private readonly logger = new Logger(ClientController.name)

  /**
   * Constructor for ClientController
   * @param createClientUseCase - Create client use case
   * @param getClientByIdUseCase - Get client by ID use case
   * @param getClientByCpfCnpjUseCase - Get client by CPF/CNPJ use case
   * @param getClientByEmailUseCase - Get client by email use case
   * @param getAllClientsUseCase - Get all clients use case
   * @param updateClientUseCase - Update client use case
   * @param deleteClientUseCase - Delete client use case
   * @param searchClientsByNameUseCase - Search clients by name use case
   * @param checkCpfCnpjAvailabilityUseCase - Check CPF/CNPJ availability use case
   * @param checkEmailAvailabilityUseCase - Check email availability use case
   * @param clientPresenter - Client presenter for response formatting
   */
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    private readonly getClientByCpfCnpjUseCase: GetClientByCpfCnpjUseCase,
    private readonly getClientByEmailUseCase: GetClientByEmailUseCase,
    private readonly getAllClientsUseCase: GetAllClientsUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
    private readonly searchClientsByNameUseCase: SearchClientsByNameUseCase,
    private readonly checkCpfCnpjAvailabilityUseCase: CheckCpfCnpjAvailabilityUseCase,
    private readonly checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase,
    private readonly clientPresenter: ClientPresenter,
  ) {}

  /**
   * Create a new client
   * @param createClientDto - Client data to create
   * @returns Promise resolving to the client response
   */
  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create client',
    description: 'Create a new client with the provided data',
  })
  @ApiBody({
    type: CreateClientDto,
    description: 'Client data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid client data',
  })
  @ApiResponse({
    status: 409,
    description: 'CPF or email already registered',
  })
  async createClient(@Body() createClientDto: CreateClientDto): Promise<ClientHttpResponse> {
    const result = await this.createClientUseCase.execute(createClientDto)

    if (result.isSuccess) {
      return this.clientPresenter.present(result.value)
    }

    if (result.isFailure) {
      this.logger.error('Error creating client:', result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Get all clients with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated client responses
   */
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all clients',
    description: 'Retrieve all clients with optional pagination',
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
    description: 'Clients retrieved successfully',
    type: PaginatedClientsResponseDto,
  })
  async getAllClients(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClientsResponseDto> {
    try {
      const result = await this.getAllClientsUseCase.execute(page, limit)
      return result.isSuccess
        ? result.value
        : (() => {
            throw result.error
          })()
    } catch (error) {
      this.logger.error('Error getting all clients:', error)
      throw error
    }
  }

  /**
   * Get client by CPF or CNPJ
   * @param cpfCnpj - Client's CPF or CNPJ
   * @returns Promise resolving to the client response
   */
  @Get('cpf-cnpj/:cpfCnpj')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get client by CPF or CNPJ',
    description: 'Retrieve a specific client by their CPF or CNPJ',
  })
  @ApiParam({
    name: 'cpfCnpj',
    description: 'Client CPF or CNPJ',
    example: '123.456.789-00',
  })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async getClientByCpfCnpj(@Param('cpfCnpj') cpfCnpj: string): Promise<ClientHttpResponse> {
    const result = await this.getClientByCpfCnpjUseCase.execute(cpfCnpj)

    if (result.isSuccess && result.value) {
      return this.clientPresenter.present(result.value)
    }

    if (result.isSuccess && !result.value) {
      this.logger.warn(`Client not found with CPF/CNPJ: ${cpfCnpj}`)
      throw new ClientNotFoundException(`Client not found with CPF/CNPJ: ${cpfCnpj}`)
    }

    if (result.isFailure) {
      this.logger.error('Error getting client by CPF/CNPJ:', result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Get client by email
   * @param email - Client's email address
   * @returns Promise resolving to the client response
   */
  @Get('email/:email')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get client by email',
    description: 'Retrieve a specific client by their email address',
  })
  @ApiParam({
    name: 'email',
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async getClientByEmail(@Param('email') email: string): Promise<ClientHttpResponse> {
    const result = await this.getClientByEmailUseCase.execute(email)

    if (result.isSuccess && result.value) {
      return this.clientPresenter.present(result.value)
    }

    if (result.isSuccess && !result.value) {
      this.logger.warn(`Client not found with email: ${email}`)
      throw new ClientNotFoundException(`Client not found with email: ${email}`)
    }

    if (result.isFailure) {
      this.logger.error('Error fetching client by email:', result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Search clients by name with pagination
   * @param name - Name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated client responses
   */
  @Get('search/:name')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Search clients by name',
    description: 'Search for clients by name with optional pagination',
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
    description: 'Clients found successfully',
    type: PaginatedClientsResponseDto,
  })
  async searchClientsByName(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClientsResponseDto> {
    const result = await this.searchClientsByNameUseCase.execute(name, page, limit)

    if (result.isSuccess) {
      return result.value
    }

    if (result.isFailure) {
      this.logger.error(`Error searching clients by name ${name}:`, result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Check if CPF or CNPJ is available
   * @param cpfCnpj - CPF or CNPJ to check
   * @returns Promise resolving to availability status
   */
  @Get('check/cpf-cnpj/:cpfCnpj')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check CPF or CNPJ availability',
    description: 'Check if a CPF or CNPJ is available for registration',
  })
  @ApiParam({
    name: 'cpfCnpj',
    description: 'CPF or CNPJ to check',
    example: '12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the CPF or CNPJ is available',
        },
      },
    },
  })
  async checkCpfCnpjAvailability(
    @Param('cpfCnpj') cpfCnpj: string,
  ): Promise<{ available: boolean }> {
    const result = await this.checkCpfCnpjAvailabilityUseCase.execute(cpfCnpj)

    if (result.isSuccess) {
      return { available: result.value }
    }

    if (result.isFailure) {
      this.logger.error(`Error checking CPF/CNPJ availability ${cpfCnpj}:`, result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Check if email is available
   * @param email - Email to check
   * @returns Promise resolving to availability status
   */
  @Get('check/email/:email')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check email availability',
    description: 'Check if an email is available for registration',
  })
  @ApiParam({
    name: 'email',
    description: 'Email to check',
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Email availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the email is available',
        },
      },
    },
  })
  async checkEmailAvailability(@Param('email') email: string): Promise<{ available: boolean }> {
    const result = await this.checkEmailAvailabilityUseCase.execute(email)

    if (result.isSuccess) {
      return { available: result.value }
    }

    if (result.isFailure) {
      this.logger.error(`Error checking email availability ${email}:`, result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Get client by ID
   * @param id - Client's unique identifier
   * @returns Promise resolving to the client response
   */
  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get client by ID',
    description: 'Retrieve a specific client by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Client unique identifier',
    example: 'clh1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async getClientById(@Param('id') id: string): Promise<ClientResponseDto> {
    const result = await this.getClientByIdUseCase.execute(id)

    if (result.isSuccess) {
      return result.value
    }

    if (result.isFailure) {
      this.logger.error(`Error getting client by id ${id}:`, result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Update client
   * @param id - Client's unique identifier
   * @param updateClientDto - Client data to update
   * @returns Promise resolving to the client response
   */
  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update client',
    description: 'Update an existing client with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Client unique identifier',
    example: 'clh1234567890abcdef',
  })
  @ApiBody({
    type: UpdateClientDto,
    description: 'Client data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid client data',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientHttpResponse> {
    const result = await this.updateClientUseCase.execute(id, updateClientDto)

    if (result.isSuccess) {
      return this.clientPresenter.present(result.value)
    }

    if (result.isFailure) {
      this.logger.error(`Error updating client ${id}:`, result.error)
      throw result.error
    }

    throw new Error('Unexpected result state')
  }

  /**
   * Delete client
   * @param id - Client's unique identifier
   * @returns Promise resolving to void
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete client',
    description: 'Delete an existing client',
  })
  @ApiParam({
    name: 'id',
    description: 'Client unique identifier',
    example: 'clh1234567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'Client deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async deleteClient(@Param('id') id: string): Promise<void> {
    const result = await this.deleteClientUseCase.execute(id)

    if (result.isFailure) {
      this.logger.error(`Error deleting client ${id}:`, result.error)
      throw result.error
    }
  }
}
