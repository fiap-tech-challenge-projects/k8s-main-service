import { Module } from '@nestjs/common'

import { CONFIG_MODULE } from '@config/index'
import { DatabaseModule } from '@infra/database/database.module'
import { EmailModule } from '@infra/email/email.module'

/**
 * Infrastructure module that provides all infrastructure concerns.
 *
 * This module serves as the central infrastructure layer, configuring
 * and providing all infrastructure services including database connections,
 * configuration management, rate limiting, and email services.
 *
 * Infrastructure services include:
 * - ConfigModule: Environment configuration management
 * - ThrottlerModule: Rate limiting and throttling
 * - DatabaseModule: Database connections and repositories
 * - EmailModule: Email notification services
 *
 * @example
 * // In app.module.ts
 * imports: [InfraModule]
 *
 * // In other modules
 * imports: [InfraModule]
 */
@Module({
  imports: [CONFIG_MODULE, DatabaseModule, EmailModule],
  exports: [DatabaseModule, EmailModule],
})
export class InfraModule {}
