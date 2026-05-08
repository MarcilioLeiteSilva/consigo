import { IsNotEmpty, IsInt, IsOptional, IsUUID, Min, Max, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsignmentLotDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantityReceived: number;

  @ApiProperty({ example: 20.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent: number;

  @ApiProperty({ example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 'Lote de verão 2026', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
