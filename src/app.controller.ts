import { Controller, Get } from '@nestjs/common'

import { AppService } from './app.service'

/**
 * Application controller
 * Provides main application endpoints
 */
@Controller()
export class AppController {
  /**
   * Creates an instance of AppController
   * @param appService - The application service
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Get hello message
   * @returns Hello message from service
   */
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
