import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { IS_PUBLIC_KEY } from '../decorators'

/**
 * User information extracted from API Gateway headers
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  clientId: string | null
  employeeId: string | null
}

/**
 * Extended Request interface with user property
 */
interface RequestWithUser extends Request {
  user?: AuthenticatedUser
}

/**
 * JWT Authentication Guard
 *
 * This guard extracts user information from headers set by the API Gateway
 * after the Lambda Authorizer validates the JWT token.
 *
 * Note: JWT validation is now handled by AWS Lambda Authorizer at the API Gateway level.
 * This guard only reads the user information from headers passed by the API Gateway.
 *
 * Expected headers from API Gateway:
 * - x-user-id: User's unique identifier
 * - x-user-email: User's email address
 * - x-user-role: User's role (ADMIN, ATTENDANT, MECHANIC, CLIENT)
 * - x-client-id: Associated client ID (optional)
 * - x-employee-id: Associated employee ID (optional)
 */
@Injectable()
export class JwtAuthGuard {
  /**
   * Creates an instance of JwtAuthGuard.
   * @param reflector - Reflector service for accessing metadata
   */
  constructor(private reflector: Reflector) {}

  /**
   * Check if the request is authorized
   * @param context - Execution context
   * @returns True if authorized, throws UnauthorizedException otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>()

    // Extract user from API Gateway headers
    const userId = request.headers['x-user-id'] as string
    const userEmail = request.headers['x-user-email'] as string
    const userRole = request.headers['x-user-role'] as string
    const clientId = (request.headers['x-client-id'] as string) ?? null
    const employeeId = (request.headers['x-employee-id'] as string) ?? null

    // Validate required headers
    if (!userId || !userEmail || !userRole) {
      throw new UnauthorizedException(
        'Missing authentication headers. Request must pass through API Gateway.',
      )
    }

    // Attach user to request
    const user: AuthenticatedUser = {
      id: userId,
      email: userEmail,
      role: userRole,
      clientId,
      employeeId,
    }

    request.user = user

    return true
  }
}
