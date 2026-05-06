import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Vestuário' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
