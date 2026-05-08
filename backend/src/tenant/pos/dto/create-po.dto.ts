import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePoDto {
  @ApiProperty({ example: 'Loja Centro' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Rua Principal, 123', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
