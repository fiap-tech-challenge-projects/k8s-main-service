import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Custom error class for retryable operations.
 *
 * Extends the base Error class to provide additional context about
 * retryable errors, including the original cause of the error.
 *
 * @example
 * throw new RetryableError('Network timeout', originalError);
 */
export class RetryableError extends Error {
  /**
   * Creates a new RetryableError instance.
   *
   * @param message - Human-readable error message
   * @param cause - Original error that caused this retryable error
   */
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = 'RetryableError'
  }
}

/**
 * Service for handling retryable operations with exponential backoff.
 *
 * Provides a robust retry mechanism for operations that may fail due to
 * transient issues like network timeouts, connection resets, or temporary
 * service unavailability. Implements exponential backoff strategy to avoid
 * overwhelming the target service.
 *
 * Features:
 * - Configurable retry attempts and delays
 * - Exponential backoff with maximum delay cap
 * - Intelligent retryable error detection
 * - Comprehensive logging of retry attempts
 * - Configurable via environment variables
 *
 * @example
 * // Basic usage
 * const result = await retryService.withRetry(async () => {
 *   return await externalApiCall();
 * });
 *
 * // With custom retryable error
 * try {
 *   await retryService.withRetry(async () => {
 *     return await databaseOperation();
 *   });
 * } catch (error) {
 *   if (error instanceof RetryableError) {
 *     // Handle retryable error
 *   }
 * }
 */
@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name)

  private readonly initialDelay: number
  private readonly maxDelay: number
  private readonly maxAttempts: number

  /**
   * Creates a new RetryService instance.
   *
   * Initializes retry configuration from environment variables with
   * sensible defaults. Validates configuration values and ensures
   * maxDelay is greater than or equal to initialDelay.
   *
   * @param configService - NestJS configuration service for environment variables
   
   * @throws Error if maxDelay is less than initialDelay
   *
   * @example
   * constructor(private readonly configService: ConfigService) {}
   */
  constructor(private readonly configService: ConfigService) {
    this.initialDelay = this.validateConfig('retry.backoff.initialDelay', 1000)
    this.maxDelay = this.validateConfig('retry.backoff.maxDelay', 30000)
    this.maxAttempts = this.validateConfig('retry.backoff.maxAttempts', 3)

    if (this.maxDelay < this.initialDelay) {
      throw new Error('maxDelay must be greater than or equal to initialDelay')
    }
  }

  /**
   * Validates and retrieves configuration values with fallback defaults.
   *
   * Ensures configuration values are valid numbers greater than zero.
   * Logs warnings for invalid configurations and falls back to defaults.
   *
   * @param key - Configuration key to retrieve
   * @param defaultValue - Default value to use if configuration is invalid
   * @returns Validated configuration value or default
   *
   * @example
   * const delay = this.validateConfig('retry.delay', 1000);
   * // Returns 1000 if configuration is invalid or missing
   */
  private validateConfig(key: string, defaultValue: number): number {
    const value = this.configService.get<number>(key, defaultValue)
    if (typeof value !== 'number' || value <= 0) {
      this.logger.warn(`Invalid configuration value for ${key}. Using default: ${defaultValue}`)
      return defaultValue
    }
    return value
  }

  /**
   * Determines if an error is retryable based on error type and message.
   *
   * Checks if the error is a RetryableError instance or contains
   * retryable error messages like network timeouts, connection resets, etc.
   *
   * @param error - Error to check for retryability
   * @returns true if the error is retryable, false otherwise
   *
   * @example
   * const isRetryable = this.isRetryableError(new Error('ECONNRESET'));
   * // Returns true for network-related errors
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof RetryableError) {
      return true
    }

    if (error instanceof Error) {
      const retryableMessages = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'timeout',
        'network',
        'unavailable',
        'temporary',
        'connection',
        'reset',
      ]

      return retryableMessages.some((message) =>
        error.message.toLowerCase().includes(message.toLowerCase()),
      )
    }

    return false
  }

  /**
   * Calculates delay duration for the current retry attempt.
   *
   * Implements exponential backoff: delay = initialDelay * 2^(attempt-1).
   * Caps the delay at maxDelay to prevent excessive wait times.
   *
   * @param attempt - Current retry attempt number (1-based)
   * @returns Delay duration in milliseconds
   *
   * @example
   * const delay = this.calculateDelay(2);
   * // Returns 2000ms for attempt 2 (1000 * 2^1)
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.initialDelay * Math.pow(2, attempt - 1)
    return Math.min(exponentialDelay, this.maxDelay)
  }

  /**
   * Creates a promise that resolves after the specified delay.
   *
   * @param ms - Delay duration in milliseconds
   * @returns Promise that resolves after the delay
   *
   * @example
   * await this.delay(1000);
   * // Waits for 1 second
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Executes an operation with retry logic and exponential backoff.
   *
   * Attempts to execute the provided operation up to maxAttempts times.
   * If the operation fails with a retryable error, it waits for an
   * exponentially increasing delay before retrying.
   *
   * @param operation - Async function to execute with retry logic
   * @returns Promise resolving to the operation result
   * @throws RetryableError if operation fails after all attempts
   *
   * @example
   * const result = await this.withRetry(async () => {
   *   const response = await fetch('https://api.example.com/data');
   *   if (!response.ok) {
   *     throw new Error('API request failed');
   *   }
   *   return response.json();
   * });
   */
  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 1
    let lastError: Error | null = null

    while (attempt <= this.maxAttempts) {
      try {
        return await operation()
      } catch (error) {
        const isRetryable = this.isRetryableError(error)
        lastError = error instanceof Error ? error : new Error(String(error))

        // ENFORCED LOGGING
        this.logger.error('Error caught in withRetry', {
          error: lastError.message,
          stack: lastError.stack,
          attempt,
          maxAttempts: this.maxAttempts,
          isRetryable,
        })

        if (!isRetryable || attempt === this.maxAttempts) {
          this.logger.error(`Operation failed after ${attempt} attempts: ${lastError.message}`, {
            error: lastError.stack,
            attempt,
            maxAttempts: this.maxAttempts,
            isRetryable,
          })
          throw new RetryableError(
            `Operation failed after ${attempt} attempts: ${lastError.message}`,
            lastError,
          )
        }

        const delayMs = this.calculateDelay(attempt)
        this.logger.warn(
          `Attempt ${attempt} failed. Retrying in ${delayMs}ms: ${lastError.message}`,
          {
            error: lastError.message,
            attempt,
            delayMs,
            nextAttempt: attempt + 1,
          },
        )

        await this.delay(delayMs)
        attempt++
      }
    }

    // This should never happen due to the while loop condition
    throw new Error('Unexpected retry failure')
  }
}
