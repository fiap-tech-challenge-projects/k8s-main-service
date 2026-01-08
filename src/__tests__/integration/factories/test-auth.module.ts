import { Module } from '@nestjs/common'

import { SharedModule } from '@shared/shared.module'

import { TestAuthGuard } from './test-auth.guard'

/**
 * Test-specific authentication module for integration tests.
 *
 * This module simulates the API Gateway authentication flow by providing
 * a test guard that reads user information from headers.
 *
 * In production, the API Gateway + Lambda Authorizer sets these headers:
 * - x-user-id
 * - x-user-email
 * - x-user-role
 * - x-client-id (optional)
 * - x-employee-id (optional)
 *
 * For tests, set these headers directly in your test requests.
 */
@Module({
  imports: [SharedModule],
  providers: [TestAuthGuard],
  exports: [TestAuthGuard],
})
export class TestAuthModule {}
