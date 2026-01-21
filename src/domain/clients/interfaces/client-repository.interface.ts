import { Client } from '@domain/clients/entities'
import { IBaseRepository, PaginatedResult } from '@shared'

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY')

/**
 * Repository interface for Client domain operations
 * Extends base repository with client-specific query methods
 */
export interface IClientRepository extends IBaseRepository<Client> {
  /**
   * Find client by CPF or CNPJ
   * @param cpfCnpj - The CPF or CNPJ to search for
   * @returns Promise resolving to the client or null if not found
   */
  findByCpfCnpj(cpfCnpj: string): Promise<Client | null>

  /**
   * Find client by email
   * @param email - The email to search for
   * @returns Promise resolving to the client or null if not found
   */
  findByEmail(email: string): Promise<Client | null>

  /**
   * Check if a CPF or CNPJ is already registered
   * @param cpfCnpj - The CPF or CNPJ to check
   * @returns Promise resolving to true if CPF/CNPJ exists, false otherwise
   */
  cpfCnpjExists(cpfCnpj: string): Promise<boolean>

  /**
   * Check if an email is already registered
   * @param email - The email to check
   * @returns Promise resolving to true if email exists, false otherwise
   */
  emailExists(email: string): Promise<boolean>

  /**
   * Find clients by name (partial match)
   * @param name - The name to search for
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated result
   */
  findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<Client>>
}
