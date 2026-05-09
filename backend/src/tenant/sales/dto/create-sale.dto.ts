import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateSaleItemDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '45.90' })
  @IsNotEmpty()
  @IsString()
  unitPrice: string;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid-do-pdv' })
  @IsNotEmpty()
  @IsUUID()
  posId: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
