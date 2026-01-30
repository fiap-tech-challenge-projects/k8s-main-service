import { Injectable, Scope } from '@nestjs/common'
import { UserRole } from '@prisma/client'

/**
 * User context information extracted from JWT token
 */
export interface UserContext {
  userId: string
  email: string
  role: UserRole
  clientId?: string
  employeeId?: string
}

/**
 * Service to store and retrieve the current user context.
 * Uses REQUEST scope to ensure each request has its own context.
 */
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  private userContext: UserContext | null = null

  /**
   * Sets the user context for the current request
   * @param context - The user context to set
   */
  setUserContext(context: UserContext): void {
    this.userContext = context
  }

  /**
   * Gets the current user context
   * @returns The current user context or null if not set
   */
  getUserContext(): UserContext | null {
    return this.userContext
  }

  /**
   * Gets the current user ID
   * @returns The current user ID or null if not set
   */
  getUserId(): string | null {
    return this.userContext?.userId ?? null
  }

  /**
   * Gets the current user role
   * @returns The current user role or null if not set
   */
  getUserRole(): UserRole | null {
    return this.userContext?.role ?? null
  }

  /**
   * Gets the current user email
   * @returns The current user email or null if not set
   */
  getUserEmail(): string | null {
    return this.userContext?.email ?? null
  }

  /**
   * Gets the current user's client ID (if applicable)
   * @returns The current user's client ID or null if not set
   */
  getClientId(): string | null {
    return this.userContext?.clientId ?? null
  }

  /**
   * Gets the current user's employee ID (if applicable)
   * @returns The current user's employee ID or null if not set
   */
  getEmployeeId(): string | null {
    return this.userContext?.employeeId ?? null
  }

  /**
   * Checks if the current user has a specific role
   * @param role - The role to check
   * @returns True if the user has the specified role, false otherwise
   */
  hasRole(role: UserRole): boolean {
    return this.userContext?.role === role
  }

  /**
   * Checks if the current user has any of the specified roles
   * @param roles - The roles to check
   * @returns True if the user has any of the specified roles, false otherwise
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.userContext?.role as UserRole)
  }

  /**
   * Clears the current user context
   */
  clearUserContext(): void {
    this.userContext = null
  }
}
