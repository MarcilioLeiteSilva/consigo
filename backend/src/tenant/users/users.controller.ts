import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantUserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  create(@CurrentUser() user: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(user.tenantId, createUserDto);
  }

  @Get()
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Listar usuários do tenant' })
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(TenantUserRole.TENANT_ADMIN, TenantUserRole.GERENTE)
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.tenantId, id, updateUserDto);
  }

  @Delete(':id')
  @Roles(TenantUserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Remover usuário' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user.tenantId, id);
  }
}
