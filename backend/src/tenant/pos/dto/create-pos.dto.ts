import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePosDto {
  @ApiProperty({ example: 'Loja Centro' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'João da Silva', required: false })
  @IsOptional()
  @IsString()
  responsibleName?: string;

  @ApiProperty({ example: '12.345.678/0001-90', required: false })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ example: '11999998888', required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ example: 'contato@loja.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '25.0', required: false })
  @IsOptional()
  @IsString()
  defaultCommission?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '2026-05-11', required: false })
  @IsOptional()
  @IsString()
  openingDate?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  billingDay?: number;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: 'Rua Principal', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ example: '12345-678', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'Sala 01', required: false })
  @IsOptional()
  @IsString()
  complement?: string;
}
