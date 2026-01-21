import { Logger } from '@nestjs/common'

import { IBaseRepository, PaginatedResult } from '../bases'

/**
 * Base service class that provides common CRUD operations for domain entities
 * @template T - The domain entity type
 */
export abstract class BaseService<T> {
  protected readonly logger: Logger

  /**
   * Creates a new instance of the base service
   * @param repository - The repository instance for the domain entity
   * @param loggerName - The name to use for logging
   */
  constructor(
    protected readonly repository: IBaseRepository<T>,
    loggerName: string,
  ) {
    this.logger = new Logger(loggerName)
  }

  /**
   * Gets an entity by its ID
   * @param id - The unique identifier of the entity
   * @returns A promise that resolves to the entity or null if not found
   */
  protected async getEntityById(id: string): Promise<T | null> {
    try {
      return await this.repository.findById(id)
    } catch (error) {
      this.logger.error(`Error getting entity by ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Gets all entities with optional pagination
   * @param page - The page number (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to an array of entities
   */
  protected async getAllEntities(page?: number, limit?: number): Promise<T[]> {
    try {
      const result = await this.repository.findAll(page, limit)
      return result.data
    } catch (error) {
      this.logger.error('Error getting all entities:', error)
      throw error
    }
  }

  /**
   * Creates a new entity
   * @param data - The entity data to create
   * @returns A promise that resolves to the created entity
   */
  protected async createEntity(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      return await this.repository.create(data)
    } catch (error) {
      this.logger.error('Error creating entity:', error)
      throw error
    }
  }

  /**
   * Updates an existing entity
   * @param id - The unique identifier of the entity to update
   * @param data - The partial entity data to update
   * @returns A promise that resolves to the updated entity
   */
  protected async updateEntity(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      return await this.repository.update(id, data)
    } catch (error) {
      this.logger.error(`Error updating entity ${id}:`, error)
      throw error
    }
  }

  /**
   * Deletes an entity by its ID
   * @param id - The unique identifier of the entity to delete
   * @returns A promise that resolves to true if deleted, false if not found
   */
  protected async deleteEntity(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id)
    } catch (error) {
      this.logger.error(`Error deleting entity ${id}:`, error)
      throw error
    }
  }

  /**
   * Gets a paginated result of entities
   * @param page - The page number (1-based)
   * @param limit - The number of items per page
   * @returns A promise that resolves to a paginated result containing entities
   */
  protected async getPaginatedResult(page?: number, limit?: number): Promise<PaginatedResult<T>> {
    try {
      return await this.repository.findAll(page, limit)
    } catch (error) {
      this.logger.error('Error getting paginated result:', error)
      throw error
    }
  }
}
