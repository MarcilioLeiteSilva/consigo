import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class RegisterLossDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 'Produto danificado no transporte' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
