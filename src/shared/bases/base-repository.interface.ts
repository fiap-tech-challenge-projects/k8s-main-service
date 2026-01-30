import { PaginatedResult } from './pagination-result.interface'

/**
 * Base repository interface for all domain repositories
 * Provides common CRUD operations that can be extended by specific repositories
 *
 * This interface should be in domain/utils because:
 * 1. It's a generic contract that all repositories must follow
 * 2. It ensures consistency across all repository implementations
 * 3. It provides a common API for data access operations
 */
export interface IBaseRepository<T> {
  /**
   * Find an entity by its unique identifier
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: string): Promise<T | null>

  /**
   * Find all entities with optional pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findAll(page?: number, limit?: number): Promise<PaginatedResult<T>>

  /**
   * Create a new entity
   * @param data - The entity data to create
   * @returns Promise resolving to the created entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>

  /**
   * Update an existing entity
   * @param id - The unique identifier of the entity to update
   * @param data - The partial data to update
   * @returns Promise resolving to the updated entity
   */
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T>

  /**
   * Delete an entity by its unique identifier
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>

  /**
   * Check if an entity exists by its unique identifier
   * @param id - The unique identifier to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  exists(id: string): Promise<boolean>
}
