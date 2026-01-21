import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

/**
 * DTO para resposta de um item em estoque.
 * Define a estrutura e as validações para os dados retornados.
 */
export class StockItemResponseDto {
  @ApiProperty({
    description: 'Identificador único do item em estoque',
    example: 'stock-item-123',
  })
  @IsString()
  @IsNotEmpty()
  id: string

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
  @IsNumber()
  currentStock: number

  @ApiProperty({
    description: 'Nível mínimo de estoque antes da reposição',
    example: 5,
  })
  @IsNumber()
  minStockLevel: number

  @ApiProperty({
    description: 'Custo unitário do item formatado',
    example: 'R$ 25,50',
  })
  @IsString()
  unitCost: string

  @ApiProperty({
    description: 'Preço unitário de venda do item formatado',
    example: 'R$ 50,00',
  })
  @IsString()
  unitSalePrice: string

  @ApiPropertyOptional({
    description: 'Descrição do item',
    example: 'Filtro de óleo automotivo de alta qualidade',
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({
    description: 'Fornecedor do item',
    example: 'Bosch',
  })
  @IsString()
  @IsOptional()
  supplier?: string

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-01-01T10:00:00.000Z',
  })
  @IsDate()
  createdAt: Date

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date
}
