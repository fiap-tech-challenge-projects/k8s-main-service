import { Injectable, NestMiddleware } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'

import { UserContextService, UserContext } from '@shared/services/user-context.service'

/**
 * User information from API Gateway headers
 */
interface ApiGatewayUser {
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
  user?: ApiGatewayUser
}

/**
 * Middleware to extract user information from API Gateway headers and set it in the user context.
 *
 * This middleware reads user information from headers set by the API Gateway
 * after the Lambda Authorizer validates the JWT token.
 *
 * Expected headers:
 * - x-user-id: User's unique identifier
 * - x-user-email: User's email address
 * - x-user-role: User's role (ADMIN, ATTENDANT, MECHANIC, CLIENT)
 * - x-client-id: Associated client ID (optional)
 * - x-employee-id: Associated employee ID (optional)
 */
@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  /**
   * Creates a new instance of UserContextMiddleware.
   * @param userContextService - Service for managing user context
   */
  constructor(private readonly userContextService: UserContextService) {}

  /**
   * Extracts user information from API Gateway headers and sets it in the user context service.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    try {
      // Extract user information from API Gateway headers
      const userId = req.headers['x-user-id'] as string
      const userEmail = req.headers['x-user-email'] as string
      const userRole = req.headers['x-user-role'] as string
      const clientId = (req.headers['x-client-id'] as string) ?? undefined
      const employeeId = (req.headers['x-employee-id'] as string) ?? undefined

      if (userId && userEmail && userRole) {
        const userContext: UserContext = {
          userId,
          email: userEmail,
          role: userRole as UserRole,
          clientId,
          employeeId,
        }

        this.userContextService.setUserContext(userContext)

        // Also set req.user for compatibility with existing code
        req.user = {
          id: userId,
          email: userEmail,
          role: userRole,
          clientId: clientId ?? null,
          employeeId: employeeId ?? null,
        }
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error extracting user context from API Gateway headers:', error)

      // Clear any existing user context to ensure clean state
      this.userContextService.clearUserContext()
    }

    next()
  }
}
