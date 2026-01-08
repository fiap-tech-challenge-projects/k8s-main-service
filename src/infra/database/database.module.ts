import { Module } from '@nestjs/common'

import { PrismaModule } from '@infra/database/prisma/prisma.module'

/**
 * Database module that provides database-related services.
 *
 * This module serves as the central database layer, importing and exporting
 * all database modules including Prisma ORM services and repositories.
 *
 * Database modules include:
 * - PrismaModule: Prisma ORM services and database connections
 *
 * @example
 * // In other modules
 * imports: [DatabaseModule]
 */
@Module({
  imports: [PrismaModule],
  exports: [PrismaModule],
})
export class DatabaseModule {}
