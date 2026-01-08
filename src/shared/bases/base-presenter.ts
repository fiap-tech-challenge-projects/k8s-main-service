/**
 * Base presenter interface for formatting responses
 * Separates business data formatting from HTTP transport concerns
 */
export abstract class BasePresenter<TInput, TOutput> {
  /**
   * Formats business data for presentation without transport details
   * @param data - Raw business data from application layer
   * @returns Formatted data ready for transport layer
   */
  abstract present(data: TInput): TOutput

  /**
   * Formats paginated business data for presentation
   * @param data - Paginated data from application layer
   * @param data.data - Array of business data items to format
   * @param data.meta - Pagination metadata to preserve
   * @returns Formatted paginated response
   */
  presentPaginated<TMeta>(data: { data: TInput[]; meta: TMeta }): { data: TOutput[]; meta: TMeta } {
    return {
      data: data.data.map((item) => this.present(item)),
      meta: data.meta,
    }
  }

  /**
   * Formats error data for presentation
   * @param error - Error from application layer
   * @returns Formatted error response
   */
  presentError(error: Error): { message: string; timestamp: string } {
    return {
      message: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}
