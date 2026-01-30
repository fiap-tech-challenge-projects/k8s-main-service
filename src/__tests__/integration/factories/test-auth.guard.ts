import { Injectable, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { IS_PUBLIC_KEY } from '@shared/decorators'

/**
 * Test-specific authentication guard for integration tests.
 * This guard extends the main JWT auth guard but allows for test-specific behavior.
 */
@Injectable()
export class TestAuthGuard extends AuthGuard('jwt') {
  /**
   * Creates a new instance of TestAuthGuard.
   * @param reflector - Reflector service for metadata access
   */
  constructor(private reflector: Reflector) {
    super()
  }

  /**
   * Determines if the request can proceed.
   * Checks if the route is public and handles authentication accordingly.
   * @param context - Execution context containing request information
   * @returns True if the request can proceed
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}
