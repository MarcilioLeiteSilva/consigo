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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { PlatformRole } from '@prisma/client';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';

@ApiTags('platform-tenants')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
@Controller('platform/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @PlatformRoles(PlatformRole.SUPER_ADMIN, PlatformRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo tenant' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @PlatformRoles(PlatformRole.SUPER_ADMIN, PlatformRole.ADMIN, PlatformRole.SUPPORT)
  @ApiOperation({ summary: 'Listar todos os tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @PlatformRoles(PlatformRole.SUPER_ADMIN, PlatformRole.ADMIN, PlatformRole.SUPPORT)
  @ApiOperation({ summary: 'Buscar um tenant por ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @PlatformRoles(PlatformRole.SUPER_ADMIN, PlatformRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar um tenant' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @PlatformRoles(PlatformRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remover um tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
