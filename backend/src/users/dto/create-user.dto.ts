import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

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

  @ApiProperty({ enum: Role, default: Role.OPERADOR })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
