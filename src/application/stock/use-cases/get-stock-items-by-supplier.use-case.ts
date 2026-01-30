import { Injectable, Logger, Inject } from '@nestjs/common'

import { PaginatedStockItemDto } from '@application/stock/dto'
import { StockItemMapper } from '@application/stock/mappers'
import { IStockRepository, STOCK_REPOSITORY } from '@domain/stock/interfaces'
import { Result, SUCCESS, FAILURE } from '@shared/types'

/**
 * Use case for getting stock items by supplier
 * Handles the orchestration for stock item search by supplier business process
 */
@Injectable()
export class GetStockItemsBySupplierUseCase {
  private readonly logger = new Logger(GetStockItemsBySupplierUseCase.name)

  /**
   * Constructor for GetStockItemsBySupplierUseCase
   * @param stockRepository - Stock repository for data operations
   */
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: IStockRepository,
  ) {}

  /**
   * Execute get stock items by supplier
   * @param supplier - Stock item supplier
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @returns Result with paginated stock items response DTO or error
   */
  async execute(
    supplier: string,
    page?: number,
    limit?: number,
  ): Promise<Result<PaginatedStockItemDto, Error>> {
    this.logger.log('Executing get stock items by supplier use case', {
      supplier,
      page,
      limit,
      context: 'GetStockItemsBySupplierUseCase.execute',
    })

    try {
      const paginatedResult = await this.stockRepository.findBySupplier(supplier, page, limit)

      const stockItems = paginatedResult.data.map((stockItem) =>
        StockItemMapper.toResponseDto(stockItem),
      )

      const responseDto: PaginatedStockItemDto = {
        data: stockItems,
        meta: paginatedResult.meta,
      }

      this.logger.log('Get stock items by supplier use case completed successfully', {
        supplier,
        totalItems: responseDto.meta.total,
        pageSize: responseDto.data.length,
        currentPage: responseDto.meta.page,
        context: 'GetStockItemsBySupplierUseCase.execute',
      })

      return SUCCESS(responseDto)
    } catch (error) {
      this.logger.error('Get stock items by supplier use case failed', {
        supplier,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: 'GetStockItemsBySupplierUseCase.execute',
      })
      return FAILURE(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
