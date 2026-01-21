import { EmployeeResponseDto, PaginatedEmployeesResponseDto } from '@application/employees/dto'
import { BasePresenter } from '@shared/bases'

/**
 * HTTP response format for Employee data
 */
export interface EmployeeHttpResponse {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  specialty?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * HTTP response format for paginated Employees
 */
export interface PaginatedEmployeesHttpResponse {
  data: EmployeeHttpResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Presenter for Employee data formatting
 * Separates business data structure from HTTP response format
 */
export class EmployeePresenter extends BasePresenter<EmployeeResponseDto, EmployeeHttpResponse> {
  /**
   * Formats Employee business data for HTTP response
   * @param employee - Employee data from application layer
   * @returns Formatted Employee for HTTP transport
   */
  present(employee: EmployeeResponseDto): EmployeeHttpResponse {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      phone: employee.phone,
      specialty: employee.specialty,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    }
  }

  /**
   * Formats paginated Employees data for HTTP response
   * @param data - Paginated Employees from application layer
   * @returns Formatted paginated response for HTTP transport
   */
  presentPaginatedEmployees(data: PaginatedEmployeesResponseDto): PaginatedEmployeesHttpResponse {
    return this.presentPaginated(data)
  }
}
