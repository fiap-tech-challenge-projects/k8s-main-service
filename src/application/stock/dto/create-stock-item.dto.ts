import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

import { IsValidPrice } from '@shared/validators'

/**
 * DTO for registering a new stock item
 * This DTO is used to validate the data when registering a new stock item.
 */
export class CreateStockItemDto {
  @ApiProperty({
    description: 'Nome do item em estoque',
    example: 'Filtro de Óleo',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit) do item em estoque',
    example: 'FLT-001',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  sku: string

  @ApiProperty({
    description: 'Quantidade atual em estoque',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  currentStock: number

  @ApiProperty({
    description: 'Nível mínimo de estoque antes da reposição',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  minStockLevel: number

  @ApiProperty({
    description:
      'Custo unitário do item (aceita múltiplos formatos: R$100.00, 10000, 100.00, 100,00, R$100,00)',
    example: '25.50',
  })
  @IsNotEmpty()
  @IsValidPrice()
  unitCost: string

  @ApiProperty({
    description:
      'Preço unitário de venda do item (aceita múltiplos formatos: R$100.00, 10000, 100.00, 100,00, R$100,00)',
    example: '50.00',
  })
  @IsNotEmpty()
  @IsValidPrice()
  unitSalePrice: string

  @ApiPropertyOptional({
    description: 'Descrição do item',
    example: 'Filtro de óleo automotivo de alta qualidade',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({
    description: 'Fornecedor do item',
    example: 'Bosch',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplier?: string
}
