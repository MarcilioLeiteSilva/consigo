import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class RegisterReturnDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
