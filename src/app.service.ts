import { Injectable } from '@nestjs/common'

/**
 * Application service
 * Provides core application business logic
 */
@Injectable()
export class AppService {
  /**
   * Get hello message
   * @returns Hello message string
   */
  getHello(): string {
    return 'Hello World!'
  }
}
