import { Injectable, NestMiddleware } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

import { UserContextService, UserContext } from '@shared/services/user-context.service'

/**
 * Test-specific middleware to extract user information from JWT token and set it in the user context.
 * This middleware works with the test authentication system.
 */
@Injectable()
export class TestUserContextMiddleware implements NestMiddleware {
  /**
   * Creates a new instance of TestUserContextMiddleware.
   * @param userContextService - Service for managing user context
   */
  constructor(private readonly userContextService: UserContextService) {}

  /**
   * Extracts user information from JWT token and sets it in the user context service.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Extract user information from JWT token (set by JWT strategy)
      const user = req.user as
        | {
            sub?: string
            id?: string
            email?: string
            role?: UserRole
            clientId?: string
            employeeId?: string
          }
        | undefined

      if (user?.role) {
        const userContext: UserContext = {
          userId: user.sub ?? user.id ?? '',
          email: user.email ?? '',
          role: user.role,
          clientId: user.clientId,
          employeeId: user.employeeId,
        }

        this.userContextService.setUserContext(userContext)
      } else {
        // Try to extract from Authorization header if user is not set
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7)
          try {
            const decoded = jwt.decode(token) as any
            if (decoded && decoded.sub && decoded.email && decoded.role) {
              const userContext: UserContext = {
                userId: decoded.sub,
                email: decoded.email,
                role: decoded.role as UserRole,
                clientId: decoded.clientId,
                employeeId: decoded.employeeId,
              }
              this.userContextService.setUserContext(userContext)
            }
          } catch (error) {
            console.error('Error decoding JWT token in test middleware:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error extracting user context from JWT token:', error)

      this.userContextService.clearUserContext()
    }

    next()
  }
}
