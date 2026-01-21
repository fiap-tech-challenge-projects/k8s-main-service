import { Module } from '@nestjs/common'

import { RestModule } from '@interfaces/rest/rest.module'

/**
 * Interfaces module that aggregates all interface-specific modules.
 *
 * This module serves as the central interface layer, importing and exporting
 * all interface modules including REST APIs. It provides a unified
 * entry point for all external communication protocols.
 *
 * Interface modules include:
 * - RestModule: REST API endpoints and controllers
 *
 * @example
 * // In app.module.ts
 * imports: [InterfacesModule]
 *
 * // In other modules
 * imports: [InterfacesModule]
 */
@Module({
  imports: [RestModule],
  controllers: [],
  providers: [],
  exports: [RestModule],
})
export class InterfacesModule {}
