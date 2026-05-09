import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta Polo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Camiseta polo algodão piquet', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-da-categoria', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'SKU001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 49.90 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ example: 5.0, required: false })
  @IsOptional()
  @IsNumber()
  commission?: number;

  @ApiProperty({ example: 'un', default: 'un' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
