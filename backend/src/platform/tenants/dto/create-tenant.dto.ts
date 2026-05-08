import { IsNotEmpty, IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({ example: 'Consigo Empresa' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'empresa@consigo.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'consigo-empresa' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
