import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Minha Empresa' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'minha-empresa' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
