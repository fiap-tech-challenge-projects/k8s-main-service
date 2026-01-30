import { IBaseRepository, PaginatedResult } from '@shared'

import { Employee } from '../entities'

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY')

export interface IEmployeeRepository extends IBaseRepository<Employee> {
  findByEmail(email: string): Promise<Employee | null>
  emailExists(email: string): Promise<boolean>
  findByName(name: string, page?: number, limit?: number): Promise<PaginatedResult<Employee>>
  findByRole(role: string, page?: number, limit?: number): Promise<PaginatedResult<Employee>>
  findActive(page?: number, limit?: number): Promise<PaginatedResult<Employee>>
  findInactive(page?: number, limit?: number): Promise<PaginatedResult<Employee>>
}
