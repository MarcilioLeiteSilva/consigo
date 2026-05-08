import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantUserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nome do Usuário' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: TenantUserRole, default: TenantUserRole.OPERADOR })
  @IsEnum(TenantUserRole)
  @IsOptional()
  role?: TenantUserRole;
}
