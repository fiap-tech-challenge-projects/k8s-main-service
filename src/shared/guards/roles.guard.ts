import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'

import { ROLES_KEY } from '../decorators'

/**
 * Roles Guard for role-based access control
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Constructor for RolesGuard
   * @param reflector - Reflector service for metadata access
   */
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has the required roles
   * @param context - Execution context
   * @returns True if user has required roles
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest() as { user: { role: string } }

    if (!user) {
      throw new ForbiddenException('User not found in request')
    }

    const hasRole = requiredRoles.some((role) => user.role === role)

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }
}
