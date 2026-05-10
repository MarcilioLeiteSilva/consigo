import { IsNotEmpty, IsInt, IsOptional, IsUUID, Min, Max, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsignmentLotDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'uuid-do-pos', required: false })
  @IsOptional()
  @IsUUID()
  posId?: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantityReceived: number;

  @ApiProperty({ example: '20.0' })
  @IsNotEmpty()
  @IsString()
  commissionPercent: string;

  @ApiProperty({ example: '50.0' })
  @IsNotEmpty()
  @IsString()
  unitPrice: string;

  @ApiProperty({ example: 'Maio/2026', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'Lote de verão 2026', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
